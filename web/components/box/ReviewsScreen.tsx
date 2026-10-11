"use client";
/**
 * 후기 모아보기(2026-10-11 파운더: 박스 화면에서 넘어오는, 후기를 한데 모은 화면).
 * 결정 하나: 어느 박스의 후기를 볼지. 박스 화면의 "후기 모두 보기"로 오면 그 박스가 골라져 있다(주소의 box).
 * 별점과 후기 수는 여기 보이는 후기에서만 센다. 박스 화면의 숫자와 같은 셈이다.
 */
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { BOXES } from "@/lib/products";
import { isExampleReview, relativeReviewTime } from "@/lib/community";
import { REVIEW_SAMPLES, summarizeRatings } from "@/lib/reviewSamples";
import { useProductText } from "@/lib/useProductText";
import { useInventoryStore } from "@/stores/inventoryStore";
import { usePublishedReviews } from "@/stores/usePublishedReviews";
import { Chips, Empty, ScreenHead, TextLink } from "@/components/ui/kit";
import { RatingBlock, ReviewCard, type ReviewCardData } from "./BoxReviews";

const ALL = "all";

export function ReviewsScreen() {
  const t = useTranslations("v");
  const locale = useLocale();
  const { boxTitle } = useProductText();
  const asked = useSearchParams().get("box");
  const [picked, setPicked] = useState<string>(asked && BOXES.some((b) => b.slug === asked) ? asked : ALL);
  const mine = usePublishedReviews();
  const owned = useInventoryStore((s) => s.items);

  // 모든 후기: 이 기기에서 실제로 쓴 것이 앞, 샘플이 뒤(날짜가 새것부터)
  const all = useMemo(() => {
    const out: (ReviewCardData & { boxSlug: string })[] = [];
    for (const r of mine) {
      if (isExampleReview(r)) continue;
      const box = BOXES.find((b) => b.slug === r.boxSlug); if (!box) continue;
      const o = owned.find((i) => i.id === r.ownedId);
      const tag = o && (o.status === "DELIVERED" || o.status === "SOLD") ? t("box.reviewReceived") : t("box.reviewOpened");
      out.push({ id: r.id, boxSlug: box.slug, rating: r.rating, text: r.text, item: box.items.find((i) => i.id === r.itemId), photo: r.photo ?? null, meta: `${tag}, ${relativeReviewTime(r.at, Date.now(), locale)}` });
    }
    for (const r of [...REVIEW_SAMPLES].sort((a, b) => b.date.localeCompare(a.date))) {
      const box = BOXES.find((b) => b.slug === r.boxSlug); if (!box) continue;
      out.push({ id: r.id, boxSlug: box.slug, rating: r.rating, text: r.text, item: box.items.find((i) => i.id === r.itemId), photo: null, meta: `${r.author}, ${t("box.reviewShipped")}, ${r.date}` });
    }
    return out;
  }, [mine, owned, locale, t]);

  const boxes = useMemo(() => BOXES.filter((b) => all.some((r) => r.boxSlug === b.slug)), [all]);
  const shown = picked === ALL ? all : all.filter((r) => r.boxSlug === picked);
  const summary = useMemo(() => summarizeRatings(shown.map((r) => r.rating)), [shown]);
  const pickedBox = picked === ALL ? null : BOXES.find((b) => b.slug === picked) ?? null;

  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead back={pickedBox ? "/box/" + pickedBox.slug : "/"} backLabel={t("common.back")} title={t("reviews.title")} desc={t("box.ratingBasis")} />
      <Chips scroll label={t("reviews.filter")} value={picked} onChange={setPicked} options={[{ value: ALL, label: t("reviews.all") }, ...boxes.map((b) => ({ value: b.slug, label: boxTitle(b) }))]} />
      {shown.length === 0 ? <Empty>{t("box.noReviews")}</Empty> : (
        <>
          <RatingBlock summary={summary} />
          <ul className="v-rvgrid">
            {shown.map((c) => {
              const box = BOXES.find((b) => b.slug === c.boxSlug);
              return <ReviewCard key={c.id} card={c} extra={picked === ALL && box ? <span className="v-links"><TextLink href={"/box/" + box.slug}>{boxTitle(box)}</TextLink></span> : undefined} />;
            })}
          </ul>
        </>
      )}
    </div>
  );
}
