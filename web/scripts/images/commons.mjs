// Wikimedia Commons 에서 상품 사진 후보를 찾고(검색), 내려받아 WebP 로 바꾸고(fetch), 출처 대장을 쓴다.
//   node scripts/images/commons.mjs search [--only id,id]   → scripts/images/candidates.json 에 상품마다 후보 3개(파일명, 크기, 라이선스, 저작자, 미리보기 주소)
//   node scripts/images/commons.mjs fetch  [--only id,id]   → scripts/images/picks.json 에 고른 것만 public/assets/photography/commons-<id>.webp 로 저장하고 ATTRIBUTION 에 적는다
// 규칙: 초당 한 번만 요청한다(Commons 가 막는다). 사진은 사람이 상품과 맞는지 확인한 뒤(picks.json) 내려받는다. CC BY, CC BY-SA, CC0, Public domain 만 받는다.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright";

const API = "https://commons.wikimedia.org/w/api.php";
const UA = "voila-image-sourcing/2.0 (test site; contact via repository)";
const ROOT = new URL("../../", import.meta.url);
const [mode, ...rest] = process.argv.slice(2);
const only = (rest.includes("--only") ? rest[rest.indexOf("--only") + 1] : "").split(",").filter(Boolean);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BAD = /teardown|broken|event|exhibition|museum|wrist|hand|person|man |woman|people|unboxing|packaging|logo|icon|diagram|map|drawing|screenshot|interior|engine bay|dashboard|wheel\b|badge|emblem|crash|damaged|toy|model car|diecast|lego|19[0-9]0s|wikidata/i;
const OK_LICENSE = /^(cc-by-sa-4\.0|cc-by-4\.0|cc-by-sa-3\.0|cc-by-3\.0|cc0|pd|public domain|cc-by-sa-2\.0|cc-by-2\.0)/i;

async function api(params) {
  const url = API + "?" + new URLSearchParams({ format: "json", ...params });
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    const text = await res.text();
    if (text.startsWith("{")) return JSON.parse(text);
    await sleep(8000 * (attempt + 1));
  }
  throw new Error("Commons API 응답 없음: " + url);
}

/** 상품 목록: lib/products.ts 를 tsx 로 읽는다 */
async function loadItems() {
  const { BOXES } = await import("tsx/esm/api").then((m) => m.tsImport("../../lib/products.ts", import.meta.url));
  const seen = new Map();
  for (const box of BOXES) for (const item of box.items) if (item.kind === "physical" && !seen.has(item.id)) seen.set(item.id, { id: item.id, name: item.name, query: item.nameEn, box: box.slug });
  return [...seen.values()];
}

