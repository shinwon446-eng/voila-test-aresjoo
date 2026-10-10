"use client";
/** 이용 방법의 "알아 둘 값". 숫자는 전부 계산에 쓰는 상수에서 가져온다(화면에 따로 적어 두지 않는다). */
import { useTranslations } from "next-intl";
import { REFUND_RATE } from "@/lib/products";
import { MIN_DEPOSIT_USDT } from "@/lib/depositAddress";
import { shippingFee } from "@/lib/shipping";
import { useCurrency } from "@/lib/useCurrency";
import { Row, Rows } from "@/components/ui/kit";

export function GuideFees() {
  const t = useTranslations("v");
  const { fmt } = useCurrency();
  return (
    <Rows label={t("guide.facts")}>
      <Row label={t("guide.takeRate")}>{t("guide.takeRateValue", { pct: Math.round(REFUND_RATE * 100) })}</Row>
      <Row label={t("guide.cashItems")}>{t("guide.cashItemsValue")}</Row>
      <Row label={t("guide.shipFee")}>{fmt(shippingFee("KR"))}</Row>
      <Row label={t("guide.minCharge")}>{fmt(MIN_DEPOSIT_USDT)}</Row>
    </Rows>
  );
}
