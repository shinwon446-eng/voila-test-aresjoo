# UI_INVENTORY: 화면 요소 최종 목록

기준 커밋 `63445c7`, 브랜치 `migration-audit`. 통합일 2026-10-12.
세 분석(Codex `CX-`, Claude `CL-`, Antigravity `AG-`)을 대조해 겹치는 것을 합쳤다. `web/` 아래는 고치지 않았다.
루트의 옛 `UI_INVENTORY.md`(개편 전)와 다른 파일이다. 지금 화면의 기준은 이 파일이다(BRIEF 1절).

## 0. 읽는 법

### 0.1 쓴 자료

| 자료 | 번호 | 성격 |
|---|---|---|
| `analysis/claude-a-ui.md` | CL-U-001 ~ CL-U-215 | 요소 하나하나를 적은 단 하나의 목록. 배포 사이트를 Chrome 으로 눌러 본 기록과 스크린샷 39장(390 폭 또는 1280 폭, 한국어) |
| `analysis/codex-a-routes-events-state.md` 1, 2, 6, 9절 | CX-U-001 ~ 017, CX-U-100 ~ 241, CX-U-400 ~ 737, CX-F-060 ~ 070 | import 그래프, 닿지 않는 파일 97개, 닿는 컴포넌트 45개의 JSX 나무, 직접 DOM 파일. 화면은 보지 않았다 |
| `analysis/agy-a-visual-source.md` | AG-TOK-001 ~ 104(89개), AG-FNT-001 ~ 007, AG-I-001 ~ 004, AG-U-001 ~ 005, 010 ~ 024, 030 ~ 036, AG-TX-001 ~ 010 | 토큰, 글꼴, 상태별 스타일, 겹침 화면 목록, 반응형 규칙, 줄바꿈 위험. 소스에서 읽은 것 |
| `analysis/agy-b-visual-browser.md`, `harness/agy/*.json` | AG-U-001 ~ 008, 010 ~ 013, AG-I-001 ~ 008, AG-S-001 ~ 010 | 배포 사이트 측정: 부품의 계산된 스타일, 겹침 화면 다섯, hover 와 focus 사진 30장 |

Antigravity 브라우저 보고서는 통합을 시작할 때 있었다(21:17). 주의: `agy-a` 와 `agy-b` 가 `AG-U-001` 과 `AG-I-001` 을 서로 다른 뜻으로 다시 썼다. 아래에서는 `AGa-`, `AGb-` 로 갈라 적는다(예: `AGa-U-010` 은 소스 보고서의 Sheet, `AGb-U-010` 은 브라우저 보고서의 박스 카드 제목 줄바꿈).

### 0.2 증거의 말과 상태

코드: 통합자가 기준 커밋의 파일을 직접 열거나 찾기로 줄을 확인함. 화면: 통합자가 스크린샷을 직접 열어 봄. 실행: 통합자가 직접 돌림. 전달: 분석이 적은 것을 다시 확인하지 않고 옮김. 짐작: 확인하지 못함.

표의 "상태" 칸:

| 값 | 뜻 |
|---|---|
| 확인됨 | 소스의 자리를 통합자가 확인했고, 적어도 한 분석이 배포 화면에서 봤다 |
| 확인됨(코드) | 통합자가 소스를 확인했다. 화면에서는 아무도 보지 못했다 |
| 전달 | 한 분석만 적었고 통합자가 그 자리를 다시 열지 않았다. 확정이 아니다 |
| 확인 불가 | 조건을 만들지 못해 아무도 띄우지 못했다 |
| 도달 불가 | 배포 사이트의 사용자 흐름으로 닿지 않는다 |

통합자가 직접 확인한 것:

| 무엇 | 방법 | 결과 |
|---|---|---|
| 닿는 파일과 닿지 않는 파일 | `node harness/consolidate/graph.mjs web dead`(새로 쓴 그래프, 타입 전용 import 는 뺌) | TS와 TSX 247, 닿음 150, 닿지 않음 97. `components` 는 116 가운데 닿음 45, 닿지 않음 71 |
| `Sheet`, `Confirm`, `TakeConfirm` 을 쓰는 자리 | 닿는 파일 150개에서 찾기 | `Sheet` 23곳(갤러리 1곳 빼고), `Confirm` 8곳(갤러리 4곳 빼고), `TakeConfirm` 을 붙인 곳 4(받기 시트 안, 개봉 장면, 개봉 결과, 보관함) |
| `role` 속성 | 같은 찾기 | `dialog` 는 `ui/Sheet.tsx:18`, `box/Opening.tsx:207`, `box/Reveal.tsx:167`. `alertdialog` 는 `ui/Sheet.tsx:38`. `switch` 는 `Opening.tsx:337`. `checkbox` 는 `flow/TakeSheet.tsx:167,178`. `tab`, `menu`, `listbox`, `tooltip` 은 0 |
| `select`, 만든 툴팁 | 같은 찾기 | `select` 0. `title` 속성은 `VerifySheet.tsx:63,76,77`, `VerifyScreen.tsx:109`, `ChainRecord.tsx:21`, QR 둘 |
| 겹침 화면의 공통 동작 | `lib/useModal.ts`, `components/ui/Sheet.tsx` 를 끝까지 읽음 | 5.1절 |
| 토큰 | `app/tokens.css` 를 끝까지 읽음 | 7절 |
| 부품의 CSS | `app/ui.css:5-16,21-41,44-52,59-70,73-78,81-91,94-102,109-131,140-147`, `opening.css`, `hero.css` 전부 | 7절 |
| AGY 측정 파일 | `node harness/consolidate/agy-sum2.mjs`, `agy-motion.mjs` | 7.3절, 8절 |
| 스크린샷 | `claude-a/account-mobile.png`, `claude-a/notfound-root-mobile.png`, `agy/routes/R-009-dev-gallery-ko-390-first.png`, `motion/agy/open-1-normal/frame-0300ms.png`, `motion/agy/open-5-normal/frame-0900ms.png` 다섯 장을 열어 봄 | 해당 줄에 적음 |

요소 표의 "소스" 칸의 줄 번호는 Claude 의 것이다. 통합자가 찾기로 줄을 맞춰 본 것은 `Sheet`, `Confirm`, `details`, `ScreenHead`, `role` 이 있는 줄 전부(위의 찾기)와 `BoxScreen.tsx:54-172,314-322`, `Opening.tsx:36-225`, `Reveal.tsx:35-100,164-250`, `HeroBanner.tsx:22-189` 다. 그 밖의 줄 번호는 전달이다.

"문구 키" 칸은 대표 키만 적는다. 요소마다의 전체 키는 `analysis/claude-a-ui.md` 의 해당 `CL-U` 줄에 있다(키를 요소별로 적은 분석은 Claude 뿐이다). 따로 적지 않으면 `messages/v.{ko,en,zh}.json` 의 키다. 세 언어의 키 574개가 서로 빠짐없다는 것은 전달이다(Claude 의 `keys.mjs`).

스크린샷은 파일 이름만 적으면 `screenshots/before/claude-a/` 아래다. AGY 의 것은 `screenshots/before/agy/` 부터 적는다.

## 1. Layout 층

| id | 층 | 무엇 | 소스(`web/`) | 실제 상태 | 문구 키 | CX | CL | AG | 일치와 상태 |
|---|---|---|---|---|---|---|---|---|---|
| U-001 | Layout | 루트 문서 `html`, `body` | `app/layout.tsx:43-54` | `lang="ko"` 고정, 글꼴 변수 `--font-ui`. `body` 에 Tailwind 클래스 `min-h-screen bg-canvas font-sans text-white antialiased` | 없음 | CX-R-021 | CL-U-001 | AG-FNT-001 ~ 007 | 일치. 확인됨(코드: `:45,50`) |
| U-002 | Layout | 저장소 분리 스크립트 | `app/layout.tsx:48`, `lib/labSite.ts:19` | 그리는 것 없음 | 없음 | CX-R-021, CX-F-060 | CL-U-002 | 없음 | 일치. 확인됨(코드) |
| U-003 | Layout | 스토어 불러오기 `CurrencyHydrator` | `components/layout/CurrencyHydrator.tsx:14` | 그리는 것 없음 | 없음 | CX-U-221 | CL-U-003 | 없음 | 일치. 전달 |
| U-004 | Layout | 언어 레이아웃: 문구 공급, `MotionPreferences`(움직임 없는 래퍼) | `app/[locale]/layout.tsx:67-80`, `components/layout/MotionPreferences.tsx:5` | 감싸는 `div` 하나 | 없음 | CX-R-019, CX-U-224 | CL-U-004 | 없음 | 일치. 확인됨(코드). `motion/ANIMATION_INVENTORY.md` 1절 |
| U-005 | Layout | `html lang` 맞춤 `LocaleHtmlLang` | `components/layout/LocaleHtmlLang.tsx:7` | 그리는 것 없음. 뜬 뒤 `ko`, `en`, `zh-Hans` | 없음 | CX-R-021, CX-U-223 | CL-U-005 | 없음 | 일치. 확인됨(실행: 정적 HTML 은 `ko`) |
| U-006 | Layout | 테스트 사이트 색 선 | `components/layout/LabBadge.tsx:31` | 맨 위 3px, z 300, 누를 수 없음 | 없음 | CX-U-222 | CL-U-006 | AG-TOK-038, AG-TOK-090 | 일치. 확인됨(화면: 통합자가 연 다섯 장 가운데 넷의 맨 위에 선이 있다. 루트 404 에는 없다) |
| U-007 | Layout | 앱 껍데기 `.v-app` 과 본문 `main.v-main` | `components/shell/AppShell.tsx:44,59`, `app/ui.css:21-24` | 본문 폭 둘: `v-main--col`(560), `v-main--wide`(1120. 홈, 박스, 후기) | 없음 | CX-U-228 | CL-U-007, CL-U-014 | AG-TOK-062 ~ 064 | 일치. 확인됨(코드) |
| U-008 | Section | 머리줄 `.v-header` | `AppShell.tsx:45-56`, `ui.css:31-41` | sticky, z 30. 높이 56, 768px 이상 64(아래 선 1px 을 더해 57, 65 로 측정됨) | `nav.menu`(aria) | CX-U-228 | CL-U-008 | AG-TOK-066, AG-TOK-086, 측정 `header` | 일치. 확인됨 |
| U-009 | Component | 로고 링크 `BrandLogo` | `AppShell.tsx:47`, `components/layout/BrandLogo.tsx:31` | 링크(`/`) | 없음(`aria-label="VOILA"` 는 코드에 박힘) | CX-U-220 | CL-U-009 | AG-FNT-007 | 일치. 확인됨(전달, 화면은 스크린샷에 보임) |
| U-010 | Block | 머리줄 메뉴 `.v-nav` 링크 7 | `AppShell.tsx:23-31,48-50`, `ui.css:34-36,41` | 900px 이상에서만. 기본, hover, 지금 화면(`aria-current`) | `nav.boxes`, `inventory`, `wallet`, `wins`, `verify`, `guide`, `account` | CX-U-228 | CL-U-010 | AG-S-008, AG-TX-001, AG-TOK-076 | 일치. 확인됨 |
| U-011 | Component | 잔액 단추 `.v-headbtn` | `AppShell.tsx:52` | 로그인한 사람에게만. hover. 누르면 U-113 | `nav.balance` | CX-U-228 | CL-U-011 | AG-S-007, 측정 `headbtn` | 일치. 확인됨(화면: `account-mobile.png` 에 "잔액 $10,000") |
| U-012 | Component | 로그인 단추 | `AppShell.tsx:53` | 로그인 전에만. 누르면 U-112 | `nav.login` | CX-U-228 | CL-U-012 | AGb-I-002 | 일치. 확인됨 |
| U-013 | Component | 메뉴 단추 `.v-menu-btn` | `AppShell.tsx:54`, `ui.css:41` | 900px 미만에서만. `aria-expanded` | `nav.menu`(aria) | CX-U-228 | CL-U-013 | AGb-I-001 | 일치. 확인됨 |
| U-014 | Section | 꼬리말 `.v-footer` | `components/shell/AppFooter.tsx:30-75`, `app/footer.css` | 720px 이상에서 2열과 4열. 루트 404 에는 없다 | 아래 줄들 | CX-U-227 | CL-U-015 | 측정 `footer` | 일치. 확인됨 |
| U-015 | Component | "고객 관계 요약" 링크 | `AppFooter.tsx:32` | 링크(`/guide`) | `footer.crs` | CX-U-227 | CL-U-016 | 없음 | 전달 |
| U-016 | Component | 팔로우 줄(아이콘 넷) | `AppFooter.tsx:33-38`, `lib/social.ts:7` | 주소가 비어 넷 다 누를 수 없는 그림이다 | `footer.follow` | CX-U-227 | CL-U-017 | 없음 | 전달 |
| U-017 | Block | 꼬리말 링크 묶음 셋(상품 5, 도움 2, 약관 1) | `AppFooter.tsx:42-58` | hover 밑줄 | `footer.colProduct`, `colHelp`, `colTerms`, `nav.*`, `reviews.title`, `wins.title`, `nav.legal` | CX-U-227 | CL-U-018, 019, 020 | `agy-a` 5.2절 15번 | 일치. 전달 |
| U-018 | Component | 언어 링크 둘 | `AppFooter.tsx:61` | 같은 화면의 다른 언어 주소 | `footer.colSettings` | CX-U-227 | CL-U-021 | AGb-I-008 | 일치(AGY 는 "겹침 화면이 아님"으로 적음). 전달 |
| U-019 | Component | 표시 통화 단추 | `AppFooter.tsx:62` | 글이 둘로 바뀜 | `nav.showKrw`, `nav.showUsd` | CX-S-040 | CL-U-022 | AGb-I-008 | 일치. 전달 |
| U-020 | Block | 소개 글 4줄, 구호, 큰 로고 | `AppFooter.tsx:65-74` | 영어 두 문장이 코드에 박혀 있다 | `footer.about1`, `about2`, `rights` | CX-U-227 | CL-U-023, 024, 025 | 없음 | 전달 |

## 2. Primitive 층

