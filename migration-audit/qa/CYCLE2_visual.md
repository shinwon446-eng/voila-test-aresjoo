# QA 사이클 2: 시각과 연출 (기준 빌드 대 결과 빌드)

2026-10-13. 검증 도구(`migration-audit/harness`)로 직접 실행한 결과다. 통과를 선언하는 문서가 아니다. 숫자와 갈래, 설명하지 못한 것, 실행하지 않은 것을 적는다.

- 기준(A): `C:/Users/hyun1/dev/VOILA-audit-before/web/out` (커밋 63445c7), `http://127.0.0.1:4183/voila-test-aresjoo` 로 띄움
- 결과(B): `C:/Users/hyun1/dev/VOILA-audit-out/after-result` (브랜치 `migration-result`, 27eea0d, HTML 1,092개), `http://127.0.0.1:4184/voila-test-aresjoo` 로 띄움
- 의도된 차이의 근거: `migration-audit/MIGRATION_SPEC.md`. 규칙 파일: `migration-audit/harness/classify-rules.json`
- 브라우저: 설치된 Chrome(headless), 두 빌드를 같은 도구, 같은 옵션으로 찍었다

## 1. 실행한 명령

전부 `migration-audit/harness` 에서. 로그는 `migration-audit/logs/cycle2-*.log`.

```bash
node serve.mjs C:/Users/hyun1/dev/VOILA-audit-before/web/out 4183
node serve.mjs C:/Users/hyun1/dev/VOILA-audit-out/after-result 4184
BEFORE=http://127.0.0.1:4183/voila-test-aresjoo; AFTER=http://127.0.0.1:4184/voila-test-aresjoo; D=../screenshots/diff/after-result-vs-baseline-local

# 촬영(요소 단위 영역 포함). 기준 쪽도 새 도구로 전부 다시 찍었다
MSYS_NO_PATHCONV=1 node shots.mjs before-local $BEFORE ../screenshots/after/baseline-local --workers 6
MSYS_NO_PATHCONV=1 node shots.mjs after-result $AFTER ../screenshots/after/after-result --workers 6
node diff.mjs ../screenshots/after/baseline-local ../screenshots/after/after-result $D
node classify.mjs $D
# 설명되지 않은 항목을 두 쪽에서 다시 찍고 다시 견줌(두 번)
R="$(cat $D/reshoot-unexplained.txt)"
MSYS_NO_PATHCONV=1 node shots.mjs after-result $AFTER ../screenshots/after/after-result --only "$R"
MSYS_NO_PATHCONV=1 node shots.mjs before-local $BEFORE ../screenshots/after/baseline-local --only "$R"
node diff.mjs ../screenshots/after/baseline-local ../screenshots/after/after-result $D && node classify.mjs $D
# 구역 안의 사진이 같은 파일인지 따로 확인
MSYS_NO_PATHCONV=1 node tools/image-identity.mjs $BEFORE $AFTER $D/image-identity.json

# 흐름(기준 쪽도 새 도구로 다시 돌림)
MSYS_NO_PATHCONV=1 node flows.mjs before-local $BEFORE ../flows/before-local --workers 3
MSYS_NO_PATHCONV=1 node flows.mjs after-result $AFTER ../flows/after-result --workers 3
node flows-compare.mjs ../flows/before-local ../flows/after-result ../flows/compare-after-result

# 연출(다른 작업 없이 따로)
MSYS_NO_PATHCONV=1 node motion.mjs before-local $BEFORE
MSYS_NO_PATHCONV=1 node motion.mjs after-result $AFTER
node motion-compare.mjs ../motion/before-local ../motion/after-result ../motion/compare-after-result
# 느린 기기 경우만 5번씩 다시 잼
MSYS_NO_PATHCONV=1 node motion.mjs before-local-slow4x $BEFORE ../motion/rerun-slow4x/before-local --only one-slow4x --runs 5
MSYS_NO_PATHCONV=1 node motion.mjs after-result-slow4x $AFTER ../motion/rerun-slow4x/after-result --only one-slow4x --runs 5

# after-reviews 의 후기 카드 여섯 항목
node serve.mjs C:/Users/hyun1/dev/VOILA-audit-out/after-reviews 4185
MSYS_NO_PATHCONV=1 node shots.mjs after-reviews http://127.0.0.1:4185/voila-test-aresjoo ../screenshots/after/after-reviews --only overlay/review-card
node diff.mjs ../screenshots/after/baseline-local ../screenshots/after/after-reviews ../screenshots/diff/after-reviews-review-card --only overlay/review-card
node classify.mjs ../screenshots/diff/after-reviews-review-card
```

