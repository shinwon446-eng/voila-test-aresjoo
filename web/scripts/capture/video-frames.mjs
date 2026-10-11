// 참고 영상에서 장면을 뽑는다(ffmpeg 없이 크롬의 영상 재생으로).
//   node scripts/capture/video-frames.mjs <영상 파일> <출력 폴더> [장수=12]
import { chromium } from "playwright";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const [file, out, countText] = process.argv.slice(2);
const count = Number(countText ?? 12);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(pathToFileURL(file).href);
await page.waitForFunction(() => { const v = document.querySelector("video"); return v && v.readyState >= 1 && Number.isFinite(v.duration); }, null, { timeout: 30000 });
const info = await page.evaluate(() => { const v = document.querySelector("video"); v.pause(); v.muted = true; return { duration: v.duration, w: v.videoWidth, h: v.videoHeight }; });
console.log(JSON.stringify(info));
await page.setViewportSize({ width: Math.min(1600, info.w), height: Math.min(1000, Math.round((Math.min(1600, info.w) / info.w) * info.h)) });
await page.addStyleTag({ content: "html,body{margin:0;background:#000}video{position:fixed;inset:0;width:100vw;height:100vh;object-fit:contain}video::-webkit-media-controls{display:none!important}" });
for (let i = 0; i < count; i++) {
  const t = (info.duration * (i + 0.5)) / count;
  await page.evaluate((time) => new Promise((resolve) => { const v = document.querySelector("video"); v.addEventListener("seeked", () => requestAnimationFrame(() => requestAnimationFrame(resolve)), { once: true }); v.currentTime = time; }), t);
  await page.screenshot({ path: `${out}/f${String(i + 1).padStart(2, "0")}-${t.toFixed(1)}s.png` });
}
await browser.close();
