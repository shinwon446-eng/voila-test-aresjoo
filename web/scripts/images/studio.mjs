// 실제 상품 사진을 우리 톤으로: 배경을 걷어내고 같은 어두운 스튜디오 배경(검정, 가운데 은은한 조명, 4:3, 같은 여백)에 올린다.
//   node scripts/images/studio.mjs [--only id,id] [--force] [--extra photo-a.webp,photo-b.webp]
//   --extra 는 Commons 가 아닌 파일(Unsplash 커버 등)도 같은 톤으로 만든다. 키는 "file:<원본 파일명>"
// 입력: public/assets/photography/commons-<id>.webp (sources.json 의 것들). 출력: public/assets/photography/studio-<id>.webp
// 결과는 scripts/images/studio.json 에 { id: "studio-<id>.webp" } 로 적고, lib/productImages.ts 가 있으면 그것을 먼저 쓴다.
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { removeBackground } from "@imgly/background-removal-node";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const only = (args.includes("--only") ? args[args.indexOf("--only") + 1] : "").split(",").filter(Boolean);
const force = args.includes("--force");
const extra = (args.includes("--extra") ? args[args.indexOf("--extra") + 1] : "").split(",").filter(Boolean);
const dir = new URL("../../public/assets/photography/", import.meta.url);
const sources = JSON.parse(readFileSync(new URL("sources.json", import.meta.url), "utf8"));
const generatedPath = new URL("generated.json", import.meta.url);
const generated = existsSync(generatedPath) ? JSON.parse(readFileSync(generatedPath, "utf8")) : {};
const rawDir = new URL("gen-raw/", import.meta.url);
const outPath = new URL("studio.json", import.meta.url);
const studio = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : {};

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
let n = 0;
// 생성 이미지(generated.json, 원본은 scripts/images/gen-raw/<id>.png)도 같은 캔버스에 올린다. 실제 사진(sources.json)이 있는 상품은 사진이 먼저다.
const genJobs = Object.entries(generated).filter(([id]) => !sources[id]).map(([id, g]) => [id, { ...g, raw: true }]);
const jobs = extra.length ? extra.map((file) => ["file:" + file, { file }]) : [...Object.entries(sources), ...genJobs];
for (const [id, s] of jobs) {
  if (only.length && !only.some((o) => id.includes(o))) continue;
  const base = id.startsWith("file:") ? id.slice(5).replace(/.webp$/, "") : id;
  const target = new URL(`studio-${base}.webp`, dir);
  if (existsSync(target) && !force) { studio[id] = `studio-${base}.webp`; continue; }
  const src = new URL(s.file, s.raw ? rawDir : dir);
  if (!existsSync(src)) continue;
  try {
    const input = new Blob([readFileSync(src)], { type: s.file.endsWith(".png") ? "image/png" : "image/webp" });
    const cut = await removeBackground(input, { output: { format: "image/png", quality: 1 } });
    const png = Buffer.from(await cut.arrayBuffer()).toString("base64");
    // 1200x900 캔버스. 바탕은 검정에 가까운 회색, 가운데 아래쪽에 은은한 빛. 상품은 폭 78% 안에, 바닥에 희미한 그림자.
    const webp = await page.evaluate(async (dataUrl) => {
      const img = new Image(); img.src = dataUrl; await img.decode();
      const W = 1200, H = 900; const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
      const bg = g.createRadialGradient(W / 2, H * 0.62, 40, W / 2, H * 0.62, W * 0.75);
      bg.addColorStop(0, "#2b2b2b"); bg.addColorStop(0.55, "#161616"); bg.addColorStop(1, "#0a0a0a");
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      // 알파가 있는 부분의 경계 상자를 찾아 꽉 차게 맞춘다
      const t = document.createElement("canvas"); t.width = img.width; t.height = img.height; const tg = t.getContext("2d"); tg.drawImage(img, 0, 0);
      const d = tg.getImageData(0, 0, t.width, t.height).data; let x0 = t.width, y0 = t.height, x1 = 0, y1 = 0;
      for (let y = 0; y < t.height; y++) for (let x = 0; x < t.width; x++) { if (d[(y * t.width + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
      if (x1 <= x0 || y1 <= y0) return null;
      const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
      const scale = Math.min((W * 0.78) / bw, (H * 0.72) / bh);
      const dw = bw * scale, dh = bh * scale, dx = (W - dw) / 2, dy = (H - dh) / 2 + H * 0.04;
      // 바닥 그림자
      const sh = g.createRadialGradient(W / 2, dy + dh, 10, W / 2, dy + dh, dw * 0.55);
      sh.addColorStop(0, "rgba(0,0,0,0.55)"); sh.addColorStop(1, "rgba(0,0,0,0)");
      g.save(); g.scale(1, 0.22); g.fillStyle = sh; g.fillRect(0, (dy + dh) / 0.22 - dw * 0.6, W, dw * 1.2); g.restore();
      g.drawImage(img, x0, y0, bw, bh, dx, dy, dw, dh);
      return c.toDataURL("image/webp", 0.84).split(",")[1];
    }, "data:image/png;base64," + png);
    if (!webp) { console.log(id, "cutout empty"); continue; }
    writeFileSync(target, Buffer.from(webp, "base64"));
    studio[id] = `studio-${base}.webp`;
    n += 1;
    console.log(id, "studio ok");
  } catch (e) { console.log(id, "failed:", String(e).slice(0, 120)); }
}
await browser.close();
// 출처(sources.json)가 없는 상품의 스튜디오 판은 지운다. reject 뒤에 남은 옛 파일이 다시 화면에 오르지 않게
for (const id of Object.keys(studio)) {
  if (id.startsWith("file:") || sources[id] || generated[id]) continue;
  const stale = new URL(studio[id], dir);
  if (existsSync(stale)) unlinkSync(stale);
  delete studio[id];
  console.log(id, "dropped (no source)");
}
writeFileSync(outPath, JSON.stringify(studio, null, 2) + "\n");
console.log("studio.json", Object.keys(studio).length, "new", n);
