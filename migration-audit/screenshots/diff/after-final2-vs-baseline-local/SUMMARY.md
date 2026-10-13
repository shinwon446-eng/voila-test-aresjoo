# 촬영 비교 요약

만든 시각: 2026-10-12T20:30:41.172Z

| | A | B |
|---|---|---|
| label | before-local | after-final2 |
| baseUrl | http://127.0.0.1:4183/voila-test-aresjoo | http://127.0.0.1:4187/voila-test-aresjoo |
| chrome | 154.0.8037.98 | 154.0.8037.98 |
| startedAt | 2026-10-12T19:39:04.355Z | 2026-10-12T20:01:18.504Z |
| items | 1689 | 1689 |
| failedItems | 0 | 0 |
| dir | C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local | C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final2 |

이 문서는 통과와 실패를 말하지 않는다. 숫자와 차이의 종류를 적을 뿐이고, 판정은 사람이 아래 목록을 보고 한다.

## 1. 종류별 수

촬영 3282건 (그림을 견준 것 3267건)

| 종류 | 수 | 뜻 |
|---|---|---|
| identical | 2152 | 픽셀이 전부 같고 구조 기록도 같다 |
| structure | 1053 | 구조 기록이 다르다(크기, 자리, 줄바꿈, 요소 수, 글, 그림, 글꼴 등) |
| sub-threshold | 62 | 값이 다른 픽셀이 있으나 눈에 띄는 차이(threshold 0.1)는 없다 |
| both-not-applicable | 9 | 두 쪽 모두 해당 없음(고른 요소가 그 폭에 없다) |
| one-side-only | 6 | 한쪽에서만 찍혔다 |

### 묶음별

| 묶음 | 전체 | identical | sub-threshold | aa-only | solid-pixels | structure | 그 밖 |
|---|---|---|---|---|---|---|---|
| active | 69 | 9 | 0 | 0 | 0 | 60 | 0 |
| added | 66 | 6 | 0 | 0 | 0 | 54 | 6 |
| empty | 54 | 42 | 0 | 0 | 0 | 12 | 0 |
| error | 90 | 60 | 0 | 0 | 0 | 30 | 0 |
| extra | 30 | 24 | 0 | 0 | 0 | 6 | 0 |
| focus | 69 | 9 | 0 | 0 | 0 | 60 | 0 |
| hover | 138 | 18 | 0 | 0 | 0 | 120 | 0 |
| loading | 108 | 83 | 1 | 0 | 0 | 24 | 0 |
| long | 96 | 64 | 2 | 0 | 0 | 30 | 0 |
| overlay | 378 | 149 | 1 | 0 | 0 | 219 | 9 |
| route | 1728 | 1409 | 49 | 0 | 0 | 270 | 0 |
| state | 456 | 279 | 9 | 0 | 0 | 168 | 0 |

### 구조 차이의 종류별 촬영 수

| 차이 | 촬영 수 |
|---|---|
| textSet | 1053 |
| boxMoved | 1008 |
| elementCount | 999 |
| docHeight | 975 |
| fonts | 897 |
| imageCount | 477 |
| sizeMismatch | 297 |
| scrollY | 147 |

## 2. 한쪽에만 있는 촬영

6건

- added/wallet-history-open-take/en-1440-funded__row-1: A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok
- added/wallet-history-open-take/en-390-funded__row-1: A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok
- added/wallet-history-open-take/ko-1440-funded__row-1: A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok
- added/wallet-history-open-take/ko-390-funded__row-1: A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok
- added/wallet-history-open-take/zh-1440-funded__row-1: A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok
- added/wallet-history-open-take/zh-390-funded__row-1: A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok

## 3. 두 쪽 모두 찍지 못한 촬영(견주지 못함)

없음.


## 4. 크기 불일치

297건

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
- loading/box-gaming-playstation/en-1440-funded__full: A 1440x10441, B 1440x11574
- loading/box-gaming-playstation/en-390-funded__full: A 780x20986, B 780x23294
- loading/box-gaming-playstation/ko-1440-funded__full: A 1440x10441, B 1440x11574
- loading/box-gaming-playstation/ko-390-funded__full: A 780x20814, B 780x23078
- loading/box-gaming-playstation/zh-1440-funded__full: A 1440x10441, B 1440x11574
- loading/box-gaming-playstation/zh-390-funded__full: A 780x20766, B 780x23078
- loading/home/en-1440-funded__full: A 1440x4646, B 1440x4846
- loading/home/en-390-funded__full: A 780x9172, B 780x9772
- loading/home/ko-1440-funded__full: A 1440x4646, B 1440x4846
- loading/home/ko-390-funded__full: A 780x8904, B 780x9504
- loading/home/zh-1440-funded__full: A 1440x4646, B 1440x4846
- loading/home/zh-390-funded__full: A 780x8948, B 780x9548
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
- 그 밖에 237건. 전부는 summary.json 에 있다.

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

1053건

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
- 그 밖에 993건. 전부는 summary.json 에 있다.

## 9. 자리와 크기가 2px 넘게 다른 요소

1008건

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
- 그 밖에 948건. 전부는 summary.json 에 있다.

## 10. 요소 수의 변화

999건

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
- 그 밖에 939건. 전부는 summary.json 에 있다.

## 11. 글꼴 차이

897건

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
- added/password-flow/en-1440-security__success: .v-num, .v-input, .v-field-label, .v-row dt, .v-row dd, .v-line
- added/password-flow/en-390-security__success: .v-num, .v-input, .v-field-label, .v-row dt, .v-row dd, .v-line
- added/password-flow/ko-1440-security__success: .v-num, .v-input, .v-field-label, .v-row dt, .v-row dd, .v-line
- 그 밖에 837건. 전부는 summary.json 에 있다.

## 12. 콘솔과 요청 기록의 차이

없음.


## 13. 그 밖의 구조 차이(주소, 응답 상태, 문서 높이, 겹침 화면, 그림 수)

975건

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
- 그 밖에 915건. 전부는 summary.json 에 있다.

## 14. 사람이 볼 목록

solid 비율이 0.0100% 를 넘거나 구조 차이가 하나라도 있는 촬영 전부. 1059건. solid 비율이 큰 순서.

