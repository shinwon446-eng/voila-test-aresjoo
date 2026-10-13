# 기능 동등성 표 (FEATURE_PARITY)

2026-10-12, 통합 단계. 기준 커밋 `63445c7`, 브랜치 `migration-audit`. 세 참여자(Codex, Antigravity, Claude)의 독립 분석을 합쳐, 데이터와 돈 계산을 포함한 기능마다 "바뀌면 안 되는 것"을 적었다. `web/` 을 고치지 않았고, 커밋하지 않았고, `next build` 를 돌리지 않았다.

## 0. 읽는 법

- 번호는 `F-001` 부터 `F-095` 까지다.
- 파일 경로는 따로 적지 않으면 `web/` 아래다. 예: `lib/opening.ts:47` 은 `web/lib/opening.ts` 의 47줄.
- 지금 결과는 기준 커밋과 같은 코드다. 그래서 이 표의 "지금 상태"는 원본의 상태이고, 다음 사이클에서 결과가 달라지면 이 표의 "바뀌면 안 되는 것"과 견준다.
- 원본에 이미 있는 결함은 `PARITY_ISSUES.md` A부의 `E-` 번호로 가리킨다.

### 0.1 지금 상태의 말

| 말 | 뜻 |
|---|---|
| 구현 완료 | 닿는 화면에서 끝까지 돈다. 소스와 단위 시험 수준의 판단이고, 실제 운영 준비가 됐다는 뜻이 아니다 |
| 부분 구현 | 일부 갈래만 돈다. 무엇이 안 되는지 적는다 |
| 화면만 있음 | 화면이나 부품은 있으나 실제 자료가 흐르지 않는다 |
| 서버 미연결 | 서버가 있어야 되는 일이고 지금 배포에는 서버가 없다. 브라우저 안의 흉내로 도는 경우 그렇게 적는다 |
| 계획만 있음 | 문서에만 있다 |
| 폐기됨 | 뒤의 결정으로 없앴다 |
| 지금 닿지 않음 | 소스에는 있으나 어느 라우트도 쓰지 않는다 |

### 0.2 참여자의 번호와 일치의 말

참여자의 번호를 적는 법은 `PARITY_ISSUES.md` 0.3절과 같다. 줄이면: `CX-F-`, `CX-R-`, `CX-S-` 는 Codex 의 두 파일에 다 있어 뒤에 `(A)`(전반부 `codex-a-routes-events-state.md`) 또는 `(B)`(후반부 `codex-b-data-money.md`)를 붙인다. `CX-D-`, `CX-M-`, `CX-P-`, `CX-Z-`, `CX-A-`, `CX-T-`, `CX-B-`, `CX-X-` 는 후반부에만, `CX-P1-`, `CX-P2-`, `CX-U-`, `CX-I-` 는 전반부에만 있다. `CL-` 는 Claude, `AG-` 는 Antigravity 다.

| 일치 칸의 말 | 뜻 |
|---|---|
| 일치 | 둘 이상의 참여자가 같은 값이나 같은 동작을 적었다 |
| 한 곳만 | 한 참여자만 다뤘다. 통합 단계에서 다시 확인했으면 검증 칸에 적는다 |
| 어긋남 | 참여자끼리 다르게 적었다. 정한 것은 `PARITY_ISSUES.md` A.3 의 `D-` 번호에 있다 |

### 0.3 검증 칸의 말

| 말 | 뜻 |
|---|---|
| 통합 실행 V-1 에서 V-6 | 통합 단계에서 내가 돌린 것. 명령은 8절 |
| Codex 실행 | Codex 가 계측 스크립트를 돌렸다(후반부 `CX-X-001` 에서 `CX-X-003`, 전반부 `CX-F-006(A)` 에서 `CX-F-012(A)`) |
| Claude 실행 NN:id | Claude 가 배포 사이트를 Playwright 로 눌렀다. `harness/claude-b/NN-*.mjs` 의 시나리오, 결과는 `harness/claude-b/results/` |
| AGY 실행 | Antigravity 가 배포 사이트를 쟀다. `harness/agy/*.mjs`, 결과는 `harness/agy/*-result.json` |
| 코드에서 읽음 | 실행 없이 소스만 읽었다 |

---

## 1. 상품과 박스

| 번호 | 기능 | 원본 근거 | 바뀌면 안 되는 것 | 지금 상태 | 덮는 시험 | 참여자의 번호 | 일치 | 검증 |
|---|---|---|---|---|---|---|---|---|
| F-001 | 카탈로그의 범위 | `lib/catalogSpecs.ts:7, 8, 24`, `lib/catalog2/build.ts:25`, `lib/products.ts:336, 342, 345` | 전체 박스 334, 홈 박스 320, 옛 박스 14. 구성 행 32,916(홈 32,000). 고유 상품 21,007(홈 20,207). 앱이 읽는 원천은 `generated.json` 하나 | 구현 완료 | `tests/parityGolden.test.ts`(개수와 상수), `tests/products.test.ts`, `tests/physical.test.ts` | `CX-D-001`, `CX-Z-007`, `CX-F-012(A)`, `CL-R` 8절(정적 화면 1,090 과 `404.html`) | 일치 | Codex 실행, 통합 실행 V-1(334, 320, 32,916, 21,007 같음), V-3 |
| F-002 | 박스 id(slug)와 박스의 순서 | `lib/products.ts:345`, `app/[locale]/box/[slug]/page.tsx:8` | 전체 순서의 SHA-256 `81bb2c22deda3d392f256c0f70e2d04c1c32b6c596c4ce6134e431c6a47d2749`, 홈 순서의 SHA-256 `0f3ed123b383daf4d1d0660e0a9de37d30cbf565a1cbd8909e8fdb8ff46249d0`(기준값 파일의 `boxOrder`, `homeBoxOrder`). 박스 주소는 전체 334개로 만든다(언어 셋을 곱해 1,002) | 구현 완료 | `tests/parityGolden.test.ts`(sha256 전체 비교) | `CX-D-003`, `CX-T-002-a`, `CX-F-012(A)`, `CL-R-003` | 일치 | V-3 |
| F-003 | 박스 이름과 상품 이름, 세 언어 | `lib/useProductText.ts:14, 15, 18` | 박스의 `title`, `titleEn`, `titleZh` 와 상품의 `name`, `nameEn`, `nameZh` 에 빈 것 0개. 이름과 사진 경로를 묶은 SHA-256 `1be190bcb6e3a0230778d6ec15250a2a446bb2de6c71e535d75d034527b3c62e`. 화면은 문구 파일에 키가 있으면 그것을, 없으면 카탈로그의 그 언어 이름을 쓴다 | 구현 완료. 번역의 뜻이 맞는지는 아무도 판정하지 않았다 | `tests/parityGolden.test.ts`, `tests/i18n.test.ts`(옛 문구의 상품 문자열) | `CX-D-002`, `CX-D-003`, `AG-U-010`, `AG-U-012` | 일치 | Codex 실행, 통합 실행 V-1(빈 이름 0), V-3. 문구 파일 쪽 이름 변경은 이 해시가 잡지 못한다(`CX-D-002`) |
| F-004 | 카테고리 | `lib/products.ts`, `components/box/BoxList.tsx:56` | 전체: car, watch, bag, jewelry, fashion, mobile, computer, gaming, audio, camera, home, pokemon, toy, outdoor, sport, beauty 각 20, tech 4, dollar 3, jackpot 3, luxury 3, collect 1. 홈에는 앞의 16개만(각 20) | 구현 완료 | `tests/parityGolden.test.ts`(counts.byCategory) | `CX-D-001`, `CL-I` 3.1절 | 일치 | Codex 실행, V-3 |
| F-005 | 박스 가격 | `lib/products.ts` | 가격별 박스 수(전체, 홈): 1은 3과 0, 3은 2와 0, 5는 2와 0, 20은 38과 35, 30은 1과 0, 50은 117과 116, 100은 101과 99, 250은 51과 51, 500은 19와 19. 단위는 USDT | 구현 완료 | `tests/parityGolden.test.ts`(counts.byPrice, perBox) | `CX-D-002` | 한 곳만 | Codex 실행, V-3 |
| F-006 | 구성품 목록 | `lib/catalog2/build.ts:25-27`, `lib/products.ts:324` | 새 박스 320개는 각각 상품 100개. 옛 박스 14개의 구성 행은 합쳐 916. 박스의 자기 상품과 카테고리 공통 상품을 합친다 | 구현 완료 | `tests/physical.test.ts:18`, `tests/parityGolden.test.ts`(perBox) | `CX-D-001`, `CX-D-004`, `CX-D-B001` 에서 `CX-D-B334` | 한 곳만 | Codex 실행, V-3 |
| F-007 | 상품가와 종류 | `lib/products.ts:39, 120` | 종류와 값을 묶은 SHA-256 `5d6af693c4f89e6d5455014207b8518f0d558d7e5a029779e0106c6ae0b9e4d8`. 고유 상품 기준 실물 20,933, 현금 58, 디지털 16. 구성 행 기준 실물 32,726, 현금 167, 디지털 23. 상품가 범위는 전체 0.05 에서 5,800,000, 홈 5 에서 5,800,000 | 구현 완료 | `tests/parityGolden.test.ts` | `CX-D-001`, `CX-D-002`, `CX-D-003` | 어긋남 아님(세는 단위가 다름, D-11) | Codex 실행, V-3 |
| F-008 | 이미지 경로 | `lib/productImages.ts:24, 105, 114, 145` | 사진 경로 문자열은 F-003 의 해시에 들어 있다. 사진 있는 고유 상품 8,509(홈 7,851), 사진 있는 구성 행 13,094 | 부분 구현(고유 상품 21,007 가운데 사진 있는 것 8,509) | 경로 문자열은 `tests/parityGolden.test.ts`. 배포 주소에서 파일이 실제로 뜨는지 보는 시험은 없음(`CX-T-003-n`) | `CX-D-001`, `CX-T-003-n`, `AGB-결론` 2.4절, `CL-U` 9절(대표 사진 없는 박스 21개) | 일치 | Codex 실행, 통합 실행 V-1(8,509), V-3. AGY 실행: 찍은 180개 기록에서 실패한 요청 0건 |
| F-009 | 상품별 확률 | `lib/products.ts:116, 208, 269, 324` | 주 지문(박스를 slug 오름차순, 박스 안은 `dropTable` 순서, 한 줄이 `[slug, price, itemId, dropRate]` 의 JSON 과 줄바꿈): 전체 32,916줄 2,201,788바이트 `a82f8bd995be27226825ea4e467e124f8a6e77d264f7d26e6fa40bcf5ce2925d`, 홈 32,000줄 2,160,497바이트 `8bce14b1305f9bc1be28ec08ba9f3e44b704e67610517df6eed0aa842df9c9b0`. 기준값 형식(`slug\|price\|id\|dropRate`)의 `tableOrder` 는 `67fdb233f46f139d7357f53e2337a5386d27368bc13efec4e136ac9c7b425ed6`. 334개 박스 전부 `sum(round(dropRate * 10000))` 이 1,000,000 | 구현 완료 | `tests/parityGolden.test.ts`(perBox, sha256, 합계 100%), `tests/fairness.test.ts:54, 70`, `tests/products.test.ts:9` | `CX-D-003`, `CX-D-004`, `CX-Z-007`, `CX-T-002-a`, `CX-T-002-b` | 한 곳만(Codex). 통합이 다시 계산 | Codex 실행, 통합 실행 V-1(두 SHA-256 과 줄 수, 바이트 수 같음. 합이 100% 가 아닌 박스 0), V-3 |
| F-010 | 확률표의 순서(추첨 구간의 순서) | `lib/products.ts:238, 314, 379`, `lib/fairness.ts:92, 108` | `box.items` 는 확률 오름차순, 같으면 상품가 내림차순. `dropTable` 은 그 복사본을 상품가 내림차순으로 안정 정렬(같은 값은 원래 순서). 이 순서가 구간을 정한다. `drawOrder` 의 SHA-256 `3cb5c4cb79815b3f9674c19b1858d031028e609c146e4276fdbbb9685ba785d1` | 구현 완료 | `tests/parityGolden.test.ts` | `CX-D-004`, `CX-D-003` | 한 곳만 | Codex 실행, V-3 |
| F-011 | 확률의 표기 | `lib/products.ts:447` | `formatRate` 는 `Number(r.toFixed(4))`. 소수 넷째 자리까지, 끝의 0 은 뺀다. 0.0001% 를 0 으로 숨기지 않는다 | 구현 완료 | `tests/products.test.ts`, `tests/fairness.test.ts`(공개 확률 4자리) | `CX-F-002(B)` | 한 곳만 | 코드에서 읽음 |
| F-012 | 화면의 확률과 실제 추첨이 같은 원천 | `components/box/BoxScreen.tsx:88-99, 248-266, 288`, `lib/opening.ts:57, 61`, `components/box/Opening.tsx:190`, `components/box/Reveal.tsx:189, 207` | 구간 요약, 상품별 표, 방금 나온 결과의 "나올 확률", 추첨이 전부 `dropTable(box)` 와 그 상품의 `dropRate` 를 읽는다 | 구현 완료. 복구한 결과와 후기의 검증 링크는 지금 표를 읽는다(E-31) | 따로 묶어 보는 시험 없음(`CX-T-003-k`) | `CX-F-001(B)` 의 a 에서 i, `CX-Z-008`, `CL-I` 3.2절 | 일치 | 코드에서 읽음. Claude 실행 02:b1(확률표와 상품 시트) |
| F-013 | 박스 요약의 수치 | `components/box/BoxScreen.tsx:88-99, 249-257`, `lib/tiers.ts:48`, `lib/products.ts:367, 371, 400`, `lib/openingFlow.ts:25` | 구간 합은 소수 넷째 자리로 맞춘 뒤 표기. 실물 확률은 현금과 `wave-` 항목을 뺀 합. "낸 값보다 적게 받을 확률"은 받는 값(95%)이 박스 가격보다 작은 항목의 합. 가장 흔한 결과는 `dropRate` 가 가장 큰 항목(같으면 앞의 것). 기대 가치 비율은 소수 첫째 자리 | 구현 완료 | `tests/tiers.test.ts`, `tests/physical.test.ts:59, 67, 73` | `CX-F-001(B)` 의 a 에서 d, `CX-F-002(B)` | 한 곳만 | 코드에서 읽음. Claude 실행 02:b1, 02:b3(화면의 값) |
| F-014 | 수량 선택 | `lib/opening.ts:45`, `lib/autoplay.ts:8`, `components/box/BoxScreen.tsx` | 고르는 값 1, 5, 10, 50, 100. 구매는 안전한 정수 1 에서 100 만 받는다 | 구현 완료 | `tests/opening.test.ts:57`(수량 검사), `tests/autoplay.test.ts` | `CX-F-003(B)` 5항, `CX-S-014(A)`, `CL-S-025` 에서 `CL-S-027`, `DECISION_LOG.md:15`(다섯 알약 유지) | 일치 | Claude 실행 04:o5, 04:o6(5, 10, 50, 100개) |
| F-015 | 큰 금액의 확인창 | `components/box/BoxScreen.tsx:160-164` | 결제 50 USDT 이상이거나 10개 이상이면 확인창을 띄운다. 취소하면 차감 없음 | 구현 완료 | `tests/opening.test.ts:48`(취소 전 차감 없음), `tests/openingFlow.test.ts` | `CX-S-013(A)`, `CL-S-024`, `AG-TL-001`, `CLA-놀람-08` | 일치 | Claude 실행 04:o5, 04:o3 |
| F-016 | 새 박스의 실물 전용 구성 규칙 | `lib/products.ts:263-310` | 가격의 0.1배보다 싼 상품을 받지 않는다. 평균 상품가가 가격의 약 99%, USDT 로 받는 기대값은 약 94.05%. 결과를 앞의 당첨이나 쓴 돈에 따라 바꾸는 규칙 없음 | 구현 완료 | `tests/physical.test.ts:18, 29, 59, 67, 73` | `CX-F-004(B)`, `CX-T-002-c`, `CX-B-006-f` | 한 곳만 | 코드에서 읽음. 확률표 자체는 F-009 의 지문이 고정 |
| F-017 | 홈에 나오는 박스의 규칙 | `lib/products.ts:336-345`, `components/box/BoxList.tsx:56` | 새 박스가 100개 이상이면 옛 14개는 홈과 검색에서만 내려간다. 주소, 보관 상품, 검증에서는 전체 334개를 쓴다 | 구현 완료 | `tests/parityGolden.test.ts`(homeBoxOrder) | `CX-D-001`, `CL-R` 8절(주소로만 닿는 박스 1개, 후기 화면으로만 닿는 박스 13개), `CLA-놀람-04` | 일치 | Codex 실행, V-3 |

