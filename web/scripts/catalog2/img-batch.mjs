// 새 카탈로그의 사진 만들 목록을 Codex 입력 묶음으로 나눈다. web 폴더에서 실행.
//   node scripts/catalog2/img-batch.mjs <category> <단계> <범주 규칙 파일 또는 -> [묶음 크기=22]
// 만드는 것(저장소 루트 기준): qa/codex/gen-list-v2-<category>-s<단계>-<nn>.txt, qa/codex/gen-input-v2-<category>-s<단계>-<nn>.md
// 마지막 줄에 묶음 이름(태그)들을 적는다. 그 태그들을 저장소 루트에서 bash web/scripts/images/gen-run.sh <동시 개수> <태그...> 에 준다.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [category, stage = "1", rules = "-", sizeArg = "22"] = process.argv.slice(2);
if (!category) { console.log("카테고리를 준다"); process.exit(1); }
const size = Number(sizeArg) || 22;
const rootDir = path.resolve("..");
const lines = execFileSync("npx", ["tsx", "scripts/catalog2/img-list.ts", category, stage, "--skip-done"], { encoding: "utf8", shell: true }).split(/\r?\n/).filter((l) => l.startsWith("- "));
const base = fs.readFileSync(path.join(rootDir, "qa/codex/gen-images-prompt.md"), "utf8").replace(/\r\n/g, "\n").replace(/\n+$/, "").split("\n");
const head = base.slice(0, -1).join("\n");
const listHeader = base[base.length - 1];
const rulesText = rules === "-" ? "" : fs.readFileSync(path.join(rootDir, rules), "utf8").replace(/\r\n/g, "\n").trimEnd() + "\n\n";
const tags = [];
for (let i = 0; i * size < lines.length; i++) {
  const tag = `v2-${category}-s${stage}-${String(i).padStart(2, "0")}`;
  const chunk = lines.slice(i * size, (i + 1) * size).join("\n") + "\n";
  fs.writeFileSync(path.join(rootDir, `qa/codex/gen-list-${tag}.txt`), chunk);
  fs.writeFileSync(path.join(rootDir, `qa/codex/gen-input-${tag}.md`), head + "\n" + rulesText + listHeader + "\n" + chunk);
  tags.push(tag);
}
console.log(`${category} 단계 ${stage}: 상품 ${lines.length}개, 묶음 ${tags.length}개`);
console.log(tags.join(" "));
