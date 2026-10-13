# 두 번째 라운드 1차 Codex 구조와 기능 감사

대상: C:\Users\hyun1\dev\VOILA-audit-reviews, 브랜치 migration-result.
원본: 63445c7fa094125bfb1c60d7fccd17dd4005c07d.
검사 종료 시 결과 HEAD: 659e14041197d586e471538b03d3b935db8f5f6d.
검사 시작 시 결과 HEAD: 9e845cd0f9ccadd0a6a27cd19398c877dd91229c.
감사일: 2026-10-13, Asia/Singapore. 원본 정적 빌드 4175, 결과 정적 빌드 4176, 공통 하위 경로 /voila-test-aresjoo/.

첫 라운드의 CYCLE1, CYCLE2, CYCLE3 보고서와 그 변형을 열지 않았다. 이 보고서는 지정 인벤토리, 실제 원본 소스, HEAD 소스와 이번 실행으로 작성했다. 코드 수정, 커밋, 푸시, checkout, reset, next build, 서버 시작을 하지 않았다. 보고서 외 저장소 파일을 편집하지 않았다. 검사용 스크립트, 원본 archive, 실행 로그와 화면은 모두 저장소 밖 임시 폴더에 두었다.

임시 증거 폴더 T: C:\Users\hyun1\AppData\Local\Temp\voila-r2-c1-mQKfbN. 아래 명령에서 T는 이 절대 경로다. 코드의 줄은 별도 표시가 없으면 결과 HEAD의 줄이다. 인벤토리 표의 원본 줄은 63445c7의 줄이다. 증거는 코드에서 읽은 것, 직접 실행한 것, 짐작으로 구분한다. 완료나 배포 가능 여부는 판정하지 않는다.

## 1. 주요 관찰

코드에서 읽은 것: 변경 53파일 모두 W1, W2, W3 또는 검수 도구로 설명된다. 파일 삭제와 이름 변경, 의존성 변경은 없다. 화면 요소와 조작이 없어지는 변경은 후기 자리의 가로 넘기기와 박스 필터 등 W1에 모여 있다. 후기 밖의 설명 안 되는 제거는 발견하지 못했다. 인용한 한 줄이 같다는 사실만으로 그 화면의 동작 전체가 같다고 보지는 않았다.

직접 실행한 것: 두 소스에서 독립 계산한 카탈로그, 334박스의 확률 합, 16,700추첨, 돈 계산 경계값이 모두 같았다. 새 코드가 저장한 금액 0 출금은 실제 원본 스토어로 취소와 실패를 적용해도 환불 0이었다. 정상 출금 화면과 저장 필드는 양쪽이 같았다.

남은 문제: 원본에서 이미 저장한 미차감 음수 출금의 잘못된 환불, 저장 한도에서 개봉 기록 유실, 탈퇴 흐름 실패는 양쪽에 남는다. 검증 화면은 계산 중 바뀐 입력의 새 응답을 버리지만, 이전에 표시한 결과까지 지우지는 않는다. 확인창의 기기 시각 변화 결함은 이번 변경이 만든 P1로 직접 재현했다. 검사 중 외부에서 추가된 최신 HEAD 소스는 이를 고쳤으나 제공된 4176 정적 빌드는 여전히 재현한다. 이것은 모든 기능이 완전하다는 판정이 아니다.

### 1.1 검사 중 HEAD 이동과 증거 범위

직접 실행한 것: 종료 직전 git rev-parse HEAD에서 변경을 감지했다. git diff 9e845cd..659e140은 5파일이다. Sheet.tsx의 Date.now를 performance.now로 바꾸고, formatCurrency.ts의 split 표기에도 부호를 앞에 옮겼으며 관련 두 단위 시험과 확인창 capture 시험을 더했다. 이 커밋을 내가 만든 것은 아니다. 이전 검수 보고서는 계속 열지 않았다.

인벤토리 332행 표와 53파일 범위 표는 종료 HEAD로 다시 계산했다. 최신 소스의 타입, 전체 시험, 디자인 린트와 독립 불변값도 다시 실행했다. 최신 전체 시험은 471건 중 470통과, 0실패, 1건너뜀이다. 대부분의 앞선 브라우저 검사는 제공 정적 빌드에 대한 것이다. 추가 T/clock-supplement.mjs에서 4176의 시각 뒤로가기 실패가 그대로여서 최신 HEAD의 확인창 수정이 아직 반영되지 않았음을 확인했다. 이 빌드를 최신 HEAD의 빌드라고 주장하지 않는다. HEAD 빌드 전체 브라우저 검증은 금지된 next build를 실행하지 않고는 여기서 채우지 못했다. source/실행 빌드의 불일치를 독립적인 검증 한계로 남긴다.

## 2. Phase 4 인벤토리 대조

직접 실행한 것: rtk proxy node T/prepare.mjs. git diff 63445c7..HEAD --unified=0의 hunk로 원본 줄을 결과 줄에 대응시키고, 줄의 내용을 비교했다. CRLF와 LF 차이만 정규화했다. 파일명만 있는 인용은 파일 전체의 diff로 분류했고, 생략된 components/ 경로는 유일한 파일에 대응했다. web/messages/v.*.json은 세 파일로 펼쳤다. 인벤토리 원본은 C:\Users\hyun1\dev\VOILA-test-aresjoo\migration-audit의 다섯 지정 파일이다. INTERACTION_MATRIX는 닿는 I-001부터 I-252까지만 분모에 넣었다.

| 인벤토리 | 전체 | 변경 파일 인용 행 | 그 중 인용 코드 그대로 | 의도된 변경 | 설명 안 되는 변경 | 미변경 파일만 인용 | 직접 코드 인용 없음 |
|---|---:|---:|---:|---:|---:|---:|---:|
| ROUTE_INVENTORY | 28 | 4 | 4 | 0 | 0 | 19 | 5 |
| UI_INVENTORY | 156 | 84 | 69 | 15 | 0 | 69 | 3 |
| INTERACTION_MATRIX | 252 | 137 | 118 | 19 | 0 | 112 | 3 |
| STATE_TRANSITIONS | 115 | 66 | 48 | 18 | 0 | 46 | 3 |
| FEATURE_PARITY | 95 | 41 | 20 | 21 | 0 | 54 | 0 |

합계 646행이다. 변경 파일을 인용한 332행 중 인용 코드 그대로 259행, 의도된 변경 73행이다. 미변경 파일만 인용하는 300행은 수만 센다. 코드 파일을 직접 인용하지 않은 14행은 아래처럼 따로 처리했다. 이 14행을 기계 비교 통과 수에 넣지 않았다.

| 행 | 이번 확인과 한계 | 결과 근거 |
|---|---|---|
| R-024 | 끝 빗금은 호스트 동작이며 소스 줄 인용이 없다. GitHub Pages의 301을 로컬 정적 호스트 결과로 대체하지 않았다 | web/next.config.mjs:27 |
| R-025 | 새 카탈로그 320개 유지, 전체 334개 독립 계산 | web/lib/products.ts:336 |
| R-026 | 옛 박스 13개의 일괄 필터는 사라졌다. 전체 후기 상세의 박스 링크로 가는 W1 경로로 바뀐다 | web/components/box/ReviewsScreen.tsx:33, web/components/box/BoxReviews.tsx:266 |
| R-027 | jackpot-supercar에 샘플과 후기 경로가 생겼다. 세 언어 주소를 직접 열어 200과 5카드 확인 | web/components/box/BoxReviews.tsx:277 |
| R-028 | 약관 slug 목록과 라우트 파일은 변경되지 않았다 | web/app/[locale]/legal/[doc]/page.tsx:8 |
| U-141 | 전용 menu, listbox, tab 역할이 없는 기존 구조가 남는다. 후기 필터 Chips는 W1로 줄었다 | web/components/ui/kit.tsx:35, web/components/box/ReviewsScreen.tsx:33 |
| U-142 | 겹침 화면의 open 조건은 유지, Confirm에만 350ms 잠금 추가 | web/components/ui/Sheet.tsx:33 |
| U-153 | import 그래프를 별도 계산했다. 아래의 도달성 차이를 기록 | web/components/ui/ScrollRow.tsx:11 |
| I-042 | 검색 Enter 전용 handler는 계속 없다 | web/components/box/BoxList.tsx:101 |
| I-047 | 목록 뒤로가기 복원 전용 처리는 계속 없다. 브라우저 이력 전체 실행은 하지 않았다 | web/components/box/BoxList.tsx:51 |
| I-160 | 생략된 근거는 I-159의 사회 로그인 handler와 같은 경로다 | web/components/flow/LoginSheet.tsx:94 |
| S-058, S-088 | 보고서만 인용한 두 번 누름 사례. 이번 브라우저에서 원본 실패와 결과의 잠금 확인 | web/components/ui/Sheet.tsx:40 |
| S-099 | 새로고침의 일반 규칙. 지갑과 후기, 설정과 시드는 이번 개봉 및 후기 검사에서 읽었다. 모든 화면의 모든 임시 상태를 전수 실행한 것은 아니다 | web/stores/flowStore.ts:22 |

코드에서 읽은 것과 직접 실행한 것: rtk proxy node T/graph.mjs는 프로덕션에서 제외되는 dev 라우트를 빼고 app의 page, layout, error, not-found에서 import를 따라갔다. 컴포넌트 파일은 양쪽 116개다. 원본에서 닿는 44개, 결과에서 닿는 43개였다. 닿지 않는 72개와 73개는 인벤토리의 71개에 dev Gallery를 포함해 센 수다. 새로 닿지 않게 된 파일은 ScrollRow.tsx 하나다. reviewFeed.ts와 reviewSampleText.ts는 새로 닿는 lib 파일이다. 삭제된 파일은 없다.

사라진 요소와 조작을 별도로 대조했다. U-036과 U-052의 가로 후기 띠, I-079의 이전과 다음 단추, I-080의 가로 스크롤 끝 표시가 결과에서는 쓰이지 않는다. ScrollRow 자체는 그대로지만 BoxReviews가 호출하지 않는다. 대신 세로 후기 목록과 20건씩 더 보기가 있다. ReviewsScreen의 전체 박스 알약 14개는 원본 브라우저에서 확인했고, 결과의 전체 보기에서는 0개, box query가 있는 보기에서는 전체와 해당 박스 2개였다. 모두 W1의 후기 자리 변경이다. 후기 상세에서 현재 박스로 다시 가는 링크도 그 박스 화면에서는 제거되었고, 모아 보기에서는 유지된다. 그 밖의 개봉, 보관, 받기, 지갑, 계정, 검증 전이 제거는 코드 대조에서 발견하지 못했다. 실패 전이 중 E-15, E-16, E-25, E-39는 W3로 옛 응답을 버리는 의도된 차이다.

### 2.1 변경 파일을 인용한 모든 행

아래 표는 332행 전부다. 인벤토리 문서의 행 번호와 원본 코드 인용을 함께 둔다. 그대로는 인용 범위의 코드 비교 결과이며, import된 부품의 변경까지 없다는 뜻은 아니다. 의도된 변경의 결과 줄은 hunk의 대응 구간을 포함한다. 삭제된 줄을 임의로 같은 줄에 대응시키지 않았다. 파일 전체라고 적은 행은 원본 인용에 줄 번호가 없다. 줄 이동 때문에 범위가 겹치면 중복된 결과 범위를 그대로 남겨 추적할 수 있게 했다.

#### ROUTE_INVENTORY

| 항목과 인벤토리 줄 | 변경 파일의 원본 인용 | 결과 대응과 분류 |
|---|---|---|
| R-002, ROUTE_INVENTORY.md:64 | web/components/box/BoxList.tsx:42 | web/components/box/BoxList.tsx:43 그대로 |
| R-003, ROUTE_INVENTORY.md:65 | web/components/box/BoxScreen.tsx:54 | web/components/box/BoxScreen.tsx:53 그대로 |
| R-008, ROUTE_INVENTORY.md:70 | web/components/box/ReviewsScreen.tsx:21 | web/components/box/ReviewsScreen.tsx:23 그대로 |
| R-009, ROUTE_INVENTORY.md:71 | web/components/verify/VerifyScreen.tsx:43-49<br>web/components/box/BoxReviews.tsx:108 | web/components/verify/VerifyScreen.tsx:43-49 그대로<br>web/components/box/BoxReviews.tsx:152 그대로 |

#### UI_INVENTORY

