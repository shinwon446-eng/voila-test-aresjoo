/**
 * 보관 중인 상품을 USDT 로 받는 일. 한 개든 여러 개든 이 파일 하나를 거친다(선택 시트 components/flow/TakeSheet,
 * 한 개 받기 lib/openingSettle 의 settleTake). 돈 계산은 바꾸지 않는다. lib/claim 의 takeUsdt 를 그대로 부르고
 * (보관함의 sell 이 상품마다 95%를 소수 둘째 자리로 맞추고 자금 출처대로 나눈다), 이 파일은 그 앞뒤만 지킨다.
 *
 * 받기가 확정됐는지는 한 가지 기준으로 본다(takeStateOf). 받는 일, 미리 보는 금액, 화면의 상태 표시가 전부 이 기준을 쓴다.
 * 받기가 의심스럽다는 증거는 "확인 대기 표시" 하나다(받기를 시작하기 전에 적고, 끝이 확인되면 지우는 작은 저장 키).
 *   받은 상태(SOLD)
 *     표시 없음 → taken. 그 상품을 가리키는 입금 내역이 있든 없든 그렇다. 이 일을 만들기 전의 기록(옛 자동 받기는 내역에
 *                 상품 종류만 적었고, 열 때 들어온 USDT 결과는 박스만 적었다)을 확인 필요로 낮추지 않는다.
 *     표시 있음 → 저장된 장부의 입금 내역이 그 상품을 가리킬 때만 taken(그때 표시를 지운다). 아니면 unconfirmed.
 *                 화면은 저장된 장부를 직접 읽지 않으므로, 표시가 남아 있는 동안은 기억 속 내역이 뭐라고 하든 unconfirmed 로 보여 준다.
 *   보관 중(IN_STORAGE)
 *     표시 있음 → unconfirmed(아래의 다시 보기에서 풀릴 수 있다)
 *     표시 없음, 입금 내역이 그 상품(보관 상품 id)을 가리킴 → unconfirmed(이미 들어온 상품을 다시 받지 못하게)
 *     표시 없음, 내역 없음 → held(받을 수 있다)
 *   그 밖(배송 신청, 배송 중) → other
 * unconfirmed 인 상품은 받을 수 없고, 금액에 세지 않고, 화면은 "받았다"고도 "보관 중"이라고도 하지 않는다.
 * 입금 내역이 가리키는 상품은 받기 거래 기록(sellback)의 itemIds, 옛 기록은 쉼표로 이어 적은 ref 로 찾는다.
 *
 * 받는 순서(이 탭 안에서는 한 번에 하나, 탭 사이는 계정별 장부 잠금. flow/MELT_SPEC.md R8, flow/REVIEW_codex-2.md 4절, REVIEW_codex-3.md 3절):
 *   1. 저장된 장부를 직접 읽는다(스토어가 쓰는 그 저장소에서 꺼내 직접 푼다). 스토어의 기억 속 상태로 판정하지 않는다.
 *      읽지 못하거나, 풀지 못하거나, 있어야 할 기록이 없으면 전부 "알 수 없다"로 답하고 아무것도 실행하지 않는다.
 *   2. 남아 있던 표시를 다시 본다(아래).
 *   3. 받으려는 상품의 id 와, 그 순간의 저장된 잔액과 거래 기록 수를 표시에 먼저 적고, 적혔는지 다시 읽어 확인한다. 적지 못하면 시작하지 않는다.
 *   4. takeUsdt 를 부른다. 도중에 던져도 여기서 판정하지 않는다.
 *   5. 저장된 장부를 다시 직접 읽어 상품마다 판정한다.
 *        받았다        상품이 받은 상태이고 그 상품의 입금 내역이 있다
 *        받지 못했다  상품이 보관 중이고, 입금 내역이 없고, 저장된 잔액의 변화가 그 사이에 적힌 거래 기록으로 전부 설명된다
 *        알 수 없다    그 밖 전부(잔액은 늘었는데 내역이 없다, 다시 읽지 못했다 등)
 *   6. 받았거나 깨끗이 받지 못한 상품만 표시에서 지운다. 알 수 없는 상품은 표시가 남아, 다음에 누가 불러도 다시 지급하지 않는다.
 *
 * 남은 표시 다시 보기(받기를 부를 때, 선택 시트를 열 때, 창으로 돌아올 때. 눈감고 다시 시도하는 것이 아니다):
 *   받은 상태이고 저장된 입금 내역이 그 상품을 가리키면 → 표시를 지운다(taken).
 *   보관 중이고, 저장된 입금 내역이 가리키지 않고, 지금 저장된 잔액이 "표시를 적을 때의 잔액 + 그 뒤에 적힌 모든 거래 기록의 금액"과
 *   같으면(다른 탭의 충전처럼 기록이 있는 변화는 설명된 것이다) → 표시를 지운다(held, 다시 받을 수 있다).
 *   읽지 못했거나 설명되지 않는 것이 하나라도 있으면 표시를 그대로 둔다.
 *
 * 한계: 보관함과 지갑은 저장 키가 둘이라 두 쓰기를 하나로 묶지 못한다. 이 파일은 어긋난 장부를 정직하게 말하고 다시 지급하지 않을 뿐,
 * 어긋난 장부를 고치지는 못한다. 장부를 한 번에 확정하는 일은 서버 장부가 있어야 하고, 실제 돈을 붙이기 전의 조건이다
 * (tests/takeFault.test.ts 가 어긋나는 경우들을 재현한다).
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
import { useInventoryStore, type OwnedItem } from "../stores/inventoryStore";
import { useWalletStore, type Transaction } from "../stores/walletStore";

const r2 = (n: number): number => +n.toFixed(2);
const isAmount = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

/** 개발 서버에서만 읽는 시험 스위치. 운영 빌드와 서버에서는 언제나 null 이다 */
export const devOpeningFault = (): string | null => {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") return null;
  try { return window.sessionStorage.getItem("voila.opening.fault"); } catch { return null; }
};

