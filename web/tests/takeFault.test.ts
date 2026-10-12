// USDT로 받기: 저장이 중간에 실패했을 때의 정직한 판정(flow/MELT_SPEC.md R8, flow/REVIEW_codex-1.md 2-2, flow/REVIEW_codex-2.md 4절과 5.2)
//   보관함과 지갑은 저장 키가 둘이라 한 번에 확정되지 않는다. 받기를 실행한 뒤 저장된 장부를 직접 다시 읽어 판정한다.
//     받았다        상품이 받은 상태이고 그 상품의 입금 내역이 있다
//     받지 못했다  상품이 보관 중이고, 입금 내역이 없고, 저장된 잔액도 늘지 않았다
//     알 수 없다    그 밖 전부(잔액만 늘었다, 다시 읽지 못했다 등). 스스로 다시 지급하지 않고, 다음에 불러도 다시 지급하지 않는다
//   이 파일은 실제 스토어에 기억 속 저장소를 붙이고, 장부 쓰기와 읽기를 골라 실패시킨다(파일과 브라우저 저장소는 건드리지 않는다).
//   쓰기 하나만 실패하는 경우, 둘이 겹치는 경우, 저장 한도 하나 때문에 큰 쓰기만 빠지는 경우, 다시 읽기가 실패하는 경우를 본다.
//   npm test
import test, { before } from "node:test";
import assert from "node:assert/strict";
import type { Transaction } from "../stores/walletStore";

// 저장소: 기억 속 지도.
//   fault      걸린 쓰기만 던지거나(throw) 조용히 버린다(ignore, 이 사이트의 저장소 래퍼가 한도 초과에서 하는 일). 여럿을 함께 걸 수 있다
//   limit      저장된 글자 수의 합이 이 값을 넘는 쓰기는 조용히 버린다(저장 한도 하나)
//   readFault  참이 되는 읽기는 던진다
type Fault = { key: string; mode: "throw" | "ignore"; when: (value: string) => boolean };
const disk = new Map<string, string>();
let fault: Fault | Fault[] | null = null;
let limit = Infinity;
let readFault: ((name: string) => boolean) | null = null;
/** 참이 되는 지우기는 조용히 버린다(확인 대기 표시가 지워지지 않는 경우) */
let removeFault: ((name: string) => boolean) | null = null;
const dropped: string[] = [];
const sizeWith = (name: string, value: string) => Array.from(disk).reduce((n, [key, text]) => n + (key === name ? 0 : text.length), 0) + value.length;
const storage = {
  getItem: (name: string) => { if (readFault?.(name)) throw new Error("storage read failed (injected)"); return disk.get(name) ?? null; },
  setItem: (name: string, value: string) => {
    for (const f of fault ? (Array.isArray(fault) ? fault : [fault]) : []) {
      if (name === f.key && f.when(value)) { if (f.mode === "throw") throw new Error("QuotaExceededError (injected)"); dropped.push(name); return; }
    }
    if (sizeWith(name, value) > limit) { dropped.push(name); return; }
    disk.set(name, value);
  },
  removeItem: (name: string) => { if (removeFault?.(name)) { dropped.push(name); return; } disk.delete(name); },
};

// 스토어는 만들어질 때 저장소를 잡는다. 그래서 저장소를 먼저 놓고 그 뒤에 모듈을 불러온다
let settleTake: typeof import("../lib/openingSettle").settleTake;
let settleTakeMany: typeof import("../lib/takeBatch").settleTakeMany;
let useInventoryStore: typeof import("../stores/inventoryStore").useInventoryStore;
let useWalletStore: typeof import("../stores/walletStore").useWalletStore;
let take: typeof import("../lib/takeBatch");
let physical: { item: { id: string }; box: { slug: string } };
let INVENTORY = ""; let WALLET = ""; let MARKS = "";
before(async () => {
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
  ({ useInventoryStore } = await import("../stores/inventoryStore"));
  ({ useWalletStore } = await import("../stores/walletStore"));
  ({ settleTake } = await import("../lib/openingSettle"));
  take = await import("../lib/takeBatch");
  ({ settleTakeMany } = take);
  const { BOXES } = await import("../lib/products");
  physical = BOXES.flatMap((box) => box.items.map((item) => ({ item, box }))).find((x) => x.item.kind === "physical")!;
  INVENTORY = useInventoryStore.persist.getOptions().name!;
  WALLET = useWalletStore.persist.getOptions().name!;
  // 확인 대기 표시의 저장 키(lib/takeBatch): 계정의 지갑 저장 키에 묶인다
  MARKS = "voila.take-unconfirmed." + WALLET;
});

const saved = <T,>(name: string): T => JSON.parse(disk.get(name) ?? "{}").state as T;
const savedItem = (id: string) => saved<{ items: { id: string; status: string; soldForUsdt?: number }[] }>(INVENTORY).items.find((item) => item.id === id);
const savedWallet = () => saved<{ balance: number; cryptoBalance: number; cardBalance: number; transactions: Transaction[] }>(WALLET);
const savedSellbacks = () => savedWallet().transactions.filter((tx) => tx.type === "sellback");
const hasSold = (value: string) => value.includes('"status":"SOLD"');
const hasCredit = (value: string) => JSON.parse(value).state.cryptoBalance > 0;
const hasSellback = (value: string) => value.includes('"type":"sellback"');

