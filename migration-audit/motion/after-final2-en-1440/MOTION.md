# 개봉 연출 측정: after-final2-en-1440

주소: http://127.0.0.1:4187/voila-test-aresjoo
시작: 2026-10-12T20:59:37.791Z
조건: en, 폭 1440, 경우마다 3번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-normal | 3/3 | 29 (28~33) | 528 (527~531) | 152 (149~157) | 172 (170~172) | 351 (350~356) | 885 (878~885) | 1236 (1228~1241) | true, true, true |
| one-reduced | 3/3 | 30 (30~30) | 없음 | 없음 | 없음 | 349 (349~351) | 41 (40~42) | 390 (389~393) | true, true, true |
| five-normal | 3/3 | 31 (30~32) | 526 (523~534) | 150 (144~155) | 177 (168~183) | 351 (349~360) | 886 (881~886) | 1235 (1232~1246) | true, true, true |
| five-reduced | 3/3 | 31 (30~33) | 없음 | 없음 | 없음 | 353 (353~356) | 42 (41~44) | 397 (394~398) | true, true, true |
| one-item-normal | 3/3 | 38 (37~38) | 528 (526~529) | 150 (149~151) | 175 (174~180) | 349 (349~350) | 890 (890~895) | 1240 (1239~1244) | true, true, true |
| one-short | 3/3 | 30 (30~30) | 230 (228~234) | 111 (101~115) | 129 (120~136) | 350 (348~352) | 498 (495~501) | 848 (847~849) | true, true, true |
| one-skip | 3/3 | 30 (29~31) | 없음 | 없음 | 없음 | 351 (350~351) | 226 (225~227) | 576 (576~578) | true, true, true |
| one-escape | 3/3 | 29 (29~30) | 없음 | 없음 | 없음 | 350 (348~354) | 199 (195~200) | 549 (548~549) | true, true, true |
| one-slow4x | 3/3 | 150 (148~155) | 548 (546~559) | 158 (147~165) | 169 (165~171) | 366 (361~368) | 1030 (1019~1032) | 1398 (1380~1398) | true, true, true |
| tone-below | 3/3 | 38 (37~38) | 529 (526~530) | 149 (148~152) | 179 (175~185) | 347 (345~353) | 895 (890~901) | 1246 (1237~1248) | true, true, true |
| tone-above | 3/3 | 39 (38~41) | 527 (526~529) | 149 (148~159) | 179 (171~186) | 348 (347~349) | 900 (891~901) | 1249 (1238~1249) | true, true, true |
| tone-high | 3/3 | 39 (38~39) | 527 (525~529) | 149 (148~151) | 181 (176~189) | 353 (345~353) | 896 (891~904) | 1249 (1244~1249) | true, true, true |
| tone-top | 3/3 | 38 (38~39) | 528 (528~529) | 149 (149~150) | 180 (175~185) | 354 (348~358) | 896 (891~901) | 1249 (1249~1250) | true, true, true |
| tone-cash-above | 3/3 | 41 (41~42) | 525 (524~528) | 149 (149~159) | 181 (171~182) | 352 (349~353) | 897 (895~900) | 1249 (1248~1249) | true, true, true |
| tone-cash-top | 3/3 | 51 (51~52) | 531 (528~531) | 149 (149~151) | 171 (170~172) | 356 (348~357) | 902 (901~903) | 1259 (1249~1259) | true, true, true |
| ten-low | 3/3 | 41 (41~42) | 525 (525~536) | 150 (148~150) | 181 (171~192) | 352 (346~352) | 897 (897~908) | 1249 (1243~1260) | true, true, true |
| ten-top | 3/3 | 41 (41~44) | 525 (525~526) | 151 (150~155) | 186 (184~190) | 345 (345~349) | 906 (905~907) | 1251 (1250~1256) | true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 13:write(wallet) → 13:write(inventory) → 13:write(fair) → 17:write(fair) → 17:write(wallet) → 17:write(inventory) → 17:write(inventory) → 17:write(wallet) → 17:write(wallet) → 17:write(wallet) → 18:write(wallet) → 21:dom(recover) → 28:dom(anticipation,opening) → 556:dom(impact,opening) → 713:dom(exit,opening) → 881:write(journal) → 885:dom(reveal,revealed) → 1236:dom(ready,settled,armed)
- one-reduced: 0:pointerdown(open-primary) → 2:click(open-primary) → 6:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 18:write(fair) → 18:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 30:dom(anticipation,opening) → 37:write(journal) → 42:dom(reveal,revealed) → 393:dom(ready,settled,armed)
- five-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(wallet) → 20:write(inventory) → 20:write(inventory) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 23:dom(recover) → 30:dom(anticipation) → 553:dom(impact) → 703:dom(exit) → 883:write(journal) → 886:dom(result) → 1235:dom(result,armed)
- five-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 20:write(wallet) → 20:write(inventory) → 20:write(inventory) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 24:dom(recover) → 30:dom(anticipation) → 38:write(journal) → 42:dom(result) → 398:dom(result,armed)
- one-item-normal: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 15:write(wallet) → 15:write(inventory) → 16:write(fair) → 21:write(fair) → 22:write(wallet) → 22:write(inventory) → 22:write(wallet) → 28:dom(recover) → 37:dom(anticipation,opening) → 566:dom(impact,opening) → 716:dom(exit,opening) → 883:write(journal) → 890:dom(reveal,revealed) → 1239:dom(ready,settled,armed)
- one-short: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 30:dom(anticipation,opening) → 260:dom(impact,opening) → 375:dom(exit,opening) → 492:write(journal) → 495:dom(reveal,revealed) → 847:dom(ready,settled,armed)
- one-skip: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 18:write(fair) → 18:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 31:dom(anticipation,opening) → 216:pointerdown(skip) → 217:click(skip) → 222:write(journal) → 227:dom(reveal,revealed) → 578:dom(ready,settled,armed)
- one-escape: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 19:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 23:dom(recover) → 30:dom(anticipation,opening) → 196:write(journal) → 199:dom(reveal,revealed) → 549:dom(ready,settled,armed)
- one-slow4x: 0:pointerdown(open-primary) → 6:click(open-primary) → 28:dom(busy) → 40:write(wallet) → 40:write(inventory) → 40:write(fair) → 62:write(fair) → 64:write(wallet) → 65:write(inventory) → 66:write(inventory) → 66:write(wallet) → 67:write(wallet) → 67:write(wallet) → 67:write(wallet) → 90:dom(recover) → 150:dom(anticipation,opening) → 696:dom(impact,opening) → 854:dom(exit,opening) → 1019:dom(reveal,revealed) → 1021:write(journal) → 1380:dom(ready,settled,armed)
- tone-below: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 21:write(fair) → 22:write(wallet) → 22:write(inventory) → 22:write(wallet) → 28:dom(recover) → 38:dom(anticipation,opening) → 564:dom(impact,opening) → 716:dom(exit,opening) → 888:write(journal) → 895:dom(reveal,revealed) → 1248:dom(ready,settled,armed)
- tone-above: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 22:write(wallet) → 22:write(inventory) → 22:write(wallet) → 28:dom(recover) → 38:dom(anticipation,opening) → 564:dom(impact,opening) → 712:dom(exit,opening) → 883:write(journal) → 891:dom(reveal,revealed) → 1238:dom(ready,settled,armed)
- tone-high: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 17:write(inventory) → 17:write(fair) → 22:write(fair) → 23:write(wallet) → 23:write(inventory) → 23:write(wallet) → 29:dom(recover) → 39:dom(anticipation,opening) → 566:dom(impact,opening) → 715:dom(exit,opening) → 889:write(journal) → 896:dom(reveal,revealed) → 1249:dom(ready,settled,armed)
- tone-top: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 23:write(wallet) → 23:write(inventory) → 23:write(wallet) → 29:dom(recover) → 39:dom(anticipation,opening) → 567:dom(impact,opening) → 716:dom(exit,opening) → 889:write(journal) → 896:dom(reveal,revealed) → 1250:dom(ready,settled,armed)
- tone-cash-above: 0:pointerdown(open-primary) → 1:click(open-primary) → 22:dom(busy) → 25:write(wallet) → 25:write(inventory) → 25:write(fair) → 28:write(fair) → 29:write(wallet) → 29:write(inventory) → 29:write(inventory) → 29:write(wallet) → 29:write(wallet) → 29:write(wallet) → 29:write(wallet) → 33:dom(recover) → 42:dom(anticipation,opening) → 570:dom(impact,opening) → 729:dom(exit,opening) → 896:write(journal) → 900:dom(reveal,revealed) → 1249:dom(ready,settled,armed)
- tone-cash-top: 0:pointerdown(open-primary) → 1:click(open-primary) → 34:dom(busy) → 36:write(wallet) → 36:write(inventory) → 36:write(fair) → 39:write(fair) → 40:write(wallet) → 40:write(inventory) → 40:write(wallet) → 40:write(wallet) → 44:dom(recover) → 51:dom(anticipation,opening) → 582:dom(impact,opening) → 731:dom(exit,opening) → 899:write(journal) → 902:dom(reveal,revealed) → 1259:dom(ready,settled,armed)
- ten-low: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 23:write(wallet) → 23:write(inventory) → 23:write(wallet) → 30:dom(recover) → 41:dom(anticipation) → 566:dom(impact) → 716:dom(exit) → 889:write(journal) → 897:dom(result) → 1249:dom(result,armed)
- ten-top: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 23:write(wallet) → 23:write(inventory) → 23:write(wallet) → 30:dom(recover) → 41:dom(anticipation) → 566:dom(impact) → 716:dom(exit) → 898:write(journal) → 906:dom(result) → 1251:dom(result,armed)

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
