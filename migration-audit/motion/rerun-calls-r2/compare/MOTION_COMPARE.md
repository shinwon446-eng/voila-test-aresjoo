# 연출 비교

A: before-local-calls (http://127.0.0.1:4183/voila-test-aresjoo), 경우마다 3번
B: after-final2-calls (http://127.0.0.1:4187/voila-test-aresjoo), 경우마다 3번

길이는 ms, 가운데 값이다. "볼 것"은 차이가 50ms 를 넘거나 실행 사이의 흔들림보다 큰 칸이다. 판정이 아니다.

## 단계별 길이의 차이 (B 빼기 A)

| 경우 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 사건 순서 | CSS 애니메이션 | 끝난 뒤 장부 |
|---|---|---|---|---|---|---|---|---|---|---|
| one-item-normal | 36 / 38 (+2) | 530 / 527 (-3) | 149 / 150 (+1) | 174 / 185 (+11) | 351 / 348 (-3) | 889 / 901 (+12) | 1240 / 1249 (+9) | 같음 | 같음 | 같음 |
| tone-below | 36 / 38 (+2) | 531 / 528 (-3) | 149 / 149 (+0) | 174 / 185 (+11) | 355 / 349 (-6) | 890 / 900 (+10) | 1245 / 1249 (+4) | 같음 | 같음 | 같음 |
| tone-top | 36 / 39 (+3) | 529 / 527 (-2) | 151 / 149 (-2) | 173 / 185 (+12) | 349 / 350 (+1) | 889 / 900 (+11) | 1239 / 1250 (+11) | 같음 | 같음 | 같음 |
| tone-cash-top | 40 / 42 (+2) | 526 / 529 (+3) | 149 / 149 (+0) | 178 / 181 (+3) | 354 / 352 (-2) | 899 / 897 (-2) | 1249 / 1249 (+0) | 같음 | 같음 | 같음 |
| ten-low | 39 / 41 (+2) | 527 / 525 (-2) | 150 / 150 (+0) | 181 / 183 (+2) | 354 / 348 (-6) | 896 / 903 (+7) | 1250 / 1251 (+1) | 같음 | 같음 | 같음 |
| ten-top | 39 / 47 (+8) | 527 / 534 (+7) | 150 / 150 (+0) | 182 / 173 (-9) | 346 / 345 (-1) | 898 / 905 (+7) | 1250 / 1250 (+0) | 같음 | 같음 | 같음 |

칸의 꼴: A / B (차이). CSS 애니메이션은 사건의 묶음(끝남과 끊김을 한 가지로, 차례를 떼고)이 모든 실행에서 같으면 같음이다. 같은 프레임에 끝나는 사건의 차례가 실행마다 바뀌면 그 가짓수를 괄호에 적는다.

## 두 빌드의 값이 겹치지 않는 칸

실행마다의 값을 늘어놓았을 때 한 빌드의 가장 큰 값이 다른 빌드의 가장 작은 값보다 작은 칸. 차이가 작아도 한쪽으로 치우쳐 있다는 뜻이다. 실행이 세 번씩이면 우연으로도 열에 한 번쯤 나온다.

| 경우 | 단계 | A 의 값 | B 의 값 | 가운데 값의 차이 |
|---|---|---|---|---|
| one-item-normal | pressToOverlay | 36, 35, 36 | 40, 38, 38 | +2 |
| one-item-normal | anticipation | 530, 531, 530 | 526, 528, 527 | -3 |
| one-item-normal | pressToReveal | 889, 889, 889 | 901, 890, 906 | +12 |
| one-item-normal | pressToReady | 1243, 1240, 1238 | 1249, 1244, 1250 | +9 |
| tone-below | pressToOverlay | 36, 35, 36 | 38, 38, 39 | +2 |
| tone-below | anticipation | 531, 532, 531 | 528, 529, 527 | -3 |
| tone-below | exit | 174, 173, 174 | 185, 185, 180 | +11 |
| tone-below | pressToReveal | 890, 888, 890 | 900, 900, 895 | +10 |
| tone-below | pressToReady | 1248, 1237, 1245 | 1249, 1249, 1249 | +4 |
| tone-top | pressToOverlay | 35, 36, 37 | 39, 40, 38 | +3 |
| tone-top | impact | 153, 151, 150 | 149, 149, 149 | -2 |
| tone-top | exit | 172, 174, 173 | 180, 185, 185 | +12 |
| tone-top | pressToReveal | 888, 890, 889 | 895, 901, 900 | +11 |
| tone-top | pressToReady | 1233, 1239, 1242 | 1249, 1250, 1250 | +11 |
| ten-low | pressToOverlay | 38, 39, 39 | 44, 41, 41 | +2 |
| ten-low | revealToReady | 354, 353, 354 | 345, 350, 348 | -6 |
| ten-top | pressToOverlay | 39, 38, 39 | 48, 47, 41 | +8 |
| ten-top | anticipation | 527, 528, 527 | 534, 536, 534 | +7 |
| ten-top | exit | 190, 182, 180 | 173, 173, 175 | -9 |

## 장부를 쓴 때

결과가 화면에 드러나기 전에, 그리고 개봉 화면이 뜨기 전에 보관함 기록이 이미 저장소에 쓰였는가(실행마다).

| 경우 | 결과보다 먼저 A | 결과보다 먼저 B | 개봉 화면보다 먼저 A | 개봉 화면보다 먼저 B | 34ms 넘는 프레임 수 A | B |
|---|---|---|---|---|---|---|
| one-item-normal | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| tone-below | true, true, true | true, true, true | true, true, true | true, true, true | 1, 0, 0 | 1, 0, 0 |
| tone-top | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| tone-cash-top | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| ten-low | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |
| ten-top | true, true, true | true, true, true | true, true, true | true, true, true | 0, 0, 0 | 0, 0, 0 |

## 결과의 크기에 따른 효과와 소리, 진동

효과는 결과가 다 보인 뒤의 개봉 화면에서 읽은 것(톤, 종류, 상표 띠, 후광, 사진, 여러 개 결과의 가장 큰 결과 칸). 호출은 누른 뒤 앱이 부른 소리와 진동의 목록(실행마다).

| 경우 | 효과가 같은가 | 효과(A) | 호출이 같은가 | 호출(A, 첫 실행) |
|---|---|---|---|---|
| one-item-normal | 같음 | 톤 below, item | 같음 | 없음 |
| tone-below | 같음 | 톤 below, item | 같음 | 14번: 누르기 전:new AudioContext, 누르기 전:audio.createOscillator, 누르기 전:audio.createGain, 누르기 전:oscillator.start:triangle:440, audio.createBufferSource, audio.createGain |
| tone-top | 같음 | 톤 top, item | 같음 | 26번: 누르기 전:new AudioContext, 누르기 전:audio.createOscillator, 누르기 전:audio.createGain, 누르기 전:oscillator.start:triangle:440, audio.createBufferSource, audio.createGain |
| tone-cash-top | 같음 | 톤 top, item, 상표 띠, 후광, 사진 | 같음 | 26번: new AudioContext, audio.createOscillator, audio.createGain, oscillator.start:triangle:440, audio.createBufferSource, bufferSource.start:0.05 |
| ten-low | 같음 | 여러 개, 줄 10, 가장 큰 결과 칸 없음 | 같음 | 4번: 누르기 전:new AudioContext, 누르기 전:audio.createOscillator, 누르기 전:audio.createGain, 누르기 전:oscillator.start:triangle:440 |
| ten-top | 같음 | 여러 개, 줄 10, 가장 큰 결과: 가장 큰 결과 레노버 리전 고 2 Z2 익스트림 32GB 1TB 상품가 $1,349.99, | 같음 | 4번: 누르기 전:new AudioContext, 누르기 전:audio.createOscillator, 누르기 전:audio.createGain, 누르기 전:oscillator.start:triangle:440 |

## 끊긴 CSS 애니메이션

끝까지 가지 못하고 다음 단계가 먼저 와서 끊긴 애니메이션과 그 횟수(끊긴 실행 수/전체 실행 수). 견줄 때는 끝남과 끊김을 한 가지로 본다.

| 경우 | A | B |
|---|---|---|
| one-item-normal | v-boxw:v-op-pop 2/3 | v-boxw:v-op-pop 1/3 |
| tone-below | 없음 | v-boxw:v-op-pop 3/3 |
| tone-top | 없음 | v-boxw:v-op-pop 1/3 |
| tone-cash-top | v-boxw:v-op-pop 3/3 | v-boxw:v-op-pop 2/3 |
| ten-low | v-boxw:v-op-pop 2/3 | 없음 |
| ten-top | v-boxw:v-op-pop 2/3 | v-boxw:v-op-pop 1/3 |

## 끼어들기 뒤의 장부

칸의 꼴: 거래 수, 상품 수, nonce, 본 기록 수, 다시 보기 단추.

| 경우 | 단계 | A | B | 같은가 |
|---|---|---|---|---|

## 실행하지 않은 것

- 탭을 뒤로 보냈다 돌아옴: headless 브라우저의 한 탭에서는 실제 백그라운드 전환(타이머 늦춤)을 만들 수 없다. 실행하지 않았다
- 소리 재생 실패: 기본 설정은 소리 끔이고, headless 에서는 소리 장치가 없어 실패와 성공을 가를 수 없다. 실행하지 않았다
- 실제 모바일 브라우저: 데스크톱 Chrome 의 모바일 흉내(폭, 배율, 터치)만 쓴다. 실제 기기에서는 실행하지 않았다
