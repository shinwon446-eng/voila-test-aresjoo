/**
 * 브라우저 장부(지갑, 보관함, 회차)를 쓰는 일의 앞뒤를 지킨다. 서버 장부가 아니므로 완전한 보장은 아니고, 아는 위험을 막는 장치다.
 *   1. 여러 탭: 같은 계정의 장부를 쓰는 일은 Web Locks 로 한 번에 하나씩만 한다. 잠금 안에서 저장소를 다시 읽어
 *      다른 탭이 쓴 최신 장부 위에서 계산한다(오래된 장부로 덮어쓰지 않게).
 *   2. 계정 전환: 일을 시작할 때의 장부(계정)와 끝낼 때의 장부가 같은지 확인한다. 다르면 던진다.
 *   3. 저장 실패: 저장소가 꽉 차면 이 사이트의 저장소 래퍼는 조용히 넘어간다. 돈이 움직이는 일 앞에서 실제로 써지는지 먼저 확인한다.
 * Web Locks 가 없는 브라우저와 테스트 환경에서는 잠금 없이 그대로 실행한다.
 */
import { useFairStore } from "../stores/fairStore";
import { useInventoryStore } from "../stores/inventoryStore";
import { useWalletStore } from "../stores/walletStore";

export class LedgerUnavailable extends Error {}
export class LedgerAccountChanged extends Error {}

/** 지금 장부가 가리키는 계정(저장 키). 계정을 바꾸면 이 값이 바뀐다. ledgerSource 는 테스트가 계정 전환을 흉내 낼 수 있게 둔 손잡이다 */
export const ledgerSource = { key: (): string => useWalletStore.persist?.getOptions?.().name ?? "memory" };
export const ledgerKey = (): string => ledgerSource.key();

/** 시작할 때의 장부와 지금 장부가 다르면 던진다 */
export function assertSameLedger(key: string): void {
  if (ledgerKey() !== key) throw new LedgerAccountChanged("ledger account changed during the operation");
}

/** 저장소에 실제로 써지는지 확인한다. 브라우저가 아니면 통과 */
export function assertLedgerWritable(): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;
  try {
    const probe = "voila.ledger-probe"; const value = String(Date.now());
    localStorage.setItem(probe, value);
    const ok = localStorage.getItem(probe) === value;
    localStorage.removeItem(probe);
    if (!ok) throw new LedgerUnavailable("browser storage did not keep the write");
  } catch (error) {
    if (error instanceof LedgerUnavailable) throw error;
    throw new LedgerUnavailable("browser storage is not writable");
  }
}

async function refresh(): Promise<void> {
  if (typeof window === "undefined") return;
  // 다른 탭이 쓴 장부를 다시 읽는다. 같은 탭만 쓰고 있었다면 방금 쓴 값을 다시 읽을 뿐이다.
  await Promise.all([useWalletStore.persist?.rehydrate?.(), useInventoryStore.persist?.rehydrate?.(), useFairStore.persist?.rehydrate?.()]);
}

/** 장부를 쓰는 일 하나를 계정별 잠금 안에서 실행한다 */
export async function withLedgerLock<T>(work: () => Promise<T> | T): Promise<T> {
  const key = ledgerKey();
  const locks = typeof navigator !== "undefined" ? (navigator as Navigator & { locks?: LockManager }).locks : undefined;
  const run = async () => { assertLedgerWritable(); await refresh(); assertSameLedger(key); return work(); };
  if (!locks || typeof window === "undefined") return run();
  return locks.request(`voila-ledger:${key}`, run) as Promise<T>;
}
