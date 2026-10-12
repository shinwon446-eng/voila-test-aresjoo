// 후기 화면의 셈(lib/reviewFeed): 박스 카드와 박스 화면이 같은 별점 집계를 쓰는지(샘플 스위치를 켠 때와 끈 때), "몇 분 전" 의 구간
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { HOME_BOXES } from "../lib/products";
import { MORE_COUNT_MAX, agoOf, allRating, boxRating, isRealReview, realRatings } from "../lib/reviewFeed";
import { allRatingSummary, ratingSummary, sampleCount } from "../lib/reviewSamples";

const read = (path: string) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const SLUG = HOME_BOXES[0].slug, OTHER = HOME_BOXES[1].slug;
/** 저장소에 있는 꼴의 후기: 실제 후기 셋(한 박스에 둘, 다른 박스에 하나), 운영팀의 예시 하나, 없어진 박스의 것 하나 */
const REVIEWS = [
  { id: "r1", boxSlug: SLUG, rating: 1 },
  { id: "r2", boxSlug: SLUG, rating: 5 },
  { id: "r3", boxSlug: OTHER, rating: 2 },
  { id: "review_example_v1_a", boxSlug: SLUG, rating: 5 },
  { id: "r4", boxSlug: SLUG, rating: 5, source: "example" },
  { id: "r5", boxSlug: "no-such-box", rating: 3 },
];

function withSwitch(value: string, run: () => void) {
  const before = process.env.NEXT_PUBLIC_SAMPLE_REVIEWS;
  process.env.NEXT_PUBLIC_SAMPLE_REVIEWS = value;
  try { run(); } finally { if (before === undefined) delete process.env.NEXT_PUBLIC_SAMPLE_REVIEWS; else process.env.NEXT_PUBLIC_SAMPLE_REVIEWS = before; }
}

test("후기 집계: 실제 후기만 박스마다 모은다(예시와 없어진 박스의 것은 뺀다)", () => {
  const real = realRatings(REVIEWS);
  assert.deepEqual(real.get(SLUG), [1, 5]);
  assert.deepEqual(real.get(OTHER), [2]);
  assert.equal(real.size, 2);
  assert.equal(REVIEWS.filter(isRealReview).length, 3);
});

test("후기 집계: 샘플 스위치를 켠 때, 카드와 박스 화면은 샘플 위에 실제 후기를 더한 같은 수다", () => {
  withSwitch("on", () => {
    const real = realRatings(REVIEWS), samples = sampleCount(SLUG);
    assert.ok(samples >= 80);
    const card = boxRating(SLUG, real);
    assert.equal(card.count, samples + 2);
    assert.deepEqual(card, ratingSummary(SLUG, [1, 5]));
    // 실제 후기가 없는 박스는 샘플만
    assert.deepEqual(boxRating(HOME_BOXES[2].slug, real), ratingSummary(HOME_BOXES[2].slug));
    // 모아 보기의 머리는 모든 박스의 샘플에 실제 후기 셋을 더한 것
    assert.equal(allRating(real).count, allRatingSummary().count + 3);
    assert.deepEqual(allRating(real), allRatingSummary([1, 5, 2]));
  });
});

test("후기 집계: 샘플 스위치를 끈 때도, 실제 후기가 있는 박스의 카드에는 별점이 남는다", () => {
  for (const off of ["off", "0", "false"]) withSwitch(off, () => {
    const real = realRatings(REVIEWS);
    assert.deepEqual(boxRating(SLUG, real), { count: 2, avg: 3, dist: [1, 0, 0, 0, 1] });
    assert.deepEqual(boxRating(OTHER, real), { count: 1, avg: 2, dist: [0, 1, 0, 0, 0] });
    // 실제 후기가 없는 박스는 별점이 없다(카드는 그 줄을 그리지 않는다)
    assert.deepEqual(boxRating(HOME_BOXES[2].slug, real), { count: 0, avg: null, dist: [0, 0, 0, 0, 0] });
    assert.equal(allRating(real).count, 3);
  });
});

test("후기 집계: 박스 카드와 박스 화면과 모아 보기는 같은 함수를 쓴다(따로 세는 곳이 없다)", () => {
  const list = read("../components/box/BoxList.tsx"), reviews = read("../components/box/BoxReviews.tsx");
  // 카드: 실제 후기를 뺀 채 샘플만 세던 호출이 없고, 목록이 한 번 모은 것을 카드에 넘긴다
  assert.doesNotMatch(list, /ratingSummary\(/);
  assert.match(list, /const real = useRealRatings\(\);/);
  assert.match(list, /rating=\{boxRating\(box\.slug, real\)\}/);
  // 박스 화면과 모아 보기
  assert.doesNotMatch(reviews, /ratingSummary\(/);
  assert.match(reviews, /boxSlug \? boxRating\(boxSlug, real\) : allRating\(real\)/);
});

test("후기 시각: 몇 분 전, 몇 시간 전, 며칠 전의 경계", () => {
  const cases: [number, string, number][] = [
    [0, "agoNow", 0], [0.99, "agoNow", 0], [-5, "agoNow", 0],
    [1, "agoMin", 1], [59, "agoMin", 59], [59.9, "agoMin", 59],
    [60, "agoHour", 1], [119, "agoHour", 1], [120, "agoHour", 2], [1439, "agoHour", 23],
    [1440, "agoDay", 1], [2879, "agoDay", 1], [2880, "agoDay", 2], [43199, "agoDay", 29],
    [43200, "agoMonth", 1], [525599, "agoMonth", 12],
    [525600, "agoYear", 1], [1051200, "agoYear", 2],
  ];
  for (const [ageMin, key, n] of cases) assert.deepEqual(agoOf(ageMin), { key, n }, String(ageMin));
  // 세 언어에 그 문구가 다 있다
  for (const locale of ["ko", "en", "zh"]) {
    const reviews = JSON.parse(read(`../messages/v.${locale}.json`)).reviews as Record<string, string>;
    for (const key of ["agoNow", "agoMin", "agoHour", "agoDay", "agoMonth", "agoYear"]) assert.equal(typeof reviews[key], "string", `${locale} ${key}`);
  }
});

test("후기 목록: 처음 건수는 화면마다 따로이고, 남은 건수가 많으면 더 보기 단추에 수를 적지 않는다", () => {
  const reviews = read("../components/box/BoxReviews.tsx"), screen = read("../components/box/ReviewsScreen.tsx");
  assert.match(reviews, /export const BOX_REVIEWS_FIRST = 5;/);
  assert.match(reviews, /export const ALL_REVIEWS_FIRST = 20;/);
  assert.match(reviews, /export const REVIEWS_STEP = 20;/);
  assert.match(reviews, /useState\(BOX_REVIEWS_FIRST\)/);
  assert.match(screen, /useState\(ALL_REVIEWS_FIRST\)/);
  assert.equal(MORE_COUNT_MAX, 999);
  assert.match(reviews, /left > MORE_COUNT_MAX \? t\("reviews\.moreListPlain"\) : t\("reviews\.moreList"/);
});
