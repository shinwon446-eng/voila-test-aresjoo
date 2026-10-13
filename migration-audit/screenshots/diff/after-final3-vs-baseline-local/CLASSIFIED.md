# 차이의 분류

만든 시각: 2026-10-12T22:50:34.682Z
A(기준): before-local http://127.0.0.1:4183/voila-test-aresjoo
B(결과): after-final3 http://127.0.0.1:4189/voila-test-aresjoo
규칙: C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\harness\classify-rules.json

갈래의 뜻은 classify.mjs 머리말에 있다. 이 문서는 통과를 말하지 않는다. UNEXPLAINED 는 사람이 그림을 봐야 하는 것이다.

## 1. 갈래별 수

촬영 3282건

| 갈래 | 수 |
|---|---|
| identical | 2155 |
| noise | 59 |
| intended (구역 확인함) | 416 |
| intended (구역 확인 못 함) | 237 |
| background-only | 342 |
| position-aa | 24 |
| within-build-variant | 4 |
| UNEXPLAINED | 30 |
| not-compared | 6 |
| not-applicable | 9 |

### 묶음별

| 묶음 | identical | noise | intended (구역 확인함) | intended (구역 확인 못 함) | background-only | position-aa | within-build-variant | UNEXPLAINED | not-compared | not-applicable |
|---|---|---|---|---|---|---|---|---|---|---|
| active | 9 | 0 | 9 | 0 | 45 | 6 | 0 | 0 | 0 | 0 |
| added | 6 | 0 | 42 | 6 | 6 | 0 | 0 | 0 | 6 | 0 |
| empty | 42 | 0 | 11 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| error | 60 | 0 | 18 | 0 | 12 | 0 | 0 | 0 | 0 | 0 |
| extra | 24 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| focus | 9 | 0 | 9 | 0 | 45 | 6 | 0 | 0 | 0 | 0 |
| hover | 18 | 0 | 18 | 0 | 90 | 12 | 0 | 0 | 0 | 0 |
| loading | 83 | 1 | 12 | 12 | 0 | 0 | 0 | 0 | 0 | 0 |
| long | 65 | 1 | 18 | 6 | 6 | 0 | 0 | 0 | 0 | 0 |
| overlay | 149 | 1 | 61 | 0 | 138 | 0 | 2 | 18 | 0 | 9 |
| route | 1407 | 51 | 135 | 135 | 0 | 0 | 0 | 0 | 0 | 0 |
| state | 283 | 5 | 77 | 78 | 0 | 0 | 1 | 12 | 0 | 0 |

### 규칙별(설명된 촬영)

| 규칙과 갈래 | 촬영 수 |
|---|---|
| W1-box / background-only | 147 |
| W1-box / intended | 354 |
| W1-box / position-aa | 24 |
| W1-box-first-link / intended | 12 |
| W1-card-primitive / intended | 24 |
| W1-home-cards / background-only | 189 |
| W1-home-cards / intended | 179 |
| W1-home-cards / within-build-variant | 4 |
| W1-review-sheet / intended | 6 |
| W1-reviews-page / intended | 90 |
| W2-password-flow / intended | 18 |
| W2-wallet-history / background-only | 6 |
| W2-wallet-history / intended | 12 |
| W2-wallet-history-added / intended | 18 |
| W2-withdraw-record / background-only | 6 |
| W2-withdraw-record / intended | 12 |

## 2. 따로 찍은 영역의 상태

영역마다 두 빌드를 견준 횟수와 결과다. same 과 noise 는 그대로라는 뜻, aa-shift 는 자리의 소수 부분만 달라 가장자리가 달리 그려진 것, differ, size, onlyA, onlyB 는 달라진 것이다.