| id | 무엇 | 소스 | 쓰는 곳 | 실제 상태 | CX | CL | AG | 일치와 상태 |
|---|---|---|---|---|---|---|---|---|
| U-021 | `Button`(주 단추) | `components/ui/kit.tsx:14`, `ui.css:59-66` | 거의 모든 화면과 시트 | 기본, hover, active(0.985), disabled, busy(`data-busy`, 글이 바뀜), quiet. auto 꼴은 쓰는 곳이 없다 | CX-U-232 | CL-U-026 | AG-S-001, AG-S-002, AG-TOK-060, 측정 `primary-button` | 일치. 확인됨. 7.3절 |
| U-022 | `ButtonLink` | `kit.tsx:23` | 옮긴 화면, 없는 주소, 빈 상태, 출금 신청함, 여러 개 결과 | 기본, hover, active | CX-U-232 | CL-U-027 | 없음 | 전달 |
| U-023 | `TextLink`(14px 밑줄) | `kit.tsx:28`, `ui.css:68-70` | 거의 모든 화면 | 바깥 링크, 안쪽 링크, 단추의 세 꼴. hover. 누르는 자리 44px 이상 | CX-U-232 | CL-U-028 | AG-S-003, 측정 `link` | 일치. 확인됨 |
| U-024 | `Chips` 와 `.v-chip`(탭 구실) | `kit.tsx:35`, `ui.css:73-78` | 아홉 곳: 홈 분류, 수량, 보관함 탭, 후기 박스, 검증 박스, 충전 네트워크, 출금 네트워크, 배송 나라, 후기 별점 | 기본, hover, 선택(`aria-pressed`, 2px 테두리), disabled, 가로로 넘기는 꼴. `role="group"` 이고 탭 역할은 쓰지 않는다 | CX-U-232 | CL-U-029, CL-U-206 | AGa-U-032, AG-S-004, AG-TOK-045, 측정 `chip` | 일치. 확인됨. 7.3절(측정은 선택된 알약) |
| U-025 | `ScreenHead`(제목, 설명, 뒤로 가기) | `kit.tsx:46`, `ui.css:50-52` | 모든 화면의 머리 | 뒤로 가기는 링크 또는 단추, hover | CX-U-232 | CL-U-030 | `agy-a` 5.2절 7번 | 일치. 확인됨(코드) |
| U-026 | `Rows`, `Row` | `kit.tsx:60-65`, `ui.css:84-91` | 사실 행, 확률, 시트의 정보 카드 | 행 사이 선은 `.v-row + .v-row` | CX-U-232 | CL-U-031 | AG-TX-004 | 일치. 확인됨(코드) |
| U-027 | 링크 행 `.v-row--link`, `.v-row--button`, 감싸는 `.v-rowitem` | `ui.css:90-91`, `AccountScreen.tsx:50-69`, `LegalCenterScreen.tsx:22`, `AppShell.tsx:62` | 계정, 약관 목록, 메뉴 시트, 여러 개 결과 | hover. `.v-rowitem` 에는 CSS 규칙이 없어 계정과 약관 목록의 행 사이에 선이 없다 | CX-U-232 | CL-U-032 | `agy-a` 5.2절 11번 | 확인됨. 실행: `app/*.css` 에 `v-rowitem` 0건. 화면: `account-mobile.png` 의 카드 안에 선이 없다(통합자가 열어 봄. Claude 가 다시 보지 못했다던 것) |
| U-028 | `Card` | `kit.tsx:67`, `ui.css:81-83` | 이용 방법, 충전 시트, 주소 카드 | 테두리 꼴은 갤러리만 | CX-U-232 | CL-U-033 | AG-TOK-002, 측정 `card`(찾지 못함) | 전달. AGY 의 측정에는 없다(7.3절) |
| U-029 | `Field` 와 `.v-input` | `kit.tsx:71`, `ui.css:94-102` | 로그인, 배송, 검증, 출금, 계정 시트, 인증 앱 | 기본, focus(테두리 색, 포커스 테 없음), placeholder, disabled, 자동 채움, 여러 줄, 파일 | CX-U-232 | CL-U-034 | AG-S-006, AGa-I-004, AG-TOK-051, 측정 `input` | 일치. 확인됨 |
| U-030 | `Line`(상태 한 줄, 실패 한 줄) | `kit.tsx:76`, `ui.css:109-110` | 화면과 시트의 안내와 실패(Claude 가 센 실패 자리 16묶음) | 보통(`role="status"`), 실패(`role="alert"`, 빨강) | CX-U-232 | CL-U-035, CL-U-210 | AGa-U-035, `agy-a` 5.2절 16번, AG-TOK-017 | 일치. 확인됨(화면은 전달: 로그인, 출금 입력, 검증, 충전 주소 실패) |
| U-031 | `Empty`(빈 목록 글) | `kit.tsx:80`, `ui.css:112` | 열 곳 | 없음 | CX-U-232 | CL-U-036, CL-U-209 | AGa-U-034 | 일치. 전달 |
| U-032 | `Skeleton`(자리 표시) | `kit.tsx:85`, `ui.css:113-115` | 여덟 곳: 보관함 240, 지갑 200, 출금 200 둘, 나온 상품 120, 계정 240, 검증 120, 받기 시트 144 | 1.4초 깜빡임(A-001) | CX-U-232 | CL-U-037, CL-U-208 | AGa-U-033 | 일치. 확인됨(코드). 화면 확인 불가 |
| U-033 | `Sheet` | `components/ui/Sheet.tsx:12` | 23곳 | 5.1절 | CX-U-234, CX-I-032 | CL-U-038 | AGa-U-010, AGa-U-001 ~ 005, AG-S-010, 측정 `sheet` | 일치. 확인됨 |
| U-034 | `Confirm` | `Sheet.tsx:32` | 8곳 | 5.1절 | CX-U-234 | CL-U-039 | AGa-U-011 | 일치. 확인됨 |
| U-035 | `ToastHost` 와 토스트 | `components/ui/toast.tsx:17-25`, `ui.css:140-142` | `AppShell` 마다. 부르는 곳: 충전 주소 복사, 인증 앱 키 복사 | 자리는 늘 있고(`aria-live="polite"`) 토스트는 2.4초만. z 300 | CX-U-235, CX-F-114 | CL-U-040, CL-U-202 | AGa-U-030 | 일치. 확인됨(코드). 화면 확인 불가 |
| U-036 | `ScrollRow`(옆으로 넘기는 줄) | `components/ui/ScrollRow.tsx:11`, `ui.css:171-178`, `app/scroll-fade.css` | 박스 화면의 후기 줄 | 좌우 단추(더 넘길 쪽만, 마우스 화면에서만), 끝 흐림(`data-prev`, `data-next`) | CX-U-233 | CL-U-041, CL-U-207 | `agy-a` 5.2절 10번, AG-TOK-082 | 일치. 확인됨 |
| U-037 | `BrandLogo`, `BrandLogoShapes` | `BrandLogo.tsx:10,31` | 머리줄, 꼬리말, 개봉 장면(20배 이상) | 크기 셋, 링크 꼴과 그림 꼴 | CX-U-220 | CL-U-042 | AG-FNT-007 | 전달 |
| U-038 | `ProviderMark` | `components/flow/ProviderMark.tsx:6` | 로그인 시트 | 없음 | CX-U-212 | CL-U-043 | 없음 | 전달 |
| U-039 | `OpeningBox`(입체 상자) | `components/box/Opening.tsx:49`, `app/opening.css:72-100` | 개봉 장면, 여러 개 열기, 홈 배너 | 조상의 `data-phase` 로 바뀜 | CX-U-203 | CL-U-044 | AG-TOK-018 ~ 022, 096, 097 | 일치. 확인됨(화면: `motion/agy/open-1-normal/frame-0300ms.png`) |
| U-040 | 별점 부품 셋 `RatingInline`, `Stars`, `RatingBlock` | `components/box/BoxReviews.tsx:32,44,54` | 박스 제목 아래, 홈 카드, 후기 카드, 평균 블록 | 후기가 없으면 그리지 않는다 | CX-U-201 | CL-U-045, 046, 047 | AG-TOK-047 | 전달 |
| U-041 | 상품 행 `.v-itemrow` | `ui.css:265-273,365-373` | 홈 검색, 구성품, 확률표, 보관함, 지갑, 나온 상품, 검증, 받기 시트 | hover(이름에 밑줄) | 없음 | CL-U-048 | AG-S-009, AG-TX-005, 측정 `item-row` | 어긋남 → 8절 D-U2. 확인됨 |
| U-042 | 접는 글 `details.v-notes` | `ui.css:333-337`, `BoxScreen.tsx:259,273` | 박스 화면 두 곳 | 닫힘, 열림. 늘 DOM 에 있다. 움직임 없음 | CX-U-202 | CL-U-049, CL-U-204 | AGa-U-031, AGb-I-007 | 일치. 확인됨 |

## 3. Page 별 요소

### 3.1 홈 (R-002, `components/box/BoxList.tsx`)

| id | 층 | 무엇 | 소스 | 실제 상태 | 문구 키 | CX | CL | AG | 일치와 상태 |
|---|---|---|---|---|---|---|---|---|---|
| U-043 | Section | 가입 혜택 배너 `.v-hero`(글, 장면, 단추) | `components/home/HeroBanner.tsx:136-187`, `components/home/heroBall.ts`, `app/hero.css` | 단계 다섯(`data-phase`). 글은 셋(로그인 전, 무료 횟수 있음, 없음). 단추는 로그인 전에는 가입 시트를 여는 단추, 뒤에는 박스로 가는 링크. 공은 캔버스 다섯(390 폭에서는 넷), 못 그리면 유리구슬. 카드 면은 사진 또는 그린 카드 | `hero.desc`, `descFree`, `descIn`, `cta`, `ctaFree`, `ctaIn` | CX-U-217, CX-U-218, CX-F-067, CX-U-017 | CL-U-050 ~ 053 | AG-TOK-023 ~ 029, 080 ~ 084, 098, 099 | 일치. 확인됨. 실행: 배포 HTML 에 사진 카드 3, 캔버스 5. 움직임은 `ANIMATION_INVENTORY` A-031 ~ A-044 |
| U-044 | Block | 화면 머리와 찾기 칸 `.v-search` | `BoxList.tsx:82,85` | 글이 있으면 검색 화면으로 바뀜 | `home.title`, `desc`, `search`, `searchHint` | CX-U-200 | CL-U-054, 055 | 측정 `input` | 일치. 확인됨(전달) |
| U-045 | Block | 검색 결과 행(최대 30)과 빈 상태 | `BoxList.tsx:87-98` | 행은 박스로 가는 링크 | `home.searchIn`, `refPrice`, `searchNone` | CX-U-200 | CL-U-056, 057 | 없음 | 전달(`home-search-desktop.png`) |
| U-046 | Component | 분류 알약 17 | `BoxList.tsx:102` | 선택 하나, 가로로 넘김 | `home.filter`, `home.all`, `cat.*` 16 | CX-U-200 | CL-U-058 | AG-S-004 | 일치. 전달 |
| U-047 | Block | 박스 격자 `.v-boxgrid` 와 카드 `BoxCard` | `BoxList.tsx:103-105,116-131`, `ui.css:145-147,206-210` | 2열, 1024px 이상 3열, 24장씩. 카드 hover. 별점 줄은 후기가 있을 때만(지금 홈에는 0) | `home.noRating` | CX-U-200 | CL-U-059, 060 | AG-S-005, AGb-U-010, AG-TX-002, 측정 `box-card` | 일치. 확인됨. 후기 샘플이 합쳐지면 별점 줄이 달라진다(의도된 차이) |
| U-048 | Component | "박스 더 보기" | `BoxList.tsx:106` | 남은 것이 있을 때만 | `home.more` | CX-U-200 | CL-U-061 | 없음 | 전달 |

### 3.2 박스 화면 (R-003, `components/box/BoxScreen.tsx`)

