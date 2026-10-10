지정한 세 파일을 만들었습니다. Node 내장 모듈만 사용했으며, 앱 소스 수정과 커밋은 하지 않았습니다.

- [lint.mjs](<C:/Users/hyun1/OneDrive/바탕 화면/VOILA-test-aresjoo/web/scripts/design-lint/lint.mjs>)
- [config.json](<C:/Users/hyun1/OneDrive/바탕 화면/VOILA-test-aresjoo/web/scripts/design-lint/config.json>)
- [README.md](<C:/Users/hyun1/OneDrive/바탕 화면/VOILA-test-aresjoo/web/scripts/design-lint/README.md>)

마지막 실행 결과입니다.

| 규칙 | new | all |
|---|---:|---:|
| color-outside-tokens | 0 | 1,269 |
| weight-over-400 | 0 | 432 |
| uppercase | 0 | 38 |
| letter-spacing-positive | 0 | 56 |
| shadow | 0 | 80 |
| gradient | 0 | 129 |
| native-dialog | 0 | 0 |
| copy-emdash | 0 | 0 |
| copy-middledot | 0 | 13 |
| copy-exclamation | 0 | 27 |
| copy-question | 0 | 79 |
| copy-apology | 0 | 0 |
| **합계** | **0** | **2,123** |

`new`: 22개 파일, 종료 코드 0. `all`: 124개 파일, 종료 코드 1.

**scope new의 위반 전체 목록: 없음.**

위반이 있는 9개 규칙은 각각 원본 5개씩 확인했고 표본에서 오탐은 발견하지 못했습니다. 색 중복 집계, 지역 `confirm()` 호출, 주석, 일반 문자열의 클래스 오인은 방지하도록 보완했습니다. 0건인 규칙은 메모리 입력으로 검증했으며 JSON 출력과 종료 코드도 확인했습니다.

한계는 런타임 계산, 외부 변수, 동적 클래스 조합, 복잡한 구문입니다. 물음표의 문맥은 판단하지 않으며, 현재 FAQ 예외는 답변에도 적용될 수 있습니다.