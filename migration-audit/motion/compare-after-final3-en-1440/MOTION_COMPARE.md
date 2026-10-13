# 연출 비교

A: before-local-en-1440 (http://127.0.0.1:4183/voila-test-aresjoo), 경우마다 3번
B: after-final3-en-1440 (http://127.0.0.1:4189/voila-test-aresjoo), 경우마다 3번

길이는 ms, 가운데 값이다. "볼 것"은 차이가 50ms 를 넘거나 실행 사이의 흔들림보다 큰 칸이다. 판정이 아니다.

## 단계별 길이의 차이 (B 빼기 A)

| 경우 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 사건 순서 | CSS 애니메이션 | 끝난 뒤 장부 |
|---|---|---|---|---|---|---|---|---|---|---|
| one-normal | 28 / 29 (+1) | 530 / 528 (-2) | 150 / 150 (+0) | 173 / 171 (-2) | 350 / 349 (-1) | 881 / 883 (+2) | 1231 / 1231 (+0) | 같음 | 같음 | 같음 |
| one-reduced | 29 / 30 (+1) | 없음 | 없음 | 없음 | 355 / 348 (-7) | 40 / 41 (+1) | 396 / 389 (-7) | 같음 | 같음 | 같음 |
| five-normal | 29 / 31 (+2) | 530 / 534 (+4) | 151 / 143 (-8) | 170 / 175 (+5) | 352 / 351 (-1) | 881 / 881 (+0) | 1232 / 1232 (+0) | 같음 | 같음 | 같음 |
| five-reduced | 30 / 31 (+1) | 없음 | 없음 | 없음 | 348 / 351 (+3) | 42 / 42 (+0) | 389 / 393 (+4) | 같음 | 같음 | 같음 |
| one-item-normal | 35 / 38 (+3) | 531 / 528 (-3) | 150 / 150 (+0) | 174 / 180 (+6) | 350 / 352 (+2) | 890 / 895 (+5) | 1240 / 1247 (+7) | 같음 | 같음 | 같음 |
| one-short | 29 / 29 (+0) | 225 / 235 (+10) | 111 / 100 (-11) | 136 / 130 (-6) | 347 / 352 (+5) | 500 / 495 (-5) | 848 / 848 (+0) | 같음 | 같음 | 같음 |
| one-skip | 29 / 29 (+0) | 없음 | 없음 | 없음 | 351 / 354 (+3) | 241 / 226 (-15) | 592 / 582 (-10) | 같음 | 같음 | 같음 |
| one-escape | 29 / 29 (+0) | 없음 | 없음 | 없음 | 354 / 353 (-1) | 204 / 201 (-3) | 553 / 558 (+5) | 같음 | 같음 | 같음 |
| one-slow4x | 133 / 162 (+29) | 548 / 555 (+7) | 148 / 147 (-1) | 173 / 174 (+1) | 365 / 368 (+3) | 1002 / 1038 (+36) **볼 것** | 1365 / 1427 (+62) **볼 것** | 같음 | 같음 | 같음 |
| tone-below | 35 / 39 (+4) | 531 / 528 (-3) | 149 / 149 (+0) | 174 / 185 (+11) | 349 / 348 (-1) | 889 / 901 (+12) | 1237 / 1249 (+12) | 같음 | 같음 | 같음 |
| tone-above | 36 / 39 (+3) | 531 / 528 (-3) | 149 / 149 (+0) | 173 / 185 (+12) | 359 / 349 (-10) | 889 / 900 (+11) | 1249 / 1249 (+0) | 같음 | 같음 | 같음 |
| tone-high | 35 / 41 (+6) | 530 / 527 (-3) | 151 / 154 (+3) | 174 / 182 (+8) | 357 / 352 (-5) | 890 / 897 (+7) | 1247 / 1250 (+3) | 같음 | 같음 | 같음 |
| tone-top | 36 / 39 (+3) | 531 / 528 (-3) | 149 / 149 (+0) | 175 / 180 (+5) | 353 / 354 (+1) | 890 / 896 (+6) | 1243 / 1250 (+7) | 같음 | 같음 | 같음 |
| tone-cash-above | 39 / 48 (+9) | 527 / 533 (+6) | 149 / 145 (-4) | 181 / 174 (-7) | 353 / 358 (+5) | 897 / 900 (+3) | 1249 / 1258 (+9) | 같음 | 같음 | 같음 |
| tone-cash-top | 42 / 44 (+2) | 528 / 530 (+2) | 154 / 155 (+1) | 172 / 173 (+1) | 352 / 351 (-1) | 897 / 898 (+1) | 1249 / 1248 (-1) | 같음 | 같음 (차례 A 2가지, B 1가지) | 같음 |
| ten-low | 38 / 44 (+6) | 528 / 527 (-1) | 149 / 155 (+6) | 191 / 183 (-8) | 348 / 348 (+0) | 907 / 908 (+1) | 1255 / 1257 (+2) | 같음 | 같음 | 같음 |
| ten-top | 38 / 42 (+4) | 527 / 534 (+7) | 150 / 150 (+0) | 185 / 178 (-7) | 351 / 352 (+1) | 900 / 900 (+0) | 1249 / 1250 (+1) | 같음 | 같음 | 같음 |

칸의 꼴: A / B (차이). CSS 애니메이션은 사건의 묶음(끝남과 끊김을 한 가지로, 차례를 떼고)이 모든 실행에서 같으면 같음이다. 같은 프레임에 끝나는 사건의 차례가 실행마다 바뀌면 그 가짓수를 괄호에 적는다.

## 두 빌드의 값이 겹치지 않는 칸

실행마다의 값을 늘어놓았을 때 한 빌드의 가장 큰 값이 다른 빌드의 가장 작은 값보다 작은 칸. 차이가 작아도 한쪽으로 치우쳐 있다는 뜻이다. 실행이 세 번씩이면 우연으로도 열에 한 번쯤 나온다.

| 경우 | 단계 | A 의 값 | B 의 값 | 가운데 값의 차이 |
|---|---|---|---|---|
| one-reduced | pressToOverlay | 29, 29, 29 | 30, 30, 31 | +1 |
| one-reduced | revealToReady | 355, 356, 355 | 348, 348, 354 | -7 |
| five-normal | pressToOverlay | 29, 29, 29 | 31, 30, 31 | +2 |
| five-normal | impact | 151, 145, 155 | 143, 143, 143 | -8 |
| five-reduced | pressToOverlay | 29, 30, 30 | 31, 31, 31 | +1 |
| one-item-normal | pressToOverlay | 35, 35, 35 | 38, 38, 41 | +3 |
| one-item-normal | anticipation | 531, 530, 531 | 528, 526, 529 | -3 |
| one-item-normal | exit | 174, 174, 175 | 180, 180, 186 | +6 |
| one-item-normal | pressToReveal | 890, 890, 890 | 895, 895, 906 | +5 |
| one-slow4x | pressToOverlay | 125, 154, 133 | 157, 162, 183 | +29 |
| one-slow4x | pressToReveal | 1000, 1025, 1002 | 1032, 1038, 1063 | +36 |
| tone-below | pressToOverlay | 35, 35, 35 | 39, 39, 39 | +4 |
| tone-below | anticipation | 531, 532, 529 | 528, 527, 528 | -3 |
| tone-below | exit | 174, 172, 176 | 185, 180, 186 | +11 |
| tone-below | pressToReveal | 889, 888, 889 | 901, 896, 902 | +12 |
| tone-below | pressToReady | 1242, 1237, 1237 | 1249, 1243, 1250 | +12 |
| tone-above | pressToOverlay | 35, 36, 36 | 39, 39, 39 | +3 |
| tone-above | anticipation | 532, 531, 531 | 528, 528, 526 | -3 |
| tone-above | exit | 174, 173, 173 | 180, 190, 185 | +12 |
| tone-above | pressToReveal | 890, 889, 888 | 896, 906, 900 | +11 |
| tone-high | pressToOverlay | 35, 35, 35 | 41, 42, 39 | +6 |
| tone-high | revealToReady | 357, 355, 359 | 352, 346, 353 | -5 |
| tone-high | pressToReveal | 890, 890, 890 | 908, 897, 897 | +7 |
| tone-top | pressToOverlay | 36, 36, 35 | 39, 39, 39 | +3 |
| tone-top | anticipation | 530, 531, 531 | 528, 528, 528 | -3 |
| tone-top | exit | 174, 175, 175 | 180, 180, 191 | +5 |
| tone-top | pressToReveal | 890, 890, 890 | 896, 896, 906 | +6 |
| tone-top | pressToReady | 1243, 1245, 1240 | 1250, 1250, 1250 | +7 |
| tone-cash-above | pressToOverlay | 42, 39, 39 | 43, 48, 48 | +9 |
| tone-cash-above | anticipation | 531, 527, 526 | 533, 533, 532 | +6 |
| ten-low | pressToOverlay | 39, 38, 38 | 45, 42, 44 | +6 |
| ten-top | pressToOverlay | 38, 39, 38 | 43, 42, 42 | +4 |
| ten-top | anticipation | 528, 527, 526 | 537, 533, 534 | +7 |

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
| one-slow4x | true, true, true | true, true, true | true, true, true | true, true, true | 1, 2, 1 | 1, 2, 2 |
| tone-below | true, true, true | true, true, true | true, true, true | true, true, true | 1, 0, 0 | 1, 0, 0 |
| tone-above | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| tone-high | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| tone-top | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| tone-cash-above | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| tone-cash-top | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| ten-low | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| ten-top | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |

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
| ten-top | 같음 | 여러 개, 줄 10, 가장 큰 결과: Biggest result Lenovo Legion Go 2 Ryzen Z2 Extreme | 같음 | 4번: 누르기 전:new AudioContext, 누르기 전:audio.createOscillator, 누르기 전:audio.createGain, 누르기 전:oscillator.start:triangle:440 |

## 끊긴 CSS 애니메이션

끝까지 가지 못하고 다음 단계가 먼저 와서 끊긴 애니메이션과 그 횟수(끊긴 실행 수/전체 실행 수). 견줄 때는 끝남과 끊김을 한 가지로 본다.

| 경우 | A | B |
|---|---|---|
| one-normal | v-boxw:v-op-pop 2/3 | 없음 |
| one-reduced | 없음 | 없음 |
| five-normal | 없음 | v-boxw:v-op-pop 2/3 |
| five-reduced | 없음 | 없음 |
| one-item-normal | v-boxw:v-op-pop 1/3 | v-boxw:v-op-pop 1/3 |
| one-short | 없음 | v-boxw:v-op-pop 2/3 |
| one-skip | 없음 | 없음 |
| one-escape | 없음 | 없음 |
| one-slow4x | v-boxw:v-op-pop 3/3 | v-boxw:v-op-pop 2/3 |
| tone-below | v-boxw:v-op-pop 1/3 | 없음 |
| tone-above | v-boxw:v-op-pop 1/3 | v-boxw:v-op-pop 1/3 |
| tone-high | 없음 | v-boxw:v-op-pop 3/3 |
| tone-top | v-boxw:v-op-pop 1/3 | 없음 |
| tone-cash-above | v-boxw:v-op-pop 3/3 | v-boxw:v-op-pop 1/3 |
| tone-cash-top | v-box3-lid:v-op-strain 1/3, v-boxw:v-op-settle 1/3, v-seal-star:v-op-wind 1/3, v-boxw:v-op-pop 1/3 | v-boxw:v-op-pop 2/3 |
| ten-low | v-boxw:v-op-pop 2/3 | v-boxw:v-op-pop 2/3 |
| ten-top | v-boxw:v-op-pop 1/3 | v-boxw:v-op-pop 2/3 |

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
