// candidates.json 에서 상품마다 첫 후보를 picks.json 에 적는다. 내려받은 뒤 사람이 한 장씩 보고 안 맞는 것은 picks.json 에서 지우거나 바꾼다.
//   node scripts/images/pick-first.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const cands = JSON.parse(readFileSync(new URL("candidates.json", import.meta.url), "utf8"));
const path = new URL("picks.json", import.meta.url);
const picks = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
let added = 0;
for (const [id, list] of Object.entries(cands)) {
  if (!list.length || picks[id]) continue;
  picks[id] = list[0].title;
  added += 1;
}
writeFileSync(path, JSON.stringify(picks, null, 2) + "\n");
console.log("picks", Object.keys(picks).length, "added", added);
