"use client";
/**
 * 박스 목록(메인). 결정 하나: 어느 박스를 볼지.
 * 카드에는 열기 전에 알아야 할 사실만 둔다: 실물 사진 셋, 이름, 가격, 최고 상품가, 구성품 수.
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
import { Chips, Empty, Field, ScreenHead } from "@/components/ui/kit";

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
      <Field label={t("home.search")} type="search" placeholder={t("home.searchHint")} value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
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
            {boxes.map((box, i) => <li key={box.id}><BoxCard box={box} title={boxTitle(box)} price={t("home.price", { price: fmt(box.price) })} top={t("home.top", { amount: fmt(ceilingValue(box)) })} real={t("home.real", { pct: formatRate(realOdds(box)) })} common={t("home.common", { amount: fmt(box.price * 0.5), pct: formatRate(dropTable(box).find((i) => i.id.startsWith("wave-cashback-") && i.value === +(box.price * 0.5).toFixed(2))?.dropRate ?? 50) })} count={t("home.count", { n: box.items.length })} leads={topItems(box)} leadName={itemName} eager={i < 4} /></li>)}
          </ul>
        </>
      )}
    </div>
  );
}

/** 카드에 올리는 대표 실물 셋: 사진 있는 것 가운데 값이 큰 순서. 사진이 셋이 안 되면 이름으로 */
const topItems = (box: ProductBox) => {
  const real = [...box.items].filter((i) => i.kind !== "cash").sort((a, b) => b.value - a.value);
  // 사진이 있는 상품을 앞에, 없으면 이름만. 사진 수에 맞춰 띠가 1~3칸이 된다(빈 칸을 남기지 않는다)
  const withPhoto = real.filter((i) => i.image.src).slice(0, 3);
  return withPhoto.length ? withPhoto : real.slice(0, 3);
};

/** 실물(현금 아닌 것)이 하나라도 나올 확률의 합 */
const realOdds = (box: ProductBox) => +dropTable(box).filter((i) => i.kind !== "cash" && !i.id.startsWith("wave-")).reduce((s, i) => s + i.dropRate, 0).toFixed(4);

function BoxCard({ box, title, price, top, real, common, count, leads, leadName, eager }: { box: ProductBox; title: string; price: string; top: string; real: string; common: string; count: string; leads: ProductItem[]; leadName: (i: ProductItem) => string; eager: boolean }) {
  const shots = leads.filter((i) => i.image.src);
  return (
    <Link href={"/box/" + box.slug} className="v-boxcard v-boxcard--photos">
      {shots.length > 0 && <span className="v-boxcard-photos" data-n={shots.length}>{shots.map((i) => <span key={i.id} className="v-boxcard-photo"><img src={i.image.src!} alt={leadName(i)} loading={eager ? "eager" : "lazy"} decoding="async" /></span>)}</span>}
      <span className="v-boxcard-body">
        <span className="v-card-title">{title}</span>
        <span className="v-num v-sub">{price}</span>
        <span className="v-boxcard-leads">{leads.map((i) => <span key={i.id}>{leadName(i)}</span>)}</span>
        <span className="v-boxcard-meta"><span className="v-num">{top}</span><span className="v-num">{real}</span><span>{count}</span></span>
        <span className="v-boxcard-meta"><span className="v-num">{common}</span></span>
      </span>
    </Link>
  );
}
