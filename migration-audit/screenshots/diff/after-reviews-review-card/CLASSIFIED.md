# 차이의 분류

만든 시각: 2026-10-12T17:04:57.323Z
A(기준): before-local http://127.0.0.1:4183/voila-test-aresjoo
B(결과): after-reviews http://127.0.0.1:4185/voila-test-aresjoo
규칙: C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\harness\classify-rules.json

갈래의 뜻은 classify.mjs 머리말에 있다. 이 문서는 통과를 말하지 않는다. UNEXPLAINED 는 사람이 그림을 봐야 하는 것이다.

## 1. 갈래별 수

촬영 6건

| 갈래 | 수 |
|---|---|
| identical | 0 |
| noise | 0 |
| intended (구역 확인함) | 6 |
| intended (구역 확인 못 함) | 0 |
| background-only | 0 |
| position-aa | 0 |
| UNEXPLAINED | 0 |
| not-compared | 0 |
| not-applicable | 0 |

### 묶음별

| 묶음 | identical | noise | intended (구역 확인함) | intended (구역 확인 못 함) | background-only | position-aa | UNEXPLAINED | not-compared | not-applicable |
|---|---|---|---|---|---|---|---|---|---|
| overlay | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | 0 |

### 규칙별(설명된 촬영)

| 규칙과 갈래 | 촬영 수 |
|---|---|
| W1-review-sheet / intended | 6 |
| W1-reviews-page / intended | 6 |

## 2. 따로 찍은 영역의 상태

영역마다 두 빌드를 견준 횟수와 결과다. same 과 noise 는 그대로라는 뜻, aa-shift 는 자리의 소수 부분만 달라 가장자리가 달리 그려진 것, differ, size, onlyA, onlyB 는 달라진 것이다.

| 영역 | same | noise | aa-shift | differ | size | onlyA | onlyB |
|---|---|---|---|---|---|---|---|
| dialog | 0 | 0 | 0 | 0 | 6 | 0 | 0 |

## 3. UNEXPLAINED (0건)

없음.

## 4. position-aa (0건)

크기와 글이 같고 자리의 소수 부분만 다른 것. 앞의 40건.


## 5. 한계

- 구역을 따로 찍는 화면은 홈, 박스, 후기 화면뿐이다. 구역과 구역 사이의 빈 자리는 견주지 않는다.
- "구역 확인 못 함"은 첫 화면 촬영처럼 구역을 찍지 않은 촬영이다. 같은 항목의 전체 촬영이 구역을 확인한다.
- position-aa 는 크기, 글, 자리의 소수 부분, 눈에 띄는 픽셀의 비율(5% 미만)로 정한다. 그 픽셀이 정말 가장자리에만 있는지는 차이 그림(`<촬영 id>~<영역>.diff.png`)으로 본다.
- 글은 촬영마다 700 덩어리까지만 견준다. 구조 기록의 요소는 정해 둔 선택자만 본다.
