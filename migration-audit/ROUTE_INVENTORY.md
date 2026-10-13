# ROUTE_INVENTORY: 라우트 최종 목록

기준 커밋 `63445c7`, 브랜치 `migration-audit`. 통합일 2026-10-12.
세 분석(Codex `CX-`, Claude `CL-`, Antigravity `AG`)을 대조해 하나로 묶었다. `web/` 아래는 고치지 않았고 빌드도 돌리지 않았다.

## 0. 읽는 법

### 0.1 쓴 자료

| 자료 | 쓴 곳 |
|---|---|
| `analysis/codex-a-routes-events-state.md` 1절, 2절, 9절 | 라우트 표 `CX-R-001` ~ `CX-R-024`, import 그래프 |
| `analysis/claude-a-routes.md` | `CL-R-001` ~ `CL-R-024`, 배포 사이트 HTTP 1,111건과 Chrome 열람 |
| `analysis/agy-b-visual-browser.md` 2절, `harness/agy/routes-result.json` | 배포 사이트 180 조합의 상태 코드, 넘침, 콘솔 오류, 스크린샷 360장 |
| `analysis/agy-a-visual-source.md` | 라우트 번호 없음(시각 전용). 여기서는 쓰지 않았다 |

Antigravity 브라우저 보고서(`agy-b-visual-browser.md`)는 통합을 시작할 때 있었다(21:17 기록, 31KB). 그 보고서는 라우트에 `AG-` 번호를 붙이지 않고 측정 파일 안의 `R-001` ~ `R-020` 을 쓴다. 이 문서의 최종 번호와 겹치므로 아래에서는 "AG 측정 R-0xx" 라고 적는다.

### 0.2 증거의 말

| 표시 | 뜻 |
|---|---|
| 코드 | 통합자가 기준 커밋의 소스를 직접 열어 읽은 것 |
| 화면 | 통합자가 스크린샷 파일을 직접 열어 본 것(누가 찍었는지 함께 적는다) |
| 실행 | 통합자가 직접 돌린 명령과 그 결과 |
| 전달 | 세 분석 가운데 누가 그렇게 적었으나 통합자가 다시 확인하지 않은 것 |
| 짐작 | 확인하지 못하고 미루어 본 것 |

통합자가 직접 돌린 것:

| 무엇 | 명령 | 결과 |
|---|---|---|
| import 그래프 | `node harness/consolidate/graph.mjs web dead` (통합자가 새로 쓴 스크립트, 진입점은 `web/app` 의 ts와 tsx 전부와 `i18n/request.ts`, 타입 전용 import 는 뺌) | TS와 TSX 247개, 닿음 150, 닿지 않음 97. 라우트 진입 파일 25개 |
| 정적 산출물 세기 | `find C:/Users/hyun1/dev/VOILA-audit-before/web/out -name "*.html"` (총괄이 만든 기준 빌드, 그 폴더의 HEAD 는 `63445c7`) | HTML 1,092개. 언어마다 363개(박스 334, 약관 폴더 14, 나머지 15) |
| 배포 사이트 요청 18건 | `MSYS_NO_PATHCONV=1 curl -s -o /dev/null -w "%{http_code}"` | 아래 4절 |
| 빌드 기록 읽기 | `logs/build-before.log` | "Generating static pages (1094/1094)", 라우트 표에 `[locale]` 아래 18줄 |
| AGY 측정 파일 다시 세기 | `node harness/consolidate/agy-sum2.mjs` | 180행, 라우트 항목 20, 폭과 언어의 실제 분포(6절 D-R2) |

### 0.3 검증 상태(BRIEF 3절)

확인됨: 코드와 배포 화면이 같은 말을 한다. 어긋남: 세 분석 또는 코드와 화면이 서로 다르다(6절에 판정). 확인 불가: 화면에서 띄우지 못했다. 도달 불가: 배포 사이트의 사용자 흐름으로 닿지 않는다.

## 1. 공통 사실

