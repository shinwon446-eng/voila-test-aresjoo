// 새 카탈로그에서 사진이 없는 상품을 사진 만들 차례대로 뽑는다(Codex 입력용 줄).
//   npx tsx scripts/catalog2/img-list.ts                         → 카테고리별 개수(단계마다)
//   npx tsx scripts/catalog2/img-list.ts <category> <단계> [--skip-done]
// 단계: 박스마다 값이 큰 것부터 몇 개까지를 뽑는지.
//   1 = 박스의 얼굴 하나(홈 카드와 박스 화면 맨 위에 나온다)
//   2 = 값이 큰 것 넷까지
//   3 = 값이 큰 것 열둘까지
//   4 = 전부
// 여러 박스에 든 상품은 한 번만 나온다. 포켓몬 카드(이름에 세트 번호가 있는 카드)는 뺀다: 그림 도구로 만들지 않는다(qa/codex/gen-rules-pkm.md).
import { existsSync } from "node:fs";
import { V2_BOXES, faceItems } from "../../lib/products";
import { CATEGORIES_V2 } from "../../lib/catalogTypes";

const args = process.argv.slice(2);
const skipDone = args.includes("--skip-done");
const [category, stageArg] = args.filter((a) => !a.startsWith("--"));
const DEPTH = [0, 1, 4, 12, 1000];
const rawDir = new URL("../images/gen-raw/", import.meta.url);
/** 카드 한 장인가: 세트 안의 번호(4/102)나 등급(PSA 10)이 이름에 있다 */
const isCard = (nameEn: string) => /\b\d{1,3}\/\d{2,3}\b|\b(PSA|BGS|CGC)\s?\d/.test(nameEn);

function pick(cat: string, depth: number) {
  const seen = new Set<string>();
  const out: { id: string; nameEn: string; name: string }[] = [];
  for (const box of V2_BOXES.filter((b) => b.category === cat)) {
    // 박스의 얼굴 순서(자기 상품이 먼저, 값이 큰 것부터)
    const top = faceItems(box).slice(0, depth);
    for (const item of top) {
      if (seen.has(item.id) || item.image.src || isCard(item.nameEn)) continue;
      seen.add(item.id);
      if (skipDone && existsSync(new URL(`${item.id}.png`, rawDir))) continue;
      out.push(item);
    }
  }
  return out;
}

if (!category) {
  for (const cat of CATEGORIES_V2) {
    const boxes = V2_BOXES.filter((b) => b.category === cat).length;
    if (!boxes) continue;
    console.log(cat.padEnd(10), "박스", String(boxes).padStart(2), "단계별 사진 없는 상품", [1, 2, 3, 4].map((s) => pick(cat, DEPTH[s]).length).join(" / "));
  }
} else {
  // 단계 자리에 d30 처럼 적으면 박스마다 그 개수까지(img-plan.mjs 가 박스마다 고르게 채울 때 쓴다)
  const depth = /^d\d+$/.test(stageArg ?? "") ? Number((stageArg ?? "").slice(1)) : DEPTH[Math.min(4, Math.max(1, Number(stageArg) || 1))];
  for (const item of pick(category, depth)) console.log(`- ${item.id} | ${item.nameEn} (${item.name})`);
}
