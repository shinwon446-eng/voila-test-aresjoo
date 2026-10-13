# 3차 적대적 회귀 검수

원본: `63445c7fa094125bfb1c60d7fccd17dd4005c07d`

결과 HEAD: `27eea0df8367aafeee45d5f9bfbadb5c225ddbc7`

대상: `C:\Users\hyun1\dev\VOILA-audit-reviews`, 브랜치 `migration-result`. 실행 날짜는 한국과 싱가포르 기준 2026-10-13이다. 시작과 검사 종료 직전 HEAD가 같았다.

이번 변경이 만든 것으로 분류한 P0은 0건, P1은 2건이다. 접수 번호가 서비스에 없을 때의 출금 영구 차단과, 결과의 무차감 기록을 원본으로 되돌렸을 때의 잘못된 환불이다. 1차의 단일 탭 접수 유실은 개선됐지만 C1-P1-01의 복구 전체가 닫혔다고 판단할 수 없다. 완료나 배포 가능 여부는 판정하지 않는다.

## 1. 실행 범위와 증거

`AGENTS.md`, `DESIGN.md`, `REDESIGN_BRIEF.md`, `qa/PROGRESS.md`, `migration-audit/BRIEF.md`, `MIGRATION_SPEC.md`, `CYCLE1_codex.md`를 읽었다. 코드 위치는 별도 표시가 없으면 위 HEAD 기준이며 경로는 저장소 기준이다. 원본의 위치는 `63445c7:파일:줄`로 적었다.

코드에서 읽은 것, 직접 실행한 것, 짐작을 구분한다. 직접 실행한 것에는 브라우저에서 본 글과 저장 장부의 값도 포함한다. 아래 브라우저 기록은 통과를 전제로 한 판정이 아니라 관찰값이다.

임시 도구, 소스 복사본, 시험 계정 저장값, 로그와 사진은 모두 `C:\Users\hyun1\AppData\Local\Temp\voila-cycle3-27eea0d`에 있다. 이하 TEMP라고 부른다. 저장소에 쓴 파일은 이 보고서 하나다. 저장소를 바꾸는 git 명령, 커밋, 푸시, `next build`, 개발 서버 시작, 환경 파일과 실제 비밀값 읽기를 하지 않았다.

직접 실행한 것: RTK를 통해 읽기 전용 `git archive`로 원본, HEAD, `7536a58~1`의 필요한 소스를 TEMP에 고정했다. 의존성은 기존 `web/node_modules`를 TEMP의 junction으로 연결했다. 정적 사이트는 원본 `http://127.0.0.1:4175/voila-test-aresjoo/`, 결과 `http://127.0.0.1:4176/voila-test-aresjoo/`를 사용했다. 새 headless Chrome 컨텍스트와 시험 계정만 사용했다.

실패 주입은 브라우저 메모리의 `api.withdraw`, `api.cancelWithdrawal`, `api.withdrawStatus`, Web Locks 응답을 감쌌다. 생산 빌드의 모듈 export는 초기 chunk factory를 감싸 찾아냈다. 앱 소스와 정적 서버 파일은 고치지 않았다. 출금은 실제 `browserAccountRequest`의 시험 장부에서 접수와 취소를 실행했다. 배송 요청과 실제 자산 전송은 실행하지 않았다. 잔액 경합, 없는 서비스 접수, 계정 전환, 늦은 응답을 만드는 주입을 정상 사용자 조작으로 표현하지 않는다.

`auth-cleanup.cjs`만 정적 페이지와 다른 실행이다. HEAD의 실제 `AuthHost`를 React 개발 모드 StrictMode에 묶고 인증, 지갑, 보안 store 연결을 작은 시험용 연결로 대체했다. 구독 해제와 지급 호출을 계측했다. 실제 원격 인증 서비스의 시험은 아니다.

도구 준비 중 생산 빌드의 export 접근, 저장소 접두사, locator와 시험 데이터의 후기 자격 때문에 실패한 실행이 있었다. 현금 상품의 반환값도 독립 도구에서 원가 대신 두 자리 반올림으로 맞춰야 했다. 아래 결과는 수정한 도구의 마지막 실행이다. 이런 도구 실패를 앱 결함으로 세지 않았다.

## 2. C1-P1-01과 출금 실패 경로

코드에서 읽은 것: `web/components/wallet/WithdrawScreen.tsx:139`는 차감 실패 뒤 접수 번호와 `debited: false`를 먼저 저장한다. `:141`에서 취소를 기다리고, 같은 계정과 접수 번호의 응답만 반영한다. 취소 실패 뒤에는 이 기록을 남긴다. `:105`, `:109`, `:120`은 열린 무차감 기록이 있으면 새 신청을 막는다. `web/stores/walletStore.ts:145`는 COMPLETED, CANCELLED, FAILED를 닫힌 상태로 본다.

직접 실행한 명령: `rtk proxy node TEMP/adversarial.cjs`, `rtk proxy node TEMP/supplement.cjs`. 각각 종료 코드 0이다. 기록은 `browser-results.json`, `supplement-results.json`이다.