| 항목과 인벤토리 줄 | 변경 파일의 원본 인용 | 결과 대응과 분류 |
|---|---|---|
| U-007, UI_INVENTORY.md:64 | web/app/ui.css:21-24 | web/app/ui.css:21-24 그대로 |
| U-008, UI_INVENTORY.md:65 | web/app/ui.css:31-41 | web/app/ui.css:31-41 그대로 |
| U-010, UI_INVENTORY.md:67 | web/app/ui.css:34-36,41 | web/app/ui.css:34-36,41 그대로 |
| U-013, UI_INVENTORY.md:70 | web/app/ui.css:41 | web/app/ui.css:41 그대로 |
| U-021, UI_INVENTORY.md:83 | web/app/ui.css:59-66 | web/app/ui.css:59-66 그대로 |
| U-023, UI_INVENTORY.md:85 | web/app/ui.css:68-70 | web/app/ui.css:68-70 그대로 |
| U-024, UI_INVENTORY.md:86 | web/app/ui.css:73-78 | web/app/ui.css:73-78 그대로 |
| U-025, UI_INVENTORY.md:87 | web/app/ui.css:50-52 | web/app/ui.css:50-52 그대로 |
| U-026, UI_INVENTORY.md:88 | web/app/ui.css:84-91 | web/app/ui.css:84-91 그대로 |
| U-027, UI_INVENTORY.md:89 | web/app/ui.css:90-91 | web/app/ui.css:90-91 그대로 |
| U-028, UI_INVENTORY.md:90 | web/app/ui.css:81-83 | web/app/ui.css:81-83 그대로 |
| U-029, UI_INVENTORY.md:91 | web/app/ui.css:94-102 | web/app/ui.css:94-102 그대로 |
| U-030, UI_INVENTORY.md:92 | web/app/ui.css:109-110 | web/app/ui.css:109-110 그대로 |
| U-031, UI_INVENTORY.md:93 | web/app/ui.css:112 | web/app/ui.css:112 그대로 |
| U-032, UI_INVENTORY.md:94 | web/app/ui.css:113-115 | web/app/ui.css:113-115 그대로 |
| U-033, UI_INVENTORY.md:95 | web/components/ui/Sheet.tsx:12 | web/components/ui/Sheet.tsx:13 그대로 |
| U-034, UI_INVENTORY.md:96 | web/components/ui/Sheet.tsx:32 | web/components/ui/Sheet.tsx:33 그대로 |
| U-035, UI_INVENTORY.md:97 | web/app/ui.css:140-142 | web/app/ui.css:140-142 그대로 |
| U-036, UI_INVENTORY.md:98 | web/app/ui.css:171-178 | web/app/ui.css:168-173,174 의도된 변경(W1) |
| U-040, UI_INVENTORY.md:102 | web/components/box/BoxReviews.tsx:32,44,54 | web/components/box/BoxReviews.tsx:46,58,70 그대로 |
| U-041, UI_INVENTORY.md:103 | web/app/ui.css:265-273,365-373 | web/app/ui.css:252-260,351-359 그대로 |
| U-042, UI_INVENTORY.md:104 | web/app/ui.css:333-337<br>web/components/box/BoxScreen.tsx:259,273 | web/app/ui.css:320-324 그대로<br>web/components/box/BoxScreen.tsx:257,271 그대로 |
| U-043, UI_INVENTORY.md:112 | web/components/home/HeroBanner.tsx:136-187<br>web/components/home/heroBall.ts:파일 전체 | web/components/home/HeroBanner.tsx:137-188 그대로<br>web/components/home/heroBall.ts:파일 전체 의도된 변경(W3) |
| U-044, UI_INVENTORY.md:113 | web/components/box/BoxList.tsx:82,85 | web/components/box/BoxList.tsx:85,88 그대로 |
| U-045, UI_INVENTORY.md:114 | web/components/box/BoxList.tsx:87-98 | web/components/box/BoxList.tsx:90-101 그대로 |
| U-046, UI_INVENTORY.md:115 | web/components/box/BoxList.tsx:102 | web/components/box/BoxList.tsx:105 그대로 |
| U-047, UI_INVENTORY.md:116 | web/components/box/BoxList.tsx:103-105,116-131<br>web/app/ui.css:145-147,206-210 | web/components/box/BoxList.tsx:106-108,107,119-120,121-134 의도된 변경(W1)<br>web/app/ui.css:145-147,193-197 그대로 |
| U-048, UI_INVENTORY.md:117 | web/components/box/BoxList.tsx:106 | web/components/box/BoxList.tsx:109 그대로 |
| U-049, UI_INVENTORY.md:123 | web/components/box/BoxScreen.tsx:173,175<br>web/app/ui.css:319-347 | web/components/box/BoxScreen.tsx:171,173 그대로<br>web/app/ui.css:306-333 의도된 변경(W1) |
| U-050, UI_INVENTORY.md:124 | web/components/box/BoxScreen.tsx:176 | web/components/box/BoxScreen.tsx:174 그대로 |
| U-051, UI_INVENTORY.md:125 | web/components/box/BoxScreen.tsx:180-186 | web/components/box/BoxScreen.tsx:178-184 그대로 |
| U-052, UI_INVENTORY.md:126 | web/components/box/BoxReviews.tsx:119-143,175-197<br>web/components/box/BoxScreen.tsx:106 | web/components/box/BoxReviews.tsx:187-219,191,194,196-199,201-215,273-278,279-301,280-281,286,288,290,295,298 의도된 변경(W1)<br>web/components/box/BoxScreen.tsx:105-106 의도된 변경(W1) |
| U-053, UI_INVENTORY.md:127 | web/components/box/BoxScreen.tsx:191-195 | web/components/box/BoxScreen.tsx:189-193 그대로 |
| U-054, UI_INVENTORY.md:128 | web/components/box/BoxScreen.tsx:196-212<br>web/app/ui.css:283-284,345 | web/components/box/BoxScreen.tsx:194-210 그대로<br>web/app/ui.css:270-271,331 그대로 |
| U-055, UI_INVENTORY.md:129 | web/components/box/BoxScreen.tsx:203 | web/components/box/BoxScreen.tsx:201 그대로 |
| U-056, UI_INVENTORY.md:130 | web/components/box/BoxScreen.tsx:204-210 | web/components/box/BoxScreen.tsx:202-208 그대로 |
| U-057, UI_INVENTORY.md:131 | web/components/box/BoxScreen.tsx:215-241,325-335<br>web/app/ui.css:218-233 | web/components/box/BoxScreen.tsx:213-239,323-333 그대로<br>web/app/ui.css:205-220 그대로 |
| U-058, UI_INVENTORY.md:132 | web/components/box/BoxScreen.tsx:244-258 | web/components/box/BoxScreen.tsx:242-256 그대로 |
| U-059, UI_INVENTORY.md:133 | web/components/box/BoxScreen.tsx:259-278 | web/components/box/BoxScreen.tsx:257-276 그대로 |
| U-060, UI_INVENTORY.md:139 | web/components/box/BoxScreen.tsx:319 | web/components/box/BoxScreen.tsx:317 그대로 |
| U-067, UI_INVENTORY.md:151 | web/components/box/Reveal.tsx:167<br>web/components/box/BoxScreen.tsx:320 | web/components/box/Reveal.tsx:171 그대로<br>web/components/box/BoxScreen.tsx:318 그대로 |
| U-068, UI_INVENTORY.md:152 | web/components/box/Reveal.tsx:169-176 | web/components/box/Reveal.tsx:173-180 그대로 |
| U-069, UI_INVENTORY.md:153 | web/components/box/Reveal.tsx:179-180 | web/components/box/Reveal.tsx:183-184 그대로 |
| U-070, UI_INVENTORY.md:154 | web/components/box/Reveal.tsx:217-240 | web/components/box/Reveal.tsx:221-244 그대로 |
| U-071, UI_INVENTORY.md:155 | web/components/box/Reveal.tsx:241-260 | web/components/box/Reveal.tsx:245-264 그대로 |
| U-072, UI_INVENTORY.md:156 | web/components/box/Reveal.tsx:262-277 | web/components/box/Reveal.tsx:266-281 그대로 |
| U-073, UI_INVENTORY.md:162 | web/components/inventory/InventoryScreen.tsx:112-114 | web/components/inventory/InventoryScreen.tsx:116-118 그대로 |
| U-074, UI_INVENTORY.md:163 | web/components/inventory/InventoryScreen.tsx:117,119 | web/components/inventory/InventoryScreen.tsx:121,123 그대로 |
| U-075, UI_INVENTORY.md:164 | web/components/inventory/InventoryScreen.tsx:121 | web/components/inventory/InventoryScreen.tsx:125 그대로 |
| U-076, UI_INVENTORY.md:165 | web/components/inventory/InventoryScreen.tsx:123-138 | web/components/inventory/InventoryScreen.tsx:127-142 그대로 |
| U-077, UI_INVENTORY.md:166 | web/components/wallet/WalletScreen.tsx:92-94 | web/components/wallet/WalletScreen.tsx:102-104 그대로 |
| U-078, UI_INVENTORY.md:167 | web/components/wallet/WalletScreen.tsx:98-103 | web/components/wallet/WalletScreen.tsx:108-113 그대로 |
| U-079, UI_INVENTORY.md:168 | web/components/wallet/WalletScreen.tsx:105-120 | web/components/wallet/WalletScreen.tsx:115-130,122 의도된 변경(W2 E-01/E-06) |
| U-080, UI_INVENTORY.md:169 | web/components/wallet/WithdrawScreen.tsx:169-176 | web/components/wallet/WithdrawScreen.tsx:186-193 그대로 |
| U-081, UI_INVENTORY.md:170 | web/components/wallet/WithdrawScreen.tsx:179-189 | web/components/wallet/WithdrawScreen.tsx:196-206 그대로 |
| U-082, UI_INVENTORY.md:171 | web/components/wallet/WithdrawScreen.tsx:237-264 | web/components/wallet/WithdrawScreen.tsx:254-282,278 의도된 변경(W2 E-01/E-06) |
| U-083, UI_INVENTORY.md:172 | web/components/wallet/WithdrawScreen.tsx:191-203 | web/components/wallet/WithdrawScreen.tsx:208-220 그대로 |
| U-084, UI_INVENTORY.md:173 | web/components/wallet/WithdrawScreen.tsx:205-223 | web/components/wallet/WithdrawScreen.tsx:222-240 그대로 |
| U-085, UI_INVENTORY.md:174 | web/components/wallet/WithdrawScreen.tsx:225-235 | web/components/wallet/WithdrawScreen.tsx:242-252 그대로 |
| U-089, UI_INVENTORY.md:183 | web/components/box/ReviewsScreen.tsx:33-34 | web/components/box/ReviewsScreen.tsx:33,34-35 의도된 변경(W1) |
| U-090, UI_INVENTORY.md:184 | web/components/box/ReviewsScreen.tsx:37-41 | web/components/box/ReviewsScreen.tsx:37-38,39-41 의도된 변경(W1) |
| U-091, UI_INVENTORY.md:185 | web/components/verify/VerifyScreen.tsx:72-94 | web/components/verify/VerifyScreen.tsx:77-99 그대로 |
| U-092, UI_INVENTORY.md:186 | web/components/verify/VerifyScreen.tsx:96-117 | web/components/verify/VerifyScreen.tsx:101-122 그대로 |
| U-093, UI_INVENTORY.md:187 | web/components/verify/VerifyScreen.tsx:120-123 | web/components/verify/VerifyScreen.tsx:125-128 그대로 |
| U-112, UI_INVENTORY.md:284 | web/components/auth/AuthHost.tsx:50 | web/components/auth/AuthHost.tsx:52 그대로 |
| U-114, UI_INVENTORY.md:286 | web/components/box/BoxScreen.tsx:281-315 | web/components/box/BoxScreen.tsx:279-313 그대로 |
| U-115, UI_INVENTORY.md:287 | web/components/box/BoxReviews.tsx:146-173 | web/components/box/BoxReviews.tsx:221-243,244-271,247-248,253-255,266 의도된 변경(W1) |
| U-116, UI_INVENTORY.md:288 | web/components/box/BoxScreen.tsx:316 | web/components/box/BoxScreen.tsx:314 그대로 |
| U-125, UI_INVENTORY.md:297 | web/components/box/Reveal.tsx:284-296 | web/components/box/Reveal.tsx:288-300 그대로 |
| U-126, UI_INVENTORY.md:298 | web/components/inventory/InventoryScreen.tsx:142-178 | web/components/inventory/InventoryScreen.tsx:146-182 그대로 |
| U-129, UI_INVENTORY.md:301 | web/components/flow/ReviewSheet.tsx:55-71 | web/components/flow/ReviewSheet.tsx:67-83 그대로 |
| U-130, UI_INVENTORY.md:302 | web/components/inventory/InventoryScreen.tsx:187 | web/components/inventory/InventoryScreen.tsx:191 그대로 |
| U-131, UI_INVENTORY.md:303 | web/components/wallet/WalletScreen.tsx:124-144 | web/components/wallet/WalletScreen.tsx:134-158,139-141,149-150,152 의도된 변경(W2 E-01/E-06) |
| U-132, UI_INVENTORY.md:304 | web/components/wallet/WalletScreen.tsx:145 | web/components/wallet/WalletScreen.tsx:159 의도된 변경(W2 E-01/E-06) |
| U-133, UI_INVENTORY.md:305 | web/components/wallet/WithdrawScreen.tsx:185-187 | web/components/wallet/WithdrawScreen.tsx:202-204 그대로 |
| U-134, UI_INVENTORY.md:306 | web/components/account/AccountSheets.tsx:38-43 | web/components/account/AccountSheets.tsx:38-43 그대로 |
| U-135, UI_INVENTORY.md:307 | web/components/account/AccountSheets.tsx:66-76 | web/components/account/AccountSheets.tsx:102-112 그대로 |
| U-136, UI_INVENTORY.md:308 | web/components/account/AccountSheets.tsx:96-101 | web/components/account/AccountSheets.tsx:132-137 그대로 |
| U-139, UI_INVENTORY.md:318 | web/components/verify/VerifyScreen.tsx:109 | web/components/verify/VerifyScreen.tsx:114 그대로 |
| U-143, UI_INVENTORY.md:340 | web/components/box/Reveal.tsx:182-214<br>web/components/box/BoxScreen.tsx:319-320 | web/components/box/Reveal.tsx:186-218 그대로<br>web/components/box/BoxScreen.tsx:317-318 그대로 |
| U-144, UI_INVENTORY.md:341 | web/components/box/ReviewsScreen.tsx:35 | web/components/box/ReviewsScreen.tsx:34-35 의도된 변경(W1) |
| U-152, UI_INVENTORY.md:349 | web/components/box/BoxScreen.tsx:328<br>web/components/box/BoxList.tsx:102<br>web/components/box/BoxScreen.tsx:186 | web/components/box/BoxScreen.tsx:326 그대로<br>web/components/box/BoxList.tsx:105 그대로<br>web/components/box/BoxScreen.tsx:184 그대로 |
| U-155, UI_INVENTORY.md:352 | web/app/ui.css:파일 전체<br>web/app/globals.css:파일 전체 | web/app/ui.css:파일 전체 의도된 변경(W1)<br>web/app/globals.css:파일 전체 의도된 변경(W1) |
| U-156, UI_INVENTORY.md:353 | web/messages/v.ko.json:파일 전체<br>web/messages/v.en.json:파일 전체<br>web/messages/v.zh.json:파일 전체 | web/messages/v.ko.json:파일 전체 의도된 변경(W1/W2)<br>web/messages/v.en.json:파일 전체 의도된 변경(W1/W2)<br>web/messages/v.zh.json:파일 전체 의도된 변경(W1/W2) |

#### INTERACTION_MATRIX

