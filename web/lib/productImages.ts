import commonsSources from "../scripts/images/sources.json";
import studioFiles from "../scripts/images/studio.json";
import generatedSources from "../scripts/images/generated.json";

const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * 상품 이미지 경로의 단일 원천.
 *
 * 데이터셋(lib/products.ts)에는 URL 을 절대 쓰지 않는다. 상품 id 만 들고 있고
 * 실제 경로는 전부 이 파일이 쥔다. 원격 자산을 로컬 파일로 교체할 때
 * 고칠 파일이 여기 하나뿐이도록 하기 위한 구조다.
 *
 * 교체 절차
 *   1. public/products/<id>.webp 로 파일을 넣는다
 *   2. 아래 SOURCES 의 해당 항목을 { src: "/products/<id>.webp" } 로 바꾼다
 *   3. 끝. 컴포넌트는 손대지 않는다.
 *
 * src 가 null 이면 UI 는 다크 플레이스홀더(코드 플레이트)로 폴백한다.
 * 확보하지 못한 자산에 임의의 URL 을 적어두지 않는다, 깨진 이미지가
 * 조용히 배포되는 것보다 플레이스홀더가 낫다.
 */

export interface ProductImage {
  /** 원격 URL 또는 /public 기준 절대 경로. 미확보면 null */
  src: string | null;
  /** 원격 자산일 때 출처 표기. 로컬 자산은 생략 */
  credit?: string;
  /** 누끼 컷이면 true, 다크 배경 위에 그대로 얹는다. false 면 object-cover 로 채운다. */
  cutout?: boolean;
  /** 실제 사진이 아니라 생성한 참고 이미지면 true. 상품 시트가 그 사실을 한 줄로 적는다. */
  generated?: boolean;
}

const NONE: ProductImage = { src: null };

/**
 * 박스 id / 상품 id → 이미지. 전부 Unsplash 다크 럭셔리/테크 컬렉션(Unsplash License), 위키백과, 스톡 사진은 쓰지 않는다.
 * 여기 없는 키(기프트카드, USDT 캐시백, 일부 소품)는 NONE → ProductArt 가 kind 별 글리프/실루엣으로 그린다.
 */
