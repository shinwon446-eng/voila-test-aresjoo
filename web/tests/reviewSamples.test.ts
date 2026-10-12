// 샘플 후기(lib/reviewSamples, flow/MELT_SPEC.md V1~V6): 박스마다 80~400건, 결정적, 한 박스 안에서 겹치지 않는 글, 카탈로그 사진, 스위치
// 글의 뜻도 본다. 주소로 열 수 있는 모든 박스(BOXES, 홈에서 내린 옛 박스 포함)의 모든 건에서:
//   돈 이야기는 그 건에서 참일 때만, 미개봉과 새제품은 그런 상품에만, 상품과 맞지 않는 말(향수를 가방이라 부르기)이 없는지,
//   별점과 글의 결, 점수를 말하는 줄과 별점, 다시 열겠다는 말이 없는지, 가까운 열 건의 조각, 다시 쓰는 손님의 몫, 좋아요의 분포,
//   본전이라는 말과 받을 금액의 띠, 이 사이트에 없는 수령 길(코드 발송, 설치, 문의 창구)을 말하지 않는지, 상표만 보고 본품의 말을 붙이지 않는지
// 상품의 종류는 생성기의 판정(kindOf)을 믿지 않고 상품 이름으로 따로 가려서도 본다.
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { BOXES, BOX_BY_SLUG, HOME_BOXES, type ProductBox, type ProductItem } from "../lib/products";
import { BANNED, CLOSE, EN, GOT, PAR_BAND, GRIPE, ITEM, MID, MID_CLOSE, NEG, NEG_CLOSE, SHIP, USE, USE_GIFT, ZH, type Frag } from "../lib/reviewSampleText";
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

test("샘플 후기: 돈 이야기는 그 건에서 참이다. 낸 것보다 많이 받았다는 말은 받을 금액이 박스 가격 이상인 건에만, 딱 본전이라는 말은 박스 가격의 100%에서 110% 사이인 건에만(세 언어)", () => {
  assert.deepEqual(PAR_BAND, [1, 1.1]);
  // 띄어쓰기를 뺀 소문자 글에서 찾는다.
  // PAR: 정확히 또는 거의 본전이라는 말. MORE: 낸 것보다 많이 받았다, 손해가 아니다, 값을 한다는 말. SHORT: 못 미친다는 말
  const PAR = /딱본전|본전이네요|본전치기|본전은건졌|박스값정도|breakeven|brokeeven|回本|保本/;
  const MORE = /하고도남|뽑고도남|이득|남는장사|굳었|득템|쏠쏠|꽤하네요|손해는아니|손해안본|worthit|fortheprice|值了|值得|赚/;
  const SHORT = /박스값엔못미치|돈아깝/;
  const ANY = /본전|손해|이득|박스값|굳었|득템|쏠쏠|꽤하네요|worth|fortheprice|值/;
  const COUNT = /번열|번만에|번째|첫판|여러개열|작은건usdt|thirdbox|twoboxes|onthesmallones|第三次|开了两个|小的领了/;
  let par = 0, more = 0, shorts = 0, near = 0, wide = 0;
  eachSample((row) => {
    const { box, item, flat } = row, take = takeAmountOf({ valueUsdt: item.value }), x = take / box.price;
    if (SHORT.test(flat)) { shorts += 1; assert.ok(take < box.price, mark(row)); }
    else if (PAR.test(flat)) {
      par += 1;
      assert.ok(x >= PAR_BAND[0] && x <= PAR_BAND[1], `받을 금액 ${take} / 박스 ${box.price}: ${mark(row)}`);
    } else if (MORE.test(flat)) {
      more += 1;
      assert.ok(take >= box.price, `받을 금액 ${take} / 박스 ${box.price}: ${mark(row)}`);
      // 상품가가 박스 가격의 0.7배에서 1.5배 사이인 건에서 틀리던 자리다
      if (item.value < box.price * 1.5) near += 1;
      if (x > PAR_BAND[1]) wide += 1;
    } else assert.doesNotMatch(flat, ANY, `어느 뜻인지 정하지 않은 돈 이야기: ${mark(row)}`);
    if (COUNT.test(flat)) assert.ok(!ANY.test(flat), mark(row));
  });
  assert.ok(par > 100 && more > 500 && shorts > 0 && near > 0 && wide > 0, `${par} / ${more} / ${shorts} / ${near} / ${wide}`);
  // 파운더가 짚은 세 건: 받을 금액이 박스 가격에 못 미치면 본전이라는 말이 나올 수 없다
  for (const [value, price] of [[379.99, 500], [399, 500], [229.99, 250]]) assert.ok(takeAmountOf({ valueUsdt: value }) < price);
  // 검수에서 짚인 건: 50달러 박스에서 70달러 상품의 받을 금액은 66.50달러라 본전의 띠 밖이다
  assert.equal(takeAmountOf({ valueUsdt: 70 }), 66.5);
  assert.ok(66.5 / 50 > PAR_BAND[1]);
});

