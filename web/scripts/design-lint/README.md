# 디자인 규칙 검사

`DESIGN.md`와 `REDESIGN_BRIEF.md` 4-4를 기준으로 CSS, TSX, 문구 JSON을 검사한다. Node 내장 모듈만 사용한다. 의존성 설치, dev 서버, 빌드가 필요 없다. 앱 소스를 수정하지 않는다.

## 실행

`web` 폴더에서 실행한다.

```sh
node scripts/design-lint/lint.mjs --scope new
node scripts/design-lint/lint.mjs --scope all
node scripts/design-lint/lint.mjs --scope new --json ../qa/design-lint-new.json
```

범위를 생략하면 `new`다. 저장소 루트에서도 `node web/scripts/design-lint/lint.mjs`로 실행할 수 있다. 검사 기준 디렉터리는 언제나 `web`이고 JSON 출력 경로만 현재 작업 디렉터리를 기준으로 해석한다. RTK 환경에서는 위 명령 앞에 `rtk proxy`를 붙인다.

- 종료 코드 `0`: 위반 없음.
- 종료 코드 `1`: 위반 있음.
- 종료 코드 `2`: 잘못된 인수, 읽기 실패, 손상된 JSON 등 검사 오류. 통과로 처리하면 안 된다.

위반마다 `[파일:줄 / 규칙 이름 / 원본 줄 일부 / 고칠 방법]`을 출력한다. 문구에는 키 경로도 붙인다. 마지막에 모든 규칙의 건수와 합계를 출력한다. 파일 경로는 `web` 기준이고 줄과 열은 1부터 센다.

JSON에는 `scope`, `files`, `counts`, `total`, `violations`가 들어간다. 각 위반에는 `file`, `line`, `column`, `rule`, `snippet`, `fix`가 있고 문구 위반에는 `key`도 있다. 위반이 있어도 JSON을 기록한 뒤 코드 1로 종료한다. 부모 디렉터리는 필요하면 만들며 기존 결과 파일은 덮어쓴다. 앱 소스 디렉터리와 검사 설정 파일은 출력 대상으로 거절한다.

한 선언, 클래스 토큰, JSON 문자열 값에서 같은 규칙은 한 번 센다. 한 줄에 서로 다른 선언이나 클래스가 있으면 여러 건이다. 예를 들어 색을 직접 쓴 그라데이션은 색 규칙과 그라데이션 규칙에서 각각 집계한다. 조건식과 애니메이션 배열의 값은 해당 스타일 선언으로 묶는다.

## 규칙

| 이름 | 검사 대상 | 허용 또는 수정 기준 |
|---|---|---|
| `color-outside-tokens` | 토큰 밖 16진수 색, rgb/rgba/hsl 등의 색 함수, CSS 색 이름, Tailwind 기본 팔레트와 임의 색 | `var(--v-...)` 사용. transparent, currentColor, inherit, SVG none 허용 |
| `weight-over-400` | 400 초과 font-weight, bold/bolder, font 단축 선언의 굵기, font-medium/semibold/bold/extrabold/black, font-[숫자] | 400 이하. 정확히 `.v-card-title`인 CSS 선택자의 600만 예외 |
| `uppercase` | text-transform: uppercase, Tailwind uppercase | 대문자 변환 제거 |
| `letter-spacing-positive` | 양수 자간, tracking-wide/wider/widest, tracking-[양수] | 0, 음수, normal 허용 |
| `shadow` | box-shadow, text-shadow, filter의 drop-shadow(), shadow 및 drop-shadow 유틸리티 | none과 초기화 선언, shadow-none, drop-shadow-none 허용 |
| `gradient` | linear/radial/conic-gradient와 반복형, background-clip: text, bg-gradient 계열, bg-clip-text, from/via/to 색 유틸리티 | 단색 토큰 사용. from-50% 같은 위치 유틸리티 자체는 제외 |
| `native-dialog` | alert(), confirm(), prompt(), window/globalThis/self의 같은 호출 | 지역 선언, 매개변수, import, 다른 객체의 메서드는 제외 |
| `copy-emdash` | JSON 문자열 값의 U+2014, U+2013 | 마침표, 쉼표, 괄호 사용 |
| `copy-middledot` | JSON 문자열 값의 U+00B7, U+30FB, U+2027, U+2022 | 쉼표나 연결 표현 사용 |
| `copy-exclamation` | JSON 문자열 값의 반각 또는 전각 느낌표 | 서술문 사용 |
| `copy-question` | JSON 문자열 값에 포함된 반각 또는 전각 물음표 | 질문 대신 상태와 다음 행동 서술 |
| `copy-apology` | 죄송, 미안, 불편을 드려, sorry, apologize/apologise 및 활용형, apology/apologies, 중국어 사과 등 | 현재 상태와 필요한 행동 서술 |

