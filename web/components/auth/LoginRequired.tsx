"use client";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/authStore";

export function LoginRequired({ scope }: { scope?: "wallet" } = {}) {
  const t = useTranslations("account");
  const ta = useTranslations("auth");
  const ready = useAuthStore(s => s.hydrated);
  const open = useAuthStore(s => s.openAuthModal);
  return <div className="login-required mt-4 rounded-xl border border-hairline bg-obsidian p-5">
    <p className="text-sm leading-7 text-secondary">{t(ready ? (scope === "wallet" ? "walletLoginNeeded" : "settingsLoginNeeded") : "processing")}</p>
    {ready && <button type="button" onClick={() => open("login")} className="mt-3 min-h-12 rounded-xl bg-[#f1eee7] px-5 text-sm font-semibold text-obsidian">{scope === "wallet" ? ta("login") : t("loginTitle")}</button>}
  </div>;
}
