"use client";
/**
 * USDT로 받기 선택 시트. 결정 하나: 어느 상품을 USDT 로 받을지.
 * 보관 중인 상품을 골라 한 번에 받는다. 결과 화면, 잔액이 모자란 자리, 보관함, 잔액 시트, 출금 화면이 전부 이 부품을 연다.
 *   고르기 → 확인 한 번(되돌릴 수 없다) → 결과 한 줄
 * 범위는 부른 쪽이 준다: ids 를 주면 그 상품만(방금 나온 것), 주지 않으면 보관 중인 상품 전부.
 * 처음에는 아무것도 고르지 않았다. 여러 개 결과만 preselect 로 방금 나온 것을 미리 고른 채 연다(사람이 뺄 수 있다, flow/MELT_SPEC.md R4).
 * 받은 뒤의 다음 행동은 부른 쪽이 정한다. 이 시트는 다음 개봉을 실행하지 않는다.
 * 금액은 lib/takeBatch 가 계산한다(상품마다 참고가의 95%, 기존 식 그대로). 받는 일도 거기서 잠금을 걸고 한 번만 하고,
 * 저장된 장부를 다시 읽어 받은 것, 받지 못한 것, 알 수 없는 것을 나눠 답한다. 이 시트는 그 셋을 따로 말한다(R8).
 *
 * TakeConfirm 은 받기의 확인창 하나다. 한 개 받기(결과 화면, 여러 개 결과의 상품 상세, 보관함의 상품 상세)도 이것을 쓴다(R10).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { REFUND_RATE } from "@/lib/products";
import { productOf } from "@/lib/vault";
import { heldForTake, mergeOutcomes, reviewTakeMarks, settleTakeMany, takeAmountOf, takeLedgerOf, takeQuote, type BatchOutcome, type TakeLedger } from "@/lib/takeBatch";
import { reviewUpgradeMarks } from "@/lib/upgradeSettle";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";
import { useAuthStore } from "@/stores/authStore";
import { useInventoryStore, type OwnedItem } from "@/stores/inventoryStore";
import { useWalletStore } from "@/stores/walletStore";
import { Confirm, Sheet } from "@/components/ui/Sheet";
import { Button, Empty, Line, Skeleton, TextLink } from "@/components/ui/kit";

type Step = "pick" | "confirm" | "result";

/**
 * 받기가 확정됐는지를 보는 판정 자료(lib/takeBatch 의 takeStateOf 에 넘긴다): 지갑의 받기 거래 기록과 확인 대기 표시.
 * 받는 일, 미리 보는 금액, 보관함과 결과 화면의 상태 표시가 같은 기준을 쓰게 한다.
 * 화면이 보는 거래 기록은 기억 속의 것이라, 확인 대기 표시가 남은 상품은 기억 속 기록이 뭐라고 하든 "확인 필요"로 보인다.
 * 장부가 바뀔 때(거래 기록이나 보관함이 바뀔 때)마다 다시 읽는다. 받는 일은 끝날 때 두 스토어를 저장된 장부에 맞추므로 표시도 함께 새로 읽힌다.
 * 화면이 뜰 때와 창으로 돌아올 때 남은 표시를 다시 보고(끝이 확인된 것은 지운다) 기억 속 장부를 저장된 장부에 맞춘다. 돈은 움직이지 않는다.
 */