| 경로 | 직접 실행한 결과 | 코드 근거 |
|---|---|---|
| 접수 응답 직후 잔액 0, 자동 취소 성공 | 서비스와 로컬 모두 CANCELLED 한 건, debited false, 잔액 0. 환불과 완료 화면 없음 | `WithdrawScreen.tsx:133`, `:139`, `:142`, `walletStore.ts:219` |
| 같은 차감 실패, 자동 취소 실패 | 서비스와 로컬에 PENDING_72H_HOLD 한 건. 같은 접수 번호가 남고 잔액 0 | `WithdrawScreen.tsx:139`, `:143` |
| 취소 실패 뒤 새로 고침 | 같은 번호와 false 기록 유지. 열린 요청 안내와 지갑 내역 링크 표시 | `WithdrawScreen.tsx:105`, `:277`, `walletStore.ts:289` |
| 잔액을 10,000으로 보충하고 같은 주소와 50 재신청 | 확인 단계 진입 0, 서비스 접수 1, 로컬 출금 1. 새 요청을 만들지 않음 | `WithdrawScreen.tsx:109`, `:120` |
| 지갑 내역에서 취소 | 서비스와 로컬 CANCELLED, 잔액 10,000 유지. 무차감 취소 문구 표시 | `WalletScreen.tsx:80`, `:86`, `:149` |
| 확인창이 열린 직후 확정 | 취소되지 않고 PENDING_72H_HOLD 유지. 늦춰 자동 실행하는 동작 없음 | `Sheet.tsx:39`, `:41` |
| 잠금 뒤 취소 응답을 지연시키고 두 번 더 누름 | 취소 API 호출 1. 완료 뒤 잔액 증가 없음 | `WalletScreen.tsx:42`, `:81`, `:89`, `Sheet.tsx:51` |
| 서비스 상태만 COMPLETED로 바꾸고 출금 화면에 11초 머묾 | 로컬은 대기, 새 출금 차단 유지 | `WithdrawScreen.tsx:105`, `WalletScreen.tsx:45` |
| 위 상태에서 지갑으로 이동하고 조회 주기 11초를 기다림 | 로컬 COMPLETED, 잔액 10,000 유지. 출금 화면 복귀 뒤 차단 해제 | `WalletScreen.tsx:54`, `:56`, `:59`, `walletStore.ts:146` |
| 서비스에서 접수 번호를 지운 뒤 지갑 조회와 수동 취소 | 로컬은 대기 그대로, 수동 취소 실패. 새로운 출금은 계속 막힘 | `browserAccount.ts:331`, `:332`, `WalletScreen.tsx:57`, `:88` |
| 조회만 계속 실패시키고 수동 취소는 허용 | 조회는 대기를 유지하지만 수동 취소가 CANCELLED로 닫음. 환불 없음 | `WalletScreen.tsx:57`, `:84`, `walletStore.ts:219` |

현재 조회는 지갑 화면에만 있다. 출금 화면에서 기다리는 것만으로 서비스의 종료 상태를 받아오지 않는다. 지갑 방문 뒤 조회가 성공하면 닫힌 접수는 복구된다. 초기 마운트 직후 350ms의 관찰과 10초 조회 주기를 지난 관찰을 혼동하지 않았다.

### 접수가 서비스에 없는 상태

코드에서 읽은 것: 서비스의 없는 번호 응답은 `web/lib/browserAccount.ts:332`의 invalid다. `WalletScreen.tsx:57`은 모든 조회 실패를 마지막 상태 유지로 처리하고, `:88`은 취소 실패만 알린다. 무차감 기록을 종료 상태로 조정하는 별도 경로는 없다. `WithdrawScreen.tsx:109`의 차단은 금액과 주소를 바꿔도 적용된다.

직접 실행한 것: 취소 실패로 생긴 실제 무차감 접수의 서비스 기록만 지웠다. 지갑 조회와 취소를 실행해도 로컬 번호와 대기가 그대로였다. 화면에는 취소할 요청이 있다고 안내하지만 서비스에는 그 번호가 없다. 이는 C3-P1-01이다.

짐작의 한계: 영원이라는 시간 길이를 실측한 것은 아니다. 서비스가 그 번호에 유효한 종료 응답을 주지 않는 조건에서, 코드에 차단을 풀 수 있는 사용자 경로가 없다는 뜻이다. 단순한 일시 조회 실패는 위 표처럼 취소 성공이나 연결 복구로 풀릴 수 있으므로 같은 결함으로 뭉뚱그리지 않는다.

### 두 탭과 계정 전환

직접 실행한 것: `adversarial.cjs`의 두 탭에서는 오래된 탭의 지갑 쓰기를 주입하면 취소된 무차감 기록이 대기로 되살아나 출금이 다시 막혔다. 이는 store 쓰기 주입의 관찰이다. 실제 UI로도 문제가 있는지 따로 `rtk proxy node TEMP/twotabs-delay.cjs 4175`와 `4176`을 실행했다. 두 명령 모두 종료 코드 0이며 `twotabs-delay-4175.json`, `twotabs-delay-4176.json`에 기록했다.

두 빌드에서 동일하게 다음 순서가 재현됐다. 탭 B의 첫 출금 상태 조회 응답을 지연시킨다. 탭 A에서 첫 출금을 취소하고 두 번째 50 출금을 접수한다. 이때 잔액 9,950, 로컬 출금 두 건, 서비스 접수 두 건이다. 탭 B의 옛 대기 응답을 풀면 두 번째 로컬 출금이 사라지고 첫 출금만 대기로 저장된다. 다음 조회가 첫 출금의 CANCELLED를 반영하면서 잔액을 10,000으로 올린다. 서비스의 두 번째 접수는 계속 대기인데 이를 추적할 로컬 줄이 없다. 돈을 직접 바꾸는 주입 없이 UI와 응답 지연만 사용했다.

코드에서 읽은 것: `web/components/wallet/WalletScreen.tsx:50`, `:56`과 `web/stores/walletStore.ts:215`, `:220`은 탭의 메모리 snapshot을 기반으로 상태와 잔액을 저장한다. 출금과 조회는 `web/lib/ledgerLock.ts:51`의 최신 장부 재읽기와 계정별 장부 잠금을 사용하지 않는다. 이 구조는 원본에도 있다. 따라서 위 두 탭의 접수 유실과 중복 환불은 원본의 P1로 분류한다. `recordWithdrawal`의 같은 탭 중복 검사만으로 두 탭을 보호하지 못한다.

직접 실행한 것: 접수 응답을 받은 직후 UI 계정을 A에서 B로 바꾸면 A의 서비스 접수는 남지만 A의 로컬 출금 줄은 생기지 않았다. `WithdrawScreen.tsx:124`가 기록 전에 돌아가는 경로다. 원본에도 `63445c7:web/components/wallet/WithdrawScreen.tsx:119`의 같은 검사가 있어 신규 회귀로 세지 않는다. 기록을 남긴 뒤의 지갑 취소 응답 중 계정을 바꾼 경우 B의 잔액과 장부는 바뀌지 않았고 A에는 대기 기록이 남았다. 후자는 `supplement-results.json`에 있다.

최초 자동 취소 응답 중 계정 전환도 `rtk proxy node TEMP/auto-switch.cjs`로 따로 실행했다. 종료 코드 0이다. A의 서비스 취소를 마치고 UI 응답만 지연한 사이 시험 계정 B로 바꿨다. B의 잔액은 10,000, 출금 기록은 0이었다. A의 로컬 기록은 대기로 남지만 A로 돌아와 지갑 조회를 기다리면 환불 없이 CANCELLED, 잔액 0으로 닫혔다. `auto-switch-results.json`과 `WithdrawScreen.tsx:142`가 근거다.

