/**
 * 받은 상품을 받는 세 가지 일: USDT로 받기, 배송 신청, 배송 신청 취소.
 * 계산과 검증은 옛 보관함 화면과 옛 취소 창이 하던 순서 그대로다(화면에서 떼어 냈을 뿐).
 */
import { REFUND_RATE } from "@/lib/products";
import type { ShippingAddress } from "@/lib/shipping";
import { API_BASE, isLive } from "@/lib/runtime";
import { accountRequest } from "@/lib/account";
import { api } from "@/lib/api";
import { useInventoryStore, type OwnedItem } from "@/stores/inventoryStore";
import { useWalletStore } from "@/stores/walletStore";

/**
 * USDT로 받기. 보관함의 sell 이 상품마다 환급액과 자금 출처별 몫을 계산하고(카드 출처는 카드 잔액으로만),
 * 지갑은 그 몫대로 잔액을 올리고 거래 기록 한 건을 남긴다.
 * 이미 받은 상품이나 보관 중이 아닌 상품은 sell 이 건너뛰므로 두 번 받을 수 없다.
 */
export function takeUsdt(ownedIds: string[]): { ids: string[]; totalUsdt: number } {
  const result = useInventoryStore.getState().sell(ownedIds, REFUND_RATE);
  if (result.ids.length) {
    const wallet = useWalletStore.getState();
    wallet.creditSplit(result.toCrypto, result.toCard);
    wallet.addTransaction({ type: "sellback", amountUsdt: result.totalUsdt, ref: result.ids.join(",") });
  }
  return { ids: result.ids, totalUsdt: result.totalUsdt };
}

/**
 * 배송 신청. 계정 서비스가 상태 전환과 배송비 차감을 한 번에 처리하고, 돌아온 상품과 지갑 값이 모두 맞을 때만 화면에 반영한다.
 * idempotencyKey 는 같은 신청이 두 번 접수되지 않게 한다. 실패하면 아무것도 바꾸지 않고 던진다.
 */
export async function requestShipment(ownedIds: string[], address: ShippingAddress, feeUsdt: number, idempotencyKey: string): Promise<void> {
  const ids = ownedIds.filter((id) => useInventoryStore.getState().items.some((item) => item.id === id && item.status === "IN_STORAGE"));
  if (!ids.length || ids.length !== ownedIds.length) throw new Error("invalid-shipping-items");
  const result = await accountRequest("/shipping/request", { ownedIds: ids, address, feeUsdt, idempotencyKey }, API_BASE);
  const returned = result.items;
  const wallet = result.wallet as Record<string, unknown> | undefined;
  if (!Array.isArray(returned) || returned.length !== ids.length || new Set(returned.map((item) => item?.id)).size !== ids.length || !wallet ||
    ![wallet.balance, wallet.cryptoBalance, wallet.cardBalance].every((value) => typeof value === "number" && Number.isFinite(value) && value >= 0) ||
    !returned.every((item) => item && typeof item === "object" && ids.includes(item.id) && item.status === "SHIPPING_REQUESTED" &&
      typeof item.shipping?.requestId === "string" && typeof item.shipping?.requestedAt === "string" &&
      typeof item.shipping?.feeUsdt === "number" && item.shipping?.address)) throw new Error("invalid-shipping-response");
  const updated = new Map((returned as OwnedItem[]).map((item) => [item.id, item]));
  useInventoryStore.setState((state) => ({ items: state.items.map((item) => updated.get(item.id) ?? item) }));
  useWalletStore.setState({ balance: wallet.balance as number, cryptoBalance: wallet.cryptoBalance as number, cardBalance: wallet.cardBalance as number });
}

/**
 * 배송 신청 취소. 출고 전(SHIPPING_REQUESTED)인 건만 되돌리고 배송비를 낸 출처대로 돌려준다.
 * 서비스에 연결된 환경에서는 서버가 상태를 다시 확인하고 환불까지 한 번에 처리한다. 먼저 잔액을 올리지 않는다.
 */
export async function cancelShipment(target: OwnedItem): Promise<void> {
  const item = useInventoryStore.getState().items.find((o) => o.id === target.id);
  const unknownFee = !!item?.shipping?.feeUsdt && (!item.shipping.requestId || !item.shipping.feeFundingRatio);
  if (!item || item.status !== "SHIPPING_REQUESTED" || item.shipping?.shippedAt) throw new Error("notPreparing");
  if (unknownFee) throw new Error("unknownFee");
  if (isLive()) {
    const result = await api.cancelShipping(item.id, item.shipping?.requestId ?? item.shipping?.requestedAt ?? "");
    if (result.status !== "CANCELLED" || result.item?.id !== item.id || result.item.status !== "IN_STORAGE" || !result.wallet ||
      ![result.wallet.balance, result.wallet.cryptoBalance, result.wallet.cardBalance].every((n) => Number.isFinite(n) && n >= 0) ||
      Math.abs(result.wallet.balance - result.wallet.cryptoBalance - result.wallet.cardBalance) > 0.001) throw new Error("notPreparing");
    useInventoryStore.setState((s) => ({ items: s.items.map((o) => (o.id === item.id ? result.item : o)) }));
    useWalletStore.setState({ balance: result.wallet.balance, cryptoBalance: result.wallet.cryptoBalance, cardBalance: result.wallet.cardBalance });
    return;
  }
  const result = useInventoryStore.getState().cancelShipping(item.id);
  if (!result.ok) throw new Error(result.reason);
  if (result.refundedUsdt > 0) {
    const wallet = useWalletStore.getState();
    wallet.creditSplit(result.toCrypto, result.toCard);
    wallet.addTransaction({ type: "shipping_refund", amountUsdt: result.refundedUsdt, ref: item.shipping?.requestId ?? item.id, status: "COMPLETED" });
  }
}
