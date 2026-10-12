// 출금 내역과 환불(migration-audit/PARITY_ISSUES.md E-01): 잔액에서 실제로 차감한 금액만 취소나 실패 때 돌려준다.
// 감사가 재현한 것: 잔액 0 에서 차감이 실패했는데 출금 내역이 생기고, 그것을 취소하니 잔액이 30 이 됐다.
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import { isOpenUndebitedWithdrawal, useWalletStore } from "../stores/walletStore";

const reset = (crypto = 0, card = 0) => useWalletStore.setState({ balance: crypto + card, cryptoBalance: crypto, cardBalance: card, transactions: [], settledDepositRefs: [], totalDeposited: 0, totalDepositedCrypto: 0, totalDepositedCard: 0, totalWagered: 0 });
const now = () => useWalletStore.getState();
const draft = (amount: number, status: "PENDING" | "PENDING_72H_HOLD" | "CANCELLED" | "FAILED" = "PENDING") =>
  ({ type: "withdraw" as const, accountId: "acct", serverId: "srv-" + amount + "-" + status, amountUsdt: -amount, status, network: "TRC20" as const, address: "T" + "1".repeat(33) });

test("E-01 차감하지 못한 출금은 내역을 만들지 않는다(잔액 0, 금액 30)", () => {
  reset(0);
  const recorded = now().recordWithdrawal(draft(30));
  assert.equal(recorded, null, "차감하지 못했는데 출금 내역을 만들었다");
  assert.equal(now().transactions.length, 0);
  assert.equal(now().cryptoBalance, 0); assert.equal(now().balance, 0);
});

test("E-01 카드로 충전한 몫만 있으면 차감하지 못하고, 내역도 생기지 않는다(출금은 암호화폐 잔액에서만 나간다)", () => {
  reset(0, 100);
  assert.equal(now().recordWithdrawal(draft(30)), null);
  assert.equal(now().transactions.length, 0);
  assert.equal(now().cardBalance, 100); assert.equal(now().cryptoBalance, 0);
});

test("E-01 차감하지 않았다고 적힌 출금은 취소되거나 실패해도 환불하지 않는다(감사의 재현: 0 이 30 이 되던 것)", () => {
  for (const end of ["CANCELLED", "FAILED"] as const) {
    reset(0);
    const debited = now().debitCrypto(30);
    assert.equal(debited, false);
    const tx = now().addTransaction({ ...draft(30), debited });
    now().syncWithdrawal(tx.id, end);
    assert.equal(now().cryptoBalance, 0, end + ": 차감한 적 없는 금액이 잔액에 생겼다");
    assert.equal(now().transactions[0].status, end, "상태는 서비스가 준 대로 바뀐다");
    now().syncWithdrawal(tx.id, end);
    assert.equal(now().cryptoBalance, 0);
  }
  // 72시간 대기 건을 본인이 취소하는 길도 같다
  reset(0);
  const held = now().addTransaction({ ...draft(30, "PENDING_72H_HOLD"), debited: false });
  assert.equal(now().cancelHeldWithdrawal(held.id), true);
  assert.equal(now().cryptoBalance, 0, "차감한 적 없는 금액이 잔액에 생겼다");
  assert.equal(now().transactions[0].status, "CANCELLED");
});

test("E-01 보통의 길: 차감하고 내역을 만들며, 취소하면 차감한 만큼만 한 번 돌아온다", () => {
  reset(100, 40);
  const tx = now().recordWithdrawal(draft(30));
  assert.ok(tx);
  assert.equal(tx.debited, true);
  assert.equal(tx.amountUsdt, -30); assert.equal(tx.status, "PENDING"); assert.equal(tx.accountId, "acct");
  assert.equal(now().cryptoBalance, 70); assert.equal(now().cardBalance, 40); assert.equal(now().balance, 110);
  now().syncWithdrawal(tx.id, "CANCELLED"); now().syncWithdrawal(tx.id, "CANCELLED"); now().syncWithdrawal(tx.id, "FAILED");
  assert.equal(now().cryptoBalance, 100, "환불은 한 번, 차감한 만큼");
  assert.equal(now().cardBalance, 40, "환불은 암호화폐 잔액으로만 돌아온다");
  assert.equal(now().transactions[0].status, "CANCELLED");
});

