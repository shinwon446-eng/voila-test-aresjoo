// 09 에서 어긋난 것을 따로 본다: 로그인 시트의 키보드 진행, 그리고 더블탭 간격과 화면 폭에 따른 확인창 건너뛰기.
import { recorder, session, txt, sheetText, scrims, activeDesc, sleep, near, VIEWS } from "./lib.mjs";
const { check, run, save } = recorder("09b-debug");
const rect = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; });

await run("e1", async () => {
  const s = await session({ preset: "firstVisit", view: "desktop" });
  const page = await s.open("/ko/");
  await page.locator(".v-header .v-headbtn").first().click(); await page.waitForSelector(".v-sheet"); await sleep(400);
  await page.keyboard.press("Tab"); await page.keyboard.press("Tab");
  const f0 = await activeDesc(page);
  await page.keyboard.type("kb@example.invalid");
  const v = await page.locator(".v-sheet input").first().inputValue();
  await page.keyboard.press("Enter"); await sleep(500);
  const st = { f0, typed: v, sheet: (await sheetText(page)).slice(0, 120), active: await activeDesc(page), scrims: await scrims(page) };
  check("e1", "Tab 두 번으로 이메일 칸, 입력, Enter 뒤의 상태(본 것)", "info", st);
  check("e1", "이메일 칸에서 Enter: 비밀번호 단계로 간다", st.sheet.includes("kb@example.invalid") && st.sheet.includes("비밀번호"), st.sheet);
  check("e1", "비밀번호 단계가 뜨면 비밀번호 칸에 포커스가 있다(autoFocus)", st.active.startsWith("INPUT"), st.active);
  // 포커스가 칸에 없으면 Tab 으로 간다
  if (!st.active.startsWith("INPUT")) { await page.keyboard.press("Tab"); await page.keyboard.press("Tab"); }
  const f1 = await activeDesc(page);
  await page.keyboard.type("pw"); await page.keyboard.press("Enter");
  await page.waitForSelector("[data-balance-open]", { timeout: 15000 }).catch(() => {}); await sleep(300);
  check("e1", "비밀번호 칸에서 Enter: 로그인되고 시트가 닫힌다", (await scrims(page)) === 0 && (await page.locator("[data-balance-open]").count()) === 1, { f1, active: await activeDesc(page) });
  await page.locator("[data-balance-open]").focus(); await page.keyboard.press("Enter"); await page.waitForSelector(".v-sheet"); await sleep(300);
  check("e1", "잔액 단추에서 Enter: 잔액 시트", (await sheetText(page)).startsWith("잔액"));
  await page.keyboard.press("Escape"); await sleep(300);
  check("e1", "Esc: 닫히고 포커스가 잔액 단추로 돌아온다", (await page.evaluate(() => document.activeElement?.hasAttribute("data-balance-open"))) === true, await activeDesc(page));
  await page.goto(page.url() + "account/", { waitUntil: "networkidle" }); await page.waitForSelector("main .v-rows");
  await page.locator("main button.v-row", { hasText: "탈퇴" }).click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  await page.locator(".v-sheet .v-input").fill("pw"); await page.keyboard.press("Enter"); await sleep(300);
  check("e1", "탈퇴 시트의 비밀번호 칸에서 Enter 는 아무 일도 하지 않는다(폼이 아니다)", (await page.locator('[role="alertdialog"]').count()) === 0);
  await page.locator(".v-sheet .v-btn").click(); await page.waitForSelector('[role="alertdialog"]'); await sleep(250);
  const a3 = await activeDesc(page);
  check("e1", "확인창이 뜨면 포커스가 확인창으로(확정 단추가 아니라 창 자체)", a3.startsWith("DIV.v-sheet"), a3);
  await page.keyboard.press("Enter"); await sleep(400);
  check("e1", "확인창에서 Enter 만 눌러서는 확정되지 않는다(포커스가 단추에 없다)", (await page.locator('[role="alertdialog"]').count()) === 1);
  const dOrder = []; for (let i = 0; i < 3; i++) { await page.keyboard.press("Tab"); dOrder.push(await activeDesc(page)); }
  check("e1", "확인창의 Tab: 확정 단추, 취소, 다시 확정 단추", dOrder[0].includes("탈퇴하기") && dOrder[1].includes("취소") && dOrder[2].includes("탈퇴하기"), dOrder);
  await page.keyboard.press("Escape"); await sleep(300);
  check("e1", "Esc: 확인창만 닫히고 탈퇴 시트가 돌아온다", (await page.locator('[role="alertdialog"]').count()) === 0 && (await page.locator(".v-sheet").count()) === 1);
  await page.keyboard.press("Escape"); await sleep(300);
  check("e1", "Esc 한 번 더: 탈퇴 시트가 닫힌다", (await scrims(page)) === 0);
  await s.context.close();
});

