# 샘플 후기 적대 검수

판정: 아래 합치기 차단 항목 4개를 해결하기 전에는 감사 브랜치에 합치지 않는 편이 맞다. 샘플을 만드는 결정은 검수 대상에서 제외했다. 차단 이유는 DESIGN.md A-3 18번의 글 의미, 재개봉 권유 금지, 별점 일관성, 박스 카드와 상세의 동일한 집계 요구다.

대상은 `feat/sample-reviews`, `63445c7..9668b13`이다. AGENTS.md, DESIGN.md 전체와 A-3 18번, REDESIGN_BRIEF.md, qa/PROGRESS.md를 읽었다. `git diff 63445c7..HEAD --stat`의 변경 파일 13개와 전체 diff를 검토했다. 구현 파일은 수정하지 않았다. 커밋, 푸시, 체크아웃 등 Git 상태를 바꾸는 명령과 next build는 실행하지 않았다. `.env`와 비밀키는 열지 않았다.

증거 표기는 다음과 같다. **화면**은 제공된 PNG 또는 기존 개발 서버에서 본 화면, **코드**는 파일과 diff에서 확인한 사실, **실행**은 명령으로 측정하거나 재현한 결과, **판단**은 그 증거에 대한 검수 의견이다. 정적 내보내기 결과물을 새로 빌드한 검사는 하지 않았다.

## 1. 합치기 전에 막아야 할 것

### B1. 상품 분류가 실제 상품과 다른 말을 허용한다

**실행과 화면:** 홈의 새 박스에서도 잘못된 상품 말이 나왔다. 후기 번호는 새것부터 1번으로 센다. 예를 들어 31번의 실제 ID는 `s-watch-rolex-30`이다.

| 박스와 후기 번호 | 연결 상품 | 생성 글 | 문제 |
|---|---|---|---|
| watch-rolex 31 | 뫼비우스 9010 합성 시계 오일 2ml | 드디어 시계 받았어요 | 오일을 시계로 부름 |
| bag-chanel 4 | 샤넬 N°5 오 드 빠르펭 100ml | 백 뽑았어요. 겉박스 모서리가 좀 찍혀있었어요. | 향수를 가방으로 부름 |
| bag-chanel 66 | 샤넬 코코 마드모아젤 오 드 빠르펭 100ml | 들고 나가면 다들 물어봐요 배송 안내도 바로바로 와서 좋았어요 | 가방 전용 조각이 향수에 붙음 |
| beauty-dior 52 | 세타필 젠틀 스킨 클렌저 237ml | 충전하고 바로 열었는데 결과 바로 나와서 좋네요 흡수 빨라요 | 씻어내는 세안제에 흡수 이야기가 붙음 |
| sport-wilson 12 | 게토레이 스퀴즈 보틀 32oz | 얼음이 저녁까지 남아있어요 다음 박스도 기대중 | 상품의 보냉 사양 확인 없이 보냉 용기 전용 말이 붙음 |
| sport-wilson 94 | 같은 물병 | 소소한게 나왔네요. 텀블러 받고 기분 좋네요. | 상품 종류의 이름이 바뀜 |

**코드:** `web/lib/reviewSampleText.ts:1406`의 시계 부속품 제외 목록에는 오일이 없다. 다음 줄의 watch 전체 일치 규칙이 시계 이름과 손목 조각을 준다. `:1423`의 가방 부속품 제외 규칙은 퍼퓸과 뚜왈렛을 처리하지만 빠르펭은 빠져 있고, `:1459`의 80달러 이상 전체 일치 규칙이 향수를 가방으로 분류한다. `:2009`는 세안제와 바르고 남기는 제품을 같은 조각 묶음으로 처리한다. 물병과 보냉 텀블러도 같은 묶음이다.

**실행과 화면:** 홈에 없는 옛 박스에서는 더 심각하다.

| 박스와 후기 번호, ID | 연결 상품 | 생성 글 |
|---|---|---|
| vault-pokemon 35, s-vault-pokemon-34 | Scarlet & Violet 151 피카츄 미등급 NM | 열어본 보람이 있네요. 새제품으로 왔어요. |
| vault-pokemon 140, s-vault-pokemon-139 | Crown Zenith 글레이시아 VSTAR 미등급 NM | 오오 너무 좋아요 매일 써요 굿 |
| jackpot-supercar 204, s-jackpot-supercar-203 | 닛산 GT-R 니스모 | box was a bit dented, item is perfect |
| jackpot-supercar 66, s-jackpot-supercar-65 | 아프릴리아 RSV4 팩토리 | 하자 없이 깨끗해요 배송은 생각보다 오래 걸렸어요 |

35번과 204번은 `http://localhost:3003/ko/box/vault-pokemon`, `/ko/box/jackpot-supercar`에서 더 보기를 눌러 직접 확인했다. 낱장 카드에 새제품이라는 말이 붙고 자동차에 택배 상자 이야기가 붙는 이전 문제가 남아 있다.

**코드:** `web/lib/reviewSamples.ts:193`은 박스 카테고리가 TOPICS의 새 카테고리 이름과 같아야 상품을 분류한다. 옛 박스 카테고리는 collect, jackpot, luxury, dollar, tech다. 미등급 카드와 차량도 `:202`의 기본 goods로 떨어져 새 상품, 택배, 사용 가능 조건을 받는다. 테스트의 의미 전수 순회는 `web/tests/reviewSamples.test.ts:21`에서 HOME_BOXES만 순회하므로 이 14개를 놓친다. 전체 BOXES를 보는 상품 검사도 카탈로그 소속과 사진, 디지털 상품 조건만 확인한다.

**판단:** 카테고리 전체 일치에 기대기보다 실제 상품 종류를 먼저 구분해야 한다. 특히 옛 상품도 같은 의미 검사를 받아야 한다. 테스트가 생성기의 kindOf 판정을 그대로 신뢰하는 것만으로는 잘못된 분류를 검증할 수 없다. 물병의 실제 보냉 성능은 이번 코드 검수에서 제조사 자료로 확인하지 않았으므로 그 행은 추가 확인 후보다. 향수를 백으로 부르는 행과 옛 카드 및 차량 행은 상품 이름과 글만으로 오류가 확인된다.

