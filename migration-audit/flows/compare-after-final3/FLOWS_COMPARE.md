# 흐름 비교

A: before-local (http://127.0.0.1:4183/voila-test-aresjoo)
B: after-final3 (http://127.0.0.1:4189/voila-test-aresjoo)
규칙: C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit\harness\classify-rules.json

같음은 "두 환경에서 실행했고 적은 값이 전부 같다"는 뜻이다. 검증 불가와 한쪽만 실행은 같음으로 세지 않는다. 판정말의 뜻은 flows-compare.mjs 머리말에 있다.

단계 합계: 같음 300, 의도된 차이 595, 설명 안 됨 0, 장부 다름 0, 검증 불가 60, 한쪽만 실행 0, 오류 0

다른 칸 합계: 규칙에 맞는 칸 5054 (W1-review-zone 4715, W2-wallet-history 65, W1-reviews-page 70, W1-review-sheet 81, W1-own-review-note 50, W1-reviews-page-J2 45, W1-lazy-images 28), 설명 안 되는 칸 0, 장부 칸 0

| 시나리오 | 변형 | A | B | 같음 | 의도된 차이 | 설명 안 됨 | 장부 다름 | 검증 불가 | 한쪽만 실행 | 오류 | 장부 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| A 비로그인 사용자가 박스를 둘러보고 상세를 확인 | en-1440 | done | done | 0 | 19 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 19개) |
| A 비로그인 사용자가 박스를 둘러보고 상세를 확인 | en-390 | done | done | 0 | 19 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 19개) |
| A 비로그인 사용자가 박스를 둘러보고 상세를 확인 | ko-1440 | done | done | 0 | 19 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 19개) |
| A 비로그인 사용자가 박스를 둘러보고 상세를 확인 | ko-390 | done | done | 0 | 19 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 19개) |
| A 비로그인 사용자가 박스를 둘러보고 상세를 확인 | zh-390 | done | done | 0 | 19 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 19개) |
| B 분류와 검색 조건을 바꾼 뒤 박스 고르기 | en-1440 | done | done | 4 | 8 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 12개) |
| B 분류와 검색 조건을 바꾼 뒤 박스 고르기 | en-390 | done | done | 4 | 8 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 12개) |
| B 분류와 검색 조건을 바꾼 뒤 박스 고르기 | ko-1440 | done | done | 4 | 8 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 12개) |
| B 분류와 검색 조건을 바꾼 뒤 박스 고르기 | ko-390 | done | done | 4 | 8 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 12개) |
| B 분류와 검색 조건을 바꾼 뒤 박스 고르기 | zh-390 | done | done | 4 | 8 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 12개) |
| C 로그인하지 않은 사용자가 개봉을 시도 | en-1440 | done | done | 0 | 8 | 0 | 0 | 2 | 0 | 0 | 같음 (견준 단계 8개) |
| C 로그인하지 않은 사용자가 개봉을 시도 | en-390 | done | done | 0 | 8 | 0 | 0 | 2 | 0 | 0 | 같음 (견준 단계 8개) |
| C 로그인하지 않은 사용자가 개봉을 시도 | ko-1440 | done | done | 0 | 8 | 0 | 0 | 2 | 0 | 0 | 같음 (견준 단계 8개) |
| C 로그인하지 않은 사용자가 개봉을 시도 | ko-390 | done | done | 0 | 8 | 0 | 0 | 2 | 0 | 0 | 같음 (견준 단계 8개) |
| C 로그인하지 않은 사용자가 개봉을 시도 | zh-390 | done | done | 0 | 8 | 0 | 0 | 2 | 0 | 0 | 같음 (견준 단계 8개) |
| D 로그인 사용자의 정상 개봉(한 개) | en-1440 | done | done | 0 | 19 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 19개) |
| D 로그인 사용자의 정상 개봉(한 개) | en-390 | done | done | 0 | 19 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 19개) |
| D 로그인 사용자의 정상 개봉(한 개) | ko-1440 | done | done | 0 | 19 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 19개) |
| D 로그인 사용자의 정상 개봉(한 개) | ko-390 | done | done | 0 | 19 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 19개) |
| D 로그인 사용자의 정상 개봉(한 개) | zh-390 | done | done | 0 | 19 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 19개) |
| D2 로그인 사용자의 정상 개봉(1달러 박스, 확인창 없음) | en-1440 | done | done | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 4개) |
| D2 로그인 사용자의 정상 개봉(1달러 박스, 확인창 없음) | en-390 | done | done | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 4개) |
| D2 로그인 사용자의 정상 개봉(1달러 박스, 확인창 없음) | ko-1440 | done | done | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 4개) |
| D2 로그인 사용자의 정상 개봉(1달러 박스, 확인창 없음) | ko-390 | done | done | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 4개) |
| D2 로그인 사용자의 정상 개봉(1달러 박스, 확인창 없음) | zh-390 | done | done | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 4개) |
| E 잔액이 모자란 상태에서 개봉을 시도 | en-1440 | done | done | 0 | 5 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 5개) |
| E 잔액이 모자란 상태에서 개봉을 시도 | en-390 | done | done | 0 | 5 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 5개) |
| E 잔액이 모자란 상태에서 개봉을 시도 | ko-1440 | done | done | 0 | 5 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 5개) |
| E 잔액이 모자란 상태에서 개봉을 시도 | ko-390 | done | done | 0 | 5 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 5개) |
| E 잔액이 모자란 상태에서 개봉을 시도 | zh-390 | done | done | 0 | 5 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 5개) |
| E2 잔액이 모자라고 보관 상품이 있을 때(USDT로 받기가 먼저) | en-1440 | done | done | 0 | 6 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 6개) |
| E2 잔액이 모자라고 보관 상품이 있을 때(USDT로 받기가 먼저) | en-390 | done | done | 0 | 6 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 6개) |
| E2 잔액이 모자라고 보관 상품이 있을 때(USDT로 받기가 먼저) | ko-1440 | done | done | 0 | 6 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 6개) |
| E2 잔액이 모자라고 보관 상품이 있을 때(USDT로 받기가 먼저) | ko-390 | done | done | 0 | 6 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 6개) |
| E2 잔액이 모자라고 보관 상품이 있을 때(USDT로 받기가 먼저) | zh-390 | done | done | 0 | 6 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 6개) |
| F 여러 개 개봉과 결과 확인 | en-1440 | done | done | 1 | 12 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 13개) |
| F 여러 개 개봉과 결과 확인 | en-390 | done | done | 1 | 12 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 13개) |
| F 여러 개 개봉과 결과 확인 | ko-1440 | done | done | 1 | 12 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 13개) |
| F 여러 개 개봉과 결과 확인 | ko-390 | done | done | 1 | 12 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 13개) |
| F 여러 개 개봉과 결과 확인 | zh-390 | done | done | 1 | 12 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 13개) |
| F2 여러 개 개봉(1달러 박스 5개, 확인창 없음) | en-1440 | done | done | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 4개) |
| F2 여러 개 개봉(1달러 박스 5개, 확인창 없음) | en-390 | done | done | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 4개) |
| F2 여러 개 개봉(1달러 박스 5개, 확인창 없음) | ko-1440 | done | done | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 4개) |
| F2 여러 개 개봉(1달러 박스 5개, 확인창 없음) | ko-390 | done | done | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 4개) |
| F2 여러 개 개봉(1달러 박스 5개, 확인창 없음) | zh-390 | done | done | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 4개) |
| G 상품을 보관함에서 확인 | en-1440 | done | done | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 11개) |
| G 상품을 보관함에서 확인 | en-390 | done | done | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 11개) |
| G 상품을 보관함에서 확인 | ko-1440 | done | done | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 11개) |
| G 상품을 보관함에서 확인 | ko-390 | done | done | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 11개) |
| G 상품을 보관함에서 확인 | zh-390 | done | done | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 11개) |
| H 상품의 배송과 USDT 전환 가능 상태 | en-1440 | done | done | 10 | 2 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 12개) |
| H 상품의 배송과 USDT 전환 가능 상태 | en-390 | done | done | 10 | 2 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 12개) |
| H 상품의 배송과 USDT 전환 가능 상태 | ko-1440 | done | done | 10 | 2 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 12개) |
| H 상품의 배송과 USDT 전환 가능 상태 | ko-390 | done | done | 10 | 2 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 12개) |
| H 상품의 배송과 USDT 전환 가능 상태 | zh-390 | done | done | 10 | 2 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 12개) |
| H2 배송을 신청한 상품과 운송 중인 상품 | en-1440 | done | done | 6 | 0 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 6개) |
| H2 배송을 신청한 상품과 운송 중인 상품 | en-390 | done | done | 6 | 0 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 6개) |
| H2 배송을 신청한 상품과 운송 중인 상품 | ko-1440 | done | done | 6 | 0 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 6개) |
| H2 배송을 신청한 상품과 운송 중인 상품 | ko-390 | done | done | 6 | 0 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 6개) |
| H2 배송을 신청한 상품과 운송 중인 상품 | zh-390 | done | done | 6 | 0 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 6개) |
| H3 출금: 입력 검증까지 | en-1440 | done | done | 8 | 0 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 8개) |
| H3 출금: 입력 검증까지 | en-390 | done | done | 8 | 0 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 8개) |
| H3 출금: 입력 검증까지 | ko-1440 | done | done | 8 | 0 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 8개) |
| H3 출금: 입력 검증까지 | ko-390 | done | done | 8 | 0 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 8개) |
| H3 출금: 입력 검증까지 | zh-390 | done | done | 8 | 0 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 8개) |
| I 개봉 결과 검증 | en-1440 | done | done | 7 | 4 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 11개) |
| I 개봉 결과 검증 | en-390 | done | done | 7 | 4 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 11개) |
| I 개봉 결과 검증 | ko-1440 | done | done | 7 | 4 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 11개) |
| I 개봉 결과 검증 | ko-390 | done | done | 7 | 4 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 11개) |
| I 개봉 결과 검증 | zh-390 | done | done | 7 | 4 | 0 | 0 | 1 | 0 | 0 | 같음 (견준 단계 11개) |
| J 후기 둘러보기와 후기 쓰기 | en-1440 | done | done | 5 | 6 | 0 | 0 | 2 | 0 | 0 | 같음 (견준 단계 11개) |
| J 후기 둘러보기와 후기 쓰기 | en-390 | done | done | 5 | 6 | 0 | 0 | 2 | 0 | 0 | 같음 (견준 단계 11개) |
| J 후기 둘러보기와 후기 쓰기 | ko-1440 | done | done | 5 | 6 | 0 | 0 | 2 | 0 | 0 | 같음 (견준 단계 11개) |
| J 후기 둘러보기와 후기 쓰기 | ko-390 | done | done | 5 | 6 | 0 | 0 | 2 | 0 | 0 | 같음 (견준 단계 11개) |
| J 후기 둘러보기와 후기 쓰기 | zh-390 | done | done | 5 | 6 | 0 | 0 | 2 | 0 | 0 | 같음 (견준 단계 11개) |
| J2 내가 쓴 후기가 맨 앞에 오는가(박스 화면과 후기 모두 보기) | en-1440 | done | done | 3 | 5 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 8개) |
| J2 내가 쓴 후기가 맨 앞에 오는가(박스 화면과 후기 모두 보기) | en-390 | done | done | 3 | 5 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 8개) |
| J2 내가 쓴 후기가 맨 앞에 오는가(박스 화면과 후기 모두 보기) | ko-1440 | done | done | 3 | 5 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 8개) |
| J2 내가 쓴 후기가 맨 앞에 오는가(박스 화면과 후기 모두 보기) | ko-390 | done | done | 3 | 5 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 8개) |
| J2 내가 쓴 후기가 맨 앞에 오는가(박스 화면과 후기 모두 보기) | zh-390 | done | done | 3 | 5 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 8개) |
| K 언어와 통화를 바꾼 뒤 이동과 새로 고침 | en-1440 | done | done | 1 | 10 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 11개) |
| K 언어와 통화를 바꾼 뒤 이동과 새로 고침 | en-390 | done | done | 1 | 10 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 11개) |
| K 언어와 통화를 바꾼 뒤 이동과 새로 고침 | ko-1440 | done | done | 1 | 10 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 11개) |
| K 언어와 통화를 바꾼 뒤 이동과 새로 고침 | ko-390 | done | done | 1 | 10 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 11개) |
| K 언어와 통화를 바꾼 뒤 이동과 새로 고침 | zh-390 | done | done | 1 | 10 | 0 | 0 | 0 | 0 | 0 | 같음 (견준 단계 11개) |
| L 브라우저 오류, 네트워크 실패, 세션 만료 | en-1440 | done | done | 4 | 7 | 0 | 0 | 2 | 0 | 0 | 같음 (견준 단계 11개) |
| L 브라우저 오류, 네트워크 실패, 세션 만료 | en-390 | done | done | 4 | 7 | 0 | 0 | 2 | 0 | 0 | 같음 (견준 단계 11개) |
| L 브라우저 오류, 네트워크 실패, 세션 만료 | ko-1440 | done | done | 4 | 7 | 0 | 0 | 2 | 0 | 0 | 같음 (견준 단계 11개) |
| L 브라우저 오류, 네트워크 실패, 세션 만료 | ko-390 | done | done | 4 | 7 | 0 | 0 | 2 | 0 | 0 | 같음 (견준 단계 11개) |
| L 브라우저 오류, 네트워크 실패, 세션 만료 | zh-390 | done | done | 4 | 7 | 0 | 0 | 2 | 0 | 0 | 같음 (견준 단계 11개) |

