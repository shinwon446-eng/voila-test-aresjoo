# 2차 QA 검수 보고서: 시각, 인터랙션, 애니메이션 (AGY)

검수자: 시각, 인터랙션, 애니메이션 책임자 (AGY)
검수 일시: 2026-10-13
대상 빌드:
- ORIGINAL (기준 커밋 63445c7, 정적 서빙): http://127.0.0.1:4175/voila-test-aresjoo/
- RESULT (브랜치 migration-result, 정적 서빙): http://127.0.0.1:4176/voila-test-aresjoo/

이 문서는 3회 검수 사이클 중 제2차 검수 보고서이며, RESULT 빌드의 시각 렌더링, 인터랙션, 애니메이션을 ORIGINAL 빌드와 1대1 전수 대조한 결과를 기록한다.

---

## 1. 개요 및 검증 요약

### 1.1 검증 방법론 및 분류 기준
모든 검증 결과는 아래 네 가지 출처로 엄격히 구분하여 기술하였다.
1. 화면에서 본 것: 브라우저 실제 렌더링 화면 및 캡처 프레임에서 직접 확인한 시각 상태
2. 코드에서 읽은 것: TypeScript/React/CSS 소스 코드와 커밋 기록에서 확인한 사실
3. 직접 실행한 것: foreground 콘솔에서 직접 수행한 명령과 그 실행 결과
4. 추측: 관측 데이터에 기반하여 추론한 내용

모든 결함과 차이는 MISSION.md 규정에 따라 P0에서 P3 등급으로 분류하고, 성격을 다음 셋 중 하나로 명시하였다.
- 원본과의 차이 (의도하지 않은 차이)
- 의도한 변경 안의 품질 문제
- 원본에도 있는 불변 성질

### 1.2 의도된 5대 변경 영역과 검증 기준
REDESIGN_BRIEF.md 및 MIGRATION_SPEC.md에서 규정한 의도된 변경은 다음 5가지이며, 이 외의 모든 화면과 동작은 ORIGINAL과 동일해야 한다.
1. 샘플 후기: 박스 상세 후기 구역, /reviews 화면, 홈 박스 카드의 별점 표기(4.3 (101)), 후기 상세 시트, 박스 화면 헤더 첫 링크
2. 지갑 거래 내역: 개봉 및 받기 거래 내역 추가, 음수 금액 표기 -$1 (기존 $-1 에서 개선)
3. 계정 비밀번호 시트: 완료 상태 추가(성공 화면), 인증 앱 미연결 계정용 안내 한 줄
4. 확인 대화상자: 뜬 직후 350ms 동안 확정 단추 누름 무시(시각적 변화 없음)
5. 그 외 모든 영역: 홈 히어로 배너, 상자 개봉 연출, 다중 개봉 결과 화면, 구매 바, 구성품 그리드, 확률 요약/상세 표, 보관함, 검증, 당첨 내역, 이용안내, 약관, 계정 화면, 모든 시트는 ORIGINAL과 완전히 같아야 함

---

## 2. 작업 (A) 상자 개봉 및 홈 히어로 배너 연출 검증

### 2.1 상자 개봉 연출 전수 측정 (1개 개봉 및 5개 개봉)
- 직접 실행한 것:
  `node migration-audit/harness/agy2/audit-motion.mjs`
  Chromium CDP screencast를 사용하여 단추 클릭 시점부터 결과 안착 시점까지 50ms 단위로 프레임을 캡처하고, DOM dataset 속성과 원장 기록 이벤트를 밀리초 단위로 수집하였다.
- 측정 대상:
  - 1개 개봉: 일반 모션(390px, 1440px), reduced-motion(390px, 1440px)
  - 5개 개봉: 일반 모션(390px, 1440px), reduced-motion(390px, 1440px)
  - ORIGINAL과 RESULT 각각 8개 시나리오, 총 16회 측정

#### 2.1.1 구간별 소요 시간 대조 결과
측정 데이터는 `migration-audit/motion/cycle2-agy/motion-audit.json`에 저장되었다.

