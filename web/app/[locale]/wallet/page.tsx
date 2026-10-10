import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/AppShell";
import { WalletScreen } from "@/components/wallet/WalletScreen";

/** 지갑: 잔액과 내역. 결정 하나(충전할지). */
export default function WalletPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <AppShell><WalletScreen /></AppShell>;
}
