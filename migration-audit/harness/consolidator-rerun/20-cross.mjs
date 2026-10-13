// 통합 담당의 교차 확인. 한 참여자만 적었거나 참여자끼리 어긋난 주장을 배포 사이트에서 직접 본다.
//   실행(web 폴더에서): node ../migration-audit/harness/consolidator-rerun/20-cross.mjs
// 출금 신청, 배송 신청은 보내지 않는다. 계정을 만들지 않고 비밀번호를 넣지 않는다(프리셋으로 심은 시험 장부만 쓴다).
import { recorder, session, txt, sheetText, sleep, near, fixtures } from "./lib.mjs";
const { check, run, save } = recorder("20-cross");

// c1: 꼬리말의 언어 링크가 주소의 query 를 버리는가 (CX-I-003, CX-S-039)
await run("c1", async () => {
  const s = await session({ preset: "guest", view: "desktop" });
  const page = await s.open("/ko/reviews/?box=dollar-apple");
  await sleep(400);
  const hrefs = await page.locator(".v-footer a[hreflang]").evaluateAll((els) => els.map((e) => e.getAttribute("hreflang") + " " + e.getAttribute("href")));
  check("c1", "후기 모아보기(?box=dollar-apple)의 언어 링크 주소(본 것)", "info", hrefs);
  check("c1", "언어 링크의 주소에 query 가 없다", hrefs.length === 2 && hrefs.every((h) => !h.includes("?")), hrefs);
  const picked = await page.locator(".v-chips .v-chip[aria-pressed='true']").first().innerText().catch(() => "");
  await page.locator(".v-footer a[hreflang='en']").click(); await page.waitForURL(/\/en\/reviews\//); await sleep(500);
  const after = { url: page.url(), picked: await page.locator(".v-chips .v-chip[aria-pressed='true']").first().innerText().catch(() => "") };
  check("c1", "영어로 바꾸면 고른 박스가 풀린다(주소에 box 가 없고 전체가 골라진다)", !after.url.includes("box=") && after.picked !== "" && picked !== "", { before: picked, ...after });
  const page2 = await s.open("/ko/verify/?s=abc&c=def&n=7&box=dollar-apple");
  await sleep(400);
  const h2 = await page2.locator(".v-footer a[hreflang]").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  check("c1", "검증 화면(?s=..)의 언어 링크 주소에도 query 가 없다", h2.every((h) => !h.includes("?")), h2);
  await s.context.close();
});

// c2: 검증 화면의 직접 계산. 회차 칸을 비워 두면 실패하는가, 0 으로 계산하는가 (CX-S-038, CL-S-091)
await run("c2", async () => {
  const s = await session({ preset: "guest", view: "desktop" });
  const page = await s.open("/ko/verify/");
  await page.waitForSelector("#verify-manual"); await sleep(300);
  const inputs = page.locator("section[aria-labelledby='verify-manual'] .v-input");
  const compute = page.locator("section[aria-labelledby='verify-manual'] .v-btn");
  await inputs.nth(0).fill(fixtures.serverSeed); await inputs.nth(2).fill("consolidator-client");
  await compute.click(); await sleep(700);
  const sec = () => txt(page.locator("section[aria-labelledby='verify-manual']"));
  const t0 = await sec();
  const fail0 = await page.locator("section[aria-labelledby='verify-manual'] .v-line--fail").count();
  const rows0 = await page.locator("section[aria-labelledby='verify-manual'] .v-row").allInnerTexts();
  check("c2", "회차 칸이 빈 채로 계산하기: 실패 한 줄이 뜨지 않고 결과 행이 나온다(0 회차로 계산)", fail0 === 0 && rows0.length >= 2, { fail: fail0, rows: rows0.map((x) => x.replace(/s+/g, " ")) });
  await inputs.nth(3).fill("0"); await compute.click(); await sleep(700);
  const t1 = await sec();
  check("c2", "회차 0 을 넣어 계산한 결과가 빈칸일 때의 결과와 같다", t1 === t0, { a: t0.slice(-160), b: t1.slice(-160) });
  await inputs.nth(3).fill("1.5"); await compute.click(); await sleep(500);
  check("c2", "회차 1.5: 실패 한 줄", (await page.locator("section[aria-labelledby='verify-manual'] .v-line--fail").count()) === 1);
  await inputs.nth(3).fill("-1"); await compute.click(); await sleep(500);
  check("c2", "회차 -1: 실패 한 줄", (await page.locator("section[aria-labelledby='verify-manual'] .v-line--fail").count()) === 1);
  await s.context.close();
});

// c3: 후기 시트를 닫았다가 다른 상품에서 열면 앞의 초안이 남는가 (CX-P2-01, CX-S-035)
await run("c3", async () => {
  const s = await session({ preset: "inventory", view: "desktop" });
  const page = await s.open("/ko/inventory/");
  await page.waitForSelector(".v-itemrow");
  await page.locator(".v-itemrow", { hasText: "$950" }).click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  await page.locator(".v-sheet .v-rowlink").click(); await sleep(400);
  await page.locator(".v-sheet .v-chip").nth(1).click();
  await page.locator(".v-sheet textarea").fill("첫 상품에 쓰다 만 초안입니다");
  await page.keyboard.press("Escape"); await sleep(350); // 후기 시트만 닫힌다(상품 상세로)
  await page.keyboard.press("Escape"); await sleep(350); // 상품 상세도 닫는다
  const rows = await page.locator(".v-itemrow").allInnerTexts();
  const other = page.locator(".v-itemrow").filter({ hasNotText: "$950" }).first();
  await other.click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  const title = await txt(page.locator(".v-sheet .v-title"));
  const hasWrite = await page.locator(".v-sheet .v-rowlink").count();
  if (!hasWrite) { check("c3", "둘째 상품에 후기 쓰기 행이 없다(본 것)", "info", { title, rows }); await s.context.close(); return; }
  await page.locator(".v-sheet .v-rowlink").click(); await sleep(400);
  const draft = await page.locator(".v-sheet textarea").inputValue();
  const star = await page.locator(".v-sheet .v-chip[aria-pressed='true']").innerText();
  check("c3", "다른 상품의 후기 시트에 앞 상품의 초안과 별점이 남아 있다", draft === "첫 상품에 쓰다 만 초안입니다" && star === "2점", { item: title, draft, star });
  await s.shot(page, "20-c3-review-draft-carried");
  await s.context.close();
});

// c4: 저장 공간이 가득 찬 채로 후기를 올리면 실패 한 줄이 뜨는가, 올린 것처럼 닫히는가 (CL-S-086 대 CX-S-035)
await run("c4", async () => {
  const s = await session({ preset: "inventory", view: "desktop", quota: true });
  const page = await s.open("/ko/inventory/");
  await page.waitForSelector(".v-itemrow");
  await page.locator(".v-itemrow", { hasText: "$950" }).click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  await page.locator(".v-sheet .v-rowlink").click(); await sleep(400);
  await page.locator(".v-sheet textarea").fill("저장 공간이 찬 채로 올리는 시험 후기입니다.");
  await page.evaluate(() => { window.__quotaFull = true; });
  await page.locator(".v-sheet .v-btn").click(); await sleep(600);
  const t = await sheetText(page);
  const stored = await page.evaluate(() => { try { return (JSON.parse(localStorage.getItem("gachaflix.community") || "null")?.state?.mine ?? []).length; } catch { return -1; } });
  const failLine = await page.locator(".v-sheet .v-line--fail").count();
  check("c4", "가득 찬 채로 올리기: 화면에 보이는 것(본 것)", "info", { sheet: t.slice(0, 200), failLine, stored });
  check("c4", "저장하지 못했다는 한 줄이 뜨지 않고 올린 것처럼 상품 상세로 돌아온다", failLine === 0 && t.includes("후기를 올렸습니다"), t.slice(0, 200));
  check("c4", "저장소에는 후기가 없다", stored === 0, stored);
  await page.evaluate(() => { window.__quotaFull = false; });
  await page.reload({ waitUntil: "networkidle" }); await page.waitForSelector(".v-itemrow");
  await page.locator(".v-itemrow", { hasText: "$950" }).click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  const t2 = await sheetText(page);
  check("c4", "새로 고치면 그 후기는 없다(행이 다시 후기 쓰기다)", !t2.includes("후기를 올렸습니다") && (await page.locator(".v-sheet .v-rowlink").count()) === 1, t2.slice(0, 200));
  await s.context.close();
});

// c5: 작은 쓰기는 되고 장부 쓰기만 버려질 때의 열기 (CX-P1-02, CX-F-009 대 CL-S-034)
await run("c5", async () => {
  const s = await session({ preset: "funded", reduced: true, fixture: "dollar-apple:single:low" });
  await s.context.addInitScript(() => {
    const proto = Storage.prototype; if (proto.__partialPatched) return; proto.__partialPatched = 1;
    const orig = proto.setItem;
    proto.setItem = function (k, v) { if (window.__ledgerFull && this === window.localStorage && /browser-(wallet|inventory)\./.test(String(k))) throw new DOMException("quota", "QuotaExceededError"); return orig.call(this, k, v); };
  });
  const page = await s.open("/ko/box/dollar-apple/");
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])", { timeout: 20000 });
  const before = await s.ledger(page);
  await page.evaluate(() => { window.__ledgerFull = true; });
  await page.locator("[data-open-primary]").click();
  const opened = await page.waitForSelector(".v-op[data-opening-state='settled']", { timeout: 8000 }).then(() => true).catch(() => false);
  const mid = await s.ledger(page);
  const failLine = await txt(page.locator(".v-openbar .v-line--fail"));
  const opBalance = opened ? await txt(page.locator(".v-op .v-op-balance")) : "";
  check("c5", "장부 쓰기만 버려지는 상태에서 열기: 본 것", "info", { opened, failLine, opBalance, storedBefore: { balance: before.balance, opens: before.opens.length, items: before.items.length, nonce: before.nonce }, storedAfter: { balance: mid.balance, opens: mid.opens.length, items: mid.items.length, nonce: mid.nonce, seen: mid.seen.length } });
  check("c5", "결과 화면이 뜬다(구매가 성공한 것으로 보인다)", opened === true && failLine === "");
  check("c5", "저장된 장부에는 구매가 없다(잔액과 거래와 기록이 그대로)", near(mid.balance, before.balance) && mid.opens.length === before.opens.length && mid.items.length === before.items.length, { balance: mid.balance, opens: mid.opens.length, items: mid.items.length });
  check("c5", "회차는 저장소에서 늘었다(추첨 값의 저장 키는 막지 않았다)", mid.nonce === before.nonce + 1, { before: before.nonce, after: mid.nonce });
  await s.shot(page, "20-c5-open-shown-not-stored");
  await page.evaluate(() => { window.__ledgerFull = false; });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])", { timeout: 20000 });
  const after = await s.ledger(page);
  const bar = await txt(page.locator(".v-openbar"));
  const head = await txt(page.locator(".v-headbtn[data-balance-open]"));
  check("c5", "새로 고친 뒤: 화면의 잔액이 열기 전 값으로 돌아가고, 못 본 결과 안내도 없다", near(after.balance, before.balance) && after.items.length === before.items.length && !bar.includes("결과 보기"), { head, bar: bar.slice(0, 160), balance: after.balance, items: after.items.length });
  await s.context.close();
});

