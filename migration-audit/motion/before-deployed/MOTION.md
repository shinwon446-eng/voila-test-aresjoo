# 개봉 연출 측정: before-deployed

주소: https://shinwon446-eng.github.io/voila-test-aresjoo
시작: 2026-10-12T14:23:54.643Z
조건: ko, 폭 390, 경우마다 3번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-normal | 3/3 | 29 (28~33) | 530 (527~531) | 153 (153~153) | 174 (174~182) | 352 (351~362) | 886 (886~895) | 1247 (1237~1248) | true, true, true |
| one-reduced | 3/3 | 29 (29~31) | 없음 | 없음 | 없음 | 352 (348~354) | 41 (41~43) | 393 (389~397) | true, true, true |
| five-normal | 3/3 | 31 (30~33) | 527 (526~532) | 152 (149~156) | 175 (173~180) | 360 (350~362) | 888 (887~889) | 1249 (1238~1249) | true, true, true |
| five-reduced | 3/3 | 30 (29~31) | 없음 | 없음 | 없음 | 349 (348~351) | 42 (41~43) | 390 (390~394) | true, true, true |
| one-item-normal | 3/3 | 36 (35~36) | 530 (530~531) | 150 (149~150) | 174 (173~174) | 359 (356~360) | 889 (889~890) | 1248 (1246~1249) | true, true, true |
| one-short | 3/3 | 30 (29~35) | 231 (229~235) | 105 (99~113) | 132 (125~134) | 352 (350~356) | 498 (497~502) | 849 (848~858) | true, true, true |
| one-skip | 3/3 | 30 (29~30) | 없음 | 없음 | 없음 | 355 (351~357) | 225 (224~225) | 580 (576~581) | true, true, true |
| one-escape | 3/3 | 29 (29~30) | 없음 | 없음 | 없음 | 351 (350~354) | 198 (195~207) | 549 (549~557) | true, true, true |
| one-slow4x | 3/3 | 142 (134~170) | 562 (546~575) | 151 (139~151) | 172 (163~186) | 382 (373~383) | 1017 (1015~1059) | 1400 (1397~1432) | true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 17:write(fair) → 18:write(wallet) → 18:write(inventory) → 18:write(inventory) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 18:write(wallet) → 22:dom(recover) → 29:dom(anticipation,opening) → 559:dom(impact,opening) → 712:dom(exit,opening) → 881:write(journal) → 886:dom(reveal,revealed) → 1248:dom(ready,settled,armed)
- one-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 29:dom(anticipation,opening) → 36:write(journal) → 41:dom(reveal,revealed) → 389:dom(ready,settled,armed)
- five-normal: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 19:write(fair) → 20:write(wallet) → 20:write(inventory) → 21:write(inventory) → 21:write(wallet) → 21:write(wallet) → 21:write(wallet) → 21:write(wallet) → 25:dom(recover) → 33:dom(anticipation) → 565:dom(impact) → 714:dom(exit) → 882:write(journal) → 887:dom(result) → 1249:dom(result,armed)
- five-reduced: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(fair) → 18:write(fair) → 18:write(fair) → 18:write(fair) → 19:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 29:dom(anticipation) → 36:write(journal) → 41:dom(result) → 390:dom(result,armed)
- one-item-normal: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(wallet) → 22:write(inventory) → 22:write(wallet) → 27:dom(recover) → 36:dom(anticipation,opening) → 566:dom(impact,opening) → 715:dom(exit,opening) → 883:write(journal) → 889:dom(reveal,revealed) → 1248:dom(ready,settled,armed)
- one-short: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(wallet) → 18:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 22:dom(recover) → 29:dom(anticipation,opening) → 260:dom(impact,opening) → 365:dom(exit,opening) → 492:write(journal) → 497:dom(reveal,revealed) → 849:dom(ready,settled,armed)
- one-skip: 0:pointerdown(open-primary) → 1:click(open-primary) → 5:dom(busy) → 14:write(wallet) → 14:write(inventory) → 14:write(fair) → 18:write(fair) → 18:write(wallet) → 19:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 30:dom(anticipation,opening) → 215:pointerdown(skip) → 215:click(skip) → 221:write(journal) → 224:dom(reveal,revealed) → 581:dom(ready,settled,armed)
- one-escape: 0:pointerdown(open-primary) → 1:click(open-primary) → 4:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 18:write(fair) → 18:write(wallet) → 18:write(inventory) → 19:write(inventory) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 19:write(wallet) → 23:dom(recover) → 29:dom(anticipation,opening) → 204:write(journal) → 207:dom(reveal,revealed) → 557:dom(ready,settled,armed)
- one-slow4x: 0:pointerdown(open-primary) → 4:click(open-primary) → 31:dom(busy) → 40:write(wallet) → 40:write(inventory) → 40:write(fair) → 59:write(fair) → 62:write(wallet) → 63:write(inventory) → 64:write(inventory) → 64:write(wallet) → 65:write(wallet) → 65:write(wallet) → 65:write(wallet) → 91:dom(recover) → 142:dom(anticipation,opening) → 704:dom(impact,opening) → 843:dom(exit,opening) → 1015:dom(reveal,revealed) → 1027:write(journal) → 1397:dom(ready,settled,armed)

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
