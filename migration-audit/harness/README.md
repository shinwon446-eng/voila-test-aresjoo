# 동등성 검증 도구

원본(배포 사이트)과 결과물(로컬 정적 내보내기)이 보이는 것, 움직이는 것, 데이터에서 같은지를 브라우저로 재는 도구 모음이다.
도구는 재고 적을 뿐이다. 통과와 실패는 사람이 요약을 보고 정한다. 실행하지 않은 것은 어디에도 통과로 적지 않는다.

- 공통 지침: `migration-audit/BRIEF.md`, 지시문 전문: `migration-audit/MISSION.md` (5장 프레임 검증, 7장, 8장, 13장)
- 이 폴더의 도구는 `web/` 을 고치지 않는다. 예외는 기준값 검사 파일 하나(`web/tests/parityGolden.test.ts`)다.
- `next build` 를 돌리지 않는다. 이미 만들어진 `out` 폴더만 읽는다.

## 0. 준비

```bash
cd migration-audit/harness
npm install          # pixelmatch, pngjs (이 폴더에만 설치된다)
```

Playwright 는 `web/node_modules` 의 것을 그대로 쓴다(기존 촬영 도구 `web/scripts/capture` 와 같은 판, 같은 Chrome `channel: 'chrome'`).
프리셋도 기존 것(`web/scripts/capture/states.mjs` 의 `makeState`, `installState`)을 불러 쓴다.

Git Bash 에서는 주소 경로(`/ko` 같은 것)가 윈도우 경로로 바뀌지 않게 명령 앞에 `MSYS_NO_PATHCONV=1` 을 붙인다.
이 설정을 켜면 `/c/Users/...` 꼴의 경로도 바뀌지 않으므로, 폴더 인자는 상대 경로나 `C:/...` 꼴로 준다.

## 1. 파일

| 파일 | 하는 일 |
|---|---|
| `serve.mjs` | 내보내기 폴더를 배포와 같은 주소(`/voila-test-aresjoo/`)로 내주는 서버 |
| `plan.mjs` | 촬영 계획(자료). 라우트, 언어, 폭, 상태, 겹침 화면, 빈 상태, 오류, 긴 글, 부품의 hover, focus, active |
| `shots.mjs` | 계획을 한 환경에서 찍는다. 촬영마다 PNG 와 기록(JSON) |
| `diff.mjs` | 두 촬영 묶음의 픽셀 차이와 구조 차이. `SUMMARY.md`, `summary.json`, 차이 그림 |
| `flows.mjs` | 시나리오 A 부터 L 을 실제로 누르며 단계마다 화면의 글과 장부를 적는다 |
| `flows-compare.mjs` | 두 흐름 기록을 칸마다 견준다 |
| `motion.mjs` | 개봉 연출의 프레임(100ms 마다)과 사건 순서, 연출 도중의 끼어들기 |
| `motion-compare.mjs` | 두 연출 측정의 단계별 길이 차이와 장부를 쓴 때 |
| `golden/generate.ts` | 기준 커밋에서 카탈로그, 추첨, 돈 계산의 기준값을 만든다 |
| `golden/compute.ts` | 기준값 계산(만드는 쪽과 검사하는 쪽이 함께 쓴다) |
| `golden/*.json` | 기준값. 기준 커밋 63445c7 에서 만든 것 |
| `probe.mjs` | 화면 하나의 조작 요소를 훑어 적는 보조 도구(계획에 항목을 더할 때) |
| `tools/crop.mjs` | 긴 그림의 한 부분을 잘라 본다 |
| `tools/where.mjs` | 두 그림이 어디에서 얼마나 다른지(차이의 크기별 픽셀 수, 몰린 자리, 그 자리의 요소) |
| `tools/repeat.mjs` | 같은 환경에서 같은 항목을 여러 번 찍어 그림이 몇 가지로 나오는지 센다(도구의 흔들림 재기) |
| `tools/variants.mjs` | `tools/repeat.mjs` 로 두 빌드를 각각 여러 번 찍은 것을 받아, 영역마다 한 빌드 안에서 그림이 몇 가지로 나오는지와 두 빌드 사이의 차이가 그 안의 것과 같은 종류, 같은 크기인지를 센다. 결과 JSON 을 `classify.mjs --variants` 에 준다 |
| `golden/find-tones.ts`, `golden/tone-nonces.json` | 고정 시드에서 결과의 크기(below, even, above, high, top)가 정해진 것이 나오는 nonce 를 앱의 모듈로 찾은 것. 연출의 `tone-*`, `ten-*` 경우가 쓴다 |
| `tools/r3-numbers.mjs` | 2차 라운드 최종 실행(after-final3)의 기록에서 보고서(`qa/R2_CYCLE2_visual.md`)의 숫자를 다시 찍는다. 기록을 읽기만 한다 |
| `r2-final3-step1.sh`, `r2-final3-step2.sh` | 2차 라운드 최종 실행을 묶어 돌린 스크립트(촬영, 비교, 분류, 반복 / 흐름, 연출). 주소와 폴더를 바꿔 다른 빌드에 쓴다 |
| `tools/_dom.mjs` | 화면의 한 요소 아래 구조(태그와 클래스)를 적는다(선택자와 구역을 정할 때) |
| `tools/image-identity.mjs` | 두 빌드가 같은 자리에 같은 그림 파일을 쓰는지(주소의 순서와 sha256). aa-shift 로 본 구역의 사진이 같은 파일인지 따로 확인한다 |
| `tools/_broken.mjs` | 그림 요청이 전부 실패할 때 어떤 그림이 깨진 그림으로 남는지 두 빌드에서 적는다(흐름 L 의 차이를 잰 도구) |
| `classify.mjs` | 촬영 비교의 차이를 규칙에 비춰 의도된 것, 배경만 다른 것, 자리 때문인 것, 설명 안 되는 것으로 나눈다 |
| `classify-rules.json` | 의도된 차이의 규칙(촬영과 흐름). 자료 파일이다 |
| `run-compare.sh` | 총괄이 더한 묶음 실행(기준 빌드와 다른 빌드를 띄우고 촬영, 비교, 흐름까지) |
| `lib/regions.mjs` | 요소 단위 촬영(겹침 화면의 판, 개봉 장면, 부품 하나, 화면의 구역) |
| `lib/common.mjs` | 고정 값, 브라우저 컨텍스트, 상태 심기, 요청 지킴이, 기다리기 |
| `lib/measure.mjs` | 촬영마다 재는 것(문서 폭, 그림, 자리와 크기, 줄 수, 글꼴) |
| `lib/observe.mjs` | 흐름 검사가 단계마다 적는 것 |
| `lib/patches.mjs` | 프리셋 위에 덧입히는 값(큰 숫자, 긴 닉네임, 빈 내역 등) |

