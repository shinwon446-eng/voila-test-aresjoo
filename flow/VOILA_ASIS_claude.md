# VOILA 지금의 서비스 플로우 (as-is)

2026-10-12, 브랜치 `voila-redesign`, 커밋 `53dad6e` 기준. 코드를 읽어서 적었다. 개발 서버와 빌드는 돌리지 않았다. 돌린 것은 `npm test`(329건 가운데 328 통과, 1 건너뜀)와 `node scripts/design-lint/lint.mjs --scope new`(38개 파일, 위반 0건), 그리고 카탈로그를 읽기만 하는 집계 한 번이다.

경로는 저장소 루트 기준이다. `파일:줄` 은 이 커밋의 줄 번호다.

렌즈는 `flow/HYPEDROP_FLOW.md` 의 뼈대다: 자산 두 상자(현금 잔액, 보유 아이템), 고리 넷(충전, 개봉, 결과 처리, 다시 열거나 뺀다), 곁가지.

## 0. 한눈에

- 자산은 VOILA 도 두 상자다. **잔액**(지갑 저장소, USDT 입금분과 카드분 두 칸)과 **받은 상품**(보관함 저장소). 둘 다 브라우저 localStorage 에 있다. 서버 장부는 없다(`web/lib/opening.ts:30`, `web/lib/openingSettle.ts:14`).
- 홈에 나오는 박스는 320개, 전부 실물 전용(`scheme: physical`)이고 박스마다 상품 100개, 상품 32,000칸이 전부 `physical` 이다. 가격은 20달러에서 500달러. 옛 박스 14개는 홈과 검색에서 내려갔지만 주소는 열린다(집계 결과, `web/lib/products.ts:336-345`).
- 새 박스의 결과는 전부 상품이다. USDT 가 바로 나오는 결과와 터짐 게이지는 옛 박스에만 있다(`web/lib/products.ts:250-258`, `web/lib/opening.ts:79-84`).
- 받은 상품으로 할 수 있는 일은 셋이다. 배송 받기, USDT로 받기(참고가의 95%, 되돌릴 수 없음), 그대로 두기. 업그레이드와 100% 판매는 없다.
- 출금은 **잔액에서만** 한다. 상품을 골라 바로 빼는 길은 없다. 상품은 먼저 95%로 잔액이 된 뒤에 뺄 수 있다(`web/components/wallet/WithdrawScreen.tsx:39,73`).
- 배송은 결과 화면에서 USDT 와 나란히 고른다. 여러 개 결과의 상품 시트와 보관함의 상품 시트에서는 배송이 주 단추이고 USDT 는 밑줄 링크다. HypeDrop 과 방향이 반대다.
- 브라우저 모드(API 주소가 없는 빌드)에서는 배송 신청을 받는 코드가 없어 신청이 실패한다. 입금 주소도 환경 값이 없으면 받지 못한다. 이때 잔액은 가입 때 들어오는 시험용 10,000 USDT 다(아래 B-3, C-1, C-9).
- 누른 뒤 결과까지 0.84초, 다음 단추가 눌리기까지 1.19초다(짧게 보기는 0.45초와 0.80초). HypeDrop 은 7.5초였다.

## A. 화면과 주소

### A-1. 껍데기

| 부분 | 무엇이 있나 | 근거 |
|---|---|---|
| 머리줄 | 로고, PC 메뉴 여섯(박스, 보관함, 지갑, 개봉 결과 검증, 이용 방법, 계정), 로그인 뒤 "잔액 {amount}" 단추(누르면 `/wallet`), 로그인 전 "로그인" 단추, 메뉴 단추 | `web/components/shell/AppShell.tsx:22-29,43-53` |
| 머리줄 아래 한 줄 | 오프라인, 세션 끝남(로그인 링크 포함) | `web/components/shell/StateScreens.tsx:37-57` |
| 본문 | 결정 화면은 좁은 열, 박스 목록과 박스 화면은 넓은 격자 | `web/components/shell/AppShell.tsx:56` |
| 꼬리말 | 제품(박스, 보관함, 지갑, 후기, 나온 상품), 도움(이용 방법, 개봉 결과 검증), 약관, 설정(언어, 원화와 달러 전환) | `web/components/shell/AppFooter.tsx:41-64` |
| 전역으로 붙는 것 | 충전 시트, 토스트(AppShell 마다), 로그인 시트(레이아웃), 테스트 사이트 표식 | `web/components/shell/AppShell.tsx:62-63`, `web/app/[locale]/layout.tsx:76-77` |

머리줄에 충전 시트를 바로 여는 단추는 없다. 잔액 단추는 지갑 화면으로 간다.

### A-2. 주소

| 주소 | 화면 | 보여 주는 것 | 주 단추 | 가는 곳 | 근거 |
|---|---|---|---|---|---|
| `/` | 언어 고르기 | 저장된 언어나 브라우저 언어로 `/ko` `/en` `/zh` 로 보낸다 | 없음 | 로케일 홈 | `web/app/page.tsx:7-19` |
| `/{locale}` | 박스 목록 | 가입 혜택 배너, 상품 검색, 분류 알약(전체와 카테고리 16), 박스 카드 격자(24개씩) | 배너: "가입하고 무료 언박싱" 또는 "무료 언박싱" 또는 "박스 보기". 목록: "박스 더 보기"(조용한 단추) | 카드와 검색 행은 `/box/{slug}`, 배너는 가입 시트나 혜택 박스 | `web/app/[locale]/page.tsx:6-9`, `web/components/box/BoxList.tsx:79-110`, `web/components/home/HeroBanner.tsx:182-186` |
| `/{locale}/box/{slug}` | 박스 | 이름, "1회 {price}, 최고 상품가 {top}", 대표 상품 사진, 후기 줄, 사실 세 줄, 수량, 구성품(구간별), 확률 요약과 상품별 확률, 알아둘 것 | 상태에 따라 바뀐다(C-3, C-4) | 개봉 장면, 충전 시트, 로그인 시트 | `web/app/[locale]/box/[slug]/page.tsx:8-18`, `web/components/box/BoxScreen.tsx:160-306` |
| `/{locale}/inventory` | 보관함 | 상태 알약 셋(보관 중, 배송, 받은 것)과 상품 행(30개씩) | 빈 목록일 때 "박스 보기" | 상품 시트 | `web/components/inventory/InventoryScreen.tsx:88-153` |
| `/{locale}/wallet` | 지갑 | 출금할 수 있는 잔액, 카드 잔액(있을 때만), 내역 행 | "USDT 충전하기" | 충전 시트. 밑줄 링크 "출금"은 `/wallet/withdraw` | `web/components/wallet/WalletScreen.tsx:90-146` |
| `/{locale}/wallet/withdraw` | 출금 | 단계마다 한 화면(C-8) | 단계마다 다르다 | 끝나면 "지갑으로" | `web/components/wallet/WithdrawScreen.tsx:144-235` |
| `/{locale}/verify` | 개봉 결과 검증 | 내 개봉 기록 목록, 값을 직접 넣어 계산, 방식 설명 | "계산하기" | 기록 행은 검증 시트 | `web/components/verify/VerifyScreen.tsx:67-127` |
| `/{locale}/guide` | 이용 방법 | 카드 셋(고르기, 열기, 받기), 알아 둘 값(USDT로 받을 때 95%, 배송비, 가장 적은 충전 금액) | 없음(읽는 화면) | 밑줄 링크: 개봉 결과 검증(`/fairness` 로 걸려 있어 옮긴 화면을 한 번 거친다), 약관 | `web/app/[locale]/guide/page.tsx:12-25`, `web/components/shell/GuideFees.tsx:14-20` |
| `/{locale}/account` | 계정 | 지갑(잔액, 출금), 보관함(보관 중, 배송 중 개수), 보안(인증 앱, 이메일), 계정 관리(닉네임, 비밀번호, 탈퇴), 도움 | 로그인 전: "로그인" | 각 행이 화면이나 시트를 연다. 밑줄 링크 "로그아웃" | `web/components/account/AccountScreen.tsx:42-83` |
| `/{locale}/reviews` | 후기 모아보기 | 박스 알약, 평균과 분포, 후기 카드 격자 | 없음 | 카드는 후기 상세 시트. 밑줄 링크 "나온 상품" | `web/components/box/ReviewsScreen.tsx:31-44` |
| `/{locale}/wins` | 나온 상품 | 이 계정에서 낸 값의 2배 이상이 나온 상품 기록 | 없음 | 행의 "검증"은 값이 채워진 `/verify` | `web/components/box/WinsScreen.tsx:43-69` |
| `/{locale}/legal`, `/legal/{doc}` | 약관과 정책 | 문서 13개 목록과 본문 | 없음 | 문서 | `web/app/[locale]/legal/[doc]/page.tsx:8-18`, `web/lib/legal.ts:11` |
| `/{locale}/about`, `/fairness`, `/profile`, `/community`, `/community/board` | 옮긴 화면 | "이 주소의 화면은 새 화면으로 옮겼습니다." | 새 화면 이름 하나 | 차례로 `/guide`, `/verify`, `/account`, `/`, `/` | `web/components/shell/MovedScreen.tsx:9-16`, 각 `page.tsx:6-9` |
| `/{locale}/dev/gallery` | 부품 갤러리 | 개발 서버에서만 열린다 | | | `web/app/[locale]/dev/gallery/page.tsx:7-11` |
| 없는 주소, 오류 | 상태 화면 | 제목과 한 줄 | "박스 보기", "다시 불러오기" | 홈, 다시 그리기 | `web/components/shell/StateScreens.tsx:11-33`, `web/app/not-found.tsx:11-27` |

`fairness` 라는 주소는 자기 화면이 없다. 옮긴 화면일 뿐이고 검증은 `/verify` 하나다.

### A-3. 시트, 확인창, 겹침 화면

