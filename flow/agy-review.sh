#!/bin/bash
# USDT 우선 흐름 변경을 Antigravity 네 관점으로 검토한다. 읽기만 하고 고치지 않는다. 저장소 루트에서 실행.
cd /c/Users/hyun1/dev/VOILA-test-aresjoo || exit 1
base="검토만 하라. 파일을 고치지 말고 git 으로 바꾸는 명령도 쓰지 마라. 이 저장소(Next.js 14, 앱은 web 폴더)의 커밋되지 않은 변경을 검토한다. 먼저 DESIGN.md(화면과 문구의 정본)와 flow/MELT_SPEC.md(이번 변경의 명세)를 읽고, git status 와 git diff 로 변경을 본다. 새 파일: web/lib/takeBatch.ts, web/components/flow/TakeSheet.tsx, web/components/flow/BalanceSheet.tsx, web/app/take.css, web/lib/wins.ts, web/lib/chainRecord.ts, web/components/verify/ChainRecord.tsx, web/components/verify/VerifyMethod.tsx. 바뀐 화면: web/components/box/Opening.tsx, Reveal.tsx, BoxScreen.tsx, WinsScreen.tsx, BoxReviews.tsx, web/components/inventory/InventoryScreen.tsx, web/components/wallet/WithdrawScreen.tsx, web/components/shell/AppShell.tsx, web/components/flow/VerifySheet.tsx, web/components/verify/VerifyScreen.tsx. 화면 스크린샷은 qa/work/melt3 와 qa/work/melt2 의 PNG 다(볼 수 있으면 직접 열어 본다). 변경의 목적: 받은 실물을 USDT 로 받는 길(참고가의 95%)을 결과 화면, 여러 개 결과, 잔액 부족, 머리의 잔액, 보관함, 출금에서 주 단추로 가깝게 하고 배송은 보관함의 상품 상세로 옮긴다. 나온 상품 화면과 세 단계 검증 화면을 더한다. 돈 계산은 바꾸지 않는다. 아래 관점 하나로만 검토하라. 근거(파일과 줄, 또는 화면 파일 이름)를 든 구체적인 지적만 적고, 문제가 없으면 없다고 적어라. 마지막에 고칠 것을 중요한 순서로 다섯 개 이하로 적어라. 한국어로."
focus=(
  "관점 1: 시각 위계와 디자인 일관성. DESIGN.md 3장의 규칙(주 단추 하나, 보조 링크 최대 둘, 색과 배지와 그림자 없음, 글자 크기 위계, 카드와 행)에 어긋난 곳, 기존 화면과 결이 다른 새 부품."
  "관점 2: 반응형과 접근성. 320, 390, 768, 900, 1440 폭에서의 배치, 머리 메뉴가 접히는 폭을 900 으로 올린 것의 영향, 시트의 포커스 가둠과 닫기, 키보드 조작, 터치 영역 44px, 화면 낭독기가 읽는 이름과 상태, 긴 영어와 중국어 문구의 넘침."
  "관점 3: 상호작용 상태와 자료 처리, 견고함. 선택 시트의 로딩, 빈 목록, 실패, 일부만 됨, 두 탭, 연타, 계정 바뀜, 뒤로 가기에서의 상태. 묶음 받기(settleTakeMany)의 잠금과 중복 방지. 출금 칸을 채우는 값. 받은 뒤 다음 열기를 스스로 실행하지 않는지."
  "관점 4: 부품 구조와 유지보수. TakeSheet 가 다섯 군데에서 쓰이는 방식, 중복된 계산(takeAmountOf 와 기존 sell), 상태 저장소(flowStore)의 책임, 문구 키의 구성, 테스트가 실제로 막아 주는 범위, 줄이거나 합칠 수 있는 것."
)
for i in 0 1 2 3; do
  rtk agy --dangerously-skip-permissions --model gemini-3.8-flash-high --effort high --print "$base ${focus[$i]}" > "flow/agy-review-$((i + 1)).txt" 2>&1 &
  sleep 25
done
wait
for i in 1 2 3 4; do echo "검토 $i: $(wc -c < "flow/agy-review-$i.txt") bytes"; done
