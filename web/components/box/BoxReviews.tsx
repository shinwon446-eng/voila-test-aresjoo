"use client";
/**
 * 박스의 별점과 후기(2026-10-11 파운더: 박스마다 별점과 후기를 보여 준다).
 *  - RatingInline: 홈 카드와 박스 화면 제목 아래의 한 줄(별 하나, 평균, 후기 수)
 *  - RatingBlock: 평균과 분포
 *  - useReviewFeed: 후기 목록의 재료. 샘플과 이 기기에서 쓴 후기를 새것부터 한 줄로 섞는다
 *  - ReviewCard, ReviewList, ReviewSheet: 후기 한 건, 목록(전체 N건, 처음 10건과 더 보기), 그 상세
 *  - BoxReviews: 박스 화면의 후기 영역(평균과 분포, 목록)
 * 별점의 뜻은 lib/reviewSamples 머리에 한 번만 적었다(받은 것과 받는 과정에 대한 만족).
 * 후기 수와 별점은 목록에 나오는 후기에서만 센다(2026-10-11 파운더: 후기 수와 실제 후기를 맞춘다). 따로 적어 둔 숫자는 없다.
 * 한 건(2026-10-12 파운더, flow/MELT_SPEC.md V3): 별점, 별명, 몇 시간 전인지, 글(넉 줄까지), 붙은 사진, 그 상품의 카드(작은 사진, 이름, 상품가), 좋아요 수.
 *   누르면 상세가 뜬다: 글 전체, 붙은 사진, 상품과 박스, 그리고 내 후기라면 그 개봉의 검증으로 가는 길.
 *   검증은 미리 잠근 해시와 개봉 기록을 대조하는 것이다. 블록체인 기록이 아니므로 그렇게 적지 않는다. 샘플 후기에는 개봉 기록이 없어 검증 줄이 없다.
 * 지금 보이는 글의 대부분은 lib/reviewSamples 가 만든 샘플이다(정식 서비스 전의 시험 사이트, 스위치는 그 파일 머리에 있다).
 *   샘플의 사진은 손님이 찍은 것이 아니라 카탈로그의 그 상품 사진이다. 후기 글은 쓴 사람의 말 그대로 둔다(번역하지 않는다).
 * 시각: 샘플은 "몇 분 전"을 씨앗에서 받아 그대로 적는다(시계를 읽지 않으므로 미리 그린 HTML 과 브라우저가 같다).
 *   내 후기는 쓴 시각과 지금의 차이로 적는다. 내 후기는 브라우저의 저장소에서 화면이 뜬 뒤에야 들어오므로 미리 그린 HTML 에는 없다.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Package, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { BOX_BY_SLUG, type ProductBox, type ProductItem } from "@/lib/products";
import { isExampleReview } from "@/lib/community";
import { allRatingSummary, newestSamples, ratingSummary, sampleReviews, type RatingSummary } from "@/lib/reviewSamples";
import { useCurrency } from "@/lib/useCurrency";
import { useProductText } from "@/lib/useProductText";
import { useAuthStore } from "@/stores/authStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { usePublishedReviews } from "@/stores/usePublishedReviews";
import { Button, Empty, Row, Rows, TextLink } from "@/components/ui/kit";
import { Sheet } from "@/components/ui/Sheet";

/** 목록에 처음 보이는 건수와 더 보기 한 번에 느는 건수 */
export const REVIEWS_FIRST = 10;
export const REVIEWS_STEP = 20;

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

const grouped = (n: number) => n.toLocaleString("en-US");

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
        <span className="v-small v-num">{t("box.ratingCount", { n: grouped(summary.count) })}</span>
      </div>
      {/* 건수가 네 자리를 넘으면(모아 보기) 숫자 칸을 넓힌다 */}
      <ul className={most >= 1000 ? "v-rvbars v-rvbars--wide" : "v-rvbars"} aria-hidden>
        {[5, 4, 3, 2, 1].map((n) => (
          <li key={n}><span className="v-small v-num">{n}</span><span className="v-rvbar"><i style={{ width: `${(summary.dist[n - 1] / most) * 100}%` }} /></span><span className="v-small v-num">{grouped(summary.dist[n - 1])}</span></li>
        ))}
      </ul>
    </div>
  );
}

export interface ReviewCardData {
  id: string; boxSlug: string; rating: number; text: string;
  item?: ProductItem;
  /** 후기에 붙은 사진. 내 후기는 올린 사진, 샘플은 카탈로그의 그 상품 사진. 없으면 null */
  photo: string | null;
  author: string;
  /** 몇 분 전에 쓴 것인지. 목록은 이 값이 작은 것부터다 */
  ageMin: number;
  likes: number;
  /** 내 후기의 그 개봉을 직접 계산해 보는 주소. 개봉 기록이 없으면 null */
  verifyHref: string | null;
  mine: boolean;
}

