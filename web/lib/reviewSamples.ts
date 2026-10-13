// 샘플 후기와 별점을 만드는 한 곳. 실제 이용자가 쓴 글과 점수가 아니다.
// 정식 서비스 전의 시험 사이트라 샘플로 채운다(2026-10-11, 2026-10-12 파운더). 정식 서비스에서는 반드시 꺼야 한다:
//   빌드할 때 NEXT_PUBLIC_SAMPLE_REVIEWS=off 를 준다(0, false 도 같다). 주지 않으면 켜져 있다.
//   끄면 샘플은 한 건도 나오지 않고, 별점과 후기 수는 이 기기에서 실제로 쓴 후기만으로 센다.
//   끈 빌드에는 이 파일과 말뭉치가 묶음에 들어가지도 않는다: 화면은 lib/reviewSampleGate 를 거쳐서만 여기를 부른다(직접 import 하지 않는다).
// 박스마다 80건 이상 400건 이하. 박스가 320개라 6만 건이 넘으니 파일로 두지 않고 박스 번호를 씨앗으로 그때그때 만든다. 같은 박스는 언제나 같은 후기다.
// 별점의 뜻(여기 한 곳에만 적는다): 이 박스를 열어 나온 결과(나온 상품과 그 값, 뽑은 기분)에 대한 만족을 한 점수로 매긴 것이다.
//   큰 것이 나오면 점수가 오르기 쉽지만 뽑기 운만의 점수는 아니다: 흔하고 작은 상품도 별 다섯이 나온다. 낮은 점수는 박스값에 견줘 작은 결과나 실망스러운 뽑기에서 온다.
//   이 사이트는 대부분 USDT로 받고 배송받는 사람은 드물다(2026-10-13 파운더): 배송으로 받은 건은 박스마다 SHIPPED_SHARE 안이고, 받는 과정(배송, 포장) 때문에 깎인 점수는
//   그 가운데서도 SHIP_LOW_CAP 안이다. 뼈대가 건마다 점수와 그 점수의 까닭(why)과 배송 여부(ship)를 함께 정하고, 글은 그에 맞는 조각만 쓴다.
// 글의 목소리(2026-10-13 파운더: 후기는 박스를 깐 것에 대한 것이지 상품 후기가 아니다): 어느 글이든 첫 문장은 개봉과 그 결과를 말한다(몇 번째에 무엇이 나왔는지,
//   박스값에 견줘 어땠는지, 뽑은 기분). 둘째 조각은 받아서 어떻게 했는지(USDT로 받았다, 보관함에 뒀다, 드물게 배송 신청했다)나 값 이야기다.
//   물건을 보고 썼다는 말과 배송과 포장의 말은 배송으로 받은 건(@shipped)에만 붙고, 어느 글에서도 앞에 서지 않는다(한국어, 영어, 중국어 모두).
// 글의 결(tests/reviewSamples.test.ts 가 모든 박스에서 본다): 별 하나와 둘은 낮은 점수의 까닭 한 가지, 별 셋은 그저 그렇다는 말,
//   별 넷은 좋았다는 말(받는 과정이 조금 아쉬웠으면 그 한 줄이 끝에 붙는다), 별 다섯은 좋았다는 말뿐이다. 아쉬운 말 뒤에는 웃음을 붙이지 않는다.
// 세 단계로 만든다:
//   1) 뼈대(coreOf): 건수, 건마다의 상품과 별점과 그 까닭과 몇 분 전인지. 숫자만 다루므로 싸다. 박스 목록의 별점과 후기 수는 여기까지만 쓴다.
//   2) 쓴 사람(castOf): 건마다의 언어와 별명. 박스에 처음 글을 만들 때 한 번에 정한다(다시 쓰는 손님이 있다).
//   3) 글(sampleReviews): 글, 좋아요 수, 붙은 사진. 화면에 보이는 만큼만 앞에서부터 만든다.
// 샘플이 있는 박스는 주소로 열 수 있는 모든 박스(BOXES)다. 홈에서 내린 옛 박스도 주소로 열리므로 같은 규칙으로 만들고, 모아 보기도 그 전부를 센다.
// 뼈대는 모든 박스의 것을 쥐고 있지만(숫자뿐이라 작다) 글은 최근에 쓴 박스 BUILT_CAP 개의 것만 쥔다. 밀려난 박스는 다시 만들어도 같은 글이 나온다.
// 상품은 그 박스의 구성품에서 고른다(흔한 것이 많고 비싼 것은 드물게, USDT 결과는 고르지 않는다).
// 사진 후기의 사진은 손님이 찍은 사진이 아니라 카탈로그에 올려 둔 그 상품의 사진이다(lib/productImages 의 경로 그대로).
// 시각은 날짜가 아니라 "몇 분 전"으로 쥔다. 샘플의 "4일 전" 은 시계를 읽지 않고 씨앗에서만 나오므로
//   미리 그려 둔 HTML(정적 내보내기)과 브라우저가 그린 것이 언제나 같다(V5). 그래서 샘플은 언제 봐도 오늘 기준으로 같은 거리에 있다.
// 말 조각과 조각마다의 조건은 lib/reviewSampleText.ts 에 있다. 조건(돈 이야기, 미개봉, 배송)은 그 건의 상품과 결과가 맞을 때만 통과한다.
// 이 사이트에 없는 일은 샘플도 말하지 않는다: 디지털 상품은 USDT로 받기만 있으므로 썼다, 등록했다는 말이 없고, 차와 큰 가전에 설치나 인도 절차를 말하지 않는다.
import { BOXES, BOX_BY_SLUG, REFUND_RATE, type ProductBox, type ProductItem } from "./products";
import { summarizeRatings, summaryOf, type RatingSummary } from "./reviewRating";
import { ARRIVAL, ARRIVAL_OPEN, BANNED, BOX_HINTS, CLOSE, DID_USDT, DID_VAULT, DIGITAL, EN, FLOW, GOT, GRIPE, ITEM, ITEM_NAMED, KIND_FACTS, LEAD, MID, MID_CLOSE, MID_OPEN, NEG, NEG_CLOSE, NEG_OPEN, NICK, PART, PAR_BAND, SHIP, SLANG, TAIL, TOPICS, USE, USE_GIFT, VALUE, ZH, fact, type Frag, type Kind, type Topic } from "./reviewSampleText";

export const SAMPLE_MIN = 80;
export const SAMPLE_MAX = 400;

/** 샘플 스위치. 끄는 값을 주지 않으면 켜져 있다 */
export function sampleReviewsOn(): boolean {
  const value = process.env.NEXT_PUBLIC_SAMPLE_REVIEWS;
  return !(value === "off" || value === "0" || value === "false");
}

export interface ReviewSample {
  id: string;
  boxSlug: string;
  itemId: string;
  /** 별명 */
  author: string;
  /** 몇 분 전에 쓴 것인지. 작을수록 새 글이다 */
  ageMin: number;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  likes: number;
  /** 후기에 붙은 사진: 카탈로그의 그 상품 사진. 없으면 null */
  photo: string | null;
  lang: "ko" | "en" | "zh";
}

// 별점 요약의 꼴과 셈은 lib/reviewRating 에 있다(샘플을 끈 빌드도 쓴다). 여기서 부르던 곳을 위해 그대로 다시 내보낸다
export { summarizeRatings, type RatingSummary };

// ── 씨앗에서 나오는 수 ─────────────────────────────────────────
/** 글자열을 32비트 수로(FNV-1a). 어느 기기에서나 같은 값이다 */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/** 0 이상 1 미만의 수를 차례로 내는 함수(mulberry32). 정수 연산만 써서 서버와 브라우저가 같다 */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** 차례를 섞는다 */
function shuffle(list: number[], next: () => number): number[] {
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  return list;
}

/** 씨앗에 섞는 값. 바꾸면 모든 박스의 샘플이 한꺼번에 새로 정해진다 */
const SALT = "11";

