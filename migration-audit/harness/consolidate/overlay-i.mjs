// 통합 담당이 손으로 적은 것: 인터랙션 행마다의 다른 참여자 id, 키보드와 포커스, 덮는 시험, 불일치, 표시.
// 키는 CL-I 번호(숫자). build.mjs 가 읽는다.
const O = {};
const set = (from, to, patch) => { for (let n = from; n <= to; n++) O[n] = { ...(O[n] ?? {}), ...patch, ...(patch.cx && O[n]?.cx ? { cx: O[n].cx + ", " + patch.cx } : {}), ...(patch.ag && O[n]?.ag ? { ag: O[n].ag + ", " + patch.ag } : {}) }; };
const one = (n, patch) => set(n, n, patch);

// ── 다른 참여자의 해석 id (CX 3절, 5절, 7절. AG-a 는 소스 보고서, AG-b 는 브라우저 보고서) ──
set(1, 12, { cx: "CX-I-032", ag: "AG-a AG-U-001~005, AG-U-010, AG-U-011; AG-b AG-I-001, AG-I-002, AG-I-003, AG-I-004, AG-I-006" });
one(13, { cx: "CX-I-034", ag: "AG-a AG-U-030" });
one(15, { ag: "AG-a 5.2절 6번(.v-nav a); AG-b AG-S-008" });
set(16, 19, { cx: "CX-I-001" });
one(16, { ag: "AG-a AG-U-015; AG-b AG-I-004, AG-S-007" });
one(17, { ag: "AG-a AG-U-016; AG-b AG-I-002" });
one(18, { ag: "AG-a AG-U-023; AG-b AG-I-001" });
one(19, { ag: "AG-a AG-U-023" });
set(20, 21, { cx: "CX-I-002", ag: "AG-a AG-U-036" });
set(22, 23, { cx: "CX-I-035, CX-F-054, CX-P1-06, CX-F-006" });
one(24, { cx: "CX-I-034, CX-F-060" });
set(29, 30, { cx: "CX-I-003, CX-P2-04", ag: "AG-b AG-I-008" });
one(29, { cx: "CX-S-039" });
one(30, { cx: "CX-S-040, CX-P2-05" });
one(32, { cx: "CX-F-035, CX-F-061" });
one(33, { cx: "CX-I-044" });
one(34, { cx: "CX-P2-04(기준 경로 없는 복귀를 조사할 것이라고만 적음)" });
set(36, 39, { cx: "CX-I-044" });
set(40, 47, { cx: "CX-I-004" });
one(40, { ag: "AG-b AG-S-006" });
one(44, { ag: "AG-a AG-U-032; AG-b AG-S-004" });
one(46, { ag: "AG-b AG-S-005" });
set(48, 50, { cx: "CX-I-005" });
one(50, { cx: "CX-U-017" });
set(52, 53, { cx: "CX-I-006, CX-F-063" });
one(53, { ag: "AG-b AG-I-006(비고)" });
one(54, { cx: "CX-I-007", ag: "AG-a AG-U-032" });
one(56, { cx: "CX-I-008, CX-S-016" });
one(57, { cx: "CX-S-018" });
set(58, 61, { cx: "CX-I-008, CX-S-017" });
set(62, 66, { cx: "CX-I-007, CX-S-012, CX-S-013", ag: "AG-a AG-TL-001, AG-TL-002" });
one(67, { cx: "CX-S-018" });
set(68, 76, { cx: "CX-I-006" });
one(68, { ag: "AG-b AG-I-006" });
one(70, { ag: "AG-a AG-U-031; AG-b AG-I-007" });
one(72, { ag: "AG-a AG-U-031" });
one(77, { cx: "CX-S-012" });
set(78, 87, { cx: "CX-I-022, CX-S-036" });
set(79, 80, { cx: "CX-I-033" });
set(86, 87, { cx: "CX-P2-02" });
set(88, 92, { cx: "CX-I-009", ag: "AG-a AG-TL-003~007, AG-U-012; AG-b 6절" });
one(88, { cx: "CX-I-036" });
one(93, { cx: "CX-I-011", ag: "AG-a AG-U-022" });
set(94, 98, { cx: "CX-I-009, CX-I-010" });
set(99, 102, { cx: "CX-I-010, CX-S-020, CX-S-021", ag: "AG-a AG-U-018" });
set(103, 105, { cx: "CX-S-017" });
one(107, { cx: "CX-I-010" });
one(108, { cx: "CX-I-010, CX-S-022", ag: "AG-a AG-TL-007" });
set(109, 110, { cx: "CX-I-011, CX-F-025", ag: "AG-a AG-U-022" });
one(111, { cx: "CX-I-009", ag: "AG-a AG-TL-001, AG-TL-004, AG-TL-006" });
one(112, { cx: "CX-I-009", ag: "AG-b 6절(open-1-reduced)" });
set(113, 128, { cx: "CX-I-012, CX-S-014", ag: "AG-a AG-TL-010~013, AG-U-013; AG-b 6절(open-5)" });
set(120, 126, { cx: "CX-S-023" });
set(129, 139, { cx: "CX-I-013, CX-I-014, CX-S-024", ag: "AG-a AG-U-017, AG-U-018" });
set(140, 144, { cx: "CX-I-042", ag: "AG-a AG-U-015; AG-b AG-I-004" });
set(145, 149, { cx: "CX-I-015, CX-S-009, CX-S-010, CX-S-011", ag: "AG-a AG-U-014; AG-b AG-I-003" });
set(150, 162, { cx: "CX-I-016, CX-I-017, CX-S-001~004", ag: "AG-a AG-U-016; AG-b AG-I-002" });
set(163, 173, { cx: "CX-I-030, CX-I-031", ag: "AG-a AG-U-024" });
set(165, 168, { cx: "CX-I-029, CX-S-028" });
one(169, { cx: "CX-S-006" });
one(170, { cx: "CX-S-007, CX-P1-03, CX-F-007" });
one(172, { cx: "CX-S-008, CX-P1-04, CX-F-007" });
one(173, { cx: "CX-S-005" });
set(174, 188, { cx: "CX-I-018, CX-I-019, CX-S-025" });
set(186, 188, { cx: "CX-S-027" });
one(188, { cx: "CX-I-038" });
set(189, 194, { cx: "CX-I-020, CX-S-026", ag: "AG-a AG-U-019" });
one(194, { cx: "CX-P1-05, CX-F-007" });
set(195, 199, { cx: "CX-I-021, CX-S-035, CX-P2-01, CX-F-066", ag: "AG-a AG-U-021" });
set(200, 207, { cx: "CX-I-025, CX-S-032" });
one(203, { cx: "CX-P1-07, CX-F-008" });
set(208, 223, { cx: "CX-I-026, CX-I-027, CX-S-028~031" });
one(212, { cx: "CX-I-028, CX-S-034" });
one(215, { cx: "CX-P2-05" });
one(221, { cx: "CX-S-033, CX-P1-01, CX-F-010" });
set(224, 230, { cx: "CX-I-024, CX-S-038, CX-P2-03, CX-F-068" });
set(231, 233, { cx: "CX-I-023, CX-S-037", ag: "AG-a AG-U-020; AG-b AG-I-005" });
one(225, { cx: "CX-S-037", ag: "AG-b AG-I-005" });
set(234, 238, { cx: "CX-I-043" });
one(239, { cx: "CX-U-014" });

