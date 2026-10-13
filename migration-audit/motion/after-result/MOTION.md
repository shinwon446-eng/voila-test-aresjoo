# 개봉 연출 측정: after-result

주소: http://127.0.0.1:4184/voila-test-aresjoo
시작: 2026-10-12T16:59:42.289Z
조건: ko, 폭 390, 경우마다 3번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-normal | 3/3 | 30 (29~30) | 535 (535~535) | 143 (143~146) | 177 (174~178) | 358 (357~363) | 885 (885~885) | 1243 (1242~1248) | true, true, true |
| one-reduced | 3/3 | 30 (29~30) | 없음 | 없음 | 없음 | 358 (348~358) | 40 (40~41) | 398 (389~398) | true, true, true |
| five-normal | 3/3 | 30 (29~32) | 532 (524~535) | 145 (143~154) | 177 (177~178) | 360 (349~361) | 885 (885~886) | 1245 (1234~1247) | true, true, true |
| five-reduced | 3/3 | 30 (30~31) | 없음 | 없음 | 없음 | 358 (357~359) | 40 (40~41) | 399 (397~399) | true, true, true |
| one-item-normal | 3/3 | 38 (38~38) | 527 (526~528) | 152 (150~152) | 174 (174~181) | 348 (345~353) | 891 (890~897) | 1242 (1238~1244) | true, true, true |
| one-short | 3/3 | 29 (29~30) | 231 (224~233) | 111 (103~112) | 126 (118~138) | 351 (348~356) | 492 (491~501) | 848 (842~849) | true, true, true |
| one-skip | 3/3 | 30 (29~30) | 없음 | 없음 | 없음 | 355 (350~357) | 241 (227~242) | 592 (582~598) | true, true, true |
| one-escape | 3/3 | 30 (29~31) | 없음 | 없음 | 없음 | 352 (351~352) | 197 (196~198) | 549 (548~549) | true, true, true |
| one-slow4x | 3/3 | 150 (148~165) | 550 (548~562) | 148 (138~150) | 184 (178~186) | 371 (368~377) | 1030 (1028~1049) | 1405 (1398~1420) | true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 17:write(fair) → 18:write(wallet) → 18:write(inventory) → 18:write(inventory) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 22:dom(recover) → 29:dom(anticipation,opening) → 564:dom(impact,opening) → 707:dom(exit,opening) → 881:write(journal) → 885:dom(reveal,revealed) → 1242:dom(ready,settled,armed)
- one-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 29:dom(anticipation,opening) → 36:write(journal) → 40:dom(reveal,revealed) → 398:dom(ready,settled,armed)
- five-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 20:write(wallet) → 20:write(inventory) → 20:write(inventory) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 24:dom(recover) → 30:dom(anticipation) → 554:dom(impact) → 708:dom(exit) → 882:write(journal) → 885:dom(result) → 1245:dom(result,armed)
- five-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 20:write(wallet) → 20:write(inventory) → 20:write(inventory) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 23:dom(recover) → 31:dom(anticipation) → 37:write(journal) → 41:dom(result) → 399:dom(result,armed)
- one-item-normal: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 22:write(wallet) → 22:write(inventory) → 23:write(wallet) → 29:dom(recover) → 38:dom(anticipation,opening) → 564:dom(impact,opening) → 716:dom(exit,opening) → 883:write(journal) → 890:dom(reveal,revealed) → 1238:dom(ready,settled,armed)
- one-short: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 29:dom(anticipation,opening) → 253:dom(impact,opening) → 365:dom(exit,opening) → 488:write(journal) → 491:dom(reveal,revealed) → 842:dom(ready,settled,armed)
- one-skip: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 14:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 30:dom(anticipation,opening) → 215:pointerdown(skip) → 217:click(skip) → 221:write(journal) → 227:dom(reveal,revealed) → 582:dom(ready,settled,armed)
- one-escape: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 29:dom(anticipation,opening) → 194:write(journal) → 197:dom(reveal,revealed) → 549:dom(ready,settled,armed)
- one-slow4x: 0:pointerdown(open-primary) → 4:click(open-primary) → 25:dom(busy) → 37:write(wallet) → 37:write(inventory) → 37:write(fair) → 63:write(fair) → 66:write(wallet) → 68:write(inventory) → 68:write(inventory) → 69:write(wallet) → 69:write(wallet) → 70:write(wallet) → 70:write(wallet) → 93:dom(recover) → 150:dom(anticipation,opening) → 700:dom(impact,opening) → 850:dom(exit,opening) → 1028:dom(reveal,revealed) → 1045:write(journal) → 1405:dom(ready,settled,armed)

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