test("샘플 후기: 미개봉, 밀봉, 봉인은 밀봉 상품에만, 새제품은 새 제품에만 쓴다", () => {
  const SEALED = /미개봉|밀봉|봉인|비닐도안뜯|씰|실링|sealed|未拆/, FRESH = /새제품|새거|새폰|brandnew|全新/;
  let sealed = 0, fresh = 0;
  eachSample((row) => {
    const kind = kindOf(row.box, row.item);
    if (SEALED.test(row.flat)) { sealed += 1; assert.ok(kind === "sealed" || kind === "cosmetic" || kind === "pack", `(${kind}) ${mark(row)}`); }
    if (FRESH.test(row.flat)) { fresh += 1; assert.ok(kind !== "single" && kind !== "vehicle" && kind !== "digital", `(${kind}) ${mark(row)}`); }
  });
  assert.ok(sealed > 100 && fresh > 100, `${sealed} / ${fresh}`);
});

test("샘플 후기: 이름으로 따로 가린 여덟 가지 상품(낱장 카드, 차와 바이크, 향수, 시계 부속품, 씻어내는 것, 보냉이 안 되는 병, 싼 가방)에 그 상품과 맞지 않는 말이 없다(옛 박스도 같다)", () => {
  // 생성기의 종류 판정을 쓰지 않는다: 이름과 박스만으로 그 상품이 무엇인지 정하고, 그 상품에 나오면 안 되는 말을 찾는다
  const PARCEL = /배송|택배|포장|상자|뽁뽁이|완충재|통관|문앞|shipping|box|customs|packag|物流|包装|盒子|箱/;
  const seen = { card: 0, graded: 0, car: 0, bike: 0, perfume: 0, watchPart: 0, rinse: 0, bottle: 0, cheapBag: 0, old: 0 };
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
  assert.ok(seen.card > 1000 && seen.graded > 100 && seen.car > 20 && seen.bike > 20 && seen.perfume > 500 && seen.watchPart > 100 && seen.rinse > 50 && seen.bottle > 20 && seen.cheapBag > 500 && seen.old > 100, JSON.stringify(seen));
});