### B2. 재개봉을 권하는 글이 그대로 생성된다

**실행:** 아래 다섯 문구를 실제 글에서 검색한 결과 전체 79,513건 중 1,589건에 있었다. 검색 문구는 `한번 더 열어볼게요`, `한번 더 열어봐야겠어요`, `다음 박스도 기대중`, `will open again`, `would do it again`이다. 이 수치는 다른 재이용 표현까지 센 수가 아니다.

- car-rolls-royce 42, 별 3개: `쓸일은 없을거같은데 일단 받았어요 한번 더 열어봐야겠어요`
- watch-rolex 26, 별 3개: `원하던건 아니라서 별 셋 한번 더 열어봐야겠어요`
- watch-rolex 98, 별 4개: `큰건 아니지만 배송 일주일 걸렸어요 한번 더 열어볼게요`
- mobile-apple 52, 별 5개: `받아보니 마음에 들어요 다음 박스도 기대중 ㅎㅎ 굿`
- car-rolls-royce 19, 별 5개: `Third box and I pulled this, will open again`

**코드:** 문구가 `web/lib/reviewSampleText.ts:335`, `:336`, `:447`, `:615`에 직접 들어 있다. 특히 MID_CLOSE의 재개봉 문구는 아쉬운 결과를 말한 뒤에 붙도록 조건까지 지정돼 있다. 테스트의 PUSH 정규식은 `한번만더해보고`와 `keepopening` 등만 찾고 위 표현들을 놓친다.

**판단:** DESIGN.md A-3 18번의 재개봉 권유 금지에 직접 어긋난다. 일반적인 재방문 인사와 구분해, 추가 박스를 열겠다는 문구와 아쉬운 결과 뒤의 재도전 문구를 제거해야 한다.

### B3. 별 4개인데 글은 만점이라고 말한다

**실행:** 전체에서 별 4개이면서 `10/10`을 적은 글은 55건이다. 여덟 박스 800건 안에서도 car-rolls-royce 76번이 재현된다. BBS LM 19x8.5 단조 휠 1개에 별 4개를 주면서 `Nicer than the photos. 10/10 :)`이라고 쓴다.

**코드:** `web/lib/reviewSampleText.ts:617`의 EN.close에 10/10이 조건 없이 들어 있다. `web/lib/reviewSamples.ts:341`의 foreignText는 좋은 별 4개와 별 5개에서 같은 맺음말 묶음을 쓴다. 한국어의 `별 다섯개 드려요`에는 r5 조건을 달았지만 영어의 만점에는 달지 않았다. 별점 테스트는 close라는 조각 구실과 긍정 여부만 검증하므로 통과한다.

**판단:** 명시적으로 점수를 말하는 조각은 그 점수와 일치해야 한다. 작은 상품에 별 5개를 주는 것 자체는 문제가 아니다.

### B4. 스위치를 끄면 실제 후기가 있어도 홈 카드의 별점은 사라진다

**실행과 화면:** 격리한 Playwright 브라우저에 mobile-apple의 별 1개 실제 후기 형식 기록 3건을 넣었다. 상세는 `4.4, 후기 243개`, 목록은 `전체 243건`으로 바뀌었다. 같은 브라우저의 홈 카드는 `4.5 (240)`이었다.

**코드:** `web/components/box/BoxList.tsx:117`은 `ratingSummary(box.slug)`만 호출한다. 반면 `web/components/box/BoxReviews.tsx:151`은 실제 후기 별점을 extra로 전달한다. off이면 전자는 언제나 count 0, avg null이어서 새 박스의 별점 줄을 없앤다. 실제 후기가 있는 박스도 똑같다. 상세와 모아 보기는 실제 후기를 계속 센다.

**실행:** off에서 `ratingSummary(slug, [5, 1])`은 count 2, avg 3, dist `[1,0,0,0,1]`이다. extra를 생략한 카드 호출은 count 0, avg null이다. 이 동작은 코드 경로와 함수 실행으로 확인했으며, 실행 중인 개발 서버의 빌드 스위치를 변경해 off 화면을 찍은 것은 아니다.

**판단:** BoxList가 실제 후기를 더하지 않는 호출은 기준 커밋에도 있었다. 새로 생긴 돈 계산 회귀로 분류하지 않는다. 다만 이번 브랜치가 도입한 off 요구와 카드 집계 일치 요구를 완성하지 못한 통합 결함이다. 실제 후기까지 포함하는 동일한 집계를 카드에 연결해야 한다.

## 2. 고치면 좋은 것

### I1. 연속 10건에서 같은 조각이 다시 나온다

**실행:** 800건의 모든 연속 10건 구간을 훑었다. 공백과 마침표를 제거해 7자 이상 원본 조각을 비교했다. 아래는 단순한 웃음이나 짧은 인사를 제외하고도 남는 사례다.

| 박스 | 10건 구간 | 반복 조각 | 후기 번호 |
|---|---|---|---|
| bag-chanel | 66~75 | 들고 나가면 다들 물어봐요 | 66, 72 |
| bag-chanel | 81~90 | 가방 실물 깡패네요 | 82, 86 |
| toy-lego | 69~78 | 조립하는 재미가 있네요 | 69, 75 |
| toy-lego | 68~77 | 이번판은 소소합니다 | 68, 77 |
| sport-wilson | 74~83 | 운동 갈때 챙겨요 | 74, 83 |
| sport-wilson | 91~100 | 소소한게 나왔네요 | 94, 100 |

**코드와 판단:** draw는 한 묶음을 소진하거나 남은 조건이 안 맞으면 다시 섞는다. 가까운 10건의 사용 이력을 보지 않는다. 전체 문장이 다른 것은 확인됐지만, 동일 문장 유일성 검사가 화면 단위 조각 반복을 막지는 않는다. 가까운 글의 반복을 줄이면 샘플 느낌을 판단하기 좋다.

### I2. 조각을 합친 뒤의 의미와 문체를 검사하지 않는다

