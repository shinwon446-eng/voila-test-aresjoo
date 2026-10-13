# ANIMATION_INVENTORY: 움직임, 소리, 진동의 최종 목록

기준 커밋 `63445c7`, 브랜치 `migration-audit`. 통합일 2026-10-12.
세 분석을 대조하고, 어긋난 곳은 기준 커밋의 코드를 열어 판정했다. `web/` 아래는 고치지 않았다.

## 0. 읽는 법

### 0.1 쓴 자료

| 자료 | 번호 | 무엇을 줬나 |
|---|---|---|
| `analysis/agy-a-visual-source.md` 3절, 4절 | AG-A-001 ~ AG-A-035, AG-TL-001 ~ 007, AG-TL-010 ~ 013, AG-TOK-100 ~ 104 | 소스에서 읽은 움직임 표와 개봉 타임라인 |
| `analysis/agy-b-visual-browser.md` 6절, `harness/agy/motion-result.json`, `motion/agy/` 의 프레임 78장 | 번호 없음(실행 이름 `open-1-normal` 등 넷) | 배포 사이트에서 100ms 간격으로 찍은 단계 기록 |
| `analysis/codex-a-routes-events-state.md` 3절, 5절, 6절 | CX-I-005, CX-I-009, CX-I-011, CX-I-012, CX-I-032, CX-I-036, CX-S-012, CX-S-018, CX-F-063, CX-F-067, CX-F-070 | 타이머와 정리, 구매와 연출의 순서. Codex 는 움직임에 따로 번호를 붙이지 않았다 |
| `analysis/claude-a-ui.md` | CL-U-037, CL-U-044, CL-U-050, CL-U-080 ~ 092, 5.1절, 6.2절 끝, 6.3절 | 단계와 상태의 이름, "닿는 화면의 움직임은 전부 CSS" 라는 판정. Claude A 는 움직임을 화면에서 보지 못했다(움직임 줄이기 창으로 열었다) |
| `analysis/claude-b-interactions.md:512` | 번호 없음 | "도달 가능한 화면은 framer-motion 을 쓰지 않는다" 한 줄(통합자는 이 줄만 읽었다) |

Antigravity 브라우저 보고서는 통합을 시작할 때 있었다(21:17). 다만 그 측정은 100ms 간격의 표본이고 결과의 색조가 넷 다 `below` 였다(실행: `motion-result.json` 을 통합자가 다시 읽음). 그래서 늘어난 결과의 빛과 소리는 아직 아무도 화면에서 보지 못했다.

### 0.2 증거의 말

코드: 통합자가 기준 커밋의 파일을 직접 열어 읽음. 화면: 통합자가 프레임이나 스크린샷 파일을 직접 열어 봄. 실행: 통합자가 직접 돌린 명령. 전달: 분석이 그렇게 적었으나 다시 확인하지 않음. 짐작: 확인하지 못함.

통합자가 직접 읽은 파일(전부): `app/opening.css`, `app/hero.css`, `app/tokens.css`, `app/scroll-fade.css`, `lib/openingFlow.ts`, `lib/openingSound.ts`, `lib/useModal.ts`, `components/ui/Sheet.tsx`, `components/ui/toast.tsx`, `components/ui/ScrollRow.tsx`, `components/layout/MotionPreferences.tsx`. 일부만 읽은 파일: `components/box/Opening.tsx:36-225`, `components/box/Reveal.tsx:35-100,164-250`, `components/box/BoxScreen.tsx:54-172,314-322`, `components/home/HeroBanner.tsx:22-189`, `lib/opening.ts:28-117`, `app/ui.css` 와 `app/globals.css` 는 `animation`, `transition`, `@keyframes`, `prefers-reduced-motion` 이 든 줄 전부.

통합자가 직접 돌린 것:

| 무엇 | 결과 |
|---|---|
| `node harness/consolidate/graph.mjs web dead`(새로 쓴 import 그래프) | `framer-motion` 을 가져오는 파일 24, 그 가운데 라우트에서 닿는 것 1. `canvas-confetti` 를 가져오는 파일 0 |
| 닿는 파일 150개에서 `motion.`, `AnimatePresence`, `useReducedMotion`, `animate-`, `transition-`, `onAnimationEnd`, `onTransitionEnd`, `animationend`, `transitionend`, `.animate(` 찾기 | `MotionConfig` 한 곳뿐. 나머지는 0건 |
| 같은 파일에서 `requestAnimationFrame`, `setTimeout`, `setInterval`, `scrollIntoView`, `scrollBy`, `vibrate`, `AudioContext`, `matchMedia`, `IntersectionObserver`, `visibilitychange` 찾기 | 2절과 5절에 적은 자리 전부 |
| `curl` 로 배포된 `/ko/` 의 HTML 받기 | `v-hcard-face--photo` 3, `v-hcard-art` 0, `canvas` 5, 배너는 `data-phase="sweep" data-still=""` |
| `node harness/consolidate/agy-motion.mjs`(AGY 측정 다시 읽기) | 6절 |

## 1. 먼저 정할 것: framer-motion

`ARCHITECTURE.md` 2절은 "움직임: framer-motion 11 (파일 24개에서 씀)"이라고 적었고, Claude 의 두 분석은 "닿는 화면의 움직임은 전부 CSS"라고 적었다. 둘 다 사실이고, 앞의 문장이 읽는 사람을 틀린 쪽으로 이끈다.

판정(실행: import 그래프, 코드):

- `framer-motion` 을 가져오는 파일은 24개다. 숫자는 맞다.
- 그 가운데 라우트에서 닿는 것은 `components/layout/MotionPreferences.tsx:3` 하나다. 이 파일은 `MotionConfig reducedMotion="user"` 로 자식을 감쌀 뿐이고(`:6`), 그 아래에 `motion` 요소가 하나도 없다. 그래서 화면에 아무 움직임도 만들지 않는다. 닿는 길은 `app/[locale]/layout.tsx:9,71` 이고 `[locale]` 아래 18개 라우트 전부에 걸린다. 루트(`/`)와 루트의 없는 주소 화면에는 걸리지 않는다.
- 나머지 23개는 어느 라우트에서도 닿지 않는다(8절 A-101 ~ A-123).
- 닿는 화면의 움직임은 CSS 키프레임과 전환, `setTimeout` 으로 도는 단계 시계, 캔버스 하나(`requestAnimationFrame`), Web Audio, `navigator.vibrate`, 브라우저의 부드러운 스크롤이다.

닿는 `framer-motion` 사용자(1): `components/layout/MotionPreferences.tsx`.

닿지 않는 `framer-motion` 사용자(23): `about/AboutSections.tsx`, `about/GlobalLiveFeed.tsx`, `about/ImpactStats.tsx`, `about/LineupShowcase.tsx`, `about/TrustScenes.tsx`, `about/VaultHero.tsx`, `auth/HeaderAuthControl.tsx`, `box/DetailModal.tsx`, `fairness/VisualVerifyModal.tsx`, `home/DailyFreeBox.tsx`, `home/HotBoxes.tsx`, `inventory/DeliveryModal.tsx`, `inventory/HotBoxes.tsx`, `inventory/SellConfirmModal.tsx`, `inventory/TrackingModal.tsx`, `unboxing/AutoplaySettingsModal.tsx`, `unboxing/BulkOpenModal.tsx`, `unboxing/MegaWinFX.tsx`, `unboxing/UnboxingRoulette.tsx`, `unboxing/UpgradeFX.tsx`, `unboxing/VaultGateFX.tsx`, `wallet/DepositModal.tsx`, `wallet/WithdrawalModal.tsx`(전부 `web/components/` 아래).

`ARCHITECTURE.md` 의 문장은 이렇게 바꾸는 것이 맞다(통합자는 그 파일을 고치지 않았다):

> 움직임: 닿는 화면은 CSS 키프레임과 전환, 타이머로 도는 단계 시계, 캔버스 하나로 움직인다. framer-motion 11 은 의존성에 있고 파일 24개가 가져오지만, 라우트에서 닿는 것은 `MotionPreferences.tsx`(설정 래퍼, 움직임 없음) 하나이고 나머지 23개는 닿지 않는 옛 화면이다. canvas-confetti 는 의존성에 있으나 쓰는 곳이 없다.

MISSION 5절의 "기존 애니메이션 라이브러리가 이미 사용된다면 유지"는 여기서는 "CSS 와 타이머 구조를 유지"로 읽어야 한다. 닿는 화면에 framer-motion 을 새로 들이면 그것이 원본과 다른 구현이 된다.

## 2. 공통 규칙