| 촬영 | 종류 | solid | aa | exact | 다른 띠(세로 구간) | 구조 차이 |
|---|---|---|---|---|---|---|
| added/wallet-history-open-take/en-1440-funded__row-1 | one-side-only |  |  |  |  | A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok |
| added/wallet-history-open-take/en-390-funded__row-1 | one-side-only |  |  |  |  | A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok |
| added/wallet-history-open-take/ko-1440-funded__row-1 | one-side-only |  |  |  |  | A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok |
| added/wallet-history-open-take/ko-390-funded__row-1 | one-side-only |  |  |  |  | A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok |
| added/wallet-history-open-take/zh-1440-funded__row-1 | one-side-only |  |  |  |  | A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok |
| added/wallet-history-open-take/zh-390-funded__row-1 | one-side-only |  |  |  |  | A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok |
| route/reviews/ko-1024-guest__full | structure | 1854872 (55.9592%) | 0 | 2636499 | 194~439, 457~881, 896~2577, 2609~3236 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-1024-guest__full | structure | 1823433 (55.0107%) | 0 | 2612707 | 194~439, 457~881, 896~2599, 2625~3236 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-1024-guest__full | structure | 1819241 (54.8842%) | 0 | 2614741 | 194~441, 457~881, 896~1746, 1760~2599 외 1 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| focus/rvcard/zh-1280-guest__focus | structure | 34057 (52.5231%) | 0 | 55219 | 0~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| focus/rvcard/en-1280-guest__focus | structure | 34015 (52.4583%) | 0 | 55288 | 0~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| focus/rvcard/ko-1280-guest__focus | structure | 33963 (52.3781%) | 0 | 55257 | 0~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| active/rvcard/zh-1280-guest__active | structure | 33466 (51.6116%) | 0 | 55053 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| hover/rvcard/zh-1280-guest__hover | structure | 33466 (51.6116%) | 0 | 55053 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| active/rvcard/en-1280-guest__active | structure | 33430 (51.5561%) | 0 | 55122 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| hover/rvcard/en-1280-guest__hover | structure | 33430 (51.5561%) | 0 | 55122 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| active/rvcard/ko-1280-guest__active | structure | 33381 (51.4805%) | 0 | 55091 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| hover/rvcard/ko-1280-guest__hover | structure | 33381 (51.4805%) | 0 | 55091 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| hover/rvcard/zh-1280-guest__rest | structure | 33371 (51.4651%) | 0 | 55053 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| hover/rvcard/en-1280-guest__rest | structure | 33329 (51.4003%) | 0 | 55122 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| hover/rvcard/ko-1280-guest__rest | structure | 33280 (51.3248%) | 0 | 55091 | 0~6, 31~213 | sizeMismatch, docHeight, scrollY, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-360-guest__full | structure | 3745234 (51.0172%) | 0 | 5646970 | 366~858, 892~1741, 1779~3441, 3470~4271 외 4 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-1280-guest__full | structure | 2152549 (50.8829%) | 0 | 2987149 | 194~441, 458~2076, 2092~2481, 2509~3304 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-430-guest__full | structure | 4389182 (50.8134%) | 0 | 6847824 | 366~858, 892~919, 934~1840, 1873~2766 외 10 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-430-guest__full | structure | 4405214 (50.7665%) | 0 | 6878655 | 366~857, 892~919, 934~1839, 1873~2766 외 9 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-1280-guest__full | structure | 2147376 (50.7606%) | 0 | 2981937 | 194~439, 457~2075, 2092~2459, 2488~3304 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-360-guest__full | structure | 3730925 (50.5841%) | 0 | 5632832 | 414~905, 940~1789, 1827~3489, 3518~4319 외 4 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-430-guest__full | structure | 4400321 (50.4700%) | 0 | 6888727 | 414~908, 940~967, 982~1890, 1921~2814 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-1280-guest__full | structure | 2118130 (50.0693%) | 0 | 2953338 | 194~439, 457~2047, 2063~2437, 2466~3284 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-320-guest__full | structure | 3331354 (49.7633%) | 0 | 5041630 | 414~905, 940~2515, 2573~4119, 4164~6637 외 6 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-320-guest__full | structure | 3346350 (49.5703%) | 0 | 5067226 | 414~908, 940~2515, 2573~4119, 4164~6637 외 8 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-768-guest__full | structure | 1786750 (49.4158%) | 0 | 2767565 | 194~439, 458~889, 919~1343, 1370~4020 외 2 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-768-guest__full | structure | 1795054 (49.2065%) | 0 | 2790929 | 194~441, 458~889, 919~1343, 1370~1806 외 5 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-768-guest__full | structure | 1777973 (49.1731%) | 0 | 2763562 | 194~439, 458~889, 919~1343, 1370~4020 외 2 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-390-guest__full | structure | 3875038 (49.1103%) | 0 | 6022788 | 366~858, 892~1714, 1730~1753, 1815~2665 외 7 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/zh-390-funded__full | structure | 3875038 (49.1103%) | 0 | 6022788 | 366~858, 892~1714, 1730~1753, 1815~2665 외 7 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-360-guest__full | structure | 3635741 (49.0924%) | 0 | 5566010 | 414~908, 940~1789, 1827~3489, 3518~4319 외 7 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-390-guest__full | structure | 3860867 (48.6996%) | 0 | 6008453 | 414~905, 940~1761, 1778~1801, 1864~2713 외 7 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/ko-390-funded__full | structure | 3860867 (48.6996%) | 0 | 6008453 | 414~905, 940~1761, 1778~1801, 1864~2713 외 7 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-390-guest__full | structure | 3888576 (48.6186%) | 0 | 6086003 | 414~908, 940~1761, 1778~1801, 1864~2713 외 8 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/en-390-funded__full | structure | 3888576 (48.6186%) | 0 | 6086003 | 414~908, 940~1761, 1778~1801, 1864~2713 외 8 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-320-guest__full | structure | 3340401 (48.0964%) | 0 | 5033642 | 366~858, 892~2467, 2525~4071, 4115~7397 외 5 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-1440-guest__full | structure | 2200593 (45.6449%) | 0 | 3034666 | 194~441, 458~2076, 2092~2481, 2509~3328 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/en-1440-funded__full | structure | 2200593 (45.6449%) | 0 | 3034666 | 194~441, 458~2076, 2092~2481, 2509~3328 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-1440-guest__full | structure | 2170878 (45.0285%) | 0 | 3007249 | 194~439, 457~2075, 2092~2459, 2488~3316 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/ko-1440-funded__full | structure | 2170878 (45.0285%) | 0 | 3007249 | 194~439, 457~2075, 2092~2459, 2488~3316 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-1440-guest__full | structure | 2143216 (44.4547%) | 0 | 2981045 | 194~439, 457~2047, 2063~2437, 2466~3343 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/zh-1440-funded__full | structure | 2143216 (44.4547%) | 0 | 2981045 | 194~439, 457~2047, 2063~2437, 2466~3343 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-430-guest__first | structure | 603139 (37.6247%) | 0 | 911899 | 366~858, 892~919, 934~1840 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-430-guest__first | structure | 599250 (37.3821%) | 0 | 909816 | 366~857, 892~919, 934~1839 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-430-guest__first | structure | 593038 (36.9946%) | 0 | 878679 | 414~908, 940~967, 982~1851 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-360-guest__first | structure | 424574 (36.8554%) | 0 | 624316 | 366~858, 892~1599 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-360-guest__full | structure | 6472782 (36.8532%) | 0 | 13175149 | 346~379, 425~902, 925~965, 1030~1061 외 18 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| added/zero-withdraw/zh-390-funded+zeroWithdraw__row-1 | structure | 485208 (36.8520%) | 0 | 527739 | 532~1242, 1259~1323, 1345~1445, 1464~1639 | elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-360-guest__full | structure | 6461847 (36.8453%) | 0 | 13200901 | 347~379, 425~902, 922~964, 1030~1060 외 25 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/currency-box/zh-390-funded__krw-full | structure | 7258613 (36.8085%) | 0 | 14950987 | 346~379, 430~934, 957~997, 1062~1093 외 23 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/box-krw/zh-390-inventory+bigKrw__full | structure | 7258607 (36.8084%) | 0 | 14950987 | 346~379, 430~934, 957~997, 1062~1093 외 23 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| added/zero-withdraw/ko-390-funded+zeroWithdraw__row-1 | structure | 484031 (36.7626%) | 0 | 527755 | 532~1242, 1260~1323, 1345~1443, 1465~1639 | elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-390-guest__first | structure | 483879 (36.7510%) | 0 | 722652 | 366~858, 892~1687 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/zh-390-funded__first | structure | 483879 (36.7510%) | 0 | 722652 | 366~858, 892~1687 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-watch-rolex/zh-390-funded__full | structure | 7244950 (36.7392%) | 0 | 14922467 | 346~379, 430~934, 957~997, 1062~1093 외 23 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-360-guest__full | structure | 6467417 (36.6155%) | 0 | 13248474 | 349~379, 425~853, 868~902, 924~961 외 24 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| added/zero-withdraw/en-390-funded+zeroWithdraw__row-1 | structure | 481399 (36.5627%) | 0 | 532148 | 532~1242, 1262~1323, 1345~1447, 1467~1639 | elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-768-guest__first | structure | 287297 (36.5317%) | 0 | 466766 | 194~439, 458~889, 919~1023 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-390-guest__full | structure | 7200953 (36.5161%) | 0 | 14878097 | 346~379, 430~934, 957~997, 1062~1093 외 23 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-768-guest__first | structure | 285956 (36.3612%) | 0 | 466411 | 194~441, 458~889, 919~1023 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-390-guest__first | structure | 477881 (36.2955%) | 0 | 708851 | 414~905, 940~1687 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/ko-390-funded__first | structure | 477881 (36.2955%) | 0 | 708851 | 414~905, 940~1687 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-768-guest__first | structure | 285297 (36.2774%) | 0 | 465362 | 194~439, 458~889, 919~1023 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-390-guest__first | structure | 475922 (36.1467%) | 0 | 710745 | 414~908, 940~1687 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/en-390-funded__first | structure | 475922 (36.1467%) | 0 | 710745 | 414~908, 940~1687 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/box-krw/en-390-inventory+bigKrw__full | structure | 7183666 (36.1113%) | 0 | 14903738 | 349~379, 430~885, 903~934, 956~993 외 32 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/currency-box/en-390-funded__krw-full | structure | 7183666 (36.1113%) | 0 | 14903738 | 349~379, 430~885, 903~934, 956~993 외 32 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-watch-rolex/en-390-funded__full | structure | 7172079 (36.0531%) | 0 | 14878408 | 349~379, 430~885, 900~934, 956~993 외 31 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-390-guest__full | structure | 7128016 (35.8316%) | 0 | 14834038 | 349~379, 430~885, 900~934, 956~993 외 31 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-320-guest__full | structure | 5254636 (35.4170%) | 0 | 10380808 | 346~379, 418~809, 1136~1369, 1401~1426 외 21 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-1024-guest__first | structure | 277732 (35.3155%) | 0 | 436157 | 194~439, 457~767 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-1280-guest__first | structure | 359535 (35.1108%) | 0 | 523158 | 194~439, 457~799 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-1024-guest__first | structure | 276100 (35.1079%) | 0 | 436205 | 194~441, 457~767 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-1024-guest__first | structure | 276092 (35.1069%) | 0 | 435723 | 194~439, 457~767 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-320-guest__full | structure | 5217941 (35.0759%) | 0 | 10323162 | 347~379, 418~769, 1136~1423, 1440~1479 외 40 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-1280-guest__first | structure | 357636 (34.9254%) | 0 | 522643 | 194~439, 457~799 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-1280-guest__first | structure | 357508 (34.9129%) | 0 | 523250 | 194~441, 458~799 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-320-guest__full | structure | 5247600 (34.8910%) | 0 | 10379523 | 349~379, 418~769, 1136~1423, 1443~1482 외 43 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-1920-guest__full | structure | 2304632 (34.5220%) | 0 | 3149043 | 194~441, 458~2076, 2092~2481, 2509~3443 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/box-krw/ko-390-inventory+bigKrw__full | structure | 6799438 (34.4146%) | 0 | 14228023 | 347~379, 430~934, 954~996, 1062~1092 외 39 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/currency-box/ko-390-funded__krw-full | structure | 6799438 (34.4146%) | 0 | 14228023 | 347~379, 430~934, 954~996, 1062~1092 외 39 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-watch-rolex/ko-390-funded__full | structure | 6776260 (34.2973%) | 0 | 14166510 | 347~379, 430~934, 954~996, 1062~1092 외 40 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-1920-guest__full | structure | 2289116 (34.2896%) | 0 | 3137574 | 194~439, 457~2075, 2092~2459, 2488~3443 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-360-guest__first | structure | 394247 (34.2228%) | 0 | 593294 | 414~908, 940~1599 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-360-guest__first | structure | 392958 (34.1109%) | 0 | 590386 | 414~905, 940~1599 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-1920-guest__full | structure | 2276574 (34.1017%) | 0 | 3122219 | 194~439, 457~2047, 2063~2437, 2466~3443 외 1 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-390-guest__full | structure | 6732190 (34.0743%) | 0 | 14122140 | 347~379, 430~934, 954~996, 1062~1092 외 40 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-430-guest__full | structure | 7631088 (33.3234%) | 0 | 16655761 | 347~379, 438~931, 946~980, 1003~1042 외 21 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-768-guest__full | structure | 2510829 (32.4465%) | 0 | 5575221 | 186~200, 269~655, 675~693, 729~741 외 15 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-1440-guest__first | structure | 417974 (32.2511%) | 0 | 621556 | 194~439, 457~899 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/zh-1440-funded__first | structure | 417974 (32.2511%) | 0 | 621556 | 194~439, 457~899 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-1440-guest__first | structure | 416241 (32.1174%) | 0 | 621041 | 194~439, 457~899 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/ko-1440-funded__first | structure | 416241 (32.1174%) | 0 | 621041 | 194~439, 457~899 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-1440-guest__first | structure | 416112 (32.1074%) | 0 | 621668 | 194~441, 458~899 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/reviews/en-1440-funded__first | structure | 416112 (32.1074%) | 0 | 621668 | 194~441, 458~899 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-768-guest__full | structure | 2469190 (32.0420%) | 0 | 5503030 | 184~200, 269~655, 673~695, 728~861 외 15 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-768-guest__full | structure | 2467809 (32.0240%) | 0 | 5520765 | 185~200, 269~655, 674~694, 728~742 외 14 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| empty/reviews-box/en-390-guest__first | structure | 411564 (31.2587%) | 0 | 464220 | 414~501, 558~879, 905~931, 946~965 외 7 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| empty/reviews-box/zh-390-guest__first | structure | 411063 (31.2206%) | 0 | 462258 | 366~453, 510~835, 895~920, 977~1002 외 7 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| empty/reviews-box/ko-390-guest__first | structure | 409789 (31.1238%) | 0 | 460047 | 414~501, 558~879, 902~967, 1026~1049 외 6 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-430-guest__full | structure | 6896563 (30.1227%) | 0 | 15584414 | 349~379, 438~931, 946~980, 1003~1039 외 43 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-430-guest__full | structure | 6633509 (29.0698%) | 0 | 14772858 | 346~379, 438~980, 1003~1043, 1108~1139 외 68 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/en-768-guest__full | structure | 2331374 (28.8230%) | 0 | 3221632 | 186~200, 268~655, 675~693, 729~741 외 127 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-320-guest__first | structure | 209247 (28.7807%) | 0 | 331833 | 366~858, 892~1135 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/zh-768-guest__full | structure | 2313792 (28.7175%) | 0 | 3166827 | 184~200, 268~655, 675~695, 728~861 외 125 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/ko-768-guest__full | structure | 2300213 (28.5489%) | 0 | 3157127 | 185~200, 268~655, 674~694, 728~742 외 127 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/ko-430-guest__full | structure | 4799106 (26.5909%) | 0 | 6690460 | 347~379, 438~909, 946~988, 1054~1084 외 156 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/zh-430-guest__full | structure | 4778042 (26.5907%) | 0 | 6731127 | 346~379, 438~909, 946~989, 1054~1085 외 106 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| added/password-flow/zh-390-security__success | structure | 345750 (26.2600%) | 0 | 567356 | 43~70, 164~222, 256~350, 384~426 외 2 | docHeight, elementCount, boxMoved, textSet, fonts |
| loading/box-gaming-playstation/ko-390-funded__full | structure | 4257750 (26.2259%) | 0 | 5933015 | 347~379, 430~863, 900~942, 1008~1038 외 152 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/ko-390-funded__full | structure | 4257750 (26.2259%) | 0 | 5933015 | 347~379, 430~863, 900~942, 1008~1038 외 152 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| empty/reviews-box/en-1440-guest__first | structure | 338996 (26.1571%) | 0 | 371654 | 194~237, 266~428, 460~469, 500~513 외 5 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| empty/reviews-box/zh-1440-guest__first | structure | 338691 (26.1336%) | 0 | 369213 | 194~237, 266~428, 459~470, 500~511 외 5 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| empty/reviews-box/ko-1440-guest__first | structure | 338260 (26.1003%) | 0 | 370240 | 194~237, 266~428, 459~470, 500~511 외 5 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/zh-320-guest__full | structure | 3444631 (26.0894%) | 0 | 4847350 | 346~379, 418~785, 1136~1315, 1347~1372 외 103 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/ko-390-guest__full | structure | 4235385 (26.0881%) | 0 | 5910251 | 347~379, 430~863, 900~942, 1008~1038 외 151 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/ko-390-insufficient__full | structure | 4231101 (26.0617%) | 0 | 5905956 | 347~379, 430~863, 900~942, 1008~1038 외 151 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/ko-390-zero__full | structure | 4231101 (26.0617%) | 0 | 5905955 | 347~379, 430~863, 900~942, 1008~1038 외 151 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/zh-390-funded__full | structure | 4204950 (25.9605%) | 0 | 5861300 | 346~379, 430~863, 900~943, 1008~1039 외 97 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-320-guest__first | structure | 188675 (25.9511%) | 0 | 303515 | 414~905, 940~1135 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| added/password-flow/en-390-security__success | structure | 341105 (25.9072%) | 0 | 638543 | 44~70, 144~237, 259~287, 347~457 외 2 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-320-guest__first | structure | 188230 (25.8899%) | 0 | 303694 | 414~908, 940~1135 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/en-390-funded__full | structure | 4235761 (25.8766%) | 0 | 6003019 | 349~379, 430~863, 900~939, 1010~1035 외 97 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/zh-360-guest__full | structure | 3856130 (25.8481%) | 0 | 5435194 | 346~379, 425~831, 868~911, 976~1007 외 96 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| added/password-flow/ko-390-security__success | structure | 340323 (25.8478%) | 0 | 621080 | 44~70, 142~237, 257~286, 342~456 외 2 | docHeight, elementCount, boxMoved, textSet, fonts |
| loading/box-gaming-playstation/zh-390-funded__full | structure | 4186653 (25.8476%) | 0 | 5829356 | 347~379, 430~863, 900~942, 1008~1038 외 98 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| loading/box-gaming-playstation/en-390-funded__full | structure | 4230361 (25.8436%) | 0 | 6003293 | 349~379, 430~863, 900~939, 1010~1035 외 97 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/zh-390-guest__full | structure | 4183145 (25.8259%) | 0 | 5838894 | 346~379, 430~863, 900~943, 1008~1039 외 97 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/zh-390-insufficient__full | structure | 4178870 (25.7995%) | 0 | 5834598 | 346~379, 430~863, 900~943, 1008~1039 외 97 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/zh-390-zero__full | structure | 4178870 (25.7995%) | 0 | 5834598 | 346~379, 430~863, 900~943, 1008~1039 외 97 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/en-430-guest__full | structure | 4653260 (25.7901%) | 0 | 6530981 | 349~379, 438~909, 946~985, 1056~1081 외 98 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/en-390-guest__full | structure | 4213343 (25.7396%) | 0 | 5980129 | 349~379, 430~863, 900~939, 1010~1035 외 96 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/en-390-insufficient__full | structure | 4209059 (25.7135%) | 0 | 5975833 | 349~379, 430~863, 900~939, 1010~1035 외 96 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/en-390-zero__full | structure | 4209059 (25.7135%) | 0 | 5975833 | 349~379, 430~863, 900~939, 1010~1035 외 96 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/en-360-guest__full | structure | 3843017 (25.5923%) | 0 | 5481696 | 349~379, 425~831, 868~907, 978~1003 외 94 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/ko-360-guest__full | structure | 3807915 (25.5694%) | 0 | 5334953 | 347~379, 425~831, 868~910, 976~1006 외 93 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/ko-320-guest__full | structure | 3381876 (25.5521%) | 0 | 4740552 | 347~379, 418~785, 1136~1315, 1332~1371 외 100 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/en-320-guest__full | structure | 3428800 (25.5314%) | 0 | 4882141 | 397~427, 466~769, 1136~1363, 1383~1422 외 92 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/home/zh-768-guest__full | structure | 1158254 (25.4153%) | 0 | 2993641 | 993~2192, 2206~2922, 2945~3293, 3323~4260 외 5 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/reviews/zh-1920-guest__first | structure | 524931 (25.3150%) | 0 | 798609 | 194~439, 457~1079 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/home/ko-768-guest__full | structure | 1152835 (25.2964%) | 0 | 2994778 | 993~2192, 2206~2922, 2947~3293, 3323~4260 외 6 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/en-768-guest__full | structure | 1158607 (25.2486%) | 0 | 3005628 | 993~2922, 2947~3293, 3323~4260, 4286~4656 외 2 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/reviews/en-1920-guest__first | structure | 523023 (25.2229%) | 0 | 798775 | 194~441, 458~1079 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/reviews/ko-1920-guest__first | structure | 522890 (25.2165%) | 0 | 797885 | 194~439, 457~1079 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/zh-390-guest__full | structure | 3901596 (23.6414%) | 0 | 5348593 | 346~379, 406~838, 898~943, 1008~1039 외 108 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/zh-390-firstVisit__full | structure | 3901596 (23.6414%) | 0 | 5348593 | 346~379, 406~838, 898~943, 1008~1039 외 108 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/zh-390-funded__full | structure | 3897321 (23.6155%) | 0 | 5344297 | 346~379, 406~838, 898~943, 1008~1039 외 108 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/zh-390-insufficient__full | structure | 3897321 (23.6155%) | 0 | 5344297 | 346~379, 406~838, 898~943, 1008~1039 외 108 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/zh-430-guest__full | structure | 4299018 (23.5373%) | 0 | 5861403 | 346~379, 410~884, 944~989, 1054~1085 외 110 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/en-430-guest__full | structure | 4293270 (23.4089%) | 0 | 5838433 | 349~379, 410~884, 946~985, 1056~1081 외 113 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/zh-320-guest__full | structure | 3169861 (23.3782%) | 0 | 4502125 | 346~379, 398~760, 783~807, 1136~1369 외 110 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/zh-360-guest__full | structure | 3547949 (23.1979%) | 0 | 4948779 | 346~379, 403~806, 829~902, 925~965 외 106 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/en-390-guest__full | structure | 3874226 (23.1754%) | 0 | 5381606 | 349~379, 406~838, 861~885, 900~934 외 108 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/en-390-firstVisit__full | structure | 3874226 (23.1754%) | 0 | 5381606 | 349~379, 406~838, 861~885, 900~934 외 108 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/en-390-funded__full | structure | 3870308 (23.1520%) | 0 | 5377310 | 349~379, 406~838, 861~885, 900~934 외 108 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/en-390-insufficient__full | structure | 3870308 (23.1520%) | 0 | 5377310 | 349~379, 406~838, 861~885, 900~934 외 108 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/ko-390-guest__full | structure | 3809432 (23.0307%) | 0 | 5175546 | 347~379, 406~838, 900~942, 1008~1038 외 186 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/ko-390-firstVisit__full | structure | 3809432 (23.0307%) | 0 | 5175546 | 347~379, 406~838, 900~942, 1008~1038 외 186 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/ko-390-funded__full | structure | 3805148 (23.0048%) | 0 | 5171250 | 347~379, 406~838, 900~942, 1008~1038 외 186 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/ko-390-insufficient__full | structure | 3805148 (23.0048%) | 0 | 5171250 | 347~379, 406~838, 900~942, 1008~1038 외 186 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/ko-320-guest__full | structure | 3115412 (22.9528%) | 0 | 4354292 | 347~379, 398~760, 783~807, 1136~1369 외 147 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/ko-360-guest__full | structure | 3491769 (22.9148%) | 0 | 4835679 | 347~379, 403~806, 829~853, 868~902 외 110 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/en-360-guest__full | structure | 3514246 (22.8742%) | 0 | 4958354 | 349~379, 403~806, 829~853, 868~902 외 107 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/zh-430-guest__first | structure | 366104 (22.8381%) | 0 | 633754 | 346~379, 410~884, 944~989, 1054~1085 외 3 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/en-320-guest__full | structure | 3144170 (22.8182%) | 0 | 4471228 | 349~379, 398~760, 1136~1369, 1389~1428 외 128 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/ko-430-guest__full | structure | 4175991 (22.7630%) | 0 | 5625219 | 347~379, 410~884, 946~988, 1054~1084 외 187 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/en-768-guest__full | structure | 1804292 (22.7495%) | 0 | 2517255 | 186~200, 235~643, 675~693, 729~741 외 96 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/en-430-guest__first | structure | 364480 (22.7368%) | 0 | 634880 | 349~379, 410~884, 946~985, 1056~1081 외 3 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/ko-430-guest__first | structure | 363209 (22.6575%) | 0 | 629359 | 347~379, 410~884, 946~988, 1054~1084 외 3 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/zh-768-guest__full | structure | 1782866 (22.5689%) | 0 | 2464488 | 184~200, 235~643, 673~695, 728~861 외 95 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/zh-390-guest__first | structure | 297066 (22.5624%) | 0 | 517053 | 346~379, 406~838, 898~943, 1008~1039 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/zh-390-firstVisit__first | structure | 297066 (22.5624%) | 0 | 517053 | 346~379, 406~838, 898~943, 1008~1039 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/ko-390-guest__first | structure | 294787 (22.3893%) | 0 | 514575 | 347~379, 406~838, 900~942, 1008~1038 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/ko-390-firstVisit__first | structure | 294787 (22.3893%) | 0 | 514575 | 347~379, 406~838, 900~942, 1008~1038 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/ko-768-guest__full | structure | 1763135 (22.3192%) | 0 | 2437418 | 185~200, 235~643, 674~694, 728~742 외 96 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| overlay/opening-five/zh-390-zero+balance300__qty-5 | structure | 292791 (22.2377%) | 0 | 512757 | 346~379, 406~838, 898~943, 1008~1039 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/zh-390-funded__first | structure | 292791 (22.2377%) | 0 | 512757 | 346~379, 406~838, 898~943, 1008~1039 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/zh-390-insufficient__first | structure | 292791 (22.2377%) | 0 | 512757 | 346~379, 406~838, 898~943, 1008~1039 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-1280-guest__full | structure | 2752935 (22.1382%) | 0 | 5647803 | 184~200, 264~630, 648~670, 703~895 외 10 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-1280-guest__full | structure | 2751468 (22.1264%) | 0 | 5659299 | 186~200, 264~630, 650~668, 704~716 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-1280-guest__full | structure | 2749052 (22.1070%) | 0 | 5653582 | 185~200, 264~630, 649~669, 703~717 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/opening-five/ko-390-zero+balance300__qty-5 | structure | 290503 (22.0640%) | 0 | 510279 | 347~379, 406~838, 900~942, 1008~1038 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/ko-390-funded__first | structure | 290503 (22.0640%) | 0 | 510279 | 347~379, 406~838, 900~942, 1008~1038 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/ko-390-insufficient__first | structure | 290503 (22.0640%) | 0 | 510279 | 347~379, 406~838, 900~942, 1008~1038 외 1 | docHeight, elementCount, boxMoved, textSet, fonts |
| overlay/opening-five/zh-390-zero+balance300__result-full | structure | 3604530 (21.8413%) | 0 | 4831540 | 1688~1975, 1998~2232, 2251~2439, 2460~4506 외 103 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| long/box-krw/zh-390-inventory+bigKrw__first | structure | 286143 (21.7328%) | 0 | 524115 | 346~379, 430~934, 957~997, 1062~1093 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/currency-box/zh-390-funded__krw | structure | 286143 (21.7328%) | 0 | 524115 | 346~379, 430~934, 957~997, 1062~1093 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/balance/zh-390-inventory+big__box | structure | 285096 (21.6533%) | 0 | 522235 | 346~379, 430~934, 957~997, 1062~1093 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-watch-rolex/zh-390-funded__first | structure | 285096 (21.6533%) | 0 | 522235 | 346~379, 430~934, 957~997, 1062~1093 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/opening-five/en-390-zero+balance300__result-full | structure | 3617075 (21.6372%) | 0 | 4903679 | 1688~2077, 2094~2541, 2562~4602, 4622~4713 외 101 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
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
| overlay/opening-five/ko-390-zero+balance300__result-full | structure | 3514645 (21.2485%) | 0 | 4660971 | 1688~1814, 1840~2280, 2306~4506, 4524~4585 외 181 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-430-guest__first | structure | 339509 (21.1791%) | 0 | 625351 | 346~379, 438~980, 1003~1043, 1108~1139 외 2 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-430-guest__first | structure | 338782 (21.1337%) | 0 | 627250 | 347~379, 438~931, 946~980, 1003~1042 외 3 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| loading/box-gaming-playstation/zh-390-funded__first | structure | 278253 (21.1336%) | 0 | 531009 | 347~379, 430~863, 900~942, 1008~1038 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/zh-390-funded__first | structure | 278095 (21.1216%) | 0 | 531941 | 346~379, 430~863, 900~943, 1008~1039 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-430-guest__first | structure | 337550 (21.0569%) | 0 | 627757 | 349~379, 438~931, 946~980, 1003~1039 외 3 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/en-390-funded__first | structure | 277063 (21.0432%) | 0 | 531031 | 349~379, 430~863, 900~939, 1010~1035 외 2 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| loading/box-gaming-playstation/ko-390-funded__first | structure | 276930 (21.0331%) | 0 | 530825 | 347~379, 430~863, 900~942, 1008~1038 외 2 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-gaming-playstation/ko-390-funded__first | structure | 276930 (21.0331%) | 0 | 530825 | 347~379, 430~863, 900~942, 1008~1038 외 2 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| loading/box-gaming-playstation/en-390-funded__first | structure | 276722 (21.0173%) | 0 | 530974 | 349~379, 430~863, 900~939, 1010~1035 외 2 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/box-krw/zh-1440-inventory+bigKrw__full | structure | 2809536 (19.9945%) | 0 | 5709175 | 184~200, 264~630, 648~670, 703~895 외 10 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/currency-box/zh-1440-funded__krw-full | structure | 2809110 (19.9915%) | 0 | 5709185 | 184~200, 264~630, 648~670, 703~895 외 10 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/box-krw/en-1440-inventory+bigKrw__full | structure | 2808374 (19.9863%) | 0 | 5721119 | 186~200, 264~630, 650~668, 704~716 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/currency-box/en-1440-funded__krw-full | structure | 2807937 (19.9832%) | 0 | 5721132 | 186~200, 264~630, 650~668, 704~716 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| long/box-krw/ko-1440-inventory+bigKrw__full | structure | 2805585 (19.9664%) | 0 | 5714696 | 185~200, 264~630, 649~669, 703~717 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/currency-box/ko-1440-funded__krw-full | structure | 2805142 (19.9633%) | 0 | 5714710 | 185~200, 264~630, 649~669, 703~717 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-1440-guest__full | structure | 2805043 (19.9626%) | 0 | 5701825 | 184~200, 264~630, 648~670, 703~895 외 10 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-watch-rolex/zh-1440-funded__full | structure | 2805043 (19.9626%) | 0 | 5701825 | 184~200, 264~630, 648~670, 703~895 외 10 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-1440-guest__full | structure | 2803955 (19.9548%) | 0 | 5713910 | 186~200, 264~630, 650~668, 704~716 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-watch-rolex/en-1440-funded__full | structure | 2803955 (19.9548%) | 0 | 5713910 | 186~200, 264~630, 650~668, 704~716 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-1440-guest__full | structure | 2801072 (19.9343%) | 0 | 5707539 | 185~200, 264~630, 649~669, 703~717 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| state/box-watch-rolex/ko-1440-funded__full | structure | 2801072 (19.9343%) | 0 | 5707539 | 185~200, 264~630, 649~669, 703~717 외 11 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/zh-430-guest__first | structure | 314367 (19.6107%) | 0 | 624705 | 346~379, 438~909, 946~989, 1054~1085 외 3 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/home/en-1280-guest__full | structure | 1151984 (19.5522%) | 0 | 2958364 | 995~2572, 2586~2934, 2959~3309, 3337~4085 외 1 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-pokemon-charizard/en-390-guest__first | structure | 257151 (19.5309%) | 0 | 477927 | 349~379, 406~838, 861~885, 900~934 외 3 | docHeight, elementCount, boxMoved, textSet, fonts |
| state/box-pokemon-charizard/en-390-firstVisit__first | structure | 257151 (19.5309%) | 0 | 477927 | 349~379, 406~838, 861~885, 900~934 외 3 | docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/zh-1280-guest__full | structure | 1150578 (19.5283%) | 0 | 2943981 | 995~2934, 2957~3309, 3337~4085, 4112~4602 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/zh-430-guest__full | structure | 1551510 (19.5247%) | 0 | 3742776 | 1783~2223, 2243~2834, 2850~3503, 3521~4238 외 24 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/en-430-guest__first | structure | 312622 (19.5018%) | 0 | 625573 | 349~379, 438~909, 946~985, 1056~1081 외 3 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/zh-390-guest__first | structure | 256290 (19.4655%) | 0 | 509535 | 346~379, 430~863, 900~943, 1008~1039 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-gaming-playstation/ko-430-guest__first | structure | 311910 (19.4574%) | 0 | 621314 | 347~379, 438~909, 946~988, 1054~1084 외 3 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/home/ko-1280-guest__full | structure | 1146217 (19.4543%) | 0 | 2945787 | 995~2934, 2958~3309, 3337~4085, 4112~4602 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
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
| route/home/ko-430-guest__full | structure | 1522954 (19.0704%) | 0 | 3722475 | 1783~2221, 2245~2834, 2850~3297, 3314~3503 외 26 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
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
| overlay/footer-controls/zh-390-guest__home-krw-full | structure | 1301655 (18.6498%) | 0 | 3122554 | 1754~2163, 2183~3376, 3395~4061, 4077~6019 외 21 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| overlay/footer-controls/ko-390-guest__home-krw-full | structure | 1290106 (18.5757%) | 0 | 3128117 | 1754~2161, 2185~3376, 3395~4061, 4077~6019 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/zh-390-guest__full | structure | 1294343 (18.5451%) | 0 | 3102639 | 1753~2163, 2183~3376, 3395~4061, 4077~6019 외 20 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/zh-390-dailyUsed__full | structure | 1294343 (18.5451%) | 0 | 3102446 | 1753~2163, 2183~3376, 3395~4061, 4077~6019 외 20 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/zh-390-firstVisit__full | structure | 1294343 (18.5451%) | 0 | 3102446 | 1753~2163, 2183~3376, 3395~4061, 4077~6019 외 20 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/zh-390-funded__full | structure | 1294343 (18.5451%) | 0 | 3102446 | 1753~2163, 2183~3376, 3395~4061, 4077~6019 외 20 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/zh-390-inventory__full | structure | 1294343 (18.5451%) | 0 | 3102446 | 1753~2163, 2183~3376, 3395~4061, 4077~6019 외 20 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/zh-390-zero__full | structure | 1294343 (18.5451%) | 0 | 3102446 | 1753~2163, 2183~3376, 3395~4061, 4077~6019 외 20 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| loading/home/ko-390-funded__full | structure | 1283731 (18.4839%) | 0 | 3109049 | 1753~2161, 2185~3376, 3395~4061, 4077~6019 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/ko-390-guest__full | structure | 1283731 (18.4839%) | 0 | 3109052 | 1753~2161, 2185~3376, 3395~4061, 4077~6019 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/ko-390-dailyUsed__full | structure | 1283731 (18.4839%) | 0 | 3109048 | 1753~2161, 2185~3376, 3395~4061, 4077~6019 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/ko-390-firstVisit__full | structure | 1283731 (18.4839%) | 0 | 3109048 | 1753~2161, 2185~3376, 3395~4061, 4077~6019 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/ko-390-funded__full | structure | 1283731 (18.4839%) | 0 | 3109044 | 1753~2161, 2185~3376, 3395~4061, 4077~6019 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/ko-390-inventory__full | structure | 1283731 (18.4839%) | 0 | 3109052 | 1753~2161, 2185~3376, 3395~4061, 4077~6019 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/ko-390-zero__full | structure | 1283731 (18.4839%) | 0 | 3109048 | 1753~2161, 2185~3376, 3395~4061, 4077~6019 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| overlay/odds/zh-390-guest__tables | structure | 5133647 (18.4524%) | 0 | 7716192 | 346~379, 430~863, 900~943, 1008~1039 외 193 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| loading/home/zh-390-funded__full | structure | 1282215 (18.3713%) | 0 | 3086438 | 1753~2162, 2183~3376, 3395~4061, 4077~6019 외 21 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| overlay/odds/ko-390-guest__tables | structure | 5109481 (18.3408%) | 0 | 7641683 | 347~379, 430~863, 900~942, 1008~1038 외 178 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-1024-guest__full | structure | 1651257 (18.3266%) | 0 | 2955942 | 184~200, 251~558, 576~598, 631~823 외 43 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/zh-390-guest__first | structure | 241099 (18.3117%) | 0 | 477865 | 346~379, 430~934, 957~997, 1062~1093 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-1024-guest__full | structure | 1648481 (18.2958%) | 0 | 2968879 | 185~200, 251~558, 577~597, 631~645 외 44 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-1024-guest__full | structure | 1647552 (18.2855%) | 0 | 2970814 | 186~200, 251~558, 578~596, 632~644 외 48 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| overlay/odds/en-390-guest__tables | structure | 5128960 (18.2797%) | 0 | 7882331 | 349~379, 430~863, 900~939, 1010~1035 외 197 | sizeMismatch, docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/en-390-guest__first | structure | 240330 (18.2533%) | 0 | 480423 | 349~379, 430~885, 900~934, 956~993 외 2 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/box-watch-rolex/ko-390-guest__first | structure | 240153 (18.2398%) | 0 | 478822 | 347~379, 430~934, 954~996, 1062~1092 외 1 | docHeight, imageCount, elementCount, boxMoved, textSet, fonts |
| route/home/zh-360-guest__full | structure | 1134402 (18.1893%) | 0 | 2663893 | 1731~2119, 2139~4523, 4545~4933, 4956~5345 외 21 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| overlay/footer-controls/en-390-guest__home-krw-full | structure | 1292242 (18.1499%) | 0 | 3145417 | 1754~2165, 2186~3376, 3395~6065, 6081~7321 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/en-390-dailyUsed__full | structure | 1284838 (18.0459%) | 0 | 3261696 | 369~369, 398~586, 1753~2165, 2185~3376 외 24 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| route/home/en-390-guest__full | structure | 1283833 (18.0318%) | 0 | 3124610 | 1753~2165, 2185~3376, 3395~6065, 6081~7321 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/en-390-firstVisit__full | structure | 1283833 (18.0318%) | 0 | 3124610 | 1753~2165, 2185~3376, 3395~6065, 6081~7321 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/en-390-funded__full | structure | 1283833 (18.0318%) | 0 | 3124610 | 1753~2165, 2185~3376, 3395~6065, 6081~7321 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/en-390-inventory__full | structure | 1283833 (18.0318%) | 0 | 3124610 | 1753~2165, 2185~3376, 3395~6065, 6081~7321 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/en-390-zero__full | structure | 1283833 (18.0318%) | 0 | 3124610 | 1753~2165, 2185~3376, 3395~6065, 6081~7321 외 22 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| route/home/zh-320-guest__full | structure | 950392 (18.0086%) | 0 | 2178800 | 1665~2023, 2043~6565, 6603~6725, 6751~6776 외 16 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| overlay/footer-controls/en-1440-guest__home-krw-full | structure | 1200958 (17.9509%) | 0 | 3011911 | 995~2572, 2586~2934, 2959~3309, 3337~4085 외 1 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| route/home/en-1440-guest__full | structure | 1199814 (17.9338%) | 0 | 3008451 | 995~2572, 2586~2934, 2959~3309, 3337~4085 외 1 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/en-1440-dailyUsed__full | structure | 1199814 (17.9338%) | 0 | 3008451 | 995~2572, 2586~2934, 2959~3309, 3337~4085 외 1 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |
| state/home/en-1440-firstVisit__full | structure | 1199814 (17.9338%) | 0 | 3008451 | 995~2572, 2586~2934, 2959~3309, 3337~4085 외 1 | sizeMismatch, docHeight, elementCount, boxMoved, textSet, fonts |
| state/home/en-1440-funded__full | structure | 1199814 (17.9338%) | 0 | 3008451 | 995~2572, 2586~2934, 2959~3309, 3337~4085 외 1 | sizeMismatch, docHeight, elementCount, boxMoved, textSet |

