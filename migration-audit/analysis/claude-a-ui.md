# 화면 요소 전수 목록 (Claude 분석 A)

기준 커밋 `63445c7`, 브랜치 `migration-audit`. 조사일 2026-10-12.
라우트는 `claude-a-routes.md` 에 있다. 이 문서는 화면에 그려지는 것과 숨어 있는 것을 전부 적는다.

## 0. 읽는 법

근거의 말은 네 가지다.

| 표시 | 뜻 |
|---|---|
| 코드 | 소스에서 읽은 것. 파일과 줄을 적는다(경로는 `web/` 아래) |
| 화면 | 배포 사이트를 새 Chrome 창으로 열어 본 것(`harness/claude-a/probe.mjs`, 결과는 `probe-ui.json`, `probe-ui-open-five.json`, `probe-crawl.json`) |
| 실행 | 직접 돌린 스크립트의 결과(`import-graph.mjs`, `keys.mjs`, `css-usage.mjs`, `counts.ts`) |
| 짐작 | 확인하지 못하고 미루어 본 것 |

계층은 Page → Layout → Section → Block → Component → Primitive 로 나눈다. 표의 "층" 칸에 적는다.
상태는 코드나 CSS 에 실제로 있는 것만 적는다. 아무 요소나 갖는 전역 상태 둘은 여기 한 번만 적는다.

- 포커스 테: `:focus-visible { outline: 2px solid var(--v-title); outline-offset: 2px }` 가 모든 요소에 걸린다(코드: `app/ui.css:15`). 입력칸만 테 대신 테두리 색이 바뀐다(`app/ui.css:96,102`).
- 스크롤 막대: 어디에서도 그리지 않는다(코드: `app/globals.css:47-52`).

문구 키는 따로 적지 않으면 `messages/v.{ko,en,zh}.json` 의 키다. 세 언어 파일의 키는 574개씩이고 서로 빠진 것이 없다(실행: `keys.mjs` 의 `parity`).
로그인한 상태의 화면은 `web/scripts/capture/states.mjs` 의 값을 새 창에 심어 만들었다(실제 가입 계정이 아니다). 개봉과 받기 확인창은 그 새 창의 시험 장부에서만 눌렀고, 출금과 배송 신청은 제출하지 않았다.

스크린샷은 `migration-audit/screenshots/before/claude-a/` 에 39장 있다(390 폭 모바일 또는 1280 폭 PC, 한국어). 파일 이름을 해당 줄에 적는다.

## 1. 한눈에 보는 수

| 무엇 | 수 |
|---|---|
| 번호를 붙인 요소(CL-U-001 ~ 215) | 215 |
| 그 가운데 숨은 화면(5장, CL-U-166 ~ 215) | 50 |
| 그 가운데 배포 사이트의 사용자 흐름으로 닿지 않는 것 | 14, 그리고 닿는지 확인하지 못한 것 3 (6장 6.1) |
| `web/components` 에 있으나 어느 라우트도 그리지 않는 파일 | 71 (`.tsx` 70, `.ts` 1. 6장 6.2) |
| 닿는 컴포넌트 파일 | 45 (`.tsx` 43, `.ts` 2) |
| 쓰이지 않는 CSS 클래스(새 화면용 파일 안) | 15 |
| 새 문구 묶음에서 닿는 소스가 쓰지 않는 키 | 16, 개발용 갤러리만 쓰는 키 3 |

## 2. Layout 층

| id | 층 | 이름 | 소스 | 나오는 곳 | 상태 | 문구 키 | 근거 |
|---|---|---|---|---|---|---|---|
| CL-U-001 | Layout | 루트 문서(`html`, `body`) | `app/layout.tsx:43-54` | 모든 주소 | `html lang="ko"` 고정, 글꼴 변수 `--font-ui`(Pretendard Variable). `body` 에 옛 Tailwind 클래스 `bg-canvas text-white` | 없음(메타 설명은 코드에 한국어로 박혀 있다) | 코드 |
| CL-U-002 | Layout | 저장소 분리 스크립트 | `app/layout.tsx:48`, `lib/labSite.ts:19` | 모든 주소의 `head` | 화면에 그리는 것은 없다. `Storage.prototype` 을 감싸 키 앞에 `voila-test-aresjoo:` 를 붙인다. 저장이 가득 차면 `voila:storage-full` 이벤트를 낸다 | 없음 | 코드 |
| CL-U-003 | Layout | 스토어 불러오기(`CurrencyHydrator`) | `components/layout/CurrencyHydrator.tsx:14` | 모든 주소 | 그리는 것 없음 | 없음 | 코드 |
| CL-U-004 | Layout | 언어 레이아웃(문구 공급, `MotionConfig reducedMotion="user"`) | `app/[locale]/layout.tsx:67-80`, `components/layout/MotionPreferences.tsx:5` | `/{l}/...` 전부 | 그리는 것은 감싸는 `div` 하나 | 없음 | 코드 |
| CL-U-005 | Layout | `html lang` 맞춤(`LocaleHtmlLang`) | `components/layout/LocaleHtmlLang.tsx:7` | `/{l}/...` 전부 | 그리는 것 없음. 뜬 뒤 ko, en, zh-Hans 로 바꾼다 | 없음 | 코드, 화면 |
| CL-U-006 | Layout | 테스트 사이트 색 선 | `components/layout/LabBadge.tsx:31` | `/{l}/...` 전부, 화면 맨 위 3px, z 300 | 고정. 누를 수 없다(`pointer-events-none`). 색은 fuchsia | 없음 | 코드, 화면(스크린샷 전부의 맨 위 선) |
| CL-U-007 | Layout | 앱 껍데기 `.v-app` | `components/shell/AppShell.tsx:44` | `AppShell` 을 쓰는 모든 화면 | 본문 폭 둘: `v-main--col`(560px 열), `v-main--wide`(1120px). wide 는 홈, 박스, 후기 | 없음 | 코드 |
| CL-U-008 | Section | 머리줄 `.v-header` | `AppShell.tsx:45-56`, `app/ui.css:31-41` | 위와 같음 | 위에 붙어 다닌다(sticky, z 30). 높이 56px, 768px 이상 64px | `nav.menu`(aria) | 코드, 화면 |
| CL-U-009 | Component | 로고 링크 `BrandLogo` | `AppShell.tsx:47`, `components/layout/BrandLogo.tsx:31` | 머리줄 왼쪽 | 링크(`/`). 포커스 테 | 없음. `aria-label="VOILA"` 는 코드에 박혀 있다 | 코드, 화면 |
| CL-U-010 | Block | 머리줄 메뉴 `.v-nav` 링크 7개 | `AppShell.tsx:48-50`, `app/ui.css:34-36,41` | 머리줄, 900px 이상에서만 보인다 | 기본, hover(글자색), 지금 화면(`aria-current="page"`), 포커스 테 | `nav.boxes`, `nav.inventory`, `nav.wallet`, `nav.wins`, `nav.verify`, `nav.guide`, `nav.account` | 코드, 화면(1280 에서 보임, 390 에서 `display: none`) |
| CL-U-011 | Component | 잔액 단추 | `AppShell.tsx:52` | 머리줄, 세션을 읽은 뒤 로그인한 사람에게만 | 기본, hover(배경). 누르면 잔액 시트 | `nav.balance` | 코드, 화면("잔액 $10,000") |
| CL-U-012 | Component | 로그인 단추 | `AppShell.tsx:53` | 머리줄, 세션을 읽은 뒤 로그인 전에만 | 기본, hover. 누르면 로그인 시트 | `nav.login` | 코드, 화면 |
| CL-U-013 | Component | 메뉴 단추 `.v-menu-btn` | `AppShell.tsx:54`, `app/ui.css:41` | 머리줄, 900px 미만에서만 | 기본, hover, `aria-expanded` 참 또는 거짓 | `nav.menu`(aria) | 코드, 화면(390 에서 보이고 1280 에서 숨음) |
| CL-U-014 | Block | 본문 `main.v-main` | `AppShell.tsx:59` | 모든 화면 | 없음 | 없음 | 코드 |
| CL-U-015 | Section | 꼬리말 `.v-footer` | `components/shell/AppFooter.tsx:30-75`, `app/footer.css` | `/{l}/...` 전부(레이아웃이 붙인다). 루트 404 에는 없다 | 720px 이상에서 2열과 4열 | 아래 줄들 | 코드, 화면 |
| CL-U-016 | Component | 꼬리말 "고객 관계 요약" 링크 | `AppFooter.tsx:32` | 꼬리말 윗줄 | 링크(`/guide`), 밑줄, hover | `footer.crs` | 코드, 화면 |
| CL-U-017 | Component | 팔로우 줄(아이콘 넷: X, Instagram, YouTube, Telegram) | `AppFooter.tsx:33-38`, `lib/social.ts:7` | 꼬리말 윗줄 | 주소가 넷 다 비어 있어 넷 모두 누를 수 없는 그림(`span.v-footer-icon`)이다. 링크 모양(`a`)은 주소를 채웠을 때만 나온다 | `footer.follow` | 코드. 화면에서는 꼬리말 링크 목록에 넷이 없음을 확인 |
| CL-U-018 | Block | 꼬리말 "상품" 묶음(링크 5) | `AppFooter.tsx:42-49` | 꼬리말 | hover 밑줄 | `footer.colProduct`, `nav.boxes`, `nav.inventory`, `nav.wallet`, `reviews.title`, `wins.title` | 코드, 화면 |
| CL-U-019 | Block | 꼬리말 "도움" 묶음(링크 2) | `AppFooter.tsx:50-54` | 꼬리말 | hover 밑줄 | `footer.colHelp`, `nav.guide`, `nav.verify` | 코드, 화면 |
| CL-U-020 | Block | 꼬리말 "약관" 묶음(링크 1) | `AppFooter.tsx:55-58` | 꼬리말 | hover 밑줄 | `footer.colTerms`, `nav.legal` | 코드, 화면 |
| CL-U-021 | Component | 언어 링크 2개(지금 언어가 아닌 둘) | `AppFooter.tsx:61` | 꼬리말 "설정" 묶음 | 링크. 같은 화면의 다른 언어 주소 | `footer.colSettings`. 언어 이름은 코드(`i18n/routing.ts:16`) | 코드, 화면 |
| CL-U-022 | Component | 표시 통화 단추 | `AppFooter.tsx:62` | 꼬리말 "설정" 묶음 | 두 상태가 글로 바뀐다: "원화로 보기"와 "달러로 보기" | `nav.showKrw`, `nav.showUsd` | 코드, 화면(누르면 카드 가격이 $500 에서 ₩690,000 으로) |
| CL-U-023 | Block | 꼬리말 소개 글 4줄 | `AppFooter.tsx:65-70` | 꼬리말 | 둘째 줄 "You never know what's next." 는 코드에 영어로 박혀 있다(세 언어 같음) | `footer.about1`, `footer.about2`, `footer.rights` | 코드 |
| CL-U-024 | Block | 구호 "OPEN IT, OWN IT" | `AppFooter.tsx:72` | 꼬리말 | 코드에 박힌 영어 | 없음 | 코드 |
| CL-U-025 | Component | 큰 로고(화면 폭) | `AppFooter.tsx:74` | 꼬리말 맨 아래 | `role="img"`, `aria-label="voila.gg"` | 없음 | 코드 |

## 3. Primitive 층 (기본 부품)

| id | 이름 | 소스 | 쓰는 곳 | 상태 | 근거 |
|---|---|---|---|---|---|
| CL-U-026 | `Button`(주 단추, 흰 알약) | `components/ui/kit.tsx:14`, `app/ui.css:59-66` | 거의 모든 화면과 시트 | 기본, hover(배경), active(0.985 로 줄어듦), disabled(회색), busy(`data-busy`, 글이 `busyLabel` 로 바뀜, 커서 progress), quiet(회색 알약), auto(폭 자동) | 코드. auto 는 쓰는 곳이 없다(실행: 검색) |
| CL-U-027 | `ButtonLink`(단추 모양 링크) | `kit.tsx:23` | 옮긴 화면, 없는 주소, 보관함 빈 상태, 나온 상품 빈 상태, 출금 신청함, 여러 개 결과 | 기본, hover, active. quiet 는 쓰는 곳이 없다 | 코드 |
| CL-U-028 | `TextLink`(14px 밑줄 링크) | `kit.tsx:28`, `app/ui.css:68-70` | 거의 모든 화면 | 세 꼴: 바깥 링크(새 탭, 끝에 화살표 글자), 안쪽 링크, 단추. 기본, hover(글자색). 누르는 자리는 44px 이상 | 코드 |
| CL-U-029 | `Chips` 와 알약 `.v-chip` | `kit.tsx:35`, `app/ui.css:73-78` | 홈 분류, 수량, 보관함 탭, 후기 박스, 검증 박스, 충전 네트워크, 출금 네트워크, 배송 나라, 후기 별점 | 기본, hover, 선택(`aria-pressed="true"`, 2px 테두리), disabled(묶음 전체), 가로로 넘기는 꼴(`v-chips--scroll`) | 코드, 화면 |
| CL-U-030 | `ScreenHead`(제목, 설명, 뒤로 가기) | `kit.tsx:46`, `app/ui.css:50-52` | 모든 화면의 머리 | 뒤로 가기는 링크이거나 단추. hover(배경) | 코드 |
| CL-U-031 | `Rows` 와 `Row`(라벨 왼쪽, 값 오른쪽) | `kit.tsx:60-65`, `app/ui.css:84-91` | 박스 사실, 확률, 시트의 정보 카드 등 | 없음. 행 사이 구분선은 `.v-row + .v-row` | 코드 |
| CL-U-032 | 링크 행 `.v-row--link`, `.v-row--button`, 감싸는 `.v-rowitem` | `app/ui.css:90-91,361`, 쓰는 곳 `account/AccountScreen.tsx:50-69`, `legal/LegalCenterScreen.tsx:22`, `AppShell.tsx:62` | 계정, 약관 목록, 메뉴 시트, 여러 개 결과 목록 | hover(첫 칸 글자색) | 코드. `.v-rowitem` 에는 CSS 규칙이 없다(실행: 클래스 검색). 그래서 계정과 약관 목록의 행 사이에는 구분선이 없다(화면: `account-mobile.png`. 메뉴 시트의 행은 감싸는 것이 없어 구분선이 있다, 코드) |
| CL-U-033 | `Card` | `kit.tsx:67`, `app/ui.css:81-83` | 이용 방법의 카드 셋, 충전 시트, 주소 카드 | 테두리 꼴(outline)은 갤러리만 쓴다 | 코드 |
| CL-U-034 | `Field`(라벨과 입력칸) | `kit.tsx:71`, `app/ui.css:94-102` | 로그인, 배송, 검증, 출금, 계정 시트, 인증 앱 | 기본, focus(테두리 색), placeholder, disabled, 자동 채움 색 | 코드 |
| CL-U-035 | `Line`(상태 한 줄) | `kit.tsx:76`, `app/ui.css:109-110` | 화면과 시트의 안내와 실패 | 보통(`role="status"`), 실패(`role="alert"`, 빨강). `live={false}` 는 갤러리만 쓴다 | 코드 |
| CL-U-036 | `Empty`(빈 목록 글) | `kit.tsx:80`, `app/ui.css:112` | 홈 검색, 후기, 보관함, 지갑, 나온 상품, 검증, 받기 시트 | 없음 | 코드 |
| CL-U-037 | `Skeleton`(자리 표시) | `kit.tsx:85`, `app/ui.css:113-115` | 보관함 240, 지갑 200, 출금 200(두 곳), 나온 상품 120, 계정 240, 검증 120, 받기 시트 144 | 움직임을 줄이지 않은 사람에게만 1.4초 깜빡임 | 코드 |
| CL-U-038 | `Sheet`(시트, PC 는 가운데 창) | `components/ui/Sheet.tsx:12`, `app/ui.css:118-137` | 5장 | 5.1 참고 | 코드, 화면 |
| CL-U-039 | `Confirm`(확인창) | `Sheet.tsx:32` | 5장 | 5.1 참고 | 코드, 화면 |
| CL-U-040 | `ToastHost` 와 토스트 | `components/ui/toast.tsx:17`, `app/ui.css:140-142` | `AppShell` 마다 | 5장 CL-U-213 | 코드 |
| CL-U-041 | `ScrollRow`(옆으로 넘기는 줄) | `components/ui/ScrollRow.tsx:11`, `app/ui.css:171-178`, `app/scroll-fade.css` | 박스 화면의 후기 줄 | 왼쪽 단추, 오른쪽 단추(더 넘길 쪽만 생긴다, 마우스를 쓰는 화면에서만 보인다), 끝 흐림(`data-prev`, `data-next`) | 코드, 화면(처음에 next 만, 누른 뒤 prev 만) |
| CL-U-042 | `BrandLogo`, `BrandLogoShapes` | `components/layout/BrandLogo.tsx:10,31` | 머리줄, 꼬리말, 개봉 장면(낸 값의 20배 이상일 때) | 크기 sm, md, lg. 링크 꼴과 그림 꼴 | 코드 |
| CL-U-043 | `ProviderMark`(Google, Apple, Microsoft 표식) | `components/flow/ProviderMark.tsx:6` | 로그인 시트 | 없음 | 코드, 화면 |
| CL-U-044 | `OpeningBox`(입체 상자) | `components/box/Opening.tsx:49`, `app/opening.css:72-100` | 개봉 장면, 여러 개 열기 연출, 홈 배너 | 조상의 `data-phase` 로 바뀐다: anticipation, impact, exit | 코드, 화면(배너) |
| CL-U-045 | `RatingInline`(별 하나, 평균, 수) | `components/box/BoxReviews.tsx:32` | 박스 화면 제목 아래, 홈 카드 | 긴 꼴과 짧은 꼴. 후기가 없으면 그리지 않는다 | 코드, 화면("4.3, 후기 3개") |
| CL-U-046 | `Stars`(별 다섯) | `BoxReviews.tsx:44` | 후기 카드, 후기 상세, 평균 블록 | 켜진 별과 꺼진 별 | 코드 |
| CL-U-047 | `RatingBlock`(평균과 분포 막대) | `BoxReviews.tsx:54` | 박스 화면 후기 영역, 후기 화면 | 후기가 없으면 그리지 않는다 | 코드, 화면 |
| CL-U-048 | 상품 행 `.v-itemrows`, `.v-itemrow` | `app/ui.css:265-273,365-373` | 홈 검색, 박스 구성품(사진 없는 것), 확률표, 보관함, 지갑 내역, 나온 상품, 검증 기록, 받기 시트 | hover(이름에 밑줄) | 코드 |
| CL-U-049 | 접는 글 `details.v-notes` | `app/ui.css:333-337` | 박스 화면 두 곳 | 닫힘, 열림(`[open]` 이면 요약 글자색) | 코드, 화면 |

