"use client";
/**
 * 박스의 별점과 후기(2026-10-11 파운더: 박스마다 별점과 후기를 보여 준다. 2026-10-13 파운더: 후기 쪽은 원래 모양으로 되돌린다).
 *  - RatingInline: 홈 카드와 박스 화면 제목 아래의 한 줄(별 하나, 평균, 후기 수)
 *  - RatingBlock: 평균과 분포
 *  - useReviewFeed: 후기 카드의 재료. 이 기기에서 쓴 후기를 앞에 두고 그 뒤에 샘플을 새것부터 잇는다
 *  - ReviewCard: 후기 한 장(사진, 별점, 글 석 줄, 별명, 상품과 상품가, 몇 시간 전). 누르면 상세가 뜬다
 *  - ReviewRow: 박스 화면의 옆으로 넘기는 줄(components/ui/ScrollRow). 끝에 가까워지면 뒤에 더 붙인다
 *  - ReviewList: 모아 보기의 격자와 더 보기 단추
 *  - ReviewSheet: 후기 상세
 *  - useRealRatings: 실제 후기의 점수를 박스마다 모은 것. 박스 카드와 박스 화면이 같은 집계(lib/reviewFeed)를 쓴다
 *  - BoxReviews: 박스 화면의 후기 영역(평균과 분포, 옆으로 넘기는 줄, 모아 보기로 가는 길)
 * 별점의 뜻은 lib/reviewSamples 머리에 한 번만 적었다(받은 것과 받는 과정에 대한 만족).
 * 후기 수와 별점은 목록에 나오는 후기에서만 센다(2026-10-11 파운더: 후기 수와 실제 후기를 맞춘다). 따로 적어 둔 숫자는 없다.
 * 카드(2026-10-12 파운더, 순서는 Codex 와 정했다): 사진, 별점, 내용(석 줄까지), 닉네임, 상품명과 상품가, 몇 시간 전인지. 배송 상태는 적지 않는다.
 *   사진은 쓴 사람이 붙인 것이고, 없으면 그 상품의 카탈로그 사진이다. 누르면 상세가 뜬다: 글 전체, 붙은 사진, 상품 카드와 박스, 그리고 내 후기라면 그 개봉의 검증으로 가는 길.
 *   검증은 미리 잠근 해시와 개봉 기록을 대조하는 것이다. 블록체인 기록이 아니므로 그렇게 적지 않는다. 샘플 후기에는 개봉 기록이 없어 검증 줄이 없다.
 * 지금 보이는 글의 대부분은 lib/reviewSamples 가 만든 샘플이다(정식 서비스 전의 시험 사이트, 스위치는 그 파일 머리에 있다).
 *   샘플의 사진은 손님이 찍은 것이 아니라 카탈로그의 그 상품 사진이다. 후기 글은 쓴 사람의 말 그대로 둔다(번역하지 않는다).
 * 시각: 샘플은 "몇 분 전"을 씨앗에서 받아 그대로 적는다(시계를 읽지 않으므로 미리 그린 HTML 과 브라우저가 같다).
 *   내 후기는 카드에는 쓴 시각과 지금의 차이로("3일 전"), 상세에는 쓴 날짜와 시각 그대로("2026.09.02 12:00") 적는다. 내 후기는 브라우저의 저장소에서 화면이 뜬 뒤에야 들어오므로 미리 그린 HTML 에는 없다.
 *   화면을 오래 열어 두어도 내 후기의 "방금 전" 이 멈추지 않게, 내 후기가 있을 때만 1분마다와 탭으로 돌아올 때 지금을 다시 읽는다.
 * 장수: 원래 화면은 박스의 후기를 다 그렸다(많아야 스물여덟 장). 지금은 박스마다 80건에서 400건이라 다 그리지 않는다:
 *   박스 화면의 줄은 처음 BOX_REVIEWS_FIRST 장을 그리고 끝에 가까워지면 REVIEWS_STEP 장을 뒤에 붙인다(단추 없이, 같은 줄에). 모아 보기는 더 보기 단추로 는다.
 *   편 장수와 읽던 자리(화면의 세로, 줄의 가로)는 방문 기록의 그 자리(history.state)에 적어 둔다(useShownRows).
 *   다른 화면에 갔다가 뒤로 오면 같은 장수를 그리기 전에 되살리고 읽던 자리로 돌아간다. 새로 들어온 방문은 처음 장수부터다.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from "react";
import { Package, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { BOX_BY_SLUG, type ProductBox, type ProductItem } from "@/lib/products";
import { MORE_COUNT_MAX, agoOf, allRating, boxRating, feedOrder, isRealReview, realRatings, stamp, timesOfBox, type RealRatings } from "@/lib/reviewFeed";
import type { RatingSummary } from "@/lib/reviewRating";
import { newestSamples, sampleReviews } from "@/lib/reviewSampleGate";
import { useCurrency } from "@/lib/useCurrency";
import { useProductText } from "@/lib/useProductText";
import { useAuthStore } from "@/stores/authStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { usePublishedReviews } from "@/stores/usePublishedReviews";
import { Button, Empty, Row, Rows, TextLink } from "@/components/ui/kit";
import { ScrollRow } from "@/components/ui/ScrollRow";
import { Sheet } from "@/components/ui/Sheet";

/**
 * 처음 그리는 장수: 박스 화면의 줄과 모아 보기 모두 스무 장. 어느 화면에서나 한 번에 스무 장씩 는다.
 * 줄은 끝에 가까워지면 알아서 늘고, 모아 보기는 더 보기 단추로 는다.
 */
