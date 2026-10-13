# CYCLE3b Codex 좁은 재검수

검수일: 2026-10-13. 작업 폴더: C:\Users\hyun1\dev\VOILA-audit-reviews. 브랜치: migration-result. 대상 HEAD: 3075a4579f47869f737fff449da7a38b231185d8. 기준: 63445c7. 직전 커밋: 27eea0df8367aafeee45d5f9bfbadb5c225ddbc7.

## 1. 판정과 범위

새로 생성하는 장부 금액 0 출금 줄에서는 네 항목의 재현이 해소됐다. 그러나 3차 구현이 이미 저장한 음수 금액과 debited false 줄을 유지하면, HEAD에서 취소할 때 잔액 0이 50이 된다. 따라서 저장값을 유지한 갱신까지 포함한 네 항목의 무조건적인 종결은 확인하지 못했다.

| 3차 항목 | 최종 판정 | 근거 |
|---|---|---|
| C3-P1-01 | 닫힘 | 없는 번호는 브라우저 서비스에서 환불 없이 FAILED로 닫힌다. 조회와 취소가 계속 실패해도 새 신청을 막지 않는다. 서버 모드의 줄 종료에는 잔여 한계가 있지만 전역 출금 차단은 사라졌다 |
| C3-P1-02 | 일부만 | HEAD가 새로 만든 0 줄을 원본으로 옮겨 취소하면 0을 유지한다. 중간 버전의 기존 debited false 음수 줄은 변환하지 않아 HEAD에서도 0이 50이 된다 |
| C3-P2-01 | 일부만 | 새 0 줄은 목록과 종료 뒤 상세에서 차감하지 않았다고 표시한다. 중간 버전의 기존 줄은 여전히 -$50이고 무차감 설명이 없다 |
| C3-P2-02 | 닫힘 | 같은 store의 다른 계정과 같은 번호가 별도 줄이 된다. 계정별 namespace 전환도 서로의 장부를 보존한다 |

직접 실행: 이미 떠 있는 http://localhost:3003 의 HEAD 화면과 3차 때 사용한 원본 정적 서버 http://127.0.0.1:4175/voila-test-aresjoo 를 사용했다. 원본 정적 자료의 walletStore.ts를 63445c7의 Git 본문과 대조해 줄 끝 형식 외 차이가 없음을 확인했다. 원본 환불 함수의 실행은 Git에서 추출한 원본 store 모듈로도 별도 확인했다. 새 서버와 빌드를 만들지 않았다.

읽은 자료: CYCLE3_codex.md 2절, 3절, 4절, 9절, DESIGN.md, REDESIGN_BRIEF.md, qa/PROGRESS.md, 관련 저장소 규범과 코드. git show 3075a45 --stat와 전체 diff를 읽었다. 커밋은 9파일, 추가 441줄, 삭제 210줄이다.

저장소에는 이 보고서만 썼다. Git을 변경하는 명령, next build, 환경 파일 읽기나 수정, 실제 돈 전송은 실행하지 않았다. 모든 임시 스크립트와 로그는 저장소 밖의 C:\Users\hyun1\AppData\Local\Temp\voila-cycle3b-3075a45 에 있다. 아래에서는 이를 TEMP라고 적는다. 화면 실패 주입은 격리된 시험 브라우저의 메모리와 저장값에만 적용했다.

## 2. 원본 대비 walletStore의 모든 다른 줄

직접 실행: rtk proxy git diff 63445c7 HEAD -- web/stores/walletStore.ts. 결과는 추가 41줄, 삭제 0줄, 변경 구역 네 곳이다. 환불 함수 둘에는 다른 줄이 없다.

Git의 원본 본문과 HEAD 본문에서 함수 시작부터 다음 함수 직전까지 추출해 문자열 전체를 비교했다. syncWithdrawal은 507문자 대 507문자, cancelHeldWithdrawal은 558문자 대 558문자로 각각 완전히 같았다. 로컬 작업 파일의 CRLF와 Git 본문의 LF를 섞어 비교하지 않았다. 근거: TEMP/source-comparison.json, TEMP/original-walletStore.ts, TEMP/wallet.diff.

