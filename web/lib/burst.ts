// 터짐 게이지. 슬롯의 누적 상금(프로그레시브)과 같은 구조를 계정마다, 박스마다 따로 둔다.
//  - 열 때마다 박스 가격의 share 만큼이 게이지에 쌓인다(낸 돈의 출처 비율대로 나눠 쌓는다).
//  - "터짐" 결과가 나오면 시작 금액(박스 가격의 seed 배) + 쌓인 금액 전부를 USDT 로 받고, 게이지는 시작 금액으로 돌아간다.
//  - "터짐"이 나올 확률은 고정이다(slots / 100만). 게이지가 얼마나 찼는지, 얼마나 썼는지, 앞의 결과가 무엇이었는지와 무관하다.
//    달라지는 것은 터졌을 때 받는 금액뿐이고, 그 금액은 화면에 늘 보인다.
//  - 기대 가치: 한 번 열 때 slots/100만 × seed + share (박스 가격 대비). 쌓인 금액은 언젠가 그 계정이 전부 받는다.
// 이 파일은 순수 계산만 한다. 장부(지갑 저장소)에 쓰는 일은 lib/opening 이 구매와 한 묶음으로 한다.
import type { FundingRatio } from "./funding";

export const BURST = {
  /** 확률표의 항목 번호 */
  id: "wave-burst",
  /** 시작 금액: 박스 가격의 몇 배 */
  seed: 10,
  /** 한 번 열 때 쌓이는 몫: 박스 가격 대비 */
  share: 0.1,
  /** 터짐의 칸 수(100만 칸 가운데). 160번에 한 번 */
  slots: 6_250,
} as const;

/** 쌓인 금액. 낸 돈의 출처(USDT 입금분, 카드분)를 따로 센다. 카드로 쌓은 몫은 카드 잔액으로만 돌아간다 */
export interface BurstPot { crypto: number; card: number }
export const EMPTY_POT: BurstPot = { crypto: 0, card: 0 };

const r4 = (n: number) => +n.toFixed(4);
const unit = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 1));

export const burstSeed = (price: number): number => +(price * BURST.seed).toFixed(2);
export const burstStep = (price: number): number => +(price * BURST.share).toFixed(2);
/** 지금 터지면 받는 금액 */
export const burstGauge = (price: number, pot?: BurstPot | null): number => +(burstSeed(price) + (pot?.crypto ?? 0) + (pot?.card ?? 0)).toFixed(2);

/** 한 번 연 뒤의 게이지 */
export function potAfterOpen(pot: BurstPot, price: number, ratio: FundingRatio): BurstPot {
  const step = burstStep(price);
  const crypto = r4(step * unit(ratio.crypto));
  return { crypto: r4(pot.crypto + crypto), card: r4(pot.card + (step - crypto)) };
}

/** 터졌을 때 받는 금액과 그 돈의 출처 비율. 시작 금액(운영자가 넣는 몫)은 이번에 낸 돈의 출처를 따른다. 센트 아래는 버린다(더 주지 않는다) */
export function burstPayout(pot: BurstPot, price: number, ratio: FundingRatio): { amount: number; ratio: FundingRatio } {
  const seed = burstSeed(price);
  const share = unit(ratio.crypto);
  const crypto = pot.crypto + seed * share;
  const card = pot.card + seed * (1 - share);
  const total = crypto + card;
  const amount = Math.floor(total * 100 + 1e-6) / 100;
  return { amount, ratio: total > 0 ? { crypto: crypto / total, card: card / total } : { crypto: 1, card: 0 } };
}