## 4. Page 별 요소

### 4.1 홈 (`/{l}/`, `components/box/BoxList.tsx`)

| id | 층 | 이름 | 소스 | 상태 | 문구 키 | 근거 |
|---|---|---|---|---|---|---|
| CL-U-050 | Section | 가입 혜택 배너 `.v-hero` | `components/home/HeroBanner.tsx:136`, `app/hero.css` | 단계 다섯(`data-phase`): closed, anticipation, open, sweep, fade. 화면 밖이면 멈춤. 움직임 줄이기면 sweep 한 장면에 `data-still`. 검색 중에는 배너가 사라진다 | 아래 | 코드, 화면(`heroPhase: sweep`, `heroStill: true`. 창을 움직임 줄이기로 열었다) |
| CL-U-051 | Block | 배너 글(제목은 박스 이름, 설명은 세 가지) | `HeroBanner.tsx:138-141` | 로그인 전, 로그인 뒤 무료 횟수 있음, 로그인 뒤 없음 | `hero.desc`, `hero.descFree`, `hero.descIn`. 제목은 박스 이름(옛 묶음 `products`) | 코드, 화면("가입하면 2개를 무료로 엽니다.") |
| CL-U-052 | Block | 배너 장면(공 5, 상자, 카드 3, 빛 조각 6) | `HeroBanner.tsx:142-181`, `components/home/heroBall.ts` | 공은 WebGL 로 그린 캔버스. 못 그리는 기기는 유리구슬(`.v-hero-orb > i`). 카드 면은 사진이 있으면 사진, 없으면 그린 카드. 390 폭에서는 공이 넷 | 없음 | 코드, 화면(캔버스 5개, 사진 카드 3장. `home-guest-mobile.png`) |
| CL-U-053 | Component | 배너 단추 | `HeroBanner.tsx:182-186` | 로그인 전: 단추, 누르면 가입 시트. 로그인 뒤: 박스 화면으로 가는 링크, 글이 둘 | `hero.cta`, `hero.ctaFree`, `hero.ctaIn` | 코드, 화면(로그인 전에 누르면 "가입" 시트) |
| CL-U-054 | Block | 화면 머리 | `BoxList.tsx:82` | 없음 | `home.title`, `home.desc` | 코드, 화면 |
| CL-U-055 | Component | 찾기 칸 `.v-search` | `BoxList.tsx:85` | 기본, focus, 글이 있으면 검색 화면으로 바뀜 | `home.search`(aria), `home.searchHint` | 코드, 화면 |
| CL-U-056 | Block | 검색 결과 행(박스로 가는 링크) | `BoxList.tsx:88-98` | 최대 30행. 사진은 있을 때만 | `home.searchIn`, `home.refPrice` | 코드, 화면("아이폰" 30행. `home-search-desktop.png`) |
| CL-U-057 | Component | 검색 빈 상태 | `BoxList.tsx:87` | 없음 | `home.searchNone` | 코드, 화면("그 이름의 상품이 없습니다.") |
| CL-U-058 | Component | 분류 알약 17개 | `BoxList.tsx:102` | 선택 하나. 가로로 넘김 | `home.filter`(aria), `home.all`, `cat.car` 등 16개. 옛 분류 이름(`categories.*`)을 쓰는 가지도 있으나 지금은 나오지 않는다 | 코드, 화면 |
| CL-U-059 | Block | 박스 격자 `.v-boxgrid` | `BoxList.tsx:103-105`, `app/ui.css:145,206-210` | 2열, 1024px 이상 3열. 24장씩 | 없음 | 코드, 화면(24, 48) |
| CL-U-060 | Component | 박스 카드 `BoxCard` | `BoxList.tsx:116-131` | hover(배경). 사진 칸은 사진이거나 대표 상품 이름. 별점 줄은 후기가 있거나 옛 박스일 때만 | `home.noRating` | 코드. 화면: 홈의 카드에는 별점 줄이 하나도 없다(`ratingCards: 0`). 사진 없는 카드와 "후기 없음" 글은 홈의 박스에서는 볼 수 없었다 |
| CL-U-061 | Component | "박스 더 보기" 단추 | `BoxList.tsx:106` | 남은 것이 있을 때만 | `home.more` | 코드, 화면("박스 더 보기 (296개 남음)") |

### 4.2 박스 화면 (`/{l}/box/{slug}/`, `components/box/BoxScreen.tsx`)

| id | 층 | 이름 | 소스 | 상태 | 문구 키 | 근거 |
|---|---|---|---|---|---|---|
| CL-U-062 | Layout | 박스 배치 `.v-boxlayout` | `BoxScreen.tsx:173`, `app/ui.css:319-347` | 모바일은 한 열에 열기 막대가 아래에 붙음. 1024px 이상은 2열에 옆 카드가 붙어 다님 | 없음 | 코드, 화면 |
| CL-U-063 | Block | 화면 머리(뒤로 가기, 박스 이름, 가격과 최고 상품가) | `BoxScreen.tsx:175` | 없음 | `common.back`, `box.lead` | 코드, 화면("1회 $50, 최고 상품가 $250,000") |
| CL-U-064 | Component | 별점 링크 단추 | `BoxScreen.tsx:176` | 후기가 있을 때만. 누르면 후기 영역으로 내려감 | `box.ratingLine`, `box.ratingAria` | 코드, 화면(옛 박스에만 있음) |
| CL-U-065 | Component | 대표 상품 단추 `.v-mainitem` | `BoxScreen.tsx:180-183` | 누르면 구성품으로 내려감 | 없음 | 코드, 화면 |
| CL-U-066 | Component | 박스 그림 `.v-boxhero` | `BoxScreen.tsx:186` | 대표 상품 사진이 없고 박스 그림이 있을 때만 | 없음 | 코드. 화면에서는 보지 못했다(연 두 박스에는 대표 사진이 있었다) |
| CL-U-067 | Section | 후기 영역 `#reviews` | `components/box/BoxReviews.tsx:175-197` | 후기 있음(평균, 분포, 기준 한 줄, 넘기는 카드 줄), 없음(빈 글) | `box.reviews`, `box.noReviews`, `box.ratingBasis`, `box.ratingCount`, `box.starsOf`, `box.reviewsAll`, `wins.title` | 코드, 화면(새 박스는 빈 글과 "나온 상품" 링크만. 옛 박스는 카드 3장) |
| CL-U-068 | Component | 후기 카드 `ReviewCard` | `BoxReviews.tsx:119-143` | 통째로 단추. 글은 석 줄까지, 실제로 잘렸을 때만 "더 보기" | `reviews.more` | 코드, 화면("더 보기"가 붙은 카드는 보지 못했다) |
| CL-U-069 | Block | 옆 카드의 사실 행 | `BoxScreen.tsx:191-195` | 2행, 옛 박스는 터짐 게이지까지 3행 | `box.facts`(aria), `box.price`, `box.topTimes`, `op.timesShort`, `box.burst` | 코드, 화면 |
| CL-U-070 | Block | 열기 막대 `.v-openbar` | `BoxScreen.tsx:196-212`, `app/ui.css:283-284,345` | 1024px 미만은 화면 아래 고정(z 20), 이상은 옆 카드 안 | 아래 | 코드, 화면 |
| CL-U-071 | Component | 열기 막대의 한 줄 다섯 | `BoxScreen.tsx:198-202` | 실패, 못 본 결과 있음, 다른 박스에 못 본 결과(링크), 무료 횟수, 잔액 부족 | `box.openFail`, `op.recoverLine`, `op.recoverElsewhere`, `box.freeLeft`, `box.short` | 코드. 화면: 무료 횟수 한 줄만 봄 |
| CL-U-072 | Component | 수량 알약 다섯(1, 5, 10, 50, 100) | `BoxScreen.tsx:203` | 선택 하나. 처리 중에는 disabled | `box.qty`(aria), `box.qtyN` | 코드, 화면 |
| CL-U-073 | Component | 주 단추(일곱 가지로 바뀐다) | `BoxScreen.tsx:204-210` | 불러오는 중(disabled), 로그인 전(아래에 한 줄), 결과 보기, 받기가 주 단추(힌트와 충전 링크), 충전이 주 단추(힌트와 받기 링크), 충전만, 열기(busy) | `common.loading`, `box.loginToOpen`, `box.guestNote`, `op.recoverCta`, `take.title`, `take.heldHint`, `box.charge`, `box.open`, `box.openFree`, `box.opening` | 코드. 화면: 로그인 전, 열기, 무료 열기 셋을 봄(`box-funded-mobile.png`) |
| CL-U-074 | Section | 구성품 `#box-contents` | `BoxScreen.tsx:215-241` | 구간 넷(20배 이상, 6배 이상, 2배 이상, 2배 미만). 빈 구간은 빠짐 | `box.contents`, `box.tierRoyal`, `box.tierPrestige`, `box.tierExecutive`, `box.tierCurated` | 코드, 화면 |
| CL-U-075 | Component | 상품 타일 `ItemCard` | `BoxScreen.tsx:325-335`, `app/ui.css:218-233` | 단추. 크기 l, m, s. 누르면 상품 시트 | 없음 | 코드, 화면. 타일은 사진 있는 상품에만 쓰이므로 사진 없을 때의 아이콘 가지(`BoxScreen.tsx:328` 의 `v-item-glyph`)는 그려지지 않는다(코드: `:223` 이 사진 있는 것만 넘김) |
| CL-U-076 | Component | 상품 행(사진 없는 것) | `BoxScreen.tsx:226-237` | 단추. 누르면 상품 시트 | 없음 | 코드, 화면(리자몽 박스 97행) |
| CL-U-077 | Section | 확률 요약 `#box-odds` | `BoxScreen.tsx:244-258` | 새 박스는 7행(상품가 기준과 USDT 기준), 옛 박스는 6행. 그 아래 구간별 확률 | `box.oddsSummary`, `box.top`, `box.commonRow`, `box.realRow`, `box.low`, `box.belowOdds`, `box.ev`, `box.evBasis`, `box.evRetail`, `box.evCash`, `box.oddsTiers` | 코드, 화면 |
| CL-U-078 | Component | 접힌 상품별 확률표 | `BoxScreen.tsx:259-271` | 닫힘이 기본. 열면 상품 전부가 행(단추) | `box.oddsTable` | 코드, 화면(열면 100행, 옛 박스 54행) |
| CL-U-079 | Component | 접힌 "알아둘 것" | `BoxScreen.tsx:273-278` | 닫힘이 기본. 옛 박스는 터짐 설명 한 줄이 더 있다 | `box.notes`, `box.burstNote`, `box.evNote`, `box.evNotePhysical`, `box.verifyLink` | 코드, 화면 |

### 4.3 개봉 장면, 한 개 (`components/box/Opening.tsx`)

