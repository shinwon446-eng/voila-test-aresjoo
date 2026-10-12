// USDT로 받기 선택 시트의 돈 계약(flow/MELT_SPEC.md S1, S4, S7)
//   - 묶음으로 받아도 상품마다 한 번만 지급한다(같은 id 두 번, 같은 묶음 다시 부르기, 동시에 부르기, 한 개 받기와 겹치기)
//   - 금액과 출처 배분은 기존 takeUsdt 그대로다(상품마다 반올림, 카드 몫은 카드 잔액으로만)
//   - 잔액이 모자랄 때 화면이 말하는 숫자, 출금 칸에 채우는 금액
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import { takeUsdt } from "../lib/claim";
import { attributeRefunds, type FundingRatio } from "../lib/funding";
import { settleTake } from "../lib/openingSettle";
import { BOXES, REFUND_RATE } from "../lib/products";
import { heldForTake, mergeOutcomes, settleTakeMany, shortfallOf, takeAmountOf, takeQuote, withdrawPrefillUsdt } from "../lib/takeBatch";
import { useInventoryStore, type OwnedItem } from "../stores/inventoryStore";
import { useWalletStore } from "../stores/walletStore";

const physical = BOXES.flatMap((b) => b.items.map((item) => ({ item, box: b }))).find((x) => x.item.kind === "physical")!;
const CRYPTO: FundingRatio = { crypto: 1, card: 0 };
const CARD: FundingRatio = { crypto: 0, card: 1 };

/** 지갑을 비우고(원하면 잔액을 주고) 보관함에 상품을 넣는다. 넣은 순서대로 돌려준다 */
function seed(specs: { value: number; ratio?: FundingRatio }[], wallet: { crypto?: number; card?: number } = {}): OwnedItem[] {
  const crypto = wallet.crypto ?? 0; const card = wallet.card ?? 0;
  useWalletStore.setState({ cryptoBalance: crypto, cardBalance: card, balance: +(crypto + card).toFixed(2), transactions: [] });
  useInventoryStore.setState({ items: [] });
  return specs.map((spec) => useInventoryStore.getState().add([{ itemId: physical.item.id, boxSlug: physical.box.slug, valueUsdt: spec.value, tier: "royal", fundingRatio: spec.ratio, fair: { serverSeed: "s", serverSeedHash: "h", clientSeed: "c", nonce: 0, roll: 0 } }])[0]);
}
const wallet = () => useWalletStore.getState();
const sellbacks = () => wallet().transactions.filter((x) => x.type === "sellback");
const statusOf = (id: string) => useInventoryStore.getState().items.find((item) => item.id === id)?.status;
const each = (value: number) => +(value * REFUND_RATE).toFixed(2);

test("묶음 받기: 같은 id 가 두 번 들어와도 상품마다 한 번만 지급한다", async () => {
  const [a, b, c] = seed([{ value: 100 }, { value: 33.33 }, { value: 0.5 }]);
  const expected = +(each(100) + each(33.33) + each(0.5)).toFixed(2);

  const out = await settleTakeMany([a.id, a.id, b.id, c.id, b.id]);
  assert.equal(out.status, "settled");
  assert.deepEqual(out.taken.map((x) => x.id).sort(), [a.id, b.id, c.id].sort());
  assert.deepEqual(out.already, []);
  assert.deepEqual(out.left, []);
  assert.equal(out.amountUsdt, expected);
  assert.equal(wallet().cryptoBalance, expected);
  assert.equal(wallet().balance, expected);
  assert.equal(sellbacks().length, 1);
  assert.equal(sellbacks()[0].amountUsdt, expected);
  for (const item of [a, b, c]) assert.equal(statusOf(item.id), "SOLD");
});

test("묶음 받기: 같은 묶음을 다시 불러도 다시 주지 않고, 그때 받은 금액을 already 로 답한다", async () => {
  const [a, b] = seed([{ value: 100 }, { value: 40 }]);
  const first = await settleTakeMany([a.id, b.id]);
  const balance = wallet().cryptoBalance;

  const again = await settleTakeMany([a.id, b.id]);
  assert.equal(again.status, "settled");
  assert.deepEqual(again.taken, []);
  assert.equal(again.amountUsdt, 0);
  assert.equal(again.toCrypto, 0);
  assert.equal(again.toCard, 0);
  assert.deepEqual(again.already.map((x) => x.amountUsdt).sort(), first.taken.map((x) => x.amountUsdt).sort());
  assert.equal(wallet().cryptoBalance, balance);
  assert.equal(sellbacks().length, 1);
});