// e2: 보관함 상세의 USDT로 받기를 같은 자리에서 두 번 누른다. 간격과 화면 폭을 바꿔 본다
await run("e2", async () => {
  for (const view of ["narrow", "mobile", "tablet", "desktop"]) {
    for (const gap of [90, 250, 600]) {
      const s = await session({ preset: "inventory", view, reduced: true });
      const page = await s.open("/ko/inventory/");
      await page.waitForSelector(".v-itemrow");
      await page.locator(".v-itemrow").first().click(); await page.waitForSelector(".v-sheet [data-take-primary]"); await sleep(500);
      const r = await rect(page.locator(".v-sheet [data-take-primary]"));
      const x = r.x + r.w / 2, y = r.y + r.h / 2;
      await page.mouse.click(x, y); await sleep(gap);
      const c = (await page.locator('[role="alertdialog"] .v-btn').count()) ? await rect(page.locator('[role="alertdialog"] .v-btn')) : null;
      const under = await page.evaluate(([px, py]) => { const e = document.elementFromPoint(px, py); return e ? (e.closest("button")?.innerText || e.className || e.tagName).toString().slice(0, 40) : null; }, [x, y]);
      await page.mouse.click(x, y); await sleep(1200);
      const l = await s.ledger(page);
      check("e2", `${view} ${VIEWS[view].join("x")}, 간격 ${gap}ms: 같은 자리를 두 번 눌렀을 때 확인 없이 받아지지 않는다`, l.sellbacks.length === 0, { taken: l.sellbacks.length, balance: l.balance, primary: r, confirmBtn: c, secondTapOn: under });
      await s.context.close();
    }
  }
});

// e3: 개봉 결과 화면의 USDT로 받기(모바일): 간격을 바꿔 본다. 결과가 뜬 직후의 0.35초 잠금은 확인창에는 없다
await run("e3", async () => {
  for (const gap of [90, 250, 600]) {
    const s = await session({ preset: "funded", view: "mobile", reduced: true, fixture: "dollar-apple:single:itemMid" });
    const page = await s.open("/ko/box/dollar-apple/");
    await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
    await page.locator("[data-open-primary]").click(); await page.waitForSelector(".v-op[data-opening-state='settled']"); await sleep(300);
    const r = await rect(page.locator("[data-take-primary]"));
    const x = r.x + r.w / 2, y = r.y + r.h / 2;
    await page.mouse.click(x, y); await sleep(gap);
    const c = (await page.locator('[role="alertdialog"] .v-btn').count()) ? await rect(page.locator('[role="alertdialog"] .v-btn')) : null;
    await page.mouse.click(x, y); await sleep(1200);
    const l = await s.ledger(page);
    check("e3", `결과 화면(모바일), 간격 ${gap}ms: 같은 자리를 두 번 눌렀을 때 확인 없이 받아지지 않는다(상품가 250, 받는 금액 237.5)`, l.sellbacks.length === 0, { taken: l.sellbacks.length, balance: l.balance, primary: r, confirmBtn: c });
    if (gap === 250) await s.shot(page, "09b-e3-double-tap-taken");
    await s.context.close();
  }
});

await save();
