"use client";
/**
 * 출금. 단계마다 화면 하나, 결정 하나:
 *   입력(네트워크, 주소, 금액) → 확인(받는 금액과 주소 전체) → 인증(인증 앱 코드, 또는 이메일 인증과 72시간 대기) → 신청함
 * 계산과 검증, 신청 순서는 옛 출금 화면 그대로다(lib/withdrawal, lib/security, api.withdraw).
 *   인증을 통과한 뒤에만 잔액을 차감하고 내역을 만든다. 서비스가 준 상태와 거래 번호만 기록한다.
 * 실패와 막힘은 그 화면의 한 줄로 쓴다.
 * 보관 중인 상품이 있으면 화면 설명 바로 아래에 "보관함의 상품을 USDT로 받아 출금하기" 링크가 있다(flow/MELT_SPEC.md S7, R6).
 *   선택 시트에서 받은 뒤 이 화면으로 돌아오고, 새로 받은 금액 가운데 출금할 수 있는 몫만 금액 칸에 채운다(사람이 고칠 수 있다).
 *   출금은 지금처럼 잔액에서 나간다. 받은 것과 출금은 따로 기록되고, 출금을 하지 않아도 받은 것은 잔액에 남는다.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Network } from "@/lib/depositAddress";
import { MIN_WITHDRAW_USDT, WITHDRAW_NETWORKS, WITHDRAW_NETWORK_BY_KEY, maxWithdrawable, netReceive, validateWithdrawal } from "@/lib/withdrawal";
import { sendWithdrawalEmail, verifyWithdrawalEmail, verifyWithdrawalOtp, type WithdrawalProof } from "@/lib/security";
import { HOLD_HOURS } from "@/lib/withdrawHold";
import { AccountError } from "@/lib/account";
import { api, WithdrawalUnknown } from "@/lib/api";
import { useCurrency } from "@/lib/useCurrency";
import { useCurrencyStore } from "@/stores/currencyStore";
import { isUndebitedWithdrawal, useWalletStore, type TxStatus } from "@/stores/walletStore";
import { useSecurityStore } from "@/stores/securityStore";
import { useAuthStore } from "@/stores/authStore";
import { Button, ButtonLink, Chips, Field, Line, Row, Rows, ScreenHead, Skeleton, TextLink } from "@/components/ui/kit";
import { TwoFactorSetup } from "@/components/wallet/TwoFactorSetup";
import { Sheet } from "@/components/ui/Sheet";
import { TakeSheet, useTakeLedger } from "@/components/flow/TakeSheet";
import { heldForTake, withdrawPrefillUsdt, type BatchOutcome } from "@/lib/takeBatch";
import { useInventoryStore } from "@/stores/inventoryStore";

/** 인증 코드를 몇 번 틀리면 이메일 인증 경로로 보내는가(옛 화면과 같다) */
const OTP_MAX_ATTEMPTS = 3;
type Draft = { amountUsdt: number; network: Network; address: string };
type Stage = { kind: "form" } | ({ kind: "confirm" } & Draft) | ({ kind: "otp" } & Draft) | ({ kind: "email" } & Draft) | { kind: "done"; status: TxStatus; net: number; network: Network };