새 문구에 대한 코드와 실행 결과: `web/messages/v.ko.json:396`의 무차감 취소 안내는 잔액이 실제로 유지되므로 맞는다. 같은 키의 `v.en.json:396`, `v.zh.json:396`도 같은 뜻이다. 반면 `v.ko.json:448`, `v.en.json:448`, `v.zh.json:448`의 열린 요청 안내는 마지막 로컬 상태를 서비스의 현재 사실로 단정한다. 서비스가 이미 끝났거나 번호가 없을 때도 표시됐다. 특히 없는 번호에는 안내한 취소 행동을 성공시킬 수 없다. C3-P1-01의 문구 문제도 여기에 포함한다.

### recordWithdrawal의 멱등 경계

코드에서 읽은 것: `web/stores/walletStore.ts:252`는 type과 serverId만 비교한다. accountId는 비교하지 않는다. 화면의 `WithdrawScreen.tsx:126`도 계정 조건 없이 번호만 먼저 검사한다. 기존 한 계정의 같은 번호 재호출과 취소된 번호 재호출은 차감하지 않는다. 이 부분은 `web/tests/withdrawRefund.test.ts:144`가 검사한다.

직접 실행한 것: `independent.mts`에서 잔액 100인 같은 store에 A의 번호 shared, 금액 30을 기록하고 B의 같은 번호를 넘겼다. B 호출이 A의 레코드를 돌려줬고 잔액 70, 기록 1이었다. 정상 브라우저 namespace 전환도 별도로 `last-checks.cjs`로 실행했다. A 장부에서 번호 shared-receipt를 기록한 뒤 B 장부로 바꿔 같은 번호를 기록하면 B 레코드가 생성되고, A와 B의 잔액은 각각 9,970이었다.

따라서 계정별 장부 키를 정상적으로 유지하는 현재 시험 사이트의 화면에서는 충돌을 재현하지 않았다. 그러나 공용 장부나 서로 다른 accountId가 함께 든 배열에서는 helper의 계정 분리 계약이 부족하다. 이를 C3-P2-02로 기록하며 현재 브라우저 정상 경로의 출금 실패라는 P1로 확대하지 않는다. 서비스 접수 번호가 전 계정에서 유일하다는 가정은 이번 실행으로 입증되지 않았다.

## 3. 수정끼리 부딪치는 자리

### E-08 확인창과 무차감 취소

코드에서 읽은 것: `web/components/ui/Sheet.tsx:40`은 닫힌 렌더에서 잠금 시각을 비우고 다음 열림부터 350ms를 센다. `web/components/wallet/WalletScreen.tsx:149`는 새 무차감 문구와 같은 Confirm을 사용한다. 요청 중에는 `cancelLock`과 busy가 함께 적용된다.

직접 실행한 것: 2절의 실제 취소 확인창에서 초기 확정 폐기, 잠금 뒤 정상 확정, 취소 중 추가 누름의 요청 한 번을 확인했다. 무차감 취소와 정상 출금 취소가 잠금 때문에 끝까지 못 가는 회귀는 재현되지 않았다. 정상 출금은 `compat.cjs`, `reversegen.cjs`, 두 탭 도구에서도 실제 취소했다.

### E-06 내역과 무차감 출금

코드에서 읽은 것: `web/components/wallet/WalletScreen.tsx:72`, `:115`는 debited와 무관하게 amountUsdt를 표시한다. 무차감 설명은 `:140`의 상세 시트에만 있으며, 종료 상태가 되면 isOpenUndebitedWithdrawal이 false이므로 이 설명도 사라진다. 잔액은 `web/stores/walletStore.ts:149`의 crypto와 card 합이다. 입금과 롤오버 누계는 `:181`, `:184`의 거래 종류 조건을 사용하고 무차감 출금을 더하지 않는다.

직접 실행한 것: 잔액을 10,000으로 복구한 상태에서 무차감 대기 줄이 `-$50`으로 보였지만 잔액은 10,000이었다. 취소 뒤에도 `-$50` 줄이 남는다. 실제 출금은 차감하지 않았다는 설명이 목록에 없고, 취소나 완료 뒤 상세에서도 없어지는 표시 문제는 C3-P2-01이다. 실행한 화면에는 거래 합계 숫자가 따로 없었다. 잔액 계산이나 누계가 이 줄 때문에 50 줄어든 수치 회귀는 확인하지 않았다. 실패 주입으로 잔액을 직접 바꾼 시나리오의 전체 거래 합을 정상 장부의 합계 증거로 사용하지 않았다.

원본에서 정상적으로 생성한 장부를 옮긴 시험에서는 보너스 10,000, 개봉 -50, 받기 +160.55, 출금 -50의 합이 잔액 10,060.55와 일치했다. 개봉과 받기 줄이 결과에서 추가로 보이는 것은 명세의 의도된 E-06 차이다. 근거는 `web/lib/browserWallet.ts:9`, `WalletScreen.tsx:68`, `compat-results.json`이다.

### E-14와 통화 전환

직접 실행한 것: `supplement.cjs`에서 같은 무차감 출금의 목록과 상세를 USD, KRW, USDT로 바꿨다. 각각 `-$50`, `-₩60,000`, `-50 USDT`가 나왔고 USDT 기준 잔액은 같았다. 50과 49의 원화 표시가 둘 다 60,000인 것은 기존 만원 아래 버림 때문이다. 수수료는 1,380원으로 표시됐다. 이를 50 - 1 = 49 계산 변경으로 세지 않는다.

이 통화 경계 시험은 currency store를 설정해 실행했다. 특히 현재 화면에는 USDT 선택지가 없으므로 USDT를 사용자 통화 단추로 선택한 시험이라고 표현하지 않는다. 저장된 USDT를 초기 복원 때 USD로 옮기는 기존 규칙은 `web/stores/currencyStore.ts:49`에 그대로 있다.