| 항목 | 내용 | 출처 번호 | 근거 |
|---|---|---|---|
| 내보내기 | 정적 내보내기. `basePath` 는 `/voila-test-aresjoo`, `trailingSlash: true`. 미들웨어 없음 | CL 2절, CX-R-023 | 코드: `next.config.mjs:19-23`, `i18n/routing.ts:4`(주석) |
| 언어 | `ko`, `en`, `zh`. 접두어는 늘 붙는다(`localePrefix: "always"`). 기본값 `ko` | CL 1절, CX-R-019 | 코드: `i18n/routing.ts:7,10-14` |
| 목록 밖의 값 | `[locale]`, `box/[slug]`, `legal/[doc]` 모두 `dynamicParams = false` | CL 2절, CX-R-023 | 코드: `app/[locale]/layout.tsx:17`, `box/[slug]/page.tsx:11`, `legal/[doc]/page.tsx:11` |
| 공통 껍데기 | 루트 레이아웃(`CurrencyHydrator`) → 언어 레이아웃(`NextIntlClientProvider` → `MotionPreferences` → `LocaleHtmlLang`, 화면, `AppFooter`, `AuthHost`, `LabBadge`). 화면마다 `AppShell` | CX-R-019, CL 2절 | 코드: `app/layout.tsx:43-54`, `app/[locale]/layout.tsx:67-80` |
| 로그인 가드 | 라우트 수준의 가드는 없다. 어느 주소든 로그인 전에 열리고, 화면 안에서 한 줄과 로그인 단추로 바뀐다 | CL 2절, CX-R-022 | 전달(두 분석이 같은 말). 코드: `app` 에 리다이렉트 코드 없음(실행: 닿는 파일에 `useRouter`, `redirect` 호출 없음) |
| `html lang` | 정적 HTML 은 늘 `lang="ko"`. 뜬 뒤 `LocaleHtmlLang` 이 `ko`, `en`, `zh-Hans` 로 바꾼다 | CX-R-021, CL 2절 | 코드: `app/layout.tsx:45`. 실행: 배포된 `/en/guide/` 의 HTML 이 `<html lang="ko" ...>` |
| canonical 과 검색 | canonical 은 그 화면이 아니라 그 언어의 홈. `robots` 는 `noindex, nofollow` | CL 2절 | 코드: `app/[locale]/layout.tsx:37-40`. 실행: `/en/guide/` 의 canonical 이 `.../en/` |
| 저장소 분리 | `head` 의 인라인 스크립트가 `Storage.prototype` 을 감싸 키 앞에 `voila-test-aresjoo:` 를 붙인다 | CX-R-021, CL-U-002 | 코드: `app/layout.tsx:48` |
| 첫 방문 지급 | 세션을 복원한 뒤 `AuthHost` 가 보너스 10,000 과 무료 개봉 2회를 한 번 지급한다(주소를 여는 것만으로는 구매나 입금이 생기지 않는다) | CX-R-022, CL 7장 | 전달. 돈에 닿는 사실이라 `FEATURE_PARITY` 에서 다시 본다 |

## 2. 라우트 표

`{l}` 은 `ko`, `en`, `zh`. 주소 앞의 `/voila-test-aresjoo` 는 줄였다. 파일 경로는 `web/` 아래다. 스크린샷 경로는 `migration-audit/` 아래다. "정적 수"는 세 언어를 합친 HTML 파일 수(실행: 산출물 세기).

