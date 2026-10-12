# MELT 2차 재검수

검수일: 2026-10-12. 판정: 테스트 사이트 배포 반려.

1차의 세 실패 조건은 응답 판정이 개선됐다. 그러나 미지급 상태의 화면 표시, 복합 저장 실패의 중복 지급, 재조회 실패의 거짓 성공이 남았다. 실제 돈이 없는 브라우저 시험 장부라는 점을 감안해도, 받은 금액과 처리 상태를 사실과 다르게 말하므로 배포를 막는다.

## 1. 근거와 범위

- [코드] AGENTS.md, DESIGN.md, REDESIGN_BRIEF.md, qa/PROGRESS.md, flow/MELT_SPEC.md 5절, flow/REVIEW_codex-1.md를 읽었다. git status와 git diff로 추적 파일 변경을 확인하고 미추적 web 파일 본문도 확인했다. takeBatch.ts, openingSettle.ts, takeFault.test.ts, TakeSheet.tsx를 포함한다. 줄 번호는 검수 당시 작업 폴더 기준이다.
- [화면] qa/work/melt6의 모바일 흐름과 sticky.jpg, melt4의 선택 시트와 상태별 PNG를 직접 열었다. melt5는 모바일 흐름 합성 이미지 세 장과 PC의 결과, 선택, 지급 완료, 잔액, 검증 화면을 직접 열어 비교했다. 아래 m4, m5, m6는 각각 qa/work/melt4, qa/work/melt5, qa/work/melt6를 뜻한다. 모든 PC 이미지나 qa/codex 생성 자료를 전수 심사했다는 뜻은 아니다.
- [실행] 실제 스토어와 함수를 별도 Node 프로세스의 메모리 저장소에 연결해 실패를 주입했다. 기존 localhost:3002에서도 새 Chrome 격리 컨텍스트에 시험 자료를 심어 화면을 실행했다. 캡처 도구의 installRoutes로 외부 요청을 차단했다.
- [추정] 코드를 근거로 가능한 경로를 설명하되 직접 실행하지 않은 것은 따로 표시한다. [판단]은 이 증거에 대한 배포 평가다.

앱이나 테스트 파일을 수정하지 않았다. git 상태를 바꾸는 명령, 빌드, 서버 실행, 실제 결제나 출금도 하지 않았다. 작성한 산출물은 이 보고서 하나다.

## 2. R1부터 R16까지

