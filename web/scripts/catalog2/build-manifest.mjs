// catalog/BOX_PLAN.md 의 "B. 카테고리별 브랜드 박스 320개" 표를 읽어
// web/lib/catalog2/manifest.json 을 만든다.
// 실행: node web/scripts/catalog2/build-manifest.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, "../../../catalog/BOX_PLAN.md");
const OUT = resolve(here, "../../lib/catalog2/manifest.json");

const CATEGORY_KEYS = [
  "car", "watch", "bag", "jewelry", "fashion", "mobile", "computer", "gaming",
  "audio", "camera", "home", "pokemon", "toy", "outdoor", "sport", "beauty",
];
const CATEGORY_NAMES = [
  "자동차", "시계", "여성 가방", "주얼리", "패션과 신발", "모바일과 태블릿",
  "컴퓨터와 데스크", "게임과 게이밍 장비", "오디오", "카메라와 촬영", "생활가전",
  "포켓몬", "토이와 컬렉터블", "아웃도어와 캠핑", "스포츠와 피트니스", "뷰티와 향수",
];

// 한국어 박스 이름 -> [brand, titleZh, { slug?, en? }]
// slug 를 안 적으면 brand 에서 만든다. en 을 안 적으면 "<brand> Box".
// 한국어 이름에 수식어(가방, 시계, 뷰티 등)가 있으면 en, zh 에도 같은 수식어를 넣어
// 같은 브랜드의 다른 박스와 이름이 겹치지 않게 한다.
const MAP = {
  // 1. car
  "롤스로이스 박스": ["Rolls-Royce", "劳斯莱斯盒"],
  "벤틀리 박스": ["Bentley", "宾利盒"],
  "포르쉐 박스": ["Porsche", "保时捷盒"],
  "슈퍼카 박스": ["Supercar", "超跑盒"],
  "마이바흐 박스": ["Maybach", "迈巴赫盒"],
  "제네시스 박스": ["Genesis", "捷尼赛思盒"],
  "토요타 박스": ["Toyota", "丰田盒"],
  "BMW 박스": ["BMW", "宝马盒"],
  "아우디 박스": ["Audi", "奥迪盒"],
  "렉서스 박스": ["Lexus", "雷克萨斯盒"],
  "랜드로버 박스": ["Land Rover", "路虎盒"],
  "애스턴마틴 박스": ["Aston Martin", "阿斯顿马丁盒"],
  "마세라티 박스": ["Maserati", "玛莎拉蒂盒"],
  "캐딜락 박스": ["Cadillac", "凯迪拉克盒"],
  "링컨 박스": ["Lincoln", "林肯盒"],
  "볼보 박스": ["Volvo", "沃尔沃盒"],
  "테슬라 박스": ["Tesla", "特斯拉盒"],
  "현대 박스": ["Hyundai", "现代盒"],
  "기아 박스": ["Kia", "起亚盒"],
  "포드 박스": ["Ford", "福特盒"],

  // 2. watch
  "롤렉스 박스": ["Rolex", "劳力士盒"],
  "파텍필립 박스": ["Patek Philippe", "百达翡丽盒"],
  "오데마 피게 박스": ["Audemars Piguet", "爱彼盒"],
  "바쉐론 콘스탄틴 박스": ["Vacheron Constantin", "江诗丹顿盒"],
  "랑에 운트 죄네 박스": ["A. Lange & Söhne", "朗格盒"],
  "오메가 박스": ["Omega", "欧米茄盒"],
  "까르띠에 시계 박스": ["Cartier", "卡地亚腕表盒", { en: "Cartier Watch Box" }],
  "IWC 박스": ["IWC", "万国表盒"],
  "예거 르쿨트르 박스": ["Jaeger-LeCoultre", "积家盒"],
  "브라이틀링 박스": ["Breitling", "百年灵盒"],
  "태그호이어 박스": ["TAG Heuer", "泰格豪雅盒"],
  "파네라이 박스": ["Panerai", "沛纳海盒"],
  "위블로 박스": ["Hublot", "宇舶盒"],
  "제니스 박스": ["Zenith", "真力时盒"],
  "블랑팡 박스": ["Blancpain", "宝珀盒"],
  "브레게 박스": ["Breguet", "宝玑盒"],
  "그랜드세이코 박스": ["Grand Seiko", "冠蓝狮盒"],
  "튜더 박스": ["Tudor", "帝舵盒"],
  "론진 박스": ["Longines", "浪琴盒"],
  "세이코 박스": ["Seiko", "精工盒"],

  // 3. bag
  "에르메스 가방 박스": ["Hermès", "爱马仕手袋盒", { en: "Hermès Bag Box" }],
  "샤넬 가방 박스": ["Chanel", "香奈儿手袋盒", { en: "Chanel Bag Box" }],
  "디올 가방 박스": ["Dior", "迪奥手袋盒", { en: "Dior Bag Box" }],
  "루이비통 가방 박스": ["Louis Vuitton", "路易威登手袋盒", { en: "Louis Vuitton Bag Box" }],
  "구찌 가방 박스": ["Gucci", "古驰手袋盒", { en: "Gucci Bag Box" }],
  "프라다 가방 박스": ["Prada", "普拉达手袋盒", { en: "Prada Bag Box" }],
  "미우미우 박스": ["Miu Miu", "缪缪盒"],
  "생로랑 가방 박스": ["Saint Laurent", "圣罗兰手袋盒", { en: "Saint Laurent Bag Box" }],
  "셀린느 박스": ["Celine", "思琳盒"],
  "로에베 박스": ["Loewe", "罗意威盒"],
  "보테가 베네타 박스": ["Bottega Veneta", "葆蝶家盒"],
  "펜디 박스": ["Fendi", "芬迪盒"],
  "발렌시아가 가방 박스": ["Balenciaga", "巴黎世家手袋盒", { en: "Balenciaga Bag Box" }],
  "지방시 박스": ["Givenchy", "纪梵希盒"],
  "발렌티노 가라바니 박스": ["Valentino Garavani", "华伦天奴盒"],
  "페라가모 박스": ["Ferragamo", "菲拉格慕盒"],
  "델보 박스": ["Delvaux", "德尔沃盒"],
  "고야드 박스": ["Goyard", "戈雅盒"],
  "끌로에 박스": ["Chloé", "蔻依盒"],
  "멀버리 박스": ["Mulberry", "玛珀利盒"],

  // 4. jewelry
  "까르띠에 주얼리 박스": ["Cartier", "卡地亚珠宝盒", { en: "Cartier Jewelry Box" }],
  "티파니 박스": ["Tiffany & Co.", "蒂芙尼盒", { slug: "tiffany" }],
  "반클리프 아펠 박스": ["Van Cleef & Arpels", "梵克雅宝盒"],
  "불가리 박스": ["Bvlgari", "宝格丽盒"],
  "쇼메 박스": ["Chaumet", "尚美巴黎盒"],
  "부쉐론 박스": ["Boucheron", "宝诗龙盒"],
  "쇼파드 박스": ["Chopard", "萧邦盒"],
  "피아제 박스": ["Piaget", "伯爵盒"],
  "그라프 박스": ["Graff", "格拉夫盒"],
  "해리 윈스턴 박스": ["Harry Winston", "海瑞温斯顿盒"],
  "메시카 박스": ["Messika", "梅西卡盒"],
  "프레드 박스": ["Fred", "斐登盒"],
  "포멜라토 박스": ["Pomellato", "宝曼兰朵盒"],
  "부첼라티 박스": ["Buccellati", "布契拉提盒"],
  "다미아니 박스": ["Damiani", "玳美雅盒"],
  "레포시 박스": ["Repossi", "Repossi 盒"],
  "타사키 박스": ["Tasaki", "塔思琦盒"],
  "미키모토 박스": ["Mikimoto", "御木本盒"],
  "데이비드 율만 박스": ["David Yurman", "大卫雅曼盒"],
  "스와로브스키 박스": ["Swarovski", "施华洛世奇盒"],

  // 5. fashion
  "나이키 패션 박스": ["Nike", "耐克时尚盒", { en: "Nike Fashion Box" }],
  "아디다스 패션 박스": ["adidas", "阿迪达斯时尚盒", { en: "adidas Fashion Box" }],
  "뉴발란스 박스": ["New Balance", "新百伦盒"],
  "아식스 박스": ["ASICS", "亚瑟士盒"],
  "살로몬 박스": ["Salomon", "萨洛蒙盒"],
  "온 박스": ["On", "昂跑盒"],
  "호카 박스": ["HOKA", "HOKA 盒"],
  "조던 박스": ["Jordan", "Jordan 盒"],
  "컨버스 박스": ["Converse", "匡威盒"],
  "반스 박스": ["Vans", "范斯盒"],
  "닥터마틴 박스": ["Dr. Martens", "马汀博士盒"],
  "팀버랜드 박스": ["Timberland", "添柏岚盒"],
  "버켄스탁 박스": ["Birkenstock", "勃肯盒"],
  "어그 박스": ["UGG", "UGG 盒"],
  "몽클레르 박스": ["Moncler", "盟可睐盒"],
  "캐나다구스 박스": ["Canada Goose", "加拿大鹅盒"],
  "버버리 박스": ["Burberry", "博柏利盒"],
  "아크테릭스 박스": ["Arc'teryx", "始祖鸟盒"],
  "노스페이스 박스": ["The North Face", "北面盒"],
  "파타고니아 박스": ["Patagonia", "巴塔哥尼亚盒"],

  // 6. mobile
  "애플 모바일 박스": ["Apple", "苹果移动设备盒", { en: "Apple Mobile Box" }],
  "삼성 갤럭시 박스": ["Samsung", "三星 Galaxy 盒", { en: "Samsung Galaxy Box" }],
  "구글 픽셀 박스": ["Google", "谷歌 Pixel 盒", { en: "Google Pixel Box" }],
  "샤오미 모바일 박스": ["Xiaomi", "小米移动设备盒", { en: "Xiaomi Mobile Box" }],
  "오포 박스": ["OPPO", "OPPO 盒"],
  "원플러스 박스": ["OnePlus", "一加盒"],
  "비보 박스": ["vivo", "vivo 盒"],
  "아너 박스": ["HONOR", "荣耀盒"],
  "모토로라 박스": ["Motorola", "摩托罗拉盒"],
  "낫싱 박스": ["Nothing", "Nothing 盒"],
  "소니 엑스페리아 박스": ["Sony", "索尼 Xperia 盒", { en: "Sony Xperia Box" }],
  "에이수스 모바일 박스": ["ASUS", "华硕移动设备盒", { en: "ASUS Mobile Box" }],
  "레드매직 박스": ["REDMAGIC", "红魔盒"],
  "화웨이 모바일 박스": ["Huawei", "华为移动设备盒", { en: "Huawei Mobile Box" }],
  "레노버 태블릿 박스": ["Lenovo", "联想平板盒", { en: "Lenovo Tablet Box" }],
  "HMD 박스": ["HMD", "HMD 盒"],
  "리얼미 박스": ["realme", "真我盒"],
  "테크노 박스": ["TECNO", "TECNO 盒"],
  "인피닉스 박스": ["Infinix", "Infinix 盒"],
  "앤커 충전 박스": ["Anker", "安克充电盒", { en: "Anker Charging Box" }],

  // 7. computer
  "애플 맥 박스": ["Apple", "苹果 Mac 盒", { en: "Apple Mac Box" }],
  "삼성 갤럭시북 박스": ["Samsung", "三星 Galaxy Book 盒", { en: "Samsung Galaxy Book Box" }],
  "LG 데스크 박스": ["LG", "LG 桌面盒", { en: "LG Desk Box" }],
  "델 박스": ["Dell", "戴尔盒"],
  "HP 박스": ["HP", "惠普盒"],
  "레노버 컴퓨터 박스": ["Lenovo", "联想电脑盒", { en: "Lenovo Computer Box" }],
  "에이수스 크리에이터 박스": ["ASUS", "华硕创作者盒", { en: "ASUS Creator Box" }],
  "에이서 박스": ["Acer", "宏碁盒"],
  "MSI 크리에이터 박스": ["MSI", "微星创作者盒", { en: "MSI Creator Box" }],
  "마이크로소프트 서피스 박스": ["Microsoft", "微软 Surface 盒", { en: "Microsoft Surface Box" }],
  "레이저 노트북 박스": ["Razer", "雷蛇笔记本盒", { en: "Razer Laptop Box" }],
  "기가바이트 박스": ["GIGABYTE", "技嘉盒"],
  "인텔 박스": ["Intel", "英特尔盒"],
  "AMD 박스": ["AMD", "AMD 盒"],
  "엔비디아 박스": ["NVIDIA", "英伟达盒"],
  "커세어 데스크 박스": ["Corsair", "海盗船桌面盒", { en: "Corsair Desk Box" }],
  "로지텍 오피스 박스": ["Logitech", "罗技办公盒", { en: "Logitech Office Box" }],
  "키크론 박스": ["Keychron", "Keychron 盒"],
  "벤큐 박스": ["BenQ", "明基盒"],
  "에이조 박스": ["EIZO", "艺卓盒"],

  // 8. gaming
  "플레이스테이션 박스": ["PlayStation", "PlayStation 盒"],
  "엑스박스 박스": ["Xbox", "Xbox 盒"],
  "닌텐도 박스": ["Nintendo", "任天堂盒"],
  "밸브 박스": ["Valve", "维尔福盒"],
  "에이수스 ROG 박스": ["ASUS", "华硕 ROG 盒", { en: "ASUS ROG Box" }],
  "MSI 게이밍 박스": ["MSI", "微星游戏盒", { en: "MSI Gaming Box" }],
  "레이저 게이밍 박스": ["Razer", "雷蛇游戏盒", { en: "Razer Gaming Box" }],
  "로지텍 G 박스": ["Logitech", "罗技 G 盒", { en: "Logitech G Box" }],
  "스틸시리즈 박스": ["SteelSeries", "赛睿盒"],
  "커세어 게이밍 박스": ["Corsair", "海盗船游戏盒", { en: "Corsair Gaming Box" }],
  "하이퍼엑스 박스": ["HyperX", "极度未知盒"],
  "터틀비치 박스": ["Turtle Beach", "乌龟海岸盒"],
  "8BitDo 박스": ["8BitDo", "八位堂盒"],
  "SCUF 박스": ["SCUF", "SCUF 盒"],
  "트러스트마스터 박스": ["Thrustmaster", "图马思特盒"],
  "파나텍 박스": ["Fanatec", "Fanatec 盒"],
  "모자 레이싱 박스": ["MOZA Racing", "MOZA Racing 盒", { slug: "moza" }],
  "엘가토 박스": ["Elgato", "Elgato 盒"],
  "에버미디어 박스": ["AVerMedia", "圆刚盒"],
  "빅트릭스 박스": ["Victrix", "Victrix 盒"],

  // 9. audio
  "소니 오디오 박스": ["Sony", "索尼音频盒", { en: "Sony Audio Box" }],
  "보스 박스": ["Bose", "Bose 盒"],
  "젠하이저 박스": ["Sennheiser", "森海塞尔盒"],
  "뱅앤올룹슨 박스": ["Bang & Olufsen", "铂傲盒"],
  "바워스앤윌킨스 박스": ["Bowers & Wilkins", "宝华韦健盒"],
  "KEF 박스": ["KEF", "KEF 盒"],
  "드비알레 박스": ["Devialet", "帝瓦雷盒"],
  "소노스 박스": ["Sonos", "搜诺思盒"],
  "마샬 박스": ["Marshall", "马歇尔盒"],
  "JBL 박스": ["JBL", "JBL 盒"],
  "하만카돈 박스": ["Harman Kardon", "哈曼卡顿盒"],
  "오디오테크니카 박스": ["Audio-Technica", "铁三角盒"],
  "슈어 박스": ["Shure", "舒尔盒"],
  "포칼 박스": ["Focal", "劲浪盒"],
  "베이어다이내믹 박스": ["beyerdynamic", "拜雅盒"],
  "오디지 박스": ["Audeze", "Audeze 盒"],
  "AKG 박스": ["AKG", "爱科技盒"],
  "테크닉스 박스": ["Technics", "Technics 盒"],
  "야마하 오디오 박스": ["Yamaha", "雅马哈音频盒", { en: "Yamaha Audio Box" }],
  "피오 박스": ["FiiO", "飞傲盒"],

  // 10. camera
  "캐논 EOS 박스": ["Canon", "佳能 EOS 盒", { en: "Canon EOS Box" }],
  "니콘 Z 박스": ["Nikon", "尼康 Z 盒", { en: "Nikon Z Box" }],
  "소니 알파 박스": ["Sony", "索尼 Alpha 盒", { en: "Sony Alpha Box" }],
  "후지필름 박스": ["Fujifilm", "富士盒"],
  "파나소닉 루믹스 박스": ["Panasonic", "松下 LUMIX 盒", { en: "Panasonic LUMIX Box" }],
  "OM SYSTEM 박스": ["OM SYSTEM", "奥之心盒"],
  "펜탁스 박스": ["Pentax", "宾得盒"],
  "리코 박스": ["Ricoh", "理光盒"],
  "라이카 박스": ["Leica", "徕卡盒"],
  "핫셀블라드 박스": ["Hasselblad", "哈苏盒"],
  "페이즈원 박스": ["Phase One", "飞思盒"],
  "고프로 박스": ["GoPro", "GoPro 盒"],
  "DJI 촬영 박스": ["DJI", "大疆影像盒", { en: "DJI Imaging Box" }],
  "인스타360 박스": ["Insta360", "影石盒"],
  "시그마 박스": ["Sigma", "适马盒"],
  "탐론 박스": ["Tamron", "腾龙盒"],
  "자이스 렌즈 박스": ["ZEISS", "蔡司镜头盒", { en: "ZEISS Lens Box" }],
  "삼양 렌즈 박스": ["Samyang", "森养镜头盒", { en: "Samyang Lens Box" }],
  "고독스 박스": ["Godox", "神牛盒"],
  "프로포토 박스": ["Profoto", "保富图盒"],

  // 11. home
  "LG 가전 풀팩 박스": ["LG", "LG 家电全套盒", { en: "LG Appliance Full Pack Box" }],
  "삼성 가전 풀팩 박스": ["Samsung", "三星家电全套盒", { en: "Samsung Appliance Full Pack Box" }],
  "밀레 가전 풀팩 박스": ["Miele", "美诺家电全套盒", { en: "Miele Appliance Full Pack Box" }],
  "다이슨 생활가전 박스": ["Dyson", "戴森家电盒", { en: "Dyson Home Appliance Box" }],
  "로보락 박스": ["Roborock", "石头科技盒"],
  "드리미 박스": ["Dreame", "追觅盒"],
  "아이로봇 박스": ["iRobot", "艾罗伯特盒"],
  "에코백스 박스": ["Ecovacs", "科沃斯盒"],
  "샤크 박스": ["Shark", "鲨客盒"],
  "닌자 박스": ["Ninja", "Ninja 盒"],
  "브레빌 박스": ["Breville", "铂富盒"],
  "드롱기 박스": ["De'Longhi", "德龙盒"],
  "스메그 박스": ["Smeg", "斯麦格盒"],
  "필립스 박스": ["Philips", "飞利浦盒"],
  "브라운 박스": ["Braun", "博朗盒"],
  "파나소닉 생활가전 박스": ["Panasonic", "松下家电盒", { en: "Panasonic Home Appliance Box" }],
  "발뮤다 박스": ["Balmuda", "巴慕达盒"],
  "쿠쿠 박스": ["Cuckoo", "福库盒"],
  "코웨이 박스": ["Coway", "Coway 盒"],
  "샤오미 생활가전 박스": ["Xiaomi", "小米家电盒", { en: "Xiaomi Home Appliance Box" }],

  // 12. pokemon
  "리자몽 박스": ["Charizard", "喷火龙盒"],
  "피카츄 박스": ["Pikachu", "皮卡丘盒"],
  "거북왕 박스": ["Blastoise", "水箭龟盒"],
  "이상해꽃 박스": ["Venusaur", "妙蛙花盒"],
  "뮤 박스": ["Mew", "梦幻盒"],
  "뮤츠 박스": ["Mewtwo", "超梦盒"],
  "블래키 박스": ["Umbreon", "月亮伊布盒"],
  "에브이 박스": ["Espeon", "太阳伊布盒"],
  "님피아 박스": ["Sylveon", "仙子伊布盒"],
  "리피아 박스": ["Leafeon", "叶伊布盒"],
  "글레이시아 박스": ["Glaceon", "冰伊布盒"],
  "레쿠쟈 박스": ["Rayquaza", "烈空坐盒"],
  "팬텀 박스": ["Gengar", "耿鬼盒"],
  "루기아 박스": ["Lugia", "洛奇亚盒"],
  "기라티나 박스": ["Giratina", "骑拉帝纳盒"],
  "망나뇽 박스": ["Dragonite", "快龙盒"],
  "잠만보 박스": ["Snorlax", "卡比兽盒"],
  "후딘 박스": ["Alakazam", "胡地盒"],
  "썬더 박스": ["Zapdos", "闪电鸟盒"],
  "잉어킹 박스": ["Magikarp", "鲤鱼王盒"],

  // 13. toy
  "레고 박스": ["LEGO", "乐高盒"],
  "반다이 박스": ["Bandai", "万代盒"],
  "핫휠 박스": ["Hot Wheels", "风火轮盒"],
  "바비 박스": ["Barbie", "芭比盒"],
  "실바니안 패밀리 박스": ["Sylvanian Families", "森贝儿家族盒"],
  "팝마트 박스": ["POP MART", "泡泡玛特盒"],
  "스미스키 박스": ["Smiski", "Smiski 盒"],
  "젤리캣 박스": ["Jellycat", "Jellycat 盒"],
  "플레이모빌 박스": ["Playmobil", "摩比世界盒"],
  "브리오 박스": ["BRIO", "BRIO 盒"],
  "슐라이히 박스": ["Schleich", "思乐盒"],
  "라벤스부르거 박스": ["Ravensburger", "睿思盒"],
  "시쿠 박스": ["Siku", "仕高盒"],
  "토미카 박스": ["Tomica", "多美卡盒"],
  "타미야 박스": ["Tamiya", "田宫盒"],
  "굿스마일 박스": ["Good Smile Company", "良笑社盒", { slug: "good-smile" }],
  "너프 박스": ["Nerf", "热火盒"],
  "슈타이프 박스": ["Steiff", "Steiff 盒"],
  "마일레그 박스": ["Maileg", "Maileg 盒"],
  "메가 박스": ["MEGA", "美高盒"],

  // 14. outdoor
  "스노우피크 박스": ["Snow Peak", "雪峰盒"],
  "헬리녹스 박스": ["Helinox", "Helinox 盒"],
  "예티 박스": ["YETI", "YETI 盒"],
  "MSR 박스": ["MSR", "MSR 盒"],
  "써머레스트 박스": ["Therm-a-Rest", "Therm-a-Rest 盒"],
  "콜맨 박스": ["Coleman", "科勒曼盒"],
  "스탠리 박스": ["Stanley", "史丹利盒"],
  "페츨 박스": ["Petzl", "攀索盒"],
  "레더맨 박스": ["Leatherman", "莱泽曼盒"],
  "바이오라이트 박스": ["BioLite", "BioLite 盒"],
  "니모 박스": ["NEMO", "NEMO 盒"],
  "힐레베르그 박스": ["Hilleberg", "Hilleberg 盒"],
  "빅아그네스 박스": ["Big Agnes", "Big Agnes 盒"],
  "씨투써밋 박스": ["Sea to Summit", "Sea to Summit 盒"],
  "오스프리 박스": ["Osprey", "Osprey 盒"],
  "도이터 박스": ["Deuter", "多特盒"],
  "그레고리 박스": ["Gregory", "格里高利盒"],
  "블랙다이아몬드 박스": ["Black Diamond", "黑钻盒"],
  "몽벨 박스": ["Montbell", "Montbell 盒"],
  "도메틱 박스": ["Dometic", "多美达盒"],

  // 15. sport
  "윌슨 박스": ["Wilson", "威尔胜盒"],
  "바볼랏 박스": ["Babolat", "百保力盒"],
  "요넥스 박스": ["Yonex", "尤尼克斯盒"],
  "헤드 박스": ["HEAD", "海德盒"],
  "아디다스 스포츠 박스": ["adidas", "阿迪达斯运动盒", { en: "adidas Sport Box" }],
  "미카사 박스": ["Mikasa", "米卡萨盒"],
  "타이틀리스트 박스": ["Titleist", "泰特利斯盒"],
  "스카티카메론 박스": ["Scotty Cameron", "Scotty Cameron 盒"],
  "가민 스포츠 박스": ["Garmin", "佳明运动盒", { en: "Garmin Sport Box" }],
  "폴라 박스": ["Polar", "博能盒"],
  "로그 박스": ["Rogue", "Rogue 盒"],
  "엘리코 박스": ["Eleiko", "Eleiko 盒"],
  "컨셉투 박스": ["Concept2", "Concept2 盒"],
  "만두카 박스": ["Manduka", "Manduka 盒"],
  "발라 박스": ["Bala", "Bala 盒"],
  "TRX 박스": ["TRX", "TRX 盒"],
  "테라바디 박스": ["Therabody", "Therabody 盒"],
  "하이퍼아이스 박스": ["Hyperice", "Hyperice 盒"],
  "하야부사 박스": ["Hayabusa", "Hayabusa 盒"],
  "스피도 박스": ["Speedo", "速比涛盒"],

  // 16. beauty
  "샤넬 뷰티 박스": ["Chanel", "香奈儿美妆盒", { en: "Chanel Beauty Box" }],
  "디올 뷰티 박스": ["Dior", "迪奥美妆盒", { en: "Dior Beauty Box" }],
  "조말론 런던 박스": ["Jo Malone London", "祖玛珑盒", { slug: "jo-malone" }],
  "르라보 박스": ["Le Labo", "勒莱柏盒"],
  "메종 프란시스 커정 박스": ["Maison Francis Kurkdjian", "梵诗柯香盒"],
  "톰포드 뷰티 박스": ["Tom Ford", "汤姆福特美妆盒", { en: "Tom Ford Beauty Box" }],
  "바이레도 박스": ["Byredo", "柏芮朵盒"],
  "딥티크 박스": ["Diptyque", "蒂普提克盒"],
  "크리드 박스": ["Creed", "恺芮得盒"],
  "입생로랑 뷰티 박스": ["Yves Saint Laurent", "圣罗兰美妆盒", { slug: "ysl", en: "YSL Beauty Box" }],
  "프라다 뷰티 박스": ["Prada", "普拉达美妆盒", { en: "Prada Beauty Box" }],
  "메종 마르지엘라 향수 박스": ["Maison Margiela", "梅森马吉拉香水盒", { en: "Maison Margiela Fragrance Box" }],
  "이솝 박스": ["Aesop", "伊索盒"],
  "록시땅 박스": ["L'Occitane", "欧舒丹盒"],
  "키엘 박스": ["Kiehl's", "科颜氏盒"],
  "에스티로더 박스": ["Estée Lauder", "雅诗兰黛盒"],
  "랑콤 박스": ["Lancôme", "兰蔻盒"],
  "SK-II 박스": ["SK-II", "SK-II 盒"],
  "라메르 박스": ["La Mer", "海蓝之谜盒"],
  "다이슨 헤어 박스": ["Dyson", "戴森美发盒", { en: "Dyson Hair Box" }],
};