코드에서 읽은 것: `web/lib/formatCurrency.ts:19`, `:23`, `:24`는 문자열의 부호 위치만 바꿨다. `:35`의 원화 버림과 `web/stores/currencyStore.ts:37`의 환율은 원본과 같다. 지갑은 fmt를 사용한다. `formatCurrency.ts:100`의 분리 표기와 `web/components/ui/Money.tsx:42`의 기호 앞뒤 조합은 이번 수정 대상에 포함되지 않아 음수 분리 표기의 기존 한계까지 해결됐다고 말하지 않는다.

### E-03 세션 폐기와 E-25 구독 정리

직접 실행한 명령: `rtk proxy node TEMP/password.cjs`, `rtk proxy node TEMP/auth-cleanup.cjs`. 두 명령 모두 종료 코드 0이다. `password-results.json`, `auth-cleanup-results.json`이 증거다.

실제 결과 빌드에서 시험용 인증 앱 코드로 비밀번호를 바꾸면 서비스 sessionVersion이 0에서 1로 올라가고 현재 탭의 user가 null, 세션 저장값도 null이 됐다. 변경 응답 직전에 다른 UI 계정으로 바꾸면 그 계정은 남고 그 장부는 오염되지 않았다. `web/components/account/AccountSheets.tsx:65`, `:79`의 재확인이 작동했다. 다만 완료 시트는 새 계정 위에도 표시됐다. 다른 계정으로의 전환은 응답 경합을 만드는 브라우저 주입이며 실제 다른 계정의 원격 로그인 시험은 아니다.

StrictMode에서 A의 hydration 대기 구독은 하나였다. B로 바꾸면 A 구독을 풀고 하나만 남았다. 세션을 비운 뒤 hydration을 끝내면 구독 0, 지급 호출 0이었다. 다시 A의 hydration을 끝내면 A 지급 호출 한 번, 구독 0이었다. 언마운트 뒤에도 구독 0이었다. effect 정리가 이미 해제된 함수를 다시 부를 수는 있지만 zustand unsubscribe는 멱등이다. 근거는 `web/components/auth/AuthHost.tsx:28`, `:43`, `:49`다.

별도로 두 번째 탭을 열고 첫 탭에서 비밀번호를 바꿨다. 두 번째 탭은 저장 세션 null과 서비스 버전 1인데도 UI user capture-account를 유지했다. 코드에서 읽은 원인은 `web/lib/labSite.ts:19`의 접두사를 붙이는 저장소 래퍼와 `web/stores/authStore.ts:101`, `:105`, `:106`의 접두사 없는 StorageEvent.key 비교다. `authStore.ts`와 `labSite.ts`는 원본 대비 diff가 없다. E-25의 지갑 hydration 구독을 고친 것과 다른 기존 세션 동기화 결함으로 분류한다. 포커스와 visibilitychange의 별도 재확인은 `authStore.ts:114`에 남아 있다.

### E-15 초안과 새 후기 목록

직접 실행한 명령: web에서 CAPTURE_BASE를 결과 정적 사이트로 설정하고 `rtk proxy node scripts/capture/flow-review-draft.mjs TEMP/draft`를 실행했다. `run-capture.cjs`가 환경과 로그를 설정했다. 14개 관찰, 통과 14, 실패 0, 종료 코드 0이다. `draft.log`, `draft/review-draft-results.json`에 결과가 있다.

다른 상품 초안, 같은 상품 재열기, 먼저 고른 사진의 1,500ms 지연, 닫은 뒤 사진 완료를 다시 시험했다. 다음 초안은 별점 5, 빈 글, 사진 없음이었고 늦은 빨간 사진은 나중 파란 사진을 덮지 않았다. 별점 4와 글과 사진을 게시하면 저장 후기 한 건과 상품의 게시 완료 표시가 유지됐다. 근거는 `web/components/flow/ReviewSheet.tsx:45`, `:50`, `:58`, `web/components/inventory/InventoryScreen.tsx:186`이다.

실제 원본 개봉 기록에 쓴 후기가 결과의 전체 목록 첫 줄로 표시되는 것도 `compat.cjs`에서 확인했다. 결과에서 새로 만든 후기 두 번째 건도 원본의 후기 화면에서 읽혔다. 저장된 후기 자체를 초안 초기화가 지우는 회귀는 재현되지 않았다. 새 목록의 연결 근거는 `web/components/box/BoxReviews.tsx:140`, `web/components/box/ReviewsScreen.tsx:27`이다.

## 4. 원본 저장값과 배포 되돌리기

직접 실행한 명령: `rtk proxy node TEMP/compat.cjs`, `rtk proxy node TEMP/reversegen.cjs`. 모두 종료 코드 0이다. `old-storage.json`, `head-storage.json`, `compat-results.json`, `reversegen-results.json`을 남겼다.

원본의 가입 UI로 새 계정을 만들고 이메일 코드 단계를 통과했다. 추첨 입력만 골든 시드와 nonce 20으로 고정한 뒤 실제 개봉 UI로 플레이스테이션 박스를 열었다. 169짜리 로데 마이크가 나왔다. 후기 UI로 글을 게시하고 받기 UI로 160.55를 받았다. 이메일 인증 UI로 50 출금을 신청했다. 샘플 상품이나 개봉 기록을 직접 저장소에 조립한 시험이 아니다.

localStorage.key가 반환하는 논리 키의 문자열 값을 모두 추출하고, 다른 출처의 새 컨텍스트 초기화 때 같은 접두사를 붙여 그대로 심었다. 다음 표의 정상 자료는 원본이 만든 version 4 지갑이다.

| 이동 | 직접 실행한 결과 | 코드 근거 |
|---|---|---|
| 원본에서 결과로 | 잔액 10,060.55 그대로, 출금과 개봉과 받기와 보너스 네 건 유지, SOLD 상품과 실제 후기 유지 | `browserWallet.ts:20`, `:25`, `walletStore.ts:289`, `communityStore.ts:57` |
| 결과의 후기 목록 | 실제 후기 한 건과 샘플 79,513건, 총 79,514건. 실제 후기가 첫 줄 | `BoxReviews.tsx:140`, `ReviewsScreen.tsx:27` |
| 결과에서 새 개봉, 받기, 후기, 출금을 추가한 뒤 원본으로 | 잔액 10,121.10 그대로, 거래 일곱 건과 SOLD 상품 둘과 후기 둘 유지. 새 출금에는 debited true | `walletStore.ts:256`, `inventoryStore.ts:149`, `communityStore.ts:57` |
| 위 정상 새 출금을 원본에서 취소 | 잔액 10,171.10. 실제 차감한 50만 돌아옴. 새 후기 글도 원본 화면에서 표시됨 | `63445c7:walletStore.ts:197`, `:200` |
| 결과의 무차감 대기 기록을 원본으로 옮기고 취소 | 기록을 읽기는 하지만 잔액 0이 50으로 늘어남. 서비스와 로컬은 CANCELLED | `WithdrawScreen.tsx:139`, `walletStore.ts:290`, `63445c7:walletStore.ts:200` |

