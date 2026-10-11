import test from "node:test";
import assert from "node:assert/strict";
import { BOXES, REFUND_RATE, dropTable } from "../lib/products";
import { OPENING_ARM_DELAY_MS, autoTakeApplies, canStartPurchase, netOf, netOfMany, nextOpeningState, openingTimeline, receivedValue, toneOf, type OpeningEvent, type OpeningState } from "../lib/openingFlow";

const cash = (value: number) => ({ kind: "cash" as const, value });
const item = (value: number) => ({ kind: "physical" as const, value });

test("톤은 실제로 받는 값에서만 나온다: USDT 는 그 금액, 상품은 USDT 로 받을 때의 금액", () => {
  assert.equal(receivedValue(cash(5)), 5);
  assert.equal(receivedValue(item(100)), +(100 * REFUND_RATE).toFixed(2));
  assert.equal(toneOf(cash(0.5), 1), "below");
  assert.equal(toneOf(cash(0.8), 1), "below");
  assert.equal(toneOf(cash(0.99), 1), "even");
  assert.equal(toneOf(cash(1), 1), "even");
  assert.equal(toneOf(cash(2), 1), "above");
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

test("연출 길이: 기대 구간은 결과와 무관하게 같고, 어두운 정지는 top 에만 있다", () => {
  const tones = ["below", "even", "above", "high", "top"] as const;
  const full = tones.map((t) => openingTimeline(t, false));
  assert.ok(full.every((t) => t.anticipation === full[0].anticipation && t.impact === full[0].impact && t.exit === full[0].exit));
  assert.deepEqual(full.map((t) => t.hold > 0), [false, false, false, false, true]);
  for (const t of full) { assert.equal(t.revealAt, t.anticipation + t.impact + t.exit + t.hold); assert.equal(t.armAt, t.revealAt + OPENING_ARM_DELAY_MS); }
  // 줄어든 결과도 늘어난 결과도 같은 시각에 드러난다(늘어난 결과만 오래 끌지 않는다)
  assert.equal(full[0].revealAt, full[2].revealAt);
  // 짧게 보기는 사용자가 켠 설정이고, 켜면 정지도 없다
  const short = tones.map((t) => openingTimeline(t, true));
  assert.ok(short.every((t) => t.hold === 0 && t.revealAt < full[0].revealAt));
});

test("자동으로 USDT 로 받기: 사용자가 켠 경우에만, 상품에만, 낸 값의 20배 미만에만", () => {
  assert.equal(autoTakeApplies(item(2), 1, false), false);
  assert.equal(autoTakeApplies(cash(5), 1, true), false);
  assert.equal(autoTakeApplies(item(2), 1, true), true);
  assert.equal(autoTakeApplies({ kind: "digital", value: 15 }, 1, true), true);
  assert.equal(autoTakeApplies(item(3500), 1, true), false);
});

test("상태 기계: 구매는 READY 와 SETTLED 에서만 시작하고, 허락되지 않은 전이는 상태를 바꾸지 않는다", () => {
  const walk = (events: OpeningEvent[], from: OpeningState = "READY") => events.reduce(nextOpeningState, from);
  assert.equal(walk(["PRESS", "PURCHASE_OK", "ANIMATION_START", "ANIMATION_END", "SETTLE_START", "SETTLE_OK"]), "SETTLED");
  assert.equal(walk(["NEEDS_CONFIRM", "CANCEL"]), "READY");
  assert.equal(walk(["NEEDS_CONFIRM", "CONFIRM", "PURCHASE_ERROR", "RETRY"]), "READY");
  assert.equal(walk(["PRESS", "SHORT", "RESET"]), "READY");
  assert.equal(walk(["PRESS", "PURCHASE_OK", "SKIP"]), "REVEALED");
  assert.equal(walk(["PRESS", "PURCHASE_OK", "ANIMATION_START", "INTERRUPTED", "FOUND_COMMITTED", "RECOVER"]), "REVEALED");
  assert.equal(walk(["FOUND_COMMITTED", "RECOVER"]), "REVEALED");
  assert.equal(walk(["PRESS", "PURCHASE_OK", "ANIMATION_START", "ANIMATION_END", "SETTLE_START", "SETTLE_PENDING", "SETTLE_OK"]), "SETTLED");
  assert.equal(walk(["PRESS", "PURCHASE_OK", "ANIMATION_START", "ANIMATION_END", "SETTLE_START", "SETTLE_ERROR", "RETRY", "SETTLE_OK"]), "SETTLED");
  // 연출 중이거나 처리 중에 열기를 또 눌러도 구매 상태로 가지 않는다
  for (const state of ["PURCHASE_PROCESSING", "OUTCOME_COMMITTED", "OPENING", "REVEALED", "SETTLING", "SETTLEMENT_PENDING", "RECOVERY_REQUIRED"] as OpeningState[]) {
    assert.equal(nextOpeningState(state, "PRESS"), state, state);
    assert.equal(canStartPurchase(state), false, state);
  }
  assert.equal(canStartPurchase("READY"), true);
  assert.equal(canStartPurchase("SETTLED"), true);
  assert.equal(nextOpeningState("SETTLED", "PRESS"), "PURCHASE_PROCESSING");
});
