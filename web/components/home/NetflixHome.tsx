"use client";
/**
 * 메인 페이지 시안 B (2026-10-10, 2차): 넷플릭스 모바일 앱의 화면 문법을 실제 화면을 재어 옮겼다.
 * 대표색이 번지는 배경 → 둥근 사각 칩 → 세로형 큰 빌보드 → 세로 포스터 줄(제목이 그림 위) → 상품 후기 → 떠 있는 하단 탭.
 * 분류 칩을 누르면 줄 대신 그 분류의 포스터 격자와 정렬이 나온다. 기능과 데이터는 그대로다.
 * 넷플릭스의 로고, 이름, 글꼴, 그림은 쓰지 않는다. 주소에 ?skin=netflix 를 붙이면 이 시안이 뜬다.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Home, LayoutGrid, Package, PackageCheck, PackageOpen, RefreshCw, ShieldCheck, UserRound, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BOXES, CATEGORY_FILTERS, SORTS, byCategory, heroBox, sortBoxes, type BoxCategory, type ProductBox, type SortKey } from "@/lib/products";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";
import { LiveReviewsSection } from "@/components/home/LiveReviewsSection";
import { copyFor } from "@/lib/homeCopy";
import type { CategoryTab } from "@/components/home/QuickTabs";

export interface NetflixHomeProps {
  category: CategoryTab;
  onCategory: (key: CategoryTab) => void;
  sort: SortKey;
  onSort: (key: SortKey) => void;
  onPick: (box: ProductBox) => void;
}

/**
 * 가로 4:3 사진을 세로 포스터(5:7)에 넣는 방법. 세로로 자르면 가로의 절반쯤만 남는다.
 *   fill: 상품이 가운데 절반 안에 들어오는 사진. x 는 자르는 중심(0~100).
 *   keep: 자르면 상품이 망가지는 사진. 같은 사진을 흐리게 깐 위에 원본 전체를 얹는다.
 *   zoom, dy: 상품이 작거나 낮게 놓인 사진을 키우고 위로 올린다(dy 는 %). bright: 어두운 사진의 밝기. bigDy: 빌보드에서만 올리는 양. w: keep 사진의 폭(%). 100 보다 크면 좌우를 조금 잘라 사진을 키운다.
 */
const POSTER: Record<string, { mode: "fill" | "keep"; x?: number; zoom?: number; dy?: number; bright?: number; bigDy?: number; w?: number }> = {
  "dollar-apple": { mode: "fill", x: 51, bigDy: -6 },
  "dollar-galaxy": { mode: "fill", x: 49, bright: 1.14 },
  "dollar-gaming": { mode: "fill", x: 45 },
  "starter-ps5": { mode: "fill", x: 46 },
  "starter-macbook": { mode: "fill", x: 52 },
  "starter-phone": { mode: "fill", x: 50, zoom: 1.15, dy: -7 },
  "vault-submariner": { mode: "fill", x: 22, zoom: 1.16, dy: -8 },
  "vault-omega": { mode: "fill", x: 76, zoom: 1.2, dy: -10 },
  "vault-handbag": { mode: "keep", w: 114, x: 55 },
  "vault-gold": { mode: "fill", x: 50 },
  "jackpot-cybertruck": { mode: "keep", w: 128, x: 49 },
  "jackpot-supercar": { mode: "keep", w: 124, x: 51 },
};
/** 빌보드 뒤로 번지는 대표색. 사진에서 고른 낮은 채도의 색 */
const AMBIENT: Record<string, string> = { "dollar-apple": "#403526" };
const CATEGORY_ROWS: BoxCategory[] = ["dollar", "tech", "luxury", "jackpot"];

