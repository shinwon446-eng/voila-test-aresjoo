AGENTS.md와 DESIGN.md를 먼저 읽어라. 그다음 opening/STATE.md, opening/DECISIONS.md, opening/PROBABILITY-tables.md 를 읽어라. 파일을 고치지 마라. 명령은 실행해도 되지만 저장소에 아무것도 쓰지 마라(계산은 메모리에서 하고 결과를 글로 적어라).

너는 VOILA 개봉 경험 임무의 독립 엔지니어링 검수자이자 확률 감사자다. Claude 가 맞다고 가정하지 마라. 코드를 직접 읽고, 계산은 네 식으로 다시 하라.

라운드 B 는 둘로 나뉜다.

## B-1. 구현 비평 (코드를 읽어라)
읽을 파일: web/components/box/Opening.tsx, web/components/box/BoxScreen.tsx, web/components/box/Reveal.tsx, web/lib/opening.ts, web/lib/openingFlow.ts, web/lib/openingSettle.ts, web/lib/openingSound.ts, web/lib/claim.ts, web/stores/openingJournal.ts, web/stores/settingsStore.ts, web/stores/inventoryStore.ts(sell), web/stores/walletStore.ts(debitSplit, creditSplit), web/app/opening.css, web/tests/openingFlow.test.ts, web/scripts/capture/opening-qa.mjs.
환경: 이 사이트는 서버가 없는 테스트 사이트다. 장부(지갑, 보관함)는 브라우저 저장소에 있고 결과 계산도 브라우저가 한다(lib/opening.ts 머리말이 그렇게 밝힌다). 그래서 "서버가 결과를 정한다"는 요구는 "연출 코드와 무관한 구매 모듈이 결과를 먼저 정하고 기록한다"로 옮겨져 있다. 이 한계 자체는 결함으로 세지 말고, 그 안에서 깨지는 것을 찾아라.

찾을 것(각각 실제 코드 줄을 짚어라):
1. 연출 수명 주기 버그: 타이머 정리, 단계가 건너뛰어질 때의 상태, 닫힌 뒤 늦게 도는 효과(소리, 진동, setState), key 로 다시 마운트될 때.
2. 경쟁 조건: 열기를 연달아 누름, 결과 직후 누름, 확인창과 열기, "한 번 더 열기" 와 닫기, 자동 받기와 수동 받기가 겹칠 때, 받는 방법 시트를 연 채로 다른 일이 일어날 때.
3. 화면 상태와 장부의 불일치: 잔액 알약(열기 전 잔액에서 지금 잔액으로), change 계산, 여러 탭, 계정 전환, 복구된 결과의 balanceBefore.
4. 정산 금액 오류: settleTake 가 SOLD 인 상품에 amountUsdt 0 을 돌려줄 때 화면이 적는 금액, 반올림, 자금 출처별 몫.
5. 중복 거래: 중복 차감, 중복 지급이 가능한 경로가 하나라도 있는가. 기록장(openingJournal)의 commit 이 구매 뒤에 따로 일어나는데 그 사이에 탭이 닫히면 어떻게 되는가.
6. 복구: 연출 중 새로 고침, 다른 박스 화면으로 감, 로그아웃 뒤 다른 계정, 보관함 기록이 이미 팔린 경우(USDT 결과는 구매 순간 SOLD 가 된다), 여러 개 열기의 복구.
7. 상태 기계(lib/openingFlow.ts)가 실제로 구매를 막는가, 아니면 장식인가. BoxScreen 의 send 호출 순서가 표와 맞는가. 도달할 수 없는 상태나 빠져나올 수 없는 상태가 있는가.
8. 건너뛰기 처리와 입력 분리: 결과 직후 0.35초 잠금이 실제로 모든 경로(주 단추, 보조 링크, 키보드 Enter, Esc)를 막는가.
9. 접근성: 포커스 이동, aria-live 가 잔액을 연달아 읽지 않는가, 연출 중 키보드로 건너뛸 수 있는가, 움직임 줄이기.
10. 모바일 렌더링과 성능 위험: preserve-3d, mask-image, color-mix, 100dvh, 안전 영역, iOS 사파리에서 깨질 만한 것. will-change 가 필요한가 과한가.
11. 메모리 누수: AudioContext, 타이머, 구독.
12. 개발용 시험 스위치(devOpeningFault)가 운영 빌드에서 정말 꺼지는가.
13. 검수 스크립트(opening-qa.mjs)가 통과했다고 한 73개 항목 가운데, 실제로는 아무것도 증명하지 못하는 항목이 있는가.

## B-2. 확률 감사 (네 식으로 다시 계산하라)
web/scripts/opening/probability.ts 와 그것이 만든 opening/PROBABILITY-tables.md 를 검산하라.
1. 네 모델(지금 구조, A, B, C) 각각: 확률 합이 정확히 100% 인가, 기대 지급액, 기대 지급률, 분산, 표준편차, 낸 값보다 적게 받을 확률, 낸 값 이상 받을 확률을 표의 값과 확률만으로 직접 다시 계산해 문서의 숫자와 대조하라. 소수 넷째 자리까지 맞는지 적어라.
2. 시뮬레이션: 누적 구간 방식, 난수 생성기(mulberry32)의 치우침, 카이제곱 검정에서 기대 도수 5 미만 칸을 묶는 방식과 자유도, p 값 함수(gammaQ)의 구현을 검토하라. 문서의 χ² 와 p 가 관측 도수 표에서 다시 계산해도 나오는가.
3. 지급 부담 표: n 회의 기대 지급과 표준편차, "가장 큰 상품이 한 번 이상 나올 확률" 식이 맞는가.
4. 모델 설계의 문제: 지금 구조의 실물 47종을 평균 한 줄로 묶은 것이 어떤 숫자를 왜곡하는가. 상품의 "받는 값"을 참고가의 95% 로 놓은 가정이 운영 몫 계산에 주는 영향(상품을 실제로 배송하면 운영자의 비용은 조달가다). 모델 C 의 "보장" 이 문서에 적힌 대로 성립하는가.
5. lib/openingFlow.ts 의 toneOf 경계(0.95, 1.05, 6, 20)와 문서의 톤 비율이 맞는가.
6. 문서가 빠뜨린 위험: 큰 상품 한 건의 지급 부담, 변동이 큰 모델에서 운영자의 손실 구간, 모델 B 에서 0.02배 결과(50 USDT 내고 1 USDT)가 15.5% 인 것이 이용자 경험과 신뢰에 주는 영향.

출력: 문제마다 [심각도 P0~P3 / 파일과 줄 또는 문서 위치 / 무엇이 틀렸나 또는 위험한가 / 재현 방법 또는 계산 / 고치는 방법]. P0 은 돈이 틀리거나 두 번 움직이는 것, P1 은 상태가 깨지거나 사용자가 갇히는 것. 문제가 없으면 없다고 쓰고 무엇을 확인했는지 적어라. 마지막에 "확인했고 문제없던 것" 목록과 "Claude 가 꼭 고쳐야 할 것" 을 우선순위대로. 긴 줄표와 가운뎃점 문자, 느낌표는 쓰지 마라.
