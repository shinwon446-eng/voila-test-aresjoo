import type { ItemSpec } from "@/lib/catalogTypes";

/**
 * 음악 박스 (3 USDT). 가격 근거: 미국 제조사 공식 판매가(https://electronics.sony.com/audio/ , https://www.bang-olufsen.com/en/us/headphones , https://www.sonos.com/en-us/products/wireless-speakers , https://www.marshall.com/us/en/speakers)와 주요 오디오 판매처 신품 가격를 참고한 2026년 미국 신품 세전 어림값(1 USDT = 1 USD).
 * 구간은 박스 가격의 20배 이상, 6배 이상 20배 미만, 2배 이상 6배 미만, 1배 이상 2배 미만이며 불확실성이 큰 가격은 상품 행 끝에 표시한다.
 */
export const STARTER_AUDIO_ITEMS: ItemSpec[] = [
  // 60 USDT 이상 (위 구간)
  ["au-beoplay-h100", "뱅앤올룹슨 베오플레이 H100", "Bang & Olufsen Beoplay H100", "Bang & Olufsen Beoplay H100", 2200],
  ["au-hd800s", "젠하이저 HD 800 S", "Sennheiser HD 800 S", "森海塞尔 HD 800 S", 1999.95],
  ["au-beoplay-h95", "뱅앤올룹슨 베오플레이 H95", "Bang & Olufsen Beoplay H95", "Bang & Olufsen Beoplay H95", 1250],
  ["au-arc-ultra", "소노스 아크 울트라", "Sonos Arc Ultra", "Sonos Arc Ultra", 1099], // 추정
  ["au-sub4", "소노스 서브 4", "Sonos Sub 4", "Sonos Sub 4", 899], // 추정
  ["au-ie600", "젠하이저 IE 600", "Sennheiser IE 600", "森海塞尔 IE 600", 799.95], // 추정
  ["au-beoplay-hx", "뱅앤올룹슨 베오플레이 HX", "Bang & Olufsen Beoplay HX", "Bang & Olufsen Beoplay HX", 749],
  ["au-debut-evo2", "프로젝트 데뷔 에보 2 턴테이블", "Pro-Ject Debut EVO 2 Turntable", "宝碟 Debut EVO 2 黑胶唱机", 699], // 추정
  ["au-hd660s2", "젠하이저 HD 660S2", "Sennheiser HD 660S2", "森海塞尔 HD 660S2", 679.95],
  ["au-woburn3", "마샬 워번 III", "Marshall Woburn III", "Marshall Woburn III", 599.99],
  ["au-move2", "소노스 무브 2", "Sonos Move 2", "Sonos Move 2", 499], // 추정
  ["au-era300", "소노스 에라 300", "Sonos Era 300", "Sonos Era 300", 479],
  ["au-wh1000xm6", "소니 WH-1000XM6", "Sony WH-1000XM6", "索尼 WH-1000XM6", 449.99],
  ["au-hd600", "젠하이저 HD 600", "Sennheiser HD 600", "森海塞尔 HD 600", 449.95], // 추정
  ["au-partybox120", "JBL 파티박스 클럽 120", "JBL PartyBox Club 120", "JBL PartyBox Club 120", 449.95],
  ["au-authentics300", "JBL 어센틱 300", "JBL Authentics 300", "JBL Authentics 300", 449.95],
  ["au-qc-ultra2", "보스 콰이어트컴포트 울트라 헤드폰 2세대", "Bose QuietComfort Ultra Headphones 2nd Gen", "Bose QuietComfort Ultra 第二代头戴式耳机", 449],
  ["au-stanmore3", "마샬 스탠모어 III", "Marshall Stanmore III", "Marshall Stanmore III", 399.99],
  ["au-soundlink-max", "보스 사운드링크 맥스", "Bose SoundLink Max", "Bose SoundLink Max", 399],
  ["au-atlp120xusb", "오디오테크니카 AT-LP120XUSB 턴테이블", "Audio-Technica AT-LP120XUSB Turntable", "铁三角 AT-LP120XUSB 黑胶唱机", 399], // 추정
  ["au-shure-sm7b", "슈어 SM7B 마이크", "Shure SM7B Microphone", "舒尔 SM7B 麦克风", 399],
  ["au-xtreme4", "JBL 익스트림 4", "JBL Xtreme 4", "JBL Xtreme 4", 379.95],
  ["au-wiim-amp-pro", "윔 앰프 프로", "WiiM Amp Pro", "WiiM Amp Pro", 379],
  ["au-momentum4", "젠하이저 모멘텀 4 와이어리스", "Sennheiser MOMENTUM 4 Wireless", "森海塞尔 MOMENTUM 4 Wireless", 349.95],
  ["au-yamaha-as301", "야마하 A-S301 인티앰프", "Yamaha A-S301 Integrated Amplifier", "雅马哈 A-S301 合并式放大器", 349.95],
  ["au-wf1000xm6", "소니 WF-1000XM6", "Sony WF-1000XM6", "索尼 WF-1000XM6", 329.99], // 추정
  ["au-acton3", "마샬 액톤 III", "Marshall Acton III", "Marshall Acton III", 299.99],
  ["au-qc-earbuds2", "보스 콰이어트컴포트 울트라 이어버드 2세대", "Bose QuietComfort Ultra Earbuds 2nd Gen", "Bose QuietComfort Ultra 第二代耳塞", 299],
  ["au-shure-mv7plus", "슈어 MV7 플러스 마이크", "Shure MV7+ Microphone", "舒尔 MV7+ 麦克风", 279],
  ["au-atlp70xbt", "오디오테크니카 AT-LP70XBT 턴테이블", "Audio-Technica AT-LP70XBT Turntable", "铁三角 AT-LP70XBT 黑胶唱机", 249],
  ["au-zen-dac3", "아이파이 젠 DAC 3", "iFi ZEN DAC 3", "iFi ZEN DAC 3", 229],
  ["au-era100", "소노스 에라 100", "Sonos Era 100", "Sonos Era 100", 219],
  ["au-ult-wear", "소니 얼트 웨어", "Sony ULT WEAR", "索尼 ULT WEAR", 199.99],
  ["au-fiio-k7", "피오 K7 DAC 헤드폰 앰프", "FiiO K7 DAC Headphone Amplifier", "飞傲 K7 DAC 耳机放大器", 199.99],
  ["au-charge6", "JBL 차지 6", "JBL Charge 6", "JBL Charge 6", 199.95],
  ["au-roam2", "소노스 롬 2", "Sonos Roam 2", "Sonos Roam 2", 179],
  ["au-emberton3", "마샬 엠버튼 III", "Marshall Emberton III", "Marshall Emberton III", 169.99],
  ["au-rode-ntusbplus", "로데 NT-USB 플러스 마이크", "RØDE NT-USB+ Microphone", "罗德 NT-USB+ 麦克风", 169],
  ["au-ie200", "젠하이저 IE 200", "Sennheiser IE 200", "森海塞尔 IE 200", 159.95], // 추정
  ["au-soundlink-flex2", "보스 사운드링크 플렉스 2세대", "Bose SoundLink Flex 2nd Gen", "Bose SoundLink Flex 第二代", 159],
  ["au-whch720n", "소니 WH-CH720N", "Sony WH-CH720N", "索尼 WH-CH720N", 149.99],
  ["au-flip7", "JBL 플립 7", "JBL Flip 7", "JBL Flip 7", 149.95],
  // 18 USDT 이상, 60 USDT 미만
  ["au-koss-portapro", "코스 포타 프로 유선 헤드폰", "Koss Porta Pro Wired Headphones", "高斯 Porta Pro 有线耳机", 49.99],
  ["au-jbl-go4", "JBL 고 4", "JBL Go 4", "JBL Go 4", 49.95],
  ["au-soundcore-p20i", "사운드코어 P20i 무선 이어폰", "soundcore P20i Wireless Earbuds", "声阔 P20i 无线耳塞", 39.99],
  ["au-behringer-ha400", "베링거 마이크로앰프 HA400", "Behringer MICROAMP HA400", "百灵达 MICROAMP HA400", 29.99],
  ["au-mdrzx110", "소니 MDR-ZX110 헤드폰", "Sony MDR-ZX110 Headphones", "索尼 MDR-ZX110 头戴式耳机", 19.99],
  ["au-hifi-headphone-stand", "유그린 알루미늄 헤드폰 거치대", "UGREEN Aluminum Headphone Stand", "绿联铝合金耳机支架", 19.99],
  ["au-hth100", "호사 HTH-100 헤드폰 걸이", "Hosa HTH-100 Headphone Hanger", "Hosa HTH-100 耳机挂架", 18.95],
  // 6 USDT 이상, 18 USDT 미만
  ["au-record-brush", "오디오테크니카 AT6011a 레코드 청소 브러시", "Audio-Technica AT6011a Record Cleaning Brush", "铁三角 AT6011a 唱片清洁刷", 14.99],
  ["au-xlr-cable", "호사 HMIC-005 XLR 마이크 케이블", "Hosa HMIC-005 XLR Microphone Cable", "Hosa HMIC-005 XLR 麦克风线", 14.95],
  ["au-rphje120", "파나소닉 RP-HJE120 유선 이어폰", "Panasonic RP-HJE120 Wired Earphones", "松下 RP-HJE120 有线耳塞", 9.99],
  ["au-aux-cable", "유그린 3.5mm 오디오 케이블 1m", "UGREEN 3.5mm Audio Cable 1m", "绿联 3.5mm 音频线 1m", 7.99],
  // 3 USDT 이상, 6 USDT 미만
  ["au-jack-adapter", "호사 GHP-105 3.5mm 6.35mm 변환 어댑터", "Hosa GHP-105 3.5mm to 6.35mm Adapter", "Hosa GHP-105 3.5mm 转 6.35mm 转接头", 4.95],
];
