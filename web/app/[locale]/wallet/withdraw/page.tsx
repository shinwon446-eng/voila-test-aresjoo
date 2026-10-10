import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/AppShell";
import { WithdrawScreen } from "@/components/wallet/WithdrawScreen";

/** 출금: 입력, 확인, 인증, 신청함. 단계마다 화면 하나. */
export default function WithdrawPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <AppShell><WithdrawScreen /></AppShell>;
}
