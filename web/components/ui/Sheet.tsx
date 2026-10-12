"use client";
/**
 * 겹침 화면 하나의 문법: 모바일은 아래에서 올라오는 시트, PC는 가운데 창(DESIGN.md 3장).
 * 안쪽 구조는 화면과 같다(제목, 한 줄 설명, 주 단추 하나, 밑줄 링크 최대 둘).
 * Confirm 은 되돌릴 수 없는 행동(출금, 배송 신청, USDT로 받기, 큰 금액 열기)에만 쓴다.
 */
import { useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useModal } from "@/lib/useModal";
import { OPENING_ARM_DELAY_MS } from "@/lib/openingFlow";
import { Button, TextLink } from "@/components/ui/kit";

export function Sheet({ open, onClose, title, desc, closeLabel, wide, children, locked }: { open: boolean; onClose: () => void; title: ReactNode; desc?: ReactNode; closeLabel: string; wide?: boolean; children: ReactNode; locked?: boolean }) {
  const panel = useRef<HTMLDivElement>(null);
  useModal(open, () => { if (!locked) onClose(); }, panel);
  if (!open) return null;
  return (
    <div className="v-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget && !locked) onClose(); }}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="v-sheet-title" tabIndex={-1} className={"v-sheet" + (wide ? " v-sheet--wide" : "")}>
        <button type="button" className="v-sheet-close" onClick={onClose} disabled={locked} aria-label={closeLabel}><X size={20} aria-hidden /></button>
        <div className="v-sheet-body v-stack">
          <div>
            <h2 id="v-sheet-title" className="v-title">{title}</h2>
            {desc && <p className="v-desc">{desc}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Confirm({ open, onCancel, onConfirm, title, desc, confirmLabel, cancelLabel, busy, busyLabel }: { open: boolean; onCancel: () => void; onConfirm: () => void; title: ReactNode; desc?: ReactNode; confirmLabel: string; cancelLabel: string; busy?: boolean; busyLabel?: string }) {
  const panel = useRef<HTMLDivElement>(null);
  useModal(open, () => { if (!busy) onCancel(); }, panel);
  // 확인창이 뜬 직후에는 확정 단추가 눌리지 않는다. 모바일에서 확정 단추가 앞 시트의 주 단추와 같은 자리에 와서,
  // 같은 자리를 빠르게 두 번 누른 둘째 누름이 확인창을 읽기 전에 확정이 되던 것을 막는다(결과 화면의 잠금과 같은 장치, 같은 길이).
  // 단추를 disabled 로 만들지 않는다: 모양과 초점은 그대로이고 그동안의 누름만 버린다. 취소와 Esc 는 잠그지 않는다
  const shownAt = useRef<number | null>(null);
  if (!open) shownAt.current = null; else if (shownAt.current === null) shownAt.current = Date.now();
  const confirm = () => { if (shownAt.current !== null && Date.now() - shownAt.current >= OPENING_ARM_DELAY_MS) onConfirm(); };
  if (!open) return null;
  return (
    <div className="v-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
      <div ref={panel} role="alertdialog" aria-modal="true" aria-labelledby="v-confirm-title" tabIndex={-1} className="v-sheet">
        <div className="v-sheet-body">
          <h2 id="v-confirm-title" className="v-title">{title}</h2>
          {desc && <p className="v-desc">{desc}</p>}
          {/* 주 단추 하나, 취소는 밑줄 링크(보조 행동 규칙) */}
          <div className="v-confirm-actions">
            <Button onClick={confirm} busy={busy} busyLabel={busyLabel}>{confirmLabel}</Button>
            <div className="v-links"><TextLink onClick={() => { if (!busy) onCancel(); }}>{cancelLabel}</TextLink></div>
          </div>
        </div>
      </div>
    </div>
  );
}
