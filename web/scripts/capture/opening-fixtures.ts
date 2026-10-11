// 개봉 연출 검수용 시험 고정값. 결과를 조작하지 않는다: 실제 계산식(HMAC-SHA256(serverSeed, "clientSeed:nonce"))에
// 넣었을 때 원하는 결과가 나오는 시드와 회차를 찾아 적어 둘 뿐이다. 운영 결과와는 아무 관계가 없다.
//   npx tsx scripts/capture/opening-fixtures.ts            → scripts/capture/opening-fixtures.json
// 하나짜리: 박스마다 결과 종류별 회차 하나. 연속: 0번부터 차례로 열었을 때 정해진 흐름이 나오는 clientSeed.
import { createHash, createHmac } from "node:crypto";
import { writeFileSync } from "node:fs";
import { BOXES, dropTable } from "../../lib/products";
import { rollRanges, ROLL_RANGE } from "../../lib/fairness";

const SERVER_SEED = "opening-fixture-server-seed";
const serverSeedHash = createHash("sha256").update(SERVER_SEED).digest("hex");
const rollOf = (clientSeed: string, nonce: number) => parseInt(createHmac("sha256", SERVER_SEED).update(`${clientSeed}:${nonce}`).digest("hex").slice(0, 8), 16) % ROLL_RANGE;

type Kind = "small" | "near" | "x2" | "x5" | "x15" | "physicalTop" | "physicalMid";
const out: Record<string, unknown> = { serverSeed: SERVER_SEED, serverSeedHash, boxes: {} };

for (const slug of ["dollar-apple", "vault-gold", "vault-handbag"]) {
  const box = BOXES.find((b) => b.slug === slug)!;
  const table = dropTable(box);
  const ranges = rollRanges(table);
  const itemAt = (roll: number) => ranges.find((r) => roll <= r.to)!.item;
  const physical = table.filter((i) => i.kind === "physical" && i.image.src).sort((a, b) => b.value - a.value);
  const wants: Record<Kind, string | undefined> = {
    small: table.find((i) => i.id.startsWith("wave-cashback-") && i.value === +(box.price * 0.5).toFixed(2))?.id,
    near: table.find((i) => i.id.startsWith("wave-cashback-") && i.value === +(box.price * 0.99).toFixed(2))?.id,
    x2: table.find((i) => i.id.startsWith("wave-gift-") && i.value === box.price * 2)?.id,
    x5: table.find((i) => i.id.startsWith("wave-drop-") && i.value === box.price * 5)?.id,
    x15: table.find((i) => i.id.startsWith("wave-gift-") && i.value === box.price * 15)?.id,
    physicalTop: physical[0]?.id,
    physicalMid: physical[Math.floor(physical.length / 2)]?.id,
  };
  // 하나짜리: clientSeed 는 고정, 회차만 찾는다
  const clientSeed = "opening-fixture-client";
  const single: Record<string, { clientSeed: string; nonce: number; itemId: string; value: number }> = {};
  const pending = new Map(Object.entries(wants).filter(([, id]) => id).map(([k, id]) => [id!, k]));
  for (let nonce = 0; nonce < 30_000_000 && pending.size; nonce++) {
    const item = itemAt(rollOf(clientSeed, nonce));
    const kind = pending.get(item.id);
    if (kind) { single[kind] = { clientSeed, nonce, itemId: item.id, value: item.value }; pending.delete(item.id); }
  }
  // 연속: 0번부터 차례로. 값의 배수로 흐름을 적는다(0.5 = 절반, 2 = 두 배 ...)
  const mult = (roll: number) => +(itemAt(roll).value / box.price).toFixed(2);
  const sequences: Record<string, number[]> = {
    lowLowLowHighHighHigh: [0.5, 0.5, 0.5, 2, 2, 2],
    tenSmall: Array(10).fill(0.5),
    smallBigSmall: [0.5, 5, 0.5],
    threeBig: [5, 2, 5],
    mixed: [0.8, 2, 0.5, 0.99, 5],
  };
  const seq: Record<string, { clientSeed: string; nonce: number; multiples: number[] }> = {};
  for (const [name, pattern] of Object.entries(sequences)) {
    for (let n = 0; n < 5_000_000; n++) {
      const cs = `opening-seq-${name}-${n}`;
      if (pattern.every((m, i) => mult(rollOf(cs, i)) === m)) { seq[name] = { clientSeed: cs, nonce: 0, multiples: pattern }; break; }
    }
  }
  (out.boxes as Record<string, unknown>)[slug] = { price: box.price, single, sequences: seq, notFound: Array.from(pending.values()) };
  console.log(slug, "single", Object.keys(single).join(","), "seq", Object.keys(seq).join(","), "missing", Array.from(pending.values()).join(",") || "none");
}
writeFileSync(new URL("opening-fixtures.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
