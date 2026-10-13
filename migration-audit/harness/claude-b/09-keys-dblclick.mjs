// 키보드(포커스, Tab 순서, Esc, Enter)와 돈 단추의 더블클릭, 연타.
// 더블클릭은 같은 자리를 실제 마우스로 두 번(또는 세 번) 누른다. 첫 누름이 연 확인창의 확정 단추가 같은 자리에 오는지 본다.
import { recorder, session, txt, sheetText, scrims, activeDesc, sleep, near } from "./lib.mjs";
const { check, run, save } = recorder("09-keys-dblclick");
const settled = (page) => page.waitForSelector(".v-op[data-opening-state='settled']", { timeout: 20000 });
const rect = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; });
const overlap = (a, b) => !!a && !!b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
/** 같은 자리를 n 번 누른다(사람의 더블클릭처럼 gap ms 간격) */
const multiClick = async (page, loc, n, gap = 90) => { const r = await rect(loc); const x = r.x + r.w / 2, y = r.y + r.h / 2; for (let i = 0; i < n; i++) { await page.mouse.click(x, y); if (i < n - 1) await sleep(gap); } return r; };

// k1: 로그인 시트의 포커스와 키보드
await run("k1", async () => {
  const s = await session({ preset: "firstVisit", view: "desktop" });
  const page = await s.open("/ko/");
  await page.locator(".v-header .v-headbtn").first().click(); await page.waitForSelector(".v-sheet"); await sleep(400);
  const a0 = await activeDesc(page);
  check("k1", "로그인 시트가 열린 직후의 포커스: 이메일 칸(autoFocus)이 아니라 시트 자체다", a0.startsWith("DIV.v-sheet"), a0);
  const order = [];
  for (let i = 0; i < 8; i++) { await page.keyboard.press("Tab"); order.push(await activeDesc(page)); }
  check("k1", "Tab 순서: 닫기, 이메일 칸, 이메일로 계속, 소셜 셋, 가입 링크, 다시 닫기", order[0].includes("닫기") && order[1].startsWith("INPUT") && order[2].includes("이메일로 계속") && order[6].includes("이메일로 가입") && order[7].includes("닫기"), order);
  await page.keyboard.press("Tab"); await page.keyboard.type("kb@example.invalid"); await page.keyboard.press("Enter"); await sleep(400);
  const a1 = await activeDesc(page);
  check("k1", "이메일 칸에서 Enter: 비밀번호 단계로 가고 비밀번호 칸에 포커스가 간다", (await sheetText(page)).includes("kb@example.invalid") && a1.startsWith("INPUT"), a1);
  await page.keyboard.type("pw"); await page.keyboard.press("Enter");
  await page.waitForSelector("[data-balance-open]", { timeout: 15000 }); await sleep(300);
  check("k1", "비밀번호 칸에서 Enter: 로그인되고 시트가 닫힌다", (await scrims(page)) === 0);
  const a2 = await activeDesc(page);
  check("k1", "닫힌 뒤 포커스가 가는 곳(연 단추는 사라졌다)", "info", a2);
  // 잔액 시트: Enter 로 열고 Esc 로 닫는다
  await page.locator("[data-balance-open]").focus(); await page.keyboard.press("Enter"); await page.waitForSelector(".v-sheet"); await sleep(300);
  check("k1", "잔액 단추에서 Enter: 잔액 시트", (await sheetText(page)).startsWith("잔액"));
  await page.keyboard.press("Escape"); await sleep(300);
  check("k1", "Esc: 닫히고 포커스가 잔액 단추로 돌아온다", (await page.evaluate(() => document.activeElement?.hasAttribute("data-balance-open"))) === true, await activeDesc(page));
  // 겹친 창: 계정 → 탈퇴 → 확인창. Esc 한 번에 하나씩
  await page.goto(page.url() + "account/", { waitUntil: "networkidle" }); await page.waitForSelector("main .v-rows");
  await page.locator("main button.v-row", { hasText: "탈퇴" }).click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  await page.locator(".v-sheet .v-input").fill("pw"); await page.keyboard.press("Enter"); await sleep(300);
  check("k1", "탈퇴 시트의 비밀번호 칸에서 Enter 는 아무 일도 하지 않는다(폼이 아니다)", (await page.locator('[role="alertdialog"]').count()) === 0);
  await page.locator(".v-sheet .v-btn").click(); await page.waitForSelector('[role="alertdialog"]'); await sleep(250);
  const a3 = await activeDesc(page);
  check("k1", "확인창이 뜨면 포커스가 확인창으로(확정 단추가 아니라 창 자체)", a3.startsWith("DIV.v-sheet"), a3);
  await page.keyboard.press("Enter"); await sleep(400);
  check("k1", "확인창에서 Enter 만 눌러서는 확정되지 않는다(포커스가 단추에 없다)", (await page.locator('[role="alertdialog"]').count()) === 1);
  const dOrder = []; for (let i = 0; i < 3; i++) { await page.keyboard.press("Tab"); dOrder.push(await activeDesc(page)); }
  check("k1", "확인창의 Tab: 확정 단추, 취소, 다시 확정 단추", dOrder[0].includes("탈퇴하기") && dOrder[1].includes("취소") && dOrder[2].includes("탈퇴하기"), dOrder);
  await page.keyboard.press("Escape"); await sleep(300);
  check("k1", "Esc: 확인창만 닫히고 탈퇴 시트가 돌아온다", (await page.locator('[role="alertdialog"]').count()) === 0 && (await page.locator(".v-sheet").count()) === 1);
  await page.keyboard.press("Escape"); await sleep(300);
  check("k1", "Esc 한 번 더: 탈퇴 시트가 닫힌다", (await scrims(page)) === 0);
  check("k1", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// k2: 박스 화면과 개봉 화면의 키보드
await run("k2", async () => {
  const s = await session({ preset: "funded", view: "desktop", reduced: true, fixture: "dollar-apple:single:itemLow" });
  const page = await s.open("/ko/box/dollar-apple/");
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  await page.locator(".v-openbar .v-chip").nth(1).focus(); await page.keyboard.press("Space"); await sleep(150);
  check("k2", "수량 알약에서 Space: 선택된다", (await page.locator(".v-openbar .v-chip").nth(1).getAttribute("aria-pressed")) === "true");
  await page.locator(".v-openbar .v-chip").nth(0).focus(); await page.keyboard.press("Enter"); await sleep(150);
  await page.locator("[data-open-primary]").focus(); await page.keyboard.press("Enter");
  await settled(page);
  const l = await s.ledger(page);
  check("k2", "열기 단추에서 Enter: 구매 1건", l.opens.length === 1);
  const a0 = await activeDesc(page);
  check("k2", "결과가 뜨면 포커스는 결과 화면(창 자체)", a0.startsWith("DIV.v-op"), a0);
  const order = []; for (let i = 0; i < 6; i++) { await page.keyboard.press("Tab"); order.push(await activeDesc(page)); }
  check("k2", "결과 화면의 Tab 순서(설정, 닫기, 주 단추, 링크 둘, 다시 설정)", order[0].includes("개봉 설정") && order[1].includes("닫기") && order[2].includes("USDT로 받기") && order[5].includes("개봉 설정"), order);
  // 주 단추에서 Enter → 확인창 → Tab → Enter
  await page.locator("[data-take-primary]").focus(); await page.keyboard.press("Enter"); await page.waitForSelector('[role="alertdialog"]'); await sleep(300);
  await page.keyboard.press("Enter"); await sleep(400);
  const l1 = await s.ledger(page);
  check("k2", "받기 확인창에서 Enter 를 한 번 더 눌러도 받지 않는다(포커스가 창에 있다)", l1.sellbacks.length === 0 && (await page.locator('[role="alertdialog"]').count()) === 1);
  await page.keyboard.press("Tab"); await page.keyboard.press("Enter");
  await page.waitForSelector("[data-taken-title]", { timeout: 10000 });
  const l2 = await s.ledger(page);
  check("k2", "Tab 으로 확정 단추에 간 뒤 Enter: 받는다(한 번)", l2.sellbacks.length === 1 && near(l2.balance, 10018), l2.balance);
  await page.keyboard.press("Escape"); await sleep(300);
  check("k2", "Esc: 결과 화면이 닫힌다", (await page.locator(".v-op").count()) === 0);
  await s.context.close();
});

// k3: 돈 단추의 더블클릭과 세 번 누르기(모바일과 PC)
await run("k3", async () => {
  for (const view of ["mobile", "desktop"]) {
    // (1) 박스: 10개 열기 단추 더블클릭 → 확인창이 같은 자리에 뜨는가
    let s = await session({ preset: "funded", view, reduced: true, fixture: "dollar-apple:seq:tenSmall" });
    let page = await s.open("/ko/box/dollar-apple/");
    await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
    await page.locator(".v-openbar .v-chip").nth(2).click(); await sleep(150);
    await page.locator("[data-open-primary]").scrollIntoViewIfNeeded();
    const r1 = await multiClick(page, page.locator("[data-open-primary]"), 2);
    await sleep(1500);
    let l = await s.ledger(page);
    const dlg = await page.locator('[role="alertdialog"] .v-btn').count() ? await rect(page.locator('[role="alertdialog"] .v-btn')) : null;
    check("k3", `${view} (1) 10개 열기 단추 더블클릭: 확인창을 건너뛰고 결제되는가`, l.opens.length === 0, { opens: l.opens.length, balance: l.balance, primary: r1, confirmBtn: dlg, dialogOpen: await page.locator('[role="alertdialog"]').count(), reveal: await page.locator(".v-reveal").count() });
    await s.shot(page, `09-k3-${view}-open10-dbl`);
    await s.context.close();

    // (2) 개봉 결과의 USDT로 받기 더블클릭
    s = await session({ preset: "funded", view, reduced: true, fixture: "dollar-apple:single:itemLow" });
    page = await s.open("/ko/box/dollar-apple/");
    await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
    await page.locator("[data-open-primary]").click(); await settled(page); await sleep(200);
    const r2 = await multiClick(page, page.locator("[data-take-primary]"), 2);
    await sleep(1500);
    l = await s.ledger(page);
    const d2 = await page.locator('[role="alertdialog"] .v-btn').count() ? await rect(page.locator('[role="alertdialog"] .v-btn')) : null;
    check("k3", `${view} (2) 결과 화면의 USDT로 받기 더블클릭: 확인 없이 받아지는가`, l.sellbacks.length === 0, { sellbacks: l.sellbacks.length, balance: l.balance, primary: r2, confirmBtn: d2, overlap: overlap(r2, d2) });
    await s.shot(page, `09-k3-${view}-result-take-dbl`);
    await s.context.close();

    // (3) 보관함 상세의 USDT로 받기 더블클릭
    s = await session({ preset: "inventory", view, reduced: true });
    page = await s.open("/ko/inventory/");
    await page.waitForSelector(".v-itemrow");
    await page.locator(".v-itemrow").first().click(); await page.waitForSelector(".v-sheet [data-take-primary]"); await sleep(400);
    const r3 = await multiClick(page, page.locator(".v-sheet [data-take-primary]"), 2);
    await sleep(1500);
    l = await s.ledger(page);
    const d3 = await page.locator('[role="alertdialog"] .v-btn').count() ? await rect(page.locator('[role="alertdialog"] .v-btn')) : null;
    check("k3", `${view} (3) 보관함 상세의 USDT로 받기 더블클릭: 확인 없이 받아지는가`, l.sellbacks.length === 0, { sellbacks: l.sellbacks.length, balance: l.balance, primary: r3, confirmBtn: d3, overlap: overlap(r3, d3) });
    await s.shot(page, `09-k3-${view}-inventory-take-dbl`);
    await s.context.close();

    // (4) 선택 시트의 주 단추 더블클릭
    s = await session({ preset: "inventory", view, reduced: true });
    page = await s.open("/ko/inventory/");
    await page.waitForSelector(".v-itemrow");
    await page.locator("[data-take-batch]").click(); await page.waitForSelector(".v-sheet [data-take-row]"); await sleep(400);
    await page.locator("[data-take-all]").click(); await sleep(150);
    const r4 = await multiClick(page, page.locator("[data-take-submit]"), 2);
    await sleep(1500);
    l = await s.ledger(page);
    const d4 = await page.locator('[role="alertdialog"] .v-btn').count() ? await rect(page.locator('[role="alertdialog"] .v-btn')) : null;
    check("k3", `${view} (4) 선택 시트의 USDT로 받기(2개) 더블클릭: 확인 없이 받아지는가`, l.sellbacks.length === 0, { sellbacks: l.sellbacks.length, balance: l.balance, primary: r4, confirmBtn: d4, overlap: overlap(r4, d4) });
    await s.shot(page, `09-k3-${view}-sheet-take-dbl`);
    await s.context.close();

    // (5) 후기 올리기 더블클릭과 세 번 누르기 → 뒤에서 돌아온 상품 상세의 USDT로 받기와 그 확인창
    for (const n of [2, 3]) {
      s = await session({ preset: "inventory", view, reduced: true });
      page = await s.open("/ko/inventory/");
      await page.waitForSelector(".v-itemrow");
      await page.locator(".v-itemrow", { hasText: "$950" }).click(); await page.waitForSelector(".v-sheet .v-rowlink"); await sleep(400);
      await page.locator(".v-sheet .v-rowlink").click(); await page.waitForSelector(".v-sheet textarea"); await sleep(400);
      await page.locator(".v-sheet textarea").fill("더블클릭을 보는 시험 후기입니다.");
      const r5 = await multiClick(page, page.locator(".v-sheet .v-btn"), n);
      await sleep(1500);
      l = await s.ledger(page);
      const reviews = await page.evaluate(() => JSON.parse(localStorage.getItem("gachaflix.community") || "null")?.state?.mine?.length ?? 0);
      check("k3", `${view} (5) 후기 올리기를 ${n}번 누름: 후기 하나, 그리고 상품이 USDT로 받아지지 않는다`, reviews === 1 && l.sellbacks.length === 0, { reviews, sellbacks: l.sellbacks.length, balance: l.balance, sendBtn: r5, dialogOpen: await page.locator('[role="alertdialog"]').count(), sheet: (await sheetText(page)).slice(0, 120) });
      await s.shot(page, `09-k3-${view}-review-click${n}`);
      await s.context.close();
    }

    // (6) 여럿 결과의 USDT로 받기(선택 시트를 여는 단추) 더블클릭과 세 번 누르기
    for (const n of [2, 3]) {
      s = await session({ preset: "funded", view, reduced: true, fixture: "dollar-apple:seq:withItem" });
      page = await s.open("/ko/box/dollar-apple/");
      await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
      await page.locator(".v-openbar .v-chip").nth(1).click();
      await page.locator("[data-open-primary]").click(); await page.waitForSelector(".v-reveal-result"); await sleep(800);
      const r6 = await multiClick(page, page.locator("[data-take-batch]"), n);
      await sleep(1500);
      l = await s.ledger(page);
      check("k3", `${view} (6) 여럿 결과의 USDT로 받기를 ${n}번 누름: 확인 없이 받아지지 않는다`, l.sellbacks.length === 1, { sellbacks: l.sellbacks.length, balance: l.balance, primary: r6, sheet: (await sheetText(page)).slice(0, 100), dialogOpen: await page.locator('[role="alertdialog"]').count() });
      await s.context.close();
    }
  }
});

await save();
