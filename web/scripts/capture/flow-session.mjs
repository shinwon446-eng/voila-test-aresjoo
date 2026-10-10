// 세션 만료 한 줄: 로그인 상태에서 다른 탭이 세션을 끝낸 것처럼 저장소 사건을 흉내 낸다.
//   node scripts/capture/flow-session.mjs ../qa/cycles/c4
import { chromium } from "playwright";
import { installState, makeState } from "./states.mjs";

const [out] = process.argv.slice(2);
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR", reducedMotion: "reduce" });
await installState(context, await makeState("funded", "ko"), new URL(base).origin);
const page = await context.newPage();
await page.goto(base + "/ko/box/dollar-apple", { waitUntil: "networkidle" });
console.log("logged in button:", await page.locator(".v-openbar .v-btn").innerText());
// 다른 탭에서 세션 키를 지운 것과 같은 storage 사건
await page.evaluate(() => {
  const key = Object.keys(localStorage).find((k) => k.endsWith("voila.browser-session.v1"));
  window.dispatchEvent(new StorageEvent("storage", { key: key ? key.replace(/^.*?:/, "") : "voila.browser-session.v1", newValue: "someone-else", storageArea: localStorage }));
});
await page.waitForTimeout(500);
console.log("session line:", await page.locator('[role="status"]').allInnerTexts());
console.log("button after:", await page.locator(".v-openbar .v-btn").innerText());
await page.screenshot({ path: `${out}/session-lost-mobile.png` });
await browser.close();
