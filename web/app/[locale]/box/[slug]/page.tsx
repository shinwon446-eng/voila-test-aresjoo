import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { BOXES, getBoxBySlug } from "@/lib/products";
import { AppShell } from "@/components/shell/AppShell";
import { BoxScreen } from "@/components/box/BoxScreen";

/** 정적 export: 박스마다 주소가 있다. 뒤로 가기와 공유가 된다. */
export function generateStaticParams() {
  return BOXES.map((box) => ({ slug: box.slug }));
}
export const dynamicParams = false;

export default function BoxPage({ params: { locale, slug } }: { params: { locale: string; slug: string } }) {
  setRequestLocale(locale);
  const box = getBoxBySlug(slug);
  if (!box) notFound();
  return <AppShell><BoxScreen box={box} /></AppShell>;
}