## 2. 이번에 도구에 더한 것

| 더한 것 | 파일 | 하는 일 |
|---|---|---|
| 요소 단위 촬영 | `lib/regions.mjs`, `shots.mjs` | 촬영마다 영역을 따로 잘라 찍는다. 겹침 화면의 판(`dialog`, 가림막을 불투명한 검정으로 바꿔 뒤가 비치지 않게), 개봉과 여러 개 결과의 장면(`scene`), 부품 하나(`target`), 홈과 박스와 후기 화면의 구역(머리줄, 배너, 검색, 알약, 카드의 사진과 이름과 가격, 대표 상품, 구매 막대, 구성품, 확률, 알아둘 것, 꼬리말 등) |
| 영역 비교 | `diff.mjs` | 영역마다 크기, 글, 픽셀을 견준다. 자리의 소수 부분을 재서 "자리 때문에 가장자리가 달리 그려진 것"을 가린다. 작은 글 요소는 한 픽셀 밀어 견주는 시험도 한다 |
| 분류 | `classify.mjs`, `classify-rules.json` | 차이를 규칙에 비춰 의도된 것, 배경만 다른 것, 자리 때문인 것, 설명 안 되는 것으로 나눈다. `CLASSIFIED.md` |
| 흐름의 칸별 분류 | `lib/observe.mjs`, `flows-compare.mjs` | 관찰값에서 후기 자리를 `reviewZone` 칸에 따로 담고, 다른 칸을 장부, 의도, 설명 안 됨으로 나눈다. 장부는 시나리오마다 따로 적는다 |
| 시나리오 J | `flows.mjs` | 박스로 거르는 길을 화면이 주는 대로 간다(알약이 있으면 누르고, 없으면 `?box=` 주소로). 어느 길로 갔는지 `notes.branch` 에 남는다 |
| 시계 옮기기 | `lib/common.mjs` 의 `tickClock` | 확인창의 확정 단추를 누르기 직전에 고정한 시계를 1초 옮긴다. 아래 8장 참고 |
| 다시 찍기의 범위 | `diff.mjs` | `reshoot.txt` 는 구조는 같고 픽셀만 다른 촬영(홈 배너의 흔들림 꼴)만 담는다. 이번 실행에서는 0개였다 |
| 그림 파일 확인 | `tools/image-identity.mjs` | 두 빌드가 같은 자리에 같은 그림 파일을 쓰는지(주소의 순서와 sha256) |

## 3. 촬영: 갈래별 수

항목 1,617개, 두 빌드 모두 실패 0. 촬영 3,108건(해당 없음 9건 포함). 영역 그림은 기준 5,268장, 결과 6,198장.
픽셀과 구조만 본 1차 분류(`SUMMARY.md`): identical 2,052, sub-threshold 72, structure 975, 해당 없음 9.

규칙에 비춘 분류(`screenshots/diff/after-result-vs-baseline-local/CLASSIFIED.md`):

| 갈래 | 수 | 뜻 |
|---|---|---|
| identical | 2,052 | 픽셀과 구조 기록이 전부 같다 |
| noise | 72 | 값 1~2 차이의 픽셀만 있다(기준선의 흔들림과 같은 종류) |
| intended (구역 확인함) | 378 | 차이가 규칙이 허락한 자리에만 있고, 허락되지 않은 구역은 전부 그대로다 |
| intended (구역 확인 못 함) | 231 | 구역을 찍지 않은 촬영. 219건은 홈, 박스, 후기 화면의 첫 화면 촬영(같은 항목의 전체 촬영이 구역을 확인함), 12건은 지갑(pending)의 음수 금액 표기 |
| background-only | 342 | 시트, 장면, 부품 자체는 그대로이고 뒤나 둘레의 화면만 다르다 |
| position-aa | 24 | 크기와 글이 같고 자리의 소수 부분만 달라 가장자리가 달리 그려졌다 |
| UNEXPLAINED | 0 | 아래 4장의 경과 참고 |
| not-applicable | 9 | 넓은 폭에 없는 메뉴 단추 |

