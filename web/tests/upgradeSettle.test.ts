// 업그레이드가 장부에 남기는 것과, 저장이 중간에 실패했을 때의 정직한 판정(flow/MELT_SPEC.md U1, U4, U7, U8)
//   성공: 건 상품이 사라지고(UPGRADED) 목표 상품이 보관함에 들어온다. 실패: 건 상품이 사라진다. 어느 쪽도 잔액은 그대로다.
//   같은 추첨은 한 번만 적용된다(연타, 다시 부르기, 받기와 겹치기).
//   저장된 장부를 직접 읽어 판정한다: 적용됐다, 적용 안 됐다(상품은 보관 중), 알 수 없다(성공도 실패도 아니다, 확인 필요).
//   이 파일은 실제 스토어에 기억 속 저장소를 붙이고 쓰기와 읽기를 골라 실패시킨다(tests/takeFault.test.ts 와 같은 방식).
//   npm test
import test, { before } from "node:test";
import assert from "node:assert/strict";
import type { OwnedItem } from "../stores/inventoryStore";
import type { UpgradeOption, UpgradeRecord } from "../lib/upgrade";

// 보관함과 지갑은 저장소에 줄여서 적힐 수 있다(lib/compactStorage 가 있는 판). 저장된 글은 그 모듈의 풀기 함수로 읽고, 그 모듈이 없는 판에서는 그냥 JSON 이다.
// 어느 판에서도 같은 테스트가 돌게, 모듈은 아래 before 에서 있을 때만 불러온다
type Stored<S> = { state: S } | null;
let parseLedger = <S = Record<string, unknown>>(raw: string | null): Stored<S> => (raw === null ? null : (JSON.parse(raw) as Stored<S>));

type Fault = { key: string; mode: "throw" | "ignore"; when: (value: string) => boolean };
const disk = new Map<string, string>();
let fault: Fault | null = null;
let readFault: ((name: string) => boolean) | null = null;
let removeFault: ((name: string) => boolean) | null = null;
/** 읽기가 일어나는 순간에 끼어드는 손잡이(기다리는 사이에 계정이 바뀌는 경우를 만든다) */
let onRead: ((name: string) => void) | null = null;
const storage = {
  getItem: (name: string) => { if (readFault?.(name)) throw new Error("storage read failed (injected)"); onRead?.(name); return disk.get(name) ?? null; },
  setItem: (name: string, value: string) => {
    if (fault && name === fault.key && fault.when(value)) { if (fault.mode === "throw") throw new Error("QuotaExceededError (injected)"); return; }
    disk.set(name, value);
  },
  removeItem: (name: string) => { if (removeFault?.(name)) return; disk.delete(name); },
};

// 스토어는 만들어질 때 저장소를 잡는다. 그래서 저장소를 먼저 놓고 그 뒤에 모듈을 불러온다
let useInventoryStore: typeof import("../stores/inventoryStore").useInventoryStore;
let useWalletStore: typeof import("../stores/walletStore").useWalletStore;
let useFairStore: typeof import("../stores/fairStore").useFairStore;
let up: typeof import("../lib/upgrade");
let settle: typeof import("../lib/upgradeSettle");
let take: typeof import("../lib/takeBatch");
let fairness: typeof import("../lib/fairness");
let restoreBrowserAssets: typeof import("../lib/browserWallet").restoreBrowserAssets;
let physical: { item: { id: string }; box: { slug: string; category: string } };
let INVENTORY = ""; let WALLET = ""; let FAIR = ""; let MARKS = ""; let TAKE_MARKS = "";
const SERVER = "upgrade-test-server-seed"; const CLIENT = "upgrade-test-client";
let SERVER_HASH = "";
before(async () => {
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
  ({ useInventoryStore } = await import("../stores/inventoryStore"));
  ({ useWalletStore } = await import("../stores/walletStore"));
  ({ useFairStore } = await import("../stores/fairStore"));
  up = await import("../lib/upgrade");
  settle = await import("../lib/upgradeSettle");
  take = await import("../lib/takeBatch");
  fairness = await import("../lib/fairness");
  ({ restoreBrowserAssets } = await import("../lib/browserWallet"));
  try {
    const compact = await import(["..", "lib", "compactStorage.ts"].join("/"));
    if (typeof compact.parseLedger === "function") parseLedger = compact.parseLedger;
  } catch { /* 줄여 적지 않는 판이다 */ }
  const { BOXES } = await import("../lib/products");
  physical = BOXES.flatMap((box) => box.items.map((item) => ({ item, box }))).find((x) => x.item.kind === "physical")!;
  INVENTORY = useInventoryStore.persist.getOptions().name!;
  WALLET = useWalletStore.persist.getOptions().name!;
  FAIR = useFairStore.persist.getOptions().name!;
  MARKS = "voila.upgrade-unconfirmed." + WALLET;
  TAKE_MARKS = "voila.take-unconfirmed." + WALLET;
  SERVER_HASH = await fairness.hashServerSeed(SERVER);
});

