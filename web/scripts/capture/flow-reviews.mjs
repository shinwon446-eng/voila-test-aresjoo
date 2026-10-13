// 샘플 후기(flow/MELT_SPEC.md V) 화면을 찍는다: 박스 화면의 후기 영역(옆으로 넘기는 줄, 끝에서 더 붙는 것, 내 후기가 맨 앞, 상세)과 후기 모아 보기(격자, 더 보기). 화면 판정은 사람이 한다.
//   node scripts/capture/flow-reviews.mjs <출력 폴더> [mobile|desktop|둘 다 쉼표로] [박스 slug 들, 쉼표로] [ko|en|zh]
// 떠 있는 개발 서버(3002)를 쓴다. 다른 주소는 CAPTURE_BASE 로 준다.
// 가로로 넘치는지(docW 와 winW), 콘솔 오류(서버가 그린 것과 브라우저가 그린 것이 어긋나면 여기 뜬다)를 함께 적는다.
// 내 후기는 첫 박스에서만 본다: 저장소에 후기 하나를 심고(실제 서버에는 아무것도 보내지 않는다) 줄의 첫 장이 그것인지, 상세에 쓴 날짜와 시각이 적히는지.
import { chromium } from "playwright";
import fs from "node:fs";
import { readFile } from "node:fs/promises";

