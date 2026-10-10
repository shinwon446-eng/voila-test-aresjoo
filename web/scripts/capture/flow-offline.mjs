// 오프라인 한 줄: 박스 화면에서 네트워크를 끊었을 때와 다시 연결됐을 때.
//   node scripts/capture/flow-offline.mjs ../qa/cycles/c4
import { chromium } from "playwright";
import { installState, makeState } from "./states.mjs";

const [out] = process.argv.slice(2);
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR", reducedMotion: "reduce" });
await installState(context, await makeState("funded", "ko"), new URL(base).origin);
const page = await context.newPage();
await page.goto(base + "/ko/box/dollar-apple", { waitUntil: "networkidle" });
await context.setOffline(true);
await page.waitForTimeout(600);
const line = await page.locator(".v-offline").count();
console.log("offline line shown:", line);
await page.screenshot({ path: `${out}/offline-mobile.png` });
const btn = await page.locator(".v-openbar .v-btn").innerText();
console.log("open button while offline:", btn);
await context.setOffline(false);
await page.waitForTimeout(600);
console.log("line after reconnect:", await page.locator(".v-offline").count());
await browser.close();