정상 데이터에서 읽지 못하는 값, 사라진 거래나 후기, 잔액 변경은 발견하지 않았다. 원본에서 샘플 대량 후기가 없어지는 것은 샘플이 메모리 생성인 W1의 의도된 역방향 화면 차이다. 실제 내 후기의 저장 유실과 구분한다.

반면 debited false는 원본이 해석하지 않는 의미다. 지갑 버전은 여전히 4라 원본은 이 기록을 거절하거나 변환하지 않는다. 원본의 환불식은 취소액 절대값을 무조건 더한다. 이것이 C3-P1-02다. 필드가 선택적이라 읽힌다는 사실만으로 역방향 돈 호환성을 주장할 수 없다.

코드에서 읽은 것: `web/lib/browserWallet.ts:20`은 state를 직접 복원한다. `web/stores/walletStore.ts:293`의 버전 이동 함수는 원본과 같다. 이번의 실행은 기준 커밋이 실제 생성한 version 4 자료와 HEAD 자료를 대상으로 했다. 더 오래된 version 0에서 3 자료의 브라우저 이전까지 실행했다고 확대하지 않는다. 계정 장부의 직접 복원이 버전 이동을 건너뛰는 기존 한계도 그대로다.

## 5. 불변값과 골든 검사의 실제 보호

직접 실행한 명령: TEMP/before/web과 TEMP/head/web 각각에서 `rtk proxy npx --no-install tsx --tsconfig tsconfig.json TEMP/independent.mts`, `TEMP/money-extra.mts`를 실행했다. 네 실행 모두 종료 코드 0이다. `before-independent.json`, `head-independent.json`에 숫자와 추첨 행을 저장했다.

`web/lib/products.ts:379`의 정렬을 호출하지 않고 상품가 내림차순을 따로 구성했다. slug 순서와 JSON 행, 마지막 LF를 고정해 Node crypto SHA-256을 계산했다. Node createHmac으로 번호를 만들고 독립 누적 구간으로 상품을 골랐다. 앱의 추첨 결과와도 대조했다. 골든 compute helper를 독립 계산의 기대값으로 사용하지 않았다.

| 불변값 | 원본과 HEAD의 직접 결과 | 코드 근거 |
|---|---|---|
| 전체 카탈로그 | 334박스, 상품 행 32,916. SHA-256 `a82f8bd995be27226825ea4e467e124f8a6e77d264f7d26e6fa40bcf5ce2925d` | `products.ts:324`, `:379` |
| 홈 카탈로그 | 320박스. SHA-256 `8bce14b1305f9bc1be28ec08ba9f3e44b704e67610517df6eed0aa842df9c9b0` | `products.ts:345`, `:379` |
| 박스별 확률 합 | 334개 모두 정수 칸 합 1,000,000 | `fairness.ts:92`, `products.ts:379` |
| 모든 상품 구간 양끝 | 65,832개 endpoint 선택이 해당 상품과 일치. 원본과 HEAD 둘 다 | `fairness.ts:101`, `:109` |
| 추첨 기준표 | gaming-playstation, watch-rolex, pokemon-charizard 각각 nonce 0에서 49, 150행 모두 일치 | `fairness.ts:67`, `:109`, `golden/draws.json:7` |
| 받기 | 0.005는 0, 0.015는 0.01, 0.105는 0.10, 1.005는 0.95, 2.675는 2.54, 100은 95. 두 빌드 일치 | `takeBatch.ts:154` |
| 차감과 환급 | NaN, Infinity, 음수, 0과 반 센트, 부족액, crypto 우선, 6자리 출처 비율, 카드 잔여 배분 일치 | `funding.ts:46`, `:63` |
| 출금 | 최소 20, TRC20 수수료 1, BEP20 수수료 0.5. 19.99는 min, 20은 통과, 30.01과 잔액 30은 insufficient | `withdrawal.ts:19`, `:26`, `:56`, `:60` |

독립 돈 계산 표는 106행이며 추가 주소가 유효한 금액 검증 경계는 8건이다. 상품가 0.0049의 현금 지급도 두 자리로 반올림하는 원본 계약을 따랐다. JS toFixed의 반올림을 다른 십진 규칙으로 바꾸지 않았다. 자료와 계산식의 값이 같다는 결론은 새 접수 helper나 환불 상태 전이까지 원본과 같다는 뜻이 아니다. 후자는 W2에서 의도적으로 달라졌다.

직접 실행한 것: TEMP/before/web에서 `rtk proxy npx --no-install tsx --tsconfig tsconfig.json TEMP/golden-baseline.mts`를 실행했다. 저장된 catalog, draws, money의 전체 본문이 원본 소스 계산과 일치했다. 종료 코드 0이다. 이 실행은 골든 helper 자체의 대조이며 앞의 독립 계산과 구분한다.

코드에서 읽은 것: `web/tests/parityGolden.test.ts:28`은 고정 JSON을 읽고 `:34`는 기준 커밋을 확인한다. `:40`, `:51`, `:63`, `:69`는 현재 앱 함수로 계산한 결과를 파일 기대값과 비교한다. 현재 계산 결과를 다른 현재 계산 결과와만 비교하는 검사는 아니다. `migration-audit/harness/golden/generate.ts:29`는 기준 커밋과 dirty lib, stores를 검사하고 `:46`은 기존 파일을 덮어쓰지 않는다.