## 장부(저장된 값)

지갑, 보관함, 거래, 시드와 nonce, 세션, 저장 키 전부. 두 쪽이 같아야 한다.

다른 칸 없음. 견준 단계 895개 전부에서 저장된 값이 같다.

## 설명 안 되는 칸

없음.

## 의도된 차이(단계별, 다른 칸과 맞은 규칙)

- A en-1440, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- A en-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- A ko-1440, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- A ko-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- A zh-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- B en-1440, W1-review-zone: 단계 1, 2, 3, 4, 8, 11, 12, 13. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[]
- B en-390, W1-review-zone: 단계 1, 2, 3, 4, 8, 11, 12, 13. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[]
- B ko-1440, W1-review-zone: 단계 1, 2, 3, 4, 8, 11, 12, 13. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[]
- B ko-390, W1-review-zone: 단계 1, 2, 3, 4, 8, 11, 12, 13. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[]
- B zh-390, W1-review-zone: 단계 1, 2, 3, 4, 8, 11, 12, 13. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[]
- C en-1440, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- C en-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- C ko-1440, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- C ko-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- C zh-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- D en-1440, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- D en-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- D ko-1440, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- D ko-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- D zh-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- D2 en-1440, W1-review-zone: 단계 1, 2, 3, 4. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- D2 en-390, W1-review-zone: 단계 1, 2, 3, 4. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- D2 ko-1440, W1-review-zone: 단계 1, 2, 3, 4. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- D2 ko-390, W1-review-zone: 단계 1, 2, 3, 4. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- D2 zh-390, W1-review-zone: 단계 1, 2, 3, 4. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- E en-1440, W1-review-zone: 단계 1, 2, 3, 4, 5. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- E en-390, W1-review-zone: 단계 1, 2, 3, 4, 5. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- E ko-1440, W1-review-zone: 단계 1, 2, 3, 4, 5. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- E ko-390, W1-review-zone: 단계 1, 2, 3, 4, 5. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- E zh-390, W1-review-zone: 단계 1, 2, 3, 4, 5. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- E2 en-1440, W1-review-zone: 단계 1, 2, 3, 4, 5, 6. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- E2 en-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- E2 ko-1440, W1-review-zone: 단계 1, 2, 3, 4, 5, 6. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- E2 ko-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- E2 zh-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- F en-1440, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[]
- F en-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[]
- F ko-1440, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[]
- F ko-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[]
- F zh-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12. 칸: observed.reviewZone.roots.length, observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[]
- F2 en-1440, W1-review-zone: 단계 1, 2, 3, 4. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- F2 en-390, W1-review-zone: 단계 1, 2, 3, 4. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- F2 ko-1440, W1-review-zone: 단계 1, 2, 3, 4. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- F2 ko-390, W1-review-zone: 단계 1, 2, 3, 4. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- F2 zh-390, W1-review-zone: 단계 1, 2, 3, 4. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- H en-1440, W2-wallet-history: 단계 12, 13. 칸: observed.counts.itemrows, observed.itemrows.length, observed.itemrows[], observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash, observed.rows[], observed.dialogs[].title, observed.dialogs[].text
- H en-390, W2-wallet-history: 단계 12, 13. 칸: observed.counts.itemrows, observed.itemrows.length, observed.itemrows[], observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash, observed.rows[], observed.dialogs[].title, observed.dialogs[].text
- H ko-1440, W2-wallet-history: 단계 12, 13. 칸: observed.counts.itemrows, observed.itemrows.length, observed.itemrows[], observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash, observed.rows[], observed.dialogs[].title, observed.dialogs[].text
- H ko-390, W2-wallet-history: 단계 12, 13. 칸: observed.counts.itemrows, observed.itemrows.length, observed.itemrows[], observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash, observed.rows[], observed.dialogs[].title, observed.dialogs[].text
- H zh-390, W2-wallet-history: 단계 12, 13. 칸: observed.counts.itemrows, observed.itemrows.length, observed.itemrows[], observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash, observed.rows[], observed.dialogs[].title, observed.dialogs[].text
- I en-1440, W1-review-zone: 단계 1, 2, 3, 4. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- I en-390, W1-review-zone: 단계 1, 2, 3, 4. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- I ko-1440, W1-review-zone: 단계 1, 2, 3, 4. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- I ko-390, W1-review-zone: 단계 1, 2, 3, 4. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- I zh-390, W1-review-zone: 단계 1, 2, 3, 4. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- J en-1440, W1-reviews-page: 단계 1, 2, 3. 칸: observed.chips.length, observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash, observed.path, observed.chips[].count, observed.chips[].pressed[], observed.focus, notes.branch
- J en-1440, W1-review-zone: 단계 1, 2, 3, 4, 5, 6. 칸: observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.images, observed.reviewZone.buttons[]
- J en-1440, W1-review-sheet: 단계 4, 5. 칸: observed.path, observed.links[], observed.chips[].count, observed.rows[], observed.dialogs[].text, observed.dialogs[].links[], observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash, observed.focus
- J en-390, W1-reviews-page: 단계 1, 2, 3. 칸: observed.chips.length, observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash, observed.path, observed.chips[].count, observed.chips[].pressed[], observed.focus, notes.branch
- J en-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6. 칸: observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.images, observed.reviewZone.buttons[]
- J en-390, W1-review-sheet: 단계 4, 5. 칸: observed.path, observed.links[], observed.chips[].count, observed.rows[], observed.dialogs[].text, observed.dialogs[].links[], observed.scrolled, observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash, observed.focus
- J ko-1440, W1-reviews-page: 단계 1, 2, 3. 칸: observed.chips.length, observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash, observed.path, observed.chips[].count, observed.chips[].pressed[], observed.focus, notes.branch
- J ko-1440, W1-review-zone: 단계 1, 2, 3, 4, 5, 6. 칸: observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.images, observed.reviewZone.buttons[]
- J ko-1440, W1-review-sheet: 단계 4, 5. 칸: observed.path, observed.links[], observed.chips[].count, observed.rows[], observed.dialogs[].text, observed.dialogs[].links[], observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash, observed.focus
- J ko-390, W1-reviews-page: 단계 1, 2, 3. 칸: observed.chips.length, observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash, observed.path, observed.chips[].count, observed.chips[].pressed[], observed.focus, notes.branch
- J ko-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6. 칸: observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.images, observed.reviewZone.buttons[]
- J ko-390, W1-review-sheet: 단계 4, 5. 칸: observed.path, observed.links[], observed.chips[].count, observed.rows[], observed.dialogs[].text, observed.dialogs[].links[], observed.scrolled, observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash, observed.focus
- J zh-390, W1-reviews-page: 단계 1, 2, 3. 칸: observed.chips.length, observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash, observed.path, observed.chips[].count, observed.chips[].pressed[], observed.focus, notes.branch
- J zh-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6. 칸: observed.reviewZone.roots[], observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.images, observed.reviewZone.buttons[]
- J zh-390, W1-review-sheet: 단계 4, 5. 칸: observed.path, observed.links[], observed.chips[].count, observed.rows[], observed.dialogs[].text, observed.dialogs[].links[], observed.scrolled, observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash, observed.focus
- J2 en-1440, W1-review-zone: 단계 4, 5, 6, 7, 8. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images, observed.reviewZone.roots[]
- J2 en-1440, W1-own-review-note: 단계 4, 5, 6, 7, 8. 칸: notes.own.cards, notes.own.first
- J2 en-1440, W1-reviews-page-J2: 단계 5, 6, 7. 칸: observed.chips.length, observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash
- J2 en-390, W1-review-zone: 단계 4, 5, 6, 7, 8. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images, observed.reviewZone.roots[]
- J2 en-390, W1-own-review-note: 단계 4, 5, 6, 7, 8. 칸: notes.own.cards, notes.own.first
- J2 en-390, W1-reviews-page-J2: 단계 5, 6, 7. 칸: observed.chips.length, observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash
- J2 ko-1440, W1-review-zone: 단계 4, 5, 6, 7, 8. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images, observed.reviewZone.roots[]
- J2 ko-1440, W1-own-review-note: 단계 4, 5, 6, 7, 8. 칸: notes.own.cards, notes.own.first
- J2 ko-1440, W1-reviews-page-J2: 단계 5, 6, 7. 칸: observed.chips.length, observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash
- J2 ko-390, W1-review-zone: 단계 4, 5, 6, 7, 8. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images, observed.reviewZone.roots[]
- J2 ko-390, W1-own-review-note: 단계 4, 5, 6, 7, 8. 칸: notes.own.cards, notes.own.first
- J2 ko-390, W1-reviews-page-J2: 단계 5, 6, 7. 칸: observed.chips.length, observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash
- J2 zh-390, W1-review-zone: 단계 4, 5, 6, 7, 8. 칸: observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images, observed.reviewZone.roots[]
- J2 zh-390, W1-own-review-note: 단계 4, 5, 6, 7, 8. 칸: notes.own.cards, notes.own.first
- J2 zh-390, W1-reviews-page-J2: 단계 5, 6, 7. 칸: observed.chips.length, observed.mainOutsideReviews.length, observed.mainOutsideReviews.hash
- K en-1440, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 8, 9, 10, 11. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- K en-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 8, 9, 10, 11. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- K ko-1440, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 8, 9, 10, 11. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- K ko-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 8, 9, 10, 11. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- K zh-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 8, 9, 10, 11. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- L en-1440, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- L en-1440, W1-lazy-images: 단계 3, 4, 5. 칸: observed.counts.brokenImages, console.length
- L en-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- L en-390, W1-lazy-images: 단계 3, 4, 5. 칸: observed.counts.brokenImages, console.length, console[]
- L ko-1440, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- L ko-1440, W1-lazy-images: 단계 3, 4, 5. 칸: observed.counts.brokenImages, console.length
- L ko-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- L ko-390, W1-lazy-images: 단계 3, 4, 5. 칸: observed.counts.brokenImages, console.length, console[]
- L zh-390, W1-review-zone: 단계 1, 2, 3, 4, 5, 6, 7. 칸: observed.reviewZone.roots.length, observed.reviewZone.textLength, observed.reviewZone.textHash, observed.reviewZone.sample, observed.reviewZone.cardRatings.length, observed.reviewZone.roots[], observed.reviewZone.cards, observed.reviewZone.buttons.length, observed.reviewZone.buttons[], observed.reviewZone.images
- L zh-390, W1-lazy-images: 단계 3, 4, 5. 칸: observed.counts.brokenImages, console.length, console[]

