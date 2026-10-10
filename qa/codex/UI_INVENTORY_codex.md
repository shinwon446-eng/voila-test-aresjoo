# VOILA 사용자 화면 전수 코드 조사

조사일: 2026-10-10. 대상: 현재 작업공간의 `web/`. 결과 파일 이외의 소스 수정, 커밋, 빌드, 서버 실행, 금융 호출은 하지 않았다.

`AGENTS.md`, `DESIGN.md`, `REDESIGN_BRIEF.md`를 읽었다. `qa/PROGRESS.md`는 작업공간에서 찾지 못했다. 이 문서는 코드 정적 조사 결과다. 실제 브라우저 표시, 서버 응답, 외부 인증 화면, 소리 재생은 확인 못함이다. 스크린샷은 만들지 않았으며 아래 파일명은 촬영 제안이다.

조사 방법: `app/` 전체 파일 열거, `components/`, `lib/`, `stores/`, `server/`, `i18n/`, 메시지와 스타일의 전체 검색 후 렌더 분기와 호출부를 함께 읽었다. 의존성 설치물, 빌드 산출물, 잠금 파일, 비밀 설정은 조사 대상에서 제외했다. 테스트는 상태와 데이터 조건을 확인하는 보조 자료로만 사용했다. 파일에 선언만 있는 경우와 현재 라우트에서 호출되는 경우를 구분했다. 코드에 없는 전용 화면은 없는 것으로 표시했으며, 프레임워크 기본 화면의 실제 모양은 추측하지 않았다.

표의 경로는 저장소 루트 기준이다. `{l}`은 `ko/en/zh`, `{v}`는 모바일 390px 또는 PC 1440px를 뜻한다. 상태가 여러 값으로 적힌 행은 값마다 촬영한다. 파일명에 `{상태}`가 있으면 해당 값으로 치환한다. 민감한 인증 코드, 주소, 이메일, 시드 등을 촬영할 때는 테스트 자료가 필요하며 이 조사에는 실제 값을 수집하지 않았다.

핵심 구분: 페이지 파일은 10개다. 루트 리디렉션 1개, 로케일별 고정 페이지 8개씩, 법적 문서 13개씩으로 코드상 URL은 64개다. 쿼리, 해시, 미지원 주소는 별도 상태다. 메시지는 로케일마다 최상위 네임스페이스 50개, 말단 키 1,976개이며 세 언어의 키 집합은 같다. 키가 있다는 사실이 현재 화면에 쓰인다는 뜻은 아니다.

## 1. 라우트와 공통 화면

모든 로케일 페이지는 공통 레이아웃을 거친다. 정상 경로와 404 경로를 섞어서 정상 페이지 수에 포함하지 않았다.

| 파일 경로 | 띄우는 방법 | 필요한 상태 | 제안 스크린샷 파일명 |
| --- | --- | --- | --- |
| web/app/page.tsx | / 방문 | 저장 언어 우선, 없으면 브라우저 언어 ko/zh, 그 외 en으로 이동; 이동 전 브랜드 | root-redirect-{l}-{v}.png |
| web/app/page.tsx | / 방문, 자바스크립트 비활성 | meta 이동 ko; 실제 브라우저 이동 확인 못함 | root-no-js-{v}.png |
| web/app/layout.tsx, web/app/icon.svg, web/lib/labSite.ts | 아무 주소에서 브라우저 탭 확인 | 테스트 사이트 제목, 설명, 아이콘; 페이지 내용 외 브라우저 표면 | browser-tab-{l}.png |
| web/app/[locale]/layout.tsx, web/i18n/routing.ts, web/i18n/request.ts, web/i18n/navigation.ts | /ko, /en, /zh 각각 방문 | 세 언어 메시지 공급, 공통 헤더/푸터/인증/테스트 표시 | locale-shell-{l}-{v}.png |
| web/app/[locale]/page.tsx | /{l}/ 방문 | 기본 gpt 홈 | page-home-{l}-{v}.png |
| web/app/[locale]/about/page.tsx | 헤더 소개 | /{l}/about | page-about-{l}-{v}.png |
| web/app/[locale]/community/page.tsx | 헤더 커뮤니티 | /{l}/community 상품 후기 | page-community-{l}-{v}.png |
| web/app/[locale]/community/board/page.tsx | 커뮤니티 게시판 탭 | /{l}/community/board | page-board-{l}-{v}.png |
| web/app/[locale]/fairness/page.tsx | 헤더 공정성 | /{l}/fairness | page-fairness-{l}-{v}.png |
| web/app/[locale]/inventory/page.tsx | 헤더 보관함 | /{l}/inventory; 페이지 자체에 로그인 차단 분기 없음 | page-inventory-{l}-{v}.png |
| web/app/[locale]/profile/page.tsx | 헤더 계정 | /{l}/profile | page-profile-{l}-{v}.png |
| web/app/[locale]/legal/page.tsx | 푸터 정책 센터 | /{l}/legal; 세 그룹 문서 목록 | page-legal-index-{l}-{v}.png |
| web/app/[locale]/legal/[doc]/page.tsx | 정책 센터 이용약관 | /{l}/legal/terms | legal-terms-{l}-{v}.png |
| web/app/[locale]/legal/[doc]/page.tsx | 정책 센터 개인정보 | /{l}/legal/privacy | legal-privacy-{l}-{v}.png |
| web/app/[locale]/legal/[doc]/page.tsx | 정책 센터 결제 | /{l}/legal/payments | legal-payments-{l}-{v}.png |
| web/app/[locale]/legal/[doc]/page.tsx | 정책 센터 출금 | /{l}/legal/withdrawals | legal-withdrawals-{l}-{v}.png |
| web/app/[locale]/legal/[doc]/page.tsx | 정책 센터 환불 | /{l}/legal/refunds | legal-refunds-{l}-{v}.png |
| web/app/[locale]/legal/[doc]/page.tsx | 정책 센터 운영 정책 | /{l}/legal/policy | legal-policy-{l}-{v}.png |
| web/app/[locale]/legal/[doc]/page.tsx | 정책 센터 공정성 정책 | /{l}/legal/fairness | legal-fairness-{l}-{v}.png |
| web/app/[locale]/legal/[doc]/page.tsx | 정책 센터 안전 | /{l}/legal/safety | legal-safety-{l}-{v}.png |
| web/app/[locale]/legal/[doc]/page.tsx | 정책 센터 커뮤니티 정책 | /{l}/legal/community | legal-community-{l}-{v}.png |
| web/app/[locale]/legal/[doc]/page.tsx | 정책 센터 쿠키 | /{l}/legal/cookies | legal-cookies-{l}-{v}.png |
| web/app/[locale]/legal/[doc]/page.tsx | 정책 센터 민원 | /{l}/legal/complaints | legal-complaints-{l}-{v}.png |
| web/app/[locale]/legal/[doc]/page.tsx | 정책 센터 사업자 정보 | /{l}/legal/business | legal-business-{l}-{v}.png |
| web/app/[locale]/legal/[doc]/page.tsx | 정책 센터 자주 묻는 질문 | /{l}/legal/faq | legal-faq-{l}-{v}.png |
| web/components/legal/LegalNav.tsx, web/lib/legal.ts | 문서 상단 다른 문서 선택 | 현재 문서 표시, 모바일 가로 스크롤, 시행일/사업자/외부 출처 링크 | legal-nav-{l}-{v}.png |
| web/app/[locale]/layout.tsx:64 | 지원하지 않는 로케일로 방문 | notFound 호출; 실제 배포의 미지원 로케일 처리 확인 못함 | missing-locale-{v}.png |
| web/app/[locale]/legal/[doc]/page.tsx:16 | /{l}/legal/없는문서 방문 | notFound 및 dynamicParams=false; 기본 404 외형 확인 못함 | missing-legal-{l}-{v}.png |
| web/app/ 전체 | /{l}/존재하지않는경로 방문 | 사용자 정의 not-found.tsx 없음; Next 기본 404 실제 표시 확인 못함 | missing-route-{l}-{v}.png |
| web/app/ 전체 | 렌더링 실패 상태 | 사용자 정의 error.tsx/global-error.tsx 없음; 기본 개발/배포 오류 화면 확인 못함 | framework-error-{v}.png |
| web/app/ 전체, web/app/[locale]/community/board/page.tsx | 느린 페이지 진입 | loading.tsx 없음; 게시판 Suspense의 한국어 로딩 문구만 별도 존재 | route-loading-board-{l}-{v}.png |
| web/components/layout/SiteHeader.tsx, web/components/layout/BrandLogo.tsx | 각 페이지 상단 | 로고, 데스크톱 내비게이션, 활성 경로, 잔액, 일일 상자, 인증 버튼 | common-header-{l}-{v}.png |
| web/components/layout/SiteHeader.tsx | 1280px 미만에서 메뉴 버튼 | open=true인 role=dialog; 내비게이션/충전/출금/언어/통화/인증; Esc와 외부 클릭 | header-mobile-menu-{l}-{v}.png |
| web/components/layout/LanguageSelector.tsx | 헤더 또는 푸터 언어 선택 | 네이티브 select; 한국어/English/中文; 경로/쿼리/해시 유지, 언어 저장 | language-select-{l}-{v}.png |
| web/components/layout/CurrencySelector.tsx | 헤더 통화 선택 | 네이티브 select; USDT/USD/KRW; 재방문 선택 복원 | currency-select-{l}-{v}.png |
| web/components/layout/Footer.tsx | 페이지 끝으로 스크롤 | 정책 13개 링크, 사업자 정보, 고객지원, 언어, 저작권, 슬로건 | common-footer-{l}-{v}.png |
| web/components/layout/LabBadge.tsx | 아무 페이지 | 상단 3px 테스트 구분선; 아래 고정 배지는 제거된 상태 | lab-line-{l}-{v}.png |
| web/components/layout/LabBadge.tsx:34, web/lib/labSite.ts | 저장 공간 부족 이벤트 발생 | 고정 role=status 한국어 경고; 닫기/자동 해제 없음 | storage-full-{l}-{v}.png |
| web/components/layout/CurrencyHydrator.tsx, web/components/layout/LocaleHtmlLang.tsx | 처음 페이지 진입 | 저장 상태 복원과 html lang 설정; 자체 시각 UI 없음 | common-hydrating-{l}-{v}.png |
| web/components/layout/MotionPreferences.tsx | OS 동작 줄이기 설정 후 방문 | MotionConfig reducedMotion=user; 개별 컴포넌트 대응은 서로 다름 | common-reduced-motion-{l}-{v}.png |
| web/components/layout/MobileBottomNav.tsx | 모바일 일반 페이지 | 컴포넌트는 null 반환; 예전 하단 내비게이션 없음, 해시 상수만 유지 | 해당 없음 |
| web/components/ui/Money.tsx, web/components/ui/Approx.tsx, web/lib/formatCurrency.ts, web/lib/localFiat.ts, web/lib/useCurrency.ts | 금액이 있는 각 화면에서 통화 변경 | 정수/부호/단위/축약 만/억/K/M, 근사 현지 금액; 환율 미확인 시 기본값 | money-{currency}-{l}-{v}.png |
| web/components/box/ProductArt.tsx, web/lib/productImages.ts | 상품 이미지 로드 전후 또는 로드 실패 | 사진/contain/cover; 실패하면 현금 토큰, 상품권, 상자 SVG 대체 | product-image-{fallback}-{l}-{v}.png |
| web/components/auth/ProfileAvatar.tsx | 헤더 계정과 프로필 이미지 확인 | 사진 없음 또는 로드 실패 시 UserRound 아이콘 | avatar-fallback-{l}-{v}.png |

## 2. 홈과 상품 상세

기본 gpt 화면 외에 쿼리로 도달하는 netflix와 commerce 화면도 현행 호출부가 있다.

| 파일 경로 | 띄우는 방법 | 필요한 상태 | 제안 스크린샷 파일명 |
| --- | --- | --- | --- |
| web/app/[locale]/page.tsx, web/components/home/QuickTabs.tsx | 홈 카테고리 선택 또는 #category-all/dollar/tech/luxury/jackpot | 전체/달러/테크/럭셔리/잭팟; 선택 표시, 가로 스크롤 | catalog-{category}-{l}-{v}.png |
| web/app/[locale]/page.tsx | 정렬 선택 | 네이티브 select의 네 가지 정렬, 결과 개수 role=status | catalog-sort-{sort}-{l}-{v}.png |
| web/app/[locale]/page.tsx | 더 보기 | 12개씩 노출; 현재 상품 12개라 기본 전체에서 추가 페이지는 발생 안 함 | catalog-more-{l}-{v}.png |
| web/components/box/BoxCard.tsx | 홈 카드 보기/호버/포커스 | 상품 사진, 이름, 가격, 설명, 이름 title 툴팁; 클릭 상세 | box-card-{l}-{v}.png |
| web/components/home/AboutBanner.tsx, web/components/home/DiscoveryGuide.tsx, web/lib/homeCopy.ts | 홈 아래로 이동 | 소개 배너, 이용 방법 세 행, 소개 링크 | home-guide-{l}-{v}.png |
| web/components/home/LiveReviewsSection.tsx | 홈 후기 영역 | 실제 공개 후기와 예시로 최대 20개 채움; 기본3/netflix8/commerce6 표시 | view-home-reviews-{skin}-{l}-{v}.png |
| web/components/home/LiveReviewsSection.tsx:16 | 실제 후기가 부족한 홈 | 한국어 예시 후기/작성자, DiceBear 사진; 화면상 명시적 예시 표시는 확인되지 않음 | view-home-demo-reviews-{l}-{v}.png |
| web/components/home/ProofFeed.tsx | 홈 검증 기록 영역 | 총 기록/환급액/최근4개; 검증 전/중/후 표식 | view-home-proof-{state}-{l}-{v}.png |
| web/components/home/ProofFeed.tsx | 홈 검증 기록 영역 | 공개 기록 없음의 빈 상태 | view-home-proof-empty-{l}-{v}.png |
| web/components/home/NetflixHome.tsx, web/app/nfx-skin.css | /{l}/?skin=netflix | 빌보드/인기6개/카테고리별 가로 레일/이전다음 화살표 | view-netflix-home-{l}-{v}.png |
| web/components/home/NetflixHome.tsx | netflix 홈 카테고리/전체 선택 | 필터 그리드/정렬/필터 해제; 모바일 고정 탭바 | view-netflix-filter-{l}-{v}.png |
| web/components/home/CommerceHome.tsx, web/app/shop-skin.css | /{l}/?skin=commerce | 전체 배너/카테고리/정렬/상품 그리드/신뢰 설명/후기6개 | view-commerce-home-{l}-{v}.png |
| web/app/[locale]/page.tsx | 홈 #deposit 또는 #withdraw 직접 방문 | 해시 소비 후 지갑 모달 해당 탭; 다른 페이지 버튼도 홈으로 이동 | home-wallet-hash-{tab}-{l}-{v}.png |
| web/components/box/DetailModal.tsx | 홈 상품 카드 선택 | AnimatePresence 상세 dialog; 사진/가격/설명/상품 목록/확률/정책/이미지 출처 | box-detail-{skin}-{l}-{v}.png |
| web/components/box/DetailModal.tsx | 상세 수량 1/5/10/50/100 선택 | 합계 및 버튼 내용 변경; 50개 이상 대량 경로 | box-detail-quantity-{qty}-{l}-{v}.png |
| web/components/box/DetailModal.tsx:214 | 상세에서 잔액보다 큰 수량 선택 | 잔액0 또는 부족; 부족액 inline 및 충전 버튼 | box-detail-shortfall-{balance}-{l}-{v}.png |
| web/components/box/DetailModal.tsx:218 | 충분한 잔액으로 열기 누름 | 같은 패널 내 확인/취소/대량 되돌릴 수 없음 안내 | box-detail-confirm-{qty}-{l}-{v}.png |
| web/components/box/DetailModal.tsx | 확인 버튼 누른 직후 | 구매 pending, 버튼 비활성 및 처리 문구 | box-detail-pending-{l}-{v}.png |
| web/components/box/DetailModal.tsx:258, web/components/box/TierStrip.tsx | 정확한 확률 펼치기 | products.ts 기반 상품별 확률/등급 분포/범례; gpt CSS는 일부 등급 장식 숨김 | box-detail-odds-{skin}-{l}-{v}.png |
| web/components/box/DetailModal.tsx:279 | 사진 출처 details 펼치기 | 이미지 크레디트 및 외부 링크 | box-detail-credits-{l}-{v}.png |
| web/components/box/DetailModal.tsx:236 | 상세 자동 열기 버튼 | 자동 열기 설정이 상세 위에 중첩됨 | box-detail-auto-layer-{l}-{v}.png |
| web/app/[locale]/page.tsx:136 | 구매 시점에 잔액 부족 | 사전 화면 검사 후 잔액이 달라지는 경우 등; quiet=false면 충전 안내 토스트 | home-insufficient-toast-{l}-{v}.png |
| web/app/[locale]/page.tsx:159 | 구매 처리 실패 | 개봉 실패 제목/설명 토스트; 원인 원문은 표시하지 않음 | home-open-failed-toast-{l}-{v}.png |