1. 1개 개봉 일반 모션 (390px)
   - 클릭 후 오버레이 표시: ORIGINAL 28ms, RESULT 29ms (차이 1ms)
   - 기대감(anticipation) 구간: ORIGINAL 534ms, RESULT 535ms (차이 1ms)
   - 타격(impact) 구간: ORIGINAL 150ms, RESULT 150ms (차이 0ms)
   - 퇴장(exit) 구간: ORIGINAL 173ms, RESULT 168ms (차이 -5ms)
   - 공개 후 준비(revealToReady): ORIGINAL 351ms, RESULT 349ms (차이 -2ms)
   - 클릭부터 결과 공개까지: ORIGINAL 885ms, RESULT 882ms (차이 -3ms)
   - 클릭부터 최종 안착까지: ORIGINAL 1236ms, RESULT 1231ms (차이 -5ms)
   - 프레임 경로:
     - ORIGINAL: `migration-audit/motion/cycle2-agy/original/open-1-normal-390/`
     - RESULT: `migration-audit/motion/cycle2-agy/result/open-1-normal-390/`

2. 1개 개봉 일반 모션 (1440px)
   - 기대감 구간: ORIGINAL 528ms, RESULT 534ms (차이 6ms)
   - 타격 구간: ORIGINAL 153ms, RESULT 143ms (차이 -10ms)
   - 퇴장 구간: ORIGINAL 171ms, RESULT 175ms (차이 4ms)
   - 공개 후 준비: ORIGINAL 350ms, RESULT 348ms (차이 -2ms)
   - 클릭부터 최종 안착까지: ORIGINAL 1230ms, RESULT 1230ms (차이 0ms)
   - 프레임 경로:
     - ORIGINAL: `migration-audit/motion/cycle2-agy/original/open-1-normal-1440/`
     - RESULT: `migration-audit/motion/cycle2-agy/result/open-1-normal-1440/`

3. 1개 개봉 감속 모션 (reduced-motion, 390px 및 1440px)
   - 상자 흔들림, 타격, 퇴장 애니메이션 건너뜀 (null)
   - 클릭부터 결과 공개까지: 390px (ORIGINAL 39ms, RESULT 38ms), 1440px (ORIGINAL 39ms, RESULT 38ms)
   - 공개 후 350ms 안착 잠금 유지: 390px (ORIGINAL 349ms, RESULT 351ms), 1440px (ORIGINAL 352ms, RESULT 352ms)
   - 클릭부터 최종 안착까지: 390px (ORIGINAL 388ms, RESULT 389ms), 1440px (ORIGINAL 391ms, RESULT 390ms)
   - 프레임 경로:
     - ORIGINAL: `migration-audit/motion/cycle2-agy/original/open-1-reduced-390/`, `open-1-reduced-1440/`
     - RESULT: `migration-audit/motion/cycle2-agy/result/open-1-reduced-390/`, `open-1-reduced-1440/`

4. 5개 개봉 일반 모션 (390px 및 1440px)
   - 기대감 구간: 390px (ORIGINAL 524ms, RESULT 528ms), 1440px (ORIGINAL 528ms, RESULT 529ms)
   - 타격 구간: 390px (ORIGINAL 150ms, RESULT 150ms), 1440px (ORIGINAL 150ms, RESULT 150ms)
   - 퇴장 구간: 390px (ORIGINAL 184ms, RESULT 178ms), 1440px (ORIGINAL 177ms, RESULT 171ms)
   - 공개 후 준비: 390px (ORIGINAL 355ms, RESULT 350ms), 1440px (ORIGINAL 363ms, RESULT 353ms)
   - 클릭부터 최종 안착까지: 390px (ORIGINAL 1243ms, RESULT 1237ms), 1440px (ORIGINAL 1249ms, RESULT 1233ms)
   - 프레임 경로:
     - ORIGINAL: `migration-audit/motion/cycle2-agy/original/open-5-normal-390/`, `open-5-normal-1440/`
     - RESULT: `migration-audit/motion/cycle2-agy/result/open-5-normal-390/`, `open-5-normal-1440/`

