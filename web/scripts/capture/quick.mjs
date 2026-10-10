// 작업 중 빠른 확인용 촬영. 정식 검수는 capture.mjs 와 계획 파일로 한다.
//   node scripts/capture/quick.mjs <출력 폴더> <이름=경로[#동작]> ...
//   동작: open(열기 단추를 눌러 결과까지), login(로그인 시트), charge(충전 시트), menu(메뉴 시트), state=member(시험 계정과 잔액을 심고 시작)
//   예: node scripts/capture/quick.mjs ../qa/work home=/ko box=/ko/box/dollar-apple result=/ko/box/dollar-apple#member,open
import { chromium } from "playwright";
import fs from "node:fs";
import { installState, makeState } from "./states.mjs";

const [out, ...targets] = process.argv.slice(2);
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
// QUICK_VIEWS=mobile,narrow,desktop 로 고른다. narrow 는 320 폭(가장 좁은 폰)
const ALL_VIEWS = { mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, narrow: { viewport: { width: 320, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } };
const VIEWS = (process.env.QUICK_VIEWS || "mobile,desktop").split(",").map((k) => [k, ALL_VIEWS[k]]);

for (const [view, opts] of VIEWS) {
  for (const target of targets) {
    // 첫 "=" 에서만 나눈다(주소에 ?layout=b 같은 값이 올 수 있다)
    const eq = target.indexOf("="); const name = target.slice(0, eq); const rest = target.slice(eq + 1);
    const [path, actionText = ""] = rest.split("#");
    const actions = actionText.split(",").filter(Boolean);
    const context = await browser.newContext({ ...opts, locale: "ko-KR", reducedMotion: actions.includes("motion") ? "no-preference" : "reduce" });
    const preset = actions.find((a) => a.startsWith("state:"))?.slice(6);
    if (preset) await installState(context, await makeState(preset, "ko"), new URL(base).origin);
    const page = await context.newPage();
    const errors = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
    await page.goto(base + (path.startsWith("/") ? path : "/" + path), { waitUntil: "networkidle" });
    if (actions.includes("member")) {
      // 화면의 가입 흐름을 그대로 밟아 시험 계정을 만든다(브라우저 안의 시험 장부, 실제 돈 없음)
      await page.getByRole("button", { name: /로그인|Log in|登录/ }).first().click();
      await page.getByRole("button", { name: /이메일로 가입|Sign up with email|邮箱注册/ }).click();
      await page.locator(".v-sheet input[type=email]").fill("qa-" + Date.now() + "@example.test");
      await page.locator(".v-sheet button[type=submit]").click();
      await page.locator(".v-sheet input[type=password]").fill("qa-test-password-2026");
      await page.locator(".v-sheet button[type=submit]").click();
      await page.waitForSelector(".v-sheet", { state: "detached", timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(800);
    }
    if (actions.includes("login")) { await page.getByRole("button", { name: /로그인|Log in|登录/ }).first().click(); await page.waitForTimeout(500); }
    if (actions.includes("charge")) { await page.getByRole("button", { name: /잔액|Balance|余额|USDT 충전하기/ }).first().click(); await page.waitForTimeout(1500); }
    if (actions.includes("menu")) { await page.locator(".v-menu-btn").click(); await page.waitForTimeout(400); }
    if (actions.includes("qty5")) { await page.locator(".v-openbar .v-chip").nth(1).click(); await page.waitForTimeout(200); }
    if (actions.includes("open")) { await page.locator(".v-openbar .v-btn").click(); await page.waitForSelector(".v-reveal-result", { timeout: 15000 }); await page.waitForTimeout(1800); }
    for (const act of actions.filter((x) => x.startsWith("fill:"))) { const [label, value] = act.slice(5).split("~"); await page.getByLabel(label, { exact: true }).fill(value); }
    if (actions.includes("submit")) { await page.locator("form .v-btn[type=submit]").click(); await page.waitForTimeout(700); }
    if (actions.includes("row")) { await page.locator(".v-itemrow").first().click(); await page.waitForTimeout(700); }
    for (const act of actions.filter((x) => x.startsWith("click:"))) { await page.getByText(act.slice(6), { exact: false }).last().click(); await page.waitForTimeout(900); }
    if (actions.includes("full")) await page.screenshot({ path: `${out}/${name}-full-${view}.png`, fullPage: true });
    await page.screenshot({ path: `${out}/${name}-${view}.png` });
    const info = await page.evaluate(() => ({ docW: document.documentElement.scrollWidth, winW: innerWidth, h1: document.querySelector("h1")?.textContent ?? null }));
    console.log(view, name, JSON.stringify(info), errors.length ? "console errors: " + errors.join(" | ") : "");
    await context.close();
  }
}
await browser.close();
