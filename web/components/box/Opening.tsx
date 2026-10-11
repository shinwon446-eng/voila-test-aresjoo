"use client";
/**
 * 개봉 장면. VOILA 의 대표 상호작용(opening/STATE.md, opening/DECISIONS.md).
 * 결과는 열기를 누르는 순간 이미 정해져 있다(lib/opening). 이 화면은 그것을 있는 그대로 보여 준다.
 *   기대(상자가 내려앉고 봉인이 버틴다) → 충격(봉인이 떨어지고 뚜껑이 넘어간다) → 상자가 물러난다 → 받은 것과 차이가 함께 나온다
 * 지키는 것
 *   - 기대 구간은 결과와 무관하게 같다. 열린 틈의 빛은 실제로 늘었을 때만 밝다.
 *   - 가장 큰 글자는 언제나 "실제로 받은 것"이다. USDT 결과와 USDT 로 받은 상품은 받은 금액, 보관한 상품은 그 상품.
 *   - 받은 것 바로 아래에 쓴 금액과 잔액 변화를 두 줄로 적는다. 줄었으면 줄었다고 적는다.
 *   - 위의 잔액은 결과가 드러나는 순간 최종 값으로 바뀐다. 중간 값을 세어 올리지 않는다.
 *   - "결과 바로 보기"로 언제든 건너뛴다. 건너뛰어도 결과는 같다. 결과가 뜬 직후 0.35초는 아래 단추가 눌리지 않는다.
 *   - 다음 열기는 언제나 사람이 누른다. 상품을 USDT 로 받는 일은 이 화면 안에서 끝난다.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { REFUND_RATE, dropTable, formatRate, sellValueOf, type ProductBox } from "@/lib/products";
import type { OpeningResult } from "@/lib/opening";
import { OPENING_ARM_DELAY_MS, autoTakeApplies, openingChange, openingTimeline, timesOf, toneOf, type OpeningEvent } from "@/lib/openingFlow";
import { settleTake } from "@/lib/openingSettle";
import { hapticImpact, soundOpen, soundResult, soundStop } from "@/lib/openingSound";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";
import { useModal } from "@/lib/useModal";
import { useWalletStore } from "@/stores/walletStore";
import { BURST, burstGauge } from "@/lib/burst";
import { useSettingsStore, type ReceiveMethod } from "@/stores/settingsStore";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button, Line, TextLink } from "@/components/ui/kit";
import { Confirm, Sheet } from "@/components/ui/Sheet";
import { VerifySheet, type VerifyRecord } from "@/components/flow/VerifySheet";
import { ShipSheet } from "@/components/flow/ShipSheet";

type Phase = "anticipation" | "impact" | "exit" | "reveal" | "ready";
type Settle = "idle" | "settling" | "settled" | "pending" | "failed";

const STAR = "M8 0 10.15 5.85 16 8l-5.85 2.15L8 16l-2.15-5.85L0 8l5.85-2.15Z";
const Star = ({ className }: { className?: string }) => <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden><path d={STAR} /></svg>;
const round2 = (n: number) => +n.toFixed(2);

/** 상자. 한 개 열기와 여러 개 열기가 같은 것을 쓴다. 단계는 조상의 data-phase 가 정한다. */
export function OpeningBox() {
  return (
    <span className="v-boxw" aria-hidden>
      <span className="v-box3">
        <i className="v-box3-back" /><i className="v-box3-inside" /><i className="v-box3-glow" /><i className="v-box3-right" /><i className="v-box3-front" />
        <span className="v-box3-lid"><i className="v-box3-lid-right" /><i className="v-box3-lid-top" /><i className="v-box3-lid-front" /></span>
        <span className="v-seal"><Star className="v-seal-star" /></span>
      </span>
    </span>
  );
}

