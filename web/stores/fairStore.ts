"use client";

/**
 * Provably Fair 세션 (데모).
 *
 * 실제 서비스에서는 서버 시드가 서버에만 있고 해시만 내려온다. 정적 데모라 서버가 없으므로
 * 브라우저가 시드를 만들고 "해시만 먼저 보여주는" 절차를 그대로 따른다.
 *   , serverSeed 는 세션 동안 유지, hash 는 언제나 화면에 공개
 *   , nonce 는 오픈마다 1 증가 (persist)
 *   , clientSeed 는 유저가 바꿀 수 있다 (persist)
 *   , 개봉 후 결과 팝업이 serverSeed 원문을 보여주고, 검증기가 그 값으로 재현한다
 *
 * 회차의 계약(flow/REVIEW_codex-4.md 2.4):
 *   - 회차는 서버 시드 하나 안에서 줄어들지 않는다. 내 기기 값을 바꿔도, 같은 값을 다시 넣어도, 예전 값으로 돌아가도 이어서 센다.
 *     새로 세는 것은 서버 시드를 바꿀 때뿐이다. 그래서 같은 (서버 시드, 내 기기 값, 회차)가 두 번 쓰이지 않는다.
 *   - 추첨에 쓸 회차는 reserveNonces 로만 받는다(박스 개봉 lib/opening, 업그레이드 lib/upgradeSettle).
 *     저장된 값을 다시 읽어 그 위에서 회차를 받고, 받은 것이 저장됐는지 확인한다. 확인되지 않은 회차로는 추첨하지 않는다
 *     (저장되지 않은 회차는 다음 추첨이 다시 받는다. 적용된 추첨끼리 회차가 겹치면 안 된다).
 *     이 저장 키는 계정과 무관하게 하나라서, 계정별 장부 잠금과 따로 이 키만의 잠금(Web Locks)을 건다. 잠금 순서는 언제나 장부 다음에 이것이다.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { generateClientSeed, generateServerSeed, hashServerSeed } from "@/lib/fairness";

interface FairState {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  hydrated: boolean;
  /** 마운트 후 서버 시드가 없으면 만들고 해시를 계산한다 */
  ensureSeeds: () => Promise<void>;
  /** 서버 시드 교체, 이전 시드는 결과 팝업에서 이미 공개됐다 */
  rotateServerSeed: () => Promise<void>;
  /** 내 기기 값을 바꾼다. 회차는 그대로 이어서 센다(0 으로 돌리지 않는다) */
  setClientSeed: (s: string) => void;
  /** 이번 오픈에 쓸 nonce 를 돌려주고 1 올린다. 추첨에 쓸 회차는 이것을 직접 부르지 말고 reserveNonces 로 받는다 */
  takeNonce: () => number;
}

export const useFairStore = create<FairState>()(
  persist(
    (set, get) => ({
      serverSeed: "",
      serverSeedHash: "",
      clientSeed: "",
      nonce: 0,
      hydrated: false,
      ensureSeeds: async () => {
        const s = get();
        const next: Partial<FairState> = {};
        if (!s.serverSeed) {
          const seed = generateServerSeed();
          next.serverSeed = seed;
          next.serverSeedHash = await hashServerSeed(seed);
        }
        if (!s.clientSeed) next.clientSeed = generateClientSeed();
        if (Object.keys(next).length) set(next);
      },
      rotateServerSeed: async () => {
        const seed = generateServerSeed();
        set({ serverSeed: seed, serverSeedHash: await hashServerSeed(seed), nonce: 0 });
      },
      setClientSeed: (clientSeed) => set({ clientSeed: clientSeed.trim() || generateClientSeed() }),
      takeNonce: () => {
        const n = get().nonce;
        set({ nonce: n + 1 });
        return n;
      },
    }),
    {
      name: "gachaflix.fair",
      storage: createJSONStorage(() => localStorage),
      // 서버 시드도 저장한다, 데모라 브라우저가 "서버" 역할. 새로고침해도 커밋이 유지되어야 검증이 성립한다.
      partialize: (s) => ({ serverSeed: s.serverSeed, serverSeedHash: s.serverSeedHash, clientSeed: s.clientSeed, nonce: s.nonce }),
      skipHydration: true,
      onRehydrateStorage: () => () => useFairStore.setState({ hydrated: true }),
    },
  ),
);