test("묶음 받기: 연달아 눌러 동시에 두 번 불러도 요청은 하나이고 한 번만 지급한다", async () => {
  const [a, b] = seed([{ value: 100 }, { value: 40 }]);
  const p1 = settleTakeMany([a.id, b.id]);
  const p2 = settleTakeMany([b.id, a.id]);
  assert.equal(p1, p2);
  await Promise.all([p1, p2]);
  assert.equal(wallet().cryptoBalance, +(each(100) + each(40)).toFixed(2));
  assert.equal(sellbacks().length, 1);
});

test("묶음 받기: 겹치는 다른 묶음, 한 개 받기와 동시에 불러도 상품마다 한 번만 지급한다", async () => {
  const [a, b, c] = seed([{ value: 100 }, { value: 40 }, { value: 20 }]);
  const [x, y, z] = await Promise.all([settleTakeMany([a.id, b.id]), settleTakeMany([b.id, c.id]), settleTake(a.id)]);
  const paid = [...x.taken, ...y.taken].map((t) => t.id).sort();
  assert.deepEqual(paid, [a.id, b.id, c.id].sort());
  assert.equal(x.amountUsdt + y.amountUsdt, +(each(100) + each(40) + each(20)).toFixed(2));
  // 한 개 받기는 이미 받은 것으로 답한다(다시 더하지 않는다)
  assert.deepEqual(z, { status: "settled", amountUsdt: each(100), already: true });
  assert.equal(wallet().cryptoBalance, +(each(100) + each(40) + each(20)).toFixed(2));
  assert.equal(sellbacks().reduce((sum, t) => sum + t.amountUsdt, 0), wallet().cryptoBalance);
});

test("묶음 받기: 금액은 상품마다 반올림해 더한다(합계에 95%를 한 번 곱하지 않는다)", async () => {
  const items = seed([{ value: 0.33 }, { value: 0.33 }, { value: 0.33 }]);
  assert.equal(takeAmountOf(items[0]), 0.31);
  const quote = takeQuote(items);
  assert.equal(quote.totalUsdt, 0.93);
  assert.notEqual(quote.totalUsdt, +(0.99 * REFUND_RATE).toFixed(2));
  const out = await settleTakeMany(items.map((item) => item.id));
  assert.equal(out.amountUsdt, 0.93);
  assert.equal(wallet().cryptoBalance, 0.93);
});

test("묶음 받기: 카드와 USDT 출처가 섞여도 배분은 takeUsdt 와 같다(카드 몫은 카드 잔액으로만)", async () => {
  const specs = [{ value: 100, ratio: CRYPTO }, { value: 50, ratio: CARD }, { value: 20, ratio: { crypto: 0.25, card: 0.75 } }, { value: 33.33, ratio: { crypto: 0.5, card: 0.5 } }];
  // 기준: 기존 함수로 받았을 때의 지갑
  const direct = seed(specs, { crypto: 7, card: 3 });
  takeUsdt(direct.map((item) => item.id));
  const reference = { crypto: wallet().cryptoBalance, card: wallet().cardBalance, tx: sellbacks()[0].amountUsdt };

  const items = seed(specs, { crypto: 7, card: 3 });
  const quote = takeQuote(items);
  const out = await settleTakeMany(items.map((item) => item.id));
  assert.equal(wallet().cryptoBalance, reference.crypto);
  assert.equal(wallet().cardBalance, reference.card);
  assert.equal(sellbacks()[0].amountUsdt, reference.tx);
  // 결과가 말하는 몫이 지갑에 실제로 들어간 몫과 같다
  assert.equal(out.toCrypto, +(reference.crypto - 7).toFixed(2));
  assert.equal(out.toCard, +(reference.card - 3).toFixed(2));
  assert.equal(+(out.toCrypto + out.toCard).toFixed(2), out.amountUsdt);
  // 미리 보여 준 숫자가 실제와 같다
  assert.deepEqual({ totalUsdt: quote.totalUsdt, toCrypto: quote.toCrypto, toCard: quote.toCard }, { totalUsdt: out.amountUsdt, toCrypto: out.toCrypto, toCard: out.toCard });
  // 식으로도 같다: 상품마다 95%를 반올림한 뒤 출처 비율대로
  const expected = attributeRefunds(specs.map((spec) => ({ amountUsdt: each(spec.value), ratio: spec.ratio })));
  assert.deepEqual({ toCrypto: out.toCrypto, toCard: out.toCard }, expected);
  // 카드로만 낸 상품의 몫은 출금할 수 있는 잔액으로 가지 않는다
  assert.ok(out.toCard >= each(50));
});