| 겹침 | 여는 곳 | 보여 주는 것 | 주 단추 | 근거 |
|---|---|---|---|---|
| 메뉴 시트 | 머리줄 메뉴 단추 | 메뉴 여섯 행 | 없음 | `web/components/shell/AppShell.tsx:57-61` |
| 로그인과 가입 시트 | 머리줄, 박스 화면, 배너, 각 화면의 로그인 줄 | 이메일, 비밀번호, 인증 코드 단계. 소셜 셋(Google, Apple, Microsoft) | "이메일로 계속" | `web/components/flow/LoginSheet.tsx:83-112` |
| USDT 충전 시트 | 박스 화면(잔액 부족), 지갑 | 네트워크 알약, QR, 주소, 상태 한 줄 | "주소 복사" 또는 "주소 다시 받기" | `web/components/flow/ChargeSheet.tsx:43-59` |
| 상품 시트(박스 화면) | 구성품 타일이나 행 | 사진, 참고가, 나올 확률, 받는 방법, USDT로 받으면 금액, 참고가 기준, 배송비, 배송 가능 나라, 다른 박스와 비교 | 없음 | `web/components/box/BoxScreen.tsx:267-301` |
| 큰 금액 확인창 | 열기 단추(50 USDT 이상이거나 10개 이상) | "{amount} 결제", "잔액에서 결제하고 바로 엽니다." | 열기 단추와 같은 글 | `web/components/box/BoxScreen.tsx:42-43,152,302` |
| 개봉 장면(한 개) | 구매 성공 | 화면 전체. 연출, 결과, 행동 | C-6 | `web/components/box/Opening.tsx:185-273` |
| 개봉 결과(여러 개) | 구매 성공 | 화면 전체. 연출, 요약, 결과 행 | C-6 | `web/components/box/Reveal.tsx:131-253` |
| 받는 방법 시트 | 한 개 결과의 "받는 방법 선택" | 배송 받기와 "{amount}로 받기" 두 칸 | 고른 것에 따라 "{amount}로 받기", "배송 정보 입력", "방법을 고르세요" | `web/components/box/Opening.tsx:257-269` |
| 개봉 설정 시트 | 개봉 장면 위쪽 단추 | 소리와 진동, 짧게 보기, 상품을 자동으로 USDT로 받기 | 없음(누르면 바뀐다). 자동 받기는 확인창을 거친다 | `web/components/box/Opening.tsx:278-301` |
| 결과 상품 시트(여러 개) | 결과 행 | 사진, 참고가, 나올 확률 | 실물은 "배송 받기", 그 밖은 "USDT로 받기 ({amount})" | `web/components/box/Reveal.tsx:124-129,239-248` |
| USDT로 받기 확인창 | 여러 개 결과, 보관함 | "{name} 대신 {amount} 받고, 되돌릴 수 없습니다." | "USDT로 받기 ({amount})" | `web/components/box/Reveal.tsx:251`, `web/components/inventory/InventoryScreen.tsx:150` |
| 배송 받기 시트 | 결과 화면 둘, 보관함 | 나라, 받는 사람, 휴대폰, 우편번호, 주소, 통관 번호(한국, 중국), 보낼 상품 수, 배송비 | "배송 신청" → 확인창 | `web/components/flow/ShipSheet.tsx:62-79` |
| 그 자리 검증 시트 | 결과 화면 둘, 보관함, 검증 화면 | 미리 잠근 값, 공개된 값, 내 기기 값, 회차, 계산한 번호, 번호가 가리키는 상품, 판정 한 줄 | 없음. 밑줄 링크 "값을 직접 넣어 검증" | `web/components/flow/VerifySheet.tsx:46-64` |
| 보관함 상품 시트 | 보관함 행 | 상태, 참고가, 받은 날, 받은 금액, 배송 신청일, 택배사, 운송장 | 상태에 따라 "배송 받기", "USDT로 받기", "배송 신청 취소", "배송 조회" | `web/components/inventory/InventoryScreen.tsx:118-145` |
| 배송 신청 취소 확인창 | 보관함 상품 시트 | "상품이 보관함으로 돌아오고, 낸 배송비는 잔액으로 돌아옵니다." | "배송 신청 취소" | `web/components/inventory/InventoryScreen.tsx:151` |
| 후기 쓰기 시트 | 보관함 상품 시트 | 별점 알약, 글, 사진 | "후기 올리기" | `web/components/flow/ReviewSheet.tsx:55-71` |
| 후기 상세 시트 | 후기 카드 | 별점, 글쓴이, 시각, 글, 사진, 상품과 박스 | 없음 | `web/components/box/BoxReviews.tsx:146-173` |
| 거래 시트 | 지갑 내역 행 | 금액, 상태, 네트워크, 수수료, 받는 금액, 주소 | 72시간 대기 건만 "출금 취소" → 확인창 | `web/components/wallet/WalletScreen.tsx:124-145` |
| 인증 앱 연결 시트 | 출금 화면, 계정 | 인증 앱 등록 | 연결 | `web/components/wallet/WithdrawScreen.tsx:160-162`, `web/components/account/AccountScreen.tsx:75-77` |
| 닉네임, 비밀번호, 탈퇴 시트와 로그아웃 확인창 | 계정 | 각 입력 | "저장하기", "비밀번호 바꾸기", "탈퇴하기", "로그아웃" | `web/components/account/AccountSheets.tsx:15,47,80`, `web/components/account/AccountScreen.tsx:81` |
| 토스트 | 주소 복사 | 한 줄, 2.4초 | | `web/components/ui/toast.tsx:17-25`, `web/components/flow/ChargeSheet.tsx:33` |

### A-4. 연결되지 않은 옛 화면(주소도 진입점도 없다)

`web/components/home/` 의 LiveTicker, HallOfFame, LiveCounters, ProofFeed, DailyFreeBox, NetflixHome, CommerceHome, `web/components/unboxing/` 전부(UnboxingRoulette, BulkOpenModal, AutoplaySettingsModal, UpgradeFX, MegaWinFX, VaultGateFX), `web/components/wallet/` 의 DepositModal, WithdrawTab, WithdrawalModal, UsdtDepositTab, HistoryTab, WithdrawSteps, `web/components/inventory/` 의 옛 창 넷, `web/components/box/DetailModal.tsx`, `web/components/about/` 전부. 가져다 쓰는 곳을 검색해 확인했다(새 화면에서 쓰는 것은 HeroBanner 하나다). 이 문서의 플로우에는 넣지 않았다.

## B. 자산 모델

### B-1. 어디에 저장되나

모든 키 앞에 이 테스트 사이트의 접두사 `voila-test-aresjoo:` 가 붙는다(`web/lib/labSite.ts:17-19`).

| 자산과 기록 | 저장소 파일 | 저장 키 | 근거 |
|---|---|---|---|
| 잔액, 거래 내역, 입금 정산 기록, 이용 누계, 터짐 게이지, 무료 개봉 횟수 | `web/stores/walletStore.ts` | 기본 `gachaflix.wallet`. 브라우저 계정 모드에서는 계정마다 `voila.browser-wallet.{계정 id 또는 guest}` 로 바뀐다 | `web/stores/walletStore.ts:255-257`, `web/lib/browserWallet.ts:5-15` |
| 받은 상품(보관함) | `web/stores/inventoryStore.ts` | 기본 `gachaflix.inventory`. 브라우저 계정 모드에서는 `voila.browser-inventory.{id}` | `web/stores/inventoryStore.ts:145-147`, `web/lib/browserWallet.ts:16-19` |
| 계정과 세션(브라우저 계정 모드) | `web/lib/browserAccount.ts` | `voila.browser-accounts.v1`, `voila.browser-session.v1`. 출금 신청 기록과 입금 영수증도 계정 기록 안에 있다 | `web/lib/browserAccount.ts:9-10,24-25` |
| 추첨 값(서버 값, 그 해시, 내 기기 값, 회차) | `web/stores/fairStore.ts` | `gachaflix.fair`. 계정별로 나뉘지 않고 브라우저에 하나다 | `web/stores/fairStore.ts:63-66` |
| 본 개봉 기록장 | `web/stores/openingJournal.ts` | `voila.opening-journal` | `web/stores/openingJournal.ts:37-38` |
| 개봉 설정(소리, 짧게 보기, 계정별 자동 받기, 계정별 지난번 받는 방법) | `web/stores/settingsStore.ts` | `gachaflix.settings` | `web/stores/settingsStore.ts:44-48` |
| 표시 통화 | `web/stores/currencyStore.ts` | `gachaflix.currency` | `web/stores/currencyStore.ts:43-46` |
| 내가 쓴 후기 | `web/stores/communityStore.ts` | `gachaflix.community` | `web/stores/communityStore.ts:57` |

잔액은 두 칸이다. `cryptoBalance`(USDT 입금분, 출금 가능)와 `cardBalance`(카드 결제분, 출금 불가). 화면의 잔액은 언제나 둘의 합이다(`web/stores/walletStore.ts:71-76,126`). 열 때는 USDT 입금분을 먼저 쓰고 모자란 만큼만 카드분을 쓴다(`web/lib/funding.ts:46-57`). 그 비율이 받은 상품에 적히고, USDT로 받을 때 그 비율대로 돌아간다(`web/stores/inventoryStore.ts:74-95`, `web/lib/funding.ts:63-81`). 새 화면에는 카드로 충전하는 진입점이 없어서 카드 칸은 실제로는 0 이다.

### B-2. 받은 상품의 상태

`OwnedStatus` 는 다섯이다(`web/stores/inventoryStore.ts:16`).

| 상태 | 화면의 말 | 들어오는 길 | 나가는 길 | 근거 |
|---|---|---|---|---|
| `IN_STORAGE` | 보관 중 | 개봉 직후(`add`), 배송 신청 취소 | USDT로 받기, 배송 신청 | `web/stores/inventoryStore.ts:65-73,122-134` |
| `SOLD` | USDT로 받음 | `sell`(상품은 95%, 옛 박스의 USDT 결과는 100%로 구매와 함께) | 없음(끝) | `web/stores/inventoryStore.ts:74-95`, `web/lib/opening.ts:98-104` |
| `SHIPPING_REQUESTED` | 배송 신청함 | 배송 신청 | 취소하면 보관 중, 운송장이 붙으면 배송 중 | `web/stores/inventoryStore.ts:96-121,135-142` |
| `SHIPPING` | 배송 중 | `markShipping`(서비스가 준 운송장) | 코드에 없음 | `web/stores/inventoryStore.ts:135-142`, `web/components/inventory/InventoryScreen.tsx:52-60` |
| `DELIVERED` | 배송 완료 | 이 상태로 바꾸는 함수가 클라이언트에 없다. 서비스가 돌려준 기록으로만 들어올 수 있다 | 없음 | `web/stores/inventoryStore.ts:43-54` |

보관함의 알약은 셋이다. 보관 중은 `IN_STORAGE`, 받은 것은 `SOLD`, 배송은 나머지 전부(배송 완료 포함)다(`web/lib/vault.ts:6-9`). 값은 받은 때의 USDT 값으로 고정된다(`web/stores/inventoryStore.ts:7,22`). 보관 기한으로 자동 판매하는 일은 없다(`sweepExpired` 는 빈 결과만 돌려준다, `web/stores/inventoryStore.ts:64`).

### B-3. 값을 옮기는 함수