| 항목과 인벤토리 줄 | 변경 파일의 원본 인용 | 결과 대응과 분류 |
|---|---|---|
| I-002, INTERACTION_MATRIX.md:211 | web/components/ui/Sheet.tsx:14 | web/components/ui/Sheet.tsx:15 그대로 |
| I-003, INTERACTION_MATRIX.md:212 | web/components/ui/Sheet.tsx:17 | web/components/ui/Sheet.tsx:18 그대로 |
| I-004, INTERACTION_MATRIX.md:213 | web/components/ui/Sheet.tsx:19 | web/components/ui/Sheet.tsx:20 그대로 |
| I-007, INTERACTION_MATRIX.md:216 | web/components/ui/Sheet.tsx:34 | web/components/ui/Sheet.tsx:35 그대로 |
| I-008, INTERACTION_MATRIX.md:217 | web/components/ui/Sheet.tsx:37 | web/components/ui/Sheet.tsx:45 그대로 |
| I-009, INTERACTION_MATRIX.md:218 | web/components/ui/Sheet.tsx:44 | web/components/ui/Sheet.tsx:52 의도된 변경(W2 E-08) |
| I-010, INTERACTION_MATRIX.md:219 | web/components/ui/Sheet.tsx:45 | web/components/ui/Sheet.tsx:53 그대로 |
| I-040, INTERACTION_MATRIX.md:264 | web/components/box/BoxList.tsx:85 | web/components/box/BoxList.tsx:88 그대로 |
| I-041, INTERACTION_MATRIX.md:265 | web/components/box/BoxList.tsx:64-66,85 | web/components/box/BoxList.tsx:67-69,88 그대로 |
| I-043, INTERACTION_MATRIX.md:267 | web/components/box/BoxList.tsx:91 | web/components/box/BoxList.tsx:94 그대로 |
| I-044, INTERACTION_MATRIX.md:268 | web/components/box/BoxList.tsx:102 | web/components/box/BoxList.tsx:105 그대로 |
| I-045, INTERACTION_MATRIX.md:269 | web/components/box/BoxList.tsx:106 | web/components/box/BoxList.tsx:109 그대로 |
| I-046, INTERACTION_MATRIX.md:270 | web/components/box/BoxList.tsx:119 | web/components/box/BoxList.tsx:122 그대로 |
| I-048, INTERACTION_MATRIX.md:272 | web/components/home/HeroBanner.tsx:185 | web/components/home/HeroBanner.tsx:186 그대로 |
| I-049, INTERACTION_MATRIX.md:273 | web/components/home/HeroBanner.tsx:184 | web/components/home/HeroBanner.tsx:185 그대로 |
| I-050, INTERACTION_MATRIX.md:274 | web/components/home/HeroBanner.tsx:58-63,65-70,72-80,88-127 | web/components/home/HeroBanner.tsx:58-63,65-70,72-80,88-127 그대로 |
| I-051, INTERACTION_MATRIX.md:275 | web/components/box/BoxScreen.tsx:175 | web/components/box/BoxScreen.tsx:173 그대로 |
| I-052, INTERACTION_MATRIX.md:276 | web/components/box/BoxScreen.tsx:176 | web/components/box/BoxScreen.tsx:174 그대로 |
| I-053, INTERACTION_MATRIX.md:277 | web/components/box/BoxScreen.tsx:180 | web/components/box/BoxScreen.tsx:178 그대로 |
| I-054, INTERACTION_MATRIX.md:278 | web/components/box/BoxScreen.tsx:203 | web/components/box/BoxScreen.tsx:201 그대로 |
| I-055, INTERACTION_MATRIX.md:279 | web/components/box/BoxScreen.tsx:204 | web/components/box/BoxScreen.tsx:202 그대로 |
| I-056, INTERACTION_MATRIX.md:280 | web/components/box/BoxScreen.tsx:205 | web/components/box/BoxScreen.tsx:203 그대로 |
| I-057, INTERACTION_MATRIX.md:281 | web/components/box/BoxScreen.tsx:206 | web/components/box/BoxScreen.tsx:204 그대로 |
| I-058, INTERACTION_MATRIX.md:282 | web/components/box/BoxScreen.tsx:207 | web/components/box/BoxScreen.tsx:205 그대로 |
| I-059, INTERACTION_MATRIX.md:283 | web/components/box/BoxScreen.tsx:207 | web/components/box/BoxScreen.tsx:205 그대로 |
| I-060, INTERACTION_MATRIX.md:284 | web/components/box/BoxScreen.tsx:208 | web/components/box/BoxScreen.tsx:206 그대로 |
| I-061, INTERACTION_MATRIX.md:285 | web/components/box/BoxScreen.tsx:209 | web/components/box/BoxScreen.tsx:207 그대로 |
| I-062, INTERACTION_MATRIX.md:286 | web/components/box/BoxScreen.tsx:210 | web/components/box/BoxScreen.tsx:208 그대로 |
| I-063, INTERACTION_MATRIX.md:287 | web/components/box/BoxScreen.tsx:77,142 | web/components/box/BoxScreen.tsx:76,140 그대로 |
| I-064, INTERACTION_MATRIX.md:288 | web/components/box/BoxScreen.tsx:161 | web/components/box/BoxScreen.tsx:159 그대로 |
| I-065, INTERACTION_MATRIX.md:289 | web/components/box/BoxScreen.tsx:164,316 | web/components/box/BoxScreen.tsx:162,314 그대로 |
| I-066, INTERACTION_MATRIX.md:290 | web/components/box/BoxScreen.tsx:316,166 | web/components/box/BoxScreen.tsx:164,314 그대로 |
| I-067, INTERACTION_MATRIX.md:291 | web/components/box/BoxScreen.tsx:200 | web/components/box/BoxScreen.tsx:198 그대로 |
| I-068, INTERACTION_MATRIX.md:292 | web/components/box/BoxScreen.tsx:223,327 | web/components/box/BoxScreen.tsx:221,325 그대로 |
| I-069, INTERACTION_MATRIX.md:293 | web/components/box/BoxScreen.tsx:230 | web/components/box/BoxScreen.tsx:228 그대로 |
| I-070, INTERACTION_MATRIX.md:294 | web/components/box/BoxScreen.tsx:259-260 | web/components/box/BoxScreen.tsx:257-258 그대로 |
| I-071, INTERACTION_MATRIX.md:295 | web/components/box/BoxScreen.tsx:264 | web/components/box/BoxScreen.tsx:262 그대로 |
| I-072, INTERACTION_MATRIX.md:296 | web/components/box/BoxScreen.tsx:273-277 | web/components/box/BoxScreen.tsx:271-275 그대로 |
| I-073, INTERACTION_MATRIX.md:297 | web/components/box/BoxScreen.tsx:296 | web/components/box/BoxScreen.tsx:294 그대로 |
| I-074, INTERACTION_MATRIX.md:298 | web/components/box/BoxScreen.tsx:300 | web/components/box/BoxScreen.tsx:298 그대로 |
| I-075, INTERACTION_MATRIX.md:299 | web/components/box/BoxScreen.tsx:308 | web/components/box/BoxScreen.tsx:306 그대로 |
| I-076, INTERACTION_MATRIX.md:300 | web/components/box/BoxScreen.tsx:281 | web/components/box/BoxScreen.tsx:279 그대로 |
| I-077, INTERACTION_MATRIX.md:301 | web/components/box/BoxScreen.tsx:198,156 | web/components/box/BoxScreen.tsx:154,196 그대로 |
| I-078, INTERACTION_MATRIX.md:302 | web/components/box/BoxReviews.tsx:130 | web/components/box/BoxReviews.tsx:201-215 의도된 변경(W1) |
| I-081, INTERACTION_MATRIX.md:305 | web/components/box/BoxReviews.tsx:191 | web/components/box/BoxReviews.tsx:295 의도된 변경(W1) |
| I-082, INTERACTION_MATRIX.md:306 | web/components/box/BoxReviews.tsx:192<br>web/components/box/ReviewsScreen.tsx:41 | web/components/box/BoxReviews.tsx:296 그대로<br>web/components/box/ReviewsScreen.tsx:41 그대로 |
| I-083, INTERACTION_MATRIX.md:307 | web/components/box/BoxReviews.tsx:166 | web/components/box/BoxReviews.tsx:264 그대로 |
| I-084, INTERACTION_MATRIX.md:308 | web/components/box/BoxReviews.tsx:168 | web/components/box/BoxReviews.tsx:266 의도된 변경(W1) |
| I-085, INTERACTION_MATRIX.md:309 | web/components/box/ReviewsScreen.tsx:33 | web/components/box/ReviewsScreen.tsx:33 그대로 |
| I-086, INTERACTION_MATRIX.md:310 | web/components/box/ReviewsScreen.tsx:34 | web/components/box/ReviewsScreen.tsx:34-35 의도된 변경(W1) |
| I-087, INTERACTION_MATRIX.md:311 | web/components/box/ReviewsScreen.tsx:21-22 | web/components/box/ReviewsScreen.tsx:23,24-27 의도된 변경(W1) |
| I-089, INTERACTION_MATRIX.md:318 | web/components/box/BoxScreen.tsx:168 | web/components/box/BoxScreen.tsx:166 그대로 |
| I-096, INTERACTION_MATRIX.md:325 | web/components/box/BoxScreen.tsx:142 | web/components/box/BoxScreen.tsx:140 그대로 |
| I-106, INTERACTION_MATRIX.md:335 | web/components/ui/Sheet.tsx:44 | web/components/ui/Sheet.tsx:52 의도된 변경(W2 E-08) |
| I-111, INTERACTION_MATRIX.md:340 | web/components/box/BoxScreen.tsx:163 | web/components/box/BoxScreen.tsx:161 그대로 |
| I-113, INTERACTION_MATRIX.md:342 | web/components/box/Reveal.tsx:82-91 | web/components/box/Reveal.tsx:82-91 그대로 |
| I-114, INTERACTION_MATRIX.md:343 | web/components/box/Reveal.tsx:175,70 | web/components/box/Reveal.tsx:70,179 그대로 |
| I-115, INTERACTION_MATRIX.md:344 | web/components/box/Reveal.tsx:73 | web/components/box/Reveal.tsx:73 그대로 |
| I-116, INTERACTION_MATRIX.md:345 | web/components/box/Reveal.tsx:179 | web/components/box/Reveal.tsx:183 그대로 |
| I-117, INTERACTION_MATRIX.md:346 | web/components/box/Reveal.tsx:252,126 | web/components/box/Reveal.tsx:129,256 그대로 |
| I-118, INTERACTION_MATRIX.md:347 | web/components/box/Reveal.tsx:252,123 | web/components/box/Reveal.tsx:126,256 그대로 |
| I-119, INTERACTION_MATRIX.md:348 | web/components/box/Reveal.tsx:249-250 | web/components/box/Reveal.tsx:253-254 그대로 |
| I-120, INTERACTION_MATRIX.md:349 | web/components/box/Reveal.tsx:266,299 | web/components/box/Reveal.tsx:270,303 그대로 |
| I-121, INTERACTION_MATRIX.md:350 | web/components/box/Reveal.tsx:266 | web/components/box/Reveal.tsx:270 그대로 |
| I-122, INTERACTION_MATRIX.md:351 | web/components/box/Reveal.tsx:267 | web/components/box/Reveal.tsx:271 그대로 |
| I-123, INTERACTION_MATRIX.md:352 | web/components/box/Reveal.tsx:267,148,272 | web/components/box/Reveal.tsx:152,271,276 그대로 |
| I-124, INTERACTION_MATRIX.md:353 | web/components/box/Reveal.tsx:274 | web/components/box/Reveal.tsx:278 그대로 |
| I-125, INTERACTION_MATRIX.md:354 | web/components/box/Reveal.tsx:149-155 | web/components/box/Reveal.tsx:153-159 그대로 |
| I-126, INTERACTION_MATRIX.md:355 | web/components/box/Reveal.tsx:163,301,127-134 | web/components/box/Reveal.tsx:130-138,134,167,305 의도된 변경(W3) |
| I-127, INTERACTION_MATRIX.md:356 | web/components/box/Reveal.tsx:293 | web/components/box/Reveal.tsx:297 그대로 |
| I-128, INTERACTION_MATRIX.md:357 | web/components/box/Reveal.tsx:182-214,162,193 | web/components/box/Reveal.tsx:166,186-218,197 그대로 |
| I-169, INTERACTION_MATRIX.md:403 | web/components/account/AccountSheets.tsx:39,42,29-36 | web/components/account/AccountSheets.tsx:29-36,39,42 그대로 |
| I-170, INTERACTION_MATRIX.md:404 | web/components/account/AccountSheets.tsx:69-73,57-64 | web/components/account/AccountSheets.tsx:74-95,76-77,79-93,105-109 의도된 변경(W2 E-03) |
| I-171, INTERACTION_MATRIX.md:405 | web/components/account/AccountSheets.tsx:56,66-67 | web/components/account/AccountSheets.tsx:56,102-103 그대로 |
| I-172, INTERACTION_MATRIX.md:406 | web/components/account/AccountSheets.tsx:97-101,88-93 | web/components/account/AccountSheets.tsx:124-129,133-137 그대로 |
| I-174, INTERACTION_MATRIX.md:408 | web/components/inventory/InventoryScreen.tsx:114 | web/components/inventory/InventoryScreen.tsx:118 그대로 |
| I-175, INTERACTION_MATRIX.md:409 | web/components/inventory/InventoryScreen.tsx:117,70 | web/components/inventory/InventoryScreen.tsx:70,121 그대로 |
| I-176, INTERACTION_MATRIX.md:410 | web/components/inventory/InventoryScreen.tsx:119,184 | web/components/inventory/InventoryScreen.tsx:123,188 그대로 |
| I-177, INTERACTION_MATRIX.md:411 | web/components/inventory/InventoryScreen.tsx:121 | web/components/inventory/InventoryScreen.tsx:125 그대로 |
| I-178, INTERACTION_MATRIX.md:412 | web/components/inventory/InventoryScreen.tsx:128 | web/components/inventory/InventoryScreen.tsx:132 그대로 |
| I-179, INTERACTION_MATRIX.md:413 | web/components/inventory/InventoryScreen.tsx:138 | web/components/inventory/InventoryScreen.tsx:142 그대로 |
| I-180, INTERACTION_MATRIX.md:414 | web/components/inventory/InventoryScreen.tsx:168,186,89-95 | web/components/inventory/InventoryScreen.tsx:92-99,96,172,190 의도된 변경(W3) |
| I-181, INTERACTION_MATRIX.md:415 | web/components/inventory/InventoryScreen.tsx:168,186<br>web/components/ui/Sheet.tsx:44 | web/components/inventory/InventoryScreen.tsx:172,190 그대로<br>web/components/ui/Sheet.tsx:52 의도된 변경(W2 E-08) |
| I-182, INTERACTION_MATRIX.md:416 | web/components/inventory/InventoryScreen.tsx:172,180 | web/components/inventory/InventoryScreen.tsx:176,184 그대로 |
| I-183, INTERACTION_MATRIX.md:417 | web/components/inventory/InventoryScreen.tsx:174,103,181 | web/components/inventory/InventoryScreen.tsx:107,178,185 그대로 |
| I-184, INTERACTION_MATRIX.md:418 | web/components/inventory/InventoryScreen.tsx:158,182 | web/components/inventory/InventoryScreen.tsx:162,186 그대로 |
| I-185, INTERACTION_MATRIX.md:419 | web/components/inventory/InventoryScreen.tsx:173 | web/components/inventory/InventoryScreen.tsx:177 그대로 |
| I-186, INTERACTION_MATRIX.md:420 | web/components/inventory/InventoryScreen.tsx:169,187,96-102 | web/components/inventory/InventoryScreen.tsx:100-106,173,191 그대로 |
| I-187, INTERACTION_MATRIX.md:421 | web/components/inventory/InventoryScreen.tsx:170 | web/components/inventory/InventoryScreen.tsx:174 그대로 |
| I-188, INTERACTION_MATRIX.md:422 | web/components/inventory/InventoryScreen.tsx:61-69 | web/components/inventory/InventoryScreen.tsx:61-69 그대로 |
| I-195, INTERACTION_MATRIX.md:429 | web/components/flow/ReviewSheet.tsx:56 | web/components/flow/ReviewSheet.tsx:68 그대로 |
| I-196, INTERACTION_MATRIX.md:430 | web/components/flow/ReviewSheet.tsx:59 | web/components/flow/ReviewSheet.tsx:71 그대로 |
| I-197, INTERACTION_MATRIX.md:431 | web/components/flow/ReviewSheet.tsx:63,40-44,17-29 | web/components/flow/ReviewSheet.tsx:17-29,50-56,53-55,75 의도된 변경(W3 E-15) |
| I-198, INTERACTION_MATRIX.md:432 | web/components/flow/ReviewSheet.tsx:69,45-52 | web/components/flow/ReviewSheet.tsx:57-64,61,81 의도된 변경(W3 E-15) |
| I-199, INTERACTION_MATRIX.md:433 | web/components/flow/ReviewSheet.tsx:69<br>web/components/inventory/InventoryScreen.tsx:168,186 | web/components/flow/ReviewSheet.tsx:81 그대로<br>web/components/inventory/InventoryScreen.tsx:172,190 그대로 |
| I-200, INTERACTION_MATRIX.md:434 | web/components/wallet/WalletScreen.tsx:94 | web/components/wallet/WalletScreen.tsx:104 그대로 |
| I-201, INTERACTION_MATRIX.md:435 | web/components/wallet/WalletScreen.tsx:102 | web/components/wallet/WalletScreen.tsx:112 그대로 |
| I-202, INTERACTION_MATRIX.md:436 | web/components/wallet/WalletScreen.tsx:103 | web/components/wallet/WalletScreen.tsx:113 그대로 |
| I-203, INTERACTION_MATRIX.md:437 | web/components/wallet/WalletScreen.tsx:111 | web/components/wallet/WalletScreen.tsx:121 그대로 |
| I-204, INTERACTION_MATRIX.md:438 | web/components/wallet/WalletScreen.tsx:119 | web/components/wallet/WalletScreen.tsx:129 그대로 |
| I-205, INTERACTION_MATRIX.md:439 | web/components/wallet/WalletScreen.tsx:138,145,78-88<br>web/lib/api.ts:55<br>web/stores/walletStore.ts:197-202 | web/components/wallet/WalletScreen.tsx:84-98,92-96,152,159 의도된 변경(W2 E-01/E-06)<br>web/lib/api.ts:68-69 의도된 변경(W2 E-01/E-06)<br>web/stores/walletStore.ts:221-226 그대로 |
| I-206, INTERACTION_MATRIX.md:440 | web/components/wallet/WalletScreen.tsx:139-141 | web/components/wallet/WalletScreen.tsx:153-155 그대로 |
| I-207, INTERACTION_MATRIX.md:441 | web/components/wallet/WalletScreen.tsx:44-62,64 | web/components/wallet/WalletScreen.tsx:45-67,57-61,69 의도된 변경(W2 E-01/E-06) |
| I-208, INTERACTION_MATRIX.md:442 | web/components/wallet/WithdrawScreen.tsx:170 | web/components/wallet/WithdrawScreen.tsx:187 그대로 |
| I-209, INTERACTION_MATRIX.md:443 | web/components/wallet/WithdrawScreen.tsx:174 | web/components/wallet/WithdrawScreen.tsx:191 그대로 |
| I-210, INTERACTION_MATRIX.md:444 | web/components/wallet/WithdrawScreen.tsx:183,185-187 | web/components/wallet/WithdrawScreen.tsx:200,202-204 그대로 |
| I-211, INTERACTION_MATRIX.md:445 | web/components/wallet/WithdrawScreen.tsx:184 | web/components/wallet/WithdrawScreen.tsx:201 그대로 |
| I-212, INTERACTION_MATRIX.md:446 | web/components/wallet/WithdrawScreen.tsx:241,93,262 | web/components/wallet/WithdrawScreen.tsx:93,258,280 그대로 |
| I-213, INTERACTION_MATRIX.md:447 | web/components/wallet/WithdrawScreen.tsx:242 | web/components/wallet/WithdrawScreen.tsx:259 그대로 |
| I-214, INTERACTION_MATRIX.md:448 | web/components/wallet/WithdrawScreen.tsx:244 | web/components/wallet/WithdrawScreen.tsx:261 그대로 |
| I-215, INTERACTION_MATRIX.md:449 | web/components/wallet/WithdrawScreen.tsx:246<br>web/components/wallet/WithdrawScreen.tsx:78 | web/components/wallet/WithdrawScreen.tsx:263 그대로<br>web/components/wallet/WithdrawScreen.tsx:78 그대로 |
| I-216, INTERACTION_MATRIX.md:450 | web/components/wallet/WithdrawScreen.tsx:249,82 | web/components/wallet/WithdrawScreen.tsx:82,266 그대로 |
| I-217, INTERACTION_MATRIX.md:451 | web/components/wallet/WithdrawScreen.tsx:238,261,103-110 | web/components/wallet/WithdrawScreen.tsx:108-115,255,279 그대로 |
| I-218, INTERACTION_MATRIX.md:452 | web/components/wallet/WithdrawScreen.tsx:193,72 | web/components/wallet/WithdrawScreen.tsx:72,210 그대로 |
| I-219, INTERACTION_MATRIX.md:453 | web/components/wallet/WithdrawScreen.tsx:201 | web/components/wallet/WithdrawScreen.tsx:218 그대로 |
| I-220, INTERACTION_MATRIX.md:454 | web/components/wallet/WithdrawScreen.tsx:207,211 | web/components/wallet/WithdrawScreen.tsx:224,228 그대로 |
| I-221, INTERACTION_MATRIX.md:455 | web/components/wallet/WithdrawScreen.tsx:206-210,137-151,113-134<br>web/components/wallet/WithdrawScreen.tsx:123 | web/components/wallet/WithdrawScreen.tsx:118-151,126-129,135-146,154-168,223-227 의도된 변경(W2 E-01/E-06)<br>web/components/wallet/WithdrawScreen.tsx:126-129 의도된 변경(W2 E-01/E-06) |
| I-222, INTERACTION_MATRIX.md:456 | web/components/wallet/WithdrawScreen.tsx:216-221,152-167 | web/components/wallet/WithdrawScreen.tsx:169-184,233-238 그대로 |
| I-223, INTERACTION_MATRIX.md:457 | web/components/wallet/WithdrawScreen.tsx:233 | web/components/wallet/WithdrawScreen.tsx:250 그대로 |
| I-224, INTERACTION_MATRIX.md:458 | web/components/verify/VerifyScreen.tsx:77 | web/components/verify/VerifyScreen.tsx:82 그대로 |
| I-225, INTERACTION_MATRIX.md:459 | web/components/verify/VerifyScreen.tsx:84 | web/components/verify/VerifyScreen.tsx:89 그대로 |
| I-226, INTERACTION_MATRIX.md:460 | web/components/verify/VerifyScreen.tsx:91 | web/components/verify/VerifyScreen.tsx:96 그대로 |
| I-227, INTERACTION_MATRIX.md:461 | web/components/verify/VerifyScreen.tsx:99-102 | web/components/verify/VerifyScreen.tsx:104-107 그대로 |
| I-228, INTERACTION_MATRIX.md:462 | web/components/verify/VerifyScreen.tsx:103 | web/components/verify/VerifyScreen.tsx:108 그대로 |
| I-229, INTERACTION_MATRIX.md:463 | web/components/verify/VerifyScreen.tsx:105,57-68<br>web/components/verify/VerifyScreen.tsx:96-105 | web/components/verify/VerifyScreen.tsx:60-73,63,68,71,110 의도된 변경(W3)<br>web/components/verify/VerifyScreen.tsx:101-110 그대로 |
| I-230, INTERACTION_MATRIX.md:464 | web/components/verify/VerifyScreen.tsx:45-50 | web/components/verify/VerifyScreen.tsx:45-50 그대로 |
| I-241, INTERACTION_MATRIX.md:480 | web/components/auth/AuthHost.tsx:20-24,25-48<br>web/components/auth/AuthHost.tsx:39-45 | web/components/auth/AuthHost.tsx:20-24,25-50,27-28,49 의도된 변경(W3)<br>web/components/auth/AuthHost.tsx:41-46 의도된 변경(W3) |
| I-242, INTERACTION_MATRIX.md:481 | web/components/box/BoxScreen.tsx:140-158<br>web/components/box/Reveal.tsx:127-134<br>web/components/inventory/InventoryScreen.tsx:89-102<br>web/components/wallet/WalletScreen.tsx:78-88<br>web/components/verify/VerifyScreen.tsx:57-68<br>web/components/account/AccountSheets.tsx:29-36,57-64,88-93 | web/components/box/BoxScreen.tsx:138-156 그대로<br>web/components/box/Reveal.tsx:130-138,134 의도된 변경(W3)<br>web/components/inventory/InventoryScreen.tsx:92-106,96 의도된 변경(W3)<br>web/components/wallet/WalletScreen.tsx:84-98,92-96 의도된 변경(W2 E-01/E-06)<br>web/components/verify/VerifyScreen.tsx:60-73,63,68,71 의도된 변경(W3)<br>web/components/account/AccountSheets.tsx:29-36,74-95,76-77,79-93,124-129 의도된 변경(W2 E-03) |
| I-244, INTERACTION_MATRIX.md:483 | web/components/wallet/WithdrawScreen.tsx:185-187 | web/components/wallet/WithdrawScreen.tsx:202-204 그대로 |
| I-245, INTERACTION_MATRIX.md:484 | web/components/box/BoxReviews.tsx:126 | web/components/box/BoxReviews.tsx:195 그대로 |
| I-246, INTERACTION_MATRIX.md:485 | web/app/ui.css:15<br>web/app/ui.css:102 | web/app/ui.css:15 그대로<br>web/app/ui.css:102 그대로 |
| I-247, INTERACTION_MATRIX.md:486 | web/app/ui.css:60-63 | web/app/ui.css:60-63 그대로 |
| I-248, INTERACTION_MATRIX.md:487 | web/app/ui.css:65,38,122,173 | web/app/ui.css:38,65,122,170 그대로 |
| I-249, INTERACTION_MATRIX.md:488 | web/app/ui.css:69,36,91,368 | web/app/ui.css:36,69,91,354 그대로 |
| I-250, INTERACTION_MATRIX.md:489 | web/app/ui.css:77-78 | web/app/ui.css:77-78 그대로 |
| I-251, INTERACTION_MATRIX.md:490 | web/app/ui.css:147,52 | web/app/ui.css:52,147 그대로 |
| I-252, INTERACTION_MATRIX.md:491 | web/app/ui.css:9,14 | web/app/ui.css:9,14 그대로 |

