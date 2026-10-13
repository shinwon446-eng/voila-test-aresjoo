# AGY 소스 분석 보고서: 시각, 인터랙션, 애니메이션 정밀 감사

- 대상 파일: `migration-audit/analysis/agy-a-visual-source.md`
- 작성 주체: AGY (시각, 인터랙션, 애니메이션 책임자)
- 감사 단계: Phase 1 독립 소스 분석 (Task A)
- 분석 근거: [web/app/tokens.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css), [web/app/ui.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css), [web/app/opening.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css), [web/app/hero.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css), [web/app/take.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/take.css), [web/app/footer.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/footer.css), [web/app/scroll-fade.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/scroll-fade.css), [web/app/globals.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css), [web/tailwind.config.ts](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/tailwind.config.ts), [web/app/layout.tsx](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/layout.tsx), [web/lib/opening.ts](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/opening.ts), [web/lib/openingFlow.ts](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/openingFlow.ts), [web/lib/openingSettle.ts](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/openingSettle.ts), [web/lib/openingSound.ts](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/openingSound.ts), [web/components/box/Opening.tsx](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/box/Opening.tsx), [web/components/box/Reveal.tsx](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/box/Reveal.tsx), [web/components/home/HeroBanner.tsx](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/home/HeroBanner.tsx), [web/components/home/heroBall.ts](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/home/heroBall.ts), [opening/STATE.md](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/opening/STATE.md), [DESIGN.md](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/DESIGN.md)

---

## 1. 실제로 정의된 디자인 토큰 (Design Tokens)