## 3. 로그인, 프로필, 보안과 탈퇴

브라우저 어댑터와 원격 계정의 분기를 구분했다. 로컬 인증 코드 표시 분기는 존재하지만 실제 코드나 저장된 계정은 읽지 않았다.

| 파일 경로 | 띄우는 방법 | 필요한 상태 | 제안 스크린샷 파일명 |
| --- | --- | --- | --- |
| web/components/auth/HeaderAuthControl.tsx | 헤더 보기 | 인증 복원 중 로그인/가입 버튼 비활성 | account-header-hydrating-{l}-{v}.png |
| web/components/auth/HeaderAuthControl.tsx | 비로그인 헤더 | 로그인/회원가입 버튼 | account-header-guest-{l}-{v}.png |
| web/components/auth/HeaderAuthControl.tsx | 로그인 후 계정 버튼 클릭 | 프로필/로그아웃 드롭다운 AnimatePresence; 바깥 클릭/Esc 닫기 | account-dropdown-{l}-{v}.png |
| web/components/auth/AuthModal.tsx, web/components/auth/AuthHost.tsx | 헤더 로그인 | 전체 화면 dialog; email 단계, Google/Apple/Microsoft 버튼, 법적 링크 | login-email-{l}-{v}.png |
| web/components/auth/AuthModal.tsx | 이메일 입력 후 계속 | password 단계, 비밀번호 보기/숨기기, 이메일 수정, 복구 이동 | login-password-{l}-{v}.png |
| web/components/auth/AuthModal.tsx | 회원가입 버튼 | signup 단계; 12~128자 비밀번호 조건 | signup-form-{l}-{v}.png |
| web/components/auth/AuthModal.tsx | 원격 회원가입 응답 후 | verify 단계; 코드 입력/재전송, notice | signup-verify-{l}-{v}.png |
| web/components/auth/AuthModal.tsx | 브라우저 계정 가입 | 어댑터가 사용자를 즉시 반환하면 verify 생략; 실제 활성 설정 확인 못함 | signup-browser-result-{l}-{v}.png |
| web/components/auth/AuthModal.tsx | 비밀번호 찾기 | 복구 이메일 입력 화면 | login-recover-{l}-{v}.png |
| web/components/auth/AuthModal.tsx | 복구 코드 발급 후 | reset 단계; 코드/새 비밀번호/재전송/만료 또는 오류 | login-reset-{state}-{l}-{v}.png |
| web/components/auth/AuthModal.tsx | 복구 완료 | 완료 단계, 로그인으로 복귀 | login-reset-done-{l}-{v}.png |
| web/components/auth/AuthModal.tsx | 소셜 인증 버튼 | 허용된 OAuth URL이면 외부 이동, 브라우저 어댑터는 사용자 반환; 외부 UI 확인 못함 | login-provider-{provider}-{l}-{v}.png |
| web/components/auth/AuthModal.tsx:113 | 인증 입력 또는 요청 실패 | role=alert inline; invalid/credentials/network/rateLimit/conflict/unavailable | login-error-{code}-{l}-{v}.png |
| web/components/auth/AuthModal.tsx | 인증 요청 중/재전송 후 | 스피너/처리 문구/버튼 비활성/inline notice | login-busy-notice-{l}-{v}.png |
| web/components/auth/LoginRequired.tsx | 비로그인 프로필 또는 지갑 탭 | 로그인 필요 카드와 로그인 버튼, 전역 인증 모달 중첩 | login-required-{entry}-{l}-{v}.png |
| web/components/auth/AuthHost.tsx, web/stores/walletStore.ts:221 | 계정 첫 로그인 후 자산 복원 | 계정별 welcome 거래 없으면 코드상 10,000 USDT 테스트 잔액 증가; 별도 환영 팝업 없음 | first-login-balance-{l}-{v}.png |
| web/components/auth/AuthHost.tsx, web/stores/walletStore.ts:223 | 같은 계정 재방문 | welcome 중복 지급 차단, 해당 계정 자산 복원; 전용 재방문 화면 없음 | returning-account-{l}-{v}.png |
| web/components/auth/HeaderAuthControl.tsx, web/components/auth/AuthHost.tsx | 로그아웃 | 성공시 비로그인+중립 토스트; 실패시 세션 유지와 오류 토스트 | logout-{result}-{l}-{v}.png |
| web/stores/authStore.ts:110 | 포커스 복귀/다른 탭 비밀번호 변경/탈퇴 | credentials 또는 세션 버전 불일치시 clearSession; 전용 만료 모달/배너 없음 | account-session-expired-{l}-{v}.png |
| web/app/[locale]/profile/page.tsx:91 | 프로필 최초 진입 | hydrated=false 확인 중; 복원 실패는 비로그인 카드 | profile-hydrating-{l}-{v}.png |
| web/app/[locale]/profile/page.tsx | ?section=overview | 요약, 잔액/자산 수, 프로필 설정 상태; 일부 미준비 카운터 쉼표 표시 | profile-overview-{l}-{v}.png |
| web/app/[locale]/profile/page.tsx | ?section=profile | 프로필 이미지와 닉네임 설정 | profile-edit-{l}-{v}.png |
| web/app/[locale]/profile/page.tsx | ?section=security | 비밀번호 변경과 2단계 인증 | profile-security-{l}-{v}.png |
| web/app/[locale]/profile/page.tsx | ?section=wallet | 잔액/입출금 이동/거래 내역 | profile-wallet-{l}-{v}.png |
| web/app/[locale]/profile/page.tsx | ?section=activity | 활동 관련 네 링크 | profile-activity-{l}-{v}.png |
| web/app/[locale]/profile/page.tsx | ?section=account | 계정 정보와 탈퇴 details 확인사항 | profile-account-{l}-{v}.png |
| web/app/[locale]/profile/page.tsx:57 | 프로필 #reset_token=테스트값 | 토큰 소비 뒤 해시 삭제, inline 비밀번호 재설정 폼/검증/처리/오류/완료 | profile-reset-token-{state}-{l}-{v}.png |
| web/components/auth/NicknameSettings.tsx | 닉네임 입력 | 길이/형식/금칙어/동일 이름/사용 중 이름의 오류 | profile-nickname-invalid-{reason}-{l}-{v}.png |
| web/components/auth/NicknameSettings.tsx | 닉네임 중복 확인 | 요청 중/사용 가능/이미 사용/통신 실패, 확인 전 저장 제한 | profile-nickname-check-{state}-{l}-{v}.png |
| web/components/auth/NicknameSettings.tsx | 확인된 닉네임 저장 | 저장 중/완료/다음 변경 가능 날짜/서버 오류 | profile-nickname-save-{state}-{l}-{v}.png |
| web/components/auth/NicknameSettings.tsx:133 | 14일 제한 중 변경 시도 | 별도 제한 안내 모달; useModal 미사용 | profile-nickname-cooldown-{l}-{v}.png |
| web/components/auth/AvatarSettings.tsx | 사진 변경 파일 선택 | 브라우저 파일 선택창; jpg/png/webp, 5MB, 4천만 픽셀 제한 | profile-avatar-picker-{l}-{v}.png |
| web/components/auth/AvatarSettings.tsx | 유효한 사진 선택 | 미리보기, 확대/가로/세로 슬라이더, 384px 크롭 | profile-avatar-crop-{l}-{v}.png |
| web/components/auth/AvatarSettings.tsx | 사진 삭제 | inline 삭제 확인/취소 | profile-avatar-remove-{l}-{v}.png |
| web/components/auth/AvatarSettings.tsx | 사진 저장 또는 잘못된 파일 | 로딩/디코딩 실패/용량 오류/저장 실패/완료 inline | profile-avatar-result-{state}-{l}-{v}.png |
| web/components/auth/SecuritySettings.tsx | 프로필 보안 진입 | 상태 조회 로딩/실패+재시도/사용 중+등록 시각/미사용 | security-status-{state}-{l}-{v}.png |
| web/components/auth/SecuritySettings.tsx | 2단계 인증 해제 | inline 6자리 OTP/제출/오류/취소; 해제 완료는 미사용 상태 | security-disable-{state}-{l}-{v}.png |
| web/components/wallet/TwoFactorSetup.tsx | 프로필 등록 또는 출금의 2단계 인증 등록 | 시작/요청 중/실패+재시도 | security-setup-start-{state}-{l}-{v}.png |
| web/components/wallet/TwoFactorSetup.tsx | 등록 정보 발급 후 | QR, 수동 키, 복사, 인증 앱 세 가지 안내, 코드 입력 | security-setup-qr-{l}-{v}.png |
| web/components/wallet/TwoFactorSetup.tsx | 코드 인증 또는 복사 | 잘못된 코드 초기화/요청 실패/복사 성공 표시/복사 실패 inline/등록 완료 | security-setup-result-{state}-{l}-{v}.png |
| web/components/auth/PasswordChangeFlow.tsx | 비밀번호 변경 시작 | 상태 closed/loading/current/loadError+재시도 | password-start-{state}-{l}-{v}.png |
| web/components/auth/PasswordChangeFlow.tsx | 소셜 계정 비밀번호 변경 | social alertdialog; 이메일 계정과 다른 안내 | password-social-dialog-{l}-{v}.png |
| web/components/auth/PasswordChangeFlow.tsx | 현재 비밀번호 확인 실패 1~4회 | mismatch alertdialog, 남은 횟수 | password-mismatch-{attempt}-{l}-{v}.png |
| web/components/auth/PasswordChangeFlow.tsx | 현재 비밀번호 확인 실패 5회 | locked alertdialog, 해제 인증 유도 | password-locked-dialog-{l}-{v}.png |
| web/components/auth/PasswordChangeFlow.tsx | 잠금 해제 코드 요청 | 이메일 또는 브라우저 코드, 만료 타이머/재전송 대기 | password-unlock-code-{l}-{v}.png |
| web/components/auth/PasswordChangeFlow.tsx | 잠금 해제 코드 검증 | 오류/만료/시도 소진/전송 실패/해제 후 현재 비밀번호로 복귀 | password-unlock-{state}-{l}-{v}.png |
| web/components/auth/PasswordChangeFlow.tsx | 현재 비밀번호 통과 | 새 비밀번호/확인, 12~128자/일치/재사용 금지 조건 | password-new-{state}-{l}-{v}.png |
| web/components/auth/PasswordChangeFlow.tsx | 새 비밀번호 저장 전 | 등록한 TOTP 또는 이메일 코드 추가 인증; busy/오류 | password-new-proof-{method}-{l}-{v}.png |
| web/components/auth/PasswordChangeFlow.tsx | 비밀번호 변경 성공 | done 완료 화면, 세션 종료 후 확인하면 로그인 모달 | password-done-{l}-{v}.png |
| web/components/auth/AccountClosureFlow.tsx | 계정 탈퇴 시작 | 계정/자산 hydration 및 서비스 설정 대기, 사용할 수 없는 상태 | closure-start-{state}-{l}-{v}.png |
| web/components/auth/AccountClosureFlow.tsx:159 | 잔액 또는 미완료 거래가 있는 탈퇴 | 잔액 차단 팝업, 출금 이동; 비정상 잔액도 차단 | closure-balance-dialog-{l}-{v}.png |
| web/components/auth/AccountClosureFlow.tsx:166 | 보관/배송 중 상품이 있는 탈퇴 | 상품 차단 팝업, 보관함 이동 | closure-inventory-dialog-{l}-{v}.png |
| web/components/auth/AccountClosureFlow.tsx | 자산 정리 후 탈퇴 | verify 화면, 확인 체크박스, 이메일 코드/브라우저 테스트 코드 표시 분기 | closure-verify-{mode}-{l}-{v}.png |
| web/components/auth/AccountClosureFlow.tsx | 탈퇴 코드 확인 | 미동의/잘못된 코드/만료/요청 실패/처리 중 inline | closure-error-{state}-{l}-{v}.png |
| web/components/auth/AccountClosureFlow.tsx:184 | 탈퇴 완료 | done 팝업, 세션 정리 후 홈 이동 | closure-done-{l}-{v}.png |

## 4. 지갑, 입금, 출금, 거래 기록

입금 주소 발급, 송금, 출금, 이메일 전송은 실행하지 않았다. 서버에 의존하는 상태는 렌더 분기의 존재만 확인했다.

