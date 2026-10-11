# 개봉 연출 연구 요약 (2026-10-11)

조사 에이전트가 웹에서 실제로 연 출처만으로 쓴 것을 Claude 가 정리했다. URL 은 실제로 열린 페이지다. 논문 일부는 출판사 페이지가 막혀 초록만 확인했고 그 경우 "초록" 이라고 적었다.
**한계:** 파운더가 준 Reddit 스레드 넷은 모두 열지 못했다. 그래서 가챠 이용자 반응(C) 근거가 가장 약하다. 열지 못한 출처는 맨 아래에 있다.

## 1. 근거가 뒷받침하는 것

**A. 기대와 예측 오차**
- 예상보다 좋은 보상에는 도파민 뉴런 활동이 늘고, 정확히 예측된 보상에는 변화가 없으며, 새로움에 대한 초기 반응은 반복되면 줄어든다(동물 전기생리 리뷰). Schultz 2016, https://pmc.ncbi.nlm.nih.gov/articles/PMC5549862 (앞 절반만 읽음). 강함(동물), 화면 설계로 옮기는 근거로는 약함
- 보상 확률이 0.5 에 가까울수록 보상 예정 시점까지 뉴런 활동이 서서히 오른다(원숭이). Fiorillo 2003 초록, https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=ext_id:12649484&resultType=core&format=json 보통
- 사람 fMRI 에서 금전 보상 기대 단계에 측좌핵 활성과 자기보고 행복감이 함께 올랐다(8명). Knutson 2001, https://web.stanford.edu/group/spanlab/Publications/bk01jn.pdf 보통
- 보상 크기가 불확실할 때 과제 완수 노력이 늘었다(2차 요약). https://www.chicagobooth.edu/review/uncertainty-can-improve-motivation 보통
- 화면 움직임은 대체로 100~500ms 가 적정이고, 자주 볼수록 짧고 절제돼야 하며, 시간만 채우는 움직임은 사용자를 짜증나게 한다. NN/g, https://www.nngroup.com/articles/animation-duration/ , https://www.nngroup.com/articles/animation-purpose-ux/ 강함(실무 지침)
- 0.1초 안의 반응은 즉각으로 느껴지고 1초를 넘으면 지연을 인지한다. NN/g, https://www.nngroup.com/articles/response-times-3-important-limits/ 강함

**B. 게임 필과 다감각 피드백**
- 입력 대비 넘치는 피드백은 행동을 의미 있게 느끼게 하지만, 화면이 입자로 가득하면 무엇이 중요한지 읽기 어려워진다. 같은 조사가 인용한 Kao 2020 에서는 중간과 높은 수준이 "없음" 과 "극단" 보다 나았다. Pichlmair & Johansen 조사, https://arxiv.org/pdf/2011.09201 보통(Kao 원문 미확인)
- 1,699명 사전등록 실험에서 피드백 증폭은 예상과 달리 동기 지표를 낮췄고, 성공에 연동된 피드백은 높였다. Kao 외 CHI 2024 초록, https://spiral.imperial.ac.uk/entities/publication/253c32f5-d124-4a23-88b5-9aaaf114608d 강함
- 액션 게임 16종 분석에서 짧은 정지(히트스톱), 소리와 화면의 일치, 카메라 연출이 타격감과 가장 관련됐고 소리와 화면이 어긋나면 부자연스럽다. Lin 외 2022, https://arxiv.org/pdf/2208.06155 보통(관찰 연구)
- 화면 흔들림은 무작위보다 의미 있는 방향과 가감속을 쓸 때 낫다. 위 조사. 약함(실무자 견해)
- 진동 피드백 추가는 경험을 높였지만 약한 진동과 강한 진동의 차이는 대부분 유의하지 않았고(38명), 진동과 화면의 정확한 동기화가 핵심이었다. https://uwaterloo.ca/haptic-experience-lab/projects/juicy-haptic-design-vibrotactile-embellishments-can-improve 보통
- 준비 동작, 관성에 따른 후속 동작, 가감속은 애니메이션 고전 원칙이다. https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation 보통
- 들어올 때는 감속, 나갈 때는 더 짧게. NN/g(위), Material 문서(50~1000ms, 감속 곡선 cubic-bezier(0.05, 0.7, 0.1, 1)), https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md 강함(지침)
- transform 과 opacity 만 움직이고 will-change 는 아껴 쓴다. https://web.dev/articles/animations-guide 강함

