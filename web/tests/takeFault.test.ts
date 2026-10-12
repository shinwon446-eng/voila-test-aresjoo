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
  removeItem: (name: string) => { disk.delete(name); },
};

// 스토어는 만들어질 때 저장소를 잡는다. 그래서 저장소를 먼저 놓고 그 뒤에 모듈을 불러온다
let settleTake: typeof import("../lib/openingSettle").settleTake;
let settleTakeMany: typeof import("../lib/takeBatch").settleTakeMany;
let useInventoryStore: typeof import("../stores/inventoryStore").useInventoryStore;
let useWalletStore: typeof import("../stores/walletStore").useWalletStore;
let take: typeof import("../lib/takeBatch");
let physical: { item: { id: string }; box: { slug: string } };
let INVENTORY = ""; let WALLET = "";
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
  fault = null; limit = Infinity; readFault = null; dropped.length = 0;
  // 확인 대기 표시도 비운다(앞 테스트가 남긴 것)
  for (const key of Array.from(disk.keys())) if (key.startsWith("voila.take-unconfirmed.")) disk.delete(key);
  useWalletStore.setState({ cryptoBalance: 0, cardBalance: 0, balance: 0, transactions: [] });
  useInventoryStore.setState({ items: [] });
  const ids = Array.from({ length: count }, () => useInventoryStore.getState().add([{ itemId: physical.item.id, boxSlug: physical.box.slug, valueUsdt: 100, tier: "royal", fair: { serverSeed: "s", serverSeedHash: "h", clientSeed: "c", nonce: 0, roll: 0 } }])[0].id);
  assert.equal(savedItem(ids[0])?.status, "IN_STORAGE");
  assert.equal(savedWallet().balance, 0);
  return ids;
}
/** 실패 주입을 걷고, 새 탭처럼 저장된 장부를 다시 읽는다 */
async function recover(): Promise<void> {
  fault = null; limit = Infinity; readFault = null;
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
  // b 는 전에 받았고 입금 내역이 있다. a 는 받은 상태로만 저장되고 입금 내역이 없다(옛 실패의 흔적)
  await settleTakeMany([b]);
  useInventoryStore.setState((s) => ({ items: s.items.map((item) => (item.id === a ? { ...item, status: "SOLD" as const, soldForUsdt: 95, soldAt: new Date().toISOString() } : item)) }));
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

test("받기가 확정됐는지: 받는 일, 미리 보기, 화면이 쓰는 한 가지 기준", () => {
  const [a] = seed();
  const base = useInventoryStore.getState().items.find((item) => item.id === a)!;
  const none = { credited: new Set<string>(), hold: new Set<string>() };
  const paid = { credited: new Set([a]), hold: new Set<string>() };
  const held = { credited: new Set<string>(), hold: new Set([a]) };
  assert.equal(take.takeStateOf(base, none), "held");
  assert.equal(take.takeStateOf(base, paid), "unconfirmed");
  assert.equal(take.takeStateOf(base, held), "unconfirmed");
  const sold = { ...base, status: "SOLD" as const, soldForUsdt: 95 };
  assert.equal(take.takeStateOf(sold, paid), "taken");
  assert.equal(take.takeStateOf(sold, none), "unconfirmed");
  assert.equal(take.takeStateOf({ ...base, status: "SOLD" as const }, paid), "unconfirmed");
  assert.equal(take.takeStateOf({ ...base, status: "SHIPPING_REQUESTED" as const }, paid), "other");
  // 열 때 잔액으로 바로 들어온 USDT 결과는 받기를 거치지 않았다. 입금 내역에 상품 id 가 없어도 확정된 것이다
  assert.equal(take.takeStateOf({ ...base, itemId: "no-such-item", status: "SOLD" as const, soldForUsdt: 100 }, none), "taken");
});
