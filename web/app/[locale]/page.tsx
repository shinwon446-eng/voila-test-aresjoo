import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/AppShell";
import { BoxList } from "@/components/box/BoxList";

/** 메인: 박스 목록. 결정 하나(어느 박스를 볼지). */
export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <AppShell wide><BoxList /></AppShell>;
}