const saved = <T,>(name: string): T => parseLedger(disk.get(name) ?? "{}")!.state as T;
const savedItems = () => saved<{ items: OwnedItem[] }>(INVENTORY).items;
const savedItem = (id: string) => savedItems().find((item) => item.id === id);
const savedWallet = () => saved<{ balance: number; cryptoBalance: number; cardBalance: number; transactions: unknown[] }>(WALLET);
const memoryItem = (id: string) => useInventoryStore.getState().items.find((item) => item.id === id);
const hasUpgraded = (value: string) => (parseLedger<{ items?: OwnedItem[] }>(value)?.state.items ?? []).some((item) => item.status === "UPGRADED");

/** 회차 n 의 번호가 이 확률에서 성공인지 */
async function wins(nonce: number, chanceUnits: number): Promise<boolean> {
  return up.upgradeWon((await fairness.calculateRollResult(SERVER, CLIENT, nonce)).roll, chanceUnits);
}
/** 다음 추첨이 원하는 결과가 되는 회차를 찾아 계수기를 거기에 놓는다 */
async function nextDraw(want: boolean, chanceUnits: number, from = useFairStore.getState().nonce): Promise<number> {
  let nonce = from;
  while ((await wins(nonce, chanceUnits)) !== want) nonce += 1;
  useFairStore.setState({ serverSeed: SERVER, serverSeedHash: SERVER_HASH, clientSeed: CLIENT, nonce });
  return nonce;
}

/** 상품가 100 인 상품 하나를 보관 중으로, 잔액 50 을 정상으로 저장한 뒤 시작한다. 2배 단추의 목표와 요청을 함께 돌려준다 */
function seed(extra: Partial<OwnedItem> = {}): { id: string; option: UpgradeOption; request: { stakeOwnedId: string; targetItemId: string; chanceUnits: number } } {
  fault = null; readFault = null; removeFault = null;
  for (const key of Array.from(disk.keys())) if (key.startsWith("voila.upgrade-unconfirmed.") || key.startsWith("voila.take-unconfirmed.")) disk.delete(key);
  useWalletStore.setState({ cryptoBalance: 50, cardBalance: 0, balance: 50, transactions: [] });
  useInventoryStore.setState({ items: [] });
  useFairStore.setState({ serverSeed: SERVER, serverSeedHash: SERVER_HASH, clientSeed: CLIENT, nonce: 0 });
  const id = useInventoryStore.getState().add([{ itemId: physical.item.id, boxSlug: physical.box.slug, valueUsdt: 100, tier: "royal", fair: { serverSeed: "s", serverSeedHash: "h", clientSeed: "c", nonce: 0, roll: 0 }, ...extra }])[0].id;
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
  const option = up.upgradeOptions({ itemId: physical.item.id, valueUsdt: 100, category: physical.box.category })[1];
  assert.equal(option.chip, 2);
  assert.ok(option.target, "2배 단추의 목표가 있어야 한다");
  return { id, option, request: { stakeOwnedId: id, targetItemId: option.target!.item.id, chanceUnits: option.chanceUnits } };
}
/** 실패 주입을 걷고, 새 탭처럼 저장된 장부를 다시 읽는다 */
async function recover(): Promise<void> {
  fault = null; readFault = null; removeFault = null;
  await Promise.all([useWalletStore.persist.rehydrate(), useInventoryStore.persist.rehydrate(), useFairStore.persist.rehydrate()]);
}
const recordOf = (out: Awaited<ReturnType<typeof settle.settleUpgrade>>): UpgradeRecord => { assert.ok(out.status === "won" || out.status === "lost", out.status); return (out as { record: UpgradeRecord }).record; };

