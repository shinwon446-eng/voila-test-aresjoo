"use client";
/** 꼬리말: 약관, 이용 방법, 언어. 한 줄로 끝낸다. */
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LOCALES, LOCALE_LABEL } from "@/i18n/routing";

export function AppFooter() {
  const t = useTranslations("v");
  const locale = useLocale();
  const pathname = usePathname();
  return (
    <footer className="v-footer">
      <div className="v-footer-in">
        <span>© 2026 VOILA</span>
        <Link href="/legal">{t("nav.legal")}</Link>
        <Link href="/guide">{t("nav.guide")}</Link>
        {LOCALES.filter((l) => l !== locale).map((l) => <Link key={l} href={pathname} locale={l} hrefLang={l}>{LOCALE_LABEL[l]}</Link>)}
      </div>
    </footer>
  );
}