직접 실행한 것: `rtk proxy node TEMP/mutations.cjs`는 TEMP 복사본의 기대값만 네 번 변조하고 매번 `rtk proxy npx --no-install tsx --test tests/parityGolden.test.ts`를 실행했다. catalog 박스 수 +1, draws 첫 roll +1, money 첫 takeAmount +1, money refundRate 키 삭제가 각각 종료 코드 1로 실패했다. 끝에는 복사본 기대값도 원상 복구했다. 원본 저장소의 기대값은 고치지 않았다. 로그는 `mutation-catalog.log`, `mutation-draws.log`, `mutation-money.log`, `mutation-money-delete.log`다.

골든 catalog의 tableOrder 지문 `67fdb233f46f139d7357f53e2337a5386d27368bc13efec4e136ac9c7b425ed6`은 행 직렬화와 정렬 방식이 위 a82f 지문과 다르다. 서로 다른 형식의 해시를 같은 값이어야 한다고 비교하지 않았다. 골든은 이름과 사진, 상품 종류와 값, 박스와 홈 순서 지문도 검사한다(`golden/compute.ts:103`).

짐작과 한계: 골든 기대값과 계산 코드를 함께 의도적으로 바꾸면 일반 회귀 검사가 이를 막는 외부 서명 체계는 아니다. 메타 설명 문구의 변경도 돈 값 변경과 같지 않다. 이번의 단독 기대값 변조 네 건과 독립 원본 대조는 실제로 실행했다. 출금 복구 UI, 두 탭, 역방향 호환은 골든 검사 범위에 없으며 이번 발견 사항이 전체 검사 통과와 함께 존재한다.

## 6. 범위와 마지막 여섯 커밋

직접 실행한 것: `rtk proxy git diff 63445c7..HEAD --stat`, `--name-status`, `rtk proxy git diff 5ef5b84..HEAD --stat`을 다시 확인했다. 원본 대비 52파일, 추가 10,600줄, 삭제 200줄이다. 1차 뒤에는 22파일, 추가 5,706줄, 삭제 74줄이다. name-status는 A와 M뿐이며 파일 삭제와 이름 변경은 없다. package.json, package-lock.json, pnpm-lock.yaml, yarn.lock의 diff는 0바이트였다. 증거는 `TEMP/scope.json`이다.

| 커밋 | 코드에서 읽은 범위 | 파일과 줄 |
|---|---|---|
| 7536a58 | 첫 후기 언어 위치 조정. 카탈로그와 돈 변화 없음 | `web/lib/reviewSamples.ts:438`, `:461`, `web/tests/reviewSamples.test.ts:143` |
| 42d89e4 | 음수 표시와 관련 검사. E-14는 명세가 제외한 P2이므로 W2 범위를 넓힘 | `web/lib/formatCurrency.ts:19`, `web/tests/formatCurrency.test.ts:1`, `migration-audit/MIGRATION_SPEC.md:15` |
| ab096de | 명세 필수 기준 검사와 JSON, 생성 도구 복원. 런타임 계산 변경 없음 | `web/tests/parityGolden.test.ts:11`, `migration-audit/harness/golden/compute.ts:1`, `generate.ts:1` |
| 61b6c61 | 접수 helper의 serverId 멱등 검사와 단위 검사 | `web/stores/walletStore.ts:252`, `web/tests/withdrawRefund.test.ts:144` |
| 2b6ad44 | 무차감 접수 저장, 재신청 차단, 취소 UI와 문구 두 키, 관련 검사 | `WithdrawScreen.tsx:105`, `:139`, `WalletScreen.tsx:140`, `v.ko.json:396`, `:448` |
| 27eea0d | 비밀번호 요청 시작 계정을 저장하고 완료 때 재확인. 세션 폐기를 현재 계정으로 제한 | `web/components/account/AccountSheets.tsx:65`, `:79` |

코드에서 읽은 것: 후기 CSS 제거는 W1에서 허용한 자리이고, 후기 밖 스타일이나 옛 화면을 삭제하는 후속 변화는 없었다. `web/lib/products.ts:324`, `fairness.ts:67`, `funding.ts:46`, `opening.ts:45`, `takeBatch.ts:154`, `inventoryStore.ts:89`의 계산 파일과 데이터에는 원본 대비 diff가 없다. 새 두 키는 실제 새 화면의 `v.ko.json`, `v.en.json`, `v.zh.json`에 함께 들어갔다. 원래 ko.json, en.json, zh.json의 다른 문구를 고친 변화는 없다.

E-14의 표기 수정은 실행 결과상 필요하고 계산 회귀도 없지만, `MIGRATION_SPEC.md`가 W2를 P1로 제한하고 P2와 P3 수정은 제외한 것과는 범위 차이다. 이 보고서는 그 승인 여부를 추정하지 않는다. C3-P3-01로 문서와 구현 범위 차이를 남긴다. 다른 다섯 후속 커밋은 W1, 명세 필수 검증, 출금 복구와 계정 응답 보호에 대응한다.

## 7. 샘플 후기 결정성과 분포

직접 실행한 명령: TEMP/prelanguage/web과 TEMP/head/web에서 각각 `rtk proxy npx --no-install tsx --tsconfig tsconfig.json TEMP/samples.mts`, 그리고 HEAD에서 `TEMP/samples-repeat.mts`를 실행했다. 모두 종료 코드 0이다. 비교 대상은 7536a58의 바로 앞 커밋 `5ef5b84`와 HEAD다. `prelanguage-samples.json`, `head-samples.json`, `compare-results.json`에 박스별 수와 지문이 있다.

| 검사 | 직접 결과 | 코드 근거 |
|---|---|---|
| 334박스별 건수 | 달라진 박스 0. 총 79,513 | `reviewSamples.ts:507`, `:512` |
| 박스별 언어 수 | 달라진 박스 0. 전체 ko 67,565, en 6,419, zh 5,529 | `reviewSamples.ts:455`, `:469` |
| 박스별 별점 분포 | 달라진 박스 0. 별 1부터 5의 수 1,284, 2,075, 8,880, 22,650, 44,624 | `reviewSamples.ts:590`, `:596` |
| 건별 id, 상품, 별점, 나이 | 334박스에서 지문 차이 0 | `reviewSamples.ts:514`, `:547` |
| 가장 새 글은 ko, 첫 다섯 건의 외국어는 최대 하나 | 위반 박스 0. 첫 1,670건 가운데 외국어 154건 | `reviewSamples.ts:442`, `:464`, `reviewSamples.test.ts:143` |
| 별명, 글, 사진, 좋아요까지 포함한 전체 내용 | 139박스의 지문 변경. 언어 위치와 cast 재구성에 따른 변화 | `reviewSamples.ts:492`, `:534`, `:542`, `:546` |
| 별도 프로세스에서 역순 박스 방문, 5건, 17건, 전체 순서로 생성 | 모든 박스의 전체 지문과 앞부분 동일 | `reviewSamples.ts:505`, `:550` |