### 1.1 색상 토큰 (Colors)
[코드에서 읽음] [web/app/tokens.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L5-L51)
새 디자인 시스템의 색상은 `tokens.css` 한 곳에서만 선언되며 CSS 변수(`--v-*`)로 통제된다.
- AG-TOK-001 바탕: `--v-bg: #000` ([web/app/tokens.css#L9](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L9))
- AG-TOK-002 카드 면: `--v-card: #303030` ([web/app/tokens.css#L10](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L10))
- AG-TOK-003 알약 면: `--v-pill: #2f2f2f` ([web/app/tokens.css#L11](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L11))
- AG-TOK-004 알약 호버 면: `--v-pill-hover: #3a3a3a` ([web/app/tokens.css#L12](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L12))
- AG-TOK-005 오버레이 배경: `--v-scrim: rgba(0, 0, 0, 0.72)` ([web/app/tokens.css#L13](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L13))
- AG-TOK-006 사진 자리 바탕: `--v-photo: #1a1a1a` ([web/app/tokens.css#L14](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L14))
- AG-TOK-007 외곽선: `--v-outline: rgba(255, 255, 255, 0.15)` ([web/app/tokens.css#L17](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L17))
- AG-TOK-008 구분선: `--v-divider: rgba(255, 255, 255, 0.1)` ([web/app/tokens.css#L18](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L18))
- AG-TOK-009 선택 테두리 및 텍스트 셀렉션: `--v-selected: #9a9a9a` ([web/app/tokens.css#L19](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L19))
- AG-TOK-010 제목 텍스트: `--v-title: #fff` ([web/app/tokens.css#L22](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L22))
- AG-TOK-011 본문 텍스트: `--v-text: #ececec` ([web/app/tokens.css#L23](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L23))
- AG-TOK-012 설명 텍스트: `--v-sub: #cdcdcd` ([web/app/tokens.css#L24](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L24))
- AG-TOK-013 보조 텍스트: `--v-mute: #9a9a9a` ([web/app/tokens.css#L25](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L25))
- AG-TOK-014 주 단추 배경: `--v-primary: #fff` ([web/app/tokens.css#L28](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L28))
- AG-TOK-015 주 단추 호버 배경: `--v-primary-hover: #e6e6e6` ([web/app/tokens.css#L29](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L29))
- AG-TOK-016 주 단추 글자색: `--v-on-primary: #000` ([web/app/tokens.css#L30](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L30))
- AG-TOK-017 실패 전용 색상: `--v-fail: #ff7b72` ([web/app/tokens.css#L33](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L33))
- AG-TOK-018 개봉 상자 뚜껑 면: `--v-op-lid: #4a4a4a` ([web/app/tokens.css#L36](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L36))
- AG-TOK-019 개봉 상자 앞면: `--v-op-front: #343434` ([web/app/tokens.css#L37](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L37))
- AG-TOK-020 개봉 상자 옆면: `--v-op-side: #232323` ([web/app/tokens.css#L38](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L38))
- AG-TOK-021 개봉 상자 안쪽: `--v-op-inside: #0b0b0b` ([web/app/tokens.css#L39](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L39))
- AG-TOK-022 개봉 상자 띠: `--v-op-band: #5e5e5e` ([web/app/tokens.css#L40](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L40))
- AG-TOK-023 로고 별 및 최고당첨 강조색: `--v-spark: #d9c39a` ([web/app/tokens.css#L42](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L42))
- AG-TOK-024 홈 배너 홀로그램 1: `--v-holo-1: #7df9ff` ([web/app/tokens.css#L44](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L44))
- AG-TOK-025 홈 배너 홀로그램 2: `--v-holo-2: #b79bff` ([web/app/tokens.css#L45](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L45))
- AG-TOK-026 홈 배너 홀로그램 3: `--v-holo-3: #ff8fd2` ([web/app/tokens.css#L46](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L46))
- AG-TOK-027 홈 배너 홀로그램 4: `--v-holo-4: #ffd98a` ([web/app/tokens.css#L47](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L47))
- AG-TOK-028 홈 배너 홀로그램 5: `--v-holo-5: #8dffc0` ([web/app/tokens.css#L48](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L48))
- AG-TOK-029 홈 배너 구슬 빨간색: `--v-hero-orb: #e5383b` ([web/app/tokens.css#L50](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L50))

[코드에서 읽음] [web/tailwind.config.ts](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/tailwind.config.ts#L11-L56) 및 [web/app/globals.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L93-L108)
개편 전 레거시 화면 및 특수 유틸리티에 정의된 색상 토큰:
- AG-TOK-030 obsidian, canvas: `#101112` ([web/tailwind.config.ts#L14](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/tailwind.config.ts#L14))
- AG-TOK-031 surface: `#191B1D` ([web/tailwind.config.ts#L18](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/tailwind.config.ts#L18))
- AG-TOK-032 elevation: `#232527` ([web/tailwind.config.ts#L20](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/tailwind.config.ts#L20))
- AG-TOK-033 gold 계열: champagne `#D9C39A`, metallic `#C8AF82`, dark `#A58B62` ([web/tailwind.config.ts#L26-L28](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/tailwind.config.ts#L26-L28))
- AG-TOK-034 crimson: `#E50914` ([web/tailwind.config.ts#L31](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/tailwind.config.ts#L31))
- AG-TOK-035 platinum.ice: `#E5E4E2`, bronze.executive: `#C5A059` ([web/tailwind.config.ts#L32-L33](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/tailwind.config.ts#L32-L33))
- AG-TOK-036 tier 계열: royal `#D9C39A`, prestige `#93C5FD`, executive `#C084FC`, curated `#94A3B8` ([web/tailwind.config.ts#L51-L55](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/tailwind.config.ts#L51-L55))
- AG-TOK-037 텍스트 계열: secondary `#CECFCA`, muted `#A3A4A2`, faint `#90928F`, line `#2A2A2A`, hairline `rgba(255,255,255,0.08)` ([web/tailwind.config.ts#L37-L44](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/tailwind.config.ts#L37-L44))
- AG-TOK-038 테스트 사이트 식별 띠 색상: `LAB_COLOR`에 따라 `bg-cyan-400` 또는 `bg-fuchsia-500` ([web/components/layout/LabBadge.tsx#L13-L16](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/layout/LabBadge.tsx#L13-L16))

### 1.2 서체 크기 및 행간 (Type Scale)
[코드에서 읽음] [web/app/tokens.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L63-L67,L77-L78) 및 [web/app/ui.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L8,L44-L47)
- AG-TOK-040 제목: `--v-fs-title: 32px` (데스크톱), 모바일(폭 767px 이하)에서 `28px` 로 축소 ([web/app/tokens.css#L63,L77](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L63,L77)), line-height `1.25`
- AG-TOK-041 설명: `--v-fs-desc: 18px` (데스크톱), 모바일(폭 767px 이하)에서 `16px` 로 축소 ([web/app/tokens.css#L64,L78](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L64,L78)), line-height `1.5`
- AG-TOK-042 섹션 제목: `--v-fs-section: 18px` ([web/app/tokens.css#L65](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L65)), line-height `1.4`
- AG-TOK-043 본문: `--v-fs-body: 16px` ([web/app/tokens.css#L66](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L66)), line-height `1.5`
- AG-TOK-044 보조 및 링크: `--v-fs-small: 14px` ([web/app/tokens.css#L67](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L67)), line-height `1.5`
- AG-TOK-045 칩 글자 크기: `15px` 고정 ([web/app/ui.css#L76](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L76))
- AG-TOK-046 결과 값 큰 숫자: `clamp(44px, 14vw, 64px)` ([web/app/opening.css#L24](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L24)) 및 `.v-reveal-value[data-size="lg"]`: `clamp(32px, 11vw, 52px)` ([web/app/ui.css#L299](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L299))
- AG-TOK-047 평점 평균 숫자: `40px`, line-height `1.1` ([web/app/ui.css#L160](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L160))
- AG-TOK-048 럭셔리 캡션 (레거시): `10px`, line-height `1.2`, letter-spacing `0.2em` ([web/app/globals.css#L196-L198](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L196-L198))
- AG-TOK-049 넷플릭스 순위 숫자 (레거시): `6rem` (모바일) / `8.5rem` (데스크톱 min-width 640px), line-height `0.72` ([web/app/globals.css#L206,L215](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L206,L215))

### 1.3 둥글기 (Border Radii)
[코드에서 읽음] [web/app/tokens.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L53-L55,L76)
- AG-TOK-050 카드 및 시트 창: `--v-r-card: 26px` (데스크톱), 모바일(폭 767px 이하)에서 `20px` ([web/app/tokens.css#L53,L76](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L53,L76))
- AG-TOK-051 입력 필드: `--v-r-field: 19px` ([web/app/tokens.css#L54](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L54))
- AG-TOK-052 알약 단추 및 스크롤바 썸: `--v-r-pill: 999px` ([web/app/tokens.css#L55](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L55))
- AG-TOK-053 보관함 및 후기 사진: `12px` 또는 `14px` ([web/app/ui.css#L232,L262,L369](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L232,L262,L369))
- AG-TOK-054 체크박스: `8px` ([web/app/take.css#L5](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/take.css#L5))

### 1.4 간격 및 치수 (Spacing & Dimensions)
[코드에서 읽음] [web/app/tokens.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L56-L60) 및 [web/app/ui.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L22-L27,L32,L39)
- AG-TOK-060 주 단추 최소 높이: `--v-btn-h: 52px` ([web/app/tokens.css#L56](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L56))
- AG-TOK-061 터치 최소 영역: `--v-touch: 44px` ([web/app/tokens.css#L57](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L57))
- AG-TOK-062 뷰포트 여백 (거터): `--v-gutter: 16px` ([web/app/tokens.css#L58](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L58))
- AG-TOK-063 결정 화면 열 너비: `--v-col: 560px` ([web/app/tokens.css#L59](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L59))
- AG-TOK-064 박스 목록 넓은 너비: `--v-wide: 1120px` ([web/app/tokens.css#L60](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L60))
- AG-TOK-065 스택 간격: 기본 `.v-stack` `16px`, 큰 간격 `.v-stack--lg` `28px`, 작은 간격 `.v-stack--sm` `8px` ([web/app/ui.css#L25-L27](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L25-L27))
- AG-TOK-066 헤더 높이: 모바일 `56px`, 데스크톱 min-width 768px 에서 `64px` ([web/app/ui.css#L32,L39](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L32,L39))

### 1.5 반응형 분기점 (Breakpoints)
[코드에서 읽음] [web/app/ui.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css), [web/app/tokens.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css), [web/app/hero.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css), [web/app/opening.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css), [web/app/footer.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/footer.css)
- AG-TOK-070 `max-width: 359.98px` (극소 모바일): 상품 행 사진 축소(`44px`), 메타 최대너비 `46%` ([web/app/ui.css#L373](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L373)), 홈 배너 높이 `178px` 및 스케일 축소 ([web/app/hero.css#L124](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L124))
- AG-TOK-071 `max-width: 380px`: 사이트 헤더 로고 텍스트 축소 `23px` ([web/app/globals.css#L56](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L56))
- AG-TOK-072 `min-width: 640px`: 박스 그리드 갭 `16px`, 카드 패딩 확대 ([web/app/ui.css#L206](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L206))
- AG-TOK-073 `max-height: 700px` (낮은 화면): 개봉 결과 화면 게이지 숨김 ([web/app/opening.css#L144](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L144)), 상품 사진 축소 ([web/app/take.css#L20](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/take.css#L20))
- AG-TOK-074 `min-width: 720px`: 개봉 상단 바 패딩 확대([web/app/opening.css#L13](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L13)), 히어로 배너 2열 분할 배치([web/app/hero.css#L125](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L125)), 푸터 2열 그리드 전환([web/app/footer.css#L26](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/footer.css#L26)), 가로 스크롤 페이드 `72px`([web/app/scroll-fade.css#L8](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/scroll-fade.css#L8))
- AG-TOK-075 `max-width: 767px` 및 `min-width: 768px`: 모바일 카드 반경 `20px` 대 데스크톱 `26px` ([web/app/tokens.css#L74](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L74)), 시트 하단 시트 대 가운데 모달 창 전환 ([web/app/ui.css#L125](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L125)), 구성품 그리드 칼럼 수 확대 ([web/app/ui.css#L274](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L274)), 결과 화면 액션 고정 해제 ([web/app/ui.css#L354](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L354))
- AG-TOK-076 `min-width: 900px`: 헤더 내비게이션 펼침 및 햄버거 메뉴 버튼 숨김 ([web/app/ui.css#L41](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L41))
- AG-TOK-077 `max-width: 1023.98px` 및 `min-width: 1024px`: 하단 열기 바 존재 시 푸터 패딩 보정 `170px` / `260px` ([web/app/ui.css#L321](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L321), [web/app/take.css#L22](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/take.css#L22)), 1024px 이상에서 박스 화면 2열 분할 및 스티키 결정 사이드바 전환 ([web/app/ui.css#L339](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L339)), 박스 그리드 3열 전환 ([web/app/ui.css#L210](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L210))

### 1.6 z-index 계층 (Z-Index Layers)
[코드에서 읽음] [web/app/ui.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css), [web/app/hero.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css), [web/app/opening.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css), [web/components/layout/LabBadge.tsx](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/layout/LabBadge.tsx)
- AG-TOK-080 `z-0`: `.v-hero-bg` 배너 배경 클리핑 층 ([web/app/hero.css#L16](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L16))
- AG-TOK-081 `z-1`: `.v-hero-stage` ([web/app/hero.css#L18](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L18)), `.v-sheet-close` ([web/app/ui.css#L121](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L121)), `.v-reveal-actions` ([web/app/ui.css#L353](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L353)), `.v-reveal-top` ([web/app/opening.css#L56](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L56))
- AG-TOK-082 `z-2`: `.v-hscroll-btn` 가로 스크롤 좌우 단추 ([web/app/ui.css#L172](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L172)), `.v-hero-copy` ([web/app/hero.css#L10](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L10)), `.v-hero-cards` ([web/app/hero.css#L41](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L41))
- AG-TOK-083 `z-3`: `.v-hero-orb[data-i="0"]`, `[data-i="4"]` 전면 돌출 구슬 ([web/app/hero.css#L100,L104](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L100,L104)), `.v-hero-spark` ([web/app/hero.css#L108](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L108))
- AG-TOK-084 `z-4`: `.v-hero-cta` 배너 주 단추 영역 ([web/app/hero.css#L13](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L13))
- AG-TOK-085 `z-20`: `.v-openbar` 모바일 하단 고정 열기 막대 ([web/app/ui.css#L283](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L283))
- AG-TOK-086 `z-30`: `.v-header` 상단 고정 헤더 ([web/app/ui.css#L31](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L31))
- AG-TOK-087 `z-35`: `.reel-tension::before, ::after` (레거시 룰렛 보더) ([web/app/globals.css#L370](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L370))
- AG-TOK-088 `z-150`: `.v-reveal` ([web/app/ui.css#L287](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L287)) 및 `.v-op` 개봉 연출 화면 ([web/app/opening.css#L8](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L8))
- AG-TOK-089 `z-200`: `.v-scrim` 모달 및 시트 배경 스크림 ([web/app/ui.css#L118](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L118))
- AG-TOK-090 `z-300`: `.v-toast-host` 토스트 호스트 ([web/app/ui.css#L140](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L140)) 및 `LabBadge` 테스트 식별 띠 ([web/components/layout/LabBadge.tsx#L31-L32](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/layout/LabBadge.tsx#L31-L32))

### 1.7 그림자 (Shadows)
[코드에서 읽음] [DESIGN.md](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/DESIGN.md#L30,L34) 및 [web/app/ui.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css), [web/app/opening.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css)
- AG-TOK-095 새 화면 일반 카드와 창: 그림자 없음 (`box-shadow: none`, 채운 카드 `#303030` 또는 윤곽 1px `rgba(255,255,255,0.15)`)
- AG-TOK-096 3D 상자 내부 면 및 리본 음영: `box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--v-title) 10%, transparent)` ([web/app/opening.css#L74](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L74))
- AG-TOK-097 상자 봉인 인장: `box-shadow: 0 0 0 1px var(--v-outline), 0 3px 0 0 var(--v-op-inside)` ([web/app/opening.css#L88](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L88))
- AG-TOK-098 홈 배너 카드 면: `box-shadow: 0 0 0 1px color-mix(in srgb, var(--v-spark) 80%, transparent), 0 14px 30px color-mix(in srgb, var(--v-bg) 78%, transparent)` ([web/app/hero.css#L51](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L51))
- AG-TOK-099 홈 배너 구슬: `box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--v-hero-orb) 55%, var(--v-title)), inset 0 -14px 26px color-mix(in srgb, var(--v-bg) 45%, transparent), 0 18px 40px color-mix(in srgb, var(--v-bg) 70%, transparent)` ([web/app/hero.css#L91](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L91))

### 1.8 모션 시간 및 이징 (Motion Durations & Easings)
[코드에서 읽음] [web/app/tokens.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L70-L71), [web/app/opening.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L8), [web/lib/openingFlow.ts](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/openingFlow.ts#L62-L71)
- AG-TOK-100 표준 빠른 전환: `--v-fast: 0.1s` (버튼 호버, 칩 선택, 보더 전환) ([web/app/tokens.css#L70](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L70))
- AG-TOK-101 표준 곡선: `--v-ease: cubic-bezier(0.2, 0.8, 0.2, 1)` ([web/app/tokens.css#L71](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L71))
- AG-TOK-102 영화적 이징 (레거시): `cine: cubic-bezier(0.16, 1, 0.3, 1)` ([web/tailwind.config.ts#L70](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/tailwind.config.ts#L70))
- AG-TOK-103 개봉 연출 구간 변수 (기본 모드):
  - 기대(anticipation): `520ms` (`--ant: 520ms`)
  - 충격(impact): `150ms` (`--imp: 150ms`)
  - 퇴장(exit): `170ms` (`--exit: 170ms`)
  - 결과 공개 시점(revealAt): `840ms`
  - 액션 무장 지연(OPENING_ARM_DELAY_MS): `350ms` (결과 공개 후 350ms 동안 하단 버튼 입력 차단)
  - 차기 구매 가능 시점(armAt): `1190ms` ([web/lib/openingFlow.ts#L67,L71](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/openingFlow.ts#L67,L71))
- AG-TOK-104 개봉 연출 구간 변수 (짧게 보기 모드 `openShort`):
  - 기대: `220ms`
  - 충격: `110ms`
  - 퇴장: `120ms`
  - 결과 공개 시점: `450ms`
  - 차기 구매 가능 시점: `800ms` ([web/lib/openingFlow.ts#L63-L67](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/openingFlow.ts#L63-L67))

---

## 2. 실제로 로드된 폰트 및 로딩 방식 (Fonts Loaded)

[코드에서 읽음] [web/app/layout.tsx](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/layout.tsx#L2,L14,L45,L50) 및 [web/app/globals.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L19-L31)

### 2.1 로드된 서체와 소스
- AG-FNT-001 패밀리 이름: Pretendard Variable (한글, 라틴, 숫자 단일 가변 서체)
- AG-FNT-002 소스 파일: [web/public/assets/fonts/PretendardVariable.woff2](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/public/assets/fonts/PretendardVariable.woff2)
- [직접 실행함]
  명령: `Test-Path "web/public/assets/fonts/PretendardVariable.woff2"`
  결과: `True` (로컬 디렉터리에 실제 존재함 확인)
- AG-FNT-003 로딩 방식: `next/font/local` 모듈을 이용한 빌드 타임 가변 폰트 최적화
  ```typescript
  const pretendard = localFont({
    src: "../public/assets/fonts/PretendardVariable.woff2",
    variable: "--font-ui",
    display: "swap",
    weight: "45 920",
  });
  ```
  `web/app/layout.tsx` 의 RootLayout 에서 `<html className={pretendard.variable}>` 로 CSS 변수 `--font-ui` 가 HTML 루트에 주입된다.

### 2.2 CSS 적용 및 대체 글꼴
- AG-FNT-004 서체 스택 정의 ([web/app/globals.css#L20-L23](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L20-L23)):
  ```css
  --font-pretendard: var(--font-ui), "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  --font-sans: var(--font-pretendard);
  --font-display: var(--font-pretendard);
  ```
- AG-FNT-005 전역 적용 ([web/app/globals.css#L27-L31](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L27-L31)):
  `html, body, *, ::before, ::after { font-family: var(--font-pretendard); }`
  전 사이트의 모든 제목, 본문, 숫자, 통화 기호가 예외 없이 동일한 Pretendard Variable 로 고정된다.
- AG-FNT-006 세리프 및 장식 글꼴 배제: DESIGN.md 2장 및 3장 원칙에 따라 Cinzel 등 세리프 글꼴은 로드되지 않으며 선언도 제거되었다.
- AG-FNT-007 브랜드 로고 글꼴: 로고 워드마크 `voila.gg` 는 글꼴 파일이 아닌 SVG 인라인 패스(원, 폴리라인, 선)로 직접 그려져 서체 로딩에 영향을 받지 않는다 ([web/components/layout/BrandLogo.tsx#L10-L29](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/layout/BrandLogo.tsx#L10-L29)).

---

## 3. 애니메이션 및 트랜지션 전수조사 (Animation Inventory)

[코드에서 읽음] 다음 표와 명세는 CSS 키프레임, 트랜지션, Framer Motion, 캔버스 RAF 렌더링을 전수 조사한 결과다.

| ID | 명칭 및 위치 | 트리거 | 지속시간 및 딜레이 | 이징 | 애니메이션 속성 | 반복 및 방향 | 축소 모션 동작 | 소리 및 햅틱 | 완료 콜백 및 상태 변화 |
|---|---|---|---|---|---|---|---|---|---|
| AG-A-001 | v-skel 스켈레톤 ([web/app/ui.css#L113-L115](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L113-L115)) | 컴포넌트 마운트 | 1.4s (딜레이 0) | ease-in-out | opacity (1 -> 0.55 -> 1) | 무한 루프 | 미적용 (정지) | 없음 | 없음 |
| AG-A-002 | v-fade 스크림 페이드 ([web/app/ui.css#L133,L136](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L133,L136)) | 시트/모달 오픈 | 0.18s (딜레이 0) | ease-out | opacity (0 -> 1) | 1회 | 미적용 (즉시 1) | 없음 | 없음 |
| AG-A-003 | v-rise 시트 상승 ([web/app/ui.css#L134,L137](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L134,L137)) | 시트/모달 마운트 | 0.26s (딜레이 0) | cubic-bezier(0.2, 0.8, 0.2, 1) | translateY(24px)->0, opacity 0->1 | 1회 | 미적용 (정위치) | 없음 | focus() 부여 |
| AG-A-004 | v-rise 토스트 ([web/app/ui.css#L142](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L142)) | useToast().show() | 0.2s (딜레이 0) | cubic-bezier(0.2, 0.8, 0.2, 1) | translateY(24px)->0, opacity 0->1 | 1회 | 미적용 | 없음 | 2.4초 후 자동 clear |
| AG-A-005 | v-btn 액티브 ([web/app/ui.css#L61](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L61)) | mousedown/touch | 0.1s | ease | transform: scale(0.985) | 마우스 뗄 때 복귀 | transform: none | 없음 | 없음 |
| AG-A-006 | v-op-settle 상자 안착 ([web/app/opening.css#L110,L132](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L110,L132)) | anticipation 진입 | 520ms (짧게 220ms) | cubic-bezier(0.3, 0, 0.4, 1) | translateY, scale, opacity | 1회 both | reveal 직행 | soundPress (220Hz 60ms) | impact 타이머 점화 |
| AG-A-007 | v-op-wind 별 회전 ([web/app/opening.css#L112,L133](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L112,L133)) | anticipation 진입 | 520ms (짧게 220ms) | cubic-bezier(0.6, 0, 0.9, 0.4) | rotate(0->90deg), scale(1->1.16) | 1회 both | reveal 직행 | 없음 | 없음 |
| AG-A-008 | v-op-strain 뚜껑 긴장 들썩임 ([web/app/opening.css#L113,L134](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L113,L134)) | anticipation 진입 | 520ms (짧게 220ms) | linear | rotateX(0->5deg->1deg->8deg->0) | 1회 both | reveal 직행 | 없음 | 없음 |
| AG-A-009 | v-op-pop 상자 튀어오름 ([web/app/opening.css#L114,L135](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L114,L135)) | impact 진입 | 150ms (짧게 110ms) | cubic-bezier(0.2, 1.7, 0.4, 1) | translateY(8px->-6px), scale(0.93->1.05) | 1회 both | reveal 직행 | soundOpen (소음+92Hz), 진동 12ms | exit 타이머 점화 |
| AG-A-010 | 뚜껑 넘어가기 트랜지션 ([web/app/opening.css#L115](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L115)) | impact 진입 | 0.34s | cubic-bezier(0.2, 1.3, 0.35, 1) | transform: rotateX(112deg) | 1회 | transform 고정 | 없음 | 없음 |
| AG-A-011 | 봉인 탈락 트랜지션 ([web/app/opening.css#L116](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L116)) | impact 진입 | 0.3s (opacity 딜레이 0.22s) | cubic-bezier(0.4, 0, 0.9, 0.5) | translateZ, translateY, rotate, opacity | 1회 | 위치 고정 | 없음 | 없음 |
| AG-A-012 | 상자 내부 광원 트랜지션 ([web/app/opening.css#L117](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L117)) | impact 진입 | 0.1s | ease-out | opacity (0 -> 0.2~0.95 톤별) | 1회 | 정적 opacity | 없음 | 없음 |
| AG-A-013 | v-op-leave 상자 퇴장 ([web/app/opening.css#L118,L136](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L118,L136)) | exit 진입 | 170ms (짧게 120ms) | cubic-bezier(0.4, 0, 0.9, 0.6) | translateY(-6px->34px), scale(1.05->0.8), opacity(1->0) | 1회 both | 즉시 숨김 | 없음 | reveal 전환 |
| AG-A-014 | 바닥 광원 트랜지션 ([web/app/opening.css#L119](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L119)) | reveal 진입 | opacity 0.6s, transform 2s | ease-out, cubic-bezier(0.05, 0.7, 0.1, 1) | opacity 0.6~0.9, scale 1.2 (톤별) | 1회 | 정적 스타일 | 없음 | 없음 |
| AG-A-015 | v-op-in 결과물 등장 ([web/app/opening.css#L121,L137](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L121,L137)) | reveal 진입 | 0.24s | cubic-bezier(0.05, 0.7, 0.1, 1) | translateY(10px->0), scale(0.97->1), opacity(0->1) | 1회 both | 즉시 정위치 | soundResult (톤별 화음) | onRevealed() 실행 |
| AG-A-016 | v-op-ping 잔액 변경 핑 ([web/app/opening.css#L124,L138](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L124,L138)) | balance 변경 시 | 0.7s | ease-out | border-color: title -> transparent | 1회 both | 없음 | 없음 | 없음 |
| AG-A-017 | v-op-push 최고당첨 사진 밀기 ([web/app/opening.css#L126,L139](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L126,L139)) | tone=top 진입 | 2.2s | cubic-bezier(0.05, 0.7, 0.1, 1) | transform: scale(1.18 -> 1) | 1회 both | scale(1) | 없음 | 없음 |
| AG-A-018 | v-op-halo 최고당첨 후광 번짐 ([web/app/opening.css#L127,L140](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L127,L140)) | tone=top 진입 | 1.5s (딜레이 0.1s) | cubic-bezier(0.1, 0.6, 0.2, 1) | opacity 0->1->0.35, scale 0.7->1.12 | 1회 both | 투명 | 없음 | 없음 |
| AG-A-019 | v-resultrow 결과 행 상승 ([web/app/ui.css#L306](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L306)) | 다중 개봉 마운트 | 0.3s (스태거 i * 0.06s 최대 0.6s) | cubic-bezier(0.2, 0.8, 0.2, 1) | translateY(24px)->0, opacity 0->1 | 1회 both | 즉시 렌더 | 없음 | 350ms 후 armed=true |
| AG-A-020 | v-hero-crouch 배너 상자 웅크림 ([web/app/hero.css#L33,L143](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L33,L143)) | anticipation 진입 | 0.19s | cubic-bezier(0.3, 0, 0.4, 1) | translateY(4px) scale(1.03, 0.92) | 1회 both | 정지 | 없음 | open 전환 |
| AG-A-021 | v-hero-pop 배너 상자 팝 ([web/app/hero.css#L34,L144](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L34,L144)) | impact 진입 | 0.2s | cubic-bezier(0.2, 1.7, 0.4, 1) | translateY(-2px) scale(1) | 1회 both | 정지 | 없음 | 없음 |
| AG-A-022 | v-hcard-in 배너 카드 부채꼴 전개 ([web/app/hero.css#L46,L145](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L46,L145)) | open 진입 | 0.72s (0, 0.06s, 0.12s 딜레이) | cubic-bezier(0.2, 0.8, 0.2, 1) | translate, rotate, scale, opacity | 1회 both | 펼친 채 고정 | 없음 | sweep 전환 |
| AG-A-023 | v-hero-glare 배너 카드 반사광 ([web/app/hero.css#L76,L152](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L76,L152)) | sweep 진입 | 0.8s (0, 0.1s, 0.2s 딜레이) | linear | translateX(0->150px), opacity 0->0.55->0 | 1회 both | 없음 | 없음 | 없음 |
| AG-A-024 | v-hcard-wobble 배너 카드 회전 ([web/app/hero.css#L79,L151](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L79,L151)) | sweep 진입 | 1.0s (0, 0.1s, 0.2s 딜레이) | ease-in-out | rotateY(0->-6deg->6deg->0) | 1회 both | 없음 | 없음 | 없음 |
| AG-A-025 | v-hero-float 배너 카드 부유 ([web/app/hero.css#L84,L153](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L84,L153)) | sweep 진입 | 3.2s | ease-in-out | translate(0, 3px -> -6px) | 무한 교대 | 정지 | 없음 | 없음 |
| AG-A-026 | v-hero-drift 배너 구슬 부유 ([web/app/hero.css#L92,L154](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L92,L154)) | 배너 표시 중 | 4.2s (스태거 0~-3.3s) | ease-in-out | translate(-3px, 6px -> 3px, -8px) | 무한 교대 | 정지 | 없음 | 없음 |
| AG-A-027 | v-hero-foil 박 반사 회전 ([web/app/hero.css#L60,L155](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L60,L155)) | 배너 표시 중 | 8.0s (스태거 0, -1.6s, -3.4s) | linear | transform: rotate(1turn) | 무한 루프 | 정지 | 없음 | 없음 |
| AG-A-028 | v-hero-twinkle 빛 조각 반짝임 ([web/app/hero.css#L109,L156](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L109,L156)) | sweep 진입 | 2.2s (스태거 0.1s~1.7s) | ease-in-out | scale, rotate, opacity | 무한 루프 | opacity: 0.7 정지 | 없음 | 없음 |
| AG-A-029 | 3D 구슬 WebGL 캔버스 렌더 ([web/components/home/heroBall.ts](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/home/heroBall.ts#L85-L127)) | RAF 루프 | 60fps (시간 기반 각도 연산) | 삼각함수 파동 | WebGL 셰이더 회전 매트릭스 uRot | 무한 루프 | 정지(단일 프레임) | 없음 | 화면 이탈 시 일시정지 |
| AG-A-030 | sheen-sweep 호버 샤인 (레거시) ([web/app/globals.css#L187-L192](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L187-L192)) | .sheen:hover | 900ms | cubic-bezier(0.16, 1, 0.3, 1) | translateX(-60% -> 60%) | 1회 | 없음 | 없음 | 없음 |
| AG-A-031 | ticker-scroll 라이브 티커 (레거시) ([web/app/globals.css#L225](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L225)) | 자동 실행 | 48s (모바일 80s) | linear | translateX(0 -> -50%) | 무한 루프 | 120s 느리게 회전 | 없음 | 호버 시 일시정지 |
| AG-A-032 | fx-coin 및 fx-confetti (레거시) ([web/app/globals.css#L381-L408](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L381-L408)) | MegaWinFX 마운트 | 2.2s ~ 3.2s | cubic-bezier, ease-in | translateY, rotate, rotateY | 1회 both | 축소 모션 시 미실행 | 없음 | 언마운트 시 자동 제거 |
| AG-A-033 | swipe-nudge 카테고리 스와이프 힌트 ([web/app/globals.css#L472-L480](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L472-L480)) | 자동 실행 | 1.6s | ease-in-out | translateX(0 -> 3px -> 0) | 무한 루프 | animation: none | 없음 | 없음 |
| AG-A-034 | hot-pulse 뱃지 펄스 (레거시) ([web/app/globals.css#L484-L490](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L484-L490)) | 자동 실행 | 1.8s | ease-in-out | box-shadow 반경 및 알파 | 무한 루프 | animation: none | 없음 | 없음 |
| AG-A-035 | rim-spin 림라이트 회전 (레거시) ([web/app/globals.css#L502-L512](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L502-L512)) | 카드 호버 시 | 2.6s | linear | conic-gradient 각도 360deg | 무한 루프 | animation: none | 없음 | 없음 |

---

## 4. 박스 개봉 타임라인 및 트랜잭션 확정 시점 (Box Opening Sequence)

[코드에서 읽음] [web/lib/opening.ts](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/opening.ts#L44-L116), [web/lib/openingFlow.ts](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/openingFlow.ts#L55-L140), [web/components/box/BoxScreen.tsx](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/box/BoxScreen.tsx#L140-L170), [web/components/box/Opening.tsx](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/box/Opening.tsx#L127-L152)

### 4.1 핵심 판정: 애니메이션 종료 이벤트와 장부 변경의 분리
[코드에서 읽음] **애니메이션 종료 이벤트는 잔액 차감이나 인벤토리 지급에 전혀 관여하지 않는다.**
- 지갑 차감, 추첨 결과 계산, 인벤토리 배정, 캐시백 자동 정산, 터짐 게이지 갱신 등 모든 비즈니스 로직과 원장(Ledger) 변경은 개봉 버튼을 누른 직후 실행되는 비동기 함수 `executeOpening()` 내부에서 일괄 커밋된다 ([web/lib/opening.ts#L71-L110](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/opening.ts#L71-L110)).
- `Opening.tsx` 및 `Reveal.tsx` 컴포넌트가 화면에 마운트되는 시점에는 이미 지갑 잔액이 차감되어 있고 결과 아이템이 인벤토리에 영속화되어 있다.
- 따라서 연출 도중 탭을 닫거나 새로고침하더라도 이미 지급된 결과는 안전하게 보존되며, 복귀 시 `openingJournal`과 인벤토리 대조를 통해 복구 모달로 결과를 다시 확인할 수 있다 ([web/components/box/BoxScreen.tsx#L112-L138](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/box/BoxScreen.tsx#L112-L138)).

### 4.2 단일 개봉(Single Opening) 정밀 타임라인
- AG-TL-001 [T = 0ms] 개봉 버튼 클릭 (`press()` 실행):
  - 동기 잠금 검사: `opening.current === true` 이면 즉시 차단 ([web/components/box/BoxScreen.tsx#L142](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/box/BoxScreen.tsx#L142))
  - 오디오 트리거: 사용자 제스처 동기 내에서 `soundPress()` 즉시 호출 (Web Audio AudioContext 활성화, 220Hz 트라이앵글 60ms) ([web/lib/openingSound.ts#L50-L54](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/openingSound.ts#L50-L54))
  - 고액 검사: 비용 50 USDT 이상이거나 수량 10개 이상이면 `NEEDS_CONFIRM` 이벤트 발생 후 확인창(Confirm) 모달을 띄우고 중단 ([web/components/box/BoxScreen.tsx#L164](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/box/BoxScreen.tsx#L164))
  - 일반 실행: `open()` 호출, 상태 `PURCHASE_PROCESSING` 전환 ([web/components/box/BoxScreen.tsx#L145](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/box/BoxScreen.tsx#L145))
- AG-TL-002 [T = 0 ~ 50ms 비동기 구간] 트랜잭션 커밋 (`executeOpening()` 완료):
  - 계정별 분산 락 `withLedgerLock` 획득 ([web/lib/opening.ts#L41](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/opening.ts#L41))
  - 서버 시드, 클라이언트 시드, 논스 기반 결과 계산
  - 잔액 차감 (`wallet.debitSplit(cost)`), 인벤토리 등록 (`inventory.add(...)`), 캐시백 정산 (`inventory.sell(...)` 및 `wallet.creditSplit(...)`), 터짐 게이지 갱신 (`wallet.setBurst(...)`), 거래내역 기록 (`wallet.addTransaction(...)`) 일괄 완료
  - 상태 `PURCHASE_OK`, `ANIMATION_START` 전이 후 상태 머신 `OPENING` 도달
  - `<Opening />` 마운트 ([web/components/box/BoxScreen.tsx#L319](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/box/BoxScreen.tsx#L319))
- AG-TL-003 [T = 50ms (연출 기준 t = 0)] 1단계 기대(Anticipation):
  - 일반 모드: 520ms 지속 (짧게 보기 모드: 220ms)
  - CSS 단계: `[data-phase="anticipation"]`
  - 시각 효과: 상자가 8px 내려앉고 0.93배로 축소(`v-op-settle`), 봉인 별이 90도 회전(`v-op-wind`), 뚜껑이 2회 들썩임(`v-op-strain`)
  - 사용자 인터랙션: 하단 "결과 바로 보기" 링크 클릭 또는 Esc 키 입력 시 即時 `skip()` 발동하여 4단계로 점프
- AG-TL-004 [T = 570ms (연출 t = 520ms)] 2단계 충격(Impact):
  - 일반 모드: 150ms 지속 (짧게 보기 모드: 110ms)
  - CSS 단계: `[data-phase="impact"]`
  - 오디오 및 햅틱: `soundOpen()` 발동 (화이트 노이즈 2400Hz 50ms 딸깍 + 92Hz 사인파 200ms 뚜껑 울림 + 700Hz 120ms 스치는 소리), 기기 진동 12ms 1회 실행 ([web/lib/openingSound.ts#L57-L78](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/openingSound.ts#L57-L78))
  - 시각 효과: 상자가 위로 -6px 튀어오름(`v-op-pop`), 뚜껑이 뒤로 112도 회전하여 젖혀짐, 봉인이 앞으로 튕겨 떨어짐, 상자 틈새 빛이 당첨 배수에 따라 투명도 0.2~0.95로 점등
- AG-TL-005 [T = 720ms (연출 t = 670ms)] 3단계 퇴장(Exit):
  - 일반 모드: 170ms 지속 (짧게 보기 모드: 120ms)
  - CSS 단계: `[data-phase="exit"]`
  - 시각 효과: 상자 몸체와 뚜껑이 아래(34px)로 이동하며 0.8배로 축소되고 불투명도 0으로 소멸(`v-op-leave`)
- AG-TL-006 [T = 890ms (연출 t = 840ms, revealAt)] 4단계 결과 공개(Reveal):
  - 일반 모드 기준 revealAt = 520 + 150 + 170 = 840ms (짧게 보기 모드 기준: 450ms)
  - CSS 단계: `[data-phase="reveal"]`
  - 상태 머신: `onRevealed()` 호출 -> `markSeen(openingId)` 기록, `ANIMATION_END` -> `SETTLE_START` -> `SETTLE_OK` 전이
  - 오디오: `soundResult()` 발동 (기존 대비 당첨 톤에 따라 화음 재생. 본전 이하는 무음, above: 2음, high: 3음, top: 4음 글리산도) ([web/lib/openingSound.ts#L66-L72](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/openingSound.ts#L66-L72))
  - 시각 효과: 당첨 상품 및 차액 안내 동시 등장(`v-op-in`), 바닥 광원 확장, 상단 잔액 테두리 핑(`v-op-ping`), 20배 이상 최고 상품일 경우 상품 사진 푸시(`v-op-push` 2.2s) 및 후광(`v-op-halo` 1.5s) 작동
  - 안전 지연 윈도우: `OPENING_ARM_DELAY_MS = 350ms` 타이머 작동. 이 시간 동안 하단 액션 영역은 `pointer-events: none` 이며 주 버튼이 비활성화되어 건너뛰기 연타로 인한 오클릭을 원천 차단함 ([web/app/opening.css#L106-L107](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L106-L107))
- AG-TL-007 [T = 1240ms (연출 t = 1190ms, armAt)] 5단계 준비 완료(Ready / 차기 개봉 가능):
  - CSS 단계: `[data-phase="ready"]`, 하단 액션 영역 `data-armed="true"` 부여
  - 상단 닫기 X 버튼 노출, 하단 "한 번 더 열기" 버튼 활성화
  - 자동 USDT 수령(`autoTake`) 설정이 켜져 있는 경우 백그라운드에서 `settleTake()` 실행되어 잔액으로 즉시 환전
  - 사용자가 다시 "한 번 더 열기"를 누를 수 있는 상태로 완전 복귀

### 4.3 다중 개봉(Multi Opening) 타임라인
- AG-TL-010 [T = 0ms ~ T = 50ms]: `executeOpening(box, count)`에 의해 N개 결과 전체의 자금 차감 및 인벤토리 할당이 동기 커밋됨.
- AG-TL-011 [T = 50ms ~ T = 890ms]: `<Reveal />` 컴포넌트 마운트. 단일 개봉과 동일한 3D 상자(`OpeningBox`)가 anticipation(520ms) -> impact(150ms) -> exit(170ms) 순서로 연출되며 하단에 개봉 수량이 표시됨.
- AG-TL-012 [T = 890ms (revealAt)]: 결과 리스트 노출. 각 결과 행(`.v-resultrow`)은 CSS 스태거 지연(`animationDelay = Math.min(i * 0.06, 0.6)s`)에 따라 위로 떠오름.
- AG-TL-013 [T = 1240ms (armAt = 890 + 350ms)]: 350ms 무장 지연 후 `armed = true` 로 전환되어 하단 "USDT로 받기" 또는 "한 번 더 열기" 버튼이 활성화됨.

---

## 5. 인터랙티브 상태별 스타일 전수조사 (Interactive Element Styles)

[코드에서 읽음] [web/app/ui.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css), [web/app/take.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/take.css), [web/app/opening.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css), [web/app/footer.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/footer.css)

### 5.1 전역 기본 스타일
- AG-I-001 Focus-Visible: `:focus-visible { outline: 2px solid var(--v-title); outline-offset: 2px; }` ([web/app/ui.css#L15](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L15))
- AG-I-002 Selection: `::selection { background: var(--v-selected); color: var(--v-on-primary); }` ([web/app/ui.css#L9](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L9))
- AG-I-003 스크롤바 호버: `::-webkit-scrollbar-thumb:hover { background: var(--v-selected); }` ([web/app/ui.css#L14](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L14))
- AG-I-004 입력 필드 포커스: `.v-input:focus { border-color: var(--v-selected); }` ([web/app/ui.css#L102](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L102))

### 5.2 컴포넌트 클래스별 인터랙션 스타일

#### 1) `.v-btn` (주 단추) ([web/app/ui.css#L59-L63](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L59-L63))
- Default: `background: var(--v-primary); color: var(--v-on-primary); border-radius: var(--v-r-pill); min-height: var(--v-btn-h); cursor: pointer;`
- Hover: `background: var(--v-primary-hover);`
- Active: `transform: scale(0.985);`
- Disabled / `aria-disabled="true"`: `background: var(--v-pill); color: var(--v-mute); cursor: default; transform: none;`
- Loading / `data-busy="true"`: `background: var(--v-pill); color: var(--v-sub); cursor: progress;`

#### 2) `.v-btn--quiet` (보조 단추) ([web/app/ui.css#L64-L65](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L64-L65))
- Default: `background: var(--v-pill); color: var(--v-text);`
- Hover: `background: var(--v-pill-hover);`

#### 3) `.v-link` (밑줄 링크) ([web/app/ui.css#L68-L69](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L68-L69))
- Default: `color: var(--v-sub); font-size: var(--v-fs-small); text-decoration: underline; text-underline-offset: 3px; min-width: 44px; min-height: 44px;`
- Hover: `color: var(--v-title);`

#### 4) `.v-chip` (선택 알약) ([web/app/ui.css#L76-L78](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L76-L78))
- Default: `background: var(--v-pill); color: var(--v-text); border: 2px solid transparent;`
- Hover: `background: var(--v-pill-hover);`
- Selected (`aria-pressed="true"` 또는 `aria-checked="true"`): `border-color: var(--v-selected); color: var(--v-title);`

#### 5) `.v-headbtn` (헤더 버튼) ([web/app/ui.css#L37-L38](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L37-L38))
- Default: `background: var(--v-pill); color: var(--v-text); height: 44px;`
- Hover: `background: var(--v-pill-hover);`

#### 6) `.v-nav a` (헤더 메뉴 링크) ([web/app/ui.css#L35-L36](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L35-L36))
- Default: `color: var(--v-sub); min-height: 44px;`
- Hover / Active (`aria-current="page"`): `color: var(--v-title);`

#### 7) `.v-back` (뒤로가기 버튼) ([web/app/ui.css#L51-L52](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L51-L52))
- Default: `color: var(--v-text); width: 44px; height: 44px;`
- Hover: `background: var(--v-pill);`

#### 8) `.v-sheet-close` (시트 닫기 버튼) ([web/app/ui.css#L121-L122](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L121-L122))
- Default: `background: var(--v-pill); color: var(--v-text);`
- Hover: `background: var(--v-pill-hover);`

#### 9) `.v-boxcard` (박스 카드) ([web/app/ui.css#L146-L147](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L146-L147))
- Default: `background: transparent; border: 1px solid var(--v-outline);`
- Hover: `background: var(--v-photo);`

#### 10) `.v-hscroll-btn` (가로 스크롤 좌우 이동 단추) ([web/app/ui.css#L172-L173](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L172-L173))
- Default: `background: var(--v-pill); color: var(--v-title); border: 1px solid var(--v-outline);`
- Hover: `background: var(--v-pill-hover);`

#### 11) `.v-row--link` 및 `.v-itemrow` (행 링크 및 상품 행) ([web/app/ui.css#L90-L91,L368](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L90-L91,L368))
- Default: `color: var(--v-sub);`
- Hover: `.v-row--link:hover > :first-child { color: var(--v-title); }`, `.v-itemrow:hover .v-card-title { text-decoration: underline; text-underline-offset: 3px; }`

#### 12) `.v-check` (체크박스) ([web/app/take.css#L5-L6](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/take.css#L5-L6))
- Default: `border: 2px solid var(--v-outline); border-radius: 8px;`
- Selected (`aria-checked="true"` 또는 `mixed`): `border-color: var(--v-selected);`

#### 13) `.v-op-choice` 및 `.v-op-toggle` (개봉 옵션 토글) ([web/app/opening.css#L61-L69](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L61-L69))
- Default: `border: 2px solid transparent; background: var(--v-pill);`
- Hover: `background: var(--v-pill-hover);`
- Selected (`aria-checked="true"`): `border-color: var(--v-selected);`, 텍스트 `color: var(--v-title);`

#### 14) `.v-rowlink` (테이블 행 내 링크) ([web/app/take.css#L25-L26](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/take.css#L25-L26))
- Hover: `> :first-child { text-decoration: underline; text-underline-offset: 3px; }`

#### 15) `.v-footer a`, `.v-footer button` ([web/app/footer.css#L11](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/footer.css#L11))
- Hover: `text-decoration: underline; text-underline-offset: 3px;`

#### 16) `.v-line--fail` (에러 상태 텍스트) ([web/app/ui.css#L110](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L110))
- Error: `color: var(--v-fail); font-size: var(--v-fs-body); line-height: 1.5;`

---

## 6. 오버레이, 팝업, 피드백 상태 전수조사 (Overlay & State Registry)

[코드에서 읽음] [web/components/ui/Sheet.tsx](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/ui/Sheet.tsx), [web/components/ui/toast.tsx](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/ui/toast.tsx), [web/lib/useModal.ts](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/useModal.ts), [web/components/shell/StateScreens.tsx](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/shell/StateScreens.tsx)

### 6.1 모달 및 시트 공통 동작 매커니즘 (Modal Architecture)
- AG-U-001 스크롤 잠금 (Scroll Lock):
  `useModal` 훅에 의해 최상위 모달 오픈 시 `document.body.style.overflow = "hidden"` 처리되며, 모달 스택이 0이 되면 원래 스타일로 복원된다 ([web/lib/useModal.ts#L34-L36,L79](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/useModal.ts#L34-L36,L79)).
- AG-U-002 포커스 트랩 (Focus Trap):
  `useModal` 은 모달 패널 내 활성 가능한 요소(`button`, `a`, `input`, `select`, `textarea`, `summary`, `tabindex`)를 수집하고 Tab 및 Shift+Tab 키 입력을 가로채 순환 포커스를 강제한다 ([web/lib/useModal.ts#L53-L67](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/useModal.ts#L53-L67)).
- AG-U-003 키보드 닫기 (Escape):
  `keydown` 이벤트에서 `event.key === "Escape"` 감지 시 이벤트 전파를 즉시 중단하고 `onClose` 콜백을 호출한다 ([web/lib/useModal.ts#L48-L52](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/useModal.ts#L48-L52)).
- AG-U-004 외부 클릭 닫기 (Outside Click):
  `.v-scrim` 의 `onMouseDown` 핸들러에서 `e.target === e.currentTarget && locked === false` 일 때만 닫기를 실행한다 ([web/components/ui/Sheet.tsx#L17](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/ui/Sheet.tsx#L17)).
- AG-U-005 중첩 모달 관리 (Stack Management):
  `modalStack` 배열로 모달 계층을 관리하며, 하위 모달에 가려진 상위 모달에는 `inert` 속성과 `aria-hidden="true"` 를 동적으로 주입하여 스크린 리더와 탭 순서에서 완벽히 격리한다 ([web/lib/useModal.ts#L10-L19](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/lib/useModal.ts#L10-L19)).

### 6.2 코드에 존재하는 시트/모달/오버레이 목록
- AG-U-010 `Sheet` ([web/components/ui/Sheet.tsx#L12](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/ui/Sheet.tsx#L12)): 공통 겹침 화면 (모바일 바텀 시트, 데스크톱 가운데 다이얼로그)
- AG-U-011 `Confirm` ([web/components/ui/Sheet.tsx#L32](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/ui/Sheet.tsx#L32)): 되돌릴 수 없는 결정 확인창 (`role="alertdialog"`)
- AG-U-012 `Opening` ([web/components/box/Opening.tsx#L61](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/box/Opening.tsx#L61)): 단일 개봉 전체 화면 오버레이 (`role="dialog"`, `aria-modal="true"`)
- AG-U-013 `Reveal` ([web/components/box/Reveal.tsx#L37](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/box/Reveal.tsx#L37)): 다중 개봉 전체 화면 오버레이 (`role="dialog"`, `aria-modal="true"`)
- AG-U-014 `ChargeSheet` ([web/components/flow/ChargeSheet.tsx#L18](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/flow/ChargeSheet.tsx#L18)): USDT 입금 QR 및 주소 안내 시트
- AG-U-015 `BalanceSheet` ([web/components/flow/BalanceSheet.tsx#L20](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/flow/BalanceSheet.tsx#L20)): 헤더 잔액 클릭 시 열리는 잔액 현황 및 빠른 조치 시트
- AG-U-016 `LoginSheet` ([web/components/flow/LoginSheet.tsx#L18](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/flow/LoginSheet.tsx#L18)): 이메일, 소셜 로그인, 비밀번호 재설정 시트
- AG-U-017 `TakeSheet` ([web/components/flow/TakeSheet.tsx#L59](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/flow/TakeSheet.tsx#L59)): 보관 상품 USDT 대량/단일 전환 선택 시트
- AG-U-018 `TakeConfirm` ([web/components/flow/TakeSheet.tsx#L52](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/flow/TakeSheet.tsx#L52)): USDT 전환 최종 확인창
- AG-U-019 `ShipSheet` ([web/components/flow/ShipSheet.tsx#L19](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/flow/ShipSheet.tsx#L19)): 실물 배송 신청 주소 입력 시트
- AG-U-020 `VerifySheet` ([web/components/flow/VerifySheet.tsx#L30](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/flow/VerifySheet.tsx#L30)): 결과 3단계 검증 상세 시트
- AG-U-021 `ReviewSheet` ([web/components/flow/ReviewSheet.tsx#L15](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/flow/ReviewSheet.tsx#L15)): 개봉 후기 작성 및 조회 시트
- AG-U-022 `OpeningSettings` ([web/components/box/Opening.tsx#L332](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/box/Opening.tsx#L332)): 개봉 소리, 빠른 연출, 자동 USDT 수령 토글 시트
- AG-U-023 모바일 메뉴 시트 ([web/components/shell/AppShell.tsx#L60](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/shell/AppShell.tsx#L60)): 900px 미만에서 햄버거 메뉴 누를 때 열리는 내비게이션 시트
- AG-U-024 계정 설정 시트군: `NicknameSheet`, `PasswordSheet`, `CloseAccountSheet` ([web/components/account/AccountSheets.tsx](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/account/AccountSheets.tsx)), `TwoFactorSetup` ([web/components/account/AccountScreen.tsx#L75](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/account/AccountScreen.tsx#L75))

### 6.3 기타 상태 요소 (Toast, Accordion, Tab, Skeleton, Empty, Error)
- AG-U-030 토스트 (`ToastHost`, `useToast`):
  [web/components/ui/toast.tsx](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/ui/toast.tsx#L17-L25)
  화면에 흔적이 남지 않는 결과("주소를 복사했습니다")에만 사용. 2.4초 자동 소멸 타이머. 아이콘과 색상 없이 `#303030` 배경에 단일 텍스트.
- AG-U-031 아코디언 (`.v-notes`):
  [web/components/box/BoxScreen.tsx](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/box/BoxScreen.tsx), [web/app/ui.css#L333-L337](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L333-L337)
  HTML5 표준 `<details>` 및 `<summary>` 로 구현. 브라우저 기본 마커 숨김 처리 후 밑줄 링크 모양으로 표시.
- AG-U-032 탭 (`Chips`):
  [web/components/ui/kit.tsx#L35-L43](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/ui/kit.tsx#L35-L43)
  `role="group"` 과 `aria-pressed` 속성을 갖는 알약 단추 그룹. 누르면 확인 단계 없이 즉시 상태가 전환됨.
- AG-U-033 스켈레톤 (`Skeleton`, `.v-skel`):
  [web/components/ui/kit.tsx#L85-L87](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/ui/kit.tsx#L85-L87)
  돌아가는 스피너 대신 레이아웃 이동(CLS)을 막기 위해 높이를 지정하여 자리를 유지하며 은은한 펄스(`v-pulse`) 애니메이션 적용.
- AG-U-034 빈 상태 (`Empty`, `.v-empty`):
  [web/components/ui/kit.tsx#L80-L82](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/ui/kit.tsx#L80-L82)
  `text-wrap: balance` 와 함께 화면 중앙에 담담한 한 문장으로 안내.
- AG-U-035 실패 및 상태 한 줄 (`Line`, `.v-line`, `.v-line--fail`):
  [web/components/ui/kit.tsx#L76-L78](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/ui/kit.tsx#L76-L78)
  팝업 경고창 대신 인라인에서 빨간색 글자(`--v-fail`)로 상태와 해결책 안내 (`role="alert"` 또는 `role="status"`).
- AG-U-036 오프라인 및 세션 만료 바 (`OfflineLine`, `SessionLine`):
  [web/components/shell/StateScreens.tsx#L37-L57](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/shell/StateScreens.tsx#L37-L57)
  네트워크 끊김 감지 시 헤더 바로 밑에 나타나는 단일 인라인 띠.

---

## 7. 반응형 규칙 전수조사 (Responsive Rules Matrix)

[코드에서 읽음] 다음 표는 미디어 쿼리별 스타일 변화를 종합 정리한 결과다.

| 미디어 쿼리 | 대상 선택자 | 변경되는 스타일 및 레이아웃 | 정의된 파일 및 위치 |
|---|---|---|---|
| `max-width: 359px` | `.v-itemrow-photo` | 사진 너비 높이를 52px에서 44px로 축소 | [web/app/ui.css#L373](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L373) |
| `max-width: 359px` | `.v-itemrow-meta` | 메타 정보 영역 최대 폭을 40%에서 46%로 확대 | [web/app/ui.css#L373](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L373) |
| `max-width: 359.98px` | `.v-hero-stage` | 스테이지 높이 178px, 축척 `--s: 0.64`, 오프셋 `--o: 0.54`로 축소 | [web/app/hero.css#L124](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L124) |
| `max-width: 380px` | `.site-header-logo` | 헤더 로고 텍스트 크기 23px 축소 | [web/app/globals.css#L56](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L56) |
| `max-height: 700px` | `.v-op-gauge` | 작은 휴대폰 세로 화면에서 게이지 줄 숨김 (`display: none`) | [web/app/opening.css#L144](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L144) |
| `max-height: 700px` | `.v-op-photo` | 힌트 추가 시 사진 너비 `min(82%, 400px)` 로 축소하여 겹침 방지 | [web/app/take.css#L20](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/take.css#L20) |
| `min-width: 640px` | `.v-boxgrid` | 그리드 갭 12px에서 16px로 확장 | [web/app/ui.css#L207](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L207) |
| `min-width: 640px` | `.v-boxcard-body` | 박스 카드 내부 패딩 `16px 20px 20px` 로 확대 | [web/app/ui.css#L208](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L208) |
| `max-width: 639px` | `.ticker-track` | 티커 애니메이션 속도를 48s에서 80s로 감속 | [web/app/globals.css#L230](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L230) |
| `min-width: 720px` | `.v-op-top` | 개봉 화면 헤더 높이 68px->84px, 좌우 패딩 16px->32px | [web/app/opening.css#L13](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/opening.css#L13) |
| `min-width: 720px` | `.v-hero` | 1열 세로 스택에서 2열 그리드로 전환, 높이 300px, 타이틀 48px | [web/app/hero.css#L125-L131](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/hero.css#L125-L131) |
| `min-width: 720px` | `.v-footer` | 패딩 `--pad: 32px`, 2열 그리드, 칼럼 4열 분할 | [web/app/footer.css#L26-L32](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/footer.css#L26-L32) |
| `min-width: 720px` | `.v-hscroll > ul` | 가로 스크롤 좌우 페이드 너비 40px에서 72px로 확장 | [web/app/scroll-fade.css#L8](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/scroll-fade.css#L8) |
| `max-width: 767px` | `:root` | `--v-r-card: 20px`, `--v-fs-title: 28px`, `--v-fs-desc: 16px` 로 축소 | [web/app/tokens.css#L74-L80](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/tokens.css#L74-L80) |
| `min-width: 768px` | `.v-header-in` | 헤더 높이 56px에서 64px로 확대 | [web/app/ui.css#L39](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L39) |
| `min-width: 768px` | `.v-scrim`, `.v-sheet` | 하단 바텀 시트에서 화면 정중앙 모달 창으로 전환, 최대폭 480px(와이드 640px) | [web/app/ui.css#L125-L131](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L125-L131) |
| `min-width: 768px` | `.v-boxhero` | 박스 히어로 이미지 비율 2:1에서 16:9로 전환 | [web/app/ui.css#L215](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L215) |
| `min-width: 768px` | `.v-strip > li` | 사진 띠 아이템 너비 폭 44%에서 22%로 축소 | [web/app/ui.css#L244](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L244) |
| `min-width: 768px` | `.v-items--l/m/s` | 구성품 그리드 칼럼 수 2->3열(l), 3->4열(m), 3->6열(s)로 확대 | [web/app/ui.css#L274-L280](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L274-L280) |
| `min-width: 768px` | `.v-reveal-result` | 결과 화면 모바일 flex 채움에서 데스크톱 정렬로 전환, 액션 바 static 배치 | [web/app/ui.css#L354-L358](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L354-L358) |
| `min-width: 768px` | `.v-take-foot` | 하단 스티키 바 모서리를 모달 반경에 맞춰 라운드 처리 (`border-radius`) | [web/app/take.css#L14](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/take.css#L14) |
| `min-width: 900px` | `.v-nav`, `.v-menu-btn` | GNB 내비게이션 7개 항목 펼침 표시, 햄버거 메뉴 버튼 숨김 (`display: none`) | [web/app/ui.css#L41](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L41) |
| `max-width: 1023.98px` | `.v-app:has(...) .v-footer` | 하단 고정 열기 바로 인해 푸터 내용 가림 방지 위해 패딩 바텀 170px 또는 260px 부여 | [web/app/ui.css#L321](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L321), [web/app/take.css#L22](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/take.css#L22) |
| `min-width: 1024px` | `.v-boxgrid` | 박스 목록 2열에서 3열 그리드로 전환 | [web/app/ui.css#L210](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L210) |
| `min-width: 1024px` | `.v-boxlayout` | 1열 흐름 배치에서 좌측 본문 + 우측 380px 고정 스티키 결정 바로 2열 분할 | [web/app/ui.css#L339-L347](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L339-L347) |
| `hover: hover and pointer: fine` | `.v-hscroll-btn` | 마우스 커서 환경에서만 가로 스크롤 이동 화살표 단추 표시 | [web/app/ui.css#L176](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L176) |

---

## 8. 언어별 문구 길이 및 레이아웃 오버플로 위험 분석 (Typography & I18N Wrap)

[코드에서 읽음] [web/app/globals.css](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L65-L80), [web/messages/v.ko.json](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/messages/v.ko.json), [web/messages/v.en.json](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/messages/v.en.json), [web/messages/v.zh.json](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/messages/v.zh.json)

### 8.1 언어별 전역 줄바꿈 규칙
[코드에서 읽음] [web/app/globals.css#L65-L80](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/globals.css#L65-L80)
- 한국어 (`html[lang="ko"] body`): `word-break: keep-all; overflow-wrap: break-word;` (단어 단위 유지, 부모 폭 넘칠 때만 끊김)
- 영어 (`html[lang="en"] body`): `overflow-wrap: break-word; letter-spacing: -0.01em;` (단어 끊김 방지 및 약간 조인 자간)
- 중국어 (`html[lang^="zh"] body`): `word-break: break-all;` (중국어는 띄어쓰기가 없으므로 글자 단위 줄바꿈 강제)

### 8.2 고정 폭 및 글자 수 차이로 인한 위험 구역 10선
- AG-TX-001 상단 GNB 내비게이션 바 (768px ~ 899px 폭):
  [코드에서 읽음] [web/app/ui.css#L40-L41](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L40-L41)
  한국어("박스", "보관함", "지갑", "나온 상품", "개봉 결과 검증", "이용 방법", "계정")는 짧으나, 영어("Boxes", "Inventory", "Wallet", "Recent results", "Verify result", "How it works", "Account")는 글자 수가 2배 이상 길어져 768px에서 줄바꿈이 발생한다. 이로 인해 소스 상에서 900px 이전에는 GNB를 숨기고 햄버거 메뉴 단추(`.v-menu-btn`)를 유지하도록 강제하고 있다.
- AG-TX-002 메인 홈 박스 카드 대표 상품명 (`.v-boxcard-nophoto`):
  [코드에서 읽음] [web/app/ui.css#L201](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L201)
  `-webkit-line-clamp: 3;` 가 걸려 있다. 영문 포켓몬 카드명(세트명, 카드 번호 포함)의 경우 3줄을 초과하여 말줄임표(...)로 잘리는 반면, 한국어는 카드 번호가 생략되어 2줄 이내로 표시된다.
- AG-TX-003 구성품 카드 상품명 (`.v-item-name`):
  [코드에서 읽음] [web/app/ui.css#L227](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L227)
  `-webkit-line-clamp: 2; min-height: 2.8em;` 가 지정되어 있다. 영문 긴 단어는 2줄을 채우고 잘릴 수 있으며, 높이가 고정되어 있어 타일 간의 높이 단차는 방지된다.
- AG-TX-004 상품 행 테이블 값 영역 (`.v-row > :last-child`):
  [코드에서 읽음] [web/app/ui.css#L89](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L89)
  `max-width: 70%; word-break: keep-all;`
  한국어 설명("무료, 배송 가능 나라 2곳")과 영어 설명("Free to 2 countries (chosen on the shipping sheet)")의 길이 차이로 인해 영어에서는 2~3줄로 접히며 행 높이가 증가한다.
- AG-TX-005 보관함 행 상품 메타 (`.v-itemrow-meta`):
  [코드에서 읽음] [web/app/ui.css#L272,L373](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L272,L373)
  `max-width: 40%` (초소형 화면 46%).
  금액과 상태 텍스트("보관 중" 3자 vs "In storage" 10자, "확인 필요" vs "Needs review")의 길이 차이로 영문에서 줄바꿈이 빈번히 발생한다.
- AG-TX-006 개봉 결과 금액 숫자 (`.v-reveal-value`):
  [코드에서 읽음] [web/app/ui.css#L297-L300](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L297-L300)
  `white-space: nowrap;` 가 적용되어 단위와 숫자가 분리되지 않는다. 큰 금액(예: 300,000 USDT)이나 원화 표기(₩400,000,000)일 때 `data-size="sm"`(28px)으로 줄이지 않으면 모바일 320px에서 좌우 넘침이 발생할 수 있다.
- AG-TX-007 배수 표기 방식:
  [코드에서 읽음] [web/components/box/WinsScreen.tsx#L52-L53](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/components/box/WinsScreen.tsx#L52-L53)
  중국어 번역 `"{n} 倍"`의 경우 공백이 있어 숫자와 글자가 분리되는 현상이 발생하여, 코드 상에서 반드시 `<span className="v-num">` 으로 감싸 줄바꿈을 방지하도록 처리되어 있다.
- AG-TX-008 주 단추 라벨 텍스트:
  [코드에서 읽음] [web/messages/v.ko.json#L57](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/messages/v.ko.json#L57), [web/messages/v.en.json#L57](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/messages/v.en.json#L57)
  한국어 `"{amount} 언박싱"` 대비 영어 `"Unbox # for {amount}"`의 경우 ICU 복수형 문구와 통화 표기 위치가 달라 버튼 너비가 영어에서 더 넓게 팽창한다.
- AG-TX-009 후기 카드 본문 (`.v-rvcard-text`):
  [코드에서 읽음] [web/app/ui.css#L183](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/ui.css#L183)
  `-webkit-line-clamp: 3; min-height: calc(var(--v-fs-body) * 1.5 * 3);`
  영어 원문 리뷰가 길 경우 3줄에서 엄격히 잘리며, 한국어 번역문은 밀도가 높아 2줄 만에 끝나더라도 최소 높이(min-height)를 통해 카드 높이가 통일된다.
- AG-TX-010 USDT 충전 및 받기 힌트 줄 (`.v-take-hint`):
  [코드에서 읽음] [web/app/take.css#L17-L18](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/web/app/take.css#L17-L18)
  `word-break: keep-all; overflow-wrap: anywhere; text-wrap: balance;`
  좁은 모바일 화면(360px 이하)에서 영문의 긴 금융 설명이 개행될 때 낱말 분절이 일어날 수 있다.

---

## 9. 픽셀 비교 검증 시 통제해야 할 10대 동적 변수 (Pixel Diff Control Factors)

[코드에서 읽음 및 추정] 동일 커밋 혹은 두 빌드 간 스크린샷 Diff(Playwright 등)를 수행할 때 불필요한 시각적 차이를 만들어내는 상위 10대 요인은 다음과 같다.

- AG-DIF-001 시간 의존 텍스트 및 상대 시간 (Time-Dependent Strings)
  - 근거: `WalletScreen.tsx` 의 72시간 락 카운트다운(`holdCountdown`), `WinsScreen.tsx` 및 `ReviewCard` 의 타임스탬프(`new Intl.DateTimeFormat`, `stamp(r.at)`), `InventoryScreen.tsx` 의 취득일시.
  - 통제 방안: 테스트 실행 시 `Date.now()` 및 `Intl.DateTimeFormat` 시스템 시계를 고정된 시점(예: 2026-10-12T00:00:00Z)으로 모킹해야 한다.
- AG-DIF-002 무작위 난수 및 고유 ID 생성 (PRNG Seeds & Random IDs)
  - 근거: `ShipSheet.tsx` 의 `crypto.randomUUID()`, `MegaWinFX.tsx` 의 `rnd()` 기반 컨페티 60개 위치 및 회전각(`Math.random()`), `heroBall.ts` 의 노이즈 함수.
  - 통제 방안: `Math.random` 및 `crypto.randomUUID` 를 고정 시드(Lax PRNG)로 치환해야 한다.
- AG-DIF-003 애니메이션 프레임 및 RAF 상태 (Animation Frames & Timers)
  - 근거: 홈 배너의 카드 부유(`v-hero-float`), 3D 포켓몬 볼의 WebGL 회전(`requestAnimationFrame`), 라이브 티커 무한 롤링, 스켈레톤 펄스(`v-pulse`).
  - 통제 방안: 캡처 브라우저에서 `prefers-reduced-motion: reduce` 에뮬레이션을 켜거나 CSS 애니메이션 시간을 0으로 고정해야 한다.
- AG-DIF-004 지연 로딩 이미지 및 비동기 디코딩 (Lazy Loading & Async Images)
  - 근거: 박스 카드의 6번째 이후 이미지 `<img loading="lazy" decoding="async">`, 구성품 타일 이미지, 리뷰 썸네일.
  - 통제 방안: 스크린샷 촬영 전 모든 이미지가 완전 디코딩되었는지 `HTMLImageElement.decode()` 완료를 대기하고 뷰포트 내로 스크롤하여 로드를 강제해야 한다.
- AG-DIF-005 웹 폰트 로딩 및 텍스트 렌더링 깜빡임 (FOUT / FOIT)
  - 근거: `layout.tsx` 의 `PretendardVariable.woff2` 로컬 폰트 로드. `display: "swap"` 설정으로 인해 로드 전 시스템 기본 폰트와 교체되는 찰나의 픽셀 차이 발생 가능.
  - 통제 방안: `document.fonts.ready` 프로미스가 완전히 resolve 된 후 캡처를 수행해야 한다.
- AG-DIF-006 브라우저 스크롤 위치 및 스티키 헤더/바 상태 (Scroll Offset & Sticky State)
  - 근거: `.v-header` (sticky top: 0), `.v-openbar` (fixed bottom), 모바일 푸터 패딩 보정(`:has(.v-openbar)`).
  - 통제 방안: 스크롤 좌표를 (0, 0)으로 명시적 초기화하고 스크롤 컨테이너의 잔여 오프셋을 제거해야 한다.
- AG-DIF-007 통화 단위 및 환율 상태 (Currency Display Toggle)
  - 근거: `useCurrency` 스토어의 `currency` 값 (USD 기본 vs KRW 전환). 로컬 스토리지에 남아 있는 상태에 따라 모든 상품 가격이 `$50` 또는 `₩67,000` 으로 분기됨.
  - 통제 방안: 테스트 실행 전 `localStorage`의 `voila-currency` 및 통화 상태를 USD 로 일괄 고정해야 한다.
- AG-DIF-008 로컬 스토리지 영속화 상태 (Zustand LocalStorage State)
  - 근거: `wallet-store`, `inventory-store`, `auth-store`, `openingJournal`. 이전에 개봉하고 확인하지 않은 결과가 남아 있으면 박스 화면에 복구 배너(`.v-line`)가 뜨고 열기 버튼 라벨이 변경됨.
  - 통제 방안: 각 테스트 시나리오 시작 전 `localStorage.clear()` 로 완전 격리된 초기 계정 상태를 주입해야 한다.
- AG-DIF-009 디바이스 픽셀 비율 (Device Pixel Ratio, DPR)
  - 근거: `HeroBanner.tsx` 의 WebGL 캔버스 해상도(`Math.min(window.devicePixelRatio || 1, 2)`), 1px 미세 테두리(`rgba(255,255,255,0.15)`), 안티앨리어싱 서브픽셀 렌더링.
  - 통제 방안: Playwright 실행 시 `deviceScaleFactor: 1` (또는 2)로 일치시키고 브라우저 렌더러 버전을 동일하게 유지해야 한다.
- AG-DIF-010 언어 및 URL 경로 (Locale / URL Path)
  - 근거: `/ko/`, `/en/`, `/zh/` 라우트에 따라 레이아웃 줄바꿈 규칙과 문구 너비가 완전히 상이함.
  - 통제 방안: 시각 비교는 반드시 3개 언어 경로를 각각 독립된 1:1 대조군으로 분리하여 실행해야 한다.