**실행:** 추가 전수 검색에서 computer-apple 82번은 `노트북 미개봉이에요 바로 개시했어요 ~`였다. 현재 미개봉이라는 말과 이미 사용을 시작했다는 말이 한 글에 붙는다. 반대로 `미개봉으로 왔습니다 잘 쓰고 있어요`는 받은 뒤 열어서 썼다는 뜻이므로 모순으로 세지 않았다.

bag-chanel 74번의 `물건 잘 받았습니다 덕분에 잘 받았습니다 ㅋㅋ`, toy-lego 81번의 `잘 받았습니다 기분 좋게 받았어요 ㅋㅋ`는 같은 내용을 반복하는 인사 조합이다. car-rolls-royce 48번의 `기대했던건 아니지만 안그래도 사려던거였어요`도 서로 다른 선호 조각을 기계적으로 붙인 티가 난다. 후자는 기대와 구매 의향이 다를 수도 있으므로 사실 오류로 단정하지 않는다.

**판단:** 조건 비트는 상품 종류, 돈, 배송을 일부 거르지만 현재 상태와 과거 상태, 문장 사이의 중복 의미까지 확인하지 않는다. 상품 고유 특성 오류는 B1에서 먼저 고치고, 이런 조합은 별도로 다듬으면 좋다.

### I3. 내 후기의 상대 시간과 샘플 사이 순서가 열린 화면에서 멈춘다

**실행:** 새 글, 샘플 4번과 5번 사이 시각의 글, 아주 오래된 글을 넣었다. 첫 목록은 `내 새 글, 샘플 1~4, 내 중간 글, 샘플 5~8` 순서였다. 현재 시각 기준 혼합과 잘라내기는 맞다. 더 보기에서 10건이 30건으로 늘어나는 것도 확인했다.

브라우저의 Date.now만 366일 앞으로 옮긴 뒤 더 보기를 눌렀다. 내 새 글은 여전히 `방금 전`, 내 중간 글은 `4일 전`이며 같은 위치였다. 페이지를 다시 방문하면 다시 계산된다.

**코드:** `web/components/box/BoxReviews.tsx:127`의 now는 useMemo 안에서만 읽는다. dependencies에는 시각이 없고 갱신 타이머도 없다. 샘플의 ageMin은 의도적으로 고정이지만 실제 글의 나이까지 고정할 필요는 없다.

**판단:** 긴 체류, 탭 복귀에서도 실제 글의 시간과 샘플에 대한 위치를 갱신하면 좋다. 이 문제와 서버 및 브라우저의 최초 렌더 불일치는 다른 문제다.

### I4. 모아 보기의 전체는 옛 박스 14개를 제외한다

**코드와 실행:** sampleReviews는 BOXES 334개에서 총 79,513건을 만든다. newestOrder와 allRatingSummary는 HOME_BOXES 320개만 사용한다. `/ko/reviews`에서는 `전체 75,245건`이었다. 옛 박스의 4,268건은 그 박스를 지정한 목록에서는 나오지만 전체 모아 보기에는 없다. 기준 커밋의 모아 보기에는 옛 박스 샘플이 포함돼 있었다.

**판단:** 홈에 나오는 박스만 모은다는 의도라면 범위를 설명해야 한다. 주소로 열 수 있는 옛 박스도 포함한 전체를 뜻한다면 두 함수의 모집단을 맞춰야 한다. 75,245라는 수 자체가 해당 목록과 어긋나지는 않는다.

## 3. 지난 지적의 수정 판정

| 항목 | 판정 | 근거 |
|---|---|---|
| 상품과 맞지 않는 말 | 일부만 | 부속품 제외 규칙은 늘었지만 오일, 향수, 세안제, 물병 사례가 남음. B1 |
| 별점과 글의 어긋남 | 일부만 | 낮은 별점 뒤 감사나 웃음은 검사되지만 별 4개의 만점 글 55건이 남음. B3 |
| 받을 금액이 박스 가격 미만인데 본전이나 이득이라고 함 | 고쳐짐 | 실제 95% 반올림 수령액 기준으로 전체 검사. 검사한 손익 문구 위반 0건 |
| 낱장 카드에 밀봉이나 새제품 | 일부만 | 새 pokemon 분류의 낱장 및 등급 카드 3,029건 검색은 위반 0. 옛 미등급 카드에는 새제품과 새거가 남음. B1 |
| 자동차에 택배 이야기 | 일부만 | 새 vehicle 분류 95건에는 해당 표현이 없었음. 옛 닛산 GT-R의 상자 글과 바이크 배송 글이 남음. B1 |
| 연속 10건에서 같은 조각 반복 | 일부만 | 전체 문장 중복은 모든 박스에서 0건. 가까운 조각 반복은 남음. I1 |
| 기계가 쓴 티 | 일부만 | 말끝 변형과 다시 쓴 작성자는 구현됨. 의미 중복, 상태 모순, 지나치게 넓은 상품 조각은 남음. I2 |
| 추가 열기를 부추기는 말 | 안 고쳐짐 | 명시적 재개봉과 아쉬운 결과 뒤 재도전 글 1,589건. B2 |

손익 검사는 공백을 뺀 소문자에서 본전, 손해, 이득, 남는장사, 박스값, 굳었, 득템, 쏠쏠, 꽤하네요, worthit, fortheprice, 值了, 值得를 찾았다. 박스값엔못미치와 돈아깝은 별도로 손실 방향을 검사했다. 이 검색 범위 밖의 모든 돈 표현까지 의미가 맞는다고 보증하는 판정은 아니다. 예를 들어 mobile-apple 95번은 상품가 109.99달러에서 104.49달러를 받으므로 100달러 박스의 `박스값 정도 나왔네요`가 성립한다.

## 4. 직접 읽은 표본과 실행 명령

`web`을 작업 디렉터리로 두고 `rtk proxy npx tsx C:/Users/hyun1/AppData/Local/Temp/voila-reviews-audit/audit.ts`를 실행했다. 스크립트는 실제 `sampleReviews(slug, 100)`을 호출한다. 각 행의 연결 상품, 상품가, 박스 가격, 별점, 글을 출력해 아래 800건을 읽었다. bag-hermes는 전체 95건이라 100건을 읽을 수 없어 bag-chanel을 골랐다.