// c6: 출금 화면에 금액을 넣은 뒤 통화를 바꾸면 같은 숫자가 새 단위로 읽히는가 (CX-P2-05, CX-S-040). 출금 확인은 누르지 않는다
await run("c6", async () => {
  const s = await session({ preset: "security", view: "desktop" });
  const page = await s.open("/ko/wallet/withdraw/");
  await page.waitForSelector("main form .v-input", { timeout: 20000 }); await sleep(400);
  const amt = page.locator("main form .v-input").nth(1);
  await amt.fill("100"); await sleep(200);
  const rows = () => page.locator("main form .v-row").allInnerTexts().then((a) => a.map((x) => x.replace(/\s+/g, " ")));
  const usd = { value: await amt.inputValue(), rows: await rows(), label: await txt(page.locator("main form .v-field-label").nth(1)) };
  await page.locator(".v-footer button", { hasText: "원화로 보기" }).click(); await sleep(400);
  const krw = { value: await amt.inputValue(), rows: await rows(), label: await txt(page.locator("main form .v-field-label").nth(1)) };
  check("c6", "달러에서 100 을 넣은 뒤 원화로 바꾼 앞뒤(본 것)", "info", { usd, krw });
  check("c6", "금액 칸의 숫자는 100 그대로이고 단위만 KRW 로 바뀐다", krw.value === "100" && usd.label !== krw.label, { usd: usd.label, krw: krw.label });
  check("c6", "요약 행이 달라진다(같은 숫자를 원화로 다시 읽는다)", JSON.stringify(usd.rows) !== JSON.stringify(krw.rows), { usd: usd.rows, krw: krw.rows });
  const l = await s.ledger(page);
  check("c6", "장부는 그대로다(출금 0건, 이 프리셋에 심어 둔 것 말고는 없다)", l.withdraws.length === 0, l.withdraws);
  await s.context.close();
});

