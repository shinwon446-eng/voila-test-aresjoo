import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/AppShell";
import { Gallery } from "@/components/dev/Gallery";

/** 개발 전용 상태 갤러리. 프로덕션 빌드에서는 없는 주소다. */
export default function GalleryPage({ params: { locale } }: { params: { locale: string } }) {
  if (process.env.NODE_ENV === "production") notFound();
  setRequestLocale(locale);
  return <AppShell><Gallery /></AppShell>;
}
