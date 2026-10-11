"use client";

import { useEffect } from "react";
import { useAuthStore, rehydrateAuth } from "@/stores/authStore";
import { useSecurityStore } from "@/stores/securityStore";
import { LoginSheet } from "@/components/flow/LoginSheet";
import { browserAccountsEnabled } from "@/lib/account";
import { restoreBrowserAssets } from "@/lib/browserWallet";
import { useWalletStore } from "@/stores/walletStore";

/**
 * 전역 인증 호스트, `app/[locale]/layout.tsx` 한 곳에 마운트한다.
 *   ① 저장된 세션 복원(`skipHydration` 이라 마운트 후에만 적용 → 서버, 클라 첫 렌더 동일)
 *   ② 로그인/회원가입 모달, 어느 페이지에서든 열린다
 *   ③ 상단 확인 토스트, 페이지마다 토스트를 따로 굴리지 않고 여기서 하나로 띄운다
 */
export function AuthHost() {
  const userId = useAuthStore(s => s.user?.id);

  useEffect(() => {
    // Remove the old unscoped browser secret; account security is fetched from the server.
    try { localStorage.removeItem("voila-security-v1"); } catch { /* Storage may be disabled. */ }
    void rehydrateAuth();
  }, []);
  useEffect(() => {
    if (browserAccountsEnabled()) restoreBrowserAssets(userId ?? null);
    if (userId) {
      // Credit only after switching/restoring the account's wallet namespace.
      const grant = () => {
        const wallet = useWalletStore.getState();
        wallet.setWelcomeAccount(userId);
        wallet.claimWelcome(userId);
        // 가입 혜택: 포켓몬 카드 박스 무료 개봉(계정마다 한 번)
        wallet.claimWelcomeBoxes();
      };
      const wallet = useWalletStore.getState();
      if (wallet.hydrated) grant();
      else {
        let unsubscribe = () => {};
        unsubscribe = useWalletStore.subscribe((state) => {
          if (!state.hydrated) return;
          unsubscribe();
          grant();
        });
      }
      void useSecurityStore.getState().refresh(userId);
    }
  }, [userId]);

  return <LoginSheet />;
}

export default AuthHost;
