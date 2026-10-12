/**
 * 보관 중인 상품을 USDT 로 받는 일. 한 개든 여러 개든 이 파일 하나를 거친다(선택 시트 components/flow/TakeSheet,
 * 한 개 받기 lib/openingSettle 의 settleTake). 돈 계산은 바꾸지 않는다. lib/claim 의 takeUsdt 를 그대로 부르고
 * (보관함의 sell 이 상품마다 95%를 소수 둘째 자리로 맞추고 자금 출처대로 나눈다), 이 파일은 그 앞뒤만 지킨다.
 *
 * 받기가 확정됐는지는 한 가지 기준으로 본다(takeStateOf). 받는 일, 미리 보는 금액, 화면의 상태 표시가 전부 이 기준을 쓴다.
 *   held         보관 중이고, 그 상품의 입금 내역이 없고, 확인 대기 표시도 없다 → 받을 수 있다
 *   taken        받은 상태이고 그 상품의 입금 내역이 있다(열 때 잔액으로 들어온 USDT 결과도 여기다)
 *   unconfirmed  받은 상태인데 입금 내역이 없다, 보관 중인데 입금 내역이 있다, 또는 확인 대기 표시가 남아 있다
 *                → 받을 수 없고, 금액에 세지 않고, 화면은 "받았다"고도 "보관 중"이라고도 하지 않는다
 *   other        배송 신청, 배송 중처럼 받기와 무관한 상태
 * 입금 내역은 지갑의 받기 거래 기록(sellback)에 적힌 상품 id 로 찾는다(itemIds, 옛 기록은 ref).
 *
 * 받는 순서(계정별 장부 잠금 안에서, flow/MELT_SPEC.md R8 과 flow/REVIEW_codex-2.md 4절):
 *   1. 저장된 장부를 직접 읽는다(스토어가 쓰는 그 저장소에서 JSON 을 읽어 직접 푼다). 스토어의 기억 속 상태로 판정하지 않는다.
 *      읽지 못하거나, 풀지 못하거나, 있어야 할 기록이 없으면 전부 "알 수 없다"로 답하고 아무것도 실행하지 않는다.
 *   2. 받으려는 상품의 id 를 확인 대기 표시(작은 저장 키)에 먼저 적고, 적혔는지 다시 읽어 확인한다. 적지 못하면 받기를 시작하지 않는다.
 *   3. takeUsdt 를 부른다. 도중에 던져도 여기서 판정하지 않는다.
 *   4. 저장된 장부를 다시 직접 읽어 상품마다 판정한다.
 *        받았다        상품이 받은 상태이고 그 상품의 입금 내역이 있다
 *        받지 못했다  상품이 보관 중이고, 입금 내역이 없고, 저장된 잔액도 설명되지 않게 늘지 않았다
 *        알 수 없다    그 밖 전부(잔액은 늘었는데 내역이 없다, 다시 읽지 못했다 등)
 *   5. 받았거나 깨끗이 받지 못한 상품만 확인 대기 표시에서 지운다. 알 수 없는 상품은 표시가 남아, 다음에 누가 불러도
 *      다시 지급하지 않는다(저장 한도 때문에 큰 쓰기만 빠지고 잔액만 저장된 경우에도 두 번 지급하지 않는다).
 * 같은 계정의 같은 묶음 요청은 한 번만 나간다(연달아 눌러도 같은 약속을 돌려준다). 같은 id 가 두 번 들어와도 한 번만 센다.
 *
 * 한계: 보관함과 지갑은 저장 키가 둘이라 두 쓰기를 하나로 묶지 못한다. 이 파일은 어긋난 장부를 정직하게 말하고 다시 지급하지 않을 뿐,
 * 어긋난 장부를 고치지는 못한다. 잔액 비교는 받는 동안 다른 탭의 입금이 겹치면 받지 못한 상품을 알 수 없다고 답할 수 있다(보수적인 쪽).
 * 장부를 한 번에 확정하는 일은 서버 장부가 있어야 하고, 실제 돈을 붙이기 전의 조건이다(tests/takeFault.test.ts 가 어긋나는 경우들을 재현한다).
 *
 * 화면이 미리 보여 주는 숫자(받을 금액, 카드 몫, 잔액이 모자랄 때 받을 수 있는 최대 금액, 출금 칸에 채울 금액)도 여기서 계산한다.
 * 보관함의 sell 과 같은 식(상품마다 반올림)과 lib/funding 의 attributeRefunds 를 그대로 쓴다(tests/takeBatch.test.ts).
 *
 * 개발 서버에서만(운영 빌드에서는 꺼진다) 세션 저장소의 "voila.opening.fault" 로 상태를 만든다:
 *   settle-failed, settle-pending, settle-partial(고른 것의 앞쪽 절반만 받는다),
 *   settle-unknown(알 수 없다고 답하고 확인 대기 표시를 남긴다. 돈은 움직이지 않는다).
 */
