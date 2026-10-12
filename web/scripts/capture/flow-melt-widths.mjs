// 머리줄과 새 화면을 좁은 폭과 경계 폭에서 찍는다(320, 768, 900, 960). 언어마다.
//   node scripts/capture/flow-melt-widths.mjs <출력 폴더>
import { chromium } from "playwright";
import fs from "node:fs";
import { installState, makeState } from "./states.mjs";

const [out] = process.argv.slice(2);
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const rows = [];
for (const locale of ["ko", "en", "zh"]) {
  for (const width of [320, 768, 900, 960]) {
    const context = await browser.newContext({ viewport: { width, height: 700 }, deviceScaleFactor: 1, locale: locale === "en" ? "en-US" : locale === "zh" ? "zh-CN" : "ko-KR" });
    await installState(context, await makeState("inventory", locale), new URL(base).origin);
    const page = await context.newPage();
    await page.goto(`${base}/${locale}/wins`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const head = document.querySelector("header");
      const kids = head ? [...head.querySelectorAll("a, button")].filter((e) => e.getBoundingClientRect().width > 0) : [];
      const tops = new Set(kids.map((e) => Math.round(e.getBoundingClientRect().top / 8)));
      const over = [...document.querySelectorAll("main *")].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1).length;
      return { headH: head ? Math.round(head.getBoundingClientRect().height) : 0, rowsInHead: tops.size, docW: document.documentElement.scrollWidth, over };
    });
    rows.push(`${locale} ${width}: 머리 높이 ${m.headH}, 머리 안 줄 수 ${m.rowsInHead}, 문서 폭 ${m.docW}, 넘친 요소 ${m.over}`);
    await page.screenshot({ path: `${out}/w-${locale}-${width}.png` });
    await context.close();
  }
}
await browser.close();
console.log(rows.join("\n"));
