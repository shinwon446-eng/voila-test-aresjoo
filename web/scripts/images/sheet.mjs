// 받은 Commons 사진을 한 장에 모아 사람이 확인한다(상품 id 라벨 포함).
//   node scripts/images/sheet.mjs <출력 png> [--start n] [--count 30]
import { readdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const [out, ...rest] = process.argv.slice(2);
const start = +(rest[rest.indexOf("--start") + 1] || 0) || 0;
const count = +(rest[rest.indexOf("--count") + 1] || 30) || 30;
const dir = new URL("../../public/assets/photography/", import.meta.url);
// --ids a,b,c 를 주면 그 상품들만(순서는 준 대로)
const only = (rest[rest.indexOf("--ids") + 1] || "").split(",").filter(Boolean);
const all = readdirSync(dir).filter((f) => f.startsWith("commons-")).sort();
const files = only.length ? only.map((id) => `commons-${id}.webp`).filter((f) => all.includes(f)) : all.slice(start, start + count);
const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#000;color:#fff;font:12px sans-serif">
<div style="display:grid;grid-template-columns:repeat(5,240px);gap:8px;padding:8px">
${files.map((f) => `<figure style="margin:0"><img src="${new URL(f, dir).href}" style="width:240px;height:180px;object-fit:cover;display:block"><figcaption style="padding:4px 0">${f.replace(/^commons-|\.webp$/g, "")}</figcaption></figure>`).join("")}
</div></body>`;
// about:blank 에서는 file: 이미지를 못 읽는다. html 을 파일로 쓰고 file: 로 연다
const htmlPath = new URL("../../../qa/work/commons-sheet.html", import.meta.url);
writeFileSync(htmlPath, html);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1260, height: 900 } });
await page.goto(htmlPath.href, { waitUntil: "load" });
await page.waitForTimeout(500);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(out, files.length, "files from", start);
