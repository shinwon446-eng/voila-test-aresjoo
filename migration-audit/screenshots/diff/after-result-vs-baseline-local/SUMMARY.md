# 촬영 비교 요약

만든 시각: 2026-10-12T17:13:00.971Z

| | A | B |
|---|---|---|
| label | before-local | after-result |
| baseUrl | http://127.0.0.1:4183/voila-test-aresjoo | http://127.0.0.1:4184/voila-test-aresjoo |
| chrome | 154.0.8037.98 | 154.0.8037.98 |
| startedAt | 2026-10-12T16:55:31.199Z | 2026-10-12T16:55:25.786Z |
| items | 1617 | 1617 |
| failedItems | 0 | 0 |
| dir | C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local | C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-result |

이 문서는 통과와 실패를 말하지 않는다. 숫자와 차이의 종류를 적을 뿐이고, 판정은 사람이 아래 목록을 보고 한다.

## 1. 종류별 수

촬영 3108건 (그림을 견준 것 3099건)

| 종류 | 수 | 뜻 |
|---|---|---|
| identical | 2052 | 픽셀이 전부 같고 구조 기록도 같다 |
| structure | 975 | 구조 기록이 다르다(크기, 자리, 줄바꿈, 요소 수, 글, 그림, 글꼴 등) |
| sub-threshold | 72 | 값이 다른 픽셀이 있으나 눈에 띄는 차이(threshold 0.1)는 없다 |
| both-not-applicable | 9 | 두 쪽 모두 해당 없음(고른 요소가 그 폭에 없다) |

### 묶음별

| 묶음 | 전체 | identical | sub-threshold | aa-only | solid-pixels | structure | 그 밖 |
|---|---|---|---|---|---|---|---|
| active | 69 | 9 | 0 | 0 | 0 | 60 | 0 |
| empty | 54 | 42 | 0 | 0 | 0 | 12 | 0 |
| error | 90 | 60 | 0 | 0 | 0 | 30 | 0 |
| extra | 30 | 24 | 0 | 0 | 0 | 6 | 0 |
| focus | 69 | 9 | 0 | 0 | 0 | 60 | 0 |
| hover | 138 | 18 | 0 | 0 | 0 | 120 | 0 |
| long | 96 | 60 | 6 | 0 | 0 | 30 | 0 |
| overlay | 378 | 149 | 1 | 0 | 0 | 219 | 9 |
| route | 1728 | 1399 | 59 | 0 | 0 | 270 | 0 |
| state | 456 | 282 | 6 | 0 | 0 | 168 | 0 |

### 구조 차이의 종류별 촬영 수

| 차이 | 촬영 수 |
|---|---|
| textSet | 975 |
| docHeight | 945 |
| elementCount | 945 |
| boxMoved | 945 |
| fonts | 861 |
| imageCount | 465 |
| sizeMismatch | 285 |
| scrollY | 147 |

## 2. 한쪽에만 있는 촬영

없음.


## 3. 두 쪽 모두 찍지 못한 촬영(견주지 못함)

없음.


## 4. 크기 불일치

285건

- active/boxcard/en-1280-guest__active: A 395x372, B 395x397
- active/boxcard/ko-1280-guest__active: A 395x372, B 395x397
- active/boxcard/zh-1280-guest__active: A 395x372, B 395x397
- active/link/en-1280-guest__active: A 119x76, B 123x76
- active/link/ko-1280-guest__active: A 84x76, B 112x76
- active/link/zh-1280-guest__active: A 102x76, B 116x76
- active/rvcard/en-1280-guest__active: A 303x394, B 568x214
- active/rvcard/ko-1280-guest__active: A 303x394, B 568x214
- active/rvcard/zh-1280-guest__active: A 303x394, B 568x214
- focus/boxcard/en-1280-guest__focus: A 395x372, B 395x397
- focus/boxcard/ko-1280-guest__focus: A 395x372, B 395x397
- focus/boxcard/zh-1280-guest__focus: A 395x372, B 395x397
- focus/link/en-1280-guest__focus: A 119x76, B 123x76
- focus/link/ko-1280-guest__focus: A 84x76, B 112x76
- focus/link/zh-1280-guest__focus: A 102x76, B 116x76
- focus/rvcard/en-1280-guest__focus: A 303x394, B 568x214
- focus/rvcard/ko-1280-guest__focus: A 303x394, B 568x214
- focus/rvcard/zh-1280-guest__focus: A 303x394, B 568x214
- hover/boxcard/en-1280-guest__hover: A 395x372, B 395x397
- hover/boxcard/en-1280-guest__rest: A 395x372, B 395x397
- hover/boxcard/ko-1280-guest__hover: A 395x372, B 395x397
- hover/boxcard/ko-1280-guest__rest: A 395x372, B 395x397
- hover/boxcard/zh-1280-guest__hover: A 395x372, B 395x397
- hover/boxcard/zh-1280-guest__rest: A 395x372, B 395x397
- hover/link/en-1280-guest__hover: A 119x76, B 123x76
- hover/link/en-1280-guest__rest: A 119x76, B 123x76
- hover/link/ko-1280-guest__hover: A 84x76, B 112x76
- hover/link/ko-1280-guest__rest: A 84x76, B 112x76
- hover/link/zh-1280-guest__hover: A 102x76, B 116x76
- hover/link/zh-1280-guest__rest: A 102x76, B 116x76
- hover/rvcard/en-1280-guest__hover: A 303x394, B 568x214
- hover/rvcard/en-1280-guest__rest: A 303x394, B 568x214
- hover/rvcard/ko-1280-guest__hover: A 303x394, B 568x214
- hover/rvcard/ko-1280-guest__rest: A 303x394, B 568x214
- hover/rvcard/zh-1280-guest__hover: A 303x394, B 568x214
- hover/rvcard/zh-1280-guest__rest: A 303x394, B 568x214
- long/box-krw/en-1440-inventory+bigKrw__full: A 1440x9758, B 1440x11234
- long/box-krw/en-390-inventory+bigKrw__full: A 780x25504, B 780x28450
- long/box-krw/ko-1440-inventory+bigKrw__full: A 1440x9758, B 1440x11234
- long/box-krw/ko-390-inventory+bigKrw__full: A 780x25330, B 780x28234
- long/box-krw/zh-1440-inventory+bigKrw__full: A 1440x9758, B 1440x11234
- long/box-krw/zh-390-inventory+bigKrw__full: A 780x25282, B 780x28234
- overlay/currency-box/en-1440-funded__krw-full: A 1440x9758, B 1440x11234
- overlay/currency-box/en-390-funded__krw-full: A 780x25504, B 780x28450
- overlay/currency-box/ko-1440-funded__krw-full: A 1440x9758, B 1440x11234
- overlay/currency-box/ko-390-funded__krw-full: A 780x25330, B 780x28234
- overlay/currency-box/zh-1440-funded__krw-full: A 1440x9758, B 1440x11234
- overlay/currency-box/zh-390-funded__krw-full: A 780x25282, B 780x28234
- overlay/footer-controls/en-1440-guest__home-krw-full: A 1440x4646, B 1440x4846
- overlay/footer-controls/en-390-guest__home-krw-full: A 780x9128, B 780x9728
- overlay/footer-controls/ko-1440-guest__home-krw-full: A 1440x4646, B 1440x4846
- overlay/footer-controls/ko-390-guest__home-krw-full: A 780x8904, B 780x9504
- overlay/footer-controls/zh-1440-guest__home-krw-full: A 1440x4646, B 1440x4846
- overlay/footer-controls/zh-390-guest__home-krw-full: A 780x8948, B 780x9548
- overlay/odds-pokemon/en-1440-guest__tables: A 1440x17696, B 1440x18704
- overlay/odds-pokemon/en-390-guest__tables: A 780x36418, B 780x38428
- overlay/odds-pokemon/ko-1440-guest__tables: A 1440x17675, B 1440x18683
- overlay/odds-pokemon/ko-390-guest__tables: A 780x36108, B 780x38076
- overlay/odds-pokemon/zh-1440-guest__tables: A 1440x17675, B 1440x18683
- overlay/odds-pokemon/zh-390-guest__tables: A 780x36060, B 780x38076
- 그 밖에 225건. 전부는 summary.json 에 있다.

## 5. 가로 넘침이 두 쪽에서 다른 촬영

없음.


## 5-1. 두 쪽 모두 같은 폭으로 넘치는 촬영(차이는 아니다. 원본에도 있는 넘침이다)

6건

- route/home/en-1024-guest__first: 문서 1028, 창 1024
- route/home/en-1024-guest__full: 문서 1028, 창 1024
- route/home/ko-1024-guest__first: 문서 1028, 창 1024
- route/home/ko-1024-guest__full: 문서 1028, 창 1024
- route/home/zh-1024-guest__first: 문서 1028, 창 1024
- route/home/zh-1024-guest__full: 문서 1028, 창 1024

## 6. 깨지거나 끝나지 않은 그림

없음.


## 7. 글 줄 수의 변화

없음.


## 8. 한쪽에만 있는 글

975건

