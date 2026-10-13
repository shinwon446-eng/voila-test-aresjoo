# 인터랙션 매트릭스 (Claude 분석가 B)

기준 커밋 `63445c7` 의 소스를 읽고, 배포된 참조 사이트 https://shinwon446-eng.github.io/voila-test-aresjoo/ko/ 를 Playwright 로 실제로 눌러 확인한 결과다. 분석만 했다. `web/` 과 기존 문서는 고치지 않았고, 커밋하지 않았고, 빌드를 돌리지 않았다. `migration-audit/analysis/` 의 다른 파일은 읽지 않았다.

## 0. 읽는 법

### 0.1 증거의 말

| 표기 | 뜻 |
|---|---|
| 실행 NN:id | 직접 실행했다. `migration-audit/harness/claude-b/NN-*.mjs` 의 시나리오 id. 결과는 같은 폴더의 `results/NN-*.json` |
| 화면 NN:id | 그 시나리오에서 화면에 있는 것(글, 주소, 속성)을 읽었다. 그 컨트롤을 누르지는 않았다 |
| 코드 | 소스에서만 읽었다. 실행하지 않았다 |
| 어긋남 | 실행했더니 소스의 의도나 화면의 약속과 다르게 움직였다. 6절에 모았다 |
| 짐작 | 근거 없이 미루어 본 것. 이 문서에는 따로 표시한 곳에만 있다 |

### 0.2 실행한 명령

전부 `web/` 폴더에서 돌렸다(이 기기의 규칙에 따라 앞에 `rtk proxy` 를 붙였다). 대상은 기본값인 배포 사이트다.

| 명령 | 본 것 | 결과(통과, 실패, 본 것만) |
|---|---|---|
| `node ../migration-audit/harness/claude-b/00-probe.mjs` | 사이트가 뜨는지, 박스 주소, 저장 키 | 1, 0, 9 |
| `node ../migration-audit/harness/claude-b/01-nav.mjs` | 머리줄, 메뉴, 목록, 언어와 통화, 옮긴 주소, 없는 주소 | 72, 4, 3 |
| `node ../migration-audit/harness/claude-b/01b-nav-debug.mjs` | 404 의 링크, 뒤로와 앞으로, 다른 탭 로그아웃 | 4, 2, 6 |
| `node ../migration-audit/harness/claude-b/02-box.mjs` | 박스 화면, 상품 시트, 확률표, 후기 | 32, 0, 2 |
| `node ../migration-audit/harness/claude-b/03-auth.mjs` | 가입, 로그인, 로그아웃, 계정 전환, 계정 시트 | 50, 1, 1 |
| `node ../migration-audit/harness/claude-b/04-open.mjs` | 개봉 전부 | 100, 0, 6 |
| `node ../migration-audit/harness/claude-b/05-take.mjs` | 보관함, 받기, 배송 시트 검증, 후기, 잔액 시트, 어긋난 장부, 저장 실패 | 61, 0, 1 |
| `node ../migration-audit/harness/claude-b/06-wallet.mjs` | 지갑, 충전 시트, 출금 검증 | 47, 1, 1 |
| `node ../migration-audit/harness/claude-b/07-verify-wins.mjs` | 검증, 나온 상품 | 21, 0, 0 |
| `node ../migration-audit/harness/claude-b/09-keys-dblclick.mjs` | 키보드, 돈 단추의 더블클릭 | 22, 5, 0 |
| `node ../migration-audit/harness/claude-b/09b-debug.mjs` | 포커스, 더블탭의 간격과 화면 폭 | 16, 10, 1 |
| `node ../migration-audit/harness/claude-b/10-misc.mjs` | 부족한 결과 화면, 두 탭, 여럿 열기 중 새로 고침, 계정을 바꾼 뒤 | 15, 0, 1 |
| `node ../migration-audit/harness/claude-b/12-extra.mjs` | 다른 박스와 비교, 배송 취소, 여럿 결과의 Esc, 후기 사진 | 19, 0, 0 |
| `GALLERY_BASE=http://localhost:3002 node ../migration-audit/harness/claude-b/11-gallery-dev.mjs` | 개발 전용 갤러리(배포 사이트에는 없어 떠 있던 개발 서버에서 봤다) | 36, 1, 2 |

합계: 검사 553개 가운데 통과 496, 실패 24, 본 것만 적은 것 33. 실패 24 가운데 스크립트 쪽 사정인 것이 7개(01:n2 의 뒤로와 앞으로는 01b:d2 가 다시 보아 통과, 01:n4 의 갤러리는 기대값을 404 로 잘못 잡은 것, 01:n5 두 개는 01b:d3 가 다시 봄, 09:k1 두 개는 09b:e1 이 다시 봄, 11:g1 의 토스트 단추는 겹침 화면이 아닌 것을 겹침 화면으로 센 것)이고, 나머지 17개가 실제로 어긋난 것이다(6절). 스크린샷은 `migration-audit/screenshots/before/claude-b/` 에 107장 있다.

### 0.3 시험 상태

`web/scripts/capture/states.mjs` 의 프리셋(guest, firstVisit, zero, insufficient, funded, inventory, shipping, pending, security)을 새 브라우저 컨텍스트에 심었다. 개봉 결과는 `web/scripts/capture/opening-fixtures.json` 의 시드와 회차로 정했다(계산식은 그대로다). 50개와 100개는 고정값이 없어 실제 추첨으로 열고 불변식만 봤다.

알아 둘 것: `states.mjs` 의 `installState` 는 "심었음" 표시를 sessionStorage 에 둔다. sessionStorage 는 탭마다 따로라서, 같은 컨텍스트에서 두 번째 탭을 열면 장부가 프리셋으로 되감긴다. 처음에 이것 때문에 "구매가 사라졌다"는 거짓 실패를 봤다(04:o4 첫 실행). `lib.mjs` 는 표시를 localStorage 에 두고 한 번만 심는다. 기존 캡처 스크립트로 두 탭 시나리오를 볼 때는 두 탭을 먼저 다 연 뒤에 행동해야 한다.

### 0.4 저장 키의 줄임말

실제 키 앞에는 전부 `voila-test-aresjoo:` 가 붙는다(`web/lib/labSite.ts:17-19` 의 래퍼). 앱 코드는 접두사 없는 이름으로 읽고 쓴다.

| 줄임 | 키 | 쓰는 곳 |
|---|---|---|
| W | `voila.browser-wallet.<계정 id>` (비로그인은 `.guest`) | `stores/walletStore.ts:259-294`, 이름은 `lib/browserWallet.ts:5-20` 이 계정마다 바꾼다 |
| I | `voila.browser-inventory.<계정 id>` | `stores/inventoryStore.ts:148-155`, 같은 곳에서 바꾼다 |
| J | `voila.opening-journal` (계정과 무관) | `stores/openingJournal.ts:35-42` |
| F | `gachaflix.fair` | `stores/fairStore.ts:62-69` |
| S | `gachaflix.settings` | `stores/settingsStore.ts:43-49` |
| C | `gachaflix.currency` | `stores/currencyStore.ts:42-54` |
| R | `gachaflix.community` | `stores/communityStore.ts:20-22, 56-60` |
| A | `voila.browser-accounts.v1` | `lib/browserAccount.ts:9, 27-28` |
| SS | `voila.browser-session.v1` | `lib/browserAccount.ts:10` |
| M | `voila.take-unconfirmed.<지갑 키>` | `lib/takeBatch.ts:103-140` |
| L | `gachaflix.locale` | 읽는 곳은 `app/page.tsx:7` 뿐. 도달 가능한 코드에 쓰는 곳이 없다 |

### 0.5 모든 겹침 화면에 공통인 규칙

시트(`components/ui/Sheet.tsx:12-30`)와 확인창(`Sheet.tsx:32-51`)은 전부 `lib/useModal.ts:22-85` 를 쓴다. 아래 표의 행은 시트마다 되풀이하지 않고 여기에 한 번만 적는다. 개봉 화면(`Opening.tsx:124`)과 여럿 결과 화면(`Reveal.tsx:73`)도 같은 훅을 쓰되 Esc 의 뜻이 다르다(해당 절에 적었다).

| id | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|
| CL-I-001 | 시트가 열림 | 열림(상태 변화) | `useModal.ts:26-43` | 닫힘 → 열림 | 본문 스크롤 잠김(`body.style.overflow = hidden`), 포커스가 시트 자체(`role=dialog`, `tabIndex=-1`)로 간다 | 없음 | 실행 01:n1 |
| CL-I-002 | 시트 | 키 Esc | `useModal.ts:48-52`, `Sheet.tsx:14` | 열림 → 닫힘. `locked` 면 무시 | 시트가 사라진다 | 없음 | 실행 01:n1, 02:b1 |
| CL-I-003 | 시트 바깥의 어두운 자리 | mousedown | `Sheet.tsx:17` | 열림 → 닫힘. `locked` 면 무시 | 같다 | 없음 | 실행 01:n1 |
| CL-I-004 | 시트의 X 단추 | click | `Sheet.tsx:19` | 열림 → 닫힘. `locked` 면 눌리지 않는다 | 같다 | 없음 | 실행 01:n1 |
| CL-I-005 | 시트 | 키 Tab, Shift+Tab | `useModal.ts:53-66` | 포커스가 시트 안에서 돈다(끝에서 처음으로, 처음에서 끝으로) | 포커스 고리만 움직인다 | 없음 | 실행 01:n1, 09:k1 |
| CL-I-006 | 시트가 닫힘 | 닫힘(상태 변화) | `useModal.ts:69-84` | 열림 → 닫힘 | 스크롤 잠금이 풀리고 포커스가 연 단추로 돌아간다. 연 단추가 사라졌으면 본문 | 없음 | 실행 01:n1, 09b:e1 |
| CL-I-007 | 확인창 | 키 Esc | `useModal.ts:48-52`, `Sheet.tsx:34` | 열림 → 취소. `busy` 면 무시 | 확인창이 닫히고 부른 화면으로 돌아간다 | 없음 | 실행 04:o5, 05:t1, 09b:e1 |
| CL-I-008 | 확인창 바깥 | mousedown | `Sheet.tsx:37` | 열림 → 취소. `busy` 면 무시 | 같다 | 없음 | 실행 04:o7 |
| CL-I-009 | 확인창의 확정 단추 | click | `Sheet.tsx:44` → 부른 쪽의 `onConfirm` | 부른 쪽이 정한다. `busy` 면 눌리지 않고 글이 "확인 중" 등으로 바뀐다 | 부른 쪽이 정한다 | 부른 쪽이 정한다 | 실행 04:o5, 05:t1 |
| CL-I-010 | 확인창의 취소 링크 | click | `Sheet.tsx:45` | 열림 → 취소. `busy` 면 무시 | 확인창이 닫힌다 | 없음 | 실행 04:o3, 04:o5 |
| CL-I-011 | 확인창이 열림 | 열림, 그리고 키 Enter | `useModal.ts:39-43` | 포커스는 확정 단추가 아니라 창 자체에 있다. Enter 만 눌러서는 확정되지 않는다. Tab 한 번 뒤 Enter 는 확정한다 | 없음 | 없음 | 실행 09b:e1, 09:k2 |
| CL-I-012 | 겹친 창 둘(시트 위의 확인창, 결과 화면 위의 시트) | 키 Esc | `useModal.ts:45` (맨 위 창만 받는다) | Esc 한 번에 맨 위 하나만 닫힌다 | 아래 창이 다시 보인다 | 없음 | 실행 04:o3, 09b:e1, 10:m1 |
| CL-I-013 | 토스트 | 뜸, 2.4초 뒤 사라짐 | `components/ui/toast.tsx:17-24` | 없음 → 한 줄 → 없음 | 화면 아래 한 줄 | 없음 | 실행 11:g1(개발 서버). 배포 사이트에서는 토스트를 띄우는 길이 주소 복사(CL-I-147)와 인증 앱 키 복사(CL-I-167)뿐이다 |

같은 자리 규칙: 시트에서 확인창으로, 상품 상세에서 배송 시트나 검증 시트로 넘어갈 때 앞의 시트는 `open` 조건에서 빠져 사라지고 새 창이 같은 자리에 뜬다(겹쳐 쌓지 않는다). 그래서 모바일 폭에서는 앞 시트의 주 단추와 확인창의 확정 단추가 같은 좌표에 온다(CL-I-106, CL-I-181, CL-I-199).

## 1. 머리줄, 메뉴, 꼬리말, 상태 줄

