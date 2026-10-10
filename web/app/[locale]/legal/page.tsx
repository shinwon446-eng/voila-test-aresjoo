import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/AppShell";
import { LegalCenterScreen } from "@/components/legal/LegalCenterScreen";

/** 약관과 정책 목록. 결정 하나: 어느 문서를 읽을지. */
export default function LegalCenter({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <AppShell><LegalCenterScreen /></AppShell>;
}