/** 참고가 100, USDT 출처, 잔액 0 을 정상으로 저장한 뒤 시작한다 */
function seed(count = 1): string[] {
  fault = null; limit = Infinity; readFault = null; removeFault = null; dropped.length = 0;
  // 확인 대기 표시도 비운다(앞 테스트가 남긴 것)
  for (const key of Array.from(disk.keys())) if (key.startsWith("voila.take-unconfirmed.")) disk.delete(key);
  useWalletStore.setState({ cryptoBalance: 0, cardBalance: 0, balance: 0, transactions: [] });
  useInventoryStore.setState({ items: [] });
  const ids = Array.from({ length: count }, () => useInventoryStore.getState().add([{ itemId: physical.item.id, boxSlug: physical.box.slug, valueUsdt: 100, tier: "royal", fair: { serverSeed: "s", serverSeedHash: "h", clientSeed: "c", nonce: 0, roll: 0 } }])[0].id);
  if (ids.length) assert.equal(savedItem(ids[0])?.status, "IN_STORAGE");
  assert.equal(savedWallet().balance, 0);
  return ids;
}
/** 실패 주입을 걷고, 새 탭처럼 저장된 장부를 다시 읽는다 */
async function recover(): Promise<void> {
  fault = null; limit = Infinity; readFault = null; removeFault = null;
  await Promise.all([useWalletStore.persist.rehydrate(), useInventoryStore.persist.rehydrate()]);
}

test("정상 저장: 받았다고 답하고, 받기 거래 기록에 상품 id 가 남는다", async () => {
  const [a, b] = seed(2);
  const out = await settleTakeMany([a, b]);
  assert.equal(out.status, "settled");
  assert.deepEqual(out.taken.map((x) => x.id).sort(), [a, b].sort());
  assert.ok(out.taken.every((x) => x.amountUsdt === 95));
  assert.deepEqual(out.unknown, []);
  assert.equal(out.amountUsdt, 190);
  assert.equal(savedItem(a)?.status, "SOLD");
  assert.equal(savedItem(b)?.status, "SOLD");
  assert.equal(savedWallet().cryptoBalance, 190);
  assert.equal(savedSellbacks().length, 1);
  assert.deepEqual([...(savedSellbacks()[0].itemIds ?? [])].sort(), [a, b].sort());
  // 금액은 움직이지 않는 기록 칸이다: 거래 금액과 잔액은 그대로 상품마다 95
  assert.equal(savedSellbacks()[0].amountUsdt, 190);

  await recover();
  const again = await settleTakeMany([a, b]);
  assert.equal(again.status, "settled");
  assert.equal(again.taken.length, 0);
  assert.equal(again.already.length, 2);
  assert.equal(savedWallet().cryptoBalance, 190);
});

test("상품을 받은 상태로 저장할 때 실패: 받지 못했다고 답하고, 그 말이 사실이다(상품은 보관 중, 입금 없음). 다시 시도하면 한 번만 받는다", async () => {
  const [id] = seed();
  fault = { key: INVENTORY, mode: "throw", when: hasSold };
  const out = await settleTakeMany([id]);
  assert.equal(out.status, "failed");
  assert.deepEqual(out.taken, []);
  assert.deepEqual(out.unknown, []);
  assert.deepEqual(out.left, [id]);
  assert.equal(out.amountUsdt, 0);
  // "상품은 보관함에 있습니다"가 사실이다: 저장된 장부도, 화면이 보는 기억 속 장부도 보관 중이다
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
  assert.equal(useInventoryStore.getState().items.find((item) => item.id === id)?.status, "IN_STORAGE");
  assert.equal(savedWallet().balance, 0);
  assert.equal(useWalletStore.getState().balance, 0);
  assert.equal(savedSellbacks().length, 0);
  // 한 개 받기도 같은 판정이다
  assert.deepEqual(await settleTake(id), { status: "failed" });

  await recover();
  const retry = await settleTakeMany([id]);
  assert.equal(retry.status, "settled");
  assert.deepEqual(retry.taken, [{ id, amountUsdt: 95 }]);
  assert.equal(savedWallet().cryptoBalance, 95);
  assert.equal(savedSellbacks().length, 1);
  assert.deepEqual(await settleTake(id), { status: "settled", amountUsdt: 95, already: true });
  assert.equal(savedWallet().cryptoBalance, 95);
});

