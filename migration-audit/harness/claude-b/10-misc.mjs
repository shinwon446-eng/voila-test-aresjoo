// 남은 경우: 다음 열기에 잔액이 모자랄 때의 결과 화면, 두 탭에서 연달아 열기, 수량의 새로 고침, 여럿 열기의 연출 중 새로 고침, 계정을 바꾼 뒤의 못 본 결과.
import { recorder, session, txt, sheetText, scrims, sleep, near, BASE } from "./lib.mjs";
const { check, run, save } = recorder("10-misc");
const settled = (page) => page.waitForSelector(".v-op[data-opening-state='settled']", { timeout: 20000 });
const opText = (page) => page.evaluate(() => (document.querySelector(".v-op, .v-reveal")?.innerText || "").replace(/\s+/g, " "));
const boxPage = async (s, slug) => { const page = await s.open(`/ko/box/${slug}/`); await page.waitForSelector(".v-openbar .v-btn:not([disabled])", { timeout: 20000 }); return page; };

// m1: 결과 화면에서 다음 열기에 잔액이 모자랄 때
await run("m1", async () => {
  let s = await session({ preset: "funded", balance: 1, reduced: true, fixture: "dollar-apple:single:low" });
  let page = await boxPage(s, "dollar-apple");
  await page.locator("[data-open-primary]").click(); await settled(page);
  let t = await opText(page);
  check("m1", "잔액 1 로 1달러 박스를 열어 0.05 를 받은 뒤: 한 번 더 자리에 부족 한 줄과 USDT 충전하기(보관 상품 없음)", t.includes("잔액 $0.05. $0.95 더 필요합니다.") && (await page.locator(".v-op [data-short-charge]").count()) === 1 && (await page.locator("[data-open-again]").count()) === 0, t);
  await s.shot(page, "10-m1-stuck-charge");
  await page.locator(".v-op [data-short-charge]").click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  check("m1", "결과 화면 위에서 충전 시트가 열린다(결과 화면은 그대로)", (await sheetText(page)).startsWith("USDT 충전") && (await page.locator(".v-op").count()) === 1);
  await page.keyboard.press("Escape"); await sleep(300);
  check("m1", "충전 시트의 Esc 는 시트만 닫는다", (await page.locator(".v-sheet").count()) === 0 && (await page.locator(".v-op").count()) === 1);
  check("m1", "구매는 1건뿐(스스로 다시 열지 않는다)", (await s.ledger(page)).opens.length === 1);
  await s.context.close();

  // 상품이 나왔고 다음 열기에 모자란다: 먼저 이 상품의 받기 단추, 받은 뒤에는 한 번 더 열기
  s = await session({ preset: "funded", balance: 1, reduced: true, fixture: "dollar-apple:single:itemLow" });
  page = await boxPage(s, "dollar-apple");
  await page.locator("[data-open-primary]").click(); await settled(page);
  t = await opText(page);
  check("m1", "상품이 나온 결과(잔액 0): 주 단추는 이 상품의 USDT로 받기", (await page.locator(".v-op [data-take-primary]").count()) === 1 && t.includes("USDT로 받기 ($19)"), t.slice(0, 240));
  await page.locator("[data-take-primary]").click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(300);
  await page.locator('[role="alertdialog"] .v-btn').click(); await page.waitForSelector("[data-taken-title]", { timeout: 10000 }); await sleep(300);
  check("m1", "받은 뒤(잔액 19): 한 번 더 언박싱이 주 단추가 된다. 스스로 열지 않는다", (await page.locator("[data-open-again]").count()) === 1 && (await s.ledger(page)).opens.length === 1, await opText(page));
  await s.context.close();
});

// m2: 두 탭. 한 탭에서 연 뒤, 옛 장부를 들고 있는 다른 탭에서 열어도 앞의 구매가 지워지지 않는다
await run("m2", async () => {
  const s = await session({ preset: "funded", reduced: true, fixture: "dollar-apple:single:low" });
  const a = await boxPage(s, "dollar-apple");
  const b = await boxPage(s, "dollar-apple");
  await a.bringToFront(); await a.locator("[data-open-primary]").click(); await settled(a);
  const la = await s.ledger(a);
  const staleBal = await txt(b.locator("[data-balance-open]"));
  await b.bringToFront(); await b.locator("[data-open-primary]").click(); await settled(b);
  const lb = await s.ledger(b);
  check("m2", "두 탭에서 한 번씩 열면 구매 2건, 기록 2건, 회차가 겹치지 않는다(다른 탭의 화면 잔액은 그때까지 옛 값이었다: " + staleBal + ")", lb.opens.length === 2 && lb.items.length === 2 && new Set(lb.items.map((i) => i.nonce)).size === 2 && la.opens.length === 1, { a: la.balance, b: lb.balance, nonces: lb.items.map((i) => i.nonce) });
  const cash = lb.items.reduce((sum, i) => sum + (i.sold ?? 0), 0);
  check("m2", "잔액 = 10000 - 2 + 두 결과의 합", near(lb.balance, +(10000 - 2 + cash).toFixed(2)), { bal: lb.balance, cash });
  await a.bringToFront(); await a.evaluate(() => window.dispatchEvent(new Event("focus"))); await sleep(800);
  check("m2", "첫 탭으로 돌아왔을 때의 화면 잔액(본 것. 저장된 잔액은 " + lb.balance + ")", "info", await a.evaluate(() => document.querySelector(".v-op-balance")?.innerText ?? document.querySelector("[data-balance-open]")?.innerText));
  await s.context.close();
});

