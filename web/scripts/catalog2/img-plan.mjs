// 사진 만들 차례를 박스마다 고르게 짠다: 모든 카테고리를 박스마다 N개까지 먼저, 그다음 더 깊이. web 폴더에서 실행.
//   node scripts/catalog2/img-plan.mjs <이름표> <깊이,깊이,...> <카테고리> ...
//   예: node scripts/catalog2/img-plan.mjs q 30,60,1000 fashion mobile computer
// 생성 한도가 중간에 끊겨도 어느 박스나 비슷한 깊이까지 사진이 있게 하려는 것이다(2026-10-12 한도에 걸렸을 때 네 카테고리만 다 차고 나머지는 열둘에서 멈췄다).
// 만드는 것(저장소 루트 기준): qa/codex/gen-list-<태그>.txt, gen-input-<태그>.md, 그리고 차례를 적은 qa/codex/pool-<이름표>-plan.txt
// plan 의 한 줄은 "<카테고리>:<깊이> <태그> <태그> ...". img-pool2.sh 가 이 차례대로 생성하고 줄마다 변환, 커밋, 배포한다.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [label, depthArg, ...categories] = process.argv.slice(2);
if (!label || !depthArg || !categories.length) { console.log("이름표, 깊이들, 카테고리를 준다"); process.exit(1); }
const depths = depthArg.split(",").map(Number).filter(Boolean);
const SIZE = 22;
const rootDir = path.resolve("..");
const RULES = { car: "gen-rules-car.md", watch: "gen-rules-watch.md", home: "gen-rules-hm.md", mobile: "gen-rules-gear.md", computer: "gen-rules-gear.md", gaming: "gen-rules-gear.md", audio: "gen-rules-gear.md", camera: "gen-rules-gear.md" };
const base = fs.readFileSync(path.join(rootDir, "qa/codex/gen-images-prompt.md"), "utf8").replace(/\r\n/g, "\n").replace(/\n+$/, "").split("\n");
const head = base.slice(0, -1).join("\n");
const listHeader = base[base.length - 1];
const planned = new Set();
const plan = [];
let total = 0;
depths.forEach((depth, k) => {
  for (const category of categories) {
    const lines = execFileSync("npx", ["tsx", "scripts/catalog2/img-list.ts", category, "d" + depth, "--skip-done"], { encoding: "utf8", shell: true })
      .split(/\r?\n/).filter((l) => l.startsWith("- ")).filter((l) => !planned.has(l.split(" ")[1]));
    if (!lines.length) continue;
    for (const l of lines) planned.add(l.split(" ")[1]);
    const rulesText = RULES[category] ? fs.readFileSync(path.join(rootDir, "qa/codex", RULES[category]), "utf8").replace(/\r\n/g, "\n").trimEnd() + "\n\n" : "";
    const tags = [];
    for (let i = 0; i * SIZE < lines.length; i++) {
      const tag = `v2-${category}-${label}${k + 1}-${String(i).padStart(2, "0")}`;
      const chunk = lines.slice(i * SIZE, (i + 1) * SIZE).join("\n") + "\n";
      fs.writeFileSync(path.join(rootDir, `qa/codex/gen-list-${tag}.txt`), chunk);
      fs.writeFileSync(path.join(rootDir, `qa/codex/gen-input-${tag}.md`), head + "\n" + rulesText + listHeader + "\n" + chunk);
      tags.push(tag);
    }
    plan.push(`${category}:${depth} ${tags.join(" ")}`);
    total += lines.length;
    console.log(`${category} 깊이 ${depth}: 상품 ${lines.length}개, 묶음 ${tags.length}개`);
  }
});
fs.writeFileSync(path.join(rootDir, `qa/codex/pool-${label}-plan.txt`), plan.join("\n") + "\n");
console.log(`합계 상품 ${total}개, 줄 ${plan.length}개 → qa/codex/pool-${label}-plan.txt`);