test("지갑에 넣을 때 실패: 받았다고도, 보관함에 있다고도 답하지 않는다(알 수 없음). 입금 없는 받은 상품을 이미 받았다고 하지 않는다", async () => {
  const [id] = seed();
  fault = { key: WALLET, mode: "throw", when: hasCredit };
  const out = await settleTakeMany([id]);
  assert.equal(out.status, "unknown");
  assert.deepEqual(out.unknown, [id]);
  assert.deepEqual(out.taken, []);
  assert.deepEqual(out.already, []);
  // 상품은 이미 받은 상태로 저장됐다. "상품은 보관함에 있습니다"라고 답하면 거짓이다
  assert.deepEqual(out.left, []);
  assert.equal(out.amountUsdt, 0);
  assert.equal(savedItem(id)?.status, "SOLD");
  assert.equal(savedWallet().balance, 0);
  // 기억 속 잔액도 저장된 값으로 돌아왔다(저장되지 않은 95 를 화면에 남기지 않는다)
  assert.equal(useWalletStore.getState().balance, 0);
  assert.equal(savedSellbacks().length, 0);

  await recover();
  for (const retry of [await settleTakeMany([id]), await settleTakeMany([id, id])]) {
    assert.equal(retry.status, "unknown");
    assert.deepEqual(retry.already, []);
    assert.deepEqual(retry.taken, []);
    assert.deepEqual(retry.left, []);
  }
  assert.deepEqual(await settleTake(id), { status: "unknown" });
  // 스스로 다시 지급하지 않는다
  assert.equal(savedWallet().balance, 0);
  assert.equal(savedSellbacks().length, 0);
});

test("받은 상태 저장이 조용히 무시됨: 다시 불러도 두 번 지급하지 않는다(보관 중인데 입금 내역이 있으면 건드리지 않는다)", async () => {
  const [id] = seed();
  fault = { key: INVENTORY, mode: "ignore", when: hasSold };
  const out = await settleTakeMany([id]);
  // 지갑에는 들어갔지만 상품은 보관 중으로 남았다. 받았다고도 받지 못했다고도 하지 않는다
  assert.equal(out.status, "unknown");
  assert.deepEqual(out.unknown, [id]);
  assert.deepEqual(out.taken, []);
  assert.deepEqual(out.left, []);
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
  assert.equal(savedWallet().cryptoBalance, 95);
  assert.equal(savedSellbacks().length, 1);
  assert.deepEqual(savedSellbacks()[0].itemIds, [id]);

  // 실패 주입이 남아 있든 걷혔든, 같은 상품을 다시 불러도 잔액은 95 그대로다(190 이 되면 중복 지급)
  assert.equal((await settleTakeMany([id])).status, "unknown");
  await recover();
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
  const retry = await settleTakeMany([id]);
  assert.equal(retry.status, "unknown");
  assert.deepEqual(retry.taken, []);
  assert.equal(retry.amountUsdt, 0);
  assert.deepEqual(await settleTake(id), { status: "unknown" });
  assert.equal(savedWallet().cryptoBalance, 95);
  assert.equal(useWalletStore.getState().cryptoBalance, 95);
  assert.equal(savedSellbacks().length, 1);
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
});

test("거래 기록을 적을 때 실패: 잔액은 저장됐어도 입금 내역이 없으면 받았다고 하지 않고, 다시 지급하지도 않는다", async () => {
  const [id] = seed();
  fault = { key: WALLET, mode: "throw", when: hasSellback };
  const out = await settleTakeMany([id]);
  assert.equal(out.status, "unknown");
  assert.deepEqual(out.taken, []);
  assert.deepEqual(out.left, []);
  assert.equal(savedItem(id)?.status, "SOLD");
  assert.equal(savedWallet().cryptoBalance, 95);
  assert.equal(savedSellbacks().length, 0);

  await recover();
  assert.equal((await settleTakeMany([id])).status, "unknown");
  assert.equal(savedWallet().cryptoBalance, 95);
});

test("묶음에서 한 상품만 어긋나도 나머지는 정직하게 나눠 답한다", async () => {
  const [a, b] = seed(2);
  // b 는 전에 받았고 입금 내역이 있다. a 는 받다가 멈춘 흔적이다: 받은 상태로 저장됐는데 입금 내역이 없고 확인 대기 표시가 남아 있다
  await settleTakeMany([b]);
  useInventoryStore.setState((s) => ({ items: s.items.map((item) => (item.id === a ? { ...item, status: "SOLD" as const, soldForUsdt: 95, soldAt: new Date().toISOString() } : item)) }));
  disk.set(MARKS, JSON.stringify([{ ids: [a], c: 0, d: 0, n: 0, l: null }]));
  const [c] = [useInventoryStore.getState().add([{ itemId: physical.item.id, boxSlug: physical.box.slug, valueUsdt: 40, tier: "royal", fair: { serverSeed: "s", serverSeedHash: "h", clientSeed: "c", nonce: 0, roll: 0 } }])[0].id];

  const out = await settleTakeMany([a, b, c, "own_missing"]);
  assert.equal(out.status, "unknown");
  assert.deepEqual(out.taken, [{ id: c, amountUsdt: 38 }]);
  assert.deepEqual(out.already, [{ id: b, amountUsdt: 95 }]);
  assert.deepEqual(out.unknown, [a]);
  assert.deepEqual(out.left, ["own_missing"]);
  assert.equal(out.amountUsdt, 38);
  assert.equal(savedWallet().cryptoBalance, 133);
});

test("옛 받기 기록(itemIds 없이 ref 에 쉼표로 적힌 것)도 입금 내역으로 알아본다", async () => {
  const [a, b] = seed(2);
  useInventoryStore.setState((s) => ({ items: s.items.map((item) => ({ ...item, status: "SOLD" as const, soldForUsdt: 95, soldAt: new Date().toISOString() })) }));
  useWalletStore.setState({ cryptoBalance: 190, balance: 190, transactions: [{ id: "tx_old", type: "sellback", amountUsdt: 190, at: new Date().toISOString(), ref: `${a},${b}` }] });
  const out = await settleTakeMany([a, b]);
  assert.equal(out.status, "settled");
  assert.equal(out.already.length, 2);
  assert.deepEqual(out.taken, []);
  assert.equal(savedWallet().cryptoBalance, 190);
});