import { takeUsdt } from "./claim";
import { attributeRefunds, normalizeRatio } from "./funding";
import { ledgerKey, withLedgerLock } from "./ledgerLock";
import { REFUND_RATE } from "./products";
import { productOf } from "./vault";
import { useInventoryStore, type OwnedItem } from "../stores/inventoryStore";
import { useWalletStore, type Transaction } from "../stores/walletStore";

const r2 = (n: number): number => +n.toFixed(2);

/** 개발 서버에서만 읽는 시험 스위치. 운영 빌드와 서버에서는 언제나 null 이다 */
export const devOpeningFault = (): string | null => {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") return null;
  try { return window.sessionStorage.getItem("voila.opening.fault"); } catch { return null; }
};

// ── 받기가 확정됐는지: 한 가지 기준 ────────────────────────────────────────────

export type TakeState = "held" | "taken" | "unconfirmed" | "other";
/** 판정에 쓰는 두 자료: 입금 내역이 있는 상품 id, 확인 대기 표시가 남은 상품 id */
export interface TakeLedger { credited: Set<string>; hold: Set<string> }

/** 입금 내역이 있는 상품 id: 받기 거래 기록에 적힌 것 */
export function creditedIdsOf(transactions: Pick<Transaction, "type" | "itemIds" | "ref">[]): Set<string> {
  const out = new Set<string>();
  for (const tx of transactions) {
    if (tx.type !== "sellback") continue;
    for (const id of tx.itemIds ?? (tx.ref ? tx.ref.split(",") : [])) out.add(id);
  }
  return out;
}

/** 열 때 잔액으로 바로 들어온 USDT 결과(옛 박스). 받기를 거치지 않았고 구매와 함께 확정됐다. 상품을 찾지 못하면 100%로 들어온 기록인지로 본다 */
function settledAtPurchase(item: Pick<OwnedItem, "itemId" | "boxSlug" | "valueUsdt" | "soldForUsdt">): boolean {
  const product = productOf(item as OwnedItem);
  return product ? product.kind === "cash" : item.soldForUsdt === item.valueUsdt;
}

export function takeStateOf(item: Pick<OwnedItem, "id" | "status" | "itemId" | "boxSlug" | "valueUsdt" | "soldForUsdt">, ledger: TakeLedger): TakeState {
  const paid = ledger.credited.has(item.id);
  if (item.status === "SOLD") return settledAtPurchase(item) || (paid && typeof item.soldForUsdt === "number") ? "taken" : "unconfirmed";
  if (item.status === "IN_STORAGE") return paid || ledger.hold.has(item.id) ? "unconfirmed" : "held";
  return "other";
}

// 확인 대기 표시: 받기를 시작한 상품 id 를 작은 키 하나에 적어 둔다. 끝이 확인된 상품만 지운다.
const memoryHold = new Map<string, string[]>();
const holdKey = (): string => "voila.take-unconfirmed." + ledgerKey();
function holdStore(): Storage | null {
  try { return typeof localStorage !== "undefined" && localStorage ? localStorage : null; } catch { return null; }
}
/** 읽지 못하거나 풀지 못하면 던진다 */
function readHold(): Set<string> {
  const store = holdStore();
  if (!store) return new Set(memoryHold.get(holdKey()) ?? []);
  const raw = store.getItem(holdKey());
  if (raw === null || raw === undefined) return new Set();
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("take hold record is not a list");
  return new Set(parsed.filter((x): x is string => typeof x === "string"));
}
/** 적고, 적혔는지 다시 읽어 확인한다. 저장 한도 때문에 조용히 빠진 쓰기도 여기서 잡힌다 */
function writeHold(ids: Set<string>): boolean {
  const list = Array.from(ids).sort();
  const store = holdStore();
  if (!store) { memoryHold.set(holdKey(), list); return true; }
  try {
    if (list.length) store.setItem(holdKey(), JSON.stringify(list)); else store.removeItem(holdKey());
    const back = readHold();
    return back.size === list.length && list.every((id) => back.has(id));
  } catch { return false; }
}