test("성공: 건 상품이 사라지고 목표 상품이 보관함에 들어온다. 잔액은 그대로다", async () => {
  const { id, option, request } = seed({ fundingRatio: { crypto: 0.25, card: 0.75 } });
  const nonce = await nextDraw(true, option.chanceUnits);
  const out = await settle.settleUpgrade(request);
  assert.equal(out.status, "won");
  const record = recordOf(out);
  // 건 상품: 사라졌다(UPGRADED). 기록이 붙었다
  assert.equal(savedItem(id)?.status, "UPGRADED");
  assert.deepEqual(savedItem(id)?.upgrade, record);
  assert.equal(record.won, true);
  assert.equal(record.nonce, nonce);
  assert.equal(record.chanceUnits, option.chanceUnits);
  assert.deepEqual(record.stake, { ownedId: id, itemId: physical.item.id, boxSlug: physical.box.slug, valueUsdt: 100 });
  assert.equal(record.target.itemId, option.target!.item.id);
  assert.equal(record.target.valueUsdt, option.target!.item.value);
  // 목표 상품: 보관 중으로 들어왔다. 그 박스에서 그 상품을 찾을 수 있다
  const target = savedItem(record.target.ownedId)!;
  assert.equal(target.status, "IN_STORAGE");
  assert.equal(target.itemId, option.target!.item.id);
  assert.equal(target.boxSlug, option.target!.box.slug);
  assert.ok(option.target!.box.items.some((i) => i.id === target.itemId));
  assert.equal(target.valueUsdt, option.target!.item.value);
  assert.deepEqual(target.upgradedFrom, { id: record.id, stakeOwnedId: id });
  assert.equal(target.fair.nonce, nonce);
  assert.equal(target.fair.dropTable, undefined);
  // 자금 출처는 건 상품의 것을 잇는다
  assert.deepEqual(target.fundingRatio, { crypto: 0.25, card: 0.75 });
  assert.equal(savedItems().length, 2);
  // 돈은 움직이지 않았다
  assert.equal(savedWallet().balance, 50);
  assert.equal(savedWallet().transactions.length, 0);
  // 표시는 지워졌고, 기억 속 장부도 같다. 목표 상품은 받을 수 있고 다시 걸 수도 있다
  assert.equal(disk.has(MARKS), false);
  assert.equal(memoryItem(id)?.status, "UPGRADED");
  assert.equal(settle.canStake(memoryItem(record.target.ownedId)!), true);
  assert.equal(settle.canStake(memoryItem(id)!), false);
  assert.equal(take.heldForTake(useInventoryStore.getState().items).length, 1);
});

test("기록이 놓이는 자리: 건 상품은 받은 것 탭의 기록으로 남고, 업그레이드로 들어온 상품은 나온 상품과 후기에 오르지 않는다", async () => {
  const { vaultTab, processedAt } = await import("../lib/vault");
  const { winRows } = await import("../lib/wins");
  const { canReview } = await import("../lib/community");
  const { closureReadiness } = await import("../lib/account");
  const { id, option, request } = seed();
  await nextDraw(true, option.chanceUnits);
  const record = recordOf(await settle.settleUpgrade(request));
  const stake = memoryItem(id)!; const target = memoryItem(record.target.ownedId)!;
  assert.equal(vaultTab(stake), "done");
  assert.equal(processedAt(stake), record.at);
  assert.equal(vaultTab(target), "held");
  // 목표 상품은 그 박스 가격의 2배를 넘어도 나온 상품에 오르지 않는다(박스에서 나온 것이 아니다)
  const rows = winRows([target, stake], { loggedIn: true, catalog: { priceNow: () => 1, kindOf: () => "physical" } });
  assert.deepEqual(rows.map((row) => row.id), [id]);
  assert.equal(canReview({ ...target, valueUsdt: 1_000_000 }, []), false);
  // 사라진 상품은 탈퇴 조건에서 알 수 없는 상태로 세지 않는다. 보관 중인 목표 상품은 보관 중으로 센다
  const closure = closureReadiness({ cryptoBalance: 0, cardBalance: 0, items: [stake, target], transactions: [] });
  assert.deepEqual({ held: closure.held, unknown: closure.unknown }, { held: 1, unknown: false });
});

test("실패: 건 상품이 사라진다. 목표 상품은 들어오지 않고 잔액은 그대로다", async () => {
  const { id, option, request } = seed();
  await nextDraw(false, option.chanceUnits);
  const out = await settle.settleUpgrade(request);
  assert.equal(out.status, "lost");
  const record = recordOf(out);
  assert.equal(record.won, false);
  assert.equal(savedItem(id)?.status, "UPGRADED");
  assert.equal(savedItem(record.target.ownedId), undefined);
  assert.equal(savedItems().length, 1);
  assert.equal(savedWallet().balance, 50);
  assert.equal(savedWallet().transactions.length, 0);
  assert.equal(disk.has(MARKS), false);
  // 사라진 상품은 받을 수도, 다시 걸 수도 없다
  assert.equal(take.heldForTake(useInventoryStore.getState().items).length, 0);
  assert.equal((await take.settleTakeMany([id])).status, "failed");
  assert.equal(savedWallet().balance, 50);
});

