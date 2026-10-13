// 개봉: 하나, 여럿(5, 10, 50, 100), 무료, 잔액 부족, 비로그인, 연출 단계와 장부가 적히는 순간,
// 연출 중 재클릭, 연타, 떠남, 뒤로, 새로 고침, 탭 전환, 움직임 줄이기, 저장 실패.
// 결과는 web/scripts/capture/opening-fixtures.json 의 시드로 정한다(계산식은 그대로). 50개와 100개는 고정값이 없어 실제 추첨으로 열고 불변식만 본다.
import { recorder, session, txt, near, sheetText, scrims, sleep } from "./lib.mjs";
const { check, run, save } = recorder("04-open");

const boxPage = async (s, slug, locale = "ko") => { const page = await s.open(`/${locale}/box/${slug}/`); await page.waitForSelector(".v-openbar .v-btn:not([disabled])", { timeout: 20000 }); return page; };
const settled = (page) => page.waitForSelector(".v-op[data-opening-state='settled']", { timeout: 20000 });
const armLog = (page) => page.evaluate(() => {
  window.__log = [];
  const snap = () => {
    const sess = localStorage.getItem("voila.browser-session.v1");
    const rd = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null")?.state ?? null; } catch { return null; } };
    const w = rd("voila.browser-wallet." + sess), inv = rd("voila.browser-inventory." + sess), j = rd("voila.opening-journal");
    return { bal: w?.balance, opens: (w?.transactions || []).filter((t) => t.type === "open").length, items: (inv?.items || []).length, seen: Object.keys(j?.seen || {}).length, top: document.querySelector(".v-op-balance")?.innerText ?? null };
  };
  const mark = () => { const op = document.querySelector(".v-op"); const rv = document.querySelector(".v-reveal"); const key = op ? op.dataset.phase + "/" + op.dataset.openingState : rv ? "reveal:" + (rv.querySelector(".v-reveal-solo") ? rv.querySelector(".v-op-scene")?.dataset.phase : "done") : "none"; if (window.__last !== key) { window.__last = key; window.__log.push({ t: Math.round(performance.now()), key, ...snap() }); } };
  new MutationObserver(mark).observe(document.body, { subtree: true, childList: true, attributes: true });
  document.addEventListener("click", (e) => { if (e.target.closest?.("[data-open-primary],[data-open-again]")) window.__log.push({ t: Math.round(performance.now()), key: "click", ...snap() }); }, true);
});
const log = (page) => page.evaluate(() => window.__log);
const opText = (page) => page.evaluate(() => (document.querySelector(".v-op, .v-reveal")?.innerText || "").replace(/\s+/g, " "));

