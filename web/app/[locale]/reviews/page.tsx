import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/AppShell";
import { ReviewsScreen } from "@/components/box/ReviewsScreen";

/** 후기 모아보기. 박스 화면의 "후기 모두 보기"에서 넘어온다(주소의 box 로 그 박스가 골라진다). */
export default function ReviewsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <AppShell wide><Suspense fallback={null}><ReviewsScreen /></Suspense></AppShell>;
}