| 규칙 | 내용 | 근거 |
|---|---|---|
| 끝남 콜백 | 없다. 닿는 소스에 `animationend`, `transitionend`, `onAnimationEnd`, `onTransitionEnd` 가 하나도 없다. 단계는 전부 `setTimeout` 이 바꾼다. 그래서 프레임이 밀려도 단계는 벽시계대로 넘어간다 | 실행(찾기 0건). 코드: `Opening.tsx:130-134,150`, `Reveal.tsx:78,85-89`, `HeroBanner.tsx:75-76`, `toast.tsx:21` |
| 사라지는 움직임 | 없다. 시트, 확인창, 토스트, 개봉 장면은 닫히면 DOM 에서 바로 빠진다. 예외는 A-032 하나(홈 배너의 장면이 0.4초에 흐려짐)다 | 코드: `Sheet.tsx:15,35`(닫히면 `null`), `toast.tsx:24`, `hero.css:27-28` |
| 움직임 줄이기, 첫째 층 | 새 화면의 키프레임과 전환 대부분이 `@media (prefers-reduced-motion: no-preference)` 안에 있다. 줄이기면 규칙 자체가 없다 | 코드: `ui.css:114,132,142,301`, `opening.css:109-130` |
| 움직임 줄이기, 둘째 층 | 전역 규칙이 하나 더 있다. 줄이기면 모든 요소의 `animation-duration` 과 `transition-duration` 이 0.01ms, 반복은 1회, `scroll-behavior` 는 auto(important 표시가 붙어 있다). 첫째 층 밖의 전환(단추의 0.1초 등)도 이것으로 사라진다 | 코드: `globals.css:517`. 세 분석 모두 이 줄을 적지 않았다. 통합자가 찾았다 |
| 움직임 줄이기, 셋째 층 | 스크립트가 따로 본다. 개봉은 상자 연출을 건너뛰고 결과부터(`Opening.tsx:129`, `Reveal.tsx:84`), 홈 배너는 펼친 한 장면에 멈춘다(`HeroBanner.tsx:58-63,133,136`) | 코드. 화면: `motion/agy/open-1-reduced/frame-0000ms.png` 의 기록이 첫 표본부터 `reveal`(실행: 측정 파일) |
| 줄이기를 보는 때 | 개봉은 장면이 뜰 때 한 번만 본다. 홈 배너는 바뀌는 것을 듣는다(`change` 이벤트) | 코드: `Opening.tsx:129`, `HeroBanner.tsx:61` |
| 토큰 | `--v-fast: 0.1s`, `--v-ease: cubic-bezier(0.2, 0.8, 0.2, 1)` | 코드: `tokens.css:70-71`. AG-TOK-100, AG-TOK-101 |
| 움직이는 속성 | `transform` 과 `opacity`. 예외는 색 전환(A-006)과 잔액 테두리(A-021)의 `border-color`, 배너의 `translate`(A-036, A-041) | 코드 |
| 손짓 | 끌기, 밀기, 길게 누르기로 도는 움직임은 없다. 가로로 넘기는 줄은 브라우저의 스크롤이다 | 전달: `claude-b-interactions.md:512`. 실행: 닿는 파일에 `onPointer`, `onTouch`, `onDrag` 를 통합자가 따로 찾지는 않았다 |
| 스프링 | 없다(CSS 의 `cubic-bezier` 뿐이다. 튀는 느낌은 1 을 넘는 곡선 값으로 낸다: A-013, A-014, A-031, A-035) | 코드 |

## 3. 닿는 움직임

"줄이기" 칸에 따로 적지 않은 것은 2절의 첫째 층과 둘째 층대로 움직임 없이 끝 모양만 보인다. "끝난 뒤" 칸은 그 움직임이 끝났을 때 코드가 하는 일인데, 2절대로 어느 것도 콜백을 갖지 않는다. 그래서 그 칸에는 "같은 때에 타이머가 하는 일"을 적었다.

### 3.1 기본 부품

| id | 무엇, 자리 | 트리거 | 길이, 지연, 곡선 | 키프레임과 속성 | 반복 | 끊길 때, 사라질 때 | 소리 | 출처 | 일치와 상태 |
|---|---|---|---|---|---|---|---|---|---|
| A-001 | 자리 표시의 깜빡임 `.v-skel`. `ui.css:113-115` | 자리 표시가 그려짐(여덟 곳) | 1.4초, 지연 0, ease-in-out | `v-pulse`: 50% 에서 opacity 0.55 | 끝없이 | 자료를 읽으면 요소가 빠진다 | 없음 | AG-A-001, CL-U-037 | 일치. 코드 확인됨. 화면은 확인 불가(저장값이 금방 읽혀 Claude 의 창에서 한 번도 잡히지 않았다) |
| A-002 | 시트 바탕이 나타남 `.v-scrim`. `ui.css:133,136` | 시트나 확인창이 열림 | 0.18초, ease-out | `v-fade`: opacity 0 에서 | 1회 | 닫히면 바로 빠진다. 개봉 장면과 결과 위에서는 이 움직임이 꺼진다(`opening.css:47`) | 없음 | AG-A-002, CL 5.1 | 일치. 코드 확인됨 |
| A-003 | 시트가 올라옴 `.v-sheet`. `ui.css:134,137` | 시트나 확인창이 열림 | 0.26초, `--v-ease` | `v-rise`: translateY(24px) 와 opacity 0 에서 | 1회 | 닫히면 바로 빠진다. 개봉 장면과 결과 위에서는 A-024 로 바뀐다 | 없음 | AG-A-003, CL 5.1 | 어긋남(D-A2: AGY 는 "끝난 뒤 focus()"라고 적었다). 코드 확인됨 |
| A-004 | 토스트가 올라옴 `.v-toast`. `ui.css:142` | `useToast().show()`(주소 복사, 인증 앱 키 복사) | 0.2초, `--v-ease` | `v-rise` | 1회. 글이 바뀌면 `key` 가 바뀌어 다시 돈다 | 2.4초 타이머 뒤에 바로 빠진다(`toast.tsx:21`). 사라지는 움직임 없음 | 없음 | AG-A-004, CL-U-202 | 일치. 코드 확인됨. 화면은 확인 불가(아무도 토스트를 띄우지 않았다) |
| A-005 | 주 단추가 눌림 `.v-btn:active`. `ui.css:59,61-62` | 누르는 동안 | 0.1초(`--v-fast`), 곡선은 브라우저 기본(ease) | transform: scale(0.985) | 떼면 돌아옴 | disabled 면 transform none | 없음 | AG-A-005, CL-U-026 | 일치. 코드 확인됨 |
| A-006 | 색 전환 일곱 곳: `.v-headbtn` 배경(`ui.css:37`), `.v-btn` 배경(`:59`), `.v-chip` 배경과 테두리(`:76`), `.v-input` 테두리(`:96`), `.v-boxcard` 배경(`:146`), `.v-check` 테두리(`take.css:5`), `.v-op-toggle` 배경과 테두리(`opening.css:61`) | hover, 선택, focus | 0.1초, 기본 곡선 | background, border-color | 해당 없음 | 해당 없음 | 없음 | AG-I(`agy-a` 5.2절은 상태의 색만, 시간은 적지 않음), AG-S-001 ~ 010(hover 사진) | AGY 의 움직임 표에 없다. 통합자가 코드에서 찾음. 확인됨(코드) |
| A-007 | 자동 채움 바탕을 막는 전환 `input:-webkit-autofill`. `ui.css:16` | 브라우저가 칸을 자동으로 채움 | `background-color 9999s` | 눈에 보이는 움직임이 아니다(브라우저의 노란 바탕이 끼지 않게 하는 수법) | 해당 없음 | 해당 없음 | 없음 | CL-U-034("자동 채움 색") | 통합자가 코드에서 찾음. 확인됨(코드) |
| A-008 | 부드러운 스크롤 세 곳: 별점 링크 → `#reviews`(`BoxScreen.tsx:176`), 대표 상품 → `#box-contents`(`:180`), 후기 줄의 좌우 단추(`ScrollRow.tsx:29`, 한 번에 폭의 0.8배 또는 160px 가운데 큰 쪽) | 누름 | 브라우저가 정한다 | 스크롤 위치 | 1회 | 다시 누르면 브라우저가 새 목표로 간다 | 없음 | CX-F-063, CX-F-070, CL-U-041, CL-U-064, CL-U-065 | 일치. 줄이기 분기가 코드에 없다(`behavior: "smooth"` 고정, Codex 도 같은 말). 줄이기에서 실제로 어떻게 되는지는 확인 불가 |

움직임이 아닌 것(혼동하지 않게 적는다): `details` 로 만든 접는 글은 바로 펴진다(전환 없음, `ui.css:333-337` 은 Claude 의 인용). 후기 줄 끝의 흐림은 `data-prev`, `data-next` 로 바로 켜지고 꺼진다(`scroll-fade.css:5-7`, 전환 없음). 검증 화면이 주소의 값을 받고 아래로 내려가는 것은 부드러운 스크롤이 아니다(`VerifyScreen.tsx:49`, `behavior` 없음).

### 3.2 한 개 열기 (`components/box/Opening.tsx`, `app/opening.css`)

단계는 `.v-op` 의 `data-phase` 다: anticipation → impact → exit → reveal → ready. 길이는 장면이 뜰 때의 "짧게 보기" 설정으로 정해 `--ant`, `--imp`, `--exit` 변수에 싣는다(`Opening.tsx:95,209`, `openingFlow.ts:62-68`). 보통 520, 150, 170ms. 짧게 220, 110, 120ms. 길이는 결과와 무관하다.

