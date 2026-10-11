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
import { BURST, burstSeed } from "./burst";

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
/** 가장 작은 결과 / 가격 밴드. 2026-10-11 사다리 표부터 가장 작은 결과는 낸 값의 0.05배다 */
export const FLOOR_CASH_MIN = 0.05;
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

export const CATALOG_ODDS_VERSION = "2026-10-11-burst-99-v3";

// ── 확률표 v2 "사다리" (2026-10-11 파운더 결정 둘째: 당첨을 상품으로, 큰 배수가 실제로 보이게) ────────────────
// 백만 칸이 한 단위(0.0001%)다. 결과는 매번 이 표에서 독립으로 뽑는다(쓴 금액, 이전 결과, 잔액과 무관하다).
// 첫째 표(wide-99-v1)의 문제: 받는 값 기준 99% 가운데 22%가 거의 안 나오는 상품에 묶여 있어 USDT 결과만 보면 77%였다.
//   1 USDT 박스에서는 상품이 190번에 한 번이라, 여는 사람에게는 23%를 떼이는 것으로 보였다. 20배를 넘는 결과도 거의 없었다.
// 사다리: 당첨 구간 아홉(1, 2, 4, 8, 15, 40, 100, 250, 500배)마다 목표 확률이 있고, 모든 박스가 같은 사다리를 쓴다.
//   구간마다 참고가가 그 범위에 드는 상품이 있으면 구간 기대 가치의 대부분(prizeShare)을 상품이 가져가고, 나머지와 상품이 없는 구간은 USDT 다.
//   구간 안에서는 상품마다 기대 가치를 같게 나눈다(그래서 같은 구간에서도 싼 상품이 조금 더 자주 나온다). 상품은 최소 한 칸.
//   그래서 "두 배 근처 상품"이 열 번에 한 번꼴로, 40배 이상이 400번에 한 번꼴로 나온다. 값이 싼 상품이 없는 박스(1 USDT 박스)는 낮은 구간이 USDT 다.
//   당첨이 아닌 결과는 0.05배와 0.25배 둘이고, 그 칸 수는 받는 값 기준 기대 비율이 정확히 99%가 되도록 박스마다 푼다.
// 큰 배수에 기대 가치를 많이 실은 표다. 열 번에 여덟 번 가까이는 낸 값보다 적게 받는다. 그 사실은 박스 화면에 그대로 적는다.
// v3(같은 날 셋째): 터짐 게이지(lib/burst)를 더했다. 열 때마다 박스 가격의 10%가 게이지에 쌓이고, "터짐"(160번에 한 번, 고정 확률)이 나오면
//   시작 금액(박스 가격의 10배)과 쌓인 금액 전부를 받는다. 기대 가치 99% 가운데 약 16%가 이 게이지로 간다(160분의 1 × 10배 + 10%).
//   그만큼 사다리의 8배에서 500배 구간을 줄였다. 터짐의 확률은 게이지나 앞의 결과에 따라 바뀌지 않는다.
const SLOTS = 1_000_000;
/** 박스마다 실제 상품 수의 범위. 옛 구성(6종)은 새로 채울 때까지 예외로 둔다. */
export const MIN_PRIZES = 6;
export const MAX_PRIZES = 120;
export const TARGET_CASH_RTP = 0.99;
const CASH_RTP_TOLERANCE = 0.0005;
/** 당첨 구간. multiple: USDT 결과의 배수(낸 값 대비), from 이상 to 미만: 이 구간에 드는 상품의 참고가 범위(낸 값 대비),
 *  slots: 구간 전체의 목표 칸 수, prizeShare: 상품이 있을 때 구간 기대 가치 가운데 상품에 주는 몫 */
