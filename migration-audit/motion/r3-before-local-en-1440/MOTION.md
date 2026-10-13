# 개봉 연출 측정: before-local-en-1440

주소: http://127.0.0.1:4183/voila-test-aresjoo
시작: 2026-10-12T22:58:15.192Z
조건: en, 폭 1440, 경우마다 3번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-normal | 3/3 | 28 (27~29) | 530 (525~534) | 150 (145~155) | 173 (173~178) | 350 (350~358) | 881 (881~885) | 1231 (1231~1243) | true, true, true |
| one-reduced | 3/3 | 29 (29~29) | 없음 | 없음 | 없음 | 355 (355~356) | 40 (40~42) | 396 (395~397) | true, true, true |
| five-normal | 3/3 | 29 (29~29) | 530 (530~534) | 151 (145~155) | 170 (167~179) | 352 (351~361) | 881 (880~887) | 1232 (1232~1248) | true, true, true |
| five-reduced | 3/3 | 30 (29~30) | 없음 | 없음 | 없음 | 348 (347~354) | 42 (41~44) | 389 (389~398) | true, true, true |
| one-item-normal | 3/3 | 35 (35~35) | 531 (530~531) | 150 (149~151) | 174 (174~175) | 350 (347~360) | 890 (890~890) | 1240 (1237~1250) | true, true, true |
| one-short | 3/3 | 29 (28~29) | 225 (224~234) | 111 (101~112) | 136 (133~137) | 347 (347~350) | 500 (498~501) | 848 (847~848) | true, true, true |
| one-skip | 3/3 | 29 (28~29) | 없음 | 없음 | 없음 | 351 (351~356) | 241 (225~241) | 592 (581~592) | true, true, true |
| one-escape | 3/3 | 29 (28~29) | 없음 | 없음 | 없음 | 354 (349~360) | 204 (194~204) | 553 (548~564) | true, true, true |
| one-slow4x | 3/3 | 133 (125~154) | 548 (548~556) | 148 (148~148) | 173 (171~175) | 365 (362~384) | 1002 (1000~1025) | 1365 (1364~1409) | true, true, true |
| tone-below | 3/3 | 35 (35~35) | 531 (529~532) | 149 (149~149) | 174 (172~176) | 349 (348~353) | 889 (888~889) | 1237 (1237~1242) | true, true, true |
| tone-above | 3/3 | 36 (35~36) | 531 (531~532) | 149 (148~149) | 173 (173~174) | 359 (345~361) | 889 (888~890) | 1249 (1233~1250) | true, true, true |
| tone-high | 3/3 | 35 (35~35) | 530 (525~532) | 151 (148~156) | 174 (174~175) | 357 (355~359) | 890 (890~890) | 1247 (1245~1249) | true, true, true |
| tone-top | 3/3 | 36 (35~36) | 531 (530~531) | 149 (148~150) | 175 (174~175) | 353 (350~355) | 890 (890~890) | 1243 (1240~1245) | true, true, true |
| tone-cash-above | 3/3 | 39 (39~42) | 527 (526~531) | 149 (147~152) | 181 (177~185) | 353 (351~354) | 897 (896~902) | 1249 (1248~1256) | true, true, true |
| tone-cash-top | 3/3 | 42 (42~60) | 528 (527~529) | 154 (150~155) | 172 (171~175) | 352 (350~356) | 897 (892~916) | 1249 (1248~1266) | true, true, true |
| ten-low | 3/3 | 38 (38~39) | 528 (527~528) | 149 (149~150) | 191 (186~192) | 348 (346~349) | 907 (901~907) | 1255 (1247~1256) | true, true, true |
| ten-top | 3/3 | 38 (38~39) | 527 (526~528) | 150 (149~151) | 185 (176~191) | 351 (349~359) | 900 (892~906) | 1249 (1243~1265) | true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 13:write(wallet) → 13:write(inventory) → 13:write(fair) → 16:write(fair) → 17:write(wallet) → 17:write(inventory) → 17:write(inventory) → 17:write(wallet) → 17:write(wallet) → 17:write(wallet) → 17:write(wallet) → 21:dom(recover) → 27:dom(anticipation,opening) → 557:dom(impact,opening) → 707:dom(exit,opening) → 880:write(journal) → 885:dom(reveal,revealed) → 1243:dom(ready,settled,armed)
- one-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 18:write(fair) → 18:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 29:dom(anticipation,opening) → 38:write(journal) → 42:dom(reveal,revealed) → 397:dom(ready,settled,armed)
- five-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(fair) → 18:write(fair) → 18:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 23:dom(recover) → 29:dom(anticipation) → 559:dom(impact) → 710:dom(exit) → 876:write(journal) → 880:dom(result) → 1232:dom(result,armed)
- five-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(fair) → 18:write(fair) → 18:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 20:write(inventory) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 23:dom(recover) → 29:dom(anticipation) → 37:write(journal) → 41:dom(result) → 389:dom(result,armed)
- one-item-normal: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 20:write(fair) → 21:write(wallet) → 21:write(inventory) → 21:write(wallet) → 26:dom(recover) → 35:dom(anticipation,opening) → 566:dom(impact,opening) → 716:dom(exit,opening) → 883:write(journal) → 890:dom(reveal,revealed) → 1250:dom(ready,settled,armed)
- one-short: 0:pointerdown(open-primary) → 1:click(open-primary) → 6:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(wallet) → 18:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 29:dom(anticipation,opening) → 263:dom(impact,opening) → 364:dom(exit,opening) → 497:write(journal) → 501:dom(reveal,revealed) → 848:dom(ready,settled,armed)
- one-skip: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 29:dom(anticipation,opening) → 233:pointerdown(skip) → 233:click(skip) → 239:write(journal) → 241:dom(reveal,revealed) → 592:dom(ready,settled,armed)
- one-escape: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(wallet) → 18:write(inventory) → 18:write(inventory) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 19:write(wallet) → 22:dom(recover) → 29:dom(anticipation,opening) → 201:write(journal) → 204:dom(reveal,revealed) → 553:dom(ready,settled,armed)
- one-slow4x: 0:pointerdown(open-primary) → 4:click(open-primary) → 25:dom(busy) → 33:write(wallet) → 33:write(inventory) → 33:write(fair) → 51:write(fair) → 53:write(wallet) → 55:write(inventory) → 55:write(inventory) → 56:write(wallet) → 56:write(wallet) → 56:write(wallet) → 57:write(wallet) → 76:dom(recover) → 125:dom(anticipation,opening) → 681:dom(impact,opening) → 829:dom(exit,opening) → 1000:dom(reveal,revealed) → 1001:write(journal) → 1365:dom(ready,settled,armed)
- tone-below: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 20:write(fair) → 20:write(wallet) → 21:write(inventory) → 21:write(wallet) → 26:dom(recover) → 35:dom(anticipation,opening) → 566:dom(impact,opening) → 715:dom(exit,opening) → 883:write(journal) → 889:dom(reveal,revealed) → 1242:dom(ready,settled,armed)
- tone-above: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(wallet) → 21:write(inventory) → 21:write(wallet) → 27:dom(recover) → 35:dom(anticipation,opening) → 567:dom(impact,opening) → 716:dom(exit,opening) → 884:write(journal) → 890:dom(reveal,revealed) → 1249:dom(ready,settled,armed)
- tone-high: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 20:write(fair) → 21:write(wallet) → 21:write(inventory) → 21:write(wallet) → 27:dom(recover) → 35:dom(anticipation,opening) → 567:dom(impact,opening) → 715:dom(exit,opening) → 883:write(journal) → 890:dom(reveal,revealed) → 1247:dom(ready,settled,armed)
- tone-top: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(wallet) → 21:write(inventory) → 22:write(wallet) → 27:dom(recover) → 36:dom(anticipation,opening) → 566:dom(impact,opening) → 716:dom(exit,opening) → 883:write(journal) → 890:dom(reveal,revealed) → 1243:dom(ready,settled,armed)
- tone-cash-above: 0:pointerdown(open-primary) → 1:click(open-primary) → 23:dom(busy) → 24:write(wallet) → 24:write(inventory) → 24:write(fair) → 28:write(fair) → 29:write(wallet) → 29:write(inventory) → 30:write(inventory) → 30:write(wallet) → 30:write(wallet) → 30:write(wallet) → 30:write(wallet) → 34:dom(recover) → 42:dom(anticipation,opening) → 573:dom(impact,opening) → 725:dom(exit,opening) → 897:write(journal) → 902:dom(reveal,revealed) → 1256:dom(ready,settled,armed)
- tone-cash-top: 0:pointerdown(open-primary) → 1:click(open-primary) → 24:dom(busy) → 26:write(wallet) → 26:write(inventory) → 26:write(fair) → 29:write(fair) → 29:write(wallet) → 29:write(inventory) → 29:write(wallet) → 30:write(wallet) → 33:dom(recover) → 42:dom(anticipation,opening) → 570:dom(impact,opening) → 725:dom(exit,opening) → 892:write(journal) → 897:dom(reveal,revealed) → 1249:dom(ready,settled,armed)
- ten-low: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 22:write(wallet) → 22:write(inventory) → 22:write(wallet) → 29:dom(recover) → 39:dom(anticipation) → 566:dom(impact) → 716:dom(exit) → 900:write(journal) → 907:dom(result) → 1255:dom(result,armed)
- ten-top: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 21:write(wallet) → 22:write(inventory) → 22:write(wallet) → 28:dom(recover) → 38:dom(anticipation) → 566:dom(impact) → 716:dom(exit) → 885:write(journal) → 892:dom(result) → 1243:dom(result,armed)

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
