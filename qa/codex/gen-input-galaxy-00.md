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

이번 목록의 범주 규칙(공통 규칙과 다르면 이것이 먼저다): 전자기기, 게이밍 기기, 오디오, 카메라, 주변기기
- 배경은 무늬 없는 중간 회색 단색(#8c8c8c 근처)으로 한다. 흰색, 은색, 검정 제품 모두 윤곽이 뚜렷해야 한다.
- 제품 하나만, 정면에서 살짝 비낀 3/4 시점, 제품 전체가 화면 안에. 포장 상자, 손, 책상, 다른 기기는 없다. 이름에 "세트"나 "번들"이 있으면 그 구성품만 함께 둔다.
- 화면이 있는 기기(휴대폰, 태블릿, 노트북, 모니터, 휴대용 게임기, 스마트워치): 화면은 켜져 있되 글자, 아이콘, 시계, 알림이 없는 은은한 추상 그라데이션 배경화면만. 노트북은 100도쯤 열어 화면과 키보드가 함께 보이게. 접는 휴대폰은 접는 방식(책처럼 펼침, 위아래로 접음)이 이름과 맞게 반쯤 펼친 모습.
- 브랜드 이름과 로고는 읽히게 넣지 않는다. 뒷면 로고가 큰 제품은 앞면이 보이는 각도로. 모델명 글자, 사양 스티커, 인증 마크도 넣지 않는다.
- 이름의 사양이 모양에 드러나는 것은 맞춘다: 휴대폰과 카메라의 렌즈 개수와 배치, 그래픽 카드의 팬 개수, 키보드의 배열(텐키리스, 65% 등), 헤드폰의 형태(오버이어, 온이어, 이어버드), 스피커의 형태, 렌즈의 길이와 굵기(망원은 길게, 단렌즈는 짧게).
- 렌즈와 카메라의 숫자 각인(초점 거리, 조리개)은 넣지 않는다. 틀린 숫자가 들어가느니 없는 편이 낫다.
- 조명 효과(RGB)는 끄거나 아주 약하게. 색 끼가 제품 전체를 물들이지 않게.
- 부품(CPU, SSD, 메모리)은 그 부품 하나만. 케이블, 어댑터, 충전기는 그것 하나만, 케이블은 둥글게 한 번 감아 둔다.
- 본체가 포함되지 않는 부속품(케이스, 밴드, 스트랩, 그립, 필터, 독)은 부속품만 그린다. 본체를 함께 그리지 않는다.

목록 (id, 이름, 만들 때 참고):
- gx-book6-ultra | Samsung Galaxy Book6 Ultra Base Configuration (삼성 갤럭시 북6 울트라 기본형)
- gx-fold7-512 | Samsung Galaxy Z Fold7 512GB (삼성 갤럭시 Z 폴드7 512GB)
- gx-s26-ultra-512 | Samsung Galaxy S26 Ultra 512GB (삼성 갤럭시 S26 울트라 512GB)
- gx-book6-pro | Samsung Galaxy Book6 Pro 14-inch Base Configuration (삼성 갤럭시 북6 프로 14인치 기본형)
- gx-s26-ultra-256 | Samsung Galaxy S26 Ultra 256GB (삼성 갤럭시 S26 울트라 256GB)
- gx-odyssey-g8 | Samsung Odyssey OLED G8 G81SF 32-inch (삼성 오디세이 OLED G8 G81SF 32인치)
- gx-s26-plus | Samsung Galaxy S26+ 256GB (삼성 갤럭시 S26 플러스 256GB)
- gx-tab-s11-ultra | Samsung Galaxy Tab S11 Ultra 256GB Wi-Fi (삼성 갤럭시 탭 S11 울트라 256GB 와이파이)
- gx-book5-360 | Samsung Galaxy Book5 360 15.6-inch 512GB (삼성 갤럭시 북5 360 15.6인치 512GB)
- gx-flip7 | Samsung Galaxy Z Flip7 256GB (삼성 갤럭시 Z 플립7 256GB)
- gx-s26 | Samsung Galaxy S26 256GB (삼성 갤럭시 S26 256GB)
- gx-odyssey-g6 | Samsung Odyssey OLED G6 G60SF 27-inch (삼성 오디세이 OLED G6 G60SF 27인치)
- gx-flip7-fe | Samsung Galaxy Z Flip7 FE 128GB (삼성 갤럭시 Z 플립7 FE 128GB)
- gx-tab-s11 | Samsung Galaxy Tab S11 128GB Wi-Fi (삼성 갤럭시 탭 S11 128GB 와이파이)
- gx-watch-ultra2 | Samsung Galaxy Watch Ultra2 47mm LTE (삼성 갤럭시 워치 울트라2 47mm LTE)
- gx-s25-fe | Samsung Galaxy S25 FE 128GB (삼성 갤럭시 S25 FE 128GB)
- gx-tab-s10-fe-plus | Samsung Galaxy Tab S10 FE+ 128GB Wi-Fi (삼성 갤럭시 탭 S10 FE 플러스 128GB 와이파이)
- gx-tab-s10-fe | Samsung Galaxy Tab S10 FE 128GB Wi-Fi (삼성 갤럭시 탭 S10 FE 128GB 와이파이)
- gx-watch8-classic | Samsung Galaxy Watch8 Classic 46mm Bluetooth (삼성 갤럭시 워치8 클래식 46mm 블루투스)
- gx-viewfinity-s8 | Samsung ViewFinity S8 S80UD 27-inch (삼성 뷰피니티 S8 S80UD 27인치)
- gx-watch9-44 | Samsung Galaxy Watch9 44mm Bluetooth (삼성 갤럭시 워치9 44mm 블루투스)
- gx-a36 | Samsung Galaxy A36 5G 128GB (삼성 갤럭시 A36 5G 128GB)
- gx-smart-m7 | Samsung Smart Monitor M7 M70F 32-inch (삼성 스마트 모니터 M7 M70F 32인치)
- gx-watch9-40 | Samsung Galaxy Watch9 40mm Bluetooth (삼성 갤럭시 워치9 40mm 블루투스)
- gx-tab-s10-lite | Samsung Galaxy Tab S10 Lite 128GB Wi-Fi (삼성 갤럭시 탭 S10 라이트 128GB 와이파이)
- gx-9100-pro | Samsung 9100 PRO SSD 2TB (삼성 9100 프로 SSD 2TB)