차이가 난 화면은 홈, 박스 셋, `/reviews`, 그리고 그 위에 뜬 겹침 화면과 부품, 지갑(pending)의 음수 금액, 거래 상세 시트뿐이다. 계정, 지갑(그 밖의 상태), 출금, 보관함, 검증, 나온 상품, 이용 방법, 약관 13종, 옛 주소들은 identical 이거나 noise 다.

규칙별:

| 규칙 | 갈래 | 촬영 수 |
|---|---|---|
| W1-box (박스 상세의 후기 구역과 별점 줄) | intended | 324 |
| W1-box | background-only | 147 |
| W1-box | position-aa | 24 |
| W1-home-cards (카드의 별점과 후기 수) | intended | 171 |
| W1-home-cards | background-only | 189 |
| W1-reviews-page | intended | 90 |
| W1-review-sheet (후기 상세 시트) | intended | 6 |
| W1-card-primitive (박스 카드, 후기 카드) | intended | 24 |
| W1-box-first-link (박스 화면의 첫 링크) | intended | 12 |
| W2-amount-sign (`$-50` 을 `-$50` 으로) | intended | 24 |
| W2-amount-sign | background-only | 6 |

한 촬영에 규칙이 둘 붙을 수 있어 합이 촬영 수와 같지 않다.

### 3-1. 영역별 상태(의도된 화면에서 나머지가 그대로인가)

| 영역 | same | noise | aa-shift | differ | size | onlyA | onlyB | 읽는 법 |
|---|---|---|---|---|---|---|---|---|
| header | 342 | 0 | 0 | 0 | 0 | 0 | 0 | 그대로 |
| hero (홈 배너, W3 의 E-19, E-20 이 손댄 곳) | 50 | 52 | 0 | 0 | 0 | 0 | 0 | 그대로. noise 는 기준선에서도 나오던 값 1~2 차이 |
| screenhead, desc | 690 | 0 | 0 | 0 | 0 | 0 | 0 | 그대로 |
| search | 120 | 0 | 0 | 0 | 0 | 0 | 0 | 그대로 |
| chips | 285 | 0 | 0 | 6 | 0 | 33 | 0 | `/reviews` 의 박스 알약만 다르다(W1-reviews-page). 홈과 박스의 알약은 그대로 |
| card-photo | 368 | 40 | 0 | 0 | 0 | 0 | 0 | 그대로 |
| card-title, card-price | 816 | 0 | 0 | 0 | 0 | 0 | 0 | 그대로 |
| card-rating | 0 | 0 | 0 | 0 | 0 | 0 | 408 | 결과에만 있다(W1) |
| more | 102 | 0 | 0 | 0 | 0 | 0 | 0 | 그대로 |
| box-hero (대표 상품) | 12 | 171 | 0 | 0 | 0 | 0 | 0 | 그대로 |
| ratinglink | 0 | 0 | 0 | 0 | 0 | 0 | 183 | 결과에만 있다(W1) |
| reviews, reviews-sum, reviews-feed | 0 | 0 | 0 | 33 | 216 | 0 | 378 | 후기 자리(W1) |
| side (구매 옆 패널) | 153 | 0 | 30 | 0 | 0 | 0 | 0 | 그대로이거나 자리의 소수 부분 차이 |
| openbar (아래 막대) | 183 | 0 | 0 | 0 | 0 | 0 | 0 | 그대로 |
| contents (구성품) | 0 | 57 | 126 | 0 | 0 | 0 | 0 | 글과 크기는 전부 같다. 아래 3-2 |
| odds (확률) | 109 | 0 | 74 | 0 | 0 | 0 | 0 | 위와 같다 |
| notes (알아둘 것) | 117 | 0 | 66 | 0 | 0 | 0 | 0 | 위와 같다 |
| links | 22 | 0 | 17 | 0 | 0 | 0 | 0 | 위와 같다 |
| footer | 70 | 114 | 158 | 0 | 0 | 0 | 0 | 위와 같다 |
| empty | 6 | 0 | 0 | 0 | 0 | 6 | 0 | `/reviews?box=` 의 빈 상태가 결과에서는 후기 목록이다(W1) |
| search-rows | 10 | 2 | 0 | 0 | 0 | 0 | 0 | 그대로 |
| dialog (시트) | 267 | 9 | 0 | 12 | 6 | 0 | 0 | differ 12 는 거래 상세의 음수 금액(W2), size 6 은 후기 상세 시트(W1). 나머지 276개는 그대로 |
| scene (개봉, 여러 개 결과) | 39 | 3 | 0 | 0 | 0 | 0 | 0 | 그대로 |
| target (부품) | 213 | 3 | 24 | 0 | 36 | 0 | 0 | size 36 은 박스 카드, 후기 카드, 박스 화면의 첫 링크(W1). aa-shift 24 는 3-2 |

