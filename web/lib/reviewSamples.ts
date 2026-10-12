// 샘플 후기와 별점을 만드는 한 곳. 실제 이용자가 쓴 글과 점수가 아니다.
// 정식 서비스 전의 시험 사이트라 샘플로 채운다(2026-10-11, 2026-10-12 파운더). 정식 서비스에서는 반드시 꺼야 한다:
//   빌드할 때 NEXT_PUBLIC_SAMPLE_REVIEWS=off 를 준다(0, false 도 같다). 주지 않으면 켜져 있다.
//   끄면 샘플은 한 건도 나오지 않고, 별점과 후기 수는 이 기기에서 실제로 쓴 후기만으로 센다.
// 박스마다 80건 이상 400건 이하. 박스가 320개라 6만 건이 넘으니 파일로 두지 않고 박스 번호를 씨앗으로 그때그때 만든다. 같은 박스는 언제나 같은 후기다.
// 두 단계로 만든다:
//   1) 뼈대(coreOf): 건수, 건마다의 상품과 별점과 몇 분 전인지. 숫자만 다루므로 싸다. 박스 목록의 별점과 후기 수는 여기까지만 쓴다.
//   2) 글(sampleReviews): 별명, 글, 좋아요 수, 붙은 사진. 화면에 보이는 만큼만 앞에서부터 만든다.
// 상품은 그 박스의 구성품에서 고른다(흔한 것이 많고 비싼 것은 드물게, USDT 결과는 고르지 않는다).
// 사진 후기의 사진은 손님이 찍은 사진이 아니라 카탈로그에 올려 둔 그 상품의 사진이다(lib/productImages 의 경로 그대로).
// 시각은 날짜가 아니라 "몇 분 전"으로 쥔다. 샘플의 "4일 전" 은 시계를 읽지 않고 씨앗에서만 나오므로
//   미리 그려 둔 HTML(정적 내보내기)과 브라우저가 그린 것이 언제나 같다(V5). 그래서 샘플은 언제 봐도 오늘 기준으로 같은 거리에 있다.
// 말 조각은 lib/reviewSampleText.ts 에 있다. 별점의 뜻: 상품을 받은 사람이 받은 상품과 배송에 매긴 점수다(뽑기 운의 점수가 아니다).
import { BOX_BY_SLUG, HOME_BOXES, type ProductBox, type ProductItem } from "./products";
import { BANNED, CLOSE, EN, FLOW, GIFT, GOT, GRIPE, ITEM, ITEM_NAMED, LEAD, MID, MID_CLOSE, NEG, NEG_CLOSE, NICK, SHIP, SLANG, TAIL, TOPICS, USE, USE_GIFT, ZH, type Topic } from "./reviewSampleText";

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

export interface RatingSummary {
  count: number;
  /** 평균(소수 첫째 자리). 후기가 없으면 null */
  avg: number | null;
  /** [1점, 2점, 3점, 4점, 5점] */
  dist: [number, number, number, number, number];
}

const summaryOf = (dist: RatingSummary["dist"]): RatingSummary => {
  const count = dist.reduce((a, b) => a + b, 0);
  const sum = dist.reduce((a, n, i) => a + n * (i + 1), 0);
  return { count, avg: count ? Math.round((sum / count) * 10) / 10 : null, dist };
};

/** 점수들의 요약. 1 에서 5 사이의 정수만 센다 */
export function summarizeRatings(ratings: readonly number[]): RatingSummary {
  const dist: RatingSummary["dist"] = [0, 0, 0, 0, 0];
  for (const r of ratings) if (Number.isInteger(r) && r >= 1 && r <= 5) dist[r - 1] += 1;
  return summaryOf(dist);
}

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

/** 씨앗에 섞는 값. 바꾸면 모든 박스의 샘플이 한꺼번에 새로 정해진다 */
const SALT = "10";

