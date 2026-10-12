// 출금 내역과 환불. 원칙 하나: 잔액에서 차감한 적 없는 금액은 어떤 경우에도 환불하지 않는다.
//   E-01(migration-audit/PARITY_ISSUES.md): 잔액 0 에서 차감이 실패했는데 출금 내역이 생기고, 그것을 취소하니 잔액이 30 이 됐다.
//   C1-P1-01(CYCLE1_codex.md): 서비스가 접수한 요청의 번호를 잃으면 안 된다.
//   C3(CYCLE3_codex.md): 그 요청이 새 출금을 막아서는 안 되고, 원본 코드로 되돌려도 환불돼서는 안 되고, 내역에서 차감한 출금처럼 읽혀서도 안 된다.
// 그래서 차감하지 못한 접수는 "장부 금액이 0 인 출금 줄"로 적는다(신청한 금액은 표시 칸 requestedUsdt 에만 있다).
// 환불은 원본과 같은 식(장부 금액의 절댓값을 더한다)이라, 0 인 줄은 이 코드에서도 원본 코드에서도 환불이 0 이다. 따로 기억할 상태가 없다.
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import { isUndebitedWithdrawal, useWalletStore, type Transaction, type TxStatus } from "../stores/walletStore";
import { api, WithdrawalUnknown } from "../lib/api";
import { AccountError } from "../lib/account";
import { browserAccountRequest } from "../lib/browserAccount";

const reset = (crypto = 0, card = 0) => useWalletStore.setState({ balance: crypto + card, cryptoBalance: crypto, cardBalance: card, transactions: [], settledDepositRefs: [], totalDeposited: 0, totalDepositedCrypto: 0, totalDepositedCard: 0, totalWagered: 0 });
const now = () => useWalletStore.getState();
type Open = "PENDING" | "PENDING_72H_HOLD";
/** 출금 화면이 접수 뒤에 넘기는 것과 같은 꼴(수수료와 받는 금액 포함) */
const draft = (amount: number, status: Open | "CANCELLED" | "FAILED" = "PENDING", accountId = "acct") =>
  ({ type: "withdraw" as const, accountId, serverId: "srv-" + amount + "-" + status, amountUsdt: -amount, status, network: "TRC20" as const, address: "T" + "1".repeat(33), feeUsdt: 1, netUsdt: amount - 1 });

// ── 원본의 환불 식 ─────────────────────────────────────────────────────────────
// 기준 커밋 63445c7 의 web/stores/walletStore.ts 에서 그대로 옮겼다(스토어의 set 과 get 만 상태를 받고 돌려주는 꼴로 바꿨다).
//   syncWithdrawal        197~202줄
//   cancelHeldWithdrawal  220~230줄
//   sync                  131줄
// 배포를 원본으로 되돌리면 이 식이 새 코드가 저장한 줄을 읽는다. 그때도 차감한 적 없는 금액이 환불되면 안 된다(C3-P1-02).
type Ledger = { cryptoBalance: number; cardBalance: number; balance: number; transactions: Transaction[] };
const sync = (cryptoBalance: number, cardBalance: number) => ({ cryptoBalance, cardBalance, balance: +(cryptoBalance + cardBalance).toFixed(2) });
function originalSyncWithdrawal(s: Ledger, id: string, status: TxStatus, patch?: { txHash?: string; unlockAt?: number }): Ledger {
  const tx = s.transactions.find(x => x.id === id);
  if (!tx || tx.type !== "withdraw" || ["COMPLETED", "CANCELLED", "FAILED"].includes(tx.status ?? "")) return s;
  const refund = ["CANCELLED", "FAILED"].includes(status) ? Math.abs(tx.amountUsdt) : 0;
  return { ...s, ...sync(+(s.cryptoBalance + refund).toFixed(2), s.cardBalance), transactions: s.transactions.map(x => x.id === id ? { ...x, ...patch, status } : x) };
}
function originalCancelHeldWithdrawal(s: Ledger, id: string): { state: Ledger; ok: boolean } {
  const tx = s.transactions.find((x) => x.id === id);
  if (!tx || tx.type !== "withdraw" || tx.status !== "PENDING_72H_HOLD") return { state: s, ok: false };
  const refund = Math.abs(tx.amountUsdt);
  return { ok: true, state: { ...s, ...sync(+(s.cryptoBalance + refund).toFixed(2), s.cardBalance), transactions: s.transactions.map((x) => (x.id === id ? { ...x, status: "CANCELLED" as TxStatus } : x)) } };
}
/** 새 코드가 저장한 장부를 저장소를 거친 것처럼(JSON 으로) 꺼낸다. 원본이 읽는 것은 이 값이다 */
const stored = (): Ledger => JSON.parse(JSON.stringify({ cryptoBalance: now().cryptoBalance, cardBalance: now().cardBalance, balance: now().balance, transactions: now().transactions }));

