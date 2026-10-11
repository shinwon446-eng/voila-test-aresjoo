"use client";
/**
 * 후기 띠(자리 비교용 임시). 옆으로 넘기는 카드 한 줄이다.
 * 지금은 주소에 ?rv=top, ?rv=mid, ?rv=box 를 붙였을 때만 나온다(어느 자리가 맞는지 파운더가 고르는 중이다).
 * 내용은 lib/reviewSamples 의 샘플이다. 글은 아직 한국어뿐이다(자리가 정해지면 세 언어로 옮긴다).
 */
import { useEffect, useMemo, useState } from "react";
import { BOXES } from "@/lib/products";
import { REVIEW_SAMPLES } from "@/lib/reviewSamples";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";

export type ReviewSpot = "top" | "mid" | "box";

/** 주소의 ?rv= 값. 서버에서 그린 첫 화면과 어긋나지 않게 화면이 뜬 뒤에 읽는다 */
export function useReviewSpot(): ReviewSpot | null {
  const [spot, setSpot] = useState<ReviewSpot | null>(null);
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("rv");
    setSpot(v === "top" || v === "mid" || v === "box" ? v : null);
  }, []);
  return spot;
}

export function ReviewStrip({ boxSlug, title }: { boxSlug?: string; title: string }) {
  const { boxTitle, itemName } = useProductText();
  const { fmt } = useCurrency();
  const rows = useMemo(() => {
    // 박스 화면에서는 그 박스의 후기를 앞에 둔다
    const list = boxSlug ? [...REVIEW_SAMPLES].sort((a, b) => Number(b.boxSlug === boxSlug) - Number(a.boxSlug === boxSlug)) : REVIEW_SAMPLES;
    return list.flatMap((r) => {
      const box = BOXES.find((b) => b.slug === r.boxSlug);
      const item = box?.items.find((i) => i.id === r.itemId);
      return box && item ? [{ r, box, item }] : [];
    });
  }, [boxSlug]);
  if (!rows.length) return null;
  return (
    <section className="v-rvstrip" aria-label={title}>
      <h2 className="v-section">{title}</h2>
      <ul className="v-rvrow">
        {rows.map(({ r, box, item }) => (
          <li key={r.id} className="v-rvcard">
            {item.image.src && <span className="v-rvcard-photo"><img src={item.image.src} alt="" loading="lazy" decoding="async" /></span>}
            <span className="v-rvcard-body">
              <span className="v-rvcard-text">{r.text}</span>
              <span className="v-card-title">{itemName(item)}</span>
              <span className="v-small v-num">{boxTitle(box)}, {fmt(box.price)}</span>
              <span className="v-small">{r.author}, 배송 완료, {r.date}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
