# 기존 아키텍처 진단 (Phase 0, 총괄)

2026-10-12, 기준 커밋 `63445c7`. 아래는 총괄이 직접 명령으로 확인한 것이다. 세 분석(Codex, Antigravity, Claude)의 세부는 `analysis/` 에 있다.

## 1. 결론

이 저장소는 이미 전부 React 다. 옮겨야 할 HTML, CSS, 바닐라 JS 화면이 없다.

- `.html` 파일: 0개 (`git ls-files | grep -i "\.html$"` 결과 없음)
- 라우트: 18개, 전부 `web/app/[locale]/**/page.tsx` 의 React 컴포넌트
- 소스: tsx 137개, ts 178개, css 13개, mjs 34개(도구)

그래서 이 임무의 "마이그레이션"은 다음 셋으로 바뀐다.

1. 지금 있는 화면, 인터랙션, 애니메이션, 자료, 계산의 전수조사(인벤토리)
2. 원본(배포본)과 결과(브랜치 빌드)를 브라우저에서 대조하는 도구와 기준값
3. 조사에서 근거가 나온 곳만 고치기(직접 DOM 조작이 React 와 부딪치는 자리, 동작에 영향을 주는 React 결함), 고칠 때마다 대조

프레임워크를 바꾸지 않는다. Tailwind 로 기계적으로 옮기지 않는다. 라이브러리를 더하지 않는다.

## 2. 스택 (package.json 에서 읽음)

| 층 | 쓰는 것 |
|---|---|
| 프레임워크 | Next.js 14 app router, 정적 내보내기(`output: "export"`), basePath `/voila-test-aresjoo`, `trailingSlash: true` |
| 화면 | React 18, TypeScript 5.7 |
| 상태 | zustand 5 (persist, localStorage). 서버 장부 없음 |
| 움직임 | 지금 닿는 화면의 움직임은 전부 CSS(`opening.css`, `hero.css`, `ui.css` 의 키프레임과 transition)와 `setTimeout` 단계다. framer-motion 11 을 가져오는 파일은 24개지만 라우트에서 닿는 것은 `MotionPreferences.tsx` 하나(움직임 없는 `MotionConfig` 래퍼)이고 나머지 23개는 닿지 않는 옛 화면이다. canvas-confetti 는 의존성에만 있고 쓰는 곳이 없다(통합 검증: `motion/ANIMATION_INVENTORY.md` 1절) |
| 다국어 | next-intl 3 (`ko`, `en`, `zh`) |
| 스타일 | 새 화면은 `web/app/ui.css` 의 `v-` 클래스와 토큰(`tokens.css`), 옛 화면은 Tailwind 와 스킨 CSS(`nfx-skin.css`, `shop-skin.css`, `gpt-skin.css` 등). CSS 13개 2,457줄 |
| 검사 | `tsx --test`(단위 398개), 디자인 린트(`scripts/design-lint`), Playwright 촬영 스크립트(`scripts/capture`) |

## 3. 라우트와 그리는 것

| 라우트 | 최상위 컴포넌트 |
|---|---|
| `/` | `BoxList` |
| `box/[slug]` | `BoxScreen` |
| `inventory` | `InventoryScreen` |
| `wallet`, `wallet/withdraw` | `WalletScreen`, `WithdrawScreen` |
| `wins`, `reviews`, `verify` | `WinsScreen`, `ReviewsScreen`, `VerifyScreen` |
| `account` | `AccountScreen` |
| `guide` | 페이지 안에서 `ScreenHead`, `Card`, `GuideFees` |
| `legal`, `legal/[doc]` | `LegalCenterScreen`, `LegalDocScreen` |
| `about`, `community`, `community/board`, `fairness`, `profile` | `MovedScreen` (옮겨졌다는 안내) |
| `dev/gallery` | `Gallery` (개발용) |