| 카테고리 | slug | 전체 건수 | 읽은 번호 |
|---|---|---:|---|
| 자동차 | car-rolls-royce | 101 | 1~100 |
| 시계 | watch-rolex | 136 | 1~100 |
| 가방 | bag-chanel | 117 | 1~100 |
| 포켓몬 | pokemon-charizard | 276 | 1~100 |
| 장난감 | toy-lego | 222 | 1~100 |
| 휴대폰 | mobile-apple | 240 | 1~100 |
| 뷰티 | beauty-dior | 269 | 1~100 |
| 스포츠 | sport-wilson | 232 | 1~100 |

임시 스크립트와 수치 원본, 브라우저 캡처는 위 임시 폴더에만 만들었다. 저장소 안의 결과 파일은 이 파일 하나다.

| 실행 | 결과 |
|---|---|
| rtk git diff 63445c7..HEAD --stat | 변경 파일 13개, 추가 3,200줄, 삭제 125줄 |
| rtk proxy git diff 63445c7..HEAD | 전체 diff 3,616줄 검토. 상품, 돈 계산, 저장소 키 변경 없음 |
| rtk proxy npx tsx 임시폴더/audit.ts | BOXES 334개, HOME_BOXES 320개 전부 생성 및 측정 |
| rtk proxy npx tsx 임시폴더/edge.ts | 전체 off, 옛 상품 종류, 결정성, 문장 중복, 작성자 검사 |
| rtk proxy npx tsx 임시폴더/repeats.ts | 표본 800건의 모든 연속 10건 구간 반복 검사 |
| rtk proxy node 임시폴더/browser.cjs | 기존 3003 서버에서 6개 경로, 더 보기, 상세, 내 후기 혼합, 홈 카드 불일치 재현 |
| rtk proxy node 임시폴더/legacy-browser.cjs | 옛 카드 35번과 자동차 204번을 화면에서 재현 |
| rtk proxy npx tsx --test tests/reviewSamples.test.ts | 15건 통과, 실패 0 |
| rtk proxy npm test | 413건 중 412건 통과, 1건 건너뜀, 실패 0 |
| rtk proxy npx tsc --noEmit --incremental false | 종료 코드 0, 진단 없음. 저장소의 증분 캐시를 쓰지 않음 |

브라우저는 새로 만든 격리 컨텍스트를 사용했다. 혼합 시험은 그 컨텍스트의 후기 저장값만 넣었다. 구매, 충전, 받기, 출금 호출은 하지 않았고 GET 및 HEAD 외 요청을 차단하도록 했다.

## 5. 전체 분포 측정

**실행:** 전체 BOXES와 홈 박스 모집단을 따로 센 결과다. 박스마다 건수와 생성 글의 별점 재집계는 모두 일치했다. 전체 박스 건수의 최솟값은 84, 최댓값은 398, 평균 별점 범위는 4.1~4.9다. 개별 건수는 부록에 전부 적었다.

| 지표 | 전체 334개 박스 | 홈 320개 박스 |
|---|---:|---:|
| 후기 수 | 79,513 | 75,245 |
| 별 1개 | 1,278, 1.607% | 1,263, 1.679% |
| 별 2개 | 2,068, 2.601% | 2,044, 2.716% |
| 별 3개 | 8,874, 11.160% | 8,683, 11.540% |
| 별 4개 | 22,536, 28.343% | 21,729, 28.878% |
| 별 5개 | 44,757, 56.289% | 41,526, 55.188% |
| 한국어 | 67,562, 84.970% | 63,844, 84.848% |
| 영어 | 6,420, 8.074% | 6,137, 8.156% |
| 중국어 | 5,531, 6.956% | 5,264, 6.996% |
| 사진 첨부 | 13,278, 16.699% | 11,055, 14.692% |
| 사진 있는 상품의 후기 중 사진 첨부 | 58.148% | 57.277% |
| 사진 없는 상품에 연결된 후기 | 56,678 | 55,944 |
| 좋아요 0 | 43,942, 55.264% | 42,335, 56.263% |
| 좋아요 1~2 | 25,716 | 24,284 |
| 좋아요 3~9 | 9,183 | 8,165 |
| 좋아요 10~29 | 647 | 444 |
| 좋아요 30~98 | 25 | 17 |
| 좋아요 최댓값 | 53, 해당 글 1건 | 53, 해당 글 1건 |
| 좋아요 99 | 0 | 0 |

사진 경로는 해당 카탈로그 상품 경로와 같았고, 사진 없는 상품에는 photo가 붙지 않았다. 전체 약 16.7%라는 사진 비율은 사진 없는 상품이 많은 결과다. 사진이 있는 상품만 보면 약 58.1%에 붙는다. 좋아요 상한에 잘려 쌓인 현상은 발견하지 못했다.

작성자를 박스 안의 동일 별명으로 집계했다. 다시 쓴 추가 글은 전체 5,144건, 6.469%이고 홈에서는 4,854건, 6.451%다. 모든 박스에서 이 비율은 5~8%이며 인접한 동일 작성자 쌍은 0개다. 다시 등장하는 작성자는 전체 5,135명, 홈 4,845명이다. 그 작성자들의 첫 글까지 합치면 전체 10,279건, 홈 9,699건이다. 따라서 테스트의 5~8%는 그 작성자들의 모든 글 비중이 아니라 첫 글을 뺀 추가 글 비중이다.

상품가를 박스 가격으로 나눈 결과 분포는 다음과 같다. 상품가 배수이며 95% 수령액 배수가 아니다.

| 상품가 배수 | 전체 건수와 비율 | 홈 건수와 비율 |
|---|---:|---:|
| 0.7 미만 | 42,732, 53.742% | 42,732, 56.790% |
| 0.7 이상 1.5 미만 | 12,036, 15.137% | 11,734, 15.594% |
| 1.5 이상 8 미만 | 20,500, 25.782% | 17,659, 23.469% |
| 8 이상 60 미만 | 3,692, 4.643% | 2,778, 3.692% |
| 60 이상 | 553, 0.695% | 342, 0.455% |

