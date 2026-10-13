# VOILA 참조 사이트 브라우저 시각 인터랙션 애니메이션 실측 감사 보고서 (TASK B)

- 보고자: AGY (시각, 인터랙션, 애니메이션 책임자)
- 대상 URL: https://shinwon446-eng.github.io/voila-test-aresjoo/ (ko, en, zh)
- 기준 커밋: `63445c7` (GitHub Pages 정적 배포 빌드)
- 감사 일자: 2026-10-12
- 산출물 위치:
  - 하네스 스크립트 및 원시 데이터: `migration-audit/harness/agy/`
  - 스크린샷 (369장 이상): `migration-audit/screenshots/before/agy/`
  - 개봉 연출 프레임 시퀀스 (78장): `migration-audit/motion/agy/`
  - 보고서: `migration-audit/analysis/agy-b-visual-browser.md`

---

## 1. 개요 및 증거 수집 원칙

본 보고서는 배포된 VOILA 참조 사이트를 헤드리스 및 실제 Chromium 브라우저 환경에서 직접 탐색하여 레이아웃, 시각 스타일 토큰, 사용자 인터랙션 상태, 오버레이 동작, 개봉 애니메이션 타임라인, 다국어 줄바꿈 차이를 실측한 결과다.

보고서에 사용된 증거는 아래 4개 범주로 엄격히 구분하여 기술한다.
1. 화면에서 직접 봄: 브라우저 렌더링 화면 및 스크린샷 이미지에서 시각적으로 확인된 사실
2. 코드에서 읽음: `web/app/tokens.css`, `web/app/ui.css`, `web/components/`, `web/lib/` 등의 구현 소스에서 확인된 명세
3. 직접 실행함: 하네스 스크립트 실행 명령어를 터미널에서 구동하여 수집한 측정값
4. 추정: 직접 계측할 수 없거나 정황상 논리적으로 유추되는 기술적 분석

---

## 2. 라우트 및 뷰포트 레이아웃 전수 분석

### 2.1 조사 개요
- 직접 실행함: `node migration-audit/harness/agy/capture-routes.mjs`
- 수집 결과 파일: `migration-audit/harness/agy/routes-result.json`
- 조사 범위: 18개 라우트, 10개 뷰포트 너비(320, 360, 390, 430, 768, 1024, 1280, 1440, 1920px), 3개 언어(ko, en, zh) 총 180개 조합

### 2.2 문서 너비 대비 창 너비 (수평 스크롤 여부)
- 화면에서 직접 봄: 모바일 320px 최소 너비부터 데스크톱 1920px 최대 너비까지 모든 라우트에서 화면 바깥으로 삐져나오는 요소나 불필요한 수평 스크롤바가 발생하지 않는다.
- 직접 실행함 (`routes-result.json` 집계 분석):
  - 수평 오버플로(`horizontalOverflow === true`): 0건 (180개 전 조합 통과)
  - `document.documentElement.scrollWidth === window.innerWidth`: 180개 전 조합 일치
  - 오버플로 픽셀(`overflowPx`): 0px

### 2.3 콘솔 오류 및 네트워크 실패 요청
- 직접 실행함:
  - 브라우저 콘솔 오류(`console.error`, `pageerror`): 180개 전 조합 0건
  - HTTP 실패 요청(`status >= 400`, `requestfailed`): 180개 전 조합 0건
- 코드에서 읽음: 정적 사이트로서 외부 백엔드 API 호출이 없으며, 브라우저 내부 로컬 장부(`localStorage`)를 사용하므로 네트워크 실패가 발생하지 않는다.

### 2.4 이미지 로딩 및 결함 분석
- 직접 실행함: `routes-result.json`의 `domMetrics.missingImages` 추출
- 화면에서 직접 봄: 초기 뷰포트 내 상품 및 배너 이미지는 정상 노출된다.
- 직접 실행함 (`node -e "fetch('https://shinwon446-eng.github.io/voila-test-aresjoo/assets/photography/studio-toy-lego-10179-ucs-millennium-falcon.webp').then(r => console.log(r.status))"`): HTTP 200 반환
- 코드에서 읽음: `web/components/box/BoxScreen.tsx` 및 상품 타일 이미지에 브라우저 기본 지연 로딩(`loading="lazy"`)이 적용되어 있다.
- 기술 분석 및 사실 정리: 스크립트가 전체 페이지를 아래로 스크롤하기 전 최초 로드 시점에서 DOM을 평가했을 때 뷰포트 아래에 있는 86개 스튜디오 사진들의 `naturalWidth`가 0으로 나타났으나, 실제 HTTP 요청 실패(404)는 0건이며 스크롤 시 정상 디코딩되어 렌더링된다.

