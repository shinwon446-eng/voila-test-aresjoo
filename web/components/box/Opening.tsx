"use client";
/**
 * 개봉 장면. VOILA 의 대표 상호작용(opening/STATE.md, opening/DECISIONS.md).
 * 결과는 열기를 누르는 순간 이미 정해져 있다(lib/opening). 이 화면은 그것을 있는 그대로 보여 준다.
 *   기대(상자가 내려앉고 봉인이 감긴다) → 충격(봉인이 떨어지고 뚜껑이 넘어간다) → 상자가 빠진다 → 받은 것과 차이가 함께 나온다
 * 지키는 것
 *   - 기대 구간은 결과와 무관하게 같다. 빛은 열린 뒤에만, 실제로 늘었을 때만 밝다.
 *   - 받은 값과 "이번 개봉으로 잔액이 얼마나 달라졌는지"를 같은 자리, 같은 순간에 적는다. 줄었으면 줄었다고 적는다.
 *   - 잔액 숫자가 올라가는 움직임은 실제로 늘었을 때만 쓴다.
 *   - "결과 바로 보기"로 언제든 건너뛴다. 건너뛰어도 결과는 같다. 결과가 뜬 직후 0.35초는 아래 단추가 눌리지 않는다.
 *   - 다음 열기는 언제나 사람이 누른다. 상품을 USDT 로 받는 일은 이 화면 안에서 끝난다.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { REFUND_RATE, dropTable, formatRate, sellValueOf, type ProductBox } from "@/lib/products";
import type { OpeningResult } from "@/lib/opening";
import { OPENING_ARM_DELAY_MS, autoTakeApplies, openingTimeline, toneOf } from "@/lib/openingFlow";
import { settleTake } from "@/lib/openingSettle";
import { hapticImpact, soundOpen, soundResult } from "@/lib/openingSound";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";
import { useModal } from "@/lib/useModal";
import { useWalletStore } from "@/stores/walletStore";
import { useSettingsStore, type ReceiveMethod } from "@/stores/settingsStore";
import { Button, Line, TextLink } from "@/components/ui/kit";
import { Confirm, Sheet } from "@/components/ui/Sheet";
import { VerifySheet, type VerifyRecord } from "@/components/flow/VerifySheet";
import { ShipSheet } from "@/components/flow/ShipSheet";

type Phase = "anticipation" | "impact" | "exit" | "reveal" | "ready";
type Settle = "idle" | "settling" | "settled" | "pending" | "failed";

const STAR = "M8 0 10.15 5.85 16 8l-5.85 2.15L8 16l-2.15-5.85L0 8l5.85-2.15Z";
const Star = ({ className }: { className?: string }) => <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden><path d={STAR} /></svg>;
const round2 = (n: number) => +n.toFixed(2);

export function Opening({ box, result, cost, balanceBefore, recovered, onClose, onAgain, againBusy, canAgain, onRevealed }: {
  box: ProductBox; result: OpeningResult; cost: number;
  /** 열기 직전 잔액. 이번 개봉으로 얼마가 달라졌는지는 이 값과 지금 잔액의 차이다 */
  balanceBefore: number;
  /** 연출을 못 보고 떠났다가 돌아와 다시 보는 결과. 새로 뽑지 않았으므로 연출 없이 바로 보여 준다 */
  recovered?: boolean;
  onClose: () => void; onAgain: () => void; againBusy: boolean; canAgain: boolean;
  /** 결과가 화면에 보인 순간 한 번 불린다(기록장에 "봤음"을 남긴다) */
  onRevealed: () => void;
}) {
  const t = useTranslations("v");
  const { itemName } = useProductText();
  const { fmt } = useCurrency();
  const panel = useRef<HTMLDivElement>(null);
  const balance = useWalletStore((s) => s.balance);
  const sound = useSettingsStore((s) => s.openSound);
  const short = useSettingsStore((s) => s.openShort);
  const autoTake = useSettingsStore((s) => s.autoTake);
  const lastReceive = useSettingsStore((s) => s.lastReceive);
  const item = result.item;
  const isCash = item.kind === "cash";
  const tone = toneOf(item, box.price);
  // 연출 길이는 장면이 시작할 때의 설정으로 정한다(도중에 설정을 바꿔도 이 장면은 그대로 끝난다)
  const timeline = useMemo(() => openingTimeline(tone, short), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [phase, setPhase] = useState<Phase>(recovered ? "reveal" : "anticipation");
  const [settle, setSettle] = useState<Settle>("idle");
  const [taken, setTaken] = useState<number | null>(null);
  const [autoTaken, setAutoTaken] = useState(false);
  const [shipped, setShipped] = useState(false);
  const [verifying, setVerifying] = useState<VerifyRecord | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [method, setMethod] = useState<ReceiveMethod | null>(null);
  const [shipping, setShipping] = useState(false);
  const [settings, setSettings] = useState(false);
  const soundRef = useRef(sound); soundRef.current = sound;
  const natural = useRef(!recovered);
  // 닫기는 결과가 다 보인 뒤에만 있다. Esc 도 같다(연출 중 Esc 는 결과로 건너뛴다)
  const revealed = phase === "reveal" || phase === "ready";
  const skip = useCallback(() => { natural.current = false; setPhase((p) => (p === "reveal" || p === "ready" ? p : "reveal")); }, []);
  useModal(true, () => { if (phase === "ready") onClose(); else skip(); }, panel);

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
    }
    const arm = window.setTimeout(() => setPhase("ready"), OPENING_ARM_DELAY_MS);
    return () => window.clearTimeout(arm);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const take = useCallback(async (auto: boolean) => {
    setSettle("settling");
    const out = await settleTake(result.ownedId);
    if (out.status === "settled") { setTaken(out.amountUsdt || round2(sellValueOf(item))); setAutoTaken(auto); setSettle("settled"); }
    else setSettle(out.status);
  }, [result.ownedId, item]);

  // 자동으로 USDT 로 받기: 사용자가 직접 켠 경우에만, 결과가 보인 뒤에 한 번
  const autoRan = useRef(false);
  useEffect(() => {
    if (!revealed || autoRan.current || recovered) return;
    autoRan.current = true;
    if (autoTakeApplies(item, box.price, autoTake)) void take(true);
  }, [revealed]); // eslint-disable-line react-hooks/exhaustive-deps

  const table = useMemo(() => dropTable(box), [box]);
  const verify = () => setVerifying({ itemId: item.id, fair: { serverSeed: result.serverSeed, serverSeedHash: result.serverSeedHash, clientSeed: result.clientSeed, nonce: result.nonce, roll: result.roll, dropTable: table.map(({ id, dropRate }) => ({ id, dropRate })) } });

  // 잔액: 결과가 드러나기 전에는 열기 전 잔액, 드러난 뒤에는 지금 잔액. 숫자가 올라가는 움직임은 실제로 늘었을 때만.
  const change = round2(balance - balanceBefore);
  const shown = useBalance(revealed ? balance : balanceBefore, revealed && change > 0);
  const got = isCash ? item.value : taken;
  const netText = got === null || got === undefined ? null
    : t(change < 0 ? "op.netDown" : change > 0 ? "op.netUp" : "op.netSame", { price: fmt(cost), diff: fmt(Math.abs(change)) });
  const sellAmount = fmt(round2(sellValueOf(item)));
  const done = isCash || settle === "settled" || shipped;
  const ready = phase === "ready";
  const again = <Button data-open-again onClick={onAgain} busy={againBusy} busyLabel={t("box.opening")} disabled={!ready}>{t("reveal.again", { amount: fmt(cost) })}</Button>;
  const confirmMethod = () => {
    if (!method) return;
    useSettingsStore.getState().setLastReceive(method);
    setChoosing(false);
    if (method === "ship") setShipping(true); else void take(false);
  };

  return (
    <div ref={panel} role="dialog" aria-modal="true" aria-label={t("reveal.results")} tabIndex={-1} className="v-op" data-phase={phase} data-tone={tone} data-kind={isCash ? "cash" : "item"} data-short={short || undefined}
      data-opening-state={ready ? "settled" : revealed ? "revealed" : "opening"}
      style={{ "--ant": timeline.anticipation + "ms", "--imp": timeline.impact + "ms", "--exit": timeline.exit + "ms" } as React.CSSProperties}>
      <div className="v-op-top">
        <span className="v-op-balance v-num">{t("op.balance", { amount: fmt(shown) })}</span>
        <span className="v-op-tools">
          <button type="button" className="v-op-tool" onClick={() => setSettings(true)} aria-label={t("op.settings")}><SlidersHorizontal size={18} aria-hidden /></button>
          {ready && <button type="button" className="v-op-tool" onClick={onClose} aria-label={t("common.close")}><X size={20} aria-hidden /></button>}
        </span>
      </div>

      <div className="v-op-scene">
        <span className="v-op-floor" aria-hidden />
        {!revealed && (
          <span className="v-boxw" aria-hidden>
            <span className="v-box3">
              <i className="v-box3-back" /><i className="v-box3-inside" /><i className="v-box3-glow" /><i className="v-box3-right" /><i className="v-box3-front" />
              <span className="v-box3-lid"><i className="v-box3-lid-right" /><i className="v-box3-lid-top" /><i className="v-box3-lid-front" /></span>
              <span className="v-seal"><Star className="v-seal-star" /></span>
            </span>
          </span>
        )}
        {/* 받은 것과 차이를 한 묶음으로. 화면 읽기 도구에는 다 드러난 뒤 한 번만 읽힌다 */}
        <div className="v-op-result" aria-live="polite" aria-atomic="true" aria-hidden={!revealed}>
          {revealed && (isCash ? (
            <>
              <p className="v-op-label">{t("op.cashLabel")}</p>
              <h2 className="v-op-amount v-num">{fmt(item.value)}</h2>
              <p className="v-op-net" data-direction={change < 0 ? "down" : change > 0 ? "up" : "same"}>{netText}</p>
              <p className="v-op-meta">{t("op.inBalance")}. {t("op.odds", { pct: formatRate(item.dropRate) })}</p>
            </>
          ) : (
            <>
              {item.image.src ? <div className="v-op-photo"><img src={item.image.src} alt="" /></div> : <p className="v-op-amount v-num">{fmt(item.value)}</p>}
              <h2 className="v-op-name">{tone === "top" && <Star className="v-op-mark" />}{itemName(item)}</h2>
              {settle === "settled" && taken !== null ? (
                <>
                  <p className="v-op-line v-num">{t(autoTaken ? "op.autoTook" : "op.took", { amount: fmt(taken) })}</p>
                  <p className="v-op-net" data-direction={change < 0 ? "down" : change > 0 ? "up" : "same"}>{netText}</p>
                </>
              ) : (
                <p className="v-op-line">{t(shipped ? "op.shipRequested" : "op.keptLine", { amount: fmt(item.value) })}</p>
              )}
              <p className="v-op-meta">{t("op.odds", { pct: formatRate(item.dropRate) })}{settle !== "settled" && !shipped ? ". " + t("op.paid", { price: fmt(cost) }) : ""}{autoTaken ? ". " + t("op.autoNote") : ""}</p>
            </>
          ))}
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
                  {canAgain ? again : <Button onClick={onClose} disabled={!ready}>{t("op.backToBox")}</Button>}
                  <div className="v-links"><TextLink onClick={verify}>{t("nav.verify")}</TextLink>{canAgain && <TextLink onClick={onClose}>{t("op.backToBox")}</TextLink>}</div>
                </>
              ) : (
                <>
                  {settle === "failed"
                    ? <Button onClick={() => void take(false)} disabled={!ready}>{t("op.retryTake", { amount: sellAmount })}</Button>
                    : <Button onClick={() => { setMethod(lastReceive); setChoosing(true); }} disabled={!ready || settle === "settling" || settle === "pending"} busy={settle === "settling"} busyLabel={t("common.checking")}>{t("op.choose")}</Button>}
                  <div className="v-links">{canAgain && <TextLink onClick={() => { if (ready && !againBusy) onAgain(); }}>{t("reveal.again", { amount: fmt(cost) })}</TextLink>}<TextLink onClick={verify}>{t("nav.verify")}</TextLink></div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* 받는 방법: 배송과 USDT 를 나란히 놓고 고른 뒤 아래 단추 하나로 확정한다 */}
      <Sheet open={choosing} onClose={() => setChoosing(false)} title={t("op.chooseTitle")} desc={itemName(item)} closeLabel={t("common.close")}>
        <div role="radiogroup" aria-label={t("op.chooseTitle")} className="v-op-choices">
          {item.kind === "physical" && (
            <button type="button" role="radio" aria-checked={method === "ship"} className="v-op-choice" onClick={() => setMethod("ship")}>
              <span className="v-card-title">{t("reveal.ship")}</span><span className="v-small">{t("op.shipNote")}</span>
            </button>
          )}
          <button type="button" role="radio" aria-checked={method === "usdt"} className="v-op-choice" onClick={() => setMethod("usdt")}>
            <span className="v-card-title">{t("op.takeChoice", { amount: sellAmount })}</span><span className="v-small">{t("op.takeNote", { ref: fmt(item.value), pct: Math.round(REFUND_RATE * 100) })}</span>
          </button>
        </div>
        <Button onClick={confirmMethod} disabled={!method || (method === "ship" && item.kind !== "physical")}>{method === "usdt" ? t("op.takeConfirm", { amount: sellAmount }) : method === "ship" ? t("op.shipConfirm") : t("op.choosePrompt")}</Button>
      </Sheet>
      <OpeningSettings open={settings} onClose={() => setSettings(false)} />
      <VerifySheet record={verifying} onClose={() => setVerifying(null)} />
      <ShipSheet ownedIds={shipping ? [result.ownedId] : null} onClose={() => setShipping(false)} onDone={() => { setShipped(true); setShipping(false); }} />
    </div>
  );
}