## 2. 실행 명령

아래에서 `DEPLOYED=https://shinwon446-eng.github.io/voila-test-aresjoo`, `LOCAL=http://127.0.0.1:4173/voila-test-aresjoo` 다.
모든 명령은 `migration-audit/harness` 에서 돌린다.

### 2-1. 로컬 빌드 띄우기

```bash
node serve.mjs C:/Users/hyun1/dev/VOILA-audit-before/web/out 4173
```

- `node serve.mjs <outDir> <port> [basePath]`. 기준 경로의 기본값은 `/voila-test-aresjoo`.
- 포트 3002 는 개발 서버가 쓰고 있으므로 건드리지 않는다.
- 다른 빌드를 견줄 때는 그 빌드의 `out` 폴더와 다른 포트(예: 4174)로 하나 더 띄운다.
- 배포 사이트와 같은 답을 내는 것을 확인한 주소: 폴더 주소의 301(끝 빗금), `index.html`, 없는 주소의 `404.html`(상태 404), `/404`(같은 이름의 `.html` 을 200 으로), 기준 경로 밖의 404.

### 2-2. 촬영

```bash
MSYS_NO_PATHCONV=1 node shots.mjs before-deployed $DEPLOYED ../screenshots/before/deployed --workers 6
MSYS_NO_PATHCONV=1 node shots.mjs before-local    $LOCAL    ../screenshots/after/baseline-local --workers 6
```

- `node shots.mjs <label> <baseUrl> <outDir> [--workers 6] [--groups route,overlay] [--only 글자] [--locales ko,en,zh] [--widths 390,1440] [--resume] [--passes 2] [--quiet 0]`
- 일부만 다시 찍어도 같은 폴더의 `index.json` 에 이어 붙는다. `--resume` 은 이미 찍힌 항목을 건너뛴다.
- `--passes` 는 촬영마다 찍는 횟수(마지막 것만 남긴다, 기본 2). `--quiet` 는 촬영 직전에 더 기다리는 ms(기본 0). 둘 다 3장의 "그림 품질" 통제다.
- 두 환경은 같은 도구 판, 같은 옵션으로 찍어야 한다. 옵션이 다르면 그 차이가 그림에 섞인다.
- 계획의 크기는 `node plan.mjs` 로 본다(지금 항목 1,689개, 촬영 3,282장). 2차 라운드에서 묶음 둘을 더했다: `added`(개봉과 받기 뒤의 지갑 내역, 차감하지 않은 $0 출금 줄, 비밀번호 시트의 오류 줄과 성공 상태. 비밀번호 항목은 로컬 주소에서만 실행한다)와 `loading`(앱의 스크립트 요청을 끊어 hydration 전의 첫 화면을 찍는다).
- 계획의 단계에는 `goto`(같은 컨텍스트에서 다른 주소로), `fill` 의 특수값(`@wrong-password`, `@password`, `@totp`: 프리셋의 시험 계정 값에서 만든다), `optional`(요소가 없으면 그 단계를 건너뛰고 해당 없음으로 적는다)이 있다.
- 결과: `<outDir>/<묶음>/<화면>/<언어>-<폭>-<프리셋>__<이름>.png` 와 같은 이름의 `.json`, 그리고 `<outDir>/index.json`.

### 2-3. 촬영 비교

```bash
node diff.mjs ../screenshots/before/deployed ../screenshots/after/baseline-local ../screenshots/diff/baseline-noise
```

- `node diff.mjs <dirA> <dirB> <outDir> [--review 0.0001] [--only 글자] [--groups a,b]`
- 결과: `<outDir>/SUMMARY.md`, `summary.json`, 다른 픽셀이 있는 촬영마다 `<촬영 id>.diff.png`.

### 2-4. 흐름

```bash
MSYS_NO_PATHCONV=1 node flows.mjs before-deployed $DEPLOYED ../flows/before-deployed
MSYS_NO_PATHCONV=1 node flows.mjs before-local    $LOCAL    ../flows/before-local
node flows-compare.mjs ../flows/before-deployed ../flows/before-local ../flows/compare-baseline
```

- `node flows.mjs <label> <baseUrl> <outDir> [--variants ko-390,en-1440] [--only A,D] [--workers 3]`. 2차 라운드에서는 `--variants ko-390,en-1440,zh-390,ko-1440,en-390` 으로 돌렸다. `--only` 로 일부만 돌리면 같은 폴더의 `flows.json` 에 이어 붙는다.
- 시나리오는 18개다. J2(내가 쓴 후기가 맨 앞에 오는가)는 후기를 하나 올린 뒤 박스 화면과 후기 화면에서 후기 카드의 차례를 읽어 `notes.own`(카드 수, 내 후기의 차례, 맨 앞 카드의 글)에 적고, 저장된 후기의 시각을 40일 전으로 돌려 다시 읽는다. 차례(`ownIndex`)는 규칙으로 덮지 않으므로 두 빌드에서 다르면 설명 안 됨으로 나온다.
- 결과: `flows.json`(단계마다의 관찰값), `FLOWS.md`, 단계마다의 화면 PNG. 비교는 `FLOWS_COMPARE.md`, `flows-compare.json`.