// ── 받기가 확정됐는지: 한 가지 기준 ────────────────────────────────────────────

export type TakeState = "held" | "taken" | "unconfirmed" | "other";
/**
 * 판정에 쓰는 자료.
 *   credited  입금 내역이 가리키는 보관 상품 id
 *   hold      확인 대기 표시가 남은 보관 상품 id
 *   saved     credited 가 저장된 장부에서 직접 읽은 것인지. 화면이 쓰는 기억 속 내역은 false 다(표시가 남은 받은 상품을 확정하지 못한다)
 */
export interface TakeLedger { credited: Set<string>; hold: Set<string>; saved?: boolean }

/** 입금 내역이 가리키는 보관 상품 id: 받기 거래 기록의 itemIds, 옛 기록은 쉼표로 이어 적은 ref */
export function creditedIdsOf(transactions: Pick<Transaction, "type" | "itemIds" | "ref">[]): Set<string> {
  const out = new Set<string>();
  for (const tx of transactions) {
    if (tx.type !== "sellback") continue;
    for (const id of tx.itemIds ?? (tx.ref ? tx.ref.split(",") : [])) out.add(id);
  }
  return out;
}

export function takeStateOf(item: Pick<OwnedItem, "id" | "status">, ledger: TakeLedger): TakeState {
  const marked = ledger.hold.has(item.id); const paid = ledger.credited.has(item.id);
  if (item.status === "SOLD") return !marked || (ledger.saved === true && paid) ? "taken" : "unconfirmed";
  if (item.status === "IN_STORAGE") return marked || paid ? "unconfirmed" : "held";
  return "other";
}

// ── 확인 대기 표시 ─────────────────────────────────────────────────────────────
// 받기를 시작한 상품 id 와, 시작할 때의 저장된 잔액과 거래 기록 수를 작은 키 하나에 적어 둔다. 끝이 확인된 상품만 지운다.

