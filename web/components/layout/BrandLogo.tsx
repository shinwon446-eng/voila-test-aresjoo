"use client";
// 로고: 소문자 voila.gg (2026-10-11 파운더가 시안 여섯 가운데 C 를 골랐다. 원본은 brand/logo-drafts/c-logo.svg).
// 글꼴을 쓰지 않고 선으로 그린 글자다. 점만 강조색이고, gg 는 한 단 낮게 둔다. 색은 글자색(currentColor)을 따른다.
import { cn } from "@/lib/format";
import { Link } from "@/i18n/navigation";

const HEIGHT = { sm: 22, md: 26, lg: 34 } as const;

/** 로고의 선들. 머리줄의 작은 로고와 꼬리말의 큰 로고가 같은 그림을 쓴다 */
export function BrandLogoShapes() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3.5,18 14.5,46 25.5,18" />
      <circle cx="45.5" cy="32" r="14" />
      <line x1="72.5" y1="18" x2="72.5" y2="46" />
      <circle cx="72.5" cy="5.5" r="4.2" fill="currentColor" stroke="none" />
      <line x1="87.5" y1="4" x2="87.5" y2="46" />
      <circle cx="115.5" cy="32" r="14" />
      <line x1="129.5" y1="18" x2="129.5" y2="46" />
      <circle cx="142.5" cy="42.5" r="4.6" stroke="none" style={{ fill: "var(--v-spark)" }} />
      <g opacity="0.55">
        <circle cx="167.5" cy="32" r="14" />
        <path d="M181.5 18V46A13 10.5 0 0 1 168.5 56.5H161" />
        <circle cx="208.5" cy="32" r="14" />
        <path d="M222.5 18V46A13 10.5 0 0 1 209.5 56.5H202" />
      </g>
    </g>
  );
}

export function BrandLogo({ size = "md", href = "/", asLink = true, className }: { size?: "sm" | "md" | "lg"; href?: string; asLink?: boolean; className?: string }) {
  const h = HEIGHT[size];
  const content = (
    <svg viewBox="0 0 230 64" height={h} width={Math.round((h * 230) / 64)} aria-hidden="true" focusable="false"><BrandLogoShapes /></svg>
  );
  const styles = cn("inline-flex min-h-11 shrink-0 items-center whitespace-nowrap text-white", className);
  return asLink ? <Link href={href} className={styles} aria-label="VOILA">{content}</Link> : <span className={styles} role="img" aria-label="VOILA">{content}</span>;
}
export default BrandLogo;
