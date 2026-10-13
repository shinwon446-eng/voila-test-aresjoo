# 개봉 연출 측정: before-local

주소: http://127.0.0.1:4183/voila-test-aresjoo
시작: 2026-10-12T22:47:09.473Z
조건: ko, 폭 390, 경우마다 3번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-normal | 3/3 | 29 (28~29) | 531 (524~534) | 154 (145~154) | 175 (173~179) | 351 (348~356) | 886 (883~886) | 1237 (1231~1242) | true, true, true |
| one-reduced | 3/3 | 30 (29~32) | 없음 | 없음 | 없음 | 354 (352~356) | 42 (41~43) | 397 (393~398) | true, true, true |
| five-normal | 3/3 | 31 (31~31) | 533 (531~534) | 149 (141~152) | 174 (174~181) | 355 (354~356) | 887 (887~888) | 1243 (1241~1243) | true, true, true |
| five-reduced | 3/3 | 30 (30~31) | 없음 | 없음 | 없음 | 348 (347~357) | 42 (41~44) | 391 (390~398) | true, true, true |
| one-item-normal | 3/3 | 36 (35~38) | 530 (527~531) | 150 (149~150) | 174 (174~179) | 349 (348~359) | 890 (889~894) | 1243 (1238~1248) | true, true, true |
| one-short | 3/3 | 30 (29~32) | 231 (228~232) | 111 (104~113) | 126 (121~127) | 352 (351~356) | 496 (491~497) | 848 (847~848) | true, true, true |
| one-skip | 3/3 | 30 (29~30) | 없음 | 없음 | 없음 | 352 (349~358) | 227 (224~229) | 581 (576~582) | true, true, true |
| one-escape | 3/3 | 29 (29~30) | 없음 | 없음 | 없음 | 353 (349~362) | 202 (199~206) | 559 (548~564) | true, true, true |
| one-slow4x | 3/3 | 140 (134~153) | 560 (556~560) | 148 (143~148) | 171 (171~174) | 382 (378~387) | 1015 (1011~1032) | 1398 (1397~1410) | true, true, true |
| tone-below | 3/3 | 35 (35~36) | 530 (529~531) | 149 (149~151) | 174 (173~175) | 347 (345~355) | 889 (888~890) | 1237 (1233~1244) | true, true, true |
| tone-above | 3/3 | 36 (35~36) | 531 (531~532) | 149 (147~149) | 175 (172~175) | 350 (345~356) | 889 (888~891) | 1241 (1233~1245) | true, true, true |
| tone-high | 3/3 | 35 (34~35) | 530 (529~532) | 149 (149~151) | 174 (173~175) | 353 (349~359) | 888 (888~890) | 1243 (1237~1247) | true, true, true |
| tone-top | 3/3 | 35 (35~36) | 531 (531~532) | 149 (142~150) | 173 (173~181) | 355 (354~358) | 889 (889~890) | 1244 (1244~1247) | true, true, true |
| tone-cash-above | 3/3 | 41 (40~50) | 525 (524~532) | 149 (143~149) | 183 (179~185) | 351 (349~356) | 899 (897~904) | 1248 (1248~1260) | true, true, true |
| tone-cash-top | 3/3 | 47 (42~52) | 530 (529~530) | 149 (148~158) | 174 (170~180) | 354 (350~355) | 905 (899~905) | 1259 (1249~1260) | true, true, true |
| ten-low | 3/3 | 39 (38~39) | 527 (526~528) | 150 (149~150) | 191 (187~192) | 352 (348~360) | 907 (902~907) | 1259 (1250~1267) | true, true, true |
| ten-top | 3/3 | 38 (38~39) | 528 (526~528) | 150 (150~151) | 180 (180~190) | 348 (348~355) | 896 (896~906) | 1244 (1244~1261) | true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 17:write(fair) → 17:write(wallet) → 17:write(inventory) → 17:write(inventory) → 17:write(wallet) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 21:dom(recover) → 28:dom(anticipation,opening) → 559:dom(impact,opening) → 713:dom(exit,opening) → 881:write(journal) → 886:dom(reveal,revealed) → 1242:dom(ready,settled,armed)
- one-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 29:dom(anticipation,opening) → 37:write(journal) → 41:dom(reveal,revealed) → 393:dom(ready,settled,armed)
- five-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 16:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(wallet) → 19:write(inventory) → 20:write(inventory) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 24:dom(recover) → 31:dom(anticipation) → 562:dom(impact) → 714:dom(exit) → 883:write(journal) → 888:dom(result) → 1243:dom(result,armed)
- five-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(wallet) → 20:write(inventory) → 20:write(inventory) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 20:write(wallet) → 24:dom(recover) → 30:dom(anticipation) → 37:write(journal) → 41:dom(result) → 398:dom(result,armed)
- one-item-normal: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(wallet) → 21:write(inventory) → 21:write(wallet) → 27:dom(recover) → 35:dom(anticipation,opening) → 566:dom(impact,opening) → 715:dom(exit,opening) → 883:write(journal) → 889:dom(reveal,revealed) → 1248:dom(ready,settled,armed)
- one-short: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 24:dom(recover) → 32:dom(anticipation,opening) → 264:dom(impact,opening) → 375:dom(exit,opening) → 491:write(journal) → 496:dom(reveal,revealed) → 848:dom(ready,settled,armed)
- one-skip: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 30:dom(anticipation,opening) → 217:pointerdown(skip) → 218:click(skip) → 224:write(journal) → 227:dom(reveal,revealed) → 576:dom(ready,settled,armed)
- one-escape: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 29:dom(anticipation,opening) → 199:write(journal) → 202:dom(reveal,revealed) → 564:dom(ready,settled,armed)
- one-slow4x: 0:pointerdown(open-primary) → 4:click(open-primary) → 28:dom(busy) → 38:write(wallet) → 38:write(inventory) → 38:write(fair) → 60:write(fair) → 62:write(wallet) → 64:write(inventory) → 65:write(inventory) → 66:write(wallet) → 66:write(wallet) → 66:write(wallet) → 67:write(wallet) → 94:dom(recover) → 153:dom(anticipation,opening) → 713:dom(impact,opening) → 861:dom(exit,opening) → 1032:dom(reveal,revealed) → 1046:write(journal) → 1410:dom(ready,settled,armed)
- tone-below: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 22:write(wallet) → 22:write(inventory) → 22:write(wallet) → 27:dom(recover) → 36:dom(anticipation,opening) → 566:dom(impact,opening) → 715:dom(exit,opening) → 883:write(journal) → 890:dom(reveal,revealed) → 1237:dom(ready,settled,armed)
- tone-above: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 22:write(wallet) → 22:write(inventory) → 22:write(wallet) → 27:dom(recover) → 36:dom(anticipation,opening) → 567:dom(impact,opening) → 716:dom(exit,opening) → 882:write(journal) → 888:dom(reveal,revealed) → 1233:dom(ready,settled,armed)
- tone-high: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 20:write(fair) → 20:write(wallet) → 20:write(inventory) → 21:write(wallet) → 26:dom(recover) → 34:dom(anticipation,opening) → 566:dom(impact,opening) → 715:dom(exit,opening) → 882:write(journal) → 888:dom(reveal,revealed) → 1247:dom(ready,settled,armed)
- tone-top: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 20:write(fair) → 21:write(wallet) → 21:write(inventory) → 21:write(wallet) → 27:dom(recover) → 35:dom(anticipation,opening) → 566:dom(impact,opening) → 716:dom(exit,opening) → 883:write(journal) → 889:dom(reveal,revealed) → 1244:dom(ready,settled,armed)
- tone-cash-above: 0:pointerdown(open-primary) → 1:click(open-primary) → 21:dom(busy) → 23:write(wallet) → 23:write(inventory) → 23:write(fair) → 26:write(fair) → 27:write(wallet) → 27:write(inventory) → 27:write(inventory) → 27:write(wallet) → 28:write(wallet) → 28:write(wallet) → 28:write(wallet) → 32:dom(recover) → 40:dom(anticipation,opening) → 565:dom(impact,opening) → 714:dom(exit,opening) → 894:write(journal) → 899:dom(reveal,revealed) → 1248:dom(ready,settled,armed)
- tone-cash-top: 0:pointerdown(open-primary) → 1:click(open-primary) → 28:dom(busy) → 30:write(wallet) → 30:write(inventory) → 30:write(fair) → 33:write(fair) → 34:write(wallet) → 34:write(inventory) → 34:write(wallet) → 34:write(wallet) → 38:dom(recover) → 47:dom(anticipation,opening) → 577:dom(impact,opening) → 725:dom(exit,opening) → 899:write(journal) → 905:dom(reveal,revealed) → 1259:dom(ready,settled,armed)
- ten-low: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 22:write(wallet) → 22:write(inventory) → 22:write(wallet) → 28:dom(recover) → 39:dom(anticipation) → 566:dom(impact) → 716:dom(exit) → 900:write(journal) → 907:dom(result) → 1267:dom(result,armed)
- ten-top: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 15:write(wallet) → 16:write(inventory) → 16:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 21:write(wallet) → 21:write(inventory) → 22:write(wallet) → 28:dom(recover) → 38:dom(anticipation) → 566:dom(impact) → 716:dom(exit) → 890:write(journal) → 896:dom(result) → 1244:dom(result,armed)

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