export interface LadderBand { multiple: number; from: number; to: number; slots: number; prizeShare: number }
export const LADDER: readonly LadderBand[] = [
  { multiple: 1, from: 1, to: 1.5, slots: 50_000, prizeShare: 0.5 },
  { multiple: 2, from: 1.5, to: 3, slots: 115_000, prizeShare: 0.8 },
  { multiple: 4, from: 3, to: 6, slots: 40_000, prizeShare: 0.8 },
  { multiple: 8, from: 6, to: 12, slots: 12_000, prizeShare: 0.8 },
  { multiple: 15, from: 12, to: 25, slots: 3_500, prizeShare: 0.8 },
  { multiple: 40, from: 25, to: 60, slots: 1_300, prizeShare: 0.8 },
  { multiple: 100, from: 60, to: 150, slots: 420, prizeShare: 0.8 },
  { multiple: 250, from: 150, to: 400, slots: 100, prizeShare: 0.8 },
  { multiple: 500, from: 400, to: Infinity, slots: 44, prizeShare: 1 },
];
/** 당첨이 아닌 두 결과(낸 값 대비 배수). 환수율을 맞추려고 칸 수를 푼다 */
export const LOW_TIERS = [0.05, 0.25] as const;
/** 상품이 드는 구간의 순번. 박스 가격보다 싼 USDT 상품은 첫 구간, 범위를 넘는 것은 마지막 구간 */
export const bandIndexOf = (value: number, price: number): number => {
  const ratio = value / price;
  const k = LADDER.findIndex((band) => ratio >= band.from && ratio < band.to);
  return k >= 0 ? k : ratio < LADDER[0].from ? 0 : LADDER.length - 1;
};

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
  const members: ProductItem[][] = LADDER.map(() => []);
  for (const item of box.items) members[bandIndexOf(item.value, price)].push(item);
  const premium: ProductItem[] = [];
  const drops: ProductItem[] = [];
  LADDER.forEach((band, k) => {
    const group = members[k];
    const share = group.length ? band.prizeShare : 0;
    // 구간의 기대 가치(칸 단위): 목표 칸 수 × USDT 결과의 금액
    const bandValue = band.slots * band.multiple * price;
    for (const item of group) premium.push({ ...item, dropRate: Math.max(1, Math.round((bandValue * share) / (group.length * sellValueOf(item)))) / 10_000 });
    const cashSlots = Math.round(band.slots * (1 - share));
    if (cashSlots > 0) drops.push(waveOf(+(price * band.multiple).toFixed(2), cashSlots, "drop"));
  });
  // 터짐: 표에 적는 값은 시작 금액(가장 적게 받는 경우)이다. 실제로 받는 금액은 그때의 게이지다(lib/opening)
  const burstImage = imageFor(BURST.id);
  drops.push({ id: BURST.id, name: "터짐, 게이지 전부", nameEn: "Burst, the whole gauge", nameZh: "爆发，领取全部累积", kind: "cash", value: burstSeed(price),
    dropRate: BURST.slots / 10_000, code: "WBURST", tone: T.coal, image: burstImage, imageUrl: burstImage.src });
  const slotsOf = (list: ProductItem[]) => list.reduce((sum, item) => sum + Math.round(item.dropRate * 10_000), 0);
  const returnOf = (list: ProductItem[]) => list.reduce((sum, item) => sum + sellValueOf(item) * item.dropRate / 100, 0) / price;
  // 남은 칸을 0.05배와 0.25배에 나눠 환수율을 맞춘다
  const lowValue = LOW_TIERS.map((multiple) => +(price * multiple).toFixed(2));
  const rest = SLOTS - slotsOf(premium) - slotsOf(drops);
  // 게이지에 쌓이는 몫(BURST.share)은 언젠가 전부 돌아가므로 기대 비율에 그대로 들어간다
  const need = (TARGET_CASH_RTP - BURST.share - returnOf(premium) - returnOf(drops)) * price * SLOTS;
  const upper = Math.max(1, Math.min(rest - 1, Math.round((need - rest * lowValue[0]) / (lowValue[1] - lowValue[0]))));
  const low = [waveOf(lowValue[0], rest - upper, "cashback"), waveOf(lowValue[1], upper, "cashback")];
  const items = [...low, ...drops, ...premium].sort((x, y) => x.dropRate - y.dropRate || y.value - x.value);
  const slots = slotsOf(items);
  const cashRtp = returnOf(items) + BURST.share;
  const retailRtp = items.reduce((sum, item) => sum + item.value * item.dropRate / 100, 0) / price + BURST.share;
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
export const expectedValue = (box: ProductBox): number => box.items.reduce((s, i) => s + (i.value * i.dropRate) / 100, 0) + (box.items.some((i) => i.id === BURST.id) ? box.price * BURST.share : 0);
/** 정가 기준 환원율 */
export const retailReturn = (box: ProductBox): number => expectedValue(box) / box.price;
/** Cash-equivalent expected return from the published probability table. */
export const cashReturn = (box: ProductBox): number => box.items.reduce((s, i) => s + (sellValueOf(i) * i.dropRate) / 100, 0) / box.price + (box.items.some((i) => i.id === BURST.id) ? BURST.share : 0);
/** 바닥 즉시 환전액(USDT), 바닥 등급은 USDT 캐시백이라 100% 적립. "꽝이어도 이만큼은 돌아온다" */
export const floorCash = (box: ProductBox): number => +box.guaranteedMin.toFixed(2);
/** 바닥 환전액 / 가격 */
export const floorRatio = (box: ProductBox): number => floorCash(box) / box.price;
/** 바닥 보장, 모든 박스가 참(빌더가 밴드를 강제). 표기 조건용으로 남긴다. */
export const isValueGuaranteed = (box: ProductBox): boolean => floorRatio(box) >= FLOOR_CASH_MIN - 1e-9; // 0.15 / 3 같은 나눗셈의 부동소수 오차를 봐준다

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