/** 개봉 설정: 소리와 진동, 짧게 보기, 상품을 자동으로 USDT 로 받기. 전부 기본은 끔이다. */
export function OpeningSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("v");
  const s = useSettingsStore();
  const [asking, setAsking] = useState(false);
  const Toggle = ({ on, label, note, onChange }: { on: boolean; label: string; note: string; onChange: (next: boolean) => void }) => (
    <button type="button" role="switch" aria-checked={on} className="v-op-toggle" onClick={() => onChange(!on)}>
      <span className="v-op-toggle-text"><span className="v-card-title">{label}</span><span className="v-small">{note}</span></span>
      <span className="v-op-toggle-state">{t(on ? "op.on" : "op.off")}</span>
    </button>
  );
  return (
    <>
      <Sheet open={open && !asking} onClose={onClose} title={t("op.settings")} closeLabel={t("common.close")}>
        <div className="v-op-choices">
          <Toggle on={s.openSound} label={t("op.setSound")} note={t("op.setSoundNote")} onChange={s.setOpenSound} />
          <Toggle on={s.openShort} label={t("op.setShort")} note={t("op.setShortNote")} onChange={s.setOpenShort} />
          <Toggle on={s.autoTake} label={t("op.setAuto")} note={t("op.setAutoNote", { pct: Math.round(REFUND_RATE * 100) })} onChange={(next) => { if (next) setAsking(true); else s.setAutoTake(false); }} />
        </div>
      </Sheet>
      {/* 자동 받기는 기준을 다시 보여 주고 확인을 받은 뒤에만 켠다 */}
      <Confirm open={asking} onCancel={() => setAsking(false)} onConfirm={() => { s.setAutoTake(true); setAsking(false); }} title={t("op.setAuto")} desc={t("op.autoConfirm", { pct: Math.round(REFUND_RATE * 100) })} confirmLabel={t("op.autoOn")} cancelLabel={t("common.cancel")} />
    </>
  );
}

/** 잔액 표시. animate 가 참일 때만 목표 값까지 짧게 올라간다. 그 밖에는 바로 그 값. */
function useBalance(target: number, animate: boolean): number {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const a = from.current;
    if (!animate || target <= a || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { from.current = target; setValue(target); return; }
    const start = performance.now(); let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 480); const eased = 1 - Math.pow(1 - k, 3);
      setValue(+(a + (target - a) * eased).toFixed(2));
      if (k < 1) raf = requestAnimationFrame(tick); else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); from.current = target; };
  }, [target, animate]);
  return value;
}
