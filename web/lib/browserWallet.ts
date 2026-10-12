import { useWalletStore, type Transaction } from "@/stores/walletStore";
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