/** 포스터 한 장: 그림, 그 위의 제목, 아래 가운데 가격 띠, 왼쪽 위 인기 순위 */
function Poster({ box, rank, onPick, large = false }: { box: ProductBox; rank?: number; onPick?: (box: ProductBox) => void; large?: boolean }) {
  const copy = copyFor(useLocale()).nfx;
  const { boxTitle } = useProductText();
  const { fmt } = useCurrency();
  const cfg = POSTER[box.slug] ?? { mode: "fill" as const, x: 50 };
  const src = box.image.src ?? "";
  const dy = large ? cfg.bigDy ?? cfg.dy : cfg.dy;
  const keepStyle = cfg.w ? { width: cfg.w + "%", left: -((cfg.w - 100) * (cfg.x ?? 50)) / 100 + "%" } : undefined;
  const fillStyle = { objectPosition: (cfg.x ?? 50) + "% 50%", transform: cfg.zoom || dy ? "translateY(" + (dy ?? 0) + "%) scale(" + (cfg.zoom ?? 1) + ")" : undefined, filter: cfg.bright ? "brightness(" + cfg.bright + ")" : undefined };
  const art = (
    <>
      {cfg.mode === "keep" && <img className="nfx-poster-blur" src={src} alt="" aria-hidden loading={large ? "eager" : "lazy"} />}
      <img className={"nfx-poster-img " + cfg.mode} src={src} alt="" style={cfg.mode === "fill" ? fillStyle : keepStyle} loading={large ? "eager" : "lazy"} />
      <span className="nfx-poster-shade" aria-hidden />
    </>
  );
  if (large) return <span className="nfx-poster-art large">{art}</span>;
  return (
    <button type="button" className="nfx-poster" onClick={() => onPick?.(box)} aria-label={boxTitle(box) + ", " + fmt(box.price)}>
      <span className="nfx-poster-art">{art}</span>
      {rank && <span className="nfx-rank-badge" aria-label={copy.rank.replace("{n}", String(rank))}><span>{copy.rankLabel}</span><b>{rank}</b></span>}
      <span className="nfx-poster-title">{boxTitle(box)}</span>
      <span className="nfx-price-badge">{fmt(box.price)}</span>
    </button>
  );
}

/** 가로로 넘기는 줄. PC 에서는 더 넘길 것이 남은 쪽에 화살표가 뜬다 */
function Row({ title, children, labels }: { title: string; children: React.ReactNode; labels: { prev: string; next: string } }) {
  const track = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ prev: false, next: false });
  useEffect(() => {
    const el = track.current; if (!el) return;
    const sync = () => setMore({ prev: el.scrollLeft > 4, next: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => { el.removeEventListener("scroll", sync); window.removeEventListener("resize", sync); };
  }, []);
  const move = (dir: 1 | -1) => { const el = track.current; if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); };
  return (
    <section className="nfx-row" aria-label={title}>
      <h2>{title}</h2>
      <div className={"nfx-row-wrap" + (more.prev ? " has-prev" : "") + (more.next ? " has-next" : "")}>
        <button type="button" className="nfx-arrow prev" aria-label={labels.prev} onClick={() => move(-1)}><ChevronLeft size={28} aria-hidden /></button>
        <div ref={track} className="nfx-track">{children}</div>
        <button type="button" className="nfx-arrow next" aria-label={labels.next} onClick={() => move(1)}><ChevronRight size={28} aria-hidden /></button>
      </div>
    </section>
  );
}