test("묶음 받기: 보관 중이 아닌 상품은 건드리지 않고 남은 것으로 답한다", async () => {
  const [held, requested] = seed([{ value: 100 }, { value: 60 }]);
  useInventoryStore.setState((s) => ({ items: s.items.map((o) => (o.id === requested.id ? { ...o, status: "SHIPPING_REQUESTED" as const } : o)) }));

  const out = await settleTakeMany([held.id, requested.id, "own_missing"]);
  assert.equal(out.status, "partial");
  assert.deepEqual(out.taken, [{ id: held.id, amountUsdt: each(100) }]);
  assert.deepEqual(out.left, [requested.id, "own_missing"]);
  assert.equal(statusOf(requested.id), "SHIPPING_REQUESTED");
  assert.equal(wallet().cryptoBalance, each(100));

  const none = await settleTakeMany([requested.id]);
  assert.equal(none.status, "failed");
  assert.equal(none.amountUsdt, 0);
  assert.equal(wallet().cryptoBalance, each(100));
  assert.equal(sellbacks().length, 1);
  assert.equal((await settleTakeMany([])).status, "failed");
});

test("다시 시도한 결과는 앞의 결과에 이어진다: 받은 것은 쌓이고 남은 것은 마지막 시도의 것", async () => {
  const [a, b] = seed([{ value: 100, ratio: CRYPTO }, { value: 50, ratio: CARD }]);
  useInventoryStore.setState((s) => ({ items: s.items.map((o) => (o.id === b.id ? { ...o, status: "SHIPPING_REQUESTED" as const } : o)) }));
  const first = await settleTakeMany([a.id, b.id]);
  assert.equal(first.status, "partial");
  // 배송 신청이 취소돼 다시 보관 중이 됐다
  useInventoryStore.setState((s) => ({ items: s.items.map((o) => (o.id === b.id ? { ...o, status: "IN_STORAGE" as const } : o)) }));
  const merged = mergeOutcomes(first, await settleTakeMany(first.left));
  assert.equal(merged.status, "settled");
  assert.deepEqual(merged.taken.map((x) => x.id), [a.id, b.id]);
  assert.equal(merged.amountUsdt, +(each(100) + each(50)).toFixed(2));
  assert.equal(merged.toCrypto, each(100));
  assert.equal(merged.toCard, each(50));
  assert.equal(wallet().cryptoBalance, each(100));
  assert.equal(wallet().cardBalance, each(50));
});

test("잔액이 모자랄 때: 더 필요한 금액과, 보관 중인 상품을 전부 받으면 들어오는 최대 금액", () => {
  const [a, b, c] = seed([{ value: 5 }, { value: 3.33 }, { value: 200 }]);
  // 보관 중이 아닌 상품은 세지 않는다
  useInventoryStore.setState((s) => ({ items: s.items.map((o) => (o.id === c.id ? { ...o, status: "SOLD" as const, soldForUsdt: 190 } : o)) }));
  const items = useInventoryStore.getState().items;
  assert.deepEqual(heldForTake(items).map((item) => item.id).sort(), [a.id, b.id].sort());

  const short = shortfallOf(12, 20, items);
  assert.equal(short.missing, 8);
  assert.equal(short.heldCount, 2);
  assert.equal(short.maxReceivable, +(each(5) + each(3.33)).toFixed(2));
  // 4.75 + 3.16 = 7.91 로는 8이 채워지지 않는다
  assert.equal(short.maxReceivable, 7.91);
  assert.equal(short.covers, false);
  assert.equal(shortfallOf(12.09, 20, items).covers, true);

  assert.deepEqual(shortfallOf(12, 20, []), { missing: 8, heldCount: 0, maxReceivable: 0, covers: false });
  assert.equal(shortfallOf(20, 20, items).missing, 0);
  assert.equal(shortfallOf(0.1, 0.3, []).missing, 0.2);
});