| id | 무엇, 자리 | 트리거 | 길이, 지연, 곡선 | 키프레임과 속성 | 줄이기 | 소리와 진동 | 같은 때의 타이머 | 출처 | 일치와 상태 |
|---|---|---|---|---|---|---|---|---|---|
| A-010 | 상자가 내려앉음 `.v-boxw`. `opening.css:110,132` | anticipation(장면이 뜸) | `--ant`, cubic-bezier(0.3, 0, 0.4, 1), both | `v-op-settle`: 0% opacity 0 과 translateY(-28px), 24% opacity 1 과 translateY(2px), 100% translateY(8px) scale(0.93) | 상자가 아예 그려지지 않는다(결과부터) | 없음 | `--ant` 뒤에 impact 로 | AG-A-006, AG-TL-003, CX-I-009, CL-U-082 | 어긋남(D-A3: AGY 는 여기에 누름 소리를 붙였다). 코드 확인됨. 화면: `motion/agy/open-1-normal/frame-0300ms.png`(통합자가 열어 봄: 상자, 봉인, "결과 바로 보기") |
| A-011 | 봉인의 별이 감김 `.v-seal-star`. `opening.css:112,133` | anticipation | `--ant`, cubic-bezier(0.6, 0, 0.9, 0.4), both | `v-op-wind`: rotate 0 → 90deg, scale 1 → 1.16 | 위와 같음 | 없음 | 없음 | AG-A-007 | AGY 한 곳. 코드 확인됨 |
| A-012 | 뚜껑이 두 번 들썩임 `.v-box3-lid`. `opening.css:113,134` | anticipation | `--ant`, linear, both | `v-op-strain`: rotateX 0(0 ~ 42%), 5deg(56%), 1deg(66%), 8deg(82%), 0(100%) | 위와 같음 | 없음 | 없음 | AG-A-008 | AGY 한 곳. 코드 확인됨 |
| A-013 | 상자가 튐 `.v-boxw`. `opening.css:114,135` | impact | `--imp`, cubic-bezier(0.2, 1.7, 0.4, 1), both | `v-op-pop`: translateY(8px) scale(0.93) → translateY(-6px) scale(1.05) | 위와 같음 | A-052, A-054(건너뛰지 않았을 때만) | `--imp` 뒤에 exit 로 | AG-A-009, AG-TL-004 | 일치. 코드 확인됨 |
| A-014 | 뚜껑이 넘어감 `.v-box3-lid`. `opening.css:92,115` | impact(exit 에서도 같은 끝 모양) | 전환 0.34초, cubic-bezier(0.2, 1.3, 0.35, 1) | transform: rotateX(112deg). 축은 `transform-origin: 50% 100% -79px` | 위와 같음 | 없음 | 없음 | AG-A-010 | AGY 한 곳. 코드 확인됨. 계산: 0.34초가 impact 와 exit 를 합친 것(보통 320ms, 짧게 230ms)보다 길어 끝나기 전에 상자가 빠진다(보통 20ms, 짧게 110ms 남음) |
| A-015 | 봉인이 떨어짐 `.v-seal`. `opening.css:94,116` | impact | transform 0.3초 cubic-bezier(0.4, 0, 0.9, 0.5), opacity 0.1초 지연 0.22초 linear | translateZ(150px) translate(-46px, 150px) rotate(-220deg), opacity 0 | 위와 같음 | 없음 | 없음 | AG-A-011 | AGY 한 곳. 코드 확인됨 |
| A-016 | 열린 틈의 빛 `.v-box3-glow`. `opening.css:96-98,117` | impact | opacity 0.1초 ease-out | opacity 0 → 0.2(below, even), 0.6(above), 0.95(high, top) | 위와 같음 | 없음 | 없음 | AG-A-012 | AGY 한 곳. 코드 확인됨. 0.6 과 0.95 는 화면 확인 불가(측정이 전부 below) |
| A-017 | 상자가 물러남 `.v-boxw`. `opening.css:100,118,136` | exit | `--exit`, cubic-bezier(0.4, 0, 0.9, 0.6), both | `v-op-leave`: opacity 1 → 0, translateY(-6px) scale(1.05) → translateY(34px) scale(0.8) | 위와 같음 | 없음 | 보통 840ms(짧게 450ms)에 reveal 로. 그때 상자가 DOM 에서 빠진다(`Opening.tsx:220`) | AG-A-013, AG-TL-005 | 일치. 코드 확인됨 |
| A-018 | 바닥 빛 `.v-op-floor`. `opening.css:21,102-104,119` | reveal 과 ready | opacity 0.6초 ease-out, transform 2초 cubic-bezier(0.05, 0.7, 0.1, 1) | opacity 0.35 → 0.6(above), 0.8(high), 0.9(top). top 은 scale(1.2) 까지. below 와 even 은 그대로 0.35 | 끝 모양만 | 없음 | 없음 | AG-A-014 | AGY 한 곳. 코드 확인됨. 화면 확인 불가(전부 below) |
| A-019 | 받은 것이 나타남 `.v-op-result > *`. `opening.css:121,137` | reveal | 0.24초, cubic-bezier(0.05, 0.7, 0.1, 1), both. 묶음의 자식이 같은 프레임에 함께 | `v-op-in`: opacity 0 과 translateY(10px) scale(0.97) → 제자리 | 바로 제자리 | A-053(다시 보는 결과가 아닐 때) | 같은 때 `onRevealed()`(기록장에 "봤음"), 포커스를 장면으로, 350ms 타이머 시작(`Opening.tsx:143-150`) | AG-A-015, AG-TL-006, CX-I-009 | 어긋남(D-A2: AGY 는 `onRevealed()` 를 이 움직임의 완료 콜백으로 적었다). 코드 확인됨 |
| A-020 | 상태 줄과 단추 묶음이 나타남 `.v-op-status`, `.v-op-actions`. `opening.css:122` | reveal | 0.2초, ease-out, both | `v-fade` | 바로 | 없음 | 없음 | 없음 | 세 분석 어디에도 없다. 통합자가 코드에서 찾음. 확인됨(코드) |
| A-021 | 잔액 알약의 테두리가 한 번 밝아짐 `.v-op-balance[data-changed="true"]`. `opening.css:124,138` | 결과가 드러났고 지금 잔액이 열기 전 잔액과 다를 때(`Opening.tsx:211`). 숫자는 세어 올리지 않고 최종 값으로 바로 바뀐다 | 0.7초, ease-out, both | `v-op-ping`: border-color 제목 색 → 투명 | 테두리 변화 없음 | 없음 | 없음 | AG-A-016, CL-U-081 | 일치. 코드 확인됨 |
| A-022 | 낸 값의 20배 이상: 상품 사진이 다가옴 `.v-op[data-tone="top"] .v-op-photo img`. `opening.css:126,139` | 사진이 그려짐(reveal) | 2.2초, cubic-bezier(0.05, 0.7, 0.1, 1), both | `v-op-push`: scale(1.18) → 제자리 | 제자리 | A-053 의 네 음 | 없음 | AG-A-017 | AGY 한 곳. 코드 확인됨. 화면 확인 불가(그런 결과가 나온 적이 없다) |
| A-023 | 낸 값의 20배 이상: 사진 뒤의 테 빛 `.v-op-halo`. `opening.css:33,127,140` | 위와 같음 | 1.5초, 지연 0.1초, cubic-bezier(0.1, 0.6, 0.2, 1), both | `v-op-halo`: opacity 0 과 scale(0.7) → 30% 에서 opacity 1 → opacity 0.35 와 scale(1.12) | 보이지 않는다(기본 opacity 0) | 없음 | 없음 | AG-A-018, CL-U-085 | 일치. 코드 확인됨. 화면 확인 불가 |
| A-024 | 개봉 장면이나 결과 위의 시트 `.v-op .v-sheet`, `.v-reveal .v-sheet`. `opening.css:47-48,129,141` | 그 위에서 시트나 확인창이 열림 | 0.22초, `--v-ease` | `v-op-sheet`: translateY(24px) 에서. 처음부터 불투명하다. 바탕은 서서히 나타나지 않는다 | 바로 | 없음 | 없음 | CL 5.1("처음부터 불투명") | AGY 의 표에 없다. 통합자가 코드에서 찾음. 확인됨(코드) |
| A-025 | 입력 잠금(움직임이 아니라 시간 문) `.v-op-actions:not([data-armed])`. `opening.css:106-107`, `Opening.tsx:150,273` | reveal 에 들어선 때 | 350ms(`OPENING_ARM_DELAY_MS`, `openingFlow.ts:71`) | `pointer-events: none`. 모양은 처음부터 눌리는 단추와 같다 | 줄이기에서도 350ms 는 그대로다 | 없음 | 350ms 뒤 `ready`: 닫기 단추가 생기고 `data-armed` 가 붙는다 | AG-TL-006, AG-TL-007, AG-TOK-103, CX-I-009, CL-U-090 | 일치. 코드 확인됨. 실행: AGY 측정에서 reveal 뒤 약 300ms 에 ready |

