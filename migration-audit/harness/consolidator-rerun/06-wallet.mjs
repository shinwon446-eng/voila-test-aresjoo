// 지갑(잔액, 충전 시트, 내역과 거래 시트, 대기 중인 출금), 출금 화면(관문, 입력과 검증, 확인 단계까지). 출금 신청은 보내지 않는다.
import { recorder, session, txt, sheetText, scrims, sleep, near, BASE } from "./lib.mjs";
const { check, run, save } = recorder("06-wallet");
const pathOf = (page) => new URL(page.url()).pathname.replace("/voila-test-aresjoo", "");
const TRC = "T" + "A".repeat(33); // 형식만 맞는 시험 주소(아무 지갑도 아니다)

await run("w1", async () => {
  const g = await session({ preset: "guest", view: "mobile" });
  let page = await g.open("/ko/wallet/");
  await page.waitForSelector("main .v-btn");
  check("w1", "비로그인 지갑: 로그인 한 줄과 로그인 단추", (await txt(page.locator("main"))).includes("로그인하면 잔액과 내역이 표시됩니다."));
  await page.locator("main .v-btn").click(); await page.waitForSelector(".v-sheet"); await sleep(200);
  check("w1", "로그인 단추는 로그인 시트", (await sheetText(page)).startsWith("로그인"));
  await g.context.close();

  const s = await session({ preset: "funded", view: "mobile" });
  page = await s.open("/ko/wallet/");
  await page.waitForSelector("main .v-rows");
  check("w1", "지갑: 출금할 수 있는 잔액 행, 주 단추 충전, 링크 출금, 내역 한 행(보너스)", (await txt(page.locator("main"))).includes("출금할 수 있는 잔액 $10,000") && (await page.locator("main .v-itemrow").count()) === 1, (await txt(page.locator("main"))).slice(0, 200));
  await s.shot(page, "06-w1-wallet");
  // 충전 시트
  await page.locator("main .v-btn").click(); await page.waitForSelector(".v-sheet"); await sleep(1200);
  let t = await sheetText(page);
  check("w1", "충전 시트: 네트워크 알약 셋(TRC-20 이 골라져 있다)", (await page.locator(".v-sheet .v-chip").allInnerTexts()).join("|") === "USDT (TRC-20)|USDT (BEP-20)|USDT (ERC-20)" && (await page.locator(".v-sheet .v-chip").first().getAttribute("aria-pressed")) === "true");
  check("w1", "배포 사이트에는 입금 주소가 없다: 주소를 받지 못했다는 한 줄과 주소 다시 받기 단추(QR, 주소, 복사 단추 없음)", t.includes("주소를 받지 못했습니다.") && (await txt(page.locator(".v-sheet > .v-sheet-body > .v-btn"))) === "주소 다시 받기" && (await page.locator(".v-sheet .v-qr").count()) === 0, t);
  await s.shot(page, "06-w1-charge-sheet");
  await page.locator(".v-sheet .v-chip").nth(1).click(); await sleep(900);
  check("w1", "네트워크를 바꾸면 다시 주소를 청한다(BEP-20 도 받지 못한다)", (await page.locator(".v-sheet .v-chip").nth(1).getAttribute("aria-pressed")) === "true" && (await sheetText(page)).includes("주소를 받지 못했습니다."));
  await page.locator(".v-sheet > .v-sheet-body > .v-btn").click(); await sleep(900);
  check("w1", "주소 다시 받기를 눌러도 결과는 같다(실패 한 줄 그대로)", (await sheetText(page)).includes("주소를 받지 못했습니다."));
  const l = await s.ledger(page);
  check("w1", "충전 시트를 여닫아도 장부는 그대로", near(l.balance, 10000) && l.txCount === 1);
  await page.keyboard.press("Escape"); await sleep(250);
  // 내역 행 → 거래 시트
  await page.locator("main .v-itemrow").first().click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  t = await sheetText(page);
  check("w1", "내역 행을 누르면 거래 시트(종류, 시각, 금액)", t.startsWith("보너스") && t.includes("금액 +$10,000"), t);
  await page.keyboard.press("Escape"); await sleep(250);
  await page.locator("main .v-links a").click(); await page.waitForURL(/\/wallet\/withdraw\//);
  check("w1", "출금 링크", pathOf(page) === "/ko/wallet/withdraw/");
  check("w1", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// w2: 개봉과 받기 뒤의 내역, 더 보기
await run("w2", async () => {
  const s = await session({ preset: "funded", view: "mobile", reduced: true, fixture: "dollar-apple:single:itemLow" });
  let page = await s.open("/ko/box/dollar-apple/");
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  await page.locator("[data-open-primary]").click(); await page.waitForSelector(".v-op[data-opening-state='settled']");
  await page.locator("[data-take-primary]").click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(300);
  await page.locator('[role="alertdialog"] .v-btn').click(); await page.waitForSelector("[data-taken-title]");
  await page.goto(BASE + "/ko/wallet/", { waitUntil: "networkidle" }); await page.waitForSelector("main .v-rows"); await sleep(300);
  const rows = await page.locator("main .v-itemrow").evaluateAll((els) => els.map((e) => e.innerText.replace(/\s+/g, " ")));
  const l = await s.ledger(page);
  check("w2", "저장된 거래는 셋(보너스, 박스 열기, USDT로 받기)", l.txCount === 3, { opens: l.opens, sellbacks: l.sellbacks });
  check("w2", "지갑 내역에 보이는 행(계정 표시가 있는 거래만 나온다)", "info", rows);
  check("w2", "박스 열기와 USDT로 받기 거래가 지갑 내역에 보인다", rows.some((r) => r.includes("박스 열기")) && rows.some((r) => r.includes("USDT로 받기")), rows);
  await s.shot(page, "06-w2-wallet-history-after-open");
  await s.context.close();
});

// w3: 대기 중인 출금(72시간 보안 대기): 남은 시간 한 줄, 취소
await run("w3", async () => {
  const s = await session({ preset: "pending", view: "mobile" });
  const page = await s.open("/ko/wallet/");
  await page.waitForSelector("main .v-itemrow"); await sleep(600);
  const rows = await page.locator("main .v-itemrow").evaluateAll((els) => els.map((e) => e.innerText.replace(/\s+/g, " ")));
  check("w3", "내역: 출금 둘(처리 대기, 72시간 보안 대기)과 보너스", rows.some((r) => r.includes("처리 대기")) && rows.some((r) => r.includes("72시간 보안 대기")), rows);
  await s.shot(page, "06-w3-pending");
  await page.locator("main .v-itemrow", { hasText: "72시간 보안 대기" }).click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  let t = await sheetText(page);
  check("w3", "72시간 대기 건의 시트: 금액, 상태, 네트워크, 수수료, 받는 금액, 주소, 남은 시간 한 줄, 출금 취소 단추", t.includes("금액 $-50") && t.includes("네트워크 수수료 $1") && t.includes("뒤에 전송됩니다. 그 전에는 취소할 수 있습니다.") && (await txt(page.locator(".v-sheet .v-btn"))) === "출금 취소", t);
  await s.shot(page, "06-w3-hold-sheet");
  const before = await s.ledger(page);
  await page.locator(".v-sheet .v-btn").click(); await page.waitForSelector('[role="alertdialog"]'); await sleep(250);
  check("w3", "출금 취소는 확인창을 거친다", (await txt(page.locator('[role="alertdialog"]'))).includes("출금을 취소하고 금액을 잔액으로 되돌립니다."));
  await page.locator('[role="alertdialog"] .v-link').click(); await sleep(250);
  check("w3", "확인창에서 취소: 장부 그대로", near((await s.ledger(page)).balance, before.balance));
  await page.locator(".v-sheet .v-btn").click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(250);
  await page.evaluate(() => { const b = document.querySelector('[role="alertdialog"] .v-btn'); for (let i = 0; i < 3; i++) b.click(); });
  await page.waitForFunction(() => !document.querySelector('[role="alertdialog"]'), null, { timeout: 15000 }); await sleep(400);
  const after = await s.ledger(page);
  t = await sheetText(page);
  check("w3", "확정을 세 번 눌러도 한 번만 되돌린다: 잔액 +50, 상태 취소됨, 취소 단추가 사라진다", near(after.balance, before.balance + 50) && after.withdraws.some((w) => w.status === "CANCELLED") && t.includes("취소됨") && (await page.locator(".v-sheet .v-btn").count()) === 0, { before: before.balance, after: after.balance, withdraws: after.withdraws, t });
  await s.shot(page, "06-w3-cancelled");
  await page.keyboard.press("Escape"); await sleep(250);
  await page.locator("main .v-itemrow", { hasText: "처리 대기" }).click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  check("w3", "처리 대기 건에는 취소 단추가 없다", (await page.locator(".v-sheet .v-btn").count()) === 0, await sheetText(page));
  await s.context.close();
});

// w4: 출금 화면. 관문(인증 앱), 이메일 경로, 입력 검증, 확인 단계에서 멈춘다
await run("w4", async () => {
  const g = await session({ preset: "guest", view: "mobile" });
  let page = await g.open("/ko/wallet/withdraw/");
  await page.waitForSelector("main .v-btn");
  check("w4", "비로그인 출금: 로그인 한 줄과 단추, 뒤로는 지갑", (await txt(page.locator("main"))).includes("로그인하면 잔액과 내역이 표시됩니다.") && (await page.locator(".v-back").getAttribute("href")).endsWith("/ko/wallet/"));
  await g.context.close();

  const s = await session({ preset: "inventory", view: "mobile" });
  page = await s.open("/ko/wallet/withdraw/");
  await page.waitForSelector("main .v-btn"); await sleep(500);
  let t = await txt(page.locator("main"));
  check("w4", "인증 앱을 연결하지 않은 계정: 관문 화면(연결하기 단추와 이메일 인증 링크)", t.includes("인증 앱 연결") && (await txt(page.locator("main .v-btn"))) === "인증 앱 연결하기" && (await txt(page.locator("main .v-links .v-link"))).includes("이메일 인증으로 출금 (72시간 뒤 전송)"), t);
  await s.shot(page, "06-w4-gate");
  await page.locator("main .v-btn").click(); await page.waitForSelector(".v-sheet"); await page.waitForSelector(".v-sheet .v-qr", { timeout: 10000 }); await sleep(300);
  check("w4", "연결하기: 그 자리의 시트에서 곧바로 QR 과 키가 나온다(시작 단추를 누르지 않는다)", (await page.locator(".v-sheet .v-address").count()) === 1);
  await page.keyboard.press("Escape"); await sleep(300);
  check("w4", "닫으면 관문 화면 그대로(연결되지 않았다)", (await txt(page.locator("main .v-btn"))) === "인증 앱 연결하기");
  await page.locator("main .v-links .v-link").click(); await sleep(300);
  t = await txt(page.locator("main"));
  check("w4", "이메일 인증 링크: 입력 화면으로(받아 출금하기 링크, 네트워크 둘, 주소, 금액, 비율 셋, 요약 행 셋)", t.includes("보관함의 상품을 USDT로 받아 출금하기") && (await page.locator("main .v-chips").first().locator(".v-chip").allInnerTexts()).join("|") === "USDT (TRC-20)|USDT (BEP-20)" && (await page.locator("main .v-input").count()) === 2, t.slice(0, 300));
  await s.shot(page, "06-w4-form");
  const addr = page.locator("main .v-input").nth(0), amt = page.locator("main .v-input").nth(1);
  // 빈 채로 Enter
  await amt.click(); await page.keyboard.press("Enter"); await sleep(250);
  let errs = await page.locator("main .v-line--fail").allInnerTexts();
  check("w4", "빈 채로 Enter(폼 제출): 주소와 금액의 실패 한 줄, 화면은 그대로", errs.join("|") === "TRC-20 주소는 T로 시작하는 34자입니다.|금액을 숫자로 넣습니다.", errs);
  await amt.fill("5abc.5");
  check("w4", "금액 칸은 숫자와 점만 받는다", (await amt.inputValue()) === "5.5", await amt.inputValue());
  errs = await page.locator("main .v-line--fail").allInnerTexts();
  check("w4", "5.5: 가장 적은 출금 금액 한 줄", errs.includes("$20부터 출금할 수 있습니다."), errs);
  await amt.fill("20000"); await sleep(100);
  errs = await page.locator("main .v-line--fail").allInnerTexts();
  check("w4", "잔액보다 큰 금액: 잔액 한 줄", errs.includes("잔액 $10,000보다 많이 넣었습니다."), errs);
  const ratio = page.locator("main .v-chips").nth(1).locator(".v-chip");
  await ratio.nth(0).click(); const q = await amt.inputValue();
  await ratio.nth(1).click(); const h = await amt.inputValue();
  await ratio.nth(2).click(); const a = await amt.inputValue();
  check("w4", "25%, 50%, 전액 단추가 금액 칸을 채운다", q === "2500.00" && h === "5000.00" && a === "10000.00", { q, h, a });
  check("w4", "요약: 받는 금액은 수수료 1 을 뺀 값", (await txt(page.locator("main .v-rows").last())).includes("수수료를 뺀 받는 금액 $9,999"), await txt(page.locator("main .v-rows").last()));
  await addr.fill("0x123"); await sleep(100);
  check("w4", "주소 형식이 틀리면 그 네트워크의 한 줄", (await page.locator("main .v-line--fail").allInnerTexts()).includes("TRC-20 주소는 T로 시작하는 34자입니다."));
  await page.locator("main .v-chips").first().locator(".v-chip").nth(1).click(); await sleep(150);
  check("w4", "네트워크를 BEP-20 으로 바꾸면 한 줄과 수수료가 바뀐다", (await page.locator("main .v-line--fail").allInnerTexts()).includes("BEP-20 주소는 0x로 시작하는 42자입니다.") && (await txt(page.locator("main .v-rows").last())).includes("네트워크 수수료 $0.5"));
  await page.locator("main .v-chips").first().locator(".v-chip").nth(0).click();
  await addr.fill(TRC); await amt.fill("20"); await sleep(150);
  check("w4", "주소와 금액이 맞으면 실패 한 줄이 없다", (await page.locator("main .v-line--fail").count()) === 0);
  const before = await s.ledger(page);
  await page.locator("main button[type='submit']").click(); await sleep(400);
  t = await txt(page.locator("main"));
  check("w4", "출금 확인을 누르면 확인 단계(받는 금액 $19, 금액 $20, 수수료 $1, 주소 전체, 인증하고 출금). 여기서 멈춘다", t.includes("출금 확인") && t.includes("수수료를 뺀 받는 금액 $19") && t.includes(TRC) && (await txt(page.locator("main .v-btn"))) === "인증하고 출금", t);
  await s.shot(page, "06-w4-confirm-stage");
  await page.locator(".v-back").click(); await sleep(300);
  check("w4", "뒤로: 입력 화면으로 돌아오고 넣은 값이 남아 있다", (await page.locator("main .v-input").nth(0).inputValue()) === TRC && (await page.locator("main .v-input").nth(1).inputValue()) === "20");
  const after = await s.ledger(page);
  check("w4", "여기까지 장부는 그대로(출금 0건)", near(after.balance, before.balance) && after.withdraws.length === 0);
  // 받아서 출금하기 링크
  await page.locator("main .v-links .v-link", { hasText: "보관함의 상품을 USDT로 받아 출금하기" }).click(); await page.waitForSelector(".v-sheet [data-take-row]"); await sleep(300);
  await page.locator(".v-sheet [data-take-row]").first().click(); await page.locator("[data-take-submit]").click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(300);
  await page.locator('[role="alertdialog"] .v-btn').click(); await page.waitForSelector("[data-take-done]", { timeout: 15000 }); await sleep(300);
  check("w4", "받은 뒤의 주 단추는 출금으로 돌아가기", (await txt(page.locator("[data-take-done]"))) === "출금으로 돌아가기");
  await page.locator("[data-take-done]").click(); await sleep(300);
  const amount = await page.locator("main .v-input").nth(1).inputValue();
  const l2 = await s.ledger(page);
  check("w4", "금액 칸에 방금 받은 금액만 채워진다(950 또는 521.55), 출금은 나가지 않았다", ["950.00", "521.55"].includes(amount) && l2.withdraws.length === 0 && l2.sellbacks.length === 1, { amount, crypto: l2.crypto });
  check("w4", "채운 것을 한 줄로 말한다", (await txt(page.locator("main"))).includes("방금 받은 금액 가운데 출금할 수 있는 몫을 금액 칸에 넣었습니다."));
  await s.shot(page, "06-w4-prefilled");
  // 새로 고침: 입력은 저장되지 않는다
  await page.reload({ waitUntil: "networkidle" }); await page.waitForSelector("main .v-btn"); await sleep(500);
  check("w4", "새로 고치면 입력과 이메일 경로 선택이 사라지고 관문 화면으로 돌아온다(받은 금액은 잔액에 남아 있다)", (await txt(page.locator("main .v-btn"))) === "인증 앱 연결하기" && l2.sellbacks.length === 1, (await txt(page.locator("main"))).slice(0, 120));
  check("w4", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();

  // 원화 표시에서의 금액 칸
  const k = await session({ preset: "security", view: "mobile", extra: {} });
  page = await k.open("/ko/wallet/withdraw/");
  await page.waitForSelector("main form", { timeout: 15000 }); await sleep(400);
  check("w4", "인증 앱을 연결한 계정은 관문 없이 입력 화면", (await txt(page.locator("main h1"))) === "출금");
  await page.locator(".v-footer-cols button").click(); await sleep(300);
  const label = await txt(page.locator("main .v-field").nth(1));
  await page.locator("main .v-chips").nth(1).locator(".v-chip").nth(2).click();
  const full = await page.locator("main .v-input").nth(1).inputValue();
  check("w4", "원화로 보기: 금액 칸의 단위가 KRW 이고 전액은 13,800,000", label.includes("KRW") && full === "13800000", { label, full });
  await page.locator("main .v-input").nth(0).fill(TRC);
  await page.locator("main .v-input").nth(1).fill("20000"); await page.locator("main button[type='submit']").click(); await sleep(300);
  const minLine = await page.locator("main .v-line--fail").allInnerTexts();
  check("w4", "원화에서 20000 을 넣으면(14.49 USDT) 가장 적은 금액 한 줄이 뜨는데, 그 한 줄이 적는 금액도 20,000원이다(만원 아래를 버리는 표기)", minLine.join("").includes("₩20,000부터 출금할 수 있습니다."), minLine);
  await k.shot(page, "06-w4-krw-min-line");
  await page.locator("main .v-input").nth(1).fill("27600");
  await page.locator("main button[type='submit']").click(); await sleep(400);
  const t2 = await txt(page.locator("main"));
  check("w4", "27,600원 = 20 USDT: 확인 단계는 금액도 받는 금액도 ₩20,000 으로 적는다(만원 아래 버림. 27,600 과 26,220 이 같은 글자가 된다)", t2.includes("수수료를 뺀 받는 금액 ₩20,000") && t2.includes("금액 ₩20,000") && t2.includes("네트워크 수수료 ₩1,380"), t2.slice(0, 260));
  await s.shot(page, "06-w4-confirm-krw");
  await page.locator("main .v-btn").click(); await sleep(400);
  const t3 = await txt(page.locator("main"));
  check("w4", "인증하고 출금: 인증 코드 화면(코드 칸, 출금 단추, 이메일 경로 링크). 코드는 넣지 않는다", t3.includes("인증 코드") && (await page.locator("main .v-input").count()) === 1, t3.slice(0, 200));
  // 여기서 멈춘다. 코드를 넣지 않고, 출금 단추도 누르지 않는다(신청을 보내지 않는다)
  check("w4", "인증 코드 화면까지 와도 장부는 그대로(출금 0건)", (await k.ledger(page)).withdraws.length === 0);
  await k.shot(page, "06-w4-otp-stage");
  await page.locator(".v-back").click(); await sleep(300);
  check("w4", "인증 코드 화면의 뒤로: 확인 단계로 돌아간다", (await txt(page.locator("main .v-btn"))) === "인증하고 출금");
  await k.context.close();
});

await save();
