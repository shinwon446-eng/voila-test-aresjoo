// 후기 화면의 셈(lib/reviewFeed): 박스 카드와 박스 화면이 같은 별점 집계를 쓰는지(샘플 스위치를 켠 때와 끈 때), "몇 분 전" 의 구간
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { BOX_BY_SLUG, HOME_BOXES, getBoxBySlug } from "../lib/products";
import { MORE_COUNT_MAX, agoOf, allRating, boxRating, feedOrder, isRealReview, realRatings, stamp } from "../lib/reviewFeed";
import { allRatingSummary, newestSamples, ratingSummary, sampleCount, sampleReviews } from "../lib/reviewSamples";

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

test("후기 목록의 차례(F-02): 내 후기가 며칠이 지나도 맨 앞이고(내 것 가운데 새것부터), 그 뒤에 샘플이 새것부터 온다", () => {
  const day = 1440;
  // 쓴 지 40일, 14분, 3일 된 내 후기
  const mine = [{ id: "m40", ageMin: 40 * day, mine: true }, { id: "m0", ageMin: 14, mine: true }, { id: "m3", ageMin: 3 * day, mine: true }];
  // 박스 화면: 그 박스의 샘플
  const box = sampleReviews(SLUG, 30).map((s) => ({ id: s.id, ageMin: s.ageMin, mine: false }));
  assert.ok(box[0].ageMin < 3 * day, "이 박스의 가장 새 샘플이 사흘보다 새롭다(나이로 섞으면 내 글이 밀린다)");
  const first = feedOrder(mine, box, 5);
  assert.deepEqual(first.map((c) => c.id), ["m0", "m3", "m40", box[0].id, box[1].id]);
  // 더 펴도 내 후기는 앞의 세 자리이고 샘플의 차례는 그대로다
  const more = feedOrder(mine, box, 25);
  assert.equal(more.length, 25);
  assert.deepEqual(more.slice(0, 3).map((c) => c.id), ["m0", "m3", "m40"]);
  assert.deepEqual(more.slice(3).map((c) => c.id), box.slice(0, 22).map((c) => c.id));
  // 모아 보기: 사흘 된 내 후기도 첫 화면에 있다(나이로 섞으면 수백 건 뒤다)
  const all = newestSamples(20).map((s) => ({ id: s.id, ageMin: s.ageMin, mine: false }));
  assert.ok(all[19].ageMin < 3 * day);
  assert.deepEqual(feedOrder(mine, all, 20).slice(0, 3).map((c) => c.id), ["m0", "m3", "m40"]);
  // 내 후기가 없으면 샘플 그대로, 0건을 달라면 빈 목록
  assert.deepEqual(feedOrder([], box, 5), box.slice(0, 5));
  assert.deepEqual(feedOrder(mine, box, 0), []);
  // 화면이 이 차례를 쓴다
  assert.match(read("../components/box/BoxReviews.tsx"), /cards: feedOrder\(mine, cards, shown\)/);
});

test("내 후기의 시각(F-03): 상세에는 쓴 날짜와 시각을 그대로 적고, 목록의 행과 샘플은 몇 분 전으로 적는다", () => {
  // 기기 시간대의 YYYY.MM.DD HH:mm
  assert.equal(stamp("2026-09-02T12:00:00"), "2026.09.02 12:00");
  assert.equal(stamp("2026-01-05T03:07:59"), "2026.01.05 03:07");
  assert.equal(stamp(new Date(2026, 11, 31, 23, 59).toISOString()), "2026.12.31 23:59");
  // 읽을 수 없는 값은 받은 그대로
  assert.equal(stamp("모름"), "모름");
  const reviews = read("../components/box/BoxReviews.tsx");
  // 상세: 내 후기는 stamp, 샘플은 ago
  assert.match(reviews, /card\.mine && card\.at \? stamp\(card\.at\) : ago\(card\.ageMin\)/);
  // 목록의 행은 누구의 글이든 몇 분 전
  assert.match(reviews, /className="v-rv-ago v-small v-num">\{ago\(card\.ageMin\)\}/);
  // 샘플에는 쓴 시각이 없다
  assert.match(reviews, /ageMin: s\.ageMin, at: null,/);
  // 나온 상품 화면이 쓰던 길도 그대로다
  assert.match(read("../components/box/WinsScreen.tsx"), /import \{ stamp \} from "\.\/BoxReviews";/);
});

