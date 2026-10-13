# 촬영 비교 요약

만든 시각: 2026-10-12T14:15:01.499Z

| | A | B |
|---|---|---|
| label | before-deployed | before-local |
| baseUrl | https://shinwon446-eng.github.io/voila-test-aresjoo | http://127.0.0.1:4173/voila-test-aresjoo |
| chrome | 154.0.8037.98 | 154.0.8037.98 |
| startedAt | 2026-10-12T14:13:29.475Z | 2026-10-12T14:13:44.783Z |
| items | 1617 | 1617 |
| failedItems | 0 | 0 |
| dir | C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\before\deployed | C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local |

이 문서는 통과와 실패를 말하지 않는다. 숫자와 차이의 종류를 적을 뿐이고, 판정은 사람이 아래 목록을 보고 한다.

## 1. 종류별 수

촬영 3108건 (그림을 견준 것 3099건)

| 종류 | 수 | 뜻 |
|---|---|---|
| identical | 2920 | 픽셀이 전부 같고 구조 기록도 같다 |
| sub-threshold | 178 | 값이 다른 픽셀이 있으나 눈에 띄는 차이(threshold 0.1)는 없다 |
| both-not-applicable | 9 | 두 쪽 모두 해당 없음(고른 요소가 그 폭에 없다) |
| solid-pixels | 1 | 가장자리 다듬기가 아닌 픽셀이 다르다(구조 기록은 같다) |

### 묶음별

| 묶음 | 전체 | identical | sub-threshold | aa-only | solid-pixels | structure | 그 밖 |
|---|---|---|---|---|---|---|---|
| active | 69 | 67 | 2 | 0 | 0 | 0 | 0 |
| empty | 54 | 50 | 4 | 0 | 0 | 0 | 0 |
| error | 90 | 88 | 2 | 0 | 0 | 0 | 0 |
| extra | 30 | 28 | 2 | 0 | 0 | 0 | 0 |
| focus | 69 | 68 | 1 | 0 | 0 | 0 | 0 |
| hover | 138 | 135 | 3 | 0 | 0 | 0 | 0 |
| long | 96 | 88 | 8 | 0 | 0 | 0 | 0 |
| overlay | 378 | 338 | 31 | 0 | 0 | 0 | 9 |
| route | 1728 | 1649 | 78 | 0 | 1 | 0 | 0 |
| state | 456 | 409 | 47 | 0 | 0 | 0 | 0 |

### 구조 차이의 종류별 촬영 수

없음.

## 2. 한쪽에만 있는 촬영

없음.


## 3. 두 쪽 모두 찍지 못한 촬영(견주지 못함)

없음.


## 4. 크기 불일치

없음.


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

없음.


## 9. 자리와 크기가 2px 넘게 다른 요소

없음.


## 10. 요소 수의 변화

없음.


## 11. 글꼴 차이

없음.


## 12. 콘솔과 요청 기록의 차이

없음.


## 13. 그 밖의 구조 차이(주소, 응답 상태, 문서 높이, 겹침 화면, 그림 수)

없음.


## 14. 사람이 볼 목록

solid 비율이 0.0100% 를 넘거나 구조 차이가 하나라도 있는 촬영 전부. 0건. solid 비율이 큰 순서.


## 15. 따로 분류한 미세 차이(가장자리 다듬기, 문턱 아래의 색 차이)

179건. 구조 차이가 없고 solid 비율이 문턱 아래인 것. 다른 픽셀이 많은 순서로 30건.

