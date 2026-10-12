// flow/MELT_SPEC.md 의 흐름을 처음부터 끝까지 눌러 가며 찍는다(검수용 스크린샷). 화면 판정은 사람이나 Codex 가 한다.
//   node scripts/capture/flow-melt.mjs <출력 폴더> [mobile|desktop|둘 다 쉼표로] [박스 slug]
// 떠 있는 개발 서버(3002)를 쓴다. 상태는 states.mjs 로 심는다(시험 계정과 시험 잔액, 실제 돈 없음).
import { chromium } from "playwright";
import fs from "node:fs";
import { installState, makeState } from "./states.mjs";

const [out, viewArg = "mobile,desktop", slug = "mobile-hmd"] = process.argv.slice(2);
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
fs.mkdirSync(out, { recursive: true });
const VIEWS = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const browser = await chromium.launch({ channel: "chrome", headless: true });
const log = [];

async function run(view, name, preset, fn) {
  const context = await browser.newContext({ ...VIEWS[view], locale: "ko-KR" });
  if (preset) await installState(context, await makeState(preset, "ko"), new URL(base).origin);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 140)); });
  const shot = async (step) => { await page.waitForTimeout(350); await page.screenshot({ path: `${out}/${name}-${step}-${view}.png` }); };
  try { await fn(page, shot); log.push(`${view} ${name} 완료${errors.length ? " 콘솔 오류: " + errors[0] : ""}`); }
  catch (e) { await page.screenshot({ path: `${out}/${name}-FAILED-${view}.png` }).catch(() => {}); log.push(`${view} ${name} 실패: ${String(e.message).split("\n")[0].slice(0, 160)}`); }
  await context.close();
}
const go = (page, path) => page.goto(base + path, { waitUntil: "networkidle" });
const btn = (page, re) => page.getByRole("button", { name: re }).first();

for (const view of viewArg.split(",")) {
  // 1. 한 개 열기 → 결과 → USDT로 받기 → 확인 → 받은 뒤
  await run(view, "one", "funded", async (page, shot) => {
    await go(page, `/ko/box/${slug}`);
    await shot("1-box");
    await btn(page, /언박싱/).click();
    await page.waitForTimeout(2600);
    await shot("2-result");
    await btn(page, /USDT로 받기/).click();
    await shot("3-confirm");
    await page.locator(".v-sheet, [role=dialog]").last().getByRole("button", { name: /USDT로 받기/ }).click();
    await page.waitForTimeout(900);
    await shot("4-taken");
  });
  // 2. 다섯 개 열기 → 결과 목록 → 선택 시트
  await run(view, "five", "funded", async (page, shot) => {
    await go(page, `/ko/box/${slug}`);
    await page.getByRole("button", { name: /^5개$/ }).first().click();
    await btn(page, /언박싱/).click();
    await page.waitForTimeout(500);
    const pay = page.locator(".v-sheet, [role=dialog]").last().getByRole("button", { name: /언박싱/ });
    if (await pay.count()) { await shot("1-pay-confirm"); await pay.first().click(); }
    await page.waitForTimeout(3000);
    await shot("2-results");
    await btn(page, /USDT로 받기/).click();
    await shot("3-take-sheet");
    // 전체 선택은 목록 카드의 머리 행(체크 칸)이다. 여러 개 결과의 시트는 미리 골라진 채로 열리므로, 전부 골라져 있지 않을 때만 누른다
    const all = page.locator("[data-take-all]");
    if ((await all.getAttribute("aria-checked")) !== "true") await all.click();
    await shot("4-all-selected");
  });
  // 3. 잔액이 모자랄 때(보관 상품 있음): 박스 화면
  await run(view, "short", "inventory", async (page, shot) => {
    await go(page, "/ko/box/watch-rolex");
    await page.getByRole("button", { name: /^100개$/ }).first().click();
    await shot("1-short-with-items");
  });
  // 4. 보관함과 상품 상세, 검증 시트
  await run(view, "inv", "inventory", async (page, shot) => {
    await go(page, "/ko/inventory");
    await shot("1-list");
    await page.locator(".v-itemrow").first().click();
    await shot("2-item-sheet");
    await page.getByRole("button", { name: /개봉 결과 검증/ }).first().click();
    await page.waitForTimeout(600);
    await shot("3-verify-sheet");
  });
  // 5. 머리의 잔액 시트
  await run(view, "bal", "inventory", async (page, shot) => {
    await go(page, "/ko");
    await page.locator("[data-balance-open]").click();
    await shot("1-balance-sheet");
  });
  // 6. 출금 화면
  await run(view, "wd", "security", async (page, shot) => { await go(page, "/ko/wallet/withdraw"); await shot("1-withdraw"); });
  // 7. 나온 상품: 기록 있음, 상세, 로그인 전
  await run(view, "wins", "inventory", async (page, shot) => {
    await go(page, "/ko/wins");
    await shot("1-list");
    await page.locator(".v-itemrow").first().click();
    await shot("2-detail");
  });
  await run(view, "wins-guest", null, async (page, shot) => { await go(page, "/ko/wins"); await shot("1"); });
  // 8. 검증 화면과 개발용 화면(블록체인 기록의 상태들)
  await run(view, "verify", "inventory", async (page, shot) => { await go(page, "/ko/verify"); await page.screenshot({ path: `${out}/verify-full-${view}.png`, fullPage: true }); });
  await run(view, "gallery", null, async (page, shot) => { await go(page, "/ko/dev/gallery"); await page.screenshot({ path: `${out}/gallery-full-${view}.png`, fullPage: true }); });
  // 9. 메뉴
  await run(view, "menu", "funded", async (page, shot) => {
    await go(page, "/ko");
    const m = page.locator(".v-menu-btn");
    if (await m.isVisible()) await m.click();
    await shot("1");
  });
}
await browser.close();
console.log(log.join("\n"));