// ── 키보드와 포커스 ──
const KB = {
  1: "열리면 포커스가 시트 자체(tabIndex -1)로 간다. 다음 프레임에 한 번 더 준다(`lib/useModal.ts:39-43`)",
  2: "Esc. 맨 위 창만 받는다. 사건의 기본 동작과 전파를 막는다(`lib/useModal.ts:48-52`)",
  5: "Tab 은 끝에서 처음으로, Shift+Tab 은 처음에서 끝으로. 누를 것이 없으면 시트에 머문다",
  6: "닫히면 포커스가 연 단추로 돌아간다. 그 단추가 사라졌으면 그 앞의 것, 없으면 아래 창",
  7: "Esc 는 취소다. busy 면 무시",
  11: "열릴 때 포커스가 확정 단추가 아니라 창이다. Enter 만으로는 확정되지 않고, Tab 한 번 뒤 Enter 는 확정한다",
  12: "Esc 한 번에 맨 위 하나만 닫힌다. 가려진 창에는 inert 와 aria-hidden 이 붙는다(`lib/useModal.ts:10-19`)",
  16: "Enter 로도 열린다. 닫으면 포커스가 잔액 단추로 돌아온다(09b:e1)",
  18: "aria-expanded 가 true 로, aria-haspopup=dialog",
  40: "입력 칸. Enter 는 아무 일도 하지 않는다(폼이 아니다)",
  42: "Enter 무동작",
  44: "aria-pressed 로 고른 것을 알린다",
  54: "Space 와 Enter 로 고른다(09:k2). aria-pressed",
  62: "Enter 로도 열린다(09:k2)",
  66: "Esc 는 취소. 확정 단추는 Tab 한 번 뒤 Enter",
  70: "summary 에서 Enter 로 펼친다(브라우저 기본)",
  76: "Esc",
  89: "결과가 드러나면 포커스를 결과 화면으로 옮긴다(`components/box/Opening.tsx:148`). 화면 읽기 도구에는 aria-live=polite 로 한 번",
  91: "Esc 는 닫기가 아니라 결과 바로 보기",
  92: "Esc 로 닫는다. 결과가 뜬 직후 0.35초 동안의 Esc 는 닫지 않는다",
  99: "Enter 로도 확인창이 열린다(09:k2)",
  109: "role=switch, aria-checked",
  110: "role=switch, aria-checked",
  115: "Esc: 연출 중에는 건너뛰기, 직후 0.35초는 무시, 그 뒤는 닫기",
  130: "role=checkbox, aria-checked 는 true, mixed, false",
  131: "Space 로 고른다. role=checkbox",
  134: "Esc 는 고르는 단계로 돌아간다(시트를 닫지 않는다)",
  151: "Enter 로 다음 단계(폼 제출). 열린 직후에는 포커스가 칸에 없다(I-162)",
  152: "Enter 로 제출",
  153: "Enter 로 제출",
  154: "Enter 로 제출. 숫자가 아닌 글자는 지워진다",
  158: "Enter 로 제출",
  162: "autoFocus 가 듣지 않는다. 열릴 때는 시트에, 단계가 바뀐 뒤에는 본문에 포커스가 있다",
  168: "Enter 로 제출(폼). 6자리 전에는 단추가 눌리지 않는다",
  169: "칸에서 Enter 는 아무 일도 하지 않는다(폼이 아니다, 코드)",
  172: "비밀번호 칸에서 Enter 는 아무 일도 하지 않는다(폼이 아니다, 09b:e1)",
  173: "확인창의 Esc 는 취소",
  175: "aria-pressed",
  191: "칸에서 Enter 는 아무 일도 하지 않는다(폼이 아니다, 코드)",
  198: "글 칸은 여러 줄 입력이라 Enter 는 줄바꿈이다",
  217: "금액 칸에서 Enter 로 제출(폼)",
  221: "Enter 로 제출(폼). 코드 칸에 autoFocus",
  222: "Enter 로 제출(폼)",
  229: "칸에서 Enter 는 아무 일도 하지 않는다(폼이 아니다, 코드 `components/verify/VerifyScreen.tsx:96-105`)",
};
for (const [n, kb] of Object.entries(KB)) one(+n, { kb });

