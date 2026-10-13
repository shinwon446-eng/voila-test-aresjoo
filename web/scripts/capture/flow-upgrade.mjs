// 업그레이드 흐름(flow/MELT_SPEC.md U1~U9)을 처음부터 끝까지 눌러 가며 찍는다(검수용 스크린샷). 화면 판정은 사람이나 Codex 가 한다.
//   node scripts/capture/flow-upgrade.mjs <출력 폴더> [mobile|desktop|둘 다 쉼표로] [박스 slug]
// 떠 있는 개발 서버(3002)를 쓴다. 상태는 states.mjs 로 심는다(시험 계정과 시험 잔액, 실제 돈 없음).
// 결과를 꾸며 내지 않는다: 추첨에 쓰는 값(잠근 값, 내 기기 값, 회차)을 심어 두고, 그 값에서 실제로 나오는 번호로 성공과 실패 장면을 찍는다.
//   번호는 앱과 같은 식으로 여기서 미리 계산한다(HMAC-SHA256 의 앞 8자를 1,000,000 으로 나눈 나머지).
//   2배 단추의 확률은 39.13% 에서 51.75% 사이다. 번호 150,000~300,000 은 그 단추에서 언제나 성공, 600,000~800,000 은 언제나 실패다.
//   번호 22,500 미만은 어느 단추에서든 성공이다(확률의 최솟값이 2.25%).
// 확인 필요와 실행하지 못한 상태는 개발 서버에서만 켜지는 시험 스위치(sessionStorage "voila.opening.fault")로 만든다.
// 탭 사이의 잠금이 없는 브라우저는 페이지가 뜨기 전에 navigator.locks 를 지워 만든다.
// 확인창(components/ui/Sheet 의 Confirm)은 뜬 뒤 350ms 동안 누름을 받지 않는다. 확인 단추는 600ms 기다린 뒤 누른다.
import { chromium } from "playwright";
import { createHash, createHmac } from "node:crypto";
import fs from "node:fs";
import { installState, makeState } from "./states.mjs";

const [out, viewArg = "mobile,desktop", slug = "mobile-hmd"] = process.argv.slice(2);
if (!out) { console.error("출력 폴더를 적습니다"); process.exit(1); }
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
fs.mkdirSync(out, { recursive: true });
const VIEWS = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const browser = await chromium.launch({ channel: "chrome", headless: true });
const log = [];

const SERVER = "capture-upgrade-server-seed"; const CLIENT = "capture-upgrade-client";
const rollOf = (nonce) => parseInt(createHmac("sha256", SERVER).update(`${CLIENT}:${nonce}`).digest("hex").slice(0, 8), 16) % 1_000_000;
/** offset 번째 뒤의 회차가 범위 안의 번호를 내는 첫 회차 */
const nonceWhere = (low, high, offset = 0) => { let n = 0; while (!(rollOf(n + offset) >= low && rollOf(n + offset) < high)) n += 1; return n; };
const fairOf = (nonce) => JSON.stringify({ state: { serverSeed: SERVER, serverSeedHash: createHash("sha256").update(SERVER).digest("hex"), clientSeed: CLIENT, nonce }, version: 0 });
const WIN = nonceWhere(150_000, 300_000); const LOSE = nonceWhere(600_000, 800_000);
// 박스를 하나 연 다음(회차 하나를 쓴다)의 추첨이 어느 단추에서든 성공인 회차
const OPEN_THEN_WIN = nonceWhere(0, 22_500, 1);
// 박스를 하나 연 다음의 추첨이 어느 단추에서든 실패인 회차(확률의 최댓값이 75%)
const OPEN_THEN_LOSE = nonceWhere(800_000, 1_000_000, 1);

