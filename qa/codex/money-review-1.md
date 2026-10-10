기존 테스트 **293개 모두 통과**했습니다. 다만 새 화면의 호출 경로에서 아래 회귀와 방어 누락을 발견했습니다. 파일 수정과 커밋은 하지 않았습니다.

1. **높음** [ [WithdrawScreen.tsx:109](/C:/Users/hyun1/OneDrive/바탕%20화면/VOILA-test-aresjoo/web/components/wallet/WithdrawScreen.tsx:109) / 옛 `WithdrawSteps`는 인증 중 뒤로 가기와 인증 방식 변경을 비활성화했지만, 새 화면의 171행과 175행은 허용합니다 / 인증 응답을 기다리다가 뒤로 가서 주소나 금액을 바꿔도 이전 요청의 `commit`이 실행됩니다. 새 확인 단계에서 갱신된 `requestId.current`를 이전 금액과 주소에 붙이는 경우도 가능합니다 / 인증부터 접수까지 이동을 잠그거나, 요청 세대를 검사하고 계정·금액·주소·요청 번호를 함께 고정하십시오. ]

2. **높음** [ [BoxScreen.tsx:107](/C:/Users/hyun1/OneDrive/바탕%20화면/VOILA-test-aresjoo/web/components/box/BoxScreen.tsx:107) / 큰 금액 확인은 `press`에만 있고, 결과 화면은 `onAgain={open}`으로 직접 구매합니다 / 50 USDT 이상 또는 10개 이상도 “한 번 더 열기”에서 확인 없이 차감됩니다. 옛 재개봉에도 확인은 없었으므로 신규 계산 회귀라기보다는 새 확인 규칙의 누락입니다 / 모든 구매 진입점을 같은 확인 함수로 통합하십시오. ]

3. **중간** [ [VerifySheet.tsx:29](/C:/Users/hyun1/OneDrive/바탕%20화면/VOILA-test-aresjoo/web/components/flow/VerifySheet.tsx:29), [InventoryScreen.tsx:79](/C:/Users/hyun1/OneDrive/바탕%20화면/VOILA-test-aresjoo/web/components/inventory/InventoryScreen.tsx:79) / 옛 `VisualVerifier`는 구매 당시 저장한 `fair.dropTable`로 검증했지만 새 보관함은 현재 `dropTable(box)`를 전달합니다 / 확률표 변경 뒤 정상 과거 기록을 불일치로 판정하거나, 저장된 확률표가 없는 기록을 완전 검증으로 판정할 수 있습니다 / `verifyOpeningRecord`를 재사용하고 당시 표가 없으면 부분 검증으로 처리하십시오. ]

4. **중간, 재현 조건은 추측** [ [BoxScreen.tsx:56](/C:/Users/hyun1/OneDrive/바탕%20화면/VOILA-test-aresjoo/web/components/box/BoxScreen.tsx:56) / 옛 `openBox`의 동기 잠금 `purchasePending.current`가 사라지고 React 상태 `busy`만 남았습니다. 호출마다 구매 함수도 새로 만듭니다 / 같은 렌더의 핸들러가 재진입하면 각각 독립 구매가 되어 잔액이 충분할 때 두 번 차감됩니다. 일반적인 사용자 더블클릭으로 발생하는지는 미재현입니다. 다중 결과의 재개봉 링크도 `againBusy`로 비활성화되지 않습니다 / 동기 잠금 ref를 복원하고 한 구매 작업을 공유하십시오. ]

5. **중간** [ [LoginSheet.tsx:97](/C:/Users/hyun1/OneDrive/바탕%20화면/VOILA-test-aresjoo/web/components/flow/LoginSheet.tsx:97) / 옛 인증 창은 처리 중 이메일 수정·가입 전환·비밀번호 복구를 잠갔지만 새 `TextLink`에는 잠금이 없습니다 / 로그인 응답 대기 중 이메일이나 흐름을 바꿔도 이전 계정의 응답을 `acceptSession`하여 지갑 계정이 의도와 다르게 전환될 수 있습니다 / 처리 중 이동을 막고 늦은 응답의 요청 세대를 확인하십시오. ]

6. **중간** [ [WalletScreen.tsx:66](/C:/Users/hyun1/OneDrive/바탕%20화면/VOILA-test-aresjoo/web/components/wallet/WalletScreen.tsx:66) / 옛 내역은 `accountId === user.id`만 허용했지만 새 화면은 계정 없는 거래도 로그인 사용자에게 보여 줍니다 / 계정별 저장소로 분리하지 않는 API 연결 환경에서는 이전 사용자의 무기명 거래가 다른 계정의 내역에 섞일 수 있습니다 / 거래 생성 시 소유 계정을 기록하고, 소유자가 불명확한 과거 거래를 임의로 귀속시키지 마십시오. ]

7. **낮음** [ [claim.ts:52](/C:/Users/hyun1/OneDrive/바탕%20화면/VOILA-test-aresjoo/web/lib/claim.ts:52) / 옛 취소 창의 `shippedAt`, 배송 상태, 유료 배송비의 `requestId`·자금 출처 검사 중 일부가 새 호출 경로에서 빠졌습니다 / 로컬 저장소는 여전히 거부하지만 서버 연결에서는 해당 요청이 전송되어 서버 방어에만 의존합니다. 잘못된 환불 자체는 확인하지 못했습니다 / 공통 취소 함수에서 최신 상품 상태와 환불 근거를 먼저 검사하십시오. ]

8. **낮음** [ [BoxScreen.tsx:59](/C:/Users/hyun1/OneDrive/바탕%20화면/VOILA-test-aresjoo/web/components/box/BoxScreen.tsx:59) 등 새 호출부 / `web/tests`는 새 화면·훅·`claim`을 직접 검사하지 않습니다 / `opening.test.ts`는 동일 구매 함수 재호출만 검사하므로 클릭마다 새 함수를 만드는 경로를 놓칩니다. 과거 확률 검증 테스트도 옛 검증 함수만 검사합니다 / 연타, 확인창 우회, 인증 중 이동, 계정 전환, 재개방, 과거 확률표를 새 호출부의 통합 테스트로 추가하십시오. ]

문제없음을 확인한 항목입니다.

- **충전:** 영수증 검증, 계정 일치 확인, 폴링 종료, 거래 해시 중복 정산 방어가 유지됩니다.
- **USDT로 받기:** 판매 상태를 먼저 변경하고 자금 출처별로 환급합니다. 반복 호출은 재지급하지 않습니다.
- **배송 신청:** 기존 금액 계산, 멱등성 키 전달, 응답 검증과 반영 순서가 유지됩니다.
- **출금 계산:** 환산·반올림·수수료·최신 잔액 검사·계정 검사·서버 거래 번호 중복 방어가 유지됩니다.
- **출금 취소:** 계정·응답 번호 확인과 상태 기반 중복 환불 방어가 유지됩니다.
- **확률:** 12개 박스 모두 구간 합계와 개별 확률 합계가 일치하며 추첨도 같은 데이터를 사용합니다.
- **통화 표기:** `fmt` 결과 재수치화나 `splitCurrency`의 계산 사용은 발견하지 못했습니다.
- **구매 확인:** 확인 중 잔액이 줄어도 공통 구매 함수가 차감 직전 재검사합니다. 소액 구매 확정 단계 삭제는 오클릭 위험을 늘리는 흐름 변경입니다.
- **기존 위험 구분:** 개봉·배송 응답의 계정 전환 방어 부족과 `AuthHost` 초기 복원 처리는 옛 코드에도 있어 신규 회귀로 세지 않았습니다.