export const BOX_REVIEWS_FIRST = 20;
export const ALL_REVIEWS_FIRST = 20;
export const REVIEWS_STEP = 20;

/** 방문 기록의 한 자리에 적어 두는 것: 어느 목록을 몇 장까지 폈고 어디까지 읽었는지(화면의 세로 y, 옆으로 넘기는 줄의 가로 x) */
const SHOWN_STATE = "voilaReviews";
interface ShownState { key: string; shown: number; y: number; x: number }
/** 화면이 뜬 직후 그리기 전에 돌린다(서버에서 미리 그릴 때는 돌지 않는다) */
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * 목록에 보이는 장수. 처음에는 first 장이고 more 를 부르면 REVIEWS_STEP 장씩 는다.
 * 편 장수는 화면의 상태에만 두면 다른 화면에 갔다가 뒤로 왔을 때 처음 장수로 돌아가고, 문서가 짧아져 읽던 자리도 잃는다.
 * 그래서 폈을 때 방문 기록의 그 자리(history.state)에 목록의 이름, 장수, 읽던 자리를 적어 둔다:
 *   뒤로 오거나 앞으로 가면 그 자리에 적힌 것이 돌아오므로 그리기 전에 같은 장수로 되살리고 읽던 자리로 옮긴다.
 *   링크를 눌러 새로 들어온 방문에는 적힌 것이 없으므로 처음 장수부터다. 미리 그린 HTML 과는 언제나 처음 장수로 맞는다(되살리는 일은 그 뒤다).
 * listKey 는 목록의 이름이다(박스 화면은 박스, 모아 보기는 고른 박스나 전체). 이름이 바뀌면 처음 장수로 돌아간다.
 * rowOf 는 옆으로 넘기는 줄의 요소를 주는 함수다(박스 화면): 줄의 가로 자리도 함께 적고 되살린다. 세로로 긴 목록은 주지 않는다.
 */
