/**
 * VOILA catalogue. Every published box uses an exact million-slot wave schedule.
 * The schedule is calibrated against cash-equivalent payouts at 95% expected RTP.
 * Prices are in USDT. Product images resolve through productImages.ts.
 */

import { imageFor, type ProductImage } from "./productImages";
import type { BoxSpec } from "./catalogTypes";
import { SPECS } from "./catalogSpecs";
import { REFUND_RATE } from "./types";

export type BoxCategory = "dollar" | "tech" | "luxury" | "jackpot" | "collect";

export interface CategoryFilter {
  key: BoxCategory | "all";
  label: string;
}

/** 라벨은 messages `categories.*` 가 로케일별로 덮어쓴다, 여기 값은 한국어 기본값 */
export const CATEGORY_FILTERS: CategoryFilter[] = [
  { key: "all", label: "전체" },
  { key: "dollar", label: "1달러의 행복" },
  { key: "tech", label: "애플&테크" },
  { key: "luxury", label: "명품&시계" },
  { key: "jackpot", label: "슈퍼카&골드바" },
  { key: "collect", label: "컬렉션" },
];

export type SortKey = "featured" | "price-asc" | "price-desc" | "popularity";

export const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "추천순" },
  { key: "price-asc", label: "가격 낮은순" },
  { key: "price-desc", label: "가격 높은순" },
  { key: "popularity", label: "인기순" },
];

/**
 * physical, 실물(배송 또는 95% 즉시 회수)
 * digital, 글로벌 디지털 자산(기프트카드 코드 발송 또는 95% 즉시 회수, 배송, 관세 없음)
 * cash, USDT 즉시 캐시백. 개봉 즉시 100% 잔액에 적립된다(보관함을 거치지 않음)
 */
export type { ItemKind } from "./catalogTypes";
import type { ItemKind } from "./catalogTypes";

export interface ProductItem {
  id: string;
  name: string;
  nameEn: string;
  nameZh: string;
  kind: ItemKind;
  /** 실판매가(USDT, 소수 둘째 자리까지). cash 는 적립 금액 그 자체 */
  value: number;
  /** 드롭 확률(%). 박스 내 합계 100 */
  dropRate: number;
  code: string;
  tone: string;
  image: ProductImage;
  imageUrl: string | null;
}

export interface ProductBox {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  titleZh: string;
  taglineEn: string;
  taglineZh: string;
  /** 1회 오픈 가격(USDT) */
  price: number;
  /** 최저 실판매가(USDT), items 에서 파생 */
  guaranteedMin: number;
  category: BoxCategory;
  code: string;
  tone: string;
  badge: string;
  image: ProductImage;
  imageUrl: string | null;
  tagline: string;
  trendingRank?: number;
  releasedAt: string;
  popularity: number;
  items: ProductItem[];
}

const T = {
  slate: "linear-gradient(135deg,#0d0d0d 0%,#242424 48%,#3d3d3d 78%,#0d0d0d 100%)",
  graphite: "linear-gradient(135deg,#0a0a0a 0%,#1e1e1e 50%,#333333 82%,#0a0a0a 100%)",
  coal: "linear-gradient(135deg,#060606 0%,#161616 55%,#262626 100%)",
  steel: "linear-gradient(135deg,#101010 0%,#2c2c2c 45%,#5a5a5a 80%,#101010 100%)",
};




/** 정가 기준 환원율 밴드, 상한은 1/REFUND_RATE(현금 차익 방지) */
export const RETAIL_RTP_MIN = 0.93;
export const RETAIL_RTP_MAX = 1 / REFUND_RATE;
/** 가장 작은 결과 / 가격 밴드. 2026-10-11 부터 가장 작은 결과는 낸 값의 0.02배다 */
export const FLOOR_CASH_MIN = 0.02;
export const FLOOR_CASH_MAX = 0.96;

/** 즉시 회수액(USDT), 실물, 디지털은 실판매가의 95%, USDT 캐시백은 100% */
export const sellValueOf = (item: Pick<ProductItem, "kind" | "value">): number => +(item.kind === "cash" ? item.value : item.value * REFUND_RATE).toFixed(2);
export const isCashItem = (item: Pick<ProductItem, "kind">): boolean => item.kind === "cash";

const violations: string[] = [];
const cents = (n: number) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-9;