| id | 화면 | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|---|
| CL-I-014 | 머리줄 | 로고 | click | `layout/BrandLogo.tsx:37`, `shell/AppShell.tsx:47` | 어느 화면 → `/` | 박스 목록 | 없음 | 실행 01:n1 |
| CL-I-015 | 머리줄(PC 폭) | 링크 일곱(박스, 보관함, 지갑, 나온 상품, 개봉 결과 검증, 이용 방법, 계정) | click | `AppShell.tsx:49` | 그 화면으로 | 화면이 바뀐다. `aria-current` 는 박스에만 붙는다 | 없음 | 실행 01:n1. 어긋남(6절 F-09) |
| CL-I-016 | 머리줄(로그인) | 잔액 단추 | click, Enter | `AppShell.tsx:52` → `flowStore.ts:30` | 잔액 시트 닫힘 → 열림. 주소는 그대로 | 잔액 시트 | 없음 | 실행 01:n1, 05:t4, 09b:e1 |
| CL-I-017 | 머리줄(비로그인) | 로그인 단추 | click | `AppShell.tsx:53` → `authStore.ts:26` | 로그인 시트 닫힘 → 열림(login) | 로그인 시트 | 없음 | 실행 01:n1 |
| CL-I-018 | 머리줄(모바일 폭) | 메뉴 단추 | click | `AppShell.tsx:54` → `flowStore.ts:28` | 메뉴 닫힘 → 열림, `aria-expanded` 가 true | 메뉴 시트 | 없음 | 실행 01:n1 |
| CL-I-019 | 메뉴 시트 | 행 일곱 | click | `AppShell.tsx:62` | 메뉴 닫힘, 그 화면으로 | 시트가 닫히고 화면이 바뀐다 | 없음 | 실행 01:n1(이용 방법 행), 01:n3(지갑 행). 나머지 행은 화면 01:n1 |
| CL-I-020 | 머리줄 아래 | 오프라인 한 줄 | 브라우저의 offline, online | `shell/StateScreens.tsx:45-57` | 연결 → 끊김 → 연결 | 한 줄이 뜨고 사라진다 | 없음 | 실행 01:n5 |
| CL-I-021 | 머리줄 아래 | 세션 끝남 한 줄의 로그인 링크 | click | `StateScreens.tsx:42` | 로그인 시트 열림 | 로그인 시트 | 없음 | 실행 01b:d3 |
| CL-I-022 | 전역 | 다른 탭의 로그아웃, 비밀번호 변경, 탈퇴 | storage 사건 | `stores/authStore.ts:99-113` | 로그인 → 세션 끝남 | 세션 끝남 한 줄 | 없음 | 실행 01b:d3. 어긋남(F-04): 배포 사이트에서는 사건의 키에 접두사가 붙어 와서 이 분기가 한 번도 맞지 않는다 |
| CL-I-023 | 전역 | 창으로 돌아옴 | focus, visibilitychange | `authStore.ts:114-126` | 세션을 다시 확인. 없으면 세션 끝남 | 세션 끝남 한 줄, 잔액 단추가 로그인 단추로 | 없음 | 실행 01b:d3(focus 사건을 보내서) |
| CL-I-024 | 전역 | 저장 공간이 가득 참 | `voila:storage-full` 사건 | `lib/labSite.ts:19`, `layout/LabBadge.tsx:20-26` | 없음 → 안내 | 왼쪽 아래에 저장하지 못했다는 안내 | 그 쓰기는 버려진다 | 실행 04:o10 |
| CL-I-025 | 꼬리말 | 고객 관계 요약 | click | `shell/AppFooter.tsx:32` | `/guide` 로 | 이용 방법 | 없음 | 화면 01:n4 |
| CL-I-026 | 꼬리말 | 제품 링크 다섯(박스, 보관함, 지갑, 후기, 나온 상품) | click | `AppFooter.tsx:44-48` | 그 화면으로 | 화면이 바뀐다 | 없음 | 화면 01:n4(주소를 읽었다) |
| CL-I-027 | 꼬리말 | 도움 링크 둘(이용 방법, 개봉 결과 검증) | click | `AppFooter.tsx:52-53` | 그 화면으로 | 같다 | 없음 | 화면 01:n4 |
| CL-I-028 | 꼬리말 | 약관과 정책 | click | `AppFooter.tsx:57` | `/legal` 로 | 같다 | 없음 | 화면 01:n4 |
| CL-I-029 | 꼬리말 | 언어 링크 둘(지금 언어를 뺀 둘) | click | `AppFooter.tsx:61` | 같은 경로의 다른 언어 주소로 | 글이 그 언어로, `html lang` 이 바뀐다(`layout/LocaleHtmlLang.tsx:8-10`) | 없음. L 은 바뀌지 않는다 | 실행 01:n3. 어긋남(F-10) |
| CL-I-030 | 꼬리말 | 통화 단추(원화로 보기, 달러로 보기) | click | `AppFooter.tsx:62` → `currencyStore.ts:39` | USD ↔ KRW | 화면의 모든 금액 글자가 한꺼번에 바뀐다. 장부의 숫자는 그대로 | C 의 currency | 실행 01:n3 |
| CL-I-031 | 꼬리말 | 팔로우 그림 넷 | 없음 | `AppFooter.tsx:35-37`, `lib/social.ts:7-12` | 주소가 비어 있어 링크가 아니다 | 없음 | 없음 | 실행 01:n4 |

## 2. 루트, 옮긴 주소, 없는 주소, 읽는 화면

| id | 화면 | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|---|
| CL-I-032 | 루트 `/` | 진입 | 주소 직접 입력 | `app/page.tsx:7` (인라인 스크립트) | L 이 있으면 그 언어, 없으면 브라우저 언어(ko, zh, 그 밖은 en)로 `location.replace` | 그 언어의 박스 목록 | 없음 | 실행 01:n3 |
| CL-I-033 | 옛 주소 다섯(`about`, `fairness`, `profile`, `community`, `community/board`) | 단추 하나 | click | `shell/MovedScreen.tsx:14` | 새 화면으로(`guide`, `verify`, `account`, `/`, `/`) | 화면이 바뀐다 | 없음 | 실행 01:n4 |
| CL-I-034 | 없는 주소(GitHub Pages 가 주는 `404.html`) | 박스 보기 링크 | click | `app/not-found.tsx:25` | 사이트 밖으로 나간다 | GitHub 의 "Site not found" 화면 | 없음 | 실행 01b:d1. 어긋남(F-05) |
| CL-I-035 | 로케일 안의 없는 주소 화면 | 박스 보기 링크 | click | `StateScreens.tsx:17` | `/` 로 | 박스 목록 | 없음 | 화면 01b:d1. 배포 사이트에서는 `/ko/dev/gallery/` 에서만 이 화면이 나온다(상태 200) |
| CL-I-036 | 오류 화면 | 다시 불러오기 | click | `StateScreens.tsx:29`, `app/[locale]/error.tsx:5-7` | 오류 → 다시 그리기 | 화면이 다시 그려진다 | 없음 | 코드 |
| CL-I-037 | 이용 방법 | 링크 둘(개봉 결과 검증, 약관과 정책) | click | `app/[locale]/guide/page.tsx:26` | `/fairness`(옮긴 화면), `/legal` | 검증 링크는 옮긴 화면을 한 번 거친다 | 없음 | 실행 01:n4. 어긋남(F-11) |
| CL-I-038 | 약관과 정책 | 문서 행 13 | click | `legal/LegalCenterScreen.tsx:22` | `/legal/<문서>` | 그 문서 | 없음 | 실행 01:n4(첫 행), 나머지는 화면 |
| CL-I-039 | 약관 문서 | 뒤로 화살표, 아래의 목록 링크 | click | `legal/LegalDocScreen.tsx:15, 25` | `/legal` | 목록 | 없음 | 실행 01:n4 |

## 3. 박스 목록과 박스 화면

### 3.1 박스 목록 (`components/box/BoxList.tsx`, `components/home/HeroBanner.tsx`)

| id | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|
| CL-I-040 | 상품 검색 칸 | change | `BoxList.tsx:85` | 검색어 없음 → 있음 | 배너, 분류, 카드가 사라지고 상품 행(30행까지)이 나온다. 없으면 빈 상태 한 줄 | 없음 | 실행 01:n2 |
| CL-I-041 | 상품 검색 칸 | 지움(빈 값, 공백만) | `BoxList.tsx:64-66, 85` | 있음 → 없음 | 배너, 분류, 카드가 돌아온다 | 없음 | 실행 01:n2. 브라우저가 그리는 지우기 X 는 누르지 않았다(같은 change 경로다, 코드) |
| CL-I-042 | 상품 검색 칸 | 키 Enter | 없음(폼이 아니다) | 그대로 | 없음 | 없음 | 실행 01:n2 |
| CL-I-043 | 검색 결과의 상품 행 | click | `BoxList.tsx:91` | `/box/<slug>` 로 | 그 박스 화면 | 없음 | 실행 01:n2 |
| CL-I-044 | 분류 알약(전체 박스와 분류 16) | click | `BoxList.tsx:102`, `ui/kit.tsx:39` | 분류가 바뀌고 보여 주는 수가 24로 돌아간다 | 그 분류의 카드만 | 없음 | 실행 01:n2 |
| CL-I-045 | 박스 더 보기 | click | `BoxList.tsx:106` | 보여 주는 수 +24 | 카드가 늘고 남은 수가 준다 | 없음 | 실행 01:n2 |
| CL-I-046 | 박스 카드 | click | `BoxList.tsx:119` | `/box/<slug>` 로 | 박스 화면 | 없음 | 실행 01:n2 |
| CL-I-047 | 박스 목록 | 뒤로 가기(박스 화면에서 돌아옴) | 브라우저 | 검색어, 분류, 더 보기로 늘린 수는 전부 처음으로 | 전체 박스 24장. 스크롤 위치는 줄어든 길이 안에서만 돌아온다 | 없음 | 실행 01:n2, 07:v3, 01b:d2 |
| CL-I-048 | 배너(비로그인) | 가입하고 무료 언박싱 | click | `HeroBanner.tsx:185` | 가입 시트 열림(signup) | 가입 시트 | 없음 | 실행 01:n2 |
| CL-I-049 | 배너(로그인) | 무료 언박싱, 또는 박스 보기 링크 | click | `HeroBanner.tsx:184` | 가입 혜택 박스(리자몽 박스)로 | 박스 화면 | 없음 | 화면 01:n2 |
| CL-I-050 | 배너 | 움직임 줄이기 설정 변화, 화면 밖으로 나감, 창 크기 변화 | matchMedia change, IntersectionObserver, resize, requestAnimationFrame | `HeroBanner.tsx:58-63, 65-70, 72-80, 88-127` | 도는 장면이 멈추거나 이어진다 | 장면만 | 없음 | 코드(애니메이션 목록의 범위) |

### 3.2 박스 화면 (`components/box/BoxScreen.tsx`)

