import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/AppShell";
import { WinsScreen } from "@/components/box/WinsScreen";

/** 나온 상품: 참고가가 그때의 박스 1회 가격의 두 배 이상인 실제 개봉 기록을 새것부터 쌓는다. 줄을 누르면 상세와 그 기록의 검증으로 간다. */
export default function WinsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <AppShell><WinsScreen /></AppShell>;
}