test("검증: 기록의 값만으로 해시, 번호, 확률, 결과를 다시 계산하면 기록과 같다. 고친 기록은 걸린다", async () => {
  for (const want of [true, false]) {
    const { option, request } = seed();
    await nextDraw(want, option.chanceUnits);
    const record = recordOf(await settle.settleUpgrade(request));
    const check = await up.verifyUpgradeRecord(record);
    assert.deepEqual({ ok: check.ok, hash: check.hashMatch, roll: check.rollMatch, chance: check.chanceMatch, outcome: check.outcomeMatch }, { ok: true, hash: true, roll: true, chance: true, outcome: true });
    assert.equal(check.won, want);
    assert.equal(check.roll, record.roll);
    assert.equal(check.chanceUnits, option.chanceUnits);
    // 결과를 뒤집은 기록, 번호를 고친 기록, 확률을 올린 기록, 상품가를 고친 기록, 다른 값으로 잠근 기록
    assert.equal((await up.verifyUpgradeRecord({ ...record, won: !record.won })).ok, false);
    assert.equal((await up.verifyUpgradeRecord({ ...record, roll: (record.roll + 1) % 1_000_000 })).rollMatch, false);
    assert.equal((await up.verifyUpgradeRecord({ ...record, chanceUnits: record.chanceUnits + 1 })).chanceMatch, false);
    assert.equal((await up.verifyUpgradeRecord({ ...record, target: { ...record.target, valueUsdt: record.target.valueUsdt * 2 } })).ok, false);
    assert.equal((await up.verifyUpgradeRecord({ ...record, serverSeedHash: "0".repeat(64) })).hashMatch, false);
  }
});

test("회차: 박스 개봉과 같은 계수기를 쓴다. 업그레이드가 쓴 회차는 다음 개봉이 다시 쓰지 않는다", async () => {
  const { option, request } = seed();
  const nonce = await nextDraw(false, option.chanceUnits);
  const record = recordOf(await settle.settleUpgrade(request));
  assert.equal(record.nonce, nonce);
  assert.equal(saved<{ nonce: number }>(FAIR).nonce, nonce + 1);
  assert.equal(useFairStore.getState().takeNonce(), nonce + 1);
});

test("같은 추첨은 한 번만 적용된다: 연타, 끝난 뒤 다시 부르기, 새 탭에서 다시 부르기", async () => {
  const { id, option, request } = seed();
  const nonce = await nextDraw(true, option.chanceUnits);
  const [a, b] = await Promise.all([settle.settleUpgrade(request), settle.settleUpgrade(request)]);
  assert.equal(a, b);
  const record = recordOf(a);
  assert.equal(savedItems().length, 2);
  assert.equal(saved<{ nonce: number }>(FAIR).nonce, nonce + 1);
  // 끝난 뒤 같은 요청: 걸 수 없는 상품이다. 장부도 회차도 그대로다
  assert.deepEqual(await settle.settleUpgrade(request), { status: "blocked" });
  await recover();
  assert.deepEqual(await settle.settleUpgrade(request), { status: "blocked" });
  assert.equal(savedItems().length, 2);
  assert.deepEqual(savedItem(id)?.upgrade, record);
  assert.equal(saved<{ nonce: number }>(FAIR).nonce, nonce + 1);
});

test("받기와 겹쳐도 한 상품은 한 번만 쓰인다: 받은 상품은 걸 수 없고, 건 상품은 받을 수 없다", async () => {
  // 받기가 먼저
  let s = seed();
  await nextDraw(true, s.option.chanceUnits);
  let [taken, upgraded] = await Promise.all([take.settleTakeMany([s.id]), settle.settleUpgrade(s.request)]);
  assert.equal(taken.status, "settled");
  assert.equal(upgraded.status, "blocked");
  assert.equal(savedItem(s.id)?.status, "SOLD");
  assert.equal(savedItems().length, 1);
  assert.equal(savedWallet().balance, 145);
  // 업그레이드가 먼저
  s = seed();
  await nextDraw(true, s.option.chanceUnits);
  const both = await Promise.all([settle.settleUpgrade(s.request), take.settleTakeMany([s.id])]);
  upgraded = both[0]; taken = both[1];
  assert.equal(upgraded.status, "won");
  assert.equal(taken.status, "failed");
  assert.equal(savedItem(s.id)?.status, "UPGRADED");
  assert.equal(savedWallet().balance, 50);
});

