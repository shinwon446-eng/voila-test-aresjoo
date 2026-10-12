// 지갑 내역에 보일 거래(migration-audit/PARITY_ISSUES.md E-06).
// 박스 열기, USDT 결과, USDT로 받기, 배송비 환불은 계정 번호 없이 적힌다(lib/opening, lib/claim). 지갑 화면이 계정 번호가 같은 것만
// 골라서 그 거래들이 내역에 나오지 않았다. 장부 키가 계정별이므로, 지금 장부가 이 계정의 것이면 번호 없는 거래도 이 계정의 거래다.
// 다른 계정의 거래가 섞이지 않는 것, 저장된 기록을 고쳐 쓰지 않는 것도 본다.
// 이 파일은 실제 스토어에 기억 속 저장소를 붙인다(파일과 브라우저 저장소는 건드리지 않는다).
//   npm test
import test, { before } from "node:test";
import assert from "node:assert/strict";
import type { Transaction } from "../stores/walletStore";

const disk = new Map<string, string>();
const storage = { getItem: (name: string) => disk.get(name) ?? null, setItem: (name: string, value: string) => { disk.set(name, value); }, removeItem: (name: string) => { disk.delete(name); } };

// 스토어는 만들어질 때 저장소를 잡는다. 그래서 저장소를 먼저 놓고 그 뒤에 모듈을 불러온다
let useWalletStore: typeof import("../stores/walletStore").useWalletStore;
let useInventoryStore: typeof import("../stores/inventoryStore").useInventoryStore;
let useFairStore: typeof import("../stores/fairStore").useFairStore;
let wallet: typeof import("../lib/browserWallet");
let createOpeningPurchase: typeof import("../lib/opening").createOpeningPurchase;
let takeUsdt: typeof import("../lib/claim").takeUsdt;
let physicalBox: import("../lib/products").ProductBox;
before(async () => {
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
  ({ useWalletStore } = await import("../stores/walletStore"));
  ({ useInventoryStore } = await import("../stores/inventoryStore"));
  ({ useFairStore } = await import("../stores/fairStore"));
  wallet = await import("../lib/browserWallet");
  ({ createOpeningPurchase } = await import("../lib/opening"));
  ({ takeUsdt } = await import("../lib/claim"));
  const { BOXES } = await import("../lib/products");
  const item = BOXES.flatMap((b) => b.items).find((i) => i.kind === "physical")!;
  physicalBox = { ...BOXES[0], price: 10, guaranteedMin: 2, items: [{ ...item, value: 100, dropRate: 100 }] };
});

const A = "account-a", B = "account-b";
const keyOf = (id: string) => "voila.browser-wallet." + id;
const types = (rows: Transaction[]) => rows.map((x) => x.type).sort();
const ids = (rows: Transaction[]) => rows.map((x) => x.id).sort();

/** 계정 A 로 들어와 보너스를 받고, 박스를 하나 열고, 나온 상품을 USDT로 받는다(화면이 하는 것과 같은 함수들) */
async function playAsA() {
  // 앞 테스트가 남긴 것을 비운다: 저장소를 비우고, 손님 장부를 거쳐 A 의 빈 장부로 들어온다
  disk.clear();
  wallet.restoreBrowserAssets(null);
  wallet.restoreBrowserAssets(A);
  useFairStore.setState({ serverSeed: "a".repeat(128), serverSeedHash: "hash", clientSeed: "history-test", nonce: 0 });
  const w = useWalletStore.getState();
  w.setWelcomeAccount(A); assert.equal(w.claimWelcome(A), true);
  const results = await createOpeningPurchase(physicalBox, 1)();
  assert.equal(takeUsdt([results[0].ownedId]).ids.length, 1);
  return useWalletStore.getState().transactions;
}

