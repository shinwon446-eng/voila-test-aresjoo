import type { ItemSpec } from "@/lib/catalogTypes";

/**
 * 1달러 갤럭시 박스 (1 USDT). 가격 근거: 삼성 미국 공식 판매가와 공시가(https://www.samsung.com/us/ , https://news.samsung.com/us/galaxy-book6-series-now-available/) 및 충전 용품 제조사 판매가를 참고한 2026년 미국 신품 세전 어림값(1 USDT = 1 USD).
 * 구간은 박스 가격의 20배 이상, 6배 이상 20배 미만, 2배 이상 6배 미만, 1배 이상 2배 미만이며 불확실성이 큰 가격은 상품 행 끝에 표시한다.
 */
export const DOLLAR_GALAXY_ITEMS: ItemSpec[] = [
  // 20 USDT 이상 (위 구간)
  ["gx-book6-ultra", "삼성 갤럭시 북6 울트라 기본형", "Samsung Galaxy Book6 Ultra Base Configuration", "三星 Galaxy Book6 Ultra 基础配置", 2449.99],
  ["gx-fold7-512", "삼성 갤럭시 Z 폴드7 512GB", "Samsung Galaxy Z Fold7 512GB", "三星 Galaxy Z Fold7 512GB", 2119.99],
  ["gx-fold7-256", "삼성 갤럭시 Z 폴드7 256GB", "Samsung Galaxy Z Fold7 256GB", "三星 Galaxy Z Fold7 256GB", 1999.99],
  ["gx-s26-ultra-512", "삼성 갤럭시 S26 울트라 512GB", "Samsung Galaxy S26 Ultra 512GB", "三星 Galaxy S26 Ultra 512GB", 1599.99], // 추정
  ["gx-book6-pro", "삼성 갤럭시 북6 프로 14인치 기본형", "Samsung Galaxy Book6 Pro 14-inch Base Configuration", "三星 Galaxy Book6 Pro 14英寸基础配置", 1599.99],
  ["gx-s26-ultra-256", "삼성 갤럭시 S26 울트라 256GB", "Samsung Galaxy S26 Ultra 256GB", "三星 Galaxy S26 Ultra 256GB", 1399.99], // 추정
  ["gx-odyssey-g8", "삼성 오디세이 OLED G8 G81SF 32인치", "Samsung Odyssey OLED G8 G81SF 32-inch", "三星 Odyssey OLED G8 G81SF 32英寸", 1299.99], // 추정
  ["gx-s26-plus", "삼성 갤럭시 S26 플러스 256GB", "Samsung Galaxy S26+ 256GB", "三星 Galaxy S26+ 256GB", 1199.99], // 추정
  ["gx-tab-s11-ultra", "삼성 갤럭시 탭 S11 울트라 256GB 와이파이", "Samsung Galaxy Tab S11 Ultra 256GB Wi-Fi", "三星 Galaxy Tab S11 Ultra 256GB Wi-Fi", 1199.99],
  ["gx-book5-360", "삼성 갤럭시 북5 360 15.6인치 512GB", "Samsung Galaxy Book5 360 15.6-inch 512GB", "三星 Galaxy Book5 360 15.6英寸 512GB", 1199.99], // 추정
  ["gx-flip7", "삼성 갤럭시 Z 플립7 256GB", "Samsung Galaxy Z Flip7 256GB", "三星 Galaxy Z Flip7 256GB", 1099.99],
  ["gx-s26", "삼성 갤럭시 S26 256GB", "Samsung Galaxy S26 256GB", "三星 Galaxy S26 256GB", 999.99], // 추정
  ["gx-odyssey-g6", "삼성 오디세이 OLED G6 G60SF 27인치", "Samsung Odyssey OLED G6 G60SF 27-inch", "三星 Odyssey OLED G6 G60SF 27英寸", 999.99], // 추정
  ["gx-flip7-fe", "삼성 갤럭시 Z 플립7 FE 128GB", "Samsung Galaxy Z Flip7 FE 128GB", "三星 Galaxy Z Flip7 FE 128GB", 899.99],
  ["gx-tab-s11", "삼성 갤럭시 탭 S11 128GB 와이파이", "Samsung Galaxy Tab S11 128GB Wi-Fi", "三星 Galaxy Tab S11 128GB Wi-Fi", 799.99],
  ["gx-watch-ultra2", "삼성 갤럭시 워치 울트라2 47mm LTE", "Samsung Galaxy Watch Ultra2 47mm LTE", "三星 Galaxy Watch Ultra2 47mm LTE", 699.99],
  ["gx-s25-fe", "삼성 갤럭시 S25 FE 128GB", "Samsung Galaxy S25 FE 128GB", "三星 Galaxy S25 FE 128GB", 649.99],
  ["gx-tab-s10-fe-plus", "삼성 갤럭시 탭 S10 FE 플러스 128GB 와이파이", "Samsung Galaxy Tab S10 FE+ 128GB Wi-Fi", "三星 Galaxy Tab S10 FE+ 128GB Wi-Fi", 649.99],
  ["gx-tab-s10-fe", "삼성 갤럭시 탭 S10 FE 128GB 와이파이", "Samsung Galaxy Tab S10 FE 128GB Wi-Fi", "三星 Galaxy Tab S10 FE 128GB Wi-Fi", 499.99],
  ["gx-watch8-classic", "삼성 갤럭시 워치8 클래식 46mm 블루투스", "Samsung Galaxy Watch8 Classic 46mm Bluetooth", "三星 Galaxy Watch8 Classic 46mm 蓝牙版", 499.99],
  ["gx-viewfinity-s8", "삼성 뷰피니티 S8 S80UD 27인치", "Samsung ViewFinity S8 S80UD 27-inch", "三星 ViewFinity S8 S80UD 27英寸", 449.99], // 추정
  ["gx-watch9-44", "삼성 갤럭시 워치9 44mm 블루투스", "Samsung Galaxy Watch9 44mm Bluetooth", "三星 Galaxy Watch9 44mm 蓝牙版", 409.99],
  ["gx-a36", "삼성 갤럭시 A36 5G 128GB", "Samsung Galaxy A36 5G 128GB", "三星 Galaxy A36 5G 128GB", 399.99],
  ["gx-smart-m7", "삼성 스마트 모니터 M7 M70F 32인치", "Samsung Smart Monitor M7 M70F 32-inch", "三星智能显示器 M7 M70F 32英寸", 399.99], // 추정
  ["gx-watch9-40", "삼성 갤럭시 워치9 40mm 블루투스", "Samsung Galaxy Watch9 40mm Bluetooth", "三星 Galaxy Watch9 40mm 蓝牙版", 379.99],
  ["gx-tab-s10-lite", "삼성 갤럭시 탭 S10 라이트 128GB 와이파이", "Samsung Galaxy Tab S10 Lite 128GB Wi-Fi", "三星 Galaxy Tab S10 Lite 128GB Wi-Fi", 349.99],
  ["gx-9100-pro", "삼성 9100 프로 SSD 2TB", "Samsung 9100 PRO SSD 2TB", "三星 9100 PRO 固态硬盘 2TB", 299.99], // 추정
  ["gx-buds4-pro", "삼성 갤럭시 버즈4 프로", "Samsung Galaxy Buds4 Pro", "三星 Galaxy Buds4 Pro", 249.99],
  ["gx-990-pro-2tb", "삼성 990 프로 SSD 2TB", "Samsung 990 PRO SSD 2TB", "三星 990 PRO 固态硬盘 2TB", 249.99], // 추정
  ["gx-t9-2tb", "삼성 포터블 SSD T9 2TB", "Samsung Portable SSD T9 2TB", "三星移动固态硬盘 T9 2TB", 249.99], // 추정
  ["gx-buds4", "삼성 갤럭시 버즈4", "Samsung Galaxy Buds4", "三星 Galaxy Buds4", 179.99],
  ["gx-990-pro-1tb", "삼성 990 프로 SSD 1TB", "Samsung 990 PRO SSD 1TB", "三星 990 PRO 固态硬盘 1TB", 159.99], // 추정
  ["gx-buds3-fe", "삼성 갤럭시 버즈3 FE", "Samsung Galaxy Buds3 FE", "三星 Galaxy Buds3 FE", 149.99],
  ["gx-t9-1tb", "삼성 포터블 SSD T9 1TB", "Samsung Portable SSD T9 1TB", "三星移动固态硬盘 T9 1TB", 149.99], // 추정
  ["gx-t7-shield", "삼성 포터블 SSD T7 실드 1TB", "Samsung Portable SSD T7 Shield 1TB", "三星移动固态硬盘 T7 Shield 1TB", 129.99], // 추정
  ["gx-wireless-duo", "삼성 15W 무선 충전 듀오", "Samsung 15W Wireless Charger Duo", "三星 15W 双设备无线充电器", 89.99],
  ["gx-charger-trio", "삼성 65W 트리오 전원 어댑터", "Samsung 65W Power Adapter Trio", "三星 65W 三口电源适配器", 59.99],
  ["gx-battery-20k", "삼성 45W 배터리 팩 20000mAh", "Samsung 45W Battery Pack 20000mAh", "三星 45W 移动电源 20000mAh", 59.99],
  ["gx-battery-wireless", "삼성 25W 무선 배터리 팩 10000mAh", "Samsung 25W Wireless Battery Pack 10000mAh", "三星 25W 无线移动电源 10000mAh", 59.99],
  ["usdt-50", "인스턴트 드롭", "Instant Drop", "即时到账", 50, "cash"],
  ["gx-charger-45w", "삼성 45W 전원 어댑터", "Samsung 45W Power Adapter", "三星 45W 电源适配器", 49.99],
  ["gx-watch-charger", "삼성 갤럭시 워치 급속 충전기 USB-C", "Samsung Galaxy Watch Fast Wireless Charger USB-C", "三星 Galaxy Watch USB-C 快速无线充电器", 39.99],
  ["gx-pro-plus-256", "삼성 프로 플러스 마이크로SD 256GB", "Samsung PRO Plus microSD 256GB", "三星 PRO Plus microSD 存储卡 256GB", 34.99], // 추정
  ["gx-bar-plus-256", "삼성 바 플러스 USB 메모리 256GB", "Samsung BAR Plus USB Flash Drive 256GB", "三星 BAR Plus U盘 256GB", 29.99], // 추정
  ["gx-charger-25w", "삼성 25W 전원 어댑터", "Samsung 25W Power Adapter", "三星 25W 电源适配器", 24.99],
  // 6 USDT 이상, 20 USDT 미만
  ["gx-cable-5a", "삼성 USB-C 5A 충전 케이블 1.8m", "Samsung USB-C 5A Cable 1.8m", "三星 USB-C 5A 充电线 1.8m", 19.99],
  ["gx-cable-3a", "삼성 USB-C 3A 충전 케이블 1m", "Samsung USB-C 3A Cable 1m", "三星 USB-C 3A 充电线 1m", 14.99],
  ["gx-fit-plus-64", "삼성 핏 플러스 USB 메모리 64GB", "Samsung FIT Plus USB Flash Drive 64GB", "三星 FIT Plus U盘 64GB", 14.99], // 추정
  ["gx-evo-plus-64", "삼성 에보 플러스 마이크로SD 64GB", "Samsung EVO Plus microSD 64GB", "三星 EVO Plus microSD 存储卡 64GB", 12.99], // 추정
  ["gx-anker-cable", "앤커 USB-C 충전 케이블 1.8m", "Anker USB-C Charging Cable 6ft", "安克 USB-C 充电线 1.8m", 9.99],
  ["gx-ugreen-adapter", "유그린 USB-C USB-A 변환 어댑터", "UGREEN USB-C to USB-A Adapter", "绿联 USB-C 转 USB-A 转接头", 7.99],
  // 2 USDT 이상, 6 USDT 미만
  ["gx-phone-stand", "갤럭시용 접이식 휴대폰 거치대", "Foldable Phone Stand for Galaxy", "Galaxy 折叠手机支架", 5.99], // 추정
  ["gx-cable-clips", "충전 케이블 정리 클립 6개", "Charging Cable Clips 6-Pack", "充电线理线夹 6个装", 4.99], // 추정
  ["gx-usb-c-cap", "갤럭시용 USB-C 포트 먼지 마개 4개", "USB-C Dust Plugs for Galaxy 4-Pack", "Galaxy USB-C 防尘塞 4个装", 2.99], // 추정
  // 1 USDT 이상, 2 USDT 미만
  ["gx-cable-tie", "충전 케이블용 재사용 타이", "Reusable Charging Cable Tie", "可重复使用充电线绑带", 1.99], // 추정
];
