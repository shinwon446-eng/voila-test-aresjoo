"use client";
/**
 * 로그인과 가입 시트. 계정 처리(lib/account)는 옛 AuthModal 과 같고 화면만 새로 만들었다.
 * 단계마다 결정 하나: 이메일 → 비밀번호 → (필요하면) 이메일 인증. 끝나면 시트가 닫히고 열었던 화면이 그대로 남는다.
 * 실패는 팝업이 아니라 입력칸 아래 한 줄로 쓴다.
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/authStore";
import { AccountError, beginSocialLogin, completePasswordRecovery, loginAccount, recoverAccount, resendAccountEmail, signupAccount, validAccountEmail, validAccountPassword, verifyAccountEmail, type SocialProvider } from "@/lib/account";
import { Sheet } from "@/components/ui/Sheet";
import { Button, Field, Line, TextLink } from "@/components/ui/kit";
import { ProviderMark } from "@/components/flow/ProviderMark";

type Step = "email" | "password" | "verify" | "reset" | "done";
const PROVIDERS: { key: SocialProvider; name: string }[] = [{ key: "google", name: "Google" }, { key: "apple", name: "Apple" }, { key: "microsoft", name: "Microsoft" }];

export function LoginSheet() {
  const t = useTranslations("v");
  const te = useTranslations("account.errors");
  const locale = useLocale();
  const { isModalOpen: open, modalMode: mode, closeAuthModal: close, setModalMode: setMode, acceptSession } = useAuthStore();
  const lock = useRef(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const signup = mode === "signup";
  const recover = mode === "recover";

  useEffect(() => {
    setStep("email"); setPassword(""); setCode(""); setError("");
    if (!open) setEmail("");
  }, [open, mode]);

  const run = async (work: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try { await work(); }
    catch (cause) { setError(te(cause instanceof AccountError ? cause.code : "network")); }
    finally { lock.current = false; setBusy(false); }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      if (step === "email") {
        if (!validAccountEmail(email)) throw new AccountError("invalid");
        setEmail(email.trim());
        if (recover) { await recoverAccount(email, locale); setStep("reset"); }
        else setStep("password");
      } else if (step === "password") {
        if (signup) {
          if (!validAccountPassword(password)) throw new AccountError("invalid");
          const user = await signupAccount(email, password, locale);
          if (user) acceptSession(user); else { setPassword(""); setStep("verify"); }
        } else acceptSession(await loginAccount(email, password));
      } else if (step === "verify") acceptSession(await verifyAccountEmail(email, code));
      else if (step === "reset") { await completePasswordRecovery(email, code, password); setPassword(""); setStep("done"); }
    });
  };

  const social = (provider: SocialProvider) => void run(async () => {
    const result = await beginSocialLogin(provider, window.location.href);
    if (result.user) acceptSession(result.user);
    else if (result.redirectUrl) window.location.assign(result.redirectUrl);
  });

  const back = () => { setStep("email"); setPassword(""); setCode(""); setError(""); };
  const title = step === "done" ? t("login.doneTitle") : step === "verify" ? t("login.verifyTitle") : step === "reset" ? t("login.resetTitle") : recover ? t("login.recoverTitle") : signup ? t("login.signupTitle") : t("login.title");
  const desc = step === "verify" || step === "reset" ? t("login.codeDesc") : step === "password" ? email : recover && step === "email" ? t("login.recoverDesc") : undefined;

  return (
    <Sheet open={open} onClose={close} title={title} desc={desc} closeLabel={t("common.close")} locked={busy}>
      {step === "done" ? (
        <Button onClick={() => setMode("login")}>{t("login.loginLink")}</Button>
      ) : (
        <form onSubmit={submit} className="v-stack" noValidate>
          {step === "email" && <Field label={t("login.email")} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} autoFocus />}
          {(step === "verify" || step === "reset") && <Field label={t("login.code")} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} disabled={busy} autoFocus />}
          {(step === "password" || step === "reset") && <Field label={t(signup || step === "reset" ? "login.newPassword" : "login.password")} type="password" autoComplete={signup || step === "reset" ? "new-password" : "current-password"} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy} autoFocus={step === "password"} />}
          {step === "password" && signup && <p className="v-small">{t("login.hint")}</p>}
          {error && <Line fail>{error}</Line>}
          <Button type="submit" busy={busy} busyLabel={t("common.checking")}>{t("login.continue")}</Button>
        </form>
      )}
      {step === "email" && !recover && (
        <div className="v-stack">
          {PROVIDERS.map((p) => (
            <Button key={p.key} quiet disabled={busy} onClick={() => social(p.key)}><ProviderMark provider={p.key} />{t("login.provider", { provider: p.name })}</Button>
          ))}
        </div>
      )}
      <div className="v-links">
        {step === "email" && <TextLink onClick={() => setMode(signup || recover ? "login" : "signup")}>{t(signup || recover ? "login.loginLink" : "login.signupLink")}</TextLink>}
        {step === "password" && <TextLink onClick={back}>{t("login.editEmail")}</TextLink>}
        {step === "password" && !signup && <TextLink onClick={() => setMode("recover")}>{t("login.forgot")}</TextLink>}
        {(step === "verify" || step === "reset") && <TextLink onClick={() => void run(async () => { if (step === "verify") await resendAccountEmail(email, locale); else await recoverAccount(email, locale); setCode(""); })}>{t("login.resend")}</TextLink>}
      </div>
      {step === "email" && <p className="v-small">{t("login.terms")}</p>}
    </Sheet>
  );
}