| id | 층 | 이름 | 소스 | 상태 | 문구 키 | 근거 |
|---|---|---|---|---|---|---|
| CL-U-080 | Page | 개봉 장면 `.v-op`(화면 전체) | `Opening.tsx:207-209`, `app/opening.css:8` | 단계 `data-phase`: anticipation, impact, exit, reveal, ready. 색조 `data-tone`: below, even, above, high, top. 종류 `data-kind`: cash, item. 짧게 보기 `data-short`. `data-opening-state`: opening, revealed, settled | `reveal.results`(aria) | 코드, 화면(`opening-one-mobile.png`. 움직임 줄이기라 연출 없이 결과부터 봄) |
| CL-U-081 | Block | 위쪽 줄: 잔액 알약, 설정 단추, 닫기 단추 | `Opening.tsx:210-216` | 잔액은 결과가 드러나면 최종 값으로 바뀌고 테두리가 한 번 밝아짐(`data-changed`). 닫기는 결과가 다 보인 뒤에만 있고 다음 구매 중에는 disabled | `op.balance`, `op.settings`, `common.close` | 코드, 화면 |
| CL-U-082 | Block | 장면: 바닥 빛, 상자 | `Opening.tsx:218-220` | 상자는 결과가 드러나기 전까지만 있다. 바닥 빛은 색조에 따라 밝기가 다름 | 없음 | 코드 |
| CL-U-083 | Block | 결과 묶음: USDT 결과 | `Opening.tsx:225-229,237-238` | 터짐이면 라벨이 바뀜. 배수가 2배 이상이면 배수가 붙음 | `op.cashLabel`, `op.burstLabel`, `op.times`, `op.inBalance`, `op.odds` | 코드. 옛 박스에서만 나온다(USDT 결과가 옛 박스에만 있다). 화면에서는 보지 못했다 |
| CL-U-084 | Block | 결과 묶음: USDT 로 받은 상품 | `Opening.tsx:231-238` | 손으로 받음, 자동으로 받음 | `take.doneTitle`, `op.timesLine`, `op.tookFrom`, `op.autoTookFrom`, `op.autoNote` | 코드. 화면에서는 받기를 끝까지 누르지 않아 보지 못했다 |
| CL-U-085 | Block | 결과 묶음: 보관한 상품 | `Opening.tsx:241-253` | 사진 있음(사진과 테 빛, 이름, 상품가 줄, 배수 줄), 사진 없음(라벨과 큰 금액, 이름). 20배 이상이면 로고가 얹힘. 상태 줄 셋 | `reveal.value`, `op.refLine`, `op.timesLine`, `op.keptStatus`, `op.shipRequested`, `take.unconfirmed`, `op.odds`, `op.paid`, `op.free` | 코드, 화면(사진 없는 꼴: "상품가", "$5.99", "보관함에 넣었습니다.", "나올 확률 4.2476%. 무료 개봉") |
| CL-U-086 | Component | 쓴 금액과 잔액 변화 두 줄 `.v-op-net` | `Opening.tsx:183-188` | 방향 `data-direction`: down, up, same | `op.paid`, `op.free`, `op.balDown`, `op.balUp`, `op.balSame` | 코드 |
| CL-U-087 | Component | 터짐 게이지 한 줄 | `Opening.tsx:255`, `app/opening.css:144` | 옛 박스에서만. 화면 높이 700px 이하에서는 숨음 | `op.gaugeNow`, `op.gaugeReset` | 코드 |
| CL-U-088 | Component | "결과 바로 보기" 링크 | `Opening.tsx:261` | 결과가 드러나기 전에만 | `op.skip` | 코드 |
| CL-U-089 | Block | 상태 줄 묶음 | `Opening.tsx:264-272` | 다시 보는 결과, 반영 대기, 실패, 확인 못함, 다음 열기에 잔액 부족 | `op.recovered`, `op.pending`, `op.failed`, `take.unknown`, `box.short` | 코드 |
| CL-U-090 | Block | 아래 행동 묶음(여섯 가지) | `Opening.tsx:273-316`, `app/opening.css:106-107` | 한 번 더 열기와 링크 둘, 받기가 주 단추, 충전이 주 단추, 충전만, 다시 시도 또는 다시 확인, USDT로 받기. 결과가 뜬 뒤 0.35초는 눌리지 않는다(`data-armed` 가 없을 때 `pointer-events: none`) | `reveal.again`, `reveal.againFree`, `box.opening`, `nav.verify`, `op.backToBox`, `take.title`, `take.heldHint`, `box.charge`, `op.retryTake`, `op.recheck`, `reveal.take`, `common.checking`, `take.rateLine`, `take.keep` | 코드, 화면("USDT로 받기 ($5.69)", "상품가 $5.99의 95%", "보관함에 두기", "개봉 결과 검증") |

### 4.4 개봉 결과, 여러 개 (`components/box/Reveal.tsx`)

| id | 층 | 이름 | 소스 | 상태 | 문구 키 | 근거 |
|---|---|---|---|---|---|---|
| CL-U-091 | Page | 개봉 결과 `.v-reveal`(화면 전체) | `Reveal.tsx:167` | 연출 중, 결과 | `reveal.results`(aria) | 코드, 화면(`reveal-five-mobile.png`) |
| CL-U-092 | Block | 연출 자리(상자, 개수 한 줄, 건너뛰기) | `Reveal.tsx:169-176` | 단계 anticipation, impact, exit(520, 150, 170ms) | `op.multiOpening`, `op.skip` | 코드. 움직임 줄이기 창이라 화면에서는 보지 못했다 |
| CL-U-093 | Component | 닫기 단추 | `Reveal.tsx:179` | 결과가 뜨고 0.35초 뒤부터 눌림. 다음 구매 중에는 disabled | `common.close` | 코드, 화면 |
| CL-U-094 | Component | 잔액 알약 | `Reveal.tsx:180` | 여러 개 결과에만 | `op.balance` | 코드, 화면("잔액 $9,850") |
| CL-U-095 | Block | 머리(제목과 한 줄) | `Reveal.tsx:217-222` | 보통, 전부 USDT 결과일 때 | `reveal.multiTitle`, `reveal.multiDesc`, `reveal.cashTitle`, `reveal.cashDesc` | 코드, 화면("5개를 열었습니다") |
| CL-U-096 | Component | 가장 큰 결과 `.v-best` | `Reveal.tsx:223-232` | 가장 큰 결과가 1회 가격의 2배 이상일 때만 | `op.best`, `op.refLine`, `op.timesShort` | 코드. 화면에서는 나오지 않았다(다섯 개 모두 2배 미만) |
| CL-U-097 | Block | 영수증 행 | `Reveal.tsx:234-240` | 보관 상품 행과 터짐 게이지 행은 있을 때만. 잔액 변화는 감소, 증가, 같음 | `reveal.spent`, `op.creditedSum`, `op.keptSum`, `box.burst`, `op.changeLabel`, `op.changeDown`, `op.changeUp`, `op.changeSame` | 코드, 화면("쓴 금액 $150", "잔액에 반영 $0", "보관 상품 5개 상품가 $73.47", "잔액 변화 $150 감소") |
| CL-U-098 | Block | 결과 목록 | `Reveal.tsx:241-260` | 행의 상태 꼬리표 다섯. 같은 금액의 USDT 결과는 한 줄로 묶이고 누를 수 없다. 나머지는 단추: 받을 수 있으면 상품 시트, 아니면 검증 시트. 행이 차례로 떠오름 | `op.tagCash`, `reveal.shippedTag`, `reveal.takenTag`, `take.unconfirmed`, `op.tagKept`, `op.timesShort`, `op.countTimes` | 코드, 화면 |
| CL-U-099 | Block | 아래 행동 묶음 | `Reveal.tsx:262-277` | 받을 상품이 남음: 받기 단추와 링크 둘. 다 받음: 부족 한 줄, 한 번 더 열기 또는 받기 또는 충전, 힌트, 링크 | `take.submit`, `take.title`, `take.keep`, `reveal.again`, `reveal.againFree`, `box.short`, `box.charge`, `take.heldHint`, `op.backToBox` | 코드, 화면("USDT로 받기 (5개, $69.8)", "보관함에 두기", "한 번 더 언박싱 $250") |
| CL-U-100 | Block | 결과가 하나일 때의 두 꼴 | `Reveal.tsx:182-214` | USDT 결과 또는 받은 상품, 보관한 상품 | `reveal.cashTitle`, `reveal.takenDesc`, `reveal.cashDesc`, `reveal.itemDesc`, `reveal.shippedDesc`, `reveal.odds`, `reveal.boxes`, `reveal.toInventory` | 코드. 도달 불가: 박스 화면은 결과가 하나면 `Opening` 을 쓴다(`BoxScreen.tsx:319-320`). 이 가지를 여는 곳은 갤러리뿐이다 |

### 4.5 보관함 (`components/inventory/InventoryScreen.tsx`)

| id | 층 | 이름 | 소스 | 상태 | 문구 키 | 근거 |
|---|---|---|---|---|---|---|
| CL-U-101 | Block | 화면 머리 | `InventoryScreen.tsx:112` | 없음 | `inv.title`, `inv.desc` | 코드, 화면 |
| CL-U-102 | Component | 자리 표시(240) | `:113` | 세션이나 보관함을 읽는 동안 | `common.loading`(aria) | 코드 |
| CL-U-103 | Block | 로그인 전 한 줄과 단추 | `:114` | 없음 | `inv.loginLine`, `nav.login` | 코드, 화면 |
| CL-U-104 | Component | 상태 알약 셋 | `:117` | 선택 하나. 글에 개수 | `inv.filter`(aria), `inv.tab.held`, `inv.tab.shipping`, `inv.tab.done` | 코드, 화면("보관 중 2", "배송 0", "받은 것 0") |
| CL-U-105 | Component | "USDT로 받기" 단추 | `:119` | 보관 중 탭이고 받을 수 있는 상품이 있을 때만 | `take.title` | 코드, 화면(`inventory-held-mobile.png`) |
| CL-U-106 | Component | 빈 상태 셋과 "박스 보러 가기" | `:121` | 탭마다 글이 다름. 단추는 보관 중 탭에만 | `inv.empty.held`, `inv.empty.shipping`, `inv.empty.done`, `inv.toBoxes` | 코드, 화면(배송과 받은 것 탭의 빈 글. 보관 중 탭의 빈 글은 보지 못했다) |
| CL-U-107 | Component | 상품 행 | `:123-136` | 단추. 둘째 줄과 오른쪽 금액이 상태에 따라 다름: 보관 중(상품가, 받을 금액), 확인 필요(금액 없음), 받은 것(받은 금액), 배송(상품가) | `inv.refLine`, `inv.stHeld`, `inv.stRequested`, `inv.stShipping`, `inv.stDelivered`, `inv.stTaken`, `take.unconfirmed` | 코드, 화면(보관 중, 배송 신청함, 배송 중) |
| CL-U-108 | Component | "더 보기" 링크 | `:138` | 30개를 넘을 때만 | `inv.more` | 코드 |

### 4.6 지갑 (`components/wallet/WalletScreen.tsx`)

| id | 층 | 이름 | 소스 | 상태 | 문구 키 | 근거 |
|---|---|---|---|---|---|---|
| CL-U-109 | Block | 화면 머리 | `WalletScreen.tsx:92` | 없음 | `wallet.title`, `wallet.desc` | 코드, 화면 |
| CL-U-110 | Component | 자리 표시(200), 로그인 전 한 줄과 단추 | `:93-94` | 없음 | `common.loading`, `wallet.loginLine`, `nav.login` | 코드, 화면 |
| CL-U-111 | Block | 잔액 행, 충전 단추, 출금 링크 | `:98-103` | 카드 잔액 행은 0 보다 클 때만 | `wallet.balance`, `wallet.cardBalance`, `box.charge`, `wallet.withdraw` | 코드, 화면(`wallet-pending-mobile.png`) |
| CL-U-112 | Section | 내역 | `:105-120` | 빈 상태, 행(단추) 30개씩, 더 보기 | `wallet.history`, `wallet.empty`, `wallet.type.deposit_usdt`, `deposit_card`, `open`, `sellback`, `withdraw`, `bonus`, `shipping_refund`, `order_refund`, `wallet.status.PENDING`, `PENDING_ADMIN_REVIEW`, `PENDING_72H_HOLD`, `BROADCASTING`, `CANCELLED`, `FAILED`, `inv.more` | 코드, 화면("보너스 +$10,000", "출금 ..., 처리 대기 $-50"). 음수 금액은 기호 뒤에 빼기가 온다(`$-50`) |

### 4.7 출금 (`components/wallet/WithdrawScreen.tsx`)

| id | 층 | 이름 | 소스 | 상태 | 문구 키 | 근거 |
|---|---|---|---|---|---|---|
| CL-U-113 | Page | 불러오는 중 | `WithdrawScreen.tsx:169` | 자리 표시(200) | `withdraw.title`, `common.back`, `common.loading` | 코드 |
| CL-U-114 | Page | 로그인 전 | `:170` | 없음 | `withdraw.title`, `wallet.loginLine`, `nav.login` | 코드, 화면 |
| CL-U-115 | Page | 보안 상태를 읽는 중 또는 실패 | `:171-176` | 자리 표시, 또는 실패 한 줄과 다시 시도 단추 | `withdraw.securityFail`, `state.retry` | 코드. 화면에서는 보지 못했다 |
| CL-U-116 | Page | 인증 앱 연결 관문 | `:179-189` | 단추(연결 시트), 링크(이메일 인증 경로) | `withdraw.gateTitle`, `withdraw.gateDesc`, `withdraw.gateCta`, `withdraw.emailPath` | 코드, 화면(`withdraw-funded-mobile.png`) |
| CL-U-117 | Page | 입력 | `:237-264` | 받아서 출금하기 링크(보관 상품이 있을 때), 네트워크 알약 둘, 주소 칸, 금액 칸, 채움 안내 한 줄, 비율 알약 셋(25%, 50%, 전액. 선택 표시가 없는 단추), 실패 줄 넷, 요약 3행, 요청 실패 줄, 주 단추 | `withdraw.title`, `withdraw.desc`, `take.withdrawLink`, `charge.network`, `withdraw.address`, `withdraw.errAddress.TRC20`, `withdraw.errAddress.BEP20`, `withdraw.amount`, `take.prefilled`, `take.prefillNone`, `withdraw.all`, `withdraw.errNan`, `withdraw.errMin`, `withdraw.errInsufficient`, `wallet.balance`, `wallet.fee`, `wallet.net`, `withdraw.next`. 요청 실패 글은 옛 묶음 `account.errors.*` | 코드, 화면(`withdraw-security-mobile.png`, 빈 채로 누르면 "TRC-20 주소는 T로 시작하는 34자입니다.", "금액을 숫자로 넣습니다.") |
| CL-U-118 | Page | 확인 | `:191-203` | 뒤로 가기는 단추(앞 단계로) | `withdraw.confirmTitle`, `withdraw.confirmDesc`, `wallet.net`, `wallet.amount`, `wallet.fee`, `charge.network`, `wallet.toAddress`, `withdraw.toAuth` | 코드. 제출하지 않아 화면에서는 보지 못했다 |
| CL-U-119 | Page | 인증 앱 코드 | `:205-213` | 틀리면 남은 횟수 한 줄, 세 번 틀리면 이메일 화면으로 | `withdraw.otpTitle`, `withdraw.otpDesc`, `login.code`, `withdraw.otpWrong`, `withdraw.submit`, `withdraw.emailPath`, `common.checking` | 코드. 화면에서는 보지 못했다 |
| CL-U-120 | Page | 이메일 인증 | `:215-223` | 코드를 보내기 전(주 단추가 "코드 보내기"), 보낸 뒤(코드 칸과 다시 받기 링크) | `withdraw.emailTitle`, `withdraw.emailDesc`, `login.code`, `withdraw.emailExpired`, `withdraw.sendCode`, `withdraw.submit`, `login.resend` | 코드. 화면에서는 보지 못했다 |
| CL-U-121 | Page | 신청함 | `:225-235` | 설명이 상태에 따라 셋 | `withdraw.doneTitle`, `withdraw.doneDesc`, `withdraw.doneHold`, `withdraw.doneReview`, `wallet.net`, `charge.network`, `inv.status`, `wallet.status.*`, `withdraw.toWallet` | 코드. 화면에서는 보지 못했다 |

### 4.8 나온 상품 (`components/box/WinsScreen.tsx`)