홈 전체에서 1.5배 미만은 72.385%, 8배 이상은 4.146%, 60배 이상은 0.455%다. 테스트의 각각 50% 초과, 10% 미만, 2% 미만 주장과 맞는다. 이것은 실제 추첨 확률의 측정이 아니다. 생성기는 현금 상품을 빼고 dropRate의 0.62제곱을 가중치로 사용한다.

박스별로도 큰 결과가 같은 비율인 것은 아니다. 옛 dollar-apple은 현금 아닌 구성품을 고른 후기 292건 모두가 8배 이상이다. starter-macbook은 120/316건, 37.975%다. 이는 낮은 박스 가격과 현금 결과 제외의 영향이다. 전체에서 드물다는 테스트를 모든 개별 박스에서도 10% 미만이라는 뜻으로 읽으면 안 된다.

홈 박스의 가격별 평균 건수는 20달러 324.971건, 50달러 269.957건, 100달러 225.263건, 250달러 156.157건, 500달러 120.579건이다. 싼 가격대일수록 많다는 테스트와 맞는다.

## 6. 깨뜨리기 결과와 화면 증거

| 시험 | 확인 결과 | 증거 종류 |
|---|---|---|
| off, 0, false | 334개 전부 sampleCount 0, sampleReviews 빈 배열. newestSamples도 빈 배열. 실제 별점 extra는 유지 | 실행 |
| off에서 화면 | 실제 후기 없으면 박스 제목 별점과 RatingBlock이 없어지고 후기 없음. 모아 보기도 빈 상태. 실제 후기 있으면 상세와 모아 보기는 유지. 홈 카드의 실제 별점은 B4처럼 누락 | 코드와 함수 실행 |
| 내 후기와 날짜순 혼합 | 새 글, 중간 글, 오래된 글이 ageMin 순서에 섞임. 10건 슬라이스도 올바름. 열린 화면에서 시간이 지나면 I3의 정체 발생 | 실행과 화면 |
| 서버와 브라우저 상대 시간 | 아래 6개 경로에서 서버 HTML의 모든 처음 후기 시간과 브라우저 DOM의 시간이 같았음. 콘솔 및 페이지 오류 0 | 실행 |
| 정적 내보내기 | 샘플 ageMin과 useAgo는 Date.now를 읽지 않음. 내 후기는 skipHydration 저장소에서 마운트 뒤 들어오므로 최초 서버 렌더에 없음. 시간 원인의 최초 불일치 징후는 발견하지 못함. 실제 export 빌드는 미실행 | 코드, 개발 서버 실행, 검사 한계 |
| 옛 박스 14개 | 모두 생성되며 건수 214~391. 합계 4,268건. 옛 카테고리의 의미 분류와 전체 모아 보기에서 문제가 남음 | 실행, 코드, 화면 |
| 사진 없는 상품 | 첨부 사진은 생기지 않음. 목록 상품 칸은 현재 Package 아이콘을 사용. mobile-apple 첫 10건 중 9개가 아이콘. 상세는 사진 영역 없이 글과 상품 정보를 보여 줌 | 실행과 화면 |
| 같은 박스 반복 호출 | 8개 전부 5건, 37건, 전체, 100건 호출에서 접두 목록이 같음. 별도 프로세스로 두 번 실행한 전체 목록 SHA-256도 전부 같음 | 실행 |
| 320개 카드 요약 비용 | 텍스트 생성 전에 최초 전체 ratingSummary 호출 19.456ms. 캐시 뒤 100회 평균 0.130ms. 측정은 Node이며 저사양 브라우저 시간의 보증은 아님 | 실행 |

개발 서버에서 확인한 경로는 `/ko/box/mobile-apple`, `/ko/box/watch-rolex`, `/ko/box/bag-chanel`, `/ko/reviews`, `/en/reviews?box=watch-rolex`, `/zh/box/pokemon-charizard`다. 390px에서 문서 너비도 모두 390px이었다. mobile-apple은 첫 10건과 더 보기 뒤 30건 모두 전체 수가 240으로 유지됐다. 후기 상세의 상품과 79달러 상품가, 100달러 박스도 맞았다.

**화면:** 제공된 PNG 중 `qa/work/reviews-v2/box-watch-rolex-list10-mobile.png`, `box-mobile-apple-sheet-desktop.png`, `reviews-all-desktop.png`, `qa/work/reviews-v3/box-mobile.png`, `box-desktop.png`을 눈으로 확인했다. v2에는 후기의 구분 행과 사진, 상품 카드, PC 모아 보기 2열과 별점 분포가 보인다. v3에는 박스 머리 별점 4.5와 240건, 오른쪽 가격 및 수량 영역, 모바일 아래 고정 열기 막대가 보인다. v2의 사진 없는 상품 카드와 현재의 아이콘 상품 카드는 9668b13의 변경에 따른 차이다. 과거 PNG가 현재 상태와 완전히 같다고 가정하지 않았다.

## 7. 기존 동작의 회귀와 테스트의 빈틈

**코드와 diff:** 바뀐 파일은 DESIGN.md, globals.css, reviews.css, BoxReviews.tsx, BoxScreen.tsx, ReviewsScreen.tsx, reviewSampleText.ts, reviewSamples.ts, v.ko.json, v.en.json, v.zh.json, flow-reviews.mjs, reviewSamples.test.ts의 13개다.

