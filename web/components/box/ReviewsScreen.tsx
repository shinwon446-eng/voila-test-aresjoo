"use client";
/**
 * 후기 모아보기(2026-10-11 파운더: 박스 화면에서 넘어오는, 후기를 한데 모은 화면).
 * 결정 하나: 어느 박스의 후기를 볼지. 박스 화면의 "후기 모두 보기"로 오면 그 박스가 골라져 있다(주소의 box).
 * 별점과 후기 수는 여기 보이는 후기에서만 센다. 박스 화면의 숫자와 같은 셈이다. 카드를 누르면 후기 상세가 뜬다.
 */
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BOXES } from "@/lib/products";
import { summarizeRatings } from "@/lib/reviewSamples";
import { useProductText } from "@/lib/useProductText";
import { Chips, Empty, ScreenHead, TextLink } from "@/components/ui/kit";
import { RatingBlock, ReviewCard, ReviewSheet, useReviewCards, type ReviewCardData } from "./BoxReviews";

const ALL = "all";

export function ReviewsScreen() {
  const t = useTranslations("v");
  const { boxTitle } = useProductText();
  const asked = useSearchParams().get("box");
  const [picked, setPicked] = useState<string>(asked && BOXES.some((b) => b.slug === asked) ? asked : ALL);
  const all = useReviewCards();
  const [open, setOpen] = useState<ReviewCardData | null>(null);

  const boxes = useMemo(() => BOXES.filter((b) => all.some((r) => r.boxSlug === b.slug)), [all]);
  const shown = useMemo(() => (picked === ALL ? all : all.filter((r) => r.boxSlug === picked)), [all, picked]);
  const summary = useMemo(() => summarizeRatings(shown.map((r) => r.rating)), [shown]);
  const pickedBox = picked === ALL ? null : BOXES.find((b) => b.slug === picked) ?? null;

  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead back={pickedBox ? "/box/" + pickedBox.slug : "/"} backLabel={t("common.back")} title={t("reviews.title")} desc={t("box.ratingBasis")} />
      <Chips scroll label={t("reviews.filter")} value={picked} onChange={setPicked} options={[{ value: ALL, label: t("reviews.all") }, ...boxes.map((b) => ({ value: b.slug, label: boxTitle(b) }))]} />
      {shown.length === 0 ? <Empty>{t("box.noReviews")}</Empty> : (
        <>
          <RatingBlock summary={summary} />
          <ul className="v-rvgrid">{shown.map((c) => <ReviewCard key={c.id} card={c} onOpen={setOpen} />)}</ul>
        </>
      )}
      <div className="v-links"><TextLink href="/wins">{t("wins.title")}</TextLink></div>
      <ReviewSheet card={open} onClose={() => setOpen(null)} />
    </div>
  );
}