test("샘플 후기: 상표나 본품의 낱말이 이름에 들었다고 본품의 말을 하지 않는다. 아래 표의 조합(레고 수납함, 인형 상표의 책, 신발 상표의 관리 용품, 본품 이름 뒤에 부속품 낱말이 붙은 것)에서 본다", () => {
  // 생성기의 판정(kindOf, PART)을 쓰지 않는다. 이름만으로 "상표나 본품 낱말이 들었지만 본품이 아닌 상품"을 가려, 본품의 말이 나오지 않는지 본다.
  // 이름을 넣어 부르는 줄("레고 나왔네요")을 띄어쓰기 없는 글에서 찾는 식
  const called = (nouns: string) => `(?:${nouns})(?:나왔네요|뽑았어요|잘받았|받았습니다|하나생겼|득템했|실물좋|상태좋|마음에들|갖고싶었|인증합|잘도착|사려던|받고기분|깨끗하게|필요했는데|잘쓸게)|드디어(?:${nouns})받았`;
  // 본품 이름 뒤에 붙어 부속품이나 보관 용품을 만드는 낱말(뒤에 크기나 개수가 올 수 있다)
  const TAIL = /(?:받침대|번지|거치대|크래들|클립|암|어댑터|충전 그립|충전 거치대|충전 스테이션|그립 테이프|캡 세트|커버|스탠드|케이스|호퍼|마커|라켓 백|브래킷|배터리)(?:\s(?:\d\S*|세트|풀사이즈|프로|LP|V\d+|플러스))*$/;
  // [무엇인지, 박스의 카테고리(null 이면 어디서나), 이름이 맞아야 하는 식, 본품이 아니라는 식, 나오면 안 되는 본품의 말]
  const TABLE: [string, string | null, RegExp, RegExp, RegExp][] = [
    ["세트 번호가 없는 레고(수납함, 게임)", null, /^레고 /, /^(?!.*\d{4,6}$)/, new RegExp("조립|만들|부품누락|완성하니|" + called("레고"))],
    ["인형 상표의 책, 딸랑이, 열쇠고리, 가방 장식, 타는 것", null, /젤리캣|슈타이프/, /보드북|(?:^|\s)북(?:\s|$)|책|백 참|래틀|수더|키링|라이딩/, new RegExp("안고자|부들부들|침대옆|이름도지어|" + called("인형"))],
    ["마일레그의 인형 집과 가구", null, /마일레그/, /미니어처|하우스|침대|키친|매치박스|캐슬|욕실|다리미|세트/, new RegExp("안고자|부들부들|침대옆|생각보다크네요|" + called("인형"))],
    ["신발 상표의 관리 용품과 소품", "fashion", /나이키|아디다스|뉴발란스|아식스|살로몬|호카|컨버스|반스|닥터마틴|팀버랜드|버켄스탁|어그/, /플라스크|신발끈|이어머프|실드|프루퍼|프로텍터|리펠런트|실러|(?:^|\s)밤(?:\s|$)|양말|삭스|모자|백팩/, new RegExp("신고|신어|착화|발편|끈묶|신발장|" + called("신발"))],
    ["피규어 상표의 진열 용품과 부속품", null, /팝마트|스미스키|넨도로이드|굿스마일|펀코|베어브릭/, /컨테이너|스탠드|파츠|파우치|케이스/, new RegExp("도색|디테일|캐릭터|세워놨|" + called("피규어"))],
    ["시계 상표의 체중계, 심박계, 줄", null, /코로스|위딩스|폴라|픽셀 워치|갤럭시 워치|애플 ?워치/, /체중계|스케일|심박|밴드$|스트랩|충전/, new RegExp("알림바로|수면측정|걸음수|러닝기록|운동할때차|" + called("워치"))],
    ["폰 이름이 든 배터리와 부속품", null, /아이폰|갤럭시 [SZA]\d|픽셀 \d|샤오미 \d/, /배터리$|케이스|필름|충전기|케이블|포토그래피 키트 레전드|거치대|스트랩/, new RegExp("개통|유심|자급제|새폰|폰바꿀|세컨폰|핸드폰|" + called("폰"))],
    ["액션캠 상표의 웹캠, 스피커폰, 짐벌", null, /인스타360|고프로/, /Wave|Link|Flow|마이크|어댑터|배터리|마운트|케이스/, new RegExp("물놀이|자전거탈때|브이로그|손떨림|" + called("액션캠"))],
    ["아르마니 바비(RC 상표 아르마와 글자가 겹친다)", null, /아르마니/, /./, /굴려|조립|만드는맛|같이만들/],
    ["타미야의 움직이지 않는 조립 모형", null, /^타미야 1\/\d+ (?!RC)/, /./, /굴려/],
    ["청소기가 아닌 로봇", null, /로봇/, /잔디|쿠킹|창문|공기청정|스테이션/, new RegExp("먼지통|바닥이깨끗|맵핑|문턱|" + called("로봇청소기"))],
    ["커피 기구의 세정제와 저울", null, /커피|에스프레소|네스프레소/, /디스케일|케어 키트|저울|스케일/, /커피맛|홈카페|내려마셔|원두|내려드려|커피향/],
    ["전동칫솔의 교체 헤드", null, /칫솔/, /헤드/, new RegExp("양치|뽀득|진동세기|손양치|충전오래|" + called("칫솔"))],
    ["가전 묶음(커피머신이 든 세트)", null, /^VOILA .*세트/, /./, /커피맛|홈카페|내려마셔|원두/],
    ["가방의 보관 용품(더스트백, 정리함)", null, /가방|백(?:\s|$)/, /더스트백|정리함|보관용|인서트|오거나이저/, new RegExp("들고나가|들고다녀|각잡혀|수납생각보다|" + called("가방|백"))],
    ["키보드의 받침대", null, /키보드/, TAIL, new RegExp("타건|키감|치는맛|타자|" + called("키보드"))],
    ["마우스의 번지, 독, 클립", null, /마우스/, /번지|클립|마우스 독|마우스 매트/, new RegExp("클릭감|손에착|그립감|센서|" + called("마우스"))],
    ["마이크의 암과 어댑터", null, /마이크/, TAIL, new RegExp("목소리|녹음해|잡음|방송용|" + called("마이크"))],
    ["헤드폰의 거치대", null, /헤드폰/, TAIL, new RegExp("착용감|해상도|이어패드|음악들을|" + called("헤드폰"))],
    ["컨트롤러의 충전기와 그립", null, /컨트롤러|조이콘|듀얼센스/, TAIL, new RegExp("버튼감|쏠림|스틱부드|2인용|" + called("컨트롤러"))],
    ["스피커와 태블릿의 충전 받침", null, /스피커|태블릿/, /크래들|충전 스피커 독/, new RegExp("소리짱짱|저음|볼륨|화면크고|넷플릭스|필기용|" + called("스피커|태블릿|패드"))],
    ["그릴의 덮개와 받침", null, /그릴/, TAIL, /요리할맛|집밥|주방에두니|매일써요/],
    ["공이 아닌 것(공 주머니, 표시, 기계)", "sport", /볼(?:\s|$)/, /호퍼|마커|머신|마사지|케틀|슬램|월 볼|스태빌리티|필라테스|더블 엔드/, new RegExp("탄성|공원가서|바운드|" + called("공"))],
    ["라켓 가방", "sport", /라켓|퓨어 에어로/, /백(?:\s|$)|백팩/, new RegExp("쳐보니|스윙이|컨트롤잘|타구감|" + called("라켓"))],
    ["조명의 받침과 배터리", "camera", /라이트|플래시/, TAIL, /광량|색이고르게|스튜디오세팅/],
    ["마사지건의 배터리와 부속품", "sport", /테라|하이퍼|베놈/, /배터리|케이스|리필|어플리케이터|마이크로커런트 링/, new RegExp("뭉친데|어깨뭉칠|진동세기|" + called("마사지건"))],
    ["운동 밴드가 아닌 밴드(머리띠, 시계 줄)", "sport", /밴드/, /헤드밴드|손목 ?밴드|워치 밴드|암밴드/, /홈트|홈짐|운동미룰|거실에두고/],
    // 2차 검수(Q-03)에서 짚인 건과 같은 유형: 본품에 쓰는 물건이 본품의 말을 받는 것, 종류의 낱말이 다른 낱말 안에 든 것
    ["이름에 오드가 든 커피 그라인더(향수가 아니다)", null, /오드 브루/, /그라인더/, new RegExp("향너무|지속력|뿌리|잔향|시향|화장대|은은해|" + called("향수"))],
    ["마우스의 발(피트)", null, /마우스/, /피트/, new RegExp("클릭감|손에착|그립감|센서|" + called("마우스"))],
    ["헤드폰과 헤드셋의 분배기, 걸이, 앰프", null, /헤드폰|헤드셋/, /분배기|걸이|앰프/, new RegExp("착용감|해상도|이어패드|음악들을|세상조용|귀안아파|" + called("헤드폰|헤드셋"))],
    ["컨트롤러에 쓰는 것(썸 그립, 휠, 핸들, 스틱 모듈, 청소 천, 컨트롤러용)", null, /컨트롤러|조이콘|듀얼센스/, /그립|휠 \d|핸들|모듈|청소 천|컨트롤러용|듀얼센스용/, new RegExp("버튼감|쏠림|스틱부드|2인용|" + called("컨트롤러"))],
    ["아이패드에 쓰는 것(이름이 용으로 끝난다)", null, /아이패드/, /용$/, new RegExp("화면크고|넷플릭스|필기용|" + called("태블릿|패드"))],
    ["모니터의 덮개와 웹캠", null, /모니터|울트라샤프/, /후드|웹캠/, new RegExp("화면쨍|불량화소|듀얼로|색감|눈이편해|" + called("모니터"))],
    ["스피커폰과 스피커의 받침", null, /스피커|서브우퍼/, /스피커폰|방진 패드|아이솔레이션|선반/, new RegExp("소리짱짱|저음|볼륨|분위기삽|" + called("스피커"))],
    ["구강세정기(칫솔이 아니다)", null, /구강세정기|플로서/, /./, new RegExp("양치|뽀득|손양치|" + called("칫솔"))],
    ["TV 스트리머(트리머가 아니다)", null, /스트리머/, /./, new RegExp("절삭력|피부자극|잘밀려|" + called("면도기"))],
    ["후지필름의 카메라(필름이 아니다)", "camera", /^후지필름 (?:X-[A-Z]|GFX|X100)/, /^(?!.*(?:렌즈|mm|배터리|그립|케이스|충전)).*$/, /여분필요|소모품이라|카메라가방에넣어|쓰던게낡아/],
    ["조명 상표의 반사판과 소프트박스", "camera", /프로포토|어퓨처|고독스/, /리플렉터|소프트박스|엄브렐러|스누트|그리드|반도어/, /광량|색이고르게|스튜디오세팅/],
    ["카메라의 큰 장비(삼각대, 가방, 반사판, 배경지)", "camera", /삼각대|백팩|리플렉터|소프트박스|배경지/, /./, /소모품이라|카메라가방에넣어|여분필요/],
    ["자전거 상표의 헬멧", null, /에스웍스|스페셜라이즈드/, /헬멧/, new RegExp("잘나가|출퇴근용|한강|언덕도|동네한바퀴|" + called("자전거"))],
    ["운동 벤치(골프의 유틸리티가 아니다)", "sport", /유틸리티 벤치/, /./, /타구감|라운딩|연습장|필드나갈|스코어/],
    ["얼굴에 쓰는 기기(마사지건이 아니다)", "sport", /테라페이스/, /./, new RegExp("뭉친데|어깨뭉칠|진동세기|" + called("마사지건"))],
    ["마사지 볼과 두르는 찜질 기구", "sport", /마사지 볼|베놈/, /./, new RegExp("진동세기|소음적|" + called("마사지건"))],
  ];
  const seen = TABLE.map(() => 0);
  eachSample((row) => {
    const name = row.item.name;
    TABLE.forEach(([what, category, has, notWhole, forbidden], k) => {
      if ((category && row.box.category !== category) || !has.test(name) || !notWhole.test(name)) return;
      seen[k] += 1;
      assert.doesNotMatch(row.flat, forbidden, `${what}: ${mark(row)}`);
    });
  });
  // 표의 줄마다 실제로 그런 상품의 글이 있다(없는 조합을 검사했다고 하지 않는다)
  TABLE.forEach(([what], k) => assert.ok(seen[k] > 0, `${what}: 그런 상품의 글이 없다`));
  // 검수에서 짚인 건: 레고 수납함
  assert.ok(allShots().some(({ rows }) => rows.some((row) => row.item.name === "레고 스토리지 브릭 8")), "레고 스토리지 브릭 8 의 글이 없다");
});