### 3-2. 자리 때문에 가장자리가 달리 그려진 것(aa-shift)

후기 구역의 높이가 소수(예: 346.19px)라서 그 아래의 요소가 기준과 다른 소수 자리에 놓인다. 같은 글과 사진이 다른 소수 자리에 그려져 가장자리 픽셀이 달라진다. 판정 조건은 크기 같음, 글 같음, 자리의 소수 부분 다름, 눈에 띄는 픽셀이 영역의 5% 미만이다.

| 영역 | 건수 | 가장 큰 비율 | 그 촬영 | 자리의 소수 부분(기준, 결과) |
|---|---|---|---|---|
| contents | 126 | 4.19% | `route/box-watch-rolex/zh-1024-guest__full` | y 0.438, 0.625 |
| odds | 74 | 3.78% | `route/box-gaming-playstation/zh-320-guest__full` | y 0.938, 0.532 |
| links | 17 | 2.74% | `route/reviews/zh-320-guest__full` | y 0.062, 0.782 |
| footer | 158 | 2.39% | `error/insufficient-held/zh-390-inventory+balanceQuarter__take-first` | y 0.75, 0.344 |
| notes | 66 | 2.37% | `overlay/odds/ko-390-guest__tables` | y 0.75, 0.344 |
| side | 30 | 1.46% | `route/box-gaming-playstation/zh-320-guest__full` | y 0.938, 0.532 |
| target | 24 | 17.32% | `active/summary/zh-1280-guest__active` | y 0.25, 0.547. 한 픽셀 밀어 견주면 0개 |

직접 본 것:
- 구성품의 가장 큰 경우(4.19%)의 차이 그림을 봤다. 사진 타일과 이름 줄이 줄 단위로 통째로 빨갛고, 그 사이의 줄은 깨끗하다. 줄마다 놓인 소수 자리가 달라 어떤 줄은 같은 픽셀 줄에, 어떤 줄은 한 픽셀 옆줄에 그려진 꼴이다. 내용이 바뀐 흔적은 없다.
- 이 조건만으로는 "같은 크기의 다른 사진"을 가려내지 못한다. 그래서 그림 파일을 따로 견줬다: 홈과 박스 셋, 세 언어(12화면)에서 후기 자리 밖 그림의 주소와 순서가 12화면 모두 같고, 그림 파일 137개의 sha256 이 전부 같다(`image-identity.json`).
- 부품 `summary`(박스 화면의 "상품별 확률 보기") 12건은 비율이 13~17% 다. 6배로 키워 나란히 보니 같은 글이 한 픽셀 위로 그려져 있었다. 결과 쪽을 한 픽셀(0, -1) 밀어 견주면 눈에 띄는 픽셀이 0개다. 이 시험을 조건에 더했다.

## 4. UNEXPLAINED 의 경과

| 단계 | UNEXPLAINED | 내용 |
|---|---|---|
| 첫 분류 | 17 | 부품 `summary` 12건(target 548~747픽셀), 홈 배너 5건(1,043픽셀 2건, 2픽셀 3건) |
| 한 픽셀 밀림 시험을 더한 뒤 | 5 | `summary` 12건이 position-aa 로(위 3-2 의 근거) |
| 설명 안 된 5개 항목을 두 쪽에서 다시 찍은 뒤 | 1 | 홈 배너 4건이 사라졌다. `route/home/zh-390-guest__full` 의 hero 가 다시 달랐다(값 1~32 차이 65,837픽셀, 문턱 넘는 것 2픽셀) |
| 그 한 항목을 한 번 더 찍은 뒤 | 0 | hero 영역의 다른 픽셀이 0개가 됐다 |