- active/back/en-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: No reviews yet. Only real openings can be reviewed."
- active/back/ko-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: 아직 후기가 없습니다. 실제로 연 기록에만 후기를 쓸 수 있습니다."
- active/back/zh-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: 暂无评价。只有真实开箱记录才能评价。"
- active/boxcard/en-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/boxcard/ko-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/boxcard/zh-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/btn-quiet/en-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/btn-quiet/ko-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/btn-quiet/zh-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/btn/en-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/btn/ko-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/btn/zh-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/chip-pressed/en-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/chip-pressed/ko-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/chip-pressed/zh-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/chip/en-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/chip/ko-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/chip/zh-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/footer-button/en-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/footer-button/ko-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/footer-button/zh-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/footer-link/en-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/footer-link/ko-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/footer-link/zh-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/headbtn-balance/en-1280-funded__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/headbtn-balance/ko-1280-funded__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/headbtn-balance/zh-1280-funded__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/headbtn/en-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/headbtn/ko-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/headbtn/zh-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/item/en-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: No reviews yet. Only real openings can be reviewed."
- active/item/ko-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: 아직 후기가 없습니다. 실제로 연 기록에만 후기를 쓸 수 있습니다."
- active/item/zh-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: 暂无评价。只有真实开箱记录才能评价。"
- active/itemrow/en-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: No reviews yet. Only real openings can be reviewed."
- active/itemrow/ko-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: 아직 후기가 없습니다. 실제로 연 기록에만 후기를 쓸 수 있습니다."
- active/itemrow/zh-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: 暂无评价。只有真实开箱记录才能评价。"
- active/link/en-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: No reviews yet. Only real openings can be reviewed."
- active/link/ko-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: 아직 후기가 없습니다. 실제로 연 기록에만 후기를 쓸 수 있습니다."
- active/link/zh-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: 暂无评价。只有真实开箱记录才能评价。"
- active/logo/en-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/logo/ko-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/logo/zh-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/mainitem/en-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: No reviews yet. Only real openings can be reviewed."
- active/mainitem/ko-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: 아직 후기가 없습니다. 실제로 연 기록에만 후기를 쓸 수 있습니다."
- active/mainitem/zh-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: 暂无评价。只有真实开箱记录才能评价。"
- active/nav-link/en-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/nav-link/ko-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/nav-link/zh-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/open-primary/en-1280-funded__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: No reviews yet. Only real openings can be reviewed."
- active/open-primary/ko-1280-funded__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: 아직 후기가 없습니다. 실제로 연 기록에만 후기를 쓸 수 있습니다."
- active/open-primary/zh-1280-funded__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: 暂无评价。只有真实开箱记录才能评价。"
- active/rvcard/en-1280-guest__active: A에만 161, B에만 117. 예: "chips | button.v-chip :: All"
- active/rvcard/ko-1280-guest__active: A에만 161, B에만 117. 예: "chips | button.v-chip :: 전체"
- active/rvcard/zh-1280-guest__active: A에만 161, B에만 117. 예: "chips | button.v-chip :: 全部"
- active/search/en-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/search/ko-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/search/zh-1280-guest__active: A에만 0, B에만 24. 예: "card-rating | span.v-num :: 4.3 (101)"
- active/summary/en-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: No reviews yet. Only real openings can be reviewed."
- active/summary/ko-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: 아직 후기가 없습니다. 실제로 연 기록에만 후기를 쓸 수 있습니다."
- active/summary/zh-1280-guest__active: A에만 1, B에만 48. 예: "reviews | p.v-empty :: 暂无评价。只有真实开箱记录才能评价。"
- 그 밖에 915건. 전부는 summary.json 에 있다.

## 9. 자리와 크기가 2px 넘게 다른 요소

945건

- active/back/en-1280-guest__active: 71곳, 가장 큰 차이 9454.25px (svg)
- active/back/ko-1280-guest__active: 71곳, 가장 큰 차이 9454.25px (svg)
- active/back/zh-1280-guest__active: 71곳, 가장 큰 차이 9454.25px (svg)
- active/boxcard/en-1280-guest__active: 41곳, 가장 큰 차이 2849.25px (svg)
- active/boxcard/ko-1280-guest__active: 41곳, 가장 큰 차이 2849.25px (svg)
- active/boxcard/zh-1280-guest__active: 41곳, 가장 큰 차이 2849.25px (svg)
- active/btn-quiet/en-1280-guest__active: 41곳, 가장 큰 차이 2849.25px (svg)
- active/btn-quiet/ko-1280-guest__active: 41곳, 가장 큰 차이 2849.25px (svg)
- active/btn-quiet/zh-1280-guest__active: 41곳, 가장 큰 차이 2849.25px (svg)
- active/btn/en-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/btn/ko-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/btn/zh-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/chip-pressed/en-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/chip-pressed/ko-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/chip-pressed/zh-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/chip/en-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/chip/ko-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/chip/zh-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/footer-button/en-1280-guest__active: 41곳, 가장 큰 차이 2849.25px (svg)
- active/footer-button/ko-1280-guest__active: 41곳, 가장 큰 차이 2849.25px (svg)
- active/footer-button/zh-1280-guest__active: 41곳, 가장 큰 차이 2849.25px (svg)
- active/footer-link/en-1280-guest__active: 41곳, 가장 큰 차이 2849.25px (svg)
- active/footer-link/ko-1280-guest__active: 41곳, 가장 큰 차이 2849.25px (svg)
- active/footer-link/zh-1280-guest__active: 41곳, 가장 큰 차이 2849.25px (svg)
- active/headbtn-balance/en-1280-funded__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/headbtn-balance/ko-1280-funded__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/headbtn-balance/zh-1280-funded__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/headbtn/en-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/headbtn/ko-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/headbtn/zh-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/item/en-1280-guest__active: 94곳, 가장 큰 차이 9454.25px (svg)
- active/item/ko-1280-guest__active: 94곳, 가장 큰 차이 9454.25px (svg)
- active/item/zh-1280-guest__active: 94곳, 가장 큰 차이 9454.25px (svg)
- active/itemrow/en-1280-guest__active: 94곳, 가장 큰 차이 9454.25px (svg)
- active/itemrow/ko-1280-guest__active: 94곳, 가장 큰 차이 9454.25px (svg)
- active/itemrow/zh-1280-guest__active: 94곳, 가장 큰 차이 9454.25px (svg)
- active/link/en-1280-guest__active: 94곳, 가장 큰 차이 9454.25px (svg)
- active/link/ko-1280-guest__active: 94곳, 가장 큰 차이 9454.25px (svg)
- active/link/zh-1280-guest__active: 94곳, 가장 큰 차이 9454.25px (svg)
- active/logo/en-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/logo/ko-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/logo/zh-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/mainitem/en-1280-guest__active: 71곳, 가장 큰 차이 9454.25px (svg)
- active/mainitem/ko-1280-guest__active: 71곳, 가장 큰 차이 9454.25px (svg)
- active/mainitem/zh-1280-guest__active: 71곳, 가장 큰 차이 9454.25px (svg)
- active/nav-link/en-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/nav-link/ko-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/nav-link/zh-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/open-primary/en-1280-funded__active: 71곳, 가장 큰 차이 9454.25px (svg)
- active/open-primary/ko-1280-funded__active: 71곳, 가장 큰 차이 9454.25px (svg)
- active/open-primary/zh-1280-funded__active: 71곳, 가장 큰 차이 9454.25px (svg)
- active/rvcard/en-1280-guest__active: 34곳, 가장 큰 차이 1415.3px (img)
- active/rvcard/ko-1280-guest__active: 34곳, 가장 큰 차이 1415.3px (img)
- active/rvcard/zh-1280-guest__active: 34곳, 가장 큰 차이 1415.3px (img)
- active/search/en-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/search/ko-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/search/zh-1280-guest__active: 30곳, 가장 큰 차이 2849.25px (svg)
- active/summary/en-1280-guest__active: 94곳, 가장 큰 차이 9454.25px (svg)
- active/summary/ko-1280-guest__active: 94곳, 가장 큰 차이 9454.25px (svg)
- active/summary/zh-1280-guest__active: 94곳, 가장 큰 차이 9454.25px (svg)
- 그 밖에 885건. 전부는 summary.json 에 있다.

## 10. 요소 수의 변화

945건

- active/back/en-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/back/ko-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/back/zh-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/boxcard/en-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/boxcard/ko-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/boxcard/zh-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/btn-quiet/en-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/btn-quiet/ko-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/btn-quiet/zh-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/btn/en-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/btn/ko-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/btn/zh-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/chip-pressed/en-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/chip-pressed/ko-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/chip-pressed/zh-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/chip/en-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/chip/ko-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/chip/zh-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/footer-button/en-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/footer-button/ko-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/footer-button/zh-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/footer-link/en-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/footer-link/ko-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/footer-link/zh-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/headbtn-balance/en-1280-funded__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/headbtn-balance/ko-1280-funded__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/headbtn-balance/zh-1280-funded__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/headbtn/en-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/headbtn/ko-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/headbtn/zh-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/item/en-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/item/ko-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/item/zh-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/itemrow/en-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/itemrow/ko-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/itemrow/zh-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/link/en-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/link/ko-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/link/zh-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/logo/en-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/logo/ko-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/logo/zh-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/mainitem/en-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/mainitem/ko-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/mainitem/zh-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/nav-link/en-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/nav-link/ko-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/nav-link/zh-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/open-primary/en-1280-funded__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/open-primary/ko-1280-funded__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/open-primary/zh-1280-funded__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/rvcard/en-1280-guest__active: .v-chips A[1,1] Bnull; .v-chip A[14,14] Bnull; .v-rvgrid A[1,1] Bnull
- active/rvcard/ko-1280-guest__active: .v-chips A[1,1] Bnull; .v-chip A[14,14] Bnull; .v-rvgrid A[1,1] Bnull
- active/rvcard/zh-1280-guest__active: .v-chips A[1,1] Bnull; .v-chip A[14,14] Bnull; .v-rvgrid A[1,1] Bnull
- active/search/en-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/search/ko-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/search/zh-1280-guest__active: svg A[9,8] B[33,32]; .v-rating Anull B[24,24]
- active/summary/en-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/summary/ko-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- active/summary/zh-1280-guest__active: .v-btn A[1,1] B[2,2]; .v-link A[2,2] B[3,3]; .v-empty A[1,1] Bnull
- 그 밖에 885건. 전부는 summary.json 에 있다.

## 11. 글꼴 차이

861건