### 3.3 여러 개 열기 (`components/box/Reveal.tsx`)

| id | 무엇, 자리 | 트리거 | 길이, 지연, 곡선 | 키프레임과 속성 | 줄이기 | 소리 | 같은 때의 타이머 | 출처 | 일치와 상태 |
|---|---|---|---|---|---|---|---|---|---|
| A-026 | 결과 화면 전체가 나타남 `.v-reveal`. `ui.css:302` | 화면이 뜸(연출의 시작) | 0.3초, ease-out | `v-fade` | 바로 | 없음 | 없음 | 없음 | 세 분석 어디에도 없다. 통합자가 코드에서 찾음. 확인됨(코드) |
| A-027 | 상자 연출(A-010 ~ A-017 과 같은 키프레임). `.v-op-scene[data-phase]`, `opening.css:51`, `Reveal.tsx:35,85-89,170` | 화면이 뜸 | 520, 150, 170ms 로 고정이다. "짧게 보기" 설정을 읽지 않는다 | 같음. 다만 틈의 빛은 언제나 0.2 이고 바닥 빛은 변하지 않는다(색조 규칙이 `.v-op` 에만 걸린다). 아래에 "n개 여는 중" 한 줄 | 상자 없이 결과부터(`Reveal.tsx:84`) | 없다. 이 파일은 소리와 진동을 부르지 않는다(누름 소리 A-051 만 박스 화면에서 난다) | 840ms 에 `done`: 상자가 빠지고 결과가 뜬다 | AG-TL-011, CX-I-012, CL-U-092 | 어긋남(D-A6: AGY 는 "단일 개봉과 동일"이라고만 적었다). 코드 확인됨. 실행: AGY 측정 `open-5-normal` 의 표본이 500ms 에 impact, 700ms 에 exit, 800ms 에 결과 |
| A-028 | 결과 묶음이 올라옴 `.v-reveal-result`. `ui.css:305` | `done` | 0.5초, `--v-ease`, both | `v-rise`: translateY(24px) 와 opacity 0 에서 | 바로 | 없음 | 같은 때 `onRevealed()`, 포커스 이동, 350ms 타이머(`Reveal.tsx:74-80`) | 없음 | 세 분석 어디에도 없다. 통합자가 코드에서 찾음. 화면: `motion/agy/open-5-normal/frame-0900ms.png`(통합자가 열어 봄: 묶음 전체가 아직 옅다) |
| A-029 | 결과 행이 차례로 올라옴 `.v-resultrow`. `ui.css:306`, `Reveal.tsx:248` | `done` | 0.3초, `--v-ease`, both. 지연은 행 번호 x 0.06초, 최대 0.6초(11번째 행부터는 함께) | `v-rise` | 바로 | 없음 | 없음 | AG-A-019, AG-TL-012, CL-U-098 | 일치. 코드 확인됨. 화면: 같은 프레임에서 첫 행은 보이고 둘째 행은 옅다 |
| A-030 | 입력 잠금 350ms. `Reveal.tsx:78,179` | `done` | 350ms | 닫기 단추와 Esc 가 `armed` 전에는 듣지 않는다 | 줄이기에서도 그대로 | 없음 | `armed` | AG-TL-013, CL-U-093 | 일치. 코드 확인됨. AGY 측정은 이 350ms 를 재지 않았다(기록에 `armed` 가 없다) |

### 3.4 홈 배너 (`components/home/HeroBanner.tsx`, `app/hero.css`)

단계 시계(A-031)가 `.v-hero` 의 `data-phase` 를 바꾸고, 안쪽 장면 `.v-hero-scene` 은 따로 `data-phase` 를 가진다: 배너가 open, sweep, fade 면 장면은 `impact`, anticipation 이면 `anticipation`, closed 면 `closed`(`HeroBanner.tsx:146`). 상자는 개봉 장면의 `OpeningBox` 를 그대로 쓴다.

| id | 무엇, 자리 | 트리거 | 길이, 지연, 곡선 | 키프레임과 속성 | 반복 | 줄이기, 멈춤 | 출처 | 일치와 상태 |
|---|---|---|---|---|---|---|---|---|
| A-031 | 단계 시계. `HeroBanner.tsx:41,71-80` | 화면에 20% 이상 보이고 줄이기가 아닐 때 | closed 320ms → anticipation 190ms → open 820ms → sweep 30,000ms → fade 460ms. 한 바퀴 31,790ms. 처음 그려질 때는 sweep 에서 시작해 2,400ms 뒤에 넘어간다 | `data-phase` | 끝없이 | 줄이기: 늘 sweep 한 장면. 화면 밖: 시계가 멈췄다가 그 장면에서 이어 간다 | CX-I-005, CL-U-050, AG-A-020("open 전환") | 어긋남(D-A2: 전환은 움직임의 완료가 아니라 타이머다). 코드 확인됨. 화면 확인 불가(Claude 의 창은 줄이기였고 AGY 는 배너를 재지 않았다) |
| A-032 | 장면이 흐려졌다 돌아옴 `.v-hero-scene`. `hero.css:27-29` | fade, 그다음 closed | 흐려짐 opacity 0.4초 ease-in, 돌아옴 0.16초 ease-out | opacity 1 → 0 → 1 | 바퀴마다 | 줄이기: 전환 없음 | 없음 | 통합자가 코드에서 찾음. 확인됨(코드) |
| A-033 | 뒤의 빛 `.v-hero-light`. `hero.css:24-25` | open, sweep, fade | opacity 0.4초 ease-out | opacity 0.3 → 1 | 바퀴마다 | 위와 같음 | 없음 | 통합자가 코드에서 찾음. 확인됨(코드) |
| A-034 | 상자가 웅크림 `.v-boxw`. `hero.css:33,143` | 장면이 anticipation | 0.19초, cubic-bezier(0.3, 0, 0.4, 1), both | `v-hero-crouch`: translateY(4px) scale(1.03, 0.92) 로. 같은 때 별이 감기고(`v-op-wind`) 뚜껑이 들썩인다(`v-op-strain`): `opening.css:112-113` 의 선택자가 `.v-op` 에 묶여 있지 않아 배너의 상자에도 걸리고, 길이는 배너의 `--ant: 190ms`(`hero.css:27`) | 바퀴마다 | 줄이기: 없음 | AG-A-020 | AGY 는 웅크림만. 별과 뚜껑이 함께 도는 것은 통합자가 코드에서 읽었다(화면 확인 불가). 옮길 때 `opening.css` 의 범위를 좁히면 배너가 달라진다 |
| A-035 | 상자가 열림 `.v-boxw` 와 뚜껑, 봉인, 틈의 빛. `hero.css:34-37,144`, `opening.css:92,115` | 장면이 impact(배너가 open) | 튐 0.2초 cubic-bezier(0.2, 1.7, 0.4, 1) both. 뚜껑 0.34초(A-014 와 같은 규칙). 봉인 opacity 0.12초 ease-out 과 transform 0.3초 ease-in | `v-hero-pop`: translateY(4px) scale(1.03, 0.92) → translateY(-2px) scale(1). 뚜껑 rotateX(112deg). 봉인 translateY(26px) rotate(18deg) 와 opacity 0. 틈의 빛 0.95 | 바퀴마다 | 줄이기: 끝 모양만 | AG-A-021 | AGY 는 튐만. 나머지는 통합자가 코드에서 찾음. 확인됨(코드) |
| A-036 | 카드 석 장이 펼쳐짐 `.v-hcard`. `hero.css:42-48,145-150` | open | 0.72초, cubic-bezier(0.2, 0.8, 0.2, 1), both. 지연: 가운데 0, 왼쪽 0.06초, 오른쪽 0.12초 | `v-hcard-in`: 0% opacity 0 과 translate(0, 10px) scale(0.34), 9% opacity 1, 68% 제자리보다 9px 위, 100% 제자리(왼쪽 -124px, -78px, -13deg, rotateY 16deg. 가운데 -104px, scale 1.16. 오른쪽은 왼쪽의 거울) | 바퀴마다 | 줄이기: 펼친 채 | AG-A-022 | 일치(AGY 는 지연 셋을 어느 카드의 것인지 적지 않았다). 코드 확인됨 |
| A-037 | 구슬이 나타나고 사라짐 `.v-hero-orb`. `hero.css:92,98,100-105` | open 과 sweep 에 나타나고 fade 에 사라진다 | 나타남: transform 0.44초 cubic-bezier(0.2, 1.35, 0.35, 1), opacity 0.14초 ease-out, 구슬마다 지연 0.2, 0.04, 0.12, 0.16, 0.08초. 사라짐: transform 0.26초 ease-in, opacity 0.2초 ease-in, 지연 0 | scale 0 → 1, opacity 0 → 1 | 바퀴마다 | 줄이기: 전환 없음 | 없음 | 통합자가 코드에서 찾음. 확인됨(코드). 휴대폰 폭(720px 미만)에서는 셋째 구슬이 없다(`hero.css:102,138`) |
| A-038 | 구슬이 떠다님 `.v-hero-orb`. `hero.css:92,101-104,154` | 늘 | 4.2초, ease-in-out. 시작 어긋남 0, -1.4, -2.6, -0.8, -3.3초 | `v-hero-drift`: translate -3px 6px ↔ 3px -8px | 끝없이, 오가며 | 줄이기: `data-still` 로 멈춤 | AG-A-026 | 어긋남(D-A8). 코드 확인됨 |
| A-039 | 공의 그림(캔버스 다섯). `HeroBanner.tsx:31-37,88-127`, `components/home/heroBall.ts:76-114` | 배너가 돌 때 프레임마다(`requestAnimationFrame`). closed 와 anticipation 에는 그리지 않는다 | 흔들림 주기 5.2초(좌우 16도), 4.3초(위아래 7도), 6.1초(기울기 8도). open 이 되면 0.8초에 걸쳐 돌아 들어온다(좌우 150도, 기울기 50도, 끝으로 갈수록 느리게), 공마다 지연 200, 40, 120, 160, 80ms. 프레임 사이는 64ms 로 막는다 | WebGL 로 그린 공을 2D 캔버스에 옮긴다 | 끝없이 | 줄이기: 한 번만 그린다(돌아 들어오지 않는다). 화면 밖: 프레임을 멈춘다. WebGL 을 못 쓰는 기기: 유리구슬(`.v-hero-orb > i`) | AG-A-029, CX-F-067, CX-I-005, CL-U-052 | 일치(AGY 의 "60fps"는 화면 주사율을 따른다는 뜻으로 읽는다). 코드 확인됨. 실행: 배포 HTML 에 `canvas` 5 |
| A-040 | 카드에 빛이 지나감 `.v-hcard-glare`. `hero.css:75-78,152` | sweep | 0.8초, linear, both. 지연 0, 0.1, 0.2초(왼쪽부터) | `v-hero-glare`: translateX 0 → 150px(기울기 -18deg), opacity 0 → 0.55 → 0 | 바퀴마다 1회 | 줄이기: 없음 | AG-A-023 | 일치. 코드 확인됨 |
| A-041 | 카드가 살짝 돌아섬 `.v-hcard-face`. `hero.css:79-81,151` | sweep | 1초, ease-in-out, both. 지연 0, 0.1, 0.2초 | `v-hcard-wobble`: rotateY 0 → -6deg(30%) → 6deg(72%) → 0 | 바퀴마다 1회 | 줄이기: 없음 | AG-A-024 | 일치. 코드 확인됨 |
| A-042 | 펼친 카드가 떠 있음 `.v-hero-cards`. `hero.css:84,153` | sweep | 3.2초, ease-in-out | `v-hero-float`: translate 0 3px ↔ 0 -6px | 끝없이, 오가며 | 줄이기: 멈춤 | AG-A-025 | 일치. 코드 확인됨 |
| A-043 | 빛 조각 여섯 `.v-hero-spark`. `hero.css:108-115,156` | sweep | 2.2초, ease-in-out. 지연 0.1, 0.9, 0.5, 1.3, 1.7, 0.3초 | `v-hero-twinkle`: opacity 0 → 0.95(40%) → 0.2(70%) → 0, scale 0.4 → 1 → 0.7, rotate 0 → 45 → 70deg | 끝없이 | 줄이기: opacity 0.7 로 멈춤(`hero.css:121`) | AG-A-028 | 일치. 코드 확인됨 |
| A-044 | 그린 카드의 박 반사 `.v-hcard-art::after`. `hero.css:54,60-61,155` | 그린 카드가 있을 때 늘 | 8초, linear. 시작 어긋남 0, -1.6, -3.4초 | `v-hero-foil`: rotate 한 바퀴 | 끝없이 | 줄이기: 멈춤 | AG-A-027 | 배포 사이트에서는 도달 불가다. 실행: 배포된 `/ko/` 의 카드 석 장이 모두 사진 카드(`v-hcard-face--photo` 3, `v-hcard-art` 0)라 이 요소가 없다. 사진 파일이 없는 빌드에서만 보인다(`HeroBanner.tsx:27-29,134,152`) |

