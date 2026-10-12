import { useWalletStore, type Transaction, type TxType } from "@/stores/walletStore";
import { useInventoryStore } from "@/stores/inventoryStore";

/**
 * 지갑 내역에 보일 이 계정의 거래. 계정 번호가 적힌 거래는 번호가 같은 것만 보인다.
 * 박스 열기와 USDT로 받기처럼 번호 없이 적히는 거래는, 지금 장부가 이 계정의 장부일 때만 이 계정의 것으로 본다
 * (아래 restoreBrowserAssets 가 장부 키를 계정별로 바꾼다). 저장된 기록은 고쳐 쓰지 않는다.
 */
export function accountTransactions(transactions: Transaction[], userId: string): Transaction[] {
  const own = useWalletStore.persist?.getOptions?.().name === `voila.browser-wallet.${userId}`;
  return transactions.filter((x) => x.accountId === userId || (own && !x.accountId));
}

/** 내역에 적을 수 있는 거래 종류(화면에 이름이 있는 것). 종류가 늘면 여기에도 적어야 타입 검사를 지난다 */
const KNOWN_TYPES: Record<TxType, true> = { deposit_usdt: true, deposit_card: true, open: true, sellback: true, withdraw: true, bonus: true, shipping_refund: true, order_refund: true };
/** 시각을 읽을 수 없는 줄은 맨 뒤로 보낸다 */
const timeOf = (x: Transaction) => Date.parse(x.at) || 0;

/**
 * 지갑 내역의 줄: 이 계정의 거래 가운데 읽을 수 있는 것을 최신순으로.
 * 저장값이 깨져 있을 수 있다(계정 번호 없는 줄을 보여 주기 전에는 그런 줄이 화면에 닿지 않았다). 화면이 죽지 않게 여기서 거른다.
 *   종류를 모르거나 금액이 유한한 숫자가 아닌 줄은 뺀다: 무엇이 얼마였는지 적을 수 없는 줄이다.
 *   시각만 없거나 틀린 줄은 남긴다(돈이 움직인 기록이다). 맨 뒤에 놓이고, 화면은 시각 자리를 비운다.
 * 건넨 배열과 저장된 기록은 고쳐 쓰지 않는다.
 */
export function walletHistoryRows(transactions: Transaction[], userId: string): Transaction[] {
  return accountTransactions(transactions, userId)
    .filter((x) => KNOWN_TYPES[x.type] === true && typeof x.amountUsdt === "number" && Number.isFinite(x.amountUsdt))
    .sort((a, b) => timeOf(b) - timeOf(a));
}

// Switch namespaces without deleting another account's records or the legacy wallet.
export function restoreBrowserAssets(userId: string | null) {
  const suffix = userId ?? "guest";
  const walletName = `voila.browser-wallet.${suffix}`;
  if (useWalletStore.persist.getOptions().name === walletName) return;
  const restore = (name: string) => {
    try { return JSON.parse(localStorage.getItem(name) ?? "null")?.state ?? {}; }
    catch { return {}; }
  };
  const wallet = restore(walletName);
  useWalletStore.persist.setOptions({ name: walletName });
  useWalletStore.setState({ ...useWalletStore.getInitialState(), ...wallet, hydrated: true });
  const inventoryName = `voila.browser-inventory.${suffix}`;
  const inventory = restore(inventoryName);
  useInventoryStore.persist.setOptions({ name: inventoryName });
  useInventoryStore.setState({ ...useInventoryStore.getInitialState(), ...inventory, hydrated: true });
}
