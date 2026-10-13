// 보관함(탭, 한 번에 받기, 상품 상세, 한 개 받기, 배송 시트의 검증, 후기 쓰기), 잔액 시트, 받기의 어긋난 장부와 저장 실패.
// 배송 신청은 확인창이 뜨는 데서 멈춘다(신청을 보내지 않는다).
import { recorder, session, txt, sheetText, scrims, sleep, near, BASE } from "./lib.mjs";
const { check, run, save } = recorder("05-take");
const pathOf = (page) => new URL(page.url()).pathname.replace("/voila-test-aresjoo", "");
const TOTAL = 1471.55;

// t1: 보관함의 탭과 한 번에 받기
await run("t1", async () => {
  const s = await session({ preset: "inventory", view: "mobile" });
  const page = await s.open("/ko/inventory/");
  await page.waitForSelector(".v-itemrow");
  const tabs = await page.locator(".v-chips .v-chip").allInnerTexts();
  check("t1", "탭 셋과 개수(보관 중 2, 배송 0, 받은 것 0)", tabs.join("|") === "보관 중 2|배송 0|받은 것 0", tabs);
  const rows = await page.locator(".v-itemrow").evaluateAll((els) => els.map((e) => e.innerText.replace(/\s+/g, " ")));
  check("t1", "행: 이름, 상품가, 받을 금액(95%)", rows.length === 2 && rows.some((r) => r.includes("$950")) && rows.some((r) => r.includes("$521.55")), rows);
  await s.shot(page, "05-t1-inventory");
  await page.locator(".v-chips .v-chip").nth(1).click(); await sleep(200);
  check("t1", "배송 탭: 빈 상태 한 줄, 받기 단추 없음", (await txt(page.locator(".v-empty"))) === "배송 중인 상품이 없습니다." && (await page.locator("[data-take-batch]").count()) === 0);
  await page.locator(".v-chips .v-chip").nth(2).click(); await sleep(200);
  check("t1", "받은 것 탭: 빈 상태 한 줄", (await txt(page.locator(".v-empty"))) === "받은 기록이 없습니다.");
  await page.locator(".v-chips .v-chip").nth(0).click(); await sleep(200);
  // 한 번에 받기
  await page.locator("[data-take-batch]").click(); await page.waitForSelector(".v-sheet [data-take-row]"); await sleep(300);
  check("t1", "선택 시트: 아무것도 고르지 않았고 주 단추가 눌리지 않는다", (await page.locator("[data-take-submit]").isDisabled()) && (await txt(page.locator("[data-take-submit]"))) === "상품을 선택합니다" && (await page.locator("[data-take-all]").getAttribute("aria-checked")) === "false");
  await page.locator(".v-sheet [data-take-row]").first().click(); await sleep(100);
  check("t1", "하나 고르면 머리 행은 mixed, 주 단추에 1개와 금액", (await page.locator("[data-take-all]").getAttribute("aria-checked")) === "mixed" && (await txt(page.locator("[data-take-submit]"))).startsWith("USDT로 받기 (1개, "), await txt(page.locator("[data-take-submit]")));
  await page.locator(".v-sheet [data-take-row]").first().focus(); await page.keyboard.press("Space"); await sleep(100);
  check("t1", "행에서 Space 로 선택을 푼다(키보드)", (await page.locator("[data-take-all]").getAttribute("aria-checked")) === "false");
  await page.locator("[data-take-all]").click(); await sleep(100);
  check("t1", "전체 선택: 2개와 합계", (await txt(page.locator("[data-take-submit]"))) === "USDT로 받기 (2개, $1,471.55)");
  await s.shot(page, "05-t1-take-sheet");
  await page.locator("[data-take-submit]").click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(300);
  check("t1", "확인창이 같은 자리에 뜬다(시트 하나만 보인다)", (await page.locator(".v-scrim").count()) === 1 && (await txt(page.locator('[role="alertdialog"]'))).includes("받을 금액 $1,471.55"));
  await page.keyboard.press("Escape"); await sleep(250);
  check("t1", "확인창의 Esc 는 고르는 단계로 돌아간다(고른 것 유지, 돈 그대로)", (await page.locator("[data-take-all]").getAttribute("aria-checked")) === "true" && near((await s.ledger(page)).balance, 10000));
  await page.locator("[data-take-submit]").click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(300);
  await page.evaluate(() => { const b = document.querySelector('[role="alertdialog"] .v-btn'); for (let i = 0; i < 4; i++) b.click(); });
  await page.waitForSelector("[data-take-done]", { timeout: 15000 });
  const l = await s.ledger(page);
  check("t1", "확정을 네 번 눌러도 지급은 한 번: 잔액 11471.55, sellback 1건(상품 id 둘), SOLD 2", near(l.balance, 10000 + TOTAL) && l.sellbacks.length === 1 && l.sellbacks[0].itemIds?.length === 2 && l.sold === 2, { bal: l.balance, sb: l.sellbacks });
  check("t1", "결과 한 줄", (await sheetText(page)).includes("잔액에 $1,471.55 넣었습니다."), await sheetText(page));
  await s.shot(page, "05-t1-take-done");
  await page.locator("[data-take-done]").click(); await sleep(300);
  const tabs2 = await page.locator(".v-chips .v-chip").allInnerTexts();
  check("t1", "닫으면 보관 중 탭 그대로(빈 상태와 박스 보기 단추), 탭 개수가 바뀐다, 머리줄 잔액도 바뀐다", tabs2.join("|") === "보관 중 0|배송 0|받은 것 2" && (await page.locator("main a.v-btn").count()) === 1 && (await txt(page.locator("[data-balance-open]"))) === "잔액 $11,471.55", tabs2);
  await page.reload({ waitUntil: "networkidle" }); await page.waitForSelector(".v-chips"); await sleep(400);
  check("t1", "새로 고침 뒤에도 그대로", near((await s.ledger(page)).balance, 11471.55) && (await page.locator(".v-chips .v-chip").allInnerTexts()).join("|") === "보관 중 0|배송 0|받은 것 2");
  await page.locator(".v-chips .v-chip").nth(2).click(); await page.waitForSelector(".v-itemrow"); await sleep(200);
  await page.locator(".v-itemrow").first().click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  const d = await sheetText(page);
  check("t1", "받은 것의 상세: USDT로 받음, 받은 금액, 받기 단추 없음, 검증 링크", d.includes("USDT로 받음") && d.includes("받은 금액") && (await page.locator(".v-sheet [data-take-primary]").count()) === 0, d);
  check("t1", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// t2: 상품 상세, 한 개 받기, 배송 시트의 검증(신청은 보내지 않는다), 검증 시트
await run("t2", async () => {
  const s = await session({ preset: "inventory", view: "mobile" });
  const page = await s.open("/ko/inventory/");
  await page.waitForSelector(".v-itemrow");
  await page.locator(".v-itemrow").first().click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  let t = await sheetText(page);
  const main = await page.locator(".v-sheet .v-btn").allInnerTexts(); const links = await page.locator(".v-sheet .v-links .v-link").allInnerTexts();
  check("t2", "상세: 주 단추 하나(USDT로 받기), 링크 둘(배송 받기, 개봉 결과 검증), 후기 쓰기 행", main.length === 1 && main[0].startsWith("USDT로 받기 (") && links.join("|") === "배송 받기|개봉 결과 검증" && t.includes("후기 쓰기"), { main, links, t: t.slice(0, 240) });
  await s.shot(page, "05-t2-item-detail");
  // 검증
  await page.locator(".v-sheet .v-links .v-link", { hasText: "개봉 결과 검증" }).click(); await sleep(600);
  await page.waitForFunction(() => /같습니다|다릅니다|맞춰 보지|계산하지/.test(document.querySelector(".v-sheet")?.innerText || ""), null, { timeout: 10000 });
  t = await sheetText(page);
  check("t2", "검증으로 바뀐다(시트 하나), 심은 옛 기록은 다름 판정(회차와 번호가 맞지 않는 고정 자료)", (await page.locator(".v-scrim").count()) === 1 && t.startsWith("개봉 결과 검증"), t.slice(-260));
  await s.shot(page, "05-t2-verify-mismatch");
  await page.locator(".v-sheet .v-links .v-link", { hasText: "블록체인 검증 방식" }).click(); await sleep(200);
  check("t2", "블록체인 검증 방식 링크는 설명을 펼친다", (await sheetText(page)).includes("배송, 정품 여부, 상품가의 정확성은 이 검증의 대상이 아닙니다."));
  const manual = await page.locator(".v-sheet .v-links a").getAttribute("href");
  check("t2", "값을 직접 넣어 검증 링크는 값을 주소에 실어 보낸다", /\/ko\/verify\/?\?s=capture-fixture&h=[0-9a-f]{64}&c=capture-client&n=0&box=dollar-apple/.test(manual), manual);
  await page.keyboard.press("Escape"); await sleep(300);
  check("t2", "검증을 닫으면 상품 상세로 돌아온다", (await sheetText(page)).includes("상품가") && (await page.locator(".v-sheet [data-take-primary]").count()) === 1);
  // 배송 시트
  await page.locator(".v-sheet .v-links .v-link", { hasText: "배송 받기" }).click(); await sleep(500);
  t = await sheetText(page);
  check("t2", "배송 받기: 같은 자리에서 배송 시트로 바뀐다(나라 알약 13, 입력칸 다섯, 보낼 상품 1개, 배송비 $0)", t.startsWith("배송 받기") && (await page.locator(".v-sheet .v-chip").count()) === 13 && (await page.locator(".v-sheet .v-input").count()) === 5 && t.includes("보낼 상품 1개") && t.includes("배송비 $0"), t.slice(0, 200));
  await page.locator(".v-sheet .v-btn").click(); await sleep(250);
  const errs = await page.locator(".v-sheet .v-line--fail").allInnerTexts();
  check("t2", "빈 채로 배송 신청을 누르면 칸마다 실패 한 줄(다섯), 확인창은 뜨지 않는다", errs.length === 5 && (await page.locator('[role="alertdialog"]').count()) === 0, errs);
  await s.shot(page, "05-t2-ship-errors");
  const f = page.locator(".v-sheet .v-input");
  await f.nth(0).fill("홍길동"); await f.nth(1).fill("010-1234-5678"); await f.nth(2).fill("04524"); await f.nth(3).fill("서울시 중구 세종대로 110 101호"); await f.nth(4).fill("p123456789012");
  check("t2", "채우면 실패 한 줄이 사라진다(누른 뒤에는 입력마다 다시 본다)", (await page.locator(".v-sheet .v-line--fail").count()) === 0);
  // 나라를 미국으로: 통관 칸이 사라진다
  await page.locator(".v-sheet .v-chip").nth(1).click(); await sleep(150);
  check("t2", "나라를 미국으로 바꾸면 통관 번호 칸이 사라진다(칸 넷)", (await page.locator(".v-sheet .v-input").count()) === 4);
  await page.locator(".v-sheet .v-chip").nth(2).click(); await sleep(150);
  check("t2", "중국으로 바꾸면 신분증 번호 칸(18자리)이 나오고 넣어 둔 값은 형식이 달라 실패 한 줄", (await page.locator(".v-sheet .v-input").count()) === 5 && (await page.locator(".v-sheet .v-line--fail").allInnerTexts()).join("") === "신분증 번호는 18자리입니다.", await page.locator(".v-sheet .v-line--fail").allInnerTexts());
  await page.locator(".v-sheet .v-chip").nth(0).click(); await sleep(150);
  await page.locator(".v-sheet .v-btn").click(); await page.waitForSelector('[role="alertdialog"]', { timeout: 5000 }); await sleep(250);
  const c = await txt(page.locator('[role="alertdialog"]'));
  check("t2", "전부 맞으면 확인창(주소를 다시 보여 준다). 여기서 멈춘다", c.includes("서울시 중구 세종대로 110 101호 주소로 보내고, 출고된 뒤에는 취소할 수 없습니다."), c);
  await s.shot(page, "05-t2-ship-confirm");
  await page.locator('[role="alertdialog"] .v-link').click(); await sleep(250);
  const l0 = await s.ledger(page);
  check("t2", "취소: 배송 시트로 돌아오고 넣은 값이 남아 있다, 상품은 그대로 보관 중", (await page.locator(".v-sheet .v-input").nth(0).inputValue()) === "홍길동" && l0.held === 2, l0.items.map((i) => i.status));
  await page.keyboard.press("Escape"); await sleep(300);
  check("t2", "배송 시트를 닫으면 상품 상세로 돌아온다", (await page.locator(".v-sheet [data-take-primary]").count()) === 1);
  // 한 개 받기
  await page.locator(".v-sheet [data-take-primary]").click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(300);
  await page.evaluate(() => { const b = document.querySelector('[role="alertdialog"] .v-btn'); for (let i = 0; i < 2; i++) b.click(); });
  await page.waitForFunction(() => !document.querySelector(".v-scrim"), null, { timeout: 15000 }); await sleep(300);
  const l = await s.ledger(page);
  check("t2", "한 개 받기: 두 번 눌러도 한 번, 시트가 닫히고 받은 것 탭으로 옮겨 간다", l.sellbacks.length === 1 && l.sold === 1 && l.held === 1 && (await page.locator(".v-chips .v-chip[aria-pressed='true']").innerText()).startsWith("받은 것 1"), { bal: l.balance, sb: l.sellbacks });
  check("t2", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// t3: 후기 쓰기
await run("t3", async () => {
  const s = await session({ preset: "inventory", view: "mobile" });
  const page = await s.open("/ko/inventory/");
  await page.waitForSelector(".v-itemrow");
  await page.locator(".v-itemrow", { hasText: "$950" }).click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  await page.locator(".v-sheet .v-rowlink").click(); await sleep(400);
  let t = await sheetText(page);
  check("t3", "후기 쓰기: 같은 자리에서 후기 시트로(별점 알약 다섯, 5점이 골라져 있다, 글 칸, 사진 칸)", t.startsWith("후기 쓰기") && (await page.locator(".v-sheet .v-chip").count()) === 5 && (await page.locator(".v-sheet .v-chip[aria-pressed='true']").innerText()) === "5점" && (await page.locator(".v-sheet textarea").count()) === 1 && (await page.locator(".v-sheet input[type='file']").count()) === 1, t.slice(0, 160));
  await page.locator(".v-sheet .v-btn").click(); await sleep(200);
  check("t3", "빈 글로 올리면 5자 이상이라는 한 줄", (await txt(page.locator(".v-sheet .v-line--fail"))) === "5자 이상 적습니다.");
  await page.locator(".v-sheet textarea").fill("abcd"); await sleep(100);
  check("t3", "글을 고치면 한 줄이 지워진다", (await page.locator(".v-sheet .v-line--fail").count()) === 0);
  await page.locator(".v-sheet .v-btn").click(); await sleep(200);
  check("t3", "4자도 실패", (await page.locator(".v-sheet .v-line--fail").count()) === 1);
  await s.shot(page, "05-t3-review-short");
  await page.locator(".v-sheet .v-chip").nth(3).click();
  await page.locator(".v-sheet textarea").fill("claude-b 감사용 후기입니다. 포장이 깔끔했습니다.");
  // 더블클릭은 09-keys-dblclick.mjs 가 따로 본다(두 번째 누름이 뒤에서 돌아온 상품 상세의 USDT로 받기에 닿는다)
  await page.locator(".v-sheet .v-btn").click(); await sleep(500);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("gachaflix.community") || "null")?.state?.mine ?? []);
  check("t3", "올리면 후기 하나가 저장된다(gachaflix.community), 별점 4", stored.length === 1 && stored[0].rating === 4 && stored[0].ownedId === "capture-item-1" && stored[0].bonusUsdt === 0, stored.map((r) => ({ id: r.id, rating: r.rating, owned: r.ownedId, author: r.authorName })));
  t = await sheetText(page);
  check("t3", "올린 뒤 상품 상세로 돌아오고 행이 올렸다고 말한다", t.includes("후기를 올렸습니다") && !t.includes("후기 쓰기 ›"), t.slice(0, 260));
  await s.shot(page, "05-t3-reviewed");
  await page.keyboard.press("Escape"); await sleep(200);
  // 박스 화면과 후기 모아보기에 보인다
  await page.goto(BASE + "/ko/box/dollar-apple/", { waitUntil: "networkidle" }); await page.waitForSelector("#reviews .v-rvcard");
  const first = await txt(page.locator("#reviews .v-rvcard").first());
  check("t3", "박스 화면의 후기 띠 맨 앞에 내 후기, 후기 수가 4로 는다", first.includes("claude-b 감사용 후기입니다.") && (await txt(page.locator("#reviews .v-rvsum"))).includes("후기 4개"), { first, sum: await txt(page.locator("#reviews .v-rvsum")) });
  await page.locator("#reviews .v-rvcard-btn").first().click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  t = await sheetText(page);
  const vhref = await page.locator(".v-sheet .v-links a").first().getAttribute("href");
  check("t3", "내 후기의 상세: 검증 줄과 그 개봉의 값을 실은 검증 링크", t.includes("미리 잠근 해시와 개봉 기록을 대조합니다.") && vhref.includes("/ko/verify/?s=capture-fixture"), { vhref, t: t.slice(0, 200) });
  await s.shot(page, "05-t3-my-review-detail");
  await page.locator(".v-sheet .v-links a").first().click(); await page.waitForURL(/\/verify\//); await sleep(600);
  const vals = await page.locator("#verify-manual ~ label input, section[aria-labelledby='verify-manual'] input").evaluateAll((els) => els.map((e) => e.value));
  check("t3", "검증 화면: 값이 미리 채워져 있다(공개된 값, 잠근 값, 내 기기 값, 회차)", vals[0] === "capture-fixture" && vals[2] === "capture-client" && vals[3] === "0", vals);
  await page.reload({ waitUntil: "networkidle" }); await sleep(500);
  check("t3", "새로 고친 뒤 후기는 저장소에 남아 있다", (await page.evaluate(() => JSON.parse(localStorage.getItem("gachaflix.community")).state.mine.length)) === 1);
  check("t3", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// t4: 잔액 시트
await run("t4", async () => {
  const s = await session({ preset: "inventory", view: "mobile" });
  const page = await s.open("/ko/");
  await page.waitForSelector("[data-balance-open]");
  await page.locator("[data-balance-open]").click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  let t = await sheetText(page);
  check("t4", "잔액 시트: 행 셋, 주 단추 USDT로 받기, 링크 둘(충전, 출금)", t.includes("개봉에 쓸 잔액 $10,000") && t.includes("출금할 수 있는 잔액 $10,000") && t.includes("보관 중인 상품 2개 USDT로 받으면 $1,471.55") && (await page.locator(".v-sheet .v-links .v-link").allInnerTexts()).join("|") === "USDT 충전하기|출금", t);
  await s.shot(page, "05-t4-balance-sheet");
  await page.locator("[data-balance-take]").click(); await page.waitForSelector(".v-sheet [data-take-row]"); await sleep(300);
  check("t4", "USDT로 받기: 같은 자리에서 선택 시트로(시트 하나)", (await page.locator(".v-scrim").count()) === 1 && (await page.locator(".v-sheet [data-take-row]").count()) === 2);
  await page.keyboard.press("Escape"); await sleep(300);
  check("t4", "선택 시트를 닫으면 잔액 시트로 돌아가지 않고 전부 닫힌다", (await scrims(page)) === 0);
  await page.locator("[data-balance-open]").click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  await page.locator(".v-sheet .v-links .v-link", { hasText: "USDT 충전하기" }).click(); await sleep(500);
  t = await sheetText(page);
  check("t4", "충전 링크: 잔액 시트가 닫히고 충전 시트가 뜬다(시트 하나)", (await page.locator(".v-scrim").count()) === 1 && t.startsWith("USDT 충전"), t.slice(0, 80));
  await page.keyboard.press("Escape"); await sleep(300);
  await page.locator("[data-balance-open]").click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  await page.locator(".v-sheet .v-links a", { hasText: "출금" }).click(); await page.waitForURL(/\/wallet\/withdraw\//); await sleep(300);
  check("t4", "출금 링크: 출금 화면으로 가고 시트가 닫힌다", pathOf(page) === "/ko/wallet/withdraw/" && (await scrims(page)) === 0);
  await s.context.close();

  const g = await session({ preset: "funded", view: "mobile" });
  const p = await g.open("/ko/");
  await p.locator("[data-balance-open]").click(); await p.waitForSelector(".v-sheet"); await sleep(300);
  check("t4", "보관 상품이 없으면 주 단추 USDT 충전하기, 링크 둘(출금, 지갑 내역)", (await p.locator(".v-sheet .v-btn").allInnerTexts()).join("|") === "USDT 충전하기" && (await p.locator(".v-sheet .v-links .v-link").allInnerTexts()).join("|") === "출금|지갑 내역");
  await p.locator(".v-sheet .v-links a", { hasText: "지갑 내역" }).click(); await p.waitForURL(/\/wallet\//);
  check("t4", "지갑 내역 링크", pathOf(p) === "/ko/wallet/");
  await g.context.close();
});

// t5: 어긋난 장부(받은 상태인데 입금 내역이 없고 확인 대기 표시가 남았다, 보관 중인데 입금 내역이 있다)
const broken = (inventory, wallet, values, walletKeys) => {
  const now = new Date().toISOString();
  const [first, second] = inventory.items;
  const mark = JSON.stringify([{ ids: [first.id], c: wallet.cryptoBalance, d: wallet.cardBalance ?? 0, n: wallet.transactions.length, l: wallet.transactions[0]?.id ?? null }]);
  for (const key of walletKeys) values["voila.take-unconfirmed." + key] = mark;
  Object.assign(first, { status: "SOLD", soldForUsdt: 950, soldAt: now });
  wallet.transactions.unshift({ id: "capture-sellback", accountId: "capture-account", type: "sellback", amountUsdt: 521.55, at: now, ref: second.id, itemIds: [second.id] });
  wallet.balance = +(wallet.balance + 521.55).toFixed(2); wallet.cryptoBalance = +(wallet.cryptoBalance + 521.55).toFixed(2);
};
await run("t5", async () => {
  const s = await session({ preset: "inventory", view: "mobile", mutate: broken });
  const page = await s.open("/ko/inventory/");
  await page.waitForSelector(".v-itemrow"); await sleep(400);
  let row = await txt(page.locator(".v-itemrow").first());
  check("t5", "보관 중인데 입금 내역이 있는 상품: 확인 필요라고 적고 받을 금액을 적지 않는다, 한 번에 받기 단추 없음", row.includes("확인 필요") && !row.includes("$521.55") && (await page.locator("[data-take-batch]").count()) === 0, row);
  await s.shot(page, "05-t5-unconfirmed-held");
  await page.locator(".v-itemrow").first().click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  let t = await sheetText(page);
  check("t5", "그 상세: 확인하지 못했다는 한 줄, 받기 단추와 배송 링크 없음, 지갑 내역과 검증 링크", t.includes("처리 상태를 확인하지 못했습니다.") && (await page.locator(".v-sheet .v-btn").count()) === 0 && (await page.locator(".v-sheet .v-links .v-link").allInnerTexts()).join("|") === "지갑 내역|개봉 결과 검증", t);
  await s.shot(page, "05-t5-unconfirmed-detail");
  await page.keyboard.press("Escape"); await sleep(250);
  await page.locator(".v-chips .v-chip").nth(2).click(); await page.waitForSelector(".v-itemrow"); await sleep(200);
  row = await txt(page.locator(".v-itemrow").first());
  check("t5", "받은 상태인데 입금 내역이 없는 상품: USDT로 받음도 받은 금액도 적지 않는다", row.includes("확인 필요") && !row.includes("USDT로 받음") && !row.includes("$950"), row);
  await page.locator("[data-balance-open]").click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  t = await sheetText(page);
  check("t5", "잔액 시트: 받을 수 있는 상품으로 세지 않는다", !t.includes("USDT로 받으면") && (await page.locator(".v-sheet .v-btn").allInnerTexts()).join("|") === "USDT 충전하기", t);
  const l = await s.ledger(page);
  check("t5", "돈은 움직이지 않았다(10521.55, sellback 1건)", near(l.balance, 10521.55) && l.sellbacks.length === 1, l.balance);
  const marks = await page.evaluate(() => { const out = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith("voila.take-unconfirmed.")) out[k] = localStorage.getItem(k); } return out; });
  check("t5", "확인 대기 표시가 저장소에 그대로 남아 있다", Object.keys(marks).some((k) => k.endsWith("capture-account")), Object.keys(marks));
  await s.context.close();
});

// t6: 저장 실패. 받는 도중 저장소가 가득 찼을 때
await run("t6", async () => {
  const s = await session({ preset: "inventory", view: "mobile", quota: true });
  const page = await s.open("/ko/inventory/");
  await page.waitForSelector(".v-itemrow");
  await page.locator("[data-take-batch]").click(); await page.waitForSelector(".v-sheet [data-take-row]"); await sleep(300);
  await page.locator("[data-take-all]").click();
  await page.locator("[data-take-submit]").click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(300);
  await page.evaluate(() => { window.__quotaFull = true; });
  await page.locator('[role="alertdialog"] .v-btn').click();
  await page.waitForFunction(() => document.querySelector("[data-take-done], [data-take-retry]"), null, { timeout: 15000 }); await sleep(300);
  const t = await sheetText(page);
  const mem = await txt(page.locator("[data-balance-open]"));
  await page.evaluate(() => { window.__quotaFull = false; });
  const l = await s.ledger(page);
  check("t6", "저장소에 쓸 수 없으면 받기를 시작하지 않는다: 받지 못했다는 한 줄과 다시 시도 단추", t.includes("USDT로 받지 못했습니다. 상품은 보관함에 있습니다.") && (await page.locator("[data-take-retry]").count()) === 1, t);
  check("t6", "저장된 장부와 화면의 잔액 모두 그대로(10000, 보관 2, sellback 0)", near(l.balance, 10000) && l.held === 2 && l.sellbacks.length === 0 && mem.includes("10,000"), { bal: l.balance, held: l.held, mem });
  await s.shot(page, "05-t6-take-storage-full");
  await page.locator("[data-take-retry]").click();
  await page.waitForSelector("[data-take-done]", { timeout: 15000 }); await sleep(300);
  const l2 = await s.ledger(page);
  check("t6", "저장소가 돌아온 뒤 다시 시도: 한 번만 지급(11471.55, sellback 1건)", near(l2.balance, 11471.55) && l2.sellbacks.length === 1 && l2.sold === 2, { bal: l2.balance, sb: l2.sellbacks.length });
  await s.context.close();

  // 받기가 시작된 뒤(표시를 적은 뒤) 지갑 쓰기만 실패: 확인 대기 표시를 적는 것까지는 되고, 그다음 쓰기부터 실패한다
  const s2 = await session({ preset: "inventory", view: "mobile", quota: true });
  const p = await s2.open("/ko/inventory/");
  await p.waitForSelector(".v-itemrow");
  await p.evaluate(() => {
    // 확인 대기 표시가 적히는 순간부터 저장소를 가득 찬 것으로 만든다(그 뒤의 보관함과 지갑 쓰기가 전부 실패한다)
    const proto = Storage.prototype; const set = proto.setItem;
    proto.setItem = function (k, v) { const r = set.call(this, k, v); if (String(k).startsWith("voila.take-unconfirmed.")) window.__quotaFull = true; return r; };
  });
  await p.locator("[data-take-batch]").click(); await p.waitForSelector(".v-sheet [data-take-row]"); await sleep(300);
  await p.locator("[data-take-all]").click();
  await p.locator("[data-take-submit]").click(); await p.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(300);
  await p.locator('[role="alertdialog"] .v-btn').click();
  await p.waitForFunction(() => document.querySelector("[data-take-done], [data-take-retry]"), null, { timeout: 15000 }); await sleep(400);
  const t2 = await sheetText(p);
  const mem2 = await txt(p.locator("[data-balance-open]"));
  const btns = { done: await p.locator("[data-take-done]").count(), retry: await p.locator("[data-take-retry]").count() };
  await s2.shot(p, "05-t6-take-midway-storage-fail");
  await p.evaluate(() => { window.__quotaFull = false; });
  const l3 = await s2.ledger(p);
  check("t6", "받는 도중 저장이 실패했을 때 화면이 말하는 것(본 것)", "info", { sheet: t2, mem: mem2, btns, saved: { bal: l3.balance, held: l3.held, sold: l3.sold, sellbacks: l3.sellbacks.length } });
  check("t6", "받는 도중 저장 실패: 받았다고 말하지 않는다", !/잔액에 \S+ 넣었습니다\./.test(t2), t2);
  check("t6", "받는 도중 저장 실패: 저장된 장부에는 돈이 들어오지 않았다", near(l3.balance, 10000) && l3.sellbacks.length === 0, { bal: l3.balance });
  // 창으로 돌아온 것처럼: 표시를 다시 본다
  await p.evaluate(() => window.dispatchEvent(new Event("focus"))); await sleep(2600);
  const mem3 = await txt(p.locator("[data-balance-open]"));
  const l4 = await s2.ledger(p);
  check("t6", "저장소가 돌아오고 창으로 돌아온 뒤: 화면의 잔액이 저장된 장부(10000)와 다시 맞는다", mem3.includes("10,000") && near(l4.balance, 10000), { mem3, saved: l4.balance, held: l4.held });
  await s2.shot(p, "05-t6-after-resync");
  await s2.context.close();
});

await save();
