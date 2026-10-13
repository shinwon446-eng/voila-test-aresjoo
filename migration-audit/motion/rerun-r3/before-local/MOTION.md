# 개봉 연출 측정: before-local-rerun

주소: http://127.0.0.1:4183/voila-test-aresjoo
시작: 2026-10-12T23:09:22.525Z
조건: ko, 폭 390, 경우마다 6번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-slow4x | 6/6 | 129 (123~147) | 551 (549~557) | 148 (146~149) | 170 (168~188) | 382 (371~384) | 998 (997~1016) | 1381 (1368~1397) | true, true, true, true, true, true |
| tone-top | 6/6 | 35 (35~36) | 531 (527~532) | 148 (145~149) | 175 (174~180) | 350 (349~358) | 890 (889~891) | 1239 (1239~1248) | true, true, true, true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-slow4x: 0:pointerdown(open-primary) → 4:click(open-primary) → 23:dom(busy) → 33:write(wallet) → 33:write(inventory) → 33:write(fair) → 53:write(fair) → 56:write(wallet) → 57:write(inventory) → 58:write(inventory) → 58:write(wallet) → 59:write(wallet) → 59:write(wallet) → 59:write(wallet) → 81:dom(recover) → 127:dom(anticipation,opening) → 682:dom(impact,opening) → 828:dom(exit,opening) → 998:dom(reveal,revealed) → 1010:write(journal) → 1381:dom(ready,settled,armed)
- tone-top: 0:pointerdown(confirm) → 1:click(confirm) → 6:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 21:write(wallet) → 21:write(inventory) → 22:write(wallet) → 27:dom(recover) → 35:dom(anticipation,opening) → 567:dom(impact,opening) → 716:dom(exit,opening) → 883:write(journal) → 890:dom(reveal,revealed) → 1239:dom(ready,settled,armed)

## 끼어들기 뒤의 장부

| 경우 | 단계 | 계정 거래 수 | 계정 상품 수 | nonce | 본 기록 수 | 화면 |
|---|---|---|---|---|---|---|

## 실행하지 않은 것

- 탭을 뒤로 보냈다 돌아옴: headless 브라우저의 한 탭에서는 실제 백그라운드 전환(타이머 늦춤)을 만들 수 없다. 실행하지 않았다
- 소리 재생 실패: 기본 설정은 소리 끔이고, headless 에서는 소리 장치가 없어 실패와 성공을 가를 수 없다. 실행하지 않았다
- 실제 모바일 브라우저: 데스크톱 Chrome 의 모바일 흉내(폭, 배율, 터치)만 쓴다. 실제 기기에서는 실행하지 않았다