/** 표시를 적을 때의 저장된 지갑: 잔액 둘, 거래 기록 수, 가장 새 거래 기록의 id(거래 기록은 새것이 앞에 쌓인다) */
interface Snap { c: number; d: number; n: number; l: string | null }
/** 받기 한 번의 표시. snap 이 없는 것은 옛 형식(id 만 적은 것)이라 잔액으로는 풀 수 없다 */
interface Mark { ids: string[]; snap: Snap | null }

const memoryMarks = new Map<string, string>();
const markKey = (): string => "voila.take-unconfirmed." + ledgerKey();
function markStore(): Storage | null {
  try { return typeof localStorage !== "undefined" && localStorage ? localStorage : null; } catch { return null; }
}
function rawMarks(): string | null {
  const store = markStore();
  if (!store) return memoryMarks.get(markKey()) ?? null;
  return store.getItem(markKey()) ?? null;
}
/** 읽지 못하거나 풀지 못하면 던진다 */
function readMarks(): Mark[] {
  const raw = rawMarks();
  if (raw === null) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("take marks are not a list");
  const legacy = parsed.filter((x): x is string => typeof x === "string");
  const marks: Mark[] = legacy.length ? [{ ids: legacy, snap: null }] : [];
  for (const entry of parsed) {
    if (typeof entry === "string") continue;
    const e = entry as { ids?: unknown; c?: unknown; d?: unknown; n?: unknown; l?: unknown } | null;
    if (!e || !Array.isArray(e.ids)) throw new Error("take mark is malformed");
    const ids = e.ids.filter((x): x is string => typeof x === "string");
    const snap = isAmount(e.c) && isAmount(e.d) && isAmount(e.n) && (typeof e.l === "string" || e.l === null) ? { c: e.c, d: e.d, n: e.n, l: e.l } : null;
    if (ids.length) marks.push({ ids, snap });
  }
  return marks;
}
/** 적고, 적혔는지 다시 읽어 확인한다. 저장 한도 때문에 조용히 빠진 쓰기와 지워지지 않은 표시도 여기서 잡힌다 */
function writeMarks(marks: Mark[]): boolean {
  const kept = marks.filter((m) => m.ids.length > 0);
  const text = kept.length ? JSON.stringify(kept.map((m) => (m.snap ? { ids: m.ids, ...m.snap } : { ids: m.ids }))) : null;
  try {
    const store = markStore();
    if (!store) { if (text === null) memoryMarks.delete(markKey()); else memoryMarks.set(markKey(), text); return true; }
    if (text === null) store.removeItem(markKey()); else store.setItem(markKey(), text);
    return rawMarks() === text;
  } catch { return false; }
}
const markedIds = (marks: Mark[]): Set<string> => { const out = new Set<string>(); for (const m of marks) for (const id of m.ids) out.add(id); return out; };