| id | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|
| CL-I-051 | 뒤로 화살표 | click | `BoxScreen.tsx:175`, `kit.tsx:50` | `/` 로 | 박스 목록 | 없음 | 화면 02:b1 |
| CL-I-052 | 별점 줄(후기가 있는 박스) | click | `BoxScreen.tsx:176` | 후기 절로 부드럽게 스크롤 | 스크롤 | 없음 | 실행 02:b1 |
| CL-I-053 | 대표 상품 | click | `BoxScreen.tsx:180` | 구성품 절로 스크롤 | 스크롤 | 없음 | 실행 02:b1 |
| CL-I-054 | 수량 알약(1, 5, 10, 50, 100) | click, Space, Enter | `BoxScreen.tsx:203` | 수량이 바뀌고 실패 한 줄이 지워진다. 구매 처리 중에는 눌리지 않는다 | 주 단추의 개수와 금액, 부족 한 줄, 비로그인 한 줄이 따라 바뀐다 | 없음(새로 고치면 1개) | 실행 04:o5, 04:o7, 09:k2, 10:m3 |
| CL-I-055 | 주 단추(계정 확인 전) | 없음 | `BoxScreen.tsx:204` | 눌리지 않는다("불러오는 중") | 없음 | 없음 | 코드 |
| CL-I-056 | 주 단추(비로그인): 로그인하고 언박싱 | click | `BoxScreen.tsx:205` | 로그인 시트 열림. 구매 없음 | 로그인 시트 | 없음 | 실행 04:o7 |
| CL-I-057 | 주 단추(못 본 결과가 있음): 결과 보기 | click | `BoxScreen.tsx:206` → `recover` `119-138` | RECOVERY_REQUIRED → REVEALED | 연출 없이 결과 화면 | J 에 봤음(결과가 보인 뒤) | 실행 04:o4, 10:m3 |
| CL-I-058 | 주 단추(부족, 보관 상품으로 채워짐): USDT로 받기 | click | `BoxScreen.tsx:207` | 선택 시트 열림 | 선택 시트 | 없음 | 화면 04:o7(단추와 한 줄을 봤다). 누르는 것은 코드 |
| CL-I-059 | 그 아래 링크: USDT 충전하기 | click | `BoxScreen.tsx:207` | 충전 시트 열림 | 충전 시트 | 없음 | 화면 04:o7 |
| CL-I-060 | 주 단추(부족, 채워지지 않음): USDT 충전하기, 그리고 링크 USDT로 받기 | click | `BoxScreen.tsx:208` | 충전 시트, 또는 선택 시트 | 같다 | 없음 | 코드 |
| CL-I-061 | 주 단추(부족, 보관 상품 없음): USDT 충전하기 | click | `BoxScreen.tsx:209` | 충전 시트 열림 | 충전 시트 | 없음 | 실행 04:o7 |
| CL-I-062 | 주 단추(충분): N개 언박싱, 또는 무료 언박싱 | click, Enter | `BoxScreen.tsx:210` → `press` `160-165` → `open` `140-158` | READY → PURCHASE_PROCESSING → OUTCOME_COMMITTED → OPENING | 단추가 "여는 중", 이어서 개봉 화면 | W(잔액, 거래), I(기록), F(회차), 옛 박스는 W 의 burst | 실행 04:o1, 04:o8, 09:k2 |
| CL-I-063 | 같은 단추 | 연타(같은 순간 다섯 번), 더블클릭 | `BoxScreen.tsx:77, 142` (동기 잠금), `lib/openingFlow.ts:130` | 구매는 한 번만 | 개봉 화면 하나 | 구매 1건 | 실행 04:o2 |
| CL-I-064 | 같은 단추 | 연출 중 다시 누름(밑에 깔린 단추를 프로그램으로, 같은 자리를 마우스로) | `BoxScreen.tsx:161` | 아무 일도 없다 | 없음 | 없음 | 실행 04:o2 |
| CL-I-065 | 큰 금액 확인창(50 USDT 이상이거나 10개 이상) | 주 단추 click | `BoxScreen.tsx:164, 316` | READY → CONFIRMING | 확인창("금액 결제") | 없음 | 실행 04:o5, 04:o7 |
| CL-I-066 | 그 확인창 | 확정, 취소, Esc, 바깥 누름 | `BoxScreen.tsx:316, 166`, CL-I-007 에서 CL-I-010 | 확정은 구매, 나머지는 READY 로 | 확정이면 개봉 화면 | 확정이면 CL-I-062 와 같다 | 실행 04:o5(Esc, 취소, 확정 세 번), 04:o7(바깥) |
| CL-I-067 | 한 줄 링크: 다른 박스에 보지 못한 결과가 있다 | click | `BoxScreen.tsx:200` | 그 박스 화면으로 | 그 박스의 결과 보기 단추 | 없음 | 화면 04:o4 |
| CL-I-068 | 구성품 타일(사진 있는 상품) | click | `BoxScreen.tsx:223, 327` | 상품 시트 열림 | 상품 시트 | 없음 | 실행 02:b1 |
| CL-I-069 | 구성품 행(사진 없는 상품) | click | `BoxScreen.tsx:230` | 상품 시트 열림 | 같다 | 없음 | 화면 02:b1(행 16개가 있는 것을 봤다). 누르는 것은 코드 |
| CL-I-070 | 상품별 확률 보기(`details`) | click, summary 에서 Enter | `BoxScreen.tsx:259-260` | 접힘 ↔ 펼침 | 상품마다 값과 확률 한 행 | 없음 | 실행 02:b1 |
| CL-I-071 | 확률표의 행 | click | `BoxScreen.tsx:264` | 상품 시트 열림 | 상품 시트 | 없음 | 실행 02:b1, 12:x1 |
| CL-I-072 | 알아둘 것(`details`)과 그 안의 검증 링크 | click | `BoxScreen.tsx:273-277` | 접힘 ↔ 펼침, 링크는 `/verify` | 설명 글 | 없음 | 실행 02:b1(펼침), 링크는 화면 |
| CL-I-073 | 상품 시트: 배송 가능 나라 보기, 닫기 | click | `BoxScreen.tsx:296` | 접힘 ↔ 펼침 | 나라 13곳 | 없음 | 실행 02:b1 |
| CL-I-074 | 상품 시트: 다른 박스 N개와 비교 | click | `BoxScreen.tsx:300` | 펼침(링크 글은 사라진다) | 박스별 가격과 확률 행 | 없음 | 실행 12:x1 |
| CL-I-075 | 상품 시트: 비교 행의 링크 | click | `BoxScreen.tsx:308` | 그 박스 화면으로 | 화면이 바뀌며 시트도 사라진다 | 없음 | 실행 12:x1 |
| CL-I-076 | 상품 시트 닫기 | Esc, X, 바깥 | `BoxScreen.tsx:281` | 닫히며 나라와 비교가 접힌 상태로 돌아간다 | 박스 화면 | 없음 | 실행 02:b1 |
| CL-I-077 | 열기 실패 한 줄 | 뜸 | `BoxScreen.tsx:198, 156` | PURCHASE_FAILED → READY | "열지 못했습니다. 잔액은 그대로입니다." | 없음 | 실행 04:o10 |

### 3.3 후기 (`components/box/BoxReviews.tsx`, `ReviewsScreen.tsx`, `components/ui/ScrollRow.tsx`)

| id | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|
| CL-I-078 | 후기 카드(박스 화면의 띠, 모아보기의 격자) | click | `BoxReviews.tsx:130` | 후기 상세 시트 열림 | 쓴 사람, 시각, 내용, 상품, 박스 | 없음 | 실행 02:b2 |
| CL-I-079 | 띠의 이전, 다음 단추 | click | `ScrollRow.tsx:29, 33-34` | 줄이 폭의 80%만큼 옆으로 간다. 더 넘길 것이 있는 쪽 단추만 나온다 | 스크롤 | 없음 | 실행 02:b2 |
| CL-I-080 | 띠 | 손가락으로 밀기, 스크롤, 크기 변화 | `ScrollRow.tsx:19-27` (scroll 감시, ResizeObserver) | 양 끝의 단추와 흐림이 다시 계산된다 | 단추가 나타나고 사라진다 | 없음 | 코드(밀기 전용 핸들러는 없다. 브라우저의 가로 스크롤이다) |
| CL-I-081 | 후기 모두 보기 | click | `BoxReviews.tsx:191` | `/reviews?box=<slug>` | 그 박스가 골라진 모아보기 | 없음 | 실행 02:b2 |
| CL-I-082 | 나온 상품 링크(후기 절, 모아보기) | click | `BoxReviews.tsx:192`, `ReviewsScreen.tsx:41` | `/wins` | 나온 상품 | 없음 | 실행 02:b2 |
| CL-I-083 | 후기 상세: 개봉 결과 검증 링크(내 후기에만) | click | `BoxReviews.tsx:166` | `/verify?s=..` (그 개봉의 값) | 값이 채워진 검증 화면 | 없음 | 실행 05:t3 |
| CL-I-084 | 후기 상세: 박스 보기 링크 | click | `BoxReviews.tsx:168` | `/box/<slug>` | 박스 화면 | 없음 | 화면 02:b2 |
| CL-I-085 | 후기 모아보기: 뒤로 | click | `ReviewsScreen.tsx:33` | 고른 박스가 있으면 그 박스, 없으면 `/` | 화면이 바뀐다 | 없음 | 화면 02:b2 |
| CL-I-086 | 후기 모아보기: 박스 알약 | click | `ReviewsScreen.tsx:34` | 고른 박스가 바뀐다. 주소는 그대로 | 그 박스의 후기와 별점 | 없음(새로 고치면 주소의 박스로) | 실행 02:b2 |
| CL-I-087 | 후기 모아보기 | `?box=` 로 직접 진입, 새로 고침 | `ReviewsScreen.tsx:21-22` | 주소의 박스가 골라진다 | 같다 | 없음 | 실행 02:b2 |

## 4. 개봉과 결과

### 4.1 한 개 열기 (`components/box/Opening.tsx`)

| id | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|
| CL-I-088 | 연출 시계 | 시간(520, 150, 170ms, 짧게 보기는 220, 110, 120ms) | `Opening.tsx:127-136`, `lib/openingFlow.ts:62-68` | anticipation → impact → exit → reveal | 상자가 내려앉고, 봉인이 떨어지고, 물러나고, 결과가 뜬다 | 없음(장부는 이미 적혀 있다) | 실행 04:o1(528, 153, 175ms), 04:o9(짧게 472ms) |
| CL-I-089 | 결과가 보임 | 단계 변화 | `Opening.tsx:140-152` → `BoxScreen.tsx:168` | OPENING → REVEALED → SETTLED, 0.35초 뒤 단추가 풀린다 | 위의 잔액이 최종 값으로, 아래 단추가 나타난다 | J 에 봤음 | 실행 04:o1 |
| CL-I-090 | 결과 바로 보기 | click | `Opening.tsx:261, 122` | 연출 → 결과 | 바로 결과 | J 에 봤음 | 실행 04:o2 |
| CL-I-091 | 화면 | 키 Esc(연출 중) | `Opening.tsx:124` | 닫지 않고 결과로 건너뛴다 | 바로 결과(15ms 안) | 같다 | 실행 04:o2 |
| CL-I-092 | 화면 | 키 Esc(단추가 풀린 뒤) | `Opening.tsx:124, 123` | 닫힌다. 다음 구매를 처리하는 동안에는 닫히지 않는다 | 박스 화면 | 없음 | 실행 04:o1, 09:k2 |
| CL-I-093 | 설정 단추 | click | `Opening.tsx:213` | 개봉 설정 시트 열림 | 스위치 셋 | 없음 | 실행 04:o9 |
| CL-I-094 | 닫기 X(단추가 풀린 뒤에만 있다) | click | `Opening.tsx:214, 123` | 닫힌다 | 박스 화면 | 없음 | 실행 04:o2 |
| CL-I-095 | 한 번 더 언박싱 | click | `Opening.tsx:194, 276` → `BoxScreen.press` | SETTLED → 새 구매 | 새 연출 | CL-I-062 와 같다 | 실행 04:o2 |
| CL-I-096 | 같은 단추 | 결과가 뜬 직후(0.35초 안) 누름, 세 번 연타 | `Opening.tsx:194` (`disabled`), `BoxScreen.tsx:142` | 직후에는 눌리지 않는다. 연타는 구매 1건 | 없음, 또는 새 연출 하나 | 구매 0건, 또는 1건 | 실행 04:o2 |
| CL-I-097 | 개봉 결과 검증 링크 | click | `Opening.tsx:203, 176` | 검증 시트 열림(결과 화면 위) | 세 단계와 판정 | 없음 | 실행 04:o3 |
| CL-I-098 | 박스로 돌아가기 링크 | click | `Opening.tsx:204` | 닫힌다 | 박스 화면 | 없음 | 화면 04:o1 |
| CL-I-099 | USDT로 받기(상품 결과의 주 단추) | click, Enter | `Opening.tsx:311` | 받기 확인창 열림 | 확인창 | 없음 | 실행 04:o3, 09:k2 |
| CL-I-100 | 받기 확인창의 확정 | click(세 번 연타 포함) | `Opening.tsx:322, 195-199` → `take` `154-165` → `lib/openingSettle.ts:21-28` | SETTLED → SETTLING → SETTLED | 제목이 "잔액에 금액 넣었습니다", 주 단추가 한 번 더 언박싱 | W(잔액, sellback 거래와 상품 id), I(SOLD, 받은 금액), M(적었다 지움) | 실행 04:o3 |
| CL-I-101 | 받기 확인창의 취소 | click | `Opening.tsx:322` | 그대로 | 결과 화면 | 없음 | 실행 04:o3 |
| CL-I-102 | 보관함에 두기 | click | `Opening.tsx:313` | 닫힌다. 상품은 보관 중 | 박스 화면 | 없음 | 실행 04:o3 |
| CL-I-103 | 다음 열기에 잔액이 모자랄 때: USDT 충전하기(보관 상품 없음) | click | `Opening.tsx:298` | 충전 시트 열림(결과 화면 위) | 충전 시트 | 없음 | 실행 10:m1 |
| CL-I-104 | 같은 자리: USDT로 받기(보관 상품으로 채워짐), 충전 링크 | click | `Opening.tsx:284, 286` | 선택 시트, 또는 충전 시트 | 같다 | 없음 | 코드 |
| CL-I-105 | 같은 자리: 충전 주 단추와 받기 링크(채워지지 않음) | click | `Opening.tsx:291, 293` | 같다 | 같다 | 없음 | 코드 |
| CL-I-106 | USDT로 받기 주 단추 | 같은 자리를 두 번 누름(모바일 폭) | `Opening.tsx:311, 322`, `Sheet.tsx:44` | 첫 누름이 확인창을 열고, 둘째 누름이 같은 자리에 온 확정 단추에 닿아 받아진다 | 확인창을 읽을 틈 없이 "잔액에 넣었습니다" | W, I 가 CL-I-100 처럼 바뀐다 | 실행 09:k3, 09b:e3. 어긋남(F-01) |
| CL-I-107 | 다시 시도, 다시 확인(받기가 실패, 대기, 알 수 없음일 때) | click | `Opening.tsx:304` | SETTLEMENT_FAILED 등 → SETTLING | 결과에 따라 | 결과에 따라 | 코드(배포 빌드에는 이 상태를 만드는 시험 스위치가 꺼져 있다) |
| CL-I-108 | 자동으로 받기(계정이 켠 경우) | 결과가 보인 뒤 한 번 | `Opening.tsx:168-173`, `openingFlow.ts:77-80` | SETTLED → SETTLING → SETTLED | "자동으로 USDT로 받았습니다" | CL-I-100 과 같다 | 실행 04:o9 |
| CL-I-109 | 개봉 설정: 소리와 진동, 짧게 보기 | click | `Opening.tsx:337, 346-347` | 끔 ↔ 켬 | 스위치의 글 | S 의 openSound, openShort | 실행 04:o9 |
| CL-I-110 | 개봉 설정: 상품을 자동으로 USDT로 받기 | click, 확인창 확정과 취소 | `Opening.tsx:348, 352` | 켤 때만 확인창을 거친다 | 스위치의 글 | S 의 autoTakeBy[계정] | 실행 04:o9 |
| CL-I-111 | 소리와 진동 | 열기 누름, 충격, 드러남 | `lib/openingSound.ts:51-78`, `Opening.tsx:141, 146`, `BoxScreen.tsx:163` | 켠 경우에만 Web Audio 와 `navigator.vibrate` | 화면 변화 없음 | 없음 | 코드(소리는 듣지 못한다). 켠 채로 연 것은 실행 04:o9 가 설정만 봤다 |
| CL-I-112 | 움직임 줄이기 | 브라우저 설정 | `Opening.tsx:129` | 연출 없이 결과부터 | 바로 결과 | 같다 | 실행 04:o9 |

