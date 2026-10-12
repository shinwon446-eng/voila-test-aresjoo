// 샘플 후기(lib/reviewSamples, flow/MELT_SPEC.md V1~V6): 박스마다 80~400건, 결정적, 한 박스 안에서 겹치지 않는 글, 카탈로그 사진, 스위치
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { BOXES, BOX_BY_SLUG, HOME_BOXES } from "../lib/products";
import { BANNED } from "../lib/reviewSampleText";
import { SAMPLE_MAX, SAMPLE_MIN, allRatingSummary, newestSamples, ratingSummary, sampleCount, sampleReviews, summarizeRatings } from "../lib/reviewSamples";

const PROBE = ["watch-rolex", "pokemon-charizard", "beauty-dior"];
const digestOf = (lists: unknown) => createHash("sha256").update(JSON.stringify(lists)).digest("hex");

test("샘플 후기: 홈의 모든 박스가 80건 이상 400건 이하이고 싼 박스가 더 많다", () => {
  assert.equal(SAMPLE_MIN, 80); assert.equal(SAMPLE_MAX, 400);
  const byPrice = new Map<number, number[]>();
  for (const box of HOME_BOXES) {
    const n = sampleCount(box.slug);
    assert.ok(Number.isInteger(n) && n >= 80 && n <= 400, `${box.slug}: ${n}`);
    byPrice.set(box.price, [...(byPrice.get(box.price) ?? []), n]);
  }
  const mean = (list: number[]) => list.reduce((a, b) => a + b, 0) / list.length;
  const prices = Array.from(byPrice.keys()).sort((a, b) => a - b);
  assert.ok(prices.length >= 2);
  for (let k = 1; k < prices.length; k++) assert.ok(mean(byPrice.get(prices[k - 1])!) > mean(byPrice.get(prices[k])!), `${prices[k - 1]} 달러 박스가 ${prices[k]} 달러 박스보다 많아야 한다`);
});

test("샘플 후기: 박스 목록의 요약은 글을 만들지 않고도 목록과 같은 수와 같은 분포다", () => {
  const started = performance.now();
  const summaries = HOME_BOXES.map((box) => ratingSummary(box.slug));
  // 320개 박스의 요약 전부가 한 화면(24장)을 그리는 시간보다 훨씬 짧아야 한다
  assert.ok(performance.now() - started < 1000, "요약이 느리다");
  HOME_BOXES.forEach((box, k) => {
    const list = sampleReviews(box.slug);
    assert.equal(summaries[k].count, list.length, box.slug);
    assert.equal(sampleCount(box.slug), list.length, box.slug);
    assert.deepEqual(summaries[k], summarizeRatings(list.map((r) => r.rating)), box.slug);
    assert.ok(summaries[k].avg !== null && summaries[k].avg >= 3.8 && summaries[k].avg <= 4.9, `${box.slug}: ${summaries[k].avg}`);
  });
  const all = allRatingSummary();
  assert.equal(all.count, summaries.reduce((sum, s) => sum + s.count, 0));
  // 별 넷과 다섯이 대부분이고 셋 이하도 있다
  assert.ok((all.dist[3] + all.dist[4]) / all.count > 0.75);
  assert.ok(all.dist[0] > 0 && all.dist[1] > 0 && all.dist[2] > 0);
  // 이 기기에서 쓴 후기의 점수는 샘플 위에 더해진다
  assert.equal(ratingSummary(HOME_BOXES[0].slug, [5, 1]).count, summaries[0].count + 2);
});

test("샘플 후기: 같은 박스는 언제나 같은 후기다(만드는 순서, 건수, 프로세스와 무관)", () => {
  for (const slug of PROBE) assert.ok(BOX_BY_SLUG[slug], slug);
  // 여기서는 조금씩 늘려 가며 만들고, 다른 프로세스에서는 한 번에 만든다
  for (const slug of PROBE) { sampleReviews(slug, 5); sampleReviews(slug, 37); }
  const here = PROBE.map((slug) => sampleReviews(slug));
  PROBE.forEach((slug, k) => {
    assert.deepEqual(sampleReviews(slug, 12), here[k].slice(0, 12));
    assert.deepEqual(sampleReviews(slug), here[k]);
  });
  const code = `import { createHash } from "node:crypto"; import { sampleReviews } from "./lib/reviewSamples"; const lists = ${JSON.stringify(PROBE)}.map((slug) => sampleReviews(slug)); console.log(createHash("sha256").update(JSON.stringify(lists)).digest("hex"));`;
  const there = execFileSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", code], { cwd: fileURLToPath(new URL("..", import.meta.url)), encoding: "utf8" }).trim();
  assert.equal(there, digestOf(here));
});