// ── 1) 뼈대 ─────────────────────────────────────────────────
type Outcome = "big" | "good" | "even" | "low";
/** 박스 가격 대비 상품가로 본 결과의 크기 */
const outcomeOf = (value: number, price: number): Outcome => { const x = value / price; return x >= 8 ? "big" : x >= 1.5 ? "good" : x >= 0.7 ? "even" : "low"; };
/** 결과의 크기마다 별점의 누적 확률: [5점까지, 4점까지, 3점까지, 2점까지]. 나머지가 1점 */
const RATING_CUT: Record<Outcome, [number, number, number, number]> = {
  big: [0.88, 0.98, 1, 1],
  good: [0.68, 0.93, 0.98, 0.995],
  even: [0.52, 0.84, 0.96, 0.985],
  low: [0.42, 0.76, 0.935, 0.975],
};
/** 상품이 뽑히는 무게: 확률을 눌러 쓴다(실제 확률 그대로면 흔한 상품 몇 개만 나오고, 고르게 하면 비싼 것이 너무 자주 나온다) */
const PICK_POWER = 0.62;
const DAY = 1440;

interface Core { box: ProductBox; items: ProductItem[]; count: number; pick: Uint16Array; rating: Uint8Array; age: Uint32Array; summary: RatingSummary }
const cores = new Map<string, Core | null>();

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
  let total = 0;
  items.forEach((item, k) => { total += Math.pow(item.dropRate, PICK_POWER); cumulative[k] = total; });
  const outcomes = items.map((item) => outcomeOf(item.value, box.price));
  // 박스마다 별점이 조금씩 다르게: 별 다섯과 넷 사이의 선만 옮긴다(낮은 점수의 몫은 그대로다)
  const lift = (next() - 0.3) * 0.14;
  // 가장 새 글은 15분에서 하루 남짓 전, 가장 오래된 글은 다섯 달에서 열한 달 전
  const span = (150 + next() * 180) * DAY, gap = span / count;
  const pick = new Uint16Array(count), rating = new Uint8Array(count), age = new Uint32Array(count);
  const dist: RatingSummary["dist"] = [0, 0, 0, 0, 0];
  let at = 15 + next() * 1500;
  for (let i = 0; i < count; i++) {
    const target = next() * total;
    let lo = 0, hi = items.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cumulative[mid] > target) hi = mid; else lo = mid + 1; }
    pick[i] = lo;
    const cut = RATING_CUT[outcomes[lo]], u = next();
    const stars = u < cut[0] + lift ? 5 : u < cut[1] ? 4 : u < cut[2] ? 3 : u < cut[3] ? 2 : 1;
    rating[i] = stars; dist[stars - 1] += 1;
    age[i] = Math.round(at);
    at += 3 - Math.log(1 - next()) * gap;
  }
  const core: Core = { box, items, count, pick, rating, age, summary: summaryOf(dist) };
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

// ── 2) 글 ───────────────────────────────────────────────────
interface Deck { order: number[]; at: number; cycle: number }
interface Built { list: ReviewSample[]; texts: Set<string>; names: Set<string>; decks: Map<string, Deck> }
const built = new Map<string, Built>();

/**
 * 조각 묶음에서 다음 한 줄. 박스마다 묶음을 섞어 놓고 차례로 꺼낸다(다 쓰면 다시 섞는다).
 * 그래서 한 박스 안에서 같은 조각은 묶음을 한 바퀴 돌기 전에는 다시 나오지 않는다.
 */
function draw(state: Built, slug: string, key: string, pool: readonly string[]): string {
  let deck = state.decks.get(key);
  if (!deck || deck.at >= deck.order.length) {
    const cycle = deck ? deck.cycle + 1 : 0, last = deck ? deck.order[deck.order.length - 1] : -1;
    const next = rng(hash(`deck|${SALT}|${slug}|${key}|${cycle}`));
    const order = pool.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    // 바퀴가 바뀌는 자리에서 같은 줄이 잇달아 나오지 않게
    if (order.length > 1 && order[0] === last) [order[0], order[1]] = [order[1], order[0]];
    deck = { order, at: 0, cycle };
    state.decks.set(key, deck);
  }
  return pool[deck.order[deck.at++]];
}

