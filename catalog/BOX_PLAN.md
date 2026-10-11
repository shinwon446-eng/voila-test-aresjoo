# 박스 카탈로그 확장 기획 (글만, 2026-10-12)

파운더가 정한 것과, 그것을 그대로 따랐을 때의 규모와 부딪치는 점, 그리고 Codex(gpt-6-astra)가 쓴 320개 박스 초안을 한 문서에 모았다.
아직 아무 코드도 상품 자료도 바꾸지 않았다. 이 문서는 기획이다.

## 1. 파운더가 정한 것

| 항목 | 결정 |
|---|---|
| 박스 수 | 300개 이상. 주제 하나에 박스 하나가 아니라 브랜드마다 박스 하나 |
| 가격 | 브랜드마다 한 가격(브랜드의 급에 맞춘다) |
| 낮은 구간 | 그 브랜드의 작은 실물과 같은 카테고리의 다른 브랜드 소품으로만. USDT 가 나오는 결과는 없앤다 |
| 비싼 상품 | 자동차와 명품 시계도 실물 지급 전제 |
| 박스 하나의 상품 수 | 200개 이상 (Codex 에 일을 맡긴 뒤에 나온 지시라 아래 5장의 Codex 초안에는 반영돼 있지 않다. 2장과 3장이 이 지시를 반영한 부분이다) |
| 여는 단추의 말 | "$1 언박싱", "5개 언박싱 $5" (이미 반영해 배포함) |

## 2. 규모: 지금과 목표

| | 지금 | 목표 |
|---|---:|---:|
| 박스 | 14 | 320 |
| 박스 하나의 상품 | 54에서 80 | 200 |
| 상품 칸(박스와 상품의 연결) | 916 | 64,000 |
| 서로 다른 상품 | 800 | 약 23,000 (아래 계산) |
| 사진 | 658개 상품, 파일 886개, 48MB | 약 23,000장, 약 1.2GB |
| 카탈로그 코드 | 124KB | 약 4MB |

서로 다른 상품 수의 어림: 박스마다 그 브랜드의 고유 상품을 평균 60개, 나머지 140개는 카테고리 공통 소품 묶음(카테고리마다 약 250개)에서 가져온다고 보면
320 x 60 + 16 x 250 = 23,200개다. 고유 상품을 박스마다 100개로 잡으면 36,000개가 된다.

지금의 70배 일이다. 한 번에 만들 수 있는 크기가 아니고, 다음 셋을 먼저 바꿔야 들어간다.

1. **상품 자료를 화면 코드에서 떼어 낸다.** 지금은 모든 상품이 앱 코드에 들어 있어 첫 화면이 전부 내려받는다. 64,000칸이면 박스마다 자료 파일을 따로 두고 그 박스를 열 때만 받아야 한다. 검색은 따로 만든 작은 색인으로 한다.
2. **사진을 저장소 밖에 둔다.** 1.2GB 는 GitHub Pages 의 사이트 크기 한도(1GB)를 넘고, 저장소가 OneDrive 안에 있어 지금도 메모리 문제가 있었다. 사진은 파일 저장 서비스에 두고 주소만 적는다.
3. **확률 계산을 새로 푼다.** 4장 참고.

## 3. 박스 하나에 200개를 채우는 방법

브랜드에 따라 실제로 서로 다른 상품이 200개가 안 되는 곳이 많다. 롤스로이스는 차종이 여덟 안팎이다. 그래서 200개는 세 겹으로 채운다.

| 겹 | 무엇 | 박스당 개수 | 예 (롤스로이스 박스) |
|---|---|---:|---|
| 1. 브랜드 본품 | 그 브랜드의 제품. 급, 연식, 사양이 다르면 다른 상품 | 20에서 120 | 팬텀, 고스트, 컬리넌, 스펙터와 그 블랙 배지, 시리즈 II |
| 2. 브랜드의 작은 실물 | 브랜드가 실제로 파는 소품과 굿즈 | 0에서 60 | 공식 부티크의 우산, 키링, 모형차 (실제로 파는 것만) |
| 3. 카테고리 공통 소품 | 같은 카테고리의 다른 브랜드 소품. 카테고리 안의 박스들이 나눠 쓴다 | 60에서 160 | 세차 용품, 차량용 충전기, 블랙박스, 타이어 공기 주입기 |

지킬 것:
- 색만 다른 것을 다른 상품으로 세어 개수를 채우지 않는다. 용량, 크기, 연식, 등급처럼 값이 달라지는 차이만 다른 상품이다.
- 없는 제품을 지어내지 않는다. 브랜드 굿즈는 그 브랜드가 실제로 파는 것만 넣는다. 확인이 안 되면 3겹으로 채운다.
- 같은 상품의 참고가는 모든 박스에서 같다. 박스 가격으로 나눈 배수에 따라 구간이 정해진다.
- 3겹이 많아질수록 "자동차 박스 스무 개가 사실은 같은 박스"가 된다. 박스마다 1겹과 2겹을 합쳐 적어도 60개는 되게 하고, 안 되는 브랜드는 박스로 만들지 않는 쪽을 권한다.

카테고리별 가능성(내 어림, 확인 전):

| 카테고리 | 브랜드 본품만으로 200개 | 비고 |
|---|---|---|
| 포켓몬 | 된다 | 카드는 종류가 수천이다. 세트 번호와 등급으로 나눈다 |
| 시계, 가방, 주얼리 | 대체로 된다 | 레퍼런스, 크기, 소재로 나눈다 |
| 모바일, 컴퓨터, 카메라, 오디오, 생활가전 | 큰 브랜드는 된다 | 용량과 구성으로 나눈다. 작은 브랜드는 3겹에 기댄다 |
| 자동차 | 안 된다 | 차종이 적다. 트림과 연식을 나눠도 30에서 80. 나머지는 2겹과 3겹 |
| 뷰티, 캠핑, 스포츠, 토이 | 브랜드에 따라 | |

## 4. USDT 결과를 없앨 때 부딪치는 것 (가장 먼저 정해야 한다)

지금 확률표는 열 번 가운데 일곱에서 여덟 번이 박스 가격의 0.05배나 0.25배 USDT 다. 이것을 실물로 바꾸면:

- **1달러 박스가 사라진다.** 1달러의 0.05배는 5센트인데 그런 실물은 없다. 가장 싼 실물을 1달러로 잡으면 박스 최저 가격은 20달러다(Codex 의 대안 1, 아래 5장 D). 지금 홈의 "1달러 애플 박스", "1달러 게이밍 박스"와 정면으로 부딪친다.
- **모든 결과에 배송이 붙는다.** 1달러짜리 소품 하나를 보내는 값이 소품보다 비싸다. 여러 개를 묶어 보내는 방식이 필요하고, 그 배송비를 누가 내는지에 따라 받는 값의 비율이 달라진다(20달러 박스에서 손님이 내면 약 96.6%).
- **"실물을 USDT 로 받기"를 남기면 사실상 USDT 결과다.** 지금은 받은 상품을 참고가의 95%로 바꿀 수 있다. 낮은 구간 소품도 그렇게 바꿀 수 있으면 USDT 가 나오는 것과 같고, 못 바꾸게 하면 소품이 보관함에 쌓인다. 둘 가운데 하나를 골라야 한다.
- **코드가 막고 있다.** 지금 계산은 박스 가격보다 싼 실물을 거부하고, 0.05배와 0.25배 USDT 를 스스로 만들고, 상품이 없는 구간을 USDT 로 채우고, 터짐 게이지도 USDT 로 준다. 상품 자료만 바꿔서는 안 되고 확률 설계를 다시 해야 한다.
- **99%의 뜻이 달라진다.** 전부 실물이면 참고가 기준 99%는 USDT 로 바꿨을 때 약 94%다. 지금과 같은 뜻의 99%를 지키려면 참고가 기준 약 104%가 필요하다.

## 5. 사진

지금 사진 886장은 위키미디어 공용(출처를 `web/public/assets/photography/ATTRIBUTION*.md` 에 적음)과 직접 생성한 그림이다.
23,000장은 같은 방법으로 안 된다.

- 브랜드와 쇼핑몰의 제품 사진은 그쪽 저작물이라 내려받아 올릴 수 없다. "찾아서 넣는" 방식은 여기서 막힌다.
- 공용 사진은 유명한 제품 일부에만 있다.
- 생성한 그림은 소품에는 쓸 만하지만, 특정 모델을 정확히 보여 줘야 하는 상품(시계 레퍼런스, 카드, 가방)에서는 틀린 모양이 나온다.
- 현실적인 길: 공급처나 제휴 판매처의 상품 자료(사진 사용 허락 포함)를 받는 것. 그 전에는 박스의 얼굴이 되는 상품(박스마다 4장, 약 1,300장)부터 확실한 사진으로 채우고 나머지는 사진 없는 행으로 둔다. 지금 화면이 이미 사진 없는 상품을 행으로 보여 준다.

## 6. 만드는 순서 (제안)

1. 4장의 결정을 받는다(최저 가격, USDT 로 받기, 배송 묶음).
2. 시험 묶음: 박스 셋을 200개까지 끝까지 만든다. 성격이 다른 셋을 고른다: 롤스로이스(본품이 적은 경우), 샤넬 가방(본품이 많은 경우), 리자몽(수집품). 여기서 박스 하나에 드는 시간, 확인 안 되는 상품의 비율, 사진을 구할 수 있는 비율을 잰다.
3. 상품 자료를 앱 코드에서 떼어 내고 사진을 저장소 밖으로 옮긴다.
4. 카테고리 하나(박스 20개, 4,000칸)를 통째로 만든다.
5. 나머지 열다섯 카테고리를 카테고리 단위로 넓힌다.

## 7. 파운더가 정할 것

1. USDT 결과를 없애면 박스 최저 가격이 20달러쯤이 된다. 1달러 박스를 없앨지, 1달러 박스만 지금 구조로 남길지.
2. 받은 실물을 USDT 로 바꾸는 기능(지금 95%)을 남길지. 남기면 낮은 구간 소품에도 적용할지.
3. 낮은 구간 소품의 배송: 묶어 보내기의 단위와 배송비를 누가 내는지.
4. 200개를 채울 때 3장의 세 겹 방식(본품, 브랜드 소품, 카테고리 공통 소품)으로 갈지. 본품과 브랜드 소품이 60개에 못 미치는 브랜드는 박스에서 뺄지.
5. 사진: 허락받은 사진만 쓸지, 생성한 그림을 어디까지 허용할지.
6. 시험 묶음 셋을 무엇으로 할지.

---

# 부록: Codex 초안 원문 (gpt-6-astra, 2026-10-12)

아래는 Codex 가 쓴 그대로다. 박스 하나에 24종에서 40종을 전제로 썼다(200개 지시 전). 박스 320개의 이름, 가격, 대표 상품과 낮은 구간 소품의 예는 그대로 쓸 수 있다.
가격 분포: 20달러 35개, 50달러 116개, 100달러 99개, 250달러 51개, 500달러 19개.

**16개 카테고리, 총 320개 박스**를 제안합니다. 같은 카테고리에서는 브랜드마다 박스 하나와 가격 하나를 둡니다. 삼성 모바일과 삼성 가전처럼 구매 목적이 다른 경우만 분리합니다. 포켓몬은 파운더가 제시한 캐릭터별 구성을 적용하고, 슈퍼카는 여러 브랜드를 묶는 예외로 둡니다.

