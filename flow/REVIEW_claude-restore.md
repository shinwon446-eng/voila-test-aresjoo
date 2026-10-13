# 배포 전 적대 검수: feat/restore (4c8942f → 664d356d, 화면은 뒤에 커밋된 6c245f9f)

검수자: Claude (Fable 5.1). 작업 사본 `C:\Users\hyun1\dev\VOILA-audit-reviews`, 읽기만 했고 커밋하지 않았다. 스크립트는 `flow/review-restore/` 에만 두었다.
원본 비교용으로 `git archive 4c8942f` 를 임시 폴더에 풀고 `web/node_modules` 를 정션으로 붙여 같은 스크립트를 두 판에 돌렸다.

표기: [코드] 코드에서 읽음, [화면] 화면에서 봄, [실행] 직접 돌림(명령 적음), [추정] 추정.

## 0. 결론

- 배포를 막는 결함(P0, P1): 없음.
- 돈과 장부: 배포본과 후보를 같은 입력 9,000 번(씨앗 셋 × 3,000 번)으로 돌려 잔액, 거래 기록, 보관함, 회차가 전부 같았다. 의도된 차이 하나만 있다(내 기기 값을 바꿀 때 회차를 0 으로 되돌리던 것을 이어 세게 바꿈. U4).
- 업그레이드는 식, 잔액 불변, 한 번의 쓰기, 중복 적용 없음, 회차 단조 증가, 저장되지 않은 예약 무시, 기대값 상한을 전부 확인했다.
- 저장소 줄이기는 옛 형식의 모든 칸(업그레이드 기록, $0 미차감 출금 줄, 깨진 줄, 배송 칸, 옛 표)을 그대로 되돌렸고, 직접 읽는 곳들이 줄인 장부 위에서 그대로 동작했다.
- 고칠 것은 P2 셋(배포 전환 때 열린 옛 탭, 옮기기 작업과 잠금 없는 지갑 쓰기의 경합, 홈 첫 줄 글꼴 교체 이동)과 P3 여섯이다.
- 주의: 검수 중에 다른 일꾼이 작업 사본의 네 파일을 고치고 있었다(5절). 화면 검사는 그 시점의 작업 사본을 봤다.

## 1. 돈과 장부, 차등 검사

### 1-1. 배포본과 후보를 같은 입력으로 [실행]

`flow/review-restore/ledger-diff.ts` 를 두 판의 `web` 루트에서 각각 돌리고 `ledger-compare.mjs`, `canon-compare.mjs` 로 견줬다.

```
cd <web> && NO_CLIENT_SEED=1 WEB_ROOT=<web> SEED=1|2|3 OPS=3000 npx tsx flow/review-restore/ledger-diff.ts > out.json
node flow/review-restore/ledger-compare.mjs before.json head.json
node flow/review-restore/canon-compare.mjs before.json head.json
```

결정적으로 만든 것: Date(호출마다 1초), crypto.randomUUID 와 getRandomValues(씨앗 난수), 저장소(메모리). HMAC 은 그대로. 섞은 일: 충전(USDT, 카드), 개봉 한 개와 여러 개(2~10), 무료 개봉(가입 혜택 2회 + 가끔), 받기 한 개, 묶음 받기(1~8), 이미 받은 상품 다시 받기, 출금 접수(PENDING, 72시간 보류, 심사, 취소로 온 것, 잔액보다 큰 금액으로 $0 미차감 줄), 같은 접수 번호 두 번, 출금 상태 전환(취소, 실패, 전송, 완료, 모르는 접수 닫기, 상태 바꾸기), 배송 신청(수수료 0~30, 혼합 자금), 배송 취소 환불, 운송장.

| 씨앗 | trace 항목 | 거래 기록 | 보관함 기록 | 최종 잔액 같음 | 어긋남 |
|---|---|---|---|---|---|
| 1 | 3,005 = 3,005 | 2,368 = 2,368 | 2,630 = 2,630 | 같음 | 0 |
| 2 | 3,005 = 3,005 | 2,341 = 2,341 | 2,360 = 2,360 | 같음 | 0 |
| 3 | 3,005 = 3,005 | 2,281 = 2,281 | 2,338 = 2,338 | 같음 | 0 |

