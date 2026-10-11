"use client";

import { useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ProductBox, ProductItem } from "@/lib/products";

/**
 * 상품 문자열의 로케일 해석. 표시용 문자열은 messages/<locale>.json 의 products.* 에서 온다.
 * 키가 없으면 자료에 적힌 그 언어의 이름으로 간다(새 카탈로그의 박스와 상품은 문구 파일에 싣지 않고 자료에 세 언어 이름을 둔다).
 */
export function useProductText() {
  const t = useTranslations("products");
  const locale = useLocale();
  const pick = useCallback((ko: string, en: string, zh: string) => (locale === "en" ? en || ko : locale === "zh" ? zh || en || ko : ko), [locale]);
  const boxTitle = useCallback((b: ProductBox) => (t.has(`boxes.${b.slug}.title`) ? t(`boxes.${b.slug}.title`) : pick(b.title, b.titleEn, b.titleZh)), [t, pick]);
  const boxTagline = useCallback((b: ProductBox) => (t.has(`boxes.${b.slug}.tagline`) ? t(`boxes.${b.slug}.tagline`) : pick(b.tagline, b.taglineEn, b.taglineZh)), [t, pick]);
  const boxBadge = useCallback((b: ProductBox) => (t.has(`boxes.${b.slug}.badge`) ? t(`boxes.${b.slug}.badge`) : b.badge), [t]);
  const itemName = useCallback((i: ProductItem) => (t.has(`items.${i.id}`) ? t(`items.${i.id}`) : pick(i.name, i.nameEn, i.nameZh)), [t, pick]);
  return { boxTitle, boxTagline, boxBadge, itemName };
}
