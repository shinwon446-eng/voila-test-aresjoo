# 개편 전 화면 촬영과 자동 검사

저장소 루트의 `AGENTS.md`, `DESIGN.md`, `REDESIGN_BRIEF.md` 4-6과 `UI_INVENTORY.md`를 기준으로 만든 촬영 도구입니다. 앱 소스와 돈 계산을 변경하지 않습니다.

## 실행

이미 실행 중인 `http://localhost:3002`와 설치된 Chrome을 사용합니다. 서버 시작, 종료, 빌드, 브라우저 다운로드는 하지 않습니다. `web` 폴더에서 실행합니다. 이 저장소의 RTK 규칙에 따라 실제 셸 명령 앞에는 `rtk proxy`를 붙입니다.

```powershell
cd web
rtk proxy node scripts/capture/capture.mjs --plan scripts/capture/plan.before.json --out ../qa/before --locales ko --viewports mobile --only home
```

총괄이 전체 촬영을 실행할 때:

```powershell
rtk proxy node scripts/capture/capture.mjs --plan scripts/capture/plan.before.json --out ../qa/before
```

`--only`는 ID 부분 일치입니다. 쉼표로 여러 ID를 선택할 수 있습니다. `--locales` 기본값은 `ko,en,zh`, `--viewports` 기본값은 `mobile,desktop`입니다. 모바일 메뉴처럼 해당 크기에만 있는 항목은 다른 크기에서 `해당 없음`으로 기록합니다.

| 이름 | 크기 | 배율 | 터치 | PNG 저장 |
|---|---|---|---|---|
| mobile | 390 × 844 | 2 | 켬 | 예 |
| desktop | 1440 × 900 | 1 | 끔 | 예 |
| mobile360 | 360 × 844 | 2 | 켬 | 아니요, 검사만 |

선택한 항목과 언어마다 360px 흐름을 별도 컨텍스트에서 한 번 더 실행합니다. PC만 선택해도 추가합니다. 상태는 항목, 언어, 크기마다 새로 만들며 개인 Chrome 프로필을 사용하지 않습니다.

## 결과

- `<출력 폴더>/<id>-<단계 이름>-<locale>-<viewport>.png`: 현재 보이는 화면입니다. 첫 `shot`은 첫 화면을 담고, 스크롤 뒤 `shot`은 그 위치를 담습니다.
- 긴 문서는 `<id>-<단계 이름>-full-<locale>-<viewport>.png`도 저장합니다. 모달 내부 스크롤은 문서 전체 촬영에 펼쳐지지 않으므로 계획에 `scroll`과 `shot`을 추가합니다.
- `<출력 폴더>/results.json`: 실행 조건, 항목별 상태, 파일 목록, 단계별 검사 수, 가로챈 요청, 실패 단계와 이유입니다. 같은 출력 폴더에서 다시 실행하면 이번 실행 내용으로 바뀝니다.
- 저장소 루트 `qa/auto-report.json`: 기존 배열을 보존하고 이번 검사 결과를 추가합니다. 재실행하면 같은 문제도 누적됩니다. 별도 실행들의 비교에는 서로 다른 출력 폴더를 사용합니다. 두 촬영 프로세스를 동시에 실행하지 않습니다.

검사 결과의 각 행은 `[항목 id, 로케일, 뷰포트, 검사 이름, 요소 선택자, 값]`입니다. `값.step`으로 촬영 단계를, `값.runStartedAt`으로 실행을 연결합니다. 항목 실패도 `capture-failed`로 기록하며 실패 시점 PNG도 가능한 경우 저장합니다. 자동 검사의 지적은 촬영 실패가 아니므로 종료 코드에 영향을 주지 않습니다. 항목 실행 실패가 하나라도 있으면 전체 처리를 마친 뒤 종료 코드 1을 반환합니다. 계획 형식 오류는 브라우저를 띄우기 전에 중단합니다.