// ── flow/REVIEW_codex-2.md 4.1: 쓰기 둘이 함께 빠지면 "보관 중이고 내역이 없다"만으로는 받지 못했다고 할 수 없다

test("보관함 저장이 무시되고 거래 기록도 실패: 잔액은 이미 들어왔으므로 받지 못했다고 하지 않고, 다시 불러도 두 번 지급하지 않는다", async () => {
  const [id] = seed();
  fault = [{ key: INVENTORY, mode: "ignore", when: hasSold }, { key: WALLET, mode: "throw", when: hasSellback }];
  const out = await settleTakeMany([id]);
  // 저장된 장부: 상품은 보관 중, 입금 내역 없음, 그런데 잔액은 95 가 들어와 있다
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
  assert.equal(savedSellbacks().length, 0);
  assert.equal(savedWallet().cryptoBalance, 95);
  assert.equal(out.status, "unknown");
  assert.deepEqual(out.unknown, [id]);
  assert.deepEqual(out.left, []);
  assert.deepEqual(out.taken, []);
  assert.equal(out.amountUsdt, 0);
  // 화면이 쓰는 기준으로도 받을 수 있는 상품이 아니다(선택 목록, 미리 보는 금액, 부족액 계산에서 빠진다)
  const items = useInventoryStore.getState().items;
  assert.equal(take.takeStateOf(items[0], take.currentTakeLedger()), "unconfirmed");
  assert.deepEqual(take.heldForTake(items), []);
  assert.equal(take.takeQuote(items).totalUsdt, 0);

  await recover();
  for (let i = 0; i < 3; i++) {
    const retry = await settleTakeMany([id]);
    assert.equal(retry.status, "unknown");
    assert.deepEqual(retry.taken, []);
    assert.deepEqual(retry.left, []);
    assert.equal(savedWallet().cryptoBalance, 95, "한 상품에 95 를 넘겨 지급하면 안 된다");
  }
  assert.deepEqual(await settleTake(id), { status: "unknown" });
  assert.equal(savedWallet().cryptoBalance, 95);
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
});

test("저장 한도 하나: 한도가 얼마든 한 상품에 95 를 넘겨 지급하지 않고, 답은 저장된 장부와 어긋나지 않는다", async () => {
  let sawBalanceOnly = false; let sawRefused = false; let sawTaken = false;
  for (let slack = 0; slack <= 700; slack += 5) {
    const [id] = seed();
    limit = Array.from(disk.values()).reduce((n, text) => n + text.length, 0) + slack;
    const first = await settleTakeMany([id]);
    const item = savedItem(id)?.status; const balance = savedWallet().cryptoBalance; const records = savedSellbacks().length;
    const where = `slack ${slack}: ${first.status}, saved ${item}/${balance}/${records}`;
    assert.ok(balance === 0 || balance === 95, where);
    if (first.taken.length) { assert.ok(item === "SOLD" && records === 1 && balance === 95, where); sawTaken = true; }
    if (first.left.length) { assert.ok(item === "IN_STORAGE" && records === 0 && balance === 0, where); sawRefused = true; }
    if (item === "IN_STORAGE" && records === 0 && balance === 95) { assert.equal(first.status, "unknown", where); sawBalanceOnly = true; }
    if (first.status === "settled") assert.ok(first.taken.length === 1 && first.unknown.length === 0, where);
    // 한도를 풀고 새 탭처럼 다시 읽은 뒤 같은 상품을 거듭 불러도 95 를 넘지 않는다
    await recover();
    for (let i = 0; i < 2; i++) {
      const retry = await settleTakeMany([id]);
      const after = savedWallet().cryptoBalance;
      assert.ok(after <= 95, `${where} → 다시 부른 뒤 잔액 ${after}`);
      if (retry.taken.length) assert.ok(savedItem(id)?.status === "SOLD" && savedSellbacks().length === 1 && after === 95, where);
    }
    assert.ok(savedSellbacks().length <= 1, where);
  }
  // 이 훑기가 실제로 세 갈래를 다 지났는지: 시작도 못 한 경우, 잔액만 저장된 경우(Codex 가 190 을 재현한 상태), 정상으로 받은 경우
  assert.ok(sawRefused, "한도가 빠듯해 받기를 시작하지 않은 경우가 있어야 한다");
  assert.ok(sawBalanceOnly, "큰 쓰기만 빠지고 잔액만 저장된 경우가 있어야 한다");
  assert.ok(sawTaken, "한도가 넉넉해 정상으로 받은 경우가 있어야 한다");
});

// ── 4.2: 스토어의 재수화는 읽기 오류를 삼킨다. 판정은 저장된 장부를 직접 읽어서 한다