const [out, viewArg = "mobile,desktop", slugArg = "watch-rolex,mobile-apple", locale = "ko"] = process.argv.slice(2);
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
fs.mkdirSync(out, { recursive: true });
const VIEWS = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  narrow: { viewport: { width: 320, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const browser = await chromium.launch({ channel: "chrome", headless: true });
const widths = (page) => page.evaluate(() => ({ docW: document.documentElement.scrollWidth, winW: innerWidth, cards: document.querySelectorAll(".v-rvcard").length, live: document.querySelector("[data-reviews-live]")?.textContent || null }));
/** 지연 로딩 사진을 다 불러온 뒤 그 영역만 찍는다 */
const shoot = async (page, selector, path) => {
  await page.evaluate(async () => { for (const img of document.querySelectorAll(".v-rvcard img")) { img.loading = "eager"; if (!img.complete) await new Promise((done) => { img.onload = img.onerror = done; setTimeout(done, 3000); }); } });
  await page.locator(selector).screenshot({ path });
};
/** 줄을 끝까지 밀어 뒤에 더 붙는지 본다. 붙으면 그 장수를, 더 없으면 그대로를 돌려준다 */
const pushEnd = async (page) => {
  await page.evaluate(() => { const row = document.querySelector(".v-rvrow"); row.scrollLeft = row.scrollWidth; });
  await page.waitForTimeout(500);
  return (await widths(page)).cards;
};
/** 첫 박스의 첫 상품으로 내 후기 하나(저장소에 직접 심는다. 이 사이트의 저장소 접두사는 lib/labSite 의 것) */
const mineOf = async (slug) => {
  const prefix = (await readFile(new URL("../../lib/labSite.ts", import.meta.url), "utf8")).match(/LAB_STORAGE_PREFIX\s*=\s*"([^"]+)"/)?.[1];
  const files = fs.readdirSync(new URL("../../lib/catalog2/data/", import.meta.url), { recursive: true }).filter((f) => String(f).endsWith(`${slug}.json`));
  const itemId = files.length ? JSON.parse(fs.readFileSync(new URL("../../lib/catalog2/data/" + String(files[0]).replace(/\\/g, "/"), import.meta.url), "utf8")).items[0][0] : "";
  const at = new Date(Date.now() - 3 * 86400000).toISOString();
  const review = { id: "capture-review-1", ownedId: "capture-item-1", boxSlug: slug, itemId, text: "촬영용 내 후기입니다. 사흘 전에 썼고 맨 앞에 있어야 합니다.", rating: 4, at, publishedAt: at, bonusUsdt: 0, authorName: "촬영계정" };
  return { prefix, value: JSON.stringify({ state: { mine: [review] }, version: 0 }) };
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
    await shoot(page, "#reviews", `${out}/box-${slug}-reviews-${view}.png`);
    console.log(view, slug, "처음", JSON.stringify(await widths(page)));
    // 끝까지 밀면 스무 장이 더 붙는다. 두 번
    const after1 = await pushEnd(page), after2 = await pushEnd(page);
    await shoot(page, ".v-hscroll", `${out}/box-${slug}-row60-${view}.png`);
    console.log(view, slug, "끝까지 두 번", JSON.stringify({ ...(await widths(page)), appended: [after1, after2] }));
    // 읽어 보기 좋게 글만 따로 적는다
    const lines = await page.evaluate(() => Array.from(document.querySelectorAll(".v-rvcard")).map((li) => [li.querySelector(".v-stars")?.getAttribute("aria-label"), li.querySelector(".v-rvcard-body > .v-small")?.textContent, li.querySelector(".v-rvcard-text")?.textContent, li.querySelector(".v-card-title")?.textContent, li.querySelector(".v-rvcard-body > .v-small.v-num")?.textContent, li.querySelector(".v-rvcard-photo") ? "사진" : ""].join(" | ")));
    fs.writeFileSync(`${out}/box-${slug}-${view}-${locale}.txt`, lines.join("\n"));
    // 셋째 장을 눌러 상세
    await page.evaluate(() => { document.querySelector(".v-rvrow").scrollLeft = 0; });
    await page.locator(".v-rvcard-btn").nth(2).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${out}/box-${slug}-sheet-${view}.png` });
    console.log(view, slug, "상세", JSON.stringify(await page.evaluate(() => ({ at: document.querySelector("[data-review-at]")?.textContent, item: document.querySelector("[role=dialog] .v-rv-itemname")?.textContent, thumb: !!document.querySelector("[role=dialog] .v-rv-thumb img"), glyph: !!document.querySelector("[role=dialog] .v-item-glyph") }))));
    await page.keyboard.press("Escape");
  }
  // 내 후기: 첫 박스에서, 저장소에 하나를 심은 다른 문맥으로
  const first = slugArg.split(",")[0];
  const mine = await mineOf(first);
  const mineContext = await browser.newContext({ ...VIEWS[view], locale: "ko-KR", reducedMotion: "reduce" });
  await mineContext.addInitScript(({ prefix, value }) => { if (!sessionStorage.getItem("capture-mine")) { localStorage.setItem((Storage.prototype.__voilaLab ? "" : prefix) + "gachaflix.community", value); sessionStorage.setItem("capture-mine", "1"); } }, mine);
  const minePage = await mineContext.newPage();
  minePage.on("pageerror", (e) => errors.push(String(e.message).slice(0, 200)));
  await minePage.goto(`${base}/${locale}/box/${first}`, { waitUntil: "networkidle" });
  await minePage.locator("#reviews").scrollIntoViewIfNeeded();
  await minePage.waitForTimeout(600);
  const head = await minePage.evaluate(() => Array.from(document.querySelectorAll(".v-rvcard")).slice(0, 2).map((li) => ({ author: li.querySelector(".v-rvcard-body > .v-small")?.textContent, ago: li.querySelector(".v-rvcard-body > .v-small.v-num")?.textContent, count: document.querySelector(".v-rvsum-avg .v-small")?.textContent })));
  await shoot(minePage, "#reviews", `${out}/box-${first}-mine-${view}.png`);
  await minePage.locator(".v-rvcard-btn").first().click();
  await minePage.waitForTimeout(500);
  const sheet = await minePage.evaluate(() => ({ at: document.querySelector("[data-review-at]")?.textContent, record: !!document.querySelector("[role=dialog] .v-small:not(.v-num)") }));
  await minePage.screenshot({ path: `${out}/box-${first}-mine-sheet-${view}.png` });
  console.log(view, first, "내 후기", JSON.stringify({ head, sheet }), head[0]?.author === "촬영계정" && /^\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}$/.test(sheet.at ?? "") ? "맨 앞이고 상세에 날짜와 시각" : "다르다");
  await mineContext.close();

  await page.goto(`${base}/${locale}/reviews`, { waitUntil: "networkidle" });
  await page.waitForSelector(".v-rvcard");
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/reviews-all-${view}.png` });
  await page.screenshot({ path: `${out}/reviews-all-full-${view}.png`, fullPage: true });
  console.log(view, "/reviews", JSON.stringify(await widths(page)));
  await page.locator("[data-reviews-more]").click();
  await page.waitForTimeout(400);
  console.log(view, "/reviews 더 보기", JSON.stringify(await widths(page)));
  await page.goto(`${base}/${locale}/reviews?box=${first}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".v-rvcard");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/reviews-box-${view}.png` });
  console.log(view, "/reviews?box", JSON.stringify(await widths(page)));
  console.log(view, errors.length ? "콘솔 오류: " + errors.join(" || ") : "콘솔 오류 없음");
  await context.close();
}
await browser.close();
