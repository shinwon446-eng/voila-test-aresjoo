import test from "node:test";
import assert from "node:assert/strict";
import { BOXES, REFUND_RATE, dropTable, type ProductBox } from "../lib/products";
import { OPENING_ARM_DELAY_MS, autoTakeApplies, canStartPurchase, netOf, netOfMany, nextOpeningState, openingChange, openingTimeline, receivedValue, toneOf, type OpeningEvent, type OpeningState } from "../lib/openingFlow";
import { createOpeningPurchase } from "../lib/opening";
import { LedgerAccountChanged, ledgerSource } from "../lib/ledgerLock";
import { unseenOpenings, UNSEEN_WINDOW_MS } from "../stores/openingJournal";
import { useFairStore } from "../stores/fairStore";
import { useInventoryStore, type OwnedItem } from "../stores/inventoryStore";
import { useWalletStore } from "../stores/walletStore";

const cash = (value: number) => ({ kind: "cash" as const, value });
const item = (value: number) => ({ kind: "physical" as const, value });

test("톤은 실제로 받는 값에서만 나온다: USDT 는 그 금액, 상품은 USDT 로 받을 때의 금액", () => {
  assert.equal(receivedValue(cash(5)), 5);
  assert.equal(receivedValue(item(100)), +(100 * REFUND_RATE).toFixed(2));
  assert.equal(toneOf(cash(0.5), 1), "below");
  assert.equal(toneOf(cash(0.8), 1), "below");
  assert.equal(toneOf(cash(0.95), 1), "below");
  assert.equal(toneOf(cash(0.99), 1), "even");
  assert.equal(toneOf(cash(1), 1), "even");
  assert.equal(toneOf(cash(1.05), 1), "above");
  assert.equal(toneOf(cash(5), 1), "above");
  assert.equal(toneOf(cash(6), 1), "high");
  assert.equal(toneOf(cash(15), 1), "high");
  assert.equal(toneOf(cash(20), 1), "top");
  // 참고가가 낸 값과 같은 상품은 USDT 로 받으면 95% 라서 "even" 구간에 들지 못한다(크게 말하지 않는다)
  assert.equal(toneOf(item(1), 1), "below");
  // 참고가 20배 상품은 받는 값이 19배라 top 이 아니다
  assert.equal(toneOf(item(20), 1), "high");
  assert.throws(() => toneOf(cash(1), 0));
});

test("낸 값보다 적게 받는 결과는 어떤 박스에서도 축하 톤이 되지 않는다", () => {
  for (const box of BOXES) for (const i of dropTable(box)) {
    const tone = toneOf(i, box.price); const net = netOf(i, box.price);
    if (net.diff < 0) assert.ok(tone === "below" || tone === "even", `${box.slug} ${i.id}: 줄었는데 ${tone}`);
    if (tone === "above" || tone === "high" || tone === "top") assert.ok(net.diff > 0, `${box.slug} ${i.id}: ${tone} 인데 늘지 않았다`);
  }
});

test("차이는 반올림해 본전으로 만들지 않는다: 0.99 를 받으면 0.01 줄었다", () => {
  assert.deepEqual(netOf(cash(0.99), 1), { paid: 1, got: 0.99, diff: -0.01, direction: "down" });
  assert.deepEqual(netOf(cash(1), 1), { paid: 1, got: 1, diff: 0, direction: "same" });
  assert.deepEqual(netOf(cash(5), 1), { paid: 1, got: 5, diff: 4, direction: "up" });
  assert.deepEqual(netOfMany([cash(0.5), cash(0.5), cash(5)], 3), { paid: 3, got: 6, diff: 3, direction: "up" });
});

test("잔액 변화는 이 개봉의 영수증으로만 계산한다: 보관 중인 상품은 0, USDT 로 받은 상품은 실제 수령액", () => {
  // 1 USDT 를 내고 상품을 보관만 했으면 잔액은 1 줄었다(상품의 참고가가 얼마든)
  assert.deepEqual(openingChange(1, []), { paid: 1, got: 0, diff: -1, direction: "down" });
  // 그 상품(참고가 2)을 1.9 USDT 로 받으면 0.9 늘었다
  assert.deepEqual(openingChange(1, [1.9]), { paid: 1, got: 1.9, diff: 0.9, direction: "up" });
  // 다섯 개: USDT 결과 0.8, 0.5, 0.99, 5 와 보관 중인 기프트카드 하나
  assert.equal(openingChange(5, [0.8, 0.5, 0.99, 5, 0]).diff, 2.29);
});