// ── 1) 뼈대 ─────────────────────────────────────────────────
type Outcome = "big" | "good" | "even" | "low";
/**
 * 큰 결과(big)의 바닥: 상품가가 이 값(USDT)에 못 미치면 배수가 아무리 커도 큰 결과로 치지 않는다.
 * 1달러 박스에서는 20달러짜리 케이블도 20배라서, 배수만 보면 "인생 첫 당첨" 같은 말이 붙는다.
 * 8배가 넘는 건을 상품가로 세어 보고 정했다: 20달러 박스의 160~300달러 상품과 1~5달러 박스의 작은 상품이 여기서 걸러진다.
 */
export const BIG_FLOOR = 300;
/** 박스 가격 대비 상품가로 본 결과의 크기 */
const outcomeOf = (value: number, price: number): Outcome => { const x = value / price; return x >= 8 && value >= BIG_FLOOR ? "big" : x >= 1.5 ? "good" : x >= 0.7 ? "even" : "low"; };
/**
 * 받은 것(나온 상품과 그 물건)에 대한 만족의 누적 확률: [5점까지, 4점까지, 3점까지, 2점까지]. 나머지가 1점.
 * 큰 것이 나오면 높게 주기 쉽다. 그래도 흔하고 작은 상품(low)의 절반은 잘 받았으면 별 다섯이다.
 */
const LIKED_CUT: Record<Outcome, [number, number, number, number]> = {
  big: [0.97, 1, 1, 1],
  good: [0.8, 0.98, 1, 1],
  even: [0.62, 0.92, 0.99, 1],
  low: [0.5, 0.81, 0.95, 0.98],
};
/**
 * 받는 과정에서 생긴 일의 누적 확률: [크게 불편했다, 조금 아쉬웠다]. 나머지는 잘 받았다. 결과의 크기와 상관없이 같다.
 * 크게 불편했으면 큰 상품이라도 별 셋이고(큰 결과가 그 아래로는 막아 준다) 다른 상품은 별 셋에서 하나까지다. 조금 아쉬웠으면 별 넷을 넘지 못한다.
 */
const TROUBLE: [number, number] = [0.02, 0.045];
/** 배송으로 받은 건의 몫(박스마다 이 안), 그 가운데 받는 과정 때문에 깎인 낮은 점수(별 셋 아래)와 별 넷의 아쉬움 각각의 한도 */
export const SHIPPED_SHARE = 0.09, SHIP_LOW_CAP = 0.03;
/** 점수의 까닭: 따로 없다(좋았다), 받는 과정 때문에 깎였다, 받은 것이 그저 그랬다 */
const WHY_NONE = 0, WHY_ARRIVAL = 1, WHY_RESULT = 2;
/** 상품이 뽑히는 무게: 확률을 눌러 쓴다(실제 확률 그대로면 흔한 상품 몇 개만 나오고, 고르게 하면 비싼 것이 너무 자주 나온다) */
const PICK_POWER = 0.62;
const DAY = 1440;

interface Core { box: ProductBox; items: ProductItem[]; count: number; pick: Uint16Array; rating: Uint8Array; why: Uint8Array; ship: Uint8Array; age: Uint32Array; topRate: number; summary: RatingSummary }
const cores = new Map<string, Core | null>();

/** 같은 상품이 몰리지 않게 하는 폭: 처음 FRONT_ROWS 건(박스 화면의 줄이 처음 그리는 장수), 연속 WINDOW 건 안에 같은 상품은 WINDOW_MAX 건까지 */
export const FRONT_ROWS = 20, WINDOW = 10, WINDOW_MAX = 3;
/** 배송으로 받은 건이 오지 않는 앞자리: 줄이 처음 보여 주는 자리에 배송 이야기가 서지 않게(2026-10-13 파운더: 둘째 장이 배송 불평이었다) */
export const FRONT_SHIP_FREE = 12;
/**
 * 같은 상품이 몰려 보이지 않게 건의 차례를 바꾼다(2026-10-13 파운더: 차 박스의 처음 세 건이 같은 서브우퍼에 같은 사진이었다. 기계가 만든 것으로 읽힌다).
 * 상품을 다시 뽑지 않고 자리만 바꾼다: 상품과 별점과 그 까닭은 함께 움직이고, 나이와 쓴 사람(castOf)은 자리에 남는다. 그래서 건수, 별점 분포, 상품마다의 몫, 나이, 언어의 규칙은 그대로다.
 *   1) 처음 FRONT_ROWS 건 안에서는 같은 상품이 한 번만 나온다. 뽑힌 상품의 가짓수가 그보다 적은 박스에서는 두 번까지(붙어서는 아니다).
 *   2) 어디서든 같은 상품이 이웃한 두 건에 나오지 않는다.
 *   3) 연속 WINDOW 건 안에 같은 상품은 WINDOW_MAX 건까지다. 한 상품의 몫이 그보다 큰 박스(한 상품이 열에 셋을 넘게 나오는 싼 박스 넷)에서는 그 상품만 몫에 맞는 수까지 두어 고르게 흩는다.
 *   4) 처음 FRONT_SHIP_FREE 건에는 배송으로 받은 건이 오지 않는다(그 상품의 건 가운데 배송으로 받지 않은 것을 앞당긴다).
 * 자리마다 남은 것 가운데 규칙에 걸리지 않는 상품을 고르고, 그 가운데 남은 자리에 대한 몫(급한 정도)이 가장 큰 상품을 먼저 놓는다(같으면 원래 차례가 앞선 것).
 *   그래야 끝에 같은 상품만 남아 붙는 일이 없다(몫이 절반을 넘지 않으면 이웃은 언제나 피할 수 있다).
 */
function spread(pick: Uint16Array, rating: Uint8Array, why: Uint8Array, ship: Uint8Array, kinds: number): void {
  const n = pick.length;
  const queues: number[][] = Array.from({ length: kinds }, () => []);
  for (let i = 0; i < n; i++) queues[pick[i]].push(i);
  const drawn = queues.filter((queue) => queue.length > 0).length;
  const frontCap = drawn >= FRONT_ROWS ? 1 : 2;
  const front = new Uint16Array(kinds), placed = new Uint16Array(n);
  const order = new Uint16Array(n);
  // 바로 앞 WINDOW-1 건 안에 상품마다 몇 건이 있는지(자리마다 다시 세지 않고 창을 밀며 센다)
  const inWin = new Uint16Array(kinds);
  /** 이 자리에 놓을 그 상품의 건: 앞자리에는 배송으로 받지 않은 건을 고른다(없으면 -1) */
  const headOf = (item: number, pos: number): number => (pos < FRONT_SHIP_FREE ? queues[item].findIndex((k) => ship[k] === 0) : 0);
  for (let pos = 0; pos < n; pos++) {
    if (pos - WINDOW >= 0) inWin[placed[pos - WINDOW]] -= 1;
    let best = -1, bestScore = -Infinity, bestHead = 0;
    for (let item = 0; item < kinds; item++) {
      const left = queues[item].length;
      if (left === 0) continue;
      const head = headOf(item, pos);
      if (head < 0) continue;
      const inWindow = inWin[item];
      // 급한 정도: 남은 자리 가운데 이 상품이 차지해야 하는 몫. 몫이 커서 열에 셋으로는 다 못 놓는 상품은 그만큼 더 둔다
      const urgency = left / (n - pos);
      const cap = Math.max(WINDOW_MAX, Math.ceil(urgency * WINDOW));
      // 걸리는 규칙마다 크게 깎는다(이웃이 가장 무겁다). 다 걸려도 어느 하나는 놓아야 하므로 가장 덜 걸리는 것을 고른다
      let score = urgency * 1000 - queues[item][head] / n;
      if (pos > 0 && placed[pos - 1] === item) score -= 3e6;
      if (inWindow >= cap) score -= 2e6;
      if (pos < FRONT_ROWS && front[item] >= frontCap) score -= 1e6;
      if (score > bestScore) { bestScore = score; best = item; bestHead = head; }
    }
    order[pos] = queues[best].splice(bestHead, 1)[0];
    placed[pos] = best;
    inWin[best] += 1;
    if (pos < FRONT_ROWS) front[best] += 1;
  }
  const p = pick.slice(), r = rating.slice(), w = why.slice(), s = ship.slice();
  for (let pos = 0; pos < n; pos++) { pick[pos] = p[order[pos]]; rating[pos] = r[order[pos]]; why[pos] = w[order[pos]]; ship[pos] = s[order[pos]]; }
}

