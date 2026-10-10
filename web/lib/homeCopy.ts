/**
 * 메인 페이지 문구. 2026-10-10 시안부터 담담하고 짧은 합니다체로 쓴다.
 * 제목과 라벨은 명사형, 설명은 한 줄, 단추는 행동 이름. 묻거나 재촉하는 문장은 쓰지 않는다.
 */
export const homeCopy = {
  ko: {
    shop: { tabAll: "전체 박스", listAll: "전체 박스", tabs: "분류", bannerLabel: "대표 박스", bannerCta: "구성품과 확률 보기", etc: "구성품 예시: {names} 등", perOpen: "/ 1회", multipleLabel: "최고 상품가", multipleValue: "박스 가격의 {n}배", staged: "사진은 연출 이미지라 실제 구성품과 다를 수 있어요.", trustLabel: "이용 안내", trust: [["구성품과 확률 공개", "열기 전에 확인해요"], ["실물 배송", "받은 상품을 실물로 배송받아요"], ["환급액 전환", "표시된 환급액으로 전환해요"]], linksLabel: "더 알아보기", guide: "이용 방법", verify: "개봉 결과 검증" },
    nfx: { all: "전체 박스", view: "박스 보기", rowPopular: "지금 인기 있는 박스", rank: "인기 {n}위", rankLabel: "인기", items: "구성품 {n}종", perOpen: "1회 {price}", infoTitle: "이용 안내", guide: "이용 방법", verify: "개봉 결과 검증", chips: "분류", clear: "분류 해제", prev: "이전", next: "다음", tabbar: "주요 메뉴", tabHome: "홈", tabInventory: "보관함", tabProfile: "내 정보", info: [["구성품과 확률", "박스마다 확률을 모두 공개합니다."], ["배송 신청", "보관함에서 배송을 신청하세요."], ["환급액 전환", "환급액을 확인하고 잔액으로 전환하세요."]] },
    heroTitle: "취향에 맞는 박스를 찾습니다",
    heroBody: "구성품과 확률을 확인하고 박스를 고릅니다.",
    assuranceTitle: "박스를 열기 전에",
    reviewTitle: "상품 후기",
    reviewBody: "상품별 후기를 살펴봅니다.",
    guideTitle: "이용 방법",
    guideMore: "이용 방법 보기",
    steps: [
      ["박스를 고릅니다", "가격과 구성품, 상품별 확률을 확인합니다."],
      ["박스를 엽니다", "총액 확인 후 열면 보관함에 기록됩니다."],
      ["상품 수령 방법을 정합니다", "배송이나 환급액 전환을 선택합니다."],
    ],
    proofTitle: "개봉 결과 검증",
    proofBody: "개봉 기록으로 결과를 검증합니다.",
    verify: "개봉 결과 검증하기",
  },
  en: {
    shop: { tabAll: "All boxes", listAll: "All boxes", tabs: "Categories", bannerLabel: "Featured box", bannerCta: "View contents and odds", etc: "Inside, for example: {names}", perOpen: "/ open", multipleLabel: "Top item", multipleValue: "{n}x the box price", staged: "Photos are staged and may differ from the actual items.", trustLabel: "How VOILA works", trust: [["Contents and odds published", "Check before you open"], ["Physical delivery", "Get your item shipped to you"], ["Cashback conversion", "Convert to the listed cashback amount"]], linksLabel: "Learn more", guide: "How it works", verify: "Verify opening results" },
    nfx: { all: "All boxes", view: "View box", rowPopular: "Popular right now", rank: "No. {n} in popularity", rankLabel: "TOP", items: "{n} items", perOpen: "{price} per open", infoTitle: "How VOILA works", guide: "How it works", verify: "Verify opening results", chips: "Categories", clear: "Clear category", prev: "Previous", next: "Next", tabbar: "Main menu", tabHome: "Home", tabInventory: "Inventory", tabProfile: "My VOILA", info: [["Contents and odds", "Odds are published for every item."], ["Delivery", "Request delivery from your inventory."], ["Cashback", "Convert the listed cashback to your balance."]] },
    heroTitle: "Find a box that fits your taste",
    heroBody: "Check the contents and odds, then choose a box.",
    assuranceTitle: "Before you open a box",
    reviewTitle: "Product reviews",
    reviewBody: "Browse reviews by product.",
    guideTitle: "How it works",
    guideMore: "How it works",
    steps: [
      ["Choose a box", "Check the price, contents, and item-by-item odds."],
      ["Open the box", "Confirm the total, open, and find it in your inventory."],
      ["Decide how to receive it", "Choose delivery or cashback conversion."],
    ],
    proofTitle: "Verify opening results",
    proofBody: "Verify results with the opening record.",
    verify: "Verify opening results",
  },
  zh: {
    shop: { tabAll: "全部盲盒", listAll: "全部盲盒", tabs: "分类", bannerLabel: "代表盲盒", bannerCta: "查看内容与概率", etc: "内容示例：{names} 等", perOpen: "/ 次", multipleLabel: "最高商品", multipleValue: "盲盒价格的 {n}倍", staged: "图片为展示用途，可能与实际内容不同。", trustLabel: "使用说明", trust: [["公开内容与概率", "打开前先确认"], ["实物配送", "把获得的商品配送到家"], ["返现转换", "按标示的返现金额转换"]], linksLabel: "了解更多", guide: "使用方法", verify: "验证开箱结果" },
    nfx: { all: "全部盲盒", view: "查看盲盒", rowPopular: "现在人气盲盒", rank: "人气第 {n} 名", rankLabel: "人气", items: "{n} 种内容", perOpen: "每次 {price}", infoTitle: "使用说明", guide: "使用方法", verify: "验证开箱结果", chips: "分类", clear: "取消分类", prev: "上一页", next: "下一页", tabbar: "主菜单", tabHome: "首页", tabInventory: "保管箱", tabProfile: "我的", info: [["内容与概率", "公开每件商品的概率。"], ["申请配送", "在保管箱中申请配送。"], ["返现转换", "确认返现金额后转为余额。"]] },
    heroTitle: "找到符合喜好的盲盒",
    heroBody: "确认内容和概率后再选择盲盒。",
    assuranceTitle: "打开盲盒之前",
    reviewTitle: "商品评价",
    reviewBody: "按商品查看评价。",
    guideTitle: "使用方法",
    guideMore: "查看使用方法",
    steps: [
      ["选择盲盒", "确认价格、内容和各商品的概率。"],
      ["打开盲盒", "确认总额后打开，结果记录在保管箱。"],
      ["决定领取方式", "选择配送或返现转换。"],
    ],
    proofTitle: "验证开箱结果",
    proofBody: "用开箱记录验证结果。",
    verify: "验证开箱结果",
  },
} as const;

export function copyFor(locale: string) {
  return homeCopy[locale === "en" || locale === "zh" ? locale : "ko"];
}
