# 개봉 연출 측정: after-final3-rerun

주소: http://127.0.0.1:4189/voila-test-aresjoo
시작: 2026-10-12T23:10:09.427Z
조건: ko, 폭 390, 경우마다 6번

길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.

## 단계별 길이

| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |
|---|---|---|---|---|---|---|---|---|---|
| one-slow4x | 6/6 | 145 (138~151) | 553 (551~561) | 147 (138~148) | 172 (166~183) | 381 (371~383) | 1017 (1009~1032) | 1398 (1384~1413) | true, true, true, true, true, true |
| tone-top | 6/6 | 38 (37~38) | 529 (527~530) | 149 (147~149) | 176 (174~188) | 350 (346~352) | 891 (890~902) | 1242 (1239~1250) | true, true, true, true, true, true |

## 사건 순서(경우마다 첫 실행)

- one-slow4x: 0:pointerdown(open-primary) → 5:click(open-primary) → 25:dom(busy) → 36:write(wallet) → 37:write(inventory) → 37:write(fair) → 58:write(fair) → 60:write(wallet) → 61:write(inventory) → 62:write(inventory) → 63:write(wallet) → 63:write(wallet) → 63:write(wallet) → 64:write(wallet) → 84:dom(recover) → 151:dom(anticipation,opening) → 711:dom(impact,opening) → 849:dom(exit,opening) → 1032:dom(reveal,revealed) → 1045:write(journal) → 1413:dom(ready,settled,armed)
- tone-top: 0:pointerdown(confirm) → 1:click(confirm) → 7:dom(busy) → 16:write(wallet) → 16:write(inventory) → 16:write(fair) → 21:write(fair) → 22:write(wallet) → 22:write(inventory) → 22:write(wallet) → 29:dom(recover) → 38:dom(anticipation,opening) → 567:dom(impact,opening) → 716:dom(exit,opening) → 884:write(journal) → 891:dom(reveal,revealed) → 1241:dom(ready,settled,armed)

## 끼어들기 뒤의 장부

| 경우 | 단계 | 계정 거래 수 | 계정 상품 수 | nonce | 본 기록 수 | 화면 |
|---|---|---|---|---|---|---|

## 실행하지 않은 것

- 탭을 뒤로 보냈다 돌아옴: headless 브라우저의 한 탭에서는 실제 백그라운드 전환(타이머 늦춤)을 만들 수 없다. 실행하지 않았다
- 소리 재생 실패: 기본 설정은 소리 끔이고, headless 에서는 소리 장치가 없어 실패와 성공을 가를 수 없다. 실행하지 않았다
- 실제 모바일 브라우저: 데스크톱 Chrome 의 모바일 흉내(폭, 배율, 터치)만 쓴다. 실제 기기에서는 실행하지 않았다
