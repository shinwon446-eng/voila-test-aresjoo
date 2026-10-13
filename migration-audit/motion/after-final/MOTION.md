# 개봉 연출 측정: after-final

주소: http://127.0.0.1:4174/voila-test-aresjoo
시작: 2026-10-12T18:47:05.495Z
조건: ko, 폭 390, 경우마다 3번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-normal | 3/3 | 30 (30~31) | 527 (526~530) | 153 (149~156) | 171 (167~179) | 357 (352~358) | 885 (879~885) | 1242 (1231~1243) | true, true, true |
| one-reduced | 3/3 | 31 (30~32) | 없음 | 없음 | 없음 | 350 (349~352) | 42 (39~43) | 393 (388~394) | true, true, true |
| five-normal | 3/3 | 31 (30~31) | 533 (533~534) | 147 (143~151) | 176 (167~179) | 351 (351~351) | 886 (882~887) | 1237 (1233~1238) | true, true, true |
| five-reduced | 3/3 | 31 (30~32) | 없음 | 없음 | 없음 | 349 (348~353) | 42 (40~43) | 391 (391~393) | true, true, true |
| one-item-normal | 3/3 | 39 (39~40) | 527 (526~527) | 150 (149~150) | 190 (179~190) | 345 (344~354) | 905 (895~906) | 1250 (1249~1250) | true, true, true |
| one-short | 3/3 | 31 (31~31) | 232 (227~234) | 116 (109~120) | 121 (112~128) | 352 (348~362) | 500 (490~502) | 848 (842~864) | true, true, true |
| one-skip | 3/3 | 31 (31~31) | 없음 | 없음 | 없음 | 350 (349~356) | 226 (225~226) | 575 (575~582) | true, true, true |
| one-escape | 3/3 | 30 (30~30) | 없음 | 없음 | 없음 | 349 (349~357) | 199 (199~204) | 548 (548~561) | true, true, true |
| one-slow4x | 3/3 | 147 (139~156) | 556 (550~558) | 148 (148~165) | 169 (169~183) | 385 (385~387) | 1031 (1014~1043) | 1416 (1399~1430) | true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 17:write(fair) → 18:write(wallet) → 18:write(inventory) → 18:write(inventory) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 22:dom(recover) → 30:dom(anticipation,opening) → 556:dom(impact,opening) → 712:dom(exit,opening) → 875:write(journal) → 879:dom(reveal,revealed) → 1231:dom(ready,settled,armed)
- one-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 31:dom(anticipation,opening) → 39:write(journal) → 43:dom(reveal,revealed) → 393:dom(ready,settled,armed)
- five-normal: 0:pointerdown(open-primary) → 0:click(open-primary) → 4:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 20:write(wallet) → 20:write(inventory) → 20:write(inventory) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 24:dom(recover) → 31:dom(anticipation) → 564:dom(impact) → 715:dom(exit) → 879:write(journal) → 882:dom(result) → 1233:dom(result,armed)
- five-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 20:write(wallet) → 20:write(inventory) → 20:write(inventory) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 24:dom(recover) → 30:dom(anticipation) → 37:write(journal) → 40:dom(result) → 393:dom(result,armed)
- one-item-normal: 0:pointerdown(confirm) → 1:click(confirm) → 8:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 22:write(wallet) → 22:write(inventory) → 23:write(wallet) → 29:dom(recover) → 39:dom(anticipation,opening) → 566:dom(impact,opening) → 715:dom(exit,opening) → 897:write(journal) → 905:dom(reveal,revealed) → 1250:dom(ready,settled,armed)
- one-short: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 20:write(wallet) → 23:dom(recover) → 31:dom(anticipation,opening) → 265:dom(impact,opening) → 374:dom(exit,opening) → 498:write(journal) → 502:dom(reveal,revealed) → 864:dom(ready,settled,armed)
- one-skip: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 31:dom(anticipation,opening) → 215:pointerdown(skip) → 216:click(skip) → 221:write(journal) → 226:dom(reveal,revealed) → 582:dom(ready,settled,armed)
- one-escape: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 30:dom(anticipation,opening) → 195:write(journal) → 199:dom(reveal,revealed) → 548:dom(ready,settled,armed)
- one-slow4x: 0:pointerdown(open-primary) → 6:click(open-primary) → 27:dom(busy) → 39:write(wallet) → 39:write(inventory) → 40:write(fair) → 65:write(fair) → 67:write(wallet) → 69:write(inventory) → 70:write(inventory) → 71:write(wallet) → 71:write(wallet) → 72:write(wallet) → 72:write(wallet) → 99:dom(recover) → 156:dom(anticipation,opening) → 712:dom(impact,opening) → 860:dom(exit,opening) → 1043:dom(reveal,revealed) → 1062:write(journal) → 1430:dom(ready,settled,armed)

