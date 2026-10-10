"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BOXES, SORTS, byCategory, sortBoxes, type ProductBox, type SortKey } from "@/lib/products";
import { createOpeningPurchase, InsufficientOpeningBalance, type OpeningResult } from "@/lib/opening";
import { preloadUnboxingAudio, primeUnboxingAudio } from "@/lib/audio";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { DiscoveryGuide } from "@/components/home/DiscoveryGuide";
import { NetflixHome } from "@/components/home/NetflixHome";
import { CommerceHome } from "@/components/home/CommerceHome";
import { LiveReviewsSection } from "@/components/home/LiveReviewsSection";
import { AboutBanner } from "@/components/home/AboutBanner";
import { DailyFreeBoxModal } from "@/components/home/DailyFreeBox";
import { QuickTabs, type CategoryTab } from "@/components/home/QuickTabs";
import { ProofFeed } from "@/components/home/ProofFeed";
import { BoxCard } from "@/components/box/BoxCard";
import { DetailModal } from "@/components/box/DetailModal";
import { useLocale, useTranslations } from "next-intl";
import { useCurrency } from "@/lib/useCurrency";
import { Link } from "@/i18n/navigation";
import { useWalletStore } from "@/stores/walletStore";
import { UnboxingRoulette, type UnboxResult } from "@/components/unboxing/UnboxingRoulette";
import { BulkOpenModal } from "@/components/unboxing/BulkOpenModal";
import { BULK_THRESHOLD, type AutoplayConfig } from "@/lib/autoplay";
import { DepositModal } from "@/components/wallet/DepositModal";
import { glow as glowOf } from "@/lib/tiers";
import { useUiStore } from "@/stores/uiStore";
import type { FundingRatio } from "@/lib/funding";
import { DEPOSIT_HASH } from "@/components/layout/MobileBottomNav";
import { copyFor } from "@/lib/homeCopy";

const PAGE_SIZE = 12;
/** 해시 → 카테고리 탭 (하단 내비 [👑 1달러 잭팟] = #category-dollar) */
const HASH_CATEGORY = /^#category-(all|dollar|tech|luxury|jackpot)$/;

interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: string;
}

/** Two mobile columns and three desktop columns keep covers and prices readable. */
function BoxGrid({ boxes, onPick }: { boxes: ProductBox[]; onPick: (b: ProductBox) => void }) {
  return (
    <div className="collection-grid">
      {boxes.map((box, i) => (
        <BoxCard key={box.id} box={box} edge={i % 4 === 0 ? "first" : i % 4 === 3 ? "last" : "middle"} onInspect={onPick} onOpen={onPick} />
      ))}
    </div>
  );
}

