import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/AppShell";
import { InventoryScreen } from "@/components/inventory/InventoryScreen";

/** 보관함: 받은 상품 목록. 결정 하나(어느 상품을 받을지). */
export default function InventoryPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <AppShell><InventoryScreen /></AppShell>;
}