| 일 | 함수 | 무엇이 움직이나 | 테스트 | 근거 |
|---|---|---|---|---|
| 가입 보너스(시험용) | `claimWelcome` | 로그인한 계정마다 한 번 `cryptoBalance` +10,000 USDT, 거래 `bonus`. 로그인하면 `AuthHost` 가 부른다 | `web/tests/inventory.test.ts:102` | `web/stores/walletStore.ts:16,246-252`, `web/components/auth/AuthHost.tsx:29-35` |
| 가입 혜택 무료 개봉 | `claimWelcomeBoxes`, `spendFreeOpens` | 혜택 박스(지금은 `pokemon-charizard`, 50달러)의 무료 횟수 +2. 계정마다 한 번 | `web/tests/freeOpens.test.ts:25-80` | `web/stores/walletStore.ts:19,147-152`, `web/lib/products.ts:362` |
| 충전(입금 반영) | `useUsdtDeposit` → `recordConfirmedUsdtDeposit` → `settleDeposit` | 확인된 영수증 하나에 한 번 `cryptoBalance` 증가, 거래 `deposit_usdt` | `web/tests/depositCredit.test.ts:6`, `web/tests/depositAddress.test.ts:59`, `web/tests/accountWallet.test.ts:28-55`, `web/tests/withdrawHold.test.ts:66-86` | `web/lib/useUsdtDeposit.ts:50-63`, `web/lib/depositCredit.ts:13-20`, `web/stores/walletStore.ts:171-191` |
| 열기(결제와 추첨) | `createOpeningPurchase` → `executeOpening` | 계정 잠금 안에서: 회차 뽑기와 번호 계산 → 잔액 차감(`debitSplit`) → 보관함에 기록(`add`) → 옛 박스의 USDT 결과는 그 자리에서 100% 적립 → 무료 횟수 차감 → 거래 `open`. 어느 단계든 실패하면 지갑과 보관함을 열기 전으로 되돌린다. 한 번에 1개에서 100개 | `web/tests/opening.test.ts:20-68`, `web/tests/openingFlow.test.ts:118-147`, `web/tests/walletSplit.test.ts:26`, `web/tests/burst.test.ts:67-109`, `web/tests/freeOpens.test.ts:36-80` | `web/lib/opening.ts:39-115`, `web/stores/walletStore.ts:233-239`, `web/lib/ledgerLock.ts:47-53` |
| USDT로 받기(95%) | `takeUsdt` → `inventory.sell(ids, REFUND_RATE)` → `creditSplit` | 보관 중인 상품만. 값 x 0.95 를 소수 둘째 자리로 맞춰 잔액에, 상품은 `SOLD`, 거래 `sellback`. 이미 받은 상품은 건너뛴다 | `web/tests/claim.test.ts:19`, `web/tests/inventory.test.ts:26`, `web/tests/walletSplit.test.ts:51,73`, `web/tests/funding.test.ts:32,38`, `web/tests/physical.test.ts:29` | `web/lib/types.ts:133`, `web/lib/products.ts:110`, `web/lib/claim.ts:18-26`, `web/stores/inventoryStore.ts:74-95` |
| 결과 자리의 USDT로 받기 | `settleTake` | `takeUsdt` 를 계정 잠금으로 감싸고 같은 상품의 겹친 요청을 하나로 묶는다. 결과는 settled, pending, failed | 이 함수만 겨냥한 단위 테스트는 찾지 못했다. 화면 검수 `opening-qa.mjs` 의 s4 가 본다 | `web/lib/openingSettle.ts:33-56`, `web/scripts/capture/opening-qa.mjs:175` |
| 자동으로 USDT로 받기 | `autoTakeApplies` → `take(true)` | 계정이 켠 경우에만, 한 개 열기에서만, 낸 값의 20배 미만 상품에만 결과가 보인 뒤 한 번 | `web/tests/openingFlow.test.ts:69` | `web/lib/openingFlow.ts:77-80`, `web/components/box/Opening.tsx:150-156` |
| 배송 신청 | `requestShipment` | 서비스에 `/shipping/request` 를 보내고, 돌아온 상품 상태와 지갑 값을 그대로 반영한다. 배송비는 `shippingFee`(지금은 무료 행사로 0) | 이 함수의 테스트는 찾지 못했다. 저장소의 `requestShipping` 은 테스트가 있지만 새 화면은 그것을 부르지 않는다 | `web/lib/claim.ts:32-46`, `web/lib/shipping.ts:11,19`, `web/tests/inventory.test.ts:42` |
| 배송 신청 취소 | `cancelShipment` → `cancelShipping` | 출고 전인 건만 보관 중으로 되돌리고 낸 배송비를 낸 출처대로 돌려준다, 거래 `shipping_refund` | `web/tests/claim.test.ts:35,44`, `web/tests/shipping-cancellation.test.ts:7-34` | `web/lib/claim.ts:52-73`, `web/stores/inventoryStore.ts:122-134` |
| 출금 신청 | `WithdrawScreen` 의 `commit` → `api.withdraw` → `debitCrypto` | 인증을 통과한 뒤에만 `cryptoBalance` 에서 신청액 전부를 뺀다. 거래 `withdraw` 에 수수료와 받는 금액을 적는다 | 계산은 `web/tests/withdrawal.test.ts:10-51`, 카드분 차단은 `web/tests/walletSplit.test.ts:39`. `commit` 자체의 테스트는 찾지 못했다 | `web/components/wallet/WithdrawScreen.tsx:88-109`, `web/lib/api.ts:49-53`, `web/stores/walletStore.ts:227-232` |
| 출금 취소와 실패 환불 | `api.cancelWithdrawal` → `syncWithdrawal` | 상태가 취소나 실패로 바뀌면 신청액을 `cryptoBalance` 로 되돌린다. 끝난 건은 다시 바뀌지 않는다 | `web/tests/accountWallet.test.ts:65`, `web/tests/withdrawHold.test.ts:92,109`(같은 일을 하는 `cancelHeldWithdrawal`) | `web/components/wallet/WalletScreen.tsx:78-88`, `web/stores/walletStore.ts:192-197` |
| 터짐 게이지(옛 박스만) | `potAfterOpen`, `burstPayout` | 열 때마다 박스 가격의 10%가 쌓이고 터짐이 나오면 전부 받는다 | `web/tests/burst.test.ts:14-124` | `web/lib/burst.ts:10-49`, `web/lib/opening.ts:79-89,105` |
| 이용 누계(롤오버) | `addTransaction` 이 `totalWagered` 를 쌓는다 | 계산 함수와 테스트는 있다. **새 출금 화면은 이 값을 검사하지 않는다**(쓰는 곳을 검색했지만 화면 코드에 없다) | `web/tests/rollover.test.ts:6-72`, `web/tests/walletSplit.test.ts:94-130` | `web/stores/walletStore.ts:161-167`, `web/lib/rollover.ts:16-66` |
| 후기 보너스 | 없음 | `REVIEW_BONUS_USDT = 10` 상수는 있지만 저장할 때 0 으로 적는다 | | `web/lib/community.ts:10`, `web/stores/communityStore.ts:36` |

돈 로직의 한계로 코드에 적힌 것: 보관함과 지갑은 저장 키가 둘이라 두 쓰기를 하나로 묶지 못한다(`web/lib/openingSettle.ts:14`). 보관함의 "USDT로 받기"는 `settleTake` 를 거치지 않고 `takeUsdt` 를 바로 부른다(`web/components/inventory/InventoryScreen.tsx:73`).

## C. 플로우 (갈림길마다 예와 아니오)

### C-1. 충전

| 갈림길 | 예 | 아니오 | 근거 |
|---|---|---|---|
| 충전 시트를 여는 곳인가 | 박스 화면에서 잔액이 모자랄 때의 주 단추, 지갑의 주 단추 | 머리줄의 잔액 단추는 지갑 화면으로 간다. 결과 화면에는 충전 단추가 없다 | `web/components/box/BoxScreen.tsx:195`, `web/components/wallet/WalletScreen.tsx:102`, `web/components/shell/AppShell.tsx:49` |
| 로그인했는가 | 네트워크 알약 셋(TRC-20 이 처음 골라져 있다, BEP-20, ERC-20) | "로그인하면 입금 주소가 표시됩니다."와 "로그인" 단추 | `web/components/flow/ChargeSheet.tsx:25,36-45`, `web/lib/depositAddress.ts:22-26` |
| 주소를 받았는가 | QR 과 주소, "입금을 기다리는 중입니다.", 주 단추 "주소 복사"(누르면 토스트 "주소를 복사했습니다") | 받는 중이면 "주소를 준비하는 중입니다.", 실패면 빨간 줄 "주소를 받지 못했습니다."와 주 단추 "주소 다시 받기" | `web/components/flow/ChargeSheet.tsx:47-56`, `web/lib/useUsdtDeposit.ts:28-41` |
| 입금이 잡혔는가 | "입금을 확인하는 중입니다. n / 12" | 5초마다 다시 확인한다 | `web/components/flow/ChargeSheet.tsx:54`, `web/lib/useUsdtDeposit.ts:16,59-67` |
| 12번 확인됐고 1 USDT 이상인가 | 영수증 하나에 한 번만 잔액에 넣고, 시트가 스스로 닫혀 하던 화면으로 돌아간다. 완료 토스트는 없다 | 계속 기다린다. 1 USDT 미만은 반영하지 않는다 | `web/lib/depositAddress.ts:28,47-53`, `web/lib/depositCredit.ts:13-20`, `web/components/flow/ChargeSheet.tsx:27` |

- 수단은 USDT 온체인 세 네트워크뿐이다. 금액을 고르는 칸, 카드, 기프트 카드, 프로모션 코드는 없다. 화면 아래 글: "1 USDT부터 보낼 수 있습니다. 12번 확인되면 잔액에 들어옵니다."(`web/components/flow/ChargeSheet.tsx:57`).
- 실패 상태는 "주소를 받지 못했습니다" 하나다. 입금이 실패했다는 화면은 없다(들어오지 않으면 기다리는 상태로 남는다).
- 주소는 배포 환경 값(`NEXT_PUBLIC_DEPOSIT_TRC20` 등)이 먼저이고 없으면 계정별 발급 주소다(`web/lib/depositAddress.ts:36-42`, `web/lib/runtime.ts:16-20`). 브라우저 계정 모드는 환경 값이 없으면 주소를 주지 않는다(`web/lib/browserAccount.ts:156-160`). 배포 작업은 `NEXT_PUBLIC_AUTH_API_BASE` 와 `NEXT_PUBLIC_API_BASE` 두 값만 넘긴다(`.github/workflows/deploy-pages.yml:36-39`). 그 값이 저장소 설정에 들어 있는지는 확인하지 못했다.
- 충전과 별개로, 로그인한 계정은 처음 한 번 10,000 USDT 를 받는다(B-3). 코드 주석은 "브라우저 로컬 데모 계정의 테스트용 첫 로그인 보너스"라고 적는다(`web/stores/walletStore.ts:15-16`).

### C-2. 박스 고르기

| 갈림길 | 예 | 아니오 | 근거 |
|---|---|---|---|
| 상품 이름으로 찾는가 | 세 언어의 상품 이름이나 박스 이름에 걸리는 상품 행(최대 30)이 뜨고 누르면 그 박스로 간다 | 분류 알약과 카드 격자를 본다 | `web/components/box/BoxList.tsx:64-77,86-99` |
| 전에 연 박스가 있는가 | 최근에 연 박스가 맨 앞에 온다 | "전체"는 카테고리를 돌아가며 한 박스씩, 24개씩 "박스 더 보기" | `web/components/box/BoxList.tsx:33-40,53-60,106` |
| 카드에 무엇이 있나 | 대표 실물 사진(없으면 그 이름), 박스 이름, 별점(후기가 있을 때만), 가격 | 최고 상품가, 배수, 확률, 배지, 남의 당첨 소식, 타이머는 카드에 없다 | `web/components/box/BoxList.tsx:116-131` |
| 박스 화면에서 확률을 보는가 | 화면 아래 "확률 요약"(최고 상품가, 가장 흔한 결과, 실물이 나올 확률, 가장 작은 결과, 낸 값보다 적게 받을 확률, 기대 가치 비율 둘), 구간별 확률, 접어 둔 상품별 확률. 상품 시트에도 그 상품의 확률 | 구성품 타일과 행에는 이름과 참고가만 있다(확률을 옆에 적지 않는다) | `web/components/box/BoxScreen.tsx:203-225,228-258` |

새 박스의 기대 가치 비율은 참고가 기준 99.0%, 전부 USDT로 받을 때 94.05%로 두 줄을 따로 적는다(`web/components/box/BoxScreen.tsx:238-240`, 집계 결과).

### C-3. 열기 전

| 갈림길 | 예 | 아니오 | 근거 |
|---|---|---|---|
| 로그인했는가 | 아래 갈림길로 | 주 단추 "로그인하고 언박싱", 아래 글 "{n}개, {amount}. 로그인한 뒤 USDT 잔액으로 결제합니다." | `web/components/box/BoxScreen.tsx:193` |
| 보지 못한 개봉 결과가 있는가(이 박스) | 한 줄 "보지 못한 개봉 결과가 있습니다."와 주 단추 "결과 보기". 새로 뽑지 않고 보관함 기록으로 다시 보여 준다 | 다른 박스에 있으면 그 박스로 가는 링크 한 줄 | `web/components/box/BoxScreen.tsx:104-126,187-188,194`, `web/stores/openingJournal.ts:50-60` |
| 수량을 고르는가 | 알약 1, 5, 10, 50, 100. 누르면 곧 선택 | 처음 값은 1 | `web/lib/autoplay.ts:13`, `web/components/box/BoxScreen.tsx:61,191` |
| 무료로 열 수 있는가 | 한 줄 "이 박스를 무료로 {n}번 열 수 있습니다." 무료 횟수를 먼저 쓰고 남는 개수만 값을 낸다. 전부 무료면 단추가 "무료 언박싱" | 값은 박스 가격 x 개수 | `web/components/box/BoxScreen.tsx:75-77,189,196`, `web/lib/opening.ts:47,70` |
| 잔액이 충분한가 | 주 단추 "{amount} 언박싱" 또는 "{n}개 언박싱 {amount}" | C-4 | `web/components/box/BoxScreen.tsx:78,196`, `web/messages/v.ko.json:56` |
| 큰 금액인가(값 50 USDT 이상이거나 10개 이상) | 확인창 "{amount} 결제", "잔액에서 결제하고 바로 엽니다.", 취소는 밑줄 링크 | 확인 없이 바로 구매한다 | `web/components/box/BoxScreen.tsx:42-43,152,302` |
| 구매가 됐는가 | 개봉 장면(1개는 Opening, 2개 이상은 Reveal) | 빨간 줄 "열지 못했습니다. 잔액은 그대로입니다." 차감과 배정은 통째로 되돌려져 있다 | `web/components/box/BoxScreen.tsx:128-146,186,303-304` |

- 돈 없이 같은 연출을 보여 주는 체험(데모)은 없다. 무료는 가입 혜택의 실제 개봉 두 번뿐이고 결과는 진짜로 보관함에 들어간다(`web/tests/freeOpens.test.ts:36`).
- 새 박스의 가격이 20달러에서 500달러라서 50달러 이상인 박스는 한 개만 열어도 확인창이 뜬다.
- 구매는 상태 기계가 READY 와 SETTLED 일 때만 시작한다. 연출 중에 다시 눌러도 구매가 나가지 않는다(`web/lib/openingFlow.ts:109-130`).

