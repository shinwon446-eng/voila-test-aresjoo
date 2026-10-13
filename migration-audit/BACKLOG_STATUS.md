# 백로그의 지금 상태 (BACKLOG_STATUS)

2026-10-12, 통합 단계. 기준 커밋 `63445c7`, 브랜치 `migration-audit`. 루트의 문서 일곱(`STATE.md`, `RELEASE-READINESS.md`, `DECISION_LOG.md`, `IMPROVEMENT_LOOP.md`, `opening/STATE.md`, `flow/MELT_SPEC.md`, 개편 전의 `UI_INVENTORY.md`)이 말하는 기능과 계획을 지금 코드에 대응시켰다. Codex 후반부의 분류(`analysis/codex-b-data-money.md` 의 `CX-B-001` 에서 `CX-B-006`)를 그대로 옮기고, 통합 단계에서 다시 확인한 것과 분류를 바꾼 것을 적었다. `web/` 을 고치지 않았고, 커밋하지 않았고, `next build` 를 돌리지 않았다.

## 0. 읽는 법

- 번호: 분류 행은 `B-001` 부터, 문서와 코드가 어긋나는 곳은 `X-01` 부터.
- 파일 경로는 따로 적지 않으면 `web/` 아래다. 문서 경로는 저장소 뿌리 기준이다.
- 이 표는 기록이다. **계획만 있는 것을 구현하라는 뜻이 아니다**(`BRIEF.md` 2절: 없는 기능을 만들지 않는다, 계획만 있는 것을 구현하지 않는다).
- 원본의 기존 결함은 `PARITY_ISSUES.md` 의 `E-` 번호로 가리킨다.

### 0.1 분류의 말

| 말 | 뜻 |
|---|---|
| 구현 완료 | 닿는 화면에서 끝까지 돈다. 소스와 단위 시험 수준의 판단이다. 실제 기기 검수나 실제 운영 준비가 됐다는 뜻이 아니다 |
| 부분 구현 | 일부만 돈다 |
| 화면만 있음 | 화면이나 부품은 있으나 실제 자료가 흐르지 않는다 |
| 서버 미연결 | 서버가 있어야 되는 일이고 지금 배포에는 서버가 없다 |
| 계획만 있음 | 문서에만 있다. 결정을 기다리는 것도 여기에 넣었다 |
| 폐기됨 | 뒤의 결정으로 없앴거나, 거절됐거나, 중단됐다 |
| 지금 닿지 않음 | 소스에는 있으나 어느 라우트도 쓰지 않는다 |

### 0.2 확인 칸의 말

| 말 | 뜻 |
|---|---|
| 통합 확인 | 통합 단계에서 내가 코드의 그 줄을 읽었거나 직접 돌렸다. V- 번호는 `PARITY_ISSUES.md` 0.4절의 실행이다 |
| Codex | Codex 후반부가 코드에서 읽고 분류했다. 통합 단계에서 다시 열지 않았다 |
| Claude 실행, Claude 화면 | Claude 가 배포 사이트에서 실행했거나 화면에서 봤다(`harness/claude-b/`, `screenshots/before/`) |

---

## 1. 분류

### 1.1 `STATE.md` (중단된 24시간 랩의 기록)

| 번호 | 기능 또는 계획 | 문서 근거 | 분류 | 코드 근거 또는 까닭 | Codex 의 번호와 분류 | 확인 |
|---|---|---|---|---|---|---|
| B-001 | 24시간 자율 개선 랩의 다음 사이클 | `STATE.md:1`, `opening/STATE.md:4` | 폐기됨 | 문서가 스스로 중단을 적고 다음 사이클 계획을 실행하지 않는다고 적는다 | `CX-B-001-a` 폐기됨 | 통합 확인(문서의 두 줄) |
| B-002 | 수동 검증 화면 `/verify` 신설 | `STATE.md:21`, `IMPROVEMENT_LOOP.md:16` | 구현 완료 | `components/verify/VerifyScreen.tsx:57-68` | `CX-B-001-b` 구현 완료 | 통합 확인. Claude 실행 07:v1. 입력을 고친 뒤 앞의 결과가 남는다(E-16) |
| B-003 | 세션 만료 안내 한 줄 | `STATE.md:24`, `IMPROVEMENT_LOOP.md:50` | 구현 완료 | `components/shell/StateScreens.tsx:36-43`, `stores/authStore.ts:114-126` | `CX-B-001-c` 구현 완료 | 통합 확인. Claude 실행 01:n5. 다른 탭의 변화는 즉시 전해지지 않는다(E-07) |
| B-004 | 약관 새 디자인, 계정 관리 시트 셋, 출금 관문 시트 | `STATE.md:24, 26`, `IMPROVEMENT_LOOP.md:50, 70` | 부분 구현 | 약관 화면(`components/legal/LegalCenterScreen.tsx`, `LegalDocScreen.tsx`)과 출금 관문(`components/wallet/WithdrawScreen.tsx:179-183`)과 닉네임 시트는 돈다. 비밀번호 시트(`components/account/AccountSheets.tsx:57-64`)와 탈퇴 시트(`:88-93`)는 언제나 거절된다(E-03, E-04) | `CX-B-001-d` 구현 완료 | 통합 확인(V-2: 둘 다 `verification_required`). **분류를 바꿨다**(2절) |
| B-005 | 옛 주소 다섯을 "옮긴 화면" 안내로 | `STATE.md:28`, `IMPROVEMENT_LOOP.md:92` | 구현 완료 | `app/[locale]/about/page.tsx`, `community/page.tsx`, `community/board/page.tsx`, `fairness/page.tsx`, `profile/page.tsx` 가 전부 `MovedScreen` 을 쓴다 | `CX-B-001-e` 구현 완료 | 통합 확인(다섯 파일의 검색) |
| B-006 | 상품 사진의 확보와 생성 | `STATE.md:22, 31-34` | 부분 구현 | 고유 상품 21,007 가운데 사진 있는 것 8,509. `lib/productImages.ts:114` | `CX-B-001-f` 부분 구현 | 통합 확인(V-1 이 같은 수) |
| B-007 | 포켓몬 카드 생성 시험 67장 | `STATE.md:32`, `DECISION_LOG.md:31` | 폐기됨 | 이미지 도구가 거절했고 만들어진 한 장은 폐기했다고 문서가 적는다. 지금의 리자몽 사진 경로는 따로다(`lib/productImages.ts:55`) | `CX-B-001-g` 폐기됨 | Codex |
| B-008 | 홈 카드의 비교 정보 한 줄을 A 와 B 로 견주기(사이클 11 계획) | `STATE.md:35`, `DECISION_LOG.md:48` | 계획만 있음 | 랩이 중단돼 실행되지 않았다. 지금 홈은 새 실물 박스 목록이다(`components/box/BoxList.tsx:56`) | `CX-B-001-h` 계획만 있음 | Codex |
| B-009 | 충전 주소와 배송의 실제 접수 | `STATE.md:18`, `DECISION_LOG.md:67` | 서버 미연결 | `lib/browserAccount.ts:156-158, 339`, `lib/claim.ts:36` | `CX-B-001-i` 서버 미연결 | 통합 확인(V-2: 주소는 `invalid`, 배송은 `unavailable`). E-05, E-10 |
| B-010 | 실제 기기와 글자 확대에서 다시 검수 | `opening/STATE.md:49` | 계획만 있음 | 이번의 Node 와 headless 실행으로 끝난 것으로 치지 않는다 | `CX-B-001-j` 계획만 있음 | Codex |
| B-011 | 인증 앱 부품의 새 디자인 | `STATE.md:25`, `IMPROVEMENT_LOOP.md:60` | 구현 완료 | `components/wallet/TwoFactorSetup.tsx`(계정 화면과 출금 화면이 쓴다) | Codex 의 표에 없음 | Claude 실행 03:a3(스크린샷 `screenshots/before/claude-b/03-a3-totp-setup.png`). 브라우저 계정은 켤 때 6자리 형식만 본다 |
| B-012 | 오프라인 한 줄 | `IMPROVEMENT_LOOP.md:50` | 구현 완료 | `components/shell/StateScreens.tsx:45-57` | Codex 의 표에 없음 | 통합 확인. Claude 실행 01:n5 |

