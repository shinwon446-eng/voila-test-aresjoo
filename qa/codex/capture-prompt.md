AGENTS.md와 DESIGN.md를 먼저 읽어라. 그다음 REDESIGN_BRIEF.md의 4-6(스크린샷 검수)과 UI_INVENTORY.md를 읽어라. 한국어로만 답한다. 커밋하지 않는다. 아래에 적은 파일만 만들고 다른 파일(특히 web/app, web/components, web/lib, web/stores, web/messages)은 고치지 않는다.

# 일: 스크린샷 촬영 도구와 자동 검사 만들기
web/scripts/capture/ 아래에 만든다. Playwright는 web/에 설치돼 있다(playwright 1.49.1). 브라우저는 내려받지 말고 설치된 Chrome을 쓴다: chromium.launch({ channel: "chrome", headless: true }).
dev 서버는 이미 http://localhost:3002 에 떠 있다. 서버를 띄우거나 내리지 않는다. next build를 돌리지 않는다.

## 만들 파일
1. web/scripts/capture/capture.mjs
   - 실행: node scripts/capture/capture.mjs --plan <계획 파일> --out <출력 폴더> [--only <id 일부>] [--locales ko,en,zh] [--viewports mobile,desktop]
   - 뷰포트: mobile 390×844(deviceScaleFactor 2, 터치), desktop 1440×900. 긴 페이지는 전체 길이(fullPage)와 첫 화면 둘 다.
   - 계획의 항목마다: id, 경로(로케일 뒤의 경로), 상태 프리셋 이름, 단계 목록(click / fill / wait / scroll / press / shot). 단계 중간의 shot 마다 파일을 남긴다.
   - 파일명: <id>-<단계 이름>-<locale>-<viewport>.png
   - 움직임은 prefers-reduced-motion 을 켜고 찍는다(연출 화면 항목만 끌 수 있게 옵션).
   - 실패한 항목은 건너뛰고 이유를 결과에 적는다. 한 항목이 실패해도 전체가 멈추지 않는다.
2. web/scripts/capture/states.mjs
   - 상태 프리셋: 비로그인 / 로그인(잔액 0) / 로그인(잔액 부족) / 로그인(잔액 충분) / 보관함에 상품 있음 / 출금 대기 있음 등. 브라우저 저장소(localStorage)에 값을 심어서 만든다. 저장소 키는 web/stores/*.ts 와 web/lib/labSite.ts(사이트 접두사 셰임)를 읽고 실제 키와 모양에 맞춘다.
   - 네트워크로 나가는 요청이 있으면 page.route 로 가로채 가짜 응답을 준다. 실제 돈이 움직이는 호출은 절대 하지 않는다.
   - 만들 수 없는 상태는 억지로 만들지 말고 "만들지 못함"과 이유를 적는다.
3. web/scripts/capture/checks.mjs (찍을 때 함께 돌고, 390과 1440에 더해 360 폭에서도 한 번 더)
   - 가로 스크롤(문서 폭이 창보다 넓음), 잘리거나 넘친 글자(scrollWidth > clientWidth 인 글 요소), 겹친 요소(누를 수 있는 요소끼리 겹침), 44px 미만 터치 영역(모바일만), 대비 4.5:1 미만(글자색과 실제 배경색 계산), 콘솔 오류
   - 결과를 qa/auto-report.json 에 [항목 id, 로케일, 뷰포트, 검사 이름, 요소 선택자, 값] 으로 쌓는다.
4. web/scripts/capture/plan.before.json
   - 지금 앱(개편 전)의 계획. UI_INVENTORY.md 를 보고 만든다. 적어도: 라우트 전부, 비로그인으로 닿는 오버레이 전부(박스 상세 창, 충전 창과 세 탭, 로그인 창과 가입, 모바일 메뉴, 일일 상자 창, 검증 창 등), 프리셋으로 닿는 화면(보관함에 상품 있음, 되팔기 확인, 배송 창, 추적 창, 출금 단계, 프로필과 보안 설정, 개봉과 결과, 대량 개봉 요약, 자동 열기 설정, 후기 작성, 게시판 글쓰기), 토스트 4종.
   - 핵심 흐름 셋은 처음부터 끝까지 클릭으로 따라가며 단계마다 shot: (가) 처음 온 사람의 첫 개봉, (나) 재방문자의 다시 열기, (다) 받은 상품 받기(배송, USDT로 받기).
5. web/scripts/capture/README.md: 쓰는 법과 만들지 못한 상태 목록.

## 확인
- 만든 뒤 `cd web && node scripts/capture/capture.mjs --plan scripts/capture/plan.before.json --out ../qa/before --locales ko --viewports mobile --only home` 처럼 작은 범위로 돌려 실제로 파일이 생기는지 확인한다. 전체 실행은 하지 않는다(총괄이 한다).
- 마지막 메시지에: 만든 파일, 확인한 명령과 결과, 만들지 못한 상태, 계획의 항목 수를 적는다.