| 촬영 | 종류 | exact | aa | solid |
|---|---|---|---|---|
| state/box-pokemon-charizard/zh-390-funded__full | sub-threshold | 110023 (0.6667%) | 0 | 0 |
| overlay/signup/zh-390-guest__password | sub-threshold | 91080 (6.9176%) | 0 | 0 |
| overlay/balance/ko-390-funded__no-held | sub-threshold | 91005 (6.9119%) | 0 | 0 |
| overlay/login/en-390-guest__email | sub-threshold | 66948 (5.0848%) | 0 | 0 |
| state/box-pokemon-charizard/zh-390-funded__first | sub-threshold | 60752 (4.6142%) | 0 | 0 |
| route/home/en-320-guest__first | solid-pixels | 60114 (8.2683%) | 0 | 39 |
| route/box-pokemon-charizard/zh-1440-guest__first | sub-threshold | 37407 (2.8863%) | 0 | 0 |
| route/box-pokemon-charizard/zh-1920-guest__first | sub-threshold | 37368 (1.8021%) | 0 | 0 |
| route/home/ko-1440-guest__full | sub-threshold | 29989 (0.4482%) | 0 | 0 |
| route/home/ko-768-guest__full | sub-threshold | 29755 (0.6529%) | 0 | 0 |
| overlay/footer-controls/zh-390-guest__home-krw-full | sub-threshold | 27399 (0.3926%) | 0 | 0 |
| route/home/ko-390-guest__full | sub-threshold | 27397 (0.3945%) | 0 | 0 |
| state/home/en-390-zero__full | sub-threshold | 27392 (0.3847%) | 0 | 0 |
| state/home/ko-390-dailyUsed__full | sub-threshold | 27392 (0.3944%) | 0 | 0 |
| state/home/ko-390-inventory__first | sub-threshold | 16392 (1.2450%) | 0 | 0 |
| state/home/ko-390-inventory__full | sub-threshold | 16391 (0.2360%) | 0 | 0 |
| state/home/en-1440-inventory__full | sub-threshold | 8957 (0.1339%) | 0 | 0 |
| overlay/opening-one/zh-390-funded__result | sub-threshold | 6468 (0.4913%) | 0 | 0 |
| state/box-gaming-playstation/zh-1440-zero__first | sub-threshold | 6098 (0.4705%) | 0 | 0 |
| overlay/opening-one/ko-390-funded__take-confirm | sub-threshold | 1901 (0.1444%) | 0 | 0 |
| overlay/opening-one/zh-390-funded__take-confirm | sub-threshold | 1852 (0.1407%) | 0 | 0 |
| route/box-watch-rolex/zh-360-guest__full | sub-threshold | 1209 (0.0069%) | 0 | 0 |
| route/box-watch-rolex/en-360-guest__full | sub-threshold | 1186 (0.0067%) | 0 | 0 |
| route/box-watch-rolex/ko-360-guest__full | sub-threshold | 1186 (0.0068%) | 0 | 0 |
| overlay/currency-box/zh-390-funded__krw-full | sub-threshold | 399 (0.0020%) | 0 | 0 |
| state/box-watch-rolex/en-390-funded__full | sub-threshold | 326 (0.0016%) | 0 | 0 |
| long/box-krw/en-390-inventory+bigKrw__full | sub-threshold | 323 (0.0016%) | 0 | 0 |
| route/box-gaming-playstation/en-360-guest__full | sub-threshold | 291 (0.0019%) | 0 | 0 |
| overlay/item-box-rolex/ko-390-funded__photo-item | sub-threshold | 261 (0.0198%) | 0 | 0 |
| route/legal-refunds/zh-430-guest__full | sub-threshold | 258 (0.0050%) | 0 | 0 |

## 15-1. 두 쪽에 똑같이 있는 것(차이는 아니지만 알아 둘 것)

- 콘솔 오류가 같은 내용으로 있는 촬영: 12건. 예: "Failed to load resource: the server responded with a status of 404"
- 400 이상의 응답이 같은 내용으로 있는 촬영: 12건. 예: 404 /en/box/no-such-box/
- 끊은 요청(바깥 주소, GET 이 아닌 요청)이 같은 내용으로 있는 촬영: 0건
- 대체 글꼴의 불림 상태만 다른 촬영(글꼴 파일이 도착한 때의 차이, 그림에는 차이가 없을 수 있다): 2건
- 기다리다 시간이 넘은 것이 적힌 촬영: 0건

## 16. 읽는 법

- 사람이 볼 목록의 항목은 `reshoot.txt` 에 쉼표로 이어 적었다(0개). 두 환경에서 `node shots.mjs <label> <baseUrl> <outDir> --only "$(cat reshoot.txt)"` 로 다시 찍고 이 도구를 다시 돌린다. 한 번만 생긴 흔들림은 사라지고, 다시 찍어도 남는 차이만 진짜 차이다.
- 차이 그림은 이 폴더의 `<촬영 id>.diff.png` 다. 빨강은 다른 픽셀, 노랑은 가장자리 다듬기로 본 픽셀, 회색은 A 를 어둡게 깐 것이다.
- 원본 그림과 기록은 위 표의 A, B 폴더에 같은 이름(`.png`, `.json`)으로 있다.
- 긴 그림은 `node tools/crop.mjs` 로 잘라서 본다.
