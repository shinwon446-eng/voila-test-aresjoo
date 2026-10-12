// 새 카탈로그에서 사진이 없는 상품을 전부 적는다(포켓몬 카드처럼 img-list.ts 가 빼는 것도 넣는다). web 폴더에서 실행.
//   npx tsx scripts/catalog2/img-missing.ts            → 카테고리별 개수와 합계
//   npx tsx scripts/catalog2/img-missing.ts --list     → 탭으로 나눈 목록(카테고리, id, 이름, 참고가, 든 박스 수, 박스 이름 몇 개)
import { V2_BOXES } from "../../lib/products";

const list = process.argv.includes("--list");
const rows = new Map<string, { category: string; id: string; name: string; value: number; boxes: string[] }>();
let slots = 0, emptySlots = 0;
const total = new Set<string>();
for (const box of V2_BOXES) {
  for (const item of box.items) {
    if (item.kind === "cash") continue;
    slots++; total.add(item.id);
    if (item.image.src) continue;
    emptySlots++;
    const row = rows.get(item.id) ?? { category: box.category ?? "", id: item.id, name: item.name, value: item.value, boxes: [] };
    row.boxes.push(box.title);
    rows.set(item.id, row);
  }
}
if (list) {
  for (const r of Array.from(rows.values()).sort((a, b) => a.category.localeCompare(b.category) || b.value - a.value)) {
    console.log([r.category, r.id, r.name, r.value, r.boxes.length, r.boxes.slice(0, 3).join(", ")].join("\t"));
  }
} else {
  const by = new Map<string, number>();
  for (const r of Array.from(rows.values())) by.set(r.category, (by.get(r.category) ?? 0) + 1);
  by.forEach((n, cat) => console.log(cat.padEnd(10), n));
  console.log(`사진 없는 상품 ${rows.size} / 전체 상품 ${total.size}, 박스 칸으로는 ${emptySlots} / ${slots}`);
}