function buildBox(spec: BoxSpec): ProductBox {
  if (!cents(spec.price)) throw new Error(`${spec.slug}: price must use cents`);
  const items: ProductItem[] = spec.items
    .map(([id, name, nameEn, nameZh, value, kind = "physical"]) => {
      if (!cents(value)) throw new Error(`${id}: value must use cents`);
      // 박스 가격보다 싼 실물은 꽝이다. 실물과 기프트카드는 박스 가격 이상만 넣는다(USDT 상품은 확률 배정이 따로 넣는다).
      if (kind !== "cash" && value < spec.price) throw new Error(`${id}: value ${value} is below the box price ${spec.price}`);
      const image = imageFor(id);
      return { id, name, nameEn, nameZh, kind, value, dropRate: 0, code: id.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6), tone: T.graphite, image, imageUrl: image.src };
    });
  const image = imageFor(spec.slug);
  return {
    id: spec.slug,
    slug: spec.slug,
    title: spec.title,
    titleEn: spec.titleEn,
    titleZh: spec.titleZh,
    taglineEn: spec.taglineEn,
    taglineZh: spec.taglineZh,
    price: spec.price,
    guaranteedMin: 0,
    category: spec.category,
    code: spec.slug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6),
    tone: T.graphite,
    badge: spec.badge,
    image,
    imageUrl: image.src,
    tagline: spec.tagline,
    trendingRank: spec.trendingRank,
    releasedAt: spec.releasedAt,
    popularity: spec.popularity,
    items,
  };
}

export const CATALOG_ODDS_VERSION = "2026-10-11-wide-99-v1";

// ── 확률표 (2026-10-11 파운더 결정: 환수율 99%, 결과의 폭을 넓게, 상품이 실제로 나오게) ─────────────────────
// 백만 칸이 한 단위(0.0001%)다. 결과는 매번 이 표에서 독립으로 뽑는다(쓴 금액, 이전 결과, 잔액과 무관하다).
//   USDT 구간(낸 값 대비 배수): 0.02배와 0.1배가 가장 흔하고, 1배 5%, 2배 18%, 5배 4%, 10배 1%, 20배 0.2%.
//     전부 USDT 로 바로 잔액에 들어온다(옛 "디지털 기프트카드" 2배, 15배 구간은 없앴다. 코드를 받을 길이 없어 이름이 사실과 달랐다).
//   상품: 박스 가격의 22%(받는 값 기준)를 상품에 돌린다. 상품마다 최소 한 칸, 나머지는 값이 쌀수록 자주 나오게 나눈다(값의 1.5제곱에 반비례).
//     그래서 박스 가격에 가까운 상품은 백 번에 한두 번꼴로 나오고, 가장 비싼 상품은 여전히 백만 번에 한 번 근처다.
//   0.02배와 0.1배의 칸 수는 받는 값 기준 환수율이 정확히 99%가 되도록 박스마다 푼다.
// 이 구조에서는 열 번에 여섯 번꼴로 0.02배가 나온다. 0.02배가 다섯 번 이어질 확률이 약 7%이고, 그 뒤에 10배나 상품이 나오는 것은 운이지 장치가 아니다.
const SLOTS = 1_000_000;
/** 박스마다 실제 상품 수의 범위. 옛 구성(6종)은 새로 채울 때까지 예외로 둔다. */
export const MIN_PRIZES = 6;
export const MAX_PRIZES = 120;
export const TARGET_CASH_RTP = 0.99;
const CASH_RTP_TOLERANCE = 0.0005;
/** 고정 USDT 구간: [낸 값 대비 배수, 칸 수] */
export const FIXED_TIERS: readonly (readonly [number, number])[] = [[1, 50_000], [2, 180_000], [5, 40_000], [10, 10_000], [20, 2_000]];
/** 환수율을 맞추려고 칸 수를 푸는 두 구간(낸 값 대비 배수) */
export const LOW_TIERS = [0.02, 0.1] as const;
/** 상품에 돌리는 몫(받는 값 기준, 박스 가격 대비)과 값에 따른 기울기 */
export const PRIZE_SHARE = 0.22;
const PRIZE_WEIGHT_POWER = 1.5;