const topicCache = new Map<string, number>();
/** 그 상품의 종류(TOPICS 의 순번). 할 말이 따로 없으면 -1 */
function topicIndexOf(box: ProductBox, item: ProductItem): number {
  const key = box.category + "|" + item.id;
  const cached = topicCache.get(key);
  if (cached !== undefined) return cached;
  const found = TOPICS.findIndex((topic) => topic.cats.includes(box.category) && item.value >= topic.min && item.value <= topic.max && topic.re.test(item.name));
  const index = found >= 0 && TOPICS[found].lines.length === 0 ? -1 : found;
  topicCache.set(key, index);
  return index;
}

const pickOne = <V,>(list: readonly V[], r: () => number): V => list[Math.floor(r() * list.length)];
/** 배송이 없는 상품(디지털)에 붙이지 않는 줄 */
const SHIPPED = /배송|박스|상자|포장|택배|통관/;
const MID_DIGITAL = MID.filter((line) => !SHIPPED.test(line)), NEG_DIGITAL = NEG.filter((line) => !SHIPPED.test(line));
const MID_CLOSE_DIGITAL = MID_CLOSE.filter((line) => !SHIPPED.test(line)), NEG_CLOSE_DIGITAL = NEG_CLOSE.filter((line) => !SHIPPED.test(line));
/** 영어와 중국어 줄 가운데 결과의 크기를 말하는 것: 작은 결과에만, 큰 결과에만 쓴다 */
const SMALL_ONLY = /Not the big prize|Smaller prize|small ones|虽然不是大奖|小奖|小的领了/;
const LARGE_ONLY = /Did not expect to actually win|Finally hit|Solid pull|没想到真的开出来|居然开到了|运气不错/;
const byOutcome = (pool: readonly string[]) => ({ small: pool.filter((line) => !LARGE_ONLY.test(line)), large: pool.filter((line) => !SMALL_ONLY.test(line)) });
const EN_POS = byOutcome(EN.pos), ZH_POS = byOutcome(ZH.pos);

interface Ask { state: Built; slug: string; r: () => number; rating: number; outcome: Outcome; topic: Topic | null; topicKey: string; digital: boolean; giftable: boolean }

