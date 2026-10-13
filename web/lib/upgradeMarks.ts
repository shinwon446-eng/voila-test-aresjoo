/**
 * 업그레이드의 확인 대기 표시(flow/MELT_SPEC.md U8). 받기의 표시(lib/takeBatch)와 같은 뜻이고 같은 식으로 다룬다:
 * 장부를 바꾸기 전에 적고, 끝이 확인되면 지우는 작은 저장 키다. 계정마다 따로다.
 *   id      추첨의 번호
 *   stake   건 상품의 보관 상품 id
 *   target  성공했을 때 보관함에 들어올 목표 상품의 보관 상품 id
 * 표시가 남아 있는 동안 두 상품은 "확인 필요"다. 걸 수도, USDT 로 받을 수도 없다(lib/takeBatch 가 이 표시를 함께 읽는다).
 * 이 파일은 표시를 읽고 쓰기만 한다. 판정은 lib/upgradeSettle 이 한다(lib/takeBatch 와 서로 물리지 않게 따로 뗐다).
 */
import { ledgerKey } from "./ledgerLock";

/** dev 가 참인 표시는 개발 서버의 시험 스위치가 남긴 것이다. 다시 볼 때 풀지 않는다(확인 필요 상태를 화면에서 계속 볼 수 있게) */
export interface UpgradeMark { id: string; stake: string; target: string; dev?: boolean }

const memoryMarks = new Map<string, string>();
/** 표시의 저장 키. 계정(장부 저장 키)에 묶인다. 일을 시작할 때 잡은 계정으로 끝까지 읽고 쓰려면 그 값을 넘긴다 */
const markKey = (ledger: string = ledgerKey()): string => "voila.upgrade-unconfirmed." + ledger;
function markStore(): Storage | null {
  try { return typeof localStorage !== "undefined" && localStorage ? localStorage : null; } catch { return null; }
}
function rawMarks(ledger?: string): string | null {
  const store = markStore();
  if (!store) return memoryMarks.get(markKey(ledger)) ?? null;
  return store.getItem(markKey(ledger)) ?? null;
}

/** 읽지 못하거나 풀지 못하면 던진다 */
export function readUpgradeMarks(ledger?: string): UpgradeMark[] {
  const raw = rawMarks(ledger);
  if (raw === null) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("upgrade marks are not a list");
  return parsed.map((entry) => {
    const e = entry as Partial<UpgradeMark> | null;
    if (!e || typeof e.id !== "string" || typeof e.stake !== "string" || typeof e.target !== "string") throw new Error("upgrade mark is malformed");
    return { id: e.id, stake: e.stake, target: e.target, ...(e.dev === true ? { dev: true } : {}) };
  });
}

/** 적고, 적혔는지 다시 읽어 확인한다. 저장 한도 때문에 조용히 빠진 쓰기와 지워지지 않은 표시도 여기서 잡힌다 */
export function writeUpgradeMarks(marks: UpgradeMark[], ledger?: string): boolean {
  const text = marks.length ? JSON.stringify(marks) : null;
  const key = markKey(ledger);
  try {
    const store = markStore();
    if (!store) { if (text === null) memoryMarks.delete(key); else memoryMarks.set(key, text); return true; }
    if (text === null) store.removeItem(key); else store.setItem(key, text);
    return rawMarks(ledger) === text;
  } catch { return false; }
}

/** 표시가 남은 보관 상품 id(건 상품과 목표 상품 둘 다) */
export function upgradeHoldIds(marks: UpgradeMark[]): string[] {
  return marks.flatMap((mark) => [mark.stake, mark.target]);
}