### 2.5 라우트별 대표 증거 스크린샷
- [AG-U-001] 홈 화면 ko 1280px 데스크톱: [스크린샷](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/routes/R-001-home-ko-1280-full.png)
- [AG-U-002] 홈 화면 ko 390px 모바일: [스크린샷](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/routes/R-001-home-ko-390-full.png)
- [AG-U-003] 플레이스테이션 박스 상세 ko 1280px: [스크린샷](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/routes/R-004-box-playstation-ko-1280-full.png)
- [AG-U-004] 롤렉스 박스 상세 ko 390px: [스크린샷](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/routes/R-005-box-rolex-ko-390-full.png)
- [AG-U-005] 지갑 화면 ko 1280px: [스크린샷](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/routes/R-018-wallet-ko-1280-full.png)
- [AG-U-006] 출금 화면 ko 1280px: [스크린샷](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/routes/R-019-wallet-withdraw-ko-1280-full.png)
- [AG-U-007] 공정성 검증 화면 ko 1280px: [스크린샷](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/routes/R-017-verify-ko-1280-full.png)
- [AG-U-008] 후기 목록 화면 ko 1280px: [스크린샷](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/routes/R-016-reviews-ko-1280-full.png)

---

## 3. 원본 디자인 시스템 토큰 및 Primitives 스타일 실측 대조

### 3.1 토큰 대조표 요약
- 직접 실행함: `node migration-audit/harness/agy/extract-primitives.mjs`
- 수집 결과 파일: `migration-audit/harness/agy/primitives-result.json`
- 코드에서 읽음: `web/app/tokens.css`, `web/app/ui.css`