### C-4. 잔액이 모자랄 때

| 어디서 | 사용자가 보는 것 | 할 수 있는 일 | 근거 |
|---|---|---|---|
| 박스 화면의 열기 막대 | 한 줄 "잔액 {balance}. {missing} 더 필요합니다." | 주 단추가 "USDT 충전하기"로 바뀐다(충전 시트). 수량을 줄일 수 있다 | `web/components/box/BoxScreen.tsx:190,195` |
| 누르는 사이에 잔액이 줄었을 때 | 따로 뜨는 것 없음. 막대의 한 줄이 그 사실을 말한다 | 위와 같다 | `web/components/box/BoxScreen.tsx:142-143`, `web/lib/opening.ts:53,74` |
| 한 개 결과 화면 | 다시 열기 단추 자리에 "박스로 돌아가기"가 온다. 모자란다는 글은 없다 | 박스로 돌아가면 위의 막대가 보인다 | `web/components/box/Opening.tsx:240` |
| 여러 개 결과 화면 | 다시 열기 단추 자리에 "닫기" | 위와 같다 | `web/components/box/Reveal.tsx:119` |
| 배송 받기 시트(배송비가 있을 때) | 같은 한 줄 | 신청 단추가 넘어가지 않는다. 지금은 배송비가 0 이라 해당 없음 | `web/components/flow/ShipSheet.tsx:48,51,75` |

팝업은 없다. 주어지는 행동은 충전 하나다. 보관 중인 상품을 USDT로 받아 채우라는 안내나 단추는 없다. 충전이 끝나면 시트가 닫히고 같은 박스 화면에 남으며, 잔액이 차면 주 단추가 다시 열기로 돌아온다.

### C-5. 개봉 연출

| 갈림길 | 예 | 아니오 | 근거 |
|---|---|---|---|
| 결과는 언제 정해지나 | 열기를 누른 구매 안에서 이미 정해져 보관함에 적힌다. 연출은 그것을 보여 줄 뿐이다 | | `web/lib/opening.ts:59-63,90-95`, `web/components/box/Opening.tsx:4` |
| 움직임 줄이기를 켰는가 | 연출 없이 결과부터 | 기대 520ms(상자가 내려앉고 봉인이 버틴다) → 충격 150ms(봉인이 떨어지고 뚜껑이 넘어간다) → 퇴장 170ms → 결과. 합 840ms | `web/lib/openingFlow.ts:62-68`, `web/components/box/Opening.tsx:112-121` |
| 짧게 보기를 켰는가 | 220 + 110 + 120 = 450ms | 위의 840ms | `web/lib/openingFlow.ts:63-65` |
| "결과 바로 보기"를 눌렀는가(Esc 포함) | 곧바로 결과. 결과는 같다 | 시계대로 | `web/components/box/Opening.tsx:107-109,229` |
| 결과가 뜬 직후인가 | 350ms 동안 아래 단추가 눌리지 않는다(건너뛰려던 손이 다음 구매를 누르지 않게) | 그 뒤 눌린다 | `web/lib/openingFlow.ts:71`, `web/components/box/Opening.tsx:135` |
| 여러 개인가 | 같은 상자 하나와 "{n}개 여는 중", 같은 840ms, 그다음 요약과 목록 | 한 개 장면 | `web/components/box/Reveal.tsx:29,72-81,133-141` |
| 연출 중에 떠났는가 | 돌아오면 박스 화면이 "결과 보기"를 내고 그 기록을 연출 없이 다시 보여 준다("아까 연 박스의 결과입니다. 새로 뽑지 않았습니다.") | | `web/components/box/BoxScreen.tsx:110-126`, `web/components/box/Opening.tsx:233` |

- 연출의 길이는 결과와 무관하게 같다. 다른 상품이 스쳐 지나가는 릴은 없다. 위의 잔액은 결과가 드러나는 순간 최종 값으로 한 번에 바뀐다(`web/components/box/Opening.tsx:7-10,190`).
- 소리와 진동은 기본이 끔이고 개봉 설정에서 켠다(`web/stores/settingsStore.ts:34-35`).
- 잰 값: 누른 뒤 결과까지 0.89초, 다음 행동까지 1.24초(`opening/STATE.md:39`).

### C-6. 결과 화면

새 박스는 결과가 전부 실물이라 아래의 "실물 상품" 줄이 실제로 쓰이는 길이다. USDT 결과 줄은 옛 박스에서만 나온다.

**한 개를 열었을 때(`Opening`)**

| 결과 | 화면에 적히는 것 | 주 단추 | 밑줄 링크 | 근거 |
|---|---|---|---|---|
| 실물 상품, 아직 고르지 않음 | 사진, 이름, "참고가 {amount}", 2배 이상이면 "낸 값의 {n}배", "보관함에 넣었습니다", "나올 확률 {pct}. {price} 사용". 낸 값의 20배 이상이고 사진이 있으면 위에 로고 | "받는 방법 선택" | "한 번 더 언박싱 {amount}"(잔액이 될 때), "개봉 결과 검증". 닫기는 오른쪽 위 X | `web/components/box/Opening.tsx:209-221,243-249` |
| 받는 방법 시트 | "배송 받기"(주소를 입력해 배송을 신청합니다)와 "{amount}로 받기"(참고가 {ref}, 받는 금액은 그 95%입니다. 그 밖의 수수료는 없고, 받으면 배송으로 바꿀 수 없습니다). 지난번에 고른 방법이 골라져 있다(처음에는 아무것도 없다) | 고른 것에 따라 "{amount}로 받기" 또는 "배송 정보 입력" | | `web/components/box/Opening.tsx:178-183,247,257-269` |
| USDT로 받음 | "받은 금액", 큰 금액, "{price} 사용"과 "잔액 {diff} 증가(또는 감소)", "{name}, 참고가 {ref}. USDT로 받았습니다. 나올 확률 {pct}" | "한 번 더 언박싱 {amount}"(잔액이 모자라면 "박스로 돌아가기") | "개봉 결과 검증", "박스로 돌아가기" | `web/components/box/Opening.tsx:163-171,202-208,238-242` |
| 배송을 신청함 | 상태 줄이 "배송을 신청했습니다"로 바뀐다 | 위와 같다 | 위와 같다 | `web/components/box/Opening.tsx:219,272` |
| USDT로 받기 실패, 대기 | 빨간 줄 "USDT로 받지 못했습니다. 상품은 보관함에 그대로 있습니다." 또는 대기 안내 | "다시 시도, {amount}로 받기" 또는 "다시 확인" | "개봉 결과 검증", "박스로 돌아가기" | `web/components/box/Opening.tsx:234-235,245-246` |
| 자동 받기를 켠 계정(20배 미만 상품) | 결과가 보인 뒤 바로 95%로 받고 "자동으로 USDT로 받았습니다. 개봉 설정에서 끌 수 있습니다" | "한 번 더 언박싱 {amount}" | 위와 같다 | `web/components/box/Opening.tsx:150-156,207` |
| 옛 박스의 USDT 결과 | "받은 금액", 금액, 잔액 변화, "잔액에 반영했습니다" | "한 번 더 언박싱 {amount}" | 위와 같다 | `web/components/box/Opening.tsx:204-207` |

한 개 결과에서 USDT로 받을 때는 따로 확인창이 없다. 받는 방법 시트의 아래 단추가 확정이다.

**여러 개를 열었을 때(`Reveal`)**

| 갈림길 | 예 | 아니오 | 근거 |
|---|---|---|---|
| 무엇이 적히나 | 제목 "{n}개를 열었습니다", "받은 상품은 보관함에 있습니다.", 가장 큰 결과 한 칸(2배 이상일 때만), 행: 쓴 금액, 잔액에 반영, 보관 상품 {n}개 참고가, 잔액 변화. 그 아래 결과 행 전부(값이 큰 순서) | | `web/components/box/Reveal.tsx:84-107,180-227` |
| 받을 상품이 남았는가 | 주 단추 "받을 상품 받기 (남은 {n}개)". 누르면 첫 상품의 시트가 뜬다. 밑줄 링크로 "한 번 더 언박싱"과 "박스로 돌아가기" | 주 단추가 "한 번 더 언박싱 {amount}" | `web/components/box/Reveal.tsx:228-232` |
| 상품 시트에서 | 실물이면 주 단추 "배송 받기", 밑줄 링크 "USDT로 받기 ({amount})"와 "개봉 결과 검증" | 실물이 아니면 주 단추가 "USDT로 받기 ({amount})" | `web/components/box/Reveal.tsx:124-129,239-248` |
| USDT로 받기를 눌렀는가 | 확인창 "{name} 대신 {amount} 받고, 되돌릴 수 없습니다." 확정하면 그 행이 "USDT로 받음"으로 바뀌고 요약이 다시 계산된다 | | `web/components/box/Reveal.tsx:111-118,251` |

- 여러 개를 한꺼번에 USDT로 받는 단추는 없다. 상품마다 행을 눌러 하나씩 처리한다. 100개를 열면 100번이다. 자동 받기 설정은 여러 개 결과에는 적용되지 않는다(`Reveal` 은 그 설정을 읽지 않는다).
- 결과를 둔 채 바로 다시 열 수 있다. 다시 열기는 언제나 사람이 누른다(`web/components/box/Opening.tsx:12`).
- 결과 화면의 잔액 변화는 지갑의 앞뒤를 빼지 않고 이 개봉의 영수증으로 계산한다(`web/lib/openingFlow.ts:51-53`).

### C-7. 보관함

| 상품의 상태 | 주 단추 | 밑줄 링크 | 근거 |
|---|---|---|---|
| 보관 중, 실물 | "배송 받기" | "USDT로 받기 ({amount})", "개봉 결과 검증", "후기 쓰기"(조건이 될 때) | `web/components/inventory/InventoryScreen.tsx:133,138-140` |
| 보관 중, 실물이 아님(옛 박스의 디지털 상품) | "USDT로 받기 ({amount})" | "개봉 결과 검증" | `web/components/inventory/InventoryScreen.tsx:134` |
| 배송 신청함 | "배송 신청 취소"(확인창). 한 줄 "운송장 번호는 출고되면 표시됩니다." | "개봉 결과 검증" | `web/components/inventory/InventoryScreen.tsx:131,135,151` |
| 배송 중(운송장 있음) | "배송 조회 ↗"(택배사 사이트) | "개봉 결과 검증" | `web/components/inventory/InventoryScreen.tsx:136` |
| USDT로 받음 | 없음. "받은 금액" 행이 있다 | "개봉 결과 검증" | `web/components/inventory/InventoryScreen.tsx:126` |

- 보관 중 행의 오른쪽 금액은 참고가가 아니라 USDT로 받을 때의 수령액(95%)이다. 화면 설명이 그렇게 말한다(`web/components/inventory/InventoryScreen.tsx:107`, `web/messages/v.ko.json:217`).
- 여러 상품을 골라 한꺼번에 처리하는 선택 기능은 없다.
- 후기는 참고가 100 USDT 이상인 상품에만, 상품 하나에 하나만 쓸 수 있다(`web/lib/community.ts:11,52-59`).

### C-8. USDT 출금

**잔액에서만 한다. 상품을 고르는 칸은 없다.** 대상은 `cryptoBalance` 다. 카드분은 나가지 않는다.

