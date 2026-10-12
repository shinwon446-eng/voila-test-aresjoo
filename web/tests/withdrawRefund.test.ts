// 출금 내역과 환불(migration-audit/PARITY_ISSUES.md E-01): 잔액에서 실제로 차감한 금액만 취소나 실패 때 돌려준다.
// 감사가 재현한 것: 잔액 0 에서 차감이 실패했는데 출금 내역이 생기고, 그것을 취소하니 잔액이 30 이 됐다.
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import { useWalletStore } from "../stores/walletStore";

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

test("E-01 표시가 없는 옛 출금 기록은 전처럼 차감한 것으로 보고 환불한다(저장된 기록을 바꾸지 않는다)", () => {
  reset(100);
  assert.equal(now().debitCrypto(30), true);
  const legacy = now().addTransaction(draft(30, "PENDING_72H_HOLD"));
  assert.equal(legacy.debited, undefined);
  now().syncWithdrawal(legacy.id, "FAILED");
  assert.equal(now().cryptoBalance, 100);
});
