"use client";
/**
 * 후기 모아 보기(2026-10-11 파운더: 박스 화면에서 넘어오는, 후기를 한데 모은 화면).
 * 박스를 가리지 않고 새것부터 격자로 보여 준다(카드는 박스 화면의 줄과 같은 것). 박스 화면의 "후기 모두 보기"로 오면 그 박스가 골라져 있고(주소의 box), 알약으로 전체와 오간다.
 * 모으는 박스는 주소로 열 수 있는 모든 박스다(홈에서 내린 옛 박스도 주소로 열리므로 함께 센다. lib/reviewSamples 의 newestSamples).
 * 박스가 수백 개라 박스마다 알약을 두지 않는다. 다른 박스의 후기는 후기를 눌러 뜨는 상세의 "박스 보기"로 간다.
 * 자료는 박스 화면과 같다(components/box/BoxReviews 의 useReviewFeed): 별점과 후기 수는 여기 목록의 후기에서만 센다.
 * 전체 목록은 박스마다의 "몇 분 전"만으로 줄을 세우고, 보이는 장만 글을 만든다(lib/reviewSamples 의 newestSamples). 수만 건이라 더 보기 단추로 는다.
 * 차례(2026-10-14 파운더: 금액 많은 순, 배수, 최신순): 알약 한 줄로 고른다. 새것부터가 기본이고, 값이 높은 것부터와 배수가 높은 것부터는 주소(?sort=value, ?sort=times)에 적어
 *   뒤로 오거나 새로 고쳐도 그대로다(lib/reviewFeed 의 parseSort). 줄은 글을 만들지 않고 뼈대로 세운다(lib/reviewSamples 의 sortedSamples). 위의 별점 요약은 차례와 상관없다.
 */
import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BOX_BY_SLUG } from "@/lib/products";
import { parseSort, type ReviewSort } from "@/lib/reviewFeed";
import { useProductText } from "@/lib/useProductText";
import { Chips, Empty, ScreenHead, TextLink } from "@/components/ui/kit";
import { ALL_REVIEWS_FIRST, RatingBlock, ReviewList, ReviewSheet, useReviewFeed, useShownRows, type ReviewCardData } from "./BoxReviews";

const ALL = "all";
/** 주소의 sort 에 적는 값. 새것부터(기본)는 적지 않는다 */
const SORT_PARAM: Record<ReviewSort, string | null> = { newest: null, value: "value", times: "times" };

export function ReviewsScreen() {
  const t = useTranslations("v");
  const { boxTitle } = useProductText();
  const params = useSearchParams();
  const asked = params.get("box");
  const askedBox = asked ? BOX_BY_SLUG[asked] ?? null : null;
  const [picked, setPicked] = useState<string>(askedBox ? askedBox.slug : ALL);
  const [sort, setSort] = useState<ReviewSort>(() => parseSort(params.get("sort")));
  // 고른 차례는 주소에 적는다(방문 기록의 그 자리는 그대로 둔다: 편 장수의 기록이 거기 있다)
  const pickSort = useCallback((next: ReviewSort) => {
    setSort(next);
    const url = new URL(window.location.href);
    const param = SORT_PARAM[next];
    if (param) url.searchParams.set("sort", param); else url.searchParams.delete("sort");
    window.history.replaceState(window.history.state, "", url);
  }, []);
  // 편 장수는 고른 목록과 차례마다 방문 기록의 그 자리에 적어 둔다: 뒤로 오면 같은 장수와 읽던 자리로 돌아오고, 알약을 바꾸면 처음 장수부터다
  const [shown, more] = useShownRows("reviews:" + picked + ":" + sort, ALL_REVIEWS_FIRST);
  const feed = useReviewFeed(picked === ALL ? null : picked, shown, sort);
  const [open, setOpen] = useState<ReviewCardData | null>(null);
  const pickedBox = picked === ALL ? null : BOX_BY_SLUG[picked] ?? null;

  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead back={pickedBox ? "/box/" + pickedBox.slug : "/"} backLabel={t("common.back")} title={t("reviews.title")} desc={t("box.ratingBasis")} />
      {askedBox && <Chips scroll label={t("reviews.filter")} value={picked} onChange={setPicked} options={[{ value: ALL, label: t("reviews.all") }, { value: askedBox.slug, label: boxTitle(askedBox) }]} />}
      <Chips scroll label={t("reviews.sort")} value={sort} onChange={pickSort} options={[{ value: "newest", label: t("reviews.sortNewest") }, { value: "value", label: t("reviews.sortValue") }, { value: "times", label: t("reviews.sortTimes") }]} />
      {feed.total === 0 ? <Empty>{t("box.noReviews")}</Empty> : (
        <>
          <RatingBlock summary={feed.summary} />
          <ReviewList heading={t("reviews.listTitle")} feed={feed} onMore={more} onOpen={setOpen} />
        </>
      )}
      <div className="v-links"><TextLink href="/wins">{t("wins.title")}</TextLink></div>
      <ReviewSheet card={open} onClose={() => setOpen(null)} />
    </div>
  );
}