function coreOf(slug: string): Core | null {
  const cached = cores.get(slug);
  if (cached !== undefined) return cached;
  const box = BOX_BY_SLUG[slug];
  const items = box ? box.items.filter((i) => i.kind !== "cash") : [];
  if (!box || items.length === 0) { cores.set(slug, null); return null; }
  const next = rng(hash(`core|${SALT}|${slug}`));
  // 건수: 싼 박스일수록 많다. 20달러 아래는 250~400, 500달러 위는 80~160
  const t = Math.min(1, Math.max(0, (Math.log10(box.price) - Math.log10(20)) / (Math.log10(500) - Math.log10(20))));
  const low = Math.round(250 - 170 * t), high = Math.round(400 - 240 * t);
  const count = Math.min(SAMPLE_MAX, Math.max(SAMPLE_MIN, low + Math.floor(next() * (high - low + 1))));
  const cumulative = new Float64Array(items.length);
  let total = 0, topRate = 0;
  items.forEach((item, k) => { total += Math.pow(item.dropRate, PICK_POWER); cumulative[k] = total; topRate = Math.max(topRate, item.dropRate); });
  const outcomes = items.map((item) => outcomeOf(item.value, box.price));
  // 박스마다 별점이 조금씩 다르게: 별 다섯과 넷 사이의 선만 옮긴다(낮은 점수의 몫은 그대로다)
  const lift = (next() - 0.3) * 0.14;
  // 가장 새 글은 15분에서 하루 남짓 전, 가장 오래된 글은 다섯 달에서 열한 달 전
  const span = (150 + next() * 180) * DAY, gap = span / count;
  const pick = new Uint16Array(count), rating = new Uint8Array(count), why = new Uint8Array(count), ship = new Uint8Array(count), age = new Uint32Array(count);
  // 받는 과정 때문에 깎인 건은 박스마다 한도 안(낮은 점수와 별 넷의 아쉬움 각각). 한도에 닿으면 그 뒤의 건은 그냥 결과의 점수다
  const lowCap = Math.floor(count * SHIP_LOW_CAP);
  let severe = 0, gripes = 0;
  const dist: RatingSummary["dist"] = [0, 0, 0, 0, 0];
  let at = 15 + next() * 1500;
  for (let i = 0; i < count; i++) {
    const target = next() * total;
    let lo = 0, hi = items.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cumulative[mid] > target) hi = mid; else lo = mid + 1; }
    pick[i] = lo;
    const cut = LIKED_CUT[outcomes[lo]], u = next(), v = next();
    const liked = u < cut[0] + lift ? 5 : u < cut[1] ? 4 : u < cut[2] ? 3 : u < cut[3] ? 2 : 1;
    let stars = liked, cause = liked <= 3 ? WHY_RESULT : WHY_NONE;
    // 디지털 상품(옛 박스의 상품권)은 받는 과정이 없다
    if (items[lo].kind !== "digital" && v < TROUBLE[0] && severe < lowCap) {
      const w = v / TROUBLE[0];
      stars = outcomes[lo] === "big" ? 3 : Math.min(liked, w < 0.6 ? 3 : w < 0.85 ? 2 : 1);
      cause = WHY_ARRIVAL; severe += 1; ship[i] = 1;
    } else if (items[lo].kind !== "digital" && v < TROUBLE[1] && liked >= 4 && gripes < lowCap) { stars = 4; cause = WHY_ARRIVAL; gripes += 1; ship[i] = 1; }
    rating[i] = stars; why[i] = cause; dist[stars - 1] += 1;
    age[i] = Math.round(at);
    at += 3 - Math.log(1 - next()) * gap;
  }
  // 배송으로 받은 건: 받는 과정을 말한 건에 더해, 실물 상품의 건 가운데 몇을 더 고른다. 다 합쳐 SHIPPED_SHARE 안
  let shipped = severe + gripes;
  const quota = Math.floor(count * SHIPPED_SHARE);
  for (let i = 0; i < count && shipped < quota; i++) if (ship[i] === 0 && items[pick[i]].kind !== "digital" && next() < 0.05) { ship[i] = 1; shipped += 1; }
  // 같은 상품이 몰리지 않게 자리를 바꾼다(나이는 자리에 남는다)
  spread(pick, rating, why, ship, items.length);
  const core: Core = { box, items, count, pick, rating, why, ship, age, topRate, summary: summaryOf(dist) };
  cores.set(slug, core);
  return core;
}

/** 이 박스의 샘플 후기 수. 스위치를 끄면 0 */
export function sampleCount(boxSlug: string): number {
  return sampleReviewsOn() ? coreOf(boxSlug)?.count ?? 0 : 0;
}

/**
 * 박스의 별점 요약. 박스 목록의 카드가 부른다: 글은 만들지 않고 뼈대만 쓴다(박스마다 한 번 만들어 쥔다).
 * 후기 수는 박스 화면의 목록과 같다(tests/reviewSamples.test.ts). extra 는 이 기기에서 실제로 쓴 후기의 점수들이다(샘플 위에 더한다)
 */
export function ratingSummary(boxSlug: string, extra: readonly number[] = []): RatingSummary {
  const core = sampleReviewsOn() ? coreOf(boxSlug) : null;
  if (!core) return summarizeRatings(extra);
  if (extra.length === 0) return core.summary;
  const mine = summarizeRatings(extra).dist;
  return summaryOf(core.summary.dist.map((n, i) => n + mine[i]) as RatingSummary["dist"]);
}

// ── 상품의 됨됨이와 그 건의 사실 ───────────────────────────────────
const topicCache = new Map<string, number>();
/** 본품의 낱말 뒤가 이렇게 이어지면 "그 본품에 쓰는 것"이다: 바로 "용", 또는 모델을 가리는 말(숫자, 괄호, 세대, 프로와 에어 같은 말) 뒤의 "용" */
const FOR_IT = /^(?:\s(?:\d+세대|\d+|프로|에어|미니|맥스|울트라|플러스|시리즈|\([^)]*\)?|[A-Z]\d[^\s)]*\)?))*용(?:\s|$)/;
/**
 * 그 상품의 종류(TOPICS 의 순번). 맞는 종류가 없으면 -1.
 * 먼저 상품 그 자체를 본다: 박스를 가리지 않는 줄(cats 에 *)을 이름으로 맞춘다. 향수는 가방 박스에서도 향수이고, 등급 카드와 차는 옛 박스에서도 카드와 차다.
 * 그다음에 박스의 힌트(제 카테고리, 옛 박스는 BOX_HINTS)에 맞는 줄을 본다. "남은 것" 줄(이름을 가리지 않는 줄)은 첫 힌트의 것만 받는다.
 * 상표나 본품의 낱말이 이름에 들었다고 그 종류가 되지는 않는다: 본품을 말하는 종류(+whole)는 부속품의 이름(PART)을 건너뛴다.
 */