따라서 이번 언어 위치 변경을 전체 글과 별명이 전과 같다는 변경으로 설명하면 틀린다. 그러나 요청한 건수, 언어별 총수, 별점, 상품과 시각은 유지됐고 새 생성기의 결정성도 유지됐다. 최초 글의 언어가 달라진 박스는 62개다.

전체 모아 보기의 첫 샘플은 전후 모두 `s-home-braun-0`, 브라운 스타일 키트, 18분 전, 별 5다. 앞 커밋에서는 zh, 작성자 阿福, 중국어 글이었다. HEAD에서는 ko, 산책하는중, 글은 `평타는 쳤네요 하자 없이 깨끗해요`다. 좋아요도 0에서 1로 바뀐다. 상품과 정렬 순서는 유지됐다. `web/lib/reviewSamples.ts:574`, `:580`이 정렬의 근거다.

직접 실행한 것: `rtk proxy node TEMP/screens-summary.cjs`로 내 후기 없는 결과의 실제 `/ko/reviews/`를 읽었다. 첫 줄은 위 한국어 글과 상품가 $49.99, 좋아요 1이었다. 요약은 후기 79,513개, 평균 4.3으로 생성기와 같았다. `reviews-screen.json`에 DOM 글과 aria-label을 기록했다. 실제 내 후기가 있을 때 그것이 첫 줄이 되는 것은 4절에서 따로 확인했다.

## 8. 전체 검사와 1차 판정 재검토

직접 실행한 것: 작업 폴더의 web에서 다음 검사를 실행했다. 타입 검사 캐시만 TEMP로 지정해 저장소를 쓰지 않았다.

| 명령 | 결과 | 관련 파일 |
|---|---|---|
| `rtk proxy npx tsc --noEmit -p . --tsBuildInfoFile TEMP/tsc.tsbuildinfo` | 타입 오류 0, 종료 0 | `web/tsconfig.json:1`, 로그 `TEMP/tsc.log` |
| `rtk proxy npm test` | 총 466, 통과 465, 실패 0, 취소 0, 건너뜀 1, 종료 0 | `web/package.json:10`, 로그 `TEMP/test.log` |
| `rtk proxy npm run lint:design` | new 범위 49파일, 모든 규칙 위반 0, 종료 0 | `web/package.json:11`, `web/scripts/design-lint/config.json:1` |

건너뜀은 `web/tests/freeOpens.test.ts:72`의 실물 전용 박스에 터짐 상품이 없는 경우다. 466개 모두 통과라고 적지 않는다. 골든 검사 6개도 실제 전체 검사에 포함돼 통과했다. E-14의 검사도 포함됐다. `next build`는 지시대로 실행하지 않았다.

코드에서 읽은 것과 직접 실행한 것을 다시 분리하면 다음과 같다.

| 1차 항목 | 이번 재검토 | 근거 |
|---|---|---|
| E-01과 C1-P1-01 | 단일 탭 정상 복구는 실행으로 확인. 없는 번호와 역방향 환불은 새 P1. 옛 무차감 기록과 두 탭 결함은 남음 | 2절, 4절, `walletStore.ts:219`, `:252` |
| E-06 | 실제 원본 장부의 open과 sellback이 결과에서 보임. 무차감 줄의 표시 혼동은 별도 P2 | 3절, `browserWallet.ts:9` |
| E-08 | 실제 무차감 취소의 초기 잠금과 요청 중 연타 검사. 업무를 막는 회귀 없음 | 2절, `Sheet.tsx:41` |
| E-03과 E-25 | 정상 비밀번호 변경, 늦은 응답 계정 보호, hydration 구독 정리 실행. 앱 없는 계정과 다른 탭의 세션 표시는 별도 기존 문제 | 3절, `AccountSheets.tsx:73`, `AuthHost.tsx:49`, `authStore.ts:105` |
| E-15 | 초안과 사진 경합 14개 관찰을 정적 결과 빌드에서 다시 실행. 저장 후기와 새 목록 호환도 실행 | 3절, `ReviewSheet.tsx:45`, `:52` |
| E-16 | `last-checks.cjs`로 정상 결과 3행, 입력 변경 뒤 옛 3행 잔존, 계산 중 변경 뒤 busy 해제와 옛 결과 잔존을 다시 실행 | `VerifyScreen.tsx:58`, `:68`, `:73` |
| E-19와 E-20 | 훅 이동과 GL 실패 정리 diff를 다시 읽음. 전체 검사에서 heroBall 실패 경로 5개와 정상 2개가 통과 | `HeroBanner.tsx:130`, `heroBall.ts:82`, `heroBall.test.ts:54` |
| E-39 | 정상 결과 빌드 받기와 저장 결과는 실행. alive 재설정과 응답 직후 검사는 코드 재대조. 이번에 두 컴포넌트의 늦은 언마운트 응답 setter를 별도로 계측하지 않음 | `Reveal.tsx:93`, `:134`, `InventoryScreen.tsx:72`, `:96` |

픽셀 전수 비교, 개봉 단계 시간 실측, 실제 스크린 리더, 원격 인증과 출금 서비스의 시험은 이번 실행 범위에 없다. 특히 `web/tests/reactStructure.test.ts:10`의 소스 문자열 검사를 UI 동작과 구독의 실행 증거로 바꾸어 부르지 않는다.

## 9. 발견 사항의 등급과 귀속

### 이번 변경이 만든 것

