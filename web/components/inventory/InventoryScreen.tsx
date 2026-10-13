"use client";
/**
 * 보관함. 결정 하나: 어느 상품을 받을지. USDT로 받기가 먼저다(flow/MELT_SPEC.md S5).
 *   보관 중 목록 위의 주 단추 "USDT로 받기"는 선택 시트를 연다(보관 중인 상품 전부에서 골라 한 번에).
 *   상품을 누르면 그 상품의 시트: 주 단추 "USDT로 받기 (금액)", 밑줄 링크 "배송 받기"와 "개봉 결과 검증".
 *   배송을 신청하는 길은 이 시트 하나다. 후기 쓰기는 조건이 될 때 정보 카드의 마지막 행으로 둔다(주 단추 위, 링크 자리를 쓰지 않는다. R5).
 *   보관 중인 상품은 업그레이드에 걸 수도 있다(flow/MELT_SPEC.md U7): 주 단추 아래의 조용한 단추. 걸어서 사라진 상품은 받은 것 탭에 기록으로 남는다.
 * 통계 칸, 검색, 정렬 셀렉트, 여러 탭은 없다. 상태 셋(보관 중, 배송, 받은 것)만 알약으로 고른다.
 * 실패와 막힘은 팝업이나 토스트가 아니라 그 자리의 한 줄로 쓴다.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BOX_BY_SLUG } from "@/lib/products";
import { productOf, processedAt, vaultTab, type VaultTab } from "@/lib/vault";
import { trackingUrl } from "@/lib/carriers";
import { cancelShipment } from "@/lib/claim";
import { settleTake } from "@/lib/openingSettle";
import { heldForTake, takeAmountOf, takeStateOf } from "@/lib/takeBatch";
import type { UpgradeRecord } from "@/lib/upgrade";
import { canStake, upgradeDoubtIds } from "@/lib/upgradeSettle";
import { api } from "@/lib/api";
import { isLive } from "@/lib/runtime";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";
import { useAuthStore } from "@/stores/authStore";
import { useInventoryStore, type OwnedItem } from "@/stores/inventoryStore";
import { Button, ButtonLink, Chips, Empty, Line, Row, Rows, ScreenHead, Skeleton, TextLink } from "@/components/ui/kit";
import { Confirm, Sheet } from "@/components/ui/Sheet";
import { ShipSheet } from "@/components/flow/ShipSheet";
import { VerifySheet, type VerifyRecord } from "@/components/flow/VerifySheet";
import { ReviewSheet } from "@/components/flow/ReviewSheet";
import { TakeConfirm, TakeSheet, useTakeLedger } from "@/components/flow/TakeSheet";
import { UpgradeSheet, UpgradeVerifySheet } from "@/components/flow/UpgradeSheet";
import { canReview } from "@/lib/community";
import { useCommunityStore } from "@/stores/communityStore";

const PAGE = 30;

export function InventoryScreen() {
  const t = useTranslations("v");
  const locale = useLocale();
  const { fmt } = useCurrency();
  const { itemName, boxTitle } = useProductText();
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.hydrated);
  const openLogin = useAuthStore((s) => s.openAuthModal);
  const items = useInventoryStore((s) => s.items);
  const hydrated = useInventoryStore((s) => s.hydrated);
  const [tab, setTab] = useState<VaultTab>("held");
  const [shown, setShown] = useState(PAGE);
  const [openId, setOpenId] = useState<string | null>(null);
  const [shipIds, setShipIds] = useState<string[] | null>(null);
  const [taking, setTaking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cancelFailed, setCancelFailed] = useState(false);
  // 상품 하나를 받지 못했을 때 그 상세 안에 적는 한 줄: 받지 못했다(보관 중), 또는 처리 상태를 확인하지 못했다
  const [takeNote, setTakeNote] = useState<"failed" | "unknown" | null>(null);
  const [batch, setBatch] = useState(false);
  const [verifying, setVerifying] = useState<VerifyRecord | null>(null);
  const [reviewing, setReviewing] = useState(false);
  // 업그레이드 시트에 걸 상품, 그리고 업그레이드 결과 검증에 넘길 기록
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [upgradeRecord, setUpgradeRecord] = useState<UpgradeRecord | null>(null);
  // 업그레이드 시트가 닫힌 뒤 초점을 돌려보낼 보관 상품. 상세 시트를 먼저 닫고 업그레이드 시트를 열어, 누른 단추가 사라져 있다
  const upgradeReturn = useRef<string | null>(null);
  useEffect(() => {
    if (upgrading !== null || !upgradeReturn.current) return;
    const id = upgradeReturn.current; upgradeReturn.current = null;
    // 시트의 정리(초점 돌려주기)가 끝난 다음 그리기에서 옮긴다. 그 상품의 행이 이 탭에 없으면(걸어서 사라졌다) 고른 탭의 알약으로
    const frame = requestAnimationFrame(() => {
      const row = document.querySelector<HTMLElement>(`.v-itemrow[data-owned-id="${CSS.escape(id)}"]`);
      (row ?? document.querySelector<HTMLElement>('.v-chips [aria-pressed="true"]'))?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [upgrading]);
  const myReviews = useCommunityStore((s) => s.mine);

  // 출고된 상품의 운송장은 계정 서비스가 발급한 것만 들어온다(옛 화면과 같은 주기)
  useEffect(() => {
    if (!isLive()) return;
    const tick = () => useInventoryStore.getState().items.filter((o) => o.status === "SHIPPING_REQUESTED").forEach((o) => {
      api.shipping(o.id).then((s) => useInventoryStore.getState().markShipping(o.id, s.carrier, s.trackingNumber)).catch(() => {});
    });
    tick();
    const timer = setInterval(tick, 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => { setShown(PAGE); }, [tab]);
  // 이 화면이 사라진 뒤에 온 받기 응답은 버린다(돈과 기록은 lib/takeBatch 가 따로 지킨다)
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const date = (value?: string) => (value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(new Date(value)) : "");
  const counts = useMemo(() => items.reduce((acc, item) => { acc[vaultTab(item)]++; return acc; }, { held: 0, shipping: 0, done: 0 }), [items]);
  const list = useMemo(() => items.filter((item) => vaultTab(item) === tab).sort((a, b) => (Date.parse(processedAt(b) ?? "") || 0) - (Date.parse(processedAt(a) ?? "") || 0)), [items, tab]);
  const current = items.find((item) => item.id === openId) ?? null;
  const product = current ? productOf(current) : undefined;
  const nameOf = (item: OwnedItem) => { const p = productOf(item); return p ? itemName(p) : item.itemId; };
  const takeAmount = current ? takeAmountOf(current) : 0;
  // 받기가 확정됐는지는 받는 일과 같은 기준으로 본다(lib/takeBatch 의 takeStateOf).
  // 확인되지 않은 상품(받은 상태인데 입금 내역이 없다, 보관 중인데 입금 내역이 있다, 확인 대기 표시가 남았다)은 받았다고도 보관 중이라고도 적지 않는다
  const ledger = useTakeLedger();
  const stateOf = (item: OwnedItem) => takeStateOf(item, ledger);
  const takeable = useMemo(() => heldForTake(items, ledger).length, [items, ledger]);
  const currentState = current ? stateOf(current) : null;
  // 확인 필요의 까닭이 업그레이드인 상품(업그레이드의 확인 대기 표시가 남았다). 돈이 움직인 일이 아니라 지갑 내역으로 보내지 않는다
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const upgradeDoubt = useMemo(() => upgradeDoubtIds(), [items, ledger]);
  const statusOf = (item: OwnedItem) => stateOf(item) === "unconfirmed" ? t("take.unconfirmed") : item.status === "IN_STORAGE" ? t("inv.stHeld") : item.status === "SHIPPING_REQUESTED" ? t("inv.stRequested") : item.status === "SHIPPING" ? t("inv.stShipping") : item.status === "DELIVERED" ? t("inv.stDelivered") : item.status === "UPGRADED" ? t("upgrade.usedTag") : t("inv.stTaken");
  // 이 상품이 얽힌 업그레이드의 기록: 걸어서 사라진 상품은 제 기록, 업그레이드로 들어온 상품은 건 상품에 붙은 기록
  const upgradeOf = (item: OwnedItem): UpgradeRecord | null => item.upgrade ?? (item.upgradedFrom ? items.find((o) => o.upgrade?.id === item.upgradedFrom?.id)?.upgrade ?? null : null);

  const closeItem = () => { setOpenId(null); setCancelFailed(false); setTakeNote(null); };
  // 상품 하나를 USDT로 받는다. 묶음 받기와 같은 코드를 거친다(lib/openingSettle → lib/takeBatch: 같은 잠금, 같은 판정)
  const take = async () => {
    if (!current || busy) return;
    setBusy(true); setTakeNote(null);
    const out = await settleTake(current.id);
    if (!alive.current) return;
    setBusy(false); setTaking(false);
    if (out.status === "settled") { closeItem(); setTab("done"); } else setTakeNote(out.status === "failed" ? "failed" : "unknown");
  };
  const cancel = async () => {
    if (!current || busy) return;
    setBusy(true); setCancelFailed(false);
    try { await cancelShipment(current); setCancelling(false); closeItem(); setTab("held"); }
    catch { setCancelling(false); setCancelFailed(true); }
    finally { setBusy(false); }
  };
  const verify = (item: OwnedItem) => setVerifying({ itemId: item.itemId, fair: item.fair });

  const sheetOpen = !!current && !shipIds && !taking && !cancelling && !verifying && !reviewing && !upgradeRecord;
  // 후기는 실제 개봉 기록에만. 하나에 하나
  const reviewable = !!current && canReview(current, myReviews);
  const reviewed = !!current && myReviews.some((r) => r.ownedId === current.id);

  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead title={t("inv.title")} desc={t("inv.desc")} />
      {!ready || !hydrated ? <Skeleton height={240} label={t("common.loading")} />
        : !user ? <div className="v-stack"><Line>{t("inv.loginLine")}</Line><Button onClick={() => openLogin("login")}>{t("nav.login")}</Button></div>
        : (
          <>
            <Chips label={t("inv.filter")} value={tab} onChange={setTab} options={(["held", "shipping", "done"] as const).map((key) => ({ value: key, label: t("inv.tab." + key, { n: counts[key] }) }))} />
            {/* 받을 수 있는 보관 상품이 있을 때만: 골라서 한 번에 USDT로 받는다 */}
            {tab === "held" && takeable > 0 && <Button data-take-batch aria-haspopup="dialog" onClick={() => setBatch(true)}>{t("take.title")}</Button>}
            {list.length === 0 ? (
              <div className="v-stack"><Empty>{t("inv.empty." + tab)}</Empty>{tab === "held" && <ButtonLink href="/">{t("inv.toBoxes")}</ButtonLink>}</div>
            ) : (
              <ul className="v-itemrows">
                {list.slice(0, shown).map((item) => {
                  const p = productOf(item);
                  return (
                    <li key={item.id}>
                      <button type="button" className="v-itemrow" data-owned-id={item.id} aria-haspopup="dialog" onClick={() => setOpenId(item.id)}>
                        {p?.image.src && <span className="v-itemrow-photo"><img src={p.image.src} alt="" loading="lazy" decoding="async" /></span>}
                        <span className="v-itemrow-body"><span className="v-card-title">{nameOf(item)}</span><span className="v-small">{stateOf(item) === "held" ? t("inv.refLine", { amount: fmt(item.valueUsdt) }) : stateOf(item) === "unconfirmed" ? statusOf(item) + ", " + t("inv.refLine", { amount: fmt(item.valueUsdt) }) : statusOf(item) + (date(processedAt(item)) ? ", " + date(processedAt(item)) : "")}</span></span>
                        <span className="v-num">{stateOf(item) === "unconfirmed" ? "" : fmt(stateOf(item) === "held" ? takeAmountOf(item) : stateOf(item) === "taken" ? item.soldForUsdt ?? 0 : item.valueUsdt)}<span aria-hidden> ›</span></span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {list.length > shown && <div className="v-links"><TextLink onClick={() => setShown((n) => n + PAGE)}>{t("inv.more", { n: list.length - shown })}</TextLink></div>}
          </>
        )}

      <Sheet open={sheetOpen} onClose={closeItem} title={current ? nameOf(current) : ""} desc={current?.upgradedFrom ? t("upgrade.from") : current && BOX_BY_SLUG[current.boxSlug] ? boxTitle(BOX_BY_SLUG[current.boxSlug]) : undefined} closeLabel={t("common.close")}>
        {current && (
          <>
            <Rows>
              <Row label={t("inv.status")}>{statusOf(current)}</Row>
              <Row label={t("reveal.value")}>{fmt(current.valueUsdt)}</Row>
              <Row label={t("inv.acquired")}>{date(current.acquiredAt)}</Row>
              {current.status === "IN_STORAGE" && current.autoCashbackAt && <Row label={t("inv.keepUntil")}>{date(current.autoCashbackAt)}</Row>}
              {currentState === "taken" && <Row label={t("inv.takenAmount")}>{fmt(current.soldForUsdt ?? 0)}</Row>}
              {current.upgrade && currentState !== "unconfirmed" && <Row label={t("upgrade.result")}>{t(current.upgrade.won ? "upgrade.resultWon" : "upgrade.resultLost")}</Row>}
              {current.shipping?.requestedAt && current.status !== "IN_STORAGE" && <Row label={t("inv.requestedAt")}>{date(current.shipping.requestedAt)}</Row>}
              {current.shipping?.carrier && <Row label={t("inv.carrier")}>{current.shipping.carrier}</Row>}
              {current.shipping?.trackingNumber && <Row label={t("inv.tracking")}>{current.shipping.trackingNumber}</Row>}
              {/* 후기: 정보 카드의 마지막 행. 자격은 그대로(lib/community 의 canReview). 쓴 뒤에는 같은 행이 올렸다고 말한다 */}
              {(reviewable || reviewed) && (
                <div className="v-row">
                  <dt>{t("review.text")}</dt>
                  <dd>{reviewable ? <button type="button" className="v-rowlink" aria-haspopup="dialog" onClick={() => setReviewing(true)}><span>{t("inv.writeReview")}</span><span aria-hidden>›</span></button> : t("inv.reviewed")}</dd>
                </div>
              )}
            </Rows>
            {current.status === "SHIPPING_REQUESTED" && <Line>{t("inv.waitingTracking")}</Line>}
            {cancelFailed && <Line fail>{t("inv.cancelFailed")}</Line>}
            {/* 확인되지 않은 상품: 상세를 닫았다 다시 열어도 이 한 줄이 남는다. 받기 단추와 배송 링크는 주지 않는다(다시 지급하지 않는다) */}
            {(currentState === "unconfirmed" || takeNote === "unknown") && <Line fail>{t(upgradeDoubt.has(current.id) ? "upgrade.doubt" : "take.unknown")}</Line>}
            {takeNote === "failed" && currentState === "held" && <Line fail>{t("take.failed")}</Line>}
            {/* 보관 중: 주 단추는 USDT로 받기. 배송은 밑줄 링크이고, 배송을 신청하는 길은 여기 하나다 */}
            {currentState === "held" && takeNote !== "unknown" && <Button data-take-primary onClick={() => setTaking(true)}>{t("reveal.take", { amount: fmt(takeAmount) })}</Button>}
            {/* 업그레이드: 받을 수 있는 상품만 걸 수 있다. 시트를 닫고 업그레이드 시트로 넘어간다(끝나면 목록으로 돌아온다) */}
            {currentState === "held" && takeNote !== "unknown" && canStake(current, ledger) && <Button quiet data-upgrade-open aria-haspopup="dialog" onClick={() => { upgradeReturn.current = current.id; setUpgrading(current.id); closeItem(); }}>{t("upgrade.title")}</Button>}
            {current.status === "SHIPPING_REQUESTED" && <Button onClick={() => setCancelling(true)}>{t("inv.cancelShip")}</Button>}
            {current.status === "SHIPPING" && current.shipping?.carrier && current.shipping.trackingNumber && <a className="v-btn" href={trackingUrl(current.shipping.carrier, current.shipping.trackingNumber)} target="_blank" rel="noreferrer">{t("inv.track")} ↗</a>}
            <div className="v-links">
              {currentState === "held" && takeNote !== "unknown" && product?.kind === "physical" && <TextLink onClick={() => setShipIds([current.id])}>{t("reveal.ship")}</TextLink>}
              {(currentState === "unconfirmed" || takeNote === "unknown") && !upgradeDoubt.has(current.id) && <TextLink href="/wallet">{t("balanceSheet.history")}</TextLink>}
              {/* 업그레이드로 들어온 상품에는 개봉 기록이 없다. 그 추첨을 검증한다. 걸어서 사라진 상품은 개봉과 업그레이드 둘 다 */}
              {!current.upgradedFrom && <TextLink onClick={() => verify(current)}>{t("nav.verify")}</TextLink>}
              {upgradeOf(current) && currentState !== "unconfirmed" && <TextLink onClick={() => setUpgradeRecord(upgradeOf(current))}>{t("upgrade.verifyTitle")}</TextLink>}
            </div>
          </>
        )}
      </Sheet>

      <ShipSheet ownedIds={shipIds} onClose={() => setShipIds(null)} onDone={() => { setShipIds(null); closeItem(); setTab("shipping"); }} />
      <VerifySheet record={verifying} onClose={() => setVerifying(null)} />
      <UpgradeVerifySheet record={upgradeRecord} onClose={() => setUpgradeRecord(null)} />
      <UpgradeSheet stakeId={upgrading} onClose={(landing) => { if (landing) upgradeReturn.current = landing; setUpgrading(null); }} />
      <ReviewSheet item={reviewing ? current : null} itemName={current ? nameOf(current) : ""} onClose={() => setReviewing(false)} onDone={() => setReviewing(false)} />
      {/* 보관 중인 상품 전부에서 골라 한 번에 받는다. 받은 뒤에도 보관 중 목록에 그대로 있다 */}
      <TakeSheet open={batch} onClose={() => setBatch(false)} />
      {/* 상품 하나: 선택 시트와 같은 확인 한 번 */}
      <TakeConfirm open={!!current && taking} amountUsdt={takeAmount} onCancel={() => setTaking(false)} onConfirm={() => void take()} busy={busy} />
      {current && <Confirm open={cancelling} onCancel={() => setCancelling(false)} onConfirm={cancel} busy={busy} busyLabel={t("common.checking")} title={t("inv.cancelTitle")} desc={t("inv.cancelDesc")} confirmLabel={t("inv.cancelShip")} cancelLabel={t("common.cancel")} />}
    </div>
  );
}