| 결정 | 판정 | 근거 |
|---|---|---|
| R1 금액 뒤 조사 | 일부만 반영됨 | [코드] 지정한 새 문구는 web/messages/v.ko.json:312,313,314,315,328,331에 반영됐고 v.en.json, v.zh.json의 같은 키도 같은 뜻이다. [화면] m6/one-3-confirm-mobile.png, one-4-taken-mobile.png, m4/g3-prefilled.png. 다만 전체 언어 파일을 검색하면 기존 ko.json에 금액 뒤 가, 로, 를이 8곳 남는다. 6절에 전부 적었다. |
| R2 한 개 결과 상태 줄 | 반영됨 | [코드] web/components/box/Opening.tsx:245가 보관 상태 문구를 쓴다. [화면] m6/one-2-result-mobile.png에 “보관함에 넣었습니다.”만 있고 받을 금액은 단추와 그 아래에 있다. |
| R3 부족액을 채울 수 있을 때만 받기 우선 | 일부만 반영됨 | [코드] web/components/box/BoxScreen.tsx:85,203,204, Opening.tsx:195,276, Reveal.tsx:138,141이 covers를 사용한다. [화면] m4/d1-short-covered.png와 d4-short-not-covered.png, m6/short-1-short-with-items-mobile.png에서 분기가 바뀐다. [실행] 무료 횟수를 섞은 정상 장부도 통과했다. 그러나 이미 입금된 IN_STORAGE 상품까지 예상액에 합쳐 covers가 거짓으로 참이 되는 경로가 있다. 5절 참조. |
| R4 미리 선택과 주 단추 합계 | 일부만 반영됨 | [코드] web/components/box/Reveal.tsx:133,134,260,291이 참고가 20배 경계와 preselect를 적용한다. TakeSheet.tsx:68,81,82가 선택 합계를 만든다. [화면] m6/five-2-results-mobile.png, five-3-take-sheet-mobile.png, five-4-all-selected-mobile.png와 m5/five-2-results-desktop.png, five-3-take-sheet-desktop.png. [실행] 정상 혼합 상품은 개수와 지급액이 맞았다. 다만 R8에서 unknown으로 거절할 상품도 예상 합계에는 포함되어 실제 받는 것과 달라진다. |
| R5 후기 쓰기의 위치 | 반영됨 | [코드] web/components/inventory/InventoryScreen.tsx:148부터 정보 카드의 마지막 행에 넣었다. [화면] m4/e1-item-sheet.png, m6/inv-2-item-sheet-mobile.png에서 받기 단추 위의 마지막 행이다. |
| R6 출금의 보관함 링크 위치 | 반영됨 | [코드] web/components/wallet/WithdrawScreen.tsx:237,239,240에서 설명 다음, 네트워크 앞이다. [화면] m4/g1-withdraw-form.png, g3-prefilled.png. m6/wd-1-withdraw-mobile.png는 보관 상품 없는 상태여서 링크가 없으며 조건과 맞는다. |
| R7 전체 선택의 위치 | 반영됨 | [코드] web/components/flow/TakeSheet.tsx:133부터 목록 카드의 머리 행이다. [화면] m4/a2-take-sheet.png, a3-all-selected.png, m6/five-3-take-sheet-mobile.png. |
| R8 저장 실패의 정직한 판정 | 일부만 반영됨 | [코드] web/lib/claim.ts:24의 itemIds, takeBatch.ts:117,122,154,165,169,170,171이 추가됐다. [화면] m4/c4-unknown.png에는 확인하지 못했다는 결과가 있다. [실행] 1차의 세 조건 중 미지급과 저장 무시를 unknown으로 격리하지만, 복합 실패는 failed 뒤 중복 지급, 읽기 실패는 settled 오판이다. 보관함 상세도 unknown과 받은 금액을 동시에 말한다. 3절과 4절 참조. |
| R9 선택 시트 상태와 상세 안 오류 | 일부만 반영됨 | [코드] web/components/flow/TakeSheet.tsx:67,90,119에 초기화, 전부 사라짐, 불러오는 중 분기가 있다. Reveal.tsx:129,283에 상세 안 오류가 있다. [화면] m4/b1-other-tab.png와 c4-unknown.png는 결과 상태를 보여 준다. e4-item-unknown.png만으로 상세 오류 표시의 성공을 입증할 수는 없다. [추정] 계정이 바뀐 뒤 이전 비동기 응답이 돌아오면 TakeSheet.tsx:103부터 결과와 onTaken을 다시 적용한다. 계정 초기화만 있고 이전 응답을 버리는 조건이 없다. |
| R10 한 개와 묶음 받기 통합 | 반영됨 | [코드] web/lib/openingSettle.ts:21부터 settleTakeMany를 감싸고 settled, already, unknown을 옮긴다. web/components/flow/TakeSheet.tsx:30의 TakeConfirm을 공유한다. [화면] m6/one-3-confirm-mobile.png, m4/a4-confirm.png. [실행] 같은 ID 재호출과 단일 함수 결과를 대조했다. 계산은 95% 그대로다. 통합의 실패 판정 문제는 R8에 포함한다. |
| R11 짧은 링크 44px | 반영됨 | [코드] web/app/ui.css:68에 min-width와 min-height가 모두 --v-touch다. [화면] m6/one-3-confirm-mobile.png의 취소, m4/f1-balance-sheet.png의 출금. PNG의 글자 폭만으로 터치 영역을 판단하지 않았다. [실행] 모바일 결과 아래 링크 높이도 44px였다. |
| R12 잔액 시트 예외 | 반영됨 | [코드] web/components/shell/AppShell.tsx:53은 비로그인 상태에서 로그인 창을 직접 연다. Opening.tsx:205의 결과 잔액은 span이다. [화면] m6/wins-guest-1-mobile.png, one-2-result-mobile.png, m5/bal-1-balance-sheet-desktop.png. |
| R13 블록체인 설명의 조건 | 반영됨 | [코드] web/messages/v.ko.json, v.en.json, v.zh.json 각각 :217,228에서 기록을 붙이는 경우로 조건을 밝혔다. [화면] m6/inv-3-verify-sheet-mobile.png, verify-full-mobile.png, m5/inv-3-verify-sheet-desktop.png. 운영에서 이미 기록한다는 단정은 없어졌다. |
| R14 나온 상품의 기록과 언어 | 반영됨 | [코드] web/components/box/WinsScreen.tsx:50이 ownedId를 전달하고 :104가 무료 여부 모름을 표시한다. web/components/fairness/verifyRecord.ts:25가 ID를 우선한다. WinsScreen.tsx:51,77,79의 숫자 범위 표시, AppShell.tsx:49,62의 nav 키, v.zh.json:600,601도 반영됐다. [화면] m6/wins-2-detail-mobile.png에 무료 개봉 “기록 없음”, menu-1-mobile.png에 “나온 상품”이 있다. 영어와 중국어 줄바꿈은 코드와 문구로 확인했으며 이번 별도 브라우저 실행은 한국어였다. |
| R15 접근성 속성과 줄바꿈 | 반영됨 | [코드] web/components/shell/AppShell.tsx:52,54,62, InventoryScreen.tsx:152, WinsScreen.tsx:73,81, web/app/take.css:17에 요청한 속성과 overflow-wrap이 있다. [화면] m6/menu-1-mobile.png, short-1-short-with-items-mobile.png. 접근성 속성은 PNG가 아니라 코드로 확인했다. |
| R16 문구 검사 확대 | 반영됨 | [코드] web/tests/vMessages.test.ts:121부터 wins, verify, nav.wins의 문자, 표현, 언어, 값과 태그를 검사한다. [실행] 전체 테스트가 통과했다. 검사 코드의 변경이라 별도 화면 증거는 없다. |