test("샘플 후기: 한 박스 안에서 같은 글과 같은 별명이 두 번 나오지 않고, 금지 문자와 베낀 글이 없다", () => {
  const langs = { ko: 0, en: 0, zh: 0 };
  for (const box of HOME_BOXES) {
    const list = sampleReviews(box.slug);
    assert.equal(new Set(list.map((r) => r.text)).size, list.length, `${box.slug}: 같은 글`);
    assert.equal(new Set(list.map((r) => r.author)).size, list.length, `${box.slug}: 같은 별명`);
    assert.equal(new Set(list.map((r) => r.id)).size, list.length, `${box.slug}: 같은 번호`);
    for (const r of list) {
      langs[r.lang] += 1;
      // 긴 줄표, 짧은 줄표, 가운뎃점 종류, 느낌표
      assert.doesNotMatch(r.text + r.author, /[—–·・‧•ㆍ!！]/, `${box.slug}: ${r.text}`);
      assert.ok(r.text.trim().length >= 2 && r.text === r.text.trim() && !r.text.includes("{"), `${box.slug}: "${r.text}"`);
      assert.ok(r.author.trim().length >= 2, `${box.slug}: "${r.author}"`);
      assert.ok(!BANNED.has(r.text) && !BANNED.has(r.author), `${box.slug}: ${r.text} / ${r.author}`);
      assert.ok(!r.text.includes("참고가"));
    }
  }
  const total = langs.ko + langs.en + langs.zh;
  assert.ok(langs.ko / total > 0.8 && langs.ko / total < 0.9, `한국어 ${langs.ko / total}`);
  assert.ok(langs.en > 0 && langs.zh > 0);
});

test("샘플 후기: 상품은 그 박스의 구성품이고, 사진은 카탈로그의 그 상품 사진뿐이다", () => {
  let photos = 0, withImage = 0;
  for (const box of BOXES) {
    const items = new Map(box.items.map((item) => [item.id, item]));
    const list = sampleReviews(box.slug);
    let last = -1;
    for (const r of list) {
      const item = items.get(r.itemId);
      assert.ok(item, `${box.slug}: ${r.itemId} 는 이 박스의 상품이 아니다`);
      assert.notEqual(item.kind, "cash", `${box.slug}: USDT 결과에 후기가 붙었다`);
      assert.ok([1, 2, 3, 4, 5].includes(r.rating));
      assert.ok(Number.isInteger(r.likes) && r.likes >= 0 && r.likes <= 99);
      // 새것부터다
      assert.ok(Number.isInteger(r.ageMin) && r.ageMin > 0 && r.ageMin >= last, `${box.slug}: 순서`);
      last = r.ageMin;
      if (item.image.src) withImage += 1;
      if (r.photo !== null) { photos += 1; assert.equal(r.photo, item.image.src, `${box.slug}: 사진이 카탈로그의 것이 아니다`); }
      // 디지털 상품(옛 박스의 상품권)은 배송이 없다
      if (item.kind === "digital") { assert.equal(r.lang, "ko"); assert.doesNotMatch(r.text, /배송|택배|포장|상자|미개봉|비닐|구성품/, `${box.slug}: ${r.text}`); }
    }
  }
  // 사진이 있는 상품의 후기 가운데 일부에만 사진이 붙는다
  assert.ok(photos > 0 && photos < withImage, `${photos} / ${withImage}`);
});

test("샘플 후기: 흔한 상품이 많고 비싼 상품은 드물다", () => {
  let below = 0, big = 0, huge = 0, total = 0;
  for (const box of HOME_BOXES) {
    const items = new Map(box.items.map((item) => [item.id, item]));
    for (const r of sampleReviews(box.slug)) {
      const x = items.get(r.itemId)!.value / box.price;
      total += 1; if (x < 1.5) below += 1; if (x >= 8) big += 1; if (x >= 60) huge += 1;
    }
  }
  assert.ok(below / total > 0.5, `흔한 결과 ${below / total}`);
  assert.ok(big / total < 0.1 && big > 0, `큰 결과 ${big / total}`);
  assert.ok(huge / total < 0.02, `아주 큰 결과 ${huge / total}`);
});

test("샘플 후기: 모아 보기는 박스를 가리지 않고 새것부터다", () => {
  const list = newestSamples(60);
  assert.equal(list.length, 60);
  for (let k = 1; k < list.length; k++) assert.ok(list[k].ageMin >= list[k - 1].ageMin);
  assert.ok(new Set(list.map((r) => r.boxSlug)).size > 10);
  assert.equal(new Set(list.map((r) => r.id)).size, 60);
  // 어느 박스의 가장 새 글도 이 목록의 첫 글보다 새롭지 않다
  for (const box of HOME_BOXES) assert.ok(sampleReviews(box.slug, 1)[0].ageMin >= list[0].ageMin, box.slug);
  assert.deepEqual(newestSamples(20), list.slice(0, 20));
});

test("샘플 후기: 스위치를 끄면 한 건도 나오지 않는다", () => {
  const before = process.env.NEXT_PUBLIC_SAMPLE_REVIEWS;
  try {
    for (const off of ["off", "0", "false"]) {
      process.env.NEXT_PUBLIC_SAMPLE_REVIEWS = off;
      const slug = HOME_BOXES[0].slug;
      assert.equal(sampleCount(slug), 0);
      assert.deepEqual(sampleReviews(slug), []);
      assert.deepEqual(newestSamples(10), []);
      assert.deepEqual(ratingSummary(slug), { count: 0, avg: null, dist: [0, 0, 0, 0, 0] });
      assert.equal(allRatingSummary().count, 0);
      // 이 기기에서 실제로 쓴 후기는 그대로 센다
      assert.deepEqual(ratingSummary(slug, [5, 4]), { count: 2, avg: 4.5, dist: [0, 0, 0, 1, 1] });
    }
    process.env.NEXT_PUBLIC_SAMPLE_REVIEWS = "on";
    assert.ok(sampleCount(HOME_BOXES[0].slug) >= 80);
  } finally {
    if (before === undefined) delete process.env.NEXT_PUBLIC_SAMPLE_REVIEWS; else process.env.NEXT_PUBLIC_SAMPLE_REVIEWS = before;
  }
});