test("E-06 이 계정의 장부에 든 박스 열기와 USDT로 받기 거래가 내역에 나온다(계정 번호가 없어도)", async () => {
  const all = await playAsA();
  assert.deepEqual(types(all), ["bonus", "open", "sellback"]);
  assert.deepEqual(all.filter((x) => x.accountId !== undefined).map((x) => x.type), ["bonus"], "번호가 적힌 것은 보너스뿐이다(열기와 받기는 번호 없이 적힌다)");
  // 고치기 전의 화면이 쓰던 조건으로는 보너스 한 줄만 남는다
  assert.deepEqual(types(all.filter((x) => x.accountId === A)), ["bonus"]);
  const rows = wallet.accountTransactions(all, A);
  assert.deepEqual(types(rows), ["bonus", "open", "sellback"]);
  assert.deepEqual(ids(rows), ids(all), "이 장부의 거래를 빠짐없이, 겹치지 않게 보여 준다");
});

test("E-06 다른 계정으로 바뀌면 앞 계정의 거래는 하나도 보이지 않는다", async () => {
  const ofA = await playAsA();
  const savedA = disk.get(keyOf(A));
  // 계정은 B 로 바뀌었는데 장부는 아직 A 의 것인 순간(로그인 직후, 장부를 바꾸기 전의 한 번의 렌더): 번호 없는 거래를 B 의 것으로 보지 않는다
  assert.deepEqual(wallet.accountTransactions(ofA, B), []);
  // 장부가 B 의 것으로 바뀐 뒤: B 의 장부에는 A 의 거래가 없다
  wallet.restoreBrowserAssets(B);
  const ofB = useWalletStore.getState().transactions;
  assert.deepEqual(wallet.accountTransactions(ofB, B), []);
  assert.equal(useWalletStore.getState().balance, 0);
  // 혹시 A 의 거래 배열이 B 의 장부 아래에서 건네져도(늦은 렌더) A 의 번호가 적힌 것과 번호 없는 것 가운데 B 것으로 보이는 것은 없어야 한다
  assert.deepEqual(wallet.accountTransactions(ofA.filter((x) => x.accountId !== undefined), B), []);
  // B 가 연 것은 B 에게만 보인다
  useWalletStore.getState().credit(50);
  useFairStore.setState({ serverSeed: "b".repeat(128), serverSeedHash: "hash", clientSeed: "history-test-b", nonce: 0 });
  await createOpeningPurchase(physicalBox, 1)();
  const rowsB = wallet.accountTransactions(useWalletStore.getState().transactions, B);
  assert.deepEqual(types(rowsB), ["open"]);
  assert.ok(rowsB.every((x) => !ofA.some((a) => a.id === x.id)));
  // A 의 저장된 장부는 한 글자도 바뀌지 않았다(저장된 기록을 고쳐 쓰지 않는다)
  assert.equal(disk.get(keyOf(A)), savedA);
  // A 로 돌아오면 A 의 거래 셋이 그대로 보이고 B 의 것은 없다
  wallet.restoreBrowserAssets(A);
  const back = wallet.accountTransactions(useWalletStore.getState().transactions, A);
  assert.deepEqual(ids(back), ids(ofA));
  assert.equal(disk.get(keyOf(A)), savedA);
});

test("E-06 다른 계정 번호가 적힌 거래는 이 계정의 장부에 들어 있어도 보이지 않는다", async () => {
  await playAsA();
  useWalletStore.getState().addTransaction({ type: "bonus", amountUsdt: 1, ref: "welcome", accountId: B });
  const rows = wallet.accountTransactions(useWalletStore.getState().transactions, A);
  assert.ok(rows.every((x) => x.accountId === A || x.accountId === undefined));
  assert.equal(rows.length, 3);
});

test("E-06 계정별 장부가 아닐 때(서버 계정의 공용 장부 키)는 전처럼 계정 번호가 같은 거래만 보인다", async () => {
  const ofA = await playAsA();
  useWalletStore.persist.setOptions({ name: "gachaflix.wallet" });
  try { assert.deepEqual(types(wallet.accountTransactions(ofA, A)), ["bonus"]); }
  finally { useWalletStore.persist.setOptions({ name: keyOf(A) }); }
});
