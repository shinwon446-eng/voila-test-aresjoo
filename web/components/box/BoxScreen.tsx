"use client";
/**
 * 박스 화면. 결정 하나: 몇 개를 열지, 그리고 열기.
 * 첫 화면에서 무엇을 받을 수 있는지(실물 사진 띠), 얼마인지(사실 4행), 어떤 확률인지(구간별 4행)를 안다.
 * 그 아래 구성품 전체: 사진 있는 상품은 타일, 없는 상품은 행. 누르면 상품 시트(사진, 정가, 확률, 받는 방법, 이 상품이 든 다른 박스).
 * 후기 절은 실제 개봉 기록에 묶인 후기만 보여 준다. 없으면 없다고 말한다(가짜 후기, 가짜 당첨 소식 없음).
 * 아래에 붙은 막대에 수량과 주 단추 하나가 있다. 막히면 그 단추가 다음 행동으로 바뀐다:
 *   로그인 전 → "로그인하고 열기" / 잔액 부족 → 한 줄 안내와 "USDT 충전하기" / 충분 → "N개 열기, 금액"
 * 구매 확정 단계는 없다. 큰 금액(50 USDT 이상이거나 10개 이상)만 확인창을 띄운다.
 */
import { useMemo, useRef, useState } from "react";
import { CreditCard, Coins, Package } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { BOXES, REFUND_RATE, ceilingValue, dropTable, formatRate, retailReturn, type ProductBox, type ProductItem } from "@/lib/products";
import { TIERS, tierOf, type TierKey } from "@/lib/tiers";
import { OPEN_PRESETS } from "@/lib/autoplay";
import { InsufficientOpeningBalance, createOpeningPurchase, type OpeningResult } from "@/lib/opening";
import { isExampleReview, relativeReviewTime } from "@/lib/community";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";
import { useAuthStore } from "@/stores/authStore";
import { useWalletStore } from "@/stores/walletStore";
import { useFlow } from "@/stores/flowStore";
import { usePublishedReviews } from "@/stores/usePublishedReviews";
import { Button, Chips, Empty, Line, Row, Rows, ScreenHead, TextLink } from "@/components/ui/kit";
import { Confirm, Sheet } from "@/components/ui/Sheet";
import { Reveal } from "@/components/box/Reveal";
import { Link } from "@/i18n/navigation";

/** 큰 금액은 되돌릴 수 없는 행동으로 보고 확인창을 띄운다 */
const CONFIRM_COST_USDT = 50;
const CONFIRM_COUNT = 10;
const TIER_LABEL: Record<TierKey, string> = { royal: "box.tierRoyal", prestige: "box.tierPrestige", executive: "box.tierExecutive", curated: "box.tierCurated" };
/** 위 구간은 큰 카드, 아래로 갈수록 작은 카드. 등급은 색이 아니라 크기와 글로 구분한다 */
const TIER_SIZE: Record<TierKey, "l" | "m" | "s"> = { royal: "l", prestige: "m", executive: "m", curated: "s" };
/** 첫 화면 사진 띠에 올리는 실물 수 */
const STRIP_MAX = 12;