| id | 층 | 무엇 | 소스 | 실제 상태 | 문구 키 | CX | CL | AG | 일치와 상태 |
|---|---|---|---|---|---|---|---|---|---|
| U-049 | Layout | 박스 배치 `.v-boxlayout` 과 화면 머리 | `BoxScreen.tsx:173,175`, `ui.css:319-347` | 1024px 미만은 한 열, 이상은 2열과 붙어 다니는 옆 카드 | `common.back`, `box.lead` | CX-U-202 | CL-U-062, 063 | AG-TOK-077 | 일치. 확인됨 |
| U-050 | Component | 별점 링크 단추 | `BoxScreen.tsx:176` | 후기가 있을 때만. 누르면 `#reviews` 로 | `box.ratingLine`, `ratingAria` | CX-F-063 | CL-U-064 | 없음 | 일치. 확인됨(코드) |
| U-051 | Component | 대표 상품 단추 `.v-mainitem`, 박스 그림 `.v-boxhero` | `BoxScreen.tsx:180-186` | 단추는 `#box-contents` 로. 박스 그림은 대표 사진이 없을 때만 | 없음 | CX-F-063 | CL-U-065, 066 | 없음 | 단추는 확인됨. 박스 그림은 확인 불가(5.4절 U-152) |
| U-052 | Section | 후기 영역 `#reviews` 와 후기 카드 | `BoxReviews.tsx:119-143,175-197` | 후기 있음(평균, 분포, 넘기는 줄), 없음(빈 글). 카드는 통째로 단추, 석 줄에서 잘림 | `box.reviews`, `noReviews`, `ratingBasis`, `reviews.more` | CX-U-201 | CL-U-067, 068 | AG-TX-009 | 일치. 확인됨(전달). `BoxScreen.tsx:106` 의 주석은 "실제 기록에 묶인 것만"인데 구현은 샘플 후기를 더한다(Codex 0절, Claude 도 샘플 28개를 봄). BRIEF 2절의 의도된 차이 자리 |
| U-053 | Block | 옆 카드의 사실 행 | `BoxScreen.tsx:191-195` | 2행, 옛 박스는 터짐 게이지까지 3행 | `box.price`, `topTimes`, `burst` | CX-U-202 | CL-U-069 | AGb-U-011 | 일치. 전달 |
| U-054 | Block | 열기 막대 `.v-openbar` 와 한 줄 다섯 | `BoxScreen.tsx:196-212`, `ui.css:283-284,345` | 1024px 미만은 화면 아래 고정(z 20). 한 줄: 실패, 못 본 결과, 다른 박스의 못 본 결과, 무료 횟수, 잔액 부족 | `box.openFail`, `op.recoverLine`, `recoverElsewhere`, `box.freeLeft`, `short` | CX-U-202 | CL-U-070, 071 | AG-TOK-085 | 일치. 화면은 무료 횟수 한 줄만(전달) |
| U-055 | Component | 수량 알약 다섯(1, 5, 10, 50, 100) | `BoxScreen.tsx:203` | 선택 하나. 처리 중 disabled | `box.qty`, `qtyN` | CX-U-202 | CL-U-072 | 없음 | 전달 |
| U-056 | Component | 주 단추(일곱 꼴) | `BoxScreen.tsx:204-210` | 불러오는 중, 로그인 전, 결과 보기, 받기가 주 단추, 충전이 주 단추, 충전만, 열기(busy) | `box.loginToOpen`, `op.recoverCta`, `take.title`, `box.charge`, `box.open`, `openFree`, `opening` | CX-U-202 | CL-U-073 | AG-TX-008, AG-S-001 | 일치. 화면은 셋만(로그인 전, 열기, 무료 열기. 전달) |
| U-057 | Section | 구성품 `#box-contents`: 구간 넷, 상품 타일, 사진 없는 상품 행 | `BoxScreen.tsx:215-241,325-335`, `ui.css:218-233` | 타일과 행은 단추(누르면 U-114). 빈 구간은 빠짐 | `box.contents`, `tierRoyal`, `tierPrestige`, `tierExecutive`, `tierCurated` | CX-U-202 | CL-U-074, 075, 076 | AG-TX-003, AGb-U-012 | 일치. 전달 |
| U-058 | Section | 확률 요약 `#box-odds` | `BoxScreen.tsx:244-258` | 새 박스 7행, 옛 박스 6행 | `box.oddsSummary`, `top`, `low`, `belowOdds`, `ev` 등 | CX-U-202 | CL-U-077 | 없음 | 전달 |
| U-059 | Component | 접힌 상품별 확률표, 접힌 "알아둘 것" | `BoxScreen.tsx:259-278` | 닫힘이 기본. 확률표의 행은 단추 | `box.oddsTable`, `notes`, `evNote`, `verifyLink` | CX-U-202 | CL-U-078, 079 | AGb-I-007 | 일치. 확인됨(코드: `:259,273`) |

### 3.3 개봉 장면, 한 개 (`components/box/Opening.tsx`)

| id | 층 | 무엇 | 소스 | 실제 상태 | 문구 키 | CX | CL | AG | 일치와 상태 |
|---|---|---|---|---|---|---|---|---|---|
| U-060 | Page | 개봉 장면 `.v-op`(화면 전체, z 150, `role="dialog"`) | `Opening.tsx:207-209`, `opening.css:8`, 붙는 곳 `BoxScreen.tsx:319` | `data-phase` 다섯, `data-tone` 다섯, `data-kind` 둘, `data-short`, `data-opening-state` 셋 | `reveal.results`(aria) | CX-U-203, CX-I-009 | CL-U-080, CL-U-200 | AGa-U-012 | 일치. 확인됨. 닫는 법은 5.2절 |
| U-061 | Block | 위쪽 줄: 잔액 알약, 설정 단추, 닫기 단추 | `Opening.tsx:210-216` | 잔액은 결과가 드러나면 지금 값으로. 닫기는 ready 뒤에만, 다음 구매 중 disabled | `op.balance`, `op.settings`, `common.close` | CX-U-203 | CL-U-081 | 없음 | 확인됨(화면: `motion/agy/open-1-normal/frame-0300ms.png` 에 잔액 알약과 설정 단추만 있다) |
| U-062 | Block | 장면: 바닥 빛, 상자 | `Opening.tsx:218-220` | 상자는 결과 전까지만 | 없음 | CX-U-203 | CL-U-082 | 없음 | 확인됨 |
| U-063 | Block | 결과 묶음 세 꼴: USDT 결과, USDT 로 받은 상품, 보관한 상품 | `Opening.tsx:225-253` | 보관한 상품은 사진 있음과 없음. 20배 이상이면 로고. 상태 줄 셋 | `op.cashLabel`, `burstLabel`, `take.doneTitle`, `reveal.value`, `op.keptStatus`, `op.odds` | CX-U-203 | CL-U-083, 084, 085 | AG-TOK-046, AG-TX-006 | 보관한 상품(사진 없는 꼴)만 화면에서 봄(전달, `opening-one-mobile.png`). USDT 결과와 받은 꼴은 확인 불가 |
| U-064 | Component | 쓴 금액과 잔액 변화 두 줄 `.v-op-net`, 터짐 게이지 한 줄 | `Opening.tsx:183-188,255`, `opening.css:144` | 방향 셋. 게이지는 옛 박스에서만, 높이 700px 이하에서는 숨음 | `op.paid`, `free`, `balDown`, `balUp`, `balSame`, `gaugeNow`, `gaugeReset` | CX-U-203 | CL-U-086, 087 | AG-TOK-073 | 확인됨(코드) |
| U-065 | Block | "결과 바로 보기" 링크, 상태 줄 묶음 | `Opening.tsx:261,264-272` | 링크는 결과 전에만. 상태 줄: 다시 보는 결과, 반영 대기, 실패, 확인 못함, 잔액 부족 | `op.skip`, `recovered`, `pending`, `failed`, `take.unknown`, `box.short` | CX-U-203 | CL-U-088, 089 | 없음 | 링크는 확인됨(화면: 같은 프레임). 상태 줄은 전달 |
| U-066 | Block | 아래 행동 묶음(여섯 꼴) | `Opening.tsx:273-316`, `opening.css:106-107` | 결과 뒤 350ms 는 눌리지 않는다 | `reveal.again`, `againFree`, `nav.verify`, `op.backToBox`, `reveal.take`, `take.keep`, `box.charge` | CX-U-203 | CL-U-090 | AG-TX-010 | 확인됨(코드: `:273`). 여섯 꼴 가운데 화면에서 본 것은 하나(전달) |

### 3.4 개봉 결과, 여러 개 (`components/box/Reveal.tsx`)

| id | 층 | 무엇 | 소스 | 실제 상태 | 문구 키 | CX | CL | AG | 일치와 상태 |
|---|---|---|---|---|---|---|---|---|---|
| U-067 | Page | 개봉 결과 `.v-reveal`(화면 전체, z 150, `role="dialog"`) | `Reveal.tsx:167`, 붙는 곳 `BoxScreen.tsx:320` | 연출 중, 결과 | `reveal.results`(aria) | CX-U-204, CX-I-012 | CL-U-091, CL-U-201 | AGa-U-013 | 일치. 확인됨 |
| U-068 | Block | 연출 자리(상자, 개수 한 줄, 건너뛰기) | `Reveal.tsx:169-176` | 단계 셋 | `op.multiOpening`, `op.skip` | CX-U-204 | CL-U-092 | 없음 | 확인됨(코드). 화면은 AGY 의 프레임(통합자는 900ms 프레임만 열어 봄) |
| U-069 | Component | 닫기 단추, 잔액 알약 | `Reveal.tsx:179-180` | 닫기는 350ms 뒤부터. 다음 구매 중 disabled | `common.close`, `op.balance` | CX-U-204 | CL-U-093, 094 | 없음 | 확인됨(화면: `motion/agy/open-5-normal/frame-0900ms.png` 에 닫기와 "잔액 $9,750") |
| U-070 | Block | 머리, 가장 큰 결과 `.v-best`, 영수증 행 | `Reveal.tsx:217-240` | 가장 큰 결과는 2배 이상일 때만. 영수증: 쓴 금액, 잔액에 반영, 보관 상품, 잔액 변화 | `reveal.multiTitle`, `multiDesc`, `op.best`, `reveal.spent`, `op.creditedSum`, `keptSum`, `changeLabel` | CX-U-204 | CL-U-095, 096, 097 | 없음 | 확인됨(화면: 같은 프레임에 "5개를 열었습니다", 영수증 4행). 가장 큰 결과는 확인 불가 |
| U-071 | Block | 결과 목록 | `Reveal.tsx:241-260` | 꼬리표 다섯. 같은 금액의 USDT 결과는 한 줄로 묶이고 누를 수 없다. 나머지는 단추 | `op.tagCash`, `tagKept`, `reveal.shippedTag`, `takenTag`, `take.unconfirmed` | CX-U-204 | CL-U-098 | 없음 | 확인됨(화면: 같은 프레임에 "보관 중" 꼬리표의 행) |
| U-072 | Block | 아래 행동 묶음 | `Reveal.tsx:262-277` | 받을 상품이 남음, 다 받음의 두 꼴 | `take.submit`, `take.keep`, `reveal.again`, `box.charge`, `op.backToBox` | CX-U-204 | CL-U-099 | AG-TX-010 | 확인됨(화면: "USDT로 받기 (5개, $60.28)", "보관함에 두기", "한 번 더 언박싱 $250") |

### 3.5 보관함, 지갑, 출금, 나온 상품

| id | 층 | 무엇 | 소스 | 실제 상태 | 문구 키 | CX | CL | AG | 일치와 상태 |
|---|---|---|---|---|---|---|---|---|---|
| U-073 | Block | 보관함: 화면 머리, 자리 표시(240), 로그인 전 한 줄과 단추 | `components/inventory/InventoryScreen.tsx:112-114` | 셋 가운데 하나 | `inv.title`, `desc`, `loginLine`, `nav.login` | CX-U-219, CX-R-022 | CL-U-101, 102, 103 | 없음 | 일치. 전달 |
| U-074 | Component | 상태 알약 셋(개수 포함), "USDT로 받기" 단추 | `InventoryScreen.tsx:117,119` | 단추는 보관 중 탭이고 받을 것이 있을 때만 | `inv.tab.held`, `shipping`, `done`, `take.title` | CX-U-219 | CL-U-104, 105 | 없음 | 전달(`inventory-held-mobile.png`) |
| U-075 | Component | 빈 상태 셋과 "박스 보러 가기" | `InventoryScreen.tsx:121` | 탭마다 글이 다름 | `inv.empty.*`, `inv.toBoxes` | CX-U-219 | CL-U-106 | 없음 | 전달. 보관 중 탭의 빈 글은 확인 불가 |
| U-076 | Component | 상품 행(30개씩), "더 보기" | `InventoryScreen.tsx:123-138` | 행의 둘째 줄과 금액이 상태 넷에 따라 다름 | `inv.refLine`, `stHeld`, `stRequested`, `stShipping`, `stDelivered`, `stTaken`, `inv.more` | CX-U-219 | CL-U-107, 108 | AG-TX-005 | 전달 |
| U-077 | Block | 지갑: 화면 머리, 자리 표시(200), 로그인 전 | `components/wallet/WalletScreen.tsx:92-94` | 셋 가운데 하나 | `wallet.title`, `desc`, `loginLine` | CX-U-240 | CL-U-109, 110 | 없음 | 전달 |
| U-078 | Block | 잔액 행, 충전 단추, 출금 링크 | `WalletScreen.tsx:98-103` | 카드 잔액 행은 0 보다 클 때만 | `wallet.balance`, `cardBalance`, `box.charge`, `wallet.withdraw` | CX-U-240 | CL-U-111 | 없음 | 전달(`wallet-pending-mobile.png`) |
| U-079 | Section | 내역 | `WalletScreen.tsx:105-120` | 빈 상태, 행(단추) 30개씩, 더 보기. 음수는 `$-50` 꼴 | `wallet.history`, `empty`, `wallet.type.*` 8, `wallet.status.*` | CX-U-240, CX-F-008 | CL-U-112 | 없음 | 전달 |
| U-080 | Page | 출금: 불러오는 중, 로그인 전, 보안 상태를 읽는 중 또는 실패 | `components/wallet/WithdrawScreen.tsx:169-176` | 셋 | `withdraw.title`, `securityFail`, `state.retry` | CX-U-241 | CL-U-113, 114, 115 | 없음 | 로그인 전은 전달(화면). 보안 실패는 확인 불가 |
| U-081 | Page | 출금: 인증 앱 연결 관문 | `WithdrawScreen.tsx:179-189` | 단추(U-133), 링크(이메일 인증 경로) | `withdraw.gateTitle`, `gateDesc`, `gateCta`, `emailPath` | CX-U-241 | CL-U-116 | 없음 | 전달(`withdraw-funded-mobile.png`) |
| U-082 | Page | 출금: 입력 | `WithdrawScreen.tsx:237-264` | 네트워크 알약 둘, 주소, 금액, 비율 단추 셋, 실패 줄 넷, 요약 3행, 주 단추 | `withdraw.address`, `amount`, `errAddress.*`, `errNan`, `errMin`, `errInsufficient`, `next` | CX-U-241, CX-I-026 | CL-U-117 | 없음 | 전달(`withdraw-security-mobile.png`) |
| U-083 | Page | 출금: 확인 | `WithdrawScreen.tsx:191-203` | 뒤로 가기는 앞 단계로 | `withdraw.confirmTitle`, `confirmDesc`, `toAuth` | CX-U-241 | CL-U-118 | 없음 | 확인 불가(아무도 제출하지 않았다) |
| U-084 | Page | 출금: 인증 앱 코드, 이메일 인증 | `WithdrawScreen.tsx:205-223` | 코드가 틀리면 남은 횟수, 세 번이면 이메일로 | `withdraw.otpTitle`, `otpWrong`, `emailTitle`, `sendCode`, `submit` | CX-U-241, CX-S-030 | CL-U-119, 120 | 없음 | 확인 불가 |
| U-085 | Page | 출금: 신청함 | `WithdrawScreen.tsx:225-235` | 설명이 상태 셋에 따라 다름 | `withdraw.doneTitle`, `doneDesc`, `doneHold`, `doneReview`, `toWallet` | CX-U-241 | CL-U-121 | 없음 | 확인 불가 |
| U-086 | Block | 나온 상품: 머리, 자리 표시(120), 로그인 전, 범위 한 줄 | `components/box/WinsScreen.tsx:57-63` | 없음 | `wins.title`, `desc`, `loginLine`, `scope` | CX-U-206 | CL-U-122, 123, 124 | 없음 | 전달 |
| U-087 | Component | 나온 상품: 빈 상태와 단추 | `WinsScreen.tsx:65` | 없음 | `wins.none`, `state.toBoxes` | CX-U-206 | CL-U-125 | 없음 | 확인 불가 |
| U-088 | Component | 나온 상품: 줄(단추, 30건씩), "더 보기" | `WinsScreen.tsx:68-88` | 사진이 없으면 상자 아이콘 | `wins.value`, `byline`, `more` | CX-U-206 | CL-U-126, 127 | AG-TX-007 | 전달 |