금액, id, 상태, 자금 비율, 회차, 거래 순서가 모두 같다. 글자 수준의 차이 둘은 돈과 무관하다: 칸 순서(후보는 재수화 뒤 풀어 읽은 순서), 그리고 모든 시각이 2초 뒤인 것(tsx 로더 내부의 Date.now 호출 수가 다른 검사 장치의 흔적. `scratchpad/datetick.ts` 로 확인).

의도된 차이 [실행][코드]: `NO_CLIENT_SEED` 없이 돌리면 18번째 항목(내 기기 값 바꾸기)에서 갈린다. 배포본 `fairStore.setClientSeed` 는 `nonce: 0` 으로 되돌리고(`stores/fairStore.ts:55` 옛 판), 후보는 그대로 잇는다. U4 의 요구이고 검증 기록에는 영향이 없다(기록마다 자기 회차를 들고 있다).

저장된 글자 수(씨앗 1, 3,000 번 뒤): 보관함 18,659,566 → 1,433,621 자(13배), 지갑 615,010 → 269,030 자.

### 1-2. 업그레이드 (원본에 없다) [실행]

`flow/review-restore/ledger-upgrade.ts`, `cd web && WEB_ROOT=<web> SEED=1|7 N=2000 npx tsx ...`

- 확률식: 후보 상품 전부 × 건 상품가 15종 = 303,105 쌍에서 `chanceUnitsOf` 가 정확한 유리수 `floor(9000 × 건 센트 ÷ 목표 센트)` 와 같고, 범위(배수 1.2~40, 2.25%~75%)의 안팎 판정이 같다. 100 ÷ 200 = 45.00%(44.99 로 내려가지 않는다), 0.1 ÷ 0.3 = 30.00%, 119.99 와 4000.01 은 null.
- 단추의 목표는 결정적이고 서로 다르며 확률은 식과 같다(U3).
- 2,000 번 걸기(개봉 8% 섞음, 내 기기 값 5% 바꿈): 걸기 앞뒤의 지갑(잔액 둘, 거래 기록, 저장된 글)이 한 번도 바뀌지 않았다. 건 상품은 전부 UPGRADED 에 기록이 붙었고, 성공(606, 673)이면 목표가 보관 중으로 들어오며 자금 비율을 그대로 잇고, 실패(1,394, 1,327)면 목표가 없다. 보관함 키의 쓰기는 장부 변경 1번 + syncStores 재수화의 되쓰기 1번으로 변경 자체는 한 번이다(U8). 추첨 번호 중복 0. 기록을 다시 계산(`verifyUpgradeRecord`)하면 2,000 건 전부 ok.
- 회차: 개봉과 업그레이드를 섞고 내 기기 값을 여러 번 바꿔도 2,309 개(씨앗 7 은 2,262 개)의 회차가 한 번도 줄거나 겹치지 않았다(U4).
- 같은 추첨 두 번: 연타는 같은 약속 하나를 돌려주고(회차 +1), 세 번째는 blocked. 기억 속 장부를 걸기 전 모습으로 되돌려 놓아도(옛 탭 흉내) 저장된 장부로 판정해 blocked 이고 기록이 그대로다. 재수화 뒤에도 UPGRADED 와 기록이 그대로다. UPGRADED 상품을 받으려 하면 left, 돈 0.
- 저장되지 않은 예약: 공정성 키의 쓰기를 조용히 버리면 걸지 않고(failed), 보관 중 그대로, 표시 없음, 저장된 회차 그대로. 개봉도 "Opening nonce reservation was not saved" 로 차감 전에 멈추고 지갑과 보관함의 저장 글이 한 글자도 바뀌지 않았다.
- 걸 수 없는 것: 화면이 본 확률과 다르면 blocked, 받은 상품 blocked, 받기의 확인 대기 표시가 남은 상품 blocked.
- 기대값: 업그레이드 뒤 받기의 기대 수령액 ÷ 그냥 받기 = 0.8998(씨앗 7 은 0.8999). 상품가 대비 0.855. 95% 받기와 섞어도 1 을 넘을 길이 없다(식이 0.9 × 건 상품가로 묶여 있고 내림만 한다).
- 두 탭(Web Locks) [화면][실행]: `flow/review-restore/screens.mjs` 7절. 같은 컨텍스트의 두 페이지가 같은 상품을 같은 순간에 걸었다. 결과 UPGRADED 하나, 목표 하나, 회차 3 → 4, 다른 탭은 "이 상품은 지금 업그레이드할 수 없습니다".