### 2-5. 연출

```bash
MSYS_NO_PATHCONV=1 node motion.mjs before-deployed $DEPLOYED
MSYS_NO_PATHCONV=1 node motion.mjs before-local    $LOCAL
node motion-compare.mjs ../motion/before-deployed ../motion/before-local ../motion/compare-baseline
```

- `node motion.mjs <label> <baseUrl> [outDir] [--runs 3] [--only one-normal,refresh-mid] [--locale ko] [--width 390]`. 출력 폴더의 기본값은 `migration-audit/motion/<label>/`.
- 연출 길이를 재는 도구라 다른 무거운 작업(촬영)과 함께 돌리지 않는다. 함께 돌리면 길이가 늘어난다.
- 경우 17개: 처음의 9개에 결과의 크기별 경우를 더했다. `tone-below`, `tone-above`, `tone-high`, `tone-top`(50달러 박스 한 개, 확인창을 거침, 소리 켬), `tone-cash-above`, `tone-cash-top`(1달러 박스), `ten-low`, `ten-top`(열 개). nonce 는 `golden/tone-nonces.json` 의 값이다.
- 경우마다 결과 화면의 효과(톤, 종류, 상표 띠, 후광, 사진, 여러 개 결과의 가장 큰 결과 칸)와 소리, 진동의 호출 목록(`AudioContext`, `HTMLAudioElement.play`, `navigator.vibrate` 를 감싸 적는다)을 남긴다. 확인창을 거치는 경우에 열기 단추에서 부른 것은 `누르기 전:` 을 붙여 같은 목록의 앞에 둔다.
- `--only` 로 일부만 돌리면 `motion.json` 을 덮어쓴다. 다시 잴 때는 다른 출력 폴더를 준다.
- `PARITY_MOTION_CSS` 환경 변수에 CSS 를 주면 측정 전에 넣는다(원인을 가를 때만 쓴다. 예: 후기 구역을 감추고 길이가 달라지는지 보기).
- 결과: `motion.json`, `MOTION.md`, 경우마다 `run-N/timeline.json` 과 `frame-0000ms.png` 부터 100ms 간격의 프레임. 비교는 `MOTION_COMPARE.md`.

### 2-6. 기준값과 검사

```bash
cd web
npx tsc --noEmit -p .
npm test                      # tests/parityGolden.test.ts 가 기준값과 견준다
```

기준값을 만든 명령(다시 돌릴 일은 없다. 이미 있는 파일은 덮어쓰지 않고 같은지 다른지만 알린다):

```bash
cd C:/Users/hyun1/dev/VOILA-audit-before/web     # 기준 커밋 63445c7 의 사본
npx tsx C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/harness/golden/generate.ts
```

검사가 실패했을 때 기준값을 다시 만들어 통과시키지 않는다. 실패는 데이터나 돈 계산이 기준과 달라졌다는 뜻이다.

### 2-7. 다른 빌드에 그대로 쓰기

총괄이 브랜치 머리를 다른 폴더에 빌드한 뒤(예: `C:/Users/hyun1/dev/VOILA-audit-after/web/out`):

```bash
cd migration-audit/harness
node serve.mjs C:/Users/hyun1/dev/VOILA-audit-after/web/out 4174        # 다른 창에서 띄워 둔다
AFTER=http://127.0.0.1:4174/voila-test-aresjoo

MSYS_NO_PATHCONV=1 node shots.mjs after-local $AFTER ../screenshots/after/head-local --workers 6
node diff.mjs ../screenshots/before/deployed       ../screenshots/after/head-local ../screenshots/diff/head-vs-deployed
node diff.mjs ../screenshots/after/baseline-local  ../screenshots/after/head-local ../screenshots/diff/head-vs-baseline-local

MSYS_NO_PATHCONV=1 node flows.mjs after-local $AFTER ../flows/after-local
node flows-compare.mjs ../flows/before-local ../flows/after-local ../flows/compare-head

MSYS_NO_PATHCONV=1 node motion.mjs after-local $AFTER
node motion-compare.mjs ../motion/before-local ../motion/after-local ../motion/compare-head

cd ../../web && npx tsc --noEmit -p . && npm test
```

- 로컬끼리(`baseline-local` 대 `head-local`) 견주는 쪽이 잡음이 가장 적다. 흐름의 비밀번호 단계도 로컬끼리 견줄 때만 실행된다.
- 배포 사이트와 견주는 쪽은 "배포된 것과 같은가"를 보는 것이다. 아래 5장의 기준선 잡음을 먼저 읽고 본다.

## 3. 결정성 통제

두 환경을 같은 조건에 세우는 장치다. 값은 `lib/common.mjs` 에 있다.

