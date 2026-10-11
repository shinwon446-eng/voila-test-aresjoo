// 실물 상품 데이터셋 무결성 테스트
//   npm test
import test from "node:test";
import { formatRate } from "../lib/products";
import assert from "node:assert/strict";

test("published probability labels retain every configured decimal place", () => {
  for (const value of [49, 1.2345, 0.0147, 0.0001]) assert.equal(Number.parseFloat(formatRate(value)), value);
});
import { readFileSync } from "node:fs";
import {
  BOXES,
  BOX_BY_SLUG,
  CATEGORY_FILTERS,
  REFUND_RATE,
  byCategory,
  cashReturn,
  ceilingValue,
  dropTable,
  expectedValue,
  getBoxBySlug,
  heroBox,
  isValueGuaranteed,
  floorCash,
  floorRatio,
  dollarRow,
  techRow,
  luxuryRow,
  jackpotRow,
  retailReturn,
  sortBoxes,
  trending,
  RETAIL_RTP_MIN,
  RETAIL_RTP_MAX,
  FLOOR_CASH_MIN,
  FLOOR_CASH_MAX, sellValueOf, FIXED_TIERS, LOW_TIERS, PRIZE_SHARE, TARGET_CASH_RTP } from "../lib/products";
import { formatCurrency } from "../lib/formatCurrency";

test("박스 12종 이상, slug 고유", () => {
  assert.ok(BOXES.length >= 12, `박스 ${BOXES.length}종`);
  const slugs = BOXES.map((b) => b.slug);
  assert.equal(new Set(slugs).size, slugs.length, "slug 중복");
  assert.equal(Object.keys(BOX_BY_SLUG).length, BOXES.length);
});

test("박스마다 항목 7종 이상, item id 는 박스 안에서 고유 (기프트카드·캐시백은 박스 간 공유)", () => {
  for (const b of BOXES) {
    assert.ok(b.items.length >= 7, `${b.slug}: 항목 ${b.items.length}종`);
    const ids = b.items.map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length, `${b.slug}: item id 중복`);
  }
});

test("하이브리드 리워드: 바닥은 USDT 캐시백(100% 적립), 조잡한 저가 실물 꽝 없음, 중위권에 디지털 자산", () => {
  const junk = /스티커|케이블 타이|키캡|보호 필름|NATO|파우치|워치 롤|다이캐스트|모델카|굿즈/;
  for (const b of BOXES) {
    const floor = b.items.reduce((m, i) => (i.value < m.value ? i : m), b.items[0]);
    assert.equal(floor.kind, "cash", `${b.slug}: 바닥 ${floor.id}`);
    assert.equal(sellValueOf(floor), floor.value, `${b.slug}: 캐시백은 100%`);
    for (const i of b.items) assert.ok(!junk.test(i.name), `${b.slug}: 저가 실물 꽝 ${i.name}`);
    for (const i of b.items.filter((x) => x.kind !== "cash")) assert.equal(sellValueOf(i), +(i.value * REFUND_RATE).toFixed(2), i.id);
  }
  const digital = new Set(BOXES.flatMap((b) => b.items.filter((i) => i.kind === "digital").map((i) => i.id)));
  for (const id of ["gc-apple100", "gc-apple500", "gc-amazon100", "gc-steam50"]) assert.ok(digital.has(id), id);
  const drops = new Set(BOXES.flatMap((b) => b.items.filter((i) => i.kind === "cash" && i.value >= 50).map((i) => i.id)));
  for (const id of ["usdt-50", "usdt-100"]) assert.ok(drops.has(id), id);
});

test("드롭 확률 합계는 박스마다 정확히 100", () => {
  for (const b of BOXES) {
    const sum = b.items.reduce((s, i) => s + i.dropRate, 0);
    assert.equal(sum, 100, `${b.slug}: 합 ${sum}`);
    assert.ok(b.items.every((i) => i.dropRate > 0), `${b.slug}: 0 이하 확률 존재`);
  }
});

test("금액은 USDT 소수 둘째 자리까지 — 통화 기호는 데이터에 없다", () => {
  const cents = (n: number) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-9;
  for (const b of BOXES) {
    assert.ok(cents(b.price), `${b.slug}: price ${b.price}`);
    for (const i of b.items) assert.ok(cents(i.value), `${i.id}: value ${i.value}`);
  }
});