홈 배너 5건의 설명: 기준선 잡음 실행에서 잰 것과 같은 현상이다(`harness/README.md` 5-1: 배너의 카드 사진 셋이 같은 빌드에서도 6번에 1번쯤 다른 표본으로 그려진다. 배너 영역의 수만~15만 픽셀이 값 1~2 만큼 다르고 일부가 문턱을 넘는다). 다시 찍으면 사라졌고, 남은 한 건도 한 번 더 찍으니 사라졌다. 규칙으로 덮지 않았다. 다시 찍어 확인했다.
첫 분류의 기록은 `CLASSIFIED.first-pass.md`, `classified.first-pass.json` 에 남겼다(한 픽셀 밀림 시험을 더한 뒤, 다시 찍기 전의 것).

지금 남은 UNEXPLAINED 는 없다. 다만 이것은 "규칙과 다시 찍기로 전부 설명됐다"는 뜻이고, 9장의 한계 안에서의 말이다.

## 5. 흐름

기록: `flows/before-local`, `flows/after-result`, 비교 `flows/compare-after-result/FLOWS_COMPARE.md`.
시나리오 17개 × 변형 2개(ko-390, en-1440) = 34건. 두 빌드 모두 멈춘 것 0건. 두 쪽이 다 로컬이라 비밀번호 단계도 양쪽에서 실행됐다.

단계 366개: 같음 114, 의도된 차이 228, 설명 안 됨 0, 장부 다름 0, 검증 불가 24, 한쪽만 실행 0, 오류 0.
다른 칸 1,909개: W1-review-zone 1,812, W1-review-sheet 32, W1-reviews-page 28, W2-wallet-history 26, W1-lazy-images 11. 설명 안 되는 칸 0, 장부 칸 0.

| 시나리오 | 같음 | 의도된 차이 | 설명 안 됨 | 검증 불가 | 장부(저장된 값) | 맞은 규칙 |
|---|---|---|---|---|---|---|
| A 둘러보기 | 0 | 38 | 0 | 0 | 같음 (38단계) | W1-review-zone |
| B 분류와 검색 | 8 | 16 | 0 | 2 | 같음 (24단계) | W1-review-zone |
| C 비로그인 개봉 시도 | 0 | 16 | 0 | 4 | 같음 (16단계) | W1-review-zone |
| D 한 개 개봉 | 0 | 38 | 0 | 0 | 같음 (38단계) | W1-review-zone |
| D2 1달러 박스 | 0 | 8 | 0 | 0 | 같음 (8단계) | W1-review-zone |
| E 잔액 부족 | 0 | 10 | 0 | 2 | 같음 (10단계) | W1-review-zone |
| E2 부족하고 보관 상품 있음 | 0 | 12 | 0 | 0 | 같음 (12단계) | W1-review-zone |
| F 여러 개 개봉 | 2 | 24 | 0 | 0 | 같음 (26단계) | W1-review-zone |
| F2 1달러 박스 5개 | 0 | 8 | 0 | 0 | 같음 (8단계) | W1-review-zone |
| G 보관함 | 22 | 0 | 0 | 0 | 같음 (22단계) | 없음 |
| H 배송과 USDT 전환 | 20 | 4 | 0 | 2 | 같음 (24단계) | W2-wallet-history |
| H2 배송 중인 상품 | 12 | 0 | 0 | 2 | 같음 (12단계) | 없음 |
| H3 출금 입력 검증 | 16 | 0 | 0 | 2 | 같음 (16단계) | 없음 |
| I 결과 검증 | 14 | 8 | 0 | 2 | 같음 (22단계) | W1-review-zone |
| J 후기 | 10 | 12 | 0 | 4 | 같음 (22단계) | W1-reviews-page, W1-review-zone, W1-review-sheet |
| K 언어와 통화 | 2 | 20 | 0 | 0 | 같음 (22단계) | W1-review-zone |
| L 오류와 네트워크 실패 | 8 | 14 | 0 | 4 | 같음 (22단계) | W1-review-zone, W1-lazy-images |

