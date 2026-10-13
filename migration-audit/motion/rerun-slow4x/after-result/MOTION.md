# 개봉 연출 측정: after-result-slow4x

주소: http://127.0.0.1:4184/voila-test-aresjoo
시작: 2026-10-12T17:04:14.070Z
조건: ko, 폭 390, 경우마다 5번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-slow4x | 5/5 | 153 (143~184) | 553 (552~574) | 149 (138~161) | 169 (159~181) | 376 (370~384) | 1030 (1014~1076) | 1403 (1398~1446) | true, true, true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-slow4x: 0:pointerdown(open-primary) → 5:click(open-primary) → 29:dom(busy) → 41:write(wallet) → 41:write(inventory) → 41:write(fair) → 68:write(fair) → 70:write(wallet) → 72:write(inventory) → 73:write(inventory) → 73:write(wallet) → 74:write(wallet) → 74:write(wallet) → 75:write(wallet) → 103:dom(recover) → 165:dom(anticipation,opening) → 730:dom(impact,opening) → 868:dom(exit,opening) → 1049:dom(reveal,revealed) → 1062:write(journal) → 1431:dom(ready,settled,armed)

## 끼어들기 뒤의 장부

| 경우 | 단계 | 계정 거래 수 | 계정 상품 수 | nonce | 본 기록 수 | 화면 |
|---|---|---|---|---|---|---|

## 실행하지 않은 것

- 탭을 뒤로 보냈다 돌아옴: headless 브라우저의 한 탭에서는 실제 백그라운드 전환(타이머 늦춤)을 만들 수 없다. 실행하지 않았다
- 소리 재생 실패: 기본 설정은 소리 끔이고, headless 에서는 소리 장치가 없어 실패와 성공을 가를 수 없다. 실행하지 않았다
- 실제 모바일 브라우저: 데스크톱 Chrome 의 모바일 흉내(폭, 배율, 터치)만 쓴다. 실제 기기에서는 실행하지 않았다
