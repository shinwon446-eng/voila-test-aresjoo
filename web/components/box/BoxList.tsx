"use client";
/**
 * 박스 목록(메인). 결정 하나: 어느 박스를 볼지.
 * 카드에는 고르는 데 필요한 것만 둔다: 가장 값진 실물의 사진 한 장, 이름, 가격과 별점(같은 줄), 최고 상품가
 * (2026-10-11 파운더: "정보가 너무 많다"). 대표 상품 이름 셋, 구성품 수, 실물 확률, 가장 흔한 결과는
 * 한 번 눌러 들어가는 박스 화면의 첫 줄과 표에 있다.
 * 상품으로 찾기: 원하는 상품이 어느 박스에 있는지 바로 안다(상품 행 → 그 박스).
 * 최근에 연 박스가 맨 앞에 온다. 남의 당첨 소식, 인기 순위, 타이머는 없다.
 */
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BOXES, CATEGORY_FILTERS, byCategory, ceilingValue, dropTable, formatRate, sortBoxes, type BoxCategory, type ProductBox, type ProductItem } from "@/lib/products";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";
import { useInventoryStore } from "@/stores/inventoryStore";
import { Chips, Empty, ScreenHead } from "@/components/ui/kit";
import { RatingInline } from "@/components/box/BoxReviews";
import { ratingSummary } from "@/lib/reviewSamples";

type Category = BoxCategory | "all";
const SEARCH_MAX = 30;

export function BoxList() {
  const t = useTranslations("v");
  const tc = useTranslations("categories");
  const { boxTitle, itemName } = useProductText();
  const { fmt } = useCurrency();
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const owned = useInventoryStore((s) => s.items);

  // 최근에 연 박스를 앞으로. 기록이 없으면 추천 순서 그대로다.
  const boxes = useMemo(() => {
    const lastOpened = new Map<string, number>();
    for (const item of owned) lastOpened.set(item.boxSlug, Math.max(lastOpened.get(item.boxSlug) ?? 0, Date.parse(item.acquiredAt) || 0));
    const list = sortBoxes(byCategory(category), "featured");
    return [...list].sort((a, b) => (lastOpened.get(b.slug) ?? 0) - (lastOpened.get(a.slug) ?? 0));
  }, [category, owned]);

  // 상품 검색: 세 언어 이름 어디든 들어 있으면. 같은 상품이 여러 박스에 있으면 박스마다 한 행
  const q = query.trim().toLowerCase();
  const hits = useMemo(() => {
    if (q.length < 1) return [];
    const out: { box: ProductBox; item: ProductItem }[] = [];
    for (const box of BOXES) for (const item of dropTable(box)) {
      if (item.kind === "cash") continue;
      if ([item.name, item.nameEn, item.nameZh].some((n) => n && n.toLowerCase().includes(q))) out.push({ box, item });
      if (out.length >= SEARCH_MAX) return out;
    }
    return out.sort((a, b) => b.item.value - a.item.value);
  }, [q]);

  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead title={t("home.title")} desc={t("home.desc")} />
      {/* 이름표를 따로 두지 않는다. 칸 안의 글이 곧 이름표다(화면 읽기 도구에는 aria-label 로 읽힌다) */}
      <input type="search" className="v-input" aria-label={t("home.search")} placeholder={t("home.search")} value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
      {q ? (
        hits.length === 0 ? <Empty>{t("home.searchNone")}</Empty> : (
          <ul className="v-itemrows">
            {hits.map(({ box, item }) => (
              <li key={box.slug + item.id}>
                <Link href={"/box/" + box.slug} className="v-itemrow">
                  {item.image.src && <span className="v-itemrow-photo"><img src={item.image.src} alt="" loading="lazy" decoding="async" /></span>}
                  <span className="v-itemrow-body"><span className="v-card-title">{itemName(item)}</span><span className="v-small">{t("home.searchIn", { box: boxTitle(box), price: fmt(box.price) })}</span></span>
                  <span className="v-itemrow-meta"><span className="v-num v-small">{t("home.refPrice", { amount: fmt(item.value) })}</span><span className="v-num v-small">{formatRate(item.dropRate)}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : (
        <>
          <Chips scroll label={t("home.filter")} value={category} onChange={setCategory} options={CATEGORY_FILTERS.map((c) => ({ value: c.key as Category, label: c.key === "all" ? t("home.all") : tc(c.key) }))} />
          <ul className="v-boxgrid">
            {boxes.map((box, i) => { const lead = leadOf(box); return <li key={box.id}><BoxCard box={box} title={boxTitle(box)} price={fmt(box.price)} top={t("home.top", { amount: fmt(ceilingValue(box)) })} photo={lead?.image.src ?? null} leadName={lead ? itemName(lead) : ""} eager={i < 6} /></li>; })}
          </ul>
        </>
      )}
    </div>
  );
}

/** 카드에 올리는 대표 실물 하나: 사진이 있는 것 가운데 값이 가장 큰 것. 사진이 하나도 없으면 값이 가장 큰 실물(이름만 쓴다) */
const leadOf = (box: ProductBox): ProductItem | undefined => {
  const real = [...box.items].filter((i) => i.kind !== "cash").sort((a, b) => b.value - a.value);
  return real.find((i) => i.image.src) ?? real[0];
};

function BoxCard({ box, title, price, top, photo, leadName, eager }: { box: ProductBox; title: string; price: string; top: string; photo: string | null; leadName: string; eager: boolean }) {
  return (
    <Link href={"/box/" + box.slug} className="v-boxcard">
      {/* 사진이 없는 박스도 같은 자리에 같은 크기의 칸을 둔다(카드 높이가 들쭉날쭉하지 않게). 그 칸에는 대표 상품의 이름을 적는다 */}
      <span className="v-boxcard-photo">{photo ? <img src={photo} alt={leadName} loading={eager ? "eager" : "lazy"} decoding="async" /> : <span className="v-boxcard-nophoto"><span>{leadName}</span></span>}</span>
      <span className="v-boxcard-body">
        <span className="v-card-title">{title}</span>
        <span className="v-boxcard-price"><span className="v-num v-sub">{price}</span><RatingInline summary={ratingSummary(box.slug)} /></span>
        <span className="v-num v-small">{top}</span>
      </span>
    </Link>
  );
}
