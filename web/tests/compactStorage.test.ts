// 장부를 저장소에 줄여 적는 일(lib/compactStorage). 기억 속 모양은 그대로이고, 저장된 글만 작아져야 한다.
//   1. 옛 형식 → 줄인 형식 → 다시 읽기: 값이 하나도 달라지지 않는다(모르는 칸, 뜻밖의 값, 새 상태 포함)
//   2. 개봉 한 건이 차지하는 글자 수의 상한(실제 100개짜리 박스를 실제 개봉 코드로 연다)
//   3. 줄인 뒤에도 검증 화면의 계산이 그 기록의 당시 확률표로 똑같이 나온다(카탈로그에 없는 표로 확인한다)
//   4. 한도가 이미 찬 저장소: 다음에 열 때 기록을 잃지 않고 줄어든다. 받기(lib/takeBatch)도 줄인 장부에서 그대로 돈다
//   5. 옮기는 일의 완료 조건(flow/REVIEW_codex-4.md 4.4): 한쪽만 옮겨진 상태, 깨진 JSON, 모르는 형식 번호, 확인 대기 표시가 남은 장부,
//      업그레이드 기록, 배송과 옛 칸, 옮기는 사이에 다른 탭이 적는 경우. 금액의 합, 상태, id, 자금 출처, 회차, 확률표의 순서가 앞뒤로 같아야 한다
//   npm test
import test, { before } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import type { OwnedItem } from "../stores/inventoryStore";
import type { Transaction } from "../stores/walletStore";

// 저장소: 브라우저처럼 한도가 있는 기억 속 지도.
//   quota  키와 값의 글자 수 합이 이 값을 넘게 만드는 쓰기는 받지 않는다. 줄어드는(또는 같은) 쓰기는 한도가 차 있어도 받는다(브라우저와 같다)
//   foreign  같은 출처의 다른 사이트 키. 이 사이트의 래퍼(lib/labSite)처럼 key(i) 는 이 사이트의 키만 주고 length 는 전체를 센다
const disk = new Map<string, string>();
const foreign = new Map<string, string>();
let quota = Infinity;
const refused: string[] = [];
const used = () => Array.from(disk).concat(Array.from(foreign)).reduce((n, [k, v]) => n + k.length + v.length, 0);
//   onRead   읽기 직전에 불린다. 다른 탭처럼, 읽는 사이에 저장된 값을 바꿔 놓을 수 있다(disk 를 직접 고친다)
//   onWrite  쓰기 직전에 불린다. 참을 돌려주면 그 쓰기를 조용히 버린다(이 사이트의 저장소 래퍼가 한도 초과에서 하는 일)
let onRead: ((name: string) => void) | null = null;
let onWrite: ((name: string, value: string) => boolean | void) | null = null;
const storage = {
  get length() { return disk.size + foreign.size; },
  key: (i: number) => Array.from(disk.keys())[i] ?? null,
  getItem: (name: string) => { onRead?.(name); return disk.get(name) ?? null; },
  setItem: (name: string, value: string) => {
    if (onWrite?.(name, value)) { refused.push(name); return; }
    const before = used(); const after = before - (disk.has(name) ? name.length + disk.get(name)!.length : 0) + name.length + value.length;
    if (after > quota && after > before) { refused.push(name); return; }
    disk.set(name, value);
  },
  removeItem: (name: string) => { disk.delete(name); },
};

let cs: typeof import("../lib/compactStorage");
let useInventoryStore: typeof import("../stores/inventoryStore").useInventoryStore;
let useWalletStore: typeof import("../stores/walletStore").useWalletStore;
let isUndebitedWithdrawal: typeof import("../stores/walletStore").isUndebitedWithdrawal;
let useFairStore: typeof import("../stores/fairStore").useFairStore;
let createOpeningPurchase: typeof import("../lib/opening").createOpeningPurchase;
let takeUsdt: typeof import("../lib/claim").takeUsdt;
let settleTakeMany: typeof import("../lib/takeBatch").settleTakeMany;
let walletHistoryRows: typeof import("../lib/browserWallet").walletHistoryRows;
let products: typeof import("../lib/products");
let fairness: typeof import("../lib/fairness");
let verify: typeof import("../components/fairness/verifyRecord");
let LedgerUnavailable: typeof import("../lib/ledgerLock").LedgerUnavailable;
let INVENTORY = ""; let WALLET = "";
before(async () => {
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
  cs = await import("../lib/compactStorage");
  ({ useInventoryStore } = await import("../stores/inventoryStore"));
  ({ useWalletStore, isUndebitedWithdrawal } = await import("../stores/walletStore"));
  ({ useFairStore } = await import("../stores/fairStore"));
  ({ createOpeningPurchase } = await import("../lib/opening"));
  ({ takeUsdt } = await import("../lib/claim"));
  ({ settleTakeMany } = await import("../lib/takeBatch"));
  ({ walletHistoryRows } = await import("../lib/browserWallet"));
  ({ LedgerUnavailable } = await import("../lib/ledgerLock"));
  products = await import("../lib/products");
  fairness = await import("../lib/fairness");
  verify = await import("../components/fairness/verifyRecord");
  INVENTORY = useInventoryStore.persist.getOptions().name!;
  WALLET = useWalletStore.persist.getOptions().name!;
});

