# 개봉 연출 측정: after-final2

주소: http://127.0.0.1:4187/voila-test-aresjoo
시작: 2026-10-12T20:48:30.162Z
조건: ko, 폭 390, 경우마다 3번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-normal | 3/3 | 30 (29~30) | 534 (532~535) | 150 (145~151) | 172 (170~176) | 358 (352~358) | 885 (884~885) | 1243 (1236~1243) | true, true, true |
| one-reduced | 3/3 | 30 (29~31) | 없음 | 없음 | 없음 | 356 (347~358) | 40 (39~41) | 397 (387~397) | true, true, true |
| five-normal | 3/3 | 31 (31~34) | 533 (531~533) | 150 (145~151) | 172 (167~176) | 352 (351~358) | 886 (882~886) | 1238 (1233~1244) | true, true, true |
| five-reduced | 3/3 | 31 (30~31) | 없음 | 없음 | 없음 | 351 (348~358) | 41 (40~42) | 392 (390~398) | true, true, true |
| one-item-normal | 3/3 | 39 (39~45) | 527 (527~532) | 149 (144~150) | 180 (179~188) | 349 (347~354) | 900 (896~903) | 1250 (1249~1250) | true, true, true |
| one-short | 3/3 | 30 (30~30) | 235 (231~235) | 104 (104~105) | 128 (121~131) | 350 (348~358) | 496 (490~498) | 848 (844~848) | true, true, true |
| one-skip | 3/3 | 30 (29~30) | 없음 | 없음 | 없음 | 355 (355~357) | 227 (225~241) | 582 (580~598) | true, true, true |
| one-escape | 3/3 | 30 (29~30) | 없음 | 없음 | 없음 | 352 (349~364) | 199 (196~201) | 548 (548~565) | true, true, true |
| one-slow4x | 3/3 | 167 (150~178) | 566 (553~608) | 148 (98~159) | 171 (156~176) | 384 (378~470) | 1049 (1018~1063) | 1447 (1396~1519) | true, true, true |
| tone-below | 3/3 | 40 (39~43) | 528 (527~530) | 148 (147~149) | 180 (175~185) | 350 (346~355) | 896 (895~900) | 1250 (1242~1250) | true, true, true |
| tone-above | 3/3 | 39 (38~40) | 527 (527~529) | 149 (149~149) | 185 (177~186) | 348 (348~349) | 900 (893~902) | 1249 (1241~1250) | true, true, true |
| tone-high | 3/3 | 39 (37~39) | 527 (527~529) | 149 (148~151) | 179 (176~185) | 351 (349~353) | 895 (891~900) | 1246 (1244~1249) | true, true, true |
| tone-top | 3/3 | 39 (38~39) | 528 (526~528) | 148 (148~152) | 186 (176~190) | 349 (348~361) | 901 (891~906) | 1250 (1239~1267) | true, true, true |
| tone-cash-above | 3/3 | 42 (42~52) | 534 (530~535) | 148 (141~150) | 171 (167~181) | 355 (349~358) | 899 (891~903) | 1249 (1248~1258) | true, true, true |
| tone-cash-top | 3/3 | 40 (40~42) | 525 (525~534) | 150 (144~150) | 181 (176~188) | 353 (353~360) | 896 (896~903) | 1249 (1249~1263) | true, true, true |
| ten-low | 3/3 | 41 (41~45) | 526 (526~531) | 150 (149~150) | 183 (180~191) | 351 (344~354) | 907 (897~909) | 1251 (1251~1260) | true, true, true |
| ten-top | 3/3 | 41 (41~45) | 530 (525~536) | 150 (140~150) | 181 (177~186) | 348 (348~350) | 898 (897~907) | 1248 (1245~1255) | true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 17:write(fair) → 18:write(wallet) → 18:write(inventory) → 18:write(inventory) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 22:dom(recover) → 30:dom(anticipation,opening) → 564:dom(impact,opening) → 714:dom(exit,opening) → 881:write(journal) → 884:dom(reveal,revealed) → 1236:dom(ready,settled,armed)
- one-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 31:dom(anticipation,opening) → 38:write(journal) → 41:dom(reveal,revealed) → 397:dom(ready,settled,armed)
- five-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(wallet) → 21:write(inventory) → 21:write(inventory) → 21:write(wallet) → 21:write(wallet) → 21:write(wallet) → 21:write(wallet) → 24:dom(recover) → 31:dom(anticipation) → 564:dom(impact) → 714:dom(exit) → 882:write(journal) → 886:dom(result) → 1244:dom(result,armed)
- five-reduced: 0:pointerdown(open-primary) → 0:click(open-primary) → 4:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 20:write(wallet) → 20:write(inventory) → 20:write(inventory) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 24:dom(recover) → 30:dom(anticipation) → 37:write(journal) → 40:dom(result) → 398:dom(result,armed)
- one-item-normal: 0:pointerdown(confirm) → 1:click(confirm) → 8:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 22:write(wallet) → 23:write(inventory) → 23:write(wallet) → 29:dom(recover) → 39:dom(anticipation,opening) → 566:dom(impact,opening) → 716:dom(exit,opening) → 889:write(journal) → 896:dom(reveal,revealed) → 1250:dom(ready,settled,armed)
- one-short: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 18:write(fair) → 18:write(wallet) → 18:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 30:dom(anticipation,opening) → 265:dom(impact,opening) → 370:dom(exit,opening) → 494:write(journal) → 498:dom(reveal,revealed) → 848:dom(ready,settled,armed)
- one-skip: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 29:dom(anticipation,opening) → 216:pointerdown(skip) → 217:click(skip) → 222:write(journal) → 227:dom(reveal,revealed) → 582:dom(ready,settled,armed)
- one-escape: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 18:write(fair) → 18:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 30:dom(anticipation,opening) → 196:write(journal) → 199:dom(reveal,revealed) → 548:dom(ready,settled,armed)
- one-slow4x: 0:pointerdown(open-primary) → 6:click(open-primary) → 36:dom(busy) → 48:write(wallet) → 48:write(inventory) → 48:write(fair) → 76:write(fair) → 79:write(wallet) → 80:write(inventory) → 81:write(inventory) → 81:write(wallet) → 82:write(wallet) → 82:write(wallet) → 82:write(wallet) → 109:dom(recover) → 167:dom(anticipation,opening) → 775:dom(impact,opening) → 873:dom(exit,opening) → 1049:dom(reveal,revealed) → 1066:write(journal) → 1519:dom(ready,settled,armed)
- tone-below: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 23:write(fair) → 23:write(wallet) → 24:write(inventory) → 24:write(wallet) → 31:dom(recover) → 43:dom(anticipation,opening) → 573:dom(impact,opening) → 720:dom(exit,opening) → 888:write(journal) → 895:dom(reveal,revealed) → 1250:dom(ready,settled,armed)
- tone-above: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 22:write(fair) → 22:write(wallet) → 22:write(inventory) → 23:write(wallet) → 29:dom(recover) → 39:dom(anticipation,opening) → 566:dom(impact,opening) → 715:dom(exit,opening) → 892:write(journal) → 900:dom(reveal,revealed) → 1249:dom(ready,settled,armed)
- tone-high: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 21:write(fair) → 22:write(wallet) → 22:write(inventory) → 22:write(wallet) → 28:dom(recover) → 37:dom(anticipation,opening) → 564:dom(impact,opening) → 715:dom(exit,opening) → 883:write(journal) → 891:dom(reveal,revealed) → 1244:dom(ready,settled,armed)
- tone-top: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 23:write(wallet) → 23:write(inventory) → 23:write(wallet) → 29:dom(recover) → 39:dom(anticipation,opening) → 567:dom(impact,opening) → 715:dom(exit,opening) → 884:write(journal) → 891:dom(reveal,revealed) → 1239:dom(ready,settled,armed)
- tone-cash-above: 0:pointerdown(open-primary) → 1:click(open-primary) → 22:dom(busy) → 24:write(wallet) → 25:write(inventory) → 25:write(fair) → 28:write(fair) → 28:write(wallet) → 29:write(inventory) → 29:write(inventory) → 29:write(wallet) → 29:write(wallet) → 29:write(wallet) → 29:write(wallet) → 32:dom(recover) → 42:dom(anticipation,opening) → 576:dom(impact,opening) → 724:dom(exit,opening) → 887:write(journal) → 891:dom(reveal,revealed) → 1249:dom(ready,settled,armed)
- tone-cash-top: 0:pointerdown(open-primary) → 1:click(open-primary) → 20:dom(busy) → 22:write(wallet) → 22:write(inventory) → 22:write(fair) → 25:write(fair) → 26:write(wallet) → 26:write(inventory) → 26:write(wallet) → 26:write(wallet) → 31:dom(recover) → 40:dom(anticipation,opening) → 565:dom(impact,opening) → 715:dom(exit,opening) → 899:write(journal) → 903:dom(reveal,revealed) → 1263:dom(ready,settled,armed)
- ten-low: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 23:write(wallet) → 23:write(inventory) → 23:write(wallet) → 30:dom(recover) → 41:dom(anticipation) → 567:dom(impact) → 716:dom(exit) → 899:write(journal) → 907:dom(result) → 1251:dom(result,armed)
- ten-top: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(wallet) → 23:write(inventory) → 23:write(wallet) → 30:dom(recover) → 41:dom(anticipation) → 571:dom(impact) → 721:dom(exit) → 890:write(journal) → 898:dom(result) → 1248:dom(result,armed)

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
