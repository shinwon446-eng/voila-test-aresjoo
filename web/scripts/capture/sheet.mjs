// 스크린샷 여러 장을 한 장으로 모은다.
//   node scripts/capture/sheet.mjs <출력 png> <제목> <줄 정의> ...
//   줄 정의: "줄 제목|폭(px)|파일:설명|파일:설명|..."  (파일 경로는 실행 위치 기준)
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [out, title, ...rows] = process.argv.slice(2);
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:36px;background:#0b0b0c;color:#f2f2f2;font:15px/1.4 "Malgun Gothic",sans-serif;width:max-content}
h1{font-size:28px;font-weight:400;margin:0 0 24px}h2{font-size:18px;font-weight:400;margin:28px 0 12px;color:#cdcdcd}
.row{display:flex;gap:18px;align-items:flex-start}figure{margin:0}figcaption{margin-bottom:8px;font-size:14px;color:#9a9a9a}
img{display:block;border:1px solid #2a2a2e;border-radius:14px}</style><h1>${esc(title)}</h1>` + rows.map((row) => {
  const [name, width, ...items] = row.split("|");
  return `<h2>${esc(name)}</h2><div class="row">` + items.map((item) => {
    const cut = item.indexOf(":");
    const file = item.slice(0, cut), caption = item.slice(cut + 1);
    return `<figure><figcaption>${esc(caption)}</figcaption><img style="width:${width}px" src="${pathToFileURL(path.resolve(file)).href}"></figure>`;
  }).join("") + "</div>";
}).join("");
const tmp = path.resolve(path.dirname(out), "_sheet.html");
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(tmp, html);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto(pathToFileURL(tmp).href);
await page.waitForLoadState("networkidle");
const broken = await page.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).length);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
fs.unlinkSync(tmp);
console.log("sheet", out, "broken images", broken);