test("E-01 보통의 길: 72시간 대기 건의 본인 취소도 차감한 만큼만 한 번 돌아온다", () => {
  reset(100);
  const tx = now().recordWithdrawal({ ...draft(60, "PENDING_72H_HOLD"), unlockAt: Date.now() + 1000 });
  assert.ok(tx);
  assert.equal(now().cryptoBalance, 40);
  assert.equal(now().cancelHeldWithdrawal(tx.id), true);
  assert.equal(now().cancelHeldWithdrawal(tx.id), false);
  assert.equal(now().cryptoBalance, 100);
});

test("E-01 서비스가 이미 취소나 실패로 돌려준 건은 차감하지 않고 내역만 남기며, 환불도 없다", () => {
  for (const end of ["CANCELLED", "FAILED"] as const) {
    reset(100);
    const tx = now().recordWithdrawal(draft(30, end));
    assert.ok(tx, end);
    assert.equal(tx.debited, false);
    assert.equal(now().cryptoBalance, 100, end + ": 끝난 건을 차감했다");
    now().syncWithdrawal(tx.id, "CANCELLED");
    assert.equal(now().cryptoBalance, 100);
  }
});

// C1-P1-01(migration-audit/CYCLE1_codex.md): 서비스는 출금을 접수했는데 이쪽 차감이 실패한 경우. 접수 번호를 잃지 않게 차감하지 않은 내역으로 적어 두고,
// 취소가 확인될 때까지 열린 채로 둔다. 아래는 출금 화면이 하는 차례를 스토어에서 그대로 밟는다(화면은 scripts/capture/flow-withdraw.mjs 가 본다).
const failedDebit = (amount: number, status: "PENDING" | "PENDING_72H_HOLD" = "PENDING_72H_HOLD") => {
  assert.equal(now().recordWithdrawal(draft(amount, status)), null, "차감하지 못해야 하는 경우다");
  return now().addTransaction({ ...draft(amount, status), debited: false });
};
const stuck = () => now().transactions.some(isOpenUndebitedWithdrawal);

test("C1-P1-01 차감 실패 뒤 취소가 확인되면: 내역은 취소로 끝나고 잔액은 그대로다(환불 없음)", () => {
  reset(0);
  const row = failedDebit(30);
  assert.equal(row.serverId, "srv-30-PENDING_72H_HOLD", "서비스의 접수 번호를 잃지 않는다");
  assert.equal(stuck(), true, "취소가 확인되기 전에는 열린 요청이다");
  assert.equal(now().cryptoBalance, 0);
  now().syncWithdrawal(row.id, "CANCELLED");
  assert.equal(now().transactions[0].status, "CANCELLED");
  assert.equal(now().cryptoBalance, 0, "차감한 적 없는 금액을 환불했다");
  assert.equal(stuck(), false);
});

test("C1-P1-01 차감 실패 뒤 취소가 실패하면: 내역이 열린 채 남고, 나중에 지갑 내역에서 취소해도 환불하지 않는다", () => {
  for (const status of ["PENDING", "PENDING_72H_HOLD"] as const) {
    reset(0);
    const row = failedDebit(30, status);
    // 취소 요청이 실패했다: 아무것도 바뀌지 않는다. 내역은 서비스가 준 상태 그대로 남는다
    assert.equal(now().transactions.length, 1);
    assert.equal(now().transactions[0].status, status);
    assert.equal(stuck(), true);
    // 그 사이에 잔액이 다시 생겨도 열린 요청은 그대로다
    now().credit(100);
    assert.equal(stuck(), true);
    // 지갑 내역에서 취소(서비스가 취소를 확인): 환불 없이 취소로 끝난다. 두 번 맞춰도 같다
    now().syncWithdrawal(row.id, "CANCELLED"); now().syncWithdrawal(row.id, "CANCELLED");
    assert.equal(now().cryptoBalance, 100, status + ": 차감한 적 없는 금액을 환불했다");
    assert.equal(now().transactions.find((x) => x.id === row.id)?.status, "CANCELLED");
    assert.equal(stuck(), false);
  }
});

