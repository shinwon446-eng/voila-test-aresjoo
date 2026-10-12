// 샘플 후기(lib/reviewSamples, flow/MELT_SPEC.md V1~V6): 박스마다 80~400건, 결정적, 한 박스 안에서 겹치지 않는 글, 카탈로그 사진, 스위치
// 글의 뜻도 본다(홈의 모든 박스, 모든 건): 돈 이야기는 그 건에서 참일 때만, 미개봉과 새제품은 그런 상품에만, 별점과 글의 결,
//   또 열게 부추기는 말이 없는지, 다시 쓰는 손님의 몫, 좋아요의 분포
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { BOXES, BOX_BY_SLUG, HOME_BOXES, type ProductBox, type ProductItem } from "../lib/products";
import { BANNED, CLOSE, EN, GOT, GRIPE, ITEM, MID, MID_CLOSE, NEG, NEG_CLOSE, SHIP, USE, USE_GIFT, ZH, type Frag } from "../lib/reviewSampleText";
import { RETURNING_SHARE, SAMPLE_MAX, SAMPLE_MIN, allRatingSummary, kindOf, newestSamples, ratingSummary, sampleCount, sampleReviews, sampleShapes, summarizeRatings, type ReviewSample } from "../lib/reviewSamples";
import { takeAmountOf } from "../lib/takeBatch";

const PROBE = ["watch-rolex", "pokemon-charizard", "beauty-dior"];
const digestOf = (lists: unknown) => createHash("sha256").update(JSON.stringify(lists)).digest("hex");

/** 홈의 모든 박스의 모든 건을 차례로: 그 건의 상품, 글이 지어진 모양, 띄어쓰기를 뺀 소문자 글 */
function eachSample(visit: (row: { box: ProductBox; item: ProductItem; r: ReviewSample; shape: string; flat: string }) => void): number {
  let total = 0;
  for (const box of HOME_BOXES) {
    const items = new Map(box.items.map((item) => [item.id, item]));
    const shapes = sampleShapes(box.slug);
    sampleReviews(box.slug).forEach((r, k) => { total += 1; visit({ box, item: items.get(r.itemId)!, r, shape: shapes[k], flat: r.text.replace(/\s/g, "").toLowerCase() }); });
  }
  return total;
}
const flatOf = (pool: readonly Frag[]): string[] => pool.map((frag) => frag.text.replace(/\s/g, "").toLowerCase());

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

