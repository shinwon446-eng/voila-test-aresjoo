"use client";
/**
 * 박스 화면. 결정 하나: 몇 개를 열지, 그리고 열기.
 * 첫 화면에서 무엇을 받을 수 있는지(실물 사진 띠), 얼마인지(사실 4행), 어떤 확률인지(구간별 4행)를 안다.
 * 그 아래 구성품 전체: 사진 있는 상품은 타일, 없는 상품은 행. 누르면 상품 시트(사진, 정가, 확률, 받는 방법, 이 상품이 든 다른 박스).
 * 후기 절은 실제 개봉 기록에 묶인 후기만 보여 준다. 없으면 없다고 말한다(가짜 후기, 가짜 당첨 소식 없음).
 * 아래에 붙은 막대에 수량과 주 단추 하나가 있다. 막히면 그 단추가 다음 행동으로 바뀐다:
 *   로그인 전 → "로그인하고 열기" / 잔액 부족 → 한 줄 안내와 "USDT 충전하기" / 충분 → "N개 열기, 금액"
 * 구매 확정 단계는 없다. 큰 금액(50 USDT 이상이거나 10개 이상)만 확인창을 띄운다.
 * 열기부터 결과까지의 상태는 lib/openingFlow 의 상태 기계를 따른다. 새 구매는 READY 와 SETTLED 에서만 시작한다.
 * 결과가 정해지면 보관함 기록마다 개봉의 거래 번호가 붙는다. 연출을 못 보고 떠났다 돌아오면 새로 뽑지 않고 그 기록을 다시 보여 준다(stores/openingJournal).
 */
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { CreditCard, Coins, Package } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { BOXES, REFUND_RATE, cashReturn, ceilingTimes, ceilingValue, dropTable, formatRate, faceItems, isLadderBox, mostCommon, retailReturn, type ProductBox, type ProductItem } from "@/lib/products";
import { TIERS, tierOf, type TierKey } from "@/lib/tiers";
import { COUNTRIES } from "@/lib/shipping";
import { OPEN_PRESETS } from "@/lib/autoplay";
import { InsufficientOpeningBalance, createOpeningPurchase, type OpeningResult } from "@/lib/opening";
import { canStartPurchase, nextOpeningState, receivedValue } from "@/lib/openingFlow";
import { soundPress } from "@/lib/openingSound";
import { useSettingsStore } from "@/stores/settingsStore";
import { devOpeningFault } from "@/lib/openingSettle";
import { newOpeningId, unseenOpenings, useOpeningJournal } from "@/stores/openingJournal";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";
import { useAuthStore } from "@/stores/authStore";
import { useWalletStore } from "@/stores/walletStore";
import { BURST, burstGauge, burstSeed } from "@/lib/burst";
import { BoxReviews, RatingInline, useReviewCards } from "@/components/box/BoxReviews";
import { summarizeRatings } from "@/lib/reviewSamples";
import { useFlow } from "@/stores/flowStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { Button, Chips, Empty, Line, Row, Rows, ScreenHead, TextLink } from "@/components/ui/kit";
import { Confirm, Sheet } from "@/components/ui/Sheet";
import { Reveal } from "@/components/box/Reveal";
import { Opening } from "@/components/box/Opening";
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
  const gauge = burstGauge(box.price, useWalletStore((s) => s.burst?.[box.slug]));
  const openCharge = useFlow((s) => s.openCharge);
  const owned = useInventoryStore((s) => s.items);
  const [qty, setQty] = useState<number>(1);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [opened, setOpened] = useState<{ id: string; results: OpeningResult[]; cost: number; round: number; recovered?: boolean; taken?: Record<string, number>; shipped?: Record<string, true> } | null>(null);
  const [flow, send] = useReducer(nextOpeningState, "READY");
  const journalReady = useOpeningJournal((s) => s.hydrated);
  const seen = useOpeningJournal((s) => s.seen);
  const inventoryReady = useInventoryStore((s) => s.hydrated);
  const [itemId, setItemId] = useState<string | null>(null);
  // 상태(busy)는 다음 그리기에야 바뀐다. 같은 순간에 두 번 불려도 구매가 한 번만 나가게 동기 잠금을 둔다(옛 purchasePending 과 같다).
  const opening = useRef(false);

  // 무료로 열 수 있는 횟수(가입 혜택). 열 때 먼저 쓰이고, 남는 개수만 값을 낸다
  const freeLeft = useWalletStore((s) => s.freeOpens?.[box.slug] ?? 0);
  const free = user ? Math.min(qty, freeLeft) : 0;
  const cost = +(box.price * (qty - free)).toFixed(2);
  const short = balance < cost;
  const table = useMemo(() => dropTable(box), [box]);
  const groups = useMemo(() => TIERS.map((tier) => {
    const items = table.filter((i) => tierOf(i.value, box.price).key === tier.key);
    return { key: tier.key, items, rate: +items.reduce((sum, i) => sum + i.dropRate, 0).toFixed(4) };
  }).filter((g) => g.items.length > 0), [table, box.price]);
  // 첫 화면 사진 띠: 사진 있는 실물을 값이 큰 순서로
  const strip = useMemo(() => faceItems(box, true).slice(0, STRIP_MAX), [box]);
  // 실물(현금 아닌 것)이 하나라도 나올 확률의 합. 카드와 띠 머리에 그대로 적는다
  const realOdds = useMemo(() => +table.filter((i) => i.kind !== "cash" && !i.id.startsWith("wave-")).reduce((s, i) => s + i.dropRate, 0).toFixed(4), [table]);
  // 낸 값보다 적게 받는 결과의 확률 합(상품은 USDT 로 받을 때의 금액으로 본다). 가장 흔한 결과 하나의 확률과는 다른 숫자다
  const belowOdds = useMemo(() => +table.filter((i) => receivedValue(i) < box.price).reduce((sum, i) => sum + i.dropRate, 0).toFixed(4), [table, box.price]);
  const common = useMemo(() => mostCommon(box), [box]);
  const [comparing, setComparing] = useState(false);
  const [countries, setCountries] = useState(false);
  // 나라 이름은 브라우저의 지역 이름(배송 시트와 같은 방식)
  const regionNames = useMemo(() => new Intl.DisplayNames([locale], { type: "region" }), [locale]);
  const current = itemId ? table.find((i) => i.id === itemId) ?? null : null;
  const elsewhere = useMemo(() => (current ? BOXES.filter((b) => b.slug !== box.slug && b.items.some((i) => i.id === current.id)) : []), [current, box.slug]);
  // 이 박스의 후기: 실제 개봉 기록에 묶인 것만. 예시 후기는 보여 주지 않는다
  const reviewCards = useReviewCards(box.slug);
  const rating = useMemo(() => summarizeRatings(reviewCards.map((c) => c.rating)), [reviewCards]);
  // 커버가 대표 실물의 사진이면 "연출 이미지" 안내가 필요 없다

  useEffect(() => { void useOpeningJournal.persist.rehydrate(); }, []);
  // 이 계정의 보관함에는 있는데 아직 못 본 개봉(연출 중에 새로 고쳤거나 떠난 경우). 이 박스의 것과 다른 박스의 것을 나눠 안내한다.
  const pendingOpenings = useMemo(() => (journalReady && inventoryReady && user && !opened ? unseenOpenings(owned, seen, Date.now()) : []), [journalReady, inventoryReady, user, opened, owned, seen]);
  const unseen = pendingOpenings.find((o) => o.boxSlug === box.slug) ?? null;
  const unseenElsewhere = unseen ? null : pendingOpenings[0] ?? null;
  // 못 본 결과가 생기면 복구 상태로, 사라지면(계정을 바꿨거나 다른 탭에서 봤으면) 다시 열 수 있는 상태로
  useEffect(() => { send(unseen ? "FOUND_COMMITTED" : "RESET_RECOVERY"); }, [unseen]);
  /** 새로 뽑지 않는다. 보관함 기록에 적힌 그때의 값과 상태로 결과를 다시 만든다. */
  const recover = () => {
    if (!unseen) return;
    const taken: Record<string, number> = {}; const shipped: Record<string, true> = {};
    const results = unseen.items.flatMap((o): OpeningResult[] => {
      const item = table.find((i) => i.id === o.itemId);
      if (!item) return [];
      if (item.kind !== "cash" && o.status === "SOLD" && typeof o.soldForUsdt === "number") taken[o.id] = o.soldForUsdt;
      if (o.status === "SHIPPING_REQUESTED" || o.status === "SHIPPING" || o.status === "DELIVERED") shipped[o.id] = true;
      // 값은 지금 카탈로그가 아니라 그때 보관함에 적힌 값이다
      return [{ ownedId: o.id, settled: item.kind === "cash", item: { ...item, value: o.valueUsdt }, tier: tierOf(o.valueUsdt, box.price), roll: o.fair.roll, hmac: "", nonce: o.fair.nonce, serverSeed: o.fair.serverSeed, serverSeedHash: o.fair.serverSeedHash, clientSeed: o.fair.clientSeed }];
    });
    if (!results.length) { useOpeningJournal.getState().markSeen(unseen.id); return; }
    send("RECOVER");
    // 그때 실제로 낸 값: 거래 기록에서 찾는다(무료로 연 것은 0 이다). 기록이 없으면 박스 가격으로 본다
    const paid = useWalletStore.getState().transactions.find((tx) => tx.type === "open" && typeof tx.ref === "string" && tx.ref.endsWith(":" + unseen.id));
    setOpened((prev) => ({ id: unseen.id, results, cost: paid ? Math.abs(paid.amountUsdt) : +(box.price * results.length).toFixed(2), round: (prev?.round ?? 0) + 1, recovered: true, taken, shipped }));
  };

  const open = async (confirmed = false) => {
    // 상태 기계가 허락할 때만 구매를 시작한다(연출 중이거나 처리 중이면 아무 일도 일어나지 않는다). 동기 잠금은 같은 순간의 두 번 누름을 막는다.
    if (opening.current || !user || !(confirmed ? flow === "CONFIRMING" : canStartPurchase(flow))) return;
    opening.current = true;
    setBusy(true); setFailed(false); setConfirming(false);
    send(confirmed ? "CONFIRM" : "PRESS");
    // 거래 번호는 구매 전에 정한다. 구매 모듈이 보관함 기록마다 이 번호를 붙여 한 번에 쓴다.
    const id = newOpeningId();
    try {
      if (devOpeningFault() === "purchase-failed") throw new Error("dev fault: purchase-failed");
      const results = await createOpeningPurchase(box, qty, id)();
      send("PURCHASE_OK"); send("ANIMATION_START");
      setOpened((prev) => ({ id, results, cost, round: (prev?.round ?? 0) + 1 }));
    } catch (error) {
      // 잔액이 모자라면 막대의 안내 한 줄이 이미 그 사실을 말한다. 그 밖의 실패만 따로 적는다. 실패하면 차감도 배정도 없다(lib/opening 이 통째로 되돌린다).
      if (error instanceof InsufficientOpeningBalance) { send("SHORT"); send("RESET"); }
      else { send("PURCHASE_ERROR"); send("RETRY"); setFailed(true); }
    } finally { opening.current = false; setBusy(false); }
  };
  // 열기 단추와 결과 화면의 "한 번 더 열기"가 모두 이 함수를 거친다. 큰 금액은 어디서 눌러도 확인창이 뜬다.
  const press = () => {
    if (opening.current || !canStartPurchase(flow)) return;
    // 소리를 켠 사람의 첫 소리는 이 손짓에서 시작해야 브라우저가 막지 않는다
    soundPress(useSettingsStore.getState().openSound);
    if (cost >= CONFIRM_COST_USDT || qty >= CONFIRM_COUNT) { send("NEEDS_CONFIRM"); setConfirming(true); } else void open();
  };
  const cancelConfirm = () => { send("CANCEL"); setConfirming(false); };
  /** 결과가 화면에 보였다: 기록장에 "봤음"을 남긴다. USDT 결과는 구매와 함께 잔액에, 상품은 보관함에 이미 들어가 있으므로 여기서 끝난 상태가 된다. */
  const revealed = () => { if (!opened) return; useOpeningJournal.getState().markSeen(opened.id); send("ANIMATION_END"); send("SETTLE_START"); send("SETTLE_OK"); };
  /** 닫기. 다음 구매를 처리하는 동안에는 닫지 않는다(닫은 뒤에 새 결과가 혼자 뜨지 않게). 아직 못 본 결과를 닫으면 "봤음"으로 적지 않는다. */
  const closeOpening = () => { if (opening.current) return; setOpened(null); send("RESET"); };

  return (
    <div className="v-boxlayout">
      <div className="v-boxlayout-main">
      <ScreenHead back="/" backLabel={t("common.back")} title={boxTitle(box)} desc={t("box.lead", { price: fmt(box.price), top: fmt(ceilingValue(box)) })} />
      {rating.avg !== null && <button type="button" className="v-ratinglink" onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" })}><RatingInline summary={rating} long /></button>}
      {/* 맨 위에는 가장 값진 실물 하나만 크게(2026-10-12 파운더). 누르면 아래의 구성품으로 내려간다 */}
      {strip.length > 0 ? (
        <div className="v-boxlayout-hero">
          <button type="button" className="v-mainitem" onClick={() => document.getElementById("box-contents")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
            <span className="v-mainitem-photo"><img src={strip[0].image.src!} alt="" loading="eager" decoding="async" /></span>
            <span className="v-mainitem-body"><span className="v-mainitem-name">{itemName(strip[0])}</span><span className="v-num">{fmt(strip[0].value)}</span></span>
          </button>
        </div>
      ) : box.image.src && (
        <div className="v-boxlayout-hero"><div className="v-boxhero"><img src={box.image.src} alt="" /></div></div>
      )}
      <BoxReviews box={box} cards={reviewCards} />
      <aside className="v-boxside">
      {/* 열기 옆에는 고르는 데 쓰는 세 줄만 둔다(2026-10-11 파운더: 오른쪽이 읽히지 않는다). 나머지 숫자는 화면 아래의 확률 요약에 있다 */}
      <Rows label={t("box.facts")}>
        <Row label={t("box.price")}>{fmt(box.price)}</Row>
        <Row label={t("box.topTimes")}>{t("op.timesShort", { n: ceilingTimes(box).toLocaleString("en-US") })}</Row>
        {isLadderBox(box) && <Row label={t("box.burst")}>{fmt(gauge)}</Row>}
      </Rows>
      <div className="v-openbar">
        <div className="v-openbar-in">
          {failed && <Line fail>{t("box.openFail")}</Line>}
          {unseen && <Line>{t("op.recoverLine")}</Line>}
          {unseenElsewhere && <p className="v-line"><Link href={"/box/" + unseenElsewhere.boxSlug} className="v-link">{t("op.recoverElsewhere")}</Link></p>}
          {ready && user && freeLeft > 0 && <Line>{t("box.freeLeft", { n: freeLeft })}</Line>}
          {ready && user && short && <Line>{t("box.short", { balance: fmt(balance), missing: fmt(cost - balance) })}</Line>}
          <Chips scroll label={t("box.qty")} value={qty} onChange={(n) => { setQty(n); setFailed(false); }} disabled={busy} options={OPEN_PRESETS.map((n) => ({ value: n as number, label: t("box.qtyN", { n }) }))} />
          {!ready ? <Button disabled>{t("common.loading")}</Button>
            : !user ? <><Button onClick={() => openLogin("login")}>{t("box.loginToOpen")}</Button><p className="v-small">{t("box.guestNote", { n: qty, amount: fmt(cost) })}</p></>
            : unseen ? <Button data-open-recover onClick={recover}>{t("op.recoverCta")}</Button>
            : short ? <Button onClick={openCharge}>{t("box.charge")}</Button>
            : <Button data-open-primary onClick={press} busy={busy} busyLabel={t("box.opening")}>{cost === 0 ? t("box.openFree", { n: qty }) : t("box.open", { n: qty, amount: fmt(cost) })}</Button>}
        </div>
      </div>
      </aside>

      <section className="v-boxlayout-contents v-stack v-stack--lg" aria-labelledby="box-contents">
        <h2 id="box-contents" className="v-section">{t("box.contents")}</h2>
        {groups.map((g) => (
          <div key={g.key}>
            <div className="v-tierhead"><h3 className="v-sub">{t(TIER_LABEL[g.key])}</h3></div>
            {/* 사진이 있는 상품은 타일, 없는 상품은 행. 빈 사진 칸을 늘어놓지 않는다 */}
            {g.items.some((i) => i.image.src) && (
              <ul className={"v-items v-items--" + TIER_SIZE[g.key]}>
                {g.items.filter((i) => i.image.src).map((item) => <li key={item.id}><ItemCard item={item} name={itemName(item)} value={fmt(item.value)} onOpen={() => setItemId(item.id)} /></li>)}
              </ul>
            )}
            {g.items.some((i) => !i.image.src) && (
              <ul className="v-itemrows">
                {g.items.filter((i) => !i.image.src).map((item) => (
                  <li key={item.id}>
                    <button type="button" className="v-itemrow" onClick={() => setItemId(item.id)}>
                      <span className="v-itemrow-name">{itemName(item)}</span>
                      <span className="v-itemrow-meta"><span className="v-num">{fmt(item.value)}</span></span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

      </section>
      {/* 확률은 여기 한곳에 모은다(2026-10-12 파운더: 구성품의 사진과 이름 옆에는 확률을 적지 않는다).
          요약, 구간별 확률, 접어 둔 상품별 확률표. 상품을 누르면 뜨는 창에도 그 상품의 확률이 있다 */}
      <section className="v-boxlayout-odds v-stack" aria-labelledby="box-odds">
        <h2 id="box-odds" className="v-section">{t("box.oddsSummary")}</h2>
        <Rows label={t("box.oddsSummary")}>
          <Row label={t("box.top")}>{fmt(ceilingValue(box))}</Row>
          <Row label={t("box.commonRow")}>{fmt(common.value)}, {formatRate(common.dropRate)}</Row>
          <Row label={t("box.realRow")}>{formatRate(realOdds)}</Row>
          <Row label={t("box.low")}>{fmt(box.guaranteedMin)}</Row>
          <Row label={t("box.belowOdds")}>{formatRate(belowOdds)}</Row>
          {isLadderBox(box)
            ? <Row label={t("box.ev")}>{(cashReturn(box) * 100).toFixed(1)}%, {t("box.evBasis")}</Row>
            : <><Row label={t("box.evRetail")}>{(retailReturn(box) * 100).toFixed(1)}%</Row><Row label={t("box.evCash")}>{(cashReturn(box) * 100).toFixed(1)}%</Row></>}
        </Rows>
        <Rows label={t("box.oddsTiers")}>
          {groups.map((g) => <Row key={g.key} label={t(TIER_LABEL[g.key])}>{formatRate(g.rate)}</Row>)}
        </Rows>
        <details className="v-notes">
          <summary>{t("box.oddsTable")}</summary>
          <ul className="v-itemrows">
            {table.map((item) => (
              <li key={item.id}>
                <button type="button" className="v-itemrow" onClick={() => setItemId(item.id)}>
                  <span className="v-itemrow-name">{itemName(item)}</span>
                  <span className="v-itemrow-meta"><span className="v-num">{fmt(item.value)}</span><span className="v-num v-small">{formatRate(item.dropRate)}</span></span>
                </button>
              </li>
            ))}
          </ul>
        </details>
      </section>
      <details className="v-boxlayout-notes v-notes">
        <summary>{t("box.notes")}</summary>
        {isLadderBox(box) && <p className="v-small">{t("box.burstNote", { pct: Math.round(BURST.share * 100), odds: formatRate(BURST.slots / 10_000), seed: fmt(burstSeed(box.price)) })}</p>}
        <p className="v-small">{t("box.evNote", { pct: Math.round(REFUND_RATE * 100) })}</p>
        <div className="v-links"><TextLink href="/verify">{t("box.verifyLink")}</TextLink></div>
      </details>
      </div>

      <Sheet open={!!current && !opened} onClose={() => { setItemId(null); setComparing(false); setCountries(false); }} title={current ? itemName(current) : ""} closeLabel={t("common.close")}>
        {current && (
          <>
            {current.image.src && <div className="v-sheet-photo"><img src={current.image.src} alt="" /></div>}
            {current.image.src && current.image.generated && <p className="v-small">{t("box.genNote")}</p>}
            <Rows>
              <Row label={t("reveal.value")}>{fmt(current.value)}</Row>
              <Row label={t("reveal.odds")}>{formatRate(current.dropRate)}</Row>
              <Row label={t("box.receive")}>{current.kind === "physical" ? t("box.receivePhysical") : current.kind === "digital" ? t("box.receiveDigital") : t("box.receiveCash")}</Row>
              {current.kind !== "cash" && <Row label={t("box.takeAmount", { pct: Math.round(REFUND_RATE * 100) })}>{fmt(+(current.value * REFUND_RATE).toFixed(2))}</Row>}
              {current.kind !== "cash" && <Row label={t("box.priceBasis")}>{t("box.priceBasisV")}</Row>}
              {current.kind === "physical" && <Row label={t("box.shipFee")}>{t("box.shipFeeV", { n: COUNTRIES.length })}</Row>}
            </Rows>
            {current.kind === "physical" && (
              <>
                <div className="v-links"><TextLink onClick={() => setCountries((v) => !v)}>{t(countries ? "box.countriesHide" : "box.countriesLink")}</TextLink></div>
                {countries && <p className="v-small">{COUNTRIES.map((c) => regionNames.of(c) ?? c).join(", ")}</p>}
              </>
            )}
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
      <Confirm open={confirming} onCancel={cancelConfirm} onConfirm={() => void open(true)} busy={busy} busyLabel={t("box.opening")} title={t("box.confirmTitle", { amount: fmt(cost) })} desc={t("box.confirmDesc")} confirmLabel={t("box.open", { n: qty, amount: fmt(cost) })} cancelLabel={t("common.cancel")} />
      {opened && user && opened.results.length === 1 && <Opening key={opened.round} box={box} result={opened.results[0]} cost={opened.cost} nextCost={cost} accountId={user.id} recovered={opened.recovered} initialTaken={opened.taken?.[opened.results[0].ownedId]} initialShipped={!!opened.shipped?.[opened.results[0].ownedId]} onClose={closeOpening} onAgain={press} againBusy={busy} canAgain={!short} onRevealed={revealed} onFlow={send} />}
      {opened && opened.results.length > 1 && <Reveal key={opened.round} box={box} results={opened.results} cost={opened.cost} nextCost={cost} recovered={opened.recovered} initialTaken={opened.taken} initialShipped={opened.shipped} onClose={closeOpening} onAgain={press} againBusy={busy} canAgain={!short} onRevealed={revealed} onSkip={() => send("SKIP")} />}
    </div>
  );
}

function ItemCard({ item, name, value, onOpen }: { item: ProductItem; name: string; value: string; onOpen: () => void }) {
  return (
    <button type="button" className="v-item" onClick={onOpen}>
      <span className="v-item-photo">{item.image.src ? <img src={item.image.src} alt="" loading="lazy" decoding="async" /> : <span className="v-item-glyph" aria-hidden>{item.kind === "cash" ? <Coins size={28} strokeWidth={1.4} /> : item.kind === "digital" ? <CreditCard size={28} strokeWidth={1.4} /> : <Package size={28} strokeWidth={1.4} />}</span>}</span>
      <span className="v-item-body">
        <span className="v-item-name">{name}</span>
        <span className="v-item-meta"><span className="v-num">{value}</span></span>
      </span>
    </button>
  );
}
