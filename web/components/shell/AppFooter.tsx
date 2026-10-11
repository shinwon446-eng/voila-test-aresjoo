"use client";
/**
 * 꼬리말(2026-10-11 파운더: TETH 의 꼬리말과 같은 짜임으로, 브랜드 색 바탕에).
 * 위에서부터: 고객 관계 요약과 팔로우 줄 → 메뉴 네 묶음과 서비스 소개 → 구호 → 화면 폭을 채우는 이름.
 *   - 언어와 표시 통화를 바꾸는 곳은 여기뿐이다("설정" 묶음). 금액 표기만 바뀌고 돈은 어느 쪽이든 USDT 로 움직인다.
 *   - 팔로우 주소는 lib/social.ts 에 있다. 주소가 비어 있는 곳은 누를 수 없는 그림으로만 나온다(없는 주소로 보내지 않는다).
 */
import { Instagram, Send, Youtube } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LOCALES, LOCALE_LABEL } from "@/i18n/routing";
import { SOCIAL, type SocialKey } from "@/lib/social";
import { useCurrency } from "@/lib/useCurrency";

const ICON: Record<SocialKey, React.ReactNode> = {
  x: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
  instagram: <Instagram size={20} aria-hidden />,
  youtube: <Youtube size={22} aria-hidden />,
  telegram: <Send size={19} aria-hidden />,
};
const NAME: Record<SocialKey, string> = { x: "X", instagram: "Instagram", youtube: "YouTube", telegram: "Telegram" };

export function AppFooter() {
  const t = useTranslations("v");
  const locale = useLocale();
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  return (
    <footer className="v-footer">
      <div className="v-footer-top">
        <Link href="/guide" className="v-footer-crs">{t("footer.crs")}</Link>
        <div className="v-footer-follow">
          <span>{t("footer.follow")}</span>
          {(Object.keys(SOCIAL) as SocialKey[]).map((key) => SOCIAL[key]
            ? <a key={key} href={SOCIAL[key]} target="_blank" rel="noreferrer" aria-label={NAME[key]}>{ICON[key]}</a>
            : <span key={key} className="v-footer-icon">{ICON[key]}</span>)}
        </div>
      </div>
      <div className="v-footer-body">
        <nav className="v-footer-cols" aria-label={t("nav.menu")}>
          <div>
            <h2>{t("footer.colProduct")}</h2>
            <Link href="/">{t("nav.boxes")}</Link>
            <Link href="/inventory">{t("nav.inventory")}</Link>
            <Link href="/wallet">{t("nav.wallet")}</Link>
          </div>
          <div>
            <h2>{t("footer.colHelp")}</h2>
            <Link href="/guide">{t("nav.guide")}</Link>
            <Link href="/verify">{t("nav.verify")}</Link>
          </div>
          <div>
            <h2>{t("footer.colTerms")}</h2>
            <Link href="/legal">{t("nav.legal")}</Link>
          </div>
          <div>
            <h2>{t("footer.colSettings")}</h2>
            {LOCALES.filter((l) => l !== locale).map((l) => <Link key={l} href={pathname} locale={l} hrefLang={l}>{LOCALE_LABEL[l]}</Link>)}
            <button type="button" onClick={() => setCurrency(currency === "KRW" ? "USD" : "KRW")}>{t(currency === "KRW" ? "nav.showUsd" : "nav.showKrw")}</button>
          </div>
        </nav>
        <div className="v-footer-about">
          <p>{t("footer.about1")}</p>
          <p><strong>You never know what’s next.</strong></p>
          <p>{t("footer.about2")}</p>
          <p>{t("footer.rights")}</p>
        </div>
      </div>
      <p className="v-footer-slogan">OPEN IT, OWN IT</p>
      {/* 이름: 글자 폭을 화면 폭에 맞춘다 */}
      <svg className="v-footer-name" viewBox="0 0 1000 232" role="img" aria-label="VOILA">
        <text x="0" y="232" textLength="1000" lengthAdjust="spacingAndGlyphs">VOILA</text>
      </svg>
    </footer>
  );
}
