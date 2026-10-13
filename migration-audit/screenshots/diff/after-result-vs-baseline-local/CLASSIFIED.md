# 차이의 분류

만든 시각: 2026-10-12T17:13:01.243Z
A(기준): before-local http://127.0.0.1:4183/voila-test-aresjoo
B(결과): after-result http://127.0.0.1:4184/voila-test-aresjoo
규칙: C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\harness\classify-rules.json

갈래의 뜻은 classify.mjs 머리말에 있다. 이 문서는 통과를 말하지 않는다. UNEXPLAINED 는 사람이 그림을 봐야 하는 것이다.

## 1. 갈래별 수

촬영 3108건

| 갈래 | 수 |
|---|---|
| identical | 2052 |
| noise | 72 |
| intended (구역 확인함) | 378 |
| intended (구역 확인 못 함) | 231 |
| background-only | 342 |
| position-aa | 24 |
| UNEXPLAINED | 0 |
| not-compared | 0 |
| not-applicable | 9 |

### 묶음별

| 묶음 | identical | noise | intended (구역 확인함) | intended (구역 확인 못 함) | background-only | position-aa | UNEXPLAINED | not-compared | not-applicable |
|---|---|---|---|---|---|---|---|---|---|
| active | 9 | 0 | 9 | 0 | 45 | 6 | 0 | 0 | 0 |
| empty | 42 | 0 | 12 | 0 | 0 | 0 | 0 | 0 | 0 |
| error | 60 | 0 | 18 | 0 | 12 | 0 | 0 | 0 | 0 |
| extra | 24 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | 0 |
| focus | 9 | 0 | 9 | 0 | 45 | 6 | 0 | 0 | 0 |
| hover | 18 | 0 | 18 | 0 | 90 | 12 | 0 | 0 | 0 |
| long | 60 | 6 | 18 | 6 | 6 | 0 | 0 | 0 | 0 |
| overlay | 149 | 1 | 75 | 0 | 144 | 0 | 0 | 0 | 9 |
| route | 1399 | 59 | 135 | 135 | 0 | 0 | 0 | 0 | 0 |
| state | 282 | 6 | 78 | 90 | 0 | 0 | 0 | 0 | 0 |

### 규칙별(설명된 촬영)

| 규칙과 갈래 | 촬영 수 |
|---|---|
| W1-box / background-only | 147 |
| W1-box / intended | 324 |
| W1-box / position-aa | 24 |
| W1-box-first-link / intended | 12 |
| W1-card-primitive / intended | 24 |
| W1-home-cards / background-only | 189 |
| W1-home-cards / intended | 171 |
| W1-review-sheet / intended | 6 |
| W1-reviews-page / intended | 90 |
| W2-amount-sign / background-only | 6 |
| W2-amount-sign / intended | 24 |

## 2. 따로 찍은 영역의 상태

영역마다 두 빌드를 견준 횟수와 결과다. same 과 noise 는 그대로라는 뜻, aa-shift 는 자리의 소수 부분만 달라 가장자리가 달리 그려진 것, differ, size, onlyA, onlyB 는 달라진 것이다.