| 통제 | 방법 | 막는 것 |
|---|---|---|
| 시계 | `page.clock.setFixedTime('2026-10-12T03:00:00Z')`. 페이지의 `Date` 가 서울 시각 낮 12시에 선다. 타이머는 그대로 흐른다. 프리셋이 "지금"으로 적는 시각도 같은 값으로 바꿔 심는다 | 날짜 글, "며칠 남음", 72시간 보류의 남은 시간, 최근 연 박스의 차례 |
| 시계 옮기기 | 확인창의 확정 단추는 `pressConfirm` 으로 누른다: 600ms 기다리고, 고정한 시계를 1초 앞으로 옮기고(`tickClock`), 누른 뒤에도 단추가 그대로 보이면 700ms 마다 세 번까지 다시 옮기고 누른다. 촬영과 흐름에서 두 빌드에 똑같이 한다. 연출 도구는 실제 시계를 쓰므로 600ms 기다린 뒤 누른다 | 결과 빌드의 확인창은 뜬 뒤 350ms 동안 확정 단추의 누름을 버린다. 그 판단이 처음에는 `Date.now()`, 3c161f2 부터는 `performance.now()` 다. 세워 둔 시계에서는 둘 다 흐르지 않는다(2026-10-12, 10-13 실측) |
| 창 | 폭마다 높이와 배율 고정: 320×568, 360×800, 390×844, 430×932 는 배율 2에 터치. 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080 은 배율 1 | 폭과 높이에 따른 배치, 배율에 따른 가장자리 |
| 브라우저 | 설치된 Chrome(`channel: 'chrome'`, headless). 언어는 로케일에 맞춤, 시간대 Asia/Seoul, 색 구성 dark | 브라우저 판과 지역 설정에 따른 글 모양 |
| 글꼴 | `document.fonts.ready` 를 기다린 뒤, 대체용이 아닌 글꼴 면을 `FontFace.load()` 로 전부 불러 둔다(`PARITY_NO_FONT_FORCE=1` 로 끈다). 불린 글꼴 목록, 이 단계에서 새로 불린 면의 수(`fontsForced`), 부품의 계산된 글꼴을 기록한다 | 글꼴이 바뀌는 순간에 찍히는 것. 2차 라운드의 실측으로는 새로 불린 면이 0개였고, 홈 배너와 머리줄의 변종을 없애지 못했다(4-1-2) |
| 그림 | `loading="lazy"` 를 `eager` 로 바꿔 전부 부른 뒤 모든 `img` 가 끝나고 풀릴 때까지 기다린다. lazy 로 적혀 있던 수는 기록에 남는다 | 스크롤 위치에 따라 그림이 있다 없다 하는 것 |
| 움직임 | `prefers-reduced-motion: reduce`, 움직임을 세우는 CSS(`FREEZE_CSS`), 촬영 옵션 `animations: 'disabled'` | 애니메이션 중간 프레임 |
| 추첨 | 저장된 공정성 스토어(`gachaflix.fair`)에 고정 서버 시드, 클라이언트 시드, nonce 0 | 개봉 결과가 실행마다 달라지는 것 |
| 네트워크 | 이 사이트의 기준 경로 아래 GET 만 통과. 그 밖의 요청은 끊고 기록. 서비스 워커 차단. 화면마다 네트워크가 잠잠해질 때까지 기다림 | 바깥 서비스의 상태, 실제 전송 |
| 저장소 | 항목마다 새 컨텍스트(빈 저장소). 프리셋을 페이지 스크립트보다 먼저 심는다 | 앞 항목의 상태가 남는 것 |
| 긴 문서 | 높이가 16,000 기기 픽셀을 넘으면 8,000 픽셀씩 잘라 찍고 이어 붙인다 | Chrome 이 16,384 픽셀 아래를 맨 위부터 되풀이해 그리는 것(실측) |
| 그림 품질 | (가) Chrome 인자 `--disable-checker-imaging` (나) 촬영 전에 모든 `img` 를 한 프레임 숨겼다 되돌려 다시 그리게 함 (다) 촬영마다 두 번 찍고 두 번째 것만 남김 | 같은 환경에서 두 번 찍어도 줄여 그린 사진이 곱게도 거칠게도 그려지던 것(실측, 5장) |

통제가 가리는 것도 있다. 알고 써야 한다.

- 정지 화면은 전부 움직임 줄이기 상태다. 보통 움직임의 화면은 `motion.mjs` 의 프레임으로만 본다.
- 그림을 전부 eager 로 부르므로 "lazy 로 불리는가"는 그림이 아니라 기록의 `images.lazyAttr` 로만 본다.
- `motion.mjs` 는 시계를 고정하지 않는다(연출 길이가 재는 대상이다). 그래서 길이는 실행마다 몇 ms 흔들리고, 견줄 때는 가운데 값과 흔들림 폭을 함께 본다.
- 흐름 검사는 움직임을 줄이지 않는다(실제 사용자의 조건). 기다림은 시간이 아니라 화면의 상태로 건다.

## 4. 요약 읽는 법

### 4-1. `SUMMARY.md` (촬영 비교)

픽셀 숫자 셋을 따로 센다. 한 점수로 뭉치지 않는다.

- `exact`: 값이 조금이라도 다른 픽셀
- `aa`: 가장자리 다듬기(안티앨리어싱)로 본 픽셀. 렌더링 환경 차이에서 나오므로 따로 분류한다
- `solid`: 가장자리 다듬기가 아니면서 눈에 띄게 다른 픽셀(pixelmatch threshold 0.1)

촬영의 종류:

| 종류 | 뜻 |
|---|---|
| identical | 픽셀이 전부 같고 구조 기록도 같다 |
| sub-threshold | 값이 다른 픽셀이 있으나 눈에 띄는 차이는 없다 |
| aa-only | 가장자리 다듬기 픽셀만 다르다 |
| solid-pixels | 가장자리 다듬기가 아닌 픽셀이 다르다. 구조 기록은 같다 |
| structure | 구조 기록이 다르다 |
| runtime-only | 그림과 구조는 같고 콘솔이나 요청 기록만 다르다 |
| one-side-only | 한쪽에서만 찍혔다 |
| both-not-applicable | 두 쪽 모두 해당 없음(예: 넓은 폭에는 메뉴 단추가 없다) |
| both-missing | 두 쪽 모두 찍지 못했다. 견주지 못한 것이다 |

구조 차이의 이름: `sizeMismatch`(그림 크기), `overflowX`(가로 넘침), `docWidth`, `docHeight`, `boxMoved`(자리나 크기가 2px 넘게 다름), `elementCount`(요소 수), `textWrap`(같은 글의 줄 수가 다름), `textSet`(한쪽에만 있는 글), `brokenImages`, `pendingImages`, `imageCount`, `fonts`, `loadedFonts`, `dialogs`, `url`, `httpStatus`, `console`, `failedRequests`, `httpErrors`, `blockedRequests`.

