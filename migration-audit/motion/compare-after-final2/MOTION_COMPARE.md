# 연출 비교

A: before-local (http://127.0.0.1:4183/voila-test-aresjoo), 경우마다 3번
B: after-final2 (http://127.0.0.1:4187/voila-test-aresjoo), 경우마다 3번

길이는 ms, 가운데 값이다. "볼 것"은 차이가 50ms 를 넘거나 실행 사이의 흔들림보다 큰 칸이다. 판정이 아니다.

## 단계별 길이의 차이 (B 빼기 A)

| 경우 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 사건 순서 | CSS 애니메이션 | 끝난 뒤 장부 |
|---|---|---|---|---|---|---|---|---|---|---|
| one-normal | 30 / 30 (+0) | 534 / 534 (+0) | 150 / 150 (+0) | 174 / 172 (-2) | 356 / 358 (+2) | 886 / 885 (-1) | 1242 / 1243 (+1) | 같음 | 같음 | 같음 |
| one-reduced | 29 / 30 (+1) | 없음 | 없음 | 없음 | 353 / 356 (+3) | 40 / 40 (+0) | 393 / 397 (+4) | 같음 | 같음 | 같음 |
| five-normal | 30 / 31 (+1) | 528 / 533 (+5) | 152 / 150 (-2) | 171 / 172 (+1) | 352 / 352 (+0) | 883 / 886 (+3) | 1233 / 1238 (+5) | 같음 | 같음 | 같음 |
| five-reduced | 30 / 31 (+1) | 없음 | 없음 | 없음 | 353 / 351 (-2) | 40 / 41 (+1) | 392 / 392 (+0) | 같음 | 같음 | 같음 |
| one-item-normal | 36 / 39 (+3) | 529 / 527 (-2) | 150 / 149 (-1) | 173 / 180 (+7) | 353 / 349 (-4) | 888 / 900 (+12) | 1242 / 1250 (+8) | 같음 | 같음 | 같음 |
| one-short | 29 / 30 (+1) | 231 / 235 (+4) | 104 / 104 (+0) | 127 / 128 (+1) | 351 / 350 (-1) | 492 / 496 (+4) | 847 / 848 (+1) | 같음 | 같음 | 같음 |
| one-skip | 29 / 30 (+1) | 없음 | 없음 | 없음 | 357 / 355 (-2) | 225 / 227 (+2) | 582 / 582 (+0) | 같음 | 같음 | 같음 |
| one-escape | 29 / 30 (+1) | 없음 | 없음 | 없음 | 349 / 352 (+3) | 200 / 199 (-1) | 548 / 548 (+0) | 같음 | 같음 | 같음 |
| one-slow4x | 131 / 167 (+36) **볼 것** | 550 / 566 (+16) | 147 / 148 (+1) | 173 / 171 (-2) | 384 / 384 (+0) | 1009 / 1049 (+40) | 1397 / 1447 (+50) | 같음 | 같음 (차례 A 1가지, B 2가지) | 같음 |
| tone-below | 35 / 40 (+5) | 531 / 528 (-3) | 150 / 148 (-2) | 173 / 180 (+7) | 349 / 350 (+1) | 889 / 896 (+7) | 1238 / 1250 (+12) | 같음 | 같음 | 같음 |
| tone-above | 35 / 39 (+4) | 531 / 527 (-4) | 149 / 149 (+0) | 175 / 185 (+10) | 353 / 348 (-5) | 890 / 900 (+10) | 1243 / 1249 (+6) | 같음 | 같음 | 같음 |
| tone-high | 35 / 39 (+4) | 529 / 527 (-2) | 147 / 149 (+2) | 178 / 179 (+1) | 349 / 351 (+2) | 890 / 895 (+5) | 1239 / 1246 (+7) | 같음 | 같음 | 같음 |
| tone-top | 35 / 39 (+4) | 532 / 528 (-4) | 149 / 148 (-1) | 174 / 186 (+12) | 357 / 349 (-8) | 890 / 901 (+11) | 1247 / 1250 (+3) | 같음 | 같음 | 같음 |
| tone-cash-above | 52 / 42 (-10) | 528 / 534 (+6) | 149 / 148 (-1) | 173 / 171 (-2) | 353 / 355 (+2) | 903 / 899 (-4) | 1256 / 1249 (-7) | 같음 | 같음 (차례 A 2가지, B 1가지) | 같음 |
| tone-cash-top | 39 / 40 (+1) | 526 / 525 (-1) | 150 / 150 (+0) | 187 / 181 (-6) | 354 / 353 (-1) | 901 / 896 (-5) | 1249 / 1249 (+0) | 같음 | 같음 (차례 A 2가지, B 1가지) | 같음 |
| ten-low | 39 / 41 (+2) | 527 / 526 (-1) | 150 / 150 (+0) | 181 / 183 (+2) | 354 / 351 (-3) | 897 / 907 (+10) | 1246 / 1251 (+5) | 같음 | 같음 | 같음 |
| ten-top | 40 / 41 (+1) | 526 / 530 (+4) | 152 / 150 (-2) | 180 / 181 (+1) | 350 / 348 (-2) | 897 / 898 (+1) | 1250 / 1248 (-2) | 같음 | 같음 | 같음 |

칸의 꼴: A / B (차이). CSS 애니메이션은 사건의 묶음(끝남과 끊김을 한 가지로, 차례를 떼고)이 모든 실행에서 같으면 같음이다. 같은 프레임에 끝나는 사건의 차례가 실행마다 바뀌면 그 가짓수를 괄호에 적는다.

## 두 빌드의 값이 겹치지 않는 칸

실행마다의 값을 늘어놓았을 때 한 빌드의 가장 큰 값이 다른 빌드의 가장 작은 값보다 작은 칸. 차이가 작아도 한쪽으로 치우쳐 있다는 뜻이다. 실행이 세 번씩이면 우연으로도 열에 한 번쯤 나온다.

| 경우 | 단계 | A 의 값 | B 의 값 | 가운데 값의 차이 |
|---|---|---|---|---|
| one-normal | pressToReveal | 886, 886, 886 | 884, 885, 885 | -1 |
| five-normal | pressToOverlay | 29, 30, 30 | 31, 34, 31 | +1 |
| five-normal | anticipation | 529, 523, 528 | 533, 531, 533 | +5 |
| one-item-normal | pressToOverlay | 36, 36, 35 | 39, 39, 45 | +3 |
| one-item-normal | exit | 174, 172, 173 | 180, 188, 179 | +7 |
| one-item-normal | pressToReveal | 889, 888, 888 | 896, 903, 900 | +12 |
| one-short | pressToOverlay | 28, 29, 29 | 30, 30, 30 | +1 |
| one-slow4x | anticipation | 550, 551, 548 | 608, 566, 553 | +16 |
| tone-below | pressToOverlay | 35, 36, 35 | 43, 40, 39 | +5 |
| tone-below | exit | 173, 174, 173 | 175, 185, 180 | +7 |
| tone-below | pressToReveal | 889, 890, 889 | 895, 900, 896 | +7 |
| tone-above | pressToOverlay | 35, 36, 35 | 39, 38, 40 | +4 |
| tone-above | anticipation | 531, 531, 532 | 527, 529, 527 | -4 |
| tone-above | exit | 175, 174, 175 | 185, 177, 186 | +10 |
| tone-above | pressToReveal | 890, 890, 889 | 900, 893, 902 | +10 |
| tone-high | pressToOverlay | 36, 35, 35 | 37, 39, 39 | +4 |
| tone-high | pressToReveal | 890, 890, 890 | 891, 900, 895 | +5 |
| tone-high | pressToReady | 1243, 1239, 1239 | 1244, 1249, 1246 | +7 |
| tone-top | pressToOverlay | 35, 35, 35 | 39, 39, 38 | +4 |
| tone-top | anticipation | 532, 532, 532 | 528, 528, 526 | -4 |
| tone-top | exit | 174, 174, 174 | 176, 186, 190 | +12 |
| tone-top | pressToReveal | 890, 890, 890 | 891, 901, 906 | +11 |
| ten-low | pressToOverlay | 40, 39, 39 | 41, 41, 45 | +2 |

## 장부를 쓴 때

결과가 화면에 드러나기 전에, 그리고 개봉 화면이 뜨기 전에 보관함 기록이 이미 저장소에 쓰였는가(실행마다).

| 경우 | 결과보다 먼저 A | 결과보다 먼저 B | 개봉 화면보다 먼저 A | 개봉 화면보다 먼저 B | 34ms 넘는 프레임 수 A | B |
|---|---|---|---|---|---|---|
| one-normal | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| one-reduced | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| five-normal | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| five-reduced | true, true, true | true, true, true | true, true, true | true, true, true | 1, 0, 0 | 0, 0, 0 |
| one-item-normal | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| one-short | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| one-skip | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| one-escape | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| one-slow4x | true, true, true | true, true, true | true, true, true | true, true, true | 1, 2, 1 | 7, 3, 0 |
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
| tone-below | 같음 | 톤 below, item | 같음 | 10번: audio.createBufferSource, audio.createGain, bufferSource.start:0.05, audio.createOscillator, oscillator.start:sine:440, bufferSource.start:0.12 |
| tone-above | 같음 | 톤 above, item | 같음 | 16번: audio.createBufferSource, audio.createGain, bufferSource.start:0.05, audio.createOscillator, oscillator.start:sine:440, bufferSource.start:0.12 |
| tone-high | 같음 | 톤 high, item, 후광, 사진 | 같음 | 19번: audio.createBufferSource, audio.createGain, bufferSource.start:0.05, audio.createOscillator, oscillator.start:sine:440, bufferSource.start:0.12 |
| tone-top | 같음 | 톤 top, item | 같음 | 22번: audio.createBufferSource, audio.createGain, bufferSource.start:0.05, audio.createOscillator, oscillator.start:sine:440, bufferSource.start:0.12 |
| tone-cash-above | 같음 | 톤 above, cash | 같음 | 20번: new AudioContext, audio.createOscillator, audio.createGain, oscillator.start:triangle:440, audio.createBufferSource, bufferSource.start:0.05 |
| tone-cash-top | 같음 | 톤 top, item, 상표 띠, 후광, 사진 | 같음 | 26번: new AudioContext, audio.createOscillator, audio.createGain, oscillator.start:triangle:440, audio.createBufferSource, bufferSource.start:0.05 |
| ten-low | 같음 | 여러 개, 줄 10, 가장 큰 결과 칸 없음 | 같음 | 없음 |
| ten-top | 같음 | 여러 개, 줄 10, 가장 큰 결과: 가장 큰 결과 레노버 리전 고 2 Z2 익스트림 32GB 1TB 상품가 $1,349.99, | 같음 | 없음 |

## 끊긴 CSS 애니메이션

끝까지 가지 못하고 다음 단계가 먼저 와서 끊긴 애니메이션과 그 횟수(끊긴 실행 수/전체 실행 수). 견줄 때는 끝남과 끊김을 한 가지로 본다.

| 경우 | A | B |
|---|---|---|
| one-normal | v-boxw:v-op-pop 2/3 | v-boxw:v-op-pop 3/3 |
| one-reduced | 없음 | 없음 |
| five-normal | v-boxw:v-op-pop 2/3 | v-boxw:v-op-pop 1/3 |
| five-reduced | 없음 | 없음 |
| one-item-normal | 없음 | 없음 |
| one-short | v-boxw:v-op-pop 1/3 | v-boxw:v-op-pop 2/3 |
| one-skip | 없음 | 없음 |
| one-escape | 없음 | 없음 |
| one-slow4x | v-boxw:v-op-pop 1/3 | v-boxw:v-op-pop 2/3, v-op-label:v-op-in 1/3, v-op-actions:v-fade 1/3, v-op-amount:v-op-in 1/3, v-op-net:v-op-in 1/3, v-op-meta:v-op-in 1/3, v-op-status:v-fade 1/3 |
| tone-below | 없음 | v-boxw:v-op-pop 1/3 |
| tone-above | v-boxw:v-op-pop 2/3 | v-boxw:v-op-pop 1/3 |
| tone-high | v-boxw:v-op-pop 1/3 | v-boxw:v-op-pop 2/3 |
| tone-top | v-boxw:v-op-pop 3/3 | v-boxw:v-op-pop 1/3 |
| tone-cash-above | v-box3-lid:v-op-strain 1/3, v-boxw:v-op-settle 1/3, v-seal-star:v-op-wind 1/3, v-boxw:v-op-pop 2/3 | v-boxw:v-op-pop 2/3 |
| tone-cash-top | v-seal-star:v-op-wind 1/3, v-boxw:v-op-settle 1/3, v-box3-lid:v-op-strain 1/3, v-boxw:v-op-pop 1/3 | v-boxw:v-op-pop 2/3 |
| ten-low | v-boxw:v-op-pop 2/3 | v-boxw:v-op-pop 2/3 |
| ten-top | 없음 | v-boxw:v-op-pop 1/3 |

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
