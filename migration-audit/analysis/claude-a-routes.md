# 라우트 전수 목록 (Claude 분석 A)

기준 커밋 `63445c7`, 브랜치 `migration-audit`. 조사일 2026-10-12.
소스(`web/app`, `web/components`, `web/lib`, `web/stores`)를 읽고, 배포 사이트(https://shinwon446-eng.github.io/voila-test-aresjoo/)를 새 Chrome 창과 HTTP 요청으로 확인했다.
`web/` 아래의 파일과 기존 문서는 고치지 않았다. 빌드도 돌리지 않았다.

## 0. 근거의 말

| 표시 | 뜻 |
|---|---|
| 코드 | 소스에서 읽은 것(파일과 줄을 적는다) |
| 화면 | 배포 사이트를 Chrome 으로 열어 본 것 |
| 실행 | 내가 직접 돌린 명령의 결과 |
| 짐작 | 확인하지 못하고 미루어 본 것 |

직접 돌린 것(전부 `migration-audit/harness/claude-a/` 에 있다):

| 스크립트 | 한 일 | 결과 파일 |
|---|---|---|
| `import-graph.mjs` | `web/app` 의 파일에서 출발해 가져오기를 따라가 닿는 파일과 닿지 않는 파일을 나눔 | 화면 출력, `reachable.txt` |
| `counts.ts` (tsx) | 카탈로그와 상수의 개수 | 화면 출력 |
| `slugs.ts` (tsx) | 박스 주소 334개 목록 | `slugs.json` |
| `http-scan.mjs` | 배포 사이트의 주소 1,111개에 GET 요청을 보내 상태 코드와 크기, 정적 HTML 의 제목을 적음 | `http-scan.json` |
| `probe.mjs crawl` | 세 언어의 라우트 25개씩과 루트, 없는 주소를 Chrome 으로 열어 제목, 링크, 단추를 적음 | `probe-crawl.json`, `probe-crawl.log` |
| `probe.mjs ui` | 숨은 화면을 눌러 봄(UI 문서에서 쓴다) | `probe-ui.json`, `probe-ui.log`, `probe-ui-open-five.json`(여러 개 열기 단계만 다시 돌린 것) |
| `keys.mjs` | 닿는 소스가 쓰는 문구 키가 세 언어 파일에 있는지 | 화면 출력 |

## 1. 한눈에 보는 수

| 무엇 | 수 | 근거 |
|---|---|---|
| 라우트 파일(`web/app/[locale]/**/page.tsx`) | 18 | 코드: 파일 목록 |
| 그 밖의 app 파일 | 루트 `page.tsx`, 루트 `layout.tsx`, 루트 `not-found.tsx`, `[locale]/layout.tsx`, `[locale]/not-found.tsx`, `[locale]/error.tsx` | 코드 |
| 언어 | 3 (ko, en, zh) | 코드: `web/i18n/routing.ts:7` |
| 박스 주소(`generateStaticParams`) | 334 | 실행: `counts.ts` 가 `BOXES.length` 334 를 냄. 코드: `web/app/[locale]/box/[slug]/page.tsx:8` |
| 그 가운데 홈과 검색에 나오는 박스 | 320 (카테고리 16개에 20개씩) | 실행: `counts.ts` 의 `homeBoxes` |
| 홈에 나오지 않는 옛 박스 | 14 | 실행: `counts.ts` 의 `notOnHome` |
| 약관 문서 주소 | 13 | 코드: `web/lib/legal.ts:11` |
| 고정 주소(동적 값이 없는 것) | 16 | 18 에서 `box/[slug]` 와 `legal/[doc]` 를 뺀 것 |
| 언어 하나의 정적 화면 수 | 363 (16 + 13 + 334) | 계산 |
| 배포된 정적 화면 전체 | 1,090 (363 x 3 + 루트 1), 여기에 `404.html` | 실행: `http-scan.mjs` 가 200 을 1,092번 받음(위 1,090 에 `/404.html`, `/404/` 둘) |
| 없는 주소로 확인한 것 | 17 곳이 404 | 실행: `http-scan.mjs` |

`http-scan.mjs` 의 전체 결과: 요청 1,111개, 200 이 1,092개, 301 이 2개(`/ko`, `/ko/guide` 처럼 끝에 빗금이 없는 주소가 빗금 있는 주소로 넘어감), 404 가 17개.
박스 화면 1,002개(334 x 3)는 전부 200 이었다.

## 2. 공통 사실

- 정적 내보내기라 서버가 없다. `basePath` 는 `/voila-test-aresjoo`, `trailingSlash: true`(코드: `web/next.config.mjs:17`). 화면에서 본 링크는 전부 `/voila-test-aresjoo/ko/...` 꼴이고 빗금으로 끝난다(화면).
- 모든 `[locale]` 라우트는 `dynamicParams = false` 다(코드: `[locale]/layout.tsx:17`, `box/[slug]/page.tsx:11`, `legal/[doc]/page.tsx:11`). 목록 밖의 값은 빌드되지 않는다.
- 로그인을 요구하는 라우트 가드는 없다. 어느 주소든 로그인 전에 열린다. 로그인이 필요한 내용은 화면 안에서 한 줄과 로그인 단추로 바뀐다(코드: 각 화면 컴포넌트, 화면: 세 언어 모두 확인).
- 어느 `[locale]` 화면이든 다음이 함께 붙는다(코드: `[locale]/layout.tsx:67`, `components/shell/AppShell.tsx:43`).
  - `AppShell`: 머리줄, 오프라인 한 줄, 세션 끝남 한 줄, 본문, 메뉴 시트, 충전 시트, 잔액 시트, 토스트 자리
  - `AppFooter`: 꼬리말
  - `AuthHost`: 세션 복원과 로그인 시트
  - `LabBadge`: 맨 위의 색 선과 저장 공간 경고
  - `CurrencyHydrator`(루트 레이아웃): 저장된 스토어 여덟 개를 불러옴
- 모든 화면의 정적 HTML 은 `<html lang="ko">` 로 나온다. 언어별 값(en, zh-Hans)은 화면이 뜬 뒤에 `LocaleHtmlLang` 이 바꾼다(코드: `web/app/layout.tsx:45`, `components/layout/LocaleHtmlLang.tsx:9`. 실행: 배포된 `/en/verify/` 의 HTML 이 `lang="ko"`. 화면: 뜬 뒤에는 en, zh-Hans).
- 모든 화면의 `canonical` 은 그 화면이 아니라 그 언어의 홈(`/ko/`)을 가리킨다(코드: `[locale]/layout.tsx:39`. 실행: 배포된 `/ko/guide/` 의 canonical 이 `/ko/`). 검색 노출은 `noindex, nofollow` 로 막혀 있다(실행).
- 탭 제목은 어느 화면이나 같다: `[TEST aresjoo] VOILA`(TEST 와 aresjoo 사이에 점 문자가 하나 있다. 코드: `web/lib/labSite.ts:25`. 화면).
- 정적 HTML 하나의 크기는 한국어 약 161KB, 영어 약 225KB, 중국어 약 142KB 다(실행: `http-scan.json`). 옛 문구 묶음(`messages/ko.json` 등, 50개 묶음)이 화면마다 통째로 들어 있기 때문이다(실행: 배포된 `/ko/guide/` HTML 에 `editorialPages`, `mobileNav`, `cardPay`, `autoplay` 가 들어 있음. 코드: `web/i18n/request.ts:12`).

### 모든 화면이 읽는 스토어

| 붙는 곳 | 읽는 스토어 | 근거 |
|---|---|---|
| `AppShell` | `authStore`(user, hydrated, openAuthModal), `walletStore`(balance), `flowStore`(menu, openMenu, closeMenu, openBalance), `currencyStore`(useCurrency) | 코드: `AppShell.tsx:36-41` |
| `SessionLine` | `authStore`(sessionLost, openAuthModal) | 코드: `StateScreens.tsx:39` |
| `BalanceSheet` | `flowStore`(balance), `authStore`, `walletStore`(balance, cryptoBalance, transactions), `inventoryStore`(items) | 코드: `flow/BalanceSheet.tsx:23-31` |
| `ChargeSheet` | `flowStore`(charge), `authStore`, 토스트 스토어, `useUsdtDeposit`(지갑 스토어에 입금을 적음) | 코드: `flow/ChargeSheet.tsx:20-28` |
| `ToastHost` | 토스트 스토어(`components/ui/toast.tsx` 안에 있다. 저장하지 않는다) | 코드: `toast.tsx:10` |
| `AppFooter` | `currencyStore` | 코드: `AppFooter.tsx:28` |
| `AuthHost`, `LoginSheet` | `authStore`, `securityStore`, `walletStore` | 코드: `auth/AuthHost.tsx:18-46`, `flow/LoginSheet.tsx:22` |
| `CurrencyHydrator` | `currencyStore`, `walletStore`, `settingsStore`, `inventoryStore`, `dailyStore`, `communityStore`, `telemetryStore`, `fairStore` 를 불러옴 | 코드: `layout/CurrencyHydrator.tsx:16-23` |

저장 키(코드: `web/stores/*.ts`): `voila-auth-v1`, `gachaflix.wallet`, `gachaflix.inventory`, `gachaflix.settings`, `gachaflix.currency`, `gachaflix.community`, `gachaflix.fair`, `gachaflix.daily`, `gachaflix.telemetry`, `voila.opening-journal`, 그리고 언어 선택 `gachaflix.locale`(루트 화면만 읽는다). 실제 저장소에는 전부 `voila-test-aresjoo:` 가 앞에 붙는다(코드: `web/lib/labSite.ts:17`).
`dailyStore` 와 `telemetryStore` 는 불러오기만 하고, 닿는 화면 가운데 그 값을 읽는 곳은 없다(실행: `import-graph.mjs` 에서 두 스토어를 가져오는 닿는 파일은 `CurrencyHydrator` 하나뿐).

## 3. 라우트 표

`{l}` 은 ko, en, zh 가운데 하나다. 주소 앞의 `/voila-test-aresjoo` 는 줄였다.

### CL-R-001 루트

| 항목 | 내용 |
|---|---|
| 주소 | `/` |
| 파일 | `web/app/page.tsx` |
| 맨 위 컴포넌트 | `RootRedirect` |
| 보이는 것 | 검은 바탕 가운데에 `VOILA.GG` 한 줄(`caption-luxury` 클래스, 옛 스타일). 곧 언어 주소로 넘어간다 |
| 하는 일 | 인라인 스크립트가 `gachaflix.locale` 저장값(ko, en, zh)을 먼저 보고, 없으면 브라우저 언어가 ko 로 시작하면 ko, zh 로 시작하면 zh, 그 밖은 en 으로 `location.replace("./" + 언어 + "/")`. 스크립트가 꺼져 있으면 `meta refresh` 가 `./ko/` 로 보낸다 |
| 읽는 스토어 | 없음(localStorage 의 `gachaflix.locale` 만 직접 읽는다) |
| 들어오는 길 | 주소를 직접 침. 화면 안에서 루트로 가는 링크는 없다 |
| 화면에서 닿는가 | 주소로만 |
| 잘못된 값 | 저장값이 세 언어가 아니면 브라우저 언어로 고른다. 예외가 나면 `./en/` |
| 로그인 | 필요 없음 |
| 근거 | 코드: `app/page.tsx:7-18`. 화면: 한국어 브라우저로 `/` 를 열면 `/ko/` 가 뜸. 실행: 배포 HTML 에 `meta refresh 0; url=./ko/` 와 스크립트가 있음 |
| 알아 둘 것 | `gachaflix.locale` 을 쓰는 코드가 닿는 소스에 없다(실행: 검색). 저장소 접두사 때문에 실제로 읽는 키는 `voila-test-aresjoo:gachaflix.locale` 이다. 그래서 지금은 언제나 브라우저 언어로 정해진다(짐작: 꼬리말의 언어 링크는 주소만 바꾸고 이 값을 적지 않는다) |

### CL-R-002 홈(박스 목록)

| 항목 | 내용 |
|---|---|
| 주소 | `/{l}/` |
| 파일 | `web/app/[locale]/page.tsx` |
| 맨 위 컴포넌트 | `AppShell wide` 안의 `BoxList` (`components/box/BoxList.tsx:42`) |
| 보이는 것 | 가입 혜택 배너(`HeroBanner`), 제목과 설명, 찾기 칸, 분류 알약 17개(전체와 카테고리 16), 박스 카드 24장, "박스 더 보기" 단추. 찾기 칸에 글을 넣으면 배너와 알약과 카드가 사라지고 상품 행이 나온다 |
| 읽는 스토어 | `inventoryStore.items`(최근에 연 박스를 앞으로), `authStore`, `walletStore.freeOpens`(배너) |
| 들어오는 길 | 머리줄 로고, 머리줄 메뉴 "박스", 메뉴 시트, 꼬리말 "박스", 박스 화면과 나온 상품과 후기 화면의 뒤로 가기, 옮긴 화면(`/community`, `/community/board`), 없는 주소 화면, 보관함과 나온 상품의 빈 상태 단추 |
| 화면에서 닿는가 | 닿음 |
| 잘못된 값 | 주소에 붙은 값은 읽지 않는다. `?skin=netflix`, `?skin=commerce` 는 옛 시안의 값인데 지금 이 화면은 읽지 않는다(코드: `BoxList.tsx` 에 주소 값을 읽는 곳이 없음. `app/nfx-skin.css:2`, `app/shop-skin.css:2` 의 주석에만 남아 있다) |
| 로그인 | 필요 없음. 배너의 단추만 로그인 여부로 바뀐다 |
| 근거 | 코드: `BoxList.tsx:79-110`. 화면: 세 언어 모두 카드 24장, 알약 17개, "박스 더 보기 (296개 남음)". 한 번 누르면 48장 |

### CL-R-003 박스 화면

| 항목 | 내용 |
|---|---|
| 주소 | `/{l}/box/{slug}/` |
| 파일 | `web/app/[locale]/box/[slug]/page.tsx` |
| 맨 위 컴포넌트 | `AppShell wide` 안의 `BoxScreen` (`components/box/BoxScreen.tsx:54`) |
| 동적 값 | `generateStaticParams` 가 `BOXES` 334개의 slug 를 낸다. 언어 3개를 곱해 1,002 화면 |
| 보이는 것 | 뒤로 가기와 박스 이름과 한 줄(1회 가격, 최고 상품가), 별점 한 줄(후기가 있을 때), 대표 상품 한 장, 후기 영역, 옆 카드(사실 2행 또는 3행과 열기 막대), 구성품(구간 넷), 확률 요약, 접어 둔 상품별 확률표, 접어 둔 "알아둘 것" |
| 겹침 화면 | 상품 시트, 큰 금액 확인창, USDT로 받기 선택 시트, 개봉 장면(`Opening`, 한 개), 개봉 결과(`Reveal`, 여러 개), 후기 상세 시트 |
| 읽는 스토어 | `authStore`, `walletStore`(balance, burst, freeOpens, transactions), `flowStore`(openCharge), `inventoryStore`(items, hydrated), `openingJournal`(hydrated, seen), `settingsStore`(openSound, openShort, autoTakeBy), `communityStore`(후기), `fairStore`(구매 모듈 `lib/opening` 이 씀) |
| 들어오는 길 | 홈의 박스 카드, 홈의 검색 결과 행, 배너의 단추(로그인한 사람, `pokemon-charizard` 로 감), 상품 시트의 "다른 박스에도 있음" 비교 행, 열기 막대의 "다른 박스에 못 본 결과" 링크, 후기 상세 시트의 박스 링크, 나온 상품 상세 시트의 박스 링크, 후기 화면에서 박스를 고른 뒤의 뒤로 가기 |
| 화면에서 닿는가 | 새 박스 320개: 닿음(홈). 옛 박스 14개: 홈과 검색에는 없고, 후기 화면(`/reviews`)의 알약과 후기 상세의 링크로 닿는다(13개). 아래 3.1 참고 |
| 잘못된 값 | 없는 slug 는 `notFound()` 이고 `dynamicParams = false` 라 빌드되지 않는다. 배포 사이트에서는 GitHub Pages 가 `404.html`(CL-R-021)을 404 상태로 준다. `/{l}/box/` 도 404 |
| 로그인 | 화면은 누구나 본다. 열기는 로그인이 필요하다(주 단추가 "로그인하고 언박싱"으로 바뀐다) |
| 근거 | 코드: `box/[slug]/page.tsx:8-18`, `BoxScreen.tsx:172-321`. 실행: `http-scan.mjs` 에서 1,002개 전부 200, `/ko/box/no-such-box/` 404. 화면: `pokemon-charizard`, `dollar-apple` 을 세 언어로 엶 |

#### 3.1 박스 주소의 내역 (실행: `counts.ts`, `slugs.json`)

| 묶음 | 수 | 홈에 나옴 | 주소로 열림 | 비고 |
|---|---|---|---|---|
| 새 카탈로그(scheme 이 physical) | 320 | 예 | 예 | 카테고리 16개(car, watch, bag, jewelry, fashion, mobile, computer, gaming, audio, camera, home, pokemon, toy, outdoor, sport, beauty)에 20개씩. USDT 결과가 없다 |
| 옛 박스(ladder) | 14 | 아니오 | 예 | `vault-pokemon`, `dollar-apple`, `jackpot-car`, `vault-submariner`, `vault-handbag`, `vault-gold`, `dollar-galaxy`, `dollar-gaming`, `starter-ps5`, `starter-audio`, `starter-macbook`, `starter-camera`, `vault-home`, `jackpot-supercar`. USDT 결과와 터짐 게이지가 있다 |

옛 박스가 홈에서 빠지는 까닭: `LEGACY_RETIRED` 가 참이다(새 박스가 100개를 넘음. 코드: `web/lib/products.ts:342-345`. 실행: `legacyRetired: true`).
옛 박스로 가는 화면 안의 길: 꼬리말 "후기" → 후기 화면의 박스 알약 13개(샘플 후기가 있는 옛 박스) → 뒤로 가기 화살표 또는 후기 상세의 박스 링크(코드: `box/ReviewsScreen.tsx:33`, `box/BoxReviews.tsx:168`. 화면: `/ko/reviews/?box=dollar-apple` 의 뒤로 가기가 `/ko/box/dollar-apple/`).
`jackpot-supercar` 는 샘플 후기가 없어 그 알약에도 없다(실행: `reviewSampleBoxes` 13개에 없음). 이 박스는 주소로만 열린다. 다만 검증 화면의 박스 알약에는 334개가 모두 있다(이름만 고르는 알약이고 링크는 아니다).

### CL-R-004 보관함

| 항목 | 내용 |
|---|---|
| 주소 | `/{l}/inventory/` |
| 파일 | `web/app/[locale]/inventory/page.tsx` |
| 맨 위 컴포넌트 | `AppShell` 안의 `InventoryScreen` (`components/inventory/InventoryScreen.tsx:35`) |
| 보이는 것 | 제목과 설명, 상태 알약 셋(보관 중, 배송, 받은 것. 개수 포함), "USDT로 받기" 단추(받을 수 있는 보관 상품이 있을 때), 상품 행 30개씩, "더 보기" 링크 |
| 겹침 화면 | 상품 시트, 배송 시트와 그 확인창, 검증 시트, 후기 쓰기 시트, 받기 선택 시트, 받기 확인창, 배송 취소 확인창 |
| 읽는 스토어 | `authStore`, `inventoryStore`, `communityStore.mine`, `walletStore.transactions`(받기 판정) |
| 들어오는 길 | 머리줄 메뉴, 메뉴 시트, 꼬리말, 계정 화면의 두 행, 받기 결과에서 확인하지 못한 것이 있을 때의 링크 |
| 화면에서 닿는가 | 닿음 |
| 잘못된 값 | 주소 값을 읽지 않는다 |
| 로그인 | 로그인 전에는 "로그인하면 받은 상품이 표시됩니다" 한 줄과 로그인 단추. 불러오는 동안은 자리 표시(높이 240) |
| 근거 | 코드: `InventoryScreen.tsx:110-189`. 화면: 세 언어의 로그인 전 화면, 심은 상태(보관 상품 둘, 배송 둘)의 화면 |

### CL-R-005 지갑

| 항목 | 내용 |
|---|---|
| 주소 | `/{l}/wallet/` |
| 파일 | `web/app/[locale]/wallet/page.tsx` |
| 맨 위 컴포넌트 | `AppShell` 안의 `WalletScreen` (`components/wallet/WalletScreen.tsx:23`) |
| 보이는 것 | 잔액 행(카드 잔액 행은 0 보다 클 때만), "USDT 충전하기" 단추, "출금" 링크, 내역 행 30개씩, "더 보기" 링크 |
| 겹침 화면 | 거래 시트, 출금 취소 확인창, 충전 시트(공통) |
| 읽는 스토어 | `authStore`, `walletStore`(hydrated, cryptoBalance, cardBalance, transactions), `flowStore`(openCharge) |
| 들어오는 길 | 머리줄 메뉴, 메뉴 시트, 꼬리말, 계정 화면의 잔액 행, 잔액 시트의 "내역"(보관 상품이 없을 때), 출금 화면의 뒤로 가기와 "지갑으로" 단추, 받기 결과와 보관함 상품 시트의 "내역" 링크 |
| 화면에서 닿는가 | 닿음 |
| 잘못된 값 | 주소 값을 읽지 않는다 |
| 로그인 | 로그인 전에는 한 줄과 로그인 단추. 불러오는 동안은 자리 표시(높이 200) |
| 근거 | 코드: `WalletScreen.tsx:90-146`. 화면 |
| 알아 둘 것 | 출금 상태를 10초마다 서비스에 묻는 코드가 있다(`WalletScreen.tsx:44-62`). 배포 사이트는 서버 주소가 비어 있어 `lib/api` 가 브라우저 안의 장부로 답한다(짐작: `lib/api.ts` 를 끝까지 읽지 않았다) |

### CL-R-006 출금

| 항목 | 내용 |
|---|---|
| 주소 | `/{l}/wallet/withdraw/` |
| 파일 | `web/app/[locale]/wallet/withdraw/page.tsx` |
| 맨 위 컴포넌트 | `AppShell` 안의 `WithdrawScreen` (`components/wallet/WithdrawScreen.tsx:37`) |
| 보이는 것 | 주소는 하나인데 화면은 아홉 가지다: 불러오는 중, 로그인 전, 보안 상태를 불러오는 중이거나 실패, 인증 앱 연결 관문, 입력, 확인, 인증 앱 코드, 이메일 인증, 신청함 |
| 겹침 화면 | 인증 앱 연결 시트(`TwoFactorSetup`), 받기 선택 시트(보관 상품이 있을 때의 링크) |
| 읽는 스토어 | `authStore`, `walletStore.cryptoBalance`, `securityStore`(twoFactorEnabled, hydrated, userId, error), `currencyStore.rates`, `inventoryStore.items` |
| 들어오는 길 | 지갑 화면의 "출금" 링크, 잔액 시트의 "출금" 링크, 계정 화면의 "출금" 행. 머리줄과 꼬리말에는 없다 |
| 화면에서 닿는가 | 닿음 |
| 잘못된 값 | 주소 값을 읽지 않는다. 입력 검증은 화면 안에서 한다(주소 형식, 숫자, 최소 20 USDT, 잔액) |
| 로그인 | 로그인 전에는 제목과 한 줄, 로그인 단추 |
| 근거 | 코드: `WithdrawScreen.tsx:169-264`. 화면: 로그인 전(세 언어), 심은 상태의 관문 화면과 입력 화면 |
| 알아 둘 것 | 단계가 바뀌어도 주소는 그대로다. 브라우저의 뒤로 가기는 앞 단계가 아니라 앞 화면으로 간다(코드: 단계가 `useState` 에만 있다). 새로 고치면 입력 단계로 돌아간다 |

### CL-R-007 나온 상품

| 항목 | 내용 |
|---|---|
| 주소 | `/{l}/wins/` |
| 파일 | `web/app/[locale]/wins/page.tsx` |
| 맨 위 컴포넌트 | `AppShell` 안의 `WinsScreen` (`components/box/WinsScreen.tsx:28`) |
| 보이는 것 | 뒤로 가기와 제목과 설명, 범위 한 줄, 줄 30개씩(사진, 이름, 참고가, 박스, 가린 이름과 시각), "더 보기" 링크. 줄이 없으면 빈 상태와 "박스 보러 가기" |
| 겹침 화면 | 상세 시트, 검증 시트 |
| 읽는 스토어 | `authStore`, `inventoryStore`(items, hydrated), `walletStore.transactions` |
| 들어오는 길 | 머리줄 메뉴, 메뉴 시트, 꼬리말, 박스 화면 후기 영역의 링크, 후기 화면의 링크 |
| 화면에서 닿는가 | 닿음 |
| 잘못된 값 | 주소 값을 읽지 않는다 |
| 로그인 | 로그인 전에는 한 줄과 로그인 단추. 불러오는 동안은 자리 표시(높이 120) |
| 근거 | 코드: `WinsScreen.tsx:55-116`, `lib/wins.ts:91`. 화면 |

### CL-R-008 후기 모아보기

| 항목 | 내용 |
|---|---|
| 주소 | `/{l}/reviews/` 와 `/{l}/reviews/?box={slug}` |
| 파일 | `web/app/[locale]/reviews/page.tsx` |
| 맨 위 컴포넌트 | `AppShell wide` 안의 `Suspense` 안의 `ReviewsScreen` (`components/box/ReviewsScreen.tsx:18`) |
| 보이는 것 | 뒤로 가기와 제목, 박스 알약(전체와 후기가 있는 박스), 평균과 분포, 후기 카드 격자, "나온 상품" 링크 |
| 겹침 화면 | 후기 상세 시트 |
| 읽는 스토어 | `communityStore`(내가 쓴 후기), `inventoryStore.items`, `authStore.user` |
| 들어오는 길 | 꼬리말 "후기", 박스 화면의 "후기 모두 보기"(그 박스에 후기가 있을 때만, `?box=` 를 붙여 옴). 머리줄 메뉴에는 없다 |
| 화면에서 닿는가 | 닿음 |
| 잘못된 값 | `box` 가 없는 slug 면 "전체"로 연다(코드: `ReviewsScreen.tsx:22`. 화면: `?box=no-such` 가 전체와 같은 화면) |
| 로그인 | 필요 없음 |
| 근거 | 코드. 화면: 알약이 14개(전체와 옛 박스 13개), 카드 28장 |
| 알아 둘 것 | `useSearchParams` 때문에 정적 HTML 에는 본문이 없다. `Suspense` 의 대신 화면이 `null` 이라 스크립트가 뜨기 전에는 머리줄과 꼬리말 사이가 비어 있다(실행: 배포 HTML 에 `BAILOUT_TO_CLIENT_SIDE_RENDERING`). 지금 보이는 후기는 전부 `lib/reviewSamples` 의 샘플 28개다(실행: `reviewSamples: 28`). 새 박스 320개에는 후기가 없다 |

### CL-R-009 개봉 결과 검증

| 항목 | 내용 |
|---|---|
| 주소 | `/{l}/verify/` 와 `/{l}/verify/?s=&h=&c=&n=&box=` |
| 파일 | `web/app/[locale]/verify/page.tsx` |
| 맨 위 컴포넌트 | `AppShell` 안의 `Suspense` 안의 `VerifyScreen` (`components/verify/VerifyScreen.tsx:24`) |
| 보이는 것 | 제목과 설명, 절 셋: 내 개봉 기록(20개씩), 값을 직접 넣어 계산(입력칸 넷, 박스 알약 334개, 계산 단추, 결과 행), 블록체인 검증 방식(세 단계 카드와 두 줄) |
| 겹침 화면 | 검증 시트 |
| 읽는 스토어 | `authStore`, `inventoryStore`(items, hydrated) |
| 들어오는 길 | 머리줄 메뉴, 메뉴 시트, 꼬리말, 계정 화면의 도움 행, 박스 화면 "알아둘 것"의 링크, 검증 시트의 "값을 직접 넣어 검증" 링크(값을 실어 옴), 내 후기 상세의 링크(값을 실어 옴), 옮긴 화면(`/fairness`) |
| 화면에서 닿는가 | 닿음 |
| 잘못된 값 | `s` 가 없으면 주소 값을 통째로 무시한다. `box` 가 없는 slug 면 첫 박스 그대로 둔다. `n` 은 계산할 때 0 이상의 정수인지 보고, 아니면 한 줄로 알린다(코드: `VerifyScreen.tsx:45-59`) |
| 로그인 | 기록 절만 로그인이 필요하다(한 줄과 단추). 직접 계산과 방식 설명은 누구나 쓴다 |
| 근거 | 코드. 화면: 로그인 전 본문의 단추가 336개(박스 알약 334, 로그인, 계산) |
| 알아 둘 것 | CL-R-008 과 같이 정적 HTML 에 본문이 없다. 박스 알약은 옛 박스 14개가 앞, 새 박스 320개가 뒤다(`BOXES` 의 순서) |

### CL-R-010 이용 방법

| 항목 | 내용 |
|---|---|
| 주소 | `/{l}/guide/` |
| 파일 | `web/app/[locale]/guide/page.tsx`(서버 컴포넌트가 직접 그린다) |
| 맨 위 컴포넌트 | `AppShell` 안의 `ScreenHead`, 카드 셋(고르기, 열기, 받기), "알아 둘 값" 절(`GuideFees`), 링크 둘 |
| 읽는 스토어 | `currencyStore`(`GuideFees` 의 금액 표기) |
| 들어오는 길 | 머리줄 메뉴, 메뉴 시트, 꼬리말의 두 곳("고객 관계 요약"과 "이용 방법"), 계정 화면의 도움 행, 옮긴 화면(`/about`) |
| 화면에서 닿는가 | 닿음 |
| 잘못된 값 | 주소 값을 읽지 않는다 |
| 로그인 | 필요 없음 |
| 근거 | 코드: `guide/page.tsx:11-26`, `shell/GuideFees.tsx:14-20`. 화면 |
| 알아 둘 것 | 아래 링크 "개봉 결과 검증"이 `/verify` 가 아니라 옛 주소 `/fairness` 로 간다(코드: `guide/page.tsx:24`. 화면: 세 언어 모두 `/{l}/fairness/`). 거기서 한 번 더 눌러야 검증 화면이다. "알아 둘 값"은 3행이다(받기 비율, 배송비, 최소 충전). USDT 결과 행은 `LEGACY_RETIRED` 라 빠진다(코드: `GuideFees.tsx:17`) |

### CL-R-011 계정

| 항목 | 내용 |
|---|---|
| 주소 | `/{l}/account/` |
| 파일 | `web/app/[locale]/account/page.tsx` |
| 맨 위 컴포넌트 | `AppShell` 안의 `AccountScreen` (`components/account/AccountScreen.tsx:21`) |
| 보이는 것 | 로그인 뒤: 행 묶음 다섯(지갑 2행, 보관함 2행, 보안 2행, 계정 관리 3행, 도움 3행)과 "로그아웃" 링크. 로그인 전: 로그인 단추와 "가입" 링크 |
| 겹침 화면 | 인증 앱 시트, 닉네임 시트, 비밀번호 시트, 탈퇴 시트와 그 확인창, 로그아웃 확인창 |
| 읽는 스토어 | `authStore`(user, hydrated, logout, updateNickname, clearSession), `walletStore.balance`, `inventoryStore.items`, `securityStore.twoFactorEnabled` |
| 들어오는 길 | 머리줄 메뉴, 메뉴 시트, 옮긴 화면(`/profile`). 꼬리말에는 없다 |
| 화면에서 닿는가 | 닿음 |
| 잘못된 값 | 주소 값을 읽지 않는다 |
| 로그인 | 로그인 전에는 설명이 로그인 안내로 바뀌고 단추 둘만 나온다. 불러오는 동안은 자리 표시(높이 240) |
| 근거 | 코드: `AccountScreen.tsx:42-82`. 화면 |

### CL-R-012 약관과 정책 목록

| 항목 | 내용 |
|---|---|
| 주소 | `/{l}/legal/` |
| 파일 | `web/app/[locale]/legal/page.tsx` |
| 맨 위 컴포넌트 | `AppShell` 안의 `LegalCenterScreen` (`components/legal/LegalCenterScreen.tsx:10`) |
| 보이는 것 | 제목과 설명, 버전과 시행일 한 줄, 묶음 셋(기본 4, 거래 4, 권리 5)의 문서 행 13개, 출처 한 줄 |
| 읽는 스토어 | 없음 |
| 들어오는 길 | 꼬리말 "약관과 정책", 이용 방법의 링크, 계정 화면의 도움 행, 문서 화면의 뒤로 가기와 아래 링크 |
| 화면에서 닿는가 | 닿음 |
| 로그인 | 필요 없음 |
| 근거 | 코드. 화면: 본문 링크 13개 |
| 알아 둘 것 | 문구는 새 묶음(`v`)이 아니라 옛 묶음 `legalCenter`, `legalDocs` 를 쓴다(코드: `LegalCenterScreen.tsx:11-12`) |

### CL-R-013 약관 문서

| 항목 | 내용 |
|---|---|
| 주소 | `/{l}/legal/{doc}/` |
| 파일 | `web/app/[locale]/legal/[doc]/page.tsx` |
| 맨 위 컴포넌트 | `AppShell` 안의 `LegalDocScreen` (`components/legal/LegalDocScreen.tsx:9`) |
| 동적 값 | 13개: terms, privacy, payments, withdrawals, refunds, policy, fairness, safety, community, cookies, complaints, business, faq. 언어 3개를 곱해 39 화면. `generateStaticParams` 가 언어와 문서를 함께 낸다 |
| 보이는 것 | 뒤로 가기와 문서 제목과 요약, 버전과 시행일, 절(제목과 본문), 목록으로 가는 링크 |
| 읽는 스토어 | 없음 |
| 들어오는 길 | 목록 화면의 행뿐이다 |
| 화면에서 닿는가 | 닿음 |
| 잘못된 값 | 없는 문서는 `notFound()`. 배포 사이트에서는 `404.html`(실행: `/ko/legal/no-such-doc/` 404) |
| 로그인 | 필요 없음 |
| 근거 | 코드: `legal/[doc]/page.tsx:8-18`. 실행: 39개 전부 200 |

### CL-R-014 ~ 018 옮긴 화면(옛 주소)

다섯 라우트가 같은 부품 `MovedScreen`(`components/shell/MovedScreen.tsx:9`)을 쓴다. 제목 "옮긴 화면", 한 줄 설명, 새 화면으로 가는 단추 하나.

| id | 주소 | 파일 | 단추가 가는 곳 | 단추 글의 키 | 화면 안에서 오는 길 | 근거 |
|---|---|---|---|---|---|---|
| CL-R-014 | `/{l}/about/` | `[locale]/about/page.tsx` | `/guide` | `nav.guide` | 없음(주소로만) | 코드, 화면 |
| CL-R-015 | `/{l}/community/` | `[locale]/community/page.tsx` | `/` | `nav.boxes` | 없음(주소로만) | 코드, 화면 |
| CL-R-016 | `/{l}/community/board/` | `[locale]/community/board/page.tsx` | `/` | `nav.boxes` | 없음(주소로만) | 코드, 화면 |
| CL-R-017 | `/{l}/fairness/` | `[locale]/fairness/page.tsx` | `/verify` | `nav.verify` | 이용 방법 화면의 링크(CL-R-010) | 코드, 화면 |
| CL-R-018 | `/{l}/profile/` | `[locale]/profile/page.tsx` | `/account` | `nav.account` | 없음(주소로만) | 코드, 화면 |

공통: 읽는 스토어는 없다(공통 껍데기 것만). 주소 값을 읽지 않는다. 로그인은 필요 없다. 스스로 넘어가지 않고 사람이 단추를 눌러야 한다.
옛 화면의 내용(소개, 후기 피드, 게시판, 공정성 설명, 프로필 설정)은 이 주소들에서 사라졌고, 그 컴포넌트는 저장소에 남아 있으나 어느 라우트도 그리지 않는다(UI 문서 6장).

### CL-R-019 개발용 갤러리

| 항목 | 내용 |
|---|---|
| 주소 | `/{l}/dev/gallery/` |
| 파일 | `web/app/[locale]/dev/gallery/page.tsx` |
| 맨 위 컴포넌트 | 개발 서버: `AppShell` 안의 `Gallery` (`components/dev/Gallery.tsx:42`). 프로덕션 빌드: `notFound()` |
| 보이는 것(개발 서버) | 부품 견본: 단추 다섯, 링크 셋, 알약, 카드와 행, 입력칸, 상태 줄 6, 실패 줄 12, 빈 상태 3, 자리 표시, 블록체인 기록 다섯 상태, 검증 방식, 토스트, 시트 여덟 가지를 여는 단추, 확인창 넷, 개봉 결과 셋 |
| 읽는 스토어 | `authStore.openAuthModal`, `flowStore`(openCharge, openMenu), 토스트 스토어, `currencyStore` |
| 들어오는 길 | 없음. 주소로만 |
| 화면에서 닿는가 | 닿지 않음. 배포 사이트에서는 이 주소가 200 으로 열리지만 내용은 "없는 주소" 화면이다 |
| 로그인 | 필요 없음 |
| 근거 | 코드: `dev/gallery/page.tsx:8`. 실행: `/ko/dev/gallery/` 200, 152KB. 화면: 세 언어 모두 제목이 "없는 주소", "Address not found", "地址不存在" 이고 머리줄과 꼬리말이 붙어 있음 |
| 알아 둘 것 | 배포 사이트에서 `[locale]/not-found.tsx`(CL-R-020)가 실제로 뜨는 주소는 이 세 곳뿐이다. 갤러리의 실제 화면은 개발 서버에서만 볼 수 있어 이번에 열어 보지 않았다(확인 불가: 개발 서버는 총괄의 것이라 건드리지 않았다) |

### CL-R-020 없는 주소(언어 안)

| 항목 | 내용 |
|---|---|
| 파일 | `web/app/[locale]/not-found.tsx` |
| 맨 위 컴포넌트 | `NotFoundScreen` (`components/shell/StateScreens.tsx:11`). `AppShell` 을 스스로 감싼다 |
| 보이는 것 | 머리줄, 제목 "없는 주소", 한 줄, "박스 보러 가기" 단추(`/`), 꼬리말 |
| 뜨는 때 | `[locale]` 아래에서 `notFound()` 가 불릴 때. 정적 배포에서는 빌드 때 `notFound()` 를 부른 화면에만 구워진다 |
| 화면에서 닿는가 | 배포 사이트에서는 `/{l}/dev/gallery/` 세 곳에서만 보인다(화면). 그 밖의 없는 주소는 CL-R-021 이 뜬다 |
| 문구 키 | `state.notFoundTitle`, `state.notFoundDesc`, `state.toBoxes` |
| 근거 | 코드. 화면 |

### CL-R-021 없는 주소(루트, `404.html`)

| 항목 | 내용 |
|---|---|
| 파일 | `web/app/not-found.tsx` |
| 맨 위 컴포넌트 | `RootNotFound` |
| 보이는 것 | 머리줄도 꼬리말도 없이 제목, 한 줄, 단추 하나. 맨 위의 색 선도 없다 |
| 뜨는 때 | 배포 사이트의 모든 없는 주소. GitHub Pages 가 `404.html` 을 404 상태로 준다: 없는 박스, 없는 문서, 없는 화면, 없는 언어(`/ja/`), `/{l}/box/`, `/{l}/admin/` |
| 언어 | 처음에는 한국어로 그리고, 뜬 뒤에 주소의 마디 가운데 ko, en, zh 를 찾아 바꾼다. `<html lang>` 은 ko 로 남는다(화면: `/en/no-such-page/` 의 글은 영어, lang 은 ko) |
| 단추가 가는 곳 | `"/" + 언어`. basePath 가 붙지 않는다 |
| 근거 | 코드: `app/not-found.tsx:11-27`. 화면: 단추의 href 가 `/ko`, `/en`, `/zh`. 실행: `https://shinwon446-eng.github.io/ko` 는 GitHub 의 "Site not found" 404 |
| 알아 둘 것 | 이 화면의 단 하나뿐인 단추가 사이트 밖의 404 로 나간다. 일반 `<a>` 라 Next 의 basePath 가 붙지 않기 때문이다. 없는 주소로 들어온 사람은 주소를 고쳐 쳐야 돌아올 수 있다 |

### CL-R-022 오류 화면

| 항목 | 내용 |
|---|---|
| 파일 | `web/app/[locale]/error.tsx` |
| 맨 위 컴포넌트 | `ErrorScreen` (`components/shell/StateScreens.tsx:23`). `AppShell` 을 스스로 감싼다 |
| 보이는 것 | 제목, 한 줄, "다시 불러오기" 단추(`reset`) |
| 뜨는 때 | `[locale]` 아래 화면이 그리다 던졌을 때 |
| 화면에서 닿는가 | 일부러 띄울 길이 없다. 이번에 띄워 보지 못했다(확인 불가) |
| 문구 키 | `state.errorTitle`, `state.errorDesc`, `state.retry` |
| 알아 둘 것 | 루트에는 `global-error.tsx` 가 없다. 루트 레이아웃이나 `AppShell` 자체가 던지면 Next 의 기본 오류 화면이 나온다(짐작). `ErrorScreen` 이 `AppShell` 을 다시 그리므로, 던진 곳이 `AppShell` 이면 오류 화면도 던진다(짐작) |

### CL-R-023 없는 언어

| 주소 | 결과 | 근거 |
|---|---|---|
| `/ja/`, `/no-such/` | 404, CL-R-021 이 한국어로 뜬다 | 실행, 화면 |

코드에는 `[locale]/layout.tsx:63` 의 `notFound()` 가 있지만 정적 배포에서는 그 주소가 구워지지 않아 `404.html` 이 대신 나온다.

### CL-R-024 빗금 없는 주소

| 주소 | 결과 | 근거 |
|---|---|---|
| `/ko`, `/ko/guide` | 301 로 빗금 붙은 주소로 넘어감(GitHub Pages 가 폴더 주소에 빗금을 붙인다) | 실행 |

## 4. 라우트 파일 18개 x 언어 3개 (실행: `http-scan.json`, 화면: `probe-crawl.json`)

상태는 HTTP 상태 코드, 제목은 화면에 뜬 `h1` 이다.

| 라우트 파일 | ko | en | zh |
|---|---|---|---|
| `page.tsx` | 200 박스 | 200 Boxes | 200 盲盒 |
| `about/page.tsx` | 200 옮긴 화면 | 200 This page moved | 200 页面已迁移 |
| `account/page.tsx` | 200 계정 | 200 Account | 200 账户 |
| `box/[slug]/page.tsx` (334) | 200 x 334 | 200 x 334 | 200 x 334 |
| `community/page.tsx` | 200 옮긴 화면 | 200 This page moved | 200 页面已迁移 |
| `community/board/page.tsx` | 200 옮긴 화면 | 200 This page moved | 200 页面已迁移 |
| `dev/gallery/page.tsx` | 200 없는 주소 | 200 Address not found | 200 地址不存在 |
| `fairness/page.tsx` | 200 옮긴 화면 | 200 This page moved | 200 页面已迁移 |
| `guide/page.tsx` | 200 이용 방법 | 200 How it works | 200 使用方法 |
| `inventory/page.tsx` | 200 보관함 | 200 Inventory | 200 保管箱 |
| `legal/page.tsx` | 200 정책 및 이용 안내 | 200 Policies & your rights | 200 政策与使用指南 |
| `legal/[doc]/page.tsx` (13) | 200 x 13 | 200 x 13 | 200 x 13 |
| `profile/page.tsx` | 200 옮긴 화면 | 200 This page moved | 200 页面已迁移 |
| `reviews/page.tsx` | 200 후기 | 200 Reviews | 200 评价 |
| `verify/page.tsx` | 200 개봉 결과 검증 | 200 Verify result | 200 验证开箱结果 |
| `wallet/page.tsx` | 200 지갑 | 200 Wallet | 200 钱包 |
| `wallet/withdraw/page.tsx` | 200 출금 | 200 Withdraw | 200 提现 |
| `wins/page.tsx` | 200 나온 상품 | 200 Recent results | 200 开出的商品 |

Chrome 으로 연 정상 주소 67곳(언어마다 22곳과 루트)에서 콘솔 오류는 0 건이었다(화면: `probe-crawl.json` 의 `errors`). 없는 주소 11곳에서는 404 한 줄씩만 찍혔다.
PC 폭(1280)에서 가로로 넘치는 화면은 없었다(`docW` 가 전부 1280).

## 5. 메뉴와 주소의 대응

| 자리 | 항목 | 근거 |
|---|---|---|
| 머리줄 메뉴(900px 이상)와 메뉴 시트(900px 미만) | 박스 `/`, 보관함 `/inventory`, 지갑 `/wallet`, 나온 상품 `/wins`, 개봉 결과 검증 `/verify`, 이용 방법 `/guide`, 계정 `/account` | 코드: `AppShell.tsx:23-31`. 화면: 일곱 개 |
| 꼬리말 "상품" 묶음 | 박스, 보관함, 지갑, 후기 `/reviews`, 나온 상품 | 코드: `AppFooter.tsx:44-48`. 화면 |
| 꼬리말 "도움" 묶음 | 이용 방법, 개봉 결과 검증 | 코드: `AppFooter.tsx:52-53` |
| 꼬리말 "약관" 묶음 | 약관과 정책 `/legal` | 코드: `AppFooter.tsx:57` |
| 꼬리말 "설정" 묶음 | 다른 두 언어의 같은 화면, 표시 통화 단추 | 코드: `AppFooter.tsx:61-62`. 화면: 주소의 화면 부분이 유지됨 |
| 꼬리말 윗줄 | "고객 관계 요약" `/guide` | 코드: `AppFooter.tsx:32` |

머리줄에만 있는 것: 계정. 꼬리말에만 있는 것: 후기, 약관과 정책, 언어, 표시 통화.
어느 메뉴에도 없는 것: 출금(지갑과 잔액 시트와 계정에서 간다), 약관 문서 13개(목록에서 간다), 옛 주소 다섯, 갤러리.

언어를 바꾸는 링크는 주소의 화면 부분만 유지한다. 주소에 붙은 값(`?box=`, `?s=`)은 따라가지 않는다(코드: `AppFooter.tsx:61` 이 `usePathname()` 만 넘긴다. 짐작: 값이 떨어지는 것을 화면에서 눌러 보지는 않았다).

## 6. 주소가 없는 화면(라우트에 묶이지 않은 것)

화면 전체를 덮지만 주소가 바뀌지 않는 것들이다. 새로 고치거나 뒤로 가면 사라진다.

| 무엇 | 뜨는 곳 | 주소 | 근거 |
|---|---|---|---|
| 개봉 장면 `Opening`(화면 전체, z 150) | 박스 화면에서 한 개를 열었을 때, 못 본 결과가 하나일 때 | `/box/{slug}/` 그대로 | 코드: `BoxScreen.tsx:319`. 화면 |
| 개봉 결과 `Reveal`(화면 전체, z 150) | 박스 화면에서 여러 개를 열었을 때 | `/box/{slug}/` 그대로 | 코드: `BoxScreen.tsx:320`. 화면 |
| 출금의 단계 화면 여섯(관문, 입력, 확인, 인증 앱, 이메일, 신청함) | 출금 화면 | `/wallet/withdraw/` 그대로 | 코드: `WithdrawScreen.tsx:179-264` |
| 홈의 검색 결과 | 홈의 찾기 칸에 글을 넣었을 때 | `/` 그대로(검색어가 주소에 남지 않는다) | 코드: `BoxList.tsx:86`. 화면 |
| 보관함의 탭 셋 | 보관함 | `/inventory/` 그대로(탭이 주소에 남지 않는다) | 코드: `InventoryScreen.tsx:45` |
| 시트와 확인창 전부 | UI 문서 5장 | 그대로 | UI 문서 |

못 본 개봉 결과는 주소가 없어도 되살아난다: 연출 중에 떠났다 돌아오면 박스 화면의 주 단추가 "결과 보기"로 바뀐다(코드: `BoxScreen.tsx:113-138`, `stores/openingJournal.ts`).

## 7. 옛 문서와 어긋나는 것

| 옛 문서의 말 | 지금 코드와 배포 화면 | 근거 |
|---|---|---|
| 루트 `UI_INVENTORY.md`(2026-10-10, 개편 전): 라우트는 언어마다 10종(메인, about, community, community/board, fairness, inventory, legal, legal/[doc], profile, 루트) | 라우트 파일 18개. 새로 생긴 것: account, box/[slug], dev/gallery, guide, reviews, verify, wallet, wallet/withdraw, wins | 코드 |
| 같은 문서: about, community, community/board, fairness, profile 에 각자의 화면이 있다 | 다섯 주소 모두 "옮긴 화면" 한 장이다 | 코드, 화면 |
| 같은 문서: 홈은 "기본 gpt 홈"이고 주소에 `?skin=netflix`, `?skin=commerce` 를 붙이면 다른 시안이 뜬다 | 홈은 `BoxList` 하나다. `skin` 값을 읽는 코드가 닿는 소스에 없다. `NetflixHome`, `CommerceHome` 과 세 스킨 CSS 는 남아 있으나 쓰이지 않는다 | 실행: `import-graph.mjs`, `css-usage.mjs` |
| 같은 문서: 박스는 홈의 상세 창(`DetailModal`)으로 연다 | 박스마다 주소가 있는 화면이다(`/box/{slug}/`). `DetailModal` 은 어느 라우트도 그리지 않는다 | 코드, 실행 |
| 같은 문서: 문서 화면 위에 다른 문서로 가는 탭(`LegalNav`)이 있다 | 문서 화면에는 뒤로 가기와 목록 링크뿐이다. `LegalNav` 는 쓰이지 않는다 | 코드: `LegalDocScreen.tsx`, 실행 |
| 같은 문서: `role="dialog"` 창 17개 파일 | 닿는 소스에서 `role="dialog"` 를 내는 곳은 `ui/Sheet.tsx`(Sheet 와 Confirm), `box/Opening.tsx`, `box/Reveal.tsx` 넷이다. 옛 17개 파일은 전부 닿지 않는다 | 코드, 실행 |
| `AppShell.tsx:22` 의 주석: "옮기는 동안 일부 주소는 옛 화면을 가리킨다" | 메뉴 일곱 개가 모두 새 화면을 가리킨다 | 코드 |
| `auth/AuthHost.tsx:15` 의 주석: 여기서 확인 토스트를 하나로 띄운다 | `AuthHost` 는 `LoginSheet` 만 그린다. `authStore.toast` 를 그리는 곳은 닿는 소스에 없다(쓰는 곳은 `CommunityBoard` 하나, 닿지 않음) | 코드, 실행 |
| `dev/gallery/page.tsx:6` 의 주석: 프로덕션 빌드에서는 없는 주소다 | 배포 사이트에서 200 으로 열리고 "없는 주소" 화면이 나온다(404 상태가 아니다) | 실행 |
| `web/scripts/capture/states.mjs:14-16`: 전용 오프라인, 세션 만료 디자인이 없다 | 오프라인 한 줄과 세션 끝남 한 줄이 `AppShell` 에 있다 | 코드: `StateScreens.tsx:37-57`. 화면: 오프라인 한 줄 |

## 8. 수

| 무엇 | 수 |
|---|---|
| 번호를 붙인 라우트 항목(CL-R-001 ~ 024) | 24 |
| 라우트 파일 | 18 |
| 라우트 파일 x 언어 | 54 |
| 정적 화면(언어, 박스, 문서를 다 편 것) | 1,090 과 `404.html` |
| 화면 안의 링크로 닿는 라우트 파일 | 13 (홈, 박스, 보관함, 지갑, 출금, 나온 상품, 후기, 검증, 이용 방법, 계정, 약관 목록, 약관 문서, 그리고 `fairness` 옮긴 화면) |
| 주소로만 닿는 라우트 파일 | 5 (about, community, community/board, profile, dev/gallery) |
| 주소로만 닿는 박스 | 1 (`jackpot-supercar`), 언어를 곱하면 3 화면 |
| 홈에서는 닿지 않고 후기 화면으로만 닿는 박스 | 13, 언어를 곱하면 39 화면 |
| 배포 사이트에서 내용이 "없는 주소"인 200 화면 | 3 (`/{l}/dev/gallery/`) |
| 404 로 확인한 주소 | 17 |

## 9. 확인하지 못한 것

- 개발용 갤러리의 실제 화면: 개발 서버에서만 뜬다. 총괄의 개발 서버를 건드리지 않으려고 열지 않았다. 소스만 읽었다.
- 오류 화면(CL-R-022): 띄울 방법을 찾지 못했다.
- 스크립트가 꺼진 브라우저에서 루트의 `meta refresh` 가 실제로 넘어가는지: HTML 에 태그가 있는 것만 확인했다.
- 영어, 중국어 브라우저에서 루트가 각각 `/en/`, `/zh/` 로 가는지: 한국어 브라우저로만 열었다. 코드로는 그렇게 된다.
- 로그인한 상태의 화면은 `web/scripts/capture/states.mjs` 의 값을 새 창에 심어 만들었다. 실제 가입 흐름을 밟은 계정이 아니다.
- 언어 링크가 주소의 값(`?box=`)을 떨어뜨리는지: 코드로만 보았다.
- `lib/api.ts`, `lib/account.ts`, `lib/browserAccount.ts` 는 필요한 줄만 읽었다. 서버 주소가 있을 때의 동작은 보지 않았다(배포 사이트에는 서버가 없다).