async function search(items) {
  const out = existsSync(new URL("candidates.json", import.meta.url)) ? JSON.parse(readFileSync(new URL("candidates.json", import.meta.url), "utf8")) : {};
  for (const item of items) {
    if (only.length && !only.some((o) => item.id.includes(o))) continue;
    if (out[item.id]?.length) continue;
    const q = item.query.replace(/\(.*?\)/g, "").replace(/\b(set of \d+|with .*|\d+GB|\d+TB|\d+m\b)/gi, "").trim();
    const data = await api({ action: "query", generator: "search", gsrsearch: q + " filetype:bitmap", gsrnamespace: 6, gsrlimit: 12, prop: "imageinfo", iiprop: "url|size|extmetadata", iiurlwidth: 1200 });
    await sleep(2600);
    const pages = Object.values(data.query?.pages ?? {});
    const cands = pages.map((p) => {
      const info = p.imageinfo?.[0]; const meta = info?.extmetadata ?? {};
      return { title: p.title.replace(/^File:/, ""), width: info?.width, height: info?.height, license: meta.LicenseShortName?.value ?? "", licenseId: meta.License?.value ?? "", author: (meta.Artist?.value ?? "").replace(/<[^>]+>/g, "").trim(), thumb: info?.thumburl, url: info?.url, page: info?.descriptionurl };
    }).filter((c) => c.width >= 900 && c.height >= 600 && !BAD.test(c.title) && OK_LICENSE.test(c.licenseId || c.license)).slice(0, 4);
    out[item.id] = cands;
    console.log(item.id, "|", q, "→", cands.length, cands[0]?.title ?? "");
  }
  writeFileSync(new URL("candidates.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
}

/** picks.json: { "<item id>": "<파일 제목>" }. 사람이 후보에서 고른 것만 받는다. */
async function fetchPicks(items) {
  const cands = JSON.parse(readFileSync(new URL("candidates.json", import.meta.url), "utf8"));
  const picks = JSON.parse(readFileSync(new URL("picks.json", import.meta.url), "utf8"));
  const dir = new URL("public/assets/photography/", ROOT);
  mkdirSync(dir, { recursive: true });
  const ledgerPath = new URL("public/assets/photography/ATTRIBUTION-commons.md", ROOT);
  const ledger = existsSync(ledgerPath) ? readFileSync(ledgerPath, "utf8") : "# Wikimedia Commons photography\n\n상품 사진. 파일마다 저작자와 라이선스를 적는다(CC BY, CC BY-SA 는 표기 의무).\n\n| Local file | Item | Source page | Author | License |\n| --- | --- | --- | --- | --- |\n";
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  // --only 로 일부만 받을 때도 나머지 출처는 지우지 않는다
  const sourcesPath = new URL("sources.json", import.meta.url);
  const rows = []; const sources = only.length && existsSync(sourcesPath) ? JSON.parse(readFileSync(sourcesPath, "utf8")) : {};
  for (const item of items) {
    const title = picks[item.id]; if (!title) continue;
    if (only.length && !only.some((o) => item.id.includes(o))) continue;
    const c = (cands[item.id] ?? []).find((x) => x.title === title); if (!c) { console.log(item.id, "후보에 없음:", title); continue; }
    const file = `commons-${item.id}.webp`; const target = new URL(file, dir);
    if (!existsSync(target)) {
      const res = await fetch(c.thumb, { headers: { "User-Agent": UA } }); const buf = Buffer.from(await res.arrayBuffer());
      await sleep(2600);
      // 1200 폭으로 받은 JPEG 을 브라우저 캔버스로 WebP(품질 0.82)로 바꾼다. 긴 변 1200 이하.
      const dataUrl = "data:" + (res.headers.get("content-type") || "image/jpeg") + ";base64," + buf.toString("base64");
      const webp = await page.evaluate(async (src) => {
        const img = new Image(); img.src = src; await img.decode();
        const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas"); canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/webp", 0.82).split(",")[1];
      }, dataUrl);
      writeFileSync(target, Buffer.from(webp, "base64"));
      console.log(item.id, "saved", file, c.license);
    }
    // 출처 대장은 고른 것 전체로 매번 다시 쓴다(이미 받은 파일도 줄이 있어야 한다)
    rows.push(`| ${file} | ${item.id} | ${c.page} | ${c.author || "unknown"} | ${c.license} |`);
    sources[item.id] = { file, credit: `${c.author || "Wikimedia Commons"}, ${c.license}, via Wikimedia Commons` };
  }
  await browser.close();
  if (rows.length) writeFileSync(ledgerPath, ledger.split("\n").filter((l) => !l.startsWith("| commons-")).join("\n").trimEnd() + "\n" + rows.join("\n") + "\n");
  writeFileSync(new URL("sources.json", import.meta.url), JSON.stringify(sources, null, 2) + "\n");
  console.log("sources.json", Object.keys(sources).length);
}

const items = await loadItems();
if (mode === "search") await search(items);
else if (mode === "fetch") await fetchPicks(items);
else console.log("사용법: node scripts/images/commons.mjs search|fetch [--only id,id]");