// ── 덮는 시험 ──
// U: web/tests 의 단위 시험(화면 없음). C: web/scripts/capture 의 검수 스크립트(개발 서버 대상). H: 감사 하네스 flows.mjs 의 시나리오(배포 사이트 실행 기록 있음)
set(1, 12, { t: "H:A(Esc, 바깥, 닫기 단추), H:D(확인창 취소). 포커스 가두기와 돌아오기를 보는 기존 시험은 없음" });
one(13, { t: "없음" });
one(14, { t: "없음" }); one(15, { t: "없음" });
one(16, { t: "C:flow-take f, H:D(잔액 시트)" }); one(17, { t: "H:C, C:quick(촬영용 동작 login)" }); one(18, { t: "H:A(메뉴 열기), C:quick(촬영용 동작 menu)" }); one(19, { t: "없음" });
one(20, { t: "C:flow-offline, H:L(연결 끊김)" }); one(21, { t: "C:flow-session" });
one(22, { t: "C:flow-session(접두사를 뗀 키로 사건을 만들어 보낸다. 실제 키로는 보지 않는다), H:L(세션이 사라진 뒤 새로 고침)" });
one(23, { t: "C:flow-session" }); one(24, { t: "U:takeFault, U:vault-records(저장 실패의 처리). 안내가 뜨는 것을 보는 시험은 없음" });
set(25, 28, { t: "없음" });
one(29, { t: "H:K(언어 바꾸기). U:i18n, U:vMessages 는 문구만" }); one(30, { t: "H:K(통화 바꾸기), U:formatCurrency" });
one(31, { t: "없음" }); one(32, { t: "H:K(루트 주소)" });
set(33, 39, { t: "없음" });
one(40, { t: "H:B(검색)" }); one(41, { t: "H:B(검색 지우기)" }); one(42, { t: "없음" }); one(43, { t: "H:B(검색 결과의 첫 행)" });
one(44, { t: "H:B(분류)" }); one(45, { t: "H:A(더 보기)" }); one(46, { t: "H:A(박스 고르기)" }); one(47, { t: "H:A(브라우저 뒤로, 앞으로)" });
one(48, { t: "없음" }); one(49, { t: "없음" }); one(50, { t: "C:hero-frames(장면 촬영)" });
one(51, { t: "H:A(뒤로 가기 링크)" }); one(52, { t: "없음" }); one(53, { t: "H:A(대표 상품)" });
one(54, { t: "H:B(수량 바꾸기), H:C, H:F" }); one(55, { t: "없음" }); one(56, { t: "H:C(열기 단추 누르기)" });
one(57, { t: "C:opening-qa s7, s11; U:openingFlow" });
one(58, { t: "C:flow-take d, H:E2, U:takeBatch" }); one(59, { t: "C:flow-take d" }); one(60, { t: "C:flow-take d" }); one(61, { t: "C:opening-qa s6, H:E" });
one(62, { t: "U:opening, U:openingFlow, U:burst, C:opening-qa s1 s2, H:D, H:D2" });
one(63, { t: "U:opening, C:opening-qa s3, 하네스 motion.mjs rapid-triple-click(정의됨)" });
one(64, { t: "C:opening-qa s3, 하네스 motion.mjs second-press(정의됨)" });
one(65, { t: "U:opening, C:opening-qa s1, H:D, H:F" }); one(66, { t: "U:opening, C:opening-qa s1, H:D(취소), H:F(취소)" });
one(67, { t: "없음" });
one(68, { t: "H:A(사진 상품 상세)" }); one(69, { t: "H:A(행 상품 상세)" }); one(70, { t: "H:A(확률표 펴기)" }); one(71, { t: "H:A(확률표의 행)" });
one(72, { t: "H:A(알아 둘 것 펴기)" }); one(73, { t: "H:A(배송 가능 나라 펴기)" }); one(74, { t: "없음" }); one(75, { t: "없음" }); one(76, { t: "H:A" });
one(77, { t: "U:openingFlow(실패하면 전부 되돌린다), C:opening-qa s6" });
one(78, { t: "H:J(후기 하나 열기)" }); set(79, 80, { t: "없음" }); one(81, { t: "없음" }); one(82, { t: "없음" });
one(83, { t: "C:flow-verify-link" }); one(84, { t: "없음" }); one(85, { t: "없음" }); one(86, { t: "H:J(박스로 거르기)" }); one(87, { t: "없음" });
one(88, { t: "U:openingFlow(연출 길이), C:opening-qa s3 s10, 하네스 motion.mjs one-normal, one-short(정의됨)" });
one(89, { t: "C:opening-qa s3, H:D" }); one(90, { t: "U:opening, C:opening-qa s3, 하네스 motion.mjs one-skip(정의됨)" });
one(91, { t: "C:opening-qa s3, 하네스 motion.mjs one-escape(정의됨)" }); one(92, { t: "없음" });
one(93, { t: "H:D(개봉 설정 열기)" }); one(94, { t: "H:D2(닫기)" }); one(95, { t: "C:opening-qa s1 s8 s11, H:D, H:D2" });
one(96, { t: "C:opening-qa s3" }); one(97, { t: "C:flow-verify, H:D, H:I" }); one(98, { t: "없음" });
one(99, { t: "C:opening-qa s4, H:D" }); one(100, { t: "U:takeBatch, U:takeFault, U:claim, C:opening-qa s4, H:D" });
one(101, { t: "C:flow-take a, H:D(받기 취소)" }); one(102, { t: "U:opening(화면을 닫아도 상품이 남는다), H:D" });
one(103, { t: "C:opening-qa s6, C:flow-take d" }); one(104, { t: "C:flow-take d" }); one(105, { t: "C:flow-take d" });
one(106, { t: "없음" }); one(107, { t: "U:takeFault. 화면은 C:flow-take c(개발 서버의 시험 스위치)" });
one(108, { t: "U:openingFlow(자동 받기의 조건), C:opening-qa s5" });
one(109, { t: "H:D(짧게 보기), C:opening-qa s12(소리를 켠 채)" }); one(110, { t: "H:D(자동 받기 켜기와 취소), C:opening-qa s5" });
one(111, { t: "U:audio(옛 소리 모듈), C:opening-qa s12" }); one(112, { t: "C:opening-qa s8, 하네스 motion.mjs one-reduced(정의됨)" });
one(113, { t: "C:opening-qa s11, H:F, H:F2, 하네스 motion.mjs five-normal(정의됨)" });
one(114, { t: "U:opening" }); one(115, { t: "없음" }); one(116, { t: "H:F, H:F2(결과 닫기)" });
one(117, { t: "C:opening-qa s11, H:F(결과 행 하나 열기)" }); one(118, { t: "없음" }); one(119, { t: "없음" });
one(120, { t: "C:opening-qa s11, H:F" }); one(121, { t: "없음" }); one(122, { t: "없음" }); one(123, { t: "C:opening-qa s11" });
one(124, { t: "없음" }); one(125, { t: "C:flow-take d" }); one(126, { t: "C:opening-qa s11" }); one(127, { t: "없음" }); one(128, { t: "없음" });
one(129, { t: "U:takeFault(표시가 풀리는 경우), C:flow-take" }); one(130, { t: "H:E2(전체 선택)" }); one(131, { t: "H:F(하나 빼기)" });
one(132, { t: "C:flow-take a, H:E2, H:F" }); one(133, { t: "U:takeBatch, U:takeFault, U:claim, C:flow-take a, H:E2, H:F" });
one(134, { t: "C:flow-take a" }); one(135, { t: "C:flow-take a g" }); one(136, { t: "U:takeFault, C:flow-take c" });
one(137, { t: "C:flow-take c h" }); one(138, { t: "없음" }); one(139, { t: "U:takeFault" });
one(140, { t: "C:flow-take f" }); one(141, { t: "C:flow-take f" }); one(142, { t: "C:flow-take f(시트의 구성까지)" }); one(143, { t: "C:flow-take f(시트의 구성까지)" }); one(144, { t: "없음" });
one(145, { t: "H:E(네트워크 바꾸기)" }); one(146, { t: "없음" }); one(147, { t: "U:depositAddress" });
one(148, { t: "U:depositCredit, U:depositAddress, U:accountWallet. 5초 주기와 시트가 닫히는 것을 보는 시험은 없음" }); one(149, { t: "없음" });
one(150, { t: "없음" }); one(151, { t: "H:C(빈 이메일, 이메일 입력)" });
one(152, { t: "U:browserAccount, U:account. 화면은 C:quick 의 member 동작(촬영용)" }); one(153, { t: "U:browserAccount" });
one(154, { t: "U:browserAccount, U:freeOpens" }); set(155, 158, { t: "없음" }); set(159, 162, { t: "없음" });
one(163, { t: "없음" }); one(164, { t: "H:G(계정 화면)" }); one(165, { t: "없음" });
one(166, { t: "U:totp, U:securityApi, U:browserAccount" }); one(167, { t: "없음" }); one(168, { t: "U:totp, U:securityApi, U:browserAccount" });
one(169, { t: "U:nicknameRules, U:profile, C:flow-nickname" });
one(170, { t: "U:passwordChangeFlow 는 단계를 다 밟는 옛 경로를 본다. 이 시트의 경로를 보는 시험은 없음" });
one(171, { t: "U:passwordChangeFlow(소셜 계정)" });
one(172, { t: "U:accountClosureFlow, U:account 는 옛 경로를 본다. 이 시트의 경로를 보는 시험은 없음" });
one(173, { t: "U:auth(로그아웃이 지갑과 보관함 키를 건드리지 않는다). 화면 시험 없음" });
one(174, { t: "없음" }); one(175, { t: "H:G(탭 셋)" }); one(176, { t: "C:flow-take a" }); one(177, { t: "없음" }); one(178, { t: "H:G, H:H(상품 상세)" });
one(179, { t: "없음" }); one(180, { t: "C:flow-take e, H:H" }); one(181, { t: "없음" }); one(182, { t: "H:H(배송 받기 시트)" });
one(183, { t: "H:G(개봉 결과 검증)" }); one(184, { t: "C:flow-review, H:J" }); one(185, { t: "C:flow-take h i" });
one(186, { t: "U:claim, U:shipping-cancellation, H:H2(확인창을 열고 닫기까지)" }); one(187, { t: "U:carriers, H:H2(상세까지)" }); one(188, { t: "없음" });
one(189, { t: "없음" }); one(190, { t: "H:H(나라 바꾸기)" }); one(191, { t: "U:inventory(주소 검증), U:shipping, H:H" }); one(192, { t: "U:inventory, H:H(빈 채로 누르기)" });
one(193, { t: "없음" }); one(194, { t: "U:inventory 는 스토어의 배송 신청을 직접 부른다. 이 시트와 서비스 사이를 보는 시험은 없음" });
one(195, { t: "H:J(별점)" }); one(196, { t: "H:J" }); one(197, { t: "없음" }); one(198, { t: "U:community, U:vault-records, C:flow-review, H:J" }); one(199, { t: "없음" });
one(200, { t: "H:L(세션 없이 지갑 열기)" }); one(201, { t: "없음" }); one(202, { t: "없음" }); one(203, { t: "H:H(지갑 내역, 내역 행 열기)" }); one(204, { t: "없음" });
one(205, { t: "U:withdrawHold, U:browserAccount, U:accountWallet" }); one(206, { t: "없음" }); one(207, { t: "U:inventory(출금 거래의 상태 변화), U:accountWallet" });
one(208, { t: "없음" }); one(209, { t: "없음" }); one(210, { t: "U:browserAccount" }); one(211, { t: "H:H3(이메일 인증 경로 고르기)" });
one(212, { t: "U:takeBatch(출금 칸의 세 사례), C:flow-take g" }); one(213, { t: "H:H3(네트워크 바꾸기)" }); one(214, { t: "U:withdrawal, H:H3" });
one(215, { t: "U:withdrawal, H:H3" }); one(216, { t: "H:H3(전액)" }); one(217, { t: "U:withdrawal, H:H3" }); one(218, { t: "없음" }); one(219, { t: "없음" });
one(220, { t: "없음" }); one(221, { t: "U:browserAccount, U:securityApi, U:walletSplit. 이 화면의 접수를 보는 시험은 없음" });
one(222, { t: "U:withdrawHold, U:browserAccount. 이 화면의 접수를 보는 시험은 없음" }); one(223, { t: "없음" });
one(224, { t: "없음" }); one(225, { t: "U:fairness-record, C:flow-verify, H:I" }); one(226, { t: "없음" }); one(227, { t: "H:I(직접 계산)" });
one(228, { t: "없음" }); one(229, { t: "U:fairness, C:flow-verify, H:I" }); one(230, { t: "C:flow-verify-link, H:I" });
one(231, { t: "H:I(계산 방법 펴기)" }); one(232, { t: "C:flow-verify-link, H:I" }); one(233, { t: "U:chainRecord" });
one(234, { t: "없음" }); one(235, { t: "U:wins, H:G(나온 상품의 행 열기)" }); one(236, { t: "없음" }); one(237, { t: "없음" }); one(238, { t: "없음" });
one(239, { t: "없음(개발 전용 화면)" });