## 2. 개봉과 보상

| 번호 | 기능 | 원본 근거 | 바뀌면 안 되는 것 | 지금 상태 | 덮는 시험 | 참여자의 번호 | 일치 | 검증 |
|---|---|---|---|---|---|---|---|---|
| F-018 | 시드 만들기 | `lib/fairness.ts:17, 32, 41`, `stores/fairStore.ts:6, 40` | 서버 시드는 난수 64바이트의 hex 128자, 클라이언트 시드는 난수 16바이트의 hex 32자. hex 를 바이트로 되돌리지 않고 문자열의 UTF-8 을 키로 쓴다 | 서버 미연결(이름은 서버 시드지만 브라우저가 만들고 저장한다) | `tests/fairness.test.ts:24`(시드 길이) | `CX-F-003(B)` 1항, `CX-Z-005`, `CX-B-002-f`, `CL-S-089` | 일치 | 코드에서 읽음 |
| F-019 | 약속 해시 | `lib/fairness.ts:45, 50` | `SHA256(UTF8(serverSeed))`. 예: 시드 `codex-b-server-seed-2026-10-12` 의 해시는 `f362c9b0155b62b1515fbdd993ec7fd46c3b5b05dafea6f51402788eef0b968d`, 기준값의 시드 `parity-audit-server-seed-0001` 의 해시는 `24bb857459d501933bf8e8e3081536e482a8360e894a3ed4e8929e0b1c2759ff` | 구현 완료 | `tests/fairness.test.ts:20`(표준 벡터), `tests/parityGolden.test.ts` | `CX-F-003(B)` 2항 | 한 곳만 | Codex 실행, 통합 실행 V-1(같은 해시) |
| F-020 | 추첨 번호의 식 | `lib/fairness.ts:52, 67` | `HMAC-SHA256(키 UTF8(serverSeed), 글 clientSeed + ":" + nonce)` 의 앞 8 hex 를 정수로 읽어 1,000,000 으로 나눈 나머지. 범위 0 에서 999,999 | 구현 완료 | `tests/fairness.test.ts:20, 39`, `tests/parityGolden.test.ts`(박스 셋, 회차 0 에서 49) | `CX-F-003(B)` 2항, `CX-T-002-d`, `CL-S-091` | 일치 | Codex 실행, 통합 실행 V-1(6절의 10회 표가 같음), V-3. Claude 실행 07:v1 |
| F-021 | 번호를 상품에 대응시키기 | `lib/fairness.ts:92, 109` | 항목의 칸 수는 `round(dropRate * 10000)`. 0 부터 순서대로 닫힌 구간을 만들고 `roll <= to` 인 첫 항목. 칸 해상도, 최소 1칸, 합계를 검사한다 | 구현 완료 | `tests/fairness.test.ts:54, 70, 82` | `CX-F-003(B)` 3항 | 한 곳만 | Codex 실행, V-1, V-3 |
| F-022 | 회차(nonce) | `stores/fairStore.ts:51, 55, 56, 63` | `takeNonce` 는 지금 값을 돌려주고 1 올린다. 시드를 바꾸면 0 으로. 저장 키는 기기 공용(`gachaflix.fair`)이고 계정을 바꿔도 바뀌지 않는다 | 구현 완료 | `tests/opening.test.ts`, `tests/fairness.test.ts` | `CX-F-003(B)` 4항, `CX-F-023(A)`, `CX-P-001-e` | 일치 | Codex 실행(두 탭에서 회차 0 과 1, 끝 회차 2) |
| F-023 | 독립 추첨, 여러 개 열기 | `lib/opening.ts:58, 59, 81` | 먼저 개수만큼 이어진 회차를 잡고, 번호는 한꺼번에 계산하고, 지급과 게이지는 회차 순서대로. 결과끼리 영향을 주지 않는다 | 구현 완료 | `tests/opening.test.ts:20, 68`, `tests/parityGolden.test.ts` | `CX-F-003(B)` 5항, `opening/STATE.md:57`, `AG-TL-010`, `CL-S-025` | 일치 | Codex 실행(10개 구매가 표와 같음), Claude 실행 04:o5 |
| F-024 | 보장 규칙(pity)과 근접 실패 | `lib/opening.ts`(없음), 옛 `lib/engine.ts:5, 34, 84` | 지금의 구매 경로에는 앞의 결과나 쓴 돈에 따라 결과를 바꾸는 규칙이 없다. 옛 엔진의 pity 10회, 잭팟 가중 5배는 쓰이지 않는다. 되살리지 않는다 | 폐기됨(옛 엔진은 지금 닿지 않음) | `tests/engine.test.ts`(닿지 않는 옛 엔진만) | `CX-F-004(B)`, `CX-B-004-b`, `CX-F-219(A)` | 한 곳만 | 코드에서 읽음 |
| F-025 | 터짐 게이지(옛 박스 14개만) | `lib/burst.ts:10, 28, 34, 41`, `lib/opening.ts:79-88, 107` | 항목 id `wave-burst`. 시작 금액 `r2(price * 10)`, 한 번에 쌓이는 금액 `r2(price * 0.1)`, 확률 6,250칸(0.625%). 쌓임은 출처 비율로 나눠 소수 넷째 자리. 지급은 `floor(total * 100 + 1e-6) / 100`. 무료 회차는 쌓지 않지만 터지면 받는다. 새 박스에는 터짐도 쌓임도 없다 | 구현 완료(홈에서 내려간 14개에만 적용) | `tests/burst.test.ts:14, 29, 75, 91, 98, 124`, `tests/parityGolden.test.ts`(burst) | `CX-F-004(B)`, `CX-M-005`(게이지 예), `CX-B-004-e`, `CL-S-049` | 일치 | Codex 실행(pot 1.0049 와 2.005, 박스값 10 에서 지급 103). Claude 는 터짐의 금액을 실행하지 못했다고 적음 |
| F-026 | 무료 열기(가입 혜택) | `stores/walletStore.ts:19, 152-154`, `lib/products.ts:362`, `lib/opening.ts:47` | 대상 박스 `pokemon-charizard`, 2회, 계정 장부마다 한 번. 무료를 먼저 쓰고 남은 개수만 `r2(price * (count - free))` 를 낸다. 무료도 같은 표와 같은 회차 계산 | 구현 완료 | `tests/freeOpens.test.ts:25, 36, 52, 80` | `CX-F-004(B)`, `CX-M-003`, `CL-S-003`, `CL-S-028`, `CLA-놀람-07` | 일치 | Codex 실행(무료 2, 유료 8, 비용 400). Claude 실행 04:o8 |
| F-027 | 무료와 유료를 섞은 묶음의 출처 | `lib/opening.ts:73, 85, 93` | 무료로 나온 상품도 그 묶음의 결제 비율을 출처로 갖는다. 전부 무료인 구매만 crypto 100%. 예: crypto 125, card 275 로 10개(무료 2)를 열면 열 개 전부 crypto 0.3125, card 0.6875 | 구현 완료 | 없음(`CX-T-003-e`) | `CX-F-003(B)`, `CX-Z-006`, `CX-T-003-e` | 한 곳만 | Codex 실행. 통합은 코드의 세 줄을 읽음 |
| F-028 | 현금 결과의 지급 | `lib/opening.ts:99-106` | 현금 결과는 구매 안에서 100% 로 팔아 출처대로 입금하고 `sellback` 거래 한 건을 남긴다 | 구현 완료 | `tests/opening.test.ts`, `tests/openingFlow.test.ts`, `tests/parityGolden.test.ts`(cash 100%) | `CX-M-001-h`, `CX-S-019(A)`, `CL-S-021` | 일치 | Claude 실행 04:o1 |
| F-029 | 결과를 먼저 적는다(보관함 반영) | `lib/opening.ts:90-98` | 연출 전에 결과 전부를 보관함에 적는다. 기록마다 시드 원문, 회차, 번호, 표 버전, 그때의 확률표 전체(`id` 와 `dropRate`), 출처 비율, 그때의 1회 가격, 무료 여부, 개봉 번호 | 구현 완료 | `tests/opening.test.ts:20, 37` | `CX-P-002`, `CX-B-002-a`, `AG-TL-002`, `CL-S-023` | 일치 | Claude 실행 04:o4(연출 중 새로 고침과 뒤로 가기), AGY 실행(연출 타임라인) |
| F-030 | 구매 실패의 되돌림 | `lib/opening.ts:66-70, 111-115` | 차감부터 끝까지 사이에 기다림이 없다. 어느 단계든 예외가 나면 지갑과 보관함을 통째로 앞 상태로 되돌린다. 잡아 둔 회차는 되돌리지 않는다 | 부분 구현. 저장소가 쓰기를 조용히 버릴 때는 이 되돌림이 돌지 않는다(E-02). 쓰기가 여러 번으로 나뉜다(E-32) | `tests/openingFlow.test.ts`, `tests/burst.test.ts:98`, `tests/freeOpens.test.ts:80` | `CX-F-003(B)` 6항, `CX-P-003`, `CL-S-034`, `CL-S` 11절 | 어긋남(D-03) | Codex 실행, Claude 실행 04:o10 |
| F-031 | 개봉의 재시도와 중복 요청 막기 | `lib/opening.ts:39-42, 65`, `lib/ledgerLock.ts:47-52`, `components/box/BoxScreen.tsx:142-143` | 같은 실행 함수를 다시 부르면 같은 Promise. 화면에는 동기 잠금. 같은 계정의 다른 구매는 Web Locks 로 한 번에 하나, 잠금 안에서 저장소를 다시 읽는다. 계정이 바뀌면 차감 전에 멈춘다 | 구현 완료(Web Locks 가 없는 브라우저에서는 잠금 없이 돈다, N-09) | `tests/opening.test.ts:68` | `CX-F-003(B)` 6항, `CX-P-004`, `CX-T-003-c`, `CL-S-036`, `CL-S-048`, `AG-TL-001` | 일치 | Codex 실행(두 탭 동시 구매: 보관함 2개, 잔액 900, 회차 2). Claude 실행 04(연타와 더블클릭), 10:m2 |
| F-032 | 저장소에 써지는지 먼저 보기 | `lib/ledgerLock.ts:26-38` | 돈이 움직이는 일 앞에서 작은 시험 쓰기를 하고 읽어 본다. 안 되면 `LedgerUnavailable` | 부분 구현(작은 시험 쓰기만 본다. 한도에서 큰 쓰기가 버려지는 것은 막지 못한다, E-02) | `tests/takeFault.test.ts`(받기 쪽) | `CX-F-045(A)`, `CX-P-003`, `CL-S-034`, `CL-S-064` | 어긋남(D-03) | Codex 실행(704번째), Claude 실행 04:o10, 05:t6 |
| F-033 | 개봉의 거래 기록 | `lib/opening.ts:109` | `open` 거래 한 건: 금액은 비용의 음수, 참고 글은 박스와 개수와 무료 수와 개봉 번호, 이용 기준 몫 `rolloverUsdt` | 구현 완료. 지갑 화면에는 보이지 않는다(E-06) | `tests/opening.test.ts`, `tests/rollover.test.ts` | `CX-M-004`, `CX-P1-07`, `CLB-F-02` | 일치 | 통합 실행 V-1(거래에 계정 표시가 없음), Claude 실행 06:w2 |
| F-034 | 못 본 결과 다시 보기 | `stores/openingJournal.ts:20, 22, 29, 49`, `components/box/BoxScreen.tsx:111-138` | 봤음 표시는 최근 400개, 못 본 결과를 다시 보여 주는 기한은 7일. 값은 그때 보관함에 적힌 값 | 구현 완료 | `tests/openingFlow.test.ts`(복구) | `CX-P-002`, `CX-F-028(A)`, `CX-S-018(A)`, `CL-S-039` 에서 `CL-S-044` | 일치 | Claude 실행 04:o4, 10:m3. 7일 기한은 아무도 실행하지 않음 |
| F-035 | USDT로 받기의 금액 | `lib/types.ts:133`, `lib/takeBatch.ts:154, 182`, `stores/inventoryStore.ts:78, 89` | 상품마다 `+(valueUsdt * 0.95).toFixed(2)` 를 구한 뒤 더한다. 합계에 한 번 곱하지 않는다. 0.3 은 0.28, 0.1 두 개는 0.20(0.19 가 아니다) | 구현 완료 | `tests/takeBatch.test.ts:87`, `tests/parityGolden.test.ts`(take 20개) | `CX-M-001-e`, `CX-M-005`, `CX-Z-006`, `CL-S-051`, `CL-S-061` | 일치 | Codex 실행, 통합 실행 V-1(6절의 표), V-3. Claude 실행 05:t1 |
| F-036 | 받기의 출처 환급 | `lib/funding.ts:63, 73` | `toCrypto = r2(refund * 비율.crypto)`, `toCard = r2(refund - toCrypto)`. 0.01 을 반씩 나누면 crypto 0.01, card 0. 95 를 0.3 대 0.7 로 나누면 28.5 와 66.5 | 구현 완료 | `tests/funding.test.ts:38, 56`, `tests/walletSplit.test.ts`, `tests/parityGolden.test.ts`(refund 9개) | `CX-M-001-f`, `CX-M-005`, `CX-Z-006`, `opening/STATE.md:46`(0.01 반올림은 파운더가 정할 것) | 한 곳만 | Codex 실행, 통합 실행 V-1, V-3 |
| F-037 | 받기의 순서와 중복 지급 막기 | `lib/claim.ts:18-27`, `lib/openingSettle.ts:21`, `lib/takeBatch.ts:301-327`, `stores/inventoryStore.ts:81, 88` | 보관함에서 먼저 팔고, 그 결과대로 잔액을 올리고, `itemIds` 가 붙은 `sellback` 거래를 남긴다. 보관 중이고 환급이 양수인 것만. 같은 id 는 한 번만. 같은 탭은 줄 세우기, 탭 사이는 Web Locks | 구현 완료 | `tests/takeBatch.test.ts:32, 75`, `tests/claim.test.ts:19` | `CX-M-002`, `CX-T-002-j`, `CL-S-051`, `CL-S-061`, `CL-S-062` | 일치 | Claude 실행 05:t1, 09(확정 단추 연타에서 한 번만 지급) |
| F-038 | 받기의 판정(받음, 일부, 실패, 확인 필요) | `lib/takeBatch.ts:87, 131, 262, 356-376`, `lib/openingSettle.ts:12` | 실행 뒤 저장된 보관함과 지갑 내역을 다시 읽어 판정한다. 받은 상태이고 그 상품의 입금 내역이 있을 때만 받음. 잔액의 변화가 새 거래와 0.005 안에서 맞는지 본다. 표시가 남은 상품은 스스로 다시 지급하지 않는다 | 구현 완료 | `tests/takeFault.test.ts:111, 169, 198, 277`, `tests/takeBatch.test.ts:234` | `CX-M-002`, `CL-S-063` 에서 `CL-S-070`, `flow/MELT_SPEC.md:120` | 일치 | Claude 실행 05:t5, 05:t6(저장을 막은 경우). 일부와 알 수 없음은 배포 빌드에서 만들 수 없어 실행하지 못함 |
| F-039 | 자동으로 USDT 로 받기 | `lib/openingFlow.ts:25-31, 77-80`, `stores/settingsStore.ts:44` | 계정마다 켜는 설정. 현금 결과는 대상이 아니다. 받는 금액이 박스 가격의 20배 이상이면 자동으로 넘기지 않는다 | 구현 완료 | `tests/openingFlow.test.ts`(자동 받기) | `CX-B-006-l`, `CX-S-022(A)`, `CL-S-055`, `AG-TL-007` | 일치 | Claude 실행 04:o9. 20배 제외는 실행하지 못했다고 적음 |
| F-040 | 여럿 결과에서 미리 고르기 | `components/box/Reveal.tsx:135-140` | 방금 나온 것을 미리 고른 채 선택 시트를 연다. 상품가가 박스 가격의 20배 이상이면 미리 고르지 않는다. 자동 받기(F-039)와 기준이 다르다(여기는 상품가, 거기는 받는 금액) | 구현 완료 | `tests/takeBatch.test.ts`(quote) | `CX-B-006-l`, `CX-B-005-c`, `CX-S-023(A)`, `CL-S-059` | 일치 | Claude 실행 04:o5 |
| F-041 | 잔액이 모자란 자리 | `lib/takeBatch.ts:200`, `components/box/Reveal.tsx:143-147` | 보관 상품을 전부 받아 부족액을 채울 수 있을 때만 주 단추가 USDT로 받기. 못 채우면 주 단추는 충전 | 구현 완료 | `tests/takeBatch.test.ts`(shortfall) | `CX-B-005-d`, `CX-B-006-j`, `CL-S-029` 에서 `CL-S-031`, `CL-S-056` | 일치 | Claude 실행 04:o7, 10:m1 |
| F-042 | 배송 신청 | `lib/claim.ts:33-47`, `components/flow/ShipSheet.tsx:25-76`, `lib/browserAccount.ts:339` | 신청마다 고유 키로 겹쳐 접수되지 않게 한다. 응답의 상품과 지갑 값이 맞을 때만 반영한다 | 서버 미연결(브라우저 계정에서는 언제나 실패, E-05). 응답 검사에 빠진 것이 있다(E-40) | 화면 흐름 시험 없음(`CX-F-086(A)`). 주소 규칙은 `tests/shipping.test.ts`, `tests/inventory.test.ts` | `CX-P1-05`, `CX-A-002-d`, `CX-S-026(A)`, `CLB-F-07`, `CL-S-072`, `CL-S-073` | 어긋남(등급만, D-06) | 통합 실행 V-2(`unavailable`), Codex 실행. Claude 는 입력 검증까지 실행 05:t2 |
| F-043 | 배송 취소와 배송비 | `lib/claim.ts:53-74`, `stores/inventoryStore.ts:126`, `lib/shipping.ts:7, 11, 19` | 준비 상태이고 출고 전인 것만. 배송비는 낸 출처대로 돌려준다. 원래 배송비의 출처를 모르면 취소하지 않는다. 배송비는 무료 행사라 13개 나라 전부 0 | 부분 구현(취소 식은 돌지만 새 신청이 안 되므로 미리 있던 기록에서만 닿는다) | `tests/shipping-cancellation.test.ts:7`, `tests/claim.test.ts:19` | `CX-M-001-n`, `CX-M-001-o`, `CX-B-002-d`, `CX-S-027(A)`, `CL-S-074` | 일치 | Claude 실행 12:x2(심은 배송 기록의 취소) |
| F-044 | 개봉 연출의 시간 | `lib/openingFlow.ts:62-71` | 기대 520ms, 충격 150ms, 퇴장 170ms, 결과 840ms, 단추가 눌리기 시작하는 때는 그 350ms 뒤. 짧게 보기는 220, 110, 120. 길이는 결과와 무관하게 같다. 움직임 줄이기에서는 연출을 건너뛴다 | 구현 완료 | `tests/openingFlow.test.ts`(연출 시간) | `AG-TL-001` 에서 `AG-TL-013`, `AGB-결론` 6절, `CL-S-023`, `CL-S-037`, `CL-S-046`, `CL-S-047`, `opening/STATE.md:39` | 일치 | AGY 실행(100ms 간격 프레임 78장: 약 500, 100, 200ms. 표본 간격 때문에 100ms 안에서만 맞는다). Claude 실행 04 |
| F-045 | 소리, 진동, 짧게 보기 설정 | `lib/openingSound.ts:50-78`, `stores/settingsStore.ts:44-48` | 소리와 짧게 보기는 기기마다, 자동 받기는 계정마다 저장 | 구현 완료(실제 소리와 진동은 아무도 듣지 못함) | `tests/audio.test.ts`(옛 오디오만) | `CX-F-025(A)`, `CX-B-004-a`, `AG-TL-001` 에서 `AG-TL-006`, `CL-S-050` | 일치 | Claude 실행 04:o9(설정 시트). 소리와 진동은 확인하지 못함 |
| F-046 | 나온 상품(`/wins`) | `lib/wins.ts:14, 23, 55, 63, 70, 91-103` | 이 계정의 보관함 기록에서 현금을 빼고, 그때의 상품가가 그때의 1회 가격의 2배 이상인 것만. 그때 가격이 없으면 지금 가격으로 견주고 표시한다. 받았거나 배송을 신청해도 남는다. 최신순, 회차 내림차순, id 순. 30건씩. 예시나 다른 사람의 줄은 없다 | 구현 완료 | `tests/wins.test.ts:28` | `CX-R-003`, `CX-Z-009`, `CX-B-005-h`, `CL-S-093`, `CL-R-007` | 일치 | Claude 실행 07:v2 |
| F-047 | 기록 검증 | `components/fairness/verifyRecord.ts:24, 39-55` | 해시 일치, 번호 일치, 상품 일치를 따로 본다. 상품은 그때 저장한 확률표로. 표가 없는 옛 기록은 상품 판정을 비워 둔다 | 구현 완료 | `tests/fairness-record.test.ts:13, 37, 46` | `CX-F-001-h(B)`, `CX-R-003`, `CX-B-002-c`, `CL-S-089`, `CL-S-090` | 일치 | Claude 실행 07:v2, 05:t2(맞지 않는 기록) |
| F-048 | 값을 직접 넣어 검증 | `components/verify/VerifyScreen.tsx:45-68` | 시드, 클라이언트 시드, 회차, 박스를 넣으면 해시와 번호와 상품을 계산한다. 박스의 지금 확률표를 쓴다. 주소의 `s`, `h`, `c`, `n`, `box` 값으로 미리 채운다 | 구현 완료. 입력을 고친 뒤 앞의 결과가 남는다(E-16) | `tests/fairness.test.ts`(식). 화면 시험 없음(`CX-F-089(A)`) | `CX-F-001-i(B)`, `CX-P2-03`, `CX-S-038(A)`, `CL-S-091`, `CL-S-092` | 일치 | Claude 실행 07:v1 |
| F-049 | 블록체인 기록의 상태 | `lib/chainRecord.ts:26-31, 55` | 실제 기록은 언제나 `none`(기록 없음). 다른 상태(`pending`, `confirmed`, `mismatch`, `error`)의 모습은 개발용 갤러리의 고정 자료에만 | 화면만 있음(실제 체인 기록은 서버 미연결) | `tests/chainRecord.test.ts:34` | `CX-A-002-g`, `CX-B-005-i`, `CX-B-005-j`, `CX-B-005-k`, `CL-S-089`, `flow/MELT_SPEC.md:85-87` | 일치 | 통합이 `chainRecordOf` 를 읽음. Claude 실행 11(개발 서버의 갤러리) |