/** 화면과 미리 보기용 판정 자료: 지금 지갑의 거래 기록과 확인 대기 표시. 표시를 읽지 못하면 빈 것으로 본다(받는 일은 따로 다시 읽고, 못 읽으면 멈춘다) */
export function takeLedgerOf(transactions: Pick<Transaction, "type" | "itemIds" | "ref">[]): TakeLedger {
  let hold: Set<string>;
  try { hold = readHold(); } catch { hold = new Set(); }
  return { credited: creditedIdsOf(transactions), hold };
}
export const currentTakeLedger = (): TakeLedger => takeLedgerOf(useWalletStore.getState().transactions);

// ── 미리 보는 숫자 ──────────────────────────────────────────────────────────────

/** 상품 하나를 USDT 로 받을 때의 금액. 보관함의 sell 과 같은 식이다(참고가의 95%, 상품마다 소수 둘째 자리). */
export const takeAmountOf = (item: Pick<OwnedItem, "valueUsdt">): number => +(item.valueUsdt * REFUND_RATE).toFixed(2);

/** USDT 로 받을 수 있는 상품: 받는 일과 같은 기준(held)이고 받을 금액이 0보다 큰 것. 같은 id 는 한 번만. */
export function heldForTake(items: OwnedItem[], ledger: TakeLedger = currentTakeLedger()): OwnedItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id) || takeStateOf(item, ledger) !== "held") return false;
    const amount = takeAmountOf(item);
    if (!Number.isFinite(amount) || amount <= 0) return false;
    seen.add(item.id);
    return true;
  });
}

export interface TakeQuote {
  /** 받을 수 있는 상품 수 */
  count: number;
  /** 그 상품들의 참고가 합 */
  refUsdt: number;
  /** 받을 금액 합(상품마다 반올림한 값을 더한다. 합계에 95%를 한 번 곱하지 않는다) */
  totalUsdt: number;
  /** 그 가운데 출금할 수 있는 잔액으로 들어갈 몫 */
  toCrypto: number;
  /** 그 가운데 카드로 충전한 몫(출금할 수 없는 잔액으로 들어간다) */
  toCard: number;
}

/** 이 상품들을 지금 USDT 로 받으면 얼마가 어디로 들어오는지. 받을 수 없는 상품(보관 중이 아님, 확인되지 않음)은 세지 않는다. */
export function takeQuote(items: OwnedItem[], ledger: TakeLedger = currentTakeLedger()): TakeQuote {
  const held = heldForTake(items, ledger);
  const refunds = held.map((item) => ({ amountUsdt: takeAmountOf(item), ratio: normalizeRatio(item.fundingRatio) }));
  return {
    count: held.length,
    refUsdt: r2(held.reduce((sum, item) => sum + item.valueUsdt, 0)),
    totalUsdt: r2(refunds.reduce((sum, x) => sum + x.amountUsdt, 0)),
    ...attributeRefunds(refunds),
  };
}

/**
 * 잔액이 모자랄 때 화면이 말하는 숫자. 보여 주기만 한다(깎거나 얹는 금액이 없다).
 *   missing        더 필요한 금액
 *   heldCount      받을 수 있는 보관 상품 수
 *   maxReceivable  그 상품을 전부 USDT 로 받으면 잔액에 들어오는 금액
 *   covers         그것으로 모자란 만큼이 채워지는지. 채워질 때만 "USDT로 받기"가 주 단추다(flow/MELT_SPEC.md R3)
 */
export function shortfallOf(balanceUsdt: number, costUsdt: number, items: OwnedItem[], ledger: TakeLedger = currentTakeLedger()): { missing: number; heldCount: number; maxReceivable: number; covers: boolean } {
  const missing = Math.max(0, r2(costUsdt - balanceUsdt));
  const quote = takeQuote(items, ledger);
  return { missing, heldCount: quote.count, maxReceivable: quote.totalUsdt, covers: quote.count > 0 && quote.totalUsdt + 1e-9 >= missing };
}

// ── 받는 일 ────────────────────────────────────────────────────────────────────

