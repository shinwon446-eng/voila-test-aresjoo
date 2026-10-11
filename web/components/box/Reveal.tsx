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
import { settleTake } from "@/lib/openingSettle";
import { OPENING_ARM_DELAY_MS, openingChange, timesOf } from "@/lib/openingFlow";
import { OpeningBox } from "@/components/box/Opening";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";
import { useModal } from "@/lib/useModal";
import { useWalletStore } from "@/stores/walletStore";
import { Button, ButtonLink, Line, Row, Rows, TextLink } from "@/components/ui/kit";
import { Confirm, Sheet } from "@/components/ui/Sheet";
import { VerifySheet, type VerifyRecord } from "@/components/flow/VerifySheet";
import { ShipSheet } from "@/components/flow/ShipSheet";

/** 여러 개를 열 때의 연출: 한 개 열기와 같은 상자, 같은 길이(lib/openingFlow 의 기본값). 결과의 크기와 무관하다. */
const STAGE = { anticipation: 520, impact: 150, exit: 170 };

export function Reveal({ box, results, cost, recovered, initialTaken, initialShipped, onClose, onAgain, againBusy, canAgain, onRevealed, onSkip }: {
  box: ProductBox; results: OpeningResult[]; cost: number;
  /** 못 보고 떠났다가 다시 보는 결과. 새로 뽑지 않았으므로 연출 없이 바로 보여 준다 */
  recovered?: boolean;
  /** 다시 보는 결과 가운데 이미 USDT 로 받았거나 배송을 신청한 상품(보관함 기록 그대로) */
  initialTaken?: Record<string, number>; initialShipped?: Record<string, true>;
  onClose: () => void; onAgain: () => void; againBusy: boolean; canAgain: boolean;
  /** 결과가 화면에 보인 순간 한 번(기록장에 "봤음"을 남기고 다음 구매를 받을 수 있게 한다) */
  onRevealed?: () => void; onSkip?: () => void;
}) {
  const t = useTranslations("v");
  const { itemName } = useProductText();
  const { fmt } = useCurrency();
  const panel = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(!!recovered);
  // 결과가 뜬 직후에는 아래 단추가 눌리지 않는다(건너뛰려던 입력이 다음 구매가 되지 않게)
  const [armed, setArmed] = useState(false);
  const [stage, setStage] = useState<"anticipation" | "impact" | "exit">("anticipation");
  const balance = useWalletStore((s) => s.balance);
  const [verifying, setVerifying] = useState<VerifyRecord | null>(null);
  // 받기 대상: 단일 결과는 그 결과, 여럿이면 목록에서 고른 행
  const [picked, setPicked] = useState<OpeningResult | null>(null);
  const [taking, setTaking] = useState<OpeningResult | null>(null);
  const [shipIds, setShipIds] = useState<string[] | null>(null);
  const [taken, setTaken] = useState<Record<string, number>>(initialTaken ?? {});
  const [shipped, setShipped] = useState<Record<string, true>>(initialShipped ?? {});
  const skip = () => { onSkip?.(); setDone(true); };
  // 다음 구매를 처리하는 동안에는 닫히지 않는다. 연출 중 Esc 는 닫기가 아니라 결과 바로 보기다
  const close = () => { if (!againBusy) onClose(); };
  useModal(true, () => { if (!done) skip(); else if (armed) close(); }, panel);
  useEffect(() => {
    if (!done) return;
    onRevealed?.();
    panel.current?.focus({ preventScroll: true });
    const arm = window.setTimeout(() => setArmed(true), OPENING_ARM_DELAY_MS);
    return () => window.clearTimeout(arm);
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (recovered) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setDone(true); return; }
    const timers = [
      window.setTimeout(() => setStage("impact"), STAGE.anticipation),
      window.setTimeout(() => setStage("exit"), STAGE.anticipation + STAGE.impact),
      window.setTimeout(() => setDone(true), STAGE.anticipation + STAGE.impact + STAGE.exit),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  const table = useMemo(() => dropTable(box), [box]);
  const sorted = useMemo(() => [...results].sort((a, b) => b.item.value - a.item.value), [results]);
  // 목록: 상품은 하나씩, 같은 금액의 USDT 결과는 한 줄로 묶는다(100개를 열면 같은 줄이 수십 번 나온다)
  const lines = useMemo(() => {
    const out: { r: OpeningResult; count: number }[] = [];
    for (const r of sorted) {
      const last = out[out.length - 1];
      if (r.item.kind === "cash" && last && last.r.item.id === r.item.id) last.count += 1;
      else out.push({ r, count: 1 });
    }
    return out;
  }, [sorted]);
  // 가장 큰 결과 하나. 한 번 여는 값의 두 배가 안 되면 내세우지 않는다
  const best = sorted.length > 1 && timesOf(sorted[0].item.value, box.price) !== null ? sorted[0] : null;
  const single = results.length === 1 ? results[0] : null;
  const total = results.reduce((sum, r) => sum + r.item.value, 0);
  const again = t("reveal.again", { amount: fmt(cost) });
  // 이번 개봉의 영수증: 잔액에 들어온 것(USDT 결과 + USDT 로 받은 상품의 실제 수령액)과 아직 상품으로 있는 것을 나눈다.
  // 지갑 잔액의 앞뒤를 빼지 않는다(다른 거래가 섞이지 않게).
  const credited = results.map((r) => (r.item.kind === "cash" ? r.item.value : taken[r.ownedId] ?? 0));
  const creditedSum = +credited.reduce((sum, v) => sum + v, 0).toFixed(2);
  const kept = results.filter((r) => r.item.kind !== "cash" && taken[r.ownedId] === undefined);
  const keptRef = +kept.reduce((sum, r) => sum + r.item.value, 0).toFixed(2);
  const waiting = kept.filter((r) => !shipped[r.ownedId]);
  const change = openingChange(cost, credited).diff;
  // 방금 연 결과라서 지금의 확률표가 곧 구매 당시의 확률표다
  const verify = (r: OpeningResult) => setVerifying({ itemId: r.item.id, fair: { serverSeed: r.serverSeed, serverSeedHash: r.serverSeedHash, clientSeed: r.clientSeed, nonce: r.nonce, roll: r.roll, dropTable: table.map(({ id, dropRate }) => ({ id, dropRate })) } });
  const [takeFailed, setTakeFailed] = useState(false);
  const take = async () => {
    if (!taking) return;
    const target = taking; setTaking(null); setTakeFailed(false);
    const out = await settleTake(target.ownedId);
    // 받았으면 시트를 닫고 결과 목록으로 돌아간다(요약과 그 행이 바뀐 것이 곧 확인이다)
    if (out.status === "settled") { setTaken((m) => ({ ...m, [target.ownedId]: out.amountUsdt })); setPicked(null); }
    else setTakeFailed(true);
  };
  const againButton = canAgain ? <Button data-open-again onClick={onAgain} busy={againBusy} busyLabel={t("box.opening")} disabled={!armed}>{again}</Button> : <Button onClick={close} disabled={!armed}>{t("common.close")}</Button>;
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
        <div className="v-reveal-solo">
          <div className="v-op-scene" data-phase={stage}>
            <span className="v-op-floor" aria-hidden />
            <OpeningBox />
            <p className="v-reveal-count">{t("op.multiOpening", { n: results.length })}</p>
          </div>
          <div className="v-op-skip"><TextLink onClick={skip}>{t("op.skip")}</TextLink></div>
        </div>
      ) : (
        <>
          <button type="button" className="v-sheet-close" onClick={() => { if (armed) close(); }} disabled={againBusy} aria-label={t("common.close")}><X size={20} aria-hidden /></button>
          {!single && <div className="v-reveal-top"><span className="v-op-balance v-num">{t("op.balance", { amount: fmt(balance) })}</span></div>}
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
                  {best && (
                    <div className="v-best">
                      {best.item.image.src && <span className="v-best-photo"><img src={best.item.image.src} alt="" /></span>}
                      <span className="v-best-body">
                        <span className="v-small">{t("op.best")}</span>
                        <span className="v-best-name">{best.item.kind === "cash" ? fmt(best.item.value) : itemName(best.item)}</span>
                        <span className="v-small v-num">{best.item.kind === "cash" ? "" : t("op.refLine", { amount: fmt(best.item.value) }) + ", "}{t("op.timesShort", { n: timesOf(best.item.value, box.price) })}</span>
                      </span>
                    </div>
                  )}
                  {/* 쓴 것, 잔액에 들어온 것, 아직 상품으로 있는 것, 그래서 잔액이 달라진 만큼을 따로 적는다 */}
                  <Rows>
                    <Row label={t("reveal.spent")}>{fmt(cost)}</Row>
                    <Row label={t("op.creditedSum")}>{fmt(creditedSum)}</Row>
                    {kept.length > 0 && <Row label={t("op.keptSum", { n: kept.length })}>{fmt(keptRef)}</Row>}
                    <Row label={t("op.changeLabel")}>{change < 0 ? t("op.changeDown", { diff: fmt(Math.abs(change)) }) : change > 0 ? t("op.changeUp", { diff: fmt(change) }) : t("op.changeSame")}</Row>
                  </Rows>
                  {takeFailed && <Line fail>{t("op.failed")}</Line>}
                  <ul className="v-rows" aria-label={t("reveal.results")}>
                    {lines.map(({ r, count }, i) => {
                      const state = r.item.kind === "cash" ? t("op.tagCash") : shipped[r.ownedId] ? t("reveal.shippedTag") : taken[r.ownedId] !== undefined ? t("reveal.takenTag") : t("op.tagKept");
                      const open = r.item.kind !== "cash" && !shipped[r.ownedId] && taken[r.ownedId] === undefined;
                      const times = timesOf(r.item.value, box.price);
                      const label = <span>{itemName(r.item)}<span className="v-small">, {state}{times !== null ? ", " + t("op.timesShort", { n: times }) : ""}{count > 1 ? ", " + t("op.countTimes", { n: count }) : ""}</span></span>;
                      return (
                        <li key={r.ownedId || i} className="v-resultrow" style={{ animationDelay: Math.min(i * 0.06, 0.6) + "s" }}>
                          {count > 1 ? (
                            <div className="v-row">{label}<span className="v-num">{fmt(r.item.value)}</span></div>
                          ) : (
                            <button type="button" className="v-row v-row--link v-row--button" onClick={() => { if (!armed) return; if (open) setPicked(r); else verify(r); }} aria-label={itemName(r.item) + ", " + state}>
                              {label}
                              <span className="v-num">{fmt(taken[r.ownedId] ?? r.item.value)}{open ? " ›" : ""}</span>
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="v-reveal-actions">
                  {/* 받을 상품이 남아 있으면 그것부터 이 자리에서 받는다. 다 받았으면 한 번 더 열기 */}
                  {waiting.length > 0 ? <Button onClick={() => setPicked(waiting[0])} disabled={!armed}>{t("op.receiveNext", { n: waiting.length })}</Button> : againButton}
                  <div className="v-links">{waiting.length > 0 && canAgain && <TextLink onClick={() => { if (armed && !againBusy) onAgain(); }}>{again}</TextLink>}<TextLink onClick={() => { if (armed) close(); }}>{t("op.backToBox")}</TextLink></div>
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
