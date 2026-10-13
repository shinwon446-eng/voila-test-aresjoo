# 촬영 비교 요약

만든 시각: 2026-10-12T13:25:09.066Z

| | A | B |
|---|---|---|
| label | before-deployed | before-local |
| baseUrl | https://shinwon446-eng.github.io/voila-test-aresjoo | http://127.0.0.1:4173/voila-test-aresjoo |
| chrome | 154.0.8037.98 | 154.0.8037.98 |
| startedAt | 2026-10-12T13:08:23.995Z | 2026-10-12T12:55:56.714Z |
| items | 1617 | 1617 |
| failedItems | 0 | 0 |
| dir | C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\before\deployed | C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\screenshots\after\baseline-local |

이 문서는 통과와 실패를 말하지 않는다. 숫자와 차이의 종류를 적을 뿐이고, 판정은 사람이 아래 목록을 보고 한다.

## 1. 종류별 수

촬영 3108건 (그림을 견준 것 3099건)

| 종류 | 수 | 뜻 |
|---|---|---|
| identical | 2974 | 픽셀이 전부 같고 구조 기록도 같다 |
| sub-threshold | 78 | 값이 다른 픽셀이 있으나 눈에 띄는 차이(threshold 0.1)는 없다 |
| solid-pixels | 24 | 가장자리 다듬기가 아닌 픽셀이 다르다(구조 기록은 같다) |
| structure | 16 | 구조 기록이 다르다(크기, 자리, 줄바꿈, 요소 수, 글, 그림, 글꼴 등) |
| both-not-applicable | 9 | 두 쪽 모두 해당 없음(고른 요소가 그 폭에 없다) |
| runtime-only | 7 | 그림과 구조는 같고 콘솔이나 요청 기록만 다르다 |

### 묶음별

| 묶음 | 전체 | identical | sub-threshold | aa-only | solid-pixels | structure | 그 밖 |
|---|---|---|---|---|---|---|---|
| active | 69 | 69 | 0 | 0 | 0 | 0 | 0 |
| empty | 54 | 50 | 4 | 0 | 0 | 0 | 0 |
| error | 90 | 85 | 2 | 0 | 3 | 0 | 0 |
| extra | 30 | 11 | 2 | 0 | 0 | 10 | 7 |
| focus | 69 | 68 | 1 | 0 | 0 | 0 | 0 |
| hover | 138 | 138 | 0 | 0 | 0 | 0 | 0 |
| long | 96 | 88 | 5 | 0 | 3 | 0 | 0 |
| overlay | 378 | 348 | 17 | 0 | 4 | 0 | 9 |
| route | 1728 | 1684 | 27 | 0 | 11 | 6 | 0 |
| state | 456 | 433 | 20 | 0 | 3 | 0 | 0 |

### 구조 차이의 종류별 촬영 수

| 차이 | 촬영 수 |
|---|---|
| console | 12 |
| loadedFonts | 10 |
| overflowX | 6 |

## 2. 한쪽에만 있는 촬영

없음.


## 3. 두 쪽 모두 찍지 못한 촬영(견주지 못함)

없음.


## 4. 크기 불일치

없음.


## 5. 가로 넘침(문서 폭이 창 폭보다 넓다)

6건

- route/home/en-1024-guest__first: A 1028, B 1028, 창 1024
- route/home/en-1024-guest__full: A 1028, B 1028, 창 1024
- route/home/ko-1024-guest__first: A 1028, B 1028, 창 1024
- route/home/ko-1024-guest__full: A 1028, B 1028, 창 1024
- route/home/zh-1024-guest__first: A 1028, B 1028, 창 1024
- route/home/zh-1024-guest__full: A 1028, B 1028, 창 1024

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

10건

- extra/not-found-box/en-1440-guest__first: 불린 글꼴 목록이 다르다
- extra/not-found-box/en-1440-guest__full: 불린 글꼴 목록이 다르다
- extra/not-found-box/ko-1440-guest__first: 불린 글꼴 목록이 다르다
- extra/not-found-box/ko-1440-guest__full: 불린 글꼴 목록이 다르다
- extra/not-found/en-1440-guest__first: 불린 글꼴 목록이 다르다
- extra/not-found/en-1440-guest__full: 불린 글꼴 목록이 다르다
- extra/not-found/en-390-guest__first: 불린 글꼴 목록이 다르다
- extra/not-found/en-390-guest__full: 불린 글꼴 목록이 다르다
- extra/not-found/ko-1440-guest__first: 불린 글꼴 목록이 다르다
- extra/not-found/ko-1440-guest__full: 불린 글꼴 목록이 다르다