| id | 층 | 이름 | 소스 | 상태 | 문구 키 | 근거 |
|---|---|---|---|---|---|---|
| CL-U-122 | Block | 화면 머리 | `WinsScreen.tsx:57` | 없음 | `common.back`, `wins.title`, `wins.desc` | 코드, 화면 |
| CL-U-123 | Component | 자리 표시(120), 로그인 전 한 줄과 단추 | `:58-59` | 없음 | `common.loading`, `wins.loginLine`, `nav.login` | 코드, 화면 |
| CL-U-124 | Component | 범위 한 줄 | `:63` | 목록이 비어도 보임 | `wins.scope` | 코드 |
| CL-U-125 | Component | 빈 상태와 "박스 보러 가기" | `:65` | 없음 | `wins.none`, `state.toBoxes` | 코드. 화면에서는 보지 못했다 |
| CL-U-126 | Component | 줄(단추) | `:68-86` | 사진이 없으면 상자 아이콘. 가린 이름과 시각 | `wins.value`, `wins.byline` | 코드, 화면("촬영***, 2026.10.12 20:36") |
| CL-U-127 | Component | "더 보기" 링크 | `:88` | 30건을 넘을 때만 | `wins.more` | 코드 |

### 4.9 후기 모아보기 (`components/box/ReviewsScreen.tsx`)

| id | 층 | 이름 | 소스 | 상태 | 문구 키 | 근거 |
|---|---|---|---|---|---|---|
| CL-U-128 | Block | 화면 머리(뒤로 가기는 고른 박스 또는 홈) | `ReviewsScreen.tsx:33` | 없음 | `common.back`, `reviews.title`, `box.ratingBasis` | 코드, 화면 |
| CL-U-129 | Component | 박스 알약 | `:34` | 선택 하나 | `reviews.filter`(aria), `reviews.all` | 코드, 화면(14개) |
| CL-U-130 | Component | 빈 상태 | `:35` | 후기가 하나도 없을 때 | `box.noReviews` | 코드. 화면에서는 볼 수 없다(샘플이 28개 있다) |
| CL-U-131 | Block | 평균 블록과 카드 격자 `.v-rvgrid` | `:37-38` | 없음 | `box.ratingCount`, `box.starsOf`, `reviews.more`, `reviews.me`(내 후기의 이름이 없을 때) | 코드, 화면 |
| CL-U-132 | Component | "나온 상품" 링크 | `:41` | 없음 | `wins.title` | 코드, 화면 |

### 4.10 개봉 결과 검증 (`components/verify/VerifyScreen.tsx`)

| id | 층 | 이름 | 소스 | 상태 | 문구 키 | 근거 |
|---|---|---|---|---|---|---|
| CL-U-133 | Block | 화면 머리 | `VerifyScreen.tsx:72` | 없음 | `verify.title`, `verify.desc` | 코드, 화면 |
| CL-U-134 | Section | 내 개봉 기록 | `:74-94` | 자리 표시(120), 로그인 전, 빈 상태, 행(단추) 20개씩, 더 보기 | `verify.records`, `verify.loginLine`, `nav.login`, `verify.noRecords`, `verify.rowMeta`, `verify.rowGo`, `inv.more` | 코드, 화면(로그인 전, 기록 둘) |
| CL-U-135 | Section | 값을 직접 넣어 계산 `#verify-manual` | `:96-117` | 입력칸 넷, 박스 알약 334개(가로로 넘김), 입력 실패 줄, 주 단추(busy), 결과 3행 또는 4행, 안내 한 줄 | `verify.manualTitle`, `verify.manualDesc`, `verify.seed`, `verify.lockedOptional`, `verify.client`, `verify.round`, `verify.box`(aria), `verify.inputFail`, `verify.compute`, `common.checking`, `verify.hash`, `verify.locked`, `verify.hashOk`, `verify.hashBad`, `verify.number`, `verify.item`, `verify.currentTableNote` | 코드, 화면(빈 채로 누르면 "공개된 값, 내 기기 값, 회차를 넣어야 계산합니다.", 값을 넣으면 3행) |
| CL-U-136 | Section | 블록체인 검증 방식(`VerifyMethod`) | `:120-123`, `components/verify/VerifyMethod.tsx:11` | 세 단계 카드, 두 줄 | `verify.methodLink`, `verify.step1`, `verify.step2`, `verify.step3`, `verify.method.step1`, `verify.method.step2`, `verify.method.step3`, `verify.localNote`, `verify.method.notCovered` | 코드, 화면 |

### 4.11 이용 방법 (`app/[locale]/guide/page.tsx`)

| id | 층 | 이름 | 소스 | 상태 | 문구 키 | 근거 |
|---|---|---|---|---|---|---|
| CL-U-137 | Block | 화면 머리 | `guide/page.tsx:13` | 없음 | `guide.title`, `guide.desc` | 코드, 화면 |
| CL-U-138 | Block | 카드 셋(고르기, 열기, 받기) | `:14-18` | 없음 | `guide.pickTitle`, `guide.pickBody`, `guide.openTitle`, `guide.openBody`, `guide.getTitle`, `guide.getBody` | 코드, 화면 |
| CL-U-139 | Section | "알아 둘 값"(`GuideFees`) | `:19-23`, `components/shell/GuideFees.tsx:14-20` | 3행(받기 비율, 배송비, 최소 충전). USDT 결과 행은 지금 나오지 않는다 | `guide.facts`, `guide.takeRate`, `guide.takeRateValue`, `guide.cashItems`, `guide.cashItemsValue`, `guide.shipFee`, `guide.minCharge`, `guide.verifyBody` | 코드, 화면 |
| CL-U-140 | Component | 링크 둘 | `:24` | "개봉 결과 검증"은 옛 주소 `/fairness` 로 간다 | `nav.verify`, `nav.legal` | 코드, 화면 |

### 4.12 계정 (`components/account/AccountScreen.tsx`)

| id | 층 | 이름 | 소스 | 상태 | 문구 키 | 근거 |
|---|---|---|---|---|---|---|
| CL-U-141 | Block | 화면 머리 | `AccountScreen.tsx:44` | 설명이 로그인 여부로 바뀜 | `account.title`, `account.desc`, `account.loginLine` | 코드, 화면 |
| CL-U-142 | Component | 자리 표시(240), 로그인 전 단추와 가입 링크 | `:45-46` | 없음 | `common.loading`, `nav.login`, `login.signupTitle` | 코드, 화면 |
| CL-U-143 | Block | 지갑 묶음 2행(링크) | `:49-52` | hover | `account.wallet`(aria), `account.balance`, `wallet.withdraw` | 코드, 화면(`account-mobile.png`) |
| CL-U-144 | Block | 보관함 묶음 2행(링크, 둘 다 `/inventory`) | `:53-56` | hover | `account.vault`(aria), `account.held`, `account.shippingNow`, `account.countN` | 코드, 화면 |
| CL-U-145 | Block | 보안 묶음(인증 앱 단추 행, 이메일 행) | `:57-60` | 인증 앱 행의 값이 "연결하기" 또는 "켜짐" | `account.security`(aria), `account.twoFactor`, `account.on`, `account.connect`, `account.email` | 코드, 화면("인증 앱 연결하기") |
| CL-U-146 | Block | 계정 관리 묶음 3행(단추) | `:61-65` | 닉네임이 없으면 "없음" | `account.manage`(aria), `account.nickname`, `account.none`, `account.password`, `account.closeTitle` | 코드, 화면 |
| CL-U-147 | Block | 도움 묶음 3행(링크) | `:66-70` | hover | `account.help`(aria), `nav.guide`, `nav.verify`, `nav.legal` | 코드, 화면 |
| CL-U-148 | Component | "로그아웃" 링크 | `:71` | 누르면 확인창 | `account.logout` | 코드, 화면 |

### 4.13 약관 (`components/legal/*`)

| id | 층 | 이름 | 소스 | 상태 | 문구 키 | 근거 |
|---|---|---|---|---|---|---|
| CL-U-149 | Page | 약관 목록 | `components/legal/LegalCenterScreen.tsx:14-29` | 묶음 셋, 문서 행 13개(링크), 버전 한 줄, 출처 한 줄 | 옛 묶음: `legalCenter.title`, `intro`, `version`, `effective`, `groups.basics`, `groups.transactions`, `groups.rights`, `sourcesNote`, `legalDocs.{문서}.title` | 코드, 화면(링크 13) |
| CL-U-150 | Page | 약관 문서 | `components/legal/LegalDocScreen.tsx:14-26` | 절마다 제목과 본문(줄바꿈 보존 `.v-prose`). 뒤로 가기와 아래 링크는 목록으로 | 옛 묶음: `legalDocs.{문서}.title`, `summary`, `sections[].h`, `sections[].p`, `legalCenter.title`, `version`, `effective` | 코드, 화면(이용약관 절 11개) |

### 4.14 상태 화면

| id | 층 | 이름 | 소스 | 상태 | 문구 키 | 근거 |
|---|---|---|---|---|---|---|
| CL-U-151 | Page | 옮긴 화면 `MovedScreen` | `components/shell/MovedScreen.tsx:9` | 단추 글이 주소마다 다름 | `state.movedTitle`, `state.movedDesc`, `nav.guide`, `nav.boxes`, `nav.verify`, `nav.account` | 코드, 화면(`moved-about-mobile.png`) |
| CL-U-152 | Page | 없는 주소(언어 안) `NotFoundScreen` | `components/shell/StateScreens.tsx:11` | 없음 | `state.notFoundTitle`, `state.notFoundDesc`, `state.toBoxes` | 코드, 화면(배포 사이트에서는 `/{l}/dev/gallery/` 에서만 뜸) |
| CL-U-153 | Page | 없는 주소(루트) `RootNotFound` | `app/not-found.tsx:11` | 언어 셋. 머리줄, 꼬리말, 색 선 없음 | 같은 키 셋을 파일에서 직접 읽는다 | 코드, 화면(`notfound-root-mobile.png`, `notfound-locale-mobile.png`. 둘째 파일은 이름과 달리 `/ko/no-such-page/` 에 뜬 루트 404 다) |
| CL-U-154 | Page | 오류 화면 `ErrorScreen` | `StateScreens.tsx:23`, `app/[locale]/error.tsx:5` | 없음 | `state.errorTitle`, `state.errorDesc`, `state.retry` | 코드. 화면에서는 띄우지 못했다 |
| CL-U-155 | Page | 루트 넘김 화면 `RootRedirect` | `app/page.tsx:9` | 없음 | 없음. "VOILA.GG" 가 코드에 박혀 있다 | 코드 |
| CL-U-156 | Component | 오프라인 한 줄 `OfflineLine` | `StateScreens.tsx:45-57` | 연결이 끊기면 생기고 돌아오면 사라짐 | `state.offline` | 코드, 화면(`offline-line-mobile.png`) |
| CL-U-157 | Component | 세션 끝남 한 줄 `SessionLine` | `StateScreens.tsx:37-43` | 다른 탭에서 로그아웃하거나 세션이 바뀌면 생김. 안에 로그인 링크 단추 | `state.sessionLost`, `nav.login` | 코드. 화면에서는 띄우지 못했다 |

### 4.15 개발용 갤러리 (`components/dev/Gallery.tsx`, 배포 사이트에는 없다)

| id | 층 | 이름 | 소스 | 내용 | 근거 |
|---|---|---|---|---|---|
| CL-U-158 | Page | 갤러리 | `Gallery.tsx:66-140` | 절 17개: Button, TextLink, Chips, Card와 Rows, Field, Line 6, Line fail 12, Line short, Empty 3, Skeleton, Chain record 5, Verify method, Toast, Sheet(단추 8), Confirm(단추 4), Reveal(단추 3) | 코드. 도달 불가(프로덕션 빌드에서는 `notFound()`) |
| CL-U-159 | Block | 갤러리의 표본 시트 | `Gallery.tsx:128-132` | 충전 시트 모양의 표본 | 코드. 도달 불가 |
| CL-U-160 | Block | 갤러리의 확인창 넷 | `Gallery.tsx:133-136` | 큰 금액, 받기(옛 글 `reveal.takeTitle`, `reveal.takeDesc`), 배송, 배송 취소 | 코드. 도달 불가. 받기 확인창의 글이 실제 흐름(`take.title`, `take.confirmDesc`)과 다르다 |
| CL-U-161 | Block | 블록체인 기록의 고정 자료 다섯 | `Gallery.tsx:34-40,97-99` | none, pending, confirmed, mismatch, error | 코드. 도달 불가 |

### 4.16 로그인 시트 안의 화면 (`components/flow/LoginSheet.tsx`)

시트 자체는 5장의 CL-U-169 다. 안의 단계는 화면 하나씩이라 여기 적는다.

| id | 층 | 이름 | 소스 | 상태 | 문구 키 | 근거 |
|---|---|---|---|---|---|---|
| CL-U-162 | Block | 이메일 단계 | `LoginSheet.tsx:89,94,97-110` | 방식 셋(로그인, 가입, 비밀번호 찾기)에 따라 제목과 링크가 바뀜. 공급자 단추 셋은 찾기 방식에는 없다. 실패는 칸 아래 한 줄. 처리 중에는 칸과 단추가 disabled 이고 시트가 잠긴다 | `login.title`, `login.signupTitle`, `login.recoverTitle`, `login.recoverDesc`, `login.email`, `login.continue`, `common.checking`, `login.provider`, `login.signupLink`, `login.loginLink`, `login.terms`. 실패 글은 옛 묶음 `account.errors.*` | 코드, 화면(`login-sheet-mobile.png`, `login-sheet-desktop.png`. 빈 이메일로 누르면 실패 한 줄) |
| CL-U-163 | Block | 비밀번호 단계 | `:91-92,106-107` | 설명이 이메일로 바뀜. 가입이면 "새 비밀번호"와 힌트 | `login.password`, `login.newPassword`, `login.hint`, `login.editEmail`, `login.forgot` | 코드. 화면에서는 가지 않았다 |
| CL-U-164 | Block | 이메일 인증 단계와 비밀번호 다시 정하기 단계 | `:90-91,108` | 코드 칸(숫자 6자리), 다시 받기 링크 | `login.verifyTitle`, `login.resetTitle`, `login.codeDesc`, `login.code`, `login.newPassword`, `login.resend` | 코드. 화면에서는 가지 않았다. 캡처 스크립트의 가입 동작(`web/scripts/capture/quick.mjs` 의 member)은 이메일과 비밀번호만 넣고 시트가 닫히기를 기다린다. 서버가 없는 배포에서는 인증 단계 없이 끝나는 것으로 보인다(짐작) |
| CL-U-165 | Block | 다시 정함 완료 단계 | `:85-86` | 주 단추가 로그인 화면으로 돌아감 | `login.doneTitle`, `login.loginLink` | 코드. 화면에서는 가지 않았다 |

## 5. 숨은 화면

### 5.1 겹침 화면의 공통 동작

`Sheet` 와 `Confirm` 과 개봉 장면 둘은 모두 `lib/useModal.ts` 를 쓴다.