| HEAD 위치 | 다른 줄 전부의 범위 |
|---|---|
| web/stores/walletStore.ts:62 | requestedUsdt 설명 네 줄과 필드 한 줄, 합계 5줄 |
| web/stores/walletStore.ts:108 | recordWithdrawal 계약과 closeUnknownWithdrawal 계약, 합계 13줄 |
| web/stores/walletStore.ts:148 | 표시용 isUndebitedWithdrawal 설명과 함수, 빈 줄 포함 6줄 |
| web/stores/walletStore.ts:255 | recordWithdrawal 11줄과 closeUnknownWithdrawal 6줄, 합계 17줄 |

아래 diff가 다른 줄의 전체 목록이다. 글 규칙을 지키기 위해 소스의 논리 부정과 불일치 연산자에 있는 U+0021 문자는 문자 이름을 나타내는 \u0021로 적었다. 이 표기 변경은 보고서에만 적용했으며 비교에는 원문을 썼다.

~~~diff
diff --git a/web/stores/walletStore.ts b/web/stores/walletStore.ts
index c6ae628..d6ad91f 100644
--- a/web/stores/walletStore.ts
+++ b/web/stores/walletStore.ts
@@ -59,6 +59,11 @@ export interface Transaction {
   unlockAt?: number;
   /** 인증에 쓴 이메일(마스킹), 원문은 저장하지 않는다 */
   emailMasked?: string;
+  /**
+   * 서비스는 접수했는데 잔액에서 차감하지 못한 출금 요청이 신청했던 금액. 표시에만 쓴다(돈은 움직이지 않는다).
+   * 이런 줄의 장부 금액(amountUsdt)은 0 이다. 환불은 장부 금액만큼이라, 취소되거나 실패해도 돌아올 것이 없다.
+   */
+  requestedUsdt?: number;
   /** 카드 결제 영수증 번호, PG 가 준 값만 들어간다 */
   receipt?: string;
   /**
@@ -100,6 +105,19 @@ interface WalletState {
    * 대기 상태가 아니거나 이미 취소된 건이면 아무것도 하지 않고 false, 중복 환불이 일어날 수 없다.
    */
   cancelHeldWithdrawal: (id: string) => boolean;
+  /**
+   * 서비스가 접수한 출금을 장부에 적는다. 접수 번호(serverId)는 언제나 한 줄로 남는다.
+   *   끝나지 않은 접수: 암호화폐 잔액에서 차감하고 그 금액의 줄을 적는다. 차감하지 못하면 잔액을 건드리지 않고
+   *     장부 금액 0 인 줄을 적는다(신청한 금액은 requestedUsdt 에만). 환불은 장부 금액만큼이라 이 줄은 환불될 것이 없다.
+   *   이미 취소나 실패로 온 접수: 차감 없이 줄만 남긴다(끝난 줄은 환불하지 않는다).
+   * 같은 계정의 같은 접수 번호가 이미 있으면 그 줄을 돌려주고 아무것도 바꾸지 않는다.
+   */
+  recordWithdrawal: (tx: Omit<Transaction, "id" | "at" | "requestedUsdt">) => Transaction;
+  /**
+   * 서비스가 그 접수 번호를 모른다고 답했을 때: 차감하지 않은 요청(장부 금액 0)이 아직 열려 있으면 실패로 닫는다. 환불은 없다.
+   * 차감한 출금은 건드리지 않는다(false). 일시적인 조회 실패에는 부르지 않는다.
+   */
+  closeUnknownWithdrawal: (id: string) => boolean;
   /** 차감(암호화폐 우선 → 모자라면 카드 결합). 부족하면 false 를 돌려주고 아무것도 바꾸지 않는다. */
   debit: (usdt: number) => boolean;
   /** 차감 + 이번 지출의 족보(비율)를 돌려준다, 개봉이 쓴다. 부족하면 null. */
@@ -127,6 +145,12 @@ interface WalletState {
   claimWelcome: (accountId: string) => boolean;
 }
 
+/**
+ * 잔액에서 차감하지 않은 출금 요청의 줄인가(recordWithdrawal 이 장부 금액 0 으로 적은 것). 열려 있을 때도 끝난 뒤에도 같다.
+ * 화면이 이 줄을 차감한 출금처럼 적지 않게 하는 표시용 판정이다. 돈의 판정은 여기에 기대지 않는다(환불은 장부 금액만큼이다).
+ */
+export const isUndebitedWithdrawal = (tx: Transaction): boolean => tx.type === "withdraw" && typeof tx.requestedUsdt === "number";
+
 /** 두 버킷 → 표시용 총 잔액. balance 는 항상 여기서만 계산된다(어긋날 수 없다). */
 const sync = (cryptoBalance: number, cardBalance: number) => ({ cryptoBalance, cardBalance, balance: +(cryptoBalance + cardBalance).toFixed(2) });
 let transactionSequence = 0;
@@ -228,6 +252,23 @@ export const useWalletStore = create<WalletState>()(
         }));
         return true;
       },
