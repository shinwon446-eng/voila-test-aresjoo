"use client";
/**
 * USDT 입금 주소와 자동 확인. 옛 UsdtDepositTab 의 로직을 화면에서 떼어 낸 것이다(계산과 검증은 그대로).
 *   네트워크를 고르면 주소가 준비되고, 금액 신청이나 단추 없이 5초마다 입금을 확인한다.
 *   확인된 영수증은 recordConfirmedUsdtDeposit 한 곳으로만 잔액에 반영하고, 같은 영수증을 두 번 반영하지 않는다.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { NETWORKS, looksLikeAddress, resolveDepositAddress, validDepositReceipt, type DepositNetwork } from "@/lib/depositAddress";
import { DEPOSIT_ADDRESSES } from "@/lib/runtime";
import { api } from "@/lib/api";
import { recordConfirmedUsdtDeposit } from "@/lib/depositCredit";
import { useAuthStore } from "@/stores/authStore";

export type DepositStatus = { kind: "preparing" } | { kind: "waiting" } | { kind: "pending"; confirmations: number; total: number } | { kind: "credited"; amount: number; txHash?: string } | { kind: "addressFailed" };

const CHECK_INTERVAL_MS = 5_000;

/** attempt 는 "주소 다시 받기"를 누를 때마다 1씩 올려 같은 네트워크로 다시 요청한다 */
export function useUsdtDeposit(network: DepositNetwork, enabled: boolean, onCredited: (amountUsdt: number) => void, attempt = 0) {
  const userKey = useAuthStore((s) => s.user?.id ?? "");
  const [status, setStatus] = useState<DepositStatus>({ kind: "preparing" });
  const [issued, setIssued] = useState<{ address: string; network: DepositNetwork; accountId: string } | null>(null);
  const onCreditedRef = useRef(onCredited);
  useEffect(() => { onCreditedRef.current = onCredited; }, [onCredited]);
  const meta = useMemo(() => NETWORKS.find((n) => n.key === network)!, [network]);
  const envAddress = DEPOSIT_ADDRESSES[network];

  useEffect(() => {
    setIssued(null);
    setStatus({ kind: "preparing" });
    if (!enabled || !userKey || resolveDepositAddress(network, envAddress)) return;
    let alive = true;
    api.depositAddress(network, userKey)
      .then((r) => {
        if (!alive) return;
        if (r.network === network && looksLikeAddress(network, r.address)) setIssued({ address: r.address, network, accountId: userKey });
        else setStatus({ kind: "addressFailed" });
      })
      .catch(() => alive && setStatus({ kind: "addressFailed" }));
    return () => { alive = false; };
  }, [network, userKey, envAddress, enabled, attempt]);

  const address = resolveDepositAddress(network, envAddress, issued?.network === network && issued.accountId === userKey ? issued.address : null);

  useEffect(() => {
    if (!enabled || !address || !userKey) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    setStatus({ kind: "waiting" });
    const check = async () => {
      try {
        const result = await api.depositCheck({ network, address, userKey });
        if (!active || useAuthStore.getState().user?.id !== userKey) return;
        if (result.status === "confirmed" && result.amountUsdt && result.txHash && result.confirmations >= meta.confirmations
          && validDepositReceipt({ network, address, amountUsdt: result.amountUsdt, txHash: result.txHash, confirmations: result.confirmations })) {
          const recorded = recordConfirmedUsdtDeposit({ accountId: userKey, address, network, amountUsdt: result.amountUsdt, txHash: result.txHash });
          if (recorded === "credited") onCreditedRef.current(result.amountUsdt);
          if (recorded !== "invalid") setStatus({ kind: "credited", amount: result.amountUsdt, txHash: result.txHash });
        } else if (result.status === "pending") {
          setStatus({ kind: "pending", confirmations: result.confirmations, total: meta.confirmations });
        } else {
          setStatus({ kind: "waiting" });
        }
      } catch {
        if (active) setStatus({ kind: "waiting" });
      } finally {
        if (active) timer = setTimeout(check, CHECK_INTERVAL_MS);
      }
    };
    void check();
    return () => { active = false; clearTimeout(timer); };
  }, [address, enabled, network, userKey, meta.confirmations]);

  return { address, status, meta };
}