| id | 주소 | 파일 | 맨 위 컴포넌트 | 화면에서 닿는 길 | 정적 수 | 잘못된 값 | CX | CL | AG 측정 | 일치 | 근거 | 상태 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| R-001 | `/` | `app/page.tsx` | `RootRedirect`(인라인 스크립트와 `meta refresh`) | 없음. 주소로만 | 1 | 저장값이 세 언어가 아니면 브라우저 언어, 예외면 `./en/`, 스크립트가 꺼지면 `./ko/` | CX-R-020 | CL-R-001 | 없음 | CX와 CL 일치, AG 는 보지 않음 | 코드: `app/page.tsx:7-18`. 실행: 200, HTML 에 `meta refresh 0; url=./ko/` 와 `location.replace` | 확인됨(영어, 중국어 브라우저와 스크립트 꺼짐은 확인 불가) |
| R-002 | `/{l}/` | `app/[locale]/page.tsx:8` | `AppShell wide` → `BoxList`(`components/box/BoxList.tsx:42`) | 로고, 머리줄 메뉴, 메뉴 시트, 꼬리말, 뒤로 가기, 옮긴 화면, 없는 주소 화면, 빈 상태 단추 | 3 | 주소 값을 읽지 않는다(`?skin=` 은 죽은 값) | CX-R-001 | CL-R-002 | R-001 | 셋 일치 | 코드. 실행: 200 x 3. 스크린샷: `screenshots/before/agy/routes/R-001-home-ko-1280-full.png`, `screenshots/before/claude-a/home-guest-mobile.png` | 확인됨 |
| R-003 | `/{l}/box/{slug}/` | `app/[locale]/box/[slug]/page.tsx:8-18` | `AppShell wide` → `BoxScreen`(`components/box/BoxScreen.tsx:54`) | 3절의 묶음마다 다르다 | 1,002 (334 x 3) | 없는 slug 는 빌드되지 않는다. 배포 사이트는 `404.html` 을 404 로 준다. `/{l}/box/` 도 404 | CX-R-004, CX-F-012 | CL-R-003 | R-004, R-005, R-006 | 셋 일치(AG 는 세 slug 만) | 코드. 실행: 산출물에 언어마다 `box` 아래 334개, `/ko/box/no-such-box/` 404, `/ko/box/` 404. 스크린샷: `screenshots/before/agy/routes/R-006-box-charizard-ko-1280-full.png`, `screenshots/before/claude-a/box-pokemon-charizard-guest-desktop.png` | 확인됨 |
| R-004 | `/{l}/inventory/` | `app/[locale]/inventory/page.tsx:8` | `AppShell` → `InventoryScreen` | 머리줄 메뉴, 메뉴 시트, 꼬리말, 계정의 두 행, 받기 결과의 링크 | 3 | 주소 값을 읽지 않는다 | CX-R-010 | CL-R-004 | R-012 | 셋 일치 | 전달과 실행(산출물 폴더 있음). 스크린샷: `screenshots/before/claude-a/inventory-held-mobile.png` | 확인됨 |
| R-005 | `/{l}/wallet/` | `app/[locale]/wallet/page.tsx:8` | `AppShell` → `WalletScreen` | 머리줄 메뉴, 메뉴 시트, 꼬리말, 계정의 잔액 행, 잔액 시트, 출금 화면 | 3 | 주소 값을 읽지 않는다 | CX-R-016 | CL-R-005 | R-018 | 셋 일치 | 전달과 실행. 스크린샷: `screenshots/before/claude-a/wallet-pending-mobile.png` | 확인됨 |
| R-006 | `/{l}/wallet/withdraw/` | `app/[locale]/wallet/withdraw/page.tsx:8` | `AppShell` → `WithdrawScreen`(주소 하나에 화면 아홉 가지) | 지갑의 "출금", 잔액 시트의 "출금", 계정의 "출금" 행. 머리줄과 꼬리말에는 없다 | 3 | 주소 값을 읽지 않는다. 단계는 주소에 남지 않아 새로 고치면 입력 단계다 | CX-R-017 | CL-R-006 | R-019 | 셋 일치 | 전달과 실행(200). 스크린샷: `screenshots/before/claude-a/withdraw-funded-mobile.png` | 확인됨(확인, 인증, 신청함 단계는 확인 불가: 아무도 제출하지 않았다) |
| R-007 | `/{l}/wins/` | `app/[locale]/wins/page.tsx:8` | `AppShell` → `WinsScreen` | 머리줄 메뉴, 메뉴 시트, 꼬리말, 박스 후기 영역, 후기 화면 | 3 | 주소 값을 읽지 않는다 | CX-R-018 | CL-R-007 | R-020 | 셋 일치 | 전달. 스크린샷: `screenshots/before/claude-a/wins-detail-desktop.png` | 확인됨 |
| R-008 | `/{l}/reviews/` 와 `?box={slug}` | `app/[locale]/reviews/page.tsx:9` | `AppShell wide` → `Suspense` → `ReviewsScreen` | 꼬리말 "후기", 박스 화면의 "후기 모두 보기"(후기가 있는 박스만). 머리줄에는 없다 | 3 (값은 새 파일을 만들지 않는다) | `box` 가 없는 slug 면 "전체" | CX-R-014 | CL-R-008 | R-016 | 셋 일치 | 코드: `ReviewsScreen.tsx:21`(`useSearchParams().get("box")`). 실행: `/ko/reviews/?box=dollar-apple` 200 | 확인됨. BRIEF 2절에 따라 후기 자리는 뒤에 "의도된 차이"가 된다 |
| R-009 | `/{l}/verify/` 와 `?s=&h=&c=&n=&box=` | `app/[locale]/verify/page.tsx:9` | `AppShell` → `Suspense` → `VerifyScreen` | 머리줄 메뉴, 메뉴 시트, 꼬리말, 계정, 박스 "알아둘 것", 검증 시트의 링크(값을 실어 옴), 내 후기 상세(값을 실어 옴), `/fairness` | 3 | `s` 가 없으면 값을 통째로 무시. `box` 가 없으면 첫 박스. `n` 은 계산할 때 검사 | CX-R-015 | CL-R-009 | R-017 | 셋 일치 | 코드: `VerifyScreen.tsx:43-49`, `flow/VerifySheet.tsx:52`, `box/BoxReviews.tsx:108`(값을 만드는 두 곳) | 확인됨 |
| R-010 | `/{l}/guide/` | `app/[locale]/guide/page.tsx:11` | `AppShell` → `ScreenHead`, `Card` 셋, `GuideFees`, 링크 둘 | 머리줄 메뉴, 메뉴 시트, 꼬리말 두 곳, 계정, `/about` | 3 | 주소 값을 읽지 않는다 | CX-R-009 | CL-R-010 | R-011 | 셋 일치 | 코드: `guide/page.tsx:24`. 실행: 배포 HTML 의 링크가 `/voila-test-aresjoo/en/fairness/` | 확인됨. 이 화면의 "개봉 결과 검증" 링크는 옛 주소 `/fairness` 로 간다(원본이 그러함) |
| R-011 | `/{l}/account/` | `app/[locale]/account/page.tsx:8` | `AppShell` → `AccountScreen` | 머리줄 메뉴, 메뉴 시트, `/profile`. 꼬리말에는 없다 | 3 | 주소 값을 읽지 않는다 | CX-R-003 | CL-R-011 | R-003 | 셋 일치 | 전달. 화면: `screenshots/before/claude-a/account-mobile.png`(Claude 촬영, 통합자가 열어 봄) | 확인됨 |
| R-012 | `/{l}/legal/` | `app/[locale]/legal/page.tsx:8` | `AppShell` → `LegalCenterScreen` | 꼬리말 "약관과 정책", 이용 방법, 계정, 문서 화면 | 3 | 해당 없음 | CX-R-011 | CL-R-012 | R-013 | 셋 일치 | 전달과 실행(산출물 `legal/index.html`) | 확인됨 |
| R-013 | `/{l}/legal/{doc}/` | `app/[locale]/legal/[doc]/page.tsx:8-18` | `AppShell` → `LegalDocScreen` | 약관 목록의 행 13개뿐 | 39 (13 x 3) | 없는 문서는 `404.html` 을 404 로 | CX-R-012, CX-F-012 | CL-R-013 | R-014(terms 만) | 셋 일치 | 코드. 실행: 산출물 언어마다 `legal` 아래 14개(목록 1, 문서 13), `/ko/legal/terms/` 200, `/ko/legal/no-such-doc/` 404 | 확인됨 |
| R-014 | `/{l}/about/` | `app/[locale]/about/page.tsx:8` | `AppShell` → `MovedScreen`(단추는 `/guide`) | 없음. 주소로만 | 3 | 해당 없음 | CX-R-002 | CL-R-014 | R-002 | 셋 일치 | 전달. 스크린샷: `screenshots/before/claude-a/moved-about-mobile.png` | 확인됨 |
| R-015 | `/{l}/community/` | `app/[locale]/community/page.tsx:8` | `MovedScreen`(단추는 `/`) | 없음. 주소로만 | 3 | 해당 없음 | CX-R-005 | CL-R-015 | R-007 | 셋 일치 | 전달. 스크린샷: `screenshots/before/agy/routes/R-007-community-ko-1280-full.png` | 확인됨 |
| R-016 | `/{l}/community/board/` | `app/[locale]/community/board/page.tsx:8` | `MovedScreen`(단추는 `/`) | 없음. 주소로만 | 3 | 해당 없음 | CX-R-006 | CL-R-016 | R-008 | 셋 일치 | 전달. 스크린샷: `screenshots/before/agy/routes/R-008-community-board-ko-1280-full.png` | 확인됨 |
| R-017 | `/{l}/fairness/` | `app/[locale]/fairness/page.tsx:8` | `MovedScreen`(단추는 `/verify`) | 이용 방법 화면의 링크(R-010) | 3 | 해당 없음 | CX-R-008 | CL-R-017 | R-010 | 셋 일치 | 실행: `/ko/fairness/` 200 | 확인됨 |
| R-018 | `/{l}/profile/` | `app/[locale]/profile/page.tsx:8` | `MovedScreen`(단추는 `/account`) | 없음. 주소로만 | 3 | 해당 없음 | CX-R-013 | CL-R-018 | R-015 | 셋 일치 | 전달. 스크린샷: `screenshots/before/agy/routes/R-015-profile-ko-1280-full.png` | 확인됨 |
| R-019 | `/{l}/dev/gallery/` | `app/[locale]/dev/gallery/page.tsx:8` | 개발 서버: `AppShell` → `Gallery`. 프로덕션 빌드: `notFound()` → R-020 의 화면 | 없음. 주소로만 | 3 (내용은 "없는 주소") | 해당 없음 | CX-R-007, CX-U-014 | CL-R-019 | R-009 | 셋 일치(6절 D-R3 참고) | 코드: `dev/gallery/page.tsx:8`. 실행: `/ko/dev/gallery/` 200, `h1` 이 "없는 주소". 화면: `screenshots/before/agy/routes/R-009-dev-gallery-ko-390-first.png`(AGY 촬영, 통합자가 열어 봄: 머리줄, "없는 주소", 단추 "박스 보기") | 갤러리 본문은 도달 불가(개발 전용). 200 으로 "없는 주소"가 나오는 것은 확인됨 |
| R-020 | 주소 없음(`[locale]` 안의 없는 주소 화면) | `app/[locale]/not-found.tsx:5` | `NotFoundScreen`(`components/shell/StateScreens.tsx:11`), `AppShell` 을 스스로 감싼다 | 배포 사이트에서는 R-019 의 세 주소에서만 뜬다 | R-019 의 3 에 구워짐 | 해당 없음 | CX-R-024 | CL-R-020 | R-009 로 찍힘 | CX와 CL 일치 | 화면: 위와 같은 스크린샷 | 확인됨 |
| R-021 | 그 밖의 모든 없는 주소(`404.html`) | `app/not-found.tsx:11-27` | `RootNotFound`(머리줄, 꼬리말, 색 선 없음) | 없는 박스, 없는 문서, 없는 화면, 없는 언어, `/{l}/box/`, `/{l}/admin/` | 2 (`404.html`, `404/index.html`) | 단추의 주소가 `"/" + 언어` 라 `basePath` 가 붙지 않는다 | CX-R-023, CX-R-024 | CL-R-021 | 없음 | CX는 위험을 짐작으로, CL은 화면으로. 통합자가 실행으로 확인 | 코드: `app/not-found.tsx:14,23`. 실행: `/ko/box/no-such-box/` 404, 그 HTML 의 단추가 `href="/ko"`, `/404.html` 200. 화면: `screenshots/before/claude-a/notfound-root-mobile.png`(통합자가 열어 봄) | 확인됨. 단추가 사이트 밖으로 나가는 것은 "원본의 기존 결함"으로 `FINDINGS` 에 넘긴다 |
| R-022 | 주소 없음(오류 화면) | `app/[locale]/error.tsx:5` | `ErrorScreen`(`StateScreens.tsx:23`) | `[locale]` 아래 화면이 그리다 던졌을 때 | 0 | 해당 없음 | 번호 없음(CX-U-001 의 진입점 목록에만 있다) | CL-R-022 | 없음 | 한 곳만 번호를 붙임 | 코드: 파일이 있고 통합자의 그래프에서 진입점으로 잡힌다(닿는 파일 67개) | 확인 불가(아무도 띄우지 못했다). 루트에 `global-error.tsx` 는 없다(코드: 파일 목록) |
| R-023 | `/ja/` 같은 없는 언어 | `app/[locale]/layout.tsx:63`(코드상의 `notFound()`) | 배포에서는 R-021 이 한국어로 뜬다 | 주소로만 | 0 | 해당 없음 | CX-R-023 | CL-R-023 | 없음 | CX는 개발 서버 404 만, CL은 배포 404. 실행으로 확인 | 실행: `/ja/` 404, `/ko/admin/` 404 | 확인됨 |
| R-024 | `/ko`, `/ko/guide` 처럼 끝 빗금이 없는 주소 | 해당 없음(호스트 동작) | GitHub Pages 가 301 로 빗금을 붙인다 | 주소로만 | 0 | 해당 없음 | 없음 | CL-R-024 | 없음 | 한 곳만 봄. 실행으로 확인 | 실행: `/ko` 301 | 확인됨(`/ko/guide` 는 전달) |