읽는 법과 근거:
- 장부: 견준 342단계 전부에서 저장된 값(지갑, 보관함, 거래, 시드와 nonce, 세션, 저장 키)이 같다. `ledgerAllowed` 는 비어 있다(예외를 하나도 두지 않았다).
- W1-review-zone: 관찰값의 `reviewZone` 칸(후기 구역, 별점 줄, 카드의 별점)만 다르다는 뜻이다. 그 단계의 나머지 칸(제목, 단추, 링크, 알약, 행, 시트의 글, 개봉 결과의 글, 본문에서 후기 자리를 뺀 글 전체의 길이와 해시)은 같다. 홈이나 박스 화면이 뒤에 있는 단계 대부분이 이것이다.
- W2-wallet-history(H 의 12, 13번): 지갑 내역의 줄 수와 첫 줄이 다르다. 결과에는 받기 거래(+$950)가 내역에 나온다. 저장된 거래 기록은 두 쪽이 같다(화면에 보이는 것만 달라졌다).
- 시나리오 J: 기준은 알약을 눌러 거르고(branch: chip), 결과는 `/reviews?box=dollar-apple` 로 들어갔다(branch: query). 그 뒤의 단계(후기 하나 열기, 닫기, 박스 화면의 후기 절, 보관함에서 후기 쓰기, 입력 검증, 올리기, 올린 뒤의 상세)는 두 쪽 모두 실행됐고, 7번부터 11번은 같음이다.
- W1-lazy-images(L 의 3, 4, 5번): 그림 요청이 실패하는 단계에서 깨진 그림의 수가 다르다(예: 기준 6, 결과 2). `tools/_broken.mjs` 로 쟀다. 후기 구역이 구성품을 아래로 밀어(390 폭에서 구성품의 첫 사진이 y 1883 에서 3015 로) 화면 가까이에서 미리 불리는 lazy 그림이 줄었기 때문이다. 결과 쪽의 깨진 그림은 대표 사진 1장과 후기 사진이고, 구성품의 그림은 아직 불리지 않은 상태였다.
- 음수 금액 표기(W2-amount-sign)는 흐름에서는 한 칸도 나오지 않았다. 흐름이 지나는 화면에 음수 금액이 보이는 단계가 없다. 촬영에서는 30건이 이 규칙이다(지갑 pending 12, 거래 상세 시트 12, 그 시트 뒤의 화면만 다른 것 6).
- 규칙을 세 번 넓혔고 한 개를 더했다. 전부 시험 실행에서 값을 보고 근거를 `why` 에 적었다: J 의 포커스(알약을 누른 쪽에만 남음), 후기 시트 안의 행(열린 후기가 다름), 지갑에서 연 첫 줄의 행(다른 거래), lazy 그림.
- 검증 불가 24개: 정렬 조작 요소 없음, 입금 확인, 배송 신청과 출금 신청(내지 않음), 소셜 로그인, 인증 메일, 파일 고르는 창, 서버 세션, 오류 화면.

## 6. 연출

기록: `motion/before-local`, `motion/after-result`, 비교 `motion/compare-after-result/MOTION_COMPARE.md`. 경우 9개 × 3번, 끼어들기 5개, ko 폭 390. 연출만 따로 돌렸다.

단계별 길이(ms, 가운데 값, 기준 / 결과 (차이)):

