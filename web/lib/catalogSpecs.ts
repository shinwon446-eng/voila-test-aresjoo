/**
 * 상품 구성의 단일 원천. 박스마다 파일 하나(lib/catalog/<slug>.ts)에 상품을 적고 여기서 묶는다.
 * 아직 새로 채우지 않은 박스는 legacy.ts 의 옛 구성을 쓴다. 확률은 lib/products.ts 가 배정한다.
 * 기대값 표는 npm run products:md 로 PRODUCTS.md 에 만든다.
 */
import type { BoxSpec } from "@/lib/catalogTypes";
import { LEGACY_SPECS } from "@/lib/catalog/legacy";
import { JACKPOT_CAR_ITEMS } from "@/lib/catalog/jackpot-car";
import { DOLLAR_APPLE_ITEMS } from "@/lib/catalog/dollar-apple";
import { VAULT_WATCH_ITEMS } from "@/lib/catalog/vault-watch";
import { VAULT_HANDBAG_ITEMS } from "@/lib/catalog/vault-handbag";
import { VAULT_GOLD_ITEMS } from "@/lib/catalog/vault-gold";
import { STARTER_MACBOOK_ITEMS } from "@/lib/catalog/starter-macbook";
import { JACKPOT_SUPERCAR_ITEMS } from "@/lib/catalog/jackpot-supercar";
import { DOLLAR_GALAXY_ITEMS } from "@/lib/catalog/dollar-galaxy";
import { DOLLAR_GAMING_ITEMS } from "@/lib/catalog/dollar-gaming";
import { STARTER_CONSOLE_ITEMS } from "@/lib/catalog/starter-console";
import { STARTER_AUDIO_ITEMS } from "@/lib/catalog/starter-audio";
import { STARTER_CAMERA_ITEMS } from "@/lib/catalog/starter-camera";
import { VAULT_HOME_ITEMS } from "@/lib/catalog/vault-home";
import { VAULT_POKEMON_ITEMS } from "@/lib/catalog/vault-pokemon";