## 2. 저장소 줄이기가 다른 단위와 만나는 자리 [실행]

`flow/review-restore/compact-check.ts`, `cd web && WEB_ROOT=<web> npx tsx ...` 전부 통과(마지막 판).

- 옛 형식 장부: 계정 셋(acctA, acctB, gachaflix), 보관 중 40건(절반은 지금 카탈로그와 다른 뒤집은 표), SOLD, SHIPPING_REQUESTED(수수료, 요청 번호, 수수료 자금 비율), SHIPPING(시간대 붙은 shippedAt, 취소 기록), UPGRADED 성공과 실패(`upgrade` 기록), 업그레이드로 들어온 상품(`upgradedFrom`, 표 없는 fair), 대문자 UUID, 시간대 붙은 acquiredAt, 비율의 모르는 칸, autoCashback, 표에 모르는 칸이 있는 fair, fair 없는 기록, 글자, null, 숫자, fair 가 글자인 기록, `__proto__` 칸. 지갑: $0 미차감 출금 줄(requestedUsdt 30), FAILED 출금, itemIds 받기, ref 만 있는 옛 받기, 롤오버 든 개봉, itemIds 와 rolloverUsdt 가 같이 든 줄, 카드 충전, 배송 환불, 보너스, 모르는 종류와 글자 금액, 글자와 null 줄, 대문자 id 의 72시간 보류.
- 읽기 → 줄이기 → 쓰기 → 다시 읽기: 보관함 282,519 → 11,117 자(3.9%), 지갑 2,488 → 1,729 자. 풀어 읽은 값이 옛 값과 같다(칸 순서만 다름). 돈의 합, 상태, id, 자금 비율, 회차, 확률표 순서 같음. 옛 표와 지금 표가 따로 보존되고 같은 표는 같은 배열을 공유한다. 업그레이드 기록, 배송 칸, 깨진 줄, `__proto__` 그대로(Object.prototype 오염 없음). 쓰기는 결정적이고 빈 장부는 옛 형식 그대로.
- 옮기기(X2): 받기 표시가 남은 acctB 는 옮기지 않고 나머지 넷은 같은 키에 더 짧은 글로 덮어썼다.
- 줄인 장부 위의 소비자: `restoreBrowserAssets` 복원, `takeBatch.readSaved` 가 같은 값, `savedTakeLedger` 의 credited/held/taken/other 판정이 옛 장부와 같음, `walletHistoryRows` 가 같은 줄(미차감 줄 포함), `browserAccount` 의 `storedState` 식으로 읽은 폐쇄 판정이 옛 장부와 같음(UPGRADED 는 알려진 상태), `verifyOpeningRecord` 가 옛 표의 기록을 당시 표로 다시 계산(rollMatch true), 같은 기록을 다시 적어도 저장된 글이 같음.
- 봉인: 모르는 형식 번호와 잘린 줄인 글은 읽기가 던지고 봉인되어 스토어가 덮어쓰지 않으며(`[VOILA] stored ledger is unreadable` 경고), `assertLedgerWritable` 이 LedgerUnavailable 로 돈을 막고, 받기는 failed. 다시 읽을 수 있게 되면 봉인이 풀린다.
- 한도 [실행]: 개봉 한 건의 줄인 글자 수는 보관함 평균 96.1 자(박스별 93.2~100.0, 320 박스 전부), 지갑 거래 줄 68.0 자, 합 약 164 자. 크롬 한도 5,242,880 자에서 표 320 벌(약 1.9M 자)을 빼고 약 20,250 번, 표 비용 없이 31,951 번. X1 목표 20,000 번을 겨우 넘는다(표가 다 쌓이는 경우는 320 박스를 전부 열어야 하므로 실제로는 더 넉넉하다).
- 실제 크롬 [실행] `flow-storage.mjs`: 옛 형식 301 건 1,839,761 자가 가득 찬 저장소에서 다음 열 때 34,406 자로 줄었고(53.5배), 기록 301 건 그대로, 저장 실패 안내 없음, 표 두 벌만 저장, 옛 표의 기록 검증이 당시 표로 맞음, 그 뒤 하나 더 열어 저장되고 새로 고쳐도 남아 있음. 13/13.
- 두 탭 동시 옮기기 [화면][실행] screens.mjs 8절: 옛 형식 400 건을 심고 두 페이지를 동시에 열었다. 저장된 장부는 줄인 형식 하나(22,586 자), 두 탭이 같은 400 건과 같은 합(83,800)을 읽었고 화면에 상품이 그려졌다.
- 개발 손잡이 `window.__voilaLedger` [실행][코드]: `lib/compactStorage.ts:601` 이 NODE_ENV 가 production 이 아닐 때만 붙이는 조건으로 감싼다. `npx esbuild lib/compactStorage.ts --bundle --define:process.env.NODE_ENV='"production"' --minify | grep -c __voilaLedger` → 0, development 로 정의하면 1. `next build` 는 돌리지 않았으므로 Next 번들 자체는 보지 않았다(Next 도 같은 상수 치환과 죽은 코드 제거를 한다). 쓰는 곳은 `scripts/capture/` 여섯 파일뿐이다.

