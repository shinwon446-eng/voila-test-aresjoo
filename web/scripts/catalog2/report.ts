// 새 카탈로그의 박스마다 확률표가 어떻게 나왔는지 본다.
//   npx tsx scripts/catalog2/report.ts            → 박스마다 한 줄
//   npx tsx scripts/catalog2/report.ts <slug>     → 그 박스의 구간별 표
import { V2_BOXES, LADDER, LOW_SPLIT, cashReturn, retailReturn, mostCommon, type ProductBox } from "../../lib/products";

const pct = (n: number) => n.toFixed(2) + "%";
function bands(box: ProductBox) {
  const P = box.price;
  const rows: [string, number, number][] = [["절반 미만", 0, 0], ["절반 이상 가격 미만", 0, 0], ...LADDER.map((b): [string, number, number] => [b.multiple + "배", 0, 0])];
  for (const item of box.items) {
    const k = item.value < P * LOW_SPLIT ? 0 : item.value < P ? 1 : 2 + Math.max(0, LADDER.findIndex((b) => item.value / P >= b.from && item.value / P < b.to));
    rows[k][1] += 1; rows[k][2] += item.dropRate;
  }
  return rows;
}

const slug = process.argv[2];
if (slug) {
  const box = V2_BOXES.find((b) => b.slug === slug);
  if (!box) { console.log("없는 박스:", slug); process.exit(1); }
  console.log(box.slug, box.title, "$" + box.price, "상품", box.items.length);
  for (const [label, n, rate] of bands(box)) console.log(label.padEnd(14), "상품", String(n).padStart(3), "확률", pct(rate).padStart(9));
  const common = mostCommon(box);
  console.log("가장 흔한 결과:", common.name, "$" + common.value, pct(common.dropRate));
  console.log("참고가 기준", (retailReturn(box) * 100).toFixed(2) + "%", "USDT 로 받을 때", (cashReturn(box) * 100).toFixed(2) + "%");
} else {
  console.log("새 카탈로그 박스", V2_BOXES.length);
  for (const box of V2_BOXES) {
    const rows = bands(box);
    const win = rows.slice(2).reduce((sum, r) => sum + r[2], 0);
    const lowValue = box.items.filter((i) => i.value < box.price).reduce((sum, i) => sum + i.value * i.dropRate, 0) / Math.max(1e-9, rows[0][2] + rows[1][2]);
    console.log(box.slug.padEnd(26), ("$" + box.price).padStart(5), "낸 값 이상", pct(win).padStart(7), "낮은 결과 평균", ("$" + lowValue.toFixed(2)).padStart(9), "(" + (lowValue / box.price).toFixed(2) + "배)", "참고가 기준", (retailReturn(box) * 100).toFixed(2) + "%");
  }
}