| 경우 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 |
|---|---|---|---|---|---|---|---|
| one-normal | 30 / 30 (+0) | 531 / 535 (+4) | 150 / 143 (-7) | 174 / 177 (+3) | 346 / 358 (+12) | 886 / 885 (-1) | 1232 / 1243 (+11) |
| one-reduced | 30 / 30 (+0) | 없음 | 없음 | 없음 | 348 / 358 (+10) | 42 / 40 (-2) | 389 / 398 (+9) |
| five-normal | 31 / 30 (-1) | 533 / 532 (-1) | 151 / 145 (-6) | 173 / 177 (+4) | 349 / 360 (+11) | 887 / 885 (-2) | 1235 / 1245 (+10) |
| five-reduced | 30 / 30 (+0) | 없음 | 없음 | 없음 | 347 / 358 (+11) | 41 / 40 (-1) | 389 / 399 (+10) |
| one-item-normal | 35 / 38 (+3) | 531 / 527 (-4) | 149 / 152 (+3) | 175 / 174 (-1) | 347 / 348 (+1) | 889 / 891 (+2) | 1237 / 1242 (+5) |
| one-short | 29 / 29 (+0) | 228 / 231 (+3) | 107 / 111 (+4) | 127 / 126 (-1) | 352 / 351 (-1) | 492 / 492 (+0) | 843 / 848 (+5) |
| one-skip | 29 / 30 (+1) | 없음 | 없음 | 없음 | 353 / 355 (+2) | 224 / 241 (+17) | 581 / 592 (+11) |
| one-escape | 29 / 30 (+1) | 없음 | 없음 | 없음 | 354 / 352 (-2) | 195 / 197 (+2) | 549 / 549 (+0) |
| one-slow4x | 132 / 150 (+18) | 547 / 550 (+3) | 149 / 148 (-1) | 166 / 184 (+18) | 384 / 371 (-13) | 1007 / 1030 (+23) | 1386 / 1405 (+19) |

- 보통 조건의 차이는 -7ms 부터 +17ms 다. 기준선 잡음 실행(같은 커밋끼리)의 폭은 -12ms 부터 +9ms 였다. one-skip 의 +17ms 는 도구가 "결과 바로 보기"를 누르는 때(기대 단계에 들어간 뒤 150ms 기다림)에 달린 값이다.
- "볼 것" 표시 1칸: one-slow4x(CPU 4배 감속)의 누름→결과 +23ms. 이 경우만 5번씩 다시 쟀다. 기준 1015~1033(가운데 1025), 결과 1014~1076(가운데 1030), 차이 +5ms. 범위가 겹친다. 결과 쪽의 가장 긴 값(1076)이 기준(1033)보다 크다는 것은 그대로 적어 둔다(5번씩의 표본이다).
- 사건 순서: 9개 경우 모두 같다. CSS 애니메이션의 목록도 같다(끝남과 끊김을 한 가지로 봄). `v-op-pop` 이 끊긴 횟수는 연출이 있는 다섯 경우에서 기준 0~2/3, 결과 1~3/3 으로 두 쪽 모두 실행마다 갈린다(원본의 성질, 기준선에서도 같았다. 3번씩의 표본이라 두 쪽의 차이를 말할 수는 없다).
- 장부를 쓴 때: 두 빌드의 모든 실행(27번씩)에서 보관함 기록이 개봉 화면이 뜨기 전에, 결과가 드러나기 전에 저장됐다. one-normal 에서 누른 뒤 14~16ms 에 저장, 개봉 화면은 29~32ms.
- 끼어들기 5개(연출 도중 다시 누름, 같은 순간에 세 번 누름, 떠났다 돌아옴, 새로 고침, 뒤로 가기): 17개 단계 모두 두 빌드의 장부와 화면 상태가 같다. 어느 경우에도 개봉 거래는 한 번, 보관함 기록은 하나, 다음 nonce 는 1 이다.
- 끝난 뒤의 장부: 9개 경우 모두 같다.
- one-item-normal 은 큰 금액 확인창을 거친다. 두 빌드에서 똑같이 확인창이 뜬 뒤 600ms 를 기다려 확정을 눌렀다(결과 빌드의 350ms 잠금 때문). 길이는 확정을 누른 순간부터 잰다.

## 7. after-reviews

- 흐름 비교는 총괄이 돌린 것이 끝나 있었다(`flows/compare-after-reviews/FLOWS_COMPARE.md`: 같음 106, 다름 218, 검증 불가 20, 한쪽만 실행 22). 옛 도구의 기록이다. 새 도구로 다시 돌리지 않았다.
- 실패했던 `overlay/review-card` 여섯 항목을 다시 찍었다(여섯 모두 성공). 기준과 견주면 여섯 모두 intended (구역 확인함), 규칙 W1-review-sheet 와 W1-reviews-page 다(`screenshots/diff/after-reviews-review-card/CLASSIFIED.md`). 시트의 크기와 글이 다르다(새 후기 상세 시트).
- after-reviews 의 나머지 촬영은 요소 단위 영역이 없는 옛 도구의 것이라 새 분류를 돌리지 않았다.

## 8. 도구가 결과 빌드와 부딪친 곳(알아 둘 것)

