/**
 * 배포본(4c8942f)과 후보(HEAD)의 장부 모듈을 같은 입력으로 돌려 결과를 견주는 차등 검사.
 * 실행:  cd <web 루트> && WEB_ROOT=<web 루트> SEED=1 OPS=3000 npx tsx <이 파일> > out.json
 * 두 루트의 out.json 을 compare 로 견준다(flow/review-restore/ledger-compare.mjs).
 *
 * 결정적으로 만든 것: Date(1초씩 늘어나는 시계), crypto.randomUUID 와 getRandomValues(씨앗 난수), 저장소(메모리 Map).
 * 바꾸지 않은 것: crypto.subtle(HMAC 은 순수 함수).
 * 업그레이드는 원본에 없으니 이 스크립트는 부르지 않는다(ledger-upgrade.ts 가 따로 본다).
 */
import { pathToFileURL } from "node:url";
import path from "node:path";

const ROOT = process.env.WEB_ROOT!;
const SEED = Number(process.env.SEED ?? 1);
const OPS = Number(process.env.OPS ?? 3000);

// ── 결정적 환경 ────────────────────────────────────────────────────────────────
let rngState = SEED >>> 0 || 1;
const rnd = (): number => { rngState ^= rngState << 13; rngState >>>= 0; rngState ^= rngState >>> 17; rngState ^= rngState << 5; rngState >>>= 0; return rngState / 4294967296; };
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)];
const intIn = (a: number, b: number): number => a + Math.floor(rnd() * (b - a + 1));

let clock = Date.UTC(2026, 9, 13, 0, 0, 0);
const RealDate = Date;
class FakeDate extends RealDate {
  constructor(...args: unknown[]) {
    if (args.length === 0) { clock += 1000; super(clock); } else { super(...(args as [number])); }
  }
  static now(): number { clock += 1000; return clock; }
}
(globalThis as unknown as { Date: unknown }).Date = FakeDate;

