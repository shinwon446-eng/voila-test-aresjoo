import type { ItemSpec } from "@/lib/catalogTypes";

/**
 * 가방 박스 (30 USDT). 시중 정가는 2026년 기준 대략의 미국 부티크 공시가(1 USDT = 1 USD)를 참고한 어림값이다. 리셀 시세가 아니다.
 * 위 구간(600 USDT 이상)에 에르메스, 샤넬, 루이비통, 디올, 구찌, 프라다 등. 아래로 코치, 롱샴, 지갑과 소품.
 * 에르메스 버킨과 켈리는 매장 구매 조건이 있어 실제 지급 범위는 파운더가 정한다.
 */
export const VAULT_HANDBAG_ITEMS: ItemSpec[] = [
  // 600 USDT 이상
  ["bg-birkin-25", "에르메스 버킨 25 토고", "Hermès Birkin 25 Togo", "爱马仕 Birkin 25 Togo", 12000],
  ["bg-kelly-25", "에르메스 켈리 25 에프송", "Hermès Kelly 25 Epsom", "爱马仕 Kelly 25 Epsom", 11500],
  ["bg-constance-18", "에르메스 콘스탄스 18", "Hermès Constance 18", "爱马仕 Constance 18", 9000],
  ["bg-evelyne", "에르메스 에블린 29", "Hermès Evelyne 29", "爱马仕 Evelyne 29", 3800],
  ["bg-chanel-classic-m", "샤넬 클래식 플랩 미디엄", "Chanel Classic Flap Medium", "香奈儿经典口盖包中号", 11000],
  ["bg-chanel-boy", "샤넬 보이 백 스몰", "Chanel Boy Bag Small", "香奈儿 Boy 小号", 7000],
  ["bg-chanel-22", "샤넬 22 백 미디엄", "Chanel 22 Bag Medium", "香奈儿 22 手袋中号", 6500],
  ["bg-lv-capucines", "루이비통 카퓌신 MM", "Louis Vuitton Capucines MM", "路易威登 Capucines MM", 7500],
  ["bg-lv-neverfull", "루이비통 네버풀 MM", "Louis Vuitton Neverfull MM", "路易威登 Neverfull MM", 2100],
  ["bg-lv-speedy", "루이비통 스피디 반둘리에 25", "Louis Vuitton Speedy Bandoulière 25", "路易威登 Speedy Bandoulière 25", 2000],
  ["bg-lv-onthego", "루이비통 온더고 MM", "Louis Vuitton OnTheGo MM", "路易威登 OnTheGo MM", 3400],
  ["bg-dior-lady", "디올 레이디 디올 미디엄", "Dior Lady Dior Medium", "迪奥 Lady Dior 中号", 6500],
  ["bg-dior-book-tote", "디올 북 토트 미디엄", "Dior Book Tote Medium", "迪奥 Book Tote 中号", 3800],
  ["bg-dior-saddle", "디올 새들 백", "Dior Saddle Bag", "迪奥 Saddle 马鞍包", 4800],
  ["bg-gucci-jackie", "구찌 재키 1961 스몰", "Gucci Jackie 1961 Small", "古驰 Jackie 1961 小号", 3500],
  ["bg-gucci-marmont", "구찌 GG 마몽 스몰", "Gucci GG Marmont Small", "古驰 GG Marmont 小号", 2700],
  ["bg-prada-galleria", "프라다 갤러리아 사피아노 미디엄", "Prada Galleria Saffiano Medium", "普拉达 Galleria Saffiano 中号", 4300],
  ["bg-prada-re-edition", "프라다 리에디션 2005 나일론", "Prada Re-Edition 2005 Nylon", "普拉达 Re-Edition 2005 尼龙", 1900],
  ["bg-celine-triomphe", "셀린느 트리옹프 틴", "Celine Teen Triomphe", "赛琳 Teen Triomphe", 3300],
  ["bg-bottega-jodie", "보테가 베네타 조디 스몰", "Bottega Veneta Jodie Small", "葆蝶家 Jodie 小号", 3400],
  ["bg-bottega-cassette", "보테가 베네타 카세트 백", "Bottega Veneta Cassette Bag", "葆蝶家 Cassette", 3500],
  ["bg-ysl-loulou", "생로랑 룰루 스몰", "Saint Laurent Loulou Small", "圣罗兰 Loulou 小号", 2800],
  ["bg-fendi-baguette", "펜디 바게트 미디엄", "Fendi Baguette Medium", "芬迪 Baguette 中号", 3600],
  ["bg-loewe-puzzle", "로에베 퍼즐 스몰", "Loewe Puzzle Small", "罗意威 Puzzle 小号", 3400],
  ["bg-goyard-st-louis", "고야드 생루이 PM", "Goyard Saint Louis PM", "戈雅 Saint Louis PM", 2000],
  ["bg-burberry-lola", "버버리 롤라 스몰", "Burberry Lola Small", "博柏利 Lola 小号", 2200],
  ["bg-miumiu-wander", "미우미우 원더 마테라세", "Miu Miu Wander Matelassé", "缪缪 Wander Matelassé", 2600],
  ["bg-balenciaga-city", "발렌시아가 르 시티 스몰", "Balenciaga Le City Small", "巴黎世家 Le City 小号", 2500],
  ["bg-chloe-woody", "끌로에 우디 토트 미디엄", "Chloé Woody Tote Medium", "蔻依 Woody 托特中号", 1300],
  ["bg-polene-numero-un", "폴렌 뉘메로 앙", "Polène Numéro Un", "Polène Numéro Un", 600],
  ["bg-lv-wallet", "루이비통 지피 월릿", "Louis Vuitton Zippy Wallet", "路易威登 Zippy 钱包", 1000],
  ["bg-chanel-cardholder", "샤넬 클래식 카드 홀더", "Chanel Classic Card Holder", "香奈儿经典卡包", 800],
  ["bg-hermes-bearn", "에르메스 베안 지갑", "Hermès Béarn Wallet", "爱马仕 Béarn 钱包", 2400],
  ["bg-rimowa-cabin", "리모와 오리지널 캐빈", "Rimowa Original Cabin", "日默瓦 Original 登机箱", 1500],
  ["bg-rimowa-check-in", "리모와 에센셜 체크인 L", "Rimowa Essential Check-In L", "日默瓦 Essential 托运箱 L", 1200],
  // 180 USDT 이상
  ["bg-coach-tabby", "코치 태비 숄더백 26", "Coach Tabby Shoulder Bag 26", "蔻驰 Tabby 单肩包 26", 450],
  ["bg-mk-jet-set", "마이클 코어스 제트 셋 토트", "Michael Kors Jet Set Tote", "迈克高仕 Jet Set 托特", 300],
  ["bg-tory-burch-kira", "토리버치 키라 쉐브론", "Tory Burch Kira Chevron", "汤丽柏琦 Kira Chevron", 500],
  ["bg-marc-jacobs-tote", "마크 제이콥스 더 토트 백", "Marc Jacobs The Tote Bag", "马克雅可布 The Tote Bag", 300],
  ["bg-longchamp-pliage", "롱샴 르 플리아주 L", "Longchamp Le Pliage L", "珑骧 Le Pliage L", 180],
  ["bg-tumi-alpha", "투미 알파 브라보 백팩", "Tumi Alpha Bravo Backpack", "途明 Alpha Bravo 背包", 500],
  ["bg-samsonite-cabin", "쌤소나이트 캐빈 캐리어", "Samsonite Cabin Spinner", "新秀丽登机箱", 250],
  ["bg-lv-cardholder", "루이비통 카드 홀더", "Louis Vuitton Card Holder", "路易威登卡包", 350],
  ["bg-gucci-belt", "구찌 GG 마몽 벨트", "Gucci GG Marmont Belt", "古驰 GG Marmont 腰带", 550],
  ["bg-silk-scarf", "에르메스 트윌리", "Hermès Twilly", "爱马仕 Twilly 丝巾", 230],
  // 60 USDT 이상
  ["bg-kate-spade-wallet", "케이트 스페이드 지갑", "Kate Spade Wallet", "凯特丝蓓钱包", 150],
  ["bg-coach-wristlet", "코치 리스틀렛", "Coach Wristlet", "蔻驰手拿包", 100],
  ["bg-bag-organizer", "펠트 가방 정리함", "Felt Bag Organizer", "毛毡包中包", 60],
  ["gc-amazon100", "아마존 글로벌 기프트카드 $100", "Amazon Global Gift Card $100", "Amazon 全球礼品卡 $100", 100, "digital"],
  ["usdt-100", "100 USDT 인스턴트 드롭", "100 USDT Instant Drop", "100 USDT 即时到账", 100, "cash"],
  // 60 USDT 미만
  ["bg-bag-charm", "가죽 백 참", "Leather Bag Charm", "皮质包饰", 40],
  ["bg-dust-bag-set", "가방 보관용 더스트백 3개", "Dust Bag Set of 3", "包袋防尘袋 3 件", 30],
];