아래 가격은 **박스 1회 개봉 가격 제안**입니다. 상품 가격이나 확률 확정값은 아닙니다. 제품명은 실재 출시 제품을 기준으로 골랐으며, 최신형만 모은 목록은 아닙니다. 현재 재고, 판매 국가별 사양, 공급 계약은 출시 전에 별도로 확정해야 합니다.

파일은 수정하지 않았습니다.

**A. 카테고리 나무**

| 1차 카테고리 | 하위 탐색과 한 줄 설명 | 박스 수 |
|---|---|---:|
| 자동차 | 럭셔리, 스포츠카, SUV, 전기차로 나누며 최고 상품은 실제 차량입니다. | 20 |
| 시계 | 하이엔드, 스위스 기계식, 일본 시계로 나눕니다. | 20 |
| 여성 가방 | 브랜드별 대표 가방과 소형 가죽 제품을 중심으로 구성합니다. | 20 |
| 주얼리 | 팔찌, 목걸이, 반지, 귀걸이를 브랜드별로 묶습니다. | 20 |
| 패션과 신발 | 스니커즈, 러닝화, 부츠, 아우터를 탐색합니다. | 20 |
| 모바일과 태블릿 | 휴대폰, 태블릿, 충전 기기를 브랜드별로 고릅니다. | 20 |
| 컴퓨터와 데스크 | 노트북, 모니터, 부품, 키보드와 업무용 주변기기를 다룹니다. | 20 |
| 게임과 게이밍 장비 | 콘솔, 휴대용 게임기, 입력 장치, 레이싱과 방송 장비를 다룹니다. | 20 |
| 오디오 | 헤드폰, 이어폰, 스피커, 턴테이블과 하이파이를 다룹니다. | 20 |
| 카메라와 촬영 | 카메라, 렌즈, 드론, 액션캠과 조명으로 나눕니다. | 20 |
| 생활가전 | 가전 풀팩, 청소, 커피, 주방과 개인 관리 가전을 다룹니다. | 20 |
| 포켓몬 | 리자몽, 피카츄 등 캐릭터별 영문판 실물 카드 박스입니다. | 20 |
| 토이와 컬렉터블 | 블록, 모형, 피규어, 인형과 아트토이를 브랜드별로 묶습니다. | 20 |
| 아웃도어와 캠핑 | 텐트, 의자, 침구, 배낭, 조리와 야외 장비를 다룹니다. | 20 |
| 스포츠와 피트니스 | 라켓 스포츠, 골프, 운동 측정, 홈트레이닝과 회복 장비를 다룹니다. | 20 |
| 뷰티와 향수 | 향수, 스킨케어, 바디케어와 헤어 기기를 브랜드별로 묶습니다. | 20 |
| **합계** | **16개 카테고리** | **320** |

**B. 카테고리별 브랜드 박스 320개**

표의 최고 상품 두 개는 해당 박스의 상위 구성 후보입니다. 반드시 두 상품이 같은 가격 구간에 들어간다는 뜻은 아닙니다.

낮은 구간에는 존재가 불확실한 명품 굿즈를 만들지 않고, 실제 판매되는 같은 카테고리 소품을 사용했습니다. 공통 소품은 여러 박스에서 재사용할 수 있지만, 같은 상품의 참고가는 모든 박스에서 같아야 합니다.

**1. 자동차, 20개**