| 동작 | 내용 | 근거 |
|---|---|---|
| DOM | 열릴 때만 만들어진다. 닫히면 DOM 에 없다(열림 값이 거짓이면 `null` 을 돌려준다) | 코드: `ui/Sheet.tsx:15,35`. 화면: 닫으면 `[role=dialog]` 가 0 개 |
| 역할 | `Sheet` 는 `role="dialog"`, `Confirm` 은 `role="alertdialog"`, 둘 다 `aria-modal="true"`. 제목이 `aria-labelledby` 로 묶인다(id 는 `v-sheet-title`, `v-confirm-title` 로 고정이라 시트 둘이 함께 뜨면 같은 id 가 둘 생길 수 있다. 짐작) | 코드: `Sheet.tsx:18,22,38,40`. 화면 |
| 스크롤 잠금 | 첫 겹침 화면이 열릴 때 `body` 의 `overflow` 를 `hidden` 으로, 마지막이 닫힐 때 되돌린다 | 코드: `useModal.ts:33-36,79`. 화면: 열면 `hidden`, 닫으면 빈 값 |
| 포커스 | 열리면 창으로 포커스가 간다. Tab 과 Shift Tab 이 창 안에서 돈다. 닫히면 열기 전의 요소로 돌아간다 | 코드: `useModal.ts:39-43,53-66,80-82`. 화면: 로그인 시트에서 Tab 14번이 모두 창 안. 돌아가는 포커스는 코드로만 봤다 |
| Esc | 맨 위 창 하나만 닫는다 | 코드: `useModal.ts:45-52`. 화면 |
| 바깥 누름 | 바탕(`.v-scrim`)을 누르면 닫힌다(mousedown) | 코드: `Sheet.tsx:17,37`. 화면 |
| 닫기 단추 | `Sheet` 에만 오른쪽 위에 있다. `Confirm` 에는 없고 "취소" 링크가 있다 | 코드: `Sheet.tsx:19,45`. 화면 |
| 잠김 | `Sheet` 의 `locked`, `Confirm` 의 `busy` 가 참이면 Esc, 바깥 누름, 닫기 단추, 취소가 모두 듣지 않는다 | 코드: `Sheet.tsx:14,17,19,34,37,45` |
| 겹침 | 겹치면 아래 창은 `inert` 와 `aria-hidden` 이 된다. 다만 아래 창이 위 창을 DOM 안에 품고 있으면(개봉 장면 안의 시트) 그대로 둔다 | 코드: `useModal.ts:10-19`. 화면: 개봉 장면 위에 시트가 떠도 장면의 `inert` 가 거짓 |
| 뒤로 가기 | 다루지 않는다. 브라우저의 뒤로 가기는 창을 닫는 것이 아니라 앞 화면으로 간다 | 실행: 닿는 소스에 `popstate`, `history`, `useRouter` 가 없음 |
| 모양 | 768px 미만은 아래에서 올라오는 시트, 이상은 가운데 창(폭 480px, wide 는 640px). z 200 | 코드: `app/ui.css:118-131` |
| 움직임 | 바탕이 0.18초에 나타나고 창이 0.26초에 24px 올라온다. 움직임 줄이기면 없다. 개봉 장면 위의 시트는 처음부터 불투명하다 | 코드: `app/ui.css:132-137`, `app/opening.css:47-48,129` |

아래 표에서 "공통"이라고 적은 닫는 법은 Esc, 바깥 누름, 닫기 단추(시트) 또는 취소 링크(확인창) 셋이다.

### 5.2 시트와 확인창

| id | 이름 | 소스 | 여는 법 | 닫는 법 | 안의 것과 상태 | 문구 키 | 지금 흐름에서 닿는가 | 근거 |
|---|---|---|---|---|---|---|---|---|
| CL-U-166 | 메뉴 시트 | `shell/AppShell.tsx:60-64` | 머리줄의 메뉴 단추(900px 미만) | 공통, 그리고 행을 누르면 닫히며 이동 | 링크 행 7개 | `nav.menu`, `nav.*` 7개, `common.close` | 닿음 | 코드, 화면(`menu-sheet-mobile.png`. 세 방법으로 닫힘) |
| CL-U-167 | 충전 시트 | `flow/ChargeSheet.tsx:43-59` | 지갑의 충전 단추, 박스 열기 막대의 충전, 개봉 장면과 결과의 충전, 잔액 시트의 충전 | 공통, 그리고 입금이 확인되면 스스로 닫힘 | 네트워크 알약 셋(TRC-20, BEP-20, ERC-20), QR 과 주소 카드, 상태 한 줄(준비 중, 주소 실패, 기다리는 중, 확인 n/전체), 주 단추("주소 복사", 주소가 없으면 disabled, 실패면 "주소 다시 받기"), 아래 한 줄 | `charge.title`, `charge.desc`, `charge.network`, `charge.qr`, `charge.preparing`, `charge.addressFail`, `charge.waiting`, `charge.confirming`, `charge.copy`, `charge.retry`, `charge.min`, `charge.confirmations`, `common.copied` | 닿음. 다만 배포 사이트에서는 실패 상태만 봤다 | 코드. 화면: 세 네트워크 가운데 둘을 눌렀고 둘 다 "주소를 받지 못했습니다."와 "주소 다시 받기"(`charge-sheet-mobile.png`). QR, 주소, 복사 토스트, 확인 n/전체는 화면에서 보지 못했다 |
| CL-U-168 | 충전 시트의 로그인 전 꼴 | `flow/ChargeSheet.tsx:36-42` | 로그인하지 않은 채 충전 시트가 열려 있을 때 | 공통 | 한 줄 설명과 로그인 단추 | `charge.title`, `charge.loginDesc`, `nav.login` | 닿지 않음에 가깝다: 충전을 여는 단추는 전부 로그인한 사람에게만 나온다. 시트가 열린 채 세션이 끝나면 보일 수 있다(짐작) | 코드 |
| CL-U-169 | 로그인 시트 | `flow/LoginSheet.tsx:83-112`, 붙는 곳 `auth/AuthHost.tsx:50` | 머리줄 로그인, 배너 단추(가입 방식), 박스의 "로그인하고 언박싱", 각 화면의 로그인 단추, 계정의 가입 링크, 세션 끝남 한 줄 | 공통. 처리 중에는 잠김. 끝나면 스스로 닫힘 | 4.16 의 단계 넷과 완료 | 4.16 참고 | 닿음 | 코드, 화면 |
| CL-U-170 | 잔액 시트 | `flow/BalanceSheet.tsx:45-61` | 머리줄의 잔액 단추 | 공통 | 3행(쓸 잔액, 출금할 수 있는 잔액, 보관 상품). 보관 상품이 있으면 주 단추가 "USDT로 받기"이고 링크 둘(충전, 출금). 없으면 주 단추가 충전이고 링크 둘(출금, 지갑 내역) | `balanceSheet.title`, `balanceSheet.spendable`, `balanceSheet.withdrawable`, `balanceSheet.held`, `balanceSheet.heldLabel`, `balanceSheet.heldWorth`, `balanceSheet.heldNone`, `take.title`, `box.charge`, `wallet.withdraw`, `balanceSheet.history` | 닿음 | 코드, 화면(두 꼴 모두. `balance-sheet-mobile.png`) |
| CL-U-171 | 잔액 시트의 로그인 전 꼴 | `flow/BalanceSheet.tsx:36-42` | 로그인하지 않은 채 잔액 시트가 열려 있을 때 | 공통 | 한 줄과 로그인 단추 | `balanceSheet.title`, `balanceSheet.login`, `nav.login` | 닿지 않음에 가깝다: 잔액 단추는 로그인한 사람에게만 나온다(짐작: 세션이 끝나는 순간에만) | 코드 |
| CL-U-172 | 상품 시트(박스 화면) | `box/BoxScreen.tsx:281-315` | 상품 타일, 상품 행, 확률표의 행 | 공통 | 사진, 생성 그림 안내 한 줄, 행 최대 6개, "배송 가능 나라 보기"와 "닫기"로 바뀌는 링크와 나라 목록, "다른 박스에도 있음" 링크와 비교 목록(다른 박스 행은 링크) | `box.genNote`, `reveal.value`, `reveal.odds`, `box.receive`, `box.receivePhysical`, `box.receiveDigital`, `box.receiveCash`, `box.takeAmount`, `box.priceBasis`, `box.priceBasisV`, `box.shipFee`, `box.shipFeeV`, `box.countriesLink`, `box.countriesHide`, `box.alsoIn`, `box.compareNote` | 닿음 | 코드, 화면(`box-pokemon-charizard-item-sheet-desktop.png`. 나라 13곳이 펴짐. 비교 목록과 생성 그림 안내는 연 상품에 없어 보지 못했다) |
| CL-U-173 | 후기 상세 시트 | `box/BoxReviews.tsx:146-173` | 후기 카드(박스 화면, 후기 화면) | 공통 | 별, 이름, 시각, 글 전체, 붙인 사진, 행 3개, 내 후기면 검증 안내와 링크 또는 "기록 없음" 한 줄, 박스로 가는 링크 | `reviews.detail`, `reviews.photo`, `reviews.item`, `reviews.itemPrice`, `reviews.box`, `reviews.verifyNote`, `nav.verify`, `reviews.noRecord`, `reviews.toBox` | 닿음. 내 후기 꼴(검증 줄, 붙인 사진)은 후기를 쓴 뒤에만 | 코드, 화면(샘플 후기 꼴. `review-detail-desktop.png`) |
| CL-U-174 | 큰 금액 확인창 | `box/BoxScreen.tsx:316` | 열기를 눌렀는데 낼 값이 50 USDT 이상이거나 10개 이상일 때. 결과 화면의 "한 번 더"도 같다 | Esc, 바깥 누름, 취소. 처리 중에는 잠김 | 제목(금액), 한 줄, 주 단추, 취소 | `box.confirmTitle`, `box.confirmDesc`, `box.open`, `box.opening`, `common.cancel` | 닿음 | 코드, 화면("$150 결제", "$500 결제". `open-confirm-qty5-mobile.png`, `open-confirm-mobile.png`) |
| CL-U-175 | 받기 선택 시트(고르기) | `flow/TakeSheet.tsx:150-195` | 보관함의 "USDT로 받기", 잔액 시트, 박스 열기 막대(잔액 부족), 개봉 장면과 결과(잔액 부족), 여러 개 결과의 주 단추(방금 나온 것만, 미리 고른 채), 출금 화면의 링크 | 공통 | 불러오는 중(자리 표시 144 와 disabled 단추), 빈 상태와 돌아가기 단추, 목록: 전체 선택 행(`role="checkbox"`, 참, 거짓, 일부), 상품 행(`role="checkbox"`), 아래 붙은 막대(카드 몫 안내 한 줄, 주 단추. 고른 것이 없으면 disabled) | `take.title`, `take.desc`, `common.loading`, `take.empty`, `take.selectAll`, `take.ref`, `take.cardNote`, `take.pick`, `take.submit`, `common.close`, `take.withdrawBack`(출금 화면에서 열 때의 돌아가기 글) | 닿음 | 코드, 화면(`take-sheet-held-mobile.png`, `take-sheet-fresh-mobile.png`. 빈 상태와 카드 몫 한 줄은 보지 못했다) |
| CL-U-176 | 받기 확인창 `TakeConfirm` | `flow/TakeSheet.tsx:52-57` | 받기 선택 시트의 주 단추, 개봉 장면의 "USDT로 받기", 여러 개 결과의 상품 시트, 보관함 상품 시트 | Esc, 바깥 누름, 취소. 처리 중에는 잠김 | 제목, 금액이 든 한 줄, 주 단추(busy), 취소 | `take.title`, `take.confirmDesc`, `reveal.take`, `common.checking`, `common.cancel` | 닿음 | 코드, 화면(네 곳 모두에서 뜸. `take-confirm-mobile.png`) |
| CL-U-177 | 받기 선택 시트(결과) | `flow/TakeSheet.tsx:199-244` | 확인창에서 받기를 눌렀을 때. 확인창이 떠 있는 동안 고른 것이 다른 탭에서 전부 처리됐을 때도 | 공통. 처리 중에는 잠김 | 한 줄들: 받음, 카드 몫, 이미 받음, 반영 대기, 확인 못함(빨강), 실패(빨강), 남은 것 n 개(빨강), 바뀜. 일부만 됐으면 받은 것, 남은 것, 확인 못한 것 목록 셋. 주 단추는 다시 시도 또는 다시 확인 또는 닫기. 링크는 보관함과 지갑 내역, 또는 돌아가기 | `take.changed`, `take.done`, `take.cardNote`, `take.already`, `op.pending`, `take.unknown`, `take.failed`, `take.leftLine`, `take.takenGroup`, `take.leftGroup`, `take.unknownGroup`, `op.recheck`, `take.retry`, `nav.inventory`, `balanceSheet.history` | 닿음(받기를 끝까지 누르면). 실패, 대기, 확인 못함, 바뀜은 평소에는 나오지 않는다 | 코드. 화면에서는 받기를 확인하지 않아 보지 못했다 |
| CL-U-178 | 개봉 설정 시트 | `box/Opening.tsx:344-350` | 개봉 장면 위쪽의 설정 단추(연출 중에도 있다) | 공통 | 스위치 셋(`role="switch"`, 켬과 끔): 소리와 진동, 짧게 보기, 자동으로 USDT 로 받기 | `op.settings`, `op.setSound`, `op.setSoundNote`, `op.setShort`, `op.setShortNote`, `op.setAuto`, `op.setAutoNote`, `op.on`, `op.off` | 닿음(한 개 열기에서만. 여러 개 결과 화면에는 설정 단추가 없다) | 코드, 화면(`opening-settings-mobile.png`) |
| CL-U-179 | 자동 받기 확인창 | `box/Opening.tsx:352` | 설정 시트에서 자동 받기를 켤 때. 그동안 설정 시트는 사라진다 | Esc, 바깥 누름, 취소. 닫으면 설정 시트가 다시 뜬다 | 제목, 기준 설명, "자동으로 받기 켜기", 취소 | `op.setAuto`, `op.autoConfirm`, `op.autoOn`, `common.cancel` | 닿음 | 코드, 화면(취소하면 설정 시트로 돌아옴) |
| CL-U-180 | 검증 시트 | `flow/VerifySheet.tsx:57-94` | 개봉 장면과 결과의 "개봉 결과 검증", 보관함 상품 시트, 나온 상품 상세, 검증 화면의 기록 행 | 공통. "값을 직접 넣어 검증"을 누르면 닫히며 검증 화면으로 간다 | 세 단계: 잠근 값 1행과 안내, 블록체인 기록(CL-U-181), 다시 계산한 결과 행 최대 6개. 계산 중에는 값 자리에 "확인 중". 판정 한 줄 셋(같음, 번호까지만, 다름은 빨강), 계산 실패 한 줄. 긴 값에는 전체 값이 `title` 로 붙는다. 링크 둘: 방식 설명 펴기, 직접 계산으로 | `verify.title`, `verify.desc`, `verify.step1`, `verify.locked`, `verify.localNote`, `verify.step2`, `verify.step3`, `verify.seed`, `verify.client`, `verify.round`, `verify.table`, `verify.tableStored`, `verify.tableNone`, `verify.number`, `verify.item`, `common.checking`, `verify.ok`, `verify.partial`, `verify.bad`, `verify.failed`, `verify.methodLink`, `verify.manual` | 닿음 | 코드, 화면(같음: 방금 연 결과. 다름: 심은 옛 기록. `verify-sheet-mobile.png`, `verify-record-sheet-desktop.png`). "번호까지만"과 계산 실패는 보지 못했다 |
| CL-U-181 | 블록체인 기록 한 칸 `ChainRecordView` | `components/verify/ChainRecord.tsx:13-34` | 검증 시트의 둘째 단계 | 없음(시트 안) | 상태 다섯. 실제 기록은 언제나 "기록 없음"(상태 1행과 옅은 한 줄). 나머지 넷(확정 전, 확정, 다름, 불러오기 실패)에는 체인 이름 행, 기록 주소 행, 바깥 링크, "다시 확인" 단추가 있다 | `verify.chain.status`, `verify.chain.network`, `verify.chain.address`, `verify.chain.none`, `noneBody`, `pending`, `pendingBody`, `confirmed`, `ok`, `mismatch`, `mismatchBody`, `error`, `errorBody`, `view`, `retry` | 기록 없음만 닿는다. 나머지 넷은 갤러리의 고정 자료로만 그려진다(도달 불가) | 코드: `lib/chainRecord.ts:29-31` 이 언제나 none 을 돌려준다. 화면("블록체인 기록 없음") |
| CL-U-182 | 방식 설명 펴기 | `flow/VerifySheet.tsx:88,91` | 검증 시트의 "블록체인 검증 방식" 링크 | 같은 링크를 다시 누름 | `VerifyMethod`(CL-U-136 과 같은 글) | CL-U-136 과 같음 | 닿음 | 코드, 화면(단계 3개가 펴짐) |
| CL-U-183 | 상품 시트(여러 개 결과) | `box/Reveal.tsx:284-296` | 결과 목록에서 받을 수 있는 상품 행 | 공통. 받으면 스스로 닫힘 | 사진, 2행, 확인 못함 한 줄 또는 실패 한 줄, 주 단추 "USDT로 받기"(받았으면 한 줄 글, 확인 못함이면 없음), 링크(검증, 확인 못함이면 지갑 내역도) | `reveal.value`, `reveal.odds`, `take.unknown`, `take.failed`, `reveal.take`, `reveal.takenDesc`, `nav.verify`, `balanceSheet.history` | 닿음 | 코드, 화면("USDT로 받기 ($26.6)", "개봉 결과 검증") |
| CL-U-184 | 상품 시트(보관함) | `inventory/InventoryScreen.tsx:142-178` | 보관함의 상품 행 | 공통 | 설명은 박스 이름. 행: 상태, 상품가, 받은 날, 보관 기한(있을 때), 받은 금액(받았을 때), 배송 신청일, 택배사, 운송장 번호, 후기 행("후기 쓰기" 단추 또는 "후기를 올렸습니다"). 한 줄: 운송장 대기, 취소 실패, 확인 못함, 받기 실패. 주 단추가 상태로 바뀜: USDT로 받기, 배송 신청 취소, 배송 조회(바깥 링크, 새 탭). 링크: 배송 받기(실물이고 보관 중일 때), 지갑 내역(확인 못함일 때), 검증 | `inv.status`, `reveal.value`, `inv.acquired`, `inv.keepUntil`, `inv.takenAmount`, `inv.requestedAt`, `inv.carrier`, `inv.tracking`, `review.text`, `inv.writeReview`, `inv.reviewed`, `inv.waitingTracking`, `inv.cancelFailed`, `take.unknown`, `take.failed`, `reveal.take`, `inv.cancelShip`, `inv.track`, `reveal.ship`, `balanceSheet.history`, `nav.verify` | 닿음 | 코드, 화면(보관 중, 배송 신청함, 배송 중의 세 꼴. `inventory-item-sheet-mobile.png`) |
| CL-U-185 | 배송 시트 | `flow/ShipSheet.tsx:62-78` | 보관함 상품 시트의 "배송 받기" 링크. 그동안 상품 시트는 사라진다 | 공통. 닫으면 상품 시트가 다시 뜬다 | 넓은 시트. 나라 알약 13개, 입력칸 넷(받는 사람, 전화, 우편번호, 주소), 통관 번호 칸(한국은 개인통관고유부호, 중국은 신분증 번호. 그 밖의 나라는 없음), 칸마다 실패 한 줄, 2행(보낼 상품 수, 배송비), 잔액 부족 한 줄, 접수 실패 한 줄, 주 단추 | `ship.title`, `ship.desc`, `ship.country`, `ship.recipient`, `ship.phone`, `ship.postal`, `ship.address`, `ship.pccc`, `ship.residentId`, `ship.errRecipient`, `ship.errPhone`, `ship.errPostal`, `ship.errAddress`, `ship.errPccc`, `ship.errResidentId`, `ship.count`, `ship.countN`, `ship.fee`, `box.short`, `ship.failed`, `ship.submit` | 닿음 | 코드, 화면(`ship-sheet-mobile.png`. 한국이 골라져 있고 배송비 $0. 제출하지 않았다) |
| CL-U-186 | 배송 확인창 | `flow/ShipSheet.tsx:79` | 배송 시트의 주 단추(입력이 맞고 잔액이 될 때). 그동안 배송 시트는 사라진다 | Esc, 바깥 누름, 취소. 처리 중에는 잠김 | 제목, 주소가 든 한 줄, 주 단추(busy), 취소 | `ship.confirmTitle`, `ship.confirmDesc`, `ship.submit`, `common.checking`, `common.cancel` | 닿음 | 코드. 제출하지 않아 화면에서는 보지 못했다 |
| CL-U-187 | 후기 쓰기 시트 | `flow/ReviewSheet.tsx:55-71` | 보관함 상품 시트의 "후기 쓰기" 행. 그동안 상품 시트는 사라진다 | 공통 | 별점 알약 다섯, 글 칸(여러 줄), 사진 고르기(파일), 고른 사진 미리 보기, 실패 한 줄 셋(짧음, 사진, 저장), 주 단추(busy), 아래 한 줄 | `review.title`, `review.desc`, `review.rating`, `review.stars`, `review.text`, `review.textHint`, `review.photo`, `review.tooShort`, `review.photoFail`, `review.saveFail`, `review.send`, `common.checking`, `review.proofNote` | 닿음 | 코드. 화면에서는 행이 있는 것만 보고 열지 않았다 |
| CL-U-188 | 배송 취소 확인창 | `inventory/InventoryScreen.tsx:187` | 배송 신청함 상태의 상품 시트에서 "배송 신청 취소" | Esc, 바깥 누름, 취소. 처리 중에는 잠김 | 제목, 한 줄, 주 단추, 취소 | `inv.cancelTitle`, `inv.cancelDesc`, `inv.cancelShip`, `common.checking`, `common.cancel` | 닿음 | 코드, 화면 |
| CL-U-189 | 거래 시트 | `wallet/WalletScreen.tsx:124-144` | 지갑의 내역 행 | 공통 | 제목은 거래 종류, 설명은 시각. 행 최대 5개(금액, 상태, 네트워크, 수수료, 받는 금액), 주소 카드, 한 줄(남은 대기 시간, 심사 중, 취소 실패), "출금 취소" 단추(72시간 대기 건만), 탐색기 링크(새 탭, 거래 해시가 있을 때) | `wallet.amount`, `inv.status`, `wallet.status.*`, `charge.network`, `wallet.fee`, `wallet.net`, `wallet.toAddress`, `wallet.holdLeft`, `wallet.reviewLine`, `wallet.cancelFailed`, `wallet.cancel`, `wallet.explorer` | 닿음 | 코드, 화면(보너스, 처리 대기, 72시간 대기의 세 꼴. "71시간 59분 뒤에 전송됩니다.") |
| CL-U-190 | 출금 취소 확인창 | `wallet/WalletScreen.tsx:145` | 거래 시트의 "출금 취소" | Esc, 바깥 누름, 취소. 처리 중에는 잠김 | 제목, 한 줄, 주 단추, 취소 | `wallet.cancelTitle`, `wallet.cancelDesc`, `wallet.cancel`, `common.checking`, `common.cancel` | 닿음 | 코드, 화면 |
| CL-U-191 | 인증 앱 시트(출금 관문) | `wallet/WithdrawScreen.tsx:185-187` | 출금 관문의 "인증 앱 연결하기" | 공통. 연결되면 스스로 닫힘 | 넓은 시트. `TwoFactorSetup` 이 열리자마자 준비를 시작한다 | `account.twoFactor`, `account.twoFactorDesc` 와 CL-U-193 | 닿음 | 코드, 화면(`twofactor-sheet-mobile.png`. QR 과 키가 바로 나옴) |
| CL-U-192 | 인증 앱 시트(계정) | `account/AccountScreen.tsx:75-77` | 계정의 인증 앱 행 | 공통 | 넓은 시트. 처음에는 안내와 "Google OTP 등록 시작" 단추 | 같음 | 닿음 | 코드, 화면 |
| CL-U-193 | 인증 앱 연결 부품 `TwoFactorSetup` | `wallet/TwoFactorSetup.tsx:73-97` | 위 두 시트 안 | 없음(시트 안) | 다섯 꼴: 로그인 전(한 줄과 단추), 준비 중 한 줄, 안내와 시작 단추(busy), QR 과 수동 키와 "키 복사" 링크와 코드 칸(6자리)과 주 단추(6자리 전에는 disabled), 실패 한 줄 | 옛 묶음 `security.intro`, `startSetup`, `step1Title`, `step1Body`, `manualKey`, `copyKey`, `step2Body`, `codeLabel`, `codeWrong`, `copyFailed`, `account.processing`, `account.verifyCode`, `account.errors.*`. 새 묶음 `account.loginLine`, `nav.login`, `common.copied` | 닿음. 로그인 전 꼴은 닿지 않는다(두 시트 모두 로그인한 화면에서만 열린다) | 코드, 화면 |
| CL-U-194 | 닉네임 시트 | `account/AccountSheets.tsx:38-43` | 계정의 닉네임 행 | 공통 | 입력칸, 바꿀 수 없는 기간 한 줄(주 단추 disabled), 실패 한 줄, 주 단추(busy) | `account.nickname`, `account.nicknameDesc`, `account.nicknameLocked`, `account.nicknameRule`, `account.saveFail`, `account.save`, `common.checking`, 옛 묶음 `account.errors.*` | 닿음 | 코드, 화면 |
| CL-U-195 | 비밀번호 시트 | `account/AccountSheets.tsx:66-76` | 계정의 비밀번호 행 | 공통 | 입력칸 셋(현재, 새, 인증 앱 코드), 실패 한 줄, 주 단추(busy). 소셜 계정이면 설명 한 줄만 있고 칸이 없다 | `account.password`, `account.passwordDesc`, `account.passwordSocial`, `account.passwordCurrent`, `account.passwordNew`, `verify.codeLabel`, `account.passwordRule`, `account.codeRule`, `account.passwordSave`, `common.checking` | 닿음 | 코드, 화면(이메일 계정 꼴) |
| CL-U-196 | 탈퇴 시트 | `account/AccountSheets.tsx:96-100` | 계정의 탈퇴 행 | 공통 | 비밀번호 칸, 실패 한 줄, 주 단추(비밀번호가 비면 disabled) | `account.closeTitle`, `account.closeDesc`, `account.passwordCurrent`, `account.closeCta` | 닿음 | 코드, 화면 |
| CL-U-197 | 탈퇴 확인창 | `account/AccountSheets.tsx:101` | 탈퇴 시트의 주 단추. 그동안 탈퇴 시트는 사라진다 | Esc, 바깥 누름, 취소. 처리 중에는 잠김 | 제목, 한 줄, 주 단추(busy), 취소 | `account.closeTitle`, `account.closeConfirm`, `account.closeCta`, `common.checking`, `common.cancel` | 닿음 | 코드. 화면에서는 열지 않았다 |
| CL-U-198 | 로그아웃 확인창 | `account/AccountScreen.tsx:81` | 계정의 "로그아웃" 링크 | Esc, 바깥 누름, 취소. 처리 중에는 잠김 | 제목, 한 줄, 주 단추(busy), 취소 | `account.logoutTitle`, `account.logoutDesc`, `account.logout`, `common.checking`, `common.cancel` | 닿음 | 코드, 화면(`logout-confirm-mobile.png`) |
| CL-U-199 | 나온 상품 상세 시트 | `box/WinsScreen.tsx:94-113` | 나온 상품의 줄 | 공통. "개봉 결과 검증"을 누르면 닫히고 같은 자리에 검증 시트가 뜬다 | 사진, 생성 그림 안내, 6행(박스, 그때 또는 지금의 1회 가격, 상품가, 배수, 무료 개봉 여부, 나온 때), 지금 가격으로 견줬다는 한 줄, 주 단추(검증), 박스 링크 | `box.genNote`, `wins.box`, `wins.priceThen`, `wins.priceNow`, `reveal.value`, `wins.times`, `wins.timesV`, `wins.free`, `wins.freeUnknown`, `wins.freeYes`, `wins.freeNo`, `wins.at`, `wins.priceNowNote`, `nav.verify`, `reviews.toBox` | 닿음 | 코드, 화면(`wins-detail-desktop.png`. "무료 개봉 기록 없음", "지금의 1회 가격") |

