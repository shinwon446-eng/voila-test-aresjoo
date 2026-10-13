/**
 * 전체 박스의 순서(2026-10-12 파운더: "고객이 최대한 지리게끔"). flow/RESTORE_SPEC.md W1.
 * 카드에 보이는 것은 대표 상품의 사진, 박스 이름, 별점, 가격뿐이다. 그래서 순서가 하는 일은 하나다:
 * 보자마자 무엇인지 알고 갖고 싶은 사진이 낼 만한 값 바로 옆에 놓이게 한다.
 *
 *  1. 값은 여덟 칸마다 물결친다(PRICE_WAVE): 50, 100, 20, 250, 50, 100, 20, 500 달러. 누구나 아는 상표는 50 과 100 달러에 몰려 있어
 *     (플레이스테이션, 나이키, 애플) 그 둘이 휴대폰 첫 화면의 두 칸이다. 바로 옆에 가장 싼 박스가 오고, 여덟 칸 안에 가장 비싼 박스가 한 번 나온다.
 *  2. 칸마다 남은 박스에 점수를 매겨 가장 높은 것을 놓는다:
 *     전시 점수(SHOWCASE) - 값이 그 칸의 값에서 먼 만큼 - 그 카테고리가 이미 나온 만큼 - 바로 앞 칸과 같은 카테고리면 크게.
 *  3. 전시 점수는 편집자가 정한 진열 순서다. 대표 사진이 보자마자 읽히고 누구나 아는 상품일수록 높다(플레이스테이션 5, 롤렉스, 버킨).
 *     상표는 유명해도 대표 사진이 낯선 것(기업용 부품, 방송 렌즈)은 적지 않는다. 손님 수, 판매량, 당첨 수가 아니고 화면에 순위나 인기라고 적지 않는다.
 *  4. 사진이 없는 박스는 사진이 있는 박스가 다 나온 뒤에 온다. 첫 화면에 빈 칸이 없다.
 *  5. 최근에 직접 연 박스 둘이 맨 앞이다(사진이 있는 것만). 하던 것을 바로 잇는다.
 *  6. 잔액이 있으면 여덟 칸 가운데 일곱 칸은 그 잔액으로 열 수 있는 박스에서만 고른다. 여덟째 칸은 그대로 둔다(충전하면 닿는 것 하나).
 *  7. 분류 하나만 볼 때는 물결을 쓰지 않는다(그 분류에 없는 값을 찾아다니지 않는다). 전시 점수가 높은 것, 그다음 싼 것이 먼저다.
 *
 * 남의 당첨, 지어낸 인기 순위, 마감 시각 같은 것은 쓰지 않는다. 같은 입력이면 언제나 같은 순서다.
 * 화면은 이 순서를 들어올 때 한 번 정하고, 잔액이 바뀌었다고 보고 있는 카드를 옮기지 않는다(BoxList).
 */
import { faceOf, type ProductBox } from "./products";

export interface BoxOrderContext {
  /** 직접 연 박스의 번호(slug)와 마지막으로 연 시각(ms). 업그레이드로 생긴 상품은 넣지 않는다 */
  opened?: ReadonlyMap<string, number>;
  /** 지금 쓸 수 있는 잔액(USDT). 0 이하이거나 모르면 잔액으로 순서를 바꾸지 않는다 */
  balance?: number;
}

/** 맨 앞에 두는 최근에 연 박스의 수 */
export const RECENT_MAX = 2;
/** 여덟 칸의 값 물결(USDT). 지금 박스 가격은 20, 50, 100, 250, 500 이다 */
export const PRICE_WAVE = [50, 100, 20, 250, 50, 100, 20, 500] as const;
/** 값이 그 칸의 값의 두 배(또는 절반)일 때마다 깎는 점수 */
const PRICE_DISTANCE = 30;
/** 그 카테고리가 한 번 나올 때마다 깎는 점수 */
const CATEGORY_SERVED = 8;
/** 바로 앞 칸과 같은 카테고리일 때 깎는 점수 */
const ADJACENT_CATEGORY = 60;
/** 분류 하나만 볼 때, 값이 그 분류의 가장 싼 값의 두 배일 때마다 깎는 점수 */
const SOLO_PRICE = 6;
/** 적히지 않은 박스의 전시 점수 */
export const SHOWCASE_DEFAULT = 25;
/**
 * 전시 점수. 편집자가 정한 진열 순서이고(2026-10-12, Codex 검수의 안에서 시작), 실제 인기 자료가 아니다.
 * 박스를 더하거나 대표 사진이 바뀌면 여기를 고친다. 없는 번호가 적혀 있으면 테스트가 잡는다.
 */