test("걸 수 없는 것: 화면이 본 확률과 다르면, 목표가 카탈로그에 없으면, 확인 필요 상품이면 아무것도 바꾸지 않는다", async () => {
  const { id, option, request } = seed();
  await nextDraw(true, option.chanceUnits);
  const untouched = () => { assert.equal(savedItem(id)?.status, "IN_STORAGE"); assert.equal(savedItems().length, 1); assert.equal(saved<{ nonce: number }>(FAIR).nonce, useFairStore.getState().nonce); };
  const nonce = useFairStore.getState().nonce;
  assert.deepEqual(await settle.settleUpgrade({ ...request, chanceUnits: option.chanceUnits + 1 }), { status: "blocked" });
  assert.deepEqual(await settle.settleUpgrade({ ...request, targetItemId: "no-such-item" }), { status: "blocked" });
  assert.deepEqual(await settle.settleUpgrade({ ...request, stakeOwnedId: "own_missing" }), { status: "blocked" });
  // 상품가가 건 상품보다 싼 상품은 목표가 될 수 없다
  const cheap = up.upgradePool()[0];
  assert.deepEqual(await settle.settleUpgrade({ ...request, targetItemId: cheap.item.id, chanceUnits: 9000 }), { status: "blocked" });
  untouched();
  assert.equal(useFairStore.getState().nonce, nonce);
  // 받기의 확인 대기 표시가 남은 상품(확인 필요)은 걸 수 없다
  disk.set(TAKE_MARKS, JSON.stringify([{ ids: [id] }]));
  assert.equal(settle.canStake(memoryItem(id)!), false);
  assert.deepEqual(await settle.settleUpgrade(request), { status: "blocked" });
  untouched();
  disk.delete(TAKE_MARKS);
  assert.equal((await settle.settleUpgrade(request)).status, "won");
});

for (const mode of ["ignore", "throw"] as const) {
  test(`보관함 저장이 실패(${mode === "ignore" ? "조용히 빠짐" : "던짐"}): 실행하지 못했다고 답하고, 그 말이 사실이다. 결과를 말하지 않는다. 다시 걸 수 있다`, async () => {
    const { id, option, request } = seed();
    const nonce = await nextDraw(true, option.chanceUnits);
    fault = { key: INVENTORY, mode, when: hasUpgraded };
    const out = await settle.settleUpgrade(request);
    assert.deepEqual(out, { status: "failed" });
    // 저장된 장부도, 화면이 보는 기억 속 장부도 걸기 전 그대로다
    assert.equal(savedItem(id)?.status, "IN_STORAGE");
    assert.equal(savedItem(id)?.upgrade, undefined);
    assert.equal(savedItems().length, 1);
    assert.equal(memoryItem(id)?.status, "IN_STORAGE");
    assert.equal(memoryItem(id)?.upgrade, undefined);
    assert.equal(useInventoryStore.getState().items.length, 1);
    assert.equal(disk.has(MARKS), false);
    assert.equal(settle.canStake(memoryItem(id)!), true);
    // 쓴 회차는 버린다. 다시 걸면 새 회차로 추첨한다
    await recover();
    await nextDraw(false, option.chanceUnits, nonce + 1);
    const retry = await settle.settleUpgrade(request);
    assert.equal(retry.status, "lost");
    assert.ok(recordOf(retry).nonce > nonce);
    assert.equal(savedItems().length, 1);
  });
}

test("건 뒤에 저장된 장부를 다시 읽지 못함: 성공이라고도 실패라고도 하지 않는다(확인 필요). 읽을 수 있게 되면 저장된 기록대로 풀린다", async () => {
  for (const want of [true, false]) {
    const { id, option, request } = seed();
    await nextDraw(want, option.chanceUnits);
    // 장부를 바꾼 뒤의 읽기만 실패한다
    readFault = (name) => name === INVENTORY && hasUpgraded(disk.get(INVENTORY) ?? "");
    const out = await settle.settleUpgrade(request);
    assert.deepEqual(out, { status: "unknown" });
    // 표시가 남았다. 건 상품도 목표 상품도 확인 필요다: 걸 수 없고 받을 수 없다
    const mark = JSON.parse(disk.get(MARKS)!)[0] as { id: string; stake: string; target: string };
    assert.equal(mark.stake, id);
    const ledger = take.currentTakeLedger();
    assert.ok(ledger.hold.has(id) && ledger.hold.has(mark.target));
    // 화면의 기준도 같다: 기억 속에서는 이미 사라진 상품(UPGRADED)이지만 확인 필요로 보인다
    assert.equal(memoryItem(id)?.status, "UPGRADED");
    assert.equal(take.takeStateOf(memoryItem(id)!, ledger), "unconfirmed");
    assert.ok(settle.upgradeDoubtIds().has(id));
    assert.equal(take.heldForTake(useInventoryStore.getState().items).length, 0);
    assert.deepEqual(await settle.settleUpgrade(request), { status: "unknown" });
    assert.equal((await take.settleTakeMany([id, mark.target])).status, "unknown");
    readFault = null;
    assert.equal(savedWallet().balance, 50);
    // 다시 볼 때: 저장된 장부에 이 추첨의 기록이 있으므로 적용된 것으로 확정한다. 다시 추첨하지 않는다
    const nonce = saved<{ nonce: number }>(FAIR).nonce;
    await settle.reviewUpgradeMarks();
    assert.equal(disk.has(MARKS), false);
    assert.equal(saved<{ nonce: number }>(FAIR).nonce, nonce);
    assert.equal(savedItem(id)?.status, "UPGRADED");
    assert.equal(savedItem(id)?.upgrade?.id, mark.id);
    assert.equal(savedItem(id)?.upgrade?.won, want);
    assert.equal(!!savedItem(mark.target), want);
    assert.equal(memoryItem(id)?.status, "UPGRADED");
    assert.equal(take.heldForTake(useInventoryStore.getState().items).length, want ? 1 : 0);
  }
});