export function NetflixHome({ category, onCategory, sort, onSort, onPick }: NetflixHomeProps) {
  const t = useTranslations();
  const copy = copyFor(useLocale()).nfx;
  const { boxTitle } = useProductText();
  const { fmt } = useCurrency();
  const [browseAll, setBrowseAll] = useState(false);
  const grid = browseAll || category !== "all";
  const top = useRef<HTMLDivElement>(null);

  // 머리줄은 맨 위에서는 투명하고 내려가면 검정이 된다
  useEffect(() => {
    const root = document.documentElement;
    const onScroll = () => root.toggleAttribute("data-nfx-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); root.removeAttribute("data-nfx-scrolled"); };
  }, []);

  const feature = useMemo(() => heroBox(), []);
  // 인기 순위는 인기 값 내림차순 하나만 쓴다(추천 순서와 섞지 않는다)
  const popular = useMemo(() => sortBoxes(BOXES, "popularity").slice(0, 6), []);
  const rankOf = useMemo(() => Object.fromEntries(popular.map((b, i) => [b.id, i + 1])) as Record<string, number>, [popular]);
  const list = useMemo(() => sortBoxes(byCategory(category), sort), [category, sort]);

  const pick = (key: CategoryTab) => { setBrowseAll(key === "all"); onCategory(key); top.current?.scrollIntoView({ block: "start" }); };
  const clear = () => { setBrowseAll(false); onCategory("all"); window.scrollTo({ top: 0 }); };
  const chipLabel = (key: CategoryTab) => (key === "all" ? copy.all : t("categories." + key));
  const arrows = { prev: copy.prev, next: copy.next };
  const chips = grid ? [...CATEGORY_FILTERS].sort((a, b) => Number(b.key === category) - Number(a.key === category)) : CATEGORY_FILTERS;

  return (
    <div className="nfx-body" data-view={grid ? "grid" : "home"} style={{ ["--nfx-ambient" as string]: AMBIENT[feature.slug] ?? "#33302b" }}>
      <div className="nfx-ambient" aria-hidden />
      <div ref={top} className="nfx-chips" role="group" aria-label={copy.chips}>
        {grid && <button type="button" className="nfx-chip-clear" aria-label={copy.clear} onClick={clear}><X size={18} aria-hidden /></button>}
        {chips.map(({ key }) => {
          const active = grid && category === key;
          return <button key={key} type="button" aria-pressed={active} className={"nfx-chip" + (active ? " is-active" : "")} onClick={() => pick(key)}>{chipLabel(key)}</button>;
        })}
      </div>

      {!grid && (
        <>
          <section className="nfx-billboard" aria-labelledby="hero-title">
            <Poster box={feature} large />
            <div className="nfx-billboard-copy">
              <h1 id="hero-title">{boxTitle(feature)}</h1>
              <ul className="nfx-tags"><li>{t("categories." + feature.category)}</li><li>{copy.items.replace("{n}", String(feature.items.length))}</li><li>{copy.perOpen.replace("{price}", fmt(feature.price))}</li></ul>
              <div className="nfx-billboard-actions">
                <button type="button" className="nfx-btn primary" onClick={() => onPick(feature)}><PackageOpen size={20} aria-hidden />{copy.view}</button>
                <button type="button" className="nfx-btn" onClick={() => pick("all")}><LayoutGrid size={20} aria-hidden />{copy.all}</button>
              </div>
            </div>
          </section>

          <Row title={copy.rowPopular} labels={arrows}>{popular.map((b, i) => <Poster key={b.id} box={b} rank={i + 1} onPick={onPick} />)}</Row>
          {CATEGORY_ROWS.map((key) => <Row key={key} title={t("categories." + key)} labels={arrows}>{byCategory(key).map((b) => <Poster key={b.id} box={b} rank={rankOf[b.id]} onPick={onPick} />)}</Row>)}
          <LiveReviewsSection count={8} />
        </>
      )}

      {grid && (
        <section className="nfx-grid-view" aria-labelledby="hero-title">
          <div className="nfx-grid-head">
            <h1 id="hero-title">{chipLabel(category)}</h1>
            <span className="nfx-grid-count" role="status">{t("design.resultsCount", { count: list.length })}</span>
            <label className="nfx-sort"><span className="sr-only">{t("grid.sort")}</span><select value={sort} onChange={(e) => onSort(e.target.value as SortKey)}>{SORTS.map((s) => <option key={s.key} value={s.key}>{t("sorts." + s.key)}</option>)}</select></label>
          </div>
          <div className="nfx-grid">{list.map((b) => <Poster key={b.id} box={b} rank={rankOf[b.id]} onPick={onPick} />)}</div>
        </section>
      )}

      <section className="nfx-info" aria-labelledby="nfx-info-title">
        <h2 id="nfx-info-title">{copy.infoTitle}</h2>
        <div className="nfx-info-grid">
          {[{ Icon: ShieldCheck, href: "/fairness" }, { Icon: PackageCheck, href: "/inventory" }, { Icon: RefreshCw, href: "/legal/policy" }].map(({ Icon, href }, i) => (
            <Link key={href} href={href} className="nfx-info-item"><Icon size={22} strokeWidth={1.6} aria-hidden /><span><strong>{copy.info[i][0]}</strong><span>{copy.info[i][1]}</span></span></Link>
          ))}
        </div>
        <div className="nfx-info-links"><Link href="/about">{copy.guide}</Link><Link href="/fairness">{copy.verify}</Link></div>
      </section>

      {/* 떠 있는 하단 탭(모바일). 이 시안에서는 메인에만 있다 */}
      <nav className="nfx-tabbar" aria-label={copy.tabbar}>
        <Link href="/" className="is-active" aria-current="page" onClick={() => clear()}><Home size={24} aria-hidden /><span>{copy.tabHome}</span></Link>
        <Link href="/inventory"><Package size={24} aria-hidden /><span>{copy.tabInventory}</span></Link>
        <Link href="/profile"><UserRound size={24} aria-hidden /><span>{copy.tabProfile}</span></Link>
      </nav>
    </div>
  );
}

export default NetflixHome;