/** 추첨에 쓰려고 받아 둔 회차와, 그 회차를 받을 때의 값들. 추첨은 이 값들로만 계산한다 */
export interface NonceReservation { serverSeed: string; serverSeedHash: string; clientSeed: string; nonces: number[] }

async function reserve(count: number): Promise<NonceReservation | null> {
  const persist = useFairStore.persist;
  const options = persist?.getOptions();
  type Saved = { serverSeed?: unknown; serverSeedHash?: unknown; clientSeed?: unknown; nonce?: unknown } | undefined;
  const readSaved = async (): Promise<Saved> => (options?.storage && options.name ? ((await options.storage.getItem(options.name))?.state as Saved) : undefined);
  try {
    // 다른 탭이 올린 회차 위에서 받는다(기억 속 값이 저장된 값보다 뒤처져 있을 수 있다).
    // 스토어의 rehydrate 는 쓰지 않는다: 쓰기가 던지는 저장소에서는 그 약속이 끝나지 않는다. 저장된 값을 직접 읽어 맞춘다.
    // 같은 시드 쌍이면 둘 가운데 큰 회차에서 이어 간다(회차는 줄어들지 않는다). 시드가 다르면(다른 탭이 바꿨다) 저장된 것을 따른다
    if (persist) {
      const s = await readSaved();
      const mem = useFairStore.getState();
      if (s && typeof s.serverSeed === "string" && s.serverSeed && typeof s.serverSeedHash === "string" && typeof s.clientSeed === "string" && s.clientSeed && typeof s.nonce === "number" && Number.isSafeInteger(s.nonce) && s.nonce >= 0) {
        const same = s.serverSeed === mem.serverSeed && s.clientSeed === mem.clientSeed;
        const next = { serverSeed: s.serverSeed, serverSeedHash: s.serverSeedHash, clientSeed: s.clientSeed, nonce: same ? Math.max(s.nonce, mem.nonce) : s.nonce };
        if (!same || next.nonce !== mem.nonce) { try { useFairStore.setState(next); } catch { /* 아래에서 저장됐는지 다시 본다 */ } }
      }
    }
    await useFairStore.getState().ensureSeeds();
    const fair = useFairStore.getState();
    const { serverSeed, serverSeedHash, clientSeed } = fair;
    if (!serverSeed || !clientSeed) return null;
    const nonces = Array.from({ length: count }, () => fair.takeNonce());
    // 저장소 없이 만들어진 스토어(서버, 저장소 없는 테스트)에서는 기억 속 값이 곧 저장된 값이다
    if (!persist) return { serverSeed, serverSeedHash, clientSeed, nonces };
    if (!options?.storage || !options.name) return null;
    const saved = await readSaved();
    const kept = !!saved && saved.serverSeed === serverSeed && saved.clientSeed === clientSeed && typeof saved.nonce === "number" && saved.nonce > nonces[nonces.length - 1];
    return kept ? { serverSeed, serverSeedHash, clientSeed, nonces } : null;
  } catch {
    // 읽지 못했거나 쓰지 못했다. 받은 것이 저장됐는지 알 수 없으므로 쓰지 않는다
    return null;
  }
}

/**
 * 추첨에 쓸 회차 count 개를 받는다. 받은 것이 저장된 것까지 확인됐을 때만 돌려주고, 아니면 null 이다(그때는 추첨하지 않는다).
 * 탭 사이에서는 이 저장 키만의 잠금 안에서 한다. 잠금을 쓸 수 없는 환경(서버, 테스트, 옛 브라우저)에서는 잠금 없이 같은 확인을 한다.
 */
export function reserveNonces(count: number): Promise<NonceReservation | null> {
  if (!Number.isSafeInteger(count) || count < 1) return Promise.resolve(null);
  const locks = typeof navigator !== "undefined" && typeof window !== "undefined" ? (navigator as Navigator & { locks?: LockManager }).locks : undefined;
  if (!locks) return reserve(count);
  return locks.request("voila-fair", () => reserve(count)) as unknown as Promise<NonceReservation | null>;
}
