"use client";
/**
 * 박스의 별점과 후기(2026-10-11 파운더: 박스마다 별점과 후기를 보여 준다).
 *  - RatingInline: 홈 카드와 박스 화면 제목 아래의 한 줄(별 하나, 평균, 후기 수)
 *  - RatingBlock: 평균과 분포
 *  - ReviewCard: 후기 한 장
 *  - BoxReviews: 박스 화면의 후기 영역(평균과 분포, 옆으로 넘기는 후기 카드, 모아보기로 가는 길)
 * 별점은 상품을 받은 사람이 받은 상품과 배송에 매긴 점수다(뽑기 운의 점수가 아니다).
 * 후기 수와 별점은 실제로 보이는 후기에서만 센다(2026-10-11 파운더: 후기 수와 실제 후기를 맞춘다). 따로 적어 둔 숫자는 없다.
 * 지금 보이는 글의 대부분은 lib/reviewSamples 의 샘플이다(프로토타입). 이 기기에서 실제로 쓴 후기는 그 위에 더해지고 맨 앞에 온다.
 * 후기 글은 쓴 사람의 말 그대로 둔다(번역하지 않는다).
 */
import { useMemo, type ReactNode } from "react";
import { Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ProductBox, ProductItem } from "@/lib/products";
import { REVIEW_SAMPLES, ratingSummary, type RatingSummary } from "@/lib/reviewSamples";
import { relativeReviewTime } from "@/lib/community";
import { useProductText } from "@/lib/useProductText";
import type { MyReview } from "@/stores/communityStore";
import { Empty, TextLink } from "@/components/ui/kit";
import { ScrollRow } from "@/components/ui/ScrollRow";

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

export interface ReviewCardData { id: string; rating: number; text: string; item?: ProductItem; photo: string | null; meta: string; }

export function ReviewCard({ card, extra }: { card: ReviewCardData; extra?: ReactNode }) {
  const { itemName } = useProductText();
  const photo = card.photo ?? card.item?.image.src ?? null;
  return (
    <li className="v-rvcard">
      {photo && <span className="v-rvcard-photo"><img src={photo} alt="" loading="lazy" decoding="async" /></span>}
      <span className="v-rvcard-body">
        <Stars n={card.rating} />
        <span className="v-rvcard-text">{card.text}</span>
        {card.item && <span className="v-card-title">{itemName(card.item)}</span>}
        <span className="v-small">{card.meta}</span>
        {extra}
      </span>
    </li>
  );
}

/** 한 박스의 후기 카드: 이 기기에서 쓴 것이 앞, 샘플이 뒤 */
export function useReviewCards(box: ProductBox, member: MyReview[], receivedTag: (ownedId: string) => string): ReviewCardData[] {
  const t = useTranslations("v");
  const locale = useLocale();
  return useMemo(() => {
    const find = (id: string) => box.items.find((i) => i.id === id);
    const mine = member.map((r) => ({ id: r.id, rating: r.rating, text: r.text, item: find(r.itemId), photo: r.photo ?? null, meta: `${receivedTag(r.ownedId)}, ${relativeReviewTime(r.at, Date.now(), locale)}` }));
    const samples = REVIEW_SAMPLES.filter((r) => r.boxSlug === box.slug).map((r) => ({ id: r.id, rating: r.rating as number, text: r.text, item: find(r.itemId), photo: null as string | null, meta: `${r.author}, ${t("box.reviewShipped")}, ${r.date}` }));
    return [...mine, ...samples];
  }, [box, member, receivedTag, locale, t]);
}

export function BoxReviews({ box, member, receivedTag }: { box: ProductBox; member: MyReview[]; receivedTag: (ownedId: string) => string }) {
  const t = useTranslations("v");
  const summary = useMemo(() => ratingSummary(box.slug, member.map((r) => r.rating)), [box.slug, member]);
  const cards = useReviewCards(box, member, receivedTag);
  return (
    <section id="reviews" className="v-boxlayout-reviews v-rvstrip" aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="v-section">{t("box.reviews")}</h2>
      {summary.avg === null ? <Empty>{t("box.noReviews")}</Empty> : (
        <>
          <RatingBlock summary={summary} />
          <p className="v-small">{t("box.ratingBasis")}</p>
          {cards.length > 0 && <ScrollRow className="v-rvrow">{cards.map((c) => <ReviewCard key={c.id} card={c} />)}</ScrollRow>}
          <div className="v-links"><TextLink href={"/reviews?box=" + box.slug}>{t("box.reviewsAll")}</TextLink></div>
        </>
      )}
    </section>
  );
}
