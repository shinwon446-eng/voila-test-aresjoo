/**
 * 나온 상품(/wins)의 기준과 줄. 순수 함수라 화면 없이 시험한다(tests/wins.test.ts).
 *
 * 기준(flow/MELT_SPEC.md S8): 나온 상품의 참고가가 "그때의" 박스 1회 가격의 2배 이상.
 *  - 그때 가격: 기록의 boxPriceUsdt(lib/opening 이 개봉할 때 적는다)를 쓴다.
 *    옛 기록에는 이 값이 없다. 그때는 지금 카탈로그의 가격으로 견준다(정확한 그때 가격이 아니라 대신 쓰는 값이다).
 *    이 경우 줄의 priceStored 가 false 이고, 화면은 "그때의 1회 가격" 대신 "지금의 1회 가격"이라고 적는다.
 *  - 무료 개봉도 정상 가격으로 본다. 낸 돈(0)이 아니라 박스의 1회 가격이 분모다.
 *  - 100개를 한꺼번에 열어도 상품 하나의 분모는 1회 가격이다.
 *  - USDT 로 받았거나 배송을 신청한 뒤에도 줄은 남는다(상태를 보지 않는다).
 *  - USDT 결과(옛 박스의 cash)는 상품이 아니라 오르지 않는다.
 *  - 로그인하지 않았으면 줄이 없다.
 *
 * 여기 오르는 것은 이 기기의 이 계정 보관함 기록뿐이다. 다른 사람의 줄, 예시, 샘플은 어디에서도 만들지 않는다
 * (DESIGN.md 1장: 지어낸 당첨 소식은 표시를 달아도 쓰지 않는다).
 */
import { BOX_BY_SLUG } from "./products";
import type { OwnedItem } from "../stores/inventoryStore";

/** 여기 오르는 기준: 박스 1회 가격의 몇 배 이상 */
export const WIN_TIMES = 2;
/** 한 번에 보여 주는 줄 수 */
export const WINS_PAGE = 30;

export interface WinRow {
  id: string;
  record: OwnedItem;
  boxSlug: string;
  itemId: string;
  /** 참고가: 나온 때 기록에 적힌 값(지금 카탈로그의 값이 아니다) */
  value: number;
  /** 기준에 쓴 1회 가격 */
  price: number;
  /** true 면 기록에 적힌 그때 가격, false 면 지금 카탈로그의 가격으로 대신한 것 */
  priceStored: boolean;
  /** 무료 개봉이었는지. 알 수 없는 옛 기록은 null */
  free: boolean | null;
  at: string;
}

/** 지금 카탈로그에서 읽는 것 둘. 시험에서는 바꿔 끼운다 */
export interface WinCatalog {
  priceNow: (boxSlug: string) => number | undefined;
  kindOf: (boxSlug: string, itemId: string) => string | undefined;
}
export const LIVE_CATALOG: WinCatalog = {
  priceNow: (slug) => BOX_BY_SLUG[slug]?.price,
  kindOf: (slug, itemId) => BOX_BY_SLUG[slug]?.items.find((i) => i.id === itemId)?.kind,
};

/** 지갑의 개봉 거래 한 줄에서 읽는 것(무료 개봉을 옛 기록에서 알아내는 데만 쓴다) */
export interface OpenTx { type: string; ref?: string }

/** 기준에 쓰는 1회 가격. 기록에 그때 가격이 있으면 그것, 없으면 지금 가격(대신 쓰는 값) */
export function winPrice(o: Pick<OwnedItem, "boxSlug" | "boxPriceUsdt">, catalog: WinCatalog = LIVE_CATALOG): { price: number; stored: boolean } | null {
  if (typeof o.boxPriceUsdt === "number" && Number.isFinite(o.boxPriceUsdt) && o.boxPriceUsdt > 0) return { price: o.boxPriceUsdt, stored: true };
  // 옛 기록: 그때 가격을 적어 두지 않았다. 지금 가격으로 견준다(가격이 바뀐 박스라면 그때와 다를 수 있다).
  const now = catalog.priceNow(o.boxSlug);
  return typeof now === "number" && now > 0 ? { price: now, stored: false } : null;
}

/** 참고가가 1회 가격의 2배 이상인가. 정확히 2배는 든다, 1.999배는 들지 않는다(2를 곱하는 것은 부동소수에서 정확하다) */
export const isWin = (valueUsdt: number, priceUsdt: number): boolean => priceUsdt > 0 && Number.isFinite(valueUsdt) && valueUsdt >= priceUsdt * WIN_TIMES;

/**
 * 무료 개봉이었는지. 기록에 적혀 있으면 그대로.
 * 옛 기록은 지갑의 개봉 거래(`{slug}x{n}+free{k}:{openingId}`)에서 읽는다: 한 번의 개봉에서 앞의 k 개(회차가 이른 것)가 무료였다(lib/opening).
 * 거래를 찾지 못하면 알 수 없다(null). 지어내지 않는다.
 */
export function wasFreeOpen(o: OwnedItem, owned: readonly OwnedItem[], opens: readonly OpenTx[] = []): boolean | null {
  if (typeof o.freeOpen === "boolean") return o.freeOpen;
  if (!o.openingId) return null;
  const tail = ":" + o.openingId;
  const tx = opens.find((x) => x.type === "open" && typeof x.ref === "string" && x.ref.endsWith(tail));
  if (!tx?.ref) return null;
  const m = /x\d+(?:\+free(\d+))?$/.exec(tx.ref.slice(0, -tail.length));
  if (!m) return null;
  const freeCount = m[1] ? Number(m[1]) : 0;
  if (freeCount <= 0) return false;
  const rank = owned.filter((x) => x.openingId === o.openingId && x.fair.nonce < o.fair.nonce).length;
  return rank < freeCount;
}

const time = (iso: string): number => Date.parse(iso) || 0;

/**
 * 나온 상품의 줄. 새것부터.
 * 한 번에 여러 개를 열면 나온 때가 같다. 그때는 회차가 늦은 것이 위, 그래도 같으면 기록 id 순서로 고정한다
 * (넣는 순서가 달라도 같은 순서가 나온다).
 */
export function winRows(owned: readonly OwnedItem[], opts: { loggedIn: boolean; catalog?: WinCatalog; opens?: readonly OpenTx[] }): WinRow[] {
  if (!opts.loggedIn) return [];
  const catalog = opts.catalog ?? LIVE_CATALOG;
  const rows: WinRow[] = [];
  for (const o of owned) {
    // 상품만 오른다. 카탈로그에서 사라진 상품은 이름과 종류를 알 수 없어 올리지 않는다
    const kind = catalog.kindOf(o.boxSlug, o.itemId);
    if (!kind || kind === "cash") continue;
    const basis = winPrice(o, catalog);
    if (!basis || !isWin(o.valueUsdt, basis.price)) continue;
    rows.push({ id: o.id, record: o, boxSlug: o.boxSlug, itemId: o.itemId, value: o.valueUsdt, price: basis.price, priceStored: basis.stored, free: wasFreeOpen(o, owned, opts.opens), at: o.acquiredAt });
  }
  return rows.sort((a, b) => time(b.at) - time(a.at) || b.record.fair.nonce - a.record.fair.nonce || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** 이름은 가려 적는다: 닉네임이나 계정 이름(이메일이면 @ 앞)의 앞 두 글자만 */
export function maskedName(user: { nickname?: string; label?: string } | null | undefined): string {
  const name = (user?.nickname?.trim() || user?.label || "").split("@")[0].trim();
  return name ? Array.from(name).slice(0, 2).join("") + "***" : "";
}