export default function BoxesPage() {
  const t = useTranslations();
  const copy = copyFor(useLocale());
  const { fmt } = useCurrency();
  /* 메인 시안 셋을 주소로 고른다: 기본은 ChatGPT 식(A), ?skin=netflix 는 넷플릭스 앱 식(B), ?skin=commerce 는 사진 중심 커머스형(C) */
  const [skin, setSkin] = useState<"gpt" | "netflix" | "commerce">("gpt");
  useEffect(() => { const s = new URLSearchParams(window.location.search).get("skin"); if (s === "netflix" || s === "commerce") setSkin(s); }, []);
  const [detail, setDetail] = useState<ProductBox | null>(null);
  useEffect(() => { if (detail) preloadUnboxingAudio(); }, [detail]);
  const [category, setCategory] = useState<CategoryTab>("all");
  const gridRef = useRef<HTMLElement>(null);
  const internalHashUpdate = useRef(false);
  const [sort, setSort] = useState<SortKey>("featured");
  const [shown, setShown] = useState(PAGE_SIZE);
  const purchasePending = useRef(false);
  const [openingPending, setOpeningPending] = useState(false);
  const [unbox, setUnbox] = useState<{ prepared?: OpeningResult[]; box: ProductBox; count: number; demo?: { itemId: string }; auto?: AutoplayConfig; funding?: FundingRatio } | null>(null);
  const [bulk, setBulk] = useState<{ prepared?: OpeningResult[]; box: ProductBox; count: number; funding?: FundingRatio } | null>(null);
  const [walletTab, setWalletTab] = useState<"usdt" | "withdraw">("usdt");
  const depositOpen = useUiStore((s) => s.depositOpen);
  const setDepositOpen = useCallback((on: boolean) => useUiStore.getState()[on ? "openDeposit" : "closeDeposit"](), []);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const credit = useWalletStore((s) => s.credit);
  const creditSplit = useWalletStore((s) => s.creditSplit);
  const addTransaction = useWalletStore((s) => s.addTransaction);
  const welcomeClaimed = useWalletStore((s) => s.welcomeClaimed);

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((ts) => [...ts, { ...toast, id }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 5200);
  }, []);

  // 탭 전환, 그리드 즉시 교체 + 스티키 탭 아래로 그리드 스크롤 + 해시 동기화(하단 내비 활성 표시)
  const pickCategory = useCallback((key: CategoryTab, scroll = true) => {
    setCategory(key);
    setShown(PAGE_SIZE);
    const next = key === "all" ? "" : `#category-${key}`;
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", next || window.location.pathname + window.location.search);
      internalHashUpdate.current = true;
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    if (scroll) gridRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, []);

  // 하단 내비 , 외부 링크: #category-x → 탭, #deposit → 충전 모달
  useEffect(() => {
    const apply = () => {
      if (internalHashUpdate.current) { internalHashUpdate.current = false; return; }
      const h = window.location.hash;
      const m = HASH_CATEGORY.exec(h);
      if (m) {
        setCategory(m[1] as CategoryTab);
        setShown(PAGE_SIZE);
        gridRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      } else if (h === "") {
        setCategory("all");
        setShown(PAGE_SIZE);
      } else if (h === DEPOSIT_HASH || h === "#withdraw") {
        setWalletTab(h === "#withdraw" ? "withdraw" : "usdt");
        useUiStore.getState().openDeposit();
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  // 이 페이지가 충전 모달 호스트, 하단 내비 [💳 충전]이 바로 연다
  useEffect(() => {
    const ui = useUiStore.getState();
    ui.setDepositHost(true);
    return () => ui.setDepositHost(false);
  }, []);

  // 오픈: 가격 × 횟수 차감 → 룰렛. 부족하면 토스트만.
  const openDepositForPurchase = useCallback((cost: number, quiet = false) => {
    // 상세 창에서 모자란 금액을 읽고 충전을 고른 경우에는 같은 말을 알림으로 한 번 더 띄우지 않는다
    if (!quiet) pushToast({ title: t("unbox.insufficient", { price: fmt(cost) }), body: t("unbox.topUp"), tone: "#E6CA65" });
    setDetail(null);
    setWalletTab("usdt");
    setDepositOpen(true);
  }, [pushToast, t, fmt, setDepositOpen]);

  const openBox = useCallback(async (box: ProductBox, count = 1) => {
    if (purchasePending.current) return;
    const cost = +(box.price * count).toFixed(2);
    if (useWalletStore.getState().balance < cost) { openDepositForPurchase(cost); return; }
    // Unlock the audio context inside the confirmation click, before the
    // asynchronous purchase and reveal presentation begin.
    const audioReady = primeUnboxingAudio();
    purchasePending.current = true;
    setOpeningPending(true);
    try {
      const prepared = await createOpeningPurchase(box, count)();
      await audioReady;
      setDetail(null);
      if (count >= BULK_THRESHOLD) setBulk({ box, count, prepared });
      else setUnbox({ box, count, prepared });
    } catch (error) {
      if (error instanceof InsufficientOpeningBalance) openDepositForPurchase(cost);
      else pushToast({ title: t("unbox.openFailed"), body: t("unbox.openFailedBody"), tone: "#E50914" });
    } finally {
      purchasePending.current = false;
      setOpeningPending(false);
    }
  }, [openDepositForPurchase, pushToast, t]);

  const onSellBack = useCallback(
    (results: UnboxResult[], amount: number, split?: { toCrypto: number; toCard: number }) => {
      // 환급금은 아이템 족보대로, 카드 출처는 카드 잔액으로만 (CLAUDE.md §7-B)
      if (split) creditSplit(split.toCrypto, split.toCard);
      else credit(amount);
      addTransaction({ type: "sellback", amountUsdt: amount, ref: results.map((r) => r.item.id).join(",") });
      pushToast({ title: t("unbox.sold", { amount: fmt(amount) }), tone: "#E6CA65" });
    },
    [credit, creditSplit, addTransaction, pushToast, t, fmt],
  );

  const onShip = useCallback(() => {
    pushToast({ title: t("inventory.shipRequestedToast"), body: t("unbox.shippingBody"), tone: "#93C5FD" });
  }, [pushToast, t]);

  const grid = useMemo(() => sortBoxes(byCategory(category), sort), [category, sort]);
  const visible = grid.slice(0, shown);

  return (
    <main className={(skin === "netflix" ? "nfx-home" : skin === "commerce" ? "shop-home" : "gpt-home") + " min-h-screen bg-canvas"}>
      <SiteHeader onWallet={(tab) => { setWalletTab(tab); setDepositOpen(true); }} onDaily={() => setDailyOpen(true)} />

      {skin === "netflix" ? <NetflixHome category={category} onCategory={(key) => pickCategory(key, false)} sort={sort} onSort={setSort} onPick={setDetail} /> : skin === "commerce" ? <CommerceHome category={category} onCategory={(key) => pickCategory(key, false)} sort={sort} onSort={setSort} onPick={setDetail} /> : <>
      {/* 첫 화면: 제목 하나, 한 줄, 분류 알약, 곧바로 박스 목록. 고르는 일이 이 화면의 결정이다. */}
      <section ref={gridRef} id="boxes" className="collection-section page-shell" aria-labelledby="hero-title">
        <div className="home-hero">
          <h1 id="hero-title">{copy.heroTitle}</h1>
          <p>{copy.heroBody}</p>
        </div>
        <div className="collection-toolbar">
          <QuickTabs value={category} onChange={(key) => pickCategory(key, false)} />
          <label className="collection-sort"><span className="sr-only">{t("grid.sort")}</span><select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>{SORTS.map((s) => <option key={s.key} value={s.key}>{t(`sorts.${s.key}`)}</option>)}</select></label>
        </div>
        <div className="collection-meta"><span className="collection-count" role="status">{t("design.resultsCount", { count: grid.length })}</span><Link href="/fairness" className="text-link">{t("design.fairnessCta")}</Link></div>
        <BoxGrid boxes={visible} onPick={setDetail} />
        {shown < grid.length && <div className="mt-10 flex justify-center"><button type="button" onClick={() => setShown((n) => n + PAGE_SIZE)} className="btn-secondary">{t("grid.loadMore", { n: grid.length - shown })}</button></div>}
      </section>

      <section className="home-assurance page-shell" aria-labelledby="assurance-title">
        <div className="guide-heading"><h2 id="assurance-title">{copy.assuranceTitle}</h2></div>
        <AboutBanner />
      </section>
      <LiveReviewsSection />
      <DiscoveryGuide />
      <section className="home-proof page-shell" aria-labelledby="proof-section-title">
        <div className="guide-heading"><div><h2 id="proof-section-title">{copy.proofTitle}</h2><p className="guide-intro">{copy.proofBody}</p></div><Link href="/fairness" className="text-link">{copy.verify}</Link></div>
        <ProofFeed limit={4} />
      </section>
      </>}

      <DetailModal pending={openingPending} onDeposit={(box, count) => openDepositForPurchase(box.price * count, true)} box={detail} onClose={() => setDetail(null)} onOpen={openBox} onAutoplay={(b, cfg) => { if (useWalletStore.getState().balance < b.price) { openDepositForPurchase(b.price); return; } const ready = primeUnboxingAudio(); setDetail(null); void ready.then(() => setUnbox({ box: b, count: 1, auto: cfg })); }} />
      <BulkOpenModal prepared={bulk?.prepared} box={bulk?.box ?? null} count={bulk?.count ?? 0} funding={bulk?.funding} onClose={() => setBulk(null)} onRetry={(b, c) => { setBulk(null); setTimeout(() => void openBox(b, c), 60); }} onSellBack={(ids, amount, split) => { if (split) creditSplit(split.toCrypto, split.toCard); else credit(amount); addTransaction({ type: "sellback", amountUsdt: amount, ref: ids.join(",") }); pushToast({ title: t("unbox.sold", { amount: fmt(amount) }), tone: "#E6CA65" }); }} />

      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        onCredited={(amount) =>
          pushToast({ title: t("deposit.creditedToast", { amount: fmt(amount) }), tone: "#E6CA65" })
        }
        initialTab={walletTab}
        onWithdrawn={(amount) => pushToast({ title: t("withdraw.requestedToast", { amount: fmt(amount) }), tone: "#E6CA65" })}
        onWithdrawBlocked={(pct) => pushToast({ title: t("withdraw.amlBlocked", { pct }), tone: "#E50914" })}
      />

      <DailyFreeBoxModal open={dailyOpen} onClose={() => setDailyOpen(false)} onCredited={(amount) => pushToast({ title: t("daily.creditedToast", { amount: fmt(amount) }), tone: "#E6CA65" })} />


      <UnboxingRoulette prepared={unbox?.prepared} onDeposit={() => { setUnbox(null); setWalletTab("usdt"); setDepositOpen(true); }} box={unbox?.box ?? null} count={unbox?.count ?? 1} funding={unbox?.funding} demo={unbox?.demo} welcomeClaimed={welcomeClaimed} auto={unbox?.auto} onClose={() => setUnbox(null)} onSellBack={onSellBack} onShip={onShip} onRespin={(b, c = unbox?.count ?? 1) => { setUnbox(null); setTimeout(() => void openBox(b, c), 60); }} />

      {/* 토스트 */}
      <div className="pointer-events-none fixed bottom-20 right-4 z-[120] flex w-80 max-w-full flex-col gap-2 md:bottom-4">
        <AnimatePresence>
          {toasts.map((x) => (
            <motion.div
              key={x.id}
              className="border-metallic-subtle pointer-events-auto rounded-lg bg-obsidian p-3 text-xs"
              style={{ boxShadow: `0 0 20px ${glowOf(x.tone, 0.2)}, 0 12px 30px rgba(0,0,0,0.6)` }}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.25 }}
            >
              <div className="font-bold" style={{ color: x.tone }}>{x.title}</div>
              {x.body && <div className="mt-1 leading-relaxed text-secondary">{x.body}</div>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}