const realCrypto = globalThis.crypto;
let uuidSeq = 0;
const hex = (n: number): string => Array.from({ length: n }, () => Math.floor(rnd() * 16).toString(16)).join("");
const fakeCrypto = {
  subtle: realCrypto.subtle,
  randomUUID: () => { uuidSeq++; const h = hex(32); return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`; },
  getRandomValues: (buf: Uint8Array) => { for (let i = 0; i < buf.length; i++) buf[i] = Math.floor(rnd() * 256); return buf; },
};
Object.defineProperty(globalThis, "crypto", { value: fakeCrypto, configurable: true });

const disk = new Map<string, string>();
const storage = {
  get length() { return disk.size; },
  key: (i: number) => Array.from(disk.keys())[i] ?? null,
  getItem: (k: string) => disk.get(k) ?? null,
  setItem: (k: string, v: string) => { disk.set(k, String(v)); },
  removeItem: (k: string) => { disk.delete(k); },
  clear: () => disk.clear(),
};
Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });

const mod = async <T = any>(rel: string): Promise<T> => import(pathToFileURL(path.join(ROOT, rel)).href) as Promise<T>;

async function main() {
  const { useWalletStore } = await mod("stores/walletStore.ts");
  const { useInventoryStore } = await mod("stores/inventoryStore.ts");
  const { useFairStore } = await mod("stores/fairStore.ts");
  const { createOpeningPurchase, InsufficientOpeningBalance } = await mod("lib/opening.ts");
  const { settleTakeMany } = await mod("lib/takeBatch.ts");
  const { settleTake } = await mod("lib/openingSettle.ts");
  const { cancelShipment } = await mod("lib/claim.ts");
  const products = await mod("lib/products.ts");
  const { hashServerSeed } = await mod("lib/fairness.ts");
  const HOME_BOXES = products.HOME_BOXES as { slug: string; price: number; items: unknown[] }[];
  const WELCOME = products.WELCOME_BOX_SLUG as string;

  const SERVER = "diff-server-seed-" + SEED; const CLIENT = "diff-client-" + SEED;
  useFairStore.setState({ serverSeed: SERVER, serverSeedHash: await hashServerSeed(SERVER), clientSeed: CLIENT, nonce: 0 });
  useWalletStore.setState({ cryptoBalance: 0, cardBalance: 0, balance: 0, transactions: [] });
  useInventoryStore.setState({ items: [] });

  const trace: unknown[] = [];
  const snap = (op: string, extra: unknown = null) => {
    const w = useWalletStore.getState(); const inv = useInventoryStore.getState().items as { status: string }[];
    const counts: Record<string, number> = {};
    for (const it of inv) counts[it.status] = (counts[it.status] ?? 0) + 1;
    trace.push({ op, extra, balance: w.balance, crypto: w.cryptoBalance, card: w.cardBalance, tx: w.transactions.length, last: w.transactions[0]?.id ?? null, lastAmt: w.transactions[0]?.amountUsdt ?? null, inv: counts, nonce: useFairStore.getState().nonce, dep: w.totalDeposited, wag: w.totalWagered, free: w.freeOpens });
  };

  const deposit = (kind: "crypto" | "card") => {
    const w = useWalletStore.getState();
    const amount = pick([20, 50, 100, 250, 500, 1000]);
    if (kind === "crypto") {
      const ref = `TRC20:0x${hex(16)}`;
      const pending = w.addTransaction({ type: "deposit_usdt", accountId: "acct", address: "T" + hex(16), amountUsdt: amount, ref, network: "TRC20", status: "PENDING" });
      const ok = w.settleDeposit(pending.id, { amountUsdt: amount, reference: ref, txHash: ref.slice(6) });
      snap("deposit_usdt", { amount, ok });
    } else {
      const ref = `visa:${hex(8)}`;
      const pending = w.addTransaction({ type: "deposit_card", accountId: "acct", amountUsdt: amount, ref, network: "visa", status: "PENDING" });
      const ok = w.settleDeposit(pending.id, { amountUsdt: amount, reference: ref, receipt: "r" + hex(6) });
      snap("deposit_card", { amount, ok });
    }
  };

  const openBox = async () => {
    const box = pick(HOME_BOXES);
    const count = rnd() < 0.6 ? 1 : intIn(2, 10);
    const openingId = "op_" + fakeCrypto.randomUUID();
    try {
      const results = await createOpeningPurchase(box, count, openingId)();
      snap("open", { box: box.slug, count, items: results.map((r: { item: { id: string }; roll: number; nonce: number; ownedId: string; settled: boolean }) => [r.item.id, r.roll, r.nonce, r.ownedId, r.settled]) });
    } catch (e) {
      snap("open_fail", { box: box.slug, count, err: e instanceof InsufficientOpeningBalance ? "insufficient" : String((e as Error).message) });
    }
  };

  const held = () => (useInventoryStore.getState().items as { id: string; status: string }[]).filter((i) => i.status === "IN_STORAGE");

  const takeOne = async () => {
    const h = held(); if (!h.length) return snap("take1_none");
    const id = pick(h).id;
    const out = await settleTake(id);
    snap("take1", { id, out });
  };
  const takeMany = async () => {
    const h = held(); if (!h.length) return snap("takeN_none");
    const n = intIn(1, Math.min(8, h.length));
    const ids = Array.from(new Set(Array.from({ length: n }, () => pick(h).id)));
    const out = await settleTakeMany(ids);
    snap("takeN", { ids, out });
  };
  const takeAgain = async () => {
    // 이미 받은 상품을 다시 받으려 한다(두 번 지급되면 안 된다)
    const sold = (useInventoryStore.getState().items as { id: string; status: string }[]).filter((i) => i.status === "SOLD");
    if (!sold.length) return snap("takeAgain_none");
    const id = pick(sold).id;
    const out = await settleTakeMany([id]);
    snap("takeAgain", { id, out });
  };

  const withdrawals: string[] = [];
  const withdraw = () => {
    const w = useWalletStore.getState();
    const amount = pick([20, 25.5, 40, 100, 10_000]);
    const status = pick(["PENDING", "PENDING_72H_HOLD", "PENDING_ADMIN_REVIEW", "CANCELLED"]) as string;
    const tx = w.recordWithdrawal({ type: "withdraw", accountId: "acct", serverId: "wd_" + hex(8), amountUsdt: -amount, status, feeUsdt: 1, netUsdt: amount - 1, network: "TRC20", address: "T" + hex(16) });
    withdrawals.push(tx.id);
    snap("withdraw", { amount, status, id: tx.id, amt: tx.amountUsdt, req: tx.requestedUsdt ?? null });
  };
  const withdrawDup = () => {
    const w = useWalletStore.getState();
    const prev = w.transactions.find((t: { type: string; serverId?: string }) => t.type === "withdraw" && t.serverId);
    if (!prev) return snap("withdrawDup_none");
    const tx = w.recordWithdrawal({ type: "withdraw", accountId: "acct", serverId: prev.serverId, amountUsdt: -50, status: "PENDING", network: "TRC20", address: "T0" });
    snap("withdrawDup", { same: tx.id === prev.id });
  };
  const withdrawSync = () => {
    if (!withdrawals.length) return snap("wsync_none");
    const id = pick(withdrawals);
    const w = useWalletStore.getState();
    const action = pick(["cancelHeld", "syncCancel", "syncFail", "syncBroadcast", "syncComplete", "closeUnknown", "setStatus"]);
    let r: unknown = null;
    if (action === "cancelHeld") r = w.cancelHeldWithdrawal(id);
    else if (action === "syncCancel") w.syncWithdrawal(id, "CANCELLED");
    else if (action === "syncFail") w.syncWithdrawal(id, "FAILED");
    else if (action === "syncBroadcast") w.syncWithdrawal(id, "BROADCASTING", { txHash: "0x" + hex(8) });
    else if (action === "syncComplete") w.syncWithdrawal(id, "COMPLETED", { txHash: "0x" + hex(8) });
    else if (action === "closeUnknown") r = w.closeUnknownWithdrawal(id);
    else w.setTransactionStatus(id, "BROADCASTING", { txHash: "0x" + hex(8) });
    snap("wsync", { id, action, r });
  };

  const ship = () => {
    const h = held(); if (!h.length) return snap("ship_none");
    const ids = Array.from(new Set(Array.from({ length: intIn(1, 3) }, () => pick(h).id)));
    const fee = pick([0, 5, 12.5, 30]);
    const w = useWalletStore.getState();
    const split = fee > 0 ? w.debitSplit(fee) : { ratio: { crypto: 1, card: 0 } };
    if (!split) return snap("ship_insufficient", { fee });
    useInventoryStore.getState().requestShipping(ids, { name: "n", phone: "p", line1: "a", city: "c", postalCode: "0", country: "KR" }, fee, split.ratio);
    if (fee > 0) w.addTransaction({ type: "open", amountUsdt: -fee, ref: "shipping:" + ids.join(","), rolloverUsdt: 0 });
    snap("ship", { ids, fee });
  };
  const shipCancel = async () => {
    const req = (useInventoryStore.getState().items as { id: string; status: string }[]).filter((i) => i.status === "SHIPPING_REQUESTED");
    if (!req.length) return snap("shipCancel_none");
    const item = pick(req);
    try { await cancelShipment(item); snap("shipCancel", { id: item.id, ok: true }); }
    catch (e) { snap("shipCancel", { id: item.id, err: (e as Error).message }); }
  };
  const shipMark = () => {
    const req = (useInventoryStore.getState().items as { id: string; status: string }[]).filter((i) => i.status === "SHIPPING_REQUESTED");
    if (!req.length) return snap("shipMark_none");
    const item = pick(req);
    useInventoryStore.getState().markShipping(item.id, "cj", "T" + hex(6));
    snap("shipMark", { id: item.id });
  };
  const clientSeedChange = () => { useFairStore.getState().setClientSeed("client-" + hex(6)); snap("clientSeed"); };
  const freeOpen = async () => {
    const box = HOME_BOXES.find((b) => b.slug === WELCOME)!;
    const before = useWalletStore.getState().freeOpens?.[WELCOME] ?? 0;
    try { const results = await createOpeningPurchase(box, intIn(1, 3), "op_" + fakeCrypto.randomUUID())(); snap("freeOpen", { before, n: results.length, free: results.length }); }
    catch (e) { snap("freeOpen_fail", { before, err: (e as Error).message }); }
  };

  // 시작: 가입 혜택의 무료 개봉, 첫 충전
  useWalletStore.getState().claimWelcomeBoxes(); snap("welcome");
  await freeOpen(); await freeOpen();
  deposit("crypto"); deposit("card");

  const weights: [number, () => unknown | Promise<unknown>][] = [
    [8, () => deposit(rnd() < 0.6 ? "crypto" : "card")], [30, openBox], [12, takeOne], [10, takeMany], [3, takeAgain],
    [5, withdraw], [1, withdrawDup], [6, withdrawSync], [5, ship], [4, shipCancel], [2, shipMark], [process.env.NO_CLIENT_SEED ? 0 : 2, clientSeedChange], [1, freeOpen],
  ];
  const total = weights.reduce((s, [w]) => s + w, 0);
  for (let i = 0; i < OPS; i++) {
    let r = rnd() * total;
    for (const [w, fn] of weights) { r -= w; if (r <= 0) { await fn(); break; } }
  }

  const w = useWalletStore.getState();
  const items = useInventoryStore.getState().items;
  const out = {
    root: ROOT, seed: SEED, ops: OPS,
    final: { balance: w.balance, crypto: w.cryptoBalance, card: w.cardBalance, totalDeposited: w.totalDeposited, totalWagered: w.totalWagered, nonce: useFairStore.getState().nonce, freeOpens: w.freeOpens, burst: w.burst },
    transactions: w.transactions,
    items,
    marks: Object.fromEntries(Array.from(disk.entries()).filter(([k]) => k.includes("unconfirmed"))),
    storedBytes: Object.fromEntries(Array.from(disk.entries()).map(([k, v]) => [k, v.length])),
    trace,
  };
  process.stdout.write(JSON.stringify(out));
}

main().catch((e) => { console.error(e); process.exit(1); });
