"use client";
/**
 * 개봉 기록장. "어떤 개봉의 결과를 이미 보여 줬는가"만 적는다.
 * 결과 자체는 보관함 기록이 정본이고, 그 기록마다 개봉의 거래 번호(openingId)가 붙어 있다(lib/opening 이 구매와 한 번에 쓴다).
 * 그래서 연출 중에 새로 고치거나 떠나도, 이 기록장이 지워지거나 쓰기에 실패해도 결과는 잃지 않는다.
 * 돌아왔을 때 "보관함에는 있는데 봤다는 표시가 없는 개봉"이 있으면 새로 뽑지 않고 그 결과를 다시 보여 준다.
 * 최악의 경우는 이미 본 결과를 한 번 더 보여 주는 것이고, 돈과 상품은 움직이지 않는다.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { OwnedItem } from "./inventoryStore";

interface JournalState {
  /** 결과를 보여 준 개봉의 거래 번호와 그 시각 */
  seen: Record<string, string>;
  hydrated: boolean;
  markSeen: (openingId: string) => void;
}

const KEEP = 400;
/** 이보다 오래된 기록은 다시 보여 주지 않는다(기록장이 지워졌을 때 옛 결과가 한꺼번에 뜨지 않게) */
export const UNSEEN_WINDOW_MS = 7 * 24 * 3600 * 1000;

export const useOpeningJournal = create<JournalState>()(
  persist(
    (set) => ({
      seen: {},
      hydrated: false,
      markSeen: (openingId) => set((s) => {
        if (s.seen[openingId]) return s;
        const entries = [...Object.entries(s.seen), [openingId, new Date().toISOString()] as [string, string]];
        return { seen: Object.fromEntries(entries.slice(-KEEP)) };
      }),
    }),
    {
      name: "voila.opening-journal",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ seen: s.seen }),
      skipHydration: true,
      onRehydrateStorage: () => () => useOpeningJournal.setState({ hydrated: true }),
    },
  ),
);

export const newOpeningId = (): string => `op_${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2, 8)}`;

export interface UnseenOpening { id: string; boxSlug: string; items: OwnedItem[]; }

/** 보관함 기록에서 아직 못 본 개봉을 찾는다. 가장 최근 것부터. 순수 함수. */
export function unseenOpenings(items: OwnedItem[], seen: Record<string, string>, now: number): UnseenOpening[] {
  const groups = new Map<string, UnseenOpening>();
  for (const item of items) {
    if (!item.openingId || seen[item.openingId]) continue;
    if (now - Date.parse(item.acquiredAt) > UNSEEN_WINDOW_MS) continue;
    const group = groups.get(item.openingId) ?? { id: item.openingId, boxSlug: item.boxSlug, items: [] };
    group.items.push(item);
    groups.set(item.openingId, group);
  }
  return Array.from(groups.values()).sort((a, b) => Date.parse(b.items[0].acquiredAt) - Date.parse(a.items[0].acquiredAt));
}