export function Opening({ box, result, cost, nextCost, accountId, recovered, initialTaken, initialShipped, onClose, onAgain, againBusy, canAgain, onRevealed, onFlow }: {
  box: ProductBox; result: OpeningResult; cost: number;
  /** 한 번 더 열 때 낼 값(무료 횟수가 남았으면 0). 주지 않으면 방금 낸 값과 같다고 본다 */
  nextCost?: number;
  /** 설정(자동 받기, 지난번에 고른 방법)은 계정마다 따로다 */
  accountId: string;
  /** 연출을 못 보고 떠났다가 돌아와 다시 보는 결과. 새로 뽑지 않았으므로 연출 없이 바로 보여 준다 */
  recovered?: boolean;
  /** 다시 보는 결과가 이미 USDT 로 받은 상품이면 그때 실제로 받은 금액(보관함 기록의 soldForUsdt) */
  initialTaken?: number;
  initialShipped?: boolean;
  onClose: () => void; onAgain: () => void; againBusy: boolean; canAgain: boolean;
  /** 결과가 화면에 보인 순간 한 번 불린다(기록장에 "봤음"을 남긴다) */
  onRevealed: () => void;
  /** 건너뛰기와 USDT 로 받기의 진행을 박스 화면의 상태 기계에 알린다 */
  onFlow: (event: OpeningEvent) => void;
}) {
  const t = useTranslations("v");
  const { itemName } = useProductText();
  const { fmt } = useCurrency();
  const panel = useRef<HTMLDivElement>(null);
  const balance = useWalletStore((s) => s.balance);
  // 결과가 드러난 뒤에만 보여 준다(구매가 끝난 순간 게이지는 이미 바뀌어 있어서, 먼저 보이면 결과를 미리 알려 주게 된다)
  const gauge = burstGauge(box.price, useWalletStore((s) => s.burst?.[box.slug]));
  const burst = result.item.id === BURST.id;
  const sound = useSettingsStore((s) => s.openSound);
  const short = useSettingsStore((s) => s.openShort);
  const autoTake = useSettingsStore((s) => !!s.autoTakeBy[accountId]);
  const lastReceive = useSettingsStore((s) => s.lastReceiveBy[accountId] ?? null);
  const item = result.item;
  const isCash = item.kind === "cash";
  const tone = toneOf(item, box.price);
  // 연출 길이는 장면이 시작할 때의 설정으로 정한다(도중에 설정을 바꿔도 이 장면은 그대로 끝난다)
  const timeline = useMemo(() => openingTimeline(short), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [phase, setPhase] = useState<Phase>(recovered ? "reveal" : "anticipation");
  const [settle, setSettle] = useState<Settle>(initialTaken !== undefined ? "settled" : "idle");
  const [taken, setTaken] = useState<number | null>(initialTaken ?? null);
  const [autoTaken, setAutoTaken] = useState(false);
  const [shipped, setShipped] = useState(!!initialShipped);
  // 열기 직전 잔액: 이 화면이 뜰 때는 이미 낸 값이 빠지고 USDT 결과가 더해져 있다. 그 둘을 되돌린 값이다(연출 중에만 보인다)
  const [balanceBefore] = useState(() => +(balance + cost - (isCash ? item.value : 0)).toFixed(2));
  const [verifying, setVerifying] = useState<VerifyRecord | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [method, setMethod] = useState<ReceiveMethod | null>(null);
  const [shipping, setShipping] = useState(false);
  const [settings, setSettings] = useState(false);
  const soundRef = useRef(sound); soundRef.current = sound;
  const natural = useRef(!recovered);
  const alive = useRef(true);
  // 화면이 사라지면 예약해 둔 소리도 멈춘다(닫은 뒤에 음이 이어지지 않게)
  useEffect(() => { alive.current = true; return () => { alive.current = false; soundStop(); }; }, []);
  // 닫기는 결과가 다 보인 뒤에만 있다. Esc 도 같다(연출 중 Esc 는 결과로 건너뛴다). 다음 구매를 처리하는 동안에는 닫히지 않는다.
  const revealed = phase === "reveal" || phase === "ready";
  const skip = useCallback(() => { natural.current = false; onFlow("SKIP"); setPhase((p) => (p === "reveal" || p === "ready" ? p : "reveal")); }, [onFlow]);
  const close = () => { if (!againBusy) onClose(); };
  useModal(true, () => { if (phase === "ready") close(); else skip(); }, panel);

  // 연출 시계. 움직임 줄이기면 결과부터.
  useEffect(() => {
    if (recovered) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { natural.current = false; setPhase("reveal"); return; }
    const timers = [
      window.setTimeout(() => setPhase((p) => (p === "anticipation" ? "impact" : p)), timeline.anticipation),
      window.setTimeout(() => setPhase((p) => (p === "impact" ? "exit" : p)), timeline.anticipation + timeline.impact),
      window.setTimeout(() => setPhase((p) => (p === "exit" ? "reveal" : p)), timeline.revealAt),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [recovered, timeline]);

  // 단계가 바뀔 때의 소리와 진동, 그리고 결과가 보인 뒤의 일
  const revealedOnce = useRef(false);
  useEffect(() => {
    if (phase === "impact" && natural.current) { soundOpen(soundRef.current); hapticImpact(soundRef.current); }
    if (phase !== "reveal") return;
    if (!revealedOnce.current) {
      revealedOnce.current = true;
      onRevealed();
      if (!recovered) soundResult(soundRef.current, tone);
      // 건너뛰기 단추가 사라지므로 포커스를 결과 화면으로 옮긴다
      panel.current?.focus({ preventScroll: true });
    }
    const arm = window.setTimeout(() => setPhase("ready"), OPENING_ARM_DELAY_MS);
    return () => window.clearTimeout(arm);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const take = useCallback(async (auto: boolean, retry = false) => {
    setSettle("settling");
    onFlow(retry ? "RETRY" : "SETTLE_START");
    let out: Awaited<ReturnType<typeof settleTake>>;
    try { out = await settleTake(result.ownedId); } catch { out = { status: "failed" }; }
    onFlow(out.status === "settled" ? "SETTLE_OK" : out.status === "pending" ? "SETTLE_PENDING" : "SETTLE_ERROR");
    if (!alive.current) return;
    if (out.status === "settled") { setTaken(out.amountUsdt); setAutoTaken(auto); setSettle("settled"); }
    else setSettle(out.status);
  }, [result.ownedId, onFlow]);

  // 자동으로 USDT 로 받기: 사용자가 직접 켠 경우에만, 결과가 보인 뒤에 한 번
  const autoRan = useRef(false);
  useEffect(() => {
    if (!revealed || autoRan.current || recovered) return;
    autoRan.current = true;
    if (autoTakeApplies(item, box.price, autoTake)) void take(true);
  }, [revealed]); // eslint-disable-line react-hooks/exhaustive-deps

  const table = useMemo(() => dropTable(box), [box]);
  const verify = () => setVerifying({ itemId: item.id, fair: { serverSeed: result.serverSeed, serverSeedHash: result.serverSeedHash, clientSeed: result.clientSeed, nonce: result.nonce, roll: result.roll, dropTable: table.map(({ id, dropRate }) => ({ id, dropRate })) } });

  // 잔액: 결과가 드러나기 전에는 열기 전 잔액, 드러난 순간부터는 지금 잔액(최종 값). 중간 값을 보여 주지 않는다.
  // 이번 개봉으로 달라진 만큼은 지갑의 앞뒤를 빼지 않고 이 개봉의 영수증으로 계산한다(다른 거래가 섞이지 않게).
  const received = isCash ? item.value : settle === "settled" ? taken : null;
  const change = openingChange(cost, received === null ? [] : [received]).diff;
  const direction = change < 0 ? "down" : change > 0 ? "up" : "same";
  const net = (
    <p className="v-op-net" data-direction={direction}>
      <span className="v-op-net-paid">{cost > 0 ? t("op.paid", { price: fmt(cost) }) : t("op.free")}</span>
      <span className="v-op-net-change">{t(change < 0 ? "op.balDown" : change > 0 ? "op.balUp" : "op.balSame", { diff: fmt(Math.abs(change)) })}</span>
    </p>
  );
  const sellAmount = fmt(round2(sellValueOf(item)));
  const odds = t("op.odds", { pct: formatRate(item.dropRate) });
  const done = isCash || settle === "settled" || shipped;
  const ready = phase === "ready";
  const againLabel = (nextCost ?? cost) > 0 ? t("reveal.again", { amount: fmt(nextCost ?? cost) }) : t("reveal.againFree");
  const again = <Button data-open-again onClick={onAgain} busy={againBusy} busyLabel={t("box.opening")} disabled={!ready}>{againLabel}</Button>;
  const confirmMethod = () => {
    if (!method || settle === "settling" || settle === "settled") return;
    useSettingsStore.getState().setLastReceive(accountId, method);
    setChoosing(false);
    if (method === "ship") setShipping(true); else void take(false);
  };

  return (
    <div ref={panel} role="dialog" aria-modal="true" aria-label={t("reveal.results")} tabIndex={-1} className="v-op" data-phase={phase} data-tone={tone} data-kind={isCash ? "cash" : "item"} data-short={short || undefined}
      data-opening-state={ready ? "settled" : revealed ? "revealed" : "opening"}
      style={{ "--ant": timeline.anticipation + "ms", "--imp": timeline.impact + "ms", "--exit": timeline.exit + "ms" } as React.CSSProperties}>
      <div className="v-op-top">
        <span className="v-op-balance v-num" data-changed={revealed && balance !== balanceBefore ? "true" : undefined}>{t("op.balance", { amount: fmt(revealed ? balance : balanceBefore) })}</span>
        <span className="v-op-tools">
          <button type="button" className="v-op-tool" onClick={() => setSettings(true)} aria-label={t("op.settings")}><SlidersHorizontal size={18} aria-hidden /></button>
          {ready && <button type="button" className="v-op-tool" onClick={close} disabled={againBusy} aria-label={t("common.close")}><X size={20} aria-hidden /></button>}
        </span>
      </div>

      <div className="v-op-scene">
        <span className="v-op-floor" aria-hidden />
        {!revealed && <OpeningBox />}
        {/* 받은 것과 차이를 한 묶음으로. 화면 읽기 도구에는 다 드러난 뒤 한 번만 읽힌다 */}
        <div className="v-op-result" aria-live="polite" aria-atomic="true" aria-hidden={!revealed}>
          {revealed && (received !== null ? (
            <>
              <p className="v-op-label">{t(burst ? "op.burstLabel" : "op.cashLabel")}{timesOf(received, cost) !== null ? t("op.times", { n: timesOf(received, cost) }) : ""}</p>
              <h2 className="v-op-amount v-num">{fmt(received)}</h2>
              {net}
              <p className="v-op-meta">{isCash ? t("op.inBalance") : t(autoTaken ? "op.autoTookFrom" : "op.tookFrom", { name: itemName(item), ref: fmt(item.value) })}. {odds}{autoTaken ? ". " + t("op.autoNote") : ""}</p>
            </>
          ) : (
            <>
              {/* 낸 값의 20배 이상: 상품 위에 서비스 이름을 얹어 한 장의 완성된 구도로 만든다. 상품을 가리는 것은 없다 */}
              {tone === "top" && item.image.src && <BrandLogo size="sm" asLink={false} className="v-op-brand" />}
              {item.image.src
                ? <div className="v-op-photo"><span className="v-op-halo" aria-hidden /><img src={item.image.src} alt="" /></div>
                : <><p className="v-op-label">{t("reveal.value")}</p><p className="v-op-amount v-num">{fmt(item.value)}</p></>}
              <h2 className="v-op-name">{itemName(item)}</h2>
              {item.image.src && <p className="v-op-ref v-num">{t("op.refLine", { amount: fmt(item.value) })}</p>}
              {item.image.src && timesOf(item.value, cost) !== null && <p className="v-op-label">{t("op.timesLine", { n: timesOf(item.value, cost) })}</p>}
              <p className="v-op-line">{shipped ? t("op.shipRequested") : t("op.keptStatus")}{!shipped && !item.image.src ? ". " + t("op.takeWorth", { amount: sellAmount }) : ""}</p>
              <p className="v-op-meta">{odds}. {cost > 0 ? t("op.paid", { price: fmt(cost) }) : t("op.free")}</p>
            </>
          ))}
          {revealed && <p className="v-op-label v-op-gauge v-num">{t(burst ? "op.gaugeReset" : "op.gaugeNow", { amount: fmt(gauge) })}</p>}
        </div>
      </div>

      <div className="v-op-bottom">
        {!revealed ? (
          <div className="v-op-skip"><TextLink onClick={skip}>{t("op.skip")}</TextLink></div>
        ) : (
          <>
            <div className="v-op-status">
              {recovered && <p>{t("op.recovered")}</p>}
              {settle === "pending" && <Line>{t("op.pending")}</Line>}
              {settle === "failed" && <Line fail>{t("op.failed")}</Line>}
            </div>
            <div className="v-op-actions" data-armed={ready || undefined}>
              {done ? (
                <>
                  {canAgain ? again : <Button onClick={close} disabled={!ready}>{t("op.backToBox")}</Button>}
                  <div className="v-links"><TextLink onClick={() => { if (ready) verify(); }}>{t("nav.verify")}</TextLink>{canAgain && <TextLink onClick={() => { if (ready) close(); }}>{t("op.backToBox")}</TextLink>}</div>
                </>
              ) : (
                <>
                  {settle === "failed" || settle === "pending"
                    ? <Button onClick={() => void take(false, true)} disabled={!ready}>{t(settle === "failed" ? "op.retryTake" : "op.recheck", { amount: sellAmount })}</Button>
                    : <Button onClick={() => { setMethod(item.kind === "physical" ? lastReceive : "usdt"); setChoosing(true); }} disabled={!ready || settle === "settling"} busy={settle === "settling"} busyLabel={t("common.checking")}>{t("op.choose")}</Button>}
                  <div className="v-links">{canAgain && settle === "idle" && <TextLink onClick={() => { if (ready && !againBusy) onAgain(); }}>{againLabel}</TextLink>}<TextLink onClick={() => { if (ready) verify(); }}>{t("nav.verify")}</TextLink>{settle !== "idle" && <TextLink onClick={() => { if (ready) close(); }}>{t("op.backToBox")}</TextLink>}</div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* 받는 방법: 배송과 USDT 를 나란히 놓고 고른 뒤 아래 단추 하나로 확정한다 */}
      <Sheet open={choosing} onClose={() => setChoosing(false)} title={t("op.chooseTitle")} desc={itemName(item)} closeLabel={t("common.close")}>
        <div role="radiogroup" aria-label={t("op.chooseTitle")} className="v-op-choices" onKeyDown={(e) => { if (item.kind !== "physical" || !["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return; e.preventDefault(); const next = method === "ship" ? "usdt" : "ship"; setMethod(next); (e.currentTarget.querySelector(`[data-method="${next}"]`) as HTMLElement | null)?.focus(); }}>
          {item.kind === "physical" && (
            <button type="button" role="radio" data-method="ship" aria-checked={method === "ship"} tabIndex={method === "usdt" ? -1 : 0} className="v-op-choice" onClick={() => setMethod("ship")}>
              <span className="v-card-title">{t("reveal.ship")}</span><span className="v-small">{t("op.shipNote")}</span>
            </button>
          )}
          <button type="button" role="radio" data-method="usdt" aria-checked={method === "usdt"} tabIndex={method === "ship" ? -1 : 0} className="v-op-choice" onClick={() => setMethod("usdt")}>
            <span className="v-card-title">{t("op.takeChoice", { amount: sellAmount })}</span><span className="v-small">{t(item.kind === "physical" ? "op.takeNote" : "op.takeNoteDigital", { ref: fmt(item.value), pct: Math.round(REFUND_RATE * 100) })}</span>
          </button>
        </div>
        <Button onClick={confirmMethod} disabled={!method || (method === "ship" && item.kind !== "physical")}>{method === "usdt" ? t("op.takeConfirm", { amount: sellAmount }) : method === "ship" ? t("op.shipConfirm") : t("op.choosePrompt")}</Button>
      </Sheet>
      <OpeningSettings open={settings} onClose={() => setSettings(false)} accountId={accountId} />
      <VerifySheet record={verifying} onClose={() => setVerifying(null)} />
      <ShipSheet ownedIds={shipping ? [result.ownedId] : null} onClose={() => setShipping(false)} onDone={() => { setShipped(true); setShipping(false); }} />
    </div>
  );
}

/** 개봉 설정: 소리와 진동, 짧게 보기, 상품을 자동으로 USDT 로 받기. 전부 기본은 끔이다. */
export function OpeningSettings({ open, onClose, accountId }: { open: boolean; onClose: () => void; accountId: string }) {
  const t = useTranslations("v");
  const s = useSettingsStore();
  const [asking, setAsking] = useState(false);
  const toggle = (on: boolean, label: string, note: string, onChange: (next: boolean) => void) => (
    <button type="button" role="switch" aria-checked={on} className="v-op-toggle" onClick={() => onChange(!on)}>
      <span className="v-op-toggle-text"><span className="v-card-title">{label}</span><span className="v-small">{note}</span></span>
      <span className="v-op-toggle-state">{t(on ? "op.on" : "op.off")}</span>
    </button>
  );
  return (
    <>
      <Sheet open={open && !asking} onClose={onClose} title={t("op.settings")} closeLabel={t("common.close")}>
        <div className="v-op-choices">
          {toggle(s.openSound, t("op.setSound"), t("op.setSoundNote"), s.setOpenSound)}
          {toggle(s.openShort, t("op.setShort"), t("op.setShortNote"), s.setOpenShort)}
          {toggle(!!s.autoTakeBy[accountId], t("op.setAuto"), t("op.setAutoNote", { pct: Math.round(REFUND_RATE * 100) }), (next) => { if (next) setAsking(true); else s.setAutoTake(accountId, false); })}
        </div>
      </Sheet>
      {/* 자동 받기는 기준을 다시 보여 주고 확인을 받은 뒤에만 켠다 */}
      <Confirm open={asking} onCancel={() => setAsking(false)} onConfirm={() => { s.setAutoTake(accountId, true); setAsking(false); }} title={t("op.setAuto")} desc={t("op.autoConfirm", { pct: Math.round(REFUND_RATE * 100) })} confirmLabel={t("op.autoOn")} cancelLabel={t("common.cancel")} />
    </>
  );
}
