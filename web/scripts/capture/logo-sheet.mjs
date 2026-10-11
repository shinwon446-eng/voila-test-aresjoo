// 로고 시안 비교판. brand/logo-drafts 의 <글자>-logo.svg, <글자>-icon.svg 를 읽어 한 장으로 찍는다.
//   node scripts/capture/logo-sheet.mjs            → brand/logo-drafts/sheet.png (전체), sheet-header.png (실제 머리글 크기만)
// 2026-10-11 시안 C 로 확정했다. 이 도구는 다음에 로고를 다시 볼 때를 위해 남긴다("지금 로고" 칸은 그 전의 로고다).
// 시안마다: 크게, 실제 머리글 크기(휴대폰 390 폭, 로고 높이 26), 아이콘 64/32/16, 흰 바탕, 한 색(강조색 없이).
import { chromium } from "playwright";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const dir = new URL("../../../brand/logo-drafts/", import.meta.url);
const NAMES = { a: "A 뚜껑", b: "B 억음 부호", c: "C 주소", d: "D", e: "E", f: "F" };
const notes = fs.existsSync(new URL("names.json", dir)) ? JSON.parse(fs.readFileSync(new URL("names.json", dir), "utf8")) : {};
const read = (name) => { const u = new URL(name, dir); return fs.existsSync(u) ? fs.readFileSync(u, "utf8").replace(/<!--[\s\S]*?-->/g, "").trim() : null; };
const drafts = Object.keys(NAMES).map((k) => ({ k, name: notes[k] ?? NAMES[k], logo: read(`${k}-logo.svg`), icon: read(`${k}-icon.svg`) })).filter((d) => d.logo);
// 한 색으로만 찍었을 때: 강조색을 본체 색으로 바꾼다
const mono = (svg) => svg.replace(/#d9c39a/gi, "currentColor");
const current = `<span style="font:900 27px/1 Pretendard,Inter,system-ui,sans-serif;letter-spacing:-0.065em">VOILA</span><svg viewBox="0 0 16 16" style="height:12px;margin-left:6px;color:#d9c39a" fill="currentColor"><path d="M8 0 10.15 5.85 16 8l-5.85 2.15L8 16l-2.15-5.85L0 8l5.85-2.15Z"/></svg>`;
const header = (inner) => `<div class="phone"><div class="bar"><span class="lg">${inner}</span><span class="pill">로그인</span><span class="pill sq"><i></i><i></i><i></i></span></div></div>`;

const html = `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{background:#000;color:#fff;font:15px/1.5 Pretendard,"Malgun Gothic",system-ui,sans-serif;padding:40px;width:1440px}
h1{font-size:28px;font-weight:400;margin-bottom:6px} p.sub{color:#9a9a9a;margin-bottom:28px}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.card{border:1px solid rgba(255,255,255,.15);border-radius:26px;padding:28px;display:flex;flex-direction:column;gap:22px}
.card h2{font-size:17px;font-weight:600}
.big{display:flex;align-items:center;justify-content:center;height:150px;background:#0b0b0b;border-radius:18px}
.big svg{height:84px;width:auto}
.row{display:flex;align-items:center;gap:20px;flex-wrap:wrap}
.phone{width:390px;background:#000;border:1px solid rgba(255,255,255,.15);border-radius:18px;padding:10px 16px}
.bar{display:flex;align-items:center;gap:8px;height:44px}
.lg{display:inline-flex;align-items:center;margin-right:auto;color:#fff}
.lg svg{height:26px;width:auto}
.pill{display:inline-flex;align-items:center;justify-content:center;height:44px;padding:0 18px;border-radius:999px;background:#2f2f2f;font-size:14px;color:#ececec}
.pill.sq{width:44px;padding:0;flex-direction:column;gap:4px} .pill.sq i{display:block;width:16px;height:2px;background:#ececec;border-radius:2px}
.icons{display:flex;align-items:flex-end;gap:14px}
.ico{display:flex;align-items:center;justify-content:center;background:#1b1b1b;border-radius:22%}
.ico svg{width:72%;height:72%}
.white{display:inline-flex;align-items:center;height:56px;padding:0 20px;border-radius:14px;background:#fff;color:#000}
.white svg{height:26px;width:auto}
.monoc{display:inline-flex;align-items:center;height:56px;padding:0 20px;border-radius:14px;background:#0b0b0b;color:#fff}
.monoc svg{height:26px;width:auto}
.lab{color:#9a9a9a;font-size:12px}
</style>
<h1>VOILA 로고 시안</h1><p class="sub">voila.gg. 시안마다 크게, 실제 머리글 크기(휴대폰 폭 390, 로고 높이 26), 아이콘 64, 32, 16, 흰 바탕, 한 색. 맨 아래는 지금 로고.</p>
<div class="grid">
${drafts.map((d) => `<div class="card" id="card-${d.k}"><h2>${d.name}</h2>
<div class="big">${d.logo}</div>
${header(d.logo)}
<div class="row">${d.icon ? `<div class="icons">${[64, 32, 16].map((s) => `<span class="ico" style="width:${s}px;height:${s}px">${d.icon}</span>`).join("")}</div>` : ""}<span class="white">${d.logo}</span><span class="monoc">${mono(d.logo)}</span></div>
</div>`).join("\n")}
<div class="card" id="card-now"><h2>지금 로고</h2><div class="big"><span style="display:inline-flex;align-items:center;transform:scale(2.6)">${current}</span></div>${header(current)}</div>
</div>
<div id="headers" style="margin-top:40px;display:grid;grid-template-columns:repeat(3,390px);gap:16px">
${[...drafts.map((d) => `<div><div class="lab" style="margin-bottom:6px">${d.name}</div>${header(d.logo)}</div>`), `<div><div class="lab" style="margin-bottom:6px">지금 로고</div>${header(current)}</div>`].join("\n")}
</div>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1520, height: 1000 }, deviceScaleFactor: 1.5 });
await page.setContent(html, { waitUntil: "load" });
const out = (name) => fileURLToPath(new URL(name, dir));
await page.screenshot({ path: out("sheet.png"), fullPage: true });
await page.locator("#headers").screenshot({ path: out("sheet-header.png") });
for (const d of drafts) await page.locator(`#card-${d.k}`).screenshot({ path: out(`sheet-${d.k}.png`) });
await browser.close();
console.log("시안 " + drafts.map((d) => d.k).join(", "));
