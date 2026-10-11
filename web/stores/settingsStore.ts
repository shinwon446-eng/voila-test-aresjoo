"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ReceiveMethod = "ship" | "usdt";

interface SettingsState {
  muted: boolean;
  toggleMuted: () => void;
  /** 개봉 장면의 소리와 진동. 기본은 끔이고 사용자가 켠 것을 기억한다(opening/DECISIONS.md 1-9). */
  openSound: boolean;
  /** 개봉 연출을 짧게 보기. 사용자가 켠다. 반복 횟수로 자동으로 줄이지 않는다. */
  openShort: boolean;
  /** 상품을 자동으로 USDT 로 받기. 사용자가 기준을 보고 직접 켠 경우에만 참이다. 낸 값의 20배 이상인 상품에는 적용하지 않는다. */
  autoTake: boolean;
  /** 받는 방법 시트에서 지난번에 고른 방법. 다음에 미리 골라 둔다. */
  lastReceive: ReceiveMethod | null;
  setOpenSound: (on: boolean) => void;
  setOpenShort: (on: boolean) => void;
  setAutoTake: (on: boolean) => void;
  setLastReceive: (method: ReceiveMethod) => void;
}

/** 효과음 토글 (CLAUDE.md 접근성: 언박싱, 호버 사운드 Mute 제공). 배경 음악 기능은 제거했다(2026-10-01). */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      muted: false,
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
      openSound: false,
      openShort: false,
      autoTake: false,
      lastReceive: null,
      setOpenSound: (openSound) => set({ openSound }),
      setOpenShort: (openShort) => set({ openShort }),
      setAutoTake: (autoTake) => set({ autoTake }),
      setLastReceive: (lastReceive) => set({ lastReceive }),
    }),
    {
      name: "gachaflix.settings",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      // 예전 저장값의 bgm* 필드는 무시된다. 아래 필드만 읽고 쓴다
      partialize: (s) => ({ muted: s.muted, openSound: s.openSound, openShort: s.openShort, autoTake: s.autoTake, lastReceive: s.lastReceive }),
    },
  ),
);