## 3. 지갑과 계정

| 번호 | 기능 | 원본 근거 | 바뀌면 안 되는 것 | 지금 상태 | 덮는 시험 | 참여자의 번호 | 일치 | 검증 |
|---|---|---|---|---|---|---|---|---|
| F-050 | 잔액 계산 | `stores/walletStore.ts:131, 245, 246` | `balance = r2(cryptoBalance + cardBalance)`. `r2` 는 `+n.toFixed(2)`(십진 반올림 라이브러리가 아니다). 개봉에는 둘의 합, 출금에는 crypto 만 | 구현 완료 | `tests/walletSplit.test.ts:15` | `CX-M-001-g`, `CX-M-001-i`, `CX-M-005` | 한 곳만 | Codex 실행. Claude 실행 05:t4(잔액 시트의 두 줄) |
| F-051 | 차감의 계획 | `lib/funding.ts:46, 53, 55`, `stores/walletStore.ts:238-244` | `fromCrypto = r2(min(crypto, amount))`, `fromCard = r2(amount - fromCrypto)`, 비율은 소수 여섯째 자리. 금액이 0 이하이거나 모자라면 null. 10 을 crypto 3, card 20 에서 내면 3 과 7 | 구현 완료 | `tests/funding.test.ts:6, 11, 32`, `tests/parityGolden.test.ts`(debit 16개) | `CX-M-001-b`, `CX-M-001-c`, `CX-M-001-d`, `CX-M-005` | 한 곳만 | Codex 실행, 통합 실행 V-1(6절의 표), V-3 |
| F-052 | USDT 충전 | `lib/depositAddress.ts:22, 28, 36`, `lib/useUsdtDeposit.ts:16, 26-54`, `components/flow/ChargeSheet.tsx:45-56` | 네트워크 TRC20, BEP20, ERC20. 최소 1 USDT, 확인 12개, 5초마다 확인. 주소는 배포 설정이 계정 발급값보다 먼저 | 서버 미연결(배포 사이트에서는 주소를 내지 못한다, E-10) | `tests/depositAddress.test.ts:29`. 시트의 화면 시험 없음(`CX-F-083(A)`) | `CX-M-003`, `CX-A-002-b`, `CX-S-009(A)` 에서 `CX-S-011(A)`, `CLB-F-07`, `CL-S-018` 에서 `CL-S-020`, `AG-I-003` | 일치 | Claude 실행 06:w1, 통합 실행 V-2(`invalid`) |
| F-053 | 충전의 중복 지급 막기 | `lib/depositCredit.ts:13`, `stores/walletStore.ts:163, 176-196, 203-219` | 키는 `deposit_usdt:네트워크:TxID`. 같은 영수증은 한 번만 잔액과 누계에 들어간다. 끝난 건(완료, 취소, 실패)의 상태는 다시 바뀌지 않는다 | 구현 완료(식과 계약. 실제 입금은 서버 미연결) | `tests/depositCredit.test.ts:6`, `tests/accountWallet.test.ts:14` | `CX-M-003`, `CX-T-002-k` | 한 곳만 | 코드에서 읽음 |
| F-054 | 카드 충전 | `stores/walletStore.ts:185, 186`, `components/flow/ChargeSheet.tsx:45` | 카드 잔액 버킷과 출처 계산은 남아 있다. 충전 시트에는 카드 탭이 없다 | 폐기됨(화면). 버킷 계산은 구현 완료 | `tests/walletSplit.test.ts`(카드 잔액은 출금으로 나가지 않는다) | `CX-M-003`, `CX-B-005-l`, `flow/MELT_SPEC.md:93` | 한 곳만 | 통합이 `ChargeSheet.tsx:45` 를 읽음(네트워크 고르기만 있음) |
| F-055 | 가입 보너스 | `stores/walletStore.ts:14, 16, 251-257`, `components/auth/AuthHost.tsx:25-35` | 시작 잔액 0. 계정마다 한 번 10,000 USDT 를 `bonus` 거래(참고 글 `welcome`)로 준다. 입금 누계에는 넣지 않는다 | 구현 완료(시험 장부의 값). 서버 계정을 가리지 않는다(E-41) | `tests/inventory.test.ts:102`, `tests/walletSplit.test.ts`(초기 0) | `CX-M-003`, `CX-Z-002`, `CX-T-003-i`, `CL-S-003` | 일치 | Claude 실행 03:a1. 통합이 조건 줄을 읽음 |
| F-056 | 출금 입력의 검증 | `lib/withdrawal.ts:26, 52, 60-73`, `components/wallet/WithdrawScreen.tsx:75-82` | 주소 형식, 양수이고 유한한 금액, 최소 20 USDT, crypto 잔액 이하. 입력은 고른 통화의 숫자를 환율로 나눠 소수 둘째 자리의 USDT 로. 19.99 는 `min`, 20 과 20.005 는 통과, 잔액 30 에서 30.01 은 `insufficient` | 구현 완료. 통화를 바꾸면 칸의 글자가 다시 읽힌다(E-17) | `tests/withdrawal.test.ts:10`, `tests/parityGolden.test.ts`(withdraw.validate) | `CX-M-001-j`, `CX-M-001-k`, `CX-M-005`, `CX-S-029(A)`, `CL-S-077` | 일치 | Codex 실행, 통합 실행 V-1, V-3. Claude 실행 06:w4 |
| F-057 | 출금 수수료와 받는 금액 | `lib/withdrawal.ts:19-22, 56, 71, 72` | 수수료 TRC20 1, BEP20 0.5 USDT. 받는 금액 `r2(max(0, 신청액 - 수수료))`. 20 을 신청하면 19 와 19.5. 전액은 `r2(max(0, cryptoBalance))` | 구현 완료 | `tests/withdrawal.test.ts`, `tests/parityGolden.test.ts`(withdraw) | `CX-M-001-k`, `CX-M-001-l`, `CX-M-001-m`, `CL-S-077`, `CL-S-078` | 일치 | Codex 실행, 통합 실행 V-1(19, 19.5, 18.99, 29.01), V-3 |
| F-058 | 출금 접수의 순서와 중복 막기 | `components/wallet/WithdrawScreen.tsx:103-130` | 인증 증명을 받은 뒤 접수를 보내고, 접수가 오면 crypto 를 차감하고 `withdraw` 거래를 만든다. 같은 내용이면 같은 접수 번호를 쓴다. 서비스의 번호가 이미 있으면 다시 차감하지 않는다 | 부분 구현(실제 송금 없음. 차감 실패를 보지 않는다, E-01) | 호출부의 시험 없음(`CX-F-087(A)`). 계약은 `tests/accountHttp.test.ts`, `tests/browserAccount.test.ts` | `CX-M-004`, `CX-P1-01`, `CX-S-030(A)`, `CX-S-033(A)`, `CX-A-002-c`, `CL-S-078`, `CL-S-080` | 일치 | 통합 실행 V-1(차감 실패 뒤 취소로 잔액 30). Claude 는 확인 단계까지 실행 06:w4 |
| F-059 | 출금의 인증 | `lib/security.ts:34-37`, `lib/withdrawHold.ts:9-13`, `components/wallet/WithdrawScreen.tsx:137-167`, `lib/browserAccount.ts:301-320` | 인증 앱 코드로 접수. 세 번 틀리면 이메일 경로. 이메일로 접수하면 72시간 보안 대기 | 서버 미연결(브라우저 계정은 6자리 형식만 본다) | `tests/withdrawHold.test.ts:8`, `tests/securityApi.test.ts:4`, `tests/totp.test.ts:24` | `CX-M-004`, `CX-A-001`, `CX-B-006-g`, `CX-T-003-m`, `CX-S-028(A)`, `CX-S-031(A)`, `CL-S-076`, `CL-S-080`, `CL-S-081` | 일치 | 코드에서 읽음. Claude 는 관문과 인증 코드 화면까지 실행 06:w4 |
| F-060 | 출금 상태 맞추기와 취소 | `stores/walletStore.ts:197-202, 220-230`, `components/wallet/WalletScreen.tsx:44-62, 78-88` | 지갑 화면이 10초마다 처리 중인 출금의 상태를 받아 온다. 취소나 실패가 오면 `abs(amountUsdt)` 를 crypto 로 한 번 돌려준다. 끝난 건은 다시 바뀌지 않는다. 로컬 취소는 72시간 대기 건만 | 구현 완료(브라우저 계정의 흉내). E-01 의 조건에서는 차감하지 않은 금액을 돌려준다 | `tests/withdrawHold.test.ts`, `tests/accountWallet.test.ts`, `tests/inventory.test.ts` | `CX-M-004`, `CX-S-032(A)`, `CL-S-082`, `CL-S-083` | 일치 | 통합 실행 V-1(두 번째 취소는 다시 올리지 않음). Claude 실행 06:w3 |
| F-061 | 이용 기준(rollover) | `lib/rollover.ts:16, 47, 57, 63`, `lib/opening.ts:109` | `progress = min(100, floor(wagered / max(1, deposited) * 100))`. 요구액은 crypto 입금 누계. 바닥 비율 0.9 이상인 박스의 비용은 0.3배만 인정 | 부분 구현(누계와 식은 있고 출금에서 검사하지 않는다, E-26) | `tests/rollover.test.ts:6, 48, 66` | `CX-M-004`, `CX-Z-004`, `CX-B-006-h`, `CX-F-034(A)`, `CX-T-003-h` | 한 곳만 | 통합의 검색: `components` 와 `app` 에 `rollover` 를 읽는 파일 없음 |
| F-062 | 지갑 내역의 표시 | `components/wallet/WalletScreen.tsx:66-71` | 최신순. 금액은 부호와 표시 통화로. 완료가 아닌 상태는 상태 글을 붙인다 | 부분 구현(박스 열기, 받기, 배송비 환불 거래가 보이지 않는다, E-06. 음수 달러 표기, E-14) | 없음 | `CX-P1-07`, `CX-F-008(A)`, `CLB-F-02`, `CLB-F-12b`, `CL-R-005` | 일치 | 통합 실행 V-1, Claude 실행 06:w2, 06:w3 |
| F-063 | 가입, 로그인, 비밀번호 다시 정하기 | `lib/account.ts:43-52, 109-116`, `lib/browserAccount.ts:85-135`, `components/flow/LoginSheet.tsx` | 서버 주소가 둘 다 비어 있으면 브라우저 계정 서비스를 쓴다. 서버가 있으면 쿠키와 CSRF, 15초 제한. 잘못된 주소가 들어 있으면 브라우저 계정으로 돌아가지 않고 오류 | 서버 미연결(브라우저 흉내로 구현 완료: 모르는 이메일이면 계정을 만들고, 어떤 6자리 코드도 통과한다, N-07, E-36) | `tests/account.test.ts:7`, `tests/browserAccount.test.ts:6`, `tests/accountHttp.test.ts:6`. 시트의 화면 시험 없음(`CX-F-081(A)`) | `CX-A-001` 의 a 에서 e, `CX-F-049(A)`, `CX-F-050(A)`, `CX-B-006-a`, `CX-S-001(A)` 에서 `CX-S-004(A)`, `CL-S-001` 에서 `CL-S-007`, `AG-I-002` | 일치 | Claude 실행 03:a1, 03:a2. 통합 실행 V-2(다른 비밀번호로 로그인됨) |
| F-064 | 세션 | `stores/authStore.ts:77-128`, `lib/browserAccount.ts:10, 136, 137, 151` | 로그인한 사용자를 저장값에서 되살리지 않고 `/auth/session` 으로 되살린다. 브라우저 계정의 세션은 계정 id 하나. 창으로 돌아오거나 탭이 다시 보이면 다시 확인한다. 세션이 끝나면 화면 안 한 줄 | 구현 완료. 다른 탭의 변화가 storage 사건으로는 전해지지 않는다(E-07) | `tests/auth.test.ts:21`. 접두사 붙은 사건을 보는 시험 없음(`CX-T-003-b`) | `CX-F-020(A)`, `CX-F-054(A)`, `CX-P1-06`, `CX-P-004-b`, `CX-B-001-c`, `CL-S-009` 에서 `CL-S-013`, `CLB-F-04` | 어긋남(등급만, D-02) | Codex 실행(두 탭), Claude 실행 01b:d3, 01b:d4, 03 |
| F-065 | 소셜 단추로 계속하기 | `lib/browserAccount.ts:113`, `lib/account.ts:176` | 브라우저 계정에서는 밖으로 나가지 않고 `{공급자}@device.invalid` 계정을 만든다. 서버가 있으면 허용된 공급자의 HTTPS 주소로만 보낸다 | 서버 미연결(흉내) | `tests/browserAccount.test.ts`, `tests/account.test.ts` | `CX-A-001`, `CX-A-002-a`, `CX-S-003(A)`, `CL-S-008` | 일치 | Claude 실행 03:a2(Google 하나만 누름) |
| F-066 | 닉네임 바꾸기 | `components/account/AccountSheets.tsx`, `lib/browserAccount.ts`(닉네임), `lib/nicknameRules.ts` | 형식과 금칙어, 14일 간격 | 구현 완료 | `tests/nicknameRules.test.ts:7`, `tests/profile.test.ts:7` | `CX-S-006(A)`, `CL-S-014` | 일치 | Claude 실행 03:a3 |
| F-067 | 비밀번호 바꾸기(계정 화면) | `components/account/AccountSheets.tsx:57-64`, `lib/account.ts:248-257`, `lib/browserAccount.ts:230-246` | 서비스의 규칙: 현재 비밀번호 확인, 코드, 새 비밀번호 12자 이상, 바꾸면 다른 세션을 끊는다 | 부분 구현(시트가 앞 단계를 건너뛰어 언제나 거절된다, E-03) | 새 시트의 시험 없음(`CX-F-082(A)`). 서비스는 `tests/passwordChangeFlow.test.ts:36` | `CX-P1-03`, `CX-S-007(A)`, `CLB-F-06`, `CL-S-015` | 어긋남(등급만, D-01) | 통합 실행 V-2, Claude 실행 03:a3, Codex 실행 |
| F-068 | 탈퇴(계정 화면) | `components/account/AccountSheets.tsx:88-101`, `lib/account.ts:189-192, 259, 274`, `lib/browserAccount.ts:57-63, 147-150` | 서비스의 규칙: 두 잔액, 보관 상품, 진행 중인 배송과 거래가 남으면 막는다. 인증 코드로 확인한다 | 부분 구현(시트가 옛 주소를 불러 언제나 거절된다, E-04) | 새 시트의 시험 없음. 서비스는 `tests/accountClosureFlow.test.ts:7` | `CX-P1-04`, `CX-S-008(A)`, `CX-B-006-e`, `CLB-F-06`, `CL-S-016` | 어긋남(등급만, D-01) | 통합 실행 V-2, Claude 실행 03:a3, Codex 실행 |
| F-069 | 인증 앱 연결 | `components/wallet/TwoFactorSetup.tsx`, `lib/browserAccount.ts:283-292`, `lib/totp.ts` | 연결용 비밀값을 만들고 코드를 넣어 켠다. 순수 TOTP 계산은 RFC 6238 | 서버 미연결(브라우저 계정은 켤 때 6자리 형식만 본다) | `tests/totp.test.ts:24` | `CX-A-001`, `CX-B-006-g`, `CX-T-003-m`, `CL-S-017` | 일치 | Claude 실행 03:a3(설정 화면). 키 복사는 실행하지 않음 |
| F-070 | 예외를 알리는 줄(저장 가득, 오프라인, 세션 끝남) | `lib/labSite.ts:12-19`, `components/layout/LabBadge.tsx:18-39`, `components/shell/StateScreens.tsx:36-57` | 팝업이 아니라 화면 안 한 줄. 저장 가득 안내는 한 번 뜨면 그 화면에서 남는다 | 구현 완료 | 안내가 뜨는 것을 보는 시험 없음 | `CX-P-003`, `CX-B-001-c`, `CL-S-100`, `CL-S-101`, `CLA-옛문서-10` | 일치 | Claude 실행 01:n5, 04:o10 |
| F-071 | 저장 키와 접두사 | `lib/labSite.ts:17, 19`, `app/layout.tsx:48`, 키마다의 근거는 `CX-P-001` 의 a 에서 x | 물리 키는 전부 `voila-test-aresjoo:` 로 시작한다. 논리 키 24개의 이름과 값의 모양(예: `gachaflix.wallet` 버전 4, `voila.browser-wallet.{id 또는 guest}`, `voila.browser-inventory.{id 또는 guest}`, `gachaflix.fair`, `gachaflix.currency`, `gachaflix.settings`, `gachaflix.community`, `voila.opening-journal`, `voila.browser-accounts.v1`, `voila.browser-session.v1`, `voila.take-unconfirmed.{지갑 키}`). `clear()` 는 이 사이트의 키만 지운다 | 구현 완료 | `tests/auth.test.ts`(자산 키를 건드리지 않음). 래퍼 자체의 시험은 찾지 못함 | `CX-P-001` 의 a 에서 x, `CX-F-020(A)` 에서 `CX-F-033(A)`, `CX-F-035(A)` 에서 `CX-F-048(A)`, `CX-F-060(A)`, `CL-I` 0.4절 | 일치 | Codex 실행, Claude 실행 00(저장 키) |
| F-072 | 계정마다의 장부 | `lib/browserWallet.ts:5-20`, `components/auth/AuthHost.tsx:25-27` | 로그인하면 지갑과 보관함의 저장 이름을 그 계정의 것으로 바꾼다. 로그아웃하면 `guest`. 앞 계정의 자료를 지우지 않는다. 시드, 설정, 후기, 봤음 표시는 계정마다 나뉘지 않는다(자동 받기 설정만 계정마다) | 구현 완료. 불러올 때 버전 이동을 건너뛴다(E-28) | `tests/browserAccount.test.ts`. 옛 형식 장부의 시험 없음(`CX-T-003-j`) | `CX-P-002`, `CX-F-044(A)`, `CX-F-051(A)` 에서 `CX-F-053(A)`, `CL-S-010` | 일치 | Claude 실행 03(계정 전환), 10(계정을 바꾼 뒤) |
| F-073 | 새로 고친 뒤 남는 것과 사라지는 것 | `components/layout/CurrencyHydrator.tsx:16`, `stores/flowStore.ts:22` | 남는 것: 지갑과 보관함의 거래, 시드와 회차, 설정, 끝난 후기, 봤음 표시. 사라지는 것: 열린 시트, 로그인과 출금과 배송의 입력값, 검색어, 탭 | 구현 완료 | 없음(화면) | `CX-P-002`, `CX-F-031(A)`, `CL-S-011`, `CL-S-084`, `CL-S-099` | 일치 | Claude 실행 04:o4, 06:w4 |
| F-074 | 두 탭에서 같은 장부를 쓸 때 | `lib/ledgerLock.ts:40-53` | 잠금 이름 `voila-ledger:{지갑 키}`. 잠금 안에서 지갑, 보관함, 시드를 다시 읽는다 | 구현 완료. 다른 탭에서 바뀐 잔액이 화면에는 전해지지 않는다(E-21) | `tests/opening.test.ts:68`(Node). 실제 브라우저의 잠금을 보는 시험 없음(`CX-T-003-c`) | `CX-P-004`, `CX-T-003-c`, `CLB-F-03`, `CL-S-048` | 일치 | Codex 실행(두 탭), Claude 실행 10:m2 |

