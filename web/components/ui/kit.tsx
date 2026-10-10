"use client";
/**
 * VOILA 새 화면의 기본 부품(DESIGN.md 3장). 모양은 app/ui.css 의 v- 클래스가 정한다.
 * 화면 하나에 주 단추(Button) 하나, 보조 행동은 TextLink 최대 둘.
 */
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/** 주 단추: 흰 알약, 화면에 하나. busy 면 단추 자리에 상태 글이 온다("확인 중"). */
export function Button({ busy, busyLabel, quiet, auto, className, children, disabled, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean; busyLabel?: string; quiet?: boolean; auto?: boolean }) {
  return (
    <button type="button" {...rest} disabled={disabled || busy} data-busy={busy || undefined} className={cx("v-btn", quiet && "v-btn--quiet", auto && "v-btn--auto", className)}>
      {busy && busyLabel ? busyLabel : children}
    </button>
  );
}

/** 주 단추 모양의 링크(다른 화면으로 갈 때) */
export function ButtonLink({ href, quiet, className, children }: { href: string; quiet?: boolean; className?: string; children: ReactNode }) {
  return <Link href={href} className={cx("v-btn", quiet && "v-btn--quiet", className)}>{children}</Link>;
}

/** 보조 행동: 14px 밑줄 링크. href 가 있으면 이동, 없으면 단추. */
export function TextLink({ href, onClick, external, children, className }: { href?: string; onClick?: () => void; external?: boolean; children: ReactNode; className?: string }) {
  if (href && external) return <a href={href} target="_blank" rel="noreferrer" className={cx("v-link", className)}>{children} ↗</a>;
  if (href) return <Link href={href} onClick={onClick} className={cx("v-link", className)}>{children}</Link>;
  return <button type="button" onClick={onClick} className={cx("v-link", className)}>{children}</button>;
}

/** 고르는 알약 묶음. 누르면 곧 선택된다(계속 단추 없음). */
export function Chips<T extends string | number>({ label, options, value, onChange, scroll, disabled }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (value: T) => void; scroll?: boolean; disabled?: boolean }) {
  return (
    <div role="group" aria-label={label} className={cx("v-chips", scroll && "v-chips--scroll")}>
      {options.map((o) => (
        <button key={String(o.value)} type="button" disabled={disabled} aria-pressed={o.value === value} onClick={() => onChange(o.value)} className="v-chip">{o.label}</button>
      ))}
    </div>
  );
}

/** 화면 머리: 제목 하나와 한 줄 설명. back 이 있으면 뒤로 가기 하나. */
export function ScreenHead({ title, desc, back, backLabel, id }: { title: ReactNode; desc?: ReactNode; back?: string | (() => void); backLabel?: string; id?: string }) {
  return (
    <header>
      <div className="v-screenhead">
        {typeof back === "string" && <Link href={back} className="v-back" aria-label={backLabel}><ChevronLeft size={22} aria-hidden /></Link>}
        {typeof back === "function" && <button type="button" onClick={back} className="v-back" aria-label={backLabel}><ChevronLeft size={22} aria-hidden /></button>}
        <h1 id={id} className="v-title">{title}</h1>
      </div>
      {desc && <p className="v-desc">{desc}</p>}
    </header>
  );
}

/** 통계와 목록은 행으로: 라벨 왼쪽, 값 오른쪽 */
export function Rows({ children, label }: { children: ReactNode; label?: string }) {
  return <dl className="v-rows" aria-label={label}>{children}</dl>;
}
export function Row({ label, children }: { label: ReactNode; children: ReactNode }) {
  return <div className="v-row"><dt>{label}</dt><dd className="v-num">{children}</dd></div>;
}

export function Card({ outline, className, children }: { outline?: boolean; className?: string; children: ReactNode }) {
  return <div className={cx("v-card", outline && "v-card--outline", className)}>{children}</div>;
}

export const Field = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string }>(function Field({ label, ...rest }, ref) {
  return <label className="v-field"><span className="v-field-label">{label}</span><input {...rest} ref={ref} className="v-input" /></label>;
});

/** 상태 한 줄. 막힌 경우와 실패는 팝업이 아니라 이 한 줄로 쓴다. 빨강은 fail 에만. */
export function Line({ fail, children, live = true }: { fail?: boolean; children: ReactNode; live?: boolean }) {
  return <p role={fail ? "alert" : live ? "status" : undefined} className={cx("v-line", fail && "v-line--fail")}>{children}</p>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="v-empty">{children}</p>;
}

/** 로딩: 돌아가는 표시 대신 자리만 잡아 화면이 덜컥거리지 않게 한다 */
export function Skeleton({ height, label }: { height: number; label: string }) {
  return <div className="v-skel" style={{ height }} role="status" aria-label={label} />;
}
