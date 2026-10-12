AGENTS.md 를 읽고 flow/REVIEW_codex-2.md(네 재검수)를 읽어라. 이번 일은 그 재검수의 "배포 차단" 1번부터 4번, 그리고 6번이 고쳐졌는지 확인하는 좁은 검수다. 파일을 고치지 않는다. git 으로 바꾸는 명령도 쓰지 않는다. 결과는 flow/REVIEW_codex-3.md 한 파일에만 쓴다.

대상: 커밋 2cc3be3 의 web/lib/takeBatch.ts, web/lib/openingSettle.ts, web/lib/claim.ts, web/components/flow/TakeSheet.tsx, web/components/inventory/InventoryScreen.tsx, web/components/box/BoxScreen.tsx, Opening.tsx, Reveal.tsx, web/tests/takeFault.test.ts, web/tests/takeBatch.test.ts. 화면 증거는 qa/work/melt7/ (선택 시트와 불일치 장부의 상태들)과 qa/work/melt8/ (전체 흐름).

할 일
1. 네 재검수 4.1(용량 한도 하나로 95 가 190 이 되는 재현), 4.2(다시 읽기가 실패했는데 성공으로 답함), 4.3(확인되지 않았는데 "USDT로 받음"과 받은 금액을 같이 적음), 5.2(확인되지 않은 상품이 합계와 covers 에 들어감), 5.5(계정이 바뀐 뒤 옛 응답이 돌아옴)를 네가 썼던 방법 그대로 다시 실행하라. 각각: 고쳐짐, 일부만, 안 고쳐짐. 응답과 저장된 값의 표.
2. 이번 수정이 넣은 것(받기 전에 적어 두는 표시 키, 저장된 JSON 을 직접 읽는 판정, 한 탭 안에서 차례로 실행)을 깨뜨려 보라: 표시 키가 지워지지 않고 남아 정상 상품을 영영 못 받게 되는 경우, 다른 탭의 충전이 겹쳤을 때, 표시 키 쓰기는 됐는데 그 뒤가 전부 실패했을 때, 옛 박스의 USDT 결과(상품별 입금 기록이 없는 것)가 "확인 필요"로 잘못 뜨는 경우.
3. 새로 생긴 "확인 필요" 표시가 정상 사용자에게 잘못 뜰 수 있는 길이 있는지: 이번 배포 전에 받은 상품(입금 기록에 상품 ID 가 없는 옛 기록)이 전부 "확인 필요"가 되지는 않는지 코드와 실행으로 확인하라. 이것이 가장 중요하다.
4. 남은 것을 심각한 순서로. 테스트 사이트 배포를 되돌려야 할 것이 있는지 없는지 분명히 적어라.

글 규칙: 한국어. 긴 줄표, 가운뎃점 문자, 느낌표를 쓰지 마라. 화면에서 본 것, 코드에서 읽은 것, 직접 실행한 것, 짐작을 구분한다.