전부 `AppShell` 안에 그린다. 정적 내보내기 산출물의 HTML 은 1,092개다(언어 화면 1,089, 루트 1, 404 둘. 통합자가 기준 산출물을 직접 셈. 처음에 적은 1,091 은 `index.html` 만 센 수였다).

## 4. 지금 흐름에서 닿지 않는 옛 코드

옛 홈과 옛 개봉 연출(`components/home` 의 `NetflixHome`, `CommerceHome`, `HallOfFame`, `ProofFeed`, `LiveTicker`, `components/unboxing` 의 `UnboxingRoulette` 등)은 소스에 남아 있지만 어느 라우트도 그리지 않는다. Codex 의 import 그래프 분석으로는 라우트 실행 경로에서 닿지 않는 TS 파일이 97개다(`analysis/codex-a-routes-events-state.md`). 이번에는 지우지 않는다. "소스에는 있으나 닿지 않음"으로 분류해 인벤토리에 적고, 동등성 판단에서 뺀다.

## 5. 직접 DOM 을 만지는 파일 (검토 대상 10개)

`web/app/layout.tsx`, `web/app/page.tsx`, `components/auth/AvatarSettings.tsx`, `components/box/BoxScreen.tsx`, `components/community/ReviewFormModal.tsx`, `components/fairness/VisualVerifier.tsx`, `components/flow/ReviewSheet.tsx`, `components/home/heroBall.ts`, `components/verify/VerifyScreen.tsx`, `lib/fingerprint.ts`.

파일마다 무엇을 왜 만지는지, React 생명주기와 부딪치는지는 Codex 분석 6절과 Phase 2 명세에서 판단한다. 부딪치지 않는 것(파일 내려받기용 `a` 만들기, canvas 그리기, 루트 레이아웃의 인라인 스크립트)은 그대로 둔다.

## 6. 배포

`.github/workflows/deploy-pages.yml`: `main` 과 `feat/**` 에 `web/**` 가 밀리면 `GITHUB_PAGES=true npm run build` 뒤 `web/out` 을 Pages 로 올린다. 저장소 변수 `NEXT_PUBLIC_AUTH_API_BASE`, `NEXT_PUBLIC_API_BASE` 는 비어 있다(`gh variable list` 결과 없음). `web/app/api` 폴더는 없다. 그래서 배포본은 서버 없이 브라우저 안의 시험 계정과 시험 장부로 돈다.

같은 출처(`shinwon446-eng.github.io`)에 운영 사이트(`/gacha-sim/`)가 있어 저장소를 나눠 쓴다. `web/lib/labSite.ts` 가 이 사이트의 저장 키에 `voila-test-aresjoo:` 접두어를 붙인다.

## 7. 기준선

| 검사 | 결과 | 기록 |
|---|---|---|
| `npx tsc --noEmit -p .` | 오류 0 | `logs/baseline-tsc.log` |
| `npm test` | 398개, 통과 397, 건너뜀 1, 실패 0 | `logs/baseline-test.log` |
| `npm run lint:design` | 위반 0 | `logs/baseline-lint.log` |
| 배포와 같은 빌드(`GITHUB_PAGES=true next build`) | 성공, HTML 1,092개 | `logs/build-before.log`, 산출물 `C:\Users\hyun1\dev\VOILA-audit-before\web\out` |

## 8. 원본에 이미 있는 결함의 다룸

분석에서 원본 자체의 결함이 나온다(예: 출금 취소 때 차감되지 않은 금액의 환불, 계정 화면의 비밀번호 변경과 탈퇴가 끝까지 가지 않음, 서버 없는 배포의 배송 신청). 이것은 "원본과 다름"이 아니라 "원본이 그러함"이다. `PARITY_ISSUES.md` 에 "원본의 기존 결함"으로 따로 적고, 동등성 판정과 섞지 않는다. 고칠지는 파운더가 정한다(고치면 원본과 동작이 달라지기 때문이다).
