AGENTS.md, DESIGN.md, flow/RESTORE_SPEC.md 를 읽어라. 이번 일은 배포 직전의 적대 검수다. 파일을 고치지 않는다. git 으로 바꾸는 명령도 쓰지 않는다. `next build` 를 돌리지 않는다. 결과는 flow/REVIEW_codex-restore.md 한 파일에만 쓴다. 임시 스크립트는 저장소 밖 임시 폴더에.

대상: 이 작업 폴더(브랜치 feat/restore)의 `4c8942f..HEAD`. 4c8942f 가 지금 배포본이다. 들어간 것: (1) 전체 박스의 순서(`web/lib/boxOrder.ts`, `BoxList.tsx`, `products.ts` 의 `FACE_PICK`), (2) 업그레이드(`web/lib/upgrade*.ts`, `fairStore.ts`, `opening.ts`, `takeBatch.ts`, `claim.ts`, `components/flow/UpgradeSheet.tsx`, 결과와 보관함 화면), (3) 브라우저 저장 줄이기(`web/lib/compactStorage.ts`, 두 스토어의 storage 옵션, `browserWallet.ts`, `browserAccount.ts`, `ledgerLock.ts`), (4) 후기 자리를 원래 가로 카드 줄로 되돌림과 같은 상품이 몰리지 않게 자리 바꾸기(`BoxReviews.tsx`, `ReviewsScreen.tsx`, `reviewSamples.ts`, `ui.css`, `reviews.css`), (5) 기준값 검사의 사진 부분 분리. 개발 서버 http://localhost:3003 이 이 소스로 떠 있다(web/node_modules 의 Playwright 를 쓸 수 있다. 전부 브라우저 안의 시험 장부다).

가장 중요한 순서로.

1. 돈과 장부. 원본 소스(`git archive 4c8942f` 로 임시 폴더에)와 결과 소스의 함수를 나란히 불러 같은 입력으로 견줘라: 박스 열기(한 개, 여러 개, 무료, 섞인 잔액), 받기와 묶음 받기, 충전, 출금 신청과 취소와 실패와 동기화, 배송 환불. 입력 수천 건에서 한 건이라도 잔액, 거래, 보관함 상태, 회차가 갈리면 적어라. 업그레이드는 새것이라 원본과 견줄 수 없으니, 성공 확률 식(0.9 × 건 상품가 ÷ 목표 상품가, 내림), 성공과 실패 뒤의 장부(잔액 불변, 건 상품의 상태, 목표의 추가), 같은 추첨의 중복 적용, 회차가 줄거나 되돌아가지 않는 것, 예약이 저장되지 않으면 추첨을 적용하지 않는 것, 업그레이드와 받기를 섞어 기대값이 1 을 넘는 길이 있는지를 직접 실행으로 깨뜨려 보라.
2. 저장. 원본 형식의 장부(여러 계정, 받기 표시가 남은 것, 업그레이드 기록, 차감하지 않은 출금 줄, 깨진 줄)를 결과가 읽고 줄여 쓸 때와, 결과가 쓴 줄인 장부를 다시 읽을 때 값이 전부 같은지(금액 합, 상태, 번호, 자금 출처, 회차, 확률표의 순서). 두 탭이 겹칠 때. 저장 한도에서 실제로 몇 번까지 열리는지(헤드리스 Chrome 으로 직접). 옛 기록의 검증(verify)이 당시 표로 되는지.
3. 화면 회귀. 후기 자리의 가로 카드 줄이 원본(4c8942f 이전의 63445c7 빌드, `C:/Users/hyun1/dev/VOILA-audit-before/web/out` 을 `node C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/harness/serve.mjs <그 폴더> 4198` 로 띄워)과 같은 크기, 여백, 흐림, 단추인지. 업그레이드가 들어간 결과 화면과 보관함에서 주 단추가 하나뿐인지, 밑줄 링크가 둘을 넘지 않는지(DESIGN.md). 전체 박스의 첫 화면 순서. 세 언어에서 문구가 빠지거나 넘치는 곳.
4. `git diff 4c8942f..HEAD --stat` 의 모든 파일이 위 다섯 묶음에 속하는지. 지운 것, 의존성, 확률과 카탈로그 변경이 없는지(`web/tests/parityGolden.test.ts` 통과와 별개로 직접 계산).
5. `npx tsc --noEmit -p .`, `npm test`, `npm run lint:design` 의 수.

발견을 P0 에서 P3 로. 배포를 막아야 할 것과 고치면 좋은 것을 나눠라. 마지막 줄에 P0 와 P1 의 수를 분명히. 글 규칙: 한국어. 긴 줄표, 가운뎃점 문자, 느낌표를 쓰지 마라. 코드에서 읽은 것, 직접 실행한 것, 짐작을 구분하라.