/** 한국어 글 한 건. 조각을 하나에서 셋까지 잇는다 */
function koText({ state, slug, r, rating, outcome, topic, topicKey, digital, giftable }: Ask): string {
  const D = (key: string, pool: readonly string[]) => draw(state, slug, key, pool);
  const hasLines = !!topic && topic.lines.length > 0, hasNouns = !!topic && topic.nouns.length > 0;
  /** 물건에 대한 한 조각: 종류에 맞는 말, 이름을 넣은 말, 어느 상품에나 맞는 말 */
  const thing = (): string => {
    const u = r();
    if (hasLines && u < 0.42) return D(topicKey, topic!.lines);
    if (hasNouns && u < 0.6) return D("named", ITEM_NAMED).replace("{item}", pickOne(topic!.nouns, r));
    return D("item", ITEM);
  };
  const got = () => D("got-" + outcome, GOT[outcome]);
  /** 쓰임 한 조각. 누구에게 줬다는 말은 선물이 될 만한 상품에만 */
  const use = () => (giftable && r() < 0.45 ? D("gift", USE_GIFT) : D("use", USE));
  // 큰 결과에는 "엄마 드렸어요" 같은 쓰임 조각을 붙이지 않는다
  const after = () => (outcome !== "big" && r() < 0.35 ? use() : thing());
  /** 물건 말고 곁들이는 한 조각: 배송이나 쓰임 */
  const side = (ship: boolean) => (ship && (outcome === "big" || r() < 0.5) ? D("ship", SHIP) : outcome === "big" ? thing() : use());
  let parts: string[];
  let tails: readonly string[] = TAIL.pos, tailOdds = 0.42;
  if (rating >= 4) {
    const gripe = rating === 4 && !digital && r() < 0.38;
    const ship = !digital;
    const u = outcome === "big" && r() < 0.6 ? 0.3 : r();
    // 디지털 상품(상품권)은 물건도 배송도 없다: 그 종류의 말과 맺음말만 쓴다
    const code = () => (r() < 0.7 ? D(topicKey, topic!.lines) : D("named", ITEM_NAMED).replace("{item}", pickOne(topic!.nouns, r)));
    if (digital) parts = u < 0.4 ? [code()] : u < 0.7 ? [got(), code()] : [code(), D("close", CLOSE)];
    // 별 넷의 작은 아쉬움: 좋았던 한 조각 뒤에 아쉬운 한 줄. 맺음말과 웃음은 붙이지 않는다
    else if (gripe) { const first = u < 0.55 ? thing() : u < 0.85 ? got() : use(); parts = [first.endsWith("지만") ? thing() : first, D("gripe", GRIPE)]; tailOdds = 0; }
    else if (u < 0.2) parts = [r() < 0.72 ? thing() : side(ship)];
    else if (u < 0.44) parts = [got(), after()];
    else if (u < 0.58) parts = [thing(), side(ship)];
    else if (u < 0.74) parts = [thing(), D("close", CLOSE)];
    else if (u < 0.8) parts = ship ? [got(), D("ship", SHIP), D("close", CLOSE)] : [got(), D("close", CLOSE)];
    else if (u < 0.88) parts = [D("flow", FLOW), ...(r() < 0.5 ? [r() < 0.5 ? thing() : D("close", CLOSE)] : [])];
    else { parts = [got()]; if (parts[0].endsWith("지만")) parts.push(after()); }
    // 크게 놀란 웃음은 나온 것을 말한 글에만
    if (outcome === "big" && parts.length > 0 && GOT.big.includes(parts[0]) && r() < 0.6) tails = TAIL.big;
  } else if (rating === 3) {
    parts = [D(digital ? "mid-d" : "mid", digital ? MID_DIGITAL : MID)];
    if (r() < 0.4) parts.push(D(digital ? "midc-d" : "midc", digital ? MID_CLOSE_DIGITAL : MID_CLOSE));
    tails = TAIL.mid; tailOdds = 0.28;
  } else {
    parts = [D(digital ? "neg-d" : "neg", digital ? NEG_DIGITAL : NEG)];
    if (r() < 0.35) parts.push(D(digital ? "negc-d" : "negc", digital ? NEG_CLOSE_DIGITAL : NEG_CLOSE));
    tails = TAIL.neg; tailOdds = 0.45;
  }
  // 빨리 친 글처럼: 말끝을 바꿔 치거나, 한 조각의 띄어쓰기를 다 붙이거나
  if (r() < 0.09) {
    const k = Math.floor(r() * parts.length);
    const swap = SLANG.find(([re]) => re.test(parts[k]));
    if (swap) parts[k] = parts[k].replace(swap[0], pickOne(swap[1], r));
  }
  if (r() < 0.08) { const k = Math.floor(r() * parts.length); parts[k] = parts[k].replace(/ /g, ""); }
  const dotted = r() < 0.2 && !parts.some((part, k) => k < parts.length - 1 && part.endsWith("지만"));
  let text = parts.join(dotted ? ". " : " ");
  if (parts.length === 1 && text.length <= 22 && r() < 0.08) text = text.replace(/ /g, "");
  if (dotted && r() < 0.5) text += ".";
  else if (r() < tailOdds) text += " " + pickOne(tails, r);
  // 감탄으로 여는 글은 좋은 결과에만
  if (rating === 5 && (outcome === "big" || outcome === "good") && r() < 0.1 && !/^(드디어|오|와|헐|크)/.test(text)) text = pickOne(LEAD, r) + " " + text;
  return text;
}

