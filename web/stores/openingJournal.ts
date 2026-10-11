"use client";
/**
 * 개봉 기록장. 구매가 끝나 결과가 정해진 순간 한 줄을 남기고, 결과를 화면에 보여 준 뒤 "봤음"으로 바꾼다.
 * 연출 중에 새로 고치거나 화면을 떠나도 결과는 이미 보관함과 잔액에 들어가 있다. 이 기록장은 "아직 못 본 결과"를
 * 다시 보여 주기 위한 것이다. 돌아왔을 때 새로 뽑지 않고 이 줄이 가리키는 보관함 기록을 그대로 보여 준다.
 *
 * 돈과 상품은 여기서 움직이지 않는다(지갑과 보관함이 정본). 이 저장소가 지워져도 잃는 것은 "다시 보여 주기"뿐이다.
 * 줄마다 거래 번호(id)가 있어 구매, 결과, USDT 로 받기를 한 줄로 따라갈 수 있다.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface OpeningEntry {
  /** 이 개봉의 거래 번호. 같은 번호로 두 번 기록되지 않는다 */
  id: string;
  accountId: string;
  boxSlug: string;
  count: number;
  costUsdt: number;
  /** 결과로 배정된 보관함 기록의 번호(결과의 정본) */
  ownedIds: string[];
  /** 열기 직전 잔액. 다시 보여 줄 때 "이번 개봉으로 얼마가 달라졌는지"를 같은 숫자로 말하기 위해 남긴다 */
  balanceBefore: number;
  at: string;
  /** 결과를 화면에 보여 준 시각. 없으면 아직 못 본 결과다 */
  revealedAt?: string;
}

interface JournalState {
  entries: OpeningEntry[];
  hydrated: boolean;
  /** 결과가 정해진 직후에 부른다. 같은 id 는 한 번만 들어간다 */
  commit: (entry: Omit<OpeningEntry, "at">) => void;
  markRevealed: (id: string) => void;
  /** 이 계정이 아직 못 본 가장 최근 결과 */
  pendingFor: (accountId: string) => OpeningEntry | null;
}

const KEEP = 20;

export const useOpeningJournal = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      hydrated: false,
      commit: (entry) => set((s) => (s.entries.some((e) => e.id === entry.id) ? s : { entries: [{ ...entry, at: new Date().toISOString() }, ...s.entries].slice(0, KEEP) })),
      markRevealed: (id) => set((s) => ({ entries: s.entries.map((e) => (e.id === id && !e.revealedAt ? { ...e, revealedAt: new Date().toISOString() } : e)) })),
      pendingFor: (accountId) => get().entries.find((e) => e.accountId === accountId && !e.revealedAt) ?? null,
    }),
    {
      name: "voila.opening-journal",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ entries: s.entries }),
      skipHydration: true,
      onRehydrateStorage: () => () => useOpeningJournal.setState({ hydrated: true }),
    },
  ),
);

export const newOpeningId = (): string => `op_${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2, 8)}`;
