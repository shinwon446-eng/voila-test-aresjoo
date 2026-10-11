/**
 * 개봉 경험의 순수 규칙: 결과의 크기(톤), 낸 값과 받은 값의 차이, 화면 상태 기계.
 * 여기에는 화면도 저장소도 없다. 결과는 lib/opening.ts 가 연출 전에 정하고, 이 파일은 그것을 어떻게 "말할지"만 정한다.
 *
 * 톤은 실제로 받는 값에서만 나온다(연출이 결과보다 크게 말하지 않게):
 *   받는 값 = USDT 결과는 그 금액, 상품은 USDT 로 받을 때의 금액(참고가의 95%).
 *   below  낸 값보다 적다            → 줄었다고 말한다. 축하 없음
 *   even   낸 값과 거의 같다(±5%)   → 담담하게
 *   above  낸 값의 1.05배 이상 6배 미만
 *   high   6배 이상 20배 미만
 *   top    20배 이상(박스 화면의 가장 높은 구간과 같은 기준)
 * 톤은 값만 뜻한다. 드문지 아닌지는 화면이 실제 확률 숫자로만 말한다(opening/DECISIONS.md 1-8).
 */
import { sellValueOf, type ProductItem } from "./products";

export type OutcomeTone = "below" | "even" | "above" | "high" | "top";

export const TONE_EVEN_BAND = 0.05;
export const TONE_HIGH_MULTIPLE = 6;
export const TONE_TOP_MULTIPLE = 20;

const round2 = (n: number) => +n.toFixed(2);

/** 그 결과로 실제 손에 들어오는 USDT 기준 값 */
export const receivedValue = (item: Pick<ProductItem, "kind" | "value">): number => sellValueOf(item);

export function toneOf(item: Pick<ProductItem, "kind" | "value">, price: number): OutcomeTone {
  if (!(price > 0)) throw new RangeError("price must be positive");
  const multiple = receivedValue(item) / price;
  if (multiple >= TONE_TOP_MULTIPLE) return "top";
  if (multiple >= TONE_HIGH_MULTIPLE) return "high";
  if (multiple >= 1 + TONE_EVEN_BAND) return "above";
  if (multiple > 1 - TONE_EVEN_BAND) return "even";
  return "below";
}

/** 낸 값과 받은 값. diff 가 음수면 줄었다. 화면은 이 숫자를 그대로 적는다. */
export function netOf(item: Pick<ProductItem, "kind" | "value">, price: number): { paid: number; got: number; diff: number; direction: "down" | "same" | "up" } {
  const got = round2(receivedValue(item));
  const diff = round2(got - price);
  return { paid: price, got, diff, direction: diff < 0 ? "down" : diff > 0 ? "up" : "same" };
}

/** 여러 개를 연 결과의 합계 */
export function netOfMany(items: Pick<ProductItem, "kind" | "value">[], cost: number): { paid: number; got: number; diff: number; direction: "down" | "same" | "up" } {
  const got = round2(items.reduce((sum, item) => sum + receivedValue(item), 0));
  const diff = round2(got - cost);
  return { paid: cost, got, diff, direction: diff < 0 ? "down" : diff > 0 ? "up" : "same" };
}

/**
 * 연출 길이(ms). 가설이지 검증된 값이 아니다(opening/RESEARCH.md, DECISIONS.md 1-8). 결과는 이미 정해져 있고 이 시간은 보여 주는 시간일 뿐이다.
 *   기대(상자가 내려앉고 봉인이 감긴다) → 충격(봉인이 떨어지고 뚜껑이 넘어간다) → 퇴장(상자가 빠진다) → [top 만: 어두운 정지] → 드러남
 * 기대 구간은 결과와 무관하게 같다. 반복 횟수로 자동으로 줄이지 않는다. short 는 사용자가 켠 "짧게 보기" 다.
 * revealAt 은 받은 것과 차이 문장이 함께 보이기 시작하는 시각, armAt 은 아래 단추가 눌리기 시작하는 시각이다.
 */
export function openingTimeline(tone: OutcomeTone, short: boolean): { anticipation: number; impact: number; exit: number; hold: number; revealAt: number; armAt: number } {
  const anticipation = short ? 220 : 520;
  const impact = short ? 110 : 150;
  const exit = short ? 120 : 170;
  const hold = tone === "top" && !short ? 260 : 0;
  const revealAt = anticipation + impact + exit + hold;
  return { anticipation, impact, exit, hold, revealAt, armAt: revealAt + OPENING_ARM_DELAY_MS };
}