test("표시만 남고 장부는 바뀌지 않은 채 끊김(탭이 닫힘): 다시 볼 때 적용 안 된 것으로 풀리고, 상품은 다시 걸 수 있다", async () => {
  const { id, option, request } = seed();
  disk.set(MARKS, JSON.stringify([{ id: "up_interrupted", stake: id, target: "own_up_interrupted" }]));
  assert.equal(settle.canStake(memoryItem(id)!), false);
  await settle.reviewUpgradeMarks();
  assert.equal(disk.has(MARKS), false);
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
  assert.equal(settle.canStake(memoryItem(id)!), true);
  // 표시를 다시 보지 않고 바로 걸어도 그 안에서 같은 판정을 한다
  disk.set(MARKS, JSON.stringify([{ id: "up_interrupted", stake: id, target: "own_up_interrupted" }]));
  await nextDraw(true, option.chanceUnits);
  assert.equal((await settle.settleUpgrade(request)).status, "won");
  assert.equal(disk.has(MARKS), false);
});

test("표시를 적지 못함: 걸지 않는다. 장부는 그대로다", async () => {
  const { id, option, request } = seed();
  await nextDraw(true, option.chanceUnits);
  fault = { key: MARKS, mode: "ignore", when: () => true };
  assert.deepEqual(await settle.settleUpgrade(request), { status: "failed" });
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
  assert.equal(memoryItem(id)?.status, "IN_STORAGE");
  assert.equal(savedItems().length, 1);
  fault = { key: MARKS, mode: "throw", when: () => true };
  assert.deepEqual(await settle.settleUpgrade(request), { status: "failed" });
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
});

test("회차를 쓴 것이 저장되지 않음: 걸지 않는다(저장되지 않은 회차는 다음 개봉이 다시 쓴다)", async () => {
  const { id, option, request } = seed();
  const nonce = await nextDraw(true, option.chanceUnits);
  fault = { key: FAIR, mode: "ignore", when: () => true };
  assert.deepEqual(await settle.settleUpgrade(request), { status: "failed" });
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
  assert.equal(memoryItem(id)?.status, "IN_STORAGE");
  assert.equal(savedItems().length, 1);
  assert.equal(saved<{ nonce: number }>(FAIR).nonce, nonce);
  assert.equal(disk.has(MARKS), false);
});

test("끝난 뒤 표시를 지우지 못함: 화면이 확인 필요로 보여 줄 것이므로 답도 알 수 없다로 맞춘다. 지워지면 저장된 기록대로다", async () => {
  const { id, option, request } = seed();
  await nextDraw(true, option.chanceUnits);
  removeFault = (name) => name === MARKS;
  assert.deepEqual(await settle.settleUpgrade(request), { status: "unknown" });
  assert.equal(savedItem(id)?.status, "UPGRADED");
  assert.equal(take.heldForTake(useInventoryStore.getState().items).length, 0);
  removeFault = null;
  await settle.reviewUpgradeMarks();
  assert.equal(disk.has(MARKS), false);
  assert.equal(savedItems().length, 2);
  assert.equal(take.heldForTake(useInventoryStore.getState().items).length, 1);
});

test("저장된 장부를 처음부터 읽지 못함: 아무것도 하지 않고 알 수 없다고 답한다", async () => {
  const { id, option, request } = seed();
  const nonce = await nextDraw(true, option.chanceUnits);
  readFault = (name) => name === INVENTORY;
  assert.deepEqual(await settle.settleUpgrade(request), { status: "unknown" });
  readFault = null;
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
  assert.equal(saved<{ nonce: number }>(FAIR).nonce, nonce);
  assert.equal(disk.has(MARKS), false);
  // 표시를 읽지 못해도 같다
  disk.set(MARKS, "not json");
  assert.deepEqual(await settle.settleUpgrade(request), { status: "unknown" });
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
  assert.equal((await take.settleTakeMany([id])).status, "unknown");
  disk.delete(MARKS);
  assert.equal((await settle.settleUpgrade(request)).status, "won");
});

// ── 두 번째 라운드(flow/REVIEW_codex-4.md 2.4, 2.5): 회차 예약, 계정 전환, 잠금 없는 브라우저, 배송 ──