| 파일 경로 | 띄우는 방법 | 필요한 상태 | 제안 스크린샷 파일명 |
| --- | --- | --- | --- |
| web/components/wallet/DepositModal.tsx | 헤더 잔액/충전 또는 홈 #deposit | 지갑 dialog, USDT/출금/내역 탭 | wallet-modal-{tab}-{l}-{v}.png |
| web/components/wallet/DepositModal.tsx:124 | 로그인 후 입금 또는 출금 탭 | 활성 탭 아래 거래 내역도 함께 렌더됨 | wallet-tab-with-history-{tab}-{l}-{v}.png |
| web/components/wallet/WithdrawalModal.tsx | 보관함 잔액 관리의 출금 | 독립 출금 dialog; 내부 WithdrawTab 공유 | wallet-withdraw-shell-{l}-{v}.png |
| web/components/wallet/UsdtDepositTab.tsx | 비로그인 입금 탭 | LoginRequired, 로그인 모달 중첩 | deposit-guest-{l}-{v}.png |
| web/components/wallet/UsdtDepositTab.tsx | 입금 네트워크 변경 | TRC20/BEP20/ERC20 라디오, 추천 및 네트워크 주의 | deposit-network-{network}-{l}-{v}.png |
| web/components/wallet/UsdtDepositTab.tsx | 네트워크 선택 직후 | 주소 발급 로딩/실패; 별도 재시도 버튼은 없음 | deposit-address-{state}-{l}-{v}.png |
| web/components/wallet/UsdtDepositTab.tsx:168 | 입금 주소 발급 완료 | QR/주소/복사/네트워크/입금 안내 | deposit-address-ready-{network}-{l}-{v}.png |
| web/components/wallet/UsdtDepositTab.tsx | 주소 복사 | 1.8초 복사 표시; 복사 실패 catch는 화면 안내 없음 | deposit-copy-{result}-{l}-{v}.png |
| web/components/wallet/UsdtDepositTab.tsx | 입금 상태 대기 | waiting/checking/pending, 확인 수와 진행 막대; 5초 폴링 | deposit-pending-{state}-{l}-{v}.png |
| web/components/wallet/UsdtDepositTab.tsx | 입금 확인 완료 | credited 금액 inline와 홈 완료 토스트 | deposit-credited-{l}-{v}.png |
| web/components/wallet/UsdtDepositTab.tsx | 폴링 통신 실패 | checking으로 돌아감; 전용 오프라인 화면 없음 | deposit-poll-failure-{l}-{v}.png |
| web/components/wallet/WithdrawTab.tsx | 비로그인 출금 탭 | LoginRequired | withdraw-guest-{l}-{v}.png |
| web/components/wallet/WithdrawTab.tsx:213 | 로그인 출금 진입 | 보안 상태 로딩/조회 실패+재시도 | withdraw-security-{state}-{l}-{v}.png |
| web/components/wallet/WithdrawTab.tsx:225 | 2단계 인증 미등록 출금 | 등록 컴포넌트 자동 시작 또는 이메일 인증 대안 | withdraw-security-choice-{l}-{v}.png |
| web/components/wallet/WithdrawTab.tsx | 출금 양식 | TRC20/BEP20, 주소, 암호화폐 잔액, 선택 통화 금액, 25%/50%/최대, 수수료/실수령액 | withdraw-form-{network}-{l}-{v}.png |
| web/components/wallet/WithdrawTab.tsx, web/lib/withdrawal.ts | 출금 금액/주소 입력 | 잔액0/부족/충분, 최소20 USDT 미달, 잘못된 주소, 양식 검증 오류 | withdraw-invalid-{reason}-{l}-{v}.png |
| web/components/wallet/WithdrawTab.tsx | 최근 주소 영역 | 최근 거래가 있을 때 최대4개 주소 선택; 없을 때 영역 미표시 | withdraw-recent-address-{state}-{l}-{v}.png |
| web/components/wallet/WithdrawSteps.tsx | 유효한 출금 양식에서 계속 | ConfirmStep; 네트워크/전체 주소/금액/수수료/실수령액, 확인/뒤로 | withdraw-confirm-{l}-{v}.png |
| web/components/wallet/WithdrawSteps.tsx | 2단계 인증 출금 확인 | OtpStep 6자리 입력, 처리 중, 남은 시도 | withdraw-otp-{l}-{v}.png |
| web/components/wallet/WithdrawSteps.tsx | OTP 불일치 또는 요청 실패 | credentials/invalid 최대3회; rateLimit은 바로 이메일 단계, 일반 네트워크 실패는 inline | withdraw-otp-error-{code}-{l}-{v}.png |
| web/components/wallet/WithdrawSteps.tsx | OTP 실패 대안 또는 이메일로 진행 | EmailHoldStep; 등록 이메일 발송/재전송/코드/브라우저 코드 분기/72시간 보류 안내 | withdraw-email-{mode}-{l}-{v}.png |
| web/components/wallet/WithdrawSteps.tsx | 이메일 코드 확인 | 발송 중/불일치/만료/통신 실패/인증 중 | withdraw-email-error-{state}-{l}-{v}.png |
| web/components/wallet/WithdrawTab.tsx | 인증 후 출금 제출 | submitting 처리 중; 응답 실패 inline | withdraw-submitting-{result}-{l}-{v}.png |
| web/components/wallet/WithdrawTab.tsx | 출금 요청 결과 | PENDING 또는 PENDING_ADMIN_REVIEW, 금액/심사 안내/진행 막대 | withdraw-done-{status}-{l}-{v}.png |
| web/components/wallet/WithdrawTab.tsx | 이메일 출금 요청 결과 | PENDING_72H_HOLD 보류 안내/해제 시각 | withdraw-done-hold-{l}-{v}.png |
| web/components/wallet/WithdrawTab.tsx | 전송 결과 갱신 | BROADCASTING/COMPLETED/CANCELLED/FAILED, 상태별 문구 | withdraw-done-terminal-{status}-{l}-{v}.png |
| web/components/wallet/WithdrawTab.tsx | 결과 거래 해시 영역 | 해시 없음/있음, 복사 피드백, 탐색기 외부 링크, 다시 출금/닫기 | withdraw-done-hash-{state}-{l}-{v}.png |
| web/components/wallet/HistoryTab.tsx | 비로그인 내역 탭 | LoginRequired | wallet-history-guest-{l}-{v}.png |
| web/components/wallet/HistoryTab.tsx | 내역 탭 또는 프로필 지갑 | 전체/입금/출금 필터; 내역 없음의 빈 카드 | wallet-history-empty-{filter}-{l}-{v}.png |
| web/components/wallet/HistoryTab.tsx | 기존 입금 거래 보기 | deposit_usdt/deposit_card, 대기/완료/실패; 카드 신규 결제 폼은 찾지 못함 | wallet-history-deposit-{type}-{status}-{l}-{v}.png |
| web/components/wallet/HistoryTab.tsx | 기존 출금 거래 보기 | OTP/이메일 방법; PENDING/PENDING_ADMIN_REVIEW/BROADCASTING/COMPLETED/CANCELLED/FAILED | wallet-history-withdraw-{status}-{l}-{v}.png |
| web/components/wallet/HistoryTab.tsx | 72시간 보류 거래 보기 | 카운트다운 남음/해제 시각 지남, 취소 가능 조건 | wallet-history-hold-{state}-{l}-{v}.png |
| web/components/wallet/HistoryTab.tsx | 보류 출금 취소 클릭 | serverId 필요; 취소 처리 중/성공 CANCELLED/실패 inline | wallet-history-cancel-{state}-{l}-{v}.png |
| web/components/wallet/HistoryTab.tsx | 거래 상세 펼쳐지는 행 보기 | 수수료/실수령액/마스킹 이메일/영수증/주소/해시의 선택적 표시 | wallet-history-details-{type}-{l}-{v}.png |
| web/components/wallet/HistoryTab.tsx | 주소나 해시 복사 | 복사 성공 및 실패 안내, 긴 값 title 툴팁 | wallet-history-copy-{result}-{l}-{v}.png |
| web/components/wallet/HistoryTab.tsx:108 | 10초 상태 폴링 실패 | 기존 내역 유지, 실패 안내 추가 없음 | wallet-history-poll-failure-{l}-{v}.png |
| web/components/wallet/WithdrawTab.tsx, web/app/[locale]/page.tsx:227 | onBlocked 콜백 조사 | 부모 AML 토스트 정의는 있으나 WithdrawTab 내부 호출 없음; 화면에서 띄우는 경로 확인 못함 | unreachable-withdraw-blocked-{l}-{v}.png |

## 5. 보관함, USDT로 받기, 배송과 추적

보관함 배송은 requestEnabled를 전달한다. 개봉 결과에서 여는 배송은 이 속성이 없어서 기본 비활성 상태라는 차이가 있다.

| 파일 경로 | 띄우는 방법 | 필요한 상태 | 제안 스크린샷 파일명 |
| --- | --- | --- | --- |
| web/app/[locale]/inventory/page.tsx | 보관함 최초 진입 | 자산 hydration 중 로딩; 비로그인 전용 차단 화면 없음 | inventory-loading-{l}-{v}.png |
| web/app/[locale]/inventory/page.tsx | 기본 보관 탭 | IN_STORAGE 카드, 잔액 관리, 자산 요약 | inventory-held-{l}-{v}.png |
| web/app/[locale]/inventory/page.tsx | ?tab=shipping | SHIPPING_REQUESTED/SHIPPING/DELIVERED 기록 | inventory-shipping-{status}-{l}-{v}.png |
| web/app/[locale]/inventory/page.tsx | ?tab=done | 판매/현금 지급 완료 기록 | inventory-done-{kind}-{l}-{v}.png |
| web/app/[locale]/inventory/page.tsx | 탭별 기록 없음 | 보관/배송/완료 각각 빈 상태와 이동 링크 | inventory-empty-{tab}-{l}-{v}.png |
| web/app/[locale]/inventory/page.tsx | 검색/종류/기간/정렬 변경 | 검색어, 탭별 종류, 전체/7/30/90일, 최신/오래된/높은 가격 | inventory-filter-{tab}-{l}-{v}.png |
| web/app/[locale]/inventory/page.tsx | 해당하지 않는 검색 조건 | 검색 결과 없음, 필터 해제 | inventory-no-results-{l}-{v}.png |
| web/app/[locale]/inventory/page.tsx | 24개 이상에서 더 보기 | 24개씩 추가 기록 노출 | inventory-pagination-{l}-{v}.png |
| web/app/[locale]/inventory/page.tsx:190 | 보관 상품 하나 또는 여러 개 선택 | 고정 선택 바/선택 해제/배송/USDT로 받기, 금액 | inventory-selection-{count}-{l}-{v}.png |
| web/app/[locale]/inventory/page.tsx | 배송/완료 행 기록 details 펼치기 | ID/획득일/처리일/가격/지급액/자금 출처; 금액과 날짜 미상 대체 문구 | inventory-record-{state}-{l}-{v}.png |
| web/components/inventory/SellConfirmModal.tsx | 보관함 USDT로 받기 | alertdialog; 한 개/여러 개, 환급 비율/금액, 확인/취소 | inventory-sell-confirm-{count}-{l}-{v}.png |
| web/app/[locale]/inventory/page.tsx | 환급 확인 성공 | 잔액 증가와 완료 탭 기록, workspace-toast | inventory-sell-done-{l}-{v}.png |
| web/components/inventory/DeliveryModal.tsx | 보관함 배송 신청 | dialog, 하나/여러 상품, 수령인/연락처/국가/주소/우편번호/배송비 | shipping-form-{count}-{l}-{v}.png |
| web/components/inventory/DeliveryModal.tsx | 국가 KR 선택 | 개인통관고유부호 입력과 관련 외부 링크 | shipping-country-kr-{l}-{v}.png |
| web/components/inventory/DeliveryModal.tsx | 국가 CN 선택 | 주민 식별 정보 입력 | shipping-country-cn-{l}-{v}.png |
| web/components/inventory/DeliveryModal.tsx | 그 밖의 지원 국가 선택 | 해당 통관 필드 없는 양식 | shipping-country-other-{l}-{v}.png |
| web/components/inventory/DeliveryModal.tsx | 필수 항목 누락/잘못된 입력 | 필드 검증 문구와 제출 제한 | shipping-form-invalid-{l}-{v}.png |
| web/components/inventory/DeliveryModal.tsx | 배송비보다 적은 잔액 | 배송비 부족 안내/제출 제한 | shipping-insufficient-{l}-{v}.png |
| web/components/inventory/DeliveryModal.tsx | 배송 제출 | 처리 중, 반환 영수증 검증 후 완료 요약; 실패는 한국어 inline | shipping-submit-{state}-{l}-{v}.png |
| web/components/inventory/DeliveryModal.tsx:74, web/components/unboxing/UnboxingRoulette.tsx:746 | 개봉 결과에서 배송 클릭 | requestEnabled 미전달로 필드/제출 비활성; 여기서는 배송 접수 완료까지 진행 불가 | shipping-from-opening-disabled-{l}-{v}.png |
| web/components/inventory/TrackingModal.tsx | 배송 기록 추적 버튼 | 요청 접수/라벨/이동/배송 완료에 따른 4단계 타임라인 | shipping-track-{stage}-{l}-{v}.png |
| web/components/inventory/TrackingModal.tsx, web/lib/carriers.ts | 추적 창의 운송 정보 | 운송장 없음/있음, 복사, 택배사 외부 링크, 수령인 정보 | shipping-track-number-{state}-{l}-{v}.png |
| web/components/inventory/CancelShipmentModal.tsx | 배송 요청 기록에서 취소 | 아직 출발 전이며 배송비 정보가 있는 경우 확인 dialog | shipping-cancel-confirm-{l}-{v}.png |
| web/components/inventory/CancelShipmentModal.tsx | 취소 불가능한 기록 | 배송비 미상/준비 단계 아님/이미 바뀐 상태의 안내 | shipping-cancel-blocked-{reason}-{l}-{v}.png |
| web/components/inventory/CancelShipmentModal.tsx | 취소 확정 | 진행 중/실패 inline/성공 후 보관 탭+배송비 반환 안내 토스트 | shipping-cancel-result-{state}-{l}-{v}.png |
| web/components/fairness/VisualVerifyModal.tsx | 보관함 검증 버튼 | dialog 안 자동 검증, 로딩/일치/불일치/옛 기록 부분 검증 | inventory-verify-{state}-{l}-{v}.png |
| web/app/[locale]/inventory/page.tsx, web/lib/community.ts | 100 USDT 이상 자산의 후기 쓰기 | 중복 후기 없는 자산; 보관/배송/완료 상태 모두 자격 가능; community?tab=eligible&item=ID | inventory-review-entry-{l}-{v}.png |
| web/stores/inventoryStore.ts, web/lib/shipping.ts | 배송 상태 새로고침/복원 | 서버 상태 동기화, 실패 시 별도 전역 알림 없음; 실제 서버 진행 확인 못함 | shipping-refresh-failure-{l}-{v}.png |

## 6. 상품 후기와 게시판

게시판은 별도 라우트이며 글 작성 모달, 이미지 입력, 댓글의 inline 확인을 포함한다. 운영 예시 데이터와 사용자 글을 구분했다.

