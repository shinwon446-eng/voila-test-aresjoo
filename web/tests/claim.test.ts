// 받기(USDT로 받기, 배송 신청 취소)의 중복과 사전 검사
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import { cancelShipment, takeUsdt } from "../lib/claim";
import { BOXES, REFUND_RATE } from "../lib/products";
import { useInventoryStore } from "../stores/inventoryStore";
import { useWalletStore } from "../stores/walletStore";

const physical = BOXES.flatMap((b) => b.items.map((item) => ({ item, box: b }))).find((x) => x.item.kind === "physical")!;

function seed(value = 100) {
  useWalletStore.setState({ cryptoBalance: 0, cardBalance: 0, balance: 0, transactions: [] });
  useInventoryStore.setState({ items: [] });
  const [owned] = useInventoryStore.getState().add([{ itemId: physical.item.id, boxSlug: physical.box.slug, valueUsdt: value, tier: "royal", fair: { serverSeed: "s", serverSeedHash: "h", clientSeed: "c", nonce: 0, roll: 0 } }]);
  return owned;
}

test("USDT로 받기는 한 번만 잔액에 들어온다: 같은 상품을 다시 불러도 다시 주지 않는다", () => {
  const owned = seed(100);
  const first = takeUsdt([owned.id]);
  assert.deepEqual(first.ids, [owned.id]);
  assert.equal(first.totalUsdt, +(100 * REFUND_RATE).toFixed(2));
  assert.equal(useWalletStore.getState().cryptoBalance, first.totalUsdt);
  assert.equal(useWalletStore.getState().transactions.filter((x) => x.type === "sellback").length, 1);

  const again = takeUsdt([owned.id]);
  assert.deepEqual(again.ids, []);
  assert.equal(again.totalUsdt, 0);
  assert.equal(useWalletStore.getState().cryptoBalance, first.totalUsdt);
  assert.equal(useWalletStore.getState().transactions.filter((x) => x.type === "sellback").length, 1);
  assert.equal(useInventoryStore.getState().items[0].status, "SOLD");
});

test("배송 신청 취소는 신청 상태이고 출고 전인 상품만 받는다", async () => {
  const owned = seed();
  await assert.rejects(() => cancelShipment(owned), /notPreparing/);

  useInventoryStore.setState((s) => ({ items: s.items.map((o) => ({ ...o, status: "SHIPPING_REQUESTED" as const, shipping: { address: { recipient: "QA", country: "KR" as const, phone: "010-0000-0000", postalCode: "00000", address: "시험 주소 1" }, feeUsdt: 0, requestedAt: new Date().toISOString(), shippedAt: new Date().toISOString() } })) }));
  await assert.rejects(() => cancelShipment(useInventoryStore.getState().items[0]), /notPreparing/);
  assert.equal(useInventoryStore.getState().items[0].status, "SHIPPING_REQUESTED");
});

test("배송비를 냈는데 환불 근거(신청 번호, 자금 출처)가 없으면 취소를 받지 않는다", async () => {
  seed();
  useInventoryStore.setState((s) => ({ items: s.items.map((o) => ({ ...o, status: "SHIPPING_REQUESTED" as const, shipping: { address: { recipient: "QA", country: "KR" as const, phone: "010-0000-0000", postalCode: "00000", address: "시험 주소 1" }, feeUsdt: 5, requestedAt: new Date().toISOString() } })) }));
  await assert.rejects(() => cancelShipment(useInventoryStore.getState().items[0]), /unknownFee/);
  assert.equal(useWalletStore.getState().cryptoBalance, 0);
});
