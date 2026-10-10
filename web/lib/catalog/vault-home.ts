import type { ItemSpec } from "@/lib/catalogTypes";

/**
 * 생활가전 박스 (20 USDT). 가격 근거: 미국 제조사 공식 판매가(https://us.balmuda.com/collections/all , https://www.breville.com/en-us/product/bes985 , https://us.roborock.com/ , https://www.dyson.com/)와 Best Buy 신품 가격(https://www.bestbuy.com/)를 참고한 2026년 미국 신품 세전 어림값(1 USDT = 1 USD).
 * 구간은 박스 가격의 20배 이상, 6배 이상 20배 미만, 2배 이상 6배 미만, 1배 이상 2배 미만이며 불확실성이 큰 가격은 상품 행 끝에 표시한다.
 */
export const VAULT_HOME_ITEMS: ItemSpec[] = [
  // 400 USDT 이상 (위 구간)
  ["hm-samsung-rf29", "삼성 비스포크 RF29DB9900QD 냉장고", "Samsung Bespoke RF29DB9900QD Refrigerator", "三星 Bespoke RF29DB9900QD 冰箱", 4999], // 추정
  ["hm-bosch-b36", "보쉬 800 시리즈 B36CT80SNS 냉장고", "Bosch 800 Series B36CT80SNS Refrigerator", "博世 800系列 B36CT80SNS 冰箱", 3699], // 추정
  ["hm-lg-g6-65", "LG 올레드 에보 G6 65인치 TV", "LG OLED evo G6 65-inch TV", "LG OLED evo G6 65英寸电视", 3399],
  ["hm-lg-washcombo", "LG 워시콤보 WM6998HBA 세탁건조기", "LG WashCombo WM6998HBA Washer Dryer", "LG WashCombo WM6998HBA 洗烘一体机", 3299.99],
  ["hm-samsung-s95f", "삼성 OLED S95F 65인치 TV", "Samsung OLED S95F 65-inch TV", "三星 OLED S95F 65英寸电视", 3299],
  ["hm-samsung-rf23", "삼성 비스포크 RF23DB9600QL 냉장고", "Samsung Bespoke RF23DB9600QL Refrigerator", "三星 Bespoke RF23DB9600QL 冰箱", 3299], // 추정
  ["hm-samsung-combo", "삼성 비스포크 AI WD53DBA900HZ 세탁건조기", "Samsung Bespoke AI WD53DBA900HZ Laundry Combo", "三星 Bespoke AI WD53DBA900HZ 洗烘一体机", 3299], // 추정
  ["hm-lg-c6-65", "LG 올레드 에보 C6 65인치 TV", "LG OLED evo C6 65-inch TV", "LG OLED evo C6 65英寸电视", 2699], // 추정
  ["hm-roborock-z70", "로보락 사로스 Z70 로봇청소기", "Roborock Saros Z70 Robot Vacuum", "石头 Saros Z70 扫地机器人", 2599.99], // 추정
  ["hm-samsung-s90f", "삼성 OLED S90F 65인치 TV", "Samsung OLED S90F 65-inch TV", "三星 OLED S90F 65英寸电视", 2499],
  ["hm-lg-lrflc2706s", "LG 카운터 뎁스 맥스 LRFLC2706S 냉장고", "LG Counter-Depth MAX LRFLC2706S Refrigerator", "LG Counter-Depth MAX LRFLC2706S 冰箱", 2499], // 추정
  ["hm-lg-washtower", "LG 워시타워 WKEX200HBA 세탁건조기", "LG WashTower WKEX200HBA Washer Dryer", "LG WashTower WKEX200HBA 洗烘套装", 2499], // 추정
  ["hm-samsung-framepro", "삼성 더 프레임 프로 LS03FW 65인치 TV", "Samsung The Frame Pro LS03FW 65-inch TV", "三星 The Frame Pro LS03FW 65英寸电视", 2199], // 추정
  ["hm-breville-oraclejet", "브레빌 오라클 제트 BES985 에스프레소 머신", "Breville the Oracle Jet BES985 Espresso Machine", "铂富 Oracle Jet BES985 意式咖啡机", 1999.95],
  ["hm-lg-c6-55", "LG 올레드 에보 C6 55인치 TV", "LG OLED evo C6 55-inch TV", "LG OLED evo C6 55英寸电视", 1999], // 추정
  ["hm-roborock-saros10r", "로보락 사로스 10R 로봇청소기", "Roborock Saros 10R Robot Vacuum", "石头 Saros 10R 扫地机器人", 1599.99],
  ["hm-breville-touchimpress", "브레빌 바리스타 터치 임프레스 BES881", "Breville the Barista Touch Impress BES881", "铂富 Barista Touch Impress BES881", 1499.95],
  ["hm-delonghi-rivelia", "드롱기 리벨리아 EXAM440.55 전자동 커피머신", "De'Longhi Rivelia EXAM440.55 Automatic Espresso Machine", "德龙 Rivelia EXAM440.55 全自动咖啡机", 1499.95], // 추정
  ["hm-lg-wm4000", "LG WM4000HBA 드럼 세탁기", "LG WM4000HBA Front Load Washer", "LG WM4000HBA 滚筒洗衣机", 1199], // 추정
  ["hm-dyson-bp03", "다이슨 빅 콰이엇 포름알데히드 BP03 공기청정기", "Dyson Purifier Big+Quiet Formaldehyde BP03", "戴森 Big+Quiet Formaldehyde BP03 空气净化器", 999.99],
  ["hm-dyson-gen5", "다이슨 젠5디텍트 앱솔루트 청소기", "Dyson Gen5detect Absolute Vacuum", "戴森 Gen5detect Absolute 吸尘器", 949.99],
  ["hm-delonghi-evo", "드롱기 마그니피카 에보 ECAM290.84 전자동 커피머신", "De'Longhi Magnifica Evo ECAM290.84 Automatic Espresso Machine", "德龙 Magnifica Evo ECAM290.84 全自动咖啡机", 899.95], // 추정
  ["hm-dyson-v15", "다이슨 V15 디텍트 앱솔루트 청소기", "Dyson V15 Detect Absolute Vacuum", "戴森 V15 Detect Absolute 吸尘器", 849.99],
  ["hm-dyson-hp09", "다이슨 퓨리파이어 핫앤쿨 포름알데히드 HP09", "Dyson Purifier Hot+Cool Formaldehyde HP09", "戴森 Purifier Hot+Cool Formaldehyde HP09", 749.99],
  ["hm-dyson-washg1", "다이슨 워시G1 물청소기", "Dyson WashG1 Wet Cleaner", "戴森 WashG1 洗地机", 699.99],
  ["hm-breville-express", "브레빌 바리스타 익스프레스 BES870", "Breville the Barista Express BES870", "铂富 Barista Express BES870", 699.95],
  ["hm-vitamix-ascent-x4", "바이타믹스 어센트 X4 블렌더", "Vitamix Ascent X4 Blender", "Vitamix Ascent X4 破壁机", 699.95],
  ["hm-balmuda-brew", "발뮤다 더 브루 커피메이커", "BALMUDA The Brew Coffee Maker", "BALMUDA The Brew 咖啡机", 699],
  ["hm-dyson-v12", "다이슨 V12 디텍트 슬림 청소기", "Dyson V12 Detect Slim Vacuum", "戴森 V12 Detect Slim 吸尘器", 649.99],
  ["hm-coway-airmega400", "코웨이 에어메가 400 공기청정기", "Coway Airmega 400 Air Purifier", "Coway Airmega 400 空气净化器", 649],
  ["hm-ninja-luxecafe", "닌자 럭스 카페 프리미어 ES601", "Ninja Luxe Café Premier ES601", "Ninja Luxe Café Premier ES601", 599.99], // 추정
  ["hm-dyson-airwrap", "다이슨 에어랩 i.d. 멀티 스타일러", "Dyson Airwrap i.d. Multi-Styler", "戴森 Airwrap i.d. 多功能美发器", 599.99],
  ["hm-kitchenaid-artisan", "키친에이드 아티잔 5쿼트 스탠드 믹서", "KitchenAid Artisan 5 Quart Stand Mixer", "KitchenAid Artisan 5夸脱厨师机", 499.99],
  ["hm-dyson-supersonic", "다이슨 슈퍼소닉 뉴럴 헤어드라이어", "Dyson Supersonic Nural Hair Dryer", "戴森 Supersonic Nural 吹风机", 499.99],
  ["hm-breville-bambinoplus", "브레빌 밤비노 플러스 BES500", "Breville the Bambino Plus BES500", "铂富 Bambino Plus BES500", 499.95],
  ["hm-blueair-211i", "블루에어 블루 퓨어 211i 맥스 공기청정기", "Blueair Blue Pure 211i Max Air Purifier", "布鲁雅尔 Blue Pure 211i Max 空气净化器", 449.99],
  // 120 USDT 이상, 400 USDT 미만
  ["hm-balmuda-toaster", "발뮤다 더 토스터 프로", "BALMUDA The Toaster Pro", "BALMUDA The Toaster Pro", 379],
  ["hm-breville-oven", "브레빌 스마트 오븐 에어 프라이어 BOV860", "Breville the Smart Oven Air Fryer BOV860", "铂富 Smart Oven Air Fryer BOV860", 349.95],
  ["hm-zojirushi-ns", "조지루시 NS-TSC10 마이컴 밥솥", "Zojirushi NS-TSC10 Micom Rice Cooker", "象印 NS-TSC10 微电脑电饭煲", 229.99],
  ["hm-ninja-airfryer", "닌자 푸디 듀얼존 DZ201 에어프라이어", "Ninja Foodi DualZone DZ201 Air Fryer", "Ninja Foodi DualZone DZ201 空气炸锅", 199.99],
  ["hm-baratza-encore", "바라짜 엔코 ESP 커피 그라인더", "Baratza Encore ESP Coffee Grinder", "Baratza Encore ESP 咖啡磨豆机", 199.95],
  ["hm-balmuda-kettle", "발뮤다 더 팟 전기 주전자", "BALMUDA The Kettle", "BALMUDA The Kettle 电热水壶", 154],
  ["hm-balmuda-lantern", "발뮤다 더 랜턴", "BALMUDA The Lantern", "BALMUDA The Lantern 便携灯", 154],
  ["hm-instantpot-pro", "인스턴트팟 프로 6쿼트 멀티쿠커", "Instant Pot Pro 6 Quart Multicooker", "Instant Pot Pro 6夸脱多功能锅", 149.99],
  ["hm-levoit-core300s", "르보이트 코어 300S 공기청정기", "Levoit Core 300S Air Purifier", "Levoit Core 300S 空气净化器", 149.99],
  ["hm-shark-s3501", "샤크 스팀 포켓 S3501 스팀 청소기", "Shark Steam Pocket S3501 Steam Mop", "Shark Steam Pocket S3501 蒸汽拖把", 129.99],
  // 40 USDT 이상, 120 USDT 미만
  ["usdt-100", "100 USDT 인스턴트 드롭", "100 USDT Instant Drop", "100 USDT 即时到账", 100, "cash"],
  ["hm-braun-multiquick", "브라운 멀티퀵 5 MQ505 핸드블렌더", "Braun MultiQuick 5 MQ505 Hand Blender", "博朗 MultiQuick 5 MQ505 手持搅拌机", 69.95],
  ["hm-cosori-kettle", "코소리 전기 주전자 1.7L", "COSORI Electric Kettle 1.7L", "COSORI 电热水壶 1.7L", 49.99],
  ["hm-hamilton-iron", "해밀턴비치 듀라톤 19900 스팀 다리미", "Hamilton Beach Durathon 19900 Steam Iron", "Hamilton Beach Durathon 19900 蒸汽熨斗", 49.99],
  ["hm-instant-milk", "인스턴트 4인1 우유 거품기", "Instant 4-in-1 Milk Frother", "Instant 4合1奶泡机", 49.99],
  ["hm-levoit-dual150", "르보이트 듀얼 150 가습기", "Levoit Dual 150 Humidifier", "Levoit Dual 150 加湿器", 49.99],
  ["hm-cuisinart-toaster", "쿠진아트 CPT-122 2구 토스터", "Cuisinart CPT-122 2-Slice Toaster", "美膳雅 CPT-122 双槽烤面包机", 49.95],
  // 20 USDT 이상, 40 USDT 미만
  ["hm-dash-waffle", "대시 멀티 미니 와플 메이커", "Dash Multi Mini Waffle Maker", "Dash Multi Mini 华夫饼机", 39.99],
  ["hm-blackdecker-iron", "블랙앤데커 이지 스팀 IR40V 다리미", "BLACK+DECKER Easy Steam IR40V Iron", "百得 Easy Steam IR40V 熨斗", 24.99],
];
