"use client";
/**
 * 인증 앱(TOTP) 연결. 출금 관문 시트와 계정 화면이 같은 부품을 쓴다.
 *   1 앱 연결: 표준 otpauth QR 과 수동 입력용 키(복사)
 *   2 확인: 6자리 코드를 넣으면 보안 상태를 저장한다
 * 시크릿은 부품이 살아 있는 동안 한 번만 만든다(리렌더마다 새로 만들면 방금 스캔한 QR 이 무효가 된다).
 * 화면 규칙은 DESIGN.md: 색 배지와 아이콘 없이 카드, 행, 입력칸, 흰 주 단추 하나. 실패는 그 자리 한 줄.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { TOTP_DIGITS, groupSecret, otpauthUri } from "@/lib/totp";
import { useSecurityStore } from "@/stores/securityStore";
import { AccountError } from "@/lib/account";
import { beginTotpSetup, confirmTotpSetup } from "@/lib/security";
import { useAuthStore } from "@/stores/authStore";
import { Button, Field, Line, TextLink } from "@/components/ui/kit";
import { useToast } from "@/components/ui/toast";

export function TwoFactorSetup({ onEnabled, compact, autoStart = false }: { onEnabled?: () => void; compact?: boolean; autoStart?: boolean }) {
  const t = useTranslations("security");
  const ta = useTranslations("account");
  const tv = useTranslations("v");
  const user = useAuthStore((s) => s.user);
  const openLogin = useAuthStore((s) => s.openAuthModal);
  const toast = useToast((s) => s.show);
  const [setup, setSetup] = useState<{ secret: string; setupId: string } | null>(null);
  const secret = setup?.secret ?? "";
  const uri = useMemo(() => otpauthUri({ secret, account: user?.email ?? user?.subLabel ?? "VOILA" }), [secret, user?.email, user?.subLabel]);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const autoStartedFor = useRef<string | null>(null);
  void compact;

  const prepare = useCallback(async () => {
    if (!user || inFlight.current) return;
    inFlight.current = true; setBusy(true); setError("");
    const id = user.id;
    try {
      const next = await beginTotpSetup();
      if (useAuthStore.getState().user?.id === id) setSetup(next);
    } catch (cause) { setError(ta(`errors.${cause instanceof AccountError ? cause.code : "network"}`)); }
    finally { inFlight.current = false; setBusy(false); }
  }, [user, ta]);
  useEffect(() => {
    if (!autoStart || !user || autoStartedFor.current === user.id) return;
    autoStartedFor.current = user.id;
    void prepare();
  }, [autoStart, user, prepare]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(secret); toast(tv("common.copied")); } catch { setError(t("copyFailed")); }
  };
  const submit = async (raw: string) => {
    if (inFlight.current || !user || !setup || !/^\d{6}$/.test(raw)) return;
    inFlight.current = true; setBusy(true); setError("");
    const id = user.id;
    try {
      const status = await confirmTotpSetup(setup.setupId, raw);
      if (useAuthStore.getState().user?.id !== id) return;
      useSecurityStore.getState().accept(id, status);
      setSetup(null);
      onEnabled?.();
    } catch (cause) {
      setError(cause instanceof AccountError && cause.code === "credentials" ? t("codeWrong") : ta(`errors.${cause instanceof AccountError ? cause.code : "network"}`));
      setCode(""); codeRef.current?.focus();
    } finally { inFlight.current = false; setBusy(false); }
  };

  if (!user) return <div className="v-stack"><Line>{tv("account.loginLine")}</Line><Button onClick={() => openLogin("login")}>{tv("nav.login")}</Button></div>;
  if (!setup && autoStart && !error) return <Line>{ta("processing")}</Line>;
  if (!setup) return (
    <div className="v-stack">
      <p className="v-body">{t("intro")}</p>
      {error && <Line fail>{error}</Line>}
      <Button onClick={() => void prepare()} busy={busy} busyLabel={ta("processing")}>{t("startSetup")}</Button>
    </div>
  );
  return (
    <form className="v-stack" onSubmit={(e) => { e.preventDefault(); void submit(code); }}>
      <div className="v-card v-stack v-stack--sm">
        <p className="v-small">{t("step1Title")}</p>
        <p className="v-body">{t("step1Body")}</p>
        <div className="v-qr"><QRCodeSVG value={uri} size={148} level="M" marginSize={2} title={t("step1Title")} /></div>
        <p className="v-small">{t("manualKey")}</p>
        <code className="v-address">{groupSecret(secret)}</code>
        <div className="v-links"><TextLink onClick={() => void copy()}>{t("copyKey")}</TextLink></div>
      </div>
      <p className="v-small">{t("step2Body")}</p>
      <Field ref={codeRef} label={t("codeLabel")} inputMode="numeric" autoComplete="one-time-code" maxLength={TOTP_DIGITS} value={code} onChange={(e) => { setCode(e.target.value.replace(/\D+/g, "").slice(0, TOTP_DIGITS)); setError(""); }} disabled={busy} />
      {error && <Line fail>{error}</Line>}
      <Button type="submit" disabled={code.length !== TOTP_DIGITS} busy={busy} busyLabel={ta("processing")}>{ta("verifyCode")}</Button>
    </form>
  );
}

export default TwoFactorSetup;