| 파일 경로 | 띄우는 방법 | 필요한 상태 | 제안 스크린샷 파일명 |
| --- | --- | --- | --- |
| web/app/[locale]/community/page.tsx, web/components/community/CommunityNavigation.tsx | 커뮤니티 상품 후기 탭 | public/mine/eligible 이동, 게시판 링크 | community-navigation-{l}-{v}.png |
| web/app/[locale]/community/page.tsx | 후기 최초 진입 | hydration 중 로딩 | community-loading-{l}-{v}.png |
| web/app/[locale]/community/page.tsx | 전체 후기 | 공개 후기/사진/별점/상품/가격/작성자/시각, 예시 데이터 병합 | community-public-{l}-{v}.png |
| web/app/[locale]/community/page.tsx | 내 후기 탭 | 내 글 있음/없음; 비로그인 상태와 로컬 기록 조건도 확인 필요 | community-mine-{state}-{l}-{v}.png |
| web/app/[locale]/community/page.tsx | 작성 가능한 상품 탭 | 100 USDT 이상, 작성하지 않은 자산 목록; 자산 없음/기준 미달 안내 | community-eligible-{state}-{l}-{v}.png |
| web/app/[locale]/community/page.tsx | 검색/별점/사진/정렬 조작 | 새순/오래된순, 필터 결과 없음, 12개씩 더 보기 | community-filter-{state}-{l}-{v}.png |
| web/app/[locale]/community/page.tsx | 긴 후기 더 보기 | 240자 넘는 본문 펼침/접힘; 사진 및 옛 보상 표시 조건 | community-expanded-{l}-{v}.png |
| web/app/[locale]/community/page.tsx | 내 후기 삭제 | 행 안 확인/취소, 삭제 완료 토스트 또는 실패 토스트 | community-delete-{state}-{l}-{v}.png |
| web/components/community/ReviewFormModal.tsx | 작성 가능 상품 또는 ?item=ID 또는 내 글 수정 | 후기 dialog; 작성/수정, 대상 상품 select | review-form-{mode}-{l}-{v}.png |
| web/components/community/ReviewFormModal.tsx | 후기 별점/본문 입력 | 별점1~5 라디오, 본문5~1200자, 글자 수 | review-form-input-{l}-{v}.png |
| web/components/community/ReviewFormModal.tsx | 사진 첨부 | 파일 선택창, jpg/png/webp, 최대 치수960으로 축소, 4천만 픽셀 제한 | review-photo-{state}-{l}-{v}.png |
| web/components/community/ReviewFormModal.tsx, web/components/community/reviewValueNotice.ts | 자격 없음 또는 잘못된 입력 | 대상 없음/자격 변경/본문/별점/사진/저장 오류 inline | review-form-error-{reason}-{l}-{v}.png |
| web/components/community/ReviewFormModal.tsx | 후기 저장 | 진행 중/완료 후 내 후기 탭+토스트; 닫기 경로 별도 존재 | review-save-{state}-{l}-{v}.png |
| web/stores/usePublishedReviews.ts, web/lib/publishedReviewExamples.ts | 공개 후기 새로고침 | 원격 실패는 삼키고 예시 병합; 전용 실패 화면 없음, 완전 빈 상태 재현 조건 확인 못함 | community-remote-failure-{l}-{v}.png |
| web/components/community/CommunityBoard.tsx | 게시판 진입 | 전체/general/question/tips/notice 카테고리, 목록, 예시 표시 | board-list-{category}-{l}-{v}.png |
| web/components/community/CommunityBoard.tsx | 게시판 새로고침 | 로딩/실패+재시도 | board-refresh-{state}-{l}-{v}.png |
| web/components/community/CommunityBoard.tsx | 검색/내 글/정렬/페이지 선택 | 15개씩 페이지, 검색 결과 없음/내 글 없음 | board-filter-{state}-{l}-{v}.png |
| web/components/community/CommunityBoard.tsx, web/lib/board.ts | 예시 숨기기/보이기 | 운영 예시 글과 댓글, 예시 숨김 뒤 빈 목록 | board-examples-{visibility}-{l}-{v}.png |
| web/components/community/CommunityBoard.tsx | 게시글 클릭 또는 ?post=ID | 상세 본문/사진/댓글/작성자/시간; 없거나 삭제된 글 안내 | board-post-{state}-{l}-{v}.png |
| web/components/community/CommunityBoard.tsx | 비로그인으로 글/댓글 작성 | 로그인 유도와 AuthModal | board-write-guest-{l}-{v}.png |
| web/components/community/BoardComposer.tsx | 로그인 후 글쓰기 | dialog; 제목/본문/카테고리 select/사진, 새 글 | board-composer-create-{l}-{v}.png |
| web/components/community/BoardComposer.tsx | 본인 글 수정 | 수정 dialog; 원본 값과 revision 충돌 조건 | board-composer-edit-{l}-{v}.png |
| web/components/community/BoardComposer.tsx | 관리 권한으로 글쓰기 | 공지 카테고리/상단 고정 선택; 일반 사용자에는 제한 | board-composer-admin-{l}-{v}.png |
| web/components/community/BoardComposer.tsx | 작성 중 닫기 또는 재진입 | 계정별 세션 초안 복원, 자동 저장 상태/저장 오류 | board-composer-draft-{state}-{l}-{v}.png |
| web/components/community/BoardComposer.tsx | 초안 버리기 | 모달 내부 inline 확인/취소 | board-composer-discard-{l}-{v}.png |
| web/components/community/BoardComposer.tsx | 사진 첨부 | 최대3장 jpg/png/webp, 미리보기/삭제/입력 오류 | board-composer-images-{state}-{l}-{v}.png |
| web/components/community/BoardComposer.tsx | 제목/본문 잘못 입력 또는 저장 실패 | 제목2~100자, 본문5~10000자, 금지 내용/권한/충돌/통신 오류 | board-composer-error-{reason}-{l}-{v}.png |
| web/components/community/BoardComposer.tsx | 글 저장 | busy, 성공 후 목록/상세 갱신과 저장 토스트 | board-composer-save-{l}-{v}.png |
| web/components/community/CommunityBoard.tsx | 글 삭제 | 작성자/관리 권한, inline 확인/취소/처리/오류/삭제 토스트 | board-post-delete-{state}-{l}-{v}.png |
| web/components/community/CommunityBoard.tsx | 글 링크 복사 | 성공 토스트, 실패 inline | board-copy-{result}-{l}-{v}.png |
| web/components/community/CommunityBoard.tsx | 댓글 영역 | 댓글 없음/있음, 작성 폼, 1000자 제한 | board-comments-{state}-{l}-{v}.png |
| web/components/community/CommunityBoard.tsx | 댓글 등록/수정 | 로그인/작성자 또는 관리 권한, inline 편집/취소/저장/실패 | board-comment-edit-{state}-{l}-{v}.png |
| web/components/community/CommunityBoard.tsx | 댓글 삭제 | inline 확인/취소/오류, 삭제 완료 안내 | board-comment-delete-{state}-{l}-{v}.png |
| web/components/community/CommunityBoard.tsx, web/lib/board.ts, web/lib/boardApi.ts | 글이나 댓글 변경 중 서버/권한 문제 | login/length/comment_length/comment_limit/content_blocked/forbidden/not_found/conflict/invalid/invalid_response/network/storage 등 메시지 매핑 | board-api-error-{code}-{l}-{v}.png |

## 7. 소개와 공정성

소개 페이지의 시뮬레이션, 실제 기록 검증, 임의 문자열 해시 설명은 서로 다른 화면이다.

| 파일 경로 | 띄우는 방법 | 필요한 상태 | 제안 스크린샷 파일명 |
| --- | --- | --- | --- |
| web/app/[locale]/about/page.tsx, web/components/about/IsometricStage.tsx | 소개 상단 | 3D 금고/상품 무대, 포인터 기울기/발광, 소개 CTA | about-hero-{l}-{v}.png |
| web/components/about/AboutSections.tsx:72 | 소개 신뢰 수치 영역 | TrustTelemetryStrip 네 지표 | about-telemetry-{l}-{v}.png |
| web/components/about/AboutSections.tsx:114 | 소개 라인업 영역 | LineupStrip 상품 세 타일 | about-lineup-{l}-{v}.png |
| web/components/about/AboutSections.tsx:451 | 소개 핵심 기능 영역 | InteractiveCoreCards 추첨/배송/환급 카드 | about-core-{l}-{v}.png |
| web/components/about/AboutSections.tsx:156 | 추첨 설명 카드 기다림 | DrawCard 단계/수치 자동 변화; 실제 구매가 아닌 예시 | about-draw-demo-{phase}-{l}-{v}.png |
| web/components/about/AboutSections.tsx:261 | 추첨 설명의 시드 버튼 | seedOpen inline 설명 펼침/접힘 | about-seed-explanation-{l}-{v}.png |
| web/components/about/AboutSections.tsx:275 | 배송 설명 카드 기다림 | ShipCard 약1.3초 간격 단계 변경 | about-shipping-demo-{step}-{l}-{v}.png |
| web/components/about/AboutSections.tsx:341 | 환급 카드 배송/현금 선택 또는 대기 | CashCard 두 선택/호버/자동 전환 | about-cash-demo-{mode}-{l}-{v}.png |
| web/app/[locale]/about/page.tsx | 이용 방법 영역 | 3개 설명 카드 | about-how-to-{l}-{v}.png |
| web/components/about/AboutSections.tsx:581 | 소개 시나리오 영역 | LiveScenarioHUD 상품 데이터 기반 예시 영수증 두 장 | about-receipts-{l}-{v}.png |
| web/components/about/AboutSections.tsx:509 | 예시 영수증의 slot/ship/cash 용어 클릭 | ReceiptCard inline role=note 설명 | about-receipt-note-{term}-{l}-{v}.png |
| web/components/about/AboutSections.tsx:667 | 소개 신뢰 원칙 영역 | TrustGuardrails 설명/링크 | about-guardrails-{l}-{v}.png |
| web/app/[locale]/about/page.tsx | 소개 FAQ 질문 선택 | 네이티브 details 세 개 펼침/접힘 | about-faq-{index}-{l}-{v}.png |
| web/app/[locale]/fairness/page.tsx | 공정성 페이지 진입 | 세 단계 설명/검증 범위/FAQ4개/기록 접기 | fairness-overview-{l}-{v}.png |
| web/components/fairness/VisualVerifier.tsx | 공정성 페이지 검증기 | 최근 기록 select; 기록 없음과 보관함 이동 | fairness-visual-empty-{l}-{v}.png |
| web/components/fairness/VisualVerifier.tsx | 기록 선택 후 검증 | 계산 중, 해시/추첨값/상품 세 검사 | fairness-visual-running-{l}-{v}.png |
| web/components/fairness/VisualVerifier.tsx, web/components/fairness/verifyRecord.ts | 검증 결과 | 세 검사 통과/불일치/증거 부족 null, 옛 기록 부분 검증, verdict | fairness-visual-result-{state}-{l}-{v}.png |
| web/components/fairness/VisualVerifier.tsx | 검증 계산 실패 | inline 오류와 다시 실행 | fairness-visual-error-{l}-{v}.png |
| web/components/fairness/VisualVerifier.tsx | 검증 근거 details | 서버 시드/해시/클라이언트 시드/nonce/표 버전, JSON 내려받기 | fairness-evidence-{l}-{v}.png |
| web/components/fairness/VisualVerifier.tsx | 페이지 검증기의 수동 검증 펼치기 | embedded=false일 때 compact FairnessVerifier; 모달에서는 숨김 | fairness-manual-expanded-{l}-{v}.png |
| web/components/fairness/FairnessVerifier.tsx | 수동 검증 입력 | 상자 select/서버 시드/해시/클라이언트 시드/nonce, 클라이언트 시드 생성 | fairness-manual-input-{l}-{v}.png |
| web/components/fairness/FairnessVerifier.tsx | 수동 검증 실행 | 입력 오류/처리 중/해시 일치/불일치/해시 생략/결과 구간/당첨 상품 | fairness-manual-result-{state}-{l}-{v}.png |
| web/components/fairness/FairnessVerifier.tsx | 시드 예제 생성과 공개 | 가려진 시드/공개/검증기로 복사/초기화/확률 구간 표 | fairness-seed-demo-{state}-{l}-{v}.png |
| web/components/fairness/HashExplainer.tsx | 해시 설명 입력 수정 | 임의 문자열 VOILA 기본값, 200자 제한, 실제 SHA-256 계산 | fairness-hash-input-{l}-{v}.png |
| web/components/fairness/HashExplainer.tsx:35 | 해시 계산 대기 또는 실패 | output의 computing/computeError; 최초 입력 disabled | fairness-hash-{state}-{l}-{v}.png |
| web/components/fairness/ProofFeed.tsx | 공정성 기록 details 펼치기 | 로컬/원격 실제 기록, 빈 상태, 서버 갱신 실패 inline | fairness-feed-{state}-{l}-{v}.png |
| web/components/fairness/ProofFeed.tsx | 준비금 정보 영역 | 설정 주소 있을 때만 노출, 잔액 미상/있음, 주소 복사/탐색기; 실제 설정 확인 못함 | fairness-reserve-{state}-{l}-{v}.png |
| web/components/fairness/VisualVerifyModal.tsx | 보관함 또는 개봉 결과 검증 버튼 | modal 자동 실행/닫기; 상세 증거와 JSON 다운로드, 수동 폼 없음 | fairness-modal-{l}-{v}.png |

## 8. 개봉, 자동 열기, 대량 개봉, 일일 상자와 효과음

주석이 아니라 현재 호출과 상태 대입을 기준으로 활성 여부를 판별했다. 니어미스와 승급 반전은 잔존 코드이며 문지기와 고등급 근처 감속은 현재 호출된다.