### 4.2 여러 개 열기 (`components/box/Reveal.tsx`)

| id | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|
| CL-I-113 | 연출 시계 | 시간(520, 150, 170ms) | `Reveal.tsx:82-91` | anticipation → impact → exit → 결과 | "N개 여는 중"과 같은 상자, 이어서 결과 목록 | 없음 | 실행 04:o5 |
| CL-I-114 | 결과 바로 보기 | click | `Reveal.tsx:175, 70` | 연출 → 결과 | 바로 결과 | J 에 봤음 | 실행 12:x3 |
| CL-I-115 | 화면 | 키 Esc | `Reveal.tsx:73` | 연출 중에는 건너뛰기, 결과가 뜬 뒤 0.35초 안에는 무시, 그 뒤에는 닫기 | 같다 | 없음 | 실행 12:x3 |
| CL-I-116 | 닫기 X | click | `Reveal.tsx:179` | 닫힌다(0.35초 뒤부터) | 박스 화면. 수량은 그대로 | 없음 | 실행 04:o5 |
| CL-I-117 | 결과 행(상품, 받기 전) | click | `Reveal.tsx:252, 126` | 그 상품의 시트 열림 | 상품가, 확률, USDT로 받기, 검증 | 없음 | 실행 04:o5 |
| CL-I-118 | 결과 행(USDT 결과, 받은 상품, 배송 신청한 상품) | click | `Reveal.tsx:252, 123` | 그 결과의 검증 시트 | 검증 시트 | 없음 | 실행 12:x3 |
| CL-I-119 | 묶인 행(같은 금액의 USDT 결과 여럿) | 없음 | `Reveal.tsx:249-250` | 누를 수 없다 | 없음 | 없음 | 실행 04:o5 |
| CL-I-120 | 주 단추: USDT로 받기 (n개, 금액) | click | `Reveal.tsx:266, 299` | 방금 나온 상품만 담고 미리 고른 선택 시트 | 선택 시트 | 없음 | 실행 04:o5 |
| CL-I-121 | 같은 단추 | 같은 자리를 두 번, 세 번 누름 | `Reveal.tsx:266`, `TakeSheet.tsx:191, 197` | 선택 시트가 열릴 뿐 받아지지 않는다(시트의 주 단추와 확인창의 확정 단추가 다른 높이다) | 선택 시트 | 없음 | 실행 09:k3 |
| CL-I-122 | 보관함에 두기 링크 | click | `Reveal.tsx:267` | 닫힌다 | 박스 화면 | 없음 | 코드 |
| CL-I-123 | 한 번 더 언박싱(링크, 또는 받을 것이 없을 때의 주 단추) | click | `Reveal.tsx:267, 148, 272` | 같은 수량으로 새 구매 | 새 연출 | CL-I-062 와 같다 | 실행 12:x3 |
| CL-I-124 | 박스로 돌아가기 링크 | click | `Reveal.tsx:274` | 닫힌다 | 박스 화면 | 없음 | 실행 12:x3 |
| CL-I-125 | 다음 열기에 잔액이 모자랄 때의 주 단추와 링크(받기, 충전) | click | `Reveal.tsx:149-155` | 선택 시트(보관 상품 전부), 또는 충전 시트 | 같다 | 없음 | 코드 |
| CL-I-126 | 상품 시트의 USDT로 받기와 그 확인창 | click | `Reveal.tsx:163, 301, 127-134` | 받으면 시트가 닫히고 그 행과 영수증이 바뀐다. 실패는 시트 안에 한 줄 | 영수증의 "잔액에 반영"이 는다 | CL-I-100 과 같다 | 화면 04:o5(시트와 단추를 봤다). 받는 것은 묶음 시트로 했다(실행 04:o5) |
| CL-I-127 | 상품 시트의 지갑 내역 링크(확인 필요인 상품) | click | `Reveal.tsx:293` | `/wallet` | 지갑 | 없음 | 코드 |
| CL-I-128 | 결과가 하나일 때의 분기(박스 목록 링크, 보관함에서 받기 링크) | click | `Reveal.tsx:182-214, 162, 193` | 박스 화면은 하나를 열면 `Opening` 을 쓰므로 사용자 화면에서는 오지 않는다 | 없음 | 없음 | 실행 11:g1(개발 갤러리에서 USDT 결과 하나를 띄워 봤다). 배포 사이트에서는 도달 불가 |

### 4.3 USDT로 받기 선택 시트와 확인창 (`components/flow/TakeSheet.tsx`)

| id | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|
| CL-I-129 | 시트가 열림 | 열림, 계정 변화 | `TakeSheet.tsx:92-97` | 고른 것과 결과를 비우고(미리 고를 것이 있으면 그것으로) 남은 표시를 다시 본다 | 고르는 단계 | M 이 풀릴 수 있다 | 실행 05:t1, 04:o5 |
| CL-I-130 | 전체 선택(머리 행, `role=checkbox`) | click | `TakeSheet.tsx:167, 116` | 전부 고름 ↔ 전부 풂. `aria-checked` 는 true, mixed, false | 주 단추의 개수와 금액 | 없음 | 실행 05:t1 |
| CL-I-131 | 상품 행(`role=checkbox`) | click, Space | `TakeSheet.tsx:178, 115` | 고름 ↔ 풂 | 같다 | 없음 | 실행 05:t1 |
| CL-I-132 | 주 단추 | click | `TakeSheet.tsx:191` | 고른 것이 없으면 눌리지 않는다. 있으면 확인 단계 | 같은 자리에 확인창 | 없음 | 실행 05:t1 |
| CL-I-133 | 확인창의 확정 | click(네 번 연타 포함) | `TakeSheet.tsx:197, 123-139`, `lib/takeBatch.ts:316-410` | 확인 → 받는 중 → 결과 | "잔액에 금액 넣었습니다." | W, I, M | 실행 05:t1, 04:o5 |
| CL-I-134 | 확인창의 취소, Esc | click, 키 | `TakeSheet.tsx:197` | 고르는 단계로 돌아간다(고른 것 유지) | 선택 시트 | 없음 | 실행 05:t1 |
| CL-I-135 | 결과의 주 단추(닫기, 또는 부른 쪽이 준 글) | click | `TakeSheet.tsx:203, 237` | 닫힌다 | 부른 화면 | 없음 | 실행 05:t1, 06:w4 |
| CL-I-136 | 결과의 다시 시도 | click | `TakeSheet.tsx:236` | 받지 못한 것 가운데 보관 중인 것만 다시 | 결과가 합쳐져 다시 뜬다 | W, I, M | 실행 05:t6 |
| CL-I-137 | 결과의 보관함, 지갑 내역 링크(알 수 없는 상품이 있을 때) | click | `TakeSheet.tsx:240` | 그 화면으로, 시트 닫힘 | 같다 | 없음 | 코드(배포 빌드에서는 이 상태를 만들기 어렵다) |
| CL-I-138 | 받을 상품이 없을 때의 닫기, 보관함을 불러오기 전의 자리 | click, 없음 | `TakeSheet.tsx:151-161` | 닫힌다 | 같다 | 없음 | 코드 |
| CL-I-139 | 전역 | 창으로 돌아옴 | `TakeSheet.tsx:40-46` → `takeBatch.ts:417-430` | 남은 표시를 다시 보고 화면의 장부를 저장된 장부에 맞춘다 | 금액과 상태가 저장된 장부대로 | M 이 풀릴 수 있다 | 실행 05:t6 |

### 4.4 잔액 시트와 충전 시트 (`components/flow/BalanceSheet.tsx`, `ChargeSheet.tsx`)

| id | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|
| CL-I-140 | 잔액 시트: USDT로 받기(보관 상품이 있을 때의 주 단추) | click | `BalanceSheet.tsx:52, 59` | 같은 자리에서 선택 시트로 | 선택 시트. 닫으면 잔액 시트로 돌아가지 않고 전부 닫힌다 | 없음 | 실행 05:t4 |
| CL-I-141 | 잔액 시트: USDT 충전하기(주 단추, 또는 링크) | click | `BalanceSheet.tsx:43, 52, 54` | 잔액 시트 닫힘, 충전 시트 열림 | 충전 시트 | 없음 | 실행 05:t4 |
| CL-I-142 | 잔액 시트: 출금 링크 | click | `BalanceSheet.tsx:55` | `/wallet/withdraw`, 시트 닫힘 | 출금 화면 | 없음 | 실행 05:t4 |
| CL-I-143 | 잔액 시트: 지갑 내역 링크(보관 상품이 없을 때) | click | `BalanceSheet.tsx:56` | `/wallet`, 시트 닫힘 | 지갑 | 없음 | 실행 05:t4 |
| CL-I-144 | 잔액 시트: 로그인 단추(비로그인 분기) | click | `BalanceSheet.tsx:36-41` | 로그인 시트 | 같다 | 없음 | 코드. 비로그인에는 잔액 단추가 없어 도달 불가(`AppShell.tsx:52`) |
| CL-I-145 | 충전 시트: 네트워크 알약 셋 | click | `ChargeSheet.tsx:45` | 네트워크가 바뀌고 주소를 다시 청한다 | 배포 사이트에서는 어느 것이든 "주소를 받지 못했습니다." | 없음 | 실행 06:w1 |
| CL-I-146 | 충전 시트: 주소 다시 받기 | click | `ChargeSheet.tsx:56` → `lib/useUsdtDeposit.ts:28-41` | 다시 청한다 | 같은 실패 한 줄 | 없음 | 실행 06:w1 |
| CL-I-147 | 충전 시트: 주소 복사 | click | `ChargeSheet.tsx:31-34, 56` | 클립보드에 주소, 토스트 | "주소를 복사했습니다" | 없음 | 코드. 배포 사이트에는 입금 주소가 없어 이 단추가 나오지 않는다(F-07) |
| CL-I-148 | 충전 시트: 입금 확인(5초마다), 확인되면 스스로 닫힘 | 시간 | `useUsdtDeposit.ts:45-72`, `ChargeSheet.tsx:27` | 대기 → 확인 중 → 잔액 반영 | 한 줄이 바뀌고 시트가 닫힌다 | W(잔액, 충전 거래) | 코드. 같은 이유로 도달 불가 |
| CL-I-149 | 충전 시트: 로그인 단추(비로그인 분기) | click | `ChargeSheet.tsx:36-42` | 로그인 시트 | 같다 | 없음 | 실행 11:g1(개발 갤러리). 사용자 화면에서는 로그인한 사람만 충전 시트를 연다 |

## 5. 계정, 보관함, 지갑, 출금, 검증, 나온 상품

### 5.1 로그인과 가입 시트 (`components/flow/LoginSheet.tsx`)