## 12. 콘솔과 요청 기록의 차이

12건

- extra/not-found-box/en-1440-guest__first: console A에만 ["Failed to load resource: the server responded with a status of 404 ()"] B에만 ["Failed to load resource: the server responded with a status of 404 (Not Found)"]
- extra/not-found-box/en-390-guest__first: console A에만 ["Failed to load resource: the server responded with a status of 404 ()"] B에만 ["Failed to load resource: the server responded with a status of 404 (Not Found)"]
- extra/not-found-box/ko-1440-guest__first: console A에만 ["Failed to load resource: the server responded with a status of 404 ()"] B에만 ["Failed to load resource: the server responded with a status of 404 (Not Found)"]
- extra/not-found-box/ko-390-guest__first: console A에만 ["Failed to load resource: the server responded with a status of 404 ()"] B에만 ["Failed to load resource: the server responded with a status of 404 (Not Found)"]
- extra/not-found-box/zh-1440-guest__first: console A에만 ["Failed to load resource: the server responded with a status of 404 ()"] B에만 ["Failed to load resource: the server responded with a status of 404 (Not Found)"]
- extra/not-found-box/zh-390-guest__first: console A에만 ["Failed to load resource: the server responded with a status of 404 ()"] B에만 ["Failed to load resource: the server responded with a status of 404 (Not Found)"]
- extra/not-found/en-1440-guest__first: console A에만 ["Failed to load resource: the server responded with a status of 404 ()"] B에만 ["Failed to load resource: the server responded with a status of 404 (Not Found)"]
- extra/not-found/en-390-guest__first: console A에만 ["Failed to load resource: the server responded with a status of 404 ()"] B에만 ["Failed to load resource: the server responded with a status of 404 (Not Found)"]
- extra/not-found/ko-1440-guest__first: console A에만 ["Failed to load resource: the server responded with a status of 404 ()"] B에만 ["Failed to load resource: the server responded with a status of 404 (Not Found)"]
- extra/not-found/ko-390-guest__first: console A에만 ["Failed to load resource: the server responded with a status of 404 ()"] B에만 ["Failed to load resource: the server responded with a status of 404 (Not Found)"]
- extra/not-found/zh-1440-guest__first: console A에만 ["Failed to load resource: the server responded with a status of 404 ()"] B에만 ["Failed to load resource: the server responded with a status of 404 (Not Found)"]
- extra/not-found/zh-390-guest__first: console A에만 ["Failed to load resource: the server responded with a status of 404 ()"] B에만 ["Failed to load resource: the server responded with a status of 404 (Not Found)"]

## 13. 그 밖의 구조 차이(주소, 응답 상태, 문서 높이, 겹침 화면, 그림 수)

없음.


## 14. 사람이 볼 목록

solid 비율이 0.0100% 를 넘거나 구조 차이가 하나라도 있는 촬영 전부. 37건. solid 비율이 큰 순서.