### 3.6 후기, 검증, 이용 방법, 계정, 약관

| id | 층 | 무엇 | 소스 | 실제 상태 | 문구 키 | CX | CL | AG | 일치와 상태 |
|---|---|---|---|---|---|---|---|---|---|
| U-089 | Block | 후기: 화면 머리, 박스 알약 | `components/box/ReviewsScreen.tsx:33-34` | 뒤로 가기는 고른 박스 또는 홈. 알약 14(전체와 옛 박스 13) | `reviews.title`, `filter`, `all` | CX-U-205 | CL-U-128, 129 | 없음 | 전달. 후기 샘플이 합쳐지면 달라진다(의도된 차이) |
| U-090 | Block | 후기: 평균 블록, 카드 격자 `.v-rvgrid`, "나온 상품" 링크 | `ReviewsScreen.tsx:37-41` | 카드 28장(샘플) | `box.ratingCount`, `starsOf`, `reviews.more`, `wins.title` | CX-U-205 | CL-U-131, 132 | AGb-U-013 | 전달. 의도된 차이 자리 |
| U-091 | Section | 검증: 화면 머리, 내 개봉 기록 | `components/verify/VerifyScreen.tsx:72-94` | 자리 표시(120), 로그인 전, 빈 상태, 행(단추) 20개씩, 더 보기 | `verify.title`, `records`, `loginLine`, `noRecords`, `rowMeta` | CX-U-238 | CL-U-133, 134 | 없음 | 전달 |
| U-092 | Section | 검증: 값을 직접 넣어 계산 `#verify-manual` | `VerifyScreen.tsx:96-117` | 입력칸 넷, 박스 알약 334(가로로 넘김), 실패 줄, 주 단추(busy), 결과 3행 또는 4행 | `verify.manualTitle`, `seed`, `client`, `round`, `inputFail`, `compute`, `hashOk`, `hashBad` | CX-U-238, CX-F-068 | CL-U-135 | 없음 | 일치. 전달 |
| U-093 | Section | 검증: 블록체인 검증 방식 `VerifyMethod` | `VerifyScreen.tsx:120-123`, `components/verify/VerifyMethod.tsx:11` | 세 단계 카드, 두 줄 | `verify.step1` ~ `step3`, `verify.method.*`, `localNote` | CX-U-237 | CL-U-136 | 없음 | 전달 |
| U-094 | Block | 이용 방법: 화면 머리, 카드 셋 | `app/[locale]/guide/page.tsx:13-18` | 없음 | `guide.title`, `pickTitle`, `openTitle`, `getTitle` 와 본문 | CX-R-009 | CL-U-137, 138 | 없음 | 일치. 확인됨(코드: `:13`) |
| U-095 | Section | 이용 방법: "알아 둘 값" 3행, 링크 둘 | `guide/page.tsx:19-24`, `components/shell/GuideFees.tsx:14-20` | "개봉 결과 검증" 링크는 `/fairness` 로 간다 | `guide.facts`, `takeRate`, `shipFee`, `minCharge`, `nav.verify`, `nav.legal` | CX-U-229 | CL-U-139, 140 | 없음 | 확인됨(코드: `:24`, 실행: 배포 HTML) |
| U-096 | Block | 계정: 화면 머리, 자리 표시(240), 로그인 전 단추와 가입 링크 | `components/account/AccountScreen.tsx:44-46` | 설명이 로그인 여부로 바뀜 | `account.title`, `desc`, `loginLine`, `login.signupTitle` | CX-U-197 | CL-U-141, 142 | 없음 | 확인됨(화면: `account-mobile.png`) |
| U-097 | Block | 계정: 행 묶음 다섯(지갑 2, 보관함 2, 보안 2, 계정 관리 3, 도움 3) | `AccountScreen.tsx:49-70` | 링크 행과 단추 행. 인증 앱 값은 "연결하기" 또는 "켜짐" | `account.balance`, `held`, `shippingNow`, `twoFactor`, `email`, `nickname`, `password`, `closeTitle` | CX-U-197 | CL-U-143 ~ 147 | 없음 | 확인됨(화면: 같은 스크린샷에 넷째 묶음까지) |
| U-098 | Component | 계정: "로그아웃" 링크 | `AccountScreen.tsx:71` | 누르면 U-137 | `account.logout` | CX-U-197 | CL-U-148 | 없음 | 전달 |
| U-099 | Page | 약관 목록 | `components/legal/LegalCenterScreen.tsx:14-29` | 묶음 셋, 문서 행 13 | 옛 묶음 `legalCenter.*`, `legalDocs.{문서}.title` | CX-U-225 | CL-U-149 | 없음 | 일치. 전달 |
| U-100 | Page | 약관 문서 | `components/legal/LegalDocScreen.tsx:14-26` | 절마다 제목과 본문 `.v-prose` | 옛 묶음 `legalDocs.{문서}.*` | CX-U-226 | CL-U-150 | 없음 | 일치. 전달 |

### 3.7 상태 화면과 로그인 시트의 단계

| id | 층 | 무엇 | 소스 | 실제 상태 | 문구 키 | CX | CL | AG | 일치와 상태 |
|---|---|---|---|---|---|---|---|---|---|
| U-101 | Page | 옮긴 화면 `MovedScreen` | `components/shell/MovedScreen.tsx:9` | 단추 글이 주소마다 다름 | `state.movedTitle`, `movedDesc`, `nav.*` | CX-U-230 | CL-U-151 | 없음 | 일치. 전달(`moved-about-mobile.png`) |
| U-102 | Page | 없는 주소(언어 안) `NotFoundScreen` | `components/shell/StateScreens.tsx:11` | 머리줄과 꼬리말이 붙는다 | `state.notFoundTitle`, `notFoundDesc`, `toBoxes` | CX-U-231, CX-R-024 | CL-U-152 | AG 측정 R-009 | 확인됨(화면: `screenshots/before/agy/routes/R-009-dev-gallery-ko-390-first.png`) |
| U-103 | Page | 없는 주소(루트) `RootNotFound` | `app/not-found.tsx:11` | 언어 셋. 머리줄, 꼬리말, 색 선 없음. 단추의 주소에 `basePath` 가 없다 | 같은 키 셋 | CX-R-024 | CL-U-153 | 없음 | 확인됨(화면: `notfound-root-mobile.png`. `notfound-locale-mobile.png` 도 이름과 달리 이 화면이다: 전달) |
| U-104 | Page | 루트 넘김 화면 `RootRedirect` | `app/page.tsx:9` | 검은 바탕에 "VOILA.GG"(옛 클래스 `caption-luxury`) | 없음 | CX-R-020, CX-F-061 | CL-U-155 | 없음 | 확인됨(코드. 실행: 닿는 파일에서 `caption-luxury` 는 `app/page.tsx:15` 한 곳) |
| U-105 | Component | 오프라인 한 줄 `OfflineLine` | `StateScreens.tsx:45-57` | 끊기면 생기고 돌아오면 사라짐. `role="status"` | `state.offline` | CX-U-231 | CL-U-156, CL-U-211 | AGa-U-036 | 일치. 전달(`offline-line-mobile.png`) |
| U-106 | Component | 세션 끝남 한 줄 `SessionLine` | `StateScreens.tsx:37-43` | 안에 로그인 링크 단추 | `state.sessionLost` | CX-U-231 | CL-U-157, CL-U-211 | AGa-U-036 | 확인 불가(화면) |
| U-107 | Block | 로그인 시트: 이메일 단계 | `components/flow/LoginSheet.tsx:89-110` | 방식 셋(로그인, 가입, 찾기). 공급자 단추 셋. 처리 중 잠김 | `login.title`, `signupTitle`, `recoverTitle`, `email`, `continue`, `provider` | CX-U-211 | CL-U-162 | AGb-I-002 | 일치. 전달(`login-sheet-mobile.png`) |
| U-108 | Block | 로그인 시트: 비밀번호 단계 | `LoginSheet.tsx:91-92,106-107` | 가입이면 "새 비밀번호"와 힌트 | `login.password`, `newPassword`, `hint`, `forgot` | CX-U-211 | CL-U-163 | 없음 | 확인 불가(화면) |
| U-109 | Block | 로그인 시트: 이메일 인증, 비밀번호 다시 정하기, 완료 | `LoginSheet.tsx:85-91,108` | 코드 칸(숫자 6자리), 다시 받기 | `login.verifyTitle`, `resetTitle`, `code`, `resend`, `doneTitle` | CX-U-211, CX-S-004 | CL-U-164, 165 | 없음 | 확인 불가(화면) |

## 4. 닿는 컴포넌트 파일과 최종 번호의 대응

Codex 의 9.2절(`CX-U-197` ~ `CX-U-241`)은 닿는 컴포넌트 파일 45개를 하나씩 적었다. 실행: 통합자의 그래프도 `components` 의 닿는 파일을 45개로 냈다.

| CX | 파일(`web/components/`) | 최종 번호 |
|---|---|---|
| CX-U-197 | `account/AccountScreen.tsx` | U-096 ~ U-098, U-133, U-137 |
| CX-U-198 | `account/AccountSheets.tsx` | U-134 ~ U-136 |
| CX-U-199 | `auth/AuthHost.tsx` | U-112 |
| CX-U-200 | `box/BoxList.tsx` | U-043 ~ U-048 |
| CX-U-201 | `box/BoxReviews.tsx` | U-040, U-052, U-115 |
| CX-U-202 | `box/BoxScreen.tsx` | U-049 ~ U-059, U-114, U-116 |
| CX-U-203 | `box/Opening.tsx` | U-039, U-060 ~ U-066, U-120, U-121 |
| CX-U-204 | `box/Reveal.tsx` | U-067 ~ U-072, U-125, U-143 |
| CX-U-205 | `box/ReviewsScreen.tsx` | U-089, U-090, U-144 |
| CX-U-206 | `box/WinsScreen.tsx` | U-086 ~ U-088, U-138 |
| CX-U-207 | `dev/Gallery.tsx` | U-145 |
| CX-U-208 | `fairness/verifyRecord.ts` | 화면 없음(U-122 의 계산) |
| CX-U-209 | `flow/BalanceSheet.tsx` | U-113, U-147 |
| CX-U-210 | `flow/ChargeSheet.tsx` | U-111, U-146 |
| CX-U-211 | `flow/LoginSheet.tsx` | U-107 ~ U-109, U-112 |
| CX-U-212 | `flow/ProviderMark.tsx` | U-038 |
| CX-U-213 | `flow/ReviewSheet.tsx` | U-129 |
| CX-U-214 | `flow/ShipSheet.tsx` | U-127, U-128 |
| CX-U-215 | `flow/TakeSheet.tsx` | U-117 ~ U-119 |
| CX-U-216 | `flow/VerifySheet.tsx` | U-122, U-124 |
| CX-U-217, 218 | `home/heroBall.ts`, `home/HeroBanner.tsx` | U-043 |
| CX-U-219 | `inventory/InventoryScreen.tsx` | U-073 ~ U-076, U-126, U-130 |
| CX-U-220 | `layout/BrandLogo.tsx` | U-009, U-037 |
| CX-U-221 ~ 224 | `layout/CurrencyHydrator.tsx`, `LabBadge.tsx`, `LocaleHtmlLang.tsx`, `MotionPreferences.tsx` | U-003, U-006 과 U-140, U-005, U-004 |
| CX-U-225, 226 | `legal/LegalCenterScreen.tsx`, `LegalDocScreen.tsx` | U-099, U-100 |
| CX-U-227 | `shell/AppFooter.tsx` | U-014 ~ U-020 |
| CX-U-228 | `shell/AppShell.tsx` | U-007 ~ U-013, U-110 |
| CX-U-229, 230 | `shell/GuideFees.tsx`, `MovedScreen.tsx` | U-095, U-101 |
| CX-U-231 | `shell/StateScreens.tsx` | U-102, U-105, U-106, U-151 |
| CX-U-232 | `ui/kit.tsx` | U-021 ~ U-032 |
| CX-U-233 ~ 235 | `ui/ScrollRow.tsx`, `Sheet.tsx`, `toast.tsx` | U-036, U-033 과 U-034, U-035 |
| CX-U-236, 237 | `verify/ChainRecord.tsx`, `VerifyMethod.tsx` | U-123 과 U-148, U-093 과 U-124 |
| CX-U-238 | `verify/VerifyScreen.tsx` | U-091, U-092 |
| CX-U-239 | `wallet/TwoFactorSetup.tsx` | U-133, U-149 |
| CX-U-240 | `wallet/WalletScreen.tsx` | U-077 ~ U-079, U-131, U-132 |
| CX-U-241 | `wallet/WithdrawScreen.tsx` | U-080 ~ U-085, U-133 |

## 5. 숨은 화면

### 5.1 겹침 화면의 공통 동작

`Sheet`, `Confirm`, 개봉 장면, 개봉 결과가 모두 `lib/useModal.ts` 를 쓴다. 통합자가 두 파일을 끝까지 읽어 확인했다.