### 1.2 `RELEASE-READINESS.md` (2026-09-29, 개편 전의 출시 준비 기록)

| 번호 | 기능 또는 계획 | 문서 근거 | 분류 | 코드 근거 또는 까닭 | Codex 의 번호와 분류 | 확인 |
|---|---|---|---|---|---|---|
| B-013 | 구매 뒤 결과 전부를 먼저 적기, X 와 SKIP 에서 결과 유지 | `RELEASE-READINESS.md:7` | 구현 완료 | `lib/opening.ts:90-98`, `tests/opening.test.ts:20` | `CX-B-002-a` 구현 완료 | 통합 확인. Claude 실행 04:o4 |
| B-014 | 잔액이 모자랄 때 충전으로 잇기 | `RELEASE-READINESS.md:8` | 구현 완료 | `lib/takeBatch.ts:200`, `components/box/Reveal.tsx:143-147` | `CX-B-002-b` 구현 완료 | Claude 실행 04:o7, 10:m1. 충전 자체는 배포에서 주소를 내지 못한다(E-10) |
| B-015 | 과거 기록을 그때의 확률표로 검증, 표가 없으면 불완전 | `RELEASE-READINESS.md:5` | 구현 완료 | `components/fairness/verifyRecord.ts:44-55` | `CX-B-002-c` 구현 완료 | 통합 확인(`itemMatch` 가 표 없으면 null) |
| B-016 | 배송 준비 취소와 배송비의 원천 반환 | `RELEASE-READINESS.md:6, 39` | 부분 구현 | `lib/claim.ts:53-74`. 로컬 취소 식은 있고, 새 배송 신청이 서버 없이는 되지 않아 미리 있던 기록에서만 닿는다 | `CX-B-002-d` 부분 구현 | 통합 확인. Claude 실행 12:x2 |
| B-017 | 서버 이메일 인증, 세션, 실제 로그인 | `RELEASE-READINESS.md:18` | 서버 미연결 | `lib/account.ts:109-111`. 브라우저 계정이 대신 돈다 | `CX-B-002-e` 서버 미연결 | 통합 확인(V-2) |
| B-018 | 서버가 가진 추첨 비밀값과 사전 약속 | `RELEASE-READINESS.md:19` | 서버 미연결 | `stores/fairStore.ts:40-52`(브라우저가 시드를 만든다) | `CX-B-002-f` 서버 미연결 | 통합 확인 |
| B-019 | 서버 거래의 원자성, 백업, 기기 변경 복구 | `RELEASE-READINESS.md:20, 83`, `flow/MELT_SPEC.md:132` | 계획만 있음 | `lib/opening.ts:66-110`(여러 번의 쓰기), `lib/takeBatch.ts:39-41`. E-32 | `CX-B-002-g` 계획만 있음 | 통합 확인 |
| B-020 | 결제, 출금, 원결제 반환, 공급과 배송 서비스 | `RELEASE-READINESS.md:21, 77-79` | 서버 미연결 | `lib/api.ts:49, 56`. 문서가 든 `web/lib/payments.ts` 는 지금 없다(X-13) | `CX-B-002-h` 서버 미연결 | 통합 확인(파일 없음) |
| B-021 | 공개 후기 서버, 신고와 권리 요청의 운영 | `RELEASE-READINESS.md:80` | 부분 구현 | `lib/communityReviewApi.ts:29-37`(서버 주소가 비면 빈 배열, 올리기는 `unavailable`). 이 기기의 후기 쓰기는 돈다 | `CX-B-002-i` 부분 구현 | 통합 확인 |
| B-022 | 보관함의 검색, 유형과 기간 필터, 정렬 | `RELEASE-READINESS.md:59` | 폐기됨 | 지금 보관함은 탭 셋뿐이다(`lib/vault.ts:3`, `components/inventory/InventoryScreen.tsx:45`) | `CX-B-002-j` 폐기됨 | 통합 확인(탭의 정의) |
| B-023 | 내 후기의 검색, 별점과 사진 필터, 수정과 삭제 | `RELEASE-READINESS.md:62` | 부분 구현 | 스토어에 고치기와 지우기 액션은 있다(`stores/communityStore.ts:40, 48`). 지금 화면은 박스로 거르기와 상세 보기뿐이다(`components/box/ReviewsScreen.tsx:21-27`) | `CX-B-002-k` 부분 구현 | Codex. 통합은 `ReviewsScreen.tsx` 만 읽음 |
| B-024 | 실제 서비스 지역, 운영 사업자, 개인정보 체계 | `RELEASE-READINESS.md:81, 82` | 계획만 있음 | 코드로 대응되는 것이 없다 | `CX-B-002-l` 계획만 있음 | Codex |
| B-025 | 탈퇴 조건(두 잔액, 보관 상품, 배송, 미완료 거래를 따로 안내) | `RELEASE-READINESS.md:10` | 부분 구현 | 서비스의 규칙은 있다(`lib/browserAccount.ts:57-63`, `lib/account.ts:274`). 닿는 탈퇴 시트는 언제나 거절된다(E-04). 조건을 안내하던 옛 화면 `components/auth/AccountClosureFlow.tsx` 는 지금 닿지 않는다 | Codex 의 표에 없음(X-05 로만 다룸) | 통합 확인(V-2) |
| B-026 | 푸터에 13개 정책 링크를 하나로 통합 | `RELEASE-READINESS.md:56` | 폐기됨 | 지금 꼬리말은 "약관과 정책" 링크 하나다(`components/shell/AppFooter.tsx:56-58`). 문서 13개는 `/legal` 목록에서 간다(구현 완료, Codex `CX-F-012(A)`: 법률 문서 13) | Codex 의 표에 없음 | 통합 확인 |
| B-027 | 보관함을 보유, 배송 관리, 처리 내역으로 나누기 | `RELEASE-READINESS.md:57` | 구현 완료 | 탭 셋 `held`, `shipping`, `done`(`lib/vault.ts:3`) | Codex 의 표에 없음 | 통합 확인. Claude 실행 05:t1 |
| B-028 | 중국어 HTML 언어 태그 `zh-Hans` | `RELEASE-READINESS.md:68, 94` | 부분 구현 | 뜬 뒤에만 바뀐다(`components/layout/LocaleHtmlLang.tsx:7-11`). 정적 HTML 은 `ko` 다(E-13) | Codex 의 표에 없음 | 통합 확인(V-4) |
| B-029 | 푸터에서 언어를 바꾸면 지금 경로 유지 | `RELEASE-READINESS.md:94` | 구현 완료 | `components/shell/AppFooter.tsx:61`. 주소의 값은 버린다(E-33), 고른 언어는 저장되지 않는다(E-18) | Codex 의 표에 없음 | 통합 확인. Claude 실행 01:n3 |
| B-030 | 새 후기 작성에 따른 잔액 보상 없애기 | `RELEASE-READINESS.md:64` | 구현 완료 | `components/flow/ReviewSheet.tsx:49`(보너스 0), `stores/communityStore.ts:36`. 상수 `REVIEW_BONUS_USDT` 는 남아 있다(`lib/community.ts:10`) | Codex 의 표에 없음(`CX-M-003` 이 사실만 적음) | 통합 확인 |
| B-031 | 수령 완료 뒤에만 새 후기 작성 | `RELEASE-READINESS.md:63` | 폐기됨 | 뒤의 결정으로 바뀌었다(`DECISION_LOG.md:8, 90`: 받기 전 후기를 받아들임). 지금은 보관 단계도 된다(`lib/community.ts:57-59`) | `CX-B-006-c` 로만 다룸 | 통합 확인 |
| B-032 | 미연결 배송 접수의 개인정보 입력 차단, 정적 미리보기의 출금 신청 차단 | `RELEASE-READINESS.md:65, 94` | 폐기됨 | 지금은 주소 입력이 열려 있고(`components/flow/ShipSheet.tsx:64`) 출금은 접수 뒤 로컬 잔액을 차감한다(`components/wallet/WithdrawScreen.tsx:123`) | `CX-B-006-d` 로만 다룸 | 통합 확인(뒤의 줄) |
| B-033 | 옛 확률(최소 캐시백 49%, 두 배 49%, 나머지 2%)과 그 기대 지급액 표 | `RELEASE-READINESS.md:11, 22-37` | 폐기됨 | 확률표가 두 번 바뀌었다. 지금은 새 박스 320개의 실물 표와 옛 박스 14개의 사다리와 터짐(`lib/products.ts:154, 259, 324`) | `CX-B-006-b` 로만 다룸 | 통합 확인(기준값의 표 버전 둘) |
| B-034 | 상업 운영용 호스팅(서버, DB, 비밀키, 모니터링, 백업) | `RELEASE-READINESS.md:83` | 계획만 있음 | 지금은 GitHub Pages 정적 배포다(`.github/workflows/deploy-pages.yml`, `ARCHITECTURE.md` 6절) | Codex 의 표에 없음 | 통합은 `ARCHITECTURE.md` 만 읽음 |

