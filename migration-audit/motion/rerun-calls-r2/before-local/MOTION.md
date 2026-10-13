# 개봉 연출 측정: before-local-calls

주소: http://127.0.0.1:4183/voila-test-aresjoo
시작: 2026-10-12T21:15:07.518Z
조건: ko, 폭 390, 경우마다 3번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-item-normal | 3/3 | 36 (35~36) | 530 (530~531) | 149 (148~150) | 174 (173~175) | 351 (349~354) | 889 (889~889) | 1240 (1238~1243) | true, true, true |
| tone-below | 3/3 | 36 (35~36) | 531 (531~532) | 149 (148~149) | 174 (173~174) | 355 (349~358) | 890 (888~890) | 1245 (1237~1248) | true, true, true |
| tone-top | 3/3 | 36 (35~37) | 529 (528~529) | 151 (150~153) | 173 (172~174) | 349 (345~353) | 889 (888~890) | 1239 (1233~1242) | true, true, true |
| tone-cash-top | 3/3 | 40 (39~52) | 526 (526~530) | 149 (149~150) | 178 (173~184) | 354 (350~356) | 899 (893~904) | 1249 (1247~1260) | true, true, true |
| ten-low | 3/3 | 39 (38~39) | 527 (527~528) | 150 (149~150) | 181 (180~191) | 354 (353~354) | 896 (896~907) | 1250 (1250~1260) | true, true, true |
| ten-top | 3/3 | 39 (38~39) | 527 (527~528) | 150 (149~150) | 182 (180~190) | 346 (344~355) | 898 (895~906) | 1250 (1244~1250) | true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-item-normal: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 15:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(wallet) → 21:write(inventory) → 22:write(wallet) → 27:dom(recover) → 36:dom(anticipation,opening) → 566:dom(impact,opening) → 716:dom(exit,opening) → 882:write(journal) → 889:dom(reveal,revealed) → 1243:dom(ready,settled,armed)
- tone-below: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(wallet) → 21:write(inventory) → 22:write(wallet) → 27:dom(recover) → 36:dom(anticipation,opening) → 567:dom(impact,opening) → 716:dom(exit,opening) → 884:write(journal) → 890:dom(reveal,revealed) → 1248:dom(ready,settled,armed)
- tone-top: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(wallet) → 21:write(inventory) → 21:write(wallet) → 27:dom(recover) → 35:dom(anticipation,opening) → 563:dom(impact,opening) → 716:dom(exit,opening) → 882:write(journal) → 888:dom(reveal,revealed) → 1233:dom(ready,settled,armed)
- tone-cash-top: 0:pointerdown(open-primary) → 1:click(open-primary) → 21:dom(busy) → 23:write(wallet) → 23:write(inventory) → 23:write(fair) → 26:write(fair) → 26:write(wallet) → 27:write(inventory) → 27:write(wallet) → 27:write(wallet) → 31:dom(recover) → 39:dom(anticipation,opening) → 565:dom(impact,opening) → 715:dom(exit,opening) → 887:write(journal) → 893:dom(reveal,revealed) → 1247:dom(ready,settled,armed)
- ten-low: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 15:write(wallet) → 15:write(inventory) → 15:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 20:write(fair) → 21:write(wallet) → 21:write(inventory) → 21:write(wallet) → 28:dom(recover) → 38:dom(anticipation) → 566:dom(impact) → 715:dom(exit) → 889:write(journal) → 896:dom(result) → 1250:dom(result,armed)
- ten-top: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(fair) → 21:write(wallet) → 22:write(inventory) → 22:write(wallet) → 29:dom(recover) → 39:dom(anticipation) → 566:dom(impact) → 716:dom(exit) → 898:write(journal) → 906:dom(result) → 1250:dom(result,armed)

## 끼어들기 뒤의 장부

| 경우 | 단계 | 계정 거래 수 | 계정 상품 수 | nonce | 본 기록 수 | 화면 |
|---|---|---|---|---|---|---|

## 실행하지 않은 것

- 탭을 뒤로 보냈다 돌아옴: headless 브라우저의 한 탭에서는 실제 백그라운드 전환(타이머 늦춤)을 만들 수 없다. 실행하지 않았다
- 소리 재생 실패: 기본 설정은 소리 끔이고, headless 에서는 소리 장치가 없어 실패와 성공을 가를 수 없다. 실행하지 않았다
- 실제 모바일 브라우저: 데스크톱 Chrome 의 모바일 흉내(폭, 배율, 터치)만 쓴다. 실제 기기에서는 실행하지 않았다
