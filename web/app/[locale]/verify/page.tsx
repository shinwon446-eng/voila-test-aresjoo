import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/AppShell";
import { VerifyScreen } from "@/components/verify/VerifyScreen";

/** 개봉 결과 검증: 내 기록 다시 계산, 값을 직접 넣어 계산. 옛 /fairness 를 대신한다. 주소의 값(useSearchParams)을 읽으므로 Suspense 가 필요하다. */
export default function VerifyPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <AppShell><Suspense fallback={null}><VerifyScreen /></Suspense></AppShell>;
}
