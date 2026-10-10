import type { ItemSpec } from "@/lib/catalogTypes";

/**
 * 콘솔 박스 (3 USDT). 가격 근거: 미국 공식 스토어 판매가(https://www.nintendo.com/us/store/ , https://www.xbox.com/en-us/consoles/xbox-series-x , https://store.steampowered.com/steamdeck/)와 소니 2026년 가격 공지(https://blog.playstation.com/2026/03/27/new-price-changes-for-ps5-ps5-pro-and-playstation-portal-remote-player/)를 참고한 2026년 미국 신품 세전 어림값(1 USDT = 1 USD).
 * 구간은 박스 가격의 20배 이상, 6배 이상 20배 미만, 2배 이상 6배 미만, 1배 이상 2배 미만이며 불확실성이 큰 가격은 상품 행 끝에 표시한다.
 */
export const STARTER_CONSOLE_ITEMS: ItemSpec[] = [
  // 60 USDT 이상 (위 구간)
  ["cs-rog-xbox-ally-x", "에이수스 ROG 엑스박스 앨라이 X 1TB", "ASUS ROG Xbox Ally X 1TB", "华硕 ROG Xbox Ally X 1TB", 999.99],
  ["cs-steamdeck-1tb", "밸브 스팀 덱 OLED 1TB", "Valve Steam Deck OLED 1TB", "Valve Steam Deck OLED 1TB", 949],
  ["cs-ps5-pro", "소니 플레이스테이션 5 프로 2TB", "Sony PlayStation 5 Pro 2TB", "索尼 PlayStation 5 Pro 2TB", 899.99],
  ["cs-xbox-series-x", "엑스박스 시리즈 X 1TB 디스크 에디션", "Xbox Series X 1TB Disc Edition", "Xbox Series X 1TB 光驱版", 799.99],
  ["cs-steamdeck-512", "밸브 스팀 덱 OLED 512GB", "Valve Steam Deck OLED 512GB", "Valve Steam Deck OLED 512GB", 789],
  ["cs-xbox-series-x-digital", "엑스박스 시리즈 X 1TB 디지털 에디션", "Xbox Series X 1TB Digital Edition", "Xbox Series X 1TB 数字版", 749.99],
  ["cs-ps5", "소니 플레이스테이션 5 1TB 디스크 에디션", "Sony PlayStation 5 1TB Disc Edition", "索尼 PlayStation 5 1TB 光驱版", 649.99],
  ["cs-ps5-digital", "소니 플레이스테이션 5 디지털 에디션", "Sony PlayStation 5 Digital Edition", "索尼 PlayStation 5 数字版", 599.99],
  ["cs-xbox-series-s", "엑스박스 시리즈 S 1TB", "Xbox Series S 1TB", "Xbox Series S 1TB", 599.99],
  ["cs-rog-xbox-ally", "에이수스 ROG 엑스박스 앨라이 512GB", "ASUS ROG Xbox Ally 512GB", "华硕 ROG Xbox Ally 512GB", 599.99],
  ["cs-legion-go-s", "레노버 리전 고 S 스팀OS 라이젠 Z2 고 512GB", "Lenovo Legion Go S SteamOS Ryzen Z2 Go 512GB", "联想 Legion Go S SteamOS 锐龙 Z2 Go 512GB", 599.99], // 추정
  ["cs-switch2", "닌텐도 스위치 2", "Nintendo Switch 2", "任天堂 Switch 2", 499.99],
  ["cs-psvr2", "소니 플레이스테이션 VR2", "Sony PlayStation VR2", "索尼 PlayStation VR2", 399.99],
  ["cs-g923", "로지텍 G923 레이싱 휠 플레이스테이션용", "Logitech G923 Racing Wheel for PlayStation", "罗技 G923 赛车方向盘 PlayStation版", 399.99],
  ["cs-portal", "소니 플레이스테이션 포털", "Sony PlayStation Portal", "索尼 PlayStation Portal", 249.99],
  ["cs-dualsense-edge", "소니 듀얼센스 엣지 무선 컨트롤러", "Sony DualSense Edge Wireless Controller", "索尼 DualSense Edge 无线控制器", 199.99],
  ["cs-xbox-elite2", "엑스박스 엘리트 무선 컨트롤러 시리즈 2", "Xbox Elite Wireless Controller Series 2", "Xbox 精英无线控制器 2代", 199.99], // 추정
  ["cs-nacon-revolution5", "나콘 레볼루션 5 프로 컨트롤러", "Nacon Revolution 5 Pro Controller", "Nacon Revolution 5 Pro 手柄", 199.99],
  ["cs-razer-wolverine3", "레이저 울버린 V3 프로 컨트롤러", "Razer Wolverine V3 Pro Controller", "雷蛇 Wolverine V3 Pro 手柄", 199.99],
  ["cs-pulse-explore", "소니 펄스 익스플로어 무선 이어폰", "Sony PULSE Explore Wireless Earbuds", "索尼 PULSE Explore 无线耳塞", 199.99],
  ["cs-hori-alpha", "호리 파이팅 스틱 알파 PS5용", "HORI Fighting Stick Alpha for PS5", "HORI Fighting Stick Alpha PS5版", 199.99],
  ["cs-seagate-expansion", "씨게이트 엑스박스 확장 카드 1TB", "Seagate Storage Expansion Card for Xbox 1TB", "希捷 Xbox 存储扩展卡 1TB", 199.99], // 추정
  ["cs-arctis-nova7p", "스틸시리즈 아크티스 노바 7P 와이어리스", "SteelSeries Arctis Nova 7P Wireless", "赛睿 Arctis Nova 7P Wireless", 179.99],
  ["cs-pulse-elite", "소니 펄스 엘리트 무선 헤드셋", "Sony PULSE Elite Wireless Headset", "索尼 PULSE Elite 无线耳机", 149.99],
  ["cs-xbox-headset", "엑스박스 무선 헤드셋", "Xbox Wireless Headset", "Xbox 无线耳机", 119.99],
  ["cs-switch2-dock", "닌텐도 스위치 2 독 세트", "Nintendo Switch 2 Dock Set", "任天堂 Switch 2 底座套装", 119.99],
  ["cs-joycon2", "닌텐도 조이콘 2 좌우 세트", "Nintendo Joy-Con 2 Pair", "任天堂 Joy-Con 2 左右套装", 99.99],
  ["cs-stealth600", "터틀비치 스텔스 600 3세대 엑스박스용", "Turtle Beach Stealth 600 Gen 3 for Xbox", "Turtle Beach Stealth 600 第三代 Xbox版", 99.99],
  ["cs-access", "소니 액세스 컨트롤러", "Sony Access Controller", "索尼 Access 无障碍控制器", 89.99],
  ["cs-switch2-pro", "닌텐도 스위치 2 프로 컨트롤러", "Nintendo Switch 2 Pro Controller", "任天堂 Switch 2 专业控制器", 89.99],
  ["cs-dualsense", "소니 듀얼센스 무선 컨트롤러", "Sony DualSense Wireless Controller", "索尼 DualSense 无线控制器", 79.99],
  ["cs-gamesir-g7pro", "게임써 G7 프로 컨트롤러", "GameSir G7 Pro Controller", "盖世小鸡 G7 Pro 手柄", 79.99],
  ["cs-mario-kart-world", "마리오 카트 월드 스위치 2 디지털", "Mario Kart World for Switch 2 Digital", "马力欧卡丁车世界 Switch 2 数字版", 79.99, "digital"],
  ["cs-zelda-totk", "젤다의 전설 티어스 오브 더 킹덤 스위치 2 에디션 디지털", "The Legend of Zelda: Tears of the Kingdom Switch 2 Edition Digital", "塞尔达传说 王国之泪 Switch 2 Edition 数字版", 79.99, "digital"],
  ["cs-steamdeck-dock", "밸브 스팀 덱 도킹 스테이션", "Valve Steam Deck Docking Station", "Valve Steam Deck 扩展坞", 79], // 추정
  ["cs-8bitdo-ultimate2", "팔빗도 얼티밋 2 무선 컨트롤러", "8BitDo Ultimate 2 Wireless Controller", "八位堂 Ultimate 2 无线手柄", 69.99],
  ["cs-donkey-kong-bananza", "동키콩 바난자 스위치 2 디지털", "Donkey Kong Bananza for Switch 2 Digital", "咚奇刚 蕉力全开 Switch 2 数字版", 69.99, "digital"],
  ["cs-xbox-controller", "엑스박스 무선 컨트롤러", "Xbox Wireless Controller", "Xbox 无线控制器", 64.99],
  // 18 USDT 이상, 60 USDT 미만
  ["cs-switch2-camera", "닌텐도 스위치 2 카메라", "Nintendo Switch 2 Camera", "任天堂 Switch 2 摄像头", 54.99],
  ["gc-steam50", "스팀 기프트카드 $50", "Steam Gift Card $50", "Steam 礼品卡 $50", 50, "digital"],
  ["cs-joycon2-grip", "닌텐도 조이콘 2 충전 그립", "Nintendo Joy-Con 2 Charging Grip", "任天堂 Joy-Con 2 充电握把", 39.99],
  ["cs-jsaux-dock", "제이소 HB0603 스팀 덱 독", "JSAUX HB0603 Docking Station for Steam Deck", "JSAUX HB0603 Steam Deck 扩展坞", 39.99],
  ["cs-dualsense-dock", "소니 듀얼센스 충전 거치대", "Sony DualSense Charging Station", "索尼 DualSense 充电座", 29.99],
  ["cs-ps5-stand", "소니 PS5 수직 받침대", "Sony Vertical Stand for PS5", "索尼 PS5 立式底座", 29.99],
  ["cs-joycon2-wheel", "닌텐도 조이콘 2 휠 2개 세트", "Nintendo Joy-Con 2 Wheel Set of 2", "任天堂 Joy-Con 2 方向盘 2个装", 24.99],
  ["cs-xbox-battery", "엑스박스 충전식 배터리와 USB-C 케이블", "Xbox Rechargeable Battery and USB-C Cable", "Xbox 充电电池与 USB-C 线缆", 24.99],
  ["cs-8bitdo-adapter2", "팔빗도 USB 무선 어댑터 2", "8BitDo USB Wireless Adapter 2", "八位堂 USB 无线接收器 2代", 19.99],
  ["cs-powera-case", "파워에이 슬림 휴대용 케이스 스위치 2용", "PowerA Slim Case for Nintendo Switch 2", "PowerA Nintendo Switch 2 薄型收纳包", 19.99],
  ["cs-kontrolfreek", "컨트롤프릭 FPS 프리크 갤럭시 PS5용", "KontrolFreek FPS Freek Galaxy for PS5", "KontrolFreek FPS Freek Galaxy PS5摇杆帽", 19.99],
  ["cs-hori-playstand", "호리 플레이스탠드 닌텐도 스위치용", "HORI PlayStand for Nintendo Switch", "HORI PlayStand 任天堂 Switch 支架", 19.99],
  ["cs-minecraft-xbox", "마인크래프트 엑스박스 디지털", "Minecraft for Xbox Digital", "Minecraft 我的世界 Xbox 数字版", 19.99, "digital"],
  // 6 USDT 이상, 18 USDT 미만
  ["cs-stardew-switch", "스타듀 밸리 스위치 디지털", "Stardew Valley for Nintendo Switch Digital", "星露谷物语 Nintendo Switch 数字版", 14.99, "digital"],
  ["cs-controller-grip", "플레이바이탈 PS5 컨트롤러 그립 테이프", "PlayVital Grip Tape for PS5 Controller", "PlayVital PS5 手柄防滑贴", 12.99],
  ["cs-hdmi-cable", "모노프라이스 8K 인증 HDMI 케이블 1.8m", "Monoprice Certified 8K HDMI Cable 6ft", "Monoprice 认证 8K HDMI 线 1.8m", 9.99],
  ["cs-usb-c-cable", "앤커 USB-C 충전 케이블 1.8m", "Anker USB-C Charging Cable 6ft", "安克 USB-C 充电线 1.8m", 9.99],
  ["cs-thumb-grips", "스컬앤코 PS5 컨트롤러 썸 그립 세트", "Skull & Co. Thumb Grip Set for PS5", "Skull & Co. PS5 摇杆帽套装", 9.99],
  // 3 USDT 이상, 6 USDT 미만
  ["cs-cleaning-cloth", "컨트롤러용 극세사 청소 천 3개", "Microfiber Controller Cleaning Cloths 3-Pack", "手柄超细纤维清洁布 3条装", 4.99], // 추정
];