/** 화면과 미리 보기용 판정 자료: 지금 지갑의 거래 기록과 확인 대기 표시. 표시를 읽지 못하면 빈 것으로 본다(받는 일은 따로 다시 읽고, 못 읽으면 멈춘다) */
export function takeLedgerOf(transactions: Pick<Transaction, "type" | "itemIds" | "ref">[]): TakeLedger {
  let hold: Set<string>;
  try { hold = markedIds(readMarks()); } catch { hold = new Set(); }
  return { credited: creditedIdsOf(transactions), hold, saved: false };
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
  /** 전에 이미 받은 상품. 다시 더하지 않았다 */
  already: { id: string; amountUsdt: number }[];
  /** 받지 못한 상품. 보관 중이고 입금 내역이 없고 잔액의 변화도 전부 설명되거나, 받을 수 없는 상태다 */
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

const snapOf = (saved: SavedLedger): Snap => ({ c: saved.crypto, d: saved.card, n: saved.transactions.length, l: saved.transactions[0]?.id ?? null });

/**
 * 표시를 적은 뒤로 저장된 잔액이 달라진 만큼이 그 사이에 적힌 거래 기록으로 전부 설명되는가.
 * 거래 기록은 새것이 앞에 쌓인다. 표시를 적을 때의 가장 새 기록을 찾아 그 앞의 것들을 "그 뒤에 적힌 기록"으로 본다.
 * 그 기록을 찾지 못하거나 개수가 맞지 않으면(기록이 지워졌거나 순서가 다르면) 설명되지 않은 것으로 본다.
 */
function explainedSince(snap: Snap, now: SavedLedger): boolean {
  const list = now.transactions;
  const at = snap.l === null ? list.length : list.findIndex((tx) => tx.id === snap.l);
  if (at < 0 || list.length - at !== snap.n) return false;
  let added = 0;
  for (const tx of list.slice(0, at)) { if (!isAmount(tx.amountUsdt)) return false; added += tx.amountUsdt; }
  return Math.abs(now.crypto + now.card - (snap.c + snap.d) - added) < 0.005;
}

/** 남아 있는 표시를 저장된 장부에 비추어 다시 본다. 끝이 확인된 상품만 표시에서 뺀다 */
function reviewMarks(saved: SavedLedger, marks: Mark[]): { marks: Mark[]; changed: boolean } {
  if (!marks.length) return { marks, changed: false };
  const paid = creditedIdsOf(saved.transactions); const byId = new Map(saved.items.map((item) => [item.id, item]));
  let changed = false;
  const next = marks.map((mark) => {
    const clean = mark.snap ? explainedSince(mark.snap, saved) : false;
    const ids = mark.ids.filter((id) => {
      const item = byId.get(id);
      // 받은 상태이고 그 상품의 입금 내역이 저장돼 있다: 받기가 끝났다
      if (item?.status === "SOLD" && paid.has(id)) return false;
      // 보관 중이고, 내역이 없고, 잔액의 변화가 전부 설명된다: 아무것도 들어오지 않았다. 다시 받을 수 있다
      if (item?.status === "IN_STORAGE" && !paid.has(id) && clean) return false;
      return true;
    });
    if (ids.length !== mark.ids.length) changed = true;
    return { ids, snap: mark.snap };
  }).filter((mark) => mark.ids.length > 0);
  return { marks: next, changed };
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
/** 저장된 장부를 읽지 못한 채 끝난 일이 있다: 기억 속 장부가 저장된 장부보다 앞서 있을 수 있다. 읽을 수 있게 되면 다시 맞춘다 */
let resyncWanted = false;

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
        let before: SavedLedger; let found: Mark[];
        try { before = await readSaved(); found = readMarks(); } catch { resyncWanted = true; return nothing("unknown", ids); }
        // 2. 남아 있던 표시를 다시 본다. 끝이 확인된 것은 지운다
        const reviewed = reviewMarks(before, found);
        const marks = reviewed.marks;
        const snap = snapOf(before);
        if (fault === "settle-unknown") {
          // 시험용: 잔액으로 풀 자료 없이 표시만 남긴다(다시 볼 때 풀리지 않아, 확인 필요 상태를 화면에서 계속 볼 수 있다)
          writeMarks([...marks, { ids, snap: null }]); await syncStores();
          return nothing("unknown", ids);
        }
        const ledger: TakeLedger = { credited: creditedIdsOf(before.transactions), hold: markedIds(marks), saved: true };
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
        const attempt = fault === "settle-partial" ? target.slice(0, Math.ceil(target.length / 2)) : target;
        for (const id of target) if (!attempt.includes(id)) left.add(id);
        const sold: OwnedItem[] = [];
        let readable = true;
        if (attempt.length) {
          // 3. 받으려는 상품과 지금의 저장된 지갑을 표시에 먼저 적는다. 적지 못하면 받기를 시작하지 않는다(돈은 움직이지 않았다)
          if (!writeMarks([...marks, { ids: attempt, snap }])) {
            for (const id of attempt) left.add(id);
            if (reviewed.changed) writeMarks(marks);
          } else {
            // 4. 받는다. 계산과 쓰기는 기존 takeUsdt 그대로다. 도중에 던져도 여기서 판정하지 않는다
            try { takeUsdt(attempt); } catch { /* 아래에서 저장된 장부를 다시 읽어 판정한다 */ }
            // 5. 저장된 장부를 다시 직접 읽어 판정한다. 읽지 못하면 받으려던 것은 전부 알 수 없다(표시는 남는다)
            let after: SavedLedger | null;
            try { after = await readSaved(); } catch { after = null; }
            if (!after) {
              readable = false; resyncWanted = true;
              for (const id of attempt) unknown.add(id);
            } else {
              const paid = creditedIdsOf(after.transactions); const now = new Map(after.items.map((item) => [item.id, item]));
              // 보관 중이고 내역이 없어도, 저장된 잔액의 변화가 그 사이의 거래 기록으로 전부 설명되지 않으면 받지 못했다고 하지 않는다
              const clean = explainedSince(snap, after);
              const notTaken: string[] = []; const doubtful: string[] = [];
              for (const id of attempt) {
                const item = now.get(id);
                if (item && item.status === "SOLD" && typeof item.soldForUsdt === "number" && paid.has(id)) sold.push(item);
                else if (item && item.status === "IN_STORAGE" && !paid.has(id) && clean) notTaken.push(id);
                else doubtful.push(id);
              }
              // 6. 끝이 확인된 상품만 표시에서 지운다. 지우지 못하면 화면이 그 상품을 확인 필요로 보여 줄 것이므로 답도 그렇게 맞춘다
              const cleared = writeMarks(doubtful.length ? [...marks, { ids: doubtful, snap }] : marks);
              for (const id of doubtful) unknown.add(id);
              for (const id of notTaken) { if (cleared) left.add(id); else unknown.add(id); }
            }
          }
        } else if (reviewed.changed) {
          writeMarks(marks);
        }
        if (readable) { await syncStores(); resyncWanted = false; }
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
  })().finally(() => {
    inflight.delete(key);
    // 저장된 장부를 읽지 못한 채 끝났으면 잠시 뒤에 한 번 더 맞춰 본다(그 뒤로는 시트를 열 때와 창으로 돌아올 때 다시 본다)
    if (resyncWanted && typeof window !== "undefined") window.setTimeout(() => { void reviewTakeMarks(); }, 2000);
  });
  inflight.set(key, job);
  return job;
}

/**
 * 남아 있는 확인 대기 표시를 다시 보고, 기억 속 장부를 저장된 장부에 맞춘다. 돈은 움직이지 않는다(받기를 다시 시도하지 않는다).
 * 표시가 없고 맞출 것도 없으면 아무 일도 하지 않는다. 선택 시트를 열 때와 창으로 돌아올 때 부른다(받기를 부를 때는 그 안에서 같은 일을 한다).
 */
let reviewing: Promise<void> | null = null;
export function reviewTakeMarks(): Promise<void> {
  if (reviewing) return reviewing;
  let pending = resyncWanted;
  if (!pending) { try { pending = readMarks().length > 0; } catch { pending = true; } }
  if (!pending) return Promise.resolve();
  reviewing = inTurn(() => withLedgerLock(async (): Promise<void> => {
    let saved: SavedLedger; let found: Mark[];
    try { saved = await readSaved(); found = readMarks(); } catch { return; }
    const reviewed = reviewMarks(saved, found);
    if (reviewed.changed) writeMarks(reviewed.marks);
    await syncStores(); resyncWanted = false;
  })).catch(() => undefined).finally(() => { reviewing = null; });
  return reviewing;
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
