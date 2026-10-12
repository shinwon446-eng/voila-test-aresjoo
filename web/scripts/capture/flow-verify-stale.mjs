// 검증 화면의 직접 계산(migration-audit/PARITY_ISSUES.md E-16): 계산이 도는 동안 입력이 바뀌면 그 계산의 결과를 버린다.
// 입력을 그대로 둔 보통의 길은 전과 같은 결과를 보여 준다.
//   CAPTURE_BASE=http://localhost:3003 node scripts/capture/flow-verify-stale.mjs [출력 폴더]
// 계산을 늦추려고 이 브라우저 안에서만 SubtleCrypto.digest 를 감싼다(앱 소스와 계산식은 건드리지 않는다).
import { chromium } from "playwright";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { installState, makeState } from "./states.mjs";

const out = process.argv[2];
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
if (out) fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const check = (scenario, name, pass, detail = "") => { results.push({ scenario, name, pass: !!pass, detail }); console.log((pass ? "PASS " : "FAIL ") + scenario + " " + name + (detail ? "  " + detail : "")); };
const SEED = "audit-e16-server-seed"; const CLIENT = "audit-e16-client";
const HASH = createHash("sha256").update(SEED).digest("hex");

async function session() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR", reducedMotion: "reduce" });
  await installState(context, await makeState("guest", "ko"), new URL(base).origin);
  // window.__digestDelay(ms) 만큼 해시 계산을 늦춘다. 0 이면 늦추지 않는다
  await context.addInitScript(() => {
    window.__digestDelay = 0;
    const digest = SubtleCrypto.prototype.digest;
    SubtleCrypto.prototype.digest = function (...args) { const ms = window.__digestDelay; return ms ? new Promise((done) => setTimeout(done, ms)).then(() => digest.apply(this, args)) : digest.apply(this, args); };
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
  await page.goto(base + "/ko/verify", { waitUntil: "networkidle" });
  const manual = page.locator('section[aria-labelledby="verify-manual"]');
  const fill = async ({ nonce }) => { await page.getByLabel("공개된 값", { exact: true }).fill(SEED); await page.getByLabel("내 기기 값", { exact: true }).fill(CLIENT); await page.getByLabel("회차", { exact: true }).fill(String(nonce)); };
  const compute = () => manual.locator(".v-btn").click();
  /** 직접 계산 절에 지금 보이는 것: 결과 행(라벨과 값), 해시 전체 값, 실패 한 줄, 단추가 바쁜지, 회차 칸의 값 */
  const state = () => manual.evaluate((el) => ({
    rows: [...el.querySelectorAll(".v-rows .v-row")].map((r) => [r.querySelector("dt")?.textContent?.trim(), r.querySelector("dd")?.textContent?.trim()]),
    hash: el.querySelector(".v-rows [title]")?.getAttribute("title") ?? null,
    fail: !!el.querySelector(".v-line--fail"), busy: el.querySelector(".v-btn")?.hasAttribute("data-busy") ?? false,
    nonce: [...el.querySelectorAll("input")].find((i) => i.inputMode === "numeric")?.value ?? null,
  }));
  const idle = async () => { await page.waitForFunction(() => !document.querySelector('section[aria-labelledby="verify-manual"] .v-btn')?.hasAttribute("data-busy")); await page.waitForTimeout(150); };
  return { context, page, errors, manual, fill, compute, state, idle, shot: (name) => (out ? page.screenshot({ path: `${out}/${name}.png` }) : null) };
}
const run = async (id, fn) => { try { await fn(); } catch (e) { check(id, "시나리오 실행", false, String(e).slice(0, 240)); } };
const valueOf = (st, index) => st.rows[index]?.[1] ?? null;
let normal2 = null, normal3 = null;

// a: 보통의 길. 입력을 그대로 두면 계산 결과가 나온다(회차 2 와 3 의 결과를 뒤에서 견줄 기준으로 적어 둔다)
await run("a", async () => {
  const s = await session();
  await s.fill({ nonce: 2 }); await s.compute(); await s.idle();
  normal2 = await s.state(); await s.manual.scrollIntoViewIfNeeded(); await s.shot("a1-normal");
  check("a", "결과 세 행(공개된 값의 해시, 계산한 번호, 상품)이 나온다", normal2.rows.length === 3 && !normal2.fail, JSON.stringify(normal2.rows));
  check("a", "해시는 공개된 값의 SHA-256 이다", normal2.hash === HASH, String(normal2.hash));
  await s.fill({ nonce: 3 }); await s.compute(); await s.idle();
  normal3 = await s.state();
  check("a", "회차를 바꿔 다시 계산하면 그 회차의 결과로 바뀐다", normal3.rows.length === 3 && valueOf(normal3, 1) !== valueOf(normal2, 1), JSON.stringify([valueOf(normal2, 1), valueOf(normal3, 1)]));
  check("a", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// b: 계산이 도는 동안 회차를 고치면 그 계산의 결과를 화면에 올리지 않는다
await run("b", async () => {
  const s = await session();
  await s.fill({ nonce: 2 });
  await s.page.evaluate(() => { window.__digestDelay = 1200; });
  await s.compute();
  await s.page.waitForFunction(() => document.querySelector('section[aria-labelledby="verify-manual"] .v-btn')?.hasAttribute("data-busy"));
  await s.page.getByLabel("회차", { exact: true }).fill("3");
  await s.idle();
  const after = await s.state(); await s.manual.scrollIntoViewIfNeeded(); await s.shot("b1-changed-during-compute");
  check("b", "회차 칸은 고친 값(3)이다", after.nonce === "3", String(after.nonce));
  check("b", "회차 2 로 시작한 계산의 결과가 회차 3 아래에 나오지 않는다", after.rows.length === 0, JSON.stringify(after.rows));
  check("b", "버린 것은 실패가 아니다(실패 한 줄 없음, 단추는 다시 눌린다)", !after.fail && !after.busy);
  await s.page.evaluate(() => { window.__digestDelay = 0; });
  await s.compute(); await s.idle();
  const again = await s.state();
  check("b", "다시 계산하면 지금 입력(회차 3)의 결과가 나온다", again.rows.length === 3 && !!normal3 && valueOf(again, 1) === valueOf(normal3, 1) && valueOf(again, 2) === valueOf(normal3, 2), JSON.stringify(again.rows));
  check("b", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// c: 계산이 도는 동안 박스를 바꿔도 그 계산의 결과를 올리지 않는다
await run("c", async () => {
  const s = await session();
  await s.fill({ nonce: 2 });
  await s.page.evaluate(() => { window.__digestDelay = 1200; });
  await s.compute();
  await s.page.waitForFunction(() => document.querySelector('section[aria-labelledby="verify-manual"] .v-btn')?.hasAttribute("data-busy"));
  await s.manual.locator(".v-chips--scroll .v-chip").nth(1).click();
  await s.idle();
  const after = await s.state();
  check("c", "앞의 박스로 시작한 계산의 결과가 새 박스 아래에 나오지 않는다", after.rows.length === 0 && !after.fail, JSON.stringify(after.rows));
  check("c", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// d: 늦더라도 입력을 그대로 두면 결과가 나온다(늦은 것만으로는 버리지 않는다)
await run("d", async () => {
  const s = await session();
  await s.fill({ nonce: 2 });
  await s.page.evaluate(() => { window.__digestDelay = 800; });
  await s.compute(); await s.idle();
  const slow = await s.state();
  check("d", "늦게 끝난 계산도 입력이 같으면 보통의 길과 같은 결과다", slow.rows.length === 3 && !!normal2 && JSON.stringify(slow.rows) === JSON.stringify(normal2.rows), JSON.stringify(slow.rows));
  check("d", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

await browser.close();
const failed = results.filter((r) => !r.pass);
if (out) fs.writeFileSync(`${out}/verify-stale-results.json`, JSON.stringify(results, null, 2));
console.log(`\n검사 ${results.length}개, 통과 ${results.length - failed.length}, 실패 ${failed.length}`);
process.exit(failed.length ? 1 : 0);
