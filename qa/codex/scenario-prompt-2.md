AGENTS.md와 DESIGN.md를 먼저 읽어라. 그다음 JOURNEY.md 와 web/scripts/capture/states.mjs, web/scripts/capture/quick.mjs, web/scripts/capture/flow-review.mjs 를 읽어라.

너는 독립 QA 엔지니어다. 개발 서버가 http://localhost:3002 에 떠 있다(한국어는 /ko). 실제 돈은 움직이지 않는다(브라우저 안의 시험 장부). 아래 시나리오를 Playwright(설치돼 있음, channel "chrome", headless)로 실제로 클릭해 끝까지 가 보고, 막히는 자리와 기대와 다른 동작을 찾아라.
규칙: 앱 코드(web/app, web/components, web/lib, web/stores, web/messages)는 고치지 마라. 네가 쓰는 스크립트는 qa/codex/scenario.mjs 하나에만, 스크린샷은 qa/work/codex/ 에만 저장한다. 상태 프리셋은 states.mjs 의 installState/makeState 를 쓴다(guest, zero, insufficient, funded, inventory, pending, security). 모바일 390x844, deviceScaleFactor 2.

시나리오
A 처음 방문: /ko → 박스 카드 → 박스 화면 → 사진 띠 상품 누르기 → 상품 시트 → 닫기 → 구성품 행 누르기 → 후기 절까지 스크롤
B 특정 상품: /ko 에서 "상품으로 찾기"에 "롤렉스" → 결과 행 → 그 박스 화면이 열리는가
C 구매: funded 로 /ko/box/dollar-apple → 5개 칩 → 단추 문구에 "5개 열기, 5 USDT" → 열기 → 결과 화면 → 한 번 더 열기 또는 보관함에서 받기
C2 비로그인 구매: guest 로 /ko/box/dollar-apple → 5개 칩 → "로그인하고 열기" → 로그인 시트 → 닫기 → 수량이 5개로 남아 있는가
D 잔액 부족: insufficient(0.25 USDT) 로 /ko/box/dollar-apple → 단추가 "USDT 충전하기"인가, 막대 안에 부족액 한 줄이 있는가 → 누르면 충전 시트 → 닫기 → 선택이 남아 있는가
E 개봉 이후: inventory 로 /ko/inventory → 상품 행 → 시트 → "배송 받기" → 배송 시트에 필드가 있는가 → 닫기 → "USDT로 받기" 링크 → 확인창 → 확인 → "받은 것" 탭에 들어가는가
F 신뢰: inventory 로 /ko/inventory → 상품 행 → "개봉 결과 검증" → 검증 시트에 해시와 결과가 있는가. 그다음 /ko/box/dollar-apple 의 후기 절
G 반복: funded 로 /ko → 최근 연 박스가 앞에 오는가(먼저 /ko/box/dollar-gaming 에서 1개 열고 /ko 로 돌아와 확인) → /ko/account → 보관 중 수가 맞는가

시나리오마다 [단계 / 기대 / 실제 / 판정(통과, 실패, 막힘)] 표를 쓰고 실패마다 스크린샷 파일명을 적어라. 마지막에 "실제 사용자가 막히는 순간 셋"과 "브리프 13장의 10개 테스트" 5점 척도 평가(근거 한 줄씩). 긴 줄표와 가운뎃점 문자, 느낌표는 쓰지 마라.


2차 실행이다. 1차 결과 qa/codex/scenario-review-1.md 를 먼저 읽고, 같은 시나리오를 다시 실행해 1차의 실패와 막힘이 어떻게 됐는지 항목마다 적어라. 새로 생긴 화면도 포함: /verify(내 기록 누르기, 값 직접 넣어 계산), /legal 과 /legal/terms, 출금 관문에서 "인증 앱 연결하기"(시트가 열리고 QR 과 키가 보이는가), 보관함 행의 수령액 표시. 스크린샷은 qa/work/codex2/ 에, 스크립트는 qa/codex/scenario2.mjs 에만.
