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

## 진행 (2026-10-11, 끝)
- [x] 0 이전 랩 중단
- [x] 1 기준 진단과 기준 화면 (`opening/BASELINE.md`)
- [x] 2 연구 요약 (`opening/RESEARCH.md`), Codex 반박 반영
- [x] 3 시안 셋 제작과 비교, Codex 라운드 A → 넷째 안 채택
- [x] 4 채택안 구현
- [x] 5 확률 모델 셋 계산과 시뮬레이션, Codex 검산 반영 (`opening/PROBABILITY.md`, `opening/PROBABILITY-tables.md`)
- [x] 6 검수: 구조(83개 항목), 다듬기, Codex 적대 검수(라운드 B 구현과 확률, 라운드 C 화면 31장) → 반복 2 에서 반영
- [x] 7 최종 보고 `opening/REPORT.md`, 증거 화면 `opening/evidence/`, main 배포

## 반복 횟수
- 반복 1: 시안 셋 → Codex A → 채택안 구현 → 구조 검수.
- 반복 2: Codex B, C 반영(돈과 상태의 결함 수정, 화면 수정) → 재검수. 여기서 멈췄다(한도 5회).
- 반복 2 의 수정에 대한 Codex 재검수는 받지 않았다. 다시 시작한다면 그것이 첫 일이다.

## 재는 값(검수 스크립트 s10, 화면 안 시계)
- 누른 뒤 결과까지 0.89초, 다음 행동까지 1.24초. 짧게 보기는 약 0.5초. 프레임 평균 16.7ms, CPU 4배 느리게 18.0ms.

## 검수 다시 돌리기
- 개발 서버(3002)를 띄운 뒤 `cd web && node scripts/capture/opening-qa.mjs ../qa/opening/<폴더>` (83개 항목), `npm test` (306).
- 필름: `node scripts/capture/opening.mjs ../qa/opening/<폴더> <이름> --fixture single:physicalTop --cast`.

## 파운더가 정할 것 (`opening/REPORT.md` 9)
- 확률 구조(지금대로 또는 A 출발점), 디지털 기프트카드의 이름, 자금 출처 0.01 반올림, 녹화용 ffmpeg, 상자 그림 자산, 서버 장부.

## 남은 문제
- 실제 휴대폰과 iOS 사파리, 가로 화면, 큰 글자 확대 미검수. 결과 영역이 넘칠 때 스크롤되지 않는다.
- 소리와 진동은 오류 없이 도는 것까지만 확인. 상자는 CSS 면 여섯 개(재질 한계).