test("샘플 후기: 한 박스 안에서 같은 글이 두 번 나오지 않고(글자를 덧붙여 다르게 만든 글도 없다), 금지 문자와 베낀 글이 없다", () => {
  const langs = { ko: 0, en: 0, zh: 0 };
  for (const box of HOME_BOXES) {
    const list = sampleReviews(box.slug);
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

test("샘플 후기: 박스마다 5~8% 는 다시 쓰는 손님의 글이고(같은 별명, 같은 언어), 그 사람의 글은 붙어 나오지 않는다", () => {
  assert.deepEqual(RETURNING_SHARE, [0.05, 0.08]);
  for (const box of HOME_BOXES) {
    const list = sampleReviews(box.slug);
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
  eachSample(({ box, item, r, flat }) => {
    const take = takeAmountOf({ valueUsdt: item.value }), where = `${box.slug} ${box.price} / ${item.name} ${item.value}: ${r.text}`;
    if (SHORT.test(flat)) { shorts += 1; assert.ok(take < box.price, where); }
    else if (CLAIM.test(flat)) {
      claims += 1;
      assert.ok(take >= box.price, where);
      // 상품가가 박스 가격의 0.7배에서 1.5배 사이인 건에서 틀리던 자리다
      if (item.value < box.price * 1.5) near += 1;
    }
    if (COUNT.test(flat)) assert.ok(!CLAIM.test(flat) && !SHORT.test(flat), where);
  });
  assert.ok(claims > 500 && shorts > 0 && near > 0, `${claims} / ${shorts} / ${near}`);
  // 파운더가 짚은 세 건: 받을 금액이 박스 가격에 못 미치면 본전이라는 말이 나올 수 없다
  for (const [value, price] of [[379.99, 500], [399, 500], [229.99, 250]]) assert.ok(takeAmountOf({ valueUsdt: value }) < price);
});

test("샘플 후기: 미개봉, 밀봉, 봉인은 밀봉 상품에만, 새제품은 새 제품에만 쓴다(낱장 카드와 등급 카드, 차에는 쓰지 않는다)", () => {
  const SEALED = /미개봉|밀봉|봉인|비닐도안뜯|씰|실링|sealed|未拆/, FRESH = /새제품|새거|새폰|brandnew|全新/;
  const PARCEL = /배송|택배|포장|상자|뽁뽁이|완충재|통관|문앞|박스(?!도기대중|값)/;
  const seen = { sealed: 0, fresh: 0, single: 0, graded: 0, vehicle: 0 };
  eachSample(({ box, item, r, flat }) => {
    const kind = kindOf(box, item), where = `${box.slug} / ${item.name} (${kind}): ${r.text}`;
    if (SEALED.test(flat)) { seen.sealed += 1; assert.ok(kind === "sealed" || kind === "pack", where); }
    if (FRESH.test(flat)) { seen.fresh += 1; assert.ok(kind !== "single" && kind !== "vehicle" && kind !== "digital", where); }
    // 종류를 가리는 표와 따로, 이름으로 다시 본다: 카드 번호나 등급 표시가 있으면 낱장 카드다
    if (box.category === "pokemon" && /PSA|BGS|CGC|\d\/[A-Z]*\d|프로모/.test(item.name)) {
      seen.single += 1; if (/PSA|BGS|CGC/.test(item.name)) seen.graded += 1;
      assert.equal(kind, "single", where);
      assert.doesNotMatch(flat, /미개봉|밀봉|봉인|비닐|새제품|새거|구성품빠짐없이|잘쓰고|매일써요|sealed|brandnew|未拆|全新/, where);
    }
    // 차와 바이크는 택배로 오지 않는다
    if (box.category === "car" && item.value >= 15000 && !/체스트|러기지/.test(item.name)) {
      seen.vehicle += 1;
      assert.equal(kind, "vehicle", where);
      assert.equal(r.lang, "ko", where);
      assert.doesNotMatch(flat, PARCEL, where);
      assert.doesNotMatch(flat, SEALED, where);
    }
  });
  assert.ok(seen.sealed > 100 && seen.fresh > 100 && seen.single > 1000 && seen.graded > 100 && seen.vehicle > 20, JSON.stringify(seen));
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
  eachSample(({ box, r, shape, flat }) => {
    const where = `${box.slug} ${r.rating}점 [${shape}]: ${r.text}`;
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

test("샘플 후기: 별점은 받은 것과 받는 과정에 대한 만족이다(작고 흔한 상품도 별 다섯이 나오고, 큰 상품도 받는 과정이 불편했으면 별 셋이다)", () => {
  const ARRIVAL = /배송|포장|박스|상자|통관|문의|날짜|일정|안내|걸렸|shipping|box|customs|weeks|arrive|物流|盒子|外箱|等了|清关/;
  let small = 0, smallFive = 0, big = 0, bigThree = 0;
  eachSample(({ box, item, r, shape, flat }) => {
    const x = item.value / box.price, where = `${box.slug} / ${item.name}: ${r.rating}점 ${r.text}`;
    if (x < 0.7) { small += 1; if (r.rating === 5) smallFive += 1; }
    if (x >= 8) {
      big += 1;
      // 큰 것이 나온 건의 점수가 깎였다면 까닭은 받는 과정뿐이고, 별 셋 아래로는 내려가지 않는다
      assert.ok(r.rating >= 3, where);
      if (r.rating === 3) { bigThree += 1; assert.match(shape, /^mid/, where); assert.match(flat, ARRIVAL, where); }
    }
  });
  assert.ok(smallFive / small > 0.3 && smallFive / small < 0.6, `작은 결과의 별 다섯 ${smallFive / small}`);
  assert.ok(bigThree > 20 && bigThree / big < 0.1, `큰 결과의 별 셋 ${bigThree} / ${big}`);
});

test("샘플 후기: 또 열게 부추기거나 잃은 것을 되찾으려는 말이 없고, 서비스의 흐름을 말하는 줄은 적은 몫으로 물건 이야기와 함께만 나온다", () => {
  const PUSH = /중독|다신안열려다|월급날|다음엔잘나오겠죠|다음엔좋은거나오겠죠|될때까지|본전이안나오|한번만더해보고|대박나길|큰거나오길|더큰거노려|이맛에|또열러갑니다|다음판에기대|저위에꺼|다음달에또|한방|언젠간대박|이번엔되겠지|오늘도뽑는다|또열었다|통장이텅장|继续开|咸鱼翻身|keepopening|oneday/;
  const FLOW = /usdt|보관함|검증|확률표|확률다|verifypage|验证/;
  let flow = 0;
  const total = eachSample(({ box, r, shape, flat }) => {
    assert.doesNotMatch(flat, PUSH, `${box.slug}: ${r.text}`);
    assert.doesNotMatch(r.author.replace(/\s/g, "").toLowerCase(), PUSH, `${box.slug}: ${r.author}`);
    if (!FLOW.test(flat)) return;
    flow += 1;
    // 그 줄만으로 끝나는 글은 없다
    assert.ok(shape.replace(/ tail$/, "").split(" ").length >= 2, `${box.slug} [${shape}]: ${r.text}`);
  });
  assert.ok(flow / total > 0.01 && flow / total < 0.08, `흐름을 말하는 글의 몫 ${flow / total}`);
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