| 영역 | same | noise | aa-shift | differ | size | onlyA | onlyB |
|---|---|---|---|---|---|---|---|
| box-hero | 12 | 171 | 0 | 0 | 0 | 0 | 0 |
| card-photo | 368 | 40 | 0 | 0 | 0 | 0 | 0 |
| card-price | 408 | 0 | 0 | 0 | 0 | 0 | 0 |
| card-rating | 0 | 0 | 0 | 0 | 0 | 0 | 408 |
| card-title | 408 | 0 | 0 | 0 | 0 | 0 | 0 |
| chips | 285 | 0 | 0 | 6 | 0 | 33 | 0 |
| contents | 0 | 57 | 126 | 0 | 0 | 0 | 0 |
| desc | 348 | 0 | 0 | 0 | 0 | 0 | 0 |
| dialog | 267 | 9 | 0 | 12 | 6 | 0 | 0 |
| empty | 6 | 0 | 0 | 0 | 0 | 6 | 0 |
| footer | 70 | 114 | 158 | 0 | 0 | 0 | 0 |
| header | 342 | 0 | 0 | 0 | 0 | 0 | 0 |
| hero | 50 | 52 | 0 | 0 | 0 | 0 | 0 |
| links | 22 | 0 | 17 | 0 | 0 | 0 | 0 |
| more | 102 | 0 | 0 | 0 | 0 | 0 | 0 |
| notes | 117 | 0 | 66 | 0 | 0 | 0 | 0 |
| odds | 109 | 0 | 74 | 0 | 0 | 0 | 0 |
| openbar | 183 | 0 | 0 | 0 | 0 | 0 | 0 |
| ratinglink | 0 | 0 | 0 | 0 | 0 | 0 | 183 |
| reviews | 0 | 0 | 0 | 0 | 183 | 0 | 0 |
| reviews-feed | 0 | 0 | 0 | 0 | 33 | 0 | 189 |
| reviews-sum | 0 | 0 | 0 | 33 | 0 | 0 | 189 |
| scene | 39 | 3 | 0 | 0 | 0 | 0 | 0 |
| screenhead | 342 | 0 | 0 | 0 | 0 | 0 | 0 |
| search | 120 | 0 | 0 | 0 | 0 | 0 | 0 |
| search-rows | 10 | 2 | 0 | 0 | 0 | 0 | 0 |
| side | 153 | 0 | 30 | 0 | 0 | 0 | 0 |
| target | 213 | 3 | 24 | 0 | 36 | 0 | 0 |

## 3. UNEXPLAINED (0건)

없음.

## 4. position-aa (24건)

크기와 글이 같고 자리의 소수 부분만 다른 것. 앞의 40건.

