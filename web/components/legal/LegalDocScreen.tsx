"use client";
/**
 * 약관 문서 하나. 제목, 요약, 버전, 절(제목과 본문). 장식 없이 읽기만. 아래에 목록으로 돌아가는 링크 하나.
 */
import { useTranslations } from "next-intl";
import { LEGAL_EFFECTIVE_DATE, LEGAL_VERSION, type LegalDoc } from "@/lib/legal";
import { ScreenHead, TextLink } from "@/components/ui/kit";

export function LegalDocScreen({ doc }: { doc: LegalDoc }) {
  const t = useTranslations("legalDocs");
  const c = useTranslations("legalCenter");
  const sections = t.raw(doc + ".sections") as { h: string; p: string }[];
  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead back="/legal" backLabel={c("title")} title={t(doc + ".title")} desc={t(doc + ".summary")} />
      <p className="v-small">{c("version", { version: LEGAL_VERSION })}, {c("effective", { date: LEGAL_EFFECTIVE_DATE })}</p>
      <article className="v-stack v-stack--lg">
        {sections.map((s, i) => (
          <section key={i} className="v-stack v-stack--sm">
            <h2 className="v-section">{s.h}</h2>
            <p className="v-body v-prose">{s.p}</p>
          </section>
        ))}
      </article>
      <div className="v-links"><TextLink href="/legal">{c("title")}</TextLink></div>
    </div>
  );
}