export function useShownRows(listKey: string, first: number, rowOf?: () => HTMLElement | null): [number, () => void] {
  const [shown, setShown] = useState(first);
  const restore = useRef<{ y: number; x: number } | null>(null);
  useBrowserLayoutEffect(() => {
    const saved = (window.history.state as { [SHOWN_STATE]?: ShownState } | null)?.[SHOWN_STATE];
    if (saved && saved.key === listKey && Number.isInteger(saved.shown) && saved.shown > first) { restore.current = { y: saved.y, x: saved.x ?? 0 }; setShown(saved.shown); }
    else setShown(first);
  }, [listKey, first]);
  // 되살린 장수를 그린 뒤(문서가 다시 길어진 뒤) 읽던 자리로 옮긴다. 브라우저가 먼저 옮겼다면 짧은 문서의 끝에서 멈춰 있다. 줄의 가로 자리는 브라우저가 되살리지 않으므로 여기서 옮긴다
  useBrowserLayoutEffect(() => {
    if (restore.current === null || shown <= first) return;
    const { y, x } = restore.current;
    restore.current = null;
    window.scrollTo(0, y);
    const row = rowOf?.();
    if (row && x > 0) row.scrollLeft = x;
  }, [shown, first, rowOf]);
  const save = useCallback((n: number) => {
    const state = (window.history.state ?? {}) as Record<string, unknown>;
    window.history.replaceState({ ...state, [SHOWN_STATE]: { key: listKey, shown: n, y: Math.round(window.scrollY), x: Math.round(rowOf?.()?.scrollLeft ?? 0) } satisfies ShownState }, "");
  }, [listKey, rowOf]);
  // 폈을 때만 적는다(펴지 않은 목록은 브라우저가 알아서 자리를 되살린다): 장수가 늘 때, 화면이나 줄의 스크롤이 멈출 때, 무엇이든 누를 때(떠나기 직전)
  useEffect(() => {
    if (shown <= first) return;
    save(shown);
    let timer = 0;
    const now = () => save(shown);
    const later = () => { window.clearTimeout(timer); timer = window.setTimeout(now, 150); };
    const row = rowOf?.();
    window.addEventListener("scroll", later, { passive: true });
    row?.addEventListener("scroll", later, { passive: true });
    document.addEventListener("click", now, true);
    return () => { window.clearTimeout(timer); window.removeEventListener("scroll", later); row?.removeEventListener("scroll", later); document.removeEventListener("click", now, true); };
  }, [shown, first, save, rowOf]);
  const more = useCallback(() => setShown((n) => n + REVIEWS_STEP), []);
  return [shown, more];
}

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
      {/* 막대는 눈으로 보는 것이고, 화면 낭독기에는 줄마다 "별 5개 152건" 으로 읽힌다 */}
      <ul className={most >= 1000 ? "v-rvbars v-rvbars--wide" : "v-rvbars"} aria-label={t("box.ratingDist")}>
        {[5, 4, 3, 2, 1].map((n) => (
          <li key={n}>
            <span className="v-rv-sr">{t("box.ratingDistRow", { n, count: grouped(summary.dist[n - 1]) })}</span>
            <span className="v-small v-num" aria-hidden>{n}</span><span className="v-rvbar" aria-hidden><i style={{ width: `${(summary.dist[n - 1] / most) * 100}%` }} /></span><span className="v-small v-num" aria-hidden>{grouped(summary.dist[n - 1])}</span>
          </li>
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
  /** 몇 분 전에 쓴 것인지. 카드에는 이 값으로 "3일 전"을 적는다 */
  ageMin: number;
  /** 쓴 시각(ISO). 내 후기에만 있다: 상세에 날짜와 시각을 적는다. 샘플은 날짜가 없어 null */
  at: string | null;
  likes: number;
  /** 내 후기의 그 개봉을 직접 계산해 보는 주소. 개봉 기록이 없으면 null */
  verifyHref: string | null;
  mine: boolean;
}

/** 기기 시간대의 YYYY.MM.DD HH:mm (나온 상품 화면도 여기서 가져다 쓴다) */
export { stamp };

/** "5시간 전", "4일 전". 분 단위의 나이를 받아 적는다(시계를 읽지 않는다). 구간은 lib/reviewFeed 의 agoOf */
export function useAgo(): (ageMin: number) => string {
  const t = useTranslations("v");
  return (ageMin) => { const { key, n } = agoOf(ageMin); return t("reviews." + key, { n }); };
}

type Published = ReturnType<typeof usePublishedReviews>;

/** 내 후기의 나이를 다시 셀 때 읽는 지금. 내 후기가 있을 때만 1분마다와 탭으로 돌아올 때 새로 읽는다(샘플의 나이는 고정이라 건드리지 않는다) */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const read = () => setNow(Date.now());
    const seen = () => { if (document.visibilityState === "visible") read(); };
    read();
    const timer = window.setInterval(read, 60000);
    document.addEventListener("visibilitychange", seen);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", seen); };
  }, [active]);
  return now;
}