function topicIndexOf(box: ProductBox, item: ProductItem): number {
  const hints = BOX_HINTS[box.slug] ?? [box.category];
  const key = hints.join(",") + "|" + item.id;
  const cached = topicCache.get(key);
  if (cached !== undefined) return cached;
  // 본품을 말하는 종류는 부속품, 보관 용품, 관리 용품의 이름을 받지 않는다(레고 수납함은 조립 세트가 아니다).
  // 본품의 낱말 바로 뒤에 "용"이 붙은 이름도 받지 않는다: 그 본품에 쓰는 물건이다("컨트롤러용 청소 천", "듀얼센스용 충전 스테이션", "오븐용 도마").
  // 낱말과 "용" 사이에 모델을 가리는 말이 끼어도 같다("아이패드 10세대용", "아이패드 프로 13 (M4)용"). 다른 낱말이 끼면 아니다("컨트롤러 Xbox용"은 컨트롤러다)
  const part = PART.test(item.name);
  const forIt = (topic: Topic) => { const m = topic.re.exec(item.name); return !!m && FOR_IT.test(item.name.slice(m.index + m[0].length)); };
  const fits = (topic: Topic) => item.value >= topic.min && item.value <= topic.max && (topic.re.test(item.name) ? !(topic.whole && (part || forIt(topic))) : !!topic.en && topic.en.test(item.nameEn));
  let found = TOPICS.findIndex((topic) => topic.cats.includes("*") && fits(topic));
  if (found < 0) found = TOPICS.findIndex((topic) => (topic.re.source === "." ? topic.cats.includes(hints[0]) : topic.cats.some((cat) => hints.includes(cat))) && fits(topic));
  topicCache.set(key, found);
  return found;
}

/** 그 상품이 받는 종류(TOPICS 의 한 줄). 맞는 종류가 없으면 null. 검사와 점검이 생성기의 판정을 그대로 볼 때만 쓴다 */
export function topicOf(box: ProductBox, item: ProductItem): Topic | null {
  const index = item.kind === "digital" ? -1 : topicIndexOf(box, item);
  return index >= 0 ? TOPICS[index] : null;
}

/** 그 상품의 됨됨이(택배로 오는지, 밀봉 상품인지, 낱장 카드인지). 조각의 조건이 이것을 본다 */
export function kindOf(box: ProductBox, item: ProductItem): Kind {
  if (item.kind === "digital") return "digital";
  const index = topicIndexOf(box, item);
  return index >= 0 ? TOPICS[index].kind : "goods";
}

const F = { parcel: fact("parcel"), gift: fact("gift"), money: fact("money"), par: fact("par"), loss: fact("loss"), large: fact("large"), small: fact("small"), common: fact("common"), r3: fact("r3"), r4: fact("r4"), r5: fact("r5"), shipped: fact("shipped"), kept: fact("kept") };

// ── 조각 꺼내기 ────────────────────────────────────────────────
interface Deck { order: number[]; at: number; cycle: number }
interface Cast { lang: Uint8Array; who: Uint16Array; names: string[] }
/** 한 박스의 연속 NEAR 건 안에서는 같은 조각이 다시 나오지 않는다 */
export const NEAR = 10;
/**
 * 박스 하나의 글과 그 글을 만들던 자리. parts 는 건마다 쓴 조각(말끝을 바꿔 치기 전의 원래 줄), near 는 바로 앞 NEAR-1 건에서 쓴 조각이다.
 */
interface Built { list: ReviewSample[]; shapes: string[]; parts: string[][]; near: Map<string, number>; texts: Set<string>; decks: Map<string, Deck>; cast: Cast | null }
/** 글을 쥐고 있는 박스의 수. 넘으면 가장 오래 안 쓴 박스의 글을 버린다(박스 334개의 글 8만 건을 다 쥐지 않는다) */
export const BUILT_CAP = 40;
const built = new Map<string, Built>();
/** 지금 글을 쥐고 있는 박스의 수(검사용) */
export const builtCount = (): number => built.size;
/** 그 박스의 글 자리. 없으면 새로 만들고, 쓴 차례를 맨 뒤로 옮긴다 */
function builtOf(slug: string): Built {
  let state = built.get(slug);
  if (state) built.delete(slug); else state = { list: [], shapes: [], parts: [], near: new Map(), texts: new Set(), decks: new Map(), cast: null };
  built.set(slug, state);
  if (built.size > BUILT_CAP) built.delete(built.keys().next().value as string);
  return state;
}

/**
 * 조각 묶음에서 ok 에 맞는 다음 한 줄. 박스마다 묶음을 섞어 놓고 차례로 꺼낸다(다 쓰면 다시 섞는다).
 * 그래서 한 박스 안에서 같은 조각은 묶음을 한 바퀴 돌기 전에는 다시 나오지 않는다.
 * 차례가 온 줄이 이 건에 맞지 않으면 뒤에서 맞는 줄을 당겨 쓴다. 남은 줄에 없으면 새로 섞고, 묶음 전체에 없으면 null.
 */
function draw(state: Built, slug: string, key: string, pool: readonly Frag[], ok: (frag: Frag) => boolean): Frag | null {
  let deck = state.decks.get(key);
  for (let round = 0; round < 2; round++) {
    if (!deck || deck.at >= deck.order.length || round === 1) {
      const cycle = deck ? deck.cycle + 1 : 0, last = deck && deck.at > 0 ? deck.order[deck.at - 1] : -1;
      const next = rng(hash(`deck|${SALT}|${slug}|${key}|${cycle}`));
      const order = shuffle(pool.map((_, i) => i), next);
      // 바퀴가 바뀌는 자리에서 같은 줄이 잇달아 나오지 않게
      if (order.length > 1 && order[0] === last) [order[0], order[1]] = [order[1], order[0]];
      deck = { order, at: 0, cycle };
      state.decks.set(key, deck);
    }
    for (let k = deck.at; k < deck.order.length; k++) {
      const frag = pool[deck.order[k]];
      if (!ok(frag)) continue;
      [deck.order[k], deck.order[deck.at]] = [deck.order[deck.at], deck.order[k]];
      deck.at += 1;
      return frag;
    }
    if (deck.at === 0) return null;
  }
  return null;
}

const pickOne = <V,>(list: readonly V[], r: () => number): V => list[Math.floor(r() * list.length)];

interface Ask { state: Built; slug: string; r: () => number; rating: number; why: number; outcome: Outcome; kind: Kind; topic: Topic | null; topicKey: string; has: number; wide: boolean }
interface Draft { text: string; shape: string; frags: string[] }

/**
 * 글 한 건을 짓는 붓. put 은 묶음에서 이 건에 맞는 한 줄을 꺼내 글에 잇는다(맞는 줄이 없으면 잇지 않고 false).
 * 맞는 줄: 조건(need)이 이 건의 사실에 모두 들고, 이 글이 이미 말한 거리를 또 말하지 않고, 앞말이 필요한 줄(after)은 그 거리가 나온 뒤에만,
 *   그리고 바로 앞 NEAR-1 건과 이 글에서 아직 쓰지 않은 줄이다(가까운 글에 같은 조각이 되풀이되지 않게).
 * must 는 그 자리가 비면 글이 안 되는 조각이다: 안 쓴 줄이 없으면 가까운 데서 쓴 줄이라도 쓴다(그런 박스는 검사가 잡는다. 그 묶음을 늘린다).
 */
function penOf(ask: Ask) {
  const roles: string[] = [], parts: string[] = [], frags: string[] = [];
  let said = 0;
  const fits = (frag: Frag) => (frag.need & ~ask.has) === 0 && (frag.about & said) === 0 && (frag.after === 0 || (frag.after & said) !== 0) && !frags.includes(frag.text);
  const fresh = (frag: Frag) => fits(frag) && !ask.state.near.has(frag.text);
  const put = (role: string, key: string, pool: readonly Frag[], opt: { also?: (frag: Frag) => boolean; fill?: (text: string) => string; must?: boolean } = {}): boolean => {
    const { also, fill, must } = opt;
    const frag = draw(ask.state, ask.slug, key, pool, also ? (x) => fresh(x) && also(x) : fresh) ?? (must ? draw(ask.state, ask.slug, key, pool, also ? (x) => fits(x) && also(x) : fits) : null);
    if (!frag) return false;
    said |= frag.about;
    roles.push(role);
    frags.push(frag.text);
    parts.push(fill ? fill(frag.text) : frag.text);
    return true;
  };
  return { roles, parts, frags, put };
}

