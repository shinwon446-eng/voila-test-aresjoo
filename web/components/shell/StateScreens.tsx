"use client";
/**
 * 상태 화면: 없는 주소, 불러오지 못함, 오프라인 한 줄. 각각 결정 하나(다음에 갈 곳)만 둔다.
 */
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/authStore";
import { AppShell } from "@/components/shell/AppShell";
import { Button, ButtonLink, ScreenHead } from "@/components/ui/kit";

export function NotFoundScreen() {
  const t = useTranslations("v");
  return (
    <AppShell>
      <div className="v-stack v-stack--lg">
        <ScreenHead title={t("state.notFoundTitle")} desc={t("state.notFoundDesc")} />
        <ButtonLink href="/">{t("state.toBoxes")}</ButtonLink>
      </div>
    </AppShell>
  );
}

export function ErrorScreen({ reset }: { reset: () => void }) {
  const t = useTranslations("v");
  return (
    <AppShell>
      <div className="v-stack v-stack--lg">
        <ScreenHead title={t("state.errorTitle")} desc={t("state.errorDesc")} />
        <Button onClick={reset}>{t("state.retry")}</Button>
      </div>
    </AppShell>
  );
}

/** 연결이 끊기면 머리줄 아래에 한 줄. 다시 연결되면 사라진다. */
/** 세션이 끝났을 때 한 줄. 로그인하면 사라진다. 팝업이 아니다 */
export function SessionLine() {
  const t = useTranslations("v");
  const lost = useAuthStore((s) => s.sessionLost);
  const openLogin = useAuthStore((s) => s.openAuthModal);
  if (!lost) return null;
  return <p role="status" className="v-offline">{t("state.sessionLost")} <button type="button" className="v-link" onClick={() => openLogin("login")}>{t("nav.login")}</button></p>;
}

export function OfflineLine() {
  const t = useTranslations("v");
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => { window.removeEventListener("online", sync); window.removeEventListener("offline", sync); };
  }, []);
  if (!offline) return null;
  return <p role="status" className="v-offline">{t("state.offline")}</p>;
}