### 1.3 `DECISION_LOG.md` 와 `IMPROVEMENT_LOOP.md`

| 번호 | 기능 또는 계획 | 문서 근거 | 분류 | 코드 근거 또는 까닭 | Codex 의 번호와 분류 | 확인 |
|---|---|---|---|---|---|---|
| B-035 | 사진 띠와 확률, 상품 비교 | `DECISION_LOG.md:6, 19, 95` | 부분 구현 | `components/box/BoxScreen.tsx:94, 100, 306`. 띠는 지금 대표 사진 한 장이다 | `CX-B-003-a` 부분 구현 | Codex |
| B-036 | 개봉 후기와 수령 확인 후기를 표시로 가르기 | `DECISION_LOG.md:6, 90` | 부분 구현 | `lib/community.ts:57`, `components/box/BoxReviews.tsx:119`. 지금 카드에는 배송 상태 표시가 없다 | `CX-B-003-b` 부분 구현 | Codex |
| B-037 | 결과에서 여러 개를 한 번에 받기 | `DECISION_LOG.md:6` | 구현 완료 | `components/box/Reveal.tsx:139`, `lib/takeBatch.ts:316` | `CX-B-003-c` 구현 완료 | 통합 확인. Claude 실행 04:o5 |
| B-038 | 용어 통일(정가, 참고가, 상품가) | `DECISION_LOG.md:71, 87`, `flow/MELT_SPEC.md:129` | 구현 완료 | 마지막 결정은 "참고가"를 쓰지 않고 "상품가"다. `messages/v.ko.json` 에 "참고가"는 0곳, "상품가"는 23줄 | `CX-B-003-d` 구현 완료 | 통합 확인(검색) |
| B-039 | 모든 사진을 같은 스튜디오 톤으로 | `DECISION_LOG.md:9, 36` | 부분 구현 | `lib/productImages.ts:104, 138`. 사진마다의 톤은 이번에 아무도 보지 않았다 | `CX-B-003-e` 부분 구현 | Codex |
| B-040 | 실제 사진을 먼저 쓰고, 생성한 이미지는 상품 시트에 한 줄로 알리기 | `DECISION_LOG.md:36, 38` | 구현 완료 | `lib/productImages.ts:114, 145`, `components/box/BoxScreen.tsx:285`, 문구 `genNote`(`messages/v.ko.json:69`) | `CX-B-003-f` 구현 완료 | 통합 확인(문구) |
| B-041 | 미국형 충전기 플러그와 TV 각도로 다시 만들기 | `DECISION_LOG.md:27, 32` | 계획만 있음 | 다음에 다시 만들 때의 후보로만 적혀 있다 | `CX-B-003-g` 계획만 있음 | Codex |
| B-042 | 박스마다의 시장가 출처, 실제 배송 기간과 세금 | `DECISION_LOG.md:46, 47, 63, 74` | 계획만 있음 | 운영 정책과 출처 자료가 없어 적지 않기로 했다(거절). 운영자가 자료를 주면 그때 한 줄을 더한다고 적혀 있다 | `CX-B-003-h` 서버 미연결 | Codex. **분류를 바꿨다**(2절) |
| B-043 | 수량 알약을 접기, 사진 띠를 뒤로 보내기 | `DECISION_LOG.md:15, 19, 77, 85` | 폐기됨 | 네 번 거절됐다. 수량 다섯 알약은 그대로다(Claude 의 결과 파일에 "1개 5개 10개 50개 100개") | `CX-B-003-i` 폐기됨 | 통합 확인(결과 파일을 읽음) |
| B-044 | 다음 사이클 계획과 화면 점수 올리기 | `IMPROVEMENT_LOOP.md:35, 46, 56, 77, 88, 99, 121`, `STATE.md:1` | 폐기됨 | 랩 중단. 끝낸 코드는 위아래 행으로 따로 적었다 | `CX-B-003-j` 폐기됨 | Codex |
| B-045 | 사진 추가 묶음 87, 62, 349장 | `IMPROVEMENT_LOOP.md:125, 134, 143` | 부분 구현 | `lib/productImages.ts:114`. 그때의 생성 작업이 끝난 것과 새 320개 박스의 사진이 채워진 것은 다른 일이다(B-006) | `CX-B-003-k` 부분 구현 | Codex |
| B-046 | 상품 시트의 "배송 가능 나라 보기" | `DECISION_LOG.md:74` | 구현 완료 | 문구 `countriesLink`, `countriesHide`, `shipFeeV`(`messages/v.ko.json:84-86`) | Codex 의 표에 없음 | 통합 확인(문구). Claude 실행 02:b1 |
| B-047 | 문구와 배치의 세부 결정(사이클 1 에서 10 의 ACCEPT 들: 흔한 결과 문장, 기대 가치 비율의 설명, 검색 행의 가격, 보관함 행의 금액과 화살표, 검증 행의 단서, 로그아웃을 밑줄 링크로) | `DECISION_LOG.md:14-18, 43-45, 52-54, 71-76, 81-92` | 구현 완료 | 그때 반영됐다고 문서가 적는다. 그 뒤 `flow/MELT_SPEC.md`(2026-10-12)가 여러 화면을 다시 짰다 | Codex 의 표에 없음 | 줄마다 확인하지 않았다. 지금 화면의 문구와 배치는 `UI_INVENTORY.md`(새 것)의 몫이다 |

