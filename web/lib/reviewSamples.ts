// 프로토타입용 샘플 후기와 별점. 실제 이용자가 쓴 글과 점수가 아니다(2026-10-11 파운더: 정식 서비스 전이라 샘플로 채운다).
// 정식 서비스에서는 이 파일을 실제 후기 데이터(배송 완료 기록과 개봉 번호가 붙은 것)로 갈아 끼운다.
// 상품과 박스는 실제 카탈로그의 번호를 쓴다(사진과 이름, 가격은 카탈로그에서 온다).
// 별점의 뜻: 상품을 받은 사람이 "받은 상품과 배송"에 매긴 점수다. 뽑기 운의 점수가 아니다.
export interface ReviewSample {
  id: string;
  boxSlug: string;
  itemId: string;
  /** 가린 이름 */
  author: string;
  date: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
}

export const REVIEW_SAMPLES: ReviewSample[] = [
  { id: "rv-gold-1", boxSlug: "vault-gold", itemId: "gd-bar-1g", author: "ji***", date: "2026-10-03", rating: 5, text: "두 번째에 나왔습니다. 배송 신청하고 나흘 만에 받았고 보증서도 같이 왔어요." },
  { id: "rv-gold-2", boxSlug: "vault-gold", itemId: "gd-solitaire-ring", author: "wo***", date: "2026-09-18", rating: 5, text: "솔직히 기대 안 했는데 감정서까지 들어 있어서 놀랐습니다." },
  { id: "rv-gold-3", boxSlug: "vault-gold", itemId: "gd-silver-chain", author: "na***", date: "2026-09-11", rating: 4, text: "체인은 사진 그대로입니다. 통관 때문에 배송이 이틀 더 걸렸어요." },
  { id: "rv-apple-1", boxSlug: "dollar-apple", itemId: "ap-apple-tv", author: "min***", date: "2026-10-02", rating: 5, text: "1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다." },
  { id: "rv-apple-2", boxSlug: "dollar-apple", itemId: "ap-airtag-1", author: "su***", date: "2026-09-26", rating: 5, text: "에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다." },
  { id: "rv-apple-3", boxSlug: "dollar-apple", itemId: "ap-adapter-20w", author: "jh***", date: "2026-09-14", rating: 3, text: "어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요." },
  { id: "rv-watch-1", boxSlug: "vault-submariner", itemId: "wt-garmin-fenix-8", author: "dk***", date: "2026-09-30", rating: 5, text: "개봉 결과 검증으로 직접 확인해 봤는데 번호가 맞더라고요. 시계도 새것이었습니다." },
  { id: "rv-watch-2", boxSlug: "vault-submariner", itemId: "wt-timex-expedition", author: "ho***", date: "2026-09-21", rating: 4, text: "타이맥스라 큰 건 아니지만 보증 카드까지 들어 있었습니다." },
  { id: "rv-bag-1", boxSlug: "vault-handbag", itemId: "bg-coach-wristlet", author: "so***", date: "2026-09-29", rating: 5, text: "가방은 못 뽑았지만 리스틀렛은 실물이 사진보다 낫습니다. 포장이 꼼꼼했어요." },
  { id: "rv-bag-2", boxSlug: "vault-handbag", itemId: "bg-kate-spade-wallet", author: "ye***", date: "2026-09-15", rating: 4, text: "지갑 상태 좋습니다. 더스트백이 살짝 구겨져 온 것만 아쉬웠어요." },
  { id: "rv-galaxy-1", boxSlug: "dollar-galaxy", itemId: "gx-battery-20k", author: "yj***", date: "2026-09-27", rating: 4, text: "열 번쯤 열어서 하나 건졌습니다. 물건은 정품이고 잘 됩니다." },
  { id: "rv-galaxy-2", boxSlug: "dollar-galaxy", itemId: "gx-charger-45w", author: "bo***", date: "2026-09-19", rating: 5, text: "충전기 정품 맞고 엿새 만에 왔어요. 박스 상태도 깨끗했습니다." },
  { id: "rv-gaming-1", boxSlug: "dollar-gaming", itemId: "gm-aerox3", author: "kw***", date: "2026-09-28", rating: 5, text: "마우스 봉인 그대로 왔습니다. 써 보니 가볍고 좋네요." },
  { id: "rv-gaming-2", boxSlug: "dollar-gaming", itemId: "gm-qck-heavy", author: "se***", date: "2026-09-12", rating: 4, text: "패드는 말려서 왔는데 하루 펴 두니 괜찮아졌어요." },
  { id: "rv-console-1", boxSlug: "starter-ps5", itemId: "cs-switch2-dock", author: "hy***", date: "2026-09-25", rating: 5, text: "USDT로 받을까 하다가 배송 받았습니다. 일주일 걸렸고 정품 맞습니다." },
  { id: "rv-console-2", boxSlug: "starter-ps5", itemId: "cs-xbox-controller", author: "do***", date: "2026-09-16", rating: 5, text: "컨트롤러 새 제품이고 바로 연결됐어요." },
  { id: "rv-audio-1", boxSlug: "starter-audio", itemId: "au-qc-earbuds2", author: "tae***", date: "2026-09-22", rating: 5, text: "이어버드가 나와서 바로 배송 신청했습니다. 엿새 걸렸어요." },
  { id: "rv-audio-2", boxSlug: "starter-audio", itemId: "au-rode-ntusbplus", author: "ar***", date: "2026-09-09", rating: 5, text: "마이크 봉인 상태였고 완충 포장이 두꺼웠습니다." },
  { id: "rv-mac-1", boxSlug: "starter-macbook", itemId: "mb-airpods-pro-2", author: "jw***", date: "2026-09-24", rating: 5, text: "에어팟 정품 등록까지 확인했습니다. 만족해요." },
  { id: "rv-mac-2", boxSlug: "starter-macbook", itemId: "mb-benq-screenbar", author: "mi***", date: "2026-09-13", rating: 4, text: "스크린바 잘 쓰고 있습니다. 상자 모서리가 조금 눌려 왔어요." },
  { id: "rv-camera-1", boxSlug: "starter-camera", itemId: "cm-dji-rs4mini", author: "st***", date: "2026-09-23", rating: 5, text: "짐벌 새 제품이고 구성품 빠진 것 없었습니다." },
  { id: "rv-camera-2", boxSlug: "starter-camera", itemId: "cm-lexar-cfexpress", author: "gy***", date: "2026-09-10", rating: 5, text: "메모리 카드 정품 인증 통과했습니다." },
  { id: "rv-home-1", boxSlug: "vault-home", itemId: "hm-cosori-kettle", author: "eun***", date: "2026-09-20", rating: 4, text: "큰 건 아니지만 매일 쓰는 물건이라 만족합니다." },
  { id: "rv-home-2", boxSlug: "vault-home", itemId: "hm-breville-express", author: "ch***", date: "2026-09-08", rating: 5, text: "커피 머신이 통째로 왔습니다. 무거운데 문 앞까지 가져다주셨어요." },
  { id: "rv-car-1", boxSlug: "jackpot-car", itemId: "car-thule-rack", author: "pa***", date: "2026-09-17", rating: 5, text: "캐리어 정품이고 부품 다 들어 있습니다. 설치 설명서도 한글로 왔어요." },
  { id: "rv-car-2", boxSlug: "jackpot-car", itemId: "car-detail-kit", author: "le***", date: "2026-09-07", rating: 4, text: "세차 키트는 무난합니다. 병 하나가 살짝 샜는데 문의하니 바로 다시 보내 줬어요." },
  { id: "rv-pkm-1", boxSlug: "vault-pokemon", itemId: "pkm-151-booster-bundle", author: "ry***", date: "2026-09-19", rating: 5, text: "밀봉 그대로 왔고 슬리브와 하드 케이스에 넣어 보내 주셨습니다." },
  { id: "rv-pkm-2", boxSlug: "vault-pokemon", itemId: "pkm-ex-tin-4", author: "ha***", date: "2026-09-06", rating: 4, text: "틴 모서리가 살짝 찍혀 있었지만 안의 팩은 멀쩡했어요." },
];