+      recordWithdrawal: (tx) => {
+        // 같은 계정의 같은 접수 번호는 한 번만 적는다: 이미 있는 줄을 돌려주고 아무것도 바꾸지 않는다(두 번 차감하지 않는다)
+        const existing = tx.serverId ? get().transactions.find((x) => x.type === "withdraw" && x.serverId === tx.serverId && x.accountId === tx.accountId) : undefined;
+        if (existing) return existing;
+        const amount = Math.abs(tx.amountUsdt);
+        const open = \u0021["CANCELLED", "FAILED"].includes(tx.status ?? "");
+        if (\u0021open || get().debitCrypto(amount)) return get().addTransaction(tx);
+        // 차감하지 못했다: 장부 금액 0 인 줄. 받는 금액처럼 읽힐 칸(수수료, 받는 금액)은 적지 않고, 신청한 금액은 표시 칸에만 둔다
+        const { feeUsdt: _fee, netUsdt: _net, ...rest } = tx;
+        return get().addTransaction({ ...rest, amountUsdt: 0, requestedUsdt: amount });
+      },
+      closeUnknownWithdrawal: (id) => {
+        const tx = get().transactions.find((x) => x.id === id);
+        if (\u0021tx || \u0021isUndebitedWithdrawal(tx) || tx.amountUsdt \u0021== 0 || ["COMPLETED", "CANCELLED", "FAILED"].includes(tx.status ?? "")) return false;
+        get().syncWithdrawal(id, "FAILED");
+        return true;
+      },
       debit: (usdt) => get().debitSplit(usdt) \u0021== null,
       debitCrypto: (usdt) => {
         const s = get();
~~~

코드에서 읽은 것: 새 줄은 amountUsdt 0, requestedUsdt 신청액이고 feeUsdt와 netUsdt를 제거한다. 환불은 원본처럼 amountUsdt 절댓값만 사용한다. 표시 판정은 requestedUsdt의 존재를 보며 돈 계산은 그 칸을 보지 않는다. recordWithdrawal과 출금 화면의 중복 접수 검사는 accountId도 비교한다. 전역 차단과 새 Transaction.debited 선언은 없어졌다.

## 3. 3차와 같은 방법으로 다시 실행한 결과

방법: 실제 출금 입력, 이메일 인증, 신청, 지갑 상세와 취소 확인창을 눌렀다. 3차 browserlib.cjs와 같은 모듈 관찰 장치를 TEMP로 복사했다. 서비스 접수 응답 직후 지갑 잔액을 0으로 바꾸고 자동 취소를 실패시켰다. 없는 번호는 실제 시험 서비스의 저장된 접수만 삭제했다. 조회와 취소의 일시 실패는 호출을 던지도록 주입했다. 새로 고침 뒤에는 실패 장치도 다시 설치했다. 실제 로컬 서비스의 접수 번호와 지갑 저장값을 함께 읽었다.

금액은 USDT 수치다. 아래 Z는 차감하지 못한 요청, N은 그 뒤 정상 차감된 새 요청이다. Z와 N은 실제로 다른 serverId였다. 대기는 PENDING_72H_HOLD를 뜻한다. 새 Z의 feeUsdt, netUsdt, debited는 모두 저장하지 않았다.

| 실행 경로 | 서비스 응답 또는 실패 | 저장된 줄 | 암호화폐 잔액 | 서비스에 남은 접수 | 판정 |
|---|---|---|---:|---|---|
| 접수 직후 차감 실패, 자동 취소 성공 | CANCELLED | Z: amount 0, requested 50, CANCELLED | 0 | CANCELLED 한 건 | 닫힘 |
| 접수 직후 차감 실패, 자동 취소 실패 | 주입한 일시 오류 | Z: 0, 50, 대기 | 0 | 대기 한 건 | 닫힘. 번호 보존과 무환불 확인 |
| 위 상태에서 새로 고침 | 출금 화면에는 조회 호출 없음 | 같은 Z의 id와 serverId, 0, 50, 대기 보존 | 0 | 같은 대기 한 건 | 일부만. 보존은 성공, 출금 화면 안내는 사라짐 |
| Z를 서비스에서 삭제하고 지갑 조회 | WithdrawalUnknown, code invalid | Z: 0, 50, FAILED | 보충한 10,000 유지 | 해당 번호 없음 | 닫힘 |
| 조회를 실패시키고 없는 Z를 수동 취소 | WithdrawalUnknown, code invalid | Z: 0, 50, FAILED | 0 | 해당 번호 없음 | 닫힘 |
| 첫 자동 취소 직전에 Z를 서비스에서 삭제 | WithdrawalUnknown, code invalid | Z: 0, 50, FAILED | 0 | 해당 번호 없음 | 닫힘 |
| 없는 Z가 닫힌 뒤 50 새 신청 | 새 N 접수 대기 | Z FAILED 유지, N amount -50, net 49, 대기 | 10,000에서 9,950 | N 대기 한 건 | 닫힘 |
| 새로 고침 뒤 조회 두 번과 수동 취소 모두 실패 | 조회 오류 두 번, 취소 오류 한 번 | Z: 0, 50, 대기 유지 | 보충한 10,000 유지 | Z 대기 한 건 | 닫힘. 일시 오류를 없는 번호로 오판하지 않음 |
| 위 실패 상태에서 50 새 신청을 끝까지 실행 | 새 N 접수 대기 | Z 0과 N -50 두 줄, 서로 다른 번호 | 9,950 | Z와 N 대기 두 건 | 닫힘. 새 출금 차단 없음 |
| HEAD가 만든 새 Z를 원본 화면으로 옮겨 취소 | 서비스 CANCELLED | 원본도 Z amount 0, requested 50, CANCELLED 저장 | 0에서 0 | CANCELLED 한 건 | 닫힘 |
| HEAD가 만든 정상 N을 원본 화면에서 취소 | 서비스 CANCELLED | N amount -50, CANCELLED, requested 칸 없음 | 9,950에서 10,000 | CANCELLED 한 건 | 닫힘 |
| 같은 store, A와 B의 shared 번호 각각 30 | helper 실행 | A와 B의 별도 id, 각각 -30. B 재호출은 B id | 100에서 40, B 재호출 뒤 40 | 원격 접수 시험 아님 | 닫힘 |
| 실제 계정 장부 namespace A와 B의 same-id | restoreBrowserAssets와 helper 실행 | A와 B 각 장부에 자기 줄 한 건 | 각각 100에서 70 | 원격 접수 시험 아님 | 닫힘 |
| 직전 구현이 만든 debited false 줄을 HEAD로 복원 후 취소 | 원본과 같은 환불 함수 실행, UI에서는 서비스 CANCELLED | amount -50, debited false가 그대로 남고 CANCELLED | 0에서 50 | UI 시험에서는 CANCELLED 한 건 | 안 닫힘. 6절의 잔여 P1 |

직접 실행한 명령과 근거: rtk proxy node TEMP/browser-check.cjs, TEMP/extra-browser.cjs, TEMP/poll-ended.cjs. 각각 최종 종료 코드 0. TEMP/browser-results.json, TEMP/extra-browser.json, TEMP/poll-ended.json에 저장값, 응답 상태, DOM 글이 있다. browser-check의 처음 시도는 검수 스크립트의 없는 지갑 링크 선택으로 중단됐다. 실제 메뉴 링크로 고쳐 재실행했고 표에는 끝난 실행을 사용했다.

함수 실행: web에서 rtk proxy npx --no-install tsx --tsconfig tsconfig.json TEMP/probes.mts와 TEMP/parent-probe.mts. 모두 종료 0. 교차 계정과 원본 환불 비교는 TEMP/probes.json, 실제 직전 store가 만든 저장값은 TEMP/parent-probe.json에 있다. 이 helper 실행을 실제 다른 계정의 원격 출금 시험이라고 부르지 않는다.

## 4. 새 0 줄의 계산, 정렬, 표시와 다른 화면

| 검사 | 직접 실행한 결과 | 코드에서 읽은 근거 |
|---|---|---|
| 거래 합과 잔액 | store로 입금 +100, 개봉 -100, 차감 실패 출금 0, 받기 +25를 만들었다. 거래 합 25, crypto 25, card 0, balance 25. 중복 보너스가 생기지 않도록 기존 가입 보너스 표시는 금액 0으로 유지했다 | walletStore.ts:154, :181, :255 |
| 입금과 이용 누계 | totalDepositedCrypto 100, totalDeposited 100, totalWagered 100. 0 출금과 requested 50이 누계에 더해지지 않음 | walletStore.ts의 addTransaction은 입금과 open만 누계에 반영 |
| 내역 정렬 | 시각을 1분씩 다르게 둔 배열에서 받기, 0 출금, 개봉, 입금 순으로 보였다. 계정 번호 없는 open과 sellback도 표시 | WalletScreen.tsx:72, browserWallet.ts:9 |
| 열린 Z 목록 | 금액 $0, 상태 72시간 보안 대기, 차감하지 않음. -$50로 표시하지 않음 | WalletScreen.tsx:122, :123 |
| 열린 Z 상세 | 금액 $0, 신청한 금액 $50, 무차감 안내. 수수료와 받는 금액 행 없음. 취소 단추 있음 | WalletScreen.tsx:138, :140, :143, :150, :152 |
| 취소 또는 실패 뒤 상세 | 신청액과 무차감 안내가 계속 남고 취소 단추는 사라짐 | 표시 판정은 종료 상태에 의존하지 않음 |
| 완료 뒤 상세 | 서비스 Z를 COMPLETED로 바꾸고 조회 주기를 지난 뒤에도 금액 $0, 신청액 $50, 무차감 안내, 상태 완료. 잔액 증가나 추가 차감 없음 | syncWithdrawal은 COMPLETED에서 환불하지 않음 |
| 잔액 시트 | 개봉에 쓸 잔액 $25, 출금할 수 있는 잔액 $25. Z의 requested 50이 잔액에 섞이지 않음 | BalanceSheet.tsx:29, :30 |
| 출금 입력 화면 | 출금할 수 있는 잔액 $25. Z가 열려 있어도 전체 잔액을 0 또는 -25로 바꾸지 않음 | WithdrawScreen.tsx:45, :120 |
| 카드만 있는 상태 | crypto 0, card 120에서 신청 30은 amount 0 줄. 실패 반영 뒤 crypto 0, card 120, balance 120 | debitCrypto는 카드 잔액을 건드리지 않음 |

합계 시험은 지갑 store 함수를 직접 실행한 자료다. 실제 개봉과 받기 UI를 새로 모두 밟은 시험은 아니다. 접수 후 잔액을 강제로 0으로 만든 실패 시험의 거래 합을 정상 장부 합계의 증거로 쓰지 않았다. extra-browser.cjs의 sum-25와 balance-25가 위 수치의 근거다. browser-check.cjs의 최초 합계 보조 fixture에는 가입 보너스 재지급이 섞여 이 목적의 근거에서 제외했고, 이를 바로잡은 extra-browser 결과를 사용했다.

정상 차감 출금의 환불: 원본 store와 HEAD에 같은 version 4 저장값을 넣고 syncWithdrawal의 CANCELLED와 FAILED, cancelHeldWithdrawal을 각각 두 번 실행했다. 차감한 50만 한 번 돌아왔고 두 버전 결과가 같았다. COMPLETED는 두 버전 모두 환불하지 않았다. 새 0 줄에서는 모든 경우 환불 0이었다. 실제 HEAD와 원본 UI에서도 정상 50 취소의 잔액 9,950에서 10,000 복구를 확인했다.

## 5. 요청 둘이 남는 설계와 서버 모드의 한계

직접 실행: 조회와 취소 실패 중 새 신청을 마쳤다. 서비스에 대기 접수 둘, 지갑에 Z amount 0과 N amount -50이 남았다. 잔액은 9,950이다. 새 접수는 새 번호였고 Z를 덮거나 다시 차감하지 않았다. Z의 요청액 50을 원본이나 HEAD 환불이 더하는 길도 새 저장꼴에서는 없었다.

직접 실행: 두 접수의 서비스 상태를 Z COMPLETED, N FAILED로 바꾼 뒤 지갑 조회 주기를 11초 기다렸다. 로컬도 각각 같은 상태로 바뀌고 잔액 10,000이 됐다. N의 실제 차감 50만 돌아오고 Z에서는 환불되지 않았다. 별도 정상 합계 자료에서도 Z와 N을 모두 COMPLETED로 맞추면 잔액과 거래 합은 50을 유지했다. 근거: TEMP/poll-ended.json, TEMP/probes.json.

코드에서 읽은 것: 브라우저 시험 서비스는 /withdraw에서 번호와 상태만 저장하고 실제 지급이나 서버 잔액 계산을 하지 않는다. browserAccount.ts:321부터 :337까지는 접수와 상태 응답 계약이다. 따라서 서비스에 접수가 둘 남았다는 사실을 실제 100 송금이나 이중 지급의 증거로 바꾸지 않는다. 실제 서버의 자금 예약과 지급 구현은 이 저장소에서 확인할 수 없다.

짐작: 실제 서버가 첫 요청을 예약했거나 지급할 수 있고, 클라이언트가 그 돈을 다른 소비와 새 요청에 계속 쓸 수 있다면 서버가 최종 잔액과 예약을 강제해야 한다. 이번 시험으로 그 서버 계약이 안전하다고 보증할 수 없다. 확인한 클라이언트의 새 0 줄 계산은 틀어지지 않았다. 현재 브라우저 시험 서비스에서 확인한 잔여 문제는 저장된 미확인 요청의 안내다.

직접 실행한 안내 문제: 차감 실패 직후에는 취소를 확인하지 못했다는 안내와 지갑 내역 링크가 나왔다. 새로 고침 뒤 이메일 출금 입력으로 들어가면 같은 열린 Z가 저장돼 있어도 그 안내가 없다. unconfirmedId가 화면의 지역 상태이고 저장된 열린 줄에서 복원하지 않기 때문이다(WithdrawScreen.tsx:105, :106). 새 요청을 내면 사용자는 앞 요청이 남았다는 사실을 출금 입력에서 다시 안내받지 못한다. 지갑에는 두 줄이 정상 표시된다. C3b-P2-01로 남긴다. 금액과 환불 계산 결함으로 확대하지 않는다.

서버 모드 직접 실행: 임시 프로세스에서 API 주소를 http://localhost:39999로 지정하고 fetch 전체를 가짜 응답으로 대체했다. 원격 네트워크 요청은 없었다. rtk proxy npx --no-install tsx --tsconfig tsconfig.json TEMP/server-probe.mts, 종료 0. TEMP/server-probe.json이 근거다.

| 모의 HTTP 결과 | 조회와 취소에서 받은 오류 | WithdrawalUnknown | 저장된 Z 상태 | 잔액 |
|---|---|---|---|---:|
| 404, JSON code invalid | AccountError network | 아니오 | 대기 유지 | 0 |
| 503 | AccountError network | 아니오 | 대기 유지 | 0 |
| fetch 연결 실패 | AccountError network | 아니오 | 대기 유지 | 0 |

코드에서 읽은 것: account.ts:130은 출금 404와 연결 실패를 network로 묶는다. api.ts:39는 브라우저 서비스의 invalid만 WithdrawalUnknown으로 바꾼다. 서버 모드에서는 번호가 없는 줄을 닫지 못한다. 그래도 전역 차단은 없으며 store 보조 시험에서 잔액 100을 넣고 새 정상 50을 기록하면 Z와 N 둘, 잔액 50이었다. 이 보조 시험을 실제 서버에 새 출금을 접수한 결과라고 부르지 않는다.

영향: 없는 번호가 대기와 취소 실패 안내로 남고 반복 조회 대상이 된다. 새 요청을 막거나 0 줄을 환불하지는 않는다. C3-P1-01의 전역 차단은 닫혔지만 서버 모드의 상태 조정은 일부만 구현됐다. C3b-P2-02로 남긴다. 실제 서버의 404 계약과 사용자 종료 경로를 별도로 맞춰야 한다.

## 6. 중간 버전 저장값이 남는 갱신의 P1

직접 실행: Git에서 직전 커밋 27eea0d의 walletStore.ts를 TEMP로 추출했다. 잔액 0에서 그 store의 recordWithdrawal이 null을 반환하는 것을 확인하고, 당시 WithdrawScreen이 하던 그대로 addTransaction에 debited false와 amountUsdt -50을 넘겼다. 이 store가 실제로 만든 version 4 저장 문자열을 HEAD store에 그대로 복원했다. 단순히 타입에 맞지 않는 임의 줄을 새로 만든 시험이 아니다.

| 같은 저장값의 취소 | 취소 전 잔액 | 취소 후 잔액 | 차이 |
|---|---:|---:|---|
| 직전 27eea0d의 syncWithdrawal | 0 | 0 | 실제 차감이 없으므로 환불 없음 |
| HEAD의 syncWithdrawal | 0 | 50 | debited false를 읽지 않고 음수 장부 금액을 환불 |
| HEAD의 cancelHeldWithdrawal | 0 | 50 | 같은 원인 |

직접 UI 실행도 했다. 격리된 브라우저에 중간 저장꼴을 복원하고 HEAD를 새로 고침했다. 줄은 -$50으로 읽혔고 무차감 설명이 없었다. 실제 지갑 취소의 서비스 응답은 CANCELLED, 저장 잔액은 50이 됐다. 근거: TEMP/parent-probe.json, TEMP/extra-browser.json의 middle-record-read, middle-record-detail, middle-record-cancel.

코드에서 읽은 것: walletStore.ts:304의 저장 버전은 여전히 4다. browserWallet.ts:25부터 :32까지는 저장된 state를 직접 복원하며 이 줄을 0과 requestedUsdt로 바꾸지 않는다. HEAD 환불 함수가 원본과 같은 것은 맞지만, 그 함수에 넘기는 기존 음수 무차감 줄을 정상 차감 줄로 바꾸어 해석하는 입력 문제가 남는다.

귀속: C3b-P1-01, 중간 버전 저장값을 유지한 갱신에서의 잘못된 환불. 직전 코드가 0을 유지하던 동일한 저장값에서 HEAD가 50을 만든 직접 실행이므로, 원본의 과거 무차감 기록 결함과 분리한다. C3-P1-02의 새 생성 기록에 대한 역방향 회귀는 닫혔으나 이미 생성된 기록까지 닫혔다고 할 수 없다. C3-P2-01도 이 기존 저장꼴에는 남는다.

커밋 메시지는 해당 중간 커밋이 배포된 적 없다고 적는다. 배포 이력과 실제 이용자의 저장소에 이 줄이 없다는 사실은 이번 실행에서 검증하지 않았다. 그런 줄이 존재하지 않는 신규 브라우저와 원본 63445c7에서 바로 온 자료만을 명시적으로 지원한다면 이 P1의 전제는 제외할 수 있다. 이 보고서는 그 전제를 암묵적으로 승인하지 않는다. 실제 돈을 전송한 증거는 아니며 3차와 같은 시험 장부의 잘못된 환불 P1 기준이다.

고칠 방향은 환불 함수를 다시 바꾸는 것보다 중간 저장꼴을 복원 전에 새 0 줄로 정규화하거나, 이 저장꼴을 가진 시험 장부가 지원 대상에서 제외됨을 명확히 보장하는 것이다. 이번 검수에서는 수정하지 않았다.

## 7. E-06, E-08, E-14와의 충돌

| 기존 수정 | 직접 실행한 검증 | 판정 |
|---|---|---|
| E-06 내역 표시 | 계정 번호 없는 실제 store의 open -100, sellback +25가 지갑에 보였다. 0 줄과 함께 시각 순서가 맞고 거래 합 25를 유지했다. 새 출금과 앞 0 요청 두 줄도 모두 보였다 | 새 0 줄에 의한 회귀 없음. 중간 음수 무차감 줄 표시는 6절 |
| E-08 확인창 | 열린 직후 확정 누름은 무시돼 서비스와 로컬이 대기였다. 450ms 뒤 확정과 지연 응답 중 두 번 추가 누름의 취소 호출은 한 번이었다. 완료 뒤 Z 잔액 0. 정상 출금 취소도 성공 | 회귀 없음 |
| E-14 표기 | USD, KRW, USDT 상태를 각각 store에 설정했다. 새 Z는 $0, ₩0, 0 USDT. 신청액은 $50, ₩60,000, 50 USDT. 개봉 -100은 -$100, -₩130,000, -100 USDT. 보통 50 출금의 -$50와 net 49도 확인 | 이번 수정으로 부호 위치와 통화 변환이 깨지지 않음 |

E-14의 KRW는 기존 만원 아래 버림 때문에 100이 130,000, 50이 60,000으로 표시된다. 이를 환율이나 돈 계산 변경으로 세지 않았다. USDT는 화면에 없는 선택지를 누른 것이 아니라 currency store 주입이다. 3075a45는 formatCurrency, Money, useCurrency, Sheet, browserWallet, BalanceSheet를 바꾸지 않는다. 모든 다른 화면의 분리 금액 표기까지 해결됐다는 주장은 하지 않는다.

기존 두 탭의 오래된 snapshot 덮어쓰기와 접수 응답 직전 계정 전환의 접수 유실은 CYCLE3_codex.md 9절에서 원본 문제로 분류한 것이다. 이번에는 지정한 네 항목과 변경 영향만 재검수했으며 그 기존 문제를 다시 고쳤다고 판정하지 않는다.

## 8. 필수 검사와 최종 수

| 직접 실행 명령 | 수와 결과 |
|---|---|
| rtk proxy npx tsc --noEmit -p . --tsBuildInfoFile TEMP/tsc.tsbuildinfo | 타입 오류 0, 종료 0. incremental 캐시는 저장소 밖으로 보냈다 |
| rtk proxy npm test | 전체 469, 통과 468, 실패 0, 취소 0, 건너뜀 1, 종료 0 |
| rtk proxy npm run lint:design | new 범위 49파일, 12규칙 각각 위반 0, 합계 0, 종료 0 |
| CAPTURE_BASE=http://localhost:3003 로 rtk proxy node scripts/capture/flow-withdraw.mjs TEMP/capture | 검사 61, 통과 61, 실패 0, 종료 0 |

근거 로그: TEMP/tsc.log, TEMP/tsc.err, TEMP/test.log, TEMP/test.err, TEMP/design.log, TEMP/design.err, TEMP/capture.log, TEMP/capture/withdraw-results.json. 테스트의 건너뜀은 freeOpens의 실물 전용 박스 조건이다. 전체 469개를 모두 통과했다고 적지 않는다. 기존 전체 검사에는 6절의 중간 버전 저장값을 HEAD에 읽히는 회귀가 없다.

| 이번 재검수 발견 | 등급 | 확인 수준 |
|---|---|---|
| C3b-P1-01 중간 버전의 음수 debited false 줄이 HEAD 취소에서 환불됨 | P1 | 직전 store가 만든 저장값의 양쪽 함수 대조와 HEAD UI 직접 실행 |
| C3b-P2-01 새로 고침 뒤 저장된 미확인 요청의 출금 입력 안내 유실 | P2 | HEAD UI 직접 실행 |
| C3b-P2-02 서버 모드의 없는 번호가 계속 열린 채 남음 | P2 | HEAD API의 HTTP 응답 대체 실행과 코드 대조. 실제 서버 시험 아님 |

이번 변경이 만든 P0는 0건, P1은 1건이므로 P0와 P1이 모두 0인 상태는 아니다.