test("연출 길이는 결과와 무관하다: 결과마다 다르게 기다리게 하지 않는다", () => {
  const full = openingTimeline(false); const short = openingTimeline(true);
  assert.equal(full.revealAt, full.anticipation + full.impact + full.exit);
  assert.equal(full.armAt, full.revealAt + OPENING_ARM_DELAY_MS);
  assert.ok(full.revealAt <= 900, "받은 것이 0.9초 안에 보인다");
  assert.ok(short.revealAt < full.revealAt);
  // 톤을 받는 인자가 없다는 것이 곧 규칙이다
  assert.equal(openingTimeline.length, 1);
});

test("자동으로 USDT 로 받기: 사용자가 켠 경우에만, 상품에만, 낸 값의 20배 미만에만", () => {
  assert.equal(autoTakeApplies(item(2), 1, false), false);
  assert.equal(autoTakeApplies(cash(5), 1, true), false);
  assert.equal(autoTakeApplies(item(2), 1, true), true);
  assert.equal(autoTakeApplies({ kind: "digital", value: 15 }, 1, true), true);
  assert.equal(autoTakeApplies(item(3500), 1, true), false);
});

test("상태 기계: 구매는 READY 와 SETTLED 에서만 시작하고, 닫으면 어느 표시 상태에서든 다시 열 수 있다", () => {
  const walk = (events: OpeningEvent[], from: OpeningState = "READY") => events.reduce(nextOpeningState, from);
  assert.equal(walk(["PRESS", "PURCHASE_OK", "ANIMATION_START", "ANIMATION_END", "SETTLE_START", "SETTLE_OK"]), "SETTLED");
  assert.equal(walk(["NEEDS_CONFIRM", "CANCEL"]), "READY");
  assert.equal(walk(["NEEDS_CONFIRM", "CONFIRM", "PURCHASE_ERROR", "RETRY"]), "READY");
  assert.equal(walk(["PRESS", "SHORT", "RESET"]), "READY");
  assert.equal(walk(["PRESS", "PURCHASE_OK", "SKIP"]), "REVEALED");
  assert.equal(walk(["FOUND_COMMITTED", "RECOVER", "SETTLE_START", "SETTLE_OK"]), "SETTLED");
  assert.equal(walk(["FOUND_COMMITTED", "RESET_RECOVERY"]), "READY");
  // 건너뛴 뒤에 화면이 보내는 ANIMATION_END 는 아무것도 바꾸지 않는다
  assert.equal(walk(["PRESS", "PURCHASE_OK", "ANIMATION_START", "SKIP", "ANIMATION_END", "SETTLE_START", "SETTLE_OK"]), "SETTLED");
  // USDT 로 받기: 대기와 실패에서 다시 시도
  assert.equal(walk(["SETTLE_START", "SETTLE_PENDING", "RETRY", "SETTLE_OK"], "SETTLED"), "SETTLED");
  assert.equal(walk(["SETTLE_START", "SETTLE_ERROR", "RETRY", "SETTLE_OK"], "SETTLED"), "SETTLED");
  // 연출 중이거나 처리 중에 열기를 또 눌러도 구매 상태로 가지 않는다
  for (const state of ["CONFIRMING", "PURCHASE_PROCESSING", "OUTCOME_COMMITTED", "OPENING", "REVEALED", "SETTLING", "SETTLEMENT_PENDING", "SETTLEMENT_FAILED", "RECOVERY_REQUIRED"] as OpeningState[]) {
    assert.equal(nextOpeningState(state, "PRESS"), state, state);
    assert.equal(canStartPurchase(state), false, state);
  }
  assert.equal(canStartPurchase("READY"), true);
  assert.equal(canStartPurchase("SETTLED"), true);
  // 여러 개 열기에서 결과를 보지 않고 닫아도(연출 중 닫기) 갇히지 않는다. 구매 처리 중에만 닫기가 무시된다
  for (const state of ["OUTCOME_COMMITTED", "OPENING", "REVEALED", "SETTLED", "SETTLEMENT_PENDING", "SETTLEMENT_FAILED", "RECOVERY_REQUIRED", "INSUFFICIENT_BALANCE", "PURCHASE_FAILED"] as OpeningState[]) {
    assert.equal(nextOpeningState(state, "RESET"), "READY", state);
  }
  assert.equal(nextOpeningState("PURCHASE_PROCESSING", "RESET"), "PURCHASE_PROCESSING");
  // RESET_RECOVERY 는 복구 상태에서만 뜻이 있다(다른 상태를 건드리지 않는다)
  for (const state of ["READY", "OPENING", "SETTLED", "PURCHASE_PROCESSING"] as OpeningState[]) assert.equal(nextOpeningState(state, "RESET_RECOVERY"), state);
});