| 동작 | 내용 | 근거 | 화면 확인 |
|---|---|---|---|
| DOM | 열릴 때만 만든다. 닫히면 `null` 이다(DOM 에 숨겨 두는 것이 아니다) | 코드: `Sheet.tsx:15,35` | Claude: 닫으면 `[role=dialog]` 0. CX-R-019 도 같은 말 |
| 역할 | `Sheet` 는 `dialog`, `Confirm` 은 `alertdialog`, 둘 다 `aria-modal="true"`. 제목의 id 가 `v-sheet-title`, `v-confirm-title` 로 고정이다 | 코드: `Sheet.tsx:18,22,38,40` | id 가 겹칠 수 있다는 것은 Claude 의 짐작 |
| 스크롤 잠금 | 첫 창이 열릴 때 `body.style.overflow = "hidden"`, 마지막이 닫힐 때 원래 값으로 | 코드: `useModal.ts:33-36,79` | AGY 측정 다섯(메뉴, 로그인, 충전, 잔액, 상품 시트)에서 `hidden`. Claude 도 확인 |
| 포커스 | 열리면 창 자체(`tabIndex -1`)로 간다. 다음 프레임에 한 번 더 준다. Tab 과 Shift Tab 이 창 안에서 돈다. 닫히면 열기 전의 요소로(그것이 사라졌으면 그 앞의 것, 없으면 아래 창) | 코드: `useModal.ts:31-32,39-43,53-66,80-83` | Claude: 로그인 시트에서 Tab 14번이 모두 창 안. 돌아가는 포커스는 아무도 화면에서 보지 않았다 |
| Esc | 맨 위 창 하나만 받는다. 다른 듣는 곳으로 퍼지지 않게 막는다 | 코드: `useModal.ts:45-52` | AGY 측정 다섯에서 닫힘. Claude 도 확인 |
| 바깥 누름 | 바탕 `.v-scrim` 에 mousedown 이면 닫힌다(창 안에서 시작한 누름은 닫지 않는다) | 코드: `Sheet.tsx:17,37` | AGY 측정 다섯에서 닫힘 |
| 닫기 단추 | `Sheet` 에만 있다. `Confirm` 에는 "취소" 링크 | 코드: `Sheet.tsx:19,45` | Claude |
| 잠김 | `Sheet` 의 `locked`, `Confirm` 의 `busy` 가 참이면 Esc, 바깥 누름, 닫기, 취소가 모두 듣지 않는다 | 코드: `Sheet.tsx:14,17,19,34,37,45` | 아무도 화면에서 보지 않았다 |
| 겹침 | 아래 창은 `inert` 와 `aria-hidden` 이 된다. 다만 아래 창이 위 창을 DOM 안에 품고 있으면 그대로 둔다(개봉 장면 안의 시트) | 코드: `useModal.ts:10-19` | Claude: 개봉 장면 위에 시트가 떠도 장면의 `inert` 가 거짓 |
| 뒤로 가기 | 다루지 않는다. 브라우저의 뒤로 가기는 창을 닫지 않고 앞 화면으로 간다 | 실행: 닿는 파일에 `popstate`, `history.`, `hashchange` 0건 | 화면에서 눌러 본 기록은 없다 |
| 모양 | 768px 미만은 아래에서 올라오는 시트, 이상은 가운데 창(폭 480, wide 는 640). z 200 | 코드: `ui.css:118-131` | AGY 측정: 1280 에서 폭 480 과 모서리 26, 390 에서 폭 390 과 모서리 20 20 0 0 |
| 움직임 | `ANIMATION_INVENTORY` A-002, A-003, A-024 | 코드 | 해당 문서 |

출처: CL 5.1절, AGa-U-001 ~ 005, CX-I-032, CX-F-070. 셋이 같은 말을 한다.

### 5.2 시트, 확인창, 화면 전체를 덮는 것

"여는 법"과 "닫는 법"에서 "공통"은 Esc, 바깥 누름, 닫기 단추(시트) 또는 취소 링크(확인창)다. 스크롤 잠금과 포커스 가둠은 모두 5.1절과 같다.

| id | 종류 | 무엇 | 소스 | 여는 법 | 닫는 법 | 안의 상태 | 문구 키 | CX | CL | AG | 일치와 상태 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| U-110 | 시트 | 메뉴 시트 | `shell/AppShell.tsx:60-64` | 메뉴 단추(900px 미만) | 공통, 행을 누르면 닫히며 이동 | 링크 행 7 | `nav.menu`, `nav.*` | CX-U-228 | CL-U-166 | AGa-U-023, AGb-I-001 | 어긋남 → D-U3. 확인됨(`menu-sheet-mobile.png`, `screenshots/before/agy/overlays/AG-I-001-menu-open.png`) |
| U-111 | 시트 | 충전 시트 | `flow/ChargeSheet.tsx:43-59` | 지갑, 열기 막대, 개봉 장면과 결과, 잔액 시트의 충전 | 공통, 입금이 확인되면 스스로 | 네트워크 알약 셋, QR 과 주소, 상태 한 줄 넷, 주 단추(복사, 다시 받기) | `charge.title`, `network`, `preparing`, `addressFail`, `waiting`, `confirming`, `copy`, `retry` | CX-U-210 | CL-U-167 | AGa-U-014, AGb-I-003 | 어긋남 → D-U4. 배포 사이트에서는 주소 실패 상태만 보였다(Claude). QR, 주소, 복사, 확인 줄은 확인 불가 |
| U-112 | 시트 | 로그인 시트 | `flow/LoginSheet.tsx:83-112`, 붙는 곳 `auth/AuthHost.tsx:50` | 머리줄 로그인, 배너 단추, "로그인하고 언박싱", 화면의 로그인 단추, 가입 링크, 세션 끝남 한 줄 | 공통. 처리 중 잠김. 끝나면 스스로 | U-107 ~ U-109 | U-107 참고 | CX-U-199, CX-U-211 | CL-U-169 | AGa-U-016, AGb-I-002 | 일치. 확인됨. `AppShell` 밖(레이아웃)에 붙는다(코드: `app/[locale]/layout.tsx:77`) |
| U-113 | 시트 | 잔액 시트 | `flow/BalanceSheet.tsx:45-61` | 잔액 단추 | 공통 | 3행. 보관 상품이 있으면 주 단추가 "USDT로 받기", 없으면 충전 | `balanceSheet.title`, `spendable`, `withdrawable`, `held` | CX-U-209 | CL-U-170 | AGa-U-015, AGb-I-004 | 일치. 확인됨(`balance-sheet-mobile.png`) |
| U-114 | 시트 | 상품 시트(박스 화면), 그 안의 펴는 글 둘 | `box/BoxScreen.tsx:281-315` | 상품 타일, 상품 행, 확률표의 행 | 공통 | 사진, 행 최대 6, 나라 목록(다시 누르면 접힘), 비교 목록(접는 길 없음) | `reveal.value`, `odds`, `box.receive`, `countriesLink`, `alsoIn` | CX-U-202 | CL-U-172, CL-U-205 | AGb-I-006 | 일치. 확인됨(코드: `:281`. `box-pokemon-charizard-item-sheet-desktop.png`, `screenshots/before/agy/overlays/AG-I-006-item-detail-open.png`) |
| U-115 | 시트 | 후기 상세 시트(읽기) | `box/BoxReviews.tsx:146-173` | 후기 카드 | 공통 | 별, 글 전체, 사진, 행 3, 내 후기면 검증 링크 | `reviews.detail`, `item`, `box`, `toBox` | CX-U-201 | CL-U-173 | AGa-U-021 | 어긋남 → D-U5. 확인됨(`review-detail-desktop.png`) |
| U-116 | 확인창 | 큰 금액 확인창 | `box/BoxScreen.tsx:316` | 낼 값이 50 USDT 이상이거나 10개 이상일 때의 열기와 "한 번 더" | Esc, 바깥 누름, 취소. 처리 중 잠김 | 제목(금액), 주 단추(busy) | `box.confirmTitle`, `confirmDesc`, `box.open` | CX-U-202 | CL-U-174 | 없음 | 확인됨(코드: `:47-48,164,316`. `open-confirm-mobile.png`) |
| U-117 | 시트 | 받기 선택 시트(고르기) | `flow/TakeSheet.tsx:150-195` | 보관함, 잔액 시트, 열기 막대, 개봉 장면과 결과, 출금 화면 | 공통 | 불러오는 중(자리 표시 144), 빈 상태, 전체 선택 행과 상품 행(`role="checkbox"`), 아래 붙은 막대 | `take.title`, `desc`, `empty`, `selectAll`, `submit` | CX-U-215 | CL-U-175 | AGa-U-017, `agy-a` 5.2절 12번 | 일치. 확인됨(`take-sheet-held-mobile.png`) |
| U-118 | 확인창 | 받기 확인창 `TakeConfirm` | `flow/TakeSheet.tsx:52-57` | 받기 선택 시트의 주 단추, 개봉 장면의 "USDT로 받기", 여러 개 결과의 상품 시트, 보관함 상품 시트 | Esc, 바깥 누름, 취소. 처리 중 잠김 | 금액이 든 한 줄, 주 단추(busy) | `take.title`, `confirmDesc`, `reveal.take` | CX-U-215 | CL-U-176 | AGa-U-018 | 일치. 확인됨(실행: 붙는 곳 4. `take-confirm-mobile.png`) |
| U-119 | 시트 | 받기 선택 시트(결과) | `flow/TakeSheet.tsx:199-244` | 확인창에서 받기를 누름 | 공통. 처리 중 잠김 | 한 줄 여덟 가지, 목록 셋, 주 단추(다시 시도, 다시 확인, 닫기) | `take.done`, `already`, `unknown`, `failed`, `leftLine` | CX-U-215 | CL-U-177 | 없음 | 확인 불가(화면: 아무도 받기를 확인하지 않았다). 돈이 움직이는 자리다 |
| U-120 | 시트 | 개봉 설정 시트 | `box/Opening.tsx:344-350` | 개봉 장면의 설정 단추(연출 중에도 있다). 여러 개 결과에는 없다 | 공통 | 스위치 셋(`role="switch"`): 소리와 진동, 짧게 보기, 자동으로 USDT 로 받기 | `op.settings`, `setSound`, `setShort`, `setAuto`, `on`, `off` | CX-U-203, CX-I-011 | CL-U-178 | AGa-U-022, `agy-a` 5.2절 13번 | 일치. 확인됨(`opening-settings-mobile.png`) |
| U-121 | 확인창 | 자동 받기 확인창 | `box/Opening.tsx:352` | 설정 시트에서 자동 받기를 켤 때(그동안 설정 시트는 사라진다) | Esc, 바깥 누름, 취소. 닫으면 설정 시트가 돌아온다 | 기준 설명, 주 단추 | `op.setAuto`, `autoConfirm`, `autoOn` | CX-U-203 | CL-U-179 | 없음 | 확인됨(전달: Claude 가 취소까지 봄) |
| U-122 | 시트 | 검증 시트 | `flow/VerifySheet.tsx:57-94` | 개봉 장면과 결과, 보관함 상품 시트, 나온 상품 상세, 검증 화면의 기록 행 | 공통. "값을 직접 넣어 검증"은 닫히며 R-009 로 | 세 단계, 판정 한 줄 셋(같음, 번호까지만, 다름), 계산 실패 한 줄, 긴 값의 `title` | `verify.title`, `step1` ~ `step3`, `ok`, `partial`, `bad`, `failed`, `manual` | CX-U-216 | CL-U-180 | AGa-U-020, AGb-I-005 | 어긋남 → D-U4. 확인됨(`verify-sheet-mobile.png`). "번호까지만"과 계산 실패는 확인 불가 |
| U-123 | 시트 안 블록 | 블록체인 기록 "기록 없음" | `components/verify/ChainRecord.tsx:13-34` | 검증 시트의 둘째 단계 | 해당 없음 | 실제 기록은 언제나 "기록 없음"(`lib/chainRecord.ts:29-31`, 전달) | `verify.chain.status`, `none`, `noneBody` | CX-U-236 | CL-U-181 | 없음 | 전달. 나머지 네 상태는 U-148 |
| U-124 | 펴는 글 | 방식 설명 펴기 | `flow/VerifySheet.tsx:88,91` | 검증 시트의 링크 | 같은 링크 | U-093 과 같은 글 | U-093 과 같음 | CX-U-216, CX-U-237 | CL-U-182 | 없음 | 전달 |
| U-125 | 시트 | 상품 시트(여러 개 결과) | `box/Reveal.tsx:284-296` | 결과 목록에서 받을 수 있는 상품 행 | 공통. 받으면 스스로 | 사진, 2행, 주 단추 "USDT로 받기", 링크 | `reveal.value`, `odds`, `take`, `takenDesc` | CX-U-204 | CL-U-183 | 없음 | 확인됨(코드: `:284`. 화면은 전달) |
| U-126 | 시트 | 상품 시트(보관함) | `inventory/InventoryScreen.tsx:142-178` | 보관함의 상품 행 | 공통 | 행 최대 9, 한 줄 넷, 주 단추가 상태로 바뀜(USDT로 받기, 배송 신청 취소, 배송 조회), 링크(배송 받기, 지갑 내역, 검증) | `inv.status`, `acquired`, `takenAmount`, `carrier`, `tracking`, `writeReview`, `cancelShip`, `track`, `reveal.ship` | CX-U-219 | CL-U-184 | 없음 | 확인됨(코드: `:142`. `inventory-item-sheet-mobile.png`) |
| U-127 | 시트 | 배송 시트 | `flow/ShipSheet.tsx:62-78` | 보관함 상품 시트의 "배송 받기"(그동안 상품 시트는 사라진다) | 공통. 닫으면 상품 시트가 돌아온다 | 넓은 시트. 나라 알약 13, 입력칸 넷, 통관 번호 칸(한국, 중국), 칸마다 실패 줄, 2행, 주 단추 | `ship.title`, `country`, `recipient`, `phone`, `postal`, `address`, `pccc`, `fee`, `submit` | CX-U-214 | CL-U-185 | AGa-U-019 | 일치. 확인됨(`ship-sheet-mobile.png`). 제출은 아무도 하지 않았다 |
| U-128 | 확인창 | 배송 확인창 | `flow/ShipSheet.tsx:79` | 배송 시트의 주 단추 | Esc, 바깥 누름, 취소. 처리 중 잠김 | 주소가 든 한 줄, 주 단추(busy) | `ship.confirmTitle`, `confirmDesc` | CX-U-214 | CL-U-186 | 없음 | 확인 불가(화면). 코드: `:79` |
| U-129 | 시트 | 후기 쓰기 시트 | `flow/ReviewSheet.tsx:55-71` | 보관함 상품 시트의 "후기 쓰기" 행 | 공통 | 별점 알약 다섯, 글 칸, 사진 고르기와 미리 보기, 실패 줄 셋, 주 단추(busy) | `review.title`, `rating`, `text`, `photo`, `tooShort`, `send` | CX-U-213, CX-F-066, CX-S-035 | CL-U-187 | AGa-U-021 | 어긋남 → D-U5. 확인 불가(화면: 아무도 열지 않았다) |
| U-130 | 확인창 | 배송 취소 확인창 | `inventory/InventoryScreen.tsx:187` | 배송 신청함 상태의 상품 시트 | Esc, 바깥 누름, 취소. 처리 중 잠김 | 주 단추 | `inv.cancelTitle`, `cancelDesc` | CX-U-219 | CL-U-188 | 없음 | 확인됨(전달) |
| U-131 | 시트 | 거래 시트 | `wallet/WalletScreen.tsx:124-144` | 지갑의 내역 행 | 공통 | 행 최대 5, 주소 카드, 한 줄 셋, "출금 취소"(72시간 대기 건만), 탐색기 링크 | `wallet.amount`, `fee`, `net`, `holdLeft`, `reviewLine`, `cancel`, `explorer` | CX-U-240 | CL-U-189 | 없음 | 확인됨(코드: `:124`. 화면은 전달) |
| U-132 | 확인창 | 출금 취소 확인창 | `wallet/WalletScreen.tsx:145` | 거래 시트의 "출금 취소" | Esc, 바깥 누름, 취소. 처리 중 잠김 | 주 단추 | `wallet.cancelTitle`, `cancelDesc` | CX-U-240, CX-F-010 | CL-U-190 | 없음 | 확인됨(전달). 돈이 움직이는 자리다 |
| U-133 | 시트 | 인증 앱 시트 둘(출금 관문, 계정)과 그 안의 `TwoFactorSetup` | `wallet/WithdrawScreen.tsx:185-187`, `account/AccountScreen.tsx:75-77`, `wallet/TwoFactorSetup.tsx:73-97` | 출금 관문의 단추, 계정의 인증 앱 행 | 공통. 연결되면 스스로 | 넓은 시트. 준비 중, 안내와 시작 단추, QR 과 수동 키와 코드 칸, 실패 줄. 출금 쪽은 열리자마자 준비를 시작한다 | 옛 묶음 `security.*`, `account.processing`, 새 묶음 `account.twoFactor` | CX-U-239, CX-U-197, CX-U-241 | CL-U-191, 192, 193 | AGa-U-024 | 일치. 확인됨(`twofactor-sheet-mobile.png`) |
| U-134 | 시트 | 닉네임 시트 | `account/AccountSheets.tsx:38-43` | 계정의 닉네임 행 | 공통 | 입력칸, 바꿀 수 없는 기간 한 줄, 주 단추(busy) | `account.nickname`, `nicknameDesc`, `nicknameLocked`, `save` | CX-U-198 | CL-U-194 | AGa-U-024 | 확인됨(전달) |
| U-135 | 시트 | 비밀번호 시트 | `account/AccountSheets.tsx:66-76` | 계정의 비밀번호 행 | 공통 | 입력칸 셋. 소셜 계정이면 설명 한 줄만 | `account.password`, `passwordCurrent`, `passwordNew`, `passwordSave` | CX-U-198, CX-F-007 | CL-U-195 | AGa-U-024 | 확인됨(전달). 끝까지 가지 않는다는 원본의 결함은 `FINDINGS` |
| U-136 | 시트와 확인창 | 탈퇴 시트와 탈퇴 확인창 | `account/AccountSheets.tsx:96-101` | 계정의 탈퇴 행, 그 시트의 주 단추 | 공통. 확인창은 처리 중 잠김 | 비밀번호 칸, 주 단추(비면 disabled) | `account.closeTitle`, `closeDesc`, `closeConfirm`, `closeCta` | CX-U-198, CX-F-007 | CL-U-196, 197 | AGa-U-024 | 시트는 확인됨(전달), 확인창은 확인 불가(화면) |
| U-137 | 확인창 | 로그아웃 확인창 | `account/AccountScreen.tsx:81` | 계정의 "로그아웃" | Esc, 바깥 누름, 취소. 처리 중 잠김 | 주 단추(busy) | `account.logoutTitle`, `logoutDesc` | CX-U-197 | CL-U-198 | 없음 | 확인됨(코드: `:81`. `logout-confirm-mobile.png`) |
| U-138 | 시트 | 나온 상품 상세 시트 | `box/WinsScreen.tsx:94-113` | 나온 상품의 줄 | 공통. "개봉 결과 검증"은 같은 자리에 U-122 | 사진, 6행, 한 줄, 주 단추, 박스 링크 | `wins.box`, `priceThen`, `priceNow`, `times`, `free`, `at` | CX-U-206 | CL-U-199 | 없음 | 확인됨(코드: `:94`. `wins-detail-desktop.png`) |
| U-060 | 화면 전체 | 개봉 장면(3.3절) | `box/Opening.tsx:207`, `BoxScreen.tsx:319` | 한 개 열기, 못 본 결과 하나 | ready 뒤: 닫기 단추, Esc, "박스로 돌아가기", "보관함에 두기". 그 전의 Esc 는 건너뛰기. 다음 구매 중에는 닫히지 않는다. 바깥 누름 없음(바탕이 없다) | 3.3절 | 3.3절 | CX-I-009 | CL-U-200 | AGa-U-012 | 확인됨(코드: `Opening.tsx:122-124`). `useModal` 을 쓰므로 스크롤 잠금과 포커스 가둠이 같다. 열 때마다 `key` 가 바뀌어 새로 만든다 |
| U-067 | 화면 전체 | 개봉 결과(3.4절) | `box/Reveal.tsx:167`, `BoxScreen.tsx:320` | 여러 개 열기, 못 본 결과 여럿 | 결과가 뜨고 350ms 뒤: 닫기 단추, Esc, 링크 둘. 연출 중의 Esc 는 건너뛰기 | 3.4절 | 3.4절 | CX-I-012 | CL-U-201 | AGa-U-013 | 확인됨(코드: `Reveal.tsx:70-80`) |

