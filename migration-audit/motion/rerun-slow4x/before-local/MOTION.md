# 개봉 연출 측정: before-local-slow4x

주소: http://127.0.0.1:4183/voila-test-aresjoo
시작: 2026-10-12T17:03:54.572Z
조건: ko, 폭 390, 경우마다 5번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-slow4x | 5/5 | 147 (141~152) | 554 (553~559) | 149 (148~164) | 170 (163~173) | 384 (376~387) | 1025 (1015~1033) | 1411 (1395~1417) | true, true, true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-slow4x: 0:pointerdown(open-primary) → 5:click(open-primary) → 30:dom(busy) → 41:write(wallet) → 41:write(inventory) → 42:write(fair) → 64:write(fair) → 67:write(wallet) → 68:write(inventory) → 69:write(inventory) → 70:write(wallet) → 70:write(wallet) → 70:write(wallet) → 71:write(wallet) → 95:dom(recover) → 147:dom(anticipation,opening) → 700:dom(impact,opening) → 862:dom(exit,opening) → 1025:dom(reveal,revealed) → 1046:write(journal) → 1412:dom(ready,settled,armed)

## 끼어들기 뒤의 장부

| 경우 | 단계 | 계정 거래 수 | 계정 상품 수 | nonce | 본 기록 수 | 화면 |
|---|---|---|---|---|---|---|

## 실행하지 않은 것

- 탭을 뒤로 보냈다 돌아옴: headless 브라우저의 한 탭에서는 실제 백그라운드 전환(타이머 늦춤)을 만들 수 없다. 실행하지 않았다
- 소리 재생 실패: 기본 설정은 소리 끔이고, headless 에서는 소리 장치가 없어 실패와 성공을 가를 수 없다. 실행하지 않았다
- 실제 모바일 브라우저: 데스크톱 Chrome 의 모바일 흉내(폭, 배율, 터치)만 쓴다. 실제 기기에서는 실행하지 않았다
