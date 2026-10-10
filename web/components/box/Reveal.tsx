"use client";
/**
 * 개봉 연출과 결과. 공들인 움직임은 여기에만 쓴다(DESIGN.md 1장).
 * 결과는 열기를 누르는 순간 이미 계산돼 있고(lib/opening), 이 화면은 그것을 있는 그대로 보여 준다.
 * 다른 상품을 스쳐 보이지 않고, 낮은 결과와 높은 결과를 바꿔 보이는 일도 없다. 값의 크기는 색이 아니라 글자 크기로 나타낸다.
 *   연출 약 1.5초(상자가 숨을 들이쉬고 뚜껑이 벌어짐) → 결과. 화면을 누르면 바로 결과.
 *   움직임 줄이기 설정이면 연출 없이 결과만.
 * 결과를 받은 자리에서 끝낸다: 검증은 이 화면 위의 시트, USDT로 받기는 확인창 한 번.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { dropTable, formatRate, sellValueOf, type ProductBox } from "@/lib/products";
import type { OpeningResult } from "@/lib/opening";
import { takeUsdt } from "@/lib/claim";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";
import { useModal } from "@/lib/useModal";
import { Button, ButtonLink, Row, Rows, TextLink } from "@/components/ui/kit";
import { Confirm } from "@/components/ui/Sheet";
import { VerifySheet, type VerifyRecord } from "@/components/flow/VerifySheet";
import { ShipSheet } from "@/components/flow/ShipSheet";

const ANIM_MS = 1500;

export function Reveal({ box, results, cost, onClose, onAgain, againBusy, canAgain }: { box: ProductBox; results: OpeningResult[]; cost: number; onClose: () => void; onAgain: () => void; againBusy: boolean; canAgain: boolean }) {
  const t = useTranslations("v");
  const { itemName } = useProductText();
  const { fmt } = useCurrency();
  const panel = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const [verifying, setVerifying] = useState<VerifyRecord | null>(null);
  const [taking, setTaking] = useState(false);
  const [taken, setTaken] = useState<number | null>(null);
  const [shipping, setShipping] = useState(false);
  const [shipped, setShipped] = useState(false);
  useModal(true, onClose, panel);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setDone(true); return; }
    const timer = window.setTimeout(() => setDone(true), ANIM_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const table = useMemo(() => dropTable(box), [box]);
  const sorted = useMemo(() => [...results].sort((a, b) => b.item.value - a.item.value), [results]);
  const single = results.length === 1 ? results[0] : null;
  const total = results.reduce((sum, r) => sum + r.item.value, 0);
  const again = t("reveal.again", { amount: fmt(cost) });
  const verify = (r: OpeningResult) => setVerifying({ serverSeed: r.serverSeed, serverSeedHash: r.serverSeedHash, clientSeed: r.clientSeed, nonce: r.nonce, roll: r.roll, itemId: r.item.id, table });
  const take = () => {
    if (!single) return;
    const out = takeUsdt([single.ownedId]);
    setTaking(false);
    if (out.ids.length) setTaken(out.totalUsdt);
  };
  const againButton = canAgain ? <Button onClick={onAgain} busy={againBusy} busyLabel={t("box.opening")}>{again}</Button> : <Button onClick={onClose}>{t("common.close")}</Button>;
  const cashLike = single && (single.item.kind === "cash" || taken !== null);

  return (
    <div ref={panel} role="dialog" aria-modal="true" aria-label={t("reveal.results")} tabIndex={-1} className="v-reveal">
      {!done ? (
        <button type="button" className="v-reveal-stage" onClick={() => setDone(true)} aria-label={t("reveal.skip")}>
          <span className="v-lidbox" aria-hidden><span className="v-lidbox-base" /><span className="v-lidbox-lid" /></span>
        </button>
      ) : (
        <>
          <button type="button" className="v-sheet-close" onClick={onClose} aria-label={t("common.close")}><X size={20} aria-hidden /></button>
          <div className="v-reveal-result">
            {single && cashLike && (
              <>
                <div className="v-reveal-head">
                  <div>
                    <h2 className="v-title">{t("reveal.cashTitle", { amount: fmt(taken ?? single.item.value) })}</h2>
                    <p className="v-desc">{t(taken !== null ? "reveal.takenDesc" : "reveal.cashDesc")}</p>
                  </div>
                  <Rows><Row label={t("reveal.odds")}>{formatRate(single.item.dropRate)}</Row></Rows>
                </div>
                <div className="v-reveal-actions">
                  {againButton}
                  <div className="v-links"><TextLink onClick={() => verify(single)}>{t("nav.verify")}</TextLink><TextLink href="/">{t("reveal.boxes")}</TextLink></div>
                </div>
              </>
            )}
            {single && !cashLike && (
              <>
                <div className="v-reveal-head">
                  {single.item.image.src && <div className="v-reveal-photo"><img src={single.item.image.src} alt="" /></div>}
                  <div>
                    <h2 className="v-title">{itemName(single.item)}</h2>
                    <p className="v-reveal-value" data-size={single.item.value >= box.price * 20 ? "lg" : single.item.value < box.price ? "sm" : undefined}>{fmt(single.item.value)}</p>
                    <p className="v-desc">{t(shipped ? "reveal.shippedDesc" : "reveal.itemDesc")}</p>
                  </div>
                  <Rows><Row label={t("reveal.value")}>{fmt(single.item.value)}</Row><Row label={t("reveal.odds")}>{formatRate(single.item.dropRate)}</Row></Rows>
                </div>
                <div className="v-reveal-actions">
                  {shipped ? <ButtonLink href="/inventory">{t("reveal.toInventory")}</ButtonLink>
                    : single.item.kind === "physical" ? <Button onClick={() => setShipping(true)}>{t("reveal.ship")}</Button>
                    : <Button onClick={() => setTaking(true)}>{t("reveal.take", { amount: fmt(sellValueOf(single.item)) })}</Button>}
                  <div className="v-links">{!shipped && single.item.kind === "physical" && <TextLink onClick={() => setTaking(true)}>{t("reveal.take", { amount: fmt(sellValueOf(single.item)) })}</TextLink>}<TextLink onClick={() => verify(single)}>{t("nav.verify")}</TextLink></div>
                </div>
              </>
            )}
            {!single && (
              <>
                <div className="v-reveal-head">
                  <div>
                    <h2 className="v-title">{t("reveal.multiTitle", { n: results.length })}</h2>
                    <p className="v-desc">{t("reveal.multiDesc")}</p>
                  </div>
                  <Rows><Row label={t("reveal.spent")}>{fmt(cost)}</Row><Row label={t("reveal.got")}>{fmt(total)}</Row></Rows>
                  <ul className="v-rows" aria-label={t("reveal.results")}>
                    {sorted.map((r, i) => (
                      <li key={r.ownedId || i} className="v-resultrow" style={{ animationDelay: Math.min(i * 0.1, 1.4) + "s" }}>
                        <button type="button" className="v-row v-row--link v-row--button" onClick={() => verify(r)} aria-label={itemName(r.item) + ", " + t("nav.verify")}><span>{itemName(r.item)}</span><span className="v-num">{fmt(r.item.value)}</span></button>
                      </li>
                    ))}
                  </ul>
                  <p className="v-small">{t("reveal.rowHint")}</p>
                </div>
                <div className="v-reveal-actions">
                  <ButtonLink href="/inventory">{t("reveal.toInventory")}</ButtonLink>
                  <div className="v-links">{canAgain && <TextLink onClick={onAgain}>{again}</TextLink>}<TextLink href="/">{t("reveal.boxes")}</TextLink></div>
                </div>
              </>
            )}
          </div>
        </>
      )}
      <VerifySheet record={verifying} onClose={() => setVerifying(null)} />
      {single && <ShipSheet ownedIds={shipping ? [single.ownedId] : null} onClose={() => setShipping(false)} onDone={() => { setShipping(false); setShipped(true); }} />}
      {single && <Confirm open={taking} onCancel={() => setTaking(false)} onConfirm={take} title={t("reveal.takeTitle")} desc={t("reveal.takeDesc", { name: itemName(single.item), amount: fmt(sellValueOf(single.item)) })} confirmLabel={t("reveal.take", { amount: fmt(sellValueOf(single.item)) })} cancelLabel={t("common.cancel")} />}
    </div>
  );
}
