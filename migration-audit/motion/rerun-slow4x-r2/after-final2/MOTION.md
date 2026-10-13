# 개봉 연출 측정: after-final2-slow4x

주소: http://127.0.0.1:4187/voila-test-aresjoo
시작: 2026-10-12T21:06:21.962Z
조건: ko, 폭 390, 경우마다 6번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-slow4x | 6/6 | 142 (134~164) | 550 (548~561) | 147 (146~148) | 173 (168~186) | 380 (372~388) | 1016 (1012~1041) | 1400 (1388~1425) | true, true, true, true, true, true |
| tone-top | 6/6 | 39 (39~40) | 527 (526~528) | 149 (148~150) | 184 (180~190) | 347 (344~353) | 898 (896~905) | 1249 (1243~1250) | true, true, true, true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-slow4x: 0:pointerdown(open-primary) → 8:click(open-primary) → 38:dom(busy) → 49:write(wallet) → 49:write(inventory) → 49:write(fair) → 70:write(fair) → 73:write(wallet) → 75:write(inventory) → 75:write(inventory) → 76:write(wallet) → 76:write(wallet) → 77:write(wallet) → 77:write(wallet) → 105:dom(recover) → 164:dom(anticipation,opening) → 725:dom(impact,opening) → 872:dom(exit,opening) → 1041:dom(reveal,revealed) → 1053:write(journal) → 1425:dom(ready,settled,armed)
- tone-top: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 22:write(fair) → 23:write(wallet) → 23:write(inventory) → 23:write(wallet) → 29:dom(recover) → 39:dom(anticipation,opening) → 566:dom(impact,opening) → 715:dom(exit,opening) → 898:write(journal) → 905:dom(reveal,revealed) → 1249:dom(ready,settled,armed)

## 끼어들기 뒤의 장부

| 경우 | 단계 | 계정 거래 수 | 계정 상품 수 | nonce | 본 기록 수 | 화면 |
|---|---|---|---|---|---|---|

## 실행하지 않은 것

- 탭을 뒤로 보냈다 돌아옴: headless 브라우저의 한 탭에서는 실제 백그라운드 전환(타이머 늦춤)을 만들 수 없다. 실행하지 않았다
- 소리 재생 실패: 기본 설정은 소리 끔이고, headless 에서는 소리 장치가 없어 실패와 성공을 가를 수 없다. 실행하지 않았다
- 실제 모바일 브라우저: 데스크톱 Chrome 의 모바일 흉내(폭, 배율, 터치)만 쓴다. 실제 기기에서는 실행하지 않았다
