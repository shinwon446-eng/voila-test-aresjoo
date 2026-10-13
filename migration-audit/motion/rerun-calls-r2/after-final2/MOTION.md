# 개봉 연출 측정: after-final2-calls

주소: http://127.0.0.1:4187/voila-test-aresjoo
시작: 2026-10-12T21:16:20.492Z
조건: ko, 폭 390, 경우마다 3번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-item-normal | 3/3 | 38 (38~40) | 527 (526~528) | 150 (149~151) | 185 (175~190) | 348 (344~354) | 901 (890~906) | 1249 (1244~1250) | true, true, true |
| tone-below | 3/3 | 38 (38~39) | 528 (527~529) | 149 (148~149) | 185 (180~185) | 349 (349~354) | 900 (895~900) | 1249 (1249~1249) | true, true, true |
| tone-top | 3/3 | 39 (38~40) | 527 (527~528) | 149 (149~149) | 185 (180~185) | 350 (349~354) | 900 (895~901) | 1250 (1249~1250) | true, true, true |
| tone-cash-top | 3/3 | 42 (41~44) | 529 (524~535) | 149 (148~150) | 181 (165~182) | 352 (351~359) | 897 (890~903) | 1249 (1249~1254) | true, true, true |
| ten-low | 3/3 | 41 (41~44) | 525 (525~527) | 150 (150~155) | 183 (181~187) | 348 (345~350) | 903 (897~909) | 1251 (1247~1254) | true, true, true |
| ten-top | 3/3 | 47 (41~48) | 534 (534~536) | 150 (150~154) | 173 (173~175) | 345 (345~346) | 905 (904~906) | 1250 (1250~1251) | true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-item-normal: 0:pointerdown(confirm) → 1:click(confirm) → 8:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 23:write(wallet) → 23:write(inventory) → 23:write(wallet) → 29:dom(recover) → 40:dom(anticipation,opening) → 566:dom(impact,opening) → 716:dom(exit,opening) → 894:write(journal) → 901:dom(reveal,revealed) → 1249:dom(ready,settled,armed)
- tone-below: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 22:write(wallet) → 22:write(inventory) → 23:write(wallet) → 29:dom(recover) → 38:dom(anticipation,opening) → 566:dom(impact,opening) → 715:dom(exit,opening) → 893:write(journal) → 900:dom(reveal,revealed) → 1249:dom(ready,settled,armed)
- tone-top: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 22:write(wallet) → 23:write(inventory) → 23:write(wallet) → 29:dom(recover) → 39:dom(anticipation,opening) → 566:dom(impact,opening) → 715:dom(exit,opening) → 888:write(journal) → 895:dom(reveal,revealed) → 1249:dom(ready,settled,armed)
- tone-cash-top: 0:pointerdown(open-primary) → 1:click(open-primary) → 21:dom(busy) → 24:write(wallet) → 24:write(inventory) → 24:write(fair) → 27:write(fair) → 28:write(wallet) → 28:write(inventory) → 28:write(wallet) → 28:write(wallet) → 32:dom(recover) → 42:dom(anticipation,opening) → 577:dom(impact,opening) → 725:dom(exit,opening) → 887:write(journal) → 890:dom(reveal,revealed) → 1249:dom(ready,settled,armed)
- ten-low: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 22:write(fair) → 23:write(wallet) → 24:write(inventory) → 24:write(wallet) → 31:dom(recover) → 44:dom(anticipation) → 571:dom(impact) → 726:dom(exit) → 901:write(journal) → 909:dom(result) → 1254:dom(result,armed)
- ten-top: 0:pointerdown(confirm) → 1:click(confirm) → 8:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 23:write(fair) → 23:write(fair) → 23:write(fair) → 23:write(fair) → 23:write(fair) → 23:write(fair) → 23:write(fair) → 23:write(fair) → 23:write(fair) → 23:write(fair) → 24:write(wallet) → 24:write(inventory) → 24:write(wallet) → 32:dom(recover) → 48:dom(anticipation) → 582:dom(impact) → 732:dom(exit) → 897:write(journal) → 905:dom(result) → 1250:dom(result,armed)

## 끼어들기 뒤의 장부

| 경우 | 단계 | 계정 거래 수 | 계정 상품 수 | nonce | 본 기록 수 | 화면 |
|---|---|---|---|---|---|---|

## 실행하지 않은 것

- 탭을 뒤로 보냈다 돌아옴: headless 브라우저의 한 탭에서는 실제 백그라운드 전환(타이머 늦춤)을 만들 수 없다. 실행하지 않았다
- 소리 재생 실패: 기본 설정은 소리 끔이고, headless 에서는 소리 장치가 없어 실패와 성공을 가를 수 없다. 실행하지 않았다
- 실제 모바일 브라우저: 데스크톱 Chrome 의 모바일 흉내(폭, 배율, 터치)만 쓴다. 실제 기기에서는 실행하지 않았다