| id | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|
| CL-I-150 | 시트가 열림, 모드가 바뀜 | 열림 | `LoginSheet.tsx:35-39` | 이메일 단계로, 비밀번호와 코드와 실패 한 줄을 비운다. 닫히면 이메일도 비운다 | 이메일 단계 | 없음 | 실행 03:a1 |
| CL-I-151 | 이메일 칸 | change, Enter, 주 단추 click | `LoginSheet.tsx:89, 51-59` | 이메일 → 비밀번호 단계. 빈 값이면 실패 한 줄 | 설명 자리에 이메일이 적힌다 | 없음 | 실행 03:a1 |
| CL-I-152 | 비밀번호 칸(로그인) | change, Enter | `LoginSheet.tsx:91, 65` → `lib/account.ts:143-146` → `lib/browserAccount.ts:85-103` | 로그인. 시트가 닫히고 보던 화면 그대로 | 머리줄에 잔액 | A(없는 이메일이면 계정이 생긴다), SS, W 와 I 의 이름이 그 계정으로 | 실행 03:a1 |
| CL-I-153 | 비밀번호 칸(가입) | change, Enter | `LoginSheet.tsx:61-64` → `browserAccount.ts:98-100` | 이메일 인증 단계 | 코드 칸 | A(계정, signupPending) | 실행 03:a1 |
| CL-I-154 | 인증 코드 칸 | change(숫자만 남는다), Enter | `LoginSheet.tsx:90, 66` → `browserAccount.ts:104-112` | 아무 6자리면 가입 끝. 6자리가 아니면 실패 한 줄 | 시트가 닫힌다 | A, SS, W(보너스 10000, 무료 2회) | 실행 03:a1 |
| CL-I-155 | 코드 다시 받기 | click | `LoginSheet.tsx:108` | 코드 칸을 비운다(메일은 가지 않는다) | 실패 한 줄이 지워진다 | 없음 | 실행 03:a1 |
| CL-I-156 | 이메일로 가입, 이메일로 로그인 링크 | click | `LoginSheet.tsx:105, 79` | 모드가 바뀐다 | 제목이 바뀐다 | 없음 | 실행 03:a1, 03:a2 |
| CL-I-157 | 이메일 바꾸기 | click | `LoginSheet.tsx:106, 78` | 이메일 단계로(이메일은 남는다) | 이메일 칸 | 없음 | 실행 03:a1 |
| CL-I-158 | 비밀번호 재설정 링크, 이어서 이메일, 코드와 새 비밀번호, 끝의 단추 | click, Enter | `LoginSheet.tsx:107, 58, 67, 86` → `browserAccount.ts:121-135` | recover: 이메일 → reset → done → login | 단계마다 제목이 바뀐다 | A(비밀번호 해시, sessionVersion) | 실행 03:a2 |
| CL-I-159 | Google로 계속하기 | click | `LoginSheet.tsx:100, 71-76` → `browserAccount.ts:113-120` | 밖으로 나가지 않고 이 브라우저에 `google@device.invalid` 계정이 생겨 로그인된다 | 시트가 닫힌다 | A, SS, W | 실행 03:a2 |
| CL-I-160 | Apple로, Microsoft로 계속하기 | click | 같다 | 같다(계정 이름만 다르다) | 같다 | 같다 | 코드 |
| CL-I-161 | 처리 중 | 없음 | `LoginSheet.tsx:84, 89-94` | 시트가 잠기고 칸과 단추가 눌리지 않는다 | "확인 중" | 없음 | 코드 |
| CL-I-162 | 포커스 | 열림, 단계 변화 | `LoginSheet.tsx:89, 91` (`autoFocus`) | 열릴 때는 시트 자체에, 비밀번호 단계에서는 본문에 포커스가 있다. 칸으로 가지 않는다 | 키보드로는 Tab 을 두 번 더 눌러야 칸에 닿는다 | 없음 | 실행 09:k1, 09b:e1, 03:a1. 어긋남(F-08) |

### 5.2 계정 화면 (`components/account/AccountScreen.tsx`, `AccountSheets.tsx`, `components/wallet/TwoFactorSetup.tsx`)

| id | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|
| CL-I-163 | 비로그인: 로그인 단추, 가입 링크 | click | `AccountScreen.tsx:46` | 로그인 시트(login, signup) | 같다 | 없음 | 실행 03:a2 |
| CL-I-164 | 행 링크 일곱(잔액, 출금, 보관 중, 배송 중, 이용 방법, 개봉 결과 검증, 약관과 정책) | click | `AccountScreen.tsx:50-51, 54-55, 67-69` | 그 화면으로 | 화면이 바뀐다 | 없음 | 화면 03:a3(주소를 읽었다) |
| CL-I-165 | 인증 앱 행 | click | `AccountScreen.tsx:58, 75-77` | 인증 앱 시트 열림 | 안내와 시작 단추 | 없음 | 실행 03:a3 |
| CL-I-166 | 인증 앱: Google OTP 등록 시작 | click | `TwoFactorSetup.tsx:79, 38-47` → `browserAccount.ts:283-286` | 안내 → QR 과 키 | QR, 키, 코드 칸 | A(setup) | 실행 03:a3, 06:w4(출금 관문에서는 스스로 시작한다) |
| CL-I-167 | 인증 앱: 키 복사 | click | `TwoFactorSetup.tsx:90, 54-56` | 클립보드에 키, 토스트 | "주소를 복사했습니다" | 없음 | 코드(클립보드 권한을 주지 않았다) |
| CL-I-168 | 인증 앱: 코드 칸과 확인 | change(숫자 6자리까지), Enter, click | `TwoFactorSetup.tsx:83, 93, 95, 57-71` → `browserAccount.ts:287-290` | 아무 6자리면 연결된다. 6자리가 되기 전에는 단추가 눌리지 않는다 | 시트가 닫히고 행이 "연결됨" | A(secret, enabledAt) | 실행 03:a3 |
| CL-I-169 | 닉네임 행과 시트(칸, 저장하기) | click, change | `AccountScreen.tsx:62`, `AccountSheets.tsx:39, 42, 29-36` → `browserAccount.ts:257-275` | 2자 미만이면 규칙 한 줄. 저장하면 닫힌다. 바꾼 뒤에는 다음에 바꿀 수 있는 날짜 한 줄과 눌리지 않는 단추 | 행에 새 닉네임 | A(nickname, 바꾼 시각) | 실행 03:a3 |
| CL-I-170 | 비밀번호 행과 시트(칸 셋, 비밀번호 바꾸기) | click, change | `AccountScreen.tsx:63`, `AccountSheets.tsx:69-73, 57-64` → `lib/account.ts:248-258` → `browserAccount.ts:230-250` | 규칙에 맞게 넣어도 바뀌지 않는다. 실패 한 줄 | "로그인 정보를 확인해 주세요..." | 없음 | 실행 03:a3. 어긋남(F-06) |
| CL-I-171 | 소셜 계정의 비밀번호 시트 | 열림 | `AccountSheets.tsx:56, 66-67` | 안내 한 줄만 있고 칸과 단추가 없다 | 같다 | 없음 | 실행 03:a2 |
| CL-I-172 | 탈퇴 행과 시트(비밀번호 칸, 탈퇴하기, 확인창) | click, change | `AccountScreen.tsx:64`, `AccountSheets.tsx:97-101, 88-93` → `account.ts:189-192` → `browserAccount.ts:147-150` | 확정해도 탈퇴되지 않는다. 실패 한 줄 | 같다 | 없음 | 실행 03:a3. 어긋남(F-06) |
| CL-I-173 | 로그아웃 링크, 확인창 | click, 확정(더블클릭 포함), Esc | `AccountScreen.tsx:71, 81, 37-40` → `authStore.ts:67-70` | 로그인 → 비로그인 | 화면이 로그인 한 줄로. "로그아웃했습니다" 토스트는 어디에도 그려지지 않는다 | SS 삭제. W 와 I 의 이름이 `.guest` 로. 계정의 장부는 남는다 | 실행 03:a1, 01b:d3. 어긋남(F-12) |

### 5.3 보관함 (`components/inventory/InventoryScreen.tsx`)

| id | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|
| CL-I-174 | 비로그인: 로그인 단추 | click | `InventoryScreen.tsx:114` | 로그인 시트 | 같다 | 없음 | 실행 12:x2 |
| CL-I-175 | 상태 알약 셋(보관 중, 배송, 받은 것) | click | `InventoryScreen.tsx:117, 70` | 탭이 바뀌고 보여 주는 수가 30으로 | 그 상태의 행 | 없음 | 실행 05:t1 |
| CL-I-176 | USDT로 받기(보관 중 탭, 받을 것이 있을 때) | click | `InventoryScreen.tsx:119, 184` | 선택 시트 열림(보관 상품 전부) | 선택 시트 | 없음 | 실행 05:t1 |
| CL-I-177 | 박스 보기 링크(보관 중이 비었을 때) | click | `InventoryScreen.tsx:121` | `/` | 박스 목록 | 없음 | 화면 05:t1 |
| CL-I-178 | 상품 행 | click | `InventoryScreen.tsx:128` | 상품 상세 시트 열림 | 상태, 상품가, 받은 날, 후기 행, 주 단추, 링크 | 없음 | 실행 05:t1, 05:t2 |
| CL-I-179 | N개 더 보기(30개를 넘을 때) | click | `InventoryScreen.tsx:138` | 보여 주는 수 +30 | 행이 는다 | 없음 | 코드 |
| CL-I-180 | 상세: USDT로 받기, 확인창의 확정 | click(두 번 포함) | `InventoryScreen.tsx:168, 186, 89-95` | 받으면 시트가 닫히고 받은 것 탭으로 옮겨 간다 | 탭 개수와 머리줄 잔액이 바뀐다 | W, I, M | 실행 05:t2 |
| CL-I-181 | 상세: USDT로 받기 | 같은 자리를 두 번 누름(모바일 폭) | `InventoryScreen.tsx:168, 186`, `Sheet.tsx:44` | 확인창을 읽을 틈 없이 받아진다 | 받은 것 탭 | W, I | 실행 09:k3, 09b:e2. 어긋남(F-01) |
| CL-I-182 | 상세: 배송 받기 링크(실물, 보관 중) | click | `InventoryScreen.tsx:172, 180` | 같은 자리에서 배송 시트로 | 배송 시트 | 없음 | 실행 05:t2 |
| CL-I-183 | 상세: 개봉 결과 검증 링크 | click | `InventoryScreen.tsx:174, 103, 181` | 같은 자리에서 검증 시트로. 닫으면 상세로 돌아온다 | 검증 시트 | 없음 | 실행 05:t2 |
| CL-I-184 | 상세: 후기 쓰기 행(상품가 100 이상, 아직 쓰지 않음) | click | `InventoryScreen.tsx:158, 182` | 같은 자리에서 후기 시트로 | 후기 시트 | 없음 | 실행 05:t3 |
| CL-I-185 | 상세: 지갑 내역 링크(확인 필요인 상품) | click | `InventoryScreen.tsx:173` | `/wallet` | 지갑 | 없음 | 화면 05:t5 |
| CL-I-186 | 상세: 배송 신청 취소, 확인창 | click, 확정(세 번 포함) | `InventoryScreen.tsx:169, 187, 96-102` → `lib/claim.ts:53-73` | SHIPPING_REQUESTED → IN_STORAGE. 시트가 닫히고 보관 중 탭으로 | 탭 개수가 바뀐다 | I(상태, 취소 기록). 배송비가 있었으면 W(환불 거래). 지금은 배송비가 0 이다 | 실행 12:x2(심은 시험 기록) |
| CL-I-187 | 상세: 배송 조회(밖으로 나가는 링크, 새 창) | click | `InventoryScreen.tsx:170` | 택배사 사이트 | 새 창 | 없음 | 화면 12:x2(주소를 읽었다. 누르지 않았다) |
| CL-I-188 | 운송장 받아 오기(1분마다) | 시간 | `InventoryScreen.tsx:61-69` | 서비스에 연결된 환경에서만 돈다 | 없음 | 없음 | 코드. 배포 사이트에서는 꺼져 있다 |

### 5.4 배송 시트와 후기 쓰기 시트 (`components/flow/ShipSheet.tsx`, `ReviewSheet.tsx`)

| id | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|
| CL-I-189 | 배송 시트가 열림 | 열림 | `ShipSheet.tsx:34-40` | 지난번에 쓴 주소가 있으면 채운다. 접수 번호를 새로 만든다 | 채워진 칸 | 없음 | 실행 12:x2 |
| CL-I-190 | 받는 나라 알약 13 | click | `ShipSheet.tsx:63` | 나라가 바뀐다. 한국은 개인통관고유부호 칸, 중국은 신분증 번호 칸, 그 밖은 통관 칸 없음 | 칸이 나타나고 사라진다 | 없음 | 실행 05:t2 |
| CL-I-191 | 입력 칸(받는 사람, 휴대폰, 우편번호, 주소, 통관 번호) | change | `ShipSheet.tsx:64-72` | 값이 바뀐다. 한 번 누른 뒤에는 입력마다 다시 본다 | 틀린 칸 아래 한 줄 | 없음 | 실행 05:t2 |
| CL-I-192 | 배송 신청 | click | `ShipSheet.tsx:77, 51` | 틀린 칸이 있으면 한 줄씩(빈 채로는 다섯), 맞으면 확인창 | 확인창에 주소가 다시 적힌다 | 없음 | 실행 05:t2 |
| CL-I-193 | 확인창의 취소 | click | `ShipSheet.tsx:79` | 배송 시트로 돌아간다(값 유지) | 배송 시트 | 없음 | 실행 05:t2 |
| CL-I-194 | 확인창의 확정 | click | `ShipSheet.tsx:79, 52-58` → `lib/claim.ts:33-47` → `lib/account.ts:109-111` → `browserAccount.ts:339` | 배포 사이트에서는 접수되지 않는다(이 브라우저 장부에는 `/shipping/request` 처리기가 없다). 실패 한 줄 | "배송 신청을 접수하지 못했습니다. 상품은 보관함에 그대로 있습니다." | 없음 | 코드. 지시에 따라 누르지 않았다(F-07) |
| CL-I-195 | 후기: 별점 알약 다섯 | click | `ReviewSheet.tsx:56` | 별점이 바뀐다(처음은 5점) | 알약 | 없음 | 실행 05:t3 |
| CL-I-196 | 후기: 글 칸 | change | `ReviewSheet.tsx:59` | 글이 바뀌고 "5자 이상" 한 줄이 지워진다 | 같다 | 없음 | 실행 05:t3 |
| CL-I-197 | 후기: 사진 칸 | change(파일 고름) | `ReviewSheet.tsx:63, 40-44, 17-29` | 긴 변 1000px 로 줄여 미리 보기. 그림이 아니면 실패 한 줄 | 미리 보기, 또는 한 줄 | 없음(올릴 때 R 에 함께 들어간다) | 실행 12:x4 |
| CL-I-198 | 후기 올리기 | click | `ReviewSheet.tsx:69, 45-52` → `communityStore.ts:29-39` | 5자 미만이면 한 줄. 올리면 상품 상세로 돌아가고 행이 "후기를 올렸습니다" | 박스 화면의 후기 띠 맨 앞에 내 후기 | R 의 mine | 실행 05:t3 |
| CL-I-199 | 후기 올리기 | 같은 자리를 두 번, 세 번 누름(모바일 폭) | `ReviewSheet.tsx:69`, `InventoryScreen.tsx:168, 186` | 둘째 누름이 돌아온 상품 상세의 USDT로 받기에, 셋째 누름이 그 확인창의 확정에 닿는다 | 세 번이면 그 상품이 USDT 로 받아진다 | 세 번이면 W, I | 실행 09:k3. 어긋남(F-01) |