| 갈림길 | 예 | 아니오 | 근거 |
|---|---|---|---|
| 들어오는 곳 | 지갑의 밑줄 링크 "출금", 계정의 "출금" 행 | 결과 화면과 보관함에는 출금으로 가는 길이 없다 | `web/components/wallet/WalletScreen.tsx:103`, `web/components/account/AccountScreen.tsx:51` |
| 인증 앱이 연결돼 있는가 | 입력 화면 | 화면 "인증 앱 연결", 주 단추 "인증 앱 연결하기"(그 자리에서 시트로 연결), 밑줄 링크 "이메일 인증으로 출금 (72시간 뒤 전송)" | `web/components/wallet/WithdrawScreen.tsx:154-164` |
| 입력이 맞는가 | 주 단추 "출금 확인" → 확인 화면 | 칸 아래 빨간 줄: 주소 형식, "금액을 숫자로 넣습니다.", "{min}부터 출금할 수 있습니다.", "잔액 {balance}보다 많이 넣었습니다." | `web/components/wallet/WithdrawScreen.tsx:78-85,212-235`, `web/lib/withdrawal.ts:60-69` |
| 확인 화면 | 수수료를 뺀 받는 금액, 금액, 네트워크 수수료, 네트워크, 받는 주소 전체. 주 단추 "인증하고 출금" | 뒤로 가면 입력으로 | `web/components/wallet/WithdrawScreen.tsx:166-178` |
| 인증 코드가 맞는가(인증 앱 6자리) | 접수. 이때 잔액에서 신청액이 빠지고 내역이 생긴다 | "코드가 맞지 않습니다. {left}번 더 넣을 수 있습니다." 세 번 틀리면 이메일 인증으로 넘어간다 | `web/components/wallet/WithdrawScreen.tsx:27,112-126,180-188` |
| 이메일 인증으로 가는가 | "코드 보내기" → 코드 입력 → "{amount} 출금". 접수되면 72시간 보안 대기 | | `web/components/wallet/WithdrawScreen.tsx:127-142,190-198`, `web/lib/withdrawHold.ts:9-13` |
| 접수됐는가 | 화면 "출금을 신청했습니다", 상태 행, 주 단추 "지갑으로" | 실패 사유 한 줄 | `web/components/wallet/WithdrawScreen.tsx:200-210` |
| 대기 중에 취소하는가 | 지갑 내역의 거래 시트에서 "출금 취소"(72시간 대기 건만), 확인창을 거쳐 금액이 잔액으로 돌아온다 | 남은 시간 "{h}시간 {m}분 뒤에 전송됩니다."를 보여 준다 | `web/components/wallet/WalletScreen.tsx:72-88,135-145` |

- 네트워크는 TRC-20 과 BEP-20 둘이다(입금은 ERC-20 도 받는다). 수수료는 고정액으로 TRC-20 1.00 USDT, BEP-20 0.50 USDT 이고 신청액 안에서 뺀다. 최소 신청액은 20 USDT 다(`web/lib/withdrawal.ts:19-26,56-58`).
- 금액 칸은 표시 통화 단위로 적는다(달러나 원). USDT 로 바꿔 계산한다(`web/components/wallet/WithdrawScreen.tsx:69-76`).
- 상태는 처리 대기, 안전 심사 대기, 72시간 보안 대기, 전송 중, 완료, 취소됨, 실패다(`web/stores/walletStore.ts:28`, `web/messages/v.ko.json:340-348`). 처리 중인 건은 10초마다 상태를 다시 받는다(`web/components/wallet/WalletScreen.tsx:44-62`).
- 상품을 현금으로 만드는 전체 길: 상품 → USDT로 받기(참고가의 95%) → 잔액 → 출금(고정 수수료, 최소 20 USDT, 인증).
- 입금액만큼 열어야 출금된다는 이용 기준은 새 출금 화면에서 검사하지 않는다(B-3).
- 브라우저 계정 모드에서는 인증 코드가 6자리 숫자이기만 하면 통과하고, 출금 기록은 처리 대기나 72시간 대기에 머문다(전송, 완료로 넘기는 코드가 없다)(`web/lib/browserAccount.ts:84,301-338`).

### C-9. 배송

| 갈림길 | 예 | 아니오 | 근거 |
|---|---|---|---|
| 들어오는 곳 | 한 개 결과의 받는 방법 시트, 여러 개 결과의 상품 시트(주 단추), 보관함의 상품 시트(주 단추) | 실물이 아닌 상품에는 배송이 없다 | `web/components/box/Opening.tsx:272`, `web/components/box/Reveal.tsx:127,250`, `web/components/inventory/InventoryScreen.tsx:133,147` |
| 지난번 주소가 있는가 | 가장 최근 배송 신청의 주소가 채워져 있다 | 빈 칸. 나라는 한국이 처음 값 | `web/components/flow/ShipSheet.tsx:17,34-40` |
| 입력이 맞는가 | "배송 신청" → 확인창 "{address} 주소로 보내고, 출고된 뒤에는 취소할 수 없습니다." | 틀린 칸 아래 빨간 줄(이름, 휴대폰, 우편번호, 주소, 한국은 개인통관고유부호, 중국은 신분증 번호) | `web/components/flow/ShipSheet.tsx:51,64-79`, `web/lib/shipping.ts:33-52` |
| 접수됐는가 | 상품이 "배송 신청함"이 되고 결과 화면과 보관함에 반영된다 | 빨간 줄 "배송 신청을 접수하지 못했습니다. 상품은 보관함에 그대로 있습니다." | `web/components/flow/ShipSheet.tsx:52-58,76`, `web/lib/claim.ts:32-46` |

- 배송은 상품 하나씩이다. 세 진입점 모두 상품 id 하나만 넘긴다. 시트에는 "보낼 상품 {n}개" 행이 있고 함수는 여러 개도 받는다.
- 배송비: 나라별 정액 표(한국 15 USDT 에서 호주 42 USDT)가 있지만 무료 배송 행사가 켜져 있어 0 이다(`web/lib/shipping.ts:11-19`). 박스 화면의 상품 시트는 "무료, 배송 가능 나라 13곳"이라고 적는다(`web/components/box/BoxScreen.tsx:278`).
- 배송 가능 나라는 13곳이다(`web/lib/shipping.ts:7`).
- **브라우저 계정 모드에는 `/shipping/request` 를 받는 코드가 없다.** `requestShipment` 는 서비스에 요청을 보내는데 브라우저 어댑터는 그 경로를 처리하지 않고 "unavailable" 을 던진다(`web/lib/claim.ts:35`, `web/lib/browserAccount.ts:80-339`). 그러면 위의 실패 한 줄이 뜬다. 옛 촬영 도구의 설명서도 같은 사실을 적고 있다(`web/scripts/capture/README.md:109`). 실제로 눌러 보지는 않았다.

### C-10. 검증

| 갈림길 | 예 | 아니오 | 근거 |
|---|---|---|---|
| 어디서 여는가 | 결과 화면의 "개봉 결과 검증", 보관함 상품 시트, `/verify` 의 내 기록 행, 나온 상품의 "검증", 내 후기 상세 | | `web/components/box/Opening.tsx:159`, `web/components/box/Reveal.tsx:109`, `web/components/inventory/InventoryScreen.tsx:81`, `web/components/box/WinsScreen.tsx:36` |
| 무엇을 다시 계산하나 | 공개된 값의 SHA-256 이 미리 잠근 값과 같은지, HMAC-SHA256(공개된 값, "내 기기 값:회차")의 앞 8자리(16진수)를 정수로 읽어 1,000,000 으로 나눈 나머지가 기록의 번호와 같은지, 그 번호가 구매 때 저장한 확률표에서 가리키는 상품이 받은 상품과 같은지 | | `web/lib/fairness.ts:50,67-72,92-114`, `web/components/fairness/verifyRecord.ts:15-29` |
| 셋 다 맞는가 | "다시 계산한 결과가 받은 상품과 같습니다." | 하나라도 틀리면 빨간 줄 "다시 계산한 결과가 받은 상품과 다릅니다." | `web/components/flow/VerifySheet.tsx:44,58` |
| 기록에 당시 확률표가 있는가 | 상품까지 맞춰 본다 | "번호까지 다시 계산해 맞는 것을 확인했습니다. 이 기록에는 당시 확률표가 없어 상품까지는 맞춰 보지 못했습니다." | `web/components/flow/VerifySheet.tsx:44`, `web/lib/opening.ts:92` |
| 값을 직접 넣는가(`/verify` 아래) | 공개된 값, 미리 잠근 값(선택), 내 기기 값, 회차, 박스를 넣고 "계산하기". 해시, 잠근 값과 같은지, 번호, 그 번호의 상품이 나온다. 상품은 지금의 확률표로 찾는다고 한 줄로 말한다 | 값이 비면 "공개된 값, 내 기기 값, 회차를 넣어야 계산합니다." | `web/components/verify/VerifyScreen.tsx:54-65,93-113` |

해시(커밋)가 실제로 어떻게 도는지:
- 서버 값은 서버가 아니라 **이 브라우저가 만든다**(64바이트 무작위). 그 SHA-256 을 "미리 잠근 값"으로 함께 저장한다(`web/stores/fairStore.ts:40-50`, `web/lib/fairness.ts:41,50`).
- 회차는 열 때마다 1씩 오른다. 100개를 열면 회차 100개를 쓴다(`web/stores/fairStore.ts:56-60`, `web/lib/opening.ts:58`).
- 서버 값을 바꾸는 함수(`rotateServerSeed`)와 내 기기 값을 바꾸는 함수(`setClientSeed`)는 저장소에 있지만 새 화면에서 부르는 곳이 없다(검색으로 확인). 그래서 한 번 만든 서버 값이 계속 쓰인다.
- 검증 시트는 방금 연 결과의 서버 값 원문을 보여 준다(`web/components/flow/VerifySheet.tsx:52`). 같은 서버 값이 다음 개봉에도 쓰이므로, 첫 개봉을 검증한 뒤에는 다음 회차의 번호를 미리 계산할 수 있는 값이 화면에 나와 있는 셈이다. 서버 값은 처음부터 localStorage 에도 원문으로 있다(`web/stores/fairStore.ts:65-66`).
- 검증 화면의 설명은 "서버가 값을 정하고 그 해시만 보여 줍니다"라고 적는다(`web/messages/v.ko.json:206-211`). 지금 구현은 서버가 없는 브라우저 장부다.
- 사용자가 여는 화면에서 해시를 열기 전에 미리 보여 주는 곳은 없다. 미리 잠근 값은 연 뒤의 검증 시트와 기록에서 본다.

### C-11. 나온 상품, 후기, 명예의 전당

| 화면 | 무엇을 보여 주나 | 실제 자료인가 | 근거 |
|---|---|---|---|
| 나온 상품(`/wins`) | 이 계정의 보관함 기록 가운데 상품이고 낸 값의 2배 이상인 것. 사진, 이름, "{amount}, 낸 값의 {n}배", 박스, 가린 이름(앞 두 글자와 별표)과 시각, "검증" | 실제 기록만. 한 줄 "이 계정에서 연 기록입니다."를 적는다. 다른 사람의 기록은 없다(서버 기록이 없다고 주석에 적혀 있다) | `web/components/box/WinsScreen.tsx:4-5,20,31-41,50` |
| 박스 화면의 후기 줄, 후기 모아보기(`/reviews`) | 이 기기에서 쓴 후기가 앞, 그 뒤에 `REVIEW_SAMPLES` 28건 | 28건은 **샘플**이다. 파일 머리말이 "실제 이용자가 쓴 글과 점수가 아니다"라고 적는다. 화면의 카드에는 샘플이라는 표시가 없다(가린 이름, 날짜, 별점, 글만 보인다). 새 문구 묶음에 "샘플", "예시"라는 말이 없다 | `web/lib/reviewSamples.ts:1-2,17-46`, `web/components/box/BoxReviews.tsx:14,96-117,119-143` |
| 박스 카드와 박스 화면의 별점 | 위의 후기에서 센 평균과 개수 | 샘플 점수가 섞인다 | `web/lib/reviewSamples.ts:69-71`, `web/components/box/BoxScreen.tsx:98-99` |
| 명예의 전당, 주간 랭킹, 실시간 당첨 줄 | 새 화면에 없다 | 옛 컴포넌트(`HallOfFame.tsx`, `LiveTicker.tsx`)와 계산(`web/lib/ranking.ts`, `web/lib/liveDrops.ts`)은 남아 있지만 연결돼 있지 않다 | A-4 |

- 샘플 28건의 박스는 전부 옛 박스다(`vault-gold`, `dollar-apple` 등). 새 박스 320개에는 샘플이 없어 "아직 후기가 없습니다. 실제로 연 기록에만 후기를 쓸 수 있습니다."가 뜬다(`web/components/box/BoxReviews.tsx:182`). 샘플이 보이는 곳은 꼬리말로 가는 `/reviews` 와 옛 박스의 주소다.
- `BoxScreen.tsx:6,97` 의 주석은 "예시 후기는 보여 주지 않는다"고 적지만 `useReviewCards` 는 샘플을 넣는다. 주석과 코드가 다르다.

## D. 문구

