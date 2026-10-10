import type { ItemSpec } from "@/lib/catalogTypes";

/**
 * 시계 박스 (20 USDT). 시중 정가는 2026년 기준 대략의 미국 공시가(1 USDT = 1 USD)와 주요 공식 판매처 가격을 참고한 어림값이다. 중고 시세가 아니라 신품 정가다.
 * 위 구간(400 USDT 이상)에 롤렉스, 오메가, 튜더, 그랜드 세이코 등. 아래로 세이코, 카시오, 가민, 시계 용품.
 */
export const VAULT_WATCH_ITEMS: ItemSpec[] = [
  // 400 USDT 이상
  ["wt-daytona", "롤렉스 코스모그래프 데이토나", "Rolex Cosmograph Daytona", "劳力士宇宙计型迪通拿", 15600],
  ["wt-submariner-date", "롤렉스 서브마리너 데이트", "Rolex Submariner Date", "劳力士潜航者型日历型", 10900],
  ["wt-gmt-master", "롤렉스 GMT 마스터 II", "Rolex GMT-Master II", "劳力士格林尼治型 II", 11300],
  ["wt-datejust-41", "롤렉스 데이트저스트 41", "Rolex Datejust 41", "劳力士日志型 41", 8600],
  ["wt-explorer", "롤렉스 익스플로러 40", "Rolex Explorer 40", "劳力士探险家型 40", 7900],
  ["wt-op-41", "롤렉스 오이스터 퍼페추얼 41", "Rolex Oyster Perpetual 41", "劳力士蚝式恒动型 41", 6700],
  ["wt-speedmaster", "오메가 스피드마스터 문워치", "Omega Speedmaster Moonwatch", "欧米茄超霸月球表", 7700],
  ["wt-seamaster-300", "오메가 씨마스터 다이버 300M", "Omega Seamaster Diver 300M", "欧米茄海马潜水 300 米", 6100],
  ["wt-aqua-terra", "오메가 아쿠아 테라 150M", "Omega Aqua Terra 150M", "欧米茄海马 Aqua Terra 150 米", 6500],
  ["wt-cartier-santos", "까르띠에 산토스 미디엄", "Cartier Santos Medium", "卡地亚 Santos 中号", 7500],
  ["wt-cartier-tank", "까르띠에 탱크 머스트", "Cartier Tank Must", "卡地亚 Tank Must", 3300],
  ["wt-iwc-pilot", "IWC 파일럿 워치 마크 XX", "IWC Pilot's Watch Mark XX", "万国飞行员腕表 Mark XX", 5800],
  ["wt-breitling-navitimer", "브라이틀링 내비타이머 B01", "Breitling Navitimer B01 Chronograph", "百年灵航空计时 B01", 10000],
  ["wt-zenith-chronomaster", "제니스 크로노마스터 스포트", "Zenith Chronomaster Sport", "真力时旗舰系列 Sport", 11000],
  ["wt-tudor-bb58", "튜더 블랙 베이 58", "Tudor Black Bay 58", "帝舵碧湾 58", 4200],
  ["wt-tudor-pelagos", "튜더 펠라고스 39", "Tudor Pelagos 39", "帝舵领潜型 39", 4800],
  ["wt-gs-snowflake", "그랜드 세이코 스노우플레이크", "Grand Seiko Snowflake SBGA211", "冠蓝狮雪花 SBGA211", 6300],
  ["wt-gs-white-birch", "그랜드 세이코 화이트 버치", "Grand Seiko White Birch SLGH005", "冠蓝狮白桦 SLGH005", 9900],
  ["wt-longines-spirit", "론진 스피릿 줄루 타임", "Longines Spirit Zulu Time", "浪琴先行者 Zulu Time", 3400],
  ["wt-oris-aquis", "오리스 아퀴스 데이트", "Oris Aquis Date", "豪利时 Aquis 日历", 2500],
  ["wt-tag-carrera", "태그호이어 까레라 크로노그래프", "TAG Heuer Carrera Chronograph", "泰格豪雅卡莱拉计时", 6500],
  ["wt-tag-aquaracer", "태그호이어 아쿠아레이서", "TAG Heuer Aquaracer Professional 300", "泰格豪雅竞潜 300", 3300],
  ["wt-nomos-tangente", "노모스 탕겐테", "Nomos Tangente", "NOMOS Tangente", 2300],
  ["wt-hamilton-khaki", "해밀턴 카키 필드 오토", "Hamilton Khaki Field Auto", "汉米尔顿卡其野战自动", 900],
  ["wt-tissot-prx", "티쏘 PRX 파워매틱 80", "Tissot PRX Powermatic 80", "天梭 PRX Powermatic 80", 750],
  ["wt-seiko-presage", "세이코 프레사지 샤프 엣지", "Seiko Presage Sharp Edged", "精工 Presage 锐边系列", 1000],
  ["wt-seiko-prospex", "세이코 프로스펙스 다이버", "Seiko Prospex Diver SPB143", "精工 Prospex 潜水表 SPB143", 1200],
  ["wt-apple-ultra-2", "애플워치 울트라 2", "Apple Watch Ultra 2", "Apple Watch Ultra 2", 800],
  ["wt-garmin-fenix-8", "가민 피닉스 8", "Garmin Fenix 8", "佳明 Fenix 8", 1000],
  ["wt-garmin-epix", "가민 에픽스 프로", "Garmin Epix Pro", "佳明 Epix Pro", 900],
  ["wt-casio-mrg", "카시오 G-SHOCK MR-G", "Casio G-SHOCK MR-G", "卡西欧 G-SHOCK MR-G", 3000],
  ["wt-casio-frogman", "카시오 G-SHOCK 프로그맨", "Casio G-SHOCK Frogman", "卡西欧 G-SHOCK 蛙人", 500],
  ["wt-citizen-promaster", "시티즌 프로마스터 다이버", "Citizen Promaster Diver", "西铁城 Promaster 潜水表", 450],
  ["wt-wolf-winder", "울프 와인더 (더블)", "WOLF Double Watch Winder", "WOLF 双表摇表器", 1000],
  // 120 USDT 이상
  ["wt-seiko-5", "세이코 5 스포츠", "Seiko 5 Sports", "精工 5 号运动", 300],
  ["wt-orient-bambino", "오리엔트 밤비노", "Orient Bambino", "东方双狮 Bambino", 180],
  ["wt-casio-oceanus", "카시오 오셔너스", "Casio Oceanus", "卡西欧 Oceanus", 380],
  ["wt-samsung-watch-8", "갤럭시 워치8 클래식", "Galaxy Watch8 Classic", "Galaxy Watch8 Classic", 350],
  ["wt-garmin-forerunner", "가민 포러너 265", "Garmin Forerunner 265", "佳明 Forerunner 265", 350],
  ["wt-watch-box-12", "가죽 시계 보관함 12구", "Leather Watch Box for 12", "12 格皮质表盒", 200],
  ["wt-leather-strap", "이탈리아 가죽 스트랩", "Italian Leather Strap", "意大利皮表带", 120],
  // 40 USDT 이상
  ["wt-casio-ga2100", "카시오 G-SHOCK GA-2100", "Casio G-SHOCK GA-2100", "卡西欧 G-SHOCK GA-2100", 100],
  ["wt-timex-expedition", "타이맥스 익스페디션", "Timex Expedition", "天美时 Expedition", 60],
  ["wt-casio-edifice", "카시오 에디피스", "Casio Edifice", "卡西欧 Edifice", 150],
  ["wt-rubber-strap", "FKM 러버 스트랩", "FKM Rubber Strap", "FKM 橡胶表带", 60],
  ["wt-strap-tool", "스프링바 공구 세트", "Spring Bar Tool Kit", "弹簧杆工具套装", 40],
  ["gc-amazon100", "아마존 글로벌 기프트카드 $100", "Amazon Global Gift Card $100", "Amazon 全球礼品卡 $100", 100, "digital"],
  ["usdt-100", "100 USDT 인스턴트 드롭", "100 USDT Instant Drop", "100 USDT 即时到账", 100, "cash"],
  // 40 USDT 미만
  ["wt-casio-f91w", "카시오 F-91W", "Casio F-91W", "卡西欧 F-91W", 25],
  ["wt-watch-roll", "가죽 시계 롤 (3구)", "Leather Watch Roll for 3", "3 格皮质表卷", 35],
];