#### STATE_TRANSITIONS

| 항목과 인벤토리 줄 | 변경 파일의 원본 인용 | 결과 대응과 분류 |
|---|---|---|
| S-003, STATE_TRANSITIONS.md:150 | web/components/auth/AuthHost.tsx:25-48<br>web/stores/walletStore.ts:152-156,248-257 | web/components/auth/AuthHost.tsx:25-50,27-28,49 의도된 변경(W3)<br>web/stores/walletStore.ts:176-180,289-298 그대로 |
| S-008, STATE_TRANSITIONS.md:225 | web/components/account/AccountSheets.tsx:56,66 | web/components/account/AccountSheets.tsx:56,102 그대로 |
| S-009, STATE_TRANSITIONS.md:240 | web/lib/browserWallet.ts:5-20 | web/lib/browserWallet.ts:15-30 그대로 |
| S-010, STATE_TRANSITIONS.md:256 | web/components/auth/AuthHost.tsx:25-26<br>web/lib/browserWallet.ts:5-20<br>web/components/box/BoxScreen.tsx:113 | web/components/auth/AuthHost.tsx:25-26 그대로<br>web/lib/browserWallet.ts:15-30 그대로<br>web/components/box/BoxScreen.tsx:111 그대로 |
| S-011, STATE_TRANSITIONS.md:271 | web/components/auth/AuthHost.tsx:20-24 | web/components/auth/AuthHost.tsx:20-24 그대로 |
| S-013, STATE_TRANSITIONS.md:302 | web/components/box/BoxScreen.tsx:142 | web/components/box/BoxScreen.tsx:140 그대로 |
| S-014, STATE_TRANSITIONS.md:318 | web/components/account/AccountSheets.tsx:15-45 | web/components/account/AccountSheets.tsx:15-45 그대로 |
| S-015, STATE_TRANSITIONS.md:333 | web/components/account/AccountSheets.tsx:51-53,61<br>web/components/account/AccountSheets.tsx:57-64 | web/components/account/AccountSheets.tsx:51-53,79-93 의도된 변경(W2 E-03)<br>web/components/account/AccountSheets.tsx:74-95,76-77,79-93 의도된 변경(W2 E-03) |
| S-016, STATE_TRANSITIONS.md:350 | web/components/account/AccountSheets.tsx:80-104 | web/components/account/AccountSheets.tsx:116-140 그대로 |
| S-019, STATE_TRANSITIONS.md:399 | web/stores/walletStore.ts:176-196 | web/stores/walletStore.ts:200-220 그대로 |
| S-021, STATE_TRANSITIONS.md:431 | web/components/box/BoxScreen.tsx:140-170 | web/components/box/BoxScreen.tsx:138-168 그대로 |
| S-023, STATE_TRANSITIONS.md:461 | web/components/box/BoxScreen.tsx:150-152 | web/components/box/BoxScreen.tsx:148-150 그대로 |
| S-024, STATE_TRANSITIONS.md:479 | web/components/box/BoxScreen.tsx:47-48,160-166,316 | web/components/box/BoxScreen.tsx:46-47,158-164,314 그대로 |
| S-025, STATE_TRANSITIONS.md:494 | web/components/box/Reveal.tsx:93-164,215-279 | web/components/box/Reveal.tsx:96-168,134,219-283 의도된 변경(W3) |
| S-026, STATE_TRANSITIONS.md:509 | web/components/box/Reveal.tsx:158,220-221 | web/components/box/Reveal.tsx:162,224-225 그대로 |
| S-028, STATE_TRANSITIONS.md:539 | web/components/box/BoxScreen.tsx:80-82,210<br>web/stores/walletStore.ts:157 | web/components/box/BoxScreen.tsx:79-81,208 그대로<br>web/stores/walletStore.ts:181 그대로 |
| S-029, STATE_TRANSITIONS.md:554 | web/components/box/BoxScreen.tsx:83,202,209 | web/components/box/BoxScreen.tsx:82,200,207 그대로 |
| S-030, STATE_TRANSITIONS.md:569 | web/components/box/BoxScreen.tsx:85-87,207,318 | web/components/box/BoxScreen.tsx:84-86,205,316 그대로 |
| S-031, STATE_TRANSITIONS.md:584 | web/components/box/BoxScreen.tsx:208 | web/components/box/BoxScreen.tsx:206 그대로 |
| S-032, STATE_TRANSITIONS.md:599 | web/components/box/BoxScreen.tsx:155 | web/components/box/BoxScreen.tsx:153 그대로 |
| S-033, STATE_TRANSITIONS.md:614 | web/components/box/BoxScreen.tsx:205,142 | web/components/box/BoxScreen.tsx:140,203 그대로 |
| S-034, STATE_TRANSITIONS.md:629 | web/components/box/BoxScreen.tsx:153-157,198 | web/components/box/BoxScreen.tsx:151-155,196 그대로 |
| S-036, STATE_TRANSITIONS.md:660 | web/components/box/BoxScreen.tsx:77,142,161 | web/components/box/BoxScreen.tsx:76,140,159 그대로 |
| S-037, STATE_TRANSITIONS.md:675 | web/components/box/Reveal.tsx:55,73,78 | web/components/box/Reveal.tsx:55,73,78 그대로 |
| S-038, STATE_TRANSITIONS.md:691 | web/components/box/Reveal.tsx:70,73,175 | web/components/box/Reveal.tsx:70,73,179 그대로 |
| S-039, STATE_TRANSITIONS.md:706 | web/components/box/BoxScreen.tsx:111-117,199,206 | web/components/box/BoxScreen.tsx:109-115,197,204 그대로 |
| S-040, STATE_TRANSITIONS.md:721 | web/components/box/BoxScreen.tsx:113 | web/components/box/BoxScreen.tsx:111 그대로 |
| S-041, STATE_TRANSITIONS.md:736 | web/components/box/BoxScreen.tsx:119-138 | web/components/box/BoxScreen.tsx:117-136 그대로 |
| S-042, STATE_TRANSITIONS.md:751 | web/components/box/BoxScreen.tsx:114-115,200 | web/components/box/BoxScreen.tsx:112-113,198 그대로 |
| S-043, STATE_TRANSITIONS.md:766 | web/components/box/Reveal.tsx:53,83 | web/components/box/Reveal.tsx:53,83 그대로 |
| S-046, STATE_TRANSITIONS.md:813 | web/components/box/Reveal.tsx:84 | web/components/box/Reveal.tsx:84 그대로 |
| S-053, STATE_TRANSITIONS.md:921 | web/components/box/BoxScreen.tsx:170 | web/components/box/BoxScreen.tsx:168 그대로 |
| S-057, STATE_TRANSITIONS.md:983 | web/components/box/BoxScreen.tsx:159-165<br>web/components/box/BoxScreen.tsx:319-320 | web/components/box/BoxScreen.tsx:157-163 그대로<br>web/components/box/BoxScreen.tsx:317-318 그대로 |
| S-059, STATE_TRANSITIONS.md:1016 | web/components/box/Reveal.tsx:139<br>web/components/box/Reveal.tsx:139-142,266,299 | web/components/box/Reveal.tsx:143 그대로<br>web/components/box/Reveal.tsx:143-146,270,303 그대로 |
| S-060, STATE_TRANSITIONS.md:1032 | web/components/box/Reveal.tsx:125-134,284-296,301 | web/components/box/Reveal.tsx:128-138,134,288-300,305 의도된 변경(W3) |
| S-067, STATE_TRANSITIONS.md:1140 | web/components/inventory/InventoryScreen.tsx:81-86,165-175 | web/components/inventory/InventoryScreen.tsx:84-89,169-179 그대로 |
| S-071, STATE_TRANSITIONS.md:1206 | web/components/inventory/InventoryScreen.tsx:89-95,165-175,186 | web/components/inventory/InventoryScreen.tsx:92-99,96,169-179,190 의도된 변경(W3) |
| S-074, STATE_TRANSITIONS.md:1254 | web/components/inventory/InventoryScreen.tsx:96-102 | web/components/inventory/InventoryScreen.tsx:100-106 그대로 |
| S-075, STATE_TRANSITIONS.md:1269 | web/components/inventory/InventoryScreen.tsx:152-153,170 | web/components/inventory/InventoryScreen.tsx:156-157,174 그대로 |
| S-076, STATE_TRANSITIONS.md:1286 | web/components/wallet/WithdrawScreen.tsx:51,69,179-189 | web/components/wallet/WithdrawScreen.tsx:51,69,196-206 그대로 |
| S-077, STATE_TRANSITIONS.md:1301 | web/components/wallet/WithdrawScreen.tsx:74-82,103-110,244-258 | web/components/wallet/WithdrawScreen.tsx:74-82,108-115,261-275 그대로 |
| S-078, STATE_TRANSITIONS.md:1322 | web/components/wallet/WithdrawScreen.tsx:103-110,191-203 | web/components/wallet/WithdrawScreen.tsx:108-115,208-220 그대로 |
| S-079, STATE_TRANSITIONS.md:1337 | web/components/wallet/WithdrawScreen.tsx:84-101,241,262 | web/components/wallet/WithdrawScreen.tsx:84-101,258,280 그대로 |
| S-080, STATE_TRANSITIONS.md:1352 | web/components/wallet/WithdrawScreen.tsx:123<br>web/components/wallet/WithdrawScreen.tsx:113-151<br>web/lib/api.ts:49-53<br>web/stores/walletStore.ts:232-237 | web/components/wallet/WithdrawScreen.tsx:126-129 의도된 변경(W2 E-01/E-06)<br>web/components/wallet/WithdrawScreen.tsx:118-168,126-129,135-146 의도된 변경(W2 E-01/E-06)<br>web/lib/api.ts:63-67 그대로<br>web/stores/walletStore.ts:273-278 그대로 |
| S-081, STATE_TRANSITIONS.md:1368 | web/components/wallet/WithdrawScreen.tsx:152-167,215-223 | web/components/wallet/WithdrawScreen.tsx:169-184,232-240 그대로 |
| S-082, STATE_TRANSITIONS.md:1383 | web/components/wallet/WalletScreen.tsx:44-62<br>web/stores/walletStore.ts:197-202 | web/components/wallet/WalletScreen.tsx:45-67,57-61 의도된 변경(W2 E-01/E-06)<br>web/stores/walletStore.ts:221-226 그대로 |
| S-083, STATE_TRANSITIONS.md:1398 | web/components/wallet/WalletScreen.tsx:78-88,138,145 | web/components/wallet/WalletScreen.tsx:84-98,92-96,152,159 의도된 변경(W2 E-01/E-06) |
| S-084, STATE_TRANSITIONS.md:1413 | web/components/wallet/WithdrawScreen.tsx:50-61 | web/components/wallet/WithdrawScreen.tsx:50-61 그대로 |
| S-085, STATE_TRANSITIONS.md:1430 | web/components/flow/ReviewSheet.tsx:31-73<br>web/components/box/BoxReviews.tsx:97-118,165-167 | web/components/flow/ReviewSheet.tsx:31-85,39-48,53-55,61 의도된 변경(W3 E-15)<br>web/components/box/BoxReviews.tsx:142-186,145,148-150,153-154,157-184,263-265 의도된 변경(W1) |
| S-086, STATE_TRANSITIONS.md:1445 | web/components/flow/ReviewSheet.tsx:40-52,66-68 | web/components/flow/ReviewSheet.tsx:50-64,53-55,61,78-80 의도된 변경(W3 E-15) |
| S-087, STATE_TRANSITIONS.md:1465 | web/components/inventory/InventoryScreen.tsx:107-108,155-160 | web/components/inventory/InventoryScreen.tsx:111-112,159-164 그대로 |
| S-089, STATE_TRANSITIONS.md:1500 | web/components/verify/VerifyScreen.tsx:84 | web/components/verify/VerifyScreen.tsx:89 그대로 |
| S-091, STATE_TRANSITIONS.md:1534 | web/components/verify/VerifyScreen.tsx:58-59<br>web/components/verify/VerifyScreen.tsx:57-68,99-116 | web/components/verify/VerifyScreen.tsx:61-62 그대로<br>web/components/verify/VerifyScreen.tsx:60-73,63,68,71,104-121 의도된 변경(W3) |
| S-092, STATE_TRANSITIONS.md:1555 | web/components/verify/VerifyScreen.tsx:43-50 | web/components/verify/VerifyScreen.tsx:43-50 그대로 |
| S-094, STATE_TRANSITIONS.md:1588 | web/lib/formatCurrency.ts:31-49 | web/lib/formatCurrency.ts:34-52 그대로 |
| S-098, STATE_TRANSITIONS.md:1662 | web/components/box/BoxList.tsx:47-49 | web/components/box/BoxList.tsx:50-52 그대로 |
| S-104, STATE_TRANSITIONS.md:1761 | web/components/box/BoxScreen.tsx:125-133<br>web/components/box/BoxScreen.tsx:119-138 | web/components/box/BoxScreen.tsx:123-131 그대로<br>web/components/box/BoxScreen.tsx:117-136 그대로 |
| S-105, STATE_TRANSITIONS.md:1777 | web/components/wallet/WithdrawScreen.tsx:115<br>web/components/wallet/WithdrawScreen.tsx:113-134<br>web/stores/walletStore.ts:197-202<br>web/components/wallet/WithdrawScreen.tsx:113-134 | web/components/wallet/WithdrawScreen.tsx:120 그대로<br>web/components/wallet/WithdrawScreen.tsx:118-151,126-129,135-146 의도된 변경(W2 E-01/E-06)<br>web/stores/walletStore.ts:221-226 그대로<br>web/components/wallet/WithdrawScreen.tsx:118-151,126-129,135-146 의도된 변경(W2 E-01/E-06) |
| S-106, STATE_TRANSITIONS.md:1793 | web/components/wallet/WithdrawScreen.tsx:77-78 | web/components/wallet/WithdrawScreen.tsx:77-78 그대로 |
| S-107, STATE_TRANSITIONS.md:1809 | web/components/flow/ReviewSheet.tsx:34-36,49<br>web/components/inventory/InventoryScreen.tsx:182 | web/components/flow/ReviewSheet.tsx:34-36,61 의도된 변경(W3 E-15)<br>web/components/inventory/InventoryScreen.tsx:186 그대로 |
| S-108, STATE_TRANSITIONS.md:1825 | web/components/flow/ReviewSheet.tsx:49-50 | web/components/flow/ReviewSheet.tsx:61,62 의도된 변경(W3 E-15) |
| S-109, STATE_TRANSITIONS.md:1841 | web/lib/reviewSamples.ts:69-71<br>web/components/box/BoxList.tsx:117<br>web/components/box/BoxScreen.tsx:107-108 | web/lib/reviewSamples.ts:186-602,187-601 의도된 변경(W1)<br>web/components/box/BoxList.tsx:119-120 의도된 변경(W1)<br>web/components/box/BoxScreen.tsx:105-106 의도된 변경(W1) |
| S-110, STATE_TRANSITIONS.md:1857 | web/components/box/ReviewsScreen.tsx:21-22 | web/components/box/ReviewsScreen.tsx:23,24-27 의도된 변경(W1) |
| S-111, STATE_TRANSITIONS.md:1873 | web/components/verify/VerifyScreen.tsx:58-59 | web/components/verify/VerifyScreen.tsx:61-62 그대로 |
| S-112, STATE_TRANSITIONS.md:1889 | web/components/verify/VerifyScreen.tsx:57-68,99-105 | web/components/verify/VerifyScreen.tsx:60-73,63,68,71,104-110 의도된 변경(W3) |
| S-115, STATE_TRANSITIONS.md:1937 | web/components/auth/AuthHost.tsx:36-45 | web/components/auth/AuthHost.tsx:38-46 의도된 변경(W3) |

#### FEATURE_PARITY