// ── 불일치(해소는 build.mjs 의 표에) ──
set(16, 18, { dis: "D-01" });
one(53, { dis: "D-02" });
one(108, { dis: "D-03" });
one(225, { dis: "D-04" });
one(229, { dis: "D-05" });
one(198, { dis: "D-06" });
one(77, { dis: "D-07" });
one(34, { dis: "D-08" });
one(37, { dis: "D-08" });

// ── 표시: 원본에 있는 결함(등급은 매기지 않는다), 기능 상태 ──
one(15, { flag: "원본 결함: PC 머리줄의 지금 화면 표시가 박스에만 붙는다(CL F-09)" });
one(22, { flag: "원본 결함: 다른 탭의 로그아웃이 storage 사건으로 전해지지 않는다(CL F-04, CX-P1-06)" });
one(29, { flag: "원본 결함: 고른 언어가 저장되지 않는다(CL F-10, CX-P2-04). 언어 링크가 주소의 query 를 버린다(CX-I-003)" });
one(30, { flag: "원본 결함: 출금 화면에 넣어 둔 금액이 통화를 바꾸면 새 단위로 다시 읽힌다(CX-P2-05)" });
one(34, { flag: "원본 결함: 없는 주소 화면의 링크가 사이트 밖으로 나간다(CL F-05)" });
one(37, { flag: "원본 결함: 이용 방법의 검증 링크가 옛 주소를 가리킨다(CL F-11)" });
one(62, { flag: "원본 결함: 장부 쓰기만 버려지면 열기가 성공으로 보이고 새로 고치면 사라진다(CX-P1-02)" });
set(86, 87, { flag: "원본 결함 후보: 주소의 box 는 처음 한 번만 읽는다(CX-P2-02)" });
one(106, { flag: "원본 결함: 같은 자리를 두 번 누르면 받기 확인창을 건너뛴다(CL F-01)" });
set(145, 148, { flag: "기능 상태: 배포 사이트에서 충전을 끝까지 갈 수 없다(CL F-07)" });
one(162, { flag: "원본 결함: 로그인 시트의 autoFocus 가 듣지 않는다(CL F-08)" });
one(170, { flag: "원본 결함: 비밀번호 바꾸기가 언제나 실패한다(CL F-06, CX-P1-03)" });
one(172, { flag: "원본 결함: 탈퇴가 언제나 실패한다(CL F-06, CX-P1-04)" });
one(173, { flag: "원본 결함: 로그아웃 뒤의 알림이 그려지지 않는다(CL F-12). 로그아웃 요청이 실패하면 오류 줄이 없다(CX-S-005)" });
one(181, { flag: "원본 결함: 같은 자리를 두 번 누르면 받기 확인창을 건너뛴다(CL F-01)" });
one(194, { flag: "기능 상태: 배포 사이트에서 배송 신청이 접수되지 않는다(CL F-07, CX-P1-05)" });
set(195, 197, { flag: "원본 결함: 후기 시트를 닫았다 다른 상품에서 열면 앞의 초안이 남는다(CX-P2-01)" });
one(198, { flag: "원본 결함: 저장 공간이 찬 채로 올리면 올린 것처럼 보이고 저장되지 않는다(CX-S-035). 초안이 남는 것(CX-P2-01)" });
one(199, { flag: "원본 결함: 같은 자리를 세 번 누르면 후기에 이어 상품이 받아진다(CL F-01)" });
one(203, { flag: "원본 결함: 지갑 내역에 박스 열기와 USDT로 받기가 나오지 않는다(CL F-02, CX-P1-07)" });
one(215, { flag: "원본 결함: 통화를 바꾸면 같은 숫자가 새 단위로 읽힌다(CX-P2-05)" });
one(221, { flag: "원본 결함: 접수 뒤 차감이 실패해도 그 결과를 보지 않는다(CX-P1-01)" });
one(229, { flag: "원본 결함: 회차 칸이 비어도 0 회차로 계산한다. 실패 문구는 회차를 넣으라고 말한다(CX-S-038). 계산 중 입력을 바꾸면 앞의 결과가 남는다(CX-P2-03)" });