test("가격 스펙트럼: 1 USDT 박스 3종 이상, 100 USDT 잭팟 2종 이상, 전부 스펙 가격표 안", () => {
  const allowed = new Set([1, 3, 5, 20, 25, 30, 50, 100]);
  for (const b of BOXES) assert.ok(allowed.has(b.price), `${b.slug}: ${b.price}`);
  assert.ok(BOXES.filter((b) => b.price === 1).length >= 3);
  assert.ok(BOXES.filter((b) => b.price === 100).length >= 2);
});

test("잭팟 배수: 1달러 박스 1,000배 이상, 럭셔리·잭팟 1,300배 이상 항목 존재", () => {
  const top = (b: (typeof BOXES)[number]) => ceilingValue(b) / b.price;
  assert.ok(dollarRow().some((b) => top(b) >= 1000), "1달러 1,000배 없음");
  assert.ok(jackpotRow().every((b) => top(b) >= 1300), "잭팟 1,300배 미만");
  assert.ok(luxuryRow().some((b) => top(b) >= 300), "럭셔리 300배 없음");
});

test("확률표: 받는 값 기준 환수율 99%, USDT 구간 일곱, 상품 몫 22% (2026-10-11 파운더 결정)", () => {
  for (const box of BOXES) {
    const wave = (multiple: number) => box.items.find(i => i.id.startsWith("wave-") && i.value === +(box.price * multiple).toFixed(2));
    // 고정 USDT 구간: 배수와 확률이 모든 박스에서 같다
    for (const [multiple, slots] of FIXED_TIERS) {
      const tier = wave(multiple);
      assert.ok(tier, `${box.slug}: ${multiple}배 구간 누락`);
      assert.equal(tier.kind, "cash", `${box.slug}: ${multiple}배는 USDT 로 바로 들어온다`);
      assert.equal(Math.round(tier.dropRate * 10_000), slots, `${box.slug}: ${multiple}배 칸 수`);
    }
    // 가장 작은 두 구간은 환수율을 맞추려고 박스마다 칸 수가 다르다. 0.02배가 가장 흔한 결과다
    const [lowest, low] = LOW_TIERS.map(m => wave(m)!);
    assert.ok(lowest && low, `${box.slug}: 낮은 구간 누락`);
    assert.ok(lowest.kind === "cash" && low.kind === "cash");
    assert.ok(box.items.every(i => i === lowest || i.dropRate < lowest.dropRate), `${box.slug}: 0.02배가 가장 흔해야 한다`);
    assert.ok(lowest.dropRate >= 45 && lowest.dropRate <= 65, `${box.slug}: 0.02배 ${lowest.dropRate}%`);
    // 옛 기프트카드 구간은 없다(코드를 받을 길이 없었다)
    assert.ok(!box.items.some(i => i.id.startsWith("wave-gift-")), `${box.slug}: 기프트카드 구간이 남아 있다`);
    assert.ok(box.items.filter(i => i.id.startsWith("wave-")).every(i => i.kind === "cash"), `${box.slug}: 파동 구간은 전부 USDT`);
    // 상품: 전부 한 칸 이상, 값이 쌀수록 자주. 몫은 박스 가격의 22% 근처(칸은 정수라 박스마다 1%포인트 안에서 어긋난다. 그 차이는 낮은 USDT 구간이 메워 환수율은 정확히 맞는다)
    const premium = box.items.filter(i => !i.id.startsWith("wave-"));
    assert.ok(premium.length >= 6 && premium.length <= 120, `${box.slug}: 상품 수 ${premium.length}`);
    for (const i of premium) assert.ok(i.kind === "cash" || i.value >= box.price, `${box.slug}: 박스 가격보다 싼 상품 ${i.id}`);
    const sorted = [...premium].sort((x, y) => x.value - y.value);
    for (let k = 1; k < sorted.length; k++) assert.ok(sorted[k].dropRate <= sorted[k - 1].dropRate, `${box.slug}: ${sorted[k].id} 가 더 싼 상품보다 자주 나온다`);
    const share = premium.reduce((sum, i) => sum + sellValueOf(i) * i.dropRate / 100, 0) / box.price;
    assert.ok(share >= PRIZE_SHARE - 0.01 && share <= PRIZE_SHARE + 0.01, `${box.slug}: 상품 몫 ${share}`);
    const prizeOdds = premium.reduce((sum, i) => sum + i.dropRate, 0);
    assert.ok(prizeOdds >= 0.5, `${box.slug}: 상품이 200번에 한 번도 안 나온다(${prizeOdds}%)`);
    // 환수율
    assert.ok(Math.abs(cashReturn(box) - TARGET_CASH_RTP) <= 0.0005, `${box.slug}: 받는 값 기준 환수율 ${cashReturn(box)}`);
    assert.ok(cashReturn(box) < 1, `${box.slug}: 받는 값 기준 환수율은 1 미만이어야 한다`);
    assert.ok(retailReturn(box) >= RETAIL_RTP_MIN && retailReturn(box) < RETAIL_RTP_MAX, `${box.slug}: 참고가 기준 ${retailReturn(box)}`);
  }
  assert.equal(TARGET_CASH_RTP, 0.99);
});

