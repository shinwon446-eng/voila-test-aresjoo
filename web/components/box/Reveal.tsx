"use client";
/**
 * 개봉 연출과 결과. 공들인 움직임은 여기에만 쓴다(DESIGN.md 1장).
 * 결과는 열기를 누르는 순간 이미 계산돼 있고(lib/opening), 이 화면은 그것을 있는 그대로 보여 준다.
 * 다른 상품을 스쳐 보이지 않고, 낮은 결과와 높은 결과를 바꿔 보이는 일도 없다. 값의 크기는 색이 아니라 글자 크기로 나타낸다.
 *   연출 약 1.5초(상자가 숨을 들이쉬고 뚜껑이 벌어짐) → 결과. 화면을 누르면 바로 결과.
 *   움직임 줄이기 설정이면 연출 없이 결과만.
 * 결과를 받은 자리에서 끝낸다: 하나든 여럿이든 여기서 배송 받기, USDT로 받기, 검증. 보관함은 나중에 다시 찾는 목록이다.
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
import { Confirm, Sheet } from "@/components/ui/Sheet";
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
  // 받기 대상: 단일 결과는 그 결과, 여럿이면 목록에서 고른 행
  const [picked, setPicked] = useState<OpeningResult | null>(null);
  const [taking, setTaking] = useState<OpeningResult | null>(null);
  const [shipIds, setShipIds] = useState<string[] | null>(null);
  const [taken, setTaken] = useState<Record<string, number>>({});
  const [shipped, setShipped] = useState<Record<string, true>>({});
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
  // 방금 연 결과라서 지금의 확률표가 곧 구매 당시의 확률표다
  const verify = (r: OpeningResult) => setVerifying({ itemId: r.item.id, fair: { serverSeed: r.serverSeed, serverSeedHash: r.serverSeedHash, clientSeed: r.clientSeed, nonce: r.nonce, roll: r.roll, dropTable: table.map(({ id, dropRate }) => ({ id, dropRate })) } });
  const take = () => {
    if (!taking) return;
    const out = takeUsdt([taking.ownedId]);
    if (out.ids.length) setTaken((m) => ({ ...m, [taking.ownedId]: out.totalUsdt }));
    setTaking(null);
  };
  const againButton = canAgain ? <Button onClick={onAgain} busy={againBusy} busyLabel={t("box.opening")}>{again}</Button> : <Button onClick={onClose}>{t("common.close")}</Button>;
  const settledOf = (r: OpeningResult) => r.item.kind === "cash" || taken[r.ownedId] !== undefined;
  const cashLike = single && settledOf(single);
  const allCash = results.length > 1 && results.every((r) => r.item.kind === "cash");
  // 받기 행동 묶음. 단일 결과 화면과 여럿 결과의 상품 시트가 같은 것을 쓴다
  const actionsFor = (r: OpeningResult) => {
    const amount = fmt(sellValueOf(r.item));
    if (shipped[r.ownedId]) return { main: <ButtonLink href="/inventory">{t("reveal.toInventory")}</ButtonLink>, links: [<TextLink key="v" onClick={() => verify(r)}>{t("nav.verify")}</TextLink>] };
    if (r.item.kind === "physical") return { main: <Button onClick={() => setShipIds([r.ownedId])}>{t("reveal.ship")}</Button>, links: [<TextLink key="t" onClick={() => setTaking(r)}>{t("reveal.take", { amount })}</TextLink>, <TextLink key="v" onClick={() => verify(r)}>{t("nav.verify")}</TextLink>] };
    return { main: <Button onClick={() => setTaking(r)}>{t("reveal.take", { amount })}</Button>, links: [<TextLink key="v" onClick={() => verify(r)}>{t("nav.verify")}</TextLink>] };
  };

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
                    <h2 className="v-title">{t("reveal.cashTitle", { amount: fmt(taken[single.ownedId] ?? single.item.value) })}</h2>
                    <p className="v-desc">{t(taken[single.ownedId] !== undefined ? "reveal.takenDesc" : "reveal.cashDesc")}</p>
                  </div>
                  <Rows><Row label={t("reveal.odds")}>{formatRate(single.item.dropRate)}</Row></Rows>
                </div>
                <div className="v-reveal-actions">
                  {againButton}
                  <div className="v-links"><TextLink onClick={() => verify(single)}>{t("nav.verify")}</TextLink><TextLink href="/">{t("reveal.boxes")}</TextLink></div>
                </div>
              </>
            )}
            {single && !cashLike && (() => { const a = actionsFor(single); return (
              <>
                <div className="v-reveal-head">
                  {single.item.image.src && <div className="v-reveal-photo"><img src={single.item.image.src} alt="" /></div>}
                  <div>
                    <h2 className="v-title">{itemName(single.item)}</h2>
                    <p className="v-reveal-value" data-size={single.item.value >= box.price * 20 ? "lg" : single.item.value < box.price ? "sm" : undefined}>{fmt(single.item.value)}</p>
                    <p className="v-desc">{t(shipped[single.ownedId] ? "reveal.shippedDesc" : "reveal.itemDesc")}</p>
                  </div>
                  {/* 큰 숫자가 시중 정가다. 같은 값을 행으로 또 찍지 않는다 */}
                  <Rows><Row label={t("reveal.odds")}>{formatRate(single.item.dropRate)}</Row></Rows>
                </div>
                <div className="v-reveal-actions">
                  {a.main}
                  <div className="v-links">{a.links}</div>
                </div>
              </>
            ); })()}
            {!single && (
              <>
                <div className="v-reveal-head">
                  <div>
                    {/* 전부 USDT 상품이면 이미 잔액에 들어왔다. 보관함으로 보내지 않는다 */}
                    <h2 className="v-title">{allCash ? t("reveal.cashTitle", { amount: fmt(total) }) : t("reveal.multiTitle", { n: results.length })}</h2>
                    <p className="v-desc">{t(allCash ? "reveal.cashDesc" : "reveal.multiDesc")}</p>
                  </div>
                  <Rows><Row label={t("reveal.spent")}>{fmt(cost)}</Row><Row label={t("reveal.got")}>{fmt(total)}</Row></Rows>
                  <ul className="v-rows" aria-label={t("reveal.results")}>
                    {sorted.map((r, i) => (
                      <li key={r.ownedId || i} className="v-resultrow" style={{ animationDelay: Math.min(i * 0.1, 1.4) + "s" }}>
                        <button type="button" className="v-row v-row--link v-row--button" onClick={() => (settledOf(r) ? verify(r) : setPicked(r))} aria-label={itemName(r.item) + ", " + (settledOf(r) ? t("nav.verify") : t("reveal.receive"))}>
                          <span>{itemName(r.item)}{shipped[r.ownedId] ? ", " + t("reveal.shippedTag") : taken[r.ownedId] !== undefined ? ", " + t("reveal.takenTag") : ""}</span>
                          <span className="v-num">{fmt(r.item.value)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="v-small">{t(allCash ? "reveal.rowHint" : "reveal.rowHintReceive")}</p>
                </div>
                <div className="v-reveal-actions">
                  {allCash ? againButton : <ButtonLink href="/inventory">{t("reveal.toInventory")}</ButtonLink>}
                  <div className="v-links">{!allCash && canAgain && <TextLink onClick={() => { if (!againBusy) onAgain(); }}>{again}</TextLink>}<TextLink href="/">{t("reveal.boxes")}</TextLink></div>
                </div>
              </>
            )}
          </div>
        </>
      )}
      {/* 여럿 가운데 고른 상품: 결과 자리에서 바로 받는다 */}
      <Sheet open={!!picked && !taking && !shipIds && !verifying} onClose={() => setPicked(null)} title={picked ? itemName(picked.item) : ""} closeLabel={t("common.close")}>
        {picked && (() => { const a = actionsFor(picked); return (
          <>
            {picked.item.image.src && <div className="v-sheet-photo"><img src={picked.item.image.src} alt="" /></div>}
            <Rows><Row label={t("reveal.value")}>{fmt(picked.item.value)}</Row><Row label={t("reveal.odds")}>{formatRate(picked.item.dropRate)}</Row></Rows>
            {taken[picked.ownedId] !== undefined ? <p className="v-body">{t("reveal.takenDesc")}</p> : a.main}
            <div className="v-links">{taken[picked.ownedId] !== undefined ? <TextLink onClick={() => verify(picked)}>{t("nav.verify")}</TextLink> : a.links}</div>
          </>
        ); })()}
      </Sheet>
      <VerifySheet record={verifying} onClose={() => setVerifying(null)} />
      <ShipSheet ownedIds={shipIds} onClose={() => setShipIds(null)} onDone={() => { for (const id of shipIds ?? []) setShipped((m) => ({ ...m, [id]: true })); setShipIds(null); setPicked(null); }} />
      {taking && <Confirm open onCancel={() => setTaking(null)} onConfirm={take} title={t("reveal.takeTitle")} desc={t("reveal.takeDesc", { name: itemName(taking.item), amount: fmt(sellValueOf(taking.item)) })} confirmLabel={t("reveal.take", { amount: fmt(sellValueOf(taking.item)) })} cancelLabel={t("common.cancel")} />}
    </div>
  );
}
