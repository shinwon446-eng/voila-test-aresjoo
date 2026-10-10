"use client";
/**
 * 계정. 사용자가 관리하고 해결할 일 다섯 묶음: 지갑, 보관함, 보안, 도움, 계정 관리.
 * 로그인 전에는 로그인 한 줄과 단추뿐이다. 로그인 뒤에는 행마다 지금 상태(잔액, 보관 중 수, 인증 앱 연결 여부)가 적혀 있다.
 * 되돌릴 수 없는 행동(로그아웃)만 확인창을 띄운다.
 */
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { vaultTab } from "@/lib/vault";
import { useCurrency } from "@/lib/useCurrency";
import { useAuthStore } from "@/stores/authStore";
import { useWalletStore } from "@/stores/walletStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useSecurityStore } from "@/stores/securityStore";
import { Button, Line, Row, Rows, ScreenHead, Skeleton, TextLink } from "@/components/ui/kit";
import { Confirm, Sheet } from "@/components/ui/Sheet";
import { TwoFactorSetup } from "@/components/wallet/TwoFactorSetup";
import { CloseAccountSheet, NicknameSheet, PasswordSheet } from "@/components/account/AccountSheets";

export function AccountScreen() {
  const t = useTranslations("v");
  const { fmt } = useCurrency();
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.hydrated);
  const openLogin = useAuthStore((s) => s.openAuthModal);
  const logout = useAuthStore((s) => s.logout);
  const balance = useWalletStore((s) => s.balance);
  const items = useInventoryStore((s) => s.items);
  const twoFactor = useSecurityStore((s) => s.twoFactorEnabled);
  const [leaving, setLeaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [securing, setSecuring] = useState(false);
  const [sheet, setSheet] = useState<"nickname" | "password" | "close" | null>(null);
  const counts = useMemo(() => items.reduce((acc, item) => { acc[vaultTab(item)]++; return acc; }, { held: 0, shipping: 0, done: 0 }), [items]);

  const leave = async () => {
    setBusy(true);
    try { await logout(t("account.loggedOut")); setLeaving(false); } finally { setBusy(false); }
  };

  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead title={t("account.title")} desc={user ? t("account.desc") : t("account.loginLine")} />
      {!ready ? <Skeleton height={240} label={t("common.loading")} />
        : !user ? <div className="v-stack"><Button onClick={() => openLogin("login")}>{t("nav.login")}</Button><div className="v-links"><TextLink onClick={() => openLogin("signup")}>{t("login.signupTitle")}</TextLink></div></div>
        : (
          <>
            <Rows label={t("account.wallet")}>
              <div className="v-rowitem"><Link href="/wallet" className="v-row v-row--link"><span>{t("account.balance")}</span><span className="v-num">{fmt(balance)}</span></Link></div>
              <div className="v-rowitem"><Link href="/wallet/withdraw" className="v-row v-row--link"><span>{t("wallet.withdraw")}</span><span aria-hidden>›</span></Link></div>
            </Rows>
            <Rows label={t("account.vault")}>
              <div className="v-rowitem"><Link href="/inventory" className="v-row v-row--link"><span>{t("account.held")}</span><span className="v-num">{t("account.countN", { n: counts.held })} ›</span></Link></div>
              <div className="v-rowitem"><Link href="/inventory" className="v-row v-row--link"><span>{t("account.shippingNow")}</span><span className="v-num">{t("account.countN", { n: counts.shipping })} ›</span></Link></div>
            </Rows>
            <Rows label={t("account.security")}>
              <div className="v-rowitem"><button type="button" className="v-row v-row--link v-row--button" onClick={() => setSecuring(true)}><span>{t("account.twoFactor")}</span><span className="v-num">{twoFactor ? t("account.on") : t("account.connect")} ›</span></button></div>
              <Row label={t("account.email")}>{user.email ?? user.label}</Row>
            </Rows>
            <Rows label={t("account.manage")}>
              <div className="v-rowitem"><button type="button" className="v-row v-row--link v-row--button" onClick={() => setSheet("nickname")}><span>{t("account.nickname")}</span><span className="v-num">{user.nickname || t("account.none")} ›</span></button></div>
              <div className="v-rowitem"><button type="button" className="v-row v-row--link v-row--button" onClick={() => setSheet("password")}><span>{t("account.password")}</span><span aria-hidden>›</span></button></div>
              <div className="v-rowitem"><button type="button" className="v-row v-row--link v-row--button" onClick={() => setSheet("close")}><span>{t("account.closeTitle")}</span><span aria-hidden>›</span></button></div>
            </Rows>
            <Rows label={t("account.help")}>
              <div className="v-rowitem"><Link href="/guide" className="v-row v-row--link"><span>{t("nav.guide")}</span><span aria-hidden>›</span></Link></div>
              <div className="v-rowitem"><Link href="/verify" className="v-row v-row--link"><span>{t("nav.verify")}</span><span aria-hidden>›</span></Link></div>
              <div className="v-rowitem"><Link href="/legal" className="v-row v-row--link"><span>{t("nav.legal")}</span><span aria-hidden>›</span></Link></div>
            </Rows>
            <div className="v-links"><TextLink onClick={() => setLeaving(true)}>{t("account.logout")}</TextLink></div>
          </>
        )}

      <Sheet open={securing} onClose={() => setSecuring(false)} title={t("account.twoFactor")} desc={t("account.twoFactorDesc")} closeLabel={t("common.close")} wide>
        <TwoFactorSetup compact onEnabled={() => setSecuring(false)} />
      </Sheet>
      <NicknameSheet open={sheet === "nickname"} onClose={() => setSheet(null)} />
      <PasswordSheet open={sheet === "password"} onClose={() => setSheet(null)} />
      <CloseAccountSheet open={sheet === "close"} onClose={() => setSheet(null)} />
      <Confirm open={leaving} onCancel={() => setLeaving(false)} onConfirm={leave} busy={busy} busyLabel={t("common.checking")} title={t("account.logoutTitle")} desc={t("account.logoutDesc")} confirmLabel={t("account.logout")} cancelLabel={t("common.cancel")} />
    </div>
  );
}