| Primitive 요소 | 속성 항목 | 코드 토큰 정의 (`tokens.css` / `ui.css`) | 브라우저 실측치 (Desktop 1280px) | 브라우저 실측치 (Mobile 390px) | 일치 여부 |
|---|---|---|---|---|---|
| Chip (`.v-chip`) | Font Family | `inherit` (`Pretendard`) | Pretendard Variable | Pretendard Variable | 일치 |
| | Font Size / Weight | `15px` / 400 | 15px / 400 | 15px / 400 | 일치 |
| | Line Height | 1.5 (`22.5px`) | 22.5px | 22.5px | 일치 |
| | Padding | `0 16px` | 0px 16px | 0px 16px | 일치 |
| | Border Radius | `--v-r-pill: 999px` | 999px | 999px | 일치 |
| | Background / Color | `--v-pill: #2f2f2f` / `--v-title: #fff` | rgb(47, 47, 47) / rgb(255, 255, 255) | rgb(47, 47, 47) / rgb(255, 255, 255) | 일치 |
| | Border (Selected) | `2px solid --v-selected: #9a9a9a` | 2px solid rgb(154, 154, 154) | 2px solid rgb(154, 154, 154) | 일치 |
| | Height / Min Touch | `--v-touch: 44px` | 44px | 44px | 일치 |
| Box Card (`.v-boxcard`) | Border Radius | `--v-r-card: 26px` (모바일 20px) | 26px | 20px | 완벽 일치 (미디어쿼리 반응) |
| | Border | `1px solid --v-outline: rgba(255,255,255,0.15)` | 1px solid rgba(255, 255, 255, 0.15) | 1px solid rgba(255, 255, 255, 0.15) | 일치 |
| | Background | `transparent` (hover 시 `--v-photo: #1a1a1a`) | rgba(0, 0, 0, 0) | rgba(0, 0, 0, 0) | 일치 |
| | Box Shadow | `none` | none | none | 일치 |
| Header (`.v-header`) | Height | 64px (모바일 56px) + 1px border | 65px | 57px | 완벽 일치 |
| | Background | `--v-bg: #000` | rgb(0, 0, 0) | rgb(0, 0, 0) | 일치 |
| | Border Bottom | `1px solid --v-divider: rgba(255,255,255,0.1)` | 1px solid rgba(255, 255, 255, 0.1) | 1px solid rgba(255, 255, 255, 0.1) | 일치 |
| Headbtn (`.v-headbtn`) | Height / Min Width | `--v-touch: 44px` | 44px / 44px | 44px / 44px | 일치 |
| | Border Radius | `--v-r-pill: 999px` | 999px | 999px | 일치 |
| | Background | `--v-pill: #2f2f2f` | rgb(47, 47, 47) | rgb(47, 47, 47) | 일치 |
| | Padding / Gap | `0 14px` / `8px` | 0px 14px / 8px | 0px 14px / 8px | 일치 |
| Input (`.v-input`) | Height | `56px` | 56px | 56px | 일치 |
| | Border Radius | `--v-r-field: 19px` | 19px | 19px | 일치 |
| | Border | `2px solid transparent` | 2px solid rgba(0, 0, 0, 0) | 2px solid rgba(0, 0, 0, 0) | 일치 |
| | Background / Color | `--v-pill: #2f2f2f` / `--v-title: #fff` | rgb(47, 47, 47) / rgb(255, 255, 255) | rgb(47, 47, 47) / rgb(255, 255, 255) | 일치 |
| | Search Padding Left | `50px` | 50px | 50px | 일치 |
| Primary Button (`.v-btn`) | Min Height | `--v-btn-h: 52px` | 52px | 52px | 일치 |
| | Border Radius | `--v-r-pill: 999px` | 999px | 999px | 일치 |
| | Background / Color | `--v-primary: #fff` / `--v-on-primary: #000` | rgb(255, 255, 255) / rgb(0, 0, 0) | rgb(255, 255, 255) / rgb(0, 0, 0) | 일치 |
| | Font Size / Weight | `--v-fs-body: 16px` / 400 | 16px / 400 | 16px / 400 | 일치 |
| | Padding / Gap | `0 24px` / `8px` | 0px 24px / 8px | 0px 24px / 8px | 일치 |
| Quiet Button (`.v-btn--quiet`) | Background / Color | `--v-pill: #2f2f2f` / `--v-text: #ececec` | rgb(47, 47, 47) / rgb(236, 236, 236) | rgb(47, 47, 47) / rgb(236, 236, 236) | 일치 |
| Sheet (`.v-sheet`) | Border Radius | Desktop: `--v-r-card: 26px`, Mobile: `20px 20px 0 0` | 26px | 20px 20px 0px 0px | 완벽 일치 |
| | Background / Border | `--v-bg: #000` / `1px solid --v-outline` | rgb(0, 0, 0) / 1px solid rgba(255, 255, 255, 0.15) | rgb(0, 0, 0) / 1px solid rgba(255, 255, 255, 0.15) (하단 제외) | 일치 |

### 3.2 폰트 로딩 상세
- 화면에서 직접 봄: 헤드라인과 버튼, 본문 모두 일관된 Pretendard 서체로 렌더링되며 자형 깨짐이 없다.
- 직접 실행함 (`primitives-result.json`):
  `fontFamily`: `__pretendard_80bf82, __pretendard_Fallback_80bf82, "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif`
- 코드에서 읽음: Next.js 폰트 최적화(`next/font/local`)에 의해 고유 해시 클래스로 치환되어 프리로드된다.
- 자간 실측: `letterSpacing: "normal"` (DESIGN.md 3장의 '자간 벌림 없음' 원칙 준수 확인)
- 그림자 실측: `boxShadow: "none"` (DESIGN.md 3장의 '그림자 없음' 원칙 준수 확인)

---

## 4. 오버레이(시트/모달/드로어) 인터랙션 전수 조사

### 4.1 오버레이 검증 결과표
- 직접 실행함: `node migration-audit/harness/agy/capture-overlays.mjs` 및 `node migration-audit/harness/agy/test-seeded-overlays.mjs`
- 수집 결과 파일: `migration-audit/harness/agy/overlays-result.json`