test("C1-P1-01 열린 요청이 남아 있는 동안 같은 접수를 다시 적어도 차감하거나 내역을 더하지 않는다", () => {
  reset(0);
  const row = failedDebit(30);
  now().credit(100);
  // 같은 접수 번호가 다시 오면(같은 요청의 재응답) 이미 있는 내역을 돌려준다. 잔액이 생겼어도 이제 와서 차감하지 않는다
  assert.equal(now().recordWithdrawal(draft(30, "PENDING_72H_HOLD"))?.id, row.id);
  assert.equal(now().cryptoBalance, 100);
  assert.equal(now().transactions.length, 1);
  assert.equal(stuck(), true);
});

test("C1-P1-01 열린 요청으로 보는 것은 차감하지 않았고, 접수 번호가 있고, 끝나지 않은 출금뿐이다", () => {
  const base = { id: "t", at: new Date().toISOString(), ...draft(30, "PENDING_72H_HOLD") };
  assert.equal(isOpenUndebitedWithdrawal({ ...base, debited: false }), true);
  assert.equal(isOpenUndebitedWithdrawal({ ...base, debited: false, status: "PENDING" }), true);
  assert.equal(isOpenUndebitedWithdrawal({ ...base, debited: true }), false, "차감한 보통의 출금");
  assert.equal(isOpenUndebitedWithdrawal({ ...base }), false, "표시가 없는 옛 기록은 전처럼 차감한 것으로 본다");
  assert.equal(isOpenUndebitedWithdrawal({ ...base, debited: false, serverId: undefined }), false, "서비스에 접수된 적이 없다");
  for (const status of ["CANCELLED", "FAILED", "COMPLETED"] as const) assert.equal(isOpenUndebitedWithdrawal({ ...base, debited: false, status }), false, status);
  assert.equal(isOpenUndebitedWithdrawal({ ...base, debited: false, type: "open" }), false);
});

test("C1 guard A 같은 접수 번호로 두 번 적어도 한 번만 차감하고 내역도 하나다", () => {
  reset(100);
  const first = now().recordWithdrawal(draft(30));
  const again = now().recordWithdrawal(draft(30));
  assert.ok(first && again);
  assert.equal(again.id, first.id, "둘째 호출은 이미 있는 내역을 돌려준다");
  assert.equal(now().cryptoBalance, 70, "같은 접수를 두 번 차감했다");
  assert.equal(now().transactions.filter((x) => x.type === "withdraw").length, 1);
  // 접수 번호가 다르면 다른 출금이다
  const other = now().recordWithdrawal({ ...draft(30), serverId: "srv-other" });
  assert.ok(other && other.id !== first.id);
  assert.equal(now().cryptoBalance, 40);
  // 이미 끝난(취소된) 같은 접수 번호를 다시 넘겨도 새로 차감하거나 내역을 더하지 않는다
  now().syncWithdrawal(first.id, "CANCELLED");
  assert.equal(now().cryptoBalance, 70);
  assert.equal(now().recordWithdrawal(draft(30))?.id, first.id);
  assert.equal(now().cryptoBalance, 70);
  assert.equal(now().transactions.filter((x) => x.type === "withdraw").length, 2);
});

test("E-01 표시가 없는 옛 출금 기록은 전처럼 차감한 것으로 보고 환불한다(저장된 기록을 바꾸지 않는다)", () => {
  reset(100);
  assert.equal(now().debitCrypto(30), true);
  const legacy = now().addTransaction(draft(30, "PENDING_72H_HOLD"));
  assert.equal(legacy.debited, undefined);
  now().syncWithdrawal(legacy.id, "FAILED");
  assert.equal(now().cryptoBalance, 100);
});