/** 이 기기에서 쓴 후기(boxSlug 를 주면 그 박스의 것만). 화면이 뜬 뒤 브라우저의 저장소에서 들어온다 */
function useMyReviewCards(published: Published, boxSlug: string | null): ReviewCardData[] {
  const t = useTranslations("v");
  const owned = useInventoryStore((s) => s.items);
  const me = useAuthStore((s) => s.user);
  const now = useNow(published.some((r) => isRealReview(r) && (!boxSlug || r.boxSlug === boxSlug)));
  return useMemo(() => {
    const out: ReviewCardData[] = [];
    for (const r of published) {
      if (!isRealReview(r) || (boxSlug && r.boxSlug !== boxSlug)) continue;
      const box = BOX_BY_SLUG[r.boxSlug];
      const record = owned.find((o) => o.id === r.ownedId);
      const verifyHref = record?.fair?.serverSeed ? "/verify?" + new URLSearchParams({ s: record.fair.serverSeed, h: record.fair.serverSeedHash, c: record.fair.clientSeed, n: String(record.fair.nonce), box: box.slug }).toString() : null;
      const at = Date.parse(r.at);
      out.push({ id: r.id, boxSlug: box.slug, rating: r.rating, text: r.text, item: box.items.find((i) => i.id === r.itemId), photo: r.photo ?? null, author: r.authorName?.trim() || me?.nickname?.trim() || t("reviews.me"), ageMin: Number.isFinite(at) ? Math.max(0, (now - at) / 60000) : 0, at: Number.isFinite(at) ? r.at : null, likes: 0, verifyHref, mine: true });
    }
    return out;
  }, [published, owned, me, boxSlug, t, now]);
}

/**
 * 실제 후기의 점수를 박스마다 모은 것. 박스 목록이 한 번 만들어 카드 320장에 나눠 준다(카드마다 저장소를 읽지 않는다).
 * 박스 화면과 모아 보기도 같은 것을 같은 함수(lib/reviewFeed 의 boxRating, allRating)에 넣으므로 카드와 상세의 별점이 어긋나지 않는다.
 */
export function useRealRatings(): RealRatings {
  const published = usePublishedReviews();
  return useMemo(() => realRatings(published), [published]);
}

export interface ReviewFeed { cards: ReviewCardData[]; total: number; summary: RatingSummary }

/**
 * 후기 카드의 재료: 앞에서 shown 장, 전체 건수, 별점 요약. boxSlug 가 null 이면 박스를 가리지 않는다(모아 보기).
 * 차례는 내 후기가 먼저(새것부터), 그다음에 샘플(새것부터)이다(lib/reviewFeed 의 feedOrder). 내 후기는 며칠이 지나도 맨 앞에 있다.
 * 샘플은 보이는 만큼만 만든다. 건수와 별점 요약은 박스 목록의 카드와 같은 셈이다(lib/reviewFeed 의 boxRating).
 */
export function useReviewFeed(boxSlug: string | null, shown: number): ReviewFeed {
  const published = usePublishedReviews();
  const mine = useMyReviewCards(published, boxSlug);
  const real = useMemo(() => realRatings(published), [published]);
  return useMemo(() => {
    const samples = boxSlug ? sampleReviews(boxSlug, shown) : newestSamples(shown);
    const cards: ReviewCardData[] = samples.map((s) => ({ id: s.id, boxSlug: s.boxSlug, rating: s.rating, text: s.text, item: BOX_BY_SLUG[s.boxSlug]?.items.find((i) => i.id === s.itemId), photo: s.photo, author: s.author, ageMin: s.ageMin, at: null, likes: s.likes, verifyHref: null, mine: false }));
    const summary = boxSlug ? boxRating(boxSlug, real) : allRating(real);
    return { cards: feedOrder(mine, cards, shown), total: summary.count, summary };
  }, [mine, real, boxSlug, shown]);
}

/**
 * 후기 한 장(2026-10-13 파운더): 별점, 글 석 줄, 별명과 몇 시간 전, 그리고 나온 상품의 칸(상품 사진 64px, "나온 상품", 이름, 값과 박스값의 몇 배인지).
 * 위에 큰 사진을 두지 않는다: 카드의 높이를 사진 없는 카드와 같게 두면서 모든 카드에 상품 사진을 넣는다(사진이 없는 상품은 그 자리의 그림).
 * 별명과 몇 시간 전은 한 줄에 둔다(사진 칸이 커진 만큼 줄여 높이를 지킨다). 몇 배인지는 지금의 박스값으로 센다(샘플도 지금의 박스값으로 만든다).
 */
