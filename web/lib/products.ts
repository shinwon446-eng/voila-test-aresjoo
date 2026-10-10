/**
 * VOILA catalogue. Every published box uses an exact million-slot wave schedule.
 * The schedule is calibrated against cash-equivalent payouts at 95% expected RTP.
 * Prices are in USDT. Product images resolve through productImages.ts.
 */

import { imageFor, type ProductImage } from "./productImages";
import type { BoxSpec } from "./catalogTypes";
import { SPECS } from "./catalogSpecs";
import { REFUND_RATE } from "./types";

export type BoxCategory = "dollar" | "tech" | "luxury" | "jackpot";

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
/** 바닥 즉시 환전액 / 가격 밴드 */
export const FLOOR_CASH_MIN = 0.5;
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

export const CATALOG_ODDS_VERSION = "2026-10-10-deep-95-v3";

// 백만 슬롯이 한 단위(0.0001%)다. 고정 구간: 바닥 캐시백 0.5배 50%, 0.8배 22%, 0.99배 17%, 회복 구간(2배 기프트카드와 5배 드롭) 10.5%,
// 15배 이상 구간 0.5%. 실제 상품은 몇 개든 각각 백만분의 1이고, 15배 기프트카드가 0.5% 구간의 나머지를 가진다.
// 실제 상품의 가치 합이 커지면 5배 드롭의 슬롯이 줄어 현금 환급률이 95%에 맞는다(fiveSlots 를 푼다).
const SLOTS = 1_000_000;
const FLOOR_SLOTS = [500_000, 220_000, 170_000] as const;
const RECOVERY_SLOTS = 105_000;
const SURGE_SLOTS = 5_000;
/** 박스마다 실제 상품 수의 범위. 옛 구성(6종)은 새로 채울 때까지 예외로 둔다. */
export const MIN_PRIZES = 6;
export const MAX_PRIZES = 120;
const TARGET_CASH_RTP = 0.95;
const CASH_RTP_TOLERANCE = 0.0005;

function waveItem(value: number, kind: "cash" | "digital", role: "cashback" | "drop" | "gift", slots: number): ProductItem {
  const amount = +value.toFixed(2);
  const id = `wave-${role}-${Math.round(amount * 100)}`;
  const image = imageFor(id);
  const label = role === "cashback" ? "즉시 캐시백" : role === "drop" ? "인스턴트 드롭" : "디지털 기프트카드";
  const labelEn = role === "cashback" ? "Instant Cashback" : role === "drop" ? "Instant Drop" : "Digital Gift Card";
  const labelZh = role === "cashback" ? "即时返现" : role === "drop" ? "即时到账" : "数字礼品卡";
  return { id, name: `${amount} USDT ${label}`, nameEn: `${amount} USDT ${labelEn}`, nameZh: `${amount} USDT ${labelZh}`, kind, value: amount,
    dropRate: slots / 10_000, code: `W${role[0].toUpperCase()}${Math.round(amount * 100)}`, tone: T.coal, image, imageUrl: image.src };
}

function withWaveSchedule(box: ProductBox): ProductBox {
  const price = box.price;
  const premium = box.items.map((item) => ({ ...item, dropRate: 1 / 10_000 }));
  if (premium.length < MIN_PRIZES) throw new Error(`${box.slug}: at least ${MIN_PRIZES} catalogue prizes, got ${premium.length}`);
  if (premium.length > MAX_PRIZES) throw new Error(`${box.slug}: at most ${MAX_PRIZES} catalogue prizes, got ${premium.length}`);
  const floor = [
    waveItem(price * 0.5, "cash", "cashback", FLOOR_SLOTS[0]),
    waveItem(price * 0.8, "cash", "cashback", FLOOR_SLOTS[1]),
    waveItem(price * 0.99, "cash", "cashback", FLOOR_SLOTS[2]),
  ];
  const mid = waveItem(price * 15, "digital", "gift", SURGE_SLOTS - premium.length);
  const fixed = [...floor, mid, ...premium];
  const fixedReturn = fixed.reduce((sum, item) => sum + sellValueOf(item) * item.dropRate / 100, 0) / price;
  // A 2x gift card pays 1.9x cash equivalent; a 5x instant drop pays 5x.
  // Solve the remaining 10% recovery budget against the actual prize values.
  const recoveryTwoValue = sellValueOf({ kind: "digital", value: price * 2 }) / price;
  const recoveryFiveValue = 5;
  const fiveSlots = Math.max(1, Math.min(RECOVERY_SLOTS - 1,
    Math.round((TARGET_CASH_RTP - fixedReturn - (RECOVERY_SLOTS / SLOTS) * recoveryTwoValue)
      * SLOTS / (recoveryFiveValue - recoveryTwoValue))));
  const two = waveItem(price * 2, "digital", "gift", RECOVERY_SLOTS - fiveSlots);
  const five = waveItem(price * 5, "cash", "drop", fiveSlots);
  const items = [
    ...fixed,
    two,
    five,
  ].sort((a, b) => a.dropRate - b.dropRate || b.value - a.value);
  const slots = items.reduce((sum, item) => sum + Math.round(item.dropRate * 10_000), 0);
  const cashRtp = items.reduce((sum, item) => sum + sellValueOf(item) * item.dropRate / 100, 0) / price;
  const retailRtp = items.reduce((sum, item) => sum + item.value * item.dropRate / 100, 0) / price;
  const ids = new Set(items.map((item) => item.id));
  if (slots !== SLOTS || ids.size !== items.length) violations.push(`${box.slug}: invalid slot total or duplicate item id`);
  const tierRates = [...floor.map((item) => item.dropRate), two.dropRate, five.dropRate, mid.dropRate];
  if (!tierRates.every((rate, index) => index === 0 || tierRates[index - 1] > rate) ||
    !premium.every((item) => mid.dropRate > item.dropRate && item.dropRate === 0.0001)) {
    violations.push(`${box.slug}: wave probabilities are not monotonic`);
  }
  if (Math.abs(cashRtp - TARGET_CASH_RTP) > CASH_RTP_TOLERANCE) violations.push(`${box.slug}: cash RTP ${cashRtp}`);
  if (retailRtp < RETAIL_RTP_MIN || retailRtp >= RETAIL_RTP_MAX) violations.push(`${box.slug}: retail RTP ${retailRtp}`);
  return { ...box, guaranteedMin: price * 0.5, items };
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