"사람이 볼 목록"(14절)에는 `solid` 비율이 0.01% 를 넘거나 구조 차이가 하나라도 있는 촬영이 전부 오른다. 그 목록의 촬영은 차이 그림(`.diff.png`: 빨강은 다름, 노랑은 가장자리 다듬기)과 두 원본을 나란히 놓고 눈으로 본다. 긴 그림은 `node tools/crop.mjs <png> <x> <y> <폭> <높이> <out.png> [축소 배수]` 로 잘라 보고, 어디가 얼마나 다른지는 `node tools/where.mjs <a.png> <b.png>` 로 본다.

목록에 오른 것을 보기 전에 한 번 다시 찍는다. 같은 환경에서도 가끔 한 번씩 다르게 그려지는 것이 있기 때문이다(5장). 목록의 항목은 `reshoot.txt` 에 쉼표로 이어 적힌다.

```bash
R="$(cat ../screenshots/diff/<비교 이름>/reshoot.txt)"
MSYS_NO_PATHCONV=1 node shots.mjs <A 라벨> <A 주소> <A 폴더> --only "$R"
MSYS_NO_PATHCONV=1 node shots.mjs <B 라벨> <B 주소> <B 폴더> --only "$R"
node diff.mjs <A 폴더> <B 폴더> ../screenshots/diff/<비교 이름>
```

한 번만 생긴 흔들림은 사라지고, 다시 찍어도 남는 차이만 진짜 차이다. 다시 찍기 전의 요약을 남겨 두려면 `SUMMARY.md` 를 다른 이름으로 복사해 둔다.

지시문의 목표 허용 오차와 요약의 대응: 주요 요소의 자리와 크기 2px 이내는 9절, 줄바꿈 변화 0건은 7절, 그림 누락 0건은 6절, 가로 넘침 0건은 5절, 필수 화면 누락 0건은 2절과 3절이다.

### 4-1-1. 요소 단위 촬영과 `CLASSIFIED.md` (의도된 차이가 있는 빌드를 견줄 때)

화면 전체가 달라도 "이 부분은 그대로인가"를 따로 보려고, 촬영마다 정해 둔 영역을 잘라 찍는다(`lib/regions.mjs`). 파일은 `<촬영 id>~<영역>.png`, 자리와 글은 기록의 `regions` 에 있다.

| 영역 | 찍는 때 | 찍는 방법 |
|---|---|---|
| `target` | 부품 촬영(hover, focus, active) | 그 요소 하나를 여백 없이 |
| `dialog` | 겹침 화면이 떠 있을 때 | 맨 위의 판. 가림막을 불투명한 검정으로 바꿔 뒤의 화면이 비치지 않게 한다 |
| `scene` | 개봉 화면이나 여러 개 결과 화면이 떠 있을 때 | 그 뿌리. 위에 뜬 시트는 숨긴다 |
| 화면의 구역 | 겹침 화면이 없고 주소가 홈, 박스, 후기일 때(전체 촬영에서 한 번) | 머리줄, 배너, 검색, 알약, 카드의 사진과 이름과 가격(앞의 넷), 박스의 대표 상품, 구매 막대, 구성품, 확률, 알아둘 것, 꼬리말 등. 붙어 다니는 것은 숨기고 문서 좌표로 찍는다 |

`diff.mjs` 는 영역마다 크기, 글, 픽셀을 견준다(자리는 견주지 않는다. 위의 내용이 늘면 아래는 내려간다). 상태는 `same`, `noise`, `aa-shift`(크기와 글이 같고 요소가 놓인 소수 자리만 달라 가장자리가 달리 그려짐. 눈에 띄는 픽셀이 영역의 5% 미만), `differ`, `size`, `onlyA`, `onlyB` 다.

`classify.mjs` 는 그 결과를 규칙(`classify-rules.json`)에 비춰 촬영마다 갈래를 붙인다.

```bash
node classify.mjs ../screenshots/diff/<비교 이름>          # CLASSIFIED.md, classified.json, reshoot-unexplained.txt
```

| 갈래 | 뜻 |
|---|---|
| identical, noise | 그대로이거나 기준선의 흔들림과 같은 종류 |
| intended (구역 확인함) | 차이가 전부 규칙이 허락한 자리에 있고, 허락되지 않은 구역은 전부 그대로다 |
| intended (구역 확인 못 함) | 구역을 찍지 않은 촬영(첫 화면 등). 글이 달라진 구역과 구조 기록만으로 본 것이다. 같은 항목의 전체 촬영이 구역을 확인한다 |
| background-only | 시트, 장면, 부품 자체는 픽셀까지 그대로이고 뒤나 둘레의 화면만 다르다 |
| position-aa | 크기와 글이 같고 자리의 소수 부분만 달라 가장자리가 달리 그려졌다(자리의 소수 부분을 적는다) |
| UNEXPLAINED | 규칙으로 설명되지 않는 차이가 하나라도 있다. 사람이 그림을 본다 |

규칙은 자료 파일에 있고 칸의 뜻은 그 파일 머리에 적혀 있다. 목록을 비우려고 규칙을 넓히지 않는다. 규칙을 더할 때는 `why` 에 눈으로 본 근거를 적는다. UNEXPLAINED 는 한 번 다시 찍어 본다(`reshoot-unexplained.txt`). 홈 배너의 흔들림처럼 한 번만 생기는 것은 사라지고, 남는 것만 사람이 본다.

### 4-1-2. 한 빌드 안의 변종 (`tools/variants.mjs`, `classify.mjs --variants`)

같은 빌드를 같은 조건으로 찍어도 그림이 여러 가지로 나오는 영역이 있다(홈 배너의 카드, 좁은 폭 머리줄의 글자 가장자리). 다시 찍어 사라지기를 기다리지 않고 수로 가린다.

