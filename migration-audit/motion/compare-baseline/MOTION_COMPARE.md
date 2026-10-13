# 연출 비교

A: before-deployed (https://shinwon446-eng.github.io/voila-test-aresjoo), 경우마다 3번
B: before-local (http://127.0.0.1:4173/voila-test-aresjoo), 경우마다 3번

길이는 ms, 가운데 값이다. "볼 것"은 차이가 50ms 를 넘거나 실행 사이의 흔들림보다 큰 칸이다. 판정이 아니다.

## 단계별 길이의 차이 (B 빼기 A)

| 경우 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 사건 순서 | CSS 애니메이션 | 끝난 뒤 장부 |
|---|---|---|---|---|---|---|---|---|---|---|
| one-normal | 29 / 29 (+0) | 530 / 529 (-1) | 153 / 154 (+1) | 174 / 173 (-1) | 352 / 352 (+0) | 886 / 886 (+0) | 1247 / 1238 (-9) | 같음 | 같음 | 같음 |
| one-reduced | 29 / 29 (+0) | 없음 | 없음 | 없음 | 352 / 349 (-3) | 41 / 39 (-2) | 393 / 388 (-5) | 같음 | 같음 | 같음 |
| five-normal | 31 / 30 (-1) | 527 / 524 (-3) | 152 / 155 (+3) | 175 / 179 (+4) | 360 / 351 (-9) | 888 / 887 (-1) | 1249 / 1238 (-11) | 같음 | 같음 | 같음 |
| five-reduced | 30 / 30 (+0) | 없음 | 없음 | 없음 | 349 / 358 (+9) | 42 / 41 (-1) | 390 / 398 (+8) | 같음 | 같음 | 같음 |
| one-item-normal | 36 / 36 (+0) | 530 / 530 (+0) | 150 / 150 (+0) | 174 / 174 (+0) | 359 / 347 (-12) | 889 / 890 (+1) | 1248 / 1238 (-10) | 같음 | 같음 | 같음 |
| one-short | 30 / 29 (-1) | 231 / 234 (+3) | 105 / 100 (-5) | 132 / 129 (-3) | 352 / 350 (-2) | 498 / 492 (-6) | 849 / 842 (-7) | 같음 | 같음 | 같음 |
| one-skip | 30 / 29 (-1) | 없음 | 없음 | 없음 | 355 / 352 (-3) | 225 / 224 (-1) | 580 / 576 (-4) | 같음 | 같음 | 같음 |
| one-escape | 29 / 29 (+0) | 없음 | 없음 | 없음 | 351 / 350 (-1) | 198 / 198 (+0) | 549 / 548 (-1) | 같음 | 같음 | 같음 |
| one-slow4x | 142 / 125 (-17) | 562 / 555 (-7) | 151 / 150 (-1) | 172 / 170 (-2) | 382 / 382 (+0) | 1017 / 999 (-18) | 1400 / 1381 (-19) | 같음 | 같음 | 같음 |

칸의 꼴: A / B (차이).

## 장부를 쓴 때

결과가 화면에 드러나기 전에, 그리고 개봉 화면이 뜨기 전에 보관함 기록이 이미 저장소에 쓰였는가(실행마다).

| 경우 | 결과보다 먼저 A | 결과보다 먼저 B | 개봉 화면보다 먼저 A | 개봉 화면보다 먼저 B | 34ms 넘는 프레임 수 A | B |
|---|---|---|---|---|---|---|
| one-normal | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| one-reduced | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| five-normal | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| five-reduced | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| one-item-normal | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| one-short | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| one-skip | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| one-escape | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| one-slow4x | true, true, true | true, true, true | true, true, true | true, true, true | 1, 2, 1 | 1, 2, 1 |

## 끊긴 CSS 애니메이션

끝까지 가지 못하고 다음 단계가 먼저 와서 끊긴 애니메이션과 그 횟수(끊긴 실행 수/전체 실행 수). 견줄 때는 끝남과 끊김을 한 가지로 본다.

| 경우 | A | B |
|---|---|---|
| one-normal | 없음 | v-boxw:v-op-pop 1/3 |
| one-reduced | 없음 | 없음 |
| five-normal | v-boxw:v-op-pop 2/3 | v-boxw:v-op-pop 2/3 |
| five-reduced | 없음 | 없음 |
| one-item-normal | v-boxw:v-op-pop 2/3 | v-boxw:v-op-pop 1/3 |
| one-short | v-boxw:v-op-pop 2/3 | v-boxw:v-op-pop 2/3 |
| one-skip | 없음 | 없음 |
| one-escape | 없음 | 없음 |
| one-slow4x | v-boxw:v-op-pop 1/3 | v-boxw:v-op-pop 1/3 |

## 끼어들기 뒤의 장부

칸의 꼴: 거래 수, 상품 수, nonce, 본 기록 수, 다시 보기 단추.

| 경우 | 단계 | A | B | 같은가 |
|---|---|---|---|---|
| second-press | 누르기 전 | 1, 0, 0, 0, 없음 | 1, 0, 0, 0, 없음 | 같음 |
| second-press | 연출 도중에 두 번 더 누른 직후 | 3, 1, 1, 0, 없음 | 3, 1, 1, 0, 없음 | 같음 |
| second-press | 결과가 뜬 뒤 | 3, 1, 1, 1, 없음 | 3, 1, 1, 1, 없음 | 같음 |
| rapid-triple-click | 누르기 전 | 1, 0, 0, 0, 없음 | 1, 0, 0, 0, 없음 | 같음 |
| rapid-triple-click | 결과가 뜬 뒤 | 3, 1, 1, 1, 없음 | 3, 1, 1, 1, 없음 | 같음 |
| leave-mid | 누르기 전 | 1, 0, 0, 0, 없음 | 1, 0, 0, 0, 없음 | 같음 |
| leave-mid | 떠난 뒤(박스 목록) | 3, 1, 1, 0, 없음 | 3, 1, 1, 0, 없음 | 같음 |
| leave-mid | 돌아온 뒤 | 3, 1, 1, 0, 있음 | 3, 1, 1, 0, 있음 | 같음 |
| leave-mid | 못 본 결과를 다시 본 뒤 | 3, 1, 1, 1, 없음 | 3, 1, 1, 1, 없음 | 같음 |
| leave-mid | 닫은 뒤 | 3, 1, 1, 1, 없음 | 3, 1, 1, 1, 없음 | 같음 |
| refresh-mid | 누르기 전 | 1, 0, 0, 0, 없음 | 1, 0, 0, 0, 없음 | 같음 |
| refresh-mid | 새로 고친 뒤 | 3, 1, 1, 0, 있음 | 3, 1, 1, 0, 있음 | 같음 |
| refresh-mid | 못 본 결과를 다시 본 뒤 | 3, 1, 1, 1, 없음 | 3, 1, 1, 1, 없음 | 같음 |
| refresh-mid | 한 번 더 새로 고친 뒤 | 3, 1, 1, 1, 없음 | 3, 1, 1, 1, 없음 | 같음 |
| back-mid | 누르기 전 | 1, 0, 0, 0, 없음 | 1, 0, 0, 0, 없음 | 같음 |
| back-mid | 뒤로 간 뒤 | 3, 1, 1, 0, 없음 | 3, 1, 1, 0, 없음 | 같음 |
| back-mid | 앞으로 돌아온 뒤 | 3, 1, 1, 0, 있음 | 3, 1, 1, 0, 있음 | 같음 |

## 실행하지 않은 것

- 탭을 뒤로 보냈다 돌아옴: headless 브라우저의 한 탭에서는 실제 백그라운드 전환(타이머 늦춤)을 만들 수 없다. 실행하지 않았다
- 소리 재생 실패: 기본 설정은 소리 끔이고, headless 에서는 소리 장치가 없어 실패와 성공을 가를 수 없다. 실행하지 않았다
- 실제 모바일 브라우저: 데스크톱 Chrome 의 모바일 흉내(폭, 배율, 터치)만 쓴다. 실제 기기에서는 실행하지 않았다