### 1.4 `opening/STATE.md` (개봉 경험 임무)

| 번호 | 기능 또는 계획 | 문서 근거 | 분류 | 코드 근거 또는 까닭 | Codex 의 번호와 분류 | 확인 |
|---|---|---|---|---|---|---|
| B-048 | 개봉 연출, 소리와 진동, 짧게 보기 | `opening/STATE.md:28, 39` | 구현 완료 | `lib/openingFlow.ts:62-71`, `components/box/Opening.tsx:86` | `CX-B-004-a` 구현 완료 | 통합 확인(시간 값). Antigravity 가 프레임으로 잼. 실제 소리와 진동은 아무도 확인하지 못함 |
| B-049 | 다음 열기 자동 결제, 근접 실패, 낮은 결과에 높은 등급 신호 | `opening/STATE.md:6`, `flow/MELT_SPEC.md:15, 93` | 폐기됨 | 하지 않기로 한 것이다. 지금 `lib/opening.ts` 에 결과를 다시 짜는 코드가 없다 | `CX-B-004-b` 폐기됨 | 통합 확인(`lib/opening.ts:44-117` 을 읽음) |
| B-050 | 옛 자동 열기, 룰렛, 대량 개봉 화면 | `UI_INVENTORY.md:357-402` | 지금 닿지 않음 | `components/box/DetailModal.tsx:34`, `components/unboxing/UnboxingRoulette.tsx:64`. 지금은 `components/box/BoxScreen.tsx:319-320` 이 새 `Opening` 과 `Reveal` 을 쓴다 | `CX-B-004-c` 지금 닿지 않음 | Claude 와 Codex 의 닿지 않는 파일 목록이 같다(`CL-I-240` 에서 `CL-I-243`) |
| B-051 | 확률 모델 세 제안 | `opening/STATE.md:14, 29` | 계획만 있음 | 제안만이다. 승인 뒤 실제로 들어간 것은 B-052 | `CX-B-004-d` 계획만 있음 | Codex |
| B-052 | 사다리와 터짐 게이지 | `opening/STATE.md:52-54` | 구현 완료 | `lib/burst.ts:10`, `lib/products.ts:208`. 홈에서 내려간 옛 박스 14개에만 적용된다 | `CX-B-004-e` 구현 완료 | 통합 확인(기준값의 `burst`: id `wave-burst`, 6,250칸, 시작 10배, 쌓임 0.1배) |
| B-053 | 반복 2 뒤의 재검수, 실제 휴대폰, iOS, 가로 화면, 큰 글자 | `opening/STATE.md:36, 49` | 계획만 있음 | 하지 않았다고 문서가 적는다 | `CX-B-004-f` 계획만 있음 | Codex |
| B-054 | 녹화(ffmpeg)와 상자 그림 자산 | `opening/STATE.md:21, 46` | 계획만 있음 | 파운더가 정할 것으로 남아 있다. 지금 상자는 CSS 면이다(`components/box/Opening.tsx:50`) | `CX-B-004-g` 계획만 있음 | Codex |
| B-055 | 결과는 독립 추첨, 연속 흐름을 짜 넣지 않음 | `opening/STATE.md:57` | 구현 완료 | `lib/opening.ts:58-63` | Codex 의 표에 없음(`CX-F-003(B)` 가 식을 적음) | 통합 확인 |
| B-056 | 두 배 이상이면 배수를 적기, 여럿 결과에서 가장 큰 결과를 위로 | `opening/STATE.md:58` | 구현 완료 | `lib/openingFlow.ts:134`(`timesOf`), `app/opening.css:148`(가장 큰 결과의 사진 칸) | Codex 의 표에 없음 | 통합은 함수와 클래스가 있는 것만 확인. Claude 실행 04:o5 |
| B-057 | 자금 출처의 0.01 반올림을 어떻게 할지 | `opening/STATE.md:46` | 계획만 있음 | 파운더가 정할 것이다. 지금 값은 crypto 를 먼저 반올림한다(`lib/funding.ts:63-73`, `FEATURE_PARITY.md` F-036). 정하기 전에는 바꾸지 않는다 | Codex 의 표에 없음(`CX-M-005` 가 값을 적음) | 통합 확인(V-1: 0.01 을 반씩 나누면 crypto 0.01, card 0) |

### 1.5 `flow/MELT_SPEC.md` (2026-10-12 확정, 가장 새 설계 문서)