## 3. 동적 값의 묶음

| id | 묶음 | 수 | 화면에서 닿는 길 | 근거 | 상태 |
|---|---|---|---|---|---|
| R-025 | 새 카탈로그 박스(R-003 의 일부) | 320, 언어를 곱하면 960 | 홈의 카드와 검색, 배너의 단추(`pokemon-charizard`), 상품 시트의 비교 행, 후기와 나온 상품의 링크 | 전달: CX-F-012(`HOME_BOXES` 320), CL 3.1(`counts.ts`). 실행: 산출물 334 가운데 320 을 직접 가르지는 않았다 | 확인됨(수는 두 분석이 따로 세어 같다) |
| R-026 | 옛 박스 가운데 후기 화면으로 닿는 것(R-003 의 일부) | 13, 언어를 곱하면 39 | 홈과 검색에는 없다. 꼬리말 "후기" → 후기 화면의 박스 알약 → 뒤로 가기 또는 후기 상세의 박스 링크 | 전달: CL 3.1. CX 는 `LEGACY_BOXES` 14 만 적고 닿는 길은 적지 않았다 | 한 곳만 봄. 통합자는 `/ko/reviews/?box=dollar-apple` 이 200 인 것까지만 실행으로 확인 |
| R-027 | 주소로만 열리는 옛 박스 `jackpot-supercar`(R-003 의 일부) | 1, 언어를 곱하면 3 | 없음(샘플 후기가 없어 알약에도 없다). 검증 화면의 박스 알약에는 이름만 있다 | 전달: CL 3.1. 실행: `/ko/box/jackpot-supercar/` 200 | 한 곳만 봄. 주소가 열리는 것은 확인됨, 화면 안의 길이 없다는 것은 전달 |
| R-028 | 약관 문서(R-013) | 13: terms, privacy, payments, withdrawals, refunds, policy, fairness, safety, community, cookies, complaints, business, faq | 약관 목록 | 전달: CX-F-012, CL-R-013. 실행: 산출물 폴더 수 | 확인됨 |