5. 5개 개봉 감속 모션 (reduced-motion, 390px 및 1440px)
   - 클릭부터 결과 공개까지: 390px (ORIGINAL 41ms, RESULT 42ms), 1440px (ORIGINAL 42ms, RESULT 40ms)
   - 클릭부터 최종 안착까지: 390px (ORIGINAL 403ms, RESULT 393ms), 1440px (ORIGINAL 393ms, RESULT 399ms)
   - 프레임 경로:
     - ORIGINAL: `migration-audit/motion/cycle2-agy/original/open-5-reduced-390/`, `open-5-reduced-1440/`
     - RESULT: `migration-audit/motion/cycle2-agy/result/open-5-reduced-390/`, `open-5-reduced-1440/`

- 코드에서 읽은 것:
  `web/lib/openingFlow.ts`에 정의된 타임라인 상수:
  - OPENING_ANTICIPATION_MS = 530
  - OPENING_IMPACT_MS = 150
  - OPENING_EXIT_MS = 170
  - OPENING_ARM_DELAY_MS = 350
  측정된 모든 수치는 브라우저 타이머 오차 범위(16ms, 1 프레임 이내)에서 완벽히 일치하였다.
- 화면에서 본 것:
  오프닝 루트 요소의 클래스 및 dataset 변화 순서는 두 빌드에서 다음 순서로 100% 동일하게 진행되었다.
  `pointerdown -> click -> dom(busy) -> write(wallet) -> write(inventory) -> write(fair) -> write(wallet/inventory) -> dom(recover) -> dom(anticipation,opening) -> dom(impact,opening) -> dom(exit,opening) -> write(journal) -> dom(reveal,revealed) -> dom(ready,settled,armed)`
  결과 화면의 DOM 상태, 텍스트, 재도전 단추 라벨, 안내 문구 모두 100% 일치하였다.
- 판정:
  차이 없음 (P3 해당 없음, 원본 동등성 완전 보존 확인)

### 2.2 홈 히어로 배너 주기 검증
- 직접 실행한 것:
  `audit-motion.mjs` 내 `recordHeroBanner` 함수를 통해 홈 화면 첫 진입 후 4000ms 동안 CDP screencast로 100ms 간격 총 41 프레임을 연속 기록하였다.
- 화면에서 본 것:
  배너의 카드 3장과 WebGL 캔버스 5개의 렌더링, 페이즈 전환 상태가 양쪽 빌드에서 완전히 일치하였다.
  - ORIGINAL 390px: `heroPhase: "open"`, `scenePhase: "impact"`, 카드 수 3, 캔버스 수 5
  - RESULT 390px: `heroPhase: "open"`, `scenePhase: "impact"`, 카드 수 3, 캔버스 수 5
  - ORIGINAL 1440px: `heroPhase: "open"`, `scenePhase: "impact"`, 카드 수 3, 캔버스 수 5
  - RESULT 1440px: `heroPhase: "open"`, `scenePhase: "impact"`, 카드 수 3, 캔버스 수 5
  - 프레임 경로:
    - ORIGINAL: `migration-audit/motion/cycle2-agy/original/hero-banner-390/`, `hero-banner-1440/`
    - RESULT: `migration-audit/motion/cycle2-agy/result/hero-banner-390/`, `hero-banner-1440/`
- 판정:
  차이 없음 (원본 동등성 완전 보존 확인)

---

## 3. 작업 (B) 의도된 영역 밖의 정지 화면(Stills) 전수 대조

### 3.1 측정 방법 및 범위
- 직접 실행한 것:
  `node migration-audit/harness/agy2/audit-stills.mjs`
  11개 라우트 그룹에 걸쳐 한국어(ko), 영어(en), 중국어(zh) 3개 언어, 모바일(390px) 및 데스크톱(1440px) 2개 뷰포트에서 총 162개 요소를 측정하였다.
  각 요소별로 bounding box(폭/높이 2px 이내 허용 오차), 텍스트 내용, 줄 수, 계산된 폰트 스타일(fontFamily, fontSize, fontWeight, lineHeight), 계산된 색상(color, backgroundColor, borderColor)을 일대일 비교하였다.
- 대조 결과 파일:
  `migration-audit/screenshots/cycle2-agy/stills-comparison.json`