차량은 모형이 아닌 실차입니다. 낮은 구간의 G7164는 Meguiar’s Gold Class 세차 샴푸 64oz, X2020은 Supreme Shine 마이크로파이버 타월 3개입입니다. 두 제품 모두 실제 자동차 관리용품입니다. [G7164 공식 제품](https://www.meguiars.com/products/automotive/paint/meguiars-gold-class-car-wash-shampoo-conditioner-g7164-64oz), [X2020 공식 제품](https://meguiarsdirect.com/products/meguiars-supreme-shine-microfiber-towel-x2020-3-pack)

| 박스 이름 | 가격 | 최고 상품 예 둘 | 낮은 구간 소품 예 둘 |
|---|---:|---|---|
| 롤스로이스 박스 | $500 | Rolls-Royce Phantom / Ghost | Meguiar’s G7164 샴푸 / X2020 타월 |
| 벤틀리 박스 | $500 | Bentley Continental GT / Flying Spur | Meguiar’s G7164 샴푸 / X2020 타월 |
| 포르쉐 박스 | $500 | Porsche 911 Carrera / Cayenne | Meguiar’s G7164 샴푸 / X2020 타월 |
| 슈퍼카 박스 | $500 | Ferrari 296 GTB / Lamborghini Revuelto | Meguiar’s G7164 샴푸 / X2020 타월 |
| 마이바흐 박스 | $500 | Mercedes-Maybach S 580 4MATIC / GLS 600 | Meguiar’s G7164 샴푸 / X2020 타월 |
| 제네시스 박스 | $250 | Genesis G90 / GV80 | Meguiar’s G7164 샴푸 / X2020 타월 |
| 토요타 박스 | $250 | Toyota Land Cruiser / RAV4 | Meguiar’s G7164 샴푸 / X2020 타월 |
| BMW 박스 | $500 | BMW M5 / X5 | Meguiar’s G7164 샴푸 / X2020 타월 |
| 아우디 박스 | $500 | Audi RS 6 Avant / Q8 | Meguiar’s G7164 샴푸 / X2020 타월 |
| 렉서스 박스 | $250 | Lexus LX 600 / RX 350 | Meguiar’s G7164 샴푸 / X2020 타월 |
| 랜드로버 박스 | $500 | Range Rover / Defender 110 | Meguiar’s G7164 샴푸 / X2020 타월 |
| 애스턴마틴 박스 | $500 | Aston Martin DB12 / Vantage | Meguiar’s G7164 샴푸 / X2020 타월 |
| 마세라티 박스 | $500 | Maserati GranTurismo / Grecale | Meguiar’s G7164 샴푸 / X2020 타월 |
| 캐딜락 박스 | $250 | Cadillac Escalade / CT5 | Meguiar’s G7164 샴푸 / X2020 타월 |
| 링컨 박스 | $250 | Lincoln Navigator / Aviator | Meguiar’s G7164 샴푸 / X2020 타월 |
| 볼보 박스 | $250 | Volvo XC90 / XC60 | Meguiar’s G7164 샴푸 / X2020 타월 |
| 테슬라 박스 | $250 | Tesla Model S / Model X | Meguiar’s G7164 샴푸 / X2020 타월 |
| 현대 박스 | $250 | Hyundai Palisade / IONIQ 5 | Meguiar’s G7164 샴푸 / X2020 타월 |
| 기아 박스 | $250 | Kia EV9 / Sorento | Meguiar’s G7164 샴푸 / X2020 타월 |
| 포드 박스 | $250 | Ford Mustang / Bronco | Meguiar’s G7164 샴푸 / X2020 타월 |

대표 차량의 제품군은 [Rolls-Royce](https://www.rolls-roycemotorcars.com/en_GB/home.html), [Bentley](https://www.bentleymotors.com/us/en/pages/sitemap.html), [Maybach S-Class](https://www.mbusa.com/en/vehicles/class/maybach-s-class/sedan), [Lamborghini Revuelto](https://www.lamborghini.com/en-en/models/revuelto-models/revuelto)에서 확인할 수 있습니다.

**2. 시계, 20개**

공통 소품은 BARTON Elite Silicone Quick Release 스트랩과 Black Leather Quick Release 스트랩입니다. 상위 시계의 전용 부품이라는 뜻은 아니며, 배송 전에 러그 폭을 선택하게 합니다. [실리콘 스트랩](https://www.bartonwatchbands.com/collections/barton-quick-release-watch-band-straps/products/black-top-crimson-red-bottom-elite-silicone), [가죽 스트랩](https://www.bartonwatchbands.com/en-gb/collections/long-straps-7-9/products/black-leather-quick-release-watch-band-strap)

| 박스 이름 | 가격 | 최고 상품 예 둘 | 낮은 구간 소품 예 둘 |
|---|---:|---|---|
| 롤렉스 박스 | $250 | Rolex Submariner Date / Datejust 41 | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 파텍필립 박스 | $500 | Patek Philippe Nautilus 5811/1G / Aquanaut 5167A | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 오데마 피게 박스 | $500 | Royal Oak Selfwinding / Royal Oak Offshore Selfwinding Chronograph | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 바쉐론 콘스탄틴 박스 | $500 | Overseas Self-Winding / Patrimony Manual-Winding | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 랑에 운트 죄네 박스 | $500 | LANGE 1 / SAXONIA THIN | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 오메가 박스 | $250 | Speedmaster Moonwatch Professional / Seamaster Diver 300M | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 까르띠에 시계 박스 | $250 | Santos de Cartier / Tank Must | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| IWC 박스 | $250 | Portugieser Chronograph / Pilot’s Watch Mark XX | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 예거 르쿨트르 박스 | $250 | Reverso Classic Monoface Small Seconds / Master Ultra Thin Moon | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 브라이틀링 박스 | $250 | Navitimer B01 Chronograph 43 / Superocean Automatic 42 | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 태그호이어 박스 | $100 | Monaco Chronograph / Carrera Chronograph | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 파네라이 박스 | $250 | Luminor Marina / Radiomir Quaranta | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 위블로 박스 | $250 | Big Bang Unico Titanium / Classic Fusion Titanium | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 제니스 박스 | $250 | Chronomaster Sport / DEFY Skyline | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 블랑팡 박스 | $250 | Fifty Fathoms Automatique / Fifty Fathoms Bathyscaphe | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 브레게 박스 | $250 | Classique 5177 / Marine 5517 | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 그랜드세이코 박스 | $100 | Grand Seiko SBGA211 / SLGH005 | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 튜더 박스 | $100 | Black Bay Fifty-Eight / Pelagos 39 | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 론진 박스 | $100 | Spirit Zulu Time / HydroConquest | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |
| 세이코 박스 | $100 | Seiko Prospex SPB143 / SRPE93 | BARTON Elite Silicone 스트랩 / Black Leather 스트랩 |

상위 제품 확인 예시는 [Aquanaut 5167A](https://www.patek.com/en/collection/aquanaut/5167A-001), [Royal Oak Offshore](https://www.audemarspiguet.com/us/en/watch-collection/royal-oak-offshore/26238TI.OO.2000TI.01), [SAXONIA THIN](https://www.alange-soehne.com/mo-en/timepieces/saxonia/saxonia-thin/saxonia-thin-in-750-pink-gold-211-088)입니다.

**3. 여성 가방, 20개**

낮은 구간은 실제 가방인 BAGGU Baby Baggu Black과 Standard Baggu Black입니다. 공식 페이지 표시가는 각각 $14와 $16으로 확인됐습니다. [Baby Baggu](https://baggu.com/products/baby-baggu-black), [Standard Baggu](https://checkout.baggu.com/products/standard-baggu-black-vn)

| 박스 이름 | 가격 | 최고 상품 예 둘 | 낮은 구간 소품 예 둘 |
|---|---:|---|---|
| 에르메스 가방 박스 | $500 | Birkin 25 / Kelly 28 | BAGGU Baby Baggu Black / Standard Baggu Black |
| 샤넬 가방 박스 | $250 | Classic 11.12 Handbag / 2.55 Handbag | BAGGU Baby Baggu Black / Standard Baggu Black |
| 디올 가방 박스 | $250 | Medium Lady Dior / Saddle Bag | BAGGU Baby Baggu Black / Standard Baggu Black |
| 루이비통 가방 박스 | $100 | Capucines BB / Neverfull MM | BAGGU Baby Baggu Black / Standard Baggu Black |
| 구찌 가방 박스 | $100 | Jackie 1961 Small / GG Marmont Small Shoulder Bag | BAGGU Baby Baggu Black / Standard Baggu Black |
| 프라다 가방 박스 | $100 | Galleria Small Saffiano Bag / Re-Edition 2005 Re-Nylon Bag | BAGGU Baby Baggu Black / Standard Baggu Black |
| 미우미우 박스 | $100 | Wander Matelassé Nappa Hobo / Arcadie Matelassé Nappa Bag | BAGGU Baby Baggu Black / Standard Baggu Black |
| 생로랑 가방 박스 | $100 | Loulou Small / Sac de Jour Small | BAGGU Baby Baggu Black / Standard Baggu Black |
| 셀린느 박스 | $100 | Classique Triomphe / Teen 16 | BAGGU Baby Baggu Black / Standard Baggu Black |
| 로에베 박스 | $100 | Small Puzzle Bag / Medium Flamenco Clutch | BAGGU Baby Baggu Black / Standard Baggu Black |
| 보테가 베네타 박스 | $250 | Small Andiamo / Small Jodie | BAGGU Baby Baggu Black / Standard Baggu Black |
| 펜디 박스 | $100 | Baguette / Peekaboo ISeeU Small | BAGGU Baby Baggu Black / Standard Baggu Black |
| 발렌시아가 가방 박스 | $100 | Le Cagole XS Shoulder Bag / Hourglass Small Handbag | BAGGU Baby Baggu Black / Standard Baggu Black |
| 지방시 박스 | $100 | Antigona Small / Voyou Medium | BAGGU Baby Baggu Black / Standard Baggu Black |
| 발렌티노 가라바니 박스 | $100 | Small Roman Stud The Shoulder Bag / Small Locò Shoulder Bag | BAGGU Baby Baggu Black / Standard Baggu Black |
| 페라가모 박스 | $100 | Small Hug Bag / Small Studio Bag | BAGGU Baby Baggu Black / Standard Baggu Black |
| 델보 박스 | $250 | Brillant Mini / Tempête Small | BAGGU Baby Baggu Black / Standard Baggu Black |
| 고야드 박스 | $100 | Saint Louis PM / Artois PM | BAGGU Baby Baggu Black / Standard Baggu Black |
| 끌로에 박스 | $100 | Marcie Small Double Carry Bag / Woody Medium Tote | BAGGU Baby Baggu Black / Standard Baggu Black |
| 멀버리 박스 | $100 | Bayswater / Alexa | BAGGU Baby Baggu Black / Standard Baggu Black |

대표 제품군 근거는 [Hermès](https://www.hermes.com/nl/en/content/310339-hermes-iconic-bag-lines/), [CHANEL](https://www.chanel.com/jp/fashion/handbags/classic/), [LOEWE Puzzle](https://www.loewe.com/eur/en/women/bags/puzzle?country=US&lang=en-US), [Delvaux](https://eu.delvaux.com/en/emblematics)입니다.

**4. 주얼리, 20개**

공통 소품은 Connoisseurs UltraSoft Silver Jewelry Polishing Cloth와 Jewelry Wipes Compact입니다. 표에서는 Silver Cloth와 Jewelry Wipes로 줄였습니다. 소재에 맞는 사용법을 함께 표시합니다. [Connoisseurs 공식 제품과 사용표](https://connoisseurs.com/pages/cleaning-chart)

| 박스 이름 | 가격 | 최고 상품 예 둘 | 낮은 구간 소품 예 둘 |
|---|---:|---|---|
| 까르띠에 주얼리 박스 | $250 | LOVE Bracelet Classic / Juste un Clou Bracelet Classic | Connoisseurs Silver Cloth / Jewelry Wipes |
| 티파니 박스 | $250 | Tiffany T T1 Wide Hinged Bangle / HardWear Graduated Link Necklace | Connoisseurs Silver Cloth / Jewelry Wipes |
| 반클리프 아펠 박스 | $250 | Vintage Alhambra Necklace 10 Motifs / Perlée Clovers Bracelet | Connoisseurs Silver Cloth / Jewelry Wipes |
| 불가리 박스 | $250 | Serpenti Viper Bracelet / B.zero1 Four-Band Ring | Connoisseurs Silver Cloth / Jewelry Wipes |
| 쇼메 박스 | $250 | Jeux de Liens Harmony Pendant / Bee de Chaumet Bracelet 085392 | Connoisseurs Silver Cloth / Jewelry Wipes |
| 부쉐론 박스 | $250 | Quatre Classique Large Ring / Serpent Bohème Pendant XS Motif JPN00003 | Connoisseurs Silver Cloth / Jewelry Wipes |
| 쇼파드 박스 | $250 | Happy Hearts Bangle / Happy Diamonds Icons Pendant | Connoisseurs Silver Cloth / Jewelry Wipes |
| 피아제 박스 | $250 | Possession Rose Gold Diamond Ring / Possession Rose Gold Diamond Open Bangle | Connoisseurs Silver Cloth / Jewelry Wipes |
| 그라프 박스 | $250 | Butterfly Silhouette Diamond Pendant / Icon Round Diamond Pendant | Connoisseurs Silver Cloth / Jewelry Wipes |
| 해리 윈스턴 박스 | $250 | Lily Cluster Diamond Pendant Small / Lily Cluster Diamond Earrings Large | Connoisseurs Silver Cloth / Jewelry Wipes |
| 메시카 박스 | $100 | Move Classique Pavé Necklace Small / Move Classique Bracelet Small | Connoisseurs Silver Cloth / Jewelry Wipes |
| 프레드 박스 | $250 | Force 10 Bracelet Large Model / Force 10 Bracelet Extra Large Model | Connoisseurs Silver Cloth / Jewelry Wipes |
| 포멜라토 박스 | $250 | Nudo Classic Ring / Iconica Bracelet | Connoisseurs Silver Cloth / Jewelry Wipes |
| 부첼라티 박스 | $250 | Macri Bracelet JAUBRA005122 / Opera Tulle Pendant JAUPEN018231XXX000 | Connoisseurs Silver Cloth / Jewelry Wipes |
| 다미아니 박스 | $100 | Belle Époque Cross Necklace / D.Icon Ceramic and Diamond Ring | Connoisseurs Silver Cloth / Jewelry Wipes |
| 레포시 박스 | $250 | Berbere Three-Row Ring / Serti sur Vide Three-Diamond Earring | Connoisseurs Silver Cloth / Jewelry Wipes |
| 타사키 박스 | $100 | balance signature Necklace P 15884 / balance signature Ring R 4398 | Connoisseurs Silver Cloth / Jewelry Wipes |
| 미키모토 박스 | $250 | M Code Akoya Pearl Necklace MZQ10091AXXK / M Collection Pendant MPQ10186AXXK | Connoisseurs Silver Cloth / Jewelry Wipes |
| 데이비드 율만 박스 | $100 | Classic Cable Station Bracelet 7mm / Buckle Cablespira Bracelet 3.5mm | Connoisseurs Silver Cloth / Jewelry Wipes |
| 스와로브스키 박스 | $50 | Swan Necklace / Millenia Necklace 5720911 | Connoisseurs Silver Cloth / Jewelry Wipes |

이름이 혼동되기 쉬운 제품은 [쇼메 085392](https://www.chaumet.com/sa_en/bee-my-love-bracelet-085392), [해리 윈스턴 귀걸이](https://www.harrywinston.com/en/products/lily-cluster-by-harry-winston/lily-cluster-diamond-earrings-large-eadrmqrflc), [부첼라티 Macri](https://www.buccellati.com/en_us/macri-bracelet-jaubra005122.html), [부첼라티 Opera Tulle](https://www.buccellati.com/en_row/opera-tulle-pendant-jaupen018231xxx000.html), [타사키 공식 카탈로그](https://cloud.tasaki.inc/pdf/20240801_tasaki_balance_catalog_en.pdf)를 기준으로 적었습니다.

**5. 패션과 신발, 20개**

Nike 양말은 HJ9389-010 한 켤레 상품입니다. 묶음을 임의로 소분한 구성이 아닙니다. adidas Adilette Aqua는 더 높은 저가 구간에 놓습니다. [Nike 양말](https://www.nike.com/gb/t/everyday-cushioned-crew-socks-4SgB9k/HJ9389-010), [adidas Adilette Aqua](https://www.adidas.com/us/adilette-aqua-slides/F35539.html)

| 박스 이름 | 가격 | 최고 상품 예 둘 | 낮은 구간 소품 예 둘 |
|---|---:|---|---|
| 나이키 패션 박스 | $100 | Alphafly 3 / Vaporfly 3 | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 아디다스 패션 박스 | $100 | Adizero Adios Pro 4 / Ultraboost 5 | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 뉴발란스 박스 | $100 | Made in USA 990v6 / Made in UK 991v2 | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 아식스 박스 | $100 | METASPEED SKY PARIS / GEL-KAYANO 31 | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 살로몬 박스 | $100 | XT-6 / ACS PRO | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 온 박스 | $100 | Cloudboom Strike / Cloudmonster 2 | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 호카 박스 | $100 | Rocket X 2 / Bondi 9 | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 조던 박스 | $100 | Air Jordan 1 Retro High OG / Air Jordan 4 Retro | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 컨버스 박스 | $50 | Chuck 70 / Run Star Hike | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 반스 박스 | $50 | Sk8-Hi / Old Skool | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 닥터마틴 박스 | $100 | 1460 Smooth Leather Boots / 1461 Smooth Leather Shoes | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 팀버랜드 박스 | $100 | Premium 6-Inch Waterproof Boots / 3-Eye Lug Handsewn Boat Shoes | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 버켄스탁 박스 | $50 | Boston Suede Leather / Arizona Birko-Flor | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 어그 박스 | $50 | Classic Short II / Tasman | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 몽클레르 박스 | $250 | Maya Short Down Jacket / Bady Short Down Jacket | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 캐나다구스 박스 | $250 | Expedition Parka / Chilliwack Bomber | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 버버리 박스 | $250 | Kensington Heritage Trench Coat / Waterloo Heritage Trench Coat | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 아크테릭스 박스 | $100 | Alpha SV Jacket / Beta AR Jacket | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 노스페이스 박스 | $100 | 1996 Retro Nuptse Jacket / Mountain Light Jacket | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |
| 파타고니아 박스 | $100 | DAS Parka / Down Sweater | Nike Everyday Cushioned 양말 HJ9389-010 / adidas Adilette Aqua |

**6. 모바일과 태블릿, 20개**

공통 케이블은 실제 판매 제품입니다. 충전 속도와 기기 호환성은 상품별로 따로 표시합니다. [Apple 충전 케이블](https://www.apple.com/shop/accessories/all/made-by-apple/cables-iphone-16-pro), [Anker 케이블](https://www.anker.com/eu-en/collections/cables), [Anker 20W 충전기](https://www.anker.com/collections/20w-charger)

| 박스 이름 | 가격 | 최고 상품 예 둘 | 낮은 구간 소품 예 둘 |
|---|---:|---|---|
| 애플 모바일 박스 | $100 | iPhone 16 Pro Max / iPad Pro 13-inch M4 | Apple 60W USB-C 케이블 1m / Anker 310 USB-C 케이블 |
| 삼성 갤럭시 박스 | $100 | Galaxy S24 Ultra / Galaxy Tab S9 Ultra | Apple 60W USB-C 케이블 1m / Anker 310 USB-C 케이블 |
| 구글 픽셀 박스 | $50 | Pixel 9 Pro XL / Pixel 9 Pro Fold | Apple 60W USB-C 케이블 1m / Anker 310 USB-C 케이블 |
| 샤오미 모바일 박스 | $50 | Xiaomi 14 Ultra / Pad 6S Pro 12.4 | Apple 60W USB-C 케이블 1m / Anker 310 USB-C 케이블 |
| 오포 박스 | $50 | OPPO Find X7 Ultra / Find N3 | Apple 60W USB-C 케이블 1m / Anker 310 USB-C 케이블 |
| 원플러스 박스 | $50 | OnePlus Open / OnePlus 12 | Apple 60W USB-C 케이블 1m / Anker 310 USB-C 케이블 |
| 비보 박스 | $50 | vivo X100 Ultra / X Fold3 Pro | Apple 60W USB-C 케이블 1m / Anker 310 USB-C 케이블 |
| 아너 박스 | $50 | HONOR Magic V3 / Magic6 Pro | Apple 60W USB-C 케이블 1m / Anker 310 USB-C 케이블 |
| 모토로라 박스 | $50 | razr 50 ultra / edge 50 ultra | Apple 60W USB-C 케이블 1m / Anker 310 USB-C 케이블 |
| 낫싱 박스 | $50 | Nothing Phone (2) / Phone (2a) Plus | Apple 60W USB-C 케이블 1m / Anker 310 USB-C 케이블 |
| 소니 엑스페리아 박스 | $50 | Xperia 1 VI / Xperia 5 V | Apple 60W USB-C 케이블 1m / Anker 310 USB-C 케이블 |
| 에이수스 모바일 박스 | $50 | Zenfone 11 Ultra / ROG Phone 8 Pro | Apple 60W USB-C 케이블 1m / Anker 310 USB-C 케이블 |
| 레드매직 박스 | $50 | REDMAGIC 9 Pro / 9S Pro | Apple 60W USB-C 케이블 1m / Anker 310 USB-C 케이블 |
| 화웨이 모바일 박스 | $50 | Pura 70 Ultra / MatePad Pro 13.2-inch | Apple 60W USB-C 케이블 1m / Anker 310 USB-C 케이블 |
| 레노버 태블릿 박스 | $50 | Tab Extreme / Tab P12 | Apple 60W USB-C 케이블 1m / Anker 310 USB-C 케이블 |
| HMD 박스 | $20 | HMD Skyline / HMD Fusion | Anker 310 USB-C 케이블 / Nano Charger 20W |
| 리얼미 박스 | $20 | realme GT 6 / 12 Pro+ 5G | Anker 310 USB-C 케이블 / Nano Charger 20W |
| 테크노 박스 | $50 | PHANTOM V Fold2 5G / PHANTOM V Flip2 5G | Apple 60W USB-C 케이블 1m / Anker 310 USB-C 케이블 |
| 인피닉스 박스 | $20 | Infinix ZERO 40 / NOTE 40 Pro | Anker 310 USB-C 케이블 / Nano Charger 20W |
| 앤커 충전 박스 | $20 | Prime 27,650mAh Power Bank 250W / 737 Power Bank PowerCore 24K | Anker 310 USB-C 케이블 / Nano Charger 20W |

모델명이 덜 익숙한 브랜드의 확인 근거는 [HMD](https://www.hmd.com/en_gb/smartphones), [realme](https://www.realme.com/global/realme-12-pro-plus), [TECNO](https://www.tecno-mobile.com/phones/product-detail/product/phantom-v-flip2-5g/), [Infinix ZERO 40](https://www.infinixmobility.com/zero-40)입니다.

**7. 컴퓨터와 데스크, 20개**

낮은 구간은 Logitech M100 USB Mouse와 Mouse Pad Studio Series입니다. [M100](https://www.logitech.com/en-ae/products/mice/m100-usb-mouse.910-006652.html), [Studio Series 마우스패드](https://www.logitech.com/en-us/shop/p/mouse-pad-studio-series.956-000035?searchclick=logi)

| 박스 이름 | 가격 | 최고 상품 예 둘 | 낮은 구간 소품 예 둘 |
|---|---:|---|---|
| 애플 맥 박스 | $250 | Mac Studio M2 Ultra / MacBook Pro 16-inch M3 Max | Logitech M100 / Studio Series 마우스패드 |
| 삼성 갤럭시북 박스 | $100 | Galaxy Book4 Ultra / Galaxy Book4 Pro 360 | Logitech M100 / Studio Series 마우스패드 |
| LG 데스크 박스 | $100 | gram Pro 16 16Z90SP / UltraFine OLED Pro 32EP950 | Logitech M100 / Studio Series 마우스패드 |
| 델 박스 | $100 | XPS 16 9640 / UltraSharp U4025QW | Logitech M100 / Studio Series 마우스패드 |
| HP 박스 | $100 | ZBook Fury 16 G11 / Spectre x360 14 2024 | Logitech M100 / Studio Series 마우스패드 |
| 레노버 컴퓨터 박스 | $100 | ThinkPad X1 Carbon Gen 12 / ThinkPad P1 Gen 7 | Logitech M100 / Studio Series 마우스패드 |
| 에이수스 크리에이터 박스 | $100 | ProArt P16 H7606 / Zenbook DUO UX8406 | Logitech M100 / Studio Series 마우스패드 |
| 에이서 박스 | $50 | Swift X 14 SFX14-72G / Swift Go 14 SFG14-73 | Logitech M100 / Studio Series 마우스패드 |
| MSI 크리에이터 박스 | $100 | Creator Z17 HX Studio A13V / Prestige 16 AI Evo B1M | Logitech M100 / Studio Series 마우스패드 |
| 마이크로소프트 서피스 박스 | $100 | Surface Laptop Studio 2 / Surface Laptop 7th Edition | Logitech M100 / Studio Series 마우스패드 |
| 레이저 노트북 박스 | $100 | Razer Blade 16 2024 / Blade 18 2024 | Logitech M100 / Studio Series 마우스패드 |
| 기가바이트 박스 | $100 | AERO 16 OLED 2023 / AERO 14 OLED 2023 | Logitech M100 / Studio Series 마우스패드 |
| 인텔 박스 | $50 | Core i9-14900K / Core i7-14700K | Logitech M100 / Studio Series 마우스패드 |
| AMD 박스 | $50 | Ryzen 9 7950X3D / Ryzen 9 9950X | Logitech M100 / Studio Series 마우스패드 |
| 엔비디아 박스 | $100 | GeForce RTX 4090 Founders Edition / RTX 4080 SUPER Founders Edition | Logitech M100 / Studio Series 마우스패드 |
| 커세어 데스크 박스 | $50 | CORSAIR ONE i500 / XENEON FLEX 45WQHD240 | Logitech M100 / Studio Series 마우스패드 |
| 로지텍 오피스 박스 | $20 | MX Master 3S / MX Keys S | Logitech M100 / Studio Series 마우스패드 |
| 키크론 박스 | $20 | Keychron Q1 Max / Q6 Max | Logitech M100 / Studio Series 마우스패드 |
| 벤큐 박스 | $50 | BenQ PD3225U / SW272U | Logitech M100 / Studio Series 마우스패드 |
| 에이조 박스 | $100 | EIZO ColorEdge CG2700X / CG319X | Logitech M100 / Studio Series 마우스패드 |

**8. 게임과 게이밍 장비, 20개**

G240은 Logitech의 천 재질 게이밍 마우스패드입니다. KontrolFreek Galaxy는 플랫폼별 호환 제품을 지정해야 합니다. [G240](https://www.logitechg.com/en-gb/products/gaming-mouse-pads/g240-cloth-gaming-mouse-pad.943-000095.html), [FPS Freek Galaxy](https://www.kontrolfreek.com/products/fps-freek-galaxy?variant=8609306116153), [Victrix 부품](https://www.turtlebeach.com/collections/victrix-pro)

| 박스 이름 | 가격 | 최고 상품 예 둘 | 낮은 구간 소품 예 둘 |
|---|---:|---|---|
| 플레이스테이션 박스 | $50 | PlayStation 5 Pro / PlayStation VR2 | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 엑스박스 박스 | $50 | Xbox Series X / Elite Wireless Controller Series 2 | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 닌텐도 박스 | $50 | Nintendo Switch OLED Model / Switch Lite | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 밸브 박스 | $50 | Steam Deck OLED 1TB / OLED 512GB | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 에이수스 ROG 박스 | $100 | ROG Ally X / ROG Zephyrus G16 2024 | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| MSI 게이밍 박스 | $100 | Claw A1M / Titan 18 HX A14V | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 레이저 게이밍 박스 | $50 | Wolverine V2 Pro / BlackWidow V4 Pro | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 로지텍 G 박스 | $50 | PRO Racing Wheel / PRO X 2 LIGHTSPEED | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 스틸시리즈 박스 | $50 | Arctis Nova Pro Wireless / Apex Pro TKL 2023 | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 커세어 게이밍 박스 | $50 | K100 RGB / VIRTUOSO PRO | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 하이퍼엑스 박스 | $50 | Cloud III Wireless / Alloy Origins | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 터틀비치 박스 | $50 | Stealth Pro / VelocityOne Flight | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 8BitDo 박스 | $20 | Ultimate Bluetooth Controller / Arcade Stick | Victrix Pro FS JLF Replacement Cable / Logitech G240 |
| SCUF 박스 | $50 | Reflex Pro / Instinct Pro | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 트러스트마스터 박스 | $50 | T-GT II / T818 | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 파나텍 박스 | $100 | Gran Turismo DD Pro / ClubSport DD+ | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 모자 레이싱 박스 | $50 | MOZA R12 Wheel Base / R9 V2 Wheel Base | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 엘가토 박스 | $50 | Stream Deck XL / 4K X | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 에버미디어 박스 | $50 | Live Gamer ULTRA 2.1 GC553G2 / Live Gamer 4K 2.1 GC575 | Logitech G240 / KontrolFreek FPS Freek Galaxy |
| 빅트릭스 박스 | $50 | Pro FS Arcade Fight Stick / Pro KO Leverless Fight Stick | Victrix Pro FS JLF Replacement Cable / Pro FS Strap |

**9. 오디오, 20개**

공통 하위 제품은 Apple EarPods USB-C와 Koss KSC75입니다. 각각 실제 유선 이어폰과 이어클립 헤드폰입니다. [Apple EarPods](https://support.apple.com/en-us/108042), [Koss KSC75](https://koss.com/products/ksc75)

| 박스 이름 | 가격 | 최고 상품 예 둘 | 낮은 구간 소품 예 둘 |
|---|---:|---|---|
| 소니 오디오 박스 | $50 | WH-1000XM5 / NW-WM1ZM2 | Apple EarPods USB-C / Koss KSC75 |
| 보스 박스 | $50 | QuietComfort Ultra Headphones / Smart Ultra Soundbar | Apple EarPods USB-C / Koss KSC75 |
| 젠하이저 박스 | $100 | HD 800 S / IE 900 | Apple EarPods USB-C / Koss KSC75 |
| 뱅앤올룹슨 박스 | $100 | Beoplay H100 / Beosound A9 5th Gen | Apple EarPods USB-C / Koss KSC75 |
| 바워스앤윌킨스 박스 | $100 | Px8 / Formation Duo | Apple EarPods USB-C / Koss KSC75 |
| KEF 박스 | $100 | LS50 Wireless II / LS60 Wireless | Apple EarPods USB-C / Koss KSC75 |
| 드비알레 박스 | $100 | Phantom I 108 dB / Dione | Apple EarPods USB-C / Koss KSC75 |
| 소노스 박스 | $50 | Arc / Era 300 | Apple EarPods USB-C / Koss KSC75 |
| 마샬 박스 | $50 | Woburn III / Stanmore III | Apple EarPods USB-C / Koss KSC75 |
| JBL 박스 | $50 | PartyBox Ultimate / Boombox 3 | Apple EarPods USB-C / Koss KSC75 |
| 하만카돈 박스 | $50 | Aura Studio 4 / Go + Play 3 | Apple EarPods USB-C / Koss KSC75 |
| 오디오테크니카 박스 | $50 | ATH-ADX5000 / AT-LP120XUSB | Apple EarPods USB-C / Koss KSC75 |
| 슈어 박스 | $50 | SE846 / SM7B | Apple EarPods USB-C / Koss KSC75 |
| 포칼 박스 | $100 | Utopia 2022 / Bathys | Apple EarPods USB-C / Koss KSC75 |
| 베이어다이내믹 박스 | $50 | T1 3rd Generation / DT 1990 PRO | Apple EarPods USB-C / Koss KSC75 |
| 오디지 박스 | $100 | LCD-5 / LCD-X | Apple EarPods USB-C / Koss KSC75 |
| AKG 박스 | $50 | K812 / C414 XLS | Apple EarPods USB-C / Koss KSC75 |
| 테크닉스 박스 | $100 | SL-1200GR2 / EAH-A800 | Apple EarPods USB-C / Koss KSC75 |
| 야마하 오디오 박스 | $50 | R-N1000A / YH-5000SE | Apple EarPods USB-C / Koss KSC75 |
| 피오 박스 | $50 | FiiO M17 / K9 Pro ESS | Apple EarPods USB-C / Koss KSC75 |

**10. 카메라와 촬영, 20개**

ZEISS Cleaning Wipes 20매와 Microfibre Cloth 30×40cm는 실제 촬영 액세서리입니다. [ZEISS 공식 액세서리](https://www.zeiss.com/photonics-and-optics/us/photography/products/accessories.html)

| 박스 이름 | 가격 | 최고 상품 예 둘 | 낮은 구간 소품 예 둘 |
|---|---:|---|---|
| 캐논 EOS 박스 | $100 | EOS R5 / RF 85mm F1.2 L USM | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 니콘 Z 박스 | $100 | Nikon Z9 / Z8 | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 소니 알파 박스 | $100 | Alpha 1 / Alpha 7R V | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 후지필름 박스 | $100 | GFX100 II / X100VI | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 파나소닉 루믹스 박스 | $100 | LUMIX S1H / LUMIX GH7 | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| OM SYSTEM 박스 | $100 | OM-1 Mark II / M.Zuiko Digital ED 150-400mm F4.5 TC1.25x IS PRO | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 펜탁스 박스 | $100 | K-1 Mark II / K-3 Mark III | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 리코 박스 | $50 | GR III / GR IIIx | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 라이카 박스 | $250 | Leica M11 / Q3 | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 핫셀블라드 박스 | $250 | X2D 100C / 907X & CFV 100C | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 페이즈원 박스 | $500 | XF IQ4 150MP Camera System / XC 23 IQ4 150MP | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 고프로 박스 | $50 | HERO12 Black / MAX | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| DJI 촬영 박스 | $100 | Mavic 3 Pro / Osmo Pocket 3 | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 인스타360 박스 | $50 | Insta360 X4 / Ace Pro | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 시그마 박스 | $50 | 50mm F1.2 DG DN Art / 60-600mm F4.5-6.3 DG DN OS Sports | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 탐론 박스 | $50 | 35-150mm F/2-2.8 Di III VXD / 150-500mm F/5-6.7 Di III VC VXD | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 자이스 렌즈 박스 | $100 | Otus 1.4/55 / Otus 1.4/85 | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 삼양 렌즈 박스 | $50 | AF 35-150mm F2-2.8 FE / AF 135mm F1.8 FE | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 고독스 박스 | $50 | AD600Pro / AD300Pro | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |
| 프로포토 박스 | $100 | B10X / B10X Plus | ZEISS Cleaning Wipes 20매 / Microfibre Cloth 30×40cm |

고가 카메라 시스템의 구성 기준은 [Phase One XF](https://www.phaseone.com/applications/bespoke-photography/studio-photography-xf-camera-system/), [Phase One XC](https://www.phaseone.com/solutions/photographic-cameras/xc/)입니다. 렌즈는 마운트를 반드시 별도 사양으로 확정합니다.

**11. 생활가전, 20개**

풀팩은 제조사 공식 상품명이 아니라 **실재 제품을 묶는 VOILA 구성 세트**입니다. 아래 북미 모델은 구성 예이며, 실제 판매 국가의 전압과 설치 조건에 맞는 SKU를 확정해야 합니다.

| 박스 이름 | 가격 | 최고 상품 예 둘 | 낮은 구간 소품 예 둘 |
|---|---:|---|---|
| LG 가전 풀팩 박스 | $500 | VOILA 홈 세트: WM4000HWA 세탁기 + DLEX4000W 건조기 + LRFVS3006S 냉장고 / VOILA 세탁 세트: WM4000HWA + DLEX4000W | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 삼성 가전 풀팩 박스 | $500 | VOILA 홈 세트: WF53BB8700AT 세탁기 + DVE53BB8700T 건조기 + RF29A9671SR 냉장고 + DW80B7070US 식기세척기 / VOILA 세탁 세트: WF53BB8700AT + DVE53BB8700T | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 밀레 가전 풀팩 박스 | $500 | VOILA 세탁 세트 A: WXF980 WCS 세탁기 + TXI680WP 건조기 / VOILA 세탁 세트 B: WXC280 WCS 세탁기 + TXD160WP 건조기 | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 다이슨 생활가전 박스 | $100 | V15 Detect / Purifier Big+Quiet Formaldehyde BP03 | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 로보락 박스 | $100 | S8 MaxV Ultra / Qrevo Master | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 드리미 박스 | $100 | X40 Ultra / L20 Ultra | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 아이로봇 박스 | $50 | Roomba Combo j9+ / Roomba s9+ | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 에코백스 박스 | $100 | DEEBOT X2 OMNI / DEEBOT T30 OMNI | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 샤크 박스 | $50 | Detect Pro Cordless Vacuum / FlexStyle Air Styling & Drying System | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 닌자 박스 | $50 | CREAMi Deluxe NC501 / Foodi Smart XL Grill FG551 | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 브레빌 박스 | $100 | the Oracle Touch BES990 / the Barista Touch BES880 | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 드롱기 박스 | $100 | PrimaDonna Soul ECAM610.75.MB / La Specialista Prestigio EC9355.M | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 스메그 박스 | $50 | EGF03 Espresso Coffee Machine / SMF03 Stand Mixer | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 필립스 박스 | $50 | 5400 Series LatteGo EP5447/90 / Airfryer XXL HD9650/99 | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 브라운 박스 | $50 | Series 9 Pro+ 9567cc / Silk-expert Pro 5 PL5157 | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 파나소닉 생활가전 박스 | $50 | ES-LS9A 전기면도기 / EH-NA0J 헤어드라이어 | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 발뮤다 박스 | $50 | The Toaster / The Pot | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 쿠쿠 박스 | $50 | CRP-P1009SW / CRP-LHTR1009F | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 코웨이 박스 | $50 | Airmega 400S / Airmega ProX | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |
| 샤오미 생활가전 박스 | $20 | Robot Vacuum X20+ / Smart Air Purifier 4 Pro | IKEA PRODUKT 우유거품기 / Xiaomi Mi Electric Toothbrush T100 |

풀팩과 저가 제품의 대표 근거는 [LG 세탁기와 건조기](https://www.lg.com/us/washers-dryers/lg-wm4000hwa-front-load-washer), [삼성 세탁기 공식 사양](https://image-us.samsung.com/SamsungUS/home/05312023/pdf/2022_WF53BB8700_V9.pdf), [밀레 세탁기](https://www.mieleusa.com/category/1015701/front-loading-washing-machines), [밀레 건조기](https://www.mieleusa.com/c/compact-dryers-3135.htm), [IKEA PRODUKT](https://www.ikea.com/gb/en/p/produkt-milk-frother-black-50301166/), [Xiaomi T100](https://www.mi.com/np/product/mi-electric-toothbrush-t100/)입니다.

**12. 포켓몬, 20개**

카드는 **영문판, 미등급 NM 상태**를 기준으로 합니다. 아래 세트명과 카드 번호가 식별자입니다. 등급 카드는 실제 등급과 인증번호가 확인된 물량을 확보한 뒤 별도 상품으로 추가합니다.

공통 소품은 Ultra PRO PENNY SLEEVES 100매와 3×4인치 Regular Toploaders 25개입니다. 공식 제품은 확인됐지만 확인 시 공식몰은 품절 상태였으므로 유통 재고 확보가 필요합니다. [슬리브](https://ultrapro.com/collections/card-sleeves), [탑로더](https://ultrapro.com/collections/all/products/3-inch-x-4-inch-clear-regular-toploaders-25ct-for-standard-size-cards)

| 박스 이름 | 가격 | 최고 상품 예 둘 | 낮은 구간 소품 예 둘 |
|---|---:|---|---|
| 리자몽 박스 | $50 | Charizard ex, 151 199/165 / Charizard ex, 151 183/165 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 피카츄 박스 | $50 | Pikachu VMAX, Vivid Voltage 188/185 / Pikachu VMAX, Lost Origin TG17/TG30 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 거북왕 박스 | $20 | Blastoise ex, 151 200/165 / Blastoise ex, 151 184/165 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 이상해꽃 박스 | $20 | Venusaur ex, 151 198/165 / Venusaur ex, 151 182/165 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 뮤 박스 | $50 | Mew VMAX, Fusion Strike 269/264 / Mew V, Fusion Strike 251/264 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 뮤츠 박스 | $20 | Mewtwo VSTAR, Crown Zenith GG44/GG70 / Mewtwo V, Pokémon GO 072/078 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 블래키 박스 | $100 | Umbreon VMAX, Evolving Skies 215/203 / Umbreon V, Evolving Skies 189/203 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 에브이 박스 | $50 | Espeon VMAX, Fusion Strike 270/264 / Espeon V, Evolving Skies 180/203 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 님피아 박스 | $50 | Sylveon VMAX, Evolving Skies 212/203 / Sylveon V, Evolving Skies 184/203 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 리피아 박스 | $50 | Leafeon VMAX, Evolving Skies 205/203 / Leafeon V, Evolving Skies 167/203 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 글레이시아 박스 | $50 | Glaceon VMAX, Evolving Skies 209/203 / Glaceon V, Evolving Skies 175/203 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 레쿠쟈 박스 | $100 | Rayquaza VMAX, Evolving Skies 218/203 / Rayquaza V, Evolving Skies 194/203 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 팬텀 박스 | $50 | Gengar VMAX, Fusion Strike 271/264 / Gengar VMAX, Fusion Strike 157/264 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 루기아 박스 | $50 | Lugia V, Silver Tempest 186/195 / Lugia V, Silver Tempest 185/195 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 기라티나 박스 | $50 | Giratina V, Lost Origin 186/196 / Giratina V, Lost Origin 185/196 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 망나뇽 박스 | $20 | Dragonite V, Evolving Skies 192/203 / Dragonite V, Evolving Skies 191/203 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 잠만보 박스 | $20 | Snorlax VMAX, Sword & Shield 206/202 / Snorlax V, Sword & Shield 197/202 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 후딘 박스 | $20 | Alakazam ex, 151 201/165 / Alakazam ex, 151 188/165 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 썬더 박스 | $20 | Zapdos ex, 151 202/165 / Zapdos ex, 151 192/165 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |
| 잉어킹 박스 | $20 | Magikarp, Paldea Evolved 203/193 / Magikarp & Wailord-GX, Team Up 161/181 | Ultra PRO PENNY SLEEVES 100매 / Regular Toploaders 25개 |

카드 식별의 주요 근거는 공식 [151 목록](https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/checklist/mew_web_cardlist_en.pdf), [Evolving Skies 목록](https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/checklist/swsh7_web_cardlist_en.pdf), [Fusion Strike 목록](https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/checklist/swsh8_web_cardlist_en.pdf), [Lost Origin 목록](https://assets.pokemon.com/assets/cms2-en-uk/pdf/trading-card-game/checklist/swsh11_web_cardlist_en.pdf), [Silver Tempest 목록](https://assets.pokemon.com/assets/cms2-en-uk/pdf/trading-card-game/checklist/swsh12_web_cardlist_en.pdf)입니다.

**13. 토이와 컬렉터블, 20개**

레고를 테마별로 여러 가격에 쪼개지 않고 하나의 브랜드 박스로 묶었습니다. Hot Wheels, Barbie, MEGA는 같은 모기업에 속하지만 소비자가 구분하는 별도 브랜드로 취급합니다.

저가 상품은 실제 레고 키링 두 종류입니다. [Red Brick 850154](https://www.lego.com/en-us/product/lego-red-brick-keyring-850154), [Gold Minifigure 850807](https://www.lego.com/en-us/product/lego-gold-minifigure-key-chain-850807)

| 박스 이름 | 가격 | 최고 상품 예 둘 | 낮은 구간 소품 예 둘 |
|---|---:|---|---|
| 레고 박스 | $100 | Millennium Falcon 75192 / Rivendell 10316 | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 반다이 박스 | $20 | RG RX-78-2 Gundam Ver.2.0 / RG Hi-ν Gundam | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 핫휠 박스 | $50 | City Ultimate Garage HKX48 / Super 6-Lane Raceway V1983 | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 바비 박스 | $50 | Dreamhouse HMX10 / DreamCamper HCD46 | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 실바니안 패밀리 박스 | $20 | Red Roof Country Home 5302 / Adventure Tree House 5450 | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 팝마트 박스 | $50 | THE MONSTERS ANGEL IN CLOUDS Vinyl Face Doll / I FOUND YOU Vinyl Face Doll | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 스미스키 박스 | $20 | SMISKI Touch Light / Sensor Light | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 젤리캣 박스 | $20 | Bashful Beige Bunny Large / Bartholomew Bear Huge | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 플레이모빌 박스 | $50 | Large Princess Castle 70447 / Skull Pirate Ship 70411 | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 브리오 박스 | $50 | Cargo Railway Deluxe Set 33097 / Grand Roundhouse 33736 | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 슐라이히 박스 | $50 | Lakeside Country House and Stable 42551 / Lakeside Riding Center 42540 | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 라벤스부르거 박스 | $20 | GraviTrax Starter Set / Disney Villainous The Worst Takes It All | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 시쿠 박스 | $50 | SIKUCONTROL John Deere 7R 350 / Claas Xerion 5000 TRAC VC | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 토미카 박스 | $20 | DX Tomica Tower / Double Action Tomica Building | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 타미야 박스 | $50 | Lunch Box 58347 / The Grasshopper 58346 | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 굿스마일 박스 | $20 | Nendoroid Hatsune Miku 2.0 No.300 / Nendoroid Kirby No.544 | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 너프 박스 | $20 | Nerf Pro Stryfe X / Elite 2.0 Motoblitz CS-10 | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 슈타이프 박스 | $20 | Fynn Teddy Bear 28cm / Jimmy Teddy Bear 30cm | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 마일레그 박스 | $50 | Dollhouse, House of Miniature / Castle with Kitchen, Mouse | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |
| 메가 박스 | $20 | Microsoft Xbox 360 Replica Building Toy Kit HWW15 / Halo Energy Sword | LEGO Red Brick Key Chain 850154 / Gold Minifigure Key Chain 850807 |

대표 확인 근거는 [반다이 설명서](https://manual.bandai-hobby.net/menus/detail/1585), [BRIO](https://www.brio.co.uk/en-GB/pdp/63309700), [SMISKI Touch Light](https://smiski.com/e/products/touch-light/), [SMISKI Sensor Light](https://smiski.com/e/products/sensor-light/), [MEGA Xbox 360](https://creations.mattel.com/en-fr/products/mega-showcase-microsoft-xbox-360-hww15)입니다.

**14. 아웃도어와 캠핑, 20개**

공통 소품은 Light My Fire Swedish Spork Original과 Coghlan’s Four Function Whistle 0044입니다. [스포크](https://lightmyfire.com/en/shop/overview/best-sellers/spork-original-bio), [휘슬](https://coghlans.com/products/four-function-whistle)

| 박스 이름 | 가격 | 최고 상품 예 둘 | 낮은 구간 소품 예 둘 |
|---|---:|---|---|
| 스노우피크 박스 | $250 | Land Lock / Land Breeze Pro. 4 | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 헬리녹스 박스 | $100 | Cot One Convertible / Sunset Chair | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 예티 박스 | $100 | Tundra 45 / Roadie 24 | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| MSR 박스 | $100 | Hubba Hubba 2 / Elixir 2 | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 써머레스트 박스 | $50 | NeoAir XTherm NXT Regular / NeoAir XLite NXT Regular | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 콜맨 박스 | $50 | Skydome 6-Person Camping Tent / Sundome 4-Person Camping Tent | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 스탠리 박스 | $20 | Classic Legendary Bottle 1.1 QT / Classic Lunch Box 10 QT | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 페츨 박스 | $20 | ACTIK CORE / TIKKA | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 레더맨 박스 | $50 | Wave Plus / Skeletool CX | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 바이오라이트 박스 | $50 | CampStove 2+ / AlpenGlow 500 | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 니모 박스 | $100 | Dagger OSMO 2P / Hornet OSMO 2P | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 힐레베르그 박스 | $250 | Nallo 2 / Nammatj 2 | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 빅아그네스 박스 | $100 | Copper Spur HV UL2 / Tiger Wall UL2 Solution Dye | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 씨투써밋 박스 | $100 | Spark Pro Down Sleeping Bag / Ether Light XT Insulated Air Sleeping Mat Regular | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 오스프리 박스 | $50 | Atmos AG 65 / Aura AG 65 | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 도이터 박스 | $50 | Aircontact Core 65+10 / Futura Pro 40 | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 그레고리 박스 | $50 | Baltoro 65 / Deva 60 | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 블랙다이아몬드 박스 | $20 | Storm 500-R / Spot 400 | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 몽벨 박스 | $100 | Stellaridge Tent 2 / Seamless Down Hugger 800 #3 | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |
| 도메틱 박스 | $250 | CFX3 55 / CFX3 35 | Light My Fire Swedish Spork Original / Coghlan’s Four Function Whistle |

대표 확인 근거는 [Snow Peak](https://www.snowpeak.com/collections/tents), [Helinox](https://guides.helinox.com/en), [Hilleberg](https://hilleberg.com/eng/products/tent/Nammatj), [NEMO](https://www.nemoequipment.com/pages/osmo-fabric), [Dometic CFX3](https://www.dometic.com/en-us/category/coolers/electric-coolers/cfx3)입니다.

**15. 스포츠와 피트니스, 20개**

라켓 브랜드에는 실제 그립과 진동 방지 소품을, 나머지에는 운동용 헤드밴드와 손목밴드를 공통 후보로 넣었습니다. Nike 두 제품은 공식 표시가 각각 $10입니다. 수영 박스에서는 수중 장비가 아닌 육상 훈련용 소품입니다. [Nike Swoosh Classic Headband](https://www.nike.com/t/swoosh-classic-headband-C82xf0Pv), [Nike Swoosh Classic Wristbands 2-Pack](https://www.nike.com/t/swoosh-classic-wristbands-2-pack-kvPAbaXm/N1012405-101?nikegos=true)

| 박스 이름 | 가격 | 최고 상품 예 둘 | 낮은 구간 소품 예 둘 |
|---|---:|---|---|
| 윌슨 박스 | $50 | Pro Staff 97 V14 / Blade 98 16x19 V9 | Wilson Pro Overgrip 3 Pack / Pro Feel Dampener 2 Pack |
| 바볼랏 박스 | $50 | Pure Aero 2023 / Pure Drive 2021 | Wilson Pro Overgrip 3 Pack / Pro Feel Dampener 2 Pack |
| 요넥스 박스 | $50 | ASTROX 100ZZ / ASTROX 99 PRO | Wilson Pro Overgrip 3 Pack / Pro Feel Dampener 2 Pack |
| 헤드 박스 | $50 | Speed PRO 2024 / Gravity PRO 2023 | Wilson Pro Overgrip 3 Pack / Pro Feel Dampener 2 Pack |
| 아디다스 스포츠 박스 | $50 | FUSSBALLLIEBE Pro Ball / Al Rihla Pro Ball | Nike Swoosh Classic Headband / Classic Wristbands 2-Pack |
| 미카사 박스 | $20 | V200W / V300W | Nike Swoosh Classic Headband / Classic Wristbands 2-Pack |
| 타이틀리스트 박스 | $20 | Pro V1 12구 / Pro V1x 12구 | Nike Swoosh Classic Headband / Classic Wristbands 2-Pack |
| 스카티카메론 박스 | $100 | Super Select Newport 2 / Phantom 5 2024 | Nike Swoosh Classic Headband / Classic Wristbands 2-Pack |
| 가민 스포츠 박스 | $100 | Forerunner 965 / Forerunner 265 | Nike Swoosh Classic Headband / Classic Wristbands 2-Pack |
| 폴라 박스 | $100 | Vantage V3 / Grit X2 Pro | Nike Swoosh Classic Headband / Classic Wristbands 2-Pack |
| 로그 박스 | $100 | Ohio Bar Black Zinc / Ohio Power Bar 45LB Black Zinc | Nike Swoosh Classic Headband / Classic Wristbands 2-Pack |
| 엘리코 박스 | $250 | IWF Weightlifting Training Bar 20kg / IPF Powerlifting Competition Bar 20kg | Nike Swoosh Classic Headband / Classic Wristbands 2-Pack |
| 컨셉투 박스 | $250 | RowErg Standard Legs / SkiErg with Floor Stand | Nike Swoosh Classic Headband / Classic Wristbands 2-Pack |
| 만두카 박스 | $50 | PRO Yoga Mat 6mm / GRP Adapt Yoga Mat 5mm | Nike Swoosh Classic Headband / Classic Wristbands 2-Pack |
| 발라 박스 | $20 | Bala Bangles 2lb / Bala Beam 15lb | Nike Swoosh Classic Headband / Classic Wristbands 2-Pack |
| TRX 박스 | $50 | PRO4 System / HOME2 System | Nike Swoosh Classic Headband / Classic Wristbands 2-Pack |
| 테라바디 박스 | $100 | Theragun PRO Plus / Theragun mini 3rd Gen | Nike Swoosh Classic Headband / Classic Wristbands 2-Pack |
| 하이퍼아이스 박스 | $100 | Normatec 3 Legs / Hypervolt 2 Pro | Nike Swoosh Classic Headband / Classic Wristbands 2-Pack |
| 하야부사 박스 | $50 | T3 Boxing Gloves 16oz / T3 Boxing Headgear | Nike Swoosh Classic Headband / Classic Wristbands 2-Pack |
| 스피도 박스 | $50 | Fastskin LZR Pure Intent Jammer / Fastskin LZR Pure Valor Jammer | Nike Swoosh Classic Headband / Classic Wristbands 2-Pack |

대표 제품 확인 근거는 [Yonex ASTROX](https://www.yonex.com/badminton/racquets/astrox), [Garmin](https://www.garmin.com/en-US/compare/?compareProduct=886725&compareProduct=886785), [Concept2 RowErg](https://www.concept2.com/ergs/rowerg), [Manduka](https://www.manduka.com/collections/yoga-mats-pro-series?order=position), [Theragun PRO Plus](https://www.therabody.com/products/theragun-pro-plus?redirect=false)입니다.

**16. 뷰티와 향수, 20개**

낮은 구간은 The Ordinary Niacinamide 10% + Zinc 1% 30mL와 Natural Moisturizing Factors + HA 30mL입니다. 표에서는 두 번째를 NMF + HA로 줄였습니다. 임의 소분 향수나 존재가 불확실한 미니어처는 넣지 않았습니다. [The Ordinary 입문 제품](https://theordinary.com/en-us/skincare-regimen-for-beginners.html), [공식 제품 목록](https://theordinary.com/?lang=en&region=US)

| 박스 이름 | 가격 | 최고 상품 예 둘 | 낮은 구간 소품 예 둘 |
|---|---:|---|---|
| 샤넬 뷰티 박스 | $50 | BLEU DE CHANEL EDP 100mL / COCO MADEMOISELLE EDP 100mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 디올 뷰티 박스 | $50 | Sauvage EDP 100mL / J’adore EDP 100mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 조말론 런던 박스 | $50 | English Pear & Freesia Cologne 100mL / Wood Sage & Sea Salt Cologne 100mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 르라보 박스 | $50 | SANTAL 33 EDP 50mL / ANOTHER 13 EDP 50mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 메종 프란시스 커정 박스 | $100 | Baccarat Rouge 540 EDP 70mL / OUD satin mood EDP 70mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 톰포드 뷰티 박스 | $50 | Oud Wood EDP 50mL / Black Orchid EDP 50mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 바이레도 박스 | $50 | Blanche EDP 50mL / Bal d’Afrique EDP 50mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 딥티크 박스 | $50 | Philosykos EDP 75mL / Do Son EDP 75mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 크리드 박스 | $100 | Aventus EDP 100mL / Silver Mountain Water EDP 100mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 입생로랑 뷰티 박스 | $50 | Libre EDP 90mL / Black Opium EDP 90mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 프라다 뷰티 박스 | $50 | Paradoxe EDP 90mL / L’Homme EDT 100mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 메종 마르지엘라 향수 박스 | $50 | REPLICA Lazy Sunday Morning EDT 100mL / Jazz Club EDT 100mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 이솝 박스 | $20 | Resurrection Aromatique Hand Balm 75mL / Geranium Leaf Body Cleanser 500mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 록시땅 박스 | $20 | Shea Butter Hand Cream 150mL / Almond Shower Oil 250mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 키엘 박스 | $20 | Ultra Facial Cream 125mL / Midnight Recovery Concentrate 30mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 에스티로더 박스 | $50 | Advanced Night Repair Serum 50mL / Revitalizing Supreme+ Youth Power Creme 50mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 랑콤 박스 | $50 | Advanced Génifique Serum 50mL / Idôle EDP 75mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| SK-II 박스 | $100 | Facial Treatment Essence 230mL / SKINPOWER Advanced Cream 80g | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 라메르 박스 | $100 | Crème de la Mer 60mL / The Concentrate 50mL | The Ordinary Niacinamide 30mL / NMF + HA 30mL |
| 다이슨 헤어 박스 | $100 | Airwrap i.d. Multi-Styler and Dryer / Supersonic Nural Hair Dryer | The Ordinary Niacinamide 30mL / NMF + HA 30mL |

향수 제품군의 대표 확인 근거는 [CHANEL](https://www.chanel.com/lx/perfumes/), [Le Labo](https://www.lelabofragrances.com/classic-collection.html), [ANOTHER 13](https://www.lelabofragrances.com/anothr-13-191.html), [Maison Francis Kurkdjian](https://www.franciskurkdjian.com/int-fr/collection-oud-satin-mood/landing-Oudsatinmood.html)입니다.

**C. 한 박스의 구성 규칙**

박스 가격을 `P`, 상품의 확인된 참고가를 `V`라고 하겠습니다. 구간은 이름의 숫자가 아니라 `V ÷ P`로 배정합니다.

현재 [LADDER 정의](<../web/lib/products.ts:171>)를 그대로 읽으면 다음 범위입니다. 특히 **500배 구간은 400배 이상이며 상한이 없습니다.**

| 구간 | 상품 참고가 범위 | 상품 수 목표 | 구성 원칙 |
|---|---|---:|---|
| 낮은 실물 A | 실제 최저 상품가부터 시작, 보통 P 미만 | 4종 | 작지만 독립적으로 받을 수 있는 완제품이나 공식 소품 |
| 낮은 실물 B | A보다 높은 가격, P 미만 | 4종 | 같은 카테고리의 실용 소품이나 브랜드 소형 제품 |
| 1배 | P 이상 1.5P 미만 | 6종 | 브랜드 입문 상품 |
| 2배 | 1.5P 이상 3P 미만 | 6종 | 자주 찾는 기본 상품 |
| 4배 | 3P 이상 6P 미만 | 5종 | 브랜드의 대표적인 구매 대상 |
| 8배 | 6P 이상 12P 미만 | 4종 | 상위 모델이나 큰 용량 |
| 15배 | 12P 이상 25P 미만 | 3종 | 프리미엄 모델 |
| 40배 | 25P 이상 60P 미만 | 2종 | 고가 대표 상품 |
| 100배 | 60P 이상 150P 미만 | 2종 | 플래그십이나 희소 상품 |
| 250배 | 150P 이상 400P 미만 | 2종 | 최상위 실물 |
| 500배 | 400P 이상 | 2종 | 차량이나 초고가 수집품 등 실제 확보 가능한 상품 |
| **전체 구간이 있는 경우** |  | **40종** | **저가 8종과 사다리 32종** |

이 숫자는 구성 목표입니다. 모든 브랜드에 모든 구간을 강제로 만들지는 않습니다.

예를 들어 $100 박스에서 실제 최고 상품이 $800이면 8배 구간까지만 사용합니다. 100배 상품을 만들려고 다른 카테고리의 시계나 금을 끼워 넣지 않습니다. 빈 구간에는 USDT도 넣지 않습니다. **존재하는 상품 전체를 기준으로 확률 합계와 기대값을 다시 계산합니다.**

낮은 실물 A와 B도 정확히 0.05P와 0.25P일 필요는 없습니다. $20 박스의 가장 싼 실제 상품이 $6이면 0.3P입니다. 이를 $1 상품처럼 표시하거나 가상의 $1 굿즈로 바꾸지 않습니다.

추가로 다음 규칙을 권합니다.

1. **상위 구간은 해당 브랜드 중심으로 구성합니다.** 다른 브랜드 소품의 허용 범위를 낮은 구간에 집중해야 브랜드 박스의 의미가 살아납니다.
2. **같은 상품을 여러 구간에 중복 등록하지 않습니다.** 실제 사양이나 등급이 다를 때만 별도 상품으로 취급합니다.
3. **상품 수와 확률을 분리합니다.** 40배 상품이 두 개라고 40배 결과가 두 배 자주 나오는 것은 아닙니다.
4. **구간 합계 확률과 개별 상품 확률을 함께 공개합니다.** 현재 사다리의 목표 확률을 새 실물 확률처럼 그대로 복사하지 않습니다.
5. **가장 흔한 결과를 박스 첫 화면에 적습니다.** 자동차 박스라면 세차용품이 자주 나온다는 사실까지 보여줘야 합니다.

**D. USDT 결과를 없앨 때 부딪치는 점과 대안**

현재 구조와 충돌하는 부분은 다섯 곳입니다.

| 현재 구조 | 실물 전용과 충돌하는 이유 |
|---|---|
| 박스 가격보다 싼 실물 등록을 거부 | 새 기획의 핵심인 저가 실물을 넣을 수 없습니다. |
| 0.05배와 0.25배 USDT 자동 생성 | 낮은 결과를 상품 데이터만 바꿔서 없앨 수 없습니다. |
| 당첨 구간의 일부도 USDT 지급 | 실물이 있는 구간도 현금 몫이 남습니다. |
| 상품이 없는 구간은 USDT로 대체 | 빈 상위 구간을 허용하려면 배정 방식을 바꿔야 합니다. |
| 터짐 게이지가 USDT 지급 | 저가 결과만 없애도 실물 전용이 되지 않습니다. |

이는 [상품 가격 제한과 확률 생성 코드](<../web/lib/products.ts:118>)에 직접 들어 있는 규칙입니다. 따라서 **카탈로그 교체만으로 완료할 수 없고, 새 확률 설계가 필요합니다.** 이번 기획에서는 계산을 수정하지 않았습니다.

또한 기존 99%는 단순한 상품 참고가 평균이 아닙니다. 실물은 참고가의 95%로 환산하고, USDT와 터짐 게이지를 더한 값입니다. 터짐의 기대값은 `0.625% × 10P + 10% × P`, 즉 개봉 가격의 16.25%입니다. 신규 실물 구조에서 게이지를 없앤다면 이 몫을 새 상품 확률에 재배정하되 이중으로 더하면 안 됩니다. 기존에 쌓인 게이지 잔액은 별도 처리 대상입니다. [현재 확률 설명](<../opening/ODDS.md:11>)

대안을 비교하기 위해 다음을 **계산 가정**으로 놓겠습니다.

개봉 가격만을 기준으로 한 상품 참고가 기대비율은 99%, 소형 합배송 한 건은 $5입니다. 이 배송비는 실제 국제배송 견적이 아니라 대안 비교용 숫자입니다. 차량, 대형 가전, 중량 운동기구에는 적용하지 않습니다.

| 대안 | 가장 싼 실물의 값 가정 | 박스 최저 가격 | 합배송 방법 | 상품 참고가 기대값 | 고객이 배송비를 낼 때 지출 대비 기대비율 |
|---|---:|---:|---|---:|---:|
| 1. 실물 중심 기본형 | $1부터, 카테고리별로 더 높게 설정 | $20 | 소형 상품 10개를 $5에 묶음 | 개봉당 $19.80 | $19.80 ÷ $20.50 = **96.59%** |
| 2. 저가 진입형 | $1부터 | $5 | 소형 상품 10개를 $5에 묶음 | 개봉당 $4.95 | $4.95 ÷ $5.50 = **90.00%** |
| 3. 카드 한정 체험형 | $0.50짜리 실재 카드부터 | $1 | 카드 20개를 $5에 묶음 | 개봉당 $0.99 | $0.99 ÷ $1.25 = **79.20%** |

**대안 1을 기본으로 권합니다.** 위 320개 가격표도 최소 $20으로 잡았습니다. 표의 $1은 모든 카테고리에 그런 소품이 있다는 주장이 아닙니다. 실제로 $6짜리가 최저라면 $6을 그대로 쓰고 해당 박스의 확률을 다시 계산합니다.

대안 2는 $1 안팎의 유용한 완제품을 안정적으로 확보할 수 있는 카테고리만 가능합니다. 가방이나 오디오에 공통 적용하기는 어렵습니다. 싸게 여는 대신 배송이 차지하는 비중이 커집니다.

대안 3은 $1 상품을 유지하기 위한 제한적인 선택입니다. 카드 한 장도 즉시 소유 상품으로 확정해야 합니다. 조각, 포인트, 나중에 실물로 바꾸는 교환권으로 대체하면 파운더의 실물 지급 방향과 달라집니다. 또한 $1 브랜드 박스의 상당수가 저가 카드 체험으로 바뀌므로 전체 서비스의 기본형으로는 권하지 않습니다.

환원율은 다음처럼 구분해야 합니다.

1. **상품 참고가 기준 99%를 채택하면**, 기존의 95% 선택 환전을 유지할 경우 현금 환산 기대비율은 약 **94.05%**입니다. 기존 99%와 같은 의미가 아닙니다.
2. **기존 현금 환산 기준 99%를 유지하려면**, 전부 실물일 때 참고가 기대비율은 약 **104.21%**가 필요합니다. 센트 반올림을 제외한 계산이며, 상품별 확률을 다시 풀어야 합니다.
3. **배송비를 회사가 내면**, 고객의 개봉 가격 기준 비율은 유지되지만 대안 1에서는 개봉당 $0.50, 대안 2에서는 $0.50, 대안 3에서는 $0.25의 배송 비용이 생깁니다. 각각 개봉 가격의 2.5%, 10%, 25%입니다.

합배송은 선택 기능으로 둡니다. 상품 하나만 있어도 배송비를 내고 받을 수 있어야 합니다. 더 열어야만 배송할 수 있게 만들거나 보관 상품을 자동 소멸시키는 방식은 쓰지 않는 편이 좋습니다.

**E. 홈에서 320개를 고르는 탐색 구조**

첫 화면은 **검색창, 카테고리 선택, 박스 목록**으로 시작합니다. 320개 전체를 설명하는 배너나 여러 단계의 취향 설문은 필요하지 않습니다.

검색은 박스 이름뿐 아니라 브랜드와 실제 구성품까지 찾습니다. `캐논`, `EOS R5`, `아이폰`, `리자몽`, `세탁기`가 모두 검색어가 됩니다. 한글명, 영문명, 자주 쓰는 약칭을 연결합니다.

카테고리를 고르면 브랜드와 가격 필터가 그 안에서 작동합니다. 가격은 자유 입력 대신 정해진 가격인 $1, $5, $10, $20, $50, $100, $250, $500을 사용하되, 현재 결과가 없는 가격은 선택할 수 없게 표시합니다. 초기 320개 구성에는 $20 이상만 나타납니다.

브랜드는 카테고리와 별개의 공통 식별자로 관리합니다. `삼성`을 검색하면 갤럭시, 갤럭시북, 가전 풀팩이 함께 나오되 각 박스의 카테고리가 구분됩니다. 동일 브랜드 안에서 가격 옵션을 고르는 화면은 만들지 않습니다.

홈의 처음 노출은 24개 정도로 제한하고, 이후 목록을 더 보여줍니다. 모바일은 두 칸 격자를 유지합니다. 돌아왔을 때 검색어, 필터, 정렬과 스크롤 위치를 복원합니다.

카드에는 대표 실물 사진 한 장, 박스 이름, 개봉 가격을 둡니다. 실제 후기가 쌓였을 때만 별점을 표시합니다. 최고 상품가, 최대 배수, 구성품 수와 가장 흔한 결과는 박스 상세에서 보여줍니다. 이는 [현재 홈 카드 원칙](<../DESIGN.md:85>)을 유지하는 구성입니다.

상세 첫 화면에서는 다음을 바로 알 수 있어야 합니다.

1. 한 번 여는 가격.
2. 가장 흔한 실물 결과와 그 확률.
3. 해당 브랜드 이외의 소품도 포함된다는 사실.
4. 구성품과 확률을 여는 링크.
5. 배송비와 합배송 조건.

정렬은 추천순, 가격 낮은순, 가격 높은순, 실제 개봉 수 기준 인기순 정도면 충분합니다. 최고 상품 가격순을 기본으로 두면 극히 드문 상품만으로 박스를 고르게 되므로 피합니다.

**F. 상품 자료와 사진을 만드는 순서**

**박스 이름 320개를 등록하는 일과 판매 가능한 박스 320개를 완성하는 일은 다릅니다.** 위 표의 네 상품은 출발점입니다. 중간 구간과 저가 구간을 채우고, 조달과 확률을 확인해야 활성화할 수 있습니다.

상품 수는 박스당 **24종에서 40종을 목표로 하고 평균 32종**으로 작업량을 잡겠습니다. 다만 색상만 바꿔 개수를 채우는 최소 수량 규칙은 두지 않습니다.

| 작업량 가정 | 박스별 구성 항목 수 |
|---|---:|
| 평균 24종 × 320개 | 7,680개 |
| 평균 32종 × 320개 | 10,240개 |
| 평균 40종 × 320개 | 12,800개 |

이는 박스와 상품의 연결 항목 수입니다. 동일 소품을 여러 박스가 공유하므로 서로 다른 실제 SKU 수와 사진 수는 이보다 적습니다. 고유 SKU 수는 중복을 제거한 뒤 산정해야 합니다.

만드는 순서는 다음과 같습니다.

**1. 상품 원본부터 확정합니다.**

상품마다 브랜드, 정확한 이름, 모델 번호, 사양, 상태, 수량, 공급 국가, 공식 제품 근거, 공급처, 참고가, 조달가, 가격 확인일을 기록합니다. 참고가와 조달가는 분리합니다.

자동차는 연식과 트림, 가방은 크기와 소재, 시계는 레퍼런스와 상태, 카드는 언어와 세트 번호, 가전은 전압과 설치 조건을 확정합니다. 풀팩은 구성품을 전부 펼쳐서 기록합니다.

**2. 박스 가격에 맞춰 구간을 배정합니다.**

같은 상품 원본을 여러 박스가 사용하더라도 상품가를 바꾸지 않습니다. 상품가를 박스 가격으로 나눈 값에 따라 구간이 달라집니다. 실제 공급 가능한 상품으로 빈 구간을 채울 수 없으면 해당 구간을 사용하지 않습니다.

**3. 사진보다 먼저 확률과 조달 가능성을 확인합니다.**

각 상품 확률의 합계, 참고가 기대값, 선택 환전 기대값, 매입 비용, 포장과 배송 비용을 각각 계산합니다. 백만 칸 확률표에서 고가 상품마다 최소 한 칸을 배정했을 때도 목표 기대값을 넘지 않는지 확인합니다.

특히 차량과 고가 시계는 평균 수익만 볼 것이 아니라 한 건 지급에 필요한 현금과 공급 약정을 확인해야 합니다.

**4. 첫 묶음은 16개 박스로 합니다.**

카테고리마다 하나씩 골라 평균 32종, 약 512개의 구성 항목을 끝까지 완성합니다. 사진은 각 박스의 상위 상품 두 개와 흔한 결과 두 개부터 시작하면 64개의 촬영 대상을 우선 검수할 수 있습니다. 공통 제품은 재사용합니다.

**5. 이후 48개, 80개, 80개, 96개를 추가합니다.**

누적 박스 수는 16개, 64개, 144개, 224개, 320개가 됩니다. 내부 작업은 8개 박스씩 나누면 평균 256개 구성 항목 단위로 검수할 수 있습니다. 다음 묶음으로 넘어가는 기준은 수량이 아니라 상품 식별, 조달, 확률, 배송 검증 통과입니다.

**6. 사진은 확정된 SKU 기준으로 만듭니다.**

사용 권한이 확보된 실제 사진을 먼저 사용하고, 모델과 사양이 맞는지 확인한 뒤 저장소의 검정 스튜디오 배경 규칙에 맞춥니다. 대표 사진은 최고 상품의 확정 사진을 재사용합니다.

사진은 한 번에 40장부터 60장 정도를 모아 검수합니다. 비슷한 모델의 잘못된 사진을 대량 등록하는 일을 막기 위한 단위입니다. 생성 참고 이미지를 사용하는 경우에도 실제 사진과 구분하고, 정확한 상품 형태를 확인할 수 없는 사진으로 제품을 대신 설명하지 않습니다.

**G. 위험과 파운더에게 물을 것**

1. **확률 변경 범위**  
   실물 전용으로 가려면 박스 가격보다 싼 실물 제한, USDT 자동 생성, 빈 구간 처리, 신규 터짐 지급을 함께 바꿔야 합니다. 기존 돈 계산을 보존한다는 규칙에서 이번 상품 개편에 필요한 변경 범위를 어디까지로 정할지 필요합니다. 기존 게이지 잔액 처리도 별도로 정해야 합니다.

2. **99%의 의미와 선택 환전**  
   앞으로 99%를 상품 참고가 기준으로 부를지, 기존처럼 95% 환전 후 기준으로 부를지 결정해야 합니다. USDT가 추첨 결과로 나오는 것을 없애는 것과, 사용자가 받은 실물을 선택적으로 USDT로 바꾸는 기능은 별개의 결정입니다.

3. **배송 국가와 비용 부담**  
   최초 판매 국가, 고객 부담 배송비, 합배송 조건, 차량 인도비와 대형 가전 설치비의 부담 주체를 정해야 합니다. 소형 상품 합배송 모델로 차량과 가전을 계산하면 안 됩니다.

4. **고가 상품의 지급 준비**  
   자동차와 명품의 공급처, 선확보 자금, 진품 증빙, 공급 실패 시 처리와 인도 기한을 정해야 합니다. 실제 확보하거나 지급 약정을 맺기 전에는 해당 상품을 당첨 가능한 상태로 열지 않는 원칙을 권합니다.

5. **가격 수용성과 박스별 차이**  
   세이코 $100, 일반 운동화 $100처럼 개봉 가격이 상위 상품가에 가까운 박스는 특히 검증이 필요합니다. 공통 소품 두 개만 반복하면 브랜드 차이가 희귀 상품에만 남습니다. 16개 시범 박스에서 가격 수용성과 가장 흔한 실물의 만족도를 확인하고, 320개 전체의 확정 가격과 저가 구성을 결정하는 순서를 권합니다.
