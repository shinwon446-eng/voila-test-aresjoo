// 가입 혜택의 무료 개봉(stores/walletStore 의 freeOpens)과 그것을 쓰는 구매 모듈(lib/opening).
import test from "node:test";
import assert from "node:assert/strict";
import { BOXES, type ProductBox, LEGACY_RETIRED, isLadderBox } from "../lib/products";
import { BURST } from "../lib/burst";
import { createOpeningPurchase, InsufficientOpeningBalance } from "../lib/opening";
import { useWalletStore, WELCOME_BOX_SLUG, WELCOME_FREE_OPENS } from "../stores/walletStore";
import { useInventoryStore } from "../stores/inventoryStore";
import { useFairStore } from "../stores/fairStore";

function reset(crypto = 0) {
  useWalletStore.setState({ cryptoBalance: crypto, cardBalance: 0, balance: crypto, transactions: [], totalWagered: 0, burst: {}, freeOpens: {}, freeOpensGranted: false });
  useInventoryStore.setState({ items: [] });
  useFairStore.setState({ serverSeed: "c".repeat(128), serverSeedHash: "hash", clientSeed: "free-test", nonce: 0 });
}
const base = BOXES.find((b) => b.slug === WELCOME_BOX_SLUG)!;
// 가입 혜택 박스가 옛 방식이면 가장 작은 USDT 결과, 실물 전용이면 가장 싼 상품으로 시험한다
const ladder = isLadderBox(base);
const lowItem = ladder ? base.items.find((i) => i.id.startsWith("wave-cashback-"))! : [...base.items].sort((a, b) => a.value - b.value)[0];
const burstItem = base.items.find((i) => i.id === BURST.id);
/** 결과가 잔액에 바로 들어오는 금액: USDT 결과면 그 값, 실물이면 0(보관함으로 간다) */
const credit = lowItem.kind === "cash" ? lowItem.value : 0;
const only = (item: typeof lowItem): ProductBox => ({ ...base, items: [{ ...item, dropRate: 100 }] });

test("가입 혜택: 포켓몬 카드 박스 무료 개봉 두 번, 계정마다 한 번만", () => {
  reset();
  // 옛 박스를 홈에서 내리기 전에는 옛 포켓몬 카드 박스, 내린 뒤에는 새 카탈로그의 리자몽 박스
  assert.equal(WELCOME_BOX_SLUG, LEGACY_RETIRED ? "pokemon-charizard" : "vault-pokemon");
  assert.equal(WELCOME_FREE_OPENS, 2);
  assert.equal(useWalletStore.getState().claimWelcomeBoxes(), true);
  assert.equal(useWalletStore.getState().freeOpens[WELCOME_BOX_SLUG], 2);
  assert.equal(useWalletStore.getState().claimWelcomeBoxes(), false, "두 번 주지 않는다");
  assert.equal(useWalletStore.getState().freeOpens[WELCOME_BOX_SLUG], 2);
});

test("무료 개봉: 잔액이 0 이어도 열리고, 돈이 나가지 않고, 횟수가 줄고, 결과는 그대로 받는다", async () => {
  reset(0);
  useWalletStore.getState().claimWelcomeBoxes();
  const [result] = await createOpeningPurchase(only(lowItem), 1, "op_free_a")();
  const w = useWalletStore.getState();
  assert.equal(result.item.value, lowItem.value);
  assert.equal(w.balance, credit, "낸 돈 없이 결과만 더해졌다");
  if (!ladder) assert.equal(useInventoryStore.getState().items.filter((i) => i.status === "IN_STORAGE").length, 1, "실물은 보관함에 들어간다");
  assert.equal(w.freeOpens[WELCOME_BOX_SLUG], 1);
  const open = w.transactions.find((t) => t.type === "open")!;
  assert.equal(Math.abs(open.amountUsdt), 0);
  assert.ok(open.ref!.includes("+free1") && open.ref!.endsWith(":op_free_a"), open.ref);
  assert.equal(w.totalWagered, 0, "무료로 연 것은 이용액에 넣지 않는다");
  if (ladder) assert.deepEqual(w.burst[WELCOME_BOX_SLUG] ?? { crypto: 0, card: 0 }, { crypto: 0, card: 0 }, "값을 내지 않았으므로 게이지에 쌓이지 않는다");
});

test("무료 횟수를 다 쓰면 값을 낸다. 한 번에 여러 개를 열면 남는 개수만 값을 낸다", async () => {
  reset(base.price * 2 > 100 ? base.price * 2 : 100);
  const start = useWalletStore.getState().balance;
  useWalletStore.getState().claimWelcomeBoxes();
  await createOpeningPurchase(only(lowItem), 3, "op_free_b")(); // 둘은 무료, 하나는 20
  let w = useWalletStore.getState();
  assert.equal(w.freeOpens[WELCOME_BOX_SLUG], 0);
  assert.equal(w.balance, +(start - base.price + credit * 3).toFixed(2));
  if (ladder) assert.deepEqual(w.burst[WELCOME_BOX_SLUG], { crypto: +(base.price * BURST.share).toFixed(4), card: 0 }, "값을 낸 한 번만 게이지에 쌓였다");
  await createOpeningPurchase(only(lowItem), 1, "op_free_c")();
  w = useWalletStore.getState();
  assert.equal(w.balance, +(start - base.price * 2 + credit * 4).toFixed(2), "무료가 없으면 값을 낸다");
});

test("무료 횟수가 없고 잔액도 없으면 열리지 않는다", async () => {
  reset(0);
  await assert.rejects(createOpeningPurchase(only(lowItem), 1, "op_free_d")(), InsufficientOpeningBalance);
  assert.equal(useInventoryStore.getState().items.length, 0);
});

test("무료 개봉에서 터짐이 나오면 그때의 게이지(시작 금액)를 받는다", { skip: !burstItem && "실물 전용 박스에는 터짐이 없다" }, async () => {
  reset(0);
  useWalletStore.getState().claimWelcomeBoxes();
  const [result] = await createOpeningPurchase(only(burstItem!), 1, "op_free_e")();
  assert.equal(result.item.value, base.price * BURST.seed, "값을 내지 않았으므로 이번 몫은 없다");
  assert.equal(useWalletStore.getState().balance, base.price * BURST.seed);
});

test("무료 개봉이 중간에 실패하면 횟수도 열기 전으로 돌아간다", async () => {
  reset(0);
  useWalletStore.getState().claimWelcomeBoxes();
  const original = useWalletStore.getState().addTransaction;
  useWalletStore.setState({ addTransaction: ((tx: Parameters<typeof original>[0]) => { if (tx.type === "open") throw new Error("injected"); return original(tx); }) as typeof original });
  await assert.rejects(createOpeningPurchase(only(lowItem), 1, "op_free_f")());
  useWalletStore.setState({ addTransaction: original });
  const w = useWalletStore.getState();
  assert.equal(w.freeOpens[WELCOME_BOX_SLUG], 2, "쓴 횟수가 되돌아왔다");
  assert.equal(w.balance, 0);
  assert.equal(useInventoryStore.getState().items.length, 0);
});
