# 촬영 비교 요약

만든 시각: 2026-10-12T17:04:58.430Z

| | A | B |
|---|---|---|
| label | after-reviews | after-result |
| baseUrl | http://127.0.0.1:4185/voila-test-aresjoo | http://127.0.0.1:4184/voila-test-aresjoo |
| chrome | 154.0.8037.98 | 154.0.8037.98 |
| startedAt | 2026-10-12T17:04:46.750Z | 2026-10-12T16:55:25.786Z |
| items | 1617 | 1617 |
| failedItems | 0 | 0 |
| dir | C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-reviews | C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-result |

이 문서는 통과와 실패를 말하지 않는다. 숫자와 차이의 종류를 적을 뿐이고, 판정은 사람이 아래 목록을 보고 한다.

## 1. 종류별 수

촬영 6건 (그림을 견준 것 6건)

| 종류 | 수 | 뜻 |
|---|---|---|
| structure | 6 | 구조 기록이 다르다(크기, 자리, 줄바꿈, 요소 수, 글, 그림, 글꼴 등) |

### 묶음별

| 묶음 | 전체 | identical | sub-threshold | aa-only | solid-pixels | structure | 그 밖 |
|---|---|---|---|---|---|---|---|
| overlay | 6 | 0 | 0 | 0 | 0 | 6 | 0 |

### 구조 차이의 종류별 촬영 수

| 차이 | 촬영 수 |
|---|---|
| docHeight | 6 |
| boxMoved | 6 |
| textSet | 6 |

## 2. 한쪽에만 있는 촬영

없음.


## 3. 두 쪽 모두 찍지 못한 촬영(견주지 못함)

없음.


## 4. 크기 불일치

없음.


## 5. 가로 넘침이 두 쪽에서 다른 촬영

없음.


## 5-1. 두 쪽 모두 같은 폭으로 넘치는 촬영(차이는 아니다. 원본에도 있는 넘침이다)

없음.


## 6. 깨지거나 끝나지 않은 그림

없음.


## 7. 글 줄 수의 변화

없음.


## 8. 한쪽에만 있는 글

6건

- overlay/review-card/en-1440-guest__detail: A에만 8, B에만 9. 예: "reviews | span.v-rv-author :: 阿福"
- overlay/review-card/en-390-guest__detail: A에만 8, B에만 9. 예: "reviews | span.v-rv-author :: 阿福"
- overlay/review-card/ko-1440-guest__detail: A에만 8, B에만 9. 예: "reviews | span.v-rv-author :: 阿福"
- overlay/review-card/ko-390-guest__detail: A에만 8, B에만 9. 예: "reviews | span.v-rv-author :: 阿福"
- overlay/review-card/zh-1440-guest__detail: A에만 8, B에만 9. 예: "reviews | span.v-rv-author :: 阿福"
- overlay/review-card/zh-390-guest__detail: A에만 8, B에만 9. 예: "reviews | span.v-rv-author :: 阿福"

## 9. 자리와 크기가 2px 넘게 다른 요소

6건

- overlay/review-card/en-1440-guest__detail: 22곳, 가장 큰 차이 29px (.v-app)
- overlay/review-card/en-390-guest__detail: 22곳, 가장 큰 차이 29px (.v-app)
- overlay/review-card/ko-1440-guest__detail: 22곳, 가장 큰 차이 29px (.v-app)
- overlay/review-card/ko-390-guest__detail: 22곳, 가장 큰 차이 29px (.v-app)
- overlay/review-card/zh-1440-guest__detail: 22곳, 가장 큰 차이 29px (.v-app)
- overlay/review-card/zh-390-guest__detail: 22곳, 가장 큰 차이 29px (.v-app)

## 10. 요소 수의 변화

없음.


## 11. 글꼴 차이

없음.


## 12. 콘솔과 요청 기록의 차이

없음.


## 13. 그 밖의 구조 차이(주소, 응답 상태, 문서 높이, 겹침 화면, 그림 수)