### 5.5 지갑 (`components/wallet/WalletScreen.tsx`)

| id | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|
| CL-I-200 | 비로그인: 로그인 단추 | click | `WalletScreen.tsx:94` | 로그인 시트 | 같다 | 없음 | 실행 06:w1 |
| CL-I-201 | USDT 충전하기 | click | `WalletScreen.tsx:102` | 충전 시트 열림 | 충전 시트 | 없음 | 실행 06:w1 |
| CL-I-202 | 출금 링크 | click | `WalletScreen.tsx:103` | `/wallet/withdraw` | 출금 화면 | 없음 | 실행 06:w1 |
| CL-I-203 | 내역 행 | click | `WalletScreen.tsx:111` | 거래 시트 열림 | 금액, 상태, 네트워크, 수수료, 받는 금액, 주소 | 없음 | 실행 06:w1, 06:w3 |
| CL-I-204 | N개 더 보기(30건을 넘을 때) | click | `WalletScreen.tsx:119` | 보여 주는 수 +30 | 행이 는다 | 없음 | 코드 |
| CL-I-205 | 거래 시트: 출금 취소(72시간 보안 대기 건), 확인창 | click, 확정(세 번 포함), 취소 | `WalletScreen.tsx:138, 145, 78-88` → `lib/api.ts:55` → `browserAccount.ts:329-338` → `walletStore.ts:197-202` | PENDING_72H_HOLD → CANCELLED | 상태가 "취소됨", 취소 단추가 사라진다 | W(잔액 +금액, 거래의 상태), A(출금 기록의 상태) | 실행 06:w3(심은 시험 기록) |
| CL-I-206 | 거래 시트: 탐색기에서 거래 보기(밖으로 나가는 링크) | click | `WalletScreen.tsx:139-141` | TronScan, BscScan | 새 창 | 없음 | 코드(거래 번호가 있는 출금이 없다) |
| CL-I-207 | 출금 상태 받아 오기(10초마다), 남은 시간(1분마다) | 시간 | `WalletScreen.tsx:44-62, 64` | 서비스가 준 상태로 맞춘다 | 상태와 남은 시간 한 줄 | W(거래의 상태) | 화면 06:w3(남은 시간 한 줄을 봤다). 주기는 코드 |

### 5.6 출금 (`components/wallet/WithdrawScreen.tsx`)

출금 신청은 보내지 않았다. 확인 단계와 인증 코드 화면이 뜨는 데까지만 봤다.

| id | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|
| CL-I-208 | 비로그인: 로그인 단추, 뒤로 | click | `WithdrawScreen.tsx:170` | 로그인 시트, `/wallet` | 같다 | 없음 | 화면 06:w4 |
| CL-I-209 | 보안 설정을 불러오지 못함: 다시 불러오기 | click | `WithdrawScreen.tsx:174` | 다시 청한다 | 같다 | 없음 | 코드 |
| CL-I-210 | 관문: 인증 앱 연결하기 | click | `WithdrawScreen.tsx:183, 185-187` | 그 자리의 시트에서 곧바로 QR 이 나온다(시작 단추 없이) | 인증 앱 시트 | A(setup) | 실행 06:w4 |
| CL-I-211 | 관문: 이메일 인증으로 출금 링크 | click | `WithdrawScreen.tsx:184` | 관문 → 입력 화면(이메일 경로) | 입력 화면 | 없음(새로 고치면 관문으로) | 실행 06:w4 |
| CL-I-212 | 보관함의 상품을 USDT로 받아 출금하기 링크 | click | `WithdrawScreen.tsx:241, 93, 262` | 선택 시트 열림. 받은 뒤의 주 단추는 "출금으로 돌아가기" | 금액 칸에 방금 받은 금액 가운데 출금할 수 있는 몫이 채워지고 한 줄로 말한다 | W, I, M(받기). 출금은 나가지 않는다 | 실행 06:w4 |
| CL-I-213 | 네트워크 알약 둘 | click | `WithdrawScreen.tsx:242` | 네트워크가 바뀐다 | 수수료와 주소의 실패 한 줄이 그 네트워크 것으로 | 없음 | 실행 06:w4 |
| CL-I-214 | 받는 주소 칸 | change | `WithdrawScreen.tsx:244` | 값이 바뀐다 | 형식이 틀리면(누른 뒤) 한 줄 | 없음 | 실행 06:w4 |
| CL-I-215 | 금액 칸 | change(숫자와 점만 남는다) | `WithdrawScreen.tsx:246` | 값이 바뀌고 "채웠다"는 한 줄이 지워진다 | 받는 금액 행이 따라 바뀐다. 단위는 고른 통화 | 없음 | 실행 06:w4 |
| CL-I-216 | 25%, 50%, 전액 | click | `WithdrawScreen.tsx:249, 82` | 금액 칸을 채운다 | 같다 | 없음 | 실행 06:w4 |
| CL-I-217 | 출금 확인 | click, 금액 칸에서 Enter | `WithdrawScreen.tsx:238, 261, 103-110` | 틀리면 칸마다 한 줄(주소, 숫자 아님, 가장 적은 금액 미만, 잔액 초과). 맞으면 확인 단계 | 확인 단계(받는 금액, 금액, 수수료, 네트워크, 주소 전체) | 없음 | 실행 06:w4 |
| CL-I-218 | 확인 단계: 뒤로 | click | `WithdrawScreen.tsx:193, 72` | 입력 화면으로(값 유지) | 입력 화면 | 없음 | 실행 06:w4 |
| CL-I-219 | 확인 단계: 인증하고 출금 | click | `WithdrawScreen.tsx:201` | 인증 코드 화면(인증 앱), 또는 이메일 화면 | 코드 칸과 "금액 출금" 단추 | 없음 | 실행 06:w4(인증 코드 화면이 뜨는 것까지) |
| CL-I-220 | 인증 코드 화면: 뒤로, 이메일 경로 링크 | click | `WithdrawScreen.tsx:207, 211` | 확인 단계로, 또는 이메일 화면으로 | 같다 | 없음 | 실행 06:w4(뒤로만). 링크는 코드 |
| CL-I-221 | 인증 코드 화면: 코드 칸, 출금 단추 | change, Enter, click | `WithdrawScreen.tsx:206-210, 137-151, 113-134` | 6자리가 맞으면 접수: 잔액 차감, 출금 거래 생성. 세 번 틀리면 이메일 경로 | 신청함 화면 | W(잔액 차감, 출금 거래), A(출금 기록) | 코드. 지시에 따라 누르지 않았다 |
| CL-I-222 | 이메일 화면: 코드 보내기, 코드 칸, 출금, 코드 다시 받기, 뒤로 | click, change | `WithdrawScreen.tsx:216-221, 152-167` | 코드를 보내고(메일은 가지 않는다), 맞으면 72시간 보안 대기로 접수 | 신청함 화면 | 같다 | 코드. 누르지 않았다 |
| CL-I-223 | 신청함 화면: 지갑으로 | click | `WithdrawScreen.tsx:233` | `/wallet` | 지갑 | 없음 | 코드 |

### 5.7 검증과 나온 상품 (`components/verify/VerifyScreen.tsx`, `components/flow/VerifySheet.tsx`, `components/box/WinsScreen.tsx`)

| id | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|
| CL-I-224 | 검증: 비로그인의 로그인 단추 | click | `VerifyScreen.tsx:77` | 로그인 시트 | 같다 | 없음 | 화면 07:v1 |
| CL-I-225 | 검증: 내 개봉 기록 행 | click | `VerifyScreen.tsx:84` | 검증 시트 열림(그 보관 상품의 id 로) | 세 단계와 판정 | 없음 | 실행 07:v2 |
| CL-I-226 | 검증: 기록 더 보기(20건을 넘을 때) | click | `VerifyScreen.tsx:91` | 보여 주는 수 +20 | 행이 는다 | 없음 | 코드 |
| CL-I-227 | 검증: 직접 넣는 칸 넷(공개된 값, 잠근 값, 내 기기 값, 회차) | change | `VerifyScreen.tsx:99-102` | 값이 바뀐다. 앞의 계산 결과는 다시 누를 때까지 남아 있다 | 같다 | 없음 | 실행 07:v1 |
| CL-I-228 | 검증: 박스 알약(박스 전부, 334개) | click | `VerifyScreen.tsx:103` | 박스가 바뀐다 | 같다 | 없음 | 실행 07:v1 |
| CL-I-229 | 검증: 계산하기 | click | `VerifyScreen.tsx:105, 57-68` | 값이 비었거나 회차가 음수면 실패 한 줄. 맞으면 해시, 번호, 번호가 가리키는 상품. 잠근 값을 넣었으면 같은지 한 행 | 결과 행들 | 없음 | 실행 07:v1 |
| CL-I-230 | 검증: 주소의 값으로 미리 채우기 | 직접 진입(`?s=&h=&c=&n=&box=`) | `VerifyScreen.tsx:45-50` | 칸이 채워지고 그 절로 내려간다. 계산은 스스로 하지 않는다 | 같다 | 없음 | 실행 07:v1, 05:t3 |
| CL-I-231 | 검증 시트: 블록체인 검증 방식 링크 | click | `VerifySheet.tsx:88` | 설명 접힘 ↔ 펼침 | 세 단계 설명 | 없음 | 실행 05:t2 |
| CL-I-232 | 검증 시트: 값을 직접 넣어 검증 링크 | click | `VerifySheet.tsx:89, 52` | `/verify?s=..` 로, 시트 닫힘 | 값이 채워진 검증 화면 | 없음 | 실행 07:v2, 화면 05:t2 |
| CL-I-233 | 검증 시트의 블록체인 기록 칸: 기록 보기 링크, 다시 확인 단추 | click | `components/verify/ChainRecord.tsx:28-29` | 실제 기록의 상태는 언제나 "기록 없음"이라 사용자 화면에는 이 둘이 나오지 않는다 | 없음 | 없음 | 실행 11:g1(개발 갤러리의 고정 자료). 배포 사이트에서는 도달 불가 |
| CL-I-234 | 나온 상품: 뒤로, 비로그인의 로그인 단추, 빈 상태의 박스 보기 | click | `WinsScreen.tsx:57, 59, 65` | `/`, 로그인 시트, `/` | 같다 | 없음 | 화면 02:b2(로그인 한 줄과 단추). 나머지는 코드 |
| CL-I-235 | 나온 상품: 줄 | click | `WinsScreen.tsx:74` | 상세 시트 열림 | 박스, 그때의(또는 지금의) 1회 가격, 상품가, 배수, 무료 개봉 여부, 나온 때 | 없음 | 실행 07:v2 |
| CL-I-236 | 나온 상품: 더 보기(30건을 넘을 때) | click | `WinsScreen.tsx:88` | 보여 주는 수 +30 | 줄이 는다 | 없음 | 코드 |
| CL-I-237 | 나온 상품 상세: 개봉 결과 검증 | click | `WinsScreen.tsx:109, 51` | 같은 자리에서 검증 시트로. 닫으면 상세로 돌아가지 않고 목록이다 | 검증 시트 | 없음 | 실행 07:v2 |
| CL-I-238 | 나온 상품 상세: 박스 보기 링크 | click | `WinsScreen.tsx:110` | `/box/<slug>` | 박스 화면 | 없음 | 실행 07:v2 |