test("샘플 후기: 게임 타이틀(영어 이름 끝에 기종이 적힌 상품)에는 쓰는 물건의 말, 만듦새의 말, 다른 종류의 말이 없다", () => {
  // 게임 타이틀은 한글 이름이 작품 제목뿐이라 영어 이름 끝의 기종으로 가린다("The Last of Us Part II Remastered (PS5)"). 생성기의 판정은 쓰지 않는다
  const GAME = /\((?:PS[345]|Nintendo Switch(?: 2)?|Xbox (?:Series X|One|360))\)$/;
  // 날마다 쓴다, 만듦새와 마감이 좋다(세 언어), 모니터와 게임기의 말
  const forbidden = /매일써|잘쓰고|쓰는중|쓸때마다|두고두고쓸|요긴하게|자주손이|쓸데가많|개시했|마감좋|퀄리티|고급져|정품|做工|genuine|화면쨍|불량화소|듀얼로|색감|게임타이틀사러|연결하고바로/;
  let seen = 0, named = 0;
  const titles = new Set<string>();
  eachSample((row) => {
    if (!GAME.test(row.item.nameEn)) return;
    seen += 1; titles.add(row.item.name);
    assert.doesNotMatch(row.flat, forbidden, mark(row));
    if (/게임(?:나왔네요|받았|하나생겼|득템)|할게임생겼|하고싶던게임/.test(row.flat)) named += 1;
  });
  assert.ok(seen > 100 && titles.size > 40, `게임 타이틀의 글 ${seen}건, 타이틀 ${titles.size}개`);
  // 게임이라고 부르는 글이 실제로 있다(종류를 못 가려 두루 맞는 말만 하는 것이 아니다)
  assert.ok(named > 10, `게임이라고 부르는 글 ${named}건`);
  // 검수에서 짚인 건: 모니터로 잡히던 게임, 쓰는 물건으로 잡히던 게임
  for (const name of ["슈퍼 마리오 오디세이", "더 라스트 오브 어스 파트 II 리마스터드"]) assert.ok(titles.has(name), name + " 의 글이 없다");
});

