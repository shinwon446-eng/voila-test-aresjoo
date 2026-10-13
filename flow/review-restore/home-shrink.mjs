// 홈 390: 첫 줄 카드가 첫 그림 뒤 줄어드는 까닭. 지금(3003)과 원본 빌드(4198) 둘 다
import { createRequire } from "node:module";
const { chromium } = createRequire(new URL("../../web/package.json", import.meta.url))("playwright");
const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const [label, url] of [["now", (process.env.CAPTURE_BASE || "http://localhost:3003") + "/ko"], ["before", (process.env.BEFORE_BASE || "http://127.0.0.1:4198/voila-test-aresjoo") + "/ko/"]]) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ko-KR", reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" }); await page.waitForSelector("a[href*='/ko/box/'] img", { timeout: 15000 });
  const read = () => page.evaluate(() => { const cards = Array.from(document.querySelectorAll("a[href*='/ko/box/']")).filter((a) => a.getBoundingClientRect().height > 120).slice(0, 3); return cards.map((a) => ({ href: a.getAttribute("href").split("/box/")[1], h: Math.round(a.getBoundingClientRect().height), parts: Array.from(a.children).map((c) => c.className.toString().slice(0, 30) + ":" + Math.round(c.getBoundingClientRect().height)), text: a.innerText.replace(/\s+/g, " ").slice(0, 60), font: getComputedStyle(a).fontFamily.slice(0, 30), fontsReady: document.fonts.status })); });
  const a = await read(); await page.waitForTimeout(1500); const b = await read();
  console.log(label, "first:", JSON.stringify(a)); console.log(label, "later:", JSON.stringify(b));
  await context.close();
}
await browser.close();