R3와 R4는 정상 장부에서 요청한 분기를 구현했다. 일부 판정은 현재 코드가 스스로 만들어 낼 수 있는 불일치 장부까지 포함한 결과다. R10 통합 자체의 반영과 R8의 정직성 통과는 구분했다.

## 3. 1차의 세 저장 실패를 직접 다시 재현

[실행] 실제 useInventoryStore, useWalletStore, settleTakeMany, settleTake를 사용했다. localStorage를 Map으로 바꾼 다음 모듈을 불렀다. 상품 A의 참고가는 100, USDT 출처 100%, 시작 잔액은 0이다. 정상 수령액은 95다. 저장된 JSON을 직접 읽어 메모리 상태와 구분했다. 재시도 열은 실패 주입을 제거하고 두 스토어를 rehydrate한 다음 같은 ID를 호출한 결과다.

| 주입 조건 | 첫 settleTakeMany 응답 | 저장된 상품, 잔액, sellback 내역 | 첫 응답 뒤 메모리 | 같은 ID 재시도 결과 |
|---|---|---|---|---|
| A. SOLD 보관함 쓰기에서 예외 | failed, amountUsdt 0, left [A], unknown 없음 | IN_STORAGE, 0, 0건 | IN_STORAGE, 0 | settled, taken [A:95], 최종 SOLD, 잔액 95, 내역 1건. 이후 settleTake는 settled 95와 already true, 추가 지급 없음 |
| B. 지갑의 95 저장에서 예외 | unknown, amountUsdt 0, unknown [A], left와 already 없음 | SOLD, 0, 0건 | SOLD, 0 | 계속 unknown, 최종 SOLD, 잔액 0, 내역 0건. settleTake도 unknown |
| C. SOLD 보관함 쓰기만 조용히 무시 | unknown, amountUsdt 0, unknown [A], left와 already 없음 | IN_STORAGE, 95, 1건 | IN_STORAGE, 95 | 계속 unknown, 최종 IN_STORAGE, 잔액 95, 내역 1건. settleTake도 unknown. 190이 되지 않음 |

[판단] A는 1차에서 문제였던 메모리와 저장 상태의 불일치를 되돌린다. B는 미지급을 복구한 것이 아니다. 상품은 SOLD로 남고 잔액은 0이지만, 함수가 더 이상 이미 지급됐다고 답하지 않는다. C의 단독 실패에서 중복 지급은 막았다. 따라서 “1차와 같은 세 주입이 개선됐다”는 주장은 맞고, “미지급과 중복 지급 문제가 해결됐다”는 주장은 틀리다.

## 4. 배포를 막는 재현

### 4.1. 복합 저장 실패에서 여전히 95를 두 번 지급한다

[코드] web/lib/claim.ts:19,22,24는 상품 저장, 잔액 저장, 입금 내역 저장을 따로 한다. takeBatch.ts:170은 IN_STORAGE이며 내역이 없으면 left로 분류한다. 하지만 내역 없음은 잔액이 늘지 않았다는 증거가 아니다.

