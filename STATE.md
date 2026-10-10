# VOILA 24시간 자율 개선 랩, 상태 (이 파일만 읽으면 이어서 할 수 있다)

- 시작: 2026-10-11 02:34 (로컬) / 종료 예정: 2026-10-12 02:34
- 브랜치: `voila-redesign` (커밋은 여기에만). 테스트 사이트 배포는 `main` 푸시(파운더가 허락한 범위: 사진과 화면. 운영 저장소 gacha-sim 은 손대지 않는다)
- 마지막 정상 지점: `5eaa5fc` (테스트 296 통과, design-lint 0, build 통과, main 배포 성공)
- 개발 서버: `.claude/launch.json` 의 `voila-test-aresjoo`(3002). `next build` 뒤에는 `.next` 를 지우고 다시 띄운다(OneDrive 에서 readlink EINVAL)
- 정본: DESIGN.md(규칙), JOURNEY.md(여정), qa/PROGRESS.md(진행), IMPROVEMENT_LOOP.md(사이클 기록), DECISION_LOG.md(Claude 와 Codex 충돌과 결정)

## 실행 환경 확인 (2026-10-11 02:34)
| 항목 | 확인 결과 |
|---|---|
| Codex 호출 | `rtk codex --dangerously-bypass-approvals-and-sandbox exec -m gpt-6-astra -c model_reasoning_effort=high --skip-git-repo-check --ephemeral -i <png> -o <out> -` 로 됨. 읽기 전용 검수는 `-s read-only`. 한 번에 10~25분 |
| 브라우저 자동화 | Playwright 1.49 + 설치된 Chrome(channel "chrome"). `web/scripts/capture/quick.mjs`(390, 320, 1440), `flow-review.mjs`, Codex 가 쓴 `qa/codex/scenario.mjs`. Bash 에서는 `MSYS_NO_PATHCONV=1` 필요 |
| 개발 서버 유지 | preview_start 로 유지. 빌드와 동시에는 못 쓴다 |
| 장시간 실행 | 모델 한 턴이 24시간을 돌지 않는다. ScheduleWakeup 으로 사이클마다 깨어나 이 파일을 읽고 이어간다. 세션이 끊기면 이 파일과 git 으로 복구한다. 컨텍스트는 자동 요약되므로 결정은 전부 파일에 적는다 |
| 제한 | 실제 돈 없음(브라우저 안 시험 장부). 충전 주소와 배송 접수는 백엔드가 없어 막힘(시험 환경 제한). 운영 데이터, 비밀키, 운영 저장소는 손대지 않는다 |

## 지금 사이클
- 사이클 1 (02:34~): Codex 독립 적대적 감사(현재 화면 8장, 점수 없이) + 남은 박스 상품 사진(Commons 검색 끝나면 picks → fetch → 검수 → studio) + 옛 디자인이 남은 `/fairness`(검증) 화면을 새로 만들 준비
- 다음 후보(우선순위 = 영향 × 심각도 × 범위 × 가능성): P1 사진 없는 박스 8개(갤럭시, 게이밍, 콘솔, 오디오, 맥, 카메라, 생활가전, 슈퍼카) / P1 수동 검증 화면 옛 디자인 / P1 약관, 옛 /profile 잔여 / P2 360, 430, 768 폭 검수 / P2 세 언어 검수 / P2 결과 화면 사진 크기

## 점수 (100점, Claude 자체, Codex 는 사이클마다 따로)
| 영역 | 가중치 | 사이클 0 (02:34) | 근거 |
|---|---|---|---|
| 서비스 이해와 첫인상 | 10 | 7 | 홈 첫 줄에 방식, 가격, 흔한 결과. 검색과 분류가 카드보다 먼저 |
| 상품 발견과 이미지 | 20 | 11 | 5개 박스는 스튜디오 톤 사진, 8개 박스는 사진 없음 |
| 박스 상세와 확률 이해 | 15 | 11 | 구간 4행, 타일마다 확률, 상품 시트. 긴 목록 |
| 후기와 신뢰 | 20 | 8 | 후기 구조와 검증 시트는 있으나 데이터 없음, 수동 검증 옛 화면 |
| 여정과 구매 플로우 | 15 | 12 | A, B, C, C2, D, G 통과. 충전, 배송은 환경 제한 |
| 모바일 시각과 인터랙션 | 10 | 7 | 390, 320 통과. 360, 430, 768 미검수 |
| 개봉 이후, 다국어, 예외 | 10 | 6 | 세 언어 미검수, 오프라인과 세션 만료 미검수 |
| 합계 | 100 | 62 | 목표 88 |