## 3. 화면 (DESIGN.md 3장) [화면][실행]

`flow/review-restore/screens.mjs` (`CAPTURE_BASE=http://localhost:3003 BEFORE_BASE=http://127.0.0.1:4198/voila-test-aresjoo node ...`) 34/39. 실패 5 는 아래에 설명(넷은 검사 장치나 비교 대상의 문제, 하나는 P2-3).

| 화면 | 주 단추 | 조용한 단추 | 밑줄 링크 | 넘침 |
|---|---|---|---|---|
| 보관함 상세 | USDT로 받기 ($950) | 업그레이드 | 배송 받기, 개봉 결과 검증 | 없음 |
| 업그레이드 고르기(단추 전) | 배수를 선택합니다(비활성) | 없음 | 잠근 값 보기 | 없음 |
| 업그레이드 고르기(2배 선택) | 업그레이드하기 | 없음 | 잠근 값 보기 | 없음 |
| 업그레이드 추첨 | 없음 | 없음 | 결과 바로 보기 | 없음 |
| 업그레이드 성공 | USDT로 받기 ($1,900) | 한 번 더 업그레이드 | 보관함에 두기, 결과 검증 | 없음 |
| 업그레이드 실패 | 박스 보러 가기 | 없음 | 결과 검증 | 없음 |
| 한 개 결과(mobile-hmd) | USDT로 받기 ($9.49) | 업그레이드 | 보관함에 두기, 개봉 결과 검증 | 해당 없음 |
| 여러 개 결과(5개) | USDT로 받기 (5개, $94.95) | 없음 | 보관함에 두기, 한 번 더 언박싱 $100 | 해당 없음 |
| 여러 개 결과의 상품 상세 | USDT로 받기 ($56.99) | 업그레이드 | 개봉 결과 검증 | 없음 |

- 320px × ko, en, zh: 고르기, 잠근 값 보기, 결과 모두 시트 바깥으로 나간 요소 0, 시트 가로 넘침 없음, 문서 가로 스크롤 없음. 결과의 주 단추 하나(zh 는 "领取 USDT（$1,900）").
- 자판(1440): 업그레이드 단추에 Enter 로 열기, Tab 12번이 모두 시트 안에서 순환(닫기 > 1.5배 > 2배 > 3배 > 5배 > 10배 > 잠근 값 보기 > 닫기 ...), Enter 로 배수 선택(aria-pressed), Esc 로 닫히고 초점이 보관함의 그 상품 행으로 돌아왔다.
- 장부(화면 뒤): 성공은 UPGRADED 하나 + 목표 하나, 회차 3 → 4. 실패는 UPGRADED 하나 + 목표 없음, 회차 5 → 6. 콘솔 오류 없음.
- 홈 격자 390과 1440 [실행] `home-jump.mjs`, `home-shrink.mjs`: 비로그인과 로그인 모두 첫 여덟 카드의 순서가 첫 그림과 1.5초 뒤에 같다(gaming-playstation, fashion-nike, toy-jellycat, watch-rolex, pokemon-charizard, mobile-apple, beauty-aesop, bag-hermes). 같은 줄의 카드 높이는 같다. 1440 은 자리도 그대로. 390 은 첫 줄 두 카드만 252 → 230 으로 줄었다(P2-3). screens.mjs 의 홈 실패 둘은 로그인 뒤에 나타나는 머리 띠 링크(pokemon-charizard, 52px)를 카드로 센 검사 장치의 잘못이고, 머리 띠가 나타나도 첫 카드 top(706, 678)은 그대로다.
- 후기 줄 [실행][코드]: 원본 빌드(`VOILA-audit-before/web/out`, 커밋 63445c7)는 박스 화면에 "아직 후기가 없습니다" 만 그린다(샘플 후기가 없는 판). 그래서 화면끼리 견주지 못했고 CSS 로 견줬다: HEAD 의 `.v-rvrow`, `.v-rvcard*`, `.v-rvgrid` 12 규칙이 줄 모양을 바꾸기 직전 커밋 9668b13e 의 12 규칙과 글자 하나까지 같다. 지금 화면 측정: 390 에서 카드 258 × 414, 간격 12, 반경 20, 바탕 #303030, 사진 16:10, 끝 흐림(mask) 있음, data-next 있음. 1440 에서 카드 280 × 428, 반경 26, 다음 단추가 있고 누르면 568 넘어가며 이전 단추가 나온다. 처음 여섯 장의 상품이 모두 다르다(상품 흩기 규칙). `flow-reviews.mjs`: 모바일과 데스크톱 모두 가로 넘침 없음, 20 → 60 장 이어 붙음, 더 보기, 콘솔 오류 없음.