const SHOWCASE_TIERS: [number, string[]][] = [
  // 맨 첫 칸은 누구나 아는 것 하나로 정해 둔다(머리 띠가 이미 리자몽 박스라 같은 것이 두 번 나오지 않게)
  [105, ["gaming-playstation"]],
  [100, ["watch-rolex", "pokemon-charizard"]],
  [95, ["gaming-nintendo", "fashion-nike", "bag-chanel", "mobile-apple"]],
  [90, ["bag-hermes", "car-porsche", "beauty-chanel", "fashion-adidas", "mobile-samsung", "toy-lego"]],
  [85, ["car-rolls-royce", "toy-jellycat", "beauty-dyson", "toy-pop-mart", "bag-gucci", "watch-omega"]],
  [80, ["beauty-dior", "gaming-xbox", "home-roborock", "toy-bandai", "beauty-aesop", "beauty-kiehls", "car-tesla"]],
  [75, ["beauty-jo-malone", "computer-keychron", "toy-sylvanian-families", "fashion-new-balance", "bag-loewe", "outdoor-stanley", "car-bmw"]],
  [70, ["home-irobot", "camera-gopro", "toy-smiski", "car-genesis", "fashion-converse", "sport-titleist", "home-cuckoo"]],
];
// 물려받은 이름(constructor 같은 것)이 박스 번호로 읽히지 않게 빈 바탕 위에 만든다(BOX_BY_SLUG 와 같다)
export const SHOWCASE: Readonly<Record<string, number>> = Object.assign(Object.create(null), Object.fromEntries(SHOWCASE_TIERS.flatMap(([score, slugs]) => slugs.map((slug) => [slug, score] as const))));

export const showcaseOf = (box: ProductBox): number => SHOWCASE[box.slug] ?? SHOWCASE_DEFAULT;
/** 대표 상품가 나누기 박스 가격. 점수가 같을 때만 쓴다 */
export const pullOf = (box: ProductBox): number => (box.price > 0 ? (faceOf(box)?.value ?? 0) / box.price : 0);
const bySlug = (a: ProductBox, b: ProductBox): number => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0);

export function boxOrder(boxes: readonly ProductBox[], ctx: BoxOrderContext = {}): ProductBox[] {
  const opened = ctx.opened ?? new Map<string, number>();
  // 얼굴은 박스마다 한 번만 구한다(점수가 같을 때마다 다시 구하면 한 번 놓는 데 0.25초가 넘게 걸린다)
  const faces = new Map(boxes.map((b) => [b, faceOf(b)] as const));
  const pull = (b: ProductBox): number => (b.price > 0 ? (faces.get(b)?.value ?? 0) / b.price : 0);
  const hasPhoto = (b: ProductBox): boolean => Boolean(faces.get(b)?.image.src);
  const balance = Number.isFinite(ctx.balance) && (ctx.balance as number) > 0 ? (ctx.balance as number) : null;
  const solo = new Set<string>(boxes.map((b) => b.category)).size <= 1;

  // 사진이 없는 박스는 최근에 열었어도 앞에 두지 않는다(첫 화면에 빈 칸이 없다)
  const recent = boxes.filter((b) => opened.has(b.slug) && hasPhoto(b)).sort((a, b) => (opened.get(b.slug) ?? 0) - (opened.get(a.slug) ?? 0) || bySlug(a, b)).slice(0, RECENT_MAX);
  const taken = new Set(recent.map((b) => b.slug));
  const rest = boxes.filter((b) => !taken.has(b.slug));
  const tail = rest.filter((b) => !hasPhoto(b)).sort((a, b) => showcaseOf(b) - showcaseOf(a) || a.price - b.price || bySlug(a, b));
  const pool = rest.filter(hasPhoto).sort(bySlug);

  if (solo) {
    const floor = Math.min(...pool.map((b) => b.price), Infinity);
    const score = (b: ProductBox): number => showcaseOf(b) - SOLO_PRICE * Math.log2(b.price / floor);
    return [...recent, ...pool.sort((a, b) => score(b) - score(a) || b.popularity - a.popularity || bySlug(a, b)), ...tail];
  }

  // 앞에 둔 최근 박스도 "이미 나온 카테고리"와 "바로 앞 칸"으로 센다
  const served = new Map<string, number>();
  for (const box of recent) served.set(box.category, (served.get(box.category) ?? 0) + 1);
  const out: ProductBox[] = [];
  const left = [...pool];
  for (let i = 0; left.length > 0; i++) {
    const dream = i % PRICE_WAVE.length === PRICE_WAVE.length - 1;
    // 잔액이 있으면 열 수 있는 박스에서만 고른다(물결의 마지막 칸은 그대로). 열 수 있는 것이 남지 않았으면 가리지 않는다
    const affordable = balance !== null && !dream ? left.filter((b) => b.price <= balance) : [];
    const candidates = affordable.length > 0 ? affordable : left;
    const want = affordable.length > 0 ? Math.min(PRICE_WAVE[i % PRICE_WAVE.length], Math.max(...affordable.map((b) => b.price))) : PRICE_WAVE[i % PRICE_WAVE.length];
    const before: string | null = out.length > 0 ? out[out.length - 1].category : recent.length > 0 ? recent[recent.length - 1].category : null;
    const score = (b: ProductBox): number =>
      showcaseOf(b) - PRICE_DISTANCE * Math.abs(Math.log2(b.price / want)) - CATEGORY_SERVED * (served.get(b.category) ?? 0) - (b.category === before ? ADJACENT_CATEGORY : 0);
    let best = candidates[0];
    let top = score(best);
    for (const box of candidates) {
      const s = score(box);
      if (s > top + 1e-9 || (Math.abs(s - top) <= 1e-9 && (pull(box) > pull(best) || (pull(box) === pull(best) && bySlug(box, best) < 0)))) { best = box; top = s; }
    }
    out.push(best);
    left.splice(left.indexOf(best), 1);
    served.set(best.category, (served.get(best.category) ?? 0) + 1);
  }
  return [...recent, ...out, ...tail];
}
