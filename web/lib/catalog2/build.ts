/**
 * 새 카탈로그(2026-10-12 파운더: 박스 320개, 브랜드마다 하나, 박스마다 상품 100개, 결과는 전부 실물).
 *  - manifest.json: 박스 320개의 이름, 가격, 카테고리. 사람이 정한 목록이다(앱은 읽지 않는다. 자료를 만들고 검사할 때 쓴다).
 *  - generated.json: scripts/catalog2/build-index.mjs 가 lib/catalog2/data 의 박스 파일을 검사해 통과한 것만 묶은 것이다.
 *    박스의 이름과 가격도 여기 같이 실린다. 만드는 중인 박스는 여기 없으므로 앱에 나오지 않는다.
 * 박스의 상품은 자기 상품(items)과 그 카테고리의 공통 상품(pools 에서 use 로 고른 것)을 합친 것이다.
 * 확률은 여기 없다. lib/products.ts 의 실물 전용 배정(physical)이 맡는다.
 */
import type { BoxSpec, CategoryV2, ItemSpec } from "@/lib/catalogTypes";
import generated from "./generated.json";

type Tuple = [string, string, string, string, number];
interface GeneratedBox { slug: string; category: string; brand: string; title: string; titleEn: string; titleZh: string; price: number; order: number; items: unknown[]; use: string[] }

const RELEASED = "2026-10-12";
const pools = generated.pools as unknown as Record<string, Tuple[]>;
const poolIndex = new Map<string, Map<string, Tuple>>();
const poolOf = (category: string): Map<string, Tuple> => {
  let index = poolIndex.get(category);
  if (!index) { index = new Map((pools[category] ?? []).map((t) => [t[0], t])); poolIndex.set(category, index); }
  return index;
};

/** 자료가 다 채워진 박스만. 목록(manifest)의 순서 그대로 */
export const V2_SPECS: BoxSpec[] = (generated.boxes as unknown as GeneratedBox[]).map((file): BoxSpec => {
  const pool = poolOf(file.category);
  const items: ItemSpec[] = [
    ...(file.items as Tuple[]).map(([id, name, nameEn, nameZh, value]): ItemSpec => [id, name, nameEn, nameZh, value, "physical"]),
    ...file.use.flatMap((id): ItemSpec[] => { const t = pool.get(id); return t ? [[t[0], t[1], t[2], t[3], t[4], "physical"]] : []; }),
  ];
  return {
    slug: file.slug, title: file.title, titleEn: file.titleEn, titleZh: file.titleZh,
    category: file.category as CategoryV2, badge: "", tagline: "", taglineEn: "", taglineZh: "",
    price: file.price, releasedAt: RELEASED, popularity: Math.max(0, 1000 - file.order), items, scheme: "physical", brand: file.brand,
  };
});