```bash
IDS=overlay/footer-controls/ko-1440-guest,route/home/ko-1280-guest     # 설명 안 된 항목들
MSYS_NO_PATHCONV=1 node tools/repeat.mjs $BEFORE ../qa/r2-repeat/baseline 8 --only "$IDS"
MSYS_NO_PATHCONV=1 node tools/repeat.mjs $AFTER  ../qa/r2-repeat/after-final2 8 --only "$IDS"
node tools/variants.mjs ../qa/r2-repeat/baseline ../qa/r2-repeat/after-final2 ../qa/r2-variants-unexplained.json all
node classify.mjs $D --variants ../qa/r2-variants-unexplained.json
```

- `variants.mjs` 는 촬영과 영역마다 빌드 안에서 나온 서로 다른 그림의 수와 횟수(`withinA`, `withinB`), 두 빌드에 바이트까지 같은 그림이 있는지(`shared`), 빌드 안의 최대 차이와 빌드 사이의 최대 차이(눈에 띄는 픽셀)를 적는다.
- `classify.mjs --variants` 는 설명 안 된 영역을 다음 둘이 다 맞을 때만 `within-build-variant` 로 둔다: 그 촬영의 그 영역에서 두 빌드가 바이트까지 같은 그림을 낸 적이 있다, 그리고 이번 차이의 크기가 같은 종류의 영역에서 한 빌드 안에 나온 최대 차이 이하다. 하나라도 아니면 UNEXPLAINED 로 남는다.
- 이 갈래는 "두 빌드가 같다"가 아니라 "이 차이는 한 빌드 안에서도 같은 크기로 나온다"는 뜻이다. 드문 변종은 반복 횟수가 적으면 잡히지 않는다(2차 라운드: 1,043픽셀 변종은 기준 600장에 1장, 결과 3c161f2 의 반복 120장에는 0장).

### 4-1-3. 명세에 없는 차이를 덮지 않기 (`undecidedRewrite`)

본문 구역 전체를 허락하는 규칙은 그 구역 안의 다른 차이까지 덮는다. 그런 차이를 찾으면 규칙 파일의 `shots` 에 `undecidedRewrite`(찾을 것과 바꿀 것의 목록)를 가진 항목을 적는다. 기준 쪽 줄을 그렇게 바꿔 쓰면 결과 쪽의 한 줄과 똑같아지는 짝이 있는 촬영은, 구역을 허락하는 규칙이 있어도 UNEXPLAINED 로 남는다. 의도된 차이의 규칙이 아니다. 총괄이 의도된 것으로 정하면 그 항목을 지우고 바꿔 쓰는 규칙(`rewrite`)으로 옮긴다. 지금 있는 것: `U-wallet-row-separator`(지갑 내역 줄의 날짜와 상태 사이, f830d9e).

덮인 것을 찾는 법(2차 라운드에서 쓴 것): 앞선 빌드와의 분류에서 규칙이 붙은 촬영 수가 달라졌는지 보고, 후기 자리 밖에서 기준과 다른 글의 줄(`summary.json` 의 `detail.textSet.outside`)을 앞선 빌드 때와 줄 단위로 견준다.

### 4-2. `FLOWS_COMPARE.md` (흐름 비교)

단계마다 같음, 의도된 차이, 설명 안 됨, 장부 다름, 검증 불가, 한쪽만 실행, 오류 가운데 하나다. 같음은 "두 환경에서 실행했고 적은 값이 전부 같다"는 뜻이다. 검증 불가와 한쪽만 실행은 같음으로 세지 않는다. 무작위 번호(보관함 기록, 거래, 개봉의 번호)만 처음 나온 순서의 자리표로 바꿔 견준다.

다른 칸은 셋으로 나눈다(`classify-rules.json` 의 `flows`).

- 장부: 저장된 값(`storage` 아래 전부: 지갑, 보관함, 거래, 시드와 nonce, 세션, 저장 키). 규칙으로 덮지 않고 시나리오마다 따로 적는다. 하나라도 다르면 그 단계는 "장부 다름"이다.
- 의도: 규칙이 허락한 칸. 화면의 관찰값은 후기 자리(후기 구역, 별점 줄, 카드의 별점)를 `reviewZone` 칸에 따로 담으므로(`lib/observe.mjs`), 후기 자리 밖의 칸은 그대로여야 한다. 본문에서 후기 자리를 뺀 글 전체의 길이와 해시(`mainOutsideReviews`)도 함께 견준다.
- 설명 안 됨: 어느 규칙에도 맞지 않는 칸. 경로와 두 값이 적힌다.

### 4-3. `MOTION_COMPARE.md` (연출 비교)

2차 라운드에서 더한 칸: CSS 애니메이션은 사건의 묶음(끝남과 끊김을 한 가지로, 차례를 떼고)이 모든 실행에서 같으면 같음이고, 같은 프레임에 끝나는 사건의 차례가 실행마다 바뀌면 그 가짓수를 괄호에 적는다. "두 빌드의 값이 겹치지 않는 칸"은 차이가 작아도 한쪽으로 치우친 칸의 목록이다(판정이 아니다. 세 번씩이면 우연으로도 나온다). 효과와 호출의 표가 따로 있다.

단계별 길이의 가운데 값을 A / B (차이) 로 적는다. "볼 것"은 차이가 50ms 를 넘거나 실행 사이의 흔들림보다 큰 칸이다. 판정이 아니다. 사건 순서는 시각을 떼고 종류의 차례만 견준다. "장부를 쓴 때" 표는 결과가 드러나기 전에, 그리고 개봉 화면이 뜨기 전에 보관함 기록이 이미 저장됐는지를 실행마다 적는다.

## 5. 기준선 잡음 실행 (2026-10-12)

같은 커밋(63445c7)의 배포 사이트와 로컬 빌드를 견준 결과다. 숫자와 원인은 아래 파일에 있다.

