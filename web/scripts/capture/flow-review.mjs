// 시나리오 F: 보관함에서 후기를 올리고 박스 화면에서 보이는지 확인한다.
//   node scripts/capture/flow-review.mjs ../qa/work/r4
import { chromium } from "playwright";
import { installState, makeState } from "./states.mjs";

const [out] = process.argv.slice(2);
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR", reducedMotion: "reduce" });
await installState(context, await makeState("inventory", "ko"), new URL(base).origin);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
await page.goto(base + "/ko/inventory", { waitUntil: "networkidle" });
await page.locator(".v-itemrow").first().click();
await page.getByText("후기 쓰기", { exact: true }).click();
await page.locator("textarea.v-input").fill("배송 잘 받았습니다. 상자 상태도 좋았어요.");
await page.screenshot({ path: `${out}/review-filled-mobile.png` });
await page.getByRole("button", { name: "후기 올리기" }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${out}/review-posted-mobile.png` });
const reviewedLine = await page.getByText("후기를 올렸습니다").count();
const slug = await page.evaluate(() => { const raw = localStorage.getItem("voila-test-aresjoo:gachaflix.community") ?? localStorage.getItem("gachaflix.community"); try { return JSON.parse(raw).state.mine[0].boxSlug; } catch { return null; } });
console.log("reviewed line", reviewedLine, "box", slug);
if (slug) {
  await page.goto(base + "/ko/box/" + slug, { waitUntil: "networkidle" });
  const h = await page.getByRole("heading", { name: "후기" }).first();
  await h.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/review-onbox-mobile.png` });
  console.log("review text on box page:", await page.getByText("배송 잘 받았습니다").count());
}
console.log(errors.length ? "console errors: " + errors.join(" | ") : "no console errors");
await browser.close();