export type BatchStatus = "settled" | "partial" | "pending" | "failed" | "unknown";

export interface BatchOutcome {
  /**
   * settled: 고른 것이 전부 끝났다. partial: 일부만 됐다. pending: 접수만 됐다. failed: 하나도 받지 못했다.
   * unknown: 처리 상태를 알 수 없는 상품이 있다(받은 것이 함께 있을 수 있다. 화면은 taken, left, unknown 을 따로 말한다)
   */
  status: BatchStatus;
  /** 이번에 새로 잔액에 들어온 상품과 실제로 받은 금액(보관함 기록의 soldForUsdt). 입금 내역까지 확인한 것만 */
  taken: { id: string; amountUsdt: number }[];
  /** 전에 이미 받은 상품(입금 내역이 있다). 다시 더하지 않았다 */
  already: { id: string; amountUsdt: number }[];
  /** 받지 못한 상품. 보관 중이고 입금 내역이 없고 잔액도 늘지 않았거나, 받을 수 없는 상태다 */
  left: string[];
  /** 처리 상태를 알 수 없는 상품. 스스로 다시 지급하지 않는다 */
  unknown: string[];
  /** 이번에 새로 들어온 금액과 그 출처별 몫 */
  amountUsdt: number;
  toCrypto: number;
  toCard: number;
}

const nothing = (status: BatchStatus, ids: string[]): BatchOutcome => ({ status, taken: [], already: [], left: status === "unknown" ? [] : ids, unknown: status === "unknown" ? ids : [], amountUsdt: 0, toCrypto: 0, toCard: 0 });
const statusOf = (taken: number, already: number, left: number, unknown: number): BatchStatus => (unknown > 0 ? "unknown" : left === 0 ? "settled" : taken + already > 0 ? "partial" : "failed");

interface SavedLedger { items: OwnedItem[]; transactions: Transaction[]; crypto: number; card: number }
const isAmount = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

/**
 * 저장된 장부를 직접 읽는다. 스토어가 쓰는 그 저장소에서 꺼내 직접 푼다(스토어의 재수화는 읽기 오류를 삼키고 기억 속 상태를 남긴다).
 * 읽지 못하거나, 풀지 못하거나, 있어야 할 기록이 없으면 던진다.
 * 저장소 없이 만들어진 스토어(서버, 저장소 없는 테스트)에서는 기억 속 장부가 곧 장부다.
 */
async function readSaved(): Promise<SavedLedger> {
  const inventory = useInventoryStore.persist; const wallet = useWalletStore.persist;
  if (!inventory || !wallet) {
    const w = useWalletStore.getState();
    return { items: useInventoryStore.getState().items, transactions: w.transactions, crypto: w.cryptoBalance, card: w.cardBalance };
  }
  const inv = inventory.getOptions(); const wal = wallet.getOptions();
  if (!inv.storage || !inv.name || !wal.storage || !wal.name) throw new Error("ledger storage is not available");
  const savedInventory = (await inv.storage.getItem(inv.name))?.state as { items?: unknown } | undefined;
  const savedWallet = (await wal.storage.getItem(wal.name))?.state as { transactions?: unknown; cryptoBalance?: unknown; cardBalance?: unknown } | undefined;
  if (!savedInventory || !Array.isArray(savedInventory.items)) throw new Error("saved inventory is missing");
  if (!savedWallet || !Array.isArray(savedWallet.transactions) || !isAmount(savedWallet.cryptoBalance) || !isAmount(savedWallet.cardBalance)) throw new Error("saved wallet is missing");
  return { items: savedInventory.items as OwnedItem[], transactions: savedWallet.transactions as Transaction[], crypto: savedWallet.cryptoBalance, card: savedWallet.cardBalance };
}

/**
 * 화면이 보는 기억 속 장부를 저장된 장부에 맞춘다. 판정에는 쓰지 않는다.
 * 저장된 장부를 방금 직접 읽는 데 성공했을 때만 부른다: 스토어의 재수화는 읽기에 실패하면 오류를 삼키고 기억 속 상태를 그대로 다시 저장하므로,
 * 읽지 못하는 동안에 부르면 저장되지 않은 기억 속 잔액이 장부에 적힐 수 있다.
 */