| 파일 경로 | 띄우는 방법 | 필요한 상태 | 제안 스크린샷 파일명 |
| --- | --- | --- | --- |
| web/components/unboxing/UnboxingRoulette.tsx, web/lib/opening.ts | 충분한 잔액으로 상세 구매 확인 | 전체 개봉 dialog, 서버 해시/음소거/닫기, idle/gate/spinning/landed/results | opening-shell-{phase}-{l}-{v}.png |
| web/components/unboxing/VaultGateFX.tsx, web/components/unboxing/UnboxingRoulette.tsx:321 | 수동 개봉 시작 | 자동/데모/동작 줄이기 아닌 경우 문지기 연출; 약900ms 바퀴+800ms 오라+420ms 암전 | opening-gate-{phase}-{l}-{v}.png |
| web/components/unboxing/VaultGateFX.tsx | 문지기 오라 구간 | 청색/보라/금색 발광, 금색 SVG, 단계 문구 | opening-gate-aura-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx:225, web/lib/reel.ts | 한 개 개봉 회전 | 88개 타일/목표79, 약4.2초, 속도에 따른 흐림 | opening-single-spin-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx:267 | 회전 후반 고등급 타일 근처 | progress .7~.965 구간 showcaseNear이면 anim.speed=.3; 활성 감속 분기 | opening-showcase-slowdown-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx:227, web/lib/reel.ts | 니어미스 경로 추적 | nearMissRef=null, buildStrip에 showcase 인자 없음; 일반 UI 재현 경로 확인 못함 | unreachable-opening-nearmiss-{l}-{v}.png |
| web/components/unboxing/UpgradeFX.tsx, web/components/unboxing/UnboxingRoulette.tsx:469 | 승급 반전 경로 추적 | 조건부 컴포넌트는 있지만 disguise/upgradeFx를 켜는 대입 없음; 활성 호출 확인 못함 | unreachable-opening-upgrade-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx | 낮은 등급 착지 | 결과 강조/붉은 flash, 당첨음 | opening-land-low-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx, web/components/unboxing/MegaWinFX.tsx | royal/prestige 당첨 | 금색 발광, 동전/색종이/진동 계열 시각 효과 | opening-land-high-{tier}-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx | 수량5 또는10 구매 | 약2.4초 회전씩, 수동 결과 간 약700ms, 누적 상품/진행 표시 | opening-multi-progress-{qty}-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx | 회전 중 건너뛰기 또는 닫기 | skip 플래그와 애니메이션 완료, 구매 결과는 결과 단계로 이어짐 | opening-skip-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx | 한 개 개봉 완료 | 중첩 결과 패널, 상품/등급/가치/현금 자동 지급 안내 | opening-result-single-{kind}-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx | 여러 개 개봉 완료 | 상품 목록/합계/지출액/개별 검증 버튼 | opening-result-multi-{qty}-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx | 결과에서 USDT로 받기 | 환급 전/후/현금 상품 자동 지급 상태, 다시 열기/배송/보관함 이동 | opening-result-cashout-{state}-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx | 결과 증거 펼치기 또는 검증 클릭 | details와 VisualVerifyModal 중첩; 개별 검증 title 툴팁 | opening-result-proof-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx:461 | 첫 구매부터 실패하거나 결과 없음 | openError/구매 안 됨/자동 잔액 부족 안내; 이미 결과가 있으면 결과 요약으로 감 | opening-empty-error-{reason}-{l}-{v}.png |
| web/components/unboxing/AutoplaySettingsModal.tsx | 상세 자동 열기 | dialog, 10/25/50/100/무한 횟수 선택 | autoplay-settings-{spins}-{l}-{v}.png |
| web/components/unboxing/AutoplaySettingsModal.tsx, web/lib/autoplay.ts | 자동 열기 조건 설정 | 자동 환급/잭팟 중단/배수 도달/손실 한도, 체크박스와 수치 입력; 기본 자동 환급/잭팟 중단 켬 | autoplay-conditions-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx | 자동 시작 | 문지기 생략, 회차 간 약550ms, 자동 환급과 누적 금액 | autoplay-running-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx, web/lib/autoplay.ts | 자동 중지 조건 충족 | 횟수/잭팟/배수/손실/잔액/수동 중지; 결과가 여러 개일 때 중지 이유 표시 | autoplay-stop-{reason}-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx | 자동 첫 회 후 중지 | 결과1개 경로에는 여러 개 요약의 중지 이유 행이 없음 | autoplay-stop-single-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx, web/components/layout/MotionPreferences.tsx | 동작 줄이기 활성 후 개봉 | 문지기/일부 FX 생략, 회전 duration=.01; 실제 접근성 설정 표시 확인 못함 | opening-reduced-motion-{l}-{v}.png |
| web/components/unboxing/BulkOpenModal.tsx, web/lib/autoplay.ts | 수량50 또는100 구매 확인 | BULK_THRESHOLD=50; 룰렛 대신 대량 dialog | bulk-start-{qty}-{l}-{v}.png |
| web/components/unboxing/BulkOpenModal.tsx | 대량 개봉 진행 | 약1500ms 숫자 증가/진행 막대, 효과음 | bulk-progress-{qty}-{l}-{v}.png |
| web/components/unboxing/BulkOpenModal.tsx | 진행 중 X 또는 건너뛰기 | 대량 결과 즉시 표시 | bulk-skip-{l}-{v}.png |
| web/components/unboxing/BulkOpenModal.tsx | 대량 개봉 완료 | 가치순 상품 그리드/총지출/총가치/순손익/등급, 약1.2초 숫자 변화 | bulk-summary-{qty}-{l}-{v}.png |
| web/components/unboxing/BulkOpenModal.tsx | 대량 고등급 결과 | best가 royal/prestige일 때 MegaWinFX | bulk-jackpot-{tier}-{l}-{v}.png |
| web/components/unboxing/BulkOpenModal.tsx | 대량 결과 전체 USDT로 받기 | 환급 전/완료/현금 이미 지급; 다시 열기/닫기, 직접 배송/검증 버튼 없음 | bulk-cashout-{state}-{l}-{v}.png |
| web/components/unboxing/MegaWinFX.tsx | 일반/대량 고등급 연출 | 직접 만든 동전34개/색종이60개, CSS animation; canvas-confetti 호출 아님 | opening-confetti-{l}-{v}.png |
| web/components/home/DailyFreeBox.tsx | 홈 헤더 일일 상자 선물 버튼 | 일일 modal; 인증 검사 없이 브라우저 daily 상태 사용 | daily-modal-{l}-{v}.png |
| web/components/home/DailyFreeBox.tsx | 일일 상자 선택 전 | pick 상태 세 카드/지급 가능 범위/확률표 | daily-pick-{l}-{v}.png |
| web/components/home/DailyFreeBox.tsx | 카드 하나 선택 | revealing 약900ms, 금색 flash | daily-revealing-{l}-{v}.png |
| web/components/home/DailyFreeBox.tsx | 일일 지급 완료 | done, 금액/roll/nonce, 완료 토스트/효과음 | daily-done-{l}-{v}.png |
| web/components/home/DailyFreeBox.tsx, web/stores/dailyStore.ts | 24시간 안에 재방문 | 남은 시간/이용 제한; 만료 후 선택 가능 | daily-cooldown-{state}-{l}-{v}.png |
| web/components/home/DailyFreeBox.tsx | 일일 계산 예외 | 명시적 실패 catch/별도 실패 화면 없음; 실제 예외 재현 확인 못함 | daily-compute-failure-{l}-{v}.png |
| web/lib/audio.ts, web/stores/settingsStore.ts | 개봉 음소거 버튼 전환 | 음소거 상태 저장, 문서 hidden일 때 중단; 소리 자체는 확인 못함 | opening-audio-muted-{state}-{l}-{v}.png |
| web/lib/audio.ts | 수동/대량 시작과 회전 | lid-open/latch-click/bulk-open WAV와 합성 tick/heartbeat; 스크린샷에는 해당 단계만 남김 | opening-audio-start-{l}-{v}.png |
| web/lib/audio.ts | 일반/고등급 당첨 또는 입금/일일 완료 | reveal/rare-jackpot/chime; 로드 실패는 무음 처리, 별도 오류 UI 없음 | opening-audio-result-{l}-{v}.png |
| web/lib/audio.ts, web/components/unboxing/UpgradeFX.tsx | glitch/tension 호출 추적 | glitch 활성 호출 없음, tension은 비활성 니어미스 분기; 배경음의 실제 재생 확인 못함 | 해당 없음 |

## 9. 토스트, 알림, 겹침 화면 검색 대조

모달의 세부 상태는 앞 표에 있다. 여기서는 이름으로 놓치기 쉬운 알림과 표시 방식, 호출되지 않는 정의를 별도로 묶었다.

