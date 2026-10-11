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
- cs-access | Sony Access Controller (소니 액세스 컨트롤러)
- cs-switch2-pro | Nintendo Switch 2 Pro Controller (닌텐도 스위치 2 프로 컨트롤러)
- cs-dualsense | Sony DualSense Wireless Controller (소니 듀얼센스 무선 컨트롤러)
- cs-gamesir-g7pro | GameSir G7 Pro Controller (게임써 G7 프로 컨트롤러)
- cs-steamdeck-dock | Valve Steam Deck Docking Station (밸브 스팀 덱 도킹 스테이션)
- cs-xbox-controller | Xbox Wireless Controller (엑스박스 무선 컨트롤러)
- cs-switch2-camera | Nintendo Switch 2 Camera (닌텐도 스위치 2 카메라)
- cs-joycon2-grip | Nintendo Joy-Con 2 Charging Grip (닌텐도 조이콘 2 충전 그립)
- cs-jsaux-dock | JSAUX HB0603 Docking Station for Steam Deck (제이소 HB0603 스팀 덱 독)
- cs-dualsense-dock | Sony DualSense Charging Station (소니 듀얼센스 충전 거치대)
- cs-ps5-stand | Sony Vertical Stand for PS5 (소니 PS5 수직 받침대)
- cs-joycon2-wheel | Nintendo Joy-Con 2 Wheel Set of 2 (닌텐도 조이콘 2 휠 2개 세트)
- cs-xbox-battery | Xbox Rechargeable Battery and USB-C Cable (엑스박스 충전식 배터리와 USB-C 케이블)
- cs-8bitdo-adapter2 | 8BitDo USB Wireless Adapter 2 (팔빗도 USB 무선 어댑터 2)
- cs-powera-case | PowerA Slim Case for Nintendo Switch 2 (파워에이 슬림 휴대용 케이스 스위치 2용)
- cs-kontrolfreek | KontrolFreek FPS Freek Galaxy for PS5 (컨트롤프릭 FPS 프리크 갤럭시 PS5용)
- cs-hori-playstand | HORI PlayStand for Nintendo Switch (호리 플레이스탠드 닌텐도 스위치용)
- cs-controller-grip | PlayVital Grip Tape for PS5 Controller (플레이바이탈 PS5 컨트롤러 그립 테이프)
- cs-hdmi-cable | Monoprice Certified 8K HDMI Cable 6ft (모노프라이스 8K 인증 HDMI 케이블 1.8m)
- cs-usb-c-cable | Anker USB-C Charging Cable 6ft (앤커 USB-C 충전 케이블 1.8m)
- cs-thumb-grips | Skull & Co. Thumb Grip Set for PS5 (스컬앤코 PS5 컨트롤러 썸 그립 세트)
- cs-cleaning-cloth | Microfiber Controller Cleaning Cloths 3-Pack (컨트롤러용 극세사 청소 천 3개)