`완료`는 계획의 클릭과 촬영을 완료했다는 뜻이며 디자인 통과 판정이 아닙니다. `만들지 못함`은 구현 또는 외부 서비스 제약이고, `실패`는 선택자, 시간 초과 등 실행 문제입니다. 일부 흐름은 가능한 단계까지 찍은 뒤 `만들지 못함`으로 끝납니다.

## 계획 작성

`plan.before.json`은 100개 항목입니다. 로케일별 고정 라우트, 법적 문서 13개, 루트 이동, 404, 두 옛 스킨, 카테고리, 주요 모달, 지갑 세 탭, 로그인과 가입, 일일 상자, 보관함과 배송, 검증, 프로필과 보안, 개봉과 대량 개봉, 후기와 게시판을 포함합니다. 토스트는 홈 일일 지급, 인증 로그아웃, 보관함 판매, 후기 저장, 게시판 저장을 실제 UI 행동으로 띄웁니다.

```json
{
  "version": 1,
  "items": [{
    "id": "sample-detail",
    "path": "",
    "state": "funded",
    "steps": [
      { "action": "click", "target": { "css": ".collection-card", "nth": 0 } },
      { "action": "shot", "name": "detail", "expect": ".detail-title" },
      { "action": "click", "target": { "role": "button", "key": "autoplay.title", "scope": ".detail-links" } },
      { "action": "shot", "name": "autoplay" }
    ]
  }]
}
```

`path`는 로케일 뒤의 경로이며 빈 문자열, `/inventory`, `?skin=commerce`, `#deposit` 형식입니다. `root: true`는 로케일을 붙이지 않고 `/`로 방문합니다. 외부 주소를 받지 않습니다.

지원 단계:

| action | 사용 방법 |
|---|---|
| click | `target` 요소 클릭 |
| fill | 입력은 `value`, select는 `select` 값 지정 |
| wait | `target`과 `state: visible/hidden/attached/detached`, 또는 `ms` |
| scroll | `target`을 화면 안으로 이동, 또는 `x`, `y` 지정. `y: bottom` 가능 |
| press | `key: Escape`, `Tab`, `Enter` 등. `target` 생략 시 키보드에 전달 |
| shot | 유일한 `name`, 선택적 `expect`, `fullPage`, `settleMs` |

`target`은 CSS 문자열 또는 `{css,nth}`, `{role,key,params,scope,nth}`, `{role,name,scope}`입니다. `key`는 실제 `messages/<locale>.json`에서 읽습니다. 동적 버튼 문구는 `params`로 치환합니다. `contains: true`는 부분 일치입니다. `name`에 `{ko,en,zh}` 사전도 사용할 수 있습니다. 하드코딩 한국어 게시판 문구는 앱 그대로 사용합니다.

기본은 `prefers-reduced-motion: reduce`입니다. 연출 항목에만 `motion: allow`를 넣으면 설정과 PNG 촬영에서 움직임을 허용합니다. `opening-motion`이 예시입니다. 단계별 `viewports: [mobile]`로 모바일 메뉴 클릭만 분기할 수 있습니다.

## 프리셋과 요청 처리

`states.mjs`는 `web/lib/labSite.ts`에서 접두사를 읽고, 새 브라우저의 저장소를 페이지 스크립트보다 먼저 채웁니다. 셰임이 이미 적용된 경우에도 접두사를 두 번 붙이지 않습니다. 페이지 이동 때는 초기화하지 않아 로그인과 개봉 결과가 유지됩니다.

| 프리셋 | 상태 |
|---|---|
| guest | 비로그인, 잔액 0 |
| firstVisit | 계정 없는 첫 방문. UI 로그인 후 앱 자체 보너스 사용 |
| zero | 로그인, 잔액 0 |
| insufficient | 로그인, 잔액 0.25 USDT |
| funded | 로그인, 잔액 10,000 USDT |
| inventory | 로그인, 실물 상품 2개 보관 |
| shipping | 배송 요청 1개와 운송 중 1개 |
| pending | 출금 대기 1개와 72시간 보류 1개 |
| security | 테스트용 2단계 인증 등록 |
| dailyUsed | 일일 상자 사용 완료 |

