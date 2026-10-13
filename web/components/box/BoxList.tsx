"use client";
/**
 * 박스 목록(메인). 결정 하나: 어느 박스를 볼지.
 * 카드에는 고르는 데 필요한 것만 둔다: 가장 값진 실물의 사진 한 장, 이름, 별점, 가격. 최고 상품가와 최대 배수는 박스 화면에 있다(카드에 적으면 100만 번에 한두 번 나오는 결과 하나로 박스끼리 줄을 세우게 된다)
 * (2026-10-11 파운더: "정보가 너무 많다"). 대표 상품 이름 셋, 구성품 수, 실물 확률, 가장 흔한 결과는
 * 한 번 눌러 들어가는 박스 화면의 첫 줄과 표에 있다.
 * 상품으로 찾기: 원하는 상품이 어느 박스에 있는지 바로 안다(상품 행 → 그 박스).
 * 순서는 lib/boxOrder 가 정한다(최근에 직접 연 박스, 값의 물결, 누구나 아는 상품 먼저, 잔액으로 열 수 있는 것 먼저). 남의 당첨 소식, 인기 순위, 타이머는 없다.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CATEGORY_FILTERS, HOME_BOXES, dropTable, faceOf, isLadderBox, type BoxCategory, type ProductBox, type ProductItem } from "@/lib/products";
import { boxOrder, type BoxOrderContext } from "@/lib/boxOrder";
import { CATEGORIES_V2 } from "@/lib/catalogTypes";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useWalletStore } from "@/stores/walletStore";
import { useAuthStore } from "@/stores/authStore";
import { Button, Chips, Empty, ScreenHead } from "@/components/ui/kit";
import { RatingInline, useRealRatings } from "@/components/box/BoxReviews";
import { HeroBanner } from "@/components/home/HeroBanner";
import { boxRating } from "@/lib/reviewFeed";
import type { RatingSummary } from "@/lib/reviewRating";

type Category = BoxCategory | "all";
const SEARCH_MAX = 30;
/** 한 번에 보여 주는 박스 수. 박스가 수백 개라 나눠 보여 준다 */
const PAGE = 24;
/** 분류 단추의 순서: 옛 분류, 그다음 새 카탈로그의 카테고리. 박스가 있는 것만 나온다 */
const CATEGORY_ORDER: BoxCategory[] = [...CATEGORY_FILTERS.flatMap((c) => (c.key === "all" ? [] : [c.key as BoxCategory])), ...CATEGORIES_V2];
const HOME_CATEGORIES: BoxCategory[] = CATEGORY_ORDER.filter((key) => HOME_BOXES.some((b) => b.category === key));
const isV2 = (key: string): boolean => (CATEGORIES_V2 as readonly string[]).includes(key);
/** 업그레이드로 생긴 상품인가(그 박스를 직접 연 것이 아니다). 그 칸이 아직 없는 판에서도 같은 뜻으로 읽힌다 */
const fromUpgrade = (item: object): boolean => "upgradedFrom" in item && Boolean((item as { upgradedFrom?: unknown }).upgradedFrom);
/** 순서에 쓰는 내 기록과 잔액을 지금의 장부에서 한 번 읽는다. 직접 연 박스만 센다 */
function readOrderContext(): BoxOrderContext {
  const opened = new Map<string, number>();
  for (const item of useInventoryStore.getState().items) if (!fromUpgrade(item)) opened.set(item.boxSlug, Math.max(opened.get(item.boxSlug) ?? 0, Date.parse(item.acquiredAt) || 0));
  return { opened, balance: useWalletStore.getState().balance };
}
/** 서버에서는 그리기 전 효과가 없으니 보통 효과로 둔다(BoxReviews 와 같다) */
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function BoxList() {
  const t = useTranslations("v");
  const tc = useTranslations("categories");
  const { boxTitle, itemName } = useProductText();
  const { fmt } = useCurrency();
  // 실제 후기의 점수는 여기서 한 번만 모아 카드에 나눠 준다
  const real = useRealRatings();
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE);
  // 순서의 규칙은 lib/boxOrder 한 곳에 있다. 분류를 고르면 그 분류 안에서 같은 규칙으로 놓는다.
  // 내 기록과 잔액은 이 화면에 들어올 때와 분류를 바꿀 때 한 번만 읽는다(받기나 충전으로 잔액이 바뀌었다고 보고 있는 카드를 옮기지 않는다).
  // 계정이 정해진 뒤에만 읽는다. 사이트를 새로 열면 로그인한 계정의 장부가 첫 그림 뒤에 붙고, 그때 카드를 옮기면 화면이 덜컥거린다.
  // 그래서 새로 연 첫 화면은 기록 없이 놓은 순서(서버가 그린 순서) 그대로 두고, 화면 안에서 다시 들어오거나 분류를 바꾸면 내 순서를 쓴다
  const [ctx, setCtx] = useState<BoxOrderContext>({});
  useBrowserLayoutEffect(() => {
    // 계정이 이미 정해져 있으면 그리기 전에 읽는다(기록 없는 순서가 한 프레임도 보이지 않게)
    if (useAuthStore.getState().hydrated) setCtx(readOrderContext());
  }, [category]);
  // 이 화면을 보는 동안 로그인하거나 나가면 그 계정의 장부로 한 번 다시 놓는다. 새로 연 화면에서 계정이 처음 정해질 때는 옮기지 않는다
  const accountId = useAuthStore((s) => (s.hydrated ? s.user?.id ?? null : undefined));
  const seenAccount = useRef(accountId);
  useEffect(() => {
    if (accountId === undefined || seenAccount.current === accountId) return;
    const first = seenAccount.current === undefined;
    seenAccount.current = accountId;
    if (first) return;
    // 계정의 장부는 같은 차례에 AuthHost 가 바꿔 끼운다(레이아웃에서 이 화면보다 뒤라 그 효과가 나중에 돈다). 그 다음에 읽는다
    const timer = window.setTimeout(() => setCtx(readOrderContext()), 0);
    return () => window.clearTimeout(timer);
  }, [accountId]);
  const boxes = useMemo(() => boxOrder(category === "all" ? HOME_BOXES : HOME_BOXES.filter((b) => b.category === category), ctx), [category, ctx]);

  // 상품 검색: 세 언어의 상품 이름이나 박스 이름 어디든 들어 있으면("포켓몬 카드", "자동차"처럼 박스 이름으로 찾으면 그 박스의 상품이 나온다).
  // 같은 상품이 여러 박스에 있으면 박스마다 한 행
  const q = query.trim().toLowerCase();
  const hits = useMemo(() => {
    if (q.length < 1) return [];
    const out: { box: ProductBox; item: ProductItem }[] = [];
    for (const box of HOME_BOXES) {
      const boxHit = [box.title, box.titleEn, box.brand, boxTitle(box)].some((n) => n && n.toLowerCase().includes(q));
      for (const item of dropTable(box)) {
      if (item.kind === "cash") continue;
      if (boxHit || [item.name, item.nameEn, item.nameZh].some((n) => n && n.toLowerCase().includes(q))) out.push({ box, item });
      if (out.length >= SEARCH_MAX) return out;
      }
    }
    return out.sort((a, b) => b.item.value - a.item.value);
  }, [q, boxTitle]);

  return (
    <div className="v-stack v-stack--lg">
      {!q && <HeroBanner />}
      <ScreenHead title={t("home.title")} desc={t("home.desc")} />
      {/* 이름표를 따로 두지 않는다. 칸 안의 글이 곧 이름표다(화면 읽기 도구에는 aria-label 로 읽힌다) */}
      {/* 돋보기가 "찾는 곳"임을 말하고, 안내 글은 실제로 찾아지는 예 셋만 적는다(2026-10-11 파운더: 문장은 읽기 힘들다) */}
      <label className="v-search"><Search size={18} aria-hidden /><input type="search" className="v-input" aria-label={t("home.search")} placeholder={t("home.searchHint")} value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" /></label>
      {q ? (
        hits.length === 0 ? <Empty>{t("home.searchNone")}</Empty> : (
          <ul className="v-itemrows">
            {hits.map(({ box, item }) => (
              <li key={box.slug + item.id}>
                <Link href={"/box/" + box.slug} className="v-itemrow">
                  {item.image.src && <span className="v-itemrow-photo"><img src={item.image.src} alt="" loading="lazy" decoding="async" /></span>}
                  <span className="v-itemrow-body"><span className="v-card-title">{itemName(item)}</span><span className="v-small">{t("home.searchIn", { box: boxTitle(box), price: fmt(box.price) })}</span></span>
                  <span className="v-itemrow-meta"><span className="v-num v-small">{t("home.refPrice", { amount: fmt(item.value) })}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : (
        <>
          <Chips scroll label={t("home.filter")} value={category} onChange={(key) => { setCategory(key); setShown(PAGE); }} options={[{ value: "all" as Category, label: t("home.all") }, ...HOME_CATEGORIES.map((key) => ({ value: key as Category, label: isV2(key) ? t("cat." + key) : tc(key) }))]} />
          <ul className="v-boxgrid">
            {boxes.slice(0, shown).map((box, i) => { const lead = leadOf(box); return <li key={box.id}><BoxCard box={box} rating={boxRating(box.slug, real)} title={boxTitle(box)} price={fmt(box.price)} noRating={t("home.noRating")} photo={lead?.image.src ?? null} leadName={lead ? itemName(lead) : ""} eager={i < 6} /></li>; })}
          </ul>
          {boxes.length > shown && <Button quiet onClick={() => setShown((n) => n + PAGE)}>{t("home.more", { n: boxes.length - shown })}</Button>}
        </>
      )}
    </div>
  );
}

/** 카드에 올리는 대표 실물 하나: 사진이 있는 것 가운데 값이 가장 큰 것. 사진이 하나도 없으면 값이 가장 큰 실물(이름만 쓴다) */
const leadOf = (box: ProductBox): ProductItem | undefined => faceOf(box);

/** rating 은 박스 화면과 같은 집계다(lib/reviewFeed 의 boxRating: 샘플 위에 실제 후기를 더한 것) */
function BoxCard({ box, rating, title, price, noRating, photo, leadName, eager }: { box: ProductBox; rating: RatingSummary; title: string; price: string; noRating: string; photo: string | null; leadName: string; eager: boolean }) {
  return (
    <Link href={"/box/" + box.slug} className="v-boxcard">
      {/* 사진이 없는 박스도 같은 자리에 같은 크기의 칸을 둔다(카드 높이가 들쭉날쭉하지 않게). 그 칸에는 대표 상품의 이름을 적는다 */}
      <span className="v-boxcard-photo">{photo ? <img src={photo} alt={leadName} loading={eager ? "eager" : "lazy"} decoding="async" /> : <span className="v-boxcard-nophoto"><span>{leadName}</span></span>}</span>
      <span className="v-boxcard-body">
        <span className="v-card-title">{title}</span>
        {/* 별점은 이름 바로 아래 왼쪽에 둔다(가격 옆에 띄우면 가격과 다툰다). 후기가 없는 박스도 같은 줄을 써서 카드 높이를 맞춘다 */}
        {/* 새 카탈로그의 박스는 후기가 생길 때까지 이 줄을 두지 않는다(수백 장에 "후기 없음"을 되풀이하지 않는다) */}
        {(rating.avg !== null || isLadderBox(box)) && <span className="v-boxcard-rating">{rating.avg === null ? <span className="v-small">{noRating}</span> : <RatingInline summary={rating} />}</span>}
        <span className="v-num v-sub">{price}</span>
      </span>
    </Link>
  );
}
