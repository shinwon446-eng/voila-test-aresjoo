"use client";
/**
 * 약관과 정책 목록. 결정 하나: 어느 문서를 읽을지. 묶음 셋(기본, 거래, 권리)에 문서 행. 문구는 옛 legalCenter, legalDocs 그대로.
 */
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LEGAL_EFFECTIVE_DATE, LEGAL_GROUPS, LEGAL_VERSION } from "@/lib/legal";
import { ScreenHead } from "@/components/ui/kit";

export function LegalCenterScreen() {
  const t = useTranslations("legalCenter");
  const d = useTranslations("legalDocs");
  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead title={t("title")} desc={t("intro")} />
      <p className="v-small">{t("version", { version: LEGAL_VERSION })}, {t("effective", { date: LEGAL_EFFECTIVE_DATE })}</p>
      {LEGAL_GROUPS.map((group) => (
        <section key={group.key} className="v-stack" aria-labelledby={"legal-" + group.key}>
          <h2 id={"legal-" + group.key} className="v-section">{t("groups." + group.key)}</h2>
          <div className="v-rows">
            {group.docs.map((doc) => (
              <div key={doc} className="v-rowitem"><Link href={"/legal/" + doc} className="v-row v-row--link"><span>{d(doc + ".title")}</span><span aria-hidden>›</span></Link></div>
            ))}
          </div>
        </section>
      ))}
      <p className="v-small">{t("sourcesNote")}</p>
    </div>
  );
}