### 3.5 소리와 진동 (`lib/openingSound.ts`)

기본은 꺼짐이다(`stores/settingsStore.ts:34`, `openSound: false`). 개봉 설정 시트의 "소리와 진동" 스위치 하나가 소리와 진동을 함께 켠다. 음량 계수는 0.16(`openingSound.ts:32`). 파일을 내려받지 않고 Web Audio 로 그 자리에서 만든다. 장치를 못 쓰면 조용히 넘어간다(`:17-22` 의 try 와 catch). 장면이 닫히면 예약한 소리를 모두 멈춘다(`Opening.tsx:119`).

| id | 무엇 | 언제 | 내용 | 출처 | 일치와 상태 |
|---|---|---|---|---|---|
| A-051 | 누름 소리 `soundPress` | 열기 단추와 "한 번 더"를 누른 그 손짓 안(`BoxScreen.tsx:163`). 큰 금액 확인창이 뜨는 경우에도 누른 때에 난다. 한 개와 여러 개 모두 | 삼각파 220Hz, 0.06초, 세기 0.5 | AG-TL-001, AG-A-006 | 어긋남(D-A3). 코드로 판정: anticipation 이 아니라 누른 때다 |
| A-052 | 여는 소리 `soundOpen` | 한 개 열기의 impact, 건너뛰지 않았고 줄이기가 아닐 때(`Opening.tsx:141`) | 잡음 0.05초(저역 통과 2,400Hz, 세기 0.9), 사인파 92Hz 0.2초(0.01초 뒤), 잡음 0.12초(700Hz, 세기 0.35, 0.05초 뒤). 결과와 무관하게 같다 | AG-A-009, AG-TL-004 | 일치. 코드 확인됨 |
| A-053 | 결과 소리 `soundResult` | 한 개 열기의 reveal, 다시 보는 결과가 아닐 때. 건너뛰었거나 줄이기여도 난다(`Opening.tsx:146`) | below 와 even: 없음. above: 523.25, 659.25Hz. high: 여기에 783.99Hz. top: 392, 523.25, 659.25, 783.99Hz. 음 사이 0.085초, 음 길이 0.42초(top 은 0.9초), 사인파 | AG-A-015, AG-TL-006 | 일치(AGY 의 "글리산도"는 차례로 울리는 네 음이다). 코드 확인됨 |
| A-054 | 진동 `hapticImpact` | A-052 와 같은 때, 같은 조건 | `navigator.vibrate(12)` 한 번. 기능이 없는 기기는 넘어간다 | AG-A-009, AG-TL-004 | 일치. 코드 확인됨 |

소리와 진동은 넷 다 화면 확인 불가다(아무도 소리를 켜고 열지 않았다. 자동화 창에서는 들을 수도 없다).

## 4. 개봉의 순서와 돈

### 4.1 한 개 열기

`T` 는 장면이 뜬 때부터의 시간이다(보통 길이, 괄호는 짧게 보기).

| 차례 | 때 | 일어나는 일 | 장부 | 근거 |
|---|---|---|---|---|
| 1 | 누름 | `press()`: 처리 중이거나 상태 기계가 막으면 아무 일도 없다. 누름 소리(A-051). 낼 값이 50 USDT 이상이거나 10개 이상이면 확인창을 띄우고 멈춘다 | 변화 없음 | 코드: `BoxScreen.tsx:47-48,160-165` |
| 2 | 누름(또는 확인창의 주 단추) | `open()`: 동기 잠금, 주 단추가 busy, 상태 `PURCHASE_PROCESSING`, 거래 번호를 정함 | 변화 없음 | 코드: `BoxScreen.tsx:140-147` |
| 3 | 기다림(길이는 재지 않았다) | `executeOpening()`: 잔액 검사 → 씨앗 준비(await) → 번호 계산(await) → 결과를 정함 → 계정이 그대로인지 다시 봄 | 결과는 여기서 정해진다. 돈은 아직 그대로 | 코드: `lib/opening.ts:44-65` |
| 4 | 같은 틱(await 없음) | 차감, 보관함에 적기, USDT 결과의 입금, 터짐 게이지, 무료 횟수, 거래 기록 둘. 어디서든 실패하면 지갑과 보관함을 통째로 되돌린다 | 돈과 보관함이 여기서 확정된다 | 코드: `lib/opening.ts:66-116` |
| 5 | T = 0 | 상태 `OUTCOME_COMMITTED` → `OPENING`. 장면이 뜬다(`Opening`, `key` 는 회차) | 변화 없음 | 코드: `BoxScreen.tsx:150-152,319` |
| 6 | T = 0 ~ 520 (220) | anticipation: A-010, A-011, A-012. 위쪽 잔액은 열기 전 값을 보여 준다 | 변화 없음 | 코드: `Opening.tsx:109,211` |
| 7 | T = 520 (220) | impact: A-013 ~ A-016, A-052, A-054 | 변화 없음 | 코드: `Opening.tsx:131,141` |
| 8 | T = 670 (330) | exit: A-017 | 변화 없음 | 코드: `Opening.tsx:132` |
| 9 | T = 840 (450) | reveal: 상자가 빠지고 A-019 ~ A-023, A-053. `onRevealed()` 가 기록장에 "봤음"을 남기고 상태를 `REVEALED` → `SETTLING` → `SETTLED` 로 보낸다. 잔액이 지금 값으로 바뀐다 | 변화 없음(기록장만) | 코드: `Opening.tsx:133,143-148`, `BoxScreen.tsx:168` |
| 10 | 9 와 같은 때 | 자동으로 USDT 로 받기: 그 계정이 직접 켰고, 상품이고, 낸 값의 20배 미만이고, 다시 보는 결과가 아닐 때 `settleTake()` 를 한 번 부른다 | 돈이 한 번 더 움직인다(상품이 받은 상태가 되고 잔액이 는다) | 코드: `Opening.tsx:167-173`, `openingFlow.ts:77-80` |
| 11 | T = 1,190 (800) | ready: 닫기 단추, 아래 단추가 눌림(A-025) | 변화 없음 | 코드: `Opening.tsx:150` |
| 12 | 사람이 누름 | "USDT로 받기" → 받기 확인창 → `settleTake()`. 또는 "보관함에 두기", "한 번 더"(1 로 돌아감) | 받기를 확인하면 돈이 움직인다 | 코드: `Opening.tsx:154-165,195-199` |

