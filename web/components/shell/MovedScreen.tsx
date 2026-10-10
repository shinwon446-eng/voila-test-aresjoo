"use client";
/**
 * 옛 주소에 남은 화면. 옛 디자인을 띄우는 대신 새 화면으로 가는 길 하나만 둔다(정적 export 라 서버 리다이렉트가 없다).
 * 북마크나 검색 결과로 들어온 사람이 막히지 않게 한다.
 */
import { useTranslations } from "next-intl";
import { ButtonLink, ScreenHead } from "@/components/ui/kit";

export function MovedScreen({ to, labelKey }: { to: string; labelKey: string }) {
  const t = useTranslations("v");
  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead title={t("state.movedTitle")} desc={t("state.movedDesc")} />
      <ButtonLink href={to}>{t(labelKey)}</ButtonLink>
    </div>
  );
}
