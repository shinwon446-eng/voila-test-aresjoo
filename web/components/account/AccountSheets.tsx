"use client";
/**
 * 계정 관리 시트 셋: 닉네임, 비밀번호 변경, 탈퇴. 옛 /profile 의 세 기능을 새 디자인으로.
 * 시트마다 결정 하나, 실패는 그 자리 한 줄. 탈퇴만 확인창(되돌릴 수 없는 행동).
 */
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AccountActionError, AccountError, changeAccountPasswordWithOtp, deleteAccount, isSocialAccount, validPassword, verifyCurrentPassword } from "@/lib/account";
import { useAuthStore } from "@/stores/authStore";
import { Button, Field, Line } from "@/components/ui/kit";
import { Confirm, Sheet } from "@/components/ui/Sheet";

const errorText = (ta: (k: string) => string, cause: unknown) => ta(`errors.${cause instanceof AccountActionError || cause instanceof AccountError ? cause.code : "network"}`);

export function NicknameSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("v");
  const ta = useTranslations("account");
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const updateNickname = useAuthStore((s) => s.updateNickname);
  const [value, setValue] = useState(user?.nickname ?? "");
  const [error, setError] = useState("");
  // 시트를 열 때 지금 닉네임으로 시작한다(세션 복원이 늦게 끝나도)
  useEffect(() => { if (open) { setValue(user?.nickname ?? ""); setError(""); } }, [open, user?.nickname]);
  const [busy, setBusy] = useState(false);
  const next = user?.nextNicknameChangeAt ? Date.parse(user.nextNicknameChangeAt) : 0;
  const locked = next > Date.now();
  const nextText = locked ? new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(new Date(next)) : "";
  const save = async () => {
    const v = value.trim();
    if (v.length < 2 || v.length > 20) { setError(t("account.nicknameRule")); return; }
    setBusy(true); setError("");
    try { if (await updateNickname(v)) onClose(); else setError(t("account.saveFail")); }
    catch (cause) { setError(errorText(ta, cause)); }
    finally { setBusy(false); }
  };
  return (
    <Sheet open={open} onClose={onClose} title={t("account.nickname")} desc={t("account.nicknameDesc")} closeLabel={t("common.close")}>
      <Field label={t("account.nickname")} value={value} onChange={(e) => { setValue(e.target.value); setError(""); }} maxLength={20} autoComplete="nickname" />
      {locked && <Line>{t("account.nicknameLocked", { date: nextText })}</Line>}
      {error && <Line fail>{error}</Line>}
      <Button onClick={() => void save()} busy={busy} busyLabel={t("common.checking")} disabled={locked}>{t("account.save")}</Button>
    </Sheet>
  );
}

export function PasswordSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("v");
  const ta = useTranslations("account");
  const user = useAuthStore((s) => s.user);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const social = isSocialAccount(user?.provider);
  const markSessionLost = useAuthStore((s) => s.markSessionLost);
  const openLogin = useAuthStore((s) => s.openAuthModal);
  // 바꾼 뒤: 서비스가 이 계정의 세션을 모두 끝내므로, 시트는 바꿨다고 말하고 로그인으로 가는 단추 하나만 둔다
  const [done, setDone] = useState(false);
  useEffect(() => { if (open) { setDone(false); setError(""); } }, [open]);
  const save = async () => {
    if (!validPassword(next)) { setError(t("account.passwordRule")); return; }
    // 이 요청을 시작한 계정. 끝났을 때 이 탭의 계정이 그대로일 때만 세션을 끝난 것으로 맞춘다
    const accountId = user?.id;
    setBusy(true); setError("");
    try {
      // 계정 서비스는 현재 비밀번호를 먼저 확인한 계정의 변경만 받는다(lib/account 의 verifyCurrentPassword).
      // 이 확인을 건너뛰고 바꾸기 요청만 보내서, 맞는 값을 넣어도 언제나 거절됐다
      const verified = await verifyCurrentPassword(current, user?.id);
      if (!verified.matched) throw new AccountActionError(verified.locked ? "password_locked" : "password_mismatch", verified.failures);
      // 이 시트는 인증 앱 코드로 확인한다. 인증 앱을 연결하지 않은 계정에 서비스가 요구하는 이메일 코드는 이 시트에서 받을 길이 없다
      if (!verified.twoFactorEnabled) { setError(t("account.passwordNeedsApp")); return; }
      if (!/^\d{6}$/.test(code)) { setError(t("account.codeRule")); return; }
      await changeAccountPasswordWithOtp(current, next, code, user?.id);
      setCurrent(""); setNext(""); setCode(""); setDone(true);
      // 이 탭도 로그인이 끝난 상태로 맞춘다(새 비밀번호로 다시 로그인한다).
      // 기다리는 사이에 다른 계정으로 바뀌었으면 그 계정의 로그인은 건드리지 않는다(끝난 것은 비밀번호를 바꾼 계정의 세션이다)
      if (useAuthStore.getState().user?.id === accountId) markSessionLost();
    }
    catch (cause) { setError(errorText(ta, cause)); }
    finally { setBusy(false); }
  };
  if (done) return (
    <Sheet open={open} onClose={onClose} title={t("login.doneTitle")} closeLabel={t("common.close")}>
      <Button onClick={() => { onClose(); openLogin("login"); }}>{t("login.loginLink")}</Button>
    </Sheet>
  );
  return (
    <Sheet open={open} onClose={onClose} title={t("account.password")} desc={social ? t("account.passwordSocial") : t("account.passwordDesc")} closeLabel={t("common.close")}>
      {!social && (
        <>
          <Field label={t("account.passwordCurrent")} type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
          <Field label={t("account.passwordNew")} type="password" value={next} onChange={(e) => { setNext(e.target.value); setError(""); }} autoComplete="new-password" />
          <Field label={t("verify.codeLabel")} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D+/g, "").slice(0, 6))} />
          {error && <Line fail>{error}</Line>}
          <Button onClick={() => void save()} busy={busy} busyLabel={t("common.checking")}>{t("account.passwordSave")}</Button>
        </>
      )}
    </Sheet>
  );
}

export function CloseAccountSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("v");
  const ta = useTranslations("account");
  const clearSession = useAuthStore((s) => s.clearSession);
  const [password, setPassword] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const close = async () => {
    setBusy(true); setError("");
    try { await deleteAccount(password); setConfirming(false); clearSession(); onClose(); }
    catch (cause) { setConfirming(false); setError(errorText(ta, cause)); }
    finally { setBusy(false); }
  };
  return (
    <>
      <Sheet open={open && !confirming} onClose={onClose} title={t("account.closeTitle")} desc={t("account.closeDesc")} closeLabel={t("common.close")}>
        <Field label={t("account.passwordCurrent")} type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} autoComplete="current-password" />
        {error && <Line fail>{error}</Line>}
        <Button onClick={() => setConfirming(true)} disabled={!password}>{t("account.closeCta")}</Button>
      </Sheet>
      <Confirm open={confirming} onCancel={() => setConfirming(false)} onConfirm={() => void close()} busy={busy} busyLabel={t("common.checking")} title={t("account.closeTitle")} desc={t("account.closeConfirm")} confirmLabel={t("account.closeCta")} cancelLabel={t("common.cancel")} />
    </>
  );
}