### 3.2 전수 대조 결과
전체 162개 평가 항목 중 153개 항목이 100% 일치(동등)하였고, 불일치로 기록된 9개 항목은 모두 의도된 변경이거나 폭에 따른 요소 부재(정상 동작)였다.

#### 3.2.1 100% 동등성이 검증된 153개 항목 목록
다음 요소들은 ko, en, zh 3개 언어와 390px, 1440px 2개 뷰포트에서 bounding box 오차 2px 이내, 텍스트 일치, 줄 수 일치, 폰트 일치, 색상 일치를 완벽히 만족하였다.
1. 헤더 (`header`): 모바일 햄버거 메뉴, 로고, 언어/통화, 로그인 단추, 데스크톱 내비게이션 링크 전체 일치
   - 스크린샷: `migration-audit/screenshots/cycle2-agy/stills/result/header__*.png`
2. 푸터 (`footer`): 저작권 문구, 링크 목록, 언어 및 통화 변경 단추 일치
   - 스크린샷: `migration-audit/screenshots/cycle2-agy/stills/result/footer__*.png`
3. 홈 히어로 (`home-hero`): 배너 텍스트, 통계 숫자, 배경 구성 일치
   - 스크린샷: `migration-audit/screenshots/cycle2-agy/stills/result/home-hero__*.png`
4. 검색 및 카테고리 칩 (`search-chips`): 5개 카테고리 칩 텍스트, 패딩, 테두리 일치
   - 스크린샷: `migration-audit/screenshots/cycle2-agy/stills/result/search-chips__*.png`
5. 박스 화면 히어로 및 구매 바 (`box-hero-openbar`): 박스 이미지, 가격 표기, 1개/5개 수량 선택 칩, 개봉 단추 일치
   - 스크린샷: `migration-audit/screenshots/cycle2-agy/stills/result/box-hero-openbar__*.png`
6. 구성품 타일 (`contents-tiles`): 각 상품 타일의 이미지 비율, 상품명, 가격, 등급 표기 일치
   - 스크린샷: `migration-audit/screenshots/cycle2-agy/stills/result/contents-tiles__*.png`
7. 확률 요약 및 표 (`odds-summary-tables`): 최고 상품가, 환급률, 구간별 확률 표 텍스트와 정렬 일치
   - 스크린샷: `migration-audit/screenshots/cycle2-agy/stills/result/odds-summary-tables__*.png`
8. 유의사항 (`notes`): 공정성 안내, 환불 및 수령 정책 텍스트 일치
   - 스크린샷: `migration-audit/screenshots/cycle2-agy/stills/result/notes__*.png`
9. 보관함 (`inventory`): 보유 상품 목록, 상태 뱃지, 즉시 받기 단추 일치
   - 스크린샷: `migration-audit/screenshots/cycle2-agy/stills/result/inventory__*.png`
10. 지갑 (`wallet`): 잔액 표시, 충전 옵션, 거래 내역 구조 일치
    - 스크린샷: `migration-audit/screenshots/cycle2-agy/stills/result/wallet__*.png`
11. 출금 서식 (`withdraw-form`): 네트워크 선택, 지갑 주소 입력란, 출금 수수료 안내 일치
    - 스크린샷: `migration-audit/screenshots/cycle2-agy/stills/result/withdraw-form__*.png`
12. 검증 (`verify`): 클라이언트 시드, 서버 시드 해시, nonce 입력 서식 일치
    - 스크린샷: `migration-audit/screenshots/cycle2-agy/stills/result/verify__*.png`
13. 당첨 내역 (`wins`): 실시간 당첨 기록 카드, 타임스탬프, 상품 링크 일치
    - 스크린샷: `migration-audit/screenshots/cycle2-agy/stills/result/wins__*.png`
14. 이용안내 (`guide`): 단계별 가이드 텍스트와 설명 일치
    - 스크린샷: `migration-audit/screenshots/cycle2-agy/stills/result/guide__*.png`
15. 약관과 정책 (`legal`): 이용약관, 개인정보처리방침 원문 일치
    - 스크린샷: `migration-audit/screenshots/cycle2-agy/stills/result/legal__*.png`