async function run(view, name, preset, opts, fn) {
  const context = await browser.newContext({ ...VIEWS[view], locale: "ko-KR" });
  const state = await makeState(preset, "ko");
  if (opts.nonce !== undefined) state.values["gachaflix.fair"] = fairOf(opts.nonce);
  if (opts.mutate) opts.mutate(state.values);
  await installState(context, state, new URL(base).origin);
  if (opts.noLock) await context.addInitScript(() => { try { Object.defineProperty(Navigator.prototype, "locks", { get: () => undefined, configurable: true }); } catch { /* 그대로 둔다 */ } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 140)); });
  const shot = async (step, wait = 350) => { await page.waitForTimeout(wait); await page.screenshot({ path: `${out}/up-${name}-${step}-${view}.png` }); };
  try { await fn(page, shot); log.push(`${view} ${name} 완료${errors.length ? " 콘솔 오류: " + errors[0] : ""}`); }
  catch (e) { await page.screenshot({ path: `${out}/up-${name}-FAILED-${view}.png` }).catch(() => {}); log.push(`${view} ${name} 실패: ${String(e.message).split("\n")[0].slice(0, 160)}`); }
  await context.close();
}
const go = (page, path) => page.goto(base + path, { waitUntil: "networkidle" });
const setFault = (page, value) => page.evaluate((v) => sessionStorage.setItem("voila.opening.fault", v), value);
/** 보관함의 첫 상품(상품가 $1,000)의 상세를 열고 업그레이드 시트까지 간다 */
async function openFromInventory(page) {
  await go(page, "/ko/inventory");
  await page.locator(".v-itemrow").first().click();
  await page.waitForTimeout(300);
}
const chip = (page, n) => page.locator(`[data-upgrade-chip="${n}"]`);
/** 보관함의 상품가를 바꾼다(맞는 목표가 없는 단추를 만들려고) */
const withValue = (valueUsdt) => (values) => {
  for (const key of Object.keys(values)) {
    if (!/inventory/.test(key)) continue;
    const v = JSON.parse(values[key]);
    if (v.state.items.length) { v.state.items[0].valueUsdt = valueUsdt; values[key] = JSON.stringify(v); }
  }
};

