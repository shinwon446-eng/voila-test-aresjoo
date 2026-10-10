"use client";
/**
 * 박스 목록(메인). 결정 하나: 어느 박스를 볼지.
 * 카드에는 열기 전에 알아야 할 사실만 둔다: 이름, 가격, 최고 상품가, 구성품 수.
 * 최근에 연 박스가 맨 앞에 온다. 남의 당첨 소식, 인기 순위, 타이머는 없다.
 */
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CATEGORY_FILTERS, byCategory, ceilingValue, sortBoxes, type BoxCategory, type ProductBox } from "@/lib/products";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";
import { useInventoryStore } from "@/stores/inventoryStore";
import { Chips, ScreenHead, TextLink } from "@/components/ui/kit";

type Category = BoxCategory | "all";

export function BoxList() {
  const t = useTranslations("v");
  const tc = useTranslations("categories");
  const { boxTitle } = useProductText();
  const { fmt } = useCurrency();
  const [category, setCategory] = useState<Category>("all");
  const owned = useInventoryStore((s) => s.items);

  // 최근에 연 박스를 앞으로. 기록이 없으면 추천 순서 그대로다.
  const boxes = useMemo(() => {
    const lastOpened = new Map<string, number>();
    for (const item of owned) lastOpened.set(item.boxSlug, Math.max(lastOpened.get(item.boxSlug) ?? 0, Date.parse(item.acquiredAt) || 0));
    const list = sortBoxes(byCategory(category), "featured");
    return [...list].sort((a, b) => (lastOpened.get(b.slug) ?? 0) - (lastOpened.get(a.slug) ?? 0));
  }, [category, owned]);

  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead title={t("home.title")} desc={t("home.desc")} />
      <Chips scroll label={t("home.filter")} value={category} onChange={setCategory} options={CATEGORY_FILTERS.map((c) => ({ value: c.key as Category, label: c.key === "all" ? t("home.all") : tc(c.key) }))} />
      <ul className="v-boxgrid">
        {boxes.map((box, i) => <li key={box.id}><BoxCard box={box} title={boxTitle(box)} price={t("home.price", { price: fmt(box.price) })} top={t("home.top", { amount: fmt(ceilingValue(box)) })} count={t("home.count", { n: box.items.length })} eager={i < 4} /></li>)}
      </ul>
      <div className="v-links">
        <TextLink href="/guide">{t("nav.guide")}</TextLink>
        <TextLink href="/fairness">{t("nav.verify")}</TextLink>
      </div>
    </div>
  );
}

function BoxCard({ box, title, price, top, count, eager }: { box: ProductBox; title: string; price: string; top: string; count: string; eager: boolean }) {
  return (
    <Link href={"/box/" + box.slug} className="v-boxcard">
      <span className="v-boxcard-photo">{box.image.src && <img src={box.image.src} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />}</span>
      <span className="v-boxcard-body">
        <span className="v-card-title">{title}</span>
        <span className="v-num v-sub">{price}</span>
        <span className="v-boxcard-meta"><span className="v-num">{top}</span><span>{count}</span></span>
      </span>
    </Link>
  );
}