- BoxScreen의 변경은 후기 설명 주석, import, 별점 hook, BoxReviews 전달 방식뿐이다. 대표 상품, 구성품, 구간별 및 상품별 확률, 상품 상세, 수량, 로그인, 잔액 부족, 구매 확인과 개봉 상태 기계의 코드에는 diff가 없다.
- 후기 쓰기 시트와 communityStore, 내 후기 관리 화면, 게시 자격과 사진 저장에는 diff가 없다. 전체 테스트에서 후기 관련 검사도 통과했다. 이번 검수에서 실제 후기 제출 전체 흐름을 다시 실행한 것은 아니다.
- 나온 상품의 WinsScreen과 집계에는 diff가 없다. BoxReviews에서 가져오는 stamp 함수의 본문도 동일하다. 샘플을 나온 상품에 연결한 변경은 없다. 실제 개봉 기록만 쓰는 원칙이 유지된다.
- 별점의 다른 호출부를 찾아봤다. BoxList는 새 생성기를 사용하지만 실제 후기 extra를 생략한다. 박스 상세의 머리와 아래 요약은 서로 일치한다. 홈과 상세의 불일치는 B4에 적었다.
- 새 CSS는 후기 클래스에 한정되고 globals.css에는 import 1줄만 추가됐다. 사진 없는 상품의 아이콘도 후기 카드에 한정된다. 관련 없는 전역 스타일을 다시 설계한 변경은 없다.
- 세 언어 JSON 전체를 읽고 기준 버전과 키별로 대조했다. 각 언어에서 reviews 아래의 total, moreList, likes, agoNow, agoMin, agoHour, agoDay, agoMonth, agoYear 9개 키만 추가됐다. 다른 키의 값 수정과 삭제는 없고 세 언어의 새 키 의미도 맞는다.
- 실제 상품 목록, 상품가, 추첨 확률과 95% 받기 계산, 지갑, 저장소 키에는 변경이 없다. 전체 테스트 실패 0과 타입 검사 통과도 확인했다.

**판단:** 수치 분포와 결정성에 관한 테스트 주장은 직접 측정한 범위에서 맞다. 의미 검사에 관한 이름은 통과 결과보다 넓은 보증처럼 읽힌다. 빠진 검사는 옛 14개 박스의 의미, 독립적인 상품 분류, 명시적 점수 문구, 실제 재개봉 표현, 연속 10건의 조각 반복, 실제 후기까지 포함하는 홈 카드 집계다. 이 항목들을 추가해야 B1~B4를 검사로 막을 수 있다.

## 부록. 박스별 건수

아래 표는 모든 박스의 기본 sampleReviews 호출 결과다. 실제 후기는 더하지 않았다. 모두 80~400 범위이며, 각 박스의 별점 목록 재집계와 ratingSummary는 같았다.

### 홈에 없는 옛 박스 14개

| 박스 | 건수 | 평균 | 박스 | 건수 | 평균 |
|---|---:|---:|---|---:|---:|
| vault-pokemon | 302 | 4.6 | dollar-apple | 292 | 4.9 |
| jackpot-car | 268 | 4.6 | vault-submariner | 350 | 4.7 |
| vault-handbag | 281 | 4.7 | vault-gold | 214 | 4.7 |
| dollar-galaxy | 310 | 4.6 | dollar-gaming | 367 | 4.7 |
| starter-ps5 | 391 | 4.7 | starter-audio | 301 | 4.6 |
| starter-macbook | 316 | 4.8 | starter-camera | 328 | 4.7 |
| vault-home | 281 | 4.7 | jackpot-supercar | 267 | 4.7 |

### 홈 박스 320개

