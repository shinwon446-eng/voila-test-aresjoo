# 개봉 연출 측정: before-local-en-1440

주소: http://127.0.0.1:4183/voila-test-aresjoo
시작: 2026-10-12T20:54:04.779Z
조건: en, 폭 1440, 경우마다 3번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-normal | 3/3 | 29 (28~31) | 527 (524~529) | 150 (150~155) | 178 (177~179) | 356 (351~357) | 885 (885~887) | 1242 (1236~1243) | true, true, true |
| one-reduced | 3/3 | 29 (28~30) | 없음 | 없음 | 없음 | 352 (352~356) | 40 (40~41) | 393 (392~396) | true, true, true |
| five-normal | 3/3 | 30 (30~33) | 528 (524~529) | 149 (145~155) | 183 (171~184) | 355 (350~355) | 887 (887~887) | 1242 (1237~1242) | true, true, true |
| five-reduced | 3/3 | 30 (30~30) | 없음 | 없음 | 없음 | 347 (347~352) | 42 (41~42) | 389 (388~394) | true, true, true |
| one-item-normal | 3/3 | 36 (35~40) | 530 (530~539) | 145 (145~151) | 179 (173~181) | 358 (356~358) | 890 (889~905) | 1248 (1247~1261) | true, true, true |
| one-short | 3/3 | 29 (29~29) | 224 (223~230) | 110 (106~113) | 133 (129~138) | 351 (351~356) | 498 (492~503) | 849 (848~854) | true, true, true |
| one-skip | 3/3 | 29 (28~29) | 없음 | 없음 | 없음 | 352 (351~353) | 224 (224~225) | 576 (576~577) | true, true, true |
| one-escape | 3/3 | 28 (28~29) | 없음 | 없음 | 없음 | 353 (350~361) | 204 (203~205) | 558 (553~565) | true, true, true |
| one-slow4x | 3/3 | 132 (131~150) | 549 (549~552) | 149 (148~160) | 172 (163~172) | 364 (363~378) | 1001 (1001~1025) | 1365 (1364~1403) | true, true, true |
| tone-below | 3/3 | 35 (35~35) | 532 (531~532) | 149 (149~149) | 174 (172~175) | 347 (347~359) | 890 (888~890) | 1237 (1237~1247) | true, true, true |
| tone-above | 3/3 | 35 (35~36) | 531 (531~532) | 149 (146~150) | 174 (173~177) | 348 (348~355) | 890 (889~890) | 1238 (1238~1244) | true, true, true |
| tone-high | 3/3 | 36 (36~37) | 530 (528~531) | 147 (146~151) | 176 (175~177) | 354 (349~358) | 890 (890~890) | 1244 (1239~1248) | true, true, true |
| tone-top | 3/3 | 35 (35~35) | 532 (530~532) | 149 (147~151) | 174 (173~174) | 354 (350~355) | 889 (888~890) | 1243 (1238~1245) | true, true, true |
| tone-cash-above | 3/3 | 37 (37~38) | 527 (527~529) | 149 (148~150) | 177 (174~182) | 351 (350~352) | 891 (888~896) | 1242 (1238~1248) | true, true, true |
| tone-cash-top | 3/3 | 41 (40~41) | 525 (524~525) | 149 (149~149) | 177 (177~178) | 351 (348~356) | 891 (891~893) | 1242 (1239~1249) | true, true, true |
| ten-low | 3/3 | 39 (38~41) | 527 (525~529) | 149 (149~151) | 190 (175~191) | 358 (353~359) | 906 (891~907) | 1265 (1244~1265) | true, true, true |
| ten-top | 3/3 | 39 (38~39) | 527 (525~527) | 150 (150~152) | 191 (180~193) | 355 (354~356) | 907 (896~908) | 1262 (1250~1264) | true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 17:write(fair) → 17:write(wallet) → 17:write(inventory) → 18:write(inventory) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 21:dom(recover) → 28:dom(anticipation,opening) → 552:dom(impact,opening) → 707:dom(exit,opening) → 881:write(journal) → 885:dom(reveal,revealed) → 1242:dom(ready,settled,armed)
- one-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 30:dom(anticipation,opening) → 36:write(journal) → 41:dom(reveal,revealed) → 393:dom(ready,settled,armed)
- five-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(wallet) → 21:write(inventory) → 21:write(inventory) → 21:write(wallet) → 21:write(wallet) → 21:write(wallet) → 21:write(wallet) → 25:dom(recover) → 33:dom(anticipation) → 561:dom(impact) → 716:dom(exit) → 883:write(journal) → 887:dom(result) → 1242:dom(result,armed)
- five-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 20:write(wallet) → 20:write(inventory) → 20:write(inventory) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 23:dom(recover) → 30:dom(anticipation) → 37:write(journal) → 41:dom(result) → 388:dom(result,armed)
- one-item-normal: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 20:write(fair) → 21:write(wallet) → 21:write(inventory) → 21:write(wallet) → 27:dom(recover) → 35:dom(anticipation,opening) → 565:dom(impact,opening) → 716:dom(exit,opening) → 883:write(journal) → 889:dom(reveal,revealed) → 1247:dom(ready,settled,armed)
- one-short: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 29:dom(anticipation,opening) → 259:dom(impact,opening) → 365:dom(exit,opening) → 494:write(journal) → 498:dom(reveal,revealed) → 849:dom(ready,settled,armed)
- one-skip: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 29:dom(anticipation,opening) → 216:pointerdown(skip) → 216:click(skip) → 221:write(journal) → 224:dom(reveal,revealed) → 577:dom(ready,settled,armed)
- one-escape: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 29:dom(anticipation,opening) → 201:write(journal) → 204:dom(reveal,revealed) → 565:dom(ready,settled,armed)
- one-slow4x: 0:pointerdown(open-primary) → 6:click(open-primary) → 31:dom(busy) → 42:write(wallet) → 42:write(inventory) → 42:write(fair) → 63:write(fair) → 66:write(wallet) → 68:write(inventory) → 69:write(inventory) → 69:write(wallet) → 70:write(wallet) → 70:write(wallet) → 70:write(wallet) → 94:dom(recover) → 150:dom(anticipation,opening) → 702:dom(impact,opening) → 862:dom(exit,opening) → 1025:dom(reveal,revealed) → 1041:write(journal) → 1403:dom(ready,settled,armed)
- tone-below: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 20:write(fair) → 21:write(wallet) → 21:write(inventory) → 21:write(wallet) → 27:dom(recover) → 35:dom(anticipation,opening) → 567:dom(impact,opening) → 716:dom(exit,opening) → 882:write(journal) → 888:dom(reveal,revealed) → 1247:dom(ready,settled,armed)
- tone-above: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 15:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(wallet) → 22:write(inventory) → 22:write(wallet) → 27:dom(recover) → 36:dom(anticipation,opening) → 567:dom(impact,opening) → 716:dom(exit,opening) → 884:write(journal) → 890:dom(reveal,revealed) → 1238:dom(ready,settled,armed)
- tone-high: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(wallet) → 21:write(inventory) → 21:write(wallet) → 27:dom(recover) → 36:dom(anticipation,opening) → 567:dom(impact,opening) → 714:dom(exit,opening) → 884:write(journal) → 890:dom(reveal,revealed) → 1239:dom(ready,settled,armed)
- tone-top: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 20:write(fair) → 20:write(wallet) → 21:write(inventory) → 21:write(wallet) → 27:dom(recover) → 35:dom(anticipation,opening) → 565:dom(impact,opening) → 716:dom(exit,opening) → 883:write(journal) → 889:dom(reveal,revealed) → 1243:dom(ready,settled,armed)
- tone-cash-above: 0:pointerdown(open-primary) → 1:click(open-primary) → 21:dom(busy) → 22:write(wallet) → 22:write(inventory) → 22:write(fair) → 25:write(fair) → 26:write(wallet) → 26:write(inventory) → 26:write(inventory) → 26:write(wallet) → 26:write(wallet) → 26:write(wallet) → 26:write(wallet) → 30:dom(recover) → 37:dom(anticipation,opening) → 566:dom(impact,opening) → 714:dom(exit,opening) → 892:write(journal) → 896:dom(reveal,revealed) → 1248:dom(ready,settled,armed)
- tone-cash-top: 0:pointerdown(open-primary) → 1:click(open-primary) → 22:dom(busy) → 24:write(wallet) → 24:write(inventory) → 24:write(fair) → 27:write(fair) → 27:write(wallet) → 27:write(inventory) → 27:write(wallet) → 28:write(wallet) → 32:dom(recover) → 41:dom(anticipation,opening) → 565:dom(impact,opening) → 714:dom(exit,opening) → 886:write(journal) → 891:dom(reveal,revealed) → 1239:dom(ready,settled,armed)
- ten-low: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 21:write(wallet) → 22:write(inventory) → 22:write(wallet) → 29:dom(recover) → 39:dom(anticipation) → 566:dom(impact) → 715:dom(exit) → 899:write(journal) → 906:dom(result) → 1265:dom(result,armed)
- ten-top: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 21:write(wallet) → 21:write(inventory) → 22:write(wallet) → 28:dom(recover) → 39:dom(anticipation) → 566:dom(impact) → 716:dom(exit) → 889:write(journal) → 896:dom(result) → 1250:dom(result,armed)

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