- 촬영: `migration-audit/screenshots/diff/baseline-noise/SUMMARY.md`
- 흐름: `migration-audit/flows/compare-baseline/FLOWS_COMPARE.md`
- 연출: `migration-audit/motion/compare-baseline/MOTION_COMPARE.md`

전부 직접 실행한 결과다. 로그는 `migration-audit/logs/harness-*.log` 에 있다.

### 5-1. 촬영

A 는 배포 사이트(`screenshots/before/deployed`), B 는 로컬 기준 빌드(`screenshots/after/baseline-local`). 항목 1,617개, 촬영 3,108건, 두 쪽 모두 실패 0.

| 실행 | identical | sub-threshold | solid-pixels | structure | runtime-only | 해당 없음 | 사람이 볼 목록 |
|---|---|---|---|---|---|---|---|
| 1차(그림 품질 통제 전, `diff/baseline-noise-run1`) | 2,974 | 78 | 24 | 16 | 7 | 9 | 37 |
| 2차(통제 뒤, `SUMMARY.first-pass.md`) | 2,911 | 179 | 8 | 1 | 0 | 9 | 8 |
| 2차의 목록 19개 항목을 다시 찍은 뒤(`SUMMARY.md`) | 2,920 | 178 | 1 | 0 | 0 | 9 | 0 |

마지막 줄이 지금의 기준선이다. 크기 불일치, 한쪽에만 있는 촬영, 가로 넘침의 차이, 깨지거나 빠진 그림, 줄 수의 변화, 한쪽에만 있는 글, 2px 넘는 자리 변화, 요소 수의 변화, 글꼴 차이는 모두 0건이다. 남은 solid-pixels 1건은 `route/home/en-320-guest__first` 의 39 픽셀(0.005%)이다.

1차에서 나온 차이와 원인, 조치:

| 차이 | 수 | 원인 | 조치 |
|---|---|---|---|
| 줄여 그린 상품 사진이 다름(검색 결과 행, 롤렉스 박스 전체 촬영) | solid 24건 가운데 다수 | 도구의 흔들림. 같은 주소, 같은 바이트(sha256 같음)의 사진이 어떤 때는 곱게, 어떤 때는 거칠게 그려졌다. 로컬끼리 두 번 찍어도 달랐다(검색 결과 화면은 4번 찍어 4번 다 다름). Chrome 이 큰 그림을 뒤에서 풀며 타일을 다시 그리는 기능(checker imaging)과 그림이 불리는 도중의 그리기가 겹친 것 | Chrome 인자 `--disable-checker-imaging`, 촬영 전 그림 다시 그리기, 촬영마다 두 번 찍기. 셋을 다 쓴 뒤 같은 환경에서 5번 찍으면 값 1~2 차이의 픽셀만 남았다(가장 큰 것 6,489 픽셀, 개봉 결과 화면의 빛 번짐) |
| 콘솔 글 `404 ()` 대 `404 (Not Found)` | 12건 | 환경 차이. 배포는 HTTP/2 라 상태 설명 글이 없고 로컬 서버는 HTTP/1.1 이라 있다. 화면과 동작에는 영향이 없다 | 견줄 때 상태 설명 글을 뗀다 |
| 불린 글꼴 목록(대체 글꼴의 상태가 loaded 대 unloaded) | 10건 | 글꼴 파일이 도착한 때의 차이(없는 주소 화면). 그림은 픽셀까지 같다 | 대체 글꼴의 상태는 견주지 않고 따로 적는다 |
| 가로 넘침(홈, 폭 1024, 문서 1028) | 6건 | 차이가 아니다. 두 쪽이 똑같이 넘친다. 홈 배너의 큰 공(`.v-hero-orb--ball`)이 오른쪽으로 4.4px 나간다. `html` 이 `overflow-x: hidden` 이라 스크롤은 생기지 않는다. 원본의 성질이다 | 두 쪽이 같으면 차이로 세지 않고 5-1절에 따로 적는다 |
| 검증 화면의 "계산" 촬영이 로그인 창을 찍음 | 1건(2차에서 드러남) | 계획의 오류. 비로그인 화면의 첫 단추는 로그인 단추였다 | 계산 단추를 절 안의 것으로 짚도록 계획을 고치고 다시 찍었다 |

2차에서 남았다가 다시 찍으니 사라진 것:

- 홈 배너의 카드 사진 셋(3차원으로 기울인 사진)이 가끔 다른 표본으로 그려진다. 한 번 생기면 배너 영역의 약 15만 픽셀이 값 1~2 만큼 다르고 그 가운데 약 1,000 픽셀(0.07%)이 문턱을 넘는다. 로컬끼리 6번 찍으면 1번쯤 나온다. 배치와 글은 같다. 통제하지 못했다. 그래서 목록에 오른 항목은 다시 찍어 본다(4-1절).

남은 미세 차이 178건은 모두 값 1~2 차이의 픽셀이다(문턱 아래). 홈과 박스 첫 화면의 사진, 개봉 결과의 빛 번짐, 꼬리말의 큰 로고에 몰려 있다. 같은 환경에서 되풀이해 찍어도 같은 크기로 나오는 흔들림이다.

실측으로 확인한 환경 차이(배포 대 로컬 빌드):

- 묶음 파일 이름의 해시가 다르다(예: `117-42eb5f643be85b5b.js` 대 `184-821579e4c1f90d25.js`). 같은 커밋을 다른 곳에서 빌드했기 때문이다. 화면, 흐름, 연출에서 차이는 나오지 않았다.
- 응답 규약이 다르다(HTTP/2 대 HTTP/1.1). 콘솔의 상태 설명 글에만 드러난다.
- 그 밖에 촬영, 흐름, 연출에서 배포와 로컬 빌드의 차이는 찾지 못했다.

### 5-2. 흐름

시나리오 17개(A, B, C, D, D2, E, E2, F, F2, G, H, H2, H3, I, J, K, L) × 변형 2개(ko-390, en-1440) = 34건. 두 환경 모두 멈춘 것 0건.