// c7: 자동으로 USDT로 받기가 시작되는 때. 결과가 드러난 순간인가, 단추가 풀린 뒤인가 (AG-TL-007 대 CL-I-108, CX-S-022)
await run("c7", async () => {
  const pre = await session({ preset: "funded" });
  const uid = pre.state.user?.id ?? Object.keys(pre.state.values).map((k) => (k.match(/^voila\.browser-wallet\.(.+)$/) || [])[1]).find((x) => x && x !== "guest");
  await pre.context.close();
  const s = await session({ preset: "funded", reduced: false, fixture: "dollar-apple:single:itemLow", settings: { autoTakeBy: { [uid]: true } } });
  const page = await s.open("/ko/box/dollar-apple/");
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])", { timeout: 20000 });
  await page.evaluate(() => {
    window.__t = { t0: 0, reveal: null, ready: null, sold: null, title: null };
    const sess = localStorage.getItem("voila.browser-session.v1");
    const tick = () => {
      const op = document.querySelector(".v-op"); const now = performance.now();
      if (op) {
        const ph = op.getAttribute("data-phase");
        if (ph === "reveal" && window.__t.reveal === null) window.__t.reveal = now;
        if (ph === "ready" && window.__t.ready === null) window.__t.ready = now;
        if (window.__t.title === null && document.querySelector("[data-taken-title]")) window.__t.title = now;
      }
      if (window.__t.sold === null) { try { const w = JSON.parse(localStorage.getItem("voila.browser-wallet." + sess) || "null")?.state; if ((w?.transactions ?? []).some((x) => x.type === "sellback" && Array.isArray(x.itemIds))) window.__t.sold = now; } catch {} }
      if (window.__t.ready === null || window.__t.sold === null) requestAnimationFrame(tick);
    };
    document.querySelector("[data-open-primary]").addEventListener("click", () => { window.__t.t0 = performance.now(); requestAnimationFrame(tick); }, { once: true });
  });
  await page.locator("[data-open-primary]").click();
  await page.waitForSelector(".v-op[data-opening-state='settled']", { timeout: 20000 }); await sleep(900);
  const t = await page.evaluate(() => { const x = window.__t; const r = (v) => (v === null ? null : Math.round(v - x.t0)); return { reveal: r(x.reveal), ready: r(x.ready), sold: r(x.sold), title: r(x.title) }; });
  const l = await s.ledger(page);
  check("c7", "자동 받기: 누른 뒤의 시각(ms). reveal 결과가 드러남, ready 단추가 풀림, sold 받기 거래가 저장됨(본 것)", "info", { uid: uid ? "있음" : "없음", ...t, sellbacks: l.sellbacks.length });
  check("c7", "자동 받기가 실행됐다(받기 거래 1건)", l.sellbacks.length === 1 && l.sold === 1, l.sellbacks);
  check("c7", "받기 거래는 단추가 풀리기(ready) 전에 저장됐다", t.sold !== null && t.ready !== null && t.sold < t.ready, t);
  await s.context.close();
});

await save();
