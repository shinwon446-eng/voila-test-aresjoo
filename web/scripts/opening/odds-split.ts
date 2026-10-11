// 기대 비율 99% 가 어디서 오는지 나눠 본다: USDT 결과의 몫과 상품의 몫, 구간별 확률. 운영 표를 읽기만 한다.
//   npx tsx scripts/opening/odds-split.ts [개봉 수]      (개봉 수를 주면 실제 추첨식으로도 돌려 본다)
// 시뮬레이션은 실제 추첨식(HMAC-SHA256(serverSeed, "clientSeed:nonce") 앞 8 hex, 100만으로 나눈 나머지)을 쓴다.
import { createHmac } from "node:crypto";
import { BOXES, LADDER, LOW_TIERS, bandIndexOf, dropTable, sellValueOf } from "../../lib/products";
import { rollRanges, ROLL_RANGE } from "../../lib/fairness";
import { BURST } from "../../lib/burst";

const N = Number(process.argv[2] ?? 0);
const pct = (x: number, d = 2) => (x * 100).toFixed(d) + "%";
console.log(["박스", "가격", "USDT 몫", "상품 몫", "게이지 몫", "합계", "상품 확률", ...LOW_TIERS.map((m) => m + "배"), "낸 값 이상", "8배 이상", "40배 이상", "100배 이상", ...(N ? ["시뮬 전체", "시뮬 상품 수", "100번 묶음 하위 10%", "중앙값", "상위 10%"] : [])].join(" | "));
for (const box of BOXES) {
  const table = dropTable(box);
  const wave = (i: { id: string }) => i.id.startsWith("wave-");
  const p = (f: (i: (typeof table)[number]) => boolean) => table.filter(f).reduce((s, i) => s + i.dropRate, 0) / 100;
  const ev = (f: (i: (typeof table)[number]) => boolean) => table.filter(f).reduce((s, i) => s + (sellValueOf(i) * i.dropRate) / 100, 0) / box.price;
  const burst = (i: { id: string }) => i.id === BURST.id;
  const row: (string | number)[] = [box.slug, box.price, pct(ev((i) => wave(i) && !burst(i))), pct(ev((i) => !wave(i))), pct(ev(burst) + BURST.share), pct(ev(() => true) + BURST.share, 3), pct(p((i) => !wave(i))),
    ...LOW_TIERS.map((m) => pct(p((i) => wave(i) && i.value === +(box.price * m).toFixed(2)))),
    pct(p((i) => sellValueOf(i) >= box.price)), pct(p((i) => i.value >= box.price * 8)), pct(p((i) => i.value >= box.price * 40), 3), pct(p((i) => i.value >= box.price * 100), 3)];
  if (N) {
    const ranges = rollRanges(table); let total = 0, prizes = 0, batch = 0, pot = 0; const batches: number[] = [];
    for (let n = 0; n < N; n++) {
      const roll = parseInt(createHmac("sha256", "odds-split-server-" + box.slug).update(`odds-split-client:${n}`).digest("hex").slice(0, 8), 16) % ROLL_RANGE;
      const item = ranges.find((r) => roll <= r.to)!.item; pot += box.price * BURST.share;
      let v = sellValueOf(item); if (burst(item)) { v += pot; pot = 0; }
      total += v; batch += v; if (!wave(item)) prizes++;
      if ((n + 1) % 100 === 0) { batches.push(batch / (100 * box.price)); batch = 0; }
    }
    batches.sort((a, b) => a - b); const q = (x: number) => pct(batches[Math.floor(batches.length * x)], 1);
    row.push(pct(total / (N * box.price)), prizes, q(0.1), q(0.5), q(0.9));
  }
  console.log(row.join(" | "));
}
console.log("\n구간별 상품 수(박스 x 구간 " + LADDER.map((b) => b.multiple + "배").join(", ") + ")");
for (const box of BOXES) { const n = LADDER.map(() => 0); for (const i of box.items) if (!i.id.startsWith("wave-")) n[bandIndexOf(i.value, box.price)]++; console.log(box.slug.padEnd(18), n.join("  ")); }
