// 홈 배너의 움직임을 시간 순서대로 찍어 한 장으로 붙인다(비평과 검증용).
//   node scripts/capture/hero-frames.mjs <출력 폴더> [mobile|desktop|narrow] [ko|en|zh]
// 실제 시간으로 돌리면서 정해진 순간마다 배너만 찍는다. 개발 서버(3002)가 떠 있어야 한다.
import { chromium } from "playwright";
import fs from "node:fs";
const [out, view = "desktop", locale = "ko"] = process.argv.slice(2);
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
const VIEWS = { desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, narrow: { viewport: { width: 320, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
// 찍을 순간(ms, 장면이 닫힌 상태로 돌아온 때부터)
const TIMES = (process.env.HERO_TIMES || "0,500,900,1150,1350,1600,2000,2300,2600,4200,6500,6900").split(",").map(Number);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ ...VIEWS[view], locale: locale === "en" ? "en-US" : locale === "zh" ? "zh-CN" : "ko-KR" });
const page = await context.newPage();
const errors = []; page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 140)); });
await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
const hero = page.locator(".v-hero");
await hero.waitFor();
// 한 바퀴가 시작되는 순간(closed)을 기다린다
await page.waitForFunction(() => document.querySelector(".v-hero")?.getAttribute("data-phase") === "closed", null, { timeout: 20000 });
const t0 = Date.now(); const shots = [];
for (const t of TIMES) {
  const wait = t - (Date.now() - t0); if (wait > 0) await page.waitForTimeout(wait);
  const at = Date.now() - t0; const phase = await hero.getAttribute("data-phase");
  const buf = await hero.screenshot(); shots.push({ t, at, phase, b64: buf.toString("base64") });
}
// 프레임 간격(성능): 한 바퀴 동안의 실제 프레임 시간
const perf = await page.evaluate(() => new Promise((resolve) => { const a = []; let last = performance.now(); const start = last; const tick = (now) => { a.push(now - last); last = now; if (now - start < 3000) requestAnimationFrame(tick); else { const s = [...a].slice(2).sort((x, y) => x - y); resolve({ n: s.length, avg: +(s.reduce((p, c) => p + c, 0) / s.length).toFixed(1), p95: +s[Math.floor(s.length * 0.95)].toFixed(1), max: +s[s.length - 1].toFixed(1) }); } }; requestAnimationFrame(tick); }));
const box = await hero.boundingBox();
const cols = view === "desktop" ? 2 : 4;
const sheet = await browser.newPage({ viewport: { width: view === "desktop" ? 1500 : 1700, height: 900 }, deviceScaleFactor: 1 });
await sheet.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#161616;color:#bbb;font:13px/1.4 "Malgun Gothic",system-ui;padding:16px}.g{display:grid;grid-template-columns:repeat(${cols},1fr);gap:12px}.g div{min-width:0}.g img{display:block;width:100%;border-radius:8px}.g p{margin:0 0 4px}</style><div class="g">${shots.map((s) => `<div><p>${s.t}ms (실제 ${s.at}ms), ${s.phase}</p><img src="data:image/png;base64,${s.b64}"></div>`).join("")}</div>`, { waitUntil: "load" });
await sheet.waitForTimeout(300);
await sheet.screenshot({ path: `${out}/hero-${view}-${locale}.png`, fullPage: true });
await browser.close();
console.log(JSON.stringify({ view, locale, size: box && { w: Math.round(box.width), h: Math.round(box.height) }, perf, errors }));
