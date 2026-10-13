# 개봉 연출 측정: after-final3

주소: http://127.0.0.1:4189/voila-test-aresjoo
시작: 2026-10-12T22:52:41.637Z
조건: ko, 폭 390, 경우마다 3번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-normal | 3/3 | 29 (28~30) | 529 (529~535) | 150 (150~154) | 170 (166~177) | 353 (352~357) | 885 (877~885) | 1237 (1230~1242) | true, true, true |
| one-reduced | 3/3 | 29 (29~30) | 없음 | 없음 | 없음 | 356 (348~357) | 39 (39~39) | 395 (387~396) | true, true, true |
| five-normal | 3/3 | 31 (30~31) | 535 (534~536) | 148 (144~149) | 171 (171~178) | 352 (348~356) | 886 (885~887) | 1238 (1233~1243) | true, true, true |
| five-reduced | 3/3 | 31 (30~31) | 없음 | 없음 | 없음 | 349 (348~356) | 40 (40~41) | 389 (389~396) | true, true, true |
| one-item-normal | 3/3 | 38 (38~38) | 528 (527~528) | 150 (148~151) | 174 (174~176) | 356 (354~360) | 890 (890~890) | 1246 (1244~1250) | true, true, true |
| one-short | 3/3 | 29 (29~30) | 229 (228~235) | 106 (100~106) | 131 (131~131) | 353 (352~353) | 495 (495~495) | 848 (847~848) | true, true, true |
| one-skip | 3/3 | 30 (30~30) | 없음 | 없음 | 없음 | 351 (349~352) | 225 (225~225) | 576 (574~577) | true, true, true |
| one-escape | 3/3 | 30 (28~31) | 없음 | 없음 | 없음 | 352 (350~355) | 199 (196~203) | 549 (548~558) | true, true, true |
| one-slow4x | 3/3 | 140 (138~147) | 559 (546~561) | 150 (146~161) | 169 (164~173) | 378 (369~382) | 1014 (1009~1031) | 1387 (1383~1413) | true, true, true |
| tone-below | 3/3 | 38 (37~39) | 529 (528~530) | 149 (148~149) | 181 (174~185) | 349 (349~354) | 897 (890~900) | 1246 (1244~1249) | true, true, true |
| tone-above | 3/3 | 39 (38~39) | 527 (526~528) | 149 (149~151) | 185 (179~189) | 347 (345~355) | 901 (895~903) | 1250 (1246~1250) | true, true, true |
| tone-high | 3/3 | 40 (37~41) | 530 (527~536) | 148 (143~149) | 180 (175~185) | 350 (349~353) | 900 (891~900) | 1249 (1244~1250) | true, true, true |
| tone-top | 3/3 | 37 (37~39) | 528 (527~530) | 149 (149~151) | 175 (175~184) | 350 (347~358) | 891 (890~900) | 1249 (1237~1250) | true, true, true |
| tone-cash-above | 3/3 | 42 (42~43) | 534 (528~537) | 150 (149~159) | 166 (164~167) | 352 (351~357) | 893 (892~896) | 1248 (1244~1249) | true, true, true |
| tone-cash-top | 3/3 | 45 (43~49) | 533 (528~533) | 149 (146~149) | 178 (170~180) | 352 (349~357) | 901 (900~902) | 1254 (1249~1258) | true, true, true |
| ten-low | 3/3 | 45 (45~48) | 526 (526~533) | 150 (150~151) | 181 (176~185) | 348 (344~353) | 906 (902~908) | 1250 (1250~1261) | true, true, true |
| ten-top | 3/3 | 45 (42~46) | 530 (526~534) | 149 (145~150) | 175 (174~187) | 348 (345~352) | 899 (896~908) | 1244 (1244~1260) | true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 13:write(wallet) → 13:write(inventory) → 13:write(fair) → 16:write(fair) → 17:write(wallet) → 17:write(inventory) → 17:write(inventory) → 17:write(wallet) → 17:write(wallet) → 17:write(wallet) → 17:write(wallet) → 21:dom(recover) → 28:dom(anticipation,opening) → 557:dom(impact,opening) → 711:dom(exit,opening) → 874:write(journal) → 877:dom(reveal,revealed) → 1230:dom(ready,settled,armed)
- one-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 29:dom(anticipation,opening) → 36:write(journal) → 39:dom(reveal,revealed) → 396:dom(ready,settled,armed)
- five-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 20:write(wallet) → 20:write(inventory) → 20:write(inventory) → 21:write(wallet) → 21:write(wallet) → 21:write(wallet) → 21:write(wallet) → 24:dom(recover) → 31:dom(anticipation) → 566:dom(impact) → 714:dom(exit) → 882:write(journal) → 885:dom(result) → 1233:dom(result,armed)
- five-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 20:write(wallet) → 20:write(inventory) → 20:write(inventory) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 21:write(wallet) → 24:dom(recover) → 31:dom(anticipation) → 37:write(journal) → 40:dom(result) → 396:dom(result,armed)
- one-item-normal: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 22:write(wallet) → 22:write(inventory) → 23:write(wallet) → 29:dom(recover) → 38:dom(anticipation,opening) → 565:dom(impact,opening) → 716:dom(exit,opening) → 883:write(journal) → 890:dom(reveal,revealed) → 1246:dom(ready,settled,armed)
- one-short: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 18:write(fair) → 18:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 29:dom(anticipation,opening) → 264:dom(impact,opening) → 364:dom(exit,opening) → 491:write(journal) → 495:dom(reveal,revealed) → 848:dom(ready,settled,armed)
- one-skip: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 19:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 23:dom(recover) → 30:dom(anticipation,opening) → 216:pointerdown(skip) → 216:click(skip) → 221:write(journal) → 225:dom(reveal,revealed) → 576:dom(ready,settled,armed)
- one-escape: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 17:write(fair) → 18:write(wallet) → 18:write(inventory) → 18:write(inventory) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 19:write(wallet) → 22:dom(recover) → 28:dom(anticipation,opening) → 200:write(journal) → 203:dom(reveal,revealed) → 558:dom(ready,settled,armed)
- one-slow4x: 0:pointerdown(open-primary) → 4:click(open-primary) → 26:dom(busy) → 37:write(wallet) → 37:write(inventory) → 37:write(fair) → 57:write(fair) → 59:write(wallet) → 61:write(inventory) → 61:write(inventory) → 62:write(wallet) → 62:write(wallet) → 62:write(wallet) → 63:write(wallet) → 82:dom(recover) → 138:dom(anticipation,opening) → 684:dom(impact,opening) → 845:dom(exit,opening) → 1009:dom(reveal,revealed) → 1028:write(journal) → 1387:dom(ready,settled,armed)
- tone-below: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 22:write(wallet) → 22:write(inventory) → 22:write(wallet) → 28:dom(recover) → 37:dom(anticipation,opening) → 567:dom(impact,opening) → 716:dom(exit,opening) → 884:write(journal) → 890:dom(reveal,revealed) → 1244:dom(ready,settled,armed)
- tone-above: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 15:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 22:write(wallet) → 23:write(inventory) → 23:write(wallet) → 29:dom(recover) → 39:dom(anticipation,opening) → 565:dom(impact,opening) → 714:dom(exit,opening) → 896:write(journal) → 903:dom(reveal,revealed) → 1250:dom(ready,settled,armed)
- tone-high: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 17:write(wallet) → 17:write(inventory) → 17:write(fair) → 23:write(fair) → 24:write(wallet) → 24:write(inventory) → 24:write(wallet) → 30:dom(recover) → 40:dom(anticipation,opening) → 567:dom(impact,opening) → 715:dom(exit,opening) → 893:write(journal) → 900:dom(reveal,revealed) → 1250:dom(ready,settled,armed)
- tone-top: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 15:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 22:write(wallet) → 22:write(inventory) → 22:write(wallet) → 28:dom(recover) → 37:dom(anticipation,opening) → 564:dom(impact,opening) → 715:dom(exit,opening) → 883:write(journal) → 890:dom(reveal,revealed) → 1237:dom(ready,settled,armed)
- tone-cash-above: 0:pointerdown(open-primary) → 1:click(open-primary) → 21:dom(busy) → 23:write(wallet) → 23:write(inventory) → 23:write(fair) → 27:write(fair) → 27:write(wallet) → 28:write(inventory) → 28:write(inventory) → 28:write(wallet) → 28:write(wallet) → 28:write(wallet) → 28:write(wallet) → 32:dom(recover) → 42:dom(anticipation,opening) → 570:dom(impact,opening) → 729:dom(exit,opening) → 889:write(journal) → 893:dom(reveal,revealed) → 1244:dom(ready,settled,armed)
- tone-cash-top: 0:pointerdown(open-primary) → 1:click(open-primary) → 24:dom(busy) → 26:write(wallet) → 26:write(inventory) → 26:write(fair) → 30:write(fair) → 30:write(wallet) → 30:write(inventory) → 31:write(wallet) → 31:write(wallet) → 35:dom(recover) → 45:dom(anticipation,opening) → 578:dom(impact,opening) → 724:dom(exit,opening) → 898:write(journal) → 902:dom(reveal,revealed) → 1254:dom(ready,settled,armed)
- ten-low: 0:pointerdown(confirm) → 1:click(confirm) → 8:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(wallet) → 23:write(inventory) → 23:write(wallet) → 31:dom(recover) → 45:dom(anticipation) → 571:dom(impact) → 721:dom(exit) → 897:write(journal) → 906:dom(result) → 1250:dom(result,armed)
- ten-top: 0:pointerdown(confirm) → 1:click(confirm) → 8:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 23:write(wallet) → 23:write(inventory) → 24:write(wallet) → 32:dom(recover) → 46:dom(anticipation) → 576:dom(impact) → 725:dom(exit) → 891:write(journal) → 899:dom(result) → 1244:dom(result,armed)

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