async function syncStores(): Promise<void> {
  try { await Promise.all([useWalletStore.persist?.rehydrate?.(), useInventoryStore.persist?.rehydrate?.()]); } catch { /* 판정은 readSaved 가 한다 */ }
}

/** 같은 계정의 같은 묶음에 대한 요청은 한 번만 나간다 */
const inflight = new Map<string, Promise<BatchOutcome>>();
/**
 * 이 탭 안의 받기는 한 번에 하나씩 차례로 실행한다. 받는 순서에는 기다리는 자리(저장된 장부를 읽는 곳)가 있어서,
 * 겹치는 요청이 끼어들면 서로 옛 장부를 보고 같은 상품을 받으려 할 수 있다. 탭 사이는 장부 잠금(Web Locks)이 맡는다.
 */
let queue: Promise<unknown> = Promise.resolve();
function inTurn<T>(work: () => Promise<T>): Promise<T> {
  const next = queue.then(work, work);
  queue = next.catch(() => undefined);
  return next;
}

export function settleTakeMany(ownedIds: string[]): Promise<BatchOutcome> {
  const ids = ownedIds.filter((id, i) => ownedIds.indexOf(id) === i);
  const key = ledgerKey() + "|" + [...ids].sort().join(",");
  const running = inflight.get(key);
  if (running) return running;
  const job = (async (): Promise<BatchOutcome> => {
    try {
      if (!ids.length) return nothing("failed", ids);
      const fault = devOpeningFault();
      if (fault === "settle-failed") return nothing("failed", ids);
      if (fault === "settle-pending") return nothing("pending", ids);
      return await inTurn(() => withLedgerLock(async (): Promise<BatchOutcome> => {
        // 1. 저장된 장부와 확인 대기 표시를 직접 읽는다. 읽지 못하면 아무것도 실행하지 않고 알 수 없다고 답한다
        let before: SavedLedger; let hold: Set<string>;
        try { before = await readSaved(); hold = readHold(); } catch { return nothing("unknown", ids); }
        if (fault === "settle-unknown") {
          const marked = new Set(hold); for (const id of ids) marked.add(id);
          writeHold(marked); await syncStores();
          return nothing("unknown", ids);
        }
        const ledger: TakeLedger = { credited: creditedIdsOf(before.transactions), hold };
        const saved = new Map(before.items.map((item) => [item.id, item]));
        const already: BatchOutcome["already"] = []; const unknown = new Set<string>(); const left = new Set<string>(); const target: string[] = [];
        for (const id of ids) {
          const item = saved.get(id);
          const state = item ? takeStateOf(item, ledger) : "other";
          if (item && state === "taken") already.push({ id, amountUsdt: item.soldForUsdt ?? 0 });
          else if (state === "unconfirmed") unknown.add(id);
          else if (state === "held") target.push(id);
          else left.add(id);
        }
        // 끝이 확인된 상품에 남아 있던 표시는 지운다
        const marks = new Set(hold); for (const x of already) marks.delete(x.id);
        const attempt = fault === "settle-partial" ? target.slice(0, Math.ceil(target.length / 2)) : target;
        for (const id of target) if (!attempt.includes(id)) left.add(id);
        const sold: OwnedItem[] = [];
        let readable = true;
        if (attempt.length) {
          // 2. 받으려는 상품을 확인 대기 표시에 먼저 적는다. 적지 못하면 받기를 시작하지 않는다(돈은 움직이지 않았다)
          for (const id of attempt) marks.add(id);
          if (!writeHold(marks)) {
            for (const id of attempt) left.add(id);
          } else {
            // 3. 받는다. 계산과 쓰기는 기존 takeUsdt 그대로다. 도중에 던져도 여기서 판정하지 않는다
            try { takeUsdt(attempt); } catch { /* 아래에서 저장된 장부를 다시 읽어 판정한다 */ }
            // 4. 저장된 장부를 다시 직접 읽어 판정한다. 읽지 못하면 받으려던 것은 전부 알 수 없다(표시는 남는다)
            let after: SavedLedger | null;
            try { after = await readSaved(); } catch { after = null; }
            if (!after) {
              readable = false;
              for (const id of attempt) unknown.add(id);
            } else {
              const paid = creditedIdsOf(after.transactions); const now = new Map(after.items.map((item) => [item.id, item]));
              const notTaken: string[] = [];
              for (const id of attempt) {
                const item = now.get(id);
                if (item && item.status === "SOLD" && typeof item.soldForUsdt === "number" && paid.has(id)) sold.push(item);
                else if (item && item.status === "IN_STORAGE" && !paid.has(id)) notTaken.push(id);
                else unknown.add(id);
              }
              // 보관 중이고 내역이 없어도, 저장된 잔액이 받은 것으로 설명되는 만큼보다 더 늘었으면 받지 못했다고 하지 않는다
              const gained = r2(after.crypto + after.card - before.crypto - before.card);
              const explained = r2(sold.reduce((sum, item) => sum + (item.soldForUsdt ?? 0), 0));
              const clean = gained <= explained + 0.005;
              // 5. 끝이 확인된 상품만 표시에서 지운다. 지우지 못하면 화면이 그 상품을 확인 필요로 보여 줄 것이므로 답도 그렇게 맞춘다
              for (const item of sold) marks.delete(item.id);
              if (clean) for (const id of notTaken) marks.delete(id);
              const cleared = writeHold(marks);
              for (const id of notTaken) { if (clean && cleared) left.add(id); else unknown.add(id); }
            }
          }
        } else if (marks.size !== hold.size) {
          writeHold(marks);
        }
        if (readable) await syncStores();
        // 받은 금액과 출처별 몫은 저장된 보관함 기록에서 읽는다(sell 이 쓴 값 그대로)
        const taken = sold.map((item) => ({ id: item.id, amountUsdt: item.soldForUsdt ?? 0 }));
        const split = attributeRefunds(sold.map((item) => ({ amountUsdt: item.soldForUsdt ?? 0, ratio: normalizeRatio(item.fundingRatio) })));
        return {
          status: statusOf(taken.length, already.length, left.size, unknown.size),
          taken, already, left: ids.filter((id) => left.has(id)), unknown: ids.filter((id) => unknown.has(id)),
          amountUsdt: r2(taken.reduce((sum, x) => sum + x.amountUsdt, 0)), ...split,
        };
      }));
    } catch {
      // 잠금을 얻지 못했거나 저장소에 쓸 수 없다. 받기를 시작하기 전이라 돈은 움직이지 않았다
      return nothing("failed", ids);
    }
  })().finally(() => inflight.delete(key));
  inflight.set(key, job);
  return job;
}

