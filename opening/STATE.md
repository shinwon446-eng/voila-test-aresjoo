# 개봉 경험 임무 상태 (이 파일만 읽으면 이어서 할 수 있다)

- 시작: 2026-10-11 오전. 파운더 지시 "VOILA — THE ULTIMATE BOX-OPENING EXPERIENCE".
- 이전의 24시간 전체 개선 랩은 **중단**했다(예약 깨어남 취소). 다시 시작하지 않는다. 루트의 STATE.md, IMPROVEMENT_LOOP.md, DECISION_LOG.md 는 그 랩의 기록이다.
- 범위: 박스에서 열기까지의 상호작용, 구매 확인, 개봉 연출(움직임, 소리, 진동), 결과 공개, 그 자리에서 USDT 로 받기와 정산, 같은 화면에서 다시 열 준비, 확률 구조 제안(제안만), 모바일 화면 검수. 그 밖의 화면, 브랜드, 글꼴, 메뉴는 건드리지 않는다.
- 하지 않는 것: 운영 확률 변경(제안과 계산만, 파운더 승인 필요), 지어낸 시험 결과, 가짜 근접 실패, 낮은 결과에 높은 등급 신호, 다음 열기 자동 결제.
- 브랜치 `voila-redesign`, 커밋 끝줄 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. 테스트 사이트 배포는 main 푸시(파운더 허락 범위). 개발 서버가 떠 있는 동안 build 금지, build 뒤 `rm -rf web/.next`.
- 반복 한도: 설계와 검수 5회.

## 문서
- `opening/BASELINE.md` 기준 진단
- `opening/RESEARCH.md` 연구 요약(근거와 가설 구분)
- `opening/DECISIONS.md` 결정 기록(관찰, 증거, 제안, Codex 비판, 결정, 구현, 화면, 검증, 남은 것)
- `opening/PROBABILITY.md` 확률 모델 셋과 시뮬레이션(제안만)
- `opening/REPORT.md` 최종 보고
- 화면 증거: `qa/opening/<단계>/`

## 도구
- 시험 고정값: `npx tsx scripts/capture/opening-fixtures.ts` → `scripts/capture/opening-fixtures.json` (실제 계산식에 넣으면 원하는 결과가 나오는 시드와 회차. 결과를 조작하지 않는다)
- 촬영: `node scripts/capture/opening.mjs <폴더> <이름> --box <slug> --fixture single:<small|near|x2|x5|x15|physicalTop|physicalMid> | seq:<lowLowLowHighHighHigh|tenSmall|smallBigSmall|threeBig|mixed> --cast [--view m360] [--reduced] [--skip] [--balance n]`
- 녹화 파일(webm)은 못 만든다: Playwright 의 ffmpeg 가 이 PC 에 없고 내려받기는 파운더 허락이 필요하다. 대신 브라우저 화면 전송으로 실제 프레임을 받아 필름 띠와 프레임 폴더를 남긴다.

## 진행 (2026-10-11 낮 기준)
- [x] 0 이전 랩 중단
- [x] 1 기준 진단과 기준 화면 (`opening/BASELINE.md`, `qa/opening/baseline/`)
- [x] 2 연구 요약 (`opening/RESEARCH.md`. Reddit 넷은 열지 못했다고 적어 둠). Codex 반박은 `opening/DECISIONS.md` 맨 아래에 반영
- [x] 3 시안 셋 실제 제작과 비교(`qa/opening/proto/`), Codex 라운드 A(`opening/codex/round-a.md`) → 넷째 안 채택
- [x] 4 채택안 구현(커밋 `9a9292a`, `15cff93`): `components/box/Opening.tsx`, `app/opening.css`, `lib/openingFlow.ts`(톤, 길이, 상태 기계), `lib/openingSettle.ts`, `lib/openingSound.ts`, `stores/openingJournal.ts`(기록장과 복구), `stores/settingsStore.ts`(소리, 짧게 보기, 자동 받기, 지난 방법), `components/box/Reveal.tsx`(여러 개 열기, 같은 상자)
- [x] 5 확률 모델 셋 계산과 시뮬레이션(`web/scripts/opening/probability.ts` → `opening/PROBABILITY-tables.md`). 남은 것: Codex 검산 결과 반영, 권고를 담은 `opening/PROBABILITY.md` 쓰기
- [x] 6a 검수 1(구조): `node scripts/capture/opening-qa.mjs ../qa/opening/qa2` 73개 항목 통과. 단위 테스트 302 통과, design-lint 0, tsc 통과
- [ ] 6b 검수 2(다듬기)와 검수 3(Codex 적대 검수): 라운드 B(구현과 확률, `opening/codex/round-b.md`)와 라운드 C(화면 31장, `opening/codex/round-c.md`)를 돌리는 중. 끝나면 지적마다 결정을 `opening/DECISIONS.md` 반복 2 에 적고 고친 뒤 검수 스크립트를 다시 돌린다
- [ ] 7 최종 보고 `opening/REPORT.md`(전후 비교, 연구, 흐름, 결과별 화면, 확률 모델, 구현, Codex 비평, 검수 증거, 권고), 보고서용 화면을 `opening/evidence/` 에 골라 올리기(qa 폴더의 PNG 는 .gitignore 로 커밋되지 않는다), main 배포(개발 서버 내리고 build, 끝나면 `rm -rf web/.next` 뒤 preview_start)

## 반복 횟수
- 반복 1: 시안 셋 → Codex A → 채택안 구현 → 구조 검수. 끝.
- 반복 2: Codex B, C 반영(진행 중). 한도는 5회.

## 재는 값(검수 스크립트 s10, 화면 안 시계)
- 누른 뒤 결과까지 약 0.87초, 다음 행동까지 약 1.2초. 짧게 보기는 0.48초. 프레임 평균 16.7ms, CPU 4배 느리게 18.3ms.

## 파운더에게 물을 것(막지 않는다)
- 녹화 파일(webm)을 만들려면 Playwright 의 ffmpeg 를 내려받아야 한다. 허락 전에는 필름 띠로 대신한다.
- 확률 모델 A, B, C 는 제안이다. 적용하려면 승인이 필요하다.