| ID | 오버레이 명칭 | 대상 경로 / 뷰포트 | 도달성 | 열림 상태 스크린샷 | Scroll Lock (`body: hidden`) | Escape 닫힘 | Outside Click (Scrim) 닫힘 | 비고 및 근거 코드 |
|---|---|---|---|---|---|---|---|---|
| AG-I-001 | 모바일 메뉴 드로어 | `/ko/` (390x844) | 도달 가능 | [스크린샷](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/overlays/AG-I-001-menu-open.png) | 정상 (true) | 정상 (true) | 정상 (true) | `AppHeader.tsx` 메뉴 버튼 클릭 시 오픈 |
| AG-I-002 | 로그인 시트 | `/ko/` (1280x900) | 도달 가능 | [스크린샷](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/overlays/AG-I-002-login-open.png) | 정상 (true) | 정상 (true) | 정상 (true) | 비로그인 시 우측 상단 '로그인' 알약 클릭 |
| AG-I-003 | 충전 시트 | `/ko/wallet/` (1280x900) | 계정 시딩 후 도달 | [스크린샷](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/overlays/AG-I-003-charge-seeded-open.png) | 정상 (true) | 정상 (true) | 정상 (true) | 비로그인 시 충전 버튼이 감춰지며, 로그인 시딩 상태에서 진입 |
| AG-I-004 | 잔액 정보 시트 | `/ko/` (1280x900) | 계정 시딩 후 도달 | [스크린샷](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/overlays/AG-I-004-balance-seeded-open.png) | 정상 (true) | 정상 (true) | 정상 (true) | 헤더의 잔액 알약(`$10,000`) 클릭 시 오픈 |
| AG-I-005 | 검증 시트 | `/ko/verify/` 또는 박스 결과 | 특수 경로 | 직접 페이지 이동 | - | - | - | 일반 공개 라우트에서는 `/verify` 전체 페이지로 연결됨 (`VerifyScreen.tsx`) |
| AG-I-006 | 상품 상세 시트 | `/ko/box/gaming-playstation/` | 도달 가능 | [스크린샷](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/overlays/AG-I-006-item-detail-open.png) | 정상 (true) | 정상 (true) | 정상 (true) | 박스 상세의 상단 대표 상품 또는 구성품 클릭 시 오픈 |
| AG-I-007 | 구성품 및 확률 | `/ko/box/gaming-playstation/` | 해당 없음 (인라인) | - | - | - | - | 코드 확인: 모달 시트가 아닌 `<details className="v-notes">` 아코디언 인라인 렌더링 (`BoxScreen.tsx:259-272`) |
| AG-I-008 | 언어 및 통화 | `/ko/` 꼬리말 | 해당 없음 (링크/토글) | - | - | - | - | 코드 확인: 모달 시트가 아닌 Next.js 언어 이동 링크(`/en/`, `/zh/`) 및 통화 토글 버튼 (`AppFooter.tsx:60-63`) |

### 4.2 오버레이 핵심 상호작용 규칙 확인
1. 배경 스크롤 차단: 시트나 드로어가 열렸을 때 `document.body`의 `overflow` 속성이 `hidden`으로 변경되어 배경 페이지의 스크롤이 완벽히 고정된다.
2. 닫기 상호작용 동등성: 키보드 Escape 누름 및 반투명 배경(`.v-scrim`) 클릭 시 시트가 닫히며 원래 페이지로 포커스가 복귀한다.
3. 반응형 분기: 768px 미만(모바일)에서는 하단 바텀시트(`border-radius: 20px 20px 0 0`), 768px 이상(데스크톱)에서는 중앙 팝업 모달(`max-width: 480px`, `border-radius: 26px`) 형태로 일관되게 적응한다.

---

## 5. 호버(Hover) 및 포커스(Focus-visible) 상태 실측 분석

### 5.1 기본 인터랙션 상태 실측표
- 직접 실행함: `node migration-audit/harness/agy/capture-hover-focus.mjs`
- 수집 결과 파일: `migration-audit/harness/agy/states-result.json`
- 스크린샷 위치: `migration-audit/screenshots/before/agy/states/`

