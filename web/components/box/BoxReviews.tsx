"use client";
/**
 * 박스의 별점과 후기(2026-10-11 파운더: 박스마다 별점과 후기를 보여 준다).
 *  - RatingInline: 홈 카드와 박스 화면 제목 아래의 한 줄(별 하나, 평균, 후기 수)
 *  - RatingBlock: 평균과 분포
 *  - useReviewCards: 후기 카드의 재료(이 기기에서 쓴 것이 앞, 샘플이 뒤)
 *  - ReviewCard, ReviewSheet: 후기 한 장과 그 상세
 *  - BoxReviews: 박스 화면의 후기 영역(평균과 분포, 옆으로 넘기는 후기 카드, 모아보기로 가는 길)
 * 별점은 상품을 받은 사람이 받은 상품과 배송에 매긴 점수다(뽑기 운의 점수가 아니다).
 * 후기 수와 별점은 실제로 보이는 후기에서만 센다(2026-10-11 파운더: 후기 수와 실제 후기를 맞춘다). 따로 적어 둔 숫자는 없다.
 * 카드(2026-10-12 파운더, 순서는 Codex 와 정했다): 별점, 내용(석 줄까지), 닉네임, 상품명과 가격, 쓴 날짜와 시각. 배송 상태는 적지 않는다.
 *   누르면 상세가 뜬다: 쓴 사람과 시각, 내용 전체, 붙인 사진, 상품과 박스, 그리고 내 후기라면 그 개봉의 검증으로 가는 길.
 *   검증은 미리 잠근 해시와 개봉 기록을 대조하는 것이다. 블록체인 기록이 아니므로 그렇게 적지 않는다. 샘플 후기에는 개봉 기록이 없어 검증 줄이 없다.
 * 지금 보이는 글의 대부분은 lib/reviewSamples 의 샘플이다(프로토타입). 후기 글은 쓴 사람의 말 그대로 둔다(번역하지 않는다).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { BOXES, type ProductBox, type ProductItem } from "@/lib/products";
import { isExampleReview } from "@/lib/community";
import { REVIEW_SAMPLES, summarizeRatings, type RatingSummary } from "@/lib/reviewSamples";
import { useCurrency } from "@/lib/useCurrency";
import { useProductText } from "@/lib/useProductText";
import { useAuthStore } from "@/stores/authStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { usePublishedReviews } from "@/stores/usePublishedReviews";
import { Empty, Row, Rows, TextLink } from "@/components/ui/kit";
import { ScrollRow } from "@/components/ui/ScrollRow";
import { Sheet } from "@/components/ui/Sheet";

/** 별 하나, 평균, 후기 수. 후기가 없으면 아무것도 그리지 않는다 */
export function RatingInline({ summary, long }: { summary: RatingSummary; long?: boolean }) {
  const t = useTranslations("v");
  if (summary.avg === null) return null;
  const avg = summary.avg.toFixed(1);
  return (
    <span className="v-rating" role="img" aria-label={t("box.ratingAria", { avg, n: summary.count })}>
      <Star size={long ? 16 : 13} className="v-star" fill="currentColor" strokeWidth={0} aria-hidden />
      <span className="v-num" aria-hidden>{long ? t("box.ratingLine", { avg, n: summary.count }) : `${avg} (${summary.count})`}</span>
    </span>
  );
}

function Stars({ n }: { n: number }) {
  const t = useTranslations("v");
  return (
    <span className="v-stars" role="img" aria-label={t("box.starsOf", { n })}>
      {[1, 2, 3, 4, 5].map((k) => <Star key={k} size={13} className={k <= n ? "v-star" : "v-star v-star--off"} fill="currentColor" strokeWidth={0} aria-hidden />)}
    </span>
  );
}