## 4. 후기와 신뢰 자료

후기 자리(박스 상세의 후기, `/reviews`, 박스 카드의 별점과 후기 수)는 `BRIEF.md` 2절의 파운더 결정으로 샘플 후기 생성기가 합쳐지면 달라진다. 아래는 그 전의 기준 상태다. 당첨 기록과 검증 자료는 달라지면 안 된다.

| 번호 | 기능 | 원본 근거 | 바뀌면 안 되는 것 | 지금 상태 | 덮는 시험 | 참여자의 번호 | 일치 | 검증 |
|---|---|---|---|---|---|---|---|---|
| F-075 | 후기의 원천 | `lib/reviewSamples.ts:1, 17`, `lib/publishedReviewExamples.ts:33, 39, 50`, `stores/communityStore.ts:7, 21, 57`, `lib/communityReviewApi.ts:10, 29, 36` | 넷이다. 예시 28건(3점 1, 4점 9, 5점 18, 평균 4.6), 따로 있는 운영 예시 20건(4점 6, 5점 14, 평균 4.7, `source` 가 `example`), 이 기기에서 쓴 내 후기, 서버가 있을 때의 원격 후기. 원격은 서버 주소가 비면 빈 배열 | 부분 구현(내 후기는 구현 완료, 원격은 서버 미연결, 예시는 예시 자료) | `tests/community.test.ts:14, 47, 85, 125`. 예시 28건의 원문을 고정하는 시험 없음(`CX-T-003-l`) | `CX-R-001` 의 a 에서 e, `CX-Z-009`, `CX-A-002-f`, `CL-R-008` | 일치 | Codex 실행(두 묶음의 수와 분포). 통합이 28건을 셈 |
| F-076 | 박스 화면과 후기 모아보기의 카드 구성 | `components/box/BoxReviews.tsx:100-116`, `components/box/ReviewsScreen.tsx:23-28`, `stores/usePublishedReviews.ts:28` | 공개 피드에서 예시를 뺀 것(내 후기)을 먼저, 그 뒤에 예시 28건 가운데 그 박스의 것. 따로 있는 운영 예시 20건은 여기에 들어가지 않는다 | 구현 완료(예시의 표시가 없다, E-30) | `tests/community.test.ts:125`(피드의 중복과 정렬) | `CX-R-001`, `CX-R-002`, `CX-S-036(A)`, `CL-I` 3.3절 | 일치 | 통합이 `BoxReviews.tsx:104-114` 를 읽음. Claude 실행 02:b2 |
| F-077 | 작성자 표시 | `components/box/BoxReviews.tsx:109, 113` | 내 후기는 `authorName`, 없으면 닉네임, 없으면 "나". 예시는 자료의 `author` | 구현 완료 | 없음 | `CX-R-001`, `CL-U` 4.2절 | 한 곳만 | 통합이 두 줄을 읽음 |
| F-078 | 후기의 사진 | `components/flow/ReviewSheet.tsx:14-29`, `components/box/BoxReviews.tsx:109, 113` | 내 후기의 사진은 긴 변 1,000px, webp 품질 0.8 로 줄여 data URL 로 저장. 예시는 사진 없음 | 구현 완료. 늦게 끝난 사진을 막지 않는다(E-15) | `tests/vault-records.test.ts`(저장 실패). 사진 두 장의 경합 시험 없음(`CX-F-088(A)`) | `CX-F-066(A)`, `CX-P2-01`, `CL-S-085`, `CL-S-086` | 일치 | Claude 실행 05:t3, 12:x4 |
| F-079 | 후기의 날짜 | `components/box/BoxReviews.tsx:89, 109, 113` | 내 후기는 저장 시각을 화면 형식으로. 예시는 날짜 문자열의 빗금만 점으로 바꿔 그대로 | 구현 완료 | 없음 | `CX-P2-08`, `AG-DIF-001` | 일치 | 통합이 `:113` 을 읽음. 시간대에 따른 차이는 확인하지 못함(`PARITY_ISSUES.md` A.5) |
| F-080 | 후기와 상품의 연결 | `components/box/BoxReviews.tsx:106, 109, 112, 113` | `boxSlug` 로 박스를, `itemId` 로 그 박스의 상품을 찾는다. 박스가 카탈로그에 없으면 그 후기를 건너뛴다 | 구현 완료 | `tests/community.test.ts:47`(위조된 값 거절) | `CX-R-001-a`, `CX-R-001-b` | 한 곳만 | 통합이 읽음 |
| F-081 | 후기의 정렬과 필터 | `components/box/BoxReviews.tsx:104, 111`, `components/box/ReviewsScreen.tsx:21-27`, `lib/community.ts:26` | 내 후기는 시각 내림차순, 예시는 날짜 내림차순. 후기 모아보기는 박스 알약으로 거르고 주소의 `box` 값으로 처음 고른다. 공개 피드는 같은 id 를 하나로 | 구현 완료. 주소의 값을 처음 한 번만 읽는다(E-24) | `tests/community.test.ts:125` | `CX-R-001`, `CX-P2-02`, `CL-R-008`, `CL-I` 3.3절 | 일치 | Claude 실행 02:b2. 뒤로 가기에서의 어긋남은 아무도 실행하지 않음 |
| F-082 | 별점 요약 | `lib/reviewSamples.ts:57`, `components/box/BoxReviews.tsx:57-67, 177` | 1 에서 5 의 정수만 센다. 평균은 `round(합 / 수 * 10) / 10`, 없으면 null. 별 그림은 평균을 다시 반올림. 막대 길이의 분모는 가장 많은 별점의 수 | 구현 완료(예시 점수가 평균에 들어간다, E-30) | 없음 | `CX-R-002` | 한 곳만 | 코드에서 읽음(Codex) |
| F-083 | 예시와 실제 후기의 구분 | `components/box/BoxReviews.tsx:109, 113, 119, 145, 165` | 안에서는 `mine` 과 `verifyHref` 로 가른다. 실제 후기에만 검증 줄이 붙는다 | 부분 구현(화면에 예시라는 표시가 없다, E-30) | 없음(`CX-T-003-l`) | `CX-R-002`, `CX-Z-009`, `CX-B-006-c`, `flow/MELT_SPEC.md:132` | 한 곳만 | 통합이 읽음 |
| F-084 | 후기를 쓸 수 있는 조건 | `lib/community.ts:11, 52-59`, `stores/communityStore.ts:23, 29, 36`, `components/flow/ReviewSheet.tsx:45-52` | 상품가 100 USDT 이상. 보관 중, 배송 신청, 배송 중, 배송 완료, 받음 어느 상태든. 글 5자 에서 1,200자, 별점 1 에서 5, 개봉마다 한 건. 보너스 0(잔액이 오르지 않는다) | 구현 완료 | `tests/community.test.ts:14, 85`, `tests/vault-records.test.ts:12` | `CX-R-001-c`, `CX-R-002`, `CX-M-003`, `CX-S-035(A)`, `CL-S-085` 에서 `CL-S-088` | 일치 | Claude 실행 05:t3 |
| F-085 | 후기의 검증 링크 | `components/box/BoxReviews.tsx:108` | 보관 기록에 시드가 있으면 `/verify?s, h, c, n, box` 로 가는 링크. 없으면 링크 없음 | 구현 완료(직접 입력 절로 가서 지금 표를 쓴다, E-31) | 없음(`CX-T-003-k`) | `CX-F-002(B)`, `CX-T-003-k`, `CL-S-092` | 일치 | 통합이 읽음. Claude 실행 07:v1(주소의 값으로 미리 채우기) |
| F-086 | 검증의 세 상태(맞음, 맞지 않음, 확인할 수 없음) | `components/fairness/verifyRecord.ts:45-55`, `components/flow/VerifySheet.tsx:39-47`, `lib/chainRecord.ts:26-31` | 해시, 번호, 상품을 따로 판정한다. 표가 없는 옛 기록의 상품은 판정하지 않는다. 블록체인 기록은 없음 | 구현 완료(블록체인 쪽은 F-049) | `tests/fairness-record.test.ts:13, 37, 46`, `tests/chainRecord.test.ts:34` | `CX-R-003`, `CX-T-002-o`, `CL-S-089`, `CL-S-090`, `CL-S-054` | 일치 | Claude 실행 07:v2, 05:t2, 04:o3 |