// m3: 수량과 새로 고침, 여럿 열기의 연출 중 새로 고침
await run("m3", async () => {
  const s = await session({ preset: "funded", reduced: false, fixture: "dollar-apple:seq:withItem" });
  let page = await boxPage(s, "dollar-apple");
  await page.locator(".v-openbar .v-chip").nth(1).click();
  await page.reload({ waitUntil: "networkidle" }); await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  check("m3", "수량은 새로 고치면 1개로 돌아간다(저장하지 않는다)", (await page.locator(".v-openbar .v-chip").nth(0).getAttribute("aria-pressed")) === "true");
  await page.locator(".v-openbar .v-chip").nth(1).click();
  await page.locator("[data-open-primary]").click();
  await page.waitForSelector(".v-reveal", { timeout: 10000 });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("[data-open-recover]", { timeout: 20000 });
  const l0 = await s.ledger(page);
  check("m3", "5개 열기의 연출 중 새로 고침: 구매 1건, 기록 5건, 봤음 0", l0.opens.length === 1 && l0.items.length === 5 && l0.seen.length === 0 && near(l0.balance, 9997.15), { bal: l0.balance });
  await page.locator("[data-open-recover]").click(); await page.waitForSelector(".v-reveal-result", { timeout: 10000 }); await sleep(600);
  const t = await opText(page);
  check("m3", "결과 보기: 같은 다섯 결과의 요약(쓴 금액 $5, 잔액에 반영 $2.15, 보관 상품 1개)", t.includes("5개를 열었습니다") && t.includes("쓴 금액 $5") && t.includes("잔액에 반영 $2.15") && t.includes("보관 상품 1개"), t.slice(0, 300));
  const l1 = await s.ledger(page);
  check("m3", "다시 본 뒤에도 구매 1건, 봤음 1", l1.opens.length === 1 && l1.seen.length === 1 && l1.items.length === 5);
  await s.shot(page, "10-m3-recovered-multi");
  await s.context.close();
});

// m4: 못 본 결과가 있는 채로 로그아웃하고 다른 계정으로 들어가면
await run("m4", async () => {
  const s = await session({ preset: "funded", reduced: false, fixture: "dollar-apple:single:itemLow" });
  let page = await boxPage(s, "dollar-apple");
  await page.locator("[data-open-primary]").click(); await page.waitForSelector(".v-op", { timeout: 10000 });
  await page.goto(BASE + "/ko/account/", { waitUntil: "networkidle" }); await page.waitForSelector("main .v-rows");
  await page.locator("main > div > .v-links .v-link").last().click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(250);
  await page.locator('[role="alertdialog"] .v-btn').click(); await sleep(900);
  await page.locator("main .v-btn").first().click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  await page.locator(".v-sheet .v-input").fill("claude-b-other@example.invalid"); await page.keyboard.press("Enter"); await sleep(300);
  await page.locator(".v-sheet .v-input").fill("x"); await page.keyboard.press("Enter");
  await page.waitForSelector("main .v-rows", { timeout: 15000 }); await sleep(400);
  await page.goto(BASE + "/ko/box/dollar-apple/", { waitUntil: "networkidle" }); await page.waitForSelector(".v-openbar .v-btn:not([disabled])"); await sleep(600);
  check("m4", "다른 계정으로 들어가면 앞 계정의 못 본 결과를 보여 주지 않는다(열기 단추 그대로)", (await page.locator("[data-open-recover]").count()) === 0 && (await page.locator("[data-open-primary]").count()) === 1, await txt(page.locator(".v-openbar")));
  const l = await s.ledger(page);
  check("m4", "새 계정의 장부는 따로다(구매 0건, 보너스 10000)", l.opens.length === 0 && near(l.balance, 10000), { key: l.walletKey });
  const old = await page.evaluate(() => { const w = JSON.parse(localStorage.getItem("voila.browser-wallet.capture-account")).state; const i = JSON.parse(localStorage.getItem("voila.browser-inventory.capture-account")).state; return { bal: w.balance, opens: w.transactions.filter((t) => t.type === "open").length, items: i.items.length }; });
  check("m4", "앞 계정의 구매와 상품은 그 계정의 장부에 그대로 있다", old.opens === 1 && old.items === 1 && near(old.bal, 9999), old);
  await s.context.close();
});

await save();
