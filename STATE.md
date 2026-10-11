# VOILA 24시간 자율 개선 랩, 상태 (이 파일만 읽으면 이어서 할 수 있다)

- 시작: 2026-10-11 02:34 (로컬) / 종료 예정: 2026-10-12 02:34
- 브랜치: `voila-redesign` (커밋은 여기에만). 테스트 사이트 배포는 `main` 푸시(파운더가 허락한 범위: 사진과 화면. 운영 저장소 gacha-sim 은 손대지 않는다)
- 마지막 정상 지점: `dd9a760` (테스트 296 통과, design-lint 0, tsc 통과, build 128 페이지, main 배포 성공 런 38104374242)
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
- 사이클 1 (02:34~02:58) 끝: `/verify` 신설, Codex 감사 54/100 반영 6건 + 상품 시트 정가 기준과 배송비. 커밋 `a3e5b9e`, `bff74fc`. 기록은 IMPROVEMENT_LOOP.md
- 사이클 2 (03:05~03:50) 끝: 7개 박스에 스튜디오 사진, 커버 전부 대표 실물, 첫 화면 EXPERIMENT → 합성안. 커밋 `866127f`, `3c16e60`. 생활가전은 Commons 에 사진 없음
- 사이클 3 (03:41~04:25) 끝: 세 언어와 360/430/768 폭 검수, 줄바꿈 셋 고침. 커밋 `08ae4b0`. Codex 2차 감사 `qa/codex/audit-c3.md` 진행 중(끝나면 1차 54점과 비교해 STATE 점수표 갱신)
- 사이클 4 (04:25~05:10) 끝: 세션 만료 한 줄, 약관 새 디자인, 출금 관문 시트, Codex 2차 감사 64점 반영. 커밋 `69a6b5c`, `c189d79`
- 사이클 5 (04:13~04:45) 끝: 인증 앱 부품 새 디자인, 보관함 행, 배송 나라 수, Codex QA 2차(A~G 통과, 실패 1 → 검증 값 전달 고침). main 배포. 함정: useSearchParams 는 Suspense 로 감싸야 정적 빌드가 된다
- 사이클 6 (04:53~05:35) 끝: 계정 관리 시트 셋, Codex 3차 감사 73점 반영. 커밋 `f6ea85a`, `543804b` (main 미배포)
- 사이클 7 (05:20~06:05) 끝: 사진 둘 재변환, 카드 세 덩이, Codex QA 3차(2차 실패 전부 해소) → 탈퇴 문구. main 배포
- 사이클 8 (~05:55) 끝: 옛 주소 안내 화면, 320 폭, Codex 4차 75점, 사진 불일치 17장 제거(studio.json 162 = sources 162), studio.mjs 끝에 출처 없는 판 삭제 가드. 커밋 `aa1d42f`, `6bfb3d5`. main 미배포(사이클 9 에서)
- 사이클 9 (06:17~06:50) 끝: 검증 링크, "참고가 기준", 기준일 2026년 10월, 이름과 다른 사진 24건 제거(스튜디오 7 + Unsplash 매핑 16 + 생활가전 커버), Commons 우선. 커밋 `440c242`. main 배포 성공(런 38091284481, 공개 주소 /ko/box/dollar-apple 에서 "참고가 기준"과 검증 링크 확인). 기록 커밋 `fec9510`
- 사이클 10 끝: Codex 5차 78점(`qa/codex/audit-c10.md`) 반영(보관함 빈 칸과 보조 줄, 검증 행 단서, 사진 3장 제거), 슈퍼카 사진 8장 확보. 커밋 `766c8b7`, `cee76c8`. main 배포는 기록 뒤 바로
- 파운더 지시(2026-10-11 오전, 사이클 11 의 첫 일): "가방과 골드 사진은 코덱스한테 똑같은 톤으로 만들라 해줘". 결정 대기 항목 해소. 진행: 지시서 `qa/codex/gen-images-prompt.md`, 목록 `web/scripts/images/gen-list.mjs bg-,gd- --skip-done`, 원본은 `web/scripts/images/gen-raw/<id>.png`(gitignore), 등록 `gen-register.mjs`, 변환 `studio.mjs --only <ids>`, 검수 `sheet.mjs`. 끝: 87장 전부(가방 48, 골드 39) 생성, 전수 검수 탈락 0(시트 `qa/cycles/c11/gen-*.png`), 커밋 `6032a77`, `1b2166b`, main 배포 성공(런 38102680863, 공개 주소 가방 박스에 사진 50장 확인). 떨어뜨릴 때는 `gen-register.mjs --drop <id>`
- 파운더 지시 2(같은 날): "같은 방식을 포켓몬 카드, 생활가전, 사진 없는 차량으로 넓히셈". 대상 129(pkm 67, hm 18, car 22, sc 22). 범주 규칙 `qa/codex/gen-rules-{car,hm,pkm}.md`, 입력은 `sh web/scripts/images/gen-input.sh <규칙> <목록> <출력>`. 진행: car, sc, hm 는 전체 생성 중(출력 `qa/codex/gen-out-{car,sc,hm}.md`), pkm 은 중단: 4장 시험(`gen-out-pkm-pilot.md`)에서 이미지 도구가 3장을 거절, 만들어진 1장은 실제 카드를 그대로 흉내 내고 실제 일러스트레이터 이름까지 넣어 폐기(원본 삭제, 미등록). 표현을 바꿔 다시 시도하지 않는다. 포켓몬 박스는 이름 행 그대로 두고 파운더에게 보고(대안: 실물 재고 사진을 직접 찍어 받기). car, sc, hm 은 끝(62장, 전수 검수 탈락 0, 커밋 `dd9a760`, main 배포 성공, 공개 주소에서 생활가전 18, 자동차 52, 슈퍼카 51장 확인). 이미 한 절차: gen-register → studio → 시트 전수 검수 → COVER_BY_ITEM 에 vault-home 커버 추가(vault-pokemon 은 기존 Unsplash 커버 유지), tests/products.test.ts 의 NO_COVER_YET 예외 제거 → 테스트 → 커밋 → main 배포. 그 밖의 박스(애플, 게이밍, 오디오, 맥, 카메라, 시계, 콘솔의 사진 없는 상품 약 125개)는 지시 범위 밖
- 사이클 11 (다음 깨어남): (a) main 배포는 성공 확인됨, 건너뛴다 (b) EXPERIMENT 홈 카드 비교 정보 묶음: 현재(A) 대 "가격, 흔한 결과, 실물 확률 한 줄을 이름 바로 아래"(B) 를 390 폭 스크린샷으로 만들어 Codex 에 점수 없이 판정 요청(experiment-prompt.md 재사용) (c) 값 큰 사진 없는 상품(롤스로이스 팬텀, 포르쉐 911 터보 S, GT3, 골드바 1kg, 토요타 수프라)은 `commons.mjs search --only` 를 모델명 검색어로 다시 돌려 후보 갱신 뒤 시트 검수 (d) 결과 화면 실물 결과와 en, zh 재검수 (e) 가방과 골드 사진은 해소됨(위 파운더 지시) (f) Codex 6차 감사는 홈, 가방 박스, 골드 박스, 생성 이미지 상품 시트를 넣어 다시(5차의 사진 정확성 P1 이 풀렸는지)
- (옛 계획) 사이클 10: (a) Codex 5차 감사: 새 스크린샷(home-full, box, item, verify, account, inventory, reveal 390 폭), 이전 프롬프트 `qa/codex/audit-prompt*.md` 재사용, 결과 `qa/codex/audit-c10.md`, 점수표 갱신 (c) 사진 빠진 상품 가운데 값 큰 것부터 `reject.mjs --next` 로 다음 후보 재탐색 후 시트로 검수 (d) 가방과 골드 사진은 파운더 결정 대기(묻지 않는다)
- (옛 계획) 사이클 8: (a) Codex 감사 4차(새 스크린샷 8장, 점수 추이 54→64→73→?) (b) /community 와 /about 처리: 메뉴에 없고 옛 디자인이라 접근 경로를 끊거나 새 디자인. 먼저 어디서 링크되는지 grep (c) 여럿 결과의 상품 시트 사진 확인 (d) 320 폭 재검수(홈, 박스, 계정, 보관함)
- (옛 계획) 사이클 7: (a) VR2 사진 다음 후보, 컬리넌 배경 잔여 손질(studio 재변환 또는 다른 후보) (b) 홈 카드 정보 간격(이름과 가격 / 대표 상품 / 확률 요약을 세 덩이로) (c) Codex 시나리오 QA 3차(계정 시트 셋, 배송 나라 보기, 검증 값 전달 포함) (d) 반영 뒤 main 배포
- (옛 계획) 사이클 5: (a) TwoFactorSetup 을 새 디자인으로(금색 테두리와 아이콘 제거, 행과 입력칸만) (b) 보관함 행 끝 화살표, 상품 시트에 배송 가능 나라 수 (c) 스위치 2 사진을 다음 후보로 (d) Codex 시나리오 QA 2차(A~G 재실행, scenario-prompt.md 재사용) (e) 그 결과 반영 뒤 main 배포
- (옛 계획) 사이클 4: (a) Codex 2차 감사 반영 (b) 오프라인과 세션 만료 상태(지금 세션 만료 안내 없음) (c) 옛 화면 잔여: /profile 의 닉네임, 비밀번호, 탈퇴를 새 계정 화면 시트로 옮기거나 링크 유지 결정, /legal 과 /community 는 새 디자인 또는 메뉴에서 제외
- (옛 계획) 사이클 3: (a) 세 언어 촬영(en, zh 로 home, box, item, account, verify)과 긴 문자열 깨짐 수정 (b) 360, 430, 768 폭 촬영(quick.mjs ALL_VIEWS 에 추가) (c) 결과 화면 단일 결과의 사진이 스튜디오 판인지와 크기 (d) Codex 독립 감사 2차(사이클 1 과 같은 프롬프트, 새 스크린샷) 뒤 점수 비교
- (옛 계획) 사이클 2: (a) Commons 검색(프로세스 68640, 01:57 시작, candidates.json 은 끝나야 써짐) 결과로 남은 8개 박스 사진: `node scripts/images/pick-first.mjs` → `commons.mjs fetch` → `sheet.mjs` 로 보고 `reject.mjs` → `studio.mjs` → 테스트 → 커밋 (b) 생활가전 커버를 상품 사진으로 (c) EXPERIMENT: 박스 첫 화면 B안(비용과 결과 묶음을 사진 띠 위에) 실제로 만들어 A안과 스크린샷 비교, Codex 에 둘을 점수 없이 보여 고르게 함
- 사이클 3 후보: 360, 430, 768 폭 촬영 검수 / 세 언어 촬영 검수 / 오프라인과 세션 만료 / 옛 화면 잔여(/profile 닉네임과 비밀번호, /legal, /community) 새 디자인 또는 링크 제거 / 결과 화면 사진 크기
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
| 합계 | 100 | 62 → 70 → 76 → 78 → 78 → 80 → 사이클 10 뒤 Claude 자체 81 (Codex 54 → 64 → 73 → 75 → 78) | 목표 88. 남은 큰 격차: 후기 데이터 없음(구조만), 배송과 충전은 환경 제한, 옛 디자인 잔여(TwoFactorSetup, /profile) |