| 영역 | same | noise | aa-shift | differ | size | onlyA | onlyB |
|---|---|---|---|---|---|---|---|
| box-hero | 12 | 177 | 0 | 0 | 0 | 0 | 0 |
| card-photo | 390 | 42 | 0 | 0 | 0 | 0 | 0 |
| card-price | 432 | 0 | 0 | 0 | 0 | 0 | 0 |
| card-rating | 0 | 0 | 0 | 0 | 0 | 0 | 432 |
| card-title | 432 | 0 | 0 | 0 | 0 | 0 | 0 |
| chips | 297 | 0 | 0 | 6 | 0 | 33 | 0 |
| contents | 0 | 57 | 132 | 0 | 0 | 0 | 0 |
| desc | 372 | 0 | 0 | 0 | 0 | 0 | 0 |
| dialog | 275 | 13 | 0 | 25 | 23 | 0 | 0 |
| empty | 6 | 0 | 0 | 0 | 0 | 6 | 0 |
| footer | 89 | 119 | 164 | 0 | 0 | 0 | 0 |
| header | 372 | 0 | 0 | 0 | 0 | 0 | 0 |
| hero | 55 | 49 | 0 | 4 | 0 | 0 | 0 |
| links | 22 | 0 | 17 | 0 | 0 | 0 | 0 |
| more | 108 | 0 | 0 | 0 | 0 | 0 | 0 |
| notes | 117 | 0 | 72 | 0 | 0 | 0 | 0 |
| odds | 109 | 0 | 80 | 0 | 0 | 0 | 0 |
| openbar | 189 | 0 | 0 | 0 | 0 | 0 | 0 |
| ratinglink | 0 | 0 | 0 | 0 | 0 | 0 | 189 |
| reviews | 0 | 0 | 0 | 0 | 189 | 0 | 0 |
| reviews-feed | 0 | 0 | 0 | 0 | 33 | 0 | 195 |
| reviews-sum | 0 | 0 | 0 | 33 | 0 | 0 | 195 |
| scene | 40 | 2 | 0 | 0 | 0 | 0 | 0 |
| screenhead | 366 | 0 | 0 | 0 | 0 | 0 | 0 |
| search | 126 | 0 | 0 | 0 | 0 | 0 | 0 |
| search-rows | 10 | 2 | 0 | 0 | 0 | 0 | 0 |
| side | 159 | 0 | 30 | 0 | 0 | 0 | 0 |
| target | 210 | 6 | 24 | 0 | 36 | 0 | 0 |

## 3. UNEXPLAINED (30건)

### overlay/tx-detail/en-1440-pending__bonus

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\en-1440-pending__bonus.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\en-1440-pending__bonus.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\en-1440-pending__bonus.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: Oct 12, 2026, 12:00 PM , Pending

### overlay/tx-detail/en-1440-pending__withdraw-hold

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\en-1440-pending__withdraw-hold.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\en-1440-pending__withdraw-hold.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\en-1440-pending__withdraw-hold.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: Oct 12, 2026, 12:00 PM , Pending

### overlay/tx-detail/en-1440-pending__withdraw-pending

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\en-1440-pending__withdraw-pending.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\en-1440-pending__withdraw-pending.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\en-1440-pending__withdraw-pending.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: Oct 12, 2026, 12:00 PM , Pending

### overlay/tx-detail/en-390-pending__bonus

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\en-390-pending__bonus.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\en-390-pending__bonus.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\en-390-pending__bonus.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: Oct 12, 2026, 12:00 PM , Pending

### overlay/tx-detail/en-390-pending__withdraw-hold

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\en-390-pending__withdraw-hold.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\en-390-pending__withdraw-hold.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\en-390-pending__withdraw-hold.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: Oct 12, 2026, 12:00 PM , Pending

### overlay/tx-detail/en-390-pending__withdraw-pending

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\en-390-pending__withdraw-pending.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\en-390-pending__withdraw-pending.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\en-390-pending__withdraw-pending.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: Oct 12, 2026, 12:00 PM , Pending

### overlay/tx-detail/ko-1440-pending__bonus

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\ko-1440-pending__bonus.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\ko-1440-pending__bonus.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\ko-1440-pending__bonus.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026년 10월 12일 오후 12:00 , 처리 대기

### overlay/tx-detail/ko-1440-pending__withdraw-hold

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\ko-1440-pending__withdraw-hold.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\ko-1440-pending__withdraw-hold.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\ko-1440-pending__withdraw-hold.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026년 10월 12일 오후 12:00 , 처리 대기

### overlay/tx-detail/ko-1440-pending__withdraw-pending

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\ko-1440-pending__withdraw-pending.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\ko-1440-pending__withdraw-pending.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\ko-1440-pending__withdraw-pending.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026년 10월 12일 오후 12:00 , 처리 대기

### overlay/tx-detail/ko-390-pending__bonus

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\ko-390-pending__bonus.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\ko-390-pending__bonus.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\ko-390-pending__bonus.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026년 10월 12일 오후 12:00 , 처리 대기