test("지갑 쓰기가 빠지고 그 뒤 읽기가 실패: 기억 속 잔액이 95 여도 받았다고 답하지 않는다", async () => {
  const [id] = seed();
  // 지갑에 넣는 쓰기와 거래 기록 쓰기를 조용히 버리고, 그 순간부터 장부 읽기가 던진다
  fault = { key: WALLET, mode: "ignore", when: (value) => { const drop = hasCredit(value); if (drop) readFault = (name) => name === WALLET || name === INVENTORY; return drop; } };
  const out = await settleTakeMany([id]);
  assert.equal(out.status, "unknown");
  assert.deepEqual(out.taken, []);
  assert.deepEqual(out.already, []);
  assert.deepEqual(out.left, []);
  assert.equal(out.amountUsdt, 0);
  readFault = null;
  assert.equal(savedItem(id)?.status, "SOLD");
  assert.equal(savedWallet().cryptoBalance, 0);
  assert.equal(savedSellbacks().length, 0);

  await recover();
  assert.equal(useWalletStore.getState().cryptoBalance, 0);
  assert.equal((await settleTakeMany([id])).status, "unknown");
  assert.deepEqual(await settleTake(id), { status: "unknown" });
  assert.equal(savedWallet().cryptoBalance, 0);
});

test("받기 전에 장부를 읽지 못함: 아무것도 실행하지 않고 알 수 없다고 답한다. 읽을 수 있게 되면 한 번만 받는다", async () => {
  const [id] = seed();
  readFault = (name) => name === WALLET;
  const out = await settleTakeMany([id]);
  assert.equal(out.status, "unknown");
  assert.deepEqual(out.taken, []);
  readFault = null;
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
  assert.equal(savedWallet().cryptoBalance, 0);

  await recover();
  const retry = await settleTakeMany([id]);
  assert.equal(retry.status, "settled");
  assert.equal(savedWallet().cryptoBalance, 95);
  assert.equal((await settleTakeMany([id])).already.length, 1);
  assert.equal(savedWallet().cryptoBalance, 95);
});

test("저장된 장부가 깨져 있거나 있어야 할 기록이 없으면 알 수 없다고 답하고 아무것도 실행하지 않는다", async () => {
  for (const broken of ["{not json", "", JSON.stringify({ state: { balance: 0 }, version: 4 })]) {
    const [id] = seed();
    const good = disk.get(WALLET)!;
    if (broken) disk.set(WALLET, broken); else disk.delete(WALLET);
    const out = await settleTakeMany([id]);
    assert.equal(out.status, "unknown", broken || "(없음)");
    assert.deepEqual(out.taken, []);
    assert.equal(savedItem(id)?.status, "IN_STORAGE");
    disk.set(WALLET, good);
  }
});

// ── 5.2: 미리 보는 금액과 부족액 계산은 받는 일과 같은 자격을 쓴다

test("보관 중인데 입금 내역이 있는 상품은 받을 수 있는 것으로 세지 않는다: 미리 보는 금액, 부족액, 실제로 받는 것이 같다", async () => {
  const [a, b] = seed(2);
  // a 는 지갑에 이미 들어왔는데(내역 있음) 보관함에는 보관 중으로 남았다. 잔액 95
  useWalletStore.setState({ cryptoBalance: 95, balance: 95, transactions: [{ id: "tx_a", type: "sellback", amountUsdt: 95, at: new Date().toISOString(), ref: a, itemIds: [a] }] });
  const items = useInventoryStore.getState().items;
  const ledger = take.currentTakeLedger();
  assert.equal(take.takeStateOf(items.find((item) => item.id === a)!, ledger), "unconfirmed");
  assert.equal(take.takeStateOf(items.find((item) => item.id === b)!, ledger), "held");
  assert.deepEqual(take.heldForTake(items).map((item) => item.id), [b]);
  const quote = take.takeQuote(items);
  assert.equal(quote.count, 1);
  assert.equal(quote.totalUsdt, 95);
  assert.deepEqual(take.shortfallOf(95, 250, items), { missing: 155, heldCount: 1, maxReceivable: 95, covers: false });

  const out = await settleTakeMany([a, b]);
  assert.deepEqual(out.taken, [{ id: b, amountUsdt: 95 }]);
  assert.deepEqual(out.unknown, [a]);
  assert.equal(out.amountUsdt, quote.totalUsdt);
  assert.equal(savedWallet().cryptoBalance, 190);
});

test("받기가 확정됐는지: 받는 일, 미리 보기, 화면이 쓰는 한 가지 기준. 의심의 증거는 확인 대기 표시 하나다", () => {
  const held = { id: "own_a", status: "IN_STORAGE" as const };
  const sold = { id: "own_a", status: "SOLD" as const };
  const none = new Set<string>(); const a = new Set(["own_a"]);
  // 보관 중
  assert.equal(take.takeStateOf(held, { credited: none, hold: none }), "held");
  assert.equal(take.takeStateOf(held, { credited: a, hold: none }), "unconfirmed");
  assert.equal(take.takeStateOf(held, { credited: none, hold: a }), "unconfirmed");
  assert.equal(take.takeStateOf(held, { credited: none, hold: a, saved: true }), "unconfirmed");
  // 받은 상태, 표시 없음: 내역이 그 상품을 가리키든 아니든 받은 것이다(옛 기록을 낮추지 않는다)
  assert.equal(take.takeStateOf(sold, { credited: none, hold: none }), "taken");
  assert.equal(take.takeStateOf(sold, { credited: a, hold: none }), "taken");
  // 받은 상태, 표시 있음: 저장된 장부의 내역이 가리킬 때만 받은 것이다
  assert.equal(take.takeStateOf(sold, { credited: a, hold: a, saved: true }), "taken");
  assert.equal(take.takeStateOf(sold, { credited: none, hold: a, saved: true }), "unconfirmed");
  // 화면이 보는 기억 속 내역은 표시를 이기지 못한다: 표시 있음 + 기억 속 내역 있음 + 저장된 내역 없음 → 확인 필요
  assert.equal(take.takeStateOf(sold, { credited: a, hold: a, saved: false }), "unconfirmed");
  assert.equal(take.takeStateOf(sold, { credited: a, hold: a }), "unconfirmed");
  assert.equal(take.takeStateOf({ id: "own_a", status: "SHIPPING_REQUESTED" as const }, { credited: a, hold: a }), "other");
});

