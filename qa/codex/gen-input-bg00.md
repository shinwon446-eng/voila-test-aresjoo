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

목록 (id, 이름, 만들 때 참고):
- bg-kelly-25 | Hermès Kelly 25 Epsom (에르메스 켈리 25 에프송)
- bg-constance-18 | Hermès Constance 18 (에르메스 콘스탄스 18)
- bg-evelyne | Hermès Evelyne 29 (에르메스 에블린 29)
- bg-chanel-boy | Chanel Boy Bag Small (샤넬 보이 백 스몰)
- bg-chanel-22 | Chanel 22 Bag Medium (샤넬 22 백 미디엄)
- bg-lv-capucines | Louis Vuitton Capucines MM (루이비통 카퓌신 MM)
- bg-lv-speedy | Louis Vuitton Speedy Bandoulière 25 (루이비통 스피디 반둘리에 25)
- bg-lv-onthego | Louis Vuitton OnTheGo MM (루이비통 온더고 MM)
- bg-dior-lady | Dior Lady Dior Medium (디올 레이디 디올 미디엄)
- bg-dior-book-tote | Dior Book Tote Medium (디올 북 토트 미디엄)
- bg-dior-saddle | Dior Saddle Bag (디올 새들 백)
- bg-gucci-jackie | Gucci Jackie 1961 Small (구찌 재키 1961 스몰)
- bg-gucci-marmont | Gucci GG Marmont Small (구찌 GG 마몽 스몰)
- bg-prada-galleria | Prada Galleria Saffiano Medium (프라다 갤러리아 사피아노 미디엄)
- bg-prada-re-edition | Prada Re-Edition 2005 Nylon (프라다 리에디션 2005 나일론)
- bg-celine-triomphe | Celine Teen Triomphe (셀린느 트리옹프 틴)
- bg-bottega-jodie | Bottega Veneta Jodie Small (보테가 베네타 조디 스몰)
- bg-bottega-cassette | Bottega Veneta Cassette Bag (보테가 베네타 카세트 백)
- bg-ysl-loulou | Saint Laurent Loulou Small (생로랑 룰루 스몰)
- bg-fendi-baguette | Fendi Baguette Medium (펜디 바게트 미디엄)
- bg-loewe-puzzle | Loewe Puzzle Small (로에베 퍼즐 스몰)
- bg-goyard-st-louis | Goyard Saint Louis PM (고야드 생루이 PM)
- bg-burberry-lola | Burberry Lola Small (버버리 롤라 스몰)
