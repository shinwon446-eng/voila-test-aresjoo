AGENTS.md와 DESIGN.md를 먼저 읽어라. 한국어로만 답한다. 이번 일은 검토다. 파일을 고치지 않는다. 커밋하지 않는다. 결과는 마지막 메시지로만 낸다.

# 일: 돈과 확률 로직의 회귀 검토
전면 개편에서 화면을 새로 만들면서 돈과 추첨에 닿는 로직을 옛 컴포넌트에서 새 파일로 옮겼다. "계산은 그대로 두고 화면과 호출 방식만 바꾼다"가 규칙이다. 옮기면서 계산, 검증, 순서, 중복 방지, 실패 처리가 달라진 곳을 찾아라. 디자인과 문구는 보지 않는다.

## 대조할 짝 (옛 것은 git 의 main 브랜치나 아직 남아 있는 파일에서 본다: `git show main:<경로>`)
| 새 파일 | 옛 것 |
|---|---|
| web/lib/useUsdtDeposit.ts, web/components/flow/ChargeSheet.tsx | web/components/wallet/UsdtDepositTab.tsx |
| web/lib/claim.ts (takeUsdt, requestShipment, cancelShipment) | main:web/app/[locale]/inventory/page.tsx 의 sell 과 ship, web/components/inventory/CancelShipmentModal.tsx |
| web/components/box/BoxScreen.tsx, web/components/box/Reveal.tsx | main:web/app/[locale]/page.tsx 의 openBox, onSellBack, web/components/unboxing/UnboxingRoulette.tsx, web/components/box/DetailModal.tsx |
| web/components/wallet/WithdrawScreen.tsx | web/components/wallet/WithdrawTab.tsx, web/components/wallet/WithdrawSteps.tsx |
| web/components/wallet/WalletScreen.tsx | web/components/wallet/HistoryTab.tsx |
| web/components/flow/VerifySheet.tsx | web/components/fairness/VisualVerifier.tsx, web/lib/fairness.ts |
| web/components/flow/ShipSheet.tsx | web/components/inventory/DeliveryModal.tsx |
| web/components/flow/LoginSheet.tsx, web/components/auth/AuthHost.tsx | main:web/components/auth/AuthModal.tsx, main:web/components/auth/AuthHost.tsx |
| web/lib/formatCurrency.ts (표기만 바뀌어야 한다) | main:web/lib/formatCurrency.ts |

## 꼭 볼 것
1. 잔액이 두 번 차감되거나 두 번 올라갈 수 있는 경로(다시 누르기, 다시 열기, 빠른 연타, 창을 닫았다 열기, 다른 계정으로 바뀜)
2. 옛 화면에 있던 방어(잠금 ref, idempotencyKey 또는 requestId, 계정 일치 확인, 서버 응답 검증, 상태 확인)가 새 파일에서 빠진 곳
3. 금액 반올림과 통화 환산이 달라진 곳. formatCurrency 의 소수 자리 변경이 표기 밖의 계산(비교, 저장, 전송 값)에 영향을 주는 곳이 있는지: fmt 결과를 다시 숫자로 읽는 코드, splitCurrency 를 계산에 쓰는 코드를 검색한다
4. 확률: 화면에 보이는 확률과 추첨이 같은 데이터를 쓰는지. 구간 확률 합계가 개별 확률의 합과 같은지(BoxScreen 의 groups)
5. 큰 금액 확인창(50 USDT 이상 또는 10개 이상)이 빠질 수 있는 경로, 확인창이 떠 있는 동안 수량이나 잔액이 바뀌는 경우
6. 옛 화면의 구매 확정 단계가 없어지면서 생긴 위험(의도하지 않은 구매)
7. 결과 화면에서 "한 번 더 열기"가 연타될 때
8. 테스트: web/tests 가운데 새 파일을 덮지 못하는 빈틈

## 결과 형식
심각도(높음, 중간, 낮음) 순으로. 항목마다 [새 파일:줄 / 옛 것과 달라진 점 / 일어날 수 있는 일 / 고칠 방법]. 추측이면 추측이라고 적는다. 문제가 없다고 확인한 항목도 한 줄씩 적는다. 800단어 이내.
