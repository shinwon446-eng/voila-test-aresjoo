"use client";
/**
 * USDT 충전 시트. 결정 하나: 어느 네트워크로 보낼지.
 * 주소와 QR 이 바로 보이고, 입금이 확인되면 시트가 스스로 닫혀 하던 화면으로 돌아간다.
 * 화면에 결과(잔액)가 남으므로 완료 토스트는 띄우지 않는다. 토스트는 주소 복사에만 쓴다.
 */
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { NETWORKS, type DepositNetwork } from "@/lib/depositAddress";
import { useUsdtDeposit } from "@/lib/useUsdtDeposit";
import { useFlow } from "@/stores/flowStore";
import { useAuthStore } from "@/stores/authStore";
import { Sheet } from "@/components/ui/Sheet";
import { Button, Chips, Line } from "@/components/ui/kit";
import { useToast } from "@/components/ui/toast";

export function ChargeSheet() {
  const t = useTranslations("v");
  const open = useFlow((s) => s.charge);
  const close = useFlow((s) => s.closeCharge);
  const user = useAuthStore((s) => s.user);
  const openLogin = useAuthStore((s) => s.openAuthModal);
  const toast = useToast((s) => s.show);
  const [network, setNetwork] = useState<DepositNetwork>("TRC20");
  const onCredited = useCallback(() => close(), [close]);
  const { address, status, meta } = useUsdtDeposit(network, open && !!user, onCredited);

  const copy = async () => {
    if (!address) return;
    try { await navigator.clipboard.writeText(address); toast(t("common.copied")); } catch { /* 클립보드 권한이 없으면 주소를 직접 골라 복사한다 */ }
  };

  if (!user) {
    return (
      <Sheet open={open} onClose={close} title={t("charge.title")} desc={t("charge.loginDesc")} closeLabel={t("common.close")}>
        <Button onClick={() => openLogin("login")}>{t("nav.login")}</Button>
      </Sheet>
    );
  }
  return (
    <Sheet open={open} onClose={close} title={t("charge.title")} desc={t("charge.desc")} closeLabel={t("common.close")}>
      <Chips label={t("charge.network")} value={network} onChange={setNetwork} options={NETWORKS.map((n) => ({ value: n.key, label: n.token }))} />
      <div className="v-card v-stack">
        {address ? (
          <>
            <div className="v-qr"><QRCodeSVG value={address} size={148} level="M" marginSize={2} title={t("charge.qr")} /></div>
            <code className="v-address">{address}</code>
          </>
        ) : <Line fail={status.kind === "addressFailed"}>{t(status.kind === "addressFailed" ? "charge.addressFail" : "charge.preparing")}</Line>}
      </div>
      {address && <Line>{status.kind === "pending" ? t("charge.confirming", { n: status.confirmations, total: status.total }) : t("charge.waiting")}</Line>}
      <Button onClick={copy} disabled={!address}>{t("charge.copy")}</Button>
      <p className="v-small">{t("charge.min")} {t("charge.confirmations", { n: meta.confirmations })}</p>
    </Sheet>
  );
}