/** 평균과 분포. 후기가 있을 때만 쓴다 */
export function RatingBlock({ summary }: { summary: RatingSummary }) {
  const t = useTranslations("v");
  if (summary.avg === null) return null;
  const most = Math.max(1, ...summary.dist);
  return (
    <div className="v-rvsum">
      <div className="v-rvsum-avg">
        <span className="v-rvsum-num v-num">{summary.avg.toFixed(1)}</span>
        <Stars n={Math.round(summary.avg)} />
        <span className="v-small v-num">{t("box.ratingCount", { n: summary.count })}</span>
      </div>
      <ul className="v-rvbars" aria-hidden>
        {[5, 4, 3, 2, 1].map((n) => (
          <li key={n}><span className="v-small v-num">{n}</span><span className="v-rvbar"><i style={{ width: `${(summary.dist[n - 1] / most) * 100}%` }} /></span><span className="v-small v-num">{summary.dist[n - 1]}</span></li>
        ))}
      </ul>
    </div>
  );
}

export interface ReviewCardData {
  id: string; boxSlug: string; rating: number; text: string;
  item?: ProductItem;
  /** 쓴 사람이 붙인 사진. 없으면 카드에는 상품 사진이 나온다 */
  photo: string | null;
  author: string;
  /** 쓴 날짜와 시각(YYYY.MM.DD HH:mm) */
  at: string;
  /** 내 후기의 그 개봉을 직접 계산해 보는 주소. 개봉 기록이 없으면 null */
  verifyHref: string | null;
  mine: boolean;
}