### overlay/tx-detail/ko-390-pending__withdraw-hold

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\ko-390-pending__withdraw-hold.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\ko-390-pending__withdraw-hold.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\ko-390-pending__withdraw-hold.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026년 10월 12일 오후 12:00 , 처리 대기

### overlay/tx-detail/ko-390-pending__withdraw-pending

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\ko-390-pending__withdraw-pending.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\ko-390-pending__withdraw-pending.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\ko-390-pending__withdraw-pending.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026년 10월 12일 오후 12:00 , 처리 대기

### overlay/tx-detail/zh-1440-pending__bonus

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\zh-1440-pending__bonus.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\zh-1440-pending__bonus.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\zh-1440-pending__bonus.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026年10月12日 12:00 , 等待处理

### overlay/tx-detail/zh-1440-pending__withdraw-hold

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\zh-1440-pending__withdraw-hold.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\zh-1440-pending__withdraw-hold.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\zh-1440-pending__withdraw-hold.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026年10月12日 12:00 , 等待处理

### overlay/tx-detail/zh-1440-pending__withdraw-pending

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\zh-1440-pending__withdraw-pending.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\zh-1440-pending__withdraw-pending.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\zh-1440-pending__withdraw-pending.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026年10月12日 12:00 , 等待处理

### overlay/tx-detail/zh-390-pending__bonus

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\zh-390-pending__bonus.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\zh-390-pending__bonus.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\zh-390-pending__bonus.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026年10月12日 12:00 , 等待处理

### overlay/tx-detail/zh-390-pending__withdraw-hold

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\zh-390-pending__withdraw-hold.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\zh-390-pending__withdraw-hold.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\zh-390-pending__withdraw-hold.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026年10月12日 12:00 , 等待处理

### overlay/tx-detail/zh-390-pending__withdraw-pending

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\overlay\tx-detail\zh-390-pending__withdraw-pending.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\overlay\tx-detail\zh-390-pending__withdraw-pending.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\overlay\tx-detail\zh-390-pending__withdraw-pending.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026年10月12日 12:00 , 等待处理

### state/wallet/en-1440-pending__first

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\state\wallet\en-1440-pending__first.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\state\wallet\en-1440-pending__first.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\state\wallet\en-1440-pending__first.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: Oct 12, 2026, 12:00 PM , Pending

### state/wallet/en-1440-pending__full

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\state\wallet\en-1440-pending__full.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\state\wallet\en-1440-pending__full.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\state\wallet\en-1440-pending__full.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: Oct 12, 2026, 12:00 PM , Pending

### state/wallet/en-390-pending__first

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\state\wallet\en-390-pending__first.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\state\wallet\en-390-pending__first.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\state\wallet\en-390-pending__first.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: Oct 12, 2026, 12:00 PM , Pending

### state/wallet/en-390-pending__full

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\state\wallet\en-390-pending__full.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\state\wallet\en-390-pending__full.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\state\wallet\en-390-pending__full.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: Oct 12, 2026, 12:00 PM , Pending

### state/wallet/ko-1440-pending__first

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\state\wallet\ko-1440-pending__first.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\state\wallet\ko-1440-pending__first.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\state\wallet\ko-1440-pending__first.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026년 10월 12일 오후 12:00 , 처리 대기

### state/wallet/ko-1440-pending__full

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\state\wallet\ko-1440-pending__full.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\state\wallet\ko-1440-pending__full.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\state\wallet\ko-1440-pending__full.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026년 10월 12일 오후 12:00 , 처리 대기

### state/wallet/ko-390-pending__first

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\state\wallet\ko-390-pending__first.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\state\wallet\ko-390-pending__first.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\state\wallet\ko-390-pending__first.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026년 10월 12일 오후 12:00 , 처리 대기

### state/wallet/ko-390-pending__full

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\state\wallet\ko-390-pending__full.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\state\wallet\ko-390-pending__full.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\state\wallet\ko-390-pending__full.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026년 10월 12일 오후 12:00 , 처리 대기

### state/wallet/zh-1440-pending__first

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\state\wallet\zh-1440-pending__first.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\state\wallet\zh-1440-pending__first.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\state\wallet\zh-1440-pending__first.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026年10月12日 12:00 , 等待处理

### state/wallet/zh-1440-pending__full

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\state\wallet\zh-1440-pending__full.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\state\wallet\zh-1440-pending__full.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\state\wallet\zh-1440-pending__full.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026年10月12日 12:00 , 等待处理

