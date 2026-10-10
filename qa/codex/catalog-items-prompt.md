AGENTS.md와 DESIGN.md를 먼저 읽어라. 한국어로만 답한다. 커밋하지 않는다. 아래에 적은 파일 6개만 만들고 다른 파일은 고치지 않는다.

# 일: 박스 6개의 상품 목록을 데이터 파일로 쓴다
상품 구성의 원천 형식은 web/lib/catalogTypes.ts 의 ItemSpec 이다:
  [id, 한국어 이름, 영어 이름, 중국어 이름, 시중 정가(USDT 정수 또는 소수 둘째 자리), 종류("physical" 기본, "digital", "cash")]
표본 파일 web/lib/catalog/jackpot-car.ts 와 web/lib/catalog/dollar-apple.ts 를 먼저 읽고 똑같은 모양으로 쓴다(import, export 이름은 아래 표대로, 주석으로 가격 근거 한 줄, 구간별 묶음 주석).

| 파일 | export 이름 | 박스 | 가격 USDT | 실물 수 |
|---|---|---|---|---|
| web/lib/catalog/dollar-galaxy.ts | DOLLAR_GALAXY_ITEMS | 1달러 갤럭시 박스: 삼성 갤럭시 폰, 태블릿, 워치, 버즈, 노트북, 모니터, 저장장치, 충전 용품 | 1 | 50~60 |
| web/lib/catalog/dollar-gaming.ts | DOLLAR_GAMING_ITEMS | 1달러 게이밍 박스: 그래픽카드, CPU, 게이밍 노트북, 모니터, 키보드, 마우스, 헤드셋, 의자, 스팀 기프트카드 | 1 | 50~60 |
| web/lib/catalog/starter-console.ts | STARTER_CONSOLE_ITEMS | 콘솔 박스: PS5 Pro, PS5, Switch 2, Xbox, 휴대용 게임기(Steam Deck, ROG Ally), 컨트롤러, 헤드셋, 게임 타이틀(디지털) | 3 | 50~60 |
| web/lib/catalog/starter-audio.ts | STARTER_AUDIO_ITEMS | 음악 박스: 헤드폰(소니, 보스, B&O, 젠하이저), 이어폰, 스피커(소노스, 마샬, JBL), 턴테이블, DAC, 앰프, 마이크 | 3 | 50~60 |
| web/lib/catalog/starter-camera.ts | STARTER_CAMERA_ITEMS | 사진 박스: 카메라 바디(소니, 캐논, 니콘, 후지, 라이카), 렌즈, 짐벌, 드론(DJI), 액션캠, 삼각대, 메모리카드, 가방 | 5 | 50~60 |
| web/lib/catalog/vault-home.ts | VAULT_HOME_ITEMS | 생활가전 박스: 다이슨, 발뮤다, LG, 삼성, 로봇청소기(로보락), 커피머신(브레빌, 드롱기), 공기청정기, TV, 세탁건조기, 냉장고 | 20 | 50~60 |

# 규칙
- 시중 정가는 2026년 기준 대략의 미국 시장가(1 USDT = 1 USD). 제조사 공시가나 주요 판매처 가격을 참고한 어림값으로, 세금 제외. 소수는 둘째 자리까지.
- 박스 가격보다 싼 실물은 넣지 않는다(빌더가 거부한다). 1 USDT 박스는 1 USDT 이상, 20 USDT 박스는 20 USDT 이상.
- 구간은 박스 가격의 20배 이상(위), 6배 이상, 2배 이상, 2배 미만. 위 구간에 상품이 많아야 한다(파운더: 화면을 두 번쯤 내려야 좋은 상품이 끝나게). 아래 구간에는 그보다 적게.
- 색상만 다른 상품으로 수를 늘리지 않는다. 같은 모델의 용량이나 크기 차이는 둘까지.
- id: 영문 소문자, 숫자, 하이픈. 박스 접두사(gx-, gm-, cs-, au-, cm-, hm-)로 시작하고 전체에서 고유. 기프트카드와 USDT 상품은 공용 id 를 쓴다: "gc-amazon100"(아마존 글로벌 기프트카드 $100, digital), "gc-steam50"(스팀 기프트카드 $50, digital), "gc-apple100"(Apple 기프트카드 $100, digital), "usdt-50"(50 USDT 인스턴트 드롭, cash), "usdt-100"(100 USDT 인스턴트 드롭, cash). 게이밍과 콘솔 박스에는 gc-steam50 을 넣고, 1 USDT 박스에는 usdt-50 을 넣는다. 20 USDT 박스에는 usdt-100 을 넣는다.
- 이름: 한국어는 외래어 표기(브랜드는 흔히 쓰는 표기), 영어는 제조사 표기, 중국어는 간체(브랜드 중국어 이름이 널리 쓰이면 그것, 아니면 영어 그대로). 이모지, 가운뎃점, 긴 줄표, 느낌표 금지. 이름 안에 "잭팟, 환전, 볼트, 긁어, 돌려보기, 손맛, 연타, 올인, 본전, 환수율, 오토플레이"를 쓰지 않는다. 이름에 가격을 적지 않는다(기프트카드와 USDT 상품 제외).
- 실제로 지급 가능한 신품만. 단종 모델, 한정판, 주문 제작은 넣지 않는다.
- 파일 머리의 주석에 가격 근거(어느 종류의 출처를 참고했는지)를 한 줄로 적는다. 가격이 특히 불확실한 상품은 그 줄 끝에 // 추정 이라고 적는다.

# 확인
다 쓴 뒤 `cd web && npx tsc --noEmit` 로 형식 오류가 없는지 본다(아직 이 파일들은 어디서도 import 되지 않으므로 다른 오류는 무시한다). 마지막 메시지에 박스마다 실물 수와 구간별 수, 추정 표시 개수를 표로 적는다.