/** 영어와 중국어 글 한 건: 한 줄, 가끔 맺음말이 붙는다 */
function foreignText({ state, slug, r, rating, outcome }: Ask, lang: "en" | "zh"): string {
  const words = lang === "en" ? EN : ZH, positive = lang === "en" ? EN_POS : ZH_POS;
  const size = outcome === "big" || outcome === "good" ? "large" : "small";
  const line = rating >= 4 ? draw(state, slug, `${lang}-pos-${size}`, positive[size]) : rating === 3 ? draw(state, slug, lang + "-mid", words.mid) : draw(state, slug, lang + "-neg", words.neg);
  let text = line;
  if (rating >= 4 && r() < 0.5) text += (lang === "en" ? (r() < 0.5 ? ", " : ". ") : "，") + draw(state, slug, lang + "-close", words.close);
  // 웃음은 좋은 글에만 붙인다
  const tail = rating >= 4 ? pickOne(words.tail, r) : "";
  if (tail) text += (lang === "en" ? " " : "") + tail;
  if (lang === "en" && r() < 0.3) text = text.toLowerCase();
  return text;
}

const DIGITS = ["2", "7", "77", "01", "88", "99", "1004", "12", "3", "486", "79", "22", "5", "123", "0", "33", "8", "21", "07", "1"];
/** 별명 하나. 재료도 박스마다 섞어 놓고 차례로 꺼내므로 비슷한 별명이 가까이 붙어 나오지 않는다 */
function nickname(state: Built, slug: string, lang: ReviewSample["lang"], r: () => number): string {
  const D = (key: string, pool: readonly string[]) => draw(state, slug, key, pool);
  if (lang === "en") { const name = D("nick-en", NICK.en); return (r() < 0.35 ? name[0].toUpperCase() + name.slice(1) : name) + pickOne(NICK.enTail, r); }
  if (lang === "zh") return D("nick-zh", NICK.zh) + (r() < 0.2 ? pickOne(DIGITS, r) : "");
  const u = r();
  if (u < 0.45) return D("nick-a", NICK.a) + (r() < 0.12 ? " " : "") + D("nick-b", NICK.b) + (r() < 0.25 ? pickOne(DIGITS, r) : "");
  if (u < 0.8) return D("nick-whole", NICK.whole) + (r() < 0.3 ? pickOne(DIGITS, r) : "");
  return D("nick-id", NICK.id) + (r() < 0.2 ? "_" + pickOne(NICK.id, r) : "") + (r() < 0.8 ? pickOne(DIGITS, r) : "");
}

/**
 * 이 박스의 샘플 후기를 새것부터 limit 건. 앞에서부터 차례로 만들고 만든 것은 쥐고 있다(더 보기를 누르면 이어서 만든다).
 * i 번째 후기는 limit 과 상관없이 언제나 같다. 한 박스 안에서 같은 글과 같은 별명은 두 번 나오지 않는다.
 */
