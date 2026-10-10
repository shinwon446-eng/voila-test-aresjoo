import type { ItemSpec } from "@/lib/catalogTypes";

/**
 * 1달러 게이밍 박스 (1 USDT). 가격 근거: 엔비디아 공시가(https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/)와 미국 Best Buy 신품 가격(https://www.bestbuy.com/), 레이저 공식 판매가(https://www.razer.com/pc)를 참고한 2026년 미국 신품 세전 어림값(1 USDT = 1 USD).
 * 구간은 박스 가격의 20배 이상, 6배 이상 20배 미만, 2배 이상 6배 미만, 1배 이상 2배 미만이며 불확실성이 큰 가격은 상품 행 끝에 표시한다.
 */
export const DOLLAR_GAMING_ITEMS: ItemSpec[] = [
  // 20 USDT 이상 (위 구간)
  ["gm-zephyrus-g16", "에이수스 ROG 제피러스 G16 RTX 5080 1TB", "ASUS ROG Zephyrus G16 RTX 5080 1TB", "华硕 ROG 幻16 RTX 5080 1TB", 3499.99], // 추정
  ["gm-legion-pro7i", "레노버 리전 프로 7i RTX 5080 1TB", "Lenovo Legion Pro 7i RTX 5080 1TB", "联想 Legion Pro 7i RTX 5080 1TB", 3299.99], // 추정
  ["gm-zephyrus-g14", "에이수스 ROG 제피러스 G14 RTX 5070 1TB", "ASUS ROG Zephyrus G14 RTX 5070 1TB", "华硕 ROG 幻14 RTX 5070 1TB", 2499.99], // 추정
  ["gm-omen-max16", "HP 오멘 맥스 16 RTX 5070 Ti 1TB", "HP OMEN MAX 16 RTX 5070 Ti 1TB", "惠普 OMEN MAX 16 RTX 5070 Ti 1TB", 2499.99], // 추정
  ["gm-rtx5080", "MSI 지포스 RTX 5080 게이밍 트리오 OC 16GB", "MSI GeForce RTX 5080 GAMING TRIO OC 16GB", "微星 GeForce RTX 5080 GAMING TRIO OC 16GB", 1650], // 추정
  ["gm-lg-32gs95ue", "LG 울트라기어 OLED 32GS95UE 32인치", "LG UltraGear OLED 32GS95UE 32-inch", "LG UltraGear OLED 32GS95UE 32英寸", 1399.99],
  ["gm-rog-pg32ucdm", "에이수스 ROG 스위프트 OLED PG32UCDM 32인치", "ASUS ROG Swift OLED PG32UCDM 32-inch", "华硕 ROG Swift OLED PG32UCDM 32英寸", 1299.99],
  ["gm-rtx5070ti", "에이수스 프라임 지포스 RTX 5070 Ti OC 16GB", "ASUS Prime GeForce RTX 5070 Ti OC 16GB", "华硕 Prime GeForce RTX 5070 Ti OC 16GB", 1150], // 추정
  ["gm-alienware-aw2725df", "에일리언웨어 AW2725DF 27인치", "Alienware AW2725DF 27-inch", "外星人 AW2725DF 27英寸", 899.99],
  ["gm-rtx5070", "기가바이트 지포스 RTX 5070 윈드포스 OC 12GB", "GIGABYTE GeForce RTX 5070 WINDFORCE OC 12GB", "技嘉 GeForce RTX 5070 WINDFORCE OC 12GB", 780], // 추정
  ["gm-rx9070xt", "사파이어 펄스 라데온 RX 9070 XT 16GB", "SAPPHIRE PULSE Radeon RX 9070 XT 16GB", "蓝宝石 PULSE Radeon RX 9070 XT 16GB", 750], // 추정
  ["gm-msi-271qpx", "MSI MAG 271QPX QD-OLED 27인치", "MSI MAG 271QPX QD-OLED 27-inch", "微星 MAG 271QPX QD-OLED 27英寸", 749.99],
  ["gm-ryzen9950x3d", "AMD 라이젠 9 9950X3D", "AMD Ryzen 9 9950X3D", "AMD 锐龙 9 9950X3D", 699],
  ["gm-benq-xl2566x", "벤큐 조위 XL2566X 플러스 24.1인치", "BenQ ZOWIE XL2566X+ 24.1-inch", "明基卓威 XL2566X+ 24.1英寸", 649.99],
  ["gm-iskur-v2", "레이저 이스커 V2 게이밍 의자", "Razer Iskur V2 Gaming Chair", "雷蛇 Iskur V2 电竞椅", 649.99],
  ["gm-core285k", "인텔 코어 울트라 9 285K", "Intel Core Ultra 9 285K", "英特尔酷睿 Ultra 9 285K", 589],
  ["gm-titan-evo", "시크릿랩 타이탄 에보 레귤러 의자", "Secretlab TITAN Evo Regular Chair", "Secretlab TITAN Evo 标准号电竞椅", 549], // 추정
  ["gm-ryzen9800x3d", "AMD 라이젠 7 9800X3D", "AMD Ryzen 7 9800X3D", "AMD 锐龙 7 9800X3D", 479],
  ["gm-core265k", "인텔 코어 울트라 7 265K", "Intel Core Ultra 7 265K", "英特尔酷睿 Ultra 7 265K", 394],
  ["gm-ryzen9700x", "AMD 라이젠 7 9700X", "AMD Ryzen 7 9700X", "AMD 锐龙 7 9700X", 359],
  ["gm-arctis-nova-pro", "스틸시리즈 아크티스 노바 프로 와이어리스 PC", "SteelSeries Arctis Nova Pro Wireless PC", "赛睿 Arctis Nova Pro Wireless PC", 349.99],
  ["gm-g-pro-x2", "로지텍 G 프로 X 2 라이트스피드", "Logitech G PRO X 2 LIGHTSPEED", "罗技 G PRO X 2 LIGHTSPEED", 249.99],
  ["gm-corsair-tc100", "커세어 TC100 릴랙스드 의자", "CORSAIR TC100 RELAXED Chair", "美商海盗船 TC100 RELAXED 电竞椅", 249.99],
  ["gm-elgato-4kx", "엘가토 4K X 캡처 카드", "Elgato 4K X Capture Card", "Elgato 4K X 采集卡", 249.99],
  ["gm-huntsman-v3", "레이저 헌츠맨 V3 프로 텐키리스", "Razer Huntsman V3 Pro Tenkeyless", "雷蛇猎魂光蛛 V3 专业版 TKL", 219.99],
  ["gm-apex-pro", "스틸시리즈 에이펙스 프로 TKL 3세대", "SteelSeries Apex Pro TKL Gen 3", "赛睿 Apex Pro TKL 第三代", 219.99],
  ["gm-keychron-q1-he", "키크론 Q1 HE", "Keychron Q1 HE", "Keychron Q1 HE", 219],
  ["gm-g-pro-x-tkl", "로지텍 G 프로 X TKL 라이트스피드", "Logitech G PRO X TKL LIGHTSPEED", "罗技 G PRO X TKL LIGHTSPEED", 199.99],
  ["gm-blackshark-v3-pro", "레이저 블랙샤크 V3 프로 PC용", "Razer BlackShark V3 Pro for PC", "雷蛇旋风黑鲨 V3 专业版 PC版", 249.99],
  ["gm-blackwidow-v4", "레이저 블랙위도우 V4 75퍼센트", "Razer BlackWidow V4 75%", "雷蛇黑寡妇蜘蛛 V4 75%", 189.99],
  ["gm-hs80-max", "커세어 HS80 맥스 와이어리스", "CORSAIR HS80 MAX WIRELESS", "美商海盗船 HS80 MAX WIRELESS", 179.99],
  ["gm-cloud3-wireless", "하이퍼엑스 클라우드 III 와이어리스", "HyperX Cloud III Wireless", "HyperX Cloud III Wireless", 169.99],
  ["gm-viper-v3-pro", "레이저 바이퍼 V3 프로", "Razer Viper V3 Pro", "雷蛇毒蝰 V3 专业版", 159.99],
  ["gm-g-pro-superlight2", "로지텍 G 프로 X 슈퍼라이트 2", "Logitech G PRO X SUPERLIGHT 2", "罗技 G PRO X SUPERLIGHT 2", 159.99],
  ["gm-elgato-streamdeck", "엘가토 스트림 덱 MK.2", "Elgato Stream Deck MK.2", "Elgato Stream Deck MK.2", 149.99],
  ["gm-g502x", "로지텍 G502 X 라이트스피드", "Logitech G502 X LIGHTSPEED", "罗技 G502 X LIGHTSPEED", 139.99],
  ["gm-k70-core", "커세어 K70 코어 RGB", "CORSAIR K70 CORE RGB", "美商海盗船 K70 CORE RGB", 99.99],
  ["gm-deathadder-v3", "레이저 데스에더 V3 하이퍼스피드", "Razer DeathAdder V3 HyperSpeed", "雷蛇炼狱蝰蛇 V3 极速版", 99.99],
  ["gm-aerox3", "스틸시리즈 에어록스 3 와이어리스", "SteelSeries Aerox 3 Wireless", "赛睿 Aerox 3 Wireless", 99.99],
  ["gm-pulsefire-haste2", "하이퍼엑스 펄스파이어 헤이스트 2", "HyperX Pulsefire Haste 2", "HyperX Pulsefire Haste 2", 59.99],
  ["gm-fifine-am8", "파이파인 AM8 USB 마이크", "FIFINE AM8 USB Microphone", "FIFINE AM8 USB 麦克风", 54.99],
  ["gc-steam50", "스팀 기프트카드 $50", "Steam Gift Card $50", "Steam 礼品卡 $50", 50, "digital"],
  ["usdt-50", "50 USDT 인스턴트 드롭", "50 USDT Instant Drop", "50 USDT 即时到账", 50, "cash"],
  ["gm-g840", "로지텍 G840 XL 게이밍 마우스 패드", "Logitech G840 XL Gaming Mouse Pad", "罗技 G840 XL 游戏鼠标垫", 49.99],
  ["gm-qck-heavy", "스틸시리즈 QcK 헤비 미디엄 마우스 패드", "SteelSeries QcK Heavy Medium Mouse Pad", "赛睿 QcK Heavy 中号鼠标垫", 24.99],
  // 6 USDT 이상, 20 USDT 미만
  ["gm-mouse-bungee", "레이저 마우스 번지 V3", "Razer Mouse Bungee V3", "雷蛇鼠标固线器 V3", 19.99],
  ["gm-headset-hook", "유그린 데스크 헤드셋 걸이", "UGREEN Desk Headphone Hanger", "绿联桌面耳机挂架", 12.99],
  ["gm-qck-mini", "스틸시리즈 QcK 미니 마우스 패드", "SteelSeries QcK Mini Mouse Pad", "赛睿 QcK Mini 鼠标垫", 9.99],
  ["gm-mouse-grip", "레이저 유니버설 그립 테이프", "Razer Universal Grip Tape", "雷蛇通用防滑贴", 9.99],
  ["gm-keyboard-brush", "OXO 굿 그립스 전자기기 청소 브러시", "OXO Good Grips Electronics Cleaning Brush", "OXO Good Grips 电子设备清洁刷", 8.99],
  ["gm-usb-extension", "케이블 매터스 USB 3.0 연장 케이블 1m", "Cable Matters USB 3.0 Extension Cable 1m", "Cable Matters USB 3.0 延长线 1m", 7.99],
  // 2 USDT 이상, 6 USDT 미만
  ["gm-cable-sleeve", "게이밍 데스크 케이블 슬리브 1m", "Gaming Desk Cable Sleeve 1m", "游戏桌理线套管 1m", 5.99], // 추정
  ["gm-switch-puller", "키크론 스위치 풀러", "Keychron Switch Puller", "Keychron 拔轴器", 4.99],
  ["gm-cable-ties", "데스크 케이블 정리 타이 5개", "Desk Cable Ties 5-Pack", "桌面理线绑带 5条装", 2.99], // 추정
  // 1 USDT 이상, 2 USDT 미만
  ["gm-cable-clip", "데스크 마우스 케이블 클립", "Desk Mouse Cable Clip", "桌面鼠标线固定夹", 1.99], // 추정
];