| 파일 경로 | 띄우는 방법 | 필요한 상태 | 제안 스크린샷 파일명 |
| --- | --- | --- | --- |
| web/app/[locale]/page.tsx:236 | 홈 토스트 호스트 | 여러 개 누적, 우측 아래 z120, 약5.2초, 제목+본문/아이콘/색/그림자 | toast-home-stack-{l}-{v}.png |
| web/app/[locale]/page.tsx:136 | 개봉 잔액 부족 | unbox.insufficient + 충전 안내; quiet=true 경로에서는 생략 | toast-home-insufficient-{l}-{v}.png |
| web/app/[locale]/page.tsx:159 | 개봉 실패 | unbox.openFailed/openFailedBody | toast-home-opening-error-{l}-{v}.png |
| web/app/[locale]/page.tsx:172 | 일반 결과 USDT로 받기 | unbox.sold | toast-home-sold-{l}-{v}.png |
| web/app/[locale]/page.tsx:217 | 대량 결과 USDT로 받기 | unbox.sold | toast-home-bulk-sold-{l}-{v}.png |
| web/app/[locale]/page.tsx:178 | 결과 배송 접수 콜백 | inventory.shipRequestedToast/unbox.shippingBody; 현행 결과 배송 비활성으로 도달 경로 확인 못함 | unreachable-toast-home-shipping-{l}-{v}.png |
| web/app/[locale]/page.tsx:223 | 입금 완료 | deposit.creditedToast | toast-home-deposit-{l}-{v}.png |
| web/app/[locale]/page.tsx:226 | 출금 요청 완료 | withdraw.requestedToast | toast-home-withdraw-{l}-{v}.png |
| web/app/[locale]/page.tsx:227 | 출금 차단 콜백 | withdraw.amlBlocked; 자식 호출 없음 | unreachable-toast-home-aml-{l}-{v}.png |
| web/app/[locale]/page.tsx:230 | 일일 상자 지급 완료 | daily.creditedToast | toast-home-daily-{l}-{v}.png |
| web/components/auth/AuthHost.tsx, web/stores/authStore.ts:67 | 인증 pushToast | 상단 중앙 role=status, 약5초, 단일 toast; 성공/중립 스타일 중 실제 로그인 환영 호출 없음 | toast-auth-host-{tone}-{l}-{v}.png |
| web/components/auth/HeaderAuthControl.tsx:76 | 로그아웃 성공 또는 실패 | auth 로그아웃 문구 또는 계정 오류; 오류도 토스트 | toast-auth-logout-{result}-{l}-{v}.png |
| web/app/[locale]/inventory/page.tsx | 판매/배송/배송 취소/출금 요청 완료 | workspace-toast role=status; onBlocked 도움말은 자식 호출 없음 | toast-inventory-{action}-{l}-{v}.png |
| web/app/[locale]/community/page.tsx | 후기 저장/삭제/실패 | workspace-toast role=status; 폼 오류와 별도 호스트 | toast-community-{action}-{l}-{v}.png |
| web/components/community/CommunityBoard.tsx | 글/댓글 저장/삭제/링크 복사 | workspace-toast 및 inline 오류를 따로 표시 | toast-board-{action}-{l}-{v}.png |
| web/components/layout/LabBadge.tsx | 저장 공간 부족 | 사라지지 않는 고정 status 경고; 일반 토스트 호스트와 별개 | toast-storage-persistent-{l}-{v}.png |
| web/components/auth/HeaderAuthControl.tsx, web/components/layout/SiteHeader.tsx | 계정 드롭다운/모바일 메뉴 | 독립 겹침 메뉴; Modal 이름 검색만으로는 누락됨 | overlay-menus-{kind}-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx:563 | 개봉 완료 | 부모 dialog 내부 결과 겹침 화면; 별도 role=dialog 없음 | overlay-opening-results-{l}-{v}.png |
| web/components/auth/NicknameSettings.tsx, web/components/auth/PasswordChangeFlow.tsx, web/components/auth/AccountClosureFlow.tsx | 변경 제한/인증 오류/탈퇴 차단 | 기능 파일 안에 직접 만든 팝업과 alertdialog; 파일명 Modal 아님 | overlay-account-inline-hosts-{kind}-{l}-{v}.png |
| web/components/about/AboutSections.tsx, web/components/community/CommunityBoard.tsx, web/components/community/BoardComposer.tsx | 설명/삭제/초안 폐기 선택 | inline 설명과 확인이며 브라우저 confirm이 아님 | inline-confirmation-{feature}-{l}-{v}.png |
| web/app/, web/components/, web/lib/, web/stores/, web/server/ | 전체 검색: createPortal/Snackbar/Notification/Popover/Tooltip/Drawer/Sheet/Popup | 해당 이름의 구현/호출 없음; 네이티브 title과 수제 dialog는 별도 존재 | 해당 없음 |
| web/app/, web/components/, web/lib/, web/stores/, web/server/ | 전체 검색: alert(/confirm(/prompt( | 브라우저 alert/confirm/prompt 호출 없음; 취소 모달의 지역 함수 confirm은 브라우저 호출 아님 | 해당 없음 |
| web/components/ 및 web/app/ | 전체 검색: role=dialog/alertdialog/alert/status와 AnimatePresence | 모달 외 메뉴/결과/FX/토스트/입력 오류/조회 상태/인라인 전환도 앞 표에 포함 | overlay-audit-{l}-{v}.png |

## 10. i18n 네임스페이스와 키 수

대상은 web/messages/ko.json, en.json, zh.json이다. 문자열 말단을 세며 객체/배열 자체는 세지 않고 배열의 각 h/p도 말단으로 센다. 각각 1,976개, 합계 5,928개다. 로케일 간 누락/추가 키는 0개다. 뜻의 완전한 일치나 모든 문구의 실화면 노출을 보증하는 수치는 아니다.

| 파일 경로 | 띄우는 방법 | 필요한 상태 | 제안 스크린샷 파일명 |
| --- | --- | --- | --- |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | nav: 공통 내비게이션 | ko 10 / en 10 / zh 10 키 | strings-nav-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | auth: 헤더 인증과 인증 모달 | ko 35 / en 35 / zh 35 키 | strings-auth-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | about: 소개 페이지와 잔존 소개 컴포넌트 | ko 129 / en 129 / zh 129 키 | strings-about-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | header: 헤더 잔액/버튼 | ko 6 / en 6 / zh 6 키 | strings-header-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | hero: 홈 스킨과 잔존 영웅 영역 | ko 28 / en 28 / zh 28 키 | strings-hero-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | card: 상품 카드 | ko 15 / en 15 / zh 15 키 | strings-card-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | grid: 홈 목록 | ko 3 / en 3 / zh 3 키 | strings-grid-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | mobileNav: 현행 MobileBottomNav는 null; 메시지만 존재 | ko 7 / en 7 / zh 7 키 | strings-mobileNav-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | delivery: 배송 신청 | ko 35 / en 35 / zh 35 키 | strings-delivery-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | aboutBanner: 홈 소개 배너 | ko 3 / en 3 / zh 3 키 | strings-aboutBanner-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | hot: 잔존 인기 상자 | ko 5 / en 5 / zh 5 키 | strings-hot-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | hall: 미연결 HallOfFame | ko 14 / en 14 / zh 14 키 | strings-hall-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | categories: 홈 카테고리 | ko 5 / en 5 / zh 5 키 | strings-categories-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | sections: 홈 섹션 | ko 4 / en 4 / zh 4 키 | strings-sections-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | sorts: 홈 정렬 | ko 4 / en 4 / zh 4 키 | strings-sorts-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | tiers: 등급 관련 문구 | ko 10 / en 10 / zh 10 키 | strings-tiers-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | modal: 상품 상세 | ko 43 / en 43 / zh 43 키 | strings-modal-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | fairness: 수동/시각 검증, 중첩 visual 포함 | ko 65 / en 65 / zh 65 키 | strings-fairness-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | unbox: 개봉과 결과 | ko 78 / en 78 / zh 78 키 | strings-unbox-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | deposit: 입금 | ko 39 / en 39 / zh 39 키 | strings-deposit-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | cardPay: 신규 카드 결제 UI 호출 경로 확인 못함 | ko 56 / en 56 / zh 56 키 | strings-cardPay-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | inventory: 보관함 | ko 109 / en 109 / zh 109 키 | strings-inventory-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | daily: 일일 상자 | ko 16 / en 16 / zh 16 키 | strings-daily-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | community: 후기 | ko 26 / en 26 / zh 26 키 | strings-community-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | gate: 문지기 연출 | ko 2 / en 2 / zh 2 키 | strings-gate-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | autoplay: 자동 열기 | ko 17 / en 17 / zh 17 키 | strings-autoplay-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | bulk: 대량 개봉 | ko 11 / en 11 / zh 11 키 | strings-bulk-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | ticker: 미연결 라이브 피드 | ko 7 / en 7 / zh 7 키 | strings-ticker-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | onboarding: 이용 안내 관련 잔존 문구 | ko 7 / en 7 / zh 7 키 | strings-onboarding-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | counters: 미연결 LiveCounters | ko 9 / en 9 / zh 9 키 | strings-counters-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | proof: 공정성 기록 | ko 25 / en 25 / zh 25 키 | strings-proof-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | withdraw: 출금 | ko 91 / en 91 / zh 91 키 | strings-withdraw-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | footer: 푸터 | ko 18 / en 18 / zh 18 키 | strings-footer-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | legalDocs: 13개 법적 문서, sections 배열 포함 | ko 204 / en 204 / zh 204 키 | strings-legalDocs-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | actions: 공통 동작 | ko 3 / en 3 / zh 3 키 | strings-actions-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | legal: 법적 안내 | ko 1 / en 1 / zh 1 키 | strings-legal-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | badges: 상품 배지 | ko 10 / en 10 / zh 10 키 | strings-badges-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | products: 상품명/설명 | ko 148 / en 148 / zh 148 키 | strings-products-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | editorialPages: 프로필 등 편집 문구 | ko 111 / en 111 / zh 111 키 | strings-editorialPages-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | design: 공통 디자인 문구 | ko 40 / en 40 / zh 40 키 | strings-design-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | legalCenter: 정책 센터 | ko 28 / en 28 / zh 28 키 | strings-legalCenter-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | refinement: 보관함/후기 세부 화면 | ko 130 / en 130 / zh 130 키 | strings-refinement-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | cancellation: 배송 취소 | ko 16 / en 16 / zh 16 키 | strings-cancellation-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | account: 인증/계정과 오류 | ko 116 / en 116 / zh 116 키 | strings-account-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | fairnessGuide: 공정성 설명/검증 | ko 85 / en 85 / zh 85 키 | strings-fairnessGuide-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | security: 2단계 인증 | ko 31 / en 31 / zh 31 키 | strings-security-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | history: 거래 기록 | ko 31 / en 31 / zh 31 키 | strings-history-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | browserWallet: 브라우저 지갑 안내 키; 실제 설정/전용 화면 확인 못함 | ko 8 / en 8 / zh 8 키 | strings-browserWallet-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | profileSettings: 프로필 설정 | ko 78 / en 78 / zh 78 키 | strings-profileSettings-{l}-{v}.png |
| web/messages/ko.json, web/messages/en.json, web/messages/zh.json | home: 홈 추가 문구 | ko 4 / en 4 / zh 4 키 | strings-home-{l}-{v}.png |

## 11. 메시지 파일 밖의 사용자 문구와 데이터

아래는 실제 UI로 전달되는 리터럴, 별도 로케일 사전, 상품/예시 데이터, 고유명/단위/입력 예시를 구분한 파일 목록이다. CSS 클래스, 내부 상태 이름, use client, 금칙어 사전만 있는 파일은 UI 문구로 오인하지 않았다. 같은 파일의 모든 줄을 복제하지 않고 표면과 재현 경로를 기록했다.

| 파일 경로 | 띄우는 방법 | 필요한 상태 | 제안 스크린샷 파일명 |
| --- | --- | --- | --- |
| web/app/layout.tsx, web/app/[locale]/layout.tsx, web/lib/labSite.ts | 브라우저 탭/검색 메타 | 브랜드/테스트 제목과 설명 리터럴; LAB_TITLE 포함 | literal-metadata-{l}.png |
| web/app/page.tsx | 루트 이동 전 | VOILA.GG 브랜드 fallback | literal-root-{v}.png |
| web/app/[locale]/about/page.tsx | 소개 페이지 | THE WORLD OF VOILA/HOW IT WORKS/GOOD TO KNOW 등 영문 표제 | literal-about-page-{l}-{v}.png |
| web/app/[locale]/inventory/page.tsx | 보관함 표제와 기록 | MY VAULT, 구분 문자와 데이터 fallback | literal-inventory-{l}-{v}.png |
| web/app/[locale]/community/page.tsx | 후기 표제/빈 상태 | VOILA JOURNAL 및 컴포넌트 내 언어 분기 | literal-community-page-{l}-{v}.png |
| web/app/[locale]/community/board/page.tsx:3 | 게시판 Suspense | 한국어 게시판 로딩 문장 | literal-board-loading-{l}-{v}.png |
| web/app/[locale]/profile/page.tsx | 계정 표제/요약 | VOILA/MY ACCOUNT, 미준비 숫자의 쉼표 placeholder | literal-profile-page-{l}-{v}.png |
| web/app/[locale]/legal/page.tsx | 정책 센터 표제 | VOILA/POLICIES | literal-legal-page-{l}-{v}.png |
| web/components/about/AboutSections.tsx | 소개 시뮬레이션 | LIVE/ROLL, 시드/영수증/HUD 고정 표기와 예제 값 | literal-about-sections-{l}-{v}.png |
| web/components/about/IsometricStage.tsx | 소개 3D 무대 | 장식 영문/브랜드 표면; 별도 메시지 키 없는 SVG/무대 요소 | literal-about-stage-{l}-{v}.png |
| web/components/auth/AuthModal.tsx | 로그인/가입 | 브랜드, provider 이름, 입력 예시와 자동완성 표면 | literal-auth-modal-{l}-{v}.png |
| web/components/auth/ProviderMarks.tsx | 로그인 소셜 버튼 | Google/Apple/Microsoft 브랜드 SVG; 기능 문구와 별개 | literal-provider-marks-{l}-{v}.png |
| web/components/auth/PasswordChangeFlow.tsx:9 | 비밀번호 변경 전체 | 한국어 COPY 사전, 상위 호출에서 messages 미전달; en/zh에서도 한국어 분기 | literal-password-korean-{l}-{v}.png |
| web/components/auth/AccountClosureFlow.tsx | 탈퇴 전체 | 잔액/상품 차단/코드/완료의 한국어 리터럴 | literal-closure-korean-{l}-{v}.png |
| web/components/community/BoardComposer.tsx | 글 작성/수정 | 카테고리 이름/레이블/검증/초안/저장 문구가 한국어 | literal-board-composer-{l}-{v}.png |
| web/components/community/CommunityBoard.tsx:15 | 게시판 전체와 오류 | 한국어 기능 문구/오류 사전, 예시 안내만 세 언어 분기 | literal-board-main-{l}-{v}.png |
| web/components/community/CommunityNavigation.tsx | 후기/게시판 탭 | 세 언어 리터럴 사전 | literal-community-nav-{l}-{v}.png |
| web/components/community/ReviewFormModal.tsx:93 | 후기 작성 안내 | 세 언어 소개 문구를 파일에서 분기 | literal-review-form-{l}-{v}.png |
| web/components/community/reviewValueNotice.ts | 작성 자격 안내 | 세 언어 문구와 금액 조합 | literal-review-value-{l}-{v}.png |
| web/components/fairness/ProofFeed.tsx | 공정성 공개 기록 | 준비금/조회 오류 관련 별도 언어 분기 및 고정 표기 | literal-fairness-proof-{l}-{v}.png |
| web/components/fairness/FairnessVerifier.tsx, web/components/fairness/HashExplainer.tsx | 수동 검증/해시 설명 | 64hex/128hex 예시와 VOILA 기본 입력값 | literal-fairness-inputs-{l}-{v}.png |
| web/components/home/LiveReviewsSection.tsx:16 | 홈 예시 후기 | HOME_DEMO_REVIEWS의 한국어 작성자/후기, 외부 아바타 | literal-home-demo-{l}-{v}.png |
| web/components/home/ProofFeed.tsx:59 | 홈 검증 영역 | ko/en/zh copy 객체, 구분 문자 | literal-home-proof-{l}-{v}.png |
| web/components/home/DailyFreeBox.tsx | 일일 결과 | Voila.gg, roll, nonce 표기 | literal-daily-{l}-{v}.png |
| web/components/layout/LabBadge.tsx:35 | 저장 공간 부족 | 한국어 한 문장 고정 경고 | literal-storage-warning-{l}-{v}.png |
| web/components/layout/BrandLogo.tsx, web/components/layout/Footer.tsx | 로고와 푸터 | 브랜드와 슬로건 고정 문구; DESIGN 예외 여부 별도 판단 | literal-brand-footer-{l}-{v}.png |
| web/components/layout/LanguageSelector.tsx, web/components/layout/CurrencySelector.tsx | 언어/통화 메뉴 | 자국어 언어 이름과 USDT/USD/KRW | literal-preference-options-{l}-{v}.png |
| web/components/inventory/DeliveryModal.tsx:116 | 배송 실패/양식 | 한국어 실패 문장, 수령인/주소/통관 입력 예시 | literal-delivery-{l}-{v}.png |
| web/components/wallet/HistoryTab.tsx, web/components/wallet/WithdrawSteps.tsx, web/components/wallet/TwoFactorSetup.tsx | 거래/출금/인증 | 네트워크 이름, USDT, 000000 등 입력 예시; 메시지 밖 숫자 서식 | literal-wallet-{l}-{v}.png |
| web/components/unboxing/AutoplaySettingsModal.tsx | 자동 설정 제목 | box.title 직접 표시, 번역된 상품명 사용 여부를 다른 제목과 대조 필요 | literal-autoplay-title-{l}-{v}.png |
| web/components/box/TierStrip.tsx, web/lib/tiers.ts | 등급 배지/확률/개봉 | tier.label/gameLabel 영문 직접 표시 | literal-tier-labels-{l}-{v}.png |
| web/lib/homeCopy.ts | 홈 안내/스킨 | messages 밖의 세 언어 홈 문구 사전 | literal-home-copy-{l}-{v}.png |
| web/lib/community.ts | 후기 목록/상대 시각 | communityFeedCopy 세 언어 사전와 Intl.RelativeTimeFormat | literal-community-copy-{l}-{v}.png |
| web/lib/publishedReviewExamples.ts | 공개 후기 예시 | 예시 후기 본문/작성자/상품 자료 | literal-published-examples-{l}-{v}.png |
| web/lib/board.ts:93 | 게시판 예시 | 운영 예시 글/댓글/한국어 작성자 이름과 예시 접두어 | literal-board-examples-{l}-{v}.png |
| web/lib/boardApi.ts | 작성자 정보 fallback | 회원 같은 기본 표시 이름 | literal-board-author-{l}-{v}.png |
| web/lib/products.ts, web/lib/catalog.ts, web/lib/data.ts, web/lib/types.ts, web/lib/i18n.ts, web/src/data/gachaItems.ts | 상품을 보여주는 화면 | 상품명/설명/레거시 이름 데이터; 직접 사용과 번역 fallback가 섞임, 각 레거시 항목의 활성 노출은 확인 못함 | literal-product-data-{l}-{v}.png |
| web/lib/useProductText.ts | 상품명/설명 번역 조회 | 메시지 키와 원본 상품 데이터 fallback 연결 | literal-product-fallback-{l}-{v}.png |
| web/lib/productImages.ts | 상품 상세 사진 출처 | 촬영자/서비스/라이선스 이름과 링크 | literal-image-credits-{l}-{v}.png |
| web/lib/legal.ts | 정책과 푸터 | 회사명/등록번호/주소/지원 이메일/운영시간 기본 리터럴; 실제 환경 대체값 확인 못함 | literal-legal-values-{l}-{v}.png |
| web/lib/depositAddress.ts, web/lib/withdrawal.ts, web/lib/carriers.ts | 입출금 네트워크/택배사 | 브랜드 이름, 네트워크 라벨, 탐색기/추적 링크 | literal-networks-carriers-{l}-{v}.png |
| web/lib/format.ts, web/lib/formatCurrency.ts, web/lib/localFiat.ts | 금액/시간 표기 | 축약 단위 만/억/K/M, 숫자와 통화/현지 단위 조합 | literal-formatted-values-{l}-{v}.png |
| web/lib/account.ts, web/lib/browserAccount.ts, web/lib/api.ts | 서버 또는 어댑터 실패 | 오류 코드/내부 메시지는 다음 표의 UI 매핑으로 표시; 원문 그대로 노출되는지 구분 | literal-api-errors-{l}-{v}.png |
| web/components/about/GlobalLiveFeed.tsx, web/components/about/ImpactStats.tsx, web/components/about/LineupShowcase.tsx, web/components/about/TrustScenes.tsx, web/components/about/VaultHero.tsx | 이전 소개 컴포넌트 | 리터럴/시뮬레이션 데이터 잔존; 현재 라우트 호출 없음 | unmounted-literal-about-{l}-{v}.png |
| web/components/home/HallOfFame.tsx, web/components/home/HotBoxes.tsx, web/components/home/JackpotPoolBadge.tsx, web/components/home/LiveCounters.tsx, web/components/home/LiveTicker.tsx, web/components/inventory/HotBoxes.tsx, web/components/inventory/ShippingTicker.tsx | 이전 순위/티커/추천 | 고정 단위/시간/등급/예시 라벨 잔존; 현재 라우트 호출 없음 | unmounted-literal-widgets-{l}-{v}.png |

## 12. 서버와 어댑터 오류, 알림 문구의 도착 지점

소스의 오류 정의와 사용자에게 보이는 표현을 연결했다. 서버 구현이나 발송 이메일 본문이 저장소에 없으면 확인 못함으로 남겼다. 네트워크 오류를 실제로 유발하지 않았다.

| 파일 경로 | 띄우는 방법 | 필요한 상태 | 제안 스크린샷 파일명 |
| --- | --- | --- | --- |
| web/lib/account.ts:7, web/messages/ko.json | 계정 서비스 unavailable | account.errors.unavailable: 계정 서비스에 연결할 수 없습니다. 잠시 후 다시 확인해 주세요. | api-account-unavailable-{l}-{v}.png |
| web/lib/account.ts, web/messages/ko.json | 계정 요청 network | account.errors.network: 처리를 확인하지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.; 요청 시간 제한15초 | api-account-network-{l}-{v}.png |
| web/lib/account.ts, web/messages/ko.json | 계정 입력/응답 invalid | 입력 정보 또는 요청의 유효성을 확인하지 못했습니다. 인증 링크가 만료되었다면 다시 요청해 주세요. | api-account-invalid-{l}-{v}.png |
| web/lib/account.ts:130, web/messages/ko.json | HTTP401/403 credentials | 로그인 정보를 확인해 주세요. 이메일 인증이나 재로그인이 필요할 수 있습니다. | api-account-credentials-{l}-{v}.png |
| web/lib/account.ts, web/messages/ko.json | HTTP429 rateLimit | 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요. | api-account-rate-limit-{l}-{v}.png |
| web/lib/account.ts, web/messages/ko.json | HTTP409 conflict | 서버에서 미완료 자산 또는 거래를 확인했습니다. 먼저 처리 상태를 확인해 주세요.; 게시판은 별도 충돌 문구 | api-account-conflict-{l}-{v}.png |
| web/lib/account.ts, web/lib/browserAccount.ts, web/components/auth/PasswordChangeFlow.tsx | 비밀번호 동작 reason 반환 | social_account/password_locked/password_mismatch/password_reused/password_invalid; 한국어 COPY로 변환 | api-password-reason-{reason}-{l}-{v}.png |
| web/lib/account.ts, web/lib/browserAccount.ts, web/components/auth/PasswordChangeFlow.tsx, web/components/auth/AccountClosureFlow.tsx | 이메일 인증/탈퇴 reason 반환 | verification_required/code_invalid/code_expired/code_attempts_exceeded/resend_wait/assets_remaining | api-verification-reason-{reason}-{l}-{v}.png |
| web/lib/profilePolicy.ts, web/lib/nicknameRules.ts, web/components/auth/NicknameSettings.tsx, web/components/auth/AvatarSettings.tsx | 프로필 거절 사유 | nickname_length/format/prohibited/reserved/taken/cooldown, avatar_invalid/storage_unavailable; 저장 규칙의 금칙어 자체는 UI 문구 아님 | api-profile-reason-{reason}-{l}-{v}.png |
| web/lib/security.ts, web/stores/securityStore.ts | 보안 API 오류 | AccountError로 등록/해제/출금 인증 inline에 표시; 초기 조회 실패는 재시도 | api-security-error-{entry}-{l}-{v}.png |
| web/lib/board.ts, web/lib/boardApi.ts, web/components/community/CommunityBoard.tsx:15 | 게시판 코드 매핑 | 로그인/권한/삭제됨/다른 창 수정/댓글1~1000자/댓글 수 제한/불러오기 실패; 기타 입력 또는 저장공간/연결 안내 | api-board-mapped-{reason}-{l}-{v}.png |
| web/components/community/BoardComposer.tsx | 글 작성 오류 매핑 | 길이/금지 내용/이미지/권한/저장/충돌 문구; messages 밖 한국어 | api-board-composer-{reason}-{l}-{v}.png |
| web/lib/communityReviewApi.ts, web/lib/communityModeration.ts, web/stores/communityStore.ts | 후기 저장/삭제 실패 | ReviewFormModal 또는 community 페이지 오류/토스트; 안전성 검사 사전 자체는 노출 안 됨 | api-review-error-{action}-{l}-{v}.png |
| web/lib/api.ts:33 | 비계정 API HTTP 오류 | 경로와 HTTP 상태 문자열을 Error로 만듦; 입금/배송/공개 기록 등 각 호출부가 일반 문구로 처리하거나 삼킴 | api-generic-error-{entry}-{l}-{v}.png |
| web/lib/opening.ts, web/lib/fairness.ts, web/lib/reel.ts | 개봉 계산/검증 예외 | 수량/할당/정산/빈 확률표/nonce/WebCrypto 등 내부 오류; 홈 개봉 실패 또는 검증 오류로 도착 | api-opening-error-{entry}-{l}-{v}.png |
| web/lib/shipping.ts, web/components/inventory/DeliveryModal.tsx | 배송 응답 실패/영수증 검증 실패 | 폼의 일반 한국어 오류; 원격 서버 고유 메시지 전체는 확인 못함 | api-shipping-error-{l}-{v}.png |
| web/stores/usePublishedReviews.ts, web/components/wallet/HistoryTab.tsx, web/stores/inventoryStore.ts | 공개 후기/거래/배송 갱신 실패 | catch 후 기존 데이터 유지 또는 예시 사용; 공통 네트워크 끊김 알림 없음 | api-silent-refresh-{entry}-{l}-{v}.png |
| web/stores/authStore.ts:78 | 최초 세션 조회 실패 | 오류 UI 없이 hydrated=true; 비로그인 표면으로 남음 | api-session-initial-failure-{l}-{v}.png |
| web/lib/labSite.ts, web/components/layout/LabBadge.tsx | QuotaExceededError | storage-full 이벤트로 고정 한국어 경고; 서버 오류와 무관 | api-storage-quota-{l}-{v}.png |
| web/server/state.ts, web/server/rng.ts, web/app/ 전체 | 백엔드/메일/관리자 알림 소스 조사 | app/api/route.ts 없음, server 폴더는 상태/난수 유틸; 운영 서버 오류 페이지/메일/SMS/관리자 UI 확인 못함 | 확인 못함 |

## 13. 서드파티 UI, 브라우저 기본 표면과 공통 스타일

네이티브 select는 13개 파일에서 16개 태그를 찾았다. OS가 그리는 펼친 목록, 파일 선택창, 기본 검증 말풍선은 실제 브라우저/OS에서 확인 못함이다.

| 파일 경로 | 띄우는 방법 | 필요한 상태 | 제안 스크린샷 파일명 |
| --- | --- | --- | --- |
| web/components/wallet/UsdtDepositTab.tsx, web/components/wallet/TwoFactorSetup.tsx, web/package.json | 입금 주소/인증 등록 QR | qrcode.react ^4.2.0의 QR, 밝은 바탕과 어두운 모듈; 크기/여백은 호출부 지정 | thirdparty-qr-{kind}-{l}-{v}.png |
| web/components/unboxing/MegaWinFX.tsx, web/package.json | 고등급 당첨 | canvas-confetti ^1.9.4 의존성은 있으나 호출 없음; 실제 효과는 자체 DOM/CSS | thirdparty-confetti-actual-{l}-{v}.png |
| web/components/ 전반, web/package.json | 모달/메뉴/카드 전환 | framer-motion ^11.18.2, AnimatePresence; 기본 모달 테마 라이브러리는 없음 | thirdparty-motion-{feature}-{l}-{v}.png |
| web/components/ 전반, web/components/auth/ProviderMarks.tsx | 아이콘/소셜 인증 버튼 | lucide-react SVG와 직접 만든 provider SVG; 획굵기/색은 호출부별 차이 | thirdparty-icons-{l}-{v}.png |
| web/components/home/LiveReviewsSection.tsx | 후기 아바타 | DiceBear 외부 이미지, 원격 이미지 실패 표면 별도 점검 필요 | thirdparty-dicebear-{l}-{v}.png |
| web/components/auth/AuthModal.tsx | 소셜 로그인 외부 이동 | Google/Apple/Microsoft 원격 페이지의 내용/스타일 확인 못함 | thirdparty-oauth-{provider}-{l}-{v}.png |
| web/app/[locale]/page.tsx:197 | 홈 정렬 select 펼치기 | 브라우저 기본 옵션 패널 | native-home-sort-{l}-{v}.png |
| web/app/[locale]/community/page.tsx:100 | 후기 별점/정렬 select 펼치기 | 두 개 네이티브 select | native-community-select-{kind}-{l}-{v}.png |
| web/app/[locale]/inventory/page.tsx:135 | 보관함 종류/기간/정렬 select 펼치기 | 세 개 네이티브 select | native-inventory-select-{kind}-{l}-{v}.png |
| web/components/community/BoardComposer.tsx:49 | 글 카테고리 select 펼치기 | 공지 권한에 따른 옵션 차이 | native-composer-category-{l}-{v}.png |
| web/components/community/CommunityBoard.tsx:97 | 게시판 정렬 select 펼치기 | 네이티브 옵션 | native-board-sort-{l}-{v}.png |
| web/components/community/ReviewFormModal.tsx:95 | 후기 대상 상품 select 펼치기 | 작성 가능 상품 목록 | native-review-item-{l}-{v}.png |
| web/components/fairness/FairnessVerifier.tsx:130 | 수동 검증 상자 select 펼치기 | 상품 상자 옵션 | native-fairness-box-{l}-{v}.png |
| web/components/fairness/VisualVerifier.tsx:85 | 최근 검증 기록 select 펼치기 | 기록 옵션과 빈 상태 | native-fairness-record-{l}-{v}.png |
| web/components/home/CommerceHome.tsx:84, web/components/home/NetflixHome.tsx:170 | 다른 홈 스킨 정렬 select 펼치기 | 각 스킨의 기본 옵션 패널 | native-skin-sort-{skin}-{l}-{v}.png |
| web/components/inventory/DeliveryModal.tsx:201 | 배송 국가 select 펼치기 | 국가별 옵션 | native-shipping-country-{l}-{v}.png |
| web/components/layout/CurrencySelector.tsx:10, web/components/layout/LanguageSelector.tsx:17 | 통화/언어 select 펼치기 | 헤더와 푸터 위치별 네이티브 패널 | native-preference-select-{kind}-{l}-{v}.png |
| web/components/auth/AuthModal.tsx:101, web/components/box/BoxCard.tsx:31, web/components/box/TierStrip.tsx:63 | 이메일/상품명/등급 분포에 마우스 유지 | HTML title 기본 툴팁; 모바일 표면 확인 못함 | tooltip-identity-product-tier-{kind}-{l}.png |
| web/components/layout/SiteHeader.tsx:53, web/components/unboxing/UnboxingRoulette.tsx:444, web/components/unboxing/UnboxingRoulette.tsx:628 | 일일 버튼/서버 해시/개별 검증에 마우스 유지 | HTML title 기본 툴팁 | tooltip-daily-opening-{kind}-{l}.png |
| web/components/wallet/HistoryTab.tsx:211, web/components/wallet/HistoryTab.tsx:243, web/components/wallet/WithdrawTab.tsx:70, web/components/fairness/ProofFeed.tsx:120 | 주소/거래 해시/준비금 주소에 마우스 유지 | HTML title 기본 툴팁 | tooltip-wallet-proof-{kind}-{l}.png |
| web/components/home/JackpotPoolBadge.tsx:54 | 잔존 잭팟 배지 호버 | title 툴팁 선언만 있음; 현재 라우트 호출 없음 | unmounted-tooltip-jackpot-{l}.png |
| web/components/auth/AvatarSettings.tsx, web/components/community/BoardComposer.tsx, web/components/community/ReviewFormModal.tsx | 사진 선택 버튼 | OS 파일 선택창; 이미지 파일 형식 제한 | browser-file-picker-{entry}-{l}.png |
| web/components/auth/AuthModal.tsx, web/components/auth/PasswordChangeFlow.tsx, web/app/[locale]/profile/page.tsx | required/type=email/pattern 입력을 잘못 제출 | 브라우저 기본 폼 검증이 동작할 수 있는 속성; 실제 말풍선/언어 확인 못함 | browser-form-validation-{entry}-{l}-{v}.png |
| web/components/auth/AvatarSettings.tsx, web/components/unboxing/AutoplaySettingsModal.tsx, web/components/community/ReviewFormModal.tsx | 슬라이더/체크박스/별점 조작 | native range/checkbox와 커스텀 radio, accent 색 및 focus | browser-input-controls-{kind}-{l}-{v}.png |
| web/app/, web/components/ 전체 | 날짜/숫자 입력 검색 | type=date/type=number 없음; 기간은 select, 수치는 text/inputMode; 날짜 picker/숫자 스피너 현행 경로 없음 | 해당 없음 |
| web/app/globals.css:68 | 페이지/모달 스크롤 | WebKit 스크롤바 배경/손잡이/금색 hover, no-scrollbar 숨김; 다른 엔진의 실제 모양 확인 못함 | browser-scrollbar-{state}-{l}-{v}.png |
| web/app/globals.css:517, web/app/design.css:265 | Tab으로 링크/버튼 포커스 | 전역 금색 outline, 개별 입력 focus border/box-shadow 차이 | browser-focus-{entry}-{l}-{v}.png |
| web/app/globals.css:518 | 본문 드래그 선택 | 금색 selection 배경 | browser-text-selection-{l}-{v}.png |
| web/app/ 스타일 전체 | 로그인 자동완성/자동 채우기 | 전용 autofill 규칙 찾지 못함; 브라우저 적용 색 확인 못함 | browser-autofill-{l}-{v}.png |
| web/app/layout.tsx:14, web/public/assets/fonts/PretendardVariable.woff2, web/app/globals.css:10 | 페이지 최초 로드 | next/font/local, display=swap, 전역 Pretendard; 로드 실패시 시스템 글꼴, 실제 중국어 대체 글꼴 확인 못함 | browser-font-loading-{l}-{v}.png |
| web/app/globals.css, web/app/design.css, web/app/gpt-skin.css, web/app/gpt-flow.css, web/app/nfx-skin.css, web/app/shop-skin.css, web/tailwind.config.ts | 동일 UI를 기본/다른 홈/다른 페이지에서 비교 | CSS 적용 범위가 달라 같은 컴포넌트도 색/굵기/그림자/반경 다름 | styles-context-{skin}-{entry}-{l}-{v}.png |
| web/lib/useModal.ts | 모달에서 Tab/Esc/배경 클릭 | 공유 focus trap/스크롤 잠금/닫기; 중첩 모달과 미사용 팝업은 실제 동작 확인 못함 | browser-modal-focus-{entry}-{l}-{v}.png |
| web/components/fairness/VisualVerifier.tsx, web/lib/withdrawal.ts, web/lib/carriers.ts, web/lib/legal.ts | JSON 다운로드/탐색기/배송 추적/법령 링크 | 브라우저 다운로드 및 외부 사이트; 외부 페이지 내용 확인 못함 | browser-external-action-{kind}-{l}.png |
| web/package.json, web/app/ 및 web/components/ 전체 | 임베디드 서드파티 검색 | 별도 결제 위젯/채팅 위젯/CAPTCHA/지갑 연결 UI 호출 찾지 못함; 외부 인증만 별도 | 해당 없음 |

## 14. 현재 라우트와 연결되지 않은 UI

app 진입점에서 컴포넌트 import와 JSX 사용을 추적했다. 아래는 소스가 있어도 지금 누를 수 있는 진입점이 없는 항목이다. 화면을 볼 수 있다고 단정하지 않았다.

| 파일 경로 | 띄우는 방법 | 필요한 상태 | 제안 스크린샷 파일명 |
| --- | --- | --- | --- |
| web/components/about/GlobalLiveFeed.tsx | 현재 진입점 확인 못함 | 허브 탭/자동 순환/지도/공개 기록, AnimatePresence는 인라인 전환 | unmounted-global-live-feed-{l}-{v}.png |
| web/components/about/ImpactStats.tsx | 현재 진입점 확인 못함 | ImpactStats 숫자, FaqAccordion 펼침, FinaleCta 별도 export | unmounted-impact-faq-finale-{l}-{v}.png |
| web/components/about/LineupShowcase.tsx | 현재 진입점 확인 못함 | 이전 카테고리 라인업/링크 | unmounted-lineup-showcase-{l}-{v}.png |
| web/components/about/TrustScenes.tsx | 현재 진입점 확인 못함 | 환급 비교/예시 결과/시드/배송 타임라인 SceneRefund/SceneFair/SceneDelivery | unmounted-trust-scenes-{scene}-{l}-{v}.png |
| web/components/about/VaultHero.tsx | 현재 진입점 확인 못함 | 세 활성 타일/호버/포커스/시간 변화와 문구 AnimatePresence | unmounted-vault-hero-{l}-{v}.png |
| web/components/home/HallOfFame.tsx | 현재 진입점 확인 못함 | 주간 순위/카운트다운/상품/내 순위/참여 없음 | unmounted-hall-of-fame-{state}-{l}-{v}.png |
| web/components/home/HotBoxes.tsx | 현재 진입점 확인 못함 | 상위3개 인기 상자/열기 | unmounted-home-hot-boxes-{l}-{v}.png |
| web/components/home/JackpotPoolBadge.tsx | 현재 진입점 확인 못함 | 잭팟 풀 금액/기본 툴팁 | unmounted-jackpot-badge-{l}-{v}.png |
| web/components/home/LiveCounters.tsx | 현재 진입점 확인 못함 | 원격/로컬 검증 수치 | unmounted-live-counters-{l}-{v}.png |
| web/components/home/LiveTicker.tsx | 현재 진입점 확인 못함 | 상품/당첨/환급/배송 순환, 호버 정지, 이미지 실패 fallback | unmounted-live-ticker-{l}-{v}.png |
| web/components/inventory/HotBoxes.tsx | 현재 진입점 확인 못함 | 보관함 추천 상자 | unmounted-inventory-hot-boxes-{l}-{v}.png |
| web/components/inventory/ShippingTicker.tsx | 현재 진입점 확인 못함 | 배송 현황 순환 띠 | unmounted-shipping-ticker-{l}-{v}.png |
| web/components/legal/PolicyNotice.tsx | 현재 진입점 확인 못함 | 종류별 정책 링크/고지 | unmounted-policy-notice-{l}-{v}.png |
| web/components/home/DailyFreeBox.tsx:34 | DailyFreeBoxPill 호출 경로 없음 | 같은 파일 DailyFreeBoxModal만 홈에 연결 | unmounted-daily-pill-{l}-{v}.png |
| web/components/home/DailyFreeBox.tsx:56 | DailyFreeBoxStrip 호출 경로 없음 | 넓은 일일 상자 안내 띠 | unmounted-daily-strip-{l}-{v}.png |
| web/components/unboxing/UpgradeFX.tsx | 조건부 JSX는 있으나 상태 활성화 없음 | 승급 글리치/번개/UPGRADE 약1100ms; 호출되지 않는 import와 구별 | unreachable-upgrade-fx-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx, web/app/[locale]/page.tsx | 데모 개봉 호출 경로 추적 | demo 분기는 있으나 현행 홈이 true로 시작하는 경로 확인 못함 | unreachable-opening-demo-{l}-{v}.png |

## 15. 요구 상태 대조와 확인 못한 부분

없음은 전용 구현을 찾지 못했다는 뜻이다. 네트워크 연결, 세션, 기기 상태별 실제 결과는 실행 검증하지 않았다.

| 파일 경로 | 띄우는 방법 | 필요한 상태 | 제안 스크린샷 파일명 |
| --- | --- | --- | --- |
| web/stores/authStore.ts, web/components/auth/AuthHost.tsx | 첫 방문/재방문 | 저장 언어/통화/설정/계정 자산 복원, 첫 로그인 보너스, 일일 제한; 별도 첫 방문 온보딩/쿠키 동의 팝업 호출 없음 | state-first-returning-{visit}-{l}-{v}.png |
| web/components/box/DetailModal.tsx, web/components/wallet/WithdrawTab.tsx, web/components/inventory/DeliveryModal.tsx | 잔액0/부족/충분 비교 | 개봉/출금/배송 각각 자체 검증; 비로그인과 잔액은 별도 축 | state-balance-matrix-{entry}-{balance}-{l}-{v}.png |
| web/app/, web/components/, web/lib/, web/stores/ | 네트워크 끊김 상태 조사 | navigator.onLine 또는 online/offline 이벤트 기반 전용 배너/화면 없음; 요청별 오류 또는 조용한 재시도 | state-offline-{entry}-{l}-{v}.png |
| web/stores/authStore.ts:110, web/components/auth/LoginRequired.tsx | 세션 만료 조사 | 포커스/가시성/저장 이벤트로 세션 정리; 전용 만료 메시지 없음 | state-expired-{entry}-{l}-{v}.png |
| web/app/ 전체 | 404/전역 오류/로딩 조사 | 전용 파일 없음, 게시판 Suspense만 존재; 개발 오버레이/배포404는 확인 못함 | state-framework-default-{kind}-{l}-{v}.png |
| web/lib/account.ts, web/lib/runtime.ts, web/lib/browserAccount.ts | 원격 서비스/브라우저 모드 비교 | 설정에 따라 인증/지갑 분기; .env를 읽지 않아 실제 배포 모드는 확인 못함 | state-runtime-mode-{mode}-{l}-{v}.png |
| web/components/wallet/WithdrawSteps.tsx, web/components/auth/AccountClosureFlow.tsx | 인증 이메일/SMS 외부 UI | 코드 입력/발급 결과 표시만 저장소에서 확인; 메일 본문/수신함/외부 제공자 화면 확인 못함 | 확인 못함 |
| web/lib/products.ts, web/lib/opening.ts, web/components/box/DetailModal.tsx | 확률 표시와 추첨 데이터 연결 | 동일 제품 데이터 참조 확인; 돈 계산 수정/실거래/대규모 추첨은 수행하지 않음 | state-probability-source-{l}-{v}.png |
| web/components/unboxing/UnboxingRoulette.tsx, web/components/inventory/DeliveryModal.tsx | 개봉 결과 배송 접수 | 창은 열리지만 requestEnabled=false로 입력/제출 비활성; 실제 접수는 보관함 경로로만 연결 | state-opening-shipping-disabled-{l}-{v}.png |
| web/components/home/LiveReviewsSection.tsx, web/stores/usePublishedReviews.ts | 후기 데이터가 없는 상태 | 예시 채움이 있어 전체 빈 상태와 실제 데이터 부재가 다름; 순수 원격 빈 목록 재현 확인 못함 | state-review-examples-{l}-{v}.png |

## DESIGN.md 3장에 어긋나는 것으로 보이는 곳

아래 30개는 코드 근거가 있는 후보이다. 실제 픽셀 검수는 하지 않았다. gpt 전용 덮어쓰기로 숨겨진 장식은 모든 화면에 보인다고 단정하지 않았다. 로고, 공급자 로고, 상품 사진, FAQ 질문의 예외는 위반 근거에서 제외했다. 개봉 긴장 감속은 A.2 관련 사항이므로 앞의 개봉 표에 따로 기록했다.

| 파일 경로 | 띄우는 방법 | 필요한 상태 | 제안 스크린샷 파일명 |
| --- | --- | --- | --- |
| web/tailwind.config.ts:14, web/tailwind.config.ts:18, web/app/globals.css:28 | 01. 기본 홈 밖의 배경과 카드 | #101112/#191B1D 등 옛 토큰; 3장 #000/#303030 및 한 곳 색 정의와 불일치 후보 | issue-01-color-tokens-{l}-{v}.png |
| web/app/design.css:174 | 02. 보관함/계정/후기 표제 위 라벨 | 금색/600/.16em 영문 라벨; 강조색/자간/대문자 라벨 금지 | issue-02-eyebrow-{l}-{v}.png |
| web/app/design.css:175, web/app/design.css:274 | 03. 공통 workspace 제목 | 500 굵기, 최대40px/모바일30px; 제목32/28px 400 규칙과 다름 | issue-03-heading-{l}-{v}.png |
| web/app/design.css:179, web/app/design.css:181 | 04. 보관함/프로필/게시판 버튼 | 높이44/반경8/굵기500/크림색 주 버튼; 52px 흰 알약과 보조 밑줄 링크 규칙과 다름 | issue-04-workspace-buttons-{l}-{v}.png |
| web/app/design.css:184, web/app/design.css:238 | 05. 보관함 요약과 선택 바 | 그라데이션/금색 테두리/그림자/반경14 또는12; 채운 카드 및 형태 규칙과 다름 | issue-05-inventory-surfaces-{l}-{v}.png |
| web/app/globals.css:80, web/app/globals.css:517, web/app/globals.css:518 | 06. 스크롤바 호버/키보드 포커스/글자 선택 | 금색 남음; 전용 autofill 규칙도 찾지 못해 실제 기본 배경 확인 필요 | issue-06-browser-surfaces-{l}-{v}.png |
| web/app/gpt-skin.css:16, web/app/gpt-skin.css:18, web/app/gpt-flow.css:12 | 07. 기본 홈 헤더와 상세 닫기 | 36px 제어와 닫기 버튼; 터치 영역44px 이상 규칙과 비교 필요 | issue-07-touch-targets-{l}-{v}.png |
| web/app/gpt-flow.css:32, web/app/gpt-flow.css:83, web/app/gpt-flow.css:99 | 08. 상세/지갑/인증 주 버튼 | 주 버튼 font-weight=500; 굵기는 카드 제목600 한 곳만이라는 규칙과 다름 | issue-08-button-weight-{l}-{v}.png |
| web/app/gpt-flow.css:17 | 09. 기본 홈 상세 이미지 설명 | 기본 gpt에도 linear-gradient 잔존; 그라데이션 금지 | issue-09-detail-gradient-{l}-{v}.png |
| web/components/layout/LanguageSelector.tsx:17, web/components/layout/CurrencySelector.tsx:10, web/app/[locale]/inventory/page.tsx:135 | 10. 언어/통화/필터 펼친 선택지 | 네이티브 select; 외곽 CSS만 있고 OS 옵션 패널 교체 없음, 실제 기본 스타일 확인 필요 | issue-10-native-select-{l}-{v}.png |
| web/components/auth/AuthModal.tsx:94 | 11. 로그인/가입 모달 | 전체 화면 dialog; 모바일 하단 시트/PC 중앙 창 규칙과 다름 | issue-11-auth-shell-{l}-{v}.png |
| web/components/wallet/DepositModal.tsx:67, web/components/wallet/DepositModal.tsx:82 | 12. 지갑 모달 위치 | 위아래 padding과 mx-auto 패널; 모바일 bottom sheet 및 PC 수직 중앙 처리 없음 | issue-12-wallet-shell-{l}-{v}.png |
| web/app/[locale]/page.tsx:236, web/app/[locale]/page.tsx:242, web/app/[locale]/page.tsx:248 | 13. 홈 토스트 외형 | 색/그림자/굵은 제목/본문 구조; #303030 한 줄 무아이콘 규칙과 다름 | issue-13-home-toast-style-{l}-{v}.png |
| web/app/[locale]/page.tsx:136, web/app/[locale]/page.tsx:159 | 14. 개봉 부족/실패 알림 | 안내와 실패를 토스트로 띄움; 현재 화면 inline 한 줄 규칙과 다름 | issue-14-home-error-toast-{l}-{v}.png |
| web/app/[locale]/page.tsx:223, web/app/[locale]/page.tsx:226, web/app/[locale]/page.tsx:230 | 15. 입금/출금/일일 완료 알림 | 화면 결과와 완료 토스트가 중복; 흔적 남는 결과의 토스트 및 같은 말 반복 규칙과 충돌 | issue-15-completion-duplicate-{l}-{v}.png |
| web/components/auth/AuthHost.tsx:69, web/components/auth/AuthHost.tsx:72 | 16. 인증 토스트 외형 | 금색/그림자/굵기/체크 또는 로그아웃 아이콘; 중립 토스트에도 아이콘 남음 | issue-16-auth-toast-style-{l}-{v}.png |
| web/components/auth/HeaderAuthControl.tsx:76 | 17. 로그아웃 실패 | 계정 오류를 pushToast로 전달; 실패는 화면 안 한 줄 규칙과 다름 | issue-17-logout-error-toast-{l}-{v}.png |
| web/app/design.css:240 | 18. 보관함/후기/게시판 토스트 | 금색 테두리/크림 글자/그림자/다른 배경; 판매/저장/삭제 결과 안내 용도도 점검 필요 | issue-18-workspace-toast-{l}-{v}.png |
| web/components/layout/LabBadge.tsx:34 | 19. 저장 공간 부족 고정 경고 | 황색 배지/그림자/외부 고정 안내; 실패의 inline 표시 및 무색 규칙과 다름 | issue-19-storage-warning-{l}-{v}.png |
| web/components/auth/NicknameSettings.tsx:133 | 20. 닉네임 변경 제한 | 막힌 상태를 별도 모달로 표시; inline 한 줄 규칙과 다름 | issue-20-nickname-block-dialog-{l}-{v}.png |
| web/components/auth/PasswordChangeFlow.tsx:175, web/components/auth/PasswordChangeFlow.tsx:180 | 21. 비밀번호 불일치/잠금/소셜 계정 | 입력 실패와 제한이 alertdialog로 전환됨; 실패 팝업 금지와 충돌 | issue-21-password-block-dialog-{l}-{v}.png |
| web/components/auth/AccountClosureFlow.tsx:159, web/components/auth/AccountClosureFlow.tsx:166 | 22. 탈퇴 잔액/상품 차단 | 현재 계정 화면의 한 줄 대신 차단 팝업 | issue-22-closure-block-dialog-{l}-{v}.png |
| web/app/[locale]/profile/page.tsx:105, web/components/auth/PasswordChangeFlow.tsx:171 | 23. 프로필 보안의 비밀번호 변경 | 부모 제목/설명/시작 버튼 뒤 자식이 제목/설명/시작 버튼을 다시 렌더; 같은 말 반복 | issue-23-password-duplicate-{l}-{v}.png |
| web/components/wallet/UsdtDepositTab.tsx:190, web/components/wallet/WithdrawTab.tsx:273, web/components/inventory/TrackingModal.tsx:103 | 24. 입금 확인/출금/배송 추적 | 분할 진행 막대와 단계 타임라인; 스텝퍼/진행률 금지 규칙과 다름, 대량 진행도 함께 점검 | issue-24-progress-steppers-{l}-{v}.png |
| web/components/box/TierStrip.tsx:29, web/components/box/TierStrip.tsx:69, web/components/box/TierStrip.tsx:119 | 25. 등급 배지/확률 범례 | 색 배지/대문자/자간/그림자/그라데이션; 기본 상세 일부는 숨김, 다른 스킨/개봉 경로는 별도 확인 | issue-25-tier-styles-{skin}-{l}-{v}.png |
| web/app/[locale]/about/page.tsx:76, web/app/[locale]/about/page.tsx:77, web/app/[locale]/about/page.tsx:84 | 26. 소개 영문 표제와 제목/CTA | 제목 위 대문자 라벨, 굵은 제목, 크림 CTA; 문구/글자/색 규칙과 다름 | issue-26-about-heading-{l}-{v}.png |
| web/components/unboxing/VaultGateFX.tsx:47, web/components/unboxing/MegaWinFX.tsx:35, web/components/unboxing/MegaWinFX.tsx:43 | 27. 활성 개봉 FX | 금색/여러 강조색/그라데이션/그림자; 개봉 오버레이도 색/형태 예외 없음 | issue-27-opening-effects-{l}-{v}.png |
| web/components/wallet/WithdrawSteps.tsx:58, web/components/wallet/WithdrawSteps.tsx:70 | 28. 출금 최종 확인 금액 | toFixed(2) USDT 직접 출력으로 천 단위 쉼표 없음, font-black/금색 그라데이션 | issue-28-withdraw-amount-{l}-{v}.png |
| web/stores/authStore.ts:117, web/app/[locale]/layout.tsx:64 | 29. 세션 만료/오프라인/404 | 세션은 clearSession만, 전용 offline 및 not-found/error 파일 없음; 각 상태도 디자인하라는 요구 미충족 후보 | issue-29-missing-state-design-{kind}-{l}-{v}.png |
| web/components/home/ProofFeed.tsx:123, web/lib/board.ts:121 | 30. 기록/예시 작성자 구분 문자 | 가운뎃점이 들어 있는 사용자 문구; 3장 문구 금지 문자 규칙과 충돌 | issue-30-forbidden-separators-{l}-{v}.png |


