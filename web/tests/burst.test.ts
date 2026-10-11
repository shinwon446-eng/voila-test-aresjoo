// 이 파일의 BOXES 는 옛 박스(사다리 방식)만이다. 새 카탈로그의 박스(실물 전용)는 tests/physical.test.ts 가 본다
// 터짐 게이지(lib/burst)와 그것을 장부에 쓰는 구매 모듈(lib/opening)의 규칙.
import test from "node:test";
import assert from "node:assert/strict";
import { BURST, EMPTY_POT, burstGauge, burstPayout, burstSeed, burstStep, potAfterOpen } from "../lib/burst";
import { LEGACY_BOXES as BOXES, cashReturn, sellValueOf, type ProductBox } from "../lib/products";
import { createOpeningPurchase } from "../lib/opening";
import { useWalletStore } from "../stores/walletStore";
import { useInventoryStore } from "../stores/inventoryStore";
import { useFairStore } from "../stores/fairStore";

const CRYPTO = { crypto: 1, card: 0 };

test("게이지: 열 때마다 박스 가격의 10%가 쌓이고, 터지면 시작 금액과 쌓인 금액 전부를 받는다", () => {
  assert.equal(burstSeed(1), 10);
  assert.equal(burstStep(1), 0.1);
  assert.equal(burstGauge(1, null), 10, "한 번도 안 연 계정의 게이지는 시작 금액이다");
  let pot = EMPTY_POT;
  for (let i = 0; i < 7; i++) pot = potAfterOpen(pot, 1, CRYPTO);
  assert.equal(burstGauge(1, pot), 10.7);
  assert.deepEqual(burstPayout(pot, 1, CRYPTO), { amount: 10.7, ratio: { crypto: 1, card: 0 } });
  // 값이 큰 박스도 센트가 어긋나지 않는다
  for (const price of [1, 3, 5, 20, 25, 30, 50, 100]) {
    let p = EMPTY_POT; for (let i = 0; i < 333; i++) p = potAfterOpen(p, price, CRYPTO);
    assert.equal(burstGauge(price, p), +(price * (BURST.seed + BURST.share * 333)).toFixed(2), `가격 ${price}`);
  }
});

test("게이지: 카드로 쌓은 몫은 카드 쪽으로만 돌아간다", () => {
  let pot = EMPTY_POT;
  for (let i = 0; i < 10; i++) pot = potAfterOpen(pot, 20, { crypto: 0, card: 1 }); // 카드로 열 번: 20 USDT 가 카드 몫으로 쌓인다
  assert.deepEqual(pot, { crypto: 0, card: 20 });
  // 그 뒤 USDT 입금분으로 열어 터졌다: 쌓인 카드 몫 20 은 카드로, 시작 금액 200 과 이번 몫 2 는 이번 돈의 출처(USDT)로
  pot = potAfterOpen(pot, 20, CRYPTO);
  const pay = burstPayout(pot, 20, CRYPTO);
  assert.equal(pay.amount, 222);
  assert.ok(Math.abs(pay.ratio.card - 20 / 222) < 1e-9 && Math.abs(pay.ratio.crypto - 202 / 222) < 1e-9);
});

test("확률표: 박스마다 터짐이 한 칸 있고, 게이지 몫까지 넣어 받는 값 기준 99%다", () => {
  for (const box of BOXES) {
    const burst = box.items.filter((i) => i.id === BURST.id);
    assert.equal(burst.length, 1, box.slug);
    assert.equal(burst[0].kind, "cash");
    assert.equal(Math.round(burst[0].dropRate * 10_000), BURST.slots, `${box.slug}: 터짐의 칸 수는 모든 박스가 같다`);
    assert.equal(burst[0].value, burstSeed(box.price), `${box.slug}: 표에 적는 값은 시작 금액`);
    const table = box.items.reduce((sum, i) => sum + (sellValueOf(i) * i.dropRate) / 100, 0) / box.price;
    assert.ok(Math.abs(table + BURST.share - cashReturn(box)) < 1e-9, `${box.slug}: 기대 비율에 게이지 몫이 들어간다`);
    assert.ok(Math.abs(cashReturn(box) - 0.99) <= 0.0005, `${box.slug}: ${cashReturn(box)}`);
  }
  // 터짐의 배수가 사다리의 USDT 구간과 겹치지 않는다(표에서 서로 다른 줄이어야 한다)
  assert.ok(![1, 2, 4, 8, 15, 40, 100, 250, 500].includes(BURST.seed));
});

// ── 구매 모듈
function reset(crypto = 1000, card = 0) {
  useWalletStore.setState({ cryptoBalance: crypto, cardBalance: card, balance: crypto + card, transactions: [], totalWagered: 0, burst: {} });
  useInventoryStore.setState({ items: [] });
  useFairStore.setState({ serverSeed: "b".repeat(128), serverSeedHash: "hash", clientSeed: "burst-test", nonce: 0 });
}
const base = BOXES.find((b) => b.slug === "vault-gold")!;
const lowItem = base.items.find((i) => i.id.startsWith("wave-cashback-"))!;
const burstItem = base.items.find((i) => i.id === BURST.id)!;
/** 항상 같은 것만 나오는 시험용 박스(가격 50). 게이지는 박스 이름(slug)으로 이어진다 */
const only = (item: typeof lowItem): ProductBox => ({ ...base, items: [{ ...item, dropRate: 100 }] });