// ── 구매 모듈의 보호 장치(lib/opening). 돈이 틀리거나 두 번 움직이는 경로를 막는다 ──────────────
function resetLedger(crypto = 100, card = 0) {
  useWalletStore.setState({ cryptoBalance: crypto, cardBalance: card, balance: crypto + card, transactions: [], totalWagered: 0 });
  useInventoryStore.setState({ items: [] });
  useFairStore.setState({ serverSeed: "a".repeat(128), serverSeedHash: "hash", clientSeed: "flow-test", nonce: 0 });
}
function cashBox(): ProductBox {
  const sample = BOXES.flatMap((b) => b.items).find((i) => i.kind === "cash")!;
  return { ...BOXES[0], price: 50, guaranteedMin: 25, items: [{ ...sample, value: 25, dropRate: 100 }] };
}

test("USDT 결과를 더한 뒤에 실패하면 차감과 지급과 기록이 전부 되돌려진다(돌려준 값이 더해진 채 남지 않는다)", async () => {
  resetLedger(100);
  const original = useWalletStore.getState().addTransaction;
  let calls = 0;
  // 마지막 "open" 거래 기록만 실패시킨다(그 앞에서 25 USDT 가 이미 더해져 있다)
  useWalletStore.setState({ addTransaction: ((tx: Parameters<typeof original>[0]) => { calls += 1; if (tx.type === "open") throw new Error("injected"); return original(tx); }) as typeof original });
  await assert.rejects(createOpeningPurchase(cashBox(), 1, "op_test_rollback")());
  useWalletStore.setState({ addTransaction: original });
  assert.ok(calls >= 2, "실패 전에 지급 기록까지 갔다");
  assert.equal(useWalletStore.getState().balance, 100, "잔액은 열기 전 그대로");
  assert.equal(useWalletStore.getState().cryptoBalance, 100);
  assert.equal(useWalletStore.getState().transactions.length, 0, "남은 거래 기록이 없다");
  assert.equal(useInventoryStore.getState().items.length, 0, "남은 보관함 기록이 없다");
});

test("구매 도중 장부(계정)가 바뀌면 차감하지 않고 멈춘다", async () => {
  resetLedger(100);
  // 시드를 준비하는 동안 계정이 바뀐 상황: ensureSeeds 가 끝나는 순간 장부 이름이 달라진다
  const key = ledgerSource.key; let current = "voila.browser-wallet.a";
  ledgerSource.key = () => current;
  const ensure = useFairStore.getState().ensureSeeds;
  useFairStore.setState({ ensureSeeds: async () => { await ensure(); current = "voila.browser-wallet.b"; } });
  await assert.rejects(createOpeningPurchase(cashBox(), 1, "op_test_switch")(), LedgerAccountChanged);
  ledgerSource.key = key;
  useFairStore.setState({ ensureSeeds: ensure });
  assert.equal(useWalletStore.getState().balance, 100, "어느 장부에서도 차감되지 않았다");
  assert.equal(useInventoryStore.getState().items.length, 0);
});

test("구매 모듈은 보관함 기록마다 개봉의 거래 번호를 붙인다. 못 본 개봉은 그 기록에서 찾는다", async () => {
  resetLedger(200);
  await createOpeningPurchase(cashBox(), 2, "op_test_tag")();
  const items = useInventoryStore.getState().items;
  assert.equal(items.length, 2);
  assert.ok(items.every((i) => i.openingId === "op_test_tag"));
  const now = Date.now();
  assert.deepEqual(unseenOpenings(items, {}, now).map((o) => [o.id, o.items.length]), [["op_test_tag", 2]]);
  assert.equal(unseenOpenings(items, { op_test_tag: new Date().toISOString() }, now).length, 0, "본 개봉은 다시 보여 주지 않는다");
  assert.equal(unseenOpenings(items, {}, now + UNSEEN_WINDOW_MS + 1000).length, 0, "오래된 기록은 다시 보여 주지 않는다");
  const legacy: OwnedItem[] = items.map((i) => ({ ...i, openingId: undefined }));
  assert.equal(unseenOpenings(legacy, {}, now).length, 0, "거래 번호가 없는 옛 기록은 대상이 아니다");
});