| 번호 | 기능 또는 계획 | 문서 근거 | 분류 | 코드 근거 또는 까닭 | Codex 의 번호와 분류 | 확인 |
|---|---|---|---|---|---|---|
| B-058 | S1 선택 시트, 확인 한 번, 일부와 실패의 판정 | `flow/MELT_SPEC.md:21, 120` | 구현 완료 | `components/flow/TakeSheet.tsx`, `lib/takeBatch.ts:316` | `CX-B-005-a` 구현 완료 | Claude 실행 05:t1, 05:t6. 모바일 폭에서 확인창을 건너뛸 수 있다(E-08) |
| B-059 | S2 한 개 결과에서 받기, 보관, 검증 | `flow/MELT_SPEC.md:33` | 구현 완료 | `components/box/Opening.tsx:155, 175` | `CX-B-005-b` 구현 완료 | Claude 실행 04:o3 |
| B-060 | S3 여럿 결과에서 받기, 20배 미만은 미리 고르기 | `flow/MELT_SPEC.md:43, 116` | 구현 완료 | `components/box/Reveal.tsx:135-140` | `CX-B-005-c` 구현 완료 | 통합 확인 |
| B-061 | S4 잔액이 모자란 자리에서 받기 또는 충전 | `flow/MELT_SPEC.md:48, 115` | 구현 완료 | `lib/takeBatch.ts:200`, `components/box/Reveal.tsx:147` | `CX-B-005-d` 구현 완료 | Claude 실행 04:o7 |
| B-062 | S5 보관함에서 받기가 주 단추, 배송은 밑줄 링크 | `flow/MELT_SPEC.md:54` | 구현 완료 | `components/inventory/InventoryScreen.tsx:168-172`. 배송 자체는 서버 미연결(B-009) | `CX-B-005-e` 구현 완료 | 통합 확인 |
| B-063 | S6 어느 화면에서나 잔액 시트 | `flow/MELT_SPEC.md:59, 124` | 구현 완료 | `components/shell/AppShell.tsx:52-53`, `components/flow/BalanceSheet.tsx:20` | `CX-B-005-f` 구현 완료 | 통합 확인. Claude 실행 05:t4 |
| B-064 | S7 방금 받은 crypto 몫을 출금 금액 칸에 채우기 | `flow/MELT_SPEC.md:66` | 구현 완료 | `components/wallet/WithdrawScreen.tsx:84-101`, `lib/takeBatch.ts:451` | `CX-B-005-g` 구현 완료 | 통합 확인. Claude 실행 06:w4 |
| B-065 | S8 나온 상품(2배 이상, 그때의 가격, 무료 표시) | `flow/MELT_SPEC.md:72, 126` | 구현 완료 | `lib/wins.ts:55-56, 71, 91-98` | `CX-B-005-h` 구현 완료 | 통합 확인. Claude 실행 07:v2 |
| B-066 | S9 기록 검증의 세 단계와 블록체인 상태 부품 | `flow/MELT_SPEC.md:82` | 부분 구현 | `components/fairness/verifyRecord.ts:44-55`. 블록체인 기록은 언제나 없음이다(`lib/chainRecord.ts:26-31`) | `CX-B-005-i` 부분 구현 | 통합 확인 |
| B-067 | 블록체인 상태 `confirmed`, `pending`, `mismatch`, `error` 의 모습 | `flow/MELT_SPEC.md:85, 87` | 화면만 있음 | `lib/chainRecord.ts:55`. 개발용 갤러리의 고정 자료에만 쓴다 | `CX-B-005-j` 화면만 있음 | Claude 실행 11(개발 서버) |
| B-068 | 실제 블록체인에 사전 약속을 올리고 읽기 | `flow/MELT_SPEC.md:86, 125` | 서버 미연결 | `lib/chainRecord.ts:29-31` | `CX-B-005-k` 서버 미연결 | 통합 확인 |
| B-069 | Loop, 릴 연출, RACE, LIVE DROPS, XP, 프로모션 코드, 추천 보상, 카드와 Google Pay 충전, 신분 인증 등급, 무료로 돌려 보기 | `flow/MELT_SPEC.md:93` | 폐기됨 | 넣지 않기로 한 것이다. 옛 순수 함수와 부품이 남아 있어도 되살리지 않는다 | `CX-B-005-l` 폐기됨 | 통합 확인(충전 시트에 카드 탭 없음: `components/flow/ChargeSheet.tsx:45`) |
| B-070 | 업그레이드(배수를 걸어 다시 거는 것) | `flow/MELT_SPEC.md:94` | 계획만 있음 | 파운더가 정한 뒤에 한다고 적혀 있다. 새 돈 계산이라 이번에 만들지 않는다 | `CX-B-005-m` 계획만 있음 | Codex |
| B-071 | 후기 샘플 정리, 출금의 이용 기준 검사, 장부를 한 번에 확정하는 저장 | `flow/MELT_SPEC.md:95, 132` | 계획만 있음 | 범위 밖으로 남겨 파운더에게 보고한 것이다. 각각 E-30, E-26, E-32. 후기 샘플은 그 뒤 `BRIEF.md` 2절의 결정으로 방향이 바뀌었다(샘플 후기 생성기를 따로 만들어 합친다) | `CX-B-005-n` 계획만 있음 | 통합 확인(세 결함의 코드) |
| B-072 | R8 저장이 중간에 실패했을 때 저장 상태를 다시 읽어 판정 | `flow/MELT_SPEC.md:120` | 부분 구현 | 받기에는 있다(`lib/takeBatch.ts:356-376`). 개봉에는 없다(E-02) | Codex 의 표에 없음(`CX-M-002` 가 받기 쪽을 적음) | Claude 실행 05:t6. 개봉 쪽은 Codex 실행 |
| B-073 | R10 돈이 움직이는 코드를 한 벌로 | `flow/MELT_SPEC.md:122` | 구현 완료 | `lib/openingSettle.ts:21`(`settleTake` 가 `settleTakeMany` 를 부른다), `lib/takeBatch.ts:154`(`takeAmountOf`) | Codex 의 표에 없음(`CX-M-002`) | 통합은 `takeAmountOf` 만 확인 |
| B-074 | R12 로그인 전에는 머리 단추가 로그인 창을 연다 | `flow/MELT_SPEC.md:124` | 구현 완료 | `components/shell/AppShell.tsx:53` | Codex 의 표에 없음 | 통합 확인 |
| B-075 | R14 무료 여부를 모르는 옛 기록은 "기록 없음", 검증은 보관 상품의 id 로 | `flow/MELT_SPEC.md:126` | 구현 완료 | `lib/wins.ts:70-71`, `components/fairness/verifyRecord.ts:38-41` | Codex 의 표에 없음(`CX-R-003`) | 통합 확인(`recordToVerify`) |
| B-076 | R15 접근성 속성(`aria-haspopup`, 메뉴 단추의 `aria-expanded`) | `flow/MELT_SPEC.md:127` | 구현 완료 | `components/shell/AppShell.tsx:52, 54` | Codex 의 표에 없음 | 통합 확인 |
| B-077 | 복구한 결과에서 검증을 열 때 그때의 확률표를 쓴다 | `flow/MELT_SPEC.md:90` | 부분 구현 | 기록 검증은 그때의 표를 쓴다. 복구한 결과 화면의 "나올 확률"과 후기의 검증 링크는 지금 표다(E-31) | `CX-F-002(B)`, `CX-T-003-k` | 통합 확인(`components/box/BoxScreen.tsx:125-131`) |

### 1.6 개편 전의 `UI_INVENTORY.md` (2026-10-10, 지금 화면의 기준이 아니다)

이 문서의 화면은 거의 다 개편으로 바뀌었다. 줄마다가 아니라 절 단위로 적는다. 닿지 않는 파일의 전체 목록은 Codex 전반부 9.1절(97개)과 Claude `claude-b-interactions.md` 8절(`CL-I-240` 에서 `CL-I-259`), `claude-a-ui.md` 6절에 있다.