판정:

- 구매(결과, 차감, 보관함)는 연출이 시작되기 전에 끝난다. 연출의 어떤 타이머도 그 값을 바꾸지 않는다(코드). 세 분석이 같은 말을 한다(AG 4.1절, CX-S-012, CL-R 6절).
- 다만 10번은 "결과가 화면에 보였다"는 화면 상태에 걸려 있다. 연출 중에 떠나면 자동 받기는 돌지 않고 상품은 보관 중으로 남는다. 돌아와 다시 보는 결과에서는 자동 받기가 돌지 않는다(`Opening.tsx:170` 의 `recovered` 조건). 이 순서는 원본의 동작이므로 그대로 지킨다. 움직임의 길이를 바꾸면 자동 받기가 도는 때도 같이 움직인다는 점을 총괄이 알아야 한다.
- 9번의 "봤음" 기록도 화면 상태에 걸려 있다. 그 전에 떠나면 다음에 박스 화면이 "결과 보기"를 준다(CX-S-018, `BoxScreen.tsx:113-138`).

### 4.2 여러 개 열기

| 차례 | 때 | 일어나는 일 | 장부 | 근거 |
|---|---|---|---|---|
| 1 ~ 4 | 한 개와 같다 | 같은 함수가 개수만큼 한 번에 정하고 한 번에 적는다(1 ~ 100개) | 전부 여기서 확정 | 코드: `lib/opening.ts:45,58-63,90` |
| 5 | T = 0 | `Reveal` 이 뜬다. A-026, A-027 | 변화 없음 | 코드: `BoxScreen.tsx:320` |
| 6 | T = 520, 670 | impact, exit(길이 고정, 소리 없음) | 변화 없음 | 코드: `Reveal.tsx:35,86-87` |
| 7 | T = 840 | `done`: 결과가 뜬다. A-028, A-029. `onRevealed()`("봤음"). 포커스 이동 | 변화 없음 | 코드: `Reveal.tsx:74-77,88` |
| 8 | T = 1,190 | `armed`: 닫기와 Esc 가 듣는다 | 변화 없음 | 코드: `Reveal.tsx:78` |
| 9 | 사람이 누름 | 받기 선택 시트(방금 나온 것만 미리 고름) → 확인창 → 받기 | 확인하면 돈이 움직인다 | 전달: CL-U-099, CL-U-175 |

여러 개 열기에는 자동 받기가 없다(실행: `Reveal.tsx` 에 `autoTake` 가 주석 한 줄뿐).

### 4.3 MISSION 5절의 사례를 코드로 읽으면

전부 코드에서 읽은 것이다. 화면에서 해 본 것은 없다(다른 분석의 화면 확인은 `INTERACTION_MATRIX` 의 몫이다).

| 사례 | 코드가 하는 일 | 근거 |
|---|---|---|
| 연출 중에 다시 누름 | 박스 화면의 열기 막대는 장면에 가려 있다. "한 번 더"는 ready 전에는 disabled 이고 묶음 전체가 눌리지 않는다. 상태 기계도 `READY` 와 `SETTLED` 에서만 구매를 받는다 | `Opening.tsx:194`, `opening.css:106`, `openingFlow.ts:130` |
| 빠른 연속 누름 | 동기 잠금(`opening.current`)이 같은 틱의 둘째 호출을 버린다. 구매 함수도 한 번만 도는 약속을 돌려준다 | `BoxScreen.tsx:77,142-143`, `lib/opening.ts:39-42` |
| 건너뛰기 | "결과 바로 보기" 또는 Esc. reveal 로 바로 간다. 남은 타이머는 단계가 맞지 않아 아무 일도 하지 않는다. 여는 소리와 진동은 나지 않고 결과 소리는 난다 | `Opening.tsx:122,124,131-133,141,146` |
| 연출 중에 떠남, 뒤로 가기, 새로 고침 | 뒤로 가기를 따로 다루지 않는다(화면이 바뀐다). 결과는 이미 보관함에 있다. 돌아오면 "결과 보기"가 뜨고, 다시 보는 결과는 연출, 결과 소리, 자동 받기 없이 바로 나온다 | `BoxScreen.tsx:113-138`, `Opening.tsx:96,128,146,170` |
| 탭이 뒤로 감 | 따로 다루지 않는다. 단계는 `setTimeout` 이라 브라우저가 늦추면 늦게 넘어가고, 돌아오면 그때의 단계가 보인다(짐작: 브라우저의 타이머 늦춤은 재지 않았다) | 실행: `Opening.tsx`, `Reveal.tsx` 에 `visibilitychange` 없음 |
| 소리 재생 실패 | 장치를 못 만들면 `null` 을 받고 조용히 넘어간다. 화면은 그대로 간다 | `openingSound.ts:17-22` |
| 느린 기기 | 단계는 벽시계다. 프레임이 밀려도 결과는 같은 때에 뜬다. 배너의 공은 프레임 사이를 64ms 로 막아 한 번에 건너뛰지 않는다 | 2절, `HeroBanner.tsx:118` |
| 줄이기 | 결과부터. 350ms 잠금은 그대로. 결과 소리는 난다 | `Opening.tsx:129`, `Reveal.tsx:84` |
| 연출 중에 설정을 바꿈 | 이 장면의 길이는 뜰 때 정한 그대로다. 소리는 바로 따른다(`soundRef`) | `Opening.tsx:95,115` |

## 5. 닿는 소스의 타이머와 프레임(움직임과 얽힌 것만)

| 자리 | 무엇 | 정리 |
|---|---|---|
| `Opening.tsx:130-135` | 단계 타이머 셋 | 장면이 사라질 때 지운다 |
| `Opening.tsx:150-151` | 350ms 잠금 | 단계가 바뀌거나 사라질 때 지운다 |
| `Reveal.tsx:78-79`, `:85-90` | 350ms 잠금, 단계 타이머 셋 | 지운다 |
| `HeroBanner.tsx:72-80` | 단계 시계 | 멈출 때 지운다 |
| `HeroBanner.tsx:116-126` | 공의 프레임 | 멈출 때 취소한다 |
| `toast.tsx:21-22` | 2.4초 | 글이 바뀌면 지운다 |
| `lib/useModal.ts:41-43,70` | 창이 열린 다음 프레임에 포커스를 다시 준다 | 닫힐 때 취소한다 |

지갑의 10초 조회(`WalletScreen.tsx:58`), 지갑과 보관함의 60초 시계(`WalletScreen.tsx:64`, `InventoryScreen.tsx:67`)는 움직임이 아니라 자료 갱신이라 `STATE_TRANSITIONS` 에 넘긴다.

## 6. AGY 의 화면 측정과 견줌

실행: `motion-result.json` 을 통합자가 다시 읽었다. 표본 간격은 100ms 이고, 시계는 단추를 누른 호출이 돌아온 뒤에 시작한다(`harness/agy/capture-opening-motion.mjs:58-67`). 그래서 장면이 뜬 때보다 조금 늦게 0 이 찍힌다.

| 실행 | 단계가 처음 잡힌 표본(실제 ms) | 코드의 때 | 맞는가 |
|---|---|---|---|
| `open-1-normal` | impact 530, exit 645, reveal 868, ready 1,173 | 520, 670, 840, 1,190 | 시계가 25 ~ 100ms 늦게 시작했다고 보면 넷 다 맞는다. 표본 간격보다 잘게는 말할 수 없다 |
| `open-1-reduced` | 첫 표본부터 reveal, ready 314 | 0, 350 | 맞는다 |
| `open-5-normal` | impact 502, exit 701, 결과 803 | 520, 670, 840 | 맞는다(같은 까닭). 350ms 잠금은 재지 않았다 |
| `open-5-reduced` | 첫 표본부터 결과 | 0 | 맞는다 |

