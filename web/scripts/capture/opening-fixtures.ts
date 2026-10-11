// 개봉 연출 검수용 시험 고정값. 결과를 조작하지 않는다: 실제 계산식(HMAC-SHA256(serverSeed, "clientSeed:nonce"))에
// 넣었을 때 원하는 결과가 나오는 시드와 회차를 찾아 적어 둘 뿐이다. 운영 결과와는 아무 관계가 없다.
//   npx tsx scripts/capture/opening-fixtures.ts            → scripts/capture/opening-fixtures.json
// 하나짜리: 박스마다 결과 종류별 회차 하나. 연속: 0번부터 차례로 열었을 때 정해진 흐름이 나오는 clientSeed.
// 확률표(lib/products.ts)가 바뀌면 다시 돌려야 한다. 2026-10-11 사다리 확률표(받는 값 기준 99%, 당첨 구간 1배에서 500배, 낮은 결과 0.05배와 0.25배) 기준.
import { createHash, createHmac } from "node:crypto";
import { writeFileSync } from "node:fs";
import { BOXES, LOW_TIERS, dropTable, sellValueOf, type ProductItem } from "../../lib/products";
import { rollRanges, ROLL_RANGE } from "../../lib/fairness";

const SERVER_SEED = "opening-fixture-server-seed";
const serverSeedHash = createHash("sha256").update(SERVER_SEED).digest("hex");
const rollOf = (clientSeed: string, nonce: number) => parseInt(createHmac("sha256", SERVER_SEED).update(`${clientSeed}:${nonce}`).digest("hex").slice(0, 8), 16) % ROLL_RANGE;

type Step = number | "item";
const out: Record<string, unknown> = { serverSeed: SERVER_SEED, serverSeedHash, boxes: {} };
const describe = (i: ProductItem) => ({ itemId: i.id, value: i.value, kind: i.kind, sell: sellValueOf(i), odds: i.dropRate });

for (const slug of ["dollar-apple", "vault-gold", "vault-handbag"]) {
  const box = BOXES.find((b) => b.slug === slug)!;
  const table = dropTable(box);
  const ranges = rollRanges(table);
  const itemAt = (roll: number) => ranges.find((r) => roll <= r.to)!.item;
  const wave = (multiple: number) => table.find((i) => i.id.startsWith("wave-") && i.value === +(box.price * multiple).toFixed(2))?.id;
  // 사진이 있는 실물만(결과 화면의 상품 구도를 보려는 것이다)
  const physical = table.filter((i) => i.kind === "physical" && i.image.src).sort((a, b) => b.value - a.value);
  const wants: Record<string, string | undefined> = {
    low: wave(LOW_TIERS[0]), low2: wave(LOW_TIERS[1]), x1: wave(1), x2: wave(2), x4: wave(4), x8: wave(8), x15: wave(15),
    itemTop: physical[0]?.id, itemMid: physical[Math.floor(physical.length / 2)]?.id, itemLow: physical[physical.length - 1]?.id,
  };
  const clientSeed = "opening-fixture-client";
  const single: Record<string, ReturnType<typeof describe> & { clientSeed: string; nonce: number }> = {};
  const pending = new Map(Object.entries(wants).filter(([, id]) => id).map(([k, id]) => [id!, k]));
  for (let nonce = 0; nonce < 40_000_000 && pending.size; nonce++) {
    const item = itemAt(rollOf(clientSeed, nonce));
    const kind = pending.get(item.id);
    if (kind) { single[kind] = { clientSeed, nonce, ...describe(item) }; pending.delete(item.id); }
  }
  // 연속: 0번부터 차례로. 숫자는 USDT 구간의 배수, "item" 은 USDT 가 아닌 상품 아무거나
  const matches = (item: ProductItem, step: Step) => (step === "item" ? !item.id.startsWith("wave-") && item.kind !== "cash" : item.id.startsWith("wave-") && item.value === +(box.price * step).toFixed(2));
  const L = LOW_TIERS[0];
  const sequences: Record<string, Step[]> = {
    lowLowLowHighHighHigh: [L, L, L, 2, 2, 2],
    fiveLowThenBig: [L, L, L, L, L, 8],
    tenSmall: Array(10).fill(L),
    smallBigSmall: [L, 8, L],
    threeBig: [4, 2, 4],
    mixed: [LOW_TIERS[1], 2, L, 1, 4],
    withItem: [L, "item", L, 2, L],
  };
  const seq: Record<string, { clientSeed: string; nonce: number; steps: ReturnType<typeof describe>[] }> = {};
  for (const [name, pattern] of Object.entries(sequences)) {
    for (let n = 0; n < 8_000_000; n++) {
      const cs = `opening-seq-${name}-${n}`;
      const items = pattern.map((_, i) => itemAt(rollOf(cs, i)));
      if (items.every((item, i) => matches(item, pattern[i]))) { seq[name] = { clientSeed: cs, nonce: 0, steps: items.map(describe) }; break; }
    }
  }
  (out.boxes as Record<string, unknown>)[slug] = { price: box.price, single, sequences: seq, notFound: Array.from(pending.values()) };
  console.log(slug, "single", Object.keys(single).join(","), "seq", Object.keys(seq).join(","), "missing", Array.from(pending.values()).join(",") || "none");
}
writeFileSync(new URL("opening-fixtures.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