6건

- overlay/review-card/en-1440-guest__detail: docHeight {"a":3319,"b":3348}
- overlay/review-card/en-390-guest__detail: docHeight {"a":5122,"b":5151}
- overlay/review-card/ko-1440-guest__detail: docHeight {"a":3319,"b":3348}
- overlay/review-card/ko-390-guest__detail: docHeight {"a":5077,"b":5106}
- overlay/review-card/zh-1440-guest__detail: docHeight {"a":3319,"b":3348}
- overlay/review-card/zh-390-guest__detail: docHeight {"a":5053,"b":5082}

## 14. 사람이 볼 목록

solid 비율이 0.0100% 를 넘거나 구조 차이가 하나라도 있는 촬영 전부. 6건. solid 비율이 큰 순서.

| 촬영 | 종류 | solid | aa | exact | 다른 띠(세로 구간) | 구조 차이 |
|---|---|---|---|---|---|---|
| overlay/review-card/zh-1440-guest__detail | structure | 16383 (1.2641%) | 0 | 147391 | 331~342, 369~383, 428~439, 457~471 외 8 | docHeight, boxMoved, textSet |
| overlay/review-card/en-1440-guest__detail | structure | 15655 (1.2079%) | 0 | 144750 | 321~334, 358~373, 428~439, 456~471 외 8 | docHeight, boxMoved, textSet |
| overlay/review-card/ko-1440-guest__detail | structure | 14577 (1.1248%) | 0 | 142750 | 321~332, 358~373, 428~439, 456~471 외 8 | docHeight, boxMoved, textSet |
| overlay/review-card/zh-390-guest__detail | structure | 6323 (0.4802%) | 0 | 13198 | 834~857, 1041~1066, 1118~1147 | docHeight, boxMoved, textSet |
| overlay/review-card/en-390-guest__detail | structure | 5121 (0.3889%) | 0 | 10866 | 1002~1028, 1078~1106 | docHeight, boxMoved, textSet |
| overlay/review-card/ko-390-guest__detail | structure | 4988 (0.3788%) | 0 | 10461 | 1002~1025, 1078~1106 | docHeight, boxMoved, textSet |

## 15. 따로 분류한 미세 차이(가장자리 다듬기, 문턱 아래의 색 차이)

0건. 구조 차이가 없고 solid 비율이 문턱 아래인 것. 다른 픽셀이 많은 순서로 30건.


## 15-1. 두 쪽에 똑같이 있는 것(차이는 아니지만 알아 둘 것)

- 콘솔 오류가 같은 내용으로 있는 촬영: 0건
- 400 이상의 응답이 같은 내용으로 있는 촬영: 0건
- 끊은 요청(바깥 주소, GET 이 아닌 요청)이 같은 내용으로 있는 촬영: 0건
- 대체 글꼴의 불림 상태만 다른 촬영(글꼴 파일이 도착한 때의 차이, 그림에는 차이가 없을 수 있다): 0건
- 기다리다 시간이 넘은 것이 적힌 촬영: 0건

## 16. 읽는 법

- 사람이 볼 목록의 항목은 `reshoot.txt` 에 쉼표로 이어 적었다(0개). 두 환경에서 `node shots.mjs <label> <baseUrl> <outDir> --only "$(cat reshoot.txt)"` 로 다시 찍고 이 도구를 다시 돌린다. 한 번만 생긴 흔들림은 사라지고, 다시 찍어도 남는 차이만 진짜 차이다.
- 차이 그림은 이 폴더의 `<촬영 id>.diff.png` 다. 빨강은 다른 픽셀, 노랑은 가장자리 다듬기로 본 픽셀, 회색은 A 를 어둡게 깐 것이다.
- 원본 그림과 기록은 위 표의 A, B 폴더에 같은 이름(`.png`, `.json`)으로 있다.
- 긴 그림은 `node tools/crop.mjs` 로 잘라서 본다.