/** 점수의 까닭에 맞는 줄: 받는 과정 때문에 깎인 건은 받는 과정을 말하는 줄만, 아니면 그런 줄을 뺀 나머지 */
const causeOf = (why: number) => (why === WHY_ARRIVAL ? (frag: Frag) => (frag.about & ARRIVAL) !== 0 : (frag: Frag) => (frag.about & ARRIVAL) === 0);

/**
 * 한국어 글 한 건. 첫 조각은 언제나 개봉과 그 결과를 말하는 줄이고(GOT, MID_OPEN, NEG_OPEN, ARRIVAL_OPEN),
 * 둘째 조각은 받아서 어떻게 했는지(USDT, 보관함)나 값 이야기다. 배송으로 받은 건(@shipped)에만 물건, 쓰임, 배송의 말이 붙는다.
 * 조각을 하나에서 셋까지 잇는다. wide 는 겹치는 글을 피하려고 조각을 하나 더 잇는 것이다
 */
function koText(ask: Ask): Draft {
  const { r, rating, why, outcome, kind, topic, topicKey, has, wide } = ask;
  const { roles, parts, frags, put } = penOf(ask);
  const shipped = (has & F.shipped) !== 0;
  let topical = false;
  /** 물건에 대한 한 조각(배송으로 받은 건): 종류에 맞는 말, 이름을 넣은 말, 어느 상품에나 맞는 말 */
  const thing = (): boolean => {
    const u = r();
    // 디지털 상품은 물건도 배송도 없다: 그 종류의 말(나왔다, USDT로 받았다)만 쓴다
    if (kind === "digital") return put("thing", topicKey, topic!.lines, { must: true });
    // 종류에 맞는 말은 한 글에 한 번만 한다("미개봉으로 소장하려구요" 뒤에 "애랑 같이 깠어요" 가 오지 않게)
    if (topic && !topical && u < 0.42 && put("thing", topicKey, topic.lines)) { topical = true; return true; }
    if (topic && topic.nouns.length > 0 && u < 0.6 && named()) return true;
    return put("thing", "item", ITEM, { must: true });
  };
  /** 이름을 넣은 한 조각("골프공 나왔네요"). 배송으로 받지 않은 건에는 나왔다는 꼴만 맞는다 */
  const named = (): boolean => { if (!topic || topic.nouns.length === 0) return false; const noun = pickOne(topic.nouns, r); return put("thing", "named", ITEM_NAMED, { fill: (text) => text.replace("{item}", noun) }); };
  /** 첫 조각: 깐 결과. 묶음이 가까운 글에서 다 쓰였어도 반드시 하나 놓는다 */
  const got = () => put("got", "got-" + outcome, GOT[outcome], { must: true });
  /** 쓰임 한 조각(배송으로 받은 건). 누구에게 줬다는 말은 종류에 맞는 말을 하지 않은 글에만 붙인다(그 말이 "매일 들고 다녀요" 일 수 있다) */
  const use = () => (!topical && r() < 0.45 && put("use", "gift", USE_GIFT)) || put("use", "use", USE);
  const ship = () => put("ship", "ship", SHIP);
  const close = () => put("close", "close", CLOSE);
  /** 받아서 어떻게 했는지: USDT로 받았다(대부분), 보관함에 뒀다 */
  const did = () => (r() < 0.78 ? put("did", "did-usdt", DID_USDT, { must: true }) : put("did", "did-vault", DID_VAULT)) || put("did", "did-usdt", DID_USDT, { must: true });
  const value = () => put("value", "value", VALUE);
  /** 받는 과정 때문에 깎인 낮은 점수의 첫 조각: 나온 것은 그런대로였다는 말("...나왔는데"). 뒤에 받는 과정의 한 줄이 붙는다 */
  const arrival = (role: string) => put(role, "open-arrival", ARRIVAL_OPEN, { must: true });
  let tails: readonly string[] = TAIL.pos, tailOdds = 0.42;
  if (rating >= 4 && why === WHY_ARRIVAL) {
    // 별 넷의 작은 아쉬움: 깐 결과 뒤에 배송의 아쉬운 한 줄("지만"으로 이어지는 여는 줄은 쓰지 않는다). 맺음말과 웃음은 붙이지 않는다
    put("got", "got-" + outcome, GOT[outcome], { also: (frag) => !frag.text.endsWith("지만"), must: true });
    put("gripe", "gripe", GRIPE, { must: true });
    tailOdds = 0;
  } else if (rating >= 4) {
    got();
    const u = wide ? 0.9 : outcome === "big" && r() < 0.6 ? 0.2 : r();
    const open = frags[0] ?? "";
    // 디지털 상품: 나온 것 뒤에 USDT로 받았다는 한 줄, 가끔 맺음말
    if (kind === "digital") { thing(); if (wide || u > 0.7) close(); }
    // 배송으로 받은 건: 배송의 말이나 물건의 말, 가끔 쓰임
    else if (shipped) { if (u < 0.5) { if (!ship()) thing(); } else thing(); if (r() < 0.35) use(); if (wide) close(); }
    // 나머지(대부분): USDT로 받았다, 보관함에 뒀다, 값 이야기, 드물게 서비스의 흐름이나 맺음말. 큰 결과는 가끔 나온 것만 말한다
    else if (open.endsWith("지만")) { if (!(u < 0.55 && value()) && !(u < 0.7 && named())) did(); }
    else if ((has & F.large) !== 0 && u < 0.22) { /* 나온 것만 말한다 */ }
    else if (u < 0.56) did();
    else if (u < 0.7) { if (!value()) did(); }
    else if (u < 0.78) { if (!named()) did(); }
    else if (u < 0.84) { if (!put("flow", "flow", FLOW)) did(); }
    else close();
    if (wide && roles.length < 2) did();
    // 크게 놀란 웃음은 큰 결과에만
    if (outcome === "big" && r() < 0.6) tails = TAIL.big;
  } else if (rating === 3) {
    if (why === WHY_ARRIVAL) { arrival("mid"); put("mid", "mid", MID, { also: causeOf(why), must: true }); }
    else { put("mid", "mid-open", MID_OPEN, { must: true }); if (wide || r() < 0.55) put("mid", "mid", MID, { also: causeOf(why) }); }
    if (wide || r() < 0.4) put("midc", "midc", MID_CLOSE);
    tails = TAIL.mid; tailOdds = 0.28;
  } else {
    if (why === WHY_ARRIVAL) { arrival("neg"); put("neg", "neg", NEG, { also: causeOf(why), must: true }); }
    else { put("neg", "neg-open", NEG_OPEN, { must: true }); if (wide || r() < 0.55) put("neg", "neg", NEG, { also: causeOf(why) }); }
    if (wide || r() < 0.35) put("negc", "negc", NEG_CLOSE);
    tails = TAIL.neg; tailOdds = 0.45;
  }
  // 빨리 친 글처럼: 좋은 글의 말끝을 드물게 바꿔 친다(아쉬운 줄은 그대로 둔다)
  if (rating >= 4 && r() < 0.09) {
    const k = Math.floor(r() * parts.length);
    const swap = roles[k] === "gripe" ? undefined : SLANG.find(([re]) => re.test(parts[k]));
    if (swap) parts[k] = parts[k].replace(swap[0], pickOne(swap[1], r));
  }
  // "지만", "는데" 로 이어지는 줄 뒤에는 마침표를 찍지 않는다
  const dotted = r() < 0.2 && !parts.some((part, k) => k < parts.length - 1 && /(?:지만|는데)$/.test(part));
  let text = parts.join(dotted ? ". " : " ");
  // 짧은 한 줄은 드물게 띄어쓰기 없이
  if (parts.length === 1 && text.length <= 14 && r() < 0.1) text = text.replace(/ /g, "");
  let tailed = false;
  if (dotted && r() < 0.5) text += ".";
  else if (r() < tailOdds) { text += " " + pickOne(tails, r); tailed = true; }
  // 감탄으로 여는 글은 좋은 결과에만
  if (rating === 5 && (has & F.large) !== 0 && r() < 0.1 && !/^(드디어|오|와|헐|크)/.test(text)) text = pickOne(LEAD, r) + " " + text;
  return { text, shape: roles.join(" ") + (tailed ? " tail" : ""), frags };
}

