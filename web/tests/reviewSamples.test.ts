// 샘플 후기(lib/reviewSamples, flow/MELT_SPEC.md V1~V6): 박스마다 80~400건, 결정적, 한 박스 안에서 겹치지 않는 글, 카탈로그 사진, 스위치
// 글의 뜻도 본다. 주소로 열 수 있는 모든 박스(BOXES, 홈에서 내린 옛 박스 포함)의 모든 건에서:
//   돈 이야기는 그 건에서 참일 때만, 미개봉과 새제품은 그런 상품에만, 상품과 맞지 않는 말(향수를 가방이라 부르기)이 없는지,
//   별점과 글의 결, 점수를 말하는 줄과 별점, 다시 열겠다는 말이 없는지, 가까운 열 건의 조각, 다시 쓰는 손님의 몫, 좋아요의 분포
// 상품의 종류는 생성기의 판정(kindOf)을 믿지 않고 상품 이름으로 따로 가려서도 본다.
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { BOXES, BOX_BY_SLUG, HOME_BOXES, type ProductBox, type ProductItem } from "../lib/products";
import { BANNED, CLOSE, EN, GOT, GRIPE, ITEM, MID, MID_CLOSE, NEG, NEG_CLOSE, SHIP, USE, USE_GIFT, ZH, type Frag } from "../lib/reviewSampleText";
import { BIG_FLOOR, BUILT_CAP, FRONT, NEAR, RETURNING_SHARE, SAMPLE_MAX, SAMPLE_MIN, allRatingSummary, builtCount, kindOf, newestSamples, ratingSummary, sampleCount, sampleParts, sampleReviews, sampleShapes, summarizeRatings, type ReviewSample } from "../lib/reviewSamples";
import { takeAmountOf } from "../lib/takeBatch";

const PROBE = ["watch-rolex", "pokemon-charizard", "beauty-dior"];
const digestOf = (lists: unknown) => createHash("sha256").update(JSON.stringify(lists)).digest("hex");
const HOME = new Set(HOME_BOXES.map((box) => box.slug));

interface Row { box: ProductBox; item: ProductItem; r: ReviewSample; shape: string; parts: readonly string[]; flat: string; home: boolean }
interface Shot { box: ProductBox; list: ReviewSample[]; rows: Row[] }
let shots: Shot[] | null = null;
/**
 * 모든 박스의 모든 건을 한 번 만들어 쥔다(생성기는 최근에 쓴 박스 몇 개의 글만 쥐므로, 검사마다 다시 만들지 않게).
 * 건마다: 그 건의 상품, 글이 지어진 모양, 쓴 조각, 띄어쓰기를 뺀 소문자 글
 */
function allShots(): Shot[] {
  if (shots) return shots;
  shots = BOXES.map((box) => {
    const items = new Map(box.items.map((item) => [item.id, item]));
    const list = sampleReviews(box.slug), shapes = sampleShapes(box.slug), parts = sampleParts(box.slug);
    return { box, list, rows: list.map((r, k) => ({ box, item: items.get(r.itemId)!, r, shape: shapes[k], parts: parts[k], flat: r.text.replace(/\s/g, "").toLowerCase(), home: HOME.has(box.slug) })) };
  });
  return shots;
}
function eachSample(visit: (row: Row) => void): number {
  let total = 0;
  for (const shot of allShots()) for (const row of shot.rows) { total += 1; visit(row); }
  return total;
}
const flatOf = (pool: readonly Frag[]): string[] => pool.map((frag) => frag.text.replace(/\s/g, "").toLowerCase());
const mark = (row: Row) => `${row.box.slug} / ${row.item.name} $${row.item.value}: ${row.r.rating}점 ${row.r.text}`;

test("샘플 후기: 모든 박스가 80건 이상 400건 이하이고 홈에서는 싼 박스가 더 많다", () => {
  assert.equal(SAMPLE_MIN, 80); assert.equal(SAMPLE_MAX, 400);
  assert.ok(BOXES.length > HOME_BOXES.length, "옛 박스가 없다");
  for (const box of BOXES) { const n = sampleCount(box.slug); assert.ok(Number.isInteger(n) && n >= 80 && n <= 400, `${box.slug}: ${n}`); }
  const byPrice = new Map<number, number[]>();
  for (const box of HOME_BOXES) byPrice.set(box.price, [...(byPrice.get(box.price) ?? []), sampleCount(box.slug)]);
  const mean = (list: number[]) => list.reduce((a, b) => a + b, 0) / list.length;
  const prices = Array.from(byPrice.keys()).sort((a, b) => a - b);
  assert.ok(prices.length >= 2);
  for (let k = 1; k < prices.length; k++) assert.ok(mean(byPrice.get(prices[k - 1])!) > mean(byPrice.get(prices[k])!), `${prices[k - 1]} 달러 박스가 ${prices[k]} 달러 박스보다 많아야 한다`);
});