## 오류와 한쪽만 실행한 단계

없음.

## 검증 불가(두 쪽 모두 실행하지 않음)

- B 정렬 바꾸기: 박스 목록 화면에 정렬을 바꾸는 조작 요소가 없다(components/box/BoxList.tsx). 누를 것이 없어 실행하지 않았다
- C 소셜 로그인(Google, Apple, Microsoft): 바깥 로그인 서비스로 나가는 요청이다. 실행하지 않는다
- C 가입과 이메일 인증: 인증 메일을 받는 서버가 없다. 가입 화면은 촬영(overlay/signup)으로만 본다
- E 입금 뒤 잔액 반영: 입금을 확인하는 서버가 없다. 실제 돈을 보내지 않는다
- H 배송 신청 내기: 배송 신청은 실제로 내지 않는다(작업 규칙). 입력이 검증된 상태까지만 본다
- H2 운송장 조회와 배송 완료: 운송장을 내주는 서버와 택배사 조회가 없다. 바깥 주소로 나가지 않는다
- H3 인증과 출금 신청: 출금 신청은 실제로 내지 않는다(작업 규칙). 인증 메일을 보내는 서버도 없다
- I 온체인 기록 대조: 결과를 체인에 올리는 서버가 없다. 화면에 그 상태가 어떻게 적히는지만 위 단계의 글로 남는다
- J 사진 붙이기: 운영체제의 파일 고르는 창은 이 도구가 다루지 않는다. 실행하지 않았다
- J 후기의 서버 게시와 검수: 후기를 받는 서버가 없다. 브라우저 안의 저장까지만 본다
- L 서버가 끝낸 세션(401): 계정 서버가 없다(브라우저 안의 계정). 서버가 세션을 끝내는 경우는 만들 수 없다
- L 화면을 그리다 난 오류(error.tsx): 사용자 조작으로 그 화면에 닿는 길을 찾지 못했다. 코드를 고치지 않고는 만들 수 없다
