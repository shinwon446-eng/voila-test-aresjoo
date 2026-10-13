// 박스의 가격대와 대표 상품을 카테고리별로 적는다(전체 박스의 순서를 정할 때 본다). web 폴더에서 실행.
//   npx tsx scripts/catalog2/box-stat.ts
import { HOME_BOXES, faceOf } from "../../lib/products";

const bands = [1, 5, 20, 100, 500, Infinity];
const bandOf = (p: number) => bands.findIndex((b) => p <= b);
const byCat = new Map<string, { n: number; photo: number; band: number[]; min: number; max: number; lead: string }>();
for (const box of HOME_BOXES) {
  const face = faceOf(box);
  const row = byCat.get(box.category) ?? { n: 0, photo: 0, band: bands.map(() => 0), min: Infinity, max: 0, lead: "" };
  row.n++;
  if (face?.image.src) row.photo++;
  row.band[bandOf(box.price)]++;
  row.min = Math.min(row.min, box.price);
  row.max = Math.max(row.max, box.price);
  if (!row.lead && face) row.lead = face.name + " $" + face.value;
  byCat.set(box.category, row);
}
console.log(["category", "boxes", "withPhoto", "<=1", "<=5", "<=20", "<=100", "<=500", ">500", "min", "max", "lead"].join("\t"));
byCat.forEach((r, c) => console.log([c, r.n, r.photo, ...r.band, r.min, r.max, r.lead].join("\t")));
const prices = HOME_BOXES.map((b) => b.price).sort((a, b) => a - b);
console.log("가격 분위", [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1].map((q) => prices[Math.min(prices.length - 1, Math.floor(q * prices.length))]).join(" "));
const ratios = HOME_BOXES.map((b) => (faceOf(b)?.value ?? 0) / b.price).sort((a, b) => a - b);
console.log("대표 상품가 나누기 박스값 분위", [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1].map((q) => Math.round(ratios[Math.min(ratios.length - 1, Math.floor(q * ratios.length))])).join(" "));