| 번호 | 옛 문서의 기능 | 문서 근거 | 분류 | 코드 근거 또는 까닭 | Codex 의 번호와 분류 | 확인 |
|---|---|---|---|---|---|---|
| B-078 | 옛 홈(카테고리 탭, 스킨 `?skin=netflix` 와 `?skin=commerce`) | `UI_INVENTORY.md:34, 110-139` | 지금 닿지 않음 | `components/home/NetflixHome.tsx`, `CommerceHome.tsx`, `QuickTabs.tsx`. `skin` 값을 읽는 코드가 닿는 소스에 없다(Claude). 홈은 `BoxList` 하나다 | Codex 의 표에 없음(`CX-Z` 의 열째 항목) | Claude(`CLA-옛문서-03`). 통합은 다시 검색하지 않음 |
| B-079 | 옛 상품 상세 창 | `UI_INVENTORY.md:38, 110-139` | 지금 닿지 않음 | `components/box/DetailModal.tsx`(가져오는 곳 없음). 박스마다 주소가 있는 화면으로 바뀌었다 | Codex 의 표에 없음 | Claude(`CL-I-243`, `CLA-옛문서-04`) |
| B-080 | 옛 로그인 창, 프로필, 보안, 탈퇴 화면(아바타 바꾸기, 단계를 다 밟는 비밀번호 변경과 탈퇴 포함) | `UI_INVENTORY.md:140-201` | 지금 닿지 않음 | `components/auth/AuthModal.tsx`, `HeaderAuthControl.tsx`, `NicknameSettings.tsx`, `AvatarSettings.tsx`, `SecuritySettings.tsx`, `PasswordChangeFlow.tsx`, `AccountClosureFlow.tsx`. 아바타 바꾸기는 지금 화면에 없다 | `CX-B-001-d` 의 근거로 잘못 쓰임(2절) | 통합 확인(가져오는 곳 검색: 서로와 닿지 않는 파일뿐). Claude(`CL-I-250` 에서 `CL-I-254`) |
| B-081 | 옛 지갑 창(USDT, 출금, 내역 탭) | `UI_INVENTORY.md:202-245` | 지금 닿지 않음 | `components/wallet/DepositModal.tsx`, `WithdrawTab.tsx`, `HistoryTab.tsx`, `UsdtDepositTab.tsx`, `WithdrawalModal.tsx`(서로만 가져온다) | Codex 의 표에 없음 | 통합 확인(검색). Claude(`CL-I-258`) |
| B-082 | 옛 보관함의 창들(배송, 배송 취소, 판매 확인, 추적) | `UI_INVENTORY.md:246-280` | 지금 닿지 않음 | `components/inventory/DeliveryModal.tsx`, `CancelShipmentModal.tsx`, `SellConfirmModal.tsx`, `TrackingModal.tsx` | Codex 의 표에 없음 | Claude(`CL-I-257`) |
| B-083 | 게시판과 옛 후기 창 | `UI_INVENTORY.md:281-321` | 지금 닿지 않음 | `components/community/CommunityBoard.tsx`, `BoardComposer.tsx`, `ReviewFormModal.tsx`. `/community/board` 는 옮긴 화면 안내다 | Codex 의 표에 없음 | 통합 확인(라우트 파일). Claude(`CL-I-255`) |
| B-084 | 소개 화면과 옛 공정성 화면 | `UI_INVENTORY.md:322-356` | 지금 닿지 않음 | `components/about/*`, `components/fairness/FairnessVerifier.tsx`, `VisualVerifier.tsx`, `HashExplainer.tsx`, `ProofFeed.tsx`. `/about` 과 `/fairness` 는 옮긴 화면 안내다 | Codex 의 표에 없음 | 통합 확인(라우트 파일). Claude(`CL-I-249`, `CL-I-256`) |
| B-085 | 옛 개봉, 자동 열기, 대량 개봉, 하루 무료 상자, 효과(`MegaWinFX`, `UpgradeFX`) | `UI_INVENTORY.md:357-402` | 지금 닿지 않음 | `components/unboxing/*`, `components/home/DailyFreeBox.tsx`. B-050 과 같은 묶음이다 | `CX-B-004-c` 지금 닿지 않음 | 통합 확인(`MegaWinFX` 를 가져오는 곳은 `components/unboxing` 안뿐). Claude(`CL-I-240` 에서 `CL-I-242`, `CL-I-247`) |
| B-086 | 그때도 어느 화면에 붙어 있지 않던 UI 17개(순위, 라이브 티커, 인기 상자 등) | `UI_INVENTORY.md:610-632` | 지금 닿지 않음 | `components/home/HallOfFame.tsx`, `LiveTicker.tsx`, `HotBoxes.tsx` 등 | Codex 의 표에 없음 | 통합 확인(`LiveTicker` 검색). Claude(`CL-I-248`) |
| B-087 | "404, 오류, 오프라인, 세션 만료 화면이 아예 없다" | `UI_INVENTORY.md:25` | 구현 완료 | 지금은 있다: `app/not-found.tsx`, `components/shell/StateScreens.tsx:36-57`, 언어 안의 없는 주소 화면과 오류 화면(Claude `CL-R-020` 에서 `CL-R-022`) | Codex 의 표에 없음 | 통합 확인(두 파일). 없는 주소 화면의 링크는 E-09 |
| B-088 | 금액을 정수로 반올림해 0.5 USDT 가 "1 USDT" 로 보이던 문제 | `UI_INVENTORY.md:31` | 구현 완료 | 고쳐졌다. 소수 둘째 자리까지 적는다(`lib/formatCurrency.ts:18-25`) | Codex 의 표에 없음 | 통합 확인(V-1: 0.5 는 `$0.5` 와 ₩690) |
| B-089 | 이름과 맞지 않던 범용 스톡 사진 35장 | `UI_INVENTORY.md:32`, `DECISION_LOG.md:55, 59` | 부분 구현 | 사진 체계가 바뀌었다(스튜디오 변환, 생성 이미지, B-006). 사진의 내용이 이름과 맞는지는 이번에 아무도 판정하지 않았다 | Codex 의 표에 없음(`CX-T-003-n`) | 확인하지 않음 |
| B-090 | 검증 기능의 이름이 세 개이던 문제 | `UI_INVENTORY.md:43`, `flow/MELT_SPEC.md:17` | 구현 완료 | 메뉴와 링크의 이름이 "개봉 결과 검증" 하나다(문구 키 `nav.verify`) | Codex 의 표에 없음 | Claude 화면(메뉴 일곱 개의 글). 통합은 결과 파일의 글에서 읽음 |

---

## 2. Codex 의 분류와 달라진 곳

| 번호 | Codex 의 분류 | 통합의 분류 | 근거 |
|---|---|---|---|
| B-004 | `CX-B-001-d` 구현 완료(근거로 `components/auth/AccountClosureFlow.tsx` 를 듦) | 부분 구현 | 그 파일은 어느 라우트도 그리지 않는다(통합 단계의 검색, Claude `CL-I-253`). 닿는 시트의 비밀번호 바꾸기와 탈퇴는 언제나 거절된다(V-2, Claude 03:a3, Codex 전반부 `CX-P1-03`, `CX-P1-04`). Codex 의 두 문서가 서로 어긋난 곳이다 |
| B-042 | `CX-B-003-h` 서버 미연결 | 계획만 있음 | 서버가 없어서가 아니라 운영 정책과 출처 자료가 없어서 적지 않기로 한 결정이다(`DECISION_LOG.md:46-47, 63`) |

그 밖의 Codex 행 52개는 분류를 그대로 옮겼다. `CX-B-006` 의 열두 줄은 3절로 갔다.

---

## 3. 문서와 코드가 어긋나는 곳

일부는 결함이 아니라 뒤의 결정이 앞의 문서를 바꾼 것이다. `STATE.md:1` 의 중단 표시와 `flow/MELT_SPEC.md:106` 의 "어긋나면 이 절을 따른다"를 함께 읽어야 한다. 지켜야 할 것은 지금 코드의 동작이고, 옛 계획을 되살리는 일이 아니다.