| 촬영 | 종류 | solid | aa | exact | 다른 띠(세로 구간) | 구조 차이 |
|---|---|---|---|---|---|---|
| extra/not-found-box/en-1440-guest__first | structure | 0 (NaN%) | 0 | 0 |  | loadedFonts, console |
| extra/not-found-box/en-1440-guest__full | structure | 0 (NaN%) | 0 | 0 |  | loadedFonts |
| extra/not-found-box/en-390-guest__first | runtime-only | 0 (NaN%) | 0 | 0 |  | console |
| extra/not-found-box/ko-1440-guest__first | structure | 0 (NaN%) | 0 | 0 |  | loadedFonts, console |
| extra/not-found-box/ko-1440-guest__full | structure | 0 (NaN%) | 0 | 0 |  | loadedFonts |
| extra/not-found-box/ko-390-guest__first | runtime-only | 0 (NaN%) | 0 | 0 |  | console |
| extra/not-found-box/zh-1440-guest__first | runtime-only | 0 (NaN%) | 0 | 0 |  | console |
| extra/not-found-box/zh-390-guest__first | runtime-only | 0 (NaN%) | 0 | 0 |  | console |
| extra/not-found/en-1440-guest__first | structure | 0 (NaN%) | 0 | 0 |  | loadedFonts, console |
| extra/not-found/en-1440-guest__full | structure | 0 (NaN%) | 0 | 0 |  | loadedFonts |
| extra/not-found/en-390-guest__first | structure | 0 (NaN%) | 0 | 0 |  | loadedFonts, console |
| extra/not-found/en-390-guest__full | structure | 0 (NaN%) | 0 | 0 |  | loadedFonts |
| extra/not-found/ko-1440-guest__first | structure | 0 (NaN%) | 0 | 0 |  | loadedFonts, console |
| extra/not-found/ko-1440-guest__full | structure | 0 (NaN%) | 0 | 0 |  | loadedFonts |
| extra/not-found/ko-390-guest__first | runtime-only | 0 (NaN%) | 0 | 0 |  | console |
| extra/not-found/zh-1440-guest__first | runtime-only | 0 (NaN%) | 0 | 0 |  | console |
| extra/not-found/zh-390-guest__first | runtime-only | 0 (NaN%) | 0 | 0 |  | console |
| route/home/en-1024-guest__first | structure | 0 (NaN%) | 0 | 0 |  | overflowX |
| route/home/ko-1024-guest__full | structure | 0 (NaN%) | 0 | 0 |  | overflowX |
| route/home/zh-1024-guest__first | structure | 0 (NaN%) | 0 | 0 |  | overflowX |
| error/search-hit/ko-1440-guest__hits | solid-pixels | 1906 (0.1471%) | 0 | 6537 | 373~408, 518~555, 591~628, 664~701 외 3 |  |
| error/search-hit/en-1440-guest__hits | solid-pixels | 1429 (0.1103%) | 0 | 4768 | 445~481, 591~628, 664~701, 737~762 외 1 |  |
| route/box-watch-rolex/zh-1024-guest__full | solid-pixels | 7825 (0.0868%) | 0 | 71909 | 6092~6152, 6277~6336, 6464~6523, 6650~6711 외 2 |  |
| route/home/en-390-guest__first | solid-pixels | 1003 (0.0762%) | 0 | 148602 | 369~369, 398~586 |  |
| route/home/zh-430-guest__first | solid-pixels | 1160 (0.0724%) | 0 | 163382 | 369~369, 398~586 |  |
| error/search-hit/zh-1440-guest__hits | solid-pixels | 687 (0.0530%) | 0 | 2469 | 518~555, 591~628, 883~899 |  |
| route/box-watch-rolex/en-1280-guest__full | solid-pixels | 5786 (0.0465%) | 0 | 52570 | 6815~6891, 7230~7306, 7853~7929 |  |
| route/box-watch-rolex/zh-1280-guest__full | solid-pixels | 5786 (0.0465%) | 0 | 52570 | 6815~6891, 7230~7306, 7853~7929 |  |
| state/box-watch-rolex/en-1440-funded__full | solid-pixels | 6019 (0.0428%) | 0 | 51627 | 6815~6891, 7230~7306, 7646~7722 |  |
| overlay/currency-box/zh-1440-funded__krw-full | solid-pixels | 5786 (0.0412%) | 0 | 52570 | 6815~6891, 7230~7306, 7853~7929 |  |
| state/box-watch-rolex/zh-1440-funded__full | solid-pixels | 5079 (0.0361%) | 0 | 49691 | 6815~6879, 7230~7306, 7646~7722 |  |
| long/box-krw/zh-1440-inventory+bigKrw__full | solid-pixels | 1762 (0.0125%) | 0 | 18669 | 6815~6889, 7853~7929 |  |
| long/box-krw/en-1440-inventory+bigKrw__full | solid-pixels | 1569 (0.0112%) | 0 | 15358 | 6815~6889, 7853~7929 |  |
| state/box-watch-rolex/ko-1440-funded__full | solid-pixels | 1569 (0.0112%) | 0 | 15358 | 6815~6889, 7853~7929 |  |
| route/home/en-1024-guest__full | structure | 0 (0.0000%) | 0 | 24148 |  | overflowX |
| route/home/ko-1024-guest__first | structure | 0 (0.0000%) | 0 | 47 |  | overflowX |
| route/home/zh-1024-guest__full | structure | 0 (0.0000%) | 0 | 24148 |  | overflowX |

## 15. 따로 분류한 미세 차이(가장자리 다듬기, 문턱 아래의 색 차이)

