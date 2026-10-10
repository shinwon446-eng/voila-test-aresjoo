"use client";
/**
 * 새 화면의 껍데기: 머리줄(로고, 잔액, 메뉴), 본문, 꼬리말.
 * 본문은 결정 화면이면 가운데 좁은 열(col), 박스 목록이면 넓은 격자(wide).
 * 충전 시트와 토스트는 여기 한 곳에 붙는다. 로그인 시트는 AuthHost 가 전역으로 붙인다.
 */
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useAuthStore } from "@/stores/authStore";
import { useWalletStore } from "@/stores/walletStore";
import { useFlow } from "@/stores/flowStore";
import { useCurrency } from "@/lib/useCurrency";
import { Sheet } from "@/components/ui/Sheet";
import { ToastHost } from "@/components/ui/toast";
import { ChargeSheet } from "@/components/flow/ChargeSheet";

/** 옮기는 동안 일부 주소는 옛 화면을 가리킨다. 화면을 새로 만들면 여기만 바꾼다. */
export const NAV = [
  { key: "boxes", href: "/" },
  { key: "inventory", href: "/inventory" },
  { key: "verify", href: "/fairness" },
  { key: "guide", href: "/about" },
  { key: "account", href: "/profile" },
] as const;

export function AppShell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  const t = useTranslations("v");
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.hydrated);
  const openLogin = useAuthStore((s) => s.openAuthModal);
  const balance = useWalletStore((s) => s.balance);
  const { fmt } = useCurrency();
  const { menu, openMenu, closeMenu, openCharge } = useFlow();

  return (
    <div className="v-app">
      <header className="v-header">
        <div className="v-header-in">
          <BrandLogo className="v-logo" />
          <nav className="v-nav" aria-label={t("nav.menu")}>
            {NAV.map((n) => <Link key={n.key} href={n.href} aria-current={pathname === n.href ? "page" : undefined}>{t("nav." + n.key)}</Link>)}
          </nav>
          {ready && user && <button type="button" className="v-headbtn v-num" onClick={openCharge}>{t("nav.balance", { amount: fmt(balance) })}</button>}
          {ready && !user && <button type="button" className="v-headbtn" onClick={() => openLogin("login")}>{t("nav.login")}</button>}
          <button type="button" className="v-headbtn v-menu-btn" onClick={openMenu} aria-label={t("nav.menu")}><Menu size={20} aria-hidden /></button>
        </div>
      </header>
      <main className={"v-main " + (wide ? "v-main--wide" : "v-main--col")}>{children}</main>
      <Sheet open={menu} onClose={closeMenu} title={t("nav.menu")} closeLabel={t("common.close")}>
        <nav className="v-rows" aria-label={t("nav.menu")}>
          {NAV.map((n) => <Link key={n.key} href={n.href} onClick={closeMenu} className="v-row v-row--link"><span>{t("nav." + n.key)}</span><span aria-hidden>›</span></Link>)}
        </nav>
      </Sheet>
      <ChargeSheet />
      <ToastHost />
    </div>
  );
}
