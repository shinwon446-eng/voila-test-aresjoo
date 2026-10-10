/**
 * PRODUCTS.md 를 만든다: 박스마다 가격, 상품 수, 구간별 상품 수와 확률, 현금 환급률, 정가 환급률, 최고 상품가, 사진 확보율.
 *   npm run products:md
 * 숫자는 전부 lib/products.ts 의 확률표에서 계산한 값이다(화면과 추첨이 쓰는 같은 데이터).
 */
import { writeFileSync } from "node:fs";
import { BOXES, CATALOG_ODDS_VERSION, cashReturn, ceilingValue, retailReturn } from "../lib/products";
import { TIERS, tierOf } from "../lib/tiers";

const pct = (rate: number) => `${Number(rate.toFixed(4))}%`;
const money = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const lines: string[] = [];
lines.push("# 상품 구성과 기대값", "", `확률표 버전 \`${CATALOG_ODDS_VERSION}\`. 이 표는 \`npm run products:md\` 로 \`web/lib/products.ts\` 에서 계산해 만든다. 손으로 고치지 않는다.`, "",
  "- 현금 환급률: 받을 수 있는 USDT 기준 기대값 / 박스 가격(실물과 기프트카드는 시중 정가의 95%, USDT 상품은 100%). 모든 박스가 95%에 맞춰져 있다.",
  "- 정가 환급률: 시중 정가 기준 기대값 / 박스 가격.",
  "- 구간은 박스 가격의 배수로 나눈다(화면과 같다). 구간 확률은 그 안의 상품 확률의 합이다.",
  "- 실물과 기프트카드는 각각 백만분의 1(0.0001%)이고, 좋은 상품을 많이 넣어도 한 상품의 확률은 그대로다. 상품 가치 합이 커지면 5배 드롭의 몫이 줄어 환급률이 맞는다.", "");
lines.push("| 박스 | 가격 | 상품 수(실물, 기프트카드, USDT) | 최고 상품가 | 현금 환급률 | 정가 환급률 | 사진 있는 실물 |", "|---|---:|---|---:|---:|---:|---:|");
for (const box of BOXES) {
  const physical = box.items.filter((i) => i.kind === "physical"), digital = box.items.filter((i) => i.kind === "digital"), cash = box.items.filter((i) => i.kind === "cash");
  const photos = physical.filter((i) => i.image.src).length;
  lines.push(`| ${box.title} (\`${box.slug}\`) | ${money(box.price)} | ${box.items.length} (${physical.length}, ${digital.length}, ${cash.length}) | ${money(ceilingValue(box))} | ${(cashReturn(box) * 100).toFixed(2)}% | ${(retailReturn(box) * 100).toFixed(2)}% | ${photos} / ${physical.length} |`);
}
lines.push("", "## 박스별 구간");
for (const box of BOXES) {
  lines.push("", `### ${box.title} (${money(box.price)} USDT)`, "", "| 구간 | 상품 수 | 구간 확률 | 가장 비싼 상품 | 가장 싼 상품 |", "|---|---:|---:|---|---|");
  for (const tier of TIERS) {
    const items = box.items.filter((i) => tierOf(i.value, box.price).key === tier.key).sort((a, b) => b.value - a.value);
    if (!items.length) continue;
    const label = tier.key === "royal" ? "20배 이상" : tier.key === "prestige" ? "6배 이상" : tier.key === "executive" ? "2배 이상" : "2배 미만";
    lines.push(`| ${label} | ${items.length} | ${pct(items.reduce((s, i) => s + i.dropRate, 0))} | ${items[0].name} (${money(items[0].value)}) | ${items[items.length - 1].name} (${money(items[items.length - 1].value)}) |`);
  }
  const noPhoto = box.items.filter((i) => i.kind === "physical" && !i.image.src);
  if (noPhoto.length) lines.push("", `사진 없는 실물 ${noPhoto.length}종: ${noPhoto.map((i) => i.name).join(", ")}`);
}
writeFileSync(new URL("../../PRODUCTS.md", import.meta.url), lines.join("\n") + "\n");
console.log("PRODUCTS.md", BOXES.length, "boxes", BOXES.reduce((s, b) => s + b.items.length, 0), "items");