### 5.8 개발 전용 갤러리 (`components/dev/Gallery.tsx`)

| id | 컨트롤 | 이벤트 | 핸들러 | 전 → 후 | 화면 변화 | 저장 변화 | 확인 |
|---|---|---|---|---|---|---|---|
| CL-I-239 | 갤러리의 알약, 토스트 단추, 시트 여덟(시트, 로그인, 가입, 비밀번호 재설정, 충전, 메뉴, 검증, 배송), 확인창 넷, 결과 셋 | click, Esc | `Gallery.tsx:68-139` | 각 겹침 화면이 열리고 Esc 로 닫힌다. 돈은 움직이지 않는다(표본 자료) | 같다 | 없음 | 실행 11:g1(개발 서버 `http://localhost:3002`). 배포 사이트에서는 `/ko/dev/gallery/` 가 없는 주소 화면이다(실행 01b:d1) |

갤러리에서 본 것 하나: "금액 결제" 확인창의 제목이 문구 대신 키 이름(`v.box.confirmTitle`)으로 나온다. `Gallery.tsx:133` 이 문구에 필요한 `amount` 대신 `n` 을 넘긴다. 개발 화면에서만 생기는 일이다.

## 6. 어긋난 것 (실행해서 본 것)

등급은 `BRIEF.md` 6절의 뜻으로 적은 후보다. 판정은 총괄이 한다. 전부 기준 커밋의 배포 화면에 원래 있는 것이고, 무엇을 옮기다 생긴 것이 아니다.

### F-01. 모바일 폭에서 "USDT로 받기"를 같은 자리에 두 번 누르면 확인창을 건너뛴다 (P1 후보)

- 본 것(실행 09:k3, 09b:e2, 09b:e3): 폭 320 과 390 에서 보관함 상품 상세의 "USDT로 받기 ($950)"를 같은 좌표에 두 번 눌렀더니(간격 90, 250, 600ms 모두) 잔액이 10,000 에서 10,950 이 되고 받기 거래가 1건 생겼다. 개봉 결과 화면의 받기 단추도 같다(10,000 - 1 + 237.5). 후기 올리기를 세 번 누르면 후기가 올라가고, 돌아온 상품 상세의 받기 단추가 눌리고, 그 확인창의 확정까지 눌려 상품이 받아진다.
- 까닭(잰 값): 확인창은 앞의 시트를 대신해 같은 자리에 뜬다. 폭 390 에서 상세의 받기 단추는 y 708 에서 760, 확인창의 확정 단추는 y 710 에서 762 다(폭 320 에서는 504 와 506). 둘째 누름의 자리에 있던 요소를 읽어 보니 확인창의 "USDT로 받기 ($950)"였다. 폭 768 과 1280 에서는 98px 떨어져 있어 받아지지 않았다.
- 같은 꼴인데 받아지지 않은 것: 박스 화면의 10개 열기(주 단추 y 780, 확정 y 710), 선택 시트의 주 단추(y 776 과 710), 여럿 결과의 받기 단추. 높이가 달라 둘째 누름이 빈 곳에 닿았다.
- 소스: `components/ui/Sheet.tsx:32-51` 의 확인창에는 결과 화면에 있는 0.35초 잠금(`lib/openingFlow.ts:71`, `Opening.tsx:150`, `Reveal.tsx:78`) 같은 장치가 없다. `InventoryScreen.tsx:105, 186`, `Opening.tsx:311, 322`.
- 영향: 받으면 배송으로 바꿀 수 없다고 화면이 말하는 행동이, 그 말을 읽기 전에 확정될 수 있다. 돈은 장부대로 정확히 한 번만 움직인다(겹쳐 지급되지는 않는다).
- 지금 덮는 시험: 없다. `flow-take.mjs` 와 `opening-qa.mjs` 는 확정 단추를 프로그램으로 여러 번 눌러 "한 번만 지급"을 본다. 첫 단추와 확정 단추가 같은 자리인지는 보지 않는다.

### F-02. 지갑 내역에 박스 열기와 USDT로 받기가 나오지 않는다 (P1 후보)

- 본 것(실행 06:w2): 하나를 열고 상품을 USDT 로 받은 뒤 저장된 거래는 셋(보너스, 박스 열기 -1, USDT로 받기 +19)인데, 지갑 화면의 내역에는 보너스 한 행만 있었다.
- 까닭: `WalletScreen.tsx:66` 이 `accountId` 가 지금 계정과 같은 거래만 보여 주는데, 박스 열기 거래(`lib/opening.ts:109`)와 받기 거래(`lib/claim.ts:24`, `lib/opening.ts:105`)는 `accountId` 를 적지 않는다. 적는 것은 보너스(`walletStore.ts:255`), 충전(`lib/depositCredit.ts:18`), 출금(`WithdrawScreen.tsx:124`)뿐이다.
- 영향: 받기가 어긋났을 때 화면이 "보관함과 지갑 내역에서 확인할 수 있습니다"라고 말하고 지갑 내역 링크를 주는데(`TakeSheet.tsx:240`, `InventoryScreen.tsx:173`, `Reveal.tsx:293`), 그 내역에는 받기 거래가 없다. 문구에는 박스 열기와 USDT로 받기의 이름이 준비돼 있다(`messages/v.ko.json` 의 `wallet.type`).
- 지금 덮는 시험: 없다.

### F-03. 다른 탭의 변화가 이 탭의 화면 잔액에 전해지지 않는다 (P2 후보)

- 본 것(실행 10:m2): 두 탭에서 한 번씩 열었다. 저장된 잔액은 9,998.3 인데 첫 탭으로 돌아와 focus 를 보낸 뒤에도 화면은 9,999.05 였다. 구매는 잠금 안에서 저장소를 다시 읽고 하므로(`lib/ledgerLock.ts:40-53`) 돈은 틀리지 않았다(구매 2건, 회차가 겹치지 않음).
- 까닭: 지갑과 보관함 스토어에는 storage 사건을 듣는 곳이 없다. 창으로 돌아올 때의 맞춤(`TakeSheet.tsx:40-46`)은 확인 대기 표시가 남았을 때만 일한다(`takeBatch.ts:419-421`).

### F-04. 이 사이트에서는 다른 탭의 로그아웃이 storage 사건으로 전해지지 않는다 (P2 후보)

- 본 것(실행 01b:d3): 다른 탭에서 로그아웃했을 때 이 탭이 받은 사건의 키는 `voila-test-aresjoo:voila.browser-session.v1` 이었다. `authStore.ts:101, 105, 106` 은 접두사 없는 이름과 비교하므로 맞지 않는다. 세션 끝남 한 줄은 뜨지 않았고 주 단추는 여전히 "$1 언박싱"이었다. focus 사건을 보내자 한 줄이 떴다(`authStore.ts:114-123`).
- 이어서 본 것(실행 01b:d4): 다른 탭이 로그아웃한 것을 모르는 탭에서 열기를 누르면 구매가 그대로 된다. 그 계정의 장부에 적힌다(9,999.05, 구매 1건). 손님 장부는 건드리지 않았다.
- 같은 까닭으로 `communityStore.ts:67-72` 의 storage 듣기도 이 사이트에서는 맞지 않는다(코드. 이 함수를 부르는 곳은 도달 가능한 화면에 없다).

### F-05. 없는 주소 화면의 "박스 보기"가 사이트 밖으로 나간다 (P2 후보)

- 본 것(실행 01b:d1): `/ko/no-such-page/` 는 상태 404 로 없는 주소 화면을 준다. 그 화면의 링크는 `href="/ko"` 이고 누르면 `https://shinwon446-eng.github.io/ko` 로 가서 GitHub 의 "Site not found" 가 나온다.
- 까닭: `app/not-found.tsx:25` 가 기본 경로(`/voila-test-aresjoo`)를 붙이지 않는다. 이 화면에는 머리줄과 꼬리말도 없어 돌아올 길이 브라우저의 뒤로 가기뿐이다.

### F-06. 계정 화면의 비밀번호 바꾸기와 탈퇴가 이 사이트에서는 언제나 실패한다 (P2 후보)

- 본 것(실행 03:a3): 현재 비밀번호, 12자 이상의 새 비밀번호, 6자리 코드를 넣어도 "로그인 정보를 확인해 주세요..." 한 줄이 뜨고 바뀌지 않았다. 탈퇴도 확인창에서 확정하면 같은 한 줄이 뜨고 계정과 세션이 그대로였다.
- 까닭: 비밀번호 시트는 바꾸기만 부르고(`AccountSheets.tsx:61`), 이 브라우저 장부는 그 전에 현재 비밀번호 확인을 거친 계정만 받는다(`browserAccount.ts:233`). 탈퇴 시트는 옛 주소 `/account/closure` 를 부르는데(`account.ts:191`) 이 브라우저 장부는 그 주소를 언제나 거절한다(`browserAccount.ts:147-150`). 단계를 다 밟는 옛 화면(`components/auth/PasswordChangeFlow.tsx`, `AccountClosureFlow.tsx`)은 어느 라우트에서도 불리지 않는다.

### F-07. 배포 사이트에서 끝까지 갈 수 없는 흐름 둘: 충전과 배송 신청 (기능 상태로 분류할 것)

- 충전(실행 06:w1, 04:o7): 충전 시트는 어느 네트워크든 "주소를 받지 못했습니다."와 "주소 다시 받기"만 보여 준다. 빌드에 입금 주소가 없고(`lib/runtime.ts:16-20`), 이 브라우저 장부는 주소를 스스로 만들지 않는다(`browserAccount.ts:156-160`). 그래서 잔액 부족을 푸는 길은 보관 상품을 USDT 로 받는 것뿐이고, 새 계정은 첫 로그인 보너스 10,000 으로 시작한다.
- 배송 신청(코드): `lib/claim.ts:36` 이 부르는 `/shipping/request` 를 이 브라우저 장부가 처리하지 않는다(`browserAccount.ts:339`). 확인창에서 확정하면 실패 한 줄이 뜰 것이다. 지시에 따라 누르지 않았다. `web/scripts/capture/README.md` 도 같은 사실을 적고 있다.

### F-08. 로그인 시트의 `autoFocus` 가 듣지 않는다 (P2 후보)

- 본 것(실행 09:k1, 09b:e1, 03:a1): 시트가 열린 직후의 포커스는 이메일 칸이 아니라 시트 자체다. 이메일을 넣고 Enter 를 누른 뒤의 포커스는 비밀번호 칸이 아니라 본문이다.
- 까닭: 열릴 때는 `useModal.ts:39-43` 이 시트에 포커스를 준다(칸의 `autoFocus` 뒤에). 단계가 바뀔 때는 처리 중이라 칸이 `disabled` 인 채로 그려져(`LoginSheet.tsx:89-91` 의 `disabled={busy}`) `autoFocus` 가 듣지 않는다.
- 영향: 키보드만 쓰는 사람은 단계마다 Tab 을 두 번 더 눌러야 한다. 시트를 열고 곧바로 Enter 를 누르면 아무 일도 없다.

### F-09. PC 머리줄의 "지금 화면" 표시가 박스에만 붙는다 (P2 후보)

- 본 것(실행 01:n1): 보관함, 지갑, 나온 상품, 검증, 이용 방법, 계정 어디에 있어도 `aria-current="page"` 인 링크가 없었다. 박스 목록에서만 붙는다.
- 까닭(짐작이 섞임): `AppShell.tsx:49` 가 경로를 `/inventory` 같은 값과 그대로 견주는데, 이 빌드는 주소 끝에 빗금을 붙인다(`trailingSlash`). 견주는 값이 `/inventory/` 라서 같지 않은 것으로 보인다. 경로 값을 직접 찍어 보지는 않았다.

### F-10. 꼬리말에서 언어를 바꿔도 "고른 언어"가 저장되지 않는다 (P2 후보)

- 본 것(실행 01:n3): 영어로 바꾼 뒤에도 `gachaflix.locale` 은 심어 둔 값 그대로였다. 루트 주소 `/` 는 이 값이 있으면 그 언어로, 없으면 브라우저 언어로 보낸다(`app/page.tsx:7`).
- 까닭: 이 키를 쓰는 곳은 옛 `components/layout/LanguageSelector.tsx:14` 뿐인데 새 꼬리말(`AppFooter.tsx:61`)은 링크만 쓴다. 옛 부품은 도달 가능한 화면에 없다.
- 영향: 주소에 언어가 들어 있어 화면을 옮겨 다니는 동안에는 유지된다. 루트 주소로 다시 들어올 때만 고른 언어가 아니라 브라우저 언어(또는 옛 값)로 간다.

### F-11. 이용 방법의 검증 링크가 옛 주소를 가리킨다 (P3 후보)

- 본 것(실행 01:n4): 링크의 주소가 `/ko/fairness/` 다(`app/[locale]/guide/page.tsx:26`). 누르면 옮긴 화면이 나오고 단추를 한 번 더 눌러야 검증 화면이다.

### F-12. 그 밖에 본 것

