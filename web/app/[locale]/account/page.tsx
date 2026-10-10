import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/AppShell";
import { AccountScreen } from "@/components/account/AccountScreen";

/** 계정: 지갑, 보관함, 보안, 도움, 로그아웃. 결정은 각 행이 연 화면에서. */
export default function AccountPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <AppShell><AccountScreen /></AppShell>;
}