- 새 화면의 문구는 `web/messages/v.ko.json`, `v.en.json`, `v.zh.json` 에 있고 `v` 라는 묶음으로 실린다. 세 파일의 키는 514개로 같다(직접 셌다)(`web/i18n/request.ts:11-12`).
- 옛 묶음 `web/messages/ko.json`, `en.json`, `zh.json`(각 3,116줄)도 함께 실린다. 새 화면은 여기서 계정 오류 문구(`account.errors`), 옛 카테고리 이름(`categories`), 옛 박스의 상품 이름(`products`)을 쓴다(`web/components/wallet/WithdrawScreen.tsx:33`, `web/components/box/BoxList.tsx:44`, `web/lib/useProductText.ts:12-18`).
- 새 박스와 그 상품의 이름은 문구 파일이 아니라 카탈로그 자료에 세 언어로 있다(`web/lib/useProductText.ts:8-9`).
- `AGENTS.md` 는 문구 파일을 옛 세 파일로 적고 있다. 새 화면의 정본은 `v.*.json` 이다.

### D-1. 실제로 쓰는 말

| 행동이나 대상 | ko | en | zh | 키 |
|---|---|---|---|---|
| 박스 | 박스 | Boxes | 盲盒 | `nav.boxes` |
| 목록 전체 | 전체 박스 | All boxes | 全部盲盒 | `home.all` |
| 충전(제목) | USDT 충전 | Add USDT | 充值 USDT | `charge.title` |
| 충전(단추) | USDT 충전하기 | Add USDT | 充值 USDT | `box.charge` |
| 출금 | 출금 | Withdraw | 提现 | `wallet.withdraw` |
| 열기(단추) | {amount} 언박싱, {n}개 언박싱 {amount} | Unbox for {amount}, Unbox # for {amount} | {amount} 开箱, 开 # 个 {amount} | `box.open` |
| 무료 열기 | 무료 언박싱 | Unbox free | 免费开箱 | `box.openFree` |
| 다시 열기 | 한 번 더 언박싱 {amount} | Unbox again for {amount} | 再开一次 {amount} | `reveal.again` |
| 로그인 전 열기 | 로그인하고 언박싱 | Log in to unbox | 登录后开箱 | `box.loginToOpen` |
| 잔액 부족 | 잔액 {balance}. {missing} 더 필요합니다. | Balance {balance}. You need {missing} more. | 余额 {balance}。还需要 {missing}。 | `box.short` |
| 받는 방법 고르기 | 받는 방법 선택 | Choose how to receive | 选择领取方式 | `op.choose` |
| 실물로 받기 | 배송 받기 | Ship it | 配送到家 | `reveal.ship` |
| 잔액으로 받기 | USDT로 받기 ({amount}) | Take USDT ({amount}) | 领取 USDT（{amount}） | `reveal.take` |
| 잔액으로 받기(한 개 결과) | {amount}로 받기 | Take {amount} | 领取 {amount} | `op.takeChoice` |
| 배송 신청 | 배송 신청 | Request shipping | 申请配送 | `ship.submit` |
| 결과 확인 | 개봉 결과 검증 | Verify result | 验证开箱结果 | `nav.verify` |
| 박스 안의 상품 | 구성품 | Contents | 内容 | `box.contents` |
| 확률 묶음 | 확률 요약 | Odds summary | 概率摘要 | `box.oddsSummary` |
| 가장 비싼 상품의 값 | 최고 상품가 | Top item value | 最高商品价值 | `box.top` |
| 상품의 값 | 참고가 | Reference price(문장 안) | 参考价 | `reveal.value`, `op.takeNote` |
| 보관함 | 보관함 | Inventory | 保管箱 | `nav.inventory` |
| 상태 | 보관 중, 배송 신청함, 배송 중, 배송 완료, USDT로 받음 | Stored, Shipping requested, In transit, Delivered, Taken as USDT | 保管中, 已申请配送, 配送中, 已送达, 已领取 USDT | `inv.st*` |
| 연출 건너뛰기 | 결과 바로 보기 | Show the result now | 立即查看结果 | `op.skip` |
| 당첨 기록 | 나온 상품 | Recent results | 开出的商品 | `wins.title` |
| 가입 | 이메일로 가입 | Sign up with email | 邮箱注册 | `login.signupLink` |

- `DESIGN.md:95-106` 의 용어표와 같다. 다만 용어표의 "구성품과 확률"은 지금 화면에서 "구성품"과 "확률 요약" 둘로 갈려 있다(2026-10-12 에 확률을 한곳으로 모은 뒤다, `web/components/box/BoxScreen.tsx:228`).
- 같은 일을 가리키는 말이 셋 섞여 있다. 단추는 "언박싱", 지갑 내역은 "박스 열기"(`wallet.type.open`), 진행 글은 "여는 중"(`box.opening`), 제목은 "개봉 결과"다.
- 레이아웃의 메타 설명은 아직 옛 문구다("1달러에 여는", "95% 즉시 페이백")(`web/app/[locale]/layout.tsx:23-27`).

### D-2. 금지어와 문구 검사

| 검사 | 무엇을 보나 | 어느 파일을 보나 | 근거 |
|---|---|---|---|
| `web/tests/i18n.test.ts` | 세 언어 키 일치, 지정 문구, 금지어(ko: 환전, 회수, 정산, 롤오버, 긁어, 돌려보기, 손맛, 잭팟, 볼트, 연타, 올인, 본전, 환수율, 오토플레이. en: cash out 계열, rollover, jackpot, All-in. zh: 折现, 头奖, 金库, 自动旋转, 流水), 언어 섞임, 자리표시자 일치 | **옛 묶음 세 파일만** 읽는다. `v.*.json` 은 읽지 않는다 | `web/tests/i18n.test.ts:11-12,54-68` |
| design-lint 의 문구 규칙 | 긴 줄표, 가운뎃점, 느낌표, 물음표, 사과 표현 | `new` 범위에 `v.*.json` 세 파일이 들어 있다 | `web/scripts/design-lint/README.md:38-42`, `web/scripts/design-lint/config.json:18-20` |
| `npm run catalog:check` | 상품 이름의 금지어와 문장부호, id 충돌, 중국어 누락 | 카탈로그 | `web/scripts/catalog-check.ts:1-8` |

`v.*.json` 의 키 일치와 금지어를 보는 테스트는 찾지 못했다.

### D-3. 금액과 숫자

- 화면의 금액은 전부 `useCurrency().fmt`(→ `formatCurrency`)를 거친다. 기본 표기는 달러다("$80", 소수는 필요한 자리만 둘째 자리까지). 꼬리말에서 원화로 바꾸면 만원 아래를 버리고 "₩110,000"으로 적는다(1만원 미만은 그대로). 환율은 고정 1 USDT = 1,380원이다(`web/lib/useCurrency.ts:11-15`, `web/lib/formatCurrency.ts:32-49`, `web/stores/currencyStore.ts:21,36`).
- 확률은 `formatRate`(소수 넷째 자리까지, 꼬리 0 없음)(`web/lib/products.ts:447`).
- 배수는 `timesOf`: 2배 미만은 적지 않고, 10배 미만은 소수 첫째 자리 버림, 그 위는 정수 버림(`web/lib/openingFlow.ts:134-139`). 박스의 최대 배수는 `ceilingTimes`(`web/lib/products.ts:403`).
- 테스트: `web/tests/formatCurrency.test.ts:8-74`, `web/tests/openingFlow.test.ts:161`.

## E. 디자인 시스템

- 색과 크기 토큰은 `web/app/tokens.css` 한 곳이다. 바탕 `--v-bg` 검정, 카드 `--v-card`, 알약 `--v-pill`, 글자 넷(`--v-title`, `--v-text`, `--v-sub`, `--v-mute`), 주 단추 흰색, 실패 `--v-fail`, 카드 반경 26(모바일 20), 단추 높이 52, 터치 44, 좁은 열 560, 넓은 열 1120(`web/app/tokens.css:5-80`). 다른 파일은 `var(--v-...)` 만 쓰고 design-lint 가 막는다.
- 모양은 `web/app/ui.css` 의 `v-` 클래스, 개봉 장면은 `web/app/opening.css`, 배너는 `hero.css`, 꼬리말은 `footer.css` 다. 옛 스킨 CSS(`design.css`, `gpt-skin.css` 등)도 아직 함께 실린다(`web/app/globals.css:1-11`).
- 부품은 `web/components/ui/kit.tsx` 와 `Sheet.tsx`, `toast.tsx` 다.

| 부품 | 클래스 | 쓰는 법 | 근거 |
|---|---|---|---|
| 주 단추 | `v-btn` | `Button`. 흰 알약, 폭 100%, 높이 52. `busy` 면 단추 자리에 상태 글("확인 중"). 화면에 하나 | `web/components/ui/kit.tsx:14-20`, `web/app/ui.css:57-61` |
| 조용한 단추 | `v-btn--quiet` | 알약 면 색. 목록 더 보기, 소셜 로그인 | `web/app/ui.css:62-63` |
| 단추 모양 링크 | `v-btn` | `ButtonLink` | `web/components/ui/kit.tsx:23-25` |
| 보조 행동 | `v-link`, 묶음은 `v-links` | `TextLink`. 14px 밑줄, 높이 44. 바깥 링크는 ↗ | `web/components/ui/kit.tsx:28-32`, `web/app/ui.css:65-67` |
| 고르는 알약 | `v-chips`, `v-chip`, 옆으로 넘기는 것은 `v-chips--scroll` | `Chips`. 누르면 곧 선택, 고른 것은 2px 테두리 | `web/components/ui/kit.tsx:35-43`, `web/app/ui.css:70-75` |
| 화면 머리 | `v-screenhead`, `v-title`, `v-desc`, `v-back` | `ScreenHead`. 제목 하나, 설명 한 줄, 뒤로 가기 하나 | `web/components/ui/kit.tsx:46-57` |
| 카드 | `v-card`, 윤곽은 `v-card--outline`, 제목은 `v-card-title`(굵기 600 은 여기만) | `Card` | `web/components/ui/kit.tsx:67-69`, `web/app/ui.css:78-80` |
| 행 | `v-rows`, `v-row`, 누르는 행은 `v-row--link`, 행 전체가 단추면 `v-row--button` | `Rows`, `Row`. 라벨 왼쪽, 값 오른쪽 | `web/components/ui/kit.tsx:60-65`, `web/app/ui.css:81-88,364` |
| 상품 행 | `v-itemrows`, `v-itemrow`, `v-itemrow-photo`, `v-itemrow-body`, `v-itemrow-meta` | 보관함, 내역, 검색 결과, 사진 없는 구성품 | `web/app/ui.css:269-276,372` |
| 상품 타일 | `v-items`(크기 `--l`, `--m`, `--s`), `v-item` | 박스 화면의 구성품 | `web/app/ui.css:222-232` |
| 입력칸 | `v-field`, `v-field-label`, `v-input`, 여러 줄은 `v-input--area` | `Field` | `web/components/ui/kit.tsx:71-73`, `web/app/ui.css:91-99` |
| 상태 한 줄 | `v-line`, 실패는 `v-line--fail` | `Line`. 실패면 `role="alert"` | `web/components/ui/kit.tsx:76-78`, `web/app/ui.css:106-107` |
| 빈 목록, 로딩 | `v-empty`, `v-skel` | `Empty`, `Skeleton` | `web/components/ui/kit.tsx:80-87` |
| 토스트 | `v-toast-host`, `v-toast` | `useToast().show(text)`. 한 번에 하나, 2.4초, 아래 가운데 | `web/components/ui/toast.tsx:10-25`, `web/app/ui.css:136-138` |
| 박스 화면 배치 | `v-boxlayout`, `v-boxside`, `v-openbar`(아래에 붙는 열기 막대) | | `web/app/ui.css:287-288,323-335` |
| 개봉 장면 | `v-op`, `v-op-*`, 상자는 `v-box3`, `v-seal` | 단계는 `data-phase`, 길이는 CSS 변수 `--ant`, `--imp`, `--exit` | `web/components/box/Opening.tsx:186-188`, `web/app/opening.css:110-129` |