// ── flow/REVIEW_codex-3.md 3.2 와 4절: 이 일을 만들기 전에 정상으로 받은 기록은 전부 받은 것이다

type OldRecord = { name: string; itemId?: string; boxSlug?: string; value: number; got: number; ref?: string };
const oldRecords = (): OldRecord[] => [
  { name: "일반 받기(ref 에 보관 상품 id)", value: 100, got: 95, ref: "OWNED" },
  { name: "옛 자동 받기(ref 가 상품 종류:auto)", value: 100, got: 95, ref: physical.item.id + ":auto" },
  { name: "옛 현금 결과(ref 가 박스:cashback x1)", value: 100, got: 100, ref: physical.box.slug + ":cashback x1" },
  { name: "실제 옛 형식 dollar-apple / wave-cashback-50", itemId: "wave-cashback-50", boxSlug: "dollar-apple", value: 0.5, got: 0.5, ref: "dollar-apple:cashback x1" },
  { name: "실물, 내역에 아무 id 도 없음", value: 100, got: 95 },
];

test("옛 기록 호환: 표의 다섯 줄 모두 받은 것으로 보고, 받은 금액을 그대로 답하고, 새로 지급하지 않는다", async () => {
  for (const record of oldRecords()) {
    seed(0);
    const owned = useInventoryStore.getState().add([{ itemId: record.itemId ?? physical.item.id, boxSlug: record.boxSlug ?? physical.box.slug, valueUsdt: record.value, tier: "royal", fair: { serverSeed: "s", serverSeedHash: "h", clientSeed: "c", nonce: 0, roll: 0 } }])[0];
    // 옛 코드가 남긴 그대로: 상품은 받은 상태, 잔액에 들어왔고, 받기 거래 기록 한 건(itemIds 없음)
    useInventoryStore.setState((s) => ({ items: s.items.map((item) => ({ ...item, status: "SOLD" as const, soldForUsdt: record.got, soldAt: new Date().toISOString() })) }));
    useWalletStore.setState({ cryptoBalance: record.got, balance: record.got, transactions: [{ id: "tx_old", type: "sellback", amountUsdt: record.got, at: new Date().toISOString(), ...(record.ref ? { ref: record.ref === "OWNED" ? owned.id : record.ref } : {}) }] });

    const items = useInventoryStore.getState().items;
    assert.equal(take.takeStateOf(items[0], take.currentTakeLedger()), "taken", record.name);
    assert.deepEqual(take.heldForTake(items), [], record.name);
    const out = await settleTakeMany([owned.id]);
    assert.equal(out.status, "settled", record.name);
    assert.deepEqual(out.already, [{ id: owned.id, amountUsdt: record.got }], record.name);
    assert.deepEqual(out.taken, [], record.name);
    assert.deepEqual(out.unknown, [], record.name);
    assert.equal(out.amountUsdt, 0, record.name);
    assert.deepEqual(await settleTake(owned.id), { status: "settled", amountUsdt: record.got, already: true }, record.name);
    assert.equal(savedWallet().cryptoBalance, record.got, record.name);
    assert.equal(savedSellbacks().length, 1, record.name);
    assert.equal(disk.has(MARKS), false, record.name);
  }
});

// ── 3.1: 저장되지 않은 기억 속 내역으로 받았다고 하지 않는다. 표시가 남아 있는 동안은 확인 필요다