// ── 고친 것(인용 줄, 내용) ──
one(34, { fix: { "핸들러": "`app/not-found.tsx:23`" }, fixNote: "분석가는 25행으로 적었다. 링크는 23행이다" });
one(37, { fix: { "핸들러": "`app/[locale]/guide/page.tsx:24`" }, fixNote: "분석가는 26행으로 적었다. 링크는 24행이다" });
one(29, { add: { "화면 변화": " 주소의 query 와 hash 는 따라가지 않는다(`?box=`, `?s=` 가 사라진다. 실행 20:c1)" } });
one(30, { add: { "화면 변화": " 출금 화면의 금액 칸은 숫자가 그대로 남고 단위만 바뀐다(실행 20:c6)" } });
one(53, { add: { "화면 변화": " 상품 시트는 열리지 않는다" } });
one(62, { add: { "저장 변화": ". 저장소의 작은 시험 쓰기만 되고 장부 쓰기가 버려지면 화면은 성공인데 저장되지 않는다(실행 20:c5)" } });
one(108, { add: { "전 → 후": ". 결과가 드러난 순간에 시작한다. 단추가 풀리기를 기다리지 않는다(실행 20:c7: 드러남 908ms, 받기 거래 908ms, 단추 풀림 1246ms)" } });
one(198, { add: { "전 → 후": ". 저장 공간이 가득 차면 실패 한 줄 없이 올린 것처럼 닫힌다(실행 20:c4)", "저장 변화": ". 가득 찬 경우에는 저장되지 않는다" } });
one(196, { add: { "전 → 후": ". 시트를 닫아도 글과 별점이 남아 다른 상품에서 열면 그대로 보인다(실행 20:c3)" } });
one(229, { fix: { "전 → 후": "공개된 값이나 내 기기 값이 비었거나, 회차가 정수가 아니거나 음수면 실패 한 줄. 회차 칸이 비어 있으면 0 회차로 계산한다(실행 20:c2). 맞으면 해시, 번호, 번호가 가리키는 상품. 잠근 값을 넣었으면 같은지 한 행" } });
one(221, { add: { "전 → 후": ". 차감 함수의 결과(성공, 실패)를 보지 않고 거래를 적는다(`components/wallet/WithdrawScreen.tsx:123`)" } });
one(215, { add: { "전 → 후": ". 넣은 뒤 통화를 바꾸면 같은 숫자가 새 단위로 읽힌다(`components/wallet/WithdrawScreen.tsx:78`)" } });
one(173, { add: { "전 → 후": ". 로그아웃 요청이 던지면 잡는 곳이 없다(`components/account/AccountScreen.tsx:37-40`, 코드)" } });

