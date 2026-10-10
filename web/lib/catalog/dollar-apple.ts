import type { ItemSpec } from "@/lib/catalogTypes";

/**
 * 1달러 애플 박스 (1 USDT). 시중 정가는 2026년 기준 대략의 애플 공시가(미국, 1 USDT = 1 USD)와 주요 판매처 가격을 참고한 어림값이다.
 * 1 USDT 박스는 20 USDT 이상이 전부 위 구간이라 기기 대부분이 위에 온다. 1 USDT 미만 실물은 넣지 않는다.
 */
export const DOLLAR_APPLE_ITEMS: ItemSpec[] = [
  // 20 USDT 이상
  ["ap-vision-pro", "애플 비전 프로", "Apple Vision Pro", "Apple Vision Pro", 3500],
  ["ap-studio-display", "스튜디오 디스플레이", "Studio Display", "Studio Display", 1600],
  ["ap-ipad-pro-13", "아이패드 프로 13 M4", "iPad Pro 13 M4", "iPad Pro 13 M4", 1300],
  ["ap-mba-15", "맥북 에어 15 M4", "MacBook Air 15 M4", "MacBook Air 15 M4", 1200],
  ["ap-iphone-16-pro-max", "아이폰 16 프로 맥스 256GB", "iPhone 16 Pro Max 256GB", "iPhone 16 Pro Max 256GB", 1200],
  ["da-iphone16", "아이폰 16 프로 256GB", "iPhone 16 Pro 256GB", "iPhone 16 Pro 256GB", 1000],
  ["ap-mba-13", "맥북 에어 13 M4", "MacBook Air 13 M4", "MacBook Air 13 M4", 1000],
  ["ap-iphone-16", "아이폰 16 128GB", "iPhone 16 128GB", "iPhone 16 128GB", 800],
  ["ap-ipad-air-13", "아이패드 에어 13 M3", "iPad Air 13 M3", "iPad Air 13 M3", 800],
  ["ap-watch-ultra-2", "애플워치 울트라 2", "Apple Watch Ultra 2", "Apple Watch Ultra 2", 800],
  ["ap-iphone-16e", "아이폰 16e 128GB", "iPhone 16e 128GB", "iPhone 16e 128GB", 600],
  ["ap-mac-mini", "맥 미니 M4", "Mac mini M4", "Mac mini M4", 600],
  ["aud-airpods", "에어팟 맥스 USB-C", "AirPods Max USB-C", "AirPods Max USB-C", 549],
  ["ap-ipad-mini", "아이패드 미니 A17 프로", "iPad mini A17 Pro", "iPad mini A17 Pro", 500],
  ["ap-watch-s10", "애플워치 시리즈 10", "Apple Watch Series 10", "Apple Watch Series 10", 400],
  ["ap-ipad-11", "아이패드 11세대", "iPad (11th gen)", "iPad（第 11 代）", 350],
  ["ap-beats-studio-pro", "비츠 스튜디오 프로", "Beats Studio Pro", "Beats Studio Pro", 350],
  ["ap-magic-keyboard-ipad", "아이패드용 매직 키보드", "Magic Keyboard for iPad", "iPad 妙控键盘", 300],
  ["ap-homepod", "홈팟 2세대", "HomePod (2nd gen)", "HomePod（第 2 代）", 300],
  ["da-watchse", "애플워치 SE 3", "Apple Watch SE 3", "Apple Watch SE 3", 250],
  ["ap-airpods-pro-2", "에어팟 프로 2", "AirPods Pro 2", "AirPods Pro 2", 249],
  ["ap-beats-fit-pro", "비츠 핏 프로", "Beats Fit Pro", "Beats Fit Pro", 200],
  ["ap-airpods-4-anc", "에어팟 4 ANC", "AirPods 4 ANC", "AirPods 4 ANC", 179],
  ["ap-magic-mouse", "매직 마우스", "Magic Mouse", "妙控鼠标", 100],
  ["ap-apple-tv", "애플 TV 4K", "Apple TV 4K", "Apple TV 4K", 150],
  ["ap-beats-pill", "비츠 필", "Beats Pill", "Beats Pill", 150],
  ["ap-apple-pencil-pro", "애플 펜슬 프로", "Apple Pencil Pro", "Apple Pencil Pro", 130],
  ["ap-magic-keyboard", "매직 키보드 (터치 ID)", "Magic Keyboard with Touch ID", "带 Touch ID 的妙控键盘", 150],
  ["ap-homepod-mini", "홈팟 미니", "HomePod mini", "HomePod mini", 100],
  ["ap-airtag-4", "에어태그 4개 팩", "AirTag 4 Pack", "AirTag 4 件装", 100],
  ["ap-beats-solo-buds", "비츠 솔로 버즈", "Beats Solo Buds", "Beats Solo Buds", 80],
  ["ap-iphone-case", "아이폰 16 프로 실리콘 케이스", "iPhone 16 Pro Silicone Case", "iPhone 16 Pro 硅胶保护壳", 50],
  ["ap-magsafe", "맥세이프 충전기 25W", "MagSafe Charger 25W", "MagSafe 充电器 25W", 50],
  ["ap-watch-band", "애플워치 스포츠 밴드", "Apple Watch Sport Band", "Apple Watch 运动表带", 50],
  ["ap-airtag-1", "에어태그 1개", "AirTag", "AirTag 单件", 30],
  ["ap-adapter-35w", "35W 듀얼 USB-C 어댑터", "35W Dual USB-C Adapter", "35W 双 USB-C 充电器", 60],
  ["ap-adapter-20w", "20W USB-C 어댑터", "20W USB-C Adapter", "20W USB-C 充电器", 20],
  ["ap-cable-2m", "USB-C 충전 케이블 2m", "USB-C Charge Cable 2m", "USB-C 充电线 2m", 20],
  // 6 USDT 이상
  ["gc-apple500", "애플 기프트카드 $500", "Apple Gift Card $500", "Apple 礼品卡 $500", 500, "digital"],
  ["gc-apple100", "애플 기프트카드 $100", "Apple Gift Card $100", "Apple 礼品卡 $100", 100, "digital"],
  ["usdt-50", "인스턴트 드롭", "Instant Drop", "即时到账", 50, "cash"],
  ["gc-apple25", "애플 기프트카드 $25", "Apple Gift Card $25", "Apple 礼品卡 $25", 25, "digital"],
  ["gc-apple10", "애플 기프트카드 $10", "Apple Gift Card $10", "Apple 礼品卡 $10", 10, "digital"],
];