### 5.3 화면 전체를 덮는 것

| id | 이름 | 소스 | 여는 법 | 닫는 법 | 잠금과 포커스 | DOM | 닿는가 | 근거 |
|---|---|---|---|---|---|---|---|---|
| CL-U-200 | 개봉 장면(CL-U-080) | `box/Opening.tsx:207`, `BoxScreen.tsx:319` | 한 개 열기, 못 본 결과 하나 | 결과가 다 보인 뒤(ready): 닫기 단추, Esc, "박스로 돌아가기", "보관함에 두기". 그 전의 Esc 는 닫지 않고 결과로 건너뛴다. 다음 구매 중에는 닫히지 않는다. 바깥 누름은 없다(바탕이 없다) | `useModal` 을 쓴다: 스크롤 잠금과 포커스 가둠. 결과가 드러나면 포커스를 창으로 옮긴다 | 열 때만 만든다. 다시 열면 `key` 가 바뀌어 새로 만든다 | 닿음 | 코드: `Opening.tsx:121-124`. 화면(ready 에서 Esc 로 닫히고 `overflow` 가 풀림) |
| CL-U-201 | 개봉 결과(CL-U-091) | `box/Reveal.tsx:167`, `BoxScreen.tsx:320` | 여러 개 열기, 못 본 결과 여럿 | 결과가 뜨고 0.35초 뒤: 닫기 단추, Esc, "보관함에 두기", "박스로 돌아가기". 연출 중의 Esc 는 결과 바로 보기 | 같음 | 같음 | 닿음 | 코드: `Reveal.tsx:70-80`. 화면(Esc 로 닫힘) |

### 5.4 토스트, 접는 것, 그 밖의 숨은 것

