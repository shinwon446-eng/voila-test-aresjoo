# 1차 구조와 기능 감사

감사 시작 HEAD: `5ef5b84bb83359b6c4206c3d84db7f3e0c1106a6`

대상: `C:\Users\hyun1\dev\VOILA-audit-reviews`, 브랜치 `migration-result`. 원본은 `63445c7`, 결과는 위 HEAD다. 2026-10-12 실행했다.

**이번 변경이 만든 P0은 0건, P1은 1건이다. 따라서 새 P0과 P1이 모두 0인 상태는 아니다.** 새 P1은 E-01 수정의 취소 실패 처리와 접수 번호 재사용 문제다.

## 1. 범위와 증거

`AGENTS.md`, `DESIGN.md`, `REDESIGN_BRIEF.md`, `qa/PROGRESS.md`, `migration-audit/BRIEF.md`, `MIGRATION_SPEC.md`, `PARITY_ISSUES.md`의 지정 A부 항목을 읽었다. 기능 인벤토리와 Phase 1의 독립 계산 방법은 다른 작업 폴더인 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\FEATURE_PARITY.md`와 `analysis/codex-b-data-money.md`에서 읽었다. 이 대상 폴더에는 기능 인벤토리와 시작 시점의 골든 검사 파일이 없었다.

이 보고서의 코드 줄은 시작 HEAD 기준이다. 코드에서 읽은 것, 직접 실행한 것, 짐작을 구분한다. 배포 화면의 픽셀 비교, 개봉 연출 실측, 실제 화면 읽기 프로그램으로 읽기는 이번 실행에서 하지 않았다.

실행 중 다른 작업자가 다음 커밋을 더했다. 모두 이번 감사 범위 밖이다.

| 커밋 | 내용 |
|---|---|
| `7536a58` | 후기 첫 다섯 건의 언어 |
| `42d89e4` | E-14 음수 금액 표기 |
| `ab096de` | 골든 검사와 기준값 파일 추가 |

이 변화 때문에 검사에 쓸 시작 HEAD를 읽기 전용 `git archive`로 외부 임시 폴더에 고정했다. 변경 파일 44개의 내용이 시작 HEAD의 git blob과 같은지 줄바꿈 차이를 제외하고 대조했다. 모두 같았다. 의존성은 기존 `node_modules`를 junction으로 연결했고 대상 저장소의 의존성 파일을 수정하지 않았다. 저장소를 바꾸는 git 명령, `next build`, 실제 돈과 배송 호출, 비밀값 읽기를 하지 않았다. 저장소에 쓴 파일은 이 보고서 하나다.

임시 도구와 로그의 폴더는 `C:\Users\hyun1\AppData\Local\Temp\voila-cycle1-5ef5b84`다. 이하 이 폴더를 TEMP라고 부른다. 브라우저 도구는 TEMP의 시작 HEAD 소스를 esbuild로 메모리에서 묶어 격리된 headless Chrome에 넣었다. Next 라우터와 번역 연결을 대체했고 React 개발 모드의 `StrictMode`를 사용했다. 받기의 UI 검사는 `settleTake` 응답을 대체했다. E-01 실패 검사는 `api.withdraw`와 `api.cancelWithdrawal`을 대체했다. 실제 API 주소로 출금이나 배송을 보내지 않았다. 이 실행은 서비스 접속 시험이나 배포 화면 비교를 대신하지 않는다.

### 커밋과 파일 분류

직접 실행한 명령은 `rtk proxy git log --oneline 63445c7..HEAD`, `rtk proxy git diff 63445c7..HEAD --stat`다. 시작 결과는 14커밋, 44파일, 추가 4,959줄, 삭제 191줄이었다. 뒤의 분석에는 `63445c7..5ef5b84`를 명시했다.

| 커밋 | 분류 |
|---|---|
| `00e17b7`, `56dfebb`, `9668b13`, `1b808a5` | W1 샘플 후기 |
| `f300175` | W3 E-19 |
| `3d489a4` | W3 E-20 |
| `8f72ee6` | W3 E-25 |
| `14bd57f` | W3 E-39 |
| `e19cd8b` | W3 E-15 |
| `daa2db8` | W3 E-16 |
| `4960a8b` | W2 E-01 |
| `d2cf71c` | W2 E-06 |
| `02a5443` | W2 E-08 |
| `5ef5b84` | W2 E-03 |

아래 44행은 stat의 모든 파일에 대응한다.

| 파일 | 묶음과 항목 | 변경의 범위 |
|---|---|---|
| `DESIGN.md:98` | W1 | 후기 예외와 용어 두 개 |
| `web/app/globals.css:10` | W1 | 후기 CSS import |
| `web/app/reviews.css:1` | W1 | 후기 목록과 상세에만 쓰는 스타일 |
| `web/app/ui.css:166` | W1 | 옛 후기 카드 선택자 제거 |
| `web/components/account/AccountSheets.tsx:57` | W2 E-03 | 비밀번호 사전 확인과 완료 상태 |
| `web/components/auth/AuthHost.tsx:28` | W3 E-25 | 구독 정리 |
| `web/components/box/BoxList.tsx:48` | W1 | 카드 별점 집계 연결 |
| `web/components/box/BoxReviews.tsx:140` | W1 | 후기 피드와 목록과 상세 |
| `web/components/box/BoxScreen.tsx:106` | W1 | 후기 요약과 구역 연결 |
| `web/components/box/Reveal.tsx:93` | W3 E-39 | 한 개 받기의 응답 생존 검사 |
| `web/components/box/ReviewsScreen.tsx:21` | W1 | 후기 모아 보기 |
| `web/components/flow/ReviewSheet.tsx:40` | W3 E-15 | 초안 초기화와 사진 세대 |
| `web/components/home/HeroBanner.tsx:130` | W3 E-19 | 훅 순서 |
| `web/components/home/heroBall.ts:82` | W3 E-20 | 준비 실패 자원 정리 |
| `web/components/inventory/InventoryScreen.tsx:72` | W3 E-39 | 한 개 받기의 응답 생존 검사 |
| `web/components/ui/Sheet.tsx:39` | W2 E-08 | 공통 확인창의 350ms 잠금 |
| `web/components/verify/VerifyScreen.tsx:58` | W3 E-16 | 입력과 계산 시작값 대조 |
| `web/components/wallet/WalletScreen.tsx:68` | W2 E-06 | 내역 필터 |
| `web/components/wallet/WithdrawScreen.tsx:123` | W2 E-01 | 차감 성공 검사와 취소 요청 |
| `web/lib/browserWallet.ts:10` | W2 E-06 | 장부 이름을 보는 필터 |
| `web/lib/reviewFeed.ts:1` | W1 | 후기 집계와 상대 시각 |
| `web/lib/reviewSampleText.ts:1` | W1 | 샘플 글 조각 |
| `web/lib/reviewSamples.ts:25` | W1 | 결정적 샘플 생성기 |
| `web/messages/v.en.json:92` | W1, W2 E-03 | 후기 키와 인증 앱 안내 |
| `web/messages/v.ko.json:92` | W1, W2 E-03 | 위와 같은 키 |
| `web/messages/v.zh.json:92` | W1, W2 E-03 | 위와 같은 키 |
| `web/scripts/capture/flow-account-password.mjs:55` | W2 E-03 | 비밀번호 흐름 검사 |
| `web/scripts/capture/flow-confirm-lock.mjs:45` | W2 E-08 | 연타와 키보드 검사 |
| `web/scripts/capture/flow-review-draft.mjs:53` | W3 E-15 | 초안과 사진 경합 검사 |
| `web/scripts/capture/flow-reviews.mjs:1` | W1 | 후기 화면 검사 |
| `web/scripts/capture/flow-take.mjs:57` | W2 E-08 | 확인창 대기를 500ms로 조정 |
| `web/scripts/capture/flow-verify-stale.mjs:63` | W3 E-16 | 느린 계산과 입력 변경 검사 |
| `web/scripts/capture/flow-wallet-history.mjs:1` | W2 E-06 | 지갑 내역 검사 |
| `web/scripts/capture/flow-withdraw.mjs:82` | W2 E-01 | 차감 실패 경합 검사 |
| `web/scripts/capture/opening-qa.mjs:78` | W2 E-08 | 확인창 대기 조정 |
| `web/scripts/capture/opening.mjs:108` | W2 E-08 | 확인창 대기 조정 |
| `web/stores/walletStore.ts:65` | W2 E-01 | 선택적 debited 필드와 접수 함수 |
| `web/tests/heroBall.test.ts:54` | W3 E-20 | GL 실패 자원과 성공 호출 순서 |
| `web/tests/reactStructure.test.ts:10` | W3 E-19, E-25, E-39, W2 E-08, E-03 | 소스 모양 검사 |
| `web/tests/reviewFeed.test.ts:28` | W1 | 집계와 스위치 |
| `web/tests/reviewSamples.test.ts:29` | W1 | 샘플 생성과 뜻 규칙 |
| `web/tests/vMessages.test.ts:167` | W1 | 후기 번역 키 검사 |
| `web/tests/walletHistory.test.ts:52` | W2 E-06 | 메모리 저장소와 실제 열기와 받기 |
| `web/tests/withdrawRefund.test.ts:15` | W2 E-01 | 차감과 취소 환불 |

코드와 diff에서 읽은 것: 미분류 변경은 없었다. 파일 이름 변경과 파일 삭제는 없었다. 옛 닿지 않는 화면 삭제, 라이브러리 추가나 교체, 카탈로그 변경, 확률 변경, 지급식 변경도 없었다. W1의 후기 목록 모양과 옛 후기 CSS 제거는 명세 1절이 허용한 자리다. 다른 화면을 보기 좋게 고친 변경은 발견하지 않았다. `web/package.json`, `web/package-lock.json`의 diff는 빈 결과였다. `web/lib/products.ts`, `fairness.ts`, `takeBatch.ts`, `funding.ts`, `opening.ts`, `inventoryStore.ts`도 원본과 같다. W2의 환불 조건 변경은 E-01에 명시된 예외다.

## 2. 불변값 재계산

### 직접 실행한 것

대상 `web`에서 `rtk proxy npx tsx --test tests/parityGolden.test.ts`는 종료 코드 1, 파일 없음이었다. 시작 HEAD에도 그 파일은 없다. 이를 통과로 세지 않았다.

Phase 1 폴더의 `tests/parityGolden.test.ts`와 `migration-audit/harness/golden`을 TEMP의 시작 HEAD 복사본에 복사했다. 기준 JSON은 재생성하지 않았다. 그 복사본의 `web`에서 같은 명령은 검사 6, 통과 6, 실패 0, 종료 코드 0이었다. 카탈로그 개수와 상수와 순서와 확률 합, 고정 시드 150행, 돈 계산 기준값을 모두 대조했다.

그 검사와 별도로 `rtk proxy npx --no-install tsx --tsconfig tsconfig.json ../independent.mts`를 TEMP의 `web`에서 실행했다. 종료 코드 0이었다. Phase 1의 방법대로 박스를 ASCII slug 오름차순으로 정렬하고 박스 안은 `dropTable` 순서를 유지했다. 각 행은 `[slug, price, itemId, dropRate]`의 JSON과 LF이며 마지막 행에도 LF를 붙였다. Node crypto로 UTF-8의 SHA-256을 계산했다.

| 범위 | 행 | 바이트 | 다시 계산한 SHA-256 | 원본과 비교 |
|---|---:|---:|---|---|
| 전체 | 32,916 | 2,201,788 | `a82f8bd995be27226825ea4e467e124f8a6e77d264f7d26e6fa40bcf5ce2925d` | 일치 |
| 홈 | 32,000 | 2,160,497 | `8bce14b1305f9bc1be28ec08ba9f3e44b704e67610517df6eed0aa842df9c9b0` | 일치 |

기준값 검사는 전체 334박스의 확률 정수 칸 합이 모두 1,000,000임을 확인했다. 종류와 값, 세 언어 이름과 사진, 전체와 홈의 박스 순서 보조 지문도 같았다. 해시 형식이 다른 골든의 `tableOrder`와 위 주 지문을 같은 문자열로 비교하지 않았다.

### 추첨표

`independent.mts`는 Node `createHmac`으로도 번호를 독립 계산하고 앱의 `calculateRollResult`와 비교했다. 서버 시드는 `codex-b-server-seed-2026-10-12`, 클라이언트 시드는 `codex-b-client-seed`다. 약속 해시는 `f362c9b0155b62b1515fbdd993ec7fd46c3b5b05dafea6f51402788eef0b968d`로 원본과 같다. 다음 10행 모두 Phase 1 표와 같다.

| 회차 | 번호 | vault-pokemon | pokemon-charizard |
|---|---:|---|---|
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

골든의 다른 시드와 박스 셋, nonce 0부터 49의 150행도 통과했다. 같은 결과가 나온 것은 지문만 같아서 추정한 것이 아니라 실행한 결과다.

### 돈 경계값

코드에서 읽은 식은 `lib/takeBatch.ts:154`, `funding.ts:46`, `:63`, `withdrawal.ts:19`, `:26`, `:56`, `:60`이다. 아래는 `independent.mts`의 직접 결과이며 전부 원본 표와 같다.

| 상품가 | 받는 금액 |
|---:|---:|
| 0.005 | 0 |
| 0.015 | 0.01 |
| 0.105 | 0.10 |
| 1.005 | 0.95 |
| 2.675 | 2.54 |
| 0.1 | 0.10 |
| 0.3 | 0.28 |
| 100 | 95 |

| 낼 금액 | crypto | card | 차감 배분 |
|---:|---:|---:|---|
| 10 | 3 | 20 | 3과 7, 비율 0.3과 0.7 |
| 10 | 0 | 20 | 0과 10, 비율 0과 1 |
| 0.005 | 3 | 20 | 0.01과 0 |
| 0.0049 | 3 | 20 | null |
| 33.01 | 3 | 30 | null |

95를 0.3과 0.7의 출처로 돌려주면 crypto 28.5, card 66.5다. 출금 최소는 20, 수수료는 TRC20 1, BEP20 0.5다.

| 신청액 | 잔액 | TRC20 실수령 | BEP20 실수령 | 검증 |
|---:|---:|---:|---:|---|
| 19.99 | 30 | 18.99 | 19.49 | min |
| 20 | 30 | 19 | 19.5 | 통과 |
| 20.005 | 30 | 19 | 19.5 | 통과 |
| 30.01 | 30 | 29.01 | 29.51 | insufficient |

골든은 이 표보다 넓게 받기 20개, 차감 16개, 환급 9개, 구간 90개와 터짐도 대조했다. 예시의 반올림은 JavaScript `toFixed` 결과 그대로이며 십진 반올림으로 바꾸지 않았다.

## 3. 항목별 판정

### E-19: 고쳐짐

코드에서 읽은 것: `HeroBanner.tsx:130`의 `freeLeft` 훅을 조건부 반환 앞으로 옮겼다. selector는 같은 `freeOpens[GIFT_BOX_SLUG]`이고 계정과 hydration 구독도 같다. 정상적으로 박스가 있는 경로의 구독 범위는 같고 박스가 없는 경로에서도 이제 지갑 구독이 생긴다. 그 경로는 가입 혜택 박스가 모듈 상수인 지금 구성에서 도달하지 않는다. 훅 순서를 고정하는 데 필요한 변화다.

최소성: 한 훅 이동과 주석뿐이다. `HeroBanner.tsx:41`의 단계 시간 320, 190, 820, 30,000, 460ms와 그리기 코드는 바꾸지 않았다. 픽셀 차이 0과 실제 단계 시간은 이번 실행에서 측정하지 않았다.

테스트: `reactStructure.test.ts:10`은 원본에서 실패하고 결과에서 통과한다. 반환 뒤의 문자열에서 훅 호출을 찾는 검사이므로 helper 안의 조건부 훅이나 실제 구독 횟수는 지키지 못한다. 정상 경로의 구독 동일성은 코드 대조의 판정이다.

### E-20: 고쳐짐

코드에서 읽은 것: `heroBall.ts:82`가 만들어진 shader와 program을 지우고, 가능하면 context를 놓는다. 실패한 shader 자체도 `:94`에서 지운다. 확장 없음, vertex 실패, fragment 실패, program 생성 실패, link 실패에 모두 정리가 있다. 정상 준비와 paint와 dispose는 그대로다.

직접 실행한 것: `heroBall.test.ts:54`의 실패 다섯 갈래는 남은 shader 0, program 0, context 놓기 1이다. WebGL 없음과 성공 호출 순서까지 총 7개 통과했다. 같은 시험을 원본 소스에 붙였을 때 실패 갈래 다섯 개가 실패하고 두 정상 검사는 통과했다.

최소성: 실패 경로에 한정했다. 새 라이브러리나 shader 변경은 없다. 실제 GPU 픽셀 비교는 하지 않았다. `WEBGL_lose_context`가 없는 기기는 명시적으로 context를 놓을 수 없지만 shader와 program 삭제는 이루어진다. 그 환경의 context 회수는 브라우저에 달렸다는 코드상의 한계다.

### E-25: 고쳐짐

코드에서 읽은 것: `AuthHost.tsx:28`의 unsubscribe를 effect 범위로 올리고 `:49`에서 정리 함수로 반환한다. 기다리던 구독은 hydration 때 먼저 풀고 grant하며, 계정 변경과 언마운트 때도 풀린다. 지갑 namespace를 복원한 뒤 혜택을 주는 정상 순서는 그대로다.

최소성: 구독 함수의 범위와 반환만 바뀌었다. grant와 보너스 계산은 그대로다. 브라우저 계정에서는 `browserWallet.ts:25`가 먼저 hydrated로 만들어 대기 구독 분기를 보통 지나지 않는다. 서버 계정에서의 대기 구독 해제는 직접 접속으로 시험하지 않았다.

테스트: `reactStructure.test.ts:20`은 원본에서 실패하고 결과에서 통과한다. 실제 unsubscribe 호출 수나 A에서 B로 바뀐 뒤 A의 grant가 없는지는 실행하지 않는 소스 검사다. 선언과 정리 함수가 함께 있다는 것 이상으로 확대 해석하지 않았다.

### E-39: 명세의 두 받기 경로는 고쳐짐, A부 전체로는 일부만

코드에서 읽은 것: `Reveal.tsx:93`, `InventoryScreen.tsx:72`의 effect는 붙을 때 alive를 true로 되돌리고 정리할 때 false로 바꾼다. 각각 `:134`, `:96`에서 받기 응답 직후 검사한다. 개발 StrictMode의 setup, cleanup, setup 뒤에도 true가 된다. false로만 내리는 잘못된 구현은 아니다.

직접 실행한 것: TEMP에서 `rtk proxy node browser.cjs`로 개발 React의 `StrictMode`에 실제 두 컴포넌트를 마운트했다. 대체한 정상 settled 응답 뒤 보관함의 시트와 결과의 확인창이 닫혔다. 정상 응답을 모두 버리는 회귀는 재현되지 않았다. 돈과 저장의 온전함은 대체 응답 시험이 아니라 기존 `takeBatch`와 `takeFault` 검사 및 해당 파일의 빈 diff로 확인했다.

최소성: 화면 생존 검사만 더했다. 언마운트 뒤 보관함 함수가 busy를 false로 바꾸지 않는 것은 버려지는 컴포넌트의 상태라 새로 마운트한 화면을 잠그지 않는다. 화면에 남아 있는 동안에는 busy를 푼다. 계정이 바뀌어도 같은 컴포넌트가 남는 경우와 선택 대상이 바뀌는 경우는 alive만으로 가리지 않는다. 이 한계는 새 보호의 범위이며 계정 경합을 모두 해결했다고 볼 수 없다.

A부 E-39에 함께 적힌 `BoxScreen.tsx:148`의 구매 응답은 여전히 언마운트 뒤 `send`와 `setOpened`를 부를 수 있다. W3 명세의 대상 두 받기 함수 밖이고 원본의 남은 P3다.

테스트: `reactStructure.test.ts:32`의 두 검사는 원본에서 실패한다. 문자열 검사이므로 실제 늦은 응답, 언마운트, StrictMode의 effect 순서를 실행하지 않는다. 이번의 정상 StrictMode 실행은 그 빈칸 일부를 보완했지만 언마운트 뒤 모든 setter가 호출되지 않는 것까지 계측한 것은 아니다.

### E-15: 고쳐짐

코드에서 읽은 것: `ReviewSheet.tsx:46`은 item id와 null 전환 때 rating, text, photo, failed를 초기화한다. `:43`의 생존 표시와 `:52`의 세대 검사는 나중 사진만 적용한다. `InventoryScreen.tsx:186`이 닫기와 게시 완료 뒤 item을 null로 전달하므로, 같은 상품을 다시 열어도 새 초안이다.

직접 실행한 것: `rtk proxy node browser.cjs`에서 같은 상품 닫기와 재열기 때 글 없음과 별점 5, 별점 4와 글을 게시한 뒤 시트 닫힘, 저장된 후기의 글과 별점 유지가 확인됐다. `rtk proxy node browser.cjs --photos`에서는 먼저 고른 빨간 사진을 1,500ms 늦추고 뒤의 파란 사진을 바로 끝냈다. 마지막 사진이 파란색으로 남았다. 사진 작업 중 닫았다 같은 상품을 다시 열어도 늦은 사진이 새 초안에 나타나지 않았다. 이 사진 실행은 관찰 3개, 모두 기대와 일치했다.

최소성: 사진 압축 크기 1,000px, webp 0.8과 add의 payload는 그대로다. 게시가 먼저 저장을 끝낸 뒤 초안을 비우므로 게시 자료를 지우지 않는다. 같은 상품을 닫았다 여는 경우의 미게시 초안 폐기는 명세가 정한 의도된 차이다. 저장 자체가 조용히 실패하는 E-27은 이 수정으로 해결되지 않는다.

테스트: `flow-review-draft.mjs:53`의 다른 상품, 같은 상품 재열기, 사진 경합 검사는 원본에서 실패할 동작을 직접 겨냥한다. 이 파일은 `npm test`에 포함되지 않는다. 이번 실행은 TEMP의 별도 도구로 핵심 동작을 확인했고, 저장소의 이 capture 스크립트 자체를 실행했다고 적지 않는다.

### E-16: 일부만

코드에서 읽은 것: `VerifyScreen.tsx:58`의 다섯 입력 snapshot과 `:68`의 대조는 진행 중 입력이 달라진 계산을 버린다. 실패 응답에도 같은 대조가 있고 `:72`의 finally가 busy를 푼다. 입력이 그대로인 정상 계산식은 같다.

직접 실행한 것: `browser.cjs`에서 정상 계산 결과 3행, 느린 digest 동안 회차를 바꾼 뒤 busy 해제, 다시 계산할 수 있는 상태를 확인했다. 그러나 정상 계산이 끝난 뒤 회차를 2에서 3으로 바꾸어도 앞 결과 3행이 남았다. 그 상태에서 또 느린 계산을 시작했다가 회차를 4로 바꾸면 새 응답은 버려져도 앞 결과 3행은 여전히 남았다.

판정: W3의 좁은 목표인 진행 중 응답 폐기는 고쳐졌다. A부의 입력과 완료 결과 불일치는 남았다. 원본부터 있던 P2이며 이번 변경이 새로 만든 불일치로 세지 않는다. 비어 있는 회차를 0으로 읽는 것과 안전 정수 검사 없음도 원본의 남은 문제다. 정상 경로를 넓게 고친 변경은 없다.

테스트: `flow-verify-stale.mjs:63`은 처음 결과가 없는 상태에서 계산 중 입력 변경을 시험하므로 원본의 늦은 응답 결함을 잡는다. 이미 보이는 결과를 무효화하는 검사는 없다. 이 파일도 `npm test` 밖이다.

### E-01: 일부만, 새 P1 있음

코드에서 읽은 것: `walletStore.ts:242`의 접수 함수는 끝나지 않은 출금을 crypto에서 실제 차감한 경우에만 기록한다. 이미 취소나 실패인 결과는 차감 없이 `debited: false`로 기록한다. `:212`, `:235`가 false 기록의 환불을 막는다. `WithdrawScreen.tsx:123`은 반환값을 확인한다. 보통의 차감, 수수료, 출처와 완료 상태는 같다.

직접 실행한 것: 새 환불 시험 7개 통과했다. TEMP의 독립 실행에서 잔액 0, 차감 실패, debited 없는 옛 대기 거래를 만들고 FAILED로 맞추니 잔액이 30이 됐다. 즉 이미 저장된 무차감 기록의 결함은 남았다. 정상적으로 차감된 옛 기록을 환불하는 호환성도 유지되지만 두 종류의 옛 기록을 현재 필드만으로 구분할 수 없다. `withdrawRefund.test.ts:83`은 정상 옛 기록만 검사한다.

새 문제: `WithdrawScreen.tsx:128`은 requestDraft를 비우고 `:131`은 취소를 기다리지 않으며 실패를 삼킨다. 접수 번호도 로컬에 남기지 않는다. 이 출금은 `WalletScreen.tsx:47`의 로컬 거래 기반 poll에서 발견할 수 없다.

직접 실행한 것: `browser.cjs`로 실제 출금 컴포넌트의 인증과 commit을 거쳤다. 접수 응답 직후 잔액을 0으로 만들고 취소만 실패시켰다. 취소 시도 있음, 서비스 대기 건 있음, 지갑 거래 0, 취소 실패 안내 없음이었다. `browser.cjs --orphan`으로 이어서 잔액을 보충하고 같은 금액과 주소를 다시 제출했다. 두 requestId가 달랐고 서비스 요청은 두 건, 지갑 거래는 두 번째 한 건만 있었다. 이 실행의 관찰 4개는 모두 위 경로와 일치했다. 실제 서비스에 두 출금을 만든 것이 아니라 대체 transport로 호출과 상태를 계측했다.

멱등성: 정상 응답의 같은 serverId는 `WithdrawScreen.tsx:121`이 다시 차감하지 않게 한다. 취소와 상태 동기화도 끝난 상태를 다시 환불하지 않는다. 새 `recordWithdrawal` 자체에는 serverId 중복 검사가 없다. 독립 실행에서 같은 serverId를 두 번 직접 넘기면 잔액 100이 40, 거래 2건이었다. 현재 화면의 보호를 우회한 단위 호출 결과이며, 현재 화면에서도 정상 응답이 중복 차감된다고 주장하지 않는다. 새 취소 실패 분기에서 requestId를 잃는 것은 실제 화면 경로에서 재현됐다.

최소성: 한 선택 필드와 접수 helper를 더한 것은 지급식을 바꾸지 않고 새 기록을 지키는 작은 변경이다. 그러나 실패 취소를 조용히 버리는 처리는 필요한 복구를 빠뜨렸다. 차감 실패 자체를 알리는 기존 입력 안내만으로 취소 성공을 대신할 수 없다.

테스트: `withdrawRefund.test.ts:28`의 false 기록 환불 검사는 원본에서 잔액 30으로 실패하므로 결함을 지킨다. 다른 다섯 실패는 원본에 새 helper가 없는 데서 나며 화면이 helper를 실제 쓰는지는 별도다. `flow-withdraw.mjs:82`는 취소 성공만 기대하며 취소 실패와 같은 내용 재시도는 보지 않는다. 골든의 돈 계산 통과도 접수와 취소 오류를 지키지 않는다.

### E-06: 고쳐짐

코드에서 읽은 것: `browserWallet.ts:10`은 persist 이름이 `voila.browser-wallet.{userId}`일 때만 주인 표시 없는 거래를 허용한다. 번호가 있는 거래는 자기 번호만 허용한다. 공용 `gachaflix.wallet`, guest, 다른 계정 장부에서는 주인 없는 거래를 넣지 않는다. `WalletScreen.tsx:68`은 지갑의 현재 transactions와 현재 user로 이 함수를 호출한다. 저장된 거래는 고쳐 쓰지 않는다.

직접 실행한 것: `walletHistory.test.ts` 4개 통과했다. 실제 열기와 받기로 만든 bonus, open, sellback 셋이 보였다. 사용자만 B이고 장부는 A인 순간에는 B에게 빈 목록, 장부를 B로 바꾼 뒤 A의 거래 없음, A로 돌아오면 저장 문자열 그대로, 공용 키에서는 번호 있는 bonus만 보였다. 원본의 화면 조건은 같은 세 거래 가운데 bonus만 남겼다.

최소성: 기록 생성 네 곳을 바꾸지 않고 표시 필터만 바꿨다. 최신순, 30건씩 표시, 금액 표기, 출금 상태 poll은 같다. 원래 누락된 행이 늘어난 것은 의도된 차이다.

테스트의 한계: `walletHistory.test.ts:75`의 주석은 늦은 A 배열의 번호 없는 거래까지 가린다고 쓰지만 실제 `:76`은 먼저 번호 있는 거래만 남긴 배열을 검사한다. helper는 거래 배열의 출처 자체를 검사하지 않아, B 장부 이름 아래에서 A의 번호 없는 배열을 넘기면 허용할 수 있다. 실제 화면은 현재 zustand snapshot을 읽고 namespace 변경과 상태 교체 사이에 await가 없으므로, 그 잘못된 배열이 화면에 전달되는 경로를 이번 실행에서 입증하지 못했다. 남의 거래 노출을 확인된 새 결함으로 올리지 않았다. 계정 전환의 실제 React 렌더 시험은 더 필요하다.

### E-08: 고쳐짐, 모든 업무 경로의 실행 완료 판정은 보류

코드에서 읽은 것: `Sheet.tsx:39`가 열림 시각을 저장하고 `:41`은 350ms 전 누름을 버린다. 타이머나 누름 queue가 없어 나중에 자동 확정되지 않는다. 닫힌 렌더는 시각을 초기화한다. `:45`의 alertdialog와 제목 연결, tabIndex, `useModal.ts:44`의 키보드 가두기는 그대로다. 잠금이 disabled나 inert를 새로 걸지 않아 포커스와 화면 읽기 대상은 남는다. busy일 때 disabled가 되는 것은 기존 `kit.tsx:16`이다.

직접 실행한 것: `browser.cjs`에서 350ms 전 click 폐기, 400ms 뒤 자동 실행 없음, 이후 Enter와 Space 확정, 재열기 잠금, Esc 취소를 확인했다. 실제 보관함과 Reveal에서도 잠금 뒤 확인이 정상 handler를 불렀다. 여덟 업무 이름으로 같은 Confirm에 전달한 spy handler도 각각 잠금 뒤 실행됐다. 이것은 공통 부품의 실행이며 여덟 실제 업무를 끝까지 수행한 실행으로 세지 않는다. 실제 화면 읽기 도구는 사용하지 않았다.

| 사용처 | 코드에서 확인한 연결 | 직접 실행 범위 |
|---|---|---|
| 한 개 받기 | `TakeSheet.tsx:52`, `InventoryScreen.tsx:190`, `Reveal.tsx:134` | 실제 두 화면, 대체 settled 응답 |
| 묶음 받기 | `TakeSheet.tsx:197` | 공통 Confirm spy, 업무 handler는 코드 대조 |
| 배송 신청 | `ShipSheet.tsx:79` | 공통 Confirm spy, 접수 실행 안 함 |
| 출금 취소 | `WalletScreen.tsx:147` | 공통 Confirm spy, 실제 서비스 취소 안 함 |
| 로그아웃 | `AccountScreen.tsx:81` | 공통 Confirm spy, leave 연결 대조 |
| 탈퇴 | `AccountSheets.tsx:122` | 공통 Confirm spy, 원래 서비스 주소 결함은 남음 |
| 큰 금액 열기 | `BoxScreen.tsx:314` | 공통 Confirm spy, open의 confirmed 경로 대조 |
| 자동 받기 설정 | `Opening.tsx:352` | 공통 Confirm spy, 설정 함수 연결 대조 |

최소성: 공통 확인창 하나에 같은 상수를 연결했다. 개별 받기나 배송이나 출금 계산은 바꾸지 않았다. 간격 600ms의 두 번째 누름은 통과한다. `flow-confirm-lock.mjs:69`도 이를 정상 확정으로 기대한다. A부가 관찰한 모든 간격의 두 번 누름을 막은 것은 아니며, 명세의 350ms 장치가 목표였다.

테스트: `reactStructure.test.ts:45`은 원본에서 실패하지만 시간, 키보드, 누름 폐기를 실행하지 않는다. `flow-confirm-lock.mjs:45`은 90ms와 250ms 누름을 직접 겨냥하고 `:101`은 키보드를 검사하므로 실제 결함 보호에 맞다. 이 capture는 npm test 밖이고 여덟 업무 중 실제 실행은 받기, 로그아웃, 배송 신청 시도 일부다. 변경된 기존 capture의 대기 300ms를 500ms로 늘린 것은 정상 시나리오 조정이며 잠금 전 검사를 대신하지 않는다.

### E-03: 일부만

코드에서 읽은 것: `AccountSheets.tsx:67`이 현재 비밀번호 확인을 먼저 거쳐 `:72`에서 변경한다. `:76`의 markSessionLost로 현재 탭의 user와 보안 상태가 지워지고 `authStore.ts:25`의 sessionLost가 true가 된다. 계정 화면의 관리 행은 `AccountScreen.tsx:46`의 로그인 화면으로 바뀌고, 완료 시트는 비밀번호 변경 제목과 다시 로그인 단추를 남긴다. `AuthHost`는 guest 장부로 바꾸는 기존 effect를 실행한다. 기존 계정의 저장 자료 삭제는 없다.

직접 실행한 것: `browser.cjs`에서 인증 앱 있는 계정은 실제 브라우저 계정 함수와 맞는 TOTP로 변경을 마쳤다. UI user는 null이 되고 완료 단추가 나왔다. 인증 앱 없는 계정은 변경하지 않고 연결 안내만 나왔다. 후자의 이메일 인증 발급 함수는 `account.ts:240`, `browserAccount.ts:224`에 이미 있으나 시트는 연결하지 않았다.

최소성: 한 시트와 세 언어 안내 한 키씩에 한정했다. 앱 있는 경로의 막힘 해소와 세션 폐기는 필요한 의도된 차이다. 앱 없는 계정의 이메일 경로는 여전히 없으므로 전체 기능은 완료가 아니다. 원본부터 실패하던 경로이고 새 P1로 세지 않는다.

짐작: 저장이나 서비스 응답을 기다리는 사이 A에서 B로 계정이 바뀌면, 마지막 `markSessionLost`가 그때의 B 세션도 지울 가능성이 있다. `:76`에 응답 계정과 현재 계정의 재대조가 없다. 이번 실행에서는 계정 전환을 끼워 재현하지 않았으며 확인된 회귀 건수에 넣지 않았다.

테스트: `reactStructure.test.ts:58`은 원본에서 사전 확인이 없어 실패한다. 현재 비밀번호와 코드가 맞아 실제 변경되는지, 앱 없는 계정, 완료 시트와 재로그인은 이 문자열 검사로 보호되지 않는다. `flow-account-password.mjs:55`에는 앱 있는 성공, 틀린 비밀번호, 틀린 코드, 앱 없는 안내가 있다. 앱 없는 성공은 검사하지 않는다.

### E-04: 안 고쳐짐

코드에서 읽은 것: `AccountSheets.tsx:111`의 deleteAccount는 원본과 같다. `account.ts:189`의 옛 `/account/closure`와 `browserAccount.ts:147`의 verification_required 거절이 그대로다. `account.ts:259`의 코드 발급과 확인은 연결되지 않았다. E-08 잠금 뒤 onConfirm이 실행돼도 업무 탈퇴는 실패한다.

최소성: 변경 없음. 정상 실패 동작도 원본과 같다. 새 화면이 여럿 필요하면 남길 수 있다는 W2 조건은 있으나, 이번 범위의 커밋에는 그 판단 근거가 없다. 기존 P1 미해결로 반드시 남겨야 한다. 새 화면을 만들지 않고 연결 가능한지에 대한 별도 판단도 필요하다.

테스트: `accountClosureFlow.test.ts`는 서비스의 코드와 자산 조건을 보며 새 CloseAccountSheet를 실행하지 않는다. 현재 전체 검사 통과로 이 결함이 고쳐졌다고 판단할 수 없다.

### E-14: 안 고쳐짐, 시작 HEAD 기준

코드에서 읽은 것: 시작 HEAD의 `formatCurrency.ts:20`, `:45`는 달러 기호 뒤에 음수 문자열을 붙인다. 해당 파일은 이 범위의 diff에 없다.

직접 실행한 것: `independent.mts`에서 `formatCurrency(-50, 'USD')`는 `$-50`이었다. 기존 `formatCurrency.test.ts`는 이 음수 달러 결함을 잡지 못한다. 이후 `42d89e4`의 수정과 검사는 이번 판정에 포함하지 않았다. 원본의 P2이며 이번 변경이 만든 결함은 아니다.

## 4. W1의 다른 자리 회귀

코드에서 읽은 것: `BoxScreen.tsx`의 diff는 후기 import와 집계, 설명 주석, BoxReviews 호출뿐이다. 확률표, 사진 구역, 구매, 상품 시트, 잔액 부족 판단의 변경은 없다. `BoxList.tsx:120`의 카드 href, 대표 사진과 이름, eager 조건, 가격과 제목 JSX는 같다. 추가 구독은 실제 후기 집계를 카드 별점에 전달하는 것뿐이다. 별점이 생겨 카드에 줄이 늘어나는 것은 W1의 허용된 차이다.

후기 쓰기 변경은 W1이 아니라 별도 W3 E-15다. `communityStore.ts:29`의 add, `community.ts`의 글과 별점과 상품 조건, 보너스 0, 저장 payload는 원본과 같다. 이번 브라우저 게시 검사에서 저장 글과 별점이 남았다. `BoxReviews.tsx:141`의 실제 후기 필터와 검증 주소는 기존의 상품과 ownedId 연결을 유지한다. 날짜를 상대 시각으로 보여 주고 샘플과 정렬하는 것은 허용된 후기 구역 안의 표시 변화다. `ReviewCardData`의 at에서 ageMin으로의 변화는 화면 모델이며 저장한 MyReview의 at를 바꾼 것이 아니다.

`WinsScreen.tsx`와 `lib/wins.ts`에는 diff가 없다. WinsScreen이 가져다 쓰는 `BoxReviews.tsx:111`의 stamp 함수 내용도 같다. 나온 상품 생성 경로에 샘플을 연결한 import가 없다. 생성기의 상품 사진은 카탈로그 경로를 참조하며 카탈로그나 이미지 파일을 수정하지 않았다.

직접 실행한 것: 세 언어 JSON을 평탄화해 원본과 결과의 다른 leaf key를 셌다. 언어별 16개였다. `reviews.itemPrice`의 변경 한 개, `box.ratingDist`, `box.ratingDistRow`, `reviews.photoOf`, `total`, `moreList`, `moreListPlain`, `listTitle`, `likes`, `agoNow`, `agoMin`, `agoHour`, `agoDay`, `agoMonth`, `agoYear`의 추가, W2의 `account.passwordNeedsApp` 추가다. 이외 키 변경은 없었다. 원래 `messages/ko.json`, `en.json`, `zh.json`은 바뀌지 않았고 실제 새 화면이 쓰는 `v.*.json` 세 벌을 함께 바꿨다. 후기와 무관한 번역 변경은 E-03의 필요한 안내뿐이다.

### 지운 CSS 선택자 전수 검색

직접 실행한 것: `inspect.cjs css`가 삭제 행의 class 이름을 뽑아 `rg -n -F`로 `web/` 전체를 검색했다. 의존성과 생성물인 node_modules, .next, out 및 lock 내용은 제외했다. 부분 문자열이 잡힌 것은 실제 class와 복합 선택자로 다시 읽었다. 아래 삭제 규칙 모두를 대조했다. `ui.css:166`, `:174`, `:329`가 근거다.

| 삭제 규칙 | 결과 코드의 사용 |
|---|---|
| `.v-rvgrid` | 없음 |
| `.v-rvgrid > .v-rvcard` | 두 class 모두 없음 |
| `.v-rvrow` | 없음 |
| `.v-rvrow::-webkit-scrollbar` | 대상 없음 |
| `.v-rvcard` | 정확한 class 없음. v-rvcard-more는 다른 class |
| `.v-rvcard-photo` | 없음 |
| `.v-rvcard-photo img` | 대상 없음 |
| `.v-rvcard-body` | 없음 |
| `.v-rvcard-text` | 없음 |
| `.v-rvcard .v-small` | 부모 class 없음. v-small 자체 규칙은 남음 |
| `.v-rvcard-btn` | 없음 |
| `.v-rvcard-item` | 없음 |
| `.v-boxlayout-reviews .v-rvrow` | 뒤의 class 없음. 앞의 class 규칙은 남음 |

`v-rvcard-more`는 `BoxReviews.tsx:206`, `ui.css:175`, `reviews.css:18`에서 계속 사용하며 삭제하지 않았다. 전역 v-small과 scroll 부품의 규칙도 남아 있다. 사용되는 다른 구역의 CSS를 지운 회귀는 찾지 못했다. 이 결론은 선택자 사용과 diff의 코드 대조이며 픽셀 비교 결과는 아니다.

`reviewSamples.test.ts`, `reviewFeed.test.ts`, `vMessages.test.ts`는 시작 HEAD의 전체 검사에 포함돼 통과했다. 샘플 최소와 최대, 카탈로그 참조, 스위치, 실제 후기 포함 집계와 번역을 검사한다. 샘플 내용의 자연스러움 전체와 화면의 시각 동등성까지 통과했다고 확대하지 않았다.

## 5. 기능 인벤토리 표본 대조

다음 32행은 Phase 1 기능 번호와 대조했다. 근거 경로는 `web/` 아래다. 실행은 골든, 독립 계산, 전체 단위 검사, 앞의 격리 UI 실행으로 구분한다. 빈 diff도 직접 확인했다.

| 인벤토리 | 지킬 것 | 결과 근거와 확인 | 판정 |
|---|---|---|---|
| F-001 | 334박스, 홈 320, 구성 32,916 | `lib/products.ts:324`, `:345`, 골든 개수 실행 | 유지 |
| F-002 | 전체와 홈 박스 순서 | `products.ts:345`, 골든 순서 해시 실행 | 유지 |
| F-003 | 세 언어 이름과 사진 경로 | `useProductText.ts:14`, 골든 보조 해시 실행 | 유지 |
| F-005 | USDT 박스 가격 | `products.ts:324`, 주 지문과 골든 실행 | 유지 |
| F-007 | 상품 종류와 상품가 | `products.ts:110`, 골든 withKindAndValue 실행 | 유지 |
| F-009 | 상품별 확률과 합계 | `products.ts:324`, SHA와 정수 합 실행 | 유지 |
| F-010 | 같은 상품가의 추첨 순서 | `products.ts:379`, 골든 drawOrder 실행 | 유지 |
| F-012 | 화면과 추첨의 확률 원천 | `BoxScreen.tsx:88`, `:264`, `opening.ts:57`, `Reveal.tsx:96`, 코드 대조 | 유지 |
| F-014 | 수량 1, 5, 10, 50, 100, 최대 100 | `opening.ts:45`, BoxScreen의 빈 구매 diff, opening 검사 실행 | 유지 |
| F-015 | 50 USDT 또는 10개부터 확인 | `BoxScreen.tsx:162`, 조건 코드 대조 | 유지. W2 공통 잠금 추가 |
| F-019 | 시드 UTF-8의 약속 해시 | `fairness.ts:50`, 독립 crypto 실행 | 유지 |
| F-020 | HMAC 앞 8 hex의 나머지 | `fairness.ts:67`, 독립 10회와 골든 150행 | 유지 |
| F-021 | 확률 정수 칸과 닫힌 구간 | `fairness.ts:92`, `:109`, fairness와 골든 실행 | 유지 |
| F-023 | 연속 nonce와 결과 순서 | `opening.ts:58`, opening와 골든 실행 | 유지 |
| F-026 | 가입 무료 2회와 무료 우선 비용 | `walletStore.ts:19`, `opening.ts:47`, freeOpens 실행 | 유지 |
| F-027 | 섞인 묶음의 같은 출처 비율 | `opening.ts:73`, `:93`, 빈 diff와 코드 대조 | 유지 |
| F-028 | 현금 결과는 100% 출처대로 지급 | `opening.ts:99`, 골든과 opening 실행 | 유지 |
| F-029 | 그때 시드와 확률표와 가격 저장 | `opening.ts:92`, opening 실행과 빈 diff | 유지 |
| F-035 | 상품별 95% 반올림 뒤 합산 | `takeBatch.ts:154`, `inventoryStore.ts:89`, 독립과 골든 실행 | 유지 |
| F-036 | crypto와 card 출처 환급 | `funding.ts:63`, 독립 95 배분과 골든 실행 | 유지 |
| F-037 | 보관함 처리, 입금, itemIds 기록 | `claim.ts:18`, `:24`, takeBatch와 claim 실행 | 유지 |
| F-038 | 저장 장부 재판정과 중복 지급 방지 | `takeBatch.ts:316`, takeFault와 takeBatch 실행 | 유지 |
| F-046 | 실제 내 결과만 나온 상품에 표시 | `lib/wins.ts:55`, `WinsScreen.tsx:63`, 빈 diff와 wins 실행 | 유지 |
| F-047 | 그때 저장된 표로 기록 검증 | `fairness/verifyRecord.ts:39`, fairness-record 실행 | 유지 |
| F-050 | 합 잔액과 crypto 출금 전용 | `walletStore.ts:248`, `:262`, walletSplit 실행 | 유지 |
| F-051 | crypto 우선 차감과 6자리 비율 | `funding.ts:46`, 독립과 골든 실행 | 유지 |
| F-056 | 주소, 최소 20, 잔액 검사 | `withdrawal.ts:60`, 독립과 골든 실행 | 유지 |
| F-057 | 수수료 1과 0.5, 실수령액 | `withdrawal.ts:19`, `:56`, 독립과 골든 실행 | 유지 |
| F-071 | 저장 접두사와 키와 payload | `labSite.ts:17`, `walletStore.ts:276`, `communityStore.ts:57`, 코드 대조 | 유지. debited 선택 필드 추가 |
| F-072 | 계정별 wallet와 inventory 장부 | `browserWallet.ts:15`, walletHistory 실행 | 유지. 필터만 W2 변화 |
| F-084 | 후기 조건과 보너스 0 | `communityStore.ts:29`, `ReviewSheet.tsx:61`, community 및 게시 실행 | 유지 |
| F-091, F-092, F-093 | 통화 저장, 고정 환율, 양수 표기 | `currencyStore.ts:37`, `:43`, `formatCurrency.ts:43`, formatCurrency 검사 실행 | 유지. 음수 USD의 기존 E-14 남음 |

별도로 F-058 접수 멱등성은 새 취소 실패 분기에서 어긋난다. F-060은 새 기록의 무차감 환불을 막지만 옛 기록의 E-01이 남는다. F-062는 내역 추가가 W2의 의도된 차이다. F-067과 F-068은 각각 E-03과 E-04의 미완료를 위에 적었다.

저장 호환성은 `walletStore.ts:276`의 키, `:278`의 partialize, `:279`의 버전 4와 이동 함수가 그대로임을 확인했다. `debited`만 선택적으로 더해지며 없는 옛 기록을 읽지 못하게 만들지는 않는다. 단, 없는 값을 차감됨으로 해석하여 옛 결함까지 유지하는 문제가 있다. `browserWallet.ts:20`의 직접 복원도 같다. 원본의 E-28인 버전 이동 생략은 새 문제로 세지 않는다.

`inventoryStore.ts:149`, `fairStore.ts:63`, `currencyStore.ts:43`, `settingsStore.ts:44`, `openingJournal.ts:36`, `communityStore.ts:57`, `takeBatch.ts:103`의 저장 이름과 값의 모양에는 diff가 없다. 후기 샘플은 메모리 생성이고 저장된 내 후기나 개봉 기록을 샘플 형식으로 변환하지 않는다. 옛 자료를 못 읽게 하는 이번 변경은 찾지 못했다.

## 6. 검사 실행 수와 보호의 한계

모든 명령은 RTK를 통해 실행했다. TEMP/web은 시작 HEAD 복사본이다.

| 실행 위치 | 명령 | 결과 |
|---|---|---|
| 대상 web | `npx tsx --test tests/parityGolden.test.ts` | 시작 시 파일 없음, 종료 1 |
| TEMP/web, 복원 골든 포함 | 같은 명령 | 6개 통과, 실패 0, 종료 0 |
| TEMP/web | `npx tsc --noEmit -p .` | 타입 오류 0, 종료 0 |
| TEMP/web, 시작 HEAD의 검사만 | `npm test` | 452개, 통과 451, 실패 0, 건너뜀 1, 종료 0 |
| TEMP/web | `npm run lint:design` | new 범위 49파일, 위반 0, 종료 0 |
| TEMP/web, 복원 골든 포함 | `npm test` | 458개, 통과 457, 실패 0, 건너뜀 1, 종료 0 |
| TEMP/web | `npx --no-install tsx --tsconfig tsconfig.json ../independent.mts` | 해시, 추첨표, 돈 경계값, 옛 환불과 helper 중복 계측, 종료 0 |
| TEMP | `node browser.cjs` | 31개 관찰이 기대와 일치, 페이지 오류 0, 종료 0 |
| TEMP | `node browser.cjs --photos` | 3개 관찰이 기대와 일치, 페이지 오류 0, 종료 0 |
| TEMP | `node browser.cjs --orphan` | 4개 관찰이 기대와 일치, 페이지 오류 0, 종료 0 |

건너뜀 한 개는 `freeOpens.test.ts:72`의 실물 전용 박스에 터짐 상품이 없어 건너뛰는 시험이다. 실패 0을 통과 452라고 적지 않았다. 브라우저 관찰의 기대에는 옛 결과 잔존, 앱 없는 변경 차단, 취소 실패의 추적 불가 재현도 포함되어 있다. 관찰 모두 일치가 앱 전체 정상이라는 뜻은 아니다.

대상 web에서도 `npx tsc --noEmit -p . --tsBuildInfoFile TEMP/actual.tsbuildinfo`, `npm test`, `npm run lint:design`을 실행했다. 오류 0, 검사 455개 가운데 통과 454와 건너뜀 1, lint 49파일 위반 0이었다. 타입 검사 캐시를 저장소에 쓰지 않도록 위치를 TEMP로 지정했다. 이 실제 폴더의 시험 수가 452와 다른 것은 감사 중 E-14 등의 커밋이 추가됐기 때문이다. 위 시작 HEAD 복사본의 452개를 이 보고서 범위의 수로 삼는다. 로그는 `actual-tests.log`, `actual-tsc.log`, `actual-lint.log`, `frozen-native-tests.log`에 있다.

원본에서 실패하는지 직접 보기 위해 TEMP/baseline에 `63445c7`의 web을 읽기 전용 archive로 풀고 결과의 `heroBall.test.ts`, `reactStructure.test.ts`, `walletHistory.test.ts`, `withdrawRefund.test.ts`만 복사했다. `npx --no-install tsx --test`로 네 파일을 실행한 결과 24개, 통과 3, 실패 21이었다. GL 누수 다섯 갈래와 false 환불 갈래는 실제 동작 assertion으로 실패했다. React 구조 여섯 검사는 문자열 모양으로 실패했다. walletHistory와 접수 helper 일부는 새 함수 없음으로 실패했다. 새 함수 없음만으로 과거 결함의 행동 재현이 되었다고 주장하지 않는다. 로그는 `baseline-tests.log`다. 이 실행은 구현 전에 작성자가 실패를 보았다는 이력의 증거도 아니다.

`reactStructure.test.ts`는 호출 순서, 정리 함수, alive 초기화, 잠금 상수라는 소스 꼴만 본다. 같은 문자열을 남기고 다른 경로를 깨뜨려도 통과할 수 있고, 동작이 같은 리팩터링도 실패할 수 있다. E-15와 E-16은 이 파일에 검사조차 없다. 새 capture 파일들은 `npm test` glob에 들어가지 않으므로 452개 단위 검사 통과에서 브라우저 동작을 추론하면 안 된다.

## 7. 발견 사항

### 이번 변경이 만든 것

| 번호 | 등급 | 근거 | 영향과 처리 제안 |
|---|---|---|---|
| C1-P1-01 | P1 | `WithdrawScreen.tsx:128`, `:131`, `WalletScreen.tsx:47`, `browser.cjs --orphan` | 차감 실패 뒤 취소 실패를 버리고 접수 추적 정보를 없앤다. 같은 내용 재시도는 새 requestId가 된다. 취소 완료를 확인할 때까지 접수 id와 requestId를 유지하고 실패를 알릴 것. debited가 false인 건을 환불하지 않는 원칙은 유지할 것 |

새 P0을 입증한 것은 없다. 확인된 새 P1은 위 한 건이다. 새 P2를 확정한 것은 없다. 실제 화면에서 남의 거래가 보인다는 주장이나 계정 전환 뒤 다른 계정 로그아웃은 이번에 재현하지 않아 확정 건수에 더하지 않았다.

### 원본에서 남은 것

| 번호 | 등급 | 근거 | 결과 |
|---|---|---|---|
| E-01 옛 기록 | P1 | `walletStore.ts:212`, `:235`, 독립 실행 | debited 없는 무차감 기록은 환불 때 0에서 30으로 증가. 새 발생 방지만 해결 |
| E-03 앱 없는 계정 | P1 | `AccountSheets.tsx:70`, 브라우저 실행 | 이메일 코드 경로 미연결. 앱 연결 안내로 끝남 |
| E-04 | P1 | `AccountSheets.tsx:111`, `browserAccount.ts:147` | 옛 탈퇴 주소를 호출해 계속 실패 |
| E-02 | P1 | `labSite.ts:19`, `opening.ts:92`, `ledgerLock.ts:26` | 저장 한도에서 큰 쓰기 유실. 명세가 보류한 기존 결함, 이번에 재현하지 않음 |
| E-26 | P1 | `WithdrawScreen.tsx:115`, `lib/rollover.ts:16` | 이용 기준 강제 미연결. 명세가 제품 결정으로 보류 |
| E-16 완료 결과 | P2 | `VerifyScreen.tsx:59`, `:70`, 브라우저 실행 | 입력을 바꿔도 이미 표시된 결과는 남음 |
| E-14 | P2 | 시작 HEAD `formatCurrency.ts:20`, 독립 실행 | 음수 USD는 $-50. 나중 커밋은 이번 범위 밖 |
| E-39 구매 응답 | P3 | `BoxScreen.tsx:148` | 구매 응답의 언마운트 보호는 여전히 없음. 이번 W3의 두 받기 대상 밖 |

### 검증 공백과 개선 제안

| 등급 | 근거 | 제안 |
|---|---|---|
| P2 검증 공백 | 시작 HEAD에 골든 검사와 기준 JSON 없음 | 명세 필수 검사 파일을 함께 가져와 재현 가능하게 만들 것. 나중 ab096de는 별도 범위에서 확인할 것 |
| P3 | `walletHistory.test.ts:75` | 번호 없는 앞 계정 배열을 검사에서 먼저 제거하지 말고, 실제 계정 전환 렌더까지 검사할 것 |
| P3 | `reactStructure.test.ts:32`, `AuthHost.tsx:49` | StrictMode, 언마운트 늦은 응답, 구독 해제의 실행 검사를 별도로 유지할 것 |
| P3 | `AccountSheets.tsx:76` | 늦은 비밀번호 응답 뒤 현재 계정이 요청 계정과 같은지 검사하는 사례를 추가할 것 |

이번 실행으로 3회 검수 완료나 배포 가능한 상태를 선언하지 않는다. 시작 HEAD의 구조와 계산 보존은 확인했지만 새 P1 한 건과 기존 미해결 사항, 시각 및 실제 업무 경로의 미실행 범위가 남아 있다.