const two = (n: number) => String(n).padStart(2, "0");
/** 기기 시간대의 YYYY.MM.DD HH:mm (나온 상품 화면이 쓴다) */
export function stamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${two(d.getMonth() + 1)}.${two(d.getDate())} ${two(d.getHours())}:${two(d.getMinutes())}`;
}

/** "5시간 전", "4일 전". 분 단위의 나이를 받아 적는다(시계를 읽지 않는다) */
export function useAgo(): (ageMin: number) => string {
  const t = useTranslations("v");
  return (ageMin) => {
    const m = Math.max(0, Math.floor(ageMin));
    if (m < 1) return t("reviews.agoNow");
    if (m < 60) return t("reviews.agoMin", { n: m });
    if (m < 1440) return t("reviews.agoHour", { n: Math.floor(m / 60) });
    if (m < 43200) return t("reviews.agoDay", { n: Math.floor(m / 1440) });
    if (m < 525600) return t("reviews.agoMonth", { n: Math.floor(m / 43200) });
    return t("reviews.agoYear", { n: Math.floor(m / 525600) });
  };
}

/** 이 기기에서 쓴 후기(boxSlug 를 주면 그 박스의 것만). 화면이 뜬 뒤 브라우저의 저장소에서 들어온다 */
function useMyReviewCards(boxSlug: string | null): ReviewCardData[] {
  const t = useTranslations("v");
  const published = usePublishedReviews();
  const owned = useInventoryStore((s) => s.items);
  const me = useAuthStore((s) => s.user);
  return useMemo(() => {
    const out: ReviewCardData[] = [];
    const now = Date.now();
    for (const r of published) {
      if (isExampleReview(r) || (boxSlug && r.boxSlug !== boxSlug)) continue;
      const box = BOX_BY_SLUG[r.boxSlug]; if (!box) continue;
      const record = owned.find((o) => o.id === r.ownedId);
      const verifyHref = record?.fair?.serverSeed ? "/verify?" + new URLSearchParams({ s: record.fair.serverSeed, h: record.fair.serverSeedHash, c: record.fair.clientSeed, n: String(record.fair.nonce), box: box.slug }).toString() : null;
      const at = Date.parse(r.at);
      out.push({ id: r.id, boxSlug: box.slug, rating: r.rating, text: r.text, item: box.items.find((i) => i.id === r.itemId), photo: r.photo ?? null, author: r.authorName?.trim() || me?.nickname?.trim() || t("reviews.me"), ageMin: Number.isFinite(at) ? Math.max(0, (now - at) / 60000) : 0, likes: 0, verifyHref, mine: true });
    }
    return out;
  }, [published, owned, me, boxSlug, t]);
}

export interface ReviewFeed { cards: ReviewCardData[]; total: number; summary: RatingSummary }

/**
 * 후기 목록: 새것부터 shown 건, 전체 건수, 별점 요약. boxSlug 가 null 이면 박스를 가리지 않는다(모아 보기).
 * 샘플은 보이는 만큼만 만든다. 건수와 별점 요약은 박스 목록의 카드와 같은 셈이다(lib/reviewSamples 의 ratingSummary).
 */
export function useReviewFeed(boxSlug: string | null, shown: number): ReviewFeed {
  const mine = useMyReviewCards(boxSlug);
  return useMemo(() => {
    const samples = boxSlug ? sampleReviews(boxSlug, shown) : newestSamples(shown);
    const cards: ReviewCardData[] = samples.map((s) => ({ id: s.id, boxSlug: s.boxSlug, rating: s.rating, text: s.text, item: BOX_BY_SLUG[s.boxSlug]?.items.find((i) => i.id === s.itemId), photo: s.photo, author: s.author, ageMin: s.ageMin, likes: s.likes, verifyHref: null, mine: false }));
    const ratings = mine.map((c) => c.rating);
    const summary = boxSlug ? ratingSummary(boxSlug, ratings) : allRatingSummary(ratings);
    return { cards: [...mine, ...cards].sort((a, b) => a.ageMin - b.ageMin).slice(0, shown), total: summary.count, summary };
  }, [mine, boxSlug, shown]);
}

export function ReviewCard({ card, onOpen }: { card: ReviewCardData; onOpen: (card: ReviewCardData) => void }) {
  const t = useTranslations("v");
  const { fmt } = useCurrency();
  const { itemName } = useProductText();
  const ago = useAgo();
  const text = useRef<HTMLSpanElement>(null);
  const [cut, setCut] = useState(false);
  // 넉 줄을 넘겨 실제로 잘렸을 때만 "더 보기"를 붙인다
  useEffect(() => { const el = text.current; if (el) setCut(el.scrollHeight > el.clientHeight + 1); }, [card.text]);
  const thumb = card.item?.image.src ?? null;
  return (
    <li className="v-rv">
      <button type="button" className="v-rv-btn" onClick={() => onOpen(card)} aria-haspopup="dialog">
        <span className="v-rv-head"><Stars n={card.rating} /><span className="v-rv-author">{card.author}</span><span className="v-rv-ago v-small v-num">{ago(card.ageMin)}</span></span>
        <span ref={text} className="v-rv-text">{card.text}</span>
        {cut && <span className="v-rvcard-more">{t("reviews.more")}</span>}
        {card.photo && <span className="v-rv-photo"><img src={card.photo} alt={t("reviews.photo")} loading="lazy" decoding="async" /></span>}
        {card.item && (
          <span className="v-rv-item">
            {/* 사진이 없는 상품도 사진 자리를 비우지 않는다(2026-10-12 파운더, 나온 상품의 행과 같다) */}
            <span className="v-rv-thumb">{thumb ? <img src={thumb} alt="" loading="lazy" decoding="async" /> : <span className="v-item-glyph" aria-hidden><Package size={18} strokeWidth={1.4} /></span>}</span>
            <span className="v-rv-itembody"><span className="v-rv-itemname">{itemName(card.item)}</span><span className="v-small v-num">{t("take.ref", { amount: fmt(card.item.value) })}</span></span>
          </span>
        )}
        {card.likes > 0 && <span className="v-small v-num">{t("reviews.likes", { n: card.likes })}</span>}
      </button>
    </li>
  );
}

/** 후기 목록: "전체 N건", 새것부터, 더 있으면 더 보기 단추. grid 는 넓은 화면에서 두 줄로 놓는다(모아 보기) */
export function ReviewList({ feed, onMore, onOpen, grid }: { feed: ReviewFeed; onMore: () => void; onOpen: (card: ReviewCardData) => void; grid?: boolean }) {
  const t = useTranslations("v");
  const left = feed.total - feed.cards.length;
  return (
    <div className="v-rvfeed">
      <p className="v-rv-total v-num">{t("reviews.total", { n: grouped(feed.total) })}</p>
      <ul className={grid ? "v-rvlist v-rvlist--grid" : "v-rvlist"}>{feed.cards.map((c) => <ReviewCard key={c.id} card={c} onOpen={onOpen} />)}</ul>
      {left > 0 && <Button quiet className="v-rv-morebtn" data-reviews-more onClick={onMore}>{t("reviews.moreList", { n: grouped(left) })}</Button>}
    </div>
  );
}

/** 후기 상세: 쓴 사람과 시각, 내용 전체, 붙인 사진, 상품과 박스, 내 후기라면 그 개봉의 검증 */
export function ReviewSheet({ card, onClose }: { card: ReviewCardData | null; onClose: () => void }) {
  const t = useTranslations("v");
  const { fmt } = useCurrency();
  const { itemName, boxTitle } = useProductText();
  const ago = useAgo();
  const box = card ? BOX_BY_SLUG[card.boxSlug] : undefined;
  return (
    <Sheet open={!!card} onClose={onClose} title={t("reviews.detail")} closeLabel={t("common.close")}>
      {card && (
        <>
          <div className="v-rvdetail-head"><Stars n={card.rating} /><span className="v-small">{card.author}</span><span className="v-small v-num">{ago(card.ageMin)}</span></div>
          <p className="v-rvdetail-text v-rv-fulltext">{card.text}</p>
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

/** 박스의 별점 요약: 박스 화면 제목 아래의 한 줄이 쓴다. 아래의 목록과 같은 수다 */
export function useBoxRating(boxSlug: string): RatingSummary {
  return useReviewFeed(boxSlug, 0).summary;
}

export function BoxReviews({ box }: { box: ProductBox }) {
  const t = useTranslations("v");
  const [shown, setShown] = useState(REVIEWS_FIRST);
  const feed = useReviewFeed(box.slug, shown);
  const [open, setOpen] = useState<ReviewCardData | null>(null);
  return (
    <section id="reviews" className="v-boxlayout-reviews v-rvstrip" aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="v-section">{t("box.reviews")}</h2>
      {feed.summary.avg === null ? <Empty>{t("box.noReviews")}</Empty> : (
        <>
          <RatingBlock summary={feed.summary} />
          <p className="v-small">{t("box.ratingBasis")}</p>
          <ReviewList feed={feed} onMore={() => setShown((n) => n + REVIEWS_STEP)} onOpen={setOpen} />
        </>
      )}
      {/* 후기가 없어도 나온 상품으로 가는 길은 있다(flow/MELT_SPEC.md S8). 후기와 섞지 않고 링크로만 잇는다 */}
      <div className="v-links">
        {feed.summary.avg !== null && <TextLink href={"/reviews?box=" + box.slug}>{t("box.reviewsAll")}</TextLink>}
        <TextLink href="/wins">{t("wins.title")}</TextLink>
      </div>
      <ReviewSheet card={open} onClose={() => setOpen(null)} />
    </section>
  );
}