/** 한 시트 안에서 다시 시도한 결과를 앞의 결과에 잇는다. 받은 것은 쌓이고, 남은 것은 마지막 시도의 것이다. 알 수 없는 것은 다시 시도하지 않으므로 남는다. */
export function mergeOutcomes(prev: BatchOutcome | null, next: BatchOutcome): BatchOutcome {
  if (!prev) return next;
  const taken = [...prev.taken, ...next.taken.filter((x) => !prev.taken.some((p) => p.id === x.id))];
  const fresh = new Set(taken.map((x) => x.id));
  const already = [...prev.already, ...next.already].filter((x, i, all) => !fresh.has(x.id) && all.findIndex((y) => y.id === x.id) === i);
  const settledIds = new Set([...taken, ...already].map((x) => x.id));
  const unknown = [...prev.unknown, ...next.unknown].filter((id, i, all) => !settledIds.has(id) && all.indexOf(id) === i);
  return {
    status: next.status === "pending" ? "pending" : statusOf(taken.length, already.length, next.left.length, unknown.length),
    taken, already, left: next.left, unknown,
    amountUsdt: r2(prev.amountUsdt + next.amountUsdt), toCrypto: r2(prev.toCrypto + next.toCrypto), toCard: r2(prev.toCard + next.toCard),
  };
}

/**
 * 출금 화면의 금액 칸에 채울 값(USDT). 이번에 새로 받은 금액 가운데 출금할 수 있는 몫만 넣는다.
 * 카드로 충전한 몫, 전에 이미 받았던 상품, 원래 있던 잔액은 넣지 않는다. 지금 출금할 수 있는 잔액을 넘지 않는다.
 */
export function withdrawPrefillUsdt(outcome: Pick<BatchOutcome, "toCrypto">, cryptoBalanceUsdt: number): number {
  const fresh = Number.isFinite(outcome.toCrypto) ? Math.max(0, outcome.toCrypto) : 0;
  const room = Number.isFinite(cryptoBalanceUsdt) ? Math.max(0, cryptoBalanceUsdt) : 0;
  return r2(Math.min(fresh, room));
}