// ── 차감하지 못한 접수 ────────────────────────────────────────────────────────
test("E-01 차감하지 못한 접수는 장부 금액 0 인 줄로 남는다: 접수 번호는 지키고, 잔액은 바뀌지 않는다(잔액 0, 신청 30)", () => {
  reset(0);
  const row = now().recordWithdrawal(draft(30, "PENDING_72H_HOLD"));
  assert.equal(row.serverId, "srv-30-PENDING_72H_HOLD", "서비스의 접수 번호를 잃지 않는다(C1-P1-01)");
  assert.equal(row.accountId, "acct"); assert.equal(row.status, "PENDING_72H_HOLD");
  assert.equal(row.amountUsdt, 0, "차감하지 않았으므로 장부 금액은 0 이다");
  assert.ok(Object.is(row.amountUsdt, 0), "음의 0 이 아니다");
  assert.equal(row.requestedUsdt, 30, "신청한 금액은 표시 칸에만 있다");
  assert.equal(row.feeUsdt, undefined); assert.equal(row.netUsdt, undefined, "받는 금액처럼 읽힐 칸은 적지 않는다");
  assert.equal(isUndebitedWithdrawal(row), true);
  assert.equal(now().transactions.length, 1);
  assert.equal(now().cryptoBalance, 0); assert.equal(now().balance, 0);
});

test("E-01 카드로 충전한 몫만 있으면 차감하지 못한다(출금은 암호화폐 잔액에서만 나간다): 금액 0 인 줄, 카드 잔액 그대로", () => {
  reset(0, 100);
  const row = now().recordWithdrawal(draft(30));
  assert.equal(row.amountUsdt, 0); assert.equal(row.requestedUsdt, 30);
  assert.equal(now().cardBalance, 100); assert.equal(now().cryptoBalance, 0);
});

test("E-01 차감하지 못한 접수는 취소되거나 실패해도 환불하지 않는다(감사의 재현: 0 이 30 이 되던 것)", () => {
  for (const status of ["PENDING", "PENDING_72H_HOLD"] as const) for (const end of ["CANCELLED", "FAILED"] as const) {
    reset(0);
    const row = now().recordWithdrawal(draft(30, status));
    now().syncWithdrawal(row.id, end); now().syncWithdrawal(row.id, end);
    assert.equal(now().cryptoBalance, 0, `${status} → ${end}: 차감한 적 없는 금액이 잔액에 생겼다`);
    assert.equal(now().transactions[0].status, end, "상태는 서비스가 준 대로 바뀐다");
    assert.equal(isUndebitedWithdrawal(now().transactions[0]), true, "끝난 뒤에도 차감하지 않은 요청으로 읽힌다(C3-P2-01)");
    assert.equal(now().transactions[0].requestedUsdt, 30);
  }
  // 72시간 대기 건을 본인이 취소하는 길도 같다
  reset(0);
  const held = now().recordWithdrawal(draft(30, "PENDING_72H_HOLD"));
  assert.equal(now().cancelHeldWithdrawal(held.id), true);
  assert.equal(now().cancelHeldWithdrawal(held.id), false);
  assert.equal(now().cryptoBalance, 0, "차감한 적 없는 금액이 잔액에 생겼다");
  assert.equal(now().transactions[0].status, "CANCELLED");
});

test("C1-P1-01 취소가 실패해 줄이 열린 채 남아도, 나중의 취소나 서비스의 완료가 잔액을 바꾸지 않는다", () => {
  for (const end of ["CANCELLED", "FAILED", "COMPLETED"] as const) {
    reset(0);
    const row = now().recordWithdrawal(draft(30, "PENDING_72H_HOLD"));
    // 그 사이에 잔액이 다시 생겨도 줄은 그대로 열려 있고, 뒤늦게 차감하지도 않는다
    now().credit(100);
    assert.equal(now().transactions[0].status, "PENDING_72H_HOLD");
    assert.equal(now().cryptoBalance, 100);
    now().syncWithdrawal(row.id, end);
    assert.equal(now().cryptoBalance, 100, end);
    assert.equal(now().transactions[0].status, end);
  }
});

