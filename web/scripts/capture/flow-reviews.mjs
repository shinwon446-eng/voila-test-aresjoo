// 샘플 후기(flow/MELT_SPEC.md V) 화면을 찍는다: 박스 화면의 후기 영역(처음 10건, 더 보기, 상세)과 후기 모아 보기. 화면 판정은 사람이 한다.
//   node scripts/capture/flow-reviews.mjs <출력 폴더> [mobile|desktop|둘 다 쉼표로] [박스 slug 들, 쉼표로] [ko|en|zh]
// 떠 있는 개발 서버(3002)를 쓴다. 가로로 넘치는지(docW 와 winW), 콘솔 오류(서버가 그린 것과 브라우저가 그린 것이 어긋나면 여기 뜬다)를 함께 적는다.
import { chromium } from "playwright";
import fs from "node:fs";

const [out, viewArg = "mobile,desktop", slugArg = "watch-rolex,mobile-apple", locale = "ko"] = process.argv.slice(2);
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
fs.mkdirSync(out, { recursive: true });
const VIEWS = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  narrow: { viewport: { width: 320, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const browser = await chromium.launch({ channel: "chrome", headless: true });
const widths = (page) => page.evaluate(() => ({ docW: document.documentElement.scrollWidth, winW: innerWidth, rows: document.querySelectorAll(".v-rv").length, total: document.querySelector(".v-rv-total")?.textContent ?? null }));
/** 지연 로딩 사진을 다 불러온 뒤 그 영역만 찍는다 */
const shootList = async (page, path) => {
  await page.evaluate(async () => { for (const img of document.querySelectorAll(".v-rv img")) { img.loading = "eager"; if (!img.complete) await new Promise((done) => { img.onload = img.onerror = done; setTimeout(done, 3000); }); } });
  await page.locator(".v-rvfeed").screenshot({ path });
};

for (const view of viewArg.split(",")) {
  const context = await browser.newContext({ ...VIEWS[view], locale: locale === "en" ? "en-US" : locale === "zh" ? "zh-CN" : "ko-KR", reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 200)));
  for (const slug of slugArg.split(",")) {
    await page.goto(`${base}/${locale}/box/${slug}`, { waitUntil: "networkidle" });
    await page.locator("#reviews").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.locator("#reviews").screenshot({ path: `${out}/box-${slug}-reviews-${view}.png` });
    await shootList(page, `${out}/box-${slug}-list10-${view}.png`);
    console.log(view, slug, "처음", JSON.stringify(await widths(page)));
    await page.locator("[data-reviews-more]").click();
    await page.waitForTimeout(300);
    await page.locator("[data-reviews-more]").click();
    await page.waitForTimeout(300);
    await shootList(page, `${out}/box-${slug}-list50-${view}.png`);
    console.log(view, slug, "더 보기 두 번", JSON.stringify(await widths(page)));
    // 읽어 보기 좋게 글만 따로 적는다
    const lines = await page.evaluate(() => Array.from(document.querySelectorAll(".v-rv")).map((li) => [li.querySelector(".v-rv-author")?.textContent, li.querySelector(".v-rv-ago")?.textContent, li.querySelector(".v-rv-text")?.textContent, li.querySelector(".v-rv-itemname")?.textContent].join(" | ")));
    fs.writeFileSync(`${out}/box-${slug}-${view}-${locale}.txt`, lines.join("\n"));
    await page.locator(".v-rv-btn").nth(2).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${out}/box-${slug}-sheet-${view}.png` });
    await page.keyboard.press("Escape");
  }
  await page.goto(`${base}/${locale}/reviews`, { waitUntil: "networkidle" });
  await page.waitForSelector(".v-rv");
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/reviews-all-${view}.png` });
  await page.screenshot({ path: `${out}/reviews-all-full-${view}.png`, fullPage: true });
  console.log(view, "/reviews", JSON.stringify(await widths(page)));
  await page.goto(`${base}/${locale}/reviews?box=${slugArg.split(",")[0]}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".v-rv");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/reviews-box-${view}.png` });
  console.log(view, "/reviews?box", JSON.stringify(await widths(page)));
  console.log(view, errors.length ? "콘솔 오류: " + errors.join(" || ") : "콘솔 오류 없음");
  await context.close();
}
await browser.close();
