"use client";
/**
 * 화면 위에 겹치는 흐름의 열림 상태. 어느 화면에서든 열 수 있고, 닫히면 열었던 화면이 그대로 남아 있다.
 *   charge: USDT 충전 시트. 충전이 끝나면 스스로 닫혀 하던 일로 돌아간다.
 *   menu: 모바일 메뉴 시트.
 */
import { create } from "zustand";

interface FlowState {
  charge: boolean;
  menu: boolean;
  openCharge: () => void;
  closeCharge: () => void;
  openMenu: () => void;
  closeMenu: () => void;
}

export const useFlow = create<FlowState>()((set) => ({
  charge: false,
  menu: false,
  openCharge: () => set({ charge: true }),
  closeCharge: () => set({ charge: false }),
  openMenu: () => set({ menu: true }),
  closeMenu: () => set({ menu: false }),
}));
