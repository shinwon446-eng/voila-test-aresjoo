"use client";
/**
 * 개봉 장면. VOILA 의 대표 상호작용(opening/STATE.md).
 * 결과는 열기를 누르는 순간 이미 정해져 있다(lib/opening). 이 화면은 그것을 있는 그대로, 결과의 크기에 맞는 무게로 보여 준다.
 *   기대(상자가 준비한다) → 충격(봉인이 풀린다) → 드러남(받은 것이 가운데로) → 받음(잔액이나 보관함에 들어온 것을 말한다)
 * 화면을 누르면 언제든 바로 결과다. 건너뛰어도 결과는 같다.
 * 낸 값보다 적게 받았으면 줄었다고 적는다. 축하는 실제로 늘었을 때만, 드문 결과의 연출은 실제로 드문 결과일 때만.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { dropTable, formatRate, sellValueOf, type ProductBox } from "@/lib/products";
import type { OpeningResult } from "@/lib/opening";
import { netOf, openingTimeline, toneOf } from "@/lib/openingFlow";
import { takeUsdt } from "@/lib/claim";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";
import { useModal } from "@/lib/useModal";
import { useWalletStore } from "@/stores/walletStore";
import { Button, TextLink } from "@/components/ui/kit";
import { Confirm } from "@/components/ui/Sheet";
import { VerifySheet, type VerifyRecord } from "@/components/flow/VerifySheet";
import { ShipSheet } from "@/components/flow/ShipSheet";

type Phase = "anticipation" | "impact" | "reveal" | "settled";
export type StageConcept = "a" | "b" | "c";

const STAR = "M8 0 10.15 5.85 16 8l-5.85 2.15L8 16l-2.15-5.85L0 8l5.85-2.15Z";
const Star = ({ className }: { className?: string }) => <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden><path d={STAR} /></svg>;

export function Opening({ box, result, cost, repeat, concept = "a", onClose, onAgain, againBusy, canAgain }: { box: ProductBox; result: OpeningResult; cost: number; repeat: boolean; concept?: StageConcept; onClose: () => void; onAgain: () => void; againBusy: boolean; canAgain: boolean }) {
  const t = useTranslations("v");
  const { itemName } = useProductText();
  const { fmt } = useCurrency();
  const panel = useRef<HTMLDivElement>(null);
  const balance = useWalletStore((s) => s.balance);
  const item = result.item;
  const tone = toneOf(item, box.price);
  const net = netOf(item, box.price);
  const timeline = useMemo(() => openingTimeline(tone, repeat), [tone, repeat]);
  const [phase, setPhase] = useState<Phase>("anticipation");
  const [verifying, setVerifying] = useState<VerifyRecord | null>(null);
  const [taking, setTaking] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [taken, setTaken] = useState<number | null>(null);
  const [shipped, setShipped] = useState(false);
  useModal(true, onClose, panel);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setPhase("settled"); return; }
    const a = window.setTimeout(() => setPhase("impact"), timeline.anticipation);
    const b = window.setTimeout(() => setPhase("reveal"), timeline.anticipation + timeline.impact);
    const c = window.setTimeout(() => setPhase("settled"), timeline.total);
    return () => { window.clearTimeout(a); window.clearTimeout(b); window.clearTimeout(c); };
  }, [timeline]);

  const settled = phase === "settled";
  const isCash = item.kind === "cash";
  // 잔액 알약: 열 때 이미 낸 값이 빠졌고, 받은 USDT 는 드러난 뒤에 더해 보인다(장부의 두 줄을 차례로 보여 주는 것)
  const credit = isCash ? item.value : taken ?? 0;
  const shown = useCountTo(settled ? balance : balance - (isCash ? item.value : 0), settled && credit > 0 ? 520 : 0);
  const table = useMemo(() => dropTable(box), [box]);
  const verify = () => setVerifying({ itemId: item.id, fair: { serverSeed: result.serverSeed, serverSeedHash: result.serverSeedHash, clientSeed: result.clientSeed, nonce: result.nonce, roll: result.roll, dropTable: table.map(({ id, dropRate }) => ({ id, dropRate })) } });
  const take = () => { const out = takeUsdt([result.ownedId]); if (out.ids.length) setTaken(out.totalUsdt); setTaking(false); };
  const again = <Button data-open-again onClick={onAgain} busy={againBusy} busyLabel={t("box.opening")}>{t("reveal.again", { amount: fmt(cost) })}</Button>;
  const done = isCash || taken !== null || shipped;
  const sell = fmt(sellValueOf(item));

  return (
    <div ref={panel} role="dialog" aria-modal="true" aria-label={t("reveal.results")} tabIndex={-1} className="v-op" data-phase={phase} data-tone={tone} data-concept={concept} data-kind={isCash ? "cash" : "item"} data-repeat={repeat || undefined} data-opening-state={settled ? "settled" : "opening"} style={{ "--ant": timeline.anticipation + "ms", "--rev": timeline.reveal + "ms" } as React.CSSProperties}>
      <div className="v-op-top">
        <span className="v-op-balance v-num" data-credited={settled && credit > 0 ? "true" : undefined} aria-live="polite">{t("op.balance", { amount: fmt(shown) })}</span>
        <button type="button" className="v-op-close" onClick={onClose} aria-label={t("common.close")}><X size={20} aria-hidden /></button>
      </div>

      <button type="button" className="v-op-scene" onClick={() => setPhase("settled")} disabled={settled} aria-label={t("reveal.skip")}>
        <span className="v-op-floor" aria-hidden />
        <span className="v-op-prize" aria-hidden={!settled}>
          {item.image.src ? <span className="v-op-photo"><img src={item.image.src} alt="" /></span>
            : <span className="v-op-amount v-num">{fmt(item.value)}</span>}
        </span>
        {concept === "a" && (
          <span className="v-boxw" aria-hidden><span className="v-box3">
            <i className="v-box3-back" /><i className="v-box3-left" /><i className="v-box3-inside" /><i className="v-box3-glow" /><i className="v-box3-right" /><i className="v-box3-front" />
            <span className="v-box3-lid"><i className="v-box3-lid-back" /><i className="v-box3-lid-left" /><i className="v-box3-lid-right" /><i className="v-box3-lid-top" /><i className="v-box3-lid-front"><span className="v-seal"><Star className="v-seal-star" /></span></i></span>
          </span></span>
        )}
        {concept === "b" && (
          <span className="v-boxb" aria-hidden><i className="v-boxb-top" /><i className="v-boxb-bottom" /><i className="v-boxb-seam" /><span className="v-seal"><Star className="v-seal-star" /></span><i className="v-boxb-bloom" /></span>
        )}
        {concept === "c" && (
          <span className="v-shut" aria-hidden><i className="v-shut-top" /><i className="v-shut-bottom" /><i className="v-shut-seam" /></span>
        )}
        <span className="v-op-flash" aria-hidden />
        <span className="v-op-spark" aria-hidden><Star /></span>
      </button>

      <div className="v-op-info" aria-hidden={!settled}>
        {isCash ? (
          <>
            <h2 className="v-op-name">{t("op.cashGot", { amount: fmt(item.value) })}</h2>
            <p className="v-op-net" data-direction={net.direction}>{t(net.direction === "down" ? "op.netDown" : net.direction === "up" ? "op.netUp" : "op.netSame", { price: fmt(net.paid), got: fmt(net.got), diff: fmt(Math.abs(net.diff)) })}</p>
            <p className="v-op-status">{t("op.inBalance")}, {t("op.odds", { pct: formatRate(item.dropRate) })}</p>
          </>
        ) : (
          <>
            <h2 className="v-op-name">{itemName(item)}</h2>
            <p className="v-op-value v-num">{taken !== null ? t("op.takenGot", { amount: fmt(taken) }) : t("op.refValue", { amount: fmt(item.value) })}</p>
            <p className="v-op-status">{taken !== null ? t("op.inBalance") : shipped ? t("reveal.shippedDesc") : t("op.kept")}, {t("op.odds", { pct: formatRate(item.dropRate) })}</p>
          </>
        )}
      </div>

      <div className="v-op-actions" aria-hidden={!settled}>
        {done ? (
          <>
            {canAgain ? again : <Button onClick={onClose}>{t("common.close")}</Button>}
            <div className="v-links"><TextLink onClick={verify}>{t("nav.verify")}</TextLink><TextLink onClick={onClose}>{t("op.backToBox")}</TextLink></div>
          </>
        ) : (
          <>
            <Button onClick={() => setTaking(true)}>{t("reveal.take", { amount: sell })}</Button>
            <div className="v-links">
              {item.kind === "physical" && <TextLink onClick={() => setShipping(true)}>{t("reveal.ship")}</TextLink>}
              {canAgain && <TextLink onClick={() => { if (!againBusy) onAgain(); }}>{t("op.keepAgain", { amount: fmt(cost) })}</TextLink>}
              <TextLink onClick={verify}>{t("nav.verify")}</TextLink>
            </div>
          </>
        )}
      </div>

      <VerifySheet record={verifying} onClose={() => setVerifying(null)} />
      <ShipSheet ownedIds={shipping ? [result.ownedId] : null} onClose={() => setShipping(false)} onDone={() => { setShipped(true); setShipping(false); }} />
      {taking && <Confirm open onCancel={() => setTaking(false)} onConfirm={take} title={t("reveal.takeTitle")} desc={t("reveal.takeDesc", { name: itemName(item), amount: sell })} confirmLabel={t("reveal.take", { amount: sell })} cancelLabel={t("common.cancel")} />}
    </div>
  );
}

/** 숫자를 목표 값까지 짧게 센다. ms 가 0 이면 바로 그 값. */
function useCountTo(target: number, ms: number): number {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (!ms || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { from.current = target; setValue(target); return; }
    const start = performance.now(); const a = from.current; let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / ms); const eased = 1 - Math.pow(1 - k, 3);
      const v = +(a + (target - a) * eased).toFixed(2);
      setValue(v);
      if (k < 1) raf = requestAnimationFrame(tick); else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}