16. 계정 화면 (`account`): 잔액, 보관 중/배송 중 수량, 보안 설정 항목 일치
    - 스크린샷: `migration-audit/screenshots/cycle2-agy/stills/result/account__*.png`
17. 열 수 있는 모든 시트:
    - 메뉴 시트 (`sheet-menu`, 390px): 모바일 내비게이션 링크 일치
    - 로그인 시트 (`sheet-login`): 소셜 로그인 단추, 이메일 입력란 일치
    - 회원가입 시트 (`sheet-signup`): 가입 서식, 약관 동의 일치
    - 잔액 시트 (`sheet-balance`): 상세 잔액, 원화 환산 표기 일치
    - 충전 시트 (`sheet-charge`): USDT 입금 주소, QR 코드 영역 일치
    - 상품 수령 확인 시트 (`sheet-take-confirm`): 수령 금액 확인 다이얼로그 일치
    - 상품 상세 시트 (`sheet-item-detail`): 실물 상품 상세 이미지와 정보 일치
    - 검증 시트 (`sheet-verify`): 시드 해시 대조 팝업 일치
    - 언어 및 통화 설정 시트 (`sheet-locale-currency`): 다국어 및 원화 토글 일치
    - 후기 작성 시트 (`sheet-review-write`): 별점 및 후기 입력 서식 일치

#### 3.2.2 차이가 감지된 9개 항목의 분석
- `box-card` (ko, en, zh / 390px, 1440px 총 6개):
  - 측정 결과: 폭 차이 0px, 높이 차이 25px (`bboxDiff: { dw: 0, dh: 25 }`), 텍스트 및 폰트 일치
  - 원인: RESULT 빌드의 홈 박스 카드에 별점 행(`span.v-num`, 예: `4.3 (101)`)이 추가되어 카드 높이가 정확히 25px 증가함.
  - 판정: 의도된 변경 1번(홈 그리드 상자 카드의 별점 행과 후기 수 추가)에 부합함. 결함 아님.
- `sheet-menu` (ko, en, zh / 1440px 총 3개):
  - 측정 결과: `status: "missing_element"`
  - 원인: 1440px(데스크톱 뷰포트)에서는 모바일 햄버거 메뉴 단추가 없고 내비게이션 링크가 헤더에 직접 노출되므로 메뉴 시트 자체가 존재하지 않음. ORIGINAL과 RESULT 양쪽 모두 동일하게 시트가 없으므로 동등함.
  - 판정: 정상 동작 (결함 아님).

---

## 4. 작업 (C) 의도된 영역의 디자이너 관점 정밀 검수 (DESIGN.md 기준)

### 4.1 /reviews 화면 (후기 목록)
- 직접 실행한 것:
  `audit-intended.mjs` 내 `auditReviewsPage`를 통해 320px, 390px, 768px, 1440px 4개 뷰포트와 ko, en, zh 3개 언어에 대해 전수 캡처 및 DOM 분석을 수행하였다.
  - 스크린샷: `migration-audit/screenshots/cycle2-agy/intended/result/reviews-screen/reviews__*.png`