// ── 원본 코드로 되돌렸을 때(C3-P1-02) ───────────────────────────────────────
test("C3-P1-02 새 코드가 적은 차감하지 않은 줄을 원본의 환불 식이 읽어도 환불은 0 이다", () => {
  for (const status of ["PENDING", "PENDING_72H_HOLD"] as const) {
    reset(0);
    const row = now().recordWithdrawal(draft(50, status));
    const saved = stored();
    assert.equal(saved.transactions[0].amountUsdt, 0, "저장된 값이 0 이다(원본이 모르는 칸에 기대지 않는다)");
    for (const end of ["CANCELLED", "FAILED"] as const) {
      const after = originalSyncWithdrawal(saved, row.id, end);
      assert.equal(after.cryptoBalance, 0, `${status} → ${end}: 원본으로 되돌리니 차감한 적 없는 50 이 생겼다`);
      assert.equal(after.balance, 0);
      assert.equal(after.transactions[0].status, end);
    }
    const held = originalCancelHeldWithdrawal(saved, row.id);
    assert.equal(held.ok, status === "PENDING_72H_HOLD");
    assert.equal(held.state.cryptoBalance, 0, status + ": 원본의 본인 취소가 차감한 적 없는 50 을 돌려줬다");
  }
});

test("C3-P1-02 새 코드가 적은 보통의 출금은 원본의 환불 식으로도 차감한 만큼만 돌아온다(양쪽이 같은 식이다)", () => {
  reset(100);
  const row = now().recordWithdrawal(draft(50, "PENDING_72H_HOLD"));
  const saved = stored();
  assert.equal(saved.cryptoBalance, 50); assert.equal(saved.transactions[0].amountUsdt, -50);
  assert.equal(originalSyncWithdrawal(saved, row.id, "CANCELLED").cryptoBalance, 100);
  assert.equal(originalCancelHeldWithdrawal(saved, row.id).state.cryptoBalance, 100);
  // 그리고 이 코드의 환불은 원본의 식과 같은 값을 낸다
  now().syncWithdrawal(row.id, "CANCELLED");
  assert.equal(now().cryptoBalance, originalSyncWithdrawal(saved, row.id, "CANCELLED").cryptoBalance);
});

// ── 보통의 길 ────────────────────────────────────────────────────────────────
test("E-01 보통의 길: 차감하고 내역을 만들며, 취소하면 차감한 만큼만 한 번 돌아온다", () => {
  reset(100, 40);
  const tx = now().recordWithdrawal(draft(30));
  assert.equal(tx.amountUsdt, -30); assert.equal(tx.status, "PENDING"); assert.equal(tx.accountId, "acct");
  assert.equal(tx.feeUsdt, 1); assert.equal(tx.netUsdt, 29); assert.equal(tx.requestedUsdt, undefined);
  assert.equal(isUndebitedWithdrawal(tx), false);
  assert.equal(now().cryptoBalance, 70); assert.equal(now().cardBalance, 40); assert.equal(now().balance, 110);
  now().syncWithdrawal(tx.id, "CANCELLED"); now().syncWithdrawal(tx.id, "CANCELLED"); now().syncWithdrawal(tx.id, "FAILED");
  assert.equal(now().cryptoBalance, 100, "환불은 한 번, 차감한 만큼");
  assert.equal(now().cardBalance, 40, "환불은 암호화폐 잔액으로만 돌아온다");
  assert.equal(now().transactions[0].status, "CANCELLED");
});

test("E-01 보통의 길: 72시간 대기 건의 본인 취소도 차감한 만큼만 한 번 돌아온다", () => {
  reset(100);
  const tx = now().recordWithdrawal({ ...draft(60, "PENDING_72H_HOLD"), unlockAt: Date.now() + 1000 });
  assert.equal(now().cryptoBalance, 40);
  assert.equal(now().cancelHeldWithdrawal(tx.id), true);
  assert.equal(now().cancelHeldWithdrawal(tx.id), false);
  assert.equal(now().cryptoBalance, 100);
});

test("E-01 서비스가 이미 취소나 실패로 돌려준 건은 원본처럼 차감하지 않고 내역만 남기며, 환불도 없다", () => {
  for (const end of ["CANCELLED", "FAILED"] as const) {
    reset(100);
    const tx = now().recordWithdrawal(draft(30, end));
    assert.equal(tx.amountUsdt, -30, "끝난 채로 온 건의 줄은 원본과 같은 꼴이다");
    assert.equal(now().cryptoBalance, 100, end + ": 끝난 건을 차감했다");
    now().syncWithdrawal(tx.id, "CANCELLED");
    assert.equal(now().cryptoBalance, 100);
    assert.equal(originalSyncWithdrawal(stored(), tx.id, "CANCELLED").cryptoBalance, 100, "원본도 끝난 건은 환불하지 않는다");
  }
});