for (const view of viewArg.split(",")) {
  // 1. 보관함의 상품 상세 → 업그레이드 → 2배 → 추첨 → 성공 → 결과 검증 → USDT로 받기
  await run(view, "won", "inventory", { nonce: WIN }, async (page, shot) => {
    await openFromInventory(page);
    await shot("1-item-sheet");
    await page.locator("[data-upgrade-open]").click();
    await shot("2-pick-empty");
    await chip(page, 2).click();
    await shot("3-pick-target");
    await page.locator("[data-upgrade-go]").click();
    await shot("4-draw", 1200);
    await shot("5-result", 2200);
    await page.getByRole("button", { name: "결과 검증" }).click();
    await shot("6-verify", 700);
    await page.getByRole("button", { name: "닫기" }).last().click();
    await page.locator("[data-take-primary]").last().click();
    await shot("7-take-confirm", 600);
    await page.locator("[role=alertdialog]").getByRole("button", { name: /USDT로 받기/ }).click();
    await shot("8-taken", 900);
  });
  // 2. 성공한 뒤 한 번 더: 방금 받은 목표 상품을 이어서 건다. 그다음 보관함의 받은 것 탭과 건 상품의 상세
  await run(view, "again", "inventory", { nonce: WIN }, async (page, shot) => {
    await openFromInventory(page);
    await page.locator("[data-upgrade-open]").click();
    await chip(page, 2).click();
    await page.locator("[data-upgrade-go]").click();
    await page.waitForTimeout(3000);
    await page.locator("[data-upgrade-again]").click();
    await shot("1-pick-next");
    await page.getByRole("button", { name: "닫기" }).last().click();
    await shot("2-held-list");
    await page.locator(".v-itemrow").first().click();
    await shot("3-target-detail");
    await page.getByRole("button", { name: "닫기" }).last().click();
    await page.getByRole("button", { name: /받은 것/ }).click();
    await shot("4-done-list");
    await page.locator(".v-itemrow").first().click();
    await shot("5-used-detail");
  });
  // 3. 실패: 건 상품이 사라진다
  await run(view, "lost", "inventory", { nonce: LOSE }, async (page, shot) => {
    await openFromInventory(page);
    await page.locator("[data-upgrade-open]").click();
    await chip(page, 2).click();
    await page.locator("[data-upgrade-go]").click();
    await shot("1-draw", 1200);
    await shot("2-result", 2200);
    await page.getByRole("button", { name: "결과 검증" }).click();
    await shot("3-verify", 700);
  });
  // 4. 맞는 목표가 없는 단추(상품가가 아주 큰 상품)
  await run(view, "nochip", "inventory", { mutate: withValue(1_500_000) }, async (page, shot) => {
    await openFromInventory(page);
    await page.locator("[data-upgrade-open]").click();
    await shot("1-closed-chips");
  });
  // 5. 확인하지 못한 상태와 실행하지 못한 상태(개발 서버의 시험 스위치)
  await run(view, "unknown", "inventory", {}, async (page, shot) => {
    await openFromInventory(page);
    await setFault(page, "upgrade-unknown");
    await page.locator("[data-upgrade-open]").click();
    await chip(page, 2).click();
    await page.locator("[data-upgrade-go]").click();
    await shot("1-result", 900);
    await page.getByRole("button", { name: "닫기" }).last().click();
    await shot("2-list");
    await page.locator(".v-itemrow").first().click();
    await shot("3-detail");
  });
  // 걸기 전에 잠근 값: 고르는 화면의 링크 하나
  await run(view, "locked", "inventory", { nonce: WIN }, async (page, shot) => {
    await openFromInventory(page);
    await page.locator("[data-upgrade-open]").click();
    await chip(page, 2).click();
    await page.getByRole("button", { name: "잠근 값 보기" }).click();
    await shot("1-locked");
    await page.getByRole("button", { name: "닫기" }).last().click();
    await shot("2-back-to-pick");
  });
  // 탭 사이의 잠금이 없는 브라우저: 걸지 않고 그 자리에 알린다
  await run(view, "nolock", "inventory", { noLock: true }, async (page, shot) => {
    await openFromInventory(page);
    await page.locator("[data-upgrade-open]").click();
    await shot("1-refused");
  });
  await run(view, "failed", "inventory", {}, async (page, shot) => {
    await openFromInventory(page);
    await setFault(page, "upgrade-failed");
    await page.locator("[data-upgrade-open]").click();
    await chip(page, 2).click();
    await page.locator("[data-upgrade-go]").click();
    await shot("1-result", 900);
  });
  // 6. 한 개 결과 화면: 주 단추 아래의 조용한 단추 → 업그레이드 → 성공 → 닫은 뒤의 결과 화면
  // 한 개 결과 화면에서 걸어 실패: 주 단추는 그 박스로 돌아가기
  await run(view, "one-lost", "funded", { nonce: OPEN_THEN_LOSE }, async (page, shot) => {
    await go(page, `/ko/box/${slug}`);
    await page.getByRole("button", { name: /언박싱/ }).first().click();
    await page.waitForTimeout(2600);
    await page.locator("[data-upgrade-open]").click();
    await page.locator("[data-upgrade-chip]:not([disabled])").first().click();
    await page.locator("[data-upgrade-go]").click();
    await shot("1-result", 3000);
    await page.locator("[data-upgrade-back]").click();
    await shot("2-back-on-box", 600);
  });
  await run(view, "one", "funded", { nonce: OPEN_THEN_WIN }, async (page, shot) => {
    await go(page, `/ko/box/${slug}`);
    await page.getByRole("button", { name: /언박싱/ }).first().click();
    await page.waitForTimeout(2600);
    await shot("1-result");
    await page.locator("[data-upgrade-open]").click();
    await shot("2-pick-empty");
    await page.locator("[data-upgrade-chip]:not([disabled])").first().click();
    await shot("3-pick-target");
    await page.locator("[data-upgrade-go]").click();
    await shot("4-result", 3000);
    await page.getByRole("button", { name: "보관함에 두기" }).click();
    await shot("5-after");
  });
  // 7. 여러 개 결과: 행을 눌러 가는 상품 상세의 조용한 단추
  await run(view, "five", "funded", {}, async (page, shot) => {
    await go(page, `/ko/box/${slug}`);
    await page.getByRole("button", { name: /^5개$/ }).first().click();
    await page.getByRole("button", { name: /언박싱/ }).first().click();
    await page.waitForTimeout(500);
    const pay = page.locator(".v-sheet, [role=dialog]").last().getByRole("button", { name: /언박싱/ });
    if (await pay.count()) await pay.first().click();
    await page.waitForTimeout(3000);
    await page.locator(".v-row--button").first().click();
    await shot("1-detail");
    await page.locator("[data-upgrade-open]").click();
    await shot("2-pick-empty");
  });
}
await browser.close();
console.log(log.join("\n"));