test("박스 개봉도 회차 예약이 저장된 것을 확인한다: 저장되지 않으면 열지 않고, 돈도 보관함도 그대로다", async () => {
  const { createOpeningPurchase } = await import("../lib/opening");
  const { BOXES } = await import("../lib/products");
  const box = BOXES.find((b) => b.slug === physical.box.slug)!;
  for (const mode of ["ignore", "throw"] as const) {
    seed();
    useWalletStore.setState({ cryptoBalance: 100000, cardBalance: 0, balance: 100000, transactions: [] });
    useFairStore.setState({ nonce: 4 });
    fault = { key: FAIR, mode, when: () => true };
    await assert.rejects(createOpeningPurchase(box, 3)(), /reservation/);
    fault = null;
    assert.equal(savedWallet().balance, 100000);
    assert.equal(savedWallet().transactions.length, 0);
    assert.equal(savedItems().length, 1);
    assert.equal(useWalletStore.getState().balance, 100000);
    assert.equal(useInventoryStore.getState().items.length, 1);
    assert.equal(saved<{ nonce: number }>(FAIR).nonce, 4);
  }
});

test("개봉과 업그레이드는 한 계수기에서 예약한다: 저장된 값 위에서 받고, 서로 겹치지 않는다", async () => {
  const { createOpeningPurchase } = await import("../lib/opening");
  const { BOXES } = await import("../lib/products");
  const box = BOXES.find((b) => b.slug === physical.box.slug)!;
  const { option, request } = seed();
  useWalletStore.setState({ cryptoBalance: 100000, cardBalance: 0, balance: 100000, transactions: [] });
  // 다른 탭이 회차를 5 까지 올려 저장했다. 이 탭의 기억 속 값은 0 으로 뒤처져 있다
  disk.set(FAIR, JSON.stringify({ state: { serverSeed: SERVER, serverSeedHash: SERVER_HASH, clientSeed: CLIENT, nonce: 5 }, version: 0 }));
  assert.equal(useFairStore.getState().nonce, 0);
  const opened = await createOpeningPurchase(box, 2)();
  assert.deepEqual(opened.map((r) => r.nonce), [5, 6]);
  const upgraded = recordOf(await settle.settleUpgrade(request));
  assert.equal(upgraded.nonce, 7);
  assert.equal(upgraded.chanceUnits, option.chanceUnits);
  const again = await createOpeningPurchase(box, 1)();
  assert.deepEqual(again.map((r) => r.nonce), [8]);
  assert.equal(saved<{ nonce: number }>(FAIR).nonce, 9);
  // 보관함의 추첨마다 (시드 쌍, 회차)가 다르다. 성공한 업그레이드의 목표 상품은 그 추첨을 가리킬 뿐 따로 뽑은 것이 아니라 세지 않는다
  const draws = [
    ...savedItems().filter((item) => !item.upgradedFrom && item.fair.serverSeed === SERVER).map((item) => item.fair.clientSeed + "|" + item.fair.nonce),
    ...savedItems().flatMap((item) => (item.upgrade ? [item.upgrade.clientSeed + "|" + item.upgrade.nonce] : [])),
  ];
  assert.equal(new Set(draws).size, draws.length);
  assert.equal(draws.length, 4);
});

/** 다른 계정으로 바꾼다(lib/browserWallet 이 하는 그대로: 지갑과 보관함의 저장 키와 기억 속 장부가 그 계정의 것이 된다) */
const switchTo = (userId: string): void => restoreBrowserAssets(userId);
/** 처음 계정으로 돌아온다 */
async function switchBack(): Promise<void> {
  onRead = null;
  useWalletStore.persist.setOptions({ name: WALLET });
  useInventoryStore.persist.setOptions({ name: INVENTORY });
  await Promise.all([useWalletStore.persist.rehydrate(), useInventoryStore.persist.rehydrate()]);
}
const keysWith = (prefix: string) => Array.from(disk.keys()).filter((key) => key.startsWith(prefix));

test("회차를 예약하는 사이에 계정이 바뀜: 걸지 않는다. 표시도 보관함도 어느 계정에도 적지 않는다", async () => {
  const { id, option, request } = seed();
  await nextDraw(true, option.chanceUnits);
  const before = disk.get(INVENTORY);
  let armed = true;
  // 저장된 회차를 읽는 순간(예약 안의 기다리는 자리)에 계정이 바뀐다
  onRead = (name) => { if (armed && name === FAIR) { armed = false; switchTo("other-account"); } };
  try {
    const out = await settle.settleUpgrade(request);
    assert.deepEqual(out, { status: "failed" });
    assert.equal(armed, false);
    assert.notEqual(useInventoryStore.persist.getOptions().name, INVENTORY);
    // 처음 계정: 저장된 보관함이 그대로다. 표시가 없다
    assert.equal(disk.get(INVENTORY), before);
    assert.deepEqual(keysWith("voila.upgrade-unconfirmed."), []);
    // 바뀐 계정: 건 상품도 목표 상품도 들어가지 않았다
    const other = useInventoryStore.persist.getOptions().name!;
    assert.deepEqual(parseLedger<{ items?: OwnedItem[] }>(disk.get(other) ?? "{}")?.state.items ?? [], []);
    assert.equal(useInventoryStore.getState().items.length, 0);
  } finally { await switchBack(); }
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
  assert.equal(memoryItem(id)?.status, "IN_STORAGE");
  assert.equal(settle.canStake(memoryItem(id)!), true);
});