## 4. 범위, 카탈로그, 의존성 [실행][코드]

- `git diff 4c8942f..HEAD --stat`: 64 파일, +4,554 -277. 전부 다섯 단위와 그 테스트, 촬영 스크립트, DESIGN.md, 골든 기준값에 든다. 단위 2 의 통합 수정(`account.ts`, `community.ts`, `vault.ts`, `wins.ts`, `claim.ts`, `Opening.tsx`, `Reveal.tsx`, `InventoryScreen.tsx`, `TakeSheet.tsx`, `ChainRecord.tsx`, `VerifyScreen.tsx`)과 단위 1 의 보조 스크립트(`scripts/catalog2/box-order.ts`, `box-stat.ts`) 포함.
- 지운 파일 없음, 이름 바꾼 파일 없음. `package.json`, `package-lock.json` 변경 없음. 지운 export: `BoxReviews.tsx` 의 `useShownRows`(새 서명으로 바뀜), `ReviewList` 의 `grid` 인자, 옛 `OwnedStatus`(UPGRADED 추가). `tsc` 가 통과하므로 끊어진 참조 없음.
- 카탈로그 [실행] `flow/review-restore/catalog-dump.ts` 두 판: 박스 334, 홈 320, 상품 행 32,916. 슬러그, 가격, 확률판, 상품 id, 값, 종류, 확률, 추첨표 순서의 해시가 같고, 홈 순서(HOME_BOXES) 같고, 박스별 기대값 334 개 모두 같고, 사진 수(14,982) 같다. `faceOf` 만 FACE_PICK 의 둘이 다르다: mobile-apple 은 vision-pro-m5-1tb → iphone-17-pro-max-2tb, computer-samsung 은 bm1743-61tb → galaxy-book4-ultra-u9-rtx4070(W2 그대로). REFUND_RATE 0.95 같음.
- 골든 분리 [코드]: `catalog.json` 에서 `itemRowsWithPhoto` 와 `namesAndPhotos` 를 떼어 `photos.json` 으로 옮겼다. 그 값(14,982, 해시)은 4c8942f 와 HEAD 가 같으므로 이 변경이 사진을 바꾼 것은 아니다(63445c7 기준값 13,094 → 4c8942f 의 사진 추가가 원인).

## 5. 명령과 수치 [실행]