| id | 종류 | 이름 | 소스 | 나타나는 때 | 사라지는 때 | DOM | 닿는가 | 근거 |
|---|---|---|---|---|---|---|---|---|
| CL-U-202 | 토스트 | "복사했습니다" 한 줄 | `ui/toast.tsx:17-25`, 부르는 곳 `flow/ChargeSheet.tsx:33`, `wallet/TwoFactorSetup.tsx:55` | 충전 주소 복사, 인증 앱 키 복사 | 2.4초 뒤 스스로 | 자리(`.v-toast-host`, `aria-live="polite"`)는 `AppShell` 이 있는 화면에 늘 있고, 토스트는 그때만 생긴다. 화면 아래 가운데, z 300, 누를 수 없다 | 키 복사는 닿음. 주소 복사는 배포 사이트에서 주소가 나오지 않아 닿지 않았다 | 코드. 화면에서는 토스트를 띄우지 않았다 |
| CL-U-203 | 토스트 | 로그아웃 알림 | `stores/authStore.ts:72`, 부르는 곳 `account/AccountScreen.tsx:39` | 로그아웃하면 스토어에 "로그아웃했습니다."가 적힌다 | 그리는 곳이 없다 | 없음 | 닿지 않음: `authStore.toast` 를 그리는 닿는 컴포넌트가 없다 | 코드, 실행(검색: 쓰는 곳은 `community/CommunityBoard.tsx` 하나, 닿지 않는 파일). 문구 `account.loggedOut` 은 화면에 나오지 않는다 |
| CL-U-204 | 아코디언 | 박스 화면의 접는 글 둘 | CL-U-078, CL-U-079 | 요약을 누름 | 다시 누름 | 늘 DOM 에 있다(브라우저의 `details`) | 닿음 | 코드, 화면 |
| CL-U-205 | 펴는 글 | 상품 시트의 나라 목록, 비교 목록 | CL-U-172 | 링크를 누름 | 나라 목록은 다시 누르면 접힘. 비교 목록은 접는 길이 없고 시트를 닫으면 초기화 | 누를 때 생김 | 닿음 | 코드: `BoxScreen.tsx:296-312,281` |
| CL-U-206 | 탭 묶음 | 고르는 알약 아홉 곳 | CL-U-029 의 쓰는 곳 | 늘 | 없음 | 늘 | 닿음 | 코드. 탭 역할(`role="tab"`)은 쓰지 않고 `aria-pressed` 단추 묶음이다 |
| CL-U-207 | 넘기는 단추 | 후기 줄의 왼쪽, 오른쪽 단추 | CL-U-041 | 더 넘길 것이 있는 쪽 | 끝에 닿으면 | 그때만 생김. 손가락 화면에서는 숨김 | 닿음(옛 박스의 후기 줄) | 코드, 화면 |
| CL-U-208 | 자리 표시 | 여덟 곳 | CL-U-037 | 세션이나 저장값을 읽는 동안 | 읽으면 | 그때만 | 닿음. 다만 저장값이 금방 읽혀 화면에서는 한 번도 잡히지 않았다(`skeleton: 0`) | 코드 |
| CL-U-209 | 빈 상태 | 열 곳: 홈 검색, 박스 후기, 후기 화면, 보관함 탭 셋, 지갑 내역, 나온 상품, 검증 기록, 받기 시트 | 각 화면 | 목록이 비었을 때 | 없음 | 그때만 | 대부분 닿음. 후기 화면의 것은 닿지 않는다(CL-U-130) | 코드, 화면(홈 검색, 박스 후기, 보관함 둘) |
| CL-U-210 | 실패 한 줄 | 그 자리의 빨간 줄. 쓰는 곳: 박스 열기 실패, 개봉 장면 셋, 받기 시트 넷, 상품 시트 둘, 보관함 셋, 배송 시트 일곱, 충전 시트 하나, 로그인 시트 하나, 검증 시트 둘, 검증 화면 하나, 지갑 하나, 출금 여섯, 계정 시트 셋, 인증 앱 하나, 블록체인 기록 둘, 후기 쓰기 셋 | 각 소스 | 실패했을 때 | 다시 시도하거나 입력을 고치면 | 그때만. `role="alert"` | 닿음(조건이 될 때) | 코드, 화면(로그인, 출금 입력, 검증 입력, 검증 다름, 충전 주소 실패) |
| CL-U-211 | 안내 한 줄 | 오프라인, 세션 끝남 | CL-U-156, CL-U-157 | 조건이 될 때 | 조건이 풀리면 | 그때만. 머리줄 바로 아래 | 오프라인은 화면에서 확인. 세션 끝남은 코드로만 | 코드, 화면 |
| CL-U-212 | 경고 | 저장 공간이 가득 참 | `components/layout/LabBadge.tsx:33-37` | 저장이 실패했을 때(`voila:storage-full`) | 사라지지 않는다(새로 고칠 때까지) | 감싸는 자리는 늘 있고 경고는 그때만. 왼쪽 아래 고정, z 300, 누를 수 없다. 옛 Tailwind 클래스로 그린 호박색 상자 | 일부러 만들기 어렵다. 화면에서는 보지 못했다 | 코드. 글이 코드에 한국어로 박혀 있다(영어와 중국어 화면에서도 한국어) |
| CL-U-213 | 툴팁 | 브라우저 기본 툴팁(`title`) | `flow/VerifySheet.tsx:63,76,77`, `verify/VerifyScreen.tsx:109`, `verify/ChainRecord.tsx:21`, QR 의 `title` | 줄인 값에 마우스를 올림 | 마우스를 뗌 | 속성으로 늘 있다 | 닿음 | 코드. 만든 툴팁 부품은 없다 |
| CL-U-214 | 드롭다운, 팝오버, 드로어 | 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 해당 없음 | 실행: 닿는 소스에 `select`, `role="menu"`, `role="listbox"` 가 없다. 옆에서 나오는 드로어도 없다(메뉴는 시트다) |
| CL-U-215 | 겹쳐 뜨는 순서 | 시트가 서로 자리를 바꾸는 규칙 | 각 소스의 `open` 조건 | 해당 없음 | 해당 없음 | 해당 없음 | 닿음 | 아래 5.5 |

### 5.5 시트가 겹치는 곳과 바뀌는 곳

새 화면은 시트 위에 시트를 쌓지 않고 자리를 바꾸는 것이 원칙이다(코드의 주석: `flow/BalanceSheet.tsx:6`, `box/WinsScreen.tsx:9`). 실제로는 다음과 같다.

| 곳 | 일어나는 일 | 근거 |
|---|---|---|
| 잔액 시트 → 받기 선택 시트 | 잔액 시트가 사라지고 받기 시트가 뜬다. 받기 시트를 닫으면 둘 다 닫힌다 | 코드: `BalanceSheet.tsx:46,59`. 화면(창이 1개, 닫으면 0개) |
| 잔액 시트 → 충전 시트 | 잔액 시트를 닫고 충전 시트를 연다 | 코드: `BalanceSheet.tsx:43` |
| 보관함 상품 시트 → 배송, 검증, 후기, 받기 확인, 취소 확인 | 상품 시트가 사라지고 그것이 뜬다. 닫으면 상품 시트가 돌아온다 | 코드: `InventoryScreen.tsx:105`. 화면(배송 시트를 Esc 로 닫으면 상품 시트가 다시 보임) |
| 받기 선택 시트 → 확인창 → 결과 | 같은 자리에서 셋이 차례로 바뀐다 | 코드: `TakeSheet.tsx:150,197,199` |
| 설정 시트 → 자동 받기 확인창 | 자리를 바꾼다 | 코드: `Opening.tsx:344,352`. 화면 |
| 나온 상품 상세 → 검증 | 자리를 바꾼다 | 코드: `WinsScreen.tsx:51`. 화면 |
| 박스 화면의 상품 시트, 받기 시트 | 개봉 장면이 떠 있으면 그리지 않는다 | 코드: `BoxScreen.tsx:281,318` |
| 개봉 장면 또는 결과 위의 시트 | 겹친다: 장면이 아래에 남고 그 위에 시트 하나가 뜬다(받기 확인, 받기 선택, 설정, 검증, 상품 시트) | 화면(`[role=dialog]` 가 2개, 바탕은 1개) |
| 개봉 장면 위의 충전 시트 | 겹치지 않을 수 있다: 충전 시트는 `AppShell` 에 붙고 z 가 200 이라 장면(z 150) 위에 그려지지만, 장면의 포커스 가둠 밖의 DOM 에 있다 | 코드: `AppShell.tsx:65`, `Opening.tsx:286,291,298`. 짐작: 이때 장면이 `inert` 가 되는지, 포커스가 어디로 가는지는 화면에서 확인하지 못했다 |
| 여러 개 결과의 상품 시트 → 받기 확인, 검증 | 상품 시트가 사라지고 그것이 뜬다 | 코드: `Reveal.tsx:284` |

## 6. 닿지 않는 것

### 6.1 번호를 붙인 요소 가운데 배포 사이트의 사용자 흐름으로 닿지 않는 것 (14, 확인하지 못한 것 3)

| id | 무엇 | 까닭 |
|---|---|---|
| CL-U-100 | 개봉 결과의 "결과가 하나일 때" 두 꼴 | 박스 화면은 결과가 하나면 `Opening` 을 쓴다. 갤러리만 연다 |
| CL-U-130 | 후기 화면의 빈 상태 | 샘플 후기 28개가 늘 있다 |
| CL-U-158 ~ 161 | 갤러리와 그 안의 표본 넷 | 프로덕션 빌드에서는 없는 주소 |
| CL-U-168 | 충전 시트의 로그인 전 꼴 | 여는 단추가 로그인한 사람에게만 나온다 |
| CL-U-171 | 잔액 시트의 로그인 전 꼴 | 여는 단추가 로그인한 사람에게만 나온다 |
| CL-U-181 의 네 상태 | 블록체인 기록의 확정 전, 확정, 다름, 불러오기 실패 | 실제 기록은 언제나 "기록 없음"이다. 한 항목으로 센다 |
| CL-U-193 의 로그인 전 꼴 | 인증 앱 부품의 로그인 안내 | 두 시트 모두 로그인한 화면에서만 열린다. 한 항목으로 센다 |
| CL-U-203 | 로그아웃 알림 토스트 | 그리는 곳이 없다 |
| CL-U-075 의 아이콘 가지 | 사진 없는 상품 타일의 아이콘 | 타일은 사진 있는 상품에만 쓴다. 한 항목으로 센다 |
| CL-U-058 의 옛 분류 이름 | 분류 알약의 `categories.*` 가지 | 홈에 옛 박스가 없다. 한 항목으로 센다 |
| CL-U-139 의 USDT 결과 행 | 이용 방법의 `guide.cashItems` 행 | `LEGACY_RETIRED` 가 참이다. 한 항목으로 센다 |
| CL-U-066 (확인 못함) | 박스 그림 `.v-boxhero` | 대표 사진이 없는 박스에서만 그린다. 대표 사진이 없는 박스는 21개 있으나(실행: `boxesNoFacePhoto`) 그 박스에 박스 그림이 있는지는 확인하지 못했다. 닿을 수도 있다(확인 불가) |
| CL-U-154 (확인 못함) | 오류 화면 | 일부러 띄울 길이 없다(오류가 나야 뜬다) |
| CL-U-212 (확인 못함) | 저장 공간 경고 | 저장 공간이 가득 차야 뜬다 |

조건이 드물 뿐 닿을 수 있는 것은 여기 넣지 않았다(받기 결과의 실패 줄, 세션 끝남 한 줄 등).

### 6.2 `web/components` 에 있으나 어느 라우트도 그리지 않는 파일 (71)

근거는 전부 실행이다: `harness/claude-a/import-graph.mjs` 가 `web/app` 의 `.ts`, `.tsx` 에서 출발해 `import` 를 따라갔을 때 닿지 않은 파일. "가져오는 파일"은 그 파일을 `import` 하는 파일이고, 모두 이 표 안에 있다(닿지 않는 것끼리만 서로 부른다).

| 폴더 | 파일 | 무엇 | 가져오는 파일 |
|---|---|---|---|
| about | `AboutSections.tsx` | 옛 소개 화면의 절들(신뢰 띠, 라인업 띠, 카드 셋, 용어 풀이) | 없음 |
| about | `GlobalLiveFeed.tsx` | 배송 허브 지도와 증빙 흐름 | 없음 |
| about | `ImpactStats.tsx` | 숫자 타일, 자주 묻는 질문 아코디언, 마지막 유도 | 없음 |
| about | `IsometricStage.tsx` | 기울인 진열 무대 | 없음 |
| about | `LineupShowcase.tsx` | 라인업 진열 | 없음 |
| about | `TrustScenes.tsx` | 신뢰 장면 셋(환불, 공정, 배송) | `ImpactStats.tsx` |
| about | `VaultHero.tsx` | 옛 소개 화면의 히어로 | 없음 |
| auth | `AccountClosureFlow.tsx` | 옛 탈퇴 흐름(창) | 없음 |
| auth | `AuthModal.tsx` | 옛 로그인 창 | 없음 |
| auth | `AvatarSettings.tsx` | 프로필 사진 설정 | 없음 |
| auth | `HeaderAuthControl.tsx` | 옛 머리줄의 계정 단추와 펼침 메뉴 | `layout/SiteHeader.tsx` |
| auth | `LoginRequired.tsx` | 로그인 안내 블록 | `wallet/HistoryTab.tsx`, `UsdtDepositTab.tsx`, `WithdrawTab.tsx` |
| auth | `NicknameSettings.tsx` | 옛 닉네임 설정 | 없음 |
| auth | `PasswordChangeFlow.tsx` | 옛 비밀번호 변경 흐름(창) | 없음 |
| auth | `ProfileAvatar.tsx` | 프로필 사진 | `AvatarSettings.tsx`, `HeaderAuthControl.tsx`, `home/LiveReviewsSection.tsx` |
| auth | `ProviderMarks.tsx` | 옛 공급자 표식 | `HeaderAuthControl.tsx` |
| auth | `SecuritySettings.tsx` | 옛 보안 설정 | 없음 |
| box | `BoxCard.tsx` | 옛 박스 카드(지금 홈은 `BoxList.tsx` 안의 같은 이름 함수를 쓴다) | 없음 |
| box | `DetailModal.tsx` | 옛 박스 상세 창 | 없음 |
| box | `ProductArt.tsx` | 옛 상품 그림(실루엣, 현금 토큰, 상품권) | 닿지 않는 파일 11개 |
| box | `TierStrip.tsx` | 등급 배지와 띠 | `DetailModal.tsx` |
| community | `BoardComposer.tsx` | 게시글 쓰기 창 | `CommunityBoard.tsx` |
| community | `CommunityBoard.tsx` | 게시판 | 없음 |
| community | `CommunityNavigation.tsx` | 커뮤니티 탭 | `CommunityBoard.tsx` |
| community | `ReviewFormModal.tsx` | 옛 후기 쓰기 창 | 없음 |
| community | `reviewValueNotice.ts` | 후기 안내 글 | `ReviewFormModal.tsx` |
| fairness | `FairnessVerifier.tsx` | 옛 검증기 | `VisualVerifier.tsx` |
| fairness | `HashExplainer.tsx` | 해시 설명 | 없음 |
| fairness | `ProofFeed.tsx` | 지급 증빙 목록 | 없음 |
| fairness | `VisualVerifier.tsx` | 그림으로 보여 주는 검증기 | `VisualVerifyModal.tsx` |
| fairness | `VisualVerifyModal.tsx` | 검증 창 | `unboxing/UnboxingRoulette.tsx` |
| home | `AboutBanner.tsx` | 소개 배너 | 없음 |
| home | `CommerceHome.tsx` | 홈 시안 C | 없음 |
| home | `DailyFreeBox.tsx` | 매일 무료 박스(알약, 띠, 창) | 없음 |
| home | `DiscoveryGuide.tsx` | 이용 방법 카드 | 없음 |
| home | `HallOfFame.tsx` | 명예의 전당 | 없음 |
| home | `HotBoxes.tsx` | 인기 박스 | 없음 |
| home | `JackpotPoolBadge.tsx` | 잭팟 풀 배지 | `LiveTicker.tsx` |
| home | `LiveCounters.tsx` | 실시간 숫자 | 없음 |
| home | `LiveReviewsSection.tsx` | 후기 절 | `CommerceHome.tsx`, `NetflixHome.tsx` |
| home | `LiveTicker.tsx` | 당첨 소식 띠 | 없음 |
| home | `NetflixHome.tsx` | 홈 시안 B | 없음 |
| home | `ProofFeed.tsx` | 개봉 증빙 | 없음 |
| home | `QuickTabs.tsx` | 빠른 탭 | `CommerceHome.tsx`, `NetflixHome.tsx` |
| inventory | `CancelShipmentModal.tsx` | 옛 배송 취소 창 | 없음 |
| inventory | `DeliveryModal.tsx` | 옛 배송 신청 창 | `unboxing/UnboxingRoulette.tsx` |
| inventory | `HotBoxes.tsx` | 보관함의 인기 박스 | 없음 |
| inventory | `SellConfirmModal.tsx` | 옛 되팔기 확인 창 | 없음 |
| inventory | `ShippingTicker.tsx` | 배송 소식 띠 | 없음 |
| inventory | `TrackingModal.tsx` | 옛 배송 조회 창 | 없음 |
| layout | `CurrencySelector.tsx` | 통화 고르기(`select`) | `SiteHeader.tsx` |
| layout | `Footer.tsx` | 옛 꼬리말 | 없음 |
| layout | `LanguageSelector.tsx` | 언어 고르기(`select`). `gachaflix.locale` 을 적는 단 하나의 코드다 | `Footer.tsx`, `SiteHeader.tsx` |
| layout | `MobileBottomNav.tsx` | 옛 아래 탭 | 없음 |
| layout | `SiteHeader.tsx` | 옛 머리줄 | `community/CommunityBoard.tsx` |
| legal | `LegalNav.tsx` | 문서 위의 탭 | 없음 |
| legal | `PolicyNotice.tsx` | 정책 안내 링크 | 없음 |
| ui | `Approx.tsx` | 현지 통화 환산 배지 | 닿지 않는 파일 5개 |
| ui | `Money.tsx` | 옛 금액 표기 | 닿지 않는 파일 21개 |
| unboxing | `AutoplaySettingsModal.tsx` | 자동 열기 설정 창 | `box/DetailModal.tsx` |
| unboxing | `BulkOpenModal.tsx` | 대량 열기 창 | 없음 |
| unboxing | `MegaWinFX.tsx` | 큰 당첨 효과 | `BulkOpenModal.tsx`, `UnboxingRoulette.tsx` |
| unboxing | `UnboxingRoulette.tsx` | 옛 룰렛 개봉(767줄) | 없음 |
| unboxing | `UpgradeFX.tsx` | 승급 반전 효과 | `UnboxingRoulette.tsx` |
| unboxing | `VaultGateFX.tsx` | 금고 문 효과 | `UnboxingRoulette.tsx` |
| wallet | `DepositModal.tsx` | 옛 입출금 창(탭 셋) | 없음 |
| wallet | `HistoryTab.tsx` | 옛 내역 탭 | `DepositModal.tsx` |
| wallet | `UsdtDepositTab.tsx` | 옛 충전 탭 | `DepositModal.tsx` |
| wallet | `WithdrawSteps.tsx` | 옛 출금 단계 | `WithdrawTab.tsx` |
| wallet | `WithdrawTab.tsx` | 옛 출금 탭 | `DepositModal.tsx`, `WithdrawalModal.tsx` |
| wallet | `WithdrawalModal.tsx` | 옛 출금 창 | 없음 |