- active/back/en-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/back/ko-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/back/zh-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/boxcard/en-1280-guest__active: .v-num
- active/boxcard/ko-1280-guest__active: .v-num
- active/boxcard/zh-1280-guest__active: .v-num
- active/btn-quiet/en-1280-guest__active: .v-num
- active/btn-quiet/ko-1280-guest__active: .v-num
- active/btn-quiet/zh-1280-guest__active: .v-num
- active/btn/en-1280-guest__active: .v-num
- active/btn/ko-1280-guest__active: .v-num
- active/btn/zh-1280-guest__active: .v-num
- active/chip-pressed/en-1280-guest__active: .v-num
- active/chip-pressed/ko-1280-guest__active: .v-num
- active/chip-pressed/zh-1280-guest__active: .v-num
- active/chip/en-1280-guest__active: .v-num
- active/chip/ko-1280-guest__active: .v-num
- active/chip/zh-1280-guest__active: .v-num
- active/footer-button/en-1280-guest__active: .v-num
- active/footer-button/ko-1280-guest__active: .v-num
- active/footer-button/zh-1280-guest__active: .v-num
- active/footer-link/en-1280-guest__active: .v-num
- active/footer-link/ko-1280-guest__active: .v-num
- active/footer-link/zh-1280-guest__active: .v-num
- active/headbtn/en-1280-guest__active: .v-num
- active/headbtn/ko-1280-guest__active: .v-num
- active/headbtn/zh-1280-guest__active: .v-num
- active/item/en-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/item/ko-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/item/zh-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/itemrow/en-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/itemrow/ko-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/itemrow/zh-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/link/en-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/link/ko-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/link/zh-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/logo/en-1280-guest__active: .v-num
- active/logo/ko-1280-guest__active: .v-num
- active/logo/zh-1280-guest__active: .v-num
- active/mainitem/en-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/mainitem/ko-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/mainitem/zh-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/nav-link/en-1280-guest__active: .v-num
- active/nav-link/ko-1280-guest__active: .v-num
- active/nav-link/zh-1280-guest__active: .v-num
- active/open-primary/en-1280-funded__active: .v-btn, .v-empty, .v-btn--quiet
- active/open-primary/ko-1280-funded__active: .v-btn, .v-empty, .v-btn--quiet
- active/open-primary/zh-1280-funded__active: .v-btn, .v-empty, .v-btn--quiet
- active/rvcard/en-1280-guest__active: .v-card-title, .v-chip, .v-btn, .v-btn--quiet
- active/rvcard/ko-1280-guest__active: .v-card-title, .v-chip, .v-btn, .v-btn--quiet
- active/rvcard/zh-1280-guest__active: .v-card-title, .v-chip, .v-btn, .v-btn--quiet
- active/search/en-1280-guest__active: .v-num
- active/search/ko-1280-guest__active: .v-num
- active/search/zh-1280-guest__active: .v-num
- active/summary/en-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/summary/ko-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- active/summary/zh-1280-guest__active: .v-num, .v-btn, .v-empty, .v-btn--quiet
- empty/reviews-box/en-1440-guest__first: .v-empty, .v-small, .v-num, .v-btn, .v-btn--quiet
- empty/reviews-box/en-390-guest__first: .v-empty, .v-small, .v-num, .v-btn, .v-btn--quiet
- empty/reviews-box/ko-1440-guest__first: .v-empty, .v-small, .v-num, .v-btn, .v-btn--quiet
- 그 밖에 801건. 전부는 summary.json 에 있다.

## 12. 콘솔과 요청 기록의 차이

없음.


## 13. 그 밖의 구조 차이(주소, 응답 상태, 문서 높이, 겹침 화면, 그림 수)

945건

