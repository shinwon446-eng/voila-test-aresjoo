import type { ItemSpec } from "@/lib/catalogTypes";

/**
 * 사진 박스 (5 USDT). 가격 근거: 미국 제조사 공식 판매가(https://www.nikonusa.com/cameras/mirrorless-cameras , https://www.usa.canon.com/shop/cameras/mirrorless-cameras)와 B&H 신품 가격(https://www.bhphotovideo.com/), DJI 공식 스토어 가격(https://store.dji.com/)를 참고한 2026년 미국 신품 세전 어림값(1 USDT = 1 USD).
 * 구간은 박스 가격의 20배 이상, 6배 이상 20배 미만, 2배 이상 6배 미만, 1배 이상 2배 미만이며 불확실성이 큰 가격은 상품 행 끝에 표시한다.
 */
export const STARTER_CAMERA_ITEMS: ItemSpec[] = [
  // 100 USDT 이상 (위 구간)
  ["cm-leica-sl3", "라이카 SL3 바디", "Leica SL3 Body", "徕卡 SL3 机身", 7495], // 추정
  ["cm-leica-q3", "라이카 Q3", "Leica Q3", "徕卡 Q3", 6735], // 추정
  ["cm-sony-a1ii", "소니 알파 1 II 바디", "Sony Alpha 1 II Body", "索尼 Alpha 1 II 机身", 6499.99],
  ["cm-sony-a9iii", "소니 알파 9 III 바디", "Sony Alpha 9 III Body", "索尼 Alpha 9 III 机身", 6299.99], // 추정
  ["cm-nikon-z8", "니콘 Z8 바디", "Nikon Z8 Body", "尼康 Z8 机身", 4299.95],
  ["cm-canon-r5ii", "캐논 EOS R5 마크 II 바디", "Canon EOS R5 Mark II Body", "佳能 EOS R5 Mark II 机身", 4299], // 추정
  ["cm-sony-a7rv", "소니 알파 7R V 바디", "Sony Alpha 7R V Body", "索尼 Alpha 7R V 机身", 3899.99],
  ["cm-canon-rf100500", "캐논 RF100-500mm F4.5-7.1 L IS USM 렌즈", "Canon RF100-500mm F4.5-7.1 L IS USM Lens", "佳能 RF100-500mm F4.5-7.1 L IS USM 镜头", 3099], // 추정
  ["cm-sony-70200gm2", "소니 FE 70-200mm F2.8 GM OSS II 렌즈", "Sony FE 70-200mm F2.8 GM OSS II Lens", "索尼 FE 70-200mm F2.8 GM OSS II 镜头", 2799.99],
  ["cm-canon-r6iii", "캐논 EOS R6 마크 III 바디", "Canon EOS R6 Mark III Body", "佳能 EOS R6 Mark III 机身", 2799], // 추정
  ["cm-nikon-z6iii", "니콘 Z6III 바디", "Nikon Z6III Body", "尼康 Z6III 机身", 2699.95],
  ["cm-nikon-z2470ii", "니콘 니코르 Z 24-70mm f/2.8 S II 렌즈", "Nikon NIKKOR Z 24-70mm f/2.8 S II Lens", "尼康尼克尔 Z 24-70mm f/2.8 S II 镜头", 2799.95],
  ["cm-canon-rf2470", "캐논 RF24-70mm F2.8 L IS USM 렌즈", "Canon RF24-70mm F2.8 L IS USM Lens", "佳能 RF24-70mm F2.8 L IS USM 镜头", 2399],
  ["cm-sony-2470gm2", "소니 FE 24-70mm F2.8 GM II 렌즈", "Sony FE 24-70mm F2.8 GM II Lens", "索尼 FE 24-70mm F2.8 GM II 镜头", 2299.99],
  ["cm-sony-a7cii", "소니 알파 7C II 바디", "Sony Alpha 7C II Body", "索尼 Alpha 7C II 机身", 2199.99],
  ["cm-nikon-zf", "니콘 Zf 바디", "Nikon Zf Body", "尼康 Zf 机身", 2199.95], // 추정
  ["cm-fuji-xt5", "후지필름 X-T5 바디", "FUJIFILM X-T5 Body", "富士 X-T5 机身", 1999.95], // 추정
  ["cm-nikon-z180600", "니콘 니코르 Z 180-600mm f/5.6-6.3 VR 렌즈", "Nikon NIKKOR Z 180-600mm f/5.6-6.3 VR Lens", "尼康尼克尔 Z 180-600mm f/5.6-6.3 VR 镜头", 1899.95],
  ["cm-fuji-x100vi", "후지필름 X100VI", "FUJIFILM X100VI", "富士 X100VI", 1799.95], // 추정
  ["cm-sony-a6700", "소니 알파 6700 바디", "Sony Alpha 6700 Body", "索尼 Alpha 6700 机身", 1499.99], // 추정
  ["cm-sony-35gm", "소니 FE 35mm F1.4 GM 렌즈", "Sony FE 35mm F1.4 GM Lens", "索尼 FE 35mm F1.4 GM 镜头", 1399.99],
  ["cm-fuji-xs20", "후지필름 X-S20 바디", "FUJIFILM X-S20 Body", "富士 X-S20 机身", 1399.95], // 추정
  ["cm-tamron-70180g2", "탐론 70-180mm F/2.8 Di III VC VXD G2 소니 E 렌즈", "Tamron 70-180mm F/2.8 Di III VC VXD G2 Sony E Lens", "腾龙 70-180mm F/2.8 Di III VC VXD G2 索尼 E 卡口镜头", 1299],
  ["cm-dji-mini4pro", "DJI 미니 4 프로 RC 2 충전 허브 세트", "DJI Mini 4 Pro with RC 2 and Charging Hub", "大疆 Mini 4 Pro RC 2 充电管家套装", 1299], // 추정
  ["cm-fuji-xf1655ii", "후지필름 XF16-55mm F2.8 R LM WR II 렌즈", "FUJIFILM XF16-55mm F2.8 R LM WR II Lens", "富士 XF16-55mm F2.8 R LM WR II 镜头", 1199.95],
  ["cm-sigma-2470ii", "시그마 24-70mm F2.8 DG DN II 아트 소니 E 렌즈", "Sigma 24-70mm F2.8 DG DN II Art Sony E Lens", "适马 24-70mm F2.8 DG DN II Art 索尼 E 卡口镜头", 1199],
  ["cm-dji-air3s", "DJI 에어 3S RC-N3", "DJI Air 3S RC-N3", "大疆 Air 3S RC-N3", 1099], // 추정
  ["cm-nikon-z50ii", "니콘 Z50II 바디", "Nikon Z50II Body", "尼康 Z50II 机身", 1009.95],
  ["cm-canon-r50", "캐논 EOS R50 바디", "Canon EOS R50 Body", "佳能 EOS R50 机身", 679.99],
  ["cm-insta360-x5", "인스타360 X5", "Insta360 X5", "影石 Insta360 X5", 549.99],
  ["cm-dji-rs4", "DJI RS 4 짐벌", "DJI RS 4 Gimbal", "大疆 RS 4 稳定器", 549],
  ["cm-dji-pocket3", "DJI 오즈모 포켓 3", "DJI Osmo Pocket 3", "大疆 Osmo Pocket 3", 519], // 추정
  ["cm-gopro-hero13", "고프로 히어로13 블랙", "GoPro HERO13 Black", "GoPro HERO13 Black", 399.99],
  ["cm-peak-tripod", "피크디자인 트래블 삼각대 알루미늄", "Peak Design Travel Tripod Aluminum", "Peak Design 铝合金旅行三脚架", 399.95],
  ["cm-lowepro-protactic", "로우프로 프로택틱 BP 450 AW III 백팩", "Lowepro ProTactic BP 450 AW III Backpack", "乐摄宝 ProTactic BP 450 AW III 双肩包", 399.95],
  ["cm-dji-rs4mini", "DJI RS 4 미니 짐벌", "DJI RS 4 Mini Gimbal", "大疆 RS 4 Mini 稳定器", 369],
  ["cm-peak-backpack", "피크디자인 에브리데이 백팩 V2 20L", "Peak Design Everyday Backpack V2 20L", "Peak Design Everyday Backpack V2 20L", 279.95],
  ["cm-godox-v1s", "고독스 V1 소니용 플래시", "Godox V1 Flash for Sony", "神牛 V1 索尼版闪光灯", 259],
  ["cm-sony-50f18", "소니 FE 50mm F1.8 렌즈", "Sony FE 50mm F1.8 Lens", "索尼 FE 50mm F1.8 镜头", 249.99],
  ["cm-manfrotto-befree", "맨프로토 비프리 어드밴스드 알루미늄 삼각대", "Manfrotto Befree Advanced Aluminum Tripod", "曼富图 Befree Advanced 铝合金三脚架", 249.99],
  ["cm-canon-rf50", "캐논 RF50mm F1.8 STM 렌즈", "Canon RF50mm F1.8 STM Lens", "佳能 RF50mm F1.8 STM 镜头", 219.99],
  ["cm-lexar-cfexpress", "렉사 프로페셔널 CF익스프레스 타입 B 256GB", "Lexar Professional CFexpress Type B 256GB", "雷克沙 Professional CFexpress Type B 256GB", 149.99], // 추정
  // 30 USDT 이상, 100 USDT 미만
  ["cm-smallrig-led", "스몰리그 RM75 LED 조명", "SmallRig RM75 LED Light", "斯莫格 RM75 LED 摄影灯", 69.99],
  ["cm-sandisk-256", "샌디스크 익스트림 프로 SDXC 256GB UHS-I", "SanDisk Extreme PRO SDXC 256GB UHS-I", "闪迪 Extreme PRO SDXC 256GB UHS-I", 59.99], // 추정
  ["cm-joby-gorillapod", "조비 고릴라포드 1K 키트", "JOBY GorillaPod 1K Kit", "JOBY GorillaPod 1K 三脚架套装", 54.95],
  ["cm-peak-leash", "피크디자인 리시 카메라 스트랩", "Peak Design Leash Camera Strap", "Peak Design Leash 相机肩带", 44.95],
  ["cm-sandisk-128", "샌디스크 익스트림 프로 SDXC 128GB UHS-I", "SanDisk Extreme PRO SDXC 128GB UHS-I", "闪迪 Extreme PRO SDXC 128GB UHS-I", 34.99], // 추정
  ["cm-peak-cuff", "피크디자인 커프 손목 스트랩", "Peak Design Cuff Wrist Strap", "Peak Design Cuff 腕带", 34.95],
  ["cm-thinktank-pouch", "씽크탱크 메모리카드 케이스 픽셀 포켓 로켓", "Think Tank Photo Pixel Pocket Rocket", "Think Tank Photo Pixel Pocket Rocket 存储卡包", 34.75],
  // 10 USDT 이상, 30 USDT 미만
  ["cm-sandisk-reader", "샌디스크 이미지메이트 USB-C 카드 리더", "SanDisk ImageMate USB-C Card Reader", "闪迪 ImageMate USB-C 读卡器", 24.99],
  ["cm-giottos-rocket", "지오토 로켓 에어 블로어 대형", "Giottos Rocket Air Blower Large", "捷特 Rocket 大号气吹", 17.99],
  ["cm-tiffen-uv", "티펜 UV 보호 필터 58mm", "Tiffen UV Protector Filter 58mm", "天芬 UV 保护滤镜 58mm", 14.99],
  ["cm-lenspen", "렌즈펜 오리지널 NLP-1", "LensPen Original NLP-1", "LensPen Original NLP-1 镜头清洁笔", 12.99],
  // 5 USDT 이상, 10 USDT 미만
  ["cm-zeiss-wipes", "자이스 렌즈 와이프 50매", "ZEISS Lens Wipes 50-Pack", "蔡司镜头清洁湿巾 50片装", 5.99],
];
