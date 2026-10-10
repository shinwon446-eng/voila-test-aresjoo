/**
 * messages/{ko,en,zh}.json 의 products.* 를 lib/products.ts 에서 만든다(세 언어 이름은 상품 데이터에 같이 들어 있다).
 *   npm run messages:products
 * UI 문구는 손대지 않는다. 옛 scripts/gen-messages.py 의 상품 부분을 대신한다.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { BOXES } from "../lib/products";

const BADGE_KEY: Record<string, string> = { "드림 박스": "dream", "모빌리티": "mobility", "테크": "tech", "오디오": "audio", "워치": "watch", "럭셔리": "luxury", "라이프스타일": "lifestyle", "1달러": "dollar", "골드": "gold", "카드": "card" };
for (const locale of ["ko", "en", "zh"] as const) {
  const path = new URL(`../messages/${locale}.json`, import.meta.url);
  const json = JSON.parse(readFileSync(path, "utf8").replace(/^﻿/, ""));
  const badges = json.badges ?? {};
  const boxes: Record<string, { title: string; tagline: string; badge: string }> = {};
  const items: Record<string, string> = {};
  for (const box of BOXES) {
    const key = BADGE_KEY[box.badge];
    if (!key || !badges[key]) throw new Error(`${box.slug}: badge ${box.badge} has no messages.badges key`);
    const title = locale === "ko" ? box.title : locale === "en" ? box.titleEn.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bGpu\b/g, "GPU").replace(/\bPs5\b/g, "PS5").replace(/\bIphone\b/g, "iPhone").replace(/\bMacbook\b/g, "MacBook").replace(/\bRtx\b/g, "RTX") : box.titleZh || box.title;
    const tagline = locale === "ko" ? box.tagline : locale === "en" ? box.taglineEn || box.tagline : box.taglineZh || box.tagline;
    boxes[box.slug] = { title, tagline, badge: badges[key] };
    for (const item of box.items) items[item.id] = locale === "ko" ? item.name : locale === "en" ? item.nameEn : item.nameZh || item.nameEn;
  }
  json.products = { boxes, items };
  writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
  console.log(locale, Object.keys(boxes).length, "boxes", Object.keys(items).length, "items");
}