test("미리 보는 금액은 받기 전의 보관함만 본다: 같은 상품이 두 번 들어와도 한 번만 센다", () => {
  const [a] = seed([{ value: 100, ratio: { crypto: 0.5, card: 0.5 } }]);
  const quote = takeQuote([a, a]);
  assert.deepEqual(quote, { count: 1, refUsdt: 100, totalUsdt: 95, toCrypto: 47.5, toCard: 47.5 });
  // 미리 보기는 돈을 움직이지 않는다
  assert.equal(wallet().balance, 0);
  assert.equal(statusOf(a.id), "IN_STORAGE");
});

test("출금 칸에는 새로 받은 금액 가운데 출금할 수 있는 몫만 채운다", async () => {
  // 원래 있던 잔액 10(USDT 입금분)과 카드분 5. USDT 로 낸 상품 100, 카드로 낸 상품 50, 반반 상품 20
  const [a, b, c] = seed([{ value: 100, ratio: CRYPTO }, { value: 50, ratio: CARD }, { value: 20, ratio: { crypto: 0.5, card: 0.5 } }], { crypto: 10, card: 5 });
  const out = await settleTakeMany([a.id, b.id, c.id]);
  assert.equal(out.amountUsdt, 161.5);
  assert.equal(wallet().cryptoBalance, 114.5);
  assert.equal(wallet().cardBalance, 62);
  // 95 + 9.5: 원래 있던 10 과 카드 몫 57 은 들어가지 않는다
  const prefill = withdrawPrefillUsdt(out, wallet().cryptoBalance);
  assert.equal(prefill, 104.5);
  assert.equal(prefill, out.toCrypto);
  assert.notEqual(prefill, wallet().cryptoBalance);
  assert.notEqual(prefill, out.amountUsdt);

  // 이미 받았던 상품을 다시 고르면 새로 받은 것이 없으므로 채울 것도 없다
  assert.equal(withdrawPrefillUsdt(await settleTakeMany([a.id, b.id, c.id]), wallet().cryptoBalance), 0);
});

test("출금 칸: 시트를 두 번 열어 나눠 받으면 앞서 넣은 몫에 더한다(마지막 것으로 덮어쓰지 않는다)", async () => {
  const [a, b] = seed([{ value: 100, ratio: CRYPTO }, { value: 40, ratio: { crypto: 0.5, card: 0.5 } }], { crypto: 10 });
  const first = await settleTakeMany([a.id]);
  const base = withdrawPrefillUsdt(first, wallet().cryptoBalance);
  assert.equal(base, 95);
  // 화면은 앞서 넣어 둔 몫(base)에 이번 시트에서 새로 받은 출금 가능 몫을 더해 채운다(components/wallet/WithdrawScreen)
  const second = await settleTakeMany([b.id]);
  assert.equal(second.toCrypto, 19);
  assert.equal(withdrawPrefillUsdt({ toCrypto: base + second.toCrypto }, wallet().cryptoBalance), 114);
  // 원래 있던 10 은 끝까지 들어가지 않는다
  assert.equal(wallet().cryptoBalance, 124);
});

test("판정은 입금 내역을 본다: 받은 상태인데 받기 거래 기록이 없으면 이미 받았다고 하지 않는다", async () => {
  const [a] = seed([{ value: 100 }]);
  useInventoryStore.setState((s) => ({ items: s.items.map((o) => ({ ...o, status: "SOLD" as const, soldForUsdt: 95 })) }));
  const out = await settleTakeMany([a.id]);
  assert.equal(out.status, "unknown");
  assert.deepEqual(out.unknown, [a.id]);
  assert.deepEqual(out.already, []);
  assert.deepEqual(out.left, []);
  assert.equal(wallet().balance, 0);
  assert.deepEqual(await settleTake(a.id), { status: "unknown" });
});

test("출금 칸: 카드로만 낸 상품은 채우지 않고, 지금 출금할 수 있는 잔액을 넘지 않는다", async () => {
  const [card] = seed([{ value: 50, ratio: CARD }], { crypto: 30 });
  const out = await settleTakeMany([card.id]);
  assert.equal(out.toCard, 47.5);
  assert.equal(withdrawPrefillUsdt(out, wallet().cryptoBalance), 0);
  assert.equal(wallet().cryptoBalance, 30);

  assert.equal(withdrawPrefillUsdt({ toCrypto: 95 }, 40), 40);
  assert.equal(withdrawPrefillUsdt({ toCrypto: 95 }, 0), 0);
  assert.equal(withdrawPrefillUsdt({ toCrypto: Number.NaN }, 100), 0);
  assert.equal(withdrawPrefillUsdt({ toCrypto: -5 }, 100), 0);
});