function waveOf(amount: number, slots: number, role: "cashback" | "drop"): ProductItem {
  const id = `wave-${role}-${Math.round(amount * 100)}`;
  const image = imageFor(id);
  const label = role === "cashback" ? "즉시 캐시백" : "인스턴트 드롭";
  const labelEn = role === "cashback" ? "Instant Cashback" : "Instant Drop";
  const labelZh = role === "cashback" ? "即时返现" : "即时到账";
  return { id, name: label, nameEn: labelEn, nameZh: labelZh, kind: "cash", value: amount,
    dropRate: slots / 10_000, code: `W${role[0].toUpperCase()}${Math.round(amount * 100)}`, tone: T.coal, image, imageUrl: image.src };
}

function withWaveSchedule(box: ProductBox): ProductBox {
  const price = box.price;
  if (box.items.length < MIN_PRIZES) throw new Error(`${box.slug}: at least ${MIN_PRIZES} catalogue prizes, got ${box.items.length}`);
  if (box.items.length > MAX_PRIZES) throw new Error(`${box.slug}: at most ${MAX_PRIZES} catalogue prizes, got ${box.items.length}`);
  // 상품: 한 칸씩 먼저 주고, 남은 몫을 값이 쌀수록 많이 나눈다
  const sell = box.items.map((item) => sellValueOf(item));
  const base = sell.reduce((sum, v) => sum + v, 0) / SLOTS;
  const extraBudget = Math.max(0, PRIZE_SHARE * price - base);
  const weight = box.items.map((item) => Math.pow(item.value, -PRIZE_WEIGHT_POWER));
  const denom = weight.reduce((sum, w, i) => sum + w * sell[i], 0);
  const premium = box.items.map((item, i) => ({ ...item, dropRate: (1 + Math.round((extraBudget * weight[i] / denom) * SLOTS)) / 10_000 }));
  const premiumSlots = premium.reduce((sum, item) => sum + Math.round(item.dropRate * 10_000), 0);
  const premiumReturn = premium.reduce((sum, item) => sum + sellValueOf(item) * item.dropRate / 100, 0) / price;
  // 고정 USDT 구간
  const fixed = FIXED_TIERS.map(([multiple, slots]) => waveOf(+(price * multiple).toFixed(2), slots, "drop"));
  const fixedSlots = FIXED_TIERS.reduce((sum, [, slots]) => sum + slots, 0);
  const fixedReturn = fixed.reduce((sum, item) => sum + item.value * item.dropRate / 100, 0) / price;
  // 남은 칸을 0.02배와 0.1배에 나눠 환수율을 맞춘다
  const lowValue = LOW_TIERS.map((multiple) => +(price * multiple).toFixed(2));
  const rest = SLOTS - fixedSlots - premiumSlots;
  const need = (TARGET_CASH_RTP - premiumReturn - fixedReturn) * price * SLOTS;
  const upper = Math.max(1, Math.min(rest - 1, Math.round((need - rest * lowValue[0]) / (lowValue[1] - lowValue[0]))));
  const low = [waveOf(lowValue[0], rest - upper, "cashback"), waveOf(lowValue[1], upper, "cashback")];
  const items = [...low, ...fixed, ...premium].sort((x, y) => x.dropRate - y.dropRate || y.value - x.value);
  const slots = items.reduce((sum, item) => sum + Math.round(item.dropRate * 10_000), 0);
  const cashRtp = items.reduce((sum, item) => sum + sellValueOf(item) * item.dropRate / 100, 0) / price;
  const retailRtp = items.reduce((sum, item) => sum + item.value * item.dropRate / 100, 0) / price;
  const ids = new Set(items.map((item) => item.id));
  if (slots !== SLOTS || ids.size !== items.length) violations.push(`${box.slug}: invalid slot total or duplicate item id`);
  if (rest < 2 || items.some((item) => Math.round(item.dropRate * 10_000) < 1)) violations.push(`${box.slug}: a tier has no slot`);
  if (Math.abs(cashRtp - TARGET_CASH_RTP) > CASH_RTP_TOLERANCE) violations.push(`${box.slug}: cash RTP ${cashRtp}`);
  if (retailRtp < RETAIL_RTP_MIN || retailRtp >= RETAIL_RTP_MAX) violations.push(`${box.slug}: retail RTP ${retailRtp}`);
  return { ...box, guaranteedMin: lowValue[0], items };
}

export const BOXES: ProductBox[] = SPECS.map(buildBox).map(withWaveSchedule);
export { SPECS };