**시트와 확인창을 만드는 법**
- `Sheet`: `open`, `onClose`, `title`, `desc`, `closeLabel`, `wide`, `locked` 를 받는다. 바깥은 `v-scrim`(어두운 면, 누르면 닫힌다), 안은 `v-sheet` 와 `v-sheet-body`. 모바일은 아래에 붙고 위쪽 모서리만 둥글며, 768px 이상은 가운데 창(폭 480, `wide` 면 640)이다. 닫기 단추는 오른쪽 위다(`web/components/ui/Sheet.tsx:12-30`, `web/app/ui.css:114-133`).
- `Confirm`: 제목, 한 줄, 주 단추 하나, 취소는 밑줄 링크. `role="alertdialog"`. 되돌릴 수 없는 행동에만 쓴다고 머리말에 적혀 있다(`web/components/ui/Sheet.tsx:5,32-51`).
- 둘 다 `useModal` 을 쓴다. Esc 로 닫고, Tab 을 가두고, 뒤 화면 스크롤을 막고, 겹친 시트는 맨 위 것만 살린다(`web/lib/useModal.ts:22-86`).
- 화면 전체를 덮는 개봉 장면도 같은 `useModal` 을 쓰고, 그 위에 시트가 다시 뜬다(`web/components/box/Opening.tsx:109`).
- 어느 화면에서든 여는 시트의 열림 상태는 `web/stores/flowStore.ts`(충전, 메뉴)와 `authStore`(로그인)에 있다. 나머지 시트는 그 화면의 state 다.

**오류를 보이는 법**
- 막힘과 실패는 그 자리의 `Line` 한 줄이다. 입력 오류는 그 칸 바로 아래에 `Line fail` 을 둔다(`web/components/flow/ShipSheet.tsx:65-73`, `web/components/wallet/WithdrawScreen.tsx:218-225`).
- 막힌 자리의 주 단추가 다음 행동으로 바뀐다(박스 화면의 열기 → 충전, 충전 시트의 복사 → 다시 받기).
- 토스트는 주소 복사 한 곳에서만 쓴다. 로그아웃은 "로그아웃했습니다."를 옛 `authStore` 의 토스트 칸에 넣는데, 그 칸을 그리는 부품은 `web/app` 과 `web/components` 어디에도 없다(검색으로 확인). 그래서 이 문구는 화면에 나오지 않는 것으로 읽힌다(`web/stores/authStore.ts:67-74`, `web/components/account/AccountScreen.tsx:39`).
- 브라우저 기본 alert, confirm, prompt 는 쓰지 않는다(design-lint 의 `native-dialog` 0건).

## F. 검수 도구

### F-1. 촬영 스크립트(`web/scripts/capture`)

전부 `web` 폴더에서 돌린다. RTK 환경에서는 `rtk proxy node ...` 로 부른다(`web/scripts/capture/README.md:7,15`). 개발 서버는 직접 띄우지 않고 이미 떠 있는 3002 를 쓴다.

| 파일 | 하는 일 | 돌리는 법 | 3002 필요 |
|---|---|---|---|
| `capture.mjs` | 계획 파일의 항목마다 클릭하고 찍고 자동 검사(넘침, 잘림, 겹침, 44px 미만, 대비, 콘솔 오류) | `node scripts/capture/capture.mjs --plan scripts/capture/plan.before.json --out ../qa/before [--locales ko --viewports mobile --only home]` | 예 |
| `plan.before.json` | 개편 전 화면 100개 항목의 계획. 옛 화면의 선택자를 쓴다. 새 화면에서 그대로 도는지는 확인하지 못했다 | | |
| `states.mjs` | 새 브라우저의 저장소에 시험 상태를 심는다(guest, zero, insufficient, funded, inventory, shipping, pending, security 등) | 다른 스크립트가 가져다 쓴다 | 아니오 |
| `checks.mjs` | 자동 검사와 PNG 읽기 | 가져다 쓴다 | 아니오 |
| `quick.mjs` | 작업 중 빠른 촬영. 동작: open, login, charge, menu, state=member | `node scripts/capture/quick.mjs <출력 폴더> <이름=경로[#동작]> ...`, 폭은 `QUICK_VIEWS=mobile,narrow,desktop` | 예 |
| `opening.mjs` | 개봉 연출의 프레임과 결과를 찍는다. 고정값으로 원하는 결과를 고른다 | `node scripts/capture/opening.mjs <출력 폴더> <이름> --box <slug> --fixture single:<종류> 또는 seq:<이름> [--cast --view m360 --reduced --skip --balance n]` | 예 |
| `opening-fixtures.ts`, `opening-fixtures.json` | 실제 계산식에 넣으면 원하는 결과가 나오는 시드와 회차를 찾아 적는다. 확률표를 바꾸면 다시 돌린다 | `npx tsx scripts/capture/opening-fixtures.ts` | 아니오 |
| `opening-qa.mjs` | 개봉 경험 구조 검수(s1 에서 s15, 101개 항목). 화면을 누르고 돈과 상태를 숫자로 확인한다. 실패 상태는 개발 서버에서만 켜지는 시험 스위치로 만든다 | `node scripts/capture/opening-qa.mjs ../qa/opening/<폴더> [--only s1,s2]` | 예 |
| `opening-live.mjs` | 고정값 없이 실제 추첨으로 100개와 10개를 열어 찍는다 | `node scripts/capture/opening-live.mjs <출력 폴더>` | 예 |
| `flow-verify.mjs`, `flow-verify-link.mjs` | 하나 열고 그 값을 `/verify` 에 넣어 같은 번호가 나오는지, 시트의 링크가 값을 채우는지 | `node scripts/capture/flow-verify.mjs ../qa/cycles/c1` | 예 |
| `flow-review.mjs` | 보관함에서 후기를 올리고 박스 화면에 보이는지 | `node scripts/capture/flow-review.mjs ../qa/work/r4` | 예 |
| `flow-offline.mjs`, `flow-session.mjs`, `flow-nickname.mjs` | 오프라인 한 줄, 세션 끝남 한 줄, 닉네임 바꾸기 | `node scripts/capture/flow-offline.mjs ../qa/cycles/c4` | 예 |
| `hero-frames.mjs` | 홈 배너의 움직임을 시간 순서로 찍어 한 장으로 | `node scripts/capture/hero-frames.mjs <출력 폴더> [mobile|desktop|narrow] [ko|en|zh]` | 예 |
| `sheet.mjs`, `logo-sheet.mjs`, `video-frames.mjs` | 스크린샷 모아 붙이기, 로고 시안 비교판, 참고 영상에서 장면 뽑기 | 각 파일 머리말 | 아니오 |

`opening-qa.mjs` 와 고정값은 옛 박스(사다리 확률표) 기준이다. 새 박스의 개봉은 화면 검수 스크립트가 없고 계산만 전부 돌려 봤다고 적혀 있다(`catalog/BOX_PLAN.md:121`).

### F-2. 테스트와 lint

| 명령(`web` 에서) | 무엇을 보나 | 지금 결과 |
|---|---|---|
| `npm test` | `tsx --test tests/**/*.test.ts`. 돈, 확률, 검증, 문구, 계정 | 329건, 328 통과, 1 건너뜀(오늘 돌렸다) |
| `npx tsc --noEmit -p .` | 타입. `scripts` 의 `.ts` 도 배포 빌드의 타입 검사를 받는다(`catalog/BOX_PLAN.md:112`) | 돌리지 않았다 |
| `npm run lint:design` | `--scope new`. 색, 굵기, 대문자, 자간, 그림자, 그라데이션, 기본 대화창, 문구 다섯 규칙. 종료 코드 0 통과, 1 위반, 2 검사 오류 | 38개 파일, 위반 0건(오늘 돌렸다) |
| `npm run lint:design:all` | 옛 화면까지 | 돌리지 않았다 |
| `npm run catalog:check` | 상품 구성 점검 | 돌리지 않았다 |
| `npm run build` | 정적 내보내기. 개발 서버가 떠 있는 동안에는 돌리지 않는다. 돌린 뒤에는 `web/.next` 를 지운다(`opening/STATE.md:7`) | 돌리지 않았다 |

design-lint 의 `new` 범위에 들어 있지 않은 새 화면 파일이 있다: `components/box/Opening.tsx`, `BoxReviews.tsx`, `ReviewsScreen.tsx`, `WinsScreen.tsx`, `components/verify/**`, `components/account/**`, `components/home/HeroBanner.tsx`, `app/opening.css`, `app/hero.css`, 그리고 `reviews`, `wins`, `verify`, `account` 의 page 파일(`web/scripts/design-lint/config.json:3-32`). 새 화면을 만들면 이 목록에 넣어야 검사된다.

### F-3. 배포 전에 통과해야 하는 것

- 문서의 완료 기준: design-lint 0건, i18n 금지어 테스트, 돈과 확률 테스트, 빌드 통과, 화면 스크린샷 판정, Codex 독립 검수에서 새 위반 0건(`REDESIGN_BRIEF.md:62-64`).
- 배포는 `main` 이나 `feat/**` 에 `web/**` 가 푸시되면 GitHub Pages 작업이 `npm ci` → `rm -rf app/api` → `npm run build` 를 돌린다. 테스트와 lint 는 그 작업에 없다. 타입 오류가 있으면 빌드가 실패한다(`.github/workflows/deploy-pages.yml:3-41`).
- `DESIGN.md:22` 는 "커밋은 voila-redesign 브랜치에만. main 푸시, 배포 금지"라고 적고, `opening/STATE.md:7` 은 "테스트 사이트 배포는 main 푸시(파운더 허락 범위)"라고 적는다. 두 문서가 다르다.

## G. HypeDrop 과의 차이

판정은 셋이다. **있음**(같은 구실의 것이 있다), **일부**(구실은 닿지만 모양이나 값이 다르다), **없음**.