그 밖에 759건. 전부는 summary.json 에 있다.

## 15. 따로 분류한 미세 차이(가장자리 다듬기, 문턱 아래의 색 차이)

62건. 구조 차이가 없고 solid 비율이 문턱 아래인 것. 다른 픽셀이 많은 순서로 30건.

| 촬영 | 종류 | exact | aa | solid |
|---|---|---|---|---|
| route/legal-refunds/zh-390-guest__full | sub-threshold | 117 (0.0024%) | 0 | 0 |
| route/legal-privacy/ko-390-guest__full | sub-threshold | 116 (0.0017%) | 0 | 0 |
| route/legal-terms/ko-390-guest__full | sub-threshold | 116 (0.0019%) | 0 | 0 |
| route/legal-withdrawals/en-390-guest__full | sub-threshold | 105 (0.0021%) | 0 | 0 |
| loading/inventory/zh-390-funded__full | sub-threshold | 104 (0.0036%) | 0 | 0 |
| route/legal-community/zh-390-guest__full | sub-threshold | 104 (0.0028%) | 0 | 0 |
| route/legal-complaints/ko-390-guest__full | sub-threshold | 104 (0.0028%) | 0 | 0 |
| route/legal-cookies/en-390-guest__full | sub-threshold | 104 (0.0024%) | 0 | 0 |
| route/legal-withdrawals/ko-390-guest__full | sub-threshold | 104 (0.0023%) | 0 | 0 |
| route/wins/zh-390-guest__full | sub-threshold | 104 (0.0036%) | 0 | 0 |
| state/account/zh-390-pending__full | sub-threshold | 104 (0.0032%) | 0 | 0 |
| state/wallet/ko-390-zero__full | sub-threshold | 104 (0.0036%) | 0 | 0 |
| state/legal/en-390-funded__full | sub-threshold | 88 (0.0023%) | 0 | 0 |
| route/legal-privacy/zh-430-guest__full | sub-threshold | 71 (0.0012%) | 0 | 0 |
| route/legal-terms/zh-320-guest__full | sub-threshold | 69 (0.0014%) | 0 | 0 |
| route/legal-terms/zh-430-guest__full | sub-threshold | 66 (0.0011%) | 0 | 0 |
| route/legal-withdrawals/en-430-guest__full | sub-threshold | 66 (0.0012%) | 0 | 0 |
| route/legal-policy/zh-430-guest__full | sub-threshold | 65 (0.0015%) | 0 | 0 |
| route/wallet-withdraw/zh-430-guest__full | sub-threshold | 63 (0.0019%) | 0 | 0 |
| route/wallet/zh-430-guest__full | sub-threshold | 63 (0.0019%) | 0 | 0 |
| route/wins/en-430-guest__full | sub-threshold | 63 (0.0019%) | 0 | 0 |
| route/legal-community/zh-430-guest__full | sub-threshold | 57 (0.0015%) | 0 | 0 |
| route/legal-faq/ko-430-guest__full | sub-threshold | 57 (0.0014%) | 0 | 0 |
| route/legal-safety/en-430-guest__full | sub-threshold | 57 (0.0012%) | 0 | 0 |
| route/guide/en-360-guest__full | sub-threshold | 6 (0.0002%) | 0 | 0 |
| state/wins/zh-390-inventory__first | sub-threshold | 6 (0.0005%) | 0 | 0 |
| route/legal-complaints/ko-360-guest__full | sub-threshold | 5 (0.0001%) | 0 | 0 |
| route/fairness/en-1920-guest__full | sub-threshold | 3 (0.0001%) | 0 | 0 |
| route/fairness/zh-1920-guest__full | sub-threshold | 3 (0.0001%) | 0 | 0 |
| route/legal-complaints/zh-1920-guest__full | sub-threshold | 3 (0.0001%) | 0 | 0 |