| 번호 | 문서의 말 | 지금 코드 | 근거 | 낸 곳 | 확인 |
|---|---|---|---|---|---|
| X-01 | 로컬 가짜 인증을 없앴고 서버가 없으면 로그인 성공을 만들지 않는다 | 서버 주소가 비면 브라우저 계정으로 아무 이메일과 비밀번호로 로그인된다 | `RELEASE-READINESS.md:9`, `lib/browserAccount.ts:85-100` | `CX-B-006-a` | 통합 확인(V-2) |
| X-02 | 확률은 최소 캐시백 49%, 두 배 49%, 나머지 2% | 새 박스 320개는 실물 전용 표, 옛 박스 14개는 사다리와 터짐 | `RELEASE-READINESS.md:11, 26`, `lib/products.ts:154, 259, 324` | `CX-B-006-b` | 통합 확인(기준값의 표 버전) |
| X-03 | 가짜 후기를 넣지 않는다, 배송이 끝나야 후기를 쓴다 | 예시 28건이 붙고, 100 USDT 이상이면 보관 단계에서도 쓴다 | `RELEASE-READINESS.md:61, 63`, `lib/reviewSamples.ts:17`, `lib/community.ts:57-59` | `CX-B-006-c` | 통합 확인 |
| X-04 | 미연결 배송의 개인정보 입력과 정적 미리보기의 출금 차감을 막았다 | 주소 입력이 열려 있고(신청은 실패한다) 출금은 접수 뒤 로컬 잔액을 차감한다 | `RELEASE-READINESS.md:65`, `components/flow/ShipSheet.tsx:64`, `components/wallet/WithdrawScreen.tsx:123` | `CX-B-006-d` | 통합 확인(출금 쪽) |
| X-05 | 잔액이 있어도 탈퇴를 막는 규칙은 없다 | 두 잔액, 보관 상품, 배송, 미완료 거래가 남으면 막는다 | `DECISION_LOG.md:66`, `lib/account.ts:274`, `lib/browserAccount.ts:57-63` | `CX-B-006-e` | 통합 확인 |
| X-06 | 지금 모델은 사다리와 터짐, 운영 몫 1% | 홈의 새 박스에는 현금 결과와 터짐이 없다. 상품가 기준 약 99%, USDT 로 받으면 약 94.05% | `opening/STATE.md:52, 60`, `lib/products.ts:269, 371` | `CX-B-006-f` | Codex |
| X-07 | 실제 OTP 를 검증하고 틀린 코드를 거절한다 | 브라우저 계정의 가입, 인증 앱 켜기, 출금은 6자리 형식이면 통과한다 | `CLAUDE.md:462`, `lib/browserAccount.ts:288, 303, 318` | `CX-B-006-g` | 통합 확인 |
| X-08 | 이용 기준을 채우기 전에는 출금을 잠근다 | 누계와 식은 있으나 출금에서 검사하지 않는다(E-26) | `CLAUDE.md:177, 194`, `components/wallet/WithdrawScreen.tsx:115`, `flow/MELT_SPEC.md:132` | `CX-B-006-h` | 통합 확인(검색) |
| X-09 | 30일 동안 처리하지 않은 상품은 자동으로 95% 캐시백 | `sweepExpired` 는 빈 결과를 돌려주는 빈 함수다 | `CLAUDE.md:527`, `stores/inventoryStore.ts:68` | `CX-B-006-i`, `CX-F-022(A)` | 통합 확인 |
| X-10 | S1 은 처음에 아무것도 고르지 않는다, S4 는 상품이 있으면 받기가 주 단추 | 뒤의 결정 R4 와 R3: 여럿 결과는 미리 고른 채 열고, 부족액을 채울 수 있을 때만 받기가 주 단추 | `flow/MELT_SPEC.md:24, 50, 115, 116`, `components/box/Reveal.tsx:139, 147` | `CX-B-006-j` | 통합 확인(문서 안의 앞뒤. 코드는 뒤의 결정을 따른다) |
| X-11 | 첫 화면에 사진 셋의 띠와 타일마다의 확률 | 대표 사진 한 장과 따로 있는 확률표 | `DECISION_LOG.md:6, 95`, `components/box/BoxScreen.tsx:94, 177, 264` | `CX-B-006-k` | Codex |
| X-12 | 여럿 결과의 미리 고르기는 자동 받기와 같은 20배 기준 | 기준이 다르다. 미리 고르기는 상품가, 자동 받기는 받는 금액(95%). 20배 에서 약 21.05배 사이가 갈린다 | `flow/MELT_SPEC.md:116`, `lib/openingFlow.ts:25-31, 77-80`, `components/box/Reveal.tsx:135-139` | `CX-B-006-l` | 통합 확인(소스의 주석이 차이를 적고 있다) |
| X-13 | `web/lib/payments.ts` 의 checkout 은 미구현 오류 | 그 파일이 지금 없다 | `RELEASE-READINESS.md:77` | 통합 | 통합 확인(파일 없음) |
| X-14 | 출금의 근거로 `WithdrawTab.tsx` 를 든다 | 지금 출금 화면은 `components/wallet/WithdrawScreen.tsx` 이고 `WithdrawTab.tsx` 는 닿지 않는다 | `RELEASE-READINESS.md:78` | 통합, Claude `CL-I-258` | 통합 확인(검색) |
| X-15 | 중국어 HTML 언어 태그를 `zh-Hans` 로 지정 | 뜬 뒤에만 바뀌고 정적 HTML 은 `ko`(E-13) | `RELEASE-READINESS.md:68`, `app/layout.tsx:45` | Claude `CL-U-001`, `CX-P2-08` | 통합 확인(V-4) |
| X-16 | 푸터에 13개 정책 링크 | 꼬리말에는 "약관과 정책" 링크 하나 | `RELEASE-READINESS.md:56`, `components/shell/AppFooter.tsx:56-58` | 통합 | 통합 확인 |
| X-17 | 보관함에 검색, 필터, 정렬이 있다 | 탭 셋뿐이다 | `RELEASE-READINESS.md:59`, `lib/vault.ts:3` | `CX-B-002-j` | 통합 확인 |
| X-18 | 복구한 결과에서 검증을 열 때 그때의 확률표를 쓴다 | 복구한 결과 화면의 확률과 후기의 검증 링크는 지금 표(E-31) | `flow/MELT_SPEC.md:90`, `components/box/BoxScreen.tsx:125-131` | `CX-F-002(B)` | 통합 확인 |
| X-19 | 소스의 주석: 이 박스의 후기는 실제 개봉 기록에 묶인 것만, 예시는 보여 주지 않는다 | 예시 28건을 붙인다 | `components/box/BoxScreen.tsx:106`, `components/box/BoxReviews.tsx:111-114` | `CX-R-002`, Codex 전반부 0절 | 통합 확인 |
| X-20 | 소스의 주석: 여기서 확인 토스트를 하나로 띄운다 | `AuthHost` 는 로그인 시트만 그린다(E-11) | `components/auth/AuthHost.tsx:15, 50` | `CLA-옛문서-08` | 통합 확인 |
| X-21 | 소스의 주석: 프로덕션 빌드에서는 없는 주소다 | 배포 사이트에서 상태 200 으로 없는 주소 화면이 나온다(E-35) | `app/[locale]/dev/gallery/page.tsx:6` | `CLA-옛문서-09` | 통합 확인(V-4) |
| X-22 | 소스의 주석: 옮기는 동안 일부 주소는 옛 화면을 가리킨다 | 메뉴 일곱 개가 모두 새 화면이다 | `components/shell/AppShell.tsx:22` | `CLA-옛문서-07` | Claude |
| X-23 | 촬영 스크립트의 주석: 전용 오프라인, 세션 만료 디자인이 없다 | 오프라인 한 줄과 세션 끝남 한 줄이 있다 | `scripts/capture/states.mjs:14-16`, `components/shell/StateScreens.tsx:36-57` | `CLA-옛문서-10` | 통합 확인(뒤의 파일) |
| X-24 | 옛 `UI_INVENTORY.md`: 라우트는 언어마다 10종 | 라우트 파일 18개 | `UI_INVENTORY.md:12`, `BRIEF.md` 0절 | `CLA-옛문서-01` | Claude 실행, 총괄 |
| X-25 | 같은 문서: about, community, community/board, fairness, profile 에 각자의 화면 | 다섯 주소 모두 옮긴 화면 한 장(B-005) | `UI_INVENTORY.md:12` | `CLA-옛문서-02` | 통합 확인 |
| X-26 | 같은 문서: 홈에 `?skin=` 으로 뜨는 시안 둘 | `skin` 값을 읽는 코드가 닿는 소스에 없다(B-078) | `UI_INVENTORY.md:34, 112` | `CLA-옛문서-03` | Claude |
| X-27 | 같은 문서: 박스는 홈의 상세 창으로 연다 | 박스마다 주소가 있는 화면(B-079) | `UI_INVENTORY.md:38` | `CLA-옛문서-04` | Claude |
| X-28 | 같은 문서: 문서 화면 위에 다른 문서로 가는 탭(`LegalNav`) | 뒤로 가기와 목록 링크뿐. `components/legal/LegalNav.tsx` 는 닿지 않는다 | `UI_INVENTORY.md`(1절) | `CLA-옛문서-05` | 통합 확인(가져오는 곳이 없음) |
| X-29 | 같은 문서: `role="dialog"` 창 17개 파일 | 닿는 소스에서는 `components/ui/Sheet.tsx`, `components/box/Opening.tsx`, `components/box/Reveal.tsx` | `UI_INVENTORY.md:13` | `CLA-옛문서-06` | 통합 확인(`Sheet.tsx:18, 38`) |
| X-30 | 문서들의 시험과 빌드 수: 296 과 128 페이지, 306, 231, 207 과 62 페이지 | 지금은 단위 시험 398(추적되지 않는 기준값 시험을 더하면 404), 정적 내보내기 1,091 페이지 | `STATE.md:8`, `opening/STATE.md:42`, `RELEASE-READINESS.md:43, 89, 90`, `ARCHITECTURE.md` 7절 | 통합 | 어긋남이 아니라 그 시점의 기록이다. 지금 수로 바꿔 읽지 않는다 |

