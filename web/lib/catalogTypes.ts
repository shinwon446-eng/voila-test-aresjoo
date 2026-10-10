/**
 * 상품 구성의 원천 형식. 상품 데이터(lib/catalog/*.ts)는 이 모양으로만 적는다.
 *   [id, 한국어 이름, 영어 이름, 중국어 이름, 시중 정가(USDT), 종류]
 * 사진 경로는 여기 없고 lib/productImages.ts 가 id 로 쥔다. 확률은 여기 없고 lib/products.ts 가 배정한다.
 */
export type ItemKind = "physical" | "digital" | "cash";
export type ItemSpec = [id: string, name: string, nameEn: string, nameZh: string, value: number, kind?: ItemKind];
export type BoxCategory = "dollar" | "tech" | "luxury" | "jackpot";

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
  /** 1회 열기 가격(USDT). 1, 3, 5, 20, 25, 30, 50, 100 가운데 하나 */
  price: number;
  trendingRank?: number;
  releasedAt: string;
  popularity: number;
  items: ItemSpec[];
}