프레임 78장은 모두 있다(실행: 파일 수 26, 13, 26, 13). 네 실행 모두 박스는 `gaming-playstation`, 색조는 `below` 다.

## 7. 어긋난 곳과 판정

| id | 무엇이 어긋났나 | 판정과 근거 |
|---|---|---|
| D-A1 | `ARCHITECTURE.md`: framer-motion 을 파일 24개에서 씀. Claude: 닿는 화면은 CSS 뿐 | 1절. 실행과 코드: 24개가 맞고, 닿는 것은 움직임 없는 래퍼 하나다. 문장을 바꿔야 한다 |
| D-A2 | AGY 의 표는 "완료 콜백" 칸에 `focus() 부여`, `impact 타이머 점화`, `onRevealed() 실행`, `open 전환` 등을 적었다 | 코드: 닿는 소스에 움직임의 끝을 듣는 코드가 없다. 그 일들은 타이머나 장면이 뜰 때의 효과가 한다. 포커스는 창이 열릴 때 `useModal` 이 준다(`useModal.ts:39,41`). 움직임의 길이를 바꿔도 그 일들의 때는 바뀌지 않고, 타이머 값을 바꾸면 바뀐다 |
| D-A3 | AG-A-006: 상자가 내려앉을 때 누름 소리 | 코드: 누름 소리는 박스 화면의 `press()` 에서, 구매가 시작되기 전에 난다(`BoxScreen.tsx:163`). 같은 보고서의 AG-TL-001 은 맞게 적었다 |
| D-A4 | AG-TL-007: 자동 받기는 ready(T = 1,190)에서 | 코드: reveal(T = 840)에서 돈다. 효과가 `revealed` 에 걸려 있다(`Opening.tsx:169-173`) |
| D-A5 | `agy-b` 9절: 개봉 연출이 "프레임 단위로 완벽히 일치". 6.2절의 실측 길이(약 500, 100, 200ms) | 실행: 100ms 간격의 표본으로는 그렇게 말할 수 없다. 6.2절의 "실측 길이"는 표본 수를 100 으로 곱한 값이다. 6절의 표처럼 "코드의 때와 100ms 안에서 어긋나지 않는다"까지가 측정이 말해 주는 것이다 |
| D-A6 | AG-TL-011: 여러 개 열기는 단일 개봉과 동일한 상자 연출 | 코드: 키프레임은 같지만 길이가 520, 150, 170 으로 고정이고("짧게 보기"를 읽지 않는다), 여는 소리, 결과 소리, 진동, 색조에 따른 빛이 없다(`Reveal.tsx:35`, 실행: 그 파일에 `sound` 없음) |
| D-A7 | AGY 의 "축소 모션" 칸은 규칙마다 "미적용", "정지", "없음"으로 제각각이고, 전역 규칙을 적지 않았다 | 코드: 2절의 세 층. `globals.css:517` 이 빠져 있었다 |
| D-A8 | Claude(CL-U-050): 배너는 화면 밖이면 멈춘다. `hero.css:117` 의 주석도 "화면 밖이거나 움직임 줄이기" | 코드: 화면 밖에서 멈추는 것은 단계 시계와 공의 프레임뿐이다. `data-still` 은 줄이기일 때만 붙는다(`HeroBanner.tsx:136`). 그래서 화면 밖에서도 CSS 의 끝없는 움직임(A-038, A-042, A-043, A-044)은 계속 돈다. 주석과 구현이 다르다. 원본이 그러하니 그대로 둔다 |
| D-A9 | AGY 의 움직임 표(닿는 것 29개)에 없는 닿는 움직임 | 통합자가 코드에서 찾아 더했다: A-006, A-007, A-020, A-024, A-026, A-028, A-032, A-033, A-037, 그리고 A-034 와 A-035 의 곁움직임. 열한 곳 |
| D-A10 | AG-TL-002: 누른 뒤 0 ~ 50ms 에 커밋, "분산 락" | 짐작으로 분류한다. 아무도 재지 않았다. 코드가 말하는 것은 순서(장면이 뜨기 전에 끝난다)뿐이다. 잠금은 계정마다의 장부 잠금이다(`lib/opening.ts:41`) |
| D-A11 | AG-A-033 `swipe-nudge` 를 옛 것이라고 표시하지 않았다 | 실행: `swipe-hint` 클래스를 쓰는 파일이 `components`, `app` 어디에도 없다. 닿지 않는 쪽(A-125)에 넣었다 |
| D-A12 | AG-A-027(박 반사)을 닿는 것으로 적었다 | 실행: 배포된 홈에는 그 요소가 없다(A-044). 코드에는 있고 배포 화면에는 없다. 둘 다 적는다 |

## 8. 닿지 않는 옛 움직임

동등성 판단에서 뺀다. 지우지 않는다(`ARCHITECTURE.md` 4절).

### 8.1 framer-motion 을 쓰는 파일 23개

실행: `import` 줄과 `motion` 요소 수를 통합자가 셌다. 경로는 `web/components/` 아래.

| id | 파일과 줄 | 가져오는 것 | motion 요소 | Codex 번호 |
|---|---|---|---|---|
| A-101 | `about/AboutSections.tsx:5` | useInView, useReducedMotion | 0 | CX-U-100 |
| A-102 | `about/GlobalLiveFeed.tsx:4` | AnimatePresence, motion | 7 | CX-U-101 |
| A-103 | `about/ImpactStats.tsx:4` | motion | 3 | CX-U-102 |
| A-104 | `about/LineupShowcase.tsx:4` | motion | 1 | CX-U-104 |
| A-105 | `about/TrustScenes.tsx:4` | motion, useInView | 10 | CX-U-105 |
| A-106 | `about/VaultHero.tsx:4` | AnimatePresence, motion | 5 | CX-U-106 |
| A-107 | `auth/HeaderAuthControl.tsx:4` | AnimatePresence, motion | 2 | CX-U-110 |
| A-108 | `box/DetailModal.tsx:5` | AnimatePresence, motion | 2 | CX-U-118 |
| A-109 | `fairness/VisualVerifyModal.tsx:5` | AnimatePresence, motion | 2 | CX-U-130 |
| A-110 | `home/DailyFreeBox.tsx:4` | AnimatePresence, motion, useReducedMotion | 5 | CX-U-133 |
| A-111 | `home/HotBoxes.tsx:4` | motion | 1 | CX-U-136 |
| A-112 | `inventory/DeliveryModal.tsx:5` | AnimatePresence, motion | 2 | CX-U-145 |
| A-113 | `inventory/HotBoxes.tsx:4` | motion | 1 | CX-U-146 |
| A-114 | `inventory/SellConfirmModal.tsx:5` | AnimatePresence, motion | 2 | CX-U-147 |
| A-115 | `inventory/TrackingModal.tsx:5` | AnimatePresence, motion | 2 | CX-U-149 |
| A-116 | `unboxing/AutoplaySettingsModal.tsx:5` | AnimatePresence, motion | 2 | CX-U-159 |
| A-117 | `unboxing/BulkOpenModal.tsx:4` | AnimatePresence, animate, motion, useReducedMotion | 3 | CX-U-160 |
| A-118 | `unboxing/MegaWinFX.tsx:4` | motion | 3 | CX-U-161 |
| A-119 | `unboxing/UnboxingRoulette.tsx:4` | AnimatePresence, animate, motion, useReducedMotion, useMotionTemplate, useMotionValue | 6 | CX-U-162 |
| A-120 | `unboxing/UpgradeFX.tsx:3` | motion | 4 | CX-U-163 |
| A-121 | `unboxing/VaultGateFX.tsx:4` | motion | 8 | CX-U-164 |
| A-122 | `wallet/DepositModal.tsx:5` | AnimatePresence, motion | 2 | CX-U-165 |
| A-123 | `wallet/WithdrawalModal.tsx:5` | AnimatePresence, motion | 2 | CX-U-168 |

### 8.2 CSS 와 그 밖