| 번호 | 등급 | 파일과 줄 | 발견과 확인 수준 |
|---|---|---|---|
| C3-P1-01 | P1 | `web/components/wallet/WithdrawScreen.tsx:109`, `:120`, `web/components/wallet/WalletScreen.tsx:57`, `web/lib/browserAccount.ts:332` | 직접 실행. 서비스에 없는 접수 번호를 가진 무차감 기록이 취소와 조회 모두 실패해 모든 새 출금을 계속 막는다. 원본에는 이 전역 차단이 없다. 없는 번호와 일시 조회 실패를 구별하는 조정 경로가 필요하다 |
| C3-P1-02 | P1 | `web/components/wallet/WithdrawScreen.tsx:139`, `web/stores/walletStore.ts:290`, `63445c7:web/stores/walletStore.ts:200` | 직접 실행. 새 debited false 기록을 원본으로 되돌리고 취소하면 0이 50이 된다. 원본 환불의 기존 약점에 새 저장 의미가 부딪치는 역방향 호환 회귀다. 정상 true 기록의 환불과 구분해야 한다 |
| C3-P2-01 | P2 | `web/components/wallet/WalletScreen.tsx:115`, `:140`, `web/stores/walletStore.ts:146` | 직접 실행과 코드. 목록의 무차감 요청은 차감한 출금과 같은 음수 줄이며 종료 뒤 상세 설명도 사라진다. 잔액 계산의 오류를 입증한 것은 아니다 |
| C3-P2-02 | P2 | `web/stores/walletStore.ts:252`, `web/components/wallet/WithdrawScreen.tsx:126` | 같은 store에 다른 계정 레코드가 있을 때의 함수 실행으로 확인. B의 같은 번호에 A 기록을 반환한다. 실제 계정별 namespace 전환은 정상. 현재 시험 사이트의 정상 UI P1로 확대하지 않는다 |
| C3-P3-01 | P3 | `web/lib/formatCurrency.ts:19`, `migration-audit/MIGRATION_SPEC.md:15` | 코드와 diff. 제외한 P2 E-14를 후속 커밋이 수정했다. 계산 회귀는 없으나 명세 범위 변경의 근거를 별도로 남길 필요가 있다 |
| C3-P3-02 | P3 | `web/tests/withdrawRefund.test.ts:144`, `web/tests/parityGolden.test.ts:67`, `web/tests/reactStructure.test.ts:58` | 검사 범위의 개선 제안. 없는 접수의 복구, 두 탭의 최신 장부, 되돌리기, 다른 계정의 같은 번호를 현재 전체 검사 성공이 보증하지 않는다. 이번 도구의 재현을 유지 가능한 동작 검사로 남길 필요가 있다 |

P0으로 확정한 신규 발견은 없다. C3-P1-02는 시험 장부의 잘못된 환불이며 실제 돈 전송을 관찰한 것은 아니다. 기존 E-01과 같은 계산 결함의 P1 기준으로 분류했다.

### 원본에 원래 있던 것

| 항목 | 등급 | 파일과 줄 | 이번 증거 |
|---|---|---|---|
| 두 탭의 늦은 조회가 새 출금을 지우고 환불을 다시 함 | P1 | `web/components/wallet/WalletScreen.tsx:56`, `web/stores/walletStore.ts:215`, `63445c7:web/stores/walletStore.ts:197` | 두 빌드의 실제 UI와 조회 응답 지연으로 동일하게 재현. 9,950이 10,000, 서비스의 두 번째 대기는 남음 |
| 접수 응답 직전 계정 전환의 A 접수 유실 | P1 | `web/components/wallet/WithdrawScreen.tsx:124`, `63445c7:web/components/wallet/WithdrawScreen.tsx:119` | 결과에서 실행, 원본의 동일 분기 코드 확인. B 오염 방지를 위해 응답을 버리지만 A 접수도 기록하지 않음 |
| debited 없는 옛 무차감 기록 환불 | P1 | `web/stores/walletStore.ts:219`, `63445c7:web/stores/walletStore.ts:200` | 두 소스에서 money-extra.mts 실행. 잔액 0, 무차감 옛 기록을 FAILED로 바꾸면 30 |
| 앱 없는 계정의 비밀번호 변경 | P1 | `web/components/account/AccountSheets.tsx:73`, `web/lib/account.ts:240` | 이번에는 코드 재확인. 이메일 발급 경로 미연결과 앱 안내 종료가 남음 |
| 다른 탭의 세션 폐기 표시가 늦음 | P1 | `web/stores/authStore.ts:101`, `:105`, `:106`, `web/lib/labSite.ts:19` | 결과의 두 탭에서 직접 재현. 해당 소스는 원본과 동일. 포커스 재확인과 별개로 저장 이벤트를 놓침 |
| 탈퇴 E-04 | P1 | `web/components/account/AccountSheets.tsx:114`, `web/lib/account.ts:191`, `web/lib/browserAccount.ts:147` | 코드 재확인. 옛 closure 주소와 verification_required 거절이 그대로. 이번에 UI 탈퇴를 끝까지 실행한 것으로 적지 않음 |
| 저장 공간 E-02 | P1 | `web/lib/labSite.ts:19`, `web/lib/opening.ts:92`, `web/lib/ledgerLock.ts:30` | 코드와 명세의 기존 보류. 이번 저장 공간 초과 재현은 하지 않음 |
| 출금 이용 기준 E-26 | P1 | `web/components/wallet/WithdrawScreen.tsx:120`, `web/lib/rollover.ts:24` | 코드에서 이용 기준 검사 미연결 확인. 초기 totalWagered 0인 시험 계정의 출금 접수도 실행. 제품 결정 보류 항목 |
| 완료된 수동 검증 결과 잔존 E-16 | P2 | `web/components/verify/VerifyScreen.tsx:58`, `:68` | 결과 화면에서 직접 재현. 입력을 바꿔도 옛 3행이 남음. 기존 문제 |
| 금액 분리 표기의 음수 E-14 잔여 | P2 | `web/lib/formatCurrency.ts:100`, `web/components/ui/Money.tsx:42` | 코드만 확인. 지갑의 fmt는 고쳐졌으며 다른 분리 표기까지 고쳐졌다고 하지 않음 |
| 구매 응답의 생존 보호 E-39 잔여 | P3 | `web/components/box/BoxScreen.tsx:148` | 코드 재확인. W3의 두 받기 대상 밖. 이번에 늦은 구매 응답을 계측하지 않음 |

이번 변경이 만든 P0은 0건, P1은 2건이므로 이번 변경이 만든 P0과 P1이 모두 0인 상태는 아니다.
