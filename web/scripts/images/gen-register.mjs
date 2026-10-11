// Codex 가 만든 원본(scripts/images/gen-raw/<id>.png)을 generated.json 에 올리거나 뺀다. 그다음 studio.mjs 가 같은 톤으로 만든다.
//   node scripts/images/gen-register.mjs                 → gen-raw 에 있는 것 전부 등록
//   node scripts/images/gen-register.mjs --drop id,id    → 검수에서 떨어진 것을 뺀다(원본과 스튜디오 판도 지운다)
import { readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync } from "node:fs";
const args = process.argv.slice(2);
const drop = (args.includes("--drop") ? args[args.indexOf("--drop") + 1] : "").split(",").filter(Boolean);
const rawDir = new URL("gen-raw/", import.meta.url);
const outDir = new URL("../../public/assets/photography/", import.meta.url);
const path = new URL("generated.json", import.meta.url);
const studioPath = new URL("studio.json", import.meta.url);
const generated = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
const studio = existsSync(studioPath) ? JSON.parse(readFileSync(studioPath, "utf8")) : {};
const sources = JSON.parse(readFileSync(new URL("sources.json", import.meta.url), "utf8"));
const CREDIT = "생성 이미지 (Codex 이미지 생성), 참고용";
if (drop.length) {
  for (const id of drop) {
    for (const f of [new URL(`${id}.png`, rawDir), new URL(`studio-${id}.webp`, outDir)]) if (existsSync(f)) unlinkSync(f);
    delete generated[id];
    if (!sources[id]) delete studio[id];
    console.log(id, "dropped");
  }
  writeFileSync(studioPath, JSON.stringify(studio, null, 2) + "\n");
} else if (existsSync(rawDir)) {
  for (const f of readdirSync(rawDir).filter((n) => n.endsWith(".png")).sort()) {
    const id = f.slice(0, -4);
    if (sources[id]) { console.log(id, "skip (실제 사진 있음)"); continue; }
    if (!generated[id]) { generated[id] = { file: f, credit: CREDIT }; console.log(id, "registered"); }
  }
}
const sorted = Object.fromEntries(Object.entries(generated).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(path, JSON.stringify(sorted, null, 2) + "\n");
console.log("generated.json", Object.keys(sorted).length);