### 5.3 그 밖의 숨은 것

| id | 종류 | 무엇 | 소스 | 나타나는 때 | 사라지는 때 | DOM | CX | CL | AG | 일치와 상태 |
|---|---|---|---|---|---|---|---|---|---|---|
| U-139 | 툴팁 | 브라우저 기본 툴팁(`title`) | `flow/VerifySheet.tsx:63,76,77`, `verify/VerifyScreen.tsx:109`, `verify/ChainRecord.tsx:21`, QR 둘 | 줄인 값에 마우스를 올림 | 뗌 | 속성으로 늘 있다. 만든 툴팁 부품은 없다 | 없음 | CL-U-213 | 없음 | 확인됨(실행: 찾기) |
| U-140 | 경고 | 저장 공간이 가득 참 | `components/layout/LabBadge.tsx:33-37` | 저장이 실패했을 때(`voila:storage-full`) | 새로 고칠 때까지 남는다 | 감싸는 자리는 늘 있고 경고는 그때만. `role="status"`(`:34`). 글이 한국어로 코드에 박혀 있다 | CX-R-021, CX-F-009 | CL-U-212 | 없음 | 확인 불가(화면) |
| U-141 | 없음 | 드롭다운, 팝오버, 드로어, 탭 역할, 만든 메뉴 | 해당 없음 | 해당 없음 | 해당 없음 | 닿는 소스에 없다 | 없음 | CL-U-214 | AGb-I-001(메뉴를 "드로어"라고 부름), AGb-I-007, AGb-I-008 | 확인됨(실행: `select`, `role="menu"`, `role="listbox"`, `role="tab"` 0건). D-U3 |
| U-142 | 규칙 | 시트가 서로 자리를 바꾸는 규칙 | 각 소스의 `open` 조건 | 아래 표 | | | CX-I-032 | CL-U-215 | AGa-U-005 | 일부 확인됨(코드) |

시트가 겹치는 곳과 바뀌는 곳(Claude 5.5절을 옮기고, 통합자가 `open` 조건을 찾기로 맞춰 본 것에 "코드"라고 적는다):

| 곳 | 일어나는 일 | 근거 |
|---|---|---|
| 잔액 시트 → 받기 선택 시트 | 잔액 시트가 사라지고 받기 시트가 뜬다 | 코드: `BalanceSheet.tsx:46`(열림 조건에 "받는 중이 아닐 때"가 붙어 있다) |
| 보관함 상품 시트 → 배송, 검증, 후기, 받기 확인, 취소 확인 | 상품 시트가 사라지고 그것이 뜬다. 닫으면 돌아온다 | 전달(Claude 가 화면에서 봄) |
| 받기 선택 시트 → 확인창 → 결과 | 같은 자리에서 셋이 차례로 | 코드: `TakeSheet.tsx:150,199`(`step`) |
| 설정 시트 → 자동 받기 확인창 | 자리를 바꾼다 | 코드: `Opening.tsx:344,352`(설정 시트의 열림 조건에 "묻는 중이 아닐 때"가 붙어 있다) |
| 탈퇴 시트 → 탈퇴 확인창, 배송 시트 → 배송 확인창, 거래 시트 → 출금 취소 확인창 | 자리를 바꾼다 | 코드: `AccountSheets.tsx:96,101`, `ShipSheet.tsx:62,79`, `WalletScreen.tsx:124,145` |
| 박스 화면의 상품 시트와 받기 시트 | 개봉 장면이 떠 있으면 그리지 않는다 | 코드: `BoxScreen.tsx:281,318`(두 시트의 열림 조건에 "열린 결과가 없을 때"가 붙어 있다) |
| 개봉 장면 또는 결과 위의 시트 | 겹친다: 장면이 아래에 남고 그 위에 시트 하나 | 전달(Claude: `[role=dialog]` 2개) |
| 개봉 장면 위의 충전 시트 | 충전 시트는 `AppShell` 쪽 DOM 에 있어 장면의 자손이 아니다. 이때 장면이 `inert` 가 되는지, 포커스가 어디로 가는지는 확인 불가 | 코드로 읽으면 장면은 가려진 창이 되어 `inert` 가 된다(`useModal.ts:13`). 화면에서 아무도 보지 않았다 |

## 6. 소스에는 있으나 지금 흐름에서 닿지 않는 것

| id | 무엇 | 소스 | 왜 닿지 않나 | CX | CL | AG | 상태 |
|---|---|---|---|---|---|---|---|
| U-143 | 개봉 결과의 "결과가 하나일 때" 두 꼴 | `box/Reveal.tsx:182-214` | 박스 화면은 결과가 하나면 `Opening` 을 쓴다(코드: `BoxScreen.tsx:319-320` 의 `length === 1`, `length > 1`) | CX-U-204 | CL-U-100 | 없음 | 도달 불가. 확인됨(코드) |
| U-144 | 후기 화면의 빈 상태 | `box/ReviewsScreen.tsx:35` | 샘플 후기 28개가 늘 있다 | CX-U-205 | CL-U-130 | 없음 | 도달 불가(전달) |
| U-145 | 개발용 갤러리와 그 안의 표본(시트, 확인창 넷, 블록체인 기록 다섯) | `components/dev/Gallery.tsx:34-140` | 프로덕션 빌드에서는 없는 주소(R-019) | CX-U-014, CX-U-207 | CL-U-158 ~ 161 | AG 측정 R-009 | 도달 불가. 확인됨(실행, 화면) |
| U-146 | 충전 시트의 로그인 전 꼴 | `flow/ChargeSheet.tsx:36-42` | 여는 단추가 로그인한 사람에게만 나온다 | CX-U-210 | CL-U-168 | AGb-I-003("비로그인 시 충전 버튼이 감춰짐") | 도달 불가에 가깝다(세션이 끝나는 순간에는 보일 수 있다: 짐작) |
| U-147 | 잔액 시트의 로그인 전 꼴 | `flow/BalanceSheet.tsx:36-42` | 위와 같음 | CX-U-209 | CL-U-171 | AGb-I-004 | 위와 같음 |
| U-148 | 블록체인 기록의 네 상태(확정 전, 확정, 다름, 불러오기 실패) | `verify/ChainRecord.tsx:13-34` | 실제 기록은 언제나 "기록 없음"이다. 갤러리의 고정 자료로만 그려진다 | CX-U-014, CX-U-236 | CL-U-181 | 없음 | 도달 불가(전달: `lib/chainRecord.ts:29-31` 을 통합자가 열지 않았다) |
| U-149 | 인증 앱 부품의 로그인 전 꼴 | `wallet/TwoFactorSetup.tsx:73` | 두 시트 모두 로그인한 화면에서만 열린다 | CX-U-239 | CL-U-193 | 없음 | 도달 불가(전달) |
| U-150 | 로그아웃 알림 토스트 | `stores/authStore.ts:72`, 부르는 곳 `AccountScreen.tsx:39` | `authStore.toast` 를 그리는 닿는 컴포넌트가 없다 | 없음 | CL-U-203 | 없음 | 도달 불가(전달). 문구 `account.loggedOut` 은 화면에 나오지 않는다 |
| U-151 | 오류 화면 `ErrorScreen` | `shell/StateScreens.tsx:23`, `app/[locale]/error.tsx:5` | 화면이 그리다 던져야 뜬다 | CX-U-231 | CL-U-154 | 없음 | 확인 불가(R-022) |
| U-152 | 가지 넷: 사진 없는 상품 타일의 아이콘, 분류 알약의 옛 이름(`categories.*`), 이용 방법의 USDT 결과 행, 박스 그림 `.v-boxhero` | `BoxScreen.tsx:328`, `BoxList.tsx:102`, `GuideFees.tsx:17`, `BoxScreen.tsx:186` | 앞의 셋: 그 조건이 지금 자료에서 생기지 않는다. 박스 그림: 대표 사진이 없는 박스 21개가 있으나 그 박스에 박스 그림이 있는지 아무도 보지 않았다 | CX-U-202 | CL-U-075, 058, 139, 066 | 없음 | 앞의 셋은 도달 불가(전달), 박스 그림은 확인 불가 |
| U-153 | 어느 라우트도 그리지 않는 컴포넌트 파일 71개(`about` 7, `auth` 10, `box` 4, `community` 5, `fairness` 5, `home` 13, `inventory` 6, `layout` 5, `legal` 2, `ui` 2, `unboxing` 6, `wallet` 6) | `web/components/` | `web/app` 에서 `import` 를 따라가도 닿지 않는다 | CX-U-002 ~ 013, CX-U-100 ~ 170 | CL 6.2절 | 없음 | 도달 불가. 확인됨(실행: 통합자의 그래프가 같은 71개를 냈다. 파일 이름은 `analysis/claude-a-ui.md` 6.2절과 `codex-a` 9.1절에 하나씩 있다) |
| U-154 | 닿지 않는 `lib` 22, `stores` 1, `server` 2, `src` 1 | `web/lib/` 등 | 위와 같음. `lib/auth.ts`, `lib/liveDrops.ts`, `lib/proofFeed.ts` 는 타입으로만 불린다 | CX-U-015, CX-U-171 ~ 196 | CL 6.2절 끝(`lib` 19, `uiStore`) | 없음 | 어긋남 → D-U6. 확인됨(실행) |
| U-155 | 쓰이지 않는 CSS: `ui.css` 의 11 클래스, `opening.css` 의 `v-op-choice`, 키프레임 `v-breathe` 와 `v-lid`, `v-btn--auto`, 그리고 옛 화면용 파일 다섯(`design.css`, `gpt-skin.css`, `gpt-flow.css`, `nfx-skin.css`, `shop-skin.css`)과 `globals.css` 의 대부분 | `web/app/*.css` | 그 클래스를 쓰는 닿는 소스가 없다 | 없음 | CL 6.3절 | AG-TOK-030 ~ 037, 048, 049, 071, 087, AG-TOK-102 | 실행으로 맞춰 본 것: `v-strip`, `v-lidbox`, `v-reveal-stage`, `v-op-choice` 를 쓰는 소스 0건(`v-op-choices` 감싸개만 쓰인다). 나머지는 전달 |
| U-156 | 쓰이지 않는 문구: 새 묶음의 16 키, 갤러리만 쓰는 3 키, 쓰는 코드는 있으나 화면에 나오지 않는 키들 | `web/messages/v.*.json` | 닿는 소스가 쓰지 않는다 | 없음 | CL 6.4절 | 없음 | 전달(Claude 의 `keys.mjs`. 통합자는 다시 돌리지 않았다) |

