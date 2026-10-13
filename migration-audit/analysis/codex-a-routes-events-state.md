# Codex A: 라우트, 이벤트, 상태와 기능 동등성 독립 분석

## 0. 범위와 증거의 읽는 법

CX-F-001. Phase 1 독립 분석 전반부다. 기준 HEAD는 `63445c7fa094125bfb1c60d7fccd17dd4005c07d`다. 소스 수정, Git 변경 명령, 커밋, 푸시, 빌드는 하지 않았다. 다른 참여자의 분석 파일은 열지 않았다. 작성 대상은 이 파일 하나다. 조사 범위는 `web/app`, `web/components`, `web/lib`, `web/stores`, `web/i18n`, `web/messages`, `web/server`, `web/src`와 테스트 지도용 `web/tests`다.

이 문서의 기본 증거는 **코드에서 읽은 것**이다. 별도로 **직접 실행한 것**을 명시한 항목만 실행 증거가 있다. **짐작**은 재현하지 않은 환경과 동시성 결과를 뜻한다. 코드 확인은 배포 화면의 시각 동등성 확인과 다르다. 스크린샷은 모든 항목에서 미수집이다. 새 구현과의 대조는 이번 실행 범위에 없고, 현재 커밋의 동작을 명세한다. 기본 상태는 소스 확인됨이며, 도달 불가와 실행 확인 불가는 각각 적었다.

BRIEF를 먼저 읽고 AGENTS와 MISSION을 읽었다. 화면 의도 참고로 DESIGN, REDESIGN_BRIEF, qa/PROGRESS, CLAUDE를 읽었다. BRIEF의 기준 우선순위와 이번 사용자의 조사 전용 제한을 적용했다. 소스 주석이 실제 구현과 다르면 구현을 적었다. 예를 들어 `BoxScreen.tsx:106`의 실제 후기만 표시한다는 주석과 `BoxReviews.tsx:111`의 샘플 후기 추가는 다르다.

### 직접 실행한 것

| ID | 명령과 방법 | 결과와 한계 |
|---|---|---|
| CX-F-002 | `rtk git rev-parse HEAD`, `rtk git status --short` | HEAD 일치. 기존 미추적 감사 및 QA 파일 존재. 해당 내용은 조사에 사용하지 않음 |
| CX-F-003 | `web`에서 `rtk npm test` | 398개, 통과 397, 실패 0, 건너뜀 1, 취소 0. 1892.4255ms. Node의 저장소 부재 경고가 있음 |
| CX-F-004 | `web`에서 `rtk proxy npx tsc --noEmit --incremental false` | 종료 코드 0, 오류 출력 없음. 증분 캐시 쓰기를 끔 |
| CX-F-005 | `rtk proxy node`의 stdin 스크립트로 TypeScript AST import 및 JSX, 리스너, 타이머, 저장소 참조 분석 | 후반의 파일별 색인. 스크립트 파일은 만들지 않음. 동적 import와 프레임워크 진입점을 포함 |
| CX-F-006 | Node 메모리 Storage에 LAB_STORAGE_SHIM 적용 후 authStore storage 콜백 호출 | 접두어 있는 세션 삭제 이벤트 뒤 user 유지 true, 접두어 없는 동일 이벤트 뒤 false. `labSite.ts:19`, `authStore.ts:105` |
| CX-F-007 | 메모리 localStorage와 `browserAccountRequest`로 현재 UI가 보내는 요청 재현 | 사전 인증 없는 password/change 및 password-only closure 모두 credentials와 verification_required. shipping/request는 unavailable. 파일, 브라우저 저장소, 외부 HTTP, 실제 자금 호출 없음 |
| CX-F-008 | 메모리 wallet에 accountId 없는 open 거래 생성 후 WalletScreen의 필터 적용 | 전체 거래 1, 필터 결과 0. `opening.ts:109`, `WalletScreen.tsx:66` |
| CX-F-009 | 메모리 Storage가 지갑과 보관함의 쓰기만 조용히 무시하도록 설정 후 `createOpeningPurchase` 실행 | 결과 1개 반환, 메모리 보관함 1, 저장 보관함 0. probe는 성공해도 큰 장부 저장 성공은 보장하지 못함. `ledgerLock.ts:29`, `opening.ts:90` |
| CX-F-010 | 메모리 wallet 잔액 0에서 debitCrypto(30) 결과를 무시하고 대기 출금 거래 생성 후 syncWithdrawal(CANCELLED) | debit false, 취소 뒤 잔액 30. 현재 UI의 무시된 차감 결과와 환불 조합 재현. 실제 UI의 네트워크 경합 자체는 미실행 |
| CX-F-011 | Node fetch로 이미 실행 중인 `http://localhost:3002` 읽기 | `/ko` 200, `/ko/about` 200, 없는 box slug 404, 없는 legal doc 404, `/xx` 404, `/ko/dev/gallery` 200. dev 서버 결과이며 정적 배포 결과가 아님 |
| CX-F-012 | products와 legal 모듈을 메모리 하네스에서 로드해 길이 확인 | BOXES 334, HOME_BOXES 320, LEGACY_BOXES 14, 법률 문서 13. 박스 경로 1002, 법률 경로 39 |

CX-F-007의 첫 하네스는 tsx/cjs에서 account.ts의 확장자 없는 동적 import를 실행해 `ERR_MODULE_NOT_FOUND`를 반환했다. 이것을 제품 오류로 판정하지 않았다. 다음 하네스는 browserAccountRequest에 동일한 경로와 body를 직접 보내 위 결과를 얻었다. 테스트 1개 건너뜀은 `web/tests/freeOpens.test.ts:72`의 실물 전용 가입 박스에는 터짐 항목이 없다는 조건이다.

## 1. 라우트와 호출 관계

CX-R-019. 공통 조상은 `web/app/layout.tsx:43` → CurrencyHydrator와 locale layout이다. `web/app/[locale]/layout.tsx:68` → NextIntlClientProvider → MotionPreferences → LocaleHtmlLang, 페이지, AppFooter, AuthHost, LabBadge다. 각 페이지의 AppShell은 `components/shell/AppShell.tsx:43` → BrandLogo와 NAV, OfflineLine, SessionLine, 본문, 메뉴 Sheet, ChargeSheet, BalanceSheet, ToastHost를 그린다. 메뉴, 충전, 잔액, 로그인 시트는 닫혀 있을 때 DOM이 없다. 공통으로 auth, wallet, flow, currency를 사용하고 BalanceSheet 및 TakeSheet를 통해 inventory도 읽는다. AuthHost는 security를 복원한다. 아래 스토어 열은 이 공통 집합을 제외한 화면 자체의 주요 의존성이다.

페이지에 자체 generateStaticParams가 없으면 locale layout의 ko, en, zh 세 경로를 상속한다. 박스는 부모 locale마다 334개 slug를 반환해 총 1002개다. 법률 페이지의 함수는 한 호출에 locale과 doc 조합 39개를 반환한다. 부모 순회와 중복 반환이 있어도 고유 경로는 39개다. 빌드를 실행하지 않았으므로 export 산출물의 실제 파일 수와 배포 HTTP 응답은 확인 불가다.

| ID | 주소, 페이지 근거 | 본문 최상위와 주요 나무 | 추가 스토어 | 고유 정적 경로 |
|---|---|---|---|---|
| CX-R-001 | `/[locale]/`, `web/app/[locale]/page.tsx:8` | AppShell wide → BoxList → HeroBanner, 내부 BoxCard, Chips. HeroBanner → OpeningBox, canvas | inventory, HeroBanner의 auth와 wallet | 3 |
| CX-R-002 | `/about`, `web/app/[locale]/about/page.tsx:8` | AppShell → MovedScreen → ScreenHead, ButtonLink(`/guide`) | 없음 | 3 |
| CX-R-003 | `/account`, `web/app/[locale]/account/page.tsx:8` | AppShell → AccountScreen → Rows, 보안 Sheet와 TwoFactorSetup, NicknameSheet, PasswordSheet, CloseAccountSheet, Confirm | auth, wallet, inventory, security | 3 |
| CX-R-004 | `/box/[slug]`, `web/app/[locale]/box/[slug]/page.tsx:8` | AppShell wide → BoxScreen → BoxReviews와 ScrollRow와 후기 상세, ItemCard와 상품 Sheet, Confirm, TakeSheet, 단건 Opening 또는 다건 Reveal → TakeConfirm와 VerifySheet | auth, wallet, inventory, settings, openingJournal. 구매 모듈의 fair | 334 곱하기 3 = 1002 |
| CX-R-005 | `/community`, `web/app/[locale]/community/page.tsx:8` | AppShell → MovedScreen → 홈 ButtonLink | 없음 | 3 |
| CX-R-006 | `/community/board`, `web/app/[locale]/community/board/page.tsx:8` | AppShell → MovedScreen → 홈 ButtonLink | 없음 | 3 |
| CX-R-007 | `/dev/gallery`, `web/app/[locale]/dev/gallery/page.tsx:8` | 개발에서 AppShell → Gallery → kit 표본, Sheet, Confirm, Reveal, VerifySheet, ShipSheet, ChainRecordView | auth, flow, currency, toast | 후보 3. production에서는 notFound로 갤러리 접근 불가 |
| CX-R-008 | `/fairness`, `web/app/[locale]/fairness/page.tsx:8` | AppShell → MovedScreen → `/verify` ButtonLink | 없음 | 3 |
| CX-R-009 | `/guide`, `web/app/[locale]/guide/page.tsx:11` | AppShell → ScreenHead, Card 셋, GuideFees → Rows와 Row, TextLink | GuideFees의 currency | 3 |
| CX-R-010 | `/inventory`, `web/app/[locale]/inventory/page.tsx:8` | AppShell → InventoryScreen → 목록, 상품 Sheet, ShipSheet, VerifySheet, 작성용 flow/ReviewSheet, TakeSheet, TakeConfirm, 취소 Confirm | auth, inventory, community, takeLedger의 wallet | 3 |
| CX-R-011 | `/legal`, `web/app/[locale]/legal/page.tsx:8` | AppShell → LegalCenterScreen → ScreenHead, 문서 Link 목록 | 없음 | 3 |
| CX-R-012 | `/legal/[doc]`, `web/app/[locale]/legal/[doc]/page.tsx:8` | AppShell → LegalDocScreen → ScreenHead, 번역 본문 section, TextLink | 없음 | 13 곱하기 3 = 39 |
| CX-R-013 | `/profile`, `web/app/[locale]/profile/page.tsx:8` | AppShell → MovedScreen → `/account` ButtonLink | 없음 | 3 |
| CX-R-014 | `/reviews`, `web/app/[locale]/reviews/page.tsx:9` | AppShell wide → Suspense → ReviewsScreen → Chips, RatingBlock, ReviewCard, 조회용 box/BoxReviews의 ReviewSheet | useReviewCards의 auth와 inventory, usePublishedReviews의 community | 3. box query는 새 경로를 만들지 않음 |
| CX-R-015 | `/verify`, `web/app/[locale]/verify/page.tsx:9` | AppShell → Suspense → VerifyScreen → 기록 목록, 수동 Fields와 Chips, VerifyMethod, VerifySheet → ChainRecordView | auth, inventory | 3. query는 새 경로를 만들지 않음 |
| CX-R-016 | `/wallet`, `web/app/[locale]/wallet/page.tsx:8` | AppShell → WalletScreen → Rows, 거래 목록, 거래 Sheet, 출금 취소 Confirm | auth, wallet, flow | 3 |
| CX-R-017 | `/wallet/withdraw`, `web/app/[locale]/wallet/withdraw/page.tsx:8` | AppShell → WithdrawScreen → 보안 관문 Sheet와 TwoFactorSetup 또는 form, confirm, otp, email, done 중 하나, TakeSheet | auth, wallet, security, currency, inventory | 3 |
| CX-R-018 | `/wins`, `web/app/[locale]/wins/page.tsx:8` | AppShell → WinsScreen → 목록과 상세 Sheet, VerifySheet | auth, inventory, wallet | 3 |

CX-R-020. 루트 페이지는 React 훅이 아니라 파싱 즉시 실행하는 인라인 스크립트다. 저장된 `gachaflix.locale`이 유효하면 우선, 없으면 navigator.language의 ko와 zh 접두어, 그 외 en을 고른다. location.replace는 `./언어/`로 보낸다. JS 없는 폴백은 meta refresh의 `./ko/`다. JS가 예외면 en이다. 근거 `web/app/page.tsx:7`, `:12`. locale 내부 URL은 사용자의 저장 선택보다 URL이 우선이며 자동 언어 이동을 하지 않는다.

CX-R-021. 루트 layout은 HTML lang을 ko로 출력하고 Pretendard를 설정한다. locale mount 뒤 `components/layout/LocaleHtmlLang.tsx`가 lang을 해당 언어로 바꾼다. head의 LAB_STORAGE_SHIM이 다른 앱 스크립트보다 먼저 Storage.prototype을 감싼다. localStorage와 sessionStorage의 getItem, setItem, removeItem, key, clear에 `voila-test-aresjoo:`를 붙인다. clear는 이 접두어의 키만 지운다. length는 원래 전체 길이여서 key와 length의 의미가 완전히 같지는 않다. 직접 property 할당과 StorageEvent.key는 감싸지 않는다. QuotaExceededError는 경고와 커스텀 이벤트로 바꾸고 쓰기를 누락시킨다. 근거 `web/app/layout.tsx:45`, `:48`, `web/lib/labSite.ts:17`, `:19`.

CX-R-022. 유효한 직접 URL은 파일을 가져온 뒤 저장소 복원 전의 기본 화면을 먼저 그린다. 인증이 필요한 inventory, account, wallet, withdraw, wins와 검증의 내 기록은 skeleton → 세션 복원 → 로그인 안내 또는 사용자 자료로 바뀐다. /box와 홈은 공개 열람 가능하다. 주소만 열어서는 구매나 입금 정산을 임의로 만들지 않는다. 예외는 세션 복원 뒤 AuthHost가 첫 로그인 보너스 10000과 무료 개봉 2회를 지급하는 기존 구현이다. 근거 `AuthHost.tsx:25`, `:32`, `walletStore.ts:16`, `:19`.

CX-R-023. 없는 slug는 `box/[slug]/page.tsx:11`, `:16`, 없는 doc는 `legal/[doc]/page.tsx:11`, `:15`, 없는 언어는 `[locale]/layout.tsx:17`, `:63`에서 제외된다. 개발 서버의 404는 직접 실행으로 확인했다. 정적 export에는 요청시 slug를 계산하는 서버와 middleware가 없으므로 없는 경로의 파일도 생성되지 않는다. 어떤 404 HTML을 호스트가 반환하는지와 깊은 직접 URL의 fallback은 이번 실행에서 확인 불가다.

CX-R-024. locale not-found는 StateScreens의 NotFoundScreen과 AppShell을 사용한다. 루트 not-found는 v 메시지 3벌을 직접 가져오고 pathname에 언어가 있는지 mount 뒤 찾는다. 복귀 링크가 `href="/" + lang`여서 GitHub Pages basePath를 붙이지 않는다. 깊은 404에서 호스트 루트 `/ko`로 빠질 위험이다. 근거 `web/app/[locale]/not-found.tsx:5`, `web/app/not-found.tsx:14`, `:23`. production fallback 화면과 JS 없는 언어는 미실행, 위험 판정은 짐작이다.

## 2. 사용 코드와 도달 불가 UI

CX-U-001. import 그래프의 진입점은 모든 app 페이지, layout, error, not-found와 프레임워크가 지정한 `web/i18n/request.ts`다. 정적 import, export from, 문자열 dynamic import를 해석하고 `@/` 및 상대 경로를 파일로 풀었다. `account.ts:110`의 browserAccount는 실제 도달 코드다. type-only 의존성은 런타임과 분리했다. `i18n/request.ts:12`의 템플릿 import는 ko/en/zh와 v 세 벌을 명시적으로 포함했다. 후반의 그래프 표는 각 미도달 파일과 직접 importer의 파일 및 줄을 전부 싣는다. 파일이 import되었다는 것과 실제 UI가 그려진다는 것은 구분한다.

| ID | 소스에 있지만 현재 흐름에서 닿지 않는 UI | 근거와 현재 대체 경로 |
|---|---|---|
| CX-U-002 | NetflixHome, CommerceHome | `web/app/[locale]/page.tsx:3`, `:8`은 BoxList만 호출. 두 파일에 app부터 이어지는 경로 없음 |
| CX-U-003 | HallOfFame, home/ProofFeed, fairness/ProofFeed, LiveTicker, LiveCounters, JackpotPoolBadge | 옛 홈이나 독립 파일에만 남음. 현재 홈과 wins는 이들을 호출하지 않음. `BoxList.tsx:79`, `WinsScreen.tsx:23` 이하 |
| CX-U-004 | home/HotBoxes, inventory/HotBoxes, DailyFreeBox, AboutBanner, DiscoveryGuide, QuickTabs, LiveReviewsSection | 옛 홈 계열만 importer. 무료 개봉의 현재 진입점은 HeroBanner와 wallet.freeOpens이고 DailyFreeBox의 24h 무료 보상과 다름. `HeroBanner.tsx:184`, `opening.ts:47` |
| CX-U-005 | unboxing/UnboxingRoulette, BulkOpenModal, AutoplaySettingsModal, VaultGateFX, MegaWinFX, UpgradeFX | app에서 연결 없음. 현재 단건은 Opening, 다건은 Reveal. 50개 및 100개도 별도 옛 BulkOpenModal을 부르지 않음. `BoxScreen.tsx:319`, `:320` |
| CX-U-006 | box/BoxCard.tsx, DetailModal, ProductArt, TierStrip | 홈의 BoxCard는 별도 파일이 아니라 `BoxList.tsx:116`의 내부 함수. 상세는 BoxScreen. 옛 상세 모달과 상품 그림 부품은 미도달 |
| CX-U-007 | components/about의 7개 파일 | /about은 MovedScreen. VaultHero, ImpactStats, TrustScenes, GlobalLiveFeed, LineupShowcase, IsometricStage, AboutSections는 현재 렌더되지 않음. `about/page.tsx:8` |
| CX-U-008 | CommunityBoard, BoardComposer, CommunityNavigation, ReviewFormModal | /community와 /community/board는 홈 안내. 작성은 `InventoryScreen.tsx:182`의 flow/ReviewSheet |
| CX-U-009 | AuthModal, HeaderAuthControl, AvatarSettings, NicknameSettings, PasswordChangeFlow, AccountClosureFlow, SecuritySettings, ProviderMarks, ProfileAvatar, LoginRequired | 현재 호스트는 LoginSheet, 계정은 AccountSheets. 옛 password와 closure UI의 충실한 순서를 테스트해도 새 UI 보장은 아님. `AuthHost.tsx:50`, `AccountScreen.tsx:78` |
| CX-U-010 | VisualVerifier, VisualVerifyModal, FairnessVerifier, HashExplainer | 현재 검증은 VerifyScreen과 VerifySheet. verifyRecord 순수 모듈만 실제 사용. `VerifySheet.tsx:14`, `:43` |
| CX-U-011 | DepositModal, WithdrawalModal, HistoryTab, UsdtDepositTab, WithdrawTab, WithdrawSteps | 현재 WalletScreen, ChargeSheet, WithdrawScreen. 옛 내역의 1초 countdown과 현재의 60초 갱신은 다름. `WalletScreen.tsx:64` |
| CX-U-012 | DeliveryModal, TrackingModal, CancelShipmentModal, SellConfirmModal, ShippingTicker | 현재 보관함은 ShipSheet와 단일 상품 Sheet, 취소 Confirm. `InventoryScreen.tsx:180`, `:186` |
| CX-U-013 | SiteHeader, Footer, MobileBottomNav, LanguageSelector, CurrencySelector, LegalNav, PolicyNotice, Money, Approx | 새 AppShell과 AppFooter에서 호출 안 함. 통화는 useCurrency.fmt, locale는 AppFooter Link. 옛 LanguageSelector의 저장 코드도 실행 안 됨 |
| CX-U-014 | 개발 Gallery의 chain pending, confirmed, mismatch, error 표본 및 가짜 ownedId | 개발에서만 접근. production route guard가 notFound. fixture는 사용자 기록이 아님. `Gallery.tsx:33`, `:59`, `dev/gallery/page.tsx:8` |

CX-U-015. server/state와 server/rng는 app API 라우트가 없고 어떤 app import 경로에도 없다. lib/engine, lib/data, lib/catalog, lib/rng와 lib/i18n은 옛 엔진 계열이며 현재 구매는 lib/opening과 products를 쓴다. web/src/data/gachaItems도 현재 UI와 무관한 별도 데이터다. tests/engine, gachaItems가 통과해도 현재 BoxScreen의 UI를 보장하지 않는다. 파일별 정확한 importer는 후반 그래프 색인에 적었다.

CX-U-016. 현재도 사용하는 옛 이름의 모듈이 있다. lib/autoplay는 OPEN_PRESETS 때문에 사용하나 autoplay 실행 UI는 미도달이다. dailyStore와 telemetryStore는 CurrencyHydrator가 복원하므로 모듈은 도달하나 현재 사용자의 recordSpin 또는 daily.record 경로는 없다. lib/liveDrops와 proofFeed는 type-only 계약과 옛 소비자에 등장하는 것을 런타임과 분리해야 한다. lib/heroBall은 HeroBanner에서 실제 호출한다. lib/browserAccount는 동적 import다. 미사용 파일을 단순히 같은 이름의 테스트나 주석으로 판단하면 잘못된다.

## 3. 이벤트와 비동기 작업

아래는 현재 화면별 기능 해석이다. 후반의 전수 색인은 미도달 코드까지 포함해 모든 JSX `on*` 속성, 리스너 등록과 해제, 타이머와 취소, observer, effect를 개별 위치로 적는다. 단추의 클릭뿐 아니라 custom onConfirm, onClose, onTaken과 애니메이션 완료 콜백도 포함한다. 사용자 클릭이 데이터 변화 없이 이동만 하면 그렇게 적었다. 네이티브 details 토글과 터치 스크롤은 별도 React 핸들러 없이 브라우저가 처리한다.

| ID | 화면과 사건 | 호출, 상태 및 저장 변화 | cleanup과 근거 |
|---|---|---|---|
| CX-I-001 | AppShell 잔액, 로그인, 모바일 메뉴 클릭 | openBalance, openAuthModal, openMenu. 메뉴 Link 클릭 closeMenu. flow와 auth 메모리 상태만 변화 | UI 시트는 useModal로 정리. `AppShell.tsx:52`, `:62` |
| CX-I-002 | OfflineLine online/offline, SessionLine 로그인 | navigator.onLine로 offline setState. 세션 소실은 login modal 열기 | online/offline 해제 있음. `StateScreens.tsx:42`, `:48` |
| CX-I-003 | AppFooter 언어 Link, 표시 통화 클릭 | 현재 pathname에 locale만 교체. currency USD와 KRW 토글 및 persist | 타이머 없음. query/hash와 언어 저장은 보존 안 함. `AppFooter.tsx:61`, `:62` |
| CX-I-004 | 홈 검색, 분류, 더 보기 | query, category, shown. 24개씩 늘림. search 최대 30행. 최근 개봉순은 inventory에서 파생 | 저장 안 함. `BoxList.tsx:65`, `:85`, `:102`, `:106` |
| CX-I-005 | HeroBanner 가입 또는 무료 박스 Link | 비로그인 openAuth(signup), 로그인 박스 주소로 이동 | media query, observer, phase timeout, resize, RAF 전부 반환 cleanup. `HeroBanner.tsx:58`, `:65`, `:72`, `:88`, `:185` |
| CX-I-006 | 박스 대표 상품과 별점 클릭 | getElementById 후 smooth scroll. 구성품 클릭 itemId, 국가 및 다른 박스 비교 클릭 countries/comparing | 저장 안 함. `BoxScreen.tsx:176`, `:180`, `:281`, `:296`, `:300` |
| CX-I-007 | 박스 수량 Chips, 열기, 큰 금액 확인 및 취소 | qty와 failed, press와 open, synchronous opening ref, reducer. 구매만 wallet/inventory/fair에 기록 | 비동기 open에 언마운트 guard 없음. `BoxScreen.tsx:140`, `:160`, `:203`, `:316` |
| CX-I-008 | 로그인 전 또는 잔액 부족 개봉 클릭 | 로그인, 충전 또는 held TakeSheet를 열고 구매는 하지 않음 | 기존 화면과 qty 유지. `BoxScreen.tsx:205`, `:207` |
| CX-I-009 | 단건 연출 timeout, 건너뛰기, Escape | phase anticipation → impact → exit → reveal → ready. skip은 flow SKIP. 보여준 순간 journal.markSeen | timeout 해제, soundStop, modal 해제 있음. arm 350ms. `Opening.tsx:119`, `:127`, `:140` |
| CX-I-010 | 단건 결과 USDT 받기 확인, 자동 받기, 재시도 | settleTake. settled일 때 taken와 settle, wallet/inventory 저장. 자동은 reveal 뒤 한 번 및 계정별 설정 | alive guard 있음. onFlow는 guard보다 먼저 호출. `Opening.tsx:154`, `:167`, `:195` |
| CX-I-011 | 단건 설정 클릭, sound/short/autoTake 변경 | settings 시트. device openSound/openShort 저장. 계정별 autoTakeBy는 켤 때 별도 확인 | 현 연출 timeline은 mount 설정 고정. `Opening.tsx:95`, `:213`, 아래 OpeningSettings 함수 |
| CX-I-012 | 다건 연출, skip, 결과 행과 단건 받기 | done와 armed, picked와 taking, settleTake, taken map. batch fresh 또는 held 열기 | 연출 timeout 해제. take의 응답은 unmount 및 계정 guard 없음. `Reveal.tsx:70`, `:74`, `:82`, `:127`, `:142` |
| CX-I-013 | TakeSheet 행 및 전체 선택, 제출과 취소 | Set picked, step pick → confirm. quote는 상품마다 반올림. cancel은 pick으로만 | 저장 없음. `TakeSheet.tsx:115`, `:167`, `:191`, `:197` |
| CX-I-014 | TakeSheet 확인, retry, focus/visibility | settleTakeMany, mergeOutcomes, generation와 requester 확인, outcome. reviewTakeMarks는 지급 없이 저장 상태 대조 | 리스너 해제 있음. generation은 open/account 변화에 증가하지만 실제 unmount cleanup은 없음. `TakeSheet.tsx:40`, `:92`, `:123` |
| CX-I-015 | ChargeSheet 네트워크, 주소 재요청, 복사 | network, attempt. clipboard와 새 toast. 입금 확인되면 closeCharge | 주소 응답 alive와 polling active guard 및 timeout 해제. `ChargeSheet.tsx:31`, `:45`, `:56`, `useUsdtDeposit.ts:28`, `:45` |
| CX-I-016 | LoginSheet form submit, email/password/code 입력 | submit preventDefault, run 잠금. login/signup/verify/recover/reset. 세션 수락, mode, step 변화 | 응답 generation 검사 일부 있음. catch/finally와 resend setCode는 세대 검사 없음. unmount cleanup 없음. `LoginSheet.tsx:35`, `:41`, `:51`, `:108` |
| CX-I-017 | 소셜 로그인, 뒤로, 가입 및 복구 전환 | beginSocialLogin. 브라우저 계정이면 acceptSession, HTTP면 검증된 공급자 URL assign. back은 generation 증가 | busy일 때 전환 막음. `LoginSheet.tsx:71`, `:78` |
| CX-I-018 | 보관함 상태 Chips와 더 보기, 행 선택 | tab, shown 30개씩, openId. take/ship/verify/review subflow 상태 | 배송 polling interval 해제만 있고 응답 active guard 없음. `InventoryScreen.tsx:61`, `:117`, `:128`, `:138` |
| CX-I-019 | 보관함 단건 받기, 배송 취소 | settleTake 또는 cancelShipment. 성공시 상세 닫기와 done/held 탭 | take와 cancel 모두 unmount guard 없음. busy state만 사용. `InventoryScreen.tsx:89`, `:96`, `:186` |
| CX-I-020 | ShipSheet 국가 및 주소 입력, 신청, 확인 | form, touched, confirming. requestShipment와 서비스 응답에 따라 wallet/inventory 변경 | busy state만 사용, 계정 고정과 응답 세대 guard 없음. lastAddress는 open 때만 snapshot. `ShipSheet.tsx:35`, `:49`, `:51`, `:52` |
| CX-I-021 | 작성 ReviewSheet 별점, 글, 사진, 보내기 | rating/text/photo, shrink canvas, community.add. bonus 0. onDone 닫기 | Blob URL finally revoke. 이미지 완료 후 unmount/선택 세대 guard 없음. `ReviewSheet.tsx:17`, `:40`, `:45`, `:56` |
| CX-I-022 | 후기 카드 및 박스별 Chips | 조회용 ReviewSheet 열기. picked 필터. useReviewCards의 실제 자료와 샘플 자료로 평균 | ResizeObserver 없이 text 변경 때만 잘림 측정. query 초기값만 읽음. `BoxReviews.tsx:96`, `:126`, `:130`, `ReviewsScreen.tsx:22`, `:34` |
| CX-I-023 | VerifySheet record 변경, 방식 펼치기, 수동 화면 Link | verifyOpeningRecord, outcome checking/done/failed, method. 저장 없음 | alive guard 있음. `VerifySheet.tsx:39`, `:88`, `:89` |
| CX-I-024 | VerifyScreen URL query, 입력 및 박스 Chips, compute | seed/hash/client/nonce/box, DOM scroll. hash와 HMAC 병렬 계산, manual 결과 | compute는 busy state만, 최신 입력 및 언마운트 guard 없음. `VerifyScreen.tsx:45`, `:57`, `:99` |
| CX-I-025 | WalletScreen 거래 행, 더 보기, 72h 취소 | openId, shown, cancelling. api.cancelWithdrawal 후 syncWithdrawal | polling active와 accountId guard 있음. cancel catch/finally는 unmount guard 없음. `WalletScreen.tsx:44`, `:64`, `:78`, `:111` |
| CX-I-026 | WithdrawScreen 네트워크, 주소, 금액, 25/50/100%, 제출 | form, native 통화 환산 amountUsdt, validateWithdrawal, requestId. confirm → otp/email | 계정 변화시 form으로. 입력값, received, taking, requestDraft는 전부 초기화되지 않음. `WithdrawScreen.tsx:69`, `:78`, `:82`, `:103`, `:238` |
| CX-I-027 | 출금 인증 submit, 이메일 발송 및 재발송 | verifyWithdrawalOtp 또는 sendWithdrawalEmail, verifyWithdrawalEmail 후 commit. 세 번 실패시 이메일 | stage.kind generation과 동기 잠금 있음. same-kind 계정 변경 및 unmount guard는 불완전. `WithdrawScreen.tsx:113`, `:137`, `:152`, `:159` |
| CX-I-028 | 출금 앞 묶음 받기 완료 | TakeSheet onTaken, withdrawPrefillUsdt, 새 crypto 몫만 금액 입력. 추가 수령시 누적 | 출금은 자동 시작 안 함. `WithdrawScreen.tsx:93`, `:94` |
| CX-I-029 | TwoFactorSetup 시작, QR 키 복사, form submit 및 숫자 입력 | beginTotpSetup, setup, confirmTotpSetup, security.accept, onEnabled | userId 확인 있음, 언마운트 guard 및 setup 계정 변경 reset 없음. `TwoFactorSetup.tsx:38`, `:48`, `:54`, `:57` |
| CX-I-030 | 계정 보안, nickname/password/close 행, 로그아웃 확인 | securing, sheet, leaving. logout은 원격/브라우저 세션 종료 뒤 user null | leave catch 없음, rejection은 UI에 표시되지 않음. `AccountScreen.tsx:37`, `:58`, `:62`, `:81` |
| CX-I-031 | NicknameSheet 저장, PasswordSheet 저장, CloseAccountSheet 확인 | auth.updateNickname, changeAccountPasswordWithOtp, deleteAccount. error와 busy, 성공시 닫기 | 사용자 ID와 open에 대한 응답 세대 guard 일부만 auth 내부에 있음. password/close는 부족. `AccountSheets.tsx:29`, `:57`, `:88` |
| CX-I-032 | Sheet/Confirm backdrop mousedown, X, Escape와 Tab | locked/busy이면 닫기 거절. useModal 최상위 stack만 키 처리, focus wrap, body overflow와 inert/aria-hidden 제어 | keydown과 RAF 해제, 원래 스타일/포커스 복원. `Sheet.tsx:14`, `:17`, `:34`, `useModal.ts:26`, `:69` |
| CX-I-033 | ScrollRow scroll, resize observer, 양옆 클릭과 네이티브 터치 | scrollLeft로 more prev/next. scrollBy 80% 또는 최소160px | scroll 해제, observer disconnect. `ScrollRow.tsx:20`, `:29` |
| CX-I-034 | ToastHost 2400ms, LabBadge storage-full | toast clear, LabBadge full state. authStore의 옛 toast는 별도 5000ms | 새 toast timer 해제. LabBadge 리스너 해제. 옛 auth toast는 해제 없고 현재 표시 호스트 없음. `toast.tsx:19`, `authStore.ts:73`, `LabBadge.tsx:24` |
| CX-I-035 | AuthHost mount, accountId effect, 모듈 storage/focus/visibility | rehydrateAuth, restoreBrowserAssets, welcome, freeOpens, security.refresh. 타탭 세션 검사 | 늦은 wallet hydration subscribe에 반환 cleanup 없음. auth 모듈 리스너는 HMR 전 cleanup만. `AuthHost.tsx:20`, `:25`, `:39`, `authStore.ts:96` |

### 정리가 없거나 조건부인 지점

CX-I-036. 현행의 장기 observer와 연출 타이머 자체는 대부분 cleanup이 있다. 단건 Opening의 phase effect 의존성 생략은 주석대로 해당 장면 snapshot을 유지하는 의도이고 새 round key로 재마운트한다. 이것만으로 낡은 값 버그라고 하지 않는다. `Opening.tsx:95`, `:152`, `BoxScreen.tsx:319`.

CX-I-037. AuthHost의 wallet.subscribe는 hydrated를 받았을 때만 unsubscribe한다. effect가 계정 변경 또는 언마운트로 끝나면 해제하지 않는다. 지연 복원 환경에서 과거 userId로 grant가 실행될 수 있다. 브라우저 기본 동기 복원에서는 잘 드러나지 않으며 지연 저장소와 연결 환경에서는 위험하다. `AuthHost.tsx:38`에서 `:46`. 현재 코드 확인, 실제 StrictMode 지연 재현은 확인 불가.

CX-I-038. InventoryScreen의 60초 배송 polling은 interval만 해제한다. 이미 시작한 api.shipping Promise가 나중에 다른 계정의 store에 markShipping을 할 수 있다. ID가 맞아야 실제 행을 변경하므로 모든 응답이 즉시 오염을 만드는 것은 아니다. `InventoryScreen.tsx:63`, `:68`. 지금 배포는 isLive false로 이 effect가 실행되지 않는다.

CX-I-039. flow/ReviewSheet의 shrink, AccountSheets의 저장들, VerifyScreen.compute, Reveal.take, BoxScreen.open, InventoryScreen.take/cancel, WalletScreen.cancel, ShipSheet.submit, TwoFactorSetup prepare/submit은 렌더가 끝나도 Promise의 로컬 setState와 콜백을 막는 alive guard가 없거나 계정만 검사한다. React 18에서는 경고 유무가 안전성 증거가 아니다. 화면의 다음 대상에 이전 응답이 적용되는지 각 흐름에 적었다. TakeSheet의 generation 역시 unmount에서는 증가하지 않는다. `TakeSheet.tsx:92`, `:133`.

CX-I-040. lib/takeBatch의 재확인 2000ms timeout은 저장소 복구용 모듈 작업이고 UI setState를 직접 하지 않으므로 무조건 언마운트 때 없애야 하는 연출 타이머는 아니다. `takeBatch.ts:406`. 반면 도달 불가 UI에도 무취소 timer가 남아 있다. `fairness/ProofFeed.tsx:97`, `wallet/HistoryTab.tsx:140`, `UsdtDepositTab.tsx:71`, `WithdrawTab.tsx:133`, `BulkOpenModal.tsx:114`, `UnboxingRoulette.tsx:301`, `:304`, `DailyFreeBox.tsx:128`다. 재연결한다면 복귀 뒤 setState와 effect 소리를 별도 검증해야 한다.

CX-I-041. lib/audio의 visibilitychange 익명 리스너는 모듈 수명이고 remove 경로가 없다. 옛 언박싱에서만 runtime 도달하므로 현재 페이지 누수로 단정하지 않는다. `audio.ts:340`. VisualVerifier 다운로드의 1초 URL revoke는 UI 상태와 무관하며 늦더라도 리소스를 해제하는 필요한 작업이다. `VisualVerifier.tsx:67`. 자세한 등록과 해제 위치는 전수 색인에 있다.

CX-I-042. BalanceSheet는 로그인 전에는 원래 시트를 닫고 LoginSheet를 연다. held가 있으면 TakeSheet로 같은 자리를 바꾸고, 없으면 charge로 교체한다. 출금과 내역 Link는 balance를 닫고 이동한다. taking은 balance가 닫힐 때 false로 정리한다. 자료 변경은 TakeSheet와 ChargeSheet에 맡긴다. 근거 `web/components/flow/BalanceSheet.tsx:34`, `:39`, `:52`, `:55`.

CX-I-043. WinsScreen은 inventory를 mount 때 다시 복원하고 실제2배 이상 기록만 보여 준다. 로그인 단추, 기록 상세 setDetailId, 더 보기 shown 증가, verify로 VerifySheet를 연다. 생성/취소/판매 액션은 없다. 근거 `web/components/box/WinsScreen.tsx:41`, `:59`, `:74`, `:88`, `:109`.

CX-I-044. LegalCenterScreen, LegalDocScreen, GuideFees와 MovedScreen에는 자료를 바꾸는 핸들러가 없고 Link와 읽기 본문만 있다. 오류 화면의 reset만 Next가 준 재렌더 callback이다. details 확률 표는 네이티브 토글이다. 근거 `web/components/legal/LegalCenterScreen.tsx:1`, `web/components/legal/LegalDocScreen.tsx:1`, `web/components/shell/MovedScreen.tsx:1`, `web/components/shell/StateScreens.tsx:29`, `web/components/box/BoxScreen.tsx:278`.

## 4. 상태 관리와 저장소

아래 모든 영속 키는 물리 저장소에서 `voila-test-aresjoo:`로 시작한다. `v0`는 persist version을 생략했을 때의 기본값이며 migrate가 없다는 뜻이다. 기본 persist는 모두 skipHydration을 사용한다. usePublishedReviews는 훅이며 별도 zustand store가 아니다. ui/toast도 zustand라 같이 포함한다.

| ID | 스토어, 키와 partialize | 버전과 복원 | 액션과 현재 주요 독자 및 작성자 |
|---|---|---|---|
| CX-F-020 | authStore, `voila-test-aresjoo:voila-auth-v1`, user는 null만 저장 | v0. merge도 user null. 실제 세션은 account/session. `authStore.ts:77` | openAuthModal, closeAuthModal, setModalMode, acceptSession, clearSession, logout, markSessionLost, updateNickname, checkNicknameAvailability, updateAvatar, refreshAccount, setPasswordFailures, pushToast, clearToast. LoginSheet/AuthHost/계정 및 보호 화면. :11, :23 |
| CX-F-021 | walletStore, 초기 `voila-test-aresjoo:gachaflix.wallet`, 로컬 전환 뒤 `voila-test-aresjoo:voila.browser-wallet.<id 또는 guest>` | v4. balance, cryptoBalance, cardBalance, transactions, settledDepositRefs, welcomeClaimed, 세 입금 누계, totalWagered, burst, freeOpens, freeOpensGranted. `walletStore.ts:260` | addTransaction, setTransactionStatus, settleDeposit, syncWithdrawal, cancelHeldWithdrawal, debit, debitSplit, debitCrypto, credit, creditSplit, topUp, setWelcomeAccount, claimWelcome, setBurst, claimWelcomeBoxes, spendFreeOpens. 구매, claim, depositCredit, WithdrawScreen, WalletScreen, AuthHost, TakeSheet, Opening. :83, :135 |
| CX-F-022 | inventoryStore, 초기 `voila-test-aresjoo:gachaflix.inventory`, 로컬 전환 뒤 `voila-test-aresjoo:voila.browser-inventory.<id 또는 guest>`, items | v0, migrate 없음. :149 | add, sell, requestShipping, cancelShipping, markShipping, sweepExpired. sweepExpired는 아무 것도 하지 않음. 구매 및 claim, InventoryScreen, VerifyScreen, BoxList, 후기, wins. :68 |
| CX-F-023 | fairStore, `voila-test-aresjoo:gachaflix.fair`, serverSeed, serverSeedHash, clientSeed, nonce | v0. CurrencyHydrator 복원 후 ensureSeeds. :63 | ensureSeeds, rotateServerSeed, setClientSeed, takeNonce. 현재 opening이 seed와 nonce를 사용. 옛 FairnessVerifier의 seed 변경 UI는 미도달. 계정별 분리 아님. :40 |
| CX-F-024 | currencyStore, `voila-test-aresjoo:gachaflix.currency`, currency만 | v0, rates 미저장. 기본 USD, 예전 USDT를 USD로 교체. :36, :43 | setCurrency, setRates. AppFooter 쓰기, useCurrency 통한 전체 화면 읽기. rates는 기본 USDT1, USD1, KRW1380. :21 |
| CX-F-025 | settingsStore, `voila-test-aresjoo:gachaflix.settings`, muted, openSound, openShort, autoTakeBy, lastReceiveBy | v0, migrate 없음. :44 | toggleMuted, setOpenSound, setOpenShort, setAutoTake, setLastReceive. 현재 OpeningSettings가 sound/short/autoTake 사용. sound와 short는 기기별, autoTake 및 lastReceive는 계정 ID map. lastReceive 설정 UI는 현재 없음. :29 |
| CX-F-026 | dailyStore, `voila-test-aresjoo:gachaflix.daily`, lastOpenedAt, history 최대30 | v0, migrate 없음. :37 | record. CurrencyHydrator 복원만 현재 도달, DailyFreeBox 소비자는 미도달. :30 |
| CX-F-027 | communityStore, `voila-test-aresjoo:gachaflix.community`, mine | v0, migrate 없음. :57 | add, update, remove, hasReviewed. add/update/remove는 선행 직접 쓰기 후 set. 실제 작성은 flow/ReviewSheet, 조회는 usePublishedReviews와 BoxReviews. 계정별 키 아님. :20, :29 |
| CX-F-028 | openingJournal, `voila-test-aresjoo:voila.opening-journal`, seen | v0. 최근400개 seen, 미확인 window 7일. :20, :36 | markSeen. BoxScreen에서 직접 rehydrate, 결과 onRevealed에서 작성. UUID openingId라 계정 공용 seen이어도 보통 ID 충돌은 없음. :29, :50 |
| CX-F-029 | telemetryStore, `voila-test-aresjoo:gachaflix.telemetry`, spinTimes 최근60 | v0. :27 | recordSpin, clear. CurrencyHydrator가 읽지만 현재 Opening은 recordSpin을 부르지 않음. 미도달 UnboxingRoulette가 쓰던 자료. :23 |
| CX-F-030 | securityStore, 저장 키와 partialize 없음 | 메모리. userId에 귀속, service로 refresh. :14 | reset, refresh, accept. AuthHost/AuthStore/AccountScreen/WithdrawScreen/TwoFactorSetup. 늦은 응답의 id 검사를 수행. :17 |
| CX-F-031 | flowStore의 useFlow, 저장 없음 | 메모리, 페이지 재로드시 닫힘. :22 | openCharge/closeCharge, openMenu/closeMenu, openBalance/closeBalance. AppShell와 각 진입점 |
| CX-F-032 | uiStore, 저장 없음 | 메모리, 모듈은 미도달. :18 | openDeposit/closeDeposit/setDepositHost. 현재 소비자 없음 |
| CX-F-033 | ui/toast의 useToast, 저장 없음 | text/id 메모리. :10 | show, clear. ChargeSheet, TwoFactorSetup, ToastHost, Gallery. authStore.toast와 별도 |

CX-F-034. wallet migrate는 v0 PROCESSING을 BROADCASTING으로, v3 미만 잔액을 crypto/card로 나누고, v4 미만 입금 누계를 과거 거래에서 계산한다. v2 미만 totalWagered도 재계산한다. `walletStore.ts:266`에서 `:290`. v4 미만 입금 합산은 PENDING, CANCELLED, FAILED를 제외하지 않아 과거 미확정 입금까지 totalDepositedCrypto에 포함할 수 있다. 평상시 addTransaction과 setTransactionStatus는 확정 입금만 센다. `:163`, `:275`. 현재 새 WithdrawScreen은 이 rollover 누계를 관문으로 읽지 않고 옛 WithdrawTab만 읽는다. 당장 새 출금 UI 차단으로 단정하지 않는다.

### 직접 Storage를 읽고 쓰는 모든 위치

아래는 persist의 storage factory를 제외한 직접 접근이다. `takeBatch`는 Storage 객체를 반환한 뒤 getItem/setItem/removeItem을 호출하므로 문자 검색만으로 놓치기 쉽다.

| ID | 위치 | 종류, 키, 동작과 실제 도달 여부 |
|---|---|---|
| CX-F-035 | `web/app/page.tsx:7` | localStorage gachaflix.locale 읽기, 루트 언어 결정. 현재 실행 |
| CX-F-036 | `components/auth/AuthHost.tsx:22` | localStorage voila-security-v1 삭제. 옛 비계정별 2FA secret 제거. 현재 실행 |
| CX-F-037 | `components/auth/NicknameSettings.tsx:15`, `:27`, `:29`, `:31` | localStorage voila.nickname-updated-at.v1 변경 시각 map 읽기와 쓰기. 키 선언은 NicknameSettings.tsx:9. 현재 미도달 |
| CX-F-038 | `components/community/BoardComposer.tsx:14`, `:36`, `:47`, `:56` | sessionStorage voila.board-draft.<userId>.<editingId 또는 new> 읽기, 자동 임시 저장, 성공 및 버리기 삭제. 키 선언은 BoardComposer.tsx:12. 현재 미도달 |
| CX-F-039 | `components/layout/LanguageSelector.tsx:14` | localStorage gachaflix.locale 쓰기. 현재 미도달. AppFooter는 이를 쓰지 않음 |
| CX-F-040 | `lib/account.ts:211` | localStorage voila.account-revocation.v1에 accountId/at/nonce 쓰기. 비밀번호 변경과 새 인증 코드 탈퇴 성공때 호출 |
| CX-F-041 | `lib/boardApi.ts:7`, `:10`, `:11`, `:31` | localStorage voila.community-board.v1와 voila.community-board.v1.examples.v1 읽기와 쓰기. 키 선언 boardApi.ts:3, :4. 현재 UI 미도달 |
| CX-F-042 | `lib/browserAccount.ts:9`, `:27`, `:28`, `:74`, `:101`, `:110`, `:119`, `:133`, `:136`, `:137`, `:248`, `:254` | localStorage voila.browser-accounts.v1와 voila.browser-session.v1. 계정, salt/hash, 보안 challenge, TOTP, 증명, 입금 영수증, 출금 요청을 계정 배열에 보관. 세션 키에 현재 ID 쓰기/삭제. 실제 사용 |
| CX-F-043 | `lib/browserAccount.ts:58`, `:59`, `:175` | 계정별 browser-wallet와 browser-inventory 원문 읽기. 탈퇴 자산 재확인 및 입금 중복 검사 |
| CX-F-044 | `lib/browserWallet.ts:10` | 계정별 wallet/inventory의 `.state`만 직접 읽기. 오류면 빈 값. 이름 전환 뒤 초기 state와 병합해 저장 |
| CX-F-045 | `lib/ledgerLock.ts:29` | localStorage voila.ledger-probe 시험 쓰기, 다시 읽고 삭제. 돈 작업 전에 사용 |
| CX-F-046 | `lib/takeBatch.ts:63` | sessionStorage voila.opening.fault 읽기. production에서는 반환 null. dev fault는 구매 실패, 받기 failed/pending/partial/unknown 주입에 사용 |
| CX-F-047 | `lib/takeBatch.ts:103`, `:107`, `:131`, `:137`, `:248` | localStorage `voila.take-unconfirmed.<현재 wallet persist name>` 확인대기 표시 읽고 쓰고 삭제. 저장된 persist storage의 getItem으로 실제 두 장부 직접 대조. Storage 없으면 메모리 map |
| CX-F-048 | `stores/communityStore.ts:21` | persist 외 직접 gachaflix.community JSON 쓰기. quota wrapper가 실패를 삼키면 이 함수는 성공처럼 반환 |

CX-F-049. browserAccount의 계정 배열은 PBKDF2 210000회와 salt로 passwordHash를 만들지만 일반 초기 login은 계정이 없으면 만들고, strictPassword가 없으면 기존 passwordHash와 비교하지 않는다. signupPending 및 email/reset과 TOTP enable/withdraw OTP/email verify의 일부는 아무 6자리 형식을 받는다. password change의 TOTP와 계정 코드 소비는 실제 값 대조가 있다. 이것을 실서버 인증으로 보고해서는 안 된다. `browserAccount.ts:41`, `:84`, `:85`, `:96`, `:108`, `:131`, `:235`, `:240`, `:288`, `:303`, `:318`.

### 계정이 바뀔 때

CX-F-050. account.ts는 AUTH_API_BASE 우선 또는 공통 API_BASE를 선택한다. 둘 다 비어 있고 window가 있으면 browserAccount를 동적으로 불러온다. HTTP는 credentials include, 15초 timeout, mutation 앞 CSRF token을 사용한다. `account.ts:43`, `:109`, `:139`. 현재 배포의 API 없음은 BRIEF에서 제공된 사실이며 .env는 열지 않았다.

CX-F-051. acceptSession은 user.id가 다르면 security.reset, user를 저장하고 modal을 닫는다. AuthHost의 userId effect는 browserAccountsEnabled일 때 restoreBrowserAssets(id)를 부른다. wallet/inventory 이름을 해당 ID로 바꾸고 getInitialState와 직접 읽은 state를 합친다. user null이면 guest로 바꾼다. 이전 계정의 키와 자료를 삭제하지 않는다. legacy gachaflix.wallet/inventory도 옮겨오지 않는다. `authStore.ts:28`, `:66`, `AuthHost.tsx:25`, `browserWallet.ts:5`.

CX-F-052. restoreBrowserAssets는 저장 JSON의 version을 무시하므로 walletStore.migrate를 거치지 않는다. 값의 schema와 balance 합도 검증하지 않는다. 같은 walletName이면 inventory 상태와 이름이 달라도 조기 반환한다. 저장소 오류는 빈 값과 정상 신규 계정을 구분하지 않는다. `browserWallet.ts:8`, `:10`, `:15`, `:19`. 기존 browser wallet의 손상과 구버전 자료는 테스트 누락이다.

CX-F-053. CurrencyHydrator는 mount에서 legacy 이름으로 wallet/inventory를 rehydrate하고 AuthHost는 계정별 키로 갈아 끼운다. 기본 localStorage는 동기여서 보통 수렴하지만 effect 실행 순서와 지연 복원, StrictMode는 별도 테스트가 필요하다. fair, daily, community, journal, settings, telemetry는 account별 키로 바뀌지 않는다. settings의 autoTakeBy만 account ID로 나뉜다. HTTP 계정 모드에서는 browserWallet 전환을 하지 않으므로 자산 store 자체의 계정별 동기화가 별도로 필요하다. `CurrencyHydrator.tsx:15`, `AuthHost.tsx:26`.

CX-F-054. StorageEvent는 실제 물리 키를 보내며 LAB shim은 이를 바꾸지 않는다. authStore는 접두어 없는 SESSION과 KEY, revocation을 비교한다. 그래서 탭 간 logout/password revoke 즉시 반영이 누락된다. focus와 visibility 재검사로 나중에 해소될 수 있다. communityStore의 key 비교도 동일 문제이며 현재 usePublishedReviews는 subscribeCommunityReviews를 호출하지 않는다. `labSite.ts:19`, `authStore.ts:101`, `:105`, `:106`, `communityStore.ts:68`, `usePublishedReviews.ts:17`. 메모리 이벤트 실행으로 auth 차이는 확인했다.

## 5. 상태 전이 사례

각 사례의 순서는 처음 상태, 사건과 입력, 전제조건, 상태 변화, 자료 변화, 화면 변화, 오류와 취소, 새로고침 뒤다. 전이 명세의 실행 여부는 CX-F-006부터 CX-F-011로 제한된다. 나머지는 소스 판독이다. 기존 테스트의 기능 보장과 UI 미검증을 분리했다.

### 인증과 계정

CX-S-001. 가입: 비로그인, LoginSheet email 상태. 가입 전환 후 이메일 입력과 Continue, 비밀번호 입력과 Continue를 누른다. browser 모드는 빈 값만 거절하고 HTTP 모드는 이메일 및 길이12 이상의 비밀번호를 요구한다. email → password → verify, 브라우저 adapter는 signupPending을 저장한다. 6자리 코드를 보내면 session ID와 auth.user를 수락하고 시트가 닫힌다. 이후 계정 자산 복원, 보너스10000와 해당 박스 무료2회가 한 번 지급된다. 잘못된 입력과 통신 오류는 한 줄, busy중 닫기는 잠근다. 인증 전 reload하면 시트 입력은 사라지고 아직 세션이 없으며 pending 계정은 저장돼 있다. 인증 후 reload하면 account/session에서 복원한다. `LoginSheet.tsx:35`, `:51`, `browserAccount.ts:98`, `:104`, `AuthHost.tsx:29`. 테스트 browserAccount.test.ts:6, freeOpens.test.ts:25. UI 단계 테스트 없음.

CX-S-002. 이메일 로그인: 비로그인 email → password. loginAccount를 호출하고 세션을 수락한다. 일반 초기 브라우저 계정은 처음 email로 계정을 만들 수도 있고 다른 password도 받으며 strictPassword 변경 뒤에만 hash를 대조한다. 성공 뒤 원래 화면에 남고 열기나 출금은 재클릭해야 한다. 오류면 입력 아래 한 줄, 페이지 이탈시 로컬 UI generation은 unmount되지 않아도 보호가 없을 수 있다. 저장된 세션은 reload 복원. `LoginSheet.tsx:65`, `browserAccount.ts:85`, `:95`. account 및 browserAccount 테스트는 있으나 새 시트의 실제 입력과 이탈 없음.

CX-S-003. 소셜 로그인: email 단계의 Google, Apple, Microsoft 클릭. 브라우저면 provider@device.invalid 계정 ID를 세션에 넣고 즉시 닫힌다. HTTP면 허용된 공급자 HTTPS redirect URL만 location.assign한다. 진행중 버튼 disabled, 오류는 한 줄. reload는 세션 복원 또는 provider callback 이후 서비스 결과에 의존한다. `LoginSheet.tsx:71`, `account.ts:176`, `browserAccount.ts:113`. 공급자 자체 로그인은 미실행.

CX-S-004. 비밀번호 복구: 로그인 password에서 forgot, email submit, reset 코드와 새 비밀번호 입력. browser reset token이 계정에 저장되고 아무 6자리 형식을 받으며, 성공시 hash 갱신, 세션 버전과 proof를 폐기한다. UI done에서 로그인으로 돌아간다. 오류는 한 줄, 입력 draft는 미저장. reload에는 reset grant가 남되 시트는 email로 시작한다. `LoginSheet.tsx:58`, `:67`, `browserAccount.ts:121`, `:129`. 실제 메일 전송 없음.

CX-S-005. 로그아웃: 로그인 account 화면에서 logout 링크 → Confirm. 취소는 세션과 자산 불변. 확인은 logoutAccount 뒤 clearSession, security reset, guest 자산 복원이다. 기존 사용자 키는 보존되고 UI는 로그인 안내로 바뀐다. network rejection은 AccountScreen.leave에 catch가 없어 오류 줄 없이 rejected Promise가 된다. authStore.pushToast는 실제 ToastHost와 달라 확인 문구가 표시되지 않는다. reload에는 guest 세션 또는 남은 세션이 복원된다. `AccountScreen.tsx:37`, `authStore.ts:66`, `:67`, `AuthHost.tsx:26`, `toast.tsx:18`. auth.test.ts:102는 authStore 자체가 wallet을 import하지 않는지만 검사하며 호스트의 자산 전환은 검사하지 않는다.

CX-S-006. 닉네임: NicknameSheet open에서 현재 nickname 채움. input → save. UI 길이2에서20이지만 서비스 정책은 더 엄격하고 14일 cooldown 및 중복을 검증한다. 성공시 auth.user와 account 배열 갱신, 시트 닫힘. cooldown이면 날짜와 disabled. 이유별 ProfileError를 AccountError.code로 뭉뚱그려 세부 이유가 약해진다. 실패와 취소에 account 불변. reload에 서버/브라우저 계정 nickname 복원. `AccountSheets.tsx:24`, `:29`, `authStore.ts:34`, `browserAccount.ts:257`. profile/nicknameRules 테스트는 규칙용, 새 시트 오류와 길이 차이는 미검증.

CX-S-007. 새 계정 화면의 비밀번호 변경: 현재/새 password와 6자리 code 입력. 이 UI는 verifyCurrentPassword와 sendPasswordChangeOtpCode를 호출하지 않고 곧바로 changeAccountPasswordWithOtp다. adapter는 passwordVerifiedUntil을 요구하므로 일반 진입에서는 verification_required로 실패한다. 자료 불변, catch는 credentials 일반 오류, 성공 종료 상태 도달 불가. 취소 뒤 password/code가 컴포넌트 메모리에 남을 수 있다. reload로 UI 입력만 사라진다. `AccountSheets.tsx:47`, `:61`, `account.ts:248`, `browserAccount.ts:232`. 메모리 실행 확인. passwordChangeFlow.test.ts:36은 서비스와 옛 UI 계약이며 이 새 UI를 테스트하지 않는다.

CX-S-008. 새 계정 화면의 탈퇴: password 입력 → 확인. deleteAccount는 legacy `/account/closure`를 보내며 adapter가 언제나 verification_required로 거절한다. 잔액0 및 상품0이라도 이 경로로 성공할 수 없다. 오류 표시 후 시트에 돌아오고 user/자산은 유지, reload도 유지. 실제 새 코드 인증 API 경로는 존재하지만 이 UI에서 호출 안 한다. `AccountSheets.tsx:88`, `account.ts:189`, `browserAccount.ts:147`, `:251`. 메모리 실행 확인. 테스트 accountClosureFlow는 도달 불가 옛 함수 및 service 경로를 검증한다.

### 충전과 개봉

CX-S-009. 비로그인 충전: flow.charge true, user null. ChargeSheet는 login CTA, 클릭시 LoginSheet를 위에 연다. 돈과 입금 거래를 생성하지 않는다. 인증 뒤 ChargeSheet가 실제 네트워크 주소를 준비하고 로그인한 사람이 원래 창으로 돌아온다. 취소면 charge 상태만 닫히고 reload에는 두 시트 모두 닫힘. `ChargeSheet.tsx:36`, `:28`.

CX-S-010. 정상 충전: 로그인, charge 열린 상태. TRC20/BEP20/ERC20 선택. 설정 주소 또는 발급 주소가 유효해야 하고 실제 확인 영수증이 필요하다. address preparing → waiting/pending → credited. 5초 polling으로 확인 횟수와 hash, 주소, network, 최소1 USDT를 검증한 뒤 recordConfirmedUsdtDeposit이 pending 기록을 만들거나 재사용하고 같은 기록을 COMPLETED로 정산한다. balance와 settledDepositRefs 및 totalDepositedCrypto가 한 번 증가, charge 닫힘. 주소 복사는 toast만. reload에 잔액과 영수증 참조가 남고 polling은 다음에 charge를 열 때 재개. 현재 browser adapter는 입금 화면 방문만으로 영수증을 만들지 않는다. `useUsdtDeposit.ts:28`, `:45`, `depositCredit.ts:13`, `walletStore.ts:176`, `browserAccount.ts:162`. depositAddress/depositCredit/accountWallet 테스트 있음, 실제 charge poll과 화면 닫힘은 없음.

CX-S-011. 충전 실패/중복/취소: 주소 발급 오류는 addressFailed 및 retry로 attempt 증가. polling 통신 실패는 waiting으로 돌아가며 별도 error 줄은 없다. 컨펌 부족이면 pending. 중복 영수증은 existing으로 지급 안 함, onCredited를 호출하지 않아 시트가 반드시 자동 닫히는 것은 아니다. 네트워크 변경/닫기는 active=false 및 timeout 해제로 이전 응답 폐기. logout 또는 account 변경은 ID 검사로 다른 계정 지급 차단. reload에 중복 참조로 재정산 차단. `ChargeSheet.tsx:56`, `useUsdtDeposit.ts:53`, `:57`, `:64`, `:71`, `depositCredit.ts:17`.

CX-S-012. 단건 유료 열기: READY와 로그인, 수량1, free0, cost 충분. press → PURCHASE_PROCESSING, 동기 ref로 중복 클릭 차단. 전체 결과를 seed/HMAC로 먼저 계산, ledger 고정 검사, 동기 debit/allocation/cash settlement, transaction 기록 후 OUTCOME_COMMITTED → OPENING. 현금은 이미 잔액과 SOLD 기록, 실물은 IN_STORAGE. 520+150+170ms 후 결과, 350ms 뒤 버튼 활성. journal markSeen 뒤 SETTLED. 취소 전 구매 Confirm이 없는 소액은 바로 구매. 오류면 정확한 wallet/inventory snapshot rollback이나 SHORT로 reset. reload에 unseen 7일 이내 결과가 recovery CTA로 나타난다. `BoxScreen.tsx:140`, `:164`, `opening.ts:44`, `:90`, `Opening.tsx:127`, `:150`. opening/openingFlow 테스트는 돈 규칙과 기계, 실제 연출 키보드는 없음.

CX-S-013. 큰 금액 열기 취소/확인: cost50 이상 또는 qty10 이상이면 READY → CONFIRMING. 취소는 READY 및 confirming false, seed/nonce/자산 변화 없음. 확인시 현재 qty/cost로 open(true), 구매는 단건과 동일. reload나 페이지 이탈 전 확인만 했으면 자료 변화 없음. `BoxScreen.tsx:47`, `:164`, `:166`, `:316`, tests/opening.test.ts:48`.

CX-S-014. 여러 개 열기: 1/5/10/50/100 선택, count1부터100 안전 정수. 남은 무료를 앞쪽 결과에 먼저 적용하고 전체 HMAC 계산 뒤 한 번 배정한다. results.length가2 이상이면 Reveal, 동일 금액 현금은 행을 묶고 실물은 행마다 보여 준다. 50/100개도 옛 BulkOpen이나 자동 반복이 아니다. 부분 구매와 부분 배정은 실패 처리, 빠른 Skip/X는 이미 확정한 결과를 다시 계산하지 않는다. reload에는 openingId로 묶은 결과 recovery. `BoxScreen.tsx:203`, `:320`, `opening.ts:45`, `:58`, `:90`, `Reveal.tsx:95`. tests/opening.test.ts:20, freeOpens.test.ts:52.

CX-S-015. 무료 또는 혼합 열기: 로그인 계정의 해당 box 무료 n이 있어야 한다. min(count,freeOpens)만 cost0, 나머지 유료. 무료 앞쪽은 게이지 적립을 하지 않고 결과는 정상 표를 쓴다. wallet.freeOpens 감소와 freeOpen/boxPriceUsdt 기록, open 거래 amountUsdt는 실제 cost다. cost0이라도 결과는 정상 보관 또는 현금 지급. rollback이면 무료도 되돌림. reload에도 남은 무료 수 복원. `opening.ts:47`, `:70`, `:82`, `:95`, `:108`. tests/freeOpens.test.ts:36, :80. 현재 가입 박스는 실물 전용이므로 무료 터짐 테스트는 건너뜀.

CX-S-016. 로그인 전 열기: box 공개, auth.hydrated true와 user null. 주 단추는 openLogin(login). 구매, nonce, 개봉 이력 변화 없음. 로그인 뒤 box/qty 유지, 사용자가 다시 열기를 눌러야 구매한다. 모달 취소는 공개 화면으로, reload qty1로 초기화. `BoxScreen.tsx:205`, `LoginSheet.tsx:22`. service 로그인 테스트만 있고 이 연결 흐름은 테스트 없음.

CX-S-017. 잔액 부족 열기: 로그인, balance < cost. held 없음이면 charge. held의 takeQuote가 부족분을 채우면 TakeSheet가 주 단추, 못 채우면 charge가 주 단추와 take 링크. 클릭은 구매를 보내지 않는다. 받고 또는 충전한 뒤 box와 qty 유지하며 다시 press를 누른다. 구매 도중 다른 동작 때문에 잔액이 줄면 executeOpening도 다시 검사하며 SHORT로 복귀한다. reload는 저장 잔액만 복원, UI qty와 선택은 초기화. `BoxScreen.tsx:84`, `:207`, `opening.ts:53`, `:70`, `takeBatch.ts:200`. takeBatch의 quote 및 opening 자금 테스트 있음, UI 단추 분기 없음.

CX-S-018. 연출 이탈과 복구: 결과 확정 뒤 markSeen 전 reload/닫힘. 구매 자료는 이미 inventory에 있어 새로 추첨하지 않는다. BoxScreen은 journal/inventory hydrate 뒤 최근7일 unseen을 찾는다. 현재 box면 recover CTA, 다른 box면 그 주소 Link. recover는 당시 value와 fair와 transaction cost로 결과를 만들고 이미 받은/배송 상태를 표시한다. 결과를 보여주면 markSeen, 다시 reload에는 unseen에서 빠진다. 카탈로그에서 사라진 item은 복구 목록에서 누락될 수 있고 전부 누락이면 markSeen 후 결과를 표시하지 않는다. `BoxScreen.tsx:111`, `:119`, `:126`, `:133`, `openingJournal.ts:50`. openingFlow 테스트는 자료 grouping 보장, 실제 복구 화면은 없음.

### 결과와 받기

CX-S-019. 현금 결과: 구매 commit에서 inventory.sell(rate1), wallet.creditSplit, cashback 거래와 open 거래가 생성된다. 결과 버튼을 눌러 추가로 지급하지 않는다. 결과 화면은 받은 금액과 실제 잔액 변화, 다시 열기 또는 부족분 해결, 검증을 보여 준다. 닫기/Skip/refresh는 추가 지급 안 함. `opening.ts:100`, `Opening.tsx:180`, `Reveal.tsx:112`. tests/opening.test.ts:20와 burst.test.ts:75.

CX-S-020. 실물 결과에서 USDT 받기 정상: IN_STORAGE이고 takeState held, result ready. 주 단추 → TakeConfirm → settleTake → settleTakeMany → takeUsdt. 상태는 settling → settled. item별 value 곱하기 REFUND_RATE 반올림, SOLD와 soldForUsdt/soldAt, 자금 원천에 맞춘 wallet bucket credit와 itemIds 거래. 화면은 수령액과 잔액 변화로 바뀐다. 확인 취소는 자료 변화 없음. reload에는 SOLD와 입금 내역으로 taken을 판정하고 중복 지급 안 함. `Opening.tsx:154`, `:195`, `claim.ts:18`, `inventoryStore.ts:78`, `takeBatch.ts:316`. claim/takeBatch/takeFault 테스트 있음.

CX-S-021. 실물 결과 보관: 이미 구매 시 IN_STORAGE. 결과에서 닫기 또는 뒤로 가기만 하면 계속 보관한다. 별도 keep 액션이나 두 단계 수령방법 선택은 없다. 배송은 결과 화면에서 제공하지 않는다. 결과를 본 상태면 journal seen, 못 본 상태면 복구 대상. reload 및 account 재로그인 뒤 해당 계정의 inventory에 남는다. `Opening.tsx:13`, `:204`, `Reveal.tsx:118`, `inventoryStore.ts:69`. tests/opening.test.ts:37, inventory.test.ts:20.

CX-S-022. 단건 자동 받기: account.autoTakeBy true, 실물이고 receivedValue/boxPrice가20배 미만, recovered 아님. reveal effect의 autoRan ref로 한 번 take(true)를 한다. 큰 상품은 묻고 현금은 이미 지급돼 대상 아님. 성공 뒤 autoTaken 표시, 실패/pending/unknown은 정상 받기와 같은 상태이며 스스로 성공으로 바꾸지 않는다. reload에 설정은 계정 map과 결과는 SOLD 자료로 복원. `Opening.tsx:167`, `openingFlow.ts:77`, `settingsStore.ts:40`. 순수 autoTakeApplies 테스트만 있고 effect 중복 및 StrictMode 자동 정산 통합 테스트 없음.

CX-S-023. 다건 결과 묶음 받기: 다건 results 중 아직 held 실물, fresh TakeSheet. 참고가가 정상 boxPrice20배 이상인 것은 preselect에서 빠진다. 이것은 단건 자동받기의 실제 수령값 기준과 다른 조건이다. selected → confirm → settleTakeMany. 결과의 taken map으로 요약과 행 변경, 다음 구매 자동 실행 없음. 취소는 results 그대로. reload에 item status 및 journal로 보존. `Reveal.tsx:139`, `:142`, `TakeSheet.tsx:93`, `:197`. takeBatch 순수 계산과 정산 테스트 있음, fresh preset 및 batchTaken UI는 없음.

CX-S-024. 묶음 받기 결과 분기: 정상 전부 settled, 일부 partial, 영수증 기다림 pending, 미처리 failed, 장부 불일치 unknown을 나눈다. 중복 요청은 같은 Promise와 already, 다시 지급 없음. 저장 표시를 먼저 쓰고 실제 두 장부를 읽어 taken/left/unknown을 각각 보여 준다. retry는 left 가운데 아직 IN_STORAGE만이며 unknown은 재지급 안 함. 실패 후 표시는 focus나 시트 재진입으로 대조해 해제할 수 있다. reload에는 보관함과 거래 및 `take-unconfirmed` 표시가 남아 같은 판단이다. `takeBatch.ts:316`, `:357`, `:363`, `:416`, `TakeSheet.tsx:123`, `:235`. tests/takeFault.test.ts:87 이후 여러 저장 장애, takeBatch.test.ts:32 이후 중복과 겹침을 검증한다.

### 보관함, 배송, 출금

CX-S-025. 보관함 단건/묶음 받기: 로그인 inventory, held 탭. 행 클릭 상세 → 단건 확인 또는 목록 위 TakeSheet. 성공 단건은 상세 닫고 done 탭, batch는 held 화면에서 남은 목록을 보여 준다. failure는 상세의 failed 또는 unknown 한 줄, unknown은 받기와 배송 CTA를 숨긴다. 취소는 상태/돈 불변. reload에는 자료는 유지하되 tab 기본 held와 shown30으로 시작. `InventoryScreen.tsx:89`, `:119`, `:168`, `:184`. 정산 함수 테스트 있음, 실제 탭 이동 없음.

CX-S-026. 배송 신청 정상 계약과 현재 실패: held 실물의 상세 배송 링크 → ShipSheet. 국가, 이름, phone, 우편번호, 주소, KR PCCC 또는 CN 통관번호가 필요하고 잔액은 fee 이상이어야 한다. valid면 확인 → requestShipment 서비스 호출 → 반환한 SHIPPING_REQUESTED item과 wallet으로 바꾸고 shipping 탭. 이 정상 계약은 코드에 있으나 브라우저 adapter의 `/shipping/request`가 없어서 현재 배포에서 unavailable, failed 한 줄, 자산 변화 없음이다. 취소는 입력으로 또는 상세로 돌아간다. reload하면 이전 held 상태, 폼은 가장 최근 성공 배송 주소로 채움. `ShipSheet.tsx:35`, `:46`, `:52`, `claim.ts:33`, `browserAccount.ts:339`. 메모리 요청 실패 확인. inventory.test.ts의 store 직접 requestShipping은 이 실패를 잡지 못한다.

CX-S-027. 배송 취소와 운송장: 과거 SHIPPING_REQUESTED 자료가 있을 때 Confirm → cancelShipment. 출고전 및 원래 fee/requestId/fundingRatio가 있어야 한다. local이면 IN_STORAGE와 cancellation 이력, 원래 bucket으로 fee 환불과 shipping_refund. live이면 서비스 응답 검증. SHIPPING 뒤에는 취소 안 되고 tracking 공식 Link만 있다. polling이 운송장을 받으면 markShipping. 오류는 상세 cancelFailed. reload에는 취소 기록이나 shipping 자료 보존. `claim.ts:53`, `InventoryScreen.tsx:61`, `:96`, `:169`, `inventoryStore.ts:126`. shipping-cancellation과 claim 테스트 있음. 새 브라우저 신청이 실패하므로 신규 정상 배송 여정은 완주 불가.

CX-S-028. 출금 보안 관문: 로그인이고 security hydrated가 필요하다. 오류면 refresh 재시도, TOTP 미등록이면 setup CTA 또는 emailOnly 경로. setup은 QR와 secret, 6자리 입력 후 security.accept와 관문 닫기, 등록되면 form으로. local adapter의 enable은 실제 TOTP 일치가 아니라 여섯 자리 형식을 받는다. 폼으로 넘어가기 전 출금 차감 없음. 닫으면 setup UI는 사라져도 browser 계정의 setup이 남을 수 있고 reload에 보안 상태를 서비스에서 재복원한다. `WithdrawScreen.tsx:171`, `:179`, `TwoFactorSetup.tsx:38`, `:57`, `browserAccount.ts:283`, `:288`. totp.test의 표준 벡터는 이 adapter 관문을 보장하지 않는다.

CX-S-029. 출금 입력과 확인: crypto 잔액만, form 네트워크 TRC20/BEP20, 주소 및 선택 통화 금액, MIN20. 비율 단추는 현재 crypto 잔액 일부를 입력한다. beginConfirm은 현재 user와 securityReady 및 validateWithdrawal이 필요하다. confirm에 전액주소, 수수료, 실수령액을 보여 주고 auth 단계로. cancel/back은 form 또는 confirm, 아직 자산 불변. reload시 입력과 단계는 사라진다. `WithdrawScreen.tsx:74`, `:78`, `:103`, `:191`. withdrawal.test는 금액/주소/fee 검증, UI 입력 KRW 토글과 auth 전이는 없음.

CX-S-030. OTP 출금: otp에서 6자리 submit. verifyWithdrawalOtp로 draft-bound proof를 받은 뒤 commit. 서비스 요청 ID 중복은 adapter가 기존 결과를 반환하고 wallet은 serverId로 중복 거래를 막는다. 성공시 debitCrypto와 withdraw 거래, done. 오류 세 번이나 rateLimit이면 email, network 오류는 현재 단계 한 줄. HTTP API 실패시 아직 차감 안 함. reload 후 UI done은 없어지되 거래와 pending 상태가 wallet에 남는다. 단 local adapter OTP는 codeAccepted의 형식만 확인한다. `WithdrawScreen.tsx:113`, `:137`, `browserAccount.ts:295`, `:301`, `:321`. browserAccount/securityApi/accountHttp 테스트는 서비스 계약, 실제 단추 및 차감 경합 없음.

CX-S-031. 이메일 출금: email 단계 첫 submit은 sendEmail, challenge와 만료시간을 받는다. 두번째는 code verify 후 proof EMAIL_72H_HOLD, unlockAt72h, commit과 즉시 잔액 묶기, pending hold 거래. 재발송은 새 challenge, 만료는 error, 취소는 back. local adapter는 발급한 challenge.code와 비교하지 않고 여섯 자리만 받으며 UI는 browserCode를 표시하지 않는다. 이 환경에서는 실메일이 발송되지 않는다. reload에 hold transaction과 account challenge/proof 계약 자료 유지. `WithdrawScreen.tsx:152`, `:159`, `:215`, `browserAccount.ts:310`, `:315`. withdrawHold.test는 시간과 환불, 실제 이메일 인증 UI는 없음.

CX-S-032. 출금 대기와 취소: WalletScreen은 accountId와 serverId가 있는 미종결 출금을10초마다 조회, hold 시간은60초마다 갱신한다. hold 거래 상세에서 취소 Confirm → 서비스 취소 결과 → syncWithdrawal이 full request amount를 한번 환불. 72h가 지나면 browser adapter는 PENDING으로만 바꾸며 실제 온체인 송금은 없다. 중복 취소는 terminal guard로 환불 안 함. reload에 거래와 serverId 보존, 화면 mount시 polling 재개. `WalletScreen.tsx:44`, `:64`, `:78`, `walletStore.ts:197`, `browserAccount.ts:333`. accountWallet/withdrawHold 테스트 있음.

CX-S-033. 출금 차감 경합: commit은 요청전 validateWithdrawal 뒤 await api.withdraw, 답을 받고 debitCrypto 반환값을 확인하지 않는다. 그 사이 잔액이 줄면 차감 false인데도 음수 withdraw 거래가 만들어진다. 이후 취소/실패의 syncWithdrawal은 차감 여부를 모르고 요청액을 가산한다. 새로고침 뒤 잘못된 거래와 잔액이 남을 수 있다. browser adapter의 withdraw도 실제 wallet 잔액을 검사하거나 동결하지 않는다. `WithdrawScreen.tsx:115`, `:118`, `:123`, `walletStore.ts:197`, `browserAccount.ts:321`. 메모리의 동일 저장소 연산 조합으로 차감false와 취소뒤30을 확인했다. 실제 UI 경합은 짐작, 연산 결과는 직접 실행.

CX-S-034. 출금 앞 묶음 받기: held가 있으면 form의 링크로 TakeSheet. 수령 결과의 새 toCrypto만 native 통화로 입력, 재진입 수령은 이전 prefill에 누적, 카드 몫과 already는 입력 안 한다. 출금 취소해도 받기로 생성한 잔액은 남는다. 본인이 금액을 수정하면 received를 null로 리셋. reload에는 받은 상품과 잔액은 유지하지만 prefill은 사라진다. `WithdrawScreen.tsx:93`, `:94`, `:246`, `takeBatch.ts:451`. takeBatch.test.ts:190, :208, :221은 helper와 누적 계산을 검증하며 시트 callback 통합은 없음.

### 후기, 검증, 설정

CX-S-035. 후기 작성: 로그인 보관함의 실제 기록, canReview 조건, 미작성 ownedId. 기본별점5, 글최소5 및 최대길이, 선택 사진. pick은 canvas로1000px WEBP data URL, send는 community.add, bonus0. 성공이면 작성 시트 닫힘과 정보 행 reviewed, 후기 조회에 새 글 추가. duplicate 또는 storage 오류는 save 오류. 닫기 때 text/rating/photo reset이 없어 같은 컴포넌트 다음 상품에 draft가 남을 수 있다. 큰 저장이 shim에서 누락되면 성공처럼 닫히지만 reload에는 글이 없다. `ReviewSheet.tsx:31`, `:40`, `:49`, `communityStore.ts:29`, `InventoryScreen.tsx:182`. canReview는 상품 종류를 검사하지 않고 참고가100 이상과 허용 상태 및 미작성 여부를 검사한다. 배송 완료는 필수 아님. 근거 community.ts:52, :57. community와 vault-records 테스트 있음, LAB shim 및 새 시트 업로드 경합 없음.

CX-S-036. 후기 조회: useReviewCards가 published의 회원 자료와 REVIEW_SAMPLES를 함께 만든다. 홈 ratingSummary는 REVIEW_SAMPLES만 읽어서 새 후기가 홈 카드 평균에 반영되지 않을 수 있다. 여러 계정의 public records를 mine true로 만들고 authorName 없으면 현재 me.nickname을 쓰기도 한다. 조회 카드 클릭은 상세, 내 기록이 있으면 수동 검증 URL Link, sample은 verifyHref null. 언어 변경에도 후기 원문은 번역 안 함. reload시 공유 community와 샘플 다시 로드, 필터는 query의 초기값 또는 all. `BoxReviews.tsx:104`, `:109`, `:111`, `BoxList.tsx:117`, `ReviewsScreen.tsx:22`. 샘플을 실제 후기나 새 당첨으로 분류하지 않았다.

CX-S-037. 저장 기록 검증: record 행/결과/보관함 → VerifySheet, checking. recordToVerify는 가능한 경우 정확한 ownedId와 같은 개봉의 저장 표를 우선한다. hash와 roll와 item 일치면 ok, 하나 false면 bad, 당시 표가 없으면 partial, 연산 오류는 failed. chainRecordOf는 이 테스트의 실제 기록에 언제나 none이며 gallery fixture confirmed와 다르다. 문구와 method 펼침만 바뀌며 돈과 자료는 안 바뀐다. 닫거나 record 변경하면 alive=false로 옛 응답 폐기. reload에는 기록을 다시 선택해야 한다. `VerifySheet.tsx:37`, `:39`, `:54`, `fairness/verifyRecord.ts`, `lib/chainRecord.ts`. fairness-record/chainRecord 테스트 있음.

CX-S-038. 수동 검증: query s/h/c/n/box가 있으면 입력과 manual section scroll. hash와 HMAC 계산, 현재 dropTable로 item을 찾는다. seed/client 비어있거나 nonce 음수/비정수면 failed, 해시를 안 주면 hashMatch null, 맞으면 true/틀리면 false. nonce 빈 문자열은 Number로0이 돼 코드상 통과할 수 있고 safe integer까지 검사하지 않는다. 계산 중 입력 변경은 disabled가 아니어서 이전 결과가 현재 입력 아래 나올 수 있다. 자료 미저장, reload는 query있으면 다시 채우고 계산결과는 없어짐. `VerifyScreen.tsx:45`, `:57`, `:99`. 순수 fairness 계산은 테스트, 수동 화면의 입력과 응답 세대는 없음.

CX-S-039. 언어 변경: footer의 다른 언어 Link, 현재 pathname을 유지한 새 locale URL. 같은 origin 저장값은 계속 읽고 next-intl 문구와 html.lang이 바뀐다. query/hash를 전달하지 않아 reviews box 필터와 verify 수동 query가 사라질 수 있다. 새 footer는 gachaflix.locale에 선택을 쓰지 않으므로 이후 루트 방문은 옛 저장값 또는 navigator 언어다. reload는 현재 언어 URL을 유지하고 자료는 복원한다. `AppFooter.tsx:61`, `app/page.tsx:7`, `LanguageSelector.tsx:14` 미도달. 언어 파일 key 테스트만 있고 실제 이동과 root preference 테스트 없음.

CX-S-040. 통화 변경: footer button으로 USD ↔ KRW. currencyStore에 currency 저장, fmt 출력만 환산. wallet, 상품 USDT 값과 확률은 불변. WithdrawScreen은 amountText를 그대로 둔 채 rates[currency]로 해석을 바꾸므로 입력 뒤 통화를 바꾸면 실제 amountUsdt가 달라진다. confirm 상태는 이미 잡은 USDT draft를 사용한다. reload에 currency 복원, 예전 USDT는 USD로 정리, 입력은 사라진다. `AppFooter.tsx:62`, `currencyStore.ts:39`, `:49`, `WithdrawScreen.tsx:78`. formatCurrency 테스트는 포맷, 기존 입력의 통화 전이는 없음.

## 6. BRIEF가 지정한 직접 DOM 열 파일

| ID | 파일 및 줄 | 만지는 것과 이유 | 생명주기 판단과 조치 |
|---|---|---|---|
| CX-F-060 | `web/app/layout.tsx:48`, `lib/labSite.ts:19` | inline script로 Storage.prototype 전역 변경. 운영과 테스트 저장키 분리 | 목적은 보존. 재실행은 __voilaLab로 차단. StorageEvent key 정규화와 누락 저장 성공 판정은 수정 필요. React DOM 재조정과 충돌하는 방식은 아님 |
| CX-F-061 | `web/app/page.tsx:7`, `:13` | 파싱 단계 location.replace와 meta refresh. hydration 전에 언어 선택 | 정적 export에서 필요, 그대로 보존. JS와 meta의 목적 언어 차이 및 footer 미저장은 흐름 문제. 컴포넌트 상태 변경이 없어 StrictMode effect 중복과 무관 |
| CX-F-062 | `components/auth/AvatarSettings.tsx:24`, `:39`, `:41`, `:46` | DOM 바깥 임시 canvas, Image decode, object URL로384px crop | 현재 미도달. detached canvas는 React 소유 DOM과 충돌 없음. select는 task token과 unmount 증가, URL finally revoke. save 응답도 확인 필요하나 단순 React 전환 불필요 |
| CX-F-063 | `components/box/BoxScreen.tsx:176`, `:180` | 존재하는 reviews와 contents 영역 smooth scroll | 현재 도달. React 노드 내용 변경 없음. target이 없으면 no-op. 클릭에 동작해 StrictMode 중복 없음. reduced motion이 smooth로 고정된 점은 별도 인터랙션 확인 항목, 전환할 필요 없음 |
| CX-F-064 | `components/community/ReviewFormModal.tsx:19`, `:26`, `:29` | detached canvas 및 image.onload로 사진 축소 | 현재 미도달. URL 정리 있음. close가 imageTask 증가하지만 실제 unmount cleanup은 별도로 없음. Image load 응답이 늦는 경우를 재연결 전에 확인. 새 ReviewSheet의 더 약한 보호와 구분 |
| CX-F-065 | `components/fairness/VisualVerifier.tsx:62`, `:65`, `:67` | proof JSON Blob의 anchor.click 다운로드와 URL revoke | 현재 미도달. React 노드를 직접 삽입/교체하지 않음. 다운로드 클릭은 이벤트, URL timeout은 언마운트 뒤에도 revoke되어야 함. generation으로 연산 응답 보호, 그대로 보존 가능 |
| CX-F-066 | `components/flow/ReviewSheet.tsx:17`, `:24`, `:40` | detached canvas, Image.decode로1000px 사진 축소 | 실제 도달. canvas는 유지해도 됨. 빠른 재선택에서 늦은 이미지가 새 사진을 덮고 닫힘/다른 item 뒤 setPhoto할 수 있으므로 세대와 unmount 보호 수정 필요 |
| CX-F-067 | `components/home/heroBall.ts:76`, `:100`, `:114`, `HeroBanner.tsx:83`, `:88` | WebGL offscreen canvas로 구를 그리고 React canvas의2d context에 복사, contextlost 감지 | 현재 도달. React는 pixel buffer를 소유하지 않아 충돌 없음. effect disposal, resize/RAF 취소 있음. shader compile/link 실패 조기반환은 생성한 GL 자원 해제가 없음. 현재 반복 실패 영향은 미실행, 성공 경로는 보존 |
| CX-F-068 | `components/verify/VerifyScreen.tsx:45`, `:49` | query 입력을 채운 뒤 수동 section scrollIntoView | 실제 도달. StrictMode effect 두번은 동일 scroll이라 데이터 부작용 없음. 별도 effect이고 DOM 내용을 덮지 않음. 그대로 유지 가능, compute 비동기 경합은 별개 |
| CX-F-069 | `lib/fingerprint.ts:15`, `:36` | canvas text/shape와 WebGL renderer를 읽어 fingerprint 구성 | 현재 미도달. mount 시 React DOM 충돌 없음. 생성 context 폐기 없음, 호출 재연결 때 리소스와 필요성 검토. 무조건 React 컴포넌트로 만들 필요 없음 |

CX-F-070. BRIEF의 열 파일은 직접 DOM의 전체 목록이 아니다. 실제 도달하는 useModal은 body.style.overflow, inert, aria-hidden, document keydown, activeElement, focus와 RAF를 다룬다. ScrollRow, HeroBanner, BoxReviews, LocaleHtmlLang, TwoFactorSetup도 DOM이나 브라우저 API를 쓴다. 후반 전수 색인에 포함했다. 직접 DOM이라는 이유만으로 제거하면 focus trap과 canvas 연출을 잃는다. `useModal.ts:10`, `:26`, `ScrollRow.tsx:15`, `BoxReviews.tsx:126`, `HeroBanner.tsx:91`.

## 7. 실제 동작에 영향을 주는 React 품질과 기능 발견

CX-P1-01. 출금의 차감 실패 반환값을 무시한 뒤 취소 환불하면 장부 잔액을 만들 수 있다. `WithdrawScreen.tsx:123`, `walletStore.ts:197`. 조건은 요청 중 다른 동작 또는 탭에서 자금을 사용한 경우다. 모듈 연산 재현은 CX-F-010. 고칠 때 요청 idempotency와 자금 출처 계산을 그대로 유지해야 한다. 브라우저 시험 장부에서 확인된 무결성 문제이며 실제 자금 사고가 발생했다고 주장하지 않는다.

CX-P1-02. 저장 성공 probe 뒤 본체 쓰기를 quota shim이 누락시켜도 opening은 success를 반환한다. StrictMode 문제가 아니라 persist와 wrapper의 계약 차이다. `labSite.ts:19`, `ledgerLock.ts:29`, `opening.ts:90`. 메모리 재현 CX-F-009. 화면 성공과 refresh 뒤 자료가 다를 수 있다. takeBatch에는 이런 장애를 대조하는 장치가 있으나 opening에는 없다. 작은 probe만 성공해도 자료 증가분을 저장할 수 있다는 보장은 없다.

CX-P1-03. PasswordSheet는 service가 요구하는 현재 비밀번호 확인과 코드 발급 단계 없이 change를 보낸다. 일반 진입에서 완료 불가. `AccountSheets.tsx:61`, `browserAccount.ts:232`. 옛 PasswordChangeFlow가 미도달이라 테스트 통과가 새 흐름을 가린다. CX-F-007로 확인.

CX-P1-04. CloseAccountSheet는 금지된 legacy closure 경로를 호출한다. 사용자 확인 단추는 있어도 탈퇴를 끝내지 못한다. `AccountSheets.tsx:90`, `account.ts:191`, `browserAccount.ts:147`. CX-F-007로 확인.

CX-P1-05. 현행 배송 신청은 browser adapter에 없는 경로다. `claim.ts:36`, `browserAccount.ts:339`. 현재 API 없는 배포에서 항상 실패한다. store.requestShipping 단위 테스트는 새 ShipSheet와 서비스 계약을 통과하지 않는다. CX-F-007로 확인.

CX-P1-06. LAB prefix가 StorageEvent.key에 남아 authStore의 즉시 타탭 logout/revocation이 누락된다. `labSite.ts:19`, `authStore.ts:101`, `:105`. focus/visibility로 회복할 수 있어 항상 영구 로그인 잔존이라고 하지 않는다. 실제 prefix 이벤트 하네스는 CX-F-006.

CX-P1-07. 구매/현금 결과/상품 받기/배송 환불 거래에 accountId가 없는데 WalletScreen은 이를 필수로 필터링한다. 저장 거래는 있으나 사용자가 지갑에서 내역을 못 본다. `opening.ts:105`, `:109`, `claim.ts:24`, `:72`, `WalletScreen.tsx:66`. CX-F-008로 확인. 계정별 키를 사용하더라도 필터는 이 자료를 제외한다.

CX-P2-01. ReviewSheet는 조건부 item에 대해 state 초기화 effect가 없다. InventoryScreen이 같은 컴포넌트를 항상 마운트하므로 A의 글/사진/별점이 B를 열 때 유지된다. 비동기 shrink에 최신 선택 token도 없어 두 사진의 decode 순서가 뒤집힐 수 있다. `ReviewSheet.tsx:34`, `:40`, `InventoryScreen.tsx:182`. 코드 확인, 실제 파일 선택 race는 미실행.

CX-P2-02. ReviewsScreen은 asked query를 useState 초기값으로만 사용한다. 같은 pathname의 query navigation, 뒤/앞으로 이동시 컴포넌트가 유지되면 현재 picked와 주소가 달라질 수 있다. `ReviewsScreen.tsx:21`, `:22`. AppFooter는 query를 전달하지 않는 language Link다. `AppFooter.tsx:61`. 둘은 별개의 원인이다.

CX-P2-03. VerifyScreen compute는 입력 snapshot을 완료 시점에 재검사하지 않는다. 계산 중 필드 수정, locale 변경, 다른 box 선택 뒤 이전 itemName/roll이 현재 입력 아래 남는다. busy는 Button만 막으며 필드는 enabled. `VerifyScreen.tsx:57`, `:63`, `:99`. nonce Number 빈 값0, safe integer 미검사도 코드 확인했다. nonce 한계는 계산 계약 회귀 테스트로 확인해야 한다.

CX-P2-04. 언어 선택을 새 Footer에서 저장하지 않는다. 이전 LanguageSelector는 저장했지만 미도달이다. root redirect의 저장된 locale는 낡은 선택일 수 있다. `AppFooter.tsx:61`, `LanguageSelector.tsx:14`, `app/page.tsx:7`. 상대 path로 query를 버리는 결과와 basePath 없는 root 404 복귀도 조사 필요다.

CX-P2-05. 출금 amountText는 표시 통화 변경 뒤 같은 숫자를 새 단위로 재해석한다. 사용자가100달러 입력후 KRW로 토글하면 실제 USDT 값이 약0.07이 된다. `WithdrawScreen.tsx:78`, `AppFooter.tsx:62`. 현재 form을 유지하는 이동에서 발생할 수 있으며 confirm의 draft는 이미 USDT라 다른 경우다.

CX-P2-06. AuthHost hydrate subscribe와 일부 Promise 응답이 종료 생명주기를 보호하지 않는다. 자세한 파일 및 영향은 CX-I-037부터 CX-I-039다. 직접 store guard가 있는 opening의 돈 처리와 화면의 unmount 후 setState를 혼동하지 않았다. TakeSheet는 UI 응답 세대를 확인하지만 settleTakeMany의 실제 작업이 계정별 key를 언제 고정하는지도 필요하다. `AuthHost.tsx:39`, `TakeSheet.tsx:133`, `takeBatch.ts:318`, `ledgerLock.ts:48`.

CX-P2-07. 임의 any를 발견했다고 모두 문제로 적지 않았다. 동작을 가리는 자리는 requestShipment의 `Array.isArray(returned)` 이후 item 속성 접근이다. 배열은 any[]로 좁혀지고 모든 balance bucket 합의 일치를 검사하지 않아 잘못된 서비스 응답이 `balance ≠ cryptoBalance + cardBalance`로 들어갈 수 있다. account 고정도 없다. `claim.ts:38`에서 `:46`. cancelShipment는 합을 검사해 대조된다. `claim.ts:62`. 현재 browser 신청은 unavailable이라 이 위험은 HTTP 연결시 짐작이다.

CX-P2-08. 초기 server render는 currency USD와 auth.user null, hydrated false이며 hydrate 후만 저장값을 표시해 주요 persist hydration mismatch를 피한다. 그러나 REVIEW_SAMPLES의 날짜와 stamp는 서버/브라우저의 로컬 timezone 차이를 만들 수 있고 SSR의 html.lang은 ko에서 locale effect로 바뀐다. `currencyStore.ts:36`, `authStore.ts:24`, `BoxReviews.tsx:89`, `app/layout.tsx:45`. 샘플의 날짜는 문자열을 그대로 쓰므로 샘플만 있는 초기 화면에서 stamp 문제를 확정하지 않았다. 현재 브라우저 캡처로 hydration 오류는 검증하지 않았다.

CX-U-017. HeroBanner에는 box가 없으면 return하는 조건 뒤 useWalletStore 훅이 있다. `HeroBanner.tsx:129`, `:131`. 하지만 box는 모듈 상수 BOXES와 상수 slug로 결정돼 현재 렌더 사이에 유무가 바뀌지 않는다. 지금 동작 장애를 입증하지 못해 P1/P2 결함으로 올리지 않았다. 리스트의 고정 BALLS 인덱스 key도 고정 길이/순서라 불안정 key로 분류하지 않았다. 현행 주요 결과 목록은 ownedId, item.id, box.id, tx.id를 써서 단순 인덱스 재사용 문제를 찾지 못했다.

## 8. 테스트 지도와 빠진 영역

CX-F-080. 후반 테스트 지도는 `web/tests`의 모든 test 파일마다 한 줄의 보호 목적과 원본 test 제목 위치를 준다. 실제 실행 결과는 CX-F-003을 적용한다. 순수 함수와 store 테스트, mocked HTTP, static markup 일부가 섞여 있다. 테스트 제목이나 source regex가 있다고 browser 상호작용을 검증한 것은 아니다.

| ID | 위 전이 중 충분한 통합 테스트가 없는 부분 | 현재 있는 보장의 한계 |
|---|---|---|
| CX-F-081 | CX-S-001부터005, LoginSheet 가입/코드/로그인/복구/로그아웃 실제 단계, 모달 취소, 새로고침, 타탭 prefix | account와 browserAccount의 서비스 규칙 및 authStore 소스 검사 위주 |
| CX-F-082 | CX-S-007과008의 새 PasswordSheet와 CloseAccountSheet 완주 | 도달 불가 옛 흐름 또는 adapter 직접 API는 검사, 새 호출 순서 누락 |
| CX-F-083 | CX-S-009부터011의 ChargeSheet와5초 polling lifecycle, 계정전환/닫힘/중복영수증 후 자동 닫힘 | depositCredit와 receipt 계약 위주 |
| CX-F-084 | CX-S-012부터018의 실제 Opening/Reveal timing, keyboard, Skip 중 재클릭, 큰 금액 confirm, unseen 복구 UI, 단일/다건 전환 | 구매 atomic성, 순수 state machine, grouping은 검사. LAB shim 조용한 저장실패는 opening 통합 누락 |
| CX-F-085 | CX-S-020부터025의 실제 TakeSheet confirm/back/retry, fresh preselection20배, 자동take effect, item 변경 및 unmount | takeFault는 강한 저장장애 테스트이지만 화면 effect와 callback lifecycle은 안 검사 |
| CX-F-086 | CX-S-026의 ShipSheet와 browser transport 정상/실패 여정 | inventory.requestShipping 직접 액션과 주소 규칙만 검사. 서비스 미구현을 놓침 |
| CX-F-087 | CX-S-028부터034의 새 WithdrawScreen 완주, pending 동안 경쟁 차감, failed debit, account switch, currency 입력 변경, cancel 이후 실제 wallet 표시 | withdrawal/securityApi/accountHttp는 helper 및 API. UI의 debit false 무시는 없음 |
| CX-F-088 | CX-S-035와036의 실제 업로드2개 경합, draft 대상변경, LAB quota, 홈 평균과 상세 평균 동일성, 타계정 작성자 및 query변경 | communityStore와 샘플/공개 feed 규칙은 검사, 현재 새 시트와 홈 연결은 아님 |
| CX-F-089 | CX-S-037과038의 manual 입력변경 중 비동기 완료, nonce 빈칸, unsafe integer, deep query/locale 전환 | verifyRecord와 HMAC, 일부 SSR chain markup은 검사 |
| CX-F-090 | CX-S-039와040의 footer locale persist, query/hash 보존, root선호도, deep404 basePath, restoreBrowserAssets 버전 및 손상 | messages key/ICU와 formatCurrency만 검사. 실제 정적 URL 전체18종 산출물 확인도 이번에 미실행 |

이어지는 상세 색인은 코드에서 읽은 것의 근거다. 짧은 코드 식은 호출 관계를 검토하기 위한 표기로, 금지된 글자 때문에 논리 부정은 `¬`, 긴 줄표와 가운뎃점은 쉼표로 옮겼다. 문구 원본을 수정하지 않았다.

## 9. import 그래프와 파일별 전수 색인

### 9.1 도달하지 않는 파일 전체

코드에서 읽은 것. TS/TSX 247개를 분석했다. 미도달은 97개다. 문자열 dynamic import를 포함했고 type-only importer는 런타임에서 제외했다. 메시지는 i18n/request의 템플릿 import로 별도 해석했다. 개발 Gallery는 그래프에 포함하되 production 접근은 차단된다.

| ID | 선언 근거 | 직접 importer 근거 | 판정 |
|---|---|---|---|
| CX-U-100 | `web/components/about/AboutSections.tsx:72` | importer 없음 | 런타임 도달 불가 |
| CX-U-101 | `web/components/about/GlobalLiveFeed.tsx:250` | importer 없음 | 런타임 도달 불가 |
| CX-U-102 | `web/components/about/ImpactStats.tsx:35` | importer 없음 | 런타임 도달 불가 |
| CX-U-103 | `web/components/about/IsometricStage.tsx:79` | importer 없음 | 런타임 도달 불가 |
| CX-U-104 | `web/components/about/LineupShowcase.tsx:42` | importer 없음 | 런타임 도달 불가 |
| CX-U-105 | `web/components/about/TrustScenes.tsx:361` | `web/components/about/ImpactStats.tsx:21` | 런타임 도달 불가 |
| CX-U-106 | `web/components/about/VaultHero.tsx:102` | importer 없음 | 런타임 도달 불가 |
| CX-U-107 | `web/components/auth/AccountClosureFlow.tsx:14` | importer 없음 | 런타임 도달 불가 |
| CX-U-108 | `web/components/auth/AuthModal.tsx:23` | importer 없음 | 런타임 도달 불가 |
| CX-U-109 | `web/components/auth/AvatarSettings.tsx:10` | importer 없음 | 런타임 도달 불가 |
| CX-U-110 | `web/components/auth/HeaderAuthControl.tsx:48` | `web/components/layout/SiteHeader.tsx:10` | 런타임 도달 불가 |
| CX-U-111 | `web/components/auth/LoginRequired.tsx:5` | `web/components/wallet/HistoryTab.tsx:15`<br>`web/components/wallet/UsdtDepositTab.tsx:14`<br>`web/components/wallet/WithdrawTab.tsx:15` | 런타임 도달 불가 |
| CX-U-112 | `web/components/auth/NicknameSettings.tsx:39` | importer 없음 | 런타임 도달 불가 |
| CX-U-113 | `web/components/auth/PasswordChangeFlow.tsx:9` | importer 없음 | 런타임 도달 불가 |
| CX-U-114 | `web/components/auth/ProfileAvatar.tsx:4` | `web/components/auth/AvatarSettings.tsx:8`<br>`web/components/auth/HeaderAuthControl.tsx:10`<br>`web/components/home/LiveReviewsSection.tsx:11` | 런타임 도달 불가 |
| CX-U-115 | `web/components/auth/ProviderMarks.tsx:3` | `web/components/auth/HeaderAuthControl.tsx:11` | 런타임 도달 불가 |
| CX-U-116 | `web/components/auth/SecuritySettings.tsx:10` | importer 없음 | 런타임 도달 불가 |
| CX-U-117 | `web/components/box/BoxCard.tsx:11` | importer 없음 | 런타임 도달 불가 |
| CX-U-118 | `web/components/box/DetailModal.tsx:40` | importer 없음 | 런타임 도달 불가 |
| CX-U-119 | `web/components/box/ProductArt.tsx:9` | `web/components/about/AboutSections.tsx:12`<br>`web/components/about/IsometricStage.tsx:7`<br>`web/components/box/BoxCard.tsx:8`<br>`web/components/box/DetailModal.tsx:38`<br>`web/components/home/CommerceHome.tsx:15`<br>`web/components/home/HallOfFame.tsx:10`<br>`web/components/home/HotBoxes.tsx:11`<br>`web/components/home/LiveReviewsSection.tsx:6`<br>`web/components/inventory/HotBoxes.tsx:11`<br>`web/components/unboxing/BulkOpenModal.tsx:18`<br>`web/components/unboxing/UnboxingRoulette.tsx:21` | 런타임 도달 불가 |
| CX-U-120 | `web/components/box/TierStrip.tsx:11` | `web/components/box/DetailModal.tsx:33` | 런타임 도달 불가 |
| CX-U-121 | `web/components/community/BoardComposer.tsx:7` | `web/components/community/CommunityBoard.tsx:8` | 런타임 도달 불가 |
| CX-U-122 | `web/components/community/CommunityBoard.tsx:20` | importer 없음 | 런타임 도달 불가 |
| CX-U-123 | `web/components/community/CommunityNavigation.tsx:11` | `web/components/community/CommunityBoard.tsx:7` | 런타임 도달 불가 |
| CX-U-124 | `web/components/community/ReviewFormModal.tsx:31` | importer 없음 | 런타임 도달 불가 |
| CX-U-125 | `web/components/community/reviewValueNotice.ts:1` | `web/components/community/ReviewFormModal.tsx:13` | 런타임 도달 불가 |
| CX-U-126 | `web/components/fairness/FairnessVerifier.tsx:42` | `web/components/fairness/VisualVerifier.tsx:12` | 런타임 도달 불가 |
| CX-U-127 | `web/components/fairness/HashExplainer.tsx:9` | importer 없음 | 런타임 도달 불가 |
| CX-U-128 | `web/components/fairness/ProofFeed.tsx:29` | importer 없음 | 런타임 도달 불가 |
| CX-U-129 | `web/components/fairness/VisualVerifier.tsx:15` | `web/components/fairness/VisualVerifyModal.tsx:9` | 런타임 도달 불가 |
| CX-U-130 | `web/components/fairness/VisualVerifyModal.tsx:11` | `web/components/unboxing/UnboxingRoulette.tsx:23` | 런타임 도달 불가 |
| CX-U-131 | `web/components/home/AboutBanner.tsx:6` | importer 없음 | 런타임 도달 불가 |
| CX-U-132 | `web/components/home/CommerceHome.tsx:21` | importer 없음 | 런타임 도달 불가 |
| CX-U-133 | `web/components/home/DailyFreeBox.tsx:34` | importer 없음 | 런타임 도달 불가 |
| CX-U-134 | `web/components/home/DiscoveryGuide.tsx:7` | importer 없음 | 런타임 도달 불가 |
| CX-U-135 | `web/components/home/HallOfFame.tsx:45` | importer 없음 | 런타임 도달 불가 |
| CX-U-136 | `web/components/home/HotBoxes.tsx:20` | importer 없음 | 런타임 도달 불가 |
| CX-U-137 | `web/components/home/JackpotPoolBadge.tsx:14` | `web/components/home/LiveTicker.tsx:14` | 런타임 도달 불가 |
| CX-U-138 | `web/components/home/LiveCounters.tsx:19` | importer 없음 | 런타임 도달 불가 |
| CX-U-139 | `web/components/home/LiveReviewsSection.tsx:60` | `web/components/home/CommerceHome.tsx:17`<br>`web/components/home/NetflixHome.tsx:15` | 런타임 도달 불가 |
| CX-U-140 | `web/components/home/LiveTicker.tsx:50` | importer 없음 | 런타임 도달 불가 |
| CX-U-141 | `web/components/home/NetflixHome.tsx:19` | importer 없음 | 런타임 도달 불가 |
| CX-U-142 | `web/components/home/ProofFeed.tsx:28` | importer 없음 | 런타임 도달 불가 |
| CX-U-143 | `web/components/home/QuickTabs.tsx:6` | `web/components/home/CommerceHome.tsx:19` (타입만)<br>`web/components/home/NetflixHome.tsx:17` (타입만) | 런타임 도달 불가 |
| CX-U-144 | `web/components/inventory/CancelShipmentModal.tsx:12` | importer 없음 | 런타임 도달 불가 |
| CX-U-145 | `web/components/inventory/DeliveryModal.tsx:23` | `web/components/unboxing/UnboxingRoulette.tsx:24` | 런타임 도달 불가 |
| CX-U-146 | `web/components/inventory/HotBoxes.tsx:14` | importer 없음 | 런타임 도달 불가 |
| CX-U-147 | `web/components/inventory/SellConfirmModal.tsx:10` | importer 없음 | 런타임 도달 불가 |
| CX-U-148 | `web/components/inventory/ShippingTicker.tsx:19` | importer 없음 | 런타임 도달 불가 |
| CX-U-149 | `web/components/inventory/TrackingModal.tsx:15` | importer 없음 | 런타임 도달 불가 |
| CX-U-150 | `web/components/layout/CurrencySelector.tsx:7` | `web/components/layout/SiteHeader.tsx:8` | 런타임 도달 불가 |
| CX-U-151 | `web/components/layout/Footer.tsx:10` | importer 없음 | 런타임 도달 불가 |
| CX-U-152 | `web/components/layout/LanguageSelector.tsx:7` | `web/components/layout/Footer.tsx:6`<br>`web/components/layout/SiteHeader.tsx:9` | 런타임 도달 불가 |
| CX-U-153 | `web/components/layout/MobileBottomNav.tsx:2` | importer 없음 | 런타임 도달 불가 |
| CX-U-154 | `web/components/layout/SiteHeader.tsx:19` | `web/components/community/CommunityBoard.tsx:6` | 런타임 도달 불가 |
| CX-U-155 | `web/components/legal/LegalNav.tsx:10` | importer 없음 | 런타임 도달 불가 |
| CX-U-156 | `web/components/legal/PolicyNotice.tsx:6` | importer 없음 | 런타임 도달 불가 |
| CX-U-157 | `web/components/ui/Approx.tsx:13` | `web/components/about/AboutSections.tsx:14`<br>`web/components/about/GlobalLiveFeed.tsx:14`<br>`web/components/about/ImpactStats.tsx:22`<br>`web/components/about/LineupShowcase.tsx:15`<br>`web/components/about/TrustScenes.tsx:21` | 런타임 도달 불가 |
| CX-U-158 | `web/components/ui/Money.tsx:6` | `web/components/about/AboutSections.tsx:13`<br>`web/components/about/GlobalLiveFeed.tsx:13`<br>`web/components/about/LineupShowcase.tsx:14`<br>`web/components/about/TrustScenes.tsx:20`<br>`web/components/box/BoxCard.tsx:9`<br>`web/components/fairness/ProofFeed.tsx:17`<br>`web/components/home/CommerceHome.tsx:16`<br>`web/components/home/DailyFreeBox.tsx:18`<br>`web/components/home/HallOfFame.tsx:11`<br>`web/components/home/HotBoxes.tsx:12`<br>`web/components/home/LiveCounters.tsx:12`<br>`web/components/home/ProofFeed.tsx:9`<br>`web/components/inventory/CancelShipmentModal.tsx:8`<br>`web/components/inventory/DeliveryModal.tsx:9`<br>`web/components/inventory/HotBoxes.tsx:12`<br>`web/components/inventory/TrackingModal.tsx:12`<br>`web/components/unboxing/BulkOpenModal.tsx:19`<br>`web/components/unboxing/UnboxingRoulette.tsx:22`<br>`web/components/wallet/DepositModal.tsx:12`<br>`web/components/wallet/HistoryTab.tsx:16`<br>`web/components/wallet/WithdrawTab.tsx:17` | 런타임 도달 불가 |
| CX-U-159 | `web/components/unboxing/AutoplaySettingsModal.tsx:23` | `web/components/box/DetailModal.tsx:34` | 런타임 도달 불가 |
| CX-U-160 | `web/components/unboxing/BulkOpenModal.tsx:24` | importer 없음 | 런타임 도달 불가 |
| CX-U-161 | `web/components/unboxing/MegaWinFX.tsx:21` | `web/components/unboxing/BulkOpenModal.tsx:20`<br>`web/components/unboxing/UnboxingRoulette.tsx:6` | 런타임 도달 불가 |
| CX-U-162 | `web/components/unboxing/UnboxingRoulette.tsx:33` | importer 없음 | 런타임 도달 불가 |
| CX-U-163 | `web/components/unboxing/UpgradeFX.tsx:8` | `web/components/unboxing/UnboxingRoulette.tsx:20` | 런타임 도달 불가 |
| CX-U-164 | `web/components/unboxing/VaultGateFX.tsx:10` | `web/components/unboxing/UnboxingRoulette.tsx:19` | 런타임 도달 불가 |
| CX-U-165 | `web/components/wallet/DepositModal.tsx:18` | importer 없음 | 런타임 도달 불가 |
| CX-U-166 | `web/components/wallet/HistoryTab.tsx:76` | `web/components/wallet/DepositModal.tsx:13` | 런타임 도달 불가 |
| CX-U-167 | `web/components/wallet/UsdtDepositTab.tsx:28` | `web/components/wallet/DepositModal.tsx:9` | 런타임 도달 불가 |
| CX-U-168 | `web/components/wallet/WithdrawalModal.tsx:11` | importer 없음 | 런타임 도달 불가 |
| CX-U-169 | `web/components/wallet/WithdrawSteps.tsx:16` | `web/components/wallet/WithdrawTab.tsx:20` | 런타임 도달 불가 |
| CX-U-170 | `web/components/wallet/WithdrawTab.tsx:23` | `web/components/wallet/DepositModal.tsx:10`<br>`web/components/wallet/WithdrawalModal.tsx:9` | 런타임 도달 불가 |
| CX-U-171 | `web/lib/aboutStats.ts:12` | `web/components/about/AboutSections.tsx:10`<br>`web/components/about/GlobalLiveFeed.tsx:11`<br>`web/components/about/ImpactStats.tsx:9`<br>`web/components/about/LineupShowcase.tsx:13`<br>`web/components/about/TrustScenes.tsx:14` | 런타임 도달 불가 |
| CX-U-172 | `web/lib/audio.ts:54` | `web/components/home/DailyFreeBox.tsx:17`<br>`web/components/unboxing/BulkOpenModal.tsx:17`<br>`web/components/unboxing/UnboxingRoulette.tsx:18`<br>`web/components/unboxing/VaultGateFX.tsx:6`<br>`web/components/wallet/UsdtDepositTab.tsx:16` | 런타임 도달 불가 |
| CX-U-173 | `web/lib/auth.ts:3` | `web/stores/authStore.ts:4` (타입만) | 런타임 도달 불가 |
| CX-U-174 | `web/lib/board.ts:2` | `web/components/community/BoardComposer.tsx:5`<br>`web/components/community/CommunityBoard.tsx:12`<br>`web/lib/boardApi.ts:2` | 런타임 도달 불가 |
| CX-U-175 | `web/lib/boardApi.ts:3` | `web/components/community/CommunityBoard.tsx:13` | 런타임 도달 불가 |
| CX-U-176 | `web/lib/catalog.ts:14` | `web/lib/data.ts:2` | 런타임 도달 불가 |
| CX-U-177 | `web/lib/communityModeration.ts:12` | `web/components/community/BoardComposer.tsx:6`<br>`web/components/community/ReviewFormModal.tsx:17`<br>`web/lib/board.ts:23` | 런타임 도달 불가 |
| CX-U-178 | `web/lib/dailyBox.ts:9` | `web/components/home/DailyFreeBox.tsx:12` | 런타임 도달 불가 |
| CX-U-179 | `web/lib/data.ts:111` | importer 없음 | 런타임 도달 불가 |
| CX-U-180 | `web/lib/engine.ts:6` | importer 없음 | 런타임 도달 불가 |
| CX-U-181 | `web/lib/fingerprint.ts:1` | importer 없음 | 런타임 도달 불가 |
| CX-U-182 | `web/lib/fraudScoring.ts:10` | importer 없음 | 런타임 도달 불가 |
| CX-U-183 | `web/lib/homeCopy.ts:5` | `web/components/home/CommerceHome.tsx:18`<br>`web/components/home/DiscoveryGuide.tsx:5`<br>`web/components/home/LiveReviewsSection.tsx:12`<br>`web/components/home/NetflixHome.tsx:16` | 런타임 도달 불가 |
| CX-U-184 | `web/lib/i18n.ts:11` | importer 없음 | 런타임 도달 불가 |
| CX-U-185 | `web/lib/liveDrops.ts:9` | `web/components/fairness/ProofFeed.tsx:12`<br>`web/components/home/HallOfFame.tsx:14`<br>`web/components/home/LiveTicker.tsx:11`<br>`web/lib/api.ts:16` (타입만) | 런타임 도달 불가 |
| CX-U-186 | `web/lib/localFiat.ts:18` | `web/components/about/ImpactStats.tsx:20`<br>`web/components/ui/Approx.tsx:4` | 런타임 도달 불가 |
| CX-U-187 | `web/lib/proofFeed.ts:13` | `web/components/fairness/ProofFeed.tsx:11`<br>`web/lib/api.ts:17` (타입만) | 런타임 도달 불가 |
| CX-U-188 | `web/lib/ranking.ts:11` | `web/components/home/HallOfFame.tsx:15` | 런타임 도달 불가 |
| CX-U-189 | `web/lib/reel.ts:10` | `web/components/unboxing/UnboxingRoulette.tsx:15` | 런타임 도달 불가 |
| CX-U-190 | `web/lib/rng.ts:4` | importer 없음 | 런타임 도달 불가 |
| CX-U-191 | `web/lib/shippingHubs.ts:11` | `web/components/about/GlobalLiveFeed.tsx:12` | 런타임 도달 불가 |
| CX-U-192 | `web/lib/useCanHover.ts:11` | importer 없음 | 런타임 도달 불가 |
| CX-U-193 | `web/stores/uiStore.ts:18` | importer 없음 | 런타임 도달 불가 |
| CX-U-194 | `web/server/rng.ts:8` | importer 없음 | 런타임 도달 불가 |
| CX-U-195 | `web/server/state.ts:5` | importer 없음 | 런타임 도달 불가 |
| CX-U-196 | `web/src/data/gachaItems.ts:12` | importer 없음 | 런타임 도달 불가 |

### 9.1a 원천 JSON과 실제 데이터 import의 구분

CX-U-400. generated.json은 `web/lib/catalog2/build.ts:10`이 실제 import한다. manifest와 원천 JSON 336개는 런타임에서 직접 import하지 않고 generated를 만드는 입력이다. 미사용 UI나 버려도 되는 자료로 분류하지 않았다. 근거 `web/lib/catalog2/build.ts:3`, `:4`, `:10`. 메시지6벌은 `web/i18n/request.ts:12`의 동적 템플릿과 루트 not-found import에서 읽는다.

| ID | 파일 | 근거와 판정 |
|---|---|---|
| CX-U-401 | `web/lib/catalog2/manifest.json:1` | build.ts:3, 런타임 직접 import 없음, 생성 명세 |
| CX-U-402 | `web/lib/catalog2/data/audio/audio-akg.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-403 | `web/lib/catalog2/data/audio/audio-audeze.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-404 | `web/lib/catalog2/data/audio/audio-audio-technica.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-405 | `web/lib/catalog2/data/audio/audio-bang-olufsen.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-406 | `web/lib/catalog2/data/audio/audio-beyerdynamic.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-407 | `web/lib/catalog2/data/audio/audio-bose.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-408 | `web/lib/catalog2/data/audio/audio-bowers-wilkins.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-409 | `web/lib/catalog2/data/audio/audio-devialet.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-410 | `web/lib/catalog2/data/audio/audio-fiio.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-411 | `web/lib/catalog2/data/audio/audio-focal.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-412 | `web/lib/catalog2/data/audio/audio-harman-kardon.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-413 | `web/lib/catalog2/data/audio/audio-jbl.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-414 | `web/lib/catalog2/data/audio/audio-kef.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-415 | `web/lib/catalog2/data/audio/audio-marshall.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-416 | `web/lib/catalog2/data/audio/audio-sennheiser.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-417 | `web/lib/catalog2/data/audio/audio-shure.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-418 | `web/lib/catalog2/data/audio/audio-sonos.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-419 | `web/lib/catalog2/data/audio/audio-sony.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-420 | `web/lib/catalog2/data/audio/audio-technics.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-421 | `web/lib/catalog2/data/audio/audio-yamaha.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-422 | `web/lib/catalog2/data/audio/pool.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-423 | `web/lib/catalog2/data/bag/bag-balenciaga.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-424 | `web/lib/catalog2/data/bag/bag-bottega-veneta.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-425 | `web/lib/catalog2/data/bag/bag-celine.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-426 | `web/lib/catalog2/data/bag/bag-chanel.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-427 | `web/lib/catalog2/data/bag/bag-chloe.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-428 | `web/lib/catalog2/data/bag/bag-delvaux.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-429 | `web/lib/catalog2/data/bag/bag-dior.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-430 | `web/lib/catalog2/data/bag/bag-fendi.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-431 | `web/lib/catalog2/data/bag/bag-ferragamo.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-432 | `web/lib/catalog2/data/bag/bag-givenchy.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-433 | `web/lib/catalog2/data/bag/bag-goyard.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-434 | `web/lib/catalog2/data/bag/bag-gucci.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-435 | `web/lib/catalog2/data/bag/bag-hermes.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-436 | `web/lib/catalog2/data/bag/bag-loewe.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-437 | `web/lib/catalog2/data/bag/bag-louis-vuitton.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-438 | `web/lib/catalog2/data/bag/bag-miu-miu.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-439 | `web/lib/catalog2/data/bag/bag-mulberry.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-440 | `web/lib/catalog2/data/bag/bag-prada.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-441 | `web/lib/catalog2/data/bag/bag-saint-laurent.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-442 | `web/lib/catalog2/data/bag/bag-valentino-garavani.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-443 | `web/lib/catalog2/data/bag/pool.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-444 | `web/lib/catalog2/data/beauty/beauty-aesop.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-445 | `web/lib/catalog2/data/beauty/beauty-byredo.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-446 | `web/lib/catalog2/data/beauty/beauty-chanel.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-447 | `web/lib/catalog2/data/beauty/beauty-creed.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-448 | `web/lib/catalog2/data/beauty/beauty-dior.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-449 | `web/lib/catalog2/data/beauty/beauty-diptyque.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-450 | `web/lib/catalog2/data/beauty/beauty-dyson.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-451 | `web/lib/catalog2/data/beauty/beauty-estee-lauder.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-452 | `web/lib/catalog2/data/beauty/beauty-jo-malone.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-453 | `web/lib/catalog2/data/beauty/beauty-kiehls.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-454 | `web/lib/catalog2/data/beauty/beauty-la-mer.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-455 | `web/lib/catalog2/data/beauty/beauty-lancome.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-456 | `web/lib/catalog2/data/beauty/beauty-le-labo.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-457 | `web/lib/catalog2/data/beauty/beauty-loccitane.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-458 | `web/lib/catalog2/data/beauty/beauty-maison-francis-kurkdjian.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-459 | `web/lib/catalog2/data/beauty/beauty-maison-margiela.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-460 | `web/lib/catalog2/data/beauty/beauty-prada.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-461 | `web/lib/catalog2/data/beauty/beauty-sk-ii.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-462 | `web/lib/catalog2/data/beauty/beauty-tom-ford.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-463 | `web/lib/catalog2/data/beauty/beauty-ysl.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-464 | `web/lib/catalog2/data/beauty/pool.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-465 | `web/lib/catalog2/data/camera/camera-canon.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-466 | `web/lib/catalog2/data/camera/camera-dji.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-467 | `web/lib/catalog2/data/camera/camera-fujifilm.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-468 | `web/lib/catalog2/data/camera/camera-godox.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-469 | `web/lib/catalog2/data/camera/camera-gopro.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-470 | `web/lib/catalog2/data/camera/camera-hasselblad.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-471 | `web/lib/catalog2/data/camera/camera-insta360.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-472 | `web/lib/catalog2/data/camera/camera-leica.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-473 | `web/lib/catalog2/data/camera/camera-nikon.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-474 | `web/lib/catalog2/data/camera/camera-om-system.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-475 | `web/lib/catalog2/data/camera/camera-panasonic.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-476 | `web/lib/catalog2/data/camera/camera-pentax.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-477 | `web/lib/catalog2/data/camera/camera-phase-one.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-478 | `web/lib/catalog2/data/camera/camera-profoto.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-479 | `web/lib/catalog2/data/camera/camera-ricoh.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-480 | `web/lib/catalog2/data/camera/camera-samyang.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-481 | `web/lib/catalog2/data/camera/camera-sigma.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-482 | `web/lib/catalog2/data/camera/camera-sony.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-483 | `web/lib/catalog2/data/camera/camera-tamron.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-484 | `web/lib/catalog2/data/camera/camera-zeiss.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-485 | `web/lib/catalog2/data/camera/pool.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-486 | `web/lib/catalog2/data/car/car-aston-martin.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-487 | `web/lib/catalog2/data/car/car-audi.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-488 | `web/lib/catalog2/data/car/car-bentley.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-489 | `web/lib/catalog2/data/car/car-bmw.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-490 | `web/lib/catalog2/data/car/car-cadillac.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-491 | `web/lib/catalog2/data/car/car-ford.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-492 | `web/lib/catalog2/data/car/car-genesis.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-493 | `web/lib/catalog2/data/car/car-hyundai.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-494 | `web/lib/catalog2/data/car/car-kia.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-495 | `web/lib/catalog2/data/car/car-land-rover.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-496 | `web/lib/catalog2/data/car/car-lexus.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-497 | `web/lib/catalog2/data/car/car-lincoln.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-498 | `web/lib/catalog2/data/car/car-maserati.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-499 | `web/lib/catalog2/data/car/car-maybach.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-500 | `web/lib/catalog2/data/car/car-porsche.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-501 | `web/lib/catalog2/data/car/car-rolls-royce.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-502 | `web/lib/catalog2/data/car/car-supercar.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-503 | `web/lib/catalog2/data/car/car-tesla.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-504 | `web/lib/catalog2/data/car/car-toyota.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-505 | `web/lib/catalog2/data/car/car-volvo.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-506 | `web/lib/catalog2/data/car/pool.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-507 | `web/lib/catalog2/data/computer/computer-acer.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-508 | `web/lib/catalog2/data/computer/computer-amd.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-509 | `web/lib/catalog2/data/computer/computer-apple.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-510 | `web/lib/catalog2/data/computer/computer-asus.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-511 | `web/lib/catalog2/data/computer/computer-benq.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-512 | `web/lib/catalog2/data/computer/computer-corsair.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-513 | `web/lib/catalog2/data/computer/computer-dell.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-514 | `web/lib/catalog2/data/computer/computer-eizo.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-515 | `web/lib/catalog2/data/computer/computer-gigabyte.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-516 | `web/lib/catalog2/data/computer/computer-hp.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-517 | `web/lib/catalog2/data/computer/computer-intel.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-518 | `web/lib/catalog2/data/computer/computer-keychron.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-519 | `web/lib/catalog2/data/computer/computer-lenovo.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-520 | `web/lib/catalog2/data/computer/computer-lg.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-521 | `web/lib/catalog2/data/computer/computer-logitech.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-522 | `web/lib/catalog2/data/computer/computer-microsoft.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-523 | `web/lib/catalog2/data/computer/computer-msi.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-524 | `web/lib/catalog2/data/computer/computer-nvidia.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-525 | `web/lib/catalog2/data/computer/computer-razer.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-526 | `web/lib/catalog2/data/computer/computer-samsung.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-527 | `web/lib/catalog2/data/computer/pool.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-528 | `web/lib/catalog2/data/fashion/fashion-adidas.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-529 | `web/lib/catalog2/data/fashion/fashion-arcteryx.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-530 | `web/lib/catalog2/data/fashion/fashion-asics.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-531 | `web/lib/catalog2/data/fashion/fashion-birkenstock.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-532 | `web/lib/catalog2/data/fashion/fashion-burberry.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-533 | `web/lib/catalog2/data/fashion/fashion-canada-goose.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-534 | `web/lib/catalog2/data/fashion/fashion-converse.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-535 | `web/lib/catalog2/data/fashion/fashion-dr-martens.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-536 | `web/lib/catalog2/data/fashion/fashion-hoka.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-537 | `web/lib/catalog2/data/fashion/fashion-jordan.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-538 | `web/lib/catalog2/data/fashion/fashion-moncler.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-539 | `web/lib/catalog2/data/fashion/fashion-new-balance.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-540 | `web/lib/catalog2/data/fashion/fashion-nike.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-541 | `web/lib/catalog2/data/fashion/fashion-on.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-542 | `web/lib/catalog2/data/fashion/fashion-patagonia.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-543 | `web/lib/catalog2/data/fashion/fashion-salomon.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-544 | `web/lib/catalog2/data/fashion/fashion-the-north-face.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-545 | `web/lib/catalog2/data/fashion/fashion-timberland.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-546 | `web/lib/catalog2/data/fashion/fashion-ugg.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-547 | `web/lib/catalog2/data/fashion/fashion-vans.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-548 | `web/lib/catalog2/data/fashion/pool.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-549 | `web/lib/catalog2/data/gaming/gaming-8bitdo.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-550 | `web/lib/catalog2/data/gaming/gaming-asus.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-551 | `web/lib/catalog2/data/gaming/gaming-avermedia.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-552 | `web/lib/catalog2/data/gaming/gaming-corsair.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-553 | `web/lib/catalog2/data/gaming/gaming-elgato.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-554 | `web/lib/catalog2/data/gaming/gaming-fanatec.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-555 | `web/lib/catalog2/data/gaming/gaming-hyperx.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-556 | `web/lib/catalog2/data/gaming/gaming-logitech.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-557 | `web/lib/catalog2/data/gaming/gaming-moza.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-558 | `web/lib/catalog2/data/gaming/gaming-msi.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-559 | `web/lib/catalog2/data/gaming/gaming-nintendo.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-560 | `web/lib/catalog2/data/gaming/gaming-playstation.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-561 | `web/lib/catalog2/data/gaming/gaming-razer.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-562 | `web/lib/catalog2/data/gaming/gaming-scuf.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-563 | `web/lib/catalog2/data/gaming/gaming-steelseries.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-564 | `web/lib/catalog2/data/gaming/gaming-thrustmaster.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-565 | `web/lib/catalog2/data/gaming/gaming-turtle-beach.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-566 | `web/lib/catalog2/data/gaming/gaming-valve.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-567 | `web/lib/catalog2/data/gaming/gaming-victrix.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-568 | `web/lib/catalog2/data/gaming/gaming-xbox.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-569 | `web/lib/catalog2/data/gaming/pool.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-570 | `web/lib/catalog2/data/home/home-balmuda.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-571 | `web/lib/catalog2/data/home/home-braun.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-572 | `web/lib/catalog2/data/home/home-breville.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-573 | `web/lib/catalog2/data/home/home-coway.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-574 | `web/lib/catalog2/data/home/home-cuckoo.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-575 | `web/lib/catalog2/data/home/home-delonghi.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-576 | `web/lib/catalog2/data/home/home-dreame.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-577 | `web/lib/catalog2/data/home/home-dyson.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-578 | `web/lib/catalog2/data/home/home-ecovacs.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-579 | `web/lib/catalog2/data/home/home-irobot.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-580 | `web/lib/catalog2/data/home/home-lg.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-581 | `web/lib/catalog2/data/home/home-miele.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-582 | `web/lib/catalog2/data/home/home-ninja.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-583 | `web/lib/catalog2/data/home/home-panasonic.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-584 | `web/lib/catalog2/data/home/home-philips.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-585 | `web/lib/catalog2/data/home/home-roborock.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-586 | `web/lib/catalog2/data/home/home-samsung.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-587 | `web/lib/catalog2/data/home/home-shark.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-588 | `web/lib/catalog2/data/home/home-smeg.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-589 | `web/lib/catalog2/data/home/home-xiaomi.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-590 | `web/lib/catalog2/data/home/pool.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-591 | `web/lib/catalog2/data/jewelry/jewelry-boucheron.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-592 | `web/lib/catalog2/data/jewelry/jewelry-buccellati.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-593 | `web/lib/catalog2/data/jewelry/jewelry-bvlgari.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-594 | `web/lib/catalog2/data/jewelry/jewelry-cartier.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-595 | `web/lib/catalog2/data/jewelry/jewelry-chaumet.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-596 | `web/lib/catalog2/data/jewelry/jewelry-chopard.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-597 | `web/lib/catalog2/data/jewelry/jewelry-damiani.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-598 | `web/lib/catalog2/data/jewelry/jewelry-david-yurman.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-599 | `web/lib/catalog2/data/jewelry/jewelry-fred.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-600 | `web/lib/catalog2/data/jewelry/jewelry-graff.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-601 | `web/lib/catalog2/data/jewelry/jewelry-harry-winston.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-602 | `web/lib/catalog2/data/jewelry/jewelry-messika.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-603 | `web/lib/catalog2/data/jewelry/jewelry-mikimoto.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-604 | `web/lib/catalog2/data/jewelry/jewelry-piaget.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-605 | `web/lib/catalog2/data/jewelry/jewelry-pomellato.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-606 | `web/lib/catalog2/data/jewelry/jewelry-repossi.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-607 | `web/lib/catalog2/data/jewelry/jewelry-swarovski.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-608 | `web/lib/catalog2/data/jewelry/jewelry-tasaki.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-609 | `web/lib/catalog2/data/jewelry/jewelry-tiffany.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-610 | `web/lib/catalog2/data/jewelry/jewelry-van-cleef-arpels.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-611 | `web/lib/catalog2/data/jewelry/pool.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-612 | `web/lib/catalog2/data/mobile/mobile-anker.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-613 | `web/lib/catalog2/data/mobile/mobile-apple.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-614 | `web/lib/catalog2/data/mobile/mobile-asus.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-615 | `web/lib/catalog2/data/mobile/mobile-google.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-616 | `web/lib/catalog2/data/mobile/mobile-hmd.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-617 | `web/lib/catalog2/data/mobile/mobile-honor.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-618 | `web/lib/catalog2/data/mobile/mobile-huawei.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-619 | `web/lib/catalog2/data/mobile/mobile-infinix.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-620 | `web/lib/catalog2/data/mobile/mobile-lenovo.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-621 | `web/lib/catalog2/data/mobile/mobile-motorola.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-622 | `web/lib/catalog2/data/mobile/mobile-nothing.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-623 | `web/lib/catalog2/data/mobile/mobile-oneplus.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-624 | `web/lib/catalog2/data/mobile/mobile-oppo.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-625 | `web/lib/catalog2/data/mobile/mobile-realme.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-626 | `web/lib/catalog2/data/mobile/mobile-redmagic.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-627 | `web/lib/catalog2/data/mobile/mobile-samsung.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-628 | `web/lib/catalog2/data/mobile/mobile-sony.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-629 | `web/lib/catalog2/data/mobile/mobile-tecno.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-630 | `web/lib/catalog2/data/mobile/mobile-vivo.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-631 | `web/lib/catalog2/data/mobile/mobile-xiaomi.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-632 | `web/lib/catalog2/data/mobile/pool.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-633 | `web/lib/catalog2/data/outdoor/outdoor-big-agnes.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-634 | `web/lib/catalog2/data/outdoor/outdoor-biolite.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-635 | `web/lib/catalog2/data/outdoor/outdoor-black-diamond.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-636 | `web/lib/catalog2/data/outdoor/outdoor-coleman.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-637 | `web/lib/catalog2/data/outdoor/outdoor-deuter.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-638 | `web/lib/catalog2/data/outdoor/outdoor-dometic.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-639 | `web/lib/catalog2/data/outdoor/outdoor-gregory.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-640 | `web/lib/catalog2/data/outdoor/outdoor-helinox.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-641 | `web/lib/catalog2/data/outdoor/outdoor-hilleberg.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-642 | `web/lib/catalog2/data/outdoor/outdoor-leatherman.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-643 | `web/lib/catalog2/data/outdoor/outdoor-montbell.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-644 | `web/lib/catalog2/data/outdoor/outdoor-msr.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-645 | `web/lib/catalog2/data/outdoor/outdoor-nemo.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-646 | `web/lib/catalog2/data/outdoor/outdoor-osprey.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-647 | `web/lib/catalog2/data/outdoor/outdoor-petzl.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-648 | `web/lib/catalog2/data/outdoor/outdoor-sea-to-summit.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-649 | `web/lib/catalog2/data/outdoor/outdoor-snow-peak.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-650 | `web/lib/catalog2/data/outdoor/outdoor-stanley.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-651 | `web/lib/catalog2/data/outdoor/outdoor-therm-a-rest.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-652 | `web/lib/catalog2/data/outdoor/outdoor-yeti.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-653 | `web/lib/catalog2/data/outdoor/pool.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-654 | `web/lib/catalog2/data/pokemon/pokemon-alakazam.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-655 | `web/lib/catalog2/data/pokemon/pokemon-blastoise.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-656 | `web/lib/catalog2/data/pokemon/pokemon-charizard.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-657 | `web/lib/catalog2/data/pokemon/pokemon-dragonite.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-658 | `web/lib/catalog2/data/pokemon/pokemon-espeon.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-659 | `web/lib/catalog2/data/pokemon/pokemon-gengar.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-660 | `web/lib/catalog2/data/pokemon/pokemon-giratina.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-661 | `web/lib/catalog2/data/pokemon/pokemon-glaceon.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-662 | `web/lib/catalog2/data/pokemon/pokemon-leafeon.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-663 | `web/lib/catalog2/data/pokemon/pokemon-lugia.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-664 | `web/lib/catalog2/data/pokemon/pokemon-magikarp.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-665 | `web/lib/catalog2/data/pokemon/pokemon-mew.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-666 | `web/lib/catalog2/data/pokemon/pokemon-mewtwo.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-667 | `web/lib/catalog2/data/pokemon/pokemon-pikachu.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-668 | `web/lib/catalog2/data/pokemon/pokemon-rayquaza.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-669 | `web/lib/catalog2/data/pokemon/pokemon-snorlax.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-670 | `web/lib/catalog2/data/pokemon/pokemon-sylveon.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-671 | `web/lib/catalog2/data/pokemon/pokemon-umbreon.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-672 | `web/lib/catalog2/data/pokemon/pokemon-venusaur.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-673 | `web/lib/catalog2/data/pokemon/pokemon-zapdos.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-674 | `web/lib/catalog2/data/pokemon/pool.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-675 | `web/lib/catalog2/data/sport/pool.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-676 | `web/lib/catalog2/data/sport/sport-adidas.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-677 | `web/lib/catalog2/data/sport/sport-babolat.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-678 | `web/lib/catalog2/data/sport/sport-bala.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-679 | `web/lib/catalog2/data/sport/sport-concept2.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-680 | `web/lib/catalog2/data/sport/sport-eleiko.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-681 | `web/lib/catalog2/data/sport/sport-garmin.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-682 | `web/lib/catalog2/data/sport/sport-hayabusa.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-683 | `web/lib/catalog2/data/sport/sport-head.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-684 | `web/lib/catalog2/data/sport/sport-hyperice.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-685 | `web/lib/catalog2/data/sport/sport-manduka.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-686 | `web/lib/catalog2/data/sport/sport-mikasa.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-687 | `web/lib/catalog2/data/sport/sport-polar.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-688 | `web/lib/catalog2/data/sport/sport-rogue.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-689 | `web/lib/catalog2/data/sport/sport-scotty-cameron.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-690 | `web/lib/catalog2/data/sport/sport-speedo.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-691 | `web/lib/catalog2/data/sport/sport-therabody.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-692 | `web/lib/catalog2/data/sport/sport-titleist.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-693 | `web/lib/catalog2/data/sport/sport-trx.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-694 | `web/lib/catalog2/data/sport/sport-wilson.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-695 | `web/lib/catalog2/data/sport/sport-yonex.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-696 | `web/lib/catalog2/data/toy/pool.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-697 | `web/lib/catalog2/data/toy/toy-bandai.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-698 | `web/lib/catalog2/data/toy/toy-barbie.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-699 | `web/lib/catalog2/data/toy/toy-brio.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-700 | `web/lib/catalog2/data/toy/toy-good-smile.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-701 | `web/lib/catalog2/data/toy/toy-hot-wheels.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-702 | `web/lib/catalog2/data/toy/toy-jellycat.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-703 | `web/lib/catalog2/data/toy/toy-lego.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-704 | `web/lib/catalog2/data/toy/toy-maileg.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-705 | `web/lib/catalog2/data/toy/toy-mega.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-706 | `web/lib/catalog2/data/toy/toy-nerf.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-707 | `web/lib/catalog2/data/toy/toy-playmobil.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-708 | `web/lib/catalog2/data/toy/toy-pop-mart.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-709 | `web/lib/catalog2/data/toy/toy-ravensburger.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-710 | `web/lib/catalog2/data/toy/toy-schleich.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-711 | `web/lib/catalog2/data/toy/toy-siku.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-712 | `web/lib/catalog2/data/toy/toy-smiski.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-713 | `web/lib/catalog2/data/toy/toy-steiff.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-714 | `web/lib/catalog2/data/toy/toy-sylvanian-families.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-715 | `web/lib/catalog2/data/toy/toy-tamiya.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-716 | `web/lib/catalog2/data/toy/toy-tomica.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-717 | `web/lib/catalog2/data/watch/pool.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-718 | `web/lib/catalog2/data/watch/watch-a-lange-sohne.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-719 | `web/lib/catalog2/data/watch/watch-audemars-piguet.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-720 | `web/lib/catalog2/data/watch/watch-blancpain.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-721 | `web/lib/catalog2/data/watch/watch-breguet.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-722 | `web/lib/catalog2/data/watch/watch-breitling.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-723 | `web/lib/catalog2/data/watch/watch-cartier.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-724 | `web/lib/catalog2/data/watch/watch-grand-seiko.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-725 | `web/lib/catalog2/data/watch/watch-hublot.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-726 | `web/lib/catalog2/data/watch/watch-iwc.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-727 | `web/lib/catalog2/data/watch/watch-jaeger-lecoultre.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-728 | `web/lib/catalog2/data/watch/watch-longines.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-729 | `web/lib/catalog2/data/watch/watch-omega.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-730 | `web/lib/catalog2/data/watch/watch-panerai.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-731 | `web/lib/catalog2/data/watch/watch-patek-philippe.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-732 | `web/lib/catalog2/data/watch/watch-rolex.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-733 | `web/lib/catalog2/data/watch/watch-seiko.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-734 | `web/lib/catalog2/data/watch/watch-tag-heuer.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-735 | `web/lib/catalog2/data/watch/watch-tudor.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-736 | `web/lib/catalog2/data/watch/watch-vacheron-constantin.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |
| CX-U-737 | `web/lib/catalog2/data/watch/watch-zenith.json:1` | build.ts:4, generated의 원천 입력, 런타임 직접 import 없음 |

### 9.2 실제 도달 컴포넌트의 직접 JSX 나무

코드에서 읽은 것. 같은 파일의 내부 함수와 외부 primitive도 포함한다. store import는 해당 행과 4절을 연결한다.

| ID | 파일 | 직접 JSX 호출과 줄 | store import 근거 |
|---|---|---|---|
| CX-U-197 | `web/components/account/AccountScreen.tsx:1` | `ScreenHead:44`, `Skeleton:45`, `Button:46`, `TextLink:46`, `Rows:49`, `Link:50`, `Row:59`, `Sheet:75`, `TwoFactorSetup:76`, `NicknameSheet:78`, `PasswordSheet:79`, `CloseAccountSheet:80`, `Confirm:81` | `web/stores/authStore.ts (web/components/account/AccountScreen.tsx:12)`<br>`web/stores/walletStore.ts (web/components/account/AccountScreen.tsx:13)`<br>`web/stores/inventoryStore.ts (web/components/account/AccountScreen.tsx:14)`<br>`web/stores/securityStore.ts (web/components/account/AccountScreen.tsx:15)` |
| CX-U-198 | `web/components/account/AccountSheets.tsx:1` | `Sheet:38`, `Field:39`, `Line:40`, `Button:42`, `Confirm:101` | `web/stores/authStore.ts (web/components/account/AccountSheets.tsx:9)` |
| CX-U-199 | `web/components/auth/AuthHost.tsx:1` | `LoginSheet:50` | `web/stores/authStore.ts (web/components/auth/AuthHost.tsx:4)`<br>`web/stores/securityStore.ts (web/components/auth/AuthHost.tsx:5)`<br>`web/stores/walletStore.ts (web/components/auth/AuthHost.tsx:9)` |
| CX-U-200 | `web/components/box/BoxList.tsx:1` | `HeroBanner:81`, `ScreenHead:82`, `Search:85`, `Empty:87`, `Link:91`, `Chips:102`, `BoxCard:104`, `Button:106`, `RatingInline:126` | `web/stores/inventoryStore.ts (web/components/box/BoxList.tsx:18)` |
| CX-U-201 | `web/components/box/BoxReviews.tsx:1` | `Star:38`, `Stars:62`, `Sheet:152`, `Rows:159`, `Row:160`, `TextLink:166`, `Empty:182`, `RatingBlock:184`, `ScrollRow:186`, `ReviewCard:186`, `ReviewSheet:194` | `web/stores/authStore.ts (web/components/box/BoxReviews.tsx:24)`<br>`web/stores/inventoryStore.ts (web/components/box/BoxReviews.tsx:25)`<br>`web/stores/usePublishedReviews.ts (web/components/box/BoxReviews.tsx:26)` |
| CX-U-202 | `web/components/box/BoxScreen.tsx:1` | `ScreenHead:175`, `RatingInline:176`, `BoxReviews:188`, `Rows:191`, `Row:192`, `Line:198`, `Link:200`, `Chips:203`, `Button:204`, `TextLink:207`, `ItemCard:223`, `Sheet:281`, `Confirm:316`, `TakeSheet:318`, `Opening:319`, `Reveal:320`, `Coins:328`, `CreditCard:328`, `Package:328` | `web/stores/settingsStore.ts (web/components/box/BoxScreen.tsx:26)`<br>`web/stores/openingJournal.ts (web/components/box/BoxScreen.tsx:28)`<br>`web/stores/authStore.ts (web/components/box/BoxScreen.tsx:31)`<br>`web/stores/walletStore.ts (web/components/box/BoxScreen.tsx:32)`<br>`web/stores/flowStore.ts (web/components/box/BoxScreen.tsx:36)`<br>`web/stores/inventoryStore.ts (web/components/box/BoxScreen.tsx:37)` |
| CX-U-203 | `web/components/box/Opening.tsx:1` | `Star:55`, `Button:194`, `TextLink:203`, `SlidersHorizontal:213`, `X:214`, `OpeningBox:220`, `BrandLogo:243`, `Line:266`, `TakeConfirm:322`, `TakeSheet:324`, `OpeningSettings:325`, `VerifySheet:326`, `Sheet:344`, `Confirm:352` | `web/stores/walletStore.ts (web/components/box/Opening.tsx:29)`<br>`web/stores/settingsStore.ts (web/components/box/Opening.tsx:31)`<br>`web/stores/inventoryStore.ts (web/components/box/Opening.tsx:32)`<br>`web/stores/flowStore.ts (web/components/box/Opening.tsx:33)` |
| CX-U-204 | `web/components/box/Reveal.tsx:1` | `Button:148`, `Line:151`, `TextLink:154`, `ButtonLink:162`, `OpeningBox:172`, `X:179`, `Rows:189`, `Row:189`, `Sheet:284`, `VerifySheet:297`, `TakeSheet:299`, `TakeConfirm:301` | `web/stores/walletStore.ts (web/components/box/Reveal.tsx:24)`<br>`web/stores/inventoryStore.ts (web/components/box/Reveal.tsx:25)`<br>`web/stores/flowStore.ts (web/components/box/Reveal.tsx:26)` |
| CX-U-205 | `web/components/box/ReviewsScreen.tsx:1` | `ScreenHead:33`, `Chips:34`, `Empty:35`, `RatingBlock:37`, `ReviewCard:38`, `TextLink:41`, `ReviewSheet:42` | 직접 import 없음 |
| CX-U-206 | `web/components/box/WinsScreen.tsx:1` | `ScreenHead:57`, `Skeleton:58`, `Line:59`, `Button:59`, `Empty:65`, `ButtonLink:65`, `Package:75`, `TextLink:88`, `Sheet:94`, `Rows:99`, `Row:100`, `VerifySheet:114` | `web/stores/authStore.ts (web/components/box/WinsScreen.tsx:20)`<br>`web/stores/inventoryStore.ts (web/components/box/WinsScreen.tsx:21)`<br>`web/stores/walletStore.ts (web/components/box/WinsScreen.tsx:22)` |
| CX-U-207 | `web/components/dev/Gallery.tsx:1` | `ScreenHead:68`, `Button:71`, `ButtonLink:75`, `TextLink:78`, `Chips:80`, `Card:83`, `Rows:85`, `Row:85`, `Field:88`, `Line:88`, `Empty:94`, `Skeleton:95`, `ChainRecordView:98`, `VerifyMethod:100`, `Sheet:128`, `Confirm:133`, `VerifySheet:137`, `ShipSheet:138`, `Reveal:139` | `web/stores/authStore.ts (web/components/dev/Gallery.tsx:12)`<br>`web/stores/flowStore.ts (web/components/dev/Gallery.tsx:13)` |
| CX-U-208 | `web/components/fairness/verifyRecord.ts:1` |  | `web/stores/inventoryStore.ts (web/components/fairness/verifyRecord.ts:2)` |
| CX-U-209 | `web/components/flow/BalanceSheet.tsx:1` | `Sheet:38`, `Button:39`, `Rows:47`, `Row:48`, `TextLink:54`, `TakeSheet:59` | `web/stores/flowStore.ts (web/components/flow/BalanceSheet.tsx:12)`<br>`web/stores/authStore.ts (web/components/flow/BalanceSheet.tsx:13)`<br>`web/stores/walletStore.ts (web/components/flow/BalanceSheet.tsx:14)`<br>`web/stores/inventoryStore.ts (web/components/flow/BalanceSheet.tsx:15)` |
| CX-U-210 | `web/components/flow/ChargeSheet.tsx:1` | `Sheet:38`, `Button:39`, `Chips:45`, `QRCodeSVG:49`, `Line:52` | `web/stores/flowStore.ts (web/components/flow/ChargeSheet.tsx:12)`<br>`web/stores/authStore.ts (web/components/flow/ChargeSheet.tsx:13)` |
| CX-U-211 | `web/components/flow/LoginSheet.tsx:1` | `Sheet:84`, `Button:86`, `Field:89`, `Line:93`, `ProviderMark:100`, `TextLink:105` | `web/stores/authStore.ts (web/components/flow/LoginSheet.tsx:9)` |
| CX-U-212 | `web/components/flow/ProviderMark.tsx:1` |  | 직접 import 없음 |
| CX-U-213 | `web/components/flow/ReviewSheet.tsx:1` | `Sheet:55`, `Chips:56`, `Line:66`, `Button:69` | `web/stores/communityStore.ts (web/components/flow/ReviewSheet.tsx:9)`<br>`web/stores/inventoryStore.ts (web/components/flow/ReviewSheet.tsx:10)` |
| CX-U-214 | `web/components/flow/ShipSheet.tsx:1` | `Sheet:62`, `Chips:63`, `Field:64`, `Line:65`, `Rows:74`, `Row:74`, `Button:77`, `Confirm:79` | `web/stores/inventoryStore.ts (web/components/flow/ShipSheet.tsx:12)`<br>`web/stores/walletStore.ts (web/components/flow/ShipSheet.tsx:13)` |
| CX-U-215 | `web/components/flow/TakeSheet.tsx:1` | `Confirm:56`, `Sheet:150`, `Skeleton:154`, `Button:155`, `Empty:159`, `Check:168`, `Minus:168`, `TakeConfirm:197`, `Line:202`, `TextLink:240` | `web/stores/authStore.ts (web/components/flow/TakeSheet.tsx:22)`<br>`web/stores/inventoryStore.ts (web/components/flow/TakeSheet.tsx:23)`<br>`web/stores/walletStore.ts (web/components/flow/TakeSheet.tsx:24)` |
| CX-U-216 | `web/components/flow/VerifySheet.tsx:1` | `Sheet:57`, `Rows:62`, `Row:63`, `ChainRecordView:70`, `Line:83`, `TextLink:88`, `VerifyMethod:91` | `web/stores/inventoryStore.ts (web/components/flow/VerifySheet.tsx:17)` |
| CX-U-217 | `web/components/home/heroBall.ts:1` |  | 직접 import 없음 |
| CX-U-218 | `web/components/home/HeroBanner.tsx:1` | `OpeningBox:148`, `Link:184` | `web/stores/authStore.ts (web/components/home/HeroBanner.tsx:20)`<br>`web/stores/walletStore.ts (web/components/home/HeroBanner.tsx:21)` |
| CX-U-219 | `web/components/inventory/InventoryScreen.tsx:1` | `ScreenHead:112`, `Skeleton:113`, `Line:114`, `Button:114`, `Chips:117`, `Empty:121`, `ButtonLink:121`, `TextLink:138`, `Sheet:142`, `Rows:145`, `Row:146`, `ShipSheet:180`, `VerifySheet:181`, `ReviewSheet:182`, `TakeSheet:184`, `TakeConfirm:186`, `Confirm:187` | `web/stores/authStore.ts (web/components/inventory/InventoryScreen.tsx:22)`<br>`web/stores/inventoryStore.ts (web/components/inventory/InventoryScreen.tsx:23)`<br>`web/stores/communityStore.ts (web/components/inventory/InventoryScreen.tsx:31)` |
| CX-U-220 | `web/components/layout/BrandLogo.tsx:1` | `BrandLogoShapes:34`, `Link:37` | 직접 import 없음 |
| CX-U-221 | `web/components/layout/CurrencyHydrator.tsx:1` |  | `web/stores/currencyStore.ts (web/components/layout/CurrencyHydrator.tsx:4)`<br>`web/stores/walletStore.ts (web/components/layout/CurrencyHydrator.tsx:5)`<br>`web/stores/fairStore.ts (web/components/layout/CurrencyHydrator.tsx:6)`<br>`web/stores/settingsStore.ts (web/components/layout/CurrencyHydrator.tsx:7)`<br>`web/stores/inventoryStore.ts (web/components/layout/CurrencyHydrator.tsx:8)`<br>`web/stores/dailyStore.ts (web/components/layout/CurrencyHydrator.tsx:9)`<br>`web/stores/communityStore.ts (web/components/layout/CurrencyHydrator.tsx:10)`<br>`web/stores/telemetryStore.ts (web/components/layout/CurrencyHydrator.tsx:11)` |
| CX-U-222 | `web/components/layout/LabBadge.tsx:1` |  | 직접 import 없음 |
| CX-U-223 | `web/components/layout/LocaleHtmlLang.tsx:1` |  | 직접 import 없음 |
| CX-U-224 | `web/components/layout/MotionPreferences.tsx:1` | `MotionConfig:6` | 직접 import 없음 |
| CX-U-225 | `web/components/legal/LegalCenterScreen.tsx:1` | `ScreenHead:15`, `Link:22` | 직접 import 없음 |
| CX-U-226 | `web/components/legal/LegalDocScreen.tsx:1` | `ScreenHead:15`, `TextLink:25` | 직접 import 없음 |
| CX-U-227 | `web/components/shell/AppFooter.tsx:1` | `Instagram:18`, `Youtube:19`, `Send:20`, `Link:32`, `BrandLogoShapes:74` | 직접 import 없음 |
| CX-U-228 | `web/components/shell/AppShell.tsx:1` | `BrandLogo:47`, `Link:49`, `Menu:54`, `OfflineLine:57`, `SessionLine:58`, `Sheet:60`, `ChargeSheet:65`, `BalanceSheet:66`, `ToastHost:67` | `web/stores/authStore.ts (web/components/shell/AppShell.tsx:12)`<br>`web/stores/walletStore.ts (web/components/shell/AppShell.tsx:13)`<br>`web/stores/flowStore.ts (web/components/shell/AppShell.tsx:14)` |
| CX-U-229 | `web/components/shell/GuideFees.tsx:1` | `Rows:14`, `Row:15` | 직접 import 없음 |
| CX-U-230 | `web/components/shell/MovedScreen.tsx:1` | `ScreenHead:13`, `ButtonLink:14` | 직접 import 없음 |
| CX-U-231 | `web/components/shell/StateScreens.tsx:1` | `AppShell:14`, `ScreenHead:16`, `ButtonLink:17`, `Button:29` | `web/stores/authStore.ts (web/components/shell/StateScreens.tsx:7)` |
| CX-U-232 | `web/components/ui/kit.tsx:1` | `Link:24`, `ChevronLeft:50` | 직접 import 없음 |
| CX-U-233 | `web/components/ui/ScrollRow.tsx:1` | `ChevronLeft:33`, `ChevronRight:34` | 직접 import 없음 |
| CX-U-234 | `web/components/ui/Sheet.tsx:1` | `X:19`, `Button:44`, `TextLink:45` | 직접 import 없음 |
| CX-U-235 | `web/components/ui/toast.tsx:1` |  | 직접 import 없음 |
| CX-U-236 | `web/components/verify/ChainRecord.tsx:1` |  | 직접 import 없음 |
| CX-U-237 | `web/components/verify/VerifyMethod.tsx:1` |  | 직접 import 없음 |
| CX-U-238 | `web/components/verify/VerifyScreen.tsx:1` | `ScreenHead:72`, `Skeleton:76`, `Line:77`, `Button:77`, `Empty:78`, `TextLink:91`, `Field:99`, `Chips:103`, `Rows:108`, `Row:109`, `VerifyMethod:122`, `VerifySheet:125` | `web/stores/authStore.ts (web/components/verify/VerifyScreen.tsx:15)`<br>`web/stores/inventoryStore.ts (web/components/verify/VerifyScreen.tsx:16)` |
| CX-U-239 | `web/components/wallet/TwoFactorSetup.tsx:1` | `Line:73`, `Button:73`, `QRCodeSVG:87`, `TextLink:90`, `Field:93` | `web/stores/securityStore.ts (web/components/wallet/TwoFactorSetup.tsx:13)`<br>`web/stores/authStore.ts (web/components/wallet/TwoFactorSetup.tsx:16)` |
| CX-U-240 | `web/components/wallet/WalletScreen.tsx:1` | `ScreenHead:92`, `Skeleton:93`, `Line:94`, `Button:94`, `Rows:98`, `Row:99`, `TextLink:103`, `Empty:107`, `Sheet:124`, `Confirm:145` | `web/stores/walletStore.ts (web/components/wallet/WalletScreen.tsx:9)`<br>`web/stores/authStore.ts (web/components/wallet/WalletScreen.tsx:10)`<br>`web/stores/flowStore.ts (web/components/wallet/WalletScreen.tsx:11)` |
| CX-U-241 | `web/components/wallet/WithdrawScreen.tsx:1` | `ScreenHead:169`, `Skeleton:169`, `Button:170`, `Line:174`, `TextLink:184`, `Sheet:185`, `TwoFactorSetup:186`, `Rows:194`, `Row:195`, `Field:208`, `ButtonLink:233`, `Chips:242`, `TakeSheet:262` | `web/stores/currencyStore.ts (web/components/wallet/WithdrawScreen.tsx:21)`<br>`web/stores/walletStore.ts (web/components/wallet/WithdrawScreen.tsx:22)`<br>`web/stores/securityStore.ts (web/components/wallet/WithdrawScreen.tsx:23)`<br>`web/stores/authStore.ts (web/components/wallet/WithdrawScreen.tsx:24)`<br>`web/stores/inventoryStore.ts (web/components/wallet/WithdrawScreen.tsx:30)` |

### 9.3 store import 소비자 전체

| ID | 스토어 | 런타임 소비자 근거 | 미도달 또는 타입 소비자 |
|---|---|---|---|
| CX-F-100 | `web/stores/authStore.ts:1` | `web/components/account/AccountScreen.tsx:12`<br>`web/components/account/AccountSheets.tsx:9`<br>`web/components/auth/AuthHost.tsx:4`<br>`web/components/box/BoxReviews.tsx:24`<br>`web/components/box/BoxScreen.tsx:31`<br>`web/components/box/WinsScreen.tsx:20`<br>`web/components/dev/Gallery.tsx:12`<br>`web/components/flow/BalanceSheet.tsx:13`<br>`web/components/flow/ChargeSheet.tsx:13`<br>`web/components/flow/LoginSheet.tsx:9`<br>`web/components/flow/TakeSheet.tsx:22`<br>`web/components/home/HeroBanner.tsx:20`<br>`web/components/inventory/InventoryScreen.tsx:22`<br>`web/components/shell/AppShell.tsx:12`<br>`web/components/shell/StateScreens.tsx:7`<br>`web/components/verify/VerifyScreen.tsx:15`<br>`web/components/wallet/TwoFactorSetup.tsx:16`<br>`web/components/wallet/WalletScreen.tsx:10`<br>`web/components/wallet/WithdrawScreen.tsx:24`<br>`web/lib/useUsdtDeposit.ts:12`<br>`web/stores/communityStore.ts:6` | `web/components/auth/AccountClosureFlow.tsx:8`<br>`web/components/auth/AuthModal.tsx:7`<br>`web/components/auth/AvatarSettings.tsx:7`<br>`web/components/auth/HeaderAuthControl.tsx:9`<br>`web/components/auth/LoginRequired.tsx:3`<br>`web/components/auth/NicknameSettings.tsx:7`<br>`web/components/auth/PasswordChangeFlow.tsx:6`<br>`web/components/auth/SecuritySettings.tsx:6`<br>`web/components/community/CommunityBoard.tsx:9`<br>`web/components/layout/SiteHeader.tsx:11`<br>`web/components/wallet/DepositModal.tsx:14`<br>`web/components/wallet/HistoryTab.tsx:14`<br>`web/components/wallet/UsdtDepositTab.tsx:13`<br>`web/components/wallet/WithdrawTab.tsx:14` |
| CX-F-101 | `web/stores/communityStore.ts:1` | `web/components/flow/ReviewSheet.tsx:9`<br>`web/components/inventory/InventoryScreen.tsx:31`<br>`web/components/layout/CurrencyHydrator.tsx:10`<br>`web/stores/usePublishedReviews.ts:7` | `web/components/community/ReviewFormModal.tsx:10`<br>`web/components/home/LiveReviewsSection.tsx:13` (타입)<br>`web/lib/community.ts:6` (타입)<br>`web/lib/communityReviewApi.ts:2` (타입)<br>`web/lib/publishedReviewExamples.ts:2` (타입) |
| CX-F-102 | `web/stores/currencyStore.ts:1` | `web/components/layout/CurrencyHydrator.tsx:4`<br>`web/components/wallet/WithdrawScreen.tsx:21`<br>`web/lib/formatCurrency.ts:13`<br>`web/lib/useCurrency.ts:4` | `web/components/layout/CurrencySelector.tsx:6`<br>`web/components/wallet/WithdrawTab.tsx:8`<br>`web/lib/localFiat.ts:16` |
| CX-F-103 | `web/stores/dailyStore.ts:1` | `web/components/layout/CurrencyHydrator.tsx:9` | `web/components/home/DailyFreeBox.tsx:13` |
| CX-F-104 | `web/stores/fairStore.ts:1` | `web/components/layout/CurrencyHydrator.tsx:6`<br>`web/lib/ledgerLock.ts:9`<br>`web/lib/opening.ts:5` | `web/components/fairness/ProofFeed.tsx:16`<br>`web/components/home/DailyFreeBox.tsx:14`<br>`web/components/home/HallOfFame.tsx:13`<br>`web/components/home/LiveTicker.tsx:17`<br>`web/components/unboxing/UnboxingRoulette.tsx:16` |
| CX-F-105 | `web/stores/flowStore.ts:1` | `web/components/box/BoxScreen.tsx:36`<br>`web/components/box/Opening.tsx:33`<br>`web/components/box/Reveal.tsx:26`<br>`web/components/dev/Gallery.tsx:13`<br>`web/components/flow/BalanceSheet.tsx:12`<br>`web/components/flow/ChargeSheet.tsx:12`<br>`web/components/shell/AppShell.tsx:14`<br>`web/components/wallet/WalletScreen.tsx:11` | 없음 |
| CX-F-106 | `web/stores/inventoryStore.ts:1` | `web/components/account/AccountScreen.tsx:14`<br>`web/components/box/BoxList.tsx:18`<br>`web/components/box/BoxReviews.tsx:25`<br>`web/components/box/BoxScreen.tsx:37`<br>`web/components/box/Opening.tsx:32`<br>`web/components/box/Reveal.tsx:25`<br>`web/components/box/WinsScreen.tsx:21`<br>`web/components/flow/BalanceSheet.tsx:15`<br>`web/components/flow/ShipSheet.tsx:12`<br>`web/components/flow/TakeSheet.tsx:23`<br>`web/components/flow/VerifySheet.tsx:17`<br>`web/components/inventory/InventoryScreen.tsx:23`<br>`web/components/layout/CurrencyHydrator.tsx:8`<br>`web/components/verify/VerifyScreen.tsx:16`<br>`web/components/wallet/WithdrawScreen.tsx:30`<br>`web/lib/browserWallet.ts:2`<br>`web/lib/claim.ts:10`<br>`web/lib/ledgerLock.ts:10`<br>`web/lib/opening.ts:6`<br>`web/lib/takeBatch.ts:54`<br>`web/stores/communityStore.ts:5` | `web/components/auth/AccountClosureFlow.tsx:9`<br>`web/components/community/ReviewFormModal.tsx:9`<br>`web/components/fairness/verifyRecord.ts:2` (타입)<br>`web/components/fairness/VisualVerifier.tsx:11`<br>`web/components/fairness/VisualVerifyModal.tsx:8` (타입)<br>`web/components/flow/ReviewSheet.tsx:10` (타입)<br>`web/components/home/HallOfFame.tsx:12`<br>`web/components/home/LiveCounters.tsx:11`<br>`web/components/home/LiveTicker.tsx:15`<br>`web/components/home/ProofFeed.tsx:10`<br>`web/components/inventory/CancelShipmentModal.tsx:6`<br>`web/components/inventory/ShippingTicker.tsx:10`<br>`web/components/inventory/TrackingModal.tsx:11` (타입)<br>`web/components/unboxing/BulkOpenModal.tsx:14`<br>`web/components/unboxing/UnboxingRoulette.tsx:25`<br>`web/lib/api.ts:29` (타입)<br>`web/lib/chainRecord.ts:12` (타입)<br>`web/lib/community.ts:7` (타입)<br>`web/lib/liveDrops.ts:5` (타입)<br>`web/lib/proofFeed.ts:9` (타입)<br>`web/lib/vault.ts:2` (타입)<br>`web/lib/wins.ts:18` (타입)<br>`web/stores/openingJournal.ts:11` (타입) |
| CX-F-107 | `web/stores/openingJournal.ts:1` | `web/components/box/BoxScreen.tsx:28` | 없음 |
| CX-F-108 | `web/stores/securityStore.ts:1` | `web/components/account/AccountScreen.tsx:15`<br>`web/components/auth/AuthHost.tsx:5`<br>`web/components/wallet/TwoFactorSetup.tsx:13`<br>`web/components/wallet/WithdrawScreen.tsx:23`<br>`web/stores/authStore.ts:6` | `web/components/auth/SecuritySettings.tsx:7`<br>`web/components/wallet/WithdrawTab.tsx:18` |
| CX-F-109 | `web/stores/settingsStore.ts:1` | `web/components/box/BoxScreen.tsx:26`<br>`web/components/box/Opening.tsx:31`<br>`web/components/layout/CurrencyHydrator.tsx:7` | `web/components/home/DailyFreeBox.tsx:16`<br>`web/components/unboxing/BulkOpenModal.tsx:16`<br>`web/components/unboxing/UnboxingRoulette.tsx:17`<br>`web/components/unboxing/VaultGateFX.tsx:7`<br>`web/components/wallet/UsdtDepositTab.tsx:15` |
| CX-F-110 | `web/stores/telemetryStore.ts:1` | `web/components/layout/CurrencyHydrator.tsx:11` | `web/components/unboxing/UnboxingRoulette.tsx:26` |
| CX-F-111 | `web/stores/uiStore.ts:1` | 없음 | 없음 |
| CX-F-112 | `web/stores/usePublishedReviews.ts:1` | `web/components/box/BoxReviews.tsx:26` | `web/components/community/ReviewFormModal.tsx:16`<br>`web/components/home/LiveReviewsSection.tsx:10` |
| CX-F-113 | `web/stores/walletStore.ts:1` | `web/components/account/AccountScreen.tsx:13`<br>`web/components/auth/AuthHost.tsx:9`<br>`web/components/box/BoxScreen.tsx:32`<br>`web/components/box/Opening.tsx:29`<br>`web/components/box/Reveal.tsx:24`<br>`web/components/box/WinsScreen.tsx:22`<br>`web/components/flow/BalanceSheet.tsx:14`<br>`web/components/flow/ShipSheet.tsx:13`<br>`web/components/flow/TakeSheet.tsx:24`<br>`web/components/home/HeroBanner.tsx:21`<br>`web/components/layout/CurrencyHydrator.tsx:5`<br>`web/components/shell/AppShell.tsx:13`<br>`web/components/wallet/WalletScreen.tsx:9`<br>`web/components/wallet/WithdrawScreen.tsx:22`<br>`web/lib/browserWallet.ts:1`<br>`web/lib/claim.ts:11`<br>`web/lib/depositCredit.ts:2`<br>`web/lib/ledgerLock.ts:11`<br>`web/lib/opening.ts:7`<br>`web/lib/takeBatch.ts:55` | `web/components/auth/AccountClosureFlow.tsx:10`<br>`web/components/box/DetailModal.tsx:37`<br>`web/components/fairness/ProofFeed.tsx:15`<br>`web/components/home/DailyFreeBox.tsx:15`<br>`web/components/home/LiveTicker.tsx:16`<br>`web/components/inventory/CancelShipmentModal.tsx:7`<br>`web/components/layout/SiteHeader.tsx:12`<br>`web/components/unboxing/BulkOpenModal.tsx:15`<br>`web/components/unboxing/UnboxingRoulette.tsx:28`<br>`web/components/wallet/DepositModal.tsx:11`<br>`web/components/wallet/HistoryTab.tsx:8`<br>`web/components/wallet/WithdrawTab.tsx:9`<br>`web/lib/api.ts:19` (타입)<br>`web/lib/liveDrops.ts:6` (타입)<br>`web/lib/proofFeed.ts:10` (타입) |
| CX-F-114 | `web/components/ui/toast.tsx:1` | `web/components/dev/Gallery.tsx:17`<br>`web/components/flow/ChargeSheet.tsx:16`<br>`web/components/shell/AppShell.tsx:17`<br>`web/components/wallet/TwoFactorSetup.tsx:18` | 없음 |

### 9.4 화면 묶음별 이벤트 및 생명주기 전수 색인

코드에서 읽은 것. on 속성은 DOM 사건 또는 부모 custom callback 전달이다. 호출은 같은 파일의 연결 함수를 한 단계 확장했다. 긴 식은 앞400자로 줄이고 파일과 줄로 전체 식을 연결했다. 상태 및 저장값의 실제 쓰기 식은 9.5절, 영속성은 4절, 기능 전이는 5절을 따른다. cleanup 열은 구문 근거이며 모든 Promise 완료가 보호된다는 뜻은 아니다. 위험은 CX-I-037부터041에 명시했다. 논리 부정은 글 규칙 때문에 ¬로 표시했다.

#### web/app/not-found.tsx

상태: 라우트 그래프 도달. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1000 | `web/app/not-found.tsx:13`<br>RootNotFound | mount 또는 의존성 변화 [] | `[]`<br>호출: window.location.pathname.split("/").filter(Boolean).find, window.location.pathname.split("/").filter, window.location.pathname.split, setLang | 반환 cleanup 없음 |

#### web/components/about/AboutSections.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1001 | `web/components/about/AboutSections.tsx:47`<br>useCountUp | mount 또는 의존성 변화 [target, run, ms] | `[target, run, ms]`<br>호출: setV, performance.now, Math.min, (target * (1 - Math.pow(1 - p, 3))).toFixed, Math.pow, requestAnimationFrame, cancelAnimationFrame | 61: cancelAnimationFrame |
| CX-I-1002 | `web/components/about/AboutSections.tsx:57`<br>tick | requestAnimationFrame | `requestAnimationFrame(tick)`<br>호출: requestAnimationFrame | 61: cancelAnimationFrame |
| CX-I-1003 | `web/components/about/AboutSections.tsx:60`<br>useEffect@47 | requestAnimationFrame | `requestAnimationFrame(tick)`<br>호출: requestAnimationFrame | 61: cancelAnimationFrame |
| CX-I-1004 | `web/components/about/AboutSections.tsx:61`<br>useEffect@47 | cancelAnimationFrame | `cancelAnimationFrame(raf)`<br>호출: cancelAnimationFrame | 61: cancelAnimationFrame |
| CX-I-1005 | `web/components/about/AboutSections.tsx:170`<br>DrawCard | mount 또는 의존성 변화 [live] | `[live]`<br>호출: setPhase, setRoll, setInterval, timers.push, setTimeout, clearInterval, cycle, timers.forEach | 196: clearInterval, timers.forEach |
| CX-I-1006 | `web/components/about/AboutSections.tsx:181`<br>cycle | setInterval 지연 55 | `setInterval(() => { n = (n * 7_919 + 104_729) % ROLL_RANGE; // 결정적 수열(하이드레이션,테스트 안전) setRoll(n); }, 55)`<br>호출: setInterval, setRoll | 196: clearInterval, timers.forEach |
| CX-I-1007 | `web/components/about/AboutSections.tsx:186`<br>cycle | setTimeout 지연 1300 | `setTimeout(() => { clearInterval(spin); setRoll(DRAW_ROLL); setPhase(1); }, 1300)`<br>호출: setTimeout, clearInterval, setRoll, setPhase | 196: clearInterval, timers.forEach |
| CX-I-1008 | `web/components/about/AboutSections.tsx:187`<br>setTimeout@186 | clearInterval | `clearInterval(spin)`<br>호출: clearInterval | 196: clearInterval, timers.forEach |
| CX-I-1009 | `web/components/about/AboutSections.tsx:191`<br>cycle | setTimeout 지연 2200 | `setTimeout(() => setPhase(2), 2200)`<br>호출: setTimeout, setPhase | 196: clearInterval, timers.forEach |
| CX-I-1010 | `web/components/about/AboutSections.tsx:192`<br>cycle | setTimeout 지연 5200 | `setTimeout(cycle, 5200)`<br>호출: setTimeout | 196: clearInterval, timers.forEach |
| CX-I-1011 | `web/components/about/AboutSections.tsx:197`<br>useEffect@170 | clearInterval | `clearInterval(spin)`<br>호출: clearInterval | 196: clearInterval, timers.forEach |
| CX-I-1012 | `web/components/about/AboutSections.tsx:261`<br>DrawCard | button.onClick | `() => setSeedOpen((v) => ¬v)`<br>호출: setSeedOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1013 | `web/components/about/AboutSections.tsx:282`<br>ShipCard | mount 또는 의존성 변화 [live] | `[live]`<br>호출: setStep, setInterval, clearInterval | 289: clearInterval |
| CX-I-1014 | `web/components/about/AboutSections.tsx:288`<br>useEffect@282 | setInterval 지연 1300 | `setInterval(() => setStep((s) => (s + 1) % 4), 1300)`<br>호출: setInterval, setStep | 289: clearInterval |
| CX-I-1015 | `web/components/about/AboutSections.tsx:289`<br>useEffect@282 | clearInterval | `clearInterval(id)`<br>호출: clearInterval | 289: clearInterval |
| CX-I-1016 | `web/components/about/AboutSections.tsx:352`<br>CashCard | mount 또는 의존성 변화 [live] | `[live]`<br>호출: setTimeout, setMode, clearTimeout | 355: clearTimeout |
| CX-I-1017 | `web/components/about/AboutSections.tsx:354`<br>useEffect@352 | setTimeout 지연 1400 | `setTimeout(() => ¬touched.current && setMode("cash"), 1400)`<br>호출: setTimeout, setMode | 355: clearTimeout |
| CX-I-1018 | `web/components/about/AboutSections.tsx:355`<br>useEffect@352 | clearTimeout | `clearTimeout(id)`<br>호출: clearTimeout | 355: clearTimeout |
| CX-I-1019 | `web/components/about/AboutSections.tsx:427`<br>( [ ["ship", t("toggleShip")], ["cash", t("toggleCash")], ] as const ).map@416 | button.onClick | `() => pick(m)`<br>호출: pick, setMode | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1020 | `web/components/about/AboutSections.tsx:428`<br>( [ ["ship", t("toggleShip")], ["cash", t("toggleCash")], ] as const ).map@416 | button.onMouseEnter | `() => pick(m)`<br>호출: pick, setMode | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1021 | `web/components/about/AboutSections.tsx:478`<br>Term | button.onClick | `() => onToggle(id)`<br>호출: onToggle | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1022 | `web/components/about/AboutSections.tsx:515`<br>slot | Term.onToggle | `toggle`<br>호출: toggle, setOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1023 | `web/components/about/AboutSections.tsx:516`<br>ship | Term.onToggle | `toggle`<br>호출: toggle, setOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1024 | `web/components/about/AboutSections.tsx:517`<br>cashback | Term.onToggle | `toggle`<br>호출: toggle, setOpen | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/about/GlobalLiveFeed.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1025 | `web/components/about/GlobalLiveFeed.tsx:256`<br>GlobalLiveFeed | mount 또는 의존성 변화 [idx] | `[idx]`<br>호출: window.setTimeout, setIdx, window.clearTimeout | 258: window.clearTimeout |
| CX-I-1026 | `web/components/about/GlobalLiveFeed.tsx:257`<br>useEffect@256 | setTimeout 지연 CYCLE_MS | `window.setTimeout(() => setIdx((i) => (i + 1) % SHIPPING_HUBS.length), CYCLE_MS)`<br>호출: window.setTimeout, setIdx | 258: window.clearTimeout |
| CX-I-1027 | `web/components/about/GlobalLiveFeed.tsx:258`<br>useEffect@256 | clearTimeout | `window.clearTimeout(id)`<br>호출: window.clearTimeout | 258: window.clearTimeout |
| CX-I-1028 | `web/components/about/GlobalLiveFeed.tsx:300`<br>SHIPPING_HUBS.map@294 | button.onClick | `() => setIdx(i)`<br>호출: setIdx | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/about/ImpactStats.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1029 | `web/components/about/ImpactStats.tsx:134`<br>rows.map@128 | button.onClick | `() => setOpen(isOpen ? null : i)`<br>호출: setOpen | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/about/IsometricStage.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1030 | `web/components/about/IsometricStage.tsx:63`<br>TiltCard | div.onPointerMove | `move`<br>호출: move, el.getBoundingClientRect, (-y * 16).toFixed, (x * 18).toFixed, el.style.setProperty, ((x + 0.5) * 100).toFixed, ((y + 0.5) * 100).toFixed | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1031 | `web/components/about/IsometricStage.tsx:63`<br>TiltCard | div.onPointerLeave | `leave`<br>호출: leave | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/about/TrustScenes.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1032 | `web/components/about/TrustScenes.tsx:30`<br>CountUp | mount 또는 의존성 변화 [inView, value] | `[inView, value]`<br>호출: performance.now, Math.min, setShown, Math.pow, requestAnimationFrame, cancelAnimationFrame | 40: cancelAnimationFrame |
| CX-I-1033 | `web/components/about/TrustScenes.tsx:37`<br>tick | requestAnimationFrame | `requestAnimationFrame(tick)`<br>호출: requestAnimationFrame | 40: cancelAnimationFrame |
| CX-I-1034 | `web/components/about/TrustScenes.tsx:39`<br>useEffect@30 | requestAnimationFrame | `requestAnimationFrame(tick)`<br>호출: requestAnimationFrame | 40: cancelAnimationFrame |
| CX-I-1035 | `web/components/about/TrustScenes.tsx:40`<br>useEffect@30 | cancelAnimationFrame | `cancelAnimationFrame(raf)`<br>호출: cancelAnimationFrame | 40: cancelAnimationFrame |
| CX-I-1036 | `web/components/about/TrustScenes.tsx:209`<br>SceneFair | mount 또는 의존성 변화 [] | `[]`<br>호출: sha256Hex("voila-sealed-server-seed") .then((h) => { setHash(h); setRoll(parseInt(h.slice(0, 8), 16) % ROLL_RANGE); }) .catch, sha256Hex("voila-sealed-server-seed") .then, sha256Hex, setHash, setRoll, parseInt, h.slice | 반환 cleanup 없음 |

#### web/components/about/VaultHero.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1037 | `web/components/about/VaultHero.tsx:54`<br>ShowcaseCard | motion.button.onClick | `onSelect`<br>호출: onSelect | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1038 | `web/components/about/VaultHero.tsx:55`<br>ShowcaseCard | motion.button.onMouseEnter | `onSelect`<br>호출: onSelect | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1039 | `web/components/about/VaultHero.tsx:56`<br>ShowcaseCard | motion.button.onFocus | `onSelect`<br>호출: onSelect | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1040 | `web/components/about/VaultHero.tsx:107`<br>VaultHero | mount 또는 의존성 변화 [active] | `[active]`<br>호출: window.setTimeout, setActive, window.clearTimeout | 109: window.clearTimeout |
| CX-I-1041 | `web/components/about/VaultHero.tsx:108`<br>useEffect@107 | setTimeout 지연 ROLL_MS | `window.setTimeout(() => setActive((i) => (i + 1) % SHOWCASE.length), ROLL_MS)`<br>호출: window.setTimeout, setActive | 109: window.clearTimeout |
| CX-I-1042 | `web/components/about/VaultHero.tsx:109`<br>useEffect@107 | clearTimeout | `window.clearTimeout(id)`<br>호출: window.clearTimeout | 109: window.clearTimeout |
| CX-I-1043 | `web/components/about/VaultHero.tsx:178`<br>SHOWCASE.map@173 | ShowcaseCard.onSelect | `() => setActive(i)`<br>호출: setActive | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/account/AccountScreen.tsx

상태: 라우트 그래프 도달. store import: `web/stores/authStore.ts (web/components/account/AccountScreen.tsx:12)`, `web/stores/walletStore.ts (web/components/account/AccountScreen.tsx:13)`, `web/stores/inventoryStore.ts (web/components/account/AccountScreen.tsx:14)`, `web/stores/securityStore.ts (web/components/account/AccountScreen.tsx:15)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1044 | `web/components/account/AccountScreen.tsx:46`<br>AccountScreen | Button.onClick | `() => openLogin("login")`<br>호출: openLogin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1045 | `web/components/account/AccountScreen.tsx:46`<br>AccountScreen | TextLink.onClick | `() => openLogin("signup")`<br>호출: openLogin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1046 | `web/components/account/AccountScreen.tsx:58`<br>AccountScreen | button.onClick | `() => setSecuring(true)`<br>호출: setSecuring | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1047 | `web/components/account/AccountScreen.tsx:62`<br>AccountScreen | button.onClick | `() => setSheet("nickname")`<br>호출: setSheet | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1048 | `web/components/account/AccountScreen.tsx:63`<br>AccountScreen | button.onClick | `() => setSheet("password")`<br>호출: setSheet | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1049 | `web/components/account/AccountScreen.tsx:64`<br>AccountScreen | button.onClick | `() => setSheet("close")`<br>호출: setSheet | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1050 | `web/components/account/AccountScreen.tsx:71`<br>AccountScreen | TextLink.onClick | `() => setLeaving(true)`<br>호출: setLeaving | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1051 | `web/components/account/AccountScreen.tsx:75`<br>AccountScreen | Sheet.onClose | `() => setSecuring(false)`<br>호출: setSecuring | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1052 | `web/components/account/AccountScreen.tsx:76`<br>AccountScreen | TwoFactorSetup.onEnabled | `() => setSecuring(false)`<br>호출: setSecuring | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1053 | `web/components/account/AccountScreen.tsx:78`<br>AccountScreen | NicknameSheet.onClose | `() => setSheet(null)`<br>호출: setSheet | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1054 | `web/components/account/AccountScreen.tsx:79`<br>AccountScreen | PasswordSheet.onClose | `() => setSheet(null)`<br>호출: setSheet | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1055 | `web/components/account/AccountScreen.tsx:80`<br>AccountScreen | CloseAccountSheet.onClose | `() => setSheet(null)`<br>호출: setSheet | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1056 | `web/components/account/AccountScreen.tsx:81`<br>AccountScreen | Confirm.onCancel | `() => setLeaving(false)`<br>호출: setLeaving | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1057 | `web/components/account/AccountScreen.tsx:81`<br>AccountScreen | Confirm.onConfirm | `leave`<br>호출: leave, setBusy, logout, setLeaving | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/account/AccountSheets.tsx

상태: 라우트 그래프 도달. store import: `web/stores/authStore.ts (web/components/account/AccountSheets.tsx:9)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1058 | `web/components/account/AccountSheets.tsx:24`<br>NicknameSheet | mount 또는 의존성 변화 [open, user?.nickname] | `[open, user?.nickname]`<br>호출: setValue, setError | 반환 cleanup 없음 |
| CX-I-1059 | `web/components/account/AccountSheets.tsx:38`<br>NicknameSheet | Sheet.onClose | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1060 | `web/components/account/AccountSheets.tsx:39`<br>NicknameSheet | Field.onChange | `(e) => { setValue(e.target.value); setError(""); }`<br>호출: setValue, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1061 | `web/components/account/AccountSheets.tsx:42`<br>NicknameSheet | Button.onClick | `() => void save()`<br>호출: save, validPassword, setError, /^\d{6}$/.test, setBusy, changeAccountPasswordWithOtp, setCurrent, setNext, setCode, onClose, errorText | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1062 | `web/components/account/AccountSheets.tsx:66`<br>PasswordSheet | Sheet.onClose | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1063 | `web/components/account/AccountSheets.tsx:69`<br>PasswordSheet | Field.onChange | `(e) => setCurrent(e.target.value)`<br>호출: setCurrent | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1064 | `web/components/account/AccountSheets.tsx:70`<br>PasswordSheet | Field.onChange | `(e) => { setNext(e.target.value); setError(""); }`<br>호출: setNext, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1065 | `web/components/account/AccountSheets.tsx:71`<br>PasswordSheet | Field.onChange | `(e) => setCode(e.target.value.replace(/\D+/g, "").slice(0, 6))`<br>호출: setCode, e.target.value.replace(/\D+/g, "").slice, e.target.value.replace | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1066 | `web/components/account/AccountSheets.tsx:73`<br>PasswordSheet | Button.onClick | `() => void save()`<br>호출: save, validPassword, setError, /^\d{6}$/.test, setBusy, changeAccountPasswordWithOtp, setCurrent, setNext, setCode, onClose, errorText | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1067 | `web/components/account/AccountSheets.tsx:96`<br>CloseAccountSheet | Sheet.onClose | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1068 | `web/components/account/AccountSheets.tsx:97`<br>CloseAccountSheet | Field.onChange | `(e) => { setPassword(e.target.value); setError(""); }`<br>호출: setPassword, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1069 | `web/components/account/AccountSheets.tsx:99`<br>CloseAccountSheet | Button.onClick | `() => setConfirming(true)`<br>호출: setConfirming | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1070 | `web/components/account/AccountSheets.tsx:101`<br>CloseAccountSheet | Confirm.onCancel | `() => setConfirming(false)`<br>호출: setConfirming | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1071 | `web/components/account/AccountSheets.tsx:101`<br>CloseAccountSheet | Confirm.onConfirm | `() => void close()`<br>호출: close, setBusy, setError, deleteAccount, setConfirming, clearSession, onClose, errorText | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/auth/AccountClosureFlow.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/authStore.ts (web/components/auth/AccountClosureFlow.tsx:8)`, `web/stores/inventoryStore.ts (web/components/auth/AccountClosureFlow.tsx:9)`, `web/stores/walletStore.ts (web/components/auth/AccountClosureFlow.tsx:10)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1072 | `web/components/auth/AccountClosureFlow.tsx:155`<br>AccountClosureFlow | button.onClick | `start`<br>호출: start, applyGate, liveGate | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1073 | `web/components/auth/AccountClosureFlow.tsx:156`<br>AccountClosureFlow | div.onMouseDown | `event => { if (event.target === event.currentTarget) close(); }`<br>호출: close, router.push, setStage, setCode, setIssuedCode, setCodeIssued, setConsent, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1074 | `web/components/auth/AccountClosureFlow.tsx:163`<br>AccountClosureFlow | Link.onClick | `close`<br>호출: close, router.push, setStage, setCode, setIssuedCode, setCodeIssued, setConsent, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1075 | `web/components/auth/AccountClosureFlow.tsx:163`<br>AccountClosureFlow | button.onClick | `close`<br>호출: close, router.push, setStage, setCode, setIssuedCode, setCodeIssued, setConsent, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1076 | `web/components/auth/AccountClosureFlow.tsx:169`<br>AccountClosureFlow | Link.onClick | `close`<br>호출: close, router.push, setStage, setCode, setIssuedCode, setCodeIssued, setConsent, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1077 | `web/components/auth/AccountClosureFlow.tsx:169`<br>AccountClosureFlow | button.onClick | `close`<br>호출: close, router.push, setStage, setCode, setIssuedCode, setCodeIssued, setConsent, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1078 | `web/components/auth/AccountClosureFlow.tsx:174`<br>AccountClosureFlow | button.onClick | `issueCode`<br>호출: issueCode, liveGate, applyGate, setBusy, setError, setCode, setIssuedCode, createLocalClosureCode, setExpiresAt, Date.now, accountRequest, AccountError, setCodeIssued | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1079 | `web/components/auth/AccountClosureFlow.tsx:176`<br>AccountClosureFlow | form.onSubmit | `complete`<br>호출: complete, event.preventDefault, validClosureCode, matchesLocalClosureCode, setError, liveGate, applyGate, setBusy, accountRequest, AccountError, clearSession, setIssuedCode, setCode, setConsent, setStage, ["invalid", "credentials"].includes | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1080 | `web/components/auth/AccountClosureFlow.tsx:177`<br>AccountClosureFlow | input.onChange | `event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))`<br>호출: setCode, event.target.value.replace(/\D/g, "").slice, event.target.value.replace | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1081 | `web/components/auth/AccountClosureFlow.tsx:178`<br>AccountClosureFlow | input.onChange | `event => setConsent(event.target.checked)`<br>호출: setConsent | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1082 | `web/components/auth/AccountClosureFlow.tsx:180`<br>AccountClosureFlow | button.onClick | `close`<br>호출: close, router.push, setStage, setCode, setIssuedCode, setCodeIssued, setConsent, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1083 | `web/components/auth/AccountClosureFlow.tsx:186`<br>AccountClosureFlow | button.onClick | `close`<br>호출: close, router.push, setStage, setCode, setIssuedCode, setCodeIssued, setConsent, setError | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/auth/AuthHost.tsx

상태: 라우트 그래프 도달. store import: `web/stores/authStore.ts (web/components/auth/AuthHost.tsx:4)`, `web/stores/securityStore.ts (web/components/auth/AuthHost.tsx:5)`, `web/stores/walletStore.ts (web/components/auth/AuthHost.tsx:9)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1084 | `web/components/auth/AuthHost.tsx:20`<br>AuthHost | mount 또는 의존성 변화 [] | `[]`<br>호출: localStorage.removeItem, rehydrateAuth | 반환 cleanup 없음 |
| CX-I-1085 | `web/components/auth/AuthHost.tsx:25`<br>AuthHost | mount 또는 의존성 변화 [userId] | `[userId]`<br>호출: browserAccountsEnabled, restoreBrowserAssets, useWalletStore.getState, wallet.setWelcomeAccount, wallet.claimWelcome, wallet.claimWelcomeBoxes, grant, useWalletStore.subscribe, unsubscribe, useSecurityStore.getState().refresh, useSecurityStore.getState | 반환 cleanup 없음 |
| CX-I-1086 | `web/components/auth/AuthHost.tsx:40`<br>useEffect@25 | subscribe | `useWalletStore.subscribe((state) => { if (¬state.hydrated) return; unsubscribe(); grant(); })`<br>호출: useWalletStore.subscribe, unsubscribe, grant, useWalletStore.getState, wallet.setWelcomeAccount, wallet.claimWelcome, wallet.claimWelcomeBoxes | 반환 cleanup 없음 |
| CX-I-1087 | `web/components/auth/AuthHost.tsx:42`<br>useWalletStore.subscribe@40 | unsubscribe | `unsubscribe()`<br>호출: unsubscribe | 반환 cleanup 없음 |

#### web/components/auth/AuthModal.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/authStore.ts (web/components/auth/AuthModal.tsx:7)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1088 | `web/components/auth/AuthModal.tsx:44`<br>AuthModal | mount 또는 의존성 변화 [isModalOpen, modalMode] | `[isModalOpen, modalMode]`<br>호출: setStep, setPassword, setCode, setVisible, setNotice, setError, setEmail | 반환 cleanup 없음 |
| CX-I-1089 | `web/components/auth/AuthModal.tsx:48`<br>AuthModal | mount 또는 의존성 변화 [isModalOpen, step, modalMode] | `[isModalOpen, step, modalMode]`<br>호출: window.setTimeout, input.current?.focus, window.clearTimeout | 51: window.clearTimeout |
| CX-I-1090 | `web/components/auth/AuthModal.tsx:50`<br>useEffect@48 | setTimeout 지연 80 | `window.setTimeout(() => input.current?.focus(), 80)`<br>호출: window.setTimeout, input.current?.focus | 51: window.clearTimeout |
| CX-I-1091 | `web/components/auth/AuthModal.tsx:51`<br>useEffect@48 | clearTimeout | `window.clearTimeout(timer)`<br>호출: window.clearTimeout | 51: window.clearTimeout |
| CX-I-1092 | `web/components/auth/AuthModal.tsx:89`<br>AuthModal | input.onChange | `e => setPassword(e.target.value)`<br>호출: setPassword | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1093 | `web/components/auth/AuthModal.tsx:90`<br>AuthModal | button.onClick | `() => setVisible(¬visible)`<br>호출: setVisible | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1094 | `web/components/auth/AuthModal.tsx:96`<br>AuthModal | button.onClick | `closeAuthModal`<br>호출: closeAuthModal | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1095 | `web/components/auth/AuthModal.tsx:98`<br>AuthModal | button.onClick | `back`<br>호출: back, setStep, setPassword, setCode, setError, setNotice | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1096 | `web/components/auth/AuthModal.tsx:101`<br>AuthModal | button.onClick | `back`<br>호출: back, setStep, setPassword, setCode, setError, setNotice | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1097 | `web/components/auth/AuthModal.tsx:103`<br>providers.map@103 | button.onClick | `() => social(provider)`<br>호출: social, perform, beginSocialLogin, acceptSession, window.location.assign | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1098 | `web/components/auth/AuthModal.tsx:106`<br>AuthModal | button.onClick | `() => setModalMode("login")`<br>호출: setModalMode | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1099 | `web/components/auth/AuthModal.tsx:107`<br>AuthModal | form.onSubmit | `submit`<br>호출: submit, event.preventDefault, perform, validAccountEmail, AccountError, setEmail, email.trim, recoverAccount, setStep, validAccountPassword, signupAccount, acceptSession, setPassword, loginAccount, verifyAccountEmail, completePasswordRecovery | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1100 | `web/components/auth/AuthModal.tsx:108`<br>AuthModal | input.onChange | `e => setEmail(e.target.value)`<br>호출: setEmail | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1101 | `web/components/auth/AuthModal.tsx:110`<br>AuthModal | input.onChange | `e => setCode(e.target.value.replace(/\D/g, ""))`<br>호출: setCode, e.target.value.replace | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1102 | `web/components/auth/AuthModal.tsx:112`<br>AuthModal | button.onClick | `() => setModalMode("recover")`<br>호출: setModalMode | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1103 | `web/components/auth/AuthModal.tsx:116`<br>AuthModal | button.onClick | `() => setModalMode(signup &#124;&#124; recover ? "login" : "signup")`<br>호출: setModalMode | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1104 | `web/components/auth/AuthModal.tsx:117`<br>AuthModal | button.onClick | `() => void perform(async () => { if (step === "verify") await resendAccountEmail(email, locale); else await recoverAccount(email, locale); setCode(""); setNotice(t("verificationCode")); })`<br>호출: perform, resendAccountEmail, recoverAccount, setCode, setNotice, setBusy, setError, operation | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/auth/AvatarSettings.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/authStore.ts (web/components/auth/AvatarSettings.tsx:7)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1105 | `web/components/auth/AvatarSettings.tsx:23`<br>AvatarSettings | mount 또는 의존성 변화 [] | `[]`<br>호출: 없음 | 반환 cleanup 없음 |
| CX-I-1106 | `web/components/auth/AvatarSettings.tsx:24`<br>AvatarSettings | mount 또는 의존성 변화 [image, zoom, x, y, t] | `[image, zoom, x, y, t]`<br>호출: Math.min, document.createElement, canvas.getContext, setError, ctx.fillRect, ctx.drawImage, setPending, canvas.toDataURL | 반환 cleanup 없음 |
| CX-I-1107 | `web/components/auth/AvatarSettings.tsx:60`<br>AvatarSettings | input.onChange | `e => { void select(e.target.files?.[0]); e.target.value = ""; }`<br>호출: select, setError, setSaved, setLoading, setPending, setImage, ["image/jpeg", "image/png", "image/webp"].includes, URL.createObjectURL, Image, img.decode, Error, setZoom, setX, setY, URL.revokeObjectURL | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1108 | `web/components/auth/AvatarSettings.tsx:61`<br>[{ key: "zoom", value: zoom, set: setZoom, min: 1, max: 3, step: 0.05 }, { key: "horizontal", value: x, set: setX, min: 0, max: 100, step: 1 }, { key: "vertical", value: y, set: setY, min: 0, max: 100, step: 1 }].map@61 | input.onChange | `e => control.set(Number(e.target.value))`<br>호출: control.set, Number | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1109 | `web/components/auth/AvatarSettings.tsx:65`<br>AvatarSettings | button.onClick | `() => void save()`<br>호출: save, validAvatarData, setBusy, setError, setSaved, useAuthStore.getState().updateAvatar, useAuthStore.getState, AccountError, setPending, setImage, a | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1110 | `web/components/auth/AvatarSettings.tsx:65`<br>AvatarSettings | button.onClick | `cancel`<br>호출: cancel, setPending, setImage, setLoading, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1111 | `web/components/auth/AvatarSettings.tsx:65`<br>AvatarSettings | button.onClick | `() => { setPending(null); setImage(undefined); setSaved(false); setError(""); }`<br>호출: setPending, setImage, setSaved, setError | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/auth/HeaderAuthControl.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/authStore.ts (web/components/auth/HeaderAuthControl.tsx:9)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1112 | `web/components/auth/HeaderAuthControl.tsx:58`<br>HeaderAuthControl | mount 또는 의존성 변화 [open] | `[open]`<br>호출: ref.current.contains, setOpen, document.addEventListener, window.addEventListener, document.removeEventListener, window.removeEventListener | 68: document.removeEventListener, window.removeEventListener |
| CX-I-1113 | `web/components/auth/HeaderAuthControl.tsx:66`<br>useEffect@58 | addEventListener "mousedown" | `document.addEventListener("mousedown", onDown)`<br>호출: document.addEventListener | 68: document.removeEventListener, window.removeEventListener |
| CX-I-1114 | `web/components/auth/HeaderAuthControl.tsx:67`<br>useEffect@58 | addEventListener "keydown" | `window.addEventListener("keydown", onKey)`<br>호출: window.addEventListener | 68: document.removeEventListener, window.removeEventListener |
| CX-I-1115 | `web/components/auth/HeaderAuthControl.tsx:69`<br>useEffect@58 | removeEventListener "mousedown" | `document.removeEventListener("mousedown", onDown)`<br>호출: document.removeEventListener | 68: document.removeEventListener, window.removeEventListener |
| CX-I-1116 | `web/components/auth/HeaderAuthControl.tsx:70`<br>useEffect@58 | removeEventListener "keydown" | `window.removeEventListener("keydown", onKey)`<br>호출: window.removeEventListener | 68: document.removeEventListener, window.removeEventListener |
| CX-I-1117 | `web/components/auth/HeaderAuthControl.tsx:85`<br>HeaderAuthControl | button.onClick | `() => openAuthModal("login")`<br>호출: openAuthModal | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1118 | `web/components/auth/HeaderAuthControl.tsx:93`<br>HeaderAuthControl | button.onClick | `() => openAuthModal("signup")`<br>호출: openAuthModal | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1119 | `web/components/auth/HeaderAuthControl.tsx:107`<br>HeaderAuthControl | button.onClick | `() => setOpen((o) => ¬o)`<br>호출: setOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1120 | `web/components/auth/HeaderAuthControl.tsx:120`<br>HeaderAuthControl | button.onClick | `signOut`<br>호출: signOut, setOpen, logout(t("toastLogout")).catch, logout, useAuthStore.getState().pushToast, useAuthStore.getState | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1121 | `web/components/auth/HeaderAuthControl.tsx:145`<br>HeaderAuthControl | Link.onClick | `() => setOpen(false)`<br>호출: setOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1122 | `web/components/auth/HeaderAuthControl.tsx:149`<br>HeaderAuthControl | button.onClick | `signOut`<br>호출: signOut, setOpen, logout(t("toastLogout")).catch, logout, useAuthStore.getState().pushToast, useAuthStore.getState | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/auth/LoginRequired.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/authStore.ts (web/components/auth/LoginRequired.tsx:3)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1123 | `web/components/auth/LoginRequired.tsx:12`<br>LoginRequired | button.onClick | `() => open("login")`<br>호출: open | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/auth/NicknameSettings.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/authStore.ts (web/components/auth/NicknameSettings.tsx:7)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1124 | `web/components/auth/NicknameSettings.tsx:51`<br>NicknameSettings | mount 또는 의존성 변화 [user.nickname] | `[user.nickname]`<br>호출: setNickname, setCheckedNickname, setAvailability | 반환 cleanup 없음 |
| CX-I-1125 | `web/components/auth/NicknameSettings.tsx:119`<br>NicknameSettings | form.onSubmit | `submit`<br>호출: submit, event.preventDefault, latestUpdatedAt, canChangeNickname, setCooldown, String, normalizeNickname, validateNewNickname, setCompletion, setCheckedNickname, setAvailability, setError, validationMessage, checkAvailability, setBusy, useAuthStore.getState().updateNickname, useAuthStore.getState, AccountError, new Date().toISOString, Date, saveNicknameUpdatedAt, setNickname | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1126 | `web/components/auth/NicknameSettings.tsx:122`<br>NicknameSettings | input.onChange | `e => { setNickname(e.target.value); setCompletion(null); setCheckedNickname(null); setAvailability(null); setError(""); }`<br>호출: setNickname, setCompletion, setCheckedNickname, setAvailability, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1127 | `web/components/auth/NicknameSettings.tsx:123`<br>NicknameSettings | button.onClick | `() => void checkAvailability()`<br>호출: checkAvailability, normalizeNickname, validateNewNickname, setCheckedNickname, setAvailability, setError, validationMessage, setChecking, setCompletion, useAuthStore.getState().checkNicknameAvailability, useAuthStore.getState | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1128 | `web/components/auth/NicknameSettings.tsx:133`<br>NicknameSettings | div.onMouseDown | `event => event.target === event.currentTarget && setCooldown(null)`<br>호출: setCooldown | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1129 | `web/components/auth/NicknameSettings.tsx:141`<br>NicknameSettings | button.onClick | `() => setCooldown(null)`<br>호출: setCooldown | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/auth/PasswordChangeFlow.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/authStore.ts (web/components/auth/PasswordChangeFlow.tsx:6)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1130 | `web/components/auth/PasswordChangeFlow.tsx:80`<br>PasswordChangeFlow | mount 또는 의존성 변화 [userId] | `[userId]`<br>호출: setBusy, setStep, clearSecrets, setCurrent, setPassword, setRepeat, setCode, setChallenge, setExhausted, setVisible | 82: |
| CX-I-1131 | `web/components/auth/PasswordChangeFlow.tsx:84`<br>PasswordChangeFlow | mount 또는 의존성 변화 [step] | `[step]`<br>호출: setInterval, setNow, Date.now, clearInterval | 87: clearInterval |
| CX-I-1132 | `web/components/auth/PasswordChangeFlow.tsx:86`<br>useEffect@84 | setInterval 지연 1000 | `setInterval(() => setNow(Date.now()), 1000)`<br>호출: setInterval, setNow, Date.now | 87: clearInterval |
| CX-I-1133 | `web/components/auth/PasswordChangeFlow.tsx:87`<br>useEffect@84 | clearInterval | `clearInterval(timer)`<br>호출: clearInterval | 87: clearInterval |
| CX-I-1134 | `web/components/auth/PasswordChangeFlow.tsx:127`<br>PasswordChangeFlow | mount 또는 의존성 변화 [open, autoStart, userId] | `[open, autoStart, userId]`<br>호출: begin, clearSecrets, setError, setNotice, setProvider, isSocialAccount, setStep, run, getPasswordChangeStatus, active, setFailures, setTwoFactor, useAuthStore.getState().setPasswordFailures, useAuthStore.getState | 반환 cleanup 없음 |
| CX-I-1135 | `web/components/auth/PasswordChangeFlow.tsx:128`<br>PasswordChangeFlow | mount 또는 의존성 변화 [open] | `[open]`<br>호출: close, finish, clearSecrets, setStep, setError, onClose | 반환 cleanup 없음 |
| CX-I-1136 | `web/components/auth/PasswordChangeFlow.tsx:161`<br>passwordField | input.onChange | `e => update(e.target.value)`<br>호출: update | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1137 | `web/components/auth/PasswordChangeFlow.tsx:161`<br>passwordField | button.onClick | `() => setVisible(¬visible)`<br>호출: setVisible | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1138 | `web/components/auth/PasswordChangeFlow.tsx:165`<br>PasswordChangeFlow | button.onClick | `sendCode`<br>호출: sendCode, run, sendPasswordUnlockCode, sendPasswordChangeOtpCode, active, setChallenge, setCode, setExhausted, setNow, Date.now | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1139 | `web/components/auth/PasswordChangeFlow.tsx:168`<br>PasswordChangeFlow | input.onChange | `e => setCode(e.target.value.replace(/\D/g, ""))`<br>호출: setCode, e.target.value.replace | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1140 | `web/components/auth/PasswordChangeFlow.tsx:173`<br>PasswordChangeFlow | button.onClick | `begin`<br>호출: begin, clearSecrets, setError, setNotice, setProvider, isSocialAccount, setStep, run, getPasswordChangeStatus, active, setFailures, setTwoFactor, useAuthStore.getState().setPasswordFailures, useAuthStore.getState | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1141 | `web/components/auth/PasswordChangeFlow.tsx:173`<br>PasswordChangeFlow | button.onClick | `() => useAuthStore.getState().openAuthModal("login")`<br>호출: useAuthStore.getState().openAuthModal, useAuthStore.getState | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1142 | `web/components/auth/PasswordChangeFlow.tsx:176`<br>PasswordChangeFlow | button.onClick | `close`<br>호출: close, finish, clearSecrets, setStep, setError, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1143 | `web/components/auth/PasswordChangeFlow.tsx:179`<br>PasswordChangeFlow | button.onClick | `close`<br>호출: close, finish, clearSecrets, setStep, setError, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1144 | `web/components/auth/PasswordChangeFlow.tsx:180`<br>PasswordChangeFlow | button.onClick | `() => { setError(""); setStep("current"); }`<br>호출: setError, setStep | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1145 | `web/components/auth/PasswordChangeFlow.tsx:181`<br>PasswordChangeFlow | button.onClick | `finish`<br>호출: finish, clearSecrets, setStep, useAuthStore.getState, useAuthStore.getState().clearSession, onClose, onCompleted, useAuthStore.getState().openAuthModal | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1146 | `web/components/auth/PasswordChangeFlow.tsx:182`<br>PasswordChangeFlow | form.onSubmit | `submit`<br>호출: submit, event.preventDefault, run, verifyCurrentPassword, active, setFailures, setTwoFactor, setNotice, useAuthStore.getState().setPasswordFailures, useAuthStore.getState, clearSecrets, setStep, unlockPasswordChangeWithCode, validPassword, changeAccountPasswordWithOtp | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1147 | `web/components/auth/PasswordChangeFlow.tsx:190`<br>PasswordChangeFlow | button.onClick | `begin`<br>호출: begin, clearSecrets, setError, setNotice, setProvider, isSocialAccount, setStep, run, getPasswordChangeStatus, active, setFailures, setTwoFactor, useAuthStore.getState().setPasswordFailures, useAuthStore.getState | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/auth/ProfileAvatar.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1148 | `web/components/auth/ProfileAvatar.tsx:7`<br>ProfileAvatar | img.onError | `() => setFailed(src)`<br>호출: setFailed | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/auth/SecuritySettings.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/authStore.ts (web/components/auth/SecuritySettings.tsx:6)`, `web/stores/securityStore.ts (web/components/auth/SecuritySettings.tsx:7)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1149 | `web/components/auth/SecuritySettings.tsx:31`<br>SecuritySettings | button.onClick | `() => void security.refresh(user.id)`<br>호출: security.refresh | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1150 | `web/components/auth/SecuritySettings.tsx:35`<br>SecuritySettings | form.onSubmit | `e => { e.preventDefault(); void disable(); }`<br>호출: e.preventDefault, disable, /^\d{6}$/.test, setBusy, setError, disableTotp, useAuthStore.getState, security.accept, setDisabling, setCode | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1151 | `web/components/auth/SecuritySettings.tsx:36`<br>SecuritySettings | input.onChange | `e => setCode(e.target.value.replace(/\D/g, ""))`<br>호출: setCode, e.target.value.replace | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1152 | `web/components/auth/SecuritySettings.tsx:38`<br>SecuritySettings | button.onClick | `() => { setDisabling(false); setCode(""); setError(""); }`<br>호출: setDisabling, setCode, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1153 | `web/components/auth/SecuritySettings.tsx:39`<br>SecuritySettings | button.onClick | `() => setDisabling(true)`<br>호출: setDisabling | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/box/BoxCard.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1154 | `web/components/box/BoxCard.tsx:23`<br>BoxCard | button.onClick | `() => (onInspect ?? onOpen)?.(box)`<br>호출: (onInspect ?? onOpen) | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/box/BoxList.tsx

상태: 라우트 그래프 도달. store import: `web/stores/inventoryStore.ts (web/components/box/BoxList.tsx:18)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1155 | `web/components/box/BoxList.tsx:85`<br>BoxList | input.onChange | `(e) => setQuery(e.target.value)`<br>호출: setQuery | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1156 | `web/components/box/BoxList.tsx:102`<br>BoxList | Chips.onChange | `(key) => { setCategory(key); setShown(PAGE); }`<br>호출: setCategory, setShown | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1157 | `web/components/box/BoxList.tsx:106`<br>BoxList | Button.onClick | `() => setShown((n) => n + PAGE)`<br>호출: setShown | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/box/BoxReviews.tsx

상태: 라우트 그래프 도달. store import: `web/stores/authStore.ts (web/components/box/BoxReviews.tsx:24)`, `web/stores/inventoryStore.ts (web/components/box/BoxReviews.tsx:25)`, `web/stores/usePublishedReviews.ts (web/components/box/BoxReviews.tsx:26)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1158 | `web/components/box/BoxReviews.tsx:126`<br>ReviewCard | mount 또는 의존성 변화 [card.text] | `[card.text]`<br>호출: setCut | 반환 cleanup 없음 |
| CX-I-1159 | `web/components/box/BoxReviews.tsx:130`<br>ReviewCard | button.onClick | `() => onOpen(card)`<br>호출: onOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1160 | `web/components/box/BoxReviews.tsx:152`<br>ReviewSheet | Sheet.onClose | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1161 | `web/components/box/BoxReviews.tsx:186`<br>cards.map@186 | ReviewCard.onOpen | `setOpen`<br>호출: setOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1162 | `web/components/box/BoxReviews.tsx:194`<br>BoxReviews | ReviewSheet.onClose | `() => setOpen(null)`<br>호출: setOpen | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/box/BoxScreen.tsx

상태: 라우트 그래프 도달. store import: `web/stores/settingsStore.ts (web/components/box/BoxScreen.tsx:26)`, `web/stores/openingJournal.ts (web/components/box/BoxScreen.tsx:28)`, `web/stores/authStore.ts (web/components/box/BoxScreen.tsx:31)`, `web/stores/walletStore.ts (web/components/box/BoxScreen.tsx:32)`, `web/stores/flowStore.ts (web/components/box/BoxScreen.tsx:36)`, `web/stores/inventoryStore.ts (web/components/box/BoxScreen.tsx:37)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1163 | `web/components/box/BoxScreen.tsx:111`<br>BoxScreen | mount 또는 의존성 변화 [] | `[]`<br>호출: useOpeningJournal.persist.rehydrate | 반환 cleanup 없음 |
| CX-I-1164 | `web/components/box/BoxScreen.tsx:117`<br>BoxScreen | mount 또는 의존성 변화 [unseen] | `[unseen]`<br>호출: send | 반환 cleanup 없음 |
| CX-I-1165 | `web/components/box/BoxScreen.tsx:176`<br>BoxScreen | button.onClick | `() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" })`<br>호출: document.getElementById("reviews")?.scrollIntoView, document.getElementById | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1166 | `web/components/box/BoxScreen.tsx:180`<br>BoxScreen | button.onClick | `() => document.getElementById("box-contents")?.scrollIntoView({ behavior: "smooth", block: "start" })`<br>호출: document.getElementById("box-contents")?.scrollIntoView, document.getElementById | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1167 | `web/components/box/BoxScreen.tsx:203`<br>BoxScreen | Chips.onChange | `(n) => { setQty(n); setFailed(false); }`<br>호출: setQty, setFailed | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1168 | `web/components/box/BoxScreen.tsx:205`<br>BoxScreen | Button.onClick | `() => openLogin("login")`<br>호출: openLogin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1169 | `web/components/box/BoxScreen.tsx:206`<br>BoxScreen | Button.onClick | `recover`<br>호출: recover, currentTakeLedger, unseen.items.flatMap, table.find, takeStateOf, tierOf, useOpeningJournal.getState().markSeen, useOpeningJournal.getState, send, useWalletStore.getState().transactions.find, useWalletStore.getState, tx.ref.endsWith, setOpened, Math.abs, (box.price * results.length).toFixed | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1170 | `web/components/box/BoxScreen.tsx:207`<br>BoxScreen | Button.onClick | `() => setTakingHeld(true)`<br>호출: setTakingHeld | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1171 | `web/components/box/BoxScreen.tsx:207`<br>BoxScreen | TextLink.onClick | `openCharge`<br>호출: openCharge | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1172 | `web/components/box/BoxScreen.tsx:208`<br>BoxScreen | Button.onClick | `openCharge`<br>호출: openCharge | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1173 | `web/components/box/BoxScreen.tsx:208`<br>BoxScreen | TextLink.onClick | `() => setTakingHeld(true)`<br>호출: setTakingHeld | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1174 | `web/components/box/BoxScreen.tsx:209`<br>BoxScreen | Button.onClick | `openCharge`<br>호출: openCharge | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1175 | `web/components/box/BoxScreen.tsx:210`<br>BoxScreen | Button.onClick | `press`<br>호출: press, canStartPurchase, soundPress, useSettingsStore.getState, send, setConfirming, open | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1176 | `web/components/box/BoxScreen.tsx:223`<br>g.items.filter((i) => i.image.src).map@223 | ItemCard.onOpen | `() => setItemId(item.id)`<br>호출: setItemId | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1177 | `web/components/box/BoxScreen.tsx:230`<br>g.items.filter((i) => ¬i.image.src).map@228 | button.onClick | `() => setItemId(item.id)`<br>호출: setItemId | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1178 | `web/components/box/BoxScreen.tsx:264`<br>table.map@262 | button.onClick | `() => setItemId(item.id)`<br>호출: setItemId | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1179 | `web/components/box/BoxScreen.tsx:281`<br>BoxScreen | Sheet.onClose | `() => { setItemId(null); setComparing(false); setCountries(false); }`<br>호출: setItemId, setComparing, setCountries | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1180 | `web/components/box/BoxScreen.tsx:296`<br>BoxScreen | TextLink.onClick | `() => setCountries((v) => ¬v)`<br>호출: setCountries | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1181 | `web/components/box/BoxScreen.tsx:300`<br>BoxScreen | TextLink.onClick | `() => setComparing(true)`<br>호출: setComparing | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1182 | `web/components/box/BoxScreen.tsx:316`<br>BoxScreen | Confirm.onCancel | `cancelConfirm`<br>호출: cancelConfirm, send, setConfirming | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1183 | `web/components/box/BoxScreen.tsx:316`<br>BoxScreen | Confirm.onConfirm | `() => void open(true)`<br>호출: open, canStartPurchase, setBusy, setFailed, setConfirming, send, newOpeningId, devOpeningFault, Error, createOpeningPurchase(box, qty, id), createOpeningPurchase, setOpened | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1184 | `web/components/box/BoxScreen.tsx:318`<br>BoxScreen | TakeSheet.onClose | `() => setTakingHeld(false)`<br>호출: setTakingHeld | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1185 | `web/components/box/BoxScreen.tsx:319`<br>BoxScreen | Opening.onClose | `closeOpening`<br>호출: closeOpening, setOpened, send | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1186 | `web/components/box/BoxScreen.tsx:319`<br>BoxScreen | Opening.onAgain | `press`<br>호출: press, canStartPurchase, soundPress, useSettingsStore.getState, send, setConfirming, open | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1187 | `web/components/box/BoxScreen.tsx:319`<br>BoxScreen | Opening.onRevealed | `revealed`<br>호출: revealed, useOpeningJournal.getState().markSeen, useOpeningJournal.getState, send | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1188 | `web/components/box/BoxScreen.tsx:319`<br>BoxScreen | Opening.onFlow | `send`<br>호출: send | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1189 | `web/components/box/BoxScreen.tsx:320`<br>BoxScreen | Reveal.onClose | `closeOpening`<br>호출: closeOpening, setOpened, send | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1190 | `web/components/box/BoxScreen.tsx:320`<br>BoxScreen | Reveal.onAgain | `press`<br>호출: press, canStartPurchase, soundPress, useSettingsStore.getState, send, setConfirming, open | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1191 | `web/components/box/BoxScreen.tsx:320`<br>BoxScreen | Reveal.onRevealed | `revealed`<br>호출: revealed, useOpeningJournal.getState().markSeen, useOpeningJournal.getState, send | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1192 | `web/components/box/BoxScreen.tsx:320`<br>BoxScreen | Reveal.onSkip | `() => send("SKIP")`<br>호출: send | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1193 | `web/components/box/BoxScreen.tsx:327`<br>ItemCard | button.onClick | `onOpen`<br>호출: onOpen | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/box/DetailModal.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/walletStore.ts (web/components/box/DetailModal.tsx:37)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1194 | `web/components/box/DetailModal.tsx:136`<br>DetailModal | mount 또는 의존성 변화 [box] | `[box]`<br>호출: setQty, setConfirming, setAutoOpen | 반환 cleanup 없음 |
| CX-I-1195 | `web/components/box/DetailModal.tsx:180`<br>DetailModal | motion.div.onMouseDown | `(event) => { if (event.target === event.currentTarget) close(); }`<br>호출: close, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1196 | `web/components/box/DetailModal.tsx:185`<br>DetailModal | button.onClick | `close`<br>호출: close, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1197 | `web/components/box/DetailModal.tsx:206`<br>OPEN_PRESETS.map@205 | button.onClick | `() => { setQty(n); setConfirming(false); }`<br>호출: setQty, setConfirming | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1198 | `web/components/box/DetailModal.tsx:215`<br>DetailModal | button.onClick | `() => onDeposit?.(box, qty)`<br>호출: onDeposit | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1199 | `web/components/box/DetailModal.tsx:222`<br>DetailModal | button.onClick | `() => setConfirming(false)`<br>호출: setConfirming | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1200 | `web/components/box/DetailModal.tsx:223`<br>DetailModal | button.onClick | `() => onOpen?.(box, qty)`<br>호출: onOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1201 | `web/components/box/DetailModal.tsx:227`<br>DetailModal | button.onClick | `() => setConfirming(true)`<br>호출: setConfirming | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1202 | `web/components/box/DetailModal.tsx:233`<br>DetailModal | button.onClick | `() => { const details = oddsRef.current; if (¬details) return; details.open = true; requestAnimationFrame(() => { details.focus({ preventScroll: true }); details.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); }); }`<br>호출: requestAnimationFrame, details.focus, details.scrollIntoView, window.matchMedia | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1203 | `web/components/box/DetailModal.tsx:233`<br>DetailModal | requestAnimationFrame | `requestAnimationFrame(() => { details.focus({ preventScroll: true }); details.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); })`<br>호출: requestAnimationFrame, details.focus, details.scrollIntoView, window.matchMedia | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1204 | `web/components/box/DetailModal.tsx:236`<br>DetailModal | button.onClick | `() => setAutoOpen(true)`<br>호출: setAutoOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1205 | `web/components/box/DetailModal.tsx:284`<br>DetailModal | AutoplaySettingsModal.onClose | `() => setAutoOpen(false)`<br>호출: setAutoOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1206 | `web/components/box/DetailModal.tsx:284`<br>DetailModal | AutoplaySettingsModal.onStart | `(config) => { setAutoCfg(config); setAutoOpen(false); onAutoplay?.(box, config); }`<br>호출: setAutoCfg, setAutoOpen, onAutoplay | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/box/Opening.tsx

상태: 라우트 그래프 도달. store import: `web/stores/walletStore.ts (web/components/box/Opening.tsx:29)`, `web/stores/settingsStore.ts (web/components/box/Opening.tsx:31)`, `web/stores/inventoryStore.ts (web/components/box/Opening.tsx:32)`, `web/stores/flowStore.ts (web/components/box/Opening.tsx:33)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1207 | `web/components/box/Opening.tsx:119`<br>Opening | mount 또는 의존성 변화 [] | `[]`<br>호출: soundStop | 119: soundStop |
| CX-I-1208 | `web/components/box/Opening.tsx:127`<br>Opening | mount 또는 의존성 변화 [recovered, timeline] | `[recovered, timeline]`<br>호출: window.matchMedia, setPhase, window.setTimeout, timers.forEach, window.clearTimeout | 135: timers.forEach, window.clearTimeout |
| CX-I-1209 | `web/components/box/Opening.tsx:131`<br>useEffect@127 | setTimeout 지연 timeline.anticipation | `window.setTimeout(() => setPhase((p) => (p === "anticipation" ? "impact" : p)), timeline.anticipation)`<br>호출: window.setTimeout, setPhase | 135: timers.forEach, window.clearTimeout |
| CX-I-1210 | `web/components/box/Opening.tsx:132`<br>useEffect@127 | setTimeout 지연 timeline.anticipation + timeline.impact | `window.setTimeout(() => setPhase((p) => (p === "impact" ? "exit" : p)), timeline.anticipation + timeline.impact)`<br>호출: window.setTimeout, setPhase | 135: timers.forEach, window.clearTimeout |
| CX-I-1211 | `web/components/box/Opening.tsx:133`<br>useEffect@127 | setTimeout 지연 timeline.revealAt | `window.setTimeout(() => setPhase((p) => (p === "exit" ? "reveal" : p)), timeline.revealAt)`<br>호출: window.setTimeout, setPhase | 135: timers.forEach, window.clearTimeout |
| CX-I-1212 | `web/components/box/Opening.tsx:135`<br>timers.forEach@135 | clearTimeout | `window.clearTimeout(id)`<br>호출: window.clearTimeout | 135: timers.forEach, window.clearTimeout |
| CX-I-1213 | `web/components/box/Opening.tsx:140`<br>Opening | mount 또는 의존성 변화 [phase] | `[phase]`<br>호출: soundOpen, hapticImpact, onRevealed, soundResult, panel.current?.focus, window.setTimeout, setPhase, window.clearTimeout | 151: window.clearTimeout |
| CX-I-1214 | `web/components/box/Opening.tsx:150`<br>useEffect@140 | setTimeout 지연 OPENING_ARM_DELAY_MS | `window.setTimeout(() => setPhase("ready"), OPENING_ARM_DELAY_MS)`<br>호출: window.setTimeout, setPhase | 151: window.clearTimeout |
| CX-I-1215 | `web/components/box/Opening.tsx:151`<br>useEffect@140 | clearTimeout | `window.clearTimeout(arm)`<br>호출: window.clearTimeout | 151: window.clearTimeout |
| CX-I-1216 | `web/components/box/Opening.tsx:169`<br>Opening | mount 또는 의존성 변화 [revealed] | `[revealed]`<br>호출: autoTakeApplies, take | 반환 cleanup 없음 |
| CX-I-1217 | `web/components/box/Opening.tsx:194`<br>Opening | Button.onClick | `onAgain`<br>호출: onAgain | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1218 | `web/components/box/Opening.tsx:203`<br>Opening | TextLink.onClick | `() => { if (ready) verify(); }`<br>호출: verify, setVerifying, table.map | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1219 | `web/components/box/Opening.tsx:204`<br>Opening | TextLink.onClick | `() => { if (ready) close(); }`<br>호출: close, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1220 | `web/components/box/Opening.tsx:213`<br>Opening | button.onClick | `() => setSettings(true)`<br>호출: setSettings | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1221 | `web/components/box/Opening.tsx:214`<br>Opening | button.onClick | `close`<br>호출: close, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1222 | `web/components/box/Opening.tsx:261`<br>Opening | TextLink.onClick | `skip`<br>호출: skip | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1223 | `web/components/box/Opening.tsx:284`<br>Opening | Button.onClick | `() => setHeldTaking(true)`<br>호출: setHeldTaking | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1224 | `web/components/box/Opening.tsx:286`<br>Opening | TextLink.onClick | `() => { if (ready) openCharge(); }`<br>호출: openCharge | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1225 | `web/components/box/Opening.tsx:291`<br>Opening | Button.onClick | `openCharge`<br>호출: openCharge | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1226 | `web/components/box/Opening.tsx:293`<br>Opening | TextLink.onClick | `() => { if (ready) setHeldTaking(true); }`<br>호출: setHeldTaking | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1227 | `web/components/box/Opening.tsx:298`<br>Opening | Button.onClick | `openCharge`<br>호출: openCharge | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1228 | `web/components/box/Opening.tsx:304`<br>Opening | Button.onClick | `() => void take(false, true)`<br>호출: take | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1229 | `web/components/box/Opening.tsx:311`<br>Opening | Button.onClick | `() => setAsking(true)`<br>호출: setAsking | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1230 | `web/components/box/Opening.tsx:313`<br>Opening | TextLink.onClick | `() => { if (ready && settle ¬== "settling") close(); }`<br>호출: close, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1231 | `web/components/box/Opening.tsx:322`<br>Opening | TakeConfirm.onCancel | `() => setAsking(false)`<br>호출: setAsking | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1232 | `web/components/box/Opening.tsx:322`<br>Opening | TakeConfirm.onConfirm | `confirmTake`<br>호출: confirmTake, setAsking, take | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1233 | `web/components/box/Opening.tsx:324`<br>Opening | TakeSheet.onClose | `() => setHeldTaking(false)`<br>호출: setHeldTaking | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1234 | `web/components/box/Opening.tsx:325`<br>Opening | OpeningSettings.onClose | `() => setSettings(false)`<br>호출: setSettings | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1235 | `web/components/box/Opening.tsx:326`<br>Opening | VerifySheet.onClose | `() => setVerifying(null)`<br>호출: setVerifying | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1236 | `web/components/box/Opening.tsx:337`<br>toggle | button.onClick | `() => onChange(¬on)`<br>호출: onChange | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1237 | `web/components/box/Opening.tsx:344`<br>OpeningSettings | Sheet.onClose | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1238 | `web/components/box/Opening.tsx:352`<br>OpeningSettings | Confirm.onCancel | `() => setAsking(false)`<br>호출: setAsking | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1239 | `web/components/box/Opening.tsx:352`<br>OpeningSettings | Confirm.onConfirm | `() => { s.setAutoTake(accountId, true); setAsking(false); }`<br>호출: s.setAutoTake, setAsking | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/box/ProductArt.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1240 | `web/components/box/ProductArt.tsx:163`<br>ProductArt | img.onError | `() => setFailedSrc(image.src)`<br>호출: setFailedSrc | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/box/Reveal.tsx

상태: 라우트 그래프 도달. store import: `web/stores/walletStore.ts (web/components/box/Reveal.tsx:24)`, `web/stores/inventoryStore.ts (web/components/box/Reveal.tsx:25)`, `web/stores/flowStore.ts (web/components/box/Reveal.tsx:26)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1241 | `web/components/box/Reveal.tsx:74`<br>Reveal | mount 또는 의존성 변화 [done] | `[done]`<br>호출: onRevealed, panel.current?.focus, window.setTimeout, setArmed, window.clearTimeout | 79: window.clearTimeout |
| CX-I-1242 | `web/components/box/Reveal.tsx:78`<br>useEffect@74 | setTimeout 지연 OPENING_ARM_DELAY_MS | `window.setTimeout(() => setArmed(true), OPENING_ARM_DELAY_MS)`<br>호출: window.setTimeout, setArmed | 79: window.clearTimeout |
| CX-I-1243 | `web/components/box/Reveal.tsx:79`<br>useEffect@74 | clearTimeout | `window.clearTimeout(arm)`<br>호출: window.clearTimeout | 79: window.clearTimeout |
| CX-I-1244 | `web/components/box/Reveal.tsx:82`<br>Reveal | mount 또는 의존성 변화 [] | `[]`<br>호출: window.matchMedia, setDone, window.setTimeout, setStage, timers.forEach, window.clearTimeout | 90: timers.forEach, window.clearTimeout |
| CX-I-1245 | `web/components/box/Reveal.tsx:86`<br>useEffect@82 | setTimeout 지연 STAGE.anticipation | `window.setTimeout(() => setStage("impact"), STAGE.anticipation)`<br>호출: window.setTimeout, setStage | 90: timers.forEach, window.clearTimeout |
| CX-I-1246 | `web/components/box/Reveal.tsx:87`<br>useEffect@82 | setTimeout 지연 STAGE.anticipation + STAGE.impact | `window.setTimeout(() => setStage("exit"), STAGE.anticipation + STAGE.impact)`<br>호출: window.setTimeout, setStage | 90: timers.forEach, window.clearTimeout |
| CX-I-1247 | `web/components/box/Reveal.tsx:88`<br>useEffect@82 | setTimeout 지연 STAGE.anticipation + STAGE.impact + STAGE.exit | `window.setTimeout(() => setDone(true), STAGE.anticipation + STAGE.impact + STAGE.exit)`<br>호출: window.setTimeout, setDone | 90: timers.forEach, window.clearTimeout |
| CX-I-1248 | `web/components/box/Reveal.tsx:90`<br>timers.forEach@90 | clearTimeout | `window.clearTimeout(id)`<br>호출: window.clearTimeout | 90: timers.forEach, window.clearTimeout |
| CX-I-1249 | `web/components/box/Reveal.tsx:148`<br>Reveal | Button.onClick | `onAgain`<br>호출: onAgain | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1250 | `web/components/box/Reveal.tsx:149`<br>Reveal | Button.onClick | `() => setBatch("held")`<br>호출: setBatch | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1251 | `web/components/box/Reveal.tsx:150`<br>Reveal | Button.onClick | `openCharge`<br>호출: openCharge | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1252 | `web/components/box/Reveal.tsx:154`<br>Reveal | TextLink.onClick | `() => { if (armed) openCharge(); }`<br>호출: openCharge | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1253 | `web/components/box/Reveal.tsx:155`<br>Reveal | TextLink.onClick | `() => { if (armed) setBatch("held"); }`<br>호출: setBatch | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1254 | `web/components/box/Reveal.tsx:162`<br>actionsFor | TextLink.onClick | `() => verify(r)`<br>호출: verify, setVerifying, table.map | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1255 | `web/components/box/Reveal.tsx:163`<br>actionsFor | Button.onClick | `() => setTaking(r)`<br>호출: setTaking | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1256 | `web/components/box/Reveal.tsx:163`<br>actionsFor | TextLink.onClick | `() => verify(r)`<br>호출: verify, setVerifying, table.map | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1257 | `web/components/box/Reveal.tsx:175`<br>Reveal | TextLink.onClick | `skip`<br>호출: skip, onSkip, setDone | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1258 | `web/components/box/Reveal.tsx:179`<br>Reveal | button.onClick | `() => { if (armed) close(); }`<br>호출: close, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1259 | `web/components/box/Reveal.tsx:193`<br>Reveal | TextLink.onClick | `() => verify(single)`<br>호출: verify, setVerifying, table.map | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1260 | `web/components/box/Reveal.tsx:252`<br>lines.map@242 | button.onClick | `() => { if (¬armed) return; if (open) pick(r); else verify(r); }`<br>호출: pick, verify, setTakeNote, setPicked, setVerifying, table.map | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1261 | `web/components/box/Reveal.tsx:266`<br>Reveal | Button.onClick | `() => setBatch("fresh")`<br>호출: setBatch | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1262 | `web/components/box/Reveal.tsx:267`<br>Reveal | TextLink.onClick | `() => { if (armed) close(); }`<br>호출: close, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1263 | `web/components/box/Reveal.tsx:267`<br>Reveal | TextLink.onClick | `() => { if (armed && ¬againBusy) onAgain(); }`<br>호출: onAgain | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1264 | `web/components/box/Reveal.tsx:274`<br>Reveal | TextLink.onClick | `() => { if (armed) close(); }`<br>호출: close, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1265 | `web/components/box/Reveal.tsx:284`<br>Reveal | Sheet.onClose | `() => pick(null)`<br>호출: pick, setTakeNote, setPicked | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1266 | `web/components/box/Reveal.tsx:293`<br>Reveal | TextLink.onClick | `() => verify(picked)`<br>호출: verify, setVerifying, table.map | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1267 | `web/components/box/Reveal.tsx:293`<br>Reveal | TextLink.onClick | `() => verify(picked)`<br>호출: verify, setVerifying, table.map | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1268 | `web/components/box/Reveal.tsx:297`<br>Reveal | VerifySheet.onClose | `() => setVerifying(null)`<br>호출: setVerifying | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1269 | `web/components/box/Reveal.tsx:299`<br>Reveal | TakeSheet.onClose | `() => setBatch(null)`<br>호출: setBatch | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1270 | `web/components/box/Reveal.tsx:299`<br>Reveal | TakeSheet.onTaken | `batchTaken`<br>호출: batchTaken, setTaken | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1271 | `web/components/box/Reveal.tsx:301`<br>Reveal | TakeConfirm.onCancel | `() => setTaking(null)`<br>호출: setTaking | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1272 | `web/components/box/Reveal.tsx:301`<br>Reveal | TakeConfirm.onConfirm | `take`<br>호출: take, setTaking, setTakeNote, settleTake, setTaken, setPicked | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/box/ReviewsScreen.tsx

상태: 라우트 그래프 도달. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1273 | `web/components/box/ReviewsScreen.tsx:34`<br>ReviewsScreen | Chips.onChange | `setPicked`<br>호출: setPicked | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1274 | `web/components/box/ReviewsScreen.tsx:38`<br>shown.map@38 | ReviewCard.onOpen | `setOpen`<br>호출: setOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1275 | `web/components/box/ReviewsScreen.tsx:42`<br>ReviewsScreen | ReviewSheet.onClose | `() => setOpen(null)`<br>호출: setOpen | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/box/WinsScreen.tsx

상태: 라우트 그래프 도달. store import: `web/stores/authStore.ts (web/components/box/WinsScreen.tsx:20)`, `web/stores/inventoryStore.ts (web/components/box/WinsScreen.tsx:21)`, `web/stores/walletStore.ts (web/components/box/WinsScreen.tsx:22)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1276 | `web/components/box/WinsScreen.tsx:41`<br>WinsScreen | mount 또는 의존성 변화 [] | `[]`<br>호출: useInventoryStore.persist.rehydrate | 반환 cleanup 없음 |
| CX-I-1277 | `web/components/box/WinsScreen.tsx:59`<br>WinsScreen | Button.onClick | `() => openLogin("login")`<br>호출: openLogin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1278 | `web/components/box/WinsScreen.tsx:74`<br>rows.slice(0, shown).map@69 | button.onClick | `() => setDetailId(r.id)`<br>호출: setDetailId | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1279 | `web/components/box/WinsScreen.tsx:88`<br>WinsScreen | TextLink.onClick | `() => setShown((n) => n + WINS_PAGE)`<br>호출: setShown | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1280 | `web/components/box/WinsScreen.tsx:94`<br>WinsScreen | Sheet.onClose | `() => setDetailId(null)`<br>호출: setDetailId | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1281 | `web/components/box/WinsScreen.tsx:109`<br>WinsScreen | Button.onClick | `verify`<br>호출: verify, setVerifying, setDetailId | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1282 | `web/components/box/WinsScreen.tsx:114`<br>WinsScreen | VerifySheet.onClose | `() => setVerifying(null)`<br>호출: setVerifying | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/community/BoardComposer.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1283 | `web/components/community/BoardComposer.tsx:25`<br>list.map@23 | reader.onload | `() => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("image"))`<br>호출: resolve, reject, Error | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1284 | `web/components/community/BoardComposer.tsx:25`<br>list.map@23 | reader.onerror | `() => reject(reader.error)`<br>호출: reject | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1285 | `web/components/community/BoardComposer.tsx:34`<br>BoardComposer | mount 또는 의존성 변화 [key, draft] | `[key, draft]`<br>호출: sessionStorage.setItem, JSON.stringify, setDraftStatus | 반환 cleanup 없음 |
| CX-I-1286 | `web/components/community/BoardComposer.tsx:39`<br>BoardComposer | div.onMouseDown | `e => e.target === e.currentTarget && close()`<br>호출: close, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1287 | `web/components/community/BoardComposer.tsx:41`<br>BoardComposer | button.onClick | `close`<br>호출: close, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1288 | `web/components/community/BoardComposer.tsx:44`<br>BoardComposer | form.onSubmit | `async e => { e.preventDefault(); if (busy) return; try { validateDraft(draft, { id: userId, name: "", canPublishNotice }); } catch { setValidation("제목은 2~100자, 본문은 5~10,000자로 입력해 주세요. 공지사항은 운영자만 작성할 수 있습니다."); return; } setValidation(""); if (await onSave(draft)) { saved.current = true; try { sessionStorage.removeItem(key); } catch {} } }`<br>호출: e.preventDefault, validateDraft, setValidation, onSave, sessionStorage.removeItem | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1289 | `web/components/community/BoardComposer.tsx:49`<br>BoardComposer | select.onChange | `e => setDraft({ ...draft, category: e.target.value as BoardDraft["category"], pinned: false })`<br>호출: setDraft | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1290 | `web/components/community/BoardComposer.tsx:50`<br>BoardComposer | input.onChange | `e => setDraft({ ...draft, pinned: e.target.checked })`<br>호출: setDraft | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1291 | `web/components/community/BoardComposer.tsx:51`<br>BoardComposer | input.onChange | `e => setDraft({ ...draft, title: e.target.value })`<br>호출: setDraft | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1292 | `web/components/community/BoardComposer.tsx:52`<br>BoardComposer | textarea.onChange | `e => setDraft({ ...draft, body: e.target.value })`<br>호출: setDraft | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1293 | `web/components/community/BoardComposer.tsx:53`<br>BoardComposer | div.onDragOver | `event => event.preventDefault()`<br>호출: event.preventDefault | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1294 | `web/components/community/BoardComposer.tsx:53`<br>BoardComposer | div.onDrop | `event => { event.preventDefault(); void addImages(event.dataTransfer.files); }`<br>호출: event.preventDefault, addImages, Array.from(files).slice, Array.from, Math.max, Promise.all, list.map, assertCommunityImageFile, Promise, FileReader, resolve, reject, Error, reader.readAsDataURL, setDraft, setValidation | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1295 | `web/components/community/BoardComposer.tsx:53`<br>draft.images?.map@53 | button.onClick | `() => setDraft(current => ({ ...current, images: current.images?.filter((_, i) => i ¬== index) }))`<br>호출: setDraft, current.images?.filter | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1296 | `web/components/community/BoardComposer.tsx:53`<br>BoardComposer | input.onChange | `event => { void addImages(event.target.files ?? []); event.target.value = ""; }`<br>호출: addImages, Array.from(files).slice, Array.from, Math.max, Promise.all, list.map, assertCommunityImageFile, Promise, FileReader, resolve, reject, Error, reader.readAsDataURL, setDraft, setValidation | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1297 | `web/components/community/BoardComposer.tsx:55`<br>BoardComposer | button.onClick | `close`<br>호출: close, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1298 | `web/components/community/BoardComposer.tsx:55`<br>BoardComposer | button.onClick | `() => setDiscard(true)`<br>호출: setDiscard | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1299 | `web/components/community/BoardComposer.tsx:56`<br>BoardComposer | button.onClick | `() => setDiscard(false)`<br>호출: setDiscard | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1300 | `web/components/community/BoardComposer.tsx:56`<br>BoardComposer | button.onClick | `() => { try { sessionStorage.removeItem(key); saved.current = true; onClose(); } catch { setDraftStatus("임시 글을 삭제하지 못했습니다. 다시 시도해 주세요."); } }`<br>호출: sessionStorage.removeItem, onClose, setDraftStatus | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/community/CommunityBoard.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/authStore.ts (web/components/community/CommunityBoard.tsx:9)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1301 | `web/components/community/CommunityBoard.tsx:49`<br>CommunityBoard | mount 또는 의존성 변화 [refresh, user?.id] | `[refresh, user?.id]`<br>호출: setComposer, setComment, setEditComment, setConfirm, setSnapshot, refresh, window.addEventListener, window.removeEventListener | 55: window.removeEventListener |
| CX-I-1302 | `web/components/community/CommunityBoard.tsx:54`<br>useEffect@49 | addEventListener "storage" | `window.addEventListener("storage", storage)`<br>호출: window.addEventListener | 55: window.removeEventListener |
| CX-I-1303 | `web/components/community/CommunityBoard.tsx:54`<br>useEffect@49 | addEventListener "focus" | `window.addEventListener("focus", focus)`<br>호출: window.addEventListener | 55: window.removeEventListener |
| CX-I-1304 | `web/components/community/CommunityBoard.tsx:55`<br>useEffect@49 | removeEventListener "storage" | `window.removeEventListener("storage", storage)`<br>호출: window.removeEventListener | 55: window.removeEventListener |
| CX-I-1305 | `web/components/community/CommunityBoard.tsx:55`<br>useEffect@49 | removeEventListener "focus" | `window.removeEventListener("focus", focus)`<br>호출: window.removeEventListener | 55: window.removeEventListener |
| CX-I-1306 | `web/components/community/CommunityBoard.tsx:57`<br>CommunityBoard | mount 또는 의존성 변화 [params] | `[params]`<br>호출: setCategory, params.get, setSelectedId | 반환 cleanup 없음 |
| CX-I-1307 | `web/components/community/CommunityBoard.tsx:58`<br>CommunityBoard | mount 또는 의존성 변화 [category, query, mine, sort, showExamples] | `[category, query, mine, sort, showExamples]`<br>호출: setShown | 반환 cleanup 없음 |
| CX-I-1308 | `web/components/community/CommunityBoard.tsx:59`<br>CommunityBoard | mount 또는 의존성 변화 [selectedId] | `[selectedId]`<br>호출: setComment, setEditComment, setConfirm, detailHeading.current?.focus | 반환 cleanup 없음 |
| CX-I-1309 | `web/components/community/CommunityBoard.tsx:60`<br>CommunityBoard | mount 또는 의존성 변화 [toast] | `[toast]`<br>호출: setTimeout, setToast, clearTimeout | 60: clearTimeout |
| CX-I-1310 | `web/components/community/CommunityBoard.tsx:60`<br>useEffect@60 | setTimeout 지연 5000 | `setTimeout(() => setToast(""), 5000)`<br>호출: setTimeout, setToast | 60: clearTimeout |
| CX-I-1311 | `web/components/community/CommunityBoard.tsx:60`<br>useEffect@60 | clearTimeout | `clearTimeout(timer)`<br>호출: clearTimeout | 60: clearTimeout |
| CX-I-1312 | `web/components/community/CommunityBoard.tsx:81`<br>CommunityBoard | button.onClick | `() => { if (requireLogin()) { setError(""); setComposer({ ownerId: user¬.id }); } }`<br>호출: requireLogin, setError, setComposer, useAuthStore.getState().openAuthModal, useAuthStore.getState | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1313 | `web/components/community/CommunityBoard.tsx:83`<br>CommunityBoard | button.onClick | `() => setShowExamples(value => ¬value)`<br>호출: setShowExamples | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1314 | `web/components/community/CommunityBoard.tsx:84`<br>CommunityBoard | button.onClick | `() => void refresh()`<br>호출: refresh | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1315 | `web/components/community/CommunityBoard.tsx:86`<br>CommunityBoard | button.onClick | `() => select(null)`<br>호출: select, setSelectedId, setError, URL, url.searchParams.set, url.searchParams.delete, window.history.pushState | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1316 | `web/components/community/CommunityBoard.tsx:88`<br>CommunityBoard | button.onClick | `async () => { try { await navigator.clipboard.writeText(window.location.href); setToast("게시글 링크가 복사되었습니다."); } catch { setError("주소 표시줄의 링크를 복사해 주세요."); } }`<br>호출: navigator.clipboard.writeText, setToast, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1317 | `web/components/community/CommunityBoard.tsx:88`<br>CommunityBoard | button.onClick | `() => { setError(""); setComposer({ ownerId: user¬.id, editing: selected }); }`<br>호출: setError, setComposer | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1318 | `web/components/community/CommunityBoard.tsx:88`<br>CommunityBoard | button.onClick | `() => setConfirm("post")`<br>호출: setConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1319 | `web/components/community/CommunityBoard.tsx:89`<br>CommunityBoard | button.onClick | `async () => { if (await mutate({ type: "delete", id: selected.id, revision: selected.revision })) select(null); }`<br>호출: mutate, select, requireLogin, setBusy, setError, submitBoardCommand, useAuthStore.getState, setSnapshot, refresh, setToast, setConfirm, errorMessage, setLoading, setSelectedId, URL, url.searchParams.set, url.searchParams.delete, window.history.pushState | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1320 | `web/components/community/CommunityBoard.tsx:89`<br>CommunityBoard | button.onClick | `() => setConfirm(null)`<br>호출: setConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1321 | `web/components/community/CommunityBoard.tsx:93`<br>selected.comments.map@93 | button.onClick | `() => { setEditComment(c.id); setComment(c.body); }`<br>호출: setEditComment, setComment | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1322 | `web/components/community/CommunityBoard.tsx:93`<br>selected.comments.map@93 | button.onClick | `() => setConfirm(c.id)`<br>호출: setConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1323 | `web/components/community/CommunityBoard.tsx:93`<br>selected.comments.map@93 | button.onClick | `() => void mutate({ type: "deleteComment", id: selected.id, commentId: c.id, revision: selected.revision })`<br>호출: mutate, requireLogin, setBusy, setError, submitBoardCommand, useAuthStore.getState, setSnapshot, refresh, setToast, setConfirm, errorMessage, setLoading | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1324 | `web/components/community/CommunityBoard.tsx:93`<br>selected.comments.map@93 | button.onClick | `() => setConfirm(null)`<br>호출: setConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1325 | `web/components/community/CommunityBoard.tsx:94`<br>CommunityBoard | form.onSubmit | `async e => { e.preventDefault(); if (await mutate(editComment ? { type: "editComment", id: selected.id, commentId: editComment, body: comment, revision: selected.revision } : { type: "comment", id: selected.id, body: comment })) { setComment(""); setEditComment(null); } }`<br>호출: e.preventDefault, mutate, setComment, setEditComment, requireLogin, setBusy, setError, submitBoardCommand, useAuthStore.getState, setSnapshot, refresh, setToast, setConfirm, errorMessage, setLoading | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1326 | `web/components/community/CommunityBoard.tsx:94`<br>CommunityBoard | textarea.onChange | `e => setComment(e.target.value)`<br>호출: setComment | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1327 | `web/components/community/CommunityBoard.tsx:94`<br>CommunityBoard | button.onClick | `() => { setEditComment(null); setComment(""); }`<br>호출: setEditComment, setComment | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1328 | `web/components/community/CommunityBoard.tsx:94`<br>CommunityBoard | button.onClick | `requireLogin`<br>호출: requireLogin, useAuthStore.getState().openAuthModal, useAuthStore.getState | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1329 | `web/components/community/CommunityBoard.tsx:96`<br>CommunityBoard | button.onClick | `() => select(null)`<br>호출: select, setSelectedId, setError, URL, url.searchParams.set, url.searchParams.delete, window.history.pushState | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1330 | `web/components/community/CommunityBoard.tsx:97`<br>CommunityBoard | input.onChange | `e => setQuery(e.target.value)`<br>호출: setQuery | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1331 | `web/components/community/CommunityBoard.tsx:97`<br>CommunityBoard | select.onChange | `e => setSort(e.target.value)`<br>호출: setSort | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1332 | `web/components/community/CommunityBoard.tsx:97`<br>CommunityBoard | button.onClick | `() => void refresh()`<br>호출: refresh | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1333 | `web/components/community/CommunityBoard.tsx:98`<br>[["all", "전체"], ...Object.entries(CATEGORY_LABELS)].map@98 | button.onClick | `() => setCategory(k)`<br>호출: setCategory | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1334 | `web/components/community/CommunityBoard.tsx:98`<br>CommunityBoard | button.onClick | `() => { if (requireLogin()) setMine(¬mine); }`<br>호출: requireLogin, setMine, useAuthStore.getState().openAuthModal, useAuthStore.getState | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1335 | `web/components/community/CommunityBoard.tsx:100`<br>CommunityBoard | button.onClick | `() => { setQuery(""); setMine(false); setCategory("all"); }`<br>호출: setQuery, setMine, setCategory | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1336 | `web/components/community/CommunityBoard.tsx:100`<br>visible.slice(0, shown).map@100 | button.onClick | `() => select(p.id)`<br>호출: select, setSelectedId, setError, URL, url.searchParams.set, url.searchParams.delete, window.history.pushState | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1337 | `web/components/community/CommunityBoard.tsx:101`<br>CommunityBoard | button.onClick | `() => setShown(n => n + 15)`<br>호출: setShown | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1338 | `web/components/community/CommunityBoard.tsx:102`<br>CommunityBoard | button.onClick | `() => { setCategory("notice"); setQuery(""); setMine(false); }`<br>호출: setCategory, setQuery, setMine | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1339 | `web/components/community/CommunityBoard.tsx:103`<br>CommunityBoard | BoardComposer.onClose | `() => setComposer(null)`<br>호출: setComposer | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1340 | `web/components/community/CommunityBoard.tsx:103`<br>CommunityBoard | BoardComposer.onSave | `async draft => { const ok = await mutate(composer.editing ? { type: "edit", id: composer.editing.id, revision: composer.editing.revision, draft } : { type: "create", draft }); if (ok) { setComposer(null); if (¬composer.editing) { setCategory(draft.category); setMine(false); setQuery(""); setSort("newest"); select(null); } } return ok; }`<br>호출: mutate, setComposer, setCategory, setMine, setQuery, setSort, select, requireLogin, setBusy, setError, submitBoardCommand, useAuthStore.getState, setSnapshot, refresh, setToast, setConfirm, errorMessage, setLoading, setSelectedId, URL, url.searchParams.set, url.searchParams.delete, window.history.pushState | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/community/ReviewFormModal.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/inventoryStore.ts (web/components/community/ReviewFormModal.tsx:9)`, `web/stores/communityStore.ts (web/components/community/ReviewFormModal.tsx:10)`, `web/stores/usePublishedReviews.ts (web/components/community/ReviewFormModal.tsx:16)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1341 | `web/components/community/ReviewFormModal.tsx:23`<br>shrinkImage | image.onload | `() => resolve(image)`<br>호출: resolve | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1342 | `web/components/community/ReviewFormModal.tsx:23`<br>shrinkImage | image.onerror | `reject`<br>호출: reject | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1343 | `web/components/community/ReviewFormModal.tsx:50`<br>ReviewFormModal | mount 또는 의존성 변화 [open, initialOwnedId, editing] | `[open, initialOwnedId, editing]`<br>호출: useInventoryStore.getState().items.filter, useInventoryStore.getState, canReview, useCommunityStore.getState, eligibleItems.find, setOwnedId, setText, setRating, setPhoto, setError, setBusy | 반환 cleanup 없음 |
| CX-I-1344 | `web/components/community/ReviewFormModal.tsx:89`<br>ReviewFormModal | div.onMouseDown | `e => e.target === e.currentTarget && onClose()`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1345 | `web/components/community/ReviewFormModal.tsx:91`<br>ReviewFormModal | button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1346 | `web/components/community/ReviewFormModal.tsx:94`<br>ReviewFormModal | form.onSubmit | `e => { e.preventDefault(); submit(); }`<br>호출: e.preventDefault, submit, text.trim, setError, assertCommunitySafeText, setBusy, browserAccountsEnabled, announcePublishedReviews, submitCommunityReview, useCommunityStore.getState().update, useCommunityStore.getState, useInventoryStore.getState().items.find, useInventoryStore.getState, canReview, useCommunityStore.getState().add, onSubmitted, useCommunityStore.getState().remove | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1347 | `web/components/community/ReviewFormModal.tsx:95`<br>ReviewFormModal | select.onChange | `e => setOwnedId(e.target.value)`<br>호출: setOwnedId | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1348 | `web/components/community/ReviewFormModal.tsx:96`<br>[1, 2, 3, 4, 5].map@96 | input.onChange | `() => setRating(n)`<br>호출: setRating | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1349 | `web/components/community/ReviewFormModal.tsx:97`<br>ReviewFormModal | textarea.onChange | `e => setText(e.target.value)`<br>호출: setText | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1350 | `web/components/community/ReviewFormModal.tsx:98`<br>ReviewFormModal | button.onClick | `() => { imageTask.current++; setPhoto(undefined); setBusy(false); }`<br>호출: setPhoto, setBusy | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1351 | `web/components/community/ReviewFormModal.tsx:99`<br>ReviewFormModal | input.onChange | `e => { void onFile(e.target.files?.[0]); e.target.value = ""; }`<br>호출: onFile, setBusy, setError, shrinkImage, setPhoto | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/dev/Gallery.tsx

상태: 라우트 그래프 도달. store import: `web/stores/authStore.ts (web/components/dev/Gallery.tsx:12)`, `web/stores/flowStore.ts (web/components/dev/Gallery.tsx:13)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1352 | `web/components/dev/Gallery.tsx:78`<br>Gallery | TextLink.onClick | `() => undefined`<br>호출: 없음 | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1353 | `web/components/dev/Gallery.tsx:80`<br>Gallery | Chips.onChange | `setChip`<br>호출: setChip | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1354 | `web/components/dev/Gallery.tsx:98`<br>CHAIN_FIXTURES.map@97 | ChainRecordView.onRetry | `() => undefined`<br>호출: 없음 | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1355 | `web/components/dev/Gallery.tsx:102`<br>Gallery | Button.onClick | `() => toast(t("common.copied"))`<br>호출: toast | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1356 | `web/components/dev/Gallery.tsx:105`<br>Gallery | Button.onClick | `() => setSheet(true)`<br>호출: setSheet | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1357 | `web/components/dev/Gallery.tsx:106`<br>Gallery | Button.onClick | `() => openLogin("login")`<br>호출: openLogin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1358 | `web/components/dev/Gallery.tsx:107`<br>Gallery | Button.onClick | `() => openLogin("signup")`<br>호출: openLogin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1359 | `web/components/dev/Gallery.tsx:108`<br>Gallery | Button.onClick | `() => openLogin("recover")`<br>호출: openLogin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1360 | `web/components/dev/Gallery.tsx:109`<br>Gallery | Button.onClick | `openCharge`<br>호출: openCharge | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1361 | `web/components/dev/Gallery.tsx:110`<br>Gallery | Button.onClick | `openMenu`<br>호출: openMenu | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1362 | `web/components/dev/Gallery.tsx:111`<br>Gallery | Button.onClick | `() => setVerify(true)`<br>호출: setVerify | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1363 | `web/components/dev/Gallery.tsx:112`<br>Gallery | Button.onClick | `() => setShip(true)`<br>호출: setShip | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1364 | `web/components/dev/Gallery.tsx:116`<br>Gallery | Button.onClick | `() => setConfirm("open")`<br>호출: setConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1365 | `web/components/dev/Gallery.tsx:117`<br>Gallery | Button.onClick | `() => setConfirm("take")`<br>호출: setConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1366 | `web/components/dev/Gallery.tsx:118`<br>Gallery | Button.onClick | `() => setConfirm("ship")`<br>호출: setConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1367 | `web/components/dev/Gallery.tsx:119`<br>Gallery | Button.onClick | `() => setConfirm("cancel")`<br>호출: setConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1368 | `web/components/dev/Gallery.tsx:123`<br>Gallery | Button.onClick | `() => setReveal("cash")`<br>호출: setReveal | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1369 | `web/components/dev/Gallery.tsx:124`<br>Gallery | Button.onClick | `() => setReveal("item")`<br>호출: setReveal | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1370 | `web/components/dev/Gallery.tsx:125`<br>Gallery | Button.onClick | `() => setReveal("multi")`<br>호출: setReveal | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1371 | `web/components/dev/Gallery.tsx:128`<br>Gallery | Sheet.onClose | `() => setSheet(false)`<br>호출: setSheet | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1372 | `web/components/dev/Gallery.tsx:130`<br>Gallery | Button.onClick | `() => setSheet(false)`<br>호출: setSheet | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1373 | `web/components/dev/Gallery.tsx:131`<br>Gallery | TextLink.onClick | `() => setSheet(false)`<br>호출: setSheet | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1374 | `web/components/dev/Gallery.tsx:133`<br>Gallery | Confirm.onCancel | `() => setConfirm(null)`<br>호출: setConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1375 | `web/components/dev/Gallery.tsx:133`<br>Gallery | Confirm.onConfirm | `() => setConfirm(null)`<br>호출: setConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1376 | `web/components/dev/Gallery.tsx:134`<br>Gallery | Confirm.onCancel | `() => setConfirm(null)`<br>호출: setConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1377 | `web/components/dev/Gallery.tsx:134`<br>Gallery | Confirm.onConfirm | `() => setConfirm(null)`<br>호출: setConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1378 | `web/components/dev/Gallery.tsx:135`<br>Gallery | Confirm.onCancel | `() => setConfirm(null)`<br>호출: setConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1379 | `web/components/dev/Gallery.tsx:135`<br>Gallery | Confirm.onConfirm | `() => setConfirm(null)`<br>호출: setConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1380 | `web/components/dev/Gallery.tsx:136`<br>Gallery | Confirm.onCancel | `() => setConfirm(null)`<br>호출: setConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1381 | `web/components/dev/Gallery.tsx:136`<br>Gallery | Confirm.onConfirm | `() => setConfirm(null)`<br>호출: setConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1382 | `web/components/dev/Gallery.tsx:137`<br>Gallery | VerifySheet.onClose | `() => setVerify(false)`<br>호출: setVerify | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1383 | `web/components/dev/Gallery.tsx:138`<br>Gallery | ShipSheet.onClose | `() => setShip(false)`<br>호출: setShip | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1384 | `web/components/dev/Gallery.tsx:138`<br>Gallery | ShipSheet.onDone | `() => setShip(false)`<br>호출: setShip | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1385 | `web/components/dev/Gallery.tsx:139`<br>Gallery | Reveal.onClose | `() => setReveal(null)`<br>호출: setReveal | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1386 | `web/components/dev/Gallery.tsx:139`<br>Gallery | Reveal.onAgain | `() => setReveal(null)`<br>호출: setReveal | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/fairness/FairnessVerifier.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1387 | `web/components/fairness/FairnessVerifier.tsx:70`<br>FairnessVerifier | mount 또는 의존성 변화 [boxSlug, serverSeed, serverSeedHash, clientSeed, nonce] | `[boxSlug, serverSeed, serverSeedHash, clientSeed, nonce]`<br>호출: setResult, setError | 반환 cleanup 없음 |
| CX-I-1388 | `web/components/fairness/FairnessVerifier.tsx:130`<br>FairnessVerifier | select.onChange | `(e) => setBoxSlug(e.target.value)`<br>호출: setBoxSlug | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1389 | `web/components/fairness/FairnessVerifier.tsx:139`<br>FairnessVerifier | textarea.onChange | `(e) => setServerSeed(e.target.value)`<br>호출: setServerSeed | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1390 | `web/components/fairness/FairnessVerifier.tsx:142`<br>FairnessVerifier | input.onChange | `(e) => setServerSeedHash(e.target.value)`<br>호출: setServerSeedHash | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1391 | `web/components/fairness/FairnessVerifier.tsx:148`<br>FairnessVerifier | input.onChange | `(e) => setClientSeed(e.target.value)`<br>호출: setClientSeed | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1392 | `web/components/fairness/FairnessVerifier.tsx:149`<br>FairnessVerifier | button.onClick | `() => setClientSeed(generateClientSeed())`<br>호출: setClientSeed, generateClientSeed | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1393 | `web/components/fairness/FairnessVerifier.tsx:156`<br>FairnessVerifier | input.onChange | `(e) => setNonce(e.target.value)`<br>호출: setNonce | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1394 | `web/components/fairness/FairnessVerifier.tsx:165`<br>FairnessVerifier | button.onClick | `run`<br>호출: run | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1395 | `web/components/fairness/FairnessVerifier.tsx:172`<br>FairnessVerifier | button.onClick | `clear`<br>호출: clear, setServerSeed, setServerSeedHash, setClientSeed, setNonce, setResult, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1396 | `web/components/fairness/FairnessVerifier.tsx:218`<br>FairnessVerifier | button.onClick | `() => { void generate().catch(() => setError(t("computeError"))); }`<br>호출: generate().catch, generate, setError, generateServerSeed, setDemoSeed, setDemoHash, hashServerSeed, setRevealed | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1397 | `web/components/fairness/FairnessVerifier.tsx:239`<br>FairnessVerifier | button.onClick | `() => setRevealed(true)`<br>호출: setRevealed | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1398 | `web/components/fairness/FairnessVerifier.tsx:245`<br>FairnessVerifier | button.onClick | `useDemo`<br>호출: useDemo, setServerSeed, setServerSeedHash, setClientSeed, generateClientSeed | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/fairness/HashExplainer.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1399 | `web/components/fairness/HashExplainer.tsx:16`<br>HashExplainer | mount 또는 의존성 변화 [] | `[]`<br>호출: setReady | 반환 cleanup 없음 |
| CX-I-1400 | `web/components/fairness/HashExplainer.tsx:17`<br>HashExplainer | mount 또는 의존성 변화 [value] | `[value]`<br>호출: setHash, setFailed, hashServerSeed(value).then((digest) => { if (active) setHash(digest); }).catch, hashServerSeed(value).then, hashServerSeed | 22: |
| CX-I-1401 | `web/components/fairness/HashExplainer.tsx:33`<br>HashExplainer | input.onChange | `(event) => setValue(event.target.value)`<br>호출: setValue | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/fairness/ProofFeed.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/walletStore.ts (web/components/fairness/ProofFeed.tsx:15)`, `web/stores/fairStore.ts (web/components/fairness/ProofFeed.tsx:16)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1402 | `web/components/fairness/ProofFeed.tsx:49`<br>ProofFeed | mount 또는 의존성 변화 [] | `[]`<br>호출: setNow, Date.now, setInterval, clearInterval | 52: clearInterval |
| CX-I-1403 | `web/components/fairness/ProofFeed.tsx:51`<br>useEffect@49 | setInterval 지연 30_000 | `setInterval(() => setNow(Date.now()), 30_000)`<br>호출: setInterval, setNow, Date.now | 52: clearInterval |
| CX-I-1404 | `web/components/fairness/ProofFeed.tsx:52`<br>useEffect@49 | clearInterval | `clearInterval(id)`<br>호출: clearInterval | 52: clearInterval |
| CX-I-1405 | `web/components/fairness/ProofFeed.tsx:55`<br>ProofFeed | mount 또는 의존성 변화 [] | `[]`<br>호출: isLive, api.proofFeed().then((d) => { if (alive) { setRemote(d.payouts); setFeedError(false); } }).catch, api.proofFeed().then, api.proofFeed, setRemote, setFeedError, pull, api.reserve().then((r) => alive && setReserve(r)).catch, api.reserve().then, api.reserve, setReserve, setInterval, clearInterval | 62: clearInterval |
| CX-I-1406 | `web/components/fairness/ProofFeed.tsx:61`<br>useEffect@55 | setInterval 지연 30_000 | `setInterval(pull, 30_000)`<br>호출: setInterval | 62: clearInterval |
| CX-I-1407 | `web/components/fairness/ProofFeed.tsx:64`<br>useEffect@55 | clearInterval | `clearInterval(id)`<br>호출: clearInterval | 62: clearInterval |
| CX-I-1408 | `web/components/fairness/ProofFeed.tsx:97`<br>copyReserve | setTimeout 지연 1600 | `setTimeout(() => setCopied(false), 1600)`<br>호출: setTimeout, setCopied | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1409 | `web/components/fairness/ProofFeed.tsx:123`<br>ProofFeed | button.onClick | `copyReserve`<br>호출: copyReserve, navigator.clipboard.writeText, setCopied, setTimeout | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/fairness/VisualVerifier.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/inventoryStore.ts (web/components/fairness/VisualVerifier.tsx:11)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1410 | `web/components/fairness/VisualVerifier.tsx:35`<br>VisualVerifier | mount 또는 의존성 변화 [picked?.id] | `[picked?.id]`<br>호출: setBusy, setResult, setError | 반환 cleanup 없음 |
| CX-I-1411 | `web/components/fairness/VisualVerifier.tsx:36`<br>VisualVerifier | mount 또는 의존성 변화 [] | `[]`<br>호출: 없음 | 반환 cleanup 없음 |
| CX-I-1412 | `web/components/fairness/VisualVerifier.tsx:53`<br>VisualVerifier | mount 또는 의존성 변화 [autoRun, picked, run] | `[autoRun, picked, run]`<br>호출: run | 반환 cleanup 없음 |
| CX-I-1413 | `web/components/fairness/VisualVerifier.tsx:67`<br>download | setTimeout 지연 1000 | `setTimeout(() => URL.revokeObjectURL(url), 1000)`<br>호출: setTimeout, URL.revokeObjectURL | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1414 | `web/components/fairness/VisualVerifier.tsx:85`<br>VisualVerifier | select.onChange | `(event) => setPickedId(event.target.value)`<br>호출: setPickedId | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1415 | `web/components/fairness/VisualVerifier.tsx:89`<br>VisualVerifier | button.onClick | `() => void run()`<br>호출: run | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1416 | `web/components/fairness/VisualVerifier.tsx:113`<br>VisualVerifier | button.onClick | `download`<br>호출: download, URL.createObjectURL, Blob, JSON.stringify, document.createElement, picked.id.replace, anchor.click, setTimeout, URL.revokeObjectURL | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/fairness/VisualVerifyModal.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1417 | `web/components/fairness/VisualVerifyModal.tsx:30`<br>VisualVerifyModal | motion.div.onMouseDown | `(e) => e.target === e.currentTarget && onClose()`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1418 | `web/components/fairness/VisualVerifyModal.tsx:43`<br>VisualVerifyModal | button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/flow/BalanceSheet.tsx

상태: 라우트 그래프 도달. store import: `web/stores/flowStore.ts (web/components/flow/BalanceSheet.tsx:12)`, `web/stores/authStore.ts (web/components/flow/BalanceSheet.tsx:13)`, `web/stores/walletStore.ts (web/components/flow/BalanceSheet.tsx:14)`, `web/stores/inventoryStore.ts (web/components/flow/BalanceSheet.tsx:15)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1419 | `web/components/flow/BalanceSheet.tsx:34`<br>BalanceSheet | mount 또는 의존성 변화 [open] | `[open]`<br>호출: setTaking | 반환 cleanup 없음 |
| CX-I-1420 | `web/components/flow/BalanceSheet.tsx:38`<br>BalanceSheet | Sheet.onClose | `close`<br>호출: close | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1421 | `web/components/flow/BalanceSheet.tsx:39`<br>BalanceSheet | Button.onClick | `() => { close(); openLogin("login"); }`<br>호출: close, openLogin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1422 | `web/components/flow/BalanceSheet.tsx:46`<br>BalanceSheet | Sheet.onClose | `close`<br>호출: close | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1423 | `web/components/flow/BalanceSheet.tsx:52`<br>BalanceSheet | Button.onClick | `() => setTaking(true)`<br>호출: setTaking | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1424 | `web/components/flow/BalanceSheet.tsx:52`<br>BalanceSheet | Button.onClick | `charge`<br>호출: charge, close, openCharge | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1425 | `web/components/flow/BalanceSheet.tsx:54`<br>BalanceSheet | TextLink.onClick | `charge`<br>호출: charge, close, openCharge | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1426 | `web/components/flow/BalanceSheet.tsx:55`<br>BalanceSheet | TextLink.onClick | `close`<br>호출: close | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1427 | `web/components/flow/BalanceSheet.tsx:56`<br>BalanceSheet | TextLink.onClick | `close`<br>호출: close | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1428 | `web/components/flow/BalanceSheet.tsx:59`<br>BalanceSheet | TakeSheet.onClose | `close`<br>호출: close | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/flow/ChargeSheet.tsx

상태: 라우트 그래프 도달. store import: `web/stores/flowStore.ts (web/components/flow/ChargeSheet.tsx:12)`, `web/stores/authStore.ts (web/components/flow/ChargeSheet.tsx:13)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1429 | `web/components/flow/ChargeSheet.tsx:38`<br>ChargeSheet | Sheet.onClose | `close`<br>호출: close | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1430 | `web/components/flow/ChargeSheet.tsx:39`<br>ChargeSheet | Button.onClick | `() => openLogin("login")`<br>호출: openLogin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1431 | `web/components/flow/ChargeSheet.tsx:44`<br>ChargeSheet | Sheet.onClose | `close`<br>호출: close | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1432 | `web/components/flow/ChargeSheet.tsx:45`<br>ChargeSheet | Chips.onChange | `setNetwork`<br>호출: setNetwork | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1433 | `web/components/flow/ChargeSheet.tsx:56`<br>ChargeSheet | Button.onClick | `() => setAttempt((n) => n + 1)`<br>호출: setAttempt | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1434 | `web/components/flow/ChargeSheet.tsx:56`<br>ChargeSheet | Button.onClick | `copy`<br>호출: copy, navigator.clipboard.writeText, toast | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/flow/LoginSheet.tsx

상태: 라우트 그래프 도달. store import: `web/stores/authStore.ts (web/components/flow/LoginSheet.tsx:9)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1435 | `web/components/flow/LoginSheet.tsx:35`<br>LoginSheet | mount 또는 의존성 변화 [open, mode] | `[open, mode]`<br>호출: setStep, setPassword, setCode, setError, setEmail | 반환 cleanup 없음 |
| CX-I-1436 | `web/components/flow/LoginSheet.tsx:84`<br>LoginSheet | Sheet.onClose | `close`<br>호출: close | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1437 | `web/components/flow/LoginSheet.tsx:86`<br>LoginSheet | Button.onClick | `() => setMode("login")`<br>호출: setMode | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1438 | `web/components/flow/LoginSheet.tsx:88`<br>LoginSheet | form.onSubmit | `submit`<br>호출: submit, event.preventDefault, run, fresh, acceptSession, validAccountEmail, AccountError, setEmail, email.trim, recoverAccount, setStep, validAccountPassword, signupAccount, accept, setPassword, loginAccount, verifyAccountEmail, completePasswordRecovery | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1439 | `web/components/flow/LoginSheet.tsx:89`<br>LoginSheet | Field.onChange | `(e) => setEmail(e.target.value)`<br>호출: setEmail | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1440 | `web/components/flow/LoginSheet.tsx:90`<br>LoginSheet | Field.onChange | `(e) => setCode(e.target.value.replace(/\D/g, ""))`<br>호출: setCode, e.target.value.replace | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1441 | `web/components/flow/LoginSheet.tsx:91`<br>LoginSheet | Field.onChange | `(e) => setPassword(e.target.value)`<br>호출: setPassword | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1442 | `web/components/flow/LoginSheet.tsx:100`<br>PROVIDERS.map@99 | Button.onClick | `() => social(p.key)`<br>호출: social, run, beginSocialLogin, fresh, acceptSession, window.location.assign | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1443 | `web/components/flow/LoginSheet.tsx:105`<br>LoginSheet | TextLink.onClick | `() => switchMode(signup &#124;&#124; recover ? "login" : "signup")`<br>호출: switchMode, setMode | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1444 | `web/components/flow/LoginSheet.tsx:106`<br>LoginSheet | TextLink.onClick | `back`<br>호출: back, setStep, setPassword, setCode, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1445 | `web/components/flow/LoginSheet.tsx:107`<br>LoginSheet | TextLink.onClick | `() => switchMode("recover")`<br>호출: switchMode, setMode | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1446 | `web/components/flow/LoginSheet.tsx:108`<br>LoginSheet | TextLink.onClick | `() => void run(async () => { if (step === "verify") await resendAccountEmail(email, locale); else await recoverAccount(email, locale); setCode(""); })`<br>호출: run, resendAccountEmail, recoverAccount, setCode, setBusy, setError, work | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/flow/ReviewSheet.tsx

상태: 라우트 그래프 도달. store import: `web/stores/communityStore.ts (web/components/flow/ReviewSheet.tsx:9)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1447 | `web/components/flow/ReviewSheet.tsx:55`<br>ReviewSheet | Sheet.onClose | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1448 | `web/components/flow/ReviewSheet.tsx:56`<br>ReviewSheet | Chips.onChange | `setRating`<br>호출: setRating | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1449 | `web/components/flow/ReviewSheet.tsx:59`<br>ReviewSheet | textarea.onChange | `(e) => { setText(e.target.value); if (failed === "short") setFailed(null); }`<br>호출: setText, setFailed | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1450 | `web/components/flow/ReviewSheet.tsx:63`<br>ReviewSheet | input.onChange | `pick`<br>호출: pick, setPhoto, shrink, setFailed | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1451 | `web/components/flow/ReviewSheet.tsx:69`<br>ReviewSheet | Button.onClick | `send`<br>호출: send, text.trim, setFailed, setBusy, add, setText, setPhoto, onDone | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/flow/ShipSheet.tsx

상태: 라우트 그래프 도달. store import: `web/stores/inventoryStore.ts (web/components/flow/ShipSheet.tsx:12)`, `web/stores/walletStore.ts (web/components/flow/ShipSheet.tsx:13)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1452 | `web/components/flow/ShipSheet.tsx:35`<br>ShipSheet | mount 또는 의존성 변화 [open] | `[open]`<br>호출: crypto.randomUUID, setForm, setTouched, setFailed, setConfirming | 반환 cleanup 없음 |
| CX-I-1453 | `web/components/flow/ShipSheet.tsx:62`<br>ShipSheet | Sheet.onClose | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1454 | `web/components/flow/ShipSheet.tsx:63`<br>ShipSheet | Chips.onChange | `(c: CountryCode) => set("country", c)`<br>호출: set, setForm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1455 | `web/components/flow/ShipSheet.tsx:64`<br>ShipSheet | Field.onChange | `(e) => set("recipient", e.target.value)`<br>호출: set, setForm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1456 | `web/components/flow/ShipSheet.tsx:66`<br>ShipSheet | Field.onChange | `(e) => set("phone", e.target.value)`<br>호출: set, setForm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1457 | `web/components/flow/ShipSheet.tsx:68`<br>ShipSheet | Field.onChange | `(e) => set("postalCode", e.target.value)`<br>호출: set, setForm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1458 | `web/components/flow/ShipSheet.tsx:70`<br>ShipSheet | Field.onChange | `(e) => set("address", e.target.value)`<br>호출: set, setForm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1459 | `web/components/flow/ShipSheet.tsx:72`<br>ShipSheet | Field.onChange | `(e) => set("customsId", e.target.value)`<br>호출: set, setForm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1460 | `web/components/flow/ShipSheet.tsx:77`<br>ShipSheet | Button.onClick | `press`<br>호출: press, setTouched, setFailed, setConfirming | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1461 | `web/components/flow/ShipSheet.tsx:79`<br>ShipSheet | Confirm.onCancel | `() => setConfirming(false)`<br>호출: setConfirming | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1462 | `web/components/flow/ShipSheet.tsx:79`<br>ShipSheet | Confirm.onConfirm | `submit`<br>호출: submit, setBusy, requestShipment, setConfirming, onDone, setFailed | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/flow/TakeSheet.tsx

상태: 라우트 그래프 도달. store import: `web/stores/authStore.ts (web/components/flow/TakeSheet.tsx:22)`, `web/stores/inventoryStore.ts (web/components/flow/TakeSheet.tsx:23)`, `web/stores/walletStore.ts (web/components/flow/TakeSheet.tsx:24)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1463 | `web/components/flow/TakeSheet.tsx:40`<br>useTakeLedger | mount 또는 의존성 변화 [] | `[]`<br>호출: reviewTakeMarks, review, window.addEventListener, document.addEventListener, window.removeEventListener, document.removeEventListener | 45: window.removeEventListener, document.removeEventListener |
| CX-I-1464 | `web/components/flow/TakeSheet.tsx:43`<br>useEffect@40 | addEventListener "focus" | `window.addEventListener("focus", review)`<br>호출: window.addEventListener | 45: window.removeEventListener, document.removeEventListener |
| CX-I-1465 | `web/components/flow/TakeSheet.tsx:44`<br>useEffect@40 | addEventListener "visibilitychange" | `document.addEventListener("visibilitychange", review)`<br>호출: document.addEventListener | 45: window.removeEventListener, document.removeEventListener |
| CX-I-1466 | `web/components/flow/TakeSheet.tsx:45`<br>useEffect@40 | removeEventListener "focus" | `window.removeEventListener("focus", review)`<br>호출: window.removeEventListener | 45: window.removeEventListener, document.removeEventListener |
| CX-I-1467 | `web/components/flow/TakeSheet.tsx:45`<br>useEffect@40 | removeEventListener "visibilitychange" | `document.removeEventListener("visibilitychange", review)`<br>호출: document.removeEventListener | 45: window.removeEventListener, document.removeEventListener |
| CX-I-1468 | `web/components/flow/TakeSheet.tsx:56`<br>TakeConfirm | Confirm.onCancel | `onCancel`<br>호출: onCancel | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1469 | `web/components/flow/TakeSheet.tsx:56`<br>TakeConfirm | Confirm.onConfirm | `onConfirm`<br>호출: onConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1470 | `web/components/flow/TakeSheet.tsx:92`<br>TakeSheet | mount 또는 의존성 변화 [open, accountId] | `[open, accountId]`<br>호출: setPicked, Set, setStep, setOutcome, setBusy, setGone, reviewTakeMarks | 반환 cleanup 없음 |
| CX-I-1471 | `web/components/flow/TakeSheet.tsx:119`<br>TakeSheet | mount 또는 의존성 변화 [open, step, busy, selected.length] | `[open, step, busy, selected.length]`<br>호출: setGone, setStep | 반환 cleanup 없음 |
| CX-I-1472 | `web/components/flow/TakeSheet.tsx:150`<br>TakeSheet | Sheet.onClose | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1473 | `web/components/flow/TakeSheet.tsx:160`<br>TakeSheet | Button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1474 | `web/components/flow/TakeSheet.tsx:167`<br>TakeSheet | button.onClick | `toggleAll`<br>호출: toggleAll, setPicked, Set, candidates.map | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1475 | `web/components/flow/TakeSheet.tsx:178`<br>candidates.map@173 | button.onClick | `() => toggle(item.id)`<br>호출: toggle, setPicked, Set, next.has, next.delete, next.add | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1476 | `web/components/flow/TakeSheet.tsx:191`<br>TakeSheet | Button.onClick | `() => setStep("confirm")`<br>호출: setStep | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1477 | `web/components/flow/TakeSheet.tsx:197`<br>TakeSheet | TakeConfirm.onCancel | `() => setStep("pick")`<br>호출: setStep | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1478 | `web/components/flow/TakeSheet.tsx:197`<br>TakeSheet | TakeConfirm.onConfirm | `() => void run(selected.map((item) => item.id))`<br>호출: run, selected.map, setGone, setStep, setBusy, settleTakeMany, useAuthStore.getState, mergeOutcomes, setOutcome, onTaken | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1479 | `web/components/flow/TakeSheet.tsx:199`<br>TakeSheet | Sheet.onClose | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1480 | `web/components/flow/TakeSheet.tsx:203`<br>TakeSheet | Button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1481 | `web/components/flow/TakeSheet.tsx:236`<br>TakeSheet | Button.onClick | `() => void run(retryIds)`<br>호출: run, setGone, setStep, setBusy, settleTakeMany, useAuthStore.getState, mergeOutcomes, setOutcome, onTaken | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1482 | `web/components/flow/TakeSheet.tsx:237`<br>TakeSheet | Button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1483 | `web/components/flow/TakeSheet.tsx:240`<br>TakeSheet | TextLink.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1484 | `web/components/flow/TakeSheet.tsx:240`<br>TakeSheet | TextLink.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1485 | `web/components/flow/TakeSheet.tsx:241`<br>TakeSheet | TextLink.onClick | `() => { if (¬busy) onClose(); }`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/flow/VerifySheet.tsx

상태: 라우트 그래프 도달. store import: `web/stores/inventoryStore.ts (web/components/flow/VerifySheet.tsx:17)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1486 | `web/components/flow/VerifySheet.tsx:39`<br>VerifySheet | mount 또는 의존성 변화 [target] | `[target]`<br>호출: setMethod, setOutcome, verifyOpeningRecord(target) .then((out) => { if (alive) setOutcome({ state: "done", out }); }) .catch, verifyOpeningRecord(target) .then, verifyOpeningRecord | 46: |
| CX-I-1487 | `web/components/flow/VerifySheet.tsx:57`<br>VerifySheet | Sheet.onClose | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1488 | `web/components/flow/VerifySheet.tsx:88`<br>VerifySheet | TextLink.onClick | `() => setMethod((v) => ¬v)`<br>호출: setMethod | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1489 | `web/components/flow/VerifySheet.tsx:89`<br>VerifySheet | TextLink.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/home/CommerceHome.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1490 | `web/components/home/CommerceHome.tsx:39`<br>BoxCell | button.onClick | `() => onPick(box)`<br>호출: onPick | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1491 | `web/components/home/CommerceHome.tsx:62`<br>CATEGORY_FILTERS.map@62 | button.onClick | `() => onCategory(key)`<br>호출: onCategory | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1492 | `web/components/home/CommerceHome.tsx:74`<br>CommerceHome | button.onClick | `() => onPick(feature)`<br>호출: onPick | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1493 | `web/components/home/CommerceHome.tsx:84`<br>CommerceHome | select.onChange | `(e) => onSort(e.target.value as SortKey)`<br>호출: onSort | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1494 | `web/components/home/CommerceHome.tsx:87`<br>list.map@87 | BoxCell.onPick | `onPick`<br>호출: onPick | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/home/DailyFreeBox.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/dailyStore.ts (web/components/home/DailyFreeBox.tsx:13)`, `web/stores/fairStore.ts (web/components/home/DailyFreeBox.tsx:14)`, `web/stores/walletStore.ts (web/components/home/DailyFreeBox.tsx:15)`, `web/stores/settingsStore.ts (web/components/home/DailyFreeBox.tsx:16)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1495 | `web/components/home/DailyFreeBox.tsx:23`<br>useCountdown | mount 또는 의존성 변화 [] | `[]`<br>호출: setNow, Date.now, setInterval, clearInterval | 26: clearInterval |
| CX-I-1496 | `web/components/home/DailyFreeBox.tsx:25`<br>useEffect@23 | setInterval 지연 1000 | `setInterval(() => setNow(Date.now()), 1000)`<br>호출: setInterval, setNow, Date.now | 26: clearInterval |
| CX-I-1497 | `web/components/home/DailyFreeBox.tsx:26`<br>useEffect@23 | clearInterval | `clearInterval(id)`<br>호출: clearInterval | 26: clearInterval |
| CX-I-1498 | `web/components/home/DailyFreeBox.tsx:41`<br>DailyFreeBoxPill | button.onClick | `onOpen`<br>호출: onOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1499 | `web/components/home/DailyFreeBox.tsx:73`<br>DailyFreeBoxStrip | button.onClick | `onOpen`<br>호출: onOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1500 | `web/components/home/DailyFreeBox.tsx:108`<br>DailyFreeBoxModal | mount 또는 의존성 변화 [open] | `[open]`<br>호출: setStage | 반환 cleanup 없음 |
| CX-I-1501 | `web/components/home/DailyFreeBox.tsx:128`<br>useCallback@114 | setTimeout 지연 900 | `setTimeout(res, 900)`<br>호출: setTimeout | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1502 | `web/components/home/DailyFreeBox.tsx:141`<br>DailyFreeBoxModal | motion.div.onMouseDown | `(e) => e.target === e.currentTarget && onClose()`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1503 | `web/components/home/DailyFreeBox.tsx:154`<br>DailyFreeBoxModal | button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1504 | `web/components/home/DailyFreeBox.tsx:175`<br>Array.from@165 | button.onClick | `() => pick(i)`<br>호출: pick | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/home/HallOfFame.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/inventoryStore.ts (web/components/home/HallOfFame.tsx:12)`, `web/stores/fairStore.ts (web/components/home/HallOfFame.tsx:13)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1505 | `web/components/home/HallOfFame.tsx:53`<br>HallOfFame | mount 또는 의존성 변화 [] | `[]`<br>호출: setNow, Date.now, setInterval, clearInterval | 56: clearInterval |
| CX-I-1506 | `web/components/home/HallOfFame.tsx:55`<br>useEffect@53 | setInterval 지연 1000 | `setInterval(() => setNow(Date.now()), 1000)`<br>호출: setInterval, setNow, Date.now | 56: clearInterval |
| CX-I-1507 | `web/components/home/HallOfFame.tsx:56`<br>useEffect@53 | clearInterval | `clearInterval(id)`<br>호출: clearInterval | 56: clearInterval |
| CX-I-1508 | `web/components/home/HallOfFame.tsx:119`<br>rows.map@111 | button.onClick | `() => pick(r.boxSlug)`<br>호출: pick, onPick | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1509 | `web/components/home/HallOfFame.tsx:156`<br>slots.map@152 | button.onClick | `pickTopJackpot`<br>호출: pickTopJackpot, [...BOXES].sort, dropTable, onPick | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1510 | `web/components/home/HallOfFame.tsx:189`<br>HallOfFame | button.onClick | `pickTopJackpot`<br>호출: pickTopJackpot, [...BOXES].sort, dropTable, onPick | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/home/heroBall.ts

상태: 라우트 그래프 도달. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1511 | `web/components/home/heroBall.ts:100`<br>createBallPainter | addEventListener "webglcontextlost" | `canvas.addEventListener("webglcontextlost", onLost)`<br>호출: canvas.addEventListener | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1512 | `web/components/home/heroBall.ts:114`<br>createBallPainter | removeEventListener "webglcontextlost" | `canvas.removeEventListener("webglcontextlost", onLost)`<br>호출: canvas.removeEventListener | effect 밖, 취소 행 및 화면 요약 참조 |

#### web/components/home/HeroBanner.tsx

상태: 라우트 그래프 도달. store import: `web/stores/authStore.ts (web/components/home/HeroBanner.tsx:20)`, `web/stores/walletStore.ts (web/components/home/HeroBanner.tsx:21)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1513 | `web/components/home/HeroBanner.tsx:58`<br>HeroBanner | mount 또는 의존성 변화 [] | `[]`<br>호출: window.matchMedia, setReduced, apply, mq.addEventListener, mq.removeEventListener | 62: mq.removeEventListener |
| CX-I-1514 | `web/components/home/HeroBanner.tsx:61`<br>useEffect@58 | addEventListener "change" | `mq.addEventListener("change", apply)`<br>호출: mq.addEventListener | 62: mq.removeEventListener |
| CX-I-1515 | `web/components/home/HeroBanner.tsx:62`<br>useEffect@58 | removeEventListener "change" | `mq.removeEventListener("change", apply)`<br>호출: mq.removeEventListener | 62: mq.removeEventListener |
| CX-I-1516 | `web/components/home/HeroBanner.tsx:65`<br>HeroBanner | mount 또는 의존성 변화 [] | `[]`<br>호출: IntersectionObserver, setVisible, io.observe, io.disconnect | 69: io.disconnect |
| CX-I-1517 | `web/components/home/HeroBanner.tsx:67`<br>useEffect@65 | IntersectionObserver | `new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 })`<br>호출: IntersectionObserver, setVisible | 69: io.disconnect |
| CX-I-1518 | `web/components/home/HeroBanner.tsx:68`<br>useEffect@65 | observe | `io.observe(el)`<br>호출: io.observe | 69: io.disconnect |
| CX-I-1519 | `web/components/home/HeroBanner.tsx:69`<br>useEffect@65 | disconnect | `io.disconnect()`<br>호출: io.disconnect | 69: io.disconnect |
| CX-I-1520 | `web/components/home/HeroBanner.tsx:72`<br>HeroBanner | mount 또는 의존성 변화 [running] | `[running]`<br>호출: STEPS.findIndex, setPhase, window.setTimeout, Math.max, window.clearTimeout | 77: window.clearTimeout |
| CX-I-1521 | `web/components/home/HeroBanner.tsx:75`<br>next | setTimeout 지연 STEPS[step][1] | `window.setTimeout(next, STEPS[step][1])`<br>호출: window.setTimeout | 77: window.clearTimeout |
| CX-I-1522 | `web/components/home/HeroBanner.tsx:76`<br>useEffect@72 | setTimeout 지연 phase === "sweep" ? 2400 : STEPS[Math.max(0, step)][1] | `window.setTimeout(next, phase === "sweep" ? 2400 : STEPS[Math.max(0, step)][1])`<br>호출: window.setTimeout, Math.max | 77: window.clearTimeout |
| CX-I-1523 | `web/components/home/HeroBanner.tsx:77`<br>useEffect@72 | clearTimeout | `window.clearTimeout(timer)`<br>호출: window.clearTimeout | 77: window.clearTimeout |
| CX-I-1524 | `web/components/home/HeroBanner.tsx:83`<br>HeroBanner | mount 또는 의존성 변화 [] | `[]`<br>호출: createBallPainter, setBalls, painter.current?.dispose | 86: painter.current?.dispose |
| CX-I-1525 | `web/components/home/HeroBanner.tsx:88`<br>HeroBanner | mount 또는 의존성 변화 [running, balls, reduced] | `[running, balls, reduced]`<br>호출: Array.from, el.querySelectorAll, canvases.map, c.getContext, Math.min, Math.max, Math.round, Math.sin, paint.alive, setBalls, BALLS.forEach, paint.paint, ballMatrix, wave, measure, draw, fit, window.addEventListener, requestAnimationFrame, cancelAnimationFrame, window.removeEventListener | 126: cancelAnimationFrame, window.removeEventListener |
| CX-I-1526 | `web/components/home/HeroBanner.tsx:115`<br>useEffect@88 | addEventListener "resize" | `window.addEventListener("resize", fit)`<br>호출: window.addEventListener | 126: cancelAnimationFrame, window.removeEventListener |
| CX-I-1527 | `web/components/home/HeroBanner.tsx:123`<br>frame | requestAnimationFrame | `requestAnimationFrame(frame)`<br>호출: requestAnimationFrame | 126: cancelAnimationFrame, window.removeEventListener |
| CX-I-1528 | `web/components/home/HeroBanner.tsx:125`<br>useEffect@88 | requestAnimationFrame | `requestAnimationFrame(frame)`<br>호출: requestAnimationFrame | 126: cancelAnimationFrame, window.removeEventListener |
| CX-I-1529 | `web/components/home/HeroBanner.tsx:126`<br>useEffect@88 | cancelAnimationFrame | `cancelAnimationFrame(raf)`<br>호출: cancelAnimationFrame | 126: cancelAnimationFrame, window.removeEventListener |
| CX-I-1530 | `web/components/home/HeroBanner.tsx:126`<br>useEffect@88 | removeEventListener "resize" | `window.removeEventListener("resize", fit)`<br>호출: window.removeEventListener | 126: cancelAnimationFrame, window.removeEventListener |
| CX-I-1531 | `web/components/home/HeroBanner.tsx:185`<br>HeroBanner | button.onClick | `() => openAuth("signup")`<br>호출: openAuth | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/home/HotBoxes.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1532 | `web/components/home/HotBoxes.tsx:53`<br>top.map@49 | button.onClick | `() => onPick(box)`<br>호출: onPick | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/home/JackpotPoolBadge.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1533 | `web/components/home/JackpotPoolBadge.tsx:31`<br>JackpotPoolBadge | mount 또는 의존성 변화 [value] | `[value]`<br>호출: performance.now, Math.min, Math.pow, setShown, (from + (value - from) * eased).toFixed, requestAnimationFrame, cancelAnimationFrame | 42: cancelAnimationFrame |
| CX-I-1534 | `web/components/home/JackpotPoolBadge.tsx:39`<br>tick | requestAnimationFrame | `requestAnimationFrame(tick)`<br>호출: requestAnimationFrame | 42: cancelAnimationFrame |
| CX-I-1535 | `web/components/home/JackpotPoolBadge.tsx:41`<br>useEffect@31 | requestAnimationFrame | `requestAnimationFrame(tick)`<br>호출: requestAnimationFrame | 42: cancelAnimationFrame |
| CX-I-1536 | `web/components/home/JackpotPoolBadge.tsx:42`<br>useEffect@31 | cancelAnimationFrame | `cancelAnimationFrame(raf)`<br>호출: cancelAnimationFrame | 42: cancelAnimationFrame |

#### web/components/home/LiveCounters.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/inventoryStore.ts (web/components/home/LiveCounters.tsx:11)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1537 | `web/components/home/LiveCounters.tsx:25`<br>LiveCounters | mount 또는 의존성 변화 [] | `[]`<br>호출: isLive, api.statsToday().then((d) => alive && setRemote(d)).catch, api.statsToday().then, api.statsToday, setRemote, pull, setInterval, clearInterval | 31: clearInterval |
| CX-I-1538 | `web/components/home/LiveCounters.tsx:30`<br>useEffect@25 | setInterval 지연 60_000 | `setInterval(pull, 60_000)`<br>호출: setInterval | 31: clearInterval |
| CX-I-1539 | `web/components/home/LiveCounters.tsx:33`<br>useEffect@25 | clearInterval | `clearInterval(id)`<br>호출: clearInterval | 31: clearInterval |
| CX-I-1540 | `web/components/home/LiveCounters.tsx:38`<br>LiveCounters | mount 또는 의존성 변화 [items] | `[items]`<br>호출: (async () => { let ok = 0; for (const o of items) { if ((await hashServerSeed(o.fair.serverSeed)) === o.fair.serverSeedHash) ok++; } if (alive) setVerified({ ok, total: items.length }); }), hashServerSeed, setVerified | 47: |

#### web/components/home/LiveTicker.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/inventoryStore.ts (web/components/home/LiveTicker.tsx:15)`, `web/stores/walletStore.ts (web/components/home/LiveTicker.tsx:16)`, `web/stores/fairStore.ts (web/components/home/LiveTicker.tsx:17)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1541 | `web/components/home/LiveTicker.tsx:34`<br>Thumb | mount 또는 의존성 변화 [src] | `[src]`<br>호출: setFailed | 반환 cleanup 없음 |
| CX-I-1542 | `web/components/home/LiveTicker.tsx:38`<br>Thumb | img.onError | `() => setFailed(true)`<br>호출: setFailed | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1543 | `web/components/home/LiveTicker.tsx:64`<br>LiveTicker | mount 또는 의존성 변화 [] | `[]`<br>호출: setNow, Date.now, setInterval, clearInterval | 67: clearInterval |
| CX-I-1544 | `web/components/home/LiveTicker.tsx:66`<br>useEffect@64 | setInterval 지연 1000 | `setInterval(() => setNow(Date.now()), 1000)`<br>호출: setInterval, setNow, Date.now | 67: clearInterval |
| CX-I-1545 | `web/components/home/LiveTicker.tsx:67`<br>useEffect@64 | clearInterval | `clearInterval(id)`<br>호출: clearInterval | 67: clearInterval |
| CX-I-1546 | `web/components/home/LiveTicker.tsx:70`<br>LiveTicker | mount 또는 의존성 변화 [] | `[]`<br>호출: isLive, api.liveFeed().then((d) => alive && setRemote(d)).catch, api.liveFeed().then, api.liveFeed, setRemote, pull, setInterval, clearInterval | 76: clearInterval |
| CX-I-1547 | `web/components/home/LiveTicker.tsx:75`<br>useEffect@70 | setInterval 지연 30_000 | `setInterval(pull, 30_000)`<br>호출: setInterval | 76: clearInterval |
| CX-I-1548 | `web/components/home/LiveTicker.tsx:78`<br>useEffect@70 | clearInterval | `clearInterval(id)`<br>호출: clearInterval | 76: clearInterval |
| CX-I-1549 | `web/components/home/LiveTicker.tsx:145`<br>LiveTicker | div.onTouchStart | `() => setHeld(true)`<br>호출: setHeld | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1550 | `web/components/home/LiveTicker.tsx:146`<br>LiveTicker | div.onTouchEnd | `() => setHeld(false)`<br>호출: setHeld | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1551 | `web/components/home/LiveTicker.tsx:147`<br>LiveTicker | div.onTouchCancel | `() => setHeld(false)`<br>호출: setHeld | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/home/NetflixHome.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1552 | `web/components/home/NetflixHome.tsx:70`<br>Poster | button.onClick | `() => onPick?.(box)`<br>호출: onPick | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1553 | `web/components/home/NetflixHome.tsx:83`<br>Row | mount 또는 의존성 변화 [] | `[]`<br>호출: setMore, sync, el.addEventListener, window.addEventListener, el.removeEventListener, window.removeEventListener | 89: el.removeEventListener, window.removeEventListener |
| CX-I-1554 | `web/components/home/NetflixHome.tsx:87`<br>useEffect@83 | addEventListener "scroll" | `el.addEventListener("scroll", sync, { passive: true })`<br>호출: el.addEventListener | 89: el.removeEventListener, window.removeEventListener |
| CX-I-1555 | `web/components/home/NetflixHome.tsx:88`<br>useEffect@83 | addEventListener "resize" | `window.addEventListener("resize", sync)`<br>호출: window.addEventListener | 89: el.removeEventListener, window.removeEventListener |
| CX-I-1556 | `web/components/home/NetflixHome.tsx:89`<br>useEffect@83 | removeEventListener "scroll" | `el.removeEventListener("scroll", sync)`<br>호출: el.removeEventListener | 89: el.removeEventListener, window.removeEventListener |
| CX-I-1557 | `web/components/home/NetflixHome.tsx:89`<br>useEffect@83 | removeEventListener "resize" | `window.removeEventListener("resize", sync)`<br>호출: window.removeEventListener | 89: el.removeEventListener, window.removeEventListener |
| CX-I-1558 | `web/components/home/NetflixHome.tsx:96`<br>Row | button.onClick | `() => move(-1)`<br>호출: move, el.scrollBy, window.matchMedia | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1559 | `web/components/home/NetflixHome.tsx:98`<br>Row | button.onClick | `() => move(1)`<br>호출: move, el.scrollBy, window.matchMedia | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1560 | `web/components/home/NetflixHome.tsx:114`<br>NetflixHome | mount 또는 의존성 변화 [] | `[]`<br>호출: root.toggleAttribute, onScroll, window.addEventListener, window.removeEventListener, root.removeAttribute | 119: window.removeEventListener, root.removeAttribute |
| CX-I-1561 | `web/components/home/NetflixHome.tsx:118`<br>useEffect@114 | addEventListener "scroll" | `window.addEventListener("scroll", onScroll, { passive: true })`<br>호출: window.addEventListener | 119: window.removeEventListener, root.removeAttribute |
| CX-I-1562 | `web/components/home/NetflixHome.tsx:119`<br>useEffect@114 | removeEventListener "scroll" | `window.removeEventListener("scroll", onScroll)`<br>호출: window.removeEventListener | 119: window.removeEventListener, root.removeAttribute |
| CX-I-1563 | `web/components/home/NetflixHome.tsx:138`<br>NetflixHome | button.onClick | `clear`<br>호출: clear, setBrowseAll, onCategory, window.scrollTo | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1564 | `web/components/home/NetflixHome.tsx:141`<br>chips.map@139 | button.onClick | `() => pick(key)`<br>호출: pick, setBrowseAll, onCategory, top.current?.scrollIntoView | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1565 | `web/components/home/NetflixHome.tsx:153`<br>NetflixHome | button.onClick | `() => onPick(feature)`<br>호출: onPick | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1566 | `web/components/home/NetflixHome.tsx:154`<br>NetflixHome | button.onClick | `() => pick("all")`<br>호출: pick, setBrowseAll, onCategory, top.current?.scrollIntoView | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1567 | `web/components/home/NetflixHome.tsx:159`<br>popular.map@159 | Poster.onPick | `onPick`<br>호출: onPick | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1568 | `web/components/home/NetflixHome.tsx:160`<br>byCategory(key).map@160 | Poster.onPick | `onPick`<br>호출: onPick | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1569 | `web/components/home/NetflixHome.tsx:170`<br>NetflixHome | select.onChange | `(e) => onSort(e.target.value as SortKey)`<br>호출: onSort | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1570 | `web/components/home/NetflixHome.tsx:172`<br>list.map@172 | Poster.onPick | `onPick`<br>호출: onPick | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1571 | `web/components/home/NetflixHome.tsx:188`<br>NetflixHome | Link.onClick | `() => clear()`<br>호출: clear, setBrowseAll, onCategory, window.scrollTo | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/home/ProofFeed.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/inventoryStore.ts (web/components/home/ProofFeed.tsx:10)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1572 | `web/components/home/ProofFeed.tsx:74`<br>ProofFeed | mount 또는 의존성 변화 [items, verifiedIds] | `[items, verifiedIds]`<br>호출: items.filter, Promise.all(pending.map(async (item) => [item.id, await verifyOpening(item)] as const)).then, Promise.all, pending.map, verifyOpening, setVerifiedIds, Object.fromEntries, hashServerSeed, calculateRollResult, dropTable(box).map, dropTable, determineItem | 81: |

#### web/components/home/QuickTabs.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1573 | `web/components/home/QuickTabs.tsx:15`<br>CATEGORY_FILTERS.map@13 | button.onClick | `(e) => { onChange(key); e.currentTarget.scrollIntoView({ block: "nearest", inline: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }`<br>호출: onChange, e.currentTarget.scrollIntoView, window.matchMedia | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/inventory/CancelShipmentModal.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/inventoryStore.ts (web/components/inventory/CancelShipmentModal.tsx:6)`, `web/stores/walletStore.ts (web/components/inventory/CancelShipmentModal.tsx:7)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1574 | `web/components/inventory/CancelShipmentModal.tsx:18`<br>CancelShipmentModal | mount 또는 의존성 변화 [item?.id] | `[item?.id]`<br>호출: setError, setBusy | 반환 cleanup 없음 |
| CX-I-1575 | `web/components/inventory/CancelShipmentModal.tsx:44`<br>CancelShipmentModal | div.onMouseDown | `e=>e.target===e.currentTarget&&¬busy&&onClose()`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1576 | `web/components/inventory/CancelShipmentModal.tsx:46`<br>CancelShipmentModal | button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1577 | `web/components/inventory/CancelShipmentModal.tsx:52`<br>CancelShipmentModal | button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1578 | `web/components/inventory/CancelShipmentModal.tsx:52`<br>CancelShipmentModal | button.onClick | `()=>void confirm()`<br>호출: confirm, setBusy, setError, isLive, api.cancelShipping, [result.wallet.balance,result.wallet.cryptoBalance,result.wallet.cardBalance].every, Number.isFinite, Math.abs, Error, useInventoryStore.setState, s.items.map, useWalletStore.setState, useInventoryStore.getState().cancelShipping, useInventoryStore.getState, useWalletStore.getState, wallet.creditSplit, wallet.addTransaction, onCancelled | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/inventory/DeliveryModal.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1579 | `web/components/inventory/DeliveryModal.tsx:89`<br>DeliveryModal | mount 또는 의존성 변화 [open] | `[open]`<br>호출: setStage, setSubmitError | 반환 cleanup 없음 |
| CX-I-1580 | `web/components/inventory/DeliveryModal.tsx:127`<br>DeliveryModal | motion.div.onMouseDown | `(e) => e.target === e.currentTarget && close()`<br>호출: close, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1581 | `web/components/inventory/DeliveryModal.tsx:141`<br>DeliveryModal | button.onClick | `close`<br>호출: close, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1582 | `web/components/inventory/DeliveryModal.tsx:182`<br>DeliveryModal | button.onClick | `close`<br>호출: close, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1583 | `web/components/inventory/DeliveryModal.tsx:194`<br>DeliveryModal | input.onChange | `(e) => set("recipient", e.target.value)`<br>호출: set, setForm, setErrors, validateAddress, String | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1584 | `web/components/inventory/DeliveryModal.tsx:201`<br>DeliveryModal | select.onChange | `(e) => set("country", e.target.value as CountryCode)`<br>호출: set, setForm, setErrors, validateAddress, String | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1585 | `web/components/inventory/DeliveryModal.tsx:213`<br>DeliveryModal | input.onChange | `(e) => set("phone", form.country === "KR" ? formatPhoneKR(e.target.value) : e.target.value)`<br>호출: set, formatPhoneKR, setForm, setErrors, validateAddress, String | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1586 | `web/components/inventory/DeliveryModal.tsx:225`<br>DeliveryModal | input.onChange | `(e) => set("postalCode", e.target.value)`<br>호출: set, setForm, setErrors, validateAddress, String | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1587 | `web/components/inventory/DeliveryModal.tsx:229`<br>DeliveryModal | input.onChange | `(e) => set("address", e.target.value)`<br>호출: set, setForm, setErrors, validateAddress, String | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1588 | `web/components/inventory/DeliveryModal.tsx:234`<br>DeliveryModal | input.onChange | `(e) => setDetail(e.target.value)`<br>호출: setDetail | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1589 | `web/components/inventory/DeliveryModal.tsx:249`<br>DeliveryModal | input.onChange | `(e) => set("customsId", e.target.value.toUpperCase())`<br>호출: set, e.target.value.toUpperCase, setForm, setErrors, validateAddress, String | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1590 | `web/components/inventory/DeliveryModal.tsx:271`<br>DeliveryModal | button.onClick | `submit`<br>호출: submit | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/inventory/HotBoxes.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1591 | `web/components/inventory/HotBoxes.tsx:50`<br>top3.map@40 | button.onClick | `() => onInspect(box)`<br>호출: onInspect | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1592 | `web/components/inventory/HotBoxes.tsx:71`<br>top3.map@40 | button.onClick | `() => onOpen(box)`<br>호출: onOpen | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/inventory/InventoryScreen.tsx

상태: 라우트 그래프 도달. store import: `web/stores/authStore.ts (web/components/inventory/InventoryScreen.tsx:22)`, `web/stores/inventoryStore.ts (web/components/inventory/InventoryScreen.tsx:23)`, `web/stores/communityStore.ts (web/components/inventory/InventoryScreen.tsx:31)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1593 | `web/components/inventory/InventoryScreen.tsx:61`<br>InventoryScreen | mount 또는 의존성 변화 [] | `[]`<br>호출: isLive, useInventoryStore.getState().items.filter((o) => o.status === "SHIPPING_REQUESTED").forEach, useInventoryStore.getState().items.filter, useInventoryStore.getState, api.shipping(o.id).then((s) => useInventoryStore.getState().markShipping(o.id, s.carrier, s.trackingNumber)).catch, api.shipping(o.id).then, api.shipping, useInventoryStore.getState().markShipping, tick, setInterval, clearInterv (전체 식은 근거 줄) | 68: clearInterval |
| CX-I-1594 | `web/components/inventory/InventoryScreen.tsx:67`<br>useEffect@61 | setInterval 지연 60000 | `setInterval(tick, 60000)`<br>호출: setInterval | 68: clearInterval |
| CX-I-1595 | `web/components/inventory/InventoryScreen.tsx:68`<br>useEffect@61 | clearInterval | `clearInterval(timer)`<br>호출: clearInterval | 68: clearInterval |
| CX-I-1596 | `web/components/inventory/InventoryScreen.tsx:70`<br>InventoryScreen | mount 또는 의존성 변화 [tab] | `[tab]`<br>호출: setShown | 반환 cleanup 없음 |
| CX-I-1597 | `web/components/inventory/InventoryScreen.tsx:114`<br>InventoryScreen | Button.onClick | `() => openLogin("login")`<br>호출: openLogin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1598 | `web/components/inventory/InventoryScreen.tsx:117`<br>InventoryScreen | Chips.onChange | `setTab`<br>호출: setTab | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1599 | `web/components/inventory/InventoryScreen.tsx:119`<br>InventoryScreen | Button.onClick | `() => setBatch(true)`<br>호출: setBatch | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1600 | `web/components/inventory/InventoryScreen.tsx:128`<br>list.slice(0, shown).map@124 | button.onClick | `() => setOpenId(item.id)`<br>호출: setOpenId | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1601 | `web/components/inventory/InventoryScreen.tsx:138`<br>InventoryScreen | TextLink.onClick | `() => setShown((n) => n + PAGE)`<br>호출: setShown | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1602 | `web/components/inventory/InventoryScreen.tsx:142`<br>InventoryScreen | Sheet.onClose | `closeItem`<br>호출: closeItem, setOpenId, setCancelFailed, setTakeNote | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1603 | `web/components/inventory/InventoryScreen.tsx:158`<br>InventoryScreen | button.onClick | `() => setReviewing(true)`<br>호출: setReviewing | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1604 | `web/components/inventory/InventoryScreen.tsx:168`<br>InventoryScreen | Button.onClick | `() => setTaking(true)`<br>호출: setTaking | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1605 | `web/components/inventory/InventoryScreen.tsx:169`<br>InventoryScreen | Button.onClick | `() => setCancelling(true)`<br>호출: setCancelling | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1606 | `web/components/inventory/InventoryScreen.tsx:172`<br>InventoryScreen | TextLink.onClick | `() => setShipIds([current.id])`<br>호출: setShipIds | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1607 | `web/components/inventory/InventoryScreen.tsx:174`<br>InventoryScreen | TextLink.onClick | `() => verify(current)`<br>호출: verify, setVerifying | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1608 | `web/components/inventory/InventoryScreen.tsx:180`<br>InventoryScreen | ShipSheet.onClose | `() => setShipIds(null)`<br>호출: setShipIds | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1609 | `web/components/inventory/InventoryScreen.tsx:180`<br>InventoryScreen | ShipSheet.onDone | `() => { setShipIds(null); closeItem(); setTab("shipping"); }`<br>호출: setShipIds, closeItem, setTab, setOpenId, setCancelFailed, setTakeNote | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1610 | `web/components/inventory/InventoryScreen.tsx:181`<br>InventoryScreen | VerifySheet.onClose | `() => setVerifying(null)`<br>호출: setVerifying | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1611 | `web/components/inventory/InventoryScreen.tsx:182`<br>InventoryScreen | ReviewSheet.onClose | `() => setReviewing(false)`<br>호출: setReviewing | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1612 | `web/components/inventory/InventoryScreen.tsx:182`<br>InventoryScreen | ReviewSheet.onDone | `() => setReviewing(false)`<br>호출: setReviewing | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1613 | `web/components/inventory/InventoryScreen.tsx:184`<br>InventoryScreen | TakeSheet.onClose | `() => setBatch(false)`<br>호출: setBatch | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1614 | `web/components/inventory/InventoryScreen.tsx:186`<br>InventoryScreen | TakeConfirm.onCancel | `() => setTaking(false)`<br>호출: setTaking | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1615 | `web/components/inventory/InventoryScreen.tsx:186`<br>InventoryScreen | TakeConfirm.onConfirm | `() => void take()`<br>호출: take, setBusy, setTakeNote, settleTake, setTaking, closeItem, setTab | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1616 | `web/components/inventory/InventoryScreen.tsx:187`<br>InventoryScreen | Confirm.onCancel | `() => setCancelling(false)`<br>호출: setCancelling | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1617 | `web/components/inventory/InventoryScreen.tsx:187`<br>InventoryScreen | Confirm.onConfirm | `cancel`<br>호출: cancel, setBusy, setCancelFailed, cancelShipment, setCancelling, closeItem, setTab | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/inventory/SellConfirmModal.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1618 | `web/components/inventory/SellConfirmModal.tsx:32`<br>SellConfirmModal | motion.div.onMouseDown | `(e) => e.target === e.currentTarget && onClose()`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1619 | `web/components/inventory/SellConfirmModal.tsx:54`<br>SellConfirmModal | button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1620 | `web/components/inventory/SellConfirmModal.tsx:57`<br>SellConfirmModal | button.onClick | `onConfirm`<br>호출: onConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/inventory/TrackingModal.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1621 | `web/components/inventory/TrackingModal.tsx:53`<br>TrackingModal | motion.div.onMouseDown | `(e) => e.target === e.currentTarget && onClose()`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1622 | `web/components/inventory/TrackingModal.tsx:66`<br>TrackingModal | button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1623 | `web/components/inventory/TrackingModal.tsx:88`<br>TrackingModal | button.onClick | `() => navigator.clipboard?.writeText(tracking)`<br>호출: navigator.clipboard?.writeText | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/layout/CurrencyHydrator.tsx

상태: 라우트 그래프 도달. store import: `web/stores/currencyStore.ts (web/components/layout/CurrencyHydrator.tsx:4)`, `web/stores/walletStore.ts (web/components/layout/CurrencyHydrator.tsx:5)`, `web/stores/fairStore.ts (web/components/layout/CurrencyHydrator.tsx:6)`, `web/stores/settingsStore.ts (web/components/layout/CurrencyHydrator.tsx:7)`, `web/stores/inventoryStore.ts (web/components/layout/CurrencyHydrator.tsx:8)`, `web/stores/dailyStore.ts (web/components/layout/CurrencyHydrator.tsx:9)`, `web/stores/communityStore.ts (web/components/layout/CurrencyHydrator.tsx:10)`, `web/stores/telemetryStore.ts (web/components/layout/CurrencyHydrator.tsx:11)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1624 | `web/components/layout/CurrencyHydrator.tsx:15`<br>CurrencyHydrator | mount 또는 의존성 변화 [] | `[]`<br>호출: rehydrateCurrency, useWalletStore.persist.rehydrate, useSettingsStore.persist.rehydrate, useInventoryStore.persist.rehydrate, useDailyStore.persist.rehydrate, useCommunityStore.persist.rehydrate, useTelemetryStore.persist.rehydrate, Promise.resolve(useFairStore.persist.rehydrate()).then, Promise.resolve, useFairStore.persist.rehydrate, useFairStore.getState().ensureSeeds, useFairStore.getState | 반환 cleanup 없음 |

#### web/components/layout/CurrencySelector.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/currencyStore.ts (web/components/layout/CurrencySelector.tsx:6)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1625 | `web/components/layout/CurrencySelector.tsx:10`<br>CurrencySelector | select.onChange | `(event) => setCurrency(event.target.value as Currency)`<br>호출: setCurrency | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/layout/LabBadge.tsx

상태: 라우트 그래프 도달. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1626 | `web/components/layout/LabBadge.tsx:20`<br>LabBadge | mount 또는 의존성 변화 [] | `[]`<br>호출: setStorageFull, window.addEventListener, window.removeEventListener | 25: window.removeEventListener |
| CX-I-1627 | `web/components/layout/LabBadge.tsx:24`<br>useEffect@20 | addEventListener "voila:storage-full" | `window.addEventListener("voila:storage-full", onFull)`<br>호출: window.addEventListener | 25: window.removeEventListener |
| CX-I-1628 | `web/components/layout/LabBadge.tsx:25`<br>useEffect@20 | removeEventListener "voila:storage-full" | `window.removeEventListener("voila:storage-full", onFull)`<br>호출: window.removeEventListener | 25: window.removeEventListener |

#### web/components/layout/LanguageSelector.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1629 | `web/components/layout/LanguageSelector.tsx:17`<br>LanguageSelector | select.onChange | `(event) => choose(event.target.value as Locale)`<br>호출: choose, localStorage.setItem, router.replace | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/layout/LocaleHtmlLang.tsx

상태: 라우트 그래프 도달. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1630 | `web/components/layout/LocaleHtmlLang.tsx:8`<br>LocaleHtmlLang | mount 또는 의존성 변화 [locale] | `[locale]`<br>호출: 없음 | 반환 cleanup 없음 |

#### web/components/layout/SiteHeader.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/authStore.ts (web/components/layout/SiteHeader.tsx:11)`, `web/stores/walletStore.ts (web/components/layout/SiteHeader.tsx:12)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1631 | `web/components/layout/SiteHeader.tsx:31`<br>SiteHeader | mount 또는 의존성 변화 [pathname] | `[pathname]`<br>호출: setOpen | 반환 cleanup 없음 |
| CX-I-1632 | `web/components/layout/SiteHeader.tsx:32`<br>SiteHeader | mount 또는 의존성 변화 [authOpen, open] | `[authOpen, open]`<br>호출: setOpen, requestAnimationFrame, toggleRef.current?.focus, cancelAnimationFrame | 37: cancelAnimationFrame |
| CX-I-1633 | `web/components/layout/SiteHeader.tsx:36`<br>useEffect@32 | requestAnimationFrame | `requestAnimationFrame(() => toggleRef.current?.focus({ preventScroll: true }))`<br>호출: requestAnimationFrame, toggleRef.current?.focus | 37: cancelAnimationFrame |
| CX-I-1634 | `web/components/layout/SiteHeader.tsx:37`<br>useEffect@32 | cancelAnimationFrame | `cancelAnimationFrame(frame)`<br>호출: cancelAnimationFrame | 37: cancelAnimationFrame |
| CX-I-1635 | `web/components/layout/SiteHeader.tsx:40`<br>SiteHeader | mount 또는 의존성 변화 [open] | `[open]`<br>호출: setOpen, window.addEventListener, window.removeEventListener | 44: window.removeEventListener |
| CX-I-1636 | `web/components/layout/SiteHeader.tsx:43`<br>useEffect@40 | addEventListener "resize" | `window.addEventListener("resize", handleResize)`<br>호출: window.addEventListener | 44: window.removeEventListener |
| CX-I-1637 | `web/components/layout/SiteHeader.tsx:44`<br>useEffect@40 | removeEventListener "resize" | `window.removeEventListener("resize", handleResize)`<br>호출: window.removeEventListener | 44: window.removeEventListener |
| CX-I-1638 | `web/components/layout/SiteHeader.tsx:47`<br>links.map@47 | Link.onClick | `() => setOpen(false)`<br>호출: setOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1639 | `web/components/layout/SiteHeader.tsx:52`<br>SiteHeader | button.onClick | `() => wallet("usdt")`<br>호출: wallet, setOpen, onWallet, router.push | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1640 | `web/components/layout/SiteHeader.tsx:53`<br>SiteHeader | button.onClick | `onDaily`<br>호출: onDaily | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1641 | `web/components/layout/SiteHeader.tsx:54`<br>SiteHeader | button.onClick | `() => setOpen(¬open)`<br>호출: setOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1642 | `web/components/layout/SiteHeader.tsx:58`<br>SiteHeader | Link.onClick | `() => setOpen(false)`<br>호출: setOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1643 | `web/components/layout/SiteHeader.tsx:59`<br>SiteHeader | button.onClick | `() => wallet("usdt")`<br>호출: wallet, setOpen, onWallet, router.push | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1644 | `web/components/layout/SiteHeader.tsx:59`<br>SiteHeader | button.onClick | `() => wallet("withdraw")`<br>호출: wallet, setOpen, onWallet, router.push | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1645 | `web/components/layout/SiteHeader.tsx:60`<br>SiteHeader | button.onClick | `() => { setOpen(false); onDaily(); }`<br>호출: setOpen, onDaily | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/legal/LegalNav.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1646 | `web/components/legal/LegalNav.tsx:12`<br>LegalNav | mount 또는 의존성 변화 [current] | `[current]`<br>호출: nav?.querySelector, nav.scrollTo, Math.max | 반환 cleanup 없음 |

#### web/components/shell/AppFooter.tsx

상태: 라우트 그래프 도달. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1647 | `web/components/shell/AppFooter.tsx:62`<br>AppFooter | button.onClick | `() => setCurrency(currency === "KRW" ? "USD" : "KRW")`<br>호출: setCurrency | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/shell/AppShell.tsx

상태: 라우트 그래프 도달. store import: `web/stores/authStore.ts (web/components/shell/AppShell.tsx:12)`, `web/stores/walletStore.ts (web/components/shell/AppShell.tsx:13)`, `web/stores/flowStore.ts (web/components/shell/AppShell.tsx:14)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1648 | `web/components/shell/AppShell.tsx:52`<br>AppShell | button.onClick | `openBalance`<br>호출: openBalance | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1649 | `web/components/shell/AppShell.tsx:53`<br>AppShell | button.onClick | `() => openLogin("login")`<br>호출: openLogin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1650 | `web/components/shell/AppShell.tsx:54`<br>AppShell | button.onClick | `openMenu`<br>호출: openMenu | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1651 | `web/components/shell/AppShell.tsx:60`<br>AppShell | Sheet.onClose | `closeMenu`<br>호출: closeMenu | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1652 | `web/components/shell/AppShell.tsx:62`<br>NAV.map@62 | Link.onClick | `closeMenu`<br>호출: closeMenu | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/shell/StateScreens.tsx

상태: 라우트 그래프 도달. store import: `web/stores/authStore.ts (web/components/shell/StateScreens.tsx:7)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1653 | `web/components/shell/StateScreens.tsx:29`<br>ErrorScreen | Button.onClick | `reset`<br>호출: reset | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1654 | `web/components/shell/StateScreens.tsx:42`<br>SessionLine | button.onClick | `() => openLogin("login")`<br>호출: openLogin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1655 | `web/components/shell/StateScreens.tsx:48`<br>OfflineLine | mount 또는 의존성 변화 [] | `[]`<br>호출: setOffline, sync, window.addEventListener, window.removeEventListener | 53: window.removeEventListener |
| CX-I-1656 | `web/components/shell/StateScreens.tsx:51`<br>useEffect@48 | addEventListener "online" | `window.addEventListener("online", sync)`<br>호출: window.addEventListener | 53: window.removeEventListener |
| CX-I-1657 | `web/components/shell/StateScreens.tsx:52`<br>useEffect@48 | addEventListener "offline" | `window.addEventListener("offline", sync)`<br>호출: window.addEventListener | 53: window.removeEventListener |
| CX-I-1658 | `web/components/shell/StateScreens.tsx:53`<br>useEffect@48 | removeEventListener "online" | `window.removeEventListener("online", sync)`<br>호출: window.removeEventListener | 53: window.removeEventListener |
| CX-I-1659 | `web/components/shell/StateScreens.tsx:53`<br>useEffect@48 | removeEventListener "offline" | `window.removeEventListener("offline", sync)`<br>호출: window.removeEventListener | 53: window.removeEventListener |

#### web/components/ui/kit.tsx

상태: 라우트 그래프 도달. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1660 | `web/components/ui/kit.tsx:30`<br>TextLink | Link.onClick | `onClick`<br>호출: onClick | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1661 | `web/components/ui/kit.tsx:31`<br>TextLink | button.onClick | `onClick`<br>호출: onClick | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1662 | `web/components/ui/kit.tsx:39`<br>options.map@38 | button.onClick | `() => onChange(o.value)`<br>호출: onChange | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1663 | `web/components/ui/kit.tsx:51`<br>ScreenHead | button.onClick | `back`<br>호출: back | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/ui/ScrollRow.tsx

상태: 라우트 그래프 도달. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1664 | `web/components/ui/ScrollRow.tsx:20`<br>ScrollRow | mount 또는 의존성 변화 [] | `[]`<br>호출: el.addEventListener, ResizeObserver, watch?.observe, el.removeEventListener, watch?.disconnect | 25: el.removeEventListener, watch?.disconnect |
| CX-I-1665 | `web/components/ui/ScrollRow.tsx:22`<br>useEffect@20 | addEventListener "scroll" | `el.addEventListener("scroll", update, { passive: true })`<br>호출: el.addEventListener | 25: el.removeEventListener, watch?.disconnect |
| CX-I-1666 | `web/components/ui/ScrollRow.tsx:23`<br>useEffect@20 | ResizeObserver | `new ResizeObserver(update)`<br>호출: ResizeObserver | 25: el.removeEventListener, watch?.disconnect |
| CX-I-1667 | `web/components/ui/ScrollRow.tsx:24`<br>useEffect@20 | observe | `watch?.observe(el)`<br>호출: watch?.observe | 25: el.removeEventListener, watch?.disconnect |
| CX-I-1668 | `web/components/ui/ScrollRow.tsx:25`<br>useEffect@20 | removeEventListener "scroll" | `el.removeEventListener("scroll", update)`<br>호출: el.removeEventListener | 25: el.removeEventListener, watch?.disconnect |
| CX-I-1669 | `web/components/ui/ScrollRow.tsx:25`<br>useEffect@20 | disconnect | `watch?.disconnect()`<br>호출: watch?.disconnect | 25: el.removeEventListener, watch?.disconnect |
| CX-I-1670 | `web/components/ui/ScrollRow.tsx:28`<br>ScrollRow | mount 또는 의존성 변화 매 렌더 | `의존성 없음`<br>호출: update, setMore | 반환 cleanup 없음 |
| CX-I-1671 | `web/components/ui/ScrollRow.tsx:33`<br>ScrollRow | button.onClick | `() => move(-1)`<br>호출: move, el.scrollBy, Math.max | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1672 | `web/components/ui/ScrollRow.tsx:34`<br>ScrollRow | button.onClick | `() => move(1)`<br>호출: move, el.scrollBy, Math.max | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/ui/Sheet.tsx

상태: 라우트 그래프 도달. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1673 | `web/components/ui/Sheet.tsx:17`<br>Sheet | div.onMouseDown | `(e) => { if (e.target === e.currentTarget && ¬locked) onClose(); }`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1674 | `web/components/ui/Sheet.tsx:19`<br>Sheet | button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1675 | `web/components/ui/Sheet.tsx:37`<br>Confirm | div.onMouseDown | `(e) => { if (e.target === e.currentTarget && ¬busy) onCancel(); }`<br>호출: onCancel | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1676 | `web/components/ui/Sheet.tsx:44`<br>Confirm | Button.onClick | `onConfirm`<br>호출: onConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1677 | `web/components/ui/Sheet.tsx:45`<br>Confirm | TextLink.onClick | `() => { if (¬busy) onCancel(); }`<br>호출: onCancel | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/ui/toast.tsx

상태: 라우트 그래프 도달. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1678 | `web/components/ui/toast.tsx:19`<br>ToastHost | mount 또는 의존성 변화 [text, id, clear] | `[text, id, clear]`<br>호출: window.setTimeout, window.clearTimeout | 22: window.clearTimeout |
| CX-I-1679 | `web/components/ui/toast.tsx:21`<br>useEffect@19 | setTimeout 지연 2400 | `window.setTimeout(clear, 2400)`<br>호출: window.setTimeout | 22: window.clearTimeout |
| CX-I-1680 | `web/components/ui/toast.tsx:22`<br>useEffect@19 | clearTimeout | `window.clearTimeout(timer)`<br>호출: window.clearTimeout | 22: window.clearTimeout |

#### web/components/unboxing/AutoplaySettingsModal.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1681 | `web/components/unboxing/AutoplaySettingsModal.tsx:33`<br>AutoplaySettingsModal | mount 또는 의존성 변화 [box, initial] | `[box, initial]`<br>호출: setCfg, setUseMultiple, setUseStopLoss | 반환 cleanup 없음 |
| CX-I-1682 | `web/components/unboxing/AutoplaySettingsModal.tsx:54`<br>Check | input.onChange | `onToggle`<br>호출: onToggle | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1683 | `web/components/unboxing/AutoplaySettingsModal.tsx:68`<br>AutoplaySettingsModal | motion.div.onMouseDown | `(e) => e.target === e.currentTarget && onClose()`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1684 | `web/components/unboxing/AutoplaySettingsModal.tsx:90`<br>AutoplaySettingsModal | button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1685 | `web/components/unboxing/AutoplaySettingsModal.tsx:105`<br>AUTOPLAY_SPINS.map@99 | button.onClick | `() => setCfg((c) => ({ ...c, spins: n }))`<br>호출: setCfg | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1686 | `web/components/unboxing/AutoplaySettingsModal.tsx:122`<br>AutoplaySettingsModal | Check.onToggle | `() => setCfg((c) => ({ ...c, autoSell: ¬c.autoSell }))`<br>호출: setCfg | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1687 | `web/components/unboxing/AutoplaySettingsModal.tsx:131`<br>AutoplaySettingsModal | Check.onToggle | `() => setCfg((c) => ({ ...c, stopOnJackpot: ¬c.stopOnJackpot }))`<br>호출: setCfg | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1688 | `web/components/unboxing/AutoplaySettingsModal.tsx:132`<br>AutoplaySettingsModal | Check.onToggle | `() => setUseMultiple((v) => ¬v)`<br>호출: setUseMultiple | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1689 | `web/components/unboxing/AutoplaySettingsModal.tsx:136`<br>AutoplaySettingsModal | input.onChange | `(e) => setMultiple(e.target.value)`<br>호출: setMultiple | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1690 | `web/components/unboxing/AutoplaySettingsModal.tsx:137`<br>AutoplaySettingsModal | input.onClick | `(e) => e.preventDefault()`<br>호출: e.preventDefault | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1691 | `web/components/unboxing/AutoplaySettingsModal.tsx:145`<br>AutoplaySettingsModal | Check.onToggle | `() => setUseStopLoss((v) => ¬v)`<br>호출: setUseStopLoss | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1692 | `web/components/unboxing/AutoplaySettingsModal.tsx:149`<br>AutoplaySettingsModal | input.onChange | `(e) => setStopLoss(e.target.value)`<br>호출: setStopLoss | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1693 | `web/components/unboxing/AutoplaySettingsModal.tsx:150`<br>AutoplaySettingsModal | input.onClick | `(e) => e.preventDefault()`<br>호출: e.preventDefault | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1694 | `web/components/unboxing/AutoplaySettingsModal.tsx:163`<br>AutoplaySettingsModal | button.onClick | `start`<br>호출: start, Number, onStart, Number.isFinite | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/unboxing/BulkOpenModal.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/inventoryStore.ts (web/components/unboxing/BulkOpenModal.tsx:14)`, `web/stores/walletStore.ts (web/components/unboxing/BulkOpenModal.tsx:15)`, `web/stores/settingsStore.ts (web/components/unboxing/BulkOpenModal.tsx:16)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1695 | `web/components/unboxing/BulkOpenModal.tsx:51`<br>CountUp | mount 또는 의존성 변화 [value, reducedMotion] | `[value, reducedMotion]`<br>호출: setV, animate, c.stop | 54: c.stop |
| CX-I-1696 | `web/components/unboxing/BulkOpenModal.tsx:53`<br>useEffect@51 | animate | `animate(0, value, { duration: 1.2, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(x) })`<br>호출: animate, setV | 54: c.stop |
| CX-I-1697 | `web/components/unboxing/BulkOpenModal.tsx:54`<br>useEffect@51 | stop | `c.stop()`<br>호출: c.stop | 54: c.stop |
| CX-I-1698 | `web/components/unboxing/BulkOpenModal.tsx:86`<br>BulkOpenModal | mount 또는 의존성 변화 [box, count, prepared, reducedMotion] | `[box, count, prepared, reducedMotion]`<br>호출: (async () => { if (¬useSettingsStore.getState().muted) playBulkOpen(); const t0 = performance.now(); const out: BulkResult[] = prepared ?? []; const elapsed = performance.now() - t0; const remain = Math.max(0, BULK_OPEN_MS - elapsed); const start = performance.now(); await new Promise<void>((resolve) => { const tick = () => { if (¬alive) return resolve(); const p = skip.current &#124;&#124; reduce (전체 식은 근거 줄) | 118: |
| CX-I-1699 | `web/components/unboxing/BulkOpenModal.tsx:103`<br>tick | requestAnimationFrame | `requestAnimationFrame(tick)`<br>호출: requestAnimationFrame | 118: |
| CX-I-1700 | `web/components/unboxing/BulkOpenModal.tsx:114`<br>useEffect@86 | setTimeout 지연 3200 | `setTimeout(() => setMega(null), 3200)`<br>호출: setTimeout, setMega | 118: |
| CX-I-1701 | `web/components/unboxing/BulkOpenModal.tsx:124`<br>BulkOpenModal | mount 또는 의존성 변화 [box] | `[box]`<br>호출: setPhase, setProgress, setResults, setSold, setMega | 반환 cleanup 없음 |
| CX-I-1702 | `web/components/unboxing/BulkOpenModal.tsx:158`<br>BulkOpenModal | button.onClick | `closePresentation`<br>호출: closePresentation, onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1703 | `web/components/unboxing/BulkOpenModal.tsx:171`<br>BulkOpenModal | button.onClick | `() => { skip.current = true; }`<br>호출: 없음 | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1704 | `web/components/unboxing/BulkOpenModal.tsx:239`<br>BulkOpenModal | button.onClick | `() => onRetry?.(box, count)`<br>호출: onRetry | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1705 | `web/components/unboxing/BulkOpenModal.tsx:252`<br>BulkOpenModal | button.onClick | `() => { setSold(true); const ids = pending.map((r) => r.ownedId); const { totalUsdt, toCrypto, toCard } = sellOwned(ids, REFUND_RATE); onSellBack(ids, totalUsdt, { toCrypto, toCard }); }`<br>호출: setSold, pending.map, sellOwned, onSellBack | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/unboxing/UnboxingRoulette.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/fairStore.ts (web/components/unboxing/UnboxingRoulette.tsx:16)`, `web/stores/settingsStore.ts (web/components/unboxing/UnboxingRoulette.tsx:17)`, `web/stores/inventoryStore.ts (web/components/unboxing/UnboxingRoulette.tsx:25)`, `web/stores/telemetryStore.ts (web/components/unboxing/UnboxingRoulette.tsx:26)`, `web/stores/walletStore.ts (web/components/unboxing/UnboxingRoulette.tsx:28)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1706 | `web/components/unboxing/UnboxingRoulette.tsx:157`<br>waitPresentation | setTimeout 지연 ms | `setTimeout(() => { wakePresentation.current = null; resolve(); }, ms)`<br>호출: setTimeout, resolve | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1707 | `web/components/unboxing/UnboxingRoulette.tsx:158`<br>waitPresentation | clearTimeout | `clearTimeout(timer)`<br>호출: clearTimeout | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1708 | `web/components/unboxing/UnboxingRoulette.tsx:171`<br>UnboxingRoulette | mount 또는 의존성 변화 [box] | `[box]`<br>호출: sync, ResizeObserver, ro.observe, ro.disconnect | 180: ro.disconnect |
| CX-I-1709 | `web/components/unboxing/UnboxingRoulette.tsx:178`<br>useLayoutEffect@171 | ResizeObserver | `new ResizeObserver(sync)`<br>호출: ResizeObserver | 180: ro.disconnect |
| CX-I-1710 | `web/components/unboxing/UnboxingRoulette.tsx:179`<br>useLayoutEffect@171 | observe | `ro.observe(el)`<br>호출: ro.observe | 180: ro.disconnect |
| CX-I-1711 | `web/components/unboxing/UnboxingRoulette.tsx:180`<br>useLayoutEffect@171 | disconnect | `ro.disconnect()`<br>호출: ro.disconnect | 180: ro.disconnect |
| CX-I-1712 | `web/components/unboxing/UnboxingRoulette.tsx:195`<br>loop | requestAnimationFrame | `requestAnimationFrame(loop)`<br>호출: requestAnimationFrame | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1713 | `web/components/unboxing/UnboxingRoulette.tsx:197`<br>useCallback@184 | requestAnimationFrame | `requestAnimationFrame(loop)`<br>호출: requestAnimationFrame | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1714 | `web/components/unboxing/UnboxingRoulette.tsx:202`<br>stopTicks | cancelAnimationFrame | `cancelAnimationFrame(rafRef.current)`<br>호출: cancelAnimationFrame | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1715 | `web/components/unboxing/UnboxingRoulette.tsx:235`<br>useCallback@206 | requestAnimationFrame | `requestAnimationFrame(() => r(null))`<br>호출: requestAnimationFrame, r | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1716 | `web/components/unboxing/UnboxingRoulette.tsx:252`<br>useCallback@206 | animate | `animate(x, target, { duration: reducedMotion ? 0.01 : duration, ease: REEL_EASE, onUpdate: (v) => { if (reducedMotion) return; const now = performance.now(); const dt = Math.max(1, now - lastT); const vel = (Math.abs(v - lastV) / dt) * 1000; // px/s (60타일/초 ≈ 9,500px/s) lastV = v; lastT = now; blurMv.set(Math.min(14, Math.max(0, (vel - 1200) / 550))); const progress = target === 0 ? 1 : v / target (전체 식은 근거 줄)`<br>호출: animate, performance.now, Math.max, Math.abs, blurMv.set, Math.min, Math.floor, isHigh, setTension, tierOf | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1717 | `web/components/unboxing/UnboxingRoulette.tsx:290`<br>useCallback@206 | animate | `animate(x, [target, target + dir * 1.5, target - dir * 1, target + dir * 1.2, target], { duration: SHAKE_MS / 1000, ease: "easeInOut" })`<br>호출: animate | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1718 | `web/components/unboxing/UnboxingRoulette.tsx:301`<br>useCallback@206 | setTimeout 지연 3200 | `setTimeout(() => setMega(null), 3200)`<br>호출: setTimeout, setMega | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1719 | `web/components/unboxing/UnboxingRoulette.tsx:304`<br>useCallback@206 | setTimeout 지연 600 | `setTimeout(() => setFlash(null), 600)`<br>호출: setTimeout, setFlash | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1720 | `web/components/unboxing/UnboxingRoulette.tsx:311`<br>UnboxingRoulette | mount 또는 의존성 변화 [box] | `[box]`<br>호출: setSkipRequested, (async () => { // 뷰포트 폭이 측정될 때까지 한두 프레임 기다린다 for (let i = 0; i < 20 && viewportW.current === 0; i++) await new Promise((r) => requestAnimationFrame(() => r(null))); if (cancelled.current) return; if (¬reducedMotion && ¬demo && ¬auto) { // 3단계 문지기 컷인, 휠 잠금 해제 → 틈새 아우라 → 암전, 심장 박동 setPhase("gate"); await waitPresentation(GATE_TOTAL_MS); if (cancelled.current) return; } const out: U (전체 식은 근거 줄) | 381: stopTicks, x.stop |
| CX-I-1721 | `web/components/unboxing/UnboxingRoulette.tsx:319`<br>useEffect@311 | requestAnimationFrame | `requestAnimationFrame(() => r(null))`<br>호출: requestAnimationFrame, r | 381: stopTicks, x.stop |
| CX-I-1722 | `web/components/unboxing/UnboxingRoulette.tsx:384`<br>useEffect@311 | stop | `x.stop()`<br>호출: x.stop | 381: stopTicks, x.stop |
| CX-I-1723 | `web/components/unboxing/UnboxingRoulette.tsx:390`<br>UnboxingRoulette | mount 또는 의존성 변화 [box] | `[box]`<br>호출: setPhase, setOpenError, setSkipRequested, setStrip, setResults, setCurrent, setSold, setShipped, setShipOpen, setShake, setDisguise, setUpgradeFx | 반환 cleanup 없음 |
| CX-I-1724 | `web/components/unboxing/UnboxingRoulette.tsx:447`<br>UnboxingRoulette | button.onClick | `toggleMuted`<br>호출: toggleMuted | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1725 | `web/components/unboxing/UnboxingRoulette.tsx:450`<br>UnboxingRoulette | button.onClick | `closePresentation`<br>호출: closePresentation, onClose, skipPresentation | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1726 | `web/components/unboxing/UnboxingRoulette.tsx:459`<br>UnboxingRoulette | button.onClick | `skipPresentation`<br>호출: skipPresentation, setSkipRequested, wakePresentation.current, activeAnimation.current?.complete | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1727 | `web/components/unboxing/UnboxingRoulette.tsx:464`<br>UnboxingRoulette | button.onClick | `onDeposit`<br>호출: onDeposit | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1728 | `web/components/unboxing/UnboxingRoulette.tsx:465`<br>UnboxingRoulette | button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1729 | `web/components/unboxing/UnboxingRoulette.tsx:536`<br>UnboxingRoulette | button.onClick | `() => { skipPresentation(); }`<br>호출: skipPresentation, setSkipRequested, wakePresentation.current, activeAnimation.current?.complete | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1730 | `web/components/unboxing/UnboxingRoulette.tsx:581`<br>UnboxingRoulette | button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1731 | `web/components/unboxing/UnboxingRoulette.tsx:586`<br>UnboxingRoulette | button.onClick | `onDeposit`<br>호출: onDeposit | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1732 | `web/components/unboxing/UnboxingRoulette.tsx:628`<br>results.map@616 | button.onClick | `() => r.ownedId && setVerifyId(r.ownedId)`<br>호출: setVerifyId | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1733 | `web/components/unboxing/UnboxingRoulette.tsx:653`<br>UnboxingRoulette | button.onClick | `() => onDemoConvert?.(box)`<br>호출: onDemoConvert | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1734 | `web/components/unboxing/UnboxingRoulette.tsx:658`<br>UnboxingRoulette | button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1735 | `web/components/unboxing/UnboxingRoulette.tsx:673`<br>UnboxingRoulette | button.onClick | `() => onRespin?.(box, count)`<br>호출: onRespin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1736 | `web/components/unboxing/UnboxingRoulette.tsx:686`<br>UnboxingRoulette | button.onClick | `() => { setSold(true); const ids = pending.map((r) => r.ownedId).filter((x): x is string => ¬¬x); const { totalUsdt, toCrypto, toCard } = sellOwned(ids, REFUND_RATE); onSellBack(pending, totalUsdt, { toCrypto, toCard }); }`<br>호출: setSold, pending.map((r) => r.ownedId).filter, pending.map, sellOwned, onSellBack | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1737 | `web/components/unboxing/UnboxingRoulette.tsx:711`<br>UnboxingRoulette | button.onClick | `() => setShipOpen(true)`<br>호출: setShipOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1738 | `web/components/unboxing/UnboxingRoulette.tsx:715`<br>UnboxingRoulette | button.onClick | `() => last?.ownedId && setVerifyId(last.ownedId)`<br>호출: setVerifyId | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1739 | `web/components/unboxing/UnboxingRoulette.tsx:750`<br>UnboxingRoulette | DeliveryModal.onClose | `() => setShipOpen(false)`<br>호출: setShipOpen | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1740 | `web/components/unboxing/UnboxingRoulette.tsx:751`<br>UnboxingRoulette | DeliveryModal.onSubmit | `(address: ShippingAddress, fee: number) => { const split = fee > 0 ? useWalletStore.getState().debitSplit(fee) : null; if (fee > 0 && ¬split) return; const ids = results.map((r) => r.ownedId).filter((x): x is string => ¬¬x); requestShipping(ids, address, fee, split?.ratio); setShipped(true); setShipOpen(false); onShip(results); }`<br>호출: useWalletStore.getState().debitSplit, useWalletStore.getState, results.map((r) => r.ownedId).filter, results.map, requestShipping, setShipped, setShipOpen, onShip | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1741 | `web/components/unboxing/UnboxingRoulette.tsx:761`<br>UnboxingRoulette | VisualVerifyModal.onClose | `() => setVerifyId(null)`<br>호출: setVerifyId | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/unboxing/VaultGateFX.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/settingsStore.ts (web/components/unboxing/VaultGateFX.tsx:7)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1742 | `web/components/unboxing/VaultGateFX.tsx:24`<br>VaultGateFX | mount 또는 의존성 변화 [] | `[]`<br>호출: useSettingsStore.getState, [0, 180, 360, 560, 760].map, setTimeout, muted, playGearClick, setStage, playHeartbeat, clicks.forEach, clearTimeout | 32: clicks.forEach, clearTimeout |
| CX-I-1743 | `web/components/unboxing/VaultGateFX.tsx:26`<br>[0, 180, 360, 560, 760].map@26 | setTimeout 지연 d | `setTimeout(() => ¬muted() && playGearClick(), d)`<br>호출: setTimeout, muted, playGearClick, useSettingsStore.getState | 32: clicks.forEach, clearTimeout |
| CX-I-1744 | `web/components/unboxing/VaultGateFX.tsx:27`<br>useEffect@24 | setTimeout 지연 GATE_STAGE_MS[0] | `setTimeout(() => setStage(1), GATE_STAGE_MS[0])`<br>호출: setTimeout, setStage | 32: clicks.forEach, clearTimeout |
| CX-I-1745 | `web/components/unboxing/VaultGateFX.tsx:28`<br>useEffect@24 | setTimeout 지연 GATE_STAGE_MS[0] + GATE_STAGE_MS[1] | `setTimeout(() => { setStage(2); if (¬muted()) playHeartbeat(); }, GATE_STAGE_MS[0] + GATE_STAGE_MS[1])`<br>호출: setTimeout, setStage, muted, playHeartbeat, useSettingsStore.getState | 32: clicks.forEach, clearTimeout |
| CX-I-1746 | `web/components/unboxing/VaultGateFX.tsx:34`<br>useEffect@24 | clearTimeout | `clearTimeout(s1)`<br>호출: clearTimeout | 32: clicks.forEach, clearTimeout |
| CX-I-1747 | `web/components/unboxing/VaultGateFX.tsx:35`<br>useEffect@24 | clearTimeout | `clearTimeout(s2)`<br>호출: clearTimeout | 32: clicks.forEach, clearTimeout |

#### web/components/verify/ChainRecord.tsx

상태: 라우트 그래프 도달. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1748 | `web/components/verify/ChainRecord.tsx:29`<br>ChainRecordView | button.onClick | `onRetry`<br>호출: onRetry | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/verify/VerifyScreen.tsx

상태: 라우트 그래프 도달. store import: `web/stores/authStore.ts (web/components/verify/VerifyScreen.tsx:15)`, `web/stores/inventoryStore.ts (web/components/verify/VerifyScreen.tsx:16)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1749 | `web/components/verify/VerifyScreen.tsx:45`<br>VerifyScreen | mount 또는 의존성 변화 [params] | `[params]`<br>호출: params?.get, setServerSeed, setLockedHash, setClientSeed, setNonce, BOXES.some, setBoxSlug, document.getElementById("verify-manual")?.scrollIntoView, document.getElementById | 반환 cleanup 없음 |
| CX-I-1750 | `web/components/verify/VerifyScreen.tsx:77`<br>VerifyScreen | Button.onClick | `() => openLogin("login")`<br>호출: openLogin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1751 | `web/components/verify/VerifyScreen.tsx:84`<br>records.slice(0, shown).map@82 | button.onClick | `() => setVerifying({ ownedId: o.id, itemId: o.itemId, fair: o.fair })`<br>호출: setVerifying | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1752 | `web/components/verify/VerifyScreen.tsx:91`<br>VerifyScreen | TextLink.onClick | `() => setShown((n) => n + PAGE)`<br>호출: setShown | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1753 | `web/components/verify/VerifyScreen.tsx:99`<br>VerifyScreen | Field.onChange | `(e) => setServerSeed(e.target.value)`<br>호출: setServerSeed | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1754 | `web/components/verify/VerifyScreen.tsx:100`<br>VerifyScreen | Field.onChange | `(e) => setLockedHash(e.target.value)`<br>호출: setLockedHash | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1755 | `web/components/verify/VerifyScreen.tsx:101`<br>VerifyScreen | Field.onChange | `(e) => setClientSeed(e.target.value)`<br>호출: setClientSeed | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1756 | `web/components/verify/VerifyScreen.tsx:102`<br>VerifyScreen | Field.onChange | `(e) => setNonce(e.target.value)`<br>호출: setNonce | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1757 | `web/components/verify/VerifyScreen.tsx:103`<br>VerifyScreen | Chips.onChange | `setBoxSlug`<br>호출: setBoxSlug | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1758 | `web/components/verify/VerifyScreen.tsx:105`<br>VerifyScreen | Button.onClick | `compute`<br>호출: compute, Number, serverSeed.trim, clientSeed.trim, Number.isInteger, setFailed, setManual, setBusy, BOXES.find, Promise.all, hashServerSeed, calculateRollResult, determineItem, dropTable, lockedHash.trim, lockedHash.trim().toLowerCase | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1759 | `web/components/verify/VerifyScreen.tsx:125`<br>VerifyScreen | VerifySheet.onClose | `() => setVerifying(null)`<br>호출: setVerifying | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/wallet/DepositModal.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/walletStore.ts (web/components/wallet/DepositModal.tsx:11)`, `web/stores/authStore.ts (web/components/wallet/DepositModal.tsx:14)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1760 | `web/components/wallet/DepositModal.tsx:57`<br>DepositModal | mount 또는 의존성 변화 [open, initialTab] | `[open, initialTab]`<br>호출: setTab | 반환 cleanup 없음 |
| CX-I-1761 | `web/components/wallet/DepositModal.tsx:72`<br>DepositModal | motion.div.onMouseDown | `(e) => { if (e.target === e.currentTarget) onClose(); }`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1762 | `web/components/wallet/DepositModal.tsx:88`<br>DepositModal | button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1763 | `web/components/wallet/DepositModal.tsx:107`<br>( [ { key: "usdt", label: t("tabUsdt"), Icon: Coins }, { key: "withdraw", label: t("tabWithdraw"), Icon: ArrowUpRight }, { key: "history", label: t("tabHistory"), Icon: ReceiptText }, ] as const ).map@96 | button.onClick | `() => setTab(key)`<br>호출: setTab | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1764 | `web/components/wallet/DepositModal.tsx:120`<br>DepositModal | UsdtDepositTab.onCredited | `onCredited`<br>호출: onCredited | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1765 | `web/components/wallet/DepositModal.tsx:121`<br>DepositModal | WithdrawTab.onRequested | `(a) => onWithdrawn?.(a)`<br>호출: onWithdrawn | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1766 | `web/components/wallet/DepositModal.tsx:121`<br>DepositModal | WithdrawTab.onBlocked | `onWithdrawBlocked`<br>호출: onWithdrawBlocked | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1767 | `web/components/wallet/DepositModal.tsx:121`<br>DepositModal | WithdrawTab.onDone | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/wallet/HistoryTab.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/walletStore.ts (web/components/wallet/HistoryTab.tsx:8)`, `web/stores/authStore.ts (web/components/wallet/HistoryTab.tsx:14)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1768 | `web/components/wallet/HistoryTab.tsx:96`<br>HistoryTab | mount 또는 의존성 변화 [user?.id] | `[user?.id]`<br>호출: useWalletStore.getState().transactions.filter, useWalletStore.getState, ["COMPLETED", "CANCELLED", "FAILED"].includes, api.withdrawStatus, useAuthStore.getState, useWalletStore.getState().syncWithdrawal, setTimeout, poll, clearTimeout | 113: clearTimeout |
| CX-I-1769 | `web/components/wallet/HistoryTab.tsx:110`<br>poll | setTimeout 지연 10000 | `setTimeout(poll, 10000)`<br>호출: setTimeout | 113: clearTimeout |
| CX-I-1770 | `web/components/wallet/HistoryTab.tsx:113`<br>useEffect@96 | clearTimeout | `clearTimeout(timer)`<br>호출: clearTimeout | 113: clearTimeout |
| CX-I-1771 | `web/components/wallet/HistoryTab.tsx:119`<br>HistoryTab | mount 또는 의존성 변화 [] | `[]`<br>호출: setNow, Date.now, window.setInterval, window.clearInterval | 122: window.clearInterval |
| CX-I-1772 | `web/components/wallet/HistoryTab.tsx:121`<br>useEffect@119 | setInterval 지연 1000 | `window.setInterval(() => setNow(Date.now()), 1000)`<br>호출: window.setInterval, setNow, Date.now | 122: window.clearInterval |
| CX-I-1773 | `web/components/wallet/HistoryTab.tsx:122`<br>useEffect@119 | clearInterval | `window.clearInterval(id)`<br>호출: window.clearInterval | 122: window.clearInterval |
| CX-I-1774 | `web/components/wallet/HistoryTab.tsx:140`<br>navigator.clipboard?.writeText(text).then@138 | setTimeout 지연 1600 | `window.setTimeout(() => setCopied((c) => (c === text ? null : c)), 1600)`<br>호출: window.setTimeout, setCopied | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1775 | `web/components/wallet/HistoryTab.tsx:154`<br>(["all", "deposit", "withdraw"] as Filter[]).map@149 | button.onClick | `() => setFilter(k)`<br>호출: setFilter | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1776 | `web/components/wallet/HistoryTab.tsx:214`<br>rows.map@169 | button.onClick | `() => copy(tx.address¬)`<br>호출: copy, navigator.clipboard?.writeText(text).then(() => { setCopied(text); window.setTimeout(() => setCopied((c) => (c === text ? null : c)), 1600); }).catch, navigator.clipboard?.writeText(text).then, navigator.clipboard?.writeText, setCopied, window.setTimeout, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1777 | `web/components/wallet/HistoryTab.tsx:266`<br>rows.map@169 | button.onClick | `() => void cancel(tx)`<br>호출: cancel, setCancelling, setError, api.cancelWithdrawal, useAuthStore.getState, useWalletStore.getState().syncWithdrawal, useWalletStore.getState | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/wallet/TwoFactorSetup.tsx

상태: 라우트 그래프 도달. store import: `web/stores/securityStore.ts (web/components/wallet/TwoFactorSetup.tsx:13)`, `web/stores/authStore.ts (web/components/wallet/TwoFactorSetup.tsx:16)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1778 | `web/components/wallet/TwoFactorSetup.tsx:48`<br>TwoFactorSetup | mount 또는 의존성 변화 [autoStart, user, prepare] | `[autoStart, user, prepare]`<br>호출: prepare | 반환 cleanup 없음 |
| CX-I-1779 | `web/components/wallet/TwoFactorSetup.tsx:73`<br>TwoFactorSetup | Button.onClick | `() => openLogin("login")`<br>호출: openLogin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1780 | `web/components/wallet/TwoFactorSetup.tsx:79`<br>TwoFactorSetup | Button.onClick | `() => void prepare()`<br>호출: prepare | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1781 | `web/components/wallet/TwoFactorSetup.tsx:83`<br>TwoFactorSetup | form.onSubmit | `(e) => { e.preventDefault(); void submit(code); }`<br>호출: e.preventDefault, submit, /^\d{6}$/.test, setBusy, setError, confirmTotpSetup, useAuthStore.getState, useSecurityStore.getState().accept, useSecurityStore.getState, setSetup, onEnabled, setCode, codeRef.current?.focus | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1782 | `web/components/wallet/TwoFactorSetup.tsx:90`<br>TwoFactorSetup | TextLink.onClick | `() => void copy()`<br>호출: copy, navigator.clipboard.writeText, toast, setError | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1783 | `web/components/wallet/TwoFactorSetup.tsx:93`<br>TwoFactorSetup | Field.onChange | `(e) => { setCode(e.target.value.replace(/\D+/g, "").slice(0, TOTP_DIGITS)); setError(""); }`<br>호출: setCode, e.target.value.replace(/\D+/g, "").slice, e.target.value.replace, setError | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/wallet/UsdtDepositTab.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/authStore.ts (web/components/wallet/UsdtDepositTab.tsx:13)`, `web/stores/settingsStore.ts (web/components/wallet/UsdtDepositTab.tsx:15)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1784 | `web/components/wallet/UsdtDepositTab.tsx:36`<br>UsdtDepositTab | mount 또는 의존성 변화 [onCredited] | `[onCredited]`<br>호출: 없음 | 반환 cleanup 없음 |
| CX-I-1785 | `web/components/wallet/UsdtDepositTab.tsx:44`<br>UsdtDepositTab | mount 또는 의존성 변화 [network, userKey, envAddress] | `[network, userKey, envAddress]`<br>호출: setIssued, setCopied, setAddrError, setStatus, resolveDepositAddress, api .depositAddress(network, userKey) .then((r) => { if (¬alive) return; if (r.network === network && looksLikeAddress(network, r.address)) setIssued({ address: r.address, network, accountId: userKey }); else setAddrError(true); }) .catch, api .depositAddress(network, userKey) .then, api .depositAddress, looksLikeAddress | 59: |
| CX-I-1786 | `web/components/wallet/UsdtDepositTab.tsx:71`<br>useCallback@66 | setTimeout 지연 1800 | `setTimeout(() => setCopied(false), 1800)`<br>호출: setTimeout, setCopied | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1787 | `web/components/wallet/UsdtDepositTab.tsx:78`<br>UsdtDepositTab | mount 또는 의존성 변화 [address, depositReady, network, userKey, meta.confirmations] | `[address, depositReady, network, userKey, meta.confirmations]`<br>호출: setStatus, api.depositCheck, useAuthStore.getState, validDepositReceipt, recordConfirmedUsdtDeposit, useSettingsStore.getState, playChime, onCreditedRef.current, setTimeout, check, clearTimeout | 107: clearTimeout |
| CX-I-1788 | `web/components/wallet/UsdtDepositTab.tsx:103`<br>check | setTimeout 지연 CHECK_INTERVAL_MS | `setTimeout(check, CHECK_INTERVAL_MS)`<br>호출: setTimeout | 107: clearTimeout |
| CX-I-1789 | `web/components/wallet/UsdtDepositTab.tsx:107`<br>useEffect@78 | clearTimeout | `clearTimeout(timer)`<br>호출: clearTimeout | 107: clearTimeout |
| CX-I-1790 | `web/components/wallet/UsdtDepositTab.tsx:129`<br>NETWORKS.map@119 | input.onChange | `() => setNetwork(n.key)`<br>호출: setNetwork | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1791 | `web/components/wallet/UsdtDepositTab.tsx:147`<br>UsdtDepositTab | button.onClick | `copy`<br>호출: copy | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/wallet/WalletScreen.tsx

상태: 라우트 그래프 도달. store import: `web/stores/walletStore.ts (web/components/wallet/WalletScreen.tsx:9)`, `web/stores/authStore.ts (web/components/wallet/WalletScreen.tsx:10)`, `web/stores/flowStore.ts (web/components/wallet/WalletScreen.tsx:11)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1792 | `web/components/wallet/WalletScreen.tsx:44`<br>WalletScreen | mount 또는 의존성 변화 [user?.id] | `[user?.id]`<br>호출: useWalletStore.getState().transactions.filter, useWalletStore.getState, ["COMPLETED", "CANCELLED", "FAILED"].includes, api.withdrawStatus, useAuthStore.getState, useWalletStore.getState().syncWithdrawal, setTimeout, poll, clearTimeout | 61: clearTimeout |
| CX-I-1793 | `web/components/wallet/WalletScreen.tsx:58`<br>poll | setTimeout 지연 10000 | `setTimeout(poll, 10000)`<br>호출: setTimeout | 61: clearTimeout |
| CX-I-1794 | `web/components/wallet/WalletScreen.tsx:61`<br>useEffect@44 | clearTimeout | `clearTimeout(timer)`<br>호출: clearTimeout | 61: clearTimeout |
| CX-I-1795 | `web/components/wallet/WalletScreen.tsx:64`<br>WalletScreen | mount 또는 의존성 변화 [] | `[]`<br>호출: setNow, Date.now, window.setInterval, window.clearInterval | 64: window.clearInterval |
| CX-I-1796 | `web/components/wallet/WalletScreen.tsx:64`<br>useEffect@64 | setInterval 지연 60000 | `window.setInterval(() => setNow(Date.now()), 60000)`<br>호출: window.setInterval, setNow, Date.now | 64: window.clearInterval |
| CX-I-1797 | `web/components/wallet/WalletScreen.tsx:64`<br>useEffect@64 | clearInterval | `window.clearInterval(id)`<br>호출: window.clearInterval | 64: window.clearInterval |
| CX-I-1798 | `web/components/wallet/WalletScreen.tsx:94`<br>WalletScreen | Button.onClick | `() => openLogin("login")`<br>호출: openLogin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1799 | `web/components/wallet/WalletScreen.tsx:102`<br>WalletScreen | Button.onClick | `openCharge`<br>호출: openCharge | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1800 | `web/components/wallet/WalletScreen.tsx:111`<br>rows.slice(0, shown).map@109 | button.onClick | `() => { setOpenId(tx.id); setCancelFailed(false); }`<br>호출: setOpenId, setCancelFailed | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1801 | `web/components/wallet/WalletScreen.tsx:119`<br>WalletScreen | TextLink.onClick | `() => setShown((n) => n + PAGE)`<br>호출: setShown | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1802 | `web/components/wallet/WalletScreen.tsx:124`<br>WalletScreen | Sheet.onClose | `() => setOpenId(null)`<br>호출: setOpenId | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1803 | `web/components/wallet/WalletScreen.tsx:138`<br>WalletScreen | Button.onClick | `() => setCancelling(true)`<br>호출: setCancelling | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1804 | `web/components/wallet/WalletScreen.tsx:145`<br>WalletScreen | Confirm.onCancel | `() => setCancelling(false)`<br>호출: setCancelling | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1805 | `web/components/wallet/WalletScreen.tsx:145`<br>WalletScreen | Confirm.onConfirm | `cancel`<br>호출: cancel, setBusy, setCancelFailed, api.cancelWithdrawal, useAuthStore.getState, useWalletStore.getState().syncWithdrawal, useWalletStore.getState, setCancelling | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/wallet/WithdrawalModal.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1806 | `web/components/wallet/WithdrawalModal.tsx:33`<br>WithdrawalModal | motion.div.onMouseDown | `(e) => e.target === e.currentTarget && onClose()`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1807 | `web/components/wallet/WithdrawalModal.tsx:46`<br>WithdrawalModal | button.onClick | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1808 | `web/components/wallet/WithdrawalModal.tsx:54`<br>WithdrawalModal | WithdrawTab.onRequested | `onRequested`<br>호출: onRequested | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1809 | `web/components/wallet/WithdrawalModal.tsx:54`<br>WithdrawalModal | WithdrawTab.onBlocked | `onBlocked`<br>호출: onBlocked | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1810 | `web/components/wallet/WithdrawalModal.tsx:54`<br>WithdrawalModal | WithdrawTab.onDone | `onClose`<br>호출: onClose | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/wallet/WithdrawScreen.tsx

상태: 라우트 그래프 도달. store import: `web/stores/currencyStore.ts (web/components/wallet/WithdrawScreen.tsx:21)`, `web/stores/walletStore.ts (web/components/wallet/WithdrawScreen.tsx:22)`, `web/stores/securityStore.ts (web/components/wallet/WithdrawScreen.tsx:23)`, `web/stores/authStore.ts (web/components/wallet/WithdrawScreen.tsx:24)`, `web/stores/inventoryStore.ts (web/components/wallet/WithdrawScreen.tsx:30)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1811 | `web/components/wallet/WithdrawScreen.tsx:69`<br>WithdrawScreen | mount 또는 의존성 변화 [user?.id] | `[user?.id]`<br>호출: setStage, setEmailOnly | 반환 cleanup 없음 |
| CX-I-1812 | `web/components/wallet/WithdrawScreen.tsx:70`<br>WithdrawScreen | mount 또는 의존성 변화 [stage.kind] | `[stage.kind]`<br>호출: setCode, setError, setChallenge, setLeft | 반환 cleanup 없음 |
| CX-I-1813 | `web/components/wallet/WithdrawScreen.tsx:170`<br>WithdrawScreen | Button.onClick | `() => openLogin("login")`<br>호출: openLogin | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1814 | `web/components/wallet/WithdrawScreen.tsx:174`<br>WithdrawScreen | Button.onClick | `() => void useSecurityStore.getState().refresh(user.id)`<br>호출: useSecurityStore.getState().refresh, useSecurityStore.getState | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1815 | `web/components/wallet/WithdrawScreen.tsx:183`<br>WithdrawScreen | Button.onClick | `() => setConnecting(true)`<br>호출: setConnecting | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1816 | `web/components/wallet/WithdrawScreen.tsx:184`<br>WithdrawScreen | TextLink.onClick | `() => setEmailOnly(true)`<br>호출: setEmailOnly | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1817 | `web/components/wallet/WithdrawScreen.tsx:185`<br>WithdrawScreen | Sheet.onClose | `() => setConnecting(false)`<br>호출: setConnecting | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1818 | `web/components/wallet/WithdrawScreen.tsx:186`<br>WithdrawScreen | TwoFactorSetup.onEnabled | `() => setConnecting(false)`<br>호출: setConnecting | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1819 | `web/components/wallet/WithdrawScreen.tsx:201`<br>WithdrawScreen | Button.onClick | `() => go({ kind: emailOnly ? "email" : "otp", ...draftOf(stage) })`<br>호출: go, draftOf, setStage | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1820 | `web/components/wallet/WithdrawScreen.tsx:206`<br>WithdrawScreen | form.onSubmit | `(e) => { e.preventDefault(); void submitOtp(); }`<br>호출: e.preventDefault, submitOtp, setBusy, setError, draftOf, verifyWithdrawalOtp, commit, setCode, ["credentials", "invalid", "rateLimit"].includes, setLeft, setStage | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1821 | `web/components/wallet/WithdrawScreen.tsx:208`<br>WithdrawScreen | Field.onChange | `(e) => setCode(e.target.value.replace(/\D/g, ""))`<br>호출: setCode, e.target.value.replace | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1822 | `web/components/wallet/WithdrawScreen.tsx:211`<br>WithdrawScreen | TextLink.onClick | `() => go({ kind: "email", ...draftOf(stage) })`<br>호출: go, draftOf, setStage | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1823 | `web/components/wallet/WithdrawScreen.tsx:216`<br>WithdrawScreen | form.onSubmit | `(e) => { e.preventDefault(); void (challenge ? verifyEmail() : sendEmail()); }`<br>호출: e.preventDefault, verifyEmail, sendEmail, Date.now, setError, setBusy, draftOf, verifyWithdrawalEmail, commit, setCode, setChallenge, sendWithdrawalEmail | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1824 | `web/components/wallet/WithdrawScreen.tsx:218`<br>WithdrawScreen | Field.onChange | `(e) => setCode(e.target.value.replace(/\D/g, ""))`<br>호출: setCode, e.target.value.replace | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1825 | `web/components/wallet/WithdrawScreen.tsx:221`<br>WithdrawScreen | TextLink.onClick | `() => { if (¬busy) void sendEmail(); }`<br>호출: sendEmail, setBusy, setError, setCode, setChallenge, sendWithdrawalEmail, draftOf | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1826 | `web/components/wallet/WithdrawScreen.tsx:238`<br>WithdrawScreen | form.onSubmit | `(e) => { e.preventDefault(); beginConfirm(); }`<br>호출: e.preventDefault, beginConfirm, setTouched, JSON.stringify, address.trim, globalThis.crypto.randomUUID, setError, setStage | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1827 | `web/components/wallet/WithdrawScreen.tsx:241`<br>WithdrawScreen | TextLink.onClick | `openTake`<br>호출: openTake, setTaking | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1828 | `web/components/wallet/WithdrawScreen.tsx:242`<br>WithdrawScreen | Chips.onChange | `setNetwork`<br>호출: setNetwork | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1829 | `web/components/wallet/WithdrawScreen.tsx:244`<br>WithdrawScreen | Field.onChange | `(e) => setAddress(e.target.value)`<br>호출: setAddress | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1830 | `web/components/wallet/WithdrawScreen.tsx:246`<br>WithdrawScreen | Field.onChange | `(e) => { setAmountText(e.target.value.replace(/[^\d.]/g, "")); setReceived(null); }`<br>호출: setAmountText, e.target.value.replace, setReceived | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1831 | `web/components/wallet/WithdrawScreen.tsx:249`<br>[0.25, 0.5, 1].map@249 | button.onClick | `() => { setRatio(ratio); setReceived(null); }`<br>호출: setRatio, setReceived, setAmountText, (+(maxWithdrawable(balance) * ratio).toFixed(2) * rates[currency]).toFixed, (maxWithdrawable(balance) * ratio).toFixed, maxWithdrawable | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1832 | `web/components/wallet/WithdrawScreen.tsx:262`<br>WithdrawScreen | TakeSheet.onClose | `() => setTaking(false)`<br>호출: setTaking | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1833 | `web/components/wallet/WithdrawScreen.tsx:262`<br>WithdrawScreen | TakeSheet.onTaken | `onTaken`<br>호출: onTaken, withdrawPrefillUsdt, useWalletStore.getState, setReceived, setAmountText, (prefillUsdt * rates[currency]).toFixed | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/wallet/WithdrawSteps.tsx

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1834 | `web/components/wallet/WithdrawSteps.tsx:75`<br>ConfirmStep | button.onClick | `onBack`<br>호출: onBack | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1835 | `web/components/wallet/WithdrawSteps.tsx:79`<br>ConfirmStep | button.onClick | `onNext`<br>호출: onNext | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1836 | `web/components/wallet/WithdrawSteps.tsx:120`<br>OtpStep | form.onSubmit | `e => { e.preventDefault(); if (code.length === 6) void submit(code); }`<br>호출: e.preventDefault, submit, setBusy, setError, onSuccess, verifyWithdrawalOtp, setCode, ["credentials", "invalid", "rateLimit"].includes, setLeft, onFallback | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1837 | `web/components/wallet/WithdrawSteps.tsx:121`<br>OtpStep | input.onChange | `e => setCode(e.target.value.replace(/\D/g, ""))`<br>호출: setCode, e.target.value.replace | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1838 | `web/components/wallet/WithdrawSteps.tsx:126`<br>OtpStep | button.onClick | `onFallback`<br>호출: onFallback | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1839 | `web/components/wallet/WithdrawSteps.tsx:127`<br>OtpStep | button.onClick | `onBack`<br>호출: onBack | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1840 | `web/components/wallet/WithdrawSteps.tsx:160`<br>EmailHoldStep | button.onClick | `() => void send()`<br>호출: send, setBusy, setError, setCode, setChallenge, sendWithdrawalEmail | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1841 | `web/components/wallet/WithdrawSteps.tsx:161`<br>EmailHoldStep | form.onSubmit | `e => { e.preventDefault(); void verify(); }`<br>호출: e.preventDefault, verify, Date.now, setError, setBusy, onVerified, verifyWithdrawalEmail, setCode | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1842 | `web/components/wallet/WithdrawSteps.tsx:163`<br>EmailHoldStep | input.onChange | `e => setCode(e.target.value.replace(/\D/g, ""))`<br>호출: setCode, e.target.value.replace | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1843 | `web/components/wallet/WithdrawSteps.tsx:168`<br>EmailHoldStep | button.onClick | `onBack`<br>호출: onBack | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/components/wallet/WithdrawTab.tsx

상태: 라우트 그래프 도달 불가. store import: `web/stores/currencyStore.ts (web/components/wallet/WithdrawTab.tsx:8)`, `web/stores/walletStore.ts (web/components/wallet/WithdrawTab.tsx:9)`, `web/stores/authStore.ts (web/components/wallet/WithdrawTab.tsx:14)`, `web/stores/securityStore.ts (web/components/wallet/WithdrawTab.tsx:18)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1844 | `web/components/wallet/WithdrawTab.tsx:73`<br>TxLink | button.onClick | `() => onCopy(hash)`<br>호출: onCopy | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1845 | `web/components/wallet/WithdrawTab.tsx:113`<br>WithdrawTab | mount 또는 의존성 변화 [user?.id] | `[user?.id]`<br>호출: setStage, setEmailOnly | 반환 cleanup 없음 |
| CX-I-1846 | `web/components/wallet/WithdrawTab.tsx:122`<br>WithdrawTab | mount 또는 의존성 변화 [] | `[]`<br>호출: timers.current.forEach | 반환 cleanup 없음 |
| CX-I-1847 | `web/components/wallet/WithdrawTab.tsx:133`<br>useCallback@129 | setTimeout 지연 1600 | `setTimeout(() => setCopied((c) => (c === text ? null : c)), 1600)`<br>호출: setTimeout, setCopied | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1848 | `web/components/wallet/WithdrawTab.tsx:213`<br>WithdrawTab | button.onClick | `() => void useSecurityStore.getState().refresh(user.id)`<br>호출: useSecurityStore.getState().refresh, useSecurityStore.getState | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1849 | `web/components/wallet/WithdrawTab.tsx:224`<br>WithdrawTab | TwoFactorSetup.onEnabled | `() => setStage({ kind: "form" })`<br>호출: setStage | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1850 | `web/components/wallet/WithdrawTab.tsx:225`<br>WithdrawTab | button.onClick | `() => setEmailOnly(true)`<br>호출: setEmailOnly | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1851 | `web/components/wallet/WithdrawTab.tsx:237`<br>WithdrawTab | ConfirmStep.onBack | `() => setStage({ kind: "form" })`<br>호출: setStage | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1852 | `web/components/wallet/WithdrawTab.tsx:238`<br>WithdrawTab | ConfirmStep.onNext | `() => setStage({ kind: emailOnly ? "email" : "otp", amountUsdt: stage.amountUsdt, network: stage.network, address: stage.address })`<br>호출: setStage | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1853 | `web/components/wallet/WithdrawTab.tsx:249`<br>WithdrawTab | OtpStep.onSuccess | `(proof) => void commit(draft, proof)`<br>호출: commit | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1854 | `web/components/wallet/WithdrawTab.tsx:250`<br>WithdrawTab | OtpStep.onFallback | `() => setStage({ kind: "email", ...draft })`<br>호출: setStage | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1855 | `web/components/wallet/WithdrawTab.tsx:251`<br>WithdrawTab | OtpStep.onBack | `() => setStage({ kind: "confirm", ...draft })`<br>호출: setStage | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1856 | `web/components/wallet/WithdrawTab.tsx:258`<br>WithdrawTab | EmailHoldStep.onVerified | `(proof) => void commit(draft, proof)`<br>호출: commit | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1857 | `web/components/wallet/WithdrawTab.tsx:258`<br>WithdrawTab | EmailHoldStep.onBack | `() => setStage({ kind: "confirm", ...draft })`<br>호출: setStage | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1858 | `web/components/wallet/WithdrawTab.tsx:312`<br>WithdrawTab | TxLink.onCopy | `copy`<br>호출: copy | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1859 | `web/components/wallet/WithdrawTab.tsx:337`<br>WithdrawTab | button.onClick | `reset`<br>호출: reset, setStage, setAmountText, setAddress, setTouched | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1860 | `web/components/wallet/WithdrawTab.tsx:341`<br>WithdrawTab | button.onClick | `onDone`<br>호출: onDone | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1861 | `web/components/wallet/WithdrawTab.tsx:375`<br>WITHDRAW_NETWORKS.map@371 | input.onChange | `() => setNetwork(n.key)`<br>호출: setNetwork | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1862 | `web/components/wallet/WithdrawTab.tsx:392`<br>WithdrawTab | input.onChange | `(e) => setAddress(e.target.value)`<br>호출: setAddress | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1863 | `web/components/wallet/WithdrawTab.tsx:392`<br>WithdrawTab | input.onBlur | `() => setTouched(true)`<br>호출: setTouched | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1864 | `web/components/wallet/WithdrawTab.tsx:402`<br>WithdrawTab | input.onChange | `(e) => setAmountText(e.target.value)`<br>호출: setAmountText | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1865 | `web/components/wallet/WithdrawTab.tsx:402`<br>WithdrawTab | input.onBlur | `() => setTouched(true)`<br>호출: setTouched | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1866 | `web/components/wallet/WithdrawTab.tsx:411`<br>( [ [t("quick25"), 0.25], [t("quick50"), 0.5], [t("quickMax"), 1], ] as const ).map@404 | button.onClick | `() => setRatio(ratio)`<br>호출: setRatio, (maxWithdrawable(balance) * ratio).toFixed, maxWithdrawable, setAmountText, (usdt * rates[currency]).toFixed | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1867 | `web/components/wallet/WithdrawTab.tsx:441`<br>WithdrawTab | button.onClick | `beginConfirm`<br>호출: beginConfirm | UI 속성, 비동기 정리는 연결 함수 참조 |
| CX-I-1868 | `web/components/wallet/WithdrawTab.tsx:474`<br>recent.map@459 | TxLink.onCopy | `copy`<br>호출: copy | UI 속성, 비동기 정리는 연결 함수 참조 |

#### web/lib/audio.ts

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1869 | `web/lib/audio.ts:27`<br>fetchSample | setTimeout 지연 3000 | `window.setTimeout(() => controller.abort(), 3000)`<br>호출: window.setTimeout, controller.abort | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1870 | `web/lib/audio.ts:34`<br>fetch('${SFX_BASE}${name}.wav', { cache: "force-cache", signal: controller.signal }) .then((response) => { if (¬response.ok) throw new Error('Audio ${name}: ${response.status}'); return response.arrayBuffer(); }) .catch(() => { sampleBytes.delete(name); return null; }) .finally@28 | clearTimeout | `window.clearTimeout(timeout)`<br>호출: window.clearTimeout | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1871 | `web/lib/audio.ts:85`<br>loadSample(name, ac).then@76 | start | `src.start()`<br>호출: src.start | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1872 | `web/lib/audio.ts:138`<br>track | disconnect | `n.disconnect()`<br>호출: n.disconnect | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1873 | `web/lib/audio.ts:191`<br>tone | start | `osc.start(start)`<br>호출: osc.start | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1874 | `web/lib/audio.ts:192`<br>tone | stop | `osc.stop(start + duration + 0.05)`<br>호출: osc.stop | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1875 | `web/lib/audio.ts:233`<br>noise | start | `src.start(start, Math.random() * 0.5)`<br>호출: src.start, Math.random | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1876 | `web/lib/audio.ts:234`<br>noise | stop | `src.stop(start + duration + 0.05)`<br>호출: src.stop | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1877 | `web/lib/audio.ts:340`<br>installLifecycle | addEventListener "visibilitychange" | `document.addEventListener("visibilitychange", () => { if (document.hidden) { if (ctx && ctx.state === "running") void ctx.suspend().catch(() => {}); return; } if (ctx && ctx.state === "suspended") void ctx.resume().catch(() => {}); })`<br>호출: document.addEventListener, ctx.suspend().catch, ctx.suspend, ctx.resume().catch, ctx.resume | effect 밖, 취소 행 및 화면 요약 참조 |

#### web/lib/openingSound.ts

상태: 라우트 그래프 도달. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1878 | `web/lib/openingSound.ts:28`<br>soundStop | stop | `node.stop()`<br>호출: node.stop | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1879 | `web/lib/openingSound.ts:38`<br>tone | start | `osc.start(at)`<br>호출: osc.start | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1880 | `web/lib/openingSound.ts:38`<br>tone | stop | `osc.stop(at + dur + 0.02)`<br>호출: osc.stop | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1881 | `web/lib/openingSound.ts:47`<br>noise | start | `src.start(at)`<br>호출: src.start | effect 밖, 취소 행 및 화면 요약 참조 |

#### web/lib/takeBatch.ts

상태: 라우트 그래프 도달. store import: `web/stores/inventoryStore.ts (web/lib/takeBatch.ts:54)`, `web/stores/walletStore.ts (web/lib/takeBatch.ts:55)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1882 | `web/lib/takeBatch.ts:406`<br>(async (): Promise<BatchOutcome> => { try { if (¬ids.length) return nothing("failed", ids); const fault = devOpeningFault(); if (fault === "settle-failed") return nothing("failed", ids); if (fault === "settle-pending") return nothing("pending", ids); return await inTurn(() => withLedgerLock(async (): Promise<BatchOutcome> => { // 1. 저장된 장부와 확인 대기 표시를 직접 읽는다. 읽지 못하면 아무것도 실행하지 않고 알 수 없다고 답한다 let before: SavedLedger; let found: Mark[]; try { before = await readSaved(); found = readMarks(); } catch { resyncWanted = true; return nothing("unknown", ids); } // 2. 남아 있던 표시를 다시 본다. 끝이 확인된 것은 지운다 const reviewed = reviewMarks(before, found); const marks = reviewed.marks; const snap = snapOf(before); if (fault === "settle-unknown") { // 시험용: 잔액으로 풀 자료 없이 표시만 남긴다(다시 볼 때 풀리지 않아, 확인 필요 상태를 화면에서 계속 볼 수 있다) writeMarks([...marks, { ids, snap: null }]); await syncStores(); return nothing("unknown", ids); } const ledger: TakeLedger = { credited: creditedIdsOf(before.transactions), hold: markedIds(marks), saved: true }; const saved = new Map(before.items.map((item) => [item.id, item])); const already: BatchOutcome["already"] = []; const unknown = new Set<string>(); const left = new Set<string>(); const target: string[] = []; for (const id of ids) { const item = saved.get(id); const state = item ? takeStateOf(item, ledger) : "other"; if (item && state === "taken") already.push({ id, amountUsdt: item.soldForUsdt ?? 0 }); else if (state === "unconfirmed") unknown.add(id); else if (state === "held") target.push(id); else left.add(id); } const attempt = fault === "settle-partial" ? target.slice(0, Math.ceil(target.length / 2)) : target; for (const id of target) if (¬attempt.includes(id)) left.add(id); const sold: OwnedItem[] = []; let readable = true; if (attempt.length) { // 3. 받으려는 상품과 지금의 저장된 지갑을 표시에 먼저 적는다. 적지 못하면 받기를 시작하지 않는다(돈은 움직이지 않았다) if (¬writeMarks([...marks, { ids: attempt, snap }])) { for (const id of attempt) left.add(id); if (reviewed.changed) writeMarks(marks); } else { // 4. 받는다. 계산과 쓰기는 기존 takeUsdt 그대로다. 도중에 던져도 여기서 판정하지 않는다 try { takeUsdt(attempt); } catch { /* 아래에서 저장된 장부를 다시 읽어 판정한다 */ } // 5. 저장된 장부를 다시 직접 읽어 판정한다. 읽지 못하면 받으려던 것은 전부 알 수 없다(표시는 남는다) let after: SavedLedger &#124; null; try { after = await readSaved(); } catch { after = null; } if (¬after) { readable = false; resyncWanted = true; for (const id of attempt) unknown.add(id); } else { const paid = creditedIdsOf(after.transactions); const now = new Map(after.items.map((item) => [item.id, item])); // 보관 중이고 내역이 없어도, 저장된 잔액의 변화가 그 사이의 거래 기록으로 전부 설명되지 않으면 받지 못했다고 하지 않는다 const clean = explainedSince(snap, after); const notTaken: string[] = []; const doubtful: string[] = []; for (const id of attempt) { const item = now.get(id); if (item && item.status === "SOLD" && typeof item.soldForUsdt === "number" && paid.has(id)) sold.push(item); else if (item && item.status === "IN_STORAGE" && ¬paid.has(id) && clean) notTaken.push(id); else doubtful.push(id); } // 6. 끝이 확인된 상품만 표시에서 지운다. 지우지 못하면 화면이 그 상품을 확인 필요로 보여 줄 것이므로 답도 그렇게 맞춘다 const cleared = writeMarks(doubtful.length ? [...marks, { ids: doubtful, snap }] : marks); for (const id of doubtful) unknown.add(id); for (const id of notTaken) { if (cleared) left.add(id); else unknown.add(id); } } } } else if (reviewed.changed) { writeMarks(marks); } if (readable) { await syncStores(); resyncWanted = false; } // 받은 금액과 출처별 몫은 저장된 보관함 기록에서 읽는다(sell 이 쓴 값 그대로) const taken = sold.map((item) => ({ id: item.id, amountUsdt: item.soldForUsdt ?? 0 })); const split = attributeRefunds(sold.map((item) => ({ amountUsdt: item.soldForUsdt ?? 0, ratio: normalizeRatio(item.fundingRatio) }))); return { status: statusOf(taken.length, already.length, left.size, unknown.size), taken, already, left: ids.filter((id) => left.has(id)), unknown: ids.filter((id) => unknown.has(id)), amountUsdt: r2(taken.reduce((sum, x) => sum + x.amountUsdt, 0)), ...split, }; })); } catch { // 잠금을 얻지 못했거나 저장소에 쓸 수 없다. 받기를 시작하기 전이라 돈은 움직이지 않았다 return nothing("failed", ids); } })().finally@321 | setTimeout 지연 2000 | `window.setTimeout(() => { void reviewTakeMarks(); }, 2000)`<br>호출: window.setTimeout, reviewTakeMarks, readMarks, Promise.resolve, inTurn(() => withLedgerLock(async (): Promise<void> => { let saved: SavedLedger; let found: Mark[]; try { saved = await readSaved(); found = readMarks(); } catch { return; } const reviewed = reviewMarks(saved, found); if (reviewed.changed) writeMarks(reviewed.marks); await syncStores(); resyncWanted = false; })).catch(() => undefined) (전체 식은 근거 줄) | effect 밖, 취소 행 및 화면 요약 참조 |

#### web/lib/useCanHover.ts

상태: 라우트 그래프 도달 불가. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1883 | `web/lib/useCanHover.ts:13`<br>useCanHover | mount 또는 의존성 변화 [] | `[]`<br>호출: window.matchMedia, setCan, sync, mq.addEventListener, mq.removeEventListener | 18: mq.removeEventListener |
| CX-I-1884 | `web/lib/useCanHover.ts:17`<br>useEffect@13 | addEventListener "change" | `mq.addEventListener("change", sync)`<br>호출: mq.addEventListener | 18: mq.removeEventListener |
| CX-I-1885 | `web/lib/useCanHover.ts:18`<br>useEffect@13 | removeEventListener "change" | `mq.removeEventListener("change", sync)`<br>호출: mq.removeEventListener | 18: mq.removeEventListener |

#### web/lib/useModal.ts

상태: 라우트 그래프 도달. store import: 없음.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1886 | `web/lib/useModal.ts:26`<br>useModal | mount 또는 의존성 변화 [open, ref] | `[open, ref]`<br>호출: Symbol, panel.getAttribute, modalStack.push, panel.focus, updateModalVisibility, requestAnimationFrame, event.preventDefault, event.stopImmediatePropagation, closeRef.current, Array.from(panel.querySelectorAll<HTMLElement>(focusable)).filter, Array.from, panel.querySelectorAll, element.getClientRects, element.closest, panel.contains, last.focus, first.focus, document.addEventListener, cancelAnimat (전체 식은 근거 줄) | 69: cancelAnimationFrame, document.removeEventListener, modalStack.indexOf, modalStack.splice, panel.removeAttribute, panel.setAttribute, updateModalVisibility, [...fallback].reverse().find, [...fallback].reverse, element.getClientRects, element.closest, (target ?? modalStack[modalStack.length - 1]?.panel)?.focus |
| CX-I-1887 | `web/lib/useModal.ts:41`<br>useEffect@26 | requestAnimationFrame | `requestAnimationFrame(() => { if (modalStack[modalStack.length - 1] === entry) panel.focus({ preventScroll: true }); })`<br>호출: requestAnimationFrame, panel.focus | 69: cancelAnimationFrame, document.removeEventListener, modalStack.indexOf, modalStack.splice, panel.removeAttribute, panel.setAttribute, updateModalVisibility, [...fallback].reverse().find, [...fallback].reverse, element.getClientRects, element.closest, (target ?? modalStack[modalStack.length - 1]?.panel)?.focus |
| CX-I-1888 | `web/lib/useModal.ts:68`<br>useEffect@26 | addEventListener "keydown" | `document.addEventListener("keydown", onKey, true)`<br>호출: document.addEventListener | 69: cancelAnimationFrame, document.removeEventListener, modalStack.indexOf, modalStack.splice, panel.removeAttribute, panel.setAttribute, updateModalVisibility, [...fallback].reverse().find, [...fallback].reverse, element.getClientRects, element.closest, (target ?? modalStack[modalStack.length - 1]?.panel)?.focus |
| CX-I-1889 | `web/lib/useModal.ts:70`<br>useEffect@26 | cancelAnimationFrame | `cancelAnimationFrame(frame)`<br>호출: cancelAnimationFrame | 69: cancelAnimationFrame, document.removeEventListener, modalStack.indexOf, modalStack.splice, panel.removeAttribute, panel.setAttribute, updateModalVisibility, [...fallback].reverse().find, [...fallback].reverse, element.getClientRects, element.closest, (target ?? modalStack[modalStack.length - 1]?.panel)?.focus |
| CX-I-1890 | `web/lib/useModal.ts:71`<br>useEffect@26 | removeEventListener "keydown" | `document.removeEventListener("keydown", onKey, true)`<br>호출: document.removeEventListener | 69: cancelAnimationFrame, document.removeEventListener, modalStack.indexOf, modalStack.splice, panel.removeAttribute, panel.setAttribute, updateModalVisibility, [...fallback].reverse().find, [...fallback].reverse, element.getClientRects, element.closest, (target ?? modalStack[modalStack.length - 1]?.panel)?.focus |

#### web/lib/useUsdtDeposit.ts

상태: 라우트 그래프 도달. store import: `web/stores/authStore.ts (web/lib/useUsdtDeposit.ts:12)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1891 | `web/lib/useUsdtDeposit.ts:24`<br>useUsdtDeposit | mount 또는 의존성 변화 [onCredited] | `[onCredited]`<br>호출: 없음 | 반환 cleanup 없음 |
| CX-I-1892 | `web/lib/useUsdtDeposit.ts:28`<br>useUsdtDeposit | mount 또는 의존성 변화 [network, userKey, envAddress, enabled, attempt] | `[network, userKey, envAddress, enabled, attempt]`<br>호출: setIssued, setStatus, resolveDepositAddress, api.depositAddress(network, userKey) .then((r) => { if (¬alive) return; if (r.network === network && looksLikeAddress(network, r.address)) setIssued({ address: r.address, network, accountId: userKey }); else setStatus({ kind: "addressFailed" }); }) .catch, api.depositAddress(network, userKey) .then, api.depositAddress, looksLikeAddress | 40: |
| CX-I-1893 | `web/lib/useUsdtDeposit.ts:45`<br>useUsdtDeposit | mount 또는 의존성 변화 [address, enabled, network, userKey, meta.confirmations] | `[address, enabled, network, userKey, meta.confirmations]`<br>호출: setStatus, api.depositCheck, useAuthStore.getState, validDepositReceipt, recordConfirmedUsdtDeposit, onCreditedRef.current, setTimeout, check, clearTimeout | 71: clearTimeout |
| CX-I-1894 | `web/lib/useUsdtDeposit.ts:67`<br>check | setTimeout 지연 CHECK_INTERVAL_MS | `setTimeout(check, CHECK_INTERVAL_MS)`<br>호출: setTimeout | 71: clearTimeout |
| CX-I-1895 | `web/lib/useUsdtDeposit.ts:71`<br>useEffect@45 | clearTimeout | `clearTimeout(timer)`<br>호출: clearTimeout | 71: clearTimeout |

#### web/stores/authStore.ts

상태: 라우트 그래프 도달. store import: `web/stores/securityStore.ts (web/stores/authStore.ts:6)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1896 | `web/stores/authStore.ts:73`<br>pushToast | setTimeout 지연 5000 | `window.setTimeout(() => get().clearToast(id), 5000)`<br>호출: window.setTimeout, get().clearToast, get | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1897 | `web/stores/authStore.ts:124`<br>모듈 | addEventListener "storage" | `window.addEventListener("storage", sync)`<br>호출: window.addEventListener | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1898 | `web/stores/authStore.ts:125`<br>모듈 | addEventListener "focus" | `window.addEventListener("focus", recheck)`<br>호출: window.addEventListener | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1899 | `web/stores/authStore.ts:126`<br>모듈 | addEventListener "visibilitychange" | `document.addEventListener("visibilitychange", recheck)`<br>호출: document.addEventListener | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1900 | `web/stores/authStore.ts:127`<br>모듈 | removeEventListener "storage" | `window.removeEventListener("storage", sync)`<br>호출: window.removeEventListener | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1901 | `web/stores/authStore.ts:127`<br>모듈 | removeEventListener "focus" | `window.removeEventListener("focus", recheck)`<br>호출: window.removeEventListener | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1902 | `web/stores/authStore.ts:127`<br>모듈 | removeEventListener "visibilitychange" | `document.removeEventListener("visibilitychange", recheck)`<br>호출: document.removeEventListener | effect 밖, 취소 행 및 화면 요약 참조 |

#### web/stores/communityStore.ts

상태: 라우트 그래프 도달. store import: `web/stores/inventoryStore.ts (web/stores/communityStore.ts:5)`, `web/stores/authStore.ts (web/stores/communityStore.ts:6)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1903 | `web/stores/communityStore.ts:74`<br>subscribeCommunityReviews | addEventListener "storage" | `window.addEventListener("storage", storage)`<br>호출: window.addEventListener | effect 밖, 취소 행 및 화면 요약 참조 |
| CX-I-1904 | `web/stores/communityStore.ts:75`<br>subscribeCommunityReviews | removeEventListener "storage" | `window.removeEventListener("storage", storage)`<br>호출: window.removeEventListener | effect 밖, 취소 행 및 화면 요약 참조 |

#### web/stores/usePublishedReviews.ts

상태: 라우트 그래프 도달. store import: `web/stores/communityStore.ts (web/stores/usePublishedReviews.ts:7)`.

| ID | 근거와 소유 함수 | 일으키는 사건 | 연결 식과 호출 | 정리 근거 |
|---|---|---|---|---|
| CX-I-1905 | `web/stores/usePublishedReviews.ts:17`<br>usePublishedReviews | mount 또는 의존성 변화 [] | `[]`<br>호출: browserAccountsEnabled, loadCommunityReviews().then(records => { if (active) setRemote(records); }).catch, loadCommunityReviews().then, loadCommunityReviews, setRemote, Array.isArray, refresh, window.setInterval, window.addEventListener, window.clearInterval, window.removeEventListener | 26: window.clearInterval, window.removeEventListener |
| CX-I-1906 | `web/stores/usePublishedReviews.ts:23`<br>useEffect@17 | setInterval 지연 30000 | `window.setInterval(refresh, 30000)`<br>호출: window.setInterval | 26: window.clearInterval, window.removeEventListener |
| CX-I-1907 | `web/stores/usePublishedReviews.ts:24`<br>useEffect@17 | addEventListener "focus" | `window.addEventListener("focus", refresh)`<br>호출: window.addEventListener | 26: window.clearInterval, window.removeEventListener |
| CX-I-1908 | `web/stores/usePublishedReviews.ts:25`<br>useEffect@17 | addEventListener UPDATE_EVENT | `window.addEventListener(UPDATE_EVENT, updated)`<br>호출: window.addEventListener | 26: window.clearInterval, window.removeEventListener |
| CX-I-1909 | `web/stores/usePublishedReviews.ts:26`<br>useEffect@17 | clearInterval | `window.clearInterval(timer)`<br>호출: window.clearInterval | 26: window.clearInterval, window.removeEventListener |
| CX-I-1910 | `web/stores/usePublishedReviews.ts:26`<br>useEffect@17 | removeEventListener "focus" | `window.removeEventListener("focus", refresh)`<br>호출: window.removeEventListener | 26: window.clearInterval, window.removeEventListener |
| CX-I-1911 | `web/stores/usePublishedReviews.ts:26`<br>useEffect@17 | removeEventListener UPDATE_EVENT | `window.removeEventListener(UPDATE_EVENT, updated)`<br>호출: window.removeEventListener | 26: window.clearInterval, window.removeEventListener |

전수 집계: on 속성 606개, effect 115개, 등록/해제/타이머/observer/animation 호출 187개, 직접 on 속성 할당 4개, 관련 파일 101개.

### 9.5 상태와 자료의 파일별 쓰기 지점

코드에서 읽은 것. 앞 이벤트와 소유 함수를 아래의 쓰기 식에 대응시킨다. React setter, reducer, store 액션, MotionValue, 직접 저장과 자료 쓰기를 포함했다. 긴 식은 앞400자이며 전체는 파일과 줄에 있다. 영속성은 4절 partialize가 기준이다.

#### web/app/not-found.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2000 | `web/app/not-found.tsx:15`<br>useEffect@13 | `setLang(first as Lang)` |

#### web/app/[locale]/about/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2001 | `web/app/[locale]/about/page.tsx:7`<br>MovedPage | `setRequestLocale(locale)` |

#### web/app/[locale]/account/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2002 | `web/app/[locale]/account/page.tsx:7`<br>AccountPage | `setRequestLocale(locale)` |

#### web/app/[locale]/box/[slug]/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2003 | `web/app/[locale]/box/[slug]/page.tsx:14`<br>BoxPage | `setRequestLocale(locale)` |

#### web/app/[locale]/community/board/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2004 | `web/app/[locale]/community/board/page.tsx:7`<br>MovedPage | `setRequestLocale(locale)` |

#### web/app/[locale]/community/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2005 | `web/app/[locale]/community/page.tsx:7`<br>MovedPage | `setRequestLocale(locale)` |

#### web/app/[locale]/dev/gallery/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2006 | `web/app/[locale]/dev/gallery/page.tsx:9`<br>GalleryPage | `setRequestLocale(locale)` |

#### web/app/[locale]/fairness/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2007 | `web/app/[locale]/fairness/page.tsx:7`<br>MovedPage | `setRequestLocale(locale)` |

#### web/app/[locale]/guide/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2008 | `web/app/[locale]/guide/page.tsx:8`<br>GuidePage | `setRequestLocale(locale)` |

#### web/app/[locale]/inventory/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2009 | `web/app/[locale]/inventory/page.tsx:7`<br>InventoryPage | `setRequestLocale(locale)` |

#### web/app/[locale]/layout.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2010 | `web/app/[locale]/layout.tsx:64`<br>LocaleLayout | `setRequestLocale(locale)` |

#### web/app/[locale]/legal/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2011 | `web/app/[locale]/legal/page.tsx:7`<br>LegalCenter | `setRequestLocale(locale)` |

#### web/app/[locale]/legal/[doc]/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2012 | `web/app/[locale]/legal/[doc]/page.tsx:16`<br>LegalPage | `setRequestLocale(locale)` |

#### web/app/[locale]/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2013 | `web/app/[locale]/page.tsx:7`<br>HomePage | `setRequestLocale(locale)` |

#### web/app/[locale]/profile/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2014 | `web/app/[locale]/profile/page.tsx:7`<br>MovedPage | `setRequestLocale(locale)` |

#### web/app/[locale]/reviews/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2015 | `web/app/[locale]/reviews/page.tsx:8`<br>ReviewsPage | `setRequestLocale(locale)` |

#### web/app/[locale]/verify/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2016 | `web/app/[locale]/verify/page.tsx:8`<br>VerifyPage | `setRequestLocale(locale)` |

#### web/app/[locale]/wallet/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2017 | `web/app/[locale]/wallet/page.tsx:7`<br>WalletPage | `setRequestLocale(locale)` |

#### web/app/[locale]/wallet/withdraw/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2018 | `web/app/[locale]/wallet/withdraw/page.tsx:7`<br>WithdrawPage | `setRequestLocale(locale)` |

#### web/app/[locale]/wins/page.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2019 | `web/app/[locale]/wins/page.tsx:7`<br>WinsPage | `setRequestLocale(locale)` |

#### web/components/about/AboutSections.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2020 | `web/components/about/AboutSections.tsx:49`<br>useEffect@47 | `setV(target)` |
| CX-I-2021 | `web/components/about/AboutSections.tsx:56`<br>tick | `setV(+(target * (1 - Math.pow(1 - p, 3))).toFixed(2))` |
| CX-I-2022 | `web/components/about/AboutSections.tsx:59`<br>useEffect@47 | `setV(0)` |
| CX-I-2023 | `web/components/about/AboutSections.tsx:172`<br>useEffect@170 | `setPhase(2)` |
| CX-I-2024 | `web/components/about/AboutSections.tsx:173`<br>useEffect@170 | `setRoll(DRAW_ROLL)` |
| CX-I-2025 | `web/components/about/AboutSections.tsx:180`<br>cycle | `setPhase(0)` |
| CX-I-2026 | `web/components/about/AboutSections.tsx:183`<br>setInterval@181 | `setRoll(n)` |
| CX-I-2027 | `web/components/about/AboutSections.tsx:188`<br>setTimeout@186 | `setRoll(DRAW_ROLL)` |
| CX-I-2028 | `web/components/about/AboutSections.tsx:189`<br>setTimeout@186 | `setPhase(1)` |
| CX-I-2029 | `web/components/about/AboutSections.tsx:191`<br>setTimeout@191 | `setPhase(2)` |
| CX-I-2030 | `web/components/about/AboutSections.tsx:261`<br>DrawCard | `setSeedOpen((v) => ¬v)` |
| CX-I-2031 | `web/components/about/AboutSections.tsx:284`<br>useEffect@282 | `setStep(2)` |
| CX-I-2032 | `web/components/about/AboutSections.tsx:287`<br>useEffect@282 | `setStep(0)` |
| CX-I-2033 | `web/components/about/AboutSections.tsx:288`<br>setInterval@288 | `setStep((s) => (s + 1) % 4)` |
| CX-I-2034 | `web/components/about/AboutSections.tsx:354`<br>setTimeout@354 | `setMode("cash")` |
| CX-I-2035 | `web/components/about/AboutSections.tsx:360`<br>pick | `setMode(m)` |
| CX-I-2036 | `web/components/about/AboutSections.tsx:513`<br>toggle | `setOpen((cur) => (cur === k ? null : k))` |

#### web/components/about/GlobalLiveFeed.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2037 | `web/components/about/GlobalLiveFeed.tsx:257`<br>window.setTimeout@257 | `setIdx((i) => (i + 1) % SHIPPING_HUBS.length)` |
| CX-I-2038 | `web/components/about/GlobalLiveFeed.tsx:300`<br>SHIPPING_HUBS.map@294 | `setIdx(i)` |

#### web/components/about/ImpactStats.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2039 | `web/components/about/ImpactStats.tsx:134`<br>rows.map@128 | `setOpen(isOpen ? null : i)` |

#### web/components/about/IsometricStage.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2040 | `web/components/about/IsometricStage.tsx:55`<br>move | `el.style.setProperty("--glare-x", '${((x + 0.5) * 100).toFixed(1)}%')` |
| CX-I-2041 | `web/components/about/IsometricStage.tsx:56`<br>move | `el.style.setProperty("--glare-y", '${((y + 0.5) * 100).toFixed(1)}%')` |
| CX-I-2042 | `web/components/about/IsometricStage.tsx:96`<br>plates.forEach@96 | `map.set('${p.r}-${p.c}', p)` |

#### web/components/about/TrustScenes.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2043 | `web/components/about/TrustScenes.tsx:36`<br>tick | `setShown(value * (1 - Math.pow(1 - p, 3)))` |
| CX-I-2044 | `web/components/about/TrustScenes.tsx:213`<br>sha256Hex("voila-sealed-server-seed") .then@211 | `setHash(h)` |
| CX-I-2045 | `web/components/about/TrustScenes.tsx:214`<br>sha256Hex("voila-sealed-server-seed") .then@211 | `setRoll(parseInt(h.slice(0, 8), 16) % ROLL_RANGE)` |
| CX-I-2046 | `web/components/about/TrustScenes.tsx:216`<br>sha256Hex("voila-sealed-server-seed") .then((h) => { setHash(h); setRoll(parseInt(h.slice(0, 8), 16) % ROLL_RANGE); }) .catch@211 | `setHash(null)` |

#### web/components/about/VaultHero.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2047 | `web/components/about/VaultHero.tsx:108`<br>window.setTimeout@108 | `setActive((i) => (i + 1) % SHOWCASE.length)` |
| CX-I-2048 | `web/components/about/VaultHero.tsx:178`<br>SHOWCASE.map@173 | `setActive(i)` |

#### web/components/account/AccountScreen.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2049 | `web/components/account/AccountScreen.tsx:38`<br>leave | `setBusy(true)` |
| CX-I-2050 | `web/components/account/AccountScreen.tsx:39`<br>leave | `setLeaving(false)` |
| CX-I-2051 | `web/components/account/AccountScreen.tsx:39`<br>leave | `setBusy(false)` |
| CX-I-2052 | `web/components/account/AccountScreen.tsx:58`<br>AccountScreen | `setSecuring(true)` |
| CX-I-2053 | `web/components/account/AccountScreen.tsx:62`<br>AccountScreen | `setSheet("nickname")` |
| CX-I-2054 | `web/components/account/AccountScreen.tsx:63`<br>AccountScreen | `setSheet("password")` |
| CX-I-2055 | `web/components/account/AccountScreen.tsx:64`<br>AccountScreen | `setSheet("close")` |
| CX-I-2056 | `web/components/account/AccountScreen.tsx:71`<br>AccountScreen | `setLeaving(true)` |
| CX-I-2057 | `web/components/account/AccountScreen.tsx:75`<br>AccountScreen | `setSecuring(false)` |
| CX-I-2058 | `web/components/account/AccountScreen.tsx:76`<br>AccountScreen | `setSecuring(false)` |
| CX-I-2059 | `web/components/account/AccountScreen.tsx:78`<br>AccountScreen | `setSheet(null)` |
| CX-I-2060 | `web/components/account/AccountScreen.tsx:79`<br>AccountScreen | `setSheet(null)` |
| CX-I-2061 | `web/components/account/AccountScreen.tsx:80`<br>AccountScreen | `setSheet(null)` |
| CX-I-2062 | `web/components/account/AccountScreen.tsx:81`<br>AccountScreen | `setLeaving(false)` |

#### web/components/account/AccountSheets.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2063 | `web/components/account/AccountSheets.tsx:24`<br>useEffect@24 | `setValue(user?.nickname ?? "")` |
| CX-I-2064 | `web/components/account/AccountSheets.tsx:24`<br>useEffect@24 | `setError("")` |
| CX-I-2065 | `web/components/account/AccountSheets.tsx:31`<br>save | `setError(t("account.nicknameRule"))` |
| CX-I-2066 | `web/components/account/AccountSheets.tsx:32`<br>save | `setBusy(true)` |
| CX-I-2067 | `web/components/account/AccountSheets.tsx:32`<br>save | `setError("")` |
| CX-I-2068 | `web/components/account/AccountSheets.tsx:33`<br>save | `setError(t("account.saveFail"))` |
| CX-I-2069 | `web/components/account/AccountSheets.tsx:34`<br>save | `setError(errorText(ta, cause))` |
| CX-I-2070 | `web/components/account/AccountSheets.tsx:35`<br>save | `setBusy(false)` |
| CX-I-2071 | `web/components/account/AccountSheets.tsx:39`<br>NicknameSheet | `setValue(e.target.value)` |
| CX-I-2072 | `web/components/account/AccountSheets.tsx:39`<br>NicknameSheet | `setError("")` |
| CX-I-2073 | `web/components/account/AccountSheets.tsx:42`<br>NicknameSheet | `save()` |
| CX-I-2074 | `web/components/account/AccountSheets.tsx:58`<br>save | `setError(t("account.passwordRule"))` |
| CX-I-2075 | `web/components/account/AccountSheets.tsx:59`<br>save | `setError(t("account.codeRule"))` |
| CX-I-2076 | `web/components/account/AccountSheets.tsx:60`<br>save | `setBusy(true)` |
| CX-I-2077 | `web/components/account/AccountSheets.tsx:60`<br>save | `setError("")` |
| CX-I-2078 | `web/components/account/AccountSheets.tsx:61`<br>save | `setCurrent("")` |
| CX-I-2079 | `web/components/account/AccountSheets.tsx:61`<br>save | `setNext("")` |
| CX-I-2080 | `web/components/account/AccountSheets.tsx:61`<br>save | `setCode("")` |
| CX-I-2081 | `web/components/account/AccountSheets.tsx:62`<br>save | `setError(errorText(ta, cause))` |
| CX-I-2082 | `web/components/account/AccountSheets.tsx:63`<br>save | `setBusy(false)` |
| CX-I-2083 | `web/components/account/AccountSheets.tsx:69`<br>PasswordSheet | `setCurrent(e.target.value)` |
| CX-I-2084 | `web/components/account/AccountSheets.tsx:70`<br>PasswordSheet | `setNext(e.target.value)` |
| CX-I-2085 | `web/components/account/AccountSheets.tsx:70`<br>PasswordSheet | `setError("")` |
| CX-I-2086 | `web/components/account/AccountSheets.tsx:71`<br>PasswordSheet | `setCode(e.target.value.replace(/\D+/g, "").slice(0, 6))` |
| CX-I-2087 | `web/components/account/AccountSheets.tsx:73`<br>PasswordSheet | `save()` |
| CX-I-2088 | `web/components/account/AccountSheets.tsx:89`<br>close | `setBusy(true)` |
| CX-I-2089 | `web/components/account/AccountSheets.tsx:89`<br>close | `setError("")` |
| CX-I-2090 | `web/components/account/AccountSheets.tsx:90`<br>close | `setConfirming(false)` |
| CX-I-2091 | `web/components/account/AccountSheets.tsx:90`<br>close | `clearSession()` |
| CX-I-2092 | `web/components/account/AccountSheets.tsx:91`<br>close | `setConfirming(false)` |
| CX-I-2093 | `web/components/account/AccountSheets.tsx:91`<br>close | `setError(errorText(ta, cause))` |
| CX-I-2094 | `web/components/account/AccountSheets.tsx:92`<br>close | `setBusy(false)` |
| CX-I-2095 | `web/components/account/AccountSheets.tsx:97`<br>CloseAccountSheet | `setPassword(e.target.value)` |
| CX-I-2096 | `web/components/account/AccountSheets.tsx:97`<br>CloseAccountSheet | `setError("")` |
| CX-I-2097 | `web/components/account/AccountSheets.tsx:99`<br>CloseAccountSheet | `setConfirming(true)` |
| CX-I-2098 | `web/components/account/AccountSheets.tsx:101`<br>CloseAccountSheet | `setConfirming(false)` |

#### web/components/auth/AccountClosureFlow.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2099 | `web/components/auth/AccountClosureFlow.tsx:91`<br>close | `setStage(null)` |
| CX-I-2100 | `web/components/auth/AccountClosureFlow.tsx:92`<br>close | `setCode("")` |
| CX-I-2101 | `web/components/auth/AccountClosureFlow.tsx:92`<br>close | `setIssuedCode("")` |
| CX-I-2102 | `web/components/auth/AccountClosureFlow.tsx:92`<br>close | `setCodeIssued(false)` |
| CX-I-2103 | `web/components/auth/AccountClosureFlow.tsx:92`<br>close | `setConsent(false)` |
| CX-I-2104 | `web/components/auth/AccountClosureFlow.tsx:92`<br>close | `setError("")` |
| CX-I-2105 | `web/components/auth/AccountClosureFlow.tsx:97`<br>applyGate | `setGate(next)` |
| CX-I-2106 | `web/components/auth/AccountClosureFlow.tsx:98`<br>applyGate | `setStage(next.stage)` |
| CX-I-2107 | `web/components/auth/AccountClosureFlow.tsx:99`<br>applyGate | `setCode("")` |
| CX-I-2108 | `web/components/auth/AccountClosureFlow.tsx:99`<br>applyGate | `setIssuedCode("")` |
| CX-I-2109 | `web/components/auth/AccountClosureFlow.tsx:99`<br>applyGate | `setCodeIssued(false)` |
| CX-I-2110 | `web/components/auth/AccountClosureFlow.tsx:99`<br>applyGate | `setConsent(false)` |
| CX-I-2111 | `web/components/auth/AccountClosureFlow.tsx:99`<br>applyGate | `setError("")` |
| CX-I-2112 | `web/components/auth/AccountClosureFlow.tsx:111`<br>issueCode | `setBusy(true)` |
| CX-I-2113 | `web/components/auth/AccountClosureFlow.tsx:111`<br>issueCode | `setError("")` |
| CX-I-2114 | `web/components/auth/AccountClosureFlow.tsx:111`<br>issueCode | `setCode("")` |
| CX-I-2115 | `web/components/auth/AccountClosureFlow.tsx:114`<br>issueCode | `setIssuedCode(createLocalClosureCode())` |
| CX-I-2116 | `web/components/auth/AccountClosureFlow.tsx:115`<br>issueCode | `setExpiresAt(Date.now() + CODE_LIFETIME_MS)` |
| CX-I-2117 | `web/components/auth/AccountClosureFlow.tsx:120`<br>issueCode | `setCodeIssued(true)` |
| CX-I-2118 | `web/components/auth/AccountClosureFlow.tsx:122`<br>issueCode | `setCodeIssued(false)` |
| CX-I-2119 | `web/components/auth/AccountClosureFlow.tsx:123`<br>issueCode | `setError(t('errors.${cause instanceof AccountError ? cause.code : "network"}'))` |
| CX-I-2120 | `web/components/auth/AccountClosureFlow.tsx:124`<br>issueCode | `setBusy(false)` |
| CX-I-2121 | `web/components/auth/AccountClosureFlow.tsx:131`<br>complete | `setError("인증코드가 올바르지 않거나 만료되었습니다. 새 코드를 받아 다시 입력해 주세요.")` |
| CX-I-2122 | `web/components/auth/AccountClosureFlow.tsx:136`<br>complete | `setBusy(true)` |
| CX-I-2123 | `web/components/auth/AccountClosureFlow.tsx:136`<br>complete | `setError("")` |
| CX-I-2124 | `web/components/auth/AccountClosureFlow.tsx:143`<br>complete | `clearSession()` |
| CX-I-2125 | `web/components/auth/AccountClosureFlow.tsx:144`<br>complete | `setIssuedCode("")` |
| CX-I-2126 | `web/components/auth/AccountClosureFlow.tsx:144`<br>complete | `setCode("")` |
| CX-I-2127 | `web/components/auth/AccountClosureFlow.tsx:144`<br>complete | `setConsent(false)` |
| CX-I-2128 | `web/components/auth/AccountClosureFlow.tsx:145`<br>complete | `setStage("done")` |
| CX-I-2129 | `web/components/auth/AccountClosureFlow.tsx:147`<br>complete | `setError(cause instanceof AccountError && ["invalid", "credentials"].includes(cause.code) ? "인증코드가 올바르지 않거나 만료되었습니다. 새 코드를 받아 다시 입력해 주세요." : t('errors.${cause instanceof AccountError ? cause.code : "network"}'))` |
| CX-I-2130 | `web/components/auth/AccountClosureFlow.tsx:150`<br>complete | `setBusy(false)` |
| CX-I-2131 | `web/components/auth/AccountClosureFlow.tsx:177`<br>AccountClosureFlow | `setCode(event.target.value.replace(/\D/g, "").slice(0, 6))` |
| CX-I-2132 | `web/components/auth/AccountClosureFlow.tsx:178`<br>AccountClosureFlow | `setConsent(event.target.checked)` |

#### web/components/auth/AuthHost.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2133 | `web/components/auth/AuthHost.tsx:31`<br>grant | `wallet.setWelcomeAccount(userId)` |
| CX-I-2134 | `web/components/auth/AuthHost.tsx:32`<br>grant | `wallet.claimWelcome(userId)` |
| CX-I-2135 | `web/components/auth/AuthHost.tsx:34`<br>grant | `wallet.claimWelcomeBoxes()` |

#### web/components/auth/AuthModal.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2136 | `web/components/auth/AuthModal.tsx:28`<br>acceptSession | `setAuthSession(user)` |
| CX-I-2137 | `web/components/auth/AuthModal.tsx:45`<br>useEffect@44 | `setStep("email")` |
| CX-I-2138 | `web/components/auth/AuthModal.tsx:45`<br>useEffect@44 | `setPassword("")` |
| CX-I-2139 | `web/components/auth/AuthModal.tsx:45`<br>useEffect@44 | `setCode("")` |
| CX-I-2140 | `web/components/auth/AuthModal.tsx:45`<br>useEffect@44 | `setVisible(false)` |
| CX-I-2141 | `web/components/auth/AuthModal.tsx:45`<br>useEffect@44 | `setNotice("")` |
| CX-I-2142 | `web/components/auth/AuthModal.tsx:45`<br>useEffect@44 | `setError("")` |
| CX-I-2143 | `web/components/auth/AuthModal.tsx:46`<br>useEffect@44 | `setEmail("")` |
| CX-I-2144 | `web/components/auth/AuthModal.tsx:56`<br>perform | `setBusy(true)` |
| CX-I-2145 | `web/components/auth/AuthModal.tsx:56`<br>perform | `setError("")` |
| CX-I-2146 | `web/components/auth/AuthModal.tsx:56`<br>perform | `setNotice("")` |
| CX-I-2147 | `web/components/auth/AuthModal.tsx:58`<br>perform | `setError(t('errors.${cause instanceof AccountError ? cause.code : "network"}'))` |
| CX-I-2148 | `web/components/auth/AuthModal.tsx:59`<br>perform | `setBusy(false)` |
| CX-I-2149 | `web/components/auth/AuthModal.tsx:66`<br>perform@63 | `setEmail(email.trim())` |
| CX-I-2150 | `web/components/auth/AuthModal.tsx:67`<br>perform@63 | `setStep("reset")` |
| CX-I-2151 | `web/components/auth/AuthModal.tsx:68`<br>perform@63 | `setStep("password")` |
| CX-I-2152 | `web/components/auth/AuthModal.tsx:73`<br>perform@63 | `acceptSession(user)` |
| CX-I-2153 | `web/components/auth/AuthModal.tsx:73`<br>perform@63 | `setPassword("")` |
| CX-I-2154 | `web/components/auth/AuthModal.tsx:73`<br>perform@63 | `setStep("verify")` |
| CX-I-2155 | `web/components/auth/AuthModal.tsx:74`<br>perform@63 | `acceptSession(await loginAccount(email, password))` |
| CX-I-2156 | `web/components/auth/AuthModal.tsx:75`<br>perform@63 | `acceptSession(await verifyAccountEmail(email, code))` |
| CX-I-2157 | `web/components/auth/AuthModal.tsx:76`<br>perform@63 | `setPassword("")` |
| CX-I-2158 | `web/components/auth/AuthModal.tsx:76`<br>perform@63 | `setStep("done")` |
| CX-I-2159 | `web/components/auth/AuthModal.tsx:81`<br>perform@79 | `acceptSession(result.user)` |
| CX-I-2160 | `web/components/auth/AuthModal.tsx:84`<br>back | `setStep("email")` |
| CX-I-2161 | `web/components/auth/AuthModal.tsx:84`<br>back | `setPassword("")` |
| CX-I-2162 | `web/components/auth/AuthModal.tsx:84`<br>back | `setCode("")` |
| CX-I-2163 | `web/components/auth/AuthModal.tsx:84`<br>back | `setError("")` |
| CX-I-2164 | `web/components/auth/AuthModal.tsx:84`<br>back | `setNotice("")` |
| CX-I-2165 | `web/components/auth/AuthModal.tsx:89`<br>AuthModal | `setPassword(e.target.value)` |
| CX-I-2166 | `web/components/auth/AuthModal.tsx:90`<br>AuthModal | `setVisible(¬visible)` |
| CX-I-2167 | `web/components/auth/AuthModal.tsx:106`<br>AuthModal | `setModalMode("login")` |
| CX-I-2168 | `web/components/auth/AuthModal.tsx:108`<br>AuthModal | `setEmail(e.target.value)` |
| CX-I-2169 | `web/components/auth/AuthModal.tsx:110`<br>AuthModal | `setCode(e.target.value.replace(/\D/g, ""))` |
| CX-I-2170 | `web/components/auth/AuthModal.tsx:112`<br>AuthModal | `setModalMode("recover")` |
| CX-I-2171 | `web/components/auth/AuthModal.tsx:116`<br>AuthModal | `setModalMode(signup &#124;&#124; recover ? "login" : "signup")` |
| CX-I-2172 | `web/components/auth/AuthModal.tsx:117`<br>perform@117 | `setCode("")` |
| CX-I-2173 | `web/components/auth/AuthModal.tsx:117`<br>perform@117 | `setNotice(t("verificationCode"))` |

#### web/components/auth/AvatarSettings.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2174 | `web/components/auth/AvatarSettings.tsx:29`<br>useEffect@24 | `setError(t("errors.avatar_invalid"))` |
| CX-I-2175 | `web/components/auth/AvatarSettings.tsx:32`<br>useEffect@24 | `setPending(canvas.toDataURL("image/jpeg", 0.85))` |
| CX-I-2176 | `web/components/auth/AvatarSettings.tsx:37`<br>select | `setError("")` |
| CX-I-2177 | `web/components/auth/AvatarSettings.tsx:37`<br>select | `setSaved(false)` |
| CX-I-2178 | `web/components/auth/AvatarSettings.tsx:37`<br>select | `setLoading(true)` |
| CX-I-2179 | `web/components/auth/AvatarSettings.tsx:37`<br>select | `setPending(undefined)` |
| CX-I-2180 | `web/components/auth/AvatarSettings.tsx:37`<br>select | `setImage(undefined)` |
| CX-I-2181 | `web/components/auth/AvatarSettings.tsx:38`<br>select | `setError(t("imageFormat"))` |
| CX-I-2182 | `web/components/auth/AvatarSettings.tsx:38`<br>select | `setLoading(false)` |
| CX-I-2183 | `web/components/auth/AvatarSettings.tsx:44`<br>select | `setZoom(1)` |
| CX-I-2184 | `web/components/auth/AvatarSettings.tsx:44`<br>select | `setX(50)` |
| CX-I-2185 | `web/components/auth/AvatarSettings.tsx:44`<br>select | `setY(50)` |
| CX-I-2186 | `web/components/auth/AvatarSettings.tsx:44`<br>select | `setImage(img)` |
| CX-I-2187 | `web/components/auth/AvatarSettings.tsx:45`<br>select | `setError(t("errors.avatar_invalid"))` |
| CX-I-2188 | `web/components/auth/AvatarSettings.tsx:46`<br>select | `setLoading(false)` |
| CX-I-2189 | `web/components/auth/AvatarSettings.tsx:48`<br>cancel | `setPending(undefined)` |
| CX-I-2190 | `web/components/auth/AvatarSettings.tsx:48`<br>cancel | `setImage(undefined)` |
| CX-I-2191 | `web/components/auth/AvatarSettings.tsx:48`<br>cancel | `setLoading(false)` |
| CX-I-2192 | `web/components/auth/AvatarSettings.tsx:48`<br>cancel | `setError("")` |
| CX-I-2193 | `web/components/auth/AvatarSettings.tsx:51`<br>save | `setBusy(true)` |
| CX-I-2194 | `web/components/auth/AvatarSettings.tsx:51`<br>save | `setError("")` |
| CX-I-2195 | `web/components/auth/AvatarSettings.tsx:51`<br>save | `setSaved(false)` |
| CX-I-2196 | `web/components/auth/AvatarSettings.tsx:54`<br>save | `setPending(undefined)` |
| CX-I-2197 | `web/components/auth/AvatarSettings.tsx:54`<br>save | `setImage(undefined)` |
| CX-I-2198 | `web/components/auth/AvatarSettings.tsx:54`<br>save | `setSaved(true)` |
| CX-I-2199 | `web/components/auth/AvatarSettings.tsx:55`<br>save | `setError(cause instanceof ProfileError ? t('errors.${cause.reason}') : a('errors.${cause instanceof AccountError ? cause.code : "network"}'))` |
| CX-I-2200 | `web/components/auth/AvatarSettings.tsx:56`<br>save | `setBusy(false)` |
| CX-I-2201 | `web/components/auth/AvatarSettings.tsx:61`<br>[{ key: "zoom", value: zoom, set: setZoom, min: 1, max: 3, step: 0.05 }, { key: "horizontal", value: x, set: setX, min: 0, max: 100, step: 1 }, { key: "vertical", value: y, set: setY, min: 0, max: 100, step: 1 }].map@61 | `control.set(Number(e.target.value))` |
| CX-I-2202 | `web/components/auth/AvatarSettings.tsx:65`<br>AvatarSettings | `save()` |
| CX-I-2203 | `web/components/auth/AvatarSettings.tsx:65`<br>AvatarSettings | `setPending(null)` |
| CX-I-2204 | `web/components/auth/AvatarSettings.tsx:65`<br>AvatarSettings | `setImage(undefined)` |
| CX-I-2205 | `web/components/auth/AvatarSettings.tsx:65`<br>AvatarSettings | `setSaved(false)` |
| CX-I-2206 | `web/components/auth/AvatarSettings.tsx:65`<br>AvatarSettings | `setError("")` |

#### web/components/auth/HeaderAuthControl.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2207 | `web/components/auth/HeaderAuthControl.tsx:61`<br>onDown | `setOpen(false)` |
| CX-I-2208 | `web/components/auth/HeaderAuthControl.tsx:64`<br>onKey | `setOpen(false)` |
| CX-I-2209 | `web/components/auth/HeaderAuthControl.tsx:75`<br>signOut | `setOpen(false)` |
| CX-I-2210 | `web/components/auth/HeaderAuthControl.tsx:76`<br>logout(t("toastLogout")).catch@76 | `useAuthStore.getState().pushToast(ta("errors.network"), "neutral")` |
| CX-I-2211 | `web/components/auth/HeaderAuthControl.tsx:107`<br>HeaderAuthControl | `setOpen((o) => ¬o)` |
| CX-I-2212 | `web/components/auth/HeaderAuthControl.tsx:145`<br>HeaderAuthControl | `setOpen(false)` |

#### web/components/auth/NicknameSettings.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2213 | `web/components/auth/NicknameSettings.tsx:29`<br>saveNicknameUpdatedAt | `window.localStorage.setItem(NICKNAME_UPDATED_AT_KEY, JSON.stringify({ ...history, [userId]: updatedAt }))` |
| CX-I-2214 | `web/components/auth/NicknameSettings.tsx:31`<br>saveNicknameUpdatedAt | `window.localStorage.setItem(NICKNAME_UPDATED_AT_KEY, JSON.stringify({ [userId]: updatedAt }))` |
| CX-I-2215 | `web/components/auth/NicknameSettings.tsx:51`<br>useEffect@51 | `setNickname(user.nickname ?? "")` |
| CX-I-2216 | `web/components/auth/NicknameSettings.tsx:51`<br>useEffect@51 | `setCheckedNickname(null)` |
| CX-I-2217 | `web/components/auth/NicknameSettings.tsx:51`<br>useEffect@51 | `setAvailability(null)` |
| CX-I-2218 | `web/components/auth/NicknameSettings.tsx:60`<br>checkAvailability | `setCheckedNickname(normalized)` |
| CX-I-2219 | `web/components/auth/NicknameSettings.tsx:60`<br>checkAvailability | `setAvailability(result)` |
| CX-I-2220 | `web/components/auth/NicknameSettings.tsx:60`<br>checkAvailability | `setError(validationMessage(validation.reason ?? "format"))` |
| CX-I-2221 | `web/components/auth/NicknameSettings.tsx:64`<br>checkAvailability | `setChecking(true)` |
| CX-I-2222 | `web/components/auth/NicknameSettings.tsx:64`<br>checkAvailability | `setError("")` |
| CX-I-2223 | `web/components/auth/NicknameSettings.tsx:64`<br>checkAvailability | `setCompletion(null)` |
| CX-I-2224 | `web/components/auth/NicknameSettings.tsx:67`<br>checkAvailability | `setCheckedNickname(normalized)` |
| CX-I-2225 | `web/components/auth/NicknameSettings.tsx:67`<br>checkAvailability | `setAvailability(result)` |
| CX-I-2226 | `web/components/auth/NicknameSettings.tsx:68`<br>checkAvailability | `setError(validationMessage(result.reason ?? "taken"))` |
| CX-I-2227 | `web/components/auth/NicknameSettings.tsx:72`<br>checkAvailability | `setCheckedNickname(normalized)` |
| CX-I-2228 | `web/components/auth/NicknameSettings.tsx:72`<br>checkAvailability | `setAvailability(result)` |
| CX-I-2229 | `web/components/auth/NicknameSettings.tsx:73`<br>checkAvailability | `setError(t('errors.${cause instanceof AccountError ? cause.code : "network"}'))` |
| CX-I-2230 | `web/components/auth/NicknameSettings.tsx:75`<br>checkAvailability | `setChecking(false)` |
| CX-I-2231 | `web/components/auth/NicknameSettings.tsx:84`<br>submit | `setCooldown({ ...eligibility, lastChangedAt: String(lastChangedAt) })` |
| CX-I-2232 | `web/components/auth/NicknameSettings.tsx:91`<br>submit | `setCompletion(null)` |
| CX-I-2233 | `web/components/auth/NicknameSettings.tsx:92`<br>submit | `setCheckedNickname(normalized)` |
| CX-I-2234 | `web/components/auth/NicknameSettings.tsx:92`<br>submit | `setAvailability({ available: false, reason: validation.reason })` |
| CX-I-2235 | `web/components/auth/NicknameSettings.tsx:93`<br>submit | `setError(validationMessage(validation.reason ?? "format"))` |
| CX-I-2236 | `web/components/auth/NicknameSettings.tsx:99`<br>submit | `setError(t("nicknameCheckRequired"))` |
| CX-I-2237 | `web/components/auth/NicknameSettings.tsx:103`<br>submit | `setBusy(true)` |
| CX-I-2238 | `web/components/auth/NicknameSettings.tsx:103`<br>submit | `setError("")` |
| CX-I-2239 | `web/components/auth/NicknameSettings.tsx:103`<br>submit | `setCompletion(null)` |
| CX-I-2240 | `web/components/auth/NicknameSettings.tsx:109`<br>submit | `setNickname(normalized)` |
| CX-I-2241 | `web/components/auth/NicknameSettings.tsx:110`<br>submit | `setCheckedNickname(null)` |
| CX-I-2242 | `web/components/auth/NicknameSettings.tsx:110`<br>submit | `setAvailability(null)` |
| CX-I-2243 | `web/components/auth/NicknameSettings.tsx:111`<br>submit | `setCompletion(canChangeNickname(updatedAt).nextAvailableAt)` |
| CX-I-2244 | `web/components/auth/NicknameSettings.tsx:113`<br>submit | `setError(cause instanceof AccountError && cause.code === "conflict" ? t("nicknameTaken") : t('errors.${cause instanceof AccountError ? cause.code : "network"}'))` |
| CX-I-2245 | `web/components/auth/NicknameSettings.tsx:114`<br>submit | `setBusy(false)` |
| CX-I-2246 | `web/components/auth/NicknameSettings.tsx:122`<br>NicknameSettings | `setNickname(e.target.value)` |
| CX-I-2247 | `web/components/auth/NicknameSettings.tsx:122`<br>NicknameSettings | `setCompletion(null)` |
| CX-I-2248 | `web/components/auth/NicknameSettings.tsx:122`<br>NicknameSettings | `setCheckedNickname(null)` |
| CX-I-2249 | `web/components/auth/NicknameSettings.tsx:122`<br>NicknameSettings | `setAvailability(null)` |
| CX-I-2250 | `web/components/auth/NicknameSettings.tsx:122`<br>NicknameSettings | `setError("")` |
| CX-I-2251 | `web/components/auth/NicknameSettings.tsx:133`<br>NicknameSettings | `setCooldown(null)` |
| CX-I-2252 | `web/components/auth/NicknameSettings.tsx:141`<br>NicknameSettings | `setCooldown(null)` |

#### web/components/auth/PasswordChangeFlow.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2253 | `web/components/auth/PasswordChangeFlow.tsx:68`<br>clearSecrets | `setCurrent("")` |
| CX-I-2254 | `web/components/auth/PasswordChangeFlow.tsx:68`<br>clearSecrets | `setPassword("")` |
| CX-I-2255 | `web/components/auth/PasswordChangeFlow.tsx:68`<br>clearSecrets | `setRepeat("")` |
| CX-I-2256 | `web/components/auth/PasswordChangeFlow.tsx:68`<br>clearSecrets | `setCode("")` |
| CX-I-2257 | `web/components/auth/PasswordChangeFlow.tsx:68`<br>clearSecrets | `setChallenge(undefined)` |
| CX-I-2258 | `web/components/auth/PasswordChangeFlow.tsx:68`<br>clearSecrets | `setExhausted(false)` |
| CX-I-2259 | `web/components/auth/PasswordChangeFlow.tsx:68`<br>clearSecrets | `setVisible(false)` |
| CX-I-2260 | `web/components/auth/PasswordChangeFlow.tsx:70`<br>finish | `setStep("closed")` |
| CX-I-2261 | `web/components/auth/PasswordChangeFlow.tsx:71`<br>finish | `useAuthStore.getState().clearSession()` |
| CX-I-2262 | `web/components/auth/PasswordChangeFlow.tsx:77`<br>close | `setStep("closed")` |
| CX-I-2263 | `web/components/auth/PasswordChangeFlow.tsx:77`<br>close | `setError("")` |
| CX-I-2264 | `web/components/auth/PasswordChangeFlow.tsx:81`<br>useEffect@80 | `setBusy(false)` |
| CX-I-2265 | `web/components/auth/PasswordChangeFlow.tsx:81`<br>useEffect@80 | `setStep("closed")` |
| CX-I-2266 | `web/components/auth/PasswordChangeFlow.tsx:86`<br>setInterval@86 | `setNow(Date.now())` |
| CX-I-2267 | `web/components/auth/PasswordChangeFlow.tsx:91`<br>report | `setStep("social")` |
| CX-I-2268 | `web/components/auth/PasswordChangeFlow.tsx:93`<br>report | `setFailures(n)` |
| CX-I-2269 | `web/components/auth/PasswordChangeFlow.tsx:93`<br>report | `useAuthStore.getState().setPasswordFailures(userId¬, n)` |
| CX-I-2270 | `web/components/auth/PasswordChangeFlow.tsx:93`<br>report | `setStep(n >= 5 ? "locked" : "mismatch")` |
| CX-I-2271 | `web/components/auth/PasswordChangeFlow.tsx:96`<br>report | `setChallenge(undefined)` |
| CX-I-2272 | `web/components/auth/PasswordChangeFlow.tsx:96`<br>report | `setCode("")` |
| CX-I-2273 | `web/components/auth/PasswordChangeFlow.tsx:96`<br>report | `setError(copy.expired)` |
| CX-I-2274 | `web/components/auth/PasswordChangeFlow.tsx:97`<br>report | `setStep("current")` |
| CX-I-2275 | `web/components/auth/PasswordChangeFlow.tsx:97`<br>report | `setError(copy.verificationRequired)` |
| CX-I-2276 | `web/components/auth/PasswordChangeFlow.tsx:99`<br>report | `setExhausted(true)` |
| CX-I-2277 | `web/components/auth/PasswordChangeFlow.tsx:100`<br>report | `setError(cause.reason === "password_reused" ? copy.samePassword : cause.reason === "password_invalid" ? copy.passwordLength : cause.reason === "code_expired" ? copy.expired : cause.reason === "code_attempts_exceeded" ? copy.codeAttempts : cause.reason === "resend_wait" ? copy.rateLimit : copy.codeInvalid)` |
| CX-I-2278 | `web/components/auth/PasswordChangeFlow.tsx:101`<br>report | `setError(cause instanceof AccountError && cause.code === "credentials" ? copy.credentials : cause instanceof AccountError && cause.code === "invalid" ? copy.invalid : copy.network)` |
| CX-I-2279 | `web/components/auth/PasswordChangeFlow.tsx:107`<br>run | `setBusy(true)` |
| CX-I-2280 | `web/components/auth/PasswordChangeFlow.tsx:107`<br>run | `setError("")` |
| CX-I-2281 | `web/components/auth/PasswordChangeFlow.tsx:110`<br>run | `setBusy(false)` |
| CX-I-2282 | `web/components/auth/PasswordChangeFlow.tsx:114`<br>begin | `setError("")` |
| CX-I-2283 | `web/components/auth/PasswordChangeFlow.tsx:114`<br>begin | `setNotice("")` |
| CX-I-2284 | `web/components/auth/PasswordChangeFlow.tsx:114`<br>begin | `setProvider(user.provider ?? "email")` |
| CX-I-2285 | `web/components/auth/PasswordChangeFlow.tsx:115`<br>begin | `setStep("social")` |
| CX-I-2286 | `web/components/auth/PasswordChangeFlow.tsx:116`<br>begin | `setStep("loading")` |
| CX-I-2287 | `web/components/auth/PasswordChangeFlow.tsx:121`<br>run@117 | `setProvider(status.provider)` |
| CX-I-2288 | `web/components/auth/PasswordChangeFlow.tsx:121`<br>run@117 | `setFailures(status.failures)` |
| CX-I-2289 | `web/components/auth/PasswordChangeFlow.tsx:121`<br>run@117 | `setTwoFactor(status.twoFactorEnabled)` |
| CX-I-2290 | `web/components/auth/PasswordChangeFlow.tsx:122`<br>run@117 | `useAuthStore.getState().setPasswordFailures(user.id, status.failures)` |
| CX-I-2291 | `web/components/auth/PasswordChangeFlow.tsx:123`<br>run@117 | `setStep(isSocialAccount(status.provider) ? "social" : status.locked ? "locked" : "current")` |
| CX-I-2292 | `web/components/auth/PasswordChangeFlow.tsx:124`<br>run@117 | `setStep("loadError")` |
| CX-I-2293 | `web/components/auth/PasswordChangeFlow.tsx:132`<br>run@129 | `setChallenge(result)` |
| CX-I-2294 | `web/components/auth/PasswordChangeFlow.tsx:132`<br>run@129 | `setCode("")` |
| CX-I-2295 | `web/components/auth/PasswordChangeFlow.tsx:132`<br>run@129 | `setExhausted(false)` |
| CX-I-2296 | `web/components/auth/PasswordChangeFlow.tsx:132`<br>run@129 | `setNow(Date.now())` |
| CX-I-2297 | `web/components/auth/PasswordChangeFlow.tsx:140`<br>run@136 | `setFailures(result.failures)` |
| CX-I-2298 | `web/components/auth/PasswordChangeFlow.tsx:140`<br>run@136 | `setTwoFactor(result.twoFactorEnabled)` |
| CX-I-2299 | `web/components/auth/PasswordChangeFlow.tsx:140`<br>run@136 | `setNotice("")` |
| CX-I-2300 | `web/components/auth/PasswordChangeFlow.tsx:141`<br>run@136 | `useAuthStore.getState().setPasswordFailures(userId¬, result.failures)` |
| CX-I-2301 | `web/components/auth/PasswordChangeFlow.tsx:142`<br>run@136 | `setStep(result.locked ? "locked" : "mismatch")` |
| CX-I-2302 | `web/components/auth/PasswordChangeFlow.tsx:143`<br>run@136 | `setStep("new")` |
| CX-I-2303 | `web/components/auth/PasswordChangeFlow.tsx:147`<br>run@136 | `useAuthStore.getState().setPasswordFailures(userId¬, 0)` |
| CX-I-2304 | `web/components/auth/PasswordChangeFlow.tsx:147`<br>run@136 | `setFailures(0)` |
| CX-I-2305 | `web/components/auth/PasswordChangeFlow.tsx:147`<br>run@136 | `setStep("current")` |
| CX-I-2306 | `web/components/auth/PasswordChangeFlow.tsx:147`<br>run@136 | `setNotice(copy.unlocked)` |
| CX-I-2307 | `web/components/auth/PasswordChangeFlow.tsx:152`<br>run@136 | `setStep("done")` |
| CX-I-2308 | `web/components/auth/PasswordChangeFlow.tsx:161`<br>passwordField | `update(e.target.value)` |
| CX-I-2309 | `web/components/auth/PasswordChangeFlow.tsx:161`<br>passwordField | `setVisible(¬visible)` |
| CX-I-2310 | `web/components/auth/PasswordChangeFlow.tsx:168`<br>PasswordChangeFlow | `setCode(e.target.value.replace(/\D/g, ""))` |
| CX-I-2311 | `web/components/auth/PasswordChangeFlow.tsx:180`<br>PasswordChangeFlow | `setError("")` |
| CX-I-2312 | `web/components/auth/PasswordChangeFlow.tsx:180`<br>PasswordChangeFlow | `setStep("current")` |

#### web/components/auth/ProfileAvatar.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2313 | `web/components/auth/ProfileAvatar.tsx:7`<br>ProfileAvatar | `setFailed(src)` |

#### web/components/auth/SecuritySettings.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2314 | `web/components/auth/SecuritySettings.tsx:21`<br>disable | `setBusy(true)` |
| CX-I-2315 | `web/components/auth/SecuritySettings.tsx:21`<br>disable | `setError("")` |
| CX-I-2316 | `web/components/auth/SecuritySettings.tsx:25`<br>disable | `security.accept(user.id, result)` |
| CX-I-2317 | `web/components/auth/SecuritySettings.tsx:25`<br>disable | `setDisabling(false)` |
| CX-I-2318 | `web/components/auth/SecuritySettings.tsx:25`<br>disable | `setCode("")` |
| CX-I-2319 | `web/components/auth/SecuritySettings.tsx:26`<br>disable | `setError(cause instanceof AccountError && cause.code === "credentials" ? t("codeWrong") : ta('errors.${cause instanceof AccountError ? cause.code : "network"}'))` |
| CX-I-2320 | `web/components/auth/SecuritySettings.tsx:27`<br>disable | `setBusy(false)` |
| CX-I-2321 | `web/components/auth/SecuritySettings.tsx:36`<br>SecuritySettings | `setCode(e.target.value.replace(/\D/g, ""))` |
| CX-I-2322 | `web/components/auth/SecuritySettings.tsx:38`<br>SecuritySettings | `setDisabling(false)` |
| CX-I-2323 | `web/components/auth/SecuritySettings.tsx:38`<br>SecuritySettings | `setCode("")` |
| CX-I-2324 | `web/components/auth/SecuritySettings.tsx:38`<br>SecuritySettings | `setError("")` |
| CX-I-2325 | `web/components/auth/SecuritySettings.tsx:39`<br>SecuritySettings | `setDisabling(true)` |

#### web/components/box/BoxList.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2326 | `web/components/box/BoxList.tsx:35`<br>interleave | `groups.set(box.category, [...(groups.get(box.category) ?? []), box])` |
| CX-I-2327 | `web/components/box/BoxList.tsx:55`<br>useMemo@53 | `lastOpened.set(item.boxSlug, Math.max(lastOpened.get(item.boxSlug) ?? 0, Date.parse(item.acquiredAt) &#124;&#124; 0))` |
| CX-I-2328 | `web/components/box/BoxList.tsx:85`<br>BoxList | `setQuery(e.target.value)` |
| CX-I-2329 | `web/components/box/BoxList.tsx:102`<br>BoxList | `setCategory(key)` |
| CX-I-2330 | `web/components/box/BoxList.tsx:102`<br>BoxList | `setShown(PAGE)` |
| CX-I-2331 | `web/components/box/BoxList.tsx:106`<br>BoxList | `setShown((n) => n + PAGE)` |

#### web/components/box/BoxReviews.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2332 | `web/components/box/BoxReviews.tsx:126`<br>useEffect@126 | `setCut(el.scrollHeight > el.clientHeight + 1)` |
| CX-I-2333 | `web/components/box/BoxReviews.tsx:194`<br>BoxReviews | `setOpen(null)` |

#### web/components/box/BoxScreen.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2334 | `web/components/box/BoxScreen.tsx:117`<br>useEffect@117 | `send(unseen ? "FOUND_COMMITTED" : "RESET_RECOVERY")` |
| CX-I-2335 | `web/components/box/BoxScreen.tsx:133`<br>recover | `useOpeningJournal.getState().markSeen(unseen.id)` |
| CX-I-2336 | `web/components/box/BoxScreen.tsx:134`<br>recover | `send("RECOVER")` |
| CX-I-2337 | `web/components/box/BoxScreen.tsx:137`<br>recover | `setOpened((prev) => ({ id: unseen.id, results, cost: paid ? Math.abs(paid.amountUsdt) : +(box.price * results.length).toFixed(2), round: (prev?.round ?? 0) + 1, recovered: true, taken, shipped }))` |
| CX-I-2338 | `web/components/box/BoxScreen.tsx:144`<br>open | `setBusy(true)` |
| CX-I-2339 | `web/components/box/BoxScreen.tsx:144`<br>open | `setFailed(false)` |
| CX-I-2340 | `web/components/box/BoxScreen.tsx:144`<br>open | `setConfirming(false)` |
| CX-I-2341 | `web/components/box/BoxScreen.tsx:145`<br>open | `send(confirmed ? "CONFIRM" : "PRESS")` |
| CX-I-2342 | `web/components/box/BoxScreen.tsx:151`<br>open | `send("PURCHASE_OK")` |
| CX-I-2343 | `web/components/box/BoxScreen.tsx:151`<br>open | `send("ANIMATION_START")` |
| CX-I-2344 | `web/components/box/BoxScreen.tsx:152`<br>open | `setOpened((prev) => ({ id, results, cost, round: (prev?.round ?? 0) + 1 }))` |
| CX-I-2345 | `web/components/box/BoxScreen.tsx:155`<br>open | `send("SHORT")` |
| CX-I-2346 | `web/components/box/BoxScreen.tsx:155`<br>open | `send("RESET")` |
| CX-I-2347 | `web/components/box/BoxScreen.tsx:156`<br>open | `send("PURCHASE_ERROR")` |
| CX-I-2348 | `web/components/box/BoxScreen.tsx:156`<br>open | `send("RETRY")` |
| CX-I-2349 | `web/components/box/BoxScreen.tsx:156`<br>open | `setFailed(true)` |
| CX-I-2350 | `web/components/box/BoxScreen.tsx:157`<br>open | `setBusy(false)` |
| CX-I-2351 | `web/components/box/BoxScreen.tsx:164`<br>press | `send("NEEDS_CONFIRM")` |
| CX-I-2352 | `web/components/box/BoxScreen.tsx:164`<br>press | `setConfirming(true)` |
| CX-I-2353 | `web/components/box/BoxScreen.tsx:166`<br>cancelConfirm | `send("CANCEL")` |
| CX-I-2354 | `web/components/box/BoxScreen.tsx:166`<br>cancelConfirm | `setConfirming(false)` |
| CX-I-2355 | `web/components/box/BoxScreen.tsx:168`<br>revealed | `useOpeningJournal.getState().markSeen(opened.id)` |
| CX-I-2356 | `web/components/box/BoxScreen.tsx:168`<br>revealed | `send("ANIMATION_END")` |
| CX-I-2357 | `web/components/box/BoxScreen.tsx:168`<br>revealed | `send("SETTLE_START")` |
| CX-I-2358 | `web/components/box/BoxScreen.tsx:168`<br>revealed | `send("SETTLE_OK")` |
| CX-I-2359 | `web/components/box/BoxScreen.tsx:170`<br>closeOpening | `setOpened(null)` |
| CX-I-2360 | `web/components/box/BoxScreen.tsx:170`<br>closeOpening | `send("RESET")` |
| CX-I-2361 | `web/components/box/BoxScreen.tsx:203`<br>BoxScreen | `setQty(n)` |
| CX-I-2362 | `web/components/box/BoxScreen.tsx:203`<br>BoxScreen | `setFailed(false)` |
| CX-I-2363 | `web/components/box/BoxScreen.tsx:207`<br>BoxScreen | `setTakingHeld(true)` |
| CX-I-2364 | `web/components/box/BoxScreen.tsx:208`<br>BoxScreen | `setTakingHeld(true)` |
| CX-I-2365 | `web/components/box/BoxScreen.tsx:223`<br>g.items.filter((i) => i.image.src).map@223 | `setItemId(item.id)` |
| CX-I-2366 | `web/components/box/BoxScreen.tsx:230`<br>g.items.filter((i) => ¬i.image.src).map@228 | `setItemId(item.id)` |
| CX-I-2367 | `web/components/box/BoxScreen.tsx:264`<br>table.map@262 | `setItemId(item.id)` |
| CX-I-2368 | `web/components/box/BoxScreen.tsx:281`<br>BoxScreen | `setItemId(null)` |
| CX-I-2369 | `web/components/box/BoxScreen.tsx:281`<br>BoxScreen | `setComparing(false)` |
| CX-I-2370 | `web/components/box/BoxScreen.tsx:281`<br>BoxScreen | `setCountries(false)` |
| CX-I-2371 | `web/components/box/BoxScreen.tsx:296`<br>BoxScreen | `setCountries((v) => ¬v)` |
| CX-I-2372 | `web/components/box/BoxScreen.tsx:300`<br>BoxScreen | `setComparing(true)` |
| CX-I-2373 | `web/components/box/BoxScreen.tsx:318`<br>BoxScreen | `setTakingHeld(false)` |
| CX-I-2374 | `web/components/box/BoxScreen.tsx:320`<br>BoxScreen | `send("SKIP")` |

#### web/components/box/DetailModal.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2375 | `web/components/box/DetailModal.tsx:138`<br>useEffect@136 | `setQty(1)` |
| CX-I-2376 | `web/components/box/DetailModal.tsx:139`<br>useEffect@136 | `setConfirming(false)` |
| CX-I-2377 | `web/components/box/DetailModal.tsx:140`<br>useEffect@136 | `setAutoOpen(false)` |
| CX-I-2378 | `web/components/box/DetailModal.tsx:206`<br>OPEN_PRESETS.map@205 | `setQty(n)` |
| CX-I-2379 | `web/components/box/DetailModal.tsx:206`<br>OPEN_PRESETS.map@205 | `setConfirming(false)` |
| CX-I-2380 | `web/components/box/DetailModal.tsx:222`<br>DetailModal | `setConfirming(false)` |
| CX-I-2381 | `web/components/box/DetailModal.tsx:227`<br>DetailModal | `setConfirming(true)` |
| CX-I-2382 | `web/components/box/DetailModal.tsx:236`<br>DetailModal | `setAutoOpen(true)` |
| CX-I-2383 | `web/components/box/DetailModal.tsx:284`<br>DetailModal | `setAutoOpen(false)` |
| CX-I-2384 | `web/components/box/DetailModal.tsx:284`<br>DetailModal | `setAutoCfg(config)` |
| CX-I-2385 | `web/components/box/DetailModal.tsx:284`<br>DetailModal | `setAutoOpen(false)` |

#### web/components/box/Opening.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2386 | `web/components/box/Opening.tsx:122`<br>useCallback@122 | `setPhase((p) => (p === "reveal" &#124;&#124; p === "ready" ? p : "reveal"))` |
| CX-I-2387 | `web/components/box/Opening.tsx:129`<br>useEffect@127 | `setPhase("reveal")` |
| CX-I-2388 | `web/components/box/Opening.tsx:131`<br>window.setTimeout@131 | `setPhase((p) => (p === "anticipation" ? "impact" : p))` |
| CX-I-2389 | `web/components/box/Opening.tsx:132`<br>window.setTimeout@132 | `setPhase((p) => (p === "impact" ? "exit" : p))` |
| CX-I-2390 | `web/components/box/Opening.tsx:133`<br>window.setTimeout@133 | `setPhase((p) => (p === "exit" ? "reveal" : p))` |
| CX-I-2391 | `web/components/box/Opening.tsx:150`<br>window.setTimeout@150 | `setPhase("ready")` |
| CX-I-2392 | `web/components/box/Opening.tsx:155`<br>useCallback@154 | `setSettle("settling")` |
| CX-I-2393 | `web/components/box/Opening.tsx:163`<br>useCallback@154 | `setTaken(out.amountUsdt)` |
| CX-I-2394 | `web/components/box/Opening.tsx:163`<br>useCallback@154 | `setAutoTaken(auto)` |
| CX-I-2395 | `web/components/box/Opening.tsx:163`<br>useCallback@154 | `setSettle("settled")` |
| CX-I-2396 | `web/components/box/Opening.tsx:164`<br>useCallback@154 | `setSettle(out.status)` |
| CX-I-2397 | `web/components/box/Opening.tsx:176`<br>verify | `setVerifying({ itemId: item.id, fair: { serverSeed: result.serverSeed, serverSeedHash: result.serverSeedHash, clientSeed: result.clientSeed, nonce: result.nonce, roll: result.roll, dropTable: table.map(({ id, dropRate }) => ({ id, dropRate })) } })` |
| CX-I-2398 | `web/components/box/Opening.tsx:196`<br>confirmTake | `setAsking(false)` |
| CX-I-2399 | `web/components/box/Opening.tsx:213`<br>Opening | `setSettings(true)` |
| CX-I-2400 | `web/components/box/Opening.tsx:284`<br>Opening | `setHeldTaking(true)` |
| CX-I-2401 | `web/components/box/Opening.tsx:293`<br>Opening | `setHeldTaking(true)` |
| CX-I-2402 | `web/components/box/Opening.tsx:311`<br>Opening | `setAsking(true)` |
| CX-I-2403 | `web/components/box/Opening.tsx:322`<br>Opening | `setAsking(false)` |
| CX-I-2404 | `web/components/box/Opening.tsx:324`<br>Opening | `setHeldTaking(false)` |
| CX-I-2405 | `web/components/box/Opening.tsx:325`<br>Opening | `setSettings(false)` |
| CX-I-2406 | `web/components/box/Opening.tsx:326`<br>Opening | `setVerifying(null)` |
| CX-I-2407 | `web/components/box/Opening.tsx:348`<br>toggle@348 | `setAsking(true)` |
| CX-I-2408 | `web/components/box/Opening.tsx:348`<br>toggle@348 | `s.setAutoTake(accountId, false)` |
| CX-I-2409 | `web/components/box/Opening.tsx:352`<br>OpeningSettings | `setAsking(false)` |
| CX-I-2410 | `web/components/box/Opening.tsx:352`<br>OpeningSettings | `s.setAutoTake(accountId, true)` |
| CX-I-2411 | `web/components/box/Opening.tsx:352`<br>OpeningSettings | `setAsking(false)` |

#### web/components/box/ProductArt.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2412 | `web/components/box/ProductArt.tsx:133`<br>useCallback@130 | `setFailedSrc(image.src)` |
| CX-I-2413 | `web/components/box/ProductArt.tsx:163`<br>ProductArt | `setFailedSrc(image.src)` |

#### web/components/box/Reveal.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2414 | `web/components/box/Reveal.tsx:70`<br>skip | `setDone(true)` |
| CX-I-2415 | `web/components/box/Reveal.tsx:78`<br>window.setTimeout@78 | `setArmed(true)` |
| CX-I-2416 | `web/components/box/Reveal.tsx:84`<br>useEffect@82 | `setDone(true)` |
| CX-I-2417 | `web/components/box/Reveal.tsx:86`<br>window.setTimeout@86 | `setStage("impact")` |
| CX-I-2418 | `web/components/box/Reveal.tsx:87`<br>window.setTimeout@87 | `setStage("exit")` |
| CX-I-2419 | `web/components/box/Reveal.tsx:88`<br>window.setTimeout@88 | `setDone(true)` |
| CX-I-2420 | `web/components/box/Reveal.tsx:123`<br>verify | `setVerifying({ itemId: r.item.id, fair: { serverSeed: r.serverSeed, serverSeedHash: r.serverSeedHash, clientSeed: r.clientSeed, nonce: r.nonce, roll: r.roll, dropTable: table.map(({ id, dropRate }) => ({ id, dropRate })) } })` |
| CX-I-2421 | `web/components/box/Reveal.tsx:126`<br>pick | `setTakeNote(null)` |
| CX-I-2422 | `web/components/box/Reveal.tsx:126`<br>pick | `setPicked(r)` |
| CX-I-2423 | `web/components/box/Reveal.tsx:129`<br>take | `setTaking(null)` |
| CX-I-2424 | `web/components/box/Reveal.tsx:129`<br>take | `setTakeNote(null)` |
| CX-I-2425 | `web/components/box/Reveal.tsx:132`<br>take | `setTaken((m) => ({ ...m, [target.ownedId]: out.amountUsdt }))` |
| CX-I-2426 | `web/components/box/Reveal.tsx:132`<br>take | `setPicked(null)` |
| CX-I-2427 | `web/components/box/Reveal.tsx:133`<br>take | `setTakeNote(out.status === "failed" ? "failed" : "unknown")` |
| CX-I-2428 | `web/components/box/Reveal.tsx:142`<br>batchTaken | `setTaken((m) => { const next = { ...m }; for (const x of [...out.already, ...out.taken]) next[x.id] = x.amountUsdt; return next; })` |
| CX-I-2429 | `web/components/box/Reveal.tsx:149`<br>Reveal | `setBatch("held")` |
| CX-I-2430 | `web/components/box/Reveal.tsx:155`<br>Reveal | `setBatch("held")` |
| CX-I-2431 | `web/components/box/Reveal.tsx:163`<br>actionsFor | `setTaking(r)` |
| CX-I-2432 | `web/components/box/Reveal.tsx:266`<br>Reveal | `setBatch("fresh")` |
| CX-I-2433 | `web/components/box/Reveal.tsx:297`<br>Reveal | `setVerifying(null)` |
| CX-I-2434 | `web/components/box/Reveal.tsx:299`<br>Reveal | `setBatch(null)` |
| CX-I-2435 | `web/components/box/Reveal.tsx:301`<br>Reveal | `setTaking(null)` |

#### web/components/box/ReviewsScreen.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2436 | `web/components/box/ReviewsScreen.tsx:42`<br>ReviewsScreen | `setOpen(null)` |

#### web/components/box/WinsScreen.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2437 | `web/components/box/WinsScreen.tsx:51`<br>verify | `setVerifying({ ownedId: detail.record.id, itemId: detail.record.itemId, fair: detail.record.fair })` |
| CX-I-2438 | `web/components/box/WinsScreen.tsx:51`<br>verify | `setDetailId(null)` |
| CX-I-2439 | `web/components/box/WinsScreen.tsx:74`<br>rows.slice(0, shown).map@69 | `setDetailId(r.id)` |
| CX-I-2440 | `web/components/box/WinsScreen.tsx:88`<br>WinsScreen | `setShown((n) => n + WINS_PAGE)` |
| CX-I-2441 | `web/components/box/WinsScreen.tsx:94`<br>WinsScreen | `setDetailId(null)` |
| CX-I-2442 | `web/components/box/WinsScreen.tsx:114`<br>WinsScreen | `setVerifying(null)` |

#### web/components/community/BoardComposer.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2443 | `web/components/community/BoardComposer.tsx:27`<br>addImages | `setDraft(current => ({ ...current, images: [...(current.images ?? []), ...images] }))` |
| CX-I-2444 | `web/components/community/BoardComposer.tsx:27`<br>addImages | `setValidation("")` |
| CX-I-2445 | `web/components/community/BoardComposer.tsx:28`<br>addImages | `setValidation("이미지는 JPG, PNG, WebP 형식의 안전한 파일만 최대 3장까지 첨부할 수 있습니다.")` |
| CX-I-2446 | `web/components/community/BoardComposer.tsx:36`<br>useEffect@34 | `sessionStorage.setItem(key, JSON.stringify(draft))` |
| CX-I-2447 | `web/components/community/BoardComposer.tsx:36`<br>useEffect@34 | `setDraftStatus("작성 중인 내용이 임시 저장되었습니다.")` |
| CX-I-2448 | `web/components/community/BoardComposer.tsx:37`<br>useEffect@34 | `setDraftStatus("임시 저장 공간이 부족합니다. 닫기 전에 내용을 복사해 주세요.")` |
| CX-I-2449 | `web/components/community/BoardComposer.tsx:46`<br>BoardComposer | `setValidation("제목은 2~100자, 본문은 5~10,000자로 입력해 주세요. 공지사항은 운영자만 작성할 수 있습니다.")` |
| CX-I-2450 | `web/components/community/BoardComposer.tsx:47`<br>BoardComposer | `setValidation("")` |
| CX-I-2451 | `web/components/community/BoardComposer.tsx:49`<br>BoardComposer | `setDraft({ ...draft, category: e.target.value as BoardDraft["category"], pinned: false })` |
| CX-I-2452 | `web/components/community/BoardComposer.tsx:50`<br>BoardComposer | `setDraft({ ...draft, pinned: e.target.checked })` |
| CX-I-2453 | `web/components/community/BoardComposer.tsx:51`<br>BoardComposer | `setDraft({ ...draft, title: e.target.value })` |
| CX-I-2454 | `web/components/community/BoardComposer.tsx:52`<br>BoardComposer | `setDraft({ ...draft, body: e.target.value })` |
| CX-I-2455 | `web/components/community/BoardComposer.tsx:53`<br>draft.images?.map@53 | `setDraft(current => ({ ...current, images: current.images?.filter((_, i) => i ¬== index) }))` |
| CX-I-2456 | `web/components/community/BoardComposer.tsx:55`<br>BoardComposer | `setDiscard(true)` |
| CX-I-2457 | `web/components/community/BoardComposer.tsx:56`<br>BoardComposer | `setDiscard(false)` |
| CX-I-2458 | `web/components/community/BoardComposer.tsx:56`<br>BoardComposer | `setDraftStatus("임시 글을 삭제하지 못했습니다. 다시 시도해 주세요.")` |

#### web/components/community/CommunityBoard.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2459 | `web/components/community/CommunityBoard.tsx:44`<br>useCallback@42 | `setLoading(true)` |
| CX-I-2460 | `web/components/community/CommunityBoard.tsx:45`<br>useCallback@42 | `setSnapshot(data)` |
| CX-I-2461 | `web/components/community/CommunityBoard.tsx:45`<br>useCallback@42 | `setError("")` |
| CX-I-2462 | `web/components/community/CommunityBoard.tsx:46`<br>useCallback@42 | `setError(errorMessage(e))` |
| CX-I-2463 | `web/components/community/CommunityBoard.tsx:47`<br>useCallback@42 | `setLoading(false)` |
| CX-I-2464 | `web/components/community/CommunityBoard.tsx:50`<br>useEffect@49 | `setComposer(current => current?.ownerId === user?.id ? current : null)` |
| CX-I-2465 | `web/components/community/CommunityBoard.tsx:50`<br>useEffect@49 | `setComment("")` |
| CX-I-2466 | `web/components/community/CommunityBoard.tsx:50`<br>useEffect@49 | `setEditComment(null)` |
| CX-I-2467 | `web/components/community/CommunityBoard.tsx:50`<br>useEffect@49 | `setConfirm(null)` |
| CX-I-2468 | `web/components/community/CommunityBoard.tsx:50`<br>useEffect@49 | `setSnapshot(s => ({ ...s, canPublishNotice: false }))` |
| CX-I-2469 | `web/components/community/CommunityBoard.tsx:57`<br>useEffect@57 | `setCategory(params.get("category") === "notice" ? "notice" : "all")` |
| CX-I-2470 | `web/components/community/CommunityBoard.tsx:57`<br>useEffect@57 | `setSelectedId(params.get("post"))` |
| CX-I-2471 | `web/components/community/CommunityBoard.tsx:58`<br>useEffect@58 | `setShown(15)` |
| CX-I-2472 | `web/components/community/CommunityBoard.tsx:59`<br>useEffect@59 | `setComment("")` |
| CX-I-2473 | `web/components/community/CommunityBoard.tsx:59`<br>useEffect@59 | `setEditComment(null)` |
| CX-I-2474 | `web/components/community/CommunityBoard.tsx:59`<br>useEffect@59 | `setConfirm(null)` |
| CX-I-2475 | `web/components/community/CommunityBoard.tsx:60`<br>setTimeout@60 | `setToast("")` |
| CX-I-2476 | `web/components/community/CommunityBoard.tsx:62`<br>select | `setSelectedId(id)` |
| CX-I-2477 | `web/components/community/CommunityBoard.tsx:62`<br>select | `setError("")` |
| CX-I-2478 | `web/components/community/CommunityBoard.tsx:63`<br>select | `url.searchParams.set("post", id)` |
| CX-I-2479 | `web/components/community/CommunityBoard.tsx:69`<br>mutate | `setBusy(true)` |
| CX-I-2480 | `web/components/community/CommunityBoard.tsx:69`<br>mutate | `setError("")` |
| CX-I-2481 | `web/components/community/CommunityBoard.tsx:73`<br>mutate | `setSnapshot(result)` |
| CX-I-2482 | `web/components/community/CommunityBoard.tsx:74`<br>mutate | `setToast(command.type === "delete" &#124;&#124; command.type === "deleteComment" ? "삭제되었습니다." : "저장되었습니다.")` |
| CX-I-2483 | `web/components/community/CommunityBoard.tsx:74`<br>mutate | `setConfirm(null)` |
| CX-I-2484 | `web/components/community/CommunityBoard.tsx:75`<br>mutate | `setError(errorMessage(e))` |
| CX-I-2485 | `web/components/community/CommunityBoard.tsx:76`<br>mutate | `setBusy(false)` |
| CX-I-2486 | `web/components/community/CommunityBoard.tsx:76`<br>mutate | `setLoading(false)` |
| CX-I-2487 | `web/components/community/CommunityBoard.tsx:81`<br>CommunityBoard | `setError("")` |
| CX-I-2488 | `web/components/community/CommunityBoard.tsx:81`<br>CommunityBoard | `setComposer({ ownerId: user¬.id })` |
| CX-I-2489 | `web/components/community/CommunityBoard.tsx:83`<br>CommunityBoard | `setShowExamples(value => ¬value)` |
| CX-I-2490 | `web/components/community/CommunityBoard.tsx:88`<br>CommunityBoard | `setToast("게시글 링크가 복사되었습니다.")` |
| CX-I-2491 | `web/components/community/CommunityBoard.tsx:88`<br>CommunityBoard | `setError("주소 표시줄의 링크를 복사해 주세요.")` |
| CX-I-2492 | `web/components/community/CommunityBoard.tsx:88`<br>CommunityBoard | `setError("")` |
| CX-I-2493 | `web/components/community/CommunityBoard.tsx:88`<br>CommunityBoard | `setComposer({ ownerId: user¬.id, editing: selected })` |
| CX-I-2494 | `web/components/community/CommunityBoard.tsx:88`<br>CommunityBoard | `setConfirm("post")` |
| CX-I-2495 | `web/components/community/CommunityBoard.tsx:89`<br>CommunityBoard | `setConfirm(null)` |
| CX-I-2496 | `web/components/community/CommunityBoard.tsx:93`<br>selected.comments.map@93 | `setEditComment(c.id)` |
| CX-I-2497 | `web/components/community/CommunityBoard.tsx:93`<br>selected.comments.map@93 | `setComment(c.body)` |
| CX-I-2498 | `web/components/community/CommunityBoard.tsx:93`<br>selected.comments.map@93 | `setConfirm(c.id)` |
| CX-I-2499 | `web/components/community/CommunityBoard.tsx:93`<br>selected.comments.map@93 | `setConfirm(null)` |
| CX-I-2500 | `web/components/community/CommunityBoard.tsx:94`<br>CommunityBoard | `setComment("")` |
| CX-I-2501 | `web/components/community/CommunityBoard.tsx:94`<br>CommunityBoard | `setEditComment(null)` |
| CX-I-2502 | `web/components/community/CommunityBoard.tsx:94`<br>CommunityBoard | `setComment(e.target.value)` |
| CX-I-2503 | `web/components/community/CommunityBoard.tsx:94`<br>CommunityBoard | `setEditComment(null)` |
| CX-I-2504 | `web/components/community/CommunityBoard.tsx:94`<br>CommunityBoard | `setComment("")` |
| CX-I-2505 | `web/components/community/CommunityBoard.tsx:97`<br>CommunityBoard | `setQuery(e.target.value)` |
| CX-I-2506 | `web/components/community/CommunityBoard.tsx:97`<br>CommunityBoard | `setSort(e.target.value)` |
| CX-I-2507 | `web/components/community/CommunityBoard.tsx:98`<br>[["all", "전체"], ...Object.entries(CATEGORY_LABELS)].map@98 | `setCategory(k)` |
| CX-I-2508 | `web/components/community/CommunityBoard.tsx:98`<br>CommunityBoard | `setMine(¬mine)` |
| CX-I-2509 | `web/components/community/CommunityBoard.tsx:100`<br>CommunityBoard | `setQuery("")` |
| CX-I-2510 | `web/components/community/CommunityBoard.tsx:100`<br>CommunityBoard | `setMine(false)` |
| CX-I-2511 | `web/components/community/CommunityBoard.tsx:100`<br>CommunityBoard | `setCategory("all")` |
| CX-I-2512 | `web/components/community/CommunityBoard.tsx:101`<br>CommunityBoard | `setShown(n => n + 15)` |
| CX-I-2513 | `web/components/community/CommunityBoard.tsx:102`<br>CommunityBoard | `setCategory("notice")` |
| CX-I-2514 | `web/components/community/CommunityBoard.tsx:102`<br>CommunityBoard | `setQuery("")` |
| CX-I-2515 | `web/components/community/CommunityBoard.tsx:102`<br>CommunityBoard | `setMine(false)` |
| CX-I-2516 | `web/components/community/CommunityBoard.tsx:103`<br>CommunityBoard | `setComposer(null)` |
| CX-I-2517 | `web/components/community/CommunityBoard.tsx:103`<br>CommunityBoard | `setComposer(null)` |
| CX-I-2518 | `web/components/community/CommunityBoard.tsx:103`<br>CommunityBoard | `setCategory(draft.category)` |
| CX-I-2519 | `web/components/community/CommunityBoard.tsx:103`<br>CommunityBoard | `setMine(false)` |
| CX-I-2520 | `web/components/community/CommunityBoard.tsx:103`<br>CommunityBoard | `setQuery("")` |
| CX-I-2521 | `web/components/community/CommunityBoard.tsx:103`<br>CommunityBoard | `setSort("newest")` |

#### web/components/community/ReviewFormModal.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2522 | `web/components/community/ReviewFormModal.tsx:54`<br>useEffect@50 | `setOwnedId(editing?.ownedId ?? selected?.id ?? "")` |
| CX-I-2523 | `web/components/community/ReviewFormModal.tsx:55`<br>useEffect@50 | `setText(editing?.text ?? "")` |
| CX-I-2524 | `web/components/community/ReviewFormModal.tsx:55`<br>useEffect@50 | `setRating(editing?.rating ?? 0)` |
| CX-I-2525 | `web/components/community/ReviewFormModal.tsx:55`<br>useEffect@50 | `setPhoto(editing?.photo)` |
| CX-I-2526 | `web/components/community/ReviewFormModal.tsx:55`<br>useEffect@50 | `setError("")` |
| CX-I-2527 | `web/components/community/ReviewFormModal.tsx:55`<br>useEffect@50 | `setBusy(false)` |
| CX-I-2528 | `web/components/community/ReviewFormModal.tsx:60`<br>onFile | `setBusy(true)` |
| CX-I-2529 | `web/components/community/ReviewFormModal.tsx:60`<br>onFile | `setError("")` |
| CX-I-2530 | `web/components/community/ReviewFormModal.tsx:61`<br>onFile | `setPhoto(result)` |
| CX-I-2531 | `web/components/community/ReviewFormModal.tsx:62`<br>onFile | `setError("photoError")` |
| CX-I-2532 | `web/components/community/ReviewFormModal.tsx:63`<br>onFile | `setBusy(false)` |
| CX-I-2533 | `web/components/community/ReviewFormModal.tsx:67`<br>submit | `setError("textError")` |
| CX-I-2534 | `web/components/community/ReviewFormModal.tsx:68`<br>submit | `setError("textError")` |
| CX-I-2535 | `web/components/community/ReviewFormModal.tsx:69`<br>submit | `setError("ratingError")` |
| CX-I-2536 | `web/components/community/ReviewFormModal.tsx:70`<br>submit | `setBusy(true)` |
| CX-I-2537 | `web/components/community/ReviewFormModal.tsx:75`<br>submit | `useCommunityStore.getState().update(editing.id, { text: text.trim(), rating, photo })` |
| CX-I-2538 | `web/components/community/ReviewFormModal.tsx:79`<br>submit | `setError("eligibilityError")` |
| CX-I-2539 | `web/components/community/ReviewFormModal.tsx:80`<br>submit | `useCommunityStore.getState().add({ ownedId, boxSlug: item.boxSlug, itemId: item.itemId, text: text.trim(), rating, photo, bonusUsdt: 0 })` |
| CX-I-2540 | `web/components/community/ReviewFormModal.tsx:85`<br>submit | `useCommunityStore.getState().remove(createdId)` |
| CX-I-2541 | `web/components/community/ReviewFormModal.tsx:85`<br>submit | `setError("storageError")` |
| CX-I-2542 | `web/components/community/ReviewFormModal.tsx:86`<br>submit | `setBusy(false)` |
| CX-I-2543 | `web/components/community/ReviewFormModal.tsx:95`<br>ReviewFormModal | `setOwnedId(e.target.value)` |
| CX-I-2544 | `web/components/community/ReviewFormModal.tsx:96`<br>[1, 2, 3, 4, 5].map@96 | `setRating(n)` |
| CX-I-2545 | `web/components/community/ReviewFormModal.tsx:97`<br>ReviewFormModal | `setText(e.target.value)` |
| CX-I-2546 | `web/components/community/ReviewFormModal.tsx:98`<br>ReviewFormModal | `setPhoto(undefined)` |
| CX-I-2547 | `web/components/community/ReviewFormModal.tsx:98`<br>ReviewFormModal | `setBusy(false)` |

#### web/components/dev/Gallery.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2548 | `web/components/dev/Gallery.tsx:105`<br>Gallery | `setSheet(true)` |
| CX-I-2549 | `web/components/dev/Gallery.tsx:111`<br>Gallery | `setVerify(true)` |
| CX-I-2550 | `web/components/dev/Gallery.tsx:112`<br>Gallery | `setShip(true)` |
| CX-I-2551 | `web/components/dev/Gallery.tsx:116`<br>Gallery | `setConfirm("open")` |
| CX-I-2552 | `web/components/dev/Gallery.tsx:117`<br>Gallery | `setConfirm("take")` |
| CX-I-2553 | `web/components/dev/Gallery.tsx:118`<br>Gallery | `setConfirm("ship")` |
| CX-I-2554 | `web/components/dev/Gallery.tsx:119`<br>Gallery | `setConfirm("cancel")` |
| CX-I-2555 | `web/components/dev/Gallery.tsx:123`<br>Gallery | `setReveal("cash")` |
| CX-I-2556 | `web/components/dev/Gallery.tsx:124`<br>Gallery | `setReveal("item")` |
| CX-I-2557 | `web/components/dev/Gallery.tsx:125`<br>Gallery | `setReveal("multi")` |
| CX-I-2558 | `web/components/dev/Gallery.tsx:128`<br>Gallery | `setSheet(false)` |
| CX-I-2559 | `web/components/dev/Gallery.tsx:130`<br>Gallery | `setSheet(false)` |
| CX-I-2560 | `web/components/dev/Gallery.tsx:131`<br>Gallery | `setSheet(false)` |
| CX-I-2561 | `web/components/dev/Gallery.tsx:133`<br>Gallery | `setConfirm(null)` |
| CX-I-2562 | `web/components/dev/Gallery.tsx:133`<br>Gallery | `setConfirm(null)` |
| CX-I-2563 | `web/components/dev/Gallery.tsx:134`<br>Gallery | `setConfirm(null)` |
| CX-I-2564 | `web/components/dev/Gallery.tsx:134`<br>Gallery | `setConfirm(null)` |
| CX-I-2565 | `web/components/dev/Gallery.tsx:135`<br>Gallery | `setConfirm(null)` |
| CX-I-2566 | `web/components/dev/Gallery.tsx:135`<br>Gallery | `setConfirm(null)` |
| CX-I-2567 | `web/components/dev/Gallery.tsx:136`<br>Gallery | `setConfirm(null)` |
| CX-I-2568 | `web/components/dev/Gallery.tsx:136`<br>Gallery | `setConfirm(null)` |
| CX-I-2569 | `web/components/dev/Gallery.tsx:137`<br>Gallery | `setVerify(false)` |
| CX-I-2570 | `web/components/dev/Gallery.tsx:138`<br>Gallery | `setShip(false)` |
| CX-I-2571 | `web/components/dev/Gallery.tsx:138`<br>Gallery | `setShip(false)` |
| CX-I-2572 | `web/components/dev/Gallery.tsx:139`<br>Gallery | `setReveal(null)` |
| CX-I-2573 | `web/components/dev/Gallery.tsx:139`<br>Gallery | `setReveal(null)` |

#### web/components/fairness/FairnessVerifier.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2574 | `web/components/fairness/FairnessVerifier.tsx:70`<br>useEffect@70 | `setResult(null)` |
| CX-I-2575 | `web/components/fairness/FairnessVerifier.tsx:70`<br>useEffect@70 | `setError(null)` |
| CX-I-2576 | `web/components/fairness/FairnessVerifier.tsx:75`<br>useCallback@72 | `setError(t("invalidInput"))` |
| CX-I-2577 | `web/components/fairness/FairnessVerifier.tsx:76`<br>useCallback@72 | `setResult(null)` |
| CX-I-2578 | `web/components/fairness/FairnessVerifier.tsx:79`<br>useCallback@72 | `setBusy(true)` |
| CX-I-2579 | `web/components/fairness/FairnessVerifier.tsx:80`<br>useCallback@72 | `setError(null)` |
| CX-I-2580 | `web/components/fairness/FairnessVerifier.tsx:89`<br>useCallback@72 | `setResult(out)` |
| CX-I-2581 | `web/components/fairness/FairnessVerifier.tsx:91`<br>useCallback@72 | `setResult(null)` |
| CX-I-2582 | `web/components/fairness/FairnessVerifier.tsx:92`<br>useCallback@72 | `setError(t("computeError"))` |
| CX-I-2583 | `web/components/fairness/FairnessVerifier.tsx:94`<br>useCallback@72 | `setBusy(false)` |
| CX-I-2584 | `web/components/fairness/FairnessVerifier.tsx:99`<br>clear | `setServerSeed("")` |
| CX-I-2585 | `web/components/fairness/FairnessVerifier.tsx:100`<br>clear | `setServerSeedHash("")` |
| CX-I-2586 | `web/components/fairness/FairnessVerifier.tsx:101`<br>clear | `setClientSeed("")` |
| CX-I-2587 | `web/components/fairness/FairnessVerifier.tsx:102`<br>clear | `setNonce("0")` |
| CX-I-2588 | `web/components/fairness/FairnessVerifier.tsx:103`<br>clear | `setResult(null)` |
| CX-I-2589 | `web/components/fairness/FairnessVerifier.tsx:104`<br>clear | `setError(null)` |
| CX-I-2590 | `web/components/fairness/FairnessVerifier.tsx:109`<br>generate | `setDemoSeed(s)` |
| CX-I-2591 | `web/components/fairness/FairnessVerifier.tsx:110`<br>generate | `setDemoHash(await hashServerSeed(s))` |
| CX-I-2592 | `web/components/fairness/FairnessVerifier.tsx:111`<br>generate | `setRevealed(false)` |
| CX-I-2593 | `web/components/fairness/FairnessVerifier.tsx:116`<br>useDemo | `setServerSeed(demoSeed)` |
| CX-I-2594 | `web/components/fairness/FairnessVerifier.tsx:117`<br>useDemo | `setServerSeedHash(demoHash)` |
| CX-I-2595 | `web/components/fairness/FairnessVerifier.tsx:118`<br>useDemo | `setClientSeed(generateClientSeed())` |
| CX-I-2596 | `web/components/fairness/FairnessVerifier.tsx:130`<br>FairnessVerifier | `setBoxSlug(e.target.value)` |
| CX-I-2597 | `web/components/fairness/FairnessVerifier.tsx:139`<br>FairnessVerifier | `setServerSeed(e.target.value)` |
| CX-I-2598 | `web/components/fairness/FairnessVerifier.tsx:142`<br>FairnessVerifier | `setServerSeedHash(e.target.value)` |
| CX-I-2599 | `web/components/fairness/FairnessVerifier.tsx:148`<br>FairnessVerifier | `setClientSeed(e.target.value)` |
| CX-I-2600 | `web/components/fairness/FairnessVerifier.tsx:149`<br>FairnessVerifier | `setClientSeed(generateClientSeed())` |
| CX-I-2601 | `web/components/fairness/FairnessVerifier.tsx:156`<br>FairnessVerifier | `setNonce(e.target.value)` |
| CX-I-2602 | `web/components/fairness/FairnessVerifier.tsx:218`<br>generate().catch@218 | `setError(t("computeError"))` |
| CX-I-2603 | `web/components/fairness/FairnessVerifier.tsx:239`<br>FairnessVerifier | `setRevealed(true)` |

#### web/components/fairness/HashExplainer.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2604 | `web/components/fairness/HashExplainer.tsx:16`<br>useEffect@16 | `setReady(true)` |
| CX-I-2605 | `web/components/fairness/HashExplainer.tsx:19`<br>useEffect@17 | `setHash("")` |
| CX-I-2606 | `web/components/fairness/HashExplainer.tsx:20`<br>useEffect@17 | `setFailed(false)` |
| CX-I-2607 | `web/components/fairness/HashExplainer.tsx:21`<br>hashServerSeed(value).then@21 | `setHash(digest)` |
| CX-I-2608 | `web/components/fairness/HashExplainer.tsx:21`<br>hashServerSeed(value).then((digest) => { if (active) setHash(digest); }).catch@21 | `setFailed(true)` |
| CX-I-2609 | `web/components/fairness/HashExplainer.tsx:33`<br>HashExplainer | `setValue(event.target.value)` |

#### web/components/fairness/ProofFeed.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2610 | `web/components/fairness/ProofFeed.tsx:50`<br>useEffect@49 | `setNow(Date.now())` |
| CX-I-2611 | `web/components/fairness/ProofFeed.tsx:51`<br>setInterval@51 | `setNow(Date.now())` |
| CX-I-2612 | `web/components/fairness/ProofFeed.tsx:58`<br>api.proofFeed().then@58 | `setRemote(d.payouts)` |
| CX-I-2613 | `web/components/fairness/ProofFeed.tsx:58`<br>api.proofFeed().then@58 | `setFeedError(false)` |
| CX-I-2614 | `web/components/fairness/ProofFeed.tsx:58`<br>api.proofFeed().then((d) => { if (alive) { setRemote(d.payouts); setFeedError(false); } }).catch@58 | `setFeedError(true)` |
| CX-I-2615 | `web/components/fairness/ProofFeed.tsx:60`<br>api.reserve().then@60 | `setReserve(r)` |
| CX-I-2616 | `web/components/fairness/ProofFeed.tsx:96`<br>copyReserve | `setCopied(true)` |
| CX-I-2617 | `web/components/fairness/ProofFeed.tsx:97`<br>setTimeout@97 | `setCopied(false)` |

#### web/components/fairness/VisualVerifier.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2618 | `web/components/fairness/VisualVerifier.tsx:35`<br>useEffect@35 | `setBusy(false)` |
| CX-I-2619 | `web/components/fairness/VisualVerifier.tsx:35`<br>useEffect@35 | `setResult(null)` |
| CX-I-2620 | `web/components/fairness/VisualVerifier.tsx:35`<br>useEffect@35 | `setError(null)` |
| CX-I-2621 | `web/components/fairness/VisualVerifier.tsx:41`<br>useCallback@37 | `setBusy(true)` |
| CX-I-2622 | `web/components/fairness/VisualVerifier.tsx:42`<br>useCallback@37 | `setError(null)` |
| CX-I-2623 | `web/components/fairness/VisualVerifier.tsx:43`<br>useCallback@37 | `setResult(null)` |
| CX-I-2624 | `web/components/fairness/VisualVerifier.tsx:46`<br>useCallback@37 | `setResult({ id: picked.id, value })` |
| CX-I-2625 | `web/components/fairness/VisualVerifier.tsx:48`<br>useCallback@37 | `setError(t("computeError"))` |
| CX-I-2626 | `web/components/fairness/VisualVerifier.tsx:50`<br>useCallback@37 | `setBusy(false)` |
| CX-I-2627 | `web/components/fairness/VisualVerifier.tsx:85`<br>VisualVerifier | `setPickedId(event.target.value)` |

#### web/components/flow/BalanceSheet.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2628 | `web/components/flow/BalanceSheet.tsx:34`<br>useEffect@34 | `setTaking(false)` |
| CX-I-2629 | `web/components/flow/BalanceSheet.tsx:52`<br>BalanceSheet | `setTaking(true)` |

#### web/components/flow/ChargeSheet.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2630 | `web/components/flow/ChargeSheet.tsx:56`<br>ChargeSheet | `setAttempt((n) => n + 1)` |

#### web/components/flow/LoginSheet.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2631 | `web/components/flow/LoginSheet.tsx:37`<br>useEffect@35 | `setStep("email")` |
| CX-I-2632 | `web/components/flow/LoginSheet.tsx:37`<br>useEffect@35 | `setPassword("")` |
| CX-I-2633 | `web/components/flow/LoginSheet.tsx:37`<br>useEffect@35 | `setCode("")` |
| CX-I-2634 | `web/components/flow/LoginSheet.tsx:37`<br>useEffect@35 | `setError("")` |
| CX-I-2635 | `web/components/flow/LoginSheet.tsx:38`<br>useEffect@35 | `setEmail("")` |
| CX-I-2636 | `web/components/flow/LoginSheet.tsx:45`<br>run | `setBusy(true)` |
| CX-I-2637 | `web/components/flow/LoginSheet.tsx:45`<br>run | `setError("")` |
| CX-I-2638 | `web/components/flow/LoginSheet.tsx:47`<br>run | `setError(te(cause instanceof AccountError ? cause.code : "network"))` |
| CX-I-2639 | `web/components/flow/LoginSheet.tsx:48`<br>run | `setBusy(false)` |
| CX-I-2640 | `web/components/flow/LoginSheet.tsx:54`<br>accept | `acceptSession(user)` |
| CX-I-2641 | `web/components/flow/LoginSheet.tsx:57`<br>run@53 | `setEmail(email.trim())` |
| CX-I-2642 | `web/components/flow/LoginSheet.tsx:58`<br>run@53 | `setStep("reset")` |
| CX-I-2643 | `web/components/flow/LoginSheet.tsx:59`<br>run@53 | `setStep("password")` |
| CX-I-2644 | `web/components/flow/LoginSheet.tsx:64`<br>run@53 | `accept(user)` |
| CX-I-2645 | `web/components/flow/LoginSheet.tsx:64`<br>run@53 | `setPassword("")` |
| CX-I-2646 | `web/components/flow/LoginSheet.tsx:64`<br>run@53 | `setStep("verify")` |
| CX-I-2647 | `web/components/flow/LoginSheet.tsx:65`<br>run@53 | `accept(await loginAccount(email, password))` |
| CX-I-2648 | `web/components/flow/LoginSheet.tsx:66`<br>run@53 | `accept(await verifyAccountEmail(email, code))` |
| CX-I-2649 | `web/components/flow/LoginSheet.tsx:67`<br>run@53 | `setPassword("")` |
| CX-I-2650 | `web/components/flow/LoginSheet.tsx:67`<br>run@53 | `setStep("done")` |
| CX-I-2651 | `web/components/flow/LoginSheet.tsx:74`<br>run@71 | `acceptSession(result.user)` |
| CX-I-2652 | `web/components/flow/LoginSheet.tsx:78`<br>back | `setStep("email")` |
| CX-I-2653 | `web/components/flow/LoginSheet.tsx:78`<br>back | `setPassword("")` |
| CX-I-2654 | `web/components/flow/LoginSheet.tsx:78`<br>back | `setCode("")` |
| CX-I-2655 | `web/components/flow/LoginSheet.tsx:78`<br>back | `setError("")` |
| CX-I-2656 | `web/components/flow/LoginSheet.tsx:79`<br>switchMode | `setMode(next)` |
| CX-I-2657 | `web/components/flow/LoginSheet.tsx:86`<br>LoginSheet | `setMode("login")` |
| CX-I-2658 | `web/components/flow/LoginSheet.tsx:89`<br>LoginSheet | `setEmail(e.target.value)` |
| CX-I-2659 | `web/components/flow/LoginSheet.tsx:90`<br>LoginSheet | `setCode(e.target.value.replace(/\D/g, ""))` |
| CX-I-2660 | `web/components/flow/LoginSheet.tsx:91`<br>LoginSheet | `setPassword(e.target.value)` |
| CX-I-2661 | `web/components/flow/LoginSheet.tsx:108`<br>run@108 | `setCode("")` |

#### web/components/flow/ReviewSheet.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2662 | `web/components/flow/ReviewSheet.tsx:43`<br>pick | `setPhoto(await shrink(file))` |
| CX-I-2663 | `web/components/flow/ReviewSheet.tsx:43`<br>pick | `setFailed(null)` |
| CX-I-2664 | `web/components/flow/ReviewSheet.tsx:43`<br>pick | `setFailed("photo")` |
| CX-I-2665 | `web/components/flow/ReviewSheet.tsx:47`<br>send | `setFailed("short")` |
| CX-I-2666 | `web/components/flow/ReviewSheet.tsx:48`<br>send | `setBusy(true)` |
| CX-I-2667 | `web/components/flow/ReviewSheet.tsx:49`<br>send | `add({ ownedId: item.id, boxSlug: item.boxSlug, itemId: item.itemId, text, rating, photo, bonusUsdt: 0 })` |
| CX-I-2668 | `web/components/flow/ReviewSheet.tsx:49`<br>send | `setText("")` |
| CX-I-2669 | `web/components/flow/ReviewSheet.tsx:49`<br>send | `setPhoto(undefined)` |
| CX-I-2670 | `web/components/flow/ReviewSheet.tsx:50`<br>send | `setFailed("save")` |
| CX-I-2671 | `web/components/flow/ReviewSheet.tsx:51`<br>send | `setBusy(false)` |
| CX-I-2672 | `web/components/flow/ReviewSheet.tsx:59`<br>ReviewSheet | `setText(e.target.value)` |
| CX-I-2673 | `web/components/flow/ReviewSheet.tsx:59`<br>ReviewSheet | `setFailed(null)` |

#### web/components/flow/ShipSheet.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2674 | `web/components/flow/ShipSheet.tsx:38`<br>useEffect@35 | `setForm(lastAddress ? { ...EMPTY, ...lastAddress } : EMPTY)` |
| CX-I-2675 | `web/components/flow/ShipSheet.tsx:39`<br>useEffect@35 | `setTouched(false)` |
| CX-I-2676 | `web/components/flow/ShipSheet.tsx:39`<br>useEffect@35 | `setFailed(false)` |
| CX-I-2677 | `web/components/flow/ShipSheet.tsx:39`<br>useEffect@35 | `setConfirming(false)` |
| CX-I-2678 | `web/components/flow/ShipSheet.tsx:49`<br>set | `setForm((f) => ({ ...f, [key]: value }))` |
| CX-I-2679 | `web/components/flow/ShipSheet.tsx:51`<br>press | `setTouched(true)` |
| CX-I-2680 | `web/components/flow/ShipSheet.tsx:51`<br>press | `setFailed(false)` |
| CX-I-2681 | `web/components/flow/ShipSheet.tsx:51`<br>press | `setConfirming(true)` |
| CX-I-2682 | `web/components/flow/ShipSheet.tsx:54`<br>submit | `setBusy(true)` |
| CX-I-2683 | `web/components/flow/ShipSheet.tsx:55`<br>submit | `setConfirming(false)` |
| CX-I-2684 | `web/components/flow/ShipSheet.tsx:56`<br>submit | `setConfirming(false)` |
| CX-I-2685 | `web/components/flow/ShipSheet.tsx:56`<br>submit | `setFailed(true)` |
| CX-I-2686 | `web/components/flow/ShipSheet.tsx:57`<br>submit | `setBusy(false)` |
| CX-I-2687 | `web/components/flow/ShipSheet.tsx:63`<br>ShipSheet | `set("country", c)` |
| CX-I-2688 | `web/components/flow/ShipSheet.tsx:64`<br>ShipSheet | `set("recipient", e.target.value)` |
| CX-I-2689 | `web/components/flow/ShipSheet.tsx:66`<br>ShipSheet | `set("phone", e.target.value)` |
| CX-I-2690 | `web/components/flow/ShipSheet.tsx:68`<br>ShipSheet | `set("postalCode", e.target.value)` |
| CX-I-2691 | `web/components/flow/ShipSheet.tsx:70`<br>ShipSheet | `set("address", e.target.value)` |
| CX-I-2692 | `web/components/flow/ShipSheet.tsx:72`<br>ShipSheet | `set("customsId", e.target.value)` |
| CX-I-2693 | `web/components/flow/ShipSheet.tsx:79`<br>ShipSheet | `setConfirming(false)` |

#### web/components/flow/TakeSheet.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2694 | `web/components/flow/TakeSheet.tsx:93`<br>useEffect@92 | `setPicked(new Set(open ? preselectRef.current ?? [] : []))` |
| CX-I-2695 | `web/components/flow/TakeSheet.tsx:93`<br>useEffect@92 | `setStep("pick")` |
| CX-I-2696 | `web/components/flow/TakeSheet.tsx:93`<br>useEffect@92 | `setOutcome(null)` |
| CX-I-2697 | `web/components/flow/TakeSheet.tsx:93`<br>useEffect@92 | `setBusy(false)` |
| CX-I-2698 | `web/components/flow/TakeSheet.tsx:93`<br>useEffect@92 | `setGone(false)` |
| CX-I-2699 | `web/components/flow/TakeSheet.tsx:115`<br>toggle | `setPicked((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; })` |
| CX-I-2700 | `web/components/flow/TakeSheet.tsx:115`<br>setPicked@115 | `next.add(id)` |
| CX-I-2701 | `web/components/flow/TakeSheet.tsx:116`<br>toggleAll | `setPicked(all ? new Set() : new Set(candidates.map((item) => item.id)))` |
| CX-I-2702 | `web/components/flow/TakeSheet.tsx:120`<br>useEffect@119 | `setGone(true)` |
| CX-I-2703 | `web/components/flow/TakeSheet.tsx:120`<br>useEffect@119 | `setStep("result")` |
| CX-I-2704 | `web/components/flow/TakeSheet.tsx:125`<br>run | `setGone(true)` |
| CX-I-2705 | `web/components/flow/TakeSheet.tsx:125`<br>run | `setStep("result")` |
| CX-I-2706 | `web/components/flow/TakeSheet.tsx:126`<br>run | `setBusy(true)` |
| CX-I-2707 | `web/components/flow/TakeSheet.tsx:136`<br>run | `setBusy(false)` |
| CX-I-2708 | `web/components/flow/TakeSheet.tsx:137`<br>run | `setOutcome(merged)` |
| CX-I-2709 | `web/components/flow/TakeSheet.tsx:137`<br>run | `setStep("result")` |
| CX-I-2710 | `web/components/flow/TakeSheet.tsx:191`<br>TakeSheet | `setStep("confirm")` |
| CX-I-2711 | `web/components/flow/TakeSheet.tsx:197`<br>TakeSheet | `setStep("pick")` |

#### web/components/flow/VerifySheet.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2712 | `web/components/flow/VerifySheet.tsx:40`<br>useEffect@39 | `setMethod(false)` |
| CX-I-2713 | `web/components/flow/VerifySheet.tsx:42`<br>useEffect@39 | `setOutcome({ state: "checking" })` |
| CX-I-2714 | `web/components/flow/VerifySheet.tsx:44`<br>verifyOpeningRecord(target) .then@43 | `setOutcome({ state: "done", out })` |
| CX-I-2715 | `web/components/flow/VerifySheet.tsx:45`<br>verifyOpeningRecord(target) .then((out) => { if (alive) setOutcome({ state: "done", out }); }) .catch@43 | `setOutcome({ state: "failed" })` |
| CX-I-2716 | `web/components/flow/VerifySheet.tsx:88`<br>VerifySheet | `setMethod((v) => ¬v)` |

#### web/components/home/DailyFreeBox.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2717 | `web/components/home/DailyFreeBox.tsx:24`<br>useEffect@23 | `setNow(Date.now())` |
| CX-I-2718 | `web/components/home/DailyFreeBox.tsx:25`<br>setInterval@25 | `setNow(Date.now())` |
| CX-I-2719 | `web/components/home/DailyFreeBox.tsx:109`<br>useEffect@108 | `setStage({ kind: "pick" })` |
| CX-I-2720 | `web/components/home/DailyFreeBox.tsx:119`<br>useCallback@114 | `setStage({ kind: "revealing", picked: i })` |
| CX-I-2721 | `web/components/home/DailyFreeBox.tsx:121`<br>useCallback@114 | `fair.takeNonce()` |
| CX-I-2722 | `web/components/home/DailyFreeBox.tsx:125`<br>useCallback@114 | `record({ amountUsdt: reward.amount, fair: { serverSeedHash, serverSeed, clientSeed, nonce, roll: r.roll } })` |
| CX-I-2723 | `web/components/home/DailyFreeBox.tsx:126`<br>useCallback@114 | `credit(reward.amount)` |
| CX-I-2724 | `web/components/home/DailyFreeBox.tsx:127`<br>useCallback@114 | `addTransaction({ type: "bonus", amountUsdt: reward.amount, ref: "daily" })` |
| CX-I-2725 | `web/components/home/DailyFreeBox.tsx:130`<br>useCallback@114 | `setStage({ kind: "done", picked: i, reward, roll: r.roll })` |

#### web/components/home/HallOfFame.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2726 | `web/components/home/HallOfFame.tsx:54`<br>useEffect@53 | `setNow(Date.now())` |
| CX-I-2727 | `web/components/home/HallOfFame.tsx:55`<br>setInterval@55 | `setNow(Date.now())` |

#### web/components/home/heroBall.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2728 | `web/components/home/heroBall.ts:107`<br>createBallPainter | `gl.clear(gl.COLOR_BUFFER_BIT)` |

#### web/components/home/HeroBanner.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2729 | `web/components/home/HeroBanner.tsx:60`<br>apply | `setReduced(mq.matches)` |
| CX-I-2730 | `web/components/home/HeroBanner.tsx:67`<br>useEffect@65 | `setVisible(entry.isIntersecting)` |
| CX-I-2731 | `web/components/home/HeroBanner.tsx:75`<br>next | `setPhase(STEPS[step][0])` |
| CX-I-2732 | `web/components/home/HeroBanner.tsx:85`<br>useEffect@83 | `setBalls(false)` |
| CX-I-2733 | `web/components/home/HeroBanner.tsx:99`<br>draw | `setBalls(false)` |

#### web/components/home/JackpotPoolBadge.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2734 | `web/components/home/JackpotPoolBadge.tsx:38`<br>tick | `setShown(+(from + (value - from) * eased).toFixed(2))` |

#### web/components/home/LiveCounters.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2735 | `web/components/home/LiveCounters.tsx:28`<br>api.statsToday().then@28 | `setRemote(d)` |
| CX-I-2736 | `web/components/home/LiveCounters.tsx:45`<br>useEffect@38 | `setVerified({ ok, total: items.length })` |

#### web/components/home/LiveTicker.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2737 | `web/components/home/LiveTicker.tsx:34`<br>useEffect@34 | `setFailed(false)` |
| CX-I-2738 | `web/components/home/LiveTicker.tsx:38`<br>Thumb | `setFailed(true)` |
| CX-I-2739 | `web/components/home/LiveTicker.tsx:65`<br>useEffect@64 | `setNow(Date.now())` |
| CX-I-2740 | `web/components/home/LiveTicker.tsx:66`<br>setInterval@66 | `setNow(Date.now())` |
| CX-I-2741 | `web/components/home/LiveTicker.tsx:73`<br>api.liveFeed().then@73 | `setRemote(d)` |
| CX-I-2742 | `web/components/home/LiveTicker.tsx:145`<br>LiveTicker | `setHeld(true)` |
| CX-I-2743 | `web/components/home/LiveTicker.tsx:146`<br>LiveTicker | `setHeld(false)` |
| CX-I-2744 | `web/components/home/LiveTicker.tsx:147`<br>LiveTicker | `setHeld(false)` |

#### web/components/home/NetflixHome.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2745 | `web/components/home/NetflixHome.tsx:85`<br>sync | `setMore({ prev: el.scrollLeft > 4, next: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 })` |
| CX-I-2746 | `web/components/home/NetflixHome.tsx:128`<br>pick | `setBrowseAll(key === "all")` |
| CX-I-2747 | `web/components/home/NetflixHome.tsx:129`<br>clear | `setBrowseAll(false)` |
| CX-I-2748 | `web/components/home/NetflixHome.tsx:188`<br>NetflixHome | `clear()` |

#### web/components/home/ProofFeed.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2749 | `web/components/home/ProofFeed.tsx:79`<br>Promise.all(pending.map(async (item) => [item.id, await verifyOpening(item)] as const)).then@78 | `setVerifiedIds((prev) => ({ ...prev, ...Object.fromEntries(rows) }))` |

#### web/components/inventory/CancelShipmentModal.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2750 | `web/components/inventory/CancelShipmentModal.tsx:18`<br>useEffect@18 | `setError("")` |
| CX-I-2751 | `web/components/inventory/CancelShipmentModal.tsx:18`<br>useEffect@18 | `setBusy(false)` |
| CX-I-2752 | `web/components/inventory/CancelShipmentModal.tsx:23`<br>confirm | `setBusy(true)` |
| CX-I-2753 | `web/components/inventory/CancelShipmentModal.tsx:23`<br>confirm | `setError("")` |
| CX-I-2754 | `web/components/inventory/CancelShipmentModal.tsx:27`<br>confirm | `api.cancelShipping(item.id, item.shipping?.requestId ?? item.shipping?.requestedAt ?? "")` |
| CX-I-2755 | `web/components/inventory/CancelShipmentModal.tsx:29`<br>confirm | `useInventoryStore.setState(s=>({items:s.items.map(o=>o.id===item.id?result.item:o)}))` |
| CX-I-2756 | `web/components/inventory/CancelShipmentModal.tsx:30`<br>confirm | `useWalletStore.setState({balance:result.wallet.balance,cryptoBalance:result.wallet.cryptoBalance,cardBalance:result.wallet.cardBalance})` |
| CX-I-2757 | `web/components/inventory/CancelShipmentModal.tsx:32`<br>confirm | `useInventoryStore.getState().cancelShipping(item.id)` |
| CX-I-2758 | `web/components/inventory/CancelShipmentModal.tsx:35`<br>confirm | `wallet.creditSplit(result.toCrypto,result.toCard)` |
| CX-I-2759 | `web/components/inventory/CancelShipmentModal.tsx:36`<br>confirm | `wallet.addTransaction({type:"shipping_refund",amountUsdt:result.refundedUsdt,ref:item.shipping?.requestId ?? item.id,status:"COMPLETED"})` |
| CX-I-2760 | `web/components/inventory/CancelShipmentModal.tsx:40`<br>confirm | `setError(e instanceof Error && e.message==="unknownFee"?"unknownFee":"changed")` |
| CX-I-2761 | `web/components/inventory/CancelShipmentModal.tsx:41`<br>confirm | `setBusy(false)` |

#### web/components/inventory/DeliveryModal.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2762 | `web/components/inventory/DeliveryModal.tsx:90`<br>useEffect@89 | `setStage("form")` |
| CX-I-2763 | `web/components/inventory/DeliveryModal.tsx:90`<br>useEffect@89 | `setSubmitError("")` |
| CX-I-2764 | `web/components/inventory/DeliveryModal.tsx:101`<br>set | `setForm(next)` |
| CX-I-2765 | `web/components/inventory/DeliveryModal.tsx:102`<br>set | `setErrors(validateAddress({ ...next, address: k === "address" ? String(v) : next.address }))` |
| CX-I-2766 | `web/components/inventory/DeliveryModal.tsx:110`<br>useCallback@107 | `setTouched(true)` |
| CX-I-2767 | `web/components/inventory/DeliveryModal.tsx:111`<br>useCallback@107 | `setErrors(errs)` |
| CX-I-2768 | `web/components/inventory/DeliveryModal.tsx:113`<br>useCallback@107 | `setSubmitError("")` |
| CX-I-2769 | `web/components/inventory/DeliveryModal.tsx:114`<br>useCallback@107 | `setStage("inspecting")` |
| CX-I-2770 | `web/components/inventory/DeliveryModal.tsx:115`<br>useCallback@107 | `setStage("done")` |
| CX-I-2771 | `web/components/inventory/DeliveryModal.tsx:116`<br>useCallback@107 | `setSubmitError("배송 신청을 접수하지 못했습니다. 잠시 후 다시 시도해 주세요.")` |
| CX-I-2772 | `web/components/inventory/DeliveryModal.tsx:116`<br>useCallback@107 | `setStage("form")` |
| CX-I-2773 | `web/components/inventory/DeliveryModal.tsx:194`<br>DeliveryModal | `set("recipient", e.target.value)` |
| CX-I-2774 | `web/components/inventory/DeliveryModal.tsx:201`<br>DeliveryModal | `set("country", e.target.value as CountryCode)` |
| CX-I-2775 | `web/components/inventory/DeliveryModal.tsx:213`<br>DeliveryModal | `set("phone", form.country === "KR" ? formatPhoneKR(e.target.value) : e.target.value)` |
| CX-I-2776 | `web/components/inventory/DeliveryModal.tsx:225`<br>DeliveryModal | `set("postalCode", e.target.value)` |
| CX-I-2777 | `web/components/inventory/DeliveryModal.tsx:229`<br>DeliveryModal | `set("address", e.target.value)` |
| CX-I-2778 | `web/components/inventory/DeliveryModal.tsx:234`<br>DeliveryModal | `setDetail(e.target.value)` |
| CX-I-2779 | `web/components/inventory/DeliveryModal.tsx:249`<br>DeliveryModal | `set("customsId", e.target.value.toUpperCase())` |

#### web/components/inventory/InventoryScreen.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2780 | `web/components/inventory/InventoryScreen.tsx:64`<br>api.shipping(o.id).then@64 | `useInventoryStore.getState().markShipping(o.id, s.carrier, s.trackingNumber)` |
| CX-I-2781 | `web/components/inventory/InventoryScreen.tsx:70`<br>useEffect@70 | `setShown(PAGE)` |
| CX-I-2782 | `web/components/inventory/InventoryScreen.tsx:87`<br>closeItem | `setOpenId(null)` |
| CX-I-2783 | `web/components/inventory/InventoryScreen.tsx:87`<br>closeItem | `setCancelFailed(false)` |
| CX-I-2784 | `web/components/inventory/InventoryScreen.tsx:87`<br>closeItem | `setTakeNote(null)` |
| CX-I-2785 | `web/components/inventory/InventoryScreen.tsx:91`<br>take | `setBusy(true)` |
| CX-I-2786 | `web/components/inventory/InventoryScreen.tsx:91`<br>take | `setTakeNote(null)` |
| CX-I-2787 | `web/components/inventory/InventoryScreen.tsx:93`<br>take | `setBusy(false)` |
| CX-I-2788 | `web/components/inventory/InventoryScreen.tsx:93`<br>take | `setTaking(false)` |
| CX-I-2789 | `web/components/inventory/InventoryScreen.tsx:94`<br>take | `setTab("done")` |
| CX-I-2790 | `web/components/inventory/InventoryScreen.tsx:94`<br>take | `setTakeNote(out.status === "failed" ? "failed" : "unknown")` |
| CX-I-2791 | `web/components/inventory/InventoryScreen.tsx:98`<br>cancel | `setBusy(true)` |
| CX-I-2792 | `web/components/inventory/InventoryScreen.tsx:98`<br>cancel | `setCancelFailed(false)` |
| CX-I-2793 | `web/components/inventory/InventoryScreen.tsx:99`<br>cancel | `setCancelling(false)` |
| CX-I-2794 | `web/components/inventory/InventoryScreen.tsx:99`<br>cancel | `setTab("held")` |
| CX-I-2795 | `web/components/inventory/InventoryScreen.tsx:100`<br>cancel | `setCancelling(false)` |
| CX-I-2796 | `web/components/inventory/InventoryScreen.tsx:100`<br>cancel | `setCancelFailed(true)` |
| CX-I-2797 | `web/components/inventory/InventoryScreen.tsx:101`<br>cancel | `setBusy(false)` |
| CX-I-2798 | `web/components/inventory/InventoryScreen.tsx:103`<br>verify | `setVerifying({ itemId: item.itemId, fair: item.fair })` |
| CX-I-2799 | `web/components/inventory/InventoryScreen.tsx:119`<br>InventoryScreen | `setBatch(true)` |
| CX-I-2800 | `web/components/inventory/InventoryScreen.tsx:128`<br>list.slice(0, shown).map@124 | `setOpenId(item.id)` |
| CX-I-2801 | `web/components/inventory/InventoryScreen.tsx:138`<br>InventoryScreen | `setShown((n) => n + PAGE)` |
| CX-I-2802 | `web/components/inventory/InventoryScreen.tsx:158`<br>InventoryScreen | `setReviewing(true)` |
| CX-I-2803 | `web/components/inventory/InventoryScreen.tsx:168`<br>InventoryScreen | `setTaking(true)` |
| CX-I-2804 | `web/components/inventory/InventoryScreen.tsx:169`<br>InventoryScreen | `setCancelling(true)` |
| CX-I-2805 | `web/components/inventory/InventoryScreen.tsx:172`<br>InventoryScreen | `setShipIds([current.id])` |
| CX-I-2806 | `web/components/inventory/InventoryScreen.tsx:180`<br>InventoryScreen | `setShipIds(null)` |
| CX-I-2807 | `web/components/inventory/InventoryScreen.tsx:180`<br>InventoryScreen | `setShipIds(null)` |
| CX-I-2808 | `web/components/inventory/InventoryScreen.tsx:180`<br>InventoryScreen | `setTab("shipping")` |
| CX-I-2809 | `web/components/inventory/InventoryScreen.tsx:181`<br>InventoryScreen | `setVerifying(null)` |
| CX-I-2810 | `web/components/inventory/InventoryScreen.tsx:182`<br>InventoryScreen | `setReviewing(false)` |
| CX-I-2811 | `web/components/inventory/InventoryScreen.tsx:182`<br>InventoryScreen | `setReviewing(false)` |
| CX-I-2812 | `web/components/inventory/InventoryScreen.tsx:184`<br>InventoryScreen | `setBatch(false)` |
| CX-I-2813 | `web/components/inventory/InventoryScreen.tsx:186`<br>InventoryScreen | `setTaking(false)` |
| CX-I-2814 | `web/components/inventory/InventoryScreen.tsx:187`<br>InventoryScreen | `setCancelling(false)` |

#### web/components/layout/CurrencySelector.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2815 | `web/components/layout/CurrencySelector.tsx:10`<br>CurrencySelector | `setCurrency(event.target.value as Currency)` |

#### web/components/layout/LabBadge.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2816 | `web/components/layout/LabBadge.tsx:22`<br>useEffect@20 | `setStorageFull(true)` |
| CX-I-2817 | `web/components/layout/LabBadge.tsx:23`<br>onFull | `setStorageFull(true)` |

#### web/components/layout/LanguageSelector.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2818 | `web/components/layout/LanguageSelector.tsx:14`<br>choose | `localStorage.setItem("gachaflix.locale", next)` |

#### web/components/layout/SiteHeader.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2819 | `web/components/layout/SiteHeader.tsx:30`<br>useModal@30 | `setOpen(false)` |
| CX-I-2820 | `web/components/layout/SiteHeader.tsx:31`<br>useEffect@31 | `setOpen(false)` |
| CX-I-2821 | `web/components/layout/SiteHeader.tsx:33`<br>useEffect@32 | `setOpen(false)` |
| CX-I-2822 | `web/components/layout/SiteHeader.tsx:42`<br>handleResize | `setOpen(false)` |
| CX-I-2823 | `web/components/layout/SiteHeader.tsx:46`<br>wallet | `setOpen(false)` |
| CX-I-2824 | `web/components/layout/SiteHeader.tsx:47`<br>links.map@47 | `setOpen(false)` |
| CX-I-2825 | `web/components/layout/SiteHeader.tsx:54`<br>SiteHeader | `setOpen(¬open)` |
| CX-I-2826 | `web/components/layout/SiteHeader.tsx:58`<br>SiteHeader | `setOpen(false)` |
| CX-I-2827 | `web/components/layout/SiteHeader.tsx:60`<br>SiteHeader | `setOpen(false)` |

#### web/components/shell/AppFooter.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2828 | `web/components/shell/AppFooter.tsx:62`<br>AppFooter | `setCurrency(currency === "KRW" ? "USD" : "KRW")` |

#### web/components/shell/StateScreens.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2829 | `web/components/shell/StateScreens.tsx:49`<br>sync | `setOffline(¬navigator.onLine)` |

#### web/components/ui/ScrollRow.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2830 | `web/components/ui/ScrollRow.tsx:18`<br>update | `setMore((m) => (m.prev === prev && m.next === next ? m : { prev, next }))` |

#### web/components/ui/toast.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2831 | `web/components/ui/toast.tsx:13`<br>show | `set((s) => ({ text, id: s.id + 1 }))` |
| CX-I-2832 | `web/components/ui/toast.tsx:14`<br>clear | `set({ text: null })` |

#### web/components/unboxing/AutoplaySettingsModal.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2833 | `web/components/unboxing/AutoplaySettingsModal.tsx:35`<br>useEffect@33 | `setCfg(initial)` |
| CX-I-2834 | `web/components/unboxing/AutoplaySettingsModal.tsx:36`<br>useEffect@33 | `setUseMultiple(initial.stopOnMultiple ¬== null)` |
| CX-I-2835 | `web/components/unboxing/AutoplaySettingsModal.tsx:37`<br>useEffect@33 | `setUseStopLoss(initial.stopLoss ¬== null)` |
| CX-I-2836 | `web/components/unboxing/AutoplaySettingsModal.tsx:105`<br>AUTOPLAY_SPINS.map@99 | `setCfg((c) => ({ ...c, spins: n }))` |
| CX-I-2837 | `web/components/unboxing/AutoplaySettingsModal.tsx:122`<br>AutoplaySettingsModal | `setCfg((c) => ({ ...c, autoSell: ¬c.autoSell }))` |
| CX-I-2838 | `web/components/unboxing/AutoplaySettingsModal.tsx:131`<br>AutoplaySettingsModal | `setCfg((c) => ({ ...c, stopOnJackpot: ¬c.stopOnJackpot }))` |
| CX-I-2839 | `web/components/unboxing/AutoplaySettingsModal.tsx:132`<br>AutoplaySettingsModal | `setUseMultiple((v) => ¬v)` |
| CX-I-2840 | `web/components/unboxing/AutoplaySettingsModal.tsx:136`<br>AutoplaySettingsModal | `setMultiple(e.target.value)` |
| CX-I-2841 | `web/components/unboxing/AutoplaySettingsModal.tsx:145`<br>AutoplaySettingsModal | `setUseStopLoss((v) => ¬v)` |
| CX-I-2842 | `web/components/unboxing/AutoplaySettingsModal.tsx:149`<br>AutoplaySettingsModal | `setStopLoss(e.target.value)` |

#### web/components/unboxing/BulkOpenModal.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2843 | `web/components/unboxing/BulkOpenModal.tsx:52`<br>useEffect@51 | `setV(value)` |
| CX-I-2844 | `web/components/unboxing/BulkOpenModal.tsx:53`<br>onUpdate | `setV(x)` |
| CX-I-2845 | `web/components/unboxing/BulkOpenModal.tsx:101`<br>tick | `setProgress(p)` |
| CX-I-2846 | `web/components/unboxing/BulkOpenModal.tsx:109`<br>useEffect@86 | `setResults(sorted)` |
| CX-I-2847 | `web/components/unboxing/BulkOpenModal.tsx:110`<br>useEffect@86 | `setPhase("done")` |
| CX-I-2848 | `web/components/unboxing/BulkOpenModal.tsx:113`<br>useEffect@86 | `setMega(best.tier.accent)` |
| CX-I-2849 | `web/components/unboxing/BulkOpenModal.tsx:114`<br>setTimeout@114 | `setMega(null)` |
| CX-I-2850 | `web/components/unboxing/BulkOpenModal.tsx:128`<br>useEffect@124 | `setPhase("opening")` |
| CX-I-2851 | `web/components/unboxing/BulkOpenModal.tsx:129`<br>useEffect@124 | `setProgress(0)` |
| CX-I-2852 | `web/components/unboxing/BulkOpenModal.tsx:130`<br>useEffect@124 | `setResults([])` |
| CX-I-2853 | `web/components/unboxing/BulkOpenModal.tsx:131`<br>useEffect@124 | `setSold(false)` |
| CX-I-2854 | `web/components/unboxing/BulkOpenModal.tsx:132`<br>useEffect@124 | `setMega(null)` |
| CX-I-2855 | `web/components/unboxing/BulkOpenModal.tsx:253`<br>BulkOpenModal | `setSold(true)` |

#### web/components/unboxing/UnboxingRoulette.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2856 | `web/components/unboxing/UnboxingRoulette.tsx:163`<br>skipPresentation | `setSkipRequested(true)` |
| CX-I-2857 | `web/components/unboxing/UnboxingRoulette.tsx:210`<br>useCallback@206 | `useTelemetryStore.getState().recordSpin()` |
| CX-I-2858 | `web/components/unboxing/UnboxingRoulette.tsx:229`<br>useCallback@206 | `setStrip(built)` |
| CX-I-2859 | `web/components/unboxing/UnboxingRoulette.tsx:230`<br>useCallback@206 | `setCurrent(null)` |
| CX-I-2860 | `web/components/unboxing/UnboxingRoulette.tsx:231`<br>useCallback@206 | `setPhase("spinning")` |
| CX-I-2861 | `web/components/unboxing/UnboxingRoulette.tsx:232`<br>useCallback@206 | `x.set(0)` |
| CX-I-2862 | `web/components/unboxing/UnboxingRoulette.tsx:233`<br>useCallback@206 | `blurMv.set(0)` |
| CX-I-2863 | `web/components/unboxing/UnboxingRoulette.tsx:234`<br>useCallback@206 | `setTension(false)` |
| CX-I-2864 | `web/components/unboxing/UnboxingRoulette.tsx:262`<br>onUpdate | `blurMv.set(Math.min(14, Math.max(0, (vel - 1200) / 550)))` |
| CX-I-2865 | `web/components/unboxing/UnboxingRoulette.tsx:273`<br>onUpdate | `setTension(near)` |
| CX-I-2866 | `web/components/unboxing/UnboxingRoulette.tsx:281`<br>useCallback@206 | `blurMv.set(0)` |
| CX-I-2867 | `web/components/unboxing/UnboxingRoulette.tsx:282`<br>useCallback@206 | `setTension(false)` |
| CX-I-2868 | `web/components/unboxing/UnboxingRoulette.tsx:287`<br>useCallback@206 | `setShake(true)` |
| CX-I-2869 | `web/components/unboxing/UnboxingRoulette.tsx:291`<br>useCallback@206 | `setShake(false)` |
| CX-I-2870 | `web/components/unboxing/UnboxingRoulette.tsx:295`<br>useCallback@206 | `setCurrent(res)` |
| CX-I-2871 | `web/components/unboxing/UnboxingRoulette.tsx:296`<br>useCallback@206 | `setPhase("landed")` |
| CX-I-2872 | `web/components/unboxing/UnboxingRoulette.tsx:298`<br>useCallback@206 | `setFlash(big ? res.tier.accent : "#E50914")` |
| CX-I-2873 | `web/components/unboxing/UnboxingRoulette.tsx:300`<br>useCallback@206 | `setMega(res.tier.accent)` |
| CX-I-2874 | `web/components/unboxing/UnboxingRoulette.tsx:301`<br>setTimeout@301 | `setMega(null)` |
| CX-I-2875 | `web/components/unboxing/UnboxingRoulette.tsx:304`<br>setTimeout@304 | `setFlash(null)` |
| CX-I-2876 | `web/components/unboxing/UnboxingRoulette.tsx:316`<br>useEffect@311 | `setSkipRequested(false)` |
| CX-I-2877 | `web/components/unboxing/UnboxingRoulette.tsx:323`<br>useEffect@311 | `setPhase("gate")` |
| CX-I-2878 | `web/components/unboxing/UnboxingRoulette.tsx:332`<br>useEffect@311 | `setAutoState({ ...st })` |
| CX-I-2879 | `web/components/unboxing/UnboxingRoulette.tsx:333`<br>useEffect@311 | `setAutoStop(null)` |
| CX-I-2880 | `web/components/unboxing/UnboxingRoulette.tsx:342`<br>useEffect@311 | `setOpenError(true)` |
| CX-I-2881 | `web/components/unboxing/UnboxingRoulette.tsx:350`<br>useEffect@311 | `creditSplit(toCrypto, toCard)` |
| CX-I-2882 | `web/components/unboxing/UnboxingRoulette.tsx:351`<br>useEffect@311 | `addTransaction({ type: "sellback", amountUsdt: totalUsdt, ref: '${r.item.id}:auto' })` |
| CX-I-2883 | `web/components/unboxing/UnboxingRoulette.tsx:356`<br>useEffect@311 | `setResults([...out])` |
| CX-I-2884 | `web/components/unboxing/UnboxingRoulette.tsx:357`<br>useEffect@311 | `setAutoState({ ...st })` |
| CX-I-2885 | `web/components/unboxing/UnboxingRoulette.tsx:362`<br>useEffect@311 | `setAutoStop(reason ?? "manual")` |
| CX-I-2886 | `web/components/unboxing/UnboxingRoulette.tsx:363`<br>useEffect@311 | `setPhase("results")` |
| CX-I-2887 | `web/components/unboxing/UnboxingRoulette.tsx:371`<br>useEffect@311 | `setResults([...out])` |
| CX-I-2888 | `web/components/unboxing/UnboxingRoulette.tsx:374`<br>useEffect@311 | `setPhase("results")` |
| CX-I-2889 | `web/components/unboxing/UnboxingRoulette.tsx:377`<br>(async () => { // 뷰포트 폭이 측정될 때까지 한두 프레임 기다린다 for (let i = 0; i < 20 && viewportW.current === 0; i++) await new Promise((r) => requestAnimationFrame(() => r(null))); if (cancelled.current) return; if (¬reducedMotion && ¬demo && ¬auto) { // 3단계 문지기 컷인, 휠 잠금 해제 → 틈새 아우라 → 암전, 심장 박동 setPhase("gate"); await waitPresentation(GATE_TOTAL_MS); if (cancelled.current) return; } const out: UnboxResult[] = []; if (auto) { // ── 오토플레이: 스핀마다 차감 → 스핀 → (자동 환전) → 정지 규칙 ── const st: AutoplayState = { done: 0, spent: 0, won: 0 }; setAutoState({ ...st }); setAutoStop(null); let reason: StopReason = null; while (¬cancelled.current) { if (stopRef.current) { reason = "manual"; break; } if (¬canAfford(useWalletStore.getState().balance, box.price)) { reason = "balance"; break; } let r: UnboxResult; try { r = await spinOnce(REEL_DURATION_MULTI_S); } catch (error) { if (error instanceof InsufficientOpeningBalance) { reason = "balance"; break; } setOpenError(true); reason = "manual"; break; } st.spent = +(st.spent + box.price).toFixed(2); if (cancelled.current) return; st.done += 1; st.won = +(st.won + r.item.value).toFixed(2); if (auto.autoSell && ¬r.settled && r.ownedId) { const { totalUsdt, toCrypto, toCard } = sellOwned([r.ownedId], REFUND_RATE); creditSplit(toCrypto, toCard); addTransaction({ type: "sellback", amountUsdt: totalUsdt, ref: '${r.item.id}:auto' }); r.settled = true; r.autoSold = totalUsdt; } out.push(r); setResults([...out]); setAutoState({ ...st }); reason = stopReasonAfter(auto, st, { tier: r.tier.key, value: r.item.value }, box.price); if (reason) break; await waitPresentation(550); } setAutoStop(reason ?? "manual"); setPhase("results"); return; } const n = Math.max(1, count); for (let i = 0; i < n; i++) { if (cancelled.current) return; const r = await spinOnce(n > 1 ? REEL_DURATION_MULTI_S : REEL_DURATION_S, prepared?.[i]); out.push(r); setResults([...out]); if (i < n - 1) await waitPresentation(700); } setPhase("results"); })().catch@317 | `setOpenError(true)` |
| CX-I-2890 | `web/components/unboxing/UnboxingRoulette.tsx:378`<br>(async () => { // 뷰포트 폭이 측정될 때까지 한두 프레임 기다린다 for (let i = 0; i < 20 && viewportW.current === 0; i++) await new Promise((r) => requestAnimationFrame(() => r(null))); if (cancelled.current) return; if (¬reducedMotion && ¬demo && ¬auto) { // 3단계 문지기 컷인, 휠 잠금 해제 → 틈새 아우라 → 암전, 심장 박동 setPhase("gate"); await waitPresentation(GATE_TOTAL_MS); if (cancelled.current) return; } const out: UnboxResult[] = []; if (auto) { // ── 오토플레이: 스핀마다 차감 → 스핀 → (자동 환전) → 정지 규칙 ── const st: AutoplayState = { done: 0, spent: 0, won: 0 }; setAutoState({ ...st }); setAutoStop(null); let reason: StopReason = null; while (¬cancelled.current) { if (stopRef.current) { reason = "manual"; break; } if (¬canAfford(useWalletStore.getState().balance, box.price)) { reason = "balance"; break; } let r: UnboxResult; try { r = await spinOnce(REEL_DURATION_MULTI_S); } catch (error) { if (error instanceof InsufficientOpeningBalance) { reason = "balance"; break; } setOpenError(true); reason = "manual"; break; } st.spent = +(st.spent + box.price).toFixed(2); if (cancelled.current) return; st.done += 1; st.won = +(st.won + r.item.value).toFixed(2); if (auto.autoSell && ¬r.settled && r.ownedId) { const { totalUsdt, toCrypto, toCard } = sellOwned([r.ownedId], REFUND_RATE); creditSplit(toCrypto, toCard); addTransaction({ type: "sellback", amountUsdt: totalUsdt, ref: '${r.item.id}:auto' }); r.settled = true; r.autoSold = totalUsdt; } out.push(r); setResults([...out]); setAutoState({ ...st }); reason = stopReasonAfter(auto, st, { tier: r.tier.key, value: r.item.value }, box.price); if (reason) break; await waitPresentation(550); } setAutoStop(reason ?? "manual"); setPhase("results"); return; } const n = Math.max(1, count); for (let i = 0; i < n; i++) { if (cancelled.current) return; const r = await spinOnce(n > 1 ? REEL_DURATION_MULTI_S : REEL_DURATION_S, prepared?.[i]); out.push(r); setResults([...out]); if (i < n - 1) await waitPresentation(700); } setPhase("results"); })().catch@317 | `setResults(prepared)` |
| CX-I-2891 | `web/components/unboxing/UnboxingRoulette.tsx:379`<br>(async () => { // 뷰포트 폭이 측정될 때까지 한두 프레임 기다린다 for (let i = 0; i < 20 && viewportW.current === 0; i++) await new Promise((r) => requestAnimationFrame(() => r(null))); if (cancelled.current) return; if (¬reducedMotion && ¬demo && ¬auto) { // 3단계 문지기 컷인, 휠 잠금 해제 → 틈새 아우라 → 암전, 심장 박동 setPhase("gate"); await waitPresentation(GATE_TOTAL_MS); if (cancelled.current) return; } const out: UnboxResult[] = []; if (auto) { // ── 오토플레이: 스핀마다 차감 → 스핀 → (자동 환전) → 정지 규칙 ── const st: AutoplayState = { done: 0, spent: 0, won: 0 }; setAutoState({ ...st }); setAutoStop(null); let reason: StopReason = null; while (¬cancelled.current) { if (stopRef.current) { reason = "manual"; break; } if (¬canAfford(useWalletStore.getState().balance, box.price)) { reason = "balance"; break; } let r: UnboxResult; try { r = await spinOnce(REEL_DURATION_MULTI_S); } catch (error) { if (error instanceof InsufficientOpeningBalance) { reason = "balance"; break; } setOpenError(true); reason = "manual"; break; } st.spent = +(st.spent + box.price).toFixed(2); if (cancelled.current) return; st.done += 1; st.won = +(st.won + r.item.value).toFixed(2); if (auto.autoSell && ¬r.settled && r.ownedId) { const { totalUsdt, toCrypto, toCard } = sellOwned([r.ownedId], REFUND_RATE); creditSplit(toCrypto, toCard); addTransaction({ type: "sellback", amountUsdt: totalUsdt, ref: '${r.item.id}:auto' }); r.settled = true; r.autoSold = totalUsdt; } out.push(r); setResults([...out]); setAutoState({ ...st }); reason = stopReasonAfter(auto, st, { tier: r.tier.key, value: r.item.value }, box.price); if (reason) break; await waitPresentation(550); } setAutoStop(reason ?? "manual"); setPhase("results"); return; } const n = Math.max(1, count); for (let i = 0; i < n; i++) { if (cancelled.current) return; const r = await spinOnce(n > 1 ? REEL_DURATION_MULTI_S : REEL_DURATION_S, prepared?.[i]); out.push(r); setResults([...out]); if (i < n - 1) await waitPresentation(700); } setPhase("results"); })().catch@317 | `setPhase("results")` |
| CX-I-2892 | `web/components/unboxing/UnboxingRoulette.tsx:392`<br>useEffect@390 | `setPhase("idle")` |
| CX-I-2893 | `web/components/unboxing/UnboxingRoulette.tsx:393`<br>useEffect@390 | `setOpenError(false)` |
| CX-I-2894 | `web/components/unboxing/UnboxingRoulette.tsx:394`<br>useEffect@390 | `setSkipRequested(false)` |
| CX-I-2895 | `web/components/unboxing/UnboxingRoulette.tsx:395`<br>useEffect@390 | `setStrip([])` |
| CX-I-2896 | `web/components/unboxing/UnboxingRoulette.tsx:396`<br>useEffect@390 | `setResults([])` |
| CX-I-2897 | `web/components/unboxing/UnboxingRoulette.tsx:397`<br>useEffect@390 | `setCurrent(null)` |
| CX-I-2898 | `web/components/unboxing/UnboxingRoulette.tsx:398`<br>useEffect@390 | `setSold(false)` |
| CX-I-2899 | `web/components/unboxing/UnboxingRoulette.tsx:399`<br>useEffect@390 | `setShipped(false)` |
| CX-I-2900 | `web/components/unboxing/UnboxingRoulette.tsx:400`<br>useEffect@390 | `setShipOpen(false)` |
| CX-I-2901 | `web/components/unboxing/UnboxingRoulette.tsx:401`<br>useEffect@390 | `setShake(false)` |
| CX-I-2902 | `web/components/unboxing/UnboxingRoulette.tsx:402`<br>useEffect@390 | `setDisguise(null)` |
| CX-I-2903 | `web/components/unboxing/UnboxingRoulette.tsx:403`<br>useEffect@390 | `setUpgradeFx(null)` |
| CX-I-2904 | `web/components/unboxing/UnboxingRoulette.tsx:628`<br>results.map@616 | `setVerifyId(r.ownedId)` |
| CX-I-2905 | `web/components/unboxing/UnboxingRoulette.tsx:687`<br>UnboxingRoulette | `setSold(true)` |
| CX-I-2906 | `web/components/unboxing/UnboxingRoulette.tsx:711`<br>UnboxingRoulette | `setShipOpen(true)` |
| CX-I-2907 | `web/components/unboxing/UnboxingRoulette.tsx:715`<br>UnboxingRoulette | `setVerifyId(last.ownedId)` |
| CX-I-2908 | `web/components/unboxing/UnboxingRoulette.tsx:750`<br>UnboxingRoulette | `setShipOpen(false)` |
| CX-I-2909 | `web/components/unboxing/UnboxingRoulette.tsx:752`<br>UnboxingRoulette | `useWalletStore.getState().debitSplit(fee)` |
| CX-I-2910 | `web/components/unboxing/UnboxingRoulette.tsx:755`<br>UnboxingRoulette | `requestShipping(ids, address, fee, split?.ratio)` |
| CX-I-2911 | `web/components/unboxing/UnboxingRoulette.tsx:756`<br>UnboxingRoulette | `setShipped(true)` |
| CX-I-2912 | `web/components/unboxing/UnboxingRoulette.tsx:757`<br>UnboxingRoulette | `setShipOpen(false)` |
| CX-I-2913 | `web/components/unboxing/UnboxingRoulette.tsx:761`<br>UnboxingRoulette | `setVerifyId(null)` |

#### web/components/unboxing/VaultGateFX.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2914 | `web/components/unboxing/VaultGateFX.tsx:27`<br>setTimeout@27 | `setStage(1)` |
| CX-I-2915 | `web/components/unboxing/VaultGateFX.tsx:29`<br>setTimeout@28 | `setStage(2)` |

#### web/components/verify/VerifyScreen.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2916 | `web/components/verify/VerifyScreen.tsx:47`<br>useEffect@45 | `setServerSeed(seed)` |
| CX-I-2917 | `web/components/verify/VerifyScreen.tsx:47`<br>useEffect@45 | `setLockedHash(params?.get("h") ?? "")` |
| CX-I-2918 | `web/components/verify/VerifyScreen.tsx:47`<br>useEffect@45 | `setClientSeed(params?.get("c") ?? "")` |
| CX-I-2919 | `web/components/verify/VerifyScreen.tsx:47`<br>useEffect@45 | `setNonce(params?.get("n") ?? "")` |
| CX-I-2920 | `web/components/verify/VerifyScreen.tsx:48`<br>useEffect@45 | `setBoxSlug(slug)` |
| CX-I-2921 | `web/components/verify/VerifyScreen.tsx:59`<br>compute | `setFailed(true)` |
| CX-I-2922 | `web/components/verify/VerifyScreen.tsx:59`<br>compute | `setManual(null)` |
| CX-I-2923 | `web/components/verify/VerifyScreen.tsx:60`<br>compute | `setBusy(true)` |
| CX-I-2924 | `web/components/verify/VerifyScreen.tsx:60`<br>compute | `setFailed(false)` |
| CX-I-2925 | `web/components/verify/VerifyScreen.tsx:65`<br>compute | `setManual({ hash, hashMatch: lockedHash.trim() ? lockedHash.trim().toLowerCase() === hash : null, roll: result.roll, itemName: itemName(item) })` |
| CX-I-2926 | `web/components/verify/VerifyScreen.tsx:66`<br>compute | `setFailed(true)` |
| CX-I-2927 | `web/components/verify/VerifyScreen.tsx:66`<br>compute | `setManual(null)` |
| CX-I-2928 | `web/components/verify/VerifyScreen.tsx:67`<br>compute | `setBusy(false)` |
| CX-I-2929 | `web/components/verify/VerifyScreen.tsx:84`<br>records.slice(0, shown).map@82 | `setVerifying({ ownedId: o.id, itemId: o.itemId, fair: o.fair })` |
| CX-I-2930 | `web/components/verify/VerifyScreen.tsx:91`<br>VerifyScreen | `setShown((n) => n + PAGE)` |
| CX-I-2931 | `web/components/verify/VerifyScreen.tsx:99`<br>VerifyScreen | `setServerSeed(e.target.value)` |
| CX-I-2932 | `web/components/verify/VerifyScreen.tsx:100`<br>VerifyScreen | `setLockedHash(e.target.value)` |
| CX-I-2933 | `web/components/verify/VerifyScreen.tsx:101`<br>VerifyScreen | `setClientSeed(e.target.value)` |
| CX-I-2934 | `web/components/verify/VerifyScreen.tsx:102`<br>VerifyScreen | `setNonce(e.target.value)` |
| CX-I-2935 | `web/components/verify/VerifyScreen.tsx:125`<br>VerifyScreen | `setVerifying(null)` |

#### web/components/wallet/DepositModal.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2936 | `web/components/wallet/DepositModal.tsx:58`<br>useEffect@57 | `setTab(initialTab)` |
| CX-I-2937 | `web/components/wallet/DepositModal.tsx:107`<br>( [ { key: "usdt", label: t("tabUsdt"), Icon: Coins }, { key: "withdraw", label: t("tabWithdraw"), Icon: ArrowUpRight }, { key: "history", label: t("tabHistory"), Icon: ReceiptText }, ] as const ).map@96 | `setTab(key)` |

#### web/components/wallet/HistoryTab.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2938 | `web/components/wallet/HistoryTab.tsx:88`<br>cancel | `setCancelling(tx.id)` |
| CX-I-2939 | `web/components/wallet/HistoryTab.tsx:88`<br>cancel | `setError("")` |
| CX-I-2940 | `web/components/wallet/HistoryTab.tsx:92`<br>cancel | `useWalletStore.getState().syncWithdrawal(tx.id, result.status, { txHash: result.txHash, unlockAt: result.unlockAt })` |
| CX-I-2941 | `web/components/wallet/HistoryTab.tsx:93`<br>cancel | `setError(ta('errors.${cause instanceof AccountError ? cause.code : "network"}'))` |
| CX-I-2942 | `web/components/wallet/HistoryTab.tsx:94`<br>cancel | `setCancelling(null)` |
| CX-I-2943 | `web/components/wallet/HistoryTab.tsx:107`<br>poll | `useWalletStore.getState().syncWithdrawal(tx.id, result.status, { txHash: result.txHash, unlockAt: result.unlockAt })` |
| CX-I-2944 | `web/components/wallet/HistoryTab.tsx:120`<br>useEffect@119 | `setNow(Date.now())` |
| CX-I-2945 | `web/components/wallet/HistoryTab.tsx:121`<br>window.setInterval@121 | `setNow(Date.now())` |
| CX-I-2946 | `web/components/wallet/HistoryTab.tsx:139`<br>navigator.clipboard?.writeText(text).then@138 | `setCopied(text)` |
| CX-I-2947 | `web/components/wallet/HistoryTab.tsx:140`<br>window.setTimeout@140 | `setCopied((c) => (c === text ? null : c))` |
| CX-I-2948 | `web/components/wallet/HistoryTab.tsx:141`<br>navigator.clipboard?.writeText(text).then(() => { setCopied(text); window.setTimeout(() => setCopied((c) => (c === text ? null : c)), 1600); }).catch@138 | `setError(t("copyFailed"))` |
| CX-I-2949 | `web/components/wallet/HistoryTab.tsx:154`<br>(["all", "deposit", "withdraw"] as Filter[]).map@149 | `setFilter(k)` |

#### web/components/wallet/TwoFactorSetup.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2950 | `web/components/wallet/TwoFactorSetup.tsx:40`<br>useCallback@38 | `setBusy(true)` |
| CX-I-2951 | `web/components/wallet/TwoFactorSetup.tsx:40`<br>useCallback@38 | `setError("")` |
| CX-I-2952 | `web/components/wallet/TwoFactorSetup.tsx:44`<br>useCallback@38 | `setSetup(next)` |
| CX-I-2953 | `web/components/wallet/TwoFactorSetup.tsx:45`<br>useCallback@38 | `setError(ta('errors.${cause instanceof AccountError ? cause.code : "network"}'))` |
| CX-I-2954 | `web/components/wallet/TwoFactorSetup.tsx:46`<br>useCallback@38 | `setBusy(false)` |
| CX-I-2955 | `web/components/wallet/TwoFactorSetup.tsx:55`<br>copy | `setError(t("copyFailed"))` |
| CX-I-2956 | `web/components/wallet/TwoFactorSetup.tsx:59`<br>submit | `setBusy(true)` |
| CX-I-2957 | `web/components/wallet/TwoFactorSetup.tsx:59`<br>submit | `setError("")` |
| CX-I-2958 | `web/components/wallet/TwoFactorSetup.tsx:64`<br>submit | `useSecurityStore.getState().accept(id, status)` |
| CX-I-2959 | `web/components/wallet/TwoFactorSetup.tsx:65`<br>submit | `setSetup(null)` |
| CX-I-2960 | `web/components/wallet/TwoFactorSetup.tsx:68`<br>submit | `setError(cause instanceof AccountError && cause.code === "credentials" ? t("codeWrong") : ta('errors.${cause instanceof AccountError ? cause.code : "network"}'))` |
| CX-I-2961 | `web/components/wallet/TwoFactorSetup.tsx:69`<br>submit | `setCode("")` |
| CX-I-2962 | `web/components/wallet/TwoFactorSetup.tsx:70`<br>submit | `setBusy(false)` |
| CX-I-2963 | `web/components/wallet/TwoFactorSetup.tsx:93`<br>TwoFactorSetup | `setCode(e.target.value.replace(/\D+/g, "").slice(0, TOTP_DIGITS))` |
| CX-I-2964 | `web/components/wallet/TwoFactorSetup.tsx:93`<br>TwoFactorSetup | `setError("")` |

#### web/components/wallet/UsdtDepositTab.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2965 | `web/components/wallet/UsdtDepositTab.tsx:45`<br>useEffect@44 | `setIssued(null)` |
| CX-I-2966 | `web/components/wallet/UsdtDepositTab.tsx:46`<br>useEffect@44 | `setCopied(false)` |
| CX-I-2967 | `web/components/wallet/UsdtDepositTab.tsx:47`<br>useEffect@44 | `setAddrError(false)` |
| CX-I-2968 | `web/components/wallet/UsdtDepositTab.tsx:48`<br>useEffect@44 | `setStatus({ kind: "waiting" })` |
| CX-I-2969 | `web/components/wallet/UsdtDepositTab.tsx:55`<br>api .depositAddress(network, userKey) .then@51 | `setIssued({ address: r.address, network, accountId: userKey })` |
| CX-I-2970 | `web/components/wallet/UsdtDepositTab.tsx:56`<br>api .depositAddress(network, userKey) .then@51 | `setAddrError(true)` |
| CX-I-2971 | `web/components/wallet/UsdtDepositTab.tsx:58`<br>api .depositAddress(network, userKey) .then((r) => { if (¬alive) return; if (r.network === network && looksLikeAddress(network, r.address)) setIssued({ address: r.address, network, accountId: userKey }); else setAddrError(true); }) .catch@51 | `setAddrError(true)` |
| CX-I-2972 | `web/components/wallet/UsdtDepositTab.tsx:70`<br>useCallback@66 | `setCopied(true)` |
| CX-I-2973 | `web/components/wallet/UsdtDepositTab.tsx:71`<br>setTimeout@71 | `setCopied(false)` |
| CX-I-2974 | `web/components/wallet/UsdtDepositTab.tsx:82`<br>useEffect@78 | `setStatus({ kind: "checking" })` |
| CX-I-2975 | `web/components/wallet/UsdtDepositTab.tsx:94`<br>check | `setStatus({ kind: "credited", amount: result.amountUsdt, txHash: result.txHash })` |
| CX-I-2976 | `web/components/wallet/UsdtDepositTab.tsx:96`<br>check | `setStatus({ kind: "pending", confirmations: result.confirmations, total: meta.confirmations })` |
| CX-I-2977 | `web/components/wallet/UsdtDepositTab.tsx:98`<br>check | `setStatus({ kind: "waiting" })` |
| CX-I-2978 | `web/components/wallet/UsdtDepositTab.tsx:101`<br>check | `setStatus({ kind: "checking" })` |
| CX-I-2979 | `web/components/wallet/UsdtDepositTab.tsx:129`<br>NETWORKS.map@119 | `setNetwork(n.key)` |

#### web/components/wallet/WalletScreen.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2980 | `web/components/wallet/WalletScreen.tsx:55`<br>poll | `useWalletStore.getState().syncWithdrawal(tx.id, result.status, { txHash: result.txHash, unlockAt: result.unlockAt })` |
| CX-I-2981 | `web/components/wallet/WalletScreen.tsx:64`<br>useEffect@64 | `setNow(Date.now())` |
| CX-I-2982 | `web/components/wallet/WalletScreen.tsx:64`<br>window.setInterval@64 | `setNow(Date.now())` |
| CX-I-2983 | `web/components/wallet/WalletScreen.tsx:80`<br>cancel | `setBusy(true)` |
| CX-I-2984 | `web/components/wallet/WalletScreen.tsx:80`<br>cancel | `setCancelFailed(false)` |
| CX-I-2985 | `web/components/wallet/WalletScreen.tsx:84`<br>cancel | `useWalletStore.getState().syncWithdrawal(current.id, result.status, { txHash: result.txHash, unlockAt: result.unlockAt })` |
| CX-I-2986 | `web/components/wallet/WalletScreen.tsx:85`<br>cancel | `setCancelling(false)` |
| CX-I-2987 | `web/components/wallet/WalletScreen.tsx:86`<br>cancel | `setCancelling(false)` |
| CX-I-2988 | `web/components/wallet/WalletScreen.tsx:86`<br>cancel | `setCancelFailed(true)` |
| CX-I-2989 | `web/components/wallet/WalletScreen.tsx:87`<br>cancel | `setBusy(false)` |
| CX-I-2990 | `web/components/wallet/WalletScreen.tsx:111`<br>rows.slice(0, shown).map@109 | `setOpenId(tx.id)` |
| CX-I-2991 | `web/components/wallet/WalletScreen.tsx:111`<br>rows.slice(0, shown).map@109 | `setCancelFailed(false)` |
| CX-I-2992 | `web/components/wallet/WalletScreen.tsx:119`<br>WalletScreen | `setShown((n) => n + PAGE)` |
| CX-I-2993 | `web/components/wallet/WalletScreen.tsx:124`<br>WalletScreen | `setOpenId(null)` |
| CX-I-2994 | `web/components/wallet/WalletScreen.tsx:138`<br>WalletScreen | `setCancelling(true)` |
| CX-I-2995 | `web/components/wallet/WalletScreen.tsx:145`<br>WalletScreen | `setCancelling(false)` |

#### web/components/wallet/WithdrawScreen.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-2996 | `web/components/wallet/WithdrawScreen.tsx:69`<br>useEffect@69 | `setStage({ kind: "form" })` |
| CX-I-2997 | `web/components/wallet/WithdrawScreen.tsx:69`<br>useEffect@69 | `setEmailOnly(false)` |
| CX-I-2998 | `web/components/wallet/WithdrawScreen.tsx:70`<br>useEffect@70 | `setCode("")` |
| CX-I-2999 | `web/components/wallet/WithdrawScreen.tsx:70`<br>useEffect@70 | `setError("")` |
| CX-I-3000 | `web/components/wallet/WithdrawScreen.tsx:70`<br>useEffect@70 | `setChallenge(null)` |
| CX-I-3001 | `web/components/wallet/WithdrawScreen.tsx:70`<br>useEffect@70 | `setLeft(OTP_MAX_ATTEMPTS)` |
| CX-I-3002 | `web/components/wallet/WithdrawScreen.tsx:72`<br>go | `setStage(next)` |
| CX-I-3003 | `web/components/wallet/WithdrawScreen.tsx:82`<br>setRatio | `setAmountText((+(maxWithdrawable(balance) * ratio).toFixed(2) * rates[currency]).toFixed(decimals))` |
| CX-I-3004 | `web/components/wallet/WithdrawScreen.tsx:93`<br>openTake | `setTaking(true)` |
| CX-I-3005 | `web/components/wallet/WithdrawScreen.tsx:99`<br>onTaken | `setReceived({ prefillUsdt })` |
| CX-I-3006 | `web/components/wallet/WithdrawScreen.tsx:100`<br>onTaken | `setAmountText((prefillUsdt * rates[currency]).toFixed(decimals))` |
| CX-I-3007 | `web/components/wallet/WithdrawScreen.tsx:104`<br>beginConfirm | `setTouched(true)` |
| CX-I-3008 | `web/components/wallet/WithdrawScreen.tsx:108`<br>beginConfirm | `setError("")` |
| CX-I-3009 | `web/components/wallet/WithdrawScreen.tsx:109`<br>beginConfirm | `setStage({ kind: "confirm", amountUsdt, network, address: address.trim() })` |
| CX-I-3010 | `web/components/wallet/WithdrawScreen.tsx:115`<br>useCallback@113 | `setStage({ kind: "form" })` |
| CX-I-3011 | `web/components/wallet/WithdrawScreen.tsx:115`<br>useCallback@113 | `setTouched(true)` |
| CX-I-3012 | `web/components/wallet/WithdrawScreen.tsx:116`<br>useCallback@113 | `setBusy(true)` |
| CX-I-3013 | `web/components/wallet/WithdrawScreen.tsx:116`<br>useCallback@113 | `setError("")` |
| CX-I-3014 | `web/components/wallet/WithdrawScreen.tsx:121`<br>useCallback@113 | `setStage({ kind: "form" })` |
| CX-I-3015 | `web/components/wallet/WithdrawScreen.tsx:123`<br>useCallback@113 | `wallet.debitCrypto(draft.amountUsdt)` |
| CX-I-3016 | `web/components/wallet/WithdrawScreen.tsx:124`<br>useCallback@113 | `wallet.addTransaction({ type: "withdraw", accountId: user.id, serverId: result.id, amountUsdt: -draft.amountUsdt, ref: '${draft.network}:${draft.address}', network: draft.network, address: draft.address, feeUsdt: WITHDRAW_NETWORK_BY_KEY[draft.network].feeUsdt, netUsdt: netReceive(draft.amountUsdt, draft.network), authMethod: proof.method, unlockAt: result.unlockAt, emailMasked: proof.emailMasked,  (전체 식은 근거 줄)` |
| CX-I-3017 | `web/components/wallet/WithdrawScreen.tsx:130`<br>useCallback@113 | `setStage({ kind: "done", status: result.status, net: netReceive(draft.amountUsdt, draft.network), network: draft.network })` |
| CX-I-3018 | `web/components/wallet/WithdrawScreen.tsx:132`<br>useCallback@113 | `setError(te(cause instanceof AccountError ? cause.code : "network"))` |
| CX-I-3019 | `web/components/wallet/WithdrawScreen.tsx:133`<br>useCallback@113 | `setBusy(false)` |
| CX-I-3020 | `web/components/wallet/WithdrawScreen.tsx:139`<br>submitOtp | `setBusy(true)` |
| CX-I-3021 | `web/components/wallet/WithdrawScreen.tsx:139`<br>submitOtp | `setError("")` |
| CX-I-3022 | `web/components/wallet/WithdrawScreen.tsx:143`<br>submitOtp | `setCode("")` |
| CX-I-3023 | `web/components/wallet/WithdrawScreen.tsx:146`<br>submitOtp | `setLeft(remaining)` |
| CX-I-3024 | `web/components/wallet/WithdrawScreen.tsx:147`<br>submitOtp | `setStage({ kind: "email", ...draft })` |
| CX-I-3025 | `web/components/wallet/WithdrawScreen.tsx:148`<br>submitOtp | `setError(t("withdraw.otpWrong", { left: remaining }))` |
| CX-I-3026 | `web/components/wallet/WithdrawScreen.tsx:149`<br>submitOtp | `setError(te(cause instanceof AccountError ? cause.code : "network"))` |
| CX-I-3027 | `web/components/wallet/WithdrawScreen.tsx:150`<br>submitOtp | `setBusy(false)` |
| CX-I-3028 | `web/components/wallet/WithdrawScreen.tsx:154`<br>sendEmail | `setBusy(true)` |
| CX-I-3029 | `web/components/wallet/WithdrawScreen.tsx:154`<br>sendEmail | `setError("")` |
| CX-I-3030 | `web/components/wallet/WithdrawScreen.tsx:154`<br>sendEmail | `setCode("")` |
| CX-I-3031 | `web/components/wallet/WithdrawScreen.tsx:154`<br>sendEmail | `setChallenge(null)` |
| CX-I-3032 | `web/components/wallet/WithdrawScreen.tsx:155`<br>sendEmail | `setChallenge(await sendWithdrawalEmail(draftOf(stage)))` |
| CX-I-3033 | `web/components/wallet/WithdrawScreen.tsx:156`<br>sendEmail | `setError(te(cause instanceof AccountError ? cause.code : "network"))` |
| CX-I-3034 | `web/components/wallet/WithdrawScreen.tsx:157`<br>sendEmail | `setBusy(false)` |
| CX-I-3035 | `web/components/wallet/WithdrawScreen.tsx:161`<br>verifyEmail | `setError(t("withdraw.emailExpired"))` |
| CX-I-3036 | `web/components/wallet/WithdrawScreen.tsx:162`<br>verifyEmail | `setBusy(true)` |
| CX-I-3037 | `web/components/wallet/WithdrawScreen.tsx:162`<br>verifyEmail | `setError("")` |
| CX-I-3038 | `web/components/wallet/WithdrawScreen.tsx:165`<br>verifyEmail | `setCode("")` |
| CX-I-3039 | `web/components/wallet/WithdrawScreen.tsx:165`<br>verifyEmail | `setError(te(cause instanceof AccountError ? cause.code : "network"))` |
| CX-I-3040 | `web/components/wallet/WithdrawScreen.tsx:166`<br>verifyEmail | `setBusy(false)` |
| CX-I-3041 | `web/components/wallet/WithdrawScreen.tsx:183`<br>WithdrawScreen | `setConnecting(true)` |
| CX-I-3042 | `web/components/wallet/WithdrawScreen.tsx:184`<br>WithdrawScreen | `setEmailOnly(true)` |
| CX-I-3043 | `web/components/wallet/WithdrawScreen.tsx:185`<br>WithdrawScreen | `setConnecting(false)` |
| CX-I-3044 | `web/components/wallet/WithdrawScreen.tsx:186`<br>WithdrawScreen | `setConnecting(false)` |
| CX-I-3045 | `web/components/wallet/WithdrawScreen.tsx:208`<br>WithdrawScreen | `setCode(e.target.value.replace(/\D/g, ""))` |
| CX-I-3046 | `web/components/wallet/WithdrawScreen.tsx:218`<br>WithdrawScreen | `setCode(e.target.value.replace(/\D/g, ""))` |
| CX-I-3047 | `web/components/wallet/WithdrawScreen.tsx:244`<br>WithdrawScreen | `setAddress(e.target.value)` |
| CX-I-3048 | `web/components/wallet/WithdrawScreen.tsx:246`<br>WithdrawScreen | `setAmountText(e.target.value.replace(/[^\d.]/g, ""))` |
| CX-I-3049 | `web/components/wallet/WithdrawScreen.tsx:246`<br>WithdrawScreen | `setReceived(null)` |
| CX-I-3050 | `web/components/wallet/WithdrawScreen.tsx:249`<br>[0.25, 0.5, 1].map@249 | `setRatio(ratio)` |
| CX-I-3051 | `web/components/wallet/WithdrawScreen.tsx:249`<br>[0.25, 0.5, 1].map@249 | `setReceived(null)` |
| CX-I-3052 | `web/components/wallet/WithdrawScreen.tsx:262`<br>WithdrawScreen | `setTaking(false)` |

#### web/components/wallet/WithdrawSteps.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3053 | `web/components/wallet/WithdrawSteps.tsx:105`<br>submit | `setBusy(true)` |
| CX-I-3054 | `web/components/wallet/WithdrawSteps.tsx:105`<br>submit | `setError("")` |
| CX-I-3055 | `web/components/wallet/WithdrawSteps.tsx:108`<br>submit | `setCode("")` |
| CX-I-3056 | `web/components/wallet/WithdrawSteps.tsx:111`<br>submit | `setLeft(remaining)` |
| CX-I-3057 | `web/components/wallet/WithdrawSteps.tsx:113`<br>submit | `setError(t("otpWrong", { left: remaining }))` |
| CX-I-3058 | `web/components/wallet/WithdrawSteps.tsx:114`<br>submit | `setError(ta('errors.${cause instanceof AccountError ? cause.code : "network"}'))` |
| CX-I-3059 | `web/components/wallet/WithdrawSteps.tsx:115`<br>submit | `setBusy(false)` |
| CX-I-3060 | `web/components/wallet/WithdrawSteps.tsx:121`<br>OtpStep | `setCode(e.target.value.replace(/\D/g, ""))` |
| CX-I-3061 | `web/components/wallet/WithdrawSteps.tsx:143`<br>send | `setBusy(true)` |
| CX-I-3062 | `web/components/wallet/WithdrawSteps.tsx:143`<br>send | `setError("")` |
| CX-I-3063 | `web/components/wallet/WithdrawSteps.tsx:143`<br>send | `setCode("")` |
| CX-I-3064 | `web/components/wallet/WithdrawSteps.tsx:143`<br>send | `setChallenge(null)` |
| CX-I-3065 | `web/components/wallet/WithdrawSteps.tsx:144`<br>send | `setChallenge(await sendWithdrawalEmail(draft))` |
| CX-I-3066 | `web/components/wallet/WithdrawSteps.tsx:145`<br>send | `setError(ta('errors.${cause instanceof AccountError ? cause.code : "network"}'))` |
| CX-I-3067 | `web/components/wallet/WithdrawSteps.tsx:146`<br>send | `setBusy(false)` |
| CX-I-3068 | `web/components/wallet/WithdrawSteps.tsx:150`<br>verify | `setError(t("emailExpired"))` |
| CX-I-3069 | `web/components/wallet/WithdrawSteps.tsx:151`<br>verify | `setBusy(true)` |
| CX-I-3070 | `web/components/wallet/WithdrawSteps.tsx:151`<br>verify | `setError("")` |
| CX-I-3071 | `web/components/wallet/WithdrawSteps.tsx:153`<br>verify | `setCode("")` |
| CX-I-3072 | `web/components/wallet/WithdrawSteps.tsx:153`<br>verify | `setError(ta('errors.${cause instanceof AccountError ? cause.code : "network"}'))` |
| CX-I-3073 | `web/components/wallet/WithdrawSteps.tsx:154`<br>verify | `setBusy(false)` |
| CX-I-3074 | `web/components/wallet/WithdrawSteps.tsx:160`<br>EmailHoldStep | `send()` |
| CX-I-3075 | `web/components/wallet/WithdrawSteps.tsx:163`<br>EmailHoldStep | `setCode(e.target.value.replace(/\D/g, ""))` |

#### web/components/wallet/WithdrawTab.tsx 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3076 | `web/components/wallet/WithdrawTab.tsx:113`<br>useEffect@113 | `setStage({ kind: "form" })` |
| CX-I-3077 | `web/components/wallet/WithdrawTab.tsx:113`<br>useEffect@113 | `setEmailOnly(false)` |
| CX-I-3078 | `web/components/wallet/WithdrawTab.tsx:132`<br>useCallback@129 | `setCopied(text)` |
| CX-I-3079 | `web/components/wallet/WithdrawTab.tsx:133`<br>setTimeout@133 | `setCopied((c) => (c === text ? null : c))` |
| CX-I-3080 | `web/components/wallet/WithdrawTab.tsx:152`<br>setRatio | `setAmountText((usdt * rates[currency]).toFixed(decimals))` |
| CX-I-3081 | `web/components/wallet/WithdrawTab.tsx:157`<br>useCallback@156 | `setTouched(true)` |
| CX-I-3082 | `web/components/wallet/WithdrawTab.tsx:165`<br>useCallback@156 | `setSubmitError("")` |
| CX-I-3083 | `web/components/wallet/WithdrawTab.tsx:166`<br>useCallback@156 | `setStage({ kind: "confirm", amountUsdt, network, address: address.trim() })` |
| CX-I-3084 | `web/components/wallet/WithdrawTab.tsx:178`<br>useCallback@174 | `setStage({ kind: "form" })` |
| CX-I-3085 | `web/components/wallet/WithdrawTab.tsx:178`<br>useCallback@174 | `setSubmitError(t("errors.insufficient"))` |
| CX-I-3086 | `web/components/wallet/WithdrawTab.tsx:180`<br>useCallback@174 | `setSubmitError("")` |
| CX-I-3087 | `web/components/wallet/WithdrawTab.tsx:180`<br>useCallback@174 | `setStage({ kind: "submitting" })` |
| CX-I-3088 | `web/components/wallet/WithdrawTab.tsx:185`<br>useCallback@174 | `setStage({ kind: "form" })` |
| CX-I-3089 | `web/components/wallet/WithdrawTab.tsx:189`<br>useCallback@174 | `debitCrypto(draft.amountUsdt)` |
| CX-I-3090 | `web/components/wallet/WithdrawTab.tsx:190`<br>useCallback@174 | `addTransaction({ type: "withdraw", accountId: user.id, serverId: result.id, amountUsdt: -draft.amountUsdt, ref: '${draft.network}:${draft.address}', network: draft.network, address: draft.address, feeUsdt: WITHDRAW_NETWORK_BY_KEY[draft.network].feeUsdt, netUsdt: netReceive(draft.amountUsdt, draft.network), authMethod: proof.method, unlockAt: hold, emailMasked: proof.emailMasked, status: result.sta (전체 식은 근거 줄)` |
| CX-I-3091 | `web/components/wallet/WithdrawTab.tsx:197`<br>useCallback@174 | `setStage({ kind: "done", tx, ...draft, review, hold })` |
| CX-I-3092 | `web/components/wallet/WithdrawTab.tsx:199`<br>useCallback@174 | `setSubmitError(ta('errors.${cause instanceof AccountError ? cause.code : "network"}'))` |
| CX-I-3093 | `web/components/wallet/WithdrawTab.tsx:200`<br>useCallback@174 | `setStage({ kind: "form" })` |
| CX-I-3094 | `web/components/wallet/WithdrawTab.tsx:205`<br>reset | `setStage({ kind: "form" })` |
| CX-I-3095 | `web/components/wallet/WithdrawTab.tsx:206`<br>reset | `setAmountText("")` |
| CX-I-3096 | `web/components/wallet/WithdrawTab.tsx:207`<br>reset | `setAddress("")` |
| CX-I-3097 | `web/components/wallet/WithdrawTab.tsx:208`<br>reset | `setTouched(false)` |
| CX-I-3098 | `web/components/wallet/WithdrawTab.tsx:224`<br>WithdrawTab | `setStage({ kind: "form" })` |
| CX-I-3099 | `web/components/wallet/WithdrawTab.tsx:225`<br>WithdrawTab | `setEmailOnly(true)` |
| CX-I-3100 | `web/components/wallet/WithdrawTab.tsx:237`<br>WithdrawTab | `setStage({ kind: "form" })` |
| CX-I-3101 | `web/components/wallet/WithdrawTab.tsx:238`<br>WithdrawTab | `setStage({ kind: emailOnly ? "email" : "otp", amountUsdt: stage.amountUsdt, network: stage.network, address: stage.address })` |
| CX-I-3102 | `web/components/wallet/WithdrawTab.tsx:250`<br>WithdrawTab | `setStage({ kind: "email", ...draft })` |
| CX-I-3103 | `web/components/wallet/WithdrawTab.tsx:251`<br>WithdrawTab | `setStage({ kind: "confirm", ...draft })` |
| CX-I-3104 | `web/components/wallet/WithdrawTab.tsx:258`<br>WithdrawTab | `setStage({ kind: "confirm", ...draft })` |
| CX-I-3105 | `web/components/wallet/WithdrawTab.tsx:375`<br>WITHDRAW_NETWORKS.map@371 | `setNetwork(n.key)` |
| CX-I-3106 | `web/components/wallet/WithdrawTab.tsx:392`<br>WithdrawTab | `setAddress(e.target.value)` |
| CX-I-3107 | `web/components/wallet/WithdrawTab.tsx:392`<br>WithdrawTab | `setTouched(true)` |
| CX-I-3108 | `web/components/wallet/WithdrawTab.tsx:402`<br>WithdrawTab | `setAmountText(e.target.value)` |
| CX-I-3109 | `web/components/wallet/WithdrawTab.tsx:402`<br>WithdrawTab | `setTouched(true)` |
| CX-I-3110 | `web/components/wallet/WithdrawTab.tsx:411`<br>( [ [t("quick25"), 0.25], [t("quick50"), 0.5], [t("quickMax"), 1], ] as const ).map@404 | `setRatio(ratio)` |

#### web/lib/account.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3111 | `web/lib/account.ts:211`<br>announceSessionRevocation | `localStorage.setItem("voila.account-revocation.v1", JSON.stringify({ accountId, at: Date.now(), nonce: crypto.randomUUID() }))` |

#### web/lib/audio.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3112 | `web/lib/audio.ts:35`<br>fetchSample | `sampleBytes.set(name, request)` |
| CX-I-3113 | `web/lib/audio.ts:46`<br>fetchSample(name) .then((bytes) => bytes ? ac.decodeAudioData(bytes.slice(0)) : null) .then@44 | `sampleCache.set(name, buffer)` |
| CX-I-3114 | `web/lib/audio.ts:49`<br>loadSample | `sampleLoading.set(name, request)` |
| CX-I-3115 | `web/lib/audio.ts:176`<br>tone | `osc.frequency.setValueAtTime(freq, start)` |
| CX-I-3116 | `web/lib/audio.ts:177`<br>tone | `osc.detune.setValueAtTime(opts.detune, start)` |
| CX-I-3117 | `web/lib/audio.ts:179`<br>tone | `g.gain.setValueAtTime(0.0001, start)` |
| CX-I-3118 | `web/lib/audio.ts:222`<br>noise | `f.frequency.setValueAtTime(opts.freq, start)` |
| CX-I-3119 | `web/lib/audio.ts:227`<br>noise | `g.gain.setValueAtTime(0.0001, start)` |

#### web/lib/board.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3120 | `web/lib/board.ts:78`<br>parseBoardPosts | `ids.add(p.id)` |
| CX-I-3121 | `web/lib/board.ts:83`<br>parseBoardPosts | `comments.add(c.id)` |

#### web/lib/boardApi.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3122 | `web/lib/boardApi.ts:10`<br>read | `localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(examples))` |
| CX-I-3123 | `web/lib/boardApi.ts:11`<br>read | `localStorage.setItem(BOARD_EXAMPLES_KEY, "1")` |
| CX-I-3124 | `web/lib/boardApi.ts:31`<br>commit | `localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(posts))` |

#### web/lib/browserAccount.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3125 | `web/lib/browserAccount.ts:28`<br>save | `localStorage.setItem(KEY, JSON.stringify(accounts))` |
| CX-I-3126 | `web/lib/browserAccount.ts:71`<br>startBrowserAccount | `save(accounts)` |
| CX-I-3127 | `web/lib/browserAccount.ts:74`<br>startBrowserAccount | `localStorage.setItem(SESSION, account.user.id)` |
| CX-I-3128 | `web/lib/browserAccount.ts:99`<br>request | `save(accounts)` |
| CX-I-3129 | `web/lib/browserAccount.ts:101`<br>request | `save(accounts)` |
| CX-I-3130 | `web/lib/browserAccount.ts:101`<br>request | `localStorage.setItem(SESSION, account.user.id)` |
| CX-I-3131 | `web/lib/browserAccount.ts:109`<br>request | `save(accounts)` |
| CX-I-3132 | `web/lib/browserAccount.ts:110`<br>request | `localStorage.setItem(SESSION, account.user.id)` |
| CX-I-3133 | `web/lib/browserAccount.ts:118`<br>request | `save(accounts)` |
| CX-I-3134 | `web/lib/browserAccount.ts:119`<br>request | `localStorage.setItem(SESSION, account.user.id)` |
| CX-I-3135 | `web/lib/browserAccount.ts:126`<br>request | `save(accounts)` |
| CX-I-3136 | `web/lib/browserAccount.ts:132`<br>request | `save(accounts)` |
| CX-I-3137 | `web/lib/browserAccount.ts:140`<br>persist | `save(accounts)` |
| CX-I-3138 | `web/lib/browserAccount.ts:254`<br>request | `save(accounts.filter(x => x.user.id ¬== account.user.id))` |

#### web/lib/browserWallet.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3139 | `web/lib/browserWallet.ts:14`<br>restoreBrowserAssets | `useWalletStore.persist.setOptions({ name: walletName })` |
| CX-I-3140 | `web/lib/browserWallet.ts:15`<br>restoreBrowserAssets | `useWalletStore.setState({ ...useWalletStore.getInitialState(), ...wallet, hydrated: true })` |
| CX-I-3141 | `web/lib/browserWallet.ts:18`<br>restoreBrowserAssets | `useInventoryStore.persist.setOptions({ name: inventoryName })` |
| CX-I-3142 | `web/lib/browserWallet.ts:19`<br>restoreBrowserAssets | `useInventoryStore.setState({ ...useInventoryStore.getInitialState(), ...inventory, hydrated: true })` |

#### web/lib/catalog2/build.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3143 | `web/lib/catalog2/build.ts:20`<br>poolOf | `poolIndex.set(category, index)` |

#### web/lib/claim.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3144 | `web/lib/claim.ts:19`<br>takeUsdt | `useInventoryStore.getState().sell(ownedIds, REFUND_RATE)` |
| CX-I-3145 | `web/lib/claim.ts:22`<br>takeUsdt | `wallet.creditSplit(result.toCrypto, result.toCard)` |
| CX-I-3146 | `web/lib/claim.ts:24`<br>takeUsdt | `wallet.addTransaction({ type: "sellback", amountUsdt: result.totalUsdt, ref: result.ids.join(","), itemIds: result.ids })` |
| CX-I-3147 | `web/lib/claim.ts:45`<br>requestShipment | `useInventoryStore.setState((state) => ({ items: state.items.map((item) => updated.get(item.id) ?? item) }))` |
| CX-I-3148 | `web/lib/claim.ts:46`<br>requestShipment | `useWalletStore.setState({ balance: wallet.balance as number, cryptoBalance: wallet.cryptoBalance as number, cardBalance: wallet.cardBalance as number })` |
| CX-I-3149 | `web/lib/claim.ts:59`<br>cancelShipment | `api.cancelShipping(item.id, item.shipping?.requestId ?? item.shipping?.requestedAt ?? "")` |
| CX-I-3150 | `web/lib/claim.ts:63`<br>cancelShipment | `useInventoryStore.setState((s) => ({ items: s.items.map((o) => (o.id === item.id ? result.item : o)) }))` |
| CX-I-3151 | `web/lib/claim.ts:64`<br>cancelShipment | `useWalletStore.setState({ balance: result.wallet.balance, cryptoBalance: result.wallet.cryptoBalance, cardBalance: result.wallet.cardBalance })` |
| CX-I-3152 | `web/lib/claim.ts:67`<br>cancelShipment | `useInventoryStore.getState().cancelShipping(item.id)` |
| CX-I-3153 | `web/lib/claim.ts:71`<br>cancelShipment | `wallet.creditSplit(result.toCrypto, result.toCard)` |
| CX-I-3154 | `web/lib/claim.ts:72`<br>cancelShipment | `wallet.addTransaction({ type: "shipping_refund", amountUsdt: result.refundedUsdt, ref: item.shipping?.requestId ?? item.id, status: "COMPLETED" })` |

#### web/lib/community.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3155 | `web/lib/community.ts:30`<br>reviews.filter@28 | `seen.add(review.id)` |

#### web/lib/depositCredit.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3156 | `web/lib/depositCredit.ts:18`<br>recordConfirmedUsdtDeposit | `wallet.addTransaction({ type: "deposit_usdt", accountId: input.accountId, address: input.address, amountUsdt: input.amountUsdt, ref: reference, network: input.network, status: "PENDING" })` |
| CX-I-3157 | `web/lib/depositCredit.ts:19`<br>recordConfirmedUsdtDeposit | `wallet.settleDeposit(pending.id, { amountUsdt: input.amountUsdt, reference, txHash: input.txHash })` |

#### web/lib/i18n.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3158 | `web/lib/i18n.ts:69`<br>setLocale | `set({ locale })` |

#### web/lib/ledgerLock.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3159 | `web/lib/ledgerLock.ts:30`<br>assertLedgerWritable | `localStorage.setItem(probe, value)` |

#### web/lib/opening.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3160 | `web/lib/opening.ts:58`<br>Array.from@58 | `fair.takeNonce()` |
| CX-I-3161 | `web/lib/opening.ts:73`<br>executeOpening | `walletBefore.debitSplit(cost)` |
| CX-I-3162 | `web/lib/opening.ts:90`<br>executeOpening | `inventory.add(drawn.map(({ r, ratio }, i) => ({ itemId: r.item.id, boxSlug: box.slug, valueUsdt: r.item.value, tier: r.tier.key, fair: { serverSeed, serverSeedHash, clientSeed, nonce: r.nonce, roll: r.roll, oddsVersion: oddsVersionOf(box), dropTable: table.map(({ id, dropRate }) => ({ id, dropRate })) }, fundingRatio: ratio, // 기록용 값 둘(돈은 움직이지 않는다): 그때의 1회 가격과 무료 개봉 여부. 나온 상품의 기준(lib/wins)이 읽는다 bo (전체 식은 근거 줄)` |
| CX-I-3163 | `web/lib/opening.ts:102`<br>executeOpening | `inventory.sell(cash, 1)` |
| CX-I-3164 | `web/lib/opening.ts:104`<br>executeOpening | `wallet.creditSplit(settlement.toCrypto, settlement.toCard)` |
| CX-I-3165 | `web/lib/opening.ts:105`<br>executeOpening | `wallet.addTransaction({ type: "sellback", amountUsdt: settlement.totalUsdt, ref: '${box.slug}:cashback x${cash.length}' })` |
| CX-I-3166 | `web/lib/opening.ts:107`<br>executeOpening | `wallet.setBurst(box.slug, pot)` |
| CX-I-3167 | `web/lib/opening.ts:108`<br>executeOpening | `wallet.spendFreeOpens(box.slug, free)` |
| CX-I-3168 | `web/lib/opening.ts:109`<br>executeOpening | `wallet.addTransaction({ type: "open", amountUsdt: -cost, ref: '${box.slug}x${count}${free > 0 ? "+free" + free : ""}${openingId ? ":" + openingId : ""}', rolloverUsdt: rolloverContribution(cost, floorRatio(box)) })` |
| CX-I-3169 | `web/lib/opening.ts:113`<br>executeOpening | `useWalletStore.setState(walletBefore, true)` |
| CX-I-3170 | `web/lib/opening.ts:114`<br>executeOpening | `useInventoryStore.setState(inventoryBefore, true)` |

#### web/lib/openingSound.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3171 | `web/lib/openingSound.ts:26`<br>track | `live.add(node)` |
| CX-I-3172 | `web/lib/openingSound.ts:29`<br>soundStop | `live.clear()` |
| CX-I-3173 | `web/lib/openingSound.ts:36`<br>tone | `osc.frequency.setValueAtTime(freq, at)` |
| CX-I-3174 | `web/lib/openingSound.ts:37`<br>tone | `g.gain.setValueAtTime(0.0001, at)` |
| CX-I-3175 | `web/lib/openingSound.ts:45`<br>noise | `filter.frequency.setValueAtTime(cutoff, at)` |
| CX-I-3176 | `web/lib/openingSound.ts:46`<br>noise | `g.gain.setValueAtTime(gain * MASTER, at)` |

#### web/lib/products.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3177 | `web/lib/products.ts:307`<br>group.forEach@307 | `assigned.set(item.id, found.win[k][i])` |
| CX-I-3178 | `web/lib/products.ts:308`<br>lowB.forEach@308 | `assigned.set(item.id, slotsB[i])` |
| CX-I-3179 | `web/lib/products.ts:309`<br>lowA.forEach@309 | `assigned.set(item.id, slotsA[i])` |
| CX-I-3180 | `web/lib/products.ts:313`<br>withPhysicalSchedule | `assigned.set(cheapest.id, assigned.get(cheapest.id)¬ + SLOTS - total)` |

#### web/lib/proofFeed.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3181 | `web/lib/proofFeed.ts:116`<br>keys.forEach@116 | `seen.add(key)` |

#### web/lib/takeBatch.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3182 | `web/lib/takeBatch.ts:82`<br>creditedIdsOf | `out.add(id)` |
| CX-I-3183 | `web/lib/takeBatch.ts:136`<br>writeMarks | `memoryMarks.set(markKey(), text)` |
| CX-I-3184 | `web/lib/takeBatch.ts:137`<br>writeMarks | `store.setItem(markKey(), text)` |
| CX-I-3185 | `web/lib/takeBatch.ts:141`<br>markedIds | `out.add(id)` |
| CX-I-3186 | `web/lib/takeBatch.ts:163`<br>items.filter@159 | `seen.add(item.id)` |
| CX-I-3187 | `web/lib/takeBatch.ts:337`<br>withLedgerLock@327 | `writeMarks([...marks, { ids, snap: null }])` |
| CX-I-3188 | `web/lib/takeBatch.ts:347`<br>withLedgerLock@327 | `unknown.add(id)` |
| CX-I-3189 | `web/lib/takeBatch.ts:349`<br>withLedgerLock@327 | `left.add(id)` |
| CX-I-3190 | `web/lib/takeBatch.ts:352`<br>withLedgerLock@327 | `left.add(id)` |
| CX-I-3191 | `web/lib/takeBatch.ts:357`<br>withLedgerLock@327 | `writeMarks([...marks, { ids: attempt, snap }])` |
| CX-I-3192 | `web/lib/takeBatch.ts:358`<br>withLedgerLock@327 | `left.add(id)` |
| CX-I-3193 | `web/lib/takeBatch.ts:359`<br>withLedgerLock@327 | `writeMarks(marks)` |
| CX-I-3194 | `web/lib/takeBatch.ts:368`<br>withLedgerLock@327 | `unknown.add(id)` |
| CX-I-3195 | `web/lib/takeBatch.ts:381`<br>withLedgerLock@327 | `writeMarks(doubtful.length ? [...marks, { ids: doubtful, snap }] : marks)` |
| CX-I-3196 | `web/lib/takeBatch.ts:382`<br>withLedgerLock@327 | `unknown.add(id)` |
| CX-I-3197 | `web/lib/takeBatch.ts:383`<br>withLedgerLock@327 | `left.add(id)` |
| CX-I-3198 | `web/lib/takeBatch.ts:383`<br>withLedgerLock@327 | `unknown.add(id)` |
| CX-I-3199 | `web/lib/takeBatch.ts:387`<br>withLedgerLock@327 | `writeMarks(marks)` |
| CX-I-3200 | `web/lib/takeBatch.ts:408`<br>settleTakeMany | `inflight.set(key, job)` |
| CX-I-3201 | `web/lib/takeBatch.ts:426`<br>withLedgerLock@422 | `writeMarks(reviewed.marks)` |

#### web/lib/tiers.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3202 | `web/lib/tiers.ts:84`<br>tierBreakdown | `acc.set(tier.key, { tier, rate: item.dropRate, count: 1, best: item.value })` |

#### web/lib/useCanHover.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3203 | `web/lib/useCanHover.ts:15`<br>sync | `setCan(mq.matches)` |

#### web/lib/useModal.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3204 | `web/lib/useModal.ts:15`<br>updateModalVisibility | `entry.panel.setAttribute("aria-hidden", "true")` |
| CX-I-3205 | `web/lib/useModal.ts:17`<br>updateModalVisibility | `entry.panel.setAttribute("aria-hidden", entry.ariaHidden)` |
| CX-I-3206 | `web/lib/useModal.ts:77`<br>useEffect@26 | `panel.setAttribute("aria-hidden", entry.ariaHidden)` |

#### web/lib/useUsdtDeposit.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3207 | `web/lib/useUsdtDeposit.ts:29`<br>useEffect@28 | `setIssued(null)` |
| CX-I-3208 | `web/lib/useUsdtDeposit.ts:30`<br>useEffect@28 | `setStatus({ kind: "preparing" })` |
| CX-I-3209 | `web/lib/useUsdtDeposit.ts:36`<br>api.depositAddress(network, userKey) .then@33 | `setIssued({ address: r.address, network, accountId: userKey })` |
| CX-I-3210 | `web/lib/useUsdtDeposit.ts:37`<br>api.depositAddress(network, userKey) .then@33 | `setStatus({ kind: "addressFailed" })` |
| CX-I-3211 | `web/lib/useUsdtDeposit.ts:39`<br>api.depositAddress(network, userKey) .then((r) => { if (¬alive) return; if (r.network === network && looksLikeAddress(network, r.address)) setIssued({ address: r.address, network, accountId: userKey }); else setStatus({ kind: "addressFailed" }); }) .catch@33 | `setStatus({ kind: "addressFailed" })` |
| CX-I-3212 | `web/lib/useUsdtDeposit.ts:49`<br>useEffect@45 | `setStatus({ kind: "waiting" })` |
| CX-I-3213 | `web/lib/useUsdtDeposit.ts:58`<br>check | `setStatus({ kind: "credited", amount: result.amountUsdt, txHash: result.txHash })` |
| CX-I-3214 | `web/lib/useUsdtDeposit.ts:60`<br>check | `setStatus({ kind: "pending", confirmations: result.confirmations, total: meta.confirmations })` |
| CX-I-3215 | `web/lib/useUsdtDeposit.ts:62`<br>check | `setStatus({ kind: "waiting" })` |
| CX-I-3216 | `web/lib/useUsdtDeposit.ts:65`<br>check | `setStatus({ kind: "waiting" })` |

#### web/stores/authStore.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3217 | `web/stores/authStore.ts:25`<br>markSessionLost | `get().clearSession()` |
| CX-I-3218 | `web/stores/authStore.ts:25`<br>markSessionLost | `set({ sessionLost: true })` |
| CX-I-3219 | `web/stores/authStore.ts:26`<br>openAuthModal | `set({ isModalOpen: true, modalMode })` |
| CX-I-3220 | `web/stores/authStore.ts:27`<br>closeAuthModal | `set({ isModalOpen: false })` |
| CX-I-3221 | `web/stores/authStore.ts:27`<br>setModalMode | `set({ modalMode })` |
| CX-I-3222 | `web/stores/authStore.ts:29`<br>acceptSession | `set({ sessionLost: false })` |
| CX-I-3223 | `web/stores/authStore.ts:30`<br>acceptSession | `useSecurityStore.getState().reset(user.id)` |
| CX-I-3224 | `web/stores/authStore.ts:32`<br>acceptSession | `set({ user: { id: user.id, label: user.nickname &#124;&#124; user.email, nickname: user.nickname, nicknameUpdatedAt: nicknameAt, nicknameChangedAt: nicknameAt, nextNicknameChangeAt: user.nextNicknameChangeAt, avatarUrl: user.avatarUrl, email: user.email, provider: user.provider ?? "email", passwordFailures: user.passwordFailures ?? 0, passwordChangedAt: user.passwordChangedAt, sessionVersion: user (전체 식은 근거 줄)` |
| CX-I-3225 | `web/stores/authStore.ts:39`<br>updateNickname | `get().acceptSession(updated)` |
| CX-I-3226 | `web/stores/authStore.ts:52`<br>updateAvatar | `get().acceptSession(updated)` |
| CX-I-3227 | `web/stores/authStore.ts:60`<br>refreshAccount | `get().acceptSession(user)` |
| CX-I-3228 | `web/stores/authStore.ts:64`<br>setPasswordFailures | `set(s => s.user?.id === accountId ? { user: { ...s.user, passwordFailures: failures } } : s)` |
| CX-I-3229 | `web/stores/authStore.ts:66`<br>clearSession | `useSecurityStore.getState().reset(null)` |
| CX-I-3230 | `web/stores/authStore.ts:66`<br>clearSession | `set({ user: null, isModalOpen: false })` |
| CX-I-3231 | `web/stores/authStore.ts:69`<br>logout | `get().clearSession()` |
| CX-I-3232 | `web/stores/authStore.ts:69`<br>logout | `get().pushToast(text, "neutral")` |
| CX-I-3233 | `web/stores/authStore.ts:72`<br>pushToast | `set({ toast: { id, text, tone } })` |
| CX-I-3234 | `web/stores/authStore.ts:73`<br>window.setTimeout@73 | `get().clearToast(id)` |
| CX-I-3235 | `web/stores/authStore.ts:75`<br>clearToast | `set(s => s.toast?.id === id ? { toast: null } : s)` |
| CX-I-3236 | `web/stores/authStore.ts:85`<br>rehydrateAuth | `useAuthStore.getState().acceptSession(await getAccountSession())` |
| CX-I-3237 | `web/stores/authStore.ts:88`<br>rehydrateAuth | `useSecurityStore.getState().reset(null)` |
| CX-I-3238 | `web/stores/authStore.ts:91`<br>rehydrateAuth | `useAuthStore.setState({ hydrated: true })` |

#### web/stores/communityStore.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3239 | `web/stores/communityStore.ts:21`<br>persistReviews | `window.localStorage.setItem("gachaflix.community", JSON.stringify({ state: { mine }, version: 0 }))` |
| CX-I-3240 | `web/stores/communityStore.ts:38`<br>add | `persistReviews(mine)` |
| CX-I-3241 | `web/stores/communityStore.ts:38`<br>add | `set({ mine })` |
| CX-I-3242 | `web/stores/communityStore.ts:46`<br>update | `persistReviews(mine)` |
| CX-I-3243 | `web/stores/communityStore.ts:46`<br>update | `set({ mine })` |
| CX-I-3244 | `web/stores/communityStore.ts:53`<br>remove | `persistReviews(mine)` |
| CX-I-3245 | `web/stores/communityStore.ts:53`<br>remove | `set({ mine })` |
| CX-I-3246 | `web/stores/communityStore.ts:59`<br>onRehydrateStorage | `useCommunityStore.setState({ hydrated: true })` |
| CX-I-3247 | `web/stores/communityStore.ts:70`<br>storage | `useCommunityStore.setState({ mine: [], hydrated: true })` |

#### web/stores/currencyStore.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3248 | `web/stores/currencyStore.ts:39`<br>setCurrency | `set({ currency })` |
| CX-I-3249 | `web/stores/currencyStore.ts:40`<br>setRates | `set((s) => ({ rates: { ...s.rates, ...r } }))` |
| CX-I-3250 | `web/stores/currencyStore.ts:50`<br>onRehydrateStorage | `state.setCurrency("USD")` |
| CX-I-3251 | `web/stores/currencyStore.ts:51`<br>onRehydrateStorage | `state?.setRates({})` |
| CX-I-3252 | `web/stores/currencyStore.ts:52`<br>onRehydrateStorage | `useCurrencyStore.setState({ hydrated: true })` |

#### web/stores/dailyStore.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3253 | `web/stores/dailyStore.ts:32`<br>record | `set((s) => ({ lastOpenedAt: rec.at, history: [rec, ...s.history].slice(0, 30) }))` |
| CX-I-3254 | `web/stores/dailyStore.ts:41`<br>onRehydrateStorage | `useDailyStore.setState({ hydrated: true })` |

#### web/stores/fairStore.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3255 | `web/stores/fairStore.ts:49`<br>ensureSeeds | `set(next)` |
| CX-I-3256 | `web/stores/fairStore.ts:53`<br>rotateServerSeed | `set({ serverSeed: seed, serverSeedHash: await hashServerSeed(seed), nonce: 0 })` |
| CX-I-3257 | `web/stores/fairStore.ts:55`<br>setClientSeed | `set({ clientSeed: clientSeed.trim() &#124;&#124; generateClientSeed(), nonce: 0 })` |
| CX-I-3258 | `web/stores/fairStore.ts:58`<br>takeNonce | `set({ nonce: n + 1 })` |
| CX-I-3259 | `web/stores/fairStore.ts:68`<br>onRehydrateStorage | `useFairStore.setState({ hydrated: true })` |

#### web/stores/flowStore.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3260 | `web/stores/flowStore.ts:26`<br>openCharge | `set({ charge: true })` |
| CX-I-3261 | `web/stores/flowStore.ts:27`<br>closeCharge | `set({ charge: false })` |
| CX-I-3262 | `web/stores/flowStore.ts:28`<br>openMenu | `set({ menu: true })` |
| CX-I-3263 | `web/stores/flowStore.ts:29`<br>closeMenu | `set({ menu: false })` |
| CX-I-3264 | `web/stores/flowStore.ts:30`<br>openBalance | `set({ balance: true })` |
| CX-I-3265 | `web/stores/flowStore.ts:31`<br>closeBalance | `set({ balance: false })` |

#### web/stores/inventoryStore.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3266 | `web/stores/inventoryStore.ts:75`<br>add | `set((s) => ({ items: [...recs, ...s.items] }))` |
| CX-I-3267 | `web/stores/inventoryStore.ts:86`<br>sell | `set((s) => ({ items: s.items.map((it) => { if (¬set_.has(it.id) &#124;&#124; it.status ¬== "IN_STORAGE") return it; const refund = +(it.valueUsdt * refundRate).toFixed(2); if (¬Number.isFinite(refund) &#124;&#124; refund <= 0) return it; total += refund; sold.push(it.id); refunds.push({ amountUsdt: refund, ratio: normalizeRatio(it.fundingRatio) }); return { ...it, status: "SOLD", soldForUsdt: refu (전체 식은 근거 줄)` |
| CX-I-3268 | `web/stores/inventoryStore.ts:118`<br>requestShipping | `ratios.set(it.id, { crypto: itemCents ? fromCrypto / itemCents : 0, card: itemCents ? 1 - fromCrypto / itemCents : 1 })` |
| CX-I-3269 | `web/stores/inventoryStore.ts:120`<br>requestShipping | `set((s) => ({ items: s.items.map((it) => fees.has(it.id) ? { ...it, status: "SHIPPING_REQUESTED", shipping: { address, feeUsdt: fees.get(it.id)¬, requestedAt: now, requestId, feeFundingRatio: ratios.get(it.id) } } : it, ), }))` |
| CX-I-3270 | `web/stores/inventoryStore.ts:136`<br>cancelShipping | `set(s => ({ items: s.items.map(it => it.id === id ? { ...it, status: "IN_STORAGE", shipping: undefined, shippingCancellations: [...(it.shippingCancellations ?? []), cancelled] } : it) }))` |
| CX-I-3271 | `web/stores/inventoryStore.ts:140`<br>markShipping | `set((s) => ({ items: s.items.map((it) => it.id === id && it.status === "SHIPPING_REQUESTED" && it.shipping ? { ...it, status: "SHIPPING", shipping: { ...it.shipping, carrier, trackingNumber, shippedAt: new Date().toISOString() } } : it, ), }))` |
| CX-I-3272 | `web/stores/inventoryStore.ts:153`<br>onRehydrateStorage | `useInventoryStore.setState({ hydrated: true })` |

#### web/stores/openingJournal.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3273 | `web/stores/openingJournal.ts:29`<br>markSeen | `set((s) => { if (s.seen[openingId]) return s; const entries = [...Object.entries(s.seen), [openingId, new Date().toISOString()] as [string, string]]; return { seen: Object.fromEntries(entries.slice(-KEEP)) }; })` |
| CX-I-3274 | `web/stores/openingJournal.ts:40`<br>onRehydrateStorage | `useOpeningJournal.setState({ hydrated: true })` |
| CX-I-3275 | `web/stores/openingJournal.ts:57`<br>unseenOpenings | `groups.set(item.openingId, group)` |

#### web/stores/securityStore.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3276 | `web/stores/securityStore.ts:16`<br>reset | `set({ userId, twoFactorEnabled: false, enabledAt: null, hydrated: false, error: false })` |
| CX-I-3277 | `web/stores/securityStore.ts:17`<br>accept | `set({ ...status, hydrated: true, error: false })` |
| CX-I-3278 | `web/stores/securityStore.ts:20`<br>refresh | `set({ error: false })` |
| CX-I-3279 | `web/stores/securityStore.ts:21`<br>refresh | `get().accept(userId, await getSecurityStatus())` |
| CX-I-3280 | `web/stores/securityStore.ts:22`<br>refresh | `set({ hydrated: false, error: true })` |

#### web/stores/settingsStore.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3281 | `web/stores/settingsStore.ts:33`<br>toggleMuted | `set((s) => ({ muted: ¬s.muted }))` |
| CX-I-3282 | `web/stores/settingsStore.ts:38`<br>setOpenSound | `set({ openSound })` |
| CX-I-3283 | `web/stores/settingsStore.ts:39`<br>setOpenShort | `set({ openShort })` |
| CX-I-3284 | `web/stores/settingsStore.ts:40`<br>setAutoTake | `set((s) => ({ autoTakeBy: { ...s.autoTakeBy, [accountId]: on } }))` |
| CX-I-3285 | `web/stores/settingsStore.ts:41`<br>setLastReceive | `set((s) => ({ lastReceiveBy: { ...s.lastReceiveBy, [accountId]: method } }))` |

#### web/stores/telemetryStore.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3286 | `web/stores/telemetryStore.ts:23`<br>recordSpin | `set((s) => ({ spinTimes: [...s.spinTimes, at].slice(-KEEP) }))` |
| CX-I-3287 | `web/stores/telemetryStore.ts:24`<br>clear | `set({ spinTimes: [] })` |

#### web/stores/uiStore.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3288 | `web/stores/uiStore.ts:21`<br>openDeposit | `set({ depositOpen: true })` |
| CX-I-3289 | `web/stores/uiStore.ts:22`<br>closeDeposit | `set({ depositOpen: false })` |
| CX-I-3290 | `web/stores/uiStore.ts:23`<br>setDepositHost | `set({ depositHost: on })` |

#### web/stores/usePublishedReviews.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3291 | `web/stores/usePublishedReviews.ts:20`<br>loadCommunityReviews().then@20 | `setRemote(records)` |
| CX-I-3292 | `web/stores/usePublishedReviews.ts:21`<br>updated | `setRemote(records)` |

#### web/stores/walletStore.ts 상태 및 자료 쓰기

| ID | 근거와 소유 함수 | 바꾸는 값과 호출 식 |
|---|---|---|
| CX-I-3293 | `web/stores/walletStore.ts:149`<br>setBurst | `set((s) => ({ burst: { ...(s.burst ?? {}), [boxSlug]: pot } }))` |
| CX-I-3294 | `web/stores/walletStore.ts:154`<br>claimWelcomeBoxes | `set((s) => ({ freeOpensGranted: true, freeOpens: { ...(s.freeOpens ?? {}), [WELCOME_BOX_SLUG]: (s.freeOpens?.[WELCOME_BOX_SLUG] ?? 0) + WELCOME_FREE_OPENS } }))` |
| CX-I-3295 | `web/stores/walletStore.ts:157`<br>spendFreeOpens | `set((s) => ({ freeOpens: { ...(s.freeOpens ?? {}), [boxSlug]: Math.max(0, (s.freeOpens?.[boxSlug] ?? 0) - Math.max(0, Math.floor(n))) } }))` |
| CX-I-3296 | `web/stores/walletStore.ts:167`<br>addTransaction | `set((s) => ({ transactions: [rec, ...s.transactions], totalDepositedCrypto: +(s.totalDepositedCrypto + depositedCrypto).toFixed(2), totalDepositedCard: +(s.totalDepositedCard + depositedCard).toFixed(2), totalDeposited: +(s.totalDeposited + depositedCrypto + depositedCard).toFixed(2), totalWagered: +(s.totalWagered + wagered).toFixed(2), }))` |
| CX-I-3297 | `web/stores/walletStore.ts:182`<br>settleDeposit | `set({ transactions: s.transactions.map(x => x.id === id ? { ...x, status: "CANCELLED" } : x) })` |
| CX-I-3298 | `web/stores/walletStore.ts:187`<br>settleDeposit | `set({ ...sync(+(s.cryptoBalance + crypto).toFixed(2), +(s.cardBalance + card).toFixed(2)), transactions: s.transactions.map(x => x.id === id ? { ...x, amountUsdt: input.amountUsdt, ref: input.reference, txHash: input.txHash, receipt: input.receipt, status: "COMPLETED" } : x), settledDepositRefs: [...s.settledDepositRefs, key], totalDepositedCrypto: +(s.totalDepositedCrypto + crypto).toFixed(2), to (전체 식은 근거 줄)` |
| CX-I-3299 | `web/stores/walletStore.ts:197`<br>syncWithdrawal | `set(s => { const tx = s.transactions.find(x => x.id === id); if (¬tx &#124;&#124; tx.type ¬== "withdraw" &#124;&#124; ["COMPLETED", "CANCELLED", "FAILED"].includes(tx.status ?? "")) return {}; const refund = ["CANCELLED", "FAILED"].includes(status) ? Math.abs(tx.amountUsdt) : 0; return { ...sync(+(s.cryptoBalance + refund).toFixed(2), s.cardBalance), transactions: s.transactions.map(x => x.id ===  (전체 식은 근거 줄)` |
| CX-I-3300 | `web/stores/walletStore.ts:204`<br>setTransactionStatus | `set((s) => { const prev = s.transactions.find((x) => x.id === id); if (¬prev &#124;&#124; ["COMPLETED", "CANCELLED", "FAILED"].includes(prev.status ?? "") &#124;&#124; (prev.status === undefined && ["deposit_usdt", "deposit_card"].includes(prev.type))) return {}; const transactions = s.transactions.map((x) => (x.id === id ? { ...x, status, ...patch } : x)); // 확인 대기였던 입금이 확정되는 순간에만 롤오버 요구액이 올라간다(중 (전체 식은 근거 줄)` |
| CX-I-3301 | `web/stores/walletStore.ts:225`<br>cancelHeldWithdrawal | `set((s) => ({ ...sync(+(s.cryptoBalance + refund).toFixed(2), s.cardBalance), transactions: s.transactions.map((x) => (x.id === id ? { ...x, status: "CANCELLED" as TxStatus } : x)), }))` |
| CX-I-3302 | `web/stores/walletStore.ts:231`<br>debit | `get().debitSplit(usdt)` |
| CX-I-3303 | `web/stores/walletStore.ts:235`<br>debitCrypto | `set((x) => sync(+(x.cryptoBalance - usdt).toFixed(2), x.cardBalance))` |
| CX-I-3304 | `web/stores/walletStore.ts:242`<br>debitSplit | `set((x) => sync(+(x.cryptoBalance - plan.fromCrypto).toFixed(2), +(x.cardBalance - plan.fromCard).toFixed(2)))` |
| CX-I-3305 | `web/stores/walletStore.ts:245`<br>credit | `set((s) => sync(to === "crypto" ? +(s.cryptoBalance + usdt).toFixed(2) : s.cryptoBalance, to === "card" ? +(s.cardBalance + usdt).toFixed(2) : s.cardBalance))` |
| CX-I-3306 | `web/stores/walletStore.ts:246`<br>creditSplit | `set((s) => sync(+(s.cryptoBalance + toCrypto).toFixed(2), +(s.cardBalance + toCard).toFixed(2)))` |
| CX-I-3307 | `web/stores/walletStore.ts:247`<br>topUp | `set((s) => sync(+(s.cryptoBalance + START_BALANCE_USDT).toFixed(2), s.cardBalance))` |
| CX-I-3308 | `web/stores/walletStore.ts:248`<br>setWelcomeAccount | `set((s) => ({ welcomeClaimed: ¬¬accountId && s.transactions.some((tx) => tx.type === "bonus" && tx.ref === "welcome" && tx.accountId === accountId), }))` |
| CX-I-3309 | `web/stores/walletStore.ts:254`<br>claimWelcome | `set((state) => ({ ...sync(+(state.cryptoBalance + WELCOME_BONUS_USDT).toFixed(2), state.cardBalance), welcomeClaimed: true }))` |
| CX-I-3310 | `web/stores/walletStore.ts:255`<br>claimWelcome | `get().addTransaction({ type: "bonus", amountUsdt: WELCOME_BONUS_USDT, ref: "welcome", accountId })` |
| CX-I-3311 | `web/stores/walletStore.ts:293`<br>onRehydrateStorage | `useWalletStore.setState({ hydrated: true })` |

### 9.6 기존 테스트 파일 전체 지도

코드에서 읽은 것. 기준 커밋의 추적된 테스트 56개 파일만 사용했다. 조사 중 생긴 미추적 `web/tests/parityGolden.test.ts`는 기준 자료가 아니므로 읽지 않았고 지도에서 제외했다. `rtk git diff --name-only -- web`는 비어 있어 추적 소스 변경이 없음을 재확인했다. 아래의 보호 목적은 파일마다 한 줄이며, 실제 실행 결과는 CX-F-003이다.

| ID | 파일과 test 근거 | 지키는 것 |
|---|---|---|
| CX-F-200 | `web/tests/aboutStats.test.ts:20` | 옛 소개의 잭팟 합계, 공개 확률 수, RTP와 정책 상수 |
| CX-F-201 | `web/tests/account.test.ts:7` | API 주소, cookie/CSRF, 입력 경계, 탈퇴 자산 관문 |
| CX-F-202 | `web/tests/accountClosureFlow.test.ts:7` | 옛 탈퇴의 잔액, 진행 거래, 보관품 관문과 만료 코드 |
| CX-F-203 | `web/tests/accountHttp.test.ts:6` | 격리 HTTP 서버로 계정과 출금 계약, browser fallback 미사용 |
| CX-F-204 | `web/tests/accountWallet.test.ts:14` | 보안 응답의 계정 격리, 입금 단일 정산, terminal 거래와 취소 |
| CX-F-205 | `web/tests/audio.test.ts:5` | 옛 오디오 샘플의 제스처 재생 잠금 해제 |
| CX-F-206 | `web/tests/auth.test.ts:21` | phone 포맷과 마스킹, OTP, 인증 진입, authStore의 자산 키 미참조 |
| CX-F-207 | `web/tests/autoplay.test.ts:8` | 개봉/반복 프리셋, 배수/손실/잔액/잭팟 정지 순수 규칙 |
| CX-F-208 | `web/tests/board.test.ts:9` | 게시판 소유권과 CRUD, 공지 권한, revision, 검색과 정렬 |
| CX-F-209 | `web/tests/boardApi.test.ts:7` | 브라우저 게시판 저장, 세션 재확인, 권한과 저장 실패 보존 |
| CX-F-210 | `web/tests/browserAccount.test.ts:6` | 브라우저 등록과 로그인, 닉네임, OTP, 대기 출금과 취소 계약 |
| CX-F-211 | `web/tests/burst.test.ts:14` | 터짐 게이지 적립과 지급, 자금 원천, RTP와 구매 rollback |
| CX-F-212 | `web/tests/carriers.test.ts:6` | 국내/해외 택배 선택, 운송장 형식과 공식 조회 주소 |
| CX-F-213 | `web/tests/chainRecord.test.ts:34` | 당시 표와 정확한 ownedId, chain 없음과 fixture 상태, 다국어 정적 마크업 |
| CX-F-214 | `web/tests/claim.test.ts:19` | USDT 한 번 지급, 출고전 취소와 환불 근거 부족 차단 |
| CX-F-215 | `web/tests/community.test.ts:14` | 최소100과 실제 개봉 후기, 예시 출처/회전/초기화 및 타탭 비접두어 이벤트 |
| CX-F-216 | `web/tests/dailyBox.test.ts:7` | 미도달 하루 무료 박스 확률과 지급 범위, 24시간 cooldown |
| CX-F-217 | `web/tests/depositAddress.test.ts:29` | 체인 메타, 주소 형식과 우선순위, 영수증 컨펌과 단일 정산 |
| CX-F-218 | `web/tests/depositCredit.test.ts:6` | 최소1 USDT 및 receipt 반복 지급 차단 |
| CX-F-219 | `web/tests/engine.test.ts:34` | 미도달 옛 엔진의 booster/VIP, 확률 분포, catalogue와 copy |
| CX-F-220 | `web/tests/fairness-record.test.ts:13` | 당시 저장표와 seed/roll/item 변조, legacy partial 판정 |
| CX-F-221 | `web/tests/fairness.test.ts:20` | SHA256/HMAC 표준 벡터, seed/nonce, 백만 칸과 확률 구간 경계 |
| CX-F-222 | `web/tests/formatCurrency.test.ts:8` | 환산, 반올림/축약, 숫자와 단위 분리, 표시 통화 혼용 차단 |
| CX-F-223 | `web/tests/fraudScoring.test.ts:20` | 미도달 위험 점수와 봇, 큰 출금, 시간 창 및 circuit breaker |
| CX-F-224 | `web/tests/freeOpens.test.ts:25` | 가입 무료2회 한 번 지급, 무료/유료 혼합과 실패 복원, 없는 터짐 skip |
| CX-F-225 | `web/tests/funding.test.ts:6` | crypto 우선 차감과 mixed 비율, 자금 원천 환급/반올림, 구버전 원천 |
| CX-F-226 | `web/tests/gachaItems.test.ts:11` | 미도달 별도30개 데이터의 ID, 등급, 가치, 이미지와 팔레트 |
| CX-F-227 | `web/tests/i18n.test.ts:23` | 옛 메시지3벌의 키, 인자, 금지 문구와 상품 문자열 |
| CX-F-228 | `web/tests/inventory.test.ts:20` | 자동 판매 없음, 판매와 배송 상태, 주소/fee, 출금 상태와 welcome |
| CX-F-229 | `web/tests/legal.test.ts:9` | 언어 반복으로 법률13개 문서, linked 목록, ICU/버전/수수료 일치 |
| CX-F-230 | `web/tests/liveDrops.test.ts:21` | 옛 feed의 이름 마스킹, 실제 기록에서 당첨/출고/환급 선정 |
| CX-F-231 | `web/tests/localFiat.test.ts:9` | 미도달 소개용 locale 통화와 환율/축약, 최소 시작 금액 |
| CX-F-232 | `web/tests/nicknameRules.test.ts:7` | 닉네임 형식과 금칙어, 초기/14일 cooldown과 남은 일수 |
| CX-F-233 | `web/tests/opening.test.ts:20` | 선배정, 중복 실행, 표 snapshot, 확인 취소, 잔액 부족과 동시 구매 |
| CX-F-234 | `web/tests/openingFlow.test.ts:15` | 결과 톤/차이/연출 시간, 자동 받기, 상태 기계와 rollback/계정 고정/복구 |
| CX-F-235 | `web/tests/passwordChangeFlow.test.ts:36` | 서비스의 password 사전 확인과 잠금, purpose 코드/TOTP, 세션 폐기와 탈퇴 |
| CX-F-236 | `web/tests/physical.test.ts:18` | 실물100개와 백만 칸, RTP99, 무현금/무터짐, 구간과 가격 경계 |
| CX-F-237 | `web/tests/products.test.ts:9` | 기존/새 catalogue의 가격/확률/RTP, 사다리/구성/필수자료와 ID |
| CX-F-238 | `web/tests/profile.test.ts:7` | 닉네임 중복/금칙어/cooldown, avatar 입력과 HTTP 오류 이유 |
| CX-F-239 | `web/tests/proofFeed.test.ts:11` | 옛 proof의 실제 거래 집계, 검증 성공, 정렬/중복 및 API 형식 |
| CX-F-240 | `web/tests/ranking.test.ts:24` | 미도달 주간 순위의 시즌/상금/필터, 실제 기록과 공석 |
| CX-F-241 | `web/tests/reel.test.ts:7` | 미도달 릴의 target/감속/쇼케이스/니어미스와 실제 결과 보존 |
| CX-F-242 | `web/tests/rollover.test.ts:6` | 누적 입금/개봉 요구액, 카드 제외, 저위험 가중치와 이상값 |
| CX-F-243 | `web/tests/securityApi.test.ts:4` | 보안/닉네임 응답 검증과 draft-bound 출금 proof |
| CX-F-244 | `web/tests/shipping-cancellation.test.ts:7` | 취소 단일 환불, batch fee와 source cents, legacy 근거 부족 차단 |
| CX-F-245 | `web/tests/shipping.test.ts:8` | KR phone 포맷, 통관 발급 Link와 위조 보상 상수 |
| CX-F-246 | `web/tests/takeBatch.test.ts:32` | 동일/겹친 요청 단일 지급, 개별 반올림과 원천, quote와 결과 병합, 출금 prefill |
| CX-F-247 | `web/tests/takeFault.test.ts:87` | 저장 throw/무시/읽기 실패/한도, 불일치 장부와 확인 표시 복구, 재지급 차단 |
| CX-F-248 | `web/tests/tiers.test.ts:21` | 배수 경계와4개 등급, 분포/색/바닥과 본전 이상 확률 |
| CX-F-249 | `web/tests/totp.test.ts:24` | RFC6238 벡터, Base32/URI/난수, 시간 오차와 OTP 형식 |
| CX-F-250 | `web/tests/vMessages.test.ts:20` | 새 메시지3벌의 키/변수와 받기/당첨/검증 문구, 금지 표현과 옛 수령선택 제거 |
| CX-F-251 | `web/tests/vault-records.test.ts:12` | 보관/배송/완료 분리와 날짜, 개별 환급 합계, 후기 자격과 저장 장애 |
| CX-F-252 | `web/tests/walletSplit.test.ts:15` | crypto/card 합계와 원천별 차감/환급, 카드 출금 차단, rollover와 초기0 |
| CX-F-253 | `web/tests/wins.test.ts:28` | 실제2배 이상 기록, 당시 box 가격과 무료, 처리뒤 보존과 순서/마스킹/다국어 |
| CX-F-254 | `web/tests/withdrawHold.test.ts:8` | 정확히72시간, countdown/이메일 마스킹, 확정 입금 누계와 취소 환불 한 번 |
| CX-F-255 | `web/tests/withdrawal.test.ts:10` | network fee와 최소20, 주소/실수령액/MAX, 잘못된 입력과 explorer 형식 |

CX-F-260. 398개 중1개 skip은 `freeOpens.test.ts:72`다. 금액과 저장장애 helper 테스트는 강하지만 새 시트와 서비스 호출 순서, LAB wrapper와 native storage 이벤트, 정적 배포 직접 주소는 충분히 보호하지 않는다. 테스트의 부재는 8절의 상태 전이 ID에 연결했다.

CX-F-261. 이번 조사에서 라우트별 고유 후보는 fixed16종 곱하기3, box1002, legal39로1089개다. gallery3개는 production guard로 정상 갤러리 UI를 그리지 않는다. root redirect와404는 별도다. 빌드 파일 수나 실제 배포 URL 전부를1089개 검증했다고 기록하지 않았다. 근거 `app/[locale]/layout.tsx:14`, `box/[slug]/page.tsx:8`, `legal/[doc]/page.tsx:8`, `dev/gallery/page.tsx:8`.

## 10. 총괄이 꼭 알아야 할 것 열 가지

1. **CX-P1-01, 차감되지 않은 출금을 취소하면 잔액이 생길 수 있다.** 요청 중 잔액이 달라졌을 때 `debitCrypto` 실패를 무시하는 UI와 무조건 환불하는 store의 조합이다. 메모리 연산 재현에서 잔액0이30이 됐다. 실제 UI 경합 자체는 미실행이다. `WithdrawScreen.tsx:123`, `walletStore.ts:197`.

2. **CX-P1-02, 개봉의 성공 표시가 저장 성공을 보장하지 않는다.** 작은 probe는 저장돼도 큰 wallet/inventory 쓰기는 quota shim이 조용히 누락시킨다. 결과1개 성공, 저장 보관함0을 직접 재현했다. refresh로 결과와 장부가 달라질 수 있다. `labSite.ts:19`, `ledgerLock.ts:29`, `opening.ts:90`.

3. **CX-P1-03, 지금 계정 화면의 비밀번호 변경은 일반 진입에서 완료되지 않는다.** 새 PasswordSheet가 필수 사전 인증과 코드 발급을 건너뛴다. adapter 응답 verification_required를 확인했다. 옛 흐름 테스트 통과는 이 화면의 완주가 아니다. `AccountSheets.tsx:61`, `browserAccount.ts:232`.

4. **CX-P1-04, 지금 계정 화면의 탈퇴는 거절되는 옛 API를 호출한다.** 자산이 없어도 legacy closure는 verification_required다. 새 인증 코드 경로는 서비스에 있지만 화면에 연결되지 않았다. `AccountSheets.tsx:90`, `account.ts:191`, `browserAccount.ts:147`.

5. **CX-P1-05, 현재 API 없는 배포의 새 배송 신청은 unavailable이다.** ShipSheet가 사용하는 shipping/request를 browser adapter가 구현하지 않았다. store 직접 배송 테스트는 이 연결 누락을 놓친다. `claim.ts:36`, `browserAccount.ts:339`.

6. **CX-P1-06, 접두어 저장소를 적용하면 타탭 세션 폐기가 즉시 동작하지 않는다.** native storage 이벤트는 물리 키를 보내는데 listener는 원래 키만 비교한다. 접두어 이벤트로 user가 남는 것을 직접 확인했다. focus 재검사와 구분해야 한다. `labSite.ts:19`, `authStore.ts:101`, `:105`.

7. **CX-P1-07, 지갑에서 개봉과 상품 받기 내역이 숨겨진다.** 기록에 accountId가 없고 화면은 accountId 일치만 보여 준다. 전체1건이 표시0건인 필터 결과를 확인했다. 장부 키가 계정별이라는 사실이 이 UI 필터를 보완하지 않는다. `opening.ts:109`, `claim.ts:24`, `WalletScreen.tsx:66`.

8. **CX-F-049와050, 이 구현은 브라우저 시험 계정과 장부다.** 초기 로그인은 임의 password를 받으며 일부 OTP와 email 코드는 실제 발급값 대조가 아닌6자리 형식만 확인한다. 보안의 TOTP 순수 함수 테스트와 다른 경로다. 출금 요청도 실제 wallet 동결이나 체인 전송을 만들지 않는다. 이 상태를 인증 또는 금융 backend 완성으로 분류하면 안 된다. `browserAccount.ts:84`, `:96`, `:288`, `:303`, `:318`, `:321`.

9. **CX-F-052와CX-P2-01, 계정 복원과 후기 draft에 사용자 자료 경계 문제가 남는다.** restoreBrowserAssets는 version/migrate/schema를 건너뛰고 읽기 오류를 신규 상태와 같게 처리한다. 작성 ReviewSheet는 다른 item이나 닫힘에 draft를 초기화하지 않고 늦은 사진 응답도 보호하지 않는다. store의 테스트 통과만으로 복원과 실제 업로드가 안전하다고 말할 수 없다. `browserWallet.ts:10`, `:15`, `ReviewSheet.tsx:34`, `:40`.

10. **CX-U-002부터014와CX-F-080, 도달 불가 옛 화면과 현재 화면을 분리해 동등성을 판단해야 한다.** 홈은 BoxList이며 NetflixHome, CommerceHome, HallOfFame, ProofFeed, LiveTicker와 옛 UnboxingRoulette는 현재 렌더되지 않는다. TS 파일97개가 라우트 runtime에서 미도달이다. 기준 테스트56파일은397통과와1skip이지만 옛 화면/순수 함수도 많이 포함한다. 이번에는 새 정적 산출물과 배포 화면을 대조하지 않았고 PASS 판정을 하지 않았다. `app/[locale]/page.tsx:8`, `BoxScreen.tsx:319`, `:320`, `AuthHost.tsx:50`.