const NEW: BoxSpec[] = [
  {
    slug: "vault-pokemon", title: "포켓몬 카드 박스", titleEn: "pokemon card box", titleZh: "宝可梦卡牌盒", category: "collect", badge: "카드",
    tagline: "20달러로 리자몽 1판 PSA 10 도전. 등급 카드와 1판 부스터 박스부터 현행 세트까지, 전부 영어판.", taglineEn: "$20 for a 1st Edition Charizard PSA 10. From graded cards and 1st Edition booster boxes to current sets.", taglineZh: "20 美元挑战初版喷火龙 PSA 10。从评级卡、初版补充包原盒到现行系列。",
    price: 20, trendingRank: 3, releasedAt: "2026-10-11", popularity: 171500, items: VAULT_POKEMON_ITEMS,
  },
  {
    slug: "dollar-apple", title: "1달러 애플 박스", titleEn: "one dollar apple box", titleZh: "1 美元苹果盒", category: "dollar", badge: "1달러",
    tagline: "1달러로 애플 기기 도전. 구성품과 확률이 전부 적혀 있습니다.", taglineEn: "$1 for Apple devices. Every item and its odds are listed.", taglineZh: "1 美元挑战苹果设备。所有商品和概率一目了然。",
    price: 1, trendingRank: 1, releasedAt: "2026-09-18", popularity: 184200, items: DOLLAR_APPLE_ITEMS,
  },
  {
    slug: "jackpot-car", title: "자동차 박스", titleEn: "car box", titleZh: "汽车盒", category: "jackpot", badge: "드림 박스",
    tagline: "100달러로 롤스로이스 컬리넌 도전. 차와 바이크부터 차량 용품까지.", taglineEn: "$100 for a Rolls-Royce Cullinan. From cars and bikes to car gear.", taglineZh: "100 美元挑战劳斯莱斯库里南。从汽车、摩托到车用品。",
    price: 100, trendingRank: 6, releasedAt: "2026-10-10", popularity: 132000, items: JACKPOT_CAR_ITEMS,
  },
  {
    slug: "vault-submariner", title: "시계 박스", titleEn: "watch box", titleZh: "腕表盒", category: "luxury", badge: "워치",
    tagline: "20달러로 롤렉스 데이토나 도전. 스위스 시계부터 스마트워치까지.", taglineEn: "$20 for a Rolex Daytona. From Swiss watches to smartwatches.", taglineZh: "20 美元挑战劳力士迪通拿。从瑞士腕表到智能手表。",
    price: 20, trendingRank: 5, releasedAt: "2026-09-18", popularity: 142300, items: VAULT_WATCH_ITEMS,
  },
  {
    slug: "vault-handbag", title: "가방 박스", titleEn: "bag box", titleZh: "包袋盒", category: "luxury", badge: "럭셔리",
    tagline: "30달러로 에르메스 버킨 도전. 명품 가방부터 지갑과 캐리어까지.", taglineEn: "$30 for an Hermès Birkin. From designer bags to wallets and luggage.", taglineZh: "30 美元挑战爱马仕 Birkin。从名牌包到钱包和行李箱。",
    price: 30, trendingRank: 11, releasedAt: "2026-09-18", popularity: 97800, items: VAULT_HANDBAG_ITEMS,
  },
  {
    slug: "vault-gold", title: "골드 박스", titleEn: "gold box", titleZh: "黄金盒", category: "jackpot", badge: "골드",
    tagline: "50달러로 골드바 1kg 도전. 금과 주얼리부터 실버까지.", taglineEn: "$50 for a 1kg gold bar. From gold and jewelry to silver.", taglineZh: "50 美元挑战 1kg 金条。从黄金、珠宝到白银。",
    price: 50, trendingRank: 8, releasedAt: "2026-09-18", popularity: 108900, items: VAULT_GOLD_ITEMS,
  },
  {
    slug: "dollar-galaxy", title: "1달러 갤럭시 박스", titleEn: "one dollar galaxy box", titleZh: "1 美元 Galaxy 盒", category: "dollar", badge: "1달러",
    tagline: "1달러로 갤럭시 Z 폴드 도전. 삼성 기기부터 충전 용품까지.", taglineEn: "$1 for a Galaxy Z Fold. From Samsung devices to charging gear.", taglineZh: "1 美元挑战 Galaxy Z Fold。从三星设备到充电用品。",
    price: 1, trendingRank: 9, releasedAt: "2026-10-10", popularity: 121400, items: DOLLAR_GALAXY_ITEMS,
  },
  {
    slug: "dollar-gaming", title: "1달러 게이밍 박스", titleEn: "one dollar gaming box", titleZh: "1 美元游戏盒", category: "dollar", badge: "1달러",
    tagline: "1달러로 RTX 5090 도전. 그래픽카드부터 키보드와 마우스까지.", taglineEn: "$1 for an RTX 5090. From graphics cards to keyboards and mice.", taglineZh: "1 美元挑战 RTX 5090。从显卡到键盘鼠标。",
    price: 1, trendingRank: 2, releasedAt: "2026-10-10", popularity: 160800, items: DOLLAR_GAMING_ITEMS,
  },
  {
    slug: "starter-ps5", title: "콘솔 박스", titleEn: "console box", titleZh: "游戏机盒", category: "tech", badge: "테크",
    tagline: "3달러로 PS5 프로 도전. 콘솔과 휴대용 게임기부터 컨트롤러까지.", taglineEn: "$3 for a PS5 Pro. From consoles and handhelds to controllers.", taglineZh: "3 美元挑战 PS5 Pro。从游戏机、掌机到手柄。",
    price: 3, trendingRank: 7, releasedAt: "2026-10-10", popularity: 112900, items: STARTER_CONSOLE_ITEMS,
  },
  {
    slug: "starter-audio", title: "음악 박스", titleEn: "audio box", titleZh: "音乐盒", category: "tech", badge: "오디오",
    tagline: "3달러로 B&O 헤드폰 도전. 헤드폰과 이어폰부터 스피커와 턴테이블까지.", taglineEn: "$3 for B&O headphones. From headphones and earbuds to speakers and turntables.", taglineZh: "3 美元挑战 B&O 耳机。从耳机、耳塞到音箱和唱机。",
    price: 3, trendingRank: 12, releasedAt: "2026-10-10", popularity: 88100, items: STARTER_AUDIO_ITEMS,
  },
  {
    slug: "starter-macbook", title: "맥과 책상 박스", titleEn: "mac and desk box", titleZh: "Mac 与桌面盒", category: "tech", badge: "테크",
    tagline: "5달러로 맥북 프로 도전. 맥 전 기종부터 모니터와 의자까지.", taglineEn: "$5 for a MacBook Pro. From every Mac to monitors and chairs.", taglineZh: "5 美元挑战 MacBook Pro。从全系 Mac 到显示器和座椅。",
    price: 5, trendingRank: 4, releasedAt: "2026-10-10", popularity: 152300, items: STARTER_MACBOOK_ITEMS,
  },
  {
    slug: "starter-camera", title: "사진 박스", titleEn: "camera box", titleZh: "摄影盒", category: "tech", badge: "테크",
    tagline: "5달러로 라이카 도전. 카메라와 렌즈부터 드론과 삼각대까지.", taglineEn: "$5 for a Leica. From cameras and lenses to drones and tripods.", taglineZh: "5 美元挑战徕卡。从相机、镜头到无人机和三脚架。",
    price: 5, trendingRank: 10, releasedAt: "2026-10-10", popularity: 101700, items: STARTER_CAMERA_ITEMS,
  },
  {
    slug: "vault-home", title: "생활가전 박스", titleEn: "home appliance box", titleZh: "家电盒", category: "luxury", badge: "라이프스타일",
    tagline: "20달러로 다이슨과 LG 도전. 청소와 주방부터 TV와 세탁기까지.", taglineEn: "$20 for Dyson and LG. From cleaning and kitchen to TVs and washers.", taglineZh: "20 美元挑战戴森和 LG。从清洁、厨房到电视和洗衣机。",
    price: 20, trendingRank: 13, releasedAt: "2026-10-10", popularity: 79400, items: VAULT_HOME_ITEMS,
  },
  {
    slug: "jackpot-supercar", title: "슈퍼카 박스", titleEn: "supercar box", titleZh: "超跑盒", category: "jackpot", badge: "드림 박스",
    tagline: "100달러로 람보르기니 레부엘토 도전. 슈퍼카와 바이크부터 레이싱 장비까지.", taglineEn: "$100 for a Lamborghini Revuelto. From supercars and bikes to racing gear.", taglineZh: "100 美元挑战兰博基尼 Revuelto。从超跑、摩托到赛车装备。",
    price: 100, trendingRank: 14, releasedAt: "2026-10-10", popularity: 88600, items: JACKPOT_SUPERCAR_ITEMS,
  },
];

/** 새 구성이 있는 박스는 새 것, 없으면 옛 것. jackpot-cybertruck 은 자동차 박스에 흡수됐다. */
const REPLACED = new Set(["jackpot-cybertruck", "vault-omega", "starter-phone"]);
export const SPECS: BoxSpec[] = [
  ...NEW,
  ...LEGACY_SPECS.filter((box) => !REPLACED.has(box.slug) && !NEW.some((n) => n.slug === box.slug)),
];