## 15-1. 두 쪽에 똑같이 있는 것(차이는 아니지만 알아 둘 것)

- 콘솔 오류가 같은 내용으로 있는 촬영: 66건. 예: "Failed to load resource: the server responded with a status of 404"
- 400 이상의 응답이 같은 내용으로 있는 촬영: 12건. 예: 404 /en/box/no-such-box/
- 끊은 요청(바깥 주소, GET 이 아닌 요청)이 같은 내용으로 있는 촬영: 0건
- 대체 글꼴의 불림 상태만 다른 촬영(글꼴 파일이 도착한 때의 차이, 그림에는 차이가 없을 수 있다): 0건
- 기다리다 시간이 넘은 것이 적힌 촬영: 0건

## 16. 읽는 법

- 사람이 볼 목록의 항목은 `reshoot.txt` 에 쉼표로 이어 적었다(0개). 두 환경에서 `node shots.mjs <label> <baseUrl> <outDir> --only "$(cat reshoot.txt)"` 로 다시 찍고 이 도구를 다시 돌린다. 한 번만 생긴 흔들림은 사라지고, 다시 찍어도 남는 차이만 진짜 차이다.
- 차이 그림은 이 폴더의 `<촬영 id>.diff.png` 다. 빨강은 다른 픽셀, 노랑은 가장자리 다듬기로 본 픽셀, 회색은 A 를 어둡게 깐 것이다.
- 원본 그림과 기록은 위 표의 A, B 폴더에 같은 이름(`.png`, `.json`)으로 있다.
- 긴 그림은 `node tools/crop.mjs` 로 잘라서 본다.