단계 366개: 같음 336, 다름 0, 검증 불가 24, 한쪽만 실행 6, 오류 0.

- 한쪽만 실행 6개는 시나리오 C 의 비밀번호 단계다. 로컬에서만 실행했다(배포 사이트에는 비밀번호를 넣지 않는다).
- 검증 불가 24개의 까닭은 `FLOWS_COMPARE.md` 끝에 있다(정렬 조작 요소 없음, 입금 확인 서버 없음, 배송과 출금 신청은 내지 않음, 소셜 로그인, 인증 메일, 파일 고르는 창, 서버 세션, 오류 화면).
- 처음 견줄 때 나온 다름 9개는 전부 도구 쪽이었다: 후기 번호(`my_` 로 시작하는 무작위 번호), 콘솔의 상태 설명 글, 동시에 실패한 요청의 차례와 묶음 파일 이름. 견주는 규칙을 고친 뒤 0개다.

### 5-3. 연출

경우 9개 × 3번, 끼어들기 5개. 조건은 ko, 폭 390.

- 단계별 길이의 차이(로컬 빼기 배포, 가운데 값): 보통 조건에서 -12ms 부터 +9ms. CPU 를 4배 느리게 한 경우에 -19ms 까지. "볼 것" 표시 0칸.
- 잰 길이(로컬, 가운데 값): 누름→개봉 화면 29ms, 기대 529ms, 충격 154ms, 퇴장 173ms, 결과→단추 352ms, 누름→결과 886ms. 코드의 값(520, 150, 170, 350)과 9ms 안쪽이다.
- 사건 순서는 9개 경우 모두 같다. 끼어들기 5개(연출 도중 다시 누름, 같은 순간에 세 번 누름, 떠났다 돌아옴, 새로 고침, 뒤로 가기)는 단계마다 장부가 같다. 어느 경우에도 개봉 거래는 한 번이고(거래 기록 3건: 가입 보너스, 개봉 -1, USDT 결과의 입금 0.05), 보관함 기록은 하나, 다음 nonce 는 1 이다.
- 보관함 기록은 모든 실행에서 개봉 화면이 뜨기 전에 이미 저장됐다(누른 뒤 약 14ms 에 저장, 개봉 화면은 약 30ms).
- 충격 단계의 CSS 애니메이션(`v-op-pop`)은 길이가 단계 타이머와 같은 150ms 라서 같은 환경에서도 실행마다 끝까지 가기도, 다음 단계가 먼저 와서 끊기기도 한다(배포 3번 가운데 0~2번, 로컬 3번 가운데 1~2번). 원본의 성질이다. 견줄 때는 끝남과 끊김을 한 가지로 본다.

### 5-4. 기준값과 검사

- `npx tsc --noEmit -p .`: 종료 코드 0 (`logs/harness-tsc.log`)
- `npm test`: 404개 가운데 통과 403, 건너뜀 1, 실패 0 (`logs/harness-test.log`). 기준 398개에 기준값 검사 6개가 더해진 수다.
- 기준값: 박스 334개(홈에 나오는 것 320개), 상품 행 32,916개, 서로 다른 상품 id 21,007개. 박스마다 확률의 합은 정확히 1,000,000칸이다.

### 5-5. 도구를 만들며 본 원본의 성질(두 환경이 같다. 차이가 아니다)

발견 사항으로 올릴지는 총괄이 정한다. 전부 화면에서 본 것이고, 코드의 자리를 함께 적는다.

- 없는 주소 화면의 "박스 보기" 단추가 `href="/ko"` 다. 기준 경로(`/voila-test-aresjoo`)가 빠져 있어 배포 사이트에서는 사이트 밖의 주소로 간다(`web/app/not-found.tsx` 의 `href={"/" + lang}`).
- 홈, 폭 1024 에서 문서 폭이 1028 이다(위 표).
- 브라우저 안의 계정은 비밀번호를 바꾼 적이 없으면 어떤 비밀번호로도 들어간다(`web/lib/browserAccount.ts` 의 `strictPassword`). 이메일 칸도 빈 칸만 아니면 받는다(`web/lib/account.ts` 의 `validAccountEmail`).
- 꼬리말에서 언어를 바꿔도 저장된 언어(`gachaflix.locale`)는 그대로다. 그래서 루트 주소로 들어가면 처음 언어로 돌아간다(흐름 K).
- 열기를 누른 뒤 개봉 화면이 뜨기 전 약 8ms 동안 "못 본 결과 다시 보기" 단추가 잠깐 그려진다(연출의 사건 순서에 `dom(recover)` 로 남는다).
- 긴 박스 화면은 높이가 16,384 기기 픽셀을 넘는다(390 폭, 배율 2 에서 약 36,000 픽셀). 한 번에 찍으면 Chrome 이 아래를 되풀이해 그리므로 잘라 찍어야 한다.

## 6. 하지 않는 것과 한계

- 출금과 배송 신청은 내지 않는다. 입력이 검증된 상태까지만 본다.
- 비밀번호를 넣는 단계는 로컬 주소에서만 실행한다. 배포 사이트에서는 검증 불가로 적는다.
- 바깥 서비스(소셜 로그인, 입금 확인, 택배 조회, 인증 메일)는 부르지 않는다. 그런 단계는 검증 불가로 적는다.
- 운영체제의 파일 고르는 창, 네이티브 select 의 펼친 목록, 실제 모바일 기기, 탭의 백그라운드 전환, 소리 재생 실패는 이 도구로 보지 못한다.
- 촬영은 설치된 Chrome 한 종류로만 한다. 다른 브라우저(Safari, Firefox)는 보지 않는다.
- `dev/gallery` 는 프로덕션 빌드에서 없는 주소다(`notFound()`). 두 환경 모두 그 답을 찍는다.