/** 박스별 별점 분포(샘플). [1점, 2점, 3점, 4점, 5점] 의 후기 수. 없는 박스는 아직 후기가 없는 것이다 */
export const RATING_SAMPLES: Record<string, readonly [number, number, number, number, number]> = {
  "dollar-apple": [4, 3, 9, 38, 158],
  "dollar-galaxy": [2, 2, 7, 25, 88],
  "dollar-gaming": [1, 3, 6, 22, 71],
  "starter-ps5": [1, 1, 4, 19, 62],
  "starter-audio": [0, 1, 3, 11, 49],
  "starter-macbook": [1, 1, 5, 17, 54],
  "starter-camera": [0, 1, 2, 9, 29],
  "vault-submariner": [0, 0, 2, 8, 43],
  "vault-handbag": [0, 1, 2, 10, 33],
  "vault-home": [0, 0, 3, 9, 24],
  "vault-gold": [0, 0, 1, 6, 31],
  "vault-pokemon": [0, 0, 1, 4, 7],
  "jackpot-car": [0, 0, 1, 5, 13],
};

export interface RatingSummary {
  count: number;
  /** 평균(소수 첫째 자리). 후기가 없으면 null */
  avg: number | null;
  /** [1점, 2점, 3점, 4점, 5점] */
  dist: [number, number, number, number, number];
}

/** 박스의 별점 요약. extra 는 이 기기에서 실제로 쓴 후기의 점수들이다(샘플 위에 더한다) */
export function ratingSummary(boxSlug: string, extra: readonly number[] = []): RatingSummary {
  const dist = [...(RATING_SAMPLES[boxSlug] ?? [0, 0, 0, 0, 0])] as RatingSummary["dist"];
  for (const r of extra) if (Number.isInteger(r) && r >= 1 && r <= 5) dist[r - 1] += 1;
  const count = dist.reduce((a, b) => a + b, 0);
  const sum = dist.reduce((a, n, i) => a + n * (i + 1), 0);
  return { count, avg: count ? Math.round((sum / count) * 10) / 10 : null, dist };
}