- 로그아웃 뒤의 "로그아웃했습니다." 는 화면에 나오지 않는다(실행 01b:d3). `authStore.ts:67-74` 가 토스트를 스토어에 넣지만 새 화면에는 그것을 그리는 곳이 없다(`components/auth/AuthHost.tsx:50` 은 로그인 시트만 그린다. 머리말의 주석은 토스트도 띄운다고 적고 있다).
- 달러 표시에서 음수 금액은 `$-50` 으로 적힌다(실행 06:w3, `WalletScreen.tsx:70`, `lib/formatCurrency.ts:20`). 원화는 `-₩...` 꼴이다(`formatCurrency.ts:34-37`, 코드).
- 원화 표시의 출금 화면(실행 06:w4): 금액 칸에 20000 을 넣으면(14.49 USDT) "₩20,000부터 출금할 수 있습니다." 가 뜬다. 27600 을 넣어 확인 단계에 가면 금액과 받는 금액이 둘 다 ₩20,000 으로 적힌다. 만원 아래를 버려 적는다는 정해진 표기(`formatCurrency.ts:31-38`) 때문이다. 정한 대로 움직이는 것이지만 넣은 숫자와 화면의 글자가 다르다.
- 가입 화면은 "12자 이상으로 정합니다."라고 적지만 5자 비밀번호로 가입이 된다(실행 03:a1, `account.ts:52`). 가입한 적 없는 이메일과 한 글자 비밀번호로 로그인하면 그 자리에서 계정이 생기고, 가입 때와 다른 비밀번호로도 로그인된다(실행 03:a1, `browserAccount.ts:89-102`). 이 브라우저 시험 장부의 성질이다.
- `/ko/dev/gallery/` 는 상태 200 으로 없는 주소 화면을 준다(실행 01b:d1). 다른 없는 주소는 404 다.
- `components/home/HeroBanner.tsx:129-131` 은 `return null` 뒤에 훅을 부른다(코드). 가입 혜택 박스가 빌드마다 정해져 있어 실제로 순서가 바뀌지는 않는다.

## 7. 정리되지 않는 것이 있는지(듣기와 타이머)

도달 가능한 코드의 듣기와 타이머를 전부 찾아(`addEventListener`, `setInterval`, `setTimeout`, `requestAnimationFrame`, 감시자) 정리하는 곳을 읽었다. 전부 코드로만 본 것이다.

| 곳 | 무엇 | 정리 |
|---|---|---|
| `lib/useModal.ts:41, 68` | rAF, keydown | 있다(`69-84`) |
| `shell/StateScreens.tsx:51-52` | online, offline | 있다(`53`) |
| `ui/ScrollRow.tsx:22-23` | scroll, ResizeObserver | 있다(`25`) |
| `ui/toast.tsx:21` | 2.4초 타이머 | 있다(`22`) |
| `box/Opening.tsx:131-133, 150` | 연출 타이머 셋, 잠금 타이머 | 있다(`135, 151`). 사라질 때 소리도 멈춘다(`119`) |
| `box/Reveal.tsx:78, 86-88` | 같다 | 있다(`79, 90`) |
| `flow/TakeSheet.tsx:43-44` | focus, visibilitychange | 있다(`45`) |
| `inventory/InventoryScreen.tsx:67` | 1분 주기 | 있다(`68`) |
| `wallet/WalletScreen.tsx:58, 64` | 10초 주기, 1분 주기 | 있다(`61, 64`) |
| `lib/useUsdtDeposit.ts:67` | 5초 주기 | 있다(`71`) |
| `home/HeroBanner.tsx:61, 67, 75-76, 115, 123-125` | matchMedia, 감시자, 타이머, resize, rAF | 있다(`62, 69, 77, 126`) |
| `home/heroBall.ts:100` | webglcontextlost | 있다(`114`) |
| `layout/LabBadge.tsx:24` | storage-full | 있다(`25`) |
| `stores/authStore.ts:124-126` | storage, focus, visibilitychange (모듈이 읽힐 때 한 번) | 다시 읽힐 때만 정리한다(`97-98, 127`). 화면이 사라져도 남는 것이 의도다 |
| `stores/authStore.ts:73` | 토스트를 5초 뒤 지우는 타이머 | 없다. 지울 대상이 같은 id 일 때만 지우므로 해는 없다 |
| `lib/takeBatch.ts:406` | 2초 뒤 한 번 더 맞춰 보는 타이머 | 없다. 화면과 무관한 모듈 수준의 일이다 |

기다리는 일이 화면이 사라진 뒤에 끝나는 경우:

- `Opening.tsx:154-165` 의 받기는 `alive` 로 막는다. `TakeSheet.tsx:123-139` 와 `LoginSheet.tsx:41-49`, `WithdrawScreen.tsx:137-167` 은 요청 세대 번호로 막는다. `VerifySheet.tsx:39-47` 은 `alive` 로 막는다.
- `Reveal.tsx:127-134` 와 `InventoryScreen.tsx:89-95` 의 한 개 받기는 막는 것이 없다. 받는 동안 화면을 닫으면 사라진 화면의 상태를 바꾸려 한다(React 18 에서는 조용히 버려진다). 돈은 `takeBatch` 가 따로 지킨다.
- `BoxScreen.tsx:140-158` 의 구매도 같다. 구매가 끝나기 전에 화면을 떠나면 결과 화면은 뜨지 않고, 돌아왔을 때 못 본 결과로 나타난다(실행 04:o4 가 뒤로 가기로 봤다).

길게 누르기, 밀기, 끌기, 더블클릭 전용 핸들러는 도달 가능한 화면에 없다(`onPointer`, `onTouch`, `onDrag`, `onDoubleClick`, `onKeyDown` 을 찾았고 한 줄도 나오지 않았다). 도달 가능한 화면은 framer-motion 을 쓰지 않는다.

## 8. 도달할 수 없는 옛 부품

아래 파일은 어느 라우트에서도(직접이든 거쳐서든) 불리지 않는다. `app/` 의 화면들이 가져오는 것을 따라가며 확인했다(코드). 인터랙션은 하나씩 적지 않고 파일마다 핸들러 속성(`onClick`, `onChange`, `onSubmit`, `onKeyDown`, 마우스와 포인터 계열)의 개수만 적는다. 옛 화면의 내용은 루트의 `UI_INVENTORY.md`(개편 전 것)가 다룬다.

| id | 파일 | 핸들러 수 | 누가 가져오는가 |
|---|---|---|---|
| CL-I-240 | `components/unboxing/UnboxingRoulette.tsx` | 16 | 없음 |
| CL-I-241 | `components/unboxing/BulkOpenModal.tsx` | 4 | 없음 |
| CL-I-242 | `components/unboxing/AutoplaySettingsModal.tsx` | 9 | `DetailModal` |
| CL-I-243 | `components/box/DetailModal.tsx` | 9 | 없음 |
| CL-I-244 | `components/box/BoxCard.tsx` | 1 | 없음 |
| CL-I-245 | `components/home/NetflixHome.tsx` | 9 | 없음 |
| CL-I-246 | `components/home/CommerceHome.tsx` | 4 | 없음 |
| CL-I-247 | `components/home/DailyFreeBox.tsx` | 5 | 없음 |
| CL-I-248 | `components/home/HallOfFame.tsx`, `LiveTicker.tsx`, `HotBoxes.tsx`, `QuickTabs.tsx` | 3, 2, 1, 1 | 옛 홈 둘 |
| CL-I-249 | `components/about/AboutSections.tsx`, `VaultHero.tsx`, `GlobalLiveFeed.tsx`, `ImpactStats.tsx` | 4, 3, 1, 1 | 없음 |
| CL-I-250 | `components/auth/AuthModal.tsx` | 13 | 없음 |
| CL-I-251 | `components/auth/HeaderAuthControl.tsx` | 6 | `SiteHeader` |
| CL-I-252 | `components/auth/PasswordChangeFlow.tsx` | 12 | 없음 |
| CL-I-253 | `components/auth/AccountClosureFlow.tsx` | 12 | 없음 |
| CL-I-254 | `components/auth/NicknameSettings.tsx`, `AvatarSettings.tsx`, `SecuritySettings.tsx`, `LoginRequired.tsx` | 5, 5, 5, 1 | 없음(마지막은 옛 지갑 탭) |
| CL-I-255 | `components/community/CommunityBoard.tsx`, `BoardComposer.tsx`, `ReviewFormModal.tsx` | 27, 13, 8 | 없음 |
| CL-I-256 | `components/fairness/FairnessVerifier.tsx`, `VisualVerifier.tsx`, `VisualVerifyModal.tsx`, `HashExplainer.tsx`, `ProofFeed.tsx` | 11, 3, 2, 1, 1 | 옛 개봉 화면 |
| CL-I-257 | `components/inventory/DeliveryModal.tsx`, `CancelShipmentModal.tsx`, `SellConfirmModal.tsx`, `TrackingModal.tsx`, `HotBoxes.tsx` | 11, 4, 3, 3, 2 | 옛 개봉 화면, 또는 없음 |
| CL-I-258 | `components/wallet/WithdrawTab.tsx`, `WithdrawSteps.tsx`, `DepositModal.tsx`, `HistoryTab.tsx`, `UsdtDepositTab.tsx`, `WithdrawalModal.tsx` | 12, 10, 3, 3, 2, 2 | 서로만 |
| CL-I-259 | `components/layout/SiteHeader.tsx`, `LanguageSelector.tsx`, `CurrencySelector.tsx` | 8, 1, 1 | 옛 게시판 |

합쳐서 핸들러 속성 263개가 도달할 수 없는 파일에 있다. 이 가운데 지금 화면에 없는 기능: 하루 무료 박스, 자동으로 열기, 게시판, 아바타, 단계를 다 밟는 비밀번호 변경과 탈퇴, 카드 충전 탭.

## 9. 집계

| 항목 | 수 |
|---|---|
| 행(CL-I-001 에서 CL-I-259) | 259 |
| 도달 가능한 화면의 행 | 239 |
| 그 가운데 직접 실행해 확인한 행(어긋난 것 포함. 개발 서버에서 본 갤러리 관련 5행 포함) | 185 |
| 화면에서 읽기만 한 행(누르지 않음) | 23 |
| 코드로만 읽은 행 | 31 |
| 도달할 수 없는 옛 부품의 행(파일 묶음) | 20 |
| 확인 칸에 어긋남이라고 적은 행 | 12 |

한 행에 컨트롤 여럿을 묶은 곳이 있다(링크 일곱, 문서 행 13 같은 것). 그런 행은 하나라도 눌렀으면 실행으로 세고, 누르지 않은 나머지를 그 칸에 적었다.

### 확인하지 못한 것과 까닭

| 무엇 | 까닭 |
|---|---|
| 출금 신청의 끝(인증 코드 제출, 이메일 인증, 신청함 화면): CL-I-221, CL-I-222, CL-I-223 | 지시: 출금 신청을 보내지 않는다. 확인 단계와 인증 코드 화면까지만 봤다 |
| 배송 신청의 확정: CL-I-194 | 지시: 배송 신청을 보내지 않는다. 소스로는 배포 사이트에서 실패한다 |
| 충전의 주소 복사와 입금 확인: CL-I-147, CL-I-148 | 배포 사이트에 입금 주소가 없다 |
| 받기의 실패, 대기, 알 수 없음 뒤의 단추: CL-I-107, CL-I-137 | 이 상태를 만드는 시험 스위치는 개발 서버에서만 켜진다(`takeBatch.ts:61-64`). 저장소를 막아 "받지 못함"은 만들었다(05:t6) |
| 오류 화면의 다시 불러오기: CL-I-036 | 그리기 오류를 일으킬 길이 없다 |
| 30건, 20건을 넘을 때의 더 보기: CL-I-179, CL-I-204, CL-I-226, CL-I-236 | 그만큼의 기록을 가진 상태를 만들지 않았다 |
| 소리와 진동: CL-I-111 | 헤드리스 브라우저로는 들을 수 없다 |
| 손가락으로 미는 것: CL-I-080 | 전용 핸들러가 없고 브라우저의 가로 스크롤이다. 단추로 넘기는 것만 눌렀다 |
| Apple, Microsoft 로그인: CL-I-160 | Google 과 같은 코드 경로라 하나만 눌렀다 |
| 인증 앱 키 복사: CL-I-167 | 클립보드 권한을 주지 않았다 |
| 탭이 실제로 뒤에 가려졌을 때: 04:o10 의 탭 전환 | 헤드리스에서는 다른 탭을 앞으로 가져와도 `visibilityState` 가 `visible` 이었다. 타이머가 느려지는 실제 브라우저의 움직임은 보지 못했다 |
| 영어와 중국어 화면의 인터랙션 | 언어 전환과 주소만 봤다(01:n3). 같은 부품이라 나머지는 한국어에서만 눌렀다 |
| 갤러리의 "상품 하나" 결과 | 같은 글의 단추가 둘이라 스크립트가 앞의 것(배송 시트)을 두 번 눌렀다 |