- active/item/en-1280-guest__active: target: 눈에 띄는 픽셀 207개(0.59%), 자리의 소수 부분 기준 [0,0.625] 결과 [0,0.922]
- active/item/ko-1280-guest__active: target: 눈에 띄는 픽셀 209개(0.60%), 자리의 소수 부분 기준 [0,0.625] 결과 [0,0.922]
- active/item/zh-1280-guest__active: target: 눈에 띄는 픽셀 209개(0.60%), 자리의 소수 부분 기준 [0,0.625] 결과 [0,0.922]
- active/summary/en-1280-guest__active: target: 눈에 띄는 픽셀 548개(11.75%), 자리의 소수 부분 기준 [0,0.25] 결과 [0,0.547], 한 픽셀 [0,-1] 밀면 0개
- active/summary/ko-1280-guest__active: target: 눈에 띄는 픽셀 622개(15.37%), 자리의 소수 부분 기준 [0,0.25] 결과 [0,0.547], 한 픽셀 [0,-1] 밀면 0개
- active/summary/zh-1280-guest__active: target: 눈에 띄는 픽셀 747개(17.32%), 자리의 소수 부분 기준 [0,0.25] 결과 [0,0.547], 한 픽셀 [0,-1] 밀면 0개
- focus/item/en-1280-guest__focus: target: 눈에 띄는 픽셀 249개(0.71%), 자리의 소수 부분 기준 [0,0.625] 결과 [0,0.922]
- focus/item/ko-1280-guest__focus: target: 눈에 띄는 픽셀 251개(0.72%), 자리의 소수 부분 기준 [0,0.625] 결과 [0,0.922]
- focus/item/zh-1280-guest__focus: target: 눈에 띄는 픽셀 251개(0.72%), 자리의 소수 부분 기준 [0,0.625] 결과 [0,0.922]
- focus/summary/en-1280-guest__focus: target: 눈에 띄는 픽셀 548개(11.75%), 자리의 소수 부분 기준 [0,0.25] 결과 [0,0.547], 한 픽셀 [0,-1] 밀면 0개
- focus/summary/ko-1280-guest__focus: target: 눈에 띄는 픽셀 622개(15.37%), 자리의 소수 부분 기준 [0,0.25] 결과 [0,0.547], 한 픽셀 [0,-1] 밀면 0개
- focus/summary/zh-1280-guest__focus: target: 눈에 띄는 픽셀 747개(17.32%), 자리의 소수 부분 기준 [0,0.25] 결과 [0,0.547], 한 픽셀 [0,-1] 밀면 0개
- hover/item/en-1280-guest__hover: target: 눈에 띄는 픽셀 207개(0.59%), 자리의 소수 부분 기준 [0,0.625] 결과 [0,0.922]
- hover/item/en-1280-guest__rest: target: 눈에 띄는 픽셀 207개(0.59%), 자리의 소수 부분 기준 [0,0.625] 결과 [0,0.922]
- hover/item/ko-1280-guest__hover: target: 눈에 띄는 픽셀 209개(0.60%), 자리의 소수 부분 기준 [0,0.625] 결과 [0,0.922]
- hover/item/ko-1280-guest__rest: target: 눈에 띄는 픽셀 209개(0.60%), 자리의 소수 부분 기준 [0,0.625] 결과 [0,0.922]
- hover/item/zh-1280-guest__hover: target: 눈에 띄는 픽셀 209개(0.60%), 자리의 소수 부분 기준 [0,0.625] 결과 [0,0.922]
- hover/item/zh-1280-guest__rest: target: 눈에 띄는 픽셀 209개(0.60%), 자리의 소수 부분 기준 [0,0.625] 결과 [0,0.922]
- hover/summary/en-1280-guest__hover: target: 눈에 띄는 픽셀 548개(11.75%), 자리의 소수 부분 기준 [0,0.25] 결과 [0,0.547], 한 픽셀 [0,-1] 밀면 0개
- hover/summary/en-1280-guest__rest: target: 눈에 띄는 픽셀 548개(11.75%), 자리의 소수 부분 기준 [0,0.25] 결과 [0,0.547], 한 픽셀 [0,-1] 밀면 0개
- hover/summary/ko-1280-guest__hover: target: 눈에 띄는 픽셀 622개(15.37%), 자리의 소수 부분 기준 [0,0.25] 결과 [0,0.547], 한 픽셀 [0,-1] 밀면 0개
- hover/summary/ko-1280-guest__rest: target: 눈에 띄는 픽셀 622개(15.37%), 자리의 소수 부분 기준 [0,0.25] 결과 [0,0.547], 한 픽셀 [0,-1] 밀면 0개
- hover/summary/zh-1280-guest__hover: target: 눈에 띄는 픽셀 747개(17.32%), 자리의 소수 부분 기준 [0,0.25] 결과 [0,0.547], 한 픽셀 [0,-1] 밀면 0개
- hover/summary/zh-1280-guest__rest: target: 눈에 띄는 픽셀 747개(17.32%), 자리의 소수 부분 기준 [0,0.25] 결과 [0,0.547], 한 픽셀 [0,-1] 밀면 0개

## 5. 한계

- 구역을 따로 찍는 화면은 홈, 박스, 후기 화면뿐이다. 구역과 구역 사이의 빈 자리는 견주지 않는다.
- "구역 확인 못 함"은 첫 화면 촬영처럼 구역을 찍지 않은 촬영이다. 같은 항목의 전체 촬영이 구역을 확인한다.
- position-aa 는 크기, 글, 자리의 소수 부분, 눈에 띄는 픽셀의 비율(5% 미만)로 정한다. 그 픽셀이 정말 가장자리에만 있는지는 차이 그림(`<촬영 id>~<영역>.diff.png`)으로 본다.
- 글은 촬영마다 700 덩어리까지만 견준다. 구조 기록의 요소는 정해 둔 선택자만 본다.