계약 근거는 `authStore.ts`, `walletStore.ts`, `inventoryStore.ts`, `dailyStore.ts`, 나머지 persist 스토어, `browserAccount.ts`, `browserWallet.ts`입니다. 인증 스토어는 저장된 `user`를 무시하므로 `voila.browser-accounts.v1`과 `voila.browser-session.v1`을 심습니다. 자산은 계정별 `voila.browser-wallet.<id>`와 `voila.browser-inventory.<id>`를 함께 채웁니다. 지갑은 persist 버전 4입니다. 잔액 프리셋에는 첫 로그인 보너스 수령 거래가 있어 보너스가 잔액을 덮지 않습니다.

촬영 계정, 비밀번호, 수령 정보, 인증 코드, 운송장 표시는 모두 도구가 만든 자료입니다. 보관함 프리셋의 공정성 자료는 옛 기록 형식으로 부분 검증이나 불일치가 나올 수 있습니다. `opening-verify`는 앱 자체 추첨으로 생성한 기록을 검증합니다. 추첨 계산과 확률을 덮어쓰지 않아 개봉 상품은 실행마다 달라질 수 있습니다.

`page.route`와 보조 `context.route`는 로컬 문서와 정적 자원만 통과시킵니다. 인증 세션, 보안 상태, 출금 상태, 빈 공개 피드는 가짜 JSON을 반환합니다. 지원하지 않는 API와 외부 요청은 503 가짜 응답을 반환하고 `results.json`에 남깁니다. 팝업 첫 요청, 서비스 워커, WebSocket 우회도 차단합니다. 외부 DiceBear 아바타 등은 실패 대체 화면으로 보이며, 이로 인한 콘솔 오류도 숨기지 않습니다.

브라우저 계정 모드의 로컬 함수는 네트워크 가로채기를 거치지 않습니다. 이 경우 새 컨텍스트의 저장 자료와 기존 앱 코드로만 진행합니다. 원격 모드에서 아직 구현하지 않은 응답 계약은 차단되고 해당 단계가 실패합니다. 원격 전용 기능을 임의 성공 처리하지 않습니다.

## 핵심 흐름과 만들지 못한 상태

- `flow-first-opening`: 첫 방문, 상세의 부족 안내, 충전 창, 헤더 로그인, 첫 로그인 보너스, 구매 확인, 개봉 결과. 현행 충전 창이 중첩 인증 창을 가릴 수 있어 충전 창을 닫고 헤더에서 로그인합니다. 실입금을 재현한 흐름이 아닙니다.
- `flow-returning-opening`: 충분한 잔액, 상세, 구매 확인, 결과, 다시 열기, 두 번째 결과.
- `flow-claim-usdt`: 보관 상품, 판매 확인, 잔액 반영 토스트, 완료 기록.
- `flow-claim-shipping`: 보관 상품, 배송 양식, 수령 정보, 제출, 오류. 브라우저 어댑터에 `/shipping/request`가 없어 완료는 만들지 못합니다. `shipping-tracking`과 `shipping-in-transit`은 저장 상태로 만든 추적 화면입니다.

그 밖의 재현 한계:

1. 실입금, 실제 온체인 출금, 외부 OAuth, 메일 수신함, 실제 운송장 발급은 실행하지 않습니다.
2. 브라우저 모드 입금 주소와 입금 확인은 환경 설정에 의존합니다. `.env`를 읽지 않으므로 입금 완료를 만들지 못합니다.
3. 개봉 결과 배송 창은 `requestEnabled=false`여서 제출할 수 없습니다.
4. 전수 목록 14장의 미연결 컴포넌트, 승급 반전, 니어미스, 데모 개봉, 호출되지 않는 AML 토스트는 현재 진입점이 없습니다.
5. 전용 오프라인, 세션 만료, 전역 오류 화면은 현재 구현이 없습니다. 404는 프레임워크 기본 화면을 촬영합니다.
6. OS 파일 선택창, 브라우저 탭, 네이티브 select 팝업과 자동완성 UI는 headless 페이지 촬영으로 보장하지 못합니다.
7. 전수 목록의 모든 오류 코드, 비동기 중간 프레임, 글 내용 조합 517개를 개별 시나리오로 검증한 계획은 아닙니다. 명시한 100개 항목 밖 세부 상태는 총괄이 필요에 따라 계획에 추가해야 합니다.