Codex 가 따로 짚은 것(CX-U-016): 이름은 옛 것인데 지금도 쓰이는 모듈이 있다. `lib/autoplay` 는 수량 묶음 때문에 쓰이고, `dailyStore` 와 `telemetryStore` 는 불러오기만 한다. 파일이 닿는다는 것과 그 화면이 그려진다는 것은 다르다. Claude 도 두 스토어에 대해 같은 말을 했다.

직접 DOM 을 만지는 파일(Codex 6절, `CX-F-060` ~ `CX-F-070`)과 닿는지:

| 파일 | 닿는가 | 최종 번호 | 비고 |
|---|---|---|---|
| `app/layout.tsx`, `app/page.tsx` | 닿음 | U-002, U-104 | CX-F-060, CX-F-061 |
| `components/box/BoxScreen.tsx`(스크롤) | 닿음 | U-050, U-051 | CX-F-063 |
| `components/flow/ReviewSheet.tsx`(사진 줄이기) | 닿음 | U-129 | CX-F-066 |
| `components/home/heroBall.ts`(WebGL) | 닿음 | U-043 | CX-F-067 |
| `components/verify/VerifyScreen.tsx`(스크롤) | 닿음 | U-092 | CX-F-068 |
| `components/auth/AvatarSettings.tsx`, `community/ReviewFormModal.tsx`, `fairness/VisualVerifier.tsx`, `lib/fingerprint.ts` | 닿지 않음 | U-153, U-154 | CX-F-062, 064, 065, 069. 실행: 통합자의 그래프에서 넷 다 닿지 않는다 |
| BRIEF 의 열 파일 밖: `lib/useModal.ts`, `ui/ScrollRow.tsx`, `layout/LocaleHtmlLang.tsx`, `wallet/TwoFactorSetup.tsx`, `box/BoxReviews.tsx` | 닿음 | U-033, U-036, U-005, U-133, U-052 | CX-F-070, Claude 6.2절 끝. 두 분석이 같은 말을 한다 |

## 7. 토큰과 계산된 스타일

### 7.1 토큰(`web/app/tokens.css`)과 AGY 의 목록

통합자가 `tokens.css` 를 끝까지 읽고 `agy-a` 1절의 값과 하나씩 맞췄다.

| 묶음 | AG 번호 | 코드의 값 | 맞는가 |
|---|---|---|---|
| 면과 선 | AG-TOK-001 ~ 009 | `--v-bg #000`, `--v-card #303030`, `--v-pill #2f2f2f`, `--v-pill-hover #3a3a3a`, `--v-scrim rgba(0,0,0,0.72)`, `--v-photo #1a1a1a`, `--v-outline rgba(255,255,255,0.15)`, `--v-divider rgba(255,255,255,0.1)`, `--v-selected #9a9a9a` | 전부 맞다(`tokens.css:9-19`) |
| 글자와 주 단추 | AG-TOK-010 ~ 017 | `--v-title #fff`, `--v-text #ececec`, `--v-sub #cdcdcd`, `--v-mute #9a9a9a`, `--v-primary #fff`, `--v-primary-hover #e6e6e6`, `--v-on-primary #000`, `--v-fail #ff7b72` | 전부 맞다(`:22-33`) |
| 개봉 상자, 별, 배너 | AG-TOK-018 ~ 029 | 상자 다섯(`#4a4a4a`, `#343434`, `#232323`, `#0b0b0b`, `#5e5e5e`), `--v-spark #d9c39a`, 박 색 다섯, `--v-hero-orb #e5383b` | 전부 맞다(`:36-50`) |
| 옛 화면의 색 | AG-TOK-030 ~ 037 | `tailwind.config.ts` 의 값 | 통합자가 열지 않았다(전달). 닿는 화면에서 쓰이는 것은 `body` 의 `bg-canvas`, `text-white` 와 U-006, U-140 의 Tailwind 클래스뿐이다 |
| 색 선 | AG-TOK-038 | `LabBadge` 의 Tailwind 색 | 전달 |
| 글자 크기 | AG-TOK-040 ~ 044 | 제목 32(767px 이하 28), 설명 18(16), 절 제목 18, 본문 16, 작은 글 14 | 전부 맞다(`:63-67,77-78`). 줄 높이 1.25, 1.5, 1.4, 1.5, 1.5 도 `ui.css:8,44-47` 과 맞다 |
| 그 밖의 크기 | AG-TOK-045 ~ 049 | 알약 15px(`ui.css:76`), 결과 숫자 `clamp(44px, 14vw, 64px)`(`opening.css:24`), 평균 숫자 40px, 옛 것 둘 | 앞의 둘은 맞다. 나머지는 전달 |
| 둥글기 | AG-TOK-050 ~ 054 | 카드 26(767px 이하 20), 입력칸 19, 알약 999, 사진 12, 체크 8 | 맞다(`tokens.css:53-55,76`, `take.css:5`, `ui.css:369`) |
| 치수 | AG-TOK-060 ~ 066 | 주 단추 52, 누르는 자리 44, 옆 여백 16, 열 560, 넓은 폭 1120, 쌓는 간격 16, 28, 8, 머리줄 56 과 64 | 전부 맞다(`tokens.css:56-60`, `ui.css:25-27,32,39`) |
| 분기점 | AG-TOK-070 ~ 077 | 359px(상품 행), 359.98px(배너), 380px(옛 것), 640, 720, 767 과 768, 900, 1023.98 과 1024, 높이 700 | 맞다. 다만 AG-TOK-070 은 상품 행도 359.98px 라고 적었는데 코드는 359px 다(`ui.css:373`). 같은 보고서의 7절 표는 359px 로 맞게 적었다 |
| z 순서 | AG-TOK-080 ~ 090 | 0, 1, 2, 3, 4(배너 안), 20(열기 막대), 30(머리줄), 35(옛 것), 150(개봉), 200(시트 바탕), 300(토스트, 색 선) | 20, 30, 150, 200, 300 은 맞다(`ui.css:31,118,140,287`, `opening.css:8`). 배너 안의 값은 `hero.css` 와 맞다 |
| 그림자 | AG-TOK-095 ~ 099 | 새 화면의 카드와 창은 그림자 없음. 상자의 안쪽 선, 봉인, 배너 카드, 구슬에만 있다 | 맞다(`opening.css:74,88`, `hero.css:51,91`). 측정도 부품 열하나가 모두 `none` |
| 움직임 | AG-TOK-100 ~ 104 | `--v-fast 0.1s`, `--v-ease`, 개봉 길이 | 맞다. `ANIMATION_INVENTORY` 2절 |
| 글꼴 | AG-FNT-001 ~ 007 | Pretendard Variable 한 벌(`next/font/local`, `display: swap`, 굵기 45 ~ 920), 모든 요소에 같은 글꼴 | `app/layout.tsx:45` 와 `globals.css:20-31` 은 맞다(코드). 측정된 `font-family` 의 첫 이름은 `__pretendard_80bf82`(실행: `primitives-result.json`) |
| 전역 상태 | AGa-I-001, 002, 004 | 포커스 테 2px 흰색에 틈 2px, 선택 색, 입력칸 포커스의 테두리 색 | 맞다(`ui.css:9,15,102`). AG-S 의 사진 열 장이 같은 값을 쟀다(입력칸만 `outline: none`) |
| 스크롤 막대 | AGa-I-003, AG-TOK-052 의 "스크롤바 썸" | `ui.css:10-14` 에 얇은 막대 규칙이 있다 | 어긋남 → D-U1. 그 규칙은 뒤에 오는 `globals.css:47-52` 에 덮여 막대는 그려지지 않는다 |

### 7.2 반응형과 줄바꿈

| 무엇 | AG 번호 | 통합자의 확인 |
|---|---|---|
| 반응형 규칙 표(`agy-a` 7절, 27줄) | 번호 없음 | 통합자가 연 줄: `ui.css:39,41,125-131,373`, `opening.css:13,144`, `hero.css:124-141`, `scroll-fade.css:8`, `tokens.css:74-80`. 모두 표와 맞다. 나머지 줄은 전달 |
| 언어별 줄바꿈 규칙 | `agy-a` 8.1절 | 전달(`globals.css:65-80` 을 열지 않았다) |
| 줄바꿈 위험 열 곳 | AG-TX-001 ~ 010 | 각 U 줄에 붙였다(U-010, U-047, U-057, U-026, U-041 과 U-076, U-063, U-088, U-056, U-052). AG-TX-010(`.v-take-hint`)은 U-066 과 U-072 의 힌트 줄이다. 통합자가 연 것은 `ui.css:183,201,227` 의 줄 수 제한 셋 |
| 세 언어의 실제 줄 수 차이 | AGb-U-010 ~ 013(`locales-result.json`, 99건) | 전달. 통합자는 그 파일을 다시 세지 않았다 |
| 가로 넘침 | `routes-result.json` | 실행: 180 조합에서 0. 조합의 실제 범위는 `ROUTE_INVENTORY.md` 6절 D-R2 |

### 7.3 부품의 계산된 스타일(AGY 측정)과 코드

실행: `harness/agy/primitives-result.json` 을 통합자가 다시 읽었다. 측정 화면은 배포 사이트의 한국어 홈과 그 위의 시트 하나, 폭은 1280 과 390.

| 부품 | 측정(1280, 390) | 코드 | 맞는가 |
|---|---|---|---|
| `.v-btn` | 높이 52, 모서리 999, 배경 흰색, 글자 검정, 16px, 굵기 400, 줄 높이 20, 안쪽 여백 0 24, 간격 8, 그림자 없음 | `ui.css:59`(`line-height: 1.25` 는 20px) | 맞다 |
| `.v-chip` | 높이 44, 15px, 줄 높이 22.5, 안쪽 여백 0 16, 테두리 2px `rgb(154,154,154)`, 글자 흰색 | `ui.css:76,78` | 맞다. 다만 이것은 선택된 알약이다(기본은 테두리 투명, 글자 `#ececec`). `agy-b` 3.1절은 기본처럼 적었다 |
| `.v-boxcard` | 모서리 26 과 20, 테두리 1px `rgba(255,255,255,0.15)`, 배경 투명 | `ui.css:146` | 맞다 |
| `.v-header` | 높이 65 와 57, 아래 선 1px `rgba(255,255,255,0.1)`, 배경 검정 | `ui.css:31-32,39` | 맞다(64 와 56 에 선 1px) |
| `.v-headbtn` | 높이 44, 최소 폭 44, 14px, 안쪽 여백 0 14, 간격 8, 배경 `rgb(47,47,47)` | `ui.css:37` | 맞다 |
| `.v-input`(찾기 칸) | 높이 56, 모서리 19, 테두리 2px 투명, 왼쪽 여백 50 | `ui.css:96,106` | 맞다 |
| `.v-itemrow` | 최소 높이 72, 안쪽 여백 10 8, 간격 12 | `ui.css:367` | 맞다 |
| `.v-link` | 14px, 최소 높이 44, 글자 `rgb(205,205,205)` | `ui.css:68` | 맞다 |
| `.v-sheet` | 1280: 폭 480, 모서리 26. 390: 폭 390, 모서리 20 20 0 0, 아래 테두리 없음. 배경 검정. 글자 흰색 | `ui.css:119,126-127` | 모양은 맞다. 글자색은 아래 참고 |
| "보조 단추" | 44 x 44, 안쪽 여백 0 | 해당 없음 | 이것은 `.v-btn--quiet` 가 아니라 시트의 닫기 단추(`.v-sheet-close`)다. 선택자가 셋을 묶어 첫 번째로 잡힌 것을 쟀다. `.v-btn--quiet` 자체는 측정되지 않았다(hover 사진 AG-S-002 는 따로 있다) |
| `.v-card` | 찾지 못함 | `ui.css:81` | 측정 없음. 홈에는 이 부품이 없다 |
| `.v-footer` | 14px, 줄 높이 22.4, 위 여백 40 | `footer.css`(통합자가 열지 않음) | 전달 |