CSS 주석과 JS 주석, JS 정규식 안의 예시는 검사하지 않는다. CSS 선언, 인라인 스타일, SVG 색 속성, CSS 템플릿, `className` 및 `numberClassName` 같은 속성, cn/cx/clsx/classNames/cva/twMerge 인수, 같은 파일의 클래스 변수 초기값을 검사한다. Tailwind의 반응형 접두사, 상태 접두사, 중요도 표시, 임의 속성도 처리한다. JSON은 키가 아닌 값만 검사하며 유니코드 이스케이프를 해석하고 배열을 포함한 전체 키 경로를 유지한다.

## 범위와 예외 관리

`config.json`의 `scopes.new`는 전면 개편 파일 목록이다. 총괄이 화면을 옮길 때 이 목록을 늘린다. `scopes.all`은 `app/**`, `components/**`, `messages/**`다. 실제 검사 확장자는 CSS, TSX, messages 아래 JSON이다. 이미지, SVG 파일, 일반 TS 파일은 검사 대상이 아니다. 심볼릭 링크를 따라가지 않는다.

글롭의 `*`는 경로 한 구간, `**`는 하위 경로 전체, `?`는 경로 구분자 외 한 글자다. `[locale]`, `[slug]`의 대괄호는 Next.js 실제 디렉터리명으로 취급한다. 아직 없는 파일 패턴은 건너뛴다. 실행 결과의 `files` 또는 검사 파일 수로 범위가 의도대로 잡혔는지 확인한다.

예외는 모두 `exceptions`에 이유와 함께 둔다. `file`은 글롭이고 `rules`는 규칙 이름 목록이다. `"*"`는 모든 규칙을 뜻한다. `keyPattern`은 대소문자를 구분하지 않는 문구 키 경로 정규식이다. `selector`, `value`는 CSS 선언의 선택자와 값이 정확히 같을 때만 적용한다.

- `app/tokens.css`: 색 규칙만 제외한다.
- `components/layout/BrandLogo.tsx`: 워드마크 색과 굵기만 제외한다.
- `components/flow/ProviderMark.tsx`: 공급자 표식 색만 제외한다.
- `footer.tagline`, `footer.slogan`: 슬로건 원문에 문구 예외를 적용한다. 상품별 tagline에는 적용하지 않는다.
- `faq`가 들어간 키 경로: 질문 규칙만 제외한다. 현재 요청에 맞춰 FAQ 하위 전체에 적용하므로 FAQ 답변까지 제외될 수 있다.
- `components/layout/LabBadge.tsx`: 테스트 사이트 표식 전체를 제외한다.
- `.v-card-title`: 정확히 이 선택자의 굵기 600만 허용한다. 다른 선택자와 함께 묶거나 700을 쓰면 실패한다.

## 검증과 한계

작성 시 두 범위의 실제 CLI 실행과 규칙별 원본 표본을 확인했다. 실제 위반이 있는 9개 규칙은 각각 5개 표본을 열어 확인했다. 실제 결과가 0인 native-dialog, copy-emdash, copy-apology는 억지로 위반을 만들지 않았다. 0건인 규칙도 메모리 입력으로 허용 사례와 금지 사례를 각각 5개 이상 검사했다.

중복 색 집계, 색 변수 식별자의 오인, 주석과 지역 confirm 호출, 일반 문자열의 Tailwind 단어 오인을 방지했다. 조건식, 애니메이션 배열, 클래스 변수, JSON 이스케이프, FAQ의 질문만 예외 처리되는지, 토큰 파일의 다른 규칙이 살아 있는지도 확인했다. 추가 테스트 파일이나 결과 파일은 만들지 않았다.

이 도구는 외부 파서 없이 실행하는 정적 검사다. 런타임 계산, 외부 파일에서 가져온 값, 동적으로 조합한 클래스, CSS 변수의 최종 값, calc()의 양수 여부는 평가하지 않는다. 사용자 정의 Tailwind 색 별칭의 실제 색 정의도 따라가지 않는다. 함수 별칭을 통한 브라우저 호출과 `window["alert"]()` 같은 계산 속성 호출은 검사하지 않는다. 복잡한 TS 타입, 드문 JS 구문, 같은 이름을 여러 범위에서 재사용한 클래스 변수에서는 누락이나 오탐이 가능하다. CSS 템플릿의 동적 선택자도 완전하게 해석하지 않는다.

문구의 물음표가 URL의 쿼리인지 자연어 질문인지 의미를 판단하지 않는다. 사과 표현은 정해진 어휘를 기준으로 찾는다. `all`은 사용하지 않는 옛 화면도 포함한다. 통과는 화면 검수나 브라우저에서 계산된 스타일 검수를 대신하지 않는다.

개별 입력 검증에는 `lint.mjs`에서 내보낸 `lintSource(file, source)`를 사용할 수 있다. `run(scope)`는 저장소 검사 결과를 반환한다. 모듈로 가져오면 CLI를 자동 실행하지 않으므로 Node 내장 assert와 메모리 입력으로 별도 파일 없이 검증할 수 있다.