const two = (n: number) => String(n).padStart(2, "0");
/** 기기 시간대의 YYYY.MM.DD HH:mm */
export function stamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${two(d.getMonth() + 1)}.${two(d.getDate())} ${two(d.getHours())}:${two(d.getMinutes())}`;
}

/** 후기 카드들. boxSlug 를 주면 그 박스의 것만. 이 기기에서 쓴 것이 앞, 샘플이 뒤(둘 다 새것부터) */
export function useReviewCards(boxSlug?: string): ReviewCardData[] {
  const t = useTranslations("v");
  const published = usePublishedReviews();
  const owned = useInventoryStore((s) => s.items);
  const me = useAuthStore((s) => s.user);
  return useMemo(() => {
    const out: ReviewCardData[] = [];
    const boxOf = (slug: string) => BOXES.find((b) => b.slug === slug);
    const mine = published.filter((r) => !isExampleReview(r) && (!boxSlug || r.boxSlug === boxSlug)).sort((a, b) => b.at.localeCompare(a.at));
    for (const r of mine) {
      const box = boxOf(r.boxSlug); if (!box) continue;
      const record = owned.find((o) => o.id === r.ownedId);
      const verifyHref = record?.fair?.serverSeed ? "/verify?" + new URLSearchParams({ s: record.fair.serverSeed, h: record.fair.serverSeedHash, c: record.fair.clientSeed, n: String(record.fair.nonce), box: box.slug }).toString() : null;
      out.push({ id: r.id, boxSlug: box.slug, rating: r.rating, text: r.text, item: box.items.find((i) => i.id === r.itemId), photo: r.photo ?? null, author: r.authorName?.trim() || me?.nickname?.trim() || t("reviews.me"), at: stamp(r.at), verifyHref, mine: true });
    }
    for (const r of REVIEW_SAMPLES.filter((s) => !boxSlug || s.boxSlug === boxSlug).sort((a, b) => b.date.localeCompare(a.date))) {
      const box = boxOf(r.boxSlug); if (!box) continue;
      out.push({ id: r.id, boxSlug: box.slug, rating: r.rating, text: r.text, item: box.items.find((i) => i.id === r.itemId), photo: null, author: r.author, at: r.date.replace(/-/g, "."), verifyHref: null, mine: false });
    }
    return out;
  }, [published, owned, me, boxSlug, t]);
}

export function ReviewCard({ card, onOpen }: { card: ReviewCardData; onOpen: (card: ReviewCardData) => void }) {
  const t = useTranslations("v");
  const { fmt } = useCurrency();
  const { itemName } = useProductText();
  const text = useRef<HTMLSpanElement>(null);
  const [cut, setCut] = useState(false);
  // 석 줄을 넘겨 실제로 잘렸을 때만 "더 보기"를 붙인다
  useEffect(() => { const el = text.current; if (el) setCut(el.scrollHeight > el.clientHeight + 1); }, [card.text]);
  const photo = card.photo ?? card.item?.image.src ?? null;
  return (
    <li className="v-rvcard">
      <button type="button" className="v-rvcard-btn" onClick={() => onOpen(card)} aria-haspopup="dialog">
        {photo && <span className="v-rvcard-photo"><img src={photo} alt="" loading="lazy" decoding="async" /></span>}
        <span className="v-rvcard-body">
          <Stars n={card.rating} />
          <span ref={text} className="v-rvcard-text">{card.text}</span>
          {cut && <span className="v-rvcard-more">{t("reviews.more")}</span>}
          <span className="v-small">{card.author}</span>
          {card.item && <span className="v-rvcard-item"><span className="v-card-title">{itemName(card.item)}</span><span className="v-num">{fmt(card.item.value)}</span></span>}
          <span className="v-small v-num">{card.at}</span>
        </span>
      </button>
    </li>
  );
}

/** 후기 상세: 쓴 사람과 시각, 내용 전체, 붙인 사진, 상품과 박스, 내 후기라면 그 개봉의 검증 */
export function ReviewSheet({ card, onClose }: { card: ReviewCardData | null; onClose: () => void }) {
  const t = useTranslations("v");
  const { fmt } = useCurrency();
  const { itemName, boxTitle } = useProductText();
  const box = card ? BOXES.find((b) => b.slug === card.boxSlug) : undefined;
  return (
    <Sheet open={!!card} onClose={onClose} title={t("reviews.detail")} closeLabel={t("common.close")}>
      {card && (
        <>
          <div className="v-rvdetail-head"><Stars n={card.rating} /><span className="v-small">{card.author}</span><span className="v-small v-num">{card.at}</span></div>
          <p className="v-rvdetail-text">{card.text}</p>
          {card.photo && <div className="v-sheet-photo"><img src={card.photo} alt={t("reviews.photo")} /></div>}
          {(card.item || box) && (
            <Rows label={t("reviews.item")}>
              {card.item && <Row label={t("reviews.item")}>{itemName(card.item)}</Row>}
              {card.item && <Row label={t("reviews.itemPrice")}>{fmt(card.item.value)}</Row>}
              {box && <Row label={t("reviews.box")}>{boxTitle(box)}, {fmt(box.price)}</Row>}
            </Rows>
          )}
          {card.mine && (card.verifyHref
            ? <><p className="v-small">{t("reviews.verifyNote")}</p><div className="v-links"><TextLink href={card.verifyHref}>{t("nav.verify")}</TextLink></div></>
            : <p className="v-small">{t("reviews.noRecord")}</p>)}
          {box && <div className="v-links"><TextLink href={"/box/" + box.slug}>{t("reviews.toBox", { box: boxTitle(box) })}</TextLink></div>}
        </>
      )}
    </Sheet>
  );
}

export function BoxReviews({ box, cards }: { box: ProductBox; cards: ReviewCardData[] }) {
  const t = useTranslations("v");
  const summary = useMemo(() => summarizeRatings(cards.map((c) => c.rating)), [cards]);
  const [open, setOpen] = useState<ReviewCardData | null>(null);
  return (
    <section id="reviews" className="v-boxlayout-reviews v-rvstrip" aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="v-section">{t("box.reviews")}</h2>
      {summary.avg === null ? <Empty>{t("box.noReviews")}</Empty> : (
        <>
          <RatingBlock summary={summary} />
          <p className="v-small">{t("box.ratingBasis")}</p>
          <ScrollRow className="v-rvrow">{cards.map((c) => <ReviewCard key={c.id} card={c} onOpen={setOpen} />)}</ScrollRow>
          <div className="v-links"><TextLink href={"/reviews?box=" + box.slug}>{t("box.reviewsAll")}</TextLink></div>
        </>
      )}
      <ReviewSheet card={open} onClose={() => setOpen(null)} />
    </section>
  );
}