[실행] C의 보관함 저장 무시와 거래 내역 쓰기 실패를 같이 주입했다.

| 시점 | 응답 | 저장 상품 | 저장 잔액 | 입금 내역 |
|---|---|---|---:|---:|
| 첫 받기 | failed, amountUsdt 0, left [A] | IN_STORAGE | 95 | 0건 |
| 실패 제거 후 재시도 | settled, taken [A:95], amountUsdt 95 | SOLD | 190 | 1건 |

첫 응답은 이미 들어온 95를 “받지 못했다”고 말하고 재시도 대상으로 내놓는다. web/components/flow/TakeSheet.tsx:111,183,204와 web/messages/v.ko.json:317이 그 응답으로 실패 안내와 재시도를 만든다.

[실행] 서로 다른 두 예외가 우연히 겹쳐야만 하는지도 확인했다. 같은 Map에 총 문자열 길이 한도를 하나 두고 한도 초과 쓰기를 조용히 버리게 했다. 이는 web/lib/labSite.ts:19의 QuotaExceededError 처리와 같은 쓰기 결과다. 작은 장부 probe는 통과했다. 실제 실행에서 한도 728, SOLD 보관함 쓰기 755, 거래 내역 포함 지갑 쓰기 928이었다. 두 큰 쓰기는 버려지고 작은 잔액 변경만 저장됐다. 첫 failed 뒤 한도를 풀고 재시도하자 똑같이 잔액이 95에서 190으로 늘었다.

재현 순서:

1. 상품 A 참고가 100과 잔액 0을 정상 저장한다.
2. 현재 저장 문자열 합계보다 20만 큰 한도를 둔다. 한도를 넘는 setItem은 저장하지 않고 반환한다.
3. settleTakeMany([A])를 호출한다. 상품 변경은 유실되고, 잔액 95는 저장되며, 입금 내역 추가는 유실된다.
4. failed와 left [A]가 돌아온 것, 저장 잔액 95와 입금 내역 0건을 확인한다.
5. 한도를 없애고 두 스토어를 rehydrate한다.
6. 같은 A를 다시 호출한다. 새로 95를 지급해 잔액 190이 된다.

문자열 길이 한도는 메모리 재현용이며 실제 Chrome 저장 용량을 채운 시험은 아니다. 실제 래퍼가 허용하는 부분 저장 결과를 재현했다. 장부를 원자적으로 확정하는 서버를 이번에 요구하는 것이 아니라, 이 상태를 미지급 확정으로 분류하고 재지급하는 현재 경로가 배포 차단 사유다.

### 4.2. 재조회가 실패해도 성공했다고 답한다

[코드] web/lib/takeBatch.ts:117의 reread는 persist.rehydrate가 예외를 던질 것으로 기대한다. 그러나 설치된 web/node_modules/zustand/middleware.js:435부터는 오류를 잡아 재수화 콜백에 넘기고 끝낸다. web/stores/walletStore.ts:293, inventoryStore.ts:153의 콜백은 오류 인자를 확인하지 않는다. 따라서 takeBatch.ts:173의 catch를 거치지 않고 남아 있는 메모리로 성공을 판정할 수 있다.

[실행] 보관함 SOLD 저장은 허용했다. 지갑의 증가와 입금 내역 쓰기를 무시하고, 그 뒤 장부 getItem이 예외를 던지게 했다.

| 시점 | 응답 | 저장 상태 | 메모리 상태 |
|---|---|---|---|
| 첫 받기 | settled, taken [A:95], amountUsdt 95 | SOLD, 잔액 0, 내역 0건 | SOLD, 잔액 95 |
| 실패 제거, 재수화, 재시도 | unknown, amountUsdt 0 | SOLD, 잔액 0, 내역 0건 | SOLD, 잔액 0 |

[판단] 실제 저장 잔액이 0인데 성공 응답과 성공 문구를 낼 수 있다. R8이 약속한 “실제 저장 상태를 다시 읽어 판정”을 충족하지 못한다. 기존 takeFault.test.ts:14는 쓰기 한 곳만 실패시키며 읽기 실패와 복합 실패를 시험하지 않는다.

### 4.3. unknown이어도 상품 상세는 “USDT로 받음”이라고 말한다

[실행] 기존 dev 서버의 격리 Chrome에서 inventory 시험 상태를 사용했다. 시작 잔액 10,000, 첫 상품 참고가 1,000이다. 보관함 첫 상품의 받기 확인창에서 지갑 잔액이 10,000을 넘는 저장에 예외를 주입했다. 함수는 unknown으로 끝났고 저장 잔액은 10,000 그대로, 상품은 SOLD였다.

