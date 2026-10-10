"use client";
/**
 * 토스트는 화면에 흔적이 남지 않는 결과에만 쓴다("주소를 복사했습니다").
 * 화면에 쓴 말, 실패, 안내는 토스트로 띄우지 않는다. 한 번에 하나, 한 줄, 아이콘과 색 없음.
 */
import { useEffect } from "react";
import { create } from "zustand";

interface ToastState { text: string | null; id: number; show: (text: string) => void; clear: () => void }
export const useToast = create<ToastState>()((set) => ({
  text: null,
  id: 0,
  show: (text) => set((s) => ({ text, id: s.id + 1 })),
  clear: () => set({ text: null }),
}));

export function ToastHost() {
  const { text, id, clear } = useToast();
  useEffect(() => {
    if (!text) return;
    const timer = window.setTimeout(clear, 2400);
    return () => window.clearTimeout(timer);
  }, [text, id, clear]);
  return <div className="v-toast-host" aria-live="polite">{text && <div key={id} role="status" className="v-toast">{text}</div>}</div>;
}