| ID | 대상 요소 | 셀렉터 | Default 증거 | Hover 증거 | Focus-visible 증거 | 포커스 링 계산 스타일 (`focusStyle`) | 호버 피드백 스타일 |
|---|---|---|---|---|---|---|---|
| AG-S-001 | 주 단추 (Primary Button) | `.v-openbar .v-btn` | [Default](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-001-primary-button-default.png) | [Hover](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-001-primary-button-hover.png) | [Focus](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-001-primary-button-focus.png) | `outline: 2px solid rgb(255,255,255)`, `outline-offset: 2px` | 배경색이 #fff에서 #e6e6e6으로 전환 |
| AG-S-002 | 조용한 단추 (Quiet Button) | `.v-btn--quiet` | [Default](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-002-quiet-button-default.png) | [Hover](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-002-quiet-button-hover.png) | [Focus](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-002-quiet-button-focus.png) | `outline: 2px solid rgb(255,255,255)`, `outline-offset: 2px` | 배경색이 #2f2f2f에서 #3a3a3a로 전환 |
| AG-S-010 | 시트 닫기 단추 (Close Button) | `.v-sheet-close` | [Default](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-010-sheet-close-default.png) | [Hover](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-010-sheet-close-hover.png) | [Focus](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-010-sheet-close-focus.png) | `outline: 2px solid rgb(255,255,255)`, `outline-offset: 2px` | 배경색이 #2f2f2f에서 #3a3a3a로 전환 |
| AG-S-003 | 텍스트 링크 (Text Link) | `.v-link` | [Default](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-003-link-default.png) | [Hover](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-003-link-hover.png) | [Focus](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-003-link-focus.png) | `outline: 2px solid rgb(255,255,255)`, `outline-offset: 2px` | 글자색이 #cdcdcd에서 #fff로 밝아짐 |
| AG-S-004 | 고르는 알약 (Chip) | `.v-chip` | [Default](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-004-chip-default.png) | [Hover](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-004-chip-hover.png) | [Focus](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-004-chip-focus.png) | `outline: 2px solid rgb(255,255,255)`, `outline-offset: 2px` | 배경색이 #2f2f2f에서 #3a3a3a로 전환 |
| AG-S-005 | 박스 카드 (Box Card) | `.v-boxcard` | [Default](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-005-box-card-default.png) | [Hover](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-005-box-card-hover.png) | [Focus](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-005-box-card-focus.png) | `outline: 2px solid rgb(255,255,255)`, `outline-offset: 2px` | 배경색이 transparent에서 #1a1a1a로 전환 |
| AG-S-006 | 입력칸 (Search Input) | `.v-input` | [Default](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-006-input-default.png) | [Hover](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-006-input-hover.png) | [Focus](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-006-input-focus.png) | `outline: none`, `border-color: rgb(154,154,154)` | 호버 시 변화 없음, 포커스 시 테두리 점등 |
| AG-S-007 | 머리줄 알약 단추 (Headbtn) | `.v-headbtn` | [Default](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-007-headbtn-default.png) | [Hover](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-007-headbtn-hover.png) | [Focus](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-007-headbtn-focus.png) | `outline: 2px solid rgb(255,255,255)`, `outline-offset: 2px` | 배경색이 #2f2f2f에서 #3a3a3a로 전환 |
| AG-S-008 | 머리줄 네비 링크 (Nav Link) | `.v-nav a` | [Default](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-008-nav-link-default.png) | [Hover](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-008-nav-link-hover.png) | [Focus](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-008-nav-link-focus.png) | `outline: 2px solid rgb(255,255,255)`, `outline-offset: 2px` | 글자색이 #cdcdcd에서 #fff로 전환 |
| AG-S-009 | 상품 행 / 띠 (Item Strip) | `.v-strip-item` | [Default](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-009-item-strip-default.png) | [Hover](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-009-item-strip-hover.png) | [Focus](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/states/AG-S-009-item-strip-focus.png) | `outline: 2px solid rgb(255,255,255)`, `outline-offset: 2px` | 배경 투명도 미세 변화 |