실제로 읽은 상세 화면 문구는 다음과 같다.

- 상태: USDT로 받음
- 참고가: $1,000
- 받은 금액: $950
- 처리 상태를 확인하지 못했습니다. 보관함과 지갑 내역을 확인합니다.

[코드] web/components/inventory/InventoryScreen.tsx:79,140,144는 영수증 여부와 관계없이 SOLD만으로 받은 상태와 받은 금액을 표시한다. :158,159는 unknown 안내를 추가할 뿐 앞의 확정 표현을 바꾸지 않는다. :81에서 상세를 닫으면 오류 안내도 초기화된다. web/components/box/BoxScreen.tsx:124의 복구 표시에도 SOLD와 soldForUsdt만으로 받은 결과를 만드는 경로가 있다.

[화면] 제공된 m4/c4-unknown.png는 공용 선택 시트의 unknown 문구를 확인하는 증거다. m4/e4-item-unknown.png에는 해당 안내가 보이지 않아 이 결함이 없다는 증거로 쓰지 않았다. 위 모순은 이번에 저장 실패를 직접 주입한 실제 화면의 DOM에서 확인했다.

[판단] 함수의 정직한 unknown만으로 화면 전체가 정직해지지는 않는다. 1차의 “거짓 안내” 차단 사유가 남는다.

## 5. 이번 통합과 선택 변경의 회귀 점검

### 5.1. 정상 장부의 한 개 받기와 20배 혼합

[코드] web/lib/openingSettle.ts:21부터 기존 성공 모양과 already 의미는 유지하고 unknown을 추가했다. 정상 SOLD라도 입금 내역이 없으면 예전처럼 already 성공으로 처리하지 않는다. 이것은 R8에 따른 의도한 변화다. 단일 받기, 묶음 받기의 계산과 잠금은 같아졌다. 화면에서 이 새 상태를 끝까지 반영하지 않은 문제는 4.3에 적었다.

[실행] 박스 가격 20, 참고가 100, 399.99, 400, 800, 7.99인 상품 다섯 개를 가진 복구 결과를 격리 브라우저에 심었다. 실제 추첨이나 구매를 실행한 시험은 아니다.

| 조작 | 화면과 저장 결과 |
|---|---|
| 여러 개 결과의 첫 주 단추 | 3개, $482.58 |
| 선택 시트 진입 | 100, 399.99, 7.99만 선택. 정확히 20배인 400과 40배인 800은 선택되지 않음 |
| 전체 선택 | 5개, $1,622.58 |
| 기본 선택 세 개만 확인 | 잔액 10,000에서 10,482.58. 선택한 세 개만 SOLD, 나머지 둘은 IN_STORAGE |

개별 반올림 95, 379.99, 7.59의 합이 482.58이다. 정상 조건에서 단추 개수와 금액, 실제 받은 상품이 달라지는 문제는 재현하지 못했다. m6의 정상 선택과 PC m5의 선택 화면도 같은 규칙이다. 보관함, 잔액, 부족액, 출금에서 여는 시트는 preselect 없이 시작하며 m4/a2-take-sheet.png, d5-take-from-link.png, f2-take-in-place.png에서 확인했다.

[코드] 명세 R4의 괄호 설명에는 별도 불일치가 있다. “자동 받기 설정의 기준과 같다”지만 web/lib/openingFlow.ts:27,29,77,79의 자동 받기는 95% 수령액으로 top을 판정한다. 미리 선택은 Reveal.tsx:133에서 참고가로 판정한다. 가격 20, 참고가 400은 여러 개 결과에서 미리 선택하지 않지만 자동 받기 기준으로는 수령액 380, 19배여서 대상이다. 이번에 자동 받기 계산을 바꾼 회귀는 아니며, 참고가 20배 제외라는 R4 본문은 지켰다. 두 기준이 같다는 설명은 정리해야 한다.

### 5.2. 확정되지 않은 상품은 선택 합계와 부족액 계산에서 빠지지 않는다

[코드] web/lib/takeBatch.ts:42의 heldForTake와 :67의 takeQuote는 IN_STORAGE 여부로 대상을 고른다. :155의 실제 처리에서는 입금 내역이 있는 IN_STORAGE 상품을 unknown으로 거절한다. 예상과 실행이 서로 다른 자격 조건을 사용한다.