test("최저 구성을 즉시 환급해도 원금을 넘지 못한다", () => {
  for (const b of BOXES) {
    assert.ok(
      floorCash(b) < b.price,
      `${b.slug}: 최저 보장 회수액 ${floorCash(b)} >= 가격 ${b.price}`,
    );
  }
});

test("probabilities remain representable as one-million exact outcome slots", () => {
  for (const box of BOXES) {
    const units = box.items.map(i => Math.round(i.dropRate * 10_000));
    assert.equal(units.reduce((a,b)=>a+b,0),1_000_000);
    assert.ok(units.every(n=>n>0));
    assert.ok(Number.isFinite(retailReturn(box)));
  }
});

test("가장 작은 결과는 낸 값의 0.02배이고 USDT 로 바로 들어온다", () => {
  for (const b of BOXES) {
    const r = floorRatio(b);
    assert.ok(r >= FLOOR_CASH_MIN && r <= FLOOR_CASH_MAX, `${b.slug}: 가장 작은 결과 ${(r * 100).toFixed(1)}%`);
    assert.equal(floorCash(b), +(b.price * 0.02).toFixed(2), b.slug);
    assert.equal(floorCash(b), Math.min(...b.items.map(i => sellValueOf(i))), `${b.slug}: 그보다 작은 결과가 있다`);
    assert.ok(isValueGuaranteed(b), b.slug);
  }
  for (const b of BOXES.filter((x) => x.price === 1)) assert.equal(floorCash(b), 0.02, b.slug);
  for (const b of BOXES.filter((x) => x.price === 100)) assert.equal(floorCash(b), 2, b.slug);
});

test("guaranteedMin 은 항목 최저가에서 파생된다", () => {
  for (const b of BOXES) {
    assert.equal(b.guaranteedMin, Math.min(...b.items.map((i) => i.value)), b.slug);
    assert.equal(ceilingValue(b), Math.max(...b.items.map((i) => i.value)), b.slug);
  }
});

test("4개 행 셀렉터가 전부 채워지고 카테고리 규칙을 지킨다", () => {
  assert.ok(trending().length >= 5);
  assert.deepEqual(
    trending(5)
      .slice(0, 5)
      .map((b) => b.trendingRank),
    [1, 2, 3, 4, 5],
    "TRENDING 앞머리가 순위대로 오지 않음",
  );
  for (const [row, cat] of [[dollarRow, "dollar"], [techRow, "tech"], [luxuryRow, "luxury"], [jackpotRow, "jackpot"]] as const) {
    assert.ok(row().length >= 2, cat);
    for (const b of row()) assert.equal(b.category, cat, b.slug);
  }
});

test("히어로 박스는 1 USDT 박스다", () => {
  assert.equal(heroBox().price, 1);
  assert.ok(heroBox().tagline.length > 10, "히어로 카피 누락");
});

test("카테고리는 필터 목록 안의 값만 쓰고, 필터마다 결과가 있다", () => {
  const keys = CATEGORY_FILTERS.filter((f) => f.key !== "all").map((f) => f.key);
  const allowed = new Set(keys);
  for (const b of BOXES) assert.ok(allowed.has(b.category), `${b.slug}: ${b.category}`);
  for (const k of keys) assert.ok(byCategory(k).length > 0, `빈 카테고리: ${k}`);
  assert.equal(byCategory("all").length, BOXES.length);
});