// ── 통합 담당이 더한 행(다른 참여자만 적었거나 아무도 행으로 적지 않은 것) ──
export const EXTRA = [
  { screen: "전역", control: "앱이 뜸", event: "mount", handler: "`components/layout/CurrencyHydrator.tsx:15-24`", before: "저장값을 읽기 전 → 읽은 뒤", visible: "통화, 잔액, 설정이 저장된 값으로 바뀐다. 그 전에는 USD, 비로그인, 자리만 잡은 화면", stored: "없음(읽기). F 에 추첨 값이 없으면 만든다", kb: "-", src: "CX-F-053. CX 색인 `components/layout/CurrencyHydrator.tsx`", agree: "단독(CX)", verify: "코드. 통합이 읽음", test: "없음", tag: "" },
  { screen: "전역", control: "계정 확인과 계정이 바뀜", event: "mount, 사용자 id 변화", handler: "`components/auth/AuthHost.tsx:20-24, 25-48`", before: "계정 미확인 → 확인. 계정 id 가 바뀌면 W 와 I 의 저장 이름을 그 계정으로 바꾸고 첫 로그인 보너스와 무료 개봉을 한 번 준다", visible: "머리줄의 잔액 단추, 주 단추의 글", stored: "옛 키 `voila-security-v1` 삭제. W(보너스, 무료 횟수)", kb: "-", src: "CX-I-035, CX-I-037, CX-F-036, CX-F-051; CL-S-003, CL-S-010, CL-S-011", agree: "일치(CL, CX). 지갑 복원을 기다리는 구독을 정리하지 않는다는 것은 CX 만 적었다", cat: "R2", verify: "분석가 실행 03:a1, 04:o8(보너스와 무료 횟수). 통합: 04:o8 재실행 같은 결과, 03:a1 은 다시 돌리지 않음. 구독 정리는 코드(`components/auth/AuthHost.tsx:39-45`)로 읽음", test: "U:inventory(웰컴 보너스), U:freeOpens", tag: "원본 결함 후보: 지갑 복원을 기다리는 구독이 계정이 바뀌거나 화면이 사라져도 남는다(CX-I-037)" },
  { screen: "전역", control: "기다리는 일이 화면이 사라진 뒤에 끝남", event: "Promise 완료", handler: "`components/box/BoxScreen.tsx:140-158`, `components/box/Reveal.tsx:127-134`, `components/inventory/InventoryScreen.tsx:89-102`, `components/wallet/WalletScreen.tsx:78-88`, `components/flow/ShipSheet.tsx:52-58`, `components/verify/VerifyScreen.tsx:57-68`, `components/account/AccountSheets.tsx:29-36, 57-64, 88-93`, `components/wallet/TwoFactorSetup.tsx:38-71`", before: "막는 장치가 없다(사라진 화면의 상태를 바꾸려 한다). 막는 곳: `Opening.tsx:162`(alive), `TakeSheet.tsx:127-133`(요청 세대), `LoginSheet.tsx:43-44`(요청 세대), `VerifySheet.tsx:39-47`(alive)", visible: "없음. 다음에 연 화면에 앞의 응답이 들어갈 수 있는 곳은 각 행에 적었다", stored: "돈은 `lib/takeBatch.ts` 와 `lib/opening.ts` 가 따로 지킨다", kb: "-", src: "CX-I-039, CX-P2-06; CL 7절", agree: "일치(CL, CX)", verify: "코드. 통합이 Opening, BoxScreen, Reveal, InventoryScreen, WalletScreen, VerifyScreen, AccountSheets, LoginSheet 를 읽음", test: "없음", tag: "" },
  { screen: "전역", control: "받기 뒤 2초의 재확인", event: "setTimeout 2000ms", handler: "`lib/takeBatch.ts:406`", before: "저장된 장부를 한 번 더 맞춰 본다. 화면 상태를 직접 바꾸지 않는다", visible: "없음", stored: "M 이 풀릴 수 있다", kb: "-", src: "CX-I-040; CL 7절", agree: "일치(CL, CX)", verify: "코드(두 참여자). 통합은 줄만 확인", test: "U:takeFault", tag: "" },
  { screen: "출금 관문, 계정 화면", control: "인증 앱 부품의 로그인 단추(비로그인 분기)", event: "click", handler: "`components/wallet/TwoFactorSetup.tsx:73`", before: "로그인 시트 열림", visible: "로그인 시트", stored: "없음", kb: "-", src: "통합(코드에서 찾음). CX 색인", agree: "단독(통합)", verify: "코드. 이 부품을 부르는 두 곳(`AccountScreen.tsx:75-77`, `WithdrawScreen.tsx:185-187`)이 모두 로그인한 뒤에만 그리므로 도달 불가", test: "없음", tag: "" },
  { screen: "후기 카드", control: "긴 글의 잘림 표시", event: "글이 바뀜(effect)", handler: "`components/box/BoxReviews.tsx:126`", before: "글이 칸보다 길면 잘림 표시", visible: "카드 끝의 흐림", stored: "없음", kb: "-", src: "CX-I-022", agree: "단독(CX)", verify: "코드. 통합이 줄을 확인. 창 크기가 바뀔 때 다시 재지 않는다(감시자가 없다)", test: "없음", tag: "" },
  { screen: "전역(모양)", control: "포커스 고리", event: "키보드 포커스(:focus-visible)", handler: "`app/ui.css:15`", before: "없음 → 흰 2px 고리, 2px 띄움", visible: "모든 단추와 링크에 같은 고리. 입력 칸은 고리 대신 테두리 색(`app/ui.css:102`)", stored: "없음", kb: "Tab 으로 옮길 때만 보인다(마우스로 누를 때는 보이지 않는다)", src: "AG-a AG-I-001, AG-I-004; AG-b AG-S-001~010; AG-b 5.2절", agree: "단독(AG)", verify: "AG 가 배포 사이트에서 잰 값(`harness/agy/states-result.json`). 통합이 CSS 줄을 확인", test: "없음", tag: "" },
  { screen: "전역(모양)", control: "주 단추 `.v-btn`", event: "hover, active, disabled, 처리 중", handler: "`app/ui.css:60-63`", before: "기본 → hover(배경 한 단계 어둡게) → active(0.985배) → disabled 또는 aria-disabled(회색, 눌리지 않음) → data-busy(회색, 진행 커서)", visible: "색과 크기", stored: "없음", kb: "-", src: "AG-a 5.2절 1번; AG-b AG-S-001", agree: "단독(AG)", verify: "AG 실행(hover 와 focus 화면). 통합이 CSS 줄을 확인. 결과 화면에서 잠긴 주 단추는 모양이 처음부터 같다(`app/opening.css:106-107`)", test: "없음", tag: "" },
  { screen: "전역(모양)", control: "보조 단추, 머리줄 단추, 시트 닫기, 띠 넘김 단추, 개봉 화면 도구 단추", event: "hover", handler: "`app/ui.css:65, 38, 122, 173`, `app/opening.css:17`", before: "배경이 한 단계 밝아진다", visible: "배경색", stored: "없음", kb: "-", src: "AG-a 5.2절 2, 5, 8, 10번; AG-b AG-S-002, 007, 010", agree: "단독(AG). 개봉 화면 도구 단추(`.v-op-tool`)는 통합이 더함", verify: "AG 실행(셋). 통합이 CSS 줄을 확인", test: "없음", tag: "" },
  { screen: "전역(모양)", control: "밑줄 링크, 머리줄 링크, 행 링크, 상품 행, 꼬리말 링크", event: "hover", handler: "`app/ui.css:69, 36, 91, 368`, `app/take.css:26`, `app/footer.css:11`", before: "글자색이 밝아지거나 밑줄이 생긴다", visible: "글자색, 밑줄", stored: "없음", kb: "-", src: "AG-a 5.2절 3, 6, 11, 14, 15번; AG-b AG-S-003, 008, 009", agree: "단독(AG)", verify: "AG 실행. 통합이 CSS 줄을 확인. AG-S-009 의 이름은 상품 띠인데 잰 것은 상품 행(`.v-itemrow`)이다(`.v-strip-item` 은 CSS 에만 있고 부품에는 없다)", test: "없음", tag: "" },
  { screen: "전역(모양)", control: "알약, 체크 칸, 개봉 설정 스위치", event: "hover, 고름", handler: "`app/ui.css:77-78`, `app/take.css:6`, `app/opening.css:63-69`", before: "hover 는 배경, 고른 것은 테두리 색과 글자색(aria-pressed, aria-checked 를 따른다)", visible: "테두리와 글자색", stored: "없음", kb: "-", src: "AG-a 5.2절 4, 12, 13번; AG-b AG-S-004", agree: "단독(AG)", verify: "AG 실행(알약). 통합이 CSS 줄을 확인", test: "없음", tag: "" },
  { screen: "전역(모양)", control: "박스 카드, 뒤로 화살표", event: "hover", handler: "`app/ui.css:147, 52`", before: "배경이 생긴다", visible: "배경색", stored: "없음", kb: "-", src: "AG-a 5.2절 7, 9번; AG-b AG-S-005", agree: "단독(AG)", verify: "AG 실행(카드). 통합이 CSS 줄을 확인", test: "없음", tag: "" },
  { screen: "전역(모양)", control: "글 선택, 스크롤 막대", event: "선택, hover", handler: "`app/ui.css:9, 14`", before: "선택 색, 막대 색", visible: "색", stored: "없음", kb: "-", src: "AG-a AG-I-002, AG-I-003", agree: "단독(AG)", verify: "코드. 통합이 CSS 줄을 확인", test: "없음", tag: "" },
];

export const OVERLAY = O;