/** 영어와 중국어 글 한 건: 깐 결과를 말하는 한 줄이 먼저, 그 뒤에 받아서 어떻게 했는지나 값 이야기, 배송으로 받은 건에는 물건이나 배송의 한 줄 */
function foreignText(ask: Ask, lang: "en" | "zh"): Draft {
  const { r, rating, why, wide, has } = ask, words = lang === "en" ? EN : ZH;
  const { roles, parts, frags, put } = penOf(ask);
  const good = rating >= 4 && why !== WHY_ARRIVAL, shipped = (has & F.shipped) !== 0;
  if (rating >= 4) {
    put("got", lang + "-open", words.open, { must: true });
    if (!good) put("gripe", lang + "-gripe", words.gripe, { must: true });
    else if (shipped) { const u = r(); if (u < 0.5) put("ship", lang + "-ship", words.ship); else put("thing", lang + "-pos", words.pos); }
    else {
      const u = wide ? 0.2 : r();
      if (u < 0.5) put("did", lang + "-did", words.did); else if (u < 0.68) put("value", lang + "-value", words.value); else if (u < 0.86) put("close", lang + "-close", words.close); else if (u < 0.9) put("flow", lang + "-flow", words.flow);
      if (wide && roles.length < 2) put("did", lang + "-did", words.did, { must: true });
    }
  } else {
    const role = rating === 3 ? "mid" : "neg", pool = rating === 3 ? words.mid : words.neg;
    if (why === WHY_ARRIVAL) { put(role, lang + "-open-arrival", words.arrivalOpen, { must: true }); put(role, lang + "-" + role, pool, { also: causeOf(why), must: true }); }
    else { put(role, lang + "-" + role + "-open", rating === 3 ? words.midOpen : words.negOpen, { must: true }); if (wide || r() < 0.5) put(role, lang + "-" + role, pool, { also: causeOf(why) }); }
  }
  let text = parts[0];
  if (parts.length > 1) text += (lang === "zh" ? "，" : roles[1] === "close" && r() < 0.5 ? ", " : ". ") + parts[1];
  // 웃음은 좋은 글에만 붙인다
  const tail = good ? pickOne(words.tail, r) : "";
  if (tail) text += (lang === "en" ? " " : "") + tail;
  if (lang === "en" && r() < 0.3) text = text.toLowerCase();
  return { text, shape: roles.join(" ") + (tail ? " tail" : ""), frags };
}

// ── 2) 쓴 사람 ────────────────────────────────────────────────
const LANGS = ["ko", "en", "zh"] as const;
const LUCKY = ["2", "7", "77", "01", "88", "99", "1004", "12", "3", "486", "79", "22", "5", "123", "0", "33", "8", "21", "07", "1"];
/** 별명 끝에 붙는 숫자: 자주 쓰는 숫자, 두 자리 수, 태어난 해처럼 보이는 수 */
const digits = (r: () => number): string => { const u = r(); return u < 0.4 ? pickOne(LUCKY, r) : u < 0.8 ? String(Math.floor(r() * 100)).padStart(2, "0") : String(1975 + Math.floor(r() * 31)); };
/** 별명 하나. 재료도 박스마다 섞어 놓고 차례로 꺼내므로 비슷한 별명이 가까이 붙어 나오지 않는다 */
function nickname(state: Built, slug: string, lang: ReviewSample["lang"], r: () => number): string {
  const D = (key: string, pool: readonly string[]) => pool[drawIndex(state, slug, key, pool.length)];
  if (lang === "en") { const name = D("nick-en", NICK.en); return (r() < 0.35 ? name[0].toUpperCase() + name.slice(1) : name) + pickOne(NICK.enTail, r); }
  if (lang === "zh") return D("nick-zh", NICK.zh) + (r() < 0.2 ? digits(r) : "");
  const u = r();
  if (u < 0.45) return D("nick-a", NICK.a) + (r() < 0.12 ? " " : "") + D("nick-b", NICK.b) + (r() < 0.25 ? digits(r) : "");
  if (u < 0.8) return D("nick-whole", NICK.whole) + (r() < 0.3 ? digits(r) : "");
  return D("nick-id", NICK.id) + (r() < 0.2 ? "_" + pickOne(NICK.id, r) : "") + (r() < 0.8 ? digits(r) : "");
}
/** 조건이 없는 묶음(별명의 재료)에서 다음 순번 */
function drawIndex(state: Built, slug: string, key: string, size: number): number {
  let deck = state.decks.get(key);
  if (!deck || deck.at >= deck.order.length) {
    const cycle = deck ? deck.cycle + 1 : 0, last = deck ? deck.order[deck.order.length - 1] : -1;
    const order = shuffle(Array.from({ length: size }, (_, i) => i), rng(hash(`deck|${SALT}|${slug}|${key}|${cycle}`)));
    if (order.length > 1 && order[0] === last) [order[0], order[1]] = [order[1], order[0]];
    deck = { order, at: 0, cycle };
    state.decks.set(key, deck);
  }
  return deck.order[deck.at++];
}

/**
 * 박스 화면이 처음 보여 주는 건수(components/box/BoxReviews 의 BOX_REVIEWS_FIRST 와 같다).
 * 박스의 가장 새 글 FRONT 건 가운데 한국어가 아닌 글은 많아야 하나이고, 가장 새 글은 한국어다:
 * 한국어 사이트의 첫 화면에 보이는 후기 다섯 건이 대부분 외국어이면 어색하다. 박스 전체의 언어별 건수는 그대로 둔다.
 */
export const FRONT = 5;
/** 다시 쓰는 손님의 글이 전체에서 차지하는 몫의 아래와 위 */
export const RETURNING_SHARE: [number, number] = [0.05, 0.08];

/**
 * 이 박스에 글을 쓴 사람들. 글보다 먼저 정한다: 건마다의 언어, 누가 썼는지, 그 사람의 별명.
 * 모든 별명이 한 번씩만 나오면 다시 오는 손님이 한 명도 없는 곳처럼 보인다. 그래서 전체의 5~8% 는 앞에서 글을 쓴 사람이 같은 별명으로 다시 쓴 글이다(언어도 같다).
 * 다시 쓴 글은 그 사람의 앞 글과 붙어 나오지 않는다: 다시 쓴 글의 앞뒤 건은 언제나 처음 쓰는 사람이고, 앞 글은 두 건 이상 앞에서 고른다(되도록 더 멀리서).
 * 영어와 중국어 줄은 택배로 받은 이야기라 택배로 오지 않는 상품(상품권, 차, 큰 가전)에는 쓰지 않는다.
 * 맨 앞 FRONT 건에 외국어 글이 넘치면, 넘치는 글의 언어를 그 뒤의 한국어 글(택배로 오는 상품의 것)과 맞바꾼다. 점수와 상품은 건드리지 않는다.
 */