후기 샘플 생성기가 합쳐지면(BRIEF 2절) R-026 과 R-027 의 "닿는 길"이 달라질 수 있다. 그때 이 표를 다시 본다.

## 4. 배포 사이트에 직접 보낸 요청(실행)

| 주소 | 상태 |
|---|---|
| `/`, `/ko/`, `/en/`, `/zh/` | 200 |
| `/ko` | 301 |
| `/ko/dev/gallery/` | 200, `h1` 은 "없는 주소" |
| `/ko/box/pokemon-charizard/`, `/ko/box/jackpot-supercar/` | 200 |
| `/ko/box/no-such-box/`, `/ko/box/` | 404 |
| `/ko/legal/terms/` | 200 |
| `/ko/legal/no-such-doc/`, `/ja/`, `/ko/admin/` | 404 |
| `/404.html` | 200 |
| `/ko/reviews/?box=dollar-apple`, `/ko/fairness/`, `/ko/wallet/withdraw/` | 200 |

Claude 의 전수 요청(1,111건: 200 이 1,092, 301 이 2, 404 가 17)과 통합자의 18건은 겹치는 주소에서 모두 같다. 1,092 는 통합자가 센 산출물의 HTML 수와도 같다.

## 5. 주소가 없는 화면, 개발 전용 스위치

