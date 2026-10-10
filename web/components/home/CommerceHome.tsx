"use client";
/**
 * 메인 페이지 시안 C (2026-10-10): 사진 중심 커머스형.
 * 럭셔리 리셀 커머스의 탐색 화면(밑줄 탭, 테두리 없는 사진 타일과 그 아래 글, 가격이 또렷한 목록)과
 * 수집품 팩 서비스의 진열(둥근 배너 카드와 밝은 알약 단추)에서 화면 문법만 가져온다.
 * 기능과 데이터는 그대로다. 주소에 ?skin=commerce 를 붙이면 이 시안이 뜬다.
 */
import { useMemo } from "react";
import { ChevronRight, PackageCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CATEGORY_FILTERS, SORTS, byCategory, heroBox, sortBoxes, type ProductBox, type SortKey } from "@/lib/products";
import { formatMultiple, topMultiple } from "@/lib/tiers";
import { useProductText } from "@/lib/useProductText";
import { ProductArt } from "@/components/box/ProductArt";
import { Money } from "@/components/ui/Money";
import { LiveReviewsSection } from "@/components/home/LiveReviewsSection";
import { copyFor } from "@/lib/homeCopy";
import type { CategoryTab } from "@/components/home/QuickTabs";

export interface CommerceHomeProps {
  category: CategoryTab;
  onCategory: (key: CategoryTab) => void;
  sort: SortKey;
  onSort: (key: SortKey) => void;
  onPick: (box: ProductBox) => void;
}

/** 박스의 대표 상품 이름 둘(가치가 큰 순, 현금성 구성품 제외) */
function useLeadItems() {
  const { itemName } = useProductText();
  return (box: ProductBox) => [...box.items].filter((i) => i.kind !== "cash").sort((a, b) => b.value - a.value).slice(0, 2).map((i) => itemName(i));
}

function BoxCell({ box, onPick }: { box: ProductBox; onPick: (box: ProductBox) => void }) {
  const copy = copyFor(useLocale()).shop;
  const { boxTitle } = useProductText();
  return (
    <button type="button" className="shop-card" onClick={() => onPick(box)}>
      <span className="shop-card-art"><ProductArt image={box.image} alt="" glowStrength={0} bordered={false} /></span>
      <span className="shop-card-name">{boxTitle(box)}</span>
      <span className="shop-card-price"><Money value={box.price} size="sm" /><span>{copy.perOpen}</span></span>
      <span className="shop-card-meta"><span>{copy.multipleLabel}</span><span>{copy.multipleValue.replace("{n}", formatMultiple(topMultiple(box)))}</span></span>
    </button>
  );
}

export function CommerceHome({ category, onCategory, sort, onSort, onPick }: CommerceHomeProps) {
  const t = useTranslations();
  const copy = copyFor(useLocale()).shop;
  const { boxTitle } = useProductText();
  const leadItems = useLeadItems();
  const feature = useMemo(() => heroBox(), []);
  const list = useMemo(() => sortBoxes(byCategory(category), sort), [category, sort]);

  const tabLabel = (key: CategoryTab) => (key === "all" ? copy.tabAll : t("categories." + key));

  return (
    <div className="shop-body">
      <nav className="shop-tabs" aria-label={copy.tabs}>
        <div className="shop-wrap shop-tabs-row">
          {CATEGORY_FILTERS.map(({ key }) => <button key={key} type="button" aria-pressed={category === key} className={"shop-tab" + (category === key ? " is-active" : "")} onClick={() => onCategory(key)}>{tabLabel(key)}</button>)}
        </div>
      </nav>

      {category === "all" && (
        <section className="shop-banner shop-wrap" aria-label={copy.bannerLabel}>
          <article className="shop-banner-card">
            <div className="shop-banner-art"><ProductArt image={feature.image} alt="" glowStrength={0} bordered={false} priority /></div>
            <div className="shop-banner-copy">
              <h2>{boxTitle(feature)}</h2>
              <p className="shop-banner-sub">{copy.etc.replace("{names}", leadItems(feature).join(", "))}</p>
              <p className="shop-banner-price"><span>{t("design.perOpen")}</span><Money value={feature.price} size="sm" /></p>
              <button type="button" className="shop-pill" onClick={() => onPick(feature)}>{copy.bannerCta}</button>
            </div>
          </article>
        </section>
      )}

      <section className="shop-list shop-wrap" aria-labelledby="hero-title">
        <div className="shop-list-head">
          <h1 id="hero-title">{category === "all" ? copy.listAll : tabLabel(category)}</h1>
          <span className="shop-list-count" role="status">{t("design.resultsCount", { count: list.length })}</span>
          <label className="shop-sort"><span className="sr-only">{t("grid.sort")}</span><select value={sort} onChange={(e) => onSort(e.target.value as SortKey)}>{SORTS.map((s) => <option key={s.key} value={s.key}>{t("sorts." + s.key)}</option>)}</select></label>
        </div>
        <p className="shop-list-note">{copy.staged}</p>
        <div className="shop-grid">{list.map((b) => <BoxCell key={b.id} box={b} onPick={onPick} />)}</div>
      </section>

      <section className="shop-trust shop-wrap" aria-label={copy.trustLabel}>
        {[{ Icon: ShieldCheck, href: "/fairness" }, { Icon: PackageCheck, href: "/inventory" }, { Icon: RefreshCw, href: "/legal/policy" }].map(({ Icon, href }, i) => (
          <Link key={href} href={href} className="shop-trust-item"><Icon size={22} strokeWidth={1.6} aria-hidden /><span><strong>{copy.trust[i][0]}</strong><span>{copy.trust[i][1]}</span></span></Link>
        ))}
      </section>

      <LiveReviewsSection count={6} />

      <nav className="shop-links shop-wrap" aria-label={copy.linksLabel}>
        <Link href="/about">{copy.guide}<ChevronRight size={18} aria-hidden /></Link>
        <Link href="/fairness">{copy.verify}<ChevronRight size={18} aria-hidden /></Link>
      </nav>
    </div>
  );
}

export default CommerceHome;
