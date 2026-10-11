"use client";
/** 꼬리말: 약관, 이용 방법, 언어, 표시 통화. 한 줄로 끝낸다. */
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LOCALES, LOCALE_LABEL } from "@/i18n/routing";
import { useCurrency } from "@/lib/useCurrency";

export function AppFooter() {
  const t = useTranslations("v");
  const locale = useLocale();
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  return (
    <footer className="v-footer">
      <div className="v-footer-in">
        <span>© 2026 VOILA</span>
        <Link href="/legal">{t("nav.legal")}</Link>
        <Link href="/guide">{t("nav.guide")}</Link>
        {LOCALES.filter((l) => l !== locale).map((l) => <Link key={l} href={pathname} locale={l} hrefLang={l}>{LOCALE_LABEL[l]}</Link>)}
        {/* 금액 표기만 바꾼다. 돈은 어느 쪽이든 USDT 로 움직인다 */}
        <button type="button" onClick={() => setCurrency(currency === "KRW" ? "USD" : "KRW")}>{t(currency === "KRW" ? "nav.showUsd" : "nav.showKrw")}</button>
      </div>
    </footer>
  );
}