- `cd web && npx tsc --noEmit -p .` → 종료 0.
- `cd web && npm test` → tests 552, pass 551, fail 0, skipped 1.
- `cd web && npm run lint:design` → 범위 new, 51 파일, 모든 항목 0, 합계 0.
- `CAPTURE_BASE=http://localhost:3003 MSYS_NO_PATHCONV=1 node scripts/capture/...`
  - `flow-upgrade.mjs`: 22/22 장면 완료(11 장면 × mobile, desktop), 실패 없음. 그때 파일은 HEAD 판(11 장면). 뒤에 작업 사본이 14 장면으로 늘었다(아래).
  - `flow-storage.mjs`: 13/13.
  - `flow-take.mjs`: 첫 실행 합계 61, 실패 1(a 장면에서 확인창 대기 30초 초과, 다른 스크립트 셋과 동시에 돌리는 중). 단독 재실행 합계 68, 실패 0. 부하로 본다.
  - `opening-qa.mjs`: 합계 107, 실패 0.
  - `flow-reviews.mjs`: mobile, desktop 각 11 줄 전부 완료, 콘솔 오류 없음(통과 수를 세지 않는 스크립트).
  - `flow-wallet-history.mjs`: 검사 21, 통과 21.
  - `flow-withdraw.mjs`: 검사 61, 통과 61.
- 작업 사본 변동(검수 중): `git status` 에 `web/components/box/Reveal.tsx`, `web/components/flow/UpgradeSheet.tsx`, `web/components/inventory/InventoryScreen.tsx`, `web/scripts/capture/flow-upgrade.mjs` 가 12:23~12:24 에 수정됨(+178 -37, 초점 복귀와 role=status 낭독, 추첨 중 Esc 를 결과 보기로). 검수가 끝날 즈음 그 네 파일이 `6c245f9f`(R-A11Y) 로 커밋됐다(`git diff 664d356d..6c245f9f --stat` 이 그 넷뿐). 3003 의 개발 서버는 작업 사본을 그리므로 3절의 화면 결과는 6c245f9f 의 화면이다. 1, 2, 4 절의 코드와 모듈 검사는 664d356d 의 `lib`, `stores` 이고 6c245f9f 는 그 파일들을 건드리지 않았다. `flow-upgrade.mjs` 는 664d356d 판(11 장면)으로 돌렸고 6c245f9f 판(14 장면, a11y 와 esc 포함)은 돌리지 않았다.

## 6. 발견 (P0 ~ P3)

### 배포를 막는 것
없음.

### 고칠 것 (배포 뒤 가능)

- P2-1 [코드] 배포 전환 때 열려 있는 옛 빌드(4c8942f) 탭. 새 빌드가 같은 계정의 장부를 줄여 쓰면 옛 탭의 `withLedgerLock → refresh → rehydrate` 가 `items` 를 배열이 아닌 객체로 받아 화면이 깨지고 받기는 "saved inventory is missing" 으로 알 수 없음(표시가 남는다). `lib/compactStorage.ts` 머리에 적혀 있고 새 고침으로 회복되며 남은 표시는 새 빌드의 다시 보기가 푼다(저장된 장부를 읽을 수 있으므로). 배포 공지와 되돌리기 절차(X4: 되돌려도 읽는 쪽 파일은 남긴다)를 함께 적어 두어야 한다.
- P2-2 [코드][추정] `migrateStoredLedgers` 는 다른 계정의 장부도 그 계정의 잠금을 얻어 옮긴다. 잠금을 쓰지 않는 지갑 쓰기(충전 확정 `settleDeposit`, 출금 `recordWithdrawal`, `syncWithdrawal`, 가입 보너스, browserAccount 의 배송)가 다른 탭에서 같은 순간에 나가면, 다시 읽어 견주는 보호(4단계)와 `setItem` 사이의 아주 짧은 틈과 크로미움의 탭 간 전달 지연이 겹칠 때 그 쓰기가 덮어쓰일 수 있다. 그 탭의 기억 속 상태는 그대로라 다음 쓰기에서 되살아나고, 그 탭이 다시 쓰지 않고 닫히는 경우에만 남는다. 재현하지 못했고 코드로 읽은 위험이다. 손쉬운 좁히기: 지금 세션(voila.browser-session)이 가리키는 계정이 아닌 장부만 옮기거나, 지갑 쓰기도 잠금 안으로 들이기.
- P2-3 [화면] 홈 390: 첫 줄 카드 둘이 첫 그림 252px 에서 Pretendard 가 실리면 230px 로 줄어 아래 줄이 22px 올라온다(제목 "플레이스테이션 박스" 가 대체 글꼴에서 두 줄). 다른 줄은 처음부터 230. 새 순서가 긴 제목을 첫 칸에 두어 드러난 글꼴 교체 이동이다(DESIGN 3장 "덜컥거리지 않는다"). 1440 은 이동 없음. 원본 빌드는 글꼴이 캐시되어 비교하지 못했다.