// o1: 하나 열기(USDT 결과). 단계, 시간, 장부가 적히는 순간
await run("o1", async () => {
  const s = await session({ preset: "funded", reduced: false, fixture: "dollar-apple:single:low" });
  const page = await boxPage(s, "dollar-apple");
  const before = await s.ledger(page);
  await armLog(page);
  await page.locator("[data-open-primary]").click();
  await settled(page);
  const l = await log(page);
  check("o1", "단계 기록(누름, 연출, 드러남, 준비)", "info", l);
  const byKey = Object.fromEntries(l.map((e) => [e.key, e]));
  const click = byKey["click"], ant = byKey["anticipation/opening"], imp = byKey["impact/opening"], exit = byKey["exit/opening"], rev = byKey["reveal/revealed"], rdy = byKey["ready/settled"];
  check("o1", "누르는 순간에는 장부가 그대로다(구매 0건)", click && click.opens === 0 && click.items === 0, click);
  check("o1", "연출이 시작될 때 이미 구매가 장부에 적혀 있다(구매 1건, 보관함 기록 1건, 봤음 0)", ant && ant.opens === 1 && ant.items === 1 && ant.seen === 0, ant);
  check("o1", "결과가 드러난 뒤에 봤음이 적힌다", rdy && rdy.seen === 1, { rev, rdy });
  check("o1", "단계 순서 anticipation → impact → exit → reveal → ready", !!(ant && imp && exit && rev && rdy) && ant.t <= imp.t && imp.t <= exit.t && exit.t <= rev.t && rev.t <= rdy.t);
  if (ant && imp && exit && rev && rdy) check("o1", "단계 길이(ms): 기대 520, 150, 170, 350", "info", { anticipation: imp.t - ant.t, impact: exit.t - imp.t, exit: rev.t - exit.t, arm: rdy.t - rev.t, pressToAnticipation: ant.t - click.t });
  check("o1", "연출 중 위의 잔액은 열기 전 잔액, 드러난 뒤에는 최종 잔액", ant?.top?.includes("10,000") && rdy?.top?.includes("9,999.05"), { ant: ant?.top, rdy: rdy?.top });
  const after = await s.ledger(page);
  check("o1", "잔액 10000 - 1 + 0.05 = 9999.05", near(after.balance, 9999.05), after.balance);
  check("o1", "구매 거래 1건(금액 -1, ref 에 박스와 거래 번호)", after.opens.length === 1 && after.opens[0].amount === -1 && /^dollar-applex1:op_/.test(after.opens[0].ref), after.opens);
  check("o1", "USDT 결과는 그 자리에서 잔액에(sellback 1건, 보관함 기록은 SOLD)", after.sellbacks.length === 1 && near(after.sellbacks[0].amount, 0.05) && after.items.length === 1 && after.items[0].status === "SOLD", { sb: after.sellbacks, items: after.items });
  check("o1", "회차가 1 늘었다", after.nonce === before.nonce + 1, { before: before.nonce, after: after.nonce });
  check("o1", "결과 화면 글", "info", (await opText(page)).slice(0, 300));
  await s.shot(page, "04-o1-result-cash");
  const btns = await page.locator(".v-op-actions .v-btn, .v-op-actions .v-link").allInnerTexts();
  check("o1", "USDT 결과의 행동: 한 번 더 언박싱, 개봉 결과 검증, 박스로 돌아가기", btns.length === 3 && btns[0].includes("한 번 더 언박싱"), btns);
  await page.keyboard.press("Escape"); await page.waitForSelector(".v-op", { state: "detached", timeout: 5000 });
  check("o1", "준비된 뒤 Esc 는 닫는다, 박스 화면의 열기 단추가 다시 살아 있다", (await page.locator("[data-open-primary]").isEnabled()) && (await scrims(page)) === 0);
  check("o1", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// o2: 연타, 연출 중 재클릭, 드러난 직후 누르기, 건너뛰기
await run("o2", async () => {
  const s = await session({ preset: "funded", reduced: false, fixture: "dollar-apple:single:low2" });
  const page = await boxPage(s, "dollar-apple");
  await page.evaluate(() => { const b = document.querySelector("[data-open-primary]"); for (let i = 0; i < 5; i++) b.click(); });
  await page.waitForSelector(".v-op", { timeout: 10000 });
  let l = await s.ledger(page);
  check("o2", "같은 순간에 다섯 번 눌러도 구매는 1건", l.opens.length === 1, l.opens);
  // 연출 중: 밑에 깔린 열기 단추를 프로그램으로 누른다, 그리고 화면의 같은 자리를 실제로 누른다
  const phase0 = await page.locator(".v-op").getAttribute("data-phase");
  await page.evaluate(() => document.querySelector("[data-open-primary]")?.click());
  const boxBtn = await page.locator("[data-open-primary]").boundingBox();
  if (boxBtn) await page.mouse.click(boxBtn.x + boxBtn.width / 2, boxBtn.y + boxBtn.height / 2);
  await settled(page);
  l = await s.ledger(page);
  check("o2", `연출 중(${phase0}) 재클릭은 구매를 만들지 않는다`, l.opens.length === 1, l.opens);
  await page.locator(".v-op-tool").last().click(); await page.waitForSelector(".v-op", { state: "detached" });
  // 다시 열고 Esc 로 건너뛴다
  await armLog(page);
  await page.locator("[data-open-primary]").click();
  await page.waitForSelector(".v-op[data-phase='anticipation']", { timeout: 10000 });
  await page.keyboard.press("Escape");
  const st = await page.locator(".v-op").getAttribute("data-opening-state");
  check("o2", "연출 중 Esc 는 닫기가 아니라 결과 바로 보기다", st === "revealed" || st === "settled", st);
  // 드러난 직후(단추가 잠긴 0.35초): 한 번 더 열기를 프로그램으로 누른다
  const disabled = await page.evaluate(() => { const b = document.querySelector("[data-open-again]"); const d = b ? b.disabled : null; b?.click(); return d; });
  await settled(page);
  l = await s.ledger(page);
  check("o2", "드러난 직후 한 번 더 열기는 잠겨 있고 눌러도 구매가 나가지 않는다(구매 2건 그대로)", disabled === true && l.opens.length === 2, { disabled, opens: l.opens.length });
  const lg = await log(page); const a = lg.find((e) => e.key === "anticipation/opening"), r = lg.find((e) => e.key.startsWith("reveal/"));
  check("o2", "건너뛰면 결과가 자연 길이(840ms)보다 빨리 뜬다", !!(a && r) && r.t - a.t < 700, a && r ? r.t - a.t : lg);
  // 준비된 뒤 한 번 더 열기를 세 번 연달아
  await page.evaluate(() => { const b = document.querySelector("[data-open-again]"); for (let i = 0; i < 3; i++) b.click(); });
  await sleep(300);
  await page.waitForFunction(() => document.querySelector(".v-op")?.getAttribute("data-opening-state") === "settled", null, { timeout: 20000 });
  l = await s.ledger(page);
  check("o2", "한 번 더 열기를 세 번 연달아 눌러도 구매는 1건만 늘어난다(합 3건)", l.opens.length === 3, l.opens.length);
  check("o2", "봤음 표시는 개봉마다 하나(3)", l.seen.length === 3, l.seen.length);
  // 결과 바로 보기 링크
  await page.locator(".v-op-tool").last().click(); await page.waitForSelector(".v-op", { state: "detached" });
  await page.locator("[data-open-primary]").click();
  await page.waitForSelector(".v-op-skip .v-link", { timeout: 10000 });
  await page.locator(".v-op-skip .v-link").click();
  const st2 = await page.locator(".v-op").getAttribute("data-opening-state");
  check("o2", "결과 바로 보기 링크를 누르면 바로 결과", st2 === "revealed" || st2 === "settled", st2);
  await settled(page);
  // 더블클릭
  await page.locator(".v-op-tool").last().click(); await page.waitForSelector(".v-op", { state: "detached" });
  const n0 = (await s.ledger(page)).opens.length;
  await page.locator("[data-open-primary]").dblclick();
  await settled(page);
  l = await s.ledger(page);
  check("o2", "열기 단추 더블클릭은 구매 1건", l.opens.length === n0 + 1, { before: n0, after: l.opens.length });
  check("o2", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// o3: 상품 결과. 검증, 취소, USDT로 받기(확정 세 번), 보관함에 두기
await run("o3", async () => {
  const s = await session({ preset: "funded", reduced: true, fixture: "dollar-apple:single:itemLow" });
  const page = await boxPage(s, "dollar-apple");
  await page.locator("[data-open-primary]").click(); await settled(page);
  let l = await s.ledger(page);
  check("o3", "상품 결과: 잔액 9999, 보관함 IN_STORAGE 1건, sellback 없음", near(l.balance, 9999) && l.items[0]?.status === "IN_STORAGE" && l.sellbacks.length === 0, l.items);
  const t = await opText(page);
  check("o3", "결과 글(상품, 보관함에 넣었습니다, 주 단추 USDT로 받기 $19)", t.includes("보관함에 넣었습니다") && t.includes("USDT로 받기 ($19)"), t.slice(0, 260));
  await s.shot(page, "04-o3-result-item");
  // 검증 시트
  await page.locator(".v-op-actions .v-link", { hasText: "개봉 결과 검증" }).click();
  await page.waitForSelector(".v-sheet", { timeout: 5000 }); await page.waitForFunction(() => /같습니다|다릅니다|맞춰 보지|계산하지/.test(document.querySelector(".v-sheet")?.innerText || ""), null, { timeout: 10000 });
  const v = await sheetText(page);
  check("o3", "그 자리 검증: 세 단계와 일치 판정", v.includes("1. 열기 전에 잠근 값") && v.includes("블록체인 기록 없음") && v.includes("다시 계산한 결과가 받은 상품과 같습니다"), v.slice(0, 400));
  await s.shot(page, "04-o3-verify-sheet");
  await page.keyboard.press("Escape"); await sleep(250);
  check("o3", "검증 시트의 Esc 는 시트만 닫는다(결과 화면은 남는다)", (await page.locator(".v-sheet").count()) === 0 && (await page.locator(".v-op").count()) === 1);
  // 받기: 확인창 취소
  await page.locator("[data-take-primary]").click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(300);
  const c = await txt(page.locator('[role="alertdialog"]'));
  check("o3", "받기 확인창 글", c.includes("받을 금액 $19") && c.includes("배송으로 바꿀 수 없습니다"), c);
  await page.locator('[role="alertdialog"] .v-link').click(); await sleep(250);
  l = await s.ledger(page);
  check("o3", "취소하면 돈이 움직이지 않는다", near(l.balance, 9999) && l.sellbacks.length === 0);
  // 받기: 확정 세 번
  await page.locator("[data-take-primary]").click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(300);
  await page.evaluate(() => { const b = document.querySelector('[role="alertdialog"] .v-btn'); for (let i = 0; i < 3; i++) b.click(); });
  await page.waitForSelector("[data-taken-title]", { timeout: 10000 });
  l = await s.ledger(page);
  check("o3", "확정을 세 번 눌러도 한 번만 지급: 잔액 10018, sellback 1건(그 상품의 id), SOLD", near(l.balance, 10018) && l.sellbacks.length === 1 && near(l.sellbacks[0].amount, 19) && l.sellbacks[0].itemIds?.[0] === l.items[0].id && l.items[0].status === "SOLD" && near(l.items[0].sold, 19), { bal: l.balance, sb: l.sellbacks });
  check("o3", "받은 뒤의 결과 글과 주 단추(한 번 더 언박싱)", (await opText(page)).includes("잔액에 $19 넣었습니다") && (await page.locator("[data-open-again]").count()) === 1, (await opText(page)).slice(0, 220));
  await s.shot(page, "04-o3-taken");
  await page.locator(".v-op-tool").last().click(); await page.waitForSelector(".v-op", { state: "detached" });
  // 보관함에 두기
  const s2 = await session({ preset: "funded", reduced: true, fixture: "dollar-apple:single:itemMid" });
  const p2 = await boxPage(s2, "dollar-apple");
  await p2.locator("[data-open-primary]").click(); await settled(p2);
  await p2.locator(".v-op-actions .v-link", { hasText: "보관함에 두기" }).click(); await p2.waitForSelector(".v-op", { state: "detached" });
  const l2 = await s2.ledger(p2);
  check("o3", "보관함에 두기: 화면이 닫히고 상품은 IN_STORAGE, 잔액 9999", l2.items[0]?.status === "IN_STORAGE" && near(l2.balance, 9999) && l2.seen.length === 1, l2.items);
  check("o3", "콘솔 오류 없음", s.errors.length + s2.errors.length === 0, [...s.errors, ...s2.errors].join(" | "));
  await s.context.close(); await s2.context.close();
});

// o4: 연출 중 새로 고침, 떠남, 뒤로 가기. 같은 결과를 다시 보여 주고 새로 뽑지 않는다
await run("o4", async () => {
  const s = await session({ preset: "funded", reduced: false, fixture: "dollar-apple:single:itemLow" });
  let page = await boxPage(s, "dollar-apple");
  await page.locator("[data-open-primary]").click();
  await page.waitForSelector(".v-op[data-phase='anticipation']", { timeout: 10000 });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("[data-open-recover]", { timeout: 20000 });
  let l = await s.ledger(page);
  check("o4", "연출 중 새로 고침: 구매 1건과 보관함 기록 1건은 남아 있고 봤음은 0", l.opens.length === 1 && l.items.length === 1 && l.seen.length === 0 && near(l.balance, 9999), { opens: l.opens.length, items: l.items.length, seen: l.seen.length, bal: l.balance });
  const bar = await txt(page.locator(".v-openbar"));
  check("o4", "박스 화면: 보지 못한 결과 한 줄과 주 단추 결과 보기(열기 단추 없음)", bar.includes("보지 못한 개봉 결과가 있습니다.") && (await page.locator("[data-open-primary]").count()) === 0, bar);
  await s.shot(page, "04-o4-recover-line");
  // 다른 박스에서는 링크로 알린다
  const other = await s.open("/ko/box/vault-gold/"); await other.waitForSelector(".v-openbar .v-btn:not([disabled])"); await other.waitForSelector(".v-openbar a.v-link", { timeout: 8000 }).catch(() => {});
  const obar = await txt(other.locator(".v-openbar"));
  check("o4", "다른 박스 화면: 다른 박스에 보지 못한 결과가 있다는 링크, 열기 단추는 그대로", obar.includes("다른 박스에 보지 못한 개봉 결과가 있습니다") && (await other.locator("[data-open-primary]").count()) === 1, obar);
  await other.close();
  await page.locator("[data-open-recover]").click();
  await page.waitForSelector(".v-op", { timeout: 10000 });
  const ph = await page.locator(".v-op").getAttribute("data-phase");
  const t = await opText(page);
  check("o4", "결과 보기: 연출 없이 바로 결과, 새로 뽑지 않았다는 한 줄", (ph === "reveal" || ph === "ready") && t.includes("아까 연 박스의 결과입니다. 새로 뽑지 않았습니다."), { ph, t: t.slice(0, 200) });
  await settled(page);
  l = await s.ledger(page);
  check("o4", "다시 본 뒤: 구매 1건 그대로, 봤음 1, 회차 그대로", l.opens.length === 1 && l.items.length === 1 && l.seen.length === 1, { opens: l.opens.length, seen: l.seen.length });
  await s.shot(page, "04-o4-recovered");
  await page.locator(".v-op-tool").last().click(); await page.waitForSelector(".v-op", { state: "detached" });
  await page.reload({ waitUntil: "networkidle" }); await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  check("o4", "본 뒤 새로 고치면 다시 묻지 않는다", (await page.locator("[data-open-recover]").count()) === 0 && (await page.locator("[data-open-primary]").count()) === 1);
  // 연출 중 뒤로 가기: 홈에서 박스로 들어와 연다
  await page.goto(new URL("/voila-test-aresjoo/ko/", page.url()).href, { waitUntil: "networkidle" });
  await page.locator('a.v-boxcard').first().waitFor();
  await page.evaluate(() => { const a = [...document.querySelectorAll("a")].find((x) => x.getAttribute("href")?.includes("/box/")); a?.click(); });
  await page.waitForURL(/\/box\//); await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  const slug = new URL(page.url()).pathname.split("/").filter(Boolean).pop();
  const b0 = await s.ledger(page);
  const label = await txt(page.locator("[data-open-primary]"));
  await page.locator("[data-open-primary]").click();
  // 큰 금액이면 확인창이 먼저 뜬다
  const dlg = page.locator('[role="alertdialog"] .v-btn');
  await sleep(250); if (await dlg.count()) await dlg.first().click();
  await page.waitForSelector(".v-op", { timeout: 15000 });
  await page.goBack({ waitUntil: "networkidle" });
  check("o4", `연출 중 뒤로 가기(${slug}, ${label}): 홈으로 돌아간다(결과 화면은 주소 기록에 없다)`, /\/ko\/$/.test(new URL(page.url()).pathname), page.url());
  const b1 = await s.ledger(page);
  check("o4", "뒤로 간 뒤: 구매는 1건 늘어 있고 봤음은 늘지 않았다(잃은 것도 겹친 것도 없다)", b1.opens.length === b0.opens.length + 1 && b1.items.length === b0.items.length + 1 && b1.seen.length === b0.seen.length, { opens: [b0.opens.length, b1.opens.length], items: [b0.items.length, b1.items.length], seen: [b0.seen.length, b1.seen.length] });
  await page.goForward({ waitUntil: "networkidle" });
  await page.waitForSelector("[data-open-recover]", { timeout: 20000 });
  check("o4", "앞으로 가면 그 박스 화면이 결과 보기를 준다", true);
  await page.locator("[data-open-recover]").click(); await page.waitForSelector(".v-op", { timeout: 10000 }); await settled(page);
  const b2 = await s.ledger(page);
  check("o4", "다시 본 뒤에도 구매 수는 그대로", b2.opens.length === b1.opens.length && b2.seen.length === b1.seen.length + 1);
  check("o4", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// o5: 여럿 열기. 5개(확인창 없음), 10개(확인창, 취소와 확정), 결과 목록과 그 자리 받기
await run("o5", async () => {
  const s = await session({ preset: "funded", reduced: false, fixture: "dollar-apple:seq:withItem" });
  const page = await boxPage(s, "dollar-apple");
  const chips = page.locator(".v-openbar .v-chip");
  check("o5", "수량 알약 다섯(1, 5, 10, 50, 100)과 처음 선택 1", (await chips.allInnerTexts()).join("|") === "1개|5개|10개|50개|100개" && (await chips.nth(0).getAttribute("aria-pressed")) === "true");
  await chips.nth(1).click();
  check("o5", "5개를 고르면 주 단추가 5개 언박싱 $5", (await txt(page.locator("[data-open-primary]"))) === "5개 언박싱 $5" && (await chips.nth(1).getAttribute("aria-pressed")) === "true", await txt(page.locator("[data-open-primary]")));
  await armLog(page);
  await page.locator("[data-open-primary]").click();
  await page.waitForSelector(".v-reveal", { timeout: 10000 });
  check("o5", "5개는 확인창 없이 바로 연다(5달러, 10개 미만)", (await page.locator('[role="alertdialog"]').count()) === 0);
  await page.waitForSelector(".v-reveal-result", { timeout: 10000 }); await sleep(600);
  const lg = await log(page);
  check("o5", "여럿 열기 단계 기록", "info", lg);
  const first = lg.find((e) => e.key.startsWith("reveal:"));
  check("o5", "여럿 열기도 연출이 시작될 때 이미 장부에 적혀 있다(구매 1건, 기록 5건)", first && first.opens === 1 && first.items === 5, first);
  let l = await s.ledger(page);
  // withItem: c0.05 d10 c0.05 c2 c0.05 → 잔액에 2.15, 상품 하나(10)
  check("o5", "잔액 10000 - 5 + 2.15 = 9997.15, 구매 1건(-5), sellback 1건(cashback x4), 기록 5건", near(l.balance, 9997.15) && l.opens.length === 1 && l.opens[0].amount === -5 && l.sellbacks.length === 1 && /cashback x4$/.test(l.sellbacks[0].ref) && l.items.length === 5, { bal: l.balance, opens: l.opens, sb: l.sellbacks });
  const t = await opText(page);
  check("o5", "결과 요약 글", t.includes("5개를 열었습니다") && t.includes("쓴 금액 $5") && t.includes("잔액에 반영 $2.15"), t.slice(0, 420));
  await s.shot(page, "04-o5-multi5");
  check("o5", "주 단추는 방금 나온 상품을 미리 고른 USDT로 받기(1개, $9.5)", (await txt(page.locator("[data-take-batch]"))) === "USDT로 받기 (1개, $9.5)", await txt(page.locator("[data-take-batch]")));
  // 행: 상품 행은 상세 시트, USDT 행(묶이지 않은 것)은 검증
  const rows = await page.locator(".v-resultrow").evaluateAll((els) => els.map((e) => ({ text: e.innerText.replace(/\s+/g, " "), button: !!e.querySelector("button") })));
  check("o5", "결과 행(같은 금액의 USDT 결과는 한 줄로 묶이고 그 줄은 누를 수 없다)", rows.length === 3 && rows.some((r) => !r.button && r.text.includes("3번")), rows);
  await page.locator(".v-resultrow button").first().click(); await page.waitForSelector(".v-sheet", { timeout: 5000 }); await sleep(250);
  const st = await sheetText(page);
  check("o5", "상품 행을 누르면 그 상품의 시트(상품가, 확률, USDT로 받기, 검증)", st.includes("상품가") && st.includes("USDT로 받기 ($9.5)") && st.includes("개봉 결과 검증"), st.slice(0, 260));
  await page.keyboard.press("Escape"); await sleep(250);
  // 선택 시트로 받기
  await page.locator("[data-take-batch]").click(); await page.waitForSelector(".v-sheet [data-take-row]"); await sleep(300);
  check("o5", "선택 시트는 방금 나온 상품만 담고 미리 골라져 있다", (await page.locator(".v-sheet [data-take-row]").count()) === 1 && (await page.locator(".v-sheet [data-take-row]").first().getAttribute("aria-checked")) === "true");
  await page.locator("[data-take-submit]").click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(300);
  await page.evaluate(() => { const b = document.querySelector('[role="alertdialog"] .v-btn'); for (let i = 0; i < 2; i++) b.click(); });
  await page.waitForSelector("[data-take-done]", { timeout: 10000 });
  l = await s.ledger(page);
  check("o5", "받은 뒤 잔액 9997.15 + 9.5 = 10006.65, sellback 2건", near(l.balance, 10006.65) && l.sellbacks.length === 2, { bal: l.balance, sb: l.sellbacks.length });
  await page.locator("[data-take-done]").click(); await sleep(300);
  const t2 = await opText(page);
  check("o5", "영수증이 바뀐다(잔액에 반영 $11.65, USDT로 받음) 그리고 주 단추가 한 번 더 언박싱", t2.includes("잔액에 반영 $11.65") && t2.includes("USDT로 받음") && (await page.locator("[data-open-again]").count()) === 1, t2.slice(0, 420));
  await page.locator(".v-reveal .v-sheet-close").click(); await page.waitForSelector(".v-reveal", { state: "detached" });
  check("o5", "닫은 뒤 수량은 그대로 5개", (await page.locator(".v-openbar .v-chip").nth(1).getAttribute("aria-pressed")) === "true");
  await s.context.close();

  // 10개: 확인창
  const s2 = await session({ preset: "funded", reduced: true, fixture: "dollar-apple:seq:tenSmall" });
  const p2 = await boxPage(s2, "dollar-apple");
  await p2.locator(".v-openbar .v-chip").nth(2).click();
  await p2.locator("[data-open-primary]").click(); await p2.waitForSelector('[role="alertdialog"]', { timeout: 5000 }); await sleep(250);
  const c = await txt(p2.locator('[role="alertdialog"]'));
  check("o5", "10개는 확인창이 뜬다($10 결제)", c.includes("$10 결제") && c.includes("잔액에서 결제하고 바로 엽니다."), c);
  await s2.shot(p2, "04-o5-confirm10");
  await p2.keyboard.press("Escape"); await sleep(250);
  let l2 = await s2.ledger(p2);
  check("o5", "확인창에서 Esc: 닫히고 구매 0건", (await p2.locator('[role="alertdialog"]').count()) === 0 && l2.opens.length === 0);
  await p2.locator("[data-open-primary]").click(); await p2.waitForSelector('[role="alertdialog"]'); await sleep(250);
  await p2.locator('[role="alertdialog"] .v-link').click(); await sleep(250);
  l2 = await s2.ledger(p2);
  check("o5", "확인창에서 취소: 구매 0건, 열기 단추는 다시 눌린다", l2.opens.length === 0 && (await p2.locator("[data-open-primary]").isEnabled()));
  await p2.locator("[data-open-primary]").click(); await p2.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(250);
  await p2.evaluate(() => { const b = document.querySelector('[role="alertdialog"] .v-btn'); for (let i = 0; i < 3; i++) b.click(); });
  await p2.waitForSelector(".v-reveal-result", { timeout: 15000 }); await sleep(500);
  l2 = await s2.ledger(p2);
  check("o5", "확정을 세 번 눌러도 10개 구매 1건: 잔액 10000 - 10 + 0.5, 기록 10건", l2.opens.length === 1 && l2.opens[0].amount === -10 && near(l2.balance, 9990.5) && l2.items.length === 10, { bal: l2.balance, opens: l2.opens });
  const t3 = await opText(p2);
  check("o5", "전부 USDT 결과면 제목이 잔액에 들어왔다는 문장이고 받을 것이 없다", t3.includes("$0.5, 잔액에 들어왔습니다") && (await p2.locator("[data-take-batch]").count()) === 0, t3.slice(0, 300));
  await s2.shot(p2, "04-o5-multi10");
  check("o5", "콘솔 오류 없음", s.errors.length + s2.errors.length === 0, [...s.errors, ...s2.errors].join(" | "));
  await s2.context.close();
});

// o6: 50개와 100개(실제 추첨, 불변식만 본다)
await run("o6", async () => {
  for (const [idx, n] of [[3, 50], [4, 100]]) {
    const s = await session({ preset: "funded", reduced: true });
    const page = await boxPage(s, "dollar-apple");
    await page.locator(".v-openbar .v-chip").nth(idx).click();
    const label = await txt(page.locator("[data-open-primary]"));
    await page.locator("[data-open-primary]").click(); await page.waitForSelector('[role="alertdialog"] .v-btn', { timeout: 5000 }); await sleep(250);
    await page.locator('[role="alertdialog"] .v-btn').click();
    await page.waitForSelector(".v-reveal-result", { timeout: 30000 }); await sleep(900);
    const l = await s.ledger(page);
    const cash = l.items.filter((i) => i.status === "SOLD").reduce((a, i) => a + (i.sold ?? 0), 0);
    check("o6", `${n}개(${label}): 구매 1건(-${n}), 기록 ${n}건, 잔액 = 10000 - ${n} + USDT 결과 합`, l.opens.length === 1 && l.opens[0].amount === -n && l.items.length === n && near(l.balance, +(10000 - n + cash).toFixed(2)), { bal: l.balance, cash: +cash.toFixed(2), held: l.held, sold: l.sold, sellbacks: l.sellbacks.length, nonce: l.nonce });
    check("o6", `${n}개: 회차가 ${n} 늘고 기록의 회차는 겹치지 않는다`, new Set(l.items.map((i) => i.nonce)).size === n, l.nonce);
    const t = await opText(page);
    check("o6", `${n}개 결과 요약`, "info", t.slice(0, 300));
    await s.shot(page, `04-o6-multi${n}`);
    check("o6", `${n}개 콘솔 오류 없음`, s.errors.length === 0, s.errors.join(" | "));
    await s.context.close();
  }
});

// o7: 잔액 부족, 비로그인, 큰 금액 확인
await run("o7", async () => {
  let s = await session({ preset: "insufficient", reduced: true });
  let page = await boxPage(s, "dollar-apple");
  let bar = await txt(page.locator(".v-openbar"));
  check("o7", "잔액 0.25, 1달러 박스: 한 줄 안내와 주 단추 USDT 충전하기(열기 단추 없음)", bar.includes("잔액 $0.25. $0.75 더 필요합니다.") && (await page.locator("[data-short-charge]").count()) === 1 && (await page.locator("[data-open-primary]").count()) === 0, bar);
  await s.shot(page, "04-o7-short");
  await page.locator("[data-short-charge]").click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  check("o7", "충전하기는 충전 시트를 연다", (await sheetText(page)).startsWith("USDT 충전"), (await sheetText(page)).slice(0, 200));
  await s.shot(page, "04-o7-charge-sheet");
  await page.keyboard.press("Escape"); await sleep(250);
  const l = await s.ledger(page);
  check("o7", "부족한 상태에서는 구매가 나가지 않는다", l.opens.length === 0 && near(l.balance, 0.25));
  await s.context.close();

  s = await session({ preset: "inventory", balance: 0.25, reduced: true });
  page = await boxPage(s, "dollar-apple");
  await page.locator(".v-openbar .v-chip").nth(1).click();
  bar = await txt(page.locator(".v-openbar"));
  check("o7", "보관 상품을 받아 채워질 때: 주 단추 USDT로 받기, 최대 금액 한 줄, 충전 링크", (await page.locator("[data-short-take]").count()) === 1 && bar.includes("$4.75 더 필요합니다.") && bar.includes("최대 $1,471.55"), bar);
  await s.shot(page, "04-o7-short-take");
  await s.context.close();

  s = await session({ preset: "guest", reduced: true });
  page = await boxPage(s, "dollar-apple");
  bar = await txt(page.locator(".v-openbar"));
  check("o7", "비로그인: 주 단추 로그인하고 언박싱, 수량과 금액 한 줄", bar.includes("로그인하고 언박싱") && bar.includes("1개, $1. 로그인한 뒤 USDT 잔액으로 결제합니다."), bar);
  await page.locator(".v-openbar .v-chip").nth(2).click();
  check("o7", "비로그인: 수량을 바꾸면 한 줄이 따라 바뀐다", (await txt(page.locator(".v-openbar"))).includes("10개, $10."));
  await page.locator(".v-openbar .v-btn").click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  check("o7", "비로그인: 주 단추는 로그인 시트를 연다(구매 없음)", (await sheetText(page)).startsWith("로그인"));
  await s.shot(page, "04-o7-guest-login");
  await s.context.close();

  s = await session({ preset: "funded", reduced: true, fixture: "vault-gold:single:low" });
  page = await boxPage(s, "vault-gold");
  await page.locator("[data-open-primary]").click(); await page.waitForSelector('[role="alertdialog"]', { timeout: 5000 }); await sleep(250);
  check("o7", "50달러 박스는 1개도 확인창이 뜬다", (await txt(page.locator('[role="alertdialog"]'))).includes("$50 결제"));
  // 바깥 누르기로 취소
  await page.mouse.click(5, 5); await sleep(250);
  check("o7", "확인창 바깥을 누르면 취소된다(구매 0건)", (await page.locator('[role="alertdialog"]').count()) === 0 && (await s.ledger(page)).opens.length === 0);
  await page.locator("[data-open-primary]").click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(250);
  await page.locator('[role="alertdialog"] .v-btn').click(); await settled(page);
  const l2 = await s.ledger(page);
  check("o7", "확정하면 구매 1건: 잔액 10000 - 50 + 2.5", l2.opens.length === 1 && near(l2.balance, 9952.5), l2.balance);
  check("o7", "터짐 게이지가 저장된다(옛 박스)", !!l2.burst?.["vault-gold"], l2.burst);
  await s.context.close();
});

// o8: 무료 개봉(가입 혜택)
await run("o8", async () => {
  const s = await session({ preset: "funded", reduced: true });
  const page = await boxPage(s, "pokemon-charizard");
  let l = await s.ledger(page);
  check("o8", "로그인하면 가입 혜택의 무료 개봉 2회가 장부에 생긴다", l.freeOpens?.["pokemon-charizard"] === 2, l.freeOpens);
  let bar = await txt(page.locator(".v-openbar"));
  check("o8", "무료 한 줄과 주 단추 무료 언박싱", bar.includes("이 박스를 무료로 2번 열 수 있습니다.") && (await txt(page.locator("[data-open-primary]"))) === "무료 언박싱", bar);
  await page.locator(".v-openbar .v-chip").nth(1).click();
  const five = await txt(page.locator("[data-open-primary]"));
  check("o8", "5개를 고르면 무료 2개를 뺀 3개 값만 적힌다", /^5개 언박싱 \$/.test(five), five);
  await page.locator(".v-openbar .v-chip").nth(0).click();
  await s.shot(page, "04-o8-free");
  await page.locator("[data-open-primary]").click(); await settled(page);
  l = await s.ledger(page);
  check("o8", "무료 개봉: 잔액 그대로, 구매 거래 금액 0, ref 에 +free1, 남은 무료 1", near(l.balance, 10000) && l.opens.length === 1 && Math.abs(l.opens[0].amount) === 0 && /\+free1:op_/.test(l.opens[0].ref) && l.freeOpens["pokemon-charizard"] === 1, { bal: l.balance, opens: l.opens, free: l.freeOpens });
  const t = await opText(page);
  check("o8", "결과 글에 무료 개봉이라고 적힌다, 다음 단추는 무료로 한 번 더", t.includes("무료 개봉"), t.slice(0, 260));
  await s.shot(page, "04-o8-free-result");
  check("o8", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// o9: 움직임 줄이기, 짧게 보기, 자동 받기, 개봉 설정
await run("o9", async () => {
  let s = await session({ preset: "funded", reduced: true, fixture: "dollar-apple:single:low" });
  let page = await boxPage(s, "dollar-apple");
  await armLog(page);
  await page.locator("[data-open-primary]").click(); await settled(page);
  let lg = await log(page);
  check("o9", "움직임 줄이기: 연출 단계 없이 바로 결과", !lg.some((e) => e.key.startsWith("impact") || e.key.startsWith("exit")), lg.map((e) => e.key + "@" + e.t));
  // 개봉 설정
  await page.locator(".v-op-tool").first().click(); await page.waitForSelector(".v-sheet .v-op-toggle"); await sleep(250);
  const toggles = page.locator(".v-sheet .v-op-toggle");
  check("o9", "개봉 설정: 스위치 셋, 전부 끔", (await toggles.count()) === 3 && (await toggles.evaluateAll((els) => els.map((e) => e.getAttribute("aria-checked")).join(","))) === "false,false,false");
  await s.shot(page, "04-o9-settings");
  await toggles.nth(0).click(); await toggles.nth(1).click(); await sleep(150);
  let st = await page.evaluate(() => JSON.parse(localStorage.getItem("gachaflix.settings")).state);
  check("o9", "소리와 짧게 보기는 누르면 곧 켜지고 gachaflix.settings 에 저장된다", st.openSound === true && st.openShort === true, st);
  await toggles.nth(2).click(); await page.waitForSelector('[role="alertdialog"]'); await sleep(250);
  check("o9", "자동 받기는 확인창을 거친다", (await txt(page.locator('[role="alertdialog"]'))).includes("자동으로 받기 켜기"));
  await page.locator('[role="alertdialog"] .v-link').click(); await sleep(250);
  st = await page.evaluate(() => JSON.parse(localStorage.getItem("gachaflix.settings")).state);
  check("o9", "취소하면 켜지지 않는다", !st.autoTakeBy?.["capture-account"], st.autoTakeBy);
  await page.locator(".v-sheet .v-op-toggle").nth(2).click(); await page.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(250);
  await page.locator('[role="alertdialog"] .v-btn').click(); await sleep(250);
  st = await page.evaluate(() => JSON.parse(localStorage.getItem("gachaflix.settings")).state);
  check("o9", "확정하면 계정별로 저장된다(autoTakeBy[계정])", st.autoTakeBy?.["capture-account"] === true, st.autoTakeBy);
  await s.context.close();

  // 짧게 보기: 연출 길이
  s = await session({ preset: "funded", reduced: false, fixture: "dollar-apple:single:low", settings: { openShort: true } });
  page = await boxPage(s, "dollar-apple");
  await armLog(page); await page.locator("[data-open-primary]").click(); await settled(page);
  lg = await log(page);
  const a = lg.find((e) => e.key === "anticipation/opening"), r = lg.find((e) => e.key.startsWith("reveal/"));
  check("o9", "짧게 보기: 드러남까지 약 450ms(220 + 110 + 120)", !!(a && r) && r.t - a.t < 620, a && r ? r.t - a.t : lg);
  await s.context.close();

  // 자동 받기: 상품이 나오면 결과가 보인 뒤 스스로 받는다
  s = await session({ preset: "funded", reduced: true, fixture: "dollar-apple:single:itemLow", settings: { autoTakeBy: { "capture-account": true } } });
  page = await boxPage(s, "dollar-apple");
  await page.locator("[data-open-primary]").click(); await settled(page);
  await page.waitForSelector("[data-taken-title]", { timeout: 10000 });
  const l = await s.ledger(page);
  check("o9", "자동 받기를 켠 계정: 상품이 나오면 받는다(잔액 10018, sellback 1건)", near(l.balance, 10018) && l.sellbacks.length === 1 && l.items[0].status === "SOLD", { bal: l.balance });
  check("o9", "자동으로 받았다고 적는다", (await opText(page)).includes("자동으로 USDT로 받았습니다"), (await opText(page)).slice(0, 260));
  await s.shot(page, "04-o9-auto-take");
  await s.context.close();
});

// o10: 저장 실패(저장 공간 가득 참)와 탭 전환
await run("o10", async () => {
  const s = await session({ preset: "funded", reduced: true, fixture: "dollar-apple:single:low", quota: true });
  const page = await boxPage(s, "dollar-apple");
  const before = await s.ledger(page);
  await page.evaluate(() => { window.__quotaFull = true; });
  await page.locator("[data-open-primary]").click();
  await page.waitForSelector(".v-openbar .v-line--fail", { timeout: 10000 }).catch(() => {});
  const bar = await txt(page.locator(".v-openbar"));
  const mem = await page.evaluate(() => document.querySelector("[data-balance-open]")?.innerText);
  check("o10", "저장소에 쓸 수 없으면 열지 않는다: 실패 한 줄, 결과 화면 없음", bar.includes("열지 못했습니다. 잔액은 그대로입니다.") && (await page.locator(".v-op").count()) === 0, bar);
  check("o10", "머리줄의 잔액은 그대로", mem?.includes("10,000"), mem);
  const badge = await page.evaluate(() => [...document.querySelectorAll('[role="status"]')].map((e) => e.innerText).join(" | "));
  check("o10", "저장 공간 안내가 왼쪽 아래에 뜬다(LabBadge)", badge.includes("브라우저 저장 공간이 가득 차"), badge.slice(0, 200));
  await s.shot(page, "04-o10-storage-full");
  await page.evaluate(() => { window.__quotaFull = false; });
  const mid = await s.ledger(page);
  check("o10", "저장된 장부도 그대로(구매 0건, 회차 그대로)", mid.opens.length === 0 && near(mid.balance, before.balance) && mid.nonce === before.nonce, { opens: mid.opens.length, bal: mid.balance, nonce: [before.nonce, mid.nonce] });
  await page.locator("[data-open-primary]").click(); await settled(page);
  const after = await s.ledger(page);
  check("o10", "저장소가 돌아오면 다시 눌러 열린다(구매 1건)", after.opens.length === 1 && near(after.balance, 9999.05), after.balance);
  await s.context.close();

  // 탭 전환: 여는 순간 다른 탭을 앞으로 가져왔다가 돌아온다
  const s2 = await session({ preset: "funded", reduced: false, fixture: "dollar-apple:single:low" });
  const p = await boxPage(s2, "dollar-apple");
  await p.locator("[data-open-primary]").click();
  await p.waitForSelector(".v-op", { timeout: 10000 });
  const other = await s2.context.newPage(); await other.goto("about:blank"); await other.bringToFront();
  await sleep(2500);
  const hidden = await p.evaluate(() => document.visibilityState);
  await p.bringToFront(); await settled(p);
  const l2 = await s2.ledger(p);
  check("o10", `탭 전환(그동안 visibilityState=${hidden}): 돌아오면 결과가 떠 있고 구매 1건, 봤음 1`, l2.opens.length === 1 && l2.seen.length === 1 && near(l2.balance, 9999.05), { opens: l2.opens.length, seen: l2.seen.length });
  await s2.context.close();
});

await save();
