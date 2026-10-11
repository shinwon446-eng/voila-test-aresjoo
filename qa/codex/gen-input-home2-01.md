AGENTS.md와 DESIGN.md를 먼저 읽어라. 특히 DESIGN.md A-2 12번(상품 사진은 한 톤)을 읽어라. 앱 코드는 고치지 마라. git 명령도 쓰지 마라. 이번 일은 이미지 생성뿐이다.

일: 아래 목록의 상품마다 이미지 생성 도구로 상품 이미지를 한 장씩 만들어 `web/scripts/images/gen-raw/<id>.png` 로 저장하라. 폴더가 없으면 만들어라. 다른 파일은 만들거나 고치지 마라.

이 이미지는 우리 변환 도구(`web/scripts/images/studio.mjs`)가 배경을 걷어내고 어두운 스튜디오 배경(검정에 가까운 회색, 가운데 은은한 빛, 4:3, 상품 폭 78%, 바닥에 희미한 그림자)에 올린다. 붙인 이미지가 그 결과물의 톤이다. 네가 만들 것은 그 전 단계의 원본이므로 배경은 어둡게 하지 말고 아래 규칙대로 밝은 단색으로 만든다.

모든 이미지에 공통인 규칙:
1. 사진처럼 보이는 제품 촬영 컷. 그림, 3D 장난감 느낌, 과한 광택, 과장된 반사는 안 된다.
2. 상품 하나만. 상품 전체가 잘리지 않고 화면 안에 다 들어온다. 가로 4:3 구도, 상품이 가운데, 사방에 여백.
3. 배경은 무늬 없는 밝은 회색 단색(#d9d9d9 근처). 소품, 손, 사람, 받침대, 상자, 진열장, 바닥 반사, 글자, 워터마크 없음. 배경에 드리우는 그림자는 아주 옅게.
4. 각도는 정면에서 살짝 비낀 3/4 시점, 눈높이보다 조금 위. 목록 전체가 같은 각도와 같은 조명으로 보이게 한다.
5. 조명은 부드러운 스튜디오 조명 하나. 색 끼 없는 중립 백색. 어두운 배경에 올렸을 때 떠 보이지 않도록 윤곽이 또렷하고 대비는 약간 낮은 쪽.
6. 브랜드 로고, 브랜드 이름, 모노그램 글자는 읽히게 넣지 않는다. 그 모델을 아는 사람이 형태, 비율, 소재, 잠금장치, 손잡이로 알아볼 수 있게 만든다. 색은 그 모델의 가장 대표적인 색 하나(검정, 골드 탄, 에토프, 베이지 가운데).
7. 골드바와 실버바, 코인: 표면 각인은 순도와 중량만. 중량은 상품 이름과 정확히 같아야 한다(예: "1 kg", "500 g", "1 oz"). 제련소 이름이나 일련번호는 넣지 않는다. 생성 뒤 이미지를 직접 열어 중량 글자가 이름과 같은지 확인하고, 다르면 다시 만든다(두 번까지). 그래도 틀리면 각인이 없는 매끈한 바로 만든다.
8. 주얼리: 상품 하나만, 케이스 없이. 팔찌와 반지는 형태가 보이게 세우거나 비스듬히 눕힌다. 목걸이는 펜던트가 가운데 오게 줄을 둥글게 놓는다.
9. 이름에 없는 것을 더하지 않는다. 지갑은 지갑만, 벨트는 벨트만, 스카프는 스카프만. 본체가 포함되지 않는 부속품에 본체를 그리지 않는다.

만든 뒤 상품마다 이미지를 직접 열어 확인하라: 상품이 잘리지 않았는가, 배경이 단색인가, 이름과 종류가 맞는가, 읽히는 브랜드 글자가 없는가. 어긋나면 다시 만든다(두 번까지).

끝나면 저장한 파일 목록과, 다시 만든 것, 끝내 못 만든 것을 표로 적어라. 긴 줄표와 가운뎃점 문자, 느낌표는 쓰지 마라.

이번 목록의 범주 규칙(공통 규칙과 다르면 이것이 먼저다): 생활가전
- 배경은 무늬 없는 중간 회색 단색(#8c8c8c 근처)으로 한다. 흰색과 은색 제품도 윤곽이 뚜렷해야 한다.
- 제품 하나만, 정면에서 살짝 비낀 3/4 시점, 제품 전체가 화면 안에. 문은 닫힘. 안에 든 음식, 빨래, 컵 같은 내용물과 소품은 없다.
- TV 는 스탠드에 선 모습, 화면은 꺼진 검정. 화면에 그림이나 글자를 넣지 않는다. 65인치와 55인치는 같은 구도로 두되 스탠드 형태는 모델에 맞게.
- 냉장고는 그 모델의 문 구성(4도어, 프렌치 도어, 양문)이 맞아야 한다. 세탁건조기는 일체형, 타워형, 드럼 단품이 서로 구분되게.
- 제품 앞면의 브랜드 이름은 읽히게 넣지 않는다. 조작부 표시는 꺼진 상태.

목록 (id, 이름, 만들 때 참고):
- hm-dyson-supersonic | Dyson Supersonic Nural Hair Dryer (다이슨 슈퍼소닉 뉴럴 헤어드라이어)
- hm-breville-bambinoplus | Breville the Bambino Plus BES500 (브레빌 밤비노 플러스 BES500)
- hm-blueair-211i | Blueair Blue Pure 211i Max Air Purifier (블루에어 블루 퓨어 211i 맥스 공기청정기)
- hm-breville-oven | Breville the Smart Oven Air Fryer BOV860 (브레빌 스마트 오븐 에어 프라이어 BOV860)
- hm-zojirushi-ns | Zojirushi NS-TSC10 Micom Rice Cooker (조지루시 NS-TSC10 마이컴 밥솥)
- hm-ninja-airfryer | Ninja Foodi DualZone DZ201 Air Fryer (닌자 푸디 듀얼존 DZ201 에어프라이어)
- hm-baratza-encore | Baratza Encore ESP Coffee Grinder (바라짜 엔코 ESP 커피 그라인더)
- hm-instantpot-pro | Instant Pot Pro 6 Quart Multicooker (인스턴트팟 프로 6쿼트 멀티쿠커)
- hm-levoit-core300s | Levoit Core 300S Air Purifier (르보이트 코어 300S 공기청정기)
- hm-shark-s3501 | Shark Steam Pocket S3501 Steam Mop (샤크 스팀 포켓 S3501 스팀 청소기)
- hm-braun-multiquick | Braun MultiQuick 5 MQ505 Hand Blender (브라운 멀티퀵 5 MQ505 핸드블렌더)
- hm-cosori-kettle | COSORI Electric Kettle 1.7L (코소리 전기 주전자 1.7L)
- hm-hamilton-iron | Hamilton Beach Durathon 19900 Steam Iron (해밀턴비치 듀라톤 19900 스팀 다리미)
- hm-instant-milk | Instant 4-in-1 Milk Frother (인스턴트 4인1 우유 거품기)
- hm-levoit-dual150 | Levoit Dual 150 Humidifier (르보이트 듀얼 150 가습기)
- hm-cuisinart-toaster | Cuisinart CPT-122 2-Slice Toaster (쿠진아트 CPT-122 2구 토스터)
- hm-dash-waffle | Dash Multi Mini Waffle Maker (대시 멀티 미니 와플 메이커)
- hm-blackdecker-iron | BLACK+DECKER Easy Steam IR40V Iron (블랙앤데커 이지 스팀 IR40V 다리미)