**C. 가챠 공개 연출**
- 붕괴 스타레일은 티켓 번짐, 음악, 문 색(파랑, 보라, 금) 순으로 등급을 미리 알린다. https://www.ginx.tv/en/4-star-5-star-warp-animation-differences 보통
- 명조는 연출 색이 그 뽑기의 최고 등급을 뜻하고 도중에 바뀌지 않는다. https://samurai-gamers.com/wuthering-waves/wuwa-wish-rarity-indicator-guide/ 보통
- 일상 뽑기는 건너뛰고 아끼던 뽑기에서만 연출을 본다는 관찰, 등급이 오르는 척하는 속임 연출이 관행이라는 주장(작성자와 날짜 없는 의견 글). https://hostedgg.com/blog/gacha-pull-reveal-color-culture 약함

**D. 오도하는 피드백**
- 건 돈보다 적게 받은 결과에 승리 연출이 붙으면 피부전도 반응이 진짜 승리와 비슷했다(초보 40명). Dixon 2010, https://uwaterloo.ca/reasoning-decision-making-lab/sites/default/files/uploads/files/DixFugetal_10c.pdf 강함
- 그런 영상을 본 집단은 실제 2회인 승리를 평균 3.02회로 추정했다(940명, 대조군 2.14). Myles 2023, https://pmc.ncbi.nlm.nih.gov/articles/PMC10758393/ 강함
- 그런 결과는 명확한 손실보다 큰 보상 관련 뇌파를 일으켰다(32명). Myles 2024 초록, https://api.crossref.org/works/10.1111/psyp.14541 보통
- 그런 결과에 부정적 소리를 붙이자 대다수가 손실로 올바르게 분류했고 승리 횟수 추정도 정확해졌다(157명). Dixon 2015 초록, https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=TITLE:%22Using%20sound%20to%20unmask%20losses%20disguised%20as%20wins%22&resultType=core&format=json 강함
- 아슬아슬한 실패는 완전한 실패보다 불쾌한데도 계속하고 싶은 욕구를 높였고, 본인이 직접 고른 경우에만 그랬다(행동 40명, fMRI 15명). Clark 2009, https://pmc.ncbi.nlm.nih.gov/articles/PMC2658737/ 강함(소표본, 실험실 과제)
- 승리에 시청각 단서를 붙이면 더 위험한 선택을 하고 확률 정보를 덜 봤다(131명). Cherkasova 2018 초록, https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:10.1523/JNEUROSCI.1171-18.2018&resultType=core&format=json 강함
- 루트박스 2x2 실험(1,235명)에서 강한 소리는 개봉 횟수를 늘렸고 시각 효과는 유의하지 않았다. Kao, https://api.semanticscholar.org/graph/v1/paper/DOI:10.1109/TG.2019.2913320?fields=title,abstract,year,venue 강함
- 영국 도박위원회는 2021년 온라인 슬롯에서 본전 이하 결과의 승리 연출, 2.5초보다 빠른 회전, 자동 진행, 속도를 높이거나 통제 착각을 주는 기능을 금지하고 순손익 표시를 의무화했다. https://www.gamblingcommission.gov.uk/news/article/gambling-commission-announces-package-of-changes-which-make-online-games 강함(규제 선례)
- 천장 제도와 1회 가격은 지각된 위험의 재평가를 거쳐 지불 의향에 영향을 준다(457명, 초록에 방향 없음). Ma 외 2025, https://hit.globalimpact.cn/en/publications/monetization-mechanisms-in-gacha-games-the-behavioral-triad-of-pr/ 보통

## 2. 설계 가설일 뿐인 것
- "이 연출이 도파민을 올린다". 근거는 동물 뉴런 기록과 소규모 fMRI 이며 화면을 측정한 연구는 찾지 못했다.
- "기대 구간이 길수록 가치가 크게 느껴진다". 불확실성 연구는 노력 동기를 다뤘고 연출 길이를 바꿔 보지 않았다.
- "1.5~3초가 최적". 직접 근거가 없다. 일반 지침은 500ms 이상을 느리다고 본다.
- 짧은 정지와 충격 프레임의 효과. 근거가 액션 게임 관찰이라 결제가 따르는 공개 화면에 그대로 옮겨도 되는지는 모른다.
- "천장이 공정하게 느껴진다". 확인한 논문은 지불 의향을 다뤘지 공정성을 재지 않았다.
- 소리와 화면이 어긋나도 되는 ms 값. 찾지 못했다.
- "이용자는 건너뛰기를 원한다", "10연속은 지루하다". 흔히 하는 말이지만 이번 조사에서는 확인하지 못했다.