export function BoxScreen({ box }: { box: ProductBox }) {
  const t = useTranslations("v");
  const locale = useLocale();
  const { boxTitle, itemName } = useProductText();
  const { fmt } = useCurrency();
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.hydrated);
  const openLogin = useAuthStore((s) => s.openAuthModal);
  const balance = useWalletStore((s) => s.balance);
  const openCharge = useFlow((s) => s.openCharge);
  const reviews = usePublishedReviews();
  const [qty, setQty] = useState<number>(1);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [opened, setOpened] = useState<{ results: OpeningResult[]; cost: number; round: number } | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  // 상태(busy)는 다음 그리기에야 바뀐다. 같은 순간에 두 번 불려도 구매가 한 번만 나가게 동기 잠금을 둔다(옛 purchasePending 과 같다).
  const opening = useRef(false);

  const cost = +(box.price * qty).toFixed(2);
  const short = balance < cost;
  const table = useMemo(() => dropTable(box), [box]);
  const groups = useMemo(() => TIERS.map((tier) => {
    const items = table.filter((i) => tierOf(i.value, box.price).key === tier.key);
    return { key: tier.key, items, rate: +items.reduce((sum, i) => sum + i.dropRate, 0).toFixed(4) };
  }).filter((g) => g.items.length > 0), [table, box.price]);
  // 첫 화면 사진 띠: 사진 있는 실물을 값이 큰 순서로
  const strip = useMemo(() => table.filter((i) => i.kind !== "cash" && i.image.src).sort((a, b) => b.value - a.value).slice(0, STRIP_MAX), [table]);
  // 실물(현금 아닌 것)이 하나라도 나올 확률의 합. 카드와 띠 머리에 그대로 적는다
  const realOdds = useMemo(() => +table.filter((i) => i.kind !== "cash" && !i.id.startsWith("wave-")).reduce((s, i) => s + i.dropRate, 0).toFixed(4), [table]);
  const [comparing, setComparing] = useState(false);
  const current = itemId ? table.find((i) => i.id === itemId) ?? null : null;
  const elsewhere = useMemo(() => (current ? BOXES.filter((b) => b.slug !== box.slug && b.items.some((i) => i.id === current.id)) : []), [current, box.slug]);
  // 이 박스의 후기: 실제 개봉 기록에 묶인 것만. 예시 후기는 보여 주지 않는다
  const boxReviews = useMemo(() => reviews.filter((r) => r.boxSlug === box.slug && !isExampleReview(r)).slice(0, 5), [reviews, box.slug]);
  // 커버가 대표 실물의 사진이면 "연출 이미지" 안내가 필요 없다
  const stockCover = !!box.image.src && !table.some((i) => i.image.src === box.image.src);

  const open = async () => {
    if (opening.current) return;
    opening.current = true;
    setBusy(true); setFailed(false); setConfirming(false);
    try {
      const results = await createOpeningPurchase(box, qty)();
      setOpened((prev) => ({ results, cost, round: (prev?.round ?? 0) + 1 }));
    } catch (error) {
      // 잔액이 모자라면 막대의 안내 한 줄이 이미 그 사실을 말한다. 그 밖의 실패만 따로 적는다.
      if (!(error instanceof InsufficientOpeningBalance)) setFailed(true);
    } finally { opening.current = false; setBusy(false); }
  };
  // 열기 단추와 결과 화면의 "한 번 더 열기"가 모두 이 함수를 거친다. 큰 금액은 어디서 눌러도 확인창이 뜬다.
  const press = () => { if (opening.current) return; if (cost >= CONFIRM_COST_USDT || qty >= CONFIRM_COUNT) setConfirming(true); else void open(); };

  return (
    <div className="v-boxlayout">
      <div className="v-boxlayout-main">
      <ScreenHead back="/" backLabel={t("common.back")} title={boxTitle(box)} desc={t("box.mostLikely", { price: fmt(box.price), amount: fmt(box.price * 0.5), pct: formatRate(table.find((i) => i.id.startsWith("wave-cashback-") && i.value === +(box.price * 0.5).toFixed(2))?.dropRate ?? 50) })} />
      {strip.length >= 3 ? (
        <div className="v-boxlayout-hero">
          <p className="v-sub">{t("box.stripNote", { pct: formatRate(realOdds) })}</p>
          <ul className="v-strip" aria-label={t("box.strip")}>
            {strip.map((item) => (
              <li key={item.id}>
                <button type="button" className="v-strip-item" onClick={() => setItemId(item.id)}>
                  <span className="v-strip-photo"><img src={item.image.src!} alt="" loading="eager" decoding="async" /></span>
                  <span className="v-strip-name">{itemName(item)}</span>
                  <span className="v-strip-value v-num">{fmt(item.value)}, {formatRate(item.dropRate)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : box.image.src && (
        <div className="v-boxlayout-hero"><div className="v-boxhero"><img src={box.image.src} alt="" /></div>{stockCover && <p className="v-small">{t("box.photoNote")}</p>}</div>
      )}
      <aside className="v-boxside">
      <Rows label={t("box.facts")}>
        <Row label={t("box.price")}>{fmt(box.price)}</Row>
        <Row label={t("box.top")}>{fmt(ceilingValue(box))}</Row>
        <Row label={t("box.low")}>{fmt(box.guaranteedMin)}</Row>
        <Row label={t("box.ev")}>{(retailReturn(box) * 100).toFixed(1)}%</Row>
      </Rows>
      <p className="v-small">{t("box.evNote", { pct: Math.round(REFUND_RATE * 100) })}</p>
      <Rows label={t("box.tiers")}>
        {groups.map((g) => <Row key={g.key} label={t(TIER_LABEL[g.key])}>{formatRate(g.rate)}</Row>)}
      </Rows>
      <div className="v-openbar">
        <div className="v-openbar-in">
          {failed && <Line fail>{t("box.openFail")}</Line>}
          {ready && user && short && <Line>{t("box.short", { balance: fmt(balance), missing: fmt(cost - balance) })}</Line>}
          <Chips scroll label={t("box.qty")} value={qty} onChange={(n) => { setQty(n); setFailed(false); }} disabled={busy} options={OPEN_PRESETS.map((n) => ({ value: n as number, label: t("box.qtyN", { n }) }))} />
          {!ready ? <Button disabled>{t("common.loading")}</Button>
            : !user ? <><Button onClick={() => openLogin("login")}>{t("box.loginToOpen")}</Button><p className="v-small">{t("box.guestNote", { n: qty, amount: fmt(cost) })}</p></>
            : short ? <Button onClick={openCharge}>{t("box.charge")}</Button>
            : <Button onClick={press} busy={busy} busyLabel={t("box.opening")}>{t("box.open", { n: qty, amount: fmt(cost) })}</Button>}
        </div>
      </div>
      </aside>

      <section className="v-boxlayout-contents v-stack v-stack--lg" aria-labelledby="box-contents">
        <h2 id="box-contents" className="v-section">{t("box.contents")}</h2>
        {groups.map((g) => (
          <div key={g.key}>
            <div className="v-tierhead"><h3 className="v-sub">{t(TIER_LABEL[g.key])}</h3><span className="v-small v-num">{t("box.tierOdds", { pct: formatRate(g.rate) })}</span></div>
            {/* 사진이 있는 상품은 타일, 없는 상품은 행. 빈 사진 칸을 늘어놓지 않는다 */}
            {g.items.some((i) => i.image.src) && (
              <ul className={"v-items v-items--" + TIER_SIZE[g.key]}>
                {g.items.filter((i) => i.image.src).map((item) => <li key={item.id}><ItemCard item={item} name={itemName(item)} value={fmt(item.value)} odds={formatRate(item.dropRate)} onOpen={() => setItemId(item.id)} /></li>)}
              </ul>
            )}
            {g.items.some((i) => !i.image.src) && (
              <ul className="v-itemrows">
                {g.items.filter((i) => !i.image.src).map((item) => (
                  <li key={item.id}>
                    <button type="button" className="v-itemrow" onClick={() => setItemId(item.id)}>
                      <span className="v-itemrow-name">{itemName(item)}</span>
                      <span className="v-itemrow-meta"><span className="v-num">{fmt(item.value)}</span><span className="v-num v-small">{formatRate(item.dropRate)}</span></span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <h2 className="v-section">{t("box.reviews")}</h2>
        {boxReviews.length === 0 ? (
          <Empty>{t("box.noReviews")}</Empty>
        ) : (
          <ul className="v-rows" aria-label={t("box.reviews")}>
            {boxReviews.map((r) => {
              const item = table.find((i) => i.id === r.itemId);
              return (
                <li key={r.id} className="v-review">
                  <div className="v-review-head"><span className="v-card-title">{item ? itemName(item) : r.itemId}</span><span className="v-small">{relativeReviewTime(r.at, Date.now(), locale)}</span></div>
                  <p className="v-body">{r.text}</p>
                  {r.photo && <span className="v-review-photo"><img src={r.photo} alt="" loading="lazy" /></span>}
                  <p className="v-small">{t("box.reviewProof")}</p>
                </li>
              );
            })}
          </ul>
        )}
        <div className="v-links"><TextLink href="/fairness">{t("nav.verify")}</TextLink></div>
      </section>
      </div>

      <Sheet open={!!current && !opened} onClose={() => { setItemId(null); setComparing(false); }} title={current ? itemName(current) : ""} closeLabel={t("common.close")}>
        {current && (
          <>
            {current.image.src && <div className="v-sheet-photo"><img src={current.image.src} alt="" /></div>}
            <Rows>
              <Row label={t("reveal.value")}>{fmt(current.value)}</Row>
              <Row label={t("reveal.odds")}>{formatRate(current.dropRate)}</Row>
              <Row label={t("box.receive")}>{current.kind === "physical" ? t("box.receivePhysical") : current.kind === "digital" ? t("box.receiveDigital") : t("box.receiveCash")}</Row>
              {current.kind !== "cash" && <Row label={t("box.takeAmount", { pct: Math.round(REFUND_RATE * 100) })}>{fmt(+(current.value * REFUND_RATE).toFixed(2))}</Row>}
            </Rows>
            {elsewhere.length > 0 && !comparing && <div className="v-links"><TextLink onClick={() => setComparing(true)}>{t("box.alsoIn", { n: elsewhere.length })}</TextLink></div>}
            {elsewhere.length > 0 && comparing && (
              <div className="v-stack v-stack--sm">
                <p className="v-small">{t("box.compareNote")}</p>
                <ul className="v-rows">
                  {[box, ...elsewhere].map((b) => {
                    const i = dropTable(b).find((x) => x.id === current.id)!;
                    const row = <><span>{boxTitle(b)}, {fmt(b.price)}</span><span className="v-num">{formatRate(i.dropRate)}</span></>;
                    return <li key={b.slug}>{b.slug === box.slug ? <span className="v-row">{row}</span> : <Link href={"/box/" + b.slug} className="v-row v-row--link">{row}</Link>}</li>;
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </Sheet>
      <Confirm open={confirming} onCancel={() => setConfirming(false)} onConfirm={open} busy={busy} busyLabel={t("box.opening")} title={t("box.confirmTitle", { amount: fmt(cost) })} desc={t("box.confirmDesc")} confirmLabel={t("box.open", { n: qty, amount: fmt(cost) })} cancelLabel={t("common.cancel")} />
      {opened && <Reveal key={opened.round} box={box} results={opened.results} cost={opened.cost} onClose={() => setOpened(null)} onAgain={press} againBusy={busy} canAgain={!short} />}
    </div>
  );
}

function ItemCard({ item, name, value, odds, onOpen }: { item: ProductItem; name: string; value: string; odds: string; onOpen: () => void }) {
  return (
    <button type="button" className="v-item" onClick={onOpen}>
      <span className="v-item-photo">{item.image.src ? <img src={item.image.src} alt="" loading="lazy" decoding="async" /> : <span className="v-item-glyph" aria-hidden>{item.kind === "cash" ? <Coins size={28} strokeWidth={1.4} /> : item.kind === "digital" ? <CreditCard size={28} strokeWidth={1.4} /> : <Package size={28} strokeWidth={1.4} />}</span>}</span>
      <span className="v-item-body">
        <span className="v-item-name">{name}</span>
        <span className="v-item-meta"><span className="v-num">{value}</span><span className="v-num">{odds}</span></span>
      </span>
    </button>
  );
}