function castOf(core: Core, slug: string, state: Built): Cast {
  const n = core.count, next = rng(hash(`cast|${SALT}|${slug}`));
  const lang = new Uint8Array(n), parcel = new Uint8Array(n), first = [n, n, n];
  for (let i = 0; i < n; i++) {
    const u = next();
    parcel[i] = (KIND_FACTS[kindOf(core.box, core.items[core.pick[i]])] & F.parcel) !== 0 ? 1 : 0;
    lang[i] = u < 0.85 || !parcel[i] ? 0 : u < 0.93 ? 1 : 2;
  }
  // 맨 앞 FRONT 건: 가장 새 글은 한국어, 외국어 글은 하나까지. 맞바꿀 자리는 따로 둔 씨앗으로 골라, 바꿀 것이 없는 박스는 전과 같다
  const swapAt = rng(hash(`front|${SALT}|${slug}`));
  let foreign = 0;
  for (let i = 0; i < Math.min(FRONT, n); i++) {
    if (lang[i] === 0) continue;
    if (i > 0 && foreign === 0) { foreign = 1; continue; }
    const later: number[] = [];
    for (let j = FRONT; j < n; j++) if (lang[j] === 0 && parcel[j]) later.push(j);
    if (later.length > 0) lang[pickOne(later, swapAt)] = lang[i];
    lang[i] = 0;
  }
  for (let i = n - 1; i >= 0; i--) first[lang[i]] = i;
  let left = Math.min(Math.floor(n * RETURNING_SHARE[1]), Math.max(Math.ceil(n * RETURNING_SHARE[0]), Math.round(n * (RETURNING_SHARE[0] + (RETURNING_SHARE[1] - RETURNING_SHARE[0]) * next()))));
  const again = new Uint8Array(n);
  for (const i of shuffle(Array.from({ length: n }, (_, k) => k), next)) {
    if (left === 0) break;
    // 처음 보이는 FRONT 건에는 다시 쓰는 손님을 두지 않는다(첫 화면에 같은 별명이 두 번 보이지 않게)
    if (i < FRONT || first[lang[i]] > i - 2 || again[i - 1] || again[i + 1]) continue;
    again[i] = 1;
    left -= 1;
  }
  const who = new Uint16Array(n), speaks: number[] = [], wrote: number[] = [];
  for (let i = 0; i < n; i++) {
    if (!again[i]) { who[i] = speaks.length; speaks.push(lang[i]); wrote.push(1); continue; }
    // 앞 글은 되도록 다섯 건 넘게 떨어진 데서, 아직 한 번만 쓴 사람의 것으로 고른다(한 사람이 서너 번씩 쓰지 않게)
    const any: number[] = [], far: number[] = [];
    for (let j = 0; j <= i - 2; j++) if (lang[j] === lang[i]) { any.push(who[j]); if (j <= i - 5 && wrote[who[j]] === 1) far.push(who[j]); }
    who[i] = pickOne(far.length > 0 ? far : any, next);
    wrote[who[i]] += 1;
  }
  const names: string[] = [], used = new Set<string>();
  for (const speak of speaks) {
    let name = "";
    for (let tries = 0; tries < 40; tries++) { name = nickname(state, slug, LANGS[speak], next); if (!used.has(name) && !BANNED.has(name)) break; }
    while (used.has(name) || BANNED.has(name)) name += digits(next);
    used.add(name);
    names.push(name);
  }
  return { lang, who, names };
}

// ── 3) 글 ───────────────────────────────────────────────────
/**
 * 이 박스의 샘플 후기를 새것부터 limit 건. 앞에서부터 차례로 만들고 만든 것은 쥐고 있다(더 보기를 누르면 이어서 만든다).
 * i 번째 후기는 limit 과 상관없이 언제나 같다. 한 박스 안에서 같은 글은 두 번 나오지 않는다.
 */
export function sampleReviews(boxSlug: string, limit = Infinity): ReviewSample[] {
  const core = sampleReviewsOn() ? coreOf(boxSlug) : null;
  if (!core) return [];
  const state = builtOf(boxSlug);
  const cast = state.cast ?? (state.cast = castOf(core, boxSlug, state));
  const want = Math.min(core.count, Math.max(0, limit));
  for (let i = state.list.length; i < want; i++) {
    const item = core.items[core.pick[i]], rating = core.rating[i] as ReviewSample["rating"];
    const r = rng(hash(`text|${SALT}|${boxSlug}|${i}`));
    const lang = LANGS[cast.lang[i]], kind = kindOf(core.box, item), outcome = outcomeOf(item.value, core.box.price);
    // 디지털 상품은 이름으로 가린 그 종류의 말만 한다(상품권, 게임, 그 밖의 것)
    const index = kind === "digital" ? DIGITAL.findIndex((topic) => topic.re.test(item.name)) : topicIndexOf(core.box, item);
    // 종류의 줄이 비어 있으면 "이 종류는 따로 할 말이 없다"는 뜻이다(됨됨이만 쓴다)
    const topic = kind === "digital" ? DIGITAL[index] : index >= 0 && TOPICS[index].lines.length > 0 ? TOPICS[index] : null;
    let has = KIND_FACTS[kind];
    if (!(topic && topic.nouns.length > 0 && item.value >= 40)) has &= ~F.gift;
    // 받을 금액은 lib/takeBatch 의 takeAmountOf 와 같은 식이다. 박스 가격 이상일 때만 이득, 손해가 아니다 같은 말이 통과하고,
    // 박스 가격의 100%에서 110% 사이(PAR_BAND)일 때만 딱 본전, 본전치기 같은 말이 통과한다
    const take = +(item.value * REFUND_RATE).toFixed(2);
    has |= take >= core.box.price ? F.money : F.loss;
    if (take >= core.box.price * PAR_BAND[0] && take <= core.box.price * PAR_BAND[1]) has |= F.par;
    has |= outcome === "big" || outcome === "good" ? F.large : F.small;
    if (item.dropRate >= core.topRate) has |= F.common;
    if (rating === 3) has |= F.r3; else if (rating === 4) has |= F.r4; else if (rating === 5) has |= F.r5;
    // 배송으로 받은 건에만 물건과 배송의 말이, 나머지에는 USDT로 받았다거나 보관함에 뒀다는 말이 온다
    has |= core.ship[i] ? F.shipped : F.kept;
    const ask: Ask = { state, slug: boxSlug, r, rating, why: core.why[i], outcome, kind, topic, topicKey: (kind === "digital" ? "digital" : "topic") + index, has, wide: false };
    // 같은 글이 이미 있으면 다른 조각으로 다시 짓는다(글자를 덧붙여 다르게 만들지 않는다). 마흔 번을 넘기면 조각을 하나 더 잇는다.
    // 그래도 겹치는 박스가 생기면 검사가 잡는다: 그때는 그 상품 종류의 조각 묶음을 늘린다
    let draft: Draft = { text: "", shape: "", frags: [] };
    for (let tries = 0; tries < 80; tries++) {
      ask.wide = tries >= 40;
      draft = lang === "ko" ? koText(ask) : foreignText(ask, lang);
      if (!state.texts.has(draft.text) && !BANNED.has(draft.text)) break;
    }
    state.texts.add(draft.text);
    // 이 건에서 쓴 조각을 적어 두고, NEAR 건보다 멀어진 건의 조각은 다시 쓸 수 있게 푼다
    state.parts.push(draft.frags);
    for (const frag of draft.frags) state.near.set(frag, (state.near.get(frag) ?? 0) + 1);
    if (i >= NEAR - 1) for (const frag of state.parts[i - (NEAR - 1)]) { const n = state.near.get(frag)! - 1; if (n > 0) state.near.set(frag, n); else state.near.delete(frag); }
    const photo = item.image.src && r() < (outcome === "big" ? 0.8 : 0.55) ? item.image.src : null;
    // 좋아요: 절반 넘게 0 이고 나머지도 대부분 한두 개다. 사진이 붙었거나 큰 결과이거나 오래된 글이면 조금 더 많다.
    // 무게를 낮게 잡아 위쪽 끝(99)에 닿는 글이 없게 한다: 끝에서 잘린 글이 그 값에 몰리면 안 된다(검사가 본다)
    const weight = 0.9 * (photo ? 1.8 : 1) * (outcome === "big" ? 3 : outcome === "good" ? 1.4 : 1) * (0.5 + Math.min(1, core.age[i] / (150 * DAY)));
    const likes = Math.min(99, Math.floor(-Math.log(1 - r()) * weight));
    state.list.push({ id: `s-${boxSlug}-${i}`, boxSlug, itemId: item.id, author: cast.names[cast.who[i]], ageMin: core.age[i], rating, text: draft.text, likes, photo, lang });
    state.shapes.push(draft.shape);
  }
  return state.list.slice(0, want);
}

