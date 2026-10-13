# 2차 라운드 2차 사이클 감사 보고서: 시각 및 애니메이션 감사 (AGY)

작성 일시: 2026-10-13
감사 대상: ORIGINAL 빌드(http://127.0.0.1:4175/voila-test-aresjoo/) 대 RESULT 빌드(http://127.0.0.1:4176/voila-test-aresjoo/)
기준 커밋: 63445c7 (ORIGINAL 배포본 동일)
감사 수행: Antigravity (AGY, Gemini 3.8 Flash High)

## 1. 개요 및 감사 방법

파운더의 지시에 따라 3회 QA 사이클의 2라운드 중 2회차 감사인 시각 및 애니메이션 전수 감사를 처음부터 완전히 다시 수행했습니다. 이전 작성된 감사 보고서를 전혀 참조하지 않고 독립적인 하네스 스크립트와 측정 데이터를 구축하여 전수 검증했습니다.

모든 측정과 비교는 로컬 정적 배포본(ORIGINAL 포트 4175, RESULT 포트 4176)을 대상으로 동일한 브라우저 조건(Headless Chrome, 고정 시계 2026-10-12T03:00:00.000Z, 폰트 로딩 완료 document.fonts.ready, 이미지 디코딩 및 체커 이미징 비활성화)에서 1:1로 대조 실행했습니다.

증거의 출처는 다음과 같이 명확히 구분하여 기록합니다.
1. 화면에서 봄: 브라우저 실행 화면 및 캡처 프레임에서 직접 확인한 사실
2. 코드에서 읽음: 저장소 내 TypeScript, CSS, JSON 소스에서 직접 확인한 코드
3. 직접 실행함: 하네스 도구를 통해 직접 수행한 명령과 수치 결과
4. 추정: 직접 측정되지 않았으나 정황상 추론되는 내용

## 2. 세부 검증 결과

### (A) 의도된 영역 밖의 전체 라우트 시각 및 레이아웃 동등성 비교

직접 실행함: `node migration-audit/harness/agy-r2/audit_a_routes.mjs`
결과 파일: `migration-audit/harness/agy-r2/audit_a_results.json`

검증 대상:
- 뷰포트 폭 6종: 320px, 360px, 430px, 768px, 1024px, 1920px
- 언어 3종: ko, en, zh
- 의도된 영역 밖 독립 라우트 14개:
  1. inventory (보관함 시드 상태)
  2. wallet/withdraw (출금 화면)
  3. verify (공정성 검증 화면)
  4. wins (당첨 목록)
  5. guide (이용 안내)
  6. legal (약관 센터)
  7. legal/terms (이용약관)
  8. legal/privacy (개인정보처리방침)
  9. legal/payments (결제 정책)
  10. account (계정 화면)
  11. about (서비스 소개)
  12. community (커뮤니티)
  13. profile (프로필)
  14. not-found (404 안내 화면)
- 홈 및 대표 박스 상세 2종(gaming-playstation, watch-rolex)의 비후기 구역:
  - header, hero, search, chips, card title, card price, purchase bar, contents tiles, odds summary, tables, notes, footer
- 총 테스트 조합 수: 17개 화면 x 6개 폭 x 3개 언어 = 306개 구성

측정 및 비교 항목:
- 2px 오차 이내 바운딩 박스(좌표 및 너비 높이)
- 텍스트 일치 여부
- 줄 수(line count)
- 계산된 스타일: font-family, font-size, font-weight, line-height, color, background-color, border-radius

결과 분석:
1. 의도된 영역 밖 14개 라우트 (총 252개 구성):
   - 불일치 발생 수: 0건.
   - 모든 뷰포트 폭과 언어에서 바운딩 박스, 텍스트, 줄 수, 글꼴, 색상, 반경이 100% 완벽하게 일치했습니다.
2. 홈 화면 비후기 구역 (18개 구성):
   - 불일치 발생 수: 구성당 5건 (총 90건).
   - 원인: RESULT 빌드에서 박스 카드 내에 의도된 변경인 별점 및 후기 수 라인이 추가되었습니다. 카드의 클래스 `.v-num`을 탐색할 때 신규 추가된 평점 요소 `4.3 (101)`이 감지되어 가격 텍스트와 불일치가 보고되었으며, 카드 높이 증가로 인해 최하단 footer 요소의 y좌표가 약 300px 아래로 이동했습니다.
   - 판정: 의도된 차이(INTENDED: rating line and review count on home box cards)에 의한 정상적인 레이아웃 시프트입니다.
3. 박스 상세 2종 화면 (gaming-playstation, watch-rolex, 총 36개 구성):
   - 불일치 발생 수: 구성당 4건 (총 144건).
   - 원인: RESULT 빌드에서 상단 영웅 구역과 구성품 구역 사이에 의도된 변경인 샘플 후기 섹션(높이 약 1,153px)이 삽입되었습니다. 이에 따라 하위 구역인 구성품 타일, 확률 표, 유의사항, 푸터의 y좌표가 정확히 1,153px 아래로 평행 이동했습니다. 각 구역의 너비, 높이, 텍스트, 폰트 크기, 색상, 테두리 반경은 100% 동일했습니다.
   - 판정: 의도된 차이(INTENDED: sample reviews on box detail pages)에 의한 정상적인 수직 배치 변화입니다.

스크린샷 증적:
- [diff_A_home_ko_390.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/diff_A_home_ko_360.png)
- [diff_A_box-playstation_ko_390.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/diff_A_box-playstation_ko_360.png)
- [diff_A_box-rolex_ko_390.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/diff_A_box-rolex_ko_360.png)

### (B) 결과 등급별 개봉 애니메이션 정밀 감사

직접 실행함: `node migration-audit/harness/agy-r2/audit_b_motion.mjs`
결과 파일: `migration-audit/harness/agy-r2/audit_b_results.json`
저장 프레임 수: 총 1,776장 (`migration-audit/motion/r2-agy/`)

시드 및 등급 산출 조건 (코드에서 읽음 및 직접 계산):
- 박스: gaming-playstation (기준가 50 USDT)
- 서버 시드: parity-audit-server-seed-0001
- below 등급 (0.15배): clientSeed `parity-audit-client-seed`, nonce 0 (추첨값 867322, 7.99달러 조이콘 캡)
- above 등급 (1.33배): clientSeed `seed-above-1`, nonce 0 (추첨값 177473, 69.99달러 데스 스트랜딩 2)
- top 등급 (475.00배): clientSeed `seed-top-1916`, nonce 0 (추첨값 18, 24,999.99달러 LG OLED evo G5 97인치 TV)

검증 매트릭스:
- 3개 등급 (below, above, top)
- 2개 뷰포트 폭 (390px, 1440px)
- 2개 모션 모드 (normal: no-preference, reduced: reduce)
- 2개 개봉 수량 (1개 개봉, 10개 대량 개봉)
- 총 24개 대조군 (ORIGINAL 24회, RESULT 24회, 총 48개 시퀀스)
- 개봉 트리거 시점부터 50ms 간격으로 1,800ms 동안 총 37개 프레임 정밀 캡처

검증 결과 대조:
1. 단계 전이 순서:
   - 1개 개봉 일반 모션: anticipation (T=0) -> impact (T=520ms) -> exit (T=670ms) -> reveal (T=840ms) -> ready (T=1,190ms).
   - 1개 개봉 축소 모션: T=0ms부터 상자 연출을 건너뛰고 즉시 reveal 단계로 진입 후 T=350ms에 ready 완료.
   - 10개 개봉 일반 모션: anticipation -> impact -> exit -> done(결과 노출) -> armed (350ms 잠금 해제).
   - 10개 개봉 축소 모션: 상자 연출 없이 즉시 done으로 진입 후 350ms 뒤 armed.
   - 24개 모든 조건에서 ORIGINAL과 RESULT의 단계 전이 순서와 타이밍이 100% 동일하게 일치했습니다.
2. 음향(AudioContext) 및 진동(navigator.vibrate) 호출 대조:
   - below 1개 일반: 오디오 호출 3회 (누름음 1회, 개봉 충격 오실레이터 2회), 진동 1회 (impact 시점 12ms).
   - below 1개 축소: 오디오 호출 2회, 진동 0회.
   - above 1개 일반: 오디오 호출 5회 (누름음 1회, 충격 오실레이터 2회, above 멜로디음 2회), 진동 1회.
   - above 1개 축소: 오디오 호출 4회, 진동 0회.
   - top 1개 일반: 오디오 호출 7회 (누름음 1회, 충격 오실레이터 2회, 승리 멜로디 4회: 392Hz, 523.25Hz, 659.25Hz, 783.99Hz), 진동 1회.
   - top 1개 축소: 오디오 호출 6회, 진동 0회.
   - 10개 개봉: 오디오 호출 2회 (누름음만 발생, 결과 화면은 효과음 없음), 진동 0회.
   - 모든 등급과 조건에서 ORIGINAL과 RESULT의 음향 및 진동 호출 횟수와 주파수 파라미터가 완전히 일치했습니다.
3. 고가 당첨 특수 연출 (top 등급):
   - 바닥 광원(`.v-op-floor`): below에서는 opacity 0.35를 유지하는 반면, top 결과에서는 T=600ms 시점에 opacity가 0.9로 증폭되며 scale이 확대되는 현상이 두 빌드 모두에서 정확히 관찰되었습니다.
   - 사진 다가옴 연출(`.v-op-photo img`): 20배 이상 결과에서 `v-op-push` 키프레임에 의해 scale 1.18에서 제자리로 부드럽게 축소 이동하는 효과가 동일하게 작동했습니다.
   - 후광(`.v-op-halo`): 사진 배후의 원형 빛 번짐 효과가 정상 렌더링되었습니다.
4. 결과 화면 인터랙션:
   - 결과 공개 직후 350ms 입력 잠금(`OPENING_ARM_DELAY_MS`)이 정상 작동한 뒤 조작 버튼이 활성화되었습니다.

대표 프레임 증적:
- [frame_ORIG_tone-top_count-1_w-390_motion-norm_0850ms.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/r2-agy/frame_ORIG_tone-top_count-1_w-390_motion-norm_0850ms.png)
- [frame_RES_tone-top_count-1_w-390_motion-norm_0850ms.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/r2-agy/frame_RES_tone-top_count-1_w-390_motion-norm_0850ms.png)
- [frame_ORIG_tone-below_count-1_w-390_motion-norm_0850ms.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/r2-agy/frame_ORIG_tone-below_count-1_w-390_motion-norm_0850ms.png)
- [frame_RES_tone-below_count-1_w-390_motion-norm_0850ms.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/motion/r2-agy/frame_RES_tone-below_count-1_w-390_motion-norm_0850ms.png)

### (C) 숨은 UI 상태 전수 감사

직접 실행함: `node migration-audit/harness/agy-r2/audit_c_hidden.mjs`
결과 파일: `migration-audit/harness/agy-r2/audit_c_results.json`
수행 항목: 총 22개 시나리오 실행 대조

1. 빈 상태 (Empty States):
   - 빈 보관함: `/inventory`에서 `.v-empty` ("보관 중인 상품이 없습니다")가 양쪽 빌드에서 동일한 폰트와 마진으로 렌더링됨을 확인했습니다.
   - 빈 거래 내역: `/wallet`에서 잔액 및 내역 없음 상태가 동일하게 표시되었습니다.
   - 빈 검색 결과: 홈 검색창에 불일치 키워드 입력 시 결과 없음 안내가 양쪽 빌드에서 일치했습니다.
   - 증적: [C_RES_empty_inventory.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/C_RES_empty_inventory.png), [C_RES_empty_search.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/C_RES_empty_search.png)
2. 인라인 오류 표시 (Inline Error Lines):
   - 출금 최소 금액 미달: 출금액 0.5 USDT 입력 시 필드 하단에 "최소 출금액은 10 USDT입니다" 인라인 오류 메시지가 동일하게 출력되었습니다.
   - 출금 주소 유효성 오류: 유효하지 않은 주소 입력 시 동일하게 오류 라인이 출력되었습니다.
   - 증적: [C_RES_error_withdraw_min.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/C_RES_error_withdraw_min.png)
3. 토스트 알림 (Toasts):
   - `/verify` 화면에서 시드 복사 버튼 클릭 시 하단 중앙에서 `.v-toast` ("주소를 복사했습니다" 또는 "복사되었습니다")가 `.v-rise` 애니메이션으로 나타나고 2.4초 후 사라지는 동작이 양쪽 빌드에서 일치했습니다.
   - 증적: [C_RES_toast_copy.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/C_RES_toast_copy.png)
4. 중첩 시트 (Nested Sheets):
   - 박스 개봉 결과 화면에서 "USDT로 받기" 클릭 시 확인 시트가 위에 중첩 열리는 동작을 검증했습니다.
   - 뒷배경 가림막(`.v-scrim`)이 과도하게 겹쳐 어두워지지 않고 z-index 레이어가 정상 유지되었습니다.
   - 증적: [C_RES_nested_sheets.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/C_RES_nested_sheets.png)
5. 스크롤 잠금 및 포커스 트랩:
   - 시트나 모달이 열렸을 때 `document.body`의 `overflow` 스타일이 제어되어 배경 스크롤이 잠기는 것을 확인했습니다.
   - Tab 키 입력 시 포커스가 시트 내부 인터랙티브 요소를 순환하는 포커스 트랩 동작이 유지되었습니다.
   - 증적: [C_RES_scroll_lock.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/C_RES_scroll_lock.png)
6. Esc 키 및 바깥 영역 누름 닫기:
   - 시트 열림 상태에서 Esc 키 입력 시 시트가 닫히는 동작을 확인했습니다.
   - 시트 바깥의 가림막(`.v-scrim`) 영역 클릭 시 정상적으로 시트가 닫혔습니다.
   - 증적: [C_RES_escape_outside.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/C_RES_escape_outside.png)
7. 시트 열림 상태에서 뒤로 가기:
   - 브라우저 뒤로 가기 실행 시 라우트 변경과 함께 열려 있던 시트가 언마운트되며 이전 페이지로 안전하게 이동했습니다.
   - 증적: [C_RES_back_button.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/C_RES_back_button.png)

### (D) 좁은 뷰포트(320px, 360px) 영문/중문 타이포그래피 및 줄바꿈 감사

직접 실행함: `node migration-audit/harness/agy-r2/audit_d_typography.mjs`
결과 파일: `migration-audit/harness/agy-r2/audit_d_results.json`
수행 항목: 총 32개 조건 실행 (폭 320/360 x 언어 en/zh x 4개 경로 x 2개 빌드)

테스트 조건:
- 원화(KRW) 표시 모드 활성화 (설정 저장소 override)
- 대형 잔액 주입: 99,999,999 USDT (원화 환산 시 1300억원대 초대형 숫자 표기)
- 긴 영문/중문 상품명이 포함된 라우트: 홈, 박스 상세, 지갑, 보관함

측정 결과:
1. 가로 스크롤 오버플로 (Horizontal Overflow):
   - 32개 모든 테스트 조건에서 `scrollWidth > clientWidth` 오버플로 발생 건수는 **0건**이었습니다.
   - 폭 320px 극소형 뷰포트에서도 좌우로 흔들리거나 불필요한 가로 스크롤바가 생기지 않았습니다.
2. 텍스트 말줄임표 (Ellipsis & Truncation):
   - 긴 상품명(`.v-itemrow-name`, `.v-card-title`) 및 주소 해시에서 컨테이너를 뚫고 나가지 않고 `text-overflow: ellipsis`로 안전하게 말줄임 처리되었습니다 (총 24개 검사 지점).
3. 텍스트 겹침 (Text Overlap):
   - 대형 금액 텍스트와 주변 단위 라벨 간의 바운딩 박스 충돌이나 겹침(overlap) 현상은 **0건**이었습니다.
   - 쉼표 구분 포맷("₩134,999,998,650")이 행을 깨뜨리지 않고 자연스럽게 렌더링되었습니다.

스크린샷 증적:
- [D_RES_en_320__box_gaming-playstation.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/D_RES_en_320__box_gaming-playstation.png)
- [D_RES_zh_320__wallet.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/D_RES_zh_320__wallet.png)
- [D_RES_en_360__inventory.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/D_RES_en_360__inventory.png)

### (E) 의도된 변경 영역의 DESIGN.md 정본 품질 감사

직접 실행함: `node migration-audit/harness/agy-r2/audit_e_intended.mjs` 및 `capture_pw_shots.mjs`
결과 파일: `migration-audit/harness/agy-r2/audit_e_results.json`
수행 항목: 폭 320, 360, 768, 1920 대상 24회 측정 및 대조

DESIGN.md 기준 대조 결과:
1. 후기 영역 및 `/reviews` 화면:
   - DESIGN.md 3절 색상 규칙 준수: 배경색 `#000`, 카드 서피스 `#303030`, 금지된 금색/그라데이션/그림자 일절 없음.
   - 평점 블록: 밝은 노란색이나 화려한 배지 대신 순수한 별점 아이콘과 숫자로 담담하게 표현되었습니다.
   - 모바일 반응형: 320px/360px에서 세로 카드 흐름 유지, 데스크톱에서 다단 그리드 정렬이 정확히 들어맞았습니다.
   - 증적: [E_RES_box_reviews_w360.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/E_RES_box_reviews_w360.png), [E_RES_reviews_screen_w768.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/E_RES_reviews_screen_w768.png)
2. 홈 박스 카드 및 이미지 품질:
   - 홈 카드 형태: 모바일에서 반경 20px, 데스크톱에서 반경 26px (`카드와 창 반경 26(모바일 20)` 완벽 준수).
   - 카드 내용: 가장 값진 실물 사진 1장, 카드 제목(font-weight 600), 가격, 그리고 신규 추가된 평점 라인(`4.3 (101)`)만 배치되어 정보 과부하가 제거되었습니다.
   - 더보기 버튼: `.v-btn--quiet` 알약형 단추로 절제되게 구성되었습니다.
   - 증적: [E_RES_home_cards_w360.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/E_RES_home_cards_w360.png)
3. 지갑 내역 신규 거래 및 음수 표기 개선:
   - 박스 개봉(`box_open`) 및 받기(`take`) 거래가 지갑 내역에 정상 반영되는 것을 확인했습니다.
   - 음수 표기 교정: ORIGINAL 빌드에서 `$-50`, `$-10`으로 잘못 렌더링되던 달러 앞 음수 기호가 RESULT 빌드에서 `-$50`, `-$10`으로 정상 교정되었습니다.
   - 증적: [E_RES_wallet_txs_w360.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/E_RES_wallet_txs_w360.png)
4. 계정 비밀번호 시트 오류 메시지 세부화:
   - 유효하지 않은 입력 제출 시 이전의 단순 오류 또는 중단 대신, 필드 검증 규칙에 맞는 명확한 인라인 실패 문구(`<Line fail>`)가 표시되는 것을 확인했습니다.
   - 증적: [E_RES_pw_error_line.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/E_RES_pw_error_line.png)

## 3. 발견 사항 및 등급 분류

전수 감사에서 관찰된 항목을 MISSION 정의에 따라 P0부터 P3까지 등급을 매기고 성격을 명시합니다.

### 1) [P2] 지갑 거래 내역 음수 기호 표기 교정
- 성격: 의도된 구역 안의 품질 문제 (의도된 수정 사항 반영 확인)
- 내용: ORIGINAL 빌드는 지갑 차감 내역에서 `$-50` 형태로 기호를 출력했으나 RESULT 빌드에서 `-$50`으로 정상 수정되었습니다.
- 증거: 화면에서 봄, 직접 실행함 (`audit_e_intended.mjs`), 증적 [E_RES_wallet_txs_w360.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/E_RES_wallet_txs_w360.png).

### 2) [P2] 계정 비밀번호 변경 시트 인라인 오류 표시 고도화
- 성격: 의도된 구역 안의 품질 문제 (의도된 수정 사항 반영 확인)
- 내용: ORIGINAL 빌드에서는 비밀번호 변경 실패 시 처리가 중단되거나 단순 문구에 그쳤으나, RESULT 빌드에서는 실제 계정 인증 로직과 연동되어 구체적인 인라인 안내 문구가 출력됩니다.
- 증거: 화면에서 봄, 직접 실행함 (`capture_pw_shots.mjs`), 증적 [E_RES_pw_error_line.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/E_RES_pw_error_line.png).

### 3) [P3] 홈 및 박스 상세의 신규 후기 구역 삽입에 따른 레이아웃 시프트
- 성격: 그대로 유지된 ORIGINAL의 고유 성질 및 의도된 차이
- 내용: 신규 샘플 후기 기능과 박스 카드 평점 라인이 도입됨에 따라 하단 요소들의 y좌표가 이동했으나, 각 블록 내부의 기하학적 치수와 타이포그래피는 기준 규격을 정확히 유지하고 있습니다.
- 증거: 화면에서 봄, 직접 실행함 (`audit_a_routes.mjs`), 증적 [diff_A_box-playstation_ko_360.png](file:///C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/screenshots/r2-agy/diff_A_box-playstation_ko_360.png).

## 4. 실행 규모 통계 총괄

- 테스트 실행 라우트 수: 17개 라우트 (비후기 독립 라우트 14개, 홈 비후기 1개, 박스 상세 비후기 2개)
- 테스트 뷰포트 폭 수: 6개 폭 (320, 360, 430, 768, 1024, 1920)
- 테스트 언어 수: 3개 언어 (ko, en, zh)
- 라우트 및 레이아웃 대조 구성 수: 총 306회
- 애니메이션 정밀 측정 프레임 수: 총 1,776장 (48개 시퀀스 x 37프레임)
- 은닉 UI 및 타이포그래피 테스트 수: 54개 테스트 케이스
- 수집된 스크린샷 수: 148장

의도하지 않은 차이 0건. 실행하지 못한 항목: 실제 자금이 소요되는 외부 블록체인 출금 요청 트랜잭션 전송, 실제 물리 배송 접수 요청 제출 (테스트 규칙 및 안전 지침에 따라 제외함).
