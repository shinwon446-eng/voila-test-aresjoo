// 실제 추첨으로 100개와 10개를 열어 결과 화면을 찍는다(고정값 없이, 시드는 그 자리에서 만들어진다). 개발 서버(3002)가 떠 있어야 한다.
//   node scripts/capture/opening-live.mjs <출력 폴더>
import { chromium } from "playwright";
import { installState, makeState } from "./states.mjs";
const out = process.argv[2]; const base = "http://localhost:3002";
const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const [slug, chip, name] of [["vault-gold", 4, "gold-100"], ["dollar-apple", 4, "apple-100"], ["dollar-galaxy", 2, "galaxy-10"], ["vault-handbag", 2, "handbag-10"]]) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR" });
  const state = await makeState("funded", "ko"); await installState(context, state, new URL(base).origin);
  const page = await context.newPage();
  await page.goto(`${base}/ko/box/${slug}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  await page.screenshot({ path: `${out}/${name}-box.png` });
  await page.locator(".v-openbar .v-chip").nth(chip).click();
  await page.locator("[data-open-primary]").click();
  const c = page.locator('[role="alertdialog"] .v-btn'); await page.waitForTimeout(400); if (await c.count()) await c.first().click();
  await page.waitForSelector(".v-reveal-result", { timeout: 30000 }); await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/${name}-result.png` });
  await page.screenshot({ path: `${out}/${name}-result-full.png`, fullPage: false });
  console.log(name, (await page.evaluate(() => document.querySelector(".v-reveal-head")?.innerText.replace(/\s+/g, " ").slice(0, 420))));
  await context.close();
}
await browser.close();