- 화면에서 본 것:
  - 320px 극소형 화면부터 1440px 데스크톱까지 가로 스크롤 넘침(overflow) 없음 (`scrollWidth <= clientWidth`).
  - 스크린 리더용 숨김 텍스트 클래스 `.v-rv-sr`은 접근성 표준에 따라 너비 1px, 높이 1px, overflow hidden으로 올바르게 처리됨.
  - 후기 카드는 20개 행이 깔끔하게 렌더링되며, 작성자 닉네임, 상대 시간, 별점, 개봉 상품 태그가 규칙적으로 배치됨.
  - 더보기 단추는 흰색 알약 주 단추가 아니라 조용한 회색 단추(`.v-rv-morebtn`, 배경색 #2f2f2f, 글자색 #ececec)로 구현되어 DESIGN.md 규칙에 부합함.
- DESIGN.md 대조:
  - 주 단추: 화면 내 흰색 알약 주 단추 0개 (DESIGN.md: 화면당 주 단추 최대 1개 규칙 준수).
  - 밑줄 링크: 뒤로 가기 링크 1개 (DESIGN.md: 밑줄 링크 최대 2개 규칙 준수).
  - 그림자: 0건 (`box-shadow: none` 확인).
  - 색상: 금색, 그라데이션, 화려한 등급 뱃지 배제, #303030 면과 #ececec 텍스트로만 구성.
- 판정:
  의도한 변경 안의 품질 문제 없음. 우수한 완성도로 구현됨.

### 4.2 박스 상세 후기 구역 및 후기 상세 시트
- 화면에서 본 것:
  - 박스 상세 화면 상단 헤더의 평점 링크(`.v-ratinglink`)에 `4.8, 후기 292개`가 표시되며 클릭 시 `#reviews` 구역으로 부드럽게 스크롤됨.
  - 후기 구역에 최신 후기 목록이 표시되며 각 후기 행(`.v-rv-btn`) 클릭 시 후기 상세 바텀시트가 열림.
  - 후기 상세 시트 내용:
    - 작성자: 든든한참새70 (20시간 전)
    - 본문: "오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ"
    - 상품 정보: 애플 기프트카드 $100 (상품가 $100)
    - 개봉 박스 출처: 1달러 애플 박스, $1
  - 스크린샷: `migration-audit/screenshots/cycle2-agy/intended/result/box-reviews/review-detail-sheet__ko.png`
- DESIGN.md 대조:
  - 불필요한 장식 요소 없이 텍스트 위계와 #303030 배경의 시트 구조로 정돈됨.
- 판정:
  의도한 변경 1번에 부합하며 품질 결함 없음.

### 4.3 홈 그리드 박스 카드 별점 라인
- 화면에서 본 것:
  - 카드 하단에 별점과 후기 건수 메타 정보(`.v-boxcard-meta`, `.v-num`)가 추가됨: `4.3 (101)`.
  - Pretendard 14px, 회색(#9a9a9a)으로 단정하게 표시되어 상품명 및 가격과의 시각적 충돌 없음.
  - 스크린샷: `migration-audit/screenshots/cycle2-agy/intended/result/box-reviews/home-card-rating__ko.png`
- 판정:
  의도한 변경 1번에 부합하며 줄바꿈 깨짐 없음.

### 4.4 지갑 거래 내역 및 음수 금액 표기
- 화면에서 본 것:
  - 지갑 화면의 거래 내역 행에 개봉 및 USDT 받기 거래 내역이 정상적으로 표시됨.
  - 음수 금액 표기: `-$50`, `-$1`과 같이 마이너스 부호가 통화 기호($) 앞에 위치함 (ORIGINAL의 `$-50` 표기에서 수정됨).
  - 스크린샷: `migration-audit/screenshots/cycle2-agy/intended/result/wallet-history/wallet-tx-history.png`
- 코드에서 읽은 것:
  `web/lib/formatCurrency.ts`의 `signFirst: true` 로직 및 커밋 `42d89e4` ("E-14 금액 표기: 음수의 빼기 표시를 통화 기호 앞에 둠")에 의해 구현됨.
- 판정:
  의도한 변경 2번에 부합하며 정상 동작 확인.

### 4.5 계정 비밀번호 시트 완료 상태 및 인증 앱 미연결 안내
- 직접 실행한 것:
  `check-password.mjs` 및 콘솔 검증 스크립트를 통해 funded(인증 앱 미연결)와 security(인증 앱 연결) 계정 상태에서 각각 비밀번호 변경 흐름을 테스트하였다.
- 화면에서 본 것:
  1. 인증 앱 미연결 계정 (funded 프리셋):
     - 현재 비밀번호, 새 비밀번호, 인증 코드(임의 6자리) 입력 후 제출 시:
     - 새 안내 한 줄 표시: `인증 앱을 연결한 뒤에 비밀번호를 바꿀 수 있습니다.`
     - 빨간색 실패 라인(`.v-line--fail`)으로 시트 내부에 자연스럽게 렌더링됨.
     - 스크린샷: `migration-audit/screenshots/cycle2-agy/intended/result/password-sheet/password-sheet-no-app.png`
  2. 인증 앱 연결 계정 (security 프리셋):
     - 유효한 TOTP 6자리 코드와 함께 제출 시:
     - 비밀번호 변경이 성공하며 완료 화면으로 전환됨.
     - 시트 문구: `비밀번호를 바꿨습니다. 새 비밀번호로 다시 로그인해 주세요.`
     - 주 단추: `이메일로 로그인` 제공.
     - 스크린샷: `migration-audit/screenshots/cycle2-agy/intended/result/password-sheet/password-sheet-success.png`
- 코드에서 읽은 것:
  커밋 `5ef5b84` ("E-03 계정 화면의 비밀번호 바꾸기: 현재 비밀번호 확인을 먼저 거쳐 끝까지 가게 함") 및 `27eea0d` ("C1 guard B 비밀번호 바꾸기: 기다리는 사이에 계정이 바뀌었으면 그 계정의 로그인을 끝내지 않음")에 의해 구현됨.
  ORIGINAL 빌드(4175)에서는 두 경우 모두 백엔드 503 에러로 실패하며 완료 화면에 절대 도달할 수 없었으나, RESULT 빌드에서는 브라우저 환경에서 완전히 동작하도록 구현됨.
- 판정:
  의도한 변경 3번에 부합하며 UI 완성도 및 에러 처리 우수.

### 4.6 확인 대화상자 350ms 잠금 동작
- 코드에서 읽은 것:
  `web/components/ui/Sheet.tsx` 내 `Confirm` 컴포넌트:
  `Date.now() - shownAt.current >= OPENING_ARM_DELAY_MS` (350ms) 조건을 통해 뜬 직후 350ms 동안 확정 단추 클릭을 무시함. 단추를 disabled 처리하지 않아 시각적 형태 변화는 전혀 없음.
- 화면에서 본 것:
  확인창이 뜨는 순간의 시각적 형태(배경 딤, 모달 창, 흰색 확정 단추, 취소 텍스트 링크)는 ORIGINAL과 RESULT 사이에 1픽셀의 차이도 없음.
- 판정:
  의도한 변경 4번에 완벽히 부합함.

---

## 5. 작업 (D) 인터랙티브 요소의 Hover 및 Focus-visible 검증 (1280px)

### 5.1 검증 방법 및 대상
- 직접 실행한 것:
  `node migration-audit/harness/agy2/audit-hover-focus.mjs`
  1280px 데스크톱 뷰포트에서 양쪽 빌드의 인터랙티브 컴포넌트 8종에 대해 Default(Rest), Hover, Focus-visible 상태의 computed style 및 스크린샷을 수집하였다.
- 대조 결과 파일:
  `migration-audit/screenshots/cycle2-agy/states/hover-focus-comparison.json`

### 5.2 컴포넌트별 검증 결과
1. D-01: 상자 카드 (`.v-boxcard`)
   - Rest: 배경 transparent, border 1px solid rgba(255,255,255,0.15)
   - Hover: 테두리 밝기 증가 (rgba(255,255,255,0.3))
   - Focus-visible: outline 2px solid #ffffff, outline-offset 2px
   - 판정: 동등함 (스크린샷: `migration-audit/screenshots/cycle2-agy/states/result/D-01_box-card_*.png`)

2. D-02: 카테고리 칩 (`.v-search .v-chip`)
   - Rest: 배경 #2f2f2f, 글자색 #cdcdcd
   - Hover: 배경 #3a3a3a
   - Focus-visible: outline 2px solid #ffffff, outline-offset 2px
   - 판정: 동등함 (스크린샷: `migration-audit/screenshots/cycle2-agy/states/result/D-02_category-chip_*.png`)

3. D-03: 내비게이션 링크 (`.v-header nav a`)
   - Rest: 글자색 #9a9a9a
   - Hover: 글자색 #ffffff
   - Focus-visible: outline 2px solid #ffffff, outline-offset 2px
   - 판정: 동등함 (스크린샷: `migration-audit/screenshots/cycle2-agy/states/result/D-03_nav-link_*.png`)

4. D-04: 주 개봉 단추 (`[data-open-primary]`)
   - Rest: 배경 #ffffff, 글자색 #000000
   - Hover: 배경 #ececec
   - Focus-visible: outline 2px solid #ffffff, outline-offset 2px
   - 판정: 동등함 (스크린샷: `migration-audit/screenshots/cycle2-agy/states/result/D-04_primary-open-button_*.png`)

5. D-05: 개봉 수량 칩 (`.v-openbar .v-chip`)
   - Rest: 배경 #2f2f2f
   - Hover: 배경 #3a3a3a
   - Focus-visible: outline 2px solid #ffffff, outline-offset 2px
   - 판정: 동등함 (스크린샷: `migration-audit/screenshots/cycle2-agy/states/result/D-05_quantity-chip_*.png`)

6. D-06: 밑줄 링크 (`.v-footer a`)
   - Rest: text-decoration underline, 글자색 #9a9a9a
   - Hover: 글자색 #ffffff
   - Focus-visible: outline 2px solid #ffffff, outline-offset 2px
   - 판정: 동등함 (스크린샷: `migration-audit/screenshots/cycle2-agy/states/result/D-06_underlined-link_*.png`)

7. D-07: 조용한 더보기 단추 (`.v-rv-morebtn`, RESULT 전용 신규 컴포넌트)
   - Rest: 배경 #2f2f2f, 글자색 #ececec, border 없음
   - Hover: 배경 #3a3a3a
   - Focus-visible: outline 2px solid #ffffff, outline-offset 2px
   - 판정: DESIGN.md의 조용한 보조 단추 규칙 준수

8. D-08: 후기 목록 행 단추 (`.v-rv-btn`, RESULT 전용 신규 컴포넌트)
   - Rest: 배경 transparent, cursor pointer
   - Hover: 배경 rgba(255,255,255,0.04)
   - Focus-visible: outline 2px solid #ffffff, outline-offset -2px (카드 안쪽 링)
   - 판정: 접근성 표준 및 키보드 탐색 지원 우수

---

## 6. 결함 및 차이 종합 평가

### 6.1 종합 판정 테이블

| 항목 | 영역 | 심각도 | 성격 | 요약 |
|---|---|---|---|---|
| A-01 | 상자 개봉 애니메이션 | P3 (해당없음) | 원본 불변 | 1개 및 5개 개봉 타임라인, 단계별 소요시간, 안착 결과 100% 동등 |
| A-02 | 홈 히어로 배너 | P3 (해당없음) | 원본 불변 | 4초간 41프레임 캡처 대조 결과 DOM 상태 및 연출 주기 100% 동등 |
| B-01 | 의도 영역 밖 스틸 153건 | P3 (해당없음) | 원본 불변 | 11개 그룹 헤더, 푸터, 시트, 표 등 2px 오차 이내 100% 동등 |
| C-01 | 후기 목록 및 상세 시트 | P3 (해당없음) | 의도된 변경 | DESIGN.md 규격(주단추 0개, 그림자 0개, 320px 무넘침) 완벽 준수 |
| C-02 | 지갑 내역 및 음수 표기 | P3 (해당없음) | 의도된 변경 | 개봉/수령 내역 추가 및 -$1 표기 정상 동작 |
| C-03 | 계정 비밀번호 시트 | P3 (해당없음) | 의도된 변경 | 미연결 계정 안내 행 및 인증 계정 완료 화면 정상 동작 |
| C-04 | 확인 대화상자 350ms 잠금 | P3 (해당없음) | 의도된 변경 | 뜬 직후 350ms 동안 클릭 무시, 외관 형태 변화 없음 |
| D-01 | Hover 및 Focus 상태 8종 | P3 (해당없음) | 원본 불변 | 1280px 데스크톱에서 고대비 포커스 링(2px #fff) 및 호버 피드백 일치 |

---

## 7. 결론 및 미실행 목록

의도하지 않은 차이: 0건 발견.

실행할 수 없었던 항목 목록:
1. 실제 돈이 움직이는 블록체인 온체인 출금 트랜잭션 전송 (원칙에 따라 격리된 테스트 원장으로만 검증함)
2. 실제 주소지로의 물리적 실물 배송 신청 요청 (원칙에 따라 모의 데이터로만 검증함)