export function ReviewCard({ card, onOpen }: { card: ReviewCardData; onOpen: (card: ReviewCardData) => void }) {
  const t = useTranslations("v");
  const { fmt } = useCurrency();
  const { itemName } = useProductText();
  const ago = useAgo();
  const text = useRef<HTMLSpanElement>(null);
  const [cut, setCut] = useState(false);
  // 석 줄을 넘겨 실제로 잘렸을 때만 "더 보기"를 붙인다
  useEffect(() => { const el = text.current; if (el) setCut(el.scrollHeight > el.clientHeight + 1); }, [card.text]);
  const box = BOX_BY_SLUG[card.boxSlug];
  const thumb = card.item?.image.src ?? null;
  const times = card.item && box ? timesOfBox(card.item.value, box.price) : null;
  return (
    <li className="v-rvcard">
      <button type="button" className="v-rvcard-btn" onClick={() => onOpen(card)} aria-haspopup="dialog">
        <span className="v-rvcard-body">
          <Stars n={card.rating} />
          <span ref={text} className="v-rvcard-text">{card.text}</span>
          {cut && <span className="v-rvcard-more">{t("reviews.more")}</span>}
          <span className="v-rvcard-who"><span className="v-small">{card.author}</span><span className="v-small v-num">{ago(card.ageMin)}</span></span>
          {card.item && box && (
            <span className="v-rvcard-item">
              <span className="v-rvcard-thumb">{thumb ? <img src={thumb} alt="" loading="lazy" decoding="async" /> : <span className="v-item-glyph" aria-hidden><Package size={22} strokeWidth={1.4} /></span>}</span>
              <span className="v-rvcard-itembody">
                <span className="v-small">{t("reviews.cameOut")}</span>
                <span className="v-card-title">{itemName(card.item)}</span>
                <span className="v-rvcard-value v-num">{times ? t("reviews.valueLine", { amount: fmt(card.item.value), times }) : t("reviews.valueBelow", { amount: fmt(card.item.value) })}</span>
              </span>
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

/** 늘어난 장수를 화면 낭독기에 알리는 글. 알림 영역은 처음부터 있어야 읽힌다 */
function useLoadedNote(count: number, asked: MutableRefObject<number | null>): string {
  const t = useTranslations("v");
  const [loaded, setLoaded] = useState("");
  useEffect(() => {
    const from = asked.current;
    if (from === null || count <= from) return;
    asked.current = null;
    setLoaded(t("reviews.moreLoaded", { n: grouped(count - from), shown: grouped(count) }));
  }, [count, t, asked]);
  return loaded;
}

/**
 * 박스 화면의 옆으로 넘기는 줄. 줄의 끝에 가까워지면(끝의 표지가 보이는 자리에서 600px 안에 들면) 뒤에 REVIEWS_STEP 장을 붙인다. 단추는 없다.
 * 붙이는 동안 아무것도 없어지지 않으므로 초점은 있던 자리에 그대로 있다(자판으로 끝의 장에 가면 그 장이 보이는 자리로 들어와 다음 장들이 붙는다).
 * 늘어난 장수는 알림 영역에 적는다. 뒤로 와서 되살린 장수(useShownRows)는 넘겨서 는 것이 아니므로 알리지 않는다.
 * end 는 줄 끝의 표지다. 부모가 이것으로 줄(표지의 부모 ul)을 찾아 가로 자리를 적어 둔다.
 */
export function ReviewRow({ feed, end, onMore, onOpen }: { feed: ReviewFeed; end: RefObject<HTMLLIElement>; onMore: () => void; onOpen: (card: ReviewCardData) => void }) {
  const count = feed.cards.length;
  const left = feed.total - count;
  const asked = useRef<number | null>(null);
  const loaded = useLoadedNote(count, asked);
  useEffect(() => {
    const el = end.current;
    if (!el || left <= 0 || typeof IntersectionObserver === "undefined") return;
    const watch = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      watch.disconnect();
      asked.current = count;
      onMore();
    }, { root: el.parentElement, rootMargin: "0px 600px 0px 0px" });
    watch.observe(el);
    return () => watch.disconnect();
  }, [count, left, onMore, end]);
  return (
    <>
      <ScrollRow className="v-rvrow">
        {feed.cards.map((c) => <ReviewCard key={c.id} card={c} onOpen={onOpen} />)}
        <li ref={end} className="v-rvrow-end" aria-hidden />
      </ScrollRow>
      <p className="v-rv-sr" role="status" aria-live="polite" data-reviews-live>{loaded}</p>
    </>
  );
}

/**
 * 모아 보기의 격자: 같은 카드를 칸에 맞춰 놓고, 더 있으면 더 보기 단추를 둔다(원래 화면은 후기가 적어 단추가 없었다. 수만 건이라 단추로 는다).
 * heading 은 격자 앞에 두는 제목이다(화면에는 보이지 않고 화면 낭독기의 제목 이동에만 잡힌다).
 * 남은 건수가 MORE_COUNT_MAX 를 넘으면 더 보기 단추에 수를 적지 않는다.
 * 더 보기를 누른 뒤: 초점을 새로 생긴 첫 장으로 옮긴다. 단추는 끝까지 펴면 사라지므로 단추에 두면 마지막에 초점이 body 로 떨어지고,
 *   자판으로 읽던 사람은 화면 맨 앞에서 다시 시작하게 된다. 늘어난 장수는 알림 영역(화면에는 보이지 않는다)에 적어 화면 낭독기가 읽게 한다.
 *   뒤로 와서 되살린 장수(useShownRows)나 화면이 뜬 뒤 들어온 내 후기로 늘어난 것은 누른 것이 아니므로 초점도 알림도 건드리지 않는다.
 */
export function ReviewList({ feed, onMore, onOpen, heading }: { feed: ReviewFeed; onMore: () => void; onOpen: (card: ReviewCardData) => void; heading?: string }) {
  const t = useTranslations("v");
  const list = useRef<HTMLUListElement>(null);
  /** 더 보기를 누른 때에 보이던 장수. 누르지 않았으면 null */
  const asked = useRef<number | null>(null);
  const count = feed.cards.length;
  const left = feed.total - count;
  useEffect(() => {
    const from = asked.current;
    if (from === null || count <= from) return;
    const first = list.current?.querySelectorAll<HTMLElement>(".v-rvcard-btn")[from];
    // 자리는 브라우저가 옮기지 않게 하고(한가운데로 끌어온다), 가려져 있을 때만 보이는 데까지 옮긴다
    first?.focus({ preventScroll: true });
    first?.scrollIntoView({ block: "nearest" });
  }, [count]);
  const loaded = useLoadedNote(count, asked);
  return (
    <div className="v-rvfeed">
      {heading && <h2 className="v-rv-sr">{heading}</h2>}
      <ul ref={list} className="v-rvgrid">{feed.cards.map((c) => <ReviewCard key={c.id} card={c} onOpen={onOpen} />)}</ul>
      {left > 0 && <Button quiet className="v-rv-morebtn" data-reviews-more onClick={() => { asked.current = count; onMore(); }}>{left > MORE_COUNT_MAX ? t("reviews.moreListPlain") : t("reviews.moreList", { n: grouped(left) })}</Button>}
      <p className="v-rv-sr" role="status" aria-live="polite" data-reviews-live>{loaded}</p>
    </div>
  );
}

/**
 * 후기 상세: 쓴 사람과 시각(내 후기는 날짜와 시각, 샘플은 몇 분 전), 내용 전체, 붙인 사진, 상품 카드(작은 사진, 이름, 상품가)와 박스, 내 후기라면 그 개봉의 검증.
 * 상품 카드의 사진 자리는 사진이 없는 상품도 비우지 않는다(2026-10-12 파운더, 나온 상품의 행과 같다).
 * here 는 이 상세가 뜬 박스 화면의 박스다: 그 박스의 후기에는 "박스 보기" 를 두지 않는다(이미 그 화면이다).
 */
export function ReviewSheet({ card, onClose, here }: { card: ReviewCardData | null; onClose: () => void; here?: string }) {
  const t = useTranslations("v");
  const { fmt } = useCurrency();
  const { itemName, boxTitle } = useProductText();
  const ago = useAgo();
  const box = card ? BOX_BY_SLUG[card.boxSlug] : undefined;
  const thumb = card?.item?.image.src ?? null;
  return (
    <Sheet open={!!card} onClose={onClose} title={t("reviews.detail")} closeLabel={t("common.close")}>
      {card && (
        <>
          {/* 내 후기는 쓴 날짜와 시각을 적는다(실제 기록이다). 샘플은 날짜가 없어 "몇 분 전"만 적는다 */}
          <div className="v-rvdetail-head"><Stars n={card.rating} /><span className="v-small">{card.author}</span><span className="v-small v-num" data-review-at>{card.mine && card.at ? stamp(card.at) : ago(card.ageMin)}</span></div>
          <p className="v-rvdetail-text v-rv-fulltext">{card.text}</p>
          {card.photo && <div className="v-sheet-photo"><img src={card.photo} alt={card.item ? t("reviews.photoOf", { item: itemName(card.item) }) : t("reviews.photo")} /></div>}
          {card.item && (
            <div className="v-rv-item">
              <span className="v-rv-thumb">{thumb ? <img src={thumb} alt="" loading="lazy" decoding="async" /> : <span className="v-item-glyph" aria-hidden><Package size={18} strokeWidth={1.4} /></span>}</span>
              <span className="v-rv-itembody"><span className="v-rv-itemname">{itemName(card.item)}</span><span className="v-small v-num">{t("take.ref", { amount: fmt(card.item.value) })}</span></span>
            </div>
          )}
          {box && <Rows label={t("reviews.box")}><Row label={t("reviews.box")}>{boxTitle(box)}, {fmt(box.price)}</Row></Rows>}
          {card.mine && (card.verifyHref
            ? <><p className="v-small">{t("reviews.verifyNote")}</p><div className="v-links"><TextLink href={card.verifyHref}>{t("nav.verify")}</TextLink></div></>
            : <p className="v-small">{t("reviews.noRecord")}</p>)}
          {box && box.slug !== here && <div className="v-links"><TextLink href={"/box/" + box.slug}>{t("reviews.toBox", { box: boxTitle(box) })}</TextLink></div>}
        </>
      )}
    </Sheet>
  );
}

/** 박스의 별점 요약: 박스 화면 제목 아래의 한 줄이 쓴다. 아래의 줄과 같은 수다 */
export function useBoxRating(boxSlug: string): RatingSummary {
  return useReviewFeed(boxSlug, 0).summary;
}

export function BoxReviews({ box }: { box: ProductBox }) {
  const t = useTranslations("v");
  // 줄 끝의 표지. 줄(표지의 부모 ul)은 ScrollRow 안에 있어 이것으로 찾는다
  const end = useRef<HTMLLIElement>(null);
  const rowOf = useCallback(() => end.current?.parentElement ?? null, []);
  const [shown, more] = useShownRows("box:" + box.slug, BOX_REVIEWS_FIRST, rowOf);
  const feed = useReviewFeed(box.slug, shown);
  const [open, setOpen] = useState<ReviewCardData | null>(null);
  return (
    <section id="reviews" className="v-boxlayout-reviews v-rvstrip" aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="v-section">{t("box.reviews")}</h2>
      {feed.summary.avg === null ? <Empty>{t("box.noReviews")}</Empty> : (
        <>
          <RatingBlock summary={feed.summary} />
          <p className="v-small">{t("box.ratingBasis")}</p>
          <ReviewRow feed={feed} end={end} onMore={more} onOpen={setOpen} />
        </>
      )}
      {/* 후기가 없어도 나온 상품으로 가는 길은 있다(flow/MELT_SPEC.md S8). 후기와 섞지 않고 링크로만 잇는다 */}
      <div className="v-links">
        {feed.summary.avg !== null && <TextLink href={"/reviews?box=" + box.slug}>{t("box.reviewsAll")}</TextLink>}
        <TextLink href="/wins">{t("wins.title")}</TextLink>
      </div>
      <ReviewSheet card={open} onClose={() => setOpen(null)} here={box.slug} />
    </section>
  );
}