### 개선
- P3-1 [실행] `stores/fairStore.ts:18` 주석 "저장되지 않은 회차는 다음 추첨이 다시 받는다" 와 실제가 다르다. `reserve` 는 같은 시드면 `max(저장, 기억)` 에서 이어 세므로 저장되지 않은 회차는 건너뛴다(빈칸). 줄지도 겹치지도 않으므로 안전하다. 주석을 고치거나, 기억 속 회차를 저장된 회차로 되돌리는 쪽을 택할지 정해 둘 것.
- P3-2 [코드] `lib/boxOrder.ts:85` 분류 하나만 볼 때 점수가 같으면 `popularity`(카탈로그의 적어 둔 인기 수)로 가른다. W1 과 머리말은 "지어낸 인기... 쓰지 않는다" 고 적었다. 화면에 순위로 적히지는 않지만 말과 코드가 어긋난다.
- P3-3 [코드] `flow/RESTORE_SPEC.md` 가 커밋되지 않았다(`git ls-files` 에 없음). DESIGN.md 19번과 코드 주석이 가리키는 명세다.
- P3-4 [코드] 줄인 장부를 풀지 못해 봉인되면 화면은 빈 보관함과 잔액 0 을 그리고 콘솔 경고만 남는다. 돈은 LedgerUnavailable 이 막지만 그 자리의 한 줄이 없다("저장된 장부를 읽지 못했습니다" 같은).
- P3-5 [실행] 원래부터 있던 한계(두 판 같음): 거래 기록 배열에 null 이 들어 있으면 `creditedIdsOf`(`takeBatch.ts:84`) 가, 보관함에 null 이 있으면 `closureReadiness`(`account.ts:275`) 가 던진다. 줄이기는 그런 줄을 그대로 보존하므로 회귀는 아니다.
- P3-6 [코드] 검수 중 작업 사본이 바뀌어 6c245f9f 로 커밋됐다(5절). 배포 대상이 6c245f9f 이면 `flow-upgrade.mjs` 의 새 장면 셋(a11y, esc 등)을 한 번 돌리고 넘길 것. 이 검수의 3절은 이미 그 화면을 봤다.

## 7. 확인했지만 문제 없던 것 (짧게)

- [코드] `takeBatch` 와 `upgradeSettle` 의 표시가 서로 걸린다: 받기 표시가 남은 상품은 걸 수 없고, 업그레이드 표시가 남은 상품은 받을 수도 배송할 수도 없다(`claim.requestShipment` 도 같은 기준). UPGRADED 상품에 받기 표시가 남는 길은 없다(표시가 남은 상품은 걸 수 없으므로).
- [코드] `compactStorage` 의 줄이기 캐시(`chunkOf`, 배열 identity)가 어긋날 제자리 수정은 스토어와 lib 에 없다(`grep` 로 확인. `browserAccount.ts:338` 의 제자리 수정은 계정 저장소의 출금 기록이고 지갑 배열이 아니다).
- [코드] 업그레이드로 들어온 상품은 나온 상품(`wins.ts`), 후기(`community.canReview`), 검증 목록(`VerifyScreen`), 최근 연 박스(`BoxList.readOrderContext`)에서 빠진다(U9). 건 상품의 줄은 남는다.
- [코드] 폐쇄 판정 `closureReadiness` 가 UPGRADED 를 알려진 상태로 센다.
- [코드] 문구 세 벌의 키가 같고(`upgrade.*` 49 개) 느낌표, 긴 줄표, 가운뎃점, 물음표가 없다. `vMessages.test.ts` 가 `upgrade.` 를 본다.
- [코드] `claim.ts` 와 `takeBatch.ts` 가 서로를 불러온다(함수 안에서만 써서 순환이 문제되지 않는다. 테스트와 tsx 가 통과).

## 8. 남긴 파일

`flow/review-restore/`: `ledger-diff.ts`, `ledger-compare.mjs`, `canon-compare.mjs`, `ledger-upgrade.ts`, `compact-check.ts`, `catalog-dump.ts`, `screens.mjs`, `home-jump.mjs`, `home-shrink.mjs`, `reviews-before.mjs`. 스크린샷과 출력은 세션 scratchpad 에 있다.

P0 0건, P1 0건. (P2 3건, P3 6건)
