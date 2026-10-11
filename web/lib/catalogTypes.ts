/**
 * 상품 구성의 원천 형식. 상품 데이터(lib/catalog/*.ts, lib/catalog2/*.json)는 이 모양으로만 적는다.
 *   [id, 한국어 이름, 영어 이름, 중국어 이름, 시중 정가(USDT), 종류]
 * 사진 경로는 여기 없고 lib/productImages.ts 가 id 로 쥔다. 확률은 여기 없고 lib/products.ts 가 배정한다.
 */
export type ItemKind = "physical" | "digital" | "cash";
export type ItemSpec = [id: string, name: string, nameEn: string, nameZh: string, value: number, kind?: ItemKind];

/** 옛 카탈로그의 분류(주제 하나에 박스 하나) */
export type LegacyCategory = "dollar" | "tech" | "luxury" | "jackpot" | "collect";
/** 새 카탈로그의 분류(2026-10-12 파운더: 브랜드마다 박스 하나, 카테고리 열여섯). 순서가 홈의 순서다 */
export const CATEGORIES_V2 = ["car", "watch", "bag", "jewelry", "fashion", "mobile", "computer", "gaming", "audio", "camera", "home", "pokemon", "toy", "outdoor", "sport", "beauty"] as const;
export type CategoryV2 = (typeof CATEGORIES_V2)[number];
export type BoxCategory = LegacyCategory | CategoryV2;

/**
 * 확률을 배정하는 방식.
 *  - ladder: 옛 방식. 당첨이 아닌 결과와 구간의 일부가 USDT 이고 터짐 게이지가 있다. 실물은 박스 가격 이상만.
 *  - physical: 새 방식(2026-10-12 파운더). 결과는 전부 실물이다. USDT 결과도 터짐 게이지도 없다. 박스 가격보다 싼 실물이 낮은 구간을 채운다.
 */
export type OddsScheme = "ladder" | "physical";

export interface BoxSpec {
  slug: string;
  title: string;
  titleEn: string;
  titleZh: string;
  category: BoxCategory;
  badge: string;
  tagline: string;
  taglineEn: string;
  taglineZh: string;
  /** 1회 열기 가격(USDT). 옛 박스는 1, 3, 5, 20, 25, 30, 50, 100. 새 박스는 20, 50, 100, 250, 500 */
  price: number;
  trendingRank?: number;
  releasedAt: string;
  popularity: number;
  items: ItemSpec[];
  /** 없으면 ladder */
  scheme?: OddsScheme;
  /** 새 카탈로그: 박스의 브랜드(검색과 묶음에 쓴다) */
  brand?: string;
}