| 항목과 인벤토리 줄 | 변경 파일의 원본 인용 | 결과 대응과 분류 |
|---|---|---|
| F-004, FEATURE_PARITY.md:53 | web/components/box/BoxList.tsx:56 | web/components/box/BoxList.tsx:59 그대로 |
| F-012, FEATURE_PARITY.md:61 | web/components/box/BoxScreen.tsx:88-99,248-266,288<br>web/components/box/Reveal.tsx:189,207 | web/components/box/BoxScreen.tsx:87-98,246-264,286 그대로<br>web/components/box/Reveal.tsx:193,211 그대로 |
| F-013, FEATURE_PARITY.md:62 | web/components/box/BoxScreen.tsx:88-99,249-257 | web/components/box/BoxScreen.tsx:87-98,247-255 그대로 |
| F-014, FEATURE_PARITY.md:63 | web/components/box/BoxScreen.tsx:파일 전체 | web/components/box/BoxScreen.tsx:파일 전체 의도된 변경(W1) |
| F-015, FEATURE_PARITY.md:64 | web/components/box/BoxScreen.tsx:160-164 | web/components/box/BoxScreen.tsx:158-162 그대로 |
| F-017, FEATURE_PARITY.md:66 | web/components/box/BoxList.tsx:56 | web/components/box/BoxList.tsx:59 그대로 |
| F-026, FEATURE_PARITY.md:80 | web/stores/walletStore.ts:19,152-154 | web/stores/walletStore.ts:19,176-178 그대로 |
| F-031, FEATURE_PARITY.md:85 | web/components/box/BoxScreen.tsx:142-143 | web/components/box/BoxScreen.tsx:140-141 그대로 |
| F-034, FEATURE_PARITY.md:88 | web/components/box/BoxScreen.tsx:111-138 | web/components/box/BoxScreen.tsx:109-136 그대로 |
| F-040, FEATURE_PARITY.md:94 | web/components/box/Reveal.tsx:135-140 | web/components/box/Reveal.tsx:139-144 그대로 |
| F-041, FEATURE_PARITY.md:95 | web/components/box/Reveal.tsx:143-147 | web/components/box/Reveal.tsx:147-151 그대로 |
| F-048, FEATURE_PARITY.md:102 | web/components/verify/VerifyScreen.tsx:45-68 | web/components/verify/VerifyScreen.tsx:45-73,57-59,63,68,71 의도된 변경(W3) |
| F-050, FEATURE_PARITY.md:109 | web/stores/walletStore.ts:131,245,246 | web/stores/walletStore.ts:155,286,287 그대로 |
| F-051, FEATURE_PARITY.md:110 | web/stores/walletStore.ts:238-244 | web/stores/walletStore.ts:279-285 그대로 |
| F-053, FEATURE_PARITY.md:112 | web/stores/walletStore.ts:163,176-196,203-219 | web/stores/walletStore.ts:187,200-220,227-243 그대로 |
| F-054, FEATURE_PARITY.md:113 | web/stores/walletStore.ts:185,186 | web/stores/walletStore.ts:209,210 그대로 |
| F-055, FEATURE_PARITY.md:114 | web/stores/walletStore.ts:14,16,251-257<br>web/components/auth/AuthHost.tsx:25-35 | web/stores/walletStore.ts:14,16,292-298 그대로<br>web/components/auth/AuthHost.tsx:25-37,27-28 의도된 변경(W3) |
| F-056, FEATURE_PARITY.md:115 | web/components/wallet/WithdrawScreen.tsx:75-82 | web/components/wallet/WithdrawScreen.tsx:75-82 그대로 |
| F-058, FEATURE_PARITY.md:117 | web/components/wallet/WithdrawScreen.tsx:103-130 | web/components/wallet/WithdrawScreen.tsx:108-147,126-129,135-146 의도된 변경(W2 E-01/E-06) |
| F-059, FEATURE_PARITY.md:118 | web/components/wallet/WithdrawScreen.tsx:137-167 | web/components/wallet/WithdrawScreen.tsx:154-184 그대로 |
| F-060, FEATURE_PARITY.md:119 | web/stores/walletStore.ts:197-202,220-230<br>web/components/wallet/WalletScreen.tsx:44-62,78-88 | web/stores/walletStore.ts:221-226,244-254 그대로<br>web/components/wallet/WalletScreen.tsx:45-67,57-61,84-98,92-96 의도된 변경(W2 E-01/E-06) |
| F-062, FEATURE_PARITY.md:121 | web/components/wallet/WalletScreen.tsx:66-71 | web/components/wallet/WalletScreen.tsx:71-72,73-77 의도된 변경(W2 E-01/E-06) |
| F-066, FEATURE_PARITY.md:125 | web/components/account/AccountSheets.tsx:파일 전체 | web/components/account/AccountSheets.tsx:파일 전체 의도된 변경(W2 E-03) |
| F-067, FEATURE_PARITY.md:126 | web/components/account/AccountSheets.tsx:57-64 | web/components/account/AccountSheets.tsx:74-95,76-77,79-93 의도된 변경(W2 E-03) |
| F-068, FEATURE_PARITY.md:127 | web/components/account/AccountSheets.tsx:88-101 | web/components/account/AccountSheets.tsx:124-137 그대로 |
| F-072, FEATURE_PARITY.md:131 | web/lib/browserWallet.ts:5-20<br>web/components/auth/AuthHost.tsx:25-27 | web/lib/browserWallet.ts:15-30 그대로<br>web/components/auth/AuthHost.tsx:25-29,27-28 의도된 변경(W3) |
| F-075, FEATURE_PARITY.md:141 | web/lib/reviewSamples.ts:1,17 | web/lib/reviewSamples.ts:1-33 의도된 변경(W1) |
| F-076, FEATURE_PARITY.md:142 | web/components/box/BoxReviews.tsx:100-116<br>web/components/box/ReviewsScreen.tsx:23-28<br>web/components/box/BoxReviews.tsx:104-114 | web/components/box/BoxReviews.tsx:144-156,145,148-150,153-154,157-184 의도된 변경(W1)<br>web/components/box/ReviewsScreen.tsx:24-27,28,29 의도된 변경(W1)<br>web/components/box/BoxReviews.tsx:148-150,151-155,153-154 의도된 변경(W1) |
| F-077, FEATURE_PARITY.md:143 | web/components/box/BoxReviews.tsx:109,113 | web/components/box/BoxReviews.tsx:153-154,153-154 의도된 변경(W1) |
| F-078, FEATURE_PARITY.md:144 | web/components/flow/ReviewSheet.tsx:14-29<br>web/components/box/BoxReviews.tsx:109,113 | web/components/flow/ReviewSheet.tsx:14-29 그대로<br>web/components/box/BoxReviews.tsx:153-154,153-154 의도된 변경(W1) |
| F-079, FEATURE_PARITY.md:145 | web/components/box/BoxReviews.tsx:89,109,113 | web/components/box/BoxReviews.tsx:111,153-154,153-154 의도된 변경(W1) |
| F-080, FEATURE_PARITY.md:146 | web/components/box/BoxReviews.tsx:106,109,112,113 | web/components/box/BoxReviews.tsx:148-150,153-154,153-154,153-154 의도된 변경(W1) |
| F-081, FEATURE_PARITY.md:147 | web/components/box/BoxReviews.tsx:104,111<br>web/components/box/ReviewsScreen.tsx:21-27 | web/components/box/BoxReviews.tsx:148-150,153-154 의도된 변경(W1)<br>web/components/box/ReviewsScreen.tsx:23-28,24-27,29 의도된 변경(W1) |
| F-082, FEATURE_PARITY.md:148 | web/lib/reviewSamples.ts:57<br>web/components/box/BoxReviews.tsx:57-67,177 | web/lib/reviewSamples.ts:65 그대로<br>web/components/box/BoxReviews.tsx:73-84,79,81-83,85-88,280-281 의도된 변경(W1) |
| F-083, FEATURE_PARITY.md:149 | web/components/box/BoxReviews.tsx:109,113,119,145,165 | web/components/box/BoxReviews.tsx:153-154,153-154,187,221-243,263 의도된 변경(W1) |
| F-084, FEATURE_PARITY.md:150 | web/components/flow/ReviewSheet.tsx:45-52 | web/components/flow/ReviewSheet.tsx:57-64,61 의도된 변경(W3 E-15) |
| F-085, FEATURE_PARITY.md:151 | web/components/box/BoxReviews.tsx:108 | web/components/box/BoxReviews.tsx:152 그대로 |
| F-088, FEATURE_PARITY.md:159 | web/messages/v.ko.json:파일 전체<br>web/messages/v.en.json:파일 전체<br>web/messages/v.zh.json:파일 전체 | web/messages/v.ko.json:파일 전체 의도된 변경(W1/W2)<br>web/messages/v.en.json:파일 전체 의도된 변경(W1/W2)<br>web/messages/v.zh.json:파일 전체 의도된 변경(W1/W2) |
| F-093, FEATURE_PARITY.md:164 | web/lib/formatCurrency.ts:18-48,55,102 | web/lib/formatCurrency.ts:21-51,23-24,58,114 의도된 변경(W2 E-14) |
| F-094, FEATURE_PARITY.md:165 | web/app/globals.css:65-80 | web/app/globals.css:66-81 그대로 |
| F-095, FEATURE_PARITY.md:166 | web/lib/formatCurrency.ts:64 | web/lib/formatCurrency.ts:67 그대로 |

## 3. 변경 범위 53파일 전수 분류

직접 실행한 것: rtk git diff 63445c7..HEAD --stat, rtk git diff 63445c7..HEAD --name-status, git diff 63445c7..HEAD --numstat. 종료 HEAD는 53파일, 추가 11,098줄, 삭제 209줄이다. 시작 HEAD의 수는 10,987와 207이었다. 삭제와 이름 변경 0파일. 아래의 삭제 줄은 파일 내 변경이며 파일 삭제가 아니다. web/package.json, web/package-lock.json, web/next.config.mjs, .github/workflows/deploy-pages.yml의 diff는 비어 있다. 의존성, 배포 설정, 이미지와 음원, 개봉 연출의 타이밍 파일은 바뀌지 않았다.

명세의 초기 E-01 방안은 차감 실패 요청을 만들지 않는 것이었다. 최종 구현은 접수 번호를 금액 0인 줄로 보존하고 취소를 시도한다. 이는 문서와 구현의 설계 차이지만, 이번 사용자 지시가 이 설계를 직접 검사하도록 지정했다. E-14 음수 표기도 명세 W2 표에 빠졌지만 이번 사용자 지시에 들어 있어 W2로 분류한다. 이 둘을 설명 안 되는 변경으로 숨기거나 세지 않았다.

| 변경 파일과 결과 첫 변경 줄 | 추가 | 삭제 | 분류 |
|---|---:|---:|---|
| DESIGN.md:98 | 3 | 0 | W1 승인된 샘플 규칙과 용어 기록 |
| migration-audit/harness/golden/catalog.json:1 | 2744 | 0 | 테스트 도구, 불변값 기준 자료 |
| migration-audit/harness/golden/compute.ts:1 | 182 | 0 | 테스트 도구, 불변값 기준 자료 |
| migration-audit/harness/golden/draws.json:1 | 1067 | 0 | 테스트 도구, 불변값 기준 자료 |
| migration-audit/harness/golden/generate.ts:1 | 59 | 0 | 테스트 도구, 불변값 기준 자료 |
| migration-audit/harness/golden/money.json:1 | 1206 | 0 | 테스트 도구, 불변값 기준 자료 |
| web/app/globals.css:10 | 1 | 0 | W1 후기 CSS 불러오기 |
| web/app/reviews.css:1 | 40 | 0 | W1 후기 전용 CSS |
| web/app/ui.css:166 | 1 | 15 | W1 옛 후기 CSS 삭제 |
| web/components/account/AccountSheets.tsx:8 | 40 | 4 | W2 E-03 현재 비밀번호 선확인과 성공 세션 종료 |
| web/components/auth/AuthHost.tsx:27 | 3 | 1 | W3 E-25 구독 해제 |
| web/components/box/BoxList.tsx:20 | 8 | 5 | W1 카드의 별점과 수 |
| web/components/box/BoxReviews.tsx:6 | 165 | 61 | W1 별점, 목록, 상세, 페이지 나눔 |
| web/components/box/BoxScreen.tsx:6 | 5 | 7 | W1 후기 절과 제목 아래 별점 |
| web/components/box/Reveal.tsx:92 | 4 | 0 | W3 E-39 늦은 받기 응답 무시 |
| web/components/box/ReviewsScreen.tsx:3 | 18 | 18 | W1 모아 보기와 박스 필터 |
| web/components/flow/ReviewSheet.tsx:6 | 15 | 3 | W3 E-15 상품별 초안과 사진 세대 |
| web/components/home/HeroBanner.tsx:129 | 2 | 1 | W3 E-19 훅을 return 앞으로 |
| web/components/home/heroBall.ts:80 | 14 | 4 | W3 E-20 GL 실패 정리 |
| web/components/inventory/InventoryScreen.tsx:10 | 5 | 1 | W3 E-39 늦은 받기 응답 무시 |
| web/components/ui/Sheet.tsx:10 | 9 | 1 | W2 E-08 확인창 350ms 잠금 |
| web/components/verify/VerifyScreen.tsx:9 | 7 | 2 | W3 E-16 계산 입력 일치 검사 |
| web/components/wallet/WalletScreen.tsx:9 | 23 | 9 | W2 E-01 접수 상태와 취소 표시, E-06 지갑 내역 |
| web/components/wallet/WithdrawScreen.tsx:19 | 24 | 6 | W2 E-01 차감과 기록, 차감 실패 접수 취소 |
| web/lib/api.ts:20 | 17 | 3 | W2 E-01 없는 접수 오류의 구분 |
| web/lib/browserWallet.ts:1 | 11 | 1 | W2 E-06 계정 장부의 번호 없는 거래 표시 |
| web/lib/formatCurrency.ts:18 | 16 | 4 | W2 E-14 음수 기호 순서, 이번 사용자 지시로 범위 확인 |
| web/lib/reviewFeed.ts:1 | 47 | 0 | W1 실제 후기와 샘플 집계 |
| web/lib/reviewSampleText.ts:1 | 2204 | 0 | W1 세 언어 글 재료 |
| web/lib/reviewSamples.ts:1 | 575 | 44 | W1 샘플 생성기와 집계 |
| web/messages/v.en.json:95 | 26 | 2 | W1 후기 문구와 W2 E-01, E-03 문구 |
| web/messages/v.ko.json:95 | 26 | 2 | W1 후기 문구와 W2 E-01, E-03 문구 |
| web/messages/v.zh.json:95 | 26 | 2 | W1 후기 문구와 W2 E-01, E-03 문구 |
| web/scripts/capture/flow-account-password.mjs:1 | 246 | 0 | 브라우저 검수 도구 |
| web/scripts/capture/flow-confirm-lock.mjs:1 | 212 | 0 | 브라우저 검수 도구 |
| web/scripts/capture/flow-review-draft.mjs:1 | 170 | 0 | 브라우저 검수 도구 |
| web/scripts/capture/flow-reviews.mjs:1 | 65 | 0 | 브라우저 검수 도구 |
| web/scripts/capture/flow-take.mjs:57 | 7 | 6 | 브라우저 검수 도구 |
| web/scripts/capture/flow-verify-stale.mjs:1 | 115 | 0 | 브라우저 검수 도구 |
| web/scripts/capture/flow-wallet-history.mjs:1 | 85 | 0 | 브라우저 검수 도구 |
| web/scripts/capture/flow-withdraw.mjs:1 | 263 | 0 | 브라우저 검수 도구 |
| web/scripts/capture/opening-qa.mjs:61 | 7 | 6 | 브라우저 검수 도구 |
| web/scripts/capture/opening.mjs:107 | 2 | 1 | 브라우저 검수 도구 |
| web/stores/walletStore.ts:62 | 41 | 0 | W2 E-01 접수 기록과 미차감 접수 종료 |
| web/tests/formatCurrency.test.ts:89 | 76 | 0 | 테스트, formatCurrency.test.ts |
| web/tests/heroBall.test.ts:1 | 86 | 0 | 테스트, heroBall.test.ts |
| web/tests/parityGolden.test.ts:1 | 71 | 0 | 테스트, parityGolden.test.ts |
| web/tests/reactStructure.test.ts:1 | 74 | 0 | 테스트, reactStructure.test.ts |
| web/tests/reviewFeed.test.ts:1 | 99 | 0 | 테스트, reviewFeed.test.ts |
| web/tests/reviewSamples.test.ts:1 | 475 | 0 | 테스트, reviewSamples.test.ts |
| web/tests/vMessages.test.ts:164 | 27 | 0 | 테스트, vMessages.test.ts |
| web/tests/walletHistory.test.ts:1 | 106 | 0 | 테스트, walletHistory.test.ts |
| web/tests/withdrawRefund.test.ts:1 | 278 | 0 | 테스트, withdrawRefund.test.ts |

코드에서 읽은 것: 기대값을 실제 구현에 맞춰 고쳐 통과시킨 흔적은 이 diff에서 찾지 못했다. 기존 capture 도구의 300ms 또는 즉시 누름을 500ms 기다림으로 바꾼 것은 E-08의 350ms 잠금 이후 정상 확정을 검사하기 위한 것이다. 돈의 기대값은 바꾸지 않았다. vMessages 테스트 추가는 새 후기 키와 용어 검사를 넓힌 것이다. golden 자료는 독립 재계산 결과와도 같았다.

## 4. 불변값 독립 계산

직접 실행한 것: rtk proxy git archive 63445c7 --output=T/original.tar, rtk proxy tar --force-local -xf T/original.tar -C T/original. 원본에 현재 소스 파일을 복사해 계산하지 않았다. web/node_modules만 원본 임시 폴더에서 같은 설치본으로 연결했고, 프로세스를 따로 띄워 각 소스의 모듈을 import했다. rtk proxy node T/run-source.mjs가 T/invariants.ts를 양쪽 web 폴더에서 각각 실행했다. T/report-data.mjs의 deepEqual은 두 전체 출력이 같음을 확인했다. 기존 golden JSON을 기대값으로 사용하지 않았다.

카탈로그 해시 입력은 BOXES의 배열 순서와 box.items의 순서 그대로, 각 행 slug|price|item.id|dropRate를 LF로 이어 붙인 UTF-8이다. 추첨 순서 해시는 같은 행을 dropTable 순서로 만든 것이다. 근거 web/lib/products.ts:345, web/lib/products.ts:379, web/lib/fairness.ts:92.