라우트는 아니지만 화면 전체를 덮거나 화면을 바꾸는 것. 자세한 것은 `UI_INVENTORY.md` 에 있다.

| 무엇 | 뜨는 곳 | 주소 | 출처 |
|---|---|---|---|
| 개봉 장면 `Opening`, 개봉 결과 `Reveal` | R-003 | 그대로. 새로 고치면 사라지고, 박스 화면의 주 단추가 "결과 보기"로 바뀐다 | CL 6절, CX-R-004. 코드: `BoxScreen.tsx:319-320,113-138` |
| 출금의 단계 화면 | R-006 | 그대로 | CL 6절, CX-R-017 |
| 홈의 검색 결과, 보관함의 탭 | R-002, R-004 | 그대로(주소에 남지 않는다) | CL 6절 |
| 개발 서버 전용 시험 스위치 `voila.opening.fault` | R-003 | 주소 아님(sessionStorage). 프로덕션 빌드에서는 늘 꺼져 있다 | 코드: `lib/takeBatch.ts:61-64`, `BoxScreen.tsx:149`. 세 분석의 라우트 문서에는 없고 통합자가 코드에서 찾았다. 도달 불가 |

관리자 화면은 없다(실행: `/ko/admin/` 404, 코드: `app` 아래에 그런 폴더 없음). `web/app/api` 도 없다(코드: 파일 목록).

