// 사람이 보고 안 맞는 사진을 뺀다. 파일을 지우고 picks.json 과 sources.json 에서 지운다.
//   node scripts/images/reject.mjs <id> <id> ...          → 그 상품은 사진 없음으로
//   node scripts/images/reject.mjs --next <id> <id> ...   → 다음 후보로 바꾼다(있으면). 그다음 fetch --only 로 다시 받는다
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";

const args = process.argv.slice(2);
const next = args.includes("--next");
const ids = args.filter((a) => a !== "--next");
const dir = new URL("../../public/assets/photography/", import.meta.url);
const cands = JSON.parse(readFileSync(new URL("candidates.json", import.meta.url), "utf8"));
const picksPath = new URL("picks.json", import.meta.url);
const sourcesPath = new URL("sources.json", import.meta.url);
const picks = JSON.parse(readFileSync(picksPath, "utf8"));
const sources = existsSync(sourcesPath) ? JSON.parse(readFileSync(sourcesPath, "utf8")) : {};
for (const id of ids) {
  const file = new URL(`commons-${id}.webp`, dir);
  if (existsSync(file)) unlinkSync(file);
  delete sources[id];
  const list = cands[id] ?? [];
  const at = list.findIndex((c) => c.title === picks[id]);
  if (next && list[at + 1]) { picks[id] = list[at + 1].title; console.log(id, "→ 다음 후보:", picks[id]); }
  else { delete picks[id]; console.log(id, "→ 사진 없음"); }
}
writeFileSync(picksPath, JSON.stringify(picks, null, 2) + "\n");
writeFileSync(sourcesPath, JSON.stringify(sources, null, 2) + "\n");
// 출처 대장에서도 뺀다(fetch 가 다시 쓰지만 중간 상태도 맞춰 둔다)
const ledgerPath = new URL("ATTRIBUTION-commons.md", dir);
if (existsSync(ledgerPath)) {
  const keep = readFileSync(ledgerPath, "utf8").split("\n").filter((l) => !ids.some((id) => l.startsWith(`| commons-${id}.webp |`)));
  writeFileSync(ledgerPath, keep.join("\n"));
}