## 자동 검사 해석

가로 넘침, 글 요소의 `scrollWidth/clientWidth`와 세로 잘림, 조작 요소끼리 겹침, 모바일 44px 미만 터치 영역, 대비 4.5:1 미만, 콘솔 오류와 실행 예외를 기록합니다. 숨긴 요소, 모달 뒤 배경, 조작 요소의 부모 자식 쌍과 같은 label 안의 요소는 제외합니다. radio와 checkbox는 연결된 label까지 터치 영역으로 계산합니다.

대비는 현재 화면의 글자를 잠시 투명하게 한 PNG에서 실제 배경 픽셀을 읽고 글자색과 알파를 합성하여 계산합니다. 배경 이미지와 그라데이션을 포함하고 글자 사각형마다 세 지점을 표본으로 씁니다. 이 임시 스타일은 Playwright가 촬영 뒤 복원하며 저장 PNG에 적용되지 않습니다. 특수 혼합 모드와 필터는 `contrast-unmeasured`로 남깁니다. 아래쪽 글은 해당 위치의 `scroll`과 `shot`에서 검사합니다. 표본 사이의 미세한 무늬, 그룹 불투명도, 움직이는 배경은 오차가 있을 수 있어 눈 검수가 필요합니다.

말줄임 의도, 작은 글자의 글꼴 메트릭, 고정 헤더가 덮는 조작 요소 등은 자동 지적 후 눈으로 판단합니다. 검사 지적 수 0을 접근성 전체 통과로 해석하지 않습니다.

## 확인 범위

확인일: 2026-10-10. 세 `.mjs`의 `node --check`가 통과했습니다. 별도 메모리 테스트 화면으로 여섯 검사 유형, 흑백 대비 21:1, 잔액 0 프리셋, 출금 POST가 503 가짜 응답으로 차단되는 것도 확인했습니다.

| 부분 실행 | 결과 |
|---|---|
| `--out ../qa/before --only home` | 한국어 모바일 PNG 4개, 390px와 360px 검사 완료 |
| `--out ../qa/before/flow-verified --only flow-first-opening,flow-returning-opening,flow-claim-usdt,flow-claim-shipping` | PNG 44개. 처음 개봉, 다시 열기, USDT 받기 완료. 배송은 입력과 제출 오류까지 촬영 후 만들지 못함으로 기록 |
| 출금, 일일 상자, 자동 열기, 대량 개봉, 게시판, 로그아웃 부분 확인 | 각각 390px와 360px에서 완료 |
| `--out ../qa/before/final-smoke --only home,review-write` | PNG 10개, 검사 기록 55개, 네 항목 실행 모두 완료, 종료 코드 0 |

위 명령은 공통으로 `--plan scripts/capture/plan.before.json --locales ko --viewports mobile`을 사용했습니다. 수정 중의 실패 기록은 `flow-smoke`, `overlay-smoke`와 누적 `qa/auto-report.json`에 그대로 남아 있습니다. 개봉 결과 버튼의 추가 금액 문구, 여러 상품 선택자, 후기 별점 선택을 수정한 뒤 해당 항목을 다시 확인했습니다. 최신 결과는 `flow-verified`와 `final-smoke`의 `results.json`을 기준으로 봅니다. 계획 전체, PC 전체, 영어와 중국어 전체 실행은 하지 않았습니다. 세 언어의 계획 내 문구 키 누락은 0개입니다.
