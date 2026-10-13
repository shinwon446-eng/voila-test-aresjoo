# VOILA 무손실 React 동등성 감사: 공통 지침

모든 참여자(Claude, Codex, Antigravity, 보조 에이전트)가 먼저 읽는 문서다. 파운더가 준 지시문 전문은 `migration-audit/MISSION.md` 에 있다.

## 0. 사실 (2026-10-12 총괄이 직접 확인)

- 기준 커밋: `63445c7` (`voila-redesign`, `origin/main` 과 같다). 배포 사이트가 이 커밋의 빌드다.
- 원본(참조) 사이트: https://shinwon446-eng.github.io/voila-test-aresjoo/ko/ (영어 `/en/`, 중국어 `/zh/`)
- 작업 브랜치: `migration-audit` (기준 커밋에서 갈라냄)
- 스택: Next.js 14(app router, 정적 내보내기), React 18, TypeScript, zustand(persist, localStorage), framer-motion, next-intl, Tailwind(옛 화면)와 `web/app/ui.css` 의 `v-` 클래스(새 화면).
- 저장소에 `.html` 파일은 없다. 이미 전부 React 다. 그래서 이 일은 "HTML 을 React 로 옮기기"가 아니라 **전수조사, 원본 대조, 필요한 곳만 고치기**다.
- 배포: `.github/workflows/deploy-pages.yml`. `GITHUB_PAGES=true npm run build` 가 `web/out` 을 만들고 basePath 는 `/voila-test-aresjoo`, `trailingSlash: true`. 저장소 변수 `NEXT_PUBLIC_AUTH_API_BASE`, `NEXT_PUBLIC_API_BASE` 는 비어 있다(서버 없음, 브라우저 안의 시험 장부).
- 라우트 18개(`web/app/[locale]/...`): `/`, `about`, `account`, `box/[slug]`, `community`, `community/board`, `dev/gallery`, `fairness`, `guide`, `inventory`, `legal`, `legal/[doc]`, `profile`, `reviews`, `verify`, `wallet`, `wallet/withdraw`, `wins`. 언어 `ko`, `en`, `zh`.
- 직접 DOM 을 만지는 파일(검토 대상): `web/app/layout.tsx`, `web/app/page.tsx`, `components/auth/AvatarSettings.tsx`, `components/box/BoxScreen.tsx`, `components/community/ReviewFormModal.tsx`, `components/fairness/VisualVerifier.tsx`, `components/flow/ReviewSheet.tsx`, `components/home/heroBall.ts`, `components/verify/VerifyScreen.tsx`, `lib/fingerprint.ts`.
- 모델: Codex `gpt-6.1-sol` high, Antigravity `gemini-3.8-flash-high` high. 둘 다 호출되는 것을 확인했다.

## 1. 기준이 부딪칠 때

1. 배포 화면: 보이는 것과 쓰는 느낌의 기준
2. 기준 커밋의 소스: 구현과 돈 계산의 기준
3. 최신 설계 문서(`DESIGN.md`, `flow/MELT_SPEC.md`, `opening/STATE.md`): 의도의 기준
4. 옛 문서와 백로그(`UI_INVENTORY.md`, `STATE.md`, `RELEASE-READINESS.md` 등): 참고. 루트의 `UI_INVENTORY.md` 는 개편 전 것이라 지금 화면의 기준이 아니다.

어긋나면 하나를 고르지 말고 둘을 다 적는다.

## 2. 하지 않는 것

- 없는 기능을 만들지 않는다. 계획만 있는 것을 구현하지 않는다.
- 디자인을 고치지 않는다. 더 낫게 보인다는 이유로 바꾸지 않는다.
- 확률, 기대값, 지급 계산을 바꾸지 않는다.
- 당첨 기록을 새로 지어내지 않는다. 지금 있는 예시 자료는 "예시"라고 분류한다.
- 후기는 예외다(2026-10-12 밤 파운더: "그냥 후기 만들고 진행해라, 어차피 PMF 느낌을 보는 것"). 박스마다 샘플 후기 80~400건을 만드는 생성기를 `feat/sample-reviews` 브랜치(작업 폴더 `VOILA-audit-reviews`)에서 따로 만들어, Phase 1 분석이 끝난 뒤 이 브랜치에 "의도된 차이"로 합친다. 동등성 비교에서 후기 자리(박스 상세의 후기, `/reviews`, 박스 카드의 별점과 후기 수)는 원본과 달라지는 것이 맞고, 그 밖의 자리는 달라지면 안 된다. 스위치 `NEXT_PUBLIC_SAMPLE_REVIEWS=off` 로 끈다.
- 실제 돈, 출금, 배송을 일으키지 않는다(지금은 전부 브라우저 안의 시험 장부다).
- 운영 사이트(`/gacha-sim/`)와 그 저장값을 건드리지 않는다.
- `next build` 를 `web/` 에서 돌리지 않는다(개발 서버가 떠 있다). 빌드는 총괄이 따로 만든 폴더에서 한다.
- 실행하지 않은 것을 통과라고 적지 않는다. 확인하지 않은 것을 확인했다고 적지 않는다.

## 3. 번호

| 종류 | 형식 | 파일 |
|---|---|---|
| 라우트 | `R-001` | `ROUTE_INVENTORY.md` |
| 화면 요소(숨은 것 포함) | `U-001` | `UI_INVENTORY.md` |
| 인터랙션 | `I-001` | `INTERACTION_MATRIX.md` |
| 상태 전이 | `S-001` | `STATE_TRANSITIONS.md` |
| 기능(돈, 데이터 포함) | `F-001` | `FEATURE_PARITY.md` |
| 애니메이션 | `A-001` | `motion/ANIMATION_INVENTORY.md` |
| 발견 사항 | `P0-01`, `P1-01`, `P2-01`, `P3-01` | `PARITY_ISSUES.md` |

항목마다: 원본 근거(파일과 줄), 지금 구현, 테스트, 스크린샷, 상태(확인됨, 어긋남, 확인 불가, 도달 불가)를 적는다.

## 4. 증거의 말

적을 때 네 가지를 구분한다: **화면에서 본 것**, **코드에서 읽은 것**, **직접 실행한 것**(명령과 결과), **짐작**.

## 5. 글 규칙

한국어. 긴 줄표와 가운뎃점 문자와 느낌표를 쓰지 않는다. 표는 짧은 사실에만 쓴다.

## 6. 등급

- P0: 돈, 자료의 온전함, 보안에 치명적이거나 서비스가 서지 않는 것
- P1: 주요 기능이 깨짐, 계산이 틀림, 핵심 흐름 실패, 핵심 화면 누락, 큰 시각 차이
- P2: 일부 상태의 시각 차이, 작은 인터랙션 오류
- P3: 원본과 상관없는 개선 제안(이번에 고치지 않고 백로그로)