test("E-01 옛 출금 기록(이 변경 전에 저장된 것)은 전처럼 읽히고 전처럼 환불한다", () => {
  reset(100);
  assert.equal(now().debitCrypto(30), true);
  const legacy = now().addTransaction({ type: "withdraw", accountId: "acct", serverId: "old", amountUsdt: -30, status: "PENDING_72H_HOLD" });
  assert.equal(isUndebitedWithdrawal(legacy), false);
  now().syncWithdrawal(legacy.id, "FAILED");
  assert.equal(now().cryptoBalance, 100);
});

// ── 같은 접수를 두 번 적기, 계정(C1 guard A, C3-P2-02) ─────────────────────────
test("C1 guard A 같은 계정의 같은 접수 번호는 두 번 적어도 한 번만 차감하고 내역도 하나다", () => {
  reset(100);
  const first = now().recordWithdrawal(draft(30));
  const again = now().recordWithdrawal(draft(30));
  assert.equal(again.id, first.id, "둘째 호출은 이미 있는 내역을 돌려준다");
  assert.equal(now().cryptoBalance, 70, "같은 접수를 두 번 차감했다");
  assert.equal(now().transactions.length, 1);
  // 접수 번호가 다르면 다른 출금이다
  const other = now().recordWithdrawal({ ...draft(30), serverId: "srv-other" });
  assert.notEqual(other.id, first.id);
  assert.equal(now().cryptoBalance, 40);
  // 이미 끝난(취소된) 같은 접수 번호를 다시 넘겨도 새로 차감하거나 내역을 더하지 않는다
  now().syncWithdrawal(first.id, "CANCELLED");
  assert.equal(now().recordWithdrawal(draft(30)).id, first.id);
  assert.equal(now().cryptoBalance, 70);
  assert.equal(now().transactions.length, 2);
  // 차감하지 못한 줄도 같다: 잔액이 생긴 뒤 같은 접수가 다시 와도 이제 와서 차감하지 않는다
  reset(0);
  const zero = now().recordWithdrawal(draft(30));
  now().credit(100);
  assert.equal(now().recordWithdrawal(draft(30)).id, zero.id);
  assert.equal(now().cryptoBalance, 100); assert.equal(now().transactions.length, 1);
});

test("C3-P2-02 접수 번호가 같아도 계정이 다르면 다른 출금이다(한 장부에 두 계정의 줄이 있을 때)", () => {
  reset(100);
  const a = now().recordWithdrawal({ ...draft(30, "PENDING", "account-a"), serverId: "shared" });
  const b = now().recordWithdrawal({ ...draft(30, "PENDING", "account-b"), serverId: "shared" });
  assert.notEqual(b.id, a.id, "계정 B 의 접수에 계정 A 의 줄을 돌려줬다");
  assert.equal(b.accountId, "account-b"); assert.equal(a.accountId, "account-a");
  assert.equal(now().transactions.length, 2);
  assert.equal(now().cryptoBalance, 40, "두 계정의 접수는 각각 차감한다");
  // 같은 계정의 같은 번호는 여전히 한 번이다
  assert.equal(now().recordWithdrawal({ ...draft(30, "PENDING", "account-b"), serverId: "shared" }).id, b.id);
  assert.equal(now().cryptoBalance, 40);
});

// ── 서비스가 모르는 접수(C3-P1-01) ───────────────────────────────────────────
test("C3-P1-01 서비스가 모르는 접수: 차감하지 않은 줄은 환불 없이 실패로 닫힌다. 차감한 출금은 건드리지 않는다", () => {
  reset(0);
  const zero = now().recordWithdrawal(draft(30, "PENDING_72H_HOLD"));
  now().credit(100);
  assert.equal(now().closeUnknownWithdrawal(zero.id), true);
  assert.equal(now().transactions[0].status, "FAILED");
  assert.equal(now().cryptoBalance, 100, "닫으면서 환불했다");
  assert.equal(now().closeUnknownWithdrawal(zero.id), false, "이미 닫힌 줄은 다시 건드리지 않는다");
  // 차감한 보통의 출금은 서비스가 모른다고 해도 이 길로 닫지 않는다(닫으면 환불이 따라오므로 원본의 동작 그대로 둔다)
  const normal = now().recordWithdrawal(draft(40, "PENDING_72H_HOLD"));
  assert.equal(now().closeUnknownWithdrawal(normal.id), false);
  assert.equal(now().transactions.find((x) => x.id === normal.id)?.status, "PENDING_72H_HOLD");
  assert.equal(now().cryptoBalance, 60);
  assert.equal(now().closeUnknownWithdrawal("nope"), false);
});