test("구매: 터짐이 아니면 게이지만 쌓이고 잔액은 결과만큼만 움직인다", async () => {
  reset(1000);
  await createOpeningPurchase(only(lowItem), 3, "op_burst_a")();
  const w = useWalletStore.getState();
  assert.deepEqual(w.burst[base.slug], { crypto: 15, card: 0 }, "세 번 × 5 USDT");
  assert.equal(w.balance, +(1000 - 150 + lowItem.value * 3).toFixed(2));
});

test("구매: 터지면 그때의 게이지를 받고, 게이지는 비고, 기록에는 실제로 받은 금액이 남는다", async () => {
  reset(1000);
  await createOpeningPurchase(only(lowItem), 4, "op_burst_b")(); // 20 USDT 쌓임
  const before = useWalletStore.getState().balance;
  const [result] = await createOpeningPurchase(only(burstItem), 1, "op_burst_c")();
  const w = useWalletStore.getState();
  assert.equal(result.item.value, 525, "시작 금액 500 + 쌓인 20 + 이번 몫 5");
  assert.equal(w.balance, +(before - 50 + 525).toFixed(2));
  assert.deepEqual(w.burst[base.slug], { crypto: 0, card: 0 });
  const record = useInventoryStore.getState().items.find((i) => i.id === result.ownedId)!;
  assert.equal(record.valueUsdt, 525);
  assert.equal(record.status, "SOLD");
  assert.equal(record.soldForUsdt, 525);
  assert.equal(result.tier.key, "prestige", "등급은 실제로 받은 금액(10.5배)에서 나온다");
});

test("구매: 한 묶음 안에서 두 번 터지면 둘째는 다시 쌓인 만큼만 받는다", async () => {
  reset(1000);
  const results = await createOpeningPurchase(only(burstItem), 2, "op_burst_d")();
  assert.deepEqual(results.map((r) => r.item.value), [505, 505], "각각 시작 금액 500 + 그 한 번의 몫 5");
  assert.deepEqual(useWalletStore.getState().burst[base.slug], { crypto: 0, card: 0 });
});

test("구매: 실패하면 게이지도 열기 전으로 돌아간다", async () => {
  reset(1000);
  await createOpeningPurchase(only(lowItem), 2, "op_burst_e")();
  const potBefore = useWalletStore.getState().burst[base.slug];
  const original = useWalletStore.getState().addTransaction;
  useWalletStore.setState({ addTransaction: ((tx: Parameters<typeof original>[0]) => { if (tx.type === "open") throw new Error("injected"); return original(tx); }) as typeof original });
  await assert.rejects(createOpeningPurchase(only(burstItem), 1, "op_burst_f")());
  useWalletStore.setState({ addTransaction: original });
  assert.deepEqual(useWalletStore.getState().burst[base.slug], potBefore, "터짐으로 비워졌던 게이지가 되돌아왔다");
});

test("구매: 카드로 쌓은 게이지가 터지면 그 몫은 카드 잔액으로 간다(USDT 잔액으로 새지 않는다)", async () => {
  reset(0, 500);
  await createOpeningPurchase(only(lowItem), 4, "op_burst_g")(); // 카드로 200 사용, 게이지에 카드 몫 20
  const w1 = useWalletStore.getState();
  assert.deepEqual(w1.burst[base.slug], { crypto: 0, card: 20 });
  assert.equal(w1.cryptoBalance, 0, "카드로 연 결과는 카드 잔액으로만 돌아온다");
  // USDT 입금분 50 을 넣고 그 돈으로 열어 터졌다
  useWalletStore.setState({ cryptoBalance: 50, balance: +(50 + w1.cardBalance).toFixed(2) });
  const cardBefore = useWalletStore.getState().cardBalance;
  await createOpeningPurchase(only(burstItem), 1, "op_burst_h")();
  const w2 = useWalletStore.getState();
  assert.equal(+(w2.cardBalance - cardBefore).toFixed(2), 20, "카드로 쌓은 20 은 카드 잔액으로");
  assert.equal(w2.cryptoBalance, 505, "시작 금액 500 과 이번 몫 5 는 이번에 낸 돈의 출처(USDT)로");
});

test("길게 돌리면 표와 게이지를 합쳐 99% 근처로 돌아온다(게이지에 남은 금액 포함)", () => {
  // 운영 표를 그대로 쓰고, 고르게 뽑는 난수로 30만 번. 게이지 규칙은 lib/burst 의 함수를 그대로 쓴다
  const box = BOXES.find((b) => b.slug === "dollar-galaxy")!;
  const cum: { to: number; value: number; burst: boolean }[] = []; let acc = 0;
  for (const i of box.items) { acc += Math.round(i.dropRate * 10_000); cum.push({ to: acc, value: sellValueOf(i), burst: i.id === BURST.id }); }
  let state = 12345; const rnd = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return Math.floor((state / 4294967296) * 1_000_000); };
  let pot = EMPTY_POT; let paid = 0; let bursts = 0; const N = 300_000;
  for (let n = 0; n < N; n++) {
    const roll = rnd(); const hit = cum.find((c) => roll < c.to) ?? cum[cum.length - 1];
    pot = potAfterOpen(pot, box.price, CRYPTO);
    if (hit.burst) { paid += burstPayout(pot, box.price, CRYPTO).amount; pot = EMPTY_POT; bursts++; } else paid += hit.value;
  }
  const back = (paid + pot.crypto + pot.card) / (N * box.price);
  assert.ok(bursts > 1500 && bursts < 2300, `터짐 ${bursts}회(기대 1,875)`);
  assert.ok(back > 0.9 && back < 1.08, `돌아온 비율 ${back}`);
});