test("샘플 후기: 박스 목록의 요약은 글을 만들지 않고도 목록과 같은 수와 같은 분포다", () => {
  const started = performance.now();
  const summaries = BOXES.map((box) => ratingSummary(box.slug));
  // 모든 박스의 요약 전부가 한 화면(24장)을 그리는 시간보다 훨씬 짧아야 한다
  assert.ok(performance.now() - started < 1000, "요약이 느리다");
  allShots().forEach(({ box, list }, k) => {
    assert.equal(summaries[k].count, list.length, box.slug);
    assert.equal(sampleCount(box.slug), list.length, box.slug);
    assert.deepEqual(summaries[k], summarizeRatings(list.map((r) => r.rating)), box.slug);
    assert.ok(summaries[k].avg !== null && summaries[k].avg >= 3.8 && summaries[k].avg <= 4.9, `${box.slug}: ${summaries[k].avg}`);
  });
  // 모아 보기의 머리는 주소로 열 수 있는 모든 박스를 센다(목록과 같은 모집단)
  const all = allRatingSummary();
  assert.equal(all.count, summaries.reduce((sum, s) => sum + s.count, 0));
  // 별 넷과 다섯이 대부분이고 셋 이하도 있다
  assert.ok((all.dist[3] + all.dist[4]) / all.count > 0.75);
  assert.ok(all.dist[0] > 0 && all.dist[1] > 0 && all.dist[2] > 0);
  // 이 기기에서 쓴 후기의 점수는 샘플 위에 더해진다
  assert.equal(ratingSummary(BOXES[0].slug, [5, 1]).count, summaries[0].count + 2);
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

test("샘플 후기: 글은 최근에 쓴 박스 몇 개의 것만 쥐고, 밀려난 박스는 다시 만들어도 같은 글이다", () => {
  const slug = PROBE[0], before = digestOf(sampleReviews(slug)), head = sampleReviews(slug, 7);
  // 한도보다 많은 다른 박스를 건드려 이 박스의 글을 밀어낸다
  const others = BOXES.filter((box) => box.slug !== slug).slice(0, BUILT_CAP + 5);
  for (const box of others) sampleReviews(box.slug, 3);
  assert.ok(builtCount() <= BUILT_CAP, `쥐고 있는 박스 ${builtCount()}개`);
  // 밀려난 뒤: 앞의 몇 건만 다시 만들어도, 전부 다시 만들어도 같다
  assert.deepEqual(sampleReviews(slug, 7), head);
  assert.equal(digestOf(sampleReviews(slug)), before);
  assert.equal(sampleShapes(slug).length, sampleReviews(slug).length);
  for (const box of BOXES) sampleReviews(box.slug, 1);
  assert.ok(builtCount() <= BUILT_CAP);
});

test("샘플 후기: 한 박스 안에서 같은 글이 두 번 나오지 않고(글자를 덧붙여 다르게 만든 글도 없다), 금지 문자와 베낀 글이 없다", () => {
  const langs = { ko: 0, en: 0, zh: 0 };
  for (const { box, list } of allShots()) {
    assert.equal(new Set(list.map((r) => r.text)).size, list.length, `${box.slug}: 같은 글`);
    assert.equal(new Set(list.map((r) => r.id)).size, list.length, `${box.slug}: 같은 번호`);
    for (const r of list) {
      langs[r.lang] += 1;
      // 글 끝의 물결표는 띄어 붙인 끝말(~, ~~)과 중국어 끝말(～) 하나뿐이다. 겹친 글에 물결표를 덧붙여 다르게 만들지 않는다
      assert.doesNotMatch(r.text, /[^ ~]~+$|~{3,}$|～{2,}$/, `${box.slug}: ${r.text}`);
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

test(`샘플 후기: 한 박스의 연속 ${NEAR}건 안에서는 같은 조각이 다시 나오지 않는다`, () => {
  assert.equal(NEAR, 10);
  let parts = 0;
  for (const { box, rows } of allShots()) {
    rows.forEach((row, k) => {
      parts += row.parts.length;
      assert.ok(row.parts.length >= 1, mark(row));
      assert.equal(new Set(row.parts).size, row.parts.length, `한 글 안에서 같은 조각: ${mark(row)}`);
      for (let j = Math.max(0, k - (NEAR - 1)); j < k; j++) for (const part of row.parts) assert.ok(!rows[j].parts.includes(part), `${box.slug} ${j + 1}번과 ${k + 1}번: ${part}`);
    });
  }
  assert.ok(parts > 100000, `조각 ${parts}개`);
});

test("샘플 후기: 어느 박스든 가장 새 글은 한국어이고, 처음 보이는 다섯 건 가운데 한국어가 아닌 글은 많아야 하나다", () => {
  // 박스 화면이 처음 보여 주는 건수와 같은 수다
  assert.equal(FRONT, 5);
  assert.match(fs.readFileSync(new URL("../components/box/BoxReviews.tsx", import.meta.url), "utf8"), /export const BOX_REVIEWS_FIRST = 5;/);
  let front = 0, frontForeign = 0, all = 0, allForeign = 0;
  for (const { box, list } of allShots()) {
    assert.equal(list[0].lang, "ko", `${box.slug}: 가장 새 글이 ${list[0].lang}`);
    const foreign = list.slice(0, FRONT).filter((r) => r.lang !== "ko").length;
    assert.ok(foreign <= 1, `${box.slug}: 처음 ${FRONT}건 가운데 외국어 ${foreign}건`);
    // 첫 화면에는 같은 별명이 두 번 보이지 않는다(다시 쓰는 손님의 글은 그 뒤에 온다)
    assert.equal(new Set(list.slice(0, FRONT).map((r) => r.author)).size, Math.min(FRONT, list.length), box.slug);
    front += Math.min(FRONT, list.length); frontForeign += foreign;
    all += list.length; allForeign += list.filter((r) => r.lang !== "ko").length;
  }
  // 앞에서 뺀 외국어 글은 뒤로 옮겼을 뿐이다: 전체의 외국어 몫은 그대로(약 15%)이고, 맨 앞에도 외국어 글이 남아 있다
  assert.ok(allForeign / all > 0.1 && allForeign / all < 0.2, `외국어 ${allForeign / all}`);
  assert.ok(frontForeign > 100 && frontForeign / front < 0.2, `맨 앞의 외국어 ${frontForeign} / ${front}`);
  // 모아 보기의 맨 위도 한국어다(어느 박스의 가장 새 글이므로)
  assert.equal(newestSamples(1)[0].lang, "ko");
});

test("샘플 후기: 박스마다 5~8% 는 다시 쓰는 손님의 글이고(같은 별명, 같은 언어), 그 사람의 글은 붙어 나오지 않는다", () => {
  assert.deepEqual(RETURNING_SHARE, [0.05, 0.08]);
  for (const { box, list } of allShots()) {
    const rows = new Map<string, ReviewSample[]>();
    list.forEach((r, k) => {
      rows.set(r.author, [...(rows.get(r.author) ?? []), r]);
      if (k > 0) assert.notEqual(r.author, list[k - 1].author, `${box.slug}: ${r.author} 의 글이 붙어 나왔다`);
    });
    const share = (list.length - rows.size) / list.length;
    assert.ok(share >= RETURNING_SHARE[0] && share <= RETURNING_SHARE[1], `${box.slug}: 다시 쓴 글의 몫 ${share}`);
    rows.forEach((mine, author) => {
      assert.equal(new Set(mine.map((r) => r.lang)).size, 1, `${box.slug}: ${author} 의 언어가 바뀌었다`);
      assert.ok(mine.length <= 4, `${box.slug}: ${author} 가 ${mine.length}번 썼다`);
    });
  }
});

test("샘플 후기: 돈 이야기(본전, 손해가 아니다, 이득)는 받을 금액이 박스 가격 이상인 건에만 나오고, 몇 번 열었다는 말과 한 글에 들지 않는다", () => {
  // 띄어쓰기를 뺀 소문자 글에서 찾는다
  const CLAIM = /본전|손해|이득|남는장사|박스값|굳었|득템|쏠쏠|꽤하네요|worthit|fortheprice|值了|值得/;
  const SHORT = /박스값엔못미치|돈아깝/;
  const COUNT = /번열|번만에|번째|첫판|여러개열|작은건usdt|thirdbox|twoboxes|onthesmallones|第三次|开了两个|小的领了/;
  let claims = 0, shorts = 0, near = 0;
  eachSample((row) => {
    const { box, item, flat } = row, take = takeAmountOf({ valueUsdt: item.value });
    if (SHORT.test(flat)) { shorts += 1; assert.ok(take < box.price, mark(row)); }
    else if (CLAIM.test(flat)) {
      claims += 1;
      assert.ok(take >= box.price, mark(row));
      // 상품가가 박스 가격의 0.7배에서 1.5배 사이인 건에서 틀리던 자리다
      if (item.value < box.price * 1.5) near += 1;
    }
    if (COUNT.test(flat)) assert.ok(!CLAIM.test(flat) && !SHORT.test(flat), mark(row));
  });
  assert.ok(claims > 500 && shorts > 0 && near > 0, `${claims} / ${shorts} / ${near}`);
  // 파운더가 짚은 세 건: 받을 금액이 박스 가격에 못 미치면 본전이라는 말이 나올 수 없다
  for (const [value, price] of [[379.99, 500], [399, 500], [229.99, 250]]) assert.ok(takeAmountOf({ valueUsdt: value }) < price);
});

test("샘플 후기: 미개봉, 밀봉, 봉인은 밀봉 상품에만, 새제품은 새 제품에만 쓴다", () => {
  const SEALED = /미개봉|밀봉|봉인|비닐도안뜯|씰|실링|sealed|未拆/, FRESH = /새제품|새거|새폰|brandnew|全新/;
  let sealed = 0, fresh = 0;
  eachSample((row) => {
    const kind = kindOf(row.box, row.item);
    if (SEALED.test(row.flat)) { sealed += 1; assert.ok(kind === "sealed" || kind === "pack", `(${kind}) ${mark(row)}`); }
    if (FRESH.test(row.flat)) { fresh += 1; assert.ok(kind !== "single" && kind !== "vehicle" && kind !== "digital", `(${kind}) ${mark(row)}`); }
  });
  assert.ok(sealed > 100 && fresh > 100, `${sealed} / ${fresh}`);
});

test("샘플 후기: 상품과 맞지 않는 말이 없다(상품의 종류를 이름으로 따로 가려서 본다. 옛 박스도 같다)", () => {
  // 생성기의 종류 판정을 쓰지 않는다: 이름과 박스만으로 그 상품이 무엇인지 정하고, 그 상품에 나오면 안 되는 말을 찾는다
  const PARCEL = /배송|택배|포장|상자|뽁뽁이|완충재|통관|문앞|shipping|box|customs|packag|物流|包装|盒子|箱/;
  const seen = { card: 0, graded: 0, car: 0, bike: 0, perfume: 0, watchPart: 0, rinse: 0, bottle: 0, ticket: 0, cheapBag: 0, old: 0 };
  eachSample((row) => {
    const { box, item, flat, r } = row, name = item.name;
    const carBox = box.category === "car" || /^jackpot-(?:car|supercar)$/.test(box.slug), cardBox = box.category === "pokemon" || box.slug === "vault-pokemon";
    const watchBox = box.category === "watch" || box.slug === "vault-submariner";
    // 낱장 카드와 등급 카드: 밀봉도 새제품도 아니고, 쓰는 물건도 아니다
    if (cardBox && /(?:PSA|BGS|CGC) ?\d|\d\/[A-Z]*\d|프로모|미등급/.test(name)) {
      seen.card += 1; if (/PSA|BGS|CGC/.test(name)) seen.graded += 1; if (!row.home) seen.old += 1;
      assert.doesNotMatch(flat, /미개봉|밀봉|봉인|비닐|새제품|새거|구성품빠짐없이|잘쓰고|매일써요|쓸게요|쓰는중|개시했|sealed|brandnew|everyday|未拆|全新|在用/, mark(row));
    }
    // 차와 바이크: 택배로 오지 않는다(차 박스의 15,000달러가 넘는 상품, 그리고 이름이 바이크인 것)
    const car = carBox && item.value >= 15000 && !/체스트|러기지|골드바/.test(name);
    const bike = carBox && item.value >= 1500 && /두카티|할리|가와사키|트라이엄프|아프릴리아|스즈키|KTM|베스파|모토라드|골드윙|전기 바이크/.test(name);
    if (car || bike) {
      if (car) seen.car += 1; else seen.bike += 1; if (!row.home) seen.old += 1;
      assert.equal(r.lang, "ko", mark(row));
      assert.doesNotMatch(flat, PARCEL, mark(row));
      assert.doesNotMatch(flat, /미개봉|밀봉|새제품|매일써요|구성품/, mark(row));
    }
    // 향수는 어느 박스에서나 향수다: 가방이라고 부르지 않고 가방의 말을 하지 않는다
    if (/퍼퓸|뚜왈렛|빠르펭|파르펭|코롱|향수/.test(name) && !/캔들|디퓨저|로션|크림|워시|샤워|비누|헤어|바디|핸드|데오/.test(name)) {
      seen.perfume += 1;
      assert.doesNotMatch(flat, /가방|^백|백(?:뽑|잘|받|나왔|하나|실물|상태|마음|갖고|인증|득템|사려|깨끗|필요)|드디어백|들고나가|들고다녀|수납|더스트백|각잡혀|가죽|보증카드|시계|손목/, mark(row));
    }
    // 시계의 부속품과 소모품은 시계가 아니다(줄은 따로다: 줄의 말에는 시계와 손목이 나온다)
    if (watchBox && /오일|그리스|클리너|클로스|핀셋|드라이버|루페|와인더|스탠드|공구|스프링바|리무버|오프너|보관함|버클|블로어|렌치|폴리시|배터리|타임그래퍼|클래스프|커프링크스|선글라스|케이스|파우치|워치 롤/.test(name) && !/스트랩|밴드|브레이슬릿/.test(name)) {
      seen.watchPart += 1;
      assert.doesNotMatch(flat, /시계|손목|차고|실착|오차/, mark(row));
    }
    // 상품권이 아닌 디지털 상품(참가권, 시공권, 게임)은 상품권이라고 부르지 않는다
    if (item.kind === "digital" && !/기프트카드|상품권/.test(name)) {
      seen.ticket += 1;
      assert.doesNotMatch(flat, /상품권|기프트카드|잔액|결제할때/, mark(row));
      if (/참가권|시공권|케어/.test(name)) assert.doesNotMatch(flat, /코드|내려받/, mark(row));
    }
    // 가방 박스의 싼 가방(천 가방, 나일론 백팩)에는 가죽과 더스트백 이야기가 붙지 않는다
    if ((box.category === "bag" || box.slug === "vault-handbag") && item.value < 100) {
      seen.cheapBag += 1;
      assert.doesNotMatch(flat, /가죽냄새|더스트백|보증카드/, mark(row));
    }
    // 씻어내는 것에는 바르고 흡수되는 말이 붙지 않는다
    if (/클렌저|클렌징|워시|샴푸|스크럽|비누|(?:^|\s)솝(?:\s|$)/.test(name)) {
      seen.rinse += 1;
      assert.doesNotMatch(flat, /흡수|발림|바르고|아껴바르|다음날피부/, mark(row));
    }
    // 보냉이 되지 않는 물병에는 얼음 이야기가 붙지 않고, 텀블러라고 부르지 않는다
    if (/스퀴즈|물통|소프트 ?(?:보틀|플라스크)|셰이커|싱글 월|워터 보틀|블렌더보틀|밀크 저그|프로싱 저그/.test(name) && !/보냉|보온|써모|서멀/.test(name)) {
      seen.bottle += 1;
      assert.doesNotMatch(flat, /얼음|보냉|텀블러/, mark(row));
    }
  });
  assert.ok(seen.card > 1000 && seen.graded > 100 && seen.car > 20 && seen.bike > 20 && seen.perfume > 500 && seen.watchPart > 100 && seen.rinse > 50 && seen.bottle > 20 && seen.ticket > 20 && seen.cheapBag > 500 && seen.old > 100, JSON.stringify(seen));
});

test("샘플 후기: 별점과 글의 결이 맞는다(별 하나와 둘은 까닭 한 가지, 셋은 그저 그렇다, 넷은 좋았고 작은 아쉬움 하나까지, 다섯은 좋았다)", () => {
  const GOOD = "(?:thing|got|use|ship|close|flow)";
  const SHAPE: Record<number, RegExp> = {
    1: /^neg(?: negc| neg)?(?: tail)?$/, 2: /^neg(?: negc| neg)?(?: tail)?$/, 3: /^mid(?: midc| mid)?(?: tail)?$/,
    // 아쉬운 한 줄은 맨 끝에 하나, 그 뒤에는 웃음이 없다
    4: new RegExp(`^(?:${GOOD}(?: ${GOOD})*(?: tail| gripe)?|gripe)$`), 5: new RegExp(`^${GOOD}(?: ${GOOD})*(?: tail)?$`),
  };
  const sour = [GRIPE, MID, MID_CLOSE, NEG, NEG_CLOSE, EN.gripe, EN.mid, EN.neg, ZH.gripe, ZH.mid, ZH.neg].flatMap(flatOf);
  const sweet = [GOT.big, GOT.good, CLOSE, SHIP, USE, USE_GIFT, ITEM, EN.pos, EN.ship, EN.close, ZH.pos, ZH.ship, ZH.close].flatMap(flatOf);
  const CHEER = /(?:ㅎ|ㅋ|\^\^|굿|bb|최고|짱|대박|미쳤다|~|lol|haha|:\)|哈哈|～)$/;
  const seen = [0, 0, 0, 0, 0];
  let gripes = 0;
  eachSample((row) => {
    const { r, shape, flat } = row, where = `[${shape}] ${mark(row)}`;
    seen[r.rating - 1] += 1;
    assert.match(shape, SHAPE[r.rating], where);
    const gripe = shape.includes("gripe");
    if (gripe) gripes += 1;
    // 좋은 글에는 아쉬운 조각이 없다
    if (r.rating === 5 || (r.rating === 4 && !gripe)) for (const line of sour) assert.ok(!flat.includes(line), `${where} <- ${line}`);
    // 아쉬운 글은 웃음으로 끝나지 않고, 별 하나와 둘에는 좋았다는 조각이 없다
    if (r.rating <= 3 || gripe) assert.doesNotMatch(flat, CHEER, where);
    if (r.rating <= 2) for (const line of sweet) assert.ok(!flat.includes(line), `${where} <- ${line}`);
    if (r.rating <= 2) assert.doesNotMatch(flat, /감사|추천|만족|좋아요|좋네요|thanks|recommend|谢谢|推荐/, where);
  });
  assert.ok(seen.every((n) => n > 500) && gripes > 1000, `${seen} / ${gripes}`);
});

test("샘플 후기: 점수를 말하는 줄은 그 건의 별점과 같다(만점이라고 쓴 글은 별 다섯뿐이다)", () => {
  // 띄어쓰기를 뺀 소문자 글에서 찾는다. [그 말, 그 말이 나올 수 있는 별점]
  const SCORE: [RegExp, number][] = [
    [/10\/10|만점|별다섯|별5개|5점|五星|满分|5stars|fivestars?|5\/5/, 5],
    [/별하나뺐|별넷|별4개|4stars|fourstars?|四星|4\/5/, 4],
    [/별셋|별두개뺐|별3개|3stars|threestars?|三星|3\/5/, 3],
    [/별둘|별2개|2stars|twostars?|两星/, 2],
    [/별하나(?!뺐)|별1개|1star|onestar|一星/, 1],
  ];
  const seen = [0, 0, 0, 0, 0];
  eachSample((row) => {
    for (const [re, rating] of SCORE) if (re.test(row.flat)) { seen[rating - 1] += 1; assert.equal(row.r.rating, rating, mark(row)); }
  });
  assert.ok(seen[4] > 50 && seen[3] > 50 && seen[2] > 50, String(seen));
});

test("샘플 후기: 별점은 받은 것과 받는 과정에 대한 만족이다(작고 흔한 상품도 별 다섯이 나오고, 큰 상품도 받는 과정이 불편했으면 별 셋이다)", () => {
  const ARRIVAL = /배송|포장|박스|상자|통관|문의|날짜|일정|안내|걸렸|shipping|box|customs|weeks|arrive|物流|盒子|外箱|等了|清关/;
  let small = 0, smallFive = 0, big = 0, bigThree = 0;
  eachSample((row) => {
    const { box, item, r, shape, flat } = row, x = item.value / box.price;
    if (x < 0.7) { small += 1; if (r.rating === 5) smallFive += 1; }
    if (x >= 8 && item.value >= BIG_FLOOR) {
      big += 1;
      // 큰 것이 나온 건의 점수가 깎였다면 까닭은 받는 과정뿐이고, 별 셋 아래로는 내려가지 않는다
      assert.ok(r.rating >= 3, mark(row));
      if (r.rating === 3) { bigThree += 1; assert.match(shape, /^mid/, mark(row)); assert.match(flat, ARRIVAL, mark(row)); }
    }
  });
  assert.ok(smallFive / small > 0.3 && smallFive / small < 0.6, `작은 결과의 별 다섯 ${smallFive / small}`);
  assert.ok(bigThree > 20 && bigThree / big < 0.1, `큰 결과의 별 셋 ${bigThree} / ${big}`);
});

test(`샘플 후기: 상품가가 ${BIG_FLOOR}달러에 못 미치는 건에는 크게 당첨된 듯한 말이 붙지 않는다(1달러 박스의 20달러짜리도 배수는 20배다)`, () => {
  assert.equal(BIG_FLOOR, 300);
  const jackpot = flatOf(GOT.big);
  let cheap = 0, old = 0;
  eachSample((row) => {
    const { box, item, flat } = row;
    if (item.value >= BIG_FLOOR) return;
    if (item.value / box.price >= 8) { cheap += 1; if (!row.home) old += 1; }
    for (const line of jackpot) assert.ok(!flat.includes(line), `${mark(row)} <- ${line}`);
    assert.doesNotMatch(flat, /(?:대박|미쳤다|ㄷㄷ)$|당첨|로또|소리질렀|심장떨어|손떨려/, mark(row));
  });
  // 배수만 보면 큰 결과였을 건이 실제로 있다(옛 1달러, 3달러, 5달러 박스와 20달러 박스)
  assert.ok(cheap > 500 && old > 300, `${cheap} / ${old}`);
});

test("샘플 후기: 다시 열겠다거나 또 오겠다는 말, 다음 박스를 기다린다는 말, 잃은 것을 되찾으려는 말이 없다(세 언어, 별명 포함)", () => {
  const PUSH = new RegExp([
    // 잃은 것을 되찾으려는 말과 부추기는 말
    "중독|다신안열려다|월급날|될때까지|본전이안나오|대박나길|큰거나오길|더큰거노려|이맛에|저위에꺼|한방|언젠간대박|이번엔되겠지|오늘도뽑는다|통장이텅장",
    // 다시 열겠다, 또 오겠다, 다음을 기다린다
    "한번더|한번만더|또열|다시열|더열어|또올게|또와|다시올|다시옵니다|계속이용|계속열|믿고엽니다|다음박스|다음에또|다음엔|담엔|다음번|다음판|다음달에|또이용|재구매|기대중",
    "openagain|openanother|openmore|doitagain|willbeback|bebackformore|comeback|nextbox|nexttime|anotherbox|onemore|keepopening|oneday",
    "再来|再开|再买|下次|继续|还会|回购|咸鱼翻身",
  ].join("|"));
  eachSample((row) => {
    assert.doesNotMatch(row.flat, PUSH, mark(row));
    assert.doesNotMatch(row.r.author.replace(/\s/g, "").toLowerCase(), PUSH, `${row.box.slug}: ${row.r.author}`);
  });
  // 검수에서 짚인 다섯 문구는 이 식에 걸린다
  for (const text of ["한번 더 열어볼게요", "한번 더 열어봐야겠어요", "다음 박스도 기대중", "will open again", "would do it again", "下次再来", "또 올게요"]) assert.match(text.replace(/\s/g, "").toLowerCase(), PUSH, text);
});

test("샘플 후기: 서비스의 흐름을 말하는 줄은 적은 몫으로 물건 이야기와 함께만 나온다", () => {
  const FLOW = /usdt|보관함|검증|확률표|확률다|verifypage|验证/;
  let flow = 0;
  const total = eachSample((row) => {
    if (!FLOW.test(row.flat)) return;
    flow += 1;
    // 그 줄만으로 끝나는 글은 없다
    assert.ok(row.shape.replace(/ tail$/, "").split(" ").length >= 2, `[${row.shape}] ${mark(row)}`);
  });
  assert.ok(flow / total > 0.01 && flow / total < 0.08, `흐름을 말하는 글의 몫 ${flow / total}`);
});

test("샘플 후기: 한 글 안에서 말이 서로 어긋나거나 겹치지 않는다(뜯지 않았다와 쓰고 있다, 받았다는 인사 두 번, 바라던 것과 아닌 것)", () => {
  const UNOPENED = /미개봉이에요|미개봉으로소장|못뜯겠|뜯을지말지/, USED = /개시했|쓰는중|쓰고있|매일써|깠어요|깠는데/;
  const RECEIVED = /잘받았|잘도착|기분좋게받았|잘왔어요|받았습니다|받고기분좋|드디어.{1,8}받았어요|일단받았어요/g;
  const UNWANTED = /원하던건아니|기대했던건아니/, WANTED = /사려던|필요했|갖고싶었|갖고싶던|살까말까|장바구니/;
  let received = 0;
  eachSample((row) => {
    assert.ok(!(UNOPENED.test(row.flat) && USED.test(row.flat)), mark(row));
    assert.ok(!(UNWANTED.test(row.flat) && WANTED.test(row.flat)), mark(row));
    const hits = row.flat.match(RECEIVED)?.length ?? 0;
    if (hits > 0) received += 1;
    assert.ok(hits <= 1, mark(row));
  });
  assert.ok(received > 3000, `받았다는 인사 ${received}건`);
});

test("샘플 후기: 좋아요는 절반 넘게 0 이고 위쪽 끝에 몰리지 않는다", () => {
  const counts = new Map<number, number>();
  const total = eachSample(({ r }) => { counts.set(r.likes, (counts.get(r.likes) ?? 0) + 1); });
  const top = Math.max(...Array.from(counts.keys())), zero = (counts.get(0) ?? 0) / total;
  assert.ok(zero > 0.5 && zero < 0.7, `0 의 몫 ${zero}`);
  // 끝값(99)에서 잘린 글이 없다: 가장 큰 값은 그 아래이고 그 값의 글은 한두 건이다
  assert.ok(top < 99 && counts.get(top)! <= 2, `가장 큰 값 ${top}, ${counts.get(top)}건`);
  // 많을수록 드물다
  const at = (from: number, to: number) => Array.from(counts.entries()).filter(([n]) => n >= from && n < to).reduce((sum, [, c]) => sum + c, 0);
  assert.ok(at(1, 3) > at(3, 10) && at(3, 10) > at(10, 30) && at(10, 30) > at(30, 100), `${at(1, 3)} ${at(3, 10)} ${at(10, 30)} ${at(30, 100)}`);
});

test("샘플 후기: 상품은 그 박스의 구성품이고, 사진은 카탈로그의 그 상품 사진뿐이다", () => {
  let photos = 0, withImage = 0;
  for (const { box, list } of allShots()) {
    const items = new Map(box.items.map((item) => [item.id, item]));
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

test("샘플 후기: 홈의 박스에서는 흔한 상품이 많고 비싼 상품은 드물다", () => {
  let below = 0, big = 0, huge = 0, total = 0;
  eachSample(({ box, item, home }) => {
    if (!home) return;
    const x = item.value / box.price;
    total += 1; if (x < 1.5) below += 1; if (x >= 8) big += 1; if (x >= 60) huge += 1;
  });
  assert.ok(below / total > 0.5, `흔한 결과 ${below / total}`);
  assert.ok(big / total < 0.1 && big > 0, `큰 결과 ${big / total}`);
  assert.ok(huge / total < 0.02, `아주 큰 결과 ${huge / total}`);
});

test("샘플 후기: 모아 보기는 주소로 열 수 있는 모든 박스를 가리지 않고 새것부터다", () => {
  const list = newestSamples(400);
  assert.equal(list.length, 400);
  for (let k = 1; k < list.length; k++) assert.ok(list[k].ageMin >= list[k - 1].ageMin);
  assert.ok(new Set(list.map((r) => r.boxSlug)).size > 10);
  assert.equal(new Set(list.map((r) => r.id)).size, 400);
  // 홈에서 내린 옛 박스의 글도 섞여 있다(별점의 머리와 같은 모집단이다)
  assert.ok(list.some((r) => !HOME.has(r.boxSlug)), "옛 박스의 글이 없다");
  // 어느 박스의 가장 새 글도 이 목록의 첫 글보다 새롭지 않다
  for (const { box, list: mine } of allShots()) assert.ok(mine[0].ageMin >= list[0].ageMin, box.slug);
  assert.deepEqual(newestSamples(20), list.slice(0, 20));
  // 목록과 같은 건이다
  const first = list[0], same = allShots().find(({ box }) => box.slug === first.boxSlug)!.list.find((r) => r.id === first.id);
  assert.deepEqual(first, same);
});

test("샘플 후기: 스위치를 끄면 한 건도 나오지 않는다", () => {
  const before = process.env.NEXT_PUBLIC_SAMPLE_REVIEWS;
  try {
    for (const off of ["off", "0", "false"]) {
      process.env.NEXT_PUBLIC_SAMPLE_REVIEWS = off;
      for (const slug of [HOME_BOXES[0].slug, "vault-pokemon"]) {
        assert.equal(sampleCount(slug), 0);
        assert.deepEqual(sampleReviews(slug), []);
        assert.deepEqual(ratingSummary(slug), { count: 0, avg: null, dist: [0, 0, 0, 0, 0] });
        // 이 기기에서 실제로 쓴 후기는 그대로 센다
        assert.deepEqual(ratingSummary(slug, [5, 4]), { count: 2, avg: 4.5, dist: [0, 0, 0, 1, 1] });
      }
      assert.deepEqual(newestSamples(10), []);
      assert.equal(allRatingSummary().count, 0);
    }
    process.env.NEXT_PUBLIC_SAMPLE_REVIEWS = "on";
    assert.ok(sampleCount(HOME_BOXES[0].slug) >= 80);
  } finally {
    if (before === undefined) delete process.env.NEXT_PUBLIC_SAMPLE_REVIEWS; else process.env.NEXT_PUBLIC_SAMPLE_REVIEWS = before;
  }
});
