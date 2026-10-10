/**
 * 받은 상품을 USDT로 받기. 계산은 옛 보관함 화면이 하던 순서 그대로다(화면에서 떼어 냈을 뿐).
 *   보관함의 sell 이 상품마다 환급액과 자금 출처별 몫을 계산하고(카드 출처는 카드 잔액으로만),
 *   지갑은 그 몫대로 잔액을 올리고 거래 기록 한 건을 남긴다.
 * 이미 받은 상품이나 보관 중이 아닌 상품은 sell 이 건너뛰므로 두 번 받을 수 없다.
 */
import { REFUND_RATE } from "@/lib/products";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useWalletStore } from "@/stores/walletStore";

export function takeUsdt(ownedIds: string[]): { ids: string[]; totalUsdt: number } {
  const result = useInventoryStore.getState().sell(ownedIds, REFUND_RATE);
  if (result.ids.length) {
    const wallet = useWalletStore.getState();
    wallet.creditSplit(result.toCrypto, result.toCard);
    wallet.addTransaction({ type: "sellback", amountUsdt: result.totalUsdt, ref: result.ids.join(",") });
  }
  return { ids: result.ids, totalUsdt: result.totalUsdt };
}