| HypeDrop 의 장치 | VOILA | 사실 | 근거 | 걸리는 규칙 |
|---|---|---|---|---|
| 결과 바로 아래의 SELL, 표시 값의 100%, 두 번 눌러 확정 | 일부 | 결과 자리에서 잔액으로 바꿀 수 있다. 값은 참고가의 **95%** 다. 한 개 결과는 "받는 방법 선택" → 시트에서 고름 → 아래 단추(세 번 누름), 여러 개 결과는 행 → 시트의 밑줄 링크 → 확인창. 여러 개를 한꺼번에 받는 단추는 없다. 계정이 켜면 한 개 열기의 20배 미만 상품은 자동으로 95%로 받는다 | `web/components/box/Opening.tsx:150-156,247,257-269`, `web/components/box/Reveal.tsx:124-129,251`, `web/lib/types.ts:133` | 95%는 돈 로직이다(`DESIGN.md:18`, `catalog/BOX_PLAN.md:68`). 확인창은 되돌릴 수 없는 행동에만(`DESIGN.md:52`) |
| 결과 바로 아래의 UPGRADE(배수를 걸고 90% / 배수 확률) | 없음 | 상품을 걸어 더 비싼 상품으로 바꾸는 기능은 새 화면에도 돈 로직에도 없다. 옛 `UpgradeFX.tsx` 는 낮은 결과를 보였다가 뒤집는 연출이지 이 기능이 아니고, 연결돼 있지 않다 | A-4, `web/components/unboxing/UpgradeFX.tsx` | 뒤집는 연출과 아깝게 놓친 척하는 연출은 금지(`DESIGN.md:14,78`, `opening/STATE.md:6`). 화면의 확률과 실제 확률은 같은 자료에서 나와야 한다(`DESIGN.md:19`). 걸기 기능 자체를 이름으로 금지한 문장은 읽은 문서에서 찾지 못했다 |
| 출금 창에서 아이템을 골라 그 값으로 바로 코인 출금(2% 수수료) | 없음 | 출금은 `cryptoBalance` 에서만 한다. 상품은 95%로 잔액이 된 뒤에 뺀다. 출금에는 고정 수수료(TRC-20 1.00, BEP-20 0.50 USDT), 최소 20 USDT, 인증 앱이나 이메일과 72시간 대기가 붙는다 | `web/components/wallet/WithdrawScreen.tsx:39,73,88-109`, `web/lib/withdrawal.ts:19-26` | 출금 계산은 돈 로직(`DESIGN.md:18`). 카드분은 출금 불가(`CLAUDE.md:18`, `web/stores/walletStore.ts:75`) |
| 잔액을 아이템 없이 바로 빼는 길(영상에서는 안 보임) | 있음 | VOILA 의 출금이 이것이다 | 위와 같다 | |
| 배송을 멀리 둔다(결과와 출금 창에 배송 단추가 없고 카트에서만, 자물쇠) | 없음(반대) | 배송은 결과 화면에서 USDT 와 나란히 고르고, 여러 개 결과의 상품 시트와 보관함 상품 시트에서는 배송이 주 단추, USDT 는 밑줄 링크다 | `web/components/box/Opening.tsx:259-266`, `web/components/box/Reveal.tsx:127`, `web/components/inventory/InventoryScreen.tsx:133,138` | "결과를 받은 자리에서 바로 검증하고 바로 받는다(실물 배송, 원하면 USDT로 받기)"(`DESIGN.md:12`). 용어표에 배송 받기와 USDT로 받기가 나란히 있다(`DESIGN.md:104-105`). 한편 파운더는 "손님이 뽑고 이것으로 바꾸는 것이 중심이 되어야 수익이 난다"고 정했다(`catalog/BOX_PLAN.md:29`). 지금 화면의 단추 서열은 이 말과 반대다 |
| 잔액 부족 창의 TOP-UP 과 SELL ITEMS | 일부 | 창이 아니라 박스 화면 막대의 한 줄과 주 단추 "USDT 충전하기"다. 상품을 팔아 채우는 길은 내놓지 않는다 | `web/components/box/BoxScreen.tsx:190,195` | 실패와 막힘은 팝업이 아니라 그 화면 안의 한 줄(`DESIGN.md:51`). 막힌 순간마다 같은 화면 안에 다음 행동(`DESIGN.md:13`) |
| FREE TRY(돈 없이 같은 릴, 결과는 내 것이 아님) | 없음 | 체험 개봉은 없다. 무료는 가입 혜택의 실제 개봉 두 번이고 결과가 보관함에 들어간다 | `web/stores/walletStore.ts:19,147-151`, `web/components/box/BoxScreen.tsx:75-77` | "지어낸 시험 결과"를 하지 않는다(`opening/STATE.md:6`). 옛 절은 무료 미리보기를 실제 지급과 구분하라고 적는다(`CLAUDE.md:52`) |
| 수량 1에서 6 | 있음 | 1, 5, 10, 50, 100. 한 번에 100개까지 | `web/lib/autoplay.ts:13`, `web/lib/opening.ts:45` | 10개 이상이거나 50 USDT 이상은 확인창(`web/components/box/BoxScreen.tsx:42-43`) |
| Loop(같은 수량으로 스스로 다음 회차) | 없음 | 다음 열기는 언제나 사람이 누른다. 자동 반복 계산(`web/lib/autoplay.ts`)은 남아 있지만 옛 화면에서만 쓴다 | `web/components/box/Opening.tsx:12` | "다음 열기 자동 결제"를 하지 않는다(`opening/STATE.md:6`) |
| SPEEDRUN | 일부 | 개봉 설정의 "짧게 보기"(0.45초)와 연출 중 "결과 바로 보기". 기본 연출이 이미 0.84초다 | `web/lib/openingFlow.ts:62-68`, `web/components/box/Opening.tsx:229,293` | 반복 횟수로 자동으로 줄이지 않는다(`web/lib/openingFlow.ts:59`) |
| 7.5초 릴(다른 상품이 지나가고 비싼 것이 결과 옆에 멈춤) | 없음 | 상자 하나가 열리는 0.84초 연출. 다른 상품을 스쳐 보이지 않고 길이는 결과와 무관하다 | `web/components/box/Reveal.tsx:5`, `web/lib/openingFlow.ts:58` | 아깝게 놓친 척하는 연출, 긴장 감속 연출 금지(`DESIGN.md:14,78`). "가짜 근접 실패", "낮은 결과에 높은 등급 신호" 금지(`opening/STATE.md:6`) |
| LIVE DROPS(다른 사람 결과가 계속 흐른다) | 없음 | 새 화면에 없다. 계산(`web/lib/liveDrops.ts`)과 옛 컴포넌트, API 계약(`/feed/live`)은 남아 있다. 서버의 모두 기록은 없다 | A-4, `web/lib/api.ts:38`, `web/components/box/BoxList.tsx:8` | 가짜 당첨 소식 금지(`DESIGN.md:14`). 지어낸 타인 활동 금지(`CLAUDE.md:20`) |
| 박스 화면의 BEST UNBOXINGS, RECENTLY UNBOXED | 없음 | 박스 화면에는 후기 줄(내 후기와 샘플)이 있다. 그 박스에서 나온 결과 목록은 없다. `/wins` 는 이 계정의 기록뿐이다 | `web/components/box/BoxScreen.tsx:176`, `web/components/box/WinsScreen.tsx:4-5` | 위와 같다. 실제 기록만 올린다(`web/components/box/WinsScreen.tsx:4`) |
| 아이템마다 확률, HIDE ROLL CHANCES | 일부 | 확률은 전부 공개하되 구성품 타일 옆이 아니라 화면 아래 "확률 요약", 구간별 확률, 접어 둔 상품별 확률, 상품 시트에 있다 | `web/components/box/BoxScreen.tsx:228-258,274` | 구성품의 사진과 이름 옆에는 확률을 적지 않는다(2026-10-12 파운더, `web/components/box/BoxScreen.tsx:228`). 어느 박스든 구성품과 확률을 열어볼 수 있어야 한다(`DESIGN.md:20`). 홈 카드에 최고 상품가와 배수를 적지 않는다(`DESIGN.md:85`) |
| 통계(가장 많이 연 박스, 가장 좋은 결과, 가장 운 좋았던 박스) | 없음 | 계정 화면은 잔액, 보관 중 개수, 배송 중 개수만 보여 준다 | `web/components/account/AccountScreen.tsx:49-56` | 통계는 행으로(`DESIGN.md:43`) |
| 보관함 STASH(현금과 아이템을 넣고 잠근다) | 없음 | VOILA 의 "보관함"은 받은 상품의 목록이다. 잔액이나 상품을 잠그는 기능은 없다 | `web/components/inventory/InventoryScreen.tsx:3-5` | |
| 카트(아이템 목록, SELL, ORDER) | 일부 | 보관함이 그 구실을 한다. 상품 하나씩만 처리하고 여러 개 고르기와 정렬, 검색은 없다 | C-7 | "통계 칸, 검색, 정렬 셀렉트, 여러 탭은 없다"(`web/components/inventory/InventoryScreen.tsx:4`) |
| 공정성 시드(CLIENT SEED 바꾸기, SERVER SEED 공개, FUTURE SERVER SEED) | 일부 | 개봉마다 미리 잠근 값, 공개된 값, 내 기기 값, 회차를 보여 주고 브라우저에서 다시 계산한다. 값을 직접 넣는 검증도 있다. 내 기기 값을 바꾸거나 서버 값을 바꾸는 화면은 없다(함수만 있다). 다음 서버 값의 해시를 미리 보여 주는 곳도 없다. 서버 값은 브라우저가 만들고 계속 같은 값을 쓴다 | C-10, `web/stores/fairStore.ts:51-55` | 어느 박스든 개봉 결과 검증을 열어볼 수 있어야 한다(`DESIGN.md:20`) |
| 추천(친구가 열 때마다 최대 10%), 프로모션 코드 5% | 없음 | 코드와 문구에 없다(검색으로 확인) | | |
| XP, LEVEL, BUY XP | 없음 | 없다 | | 등급과 희귀도는 색이 아니라 글과 크기로(`DESIGN.md:34`) |
| RACE 카운트다운 | 없음 | 옛 주간 랭킹 계산(`web/lib/ranking.ts`)만 남아 있고 연결돼 있지 않다 | A-4 | 재촉 타이머 금지(`DESIGN.md:14`) |
| 충전 수단(카드, Google Pay, 기프트 카드, 코인 여덟) | 일부 | USDT 세 네트워크뿐이다. 금액을 고르는 칸이 없고 주소로 보내면 반영된다 | C-1 | |
| 충전 실패 화면(거래 번호와 사유) | 없음 | 주소를 받지 못한 경우만 있다 | C-1 | |
| KYC 띠와 단계 | 없음 | 본인 인증 단계는 없다. 출금에는 인증 앱(없으면 이메일과 72시간 대기)이 조건이다 | `web/components/wallet/WithdrawScreen.tsx:154-164` | |
| 약관 다시 동의 창 | 없음 | 로그인 시트의 한 줄 "계속하면 약관과 개인정보 처리방침에 동의합니다."뿐이다 | `web/components/flow/LoginSheet.tsx:110` | |
| 기록(TRANSACTIONS, TOP-UPS, GAME HISTORY, DELIVERIES) | 일부 | 지갑 내역 하나에 충전, 열기, USDT로 받기, 출금, 보너스, 환불이 섞여 있다. 개봉 기록은 `/verify` 의 목록, 배송은 보관함의 배송 알약 | `web/components/wallet/WalletScreen.tsx:66,107-118`, `web/components/verify/VerifyScreen.tsx:78-87` | |
| DEALS(상품을 골라 값을 정해 건다), BATTLES, BLACK MARKET, FREE DROP | 없음 | 없다. 홈의 검색은 상품을 찾아 그 박스로 보내 줄 뿐이다 | `web/components/box/BoxList.tsx:86-99` | "어느 박스든 상품을 바로 사는 것은 아닙니다"(`web/messages/v.ko.json:77`) |
| 출금 확정 창의 카운트다운("46초 안에 확인") | 없음 | 확인 화면에 시간 제한이 없다 | `web/components/wallet/WithdrawScreen.tsx:166-178` | 재촉 타이머 금지(`DESIGN.md:14`) |

값으로 견준 것(사실만):
- 상품을 잔액으로: HypeDrop 100%, VOILA 95%.
- 상품을 코인으로: HypeDrop 은 아이템째 출금에 2%(견적 비율 0.981). VOILA 는 95%로 잔액이 된 뒤 고정 수수료 1.00 이나 0.50 USDT, 최소 20 USDT.
- 기대 비율: VOILA 새 박스는 참고가 기준 99%, 전부 USDT로 받으면 94.05%(화면에 두 줄로 적는다). HypeDrop 의 값은 영상으로 알 수 없다.
- 한 번 여는 시간: HypeDrop 7.5초, VOILA 0.84초(단추가 눌리기까지 1.19초).

## H. 확인하지 못한 것

1. 배포된 테스트 사이트에 `NEXT_PUBLIC_API_BASE` 가 들어 있는지(저장소 설정 값이라 볼 수 없다). 들어 있지 않으면 브라우저 계정 모드이고, 그때는 입금 주소를 받지 못하고 배송 신청이 실패한다는 것이 코드의 뜻이다. 실제 화면에서 눌러 확인하지는 않았다(개발 서버를 띄우지 않았다).
2. `DELIVERED` 상태가 어디서 생기는지. 클라이언트에는 그 상태로 바꾸는 코드가 없다.
3. 출금에서 이용 기준(입금액만큼 열기)과 부정거래 점수를 검사하지 않는 것이 의도인지. 계산과 테스트는 남아 있고 화면에서 부르는 곳만 없다.
4. `v.*.json` 에 금지어 검사를 걸지 않은 것이 의도인지.
5. `plan.before.json`(옛 화면 100개 항목)이 지금의 새 화면에서 도는지.
6. 로그아웃 뒤의 "로그아웃했습니다."가 실제 화면에 뜨는지. 코드로는 그리는 곳이 없지만 눌러 보지 않았다.
7. 후기 샘플에 표시가 없는 것이 의도인지. 파일 머리말은 "정식 서비스 전이라 샘플로 채운다"고 적는다.
8. `UI_INVENTORY.md`, `qa/PROGRESS.md`, `PRODUCTS.md`, `opening/DECISIONS.md` 는 다 읽지 않았다. 이 문서의 규칙 인용은 `DESIGN.md`, `opening/STATE.md`, `catalog/BOX_PLAN.md` 0-1과 0-2, `CLAUDE.md` 앞 120줄에서만 왔다.
9. `npx tsc --noEmit`, `npm run build`, `lint:design:all`, `catalog:check` 는 돌리지 않았다.