88건. 구조 차이가 없고 solid 비율이 문턱 아래인 것. 다른 픽셀이 많은 순서로 30건.

| 촬영 | 종류 | exact | aa | solid |
|---|---|---|---|---|
| overlay/odds-pokemon/ko-390-guest__tables | sub-threshold | 122486 (0.4349%) | 0 | 0 |
| state/box-pokemon-charizard/ko-390-funded__full | sub-threshold | 122486 (0.7405%) | 0 | 0 |
| route/box-pokemon-charizard/zh-1920-guest__full | sub-threshold | 95807 (0.4801%) | 0 | 0 |
| route/box-pokemon-charizard/zh-1920-guest__first | sub-threshold | 88019 (4.2447%) | 0 | 0 |
| overlay/login/ko-390-guest__email | sub-threshold | 79083 (6.0064%) | 0 | 0 |
| state/box-pokemon-charizard/ko-390-funded__first | sub-threshold | 60754 (4.6143%) | 0 | 0 |
| state/home/ko-1440-firstVisit__full | sub-threshold | 52749 (0.7884%) | 0 | 0 |
| route/home/ko-390-guest__full | sub-threshold | 41281 (0.5944%) | 0 | 0 |
| state/home/ko-1440-zero__full | sub-threshold | 38947 (0.5821%) | 0 | 0 |
| error/login-invalid/zh-390-guest__error | sub-threshold | 35906 (2.7271%) | 0 | 0 |
| route/home/zh-1280-guest__full | sub-threshold | 29989 (0.5090%) | 0 | 0 |
| route/home/zh-1440-guest__full | sub-threshold | 29989 (0.4482%) | 0 | 0 |
| route/home/zh-1920-guest__full | sub-threshold | 29989 (0.3271%) | 0 | 0 |
| state/home/zh-1440-dailyUsed__full | sub-threshold | 29989 (0.4482%) | 0 | 0 |
| route/home/ko-768-guest__full | sub-threshold | 29729 (0.6523%) | 0 | 0 |
| route/home/ko-320-guest__full | sub-threshold | 28057 (0.5176%) | 0 | 0 |
| overlay/footer-controls/en-390-guest__home-krw-full | sub-threshold | 27392 (0.3847%) | 0 | 0 |
| state/home/ko-1440-firstVisit__first | sub-threshold | 22698 (1.7514%) | 0 | 0 |
| route/home/ko-390-guest__first | sub-threshold | 13889 (1.0549%) | 0 | 0 |
| long/box-krw/ko-1440-inventory+bigKrw__full | solid-pixels | 12413 (0.0883%) | 0 | 1167 |
| route/box-watch-rolex/en-1440-guest__full | solid-pixels | 12413 (0.0883%) | 0 | 1167 |
| route/box-watch-rolex/en-1920-guest__full | solid-pixels | 12413 (0.0654%) | 0 | 1167 |
| route/box-watch-rolex/ko-1280-guest__full | solid-pixels | 12413 (0.0998%) | 0 | 1167 |
| route/box-watch-rolex/ko-1920-guest__full | solid-pixels | 12413 (0.0654%) | 0 | 1167 |
| route/home/ko-320-guest__first | sub-threshold | 9177 (1.2622%) | 0 | 0 |
| overlay/opening-one/ko-390-funded__result | sub-threshold | 6489 (0.4928%) | 0 | 0 |
| route/box-watch-rolex/en-1024-guest__full | solid-pixels | 5978 (0.0663%) | 0 | 518 |
| long/box-krw/ko-1440-inventory+bigKrw__first | sub-threshold | 1883 (0.1453%) | 0 | 0 |
| route/box-watch-rolex/ko-1024-guest__full | solid-pixels | 1748 (0.0194%) | 0 | 204 |
| overlay/balance-held/ko-1440-inventory__take | solid-pixels | 1024 (0.0790%) | 0 | 44 |

## 16. 읽는 법

- 차이 그림은 이 폴더의 `<촬영 id>.diff.png` 다. 빨강은 다른 픽셀, 노랑은 가장자리 다듬기로 본 픽셀, 회색은 A 를 어둡게 깐 것이다.
- 원본 그림과 기록은 위 표의 A, B 폴더에 같은 이름(`.png`, `.json`)으로 있다.
- 긴 그림은 `node tools/crop.mjs` 로 잘라서 본다.