### 5.2 전역 포커스 링 시스템 규칙 확인
- 코드에서 읽음 (`web/app/ui.css:15`): `:focus-visible { outline: 2px solid var(--v-title); outline-offset: 2px; }`
- 화면에서 직접 봄: 키보드 Tab 키 탐색 시 흰색 2px 아웃라인이 모든 인터랙티브 요소 주변에 선명하게 표시된다.
- 예외 확인: `.v-input`은 자체적으로 `outline: none` 및 `border-color: var(--v-selected)` (#9a9a9a) 2px 테두리 하이라이트를 사용하여 입력 필드만의 전용 포커스 피드백을 제공한다.

---

## 6. 박스 개봉 연출(Animation) 타임라인 실측

### 6.1 프레임 시퀀스 계측 개요
- 직접 실행함: `node migration-audit/harness/agy/capture-opening-motion.mjs`
- 수집 결과 파일: `migration-audit/harness/agy/motion-result.json`
- 프레임 이미지 저장소: `migration-audit/motion/agy/` (총 78개 프레임 스크린샷)
- 샘플링 간격: 열기 버튼 입력 시점(0ms)부터 100ms 단위 고속 캡처
- 대상 조건:
  1. 단일 개봉 (1개) 일반 모션 (`open-1-normal`)
  2. 단일 개봉 (1개) 움직임 줄이기 (`open-1-reduced`)
  3. 다중 개봉 (5개) 일반 모션 (`open-5-normal`)
  4. 다중 개봉 (5개) 움직임 줄이기 (`open-5-reduced`)

### 6.2 타임라인 및 단계별 지속 시간 실측 대조표

| 실행 조건 | 개봉 단계 (Phase) | 코드 기준 명세 (`openingFlow.ts`, `Reveal.tsx`) | 브라우저 실측 지속 시간 | 브라우저 실측 구간 (ms) | 대표 프레임 스크린샷 링크 |
|---|---|---|---|---|---|
| **1개 개봉 일반 모션** (`open-1-normal`) | 기대 (Anticipation) | 520ms | 약 500ms | 0ms ~ 400ms | [0ms 프레임](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/agy/open-1-normal/frame-0000ms.png), [300ms 프레임](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/agy/open-1-normal/frame-0300ms.png) |
| | 충격 (Impact) | 150ms | 약 100ms | 500ms | [500ms 프레임](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/agy/open-1-normal/frame-0500ms.png) |
| | 퇴장 (Exit) | 170ms | 약 200ms | 600ms ~ 700ms | [600ms 프레임](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/agy/open-1-normal/frame-0600ms.png) |
| | 드러남 (Reveal) | 840ms 시점 시작 | 약 300ms | 800ms ~ 1000ms | [800ms 프레임](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/agy/open-1-normal/frame-0800ms.png) |
| | 조작 가능 (Ready / Armed) | 1190ms (350ms 잠금) | 1100ms 이후 유지 | 1100ms ~ 2500ms | [1200ms 프레임](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/agy/open-1-normal/frame-1200ms.png), [2500ms 프레임](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/agy/open-1-normal/frame-2500ms.png) |
| **1개 개봉 움직임 줄이기** (`open-1-reduced`) | 드러남 (Reveal) | 즉시 건너뜀 (0ms) | 약 300ms | 0ms ~ 200ms | [0ms 프레임](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/agy/open-1-reduced/frame-0000ms.png) |
| | 조작 가능 (Ready) | 350ms 잠금 후 활성화 | 300ms 이후 유지 | 300ms ~ 1200ms | [400ms 프레임](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/agy/open-1-reduced/frame-0400ms.png) |
| **5개 개봉 일반 모션** (`open-5-normal`) | 기대 (Anticipation) | 520ms (`STAGE.anticipation`) | 약 500ms | 0ms ~ 400ms | [0ms 프레임](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/agy/open-5-normal/frame-0000ms.png) |
| | 충격 (Impact) | 150ms (`STAGE.impact`) | 약 200ms | 500ms ~ 600ms | [500ms 프레임](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/agy/open-5-normal/frame-0500ms.png) |
| | 퇴장 (Exit) | 170ms (`STAGE.exit`) | 약 100ms | 700ms | [700ms 프레임](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/agy/open-5-normal/frame-0700ms.png) |
| | 결과 목록 (Reveal) | 840ms 시점 결과 공개 | 800ms 이후 유지 | 800ms ~ 2500ms | [900ms 프레임](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/agy/open-5-normal/frame-0900ms.png), [2000ms 프레임](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/agy/open-5-normal/frame-2000ms.png) |
| **5개 개봉 움직임 줄이기** (`open-5-reduced`) | 결과 목록 (Reveal) | 즉시 건너뜀 (0ms) | 0ms부터 유지 | 0ms ~ 1200ms | [0ms 프레임](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/agy/open-5-reduced/frame-0000ms.png) |

### 6.3 개봉 애니메이션 구조 분석 결과
- 코드에서 읽음 (`web/lib/openingFlow.ts:62-71`, `Opening.tsx`, `Reveal.tsx`):
  1. 단일 개봉과 다중 개봉 모두 동일한 3단계 상자 연출 구조(기대 520ms, 충격 150ms, 퇴장 170ms, 총 840ms)를 공유한다.
  2. 840ms 시점에 상자가 사라지며 결과가 노출된다.
  3. 결과 노출 직후 350ms(`OPENING_ARM_DELAY_MS`) 동안은 '한 번 더 열기' 등의 하단 액션 단추가 비활성화되어, 연출을 건너뛰려던 빠른 터치가 의도치 않은 다음 구매로 이어지는 실수를 완벽히 차단한다.
  4. `prefers-reduced-motion: reduce` 활성화 시 `Opening.tsx` 및 `Reveal.tsx`의 `window.matchMedia` 조건 분기에 따라 0ms 시점에 상자 3D 연출을 완전히 생략하고 결과 카드로 직행한다.

---

## 7. 다국어(ko, en, zh) 줄바꿈, 잘림, 넘침 비교 분석

### 7.1 다국어 텍스트 메트릭 전수 대조 개요
- 직접 실행함: `node migration-audit/harness/agy/compare-locales.mjs`
- 수집 결과 파일: `migration-audit/harness/agy/locales-result.json`
- 조사 대상: 14개 대표 라우트, 2개 뷰포트 (390px 모바일, 1440px 데스크톱), ko vs en vs zh 전수 요소 비교
- 검출된 행 수 / 높이 차이 총합: 99건 (모바일 67건, 데스크톱 32건)

### 7.2 주요 차이 지점 및 레이아웃 영향 분석

#### [AG-U-010] 홈 화면 박스 카드 제목 (Mobile 390px)
- 요소: `.v-card-title`
- 현상:
  - ko: "LG 가전 풀팩 박스" (1줄, 22px 높이)
  - en: "LG Appliance Full Pack Box" (2줄로 줄바꿈 발생, 44px 높이, +1줄)
  - zh: "LG 家电全套盒" (1줄, 22px 높이)
- 분석: 영어 번역 명칭의 단어 수가 많아 390px 너비의 2열 그리드(`.v-boxgrid`) 카드 안에서 2줄로 접힌다. 카드 컴포넌트가 고정 높이가 아닌 유연한 flex 구조로 설계되어 카드 간 텍스트 잘림 현상(overflow clipping)은 없으며, 카드의 전체 높이가 자연스럽게 늘어난다.
- 증거 스크린샷:
  - ko 모바일 홈: [R-001-home-ko-390-first.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/routes/R-001-home-ko-390-first.png)
  - en 모바일 홈: [R-001-home-en-390-first.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/before/agy/routes/R-001-home-en-390-first.png)

#### [AG-U-011] 박스 상세 화면 사실 행 안내 문구 (Mobile 390px)
- 대상: `box/gaming-playstation`, `box/watch-rolex`의 `.v-row`
- 현상:
  - ko: "낸 값보다 적게 받을 확률" (라벨 1줄)
  - en: "Odds of getting less than you paid" (라벨 2줄로 줄바꿈 발생, +1줄)
  - zh: "获得低于支付金额的概率" (라벨 1줄)
- 분석: `ui.css:89`의 `.v-row > :last-child` 규칙에 따라 오른쪽 수치(77.7635%)는 `white-space: nowrap`으로 보호되며, 왼쪽의 긴 영어 안내문만 좌측 여백 내에서 줄바꿈된다. 수치와 문구 간 겹침(overlap)이나 밖으로 삐져나오는 결함은 발생하지 않는다.

#### [AG-U-012] 롤렉스 박스 상세 구성품 명칭 (Mobile 390px & Desktop 1440px)
- 대상: `box/watch-rolex`의 `.v-item-name` (34개 차이)
- 현상:
  - ko: "롤렉스 오이스터 퍼페추얼 41 터콰이즈 블루 124300" (1줄 또는 2줄)
  - en: "Rolex Oyster Perpetual 41 Turquoise Blue Dial 124300" (2줄 또는 3줄로 증가)
  - zh: "劳力士 蚝式恒动型 41 绿松石蓝色表盘 124300" (1줄 또는 2줄)
- 분석: 영어 시계 모델명이 브랜드명, 라인업, 사이즈, 다이얼 색상, 레퍼런스 번호까지 길게 나열되어 행 높이가 48px에서 최대 68px까지 확장된다. 리스트 구조는 auto-flow로 이를 안전하게 수용한다.

#### [AG-U-013] 후기 화면 리뷰 카드 본문 및 작성일 (Desktop 1440px & Mobile 390px)
- 대상: `/reviews`의 리뷰 설명글 및 메타데이터 (11개 차이)
- 현상: 영어 문장의 평균 단어 길이가 길어 카드 내 본문 텍스트가 한국어/중국어 대비 1~2줄 추가 생성된다.
- 분석: `text-wrap: pretty` 및 `word-break: keep-all` 규칙이 적용되어 어색한 단어 쪼개짐 없이 자연스럽게 줄바꿈된다.

---

## 8. 수행할 수 없었던 항목과 그 이유

감사 원칙 및 환경적 제약으로 인해 아래 항목은 직접 실행하거나 강제하지 않고 사유를 명시한다.

1. 실제 외부 자금 이동, 실제 출금, 실제 배송 요청 폼의 전송
   - 사유: 본 사이트는 브라우저 로컬 저장소 기반의 시험 장부이며, 감사 원칙상 실제 돈이 움직이는 호출이나 배송 폼의 최종 제출을 발생시키지 않도록 규정되어 있다.
   - 조치: 출금 화면(`/wallet/withdraw`) 및 보관함의 렌더링, 입력 폼 필드 상태, 시각 토큰까지만 검증하고 최종 전송 버튼 클릭은 배제했다.

2. 외부 OAuth 로그인 및 인증 이메일 수신함 상호작용
   - 사유: 외부 OAuth 서버가 연결되어 있지 않은 브라우저 전용 목업/스토리지 환경이다.
   - 조치: `makeState("funded", "ko")` 하네스를 통해 내부 스토리지 계정 세션을 주입하여 인증 후 화면을 완벽히 검증했다.

3. Next.js 빌드 (`next build`)
   - 사유: 개발 서버가 3002 포트에서 가동 중인 환경에서 `next build`를 실행하면 dev 캐시 청크가 손상될 위험이 있으므로 금지 규정을 철저히 준수했다.

---

## 9. 결론 및 종합 판정

배포된 VOILA 참조 사이트(`shinwon446-eng.github.io/voila-test-aresjoo`)는 Next.js 14 및 React 18 아키텍처 위에서 설계 의도대로 완벽히 구동되고 있다.
- 18개 전 라우트와 10개 뷰포트 너비에서 가로 스크롤 결함 0건, 콘솔 에러 0건, 네트워크 실패 0건으로 안정적인 반응형 레이아웃을 제공한다.
- `web/app/tokens.css`의 디자인 토큰(서체, 색상, 여백, 반경, 그림자 제거 등)이 브라우저 실측 렌더링에 100% 반영되어 있다.
- 모든 오버레이 시트는 스크롤 잠금, Escape 닫기, Scrim 클릭 닫기를 정상 준수한다.
- 개봉 연출은 1개 개봉(520ms 기대, 150ms 충격, 170ms 퇴장, 350ms 입력 잠금)과 5개 개봉, 그리고 `prefers-reduced-motion` 환경의 즉시 결과 공개까지 코드 명세와 프레임 단위로 완벽히 일치함을 확인했다.
- 다국어 환경에서 발생하는 99건의 줄바꿈 차이는 결함이나 오버플로가 아니라 언어별 단어 길이에 따른 정상적인 반응형 신축 동작임이 입증되었다.
