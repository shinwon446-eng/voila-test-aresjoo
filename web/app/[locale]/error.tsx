"use client";
import { ErrorScreen } from "@/components/shell/StateScreens";

/** 화면을 그리다 실패했을 때. 다시 불러오기 하나만 둔다. */
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <ErrorScreen reset={reset} />;
}