## 5. 다국어와 통화

| 번호 | 기능 | 원본 근거 | 바뀌면 안 되는 것 | 지금 상태 | 덮는 시험 | 참여자의 번호 | 일치 | 검증 |
|---|---|---|---|---|---|---|---|---|
| F-087 | 언어와 주소 | `i18n/routing.ts:10-14`, `app/page.tsx:7, 13`, `components/shell/AppFooter.tsx:61` | 언어 `ko`, `en`, `zh`. 주소의 첫 마디가 언어. 루트는 저장값, 브라우저 언어 순으로 보내고 스크립트가 꺼지면 `./ko/`. 꼬리말의 언어 링크는 같은 경로의 다른 언어로 | 구현 완료. 링크가 주소의 값을 버린다(E-33). 스크립트와 `meta` 의 목적지가 다르다(E-34) | 없음(`CX-F-090(A)`) | `CX-F-061(A)`, `CX-S-039(A)`, `CL-R-001`, `CL-S-096`, `CL-S-097`, `AG-DIF-010` | 일치 | Claude 실행 01:n3, AGY 실행(세 언어의 라우트) |
| F-088 | 문구 묶음 | `messages/v.ko.json`, `v.en.json`, `v.zh.json` | 세 벌의 키와 변수가 같다. 금지 문자와 금지 표현 검사 | 구현 완료 | `tests/vMessages.test.ts:20`, `tests/i18n.test.ts:23`, `tests/legal.test.ts:9` | `CX-F-250(A)`, `CX-F-227(A)`, `CL-U` 6.4절(쓰이지 않는 새 문구 키 16개), `AG-TX-008` | 일치 | Claude 가 세 언어에 키가 다 있는 것을 실행으로 확인(`claude-a-ui.md` 9절). 통합은 돌리지 않음 |
| F-089 | `html lang` 맞추기 | `app/layout.tsx:45`, `components/layout/LocaleHtmlLang.tsx:7-11` | 뜬 뒤 `ko`, `en`, `zh-Hans` 로 바꾼다 | 부분 구현(정적 HTML 은 전부 `ko`, E-13) | 없음 | `CL-U-001`, `CL-U-005`, `CX-P2-08`, `RELEASE-READINESS.md:68` | 일치 | 통합 실행 V-4(기준 빌드 여섯 파일이 `ko`), Claude 실행 |
| F-090 | 고른 언어의 저장 | `app/page.tsx:7`, `components/layout/LanguageSelector.tsx:14` | 루트가 읽는 키는 `gachaflix.locale` | 지금 닿지 않음(쓰는 곳이 닿지 않는 옛 부품뿐이다, E-18) | 없음 | `CX-P2-04`, `CX-F-035(A)`, `CX-F-039(A)`, `CX-P-001-s`, `CLB-F-10` | 일치 | Claude 실행 01:n3 |
| F-091 | 표시 통화 | `stores/currencyStore.ts:21, 36, 43-49`, `lib/useCurrency.ts:15`, `components/shell/AppFooter.tsx:62` | 기본은 USD. 꼬리말 단추로 USD 와 KRW 를 오간다. 고른 통화만 저장하고 환율은 저장하지 않는다. 옛 저장값 USDT 는 USD 로 옮긴다 | 구현 완료 | `tests/formatCurrency.test.ts:8, 18` | `CX-M-006`, `CX-F-024(A)`, `CX-S-040(A)`, `CL-S-094`, `CL-S-095`, `AG-DIF-007`, `CLA-놀람-12` | 어긋남(Antigravity 가 저장 키 이름을 틀리게 적음, D-08) | Claude 실행 01:n3 |
| F-092 | 환율 | `stores/currencyStore.ts:21` | USDT 1 은 USD 1, KRW 1,380. 고정값 | 구현 완료 | `tests/formatCurrency.test.ts` | `CX-M-006`, `CX-F-024(A)` | 일치 | 통합 실행 V-1(0.5 는 ₩690, 80 은 ₩110,000) |
| F-093 | 금액의 표기 | `lib/formatCurrency.ts:18-48, 55, 102` | USDT 와 USD 는 `en-US` 자릿수, 소수 둘째 자리까지, 끝의 0 은 뺀다. 원화는 10,000원 미만이면 원 단위 반올림, 이상이면 만원 아래를 버린다. 예: 0.005 는 ₩7 과 `$0.01`, 7.24 는 ₩9,991, 7.25 는 ₩10,000, 80 은 ₩110,000, 95,700 은 ₩132,060,000 | 구현 완료(음수 달러는 `$-50`, E-14) | `tests/formatCurrency.test.ts:25, 59, 66, 74` | `CX-M-006`, `CX-T-002-l`, `CLB-F-12b`, `CLB-F-12c`, `AG-TX-006` | 일치 | Codex 실행, 통합 실행 V-1(여섯 값이 같음) |
| F-094 | 언어마다의 줄바꿈 | `app/globals.css:65-80` | 한국어 `word-break: keep-all`, 영어 `overflow-wrap: break-word` 와 자간 -0.01em, 중국어 `word-break: break-all`. `html[lang]` 선택자에 걸려 있다 | 구현 완료 | 없음 | `AG-TX-001` 에서 `AG-TX-010`, `AG-U-010` 에서 `AG-U-013` | 한 곳만 | AGY 실행(14개 라우트, 두 폭: 줄 수나 높이가 다른 곳 99, 넘침 0) |
| F-095 | 옛 표기 함수 | `lib/formatCurrency.ts:64`(compact), `lib/localFiat.ts:30, 45, 51`, `lib/format.ts:20`, `lib/rng.ts:16` | 지금 화면의 금액과 확률 경로는 이 함수들을 쓰지 않는다. 대신 넣으면 표기가 달라진다 | 지금 닿지 않음 | `tests/localFiat.test.ts:9`, `tests/formatCurrency.test.ts`(compact) | `CX-M-006`, `CX-F-002(B)`, `CX-F-231(A)` | 한 곳만 | 코드에서 읽음(Codex) |