## 3. 시험해 볼 만한 패턴
- 누른 뒤 100ms 안에 상자가 눌리는 반응을 보인다.
- 기대 구간은 모든 결과에서 같은 중립 연출로 두고, 차이는 드러난 뒤에만 낸다.
- 충격은 한 박자에 모은다. 짧은 정지, 밝기 대비 한 번, 소리와 진동을 같은 순간에. 화면 전체를 흔들지 않고 상자 자체가 방향 있는 반동을 한다.
- 받은 것의 이름과 낸 값 대비 차이를 같은 순간에 보여 준다.
- 비교해 볼 후보: 첫 개봉 2.4초 대 1.6초, 소리 기본 켬 대 끔. 재는 것은 다시 여는 비율이 아니라 "이번에 늘었나 줄었나" 를 맞게 이해했는지와 만족도.

## 4. 버려야 할 패턴
- 박스 가격 이하 결과에 축하 소리, 색종이, 금액이 올라가는 연출(Dixon 2010, 2015, Myles 2023, 영국 규제).
- 다른 상품이 스쳐 지나가는 띠, 아슬아슬하게 멈추는 연출(Clark 2009).
- 낮은 결과에 드문 결과의 신호를 주거나 등급이 오르는 척하는 연출.
- 누르는 타이밍이나 상자 선택이 결과를 바꾸는 듯한 연출(Clark 2009, 영국 규제).
- 자동 연속 개봉, 속도 올리기(영국 규제).
- 지나친 입자와 흔들림(Kao 2020, 2024).
- 건너뛸 수 없는 긴 연출(NN/g).
- 축하 소리로 다시 열기를 미는 것(Kao 루트박스, Cherkasova).

## 5. VOILA 에 적용하면 (Claude 의 결정, 수치는 가설)
1. **기대 구간은 결과와 무관하게 똑같다.** 결과가 무엇이든 상자는 같은 준비 동작을 한다. 그래서 낮은 결과에 높은 신호가 나갈 수 없다. 차이는 봉인이 풀린 뒤에만 난다.
2. **연출의 세기는 실제로 받는 값만 따른다.** 받는 값은 USDT 결과면 그 금액, 상품이면 USDT 로 받을 때의 금액(참고가의 95%)이다. 낸 값보다 적으면 줄었다고 적고 축하 요소를 하나도 쓰지 않는다(`lib/openingFlow.ts` 의 toneOf).
3. **낸 값, 받은 값, 차이를 결과와 같은 순간에 적는다.** 영국 규제의 순손익 표시와 같은 취지.
4. **길이:** 누른 반응 100ms 이내, 기대 약 0.8초, 충격 약 0.17초, 드러남 0.5초에서 1.5초(드문 결과만 길다). 첫 개봉 약 1.4초에서 2.4초. 같은 자리에서 다시 열면 기대를 절반으로 줄여 약 1초. 화면을 누르면 즉시 결과.
5. **다시 열기는 받은 것을 말한 뒤에만 켠다.** 자동 연속 개봉은 만들지 않는다. 다음 열기는 언제나 사람이 누른다.
6. **소리:** 낮은 음량, 끄고 켤 수 있음. 늘었을 때만 올라가는 소리, 줄었을 때는 구분되는 담담한 소리(Dixon 2015: 소리가 결과를 바르게 읽게 돕는다). 강한 소리가 개봉 횟수를 늘린다는 근거(Kao)가 있으므로 화려한 소리는 쓰지 않는다.
7. **진동:** 안드로이드 크롬만 된다(아이폰 사파리는 Vibration API 미지원, https://caniuse.com/vibration , https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate). 충격 순간 한 번만, 없어도 완결되게.
8. **움직임 줄이기:** 확대와 이동을 빼고 0.2초 이내의 나타남으로 바꾸되 정보와 순서는 그대로(https://web.dev/articles/prefers-reduced-motion).

## 6. 열지 못했거나 확인하지 못한 출처
- Reddit 넷(1dpff3x, 1jo1bwa, 17k1eka, qxeues): 전부 차단. 내용을 전혀 확인하지 못했다. 원신, 에픽세븐, FGO, 명일방주의 건너뛰기와 10연속 불만은 1차 출처를 찾지 못했다.
- doi.org/10.1016/j.entcom.2025.101044: 403. 메타데이터와 기관 페이지 초록만 확인.
- Wiley psyp.14541: 403. 초록만 확인.
- nature.com nrn.2015.26: 로그인 화면. PMC 저자 원고 앞 절반으로 대체.
- Cherkasova 2018, Scarfe 2020: 본문 차단, 초록으로 대체.
- Material Design 3 사이트, Apple 진동 지침: 본문을 못 읽음.
- Vlambeer "The art of screenshake", "Juice it or lose it", Swink "Game Feel": 원본 미확인, 조사 논문의 인용으로만 반영.
- Kao 2020 원문, Hicks 2019, Shen 외 2015, Ely 외 "Suspense and Surprise", Kao 루트박스 논문 본문: 미확인.
- 영국 2021 규칙의 이후 개정 여부: 확인하지 않음.
