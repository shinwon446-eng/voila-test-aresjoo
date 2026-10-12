"use client";
/**
 * 잔액 시트. 머리줄의 잔액을 누르면 어느 화면에서나 열린다(지갑 화면은 메뉴에서 그대로 간다).
 * 결정 하나: 잔액을 어떻게 채우거나 뺄지. 보관 중인 상품이 있으면 USDT로 받기가 먼저다.
 *   USDT로 받기 → 같은 자리에서 선택 시트로 바뀐다 / USDT 충전하기 → 충전 시트로 바뀐다 / 출금 → 출금 화면
 * 시트를 겹쳐 쌓지 않는다. 닫으면 보던 화면이 그대로다. 여기서 다음 개봉을 실행하는 일은 없다.
 */
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { takeQuote } from "@/lib/takeBatch";
import { useCurrency } from "@/lib/useCurrency";
import { useFlow } from "@/stores/flowStore";
import { useAuthStore } from "@/stores/authStore";
import { useWalletStore } from "@/stores/walletStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { Sheet } from "@/components/ui/Sheet";
import { Button, Row, Rows, TextLink } from "@/components/ui/kit";
import { TakeSheet, useTakeLedger } from "@/components/flow/TakeSheet";

export function BalanceSheet() {
  const t = useTranslations("v");
  const { fmt } = useCurrency();
  const open = useFlow((s) => s.balance);
  const close = useFlow((s) => s.closeBalance);
  const openCharge = useFlow((s) => s.openCharge);
  const user = useAuthStore((s) => s.user);
  const openLogin = useAuthStore((s) => s.openAuthModal);
  const balance = useWalletStore((s) => s.balance);
  const withdrawable = useWalletStore((s) => s.cryptoBalance);
  const items = useInventoryStore((s) => s.items);
  const ledger = useTakeLedger();
  const held = useMemo(() => takeQuote(items, ledger), [items, ledger]);
  const [taking, setTaking] = useState(false);
  useEffect(() => { if (!open) setTaking(false); }, [open]);

  if (!user) {
    return (
      <Sheet open={open} onClose={close} title={t("balanceSheet.title")} desc={t("balanceSheet.login")} closeLabel={t("common.close")}>
        <Button onClick={() => { close(); openLogin("login"); }}>{t("nav.login")}</Button>
      </Sheet>
    );
  }
  const charge = () => { close(); openCharge(); };
  return (
    <>
      <Sheet open={open && !taking} onClose={close} title={t("balanceSheet.title")} closeLabel={t("common.close")}>
        <Rows>
          <Row label={t("balanceSheet.spendable")}>{fmt(balance)}</Row>
          <Row label={t("balanceSheet.withdrawable")}>{fmt(withdrawable)}</Row>
          <Row label={held.count > 0 ? t("balanceSheet.held", { n: held.count }) : t("balanceSheet.heldLabel")}>{held.count > 0 ? t("balanceSheet.heldWorth", { amount: fmt(held.totalUsdt) }) : t("balanceSheet.heldNone")}</Row>
        </Rows>
        {held.count > 0 ? <Button data-balance-take onClick={() => setTaking(true)}>{t("take.title")}</Button> : <Button onClick={charge}>{t("box.charge")}</Button>}
        <div className="v-links">
          {held.count > 0 && <TextLink onClick={charge}>{t("box.charge")}</TextLink>}
          <TextLink href="/wallet/withdraw" onClick={close}>{t("wallet.withdraw")}</TextLink>
          {held.count === 0 && <TextLink href="/wallet" onClick={close}>{t("balanceSheet.history")}</TextLink>}
        </div>
      </Sheet>
      <TakeSheet open={open && taking} onClose={close} />
    </>
  );
}