const SEED = "a".repeat(128);
async function reset(balance = 1e9): Promise<void> {
  quota = Infinity; onRead = null; onWrite = null; refused.length = 0; disk.clear(); foreign.clear();
  useWalletStore.setState({ cryptoBalance: balance, cardBalance: 0, balance, transactions: [], totalWagered: 0, burst: {}, freeOpens: {} });
  useInventoryStore.setState({ items: [] });
  useFairStore.setState({ serverSeed: SEED, serverSeedHash: await fairness.hashServerSeed(SEED), clientSeed: "compact-test", nonce: 0 });
}
/** JSON 으로 적었다 읽은 값(저장소를 한 번 거친 값과 같아야 하는 기준) */
const plain = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const old = (state: unknown, version = 0): string => JSON.stringify({ state, version });
const isCompact = (text: string | null | undefined): boolean => !!text && /^\{"state":\{"(items|transactions)":\{"z":1,/.test(text);
const uuid = (n: number): string => `${n.toString(16).padStart(8, "0")}-1111-4222-8333-${(n * 7919).toString(16).padStart(12, "0")}`;

/** 손으로 만든 보관함 기록: 지금의 모양, 옛 모양, 다른 작업이 더한 칸, 줄일 수 없는 값을 고루 넣는다 */
function awkwardItems(): unknown[] {
  const table = Array.from({ length: 100 }, (_, i) => ({ id: `box-a-item-${i}`, dropRate: i === 0 ? 0.01 : i === 1 ? 1.99 : 1 }));
  const fair = { serverSeed: SEED, serverSeedHash: "h".repeat(64), clientSeed: "c".repeat(32), oddsVersion: "v2-2026-10" };
  const base = { boxSlug: "box-a", tier: "royal", fundingSource: "crypto", fundingRatio: { crypto: 1, card: 0 }, boxPriceUsdt: 5 };
  const address = { recipient: "수령인", country: "KR", phone: "+821000000000", postalCode: "00000", address: "어딘가 1" };
  return [
    // 한 번에 연 셋(거래 번호와 시각이 같다). 하나는 받았고 하나는 무료 개봉이다
    { ...base, id: "own_" + uuid(1), itemId: "box-a-item-3", valueUsdt: 12.5, status: "IN_STORAGE", acquiredAt: "2026-10-12T05:00:00.000Z", openingId: "op_" + uuid(100), freeOpen: false, fair: { ...fair, nonce: 12, roll: 999999, dropTable: plain(table) } },
    { ...base, id: "own_" + uuid(2), itemId: "box-a-item-0", valueUsdt: 4000, status: "SOLD", acquiredAt: "2026-10-12T05:00:00.000Z", openingId: "op_" + uuid(100), freeOpen: true, soldForUsdt: 3800, soldAt: "2026-10-12T05:00:03.250Z", fair: { ...fair, nonce: 11, roll: 0, dropTable: plain(table) } },
    { ...base, id: "own_" + uuid(3), itemId: "box-a-item-9", valueUsdt: 0, status: "SOLD", acquiredAt: "2026-10-12T05:00:00.000Z", openingId: "op_" + uuid(100), freeOpen: false, soldForUsdt: 0, soldAt: "2026-10-12T05:00:00.000Z", autoCashback: true, autoCashbackAt: "2026-10-12T05:00:00.000Z", fair: { ...fair, nonce: 10, roll: 500000, dropTable: plain(table) } },
    // 배송 신청, 취소 이력, 카드와 섞인 자금
    { ...base, fundingSource: "mixed", fundingRatio: { crypto: 0.37, card: 0.63 }, id: "own_" + uuid(4), itemId: "box-a-item-4", valueUsdt: 99.99, status: "SHIPPING", acquiredAt: "2026-10-11T23:59:59.999Z", openingId: "op_" + uuid(101),
      shipping: { address, feeUsdt: 15, requestedAt: "2026-10-12T00:10:00.000Z", carrier: "DHL", trackingNumber: "1234567890", shippedAt: "2026-10-12T01:00:00.000Z", requestId: "own_" + uuid(50), feeFundingRatio: { crypto: 1, card: 0 } },
      shippingCancellations: [{ requestId: "own_" + uuid(49), requestedAt: "2026-10-12T00:01:00.000Z", cancelledAt: "2026-10-12T00:02:00.000Z", feeRefundUsdt: 15, toCrypto: 15, toCard: 0 }],
      fair: { ...fair, nonce: 9, roll: 123456, dropTable: plain(table) } },
    // 다른 작업이 더한 상태와 칸(업그레이드): 모르는 것은 그대로 남아야 한다
    { ...base, id: "own_" + uuid(5), itemId: "box-a-item-5", valueUsdt: 30, status: "UPGRADED", acquiredAt: "2026-10-11T20:00:00.000Z", openingId: "op_" + uuid(102),
      upgrade: { id: "up_" + uuid(60), at: "2026-10-12T02:00:00.000Z", serverSeed: SEED, nonce: 3, roll: 42, chanceUnits: 4500, won: false, stake: { itemId: "box-a-item-5", valueUsdt: 30 } },
      upgradedFrom: { id: "up_" + uuid(61), stakeOwnedId: "own_" + uuid(1) }, fair: { ...fair, nonce: 8, roll: 77, dropTable: plain(table), futureField: { deep: [1, 2, 3] } } },
    // 옛 기록: 거래 번호, 가격, 확률표, 자금 출처가 없다. id 는 UUID 가 아니다
    { id: "own_k2j3h4_1", itemId: "da-iphone16", boxSlug: "dollar-apple", valueUsdt: 1000, tier: "royal", status: "IN_STORAGE", acquiredAt: "2026-09-01T00:00:00.000Z", fair: { serverSeed: "capture-fixture", serverSeedHash: "x", clientSeed: "capture-client", nonce: 0, roll: 0 } },
    { id: "capture-item-2", itemId: "aud-airpods", boxSlug: "dollar-apple", valueUsdt: 549, tier: "royal", status: "DELIVERED", acquiredAt: "2026-09-01T00:00:00Z", soldAt: "어제", fair: { serverSeed: "capture-fixture", serverSeedHash: "x", clientSeed: "capture-client", nonce: 1, roll: 5, dropTable: [] } },
    // 줄일 수 없는 값: 대문자 UUID, 숫자가 아닌 값, null, 모양이 다른 확률표와 비율, 이름이 특이한 칸
    { id: "own_" + uuid(6).toUpperCase(), itemId: 7, boxSlug: null, valueUsdt: "12", tier: "royal", status: "SOLD", acquiredAt: 1791800000000, openingId: 5, freeOpen: "yes", soldForUsdt: null, soldAt: "2026-10-12T05:00:03.250Z",
      fundingRatio: { crypto: 1 }, boxPriceUsdt: "5", fair: { serverSeed: 1, nonce: "3", roll: null, dropTable: [{ id: "a", dropRate: 50, value: 3 }, { id: "b", dropRate: 50 }], oddsVersion: null } },
    { id: "own_" + uuid(7), fair: {} },
    { id: "own_" + uuid(8), fair: "none", status: "IN_STORAGE" },
    JSON.parse('{"id":"own_x","__proto__":{"polluted":true},"fair":{"__proto__":1,"nonce":2}}'),
    null, "text", 3, [1, 2], {},
  ];
}

function awkwardTransactions(): unknown[] {
  const a = "own_" + uuid(1); const b = "own_" + uuid(2);
  return [
    { id: "tx_" + uuid(201), type: "sellback", amountUsdt: 190, at: "2026-10-12T05:00:10.000Z", ref: `${a},${b}`, itemIds: [a, b] },
    { id: "tx_" + uuid(202), type: "sellback", amountUsdt: 1.5, at: "2026-10-12T05:00:00.000Z", ref: "box-a:cashback x3" },
    { id: "tx_" + uuid(203), type: "open", amountUsdt: -15, at: "2026-10-12T05:00:00.000Z", ref: "box-ax3+free1:op_" + uuid(100), rolloverUsdt: 4.5 },
    { id: "tx_" + uuid(204), type: "open", amountUsdt: 0, at: "2026-10-12T04:59:00.000Z", ref: "box-ax1", rolloverUsdt: 0 },
    // 옛 받기 기록: itemIds 없이 ref 에 쉼표로 이어 적었다
    { id: "tx_" + uuid(205), type: "sellback", amountUsdt: 95, at: "2026-10-11T04:59:00.000Z", ref: `${a},${b}` },
    // ref 가 itemIds 와 다르다, 빈 itemIds, 둘이 함께 있는 기록
    { id: "tx_" + uuid(206), type: "sellback", amountUsdt: 95, at: "2026-10-11T04:58:00.000Z", ref: "manual", itemIds: [a] },
    { id: "tx_" + uuid(207), type: "sellback", amountUsdt: 0, at: "2026-10-11T04:57:00.000Z", ref: "", itemIds: [] },
    { id: "tx_" + uuid(208), type: "open", amountUsdt: -5, at: "2026-10-11T04:56:00.000Z", itemIds: [b, "legacy-id"], rolloverUsdt: 5 },
    { id: "tx_" + uuid(209), accountId: "browser_" + uuid(300), type: "bonus", amountUsdt: 10000, at: "2026-10-10T00:00:00.000Z", ref: "welcome" },
    { id: "capture-withdraw-1", serverId: "capture-withdraw-1", type: "withdraw", amountUsdt: -50, feeUsdt: 1, netUsdt: 49, at: "2026-10-09T00:00:00.000Z", status: "PENDING_72H_HOLD", network: "TRC20", address: "T" + "1".repeat(33), authMethod: "EMAIL_72H_HOLD", unlockAt: 1791900000000, emailMasked: "c***@example.invalid" },
    // 잔액에서 차감하지 못한 출금 요청의 줄: 장부 금액 0, 신청한 금액은 requestedUsdt 에만 있다(stores/walletStore 의 recordWithdrawal)
    { id: "tx_" + uuid(212), serverId: "srv-w-2", accountId: "browser_" + uuid(300), type: "withdraw", amountUsdt: 0, requestedUsdt: 50, at: "2026-10-09T00:00:01.000Z", status: "FAILED", network: "TRC20", address: "T" + "2".repeat(33), authMethod: "2FA_OTP" },
    { id: "tx_" + uuid(210), type: "deposit_usdt", amountUsdt: 100, at: "2026-10-08T00:00:00.000Z", ref: "TRC20:" + "f".repeat(64), status: "COMPLETED", txHash: "f".repeat(64), receipt: undefined },
    { id: "tx_" + uuid(211), type: "shipping_refund", amountUsdt: 15, at: "not a date", ref: "own_" + uuid(50), status: "COMPLETED" },
    { id: 12, type: null, amountUsdt: "5", at: 5, ref: 7, itemIds: [1, "x"], rolloverUsdt: "1", status: 3 },
    null, [], "x",
  ];
}

test("보관함: 옛 형식 → 줄인 형식 → 다시 읽기. 값이 하나도 달라지지 않는다", () => {
  const items = awkwardItems();
  const before = old({ items });
  const text = cs.ledgerText("inventory", cs.parseLedger(before)!);
  assert.ok(isCompact(text), "줄인 형식으로 적힌다");
  assert.ok(text.length < before.length / 3, `${before.length}자 → ${text.length}자`);
  assert.deepEqual(cs.parseLedger(text), JSON.parse(before));
  // 줄인 글을 읽어 다시 적어도 같은 값이다(거듭 적어도 달라지지 않는다)
  assert.deepEqual(cs.parseLedger(cs.ledgerText("inventory", cs.parseLedger(text)!)), JSON.parse(before));
  // "__proto__" 는 보통 칸으로 남고 객체의 원형을 바꾸지 않는다
  const back = cs.parseLedger<{ items: unknown[] }>(text)!.state.items;
  assert.equal(({} as { polluted?: boolean }).polluted, undefined);
  assert.ok(Object.prototype.hasOwnProperty.call(back[10], "__proto__"));
});

test("보관함: 같은 확률표는 저장소에 한 벌만 있고, 읽은 기록들은 같은 표를 함께 가리킨다", () => {
  const items = awkwardItems();
  const text = cs.ledgerText("inventory", { state: { items }, version: 0 });
  const packed = JSON.parse(text).state.items as { t: unknown[][] };
  // 표는 둘뿐이다: 100줄짜리 하나(다섯 기록이 함께 쓴다)와 빈 표 하나. 모양이 다른 표는 그 기록에 그대로 남는다
  assert.deepEqual(packed.t.map((table) => table.length), [200, 0]);
  assert.equal(text.split("box-a-item-57").length - 1, 1, "상품 번호는 글자 표에 한 번만 적힌다");
  const back = cs.parseLedger<{ items: OwnedItem[] }>(text)!.state.items;
  assert.equal(back[0].fair.dropTable!.length, 100);
  assert.strictEqual(back[0].fair.dropTable, back[4].fair.dropTable);
  // 옛 형식을 읽을 때도 같은 표를 한 벌로 모은다
  const fromOld = cs.parseLedger<{ items: OwnedItem[] }>(old({ items }))!.state.items;
  assert.strictEqual(fromOld[1].fair.dropTable, fromOld[3].fair.dropTable);
});

test("지갑: 옛 형식 → 줄인 형식 → 다시 읽기. 거래 기록과 나머지 칸이 그대로다", () => {
  const state = { balance: 105.5, cryptoBalance: 100, cardBalance: 5.5, transactions: awkwardTransactions(), settledDepositRefs: ["deposit_usdt:TRC20:" + "f".repeat(64)], welcomeClaimed: true,
    totalDeposited: 100, totalDepositedCrypto: 100, totalDepositedCard: 0, totalWagered: 20, burst: { "box-a": { crypto: 0.1, card: 0 } }, freeOpens: { "box-a": 1 }, freeOpensGranted: true };
  const before = old(state, 4);
  const text = cs.ledgerText("wallet", cs.parseLedger(before)!);
  assert.ok(isCompact(text));
  assert.deepEqual(cs.parseLedger(text), JSON.parse(before));
  const packed = JSON.parse(text);
  assert.equal(packed.version, 4);
  // 잔액 같은 칸은 줄이지 않는다. 옛 코드가 읽던 자리에 그대로 있다
  assert.equal(packed.state.cryptoBalance, 100);
  assert.deepEqual(packed.state.settledDepositRefs, state.settledDepositRefs);
  // 받기 기록의 ref 는 itemIds 와 같으면 다시 적지 않는다(상품 번호가 두 번 적히지 않는다)
  assert.deepEqual(packed.state.transactions.r[0][4], -1);
});

test("지갑: 차감하지 못한 출금 줄(requestedUsdt)과 그 마감이 저장소를 거쳐도 그대로다. 지갑 내역의 줄도 같다", async () => {
  await reset(10);
  const wallet = useWalletStore.getState();
  const address = "T" + "3".repeat(33);
  // 잔액 10 으로 50 을 신청: 차감하지 못해 장부 금액 0 인 줄이 된다
  const unknown = wallet.recordWithdrawal({ type: "withdraw", amountUsdt: -50, feeUsdt: 1, netUsdt: 49, status: "PENDING", network: "TRC20", address, authMethod: "2FA_OTP", serverId: "srv-1", accountId: "browser_x" });
  const paid = useWalletStore.getState().recordWithdrawal({ type: "withdraw", amountUsdt: -5, feeUsdt: 1, netUsdt: 4, status: "PENDING", network: "TRC20", address, authMethod: "2FA_OTP", serverId: "srv-2", accountId: "browser_x" });
  assert.equal(useWalletStore.getState().closeUnknownWithdrawal(unknown.id), true);
  const memory = plain(useWalletStore.getState().transactions);
  assert.ok(isCompact(disk.get(WALLET)));
  const saved = cs.readLedger<{ transactions: Transaction[]; cryptoBalance: number }>(WALLET)!.state;
  assert.deepEqual(saved.transactions, memory);
  const row = saved.transactions.find((tx) => tx.id === unknown.id)!;
  assert.deepEqual([row.amountUsdt, row.requestedUsdt, row.status, isUndebitedWithdrawal(row), "feeUsdt" in row], [0, 50, "FAILED", true, false]);
  assert.deepEqual([saved.transactions.find((tx) => tx.id === paid.id)!.amountUsdt, saved.cryptoBalance], [-5, 5]);
  assert.deepEqual(walletHistoryRows(saved.transactions, "browser_x"), walletHistoryRows(useWalletStore.getState().transactions, "browser_x"));
});

test("같은 내용이면 기록의 칸 순서가 달라도 같은 글이다. 읽어서 그대로 다시 적으면 저장된 글이 한 글자도 바뀌지 않는다", () => {
  const reversed = (list: unknown[]) => list.map((x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).reverse().map(([k, v]) => [k, k === "fair" && v && typeof v === "object" ? Object.fromEntries(Object.entries(v).reverse()) : v])) : x));
  // 줄이는 칸만 가진 기록: 칸 순서를 뒤집어도 글이 같다(모르는 칸은 원래 순서 그대로 남기므로 이 비교에서 뺀다)
  const known = realisticLedger(9);
  const knownItems = [known.items[1], known.items[2]]; const knownTx = [0, 3, 4, 5].map((i) => known.wallet.transactions[i]);
  assert.equal(cs.ledgerText("inventory", { state: { items: reversed(knownItems) }, version: 0 }), cs.ledgerText("inventory", { state: { items: knownItems }, version: 0 }));
  assert.equal(cs.ledgerText("wallet", { state: { transactions: reversed(knownTx) }, version: 4 }), cs.ledgerText("wallet", { state: { transactions: knownTx }, version: 4 }));
  // 모르는 칸이 섞인 기록도, 읽은 것을 그대로 다시 적으면 같은 글이다
  const items = awkwardItems(); const transactions = awkwardTransactions();
  for (const [kind, value] of [["inventory", { state: { items }, version: 0 }], ["wallet", { state: { balance: 1, transactions }, version: 4 }]] as const) {
    const text = cs.ledgerText(kind, value);
    assert.equal(cs.ledgerText(kind, cs.parseLedger(text)!), text, kind);
  }
});

test("빈 목록은 옛 형식 그대로 적는다. 줄인 형식의 모르는 번호는 읽지 않는다", () => {
  assert.equal(cs.ledgerText("inventory", { state: { items: [] }, version: 0 }), '{"state":{"items":[]},"version":0}');
  assert.equal(cs.ledgerText("wallet", { state: { balance: 0, transactions: [] }, version: 4 }), '{"state":{"balance":0,"transactions":[]},"version":4}');
  assert.equal(cs.parseLedger(null), null);
  assert.throws(() => cs.parseLedger('{"state":{"items":{"z":2,"s":[],"t":[],"c":[],"r":[]}},"version":0}'), cs.LedgerFormatError);
  assert.throws(() => cs.parseLedger('{"state":{"transactions":{"z":1,"s":[],"r":[[5]]}},"version":4}'), cs.LedgerFormatError);
  assert.throws(() => cs.parseLedger("{not json"), SyntaxError);
});

test("풀지 못한 줄인 장부는 덮어쓰지 않고(스토어가 빈 장부를 다시 적어도 저장된 글이 남는다), 그 위에서는 돈을 움직이지 않는다", async () => {
  await reset();
  const unreadable = '{"state":{"items":{"z":99,"future":true}},"version":0}';
  disk.set(INVENTORY, unreadable);
  await useInventoryStore.persist.rehydrate();
  useInventoryStore.setState({ items: [] });
  assert.equal(disk.get(INVENTORY), unreadable);
  // 그 장부 위에서는 돈을 움직이지 않는다: 개봉은 값을 치르기 전에 멈추고, 받기는 아무것도 실행하지 않는다
  const walletBefore = disk.get(WALLET);
  await assert.rejects(createOpeningPurchase(products.BOXES[0], 1)(), (error: unknown) => error instanceof LedgerUnavailable);
  assert.equal(useWalletStore.getState().balance, 1e9);
  assert.equal(useWalletStore.getState().transactions.length, 0);
  const out = await settleTakeMany(["own_anything"]);
  assert.deepEqual([out.status, out.taken.length], ["failed", 0]);
  assert.equal(disk.get(WALLET), walletBefore);
  assert.equal(disk.get(INVENTORY), unreadable);
  // 읽을 수 있는 값이 다시 놓이면 전처럼 쓴다
  disk.set(INVENTORY, old({ items: [] }));
  await useInventoryStore.persist.rehydrate();
  useInventoryStore.getState().add([{ itemId: "x", boxSlug: "y", valueUsdt: 1, tier: "royal", fair: { serverSeed: "s", serverSeedHash: "h", clientSeed: "c", nonce: 0, roll: 0 } }]);
  assert.ok(isCompact(disk.get(INVENTORY)));
});

test("크기: 100개짜리 박스를 하나씩 200번 열고 하나씩 받아도 개봉 한 건이 300자를 넘지 않는다(확률표 한 벌은 따로 6,000자 이하)", async () => {
  await reset();
  const box = products.V2_BOXES.find((b) => b.items.length === 100) ?? products.BOXES.find((b) => b.items.length >= 100)!;
  assert.ok(box && box.items.length >= 100, "100개짜리 박스가 있어야 한다");
  const N = 200;
  for (let i = 0; i < N; i++) {
    const results = await createOpeningPurchase(box, 1, "op_" + crypto.randomUUID())();
    const held = results.filter((r) => !r.settled).map((r) => r.ownedId);
    if (held.length) takeUsdt(held);
  }
  const items = useInventoryStore.getState().items; const transactions = useWalletStore.getState().transactions;
  assert.equal(items.length, N);
  const inventory = disk.get(INVENTORY)!; const wallet = disk.get(WALLET)!;
  assert.ok(isCompact(inventory) && isCompact(wallet));
  const packed = JSON.parse(inventory).state.items as { s: unknown; t: unknown; c: unknown; r: unknown };
  // 고정 비용: 글자 표, 확률표, 묶음. 박스 하나를 연 것이므로 확률표 한 벌이다
  const fixed = JSON.stringify(packed.s).length + JSON.stringify(packed.t).length + JSON.stringify(packed.c).length;
  const perOpening = (inventory.length - fixed + wallet.length) / N;
  const before = (old({ items }).length + old({ transactions }, 4).length) / N;
  assert.ok(fixed <= 6000, `확률표 한 벌과 글자 표 ${fixed}자`);
  assert.ok(perOpening <= 300, `개봉 한 건 ${perOpening.toFixed(1)}자(보관함 기록과 거래 기록 둘)`);
  assert.ok(before / ((inventory.length + wallet.length) / N) > 15, `옛 형식 ${before.toFixed(0)}자 → 줄인 형식 ${((inventory.length + wallet.length) / N).toFixed(0)}자`);
  // 5,242,880자 한도에 2만 건이 들어간다(박스 30개를 열었다고 보고 고정 비용을 뺀다)
  assert.ok((5_242_880 - 30 * fixed) / perOpening >= 20_000, `${Math.floor((5_242_880 - 30 * fixed) / perOpening)}건`);
  // 저장된 것을 새 탭처럼 다시 읽으면 기억 속 장부와 같다
  assert.deepEqual(cs.readLedger<{ items: OwnedItem[] }>(INVENTORY)!.state.items, plain(items));
  assert.deepEqual(cs.readLedger<{ transactions: Transaction[] }>(WALLET)!.state.transactions, plain(transactions));
});

test("검증: 줄인 뒤 다시 읽은 기록이 그때의 확률표로 똑같이 계산된다(지금 카탈로그에 없는 표). 옛 형식의 같은 기록과 결과가 같다", async () => {
  await reset(1000);
  // 카탈로그의 박스에서 상품 넷만 남기고 확률을 바꾼 표. 개봉 뒤에 카탈로그가 바뀐 것과 같다: 이 표는 저장소에만 남는다
  const source = products.BOXES.find((b) => b.items.filter((i) => i.kind === "physical").length >= 4)!;
  const four = source.items.filter((i) => i.kind === "physical").slice(0, 4);
  const box = { ...source, price: 10, guaranteedMin: 1, items: four.map((item, i) => ({ ...item, value: 40 - i * 10, dropRate: [10, 20, 30, 40][i] })) };
  const table = products.dropTable(box).map(({ id, dropRate }) => ({ id, dropRate }));
  assert.notDeepEqual(table, products.dropTable(source).map(({ id, dropRate }) => ({ id, dropRate })));
  const results = await createOpeningPurchase(box, 10, "op_" + crypto.randomUUID())();
  takeUsdt([results[3].ownedId]);
  assert.equal(disk.get(INVENTORY)!.split(JSON.stringify(four[0].id)).length - 1, 1, "표의 상품 번호는 저장소에 한 번만 적힌다");
  const memory = plain(useInventoryStore.getState().items);
  const compactText = disk.get(INVENTORY)!;
  assert.ok(isCompact(compactText));
  // 새 탭처럼 저장소에서 다시 읽는다
  useInventoryStore.setState({ items: [] });
  disk.set(INVENTORY, compactText);
  await useInventoryStore.persist.rehydrate();
  const loaded = useInventoryStore.getState().items;
  assert.deepEqual(plain(loaded), memory);
  for (const result of results) {
    const record = loaded.find((item) => item.id === result.ownedId)!;
    assert.deepEqual(record.fair.dropTable, table, "그때의 표가 순서까지 그대로다");
    // 부르는 쪽이 지금 카탈로그의 표를 실어 보내도 저장된 당시 표로 계산한다
    const target = verify.recordToVerify({ ownedId: record.id, itemId: record.itemId, fair: { ...record.fair, dropTable: products.dropTable(source).map(({ id, dropRate }) => ({ id, dropRate })) } }, loaded);
    const out = await verify.verifyOpeningRecord(target);
    assert.equal(target.stored, true);
    assert.deepEqual([out.hashMatch, out.rollMatch, out.itemMatch, out.expectedItemId, out.roll], [true, true, true, result.item.id, result.roll]);
    // 옛 형식으로 저장돼 있던 같은 기록의 결과와 같다
    const legacy = cs.parseLedger<{ items: OwnedItem[] }>(old({ items: memory }))!.state.items.find((item) => item.id === record.id)!;
    assert.deepEqual(await verify.verifyOpeningRecord(legacy), out);
  }
});

test("받기(lib/takeBatch)는 줄인 장부를 직접 읽어 판정한다: 한 번만 받고, 받은 뒤의 저장된 장부도 줄인 형식이다", async () => {
  await reset(1000);
  const physical = products.BOXES.flatMap((b) => b.items.map((item) => ({ item, box: b }))).find((x) => x.item.kind === "physical")!;
  const ids = useInventoryStore.getState().add([1, 2, 3].map((n) => ({ itemId: physical.item.id, boxSlug: physical.box.slug, valueUsdt: 100, tier: "royal" as const, fair: { serverSeed: "s", serverSeedHash: "h", clientSeed: "c", nonce: n, roll: n } }))).map((item) => item.id);
  assert.ok(isCompact(disk.get(INVENTORY)));
  const out = await settleTakeMany([ids[0], ids[1]]);
  assert.equal(out.status, "settled");
  assert.deepEqual(out.taken.map((x) => x.amountUsdt), [95, 95]);
  assert.ok(isCompact(disk.get(INVENTORY)) && isCompact(disk.get(WALLET)));
  const inventory = cs.readLedger<{ items: OwnedItem[] }>(INVENTORY)!.state.items; const wallet = cs.readLedger<{ cryptoBalance: number; transactions: Transaction[] }>(WALLET)!.state;
  assert.deepEqual(inventory.map((item) => item.status).sort(), ["IN_STORAGE", "SOLD", "SOLD"]);
  assert.equal(wallet.cryptoBalance, 1190);
  assert.deepEqual([...(wallet.transactions[0].itemIds ?? [])].sort(), [ids[0], ids[1]].sort());
  assert.equal(wallet.transactions[0].ref, wallet.transactions[0].itemIds!.join(","));
  // 새 탭처럼 다시 읽은 뒤 같은 상품을 다시 불러도 더 받지 않는다
  await Promise.all([useWalletStore.persist.rehydrate(), useInventoryStore.persist.rehydrate()]);
  const again = await settleTakeMany(ids);
  assert.deepEqual([again.taken.length, again.already.length], [1, 2]);
  assert.equal(cs.readLedger<{ cryptoBalance: number }>(WALLET)!.state.cryptoBalance, 1285);
});

test("한도가 찬 저장소: 열 때 옛 형식의 장부가 기록을 잃지 않고 줄어든다. 새 키를 만들지 않고 같은 키에 덮어쓴다", async () => {
  await reset();
  // 옛 형식의 장부 넷: 지금 계정, 다른 계정, 손님, 계정이 생기기 전의 기본 키. 기록마다 100줄짜리 확률표가 통째로 들어 있다
  const table = (slug: string) => Array.from({ length: 100 }, (_, i) => ({ id: `${slug}-product-number-${i}`, dropRate: 1 }));
  const fair = { serverSeed: SEED, serverSeedHash: "h".repeat(64), clientSeed: "c".repeat(32), oddsVersion: "v2" };
  const itemsOf = (account: number, count: number) => Array.from({ length: count }, (_, i) => ({
    id: "own_" + uuid(account * 10000 + i), itemId: `box-${i % 3}-product-number-${i % 100}`, boxSlug: `box-${i % 3}`, valueUsdt: 10 + i, tier: "royal", status: i % 2 ? "SOLD" : "IN_STORAGE", acquiredAt: new Date(1791800000000 + i * 60000).toISOString(),
    fundingSource: "crypto", fundingRatio: { crypto: 1, card: 0 }, openingId: "op_" + uuid(account * 20000 + i), boxPriceUsdt: 5, freeOpen: false,
    ...(i % 2 ? { soldForUsdt: +((10 + i) * 0.95).toFixed(2), soldAt: new Date(1791800000000 + i * 60000 + 5000).toISOString() } : {}),
    fair: { ...fair, nonce: i, roll: (i * 7919) % 1000000, dropTable: table(`box-${i % 3}`) },
  }));
  const txOf = (account: number, count: number) => Array.from({ length: count }, (_, i) => ({ id: "tx_" + uuid(account * 30000 + i), type: i % 2 ? "sellback" : "open", amountUsdt: i % 2 ? 9.5 : -5, at: new Date(1791800000000 + i * 60000).toISOString(),
    ...(i % 2 ? { ref: "own_" + uuid(account * 10000 + i), itemIds: ["own_" + uuid(account * 10000 + i)] } : { ref: `box-${i % 3}x1:op_` + uuid(account * 20000 + i), rolloverUsdt: 5 }) }));
  const ledgers: Record<string, string> = {
    "voila.browser-inventory.browser_me": old({ items: itemsOf(1, 300) }), "voila.browser-wallet.browser_me": old({ balance: 50, cryptoBalance: 50, cardBalance: 0, transactions: txOf(1, 600) }, 4),
    "voila.browser-inventory.browser_other": old({ items: itemsOf(2, 120) }), "voila.browser-wallet.browser_other": old({ balance: 7, cryptoBalance: 7, cardBalance: 0, transactions: txOf(2, 240) }, 4),
    "voila.browser-inventory.guest": old({ items: [] }), "voila.browser-wallet.guest": old({ balance: 0, cryptoBalance: 0, cardBalance: 0, transactions: [] }, 4),
    "gachaflix.inventory": old({ items: itemsOf(3, 40) }), "gachaflix.wallet": old({ balance: 0, cryptoBalance: 0, cardBalance: 0, transactions: [] }, 4),
  };
  for (const [name, text] of Object.entries(ledgers)) disk.set(name, text);
  disk.set("gachaflix.settings", old({ muted: true }));
  // 같은 출처의 다른 사이트가 나머지를 채워 한도가 꽉 찼다(그 키는 이 사이트가 지울 수 없다)
  foreign.set("gachaflix.inventory@other-site", "x".repeat(1000));
  quota = used();
  const fullBefore = used();
  // 지금은 새 키도, 늘어나는 쓰기도 받지 않는다
  storage.setItem("voila.ledger-probe", "1");
  assert.deepEqual(refused, ["voila.ledger-probe"]);
  assert.equal(disk.has("voila.ledger-probe"), false);
  refused.length = 0;

  const done = cs.compactStoredLedgers(storage);
  assert.deepEqual(refused, [], "줄이는 동안 거절된 쓰기가 없다");
  // 기록이 있는 장부 다섯은 전부 줄었고 큰 것부터 적었다. 빈 장부 셋은 건드리지 않았다(줄지 않는다)
  assert.deepEqual(done, ["voila.browser-inventory.browser_me", "voila.browser-inventory.browser_other", "gachaflix.inventory", "voila.browser-wallet.browser_me", "voila.browser-wallet.browser_other"]);
  for (const name of done) assert.ok(isCompact(disk.get(name)), name);
  for (const name of ["voila.browser-inventory.guest", "voila.browser-wallet.guest", "gachaflix.wallet"]) assert.equal(disk.get(name), ledgers[name]);
  assert.equal(disk.get("gachaflix.settings"), old({ muted: true }));
  assert.equal(foreign.get("gachaflix.inventory@other-site")!.length, 1000);
  // 기록은 하나도 달라지지 않았다
  for (const [name, text] of Object.entries(ledgers)) assert.deepEqual(cs.readLedger(name), JSON.parse(text), name);
  const after = used();
  assert.ok(after < fullBefore / 10, `${fullBefore}자 → ${after}자`);
  // 이제 새 키를 쓸 자리가 있다. 한 번 더 돌려도 다시 적지 않는다
  storage.setItem("voila.ledger-probe", "1");
  assert.deepEqual(refused, []);
  disk.delete("voila.ledger-probe");
  assert.deepEqual(cs.compactStoredLedgers(storage), []);
});

test("한도가 찬 저장소: 줄이기 전에 스토어가 먼저 읽어도 옛 형식을 그대로 읽고, 읽은 뒤의 첫 쓰기가 줄인 형식이다", async () => {
  await reset();
  const table = Array.from({ length: 100 }, (_, i) => ({ id: `box-a-product-number-${i}`, dropRate: 1 }));
  const items = Array.from({ length: 150 }, (_, i) => ({ id: "own_" + uuid(i + 1), itemId: `box-a-product-number-${i % 100}`, boxSlug: "box-a", valueUsdt: 10, tier: "royal", status: "IN_STORAGE", acquiredAt: new Date(1791800000000 - i * 1000).toISOString(),
    fundingSource: "crypto", fundingRatio: { crypto: 1, card: 0 }, openingId: "op_" + uuid(5000 + i), boxPriceUsdt: 5, freeOpen: false, fair: { serverSeed: SEED, serverSeedHash: "h".repeat(64), clientSeed: "c", oddsVersion: "v2", nonce: i, roll: i, dropTable: table } }));
  const transactions = [{ id: "tx_" + uuid(9000), type: "deposit_usdt", amountUsdt: 500, at: "2026-10-12T00:00:00.000Z", ref: "seed", status: "COMPLETED" }];
  disk.set(INVENTORY, old({ items }));
  disk.set(WALLET, old({ balance: 500, cryptoBalance: 500, cardBalance: 0, transactions, settledDepositRefs: [], welcomeClaimed: false, totalDeposited: 500, totalDepositedCrypto: 500, totalDepositedCard: 0, totalWagered: 0, burst: {}, freeOpens: {}, freeOpensGranted: false }, 4));
  quota = used();
  const fullBefore = disk.get(INVENTORY)!.length;
  await Promise.all([useWalletStore.persist.rehydrate(), useInventoryStore.persist.rehydrate()]);
  assert.deepEqual(plain(useInventoryStore.getState().items), items);
  assert.deepEqual(plain(useWalletStore.getState().transactions), transactions);
  assert.equal(useWalletStore.getState().balance, 500);
  // 이 사이트의 스토어는 읽은 직후 한 번 적는다(hydrated 표시). 그 쓰기가 같은 키의 더 짧은 글이라 한도가 차 있어도 들어간다
  useInventoryStore.setState({ hydrated: true }); useWalletStore.setState({ hydrated: true });
  assert.deepEqual(refused, []);
  assert.ok(isCompact(disk.get(INVENTORY)) && isCompact(disk.get(WALLET)));
  assert.ok(disk.get(INVENTORY)!.length < fullBefore / 20, `${fullBefore}자 → ${disk.get(INVENTORY)!.length}자`);
  // 그 뒤로는 받기가 끝까지 저장된다(한도는 그대로다)
  const out = await settleTakeMany([items[0].id, items[1].id]);
  assert.equal(out.status, "settled");
  assert.deepEqual(refused, []);
  assert.equal(cs.readLedger<{ cryptoBalance: number }>(WALLET)!.state.cryptoBalance, 519);
  assert.equal(cs.readLedger<{ items: OwnedItem[] }>(INVENTORY)!.state.items.filter((item) => item.status === "SOLD").length, 2);
  assert.equal(cs.readLedger<{ items: OwnedItem[] }>(INVENTORY)!.state.items.length, 150);
});

// ── 옮기는 일의 완료 조건(flow/REVIEW_codex-4.md 4.4) ─────────────────────────────

type Loose = Record<string, any>;
const iso = (minutes: number): string => new Date(1791800000000 + minutes * 60_000).toISOString();

/**
 * 실제 모양의 장부 하나. 보관 중, 받은 것, 업그레이드(성공: 건 상품과 들어온 목표 상품, 실패: 건 상품만), 배송 세 단계와 취소 이력,
 * 옛 빌드가 적은 칸, 거래 번호도 확률표도 없는 옛 기록. 거래 기록은 충전, 보너스, 개봉, 받기, 출금 대기, 차감하지 못한 출금 줄을 고루 넣는다.
 * 업그레이드 기록의 모양은 업그레이드의 기록(UpgradeRecord: id, at, 시드 셋, nonce, roll, chanceUnits, won, stake, target)과
 * 들어온 목표 상품의 upgradedFrom 을 옮겼다(그 모듈을 부르지는 않는다. 이 파일은 모르는 칸을 그대로 두는지만 본다).
 */
function realisticLedger(account: number): { items: Loose[]; wallet: Loose } {
  const own = (n: number) => "own_" + uuid(account * 1000 + n);
  const table = (slug: string) => Array.from({ length: 100 }, (_, i) => ({ id: `${slug}-item-${99 - i}`, dropRate: i < 2 ? 0.5 : i === 2 ? 2 : 1 }));
  const seeds = { serverSeed: SEED, serverSeedHash: "h".repeat(64), clientSeed: "client-" + account };
  const base = (n: number, slug: string, value: number, over: Loose = {}): Loose => ({
    id: own(n), itemId: `${slug}-item-${n}`, boxSlug: slug, valueUsdt: value, tier: "royal", status: "IN_STORAGE", acquiredAt: iso(-n * 7), fundingSource: "crypto", fundingRatio: { crypto: 1, card: 0 },
    openingId: "op_" + uuid(account * 2000 + n), boxPriceUsdt: slug === "box-a" ? 5 : 50, freeOpen: false, fair: { ...seeds, oddsVersion: "v2", nonce: 100 + n, roll: (n * 7919 + account) % 1_000_000, dropTable: table(slug) }, ...over });
  const address = { recipient: "수령인", country: "KR", phone: "+821000000000", postalCode: "00000", address: "어딘가 1" };
  const win = { id: "up_" + uuid(account * 3000 + 1), at: iso(5), ...seeds, nonce: 140, roll: 1234, chanceUnits: 4500, won: true,
    stake: { ownedId: own(3), itemId: "box-a-item-3", boxSlug: "box-a", valueUsdt: 30 }, target: { ownedId: "own_up_" + uuid(account * 3000 + 1), itemId: "box-b-item-9", boxSlug: "box-b", valueUsdt: 60 } };
  const loss = { id: "up_" + uuid(account * 3000 + 2), at: iso(6), ...seeds, nonce: 141, roll: 987654, chanceUnits: 2250, won: false,
    stake: { ownedId: own(4), itemId: "box-b-item-4", boxSlug: "box-b", valueUsdt: 20 }, target: { ownedId: "own_up_" + uuid(account * 3000 + 2), itemId: "box-b-item-1", boxSlug: "box-b", valueUsdt: 800 } };
  const items: Loose[] = [
    // 성공한 업그레이드로 들어온 목표 상품(건 상품의 자금 출처를 물려받았다)
    { id: win.target.ownedId, itemId: win.target.itemId, boxSlug: "box-b", valueUsdt: 60, tier: "royal", status: "IN_STORAGE", acquiredAt: win.at, fundingSource: "mixed", fundingRatio: { crypto: 0.37, card: 0.63 },
      fair: { ...seeds, nonce: 140, roll: 1234 }, upgradedFrom: { id: win.id, stakeOwnedId: own(3) } },
    base(1, "box-a", 20),
    base(2, "box-a", 100, { status: "SOLD", soldForUsdt: 95, soldAt: iso(1) }),
    base(3, "box-a", 30, { status: "UPGRADED", upgrade: win, fundingSource: "mixed", fundingRatio: { crypto: 0.37, card: 0.63 } }),
    base(4, "box-b", 20, { status: "UPGRADED", upgrade: loss, fundingSource: "card", fundingRatio: { crypto: 0, card: 1 } }),
    base(5, "box-b", 99.99, { status: "SHIPPING_REQUESTED", shipping: { address, feeUsdt: 7.5, requestedAt: iso(2), requestId: own(50), feeFundingRatio: { crypto: 1, card: 0 } },
      shippingCancellations: [{ requestId: own(49), requestedAt: iso(-3), cancelledAt: iso(-2), feeRefundUsdt: 15, toCrypto: 15, toCard: 0 }] }),
    base(6, "box-b", 549, { status: "SHIPPING", shipping: { address, feeUsdt: 7.5, requestedAt: iso(2), requestId: own(50), feeFundingRatio: { crypto: 1, card: 0 }, carrier: "DHL", trackingNumber: "1234567890", shippedAt: iso(3) } }),
    base(7, "box-a", 10, { status: "DELIVERED", freeOpen: true, shipping: { address, feeUsdt: 0, requestedAt: iso(-90), carrier: "FEDEX", trackingNumber: "T-1", shippedAt: iso(-80), deliveredAt: iso(-10) } }),
    // 옛 빌드가 적은 칸들
    base(8, "box-a", 1.5, { status: "SOLD", soldForUsdt: 1.5, soldAt: iso(-56), autoCashback: true, autoCashbackAt: iso(-56), legacyPity: 3, legacyNote: "옛 빌드가 적은 칸" }),
    { id: "own_k2j3h4_1", itemId: "da-iphone16", boxSlug: "dollar-apple", valueUsdt: 1000, tier: "royal", status: "IN_STORAGE", acquiredAt: "2026-09-01T00:00:00.000Z", fair: { serverSeed: "legacy", serverSeedHash: "x", clientSeed: "legacy-client", nonce: 0, roll: 0 } },
  ];
  const transactions: Loose[] = [
    { id: "tx_" + uuid(account * 4000 + 1), type: "sellback", amountUsdt: 95, at: iso(1), ref: own(2), itemIds: [own(2)] },
    { id: "tx_" + uuid(account * 4000 + 2), type: "withdraw", amountUsdt: -50, feeUsdt: 1, netUsdt: 49, at: iso(0), status: "PENDING_72H_HOLD", network: "TRC20", address: "T" + "1".repeat(33), authMethod: "EMAIL_72H_HOLD", unlockAt: 1791900000000, emailMasked: "c***@example.invalid" },
    { id: "tx_" + uuid(account * 4000 + 9), serverId: "srv-" + account, accountId: "browser_" + account, type: "withdraw", amountUsdt: 0, requestedUsdt: 70, at: iso(-1), status: "PENDING", network: "TRC20", address: "T" + "4".repeat(33), authMethod: "2FA_OTP" },
    { id: "tx_" + uuid(account * 4000 + 3), type: "open", amountUsdt: -55, at: iso(-7), ref: "box-bx1:op_" + uuid(account * 2000 + 1), rolloverUsdt: 55 },
    { id: "tx_" + uuid(account * 4000 + 4), type: "sellback", amountUsdt: 1.5, at: iso(-56), ref: "box-a:cashback x1" },
    { id: "tx_" + uuid(account * 4000 + 5), type: "open", amountUsdt: -5, at: iso(-56), ref: "box-ax1+free1", rolloverUsdt: 1.5 },
    { id: "tx_" + uuid(account * 4000 + 6), type: "deposit_card", amountUsdt: 63, at: iso(-100), ref: "pg-1", status: "COMPLETED", receipt: "R-1", network: "VISA" },
    { id: "tx_" + uuid(account * 4000 + 7), type: "deposit_usdt", amountUsdt: 100, at: iso(-200), ref: "TRC20:" + "f".repeat(64), status: "COMPLETED", txHash: "f".repeat(64), network: "TRC20" },
    { id: "tx_" + uuid(account * 4000 + 8), accountId: "browser_" + account, type: "bonus", amountUsdt: 10000, at: iso(-300), ref: "welcome" },
  ];
  const wallet: Loose = { balance: 10149.5, cryptoBalance: 10086.5, cardBalance: 63, transactions, settledDepositRefs: ["deposit_usdt:TRC20:" + "f".repeat(64), "deposit_card:pg-1"], welcomeClaimed: true,
    totalDeposited: 163, totalDepositedCrypto: 100, totalDepositedCard: 63, totalWagered: 56.5, burst: { "box-a": { crypto: 0.12, card: 0.03 } }, freeOpens: { "box-a": 1 }, freeOpensGranted: true };
  return { items, wallet };
}

/** 옮긴 앞뒤로 같아야 하는 것: 금액의 합, 상태, id, 자금 출처와 비율, 회차와 번호, 확률표(순서까지), 업그레이드와 배송 기록, 잔액과 거래 기록 */
function fingerprint(inventoryText: string | null | undefined, walletText: string | null | undefined): Loose {
  const items: Loose[] = inventoryText ? cs.parseLedger<Loose>(inventoryText)?.state.items ?? [] : [];
  const wallet: Loose = walletText ? cs.parseLedger<Loose>(walletText)?.state ?? {} : {};
  const txs: Loose[] = wallet.transactions ?? [];
  const sum = (list: unknown[]) => +list.reduce<number>((n, x) => n + (typeof x === "number" ? x : 0), 0).toFixed(2);
  return {
    count: items.length, ids: items.map((i) => i.id), itemIds: items.map((i) => i.itemId), statuses: items.map((i) => i.status), openings: items.map((i) => i.openingId ?? null),
    valueSum: sum(items.map((i) => i.valueUsdt)), soldSum: sum(items.map((i) => i.soldForUsdt)), priceSum: sum(items.map((i) => i.boxPriceUsdt)),
    sources: items.map((i) => i.fundingSource ?? null), ratios: items.map((i) => i.fundingRatio ?? null),
    seeds: items.map((i) => [i.fair?.serverSeed, i.fair?.serverSeedHash, i.fair?.clientSeed]), nonces: items.map((i) => i.fair?.nonce ?? null), rolls: items.map((i) => i.fair?.roll ?? null),
    tables: items.map((i) => i.fair?.dropTable ?? null), times: items.map((i) => [i.acquiredAt, i.soldAt ?? null]),
    upgrades: items.map((i) => [i.upgrade ?? null, i.upgradedFrom ?? null]), shipping: items.map((i) => [i.shipping ?? null, i.shippingCancellations ?? null]),
    balances: [wallet.balance ?? null, wallet.cryptoBalance ?? null, wallet.cardBalance ?? null], totals: [wallet.totalDeposited ?? null, wallet.totalWagered ?? null],
    txIds: txs.map((t) => t.id), txTypes: txs.map((t) => t.type), txSum: sum(txs.map((t) => t.amountUsdt)), requestedSum: sum(txs.map((t) => t.requestedUsdt)),
    txRefs: txs.map((t) => [t.ref ?? null, t.itemIds ?? null, t.status ?? null]), rolloverSum: sum(txs.map((t) => t.rolloverUsdt)),
  };
}
/** 풀지 못한 장부로 막아 둔 저장 키를 다시 연다(읽을 수 있는 값을 놓고 한 번 읽는다) */
async function unseal(): Promise<void> {
  onRead = null; onWrite = null;
  disk.set(INVENTORY, old({ items: [] })); disk.set(WALLET, old({ balance: 0, cryptoBalance: 0, cardBalance: 0, transactions: [] }, 4));
  await Promise.all([useWalletStore.persist.rehydrate(), useInventoryStore.persist.rehydrate()]);
}

test("업그레이드 기록(성공과 실패), 배송, 옛 칸이 든 장부: 옮긴 앞뒤로 금액의 합, 상태, id, 자금 출처, 회차, 확률표의 순서가 같다", async () => {
  await reset();
  const { items, wallet } = realisticLedger(1);
  const inventoryKey = "voila.browser-inventory.browser_a"; const walletKey = "voila.browser-wallet.browser_a";
  disk.set(inventoryKey, old({ items })); disk.set(walletKey, old(wallet, 4));
  const before = fingerprint(disk.get(inventoryKey), disk.get(walletKey));
  // 기준이 실제로 그 기록들을 담고 있는지
  assert.deepEqual(before.statuses, ["IN_STORAGE", "IN_STORAGE", "SOLD", "UPGRADED", "UPGRADED", "SHIPPING_REQUESTED", "SHIPPING", "DELIVERED", "SOLD", "IN_STORAGE"]);
  assert.deepEqual(before.upgrades.map((pair: Loose[]) => [pair[0]?.won ?? null, pair[1]?.stakeOwnedId ?? null]), [[null, items[3].id], [null, null], [null, null], [true, null], [false, null], [null, null], [null, null], [null, null], [null, null], [null, null]]);
  assert.deepEqual([before.valueSum, before.soldSum, before.txSum, before.requestedSum, before.balances], [1890.49, 96.5, 10149.5, 70, [10149.5, 10086.5, 63]]);
  assert.equal(before.tables[1].length, 100);
  assert.deepEqual(before.tables[1].slice(0, 3), [{ id: "box-a-item-99", dropRate: 0.5 }, { id: "box-a-item-98", dropRate: 0.5 }, { id: "box-a-item-97", dropRate: 2 }]);

  assert.deepEqual(cs.compactStoredLedgers(storage), [inventoryKey, walletKey]);
  assert.ok(isCompact(disk.get(inventoryKey)) && isCompact(disk.get(walletKey)));
  assert.deepEqual(fingerprint(disk.get(inventoryKey), disk.get(walletKey)), before);
  // 기준에 넣지 않은 칸까지 전부 같다(옛 빌드의 칸, 영수증, 주소 등)
  assert.deepEqual(cs.readLedger(inventoryKey), { state: { items }, version: 0 });
  assert.deepEqual(cs.readLedger(walletKey), { state: wallet, version: 4 });
  const back = cs.readLedger<Loose>(inventoryKey)!.state.items;
  assert.deepEqual([back[8].legacyPity, back[8].legacyNote, back[8].autoCashback], [3, "옛 빌드가 적은 칸", true]);
  assert.deepEqual(back[3].upgrade.target, items[3].upgrade.target);

  // 스토어가 읽고 적는 길(지금 쓰는 계정)도 같다: 옛 형식을 읽은 뒤의 첫 쓰기가 줄인 형식이고 값은 그대로다
  disk.set(INVENTORY, old({ items })); disk.set(WALLET, old(wallet, 4));
  await Promise.all([useWalletStore.persist.rehydrate(), useInventoryStore.persist.rehydrate()]);
  useInventoryStore.setState({ hydrated: true }); useWalletStore.setState({ hydrated: true });
  assert.ok(isCompact(disk.get(INVENTORY)) && isCompact(disk.get(WALLET)));
  assert.deepEqual(fingerprint(disk.get(INVENTORY), disk.get(WALLET)), before);
});

test("한쪽만 옮겨진 상태(보관함만, 지갑만): 섞인 형식을 그대로 읽고 값이 같다. 받기가 그 위에서 한 번만 돈다", async () => {
  for (const only of ["inventory", "wallet"] as const) {
    await reset();
    const { items, wallet } = realisticLedger(2);
    disk.set(INVENTORY, old({ items })); disk.set(WALLET, old(wallet, 4));
    const before = fingerprint(disk.get(INVENTORY), disk.get(WALLET));
    assert.equal(cs.compactStoredLedger(storage, only === "inventory" ? INVENTORY : WALLET), true, only);
    assert.deepEqual([isCompact(disk.get(INVENTORY)), isCompact(disk.get(WALLET))], [only === "inventory", only === "wallet"], only);
    assert.deepEqual(fingerprint(disk.get(INVENTORY), disk.get(WALLET)), before, only);
    // 새 탭처럼 읽는다
    await Promise.all([useWalletStore.persist.rehydrate(), useInventoryStore.persist.rehydrate()]);
    assert.deepEqual(plain(useInventoryStore.getState().items), items, only);
    assert.deepEqual(plain(useWalletStore.getState().transactions), wallet.transactions, only);
    // 보관 중인 상품 하나(상품가 20, USDT 출처)를 받는다: 19 가 출금할 수 있는 잔액으로 들어오고 나머지 기록은 그대로다
    const target = items[1].id;
    const out = await settleTakeMany([target]);
    assert.deepEqual([out.status, out.taken], ["settled", [{ id: target, amountUsdt: 19 }]], only);
    const after = fingerprint(disk.get(INVENTORY), disk.get(WALLET));
    assert.deepEqual(after.balances, [10168.5, 10105.5, 63], only);
    assert.deepEqual([after.txSum, after.soldSum, after.valueSum, after.count], [+(before.txSum + 19).toFixed(2), +(before.soldSum + 19).toFixed(2), before.valueSum, before.count], only);
    assert.deepEqual(after.statuses, before.statuses.map((status: string, i: number) => (i === 1 ? "SOLD" : status)), only);
    for (const key of ["ids", "itemIds", "sources", "ratios", "seeds", "nonces", "rolls", "tables", "upgrades", "shipping", "openings"]) assert.deepEqual(after[key], before[key], only + " " + key);
    assert.deepEqual(after.txIds.slice(1), before.txIds, only);
    const again = await settleTakeMany([target]);
    assert.deepEqual([again.taken.length, again.already.length], [0, 1], only);
    assert.deepEqual(fingerprint(disk.get(INVENTORY), disk.get(WALLET)).balances, [10168.5, 10105.5, 63], only);
  }
});

test("깨진 JSON, 모르는 형식 번호, 잘린 줄인 글: 옮기는 일은 그 글을 건드리지 않고, 받기는 아무것도 실행하지 않는다", async () => {
  const cases: { broken: string; seals: boolean }[] = [
    { broken: "{not json", seals: false },
    { broken: '{"state":{"items":[{"id":"own_x","status":"IN_STORAGE"', seals: false },
    { broken: '{"state":{"items":{"z":99,"s":[],"future":true}},"version":0}', seals: true },
    { broken: '{"state":{"items":{"z":1,"s":["own_x"],"t":[],"c":[[]],"r":[[0,0', seals: true },
  ];
  for (const { broken, seals } of cases) {
    await reset();
    const { wallet } = realisticLedger(3);
    disk.set(INVENTORY, broken); disk.set(WALLET, old(wallet, 4));
    const before = fingerprint(null, disk.get(WALLET));
    // 지갑은 읽을 수 있으므로 옮겨진다. 깨진 보관함은 한 글자도 바뀌지 않는다
    assert.deepEqual(cs.compactStoredLedgers(storage), [WALLET], broken);
    assert.equal(disk.get(INVENTORY), broken);
    assert.deepEqual(fingerprint(null, disk.get(WALLET)), before, broken);
    const walletText = disk.get(WALLET);
    const out = await settleTakeMany(["own_x"]);
    assert.deepEqual([out.status, out.taken.length, out.amountUsdt], ["unknown", 0, 0], broken);
    assert.equal(disk.get(INVENTORY), broken);
    assert.equal(disk.get(WALLET), walletText);
    // 줄인 형식으로 시작하는 글은 풀지 못해도 덮어쓰지 않는다. 옛 형식 자리의 깨진 글은 전과 같이 다룬다(막지 않는다)
    assert.equal(cs.isLedgerSealed(INVENTORY), seals, broken);
    if (seals) {
      useInventoryStore.setState({ items: [] });
      assert.equal(disk.get(INVENTORY), broken);
      await assert.rejects(createOpeningPurchase(products.BOXES[0], 1)(), (error: unknown) => error instanceof LedgerUnavailable);
      assert.equal(disk.get(WALLET), walletText);
    }
    await unseal();
  }
});

test("확인 대기 표시(받기, 업그레이드)가 남은 계정의 장부는 옮기지 않는다. 표시가 풀린 뒤에 옮긴다", async () => {
  await reset(1000);
  // 표시의 저장 키는 lib/takeBatch 와 lib/upgradeMarks 가 정한다. 여기서 보는 앞말이 그 파일들의 것과 같은지 먼저 확인한다
  assert.ok(readFileSync(new URL("../lib/takeBatch.ts", import.meta.url), "utf8").includes('"voila.take-unconfirmed." + ledgerKey()'));
  const upgradeMarks = new URL("../lib/upgradeMarks.ts", import.meta.url);
  if (existsSync(upgradeMarks)) assert.ok(readFileSync(upgradeMarks, "utf8").includes('"voila.upgrade-unconfirmed."'));

  // 실제 받기가 남긴 표시: 지갑에 넣는 쓰기가 조용히 빠져, 상품은 받은 상태인데 입금이 없다(알 수 없음)
  const physical = products.BOXES.flatMap((b) => b.items.map((item) => ({ item, box: b }))).find((x) => x.item.kind === "physical")!;
  const [id] = useInventoryStore.getState().add([{ itemId: physical.item.id, boxSlug: physical.box.slug, valueUsdt: 100, tier: "royal" as const, fair: { serverSeed: "s", serverSeedHash: "h", clientSeed: "c", nonce: 1, roll: 1 } }]).map((item) => item.id);
  onWrite = (name, value) => name === WALLET && (cs.parseLedger<Loose>(value)?.state.cryptoBalance ?? 0) > 1000;
  const out = await settleTakeMany([id]);
  onWrite = null; refused.length = 0;
  assert.equal(out.status, "unknown");
  const takeMark = "voila.take-unconfirmed." + WALLET;
  assert.ok(disk.has(takeMark), "받기의 표시가 남아 있다");

  // 그 계정의 장부가 옛 형식으로 남아 있다고 하자. 표시가 없는 다른 계정의 장부도 함께 있다
  const mine = { items: cs.readLedger<Loose>(INVENTORY)!.state.items, wallet: cs.readLedger<Loose>(WALLET)!.state };
  const other = realisticLedger(4);
  disk.set(INVENTORY, old({ items: [...mine.items, ...realisticLedger(5).items] })); disk.set(WALLET, old({ ...mine.wallet, transactions: realisticLedger(5).wallet.transactions }, 4));
  disk.set("voila.browser-inventory.browser_other", old({ items: other.items })); disk.set("voila.browser-wallet.browser_other", old(other.wallet, 4));
  const texts = { inventory: disk.get(INVENTORY), wallet: disk.get(WALLET) };
  const before = fingerprint(texts.inventory, texts.wallet);
  assert.deepEqual(cs.compactStoredLedgers(storage), ["voila.browser-inventory.browser_other", "voila.browser-wallet.browser_other"]);
  assert.deepEqual([disk.get(INVENTORY), disk.get(WALLET)], [texts.inventory, texts.wallet], "표시가 남은 계정의 장부는 한 글자도 바뀌지 않았다");
  assert.deepEqual(fingerprint(disk.get("voila.browser-inventory.browser_other"), disk.get("voila.browser-wallet.browser_other")), fingerprint(old({ items: other.items }), old(other.wallet, 4)));

  // 받기의 표시가 풀리고 업그레이드의 표시가 남아 있어도 옮기지 않는다
  disk.delete(takeMark);
  const upgradeMark = "voila.upgrade-unconfirmed." + WALLET;
  disk.set(upgradeMark, JSON.stringify([{ id: "up_" + uuid(1), stake: id, target: "own_up_" + uuid(1) }]));
  assert.deepEqual(cs.compactStoredLedgers(storage), []);
  assert.deepEqual([disk.get(INVENTORY), disk.get(WALLET)], [texts.inventory, texts.wallet]);
  // 잠금을 거치는 길도 같은 기준이다
  assert.deepEqual(await cs.migrateStoredLedgers(storage, { request: async (_name, work) => work() }), []);
  assert.deepEqual([disk.get(INVENTORY), disk.get(WALLET)], [texts.inventory, texts.wallet]);

  // 표시가 다 풀리면 옮긴다. 값은 그대로다
  disk.delete(upgradeMark);
  assert.deepEqual(cs.compactStoredLedgers(storage).sort(), [INVENTORY, WALLET].sort());
  assert.ok(isCompact(disk.get(INVENTORY)) && isCompact(disk.get(WALLET)));
  assert.deepEqual(fingerprint(disk.get(INVENTORY), disk.get(WALLET)), before);
});

test("옮기는 사이에 다른 탭이 적으면: 읽은 뒤에 값이 바뀐 장부는 적지 않고, 다른 장부를 옮기는 동안 적힌 값을 옛 사본으로 덮지 않는다", async () => {
  await reset();
  const first = realisticLedger(6);
  const key = "voila.browser-inventory.browser_me"; const walletKey = "voila.browser-wallet.browser_me";
  // 다른 탭이 그 사이에 적는 값: 개봉 한 건이 더 들어 있다(옛 형식으로 적는 옛 빌드의 탭이라고 하자)
  const opened = { ...first.items[1], id: "own_" + uuid(999001), openingId: "op_" + uuid(999002), acquiredAt: iso(30), fair: { ...first.items[1].fair, nonce: 777, roll: 424242 } };
  const newer = old({ items: [opened, ...first.items] });
  const newerWallet = old({ ...first.wallet, balance: 10094.5, cryptoBalance: 10031.5, transactions: [{ id: "tx_" + uuid(999003), type: "open", amountUsdt: -55, at: iso(30), ref: "box-ax1:op_" + uuid(999002), rolloverUsdt: 55 }, ...first.wallet.transactions] }, 4);

  // 1. 한 장부 안에서: 처음 읽은 뒤, 적기 직전의 다시 읽기 사이에 값이 바뀐다
  disk.set(key, old({ items: first.items }));
  let reads = 0;
  onRead = (name) => { if (name === key && ++reads === 2) disk.set(key, newer); };
  assert.equal(cs.compactStoredLedger(storage, key), false);
  onRead = null;
  assert.equal(disk.get(key), newer, "다른 탭이 적은 값이 그대로 남는다");
  assert.equal(reads, 2, "적지 않았으므로 적은 뒤의 확인 읽기도 없다");
  // 다음 차례에는 새 값을 읽어서 옮긴다
  assert.equal(cs.compactStoredLedger(storage, key), true);
  assert.deepEqual(fingerprint(disk.get(key), null), fingerprint(newer, null));
  assert.equal(fingerprint(disk.get(key), null).count, first.items.length + 1);

  // 2. 여러 장부를 한꺼번에: 보관함을 옮기는 동안 다른 탭이 지갑에 적는다. 지갑은 그때 다시 읽으므로 새 값이 남는다
  await reset();
  disk.set(key, old({ items: first.items })); disk.set(walletKey, old(first.wallet, 4));
  assert.ok(disk.get(key)!.length > disk.get(walletKey)!.length, "보관함이 더 길어 먼저 옮긴다");
  onWrite = (name) => { if (name === key) disk.set(walletKey, newerWallet); };
  assert.deepEqual(cs.compactStoredLedgers(storage), [key, walletKey]);
  onWrite = null;
  assert.deepEqual(fingerprint(null, disk.get(walletKey)), fingerprint(null, newerWallet));
  assert.deepEqual(fingerprint(null, disk.get(walletKey)).balances, [10094.5, 10031.5, 63]);
  assert.equal(fingerprint(null, disk.get(walletKey)).txIds[0], "tx_" + uuid(999003));
  assert.deepEqual(fingerprint(disk.get(key), null), fingerprint(old({ items: first.items }), null));
});

test("옮기는 일은 그 계정의 장부 잠금 안에서 한다: 잠금을 얻기 전에는 적지 않고, 얻은 뒤에 그때의 값을 읽어 옮긴다", async () => {
  await reset();
  const first = realisticLedger(7);
  const key = "voila.browser-inventory.browser_me"; const walletKey = "voila.browser-wallet.browser_me";
  const opened = { ...first.items[1], id: "own_" + uuid(999011), openingId: "op_" + uuid(999012), acquiredAt: iso(30), fair: { ...first.items[1].fair, nonce: 778, roll: 31337 } };
  const newer = old({ items: [opened, ...first.items] });
  disk.set(key, old({ items: first.items })); disk.set(walletKey, old(first.wallet, 4));
  disk.set("gachaflix.inventory", old({ items: realisticLedger(8).items }));
  const start = { inventory: disk.get(key), wallet: disk.get(walletKey), legacy: disk.get("gachaflix.inventory") };
  const events: string[] = [];
  let release: () => void = () => undefined;
  const held = new Promise<void>((resolve) => { release = resolve; });
  // 다른 탭이 그 계정의 장부 잠금을 쥐고 개봉을 적는 중이다. 풀릴 때까지 이 탭의 옮기는 일은 기다린다
  const locks = { request: async (name: string, work: () => unknown) => {
    events.push("request " + name);
    // 실제 잠금은 언제나 나중에 주어진다(부른 자리에서 바로 실행되지 않는다)
    await Promise.resolve();
    if (name === "voila-ledger:voila.browser-wallet.browser_me") await held;
    events.push("granted " + name);
    return work();
  } };
  const job = cs.migrateStoredLedgers(storage, locks);
  assert.deepEqual([disk.get(key), disk.get(walletKey), disk.get("gachaflix.inventory")], [start.inventory, start.wallet, start.legacy], "예약만 했다. 아직 아무것도 적지 않았다");
  await new Promise((resolve) => setTimeout(resolve, 5));
  // 잠금이 비어 있던 장부만 옮겨졌다
  assert.ok(isCompact(disk.get("gachaflix.inventory")));
  assert.deepEqual([disk.get(key), disk.get(walletKey)], [start.inventory, start.wallet]);
  // 다른 탭이 개봉을 적고 잠금을 푼다
  disk.set(key, newer);
  release();
  assert.deepEqual((await job).sort(), ["gachaflix.inventory", key, walletKey].sort());
  // 보관함과 지갑은 그 계정의 지갑 저장 키에 묶인 같은 잠금을 쓴다(lib/ledgerLock 의 잠금과 같은 이름)
  assert.deepEqual(events.filter((e) => e.startsWith("request")).sort(), ["request voila-ledger:gachaflix.wallet", "request voila-ledger:gachaflix.wallet", "request voila-ledger:voila.browser-wallet.browser_me", "request voila-ledger:voila.browser-wallet.browser_me"]);
  assert.equal(cs.ledgerLockName(WALLET), "voila-ledger:" + WALLET);
  assert.deepEqual(fingerprint(disk.get(key), disk.get(walletKey)), fingerprint(newer, start.wallet));
  assert.equal(fingerprint(disk.get(key), null).ids[0], opened.id);
  // 잠금이 없는 브라우저에서는 바로 옮긴다
  disk.set(key, newer);
  assert.deepEqual(await cs.migrateStoredLedgers(storage, undefined), [key]);
});
