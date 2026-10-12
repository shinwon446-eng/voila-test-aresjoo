/**
 * 백엔드 계약 (live 모드). 전부 JSON, 실패는 throw. 호출측은 isLive() 로 분기한다.
 *
 *   GET  /feed/live            → LiveDrop[]            실시간 당첨, 환전, 출고 스트림
 *   GET  /feed/proof           → { payouts, shipments } 실지급, 실배송 인증 피드
 *   GET  /stats/today          → { shipmentsToday, cashoutsTodayUsdt, verificationRate }
 *   GET  /reserve              → { address, network, balanceUsdt }
 *   POST /deposit/address      → { address, network }   유저별 입금 주소 발급
 *   POST /deposit/check        → { status: "pending"|"confirmed", confirmations, amountUsdt?, txHash? }  입금 확인(자동 잔고 반영)
 *   POST /withdraw             → { id, status, txHash? } 출금 신청 (서버가 서명, 브로드캐스트)
 *   GET  /withdraw/:id         → { status, txHash? }
 *   GET  /shipping/:ownedId    → { carrier, trackingNumber } | 404 (출고 전)
 */
import { API_BASE } from "@/lib/runtime";
import type { DepositNetwork, Network } from "@/lib/depositAddress";
import type { LiveDrop } from "@/lib/liveDrops";
import type { PayoutProof, ShipmentProof } from "@/lib/proofFeed";
import type { CarrierKey } from "@/lib/carriers";
import type { TxStatus } from "@/stores/walletStore";
import { accountRequest, AccountError, browserAccountsEnabled } from "@/lib/account";
import type { WithdrawalDraft, WithdrawalProof } from "@/lib/security";

export interface WithdrawalResult { id: string; status: TxStatus; txHash?: string; unlockAt?: number }
/**
 * 서비스가 그 출금 접수 번호를 모른다고 답했다. 연결이 끊긴 것 같은 일시적인 실패와 구별하려고 따로 둔다
 * (오류의 종류는 전과 같은 invalid 라서 화면의 글은 달라지지 않는다).
 * 이 브라우저 안의 시험 서비스(lib/browserAccount)는 없는 번호에 invalid 로 답한다. 그 답만 이것으로 바꾼다.
 * 서버 전송은 없는 번호(404)와 일시적인 실패를 같은 network 로 돌려주므로 여기서는 가르지 못한다(그때는 이 오류가 나오지 않는다).
 */
export class WithdrawalUnknown extends AccountError { constructor() { super("invalid"); } }
/** 접수 번호 하나를 조회하거나 취소한다. 서비스가 그 번호를 모른다고 답하면 WithdrawalUnknown, 그 밖의 실패는 그대로 던진다 */
async function withdrawalRequest(path: string, body?: unknown): Promise<WithdrawalResult> {
  let data: Record<string, unknown>;
  try { data = await accountRequest(path, body, API_BASE); }
  catch (cause) { throw browserAccountsEnabled() && cause instanceof AccountError && cause.code === "invalid" ? new WithdrawalUnknown() : cause; }
  return withdrawalResult(data);
}
function withdrawalResult(data: Record<string, unknown>): WithdrawalResult {
  if (typeof data.id !== "string" || !data.id || !["PENDING", "PENDING_ADMIN_REVIEW", "PENDING_72H_HOLD", "BROADCASTING", "COMPLETED", "CANCELLED", "FAILED"].includes(data.status as string)) throw new AccountError("invalid");
  if (data.status === "PENDING_72H_HOLD" && (typeof data.unlockAt !== "number" || !Number.isFinite(data.unlockAt))) throw new AccountError("invalid");
  return data as unknown as WithdrawalResult;
}
import type { OwnedItem } from "@/stores/inventoryStore";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return (await res.json()) as T;
}

export const api = {
  liveFeed: () => call<LiveDrop[]>("/feed/live"),
  proofFeed: () => call<{ payouts: PayoutProof[]; shipments: ShipmentProof[] }>("/feed/proof"),
  statsToday: () => call<{ shipmentsToday: number; cashoutsTodayUsdt: number; verificationRate: number }>("/stats/today"),
  reserve: () => call<{ address: string; network: Network; balanceUsdt: number }>("/reserve"),
  depositAddress: async (network: DepositNetwork, userKey: string) => await accountRequest("/deposit/address", { network, userKey }, API_BASE) as unknown as { address: string; network: DepositNetwork },
  depositCheck: async (input: { network: DepositNetwork; address: string; userKey: string; expectedUsdt?: number }) => {
    const result = await accountRequest("/deposit/check", input, API_BASE);
    if (!["pending", "confirmed"].includes(result.status as string) || typeof result.confirmations !== "number" || !Number.isFinite(result.confirmations) || result.confirmations < 0) throw new AccountError("invalid");
    if (result.status === "confirmed" && (typeof result.amountUsdt !== "number" || !Number.isFinite(result.amountUsdt) || result.amountUsdt <= 0 || typeof result.txHash !== "string" || !result.txHash)) throw new AccountError("invalid");
    return result as unknown as { status: "pending" | "confirmed"; confirmations: number; amountUsdt?: number; txHash?: string };
  },
  withdraw: async (input: WithdrawalDraft & { requestId: string; authorization: string; authMethod: WithdrawalProof["method"] }) => {
    const result = withdrawalResult(await accountRequest("/withdraw", input, API_BASE));
    if (input.authMethod === "EMAIL_72H_HOLD" && result.status !== "PENDING_72H_HOLD" && !["CANCELLED", "FAILED"].includes(result.status)) throw new AccountError("invalid");
    return result;
  },
  withdrawStatus: (id: string) => withdrawalRequest(`/withdraw/${encodeURIComponent(id)}`),
  cancelWithdrawal: (id: string) => withdrawalRequest(`/withdraw/${encodeURIComponent(id)}/cancel`, {}),
  shipping: (ownedId: string) => call<{ carrier: CarrierKey; trackingNumber: string }>(`/shipping/${encodeURIComponent(ownedId)}`),
  cancelShipping: async (ownedId: string, requestId: string) => await accountRequest(`/shipping/${encodeURIComponent(ownedId)}/cancel`, { requestId, idempotencyKey: `cancel-shipping:${ownedId}:${requestId}` }, API_BASE) as unknown as { status: "CANCELLED"; item: OwnedItem; wallet: { balance: number; cryptoBalance: number; cardBalance: number } },
};
