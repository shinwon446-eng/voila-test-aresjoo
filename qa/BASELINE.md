# 기준선 (2026-10-10, 개편 시작 시점 `fa47f31`)

| 항목 | 결과 |
|---|---|
| `npm test` (tsx 테스트) | 293건 통과, 실패 0 |
| `npx tsc --noEmit` | 오류 없음 |
| `npm run build` (dev 서버를 내리고 실행) | 통과. 정적 페이지 68개 |
| Node / npm | v24.20.0 / 11.19.0 |
| dev 서버 | 포트 3002, `http://localhost:3002/ko` |

## 라우트 (빌드 출력)
세 언어(ko, en, zh)마다 같다.

| 경로 | 첫 로드 JS |
|---|---|
| `/` (언어 고르는 리다이렉트) | 87.7 kB |
| `/[locale]` 메인 | 263 kB |
| `/[locale]/about` | 195 kB |
| `/[locale]/community` | 197 kB |
| `/[locale]/community/board` | 191 kB |
| `/[locale]/fairness` | 199 kB |
| `/[locale]/inventory` | 224 kB |
| `/[locale]/legal` | 176 kB |
| `/[locale]/legal/[doc]` (문서 13종) | 176 kB |
| `/[locale]/profile` | 205 kB |
| `/_not-found` | 88.4 kB |

별도의 `not-found.tsx`, `error.tsx`, `loading.tsx`는 없다. `app/api`도 없다.

## 크기
컴포넌트 78개, 합쳐서 10,410줄. 가장 큰 것은 `UnboxingRoulette.tsx`(767줄), `AboutSections.tsx`(692줄), `WithdrawTab.tsx`(487줄).
