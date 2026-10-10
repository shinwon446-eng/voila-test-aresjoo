// Unsplash 사진 한 장을 받아 WebP 로 저장하고 출처 대장에 적는다(Unsplash License).
//   node scripts/images/unsplash-one.mjs <photo id> <파일 이름> "<저작자>"
//   예: node scripts/images/unsplash-one.mjs KtTF68ZjBak pokemon-cover "Erik Mclean"
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { chromium } from "playwright";

const [id, name, author = "Unsplash"] = process.argv.slice(2);
if (!id || !name) { console.log("사용법: node scripts/images/unsplash-one.mjs <photo id> <파일 이름> \"<저작자>\""); process.exit(1); }
const dir = new URL("../../public/assets/photography/", import.meta.url);
const file = `unsplash-${name}.webp`;
const target = new URL(file, dir);
const res = await fetch(`https://unsplash.com/photos/${id}/download?force=true&w=1600`, { headers: { "User-Agent": "voila-image-sourcing/2.0 (test site)" } });
if (!res.ok) throw new Error("Unsplash 응답 " + res.status);
const buf = Buffer.from(await res.arrayBuffer());
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const dataUrl = "data:" + (res.headers.get("content-type") || "image/jpeg") + ";base64," + buf.toString("base64");
const webp = await page.evaluate(async (src) => {
  const img = new Image(); img.src = src; await img.decode();
  const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas"); canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/webp", 0.82).split(",")[1];
}, dataUrl);
await browser.close();
writeFileSync(target, Buffer.from(webp, "base64"));
const ledger = new URL("ATTRIBUTION.md", dir);
const row = `| ${file} | https://unsplash.com/photos/${id} (${author}, Unsplash License) |\n`;
if (!existsSync(ledger) || !readFileSync(ledger, "utf8").includes(file)) writeFileSync(ledger, (existsSync(ledger) ? readFileSync(ledger, "utf8").trimEnd() + "\n" : "") + row);
console.log("saved", file, buf.length, "bytes →", Buffer.from(webp, "base64").length);
