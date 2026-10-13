# 연출 비교

A: before-local (http://127.0.0.1:4183/voila-test-aresjoo), 경우마다 3번
B: after-final3 (http://127.0.0.1:4189/voila-test-aresjoo), 경우마다 3번

길이는 ms, 가운데 값이다. "볼 것"은 차이가 50ms 를 넘거나 실행 사이의 흔들림보다 큰 칸이다. 판정이 아니다.

## 단계별 길이의 차이 (B 빼기 A)

| 경우 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 사건 순서 | CSS 애니메이션 | 끝난 뒤 장부 |
|---|---|---|---|---|---|---|---|---|---|---|
| one-normal | 29 / 29 (+0) | 531 / 529 (-2) | 154 / 150 (-4) | 175 / 170 (-5) | 351 / 353 (+2) | 886 / 885 (-1) | 1237 / 1237 (+0) | 같음 | 같음 | 같음 |
| one-reduced | 30 / 29 (-1) | 없음 | 없음 | 없음 | 354 / 356 (+2) | 42 / 39 (-3) | 397 / 395 (-2) | 같음 | 같음 | 같음 |
| five-normal | 31 / 31 (+0) | 533 / 535 (+2) | 149 / 148 (-1) | 174 / 171 (-3) | 355 / 352 (-3) | 887 / 886 (-1) | 1243 / 1238 (-5) | 같음 | 같음 | 같음 |
| five-reduced | 30 / 31 (+1) | 없음 | 없음 | 없음 | 348 / 349 (+1) | 42 / 40 (-2) | 391 / 389 (-2) | 같음 | 같음 | 같음 |
| one-item-normal | 36 / 38 (+2) | 530 / 528 (-2) | 150 / 150 (+0) | 174 / 174 (+0) | 349 / 356 (+7) | 890 / 890 (+0) | 1243 / 1246 (+3) | 같음 | 같음 | 같음 |
| one-short | 30 / 29 (-1) | 231 / 229 (-2) | 111 / 106 (-5) | 126 / 131 (+5) | 352 / 353 (+1) | 496 / 495 (-1) | 848 / 848 (+0) | 같음 | 같음 | 같음 |
| one-skip | 30 / 30 (+0) | 없음 | 없음 | 없음 | 352 / 351 (-1) | 227 / 225 (-2) | 581 / 576 (-5) | 같음 | 같음 | 같음 |
| one-escape | 29 / 30 (+1) | 없음 | 없음 | 없음 | 353 / 352 (-1) | 202 / 199 (-3) | 559 / 549 (-10) | 같음 | 같음 | 같음 |
| one-slow4x | 140 / 140 (+0) | 560 / 559 (-1) | 148 / 150 (+2) | 171 / 169 (-2) | 382 / 378 (-4) | 1015 / 1014 (-1) | 1398 / 1387 (-11) | 같음 | 같음 | 같음 |
| tone-below | 35 / 38 (+3) | 530 / 529 (-1) | 149 / 149 (+0) | 174 / 181 (+7) | 347 / 349 (+2) | 889 / 897 (+8) | 1237 / 1246 (+9) | 같음 | 같음 | 같음 |
| tone-above | 36 / 39 (+3) | 531 / 527 (-4) | 149 / 149 (+0) | 175 / 185 (+10) | 350 / 347 (-3) | 889 / 901 (+12) | 1241 / 1250 (+9) | 같음 | 같음 | 같음 |
| tone-high | 35 / 40 (+5) | 530 / 530 (+0) | 149 / 148 (-1) | 174 / 180 (+6) | 353 / 350 (-3) | 888 / 900 (+12) | 1243 / 1249 (+6) | 같음 | 같음 | 같음 |
| tone-top | 35 / 37 (+2) | 531 / 528 (-3) | 149 / 149 (+0) | 173 / 175 (+2) | 355 / 350 (-5) | 889 / 891 (+2) | 1244 / 1249 (+5) | 같음 | 같음 | 같음 |
| tone-cash-above | 41 / 42 (+1) | 525 / 534 (+9) | 149 / 150 (+1) | 183 / 166 (-17) | 351 / 352 (+1) | 899 / 893 (-6) | 1248 / 1248 (+0) | 같음 | 같음 | 같음 |
| tone-cash-top | 47 / 45 (-2) | 530 / 533 (+3) | 149 / 149 (+0) | 174 / 178 (+4) | 354 / 352 (-2) | 905 / 901 (-4) | 1259 / 1254 (-5) | 같음 | 같음 | 같음 |
| ten-low | 39 / 45 (+6) | 527 / 526 (-1) | 150 / 150 (+0) | 191 / 181 (-10) | 352 / 348 (-4) | 907 / 906 (-1) | 1259 / 1250 (-9) | 같음 | 같음 | 같음 |
| ten-top | 38 / 45 (+7) | 528 / 530 (+2) | 150 / 149 (-1) | 180 / 175 (-5) | 348 / 348 (+0) | 896 / 899 (+3) | 1244 / 1244 (+0) | 같음 | 같음 | 같음 |

칸의 꼴: A / B (차이). CSS 애니메이션은 사건의 묶음(끝남과 끊김을 한 가지로, 차례를 떼고)이 모든 실행에서 같으면 같음이다. 같은 프레임에 끝나는 사건의 차례가 실행마다 바뀌면 그 가짓수를 괄호에 적는다.

## 두 빌드의 값이 겹치지 않는 칸

실행마다의 값을 늘어놓았을 때 한 빌드의 가장 큰 값이 다른 빌드의 가장 작은 값보다 작은 칸. 차이가 작아도 한쪽으로 치우쳐 있다는 뜻이다. 실행이 세 번씩이면 우연으로도 열에 한 번쯤 나온다.

| 경우 | 단계 | A 의 값 | B 의 값 | 가운데 값의 차이 |
|---|---|---|---|---|
| one-reduced | pressToReveal | 41, 43, 42 | 39, 39, 39 | -3 |
| one-short | exit | 121, 126, 127 | 131, 131, 131 | +5 |
| tone-below | pressToOverlay | 36, 35, 35 | 37, 39, 38 | +3 |
| tone-above | pressToOverlay | 36, 35, 36 | 39, 38, 39 | +3 |
| tone-above | anticipation | 531, 532, 531 | 526, 527, 528 | -4 |
| tone-above | exit | 172, 175, 175 | 189, 185, 179 | +10 |
| tone-above | pressToReveal | 888, 891, 889 | 903, 901, 895 | +12 |
| tone-above | pressToReady | 1233, 1241, 1245 | 1250, 1246, 1250 | +9 |
| tone-high | pressToOverlay | 34, 35, 35 | 40, 41, 37 | +5 |
| tone-high | pressToReveal | 888, 890, 888 | 900, 900, 891 | +12 |
| tone-top | pressToOverlay | 35, 35, 36 | 37, 37, 39 | +2 |
| tone-top | anticipation | 531, 532, 531 | 527, 530, 528 | -3 |
| tone-cash-above | exit | 185, 179, 183 | 164, 167, 166 | -17 |
| tone-cash-above | pressToReveal | 899, 904, 897 | 893, 896, 892 | -6 |
| ten-low | pressToOverlay | 39, 39, 38 | 45, 45, 48 | +6 |
| ten-low | exit | 191, 192, 187 | 185, 181, 176 | -10 |
| ten-top | pressToOverlay | 38, 38, 39 | 46, 42, 45 | +7 |

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
| one-slow4x | true, true, true | true, true, true | true, true, true | true, true, true | 2, 1, 1 | 1, 2, 2 |
| tone-below | true, true, true | true, true, true | true, true, true | true, true, true | 1, 0, 0 | 1, 0, 0 |
| tone-above | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| tone-high | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| tone-top | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| tone-cash-above | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| tone-cash-top | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| ten-low | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| ten-top | true, true, true | true, true, true | true, true, true | true, true, true | 0, 1, 0 | 0, 0, 0 |

## 결과의 크기에 따른 효과와 소리, 진동

효과는 결과가 다 보인 뒤의 개봉 화면에서 읽은 것(톤, 종류, 상표 띠, 후광, 사진, 여러 개 결과의 가장 큰 결과 칸). 호출은 누른 뒤 앱이 부른 소리와 진동의 목록(실행마다).

| 경우 | 효과가 같은가 | 효과(A) | 호출이 같은가 | 호출(A, 첫 실행) |
|---|---|---|---|---|
| one-normal | 같음 | 톤 below, cash | 같음 | 없음 |
| one-reduced | 같음 | 톤 below, cash | 같음 | 없음 |
| five-normal | 같음 | 여러 개, 줄 2, 가장 큰 결과 칸 없음 | 같음 | 없음 |
| five-reduced | 같음 | 여러 개, 줄 2, 가장 큰 결과 칸 없음 | 같음 | 없음 |
| one-item-normal | 같음 | 톤 below, item | 같음 | 없음 |
| one-short | 같음 | 톤 below, cash | 같음 | 없음 |
| one-skip | 같음 | 톤 below, cash | 같음 | 없음 |
| one-escape | 같음 | 톤 below, cash | 같음 | 없음 |
| one-slow4x | 같음 | 톤 below, cash | 같음 | 없음 |
| tone-below | 같음 | 톤 below, item | 같음 | 14번: 누르기 전:new AudioContext, 누르기 전:audio.createOscillator, 누르기 전:audio.createGain, 누르기 전:oscillator.start:triangle:440, audio.createBufferSource, audio.createGain |
| tone-above | 같음 | 톤 above, item | 같음 | 20번: 누르기 전:new AudioContext, 누르기 전:audio.createOscillator, 누르기 전:audio.createGain, 누르기 전:oscillator.start:triangle:440, audio.createBufferSource, audio.createGain |
| tone-high | 같음 | 톤 high, item, 후광, 사진 | 같음 | 23번: 누르기 전:new AudioContext, 누르기 전:audio.createOscillator, 누르기 전:audio.createGain, 누르기 전:oscillator.start:triangle:440, audio.createBufferSource, audio.createGain |
| tone-top | 같음 | 톤 top, item | 같음 | 26번: 누르기 전:new AudioContext, 누르기 전:audio.createOscillator, 누르기 전:audio.createGain, 누르기 전:oscillator.start:triangle:440, audio.createBufferSource, audio.createGain |
| tone-cash-above | 같음 | 톤 above, cash | 같음 | 20번: new AudioContext, audio.createOscillator, audio.createGain, oscillator.start:triangle:440, audio.createBufferSource, bufferSource.start:0.05 |
| tone-cash-top | 같음 | 톤 top, item, 상표 띠, 후광, 사진 | 같음 | 26번: new AudioContext, audio.createOscillator, audio.createGain, oscillator.start:triangle:440, audio.createBufferSource, bufferSource.start:0.05 |
| ten-low | 같음 | 여러 개, 줄 10, 가장 큰 결과 칸 없음 | 같음 | 4번: 누르기 전:new AudioContext, 누르기 전:audio.createOscillator, 누르기 전:audio.createGain, 누르기 전:oscillator.start:triangle:440 |
| ten-top | 같음 | 여러 개, 줄 10, 가장 큰 결과: 가장 큰 결과 레노버 리전 고 2 Z2 익스트림 32GB 1TB 상품가 $1,349.99, | 같음 | 4번: 누르기 전:new AudioContext, 누르기 전:audio.createOscillator, 누르기 전:audio.createGain, 누르기 전:oscillator.start:triangle:440 |

## 끊긴 CSS 애니메이션

끝까지 가지 못하고 다음 단계가 먼저 와서 끊긴 애니메이션과 그 횟수(끊긴 실행 수/전체 실행 수). 견줄 때는 끝남과 끊김을 한 가지로 본다.

| 경우 | A | B |
|---|---|---|
| one-normal | v-boxw:v-op-pop 1/3 | v-boxw:v-op-pop 1/3 |
| one-reduced | 없음 | 없음 |
| five-normal | v-boxw:v-op-pop 2/3 | v-boxw:v-op-pop 2/3 |
| five-reduced | 없음 | 없음 |
| one-item-normal | v-boxw:v-op-pop 1/3 | v-boxw:v-op-pop 1/3 |
| one-short | v-boxw:v-op-pop 1/3 | 없음 |
| one-skip | 없음 | 없음 |
| one-escape | 없음 | 없음 |
| one-slow4x | v-boxw:v-op-pop 1/3 | v-boxw:v-op-pop 1/3 |
| tone-below | v-boxw:v-op-pop 1/3 | v-boxw:v-op-pop 2/3 |
| tone-above | v-boxw:v-op-pop 2/3 | v-boxw:v-op-pop 2/3 |
| tone-high | 없음 | v-boxw:v-op-pop 2/3 |
| tone-top | v-boxw:v-op-pop 2/3 | v-boxw:v-op-pop 2/3 |
| tone-cash-above | v-boxw:v-op-pop 1/3 | v-boxw:v-op-pop 1/3 |
| tone-cash-top | v-boxw:v-op-pop 1/3 | v-boxw:v-op-pop 2/3 |
| ten-low | v-boxw:v-op-pop 1/3 | v-boxw:v-op-pop 2/3 |
| ten-top | 없음 | v-boxw:v-op-pop 2/3 |

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
