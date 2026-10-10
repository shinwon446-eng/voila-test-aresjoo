import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/AppShell";
import { MovedScreen } from "@/components/shell/MovedScreen";

/** 옛 주소. 새 화면(/verify)으로 가는 길 하나. */
export default function MovedPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <AppShell><MovedScreen to="/verify" labelKey="nav.verify" /></AppShell>;
}