[실행] 참고가 100인 A와 B를 IN_STORAGE로 두고, A의 sellback 내역과 이미 받은 잔액 95를 저장했다. 이는 3절 C가 실제로 만드는 상태다.

| 항목 | 결과 |
|---|---|
| takeQuote([A,B]) | count 2, totalUsdt 190 |
| 잔액 95, 다음 비용 250의 shortfallOf | missing 155, maxReceivable 190, covers true |
| settleTakeMany([A,B]) | unknown, taken [B:95], unknown [A], amountUsdt 95 |
| 처리 뒤 잔액 | 190. 다음 비용 250에 여전히 60 부족 |

[판단] 받을 수 있다고 제시한 개수와 금액은 실제 추가 지급보다 크다. 부족액도 채울 수 없는데 받기가 주 행동이 된다. 이 조건에서는 무료 횟수를 빼는 계산이 맞아도 상품 자격이 틀려 결과가 틀린다. R8의 격리 조건을 예상액과 화면 상태까지 일관되게 적용해야 한다.

### 5.3. 무료 횟수와 부족액

[실행] 가격 1, 수량 5, 잔액 1, 보관 상품 참고가 2인 조건을 격리 브라우저에서 각각 실행했다.

| 남은 무료 횟수 | 실제 필요 비용 | 부족액 | 보관 상품 수령액 | 실제 주 단추 |
|---:|---:|---:|---:|---|
| 2 | 3 | 2 | 1.90 | USDT 충전하기 |
| 3 | 2 | 1 | 1.90 | USDT로 받기 |
| 5 | 0 | 0 | 1.90 | 5개 무료 언박싱 |

[코드] web/components/box/BoxScreen.tsx:80부터 무료 수를 뺀 cost를 계산하고 :85에 넘긴다. :315,316은 결과 화면에도 갱신된 cost를 nextCost로 준다. Opening.tsx:195, Reveal.tsx:138도 이를 우선한다. 정상 장부에서 무료 횟수를 빠뜨려 부족액을 과장하는 회귀는 찾지 못했다. 한 개와 여러 개 결과의 모든 무료 횟수 조합을 브라우저에서 전수 실행했다는 뜻은 아니다.

### 5.4. 모바일 하단 단추와 마지막 행

[화면] m6/five-2-results-mobile.png와 sticky.jpg에서는 목록을 보는 동안 아래 단추가 붙어 있다. 첫 화면에서 일부 목록이 가려진 사실만으로 마지막 항목에 접근할 수 없다고 판정하지 않았다.

[실행] 긴 상품 이름 다섯 개의 결과를 높이 844, 폭 390, 375, 320에서 끝까지 스크롤하고 마지막 행과 링크의 위치 및 실제 맞는 요소를 검사했다.

| 폭 | 최대 스크롤 | 마지막 행 아래쪽 | 단추 영역 위쪽 | 결과 |
|---:|---:|---:|---:|---|
| 390 | 231 | y=712 | y=716 | 마지막 행이 전부 드러나고 중심점이 그 행에 닿음 |
| 375 | 231 | y=712 | y=716 | 동일 |
| 320 | 303 | y=712 | y=716 | 동일 |

아래 링크 영역은 y=784부터 828, 높이 44였다. web/app/ui.css:353은 sticky이면서 문서 흐름의 공간을 유지하고, :357은 PC에서 static으로 바꾼다. 확인한 한국어 화면에서는 마지막 줄이나 링크가 영구히 가려지는 결함을 찾지 못했다. iOS 실제 안전 영역, 더 낮은 화면 높이, 모든 언어의 모든 개수까지 보장한 시험은 아니다.

### 5.5. 계정 변경 뒤 오래된 결과가 돌아오는 경로

[코드] TakeSheet.tsx:67은 계정 변경 때 상태를 비우지만, :101의 await 이후 :103부터 현재 계정이나 요청 세대를 확인하지 않는다.

[추정] 다른 탭이 장부 잠금을 쥐어 받기가 대기 중인 상태에서 계정이 바뀌면 초기화가 먼저 된다. 나중에 옛 요청이 끝나면 새 시트에 이전 결과를 다시 넣을 수 있다. ledgerLock.ts:50의 계정 검사는 지급을 막을 수 있지만, 그 실패 응답을 새 화면에 적용하는 것까지 막지는 않는다. 이번에 계정 변경과 잠금 지연을 함께 주입해 실행하지 않았으므로 계정 간 실제 지급이 발생했다고 단정하지 않는다.

