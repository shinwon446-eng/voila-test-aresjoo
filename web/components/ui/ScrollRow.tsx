"use client";
/**
 * 옆으로 넘기는 줄(2026-10-11 파운더: 후기와 상품 띠를 좌우로 넘길 수 있게, 잘리는 끝은 흐리게).
 *  - 손가락으로는 그냥 민다. 마우스로는 양옆의 단추를 누른다(스크롤 막대는 그리지 않으므로 단추가 넘기는 길이다).
 *  - 더 넘길 것이 있는 쪽만 끝이 흐려지고(app/scroll-fade.css), 그쪽 단추만 나온다.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function ScrollRow({ className, label, children }: { className: string; label?: string; children: ReactNode }) {
  const t = useTranslations("v");
  const list = useRef<HTMLUListElement>(null);
  const [more, setMore] = useState({ prev: false, next: false });
  const update = () => {
    const el = list.current; if (!el) return;
    const prev = el.scrollLeft > 4, next = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    setMore((m) => (m.prev === prev && m.next === next ? m : { prev, next }));
  };
  useEffect(() => {
    const el = list.current; if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    const watch = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    watch?.observe(el);
    return () => { el.removeEventListener("scroll", update); watch?.disconnect(); };
  }, []);
  // 안의 것이 늘거나 줄면 다시 잰다
  useEffect(update);
  const move = (dir: 1 | -1) => { const el = list.current; if (el) el.scrollBy({ left: dir * Math.max(160, el.clientWidth * 0.8), behavior: "smooth" }); };
  return (
    <div className="v-hscroll">
      <ul ref={list} className={className} aria-label={label} data-prev={more.prev || undefined} data-next={more.next || undefined}>{children}</ul>
      {more.prev && <button type="button" className="v-hscroll-btn" data-dir="prev" onClick={() => move(-1)} aria-label={t("common.prev")}><ChevronLeft size={20} aria-hidden /></button>}
      {more.next && <button type="button" className="v-hscroll-btn" data-dir="next" onClick={() => move(1)} aria-label={t("common.next")}><ChevronRight size={20} aria-hidden /></button>}
    </div>
  );
}
