`web/scripts/capture/`에 요청한 5개 파일을 만들었습니다: `capture.mjs`, `states.mjs`, `checks.mjs`, `plan.before.json`, [README.md](<C:/Users/hyun1/OneDrive/바탕 화면/VOILA-test-aresjoo/web/scripts/capture/README.md>).

- 계획: **100개 항목**
- 확인 명령: `node scripts/capture/capture.mjs --plan scripts/capture/plan.before.json --out ../qa/before --locales ko --viewports mobile --only home`
- 결과: **PNG 4개 생성**, 390px와 360px 검사 완료. 개봉, USDT 받기, 출금, 주요 모달과 토스트도 부분 확인했습니다.
- 만들지 못한 상태: 배송 접수 완료, 실입금 완료, 외부 인증 화면, 미연결 UI 등입니다. 이유와 검사 한계는 README에 적었습니다.

전체 실행과 커밋은 하지 않았고, 앱 소스도 수정하지 않았습니다.