- active/back/en-1280-guest__active: docHeight {"a":10399,"b":11531}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/back/ko-1280-guest__active: docHeight {"a":10399,"b":11531}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/back/zh-1280-guest__active: docHeight {"a":10399,"b":11531}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/boxcard/en-1280-guest__active: docHeight {"a":4603,"b":4803}; scrollY {"a":234,"b":259}
- active/boxcard/ko-1280-guest__active: docHeight {"a":4603,"b":4803}; scrollY {"a":234,"b":259}
- active/boxcard/zh-1280-guest__active: docHeight {"a":4603,"b":4803}; scrollY {"a":234,"b":259}
- active/btn-quiet/en-1280-guest__active: docHeight {"a":4603,"b":4803}; scrollY {"a":3299,"b":3499}
- active/btn-quiet/ko-1280-guest__active: docHeight {"a":4603,"b":4803}; scrollY {"a":3299,"b":3499}
- active/btn-quiet/zh-1280-guest__active: docHeight {"a":4603,"b":4803}; scrollY {"a":3299,"b":3499}
- active/btn/en-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/btn/ko-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/btn/zh-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/chip-pressed/en-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/chip-pressed/ko-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/chip-pressed/zh-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/chip/en-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/chip/ko-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/chip/zh-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/footer-button/en-1280-guest__active: docHeight {"a":4603,"b":4803}; scrollY {"a":3643,"b":3843}
- active/footer-button/ko-1280-guest__active: docHeight {"a":4603,"b":4803}; scrollY {"a":3643,"b":3843}
- active/footer-button/zh-1280-guest__active: docHeight {"a":4603,"b":4803}; scrollY {"a":3643,"b":3843}
- active/footer-link/en-1280-guest__active: docHeight {"a":4603,"b":4803}; scrollY {"a":3567,"b":3767}
- active/footer-link/ko-1280-guest__active: docHeight {"a":4603,"b":4803}; scrollY {"a":3567,"b":3767}
- active/footer-link/zh-1280-guest__active: docHeight {"a":4603,"b":4803}; scrollY {"a":3567,"b":3767}
- active/headbtn-balance/en-1280-funded__active: docHeight {"a":4603,"b":4803}
- active/headbtn-balance/ko-1280-funded__active: docHeight {"a":4603,"b":4803}
- active/headbtn-balance/zh-1280-funded__active: docHeight {"a":4603,"b":4803}
- active/headbtn/en-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/headbtn/ko-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/headbtn/zh-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/item/en-1280-guest__active: docHeight {"a":10399,"b":11531}; scrollY {"a":1764,"b":2897}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/item/ko-1280-guest__active: docHeight {"a":10399,"b":11531}; scrollY {"a":1764,"b":2897}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/item/zh-1280-guest__active: docHeight {"a":10399,"b":11531}; scrollY {"a":1764,"b":2897}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/itemrow/en-1280-guest__active: docHeight {"a":10399,"b":11531}; scrollY {"a":605,"b":1737}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/itemrow/ko-1280-guest__active: docHeight {"a":10399,"b":11531}; scrollY {"a":605,"b":1737}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/itemrow/zh-1280-guest__active: docHeight {"a":10399,"b":11531}; scrollY {"a":605,"b":1737}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/link/en-1280-guest__active: docHeight {"a":10399,"b":11531}; scrollY {"a":425,"b":1558}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/link/ko-1280-guest__active: docHeight {"a":10399,"b":11531}; scrollY {"a":425,"b":1558}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/link/zh-1280-guest__active: docHeight {"a":10399,"b":11531}; scrollY {"a":425,"b":1558}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/logo/en-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/logo/ko-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/logo/zh-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/mainitem/en-1280-guest__active: docHeight {"a":10399,"b":11531}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/mainitem/ko-1280-guest__active: docHeight {"a":10399,"b":11531}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/mainitem/zh-1280-guest__active: docHeight {"a":10399,"b":11531}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/nav-link/en-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/nav-link/ko-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/nav-link/zh-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/open-primary/en-1280-funded__active: docHeight {"a":10399,"b":11531}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/open-primary/ko-1280-funded__active: docHeight {"a":10399,"b":11531}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/open-primary/zh-1280-funded__active: docHeight {"a":10399,"b":11531}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/rvcard/en-1280-guest__active: docHeight {"a":4279,"b":3305}; scrollY {"a":33,"b":0}; imageCount {"a":[26,0,26],"b":[5,0,5],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/rvcard/ko-1280-guest__active: docHeight {"a":4257,"b":3305}; scrollY {"a":33,"b":0}; imageCount {"a":[26,0,26],"b":[5,0,5],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/rvcard/zh-1280-guest__active: docHeight {"a":4235,"b":3305}; scrollY {"a":33,"b":0}; imageCount {"a":[26,0,26],"b":[5,0,5],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/search/en-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/search/ko-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/search/zh-1280-guest__active: docHeight {"a":4603,"b":4803}
- active/summary/en-1280-guest__active: docHeight {"a":10399,"b":11531}; scrollY {"a":9026,"b":10159}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/summary/ko-1280-guest__active: docHeight {"a":10399,"b":11531}; scrollY {"a":9026,"b":10159}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- active/summary/zh-1280-guest__active: docHeight {"a":10399,"b":11531}; scrollY {"a":9026,"b":10159}; imageCount {"a":[13,0,12],"b":[14,0,13],"note":"[전체, 주소 없음, lazy 로 적힌 수]"}
- 그 밖에 885건. 전부는 summary.json 에 있다.

## 14. 사람이 볼 목록

solid 비율이 0.0100% 를 넘거나 구조 차이가 하나라도 있는 촬영 전부. 975건. solid 비율이 큰 순서.

| 촬영 | 종류 | solid | aa | exact | 다른 띠(세로 구간) | 구조 차이 |
|---|---|---|---|---|---|---|
| route/reviews/ko-1024-guest__full | structure | 1854961 (55.9619%) | 0 | 2636587 | 194~439, 457~881, 896~2577, 2609~3236 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-1024-guest__full | structure | 1823464 (55.0116%) | 0 | 2612795 | 194~439, 457~881, 896~2599, 2625~3236 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-1024-guest__full | structure | 1819326 (54.8868%) | 0 | 2614856 | 194~441, 457~881, 896~1746, 1760~2599 외 1 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| focus/rvcard/zh-1280-guest__focus | structure | 34057 (52.5231%) | 0 | 55219 | 0~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| focus/rvcard/en-1280-guest__focus | structure | 34015 (52.4583%) | 0 | 55288 | 0~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| focus/rvcard/ko-1280-guest__focus | structure | 33963 (52.3781%) | 0 | 55257 | 0~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-360-guest__full | structure | 3832364 (51.9595%) | 0 | 5716109 | 366~858, 892~1741, 1779~3441, 3470~4271 외 5 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| active/rvcard/zh-1280-guest__active | structure | 33466 (51.6116%) | 0 | 55053 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| hover/rvcard/zh-1280-guest__hover | structure | 33466 (51.6116%) | 0 | 55053 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| active/rvcard/en-1280-guest__active | structure | 33430 (51.5561%) | 0 | 55122 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| hover/rvcard/en-1280-guest__hover | structure | 33430 (51.5561%) | 0 | 55122 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-360-guest__full | structure | 3816683 (51.5055%) | 0 | 5706244 | 414~905, 940~1789, 1827~3489, 3518~4319 외 5 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| active/rvcard/ko-1280-guest__active | structure | 33381 (51.4805%) | 0 | 55091 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| hover/rvcard/ko-1280-guest__hover | structure | 33381 (51.4805%) | 0 | 55091 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| hover/rvcard/zh-1280-guest__rest | structure | 33371 (51.4651%) | 0 | 55053 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| hover/rvcard/en-1280-guest__rest | structure | 33329 (51.4003%) | 0 | 55122 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| hover/rvcard/ko-1280-guest__rest | structure | 33280 (51.3248%) | 0 | 55091 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-1280-guest__full | structure | 2152872 (50.8905%) | 0 | 2987103 | 194~441, 458~2076, 2092~2481, 2509~3304 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-430-guest__full | structure | 4391653 (50.8420%) | 0 | 6847779 | 366~858, 892~919, 934~1840, 1873~2766 외 10 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-430-guest__full | structure | 4407685 (50.7950%) | 0 | 6878609 | 366~857, 892~919, 934~1839, 1873~2766 외 9 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-360-guest__full | structure | 3777798 (50.7736%) | 0 | 5695760 | 414~908, 940~1789, 1827~3489, 3518~4319 외 5 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-1280-guest__full | structure | 2147786 (50.7703%) | 0 | 2981900 | 194~439, 457~2075, 2092~2459, 2488~3304 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-430-guest__full | structure | 4402761 (50.4980%) | 0 | 6888684 | 414~908, 940~967, 982~1890, 1921~2814 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-320-guest__full | structure | 3359830 (50.1887%) | 0 | 5054757 | 414~905, 940~2515, 2573~4119, 4164~7445 외 5 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-1280-guest__full | structure | 2118510 (50.0782%) | 0 | 2953301 | 194~439, 457~2047, 2063~2437, 2466~3284 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-320-guest__full | structure | 3375587 (50.0034%) | 0 | 5079526 | 414~908, 940~2515, 2573~4119, 4164~7415 외 7 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-768-guest__full | structure | 1787058 (49.4244%) | 0 | 2767621 | 194~439, 458~889, 919~1343, 1370~4020 외 2 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-390-guest__full | structure | 3906076 (49.2699%) | 0 | 6054944 | 366~858, 892~1714, 1730~1753, 1815~2665 외 8 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/zh-390-funded__full | structure | 3906076 (49.2699%) | 0 | 6054944 | 366~858, 892~1714, 1730~1753, 1815~2665 외 8 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-768-guest__full | structure | 1795114 (49.2082%) | 0 | 2790933 | 194~441, 458~889, 919~1343, 1370~1806 외 5 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-768-guest__full | structure | 1778254 (49.1809%) | 0 | 2763618 | 194~439, 458~889, 919~1343, 1370~4020 외 2 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-390-guest__full | structure | 3893625 (48.8820%) | 0 | 6040187 | 414~905, 940~1761, 1778~1801, 1864~2713 외 8 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/ko-390-funded__full | structure | 3893625 (48.8820%) | 0 | 6040187 | 414~905, 940~1761, 1778~1801, 1864~2713 외 8 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-390-guest__full | structure | 3923633 (48.8284%) | 0 | 6106254 | 414~908, 940~1761, 1778~1801, 1864~2713 외 7 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/en-390-funded__full | structure | 3923633 (48.8284%) | 0 | 6106254 | 414~908, 940~1761, 1778~1801, 1864~2713 외 7 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-320-guest__full | structure | 3323209 (47.8489%) | 0 | 5013480 | 366~858, 892~2467, 2525~4071, 4115~4873 외 7 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-1440-guest__full | structure | 2200916 (45.6515%) | 0 | 3034620 | 194~441, 458~2076, 2092~2481, 2509~3328 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/en-1440-funded__full | structure | 2200916 (45.6515%) | 0 | 3034620 | 194~441, 458~2076, 2092~2481, 2509~3328 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-1440-guest__full | structure | 2171288 (45.0370%) | 0 | 3007212 | 194~439, 457~2075, 2092~2459, 2488~3316 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/ko-1440-funded__full | structure | 2171288 (45.0370%) | 0 | 3007212 | 194~439, 457~2075, 2092~2459, 2488~3316 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-1440-guest__full | structure | 2143596 (44.4626%) | 0 | 2981008 | 194~439, 457~2047, 2063~2437, 2466~3343 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/zh-1440-funded__full | structure | 2143596 (44.4626%) | 0 | 2981008 | 194~439, 457~2047, 2063~2437, 2466~3343 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-430-guest__first | structure | 603139 (37.6247%) | 0 | 911899 | 366~858, 892~919, 934~1840 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-430-guest__first | structure | 599250 (37.3821%) | 0 | 909816 | 366~857, 892~919, 934~1839 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-320-guest__full | structure | 5520723 (37.2105%) | 0 | 10889429 | 346~379, 418~809, 1136~1369, 1401~1426 외 41 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-430-guest__first | structure | 593038 (36.9946%) | 0 | 878679 | 414~908, 940~967, 982~1851 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-320-guest__full | structure | 5484546 (36.8680%) | 0 | 10786496 | 347~379, 418~769, 1136~1423, 1440~1479 외 24 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-360-guest__first | structure | 424574 (36.8554%) | 0 | 624316 | 366~858, 892~1599 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/box-krw/zh-390-inventory+bigKrw__full | structure | 7257957 (36.8051%) | 0 | 14951060 | 346~379, 430~934, 957~997, 1062~1093 외 23 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/currency-box/zh-390-funded__krw-full | structure | 7257957 (36.8051%) | 0 | 14951060 | 346~379, 430~934, 957~997, 1062~1093 외 23 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-320-guest__full | structure | 5533117 (36.7893%) | 0 | 10877858 | 349~379, 418~769, 1136~1423, 1443~1482 외 23 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-390-guest__first | structure | 483879 (36.7510%) | 0 | 722652 | 366~858, 892~1687 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/zh-390-funded__first | structure | 483879 (36.7510%) | 0 | 722652 | 366~858, 892~1687 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-watch-rolex/zh-390-funded__full | structure | 7244294 (36.7358%) | 0 | 14922540 | 346~379, 430~934, 957~997, 1062~1093 외 23 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-768-guest__first | structure | 287297 (36.5317%) | 0 | 466766 | 194~439, 458~889, 919~1023 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-390-guest__full | structure | 7200297 (36.5127%) | 0 | 14878170 | 346~379, 430~934, 957~997, 1062~1093 외 23 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-768-guest__first | structure | 285956 (36.3612%) | 0 | 466411 | 194~441, 458~889, 919~1023 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-390-guest__first | structure | 477881 (36.2955%) | 0 | 708851 | 414~905, 940~1687 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/ko-390-funded__first | structure | 477881 (36.2955%) | 0 | 708851 | 414~905, 940~1687 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-768-guest__first | structure | 285297 (36.2774%) | 0 | 465362 | 194~439, 458~889, 919~1023 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-390-guest__first | structure | 475922 (36.1467%) | 0 | 710745 | 414~908, 940~1687 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/en-390-funded__first | structure | 475922 (36.1467%) | 0 | 710745 | 414~908, 940~1687 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/box-krw/en-390-inventory+bigKrw__full | structure | 7183091 (36.1084%) | 0 | 14903828 | 349~379, 430~885, 903~934, 956~993 외 32 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/currency-box/en-390-funded__krw-full | structure | 7183091 (36.1084%) | 0 | 14903828 | 349~379, 430~885, 903~934, 956~993 외 32 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-watch-rolex/en-390-funded__full | structure | 7171497 (36.0501%) | 0 | 14878498 | 349~379, 430~885, 900~934, 956~993 외 31 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-390-guest__full | structure | 7127434 (35.8286%) | 0 | 14834128 | 349~379, 430~885, 900~934, 956~993 외 31 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-360-guest__full | structure | 6247849 (35.5726%) | 0 | 12741782 | 346~379, 425~902, 925~965, 1030~1061 외 36 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-360-guest__full | structure | 6236674 (35.5614%) | 0 | 12780803 | 347~379, 425~902, 922~964, 1030~1060 외 39 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-360-guest__full | structure | 6262837 (35.4573%) | 0 | 12857358 | 349~379, 425~853, 868~902, 924~961 외 38 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-1024-guest__first | structure | 277732 (35.3155%) | 0 | 436157 | 194~439, 457~767 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-1280-guest__first | structure | 359535 (35.1108%) | 0 | 523158 | 194~439, 457~799 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-1024-guest__first | structure | 276100 (35.1079%) | 0 | 436205 | 194~441, 457~767 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-1024-guest__first | structure | 276092 (35.1069%) | 0 | 435723 | 194~439, 457~767 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-1280-guest__first | structure | 357636 (34.9254%) | 0 | 522643 | 194~439, 457~799 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-1280-guest__first | structure | 357508 (34.9129%) | 0 | 523250 | 194~441, 458~799 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-1920-guest__full | structure | 2304955 (34.5268%) | 0 | 3148997 | 194~441, 458~2076, 2092~2481, 2509~3443 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/box-krw/ko-390-inventory+bigKrw__full | structure | 6798774 (34.4113%) | 0 | 14228096 | 347~379, 430~934, 954~996, 1062~1092 외 39 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/currency-box/ko-390-funded__krw-full | structure | 6798774 (34.4113%) | 0 | 14228096 | 347~379, 430~934, 954~996, 1062~1092 외 39 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-1920-guest__full | structure | 2289528 (34.2957%) | 0 | 3137541 | 194~439, 457~2075, 2092~2459, 2488~3443 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-watch-rolex/ko-390-funded__full | structure | 6775594 (34.2940%) | 0 | 14166585 | 347~379, 430~934, 954~996, 1062~1092 외 40 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-360-guest__first | structure | 394247 (34.2228%) | 0 | 593294 | 414~908, 940~1599 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-360-guest__first | structure | 392958 (34.1109%) | 0 | 590386 | 414~905, 940~1599 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-1920-guest__full | structure | 2276954 (34.1074%) | 0 | 3122182 | 194~439, 457~2047, 2063~2437, 2466~3443 외 1 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-390-guest__full | structure | 6731526 (34.0709%) | 0 | 14122213 | 347~379, 430~934, 954~996, 1062~1092 외 40 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-430-guest__full | structure | 7630803 (33.3222%) | 0 | 16655788 | 347~379, 438~931, 946~980, 1003~1042 외 21 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-768-guest__full | structure | 2510674 (32.4445%) | 0 | 5575057 | 186~200, 269~655, 675~693, 729~741 외 15 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-1440-guest__first | structure | 417974 (32.2511%) | 0 | 621556 | 194~439, 457~899 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/zh-1440-funded__first | structure | 417974 (32.2511%) | 0 | 621556 | 194~439, 457~899 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-1440-guest__first | structure | 416241 (32.1174%) | 0 | 621041 | 194~439, 457~899 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/ko-1440-funded__first | structure | 416241 (32.1174%) | 0 | 621041 | 194~439, 457~899 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-1440-guest__first | structure | 416112 (32.1074%) | 0 | 621668 | 194~441, 458~899 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/en-1440-funded__first | structure | 416112 (32.1074%) | 0 | 621668 | 194~441, 458~899 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-768-guest__full | structure | 2468998 (32.0395%) | 0 | 5502833 | 184~200, 269~655, 673~695, 728~861 외 15 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-768-guest__full | structure | 2467617 (32.0216%) | 0 | 5520568 | 185~200, 269~655, 674~694, 728~742 외 14 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| empty/reviews-box/en-390-guest__first | structure | 410430 (31.1725%) | 0 | 461859 | 414~501, 558~879, 905~931, 946~965 외 7 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| empty/reviews-box/zh-390-guest__first | structure | 409971 (31.1377%) | 0 | 459897 | 366~453, 510~835, 895~920, 977~1002 외 7 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| empty/reviews-box/ko-390-guest__first | structure | 408697 (31.0409%) | 0 | 457686 | 414~501, 558~879, 902~967, 1026~1049 외 6 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-430-guest__full | structure | 6895453 (30.1178%) | 0 | 15584448 | 349~379, 438~931, 946~980, 1003~1039 외 43 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-430-guest__full | structure | 6633105 (29.0680%) | 0 | 14772885 | 346~379, 438~980, 1003~1043, 1108~1139 외 68 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/en-768-guest__full | structure | 2331858 (28.8290%) | 0 | 3221632 | 186~200, 268~655, 675~693, 729~741 외 127 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-320-guest__first | structure | 209247 (28.7807%) | 0 | 331833 | 366~858, 892~1135 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/zh-768-guest__full | structure | 2314244 (28.7231%) | 0 | 3166827 | 184~200, 268~655, 675~695, 728~861 외 125 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/ko-768-guest__full | structure | 2300665 (28.5545%) | 0 | 3157127 | 185~200, 268~655, 674~694, 728~742 외 127 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/ko-430-guest__full | structure | 4862537 (26.9423%) | 0 | 6779756 | 347~379, 438~909, 946~988, 1054~1084 외 91 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/zh-430-guest__full | structure | 4837332 (26.9207%) | 0 | 6770923 | 346~379, 438~909, 946~989, 1054~1085 외 150 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/en-430-guest__full | structure | 4762433 (26.3952%) | 0 | 6796464 | 349~379, 438~909, 946~985, 1056~1081 외 101 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/ko-390-funded__full | structure | 4258816 (26.2324%) | 0 | 5933015 | 347~379, 430~863, 900~942, 1008~1038 외 152 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| empty/reviews-box/en-1440-guest__first | structure | 338648 (26.1302%) | 0 | 370814 | 194~237, 266~428, 460~469, 500~513 외 5 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| empty/reviews-box/zh-1440-guest__first | structure | 338372 (26.1090%) | 0 | 368444 | 194~237, 266~428, 459~470, 500~511 외 5 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/zh-320-guest__full | structure | 3445875 (26.0988%) | 0 | 4847350 | 346~379, 418~785, 1136~1315, 1347~1372 외 103 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/ko-390-guest__full | structure | 4236451 (26.0947%) | 0 | 5910251 | 347~379, 430~863, 900~942, 1008~1038 외 151 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| empty/reviews-box/ko-1440-guest__first | structure | 337941 (26.0757%) | 0 | 369471 | 194~237, 266~428, 459~470, 500~511 외 5 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/ko-390-insufficient__full | structure | 4232167 (26.0683%) | 0 | 5905955 | 347~379, 430~863, 900~942, 1008~1038 외 151 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/ko-390-zero__full | structure | 4232167 (26.0683%) | 0 | 5905955 | 347~379, 430~863, 900~942, 1008~1038 외 151 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/zh-390-funded__full | structure | 4205967 (25.9668%) | 0 | 5861300 | 346~379, 430~863, 900~943, 1008~1039 외 97 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-320-guest__first | structure | 188675 (25.9511%) | 0 | 303515 | 414~905, 940~1135 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-320-guest__first | structure | 188230 (25.8899%) | 0 | 303694 | 414~908, 940~1135 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/en-390-funded__full | structure | 4236985 (25.8841%) | 0 | 6003019 | 349~379, 430~863, 900~939, 1010~1035 외 97 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/zh-360-guest__full | structure | 3857369 (25.8565%) | 0 | 5435194 | 346~379, 425~831, 868~911, 976~1007 외 96 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/zh-390-guest__full | structure | 4184162 (25.8322%) | 0 | 5838894 | 346~379, 430~863, 900~943, 1008~1039 외 97 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/zh-390-insufficient__full | structure | 4179887 (25.8058%) | 0 | 5834598 | 346~379, 430~863, 900~943, 1008~1039 외 97 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/zh-390-zero__full | structure | 4179887 (25.8058%) | 0 | 5834598 | 346~379, 430~863, 900~943, 1008~1039 외 97 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/en-390-guest__full | structure | 4214567 (25.7471%) | 0 | 5980129 | 349~379, 430~863, 900~939, 1010~1035 외 96 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/en-390-insufficient__full | structure | 4210283 (25.7210%) | 0 | 5975833 | 349~379, 430~863, 900~939, 1010~1035 외 96 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/en-390-zero__full | structure | 4210283 (25.7210%) | 0 | 5975833 | 349~379, 430~863, 900~939, 1010~1035 외 96 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/en-360-guest__full | structure | 3844240 (25.6004%) | 0 | 5481696 | 349~379, 425~831, 868~907, 978~1003 외 94 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/ko-360-guest__full | structure | 3809183 (25.5779%) | 0 | 5334953 | 347~379, 425~831, 868~910, 976~1006 외 93 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/ko-320-guest__full | structure | 3383146 (25.5617%) | 0 | 4740552 | 347~379, 418~785, 1136~1315, 1332~1371 외 100 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/en-320-guest__full | structure | 3429998 (25.5403%) | 0 | 4882141 | 397~427, 466~769, 1136~1363, 1383~1422 외 92 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/home/zh-768-guest__full | structure | 1158254 (25.4153%) | 0 | 2993495 | 993~2192, 2206~2922, 2945~3293, 3323~4260 외 5 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-1920-guest__first | structure | 525054 (25.3209%) | 0 | 798704 | 194~439, 457~1079 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/home/ko-768-guest__full | structure | 1152835 (25.2964%) | 0 | 2994778 | 993~2192, 2206~2922, 2947~3293, 3323~4260 외 6 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/en-768-guest__full | structure | 1158607 (25.2486%) | 0 | 3005633 | 993~2922, 2947~3293, 3323~4260, 4286~4656 외 2 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-1920-guest__first | structure | 523057 (25.2246%) | 0 | 798834 | 194~441, 458~1079 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-1920-guest__first | structure | 523013 (25.2225%) | 0 | 797980 | 194~439, 457~1079 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/zh-390-guest__full | structure | 3901506 (23.6408%) | 0 | 5348494 | 346~379, 406~838, 898~943, 1008~1039 외 108 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/zh-390-firstVisit__full | structure | 3901506 (23.6408%) | 0 | 5348494 | 346~379, 406~838, 898~943, 1008~1039 외 108 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/zh-390-funded__full | structure | 3897231 (23.6149%) | 0 | 5344198 | 346~379, 406~838, 898~943, 1008~1039 외 108 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/zh-390-insufficient__full | structure | 3897231 (23.6149%) | 0 | 5344198 | 346~379, 406~838, 898~943, 1008~1039 외 108 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/zh-430-guest__full | structure | 4298781 (23.5360%) | 0 | 5861270 | 346~379, 410~884, 944~989, 1054~1085 외 110 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/en-430-guest__full | structure | 4293218 (23.4086%) | 0 | 5838367 | 349~379, 410~884, 946~985, 1056~1081 외 113 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/zh-360-guest__full | structure | 3547627 (23.1958%) | 0 | 4948488 | 346~379, 403~806, 829~902, 925~965 외 106 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/en-390-guest__full | structure | 3874095 (23.1746%) | 0 | 5381490 | 349~379, 406~838, 861~885, 900~934 외 108 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/en-390-firstVisit__full | structure | 3874095 (23.1746%) | 0 | 5381490 | 349~379, 406~838, 861~885, 900~934 외 108 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/en-390-funded__full | structure | 3870177 (23.1512%) | 0 | 5377194 | 349~379, 406~838, 861~885, 900~934 외 108 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/en-390-insufficient__full | structure | 3870177 (23.1512%) | 0 | 5377194 | 349~379, 406~838, 861~885, 900~934 외 108 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/ko-390-guest__full | structure | 3809247 (23.0296%) | 0 | 5175496 | 347~379, 406~838, 900~942, 1008~1038 외 186 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/ko-390-firstVisit__full | structure | 3809247 (23.0296%) | 0 | 5175496 | 347~379, 406~838, 900~942, 1008~1038 외 186 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/ko-390-funded__full | structure | 3804963 (23.0037%) | 0 | 5171200 | 347~379, 406~838, 900~942, 1008~1038 외 186 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/ko-390-insufficient__full | structure | 3804963 (23.0037%) | 0 | 5171200 | 347~379, 406~838, 900~942, 1008~1038 외 186 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/zh-320-guest__full | structure | 3113127 (22.9598%) | 0 | 4398572 | 346~379, 398~760, 783~807, 1136~1369 외 104 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/ko-360-guest__full | structure | 3491621 (22.9138%) | 0 | 4835564 | 347~379, 403~806, 829~853, 868~902 외 110 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/en-360-guest__full | structure | 3514089 (22.8732%) | 0 | 4958210 | 349~379, 403~806, 829~853, 868~902 외 107 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/zh-430-guest__first | structure | 366104 (22.8381%) | 0 | 633754 | 346~379, 410~884, 944~989, 1054~1085 외 3 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/ko-430-guest__full | structure | 4176027 (22.7632%) | 0 | 5625402 | 347~379, 410~884, 946~988, 1054~1084 외 187 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/en-768-guest__full | structure | 1804153 (22.7477%) | 0 | 2517234 | 186~200, 235~643, 675~693, 729~741 외 96 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/en-430-guest__first | structure | 364480 (22.7368%) | 0 | 634880 | 349~379, 410~884, 946~985, 1056~1081 외 3 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/ko-430-guest__first | structure | 363209 (22.6575%) | 0 | 629359 | 347~379, 410~884, 946~988, 1054~1084 외 3 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/ko-320-guest__full | structure | 3067788 (22.6019%) | 0 | 4264300 | 347~379, 398~760, 783~807, 1136~1369 외 106 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/zh-768-guest__full | structure | 1782781 (22.5679%) | 0 | 2464456 | 184~200, 235~643, 673~695, 728~861 외 95 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/zh-390-guest__first | structure | 297066 (22.5624%) | 0 | 517053 | 346~379, 406~838, 898~943, 1008~1039 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/zh-390-firstVisit__first | structure | 297066 (22.5624%) | 0 | 517053 | 346~379, 406~838, 898~943, 1008~1039 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/en-320-guest__full | structure | 3089345 (22.4204%) | 0 | 4374607 | 349~379, 398~760, 1136~1369, 1389~1428 외 111 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/ko-390-guest__first | structure | 294787 (22.3893%) | 0 | 514575 | 347~379, 406~838, 900~942, 1008~1038 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/ko-390-firstVisit__first | structure | 294787 (22.3893%) | 0 | 514575 | 347~379, 406~838, 900~942, 1008~1038 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/ko-768-guest__full | structure | 1763037 (22.3179%) | 0 | 2437386 | 185~200, 235~643, 674~694, 728~742 외 96 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| overlay/opening-five/zh-390-zero+balance300__qty-5 | structure | 292791 (22.2377%) | 0 | 512757 | 346~379, 406~838, 898~943, 1008~1039 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/zh-390-funded__first | structure | 292791 (22.2377%) | 0 | 512757 | 346~379, 406~838, 898~943, 1008~1039 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/zh-390-insufficient__first | structure | 292791 (22.2377%) | 0 | 512757 | 346~379, 406~838, 898~943, 1008~1039 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-1280-guest__full | structure | 2753147 (22.1399%) | 0 | 5647999 | 184~200, 264~630, 648~670, 703~895 외 10 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-1280-guest__full | structure | 2751752 (22.1287%) | 0 | 5659485 | 186~200, 264~630, 650~668, 704~716 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-1280-guest__full | structure | 2749361 (22.1095%) | 0 | 5653791 | 185~200, 264~630, 649~669, 703~717 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/opening-five/ko-390-zero+balance300__qty-5 | structure | 290503 (22.0640%) | 0 | 510279 | 347~379, 406~838, 900~942, 1008~1038 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/ko-390-funded__first | structure | 290503 (22.0640%) | 0 | 510279 | 347~379, 406~838, 900~942, 1008~1038 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/ko-390-insufficient__first | structure | 290503 (22.0640%) | 0 | 510279 | 347~379, 406~838, 900~942, 1008~1038 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| overlay/opening-five/zh-390-zero+balance300__result-full | structure | 3604440 (21.8408%) | 0 | 4831441 | 1688~1975, 1998~2232, 2251~2439, 2460~4506 외 103 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| long/box-krw/zh-390-inventory+bigKrw__first | structure | 286143 (21.7328%) | 0 | 524115 | 346~379, 430~934, 957~997, 1062~1093 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/currency-box/zh-390-funded__krw | structure | 286143 (21.7328%) | 0 | 524115 | 346~379, 430~934, 957~997, 1062~1093 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/balance/zh-390-inventory+big__box | structure | 285096 (21.6533%) | 0 | 522235 | 346~379, 430~934, 957~997, 1062~1093 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-watch-rolex/zh-390-funded__first | structure | 285096 (21.6533%) | 0 | 522235 | 346~379, 430~934, 957~997, 1062~1093 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/opening-five/en-390-zero+balance300__result-full | structure | 3616944 (21.6364%) | 0 | 4903563 | 1688~2077, 2094~2541, 2562~4602, 4622~4713 외 101 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| long/box-krw/en-390-inventory+bigKrw__first | structure | 284554 (21.6121%) | 0 | 525805 | 349~379, 430~885, 903~934, 956~993 외 2 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/currency-box/en-390-funded__krw | structure | 284554 (21.6121%) | 0 | 525805 | 349~379, 430~885, 903~934, 956~993 외 2 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/balance/en-390-inventory+big__box | structure | 284393 (21.5999%) | 0 | 524793 | 349~379, 430~885, 900~934, 956~993 외 2 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-watch-rolex/en-390-funded__first | structure | 284393 (21.5999%) | 0 | 524793 | 349~379, 430~885, 900~934, 956~993 외 2 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/box-krw/ko-390-inventory+bigKrw__first | structure | 284372 (21.5983%) | 0 | 524201 | 347~379, 430~934, 954~996, 1062~1092 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/currency-box/ko-390-funded__krw | structure | 284372 (21.5983%) | 0 | 524201 | 347~379, 430~934, 954~996, 1062~1092 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/balance/ko-390-inventory+big__box | structure | 284223 (21.5870%) | 0 | 523192 | 347~379, 430~934, 954~996, 1062~1092 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-watch-rolex/ko-390-funded__first | structure | 284223 (21.5870%) | 0 | 523192 | 347~379, 430~934, 954~996, 1062~1092 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/home/en-1024-guest__full | structure | 940255 (21.3752%) | 0 | 2373869 | 963~2742, 2762~3088, 3108~3757, 3781~3838 외 1 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/zh-1024-guest__full | structure | 939746 (21.3636%) | 0 | 2360643 | 963~2742, 2762~3088, 3108~3829, 3856~4278 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/ko-1024-guest__full | structure | 935174 (21.2597%) | 0 | 2362532 | 963~2742, 2762~3088, 3108~3829, 3856~4278 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| overlay/opening-five/ko-390-zero+balance300__result-full | structure | 3514484 (21.2475%) | 0 | 4660921 | 1688~1814, 1840~2280, 2306~4506, 4524~4585 외 181 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-430-guest__first | structure | 339509 (21.1791%) | 0 | 625351 | 346~379, 438~980, 1003~1043, 1108~1139 외 2 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-430-guest__first | structure | 338782 (21.1337%) | 0 | 627250 | 347~379, 438~931, 946~980, 1003~1042 외 3 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/zh-390-funded__first | structure | 278095 (21.1216%) | 0 | 531941 | 346~379, 430~863, 900~943, 1008~1039 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-430-guest__first | structure | 337550 (21.0569%) | 0 | 627757 | 349~379, 438~931, 946~980, 1003~1039 외 3 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/en-390-funded__first | structure | 277063 (21.0432%) | 0 | 531031 | 349~379, 430~863, 900~939, 1010~1035 외 2 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/ko-390-funded__first | structure | 276930 (21.0331%) | 0 | 530825 | 347~379, 430~863, 900~942, 1008~1038 외 2 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/box-krw/zh-1440-inventory+bigKrw__full | structure | 2809748 (19.9960%) | 0 | 5709371 | 184~200, 264~630, 648~670, 703~895 외 10 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/currency-box/zh-1440-funded__krw-full | structure | 2809495 (19.9942%) | 0 | 5709381 | 184~200, 264~630, 648~670, 703~895 외 10 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/box-krw/en-1440-inventory+bigKrw__full | structure | 2808663 (19.9883%) | 0 | 5721337 | 186~200, 264~630, 650~668, 704~716 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/currency-box/en-1440-funded__krw-full | structure | 2808115 (19.9844%) | 0 | 5721339 | 186~200, 264~630, 650~668, 704~716 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/box-krw/ko-1440-inventory+bigKrw__full | structure | 2805797 (19.9679%) | 0 | 5714892 | 185~200, 264~630, 649~669, 703~717 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/currency-box/ko-1440-funded__krw-full | structure | 2805258 (19.9641%) | 0 | 5714886 | 185~200, 264~630, 649~669, 703~717 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-1440-guest__full | structure | 2805255 (19.9641%) | 0 | 5702021 | 184~200, 264~630, 648~670, 703~895 외 10 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-watch-rolex/zh-1440-funded__full | structure | 2805255 (19.9641%) | 0 | 5702021 | 184~200, 264~630, 648~670, 703~895 외 10 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-1440-guest__full | structure | 2804133 (19.9561%) | 0 | 5714117 | 186~200, 264~630, 650~668, 704~716 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-watch-rolex/en-1440-funded__full | structure | 2804133 (19.9561%) | 0 | 5714117 | 186~200, 264~630, 650~668, 704~716 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-1440-guest__full | structure | 2801284 (19.9358%) | 0 | 5707735 | 185~200, 264~630, 649~669, 703~717 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-watch-rolex/ko-1440-funded__full | structure | 2801284 (19.9358%) | 0 | 5707735 | 185~200, 264~630, 649~669, 703~717 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/zh-430-guest__first | structure | 314367 (19.6107%) | 0 | 624705 | 346~379, 438~909, 946~989, 1054~1085 외 3 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/home/en-1280-guest__full | structure | 1151984 (19.5522%) | 0 | 2958364 | 995~2572, 2586~2934, 2959~3309, 3337~4085 외 1 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/en-390-guest__first | structure | 257151 (19.5309%) | 0 | 477927 | 349~379, 406~838, 861~885, 900~934 외 3 | docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/en-390-firstVisit__first | structure | 257151 (19.5309%) | 0 | 477927 | 349~379, 406~838, 861~885, 900~934 외 3 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/zh-1280-guest__full | structure | 1150578 (19.5283%) | 0 | 2943981 | 995~2934, 2957~3309, 3337~4085, 4112~4602 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/zh-430-guest__full | structure | 1551510 (19.5247%) | 0 | 3742776 | 1783~2223, 2243~2834, 2850~3503, 3521~4238 외 24 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/en-430-guest__first | structure | 312622 (19.5018%) | 0 | 625573 | 349~379, 438~909, 946~985, 1056~1081 외 3 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/zh-390-guest__first | structure | 256290 (19.4655%) | 0 | 509535 | 346~379, 430~863, 900~943, 1008~1039 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/ko-430-guest__first | structure | 311910 (19.4574%) | 0 | 621314 | 347~379, 438~909, 946~988, 1054~1084 외 3 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/home/ko-1280-guest__full | structure | 1146217 (19.4543%) | 0 | 2954735 | 995~2934, 2958~3309, 3337~4085, 4112~4602 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/en-390-guest__first | structure | 254645 (19.3405%) | 0 | 508141 | 349~379, 430~863, 900~939, 1010~1035 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/ko-390-guest__first | structure | 254565 (19.3344%) | 0 | 508061 | 347~379, 430~863, 900~942, 1008~1038 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/opening-five/en-390-zero+balance300__qty-5 | structure | 253233 (19.2333%) | 0 | 473631 | 349~379, 406~838, 861~885, 900~934 외 3 | docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/en-390-funded__first | structure | 253233 (19.2333%) | 0 | 473631 | 349~379, 406~838, 861~885, 900~934 외 3 | docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/en-390-insufficient__first | structure | 253233 (19.2333%) | 0 | 473631 | 349~379, 406~838, 861~885, 900~934 외 3 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/zh-768-guest__first | structure | 150700 (19.1625%) | 0 | 339698 | 184~200, 235~643, 673~695, 728~861 | docHeight, elementCount, boxMoved, textSet, fonts |
| error/insufficient/zh-390-insufficient__line | structure | 252015 (19.1408%) | 0 | 505239 | 346~379, 430~863, 900~943, 1008~1039 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| error/insufficient/zh-390-insufficient__qty-10 | structure | 252015 (19.1408%) | 0 | 505239 | 346~379, 430~863, 900~943, 1008~1039 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/zh-390-insufficient__first | structure | 252015 (19.1408%) | 0 | 505239 | 346~379, 430~863, 900~943, 1008~1039 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/zh-390-zero__first | structure | 252015 (19.1408%) | 0 | 505239 | 346~379, 430~863, 900~943, 1008~1039 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/en-768-guest__first | structure | 150206 (19.0997%) | 0 | 339901 | 186~200, 235~643, 675~693, 729~741 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/ko-430-guest__full | structure | 1522954 (19.0704%) | 0 | 3722477 | 1783~2221, 2245~2834, 2850~3297, 3314~3503 외 26 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/ko-768-guest__first | structure | 149922 (19.0636%) | 0 | 339778 | 185~200, 235~643, 674~694, 728~742 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| error/insufficient/en-390-insufficient__line | structure | 250361 (19.0151%) | 0 | 503845 | 349~379, 430~863, 900~939, 1010~1035 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| error/insufficient/en-390-insufficient__qty-10 | structure | 250361 (19.0151%) | 0 | 503845 | 349~379, 430~863, 900~939, 1010~1035 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/en-390-insufficient__first | structure | 250361 (19.0151%) | 0 | 503845 | 349~379, 430~863, 900~939, 1010~1035 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/en-390-zero__first | structure | 250361 (19.0151%) | 0 | 503845 | 349~379, 430~863, 900~939, 1010~1035 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| error/insufficient/ko-390-insufficient__line | structure | 250281 (19.0091%) | 0 | 503765 | 347~379, 430~863, 900~942, 1008~1038 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| error/insufficient/ko-390-insufficient__qty-10 | structure | 250281 (19.0091%) | 0 | 503765 | 347~379, 430~863, 900~942, 1008~1038 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/ko-390-insufficient__first | structure | 250281 (19.0091%) | 0 | 503765 | 347~379, 430~863, 900~942, 1008~1038 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/ko-390-zero__first | structure | 250281 (19.0091%) | 0 | 503765 | 347~379, 430~863, 900~942, 1008~1038 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/home/en-430-guest__full | structure | 1520471 (18.8606%) | 0 | 3756549 | 1783~2225, 2245~2834, 2850~3503, 3521~4266 외 27 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| overlay/footer-controls/zh-390-guest__home-krw-full | structure | 1301655 (18.6498%) | 0 | 3122548 | 1754~2163, 2183~3376, 3395~4061, 4077~6019 외 21 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| overlay/footer-controls/ko-390-guest__home-krw-full | structure | 1290106 (18.5757%) | 0 | 3128117 | 1754~2161, 2185~3376, 3395~4061, 4077~6019 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/zh-390-guest__full | structure | 1294343 (18.5451%) | 0 | 3102446 | 1753~2163, 2183~3376, 3395~4061, 4077~6019 외 20 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/zh-390-dailyUsed__full | structure | 1294343 (18.5451%) | 0 | 3102446 | 1753~2163, 2183~3376, 3395~4061, 4077~6019 외 20 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/zh-390-firstVisit__full | structure | 1294343 (18.5451%) | 0 | 3102638 | 1753~2163, 2183~3376, 3395~4061, 4077~6019 외 20 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/zh-390-funded__full | structure | 1294343 (18.5451%) | 0 | 3102447 | 1753~2163, 2183~3376, 3395~4061, 4077~6019 외 20 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/zh-390-inventory__full | structure | 1294343 (18.5451%) | 0 | 3102446 | 1753~2163, 2183~3376, 3395~4061, 4077~6019 외 20 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/zh-390-zero__full | structure | 1294343 (18.5451%) | 0 | 3102446 | 1753~2163, 2183~3376, 3395~4061, 4077~6019 외 20 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| route/home/ko-390-guest__full | structure | 1283731 (18.4839%) | 0 | 3109052 | 1753~2161, 2185~3376, 3395~4061, 4077~6019 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/ko-390-dailyUsed__full | structure | 1283731 (18.4839%) | 0 | 3109236 | 1753~2161, 2185~3376, 3395~4061, 4077~6019 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/ko-390-firstVisit__full | structure | 1283731 (18.4839%) | 0 | 3109046 | 1753~2161, 2185~3376, 3395~4061, 4077~6019 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/ko-390-funded__full | structure | 1283731 (18.4839%) | 0 | 3109044 | 1753~2161, 2185~3376, 3395~4061, 4077~6019 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/ko-390-zero__full | structure | 1283731 (18.4839%) | 0 | 3109044 | 1753~2161, 2185~3376, 3395~4061, 4077~6019 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/ko-390-inventory__full | structure | 1283717 (18.4837%) | 0 | 3109052 | 1753~2161, 2185~3376, 3395~4061, 4077~6019 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| overlay/odds/zh-390-guest__tables | structure | 5134664 (18.4560%) | 0 | 7716192 | 346~379, 430~863, 900~943, 1008~1039 외 193 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/odds/ko-390-guest__tables | structure | 5110547 (18.3447%) | 0 | 7641684 | 347~379, 430~863, 900~942, 1008~1038 외 178 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-1024-guest__full | structure | 1651207 (18.3260%) | 0 | 2955994 | 184~200, 251~558, 576~598, 631~823 외 43 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-390-guest__first | structure | 241099 (18.3117%) | 0 | 477865 | 346~379, 430~934, 957~997, 1062~1093 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-1024-guest__full | structure | 1648305 (18.2938%) | 0 | 2968928 | 185~200, 251~558, 577~597, 631~645 외 44 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/odds/en-390-guest__tables | structure | 5130184 (18.2841%) | 0 | 7882331 | 349~379, 430~863, 900~939, 1010~1035 외 197 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-1024-guest__full | structure | 1647300 (18.2827%) | 0 | 2970847 | 186~200, 251~558, 578~596, 632~644 외 48 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-390-guest__first | structure | 240330 (18.2533%) | 0 | 480423 | 349~379, 430~885, 900~934, 956~993 외 2 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-390-guest__first | structure | 240153 (18.2398%) | 0 | 478822 | 347~379, 430~934, 954~996, 1062~1092 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/home/zh-360-guest__full | structure | 1134402 (18.1893%) | 0 | 2663674 | 1731~2119, 2139~4523, 4545~4933, 4956~5345 외 21 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| overlay/footer-controls/en-390-guest__home-krw-full | structure | 1292242 (18.1499%) | 0 | 3145410 | 1754~2165, 2186~3376, 3395~6065, 6081~7321 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/en-390-firstVisit__full | structure | 1284838 (18.0459%) | 0 | 3261623 | 369~369, 398~586, 1753~2165, 2185~3376 외 24 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/en-390-guest__full | structure | 1283833 (18.0318%) | 0 | 3124802 | 1753~2165, 2185~3376, 3395~6065, 6081~7321 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/en-390-dailyUsed__full | structure | 1283833 (18.0318%) | 0 | 3124610 | 1753~2165, 2185~3376, 3395~6065, 6081~7321 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/en-390-funded__full | structure | 1283833 (18.0318%) | 0 | 3141001 | 1753~2165, 2185~3376, 3395~6065, 6081~7321 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/en-390-inventory__full | structure | 1283833 (18.0318%) | 0 | 3124610 | 1753~2165, 2185~3376, 3395~6065, 6081~7321 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/en-390-zero__full | structure | 1283833 (18.0318%) | 0 | 3124610 | 1753~2165, 2185~3376, 3395~6065, 6081~7321 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| route/home/zh-320-guest__full | structure | 950392 (18.0086%) | 0 | 2178808 | 1665~2023, 2043~6565, 6603~6725, 6751~6776 외 16 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| overlay/footer-controls/en-1440-guest__home-krw-full | structure | 1200958 (17.9509%) | 0 | 3011874 | 995~2572, 2586~2934, 2959~3309, 3337~4085 외 1 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/en-1440-guest__full | structure | 1199814 (17.9338%) | 0 | 3008451 | 995~2572, 2586~2934, 2959~3309, 3337~4085 외 1 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/en-1440-dailyUsed__full | structure | 1199814 (17.9338%) | 0 | 3008451 | 995~2572, 2586~2934, 2959~3309, 3337~4085 외 1 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/en-1440-firstVisit__full | structure | 1199814 (17.9338%) | 0 | 3008451 | 995~2572, 2586~2934, 2959~3309, 3337~4085 외 1 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/en-1440-funded__full | structure | 1199814 (17.9338%) | 0 | 3008451 | 995~2572, 2586~2934, 2959~3309, 3337~4085 외 1 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/en-1440-inventory__full | structure | 1199814 (17.9338%) | 0 | 3008451 | 995~2572, 2586~2934, 2959~3309, 3337~4085 외 1 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/en-1440-zero__full | structure | 1199814 (17.9338%) | 0 | 3008451 | 995~2572, 2586~2934, 2959~3309, 3337~4085 외 1 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| overlay/footer-controls/zh-1440-guest__home-krw-full | structure | 1199490 (17.9290%) | 0 | 2997383 | 995~2934, 2957~3309, 3337~4085, 4112~4645 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/zh-1440-dailyUsed__full | structure | 1198416 (17.9129%) | 0 | 2994184 | 995~2934, 2957~3309, 3337~4085, 4112~4645 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/zh-1440-firstVisit__full | structure | 1198416 (17.9129%) | 0 | 2994036 | 995~2934, 2957~3309, 3337~4085, 4112~4645 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/zh-1440-funded__full | structure | 1198416 (17.9129%) | 0 | 2994184 | 995~2934, 2957~3309, 3337~4085, 4112~4645 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/zh-1440-inventory__full | structure | 1198416 (17.9129%) | 0 | 2994184 | 995~2934, 2957~3309, 3337~4085, 4112~4645 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/zh-1440-zero__full | structure | 1198416 (17.9129%) | 0 | 2994036 | 995~2934, 2957~3309, 3337~4085, 4112~4645 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| route/home/zh-1440-guest__full | structure | 1198375 (17.9123%) | 0 | 2994038 | 995~2934, 2957~3309, 3337~4085, 4112~4645 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/en-1280-guest__full | structure | 2383836 (17.9091%) | 0 | 3187293 | 186~200, 264~630, 650~668, 704~716 외 133 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/zh-1280-guest__full | structure | 2380505 (17.8841%) | 0 | 3145804 | 184~200, 264~630, 650~670, 703~895 외 132 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/home/en-360-guest__full | structure | 1155707 (17.8827%) | 0 | 2764598 | 1731~2121, 2138~2171, 2185~4613, 4635~5070 외 28 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/ko-360-guest__full | structure | 1120414 (17.8701%) | 0 | 2663706 | 1731~2117, 2135~2167, 2185~4613, 4635~5023 외 26 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| overlay/footer-controls/ko-1440-guest__home-krw-full | structure | 1195222 (17.8652%) | 0 | 2999331 | 995~2934, 2958~3309, 3337~4085, 4112~4645 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/ko-1440-guest__full | structure | 1194047 (17.8476%) | 0 | 2995874 | 995~2934, 2958~3309, 3337~4085, 4112~4645 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/ko-1440-dailyUsed__full | structure | 1194047 (17.8476%) | 0 | 2996025 | 995~2934, 2958~3309, 3337~4085, 4112~4645 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/ko-1440-firstVisit__full | structure | 1194047 (17.8476%) | 0 | 2995874 | 995~2934, 2958~3309, 3337~4085, 4112~4645 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/ko-1440-funded__full | structure | 1194047 (17.8476%) | 0 | 2995874 | 995~2934, 2958~3309, 3337~4085, 4112~4645 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/ko-1440-inventory__full | structure | 1194047 (17.8476%) | 0 | 2995874 | 995~2934, 2958~3309, 3337~4085, 4112~4645 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/ko-1440-zero__full | structure | 1194047 (17.8476%) | 0 | 2995874 | 995~2934, 2958~3309, 3337~4085, 4112~4645 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |

그 밖에 675건. 전부는 summary.json 에 있다.

## 15. 따로 분류한 미세 차이(가장자리 다듬기, 문턱 아래의 색 차이)

72건. 구조 차이가 없고 solid 비율이 문턱 아래인 것. 다른 픽셀이 많은 순서로 30건.

| 촬영 | 종류 | exact | aa | solid |
|---|---|---|---|---|
| route/legal-policy/en-430-guest__full | sub-threshold | 256 (0.0050%) | 0 | 0 |
| route/legal-refunds/ko-1920-guest__full | sub-threshold | 139 (0.0025%) | 0 | 0 |
| route/legal-refunds/zh-1920-guest__full | sub-threshold | 139 (0.0027%) | 0 | 0 |
| route/legal-privacy/ko-390-guest__full | sub-threshold | 116 (0.0017%) | 0 | 0 |
| route/legal-safety/en-390-guest__full | sub-threshold | 116 (0.0025%) | 0 | 0 |
| route/legal-terms/ko-390-guest__full | sub-threshold | 116 (0.0019%) | 0 | 0 |
| long/inventory/zh-390-inventory+big__full | sub-threshold | 110 (0.0038%) | 0 | 0 |
| route/legal-faq/en-390-guest__full | sub-threshold | 105 (0.0025%) | 0 | 0 |
| route/legal-policy/en-390-guest__full | sub-threshold | 105 (0.0021%) | 0 | 0 |
| route/legal-withdrawals/en-390-guest__full | sub-threshold | 105 (0.0021%) | 0 | 0 |
| state/verify/en-390-inventory__full | sub-threshold | 105 (0.0025%) | 0 | 0 |
| route/legal-cookies/en-390-guest__full | sub-threshold | 104 (0.0024%) | 0 | 0 |
| route/legal-faq/zh-390-guest__full | sub-threshold | 104 (0.0028%) | 0 | 0 |
| route/legal-refunds/en-390-guest__full | sub-threshold | 104 (0.0016%) | 0 | 0 |
| state/account/zh-390-pending__full | sub-threshold | 104 (0.0032%) | 0 | 0 |
| route/legal-privacy/ko-1920-guest__full | sub-threshold | 97 (0.0015%) | 0 | 0 |
| long/account/en-390-funded+big__full | sub-threshold | 88 (0.0026%) | 0 | 0 |
| route/legal-faq/ko-390-guest__full | sub-threshold | 88 (0.0023%) | 0 | 0 |
| route/legal-privacy/zh-430-guest__full | sub-threshold | 71 (0.0012%) | 0 | 0 |
| route/legal-safety/ko-320-guest__full | sub-threshold | 69 (0.0018%) | 0 | 0 |
| route/legal-cookies/zh-430-guest__full | sub-threshold | 66 (0.0017%) | 0 | 0 |
| route/legal-terms/zh-430-guest__full | sub-threshold | 66 (0.0011%) | 0 | 0 |
| route/legal-withdrawals/en-430-guest__full | sub-threshold | 66 (0.0012%) | 0 | 0 |
| route/legal-policy/zh-430-guest__full | sub-threshold | 65 (0.0015%) | 0 | 0 |
| route/about/ko-430-guest__full | sub-threshold | 63 (0.0019%) | 0 | 0 |
| route/account/en-430-guest__full | sub-threshold | 63 (0.0019%) | 0 | 0 |
| route/community-board/ko-430-guest__full | sub-threshold | 63 (0.0019%) | 0 | 0 |
| route/legal-business/en-430-guest__full | sub-threshold | 57 (0.0013%) | 0 | 0 |
| route/legal-complaints/ko-430-guest__full | sub-threshold | 57 (0.0014%) | 0 | 0 |
| route/legal-fairness/en-430-guest__full | sub-threshold | 57 (0.0013%) | 0 | 0 |

## 15-1. 두 쪽에 똑같이 있는 것(차이는 아니지만 알아 둘 것)

- 콘솔 오류가 같은 내용으로 있는 촬영: 12건. 예: "Failed to load resource: the server responded with a status of 404"
- 400 이상의 응답이 같은 내용으로 있는 촬영: 12건. 예: 404 /en/box/no-such-box/
- 끊은 요청(바깥 주소, GET 이 아닌 요청)이 같은 내용으로 있는 촬영: 0건
- 대체 글꼴의 불림 상태만 다른 촬영(글꼴 파일이 도착한 때의 차이, 그림에는 차이가 없을 수 있다): 0건
- 기다리다 시간이 넘은 것이 적힌 촬영: 0건

## 16. 읽는 법

- 사람이 볼 목록의 항목은 `reshoot.txt` 에 쉼표로 이어 적었다(0개). 두 환경에서 `node shots.mjs <label> <baseUrl> <outDir> --only "$(cat reshoot.txt)"` 로 다시 찍고 이 도구를 다시 돌린다. 한 번만 생긴 흔들림은 사라지고, 다시 찍어도 남는 차이만 진짜 차이다.
- 차이 그림은 이 폴더의 `<촬영 id>.diff.png` 다. 빨강은 다른 픽셀, 노랑은 가장자리 다듬기로 본 픽셀, 회색은 A 를 어둡게 깐 것이다.
- 원본 그림과 기록은 위 표의 A, B 폴더에 같은 이름(`.png`, `.json`)으로 있다.
- 긴 그림은 `node tools/crop.mjs` 로 잘라서 본다.