test("이미지 경로는 데이터가 아니라 productImages 가 쥔다", () => {
  for (const b of BOXES) {
    assert.ok("image" in b && "src" in b.image, b.slug);
    for (const i of b.items) assert.ok("image" in i && "src" in i.image, i.id);
  }
  // 데이터셋 어디에도 URL 문자열이 박혀 있으면 안 된다
  const flat = JSON.stringify(BOXES.map((b) => ({ t: b.tone, g: b.tagline, i: b.items.map((x) => x.code) })));
  assert.ok(!/https?:\/\//.test(flat), "데이터셋에 URL 이 직접 박혀 있다");
});

test("정렬 키가 원본을 변형하지 않고 올바르게 동작한다", () => {
  const before = BOXES.map((b) => b.slug);
  const asc = sortBoxes(BOXES, "price-asc").map((b) => b.price);
  const desc = sortBoxes(BOXES, "price-desc").map((b) => b.price);
  assert.deepEqual(asc, [...asc].sort((a, b) => a - b));
  assert.deepEqual(desc, [...desc].sort((a, b) => b - a));
  assert.deepEqual(BOXES.map((b) => b.slug), before, "원본 배열이 변형됨");
  assert.equal(getBoxBySlug("jackpot-car")?.titleEn, "car box");
  assert.equal(getBoxBySlug("no-such-box"), undefined);
});

test("dropTable 은 실판매가 내림차순이며 원본을 변형하지 않는다", () => {
  for (const b of BOXES) {
    const order = dropTable(b).map((i) => i.value);
    assert.deepEqual(order, [...order].sort((x, y) => y - x), b.slug);
    assert.equal(b.items.length, order.length);
  }
});

test("박스 가격은 세 통화 어느 쪽으로도 혼용 없이 렌더된다", () => {
  for (const b of BOXES) {
    assert.match(formatCurrency(b.price, "USDT"), /^[\d,]+\u00A0USDT$/, b.slug);
    assert.match(formatCurrency(b.price, "USD"), /^\$[\d,]+$/, b.slug);
    assert.match(formatCurrency(b.price, "KRW"), /^₩[\d,]+$/, b.slug);
  }
});

test("카피와 데이터에 이모지가 없다", () => {
  const emoji = new RegExp("[\\uD83C-\\uDBFF][\\uDC00-\\uDFFF]|[\\u2600-\\u27BF\\u2B00-\\u2BFF\\uFE0F]");
  const strings: string[] = [];
  for (const b of BOXES) {
    strings.push(b.title, b.titleEn, b.badge, b.slug, b.code, b.tagline);
    for (const i of b.items) strings.push(i.name, i.nameEn, i.code);
  }
  for (const f of CATEGORY_FILTERS) strings.push(f.label);
  for (const s of strings) assert.ok(!emoji.test(s), `이모지 포함: ${s}`);
});

test("컬렉션 이미지는 유효한 로컬 WebP이며 출처와 imageUrl 별칭을 보존한다", () => {
  let have = 0;
  for (const b of BOXES) {
    assert.equal(b.imageUrl, b.image.src, b.slug);
    for (const x of [b, ...b.items]) {
      assert.equal(x.imageUrl, x.image.src, x.id);
      if (x.image.src) {
        have += 1;
        assert.match(
          x.image.src,
          /^\/(?:voila-test-aresjoo\/)?assets\/photography\/(?:photo|commons|unsplash|studio)-[\w.-]+\.webp$/,
          `${x.id}: 검증된 로컬 이미지 경로 필요`,
        );
        const assetPath = x.image.src.slice(x.image.src.indexOf("/assets/"));
        const image = readFileSync(new URL(`../public${assetPath}`, import.meta.url));
        assert.ok(image.length > 1000, `${x.id}: 빈 이미지`);
        assert.equal(image.toString("ascii", 0, 4), "RIFF", `${x.id}: 잘못된 WebP 헤더`);
        assert.equal(image.toString("ascii", 8, 12), "WEBP", `${x.id}: 잘못된 WebP 형식`);
        assert.ok(x.image.credit && x.image.credit.length > 8, `${x.id}: 출처 누락`);
        // Unsplash 사진은 Unsplash License, Wikimedia Commons 사진은 CC BY / CC BY-SA / CC0 / Public domain 가운데 하나
        // 생성 이미지는 라이선스 대신 "생성 이미지" 라고 적는다(lib/productImages.ts GENERATED)
        assert.match(x.image.credit!, /Unsplash License|CC BY|CC0|Public domain|CC-BY|생성 이미지/i, `${x.id}: 라이선스 표기 누락`);
      }
    }
  }
  // 전면 개편 중 상품을 크게 늘려 사진 수집이 따라오는 중이다. 수집이 끝나면 실물 전체로 올린다.
  assert.ok(have >= 12, `확보 이미지 ${have}장`);
  // 모든 박스 커버는 이미지가 있어야 한다
  for (const b of BOXES) assert.ok(b.image.src, `${b.slug}: 커버 이미지 없음`);
  // 히어로와 TRENDING 상위는 반드시 이미지가 있어야 한다
  assert.ok(heroBox().image.src, "히어로 이미지 누락");
  for (const b of trending(5)) assert.ok(b.image.src, `${b.slug}: TRENDING 이미지 누락`);
});