/** 결과가 뜬 뒤 아래 단추가 눌리기까지의 시간. 건너뛰려던 손가락이 새로 뜬 단추(다음 구매)를 누르지 않게 한다. */
export const OPENING_ARM_DELAY_MS = 350;

/**
 * 자동으로 USDT 로 받기(사용자가 직접 켠 설정)가 이 결과에 적용되는가.
 * USDT 결과는 원래 잔액으로 들어오므로 대상이 아니다. 낸 값의 20배 이상인 상품은 자동으로 넘기지 않고 묻는다.
 */
export function autoTakeApplies(item: Pick<ProductItem, "kind" | "value">, price: number, enabled: boolean): boolean {
  if (!enabled || item.kind === "cash") return false;
  return toneOf(item, price) !== "top";
}

// ── 화면 상태 기계 ────────────────────────────────────────────────────────────
export type OpeningState =
  | "READY" | "CONFIRMING" | "PURCHASE_PROCESSING" | "OUTCOME_COMMITTED" | "OPENING" | "REVEALED"
  | "SETTLING" | "SETTLED"
  | "INSUFFICIENT_BALANCE" | "PURCHASE_FAILED" | "REVEAL_INTERRUPTED" | "SETTLEMENT_PENDING" | "SETTLEMENT_FAILED" | "RECOVERY_REQUIRED";

export type OpeningEvent =
  | "PRESS" | "NEEDS_CONFIRM" | "CONFIRM" | "CANCEL" | "SHORT" | "PURCHASE_OK" | "PURCHASE_ERROR"
  | "ANIMATION_START" | "ANIMATION_END" | "SKIP" | "SETTLE_START" | "SETTLE_OK" | "SETTLE_PENDING" | "SETTLE_ERROR"
  | "RETRY" | "INTERRUPTED" | "FOUND_COMMITTED" | "RECOVER" | "RESET";

const T: Record<OpeningState, Partial<Record<OpeningEvent, OpeningState>>> = {
  READY: { PRESS: "PURCHASE_PROCESSING", NEEDS_CONFIRM: "CONFIRMING", SHORT: "INSUFFICIENT_BALANCE", FOUND_COMMITTED: "RECOVERY_REQUIRED" },
  CONFIRMING: { CONFIRM: "PURCHASE_PROCESSING", CANCEL: "READY" },
  PURCHASE_PROCESSING: { PURCHASE_OK: "OUTCOME_COMMITTED", PURCHASE_ERROR: "PURCHASE_FAILED", SHORT: "INSUFFICIENT_BALANCE" },
  OUTCOME_COMMITTED: { ANIMATION_START: "OPENING", SKIP: "REVEALED", INTERRUPTED: "REVEAL_INTERRUPTED" },
  OPENING: { ANIMATION_END: "REVEALED", SKIP: "REVEALED", INTERRUPTED: "REVEAL_INTERRUPTED" },
  REVEALED: { SETTLE_START: "SETTLING", RESET: "READY" },
  SETTLING: { SETTLE_OK: "SETTLED", SETTLE_PENDING: "SETTLEMENT_PENDING", SETTLE_ERROR: "SETTLEMENT_FAILED" },
  SETTLED: { RESET: "READY", PRESS: "PURCHASE_PROCESSING", NEEDS_CONFIRM: "CONFIRMING", SHORT: "INSUFFICIENT_BALANCE", SETTLE_START: "SETTLING" },
  INSUFFICIENT_BALANCE: { RESET: "READY" },
  PURCHASE_FAILED: { RETRY: "READY", RESET: "READY" },
  REVEAL_INTERRUPTED: { FOUND_COMMITTED: "RECOVERY_REQUIRED", RESET: "READY" },
  SETTLEMENT_PENDING: { SETTLE_OK: "SETTLED", SETTLE_ERROR: "SETTLEMENT_FAILED", RESET: "READY" },
  SETTLEMENT_FAILED: { RETRY: "SETTLING", RESET: "READY" },
  RECOVERY_REQUIRED: { RECOVER: "REVEALED", RESET: "READY" },
};

/** 허락되지 않은 전이는 상태를 바꾸지 않는다(연출 중에 열기를 또 눌러도 구매가 나가지 않는다). */
export const nextOpeningState = (state: OpeningState, event: OpeningEvent): OpeningState => T[state][event] ?? state;

/** 이 상태에서 새 구매를 시작해도 되는가. 구매는 READY 와 SETTLED 에서만 시작한다. */
export const canStartPurchase = (state: OpeningState): boolean => state === "READY" || state === "SETTLED";
