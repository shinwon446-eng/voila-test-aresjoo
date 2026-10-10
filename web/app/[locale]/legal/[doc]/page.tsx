import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { LEGAL_DOCS, type LegalDoc } from "@/lib/legal";
import { AppShell } from "@/components/shell/AppShell";
import { LegalDocScreen } from "@/components/legal/LegalDocScreen";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => LEGAL_DOCS.map((doc) => ({ locale, doc })));
}
export const dynamicParams = false;

/** 약관 문서 하나. 본문은 세 언어 문구 파일(legalDocs)에 있다. */
export default function LegalPage({ params: { locale, doc } }: { params: { locale: string; doc: string } }) {
  if (!(LEGAL_DOCS as readonly string[]).includes(doc)) notFound();
  setRequestLocale(locale);
  return <AppShell><LegalDocScreen doc={doc as LegalDoc} /></AppShell>;
}