통합자가 측정에서 읽어 낸 것 둘:

- 측정된 테두리 색에 `rgb(229, 231, 235)` 가 섞여 있다(폭 0 인 변). Tailwind 의 기본 초기화가 새 화면에도 걸려 있다는 뜻이다(`globals.css:14-15` 의 `@tailwind`). 옮길 때 이 초기화가 빠지면 계산된 값이 달라진다.
- 시트의 기본 글자색이 흰색으로 측정됐다. `.v-app` 안의 요소는 `#ececec`(`ui.css:21`)인데, 로그인 시트는 `.v-app` 밖에 붙어(`app/[locale]/layout.tsx:77`) `body` 의 `text-white` 를 물려받는다. 짐작이 섞여 있다: 측정된 시트가 로그인 시트라는 것은 스크립트의 주석(`extract-primitives.mjs:110-116`)으로 미룬 것이다. 글자색을 스스로 정하는 부품(`.v-title`, `.v-desc`, `.v-line`)에는 영향이 없다.

`agy-b` 9절의 "토큰이 브라우저 실측에 100% 반영"은 부품 열하나와 폭 둘에 대한 말로 읽어야 한다.

## 8. 어긋난 곳과 판정

| id | 무엇이 어긋났나 | 판정과 근거 |
|---|---|---|
| D-U1 | 스크롤 막대. Claude: 어디에서도 그리지 않는다(`globals.css:47-52`). AGY(AGa-I-003, AG-TOK-052): 얇은 막대와 hover 색이 있다(`ui.css:10-14`) | 코드로 판정: 두 규칙이 모두 있다. `globals.css` 는 맨 위에서 `ui.css` 를 `@import` 하고 자기 규칙을 그 뒤에 두므로, 같은 무게의 `* { scrollbar-width: none }` 과 `*::-webkit-scrollbar { display: none }` 이 이긴다. 막대는 그려지지 않는다. Claude 가 맞다. `ui.css:10-14` 는 죽은 규칙이다. 통합자가 연 스크린샷 다섯 장에도 막대가 없다 |
| D-U2 | AG-S-009 의 대상. `agy-b` 5.1절: `.v-strip-item` 의 hover 와 focus. Claude: `v-strip-item` 은 쓰이지 않는 클래스 | 실행으로 판정: `states-result.json` 의 선택자는 `.v-strip-item, .v-itemrow` 이고, `v-strip` 을 쓰는 소스는 0건이다. 사진은 상품 행(`.v-itemrow`)의 것이다. 보고서 표의 선택자 칸이 틀렸다 |
| D-U3 | 메뉴의 이름과 파일. `agy-b` 4.1절: "모바일 메뉴 드로어", `AppHeader.tsx` | 코드로 판정: 옆에서 나오는 드로어가 아니라 다른 시트와 같은 `Sheet` 다(`AppShell.tsx:60`). `AppHeader.tsx` 라는 파일은 없다(`components/shell/` 에는 `AppFooter`, `AppShell`, `GuideFees`, `MovedScreen`, `StateScreens` 뿐). `overlays-result.json` 의 `codeCitation` 가운데 `AppHeader.tsx:64-70` 도 같은 잘못이다 |
| D-U4 | 충전 시트와 검증 시트에 닿는가. AGY(`overlays-result.json`): 일반 화면에서는 닿지 않고 갤러리에서만. Claude: 로그인한 화면에서 닿는다 | 코드와 화면으로 판정: 닿는다. 충전은 지갑과 열기 막대와 잔액 시트에서, 검증 시트는 개봉 결과, 보관함, 나온 상품, 검증 기록에서 열린다(Claude 의 스크린샷 `charge-sheet-mobile.png`, `verify-sheet-mobile.png`). AGY 도 계정을 심은 뒤에는 충전 시트를 열었다(`AG-I-003-charge-seeded-open.png`). 검증 시트는 AGY 가 시도하지 않았다. 배포 사이트의 갤러리는 "없는 주소"다 |
| D-U5 | 후기 시트. AGa-U-021: `ReviewSheet` 는 "작성 및 조회 시트" | 코드로 판정: 이름이 같은 것이 둘이다. 쓰기는 `flow/ReviewSheet.tsx`(U-129), 읽기는 `box/BoxReviews.tsx` 안의 `ReviewSheet`(U-115). Codex 가 CX-R-010 과 CX-R-014 에서 갈라 적었다 |
| D-U6 | 닿지 않는 파일의 수. Claude: 컴포넌트 71, `lib` 19, `uiStore`. Codex: 97 | 실행으로 판정: 통합자의 그래프는 97(컴포넌트 71, `lib` 22, `stores` 1, `server` 2, `src` 1). 차이 여섯은 타입으로만 불리는 `lib/auth.ts`, `lib/liveDrops.ts`, `lib/proofFeed.ts`(Claude 의 스크립트는 타입 import 를 닿는 것으로 셌다)와 Claude 가 훑지 않은 폴더의 `server/rng.ts`, `server/state.ts`, `src/data/gachaItems.ts` 다. 컴포넌트 71 은 셋이 같다 |
| D-U7 | 번호가 겹친다. `agy-a` 와 `agy-b` 가 AG-U-001 ~ 008, 010 ~ 013 과 AG-I-001 ~ 004 를 다른 뜻으로 썼다 | 이 문서에서는 `AGa-`, `AGb-` 로 갈랐다. 뒤의 문서도 그렇게 쓰는 것이 안전하다 |
| D-U8 | 화면 밖의 배너. Claude(CL-U-050): 화면 밖이면 멈춘다 | `ANIMATION_INVENTORY` D-A8: 단계 시계와 공의 프레임만 멈춘다 |

## 9. 번호 대응이 빠짐없는지

`CL-U-001` ~ `CL-U-215` 는 위의 표들의 CL 칸에 모두 있다. 합친 것: 014 는 U-007, 018 ~ 020 은 U-017, 023 ~ 025 는 U-020, 045 ~ 047 은 U-040, 200 은 U-060, 201 은 U-067, 202 는 U-035, 204 는 U-042, 205 는 U-114, 206 은 U-024, 207 은 U-036, 208 은 U-032, 209 는 U-031, 210 은 U-030, 211 은 U-105 와 U-106.

| 분석의 번호 | 이 문서의 자리 |
|---|---|
| CX-U-001(그래프의 방법) | 0.2절 |
| CX-U-002 ~ 013 | U-153 |
| CX-U-014 | U-145, U-148 |
| CX-U-015 | U-154 |
| CX-U-016 | 6절 표 아래 |
| CX-U-017(배너의 훅 순서) | U-043 의 CX 칸. 동작 결함이 아니라는 Codex 의 판단을 그대로 둔다 |
| CX-U-100 ~ 170 | U-153 |
| CX-U-171 ~ 196 | U-154 |
| CX-U-197 ~ 241 | 4절 |
| CX-F-060 ~ 070 | 6절의 직접 DOM 표 |
| AGa-U-001 ~ 005 | 5.1절 |
| AGa-U-010 ~ 024 | U-033, U-034, U-060, U-067, U-111, U-113, U-112, U-117, U-118, U-127, U-122, U-115 와 U-129, U-120, U-110, U-133 ~ U-136(차례대로) |
| AGa-U-030 ~ 036 | U-035, U-042, U-024, U-032, U-031, U-030, U-105 와 U-106 |
| AGa-I-001 ~ 004 | 7.1절 |
| AGb-I-001 ~ 008 | U-110, U-112, U-111, U-113, U-122, U-114, U-042 와 U-059, U-018 과 U-019 |
| AGb-U-001 ~ 008 | `ROUTE_INVENTORY.md` 7절(라우트의 대표 스크린샷) |
| AGb-U-010 ~ 013 | U-047, U-053, U-057, U-090 |
| AG-S-001 ~ 010 | U-021(001, 002), U-023(003), U-024(004), U-047(005), U-029(006), U-011(007), U-010(008), U-041(009), U-033(010) |
| AG-TOK-001 ~ 104 | 7.1절(옛 것은 U-155) |
| AG-FNT-001 ~ 007 | 7.1절, U-001 |
| AG-TX-001 ~ 010 | 7.2절과 각 U 줄 |
| `agy-a` 5.2절의 상태별 스타일 16묶음(번호 없음) | U-021(1, 2), U-023(3), U-024(4), U-011(5), U-010(6), U-025(7), U-033(8), U-047(9), U-036(10), U-027 과 U-041(11), U-117(12), U-120(13), `take.css` 의 행 링크(14: 통합자가 자리를 찾지 못했다), U-017(15), U-030(16) |

옮기지 않은 것과 까닭:

| 번호 | 까닭 |
|---|---|
| CX-U-400 ~ 737(338개) | 화면 요소가 아니다. 카탈로그를 만드는 원천 JSON 과 명세다(Codex 도 "미사용 UI 로 분류하지 않았다"고 적었다). `FEATURE_PARITY` 의 자료 쪽에서 다룬다 |
| AG-DIF-001 ~ 010 | 화면 비교 도구의 조건이다. `harness/README.md` 의 몫이다 |
| CX-I, CX-S, CX-F(060 ~ 070 밖), CL-I, CL-S | 인터랙션, 상태 전이, 기능의 번호다. 이 문서의 범위 밖이고, 요소의 근거로 쓴 것만 CX 칸에 적었다 |
| AG-A, AG-TL | `motion/ANIMATION_INVENTORY.md` |

## 10. 수

| 무엇 | 수 |
|---|---|
| 최종 번호(U-001 ~ U-156) | 156 |
| Layout 과 껍데기(1절) | 20 |
| Primitive(2절) | 22 |
| Page 별 요소(3절) | 67 (홈 6, 박스 11, 한 개 열기 7, 여러 개 열기 6, 보관함과 지갑과 출금과 나온 상품 16, 후기와 검증과 이용 방법과 계정과 약관 12, 상태 화면과 로그인 단계 9) |
| 숨은 화면(5절, U-110 ~ U-142) | 33. 화면 전체를 덮는 둘(U-060, U-067)은 3절의 번호를 다시 쓴다 |
| 그 가운데 시트 줄 | 20 (소스의 `Sheet` 23곳과 맞는다: U-133 이 두 곳을 맡고, 로그인 전 꼴 두 곳은 6절의 U-146 과 U-147 이 맡는다) |
| 그 가운데 확인창 | 8 (U-116, U-118, U-121, U-128, U-130, U-132, U-137, 그리고 U-136 안의 탈퇴 확인창. 소스의 `Confirm` 8곳과 맞는다) |
| 닿지 않는 것(6절, U-143 ~ U-156) | 14 |
| 닿는 컴포넌트 파일 | 45 |
| 닿지 않는 파일 | 97 (컴포넌트 71, 그 밖 26) |
| 합친 Claude 번호 | 215 개가 156 줄로 |
| 어긋난 곳 | 8 (D-U1 ~ D-U8), 모두 판정함 |
| 상태가 "확인 불가"이거나 일부가 그런 줄 | 23 (U-032, U-035, U-051, U-063, U-070, U-075, U-080, U-083, U-084, U-085, U-087, U-106, U-108, U-109, U-111, U-119, U-122, U-128, U-129, U-136, U-140, U-151, U-152) |
| 상태에 "전달"이 든 줄 | 70 (실행: 표의 마지막 칸을 셈). 그 가운데 줄 전체가 전달인 것(통합자가 소스도 화면도 다시 보지 않음)은 44 안팎이고, 나머지는 소스는 확인했으나 화면이 전달이다 |
| 상태에 "도달 불가"가 든 줄 | 10 (U-143 ~ U-150, U-152, U-153. U-147 은 U-146 과 같다고 적은 줄이다) |

## 11. 정하지 못한 것

- 받기를 끝까지 누른 뒤의 화면(U-119, U-063 의 받은 꼴, 보관함의 받은 것 탭). 세 분석 모두 확인창에서 멈췄다. 돈이 움직이는 자리라 시험 장부에서 따로 확인해야 한다.
- 출금의 확인, 인증, 신청함(U-083 ~ U-085), 배송 확인창(U-128), 후기 쓰기 시트(U-129), 탈퇴 확인창. 제출하지 않아 아무도 열지 않았다.
- 로그인 시트의 비밀번호, 인증, 다시 정하기, 완료 단계(U-108, U-109). 모두 심은 세션을 썼다.
- 충전 시트의 QR, 주소, 복사, 입금 확인 줄(U-111). 배포 사이트에서는 주소가 나오지 않았다.
- 세션 끝남 한 줄, 저장 공간 경고, 오류 화면, 자리 표시, 토스트. 조건을 만들지 못했다.
- 대표 사진이 없는 박스 21개의 화면(U-051 의 박스 그림).
- 개봉 장면 위에서 충전 시트를 열었을 때의 포커스와 `inert`.
- 닫힌 뒤 포커스가 돌아가는 자리. 코드로만 읽었다.
- 영어와 중국어의 숨은 화면. 라우트는 세 언어로 열렸으나 시트는 한국어로만 눌렀다(Claude). AGY 의 줄 수 비교는 겹침 화면을 포함하지 않는다.
- 768px 과 1024px 사이 폭의 배치. Claude 는 390 과 1280, AGY 는 한국어에서 768 을 찍었으나 통합자가 그 스크린샷을 열어 보지 않았다.
- 시트의 기본 글자색 차이(7.3절). 어느 시트가 `.v-app` 밖에 붙는지 전부 세지 않았다. 통합자가 확인한 것은 로그인 시트 하나다.
- `take.css` 의 행 링크(`.v-rowlink`, `agy-a` 5.2절 14번)가 어느 요소에 쓰이는지.
- 쓰이지 않는 문구와 CSS 의 수(U-155, U-156). Claude 의 스크립트 결과를 옮겼고 다시 돌리지 않았다.