| id | 무엇 | 자리 | 왜 닿지 않나 | 출처 |
|---|---|---|---|---|
| A-124 | 옛 뚜껑 상자 `v-breathe`, `v-lid`, `.v-lidbox`, `.v-lidbox-lid` | `ui.css:303-304,308-309` | 그 클래스를 쓰는 소스가 없다 | CL 6.3절. 실행: `v-lidbox` 찾기 0건 |
| A-125 | `globals.css` 의 키프레임 13: `sheen-sweep`, `ticker-scroll`, `spark-sweep`, `spark-flicker`, `coin-fall`, `confetti-fall`, `bulk-float`, `marker-shake`, `fx-glitch-shift`, `fx-crack-in`, `swipe-nudge`, `hot-pulse`, `rim-spin` | `globals.css:189-510` | 쓰는 클래스가 닿지 않는 파일에만 있거나(`DailyFreeBox`, `LiveTicker`, `MegaWinFX`, `UnboxingRoulette`, `UpgradeFX`) 아무 데도 없다 | AG-A-030 ~ AG-A-035, AG-TOK-087. 실행: 닿는 파일 150개에서 그 클래스 0건 |
| A-126 | `design.css` 의 키프레임 9: `home-review-marquee`, `proof-live-value`, `proof-live-dot`, `proof-feed-row`, `home-copy-rise`, `iso-sweep`, `iso-float`, `iso-rays`, `iso-dust` | `design.css:51-58,324,385-421` | 쓰는 곳이 `home/ProofFeed.tsx`, `about/IsometricStage.tsx` 등 닿지 않는 파일 | CL 6.3절(`design.css` 는 전부 옛 화면용). 실행: 키프레임 이름과 사용 파일 |
| A-127 | Tailwind 설정의 키프레임 5: `ticker`, `grain`, `shutter`, `flicker`, `scanline`, 곡선 `cine` | `tailwind.config.ts:70,77-123` | 닿는 파일에 `animate-` 클래스가 없다 | AG-TOK-102. 실행: 0건 |
| A-128 | 받는 방법 고르기 줄의 전환 `.v-op-choice` | `opening.css:61-64` | 그 클래스를 쓰는 소스가 없다(`v-op-choices` 감싸개만 쓰인다) | CL 6.3절, AG-I(`agy-a` 5.2절 13번) |
| A-129 | 옛 소리 `lib/audio.ts` | `web/lib/audio.ts:54` | 가져오는 다섯 파일이 모두 닿지 않는다 | CX-U-172 |
| A-130 | 숫자 세어 올리기(프레임으로 도는 것) | `about/AboutSections.tsx:47`, `about/TrustScenes.tsx:30`, `home/JackpotPoolBadge.tsx:31`, `unboxing/BulkOpenModal.tsx:51` | 닿지 않는 파일 | CX-I-1001 ~ 1004, CX-I-1032 ~ 1035, CX-I-1533 ~ 1536, CX-I-1695(전달) |
| A-131 | 개발용 갤러리에서만 도는 것: 결과가 하나일 때의 `Reveal`, 표본 시트와 확인창의 A-002, A-003 | `components/dev/Gallery.tsx:128-139` | 프로덕션 빌드에서는 없는 주소 | CL-U-158 ~ 161, CX-U-014 |
| A-132 | `canvas-confetti` | `package.json` 의 의존성 | 가져오는 파일이 없다 | `ARCHITECTURE.md` 2절, CL 6.2절. 실행: 0건 |

## 9. 번호 대응이 빠짐없는지

| 분석의 번호 | 이 문서의 자리 |
|---|---|
| AG-A-001 ~ 005 | A-001 ~ A-005 |
| AG-A-006 ~ 018 | A-010 ~ A-019, A-021 ~ A-023(차례대로. AG-A-015 는 A-019, AG-A-016 은 A-021, AG-A-017 은 A-022, AG-A-018 은 A-023) |
| AG-A-019 | A-029 |
| AG-A-020, 021, 022 | A-034, A-035, A-036 |
| AG-A-023, 024, 025 | A-040, A-041, A-042 |
| AG-A-026, 027, 028, 029 | A-038, A-044, A-043, A-039 |
| AG-A-030 ~ 035 | A-125 |
| AG-TL-001 ~ 007 | 4.1절(차례 1 ~ 11), A-025, A-051 ~ A-054 |
| AG-TL-010 ~ 013 | 4.2절, A-027, A-029, A-030 |
| AG-TOK-100, 101 | 2절 토큰 |
| AG-TOK-102 | A-127 |
| AG-TOK-103, 104 | 3.2절 머리, A-025 |
| `agy-b` 6절의 네 실행 | 6절 |
| CX-I-005 | A-031, A-039 |
| CX-I-009, CX-I-011 | 3.2절, 4.1절 |
| CX-I-012 | A-027, 4.2절 |
| CX-I-032 | D-A2(포커스는 `useModal`) |
| CX-I-036 | 5절 |
| CX-S-012, CX-S-018 | 4.1절의 판정 |
| CX-F-063, CX-F-070 | A-008 |
| CX-F-067 | A-039 |
| CL-U-037 | A-001 |
| CL-U-044, CL-U-082 | A-010 ~ A-017 |
| CL-U-050, CL-U-052 | A-031, A-039, D-A8 |
| CL-U-080, CL-U-081, CL-U-085, CL-U-090 | 3.2절 머리, A-021, A-023, A-025 |
| CL-U-092, CL-U-093, CL-U-098 | A-027, A-030, A-029 |
| CL-U-202 | A-004 |
| CL 5.1절의 "움직임" 줄 | A-002, A-003, A-024 |

옮기지 않은 것과 까닭:

| 번호 | 까닭 |
|---|---|
| AG-DIF-001 ~ 010(`agy-a` 9절, 화면 비교에서 고정할 것 열 가지) | 움직임의 목록이 아니라 비교 도구의 조건이다. `harness/README.md` 의 몫이다. 이 문서와 닿는 것은 AG-DIF-003(프레임과 타이머) 하나이고, 2절과 6절이 그 근거가 된다 |
| CX-I 의 나머지(2,200여 개) | 이벤트와 생명주기의 색인이다. `INTERACTION_MATRIX` 의 몫이고, 움직임과 얽힌 것만 위에 옮겼다 |
| CL-I, CL-S(`claude-b`) | 통합자의 범위 밖이다. 한 줄(`claude-b-interactions.md:512`)만 1절의 근거로 썼다 |

## 10. 수

| 무엇 | 수 |
|---|---|
| 닿는 움직임(A-001 ~ A-008, A-010 ~ A-044) | 43 |
| 그 가운데 기본 부품 | 8 |
| 그 가운데 한 개 열기 | 16 (A-010 ~ A-025) |
| 그 가운데 여러 개 열기 | 5 (A-026 ~ A-030) |
| 그 가운데 홈 배너 | 14 (A-031 ~ A-044) |
| 소리와 진동(A-051 ~ A-054) | 4 |
| 닿는 것 전체 | 47 |
| 닿지 않는 옛 것(A-101 ~ A-132) | 32 (framer-motion 파일 23, 그 밖 9) |
| AGY 가 적은 것 가운데 닿는 것 | 29 (AG-A-001 ~ 029). 그 가운데 하나(AG-A-027)는 배포 화면에 없다 |
| 통합자가 코드에서 새로 찾은 닿는 움직임 | 9 (A-006, A-007, A-020, A-024, A-026, A-028, A-032, A-033, A-037), 곁움직임 2 (A-034, A-035 안) |
| 어긋난 곳 | 12 (D-A1 ~ D-A12), 모두 코드나 실행으로 판정 |
| 코드로 확인됨 | 47 가운데 47 |
| 화면으로 확인됨(통합자가 프레임을 열어 본 것) | 3 (A-010, A-028, A-029). AGY 의 단계 기록으로 때가 맞는 것은 A-025, A-027 과 4절의 단계 넷 |
| 화면 확인 불가 | 색조가 above, high, top 인 결과의 빛과 소리(A-016 의 0.6 과 0.95, A-018, A-022, A-023, A-053), 소리와 진동 전부, 홈 배너의 한 바퀴(A-031 ~ A-043), 자리 표시(A-001), 토스트(A-004), 줄이기에서의 부드러운 스크롤(A-008) |
| 배포 화면에서 도달 불가 | 1 (A-044) |

## 11. 정하지 못한 것

- 구매 함수가 끝나기까지의 실제 시간(누름에서 장면이 뜰 때까지). 아무도 재지 않았다.
- 홈 배너의 한 바퀴가 화면에서 코드의 시간표대로 도는지. 프레임 기록이 없다.
- 배너의 상자에서 별 감기와 뚜껑 들썩임이 실제로 보이는지(A-034). 코드의 선택자 범위로만 읽었다.
- 낸 값보다 늘어난 결과(above, high, top)의 빛, 사진 밀기, 테 빛, 결과 소리. 측정 넷이 모두 below 였다. 동등성 비교에서는 결과를 고정해 이 색조를 일부러 만들어야 한다(총괄이 정할 일: 장부를 심는 방법).
- "짧게 보기"를 켠 한 개 열기의 실제 때(220, 110, 120). 화면 측정이 없다.
- 움직임 줄이기에서 `scrollIntoView({ behavior: "smooth" })` 가 부드럽게 가는지 바로 가는지. 전역 규칙의 `scroll-behavior: auto` 가 스크립트의 명시 값에 듣는지는 브라우저마다 다를 수 있다.
- 탭이 뒤에 있을 때 브라우저가 타이머를 얼마나 늦추는지, 그때 결과 소리가 어떻게 나는지.
- 개봉 장면 위에서 충전 시트(껍데기 쪽 DOM)가 열릴 때 A-024 가 아니라 A-002, A-003 이 도는지. 선택자로는 그렇게 읽힌다(충전 시트는 `.v-op` 의 자손이 아니다). 화면에서 보지 못했다.
