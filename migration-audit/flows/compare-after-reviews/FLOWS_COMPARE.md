# 흐름 비교

A: before-local (http://127.0.0.1:4173/voila-test-aresjoo)
B: after-reviews (http://127.0.0.1:4174/voila-test-aresjoo)

같음은 "두 환경에서 실행했고 적은 값이 전부 같다"는 뜻이다. 검증 불가와 한쪽만 실행은 같음으로 세지 않는다.

단계 합계: 같음 106, 다름 218, 검증 불가 20, 한쪽만 실행 22, 오류 0

| 시나리오 | 변형 | A 상태 | B 상태 | 같음 | 다름 | 검증 불가 | 한쪽만 실행 | 오류 |
|---|---|---|---|---|---|---|---|---|
| A 비로그인 사용자가 박스를 둘러보고 상세를 확인 | en-1440 | done | done | 0 | 19 | 0 | 0 | 0 |
| A 비로그인 사용자가 박스를 둘러보고 상세를 확인 | ko-390 | done | done | 0 | 19 | 0 | 0 | 0 |
| B 분류와 검색 조건을 바꾼 뒤 박스 고르기 | en-1440 | done | done | 4 | 8 | 1 | 0 | 0 |
| B 분류와 검색 조건을 바꾼 뒤 박스 고르기 | ko-390 | done | done | 4 | 8 | 1 | 0 | 0 |
| C 로그인하지 않은 사용자가 개봉을 시도 | en-1440 | done | done | 0 | 8 | 2 | 0 | 0 |
| C 로그인하지 않은 사용자가 개봉을 시도 | ko-390 | done | done | 0 | 8 | 2 | 0 | 0 |
| D 로그인 사용자의 정상 개봉(한 개) | en-1440 | done | done | 0 | 19 | 0 | 0 | 0 |
| D 로그인 사용자의 정상 개봉(한 개) | ko-390 | done | done | 0 | 19 | 0 | 0 | 0 |
| D2 로그인 사용자의 정상 개봉(1달러 박스, 확인창 없음) | en-1440 | done | done | 0 | 4 | 0 | 0 | 0 |
| D2 로그인 사용자의 정상 개봉(1달러 박스, 확인창 없음) | ko-390 | done | done | 0 | 4 | 0 | 0 | 0 |
| E 잔액이 모자란 상태에서 개봉을 시도 | en-1440 | done | done | 0 | 5 | 1 | 0 | 0 |
| E 잔액이 모자란 상태에서 개봉을 시도 | ko-390 | done | done | 0 | 5 | 1 | 0 | 0 |
| E2 잔액이 모자라고 보관 상품이 있을 때(USDT로 받기가 먼저) | en-1440 | done | done | 0 | 6 | 0 | 0 | 0 |
| E2 잔액이 모자라고 보관 상품이 있을 때(USDT로 받기가 먼저) | ko-390 | done | done | 0 | 6 | 0 | 0 | 0 |
| F 여러 개 개봉과 결과 확인 | en-1440 | done | done | 1 | 12 | 0 | 0 | 0 |
| F 여러 개 개봉과 결과 확인 | ko-390 | done | done | 1 | 12 | 0 | 0 | 0 |
| F2 여러 개 개봉(1달러 박스 5개, 확인창 없음) | en-1440 | done | done | 0 | 4 | 0 | 0 | 0 |
| F2 여러 개 개봉(1달러 박스 5개, 확인창 없음) | ko-390 | done | done | 0 | 4 | 0 | 0 | 0 |
| G 상품을 보관함에서 확인 | en-1440 | done | done | 11 | 0 | 0 | 0 | 0 |
| G 상품을 보관함에서 확인 | ko-390 | done | done | 11 | 0 | 0 | 0 | 0 |
| H 상품의 배송과 USDT 전환 가능 상태 | en-1440 | done | done | 12 | 0 | 1 | 0 | 0 |
| H 상품의 배송과 USDT 전환 가능 상태 | ko-390 | done | done | 12 | 0 | 1 | 0 | 0 |
| H2 배송을 신청한 상품과 운송 중인 상품 | en-1440 | done | done | 6 | 0 | 1 | 0 | 0 |
| H2 배송을 신청한 상품과 운송 중인 상품 | ko-390 | done | done | 6 | 0 | 1 | 0 | 0 |
| H3 출금: 입력 검증까지 | en-1440 | done | done | 8 | 0 | 1 | 0 | 0 |
| H3 출금: 입력 검증까지 | ko-390 | done | done | 8 | 0 | 1 | 0 | 0 |
| I 개봉 결과 검증 | en-1440 | done | done | 7 | 4 | 1 | 0 | 0 |
| I 개봉 결과 검증 | ko-390 | done | done | 7 | 4 | 1 | 0 | 0 |
| J 후기 둘러보기와 후기 쓰기 | en-1440 | done | error | 0 | 2 | 0 | 11 | 0 |
| J 후기 둘러보기와 후기 쓰기 | ko-390 | done | error | 0 | 2 | 0 | 11 | 0 |
| K 언어와 통화를 바꾼 뒤 이동과 새로 고침 | en-1440 | done | done | 1 | 10 | 0 | 0 | 0 |
| K 언어와 통화를 바꾼 뒤 이동과 새로 고침 | ko-390 | done | done | 1 | 10 | 0 | 0 | 0 |
| L 브라우저 오류, 네트워크 실패, 세션 만료 | en-1440 | done | done | 3 | 8 | 2 | 0 | 0 |
| L 브라우저 오류, 네트워크 실패, 세션 만료 | ko-390 | done | done | 3 | 8 | 2 | 0 | 0 |

## 다른 단계

### A en-1440, 1번 시작

- `observed.boxcards[0]`: A Rolls-Royce Box $500 / B Rolls-Royce Box 4.3 (101) $500
- `observed.boxcards[1]`: A Rolex Box $250 / B Rolex Box 4.3 (136) $250
- `observed.boxcards[2]`: A Hermès Bag Box $500 / B Hermès Bag Box 4.3 (95) $500
- `observed.boxcards[3]`: A Cartier Jewelry Box $250 / B Cartier Jewelry Box 4.2 (151) $250
- `observed.boxcards[4]`: A Nike Fashion Box $100 / B Nike Fashion Box 4.4 (172) $100
- `observed.boxcards[5]`: A Apple Mobile Box $100 / B Apple Mobile Box 4.5 (240) $100
- `observed.boxcards[6]`: A Apple Mac Box $250 / B Apple Mac Box 4.4 (164) $250
- `observed.boxcards[7]`: A PlayStation Box $50 / B PlayStation Box 4.3 (230) $50
- `observed.mainLength`: A 771 / B 1009

### A en-1440, 2번 더 보기

- `observed.boxcards[0]`: A Rolls-Royce Box $500 / B Rolls-Royce Box 4.3 (101) $500
- `observed.boxcards[1]`: A Rolex Box $250 / B Rolex Box 4.3 (136) $250
- `observed.boxcards[2]`: A Hermès Bag Box $500 / B Hermès Bag Box 4.3 (95) $500
- `observed.boxcards[3]`: A Cartier Jewelry Box $250 / B Cartier Jewelry Box 4.2 (151) $250
- `observed.boxcards[4]`: A Nike Fashion Box $100 / B Nike Fashion Box 4.4 (172) $100
- `observed.boxcards[5]`: A Apple Mobile Box $100 / B Apple Mobile Box 4.5 (240) $100
- `observed.boxcards[6]`: A Apple Mac Box $250 / B Apple Mac Box 4.4 (164) $250
- `observed.boxcards[7]`: A PlayStation Box $50 / B PlayStation Box 4.3 (230) $50
- `observed.mainLength`: A 1357 / B 1835

### A en-1440, 3번 박스 고르기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4807 / B 5509

### A en-1440, 4번 대표 상품을 눌러 구성품으로 내려가기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4807 / B 5509

### A en-1440, 5번 사진 상품 상세 열기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 3 / B 4
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Show shipping countries / B 
- `observed.counts.images`: A 14 / B 15
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5204 / B 5906

### A en-1440, 6번 배송 가능 나라 펴기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 3 / B 4
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Hide shipping countries / B 
- `observed.counts.images`: A 14 / B 15
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5349 / B 6051

### A en-1440, 7번 Escape 로 닫기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4807 / B 5509

### A en-1440, 8번 행 상품 상세 열기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Show shipping countries / B 
- `observed.links[3]`: A Compare with 3 other boxes / B Show shipping countries
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5147 / B 5849

### A en-1440, 9번 바깥을 눌러 닫기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4807 / B 5509

### A en-1440, 10번 상품별 확률표 펴기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 9605 / B 10307

### A en-1440, 11번 확률표의 행 열기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Show shipping countries / B 
- `observed.links[3]`: A Compare with 3 other boxes / B Show shipping countries
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 9945 / B 10647

### A en-1440, 12번 닫기 단추

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 9605 / B 10307

### A en-1440, 13번 알아 둘 것 펴기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A How to verify a result from the value locked before opening / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 9973 / B 10675

### A en-1440, 14번 뒤로 가기 링크

- `observed.boxcards[0]`: A Rolls-Royce Box $500 / B Rolls-Royce Box 4.3 (101) $500
- `observed.boxcards[1]`: A Rolex Box $250 / B Rolex Box 4.3 (136) $250
- `observed.boxcards[2]`: A Hermès Bag Box $500 / B Hermès Bag Box 4.3 (95) $500
- `observed.boxcards[3]`: A Cartier Jewelry Box $250 / B Cartier Jewelry Box 4.2 (151) $250
- `observed.boxcards[4]`: A Nike Fashion Box $100 / B Nike Fashion Box 4.4 (172) $100
- `observed.boxcards[5]`: A Apple Mobile Box $100 / B Apple Mobile Box 4.5 (240) $100
- `observed.boxcards[6]`: A Apple Mac Box $250 / B Apple Mac Box 4.4 (164) $250
- `observed.boxcards[7]`: A PlayStation Box $50 / B PlayStation Box 4.3 (230) $50
- `observed.mainLength`: A 771 / B 1009

### A en-1440, 15번 브라우저 뒤로

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4807 / B 5509

### A en-1440, 16번 브라우저 앞으로

- `observed.boxcards[0]`: A Rolls-Royce Box $500 / B Rolls-Royce Box 4.3 (101) $500
- `observed.boxcards[1]`: A Rolex Box $250 / B Rolex Box 4.3 (136) $250
- `observed.boxcards[2]`: A Hermès Bag Box $500 / B Hermès Bag Box 4.3 (95) $500
- `observed.boxcards[3]`: A Cartier Jewelry Box $250 / B Cartier Jewelry Box 4.2 (151) $250
- `observed.boxcards[4]`: A Nike Fashion Box $100 / B Nike Fashion Box 4.4 (172) $100
- `observed.boxcards[5]`: A Apple Mobile Box $100 / B Apple Mobile Box 4.5 (240) $100
- `observed.boxcards[6]`: A Apple Mac Box $250 / B Apple Mac Box 4.4 (164) $250
- `observed.boxcards[7]`: A PlayStation Box $50 / B PlayStation Box 4.3 (230) $50
- `observed.mainLength`: A 771 / B 1009

### A en-1440, 17번 주소로 바로 들어가기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (131 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 101 / B 106
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4811 / B 5561

### A en-1440, 18번 새로 고침

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (131 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 101 / B 106
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4811 / B 5561

### A en-1440, 19번 메뉴 열기(좁은 폭에서만)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (131 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 101 / B 106
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4811 / B 5561

### A ko-390, 1번 시작

- `observed.boxcards[0]`: A 롤스로이스 박스 $500 / B 롤스로이스 박스 4.3 (101) $500
- `observed.boxcards[1]`: A 롤렉스 박스 $250 / B 롤렉스 박스 4.3 (136) $250
- `observed.boxcards[2]`: A 에르메스 가방 박스 $500 / B 에르메스 가방 박스 4.3 (95) $500
- `observed.boxcards[3]`: A 까르띠에 주얼리 박스 $250 / B 까르띠에 주얼리 박스 4.2 (151) $250
- `observed.boxcards[4]`: A 나이키 패션 박스 $100 / B 나이키 패션 박스 4.4 (172) $100
- `observed.boxcards[5]`: A 애플 모바일 박스 $100 / B 애플 모바일 박스 4.5 (240) $100
- `observed.boxcards[6]`: A 애플 맥 박스 $250 / B 애플 맥 박스 4.4 (164) $250
- `observed.boxcards[7]`: A 플레이스테이션 박스 $50 / B 플레이스테이션 박스 4.3 (230) $50
- `observed.mainLength`: A 484 / B 722

### A ko-390, 2번 더 보기

- `observed.boxcards[0]`: A 롤스로이스 박스 $500 / B 롤스로이스 박스 4.3 (101) $500
- `observed.boxcards[1]`: A 롤렉스 박스 $250 / B 롤렉스 박스 4.3 (136) $250
- `observed.boxcards[2]`: A 에르메스 가방 박스 $500 / B 에르메스 가방 박스 4.3 (95) $500
- `observed.boxcards[3]`: A 까르띠에 주얼리 박스 $250 / B 까르띠에 주얼리 박스 4.2 (151) $250
- `observed.boxcards[4]`: A 나이키 패션 박스 $100 / B 나이키 패션 박스 4.4 (172) $100
- `observed.boxcards[5]`: A 애플 모바일 박스 $100 / B 애플 모바일 박스 4.5 (240) $100
- `observed.boxcards[6]`: A 애플 맥 박스 $250 / B 애플 맥 박스 4.4 (164) $250
- `observed.boxcards[7]`: A 플레이스테이션 박스 $50 / B 플레이스테이션 박스 4.3 (230) $50
- `observed.mainLength`: A 864 / B 1342

### A ko-390, 3번 박스 고르기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3144 / B 3606

### A ko-390, 4번 대표 상품을 눌러 구성품으로 내려가기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3144 / B 3606

### A ko-390, 5번 사진 상품 상세 열기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 3 / B 4
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 배송 가능 나라 보기 / B 
- `observed.counts.images`: A 14 / B 15
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3374 / B 3836

### A ko-390, 6번 배송 가능 나라 펴기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 3 / B 4
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 배송 가능 나라 닫기 / B 
- `observed.counts.images`: A 14 / B 15
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3440 / B 3902

### A ko-390, 7번 Escape 로 닫기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3144 / B 3606

### A ko-390, 8번 행 상품 상세 열기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 배송 가능 나라 보기 / B 
- `observed.links[3]`: A 다른 박스 3개와 비교 / B 배송 가능 나라 보기
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3354 / B 3816

### A ko-390, 9번 바깥을 눌러 닫기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3144 / B 3606

### A ko-390, 10번 상품별 확률표 펴기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 6547 / B 7009

### A ko-390, 11번 확률표의 행 열기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 배송 가능 나라 보기 / B 
- `observed.links[3]`: A 다른 박스 3개와 비교 / B 배송 가능 나라 보기
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 6757 / B 7219

### A ko-390, 12번 닫기 단추

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 6547 / B 7009

### A ko-390, 13번 알아 둘 것 펴기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A 열기 전에 잠긴 값으로 결과를 검증하는 방법 / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 6712 / B 7174

### A ko-390, 14번 뒤로 가기 링크

- `observed.boxcards[0]`: A 롤스로이스 박스 $500 / B 롤스로이스 박스 4.3 (101) $500
- `observed.boxcards[1]`: A 롤렉스 박스 $250 / B 롤렉스 박스 4.3 (136) $250
- `observed.boxcards[2]`: A 에르메스 가방 박스 $500 / B 에르메스 가방 박스 4.3 (95) $500
- `observed.boxcards[3]`: A 까르띠에 주얼리 박스 $250 / B 까르띠에 주얼리 박스 4.2 (151) $250
- `observed.boxcards[4]`: A 나이키 패션 박스 $100 / B 나이키 패션 박스 4.4 (172) $100
- `observed.boxcards[5]`: A 애플 모바일 박스 $100 / B 애플 모바일 박스 4.5 (240) $100
- `observed.boxcards[6]`: A 애플 맥 박스 $250 / B 애플 맥 박스 4.4 (164) $250
- `observed.boxcards[7]`: A 플레이스테이션 박스 $50 / B 플레이스테이션 박스 4.3 (230) $50
- `observed.mainLength`: A 484 / B 722

### A ko-390, 15번 브라우저 뒤로

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3144 / B 3606

### A ko-390, 16번 브라우저 앞으로

- `observed.boxcards[0]`: A 롤스로이스 박스 $500 / B 롤스로이스 박스 4.3 (101) $500
- `observed.boxcards[1]`: A 롤렉스 박스 $250 / B 롤렉스 박스 4.3 (136) $250
- `observed.boxcards[2]`: A 에르메스 가방 박스 $500 / B 에르메스 가방 박스 4.3 (95) $500
- `observed.boxcards[3]`: A 까르띠에 주얼리 박스 $250 / B 까르띠에 주얼리 박스 4.2 (151) $250
- `observed.boxcards[4]`: A 나이키 패션 박스 $100 / B 나이키 패션 박스 4.4 (172) $100
- `observed.boxcards[5]`: A 애플 모바일 박스 $100 / B 애플 모바일 박스 4.5 (240) $100
- `observed.boxcards[6]`: A 애플 맥 박스 $250 / B 애플 맥 박스 4.4 (164) $250
- `observed.boxcards[7]`: A 플레이스테이션 박스 $50 / B 플레이스테이션 박스 4.3 (230) $50
- `observed.mainLength`: A 484 / B 722

### A ko-390, 17번 주소로 바로 들어가기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (131건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 101 / B 106
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3541 / B 4069

### A ko-390, 18번 새로 고침

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (131건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 101 / B 106
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3541 / B 4069

### A ko-390, 19번 메뉴 열기(좁은 폭에서만)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (131건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 101 / B 106
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3541 / B 4069

### B en-1440, 1번 시작

- `observed.boxcards[0]`: A Rolls-Royce Box $500 / B Rolls-Royce Box 4.3 (101) $500
- `observed.boxcards[1]`: A Rolex Box $250 / B Rolex Box 4.3 (136) $250
- `observed.boxcards[2]`: A Hermès Bag Box $500 / B Hermès Bag Box 4.3 (95) $500
- `observed.boxcards[3]`: A Cartier Jewelry Box $250 / B Cartier Jewelry Box 4.2 (151) $250
- `observed.boxcards[4]`: A Nike Fashion Box $100 / B Nike Fashion Box 4.4 (172) $100
- `observed.boxcards[5]`: A Apple Mobile Box $100 / B Apple Mobile Box 4.5 (240) $100
- `observed.boxcards[6]`: A Apple Mac Box $250 / B Apple Mac Box 4.4 (164) $250
- `observed.boxcards[7]`: A PlayStation Box $50 / B PlayStation Box 4.3 (230) $50
- `observed.mainLength`: A 771 / B 1009

### B en-1440, 2번 분류: 셋째 알약

- `observed.boxcards[0]`: A Rolex Box $250 / B Rolex Box 4.3 (136) $250
- `observed.boxcards[1]`: A Patek Philippe Box $500 / B Patek Philippe Box 4.3 (113) $500
- `observed.boxcards[2]`: A Audemars Piguet Box $500 / B Audemars Piguet Box 4.3 (101) $500
- `observed.boxcards[3]`: A Vacheron Constantin Box $500 / B Vacheron Constantin Box 4.4 (93) $500
- `observed.boxcards[4]`: A A. Lange & Söhne Box $500 / B A. Lange & Söhne Box 4.4 (141) $500
- `observed.boxcards[5]`: A Omega Box $250 / B Omega Box 4.3 (147) $250
- `observed.boxcards[6]`: A Cartier Watch Box $250 / B Cartier Watch Box 4.4 (165) $250
- `observed.boxcards[7]`: A IWC Box $250 / B IWC Box 4.4 (200) $250
- `observed.mainLength`: A 641 / B 840

### B en-1440, 3번 분류: 아홉째 알약

- `observed.boxcards[0]`: A PlayStation Box $50 / B PlayStation Box 4.3 (230) $50
- `observed.boxcards[1]`: A Xbox Box $50 / B Xbox Box 4.4 (263) $50
- `observed.boxcards[2]`: A Nintendo Box $50 / B Nintendo Box 4.4 (289) $50
- `observed.boxcards[3]`: A Valve Box $50 / B Valve Box 4.3 (270) $50
- `observed.boxcards[4]`: A ASUS ROG Box $100 / B ASUS ROG Box 4.3 (276) $100
- `observed.boxcards[5]`: A MSI Gaming Box $100 / B MSI Gaming Box 4.3 (230) $100
- `observed.boxcards[6]`: A Razer Gaming Box $50 / B Razer Gaming Box 4.4 (299) $50
- `observed.boxcards[7]`: A Logitech G Box $50 / B Logitech G Box 4.5 (307) $50
- `observed.mainLength`: A 609 / B 809

### B en-1440, 4번 분류: 전체

- `observed.boxcards[0]`: A Rolls-Royce Box $500 / B Rolls-Royce Box 4.3 (101) $500
- `observed.boxcards[1]`: A Rolex Box $250 / B Rolex Box 4.3 (136) $250
- `observed.boxcards[2]`: A Hermès Bag Box $500 / B Hermès Bag Box 4.3 (95) $500
- `observed.boxcards[3]`: A Cartier Jewelry Box $250 / B Cartier Jewelry Box 4.2 (151) $250
- `observed.boxcards[4]`: A Nike Fashion Box $100 / B Nike Fashion Box 4.4 (172) $100
- `observed.boxcards[5]`: A Apple Mobile Box $100 / B Apple Mobile Box 4.5 (240) $100
- `observed.boxcards[6]`: A Apple Mac Box $250 / B Apple Mac Box 4.4 (164) $250
- `observed.boxcards[7]`: A PlayStation Box $50 / B PlayStation Box 4.3 (230) $50
- `observed.mainLength`: A 771 / B 1009

### B en-1440, 8번 검색: 지우기

- `observed.boxcards[0]`: A Rolls-Royce Box $500 / B Rolls-Royce Box 4.3 (101) $500
- `observed.boxcards[1]`: A Rolex Box $250 / B Rolex Box 4.3 (136) $250
- `observed.boxcards[2]`: A Hermès Bag Box $500 / B Hermès Bag Box 4.3 (95) $500
- `observed.boxcards[3]`: A Cartier Jewelry Box $250 / B Cartier Jewelry Box 4.2 (151) $250
- `observed.boxcards[4]`: A Nike Fashion Box $100 / B Nike Fashion Box 4.4 (172) $100
- `observed.boxcards[5]`: A Apple Mobile Box $100 / B Apple Mobile Box 4.5 (240) $100
- `observed.boxcards[6]`: A Apple Mac Box $250 / B Apple Mac Box 4.4 (164) $250
- `observed.boxcards[7]`: A PlayStation Box $50 / B PlayStation Box 4.3 (230) $50
- `observed.mainLength`: A 771 / B 1009

### B en-1440, 11번 검색 결과의 첫 행으로 박스 가기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (271 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5440 / B 6126

### B en-1440, 12번 수량 바꾸기: 5개

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (271 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5441 / B 6127

### B en-1440, 13번 수량 바꾸기: 100개

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (271 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5445 / B 6131

### B ko-390, 1번 시작

- `observed.boxcards[0]`: A 롤스로이스 박스 $500 / B 롤스로이스 박스 4.3 (101) $500
- `observed.boxcards[1]`: A 롤렉스 박스 $250 / B 롤렉스 박스 4.3 (136) $250
- `observed.boxcards[2]`: A 에르메스 가방 박스 $500 / B 에르메스 가방 박스 4.3 (95) $500
- `observed.boxcards[3]`: A 까르띠에 주얼리 박스 $250 / B 까르띠에 주얼리 박스 4.2 (151) $250
- `observed.boxcards[4]`: A 나이키 패션 박스 $100 / B 나이키 패션 박스 4.4 (172) $100
- `observed.boxcards[5]`: A 애플 모바일 박스 $100 / B 애플 모바일 박스 4.5 (240) $100
- `observed.boxcards[6]`: A 애플 맥 박스 $250 / B 애플 맥 박스 4.4 (164) $250
- `observed.boxcards[7]`: A 플레이스테이션 박스 $50 / B 플레이스테이션 박스 4.3 (230) $50
- `observed.mainLength`: A 484 / B 722

### B ko-390, 2번 분류: 셋째 알약

- `observed.boxcards[0]`: A 롤렉스 박스 $250 / B 롤렉스 박스 4.3 (136) $250
- `observed.boxcards[1]`: A 파텍필립 박스 $500 / B 파텍필립 박스 4.3 (113) $500
- `observed.boxcards[2]`: A 오데마 피게 박스 $500 / B 오데마 피게 박스 4.3 (101) $500
- `observed.boxcards[3]`: A 바쉐론 콘스탄틴 박스 $500 / B 바쉐론 콘스탄틴 박스 4.4 (93) $500
- `observed.boxcards[4]`: A 랑에 운트 죄네 박스 $500 / B 랑에 운트 죄네 박스 4.4 (141) $500
- `observed.boxcards[5]`: A 오메가 박스 $250 / B 오메가 박스 4.3 (147) $250
- `observed.boxcards[6]`: A 까르띠에 시계 박스 $250 / B 까르띠에 시계 박스 4.4 (165) $250
- `observed.boxcards[7]`: A IWC 박스 $250 / B IWC 박스 4.4 (200) $250
- `observed.mainLength`: A 402 / B 601

### B ko-390, 3번 분류: 아홉째 알약

- `observed.boxcards[0]`: A 플레이스테이션 박스 $50 / B 플레이스테이션 박스 4.3 (230) $50
- `observed.boxcards[1]`: A 엑스박스 박스 $50 / B 엑스박스 박스 4.4 (263) $50
- `observed.boxcards[2]`: A 닌텐도 박스 $50 / B 닌텐도 박스 4.4 (289) $50
- `observed.boxcards[3]`: A 밸브 박스 $50 / B 밸브 박스 4.3 (270) $50
- `observed.boxcards[4]`: A 에이수스 ROG 박스 $100 / B 에이수스 ROG 박스 4.3 (276) $100
- `observed.boxcards[5]`: A MSI 게이밍 박스 $100 / B MSI 게이밍 박스 4.3 (230) $100
- `observed.boxcards[6]`: A 레이저 게이밍 박스 $50 / B 레이저 게이밍 박스 4.4 (299) $50
- `observed.boxcards[7]`: A 로지텍 G 박스 $50 / B 로지텍 G 박스 4.5 (307) $50
- `observed.mainLength`: A 399 / B 599

### B ko-390, 4번 분류: 전체

- `observed.boxcards[0]`: A 롤스로이스 박스 $500 / B 롤스로이스 박스 4.3 (101) $500
- `observed.boxcards[1]`: A 롤렉스 박스 $250 / B 롤렉스 박스 4.3 (136) $250
- `observed.boxcards[2]`: A 에르메스 가방 박스 $500 / B 에르메스 가방 박스 4.3 (95) $500
- `observed.boxcards[3]`: A 까르띠에 주얼리 박스 $250 / B 까르띠에 주얼리 박스 4.2 (151) $250
- `observed.boxcards[4]`: A 나이키 패션 박스 $100 / B 나이키 패션 박스 4.4 (172) $100
- `observed.boxcards[5]`: A 애플 모바일 박스 $100 / B 애플 모바일 박스 4.5 (240) $100
- `observed.boxcards[6]`: A 애플 맥 박스 $250 / B 애플 맥 박스 4.4 (164) $250
- `observed.boxcards[7]`: A 플레이스테이션 박스 $50 / B 플레이스테이션 박스 4.3 (230) $50
- `observed.mainLength`: A 484 / B 722

### B ko-390, 8번 검색: 지우기

- `observed.boxcards[0]`: A 롤스로이스 박스 $500 / B 롤스로이스 박스 4.3 (101) $500
- `observed.boxcards[1]`: A 롤렉스 박스 $250 / B 롤렉스 박스 4.3 (136) $250
- `observed.boxcards[2]`: A 에르메스 가방 박스 $500 / B 에르메스 가방 박스 4.3 (95) $500
- `observed.boxcards[3]`: A 까르띠에 주얼리 박스 $250 / B 까르띠에 주얼리 박스 4.2 (151) $250
- `observed.boxcards[4]`: A 나이키 패션 박스 $100 / B 나이키 패션 박스 4.4 (172) $100
- `observed.boxcards[5]`: A 애플 모바일 박스 $100 / B 애플 모바일 박스 4.5 (240) $100
- `observed.boxcards[6]`: A 애플 맥 박스 $250 / B 애플 맥 박스 4.4 (164) $250
- `observed.boxcards[7]`: A 플레이스테이션 박스 $50 / B 플레이스테이션 박스 4.3 (230) $50
- `observed.mainLength`: A 484 / B 722

### B ko-390, 11번 검색 결과의 첫 행으로 박스 가기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (271건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3711 / B 4165

### B ko-390, 12번 수량 바꾸기: 5개

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (271건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3712 / B 4166

### B ko-390, 13번 수량 바꾸기: 100개

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (271건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3716 / B 4170

### C en-1440, 1번 시작

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4807 / B 5509

### C en-1440, 2번 수량 5개

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4808 / B 5510

### C en-1440, 3번 열기 단추 누르기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4808 / B 5510

### C en-1440, 4번 빈 이메일로 계속(입력 검증)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4808 / B 5510

### C en-1440, 5번 이메일 입력

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4808 / B 5510

### C en-1440, 6번 프리셋과 다른 비밀번호로 계속

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox 5 for $250 / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4758 / B 5460

### C en-1440, 7번 프리셋의 비밀번호로 로그인(앞 단계에서 이미 들어갔으면 아무것도 하지 않는다)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox 5 for $250 / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4758 / B 5460

### C en-1440, 8번 로그인 뒤 새로 고침(수량은 처음으로, 로그인은 그대로인지)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4755 / B 5457

### C ko-390, 1번 시작

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3144 / B 3606

### C ko-390, 2번 수량 5개

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3145 / B 3607

### C ko-390, 3번 열기 단추 누르기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3145 / B 3607

### C ko-390, 4번 빈 이메일로 계속(입력 검증)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3145 / B 3607

### C ko-390, 5번 이메일 입력

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3145 / B 3607

### C ko-390, 6번 프리셋과 다른 비밀번호로 계속

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 5개 언박싱 $250 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3113 / B 3575

### C ko-390, 7번 프리셋의 비밀번호로 로그인(앞 단계에서 이미 들어갔으면 아무것도 하지 않는다)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 5개 언박싱 $250 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3113 / B 3575

### C ko-390, 8번 로그인 뒤 새로 고침(수량은 처음으로, 로그인은 그대로인지)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3109 / B 3571

### D en-1440, 1번 시작

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4755 / B 5457

### D en-1440, 2번 열기 누르기(큰 금액 확인창)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.links.length`: A 3 / B 4
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Cancel / B 
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4836 / B 5538

### D en-1440, 3번 확인창 취소

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4755 / B 5457

### D en-1440, 4번 열기 확정과 결과

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.buttons[1].text`: A Take USDT ($7.59) / B Unbox for $50
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Verify result / B Keep in inventory
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4958 / B 5660

### D en-1440, 5번 개봉 설정 열기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.buttons[1].text`: A Take USDT ($7.59) / B Unbox for $50
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Verify result / B Keep in inventory
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5346 / B 6048

### D en-1440, 6번 짧게 보기 켜기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.buttons[1].text`: A Take USDT ($7.59) / B Unbox for $50
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Verify result / B Keep in inventory
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5345 / B 6047

### D en-1440, 7번 짧게 보기 끄기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.buttons[1].text`: A Take USDT ($7.59) / B Unbox for $50
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Verify result / B Keep in inventory
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5346 / B 6048

### D en-1440, 8번 자동 받기 켜기(확인창)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 3 / B 4
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.buttons[1].text`: A Take USDT ($7.59) / B Unbox for $50
- `observed.buttons[2].text`: A Turn on automatic take / B Take USDT ($7.59)
- `observed.links.length`: A 5 / B 6
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Verify result / B Keep in inventory
- `observed.links[4]`: A Cancel / B Verify result
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5355 / B 6057

### D en-1440, 9번 자동 받기 취소

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.buttons[1].text`: A Take USDT ($7.59) / B Unbox for $50
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Verify result / B Keep in inventory
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5346 / B 6048

### D en-1440, 10번 설정 닫기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.buttons[1].text`: A Take USDT ($7.59) / B Unbox for $50
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Verify result / B Keep in inventory
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4958 / B 5660

### D en-1440, 11번 USDT로 받기(확인창)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 3 / B 4
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.buttons[1].text`: A Take USDT ($7.59) / B Unbox for $50
- `observed.links.length`: A 5 / B 6
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Verify result / B Keep in inventory
- `observed.links[4]`: A Cancel / B Verify result
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5097 / B 5799

### D en-1440, 12번 받기 취소

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.buttons[1].text`: A Take USDT ($7.59) / B Unbox for $50
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Verify result / B Keep in inventory
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4958 / B 5660

### D en-1440, 13번 받기 확정

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.buttons[1].text`: A Unbox again for $50 / B Unbox for $50
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Verify result / B 
- `observed.links[3]`: A Back to the box / B Verify result
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4973 / B 5675

### D en-1440, 14번 결과 검증 시트

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.buttons[1].text`: A Unbox again for $50 / B Unbox for $50
- `observed.links.length`: A 6 / B 7
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Verify result / B 
- `observed.links[3]`: A Back to the box / B Verify result
- `observed.links[4]`: A How blockchain verification works / B Back to the box
- `observed.links[5]`: A Verify with your own values / B How blockchain verification works
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5788 / B 6490

### D en-1440, 15번 검증 시트 닫기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.buttons[1].text`: A Unbox again for $50 / B Unbox for $50
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Verify result / B 
- `observed.links[3]`: A Back to the box / B Verify result
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4973 / B 5675

### D en-1440, 16번 한 번 더 열기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.buttons[1].text`: A Take USDT ($47.49) / B Unbox for $50
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Verify result / B Keep in inventory
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4964 / B 5666

### D en-1440, 17번 보관함에 두고 닫기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4755 / B 5457

### D en-1440, 18번 새로 고침 뒤의 장부

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4755 / B 5457

### D en-1440, 19번 잔액 시트

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4755 / B 5457

### D ko-390, 1번 시작

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3109 / B 3571

### D ko-390, 2번 열기 누르기(큰 금액 확인창)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 3 / B 4
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 취소 / B 
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3145 / B 3607

### D ko-390, 3번 확인창 취소

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3109 / B 3571

### D ko-390, 4번 열기 확정과 결과

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A USDT로 받기 ($7.59) / B $50 언박싱
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 개봉 결과 검증 / B 보관함에 두기
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3233 / B 3695

### D ko-390, 5번 개봉 설정 열기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A USDT로 받기 ($7.59) / B $50 언박싱
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 개봉 결과 검증 / B 보관함에 두기
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3406 / B 3868

### D ko-390, 6번 짧게 보기 켜기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A USDT로 받기 ($7.59) / B $50 언박싱
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 개봉 결과 검증 / B 보관함에 두기
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3406 / B 3868

### D ko-390, 7번 짧게 보기 끄기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A USDT로 받기 ($7.59) / B $50 언박싱
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 개봉 결과 검증 / B 보관함에 두기
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3406 / B 3868

### D ko-390, 8번 자동 받기 켜기(확인창)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 3 / B 4
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A USDT로 받기 ($7.59) / B $50 언박싱
- `observed.buttons[2].text`: A 자동으로 받기 켜기 / B USDT로 받기 ($7.59)
- `observed.links.length`: A 5 / B 6
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 개봉 결과 검증 / B 보관함에 두기
- `observed.links[4]`: A 취소 / B 개봉 결과 검증
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3419 / B 3881

### D ko-390, 9번 자동 받기 취소

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A USDT로 받기 ($7.59) / B $50 언박싱
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 개봉 결과 검증 / B 보관함에 두기
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3406 / B 3868

### D ko-390, 10번 설정 닫기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A USDT로 받기 ($7.59) / B $50 언박싱
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 개봉 결과 검증 / B 보관함에 두기
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3233 / B 3695

### D ko-390, 11번 USDT로 받기(확인창)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 3 / B 4
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A USDT로 받기 ($7.59) / B $50 언박싱
- `observed.links.length`: A 5 / B 6
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 개봉 결과 검증 / B 보관함에 두기
- `observed.links[4]`: A 취소 / B 개봉 결과 검증
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3315 / B 3777

### D ko-390, 12번 받기 취소

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A USDT로 받기 ($7.59) / B $50 언박싱
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 개봉 결과 검증 / B 보관함에 두기
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3233 / B 3695

### D ko-390, 13번 받기 확정

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A 한 번 더 언박싱 $50 / B $50 언박싱
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 개봉 결과 검증 / B 
- `observed.links[3]`: A 박스로 돌아가기 / B 개봉 결과 검증
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3250 / B 3712

### D ko-390, 14번 결과 검증 시트

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A 한 번 더 언박싱 $50 / B $50 언박싱
- `observed.links.length`: A 6 / B 7
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 개봉 결과 검증 / B 
- `observed.links[3]`: A 박스로 돌아가기 / B 개봉 결과 검증
- `observed.links[4]`: A 블록체인 검증 방식 / B 박스로 돌아가기
- `observed.links[5]`: A 값을 직접 넣어 검증 / B 블록체인 검증 방식
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3667 / B 4129

### D ko-390, 15번 검증 시트 닫기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A 한 번 더 언박싱 $50 / B $50 언박싱
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 개봉 결과 검증 / B 
- `observed.links[3]`: A 박스로 돌아가기 / B 개봉 결과 검증
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3250 / B 3712

### D ko-390, 16번 한 번 더 열기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A USDT로 받기 ($47.49) / B $50 언박싱
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 개봉 결과 검증 / B 보관함에 두기
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3237 / B 3699

### D ko-390, 17번 보관함에 두고 닫기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3109 / B 3571

### D ko-390, 18번 새로 고침 뒤의 장부

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3109 / B 3571

### D ko-390, 19번 잔액 시트

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3109 / B 3571

### D2 en-1440, 1번 시작

- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for $1 / B More reviews (287 left)
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** Apple TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20 hours ago 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ Apple Gift Card $100 Item value $100 1 like
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** AirTag $30 2026.09.26 13:32 / B 수줍은하루 1 day ago 오 기프트카드 잘 받았어요. 좋은 하루 되세요. Apple Gift Card $500 Item value $500 1 like
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C Adapter $20 2026.09.14 14:32 / B 드라이브좋아21 1 day ago 선물로 보내줬어요 굿입니다 Apple Gift Card $10 Item value $10
- `observed.mainLength`: A 2237 / B 2540

### D2 en-1440, 2번 열기와 결과

- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $1 / B More reviews (287 left)
- `observed.buttons[1].text`: A Unbox again for $1 / B Unbox for $1
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** Apple TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20 hours ago 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ Apple Gift Card $100 Item value $100 1 like
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** AirTag $30 2026.09.26 13:32 / B 수줍은하루 1 day ago 오 기프트카드 잘 받았어요. 좋은 하루 되세요. Apple Gift Card $500 Item value $500 1 like
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C Adapter $20 2026.09.14 14:32 / B 드라이브좋아21 1 day ago 선물로 보내줬어요 굿입니다 Apple Gift Card $10 Item value $10
- `observed.mainLength`: A 2408 / B 2711

### D2 en-1440, 3번 한 번 더 열기

- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $1 / B More reviews (287 left)
- `observed.buttons[1].text`: A Unbox again for $1 / B Unbox for $1
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** Apple TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20 hours ago 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ Apple Gift Card $100 Item value $100 1 like
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** AirTag $30 2026.09.26 13:32 / B 수줍은하루 1 day ago 오 기프트카드 잘 받았어요. 좋은 하루 되세요. Apple Gift Card $500 Item value $500 1 like
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C Adapter $20 2026.09.14 14:32 / B 드라이브좋아21 1 day ago 선물로 보내줬어요 굿입니다 Apple Gift Card $10 Item value $10
- `observed.mainLength`: A 2407 / B 2710

### D2 en-1440, 4번 닫기

- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for $1 / B More reviews (287 left)
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** Apple TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20 hours ago 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ Apple Gift Card $100 Item value $100 1 like
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** AirTag $30 2026.09.26 13:32 / B 수줍은하루 1 day ago 오 기프트카드 잘 받았어요. 좋은 하루 되세요. Apple Gift Card $500 Item value $500 1 like
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C Adapter $20 2026.09.14 14:32 / B 드라이브좋아21 1 day ago 선물로 보내줬어요 굿입니다 Apple Gift Card $10 Item value $10
- `observed.mainLength`: A 2239 / B 2542

### D2 ko-390, 1번 시작

- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A $1 언박싱 / B 후기 더 보기 (287건 남음)
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** 애플 TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20시간 전 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ 애플 기프트카드 $100 상품가 $100 좋아요 1
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** 에어태그 1개 $30 2026.09.26 13:32 / B 수줍은하루 1일 전 오 기프트카드 잘 받았어요. 좋은 하루 되세요. 애플 기프트카드 $500 상품가 $500 좋아요 1
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C 어댑터 $20 2026.09.14 14:32 / B 드라이브좋아21 1일 전 선물로 보내줬어요 굿입니다 애플 기프트카드 $10 상품가 $10
- `observed.mainLength`: A 1612 / B 1757

### D2 ko-390, 2번 열기와 결과

- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $1 언박싱 / B 후기 더 보기 (287건 남음)
- `observed.buttons[1].text`: A 한 번 더 언박싱 $1 / B $1 언박싱
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** 애플 TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20시간 전 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ 애플 기프트카드 $100 상품가 $100 좋아요 1
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** 에어태그 1개 $30 2026.09.26 13:32 / B 수줍은하루 1일 전 오 기프트카드 잘 받았어요. 좋은 하루 되세요. 애플 기프트카드 $500 상품가 $500 좋아요 1
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C 어댑터 $20 2026.09.14 14:32 / B 드라이브좋아21 1일 전 선물로 보내줬어요 굿입니다 애플 기프트카드 $10 상품가 $10
- `observed.mainLength`: A 1728 / B 1873

### D2 ko-390, 3번 한 번 더 열기

- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $1 언박싱 / B 후기 더 보기 (287건 남음)
- `observed.buttons[1].text`: A 한 번 더 언박싱 $1 / B $1 언박싱
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** 애플 TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20시간 전 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ 애플 기프트카드 $100 상품가 $100 좋아요 1
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** 에어태그 1개 $30 2026.09.26 13:32 / B 수줍은하루 1일 전 오 기프트카드 잘 받았어요. 좋은 하루 되세요. 애플 기프트카드 $500 상품가 $500 좋아요 1
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C 어댑터 $20 2026.09.14 14:32 / B 드라이브좋아21 1일 전 선물로 보내줬어요 굿입니다 애플 기프트카드 $10 상품가 $10
- `observed.mainLength`: A 1727 / B 1872

### D2 ko-390, 4번 닫기

- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A $1 언박싱 / B 후기 더 보기 (287건 남음)
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** 애플 TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20시간 전 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ 애플 기프트카드 $100 상품가 $100 좋아요 1
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** 에어태그 1개 $30 2026.09.26 13:32 / B 수줍은하루 1일 전 오 기프트카드 잘 받았어요. 좋은 하루 되세요. 애플 기프트카드 $500 상품가 $500 좋아요 1
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C 어댑터 $20 2026.09.14 14:32 / B 드라이브좋아21 1일 전 선물로 보내줬어요 굿입니다 애플 기프트카드 $10 상품가 $10
- `observed.mainLength`: A 1614 / B 1759

### E en-1440, 1번 시작

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Add USDT / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4787 / B 5489

### E en-1440, 2번 USDT 충전하기 누르기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Add USDT / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4787 / B 5489

### E en-1440, 3번 네트워크 바꾸기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Add USDT / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4787 / B 5489

### E en-1440, 4번 충전 시트 닫기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Add USDT / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4787 / B 5489

### E en-1440, 5번 수량 100개

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Add USDT / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4790 / B 5492

### E ko-390, 1번 시작

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A USDT 충전하기 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3137 / B 3599

### E ko-390, 2번 USDT 충전하기 누르기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A USDT 충전하기 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3137 / B 3599

### E ko-390, 3번 네트워크 바꾸기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A USDT 충전하기 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3137 / B 3599

### E ko-390, 4번 충전 시트 닫기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A USDT 충전하기 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3137 / B 3599

### E ko-390, 5번 수량 100개

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A USDT 충전하기 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3140 / B 3602

### E2 en-1440, 1번 시작

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Take USDT / B More reviews (225 left)
- `observed.links.length`: A 3 / B 4
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A Add USDT / B Recent results
- `observed.links[2]`: A  / B Add USDT
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4864 / B 5566

### E2 en-1440, 2번 USDT로 받기 선택 시트

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Take USDT / B More reviews (225 left)
- `observed.buttons[1].text`: A Select items / B Take USDT
- `observed.buttons[1].disabled`: A true / B (없음)
- `observed.links.length`: A 3 / B 4
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A Add USDT / B Recent results
- `observed.links[2]`: A  / B Add USDT
- `observed.counts.images`: A 15 / B 16
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5054 / B 5756

### E2 en-1440, 3번 전체 선택

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Take USDT / B More reviews (225 left)
- `observed.buttons[1].text`: A Take USDT (2 items, $1,471.55) / B Take USDT
- `observed.links.length`: A 3 / B 4
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A Add USDT / B Recent results
- `observed.links[2]`: A  / B Add USDT
- `observed.counts.images`: A 15 / B 16
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5072 / B 5774

### E2 en-1440, 4번 받기 확인창

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Take USDT / B More reviews (225 left)
- `observed.buttons[1].text`: A Take USDT ($1,471.55) / B Take USDT
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A Add USDT / B Recent results
- `observed.links[2]`: A  / B Add USDT
- `observed.links[3]`: A Cancel / B 
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5011 / B 5713

### E2 en-1440, 5번 받기 확정

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.buttons[1].text`: A Close / B Unbox for $50
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4808 / B 5510

### E2 en-1440, 6번 돌아오기(열기는 사람이 누른다)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4755 / B 5457

### E2 ko-390, 1번 시작

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A USDT로 받기 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 3 / B 4
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A USDT 충전하기 / B 나온 상품
- `observed.links[2]`: A  / B USDT 충전하기
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3190 / B 3652

### E2 ko-390, 2번 USDT로 받기 선택 시트

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A USDT로 받기 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A 상품을 선택합니다 / B USDT로 받기
- `observed.buttons[1].disabled`: A true / B (없음)
- `observed.links.length`: A 3 / B 4
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A USDT 충전하기 / B 나온 상품
- `observed.links[2]`: A  / B USDT 충전하기
- `observed.counts.images`: A 15 / B 16
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3312 / B 3774

### E2 ko-390, 3번 전체 선택

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A USDT로 받기 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A USDT로 받기 (2개, $1,471.55) / B USDT로 받기
- `observed.links.length`: A 3 / B 4
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A USDT 충전하기 / B 나온 상품
- `observed.links[2]`: A  / B USDT 충전하기
- `observed.counts.images`: A 15 / B 16
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3327 / B 3789

### E2 ko-390, 4번 받기 확인창

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A USDT로 받기 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A USDT로 받기 ($1,471.55) / B USDT로 받기
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A USDT 충전하기 / B 나온 상품
- `observed.links[2]`: A  / B USDT 충전하기
- `observed.links[3]`: A 취소 / B 
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3280 / B 3742

### E2 ko-390, 5번 받기 확정

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.buttons[1].text`: A 닫기 / B $50 언박싱
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3142 / B 3604

### E2 ko-390, 6번 돌아오기(열기는 사람이 누른다)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3109 / B 3571

### F en-1440, 1번 시작

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox free / B More reviews (271 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5425 / B 6111

### F en-1440, 2번 수량 5개

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox 5 for $150 / B More reviews (271 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5431 / B 6117

### F en-1440, 3번 열기와 결과

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox 5 for $250 / B More reviews (271 left)
- `observed.buttons[1].text`: A Take USDT (5 items, $67.42) / B Unbox 5 for $250
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Unbox again for $250 / B Keep in inventory
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5901 / B 6587

### F en-1440, 4번 결과 행 하나 열기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 3 / B 4
- `observed.buttons[0].text`: A Unbox 5 for $250 / B More reviews (271 left)
- `observed.buttons[1].text`: A Take USDT (5 items, $67.42) / B Unbox 5 for $250
- `observed.buttons[2].text`: A Take USDT ($42.75) / B Take USDT (5 items, $67.42)
- `observed.links.length`: A 5 / B 6
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Unbox again for $250 / B Keep in inventory
- `observed.links[4]`: A Verify result / B Unbox again for $250
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 6001 / B 6687

### F en-1440, 5번 행 닫기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox 5 for $250 / B More reviews (271 left)
- `observed.buttons[1].text`: A Take USDT (5 items, $67.42) / B Unbox 5 for $250
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Unbox again for $250 / B Keep in inventory
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5901 / B 6587

### F en-1440, 6번 USDT로 받기 선택 시트(방금 나온 것)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 3 / B 4
- `observed.buttons[0].text`: A Unbox 5 for $250 / B More reviews (271 left)
- `observed.buttons[1].text`: A Take USDT (5 items, $67.42) / B Unbox 5 for $250
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Unbox again for $250 / B Keep in inventory
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 6360 / B 7046

### F en-1440, 7번 하나 빼기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 3 / B 4
- `observed.buttons[0].text`: A Unbox 5 for $250 / B More reviews (271 left)
- `observed.buttons[1].text`: A Take USDT (5 items, $67.42) / B Unbox 5 for $250
- `observed.buttons[2].text`: A Take USDT (4 items, $24.67) / B Take USDT (5 items, $67.42)
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Unbox again for $250 / B Keep in inventory
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 6360 / B 7046

### F en-1440, 8번 받기 확정

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 3 / B 4
- `observed.buttons[0].text`: A Unbox 5 for $250 / B More reviews (271 left)
- `observed.buttons[1].text`: A Take USDT (1 item, $42.75) / B Unbox 5 for $250
- `observed.buttons[2].text`: A Close / B Take USDT (1 item, $42.75)
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Unbox again for $250 / B Keep in inventory
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5988 / B 6674

### F en-1440, 9번 결과 화면으로 돌아오기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox 5 for $250 / B More reviews (271 left)
- `observed.buttons[1].text`: A Take USDT (1 item, $42.75) / B Unbox 5 for $250
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Keep in inventory / B 
- `observed.links[3]`: A Unbox again for $250 / B Keep in inventory
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5938 / B 6624

### F en-1440, 10번 결과 닫기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox 5 for $250 / B More reviews (271 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5391 / B 6077

### F en-1440, 11번 수량 10개 열기(확인창)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox 10 for $500 / B More reviews (271 left)
- `observed.links.length`: A 3 / B 4
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.links[2]`: A Cancel / B 
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5478 / B 6164

### F en-1440, 12번 확인창 취소

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox 10 for $500 / B More reviews (271 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5392 / B 6078

### F ko-390, 1번 시작

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 무료 언박싱 / B 후기 더 보기 (271건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3698 / B 4152

### F ko-390, 2번 수량 5개

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 5개 언박싱 $150 / B 후기 더 보기 (271건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3703 / B 4157

### F ko-390, 3번 열기와 결과

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A 5개 언박싱 $250 / B 후기 더 보기 (271건 남음)
- `observed.buttons[1].text`: A USDT로 받기 (5개, $67.42) / B 5개 언박싱 $250
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 한 번 더 언박싱 $250 / B 보관함에 두기
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4017 / B 4471

### F ko-390, 4번 결과 행 하나 열기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 3 / B 4
- `observed.buttons[0].text`: A 5개 언박싱 $250 / B 후기 더 보기 (271건 남음)
- `observed.buttons[1].text`: A USDT로 받기 (5개, $67.42) / B 5개 언박싱 $250
- `observed.buttons[2].text`: A USDT로 받기 ($42.75) / B USDT로 받기 (5개, $67.42)
- `observed.links.length`: A 5 / B 6
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 한 번 더 언박싱 $250 / B 보관함에 두기
- `observed.links[4]`: A 개봉 결과 검증 / B 한 번 더 언박싱 $250
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4094 / B 4548

### F ko-390, 5번 행 닫기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A 5개 언박싱 $250 / B 후기 더 보기 (271건 남음)
- `observed.buttons[1].text`: A USDT로 받기 (5개, $67.42) / B 5개 언박싱 $250
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 한 번 더 언박싱 $250 / B 보관함에 두기
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4017 / B 4471

### F ko-390, 6번 USDT로 받기 선택 시트(방금 나온 것)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 3 / B 4
- `observed.buttons[0].text`: A 5개 언박싱 $250 / B 후기 더 보기 (271건 남음)
- `observed.buttons[1].text`: A USDT로 받기 (5개, $67.42) / B 5개 언박싱 $250
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 한 번 더 언박싱 $250 / B 보관함에 두기
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4300 / B 4754

### F ko-390, 7번 하나 빼기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 3 / B 4
- `observed.buttons[0].text`: A 5개 언박싱 $250 / B 후기 더 보기 (271건 남음)
- `observed.buttons[1].text`: A USDT로 받기 (5개, $67.42) / B 5개 언박싱 $250
- `observed.buttons[2].text`: A USDT로 받기 (4개, $24.67) / B USDT로 받기 (5개, $67.42)
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 한 번 더 언박싱 $250 / B 보관함에 두기
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4300 / B 4754

### F ko-390, 8번 받기 확정

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 3 / B 4
- `observed.buttons[0].text`: A 5개 언박싱 $250 / B 후기 더 보기 (271건 남음)
- `observed.buttons[1].text`: A USDT로 받기 (1개, $42.75) / B 5개 언박싱 $250
- `observed.buttons[2].text`: A 닫기 / B USDT로 받기 (1개, $42.75)
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 한 번 더 언박싱 $250 / B 보관함에 두기
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4065 / B 4519

### F ko-390, 9번 결과 화면으로 돌아오기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A 5개 언박싱 $250 / B 후기 더 보기 (271건 남음)
- `observed.buttons[1].text`: A USDT로 받기 (1개, $42.75) / B 5개 언박싱 $250
- `observed.links.length`: A 4 / B 5
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 보관함에 두기 / B 
- `observed.links[3]`: A 한 번 더 언박싱 $250 / B 보관함에 두기
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4035 / B 4489

### F ko-390, 10번 결과 닫기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 5개 언박싱 $250 / B 후기 더 보기 (271건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3680 / B 4134

### F ko-390, 11번 수량 10개 열기(확인창)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A 10개 언박싱 $500 / B 후기 더 보기 (271건 남음)
- `observed.links.length`: A 3 / B 4
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.links[2]`: A 취소 / B 
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3723 / B 4177

### F ko-390, 12번 확인창 취소

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 10개 언박싱 $500 / B 후기 더 보기 (271건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3681 / B 4135

### F2 en-1440, 1번 시작

- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for $1 / B More reviews (287 left)
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** Apple TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20 hours ago 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ Apple Gift Card $100 Item value $100 1 like
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** AirTag $30 2026.09.26 13:32 / B 수줍은하루 1 day ago 오 기프트카드 잘 받았어요. 좋은 하루 되세요. Apple Gift Card $500 Item value $500 1 like
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C Adapter $20 2026.09.14 14:32 / B 드라이브좋아21 1 day ago 선물로 보내줬어요 굿입니다 Apple Gift Card $10 Item value $10
- `observed.mainLength`: A 2237 / B 2540

### F2 en-1440, 2번 수량 5개

- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox 5 for $5 / B More reviews (287 left)
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** Apple TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20 hours ago 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ Apple Gift Card $100 Item value $100 1 like
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** AirTag $30 2026.09.26 13:32 / B 수줍은하루 1 day ago 오 기프트카드 잘 받았어요. 좋은 하루 되세요. Apple Gift Card $500 Item value $500 1 like
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C Adapter $20 2026.09.14 14:32 / B 드라이브좋아21 1 day ago 선물로 보내줬어요 굿입니다 Apple Gift Card $10 Item value $10
- `observed.mainLength`: A 2239 / B 2542

### F2 en-1440, 3번 열기와 결과

- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox 5 for $5 / B More reviews (287 left)
- `observed.buttons[1].text`: A Unbox again for $5 / B Unbox 5 for $5
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** Apple TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20 hours ago 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ Apple Gift Card $100 Item value $100 1 like
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** AirTag $30 2026.09.26 13:32 / B 수줍은하루 1 day ago 오 기프트카드 잘 받았어요. 좋은 하루 되세요. Apple Gift Card $500 Item value $500 1 like
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C Adapter $20 2026.09.14 14:32 / B 드라이브좋아21 1 day ago 선물로 보내줬어요 굿입니다 Apple Gift Card $10 Item value $10
- `observed.mainLength`: A 2503 / B 2806

### F2 en-1440, 4번 결과 닫기

- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox 5 for $5 / B More reviews (287 left)
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** Apple TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20 hours ago 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ Apple Gift Card $100 Item value $100 1 like
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** AirTag $30 2026.09.26 13:32 / B 수줍은하루 1 day ago 오 기프트카드 잘 받았어요. 좋은 하루 되세요. Apple Gift Card $500 Item value $500 1 like
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C Adapter $20 2026.09.14 14:32 / B 드라이브좋아21 1 day ago 선물로 보내줬어요 굿입니다 Apple Gift Card $10 Item value $10
- `observed.mainLength`: A 2241 / B 2544

### F2 ko-390, 1번 시작

- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A $1 언박싱 / B 후기 더 보기 (287건 남음)
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** 애플 TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20시간 전 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ 애플 기프트카드 $100 상품가 $100 좋아요 1
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** 에어태그 1개 $30 2026.09.26 13:32 / B 수줍은하루 1일 전 오 기프트카드 잘 받았어요. 좋은 하루 되세요. 애플 기프트카드 $500 상품가 $500 좋아요 1
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C 어댑터 $20 2026.09.14 14:32 / B 드라이브좋아21 1일 전 선물로 보내줬어요 굿입니다 애플 기프트카드 $10 상품가 $10
- `observed.mainLength`: A 1612 / B 1757

### F2 ko-390, 2번 수량 5개

- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 5개 언박싱 $5 / B 후기 더 보기 (287건 남음)
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** 애플 TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20시간 전 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ 애플 기프트카드 $100 상품가 $100 좋아요 1
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** 에어태그 1개 $30 2026.09.26 13:32 / B 수줍은하루 1일 전 오 기프트카드 잘 받았어요. 좋은 하루 되세요. 애플 기프트카드 $500 상품가 $500 좋아요 1
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C 어댑터 $20 2026.09.14 14:32 / B 드라이브좋아21 1일 전 선물로 보내줬어요 굿입니다 애플 기프트카드 $10 상품가 $10
- `observed.mainLength`: A 1615 / B 1760

### F2 ko-390, 3번 열기와 결과

- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A 5개 언박싱 $5 / B 후기 더 보기 (287건 남음)
- `observed.buttons[1].text`: A 한 번 더 언박싱 $5 / B 5개 언박싱 $5
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** 애플 TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20시간 전 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ 애플 기프트카드 $100 상품가 $100 좋아요 1
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** 에어태그 1개 $30 2026.09.26 13:32 / B 수줍은하루 1일 전 오 기프트카드 잘 받았어요. 좋은 하루 되세요. 애플 기프트카드 $500 상품가 $500 좋아요 1
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C 어댑터 $20 2026.09.14 14:32 / B 드라이브좋아21 1일 전 선물로 보내줬어요 굿입니다 애플 기프트카드 $10 상품가 $10
- `observed.mainLength`: A 1783 / B 1928

### F2 ko-390, 4번 결과 닫기

- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 5개 언박싱 $5 / B 후기 더 보기 (287건 남음)
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** 애플 TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20시간 전 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ 애플 기프트카드 $100 상품가 $100 좋아요 1
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** 에어태그 1개 $30 2026.09.26 13:32 / B 수줍은하루 1일 전 오 기프트카드 잘 받았어요. 좋은 하루 되세요. 애플 기프트카드 $500 상품가 $500 좋아요 1
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C 어댑터 $20 2026.09.14 14:32 / B 드라이브좋아21 1일 전 선물로 보내줬어요 굿입니다 애플 기프트카드 $10 상품가 $10
- `observed.mainLength`: A 1617 / B 1762

### I en-1440, 1번 시작

- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for $1 / B More reviews (287 left)
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** Apple TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20 hours ago 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ Apple Gift Card $100 Item value $100 1 like
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** AirTag $30 2026.09.26 13:32 / B 수줍은하루 1 day ago 오 기프트카드 잘 받았어요. 좋은 하루 되세요. Apple Gift Card $500 Item value $500 1 like
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C Adapter $20 2026.09.14 14:32 / B 드라이브좋아21 1 day ago 선물로 보내줬어요 굿입니다 Apple Gift Card $10 Item value $10
- `observed.mainLength`: A 2237 / B 2540

### I en-1440, 2번 열기와 결과

- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $1 / B More reviews (287 left)
- `observed.buttons[1].text`: A Unbox again for $1 / B Unbox for $1
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** Apple TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20 hours ago 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ Apple Gift Card $100 Item value $100 1 like
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** AirTag $30 2026.09.26 13:32 / B 수줍은하루 1 day ago 오 기프트카드 잘 받았어요. 좋은 하루 되세요. Apple Gift Card $500 Item value $500 1 like
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C Adapter $20 2026.09.14 14:32 / B 드라이브좋아21 1 day ago 선물로 보내줬어요 굿입니다 Apple Gift Card $10 Item value $10
- `observed.mainLength`: A 2408 / B 2711

### I en-1440, 3번 결과 화면의 검증 시트

- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $1 / B More reviews (287 left)
- `observed.buttons[1].text`: A Unbox again for $1 / B Unbox for $1
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** Apple TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20 hours ago 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ Apple Gift Card $100 Item value $100 1 like
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** AirTag $30 2026.09.26 13:32 / B 수줍은하루 1 day ago 오 기프트카드 잘 받았어요. 좋은 하루 되세요. Apple Gift Card $500 Item value $500 1 like
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C Adapter $20 2026.09.14 14:32 / B 드라이브좋아21 1 day ago 선물로 보내줬어요 굿입니다 Apple Gift Card $10 Item value $10
- `observed.mainLength`: A 3195 / B 3498

### I en-1440, 4번 계산 방법 펴기

- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A Unbox for $1 / B More reviews (287 left)
- `observed.buttons[1].text`: A Unbox again for $1 / B Unbox for $1
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** Apple TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20 hours ago 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ Apple Gift Card $100 Item value $100 1 like
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** AirTag $30 2026.09.26 13:32 / B 수줍은하루 1 day ago 오 기프트카드 잘 받았어요. 좋은 하루 되세요. Apple Gift Card $500 Item value $500 1 like
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C Adapter $20 2026.09.14 14:32 / B 드라이브좋아21 1 day ago 선물로 보내줬어요 굿입니다 Apple Gift Card $10 Item value $10
- `observed.mainLength`: A 3760 / B 4063

### I ko-390, 1번 시작

- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A $1 언박싱 / B 후기 더 보기 (287건 남음)
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** 애플 TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20시간 전 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ 애플 기프트카드 $100 상품가 $100 좋아요 1
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** 에어태그 1개 $30 2026.09.26 13:32 / B 수줍은하루 1일 전 오 기프트카드 잘 받았어요. 좋은 하루 되세요. 애플 기프트카드 $500 상품가 $500 좋아요 1
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C 어댑터 $20 2026.09.14 14:32 / B 드라이브좋아21 1일 전 선물로 보내줬어요 굿입니다 애플 기프트카드 $10 상품가 $10
- `observed.mainLength`: A 1612 / B 1757

### I ko-390, 2번 열기와 결과

- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $1 언박싱 / B 후기 더 보기 (287건 남음)
- `observed.buttons[1].text`: A 한 번 더 언박싱 $1 / B $1 언박싱
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** 애플 TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20시간 전 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ 애플 기프트카드 $100 상품가 $100 좋아요 1
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** 에어태그 1개 $30 2026.09.26 13:32 / B 수줍은하루 1일 전 오 기프트카드 잘 받았어요. 좋은 하루 되세요. 애플 기프트카드 $500 상품가 $500 좋아요 1
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C 어댑터 $20 2026.09.14 14:32 / B 드라이브좋아21 1일 전 선물로 보내줬어요 굿입니다 애플 기프트카드 $10 상품가 $10
- `observed.mainLength`: A 1728 / B 1873

### I ko-390, 3번 결과 화면의 검증 시트

- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $1 언박싱 / B 후기 더 보기 (287건 남음)
- `observed.buttons[1].text`: A 한 번 더 언박싱 $1 / B $1 언박싱
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** 애플 TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20시간 전 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ 애플 기프트카드 $100 상품가 $100 좋아요 1
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** 에어태그 1개 $30 2026.09.26 13:32 / B 수줍은하루 1일 전 오 기프트카드 잘 받았어요. 좋은 하루 되세요. 애플 기프트카드 $500 상품가 $500 좋아요 1
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C 어댑터 $20 2026.09.14 14:32 / B 드라이브좋아21 1일 전 선물로 보내줬어요 굿입니다 애플 기프트카드 $10 상품가 $10
- `observed.mainLength`: A 2131 / B 2276

### I ko-390, 4번 계산 방법 펴기

- `observed.buttons.length`: A 2 / B 3
- `observed.buttons[0].text`: A $1 언박싱 / B 후기 더 보기 (287건 남음)
- `observed.buttons[1].text`: A 한 번 더 언박싱 $1 / B $1 언박싱
- `observed.counts.rvcards`: A 3 / B 0
- `observed.counts.images`: A 42 / B 41
- `observed.rvcards[0]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** 애플 TV 4K $150 2026.10.02 12:32 / B 든든한참새70 20시간 전 오오 기다릴 필요 없이 바로 받아서 좋아요 ㅋㅋㅋ 애플 기프트카드 $100 상품가 $100 좋아요 1
- `observed.rvcards[1]`: A 에어태그 하나지만 정품이고 포장도 멀쩡했어요. 시리얼 조회도 됩니다. su*** 에어태그 1개 $30 2026.09.26 13:32 / B 수줍은하루 1일 전 오 기프트카드 잘 받았어요. 좋은 하루 되세요. 애플 기프트카드 $500 상품가 $500 좋아요 1
- `observed.rvcards[2]`: A 어댑터는 문제없는데 배송이 열흘 걸렸습니다. 급한 분은 USDT로 받는 게 낫겠어요. jh*** 20W USB-C 어댑터 $20 2026.09.14 14:32 / B 드라이브좋아21 1일 전 선물로 보내줬어요 굿입니다 애플 기프트카드 $10 상품가 $10
- `observed.mainLength`: A 2368 / B 2513

### J en-1440, 1번 시작

- `observed.buttons.length`: A 0 / B 1
- `observed.chips.length`: A 1 / B 0
- `observed.counts.rvcards`: A 28 / B 0
- `observed.counts.images`: A 26 / B 5
- `observed.rvcards[0]`: A 두 번째에 나왔습니다. 배송 신청하고 나흘 만에 받았고 보증서도 같이 왔어요. ji*** Gold Bar 1g $130 2026.10.03 10:44 / B 阿福 18 min ago 虽然不是大奖但也不错哈哈哈 Braun All-in-One Style Kit Series 5 5471 Item value $49.99
- `observed.rvcards[1]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** Apple TV 4K $150 2026.10.02 12:32 / B 살빼는수집가 23 min ago 자잘한거 나왔지만 쓸때마다 기분 좋아요 ㅋㅋㅋ Leatherman MOLLE Sheath XL Item value $24.95
- `observed.rvcards[2]`: A 개봉 결과 검증으로 직접 확인해 봤는데 번호가 맞더라고요. 시계도 새것이었습니다. dk*** Garmin Fenix 8 $1,000 2026.09.30 14:43 / B 주말의아빠 59 min ago 잘 받았습니다 ㅎ JETech Clear Case for iPhone 16 Item value $7.99
- `observed.mainLength`: A 2834 / B 2190

### J en-1440, 2번 박스로 거르기 / (멈춤)

- `name`: A 박스로 거르기 / B (멈춤)

### J ko-390, 1번 시작

- `observed.buttons.length`: A 0 / B 1
- `observed.chips.length`: A 1 / B 0
- `observed.counts.rvcards`: A 28 / B 0
- `observed.counts.images`: A 26 / B 5
- `observed.rvcards[0]`: A 두 번째에 나왔습니다. 배송 신청하고 나흘 만에 받았고 보증서도 같이 왔어요. ji*** 순금 골드바 1g $130 2026.10.03 10:44 / B 阿福 18분 전 虽然不是大奖但也不错哈哈哈 브라운 올인원 스타일 키트 시리즈 5 5471 상품가 $49.99
- `observed.rvcards[1]`: A 1달러짜리에서 이게 나올 줄은 몰랐네요. 미개봉 새 제품이었습니다. min*** 애플 TV 4K $150 2026.10.02 12:32 / B 살빼는수집가 23분 전 자잘한거 나왔지만 쓸때마다 기분 좋아요 ㅋㅋㅋ 레더맨 MOLLE 시스 XL 상품가 $24.95
- `observed.rvcards[2]`: A 개봉 결과 검증으로 직접 확인해 봤는데 번호가 맞더라고요. 시계도 새것이었습니다. dk*** 가민 피닉스 8 $1,000 2026.09.30 14:43 / B 주말의아빠 59분 전 잘 받았습니다 ㅎ 제이텍 아이폰 16 투명 케이스 상품가 $7.99
- `observed.mainLength`: A 2405 / B 1513

### J ko-390, 2번 박스로 거르기 / (멈춤)

- `name`: A 박스로 거르기 / B (멈춤)

### K en-1440, 1번 시작

- `observed.boxcards[0]`: A Rolls-Royce Box $500 / B Rolls-Royce Box 4.3 (101) $500
- `observed.boxcards[1]`: A Rolex Box $250 / B Rolex Box 4.3 (136) $250
- `observed.boxcards[2]`: A Hermès Bag Box $500 / B Hermès Bag Box 4.3 (95) $500
- `observed.boxcards[3]`: A Cartier Jewelry Box $250 / B Cartier Jewelry Box 4.2 (151) $250
- `observed.boxcards[4]`: A Nike Fashion Box $100 / B Nike Fashion Box 4.4 (172) $100
- `observed.boxcards[5]`: A Apple Mobile Box $100 / B Apple Mobile Box 4.5 (240) $100
- `observed.boxcards[6]`: A Apple Mac Box $250 / B Apple Mac Box 4.4 (164) $250
- `observed.boxcards[7]`: A PlayStation Box $50 / B PlayStation Box 4.3 (230) $50
- `observed.mainLength`: A 758 / B 996

### K en-1440, 2번 통화 바꾸기

- `observed.boxcards[0]`: A Rolls-Royce Box ₩690,000 / B Rolls-Royce Box 4.3 (101) ₩690,000
- `observed.boxcards[1]`: A Rolex Box ₩340,000 / B Rolex Box 4.3 (136) ₩340,000
- `observed.boxcards[2]`: A Hermès Bag Box ₩690,000 / B Hermès Bag Box 4.3 (95) ₩690,000
- `observed.boxcards[3]`: A Cartier Jewelry Box ₩340,000 / B Cartier Jewelry Box 4.2 (151) ₩340,000
- `observed.boxcards[4]`: A Nike Fashion Box ₩130,000 / B Nike Fashion Box 4.4 (172) ₩130,000
- `observed.boxcards[5]`: A Apple Mobile Box ₩130,000 / B Apple Mobile Box 4.5 (240) ₩130,000
- `observed.boxcards[6]`: A Apple Mac Box ₩340,000 / B Apple Mac Box 4.4 (164) ₩340,000
- `observed.boxcards[7]`: A PlayStation Box ₩60,000 / B PlayStation Box 4.3 (230) ₩60,000
- `observed.mainLength`: A 854 / B 1092

### K en-1440, 3번 박스로 이동

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for ₩340,000 / B More reviews (131 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 101 / B 106
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5169 / B 5936

### K en-1440, 4번 새로 고침

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for ₩340,000 / B More reviews (131 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 101 / B 106
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5169 / B 5936

### K en-1440, 5번 언어 바꾸기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A ₩340,000 언박싱 / B 후기 더 보기 (131건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 101 / B 106
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3916 / B 4461

### K en-1440, 6번 새로 고침(언어 유지)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A ₩340,000 언박싱 / B 후기 더 보기 (131건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 101 / B 106
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3916 / B 4461

### K en-1440, 8번 브라우저 뒤로

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A ₩340,000 언박싱 / B 후기 더 보기 (131건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 101 / B 106
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3916 / B 4461

### K en-1440, 9번 루트 주소로 들어가기(저장된 언어로 이동)

- `observed.boxcards[0]`: A Rolls-Royce Box ₩690,000 / B Rolls-Royce Box 4.3 (101) ₩690,000
- `observed.boxcards[1]`: A Rolex Box ₩340,000 / B Rolex Box 4.3 (136) ₩340,000
- `observed.boxcards[2]`: A Hermès Bag Box ₩690,000 / B Hermès Bag Box 4.3 (95) ₩690,000
- `observed.boxcards[3]`: A Cartier Jewelry Box ₩340,000 / B Cartier Jewelry Box 4.2 (151) ₩340,000
- `observed.boxcards[4]`: A Nike Fashion Box ₩130,000 / B Nike Fashion Box 4.4 (172) ₩130,000
- `observed.boxcards[5]`: A Apple Mobile Box ₩130,000 / B Apple Mobile Box 4.5 (240) ₩130,000
- `observed.boxcards[6]`: A Apple Mac Box ₩340,000 / B Apple Mac Box 4.4 (164) ₩340,000
- `observed.boxcards[7]`: A PlayStation Box ₩60,000 / B PlayStation Box 4.3 (230) ₩60,000
- `observed.mainLength`: A 854 / B 1092

### K en-1440, 10번 통화 되돌리기

- `observed.boxcards[0]`: A Rolls-Royce Box $500 / B Rolls-Royce Box 4.3 (101) $500
- `observed.boxcards[1]`: A Rolex Box $250 / B Rolex Box 4.3 (136) $250
- `observed.boxcards[2]`: A Hermès Bag Box $500 / B Hermès Bag Box 4.3 (95) $500
- `observed.boxcards[3]`: A Cartier Jewelry Box $250 / B Cartier Jewelry Box 4.2 (151) $250
- `observed.boxcards[4]`: A Nike Fashion Box $100 / B Nike Fashion Box 4.4 (172) $100
- `observed.boxcards[5]`: A Apple Mobile Box $100 / B Apple Mobile Box 4.5 (240) $100
- `observed.boxcards[6]`: A Apple Mac Box $250 / B Apple Mac Box 4.4 (164) $250
- `observed.boxcards[7]`: A PlayStation Box $50 / B PlayStation Box 4.3 (230) $50
- `observed.mainLength`: A 758 / B 996

### K en-1440, 11번 중국어로 바꾸기

- `observed.boxcards[0]`: A 劳斯莱斯盒 $500 / B 劳斯莱斯盒 4.3 (101) $500
- `observed.boxcards[1]`: A 劳力士盒 $250 / B 劳力士盒 4.3 (136) $250
- `observed.boxcards[2]`: A 爱马仕手袋盒 $500 / B 爱马仕手袋盒 4.3 (95) $500
- `observed.boxcards[3]`: A 卡地亚珠宝盒 $250 / B 卡地亚珠宝盒 4.2 (151) $250
- `observed.boxcards[4]`: A 耐克时尚盒 $100 / B 耐克时尚盒 4.4 (172) $100
- `observed.boxcards[5]`: A 苹果移动设备盒 $100 / B 苹果移动设备盒 4.5 (240) $100
- `observed.boxcards[6]`: A 苹果 Mac 盒 $250 / B 苹果 Mac 盒 4.4 (164) $250
- `observed.boxcards[7]`: A PlayStation 盒 $50 / B PlayStation 盒 4.3 (230) $50
- `observed.mainLength`: A 405 / B 643

### K ko-390, 1번 시작

- `observed.boxcards[0]`: A 롤스로이스 박스 $500 / B 롤스로이스 박스 4.3 (101) $500
- `observed.boxcards[1]`: A 롤렉스 박스 $250 / B 롤렉스 박스 4.3 (136) $250
- `observed.boxcards[2]`: A 에르메스 가방 박스 $500 / B 에르메스 가방 박스 4.3 (95) $500
- `observed.boxcards[3]`: A 까르띠에 주얼리 박스 $250 / B 까르띠에 주얼리 박스 4.2 (151) $250
- `observed.boxcards[4]`: A 나이키 패션 박스 $100 / B 나이키 패션 박스 4.4 (172) $100
- `observed.boxcards[5]`: A 애플 모바일 박스 $100 / B 애플 모바일 박스 4.5 (240) $100
- `observed.boxcards[6]`: A 애플 맥 박스 $250 / B 애플 맥 박스 4.4 (164) $250
- `observed.boxcards[7]`: A 플레이스테이션 박스 $50 / B 플레이스테이션 박스 4.3 (230) $50
- `observed.mainLength`: A 486 / B 724

### K ko-390, 2번 통화 바꾸기

- `observed.boxcards[0]`: A 롤스로이스 박스 ₩690,000 / B 롤스로이스 박스 4.3 (101) ₩690,000
- `observed.boxcards[1]`: A 롤렉스 박스 ₩340,000 / B 롤렉스 박스 4.3 (136) ₩340,000
- `observed.boxcards[2]`: A 에르메스 가방 박스 ₩690,000 / B 에르메스 가방 박스 4.3 (95) ₩690,000
- `observed.boxcards[3]`: A 까르띠에 주얼리 박스 ₩340,000 / B 까르띠에 주얼리 박스 4.2 (151) ₩340,000
- `observed.boxcards[4]`: A 나이키 패션 박스 ₩130,000 / B 나이키 패션 박스 4.4 (172) ₩130,000
- `observed.boxcards[5]`: A 애플 모바일 박스 ₩130,000 / B 애플 모바일 박스 4.5 (240) ₩130,000
- `observed.boxcards[6]`: A 애플 맥 박스 ₩340,000 / B 애플 맥 박스 4.4 (164) ₩340,000
- `observed.boxcards[7]`: A 플레이스테이션 박스 ₩60,000 / B 플레이스테이션 박스 4.3 (230) ₩60,000
- `observed.mainLength`: A 582 / B 820

### K ko-390, 3번 박스로 이동

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A ₩340,000 언박싱 / B 후기 더 보기 (131건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 101 / B 106
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3916 / B 4461

### K ko-390, 4번 새로 고침

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A ₩340,000 언박싱 / B 후기 더 보기 (131건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 101 / B 106
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3916 / B 4461

### K ko-390, 5번 언어 바꾸기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for ₩340,000 / B More reviews (131 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 101 / B 106
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5169 / B 5936

### K ko-390, 6번 새로 고침(언어 유지)

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for ₩340,000 / B More reviews (131 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 101 / B 106
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5169 / B 5936

### K ko-390, 8번 브라우저 뒤로

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for ₩340,000 / B More reviews (131 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 101 / B 106
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 5169 / B 5936

### K ko-390, 9번 루트 주소로 들어가기(저장된 언어로 이동)

- `observed.boxcards[0]`: A 롤스로이스 박스 ₩690,000 / B 롤스로이스 박스 4.3 (101) ₩690,000
- `observed.boxcards[1]`: A 롤렉스 박스 ₩340,000 / B 롤렉스 박스 4.3 (136) ₩340,000
- `observed.boxcards[2]`: A 에르메스 가방 박스 ₩690,000 / B 에르메스 가방 박스 4.3 (95) ₩690,000
- `observed.boxcards[3]`: A 까르띠에 주얼리 박스 ₩340,000 / B 까르띠에 주얼리 박스 4.2 (151) ₩340,000
- `observed.boxcards[4]`: A 나이키 패션 박스 ₩130,000 / B 나이키 패션 박스 4.4 (172) ₩130,000
- `observed.boxcards[5]`: A 애플 모바일 박스 ₩130,000 / B 애플 모바일 박스 4.5 (240) ₩130,000
- `observed.boxcards[6]`: A 애플 맥 박스 ₩340,000 / B 애플 맥 박스 4.4 (164) ₩340,000
- `observed.boxcards[7]`: A 플레이스테이션 박스 ₩60,000 / B 플레이스테이션 박스 4.3 (230) ₩60,000
- `observed.mainLength`: A 582 / B 820

### K ko-390, 10번 통화 되돌리기

- `observed.boxcards[0]`: A 롤스로이스 박스 $500 / B 롤스로이스 박스 4.3 (101) $500
- `observed.boxcards[1]`: A 롤렉스 박스 $250 / B 롤렉스 박스 4.3 (136) $250
- `observed.boxcards[2]`: A 에르메스 가방 박스 $500 / B 에르메스 가방 박스 4.3 (95) $500
- `observed.boxcards[3]`: A 까르띠에 주얼리 박스 $250 / B 까르띠에 주얼리 박스 4.2 (151) $250
- `observed.boxcards[4]`: A 나이키 패션 박스 $100 / B 나이키 패션 박스 4.4 (172) $100
- `observed.boxcards[5]`: A 애플 모바일 박스 $100 / B 애플 모바일 박스 4.5 (240) $100
- `observed.boxcards[6]`: A 애플 맥 박스 $250 / B 애플 맥 박스 4.4 (164) $250
- `observed.boxcards[7]`: A 플레이스테이션 박스 $50 / B 플레이스테이션 박스 4.3 (230) $50
- `observed.mainLength`: A 486 / B 724

### K ko-390, 11번 중국어로 바꾸기

- `observed.boxcards[0]`: A 劳斯莱斯盒 $500 / B 劳斯莱斯盒 4.3 (101) $500
- `observed.boxcards[1]`: A 劳力士盒 $250 / B 劳力士盒 4.3 (136) $250
- `observed.boxcards[2]`: A 爱马仕手袋盒 $500 / B 爱马仕手袋盒 4.3 (95) $500
- `observed.boxcards[3]`: A 卡地亚珠宝盒 $250 / B 卡地亚珠宝盒 4.2 (151) $250
- `observed.boxcards[4]`: A 耐克时尚盒 $100 / B 耐克时尚盒 4.4 (172) $100
- `observed.boxcards[5]`: A 苹果移动设备盒 $100 / B 苹果移动设备盒 4.5 (240) $100
- `observed.boxcards[6]`: A 苹果 Mac 盒 $250 / B 苹果 Mac 盒 4.4 (164) $250
- `observed.boxcards[7]`: A PlayStation 盒 $50 / B PlayStation 盒 4.3 (230) $50
- `observed.mainLength`: A 405 / B 643

### L en-1440, 1번 시작

- `observed.boxcards[0]`: A Rolls-Royce Box $500 / B Rolls-Royce Box 4.3 (101) $500
- `observed.boxcards[1]`: A Rolex Box $250 / B Rolex Box 4.3 (136) $250
- `observed.boxcards[2]`: A Hermès Bag Box $500 / B Hermès Bag Box 4.3 (95) $500
- `observed.boxcards[3]`: A Cartier Jewelry Box $250 / B Cartier Jewelry Box 4.2 (151) $250
- `observed.boxcards[4]`: A Nike Fashion Box $100 / B Nike Fashion Box 4.4 (172) $100
- `observed.boxcards[5]`: A Apple Mobile Box $100 / B Apple Mobile Box 4.5 (240) $100
- `observed.boxcards[6]`: A Apple Mac Box $250 / B Apple Mac Box 4.4 (164) $250
- `observed.boxcards[7]`: A PlayStation Box $50 / B PlayStation Box 4.3 (230) $50
- `observed.mainLength`: A 758 / B 996

### L en-1440, 2번 연결 끊김

- `observed.boxcards[0]`: A Rolls-Royce Box $500 / B Rolls-Royce Box 4.3 (101) $500
- `observed.boxcards[1]`: A Rolex Box $250 / B Rolex Box 4.3 (136) $250
- `observed.boxcards[2]`: A Hermès Bag Box $500 / B Hermès Bag Box 4.3 (95) $500
- `observed.boxcards[3]`: A Cartier Jewelry Box $250 / B Cartier Jewelry Box 4.2 (151) $250
- `observed.boxcards[4]`: A Nike Fashion Box $100 / B Nike Fashion Box 4.4 (172) $100
- `observed.boxcards[5]`: A Apple Mobile Box $100 / B Apple Mobile Box 4.5 (240) $100
- `observed.boxcards[6]`: A Apple Mac Box $250 / B Apple Mac Box 4.4 (164) $250
- `observed.boxcards[7]`: A PlayStation Box $50 / B PlayStation Box 4.3 (230) $50
- `observed.mainLength`: A 758 / B 996

### L en-1440, 3번 끊긴 채로 박스 누르기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for $500 / B More reviews (96 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 100 / B 105
- `observed.counts.brokenImages`: A 14 / B 5
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4667 / B 5484
- `console.length`: A 18 / B 7

### L en-1440, 4번 다시 연결

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for $500 / B More reviews (96 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 100 / B 105
- `observed.counts.brokenImages`: A 14 / B 5
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4667 / B 5484

### L en-1440, 5번 그림 요청이 전부 실패할 때

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.counts.brokenImages`: A 5 / B 2
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4755 / B 5457
- `console.length`: A 5 / B 2

### L en-1440, 6번 그림 요청 되살리기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Unbox for $50 / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4755 / B 5457

### L en-1440, 7번 저장된 세션이 사라진 뒤 새로 고침

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A Log in to unbox / B More reviews (225 left)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A Recent results / B See all reviews
- `observed.links[1]`: A  / B Recent results
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 4807 / B 5509

### L en-1440, 13번 없는 주소의 단추 누르기

- `blocked[0]`: A GET / / B GET (기준 경로 밖) /en

### L ko-390, 1번 시작

- `observed.boxcards[0]`: A 롤스로이스 박스 $500 / B 롤스로이스 박스 4.3 (101) $500
- `observed.boxcards[1]`: A 롤렉스 박스 $250 / B 롤렉스 박스 4.3 (136) $250
- `observed.boxcards[2]`: A 에르메스 가방 박스 $500 / B 에르메스 가방 박스 4.3 (95) $500
- `observed.boxcards[3]`: A 까르띠에 주얼리 박스 $250 / B 까르띠에 주얼리 박스 4.2 (151) $250
- `observed.boxcards[4]`: A 나이키 패션 박스 $100 / B 나이키 패션 박스 4.4 (172) $100
- `observed.boxcards[5]`: A 애플 모바일 박스 $100 / B 애플 모바일 박스 4.5 (240) $100
- `observed.boxcards[6]`: A 애플 맥 박스 $250 / B 애플 맥 박스 4.4 (164) $250
- `observed.boxcards[7]`: A 플레이스테이션 박스 $50 / B 플레이스테이션 박스 4.3 (230) $50
- `observed.mainLength`: A 486 / B 724

### L ko-390, 2번 연결 끊김

- `observed.boxcards[0]`: A 롤스로이스 박스 $500 / B 롤스로이스 박스 4.3 (101) $500
- `observed.boxcards[1]`: A 롤렉스 박스 $250 / B 롤렉스 박스 4.3 (136) $250
- `observed.boxcards[2]`: A 에르메스 가방 박스 $500 / B 에르메스 가방 박스 4.3 (95) $500
- `observed.boxcards[3]`: A 까르띠에 주얼리 박스 $250 / B 까르띠에 주얼리 박스 4.2 (151) $250
- `observed.boxcards[4]`: A 나이키 패션 박스 $100 / B 나이키 패션 박스 4.4 (172) $100
- `observed.boxcards[5]`: A 애플 모바일 박스 $100 / B 애플 모바일 박스 4.5 (240) $100
- `observed.boxcards[6]`: A 애플 맥 박스 $250 / B 애플 맥 박스 4.4 (164) $250
- `observed.boxcards[7]`: A 플레이스테이션 박스 $50 / B 플레이스테이션 박스 4.3 (230) $50
- `observed.mainLength`: A 486 / B 724

### L ko-390, 3번 끊긴 채로 박스 누르기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A $500 언박싱 / B 후기 더 보기 (96건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 100 / B 105
- `observed.counts.brokenImages`: A 11 / B 5
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3187 / B 3740
- `console.length`: A 14 / B 6
- `console[0]`: A Failed to fetch RSC payload for /ko/wins/. Falling back to browser navigation. TypeError: Failed to fetch / B Failed to load resource: net::ERR_INTERNET_DISCONNECTED

### L ko-390, 4번 다시 연결

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A $500 언박싱 / B 후기 더 보기 (96건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 100 / B 105
- `observed.counts.brokenImages`: A 11 / B 5
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3187 / B 3740

### L ko-390, 5번 그림 요청이 전부 실패할 때

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.counts.brokenImages`: A 6 / B 2
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3109 / B 3571
- `console.length`: A 6 / B 2

### L ko-390, 6번 그림 요청 되살리기

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A $50 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3109 / B 3571

### L ko-390, 7번 저장된 세션이 사라진 뒤 새로 고침

- `observed.empty.length`: A 1 / B 0
- `observed.buttons.length`: A 1 / B 2
- `observed.buttons[0].text`: A 로그인하고 언박싱 / B 후기 더 보기 (225건 남음)
- `observed.links.length`: A 2 / B 3
- `observed.links[0]`: A 나온 상품 / B 후기 모두 보기
- `observed.links[1]`: A  / B 나온 상품
- `observed.counts.images`: A 13 / B 14
- `observed.rvcards.length`: A 0 / B 3
- `observed.mainLength`: A 3144 / B 3606

### L ko-390, 13번 없는 주소의 단추 누르기

- `blocked[0]`: A GET / / B GET (기준 경로 밖) /ko

## 오류와 한쪽만 실행한 단계

- J en-1440, 3번 전체로 돌아오기: 한쪽만 실행. A done / B 없음
- J en-1440, 4번 후기 하나 열기: 한쪽만 실행. A done / B 없음
- J en-1440, 5번 닫기: 한쪽만 실행. A done / B 없음
- J en-1440, 6번 박스 화면의 후기 절: 한쪽만 실행. A done / B 없음
- J en-1440, 7번 보관함의 상품에서 후기 쓰기 열기: 한쪽만 실행. A done / B 없음
- J en-1440, 8번 글 없이 올리기(입력 검증): 한쪽만 실행. A done / B 없음
- J en-1440, 9번 별점과 글 넣기: 한쪽만 실행. A done / B 없음
- J en-1440, 10번 올리기(브라우저 안에만 저장된다): 한쪽만 실행. A done / B 없음
- J en-1440, 11번 올린 뒤의 상품 상세: 한쪽만 실행. A done / B 없음
- J en-1440, 12번 사진 붙이기: 한쪽만 실행. A cannot-verify / B 없음
- J en-1440, 13번 후기의 서버 게시와 검수: 한쪽만 실행. A cannot-verify / B 없음
- J ko-390, 3번 전체로 돌아오기: 한쪽만 실행. A done / B 없음
- J ko-390, 4번 후기 하나 열기: 한쪽만 실행. A done / B 없음
- J ko-390, 5번 닫기: 한쪽만 실행. A done / B 없음
- J ko-390, 6번 박스 화면의 후기 절: 한쪽만 실행. A done / B 없음
- J ko-390, 7번 보관함의 상품에서 후기 쓰기 열기: 한쪽만 실행. A done / B 없음
- J ko-390, 8번 글 없이 올리기(입력 검증): 한쪽만 실행. A done / B 없음
- J ko-390, 9번 별점과 글 넣기: 한쪽만 실행. A done / B 없음
- J ko-390, 10번 올리기(브라우저 안에만 저장된다): 한쪽만 실행. A done / B 없음
- J ko-390, 11번 올린 뒤의 상품 상세: 한쪽만 실행. A done / B 없음
- J ko-390, 12번 사진 붙이기: 한쪽만 실행. A cannot-verify / B 없음
- J ko-390, 13번 후기의 서버 게시와 검수: 한쪽만 실행. A cannot-verify / B 없음

## 검증 불가(두 쪽 모두 실행하지 않음)

- B 정렬 바꾸기: 박스 목록 화면에 정렬을 바꾸는 조작 요소가 없다(components/box/BoxList.tsx). 누를 것이 없어 실행하지 않았다
- C 소셜 로그인(Google, Apple, Microsoft): 바깥 로그인 서비스로 나가는 요청이다. 실행하지 않는다
- C 가입과 이메일 인증: 인증 메일을 받는 서버가 없다. 가입 화면은 촬영(overlay/signup)으로만 본다
- E 입금 뒤 잔액 반영: 입금을 확인하는 서버가 없다. 실제 돈을 보내지 않는다
- H 배송 신청 내기: 배송 신청은 실제로 내지 않는다(작업 규칙). 입력이 검증된 상태까지만 본다
- H2 운송장 조회와 배송 완료: 운송장을 내주는 서버와 택배사 조회가 없다. 바깥 주소로 나가지 않는다
- H3 인증과 출금 신청: 출금 신청은 실제로 내지 않는다(작업 규칙). 인증 메일을 보내는 서버도 없다
- I 온체인 기록 대조: 결과를 체인에 올리는 서버가 없다. 화면에 그 상태가 어떻게 적히는지만 위 단계의 글로 남는다
- L 서버가 끝낸 세션(401): 계정 서버가 없다(브라우저 안의 계정). 서버가 세션을 끝내는 경우는 만들 수 없다
- L 화면을 그리다 난 오류(error.tsx): 사용자 조작으로 그 화면에 닿는 길을 찾지 못했다. 코드를 고치지 않고는 만들 수 없다