export function sampleReviews(boxSlug: string, limit = Infinity): ReviewSample[] {
  const core = sampleReviewsOn() ? coreOf(boxSlug) : null;
  if (!core) return [];
  let state = built.get(boxSlug);
  if (!state) { state = { list: [], texts: new Set(), names: new Set(), decks: new Map() }; built.set(boxSlug, state); }
  const want = Math.min(core.count, Math.max(0, limit));
  for (let i = state.list.length; i < want; i++) {
    const item = core.items[core.pick[i]], rating = core.rating[i] as ReviewSample["rating"];
    const r = rng(hash(`text|${SALT}|${boxSlug}|${i}`));
    const u = r();
    const digital = item.kind === "digital";
    // 영어와 중국어 줄은 배송 받은 이야기라 디지털 상품에는 쓰지 않는다
    const lang: ReviewSample["lang"] = u < 0.85 || digital ? "ko" : u < 0.93 ? "en" : "zh";
    const index = digital ? -2 : topicIndexOf(core.box, item);
    const ask: Ask = { state, slug: boxSlug, r, rating, outcome: outcomeOf(item.value, core.box.price), topic: digital ? GIFT : index >= 0 ? TOPICS[index] : null, topicKey: "topic" + index, digital, giftable: !digital && index >= 0 && TOPICS[index].nouns.length > 0 && item.value >= 40 };
    let text = "";
    for (let tries = 0; tries < 40; tries++) {
      text = lang === "ko" ? koText(ask) : foreignText(ask, lang);
      if (!state.texts.has(text) && !BANNED.has(text)) break;
    }
    // 마흔 번을 다시 만들어도 겹치면(조각이 아주 적은 경우) 물결표를 붙여서라도 다르게 한다
    while (state.texts.has(text)) text += lang === "zh" ? "～" : "~";
    state.texts.add(text);
    let author = "";
    for (let tries = 0; tries < 40; tries++) { author = nickname(state, boxSlug, lang, r); if (!state.names.has(author) && !BANNED.has(author)) break; }
    while (state.names.has(author)) author += pickOne(DIGITS, r);
    state.names.add(author);
    const photo = item.image.src && r() < (ask.outcome === "big" ? 0.8 : 0.55) ? item.image.src : null;
    // 좋아요: 대부분 0에서 몇 개. 사진이 붙었거나 큰 결과이거나 오래된 글이면 조금 더 많다
    const weight = 1.1 * (photo ? 2.2 : 1) * (ask.outcome === "big" ? 4 : ask.outcome === "good" ? 1.5 : 1) * (0.6 + core.age[i] / (120 * DAY));
    const likes = Math.min(99, Math.floor(-Math.log(1 - r()) * weight));
    state.list.push({ id: `s-${boxSlug}-${i}`, boxSlug, itemId: item.id, author, ageMin: core.age[i], rating, text, likes, photo, lang });
  }
  return state.list.slice(0, want);
}

// ── 모아 보기(/reviews): 박스를 가리지 않고 새것부터 ─────────────────
let order: Float64Array | null = null;
/** 홈에 나오는 모든 박스의 샘플을 새것부터 줄 세운 것. 뼈대의 "몇 분 전"만 쓰므로 글은 만들지 않는다 */
function newestOrder(): Float64Array {
  if (order) return order;
  const keys: number[] = [];
  HOME_BOXES.forEach((box, b) => { const core = coreOf(box.slug); if (core) for (let i = 0; i < core.count; i++) keys.push(core.age[i] * 262144 + b * 512 + i); });
  order = Float64Array.from(keys).sort();
  return order;
}

/** 박스를 가리지 않고 새것부터 limit 건. 보이는 건만 글을 만든다 */
export function newestSamples(limit: number): ReviewSample[] {
  if (!sampleReviewsOn()) return [];
  const keys = newestOrder(), out: ReviewSample[] = [];
  for (let k = 0; k < keys.length && out.length < limit; k++) {
    const rest = keys[k] % 262144, slug = HOME_BOXES[Math.floor(rest / 512)].slug, i = rest % 512;
    out.push(sampleReviews(slug, i + 1)[i]);
  }
  return out;
}

let totals: RatingSummary | null = null;
/** 홈에 나오는 모든 박스의 별점 요약(모아 보기의 머리). extra 는 이 기기에서 실제로 쓴 후기의 점수들 */
export function allRatingSummary(extra: readonly number[] = []): RatingSummary {
  if (!sampleReviewsOn()) return summarizeRatings(extra);
  if (!totals) {
    const dist: RatingSummary["dist"] = [0, 0, 0, 0, 0];
    for (const box of HOME_BOXES) coreOf(box.slug)?.summary.dist.forEach((n, i) => { dist[i] += n; });
    totals = summaryOf(dist);
  }
  if (extra.length === 0) return totals;
  const mine = summarizeRatings(extra).dist;
  return summaryOf(totals.dist.map((n, i) => n + mine[i]) as RatingSummary["dist"]);
}