## 6. 어긋난 곳과 판정

| id | 무엇이 어긋났나 | 각자의 말 | 판정과 근거 |
|---|---|---|---|
| D-R1 | 정적 화면의 수 | `ARCHITECTURE.md` 3절: 1,091. Claude: 1,090 과 `404.html`(HTTP 200 은 1,092). Codex: 빌드를 돌리지 않아 고유 경로 1002 와 39 만. 빌드 기록: 1,094 | 세는 대상이 다를 뿐이다. 실행으로 판정: 산출물의 HTML 은 1,092개다(언어 화면 1,089, 루트 1, `404.html` 과 `404/index.html`). 1,091 은 언어 화면 1,089 에 `/` 와 `/_not-found` 를 더한 수, 1,094 는 Next 가 만든 단위 수(`icon.svg` 등 포함, 기록의 숫자를 읽은 것이고 내역은 짐작)다. 동등성 비교의 분모는 "언어 화면 1,089 와 루트 1, 404 한 장"으로 쓴다 |
| D-R2 | AGY 가 연 조합의 수 | `agy-b` 2.1절: 라우트 18, 폭 10(320, 360, 390, 430, 768, 1024, 1280, 1440, 1920), 언어 3, 합 180 | 실행으로 판정(`routes-result.json`): 라우트 항목은 20(박스가 slug 셋), 한국어는 폭 다섯(320, 390, 768, 1280, 1920), 영어와 중국어는 폭 둘(390, 1440). 100 + 40 + 40 = 180. 폭 360, 430, 1024 는 찍히지 않았다. "가로 넘침 0, 콘솔 오류 0, 실패 요청 0"은 이 180 조합에 대해서만 참이다 |
| D-R3 | 갤러리에 닿는가 | `agy-b` 4.1절과 `overlays-result.json`: 충전 시트와 검증 시트는 "dev/gallery 에서만 도달 가능". Claude 와 Codex: 프로덕션에서는 갤러리가 없다 | 코드와 실행으로 판정: 배포 사이트의 `/ko/dev/gallery/` 는 "없는 주소" 화면이다. AGY 의 말은 개발 서버에만 맞다. 충전 시트와 검증 시트는 로그인한 화면에서 닿는다(Claude 가 화면으로 확인, `UI_INVENTORY` 참고) |
| D-R4 | 없는 주소에 무엇이 나오는가 | Codex CX-R-023: 호스트가 어떤 404 를 주는지 확인 불가. Claude: `404.html` 이 404 로 | 실행으로 판정: 404 상태에 루트의 없는 주소 화면. Claude 가 맞다 |
| D-R5 | 그림이 빠졌는가 | `routes-result.json` 의 `missingImages` 합 1,079(36 조합). `agy-b` 2.4절: 86장, 실패 요청은 0 | 판정: 빠진 것이 아니다. 지연 로딩 그림을 스크롤 전에 잰 값이다(AGY 스스로의 설명, 같은 파일의 `failedRequests` 가 0). 비교 도구는 그림이 풀린 뒤에 찍어야 한다 |
| D-R6 | 없는 주소 화면의 단추 글 | Claude: "박스 보러 가기". 화면: "박스 보기" | 화면으로 판정(통합자가 스크린샷 둘을 열어 봄): 한국어 글은 "박스 보기"다. 문구 키는 같다(`state.toBoxes`) |

