import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/AppShell";
import { WinsScreen } from "@/components/box/WinsScreen";

/** 나온 상품: 낸 값의 두 배 이상이 나온 실제 개봉 기록을 새것부터 쌓는다. 기록마다 검증으로 간다. */
export default function WinsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <AppShell><WinsScreen /></AppShell>;
}