test("지갑 쓰기가 빠지고 읽기가 실패한 뒤: 기억 속에는 내역과 잔액이 남아 있어도 화면의 기준은 확인 필요이고, 읽을 수 있게 되면 기억 속 장부를 저장된 장부에 맞춘다", async () => {
  const [id] = seed();
  fault = { key: WALLET, mode: "ignore", when: (value) => { const drop = hasCredit(value); if (drop) readFault = (name) => name === WALLET || name === INVENTORY; return drop; } };
  const out = await settleTakeMany([id]);
  assert.equal(out.status, "unknown");
  // 기억 속 장부: 상품은 받은 상태, 잔액 95, 받기 내역까지 있다. 저장된 장부에는 잔액도 내역도 없다
  const memory = useInventoryStore.getState().items.find((item) => item.id === id)!;
  assert.equal(memory.status, "SOLD");
  assert.equal(useWalletStore.getState().cryptoBalance, 95);
  assert.equal(take.creditedIdsOf(useWalletStore.getState().transactions).has(id), true);
  // 그래도 화면이 쓰는 기준은 확인 필요다(표시가 기억 속 내역을 이긴다). 닫았다 다시 열어도 같다
  assert.equal(take.takeStateOf(memory, take.currentTakeLedger()), "unconfirmed");
  assert.equal(take.takeStateOf(memory, take.currentTakeLedger()), "unconfirmed");

  // 읽을 수 있게 되면(창으로 돌아올 때, 시트를 열 때 부른다) 기억 속 장부를 저장된 장부에 맞춘다. 돈은 움직이지 않는다
  readFault = null; fault = null;
  await take.reviewTakeMarks();
  assert.equal(useWalletStore.getState().cryptoBalance, 0);
  assert.equal(useWalletStore.getState().transactions.filter((tx) => tx.type === "sellback").length, 0);
  assert.equal(savedWallet().cryptoBalance, 0);
  assert.equal(savedItem(id)?.status, "SOLD");
  const after = useInventoryStore.getState().items.find((item) => item.id === id)!;
  assert.equal(take.takeStateOf(after, take.currentTakeLedger()), "unconfirmed");
  assert.equal((await settleTakeMany([id])).status, "unknown");
  assert.equal(savedWallet().cryptoBalance, 0);
});

// ── 3.3: 표시가 남은 보관 상품을 다시 본다. 아무것도 들어오지 않은 것이 설명될 때만 풀고, 눈감고 다시 받지 않는다

test("깨끗이 실패했는데 표시가 지워지지 않음: 다시 볼 때 풀리고, 그 뒤 한 번만 받는다", async () => {
  const [id] = seed();
  fault = { key: INVENTORY, mode: "throw", when: hasSold };
  removeFault = (name) => name === MARKS;
  const out = await settleTakeMany([id]);
  // 받지 못했지만 표시를 지우지 못했다. 화면이 확인 필요로 보여 줄 것이므로 답도 알 수 없음이다
  assert.equal(out.status, "unknown");
  assert.equal(disk.has(MARKS), true);
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
  assert.equal(savedWallet().cryptoBalance, 0);

  await recover();
  assert.equal(take.takeStateOf(useInventoryStore.getState().items[0], take.currentTakeLedger()), "unconfirmed");
  // 다시 보기: 보관 중, 내역 없음, 잔액은 표시를 적을 때 그대로 → 풀린다. 돈은 움직이지 않는다
  await take.reviewTakeMarks();
  assert.equal(disk.has(MARKS), false);
  assert.equal(savedWallet().cryptoBalance, 0);
  assert.equal(take.takeStateOf(useInventoryStore.getState().items[0], take.currentTakeLedger()), "held");
  const retry = await settleTakeMany([id]);
  assert.deepEqual(retry.taken, [{ id, amountUsdt: 95 }]);
  assert.equal(savedWallet().cryptoBalance, 95);
  assert.equal((await settleTakeMany([id])).already.length, 1);
  assert.equal(savedWallet().cryptoBalance, 95);
  assert.equal(savedSellbacks().length, 1);
});

test("보관함 쓰기 실패 뒤 읽기까지 실패(또는 탭이 죽음): 받기를 다시 부르면 그 안에서 표시가 풀리고 한 번만 받는다", async () => {
  const [id] = seed();
  fault = { key: INVENTORY, mode: "throw", when: (value) => { const hit = hasSold(value); if (hit) readFault = (name) => name === WALLET || name === INVENTORY; return hit; } };
  const out = await settleTakeMany([id]);
  assert.equal(out.status, "unknown");
  assert.equal(disk.has(MARKS), true);
  await recover();
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
  assert.equal(savedWallet().cryptoBalance, 0);
  // 받기를 부르면 먼저 남은 표시를 다시 본다. 아무것도 들어오지 않았으므로 풀고, 이어서 정상으로 받는다
  const retry = await settleTakeMany([id]);
  assert.equal(retry.status, "settled");
  assert.deepEqual(retry.taken, [{ id, amountUsdt: 95 }]);
  assert.equal(savedWallet().cryptoBalance, 95);
  assert.equal(disk.has(MARKS), false);
  assert.equal((await settleTakeMany([id])).taken.length, 0);
  assert.equal(savedWallet().cryptoBalance, 95);
});

test("표시가 남았고 잔액이 설명되지 않게 늘어 있음: 몇 번을 다시 봐도 풀지 않는다", async () => {
  const [id] = seed();
  fault = [{ key: INVENTORY, mode: "ignore", when: hasSold }, { key: WALLET, mode: "throw", when: hasSellback }];
  assert.equal((await settleTakeMany([id])).status, "unknown");
  await recover();
  for (let i = 0; i < 3; i++) {
    await take.reviewTakeMarks();
    assert.equal(disk.has(MARKS), true);
    assert.equal(take.takeStateOf(useInventoryStore.getState().items[0], take.currentTakeLedger()), "unconfirmed");
  }
  // 그 뒤에 기록이 있는 충전이 들어와도, 설명되지 않은 95 는 그대로 설명되지 않는다
  useWalletStore.getState().creditSplit(50, 0);
  useWalletStore.getState().addTransaction({ type: "deposit_usdt", amountUsdt: 50, ref: "later" });
  await take.reviewTakeMarks();
  assert.equal(disk.has(MARKS), true);
  assert.equal((await settleTakeMany([id])).status, "unknown");
  assert.equal(savedWallet().cryptoBalance, 145);
});

