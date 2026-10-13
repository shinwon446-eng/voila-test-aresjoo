migration-audit/BRIEF.md 를 먼저 읽고, 그다음 AGENTS.md 와 migration-audit/MISSION.md 의 2절(Codex 의 역할), 3절, 6절을 읽어라.

너는 이 감사의 "소스 코드와 기능 동등성 책임자"다. 이번 실행은 Phase 1 독립 분석의 전반부다. 소스를 고치지 않는다. git 으로 바꾸는 명령도 쓰지 않는다. `next build` 를 돌리지 않는다. 결과는 migration-audit/analysis/codex-a-routes-events-state.md 한 파일에만 쓴다. 다른 참여자(Claude, Antigravity)의 분석 파일이 migration-audit/analysis 에 보여도 읽지 마라(독립 조사다).

조사 범위: web/app, web/components, web/lib, web/stores, web/i18n, web/messages, web/server, web/src. 기준은 지금 체크아웃된 커밋(63445c7)이다.

적을 것

1. 라우트와 호출 관계. web/app 아래의 라우트 18개마다: 페이지 파일, 그 페이지가 그리는 최상위 컴포넌트, 그 아래의 주요 컴포넌트 나무(두세 단계), 쓰는 스토어, generateStaticParams 가 만드는 경로의 수, 정적 내보내기에서 직접 주소로 들어갔을 때의 동작(없는 slug, 없는 doc, 없는 언어). 루트의 app/page.tsx 와 app/layout.tsx 가 하는 일(언어 고르기, 저장소 감싸기 스크립트).

2. 실제로 쓰이는 코드와 쓰이지 않는 코드. 어느 라우트에서도 닿지 않는 컴포넌트와 모듈을 import 그래프로 찾아 목록으로(파일, 근거). 옛 홈(NetflixHome, CommerceHome, HallOfFame, ProofFeed, LiveTicker, unboxing/UnboxingRoulette 등)이 지금 어디서 그려지는지 아닌지를 분명히. "소스에는 있지만 지금 흐름에서 닿지 않는 UI"를 따로 표로.

3. 이벤트 핸들러 전수. 컴포넌트마다 onClick, onChange, onSubmit, onKeyDown, 포인터와 터치, window 와 document 리스너, 타이머, IntersectionObserver 등을 찾아: 무엇이 일으키는가, 무슨 함수를 부르는가, 어떤 상태와 저장값이 바뀌는가, 정리(cleanup)가 있는가. 양이 많으니 화면 단위로 묶은 표로 적고, 정리가 빠졌거나 조건부로만 정리되는 것을 따로 짚어라.

4. 상태 관리. zustand 스토어마다: 저장 키(랩 접두어 포함), partialize, 버전과 migrate, 액션 목록, 누가 읽고 쓰는가. 스토어 밖에서 localStorage 나 sessionStorage 를 직접 읽고 쓰는 곳 전부. 계정이 바뀔 때 스토어가 어떻게 갈아 끼워지는가(web/lib/browserAccount.ts, browserWallet.ts, account.ts).

5. 상태 전이. 다음 흐름마다 "처음 상태, 사건과 입력, 전제조건, 상태 변화, 자료 변화, 화면 변화, 오류와 취소, 새로고침 뒤" 를 사례별로: 가입과 로그인과 로그아웃, 충전, 박스 열기(한 개, 여러 개, 무료 열기, 잔액 부족, 로그인 전), 결과에서 USDT 로 받기와 보관, 묶음 받기, 보관함의 받기와 배송 신청, 출금, 후기 쓰기, 검증, 언어와 통화 바꾸기. 단추 하나에 결과가 여럿이면 사례를 나눠라.

6. 직접 DOM 을 만지는 열 파일(BRIEF 0절의 목록)마다: 무엇을 왜 만지는가, React 의 상태나 생명주기와 부딪칠 수 있는가(이중 실행, StrictMode, 언마운트 뒤 실행), 고쳐야 하는가 그대로 둬야 하는가. 근거와 함께.

7. React 품질 문제 가운데 동작에 영향을 주는 것만: 조건부 훅, 불안정한 key, 빠진 의존성으로 생기는 낡은 값, 언마운트 뒤 setState, 수화(hydration) 불일치가 나는 자리, any 남용이 계산을 가리는 자리. 취향의 문제는 적지 마라.

8. 기존 테스트의 지도. web/tests 의 테스트 파일마다 무엇을 지키는가 한 줄, 그리고 위 5번의 흐름 가운데 테스트가 없는 것.

형식: 항목마다 파일과 줄 번호를 붙여라. "코드에서 읽은 것", "직접 실행한 것(명령과 결과)", "짐작"을 구분하라. 번호는 BRIEF 3절의 형식을 쓰되 네 파일 안에서는 접두어 CX- 를 붙여라(예: CX-R-001). 마지막에 "총괄이 꼭 알아야 할 것 열 가지"를 심각한 순서로 적어라.

글 규칙: 한국어. 긴 줄표, 가운뎃점 문자, 느낌표를 쓰지 마라.