test("샘플 후기: 이 사이트에 없는 수령 길을 말하지 않는다. 디지털 상품은 나왔다, USDT로 받았다, 값이 어땠다, 만족했다는 말만 하고(썼다, 등록했다, 도착했다가 없다), 어느 글에도 설치, 수거, 인도 절차, 문의 창구, 무료 배송이 없다", () => {
  // 디지털 상품(상품권, 게임 코드, 참가권, 보증 연장): 보관함에 USDT로 받기만 있다(components/inventory/InventoryScreen)
  const inventory = fs.readFileSync(new URL("../components/inventory/InventoryScreen.tsx", import.meta.url), "utf8");
  assert.match(inventory, /product\?\.kind === "physical" && <TextLink onClick=\{\(\) => setShipIds/, "배송 신청은 실물에만 있다는 전제가 바뀌었다");
  const USED = /썼|써버|써보|쓸게|쓰고|쓰는|쓰려|쓸데|쓸일|결제|등록|코드|내려받|다운|도착|배송|택배|포장|상자|박스(?!값)|선물|보내줬|드렸|(?<!알려)줬|예약|날짜|안내|개시|실물|물건|당근|집에|달릴|할게생|redeem|used|arrived|shipping|到货|已经在用/;
  const seen = { digital: 0, card: 0, game: 0, other: 0, taken: 0 };
  eachSample((row) => {
    const { item, flat, r } = row;
    if (item.kind === "digital") {
      seen.digital += 1;
      if (/기프트카드|상품권/.test(item.name)) seen.card += 1; else if (/디지털$/.test(item.name)) seen.game += 1; else seen.other += 1;
      assert.equal(r.lang, "ko", mark(row));
      assert.doesNotMatch(flat, USED, mark(row));
      // 받았다는 말은 USDT로(잔액으로) 받았다는 말뿐이다
      if (/usdt로받|잔액으로받|잔액에바로/.test(flat)) seen.taken += 1;
      assert.doesNotMatch(flat.replace(/usdt로받[았으고]|잔액으로받아|좋은거받으세요/g, ""), /받았|받아|받고|받으/, mark(row));
      // 상품권이 아닌 것을 상품권이라 부르지 않는다
      if (!/기프트카드|상품권/.test(item.name)) assert.doesNotMatch(flat, /상품권|기프트카드/, mark(row));
    }
    // 어느 상품에도: 설치해 주는 기사, 쓰던 것의 수거, 서류와 인도 절차, 문의 창구, 무료 배송(켜고 끄는 행사다)
    assert.doesNotMatch(flat, /기사님|수거|탁송|서류|넘겨받|벽걸이로달아|설치까지|설치날짜|문의|답변|고객센터|상담|배송비|무료배송|support|customerservice|shippingfee|freeshipping|客服|免运费|包邮/, mark(row));
  });
  assert.ok(seen.digital > 300 && seen.card > 100 && seen.game > 20 && seen.other > 20 && seen.taken > 100, JSON.stringify(seen));
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
  const ARRIVAL = /배송|포장|박스|상자|통관|걸렸|기다|shipping|box|customs|weeks|arrive|物流|盒子|外箱|等了|清关/;
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
