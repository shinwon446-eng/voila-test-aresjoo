"use client";
/**
 * 박스 목록(메인). 결정 하나: 어느 박스를 볼지.
 * 카드에는 고르는 데 필요한 것만 둔다: 가장 값진 실물의 사진 한 장, 이름, 별점, 가격. 최고 상품가와 최대 배수는 박스 화면에 있다(카드에 적으면 100만 번에 한두 번 나오는 결과 하나로 박스끼리 줄을 세우게 된다)
 * (2026-10-11 파운더: "정보가 너무 많다"). 대표 상품 이름 셋, 구성품 수, 실물 확률, 가장 흔한 결과는
 * 한 번 눌러 들어가는 박스 화면의 첫 줄과 표에 있다.
 * 상품으로 찾기: 원하는 상품이 어느 박스에 있는지 바로 안다(상품 행 → 그 박스).
 * 최근에 연 박스가 맨 앞에 온다. 남의 당첨 소식, 인기 순위, 타이머는 없다.
 */
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CATEGORY_FILTERS, HOME_BOXES, dropTable, faceOf, isLadderBox, sortBoxes, type BoxCategory, type ProductBox, type ProductItem } from "@/lib/products";
import { CATEGORIES_V2 } from "@/lib/catalogTypes";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";
import { useInventoryStore } from "@/stores/inventoryStore";
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
/** 카테고리를 돌아가며 한 박스씩: 1번 카테고리의 첫 박스, 2번의 첫 박스, ... 그다음 둘째 박스들 */
function interleave(boxes: ProductBox[]): ProductBox[] {
  const groups = new Map<string, ProductBox[]>();
  for (const box of boxes) groups.set(box.category, [...(groups.get(box.category) ?? []), box]);
  const rows = Array.from(groups.values());
  const out: ProductBox[] = [];
  for (let i = 0; out.length < boxes.length; i++) for (const row of rows) if (row[i]) out.push(row[i]);
  return out;
}

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
  const owned = useInventoryStore((s) => s.items);

  // 최근에 연 박스를 앞으로. 기록이 없으면 추천 순서 그대로다.
  const boxes = useMemo(() => {
    const lastOpened = new Map<string, number>();
    for (const item of owned) lastOpened.set(item.boxSlug, Math.max(lastOpened.get(item.boxSlug) ?? 0, Date.parse(item.acquiredAt) || 0));
    const sorted = sortBoxes(category === "all" ? HOME_BOXES : HOME_BOXES.filter((b) => b.category === category), "featured");
    // "전체"는 카테고리를 돌아가며 한 박스씩 놓는다(첫 화면이 한 카테고리로만 차지 않게). 카테고리 안의 순서는 그대로다
    const list = category === "all" ? interleave(sorted) : sorted;
    return [...list].sort((a, b) => (lastOpened.get(b.slug) ?? 0) - (lastOpened.get(a.slug) ?? 0));
  }, [category, owned]);

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