## 7. 번호 대응이 빠짐없는지

| 분석의 번호 | 이 문서의 자리 |
|---|---|
| CX-R-001 ~ CX-R-018 | R-002 ~ R-019(표의 CX 칸) |
| CX-R-019 | 1절 공통 껍데기 |
| CX-R-020 | R-001 |
| CX-R-021 | 1절 `html lang`, 저장소 분리 |
| CX-R-022 | 1절 로그인 가드, 첫 방문 지급 |
| CX-R-023 | R-003, R-013, R-021, R-023 |
| CX-R-024 | R-020, R-021 |
| CL-R-001 ~ CL-R-024 | R-001 ~ R-024(표의 CL 칸. CL-R-014 ~ 018 은 R-014 ~ R-018) |
| AG 측정 R-001 ~ R-020 | 표의 AG 칸. R-004, R-005, R-006 셋은 R-003 하나로 묶었다 |
| `agy-b` 의 AG-U-001 ~ AG-U-008(라우트 대표 스크린샷 여덟 장) | R-002, R-003, R-005, R-006, R-008, R-009 의 증거. 같은 번호가 `agy-a` 에서는 다른 뜻으로 쓰였다(`UI_INVENTORY.md` 8절) |

옮기지 않은 것과 까닭:

| 번호 | 까닭 |
|---|---|
| CX-F-011(개발 서버 응답) | 개발 서버의 결과라 배포본의 근거로 쓰지 않았다. R-019 의 "개발 서버에서는 갤러리가 뜬다"의 전달 근거로만 남긴다 |
| Claude 5절(메뉴와 주소의 대응), 7절(옛 문서와 어긋나는 것) | 번호가 없는 절이다. 메뉴는 `UI_INVENTORY.md` 의 U-010, U-018 ~ U-022 로, 옛 문서와의 차이는 `FINDINGS` 로 넘긴다 |

## 8. 수

| 무엇 | 수 |
|---|---|
| 최종 번호(R-001 ~ R-028) | 28 |
| 그 가운데 라우트 파일에 묶인 것(R-002 ~ R-019) | 18 |
| 루트, 없는 주소 둘, 오류, 없는 언어, 빗금 | 6 (R-001, R-020 ~ R-024) |
| 동적 값의 묶음 | 4 (R-025 ~ R-028) |
| 정적 HTML(실행) | 1,092 (언어 화면 1,089, 루트 1, 404 둘) |
| 화면 안의 링크로 닿는 라우트 파일 | 13 (R-002 ~ R-013, R-017) |
| 주소로만 닿는 라우트 파일 | 5 (R-014, R-015, R-016, R-018, R-019) |
| 세 분석이 모두 본 것 | 18 (R-002 ~ R-019) |
| 두 분석만 본 것 | 4 (R-001, R-020, R-021, R-023) |
| 한 분석만 번호를 붙인 것 | 4 (R-022, R-024, R-026, R-027) |
| 어긋난 곳 | 6 (D-R1 ~ D-R6), 모두 판정함 |
| 상태: 확인됨 | 24 |
| 상태: 확인 불가 | 1 (R-022) |
| 상태: 도달 불가가 섞인 것 | 1 (R-019 의 갤러리 본문) |
| 상태: 한 곳만 보아 전달로 남은 것 | 2 (R-026, R-027 의 닿는 길) |

## 9. 정하지 못한 것

- 오류 화면(R-022)이 실제로 어떻게 보이는지. 띄울 길을 아무도 찾지 못했다.
- 영어와 중국어 브라우저에서 루트가 `/en/`, `/zh/` 로 가는지, 스크립트가 꺼진 브라우저에서 `meta refresh` 가 도는지. 코드로만 읽었다.
- 옛 박스 13개가 후기 화면을 거쳐 닿는다는 것(R-026). Claude 한 곳의 화면 확인이고 통합자는 주소 하나만 요청해 봤다.
- 빌드 기록의 1,094 가 정확히 무엇을 세는지. 내역을 풀지 않았다.
- 언어 링크가 주소의 값(`?box=`)을 떨어뜨리는지. Claude 가 코드로만 읽었다(`AppFooter.tsx:61`).
- 폭 360, 430, 1024 에서 가로로 넘치는지. AGY 의 보고서는 쟀다고 적었으나 측정 파일에는 없다.
