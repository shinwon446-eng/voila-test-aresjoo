"use client";
/**
 * 보관함. 결정 하나: 어느 상품을 받을지. 상품을 누르면 그 상품의 시트가 열리고 거기서 받는 방법을 고른다.
 * 통계 칸, 검색, 정렬 셀렉트, 여러 탭은 없다. 상태 셋(보관 중, 배송, 받은 것)만 알약으로 고른다.
 * 실패와 막힘은 팝업이나 토스트가 아니라 그 자리의 한 줄로 쓴다.
 */
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BOX_BY_SLUG, REFUND_RATE } from "@/lib/products";
import { productOf, processedAt, vaultTab, type VaultTab } from "@/lib/vault";
import { trackingUrl } from "@/lib/carriers";
import { cancelShipment, takeUsdt } from "@/lib/claim";
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
  const [verifying, setVerifying] = useState<VerifyRecord | null>(null);
  const [reviewing, setReviewing] = useState(false);
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

  const date = (value?: string) => (value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(new Date(value)) : "");
  const counts = useMemo(() => items.reduce((acc, item) => { acc[vaultTab(item)]++; return acc; }, { held: 0, shipping: 0, done: 0 }), [items]);
  const list = useMemo(() => items.filter((item) => vaultTab(item) === tab).sort((a, b) => (Date.parse(processedAt(b) ?? "") || 0) - (Date.parse(processedAt(a) ?? "") || 0)), [items, tab]);
  const current = items.find((item) => item.id === openId) ?? null;
  const product = current ? productOf(current) : undefined;
  const nameOf = (item: OwnedItem) => { const p = productOf(item); return p ? itemName(p) : item.itemId; };
  const takeAmount = current ? +(current.valueUsdt * REFUND_RATE).toFixed(2) : 0;
  const statusOf = (item: OwnedItem) => item.status === "IN_STORAGE" ? t("inv.stHeld") : item.status === "SHIPPING_REQUESTED" ? t("inv.stRequested") : item.status === "SHIPPING" ? t("inv.stShipping") : item.status === "DELIVERED" ? t("inv.stDelivered") : t("inv.stTaken");

  const closeItem = () => { setOpenId(null); setCancelFailed(false); };
  const take = () => { if (!current) return; takeUsdt([current.id]); setTaking(false); closeItem(); setTab("done"); };
  const cancel = async () => {
    if (!current || busy) return;
    setBusy(true); setCancelFailed(false);
    try { await cancelShipment(current); setCancelling(false); closeItem(); setTab("held"); }
    catch { setCancelling(false); setCancelFailed(true); }
    finally { setBusy(false); }
  };
  const verify = (item: OwnedItem) => setVerifying({ itemId: item.itemId, fair: item.fair });

  const sheetOpen = !!current && !shipIds && !taking && !cancelling && !verifying && !reviewing;
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
            {list.length === 0 ? (
              <div className="v-stack"><Empty>{t("inv.empty." + tab)}</Empty>{tab === "held" && <ButtonLink href="/">{t("inv.toBoxes")}</ButtonLink>}</div>
            ) : (
              <ul className="v-itemrows">
                {list.slice(0, shown).map((item) => {
                  const p = productOf(item);
                  return (
                    <li key={item.id}>
                      <button type="button" className="v-itemrow" onClick={() => setOpenId(item.id)}>
                        <span className="v-itemrow-photo">{p?.image.src && <img src={p.image.src} alt="" loading="lazy" decoding="async" />}</span>
                        <span className="v-itemrow-body"><span className="v-card-title">{nameOf(item)}</span><span className="v-small">{item.status === "IN_STORAGE" ? t("inv.takeLine", { amount: fmt(+(item.valueUsdt * REFUND_RATE).toFixed(2)) }) : statusOf(item) + (date(processedAt(item)) ? ", " + date(processedAt(item)) : "")}</span></span>
                        <span className="v-num">{fmt(item.status === "SOLD" ? item.soldForUsdt ?? 0 : item.valueUsdt)} ›</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {list.length > shown && <div className="v-links"><TextLink onClick={() => setShown((n) => n + PAGE)}>{t("inv.more", { n: list.length - shown })}</TextLink></div>}
          </>
        )}

      <Sheet open={sheetOpen} onClose={closeItem} title={current ? nameOf(current) : ""} desc={current && BOX_BY_SLUG[current.boxSlug] ? boxTitle(BOX_BY_SLUG[current.boxSlug]) : undefined} closeLabel={t("common.close")}>
        {current && (
          <>
            <Rows>
              <Row label={t("inv.status")}>{statusOf(current)}</Row>
              <Row label={t("reveal.value")}>{fmt(current.valueUsdt)}</Row>
              <Row label={t("inv.acquired")}>{date(current.acquiredAt)}</Row>
              {current.status === "IN_STORAGE" && current.autoCashbackAt && <Row label={t("inv.keepUntil")}>{date(current.autoCashbackAt)}</Row>}
              {current.status === "SOLD" && <Row label={t("inv.takenAmount")}>{fmt(current.soldForUsdt ?? 0)}</Row>}
              {current.shipping?.requestedAt && current.status !== "IN_STORAGE" && <Row label={t("inv.requestedAt")}>{date(current.shipping.requestedAt)}</Row>}
              {current.shipping?.carrier && <Row label={t("inv.carrier")}>{current.shipping.carrier}</Row>}
              {current.shipping?.trackingNumber && <Row label={t("inv.tracking")}>{current.shipping.trackingNumber}</Row>}
            </Rows>
            {current.status === "SHIPPING_REQUESTED" && <Line>{t("inv.waitingTracking")}</Line>}
            {cancelFailed && <Line fail>{t("inv.cancelFailed")}</Line>}
            {current.status === "IN_STORAGE" && product?.kind === "physical" && <Button onClick={() => setShipIds([current.id])}>{t("reveal.ship")}</Button>}
            {current.status === "IN_STORAGE" && product?.kind !== "physical" && <Button onClick={() => setTaking(true)}>{t("reveal.take", { amount: fmt(takeAmount) })}</Button>}
            {current.status === "SHIPPING_REQUESTED" && <Button onClick={() => setCancelling(true)}>{t("inv.cancelShip")}</Button>}
            {current.status === "SHIPPING" && current.shipping?.carrier && current.shipping.trackingNumber && <a className="v-btn" href={trackingUrl(current.shipping.carrier, current.shipping.trackingNumber)} target="_blank" rel="noreferrer">{t("inv.track")} ↗</a>}
            <div className="v-links">
              {current.status === "IN_STORAGE" && product?.kind === "physical" && <TextLink onClick={() => setTaking(true)}>{t("reveal.take", { amount: fmt(takeAmount) })}</TextLink>}
              <TextLink onClick={() => verify(current)}>{t("nav.verify")}</TextLink>
              {reviewable && <TextLink onClick={() => setReviewing(true)}>{t("inv.writeReview")}</TextLink>}
            </div>
            {reviewed && <p className="v-small">{t("inv.reviewed")}</p>}
          </>
        )}
      </Sheet>

      <ShipSheet ownedIds={shipIds} onClose={() => setShipIds(null)} onDone={() => { setShipIds(null); closeItem(); setTab("shipping"); }} />
      <VerifySheet record={verifying} onClose={() => setVerifying(null)} />
      <ReviewSheet item={reviewing ? current : null} itemName={current ? nameOf(current) : ""} onClose={() => setReviewing(false)} onDone={() => setReviewing(false)} />
      {current && <Confirm open={taking} onCancel={() => setTaking(false)} onConfirm={take} title={t("reveal.takeTitle")} desc={t("reveal.takeDesc", { name: nameOf(current), amount: fmt(takeAmount) })} confirmLabel={t("reveal.take", { amount: fmt(takeAmount) })} cancelLabel={t("common.cancel")} />}
      {current && <Confirm open={cancelling} onCancel={() => setCancelling(false)} onConfirm={cancel} busy={busy} busyLabel={t("common.checking")} title={t("inv.cancelTitle")} desc={t("inv.cancelDesc")} confirmLabel={t("inv.cancelShip")} cancelLabel={t("common.cancel")} />}
    </div>
  );
}