| 계산 | 원본 | 결과 |
|---|---:|---:|
| 전체 박스 | 334 | 334 |
| 홈 박스 | 320 | 320 |
| 상품 행 | 32,916 | 32,916 |
| 고유 상품 id | 21,007 | 21,007 |
| 확률 합이 정확히 1,000,000칸인 박스 | 334 | 334 |
| 확률 합이 다른 박스 | 0 | 0 |
| 고정 시드 추첨 비교 수 | 16,700 | 16,700 |

| SHA-256 대상 | 양쪽의 동일한 값 |
|---|---|
| 카탈로그 배열 순서 | 67fdb233f46f139d7357f53e2337a5386d27368bc13efec4e136ac9c7b425ed6 |
| 실제 추첨표 순서 | 3cb5c4cb79815b3f9674c19b1858d031028e609c146e4276fdbbb9685ba785d1 |
| 종류와 상품가까지 포함 | 5d6af693c4f89e6d5455014207b8518f0d558d7e5a029779e0106c6ae0b9e4d8 |
| 세 언어 이름과 사진 경로 | 1be190bcb6e3a0230778d6ec15250a2a446bb2de6c71e535d75d034527b3c62e |
| 16,700추첨 전체 출력 | f8b42bb15b571d9473f10dee299b2e004a0341f8352773b611e898c3b7198ddb |
| 돈 경계값 전체 출력 | fa4d1c28b1154ebd89b655dedcd8ddfb057d7f9bd65881d9d18effccaedc9344 |

박스별 334개의 가격, 상품 수, 확률 합, 원래 순서 해시와 추첨 순서 해시도 deepEqual로 비교했다. 전체 결과는 T/original-invariants.json과 T/result-invariants.json에 있다. 문서의 a82f8bd9로 시작하는 요약 지문과 이 배열 순서 지문을 혼동하지 않았다. 이번 계산의 인코딩을 위에 명시했고, harness/golden/catalog.json의 실제 tableOrder 역시 위의 67fdb233으로 시작하는 값이었다.

추첨 시드: serverSeed=parity-audit-server-seed-0001, clientSeed=parity-audit-client-seed, nonce=0부터 49까지. 334박스 전부에서 결과 id와 상품가를 비교했다. 별도의 node:crypto HMAC 계산으로 각 roll도 확인했으며 불일치 0이었다. nonce 0의 roll은 867,322이고, dollar-apple의 결과는 wave-cashback-5, 상품가 0.05다. 근거 web/lib/fairness.ts:67, web/lib/fairness.ts:109.

돈 경계값은 양쪽 함수를 독립 실행했다. 받는 금액은 0, 0.004, 0.005, 0.01, 0.05, 0.99, 1, 1.01, 3.33, 9.99, 19.99, 20, 20.01, 49.99, 100, 129.99, 549, 749.99, 2,499.5, 99,999.99, 1,234,567.89에서 상품 종류별 값까지 비교했다. 549의 받는 금액은 521.55, 1,000은 기존 테스트와 브라우저에서 950이다. 소수 반올림과 95%는 그대로다. 근거 web/lib/takeBatch.ts:154, web/lib/products.ts:110, web/lib/funding.ts:45.

출금 최소 20, TRC20 수수료 1, BEP20 수수료 0.5가 같다. 19.99는 최소액 오류, 20은 최소액 오류 없음, 100.01은 잔액 100에서 초과 오류다. NaN과 Infinity, 음수, 0도 별도로 검증했다. netReceive와 maxWithdrawable의 경계 출력도 모두 같았다. 근거 web/lib/withdrawal.ts:26, web/lib/withdrawal.ts:56.

차감 출처는 100을 crypto 60과 card 100에서 내면 60과 40, 100을 crypto 99.99와 card 0.01에서 내면 99.99와 0.01이다. crypto 50과 card 49.99에서 100은 null이다. 환급 95를 crypto 비율 0.6으로 나누면 57과 38이다. 0.01과 0.05를 0.5로 나누는 반올림도 동일하다. 근거 web/lib/funding.ts:45, web/lib/funding.ts:65.

환불과 차감 메서드를 AST로 추출해 원본과 결과의 함수 본문을 비교했다. rtk proxy node T/source-quality.mjs. syncWithdrawal, cancelHeldWithdrawal, debitCrypto, debitSplit 네 함수가 그대로였다. syncWithdrawal 본문의 SHA-256은 0747691fdea6e8d0f086e35a8168a778a87889c691f2a3d7c356342080e74223이다. 환불식의 재작성이나 반올림 변경은 없다. 근거 web/stores/walletStore.ts:221, web/stores/walletStore.ts:240, web/stores/walletStore.ts:275.

종료 HEAD의 독립 불변값도 T/invariants.ts를 결과 web 폴더에서 다시 실행해 T/head659-invariants.json으로 저장했다. 시작 HEAD와 원본의 전체 출력과 deepEqual로 같았다. 추가 두 제품 변경은 화면의 시간 측정과 split 표시뿐이며 계산 결과나 영속값은 바뀌지 않았다.

### 4.1 문구 키와 바뀐 값 전부

직접 실행한 것: rtk proxy node T/messages.mjs. ko.json, en.json, zh.json은 각각 2,672개의 leaf key이며 키와 값 변경 모두 0이다. 새 화면 묶음 v.ko.json, v.en.json, v.zh.json은 각각 574에서 598키로 늘었다. 세 언어의 추가 키 24개가 같고, 제거 0개, 기존 값 변경은 reviews.itemPrice 1개뿐이다. 세 언어 새 키 집합 SHA-256은 b444265de34c1b99875af09580551a825e3829f0d7646b00f9ef8ec0af332a7f다. 아래는 새 값도 빠짐없이 적었다. 파일 줄은 해당 JSON의 key 줄이다.