test("건 뒤 다시 읽는 사이에 계정이 바뀜: 알 수 없다고 답하고 바뀐 계정의 장부를 건드리지 않는다. 표시는 처음 계정의 키에 남고, 돌아오면 풀린다", async () => {
  const { id, option, request } = seed();
  await nextDraw(true, option.chanceUnits);
  let armed = true;
  // 보관함을 쓴 뒤의 다시 읽기에서 계정이 바뀐다
  onRead = (name) => { if (armed && name === INVENTORY && hasUpgraded(disk.get(INVENTORY) ?? "")) { armed = false; switchTo("other-account"); } };
  let other = "";
  try {
    const out = await settle.settleUpgrade(request);
    assert.deepEqual(out, { status: "unknown" });
    assert.equal(armed, false);
    other = useInventoryStore.persist.getOptions().name!;
    assert.notEqual(other, INVENTORY);
    // 표시는 처음 계정의 키에만 있다
    assert.deepEqual(keysWith("voila.upgrade-unconfirmed."), [MARKS]);
    // 바뀐 계정의 보관함에는 처음 계정의 상품이 하나도 적히지 않았다
    assert.deepEqual(parseLedger<{ items?: OwnedItem[] }>(disk.get(other) ?? "{}")?.state.items ?? [], []);
    assert.equal(useInventoryStore.getState().items.length, 0);
  } finally { await switchBack(); }
  // 처음 계정의 저장된 장부에는 추첨이 적용돼 있다. 돌아와서 다시 보면 표시가 풀린다
  assert.equal(savedItem(id)?.status, "UPGRADED");
  assert.equal(take.heldForTake(useInventoryStore.getState().items).length, 0);
  await settle.reviewUpgradeMarks();
  assert.equal(disk.has(MARKS), false);
  assert.equal(savedItems().length, 2);
  assert.equal(take.heldForTake(useInventoryStore.getState().items).length, 1);
  assert.deepEqual(parseLedger<{ items?: OwnedItem[] }>(disk.get(other) ?? "{}")?.state.items ?? [], []);
});

test("탭 사이의 잠금이 없는 브라우저: 걸지 않는다. 추첨도 하지 않고 회차도 쓰지 않는다", async () => {
  const { lockSource } = await import("../lib/ledgerLock");
  const { id, option, request } = seed();
  const nonce = await nextDraw(true, option.chanceUnits);
  const available = lockSource.available;
  lockSource.available = () => false;
  try {
    assert.deepEqual(await settle.settleUpgrade(request), { status: "nolock" });
  } finally { lockSource.available = available; }
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
  assert.equal(savedItems().length, 1);
  assert.equal(saved<{ nonce: number }>(FAIR).nonce, nonce);
  assert.equal(disk.has(MARKS), false);
  assert.equal((await settle.settleUpgrade(request)).status, "won");
});

test("확인 필요 상품은 배송도 신청할 수 없다: 받기의 표시든 업그레이드의 표시든 접수 요청을 보내기 전에 거른다", async () => {
  const { requestShipment } = await import("../lib/claim");
  const address = { recipient: "수령인", country: "KR", phone: "01000000000", postalCode: "00000", address: "주소" } as Parameters<typeof requestShipment>[1];
  const { id } = seed();
  const ship = () => requestShipment([id], address, 0, "key");
  // 표시가 없으면 자격 검사를 지나 접수 단계까지 간다(이 테스트에는 계정 서비스가 없어 거기서 멈춘다)
  await assert.rejects(ship(), (error: Error) => error.message !== "invalid-shipping-items");
  disk.set(TAKE_MARKS, JSON.stringify([{ ids: [id] }]));
  await assert.rejects(ship(), /invalid-shipping-items/);
  disk.delete(TAKE_MARKS);
  disk.set(MARKS, JSON.stringify([{ id: "up_x", stake: id, target: "own_up_x", dev: true }]));
  await assert.rejects(ship(), /invalid-shipping-items/);
  // 업그레이드로 들어올 목표 상품의 자리에 표시가 걸려 있어도 같다
  disk.set(MARKS, JSON.stringify([{ id: "up_y", stake: "own_other", target: id, dev: true }]));
  await assert.rejects(ship(), /invalid-shipping-items/);
  disk.delete(MARKS);
  await assert.rejects(ship(), (error: Error) => error.message !== "invalid-shipping-items");
  assert.equal(savedItem(id)?.status, "IN_STORAGE");
});
