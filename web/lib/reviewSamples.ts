// 프로토타입용 샘플 후기. 실제 이용자가 쓴 글이 아니다(2026-10-11 파운더: 정식 서비스 전이라 샘플로 채운다).
// 정식 서비스에서는 이 파일을 실제 후기 데이터(배송 완료 기록과 개봉 번호가 붙은 것)로 갈아 끼운다.
// 상품과 박스는 실제 카탈로그의 번호를 쓴다(사진과 이름, 가격은 카탈로그에서 온다).
export interface ReviewSample {
  id: string;
  boxSlug: string;
  itemId: string;
  /** 가린 이름 */
  author: string;
  date: string;
  text: string;
}

export const REVIEW_SAMPLES: ReviewSample[] = [
  { id: "rv1", boxSlug: "vault-gold", itemId: "gd-bar-1g", author: "ji***", date: "2026-10-03", text: "두 번째에 나왔습니다. 배송 신청하고 나흘 만에 받았고 보증서도 같이 왔어요." },
  { id: "rv2", boxSlug: "dollar-apple", itemId: "ap-apple-tv", author: "min***", date: "2026-10-02", text: "1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다." },
  { id: "rv3", boxSlug: "vault-submariner", itemId: "wt-garmin-fenix-8", author: "dk***", date: "2026-09-30", text: "개봉 결과 검증으로 직접 확인해 봤는데 번호가 맞더라고요. 그래서 믿고 더 열었습니다." },
  { id: "rv4", boxSlug: "vault-handbag", itemId: "bg-coach-wristlet", author: "so***", date: "2026-09-29", text: "가방은 못 뽑았지만 리스틀렛은 실물이 사진보다 낫습니다. 포장이 꼼꼼했어요." },
  { id: "rv5", boxSlug: "dollar-galaxy", itemId: "gx-battery-20k", author: "yj***", date: "2026-09-27", text: "열 번쯤 열어서 하나 건졌습니다. 대부분은 소액으로 돌아와요. 그건 알고 하셔야 합니다." },
  { id: "rv6", boxSlug: "starter-ps5", itemId: "cs-switch2-dock", author: "hy***", date: "2026-09-25", text: "USDT로 받을까 하다가 배송 받았습니다. 일주일 걸렸고 정품 맞습니다." },
  { id: "rv7", boxSlug: "starter-audio", itemId: "au-qc-earbuds2", author: "tae***", date: "2026-09-22", text: "이어버드가 나와서 바로 배송 신청했습니다. 엿새 걸렸어요." },
  { id: "rv8", boxSlug: "vault-home", itemId: "hm-cosori-kettle", author: "eun***", date: "2026-09-20", text: "큰 건 아니지만 매일 쓰는 물건이라 만족합니다." },
  { id: "rv9", boxSlug: "vault-gold", itemId: "gd-solitaire-ring", author: "wo***", date: "2026-09-18", text: "솔직히 기대 안 했는데 감정서까지 들어 있어서 놀랐습니다." },
];