---

## 6. 지켜야 할 기준값

### 6.1 카탈로그의 SHA-256

| 이름 | 형식 | 값 | 누가 냈고 누가 다시 계산했나 |
|---|---|---|---|
| 주 지문, 전체 | 박스를 slug 오름차순, 박스 안은 `dropTable` 순서, 한 줄이 `JSON.stringify([slug, price, itemId, dropRate])` 와 줄바꿈(마지막 줄에도). 32,916줄, 2,201,788바이트 | `a82f8bd995be27226825ea4e467e124f8a6e77d264f7d26e6fa40bcf5ce2925d` | Codex 실행(`CX-D-003`). 통합 실행 V-1 이 같은 값 |
| 주 지문, 홈 | 같은 형식. 32,000줄, 2,160,497바이트 | `8bce14b1305f9bc1be28ec08ba9f3e44b704e67610517df6eed0aa842df9c9b0` | Codex 실행. 통합 실행 V-1 이 같은 값 |
| `tableOrder` | `BOXES` 배열 순서, `slug\|price\|id\|dropRate`, 줄 사이 줄바꿈, 마지막 줄바꿈 없음 | `67fdb233f46f139d7357f53e2337a5386d27368bc13efec4e136ac9c7b425ed6` | 기준값 파일 `harness/golden/catalog.json`. Codex 가 따로 계산해 같은 값. V-3 통과 |
| `drawOrder` | 추첨 구간의 순서 | `3cb5c4cb79815b3f9674c19b1858d031028e609c146e4276fdbbb9685ba785d1` | 위와 같음 |
| `withKindAndValue` | 종류와 값을 더한 것 | `5d6af693c4f89e6d5455014207b8518f0d558d7e5a029779e0106c6ae0b9e4d8` | 위와 같음 |
| `namesAndPhotos` | 세 언어 이름과 사진 경로 | `1be190bcb6e3a0230778d6ec15250a2a446bb2de6c71e535d75d034527b3c62e` | 위와 같음 |
| `boxOrder` | 전체 박스의 순서 | `81bb2c22deda3d392f256c0f70e2d04c1c32b6c596c4ce6134e431c6a47d2749` | 기준값 파일. V-3 통과. Codex 는 값을 적지 않음 |
| `homeBoxOrder` | 홈 박스의 순서 | `0f3ed123b383daf4d1d0660e0a9de37d30cbf565a1cbd8909e8fdb8ff46249d0` | 위와 같음 |