export function useTakeLedger(): TakeLedger {
  const transactions = useWalletStore((s) => s.transactions);
  const items = useInventoryStore((s) => s.items);
  useEffect(() => {
    // 업그레이드의 확인 대기 표시도 같은 때에 다시 본다(lib/upgradeSettle)
    const review = () => { if (document.visibilityState !== "hidden") { void reviewTakeMarks(); void reviewUpgradeMarks(); } };
    review();
    window.addEventListener("focus", review);
    document.addEventListener("visibilitychange", review);
    return () => { window.removeEventListener("focus", review); document.removeEventListener("visibilitychange", review); };
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => takeLedgerOf(transactions), [transactions, items]);
}

/** USDT로 받기의 확인창. 받으면 배송으로 바꿀 수 없다. 되돌릴 수 없는 행동이라 확인을 한 번 거친다 */
export function TakeConfirm({ open, amountUsdt, onCancel, onConfirm, busy }: { open: boolean; amountUsdt: number; onCancel: () => void; onConfirm: () => void; busy?: boolean }) {
  const t = useTranslations("v");
  const { fmt } = useCurrency();
  const amount = fmt(amountUsdt);
  return <Confirm open={open} onCancel={onCancel} onConfirm={onConfirm} busy={busy} busyLabel={t("common.checking")} title={t("take.title")} desc={t("take.confirmDesc", { amount })} confirmLabel={t("reveal.take", { amount })} cancelLabel={t("common.cancel")} />;
}

export function TakeSheet({ open, ids, preselect, onClose, onTaken, doneLabel }: {
  open: boolean;
  /** 이 상품만 보여 준다(방금 나온 것). 없으면 보관 중인 상품 전부 */
  ids?: string[];
  /** 열 때 미리 골라 둘 상품. 주지 않으면 아무것도 고르지 않은 채로 연다 */
  preselect?: string[];
  onClose: () => void;
  /** 잔액에 들어온 것이 있을 때마다 불린다. 이 시트를 연 뒤 받은 것을 모두 합친 결과다(다시 시도한 것 포함) */
  onTaken?: (outcome: BatchOutcome) => void;
  /** 다 받은 뒤의 주 단추 글. 부른 쪽으로 돌아간다 */
  doneLabel?: string;
}) {
  const t = useTranslations("v");
  const { fmt } = useCurrency();
  const { itemName } = useProductText();
  const accountId = useAuthStore((s) => s.user?.id ?? null);
  const items = useInventoryStore((s) => s.items);
  const hydrated = useInventoryStore((s) => s.hydrated);
  const ledger = useTakeLedger();
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const [step, setStep] = useState<Step>("pick");
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<BatchOutcome | null>(null);
  // 확인 단계에 있는 동안 고른 것이 전부 다른 곳(다른 탭)에서 처리됐다. 여기서는 돈이 움직이지 않았다
  const [gone, setGone] = useState(false);
  // 상태(busy)는 다음 그리기에야 바뀐다. 같은 순간에 두 번 눌려도 요청이 한 번만 나가게 동기 잠금을 둔다
  const lock = useRef(false);
  const total = useRef<BatchOutcome | null>(null);
  // 요청 세대: 시트를 다시 열었거나 계정이 바뀐 뒤에 돌아온 옛 응답을 이 화면에 적용하지 않는다
  const generation = useRef(0);
  const preselectRef = useRef(preselect); preselectRef.current = preselect;

  // 열 때마다 처음 상태로(닫을 때도 비워 두어, 다시 열 때 지난 결과가 비치지 않게 한다). 계정이 바뀌어도 고른 것과 결과를 비운다
  useEffect(() => {
    setPicked(new Set(open ? preselectRef.current ?? [] : [])); setStep("pick"); setOutcome(null); setBusy(false); setGone(false);
    lock.current = false; total.current = null; generation.current += 1;
    // 열 때 남은 확인 대기 표시를 다시 본다(아무것도 들어오지 않은 것이 확인된 상품은 다시 고를 수 있게 된다)
    if (open) void reviewTakeMarks();
  }, [open, accountId]);

  const scopeKey = ids ? ids.join(",") : null;
  const candidates = useMemo(() => {
    // 받는 일과 같은 기준으로 고른다. 확인되지 않은 상품(받은 상태인데 입금 내역이 없거나, 보관 중인데 입금 내역이 있는 것)은 목록에 없다
    const held = heldForTake(items, ledger);
    if (scopeKey === null) return held;
    const scope = new Set(scopeKey.split(","));
    // 방금 나온 것은 값이 큰 순서로(결과 목록과 같은 순서)
    return held.filter((item) => scope.has(item.id)).sort((a, b) => b.valueUsdt - a.valueUsdt);
  }, [items, ledger, scopeKey]);
  // 고른 뒤에 다른 탭에서 상태가 바뀐 상품은 여기서 빠진다(금액도 함께 줄어든다)
  const selected = useMemo(() => candidates.filter((item) => picked.has(item.id)), [candidates, picked]);
  const quote = useMemo(() => takeQuote(selected, ledger), [selected, ledger]);
  const all = candidates.length > 0 && selected.length === candidates.length;
  const nameOf = (item: OwnedItem) => { const p = productOf(item); return p ? itemName(p) : item.itemId; };
  const byId = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const toggle = (id: string) => setPicked((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const toggleAll = () => setPicked(all ? new Set() : new Set(candidates.map((item) => item.id)));

  // 확인창이 떠 있는 동안 고른 것이 전부 사라지면 결과 단계로 넘어가 알린다. 받기를 스스로 실행하지는 않는다
  useEffect(() => {
    if (open && step === "confirm" && !busy && !lock.current && selected.length === 0) { setGone(true); setStep("result"); }
  }, [open, step, busy, selected.length]);

  const run = async (target: string[]) => {
    if (lock.current) return;
    if (!target.length) { setGone(true); setStep("result"); return; }
    lock.current = true; setBusy(true);
    const mine = generation.current; const requester = accountId;
    let out: BatchOutcome;
    // 응답을 받지 못했으면 받은 것도 받지 못한 것도 단정하지 않는다
    try { out = await settleTakeMany(target); }
    catch { out = { status: "unknown", taken: [], already: [], left: [], unknown: target, amountUsdt: 0, toCrypto: 0, toCard: 0 }; }
    // 기다리는 동안 계정이 바뀌었거나 시트가 새로 열렸으면 이 응답은 버린다(새 화면에 옛 결과를 넣지 않는다)
    if (generation.current !== mine || (useAuthStore.getState().user?.id ?? null) !== requester) return;
    const merged = mergeOutcomes(total.current, out);
    total.current = merged;
    lock.current = false; setBusy(false);
    setOutcome(merged); setStep("result");
    if (out.taken.length || out.already.length) onTaken?.(merged);
  };

  // 다시 시도할 수 있는 것: 받지 못한 상품 가운데 아직 보관 중인 것. 알 수 없는 상품은 다시 시도하지 않는다
  const retryIds = outcome ? outcome.left.filter((id) => byId.get(id)?.status === "IN_STORAGE") : [];
  const back = doneLabel ?? t("common.close");
  const groups = outcome ? [outcome.taken.length > 0, outcome.left.length > 0, outcome.unknown.length > 0].filter(Boolean).length : 0;
  const rowOf = (id: string, value: string) => { const item = byId.get(id); return <li key={id} className="v-row"><span>{item ? nameOf(item) : id}</span><span className="v-num">{value}</span></li>; };
  const refOf = (id: string) => { const item = byId.get(id); return item ? t("take.ref", { amount: fmt(item.valueUsdt) }) : ""; };

  return (
    <>
      <Sheet open={open && step === "pick"} onClose={onClose} title={t("take.title")} desc={t("take.desc", { pct: Math.round(REFUND_RATE * 100) })} closeLabel={t("common.close")}>
        {!hydrated ? (
          <>
            {/* 보관함을 불러오기 전에는 빈 목록이라고 말하지 않는다 */}
            <Skeleton height={144} label={t("common.loading")} />
            <Button disabled>{t("common.loading")}</Button>
          </>
        ) : candidates.length === 0 ? (
          <>
            <Empty>{t("take.empty")}</Empty>
            <Button onClick={onClose}>{back}</Button>
          </>
        ) : (
          <>
            <ul className="v-itemrows" aria-label={t("take.title")}>
              {/* 목록 카드의 머리 행: 전체 선택 */}
              <li>
                <button type="button" role="checkbox" aria-checked={all ? true : selected.length > 0 ? "mixed" : false} data-take-all className="v-itemrow v-take-all" onClick={toggleAll}>
                  <span className="v-check" aria-hidden>{all ? <Check size={16} /> : selected.length > 0 ? <Minus size={16} /> : null}</span>
                  <span className="v-itemrow-body">{t("take.selectAll")}</span>
                  <span className="v-small v-num" aria-hidden>{selected.length} / {candidates.length}</span>
                </button>
              </li>
              {candidates.map((item) => {
                const p = productOf(item);
                const on = picked.has(item.id);
                return (
                  <li key={item.id}>
                    <button type="button" role="checkbox" aria-checked={on} data-take-row className="v-itemrow" onClick={() => toggle(item.id)}>
                      <span className="v-check" aria-hidden>{on && <Check size={16} />}</span>
                      {p?.image.src && <span className="v-itemrow-photo"><img src={p.image.src} alt="" loading="lazy" decoding="async" /></span>}
                      <span className="v-itemrow-body"><span className="v-card-title">{nameOf(item)}</span><span className="v-small">{t("take.ref", { amount: fmt(item.valueUsdt) })}</span></span>
                      <span className="v-num">{fmt(takeAmountOf(item))}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="v-take-foot">
              {/* 카드로 충전한 몫이 섞여 있을 때만 */}
              {quote.toCard > 0 && <p className="v-small">{t("take.cardNote", { amount: fmt(quote.toCard) })}</p>}
              <Button data-take-submit onClick={() => setStep("confirm")} disabled={selected.length === 0}>{selected.length === 0 ? t("take.pick") : t("take.submit", { n: selected.length, amount: fmt(quote.totalUsdt) })}</Button>
            </div>
          </>
        )}
      </Sheet>

      <TakeConfirm open={open && step === "confirm"} amountUsdt={quote.totalUsdt} onCancel={() => setStep("pick")} onConfirm={() => void run(selected.map((item) => item.id))} busy={busy} />

      <Sheet open={open && step === "result"} onClose={onClose} title={t("take.title")} closeLabel={t("common.close")} locked={busy}>
        {gone && !outcome && (
          <>
            <Line>{t("take.changed")}</Line>
            <Button data-take-done onClick={onClose}>{back}</Button>
          </>
        )}
        {outcome && (
          <>
            {outcome.taken.length > 0 && <Line>{t("take.done", { amount: fmt(outcome.amountUsdt) })}</Line>}
            {outcome.taken.length > 0 && outcome.toCard > 0 && <p className="v-small">{t("take.cardNote", { amount: fmt(outcome.toCard) })}</p>}
            {outcome.taken.length === 0 && outcome.already.length > 0 && <Line>{t("take.already")}</Line>}
            {outcome.status === "pending" && <Line>{t("op.pending")}</Line>}
            {/* 알 수 없는 것은 받았다고도, 보관함에 있다고도 말하지 않는다. 다시 시도 단추도 주지 않는다 */}
            {outcome.unknown.length > 0 && <Line fail>{t("take.unknown")}</Line>}
            {outcome.status === "failed" && <Line fail>{t("take.failed")}</Line>}
            {outcome.status !== "failed" && outcome.status !== "pending" && outcome.left.length > 0 && <Line fail>{t("take.leftLine", { n: outcome.left.length })}</Line>}
            {/* 일부만 됐으면 받은 것, 남은 것, 확인하지 못한 것을 나눠 보여 준다 */}
            {groups > 1 && outcome.taken.length > 0 && (
              <div className="v-stack v-stack--sm">
                <p className="v-small">{t("take.takenGroup", { n: outcome.taken.length })}</p>
                <ul className="v-rows">{outcome.taken.map((x) => rowOf(x.id, fmt(x.amountUsdt)))}</ul>
              </div>
            )}
            {groups > 1 && outcome.left.length > 0 && (
              <div className="v-stack v-stack--sm">
                <p className="v-small">{t("take.leftGroup", { n: outcome.left.length })}</p>
                <ul className="v-rows">{outcome.left.map((id) => rowOf(id, refOf(id)))}</ul>
              </div>
            )}
            {groups > 1 && outcome.unknown.length > 0 && (
              <div className="v-stack v-stack--sm">
                <p className="v-small">{t("take.unknownGroup", { n: outcome.unknown.length })}</p>
                <ul className="v-rows">{outcome.unknown.map((id) => rowOf(id, refOf(id)))}</ul>
              </div>
            )}
            {outcome.status !== "settled" && retryIds.length > 0
              ? <Button data-take-retry onClick={() => void run(retryIds)} busy={busy} busyLabel={t("common.checking")}>{t(outcome.status === "pending" ? "op.recheck" : "take.retry")}</Button>
              : <Button data-take-done onClick={onClose}>{back}</Button>}
            {/* 확인하지 못한 것이 있으면 보관함과 지갑 내역으로 가는 길을 준다. 그 밖에 다시 시도가 주 단추일 때는 돌아가기 하나 */}
            {outcome.unknown.length > 0
              ? <div className="v-links"><TextLink href="/inventory" onClick={onClose}>{t("nav.inventory")}</TextLink><TextLink href="/wallet" onClick={onClose}>{t("balanceSheet.history")}</TextLink></div>
              : outcome.status !== "settled" && retryIds.length > 0 && <div className="v-links"><TextLink onClick={() => { if (!busy) onClose(); }}>{back}</TextLink></div>}
          </>
        )}
      </Sheet>
    </>
  );
}