## 끼어들기 뒤의 장부

| 경우 | 단계 | 계정 거래 수 | 계정 상품 수 | nonce | 본 기록 수 | 화면 |
|---|---|---|---|---|---|---|
| second-press | 누르기 전 | 1 | 0 | 0 | 0 | 개봉 화면 없음, 다시 보기 단추 없음 |
| second-press | 연출 도중에 두 번 더 누른 직후 | 3 | 1 | 1 | 0 | 개봉 화면 anticipation, 다시 보기 단추 없음 |
| second-press | 결과가 뜬 뒤 | 3 | 1 | 1 | 1 | 개봉 화면 ready, 다시 보기 단추 없음 |
| rapid-triple-click | 누르기 전 | 1 | 0 | 0 | 0 | 개봉 화면 없음, 다시 보기 단추 없음 |
| rapid-triple-click | 결과가 뜬 뒤 | 3 | 1 | 1 | 1 | 개봉 화면 ready, 다시 보기 단추 없음 |
| leave-mid | 누르기 전 | 1 | 0 | 0 | 0 | 개봉 화면 없음, 다시 보기 단추 없음 |
| leave-mid | 떠난 뒤(박스 목록) | 3 | 1 | 1 | 0 | 개봉 화면 없음, 다시 보기 단추 없음 |
| leave-mid | 돌아온 뒤 | 3 | 1 | 1 | 0 | 개봉 화면 없음, 다시 보기 단추 있음 |
| leave-mid | 못 본 결과를 다시 본 뒤 | 3 | 1 | 1 | 1 | 개봉 화면 ready, 다시 보기 단추 없음 |
| leave-mid | 닫은 뒤 | 3 | 1 | 1 | 1 | 개봉 화면 없음, 다시 보기 단추 없음 |
| refresh-mid | 누르기 전 | 1 | 0 | 0 | 0 | 개봉 화면 없음, 다시 보기 단추 없음 |
| refresh-mid | 새로 고친 뒤 | 3 | 1 | 1 | 0 | 개봉 화면 없음, 다시 보기 단추 있음 |
| refresh-mid | 못 본 결과를 다시 본 뒤 | 3 | 1 | 1 | 1 | 개봉 화면 ready, 다시 보기 단추 없음 |
| refresh-mid | 한 번 더 새로 고친 뒤 | 3 | 1 | 1 | 1 | 개봉 화면 없음, 다시 보기 단추 없음 |
| back-mid | 누르기 전 | 1 | 0 | 0 | 0 | 개봉 화면 없음, 다시 보기 단추 없음 |
| back-mid | 뒤로 간 뒤 | 3 | 1 | 1 | 0 | 개봉 화면 없음, 다시 보기 단추 없음 |
| back-mid | 앞으로 돌아온 뒤 | 3 | 1 | 1 | 0 | 개봉 화면 없음, 다시 보기 단추 있음 |

## 실행하지 않은 것

- 탭을 뒤로 보냈다 돌아옴: headless 브라우저의 한 탭에서는 실제 백그라운드 전환(타이머 늦춤)을 만들 수 없다. 실행하지 않았다
- 소리 재생 실패: 기본 설정은 소리 끔이고, headless 에서는 소리 장치가 없어 실패와 성공을 가를 수 없다. 실행하지 않았다
- 실제 모바일 브라우저: 데스크톱 Chrome 의 모바일 흉내(폭, 배율, 터치)만 쓴다. 실제 기기에서는 실행하지 않았다