## 6. 세 언어 파일 전체의 문구 검색

[실행] web/messages/ko.json, en.json, zh.json과 현재 화면용 v.ko.json, v.en.json, v.zh.json을 모두 읽어 금액 자리 뒤 조사를 검색했다. 새 문구 몇 개만 검사하지 않았다.

통화나 발음에 따라 달라지는 조사 잔존은 ko.json의 다음 8곳이다.

| 파일과 줄 | 키 | 남은 조합 |
|---|---|---|
| web/messages/ko.json:210 | hero.openFor | {price}로 |
| web/messages/ko.json:511 | unbox.respin | {price}로 |
| web/messages/ko.json:727 | inventory.sellBody | {amount}가 |
| web/messages/ko.json:728 | inventory.sellBodyMulti | {amount}가 |
| web/messages/ko.json:747 | inventory.shipInsufficient | {fee}가 |
| web/messages/ko.json:777 | daily.stripBody | {max}를 |
| web/messages/ko.json:778 | daily.body | {max}가 |
| web/messages/ko.json:783 | daily.credited | {amount}가 |

v.ko.json에서는 같은 종류의 금액 뒤 조사를 찾지 못했다. 형태가 변하지 않는 조사는 남아 있다. :89의 {seed}부터, :326의 {ref}의, :328의 {amount}까지, :427의 {min}부터, :428의 {balance}보다, :561의 {amount}부터다. 특히 R1이 지정한 heldHint 자체도 “까지”를 포함한다. 따라서 “조사가 문자 그대로 하나도 없다”와 “금액 발음에 따라 틀리는 조사를 없앴다”는 구분해야 한다. web/tests/vMessages.test.ts:88부터도 후자를 검사하며 기존 ko.json 전체를 검사하지 않는다.

영어와 중국어 파일에는 한국어 금액 조사가 섞인 사례가 없었다. 위 8곳은 기존 문구 잔존이며, 이번 MELT 화면에서 모두 노출된다는 뜻은 아니다. 원화 전환 때의 문장 문제와 전체 문구 정리 과제로 남긴다.

[코드] v.ko.json:323의 “처리 상태를 확인하지 못했습니다”는 3절 B와 C의 불일치에 맞는 표현이다. v.en.json:323과 v.zh.json:323도 확인 불가와 내역 확인 안내다. 그러나 4.1과 4.2에서는 이 문구로 가지 않고 실패 또는 성공을 잘못 확정한다. 4.3에서는 올바른 unknown 안내 옆에 거짓 확정 상태가 붙는다. 문구 추가만으로 해결되지 않았다.

한국어 뒤 문장 “보관함과 지갑 내역을 확인합니다”는 자동 확인 동작처럼 읽힐 여지도 있다. TakeSheet.tsx:208 이후는 사용자가 링크로 이동하는 구조이므로 영어와 중국어처럼 사용자가 확인하는 안내임을 분명히 하는 편이 낫다. 이 해석상의 모호함 자체를 주된 배포 차단 사유로 세지는 않았다.

## 7. 남은 문제의 심각도와 배포 판단

1. 배포 차단: 복합 저장 실패를 미지급으로 확정하고 같은 ID에 중복 지급한다. 4.1의 잔액 95에서 190 재현이다. 실제 돈은 없어도 시험 장부와 실패 안내가 거짓이다.
2. 배포 차단: 재조회 오류를 감지하지 못해 저장 잔액 0을 지급 성공으로 답한다. 4.2의 직접 실행 결과다.
3. 배포 차단: unknown 상품 상세에 “USDT로 받음”과 “받은 금액”을 표시한다. 4.3의 실제 화면 실행으로 확인했다. 함수와 보관함, 복구 결과가 같은 확정 기준을 사용해야 한다.
4. 배포 차단 결함의 연장: unknown으로 처리할 상품을 예상 합계와 covers에 포함한다. 5.2에서 2개 190을 제시하고 1개 95만 지급했다. 정상 분기 시험 통과로 덮을 수 없다.
5. 기존 거짓 표시가 남음: web/components/box/BoxReviews.tsx:111부터 REVIEW_SAMPLES를 실제 후기와 같은 목록에 추가한다. m4/d1-short-covered.png, d3-back-to-box.png의 4.3, 후기 3개가 그 예다. MELT_SPEC.md:131이 이번 구현 범위 밖으로 남겼다는 사실은 확인했다. 새 회귀로 세지는 않지만, 화면이 거짓말하면 테스트 배포도 막는 이번 기준에서는 무표시 샘플을 실제 후기 수와 평점으로 제시하는 상태를 승인하지 않는다.
6. 중간: 계정 변경 뒤 이전 응답이 결과를 다시 채울 수 있다. 5.5의 코드상 경로이며 별도 동시 실행 확인이 필요하다.
7. 낮음: 기존 ko.json 금액 뒤 조사 8곳, 자동 받기와 미리 선택의 20배 기준이 같다는 설명의 불일치가 남는다.

