# 개봉 연출 측정: after-final3-en-1440

주소: http://127.0.0.1:4189/voila-test-aresjoo
시작: 2026-10-12T23:03:47.727Z
조건: en, 폭 1440, 경우마다 3번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-normal | 3/3 | 29 (28~30) | 528 (524~529) | 150 (149~161) | 171 (170~178) | 349 (348~351) | 883 (878~886) | 1231 (1227~1237) | true, true, true |
| one-reduced | 3/3 | 30 (30~31) | 없음 | 없음 | 없음 | 348 (348~354) | 41 (40~43) | 389 (388~397) | true, true, true |
| five-normal | 3/3 | 31 (30~31) | 534 (532~534) | 143 (143~143) | 175 (173~179) | 351 (350~352) | 881 (880~887) | 1232 (1232~1237) | true, true, true |
| five-reduced | 3/3 | 31 (31~31) | 없음 | 없음 | 없음 | 351 (349~356) | 42 (42~42) | 393 (391~398) | true, true, true |
| one-item-normal | 3/3 | 38 (38~41) | 528 (526~529) | 150 (149~151) | 180 (180~186) | 352 (347~354) | 895 (895~906) | 1247 (1242~1260) | true, true, true |
| one-short | 3/3 | 29 (29~30) | 235 (229~235) | 100 (100~106) | 130 (126~135) | 352 (349~353) | 495 (490~499) | 848 (842~848) | true, true, true |
| one-skip | 3/3 | 29 (28~30) | 없음 | 없음 | 없음 | 354 (349~356) | 226 (226~228) | 582 (575~582) | true, true, true |
| one-escape | 3/3 | 29 (29~30) | 없음 | 없음 | 없음 | 353 (352~357) | 201 (196~206) | 558 (549~558) | true, true, true |
| one-slow4x | 3/3 | 162 (157~183) | 555 (549~562) | 147 (141~158) | 174 (168~177) | 368 (367~389) | 1038 (1032~1063) | 1427 (1400~1430) | true, true, true |
| tone-below | 3/3 | 39 (39~39) | 528 (527~528) | 149 (149~150) | 185 (180~186) | 348 (347~348) | 901 (896~902) | 1249 (1243~1250) | true, true, true |
| tone-above | 3/3 | 39 (39~39) | 528 (526~528) | 149 (149~150) | 185 (180~190) | 349 (349~352) | 900 (896~906) | 1249 (1248~1255) | true, true, true |
| tone-high | 3/3 | 41 (39~42) | 527 (526~529) | 154 (149~156) | 182 (170~187) | 352 (346~353) | 897 (897~908) | 1250 (1243~1260) | true, true, true |
| tone-top | 3/3 | 39 (39~39) | 528 (528~528) | 149 (148~149) | 180 (180~191) | 354 (344~354) | 896 (896~906) | 1250 (1250~1250) | true, true, true |
| tone-cash-above | 3/3 | 48 (43~48) | 533 (532~533) | 145 (143~149) | 174 (171~181) | 358 (349~359) | 900 (898~902) | 1258 (1247~1261) | true, true, true |
| tone-cash-top | 3/3 | 44 (41~44) | 530 (526~539) | 155 (139~155) | 173 (171~181) | 351 (350~356) | 898 (897~903) | 1248 (1248~1259) | true, true, true |
| ten-low | 3/3 | 44 (42~45) | 527 (527~529) | 155 (150~155) | 183 (173~186) | 348 (345~358) | 908 (899~909) | 1257 (1244~1266) | true, true, true |
| ten-top | 3/3 | 42 (42~43) | 534 (533~537) | 150 (140~150) | 178 (175~183) | 352 (345~352) | 900 (898~909) | 1250 (1245~1261) | true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 17:write(fair) → 18:write(wallet) → 18:write(inventory) → 18:write(inventory) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 21:dom(recover) → 28:dom(anticipation,opening) → 552:dom(impact,opening) → 713:dom(exit,opening) → 879:write(journal) → 883:dom(reveal,revealed) → 1231:dom(ready,settled,armed)
- one-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 18:write(fair) → 18:write(wallet) → 18:write(inventory) → 18:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 30:dom(anticipation,opening) → 37:write(journal) → 41:dom(reveal,revealed) → 389:dom(ready,settled,armed)
- five-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 20:write(wallet) → 20:write(inventory) → 20:write(inventory) → 20:write(wallet) → 20:write(wallet) → 21:write(wallet) → 21:write(wallet) → 24:dom(recover) → 31:dom(anticipation) → 565:dom(impact) → 708:dom(exit) → 878:write(journal) → 881:dom(result) → 1232:dom(result,armed)
- five-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 20:write(wallet) → 20:write(inventory) → 20:write(inventory) → 21:write(wallet) → 21:write(wallet) → 21:write(wallet) → 21:write(wallet) → 24:dom(recover) → 31:dom(anticipation) → 38:write(journal) → 42:dom(result) → 393:dom(result,armed)
- one-item-normal: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 21:write(fair) → 22:write(wallet) → 22:write(inventory) → 22:write(wallet) → 28:dom(recover) → 38:dom(anticipation,opening) → 566:dom(impact,opening) → 715:dom(exit,opening) → 888:write(journal) → 895:dom(reveal,revealed) → 1242:dom(ready,settled,armed)
- one-short: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 18:write(fair) → 18:write(wallet) → 18:write(inventory) → 18:write(inventory) → 18:write(wallet) → 18:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 29:dom(anticipation,opening) → 264:dom(impact,opening) → 364:dom(exit,opening) → 496:write(journal) → 499:dom(reveal,revealed) → 848:dom(ready,settled,armed)
- one-skip: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 18:write(fair) → 18:write(wallet) → 18:write(inventory) → 18:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 28:dom(anticipation,opening) → 216:pointerdown(skip) → 216:click(skip) → 221:write(journal) → 226:dom(reveal,revealed) → 575:dom(ready,settled,armed)
- one-escape: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 19:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 20:write(wallet) → 20:write(wallet) → 23:dom(recover) → 30:dom(anticipation,opening) → 198:write(journal) → 201:dom(reveal,revealed) → 558:dom(ready,settled,armed)
- one-slow4x: 0:pointerdown(open-primary) → 5:click(open-primary) → 30:dom(busy) → 41:write(wallet) → 41:write(inventory) → 42:write(fair) → 64:write(fair) → 67:write(wallet) → 68:write(inventory) → 69:write(inventory) → 70:write(wallet) → 70:write(wallet) → 71:write(wallet) → 71:write(wallet) → 95:dom(recover) → 157:dom(anticipation,opening) → 706:dom(impact,opening) → 864:dom(exit,opening) → 1032:dom(reveal,revealed) → 1035:write(journal) → 1400:dom(ready,settled,armed)
- tone-below: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 22:write(wallet) → 23:write(inventory) → 23:write(wallet) → 29:dom(recover) → 39:dom(anticipation,opening) → 567:dom(impact,opening) → 716:dom(exit,opening) → 893:write(journal) → 901:dom(reveal,revealed) → 1249:dom(ready,settled,armed)
- tone-above: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 22:write(fair) → 22:write(wallet) → 22:write(inventory) → 22:write(wallet) → 29:dom(recover) → 39:dom(anticipation,opening) → 567:dom(impact,opening) → 716:dom(exit,opening) → 889:write(journal) → 896:dom(reveal,revealed) → 1248:dom(ready,settled,armed)
- tone-high: 0:pointerdown(confirm) → 1:click(confirm) → 8:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 23:write(wallet) → 23:write(inventory) → 23:write(wallet) → 30:dom(recover) → 41:dom(anticipation,opening) → 567:dom(impact,opening) → 721:dom(exit,opening) → 900:write(journal) → 908:dom(reveal,revealed) → 1260:dom(ready,settled,armed)
- tone-top: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 22:write(wallet) → 22:write(inventory) → 22:write(wallet) → 29:dom(recover) → 39:dom(anticipation,opening) → 567:dom(impact,opening) → 716:dom(exit,opening) → 888:write(journal) → 896:dom(reveal,revealed) → 1250:dom(ready,settled,armed)
- tone-cash-above: 0:pointerdown(open-primary) → 1:click(open-primary) → 22:dom(busy) → 25:write(wallet) → 25:write(inventory) → 25:write(fair) → 28:write(fair) → 29:write(wallet) → 29:write(inventory) → 29:write(inventory) → 29:write(wallet) → 29:write(wallet) → 29:write(wallet) → 29:write(wallet) → 34:dom(recover) → 43:dom(anticipation,opening) → 576:dom(impact,opening) → 721:dom(exit,opening) → 898:write(journal) → 902:dom(reveal,revealed) → 1261:dom(ready,settled,armed)
- tone-cash-top: 0:pointerdown(open-primary) → 1:click(open-primary) → 23:dom(busy) → 25:write(wallet) → 25:write(inventory) → 25:write(fair) → 29:write(fair) → 29:write(wallet) → 29:write(inventory) → 30:write(wallet) → 30:write(wallet) → 34:dom(recover) → 44:dom(anticipation,opening) → 583:dom(impact,opening) → 722:dom(exit,opening) → 899:write(journal) → 903:dom(reveal,revealed) → 1259:dom(ready,settled,armed)
- ten-low: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 23:write(fair) → 23:write(fair) → 23:write(fair) → 23:write(fair) → 23:write(fair) → 23:write(fair) → 23:write(fair) → 23:write(fair) → 23:write(fair) → 23:write(wallet) → 24:write(inventory) → 24:write(wallet) → 32:dom(recover) → 45:dom(anticipation) → 572:dom(impact) → 722:dom(exit) → 900:write(journal) → 908:dom(result) → 1266:dom(result,armed)
- ten-top: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(wallet) → 23:write(inventory) → 23:write(wallet) → 30:dom(recover) → 43:dom(anticipation) → 580:dom(impact) → 720:dom(exit) → 889:write(journal) → 898:dom(result) → 1250:dom(result,armed)

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