const SOURCES: Record<string, ProductImage> = {
  "dollar-apple": { src: `${ASSET_BASE}/assets/photography/photo-1695048133142-1a20484d2569.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "dollar-galaxy": { src: `${ASSET_BASE}/assets/photography/photo-1610945415295-d9bbf067e59c.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "dollar-gaming": { src: `${ASSET_BASE}/assets/photography/photo-1587202372634-32705e3bf49c.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "starter-ps5": { src: `${ASSET_BASE}/assets/photography/photo-1578303512597-81e6cc155b3e.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "starter-macbook": { src: `${ASSET_BASE}/assets/photography/photo-1517336714731-489689fd1ca8.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "starter-phone": { src: `${ASSET_BASE}/assets/photography/photo-1592750475338-74b7b21085ab.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "vault-submariner": { src: `${ASSET_BASE}/assets/photography/photo-1587836374828-4dbafa94cf0e.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "vault-omega": { src: `${ASSET_BASE}/assets/photography/photo-1612817159949-195b6eb9e31a.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "vault-handbag": { src: `${ASSET_BASE}/assets/photography/photo-1548036328-c9fa89d128fa.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "vault-gold": { src: `${ASSET_BASE}/assets/photography/photo-1610375461246-83df859d849d.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "starter-audio": { src: `${ASSET_BASE}/assets/photography/photo-1618366712010-f4ae9c647dcb.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "starter-camera": { src: `${ASSET_BASE}/assets/photography/photo-1473968512647-3e447244af8f.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "vault-pokemon": { src: `${ASSET_BASE}/assets/photography/unsplash-pokemon-cover.webp`, credit: "Giorgio Trovato, Unsplash License", cutout: false },
  // 새 카탈로그의 리자몽 박스: 파운더가 스캔한 스카이리지 146/144 한 장(등급 케이스 없는 카드의 스캔이다. 등급별 상품이 같은 스캔을 쓴다)
  "pokemon-charizard-charizard-sk-146-144": { src: `${ASSET_BASE}/assets/photography/scan-charizard-skyridge.webp`, credit: "파운더가 가진 카드를 직접 스캔한 것", cutout: false },
  "pokemon-charizard-charizard-sk-146-144-psa10": { src: `${ASSET_BASE}/assets/photography/scan-charizard-skyridge.webp`, credit: "파운더가 가진 카드를 직접 스캔한 것", cutout: false },
  "pokemon-charizard-charizard-sk-146-144-psa9": { src: `${ASSET_BASE}/assets/photography/scan-charizard-skyridge.webp`, credit: "파운더가 가진 카드를 직접 스캔한 것", cutout: false },
  "jackpot-car": { src: `${ASSET_BASE}/assets/photography/photo-1617788138017-80ad40651399.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "jackpot-cybertruck": { src: `${ASSET_BASE}/assets/photography/photo-1617788138017-80ad40651399.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "jackpot-supercar": { src: `${ASSET_BASE}/assets/photography/photo-1503376780353-7e6692767b70.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "da-iphone16": { src: `${ASSET_BASE}/assets/photography/photo-1592750475338-74b7b21085ab.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "flg-iphone": { src: `${ASSET_BASE}/assets/photography/photo-1695048133142-1a20484d2569.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "da-airpods4": { src: `${ASSET_BASE}/assets/photography/photo-1590658268037-6bf12165a8df.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "sp2-airpods": { src: `${ASSET_BASE}/assets/photography/photo-1590658268037-6bf12165a8df.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "flg-buds": { src: `${ASSET_BASE}/assets/photography/photo-1590658268037-6bf12165a8df.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "gpu-5090": { src: `${ASSET_BASE}/assets/photography/photo-1591488320449-011701bb6704.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "dg-ps5": { src: `${ASSET_BASE}/assets/photography/photo-1606813907291-d86efa9b94db.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "sp-ps5pro": { src: `${ASSET_BASE}/assets/photography/photo-1606813907291-d86efa9b94db.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "dg-switch2": { src: `${ASSET_BASE}/assets/photography/photo-1578303512597-81e6cc155b3e.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "sp-switch2": { src: `${ASSET_BASE}/assets/photography/photo-1578303512597-81e6cc155b3e.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "sp-dualsense": { src: `${ASSET_BASE}/assets/photography/photo-1607853202273-797f1c22a38e.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "apx-mbp": { src: `${ASSET_BASE}/assets/photography/photo-1517336714731-489689fd1ca8.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "gtc-mba": { src: `${ASSET_BASE}/assets/photography/photo-1517336714731-489689fd1ca8.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "gtc-ipadpro": { src: `${ASSET_BASE}/assets/photography/photo-1544244015-0df4b3ffc6b0.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "rlx-sub": { src: `${ASSET_BASE}/assets/photography/photo-1587836374828-4dbafa94cf0e.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "rlx-omega": { src: `${ASSET_BASE}/assets/photography/photo-1614164185128-e4ec99c436d7.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "rlx-tudor": { src: `${ASSET_BASE}/assets/photography/photo-1612817159949-195b6eb9e31a.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "rlx-seiko": { src: `${ASSET_BASE}/assets/photography/photo-1539874754764-5a96559165b0.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "rlx-hamilton": { src: `${ASSET_BASE}/assets/photography/photo-1508057198894-247b23fe5ade.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "sws-omega": { src: `${ASSET_BASE}/assets/photography/photo-1612817159949-195b6eb9e31a.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "sws-tudor": { src: `${ASSET_BASE}/assets/photography/photo-1587836374828-4dbafa94cf0e.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "sws-longines": { src: `${ASSET_BASE}/assets/photography/photo-1508057198894-247b23fe5ade.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "sws-oris": { src: `${ASSET_BASE}/assets/photography/photo-1539874754764-5a96559165b0.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "sws-tissot": { src: `${ASSET_BASE}/assets/photography/photo-1547996160-81dfa63595aa.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "grl-birkin25": { src: `${ASSET_BASE}/assets/photography/photo-1584917865442-de89df76afd3.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "grl-polene": { src: `${ASSET_BASE}/assets/photography/photo-1584917865442-de89df76afd3.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "vg-gold100g": { src: `${ASSET_BASE}/assets/photography/photo-1610375461246-83df859d849d.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "ctd-cybertruck": { src: `${ASSET_BASE}/assets/photography/photo-1617788138017-80ad40651399.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "ctd-model3": { src: `${ASSET_BASE}/assets/photography/photo-1560958089-b8a1929cea89.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "js-modely": { src: `${ASSET_BASE}/assets/photography/photo-1571987502227-9231b837d92a.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "js-porsche": { src: `${ASSET_BASE}/assets/photography/photo-1503376780353-7e6692767b70.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "urb-vanmoof": { src: `${ASSET_BASE}/assets/photography/photo-1571068316344-75bc76f77890.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "ctd-segway": { src: `${ASSET_BASE}/assets/photography/photo-1594751543129-6701ad444259.webp`, credit: "Unsplash , Unsplash License", cutout: false },
  "ctd-dji": { src: `${ASSET_BASE}/assets/photography/photo-1473968512647-3e447244af8f.webp`, credit: "Unsplash , Unsplash License", cutout: false },
};

/**
 * Wikimedia Commons 에서 받은 상품 사진(scripts/images/commons.mjs fetch 가 쓴 sources.json).
 * 파일은 public/assets/photography/commons-<id>.webp, 출처는 같은 폴더의 ATTRIBUTION-commons.md.
 * 그 상품을 찍은 이 사진이 먼저고, 없으면 위 SOURCES 의 일반 사진으로 돌아간다. 이름과 다른 물건이 보이는 사진은 SOURCES 에 두지 않는다(2026-10-11 16건 제거).
 */
// 같은 사진을 우리 톤으로 다시 만든 것(scripts/images/studio.mjs: 배경을 걷어내고 어두운 스튜디오 배경에 올림)이 있으면 그것을 쓴다. 출처는 원본 그대로다.
const STUDIO = studioFiles as Record<string, string>;
const COMMONS: Record<string, ProductImage> = Object.fromEntries(
  Object.entries(commonsSources as Record<string, { file: string; credit: string }>).map(([id, s]) => [id, { src: `${ASSET_BASE}/assets/photography/${STUDIO[id] ?? s.file}`, credit: s.credit, cutout: !!STUDIO[id] }]),
);

/**
 * 맞는 실제 사진을 구하지 못한 상품의 생성 이미지(2026-10-11 파운더 결정: 가방과 골드는 Codex 로 같은 톤으로 만든다).
 * 원본은 scripts/images/gen-raw/<id>.png(저장소에 올리지 않는다), 화면에 쓰는 것은 studio.mjs 가 만든 studio-<id>.webp 뿐이다.
 * 실제 사진(COMMONS)이 생기면 그것이 먼저다.
 */
const GENERATED: Record<string, ProductImage> = Object.fromEntries(
  Object.entries(generatedSources as Record<string, { file: string; credit: string }>)
    .filter(([id]) => STUDIO[id])
    .map(([id, g]) => [id, { src: `${ASSET_BASE}/assets/photography/${STUDIO[id]}`, credit: g.credit, cutout: true, generated: true }]),
);

/** 박스 커버는 그 박스의 대표 실물 사진으로 쓴다. 상품 사진이 없으면 SOURCES 의 커버로 돌아간다 */
const COVER_BY_ITEM: Record<string, string> = {
  "jackpot-car": "car-rr-cullinan",
  "vault-submariner": "wt-gmt-master",
  "vault-gold": "gd-bar-250g",
  "vault-handbag": "bg-birkin-25",
  "vault-home": "hm-samsung-rf29",
  "dollar-apple": "ap-vision-pro",
  "dollar-galaxy": "gx-fold7-256",
  "dollar-gaming": "gm-ryzen9950x3d",
  "starter-ps5": "cs-rog-xbox-ally",
  "starter-audio": "au-xtreme4",
  "starter-macbook": "mb-mac-studio-max",
  "starter-camera": "cm-leica-q3",
  "jackpot-supercar": "sc-lambo-revuelto",
};

/** Unsplash 사진도 같은 톤으로 만든 판이 있으면 바꿔 끼운다(studio.json 의 "file:<원본>" 키) */
const toned = (img: ProductImage): ProductImage => {
  if (!img.src) return img;
  const file = img.src.slice(img.src.lastIndexOf("/") + 1);
  const studio = STUDIO["file:" + file];
  return studio ? { ...img, src: img.src.slice(0, img.src.lastIndexOf("/") + 1) + studio, cutout: true } : img;
};

export const imageFor = (id: string): ProductImage => {
  const lead = COVER_BY_ITEM[id];
  // 그 상품을 찍은 Commons 사진이 먼저, 없을 때만 SOURCES 의 일반 사진(같은 종류의 다른 물건일 수 있다)
  const fromLead = lead ? COMMONS[lead] ?? GENERATED[lead] ?? SOURCES[lead] : undefined;
  return toned(fromLead ?? COMMONS[id] ?? GENERATED[id] ?? SOURCES[id] ?? NONE);
};

/** 자산 확보율, 관리 화면과 테스트에서 쓴다. */
export const imageCoverage = (ids: string[]): { have: number; total: number } => ({
  have: ids.filter((id) => imageFor(id).src).length,
  total: ids.length,
});
