"use client";
/**
 * 배송 받기 시트. 결정 하나: 이 주소로 배송을 신청할지.
 * 지난번에 쓴 주소가 있으면 채워져 있다. 틀린 칸은 그 칸 아래 한 줄로 알린다.
 * 배송 신청은 되돌릴 수 없는 행동이라 확인창을 한 번 거친다. 접수는 lib/claim 의 requestShipment 가 한다.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { COUNTRIES, customsKindFor, shippingFee, validateAddress, type AddressError, type CountryCode, type ShippingAddress } from "@/lib/shipping";
import { requestShipment } from "@/lib/claim";
import { useCurrency } from "@/lib/useCurrency";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useWalletStore } from "@/stores/walletStore";
import { Confirm, Sheet } from "@/components/ui/Sheet";
import { Button, Chips, Field, Line, Row, Rows } from "@/components/ui/kit";

const EMPTY: ShippingAddress = { recipient: "", country: "KR", phone: "", postalCode: "", address: "", customsId: "" };

export function ShipSheet({ ownedIds, onClose, onDone }: { ownedIds: string[] | null; onClose: () => void; onDone: () => void }) {
  const t = useTranslations("v");
  const locale = useLocale();
  const { fmt } = useCurrency();
  const balance = useWalletStore((s) => s.balance);
  const items = useInventoryStore((s) => s.items);
  const [form, setForm] = useState<ShippingAddress>(EMPTY);
  const [touched, setTouched] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const requestKey = useRef("");
  const open = !!ownedIds?.length;

  // 지난번에 쓴 주소를 채운다(가장 최근 배송 신청의 주소)
  const lastAddress = useMemo(() => items.filter((i) => i.shipping?.address).sort((a, b) => Date.parse(b.shipping!.requestedAt) - Date.parse(a.shipping!.requestedAt))[0]?.shipping?.address, [items]);
  useEffect(() => {
    if (!open) return;
    requestKey.current = crypto.randomUUID();
    setForm(lastAddress ? { ...EMPTY, ...lastAddress } : EMPTY);
    setTouched(false); setFailed(false); setConfirming(false);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const regionNames = useMemo(() => new Intl.DisplayNames([locale], { type: "region" }), [locale]);
  const customs = customsKindFor(form.country);
  const fee = shippingFee(form.country);
  const payload: ShippingAddress = { ...form, address: form.address.trim(), customsId: customs === "none" ? undefined : form.customsId?.trim().toUpperCase() };
  const errors = validateAddress(payload);
  const bad = (key: AddressError) => touched && errors.includes(key);
  const short = balance < fee;
  const set = <K extends keyof ShippingAddress>(key: K, value: ShippingAddress[K]) => setForm((f) => ({ ...f, [key]: value }));

  const press = () => { setTouched(true); setFailed(false); if (!errors.length && !short) setConfirming(true); };
  const submit = async () => {
    if (!ownedIds || busy) return;
    setBusy(true);
    try { await requestShipment(ownedIds, payload, fee, requestKey.current); setConfirming(false); onDone(); }
    catch { setConfirming(false); setFailed(true); }
    finally { setBusy(false); }
  };

  return (
    <>
      <Sheet open={open && !confirming} onClose={onClose} title={t("ship.title")} desc={t("ship.desc")} closeLabel={t("common.close")} wide>
        <Chips scroll label={t("ship.country")} value={form.country} onChange={(c: CountryCode) => set("country", c)} options={COUNTRIES.map((c) => ({ value: c, label: regionNames.of(c) ?? c }))} />
        <Field label={t("ship.recipient")} autoComplete="name" value={form.recipient} onChange={(e) => set("recipient", e.target.value)} />
        {bad("recipient") && <Line fail>{t("ship.errRecipient")}</Line>}
        <Field label={t("ship.phone")} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        {bad("phone") && <Line fail>{t("ship.errPhone")}</Line>}
        <Field label={t("ship.postal")} autoComplete="postal-code" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
        {bad("postalCode") && <Line fail>{t("ship.errPostal")}</Line>}
        <Field label={t("ship.address")} autoComplete="street-address" value={form.address} onChange={(e) => set("address", e.target.value)} />
        {bad("address") && <Line fail>{t("ship.errAddress")}</Line>}
        {customs !== "none" && <Field label={t(customs === "pccc" ? "ship.pccc" : "ship.residentId")} autoCapitalize="characters" value={form.customsId ?? ""} onChange={(e) => set("customsId", e.target.value)} />}
        {customs !== "none" && bad("customsId") && <Line fail>{t(customs === "pccc" ? "ship.errPccc" : "ship.errResidentId")}</Line>}
        <Rows><Row label={t("ship.count")}>{t("ship.countN", { n: ownedIds?.length ?? 0 })}</Row><Row label={t("ship.fee")}>{fmt(fee)}</Row></Rows>
        {short && <Line>{t("box.short", { balance: fmt(balance), missing: fmt(fee - balance) })}</Line>}
        {failed && <Line fail>{t("ship.failed")}</Line>}
        <Button onClick={press}>{t("ship.submit")}</Button>
      </Sheet>
      <Confirm open={open && confirming} onCancel={() => setConfirming(false)} onConfirm={submit} busy={busy} busyLabel={t("common.checking")} title={t("ship.confirmTitle")} desc={t("ship.confirmDesc", { address: payload.address })} confirmLabel={t("ship.submit")} cancelLabel={t("common.cancel")} />
    </>
  );
}