function kebab(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitPair(cell, where) {
  const parts = cell.split(" / ").map((s) => s.trim());
  if (parts.length !== 2 || parts.some((p) => !p)) {
    throw new Error(`두 개로 나뉘지 않는 칸 (${where}): ${cell}`);
  }
  return parts;
}

const lines = readFileSync(SRC, "utf8").split(/\r?\n/);
const start = lines.findIndex((l) => l.includes("**B. 카테고리별 브랜드 박스 320개**"));
if (start < 0) throw new Error("B 절을 찾지 못했다");
let end = lines.findIndex((l, i) => i > start && /^\*\*C\. /.test(l));
if (end < 0) end = lines.length;

const out = [];
const used = new Set();
let catIdx = -1;

for (let i = start + 1; i < end; i++) {
  const line = lines[i];
  const head = line.match(/^\*\*(\d+)\. (.+), 20개\*\*\s*$/);
  if (head) {
    catIdx = Number(head[1]) - 1;
    if (CATEGORY_NAMES[catIdx] !== head[2]) {
      throw new Error(`카테고리 순서가 다르다: ${head[1]} ${head[2]}`);
    }
    continue;
  }
  if (catIdx < 0 || !line.startsWith("|")) continue;
  const cells = line.replace(/^\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());
  if (cells.length !== 4) continue;
  const priceMatch = cells[1].match(/^\$(\d+)$/);
  if (!priceMatch) continue; // 머리줄, 구분줄

  const title = cells[0];
  const entry = MAP[title];
  if (!entry) throw new Error(`매핑이 없는 박스: ${title} (줄 ${i + 1})`);
  if (used.has(title)) throw new Error(`박스 이름이 겹친다: ${title}`);
  used.add(title);

  const [brand, titleZh, opt = {}] = entry;
  const category = CATEGORY_KEYS[catIdx];
  out.push({
    category,
    slug: `${category}-${opt.slug ?? kebab(brand)}`,
    brand,
    title,
    titleEn: opt.en ?? `${brand} Box`,
    titleZh,
    price: Number(priceMatch[1]),
    top: splitPair(cells[2], title),
    low: splitPair(cells[3], title),
  });
}

const unused = Object.keys(MAP).filter((k) => !used.has(k));
if (unused.length) throw new Error(`표에 없는 매핑: ${unused.join(", ")}`);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${out.length} boxes -> ${OUT}`);