주 지문과 기준값 형식의 해시는 줄의 형식이 달라 문자열이 다르다. 자료가 다른 것이 아니다. 상수: 환급 비율 0.95, 옛 박스의 표 버전 `2026-10-11-burst-99-v3`, 새 박스의 표 버전 `2026-10-12-physical-99-v1`, 번호의 범위 1,000,000.

### 6.2 추첨의 기준 표

기준값 파일 `harness/golden/draws.json`: 서버 시드 `parity-audit-server-seed-0001`, 클라이언트 시드 `parity-audit-client-seed`, 박스 `gaming-playstation`, `watch-rolex`, `pokemon-charizard`, 회차 0 에서 49(150줄). `tests/parityGolden.test.ts` 가 견준다(V-3 통과).

Codex 의 10회 표(`CX-F-003(B)`): 서버 시드 `codex-b-server-seed-2026-10-12`, 클라이언트 시드 `codex-b-client-seed`, 약속 해시 `f362c9b0155b62b1515fbdd993ec7fd46c3b5b05dafea6f51402788eef0b968d`. 통합 실행 V-1 이 열 줄 전부 같은 값을 냈다. 이 표는 아직 시험으로 고정돼 있지 않다(`CX-T-003-d`).

| 회차 | 번호 | `vault-pokemon` 의 상품 | `pokemon-charizard` 의 상품 |
|---|---|---|---|
| 0 | 169143 | pkm-ex-tin-4 | pokemon-p-etb-ssp |
| 1 | 533039 | wave-cashback-100 | pokemon-charizard-sitting-cuties-plush |
| 2 | 620397 | wave-cashback-100 | pokemon-p-ds-perfect-fit-sealable-100 |
| 3 | 147244 | pkm-simisear-vstar-nm | pokemon-p-origin-forme-palkia-v-asr-167-189 |
| 4 | 766429 | wave-cashback-100 | pokemon-p-bp-tef |
| 5 | 749275 | wave-cashback-100 | pokemon-p-bp-tef |
| 6 | 472235 | wave-cashback-100 | pokemon-p-dragonair-mew-181-165 |
| 7 | 226983 | wave-drop-2000 | pokemon-charizard-charizard-vmax-daa-020-189 |
| 8 | 48223 | wave-drop-8000 | pokemon-charizard-charizard-excg-4-100 |
| 9 | 165 | pkm-gengar-vmax-psa10 | pokemon-charizard-charizard-basesl-4-102-psa9 |

### 6.3 돈 계산의 경계값

Codex 실행(`CX-M-005`)과 통합 실행 V-1 이 같은 값을 냈다. 기준값 파일 `harness/golden/money.json` 은 받는 금액 20개, 차감 16개, 환급 9개, 구간 90개, 출금, 터짐을 담고 `tests/parityGolden.test.ts` 가 견준다.

| 상품가 | 받는 금액(95%) |
|---|---|
| 0.005 | 0 |
| 0.015 | 0.01 |
| 0.105 | 0.1 |
| 1.005 | 0.95 |
| 2.675 | 2.54 |
| 0.1 | 0.1 |
| 0.3 | 0.28 |
| 100 | 95 |

| 낼 금액 | crypto 잔액 | card 잔액 | crypto 에서 | card 에서 | 비율 |
|---|---|---|---|---|---|
| 10 | 3 | 20 | 3 | 7 | 0.3 과 0.7 |
| 10 | 0 | 20 | 0 | 10 | 0 과 1 |
| 0.005 | 3 | 20 | 0.01 | 0 | 1 과 0 |
| 0.0049 | 3 | 20 | 낼 수 없음 | 낼 수 없음 | |
| 33.01 | 3 | 30 | 낼 수 없음 | 낼 수 없음 | |

| 출금 신청액 | 잔액 | TRC20 으로 받는 금액 | BEP20 으로 받는 금액 | 검증 |
|---|---|---|---|---|
| 19.99 | 30 | 18.99 | 19.49 | 최소 금액 미만 |
| 20 | 30 | 19 | 19.5 | 통과 |
| 20.005 | 30 | 19 | 19.5 | 통과 |
| 30.01 | 30 | 29.01 | 29.51 | 잔액 초과 |

섞인 잔액의 예(Codex): crypto 3, card 20 에서 10 을 내면 crypto 0, card 13 이 남는다. 100짜리 상품을 95 로 받으면 crypto 28.5, card 66.5 가 들어와 crypto 28.5, card 79.5, 합 108 이다. 개봉에 쓸 수 있는 108 과 출금할 수 있는 28.5 는 다르다.

---

## 7. 시험 지도와 빠진 보호

### 7.1 돌린 결과

| 무엇 | 결과 | 누가 |
|---|---|---|
| `npm test`(기준 커밋의 추적되는 시험 56개 파일) | 398개, 통과 397, 건너뜀 1, 실패 0 | 총괄(`logs/baseline-test.log`), Codex 전반부(`CX-F-003(A)`) |
| `npm test`(추적되지 않는 `tests/parityGolden.test.ts` 포함) | 404개, 통과 403, 건너뜀 1, 실패 0 | Codex 후반부(`CX-T-001`), 총괄(`logs/harness-test.log`) |
| `tests/parityGolden.test.ts` 만 | 6개, 통과 6 | 통합 실행 V-3 |
| `npx tsc --noEmit` | 오류 0 | 총괄(`logs/baseline-tsc.log`), Codex 전반부(`CX-F-004(A)`) |

건너뛴 하나는 `tests/freeOpens.test.ts:72`(무료 개봉에서 터짐이 나오는 경우. 가입 혜택 박스가 실물 전용이라 터짐 항목이 없다). 398 과 404 의 차이는 `PARITY_ISSUES.md` D-05 에 적었다. `tests/parityGolden.test.ts` 는 아직 커밋되지 않았다(`git status --short web`).

시험 파일마다 무엇을 지키는지는 Codex 전반부의 `CX-F-200(A)` 에서 `CX-F-255(A)`(56줄)에 있다. 그 가운데 Codex 가 "옛" 또는 "미도달"이라고 적은, 닿지 않는 코드를 보는 파일: `aboutStats`, `audio`, `board`, `boardApi`, `dailyBox`, `engine`, `fraudScoring`, `gachaItems`, `liveDrops`, `localFiat`, `proofFeed`, `ranking`, `reel`(13개). 이 파일들이 통과해도 지금 화면의 동작을 지킨다는 뜻이 아니다. 통합 단계에서 파일마다 다시 가려 보지는 않았다.

### 7.2 지금 없는 보호

Codex 의 두 목록을 합쳤다. 새 시험을 만들라는 지시가 아니라, 동등성 검수에서 빠지면 안 되는 경계다.

| 번호 | 없는 보호 | 관련 기능과 결함 | 낸 곳 |
|---|---|---|---|
| T-01 | 실제 브라우저에서 개봉 기록이 저장 한도에 닿는 경우 | F-030, F-032, E-02 | `CX-T-003-a`, `CX-F-084(A)` |
| T-02 | 실제 접두사 래퍼와 실제 storage 사건을 합친 두 탭의 로그아웃과 후기 | F-064, E-07 | `CX-T-003-b`, `CX-F-081(A)` |
| T-03 | Web Locks 를 쓰는 실제 브라우저의 동시 구매 | F-031, F-074 | `CX-T-003-c` |
| T-04 | 6.2절의 10회 표(옛 박스 `vault-pokemon` 포함) | F-020, F-021 | `CX-T-003-d` |
| T-05 | 무료와 유료를 섞은 묶음에서 무료 상품의 출처 비율 | F-027 | `CX-T-003-e` |
| T-06 | 0.005 부근과 0.285 의 반올림이 화면의 견적과 판매까지 이어지는 경계 | F-035, F-036 | `CX-T-003-f` |
| T-07 | 원화 입력의 왕복과 버림, 전액 단추, 받는 금액 줄의 화면 연결 | F-056, E-17 | `CX-T-003-g`, `CX-F-087(A)` |
| T-08 | 출금 호출부의 이용 기준과 접수 대기 중의 잔액 경합 | F-058, F-061, E-01, E-26 | `CX-T-003-h`, `CX-F-087(A)` |
| T-09 | 서버 계정에서 시험 보너스가 더해지지 않는지 | F-055, E-41 | `CX-T-003-i` |
| T-10 | 계정별 장부의 버전 이동과 손상된 상태 | F-072, E-28 | `CX-T-003-j` |
| T-11 | 복구한 결과의 확률과 후기의 검증 링크가 그때의 표를 쓰는지 | F-012, F-085, E-31 | `CX-T-003-k` |
| T-12 | 예시 28건의 원문, 날짜, 점수, 박스와 상품 연결, 예시 표시 | F-075, F-083, E-30 | `CX-T-003-l`, `CX-F-088(A)` |
| T-13 | 6자리 흉내와 실제 TOTP 를 화면에서 가르는 검사 | F-059, F-069 | `CX-T-003-m` |
| T-14 | 배포 기본 경로가 붙은 사진 8,509개가 실제로 뜨는지 | F-008 | `CX-T-003-n` |
| T-15 | 로그인 시트의 가입, 코드, 복구, 로그아웃의 실제 단계 | F-063, E-22 | `CX-F-081(A)` |
| T-16 | 새 비밀번호 시트와 탈퇴 시트의 완주 | F-067, F-068, E-03, E-04 | `CX-F-082(A)` |
| T-17 | 충전 시트와 5초 확인의 생명주기 | F-052 | `CX-F-083(A)` |
| T-18 | 선택 시트의 확인, 뒤로, 다시 시도, 자동 받기 effect | F-037 에서 F-040 | `CX-F-085(A)` |
| T-19 | 배송 시트와 브라우저 계정의 연결 | F-042, E-05 | `CX-F-086(A)` |
| T-20 | 검증 화면에서 계산 중 입력을 고치는 경우와 빈 회차 | F-048, E-16 | `CX-F-089(A)` |
| T-21 | 꼬리말의 언어 저장, 주소의 값 보존, 깊은 404 의 기본 경로 | F-087, F-090, E-09, E-18, E-33 | `CX-F-090(A)` |
| T-22 | 확인창을 같은 자리의 두 번 누름으로 건너뛰는 경우 | F-037, E-08 | Claude `claude-b-states.md` 12절 |
| T-23 | 지갑 내역에 열기와 받기가 보이는지 | F-062, E-06 | Claude 같은 절 |

Claude 의 "기존 시험이 없는 흐름" 열두 줄(`claude-b-states.md` 12절) 가운데 위에 없는 것: 없는 이메일과 빈 이메일의 로그인, 새로 고침 뒤의 세션, 비로그인 박스 화면과 충전 시트, 연출 중 뒤로 가기와 탭 전환, 출금의 관문과 새로 고침, 통화의 옛 저장값, 주소 직접 입력과 뒤로와 앞으로. 이것들은 Claude 가 이번에 배포 사이트에서 실행해 봤고(`harness/claude-b/`), 저장소의 자동 시험에는 없다.

---

## 8. 누가 무엇을 돌렸나