if (violations.length > 0) {
  throw new Error(["상품 데이터셋 불변식 위반", ...violations].join("\n  - "));
}

export const BOX_BY_SLUG: Record<string, ProductBox> = Object.fromEntries(BOXES.map((b) => [b.slug, b]));
export const getBoxBySlug = (slug: string): ProductBox | undefined => BOX_BY_SLUG[slug];

// ── 파생 계산 ──────────────────────────────────────────────

/** 정가 기준 기대값(USDT). 바닥이 가격에 붙은 박스는 price 를 넘을 수 있다, 현금 환산은 항상 미만. */
export const expectedValue = (box: ProductBox): number => box.items.reduce((s, i) => s + (i.value * i.dropRate) / 100, 0);
/** 정가 기준 환원율 */
export const retailReturn = (box: ProductBox): number => expectedValue(box) / box.price;
/** Cash-equivalent expected return from the published probability table. */
export const cashReturn = (box: ProductBox): number => box.items.reduce((s, i) => s + (sellValueOf(i) * i.dropRate) / 100, 0) / box.price;
/** 바닥 즉시 환전액(USDT), 바닥 등급은 USDT 캐시백이라 100% 적립. "꽝이어도 이만큼은 돌아온다" */
export const floorCash = (box: ProductBox): number => +box.guaranteedMin.toFixed(2);
/** 바닥 환전액 / 가격 */
export const floorRatio = (box: ProductBox): number => floorCash(box) / box.price;
/** 바닥 보장, 모든 박스가 참(빌더가 밴드를 강제). 표기 조건용으로 남긴다. */
export const isValueGuaranteed = (box: ProductBox): boolean => floorRatio(box) >= FLOOR_CASH_MIN;

export const dropTable = (box: ProductBox): ProductItem[] => [...box.items].sort((a, b) => b.value - a.value);
/** 가장 자주 나오는 결과 하나. 화면이 "가장 흔한 결과"를 말할 때 이것을 쓴다(확률표가 바뀌어도 화면이 따라오게) */
export const mostCommon = (box: ProductBox): ProductItem => box.items.reduce((best, item) => (item.dropRate > best.dropRate ? item : best));
export const ceilingValue = (box: ProductBox): number => Math.max(...box.items.map((i) => i.value));

// ── 행(Row) 셀렉터 ─────────────────────────────────────────

/** TOP 10, trendingRank 우선, 나머지는 인기순 */
export const trending = (limit = 10): ProductBox[] =>
  [...BOXES]
    .filter((b) => typeof b.trendingRank === "number")
    .sort((a, b) => a.trendingRank! - b.trendingRank!)
    .concat([...BOXES].filter((b) => typeof b.trendingRank !== "number").sort((a, b) => b.popularity - a.popularity))
    .slice(0, limit);

const rowOf = (c: BoxCategory) => (): ProductBox[] => BOXES.filter((b) => b.category === c).sort((a, b) => b.popularity - a.popularity);
/** 🔥 1달러의 행복 */
export const dollarRow = rowOf("dollar");
/** ⚡ 애플&테크 */
export const techRow = rowOf("tech");
/** 👑 명품&시계 */
export const luxuryRow = rowOf("luxury");
/** 🚗 슈퍼카&골드바 */
export const jackpotRow = rowOf("jackpot");
/** 카드, 레고, 스니커즈 같은 수집품 */
export const collectRow = rowOf("collect");

/** 히어로, 1 USDT 박스 우선 */
export const heroBox = (): ProductBox => dollarRow()[0] ?? trending(1)[0];

export const byCategory = (key: BoxCategory | "all"): ProductBox[] => (key === "all" ? BOXES : BOXES.filter((b) => b.category === key));

export function sortBoxes(list: ProductBox[], key: SortKey): ProductBox[] {
  const out = [...list];
  switch (key) {
    case "price-asc":
      return out.sort((a, b) => a.price - b.price);
    case "price-desc":
      return out.sort((a, b) => b.price - a.price);
    case "popularity":
      return out.sort((a, b) => b.popularity - a.popularity);
    default:
      return out.sort((a, b) => (a.trendingRank ?? 99) - (b.trendingRank ?? 99) || b.popularity - a.popularity);
  }
}

/** Preserve the full published million-slot resolution in every probability label. */
export const formatRate = (r: number): string => `${Number(r.toFixed(4))}%`;

export { REFUND_RATE };