테스트 사이트에 서버 원자적 장부, 실배송, 실출금 완성을 당장 요구하지 않는다. 미확정 상태를 미확정으로 유지하고 재지급과 확정 표시를 막는 것은 현재 브라우저 장부에서도 필요한 배포 조건이다. 위 1번부터 4번을 재현하지 못하도록 고치고, 그 결과가 보관함과 복구 화면에도 일치하는지 다시 확인해야 한다.

## 8. 실행한 검사와 한계

| 검사 | 결과 |
|---|---|
| web에서 npm test | 총 382개, 통과 381, 실패 0, 건너뜀 1 |
| npx tsc --noEmit --incremental false -p . | 통과 |
| npm run lint:design | 49개 파일, 위반 0 |
| 독립 메모리 실패 주입 | 기존 3조건, 복합 쓰기 실패, 단일 용량 제한, 재조회 실패를 실행 |
| 격리 브라우저 | 실제 보관함 지급 실패 문구, 20배 혼합 선택과 지급, 무료 횟수 분기, 모바일 하단 접근을 실행 |

기존 takeFault.test.ts는 개별 쓰기 실패와 영수증 대조를 검증한다. 전체 통과는 4절의 복합 실패나 잘못된 화면을 부정하는 증거가 아니다. 이번 검수는 테스트 파일을 추가하지 않고 프로세스 안에서 재현했다. 실제 브라우저 저장 한도를 채운 시험, 모든 브라우저의 동시 탭 경쟁, 계정 변경 경쟁의 실행 검증은 하지 않았다.

## 부록. 중복 지급의 최소 재현 코드

web 디렉터리에서 tsx로 실행할 JavaScript다. 이번에는 파일로 만들지 않고 Node의 인라인 실행에 넣었다. 이 코드는 메모리 Map에만 장부를 저장한다.

~~~js
const disk = new Map();
let limit = Infinity;
const blocked = [];
global.localStorage = {
  getItem: k => disk.get(k) ?? null,
  setItem(k, v) {
    const size = [...disk].reduce(
      (n, [x, s]) => n + (x === k ? 0 : s.length), 0
    ) + v.length;
    if (size > limit) { blocked.push({ key: k, size, limit }); return; }
    disk.set(k, v);
  },
  removeItem: k => disk.delete(k)
};
const { useInventoryStore: I } = require('./stores/inventoryStore.ts');
const { useWalletStore: W } = require('./stores/walletStore.ts');
const { settleTakeMany: M } = require('./lib/takeBatch.ts');
const { withLedgerLock } = require('./lib/ledgerLock.ts');
global.window = { sessionStorage: { getItem: () => null } };
(async () => {
  await withLedgerLock(() => {});
  W.setState({ cryptoBalance: 0, cardBalance: 0, balance: 0, transactions: [] });
  I.setState({ items: [] });
  const id = I.getState().add([{
    itemId: 'test', boxSlug: 'test', valueUsdt: 100, tier: 'royal',
    fair: { serverSeed: 's', serverSeedHash: 'h',
      clientSeed: 'c', nonce: 0, roll: 0 }
  }])[0].id;
  limit = [...disk.values()].reduce((n, s) => n + s.length, 0) + 20;
  const saved = () => ({
    item: JSON.parse(disk.get('gachaflix.inventory')).state.items[0].status,
    wallet: JSON.parse(disk.get('gachaflix.wallet')).state.balance,
    transactions: JSON.parse(disk.get('gachaflix.wallet')).state.transactions.length
  });
  console.log(await M([id]), saved(), blocked);
  limit = Infinity;
  await Promise.all([I.persist.rehydrate(), W.persist.rehydrate()]);
  console.log(await M([id]), saved());
})();
~~~

