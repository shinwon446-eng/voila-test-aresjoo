/**
 * 프리셋 위에 덧입히는 값(plan.mjs 의 patch 이름). 브라우저 안의 시험 장부에만 쓰는 자료다.
 * 지갑은 계정별 키와 공용 키를 함께 고친다(lib/common.mjs 의 patchLedger).
 */
import { patchLedger } from './common.mjs';

const wrap = (state, version = 0) => JSON.stringify({ state, version });
const setBalance = (state, amount) => patchLedger(state, (box) => {
  box.wallet.balance = amount; box.wallet.cryptoBalance = amount; box.wallet.cardBalance = 0;
  for (const tx of box.wallet.transactions) if (tx.type === 'bonus') tx.amountUsdt = amount;
});
const LONG_NICKNAME = '아주긴닉네임을가진시험계정WWWWWWWW';

const big = (state) => {
  patchLedger(state, (box) => {
    // 쓸 수 있는 잔액과 출금할 수 있는 잔액이 다르게 보이도록 카드 몫을 둔다
    box.wallet.cryptoBalance = 900000000.12; box.wallet.cardBalance = 87654321; box.wallet.balance = 987654321.12;
    for (const tx of box.wallet.transactions) if (tx.type === 'bonus') tx.amountUsdt = 987654321.12;
    box.items.forEach((item, i) => { item.valueUsdt = i === 0 ? 399999.99 : 1234567.89; });
  });
  const accounts = JSON.parse(state.values['voila.browser-accounts.v1']);
  for (const account of accounts) account.user.nickname = LONG_NICKNAME;
  state.values['voila.browser-accounts.v1'] = JSON.stringify(accounts);
  state.user.nickname = LONG_NICKNAME;
  return state;
};

/**
 * 접수는 됐지만 잔액에서 차감하지 못한 출금 요청의 줄(결과 빌드의 stores/walletStore.ts: 장부 금액 0, 신청한 금액은 requestedUsdt).
 * 정상 흐름으로는 만들 수 없어 저장소에 직접 심는다. 기준 빌드는 requestedUsdt 를 모르므로 0 짜리 출금 줄로만 보인다.
 */
const zeroWithdraw = (state) => {
  const id = 'capture-withdraw-zero', at = state.user.createdAt;
  patchLedger(state, (box) => { box.wallet.transactions.push({ id, serverId: id, accountId: state.user.id, type: 'withdraw', amountUsdt: 0, requestedUsdt: 50, at, status: 'PENDING', network: 'TRC20', address: 'T' + '1'.repeat(33), authMethod: '2FA_OTP' }); });
  const accounts = JSON.parse(state.values['voila.browser-accounts.v1']);
  for (const account of accounts) account.withdrawals = { ...(account.withdrawals ?? {}), [id]: { id, requestId: id, status: 'PENDING' } };
  state.values['voila.browser-accounts.v1'] = JSON.stringify(accounts);
  return state;
};

export const PATCHES = {
  zeroWithdraw,
  balance300: (state) => setBalance(state, 300),
  balanceQuarter: (state) => setBalance(state, 0.25),
  noHistory: (state) => patchLedger(state, (box) => { box.wallet.transactions = []; }),
  big,
  bigKrw: (state) => { big(state); state.values['gachaflix.currency'] = wrap({ currency: 'KRW' }); return state; },
};

export function applyPatch(state, name) {
  if (!name) return state;
  const patch = PATCHES[name];
  if (!patch) throw new Error('모르는 덧입힘: ' + name);
  return patch(state);
}