함께 닿지 않는 것(실행: 같은 스크립트): `lib` 의 19개(`aboutStats`, `audio`, `board`, `boardApi`, `catalog`, `communityModeration`, `dailyBox`, `data`, `engine`, `fingerprint`, `fraudScoring`, `homeCopy`, `i18n`, `localFiat`, `ranking`, `reel`, `rng`, `shippingHubs`, `useCanHover`)와 `stores/uiStore.ts`.
BRIEF 가 "직접 DOM 을 만지는 파일"로 든 것 가운데 `AvatarSettings.tsx`, `ReviewFormModal.tsx`, `VisualVerifier.tsx`, `lib/fingerprint.ts` 는 닿지 않는 파일이다. 닿는 것은 `app/layout.tsx`, `app/page.tsx`, `BoxScreen.tsx`, `flow/ReviewSheet.tsx`, `home/heroBall.ts`, `VerifyScreen.tsx` 이고, 여기에 `lib/useModal.ts`(`body` 의 overflow)와 `LocaleHtmlLang.tsx`(`html` 의 lang)가 더 있다(실행: 검색).
애니메이션 라이브러리: 닿는 컴포넌트 가운데 `framer-motion` 을 가져오는 것은 `MotionPreferences.tsx`(설정만) 하나다. 화면의 움직임은 전부 CSS 다. `canvas-confetti` 는 닿는 소스에서 쓰지 않는다(실행: 검색).

### 6.3 쓰이지 않는 CSS (실행: `css-usage.mjs`)

| 파일 | 클래스 수 | 닿는 소스가 쓰는 것 | 비고 |
|---|---|---|---|
| `ui.css` | 144 | 133 | 쓰이지 않는 11: `v-strip`, `v-strip-item`, `v-strip-photo`, `v-strip-name`, `v-strip-value`, `v-review`, `v-review-head`, `v-reveal-stage`, `v-lidbox`, `v-lidbox-base`, `v-lidbox-lid`(옛 사진 띠, 옛 후기 줄, 옛 뚜껑 상자). 스크립트는 `v-items--l`, `v-items--m`, `v-items--s` 도 쓰이지 않는다고 냈으나 이 셋은 이름을 이어 붙여 쓴다(`BoxScreen.tsx:222`) |
| `opening.css` | 56 | 55 | 쓰이지 않는 1: `v-op-choice`(받는 방법 고르기, 지금은 그 단계가 없다) |
| `take.css`, `hero.css`, `footer.css`, `scroll-fade.css` | 13, 33, 10, 1 | 전부 | 없음 |
| `design.css` | 116 | 0 | 전부 옛 화면용 |
| `gpt-skin.css`, `gpt-flow.css`, `nfx-skin.css`, `shop-skin.css` | 61, 44, 78, 51 | Tailwind 와 이름이 겹치는 것뿐(`bg-canvas`, `pointer-events-none` 등) | 범위가 `.gpt-home`, `.nfx-home`, `.shop-home` 안이라 지금 화면에는 걸리지 않는다(코드: 각 파일의 머리) |
| `globals.css` | 44 | `caption-luxury` 하나(루트 넘김 화면) | 나머지는 옛 화면용 |

쓰이지 않는 15개는 `ui.css` 의 11, `opening.css` 의 1, 그리고 키프레임만 남은 `v-breathe`, `v-lid`(옛 상자의 움직임, `ui.css:303-309`)와 `kit.tsx` 의 `v-btn--auto`(쓰는 곳이 없는 꼴)다.
반대로 소스가 쓰는데 CSS 규칙이 없는 클래스는 `v-rowitem` 하나다(실행).

### 6.4 쓰이지 않는 문구 (실행: `keys.mjs`)

새 묶음(`v`) 574개 가운데 닿는 소스가 글자 그대로 쓰는 것이 504개, 이름을 이어 붙이거나 값으로 넘겨 쓰는 것이 54개다(`nav.*` 둘, `cat.*` 16, `inv.tab.*` 셋, `wallet.type.*` 여덟, `wallet.status.*` 일곱, `withdraw.errAddress.*` 둘, `verify.chain.*` 열, `verify.method.*` 셋, `verify.partial`, `guide.get*` 둘). 남는 16개는 어디에서도 쓰지 않는다:
`common.go`, `box.desc`, `box.value`, `box.odds`, `reveal.skip`, `reveal.got`, `reveal.code`, `reveal.rowHint`, `reveal.receive`, `reveal.rowHintReceive`, `login.or`, `charge.address`, `inv.takeLine`, `inv.takeLabel`, `account.off`, `account.more`.
갤러리만 쓰는 키: `box.auto`, `reveal.takeTitle`, `reveal.takeDesc`.
화면에 나오지 않는 키(쓰는 코드는 있으나 닿지 않는다): `account.loggedOut`(CL-U-203), `guide.cashItems`, `guide.cashItemsValue`, `home.noRating`(홈에는 옛 박스가 없다), `charge.loginDesc`, `balanceSheet.login`, `reveal.itemDesc`, `reveal.shippedDesc`, `reveal.toInventory`, `reveal.boxes`, 그리고 `verify.chain` 아래의 none 이 아닌 것들.
옛 묶음 50개 가운데 닿는 소스가 쓰는 것은 다섯이다: `security`, `account`(processing, verifyCode, errors), `legalCenter`, `legalDocs`, `categories`(가지만 있고 나오지 않는다). 상품과 박스 이름은 `products` 묶음에서 온다(짐작: `lib/useProductText.ts` 를 끝까지 읽지 않았다).

코드에 박힌 글(문구 파일 밖):
- 꼬리말의 "You never know what's next.", "OPEN IT, OWN IT"(`AppFooter.tsx:67,72`)
- 저장 공간 경고의 한국어 한 문장(`LabBadge.tsx:35`)
- 루트 넘김 화면의 "VOILA.GG"(`app/page.tsx:15`)
- 로그인 공급자 이름 Google, Apple, Microsoft 와 언어 이름
- 메타 설명(`app/layout.tsx:18`, `app/[locale]/layout.tsx:23-27`)
- 갤러리의 절 제목(영어)

## 7. 화면에서 보고 놀란 것

| 무엇 | 내용 | 근거 |
|---|---|---|
| 충전 시트가 배포 사이트에서 주소를 내지 못한다 | 세 네트워크 가운데 눌러 본 둘이 "주소를 받지 못했습니다."와 "주소 다시 받기"였다. QR, 주소, 복사 단추, 입금 확인 줄을 볼 길이 없었다 | 화면(심은 계정). 코드: `lib/useUsdtDeposit.ts:26-39` 가 환경 값이나 서비스에서 주소를 받는데 배포에는 둘 다 없다. 실제로 가입한 계정에서도 같은지는 확인하지 못했다(짐작: 같다) |
| 루트 404 의 단추가 사이트 밖으로 나간다 | 라우트 문서 CL-R-021 | 화면, 실행 |
| 이용 방법의 "개봉 결과 검증" 링크가 옛 주소로 간다 | CL-U-140 | 코드, 화면 |
| 검증 화면의 박스 알약이 334개다 | 한 줄에 가로로 놓인다. 옛 박스 14개가 앞이다 | 화면(본문 단추 336개) |
| 결과가 하나일 때의 `Reveal` 가지가 통째로 죽어 있다 | CL-U-100 | 코드 |
| 로그아웃 알림이 그려지지 않는다 | CL-U-203 | 코드, 실행 |
| 심은 계정에도 가입 혜택(리자몽 박스 무료 2회)이 붙었다 | 박스 화면의 한 줄 "이 박스를 무료로 2번 열 수 있습니다."와 주 단추 "무료 언박싱" | 화면. 코드: `auth/AuthHost.tsx:29-35` 가 로그인할 때마다 지급을 시도하고 스토어가 한 번만 받는다 |
| 5개만 열어도 확인창이 뜬다 | 리자몽 박스(1회 $50)는 무료 2회를 빼도 $150 이라 50 USDT 기준에 걸린다 | 화면("$150 결제") |
| 지갑의 음수 금액 표기 | `$-50` 처럼 통화 기호 뒤에 빼기가 온다 | 화면. 코드: `WalletScreen.tsx:70` |
| 홈 배너의 제목이 화면 제목보다 먼저 나오는 `h2` 다 | 문서의 제목 순서가 h2, h1 이다 | 코드: `HeroBanner.tsx:139`, `BoxList.tsx:81-82`. 화면(절 제목 목록에 "리자몽 박스") |
| 단추의 글이 "언박싱"이다 | "로그인하고 언박싱", "5개 언박싱 $150", "한 번 더 언박싱 $250". 코드의 주석과 옛 문서는 "열기"라고 부른다 | 화면 |
| 표시 통화의 기본은 달러 기호다 | 카드의 가격이 `$500` 으로 나오고, 꼬리말의 단추로 `₩690,000` 이 된다. 문구와 코드의 이름은 USDT 다 | 화면 |

## 8. 수

| 무엇 | 수 |
|---|---|
| 번호를 붙인 요소(CL-U-001 ~ 215) | 215 |
| Layout 층(2장, 001 ~ 025) | 25 |
| Primitive 층(3장, 026 ~ 049) | 24 |
| Page 별 요소(4장, 050 ~ 165) | 116 |
| 숨은 화면(5장, 166 ~ 215) | 50 |
| 그 가운데 시트(로그인 전 꼴 둘 포함) | 23 |
| 그 가운데 확인창 | 8 |
| 그 가운데 시트 안의 블록(블록체인 기록, 방식 설명, 인증 앱 부품) | 3 |
| 그 가운데 화면 전체를 덮는 것 | 2 |
| 그 가운데 토스트, 접는 것, 한 줄, 그 밖(5.4) | 14 |
| 닿지 않는 요소(6.1) | 14, 닿는지 확인하지 못한 것 3 |
| 어느 라우트도 그리지 않는 컴포넌트 파일(6.2) | 71 |
| 닿는 컴포넌트 파일 | 45 |
| 쓰이지 않는 CSS 클래스와 키프레임(6.3) | 15 |
| 쓰이지 않는 새 문구 키(6.4) | 16, 갤러리만 쓰는 것 3 |
| 스크린샷 | 39 |

시트 23줄은 닿는 소스의 `Sheet` 사용 23곳과 하나씩 맞는다(갤러리의 표본 시트는 뺐다). 확인창 8줄은 `Confirm` 사용 8곳과 맞고, 그 가운데 받기 확인창 하나가 네 곳(받기 선택 시트, 개봉 장면, 여러 개 결과, 보관함)에 붙는다.

## 9. 확인하지 못한 것

- 개봉 연출의 움직임(상자, 봉인, 빛)과 홈 배너의 한 바퀴: 창을 움직임 줄이기로 열어 결과만 봤다. 단계와 시간은 코드와 CSS 로만 적었다. 애니메이션은 따로 조사해야 한다.
- hover, active, focus 의 실제 모양: CSS 규칙으로만 적었다. 화면에서 올려 보지 않았다.
- 받기를 끝까지 누른 뒤의 화면(받기 결과 시트, 개봉 장면의 받은 꼴, 보관함의 받은 것 탭): 확인창에서 취소했다.
- 배송 확인창, 후기 쓰기 시트, 탈퇴 확인창, 출금의 확인과 인증과 신청함 단계: 제출하지 않아 열지 않았다.
- 로그인 시트의 비밀번호, 인증, 다시 정하기, 완료 단계와 공급자 로그인: 심은 세션을 썼다.
- 세션 끝남 한 줄, 저장 공간 경고, 오류 화면, 자리 표시: 조건을 만들지 못했다.
- 개봉 장면 위에서 충전 시트를 열었을 때의 포커스와 겹침.
- 옛 박스의 USDT 결과와 터짐이 나온 개봉 장면, 20배 이상 결과의 로고와 테 빛: 그런 결과가 나오지 않았다.
- 대표 사진이 없는 박스 21개의 화면(박스 그림 `.v-boxhero` 가 뜨는지).
- 영어와 중국어의 숨은 화면: 라우트는 세 언어로 열었으나 시트는 한국어로만 눌렀다. 문구 키가 세 언어에 다 있는 것은 실행으로 확인했다.
- 768px 과 1024px 사이 폭의 배치: 390 과 1280 두 폭만 봤다.
- `.v-rowitem` 에 규칙이 없어 구분선이 없다는 것은 스크린샷(`account-mobile.png`)에서 눈으로 다시 보지 않았다.