test("편 건수(F-01): 박스 화면과 모아 보기가 편 건수와 읽던 자리를 방문 기록의 그 자리에 적고, 그리기 전에 되살린다(브라우저에서의 확인은 scripts/capture/flow-reviews-nav.mjs)", () => {
  const reviews = read("../components/box/BoxReviews.tsx"), screen = read("../components/box/ReviewsScreen.tsx");
  // 적는 곳은 방문 기록의 그 자리다: 뒤로 오면 돌아오고 새 방문에는 없다
  assert.match(reviews, /window\.history\.replaceState\(\{ \.\.\.state, \[SHOWN_STATE\]: \{ key: listKey, shown: n, y: Math\.round\(window\.scrollY\) \}/);
  assert.match(reviews, /saved\.key === listKey && Number\.isInteger\(saved\.shown\) && saved\.shown > first/);
  // 되살린 뒤에 읽던 자리로 옮긴다
  assert.match(reviews, /window\.scrollTo\(0, y\)/);
  // 두 화면이 같은 것을 쓰고, 목록의 이름이 서로 다르다
  assert.match(reviews, /useShownRows\("box:" \+ box\.slug, BOX_REVIEWS_FIRST\)/);
  assert.match(screen, /useShownRows\("reviews:" \+ picked, ALL_REVIEWS_FIRST\)/);
  // 처음 그릴 때는 언제나 처음 건수다(미리 그린 HTML 과 같다)
  assert.match(reviews, /const \[shown, setShown\] = useState\(first\);/);
  assert.doesNotMatch(screen, /useState\(ALL_REVIEWS_FIRST\)/);
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
  assert.match(reviews, /useShownRows\("box:" \+ box\.slug, BOX_REVIEWS_FIRST\)/);
  assert.match(screen, /useShownRows\("reviews:" \+ picked, ALL_REVIEWS_FIRST\)/);
  assert.equal(MORE_COUNT_MAX, 999);
  assert.match(reviews, /left > MORE_COUNT_MAX \? t\("reviews\.moreListPlain"\) : t\("reviews\.moreList"/);
});

test("박스 찾기(F-07): 객체에 원래 있는 이름(constructor, __proto__, toString, hasOwnProperty)은 박스가 아니다. 없는 박스와 같이 다룬다", () => {
  const real = realRatings(REVIEWS);
  for (const slug of ["constructor", "__proto__", "toString", "hasOwnProperty", "valueOf", "no-such-box"]) {
    assert.equal(BOX_BY_SLUG[slug], undefined, slug);
    assert.equal(getBoxBySlug(slug), undefined, slug);
    // 모아 보기의 ?box= 는 이 표에서 찾은 박스가 있을 때만 알약을 둔다
    assert.equal(isRealReview({ id: "r9", boxSlug: slug }), false, slug);
    assert.equal(sampleCount(slug), 0, slug);
    assert.deepEqual(sampleReviews(slug, 5), [], slug);
    assert.equal(boxRating(slug, real).count, 0, slug);
    assert.equal(realRatings([{ id: "r9", boxSlug: slug, rating: 5 }]).size, 0, slug);
  }
  // 있는 박스는 그대로 찾는다
  assert.equal(BOX_BY_SLUG[SLUG]?.slug, SLUG);
  assert.equal(Object.keys(BOX_BY_SLUG).length > 300, true);
  // 모아 보기는 주소의 글자를 이 표에서 찾는다
  assert.match(read("../components/box/ReviewsScreen.tsx"), /const askedBox = asked \? BOX_BY_SLUG\[asked\] \?\? null : null;/);
});

test("더 보기 뒤(F-05): 초점은 새로 생긴 첫 글로 가고, 늘어난 건수는 알림 영역에 적는다(브라우저에서의 확인은 scripts/capture/flow-reviews-nav.mjs)", () => {
  const reviews = read("../components/box/BoxReviews.tsx");
  // 누른 때의 건수를 적어 두고, 건수가 는 뒤에 그 자리의 글로 초점을 옮긴다(누르지 않고 는 것은 건드리지 않는다)
  assert.match(reviews, /onClick=\{\(\) => \{ asked\.current = count; onMore\(\); \}\}/);
  assert.match(reviews, /if \(from === null \|\| count <= from\) return;/);
  assert.match(reviews, /querySelectorAll<HTMLElement>\("\.v-rv-btn"\)\[from\]/);
  assert.match(reviews, /first\?\.focus\(\{ preventScroll: true \}\)/);
  // 알림 영역은 처음부터 있고(나중에 생기면 읽히지 않는다) 공손하게 읽는다
  assert.match(reviews, /<p className="v-rv-sr" role="status" aria-live="polite" data-reviews-live>\{loaded\}<\/p>/);
  // 알림 글은 누를 때마다 달라야 다시 읽힌다: 늘어난 건수와 지금 보이는 건수를 함께 적는다
  for (const locale of ["ko", "en", "zh"]) {
    const text = (JSON.parse(read(`../messages/v.${locale}.json`)).reviews as Record<string, string>).moreLoaded;
    assert.ok(text.includes("{n}") && text.includes("{shown}"), `${locale}: ${text}`);
  }
});
