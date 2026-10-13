# 개봉 연출 측정: before-local

주소: http://127.0.0.1:4183/voila-test-aresjoo
시작: 2026-10-12T20:42:58.307Z
조건: ko, 폭 390, 경우마다 3번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-normal | 3/3 | 30 (28~30) | 534 (527~535) | 150 (144~155) | 174 (172~179) | 356 (350~361) | 886 (886~886) | 1242 (1236~1247) | true, true, true |
| one-reduced | 3/3 | 29 (29~29) | 없음 | 없음 | 없음 | 353 (348~358) | 40 (40~40) | 393 (388~398) | true, true, true |
| five-normal | 3/3 | 30 (29~30) | 528 (523~529) | 152 (146~162) | 171 (168~183) | 352 (349~360) | 883 (881~887) | 1233 (1232~1247) | true, true, true |
| five-reduced | 3/3 | 30 (28~30) | 없음 | 없음 | 없음 | 353 (347~353) | 40 (39~42) | 392 (387~395) | true, true, true |
| one-item-normal | 3/3 | 36 (35~36) | 529 (528~530) | 150 (150~152) | 173 (172~174) | 353 (345~361) | 888 (888~889) | 1242 (1233~1249) | true, true, true |
| one-short | 3/3 | 29 (28~29) | 231 (225~232) | 104 (104~112) | 127 (121~133) | 351 (350~362) | 492 (486~497) | 847 (843~848) | true, true, true |
| one-skip | 3/3 | 29 (29~29) | 없음 | 없음 | 없음 | 357 (355~357) | 225 (224~241) | 582 (581~596) | true, true, true |
| one-escape | 3/3 | 29 (29~29) | 없음 | 없음 | 없음 | 349 (348~359) | 200 (199~200) | 548 (548~559) | true, true, true |
| one-slow4x | 3/3 | 131 (130~162) | 550 (548~551) | 147 (147~148) | 173 (169~183) | 384 (380~388) | 1009 (1000~1030) | 1397 (1380~1414) | true, true, true |
| tone-below | 3/3 | 35 (35~36) | 531 (530~532) | 150 (149~150) | 173 (173~174) | 349 (348~354) | 889 (889~890) | 1238 (1238~1243) | true, true, true |
| tone-above | 3/3 | 35 (35~36) | 531 (531~532) | 149 (147~149) | 175 (174~175) | 353 (348~354) | 890 (889~890) | 1243 (1238~1243) | true, true, true |
| tone-high | 3/3 | 35 (35~36) | 529 (528~531) | 147 (146~149) | 178 (176~180) | 349 (349~353) | 890 (890~890) | 1239 (1239~1243) | true, true, true |
| tone-top | 3/3 | 35 (35~35) | 532 (532~532) | 149 (149~149) | 174 (174~174) | 357 (353~360) | 890 (890~890) | 1247 (1243~1250) | true, true, true |
| tone-cash-above | 3/3 | 52 (40~53) | 528 (525~530) | 149 (149~150) | 173 (172~177) | 353 (350~355) | 903 (891~904) | 1256 (1241~1259) | true, true, true |
| tone-cash-top | 3/3 | 39 (38~41) | 526 (524~526) | 150 (149~150) | 187 (174~189) | 354 (348~355) | 901 (888~904) | 1249 (1242~1259) | true, true, true |
| ten-low | 3/3 | 39 (39~40) | 527 (526~527) | 150 (149~150) | 181 (177~192) | 354 (347~357) | 897 (892~908) | 1246 (1244~1265) | true, true, true |
| ten-top | 3/3 | 40 (38~42) | 526 (525~529) | 152 (150~155) | 180 (171~185) | 350 (348~353) | 897 (896~900) | 1250 (1244~1250) | true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 14:write(wallet) → 14:write(inventory) → 15:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 30:dom(anticipation,opening) → 557:dom(impact,opening) → 712:dom(exit,opening) → 881:write(journal) → 886:dom(reveal,revealed) → 1247:dom(ready,settled,armed)
- one-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 29:dom(anticipation,opening) → 35:write(journal) → 40:dom(reveal,revealed) → 398:dom(ready,settled,armed)
- five-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(fair) → 18:write(fair) → 18:write(fair) → 19:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 23:dom(recover) → 29:dom(anticipation) → 558:dom(impact) → 704:dom(exit) → 883:write(journal) → 887:dom(result) → 1247:dom(result,armed)
- five-reduced: 0:pointerdown(open-primary) → 0:click(open-primary) → 4:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 20:write(wallet) → 20:write(inventory) → 20:write(inventory) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 23:dom(recover) → 30:dom(anticipation) → 36:write(journal) → 40:dom(result) → 387:dom(result,armed)
- one-item-normal: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 15:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(wallet) → 21:write(inventory) → 21:write(wallet) → 27:dom(recover) → 36:dom(anticipation,opening) → 565:dom(impact,opening) → 715:dom(exit,opening) → 883:write(journal) → 889:dom(reveal,revealed) → 1242:dom(ready,settled,armed)
- one-short: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(wallet) → 18:write(inventory) → 18:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 28:dom(anticipation,opening) → 253:dom(impact,opening) → 365:dom(exit,opening) → 482:write(journal) → 486:dom(reveal,revealed) → 848:dom(ready,settled,armed)
- one-skip: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 29:dom(anticipation,opening) → 215:pointerdown(skip) → 215:click(skip) → 221:write(journal) → 224:dom(reveal,revealed) → 581:dom(ready,settled,armed)
- one-escape: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 17:write(fair) → 18:write(wallet) → 18:write(inventory) → 18:write(inventory) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 22:dom(recover) → 29:dom(anticipation,opening) → 197:write(journal) → 200:dom(reveal,revealed) → 559:dom(ready,settled,armed)
- one-slow4x: 0:pointerdown(open-primary) → 4:click(open-primary) → 26:dom(busy) → 36:write(wallet) → 36:write(inventory) → 36:write(fair) → 55:write(fair) → 58:write(wallet) → 58:write(inventory) → 59:write(inventory) → 59:write(wallet) → 60:write(wallet) → 60:write(wallet) → 60:write(wallet) → 82:dom(recover) → 130:dom(anticipation,opening) → 680:dom(impact,opening) → 827:dom(exit,opening) → 1000:dom(reveal,revealed) → 1013:write(journal) → 1380:dom(ready,settled,armed)
- tone-below: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(wallet) → 21:write(inventory) → 22:write(wallet) → 27:dom(recover) → 35:dom(anticipation,opening) → 566:dom(impact,opening) → 716:dom(exit,opening) → 883:write(journal) → 889:dom(reveal,revealed) → 1238:dom(ready,settled,armed)
- tone-above: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(wallet) → 21:write(inventory) → 22:write(wallet) → 27:dom(recover) → 35:dom(anticipation,opening) → 566:dom(impact,opening) → 715:dom(exit,opening) → 884:write(journal) → 890:dom(reveal,revealed) → 1243:dom(ready,settled,armed)
- tone-high: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(wallet) → 22:write(inventory) → 22:write(wallet) → 27:dom(recover) → 36:dom(anticipation,opening) → 565:dom(impact,opening) → 714:dom(exit,opening) → 883:write(journal) → 890:dom(reveal,revealed) → 1243:dom(ready,settled,armed)
- tone-top: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(wallet) → 21:write(inventory) → 22:write(wallet) → 27:dom(recover) → 35:dom(anticipation,opening) → 567:dom(impact,opening) → 716:dom(exit,opening) → 884:write(journal) → 890:dom(reveal,revealed) → 1247:dom(ready,settled,armed)
- tone-cash-above: 0:pointerdown(open-primary) → 1:click(open-primary) → 37:dom(busy) → 38:write(wallet) → 38:write(inventory) → 38:write(fair) → 41:write(fair) → 42:write(wallet) → 42:write(inventory) → 42:write(inventory) → 42:write(wallet) → 42:write(wallet) → 42:write(wallet) → 42:write(wallet) → 46:dom(recover) → 53:dom(anticipation,opening) → 581:dom(impact,opening) → 731:dom(exit,opening) → 898:write(journal) → 903:dom(reveal,revealed) → 1256:dom(ready,settled,armed)
- tone-cash-top: 0:pointerdown(open-primary) → 1:click(open-primary) → 20:dom(busy) → 22:write(wallet) → 22:write(inventory) → 22:write(fair) → 25:write(fair) → 26:write(wallet) → 26:write(inventory) → 26:write(wallet) → 26:write(wallet) → 30:dom(recover) → 38:dom(anticipation,opening) → 564:dom(impact,opening) → 714:dom(exit,opening) → 882:write(journal) → 888:dom(reveal,revealed) → 1242:dom(ready,settled,armed)
- ten-low: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 17:write(wallet) → 17:write(inventory) → 17:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 22:write(wallet) → 23:write(inventory) → 23:write(wallet) → 29:dom(recover) → 40:dom(anticipation) → 566:dom(impact) → 716:dom(exit) → 901:write(journal) → 908:dom(result) → 1265:dom(result,armed)
- ten-top: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 20:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(wallet) → 22:write(inventory) → 22:write(wallet) → 28:dom(recover) → 38:dom(anticipation) → 564:dom(impact) → 716:dom(exit) → 889:write(journal) → 896:dom(result) → 1244:dom(result,armed)

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