---

## 4. 분류하지 않은 것

| 무엇 | 까닭 |
|---|---|
| 사이클마다의 검수 기록, 점수(Claude 자체 81, Codex 78), 커밋 번호, 배포 런 번호 | 기능이나 계획이 아니라 그 시점의 기록이다(`STATE.md:20-45`, `IMPROVEMENT_LOOP.md` 전체) |
| 사진 한 장 단위의 결정(어느 사진을 뺐고 어느 후보로 바꿨는지) | 사진의 내용은 이번에 아무도 판정하지 않았다. 묶음으로 B-006, B-039, B-045, B-089 에 적었다 |
| 결과 영역이 넘칠 때 스크롤되지 않는다는 남은 문제 | `opening/STATE.md:49` 가 남은 문제로 적었다. 지금 고쳐졌는지 확인하지 못했다. `app/opening.css:8, 20` 에 `overflow: hidden` 이 있다는 것만 읽었다 |
| 개봉 연출의 잰 값(누른 뒤 결과까지 0.89초, 다음 행동까지 1.24초, 프레임 평균 16.7ms) | `opening/STATE.md:39` 의 기록이다. 시간 값은 `FEATURE_PARITY.md` F-044 에 있고 Antigravity 가 100ms 간격으로 다시 쟀다. 프레임 평균은 이번에 아무도 재지 않았다 |
| `flow/MELT_SPEC.md` 의 R1, R2, R5, R6, R7, R9, R11, R13, R16(문구와 배치의 세부) | 문구와 배치의 결정이다. 새 `UI_INVENTORY.md` 와 `INTERACTION_MATRIX.md` 의 몫이다. R16(금지 문자 검사의 범위)은 `tests/vMessages.test.ts` 가 덮는다고 Codex 가 적었다(`CX-F-250(A)`) |
| 옛 `UI_INVENTORY.md` 의 줄마다(화면 파일 78개, 517항목) | 개편 전 화면이고 지금 화면의 기준이 아니다(`BRIEF.md` 1절). 절 단위로 B-078 에서 B-090 에 적었다 |
| `CLAUDE.md` 의 그 밖의 줄 | 요청받은 일곱 문서가 아니다. Codex 가 든 세 곳(X-07, X-08, X-09)만 옮겼다 |

---

## 5. 번호 대응

| Codex 의 번호 | 간 곳 |
|---|---|
| `CX-B-001-a` 에서 `CX-B-001-j` | B-001 에서 B-010(순서대로) |
| `CX-B-002-a` 에서 `CX-B-002-l` | B-013 에서 B-024(순서대로) |
| `CX-B-003-a` 에서 `CX-B-003-k` | B-035 에서 B-045(순서대로) |
| `CX-B-004-a` 에서 `CX-B-004-g` | B-048 에서 B-054(순서대로) |
| `CX-B-005-a` 에서 `CX-B-005-n` | B-058 에서 B-071(순서대로) |
| `CX-B-006-a` 에서 `CX-B-006-l` | X-01 에서 X-12(순서대로) |
| `CLA-옛문서-01` 에서 `06` | X-24 에서 X-29 |
| `CLA-옛문서-07` | X-22 |
| `CLA-옛문서-08` | X-20 |
| `CLA-옛문서-09` | X-21 |
| `CLA-옛문서-10` | X-23 |

Codex 의 표에 없어 통합 단계에서 더한 행: B-011, B-012, B-025 에서 B-034, B-046, B-047, B-055 에서 B-057, B-072 에서 B-090(36개). 통합 단계에서 더한 어긋남: X-13 에서 X-19, X-30(8개. 그 가운데 X-15, X-17, X-18, X-19 는 참여자가 다른 자리에서 적은 사실을 문서와 견준 것이다).

---

## 6. 수

| 무엇 | 수 |
|---|---|
| 분류 행(B-001 에서 B-090) | 90 |
| Codex 의 분류를 옮긴 행 | 54 |
| 통합 단계에서 더한 행 | 36 |
| Codex 와 분류가 달라진 행 | 2 (B-004, B-042) |
| 문서와 코드가 어긋나는 곳(X-01 에서 X-30) | 30 |
| 그 가운데 Codex 의 `CX-B-006` | 12 |
| 그 가운데 Claude 의 "옛 문서와 어긋나는 것" | 10 |
| 그 가운데 통합 단계에서 더한 것 | 8 |
| 통합 단계에서 코드나 실행으로 다시 확인한 분류 행 | 57 |
| 다시 확인하지 않고 Codex 나 Claude 의 기록에 기댄 분류 행 | 33 |

분류의 수:

| 분류 | 수 | 번호 |
|---|---|---|
| 구현 완료 | 35 | B-002, B-003, B-005, B-011 에서 B-015, B-027, B-029, B-030, B-037, B-038, B-040, B-046 에서 B-048, B-052, B-055, B-056, B-058 에서 B-065, B-073 에서 B-076, B-087, B-088, B-090 |
| 부분 구현 | 15 | B-004, B-006, B-016, B-021, B-023, B-025, B-028, B-035, B-036, B-039, B-045, B-066, B-072, B-077, B-089 |
| 화면만 있음 | 1 | B-067 |
| 서버 미연결 | 5 | B-009, B-017, B-018, B-020, B-068 |
| 계획만 있음 | 13 | B-008, B-010, B-019, B-024, B-034, B-041, B-042, B-051, B-053, B-054, B-057, B-070, B-071 |
| 폐기됨 | 11 | B-001, B-007, B-022, B-026, B-031, B-032, B-033, B-043, B-044, B-049, B-069 |
| 지금 닿지 않음 | 10 | B-050, B-078 에서 B-086 |
| 합계 | 90 | |

통합 단계에서 다시 확인한 57개 행: B-001 에서 B-006, B-009, B-012, B-013, B-015 에서 B-022, B-025 에서 B-033, B-037, B-038, B-040, B-043, B-046, B-048, B-049, B-052, B-055, B-057, B-060, B-062 에서 B-066, B-068, B-069, B-071, B-074 에서 B-077, B-080, B-081, B-083 에서 B-088. 확인은 코드의 그 줄을 읽었거나 `PARITY_ISSUES.md` 0.4절의 실행(V-1, V-2, V-4)으로 했다. 실제 기기나 배포 화면에서 다시 본 것은 아니다.
