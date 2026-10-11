// 생성 이미지 대상 목록을 Codex 프롬프트 뒤에 붙일 줄로 뽑는다.
//   node scripts/images/gen-list.mjs <prefix,prefix> [--only id,id] [--skip-done]
//   예: node scripts/images/gen-list.mjs bg-,gd- --skip-done
// 사진(sources.json)이 이미 있는 상품과, --skip-done 이면 gen-raw 에 원본이 있는 상품은 뺀다.
import { readFileSync, readdirSync, existsSync } from "node:fs";
const [prefixArg = "", ...rest] = process.argv.slice(2);
const prefixes = prefixArg.split(",").filter(Boolean);
const only = (rest.includes("--only") ? rest[rest.indexOf("--only") + 1] : "").split(",").filter(Boolean);
const skipDone = rest.includes("--skip-done");
const sources = JSON.parse(readFileSync(new URL("sources.json", import.meta.url), "utf8"));
const rawDir = new URL("gen-raw/", import.meta.url);
const catalog = new URL("../../lib/catalog/", import.meta.url);
// 이름만으로 모양을 알기 어려운 것만 한 줄 덧붙인다
const HINT = {
  "bg-silk-scarf": "좁고 긴 실크 스카프 하나, 느슨하게 한 번 접힌 모습",
  "bg-bag-organizer": "펠트 소재 가방 속 정리함, 칸막이가 보이게",
  "bg-bag-charm": "가죽 가방 참 하나, 고리 포함",
  "bg-dust-bag-set": "무지 면 더스트백 세 장을 겹쳐 놓은 모습, 글자 없음",
  "bg-gucci-belt": "가죽 벨트 하나를 둥글게 말아 놓은 모습, 버클이 앞으로",
  "gd-coin-1oz": "금화 한 닢, 앞면에 단풍잎 하나, 글자는 '1 OZ' 와 '9999' 만",
  "gd-scale": "작은 디지털 주얼리 저울, 화면은 꺼짐",
  "gd-jewelry-box": "닫힌 가죽 주얼리 박스 하나",
  "gd-mikimoto-strand": "아코야 진주 한 줄 목걸이, 둥글게 놓음",
  "gd-pandora-set": "참이 몇 개 달린 실버 참 팔찌 하나",
  "gd-swarovski-set": "크리스털 목걸이 하나와 귀걸이 한 쌍",
  "gd-silver-100oz": "은괴 하나, 각인은 '100 OZ' 와 '999' 만",
  "gd-silver-10oz": "은괴 하나, 각인은 '10 OZ' 와 '999' 만",
  "gd-platinum-1oz": "플래티넘 바 하나, 각인은 '1 OZ' 와 '999.5' 만",
};
for (const f of readdirSync(catalog)) {
  const text = readFileSync(new URL(f, catalog), "utf8");
  for (const m of text.matchAll(/\["([a-z0-9-]+)", "([^"]+)", "([^"]+)", "[^"]+", (\d+)\]/g)) {
    const [, id, ko, en] = m;
    if (!prefixes.some((p) => id.startsWith(p))) continue;
    if (only.length && !only.includes(id)) continue;
    if (sources[id]) continue;
    if (skipDone && existsSync(new URL(`${id}.png`, rawDir))) continue;
    console.log(`- ${id} | ${en} (${ko})${HINT[id] ? " | " + HINT[id] : ""}`);
  }
}