| 누가 | 무엇 | 결과가 있는 곳 |
|---|---|---|
| Codex 후반부 | 실제 `BOXES`, `HOME_BOXES`, `dropTable` 을 불러 카탈로그 수, 가격 분포, SHA-256, 확률의 합, 10회 추첨, 돈 경계값(`CX-X-001`). headless Chrome 의 격리된 출처에서 저장 한도와 후기의 두 탭(`CX-X-002`). 같은 계정의 동시 개봉과 로그아웃 사건(`CX-X-003`). `npm test` | 보고서 본문의 표. 원자료는 Codex 의 TEMP(저장소 밖) |
| Codex 전반부 | `npm test`, `tsc`, import 그래프 분석, 메모리 재현 다섯(`CX-F-006(A)` 에서 `CX-F-010(A)`), 개발 서버의 주소 여섯(`CX-F-011(A)`), 모듈 길이(`CX-F-012(A)`) | 보고서 본문. 스크립트 파일은 남기지 않았다고 적음 |
| Claude 분석 B | 배포 사이트를 Playwright 로 누른 검사 553개(통과 496, 실패 24, 본 것만 33. 실패 가운데 스크립트 사정 7, 실제로 어긋난 것 17) | `harness/claude-b/*.mjs`, `harness/claude-b/results/*.json`, `screenshots/before/claude-b/`(107장) |
| Claude 분석 A | 라우트 54개의 상태 코드, import 그래프, CSS 사용, 화면 요소 215개 | `harness/claude-a/`, `screenshots/before/claude-a/`(39장) |
| Antigravity | 라우트 이름 20개의 배치 기록 180개, 토큰 실측, 겹침 화면 여덟, 호버와 포커스 열, 개봉 연출 프레임 78장, 세 언어의 줄 비교 | `harness/agy/*.mjs`, `harness/agy/*-result.json`, `screenshots/before/agy/`, `motion/agy/` |
| 통합(이 문서) | V-1: 카탈로그 지문, 10회 추첨, 돈 경계값, 표기, 출금 취소와 지갑 내역 재현. V-2: 브라우저 계정에 보내는 요청 다섯. V-3: 기준값 검사 6개. V-4: 기준 빌드의 정적 HTML. V-5: Claude 결과 파일을 다시 셈(553, 24). V-6: Antigravity 결과 파일을 다시 셈 | 명령은 `PARITY_ISSUES.md` 0.4절. 스크립트는 `harness/consolidate-parity/`, 결과는 그 아래 `results/` |

통합 단계에서 다시 돌리지 않은 것: 배포 사이트를 누르는 검사 전부, Chrome 의 저장 한도 재현, 두 탭 재현, `npm test` 전체, `tsc`, 디자인 린트, `next build`.

---

## 9. 번호 대응

### 9.1 Codex 후반부(`codex-b-data-money.md`)의 번호가 간 곳

| 번호 | 간 곳 |
|---|---|
| `CX-S-001(B)` | 0절(조사 범위). 기능 행 없음 |
| `CX-D-001` | F-001, F-004, F-006, F-007, F-008, F-017 |
| `CX-D-002` | F-003, F-005, F-007 |
| `CX-D-003` | F-002, F-003, F-007, F-009, F-010, 6.1절 |
| `CX-D-004`, `CX-D-B001` 에서 `CX-D-B334` | F-006, F-009, F-010(박스마다의 합계 334줄은 옮겨 적지 않고 "전부 1,000,000"으로 줄였다) |
| `CX-F-001(B)` 와 a 에서 i | F-012, F-013, F-047, F-048 |
| `CX-F-002(B)` | F-011, F-012, F-085, F-095, E-31 |
| `CX-F-003(B)` | F-018 에서 F-023, F-027, F-030, F-031, 6.2절 |
| `CX-F-004(B)` | F-016, F-024, F-025, F-026, N-01 |
| `CX-M-001` 과 a 에서 o | F-028, F-035, F-036, F-043, F-050, F-051, F-056, F-057 |
| `CX-M-002` | F-037, F-038, N-10 |
| `CX-M-003` | F-026, F-052, F-053, F-054, F-055, F-084, E-41 |
| `CX-M-004` | F-033, F-056, F-058 에서 F-061, E-01, E-26 |
| `CX-M-005` | F-025, F-035, F-036, F-050, F-051, 6.3절 |
| `CX-M-006` | F-091 에서 F-093, F-095 |
| `CX-P-001` 과 a 에서 x | F-071(키 24개), F-022, F-090 |
| `CX-P-002` | F-029, F-034, F-072, F-073, E-28 |
| `CX-P-003` | F-030, F-032, F-070, E-02 |
| `CX-P-004`, `CX-P-004-a`, `CX-P-004-b` | F-031, F-064, F-074, E-07 |
| `CX-A-001` 과 a 에서 e | F-059, F-063, F-065, F-069, N-07, E-36 |
| `CX-A-002` 와 a 에서 i | F-018, F-042, F-049, F-052, F-058, F-065, F-075, `BACKLOG_STATUS.md` |
| `CX-R-001` 과 a 에서 e | F-075, F-076, F-077, F-080, F-081, F-084 |
| `CX-R-002` | F-082, F-083, F-084, E-30 |
| `CX-R-003` | F-046, F-047, F-086 |
| `CX-B-001` 에서 `CX-B-006` | `BACKLOG_STATUS.md` |
| `CX-T-001` | 7.1절 |
| `CX-T-002` 와 a 에서 o | 각 행의 "덮는 시험" 칸 |
| `CX-T-003` 과 a 에서 n | 7.2절의 T-01 에서 T-14 |
| `CX-X-001` 에서 `CX-X-003` | 8절(스크립트 원문은 옮겨 적지 않았다) |
| `CX-Z-001` 에서 `CX-Z-010` | `PARITY_ISSUES.md` C.1절에 하나씩. 이 표에서는 F-001, F-009, F-027, F-036, F-046, F-075 와 7절 |

### 9.2 Codex 전반부(`codex-a-routes-events-state.md`)의 `CX-F-` 번호가 간 곳

| 번호 | 간 곳 |
|---|---|
| `CX-F-001(A)` 에서 `CX-F-005(A)` | 7.1절과 8절(조사 범위와 실행한 명령) |
| `CX-F-006(A)` 에서 `CX-F-010(A)` | `PARITY_ISSUES.md` 의 E-07, E-03, E-04, E-05, E-06, E-02, E-01. 이 표에서는 F-064, F-067, F-068, F-042, F-062, F-030, F-058 의 검증 칸 |
| `CX-F-011(A)` | E-35 |
| `CX-F-012(A)` | F-001, F-002 |
| `CX-F-020(A)` 에서 `CX-F-033(A)` | F-071(스토어와 키), F-022, F-034, F-045, F-064, F-091, F-092 |
| `CX-F-034(A)` | F-061, E-29, E-26 |
| `CX-F-035(A)` 에서 `CX-F-048(A)` | F-071(직접 저장 접근), F-032, F-090, E-27 |
| `CX-F-049(A)`, `CX-F-050(A)` | F-063, N-07 |
| `CX-F-051(A)` 에서 `CX-F-053(A)` | F-072, E-28 |
| `CX-F-054(A)` | F-064, E-07 |
| `CX-F-060(A)` 에서 `CX-F-070(A)` | 직접 DOM 을 만지는 파일의 판단이다. 기능 행으로는 F-071(`060`), F-087(`061`), F-078(`066`), F-048(`068`). 나머지는 닿지 않는 파일이거나 결론이 "그대로 둔다"라서 Phase 2 명세의 몫이다. 결함으로 올린 것은 E-15(`066`), E-16(`068`), E-20(`067`), E-34(`061`) |
| `CX-F-080(A)` 에서 `CX-F-090(A)` | 7.2절의 T-15 에서 T-21 과 T-01, T-07, T-08, T-12 |
| `CX-F-100(A)` 에서 `CX-F-114(A)` | 스토어 소비자 색인. F-071 의 근거로만 쓰고 줄마다 옮겨 적지 않았다 |
| `CX-F-200(A)` 에서 `CX-F-255(A)` | 시험 파일 56개의 지도. 각 행의 "덮는 시험" 칸과 7.1절 |
| `CX-F-260(A)`, `CX-F-261(A)` | 7.1절, E-35 |

### 9.3 이 표로 옮기지 않은 것

| 번호 | 까닭 |
|---|---|
| `CX-R-001(A)` 에서 `CX-R-024(A)`, `CL-R-`, `CX-U-`, `CL-U-`, `AG-U-001` 에서 `AG-U-008`, `CX-I-`, `CL-I-`, `AG-S-`, `AG-I-` | 라우트, 화면 요소, 인터랙션의 목록이다. `ROUTE_INVENTORY.md`, `UI_INVENTORY.md`, `INTERACTION_MATRIX.md` 의 몫이다. 이 표에는 기능의 근거로 든 것만 있다 |
| `CX-S-001(A)` 에서 `CX-S-040(A)`, `CL-S-001` 에서 `CL-S-101` 가운데 이 표에 없는 것 | 상태 전이 명세다. `STATE_TRANSITIONS.md` 의 몫이다 |
| `AG-TOK-`, `AG-FNT-`, `AG-A-` | 디자인 토큰, 글꼴, 애니메이션 목록이다. 디자인 시스템 문서와 `motion/ANIMATION_INVENTORY.md` 의 몫이다 |
| `AG-DIF-001` 에서 `AG-DIF-010` | 픽셀 비교의 통제 요인이다. 비교 도구의 설정에 쓴다(`PARITY_ISSUES.md` N-13) |
| `CX-D-B001` 에서 `CX-D-B334` 의 줄마다의 값 | 박스마다의 상품 수, 사진 행 수, 합계다. 원문 표를 그대로 두고 여기서는 F-006, F-009 로 가리킨다 |

---

## 10. 수

| 무엇 | 수 |
|---|---|
| 기능 행(F-001 에서 F-095) | 95 |
| 상품과 박스(F-001 에서 F-017) | 17 |
| 개봉과 보상(F-018 에서 F-049) | 32 |
| 지갑과 계정(F-050 에서 F-074) | 25 |
| 후기와 신뢰 자료(F-075 에서 F-086) | 12 |
| 다국어와 통화(F-087 에서 F-095) | 9 |

지금 상태의 수(한 행에 말이 둘이면 앞의 것으로 셌다):

| 지금 상태 | 수 | 번호 |
|---|---|---|
| 구현 완료 | 71 | 아래 다섯 줄에 없는 나머지 |
| 부분 구현 | 12 | F-008, F-030, F-032, F-043, F-058, F-061, F-062, F-067, F-068, F-075, F-083, F-089 |
| 서버 미연결 | 7 | F-018, F-042, F-052, F-059, F-063, F-065, F-069 |
| 화면만 있음 | 1 | F-049 |
| 폐기됨 | 2 | F-024, F-054 |
| 지금 닿지 않음 | 2 | F-090, F-095 |
| 계획만 있음 | 0 | |
| 합계 | 95 | |

구현 완료 71건 가운데 원본의 기존 결함이 걸린 행이 있다(그 칸에 `E-` 번호를 적었다). 구현 완료는 그 결함이 없다는 뜻이 아니라 닿는 화면에서 끝까지 돈다는 뜻이다.

일치의 수:

| 일치 칸 | 수 | 번호 |
|---|---|---|
| 일치 | 64 | 아래 세 줄에 없는 나머지 |
| 한 곳만 | 23 | F-005, F-006, F-009, F-010, F-011, F-013, F-016, F-019, F-021, F-024, F-027, F-036, F-050, F-051, F-053, F-054, F-061, F-077, F-080, F-082, F-083, F-094, F-095 |
| 어긋남 | 7 | 등급만 다른 것 F-042, F-064, F-067, F-068. 본 조건이 다른 것 F-030, F-032(D-03). 저장 키 이름을 틀리게 적은 것 F-091(D-08) |
| 세는 단위만 다름 | 1 | F-007(D-11) |
| 합계 | 95 | |

한 곳만 다룬 23건 가운데 통합 단계에서 값을 다시 계산한 것은 F-009, F-019, F-021, F-036, F-051(통합 실행 V-1), 코드의 줄을 다시 읽은 것은 F-027, F-054, F-061, F-077, F-080, F-083 이다. 나머지 12건(F-005, F-006, F-010, F-011, F-013, F-016, F-024, F-050, F-053, F-082, F-094, F-095)은 그 참여자의 기록과 기준값 검사(V-3)에 기댔다.

| 무엇 | 수 |
|---|---|
| 지켜야 할 SHA-256 | 8 |
| 추첨 기준 표의 줄 | 기준값 150, Codex 의 10회 표 10(박스 둘) |
| 지금 없는 보호(T-01 에서 T-23) | 23 |
| 통합 단계에서 직접 돌린 것 | 6 |
| 기능 행이 가리키는 원본의 기존 결함 | E-01 에서 E-41 가운데 26건. 가리키지 않는 15건(E-08, E-09, E-11, E-12, E-19, E-20, E-22, E-23, E-25, E-27, E-29, E-35, E-37, E-38, E-39)은 화면과 인터랙션 쪽이거나 7.2절의 표에서만 가리킨다 |
