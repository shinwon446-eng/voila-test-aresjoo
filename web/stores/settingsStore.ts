"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ReceiveMethod = "ship" | "usdt";

interface SettingsState {
  muted: boolean;
  toggleMuted: () => void;
  /** 개봉 장면의 소리와 진동. 기본은 끔이고 사용자가 켠 것을 기억한다(opening/DECISIONS.md 1-9). 기기의 취향이라 계정과 무관하다. */
  openSound: boolean;
  /** 개봉 연출을 짧게 보기. 사용자가 켠다. 반복 횟수로 자동으로 줄이지 않는다. */
  openShort: boolean;
  /**
   * 상품을 자동으로 USDT 로 받기. 되돌릴 수 없는 일에 대한 동의라서 계정마다 따로 적는다.
   * 한 계정이 켠 것이 같은 기기의 다른 계정에 적용되지 않는다. 사용자가 기준을 보고 직접 켠 계정만 참이다.
   */
  autoTakeBy: Record<string, boolean>;
  /** 받는 방법 시트에서 지난번에 고른 방법(계정별). 다음에 미리 골라 둔다. */
  lastReceiveBy: Record<string, ReceiveMethod>;
  setOpenSound: (on: boolean) => void;
  setOpenShort: (on: boolean) => void;
  setAutoTake: (accountId: string, on: boolean) => void;
  setLastReceive: (accountId: string, method: ReceiveMethod) => void;
}

/** 효과음 토글 (CLAUDE.md 접근성: 언박싱, 호버 사운드 Mute 제공). 배경 음악 기능은 제거했다(2026-10-01). */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      muted: false,
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
      openSound: false,
      openShort: false,
      autoTakeBy: {},
      lastReceiveBy: {},
      setOpenSound: (openSound) => set({ openSound }),
      setOpenShort: (openShort) => set({ openShort }),
      setAutoTake: (accountId, on) => set((s) => ({ autoTakeBy: { ...s.autoTakeBy, [accountId]: on } })),
      setLastReceive: (accountId, method) => set((s) => ({ lastReceiveBy: { ...s.lastReceiveBy, [accountId]: method } })),
    }),
    {
      name: "gachaflix.settings",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      // 예전 저장값의 bgm* 필드는 무시된다. 아래 필드만 읽고 쓴다
      partialize: (s) => ({ muted: s.muted, openSound: s.openSound, openShort: s.openShort, autoTakeBy: s.autoTakeBy, lastReceiveBy: s.lastReceiveBy }),
    },
  ),
);
