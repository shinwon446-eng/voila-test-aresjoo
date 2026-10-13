// 후기 화면들이 같이 쓰는 셈: 별점 집계(샘플 위에 실제 후기를 더한 것)와 "몇 분 전" 의 구간.
// 박스 카드, 박스 화면, 모아 보기가 모두 여기의 한 가지 집계를 쓴다. 그래서 카드와 상세의 별점과 후기 수가 어긋나지 않고,
// 샘플 스위치를 꺼도(lib/reviewSamples 머리) 실제 후기가 있는 박스의 카드에는 별점이 남는다.
// 샘플은 lib/reviewSampleGate 를 거쳐 받는다(샘플을 끈 빌드에 생성기와 말뭉치가 실리지 않게).
// 화면과 떨어진 순수한 함수만 둔다(tests/reviewFeed.test.ts).
import { BOX_BY_SLUG } from "./products";
import { isExampleReview } from "./community";
import type { RatingSummary } from "./reviewRating";
import { allRatingSummary, ratingSummary } from "./reviewSampleGate";

/** 집계에 드는 실제 후기: 운영팀의 예시가 아니고, 지금 있는 박스의 것 */
export const isRealReview = (review: { id: string; source?: string; boxSlug: string }): boolean => !isExampleReview(review) && !!BOX_BY_SLUG[review.boxSlug];

/** 실제 후기의 점수를 박스마다 모은 것. 박스 320개의 카드가 한 번 만든 것을 같이 쓴다 */
export type RealRatings = ReadonlyMap<string, readonly number[]>;
export function realRatings(reviews: readonly { id: string; source?: string; boxSlug: string; rating: number }[]): RealRatings {
  const byBox = new Map<string, number[]>();
  for (const review of reviews) {
    if (!isRealReview(review)) continue;
    const list = byBox.get(review.boxSlug);
    if (list) list.push(review.rating); else byBox.set(review.boxSlug, [review.rating]);
  }
  return byBox;
}

const NONE: readonly number[] = [];
/** 박스 하나의 별점 요약: 카드와 박스 화면이 같이 쓴다 */
export const boxRating = (boxSlug: string, real: RealRatings): RatingSummary => ratingSummary(boxSlug, real.get(boxSlug) ?? NONE);
/** 모든 박스의 별점 요약: 모아 보기의 머리 */
export function allRating(real: RealRatings): RatingSummary {
  const all: number[] = [];
  real.forEach((list) => { for (const rating of list) all.push(rating); });
  return allRatingSummary(all);
}

/**
 * 목록의 차례: 내 후기가 먼저(내 것 가운데 새것부터), 그다음에 샘플(새것부터). 앞에서 shown 건만 보여 준다.
 * 내가 쓴 후기는 며칠이 지나도 샘플 사이에 묻히지 않는다(샘플은 박스마다 몇 시간 전의 글이 있어, 나이로 섞으면 사흘 된 내 글이 천 번째 뒤로 간다).
 * 건수와 별점에는 내 후기가 한 번만 들어간다(boxRating, allRating).
 */
export function feedOrder<T extends Sortable>(mine: readonly T[], samples: readonly T[], shown: number, sort: ReviewSort = "newest"): T[] {
  if (sort === "newest") return [...[...mine].sort((a, b) => a.ageMin - b.ageMin), ...samples].slice(0, Math.max(0, shown));
  // 값과 배수의 차례에서는 내 후기도 같은 잣대로 샘플과 함께 줄을 선다
  return [...mine, ...samples].sort(compareBy(sort)).slice(0, Math.max(0, shown));
}

/**
 * 모아 보기의 차례(2026-10-14 파운더: 금액 높은 순, 배수 높은 순, 최신순). 주소의 sort 가 value 나 times 가 아니면 새것부터다.
 * value 는 나온 상품의 값이 높은 것부터(같으면 새것부터), times 는 값을 박스값으로 나눈 배수가 높은 것부터(같으면 값, 그다음 새것부터).
 * 상품이 없는 건(값을 모르는 건)은 맨 뒤다. 배수는 반올림한 글자(timesOfBox)가 아니라 나눈 값 그대로 견준다.
 */
export type ReviewSort = "newest" | "value" | "times";
export const REVIEW_SORTS: readonly ReviewSort[] = ["newest", "value", "times"];
export const parseSort = (raw: string | null | undefined): ReviewSort => (raw === "value" || raw === "times" ? raw : "newest");
export interface Sortable { ageMin: number; value?: number | null; times?: number | null }
export function compareBy(sort: ReviewSort): (a: Sortable, b: Sortable) => number {
  const known = (n: number | null | undefined) => (n === null || n === undefined ? -Infinity : n);
  if (sort === "newest") return (a, b) => a.ageMin - b.ageMin;
  if (sort === "value") return (a, b) => known(b.value) - known(a.value) || a.ageMin - b.ageMin;
  return (a, b) => known(b.times) - known(a.times) || known(b.value) - known(a.value) || a.ageMin - b.ageMin;
}

const two = (n: number) => String(n).padStart(2, "0");
/**
 * 기기 시간대의 YYYY.MM.DD HH:mm. 실제 기록의 시각을 적을 때 쓴다: 내 후기의 상세, 나온 상품.
 * 샘플 후기에는 쓰지 않는다(샘플은 날짜가 없고 "몇 분 전"만 있다).
 */
export function stamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${two(d.getMonth() + 1)}.${two(d.getDate())} ${two(d.getHours())}:${two(d.getMinutes())}`;
}

/** "몇 분 전" 의 구간과 그 안의 수. 화면은 이 열쇠로 문구(reviews.agoNow ...)를 고른다 */
export type AgoKey = "agoNow" | "agoMin" | "agoHour" | "agoDay" | "agoMonth" | "agoYear";
export function agoOf(ageMin: number): { key: AgoKey; n: number } {
  const m = Math.max(0, Math.floor(ageMin));
  if (m < 1) return { key: "agoNow", n: 0 };
  if (m < 60) return { key: "agoMin", n: m };
  if (m < 1440) return { key: "agoHour", n: Math.floor(m / 60) };
  if (m < 43200) return { key: "agoDay", n: Math.floor(m / 1440) };
  if (m < 525600) return { key: "agoMonth", n: Math.floor(m / 43200) };
  return { key: "agoYear", n: Math.floor(m / 525600) };
}

/** 더 보기 단추에 남은 건수를 적는 한도. 넘으면 수 없이 적는다("75,225건 남음" 은 읽히지 않는다) */
export const MORE_COUNT_MAX = 999;

/**
 * 나온 상품의 값이 박스값의 몇 배인지. 카드의 "N배" 줄이 쓴다(2026-10-13 파운더: 얼마짜리가 뽑혔는지 보여야 한다).
 * 10배 미만은 소수 첫째 자리("0.6", "1.5"), 10배부터는 정수("20", "4200": "4200.0배"는 읽기 나쁘다).
 * 0.05배에 못 미치면 null: 화면은 "박스값 미만"으로 적는다("0.0배"라고 적지 않는다). 박스값이 없으면 null
 */
export function timesOfBox(value: number, boxPrice: number): string | null {
  if (!(boxPrice > 0) || !Number.isFinite(value)) return null;
  const ratio = value / boxPrice;
  const times = ratio.toFixed(1);
  // 소수 첫째 자리로 반올림해 10.0 이 되는 것(9.98 등)도 정수로
  if (Number(times) >= 10) return String(Math.round(ratio));
  return times === "0.0" ? null : times;
}
