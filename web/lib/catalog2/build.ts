/**
 * 새 카탈로그(2026-10-12 파운더: 박스 320개, 브랜드마다 하나, 박스마다 상품 100개, 결과는 전부 실물).
 *  - manifest.json: 박스의 이름, 가격, 카테고리. 사람이 정한 목록이다.
 *  - generated.json: scripts/catalog2/build-index.mjs 가 lib/catalog2/data 의 박스 파일을 검사해 통과한 것만 묶은 것이다.
 *    만드는 중인 박스는 여기 없으므로 앱에 나오지 않는다.
 * 박스의 상품은 자기 상품(items)과 그 카테고리의 공통 상품(pools 에서 use 로 고른 것)을 합친 것이다.
 * 확률은 여기 없다. lib/products.ts 의 실물 전용 배정(physical)이 맡는다.
 */
import type { BoxSpec, CategoryV2, ItemSpec } from "@/lib/catalogTypes";
import manifest from "./manifest.json";
import generated from "./generated.json";

type Tuple = [string, string, string, string, number];
interface ManifestEntry { category: string; slug: string; brand: string; title: string; titleEn: string; titleZh: string; price: number }
interface GeneratedBox { slug: string; items: unknown[]; use: string[] }

const RELEASED = "2026-10-12";
const pools = generated.pools as unknown as Record<string, Tuple[]>;
const files = new Map((generated.boxes as unknown as GeneratedBox[]).map((b) => [b.slug, b]));
const poolIndex = new Map<string, Map<string, Tuple>>();
const poolOf = (category: string): Map<string, Tuple> => {
  let index = poolIndex.get(category);
  if (!index) { index = new Map((pools[category] ?? []).map((t) => [t[0], t])); poolIndex.set(category, index); }
  return index;
};

/** 목록에 있는 박스 전부(자료가 아직 없는 것 포함). 홈이 "준비 중"을 말할 일은 없지만 수를 셀 때 쓴다 */
export const V2_MANIFEST = manifest as unknown as ManifestEntry[];

/** 자료가 다 채워진 박스만. 목록의 순서 그대로 */
export const V2_SPECS: BoxSpec[] = V2_MANIFEST.flatMap((entry, order): BoxSpec[] => {
  const file = files.get(entry.slug);
  if (!file) return [];
  const pool = poolOf(entry.category);
  const items: ItemSpec[] = [
    ...(file.items as Tuple[]).map(([id, name, nameEn, nameZh, value]): ItemSpec => [id, name, nameEn, nameZh, value, "physical"]),
    ...file.use.flatMap((id): ItemSpec[] => { const t = pool.get(id); return t ? [[t[0], t[1], t[2], t[3], t[4], "physical"]] : []; }),
  ];
  return [{
    slug: entry.slug, title: entry.title, titleEn: entry.titleEn, titleZh: entry.titleZh,
    category: entry.category as CategoryV2, badge: "", tagline: "", taglineEn: "", taglineZh: "",
    price: entry.price, releasedAt: RELEASED, popularity: Math.max(0, 1000 - order), items, scheme: "physical", brand: entry.brand,
  }];
});