test("받는 사이에 다른 탭의 충전 50 이 기록과 함께 들어옴: 잔액의 변화가 기록으로 설명되므로 표시가 풀리고, 상품은 한 번만 받는다", async () => {
  const [id] = seed();
  // 보관함 쓰기가 실패하는 그 순간, 다른 작성자가 저장된 지갑에 충전 50 과 그 내역을 적는다
  const deposit = () => {
    const wallet = JSON.parse(disk.get(WALLET)!);
    wallet.state.cryptoBalance = +(wallet.state.cryptoBalance + 50).toFixed(2); wallet.state.balance = +(wallet.state.balance + 50).toFixed(2);
    wallet.state.transactions.unshift({ id: "tx_deposit_other_tab", type: "deposit_usdt", amountUsdt: 50, at: new Date().toISOString(), ref: "other-tab" });
    disk.set(WALLET, JSON.stringify(wallet));
  };
  fault = { key: INVENTORY, mode: "throw", when: (value) => { const hit = hasSold(value); if (hit) deposit(); return hit; } };
  removeFault = (name) => name === MARKS;
  const out = await settleTakeMany([id]);
  assert.equal(out.status, "unknown");
  assert.equal(disk.has(MARKS), true);
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
  assert.equal(savedWallet().cryptoBalance, 50);
  assert.equal(savedSellbacks().length, 0);

  await recover();
  await take.reviewTakeMarks();
  assert.equal(disk.has(MARKS), false);
  assert.equal(take.takeStateOf(useInventoryStore.getState().items[0], take.currentTakeLedger()), "held");
  const retry = await settleTakeMany([id]);
  assert.deepEqual(retry.taken, [{ id, amountUsdt: 95 }]);
  assert.equal(savedWallet().cryptoBalance, 145);
  assert.equal((await settleTakeMany([id])).taken.length, 0);
  assert.equal(savedWallet().cryptoBalance, 145);
});

test("표시를 지우지 못했을 뿐 깨끗이 실패한 경우에도, 충전이 겹쳤으면 그 자리에서 받지 못했다고 답한다(표시가 지워질 때)", async () => {
  const [id] = seed();
  const deposit = () => {
    const wallet = JSON.parse(disk.get(WALLET)!);
    wallet.state.cryptoBalance = 50; wallet.state.balance = 50;
    wallet.state.transactions.unshift({ id: "tx_deposit_other_tab", type: "deposit_usdt", amountUsdt: 50, at: new Date().toISOString(), ref: "other-tab" });
    disk.set(WALLET, JSON.stringify(wallet));
  };
  fault = { key: INVENTORY, mode: "throw", when: (value) => { const hit = hasSold(value); if (hit) deposit(); return hit; } };
  const out = await settleTakeMany([id]);
  assert.equal(out.status, "failed");
  assert.deepEqual(out.left, [id]);
  assert.equal(disk.has(MARKS), false);
  assert.equal(savedWallet().cryptoBalance, 50);
});

test("정상으로 받았는데 표시만 지우지 못함: 받았다고 답하고, 다시 볼 때 표시가 지워지고, 두 번 지급하지 않는다", async () => {
  const [id] = seed();
  removeFault = (name) => name === MARKS;
  const out = await settleTakeMany([id]);
  assert.equal(out.status, "settled");
  assert.deepEqual(out.taken, [{ id, amountUsdt: 95 }]);
  assert.equal(disk.has(MARKS), true);
  assert.equal(savedWallet().cryptoBalance, 95);

  await recover();
  await take.reviewTakeMarks();
  assert.equal(disk.has(MARKS), false);
  assert.equal(take.takeStateOf(useInventoryStore.getState().items[0], take.currentTakeLedger()), "taken");
  const again = await settleTakeMany([id]);
  assert.deepEqual(again.already, [{ id, amountUsdt: 95 }]);
  assert.deepEqual(again.taken, []);
  assert.equal(savedWallet().cryptoBalance, 95);
  assert.equal(savedSellbacks().length, 1);
});

test("옛 형식의 표시(id 만 적은 것): 받은 것이 확인되면 지우고, 보관 중인 것은 잔액으로 설명할 자료가 없어 그대로 둔다", async () => {
  const [a, b] = seed(2);
  await settleTakeMany([a]);
  disk.set(MARKS, JSON.stringify([a, b]));
  await take.reviewTakeMarks();
  assert.deepEqual(JSON.parse(disk.get(MARKS)!), [{ ids: [b] }]);
  const items = useInventoryStore.getState().items;
  assert.equal(take.takeStateOf(items.find((item) => item.id === a)!, take.currentTakeLedger()), "taken");
  assert.equal(take.takeStateOf(items.find((item) => item.id === b)!, take.currentTakeLedger()), "unconfirmed");
  assert.equal((await settleTakeMany([b])).status, "unknown");
  assert.equal(savedWallet().cryptoBalance, 95);
});