| 박스 | 건수 | 평균 | 박스 | 건수 | 평균 |
|---|---:|---:|---|---:|---:|
| car-rolls-royce | 101 | 4.3 | car-bentley | 87 | 4.2 |
| car-porsche | 110 | 4.3 | car-supercar | 153 | 4.3 |
| car-maybach | 160 | 4.3 | car-genesis | 161 | 4.4 |
| car-toyota | 167 | 4.4 | car-bmw | 148 | 4.3 |
| car-audi | 92 | 4.1 | car-lexus | 177 | 4.3 |
| car-land-rover | 132 | 4.3 | car-aston-martin | 143 | 4.3 |
| car-maserati | 127 | 4.4 | car-cadillac | 128 | 4.4 |
| car-lincoln | 153 | 4.4 | car-volvo | 127 | 4.4 |
| car-tesla | 122 | 4.4 | car-hyundai | 209 | 4.2 |
| car-kia | 166 | 4.3 | car-ford | 196 | 4.1 |
| watch-rolex | 136 | 4.3 | watch-patek-philippe | 113 | 4.3 |
| watch-audemars-piguet | 101 | 4.3 | watch-vacheron-constantin | 93 | 4.4 |
| watch-a-lange-sohne | 141 | 4.4 | watch-omega | 147 | 4.3 |
| watch-cartier | 165 | 4.4 | watch-iwc | 200 | 4.4 |
| watch-jaeger-lecoultre | 189 | 4.4 | watch-breitling | 201 | 4.3 |
| watch-tag-heuer | 206 | 4.3 | watch-panerai | 144 | 4.3 |
| watch-hublot | 122 | 4.4 | watch-zenith | 122 | 4.5 |
| watch-blancpain | 122 | 4.2 | watch-breguet | 156 | 4.3 |
| watch-grand-seiko | 264 | 4.2 | watch-tudor | 253 | 4.2 |
| watch-longines | 260 | 4.3 | watch-seiko | 264 | 4.5 |
| bag-hermes | 95 | 4.3 | bag-chanel | 117 | 4.4 |
| bag-dior | 176 | 4.4 | bag-louis-vuitton | 208 | 4.2 |
| bag-gucci | 273 | 4.3 | bag-prada | 210 | 4.3 |
| bag-miu-miu | 213 | 4.3 | bag-saint-laurent | 226 | 4.4 |
| bag-celine | 176 | 4.4 | bag-loewe | 187 | 4.4 |
| bag-bottega-veneta | 130 | 4.3 | bag-fendi | 273 | 4.4 |
| bag-balenciaga | 258 | 4.3 | bag-givenchy | 221 | 4.3 |
| bag-valentino-garavani | 248 | 4.3 | bag-ferragamo | 197 | 4.3 |
| bag-delvaux | 170 | 4.3 | bag-goyard | 205 | 4.4 |
| bag-chloe | 200 | 4.4 | bag-mulberry | 210 | 4.3 |
| jewelry-cartier | 151 | 4.2 | jewelry-tiffany | 181 | 4.3 |
| jewelry-van-cleef-arpels | 200 | 4.4 | jewelry-bvlgari | 156 | 4.2 |
| jewelry-chaumet | 149 | 4.3 | jewelry-boucheron | 121 | 4.4 |
| jewelry-chopard | 144 | 4.2 | jewelry-piaget | 141 | 4.2 |
| jewelry-graff | 125 | 4.2 | jewelry-harry-winston | 149 | 4.3 |
| jewelry-messika | 264 | 4.3 | jewelry-fred | 176 | 4.5 |
| jewelry-pomellato | 126 | 4.3 | jewelry-buccellati | 138 | 4.3 |
| jewelry-damiani | 202 | 4.4 | jewelry-repossi | 140 | 4.3 |
| jewelry-tasaki | 277 | 4.3 | jewelry-mikimoto | 180 | 4.3 |
| jewelry-david-yurman | 213 | 4.4 | jewelry-swarovski | 313 | 4.4 |
| fashion-nike | 172 | 4.4 | fashion-adidas | 248 | 4.3 |
| fashion-new-balance | 236 | 4.3 | fashion-asics | 265 | 4.3 |
| fashion-salomon | 168 | 4.2 | fashion-on | 221 | 4.4 |
| fashion-hoka | 248 | 4.4 | fashion-jordan | 204 | 4.4 |
| fashion-converse | 311 | 4.4 | fashion-vans | 274 | 4.3 |
| fashion-dr-martens | 245 | 4.5 | fashion-timberland | 202 | 4.4 |
| fashion-birkenstock | 233 | 4.3 | fashion-ugg | 261 | 4.2 |
| fashion-moncler | 130 | 4.2 | fashion-canada-goose | 145 | 4.4 |
| fashion-burberry | 171 | 4.2 | fashion-arcteryx | 278 | 4.3 |
| fashion-the-north-face | 250 | 4.3 | fashion-patagonia | 247 | 4.4 |
| mobile-apple | 240 | 4.5 | mobile-samsung | 241 | 4.2 |
| mobile-google | 282 | 4.4 | mobile-xiaomi | 215 | 4.5 |
| mobile-oppo | 319 | 4.3 | mobile-oneplus | 253 | 4.4 |
| mobile-vivo | 231 | 4.3 | mobile-honor | 220 | 4.3 |
| mobile-motorola | 287 | 4.4 | mobile-nothing | 272 | 4.4 |
| mobile-sony | 219 | 4.4 | mobile-asus | 278 | 4.3 |
| mobile-redmagic | 256 | 4.3 | mobile-huawei | 211 | 4.4 |
| mobile-lenovo | 327 | 4.3 | mobile-hmd | 294 | 4.3 |
| mobile-realme | 368 | 4.4 | mobile-tecno | 322 | 4.4 |
| mobile-infinix | 373 | 4.2 | mobile-anker | 317 | 4.4 |
| computer-apple | 164 | 4.4 | computer-samsung | 237 | 4.3 |
| computer-lg | 187 | 4.2 | computer-dell | 173 | 4.3 |
| computer-hp | 273 | 4.4 | computer-lenovo | 206 | 4.3 |
| computer-asus | 261 | 4.3 | computer-acer | 307 | 4.3 |
| computer-msi | 242 | 4.5 | computer-microsoft | 193 | 4.4 |
| computer-razer | 202 | 4.5 | computer-gigabyte | 256 | 4.3 |
| computer-intel | 292 | 4.3 | computer-amd | 281 | 4.4 |
| computer-nvidia | 213 | 4.2 | computer-corsair | 332 | 4.3 |
| computer-logitech | 313 | 4.3 | computer-keychron | 280 | 4.3 |
| computer-benq | 304 | 4.3 | computer-eizo | 170 | 4.2 |
| gaming-playstation | 230 | 4.3 | gaming-xbox | 263 | 4.4 |
| gaming-nintendo | 289 | 4.4 | gaming-valve | 270 | 4.3 |
| gaming-asus | 276 | 4.3 | gaming-msi | 230 | 4.3 |
| gaming-razer | 299 | 4.4 | gaming-logitech | 307 | 4.5 |
| gaming-steelseries | 265 | 4.3 | gaming-corsair | 277 | 4.2 |
| gaming-hyperx | 204 | 4.3 | gaming-turtle-beach | 253 | 4.3 |
| gaming-8bitdo | 321 | 4.4 | gaming-scuf | 264 | 4.3 |
| gaming-thrustmaster | 263 | 4.2 | gaming-fanatec | 277 | 4.3 |
| gaming-moza | 246 | 4.3 | gaming-elgato | 252 | 4.4 |
| gaming-avermedia | 206 | 4.4 | gaming-victrix | 267 | 4.3 |
| audio-sony | 245 | 4.4 | audio-bose | 328 | 4.4 |
| audio-sennheiser | 169 | 4.4 | audio-bang-olufsen | 256 | 4.4 |
| audio-bowers-wilkins | 169 | 4.4 | audio-kef | 198 | 4.2 |
| audio-devialet | 245 | 4.3 | audio-sonos | 323 | 4.3 |
| audio-marshall | 261 | 4.2 | audio-jbl | 217 | 4.3 |
| audio-harman-kardon | 242 | 4.3 | audio-audio-technica | 202 | 4.4 |
| audio-shure | 320 | 4.4 | audio-focal | 194 | 4.3 |
| audio-beyerdynamic | 215 | 4.4 | audio-audeze | 165 | 4.4 |
| audio-akg | 321 | 4.4 | audio-technics | 193 | 4.3 |
| audio-yamaha | 294 | 4.2 | audio-fiio | 233 | 4.4 |
| camera-canon | 183 | 4.2 | camera-nikon | 238 | 4.4 |
| camera-sony | 253 | 4.3 | camera-fujifilm | 250 | 4.3 |
| camera-panasonic | 240 | 4.3 | camera-om-system | 172 | 4.3 |
| camera-pentax | 278 | 4.3 | camera-ricoh | 264 | 4.3 |
| camera-leica | 200 | 4.5 | camera-hasselblad | 185 | 4.3 |
| camera-phase-one | 84 | 4.4 | camera-gopro | 290 | 4.2 |
| camera-dji | 245 | 4.4 | camera-insta360 | 221 | 4.4 |
| camera-sigma | 322 | 4.4 | camera-tamron | 239 | 4.4 |
| camera-zeiss | 259 | 4.4 | camera-samyang | 284 | 4.3 |
| camera-godox | 328 | 4.3 | camera-profoto | 221 | 4.3 |
| home-lg | 113 | 4.3 | home-samsung | 159 | 4.3 |
| home-miele | 139 | 4.2 | home-dyson | 225 | 4.4 |
| home-roborock | 202 | 4.2 | home-dreame | 243 | 4.3 |
| home-irobot | 313 | 4.3 | home-ecovacs | 266 | 4.3 |
| home-shark | 304 | 4.4 | home-ninja | 284 | 4.3 |
| home-breville | 194 | 4.4 | home-delonghi | 213 | 4.4 |
| home-smeg | 263 | 4.4 | home-philips | 269 | 4.2 |
| home-braun | 315 | 4.4 | home-panasonic | 314 | 4.3 |
| home-balmuda | 324 | 4.4 | home-cuckoo | 272 | 4.3 |
| home-coway | 233 | 4.4 | home-xiaomi | 390 | 4.4 |
| pokemon-charizard | 276 | 4.5 | pokemon-pikachu | 251 | 4.3 |
| pokemon-blastoise | 320 | 4.2 | pokemon-venusaur | 293 | 4.3 |
| pokemon-mew | 302 | 4.3 | pokemon-mewtwo | 303 | 4.4 |
| pokemon-umbreon | 241 | 4.4 | pokemon-espeon | 256 | 4.3 |
| pokemon-sylveon | 222 | 4.2 | pokemon-leafeon | 307 | 4.3 |
| pokemon-glaceon | 275 | 4.2 | pokemon-rayquaza | 237 | 4.3 |
| pokemon-gengar | 268 | 4.4 | pokemon-lugia | 272 | 4.3 |
| pokemon-giratina | 277 | 4.4 | pokemon-dragonite | 262 | 4.4 |
| pokemon-snorlax | 303 | 4.3 | pokemon-alakazam | 317 | 4.3 |
| pokemon-zapdos | 384 | 4.4 | pokemon-magikarp | 305 | 4.3 |
| toy-lego | 222 | 4.4 | toy-bandai | 397 | 4.2 |
| toy-hot-wheels | 264 | 4.3 | toy-barbie | 242 | 4.4 |
| toy-sylvanian-families | 269 | 4.4 | toy-pop-mart | 236 | 4.4 |
| toy-smiski | 355 | 4.3 | toy-jellycat | 345 | 4.4 |
| toy-playmobil | 300 | 4.4 | toy-brio | 238 | 4.3 |
| toy-schleich | 223 | 4.4 | toy-ravensburger | 302 | 4.3 |
| toy-siku | 231 | 4.4 | toy-tomica | 317 | 4.3 |
| toy-tamiya | 263 | 4.3 | toy-good-smile | 385 | 4.3 |
| toy-nerf | 316 | 4.4 | toy-steiff | 350 | 4.4 |
| toy-maileg | 316 | 4.4 | toy-mega | 358 | 4.3 |
| outdoor-snow-peak | 140 | 4.4 | outdoor-helinox | 258 | 4.4 |
| outdoor-yeti | 226 | 4.4 | outdoor-msr | 185 | 4.2 |
| outdoor-therm-a-rest | 300 | 4.3 | outdoor-coleman | 205 | 4.3 |
| outdoor-stanley | 397 | 4.3 | outdoor-petzl | 266 | 4.4 |
| outdoor-leatherman | 327 | 4.3 | outdoor-biolite | 234 | 4.4 |
| outdoor-nemo | 235 | 4.3 | outdoor-hilleberg | 197 | 4.3 |
| outdoor-big-agnes | 269 | 4.4 | outdoor-sea-to-summit | 220 | 4.4 |
| outdoor-osprey | 284 | 4.2 | outdoor-deuter | 321 | 4.4 |
| outdoor-gregory | 213 | 4.3 | outdoor-black-diamond | 264 | 4.3 |
| outdoor-montbell | 167 | 4.3 | outdoor-dometic | 162 | 4.3 |
| sport-wilson | 232 | 4.3 | sport-babolat | 263 | 4.4 |
| sport-yonex | 293 | 4.3 | sport-head | 326 | 4.3 |
| sport-adidas | 209 | 4.4 | sport-mikasa | 316 | 4.3 |
| sport-titleist | 334 | 4.4 | sport-scotty-cameron | 183 | 4.3 |
| sport-garmin | 171 | 4.3 | sport-polar | 196 | 4.2 |
| sport-rogue | 261 | 4.4 | sport-eleiko | 142 | 4.3 |
| sport-concept2 | 148 | 4.3 | sport-manduka | 321 | 4.3 |
| sport-bala | 298 | 4.2 | sport-trx | 215 | 4.2 |
| sport-therabody | 242 | 4.4 | sport-hyperice | 259 | 4.2 |
| sport-hayabusa | 226 | 4.4 | sport-speedo | 269 | 4.3 |
| beauty-chanel | 303 | 4.5 | beauty-dior | 269 | 4.4 |
| beauty-jo-malone | 219 | 4.4 | beauty-le-labo | 268 | 4.3 |
| beauty-maison-francis-kurkdjian | 166 | 4.5 | beauty-tom-ford | 321 | 4.3 |
| beauty-byredo | 270 | 4.3 | beauty-diptyque | 241 | 4.3 |
| beauty-creed | 233 | 4.4 | beauty-ysl | 215 | 4.4 |
| beauty-prada | 329 | 4.3 | beauty-maison-margiela | 324 | 4.3 |
| beauty-aesop | 398 | 4.4 | beauty-loccitane | 301 | 4.2 |
| beauty-kiehls | 263 | 4.3 | beauty-estee-lauder | 222 | 4.4 |
| beauty-lancome | 282 | 4.4 | beauty-sk-ii | 183 | 4.5 |
| beauty-la-mer | 249 | 4.3 | beauty-dyson | 258 | 4.3 |

