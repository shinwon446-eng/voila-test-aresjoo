/**
 * 개봉 결과 자리에서 상품을 USDT 로 받는 일. 계산은 lib/claim 의 takeUsdt 그대로다(보관함이 금액과 자금 출처를 계산하고,
 * 이미 받은 상품은 건너뛰므로 두 번 받을 수 없다). 이 파일은 그 결과를 화면이 말할 수 있는 상태로 돌려줄 뿐이다.
 *
 *   settled  잔액에 들어왔다(받은 금액과 함께)
 *   pending  접수는 됐지만 잔액 반영이 아직이다. 화면은 "들어왔다"고 말하지 않는다
 *   failed   받지 못했다. 상품은 보관함에 그대로 있다
 *
 * 지금의 브라우저 장부는 그 자리에서 끝나므로 pending 이 생기지 않는다. 서비스에 연결되면 생길 수 있어 상태는 갖춰 둔다.
 * 개발 서버에서만(운영 빌드에서는 지워진다) 세션 저장소의 "voila.opening.fault" 로 pending 과 failed 를 만들어 화면을 검수한다.
 */
import { takeUsdt } from "./claim";
import { useInventoryStore } from "../stores/inventoryStore";

export type SettleOutcome = { status: "settled"; amountUsdt: number } | { status: "pending" } | { status: "failed" };

export const devOpeningFault = (): string | null => {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") return null;
  try { return window.sessionStorage.getItem("voila.opening.fault"); } catch { return null; }
};

/** 같은 상품에 대한 요청은 한 번만 나간다. 연달아 눌러도 같은 약속을 돌려준다. */
const inflight = new Map<string, Promise<SettleOutcome>>();

export function settleTake(ownedId: string): Promise<SettleOutcome> {
  const running = inflight.get(ownedId);
  if (running) return running;
  const job = (async (): Promise<SettleOutcome> => {
    const fault = devOpeningFault();
    if (fault === "settle-failed") return { status: "failed" };
    if (fault === "settle-pending") return { status: "pending" };
    const item = useInventoryStore.getState().items.find((i) => i.id === ownedId);
    if (!item) return { status: "failed" };
    // 이미 받은 상품이면 다시 더하지 않고 받은 상태로 답한다
    if (item.status === "SOLD") return { status: "settled", amountUsdt: 0 };
    if (item.status !== "IN_STORAGE") return { status: "failed" };
    const out = takeUsdt([ownedId]);
    return out.ids.length === 1 && out.totalUsdt > 0 ? { status: "settled", amountUsdt: out.totalUsdt } : { status: "failed" };
  })().finally(() => inflight.delete(ownedId));
  inflight.set(ownedId, job);
  return job;
}