| 키와 근거 줄 ko/en/zh | 원본에서 결과로, 한국어 | 영어 | 중국어 | 범위 |
|---|---|---|---|---|
| box.ratingDist, v.ko/v.en/v.zh.json:95/95/95 | 추가: 별점 분포 | Rating breakdown | 评分分布 | W1 |
| box.ratingDistRow, v.ko/v.en/v.zh.json:96/96/96 | 추가: 별 {n}개 {count}건 | {n} stars, {count} reviews | {n} 星 {count} 条 | W1 |
| wallet.cancelDescOpen, v.ko/v.en/v.zh.json:396/396/396 | 추가: 잔액에서 차감하지 않은 출금 요청입니다. 취소해도 잔액은 바뀌지 않습니다. | This withdrawal request was never taken from your balance. Cancelling it does not change your balance. | 这笔提现申请没有从余额中扣款。取消后余额不会变化。 | W2 E-01 |
| wallet.notDebited, v.ko/v.en/v.zh.json:397/397/397 | 추가: 잔액에서 차감하지 않은 출금 요청입니다. 이 요청으로 잔액은 바뀌지 않았습니다. | This withdrawal request was never taken from your balance. It did not change your balance. | 这笔提现申请没有从余额中扣款。余额没有因它而变化。 | W2 E-01 |
| wallet.notDebitedTag, v.ko/v.en/v.zh.json:398/398/398 | 추가: 차감하지 않음 | not taken from balance | 未扣款 | W2 E-01 |
| wallet.requested, v.ko/v.en/v.zh.json:399/399/399 | 추가: 신청한 금액 | Requested amount | 申请金额 | W2 E-01 |
| withdraw.cancelUnconfirmed, v.ko/v.en/v.zh.json:451/451/451 | 추가: 잔액이 바뀌어 출금을 마치지 못했습니다. 잔액에서 차감한 것은 없습니다. 출금 요청의 취소는 확인하지 못했습니다. 지갑 내역에서 그 요청을 확인하고 취소할 수 있습니다. | Your balance changed, so the withdrawal was not completed. Nothing was taken from your balance. The request could not be confirmed as cancelled. You can check and cancel it in wallet history. | 余额发生变化，提现未能完成。余额没有被扣款。未能确认该提现申请已取消。可以在钱包记录中查看并取消该申请。 | W2 E-01 |
| account.passwordNeedsApp, v.ko/v.en/v.zh.json:497/497/497 | 추가: 인증 앱을 연결한 뒤에 비밀번호를 바꿀 수 있습니다. | Connect an authenticator app first, then change your password. | 请先连接验证器应用，然后再修改密码。 | W2 E-03 |
| account.passwordWrong, v.ko/v.en/v.zh.json:498/498/498 | 추가: 현재 비밀번호가 맞지 않습니다. {n}번 틀리면 비밀번호 바꾸기가 잠깁니다. | The current password is not right. After {n} wrong tries, password change locks. | 当前密码不正确。输错 {n} 次后，密码修改将被锁定。 | W2 E-03 |
| account.passwordLocked, v.ko/v.en/v.zh.json:499/499/499 | 추가: 현재 비밀번호를 {n}번 틀려 비밀번호 바꾸기가 잠겼습니다. 로그아웃한 뒤 로그인 화면의 비밀번호 재설정으로 새 비밀번호를 정하면 풀립니다. | Password change is locked after {n} wrong tries of the current password. Log out, then set a new password with Reset password on the login sheet to unlock it. | 当前密码已输错 {n} 次，密码修改已锁定。请退出登录后，在登录界面通过重设密码设置新密码，即可解除锁定。 | W2 E-03 |
| account.codeWrong, v.ko/v.en/v.zh.json:500/500/500 | 추가: 인증 앱 코드가 맞지 않습니다. | The authenticator code is not right. | 验证器验证码不正确。 | W2 E-03 |
| account.passwordSame, v.ko/v.en/v.zh.json:501/501/501 | 추가: 새 비밀번호가 현재 비밀번호와 같습니다. 다른 비밀번호를 넣습니다. | The new password is the same as the current one. Enter a different password. | 新密码与当前密码相同。请输入不同的密码。 | W2 E-03 |
| reviews.photoOf, v.ko/v.en/v.zh.json:604/604/604 | 추가: {item} 사진 | Photo of {item} | {item} 的图片 | W1 |
| reviews.total, v.ko/v.en/v.zh.json:611/611/611 | 추가: 전체 {n}건 | {n} in total | 共 {n} 条 | W1 |
| reviews.moreList, v.ko/v.en/v.zh.json:612/612/612 | 추가: 후기 더 보기 ({n}건 남음) | More reviews ({n} left) | 更多评价（剩余 {n} 条） | W1 |
| reviews.moreListPlain, v.ko/v.en/v.zh.json:613/613/613 | 추가: 후기 더 보기 | More reviews | 更多评价 | W1 |
| reviews.listTitle, v.ko/v.en/v.zh.json:614/614/614 | 추가: 후기 목록 | Review list | 评价列表 | W1 |
| reviews.likes, v.ko/v.en/v.zh.json:615/615/615 | 추가: 좋아요 {n} | {n, plural, one {# like} other {# likes}} | {n} 个赞 | W1 |
| reviews.agoNow, v.ko/v.en/v.zh.json:616/616/616 | 추가: 방금 전 | Just now | 刚刚 | W1 |
| reviews.agoMin, v.ko/v.en/v.zh.json:617/617/617 | 추가: {n}분 전 | {n} min ago | {n} 分钟前 | W1 |
| reviews.agoHour, v.ko/v.en/v.zh.json:618/618/618 | 추가: {n}시간 전 | {n, plural, one {# hour} other {# hours}} ago | {n} 小时前 | W1 |
| reviews.agoDay, v.ko/v.en/v.zh.json:619/619/619 | 추가: {n}일 전 | {n, plural, one {# day} other {# days}} ago | {n} 天前 | W1 |
| reviews.agoMonth, v.ko/v.en/v.zh.json:620/620/620 | 추가: {n}개월 전 | {n, plural, one {# month} other {# months}} ago | {n} 个月前 | W1 |
| reviews.agoYear, v.ko/v.en/v.zh.json:621/621/621 | 추가: {n}년 전 | {n, plural, one {# year} other {# years}} ago | {n} 年前 | W1 |
| reviews.itemPrice, v.ko/v.en/v.zh.json:606/606/606 | 현재 상품가 → 상품가 | Item value | 商品价值 | W1 |

영어 기존 reviews.itemPrice는 Current item value에서 Item value, 중국어는 当前商品价值에서 商品价值로 바뀌었다. 다른 기존 문구 값은 바뀌지 않았다. 세 언어 의미와 변수 검사는 npm test의 vMessages 검사에서 통과했다.

## 5. 결함 수정별 실행, 정상 경로, 최소 범위, 고치기 전 실패

### 5.1 W2 E-01 출금 차감 실패와 환불

코드에서 읽은 것: web/components/wallet/WithdrawScreen.tsx:120-147은 서비스 접수 뒤 recordWithdrawal을 부른다. web/stores/walletStore.ts:252-273은 차감 성공이면 기존 음수 거래를 남기고, 실패이면 amountUsdt=0과 requestedUsdt만 남긴다. feeUsdt와 netUsdt는 미차감 줄에서 제거한다. 접수 번호를 버리지 않는다. 같은 계정의 같은 serverId는 다시 차감하지 않는다. web/lib/api.ts:24-37은 브라우저 서비스의 없는 번호를 WithdrawalUnknown으로 구분한다. 실제 서버 오류와 같은 것으로 간주하지 않는다.

직접 실행한 것: rtk proxy node T/browser-extra.mjs. Playwright가 정적 빌드의 실제 출금 폼을 눌렀다. 시험 장부의 메일 코드를 사용했으며 외부 서비스를 호출하지 않았다. 정상 경로는 원본과 결과 모두 잔액 10,000에서 50 차감, 9,950, 내역 amountUsdt=-50, feeUsdt=1, netUsdt=49, PENDING_72H_HOLD였다. 결과 화면의 문구도 같았다. 지갑 내역에서 취소하면 양쪽 모두 10,000과 CANCELLED다. id, 시각, unlockAt 같은 실행마다 생성되는 값만 다르고 필드 모양과 계산은 같다.

같은 스크립트에서 접수가 끝난 직후 실제 지갑 스토어 잔액을 0으로 바꾸어 경쟁 조건을 만들었다. 원본은 차감하지 못해도 -50 줄과 신청 성공 화면을 만든다. 결과는 금액 0, requestedUsdt=50, 수수료와 받는 금액 필드 없음, 자동 취소 뒤 CANCELLED, 잔액 0이며 입력 화면으로 돌아왔다.

추가 직접 실행: rtk proxy node T/browser-withdraw-errors.mjs. 취소 실패를 주입하면 접수 번호가 있는 금액 0 대기 줄이 남고 입력 화면에 취소 미확인 안내가 있다. 지갑 상세에서 금액 0과 신청액 50을 따로 보여 주며 취소를 다시 누르면 CANCELLED, 잔액 0이다. 서비스의 접수 데이터를 제거하고 10초 상태 조회를 기다리면 FAILED, 잔액 0이다. rtk proxy node T/browser-withdraw-transient.mjs는 지갑 페이지가 뜬 뒤 조회를 일시 실패시키고 다음 조회까지 기다렸다. PENDING_72H_HOLD와 잔액 0을 유지했다. 일시 오류를 없는 번호로 닫지 않았다. 로그는 T/browser-withdraw-errors.json과 T/browser-withdraw-transient.json.

환불 호환성 직접 실행: 양쪽 web 폴더에서 rtk proxy node <web/node_modules/tsx/dist/cli.mjs> T/storage.ts <소스 절대 경로> original 또는 result를 실행했다. 원본의 환불식을 새 코드로 베껴 실행한 것이 아니라, archive의 실제 useWalletStore를 import했다. 결과 생성 금액 0 줄에 원본 syncWithdrawal의 CANCELLED 또는 FAILED, 원본 cancelHeldWithdrawal을 각각 적용해도 환불 0이다. 정상 100 → 70 줄은 어느 방향으로 읽어도 취소 뒤 100이다. 결과의 금액 0 실제 localStorage를 원본 정적 빌드에도 넣었고 잔액 0과 취소됨, 금액 0을 확인했다. 원본 화면에는 requestedUsdt의 별도 설명이 없다. 이 표시 차이는 되돌리기의 한계이며 돈 계산 실패는 아니다. 근거 web/stores/walletStore.ts:221-251, 원본 같은 파일:197-230, T/storage-original.json, T/storage-result.json, T/browser-risks.json.

최소 범위 판단, 코드에서 읽은 것: 환불 함수는 한 글자도 바꾸지 않고 기록 경계에 기능을 더했다. 요청을 그냥 버리면 취소 실패 접수를 다시 찾을 수 없어 저장 줄과 상태 조회, 표시까지 변경한 이유가 있다. 초기 명세보다 넓지만 카탈로그, 차감 출처, 지급과 환급 공식은 건드리지 않았다.

고치기 전 실패: 결과의 withdrawRefund.test.ts를 archive의 tests에 복사해 원본에서 실행하면 15건 모두 실패한다. 다만 실패 이유는 주로 recordWithdrawal이라는 새 API가 없다는 TypeError다. 이것만으로 원본 결함을 재현하는 좋은 회귀 시험이라고 보지는 않는다. 별도 storage.ts는 원본 호출 순서 그대로 debitCrypto 실패 후 음수 addTransaction을 실행하여 0 → 30 오환불을 직접 재현했다. browser-extra.mjs도 원본 실제 화면의 경쟁 조건을 재현했다. 이미 원본이 저장한 음수 미차감 줄은 결과에서도 구분할 정보가 없어 잘못 환불된다. 아래 원본 문제에 기록했다.

### 5.2 W2 E-06 지갑 내역

코드에서 읽은 것: web/lib/browserWallet.ts:9-12의 계정별 persist name 검사 뒤 accountId가 없거나 같은 거래를 보여 준다. 다른 계정의 번호가 있는 줄은 제외한다. web/components/wallet/WalletScreen.tsx:73에서 이를 사용한다. 저장된 거래에 accountId를 덧쓰거나 장부를 이주하지 않는다.

직접 실행한 것: T/browser-extra.mjs에서 같은 계정 장부에 accountId 없는 open과 sellback 두 줄을 심었다. 원본 내역은 보너스 1행만, 결과는 3행이고 박스 열기와 USDT로 받기가 보였다. 전후 장부 JSON은 동일했다. walletHistory 단위 시험은 다른 계정 줄, 잘못된 장부 namespace, 입력 배열 불변성을 검사하며 현재 전체 시험에서 통과했다.

최소 범위: 필터 함수와 화면의 필터 한 곳이다. 고치기 전 walletHistory.test.ts 4건은 새 함수 부재로 실패하므로 원본의 실제 화면 재현을 함께 근거로 삼았다. 근거 web/tests/walletHistory.test.ts:24, T/old-test-walletHistory.log.

### 5.3 W2 E-08 확인창 350ms 잠금

코드에서 읽은 것: web/components/ui/Sheet.tsx:33-55. open이 처음 true인 렌더의 시각을 ref에 두고 350ms가 지났을 때만 onConfirm을 부른다. 시작 HEAD와 제공 빌드는 Date.now, 종료 HEAD는 performance.now를 쓴다. 닫으면 시각을 비운다. 기존 busy, 취소, Esc, 포커스 구조는 그대로다. 상수는 web/lib/openingFlow.ts:71의 기존 OPENING_ARM_DELAY_MS다. 타이머나 구독을 새로 만들지 않는다. 시각 변화의 실패와 수정 확인은 9.1절에 적었다.

직접 실행한 것: rtk proxy node T/run-captures.mjs flow-account-password flow-confirm-lock flow-review-draft flow-verify-stale. flow-confirm-lock은 원본 14통과, 18실패, 결과 32통과, 0실패. 폭 390과 320, 간격 90과 250ms의 두 번 터치에서 원본은 받은 상태가 되었고 결과는 확인창과 잔액을 유지했다. 이후 누름, 600ms 간격, 키보드, 취소와 Esc도 검사했다. 정상 받기는 양쪽에서 950 한 번만 지급된다.

사용처를 전체 검색했다. 아래는 정상 확정 호출과 그 이후 동작의 이번 확인이다. 배송과 탈퇴에서 서비스가 거절하는 결과를 성공으로 표시하지 않았다.

| 사용처 | 결과 근거 | 이번 실행 |
|---|---|---|
| 큰 금액과 수량 열기 | web/components/box/BoxScreen.tsx:314 | opening-qa의 확인 취소, 실제 여러 개 개봉과 동일 잔액 확인 |
| 한 개 결과의 받기 | web/components/box/Opening.tsx:322 | opening-qa의 상품 받기와 중복 지급 없음 |
| 자동 받기 켜기 | web/components/box/Opening.tsx:352 | opening-qa s5, 확인 전 꺼짐, 확인 뒤 해당 계정만 켜짐 |
| 여러 개 결과의 단품 받기 | web/components/box/Reveal.tsx:305 | opening-qa s11, 받기와 잔액, 요약 갱신 확인 |
| 선택 상품 묶음 받기 | web/components/flow/TakeSheet.tsx:56,197 | flow-take a와 d, 1,471.55 한 번 지급과 취소 확인 |
| 보관함 단품 받기 | web/components/inventory/InventoryScreen.tsx:190 | flow-confirm-lock 32검사, 잠금 뒤 950 한 번 지급 |
| 배송 신청 | web/components/flow/ShipSheet.tsx:79 | 잠금 뒤 요청 함수가 실행되고 미지원 서비스 실패 한 줄. 배송 접수 성공은 확인 불가 |
| 배송 신청 취소 | web/components/inventory/InventoryScreen.tsx:191 | T/browser-ship-cancel.mjs에서 양쪽 모두 잠금 뒤 취소 성공. 첫 상품은 IN_STORAGE, 다른 상품은 SHIPPING 유지, 실패 한 줄 없음 |
| 로그아웃 | web/components/account/AccountScreen.tsx:81 | flow-confirm-lock d, 잠금 뒤 세션 삭제 확인 |
| 탈퇴 | web/components/account/AccountSheets.tsx:137 | browser-missing에서 잠금 뒤 호출이 실행되고 원본과 같은 인증 실패. 탈퇴 완료는 미수정 E-04 |
| 출금 취소 | web/components/wallet/WalletScreen.tsx:159 | 정상 및 미차감 접수의 잠금 뒤 취소와 잔액 확인 |
| dev Gallery의 네 확인창 | web/components/dev/Gallery.tsx:133 | 프로덕션에서 도달 불가. 실제 사용처 통과 수에 넣지 않음 |

최소 범위는 공통 확인창의 ref와 handler, 같은 기존 상수 import뿐이다. 고치기 전 소스 검사도 해당 handler 변경에서 실패하며 실제 두 번 누름도 원본에서 실패한다. 전체 capture의 일부 실패는 8절에 남겼다.

### 5.4 W2 E-03 비밀번호 변경, E-04 탈퇴

코드에서 읽은 것: web/components/account/AccountSheets.tsx:76-97. 기존 함수 verifyCurrentPassword를 먼저 부른 뒤 changeAccountPasswordWithOtp를 호출한다. 코드 실패, 같은 비밀번호, 잠금, 미연결 인증 앱을 구분한다. 성공 뒤 저장 필드와 세션 종료는 기존 계정 서비스가 처리하며 UI는 현재 계정이 요청 계정과 같을 때만 markSessionLost한다. 새 계정 저장 스키마나 해시 공식은 없다. 정상 성공 경로는 원본에 존재하지 않아 화면이 같다고 주장할 수 없다. 성공 문구와 재로그인은 W2의 의도된 차이다.

직접 실행한 것: flow-account-password는 결과 30통과와 정적 모듈 캐시에 닿지 못한 실행 실패 1건, 원본 11통과와 19실패였다. 유효한 현재 비밀번호와 인증 앱 코드로 결과는 비밀번호 저장값을 바꾸고 세션을 끝냈으며 새 비밀번호 재로그인이 되었다. 원본은 바꾸지 못했다. 틀린 비밀번호, 틀린 코드, 동일 비밀번호, 인증 앱 미연결, 5회 잠금, 새로고침 후 잠금 유지, 재설정 후 해제도 결과에서 확인했다.

보완 실행: rtk proxy node T/fix-captures.mjs. 실패했던 계정 변경 사례만 정적 빌드의 실제 factory를 찾아 다시 실행했다. 3통과, 0실패. 응답 직후 다른 계정으로 바뀌어도 요청한 계정의 비밀번호만 바뀌고 새 계정은 user=other-account, sessionLost=false였다. 원본의 실패 수는 해당 성공 동작 부재이며, 기대값을 바꾼 시험이 아니다.

최소 범위: 인증 서비스가 이미 가진 함수와 저장 규약에 연결했다. 인증 앱이 없는 계정의 이메일 코드 송신과 잠금 해제 전용 화면은 만들지 않았다. 그 계정은 이 시트에서 변경을 끝낼 수 없다고 알린다. 명세가 새 화면을 여러 개 만들어야 하면 미수정 이유를 남기라고 한 범위에 해당한다.

E-04는 고치지 않았다. web/components/account/AccountSheets.tsx:126의 deleteAccount, web/lib/account.ts:189-192와 web/lib/browserAccount.ts:251-255의 코드 확인 단계가 이어지지 않는다. browser-missing.mjs에서 잔액 0 시험 계정으로 양쪽을 끝까지 눌러도 같은 인증 실패 한 줄과 세션 유지였다. 원본에 있던 P1이며 W2가 모두 끝났다고 보지 않는다.

### 5.5 W2 E-14 음수 금액 표기

코드에서 읽은 것: 시작 HEAD의 web/lib/formatCurrency.ts:18-24는 USD와 native KRW의 통합 표기 기호 순서만 바꾼다. 종료 HEAD의 :100-118은 split 표기도 같은 순서로 만든다. 계산, 환율, 반올림, 양수와 0을 바꾸지 않는다. 직접 실행한 것: 시작 HEAD formatCurrency 시험 9건 통과. archive에 추가 시험을 복사해 실행하면 8통과, 음수 자리 검사 1실패였다. 원본의 USD -50은 $-50, 통합 결과는 -$50이다. 12개 비음수 입력을 세 통화와 세 표기로 비교한 기존 출력 시험이 양쪽에서 통과했다. 종료 HEAD의 두 추가 시험도 전체 npm test에서 통과했다. T/format-supplement.mjs는 두 커밋의 실제 소스를 transpile해 실행했고, 시작 HEAD의 split은 $-50이라 통합 -$50과 달랐으며 종료 HEAD는 둘 다 -$50이었다. 최소 변경은 기호 순서와 split의 공통 함수에 제한된다. 근거 web/tests/formatCurrency.test.ts:61,133, 로그 T/format-supplement.json.

### 5.6 W3 React 수정 전부

| 항목 | 코드에서 읽은 것과 결과 줄 | 직접 실행한 것 | 고치기 전과 정상 경로 |
|---|---|---|---|
| E-19 | HeroBanner.tsx:129, useWalletStore를 return 앞으로 이동 | T/runtime-source.mjs, 같은 소스로 훅 호출을 기록하는 하네스에서 박스 없음/있음: 원본 18/19, 결과 19/19 | 원본 훅 수 불안정 재현. JSX와 STEPS 시간표 그대로. 정적 홈의 완전한 배너 프레임 감사는 이 차수의 근거로 삼지 않음 |
| E-20 | heroBall.ts:81-102, 실패 때 shader와 program 및 GL context 정리 | 현재 heroBall 시험 7통과. archive의 원본에 같은 시험은 2통과, 5실패 | 실패 경로 자원 유실을 실행. 성공 셰이더와 draw, matrix 공식은 그대로 |
| E-15 | flow/ReviewSheet.tsx:38-67, 상품 id와 사진 세대, alive 검사 | flow-review-draft: 원본 15통과/5실패, 결과 20통과/0실패 | 다른 상품 초안 유출과 늦은 사진 덮기 재현. 정상 글 저장과 같은 상품 재열기 초안 유지 확인 |
| E-16 | VerifyScreen.tsx:58-72, 시작과 완료 입력 비교 | flow-verify-stale: 원본 11통과/2실패, 결과 13통과/0실패 | 첫 결과 없는 상태에서 입력 변경은 수정. 정상 같은 입력의 해시, 번호, 상품은 양쪽 동일. 이전 결과가 있을 때는 9절의 잔존 문제 |
| E-25 | AuthHost.tsx:28,49, effect 정리에 unsubscribe | T/runtime-source.mjs에서 실제 소스를 transpile해 effect 설치와 정리 실행: 원본 구독 1이 남고 앞 계정 지급 1회, 결과 구독 0과 지급 0 | 정상 hydrate 후 지급 함수 내용 그대로. 이 하네스는 React 브라우저 마운트와 동일하다는 주장이 아님 |
| E-39 | Reveal.tsx:94,134와 InventoryScreen.tsx:73,96, 응답 뒤 alive 검사 | T/async-handlers.mjs가 양쪽 실제 take handler를 추출해 대기 중 생명주기 표시를 내림. 원본은 이후 상태 호출 2개와 4개, 결과는 0개와 0개 | 돈 처리는 그대로. mounted 정상 경로는 동일 handler에서 같은 결과. 실제 브라우저의 결과 받기와 보관함 받기도 별도 실행 |

각 수정은 훅 한 줄 이동 또는 응답 경계와 정리 함수 추가로 제한되어 있다. 타이밍, JSX 구성, 지급 계산을 다시 쓰지 않았다. reactStructure.test.ts의 6건은 원본에서 모두 실패하지만 소스 모양을 확인하는 검사다. 그래서 실행 하네스와 실제 화면의 증거를 별도로 적었다. T/async-handlers.mjs도 실제 DOM 언마운트를 수행한 Playwright 시험은 아니며, 추출한 응답 handler의 직접 실행이다.

## 6. 저장값 모양과 양방향 읽기

코드에서 읽은 것: 물리 접두사 voila-test-aresjoo:와 모든 논리 키, persist 버전, partialize와 migrate는 유지된다. 새 영속 키는 0개다. 표시용 추가 필드는 출금 거래의 requestedUsdt 하나다. 아래 표는 24개 논리 키 계열을 전부 적었다. 계정별과 guest는 같은 계열의 다른 실제 키다. Zustand 값의 공통 외피는 state와 version이다. 그대로는 parser와 serializer가 원본과 같은 코드라는 뜻이다. 아래 모든 키의 모든 가능한 값으로 실제 브라우저 왕복을 실행했다고 보지는 않는다.

| 논리 키 계열 | 값 모양과 양방향 코드 대조 | 결과 근거 |
|---|---|---|
| gachaflix.wallet | 버전 4, balance/cryptoBalance/cardBalance, transactions, settledDepositRefs, welcomeClaimed, 입금과 wagered 누계, burst, freeOpens, freeOpensGranted. 외피 그대로, 미차감 출금의 거래만 아래 차이 | web/stores/walletStore.ts:301-306 |
| voila.browser-wallet.{id 또는 guest} | 같은 지갑 외피, 계정별 이름 변경 규칙 그대로. 새 금액 0 거래를 원본 실제 스토어가 읽음 | web/lib/browserWallet.ts:16-25 |
| gachaflix.inventory | state.items 배열, 버전 0, OwnedItem과 fair 및 fundingRatio 그대로 | web/stores/inventoryStore.ts:149-151 |
| voila.browser-inventory.{id 또는 guest} | 같은 보관함 외피와 계정 구분 그대로 | web/lib/browserWallet.ts:26-29 |
| gachaflix.community | state.mine 배열, MyReview의 원문, rating, photo, ownedId와 시각 그대로. 샘플은 이 키에 저장하지 않음 | web/stores/communityStore.ts:21,57-58 |
| gachaflix.fair | serverSeed, serverSeedHash, clientSeed, nonce 그대로 | web/stores/fairStore.ts:63-66 |
| gachaflix.settings | muted, openSound, openShort, autoTakeBy, lastReceiveBy 그대로 | web/stores/settingsStore.ts:44-48 |
| gachaflix.currency | currency 문자열 그대로. rates는 저장하지 않음 | web/stores/currencyStore.ts:43-46 |
| gachaflix.daily | lastOpenedAt와 history 그대로 | web/stores/dailyStore.ts:37-39 |
| gachaflix.telemetry | spinTimes 그대로 | web/stores/telemetryStore.ts:27-29 |
| voila-auth-v1 | 저장 user는 null, 서비스에서 세션 복원. 그대로 | web/stores/authStore.ts:77-79 |
| voila.opening-journal | state.seen 사전 그대로 | web/stores/openingJournal.ts:36-38 |
| voila.browser-accounts.v1 | Account 배열. user, salt, passwordHash, proofs, withdrawals와 기존 선택 필드 그대로. E-03은 기존 필드의 값을 바꾸는 것 | web/lib/browserAccount.ts:9,15-28,230-249 |
| voila.browser-session.v1 | 계정 id 문자열 그대로. 비밀번호 성공 후 제거는 기존 규약 | web/lib/browserAccount.ts:10,248 |
| voila.take-unconfirmed.{지갑 키} | ids와 c/d/n/l snapshot의 배열, 옛 문자열 배열도 읽는 기존 규칙 그대로 | web/lib/takeBatch.ts:96-130 |
| gachaflix.locale | ko/en/zh 문자열 그대로 | web/app/page.tsx:7, web/components/layout/LanguageSelector.tsx:14 |
| voila.account-revocation.v1 | accountId, at, nonce 객체 그대로. E-03이 기존 발신 함수를 실제로 부름 | web/lib/account.ts:209-212 |
| voila.community-board.v1 | BoardPost 배열 그대로 | web/lib/boardApi.ts:3-12 |
| voila.community-board.v1.examples.v1 | 예시 초기화 표식 문자열 1 그대로 | web/lib/boardApi.ts:4-11 |
| voila.board-draft.{userId}.{postId 또는 new} | sessionStorage의 BoardDraft 객체 그대로 | web/components/community/BoardComposer.tsx:12-15 |
| voila.nickname-updated-at.v1 | 옛 화면의 갱신 시각 규약 그대로. 현재 라우트에 닿지 않는 파일 | web/components/auth/NicknameSettings.tsx:9 |
| voila-security-v1 | 옛 비밀 저장값은 계속 제거한다. 새로 저장하지 않음 | web/components/auth/AuthHost.tsx:22 |
| voila.ledger-probe | 쓰기 확인용 임시 문자열, 확인 뒤 지움. 그대로 | web/lib/ledgerLock.ts:29-32 |
| voila.opening.fault | sessionStorage의 개발 시험 상태 문자열. 프로덕션에서는 이 시험 주입을 사용하지 않음 | web/lib/takeBatch.ts:60-63 |

다른 모양 전부: 새 미차감 출금은 amountUsdt가 음수 신청액이 아니라 0이며 requestedUsdt가 양수 신청액이다. feeUsdt와 netUsdt는 없다. 다른 거래 필드, 지갑 외피와 버전은 그대로다. 정상 출금에는 requestedUsdt가 생기지 않는다. 원본 parser는 알려지지 않은 추가 필드를 유지하고 기존 환불식은 abs(amountUsdt)=0을 읽는다. 되돌린 원본 UI는 신청액과 미차감 안내를 표시하지 못하지만, 잔액을 늘리지는 않았다. 이 실제 롤백 실행의 계정과 지갑 키들은 T/zero-withdraw-storage.json에 있다.

양방향 실행 범위: 실제 원본과 결과 스토어에서 정상 출금과 미차감 출금의 생성, JSON 저장, 재읽기, CANCELLED/FAILED와 held 취소를 실행했다. 정상 출금은 저장 shape가 같았다. 원본 생성 미차감 음수 줄은 결과에서도 환불되는 기존 위험이 남았다. 후기 생성과 사진 저장은 양쪽 브라우저의 flow-review-draft에서 실행했고, 새 결과의 사진이나 text 저장 구조 변경은 없었다. 개봉 시드, 보관함, 설정과 장부는 opening-qa가 원본 fixture를 양쪽에 넣고 각 저장값을 읽었다. 게시판과 닿지 않는 옛 키들은 parser/serializer 코드 동일성 근거만 있으며 별도 왕복 UI 시험은 하지 않았다. 확인하지 않은 키를 실제 실행 통과로 세지 않았다.

## 7. React 품질과 새 후기 파일

직접 실행한 것: rtk proxy node T/source-quality.mjs와 T/graph.mjs. TypeScript AST로 any, key, effect, 비동기 응답 지점을 모아 변경 파일과 원본을 대조했다. AST 목록과 각 변경 effect의 본문을 읽었다. 조건부 return 뒤의 훅, cleanup, 늦은 응답은 해당 컴포넌트 문맥으로 판단했으며 문자열 검색 결과만으로 전체 React 안전성을 확정하지 않았다.

| 파일 | 코드에서 읽은 품질 결과 |
|---|---|
| web/lib/reviewSamples.ts:24,31,119,548,595 | 기존 파일을 확장한 것이며 물리적인 신규 파일은 아님. 명시된 ReviewSample과 RatingSummary, 결정적 씨앗, bounded 글 캐시, 순수 계산. Hook, timer, DOM 직접 변경, any 없음 |
| web/lib/reviewSampleText.ts:28,34 | 신규 파일. Frag, Kind, Topic 등 명시 타입과 고정 말 재료. Hook과 timer 및 DOM 없음, any 없음 |
| web/lib/reviewFeed.ts:11-47 | 신규 파일. readonly Map 집계와 순수 agoOf. 저장값을 변형하지 않음, any 없음 |
| web/components/box/BoxReviews.tsx:120-139,145-186,195,231,277 | 기존 파일 확장. useNow의 interval과 visibility listener를 effect에서 함께 정리. 모든 훅은 조기 return 앞 또는 무조건 부르는 custom hook 내부. 후기 key는 c.id, 별 key는 고정 수. 상태와 props 타입 명시, any 없음. cut 측정은 이전처럼 text 변경 때만 실행 |
| web/components/box/ReviewsScreen.tsx:21-29 | 기존 파일 수정. 훅은 무조건 같은 순서. 별도 구독이나 타이머 없음. query로 picked를 초기화하는 동작은 기존과 같고 query 재변경 동기화는 계속 없음 |

직접 실행한 것: T/sample-summary.ts는 334박스에서 생성한 79,513샘플 전부를 검사했다. 박스당 최소 84, 최대 398이며 80~400 범위 안이다. 중복 id 0, 해당 박스에 없는 상품 참조 0, 전체 별점 수 79,513이다. 평균 4.3, 1점부터 5점의 수는 1,284, 2,075, 8,880, 22,650, 44,624다. 현재 reviewSamples와 reviewFeed 테스트가 생성 글의 의미, 점수, 전 언어와 스위치 off, 실후기 집계도 검사했다. 스위치 off의 실제 정적 빌드를 만들지 않았으므로 그 배포 모습은 검증 불가다.

변경 실행 코드의 신규 any는 0이다. 이번 변경 파일에 any로 동작을 가리는 곳을 찾지 못했다. golden/compute.ts의 any는 도구의 모듈 adapter 인터페이스에 있으며 제품 코드의 회피 타입으로 세지 않았다. key 검색의 index 후보는 원본에 있던 고정 배너 사진, 장식, 정적 문서 행과 닿지 않는 옛 부품에 있다. 새 후기의 key와 동적인 개봉, 보관함 id는 안정적인 식별자다. index라는 글자만으로 고정 목록을 결함으로 세지 않았다.

남은 원본 비동기 품질: VerifyScreen.tsx:67-72는 입력만 비교하고 언마운트 표시는 보지 않으며 finally의 busy 변경도 남는다. AccountSheets.tsx:82-99의 비밀번호 응답과 기존 nickname, closure의 응답에는 화면 생명주기 검사와 중복 클릭 동기 잠금이 없다. InventoryScreen.tsx:64의 배송 응답과 :103-105의 취소 응답, WalletScreen.tsx:88-97의 취소 응답에도 일부 UI 상태 변경이 남는다. 이들 가운데 이번에 추가된 비밀번호 선확인 await 역시 보호 범위 밖이다. 새 파일이 만든 구독 누수나 timer 누락으로 단정할 증거는 없었다. 사라진 컴포넌트의 상태 setter가 실제 React 경고를 낸다는 주장은 하지 않는다. React 경고가 없다는 사실만으로 late response를 안전하다고 보지도 않았다.

## 8. 전체 검사와 실행 제한

| 직접 실행한 명령 | 결과 |
|---|---|
| web에서 rtk proxy npx tsc --noEmit -p . | exit 0, 진단 0 |
| web에서 rtk proxy npm test | 종료 HEAD exit 0, 전체 471, 통과 470, 실패 0, 건너뜀 1. 시작 HEAD는 469/468/0/1 |
| web에서 rtk proxy npm run lint:design | exit 0, new 범위 49파일, 위반 0 |
| rtk proxy node T/run-source.mjs | 양쪽 불변값 계산 exit 0, 결과 완전 동일. 아래 원본 코드로 추가 시험 실행은 의도적으로 실패 |
| 원본 archive의 formatCurrency.test.ts | 전체 9, 통과 8, 실패 1 |
| 원본 archive의 heroBall.test.ts | 전체 7, 통과 2, 실패 5 |
| 원본 archive의 reactStructure.test.ts | 전체 6, 통과 0, 실패 6 |
| 원본 archive의 walletHistory.test.ts | 전체 4, 실패 4. 새 함수 부재의 TypeError |
| 원본 archive의 withdrawRefund.test.ts | 전체 15, 실패 15. 대부분 새 메서드 부재의 TypeError |
| flow-account-password | 원본 11통과/19실패, 결과 30통과/1실행 실패. 결과의 미검사 계정 변경은 별도 보완 3통과 |
| flow-confirm-lock | 원본 14통과/18실패, 결과 32통과/0실패 |
| flow-review-draft | 원본 15통과/5실패, 결과 20통과/0실패 |
| flow-verify-stale | 원본 11통과/2실패, 결과 13통과/0실패. 이전 결과가 있는 추가 사례는 양쪽 잔존 |
| flow-take | 양쪽 모두 54통과/6실패. 실패를 통과로 바꾸지 않음 |
| opening-qa | 양쪽 모두 98통과/2실패. 실패를 통과로 바꾸지 않음 |

브라우저 도구의 실행 명령은 rtk proxy node T/run-captures.mjs flow-account-password flow-confirm-lock flow-review-draft flow-verify-stale, rtk proxy node T/run-captures.mjs flow-take opening-qa, fixture 경로를 보완한 뒤 rtk proxy node T/run-captures.mjs opening-qa였다. 복사본은 Playwright와 states.mjs import만 절대 경로로 바꾸고 CAPTURE_BASE를 각각 http://127.0.0.1:4175/voila-test-aresjoo와 4176으로 지정했다. 원본 기준 소스나 기대금액을 변경하지 않았다. 로그는 T/capture-original-이름/run.log와 T/capture-result-이름/run.log, 요약은 T/capture-summary-이름들.json이다.

처음 실행에서 opening-qa는 외부 임시 폴더에 opening-fixtures.json이 없어 시작하지 못했다. 해당 fixture를 외부 임시 폴더에 복사한 뒤 다시 실행한 수가 위의 98/2다. flow-take의 c, e, h와 opening-qa의 s6, s11 일부는 개발 서버용 settle fault를 정적 프로덕션에서 켜려 하므로 실패한다. flow-take f는 하위 경로를 고려하지 않은 URL 또는 머리줄 선택 기대도 실패했다. 양쪽 실패 이름과 메시지가 같다. 이들 실제 장애 상황을 검증했다고 세지 않았다. 기존 스크립트의 코드가 있어도 실제 정적 환경에서 실행 못한 시험은 확인 불가다.

브라우저 경로 확인 30조합: 양쪽 ko/en/zh에서 /reviews/, /reviews/?box=jackpot-supercar, /box/pokemon-charizard/, /box/jackpot-supercar/, /wins/를 열어 모두 HTTP 200을 확인했다. W1의 처음 5건과 20건, 필터 수, 나온 상품 링크를 읽었다. 1,089언어 화면 전체를 브라우저로 전수 렌더링한 것은 아니다. 라우트 보존 근거는 라우트 파일 및 동적 데이터의 소스 동일성과 인벤토리 매핑이다. 외부 인증, 실제 입금, 실제 돈과 실제 배송은 검사하지 않았다.

npm test의 건너뜀 1건은 전체 검사 결과 그대로 기록했다. zustand의 메모리 테스트 저장소 경고가 있어도 실패 0만 보고 경고가 전혀 없었다고 말하지 않았다. next build는 사용자 지시대로 실행하지 않았다. 정적 빌드의 실행과 소스 검사는 했지만 전체 시각 및 배너 프레임 동등성은 별도 차수의 대상이다.

## 9. 발견 사항과 등급

### 9.1 이번 변경이 만든 것

N-P1-01, 확인창이 기기의 시각에 따라 잠긴 채 남거나 너무 일찍 확정된다. 시작 HEAD와 제공 정적 빌드의 web/components/ui/Sheet.tsx:40-41이 Date.now로 350ms를 잰다. 코드에서 읽은 것: 기기 시각이 뒤로 가면 그만큼 잠금이 늘어나고, 앞으로 가면 잠금이 일찍 끝난다. 직접 실행한 것: rtk proxy node T/clock-supplement.mjs. 시작 HEAD의 실제 Confirm 소스를 실행한 하네스에서 100ms 뒤 기기 시각을 60초 앞으로 보내면 확정 1회, 450ms 뒤 기기 시각을 뒤로 보내면 정상 확정 0회였다. 종료 HEAD의 실제 Confirm 소스는 같은 조건에서 조기 확정 0회와 정상 확정 1회다. 제공 4176 브라우저에서도 시각을 60초 뒤로 보내고 450ms 후 확정해도 확인창이 닫히지 않았다. 원본은 이 잠금이 없어 이 실패가 없었다. 이번 변경이 만든 P1이다. 종료 HEAD 소스의 performance.now 수정은 직접 확인했으나 제공 빌드에는 잔존한다. HEAD와 같은 빌드의 브라우저 재검증은 미실행이다.

N-P2-01, 음수의 통합 표기와 split 표기 불일치. 시작 HEAD의 web/lib/formatCurrency.ts:100-110에서 split은 $-50, 통합 표기는 -$50이었다. 원본은 두 표기가 모두 $-50이어서 이 불일치는 이번 E-14 변경이 만들었다. 직접 실행한 것: T/format-supplement.mjs가 두 커밋 소스를 독립 실행했다. 종료 HEAD의 :105-118은 둘 다 -$50으로 같은 출력이며 양수 출력은 같다. 종료 HEAD의 단위 시험 2건도 통과했다. 이 항목은 소스 수준에서 수정 확인되었고, 최신 빌드 전체 실행은 하지 않았다.

P0 발견 0건, 이번 변경이 만든 P1 발견 1건, P2 발견 1건이다. 검사 종료 HEAD 소스에서는 두 항목의 수정 동작을 확인했다. 제공 정적 빌드에서 P1이 재현된다는 사실을 최신 HEAD 소스의 미수정 결함이라고 섞지 않는다. 의도된 W1 변경과 W2가 정상적으로 고친 실패 경로는 회귀 수에 넣지 않았다. 미실행 영역까지 문제가 없다고 확대하지 않는다.

### 9.2 의도한 자리 안의 품질 문제

Q-P2-01, E-16 수정의 잔존 경로. 근거 web/components/verify/VerifyScreen.tsx:62-72, :109-118. 코드에서 읽은 것: 계산 시작 시 이전 manual을 지우지 않고, 입력이 바뀌면 새 응답만 버린다. 직접 실행한 것: T/browser-risks.mjs. nonce 2를 계산해 945,135를 먼저 표시한 뒤 같은 입력의 계산을 지연시키고 nonce를 3으로 바꾸었다. 양쪽 모두 입력 3 아래에 945,135와 nonce 2의 상품이 남았다. 첫 결과가 없는 상태만 보는 기존 flow-verify-stale은 이를 잡지 못한다. 원본에도 있던 동작이며 이번 변경이 새로 만든 회귀는 아니다. 수정 의도 안에서 덮지 못한 상태다.

Q-P3-01, E-01과 E-06의 고치기 전 실패 증거가 약하다. 근거 web/tests/withdrawRefund.test.ts:57-83, web/tests/walletHistory.test.ts:34-48, web/tests/reactStructure.test.ts:12-71. 코드에서 읽은 것: 새 API를 바로 호출하거나 소스 문자열을 검사하므로 UI 호출부를 잘못 연결해도 store 시험만으로는 놓칠 수 있다. 직접 실행한 것: archive에 같은 시험을 복사한 결과 recordWithdrawal과 accountTransactions 부재로 실패했다. 이번 보고서는 원본의 실제 화면과 별도 실제 스토어 재현을 추가했지만, 저장소 시험 자체가 원본 버그를 직접 재현하는 수준이라는 뜻은 아니다. 새 기능 장애로 등급을 높이지 않았다.

Q-P3-02, 정적 빌드 회귀 하네스의 실행 제한. 근거 web/scripts/capture/flow-account-password.mjs:155-166, flow-withdraw.mjs:67-85, flow-take.mjs:22-30, opening-qa.mjs:386-407. 코드에서 읽은 것: 개발용 module cache와 fault 주입에 기대는 사례가 있다. 직접 실행한 것: password 계정 변경은 정적 구조에 맞게 외부 복사본을 보완한 뒤 확인했고, 정산 fault와 일부 URL 기대는 양쪽에서 실행 실패로 남겼다. 제품 회귀로 세지 않았다.

### 9.3 원본에 원래 있던 것

O-P1-01, 이미 저장한 미차감 음수 출금의 오환불. 근거 원본 web/components/wallet/WithdrawScreen.tsx:123-129, 결과 web/stores/walletStore.ts:221-251. 코드에서 읽은 것: 과거의 amountUsdt=-30 줄에 실제 차감 여부가 없다. 직접 실행한 것: 실제 archive 스토어가 만든 잔액 0 음수 줄을 결과 스토어가 읽고 취소와 실패를 적용하면 30이 생긴다. 원본에서도 같은 결과다. 새 recordWithdrawal은 새 접수에 대해서만 이 결함을 막는다. 과거 장부가 모두 안전하다는 결론은 낼 수 없다. 근거 T/storage-result.json.

O-P1-02, 저장 한도에서 개봉 성공과 기록 유실. 근거 web/lib/labSite.ts:19, web/lib/opening.ts:90-110. 코드에서 읽은 것: Storage shim은 QuotaExceededError를 안내하고 삼키며 개봉은 메모리 결과 길이로 성공을 판단한다. 직접 실행한 것: T/browser-missing.mjs에서 초기 저장과 probe 뒤 보관함 기록 쓰기만 quota 실패시켰다. 양쪽 모두 상품 결과 화면 1개가 뜨고 persistedItems=0이었다. 원본의 E-02이며 이번 diff에서 수정하지 않았다.

O-P1-03, 계정 탈퇴가 끝나지 않는다. 근거 web/components/account/AccountSheets.tsx:126, web/lib/account.ts:189-192, web/lib/browserAccount.ts:251-255. 직접 실행한 것: 잔액 0 시험 계정에서도 양쪽이 인증 실패 한 줄을 표시하고 세션을 유지했다. 현재 UI의 /account/closure 호출은 서비스가 요구하는 code/send와 confirm을 거치지 않는다. W2의 E-04 미수정이다. 새 단계 화면을 만들지 않는 범위 결정은 기록되지만 기능 완료는 아니다.

O-P1-04, 출금 이용 기준 강제 없음. 근거 web/components/wallet/WithdrawScreen.tsx:120-122, web/lib/withdrawal.ts:60, web/lib/browserAccount.ts:321. 코드에서 읽은 것: 금액, 주소, 잔액, 인증은 검사하지만 총 입금과 롤오버 기준을 강제하지 않는다. 직접 실행한 것: rtk proxy node T/browser-rollover.mjs에서 양쪽 시험 계정의 totalDepositedCrypto와 totalDeposited를 100, totalWagered를 0으로 넣었다. 양쪽 모두 50 출금이 접수되어 잔액 9,950과 PENDING_72H_HOLD였다. 입금 이력이 없는 계정의 면제와 구분한 검사다. 실제 운영 호출은 하지 않았다. 명세가 제품 결정으로 남긴 E-26이다. 로그 T/browser-rollover.json.

O-P2-01, 생명주기와 늦은 응답의 남은 범위. 근거 VerifyScreen.tsx:67-72, InventoryScreen.tsx:64,103-105, WalletScreen.tsx:88-97, AccountSheets.tsx:33,82-99,126-128. 코드에서 읽은 것: 지정한 받기 응답은 보호했지만 다른 응답에서는 언마운트 이후 상태 호출 가능성이 남아 있다. 비밀번호의 새 선확인 await도 같은 범위에 있다. 짐작: 실제로 사용자에게 어떤 오동작을 일으키는지는 이 실행으로 확정하지 못했다. 코드상 보호 부족과 실제 React 경고를 구분한다. 신규 구독이나 timer 누수로 세지 않았다.

원본 발견의 수는 여기에서 직접 확인하거나 코드로 근거를 특정한 항목의 수다. 옛 결함 목록의 모든 P1을 전수 재현한 수가 아니다. 원본과 결과 모두에서 나타난 검수 도구 실패를 원본 제품 결함으로 일괄 분류하지 않았다.

이번 변경이 만든 P0: 0건, P1: 1건 발견(검사 종료 HEAD 소스 수정 확인, 제공 정적 빌드 1건 잔존).