### state/wallet/zh-390-pending__first

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\state\wallet\zh-390-pending__first.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\state\wallet\zh-390-pending__first.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\state\wallet\zh-390-pending__first.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026年10月12日 12:00 , 等待处理

### state/wallet/zh-390-pending__full

- 그림: `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local\state\wallet\zh-390-pending__full.png` 와 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\after-final3\state\wallet\zh-390-pending__full.png`, 차이 그림 `C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\diff\after-final3-vs-baseline-local\state\wallet\zh-390-pending__full.diff.png`
- 글: 명세에 없는 차이(U-wallet-row-separator) 2줄. 예: A main | span.v-small :: 2026年10月12日 12:00 , 等待处理


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

## 4-1. within-build-variant (4건)

규칙이 허락하지 않은 영역이 달랐지만, 그 촬영을 두 빌드에서 여러 번씩 찍어 보니 두 빌드가 바이트까지 같은 그림을 냈고 같은 크기의 차이가 한 빌드 안에서도 나왔다.

- empty/search-none/ko-390-guest__cleared: hero: 이번 차이는 눈에 띄는 픽셀 2개. 반복 측정(기준 8번, 결과 8번)에서 기준 안의 변종 [5,1,2], 결과 안의 변종 [1,6,1], 두 빌드에 바이트까지 같은 그림 1가지, 이 촬영에서 빌드 안의 최대 차이 2픽셀, 같은 종류의 영역 전체(촬영 20종)에서 빌드 안의 최대 차이 8540픽셀
- overlay/footer-controls/zh-1440-guest__home-krw: hero: 이번 차이는 눈에 띄는 픽셀 1043개. 반복 측정(기준 8번, 결과 8번)에서 기준 안의 변종 [8], 결과 안의 변종 [7,1], 두 빌드에 바이트까지 같은 그림 1가지, 이 촬영에서 빌드 안의 최대 차이 0픽셀, 같은 종류의 영역 전체(촬영 20종)에서 빌드 안의 최대 차이 8540픽셀
- overlay/footer-controls/zh-390-guest__home-krw: hero: 이번 차이는 눈에 띄는 픽셀 2개. 반복 측정(기준 8번, 결과 8번)에서 기준 안의 변종 [4,2,1,1], 결과 안의 변종 [1,1,3,3], 두 빌드에 바이트까지 같은 그림 1가지, 이 촬영에서 빌드 안의 최대 차이 0픽셀, 같은 종류의 영역 전체(촬영 20종)에서 빌드 안의 최대 차이 8540픽셀
- state/home/zh-390-inventory__full: hero: 이번 차이는 눈에 띄는 픽셀 2개. 반복 측정(기준 8번, 결과 8번)에서 기준 안의 변종 [6,1,1], 결과 안의 변종 [2,6], 두 빌드에 바이트까지 같은 그림 2가지, 이 촬영에서 빌드 안의 최대 차이 2픽셀, 같은 종류의 영역 전체(촬영 20종)에서 빌드 안의 최대 차이 8540픽셀

## 4-2. not-compared (6건)

- added/wallet-history-open-take/en-1440-funded__row-1: A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok
- added/wallet-history-open-take/en-390-funded__row-1: A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok
- added/wallet-history-open-take/ko-1440-funded__row-1: A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok
- added/wallet-history-open-take/ko-390-funded__row-1: A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok
- added/wallet-history-open-take/zh-1440-funded__row-1: A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok
- added/wallet-history-open-take/zh-390-funded__row-1: A: not-applicable (요소가 보이지 않음: .v-main .v-itemrows .v-itemrow), B: ok

## 5. 한계

- 구역을 따로 찍는 화면은 홈, 박스, 후기 화면뿐이다. 구역과 구역 사이의 빈 자리는 견주지 않는다.
- "구역 확인 못 함"은 첫 화면 촬영처럼 구역을 찍지 않은 촬영이다. 같은 항목의 전체 촬영이 구역을 확인한다.
- position-aa 는 크기, 글, 자리의 소수 부분, 눈에 띄는 픽셀의 비율(5% 미만)로 정한다. 그 픽셀이 정말 가장자리에만 있는지는 차이 그림(`<촬영 id>~<영역>.diff.png`)으로 본다.
- 글은 촬영마다 700 덩어리까지만 견준다. 구조 기록의 요소는 정해 둔 선택자만 본다.