export function WithdrawScreen() {
  const t = useTranslations("v");
  const te = useTranslations("account.errors");
  const { currency, fmt } = useCurrency();
  const rates = useCurrencyStore((s) => s.rates);
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.hydrated);
  const openLogin = useAuthStore((s) => s.openAuthModal);
  const balance = useWalletStore((s) => s.cryptoBalance);
  const twoFactorEnabled = useSecurityStore((s) => s.twoFactorEnabled);
  const securityReady = useSecurityStore((s) => s.hydrated && s.userId === user?.id);
  const securityError = useSecurityStore((s) => s.error);

  const [stage, setStage] = useState<Stage>({ kind: "form" });
  const [emailOnly, setEmailOnly] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [network, setNetwork] = useState<Network>("TRC20");
  const [address, setAddress] = useState("");
  const [amountText, setAmountText] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(OTP_MAX_ATTEMPTS);
  const [challenge, setChallenge] = useState<Awaited<ReturnType<typeof sendWithdrawalEmail>> | null>(null);
  const submission = useRef(false);
  const requestId = useRef("");
  const requestDraft = useRef("");
  const lock = useRef(false);
  // 요청 세대: 단계가 바뀐 뒤에 도착한 인증 응답으로 출금이 접수되지 않게 한다
  const generation = useRef(0);

  useEffect(() => { setStage({ kind: "form" }); setEmailOnly(false); }, [user?.id]);
  useEffect(() => { generation.current++; setCode(""); setError(""); setChallenge(null); setLeft(OTP_MAX_ATTEMPTS); }, [stage.kind]);
  /** 인증과 접수를 기다리는 동안에는 단계를 옮기지 않는다(옛 화면도 그동안 뒤로 가기와 방식 변경을 막았다) */
  const go = (next: Stage) => { if (!busy && !lock.current && !submission.current) setStage(next); };

  const meta = WITHDRAW_NETWORK_BY_KEY[network];
  const decimals = currency === "KRW" ? 0 : 2;
  // 입력은 고른 통화 단위, 잔액 반영과 온체인 금액은 USDT 로 바꾼 값
  const amountNative = Number(amountText);
  const amountUsdt = useMemo(() => (amountText.trim() && Number.isFinite(amountNative) ? +(amountNative / rates[currency]).toFixed(2) : NaN), [amountText, amountNative, rates, currency]);
  const errors = useMemo(() => validateWithdrawal({ network, address, amountUsdt, balanceUsdt: balance }), [network, address, amountUsdt, balance]);
  const bad = (key: (typeof errors)[number]) => touched && errors.includes(key);
  const amountOk = !errors.includes("nan") && !errors.includes("min") && !errors.includes("insufficient");
  const setRatio = (ratio: number) => setAmountText((+(maxWithdrawable(balance) * ratio).toFixed(2) * rates[currency]).toFixed(decimals));

  // 보관 중인 상품을 USDT로 받아 출금하기. 받는 일은 선택 시트가 하고, 여기서는 금액 칸만 채운다
  const takeLedger = useTakeLedger();
  const heldItems = useInventoryStore((s) => s.items);
  const heldCount = useMemo(() => heldForTake(heldItems, takeLedger).length, [heldItems, takeLedger]);
  const [taking, setTaking] = useState(false);
  // 방금 받은 것: 출금할 수 있는 몫(금액 칸에 넣은 값)과 그렇지 않은 몫이 있었는지
  const [received, setReceived] = useState<{ prefillUsdt: number } | null>(null);
  // 이 화면에서 앞서 받아 금액 칸에 넣어 둔 몫. 시트를 다시 열어 더 받으면 여기에 더한다(사람이 금액을 고쳤으면 0 에서 다시 센다)
  const prefillBase = useRef(0);
  const openTake = () => { prefillBase.current = received?.prefillUsdt ?? 0; setTaking(true); };
  const onTaken = (out: BatchOutcome) => {
    // out 은 이 시트를 연 뒤 받은 것을 모두 합친 결과다(다시 시도한 것 포함). 새로 잔액에 들어온 것이 없으면 채울 것도 없다
    if (!(out.amountUsdt > 0)) return;
    // 새로 받은 금액 가운데 출금할 수 있는 몫만. 원래 있던 잔액과 카드로 충전한 몫은 넣지 않는다
    const prefillUsdt = withdrawPrefillUsdt({ toCrypto: prefillBase.current + out.toCrypto }, useWalletStore.getState().cryptoBalance);
    setReceived({ prefillUsdt });
    if (prefillUsdt > 0) setAmountText((prefillUsdt * rates[currency]).toFixed(decimals));
  };

  // 방금 차감하지 못한 출금 요청 가운데 취소를 확인하지 못한 것(그 내역의 id). 그 내역이 열려 있는 동안 입력 화면이 한 줄로 알린다.
  // 알리기만 한다: 새 출금을 막지 않는다. 그 요청은 잔액에서 차감한 것이 없어 지갑 내역에 금액 0 인 줄로 남아 있고, 거기서 취소한다
  const [unconfirmedId, setUnconfirmedId] = useState<string | null>(null);
  const unconfirmed = useWalletStore((s) => !!unconfirmedId && s.transactions.some((x) => x.id === unconfirmedId && !["COMPLETED", "CANCELLED", "FAILED"].includes(x.status ?? "")));

  const beginConfirm = () => {
    setTouched(true);
    if (!user || !securityReady || submission.current || errors.length) return;
    const fingerprint = JSON.stringify([user.id, amountUsdt, network, address.trim()]);
    if (requestDraft.current !== fingerprint) { requestDraft.current = fingerprint; requestId.current = globalThis.crypto.randomUUID(); }
    setError("");
    setStage({ kind: "confirm", amountUsdt, network, address: address.trim() });
  };

  /** 인증을 통과한 뒤에만 불린다. 여기서 잔액이 차감되고 출금 내역이 생긴다(옛 화면의 commit 과 같은 순서). */
  const commit = useCallback(async (draft: Draft, proof: WithdrawalProof, rid: string) => {
    if (submission.current || !user || useAuthStore.getState().user?.id !== user.id) return;
    if (validateWithdrawal({ ...draft, balanceUsdt: useWalletStore.getState().cryptoBalance }).length) { setStage({ kind: "form" }); setTouched(true); return; }
    submission.current = true; setBusy(true); setError("");
    try {
      const result = await api.withdraw({ ...draft, requestId: rid, authorization: proof.authorization, authMethod: proof.method });
      if (useAuthStore.getState().user?.id !== user.id) return;
      const wallet = useWalletStore.getState();
      if (wallet.transactions.some((x) => x.accountId === user.id && x.serverId === result.id)) { setStage({ kind: "form" }); return; }
      // 서비스가 금액을 먼저 묶어 둔 뒤에 접수를 알려 준다. 접수 번호는 언제나 내역 한 줄로 남는다(stores/walletStore 의 recordWithdrawal):
      // 잔액에서 차감했으면 보통의 출금 줄, 차감하지 못했으면 장부 금액 0 인 줄(취소되거나 실패해도 환불될 것이 없다)
      const recorded = wallet.recordWithdrawal({ type: "withdraw", accountId: user.id, serverId: result.id,
        amountUsdt: -draft.amountUsdt, ref: `${draft.network}:${draft.address}`, network: draft.network,
        address: draft.address, feeUsdt: WITHDRAW_NETWORK_BY_KEY[draft.network].feeUsdt,
        netUsdt: netReceive(draft.amountUsdt, draft.network), authMethod: proof.method,
        unlockAt: result.unlockAt, emailMasked: proof.emailMasked, status: result.status, txHash: result.txHash });
      requestDraft.current = "";
      if (isUndebitedWithdrawal(recorded)) {
        // 접수를 기다리는 사이에 잔액이 줄어 차감하지 못했다. 서비스의 접수를 거둔다. 취소가 확인되면(또는 서비스가 그 번호를 모르면) 그 줄이 닫힌다.
        // 확인하지 못하면 줄이 열린 채 남는다. 지갑 내역의 상태 확인과 취소가 그 줄을 찾는다. 새 출금은 막지 않는다
        try {
          const cancelled = await api.cancelWithdrawal(result.id);
          if (cancelled.id === result.id && useAuthStore.getState().user?.id === user.id) useWalletStore.getState().syncWithdrawal(recorded.id, cancelled.status, { txHash: cancelled.txHash, unlockAt: cancelled.unlockAt });
        } catch (cause) {
          if (cause instanceof WithdrawalUnknown && useAuthStore.getState().user?.id === user.id) useWalletStore.getState().closeUnknownWithdrawal(recorded.id);
        }
        setUnconfirmedId(recorded.id);
        setStage({ kind: "form" }); setTouched(true); return;
      }
      setStage({ kind: "done", status: result.status, net: netReceive(draft.amountUsdt, draft.network), network: draft.network });
    } catch (cause) {
      setError(te(cause instanceof AccountError ? cause.code : "network"));
    } finally { submission.current = false; setBusy(false); }
  }, [user, te]);

  const draftOf = (s: Draft): Draft => ({ amountUsdt: s.amountUsdt, network: s.network, address: s.address });
  const submitOtp = async () => {
    if (stage.kind !== "otp" || lock.current || left <= 0 || code.length !== 6) return;
    lock.current = true; setBusy(true); setError("");
    const draft = draftOf(stage), rid = requestId.current, mine = generation.current;
    try { const proof = await verifyWithdrawalOtp(draft, code); if (generation.current !== mine) return; await commit(draft, proof, rid); return; }
    catch (cause) {
      setCode("");
      if (cause instanceof AccountError && ["credentials", "invalid", "rateLimit"].includes(cause.code)) {
        const remaining = cause.code === "rateLimit" ? 0 : left - 1;
        setLeft(remaining);
        if (remaining <= 0) { if (generation.current === mine) setStage({ kind: "email", ...draft }); return; }
        setError(t("withdraw.otpWrong", { left: remaining }));
      } else setError(te(cause instanceof AccountError ? cause.code : "network"));
    } finally { lock.current = false; setBusy(false); }
  };
  const sendEmail = async () => {
    if (stage.kind !== "email" || lock.current) return;
    lock.current = true; setBusy(true); setError(""); setCode(""); setChallenge(null);
    try { setChallenge(await sendWithdrawalEmail(draftOf(stage))); }
    catch (cause) { setError(te(cause instanceof AccountError ? cause.code : "network")); }
    finally { lock.current = false; setBusy(false); }
  };
  const verifyEmail = async () => {
    if (stage.kind !== "email" || lock.current || !challenge || code.length !== 6) return;
    if (Date.now() >= challenge.expiresAt) { setError(t("withdraw.emailExpired")); return; }
    lock.current = true; setBusy(true); setError("");
    const draft = draftOf(stage), rid = requestId.current, mine = generation.current;
    try { const proof = await verifyWithdrawalEmail(draft, challenge.challengeId, code); if (generation.current !== mine) return; await commit(draft, proof, rid); return; }
    catch (cause) { setCode(""); setError(te(cause instanceof AccountError ? cause.code : "network")); }
    finally { lock.current = false; setBusy(false); }
  };

  if (!ready) return <div className="v-stack v-stack--lg"><ScreenHead title={t("withdraw.title")} back="/wallet" backLabel={t("common.back")} /><Skeleton height={200} label={t("common.loading")} /></div>;
  if (!user) return <div className="v-stack v-stack--lg"><ScreenHead title={t("withdraw.title")} desc={t("wallet.loginLine")} back="/wallet" backLabel={t("common.back")} /><Button onClick={() => openLogin("login")}>{t("nav.login")}</Button></div>;
  if (!securityReady) return (
    <div className="v-stack v-stack--lg">
      <ScreenHead title={t("withdraw.title")} back="/wallet" backLabel={t("common.back")} />
      {securityError ? <><Line fail>{t("withdraw.securityFail")}</Line><Button onClick={() => void useSecurityStore.getState().refresh(user.id)}>{t("state.retry")}</Button></> : <Skeleton height={200} label={t("common.loading")} />}
    </div>
  );

  // 인증 앱을 아직 연결하지 않았으면 먼저 연결한다. 못 쓰는 사람은 이메일 인증과 72시간 대기로 간다.
  if (!twoFactorEnabled && !emailOnly && stage.kind !== "done") return (
    <div className="v-stack v-stack--lg">
      <ScreenHead title={t("withdraw.gateTitle")} desc={t("withdraw.gateDesc")} back="/wallet" backLabel={t("common.back")} />
      {/* 출금 화면 안에서 연결한다. 계정 화면으로 보내지 않는다(Codex 1차 검수) */}
      <Button onClick={() => setConnecting(true)}>{t("withdraw.gateCta")}</Button>
      <div className="v-links"><TextLink onClick={() => setEmailOnly(true)}>{t("withdraw.emailPath", { hours: HOLD_HOURS })}</TextLink></div>
      <Sheet open={connecting} onClose={() => setConnecting(false)} title={t("account.twoFactor")} desc={t("account.twoFactorDesc")} closeLabel={t("common.close")} wide>
        <TwoFactorSetup compact autoStart onEnabled={() => setConnecting(false)} />
      </Sheet>
    </div>
  );

  if (stage.kind === "confirm") return (
    <div className="v-stack v-stack--lg">
      <ScreenHead title={t("withdraw.confirmTitle")} desc={t("withdraw.confirmDesc")} back={() => go({ kind: "form" })} backLabel={t("common.back")} />
      <Rows>
        <Row label={t("wallet.net")}>{fmt(netReceive(stage.amountUsdt, stage.network))}</Row>
        <Row label={t("wallet.amount")}>{fmt(stage.amountUsdt)}</Row>
        <Row label={t("wallet.fee")}>{fmt(WITHDRAW_NETWORK_BY_KEY[stage.network].feeUsdt)}</Row>
        <Row label={t("charge.network")}>{WITHDRAW_NETWORK_BY_KEY[stage.network].token}</Row>
      </Rows>
      <div className="v-card"><p className="v-small">{t("wallet.toAddress")}</p><code className="v-address">{stage.address}</code></div>
      <Button onClick={() => go({ kind: emailOnly ? "email" : "otp", ...draftOf(stage) })}>{t("withdraw.toAuth")}</Button>
    </div>
  );

  if (stage.kind === "otp") return (
    <form className="v-stack v-stack--lg" onSubmit={(e) => { e.preventDefault(); void submitOtp(); }} noValidate>
      <ScreenHead title={t("withdraw.otpTitle")} desc={t("withdraw.otpDesc")} back={() => go({ kind: "confirm", ...draftOf(stage) })} backLabel={t("common.back")} />
      <Field label={t("login.code")} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} disabled={busy} autoFocus />
      {error && <Line fail>{error}</Line>}
      <Button type="submit" busy={busy} busyLabel={t("common.checking")}>{t("withdraw.submit", { amount: fmt(netReceive(stage.amountUsdt, stage.network)) })}</Button>
      <div className="v-links"><TextLink onClick={() => go({ kind: "email", ...draftOf(stage) })}>{t("withdraw.emailPath", { hours: HOLD_HOURS })}</TextLink></div>
    </form>
  );

  if (stage.kind === "email") return (
    <form className="v-stack v-stack--lg" onSubmit={(e) => { e.preventDefault(); void (challenge ? verifyEmail() : sendEmail()); }} noValidate>
      <ScreenHead title={t("withdraw.emailTitle")} desc={t("withdraw.emailDesc", { hours: HOLD_HOURS })} back={() => go({ kind: "confirm", ...draftOf(stage) })} backLabel={t("common.back")} />
      {challenge && <Field label={t("login.code")} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} disabled={busy} autoFocus />}
      {error && <Line fail>{error}</Line>}
      <Button type="submit" busy={busy} busyLabel={t("common.checking")}>{challenge ? t("withdraw.submit", { amount: fmt(netReceive(stage.amountUsdt, stage.network)) }) : t("withdraw.sendCode")}</Button>
      {challenge && <div className="v-links"><TextLink onClick={() => { if (!busy) void sendEmail(); }}>{t("login.resend")}</TextLink></div>}
    </form>
  );

  if (stage.kind === "done") return (
    <div className="v-stack v-stack--lg">
      <ScreenHead title={t("withdraw.doneTitle")} desc={t(stage.status === "PENDING_72H_HOLD" ? "withdraw.doneHold" : stage.status === "PENDING_ADMIN_REVIEW" ? "withdraw.doneReview" : "withdraw.doneDesc", { hours: HOLD_HOURS })} />
      <Rows>
        <Row label={t("wallet.net")}>{fmt(stage.net)}</Row>
        <Row label={t("charge.network")}>{WITHDRAW_NETWORK_BY_KEY[stage.network].token}</Row>
        <Row label={t("inv.status")}>{t("wallet.status." + stage.status)}</Row>
      </Rows>
      <ButtonLink href="/wallet">{t("withdraw.toWallet")}</ButtonLink>
    </div>
  );

  return (
    <form className="v-stack v-stack--lg" onSubmit={(e) => { e.preventDefault(); beginConfirm(); }} noValidate>
      <ScreenHead title={t("withdraw.title")} desc={t("withdraw.desc")} back="/wallet" backLabel={t("common.back")} />
      {/* 보관 중인 상품이 있을 때만. 입력 칸 사이가 아니라 화면 설명 바로 아래에 둔다(R6). 받은 뒤 이 화면으로 돌아와 금액을 이어서 넣는다 */}
      {heldCount > 0 && <div className="v-links v-links--tight"><TextLink onClick={openTake}>{t("take.withdrawLink")}</TextLink></div>}
      <Chips label={t("charge.network")} value={network} onChange={setNetwork} options={WITHDRAW_NETWORKS.map((n) => ({ value: n.key, label: n.token }))} />
      <div className="v-stack">
        <Field label={t("withdraw.address")} autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder={meta.addressHint} value={address} onChange={(e) => setAddress(e.target.value)} />
        {bad("address") && <Line fail>{t("withdraw.errAddress." + network)}</Line>}
        <Field label={t("withdraw.amount", { currency })} inputMode="decimal" value={amountText} onChange={(e) => { setAmountText(e.target.value.replace(/[^\d.]/g, "")); setReceived(null); }} />
        {received && <p className="v-small">{received.prefillUsdt > 0 ? t("take.prefilled", { amount: fmt(received.prefillUsdt) }) : t("take.prefillNone")}</p>}
        <div className="v-chips">
          {[0.25, 0.5, 1].map((ratio) => <button key={ratio} type="button" className="v-chip" onClick={() => { setRatio(ratio); setReceived(null); }}>{ratio === 1 ? t("withdraw.all") : Math.round(ratio * 100) + "%"}</button>)}
        </div>
        {bad("nan") && <Line fail>{t("withdraw.errNan")}</Line>}
        {bad("min") && <Line fail>{t("withdraw.errMin", { min: fmt(MIN_WITHDRAW_USDT) })}</Line>}
        {bad("insufficient") && <Line fail>{t("withdraw.errInsufficient", { balance: fmt(balance) })}</Line>}
      </div>
      <Rows>
        <Row label={t("wallet.balance")}>{fmt(balance)}</Row>
        <Row label={t("wallet.fee")}>{fmt(meta.feeUsdt)}</Row>
        <Row label={t("wallet.net")}>{amountOk ? fmt(netReceive(amountUsdt, network)) : fmt(0)}</Row>
      </Rows>
      {error && <Line fail>{error}</Line>}
      {unconfirmed && <><Line fail>{t("withdraw.cancelUnconfirmed")}</Line><div className="v-links v-links--tight"><TextLink href="/wallet">{t("balanceSheet.history")}</TextLink></div></>}
      <Button type="submit">{t("withdraw.next")}</Button>
      <TakeSheet open={taking} onClose={() => setTaking(false)} onTaken={onTaken} doneLabel={t("take.withdrawBack")} />
    </form>
  );
}