- 결과 빌드의 확인창(`components/ui/Sheet.tsx` 의 Confirm)은 뜬 뒤 350ms 동안 확정 단추의 누름을 버리는데 그 판단을 `Date.now()` 로 한다. 검증 도구는 페이지의 시계를 세워 두므로 그 350ms 가 지나지 않아 확정이 영영 눌리지 않았다(첫 시험에서 개봉 촬영이 멈춤). 도구 쪽에서 확정을 누르기 직전에 시계를 1초 옮기도록 고쳤고, 두 빌드에 똑같이 적용했다. 제품의 결함은 아니다. 다만 그 잠금이 벽시계에 기대고 있어, 기기의 시계가 뒤로 가는 순간에는 확정이 한동안 눌리지 않을 수 있다는 점은 적어 둔다(재현하지 않았다. 코드에서 읽은 것이다).
- 후기 글의 언어(촬영 기록의 글에서 읽은 것): 결과 빌드는 영어와 중국어 화면에서도 첫 후기의 글이 한국어다(`overlay/review-card/en-390`, `zh-390`: "평타는 쳤네요 하자 없이 깨끗해요"). 기준의 예시 후기도 영어 화면에서 한국어였다. after-reviews 빌드의 영어 화면에서는 같은 자리에 중국어 후기가 보였다. 두 빌드의 후기 내용이 서로 다르다. 의도인지는 총괄이 정한다.

## 9. 실행하지 않은 것과 도구의 한계

실행하지 않은 것:
- 배포 사이트와의 비교(이번 사이클은 로컬 기준 빌드 대 로컬 결과 빌드다).
- after-reviews 의 전체 재촬영과 새 분류, 새 도구로의 흐름 재실행.
- 연출의 다른 폭과 언어(ko 폭 390 만), 탭 백그라운드, 소리 재생 실패, 실제 모바일 기기.
- 계정의 비밀번호 시트를 끝까지 가는 흐름(W2 의 성공 상태). 촬영은 시트를 연 첫 화면만 찍고(기준과 같았다), 흐름 시나리오에는 그 단계가 없다. 새 성공 상태와 새 한 줄은 이 도구로 보지 못했다.
- 출금의 차감 실패 경로(W2 의 E-01). 정상 흐름으로 닿지 않는다.
- 지갑 내역에 열기와 받기가 나오는 화면의 촬영. 촬영 계획의 지갑 프리셋에는 그런 거래가 없다. 흐름 H 의 관찰값과 단계 화면(`flows/after-result/H/*/12-지갑-내역.png`)으로만 봤다.
- 타입 검사와 단위 테스트(이번 일의 범위가 아니다).

도구의 한계:
- 구역을 따로 찍는 화면은 홈, 박스, 후기뿐이다. 구역과 구역 사이의 빈 자리는 견주지 않는다.
- "구역 확인 못 함" 231건 가운데 첫 화면 촬영 219건은 같은 항목의 전체 촬영이 구역을 확인한 것에 기대고, 지갑 12건은 글을 바꿔 쓰는 규칙으로만 설명된다(눈에 띄는 픽셀 194~458개).
- background-only 는 "시트나 부품 자체가 그대로"까지만 확인한다. 그 뒤의 화면은 같은 화면의 전체 촬영에서 구역별로 확인된 것에 기댄다.
- position-aa 의 조건은 크기, 글, 자리의 소수 부분, 5% 미만(또는 한 픽셀 밀림)이다. 그 픽셀이 전부 가장자리인지는 가장 큰 경우 몇 개만 눈으로 봤다. 사진이 같은 파일인지는 12화면에서 따로 확인했다(폭 1280 한 가지).
- 글은 촬영마다 700 덩어리까지, 구조 기록은 정해 둔 선택자만 본다. 박스 카드는 앞의 넷만 구역으로 찍는다.
- 흐름은 ko-390 과 en-1440 만 돌린다(zh 없음).
- 홈 배너의 카드 사진 흔들림은 통제하지 못한다. 다시 찍어 가린다.
- 증거의 크기: 기준 촬영 1.6GB, 결과 촬영 1.5GB, 비교 715MB, 흐름 45MB, 연출 18MB. 전부 추적되지 않는 파일이다.