/** 브라우저 계정 서비스(이 사이트의 시험 장부)를 기억 속 저장소에 붙여 돌린다 */
async function withBrowser(run: (storage: Map<string, string>, failing: { read: boolean }) => Promise<void>) {
  const savedStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const savedWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const values = new Map<string, string>(); const failing = { read: false };
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: (k: string) => { if (failing.read) throw new Error("storage read failed (injected)"); return values.get(k) ?? null; }, setItem: (k: string, v: string) => values.set(k, v), removeItem: (k: string) => values.delete(k) } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: {} });
  try { await run(values, failing); }
  finally {
    if (savedStorage) Object.defineProperty(globalThis, "localStorage", savedStorage); else Reflect.deleteProperty(globalThis, "localStorage");
    if (savedWindow) Object.defineProperty(globalThis, "window", savedWindow); else Reflect.deleteProperty(globalThis, "window");
  }
}
const failure = async (run: () => Promise<unknown>) => { try { await run(); return null; } catch (cause) { return cause; } };

test("C3-P1-01 조회와 취소: 서비스가 그 번호를 모른다는 답과 일시적인 실패를 구별한다", () => withBrowser(async (storage, failing) => {
  await browserAccountRequest("/auth/login", { email: "withdraw@example.test", password: "Original-password-123" });
  // 서비스에 없는 번호: 모른다는 답
  for (const run of [() => api.withdrawStatus("no-such-request"), () => api.cancelWithdrawal("no-such-request")]) {
    const cause = await failure(run);
    assert.ok(cause instanceof WithdrawalUnknown, "없는 번호를 모른다는 답으로 알아보지 못했다: " + String(cause));
    assert.ok(cause instanceof AccountError && cause.code === "invalid", "화면의 오류 글은 전과 같은 종류다");
  }
  // 있는 번호: 그대로 답한다
  const accounts = JSON.parse(storage.get("voila.browser-accounts.v1")!);
  accounts[0].withdrawals = { known: { id: "known", requestId: "r1", status: "PENDING" } };
  storage.set("voila.browser-accounts.v1", JSON.stringify(accounts));
  assert.equal((await api.withdrawStatus("known")).status, "PENDING");
  // 일시적인 실패(저장소를 읽지 못함): 모른다는 답이 아니다. 줄을 닫으면 안 된다
  failing.read = true;
  for (const run of [() => api.withdrawStatus("known"), () => api.withdrawStatus("no-such-request"), () => api.cancelWithdrawal("known")]) {
    const cause = await failure(run);
    assert.ok(cause !== null && !(cause instanceof WithdrawalUnknown), "일시적인 실패를 모른다는 답으로 봤다: " + String(cause));
  }
  failing.read = false;
  // 로그인이 끝난 상태(세션 없음): 모른다는 답이 아니다
  storage.delete("voila.browser-session.v1");
  const cause = await failure(() => api.withdrawStatus("known"));
  assert.ok(cause instanceof AccountError && !(cause instanceof WithdrawalUnknown) && cause.code === "credentials");
}));

test("차감하지 않은 요청으로 읽는 것은 신청 금액 표시가 있는 출금 줄뿐이다", () => {
  const base = { id: "t", at: new Date().toISOString(), type: "withdraw" as const, accountId: "acct", serverId: "s", amountUsdt: 0, status: "PENDING" as const };
  assert.equal(isUndebitedWithdrawal({ ...base, requestedUsdt: 30 }), true);
  assert.equal(isUndebitedWithdrawal({ ...base, requestedUsdt: 30, status: "CANCELLED" }), true, "끝난 뒤에도 같다");
  assert.equal(isUndebitedWithdrawal({ ...base }), false);
  assert.equal(isUndebitedWithdrawal({ ...base, amountUsdt: -30 }), false, "차감한 보통의 출금");
  assert.equal(isUndebitedWithdrawal({ ...base, requestedUsdt: 30, type: "open" }), false);
});
