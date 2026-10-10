import type { ItemSpec } from "@/lib/catalogTypes";

/**
 * 골드와 주얼리 박스 (50 USDT). 금과 은은 2026년 기준 대략의 시세(1 USDT = 1 USD)에 소매 프리미엄을 더한 어림값이고, 시세에 따라 바뀐다.
 * 주얼리는 브랜드 공시가 참고. 위 구간(1,000 USDT 이상)에 골드바와 주얼리, 아래로 소형 골드와 실버.
 */
export const VAULT_GOLD_ITEMS: ItemSpec[] = [
  // 1,000 USDT 이상
  ["gd-bar-1kg", "순금 골드바 1kg", "Gold Bar 1kg", "足金金条 1kg", 100000],
  ["gd-bar-500g", "순금 골드바 500g", "Gold Bar 500g", "足金金条 500g", 50000],
  ["gd-bar-250g", "순금 골드바 250g", "Gold Bar 250g", "足金金条 250g", 25000],
  ["gd-bar-100g", "순금 골드바 100g", "Gold Bar 100g", "足金金条 100g", 10200],
  ["gd-bar-50g", "순금 골드바 50g", "Gold Bar 50g", "足金金条 50g", 5200],
  ["gd-coin-1oz", "골드 코인 1온스 (메이플리프)", "Gold Maple Leaf 1 oz", "枫叶金币 1 盎司", 3300],
  ["gd-bar-1oz", "순금 골드바 1온스", "Gold Bar 1 oz", "足金金条 1 盎司", 3250],
  ["gd-bar-20g", "순금 골드바 20g", "Gold Bar 20g", "足金金条 20g", 2100],
  ["gd-bar-10g", "순금 골드바 10g", "Gold Bar 10g", "足金金条 10g", 1080],
  ["gd-cartier-love", "까르띠에 러브 브레이슬릿", "Cartier Love Bracelet", "卡地亚 Love 手镯", 7600],
  ["gd-cartier-juste", "까르띠에 저스트 앵 클루 브레이슬릿", "Cartier Juste un Clou Bracelet", "卡地亚 Juste un Clou 手镯", 8000],
  ["gd-cartier-trinity", "까르띠에 트리니티 링", "Cartier Trinity Ring", "卡地亚 Trinity 戒指", 1500],
  ["gd-vca-alhambra", "반클리프 아펠 빈티지 알함브라 펜던트", "Van Cleef & Arpels Vintage Alhambra Pendant", "梵克雅宝 Vintage Alhambra 吊坠", 3000],
  ["gd-vca-sweet", "반클리프 아펠 스위트 알함브라 브레이슬릿", "Van Cleef & Arpels Sweet Alhambra Bracelet", "梵克雅宝 Sweet Alhambra 手链", 1700],
  ["gd-tiffany-t1", "티파니 T1 링", "Tiffany T1 Ring", "蒂芙尼 T1 戒指", 1800],
  ["gd-tiffany-hardwear", "티파니 하드웨어 링크 브레이슬릿", "Tiffany HardWear Link Bracelet", "蒂芙尼 HardWear 手链", 5500],
  ["gd-tiffany-knot", "티파니 낫 더블 로우 링", "Tiffany Knot Double Row Ring", "蒂芙尼 Knot 双排戒指", 3000],
  ["gd-bulgari-bzero", "불가리 비제로원 링", "Bulgari B.zero1 Ring", "宝格丽 B.zero1 戒指", 2400],
  ["gd-bulgari-serpenti", "불가리 세르펜티 바이퍼 브레이슬릿", "Bulgari Serpenti Viper Bracelet", "宝格丽 Serpenti Viper 手镯", 9000],
  ["gd-chaumet-bee", "쇼메 비 마이 러브 링", "Chaumet Bee My Love Ring", "尚美巴黎 Bee My Love 戒指", 2600],
  ["gd-boucheron-quatre", "부쉐론 콰트르 클래식 링", "Boucheron Quatre Classique Ring", "宝诗龙 Quatre Classique 戒指", 3700],
  ["gd-mikimoto-strand", "미키모토 아코야 진주 목걸이", "Mikimoto Akoya Pearl Strand", "御木本 Akoya 珍珠项链", 6000],
  ["gd-diamond-studs-1ct", "다이아몬드 스터드 귀걸이 1캐럿", "Diamond Stud Earrings 1 ct", "钻石耳钉 1 克拉", 3500],
  ["gd-diamond-tennis", "다이아몬드 테니스 브레이슬릿 3캐럿", "Diamond Tennis Bracelet 3 ct", "钻石手链 3 克拉", 6500],
  ["gd-solitaire-ring", "다이아몬드 솔리테어 링 0.5캐럿", "Diamond Solitaire Ring 0.5 ct", "单钻戒指 0.5 克拉", 2000],
  ["gd-gold-chain-18k", "18K 골드 체인 목걸이", "18K Gold Chain Necklace", "18K 金链项链", 1600],
  ["gd-gold-bangle-24k", "24K 골드 뱅글", "24K Gold Bangle", "24K 金手镯", 4000],
  ["gd-gold-ring-24k", "24K 골드 링 3.75g", "24K Gold Ring 3.75g", "24K 金戒指 3.75g", 1000],
  ["gd-silver-100oz", "실버바 100온스", "Silver Bar 100 oz", "银条 100 盎司", 4000],
  ["gd-platinum-1oz", "플래티넘바 1온스", "Platinum Bar 1 oz", "铂金条 1 盎司", 1100],
  // 300 USDT 이상
  ["gd-bar-5g", "순금 골드바 5g", "Gold Bar 5g", "足金金条 5g", 560],
  ["gd-gold-coin-quarter", "골드 코인 1/4온스", "Gold Coin 1/4 oz", "金币 1/4 盎司", 870],
  ["gd-pandora-set", "판도라 참 브레이슬릿 세트", "Pandora Charm Bracelet Set", "潘多拉串饰手链套装", 300],
  ["gd-swarovski-set", "스와로브스키 목걸이와 귀걸이 세트", "Swarovski Necklace and Earrings Set", "施华洛世奇项链耳环套装", 300],
  ["gd-silver-10oz", "실버바 10온스", "Silver Bar 10 oz", "银条 10 盎司", 420],
  ["gd-gold-earrings-14k", "14K 골드 후프 귀걸이", "14K Gold Hoop Earrings", "14K 金圈耳环", 400],
  ["gd-tiffany-heart-tag", "티파니 리턴 투 티파니 하트 태그 펜던트", "Return to Tiffany Heart Tag Pendant", "蒂芙尼 Return to Tiffany 心形吊坠", 350],
  // 100 USDT 이상
  ["gd-bar-2g", "순금 골드바 2g", "Gold Bar 2g", "足金金条 2g", 240],
  ["gd-bar-1g", "순금 골드바 1g", "Gold Bar 1g", "足金金条 1g", 130],
  ["gd-silver-coin-5", "실버 코인 1온스 5개", "Silver Coin 1 oz, set of 5", "银币 1 盎司 5 枚", 220],
  ["gd-silver-chain", "스털링 실버 체인 목걸이", "Sterling Silver Chain Necklace", "925 银链项链", 120],
  ["gd-jewelry-box", "가죽 주얼리 보관함", "Leather Jewelry Box", "皮质首饰盒", 150],
  ["gc-amazon100", "아마존 글로벌 기프트카드 $100", "Amazon Global Gift Card $100", "Amazon 全球礼品卡 $100", 100, "digital"],
  ["usdt-100", "100 USDT 인스턴트 드롭", "100 USDT Instant Drop", "100 USDT 即时到账", 100, "cash"],
  // 100 USDT 미만
  ["gd-silver-coin-1", "실버 코인 1온스", "Silver Coin 1 oz", "银币 1 盎司", 50],
  ["gd-silver-earrings", "스털링 실버 귀걸이", "Sterling Silver Earrings", "925 银耳环", 60],
  ["gd-scale", "보석용 정밀 저울", "Jewelry Scale", "珠宝精密秤", 50],
];
