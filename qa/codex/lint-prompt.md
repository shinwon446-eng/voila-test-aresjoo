AGENTS.md와 DESIGN.md를 먼저 읽어라. 그다음 REDESIGN_BRIEF.md의 4-4를 읽어라. 한국어로만 답한다. 커밋하지 않는다. 아래에 적은 파일만 만들고, 앱 소스(web/app, web/components, web/lib, web/stores, web/messages)는 고치지 않는다.

# 일: 디자인 규칙 검사 도구 만들기
web/scripts/design-lint/ 아래에 만든다. 의존성을 새로 설치하지 않는다(Node 내장 모듈만).

## 만들 파일
1. web/scripts/design-lint/lint.mjs
   - 실행: node scripts/design-lint/lint.mjs [--scope new|all] [--json <결과 파일>]
   - 위반이 하나라도 있으면 종료 코드 1, 없으면 0. 위반마다 [파일:줄 / 규칙 이름 / 그 줄의 일부 / 고칠 방법]을 출력한다. 끝에 규칙별 건수와 합계.
2. web/scripts/design-lint/config.json
   - scope "new" 의 대상 목록(전면 개편에서 새로 만든 파일): app/tokens.css(색 정의 파일이라 색 규칙만 면제), app/ui.css, components/ui/kit.tsx, components/ui/Sheet.tsx, components/ui/toast.tsx, components/shell/**, components/flow/**, components/box/BoxList.tsx, components/box/BoxScreen.tsx, components/box/Reveal.tsx, app/[locale]/page.tsx, app/[locale]/box/**, messages/v.ko.json, messages/v.en.json, messages/v.zh.json. 목록은 글롭으로 적고 총괄이 화면을 옮길 때마다 늘린다.
   - scope "all" 은 web/app, web/components, web/messages 전체.
   - 예외 목록(파일 또는 파일과 규칙의 짝, 이유 한 줄씩): 로고 워드마크(components/layout/BrandLogo.tsx 의 굵기와 색), 로그인 공급자 표식(components/flow/ProviderMark.tsx 의 색), 슬로건 원문, FAQ 의 질문 제목(문구 파일에서 faq 가 들어간 키), 테스트 사이트 표식(components/layout/LabBadge.tsx).
3. web/scripts/design-lint/README.md: 규칙 표와 쓰는 법.

## 규칙 (하나라도 있으면 실패)
CSS 와 TSX(인라인 style, className 문자열 포함):
- color-outside-tokens: 토큰 파일 밖의 색 값(#rgb, #rrggbb, #rrggbbaa, rgb(), rgba(), hsl(), 색 이름 white/black 등 단, transparent, currentColor, inherit 는 허용). SVG 의 fill="currentColor" 와 none 은 허용.
- weight-over-400: font-weight 가 400 을 넘는 선언. 예외는 클래스 .v-card-title 하나(600). Tailwind 의 font-medium, font-semibold, font-bold, font-extrabold, font-black 도 같은 규칙.
- uppercase: text-transform: uppercase 와 Tailwind uppercase.
- letter-spacing-positive: 양수 letter-spacing 과 Tailwind tracking-wide, tracking-wider, tracking-widest, tracking-[양수].
- shadow: box-shadow, text-shadow, filter: drop-shadow, Tailwind shadow-*, drop-shadow-* (shadow-none 은 허용).
- gradient: linear-gradient, radial-gradient, conic-gradient, background-clip: text, Tailwind bg-gradient-*, from-*, via-*, to-* (색 그라데이션 유틸리티), bg-clip-text.
- native-dialog: alert(, confirm(, prompt( 호출(window. 접두 포함). 지역 함수 이름이 confirm 인 경우처럼 브라우저 호출이 아닌 것은 잘못 잡지 않게 한다.
문구 파일(messages/*.json 의 문자열 값):
- copy-emdash: 긴 줄표(—, –)
- copy-middledot: 가운뎃점(·, ・, ‧, •)
- copy-exclamation: 느낌표(!, ！)
- copy-question: 질문 문장(?, ？ 로 끝나거나 포함). FAQ 예외는 config 로.
- copy-apology: 사과 표현(죄송, 미안, 불편을 드려, sorry, apologize, 抱歉, 对不起 등)

## 확인
- `cd web && node scripts/design-lint/lint.mjs --scope new` 와 `--scope all` 을 각각 돌려 본다. 지금은 위반이 나오는 것이 정상이다(고치는 것은 총괄의 일).
- 규칙마다 잘못 잡은 것(오탐)이 없는지 결과에서 표본 5개씩 직접 열어 확인하고, 오탐을 줄인다.
- 마지막 메시지에: 만든 파일, 두 범위의 규칙별 건수, scope new 의 위반 전체 목록, 확인한 오탐과 한계.
