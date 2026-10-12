"use client";
/**
 * 후기 모아 보기(2026-10-11 파운더: 박스 화면에서 넘어오는, 후기를 한데 모은 화면).
 * 박스를 가리지 않고 새것부터 보여 준다. 박스 화면의 "후기 모두 보기"로 오면 그 박스가 골라져 있고(주소의 box), 알약으로 전체와 오간다.
 * 모으는 박스는 주소로 열 수 있는 모든 박스다(홈에서 내린 옛 박스도 주소로 열리므로 함께 센다. lib/reviewSamples 의 newestSamples).
 * 박스가 수백 개라 박스마다 알약을 두지 않는다. 다른 박스의 후기는 후기를 눌러 뜨는 상세의 "박스 보기"로 간다.
 * 자료는 박스 화면과 같다(components/box/BoxReviews 의 useReviewFeed): 별점과 후기 수는 여기 목록의 후기에서만 센다.
 * 전체 목록은 박스마다의 "몇 분 전"만으로 줄을 세우고, 보이는 건만 글을 만든다(lib/reviewSamples 의 newestSamples).
 */
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BOX_BY_SLUG } from "@/lib/products";
import { useProductText } from "@/lib/useProductText";
import { Chips, Empty, ScreenHead, TextLink } from "@/components/ui/kit";
import { ALL_REVIEWS_FIRST, RatingBlock, ReviewList, ReviewSheet, REVIEWS_STEP, useReviewFeed, type ReviewCardData } from "./BoxReviews";

const ALL = "all";

export function ReviewsScreen() {
  const t = useTranslations("v");
  const { boxTitle } = useProductText();
  const asked = useSearchParams().get("box");
  const askedBox = asked ? BOX_BY_SLUG[asked] ?? null : null;
  const [picked, setPicked] = useState<string>(askedBox ? askedBox.slug : ALL);
  const [shown, setShown] = useState(ALL_REVIEWS_FIRST);
  const feed = useReviewFeed(picked === ALL ? null : picked, shown);
  const [open, setOpen] = useState<ReviewCardData | null>(null);
  const pickedBox = picked === ALL ? null : BOX_BY_SLUG[picked] ?? null;

  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead back={pickedBox ? "/box/" + pickedBox.slug : "/"} backLabel={t("common.back")} title={t("reviews.title")} desc={t("box.ratingBasis")} />
      {askedBox && <Chips scroll label={t("reviews.filter")} value={picked} onChange={(value) => { setPicked(value); setShown(ALL_REVIEWS_FIRST); }} options={[{ value: ALL, label: t("reviews.all") }, { value: askedBox.slug, label: boxTitle(askedBox) }]} />}
      {feed.total === 0 ? <Empty>{t("box.noReviews")}</Empty> : (
        <>
          <RatingBlock summary={feed.summary} />
          <ReviewList grid heading={t("reviews.listTitle")} feed={feed} onMore={() => setShown((n) => n + REVIEWS_STEP)} onOpen={setOpen} />
        </>
      )}
      <div className="v-links"><TextLink href="/wins">{t("wins.title")}</TextLink></div>
      <ReviewSheet card={open} onClose={() => setOpen(null)} />
    </div>
  );
}