/**
 * 건마다 글이 어떤 조각으로 지어졌는지: 조각의 구실을 차례로 띄어 적은 것("got thing close tail").
 * 검사가 별점과 글의 결이 맞는지 볼 때만 쓴다. 화면은 쓰지 않는다
 */
export function sampleShapes(boxSlug: string): readonly string[] {
  sampleReviews(boxSlug);
  return built.get(boxSlug)?.shapes ?? [];
}

/** 건마다 쓴 조각(말끝을 바꿔 치기 전의 원래 줄). 검사가 가까운 글에 같은 조각이 되풀이되는지 볼 때만 쓴다 */
export function sampleParts(boxSlug: string): readonly (readonly string[])[] {
  sampleReviews(boxSlug);
  return built.get(boxSlug)?.parts ?? [];
}

// ── 모아 보기(/reviews): 박스를 가리지 않고 새것부터 ─────────────────
let order: Float64Array | null = null;
/** 모든 박스(BOXES)의 샘플을 새것부터 줄 세운 것. 뼈대의 "몇 분 전"만 쓰므로 글은 만들지 않는다. 박스는 512개, 박스마다 512건까지 담는 열쇠다 */
function newestOrder(): Float64Array {
  if (order) return order;
  const keys: number[] = [];
  BOXES.forEach((box, b) => { const core = coreOf(box.slug); if (core) for (let i = 0; i < core.count; i++) keys.push(core.age[i] * 262144 + b * 512 + i); });
  order = Float64Array.from(keys).sort();
  return order;
}

/** 박스를 가리지 않고 새것부터 limit 건. 보이는 건만 글을 만든다 */
export function newestSamples(limit: number): ReviewSample[] {
  if (!sampleReviewsOn()) return [];
  const keys = newestOrder(), out: ReviewSample[] = [];
  for (let k = 0; k < keys.length && out.length < limit; k++) {
    const rest = keys[k] % 262144, slug = BOXES[Math.floor(rest / 512)].slug, i = rest % 512;
    out.push(sampleReviews(slug, i + 1)[i]);
  }
  return out;
}

// ── 차례 바꾸기(모아 보기의 정렬, 2026-10-14 파운더): 글을 만들지 않고 뼈대만으로 줄을 세운다 ──────────
/** 모아 보기의 차례: 새것부터(지금의 차례), 상품의 값이 높은 것부터, 박스값의 배수가 높은 것부터 */
export type SampleSort = "newest" | "value" | "times";
/** 한 건의 뼈대: 상품, 몇 분 전인지, 별점. 글은 없다(싸다) */
export interface SampleSkeleton { item: ProductItem; ageMin: number; rating: ReviewSample["rating"] }
const skeletons = new Map<string, readonly SampleSkeleton[]>();
/** 이 박스의 뼈대 전부(i 번째가 i 번째 후기). 글을 만들지 않는다. 스위치를 끄면 빈 목록 */
export function sampleSkeleton(boxSlug: string): readonly SampleSkeleton[] {
  const core = sampleReviewsOn() ? coreOf(boxSlug) : null;
  if (!core) return [];
  let list = skeletons.get(boxSlug);
  if (!list) {
    list = Array.from({ length: core.count }, (_, i) => ({ item: core.items[core.pick[i]], ageMin: core.age[i], rating: core.rating[i] as ReviewSample["rating"] }));
    skeletons.set(boxSlug, list);
  }
  return list;
}
/**
 * 값이 높은 것부터, 같으면 새것부터. 배수(값을 박스값으로 나눈 것)가 높은 것부터, 같으면 값이 높은 것, 그다음 새것부터.
 * 반올림한 글자가 아니라 나눈 값 그대로 견준다(화면의 "N배"는 lib/reviewFeed 의 timesOfBox 가 따로 반올림한다)
 */
const higherFirst = (sort: SampleSort, value: Float64Array, times: Float64Array, age: Uint32Array) => (a: number, b: number): number =>
  (sort === "times" ? times[b] - times[a] : 0) || (value[b] - value[a]) || (age[a] - age[b]) || (a - b);
const boxOrders = new Map<string, Uint32Array>();
/** 한 박스의 차례(뼈대의 순번 배열). 박스마다, 차례마다 한 번만 센다 */
function boxOrder(sort: SampleSort, boxSlug: string): Uint32Array {
  const key = sort + "|" + boxSlug;
  let order = boxOrders.get(key);
  if (order) return order;
  const list = sampleSkeleton(boxSlug), price = BOX_BY_SLUG[boxSlug]?.price ?? 0;
  const value = Float64Array.from(list, (row) => row.item.value), times = Float64Array.from(value, (v) => (price > 0 ? v / price : 0)), age = Uint32Array.from(list, (row) => row.ageMin);
  order = Uint32Array.from({ length: list.length }, (_, i) => i).sort(higherFirst(sort, value, times, age));
  boxOrders.set(key, order);
  return order;
}
const allOrders = new Map<SampleSort, Uint32Array>();
/** 모든 박스의 차례(박스 번호 * 512 + 순번의 배열). 차례마다 한 번만 센다 */
function allOrder(sort: SampleSort): Uint32Array {
  let order = allOrders.get(sort);
  if (order) return order;
  const ids: number[] = [], values: number[] = [], ratios: number[] = [], ages: number[] = [];
  BOXES.forEach((box, b) => { sampleSkeleton(box.slug).forEach((row, i) => { ids.push(b * 512 + i); values.push(row.item.value); ratios.push(box.price > 0 ? row.item.value / box.price : 0); ages.push(row.ageMin); }); });
  const value = Float64Array.from(values), times = Float64Array.from(ratios), age = Uint32Array.from(ages);
  const ranks = Uint32Array.from({ length: ids.length }, (_, k) => k).sort(higherFirst(sort, value, times, age));
  order = Uint32Array.from(ranks, (k) => ids[k]);
  allOrders.set(sort, order);
  return order;
}
/**
 * 차례에 따라 앞에서 limit 건. boxSlug 가 null 이면 모든 박스. 새것부터는 지금의 길(sampleReviews, newestSamples) 그대로다.
 * 줄은 뼈대만으로 세우고 글은 돌려주는 건만 만든다(한 박스의 글은 앞에서부터 차례로 만들어지므로, 뒤쪽 건을 돌려주려면 그 박스의 앞 건들도 만든다).
 */
export function sortedSamples(sort: SampleSort, limit: number, boxSlug: string | null): ReviewSample[] {
  if (!sampleReviewsOn()) return [];
  if (sort === "newest") return boxSlug ? sampleReviews(boxSlug, limit) : newestSamples(limit);
  const out: ReviewSample[] = [];
  if (boxSlug) {
    const order = boxOrder(sort, boxSlug);
    for (let k = 0; k < order.length && out.length < limit; k++) out.push(sampleReviews(boxSlug, order[k] + 1)[order[k]]);
  } else {
    const order = allOrder(sort);
    for (let k = 0; k < order.length && out.length < limit; k++) { const slug = BOXES[Math.floor(order[k] / 512)].slug, i = order[k] % 512; out.push(sampleReviews(slug, i + 1)[i]); }
  }
  return out;
}

let totals: RatingSummary | null = null;
/** 모든 박스(BOXES)의 별점 요약(모아 보기의 머리). newestSamples 와 같은 모집단이다. extra 는 이 기기에서 실제로 쓴 후기의 점수들 */
export function allRatingSummary(extra: readonly number[] = []): RatingSummary {
  if (!sampleReviewsOn()) return summarizeRatings(extra);
  if (!totals) {
    const dist: RatingSummary["dist"] = [0, 0, 0, 0, 0];
    for (const box of BOXES) coreOf(box.slug)?.summary.dist.forEach((n, i) => { dist[i] += n; });
    totals = summaryOf(dist);
  }
  if (extra.length === 0) return totals;
  const mine = summarizeRatings(extra).dist;
  return summaryOf(totals.dist.map((n, i) => n + mine[i]) as RatingSummary["dist"]);
}
