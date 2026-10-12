"use client";
/**
 * 지갑. 결정 하나: 충전할지. 출금은 밑줄 링크로 따로 간다.
 * 위에는 잔액 행, 아래에는 내역 행 목록. 내역을 누르면 그 거래의 시트가 열린다.
 * 출금 상태 동기화와 72시간 대기 건 취소는 옛 내역 화면의 순서 그대로다(서비스가 준 상태만 반영한다).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useWalletStore, type Transaction } from "@/stores/walletStore";
import { useAuthStore } from "@/stores/authStore";
import { useFlow } from "@/stores/flowStore";
import { api } from "@/lib/api";
import { accountTransactions } from "@/lib/browserWallet";
import { EXPLORERS, explorerTxUrl } from "@/lib/withdrawal";
import { holdCountdown } from "@/lib/withdrawHold";
import type { Network } from "@/lib/depositAddress";
import { useCurrency } from "@/lib/useCurrency";
import { Button, Empty, Line, Row, Rows, ScreenHead, Skeleton, TextLink } from "@/components/ui/kit";
import { Confirm, Sheet } from "@/components/ui/Sheet";

const PAGE = 30;
const OPEN_STATUSES = ["PENDING", "PENDING_ADMIN_REVIEW", "PENDING_72H_HOLD", "BROADCASTING"];

export function WalletScreen() {
  const t = useTranslations("v");
  const locale = useLocale();
  const { fmt } = useCurrency();
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.hydrated);
  const openLogin = useAuthStore((s) => s.openAuthModal);
  const hydrated = useWalletStore((s) => s.hydrated);
  const cryptoBalance = useWalletStore((s) => s.cryptoBalance);
  const cardBalance = useWalletStore((s) => s.cardBalance);
  const transactions = useWalletStore((s) => s.transactions);
  const openCharge = useFlow((s) => s.openCharge);
  const [shown, setShown] = useState(PAGE);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cancelFailed, setCancelFailed] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const cancelLock = useRef(false);

  // 처리 중인 출금의 상태를 서비스에서 받아 온다(10초마다, 옛 화면과 같다)
  useEffect(() => {
    if (!user) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      const pending = useWalletStore.getState().transactions.filter((x) => x.accountId === user.id && x.type === "withdraw" && x.serverId && !["COMPLETED", "CANCELLED", "FAILED"].includes(x.status ?? ""));
      for (const tx of pending) {
        if (!active) return;
        try {
          const result = await api.withdrawStatus(tx.serverId!);
          if (!active || useAuthStore.getState().user?.id !== user.id || result.id !== tx.serverId) return;
          useWalletStore.getState().syncWithdrawal(tx.id, result.status, { txHash: result.txHash, unlockAt: result.unlockAt });
        } catch { /* 연결이 끊긴 동안에는 마지막으로 확인된 상태를 그대로 둔다 */ }
      }
      if (active) timer = setTimeout(poll, 10000);
    };
    void poll();
    return () => { active = false; clearTimeout(timer); };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // 남은 대기 시간은 화면이 뜬 뒤에만 흐른다
  useEffect(() => { setNow(Date.now()); const id = window.setInterval(() => setNow(Date.now()), 60000); return () => window.clearInterval(id); }, []);

  // 이 계정의 장부에 든 거래는 계정 번호가 없어도 보여 준다(박스 열기와 USDT로 받기는 번호 없이 적힌다). 다른 계정의 것은 섞이지 않는다
  const rows = useMemo(() => (user ? accountTransactions(transactions, user.id) : []).sort((a, b) => Date.parse(b.at) - Date.parse(a.at)), [transactions, user]);
  const current = rows.find((x) => x.id === openId) ?? null;
  const date = (value: string) => new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  const kind = (tx: Transaction) => t("wallet.type." + tx.type);
  const signed = (tx: Transaction) => (tx.amountUsdt > 0 ? "+" : "") + fmt(tx.amountUsdt);
  const statusOf = (tx: Transaction) => (tx.status && tx.status !== "COMPLETED" ? t("wallet.status." + tx.status) : "");
  const holdText = (tx: Transaction) => {
    if (tx.status !== "PENDING_72H_HOLD" || !tx.unlockAt || now === null) return "";
    const c = holdCountdown(tx.unlockAt, now);
    return t("wallet.holdLeft", { h: c.hours, m: c.minutes });
  };

  const cancel = async () => {
    if (!current || cancelLock.current || !user || !current.serverId || current.accountId !== user.id) return;
    cancelLock.current = true; setBusy(true); setCancelFailed(false);
    try {
      const result = await api.cancelWithdrawal(current.serverId);
      if (result.id !== current.serverId || useAuthStore.getState().user?.id !== user.id) return;
      useWalletStore.getState().syncWithdrawal(current.id, result.status, { txHash: result.txHash, unlockAt: result.unlockAt });
      setCancelling(false);
    } catch { setCancelling(false); setCancelFailed(true); }
    finally { cancelLock.current = false; setBusy(false); }
  };

  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead title={t("wallet.title")} desc={t("wallet.desc")} />
      {!ready || !hydrated ? <Skeleton height={200} label={t("common.loading")} />
        : !user ? <div className="v-stack"><Line>{t("wallet.loginLine")}</Line><Button onClick={() => openLogin("login")}>{t("nav.login")}</Button></div>
        : (
          <>
            <div className="v-stack">
              <Rows>
                <Row label={t("wallet.balance")}>{fmt(cryptoBalance)}</Row>
                {cardBalance > 0 && <Row label={t("wallet.cardBalance")}>{fmt(cardBalance)}</Row>}
              </Rows>
              <Button onClick={openCharge}>{t("box.charge")}</Button>
              <div className="v-links"><TextLink href="/wallet/withdraw">{t("wallet.withdraw")}</TextLink></div>
            </div>
            <section className="v-stack" aria-labelledby="wallet-history">
              <h2 id="wallet-history" className="v-section">{t("wallet.history")}</h2>
              {rows.length === 0 ? <Empty>{t("wallet.empty")}</Empty> : (
                <ul className="v-itemrows">
                  {rows.slice(0, shown).map((tx) => (
                    <li key={tx.id}>
                      <button type="button" className="v-itemrow" onClick={() => { setOpenId(tx.id); setCancelFailed(false); }}>
                        <span className="v-itemrow-body"><span className="v-card-title">{kind(tx)}</span><span className="v-small">{date(tx.at)}{statusOf(tx) ? ", " + statusOf(tx) : ""}</span></span>
                        <span className="v-num">{signed(tx)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {rows.length > shown && <div className="v-links"><TextLink onClick={() => setShown((n) => n + PAGE)}>{t("inv.more", { n: rows.length - shown })}</TextLink></div>}
            </section>
          </>
        )}

      <Sheet open={!!current && !cancelling} onClose={() => setOpenId(null)} title={current ? kind(current) : ""} desc={current ? date(current.at) : undefined} closeLabel={t("common.close")}>
        {current && (
          <>
            <Rows>
              <Row label={t("wallet.amount")}>{signed(current)}</Row>
              {current.status && <Row label={t("inv.status")}>{t("wallet.status." + current.status)}</Row>}
              {current.network && <Row label={t("charge.network")}>{current.network}</Row>}
              {typeof current.feeUsdt === "number" && <Row label={t("wallet.fee")}>{fmt(current.feeUsdt)}</Row>}
              {typeof current.netUsdt === "number" && <Row label={t("wallet.net")}>{fmt(current.netUsdt)}</Row>}
            </Rows>
            {current.address && <div className="v-card"><p className="v-small">{t("wallet.toAddress")}</p><code className="v-address">{current.address}</code></div>}
            {holdText(current) && <Line>{holdText(current)}</Line>}
            {current.status === "PENDING_ADMIN_REVIEW" && <Line>{t("wallet.reviewLine")}</Line>}
            {cancelFailed && <Line fail>{t("wallet.cancelFailed")}</Line>}
            {current.status === "PENDING_72H_HOLD" && current.serverId && <Button onClick={() => setCancelling(true)}>{t("wallet.cancel")}</Button>}
            {current.txHash && current.network && (current.network === "TRC20" || current.network === "BEP20") && (
              <div className="v-links"><TextLink href={explorerTxUrl(current.network as Network, current.txHash)} external>{t("wallet.explorer", { name: EXPLORERS[current.network as Network].name })}</TextLink></div>
            )}
          </>
        )}
      </Sheet>
      <Confirm open={!!current && cancelling} onCancel={() => setCancelling(false)} onConfirm={cancel} busy={busy} busyLabel={t("common.checking")} title={t("wallet.cancelTitle")} desc={t("wallet.cancelDesc")} confirmLabel={t("wallet.cancel")} cancelLabel={t("common.cancel")} />
    </div>
  );
}

export const WALLET_OPEN_STATUSES = OPEN_STATUSES;
