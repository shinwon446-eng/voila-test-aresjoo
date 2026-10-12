"use client";
/**
 * 화면 위에 겹치는 흐름의 열림 상태. 어느 화면에서든 열 수 있고, 닫히면 열었던 화면이 그대로 남아 있다.
 *   charge: USDT 충전 시트. 충전이 끝나면 스스로 닫혀 하던 일로 돌아간다.
 *   menu: 모바일 메뉴 시트.
 *   balance: 잔액 시트(머리줄의 잔액). 여기서 USDT로 받기, 충전, 출금으로 간다. 시트를 겹쳐 쌓지 않고 같은 자리에서 바뀐다.
 */
import { create } from "zustand";

interface FlowState {
  charge: boolean;
  menu: boolean;
  balance: boolean;
  openCharge: () => void;
  closeCharge: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  openBalance: () => void;
  closeBalance: () => void;
}

export const useFlow = create<FlowState>()((set) => ({
  charge: false,
  menu: false,
  balance: false,
  openCharge: () => set({ charge: true }),
  closeCharge: () => set({ charge: false }),
  openMenu: () => set({ menu: true }),
  closeMenu: () => set({ menu: false }),
  openBalance: () => set({ balance: true }),
  closeBalance: () => set({ balance: false }),
}));
