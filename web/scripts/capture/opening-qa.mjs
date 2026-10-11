// 개봉 경험 구조 검수. 실제 화면을 눌러 필수 상태를 찍고, 돈과 상태는 숫자로 확인한다.
//   node scripts/capture/opening-qa.mjs <출력 폴더> [--only s1,s2]
// 결과는 고정값(opening-fixtures.json)의 시드와 회차를 실제 계산식에 넣어 나온 것이다. 결과를 바꾸는 코드는 없다.
// 기대하는 금액은 고정값에 적힌 그 결과의 값에서 계산한다(확률표가 바뀌면 opening-fixtures.ts 만 다시 돌리면 된다).
// 정산 대기와 실패, 구매 실패는 개발 서버에서만 켜지는 시험 스위치(sessionStorage "voila.opening.fault")로 만든다.
import { chromium } from "playwright";
import fs from "node:fs";
import { installState, makeState } from "./states.mjs";

const argv = process.argv.slice(2);
const out = argv[0];
const opt = (k, d) => { const i = argv.indexOf("--" + k); return i < 0 ? d : argv[i + 1]; };
const only = opt("only", "").split(",").filter(Boolean);
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
const fixtures = JSON.parse(fs.readFileSync(new URL("opening-fixtures.json", import.meta.url), "utf8"));
const VIEWS = { mobile: [390, 844], narrow: [320, 640], m360: [360, 800], m375: [375, 812], m430: [430, 932], tablet: [768, 1024], desktop: [1440, 900] };
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const wrap = (s, version = 0) => JSON.stringify({ state: s, version });
const results = [];
const check = (scenario, name, pass, detail) => { results.push({ scenario, name, pass: !!pass, detail }); console.log((pass ? "PASS " : "FAIL ") + scenario + " " + name + (detail ? "  " + detail : "")); };
const near = (a, b) => Math.abs(a - b) < 0.005;
const r2 = (n) => +n.toFixed(2);
const START = 10000;
/** 화면이 금액을 적는 방식과 같게 */
const usdt = (n) => r2(n).toLocaleString("en-US", { maximumFractionDigits: 2 }) + " USDT";
/** 그 결과 하나를 연 뒤의 잔액: 낸 값이 빠지고, USDT 결과면 그 금액이 더해진다(상품은 보관만) */
const after = (fx, price, from = START) => r2(from - price + (fx.kind === "cash" ? fx.value : 0));

async function session({ slug = "dollar-apple", fixture = "single:low", view = "mobile", balance = null, reduced = false, settings = null, locale = "ko" }) {
  const [w, h] = VIEWS[view]; const touch = view !== "desktop";
  const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: touch ? 2 : 1, isMobile: touch, hasTouch: touch, locale: locale === "en" ? "en-US" : locale === "zh" ? "zh-CN" : "ko-KR", reducedMotion: reduced ? "reduce" : "no-preference" });
  const [fk, fn] = fixture.split(":");
  const fx = fixtures.boxes[slug][fk === "seq" ? "sequences" : "single"][fn];
  if (!fx) throw new Error(`고정값 없음: ${slug} ${fixture}`);
  const price = fixtures.boxes[slug].price;
  const state = await makeState("funded", locale);
  state.values["gachaflix.fair"] = wrap({ serverSeed: fixtures.serverSeed, serverSeedHash: fixtures.serverSeedHash, clientSeed: fx.clientSeed, nonce: fx.nonce });
  if (settings) { const { autoTake, autoTakeFor, ...rest } = settings; state.values["gachaflix.settings"] = wrap({ muted: true, openSound: false, openShort: false, autoTakeBy: autoTake ? { [autoTakeFor ?? state.user.id]: true } : {}, lastReceiveBy: {}, ...rest }); }
  if (balance !== null) for (const key of Object.keys(state.values).filter((k) => k === "gachaflix.wallet" || (k.startsWith("voila.browser-wallet.") && !k.endsWith(".guest")))) {
    const v = JSON.parse(state.values[key]); v.state.balance = balance; v.state.cryptoBalance = balance; state.values[key] = JSON.stringify(v);
  }
  await installState(context, state, new URL(base).origin);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
  page.on("pageerror", (e) => errors.push("pageerror " + String(e).slice(0, 160)));
  await page.goto(`${base}/${locale}/box/${slug}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])", { timeout: 15000 });
  const ledger = () => page.evaluate(() => {
    const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null")?.state ?? null; } catch { return null; } };
    const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    const pick = (p) => keys.find((k) => k && k.startsWith(p) && !k.endsWith(".guest"));
    const w = read(pick("voila.browser-wallet.") ?? "gachaflix.wallet"); const inv = read(pick("voila.browser-inventory.") ?? "gachaflix.inventory"); const fair = read("gachaflix.fair"); const j = read("voila.opening-journal");
    return { balance: w?.balance ?? null, opens: (w?.transactions ?? []).filter((t) => t.type === "open").length, sellbacks: (w?.transactions ?? []).filter((t) => t.type === "sellback").length, items: (inv?.items ?? []).map((i) => ({ id: i.id, itemId: i.itemId, status: i.status, openingId: i.openingId ?? null })), nonce: fair?.nonce ?? null, seen: Object.keys(j?.seen ?? {}), openTx: (w?.transactions ?? []).filter((t) => t.type === "open").map((t) => t.ref) };
  });
  const shot = (name) => page.screenshot({ path: `${out}/${name}-${view}.png` });
  const openBtn = () => page.locator("[data-open-primary]").first();
  const settled = () => page.waitForSelector(".v-op[data-opening-state='settled']", { timeout: 15000 });
  const confirmIfAsked = async () => { const c = page.locator('[role="alertdialog"] .v-btn'); if (await c.count()) await c.first().click(); };
  const text = () => page.evaluate(() => (document.querySelector(".v-op, .v-reveal")?.innerText || "").replace(/\s+/g, " "));
  const closeResult = async () => { await page.locator(".v-op-tool, .v-reveal .v-sheet-close").last().click(); await page.waitForSelector(".v-op, .v-reveal", { state: "detached" }); };
  /** 받는 방법 시트에서 USDT 를 골라 확정한다(단추를 clicks 번 누른다) */
  const takeUsdt = async (clicks = 1) => {
    await page.getByRole("button", { name: /받는 방법 선택/ }).click(); await page.waitForSelector(".v-op-choice"); await page.waitForTimeout(350);
    await page.locator(".v-op-choice").last().click();
    await page.evaluate((n) => { const b = document.querySelector(".v-sheet .v-btn"); for (let i = 0; i < n; i++) b.click(); }, clicks);
  };
  return { context, page, fx, price, errors, ledger, shot, openBtn, settled, confirmIfAsked, text, closeResult, takeUsdt, state, w, h };
}
/** 누른 순간부터 결과가 보이기까지(revealed)와 다음 행동이 가능해지기까지(settled)를 화면 안에서 잰다. 바깥에서 기다리며 재면 수백 ms 가 더해진다. */
const armClock = (page) => page.evaluate(() => {
  window.__clock = { press: 0, revealed: 0, settled: 0 };
  document.addEventListener("click", (e) => { if (e.target.closest?.("[data-open-primary], [data-open-again]") && !window.__clock.press) window.__clock.press = performance.now(); }, true);
  new MutationObserver(() => {
    const st = document.querySelector(".v-op")?.getAttribute("data-opening-state");
    if ((st === "revealed" || st === "settled") && !window.__clock.revealed) window.__clock.revealed = performance.now();
    if (st === "settled" && !window.__clock.settled) window.__clock.settled = performance.now();
  }).observe(document.body, { subtree: true, childList: true, attributes: true });
});
const readClock = (page) => page.evaluate(() => ({ toResult: Math.round(window.__clock.revealed - window.__clock.press), toReady: Math.round(window.__clock.settled - window.__clock.press) }));
const run = async (id, fn) => { if (only.length && !only.includes(id)) return; try { await fn(); } catch (e) { check(id, "시나리오 실행", false, String(e).slice(0, 220)); } };

// s1: 필수 화면 1~3, 15 (박스 고르기, 고른 박스, 구매 확인, 다시 열 준비)
await run("s1", async () => {
  const s = await session({ slug: "vault-gold", fixture: "single:low" });
  await s.page.goto(`${base}/ko`, { waitUntil: "networkidle" }); await s.shot("01-box-selection");
  await s.page.goto(`${base}/ko/box/vault-gold`, { waitUntil: "networkidle" }); await s.page.waitForSelector(".v-openbar .v-btn:not([disabled])"); await s.shot("02-selected-box");
  await s.openBtn().click(); await s.page.waitForSelector('[role="alertdialog"]'); await s.page.waitForTimeout(300); await s.shot("03-purchase-confirmation");
  const before = await s.ledger();
  await s.page.locator('[role="alertdialog"] .v-link').first().click();
  const afterCancel = await s.ledger();
  check("s1", "확인창에서 취소하면 돈이 움직이지 않는다", near(before.balance, afterCancel.balance) && afterCancel.opens === before.opens, `${before.balance} → ${afterCancel.balance}`);
  await s.openBtn().click(); await s.confirmIfAsked(); await s.settled();
  const done = await s.ledger();
  check("s1", `50 USDT 박스 가장 작은 결과: 잔액 = ${START} - 50 + ${s.fx.value}`, near(done.balance, after(s.fx, s.price)), String(done.balance));
  await s.closeResult();
  await s.shot("15-ready-again");
  await s.openBtn().click(); await s.confirmIfAsked(); await s.settled();
  const second = await s.ledger();
  check("s1", "닫은 뒤 같은 박스 화면에서 실제로 다시 열린다(구매 두 번, 회차 두 번)", second.opens === 2 && second.nonce === s.fx.nonce + 2 && second.items.length === 2, `opens ${second.opens} nonce ${second.nonce}`);
  check("s1", "거래 기록과 보관함 기록이 같은 개봉 번호로 이어진다", second.items.every((i) => i.openingId && second.openTx.some((ref) => ref.endsWith(":" + i.openingId))), JSON.stringify(second.openTx));
  check("s1", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// s2: 결과 다섯(가장 작은 결과, 낸 값과 같음, 두 배, 여덟 배, 가장 큰 상품)과 돈 계산
await run("s2", async () => {
  for (const [label, kind] of [["09-small", "low"], ["10-break-even", "x1"], ["11a-double", "x2"], ["11-positive", "x8"], ["12-exceptional", "itemTop"]]) {
    const s = await session({ fixture: "single:" + kind });
    await s.openBtn().click(); await s.settled(); await s.page.waitForTimeout(kind === "itemTop" ? 2300 : 700); await s.shot(label);
    const l = await s.ledger(); const t = await s.text(); const expect = after(s.fx, s.price);
    check("s2", `${kind}: 잔액 ${expect}`, near(l.balance, expect), String(l.balance));
    check("s2", `${kind}: 구매 한 번, 보관함 기록 하나`, l.opens === 1 && l.items.length === 1, `opens ${l.opens} items ${l.items.length}`);
    if (kind === "low") check("s2", "low: 줄었다고 적는다", t.includes("잔액 " + usdt(s.price - s.fx.value) + " 감소") && !/증가/.test(t), t.slice(0, 90));
    if (kind === "x1") check("s2", "x1: 낸 값과 같으면 변화 없음이라고 적는다", /잔액 변화 없음/.test(t) && !/증가|감소/.test(t), t.slice(0, 90));
    if (kind === "x2" || kind === "x8") check("s2", `${kind}: 늘었다고 적는다`, t.includes("잔액 " + usdt(s.fx.value - s.price) + " 증가") && !/감소/.test(t), t.slice(0, 90));
    if (kind === "itemTop") check("s2", "itemTop: 보관 상태와 받는 방법 선택", /보관함에 넣었습니다/.test(t) && /받는 방법 선택/.test(t), t.slice(0, 110));
    check("s2", `${kind}: 가로 넘침 없음`, await s.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await s.context.close();
  }
});

// s3: 연달아 누르기, 결과 직후 누르기, 건너뛰기
await run("s3", async () => {
  let s = await session({ fixture: "seq:tenSmall" });
  const first = after(s.fx.steps[0], s.price);
  await s.page.evaluate(() => { const b = document.querySelector("[data-open-primary]"); b.click(); b.click(); b.click(); });
  await s.settled();
  let l = await s.ledger();
  check("s3", "열기를 연달아 세 번 눌러도 구매는 한 번", l.opens === 1 && l.items.length === 1 && near(l.balance, first), `opens ${l.opens} items ${l.items.length} balance ${l.balance}`);
  await s.context.close();

  s = await session({ fixture: "seq:tenSmall" });
  // 결과가 뜬 직후(단추가 아직 잠긴 동안) 다시 열기와 보조 링크를 누른다. 단추가 나타나는 그 순간을 화면 안에서 잡는다.
  await s.page.evaluate(() => {
    window.__earlyClicks = 0;
    const obs = new MutationObserver(() => {
      const b = document.querySelector("[data-open-again]");
      if (b && document.querySelector(".v-op[data-opening-state='revealed']")) {
        window.__earlyClicks += 1; b.click(); b.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        // 보조 링크는 마우스와 키보드(Enter) 양쪽으로 눌러 본다
        for (const link of document.querySelectorAll(".v-op-actions .v-link")) { link.click(); link.focus(); link.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); link.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true })); }
        window.__earlyOpenSheets = Math.max(window.__earlyOpenSheets || 0, document.querySelectorAll(".v-scrim").length);
        window.__earlyGone = window.__earlyGone || !document.querySelector(".v-op");
      }
    });
    obs.observe(document.body, { subtree: true, childList: true, attributes: true });
    window.__stopEarly = () => obs.disconnect();
  });
  await s.openBtn().click();
  await s.settled();
  const early = await s.page.evaluate(() => { window.__stopEarly(); return window.__earlyClicks; });
  await s.page.waitForTimeout(900);
  l = await s.ledger();
  check("s3", "결과가 뜬 직후 0.35초 안의 누름은 다음 구매가 되지 않는다", early > 0 && l.opens === 1, `이른 누름 ${early}회, opens ${l.opens}`);
  const side = await s.page.evaluate(() => ({ sheets: window.__earlyOpenSheets || 0, gone: !!window.__earlyGone, still: !!document.querySelector(".v-op"), nowSheets: document.querySelectorAll(".v-scrim").length }));
  check("s3", "잠긴 동안에는 보조 링크(검증, 돌아가기)도 마우스와 키보드로 눌리지 않는다", side.sheets === 0 && !side.gone && side.still && side.nowSheets === 0, JSON.stringify(side));
  await s.context.close();

  s = await session({ fixture: "single:x4" });
  const t0 = Date.now();
  await s.openBtn().click();
  await s.page.waitForSelector(".v-op-skip .v-link", { timeout: 5000 }); await s.shot("04-opening-skip-visible");
  await s.page.locator(".v-op-skip .v-link").click();
  await s.page.waitForSelector(".v-op[data-opening-state='revealed'], .v-op[data-opening-state='settled']", { timeout: 5000 });
  const dt = Date.now() - t0;
  await s.settled(); l = await s.ledger(); const t = await s.text();
  check("s3", "건너뛰어도 결과와 잔액이 같다", near(l.balance, after(s.fx, s.price)) && t.includes(usdt(s.fx.value)), `balance ${l.balance}`);
  check("s3", "건너뛰기는 바로 결과로 간다", dt < 900, dt + "ms");
  await s.context.close();
});

// s4: 그 자리에서 USDT 로 받기(필수 13, 14), 두 번 눌러도 한 번만
await run("s4", async () => {
  const s = await session({ fixture: "single:itemLow" });
  await s.openBtn().click(); await s.settled(); await s.page.waitForTimeout(500); await s.shot("12b-item");
  await s.page.getByRole("button", { name: /받는 방법 선택/ }).click();
  await s.page.waitForSelector(".v-op-choice"); await s.page.waitForTimeout(350); await s.shot("13a-receive-method");
  await s.page.locator(".v-op-choice").last().click();
  await s.shot("13b-receive-usdt-selected");
  await s.page.evaluate(() => { const b = document.querySelector(".v-sheet .v-btn"); b.click(); b.click(); });
  await s.page.waitForFunction(() => /USDT로 받았습니다/.test(document.querySelector(".v-op")?.innerText || ""), null, { timeout: 5000 });
  await s.page.waitForTimeout(700); await s.shot("13-instant-usdt-conversion");
  const l = await s.ledger(); const t = await s.text(); const expect = r2(START - s.price + s.fx.sell);
  check("s4", `참고가 ${s.fx.value} 상품을 ${s.fx.sell} USDT 로 받는다: 잔액 ${expect}`, near(l.balance, expect), String(l.balance));
  check("s4", "받기를 두 번 눌러도 한 번만 더해진다", l.sellbacks === 1 && l.items[0].status === "SOLD", `sellbacks ${l.sellbacks} status ${l.items[0]?.status}`);
  check("s4", "받은 뒤 가장 큰 글자는 실제로 받은 금액이고 잔액 변화를 적는다", /받은 금액/.test(t) && t.includes(usdt(s.fx.sell) + " " + usdt(s.price) + " 사용") && t.includes("잔액 " + usdt(Math.abs(s.fx.sell - s.price)) + (s.fx.sell > s.price ? " 증가" : " 감소")), t.slice(0, 120));
  check("s4", "받은 뒤 주 단추는 한 번 더 열기", await s.page.locator("[data-open-again]").count() === 1);
  await s.shot("14-updated-balance");
  await s.context.close();
});

// s5: 자동으로 USDT 로 받기(사용자가 켠 경우), 20배 이상은 자동으로 받지 않는다
await run("s5", async () => {
  let s = await session({ fixture: "single:itemLow", settings: { autoTake: true } });
  await s.openBtn().click(); await s.settled(); await s.page.waitForTimeout(600); await s.shot("13c-auto-take");
  let l = await s.ledger(); let t = await s.text();
  check("s5", "자동 받기 켬: 상품이 자동으로 USDT 가 된다", near(l.balance, r2(START - s.price + s.fx.sell)) && /자동으로 USDT로 받았습니다/.test(t), `balance ${l.balance}`);
  await s.context.close();
  s = await session({ fixture: "single:itemTop", settings: { autoTake: true } });
  await s.openBtn().click(); await s.settled(); await s.page.waitForTimeout(400);
  l = await s.ledger(); t = await s.text();
  check("s5", "자동 받기 켬: 낸 값의 20배 이상은 자동으로 받지 않고 보관한다", near(l.balance, START - s.price) && l.items[0].status === "IN_STORAGE" && /받는 방법 선택/.test(t), `balance ${l.balance} status ${l.items[0]?.status}`);
  await s.context.close();
  s = await session({ fixture: "single:itemLow" });
  await s.openBtn().click(); await s.settled(); l = await s.ledger();
  check("s5", "자동 받기 끔(기본): 상품을 그대로 보관한다", near(l.balance, START - s.price) && l.items[0].status === "IN_STORAGE", `balance ${l.balance}`);
  await s.page.locator(".v-op-tool").first().click(); await s.page.waitForSelector(".v-op-toggle"); await s.page.waitForTimeout(350); await s.shot("19-opening-settings");
  await s.page.locator(".v-op-toggle").nth(2).click(); await s.page.waitForSelector('[role="alertdialog"]'); await s.page.waitForTimeout(350); await s.shot("20-auto-take-confirm");
  const on = await s.page.evaluate(() => Object.values(JSON.parse(localStorage.getItem("gachaflix.settings") || "{}")?.state?.autoTakeBy ?? {}).some(Boolean));
  check("s5", "자동 받기는 확인을 누르기 전에는 켜지지 않는다", on !== true, String(on));
  await s.page.locator('[role="alertdialog"] .v-btn').click(); await s.page.waitForTimeout(300);
  const by = await s.page.evaluate(() => JSON.parse(localStorage.getItem("gachaflix.settings") || "{}")?.state?.autoTakeBy ?? {});
  check("s5", "확인하면 이 계정에만 켜진다", by[s.state.user.id] === true && Object.keys(by).length === 1, JSON.stringify(Object.keys(by)));
  await s.context.close();
  s = await session({ fixture: "single:itemLow", settings: { autoTake: true, autoTakeFor: "someone-else" } });
  await s.openBtn().click(); await s.settled(); await s.page.waitForTimeout(400); l = await s.ledger();
  check("s5", "다른 계정이 켠 자동 받기는 이 계정에 적용되지 않는다", near(l.balance, START - s.price) && l.items[0].status === "IN_STORAGE", `balance ${l.balance} status ${l.items[0]?.status}`);
  await s.context.close();
});

// s6: 잔액 부족(필수 16), 구매 실패, 정산 대기(필수 17)와 실패
await run("s6", async () => {
  let s = await session({ balance: 0.25 });
  await s.shot("16-insufficient-balance");
  check("s6", "잔액이 모자라면 열기 단추가 충전으로 바뀐다", (await s.page.locator("[data-open-primary]").count()) === 0 && /충전/.test(await s.page.locator(".v-openbar .v-btn").innerText()));
  await s.context.close();

  s = await session({ fixture: "single:low" });
  await s.page.evaluate(() => sessionStorage.setItem("voila.opening.fault", "purchase-failed"));
  await s.openBtn().click(); await s.page.waitForSelector(".v-line--fail", { timeout: 5000 }); await s.shot("16b-purchase-failed");
  let l = await s.ledger();
  check("s6", "구매 실패: 돈이 움직이지 않고 결과도 없다", near(l.balance, START) && l.opens === 0 && l.items.length === 0 && l.nonce === s.fx.nonce, `balance ${l.balance} nonce ${l.nonce}`);
  await s.page.evaluate(() => sessionStorage.removeItem("voila.opening.fault"));
  await s.openBtn().click(); await s.settled(); l = await s.ledger();
  check("s6", "구매 실패 뒤 다시 누르면 정상으로 열린다", l.opens === 1 && near(l.balance, after(s.fx, s.price)), `balance ${l.balance}`);
  await s.context.close();

  s = await session({ fixture: "single:itemLow" });
  await s.openBtn().click(); await s.settled();
  await s.page.evaluate(() => sessionStorage.setItem("voila.opening.fault", "settle-pending"));
  await s.takeUsdt();
  await s.page.waitForFunction(() => /기다리는 중/.test(document.querySelector(".v-op")?.innerText || ""), null, { timeout: 5000 }); await s.shot("17-pending-settlement");
  l = await s.ledger(); const t = await s.text();
  check("s6", "정산 대기: 받았다고 말하지 않고 잔액도 그대로", near(l.balance, START - s.price) && !/USDT로 받았습니다/.test(t), `balance ${l.balance}`);
  check("s6", "정산 대기: 새 구매 링크를 내리고 다시 확인을 준다", !/한 번 더 열기/.test(t) && /다시 확인/.test(t), t.slice(-80));
  await s.context.close();

  s = await session({ fixture: "single:itemLow" });
  await s.openBtn().click(); await s.settled();
  await s.page.evaluate(() => sessionStorage.setItem("voila.opening.fault", "settle-failed"));
  await s.takeUsdt();
  await s.page.waitForSelector(".v-op .v-line--fail", { timeout: 5000 }); await s.shot("17b-settlement-failed");
  l = await s.ledger();
  check("s6", "정산 실패: 상품은 보관함에 그대로, 잔액 그대로", near(l.balance, START - s.price) && l.items[0].status === "IN_STORAGE", `balance ${l.balance} status ${l.items[0]?.status}`);
  await s.page.evaluate(() => sessionStorage.removeItem("voila.opening.fault"));
  await s.page.getByRole("button", { name: /다시 시도/ }).click();
  await s.page.waitForFunction(() => /USDT로 받았습니다/.test(document.querySelector(".v-op")?.innerText || ""), null, { timeout: 5000 });
  l = await s.ledger();
  check("s6", "정산 실패 뒤 다시 시도하면 한 번만 더해진다", near(l.balance, r2(START - s.price + s.fx.sell)) && l.sellbacks === 1, `balance ${l.balance} sellbacks ${l.sellbacks}`);
  await s.context.close();
});

// s7: 연출 중 새로 고침 → 같은 결과를 다시 보여 준다(필수 18)
await run("s7", async () => {
  const s = await session({ fixture: "single:x4" });
  await s.openBtn().click();
  await s.page.waitForSelector(".v-op[data-phase='anticipation']", { timeout: 5000 });
  const mid = await s.ledger();
  await s.page.reload({ waitUntil: "networkidle" });
  await s.page.waitForSelector("[data-open-recover]", { timeout: 15000 }); await s.shot("18a-interrupted");
  const back = await s.ledger();
  check("s7", "새로 고친 뒤: 구매는 한 번, 회차도 한 번만 썼다", back.opens === 1 && back.nonce === s.fx.nonce + 1 && near(back.balance, after(s.fx, s.price)), `opens ${back.opens} nonce ${back.nonce} balance ${back.balance}`);
  check("s7", "못 본 결과: 보관함 기록에 개봉 번호가 있고 아직 본 목록에 없다", back.items.length === 1 && !!back.items[0].openingId && !back.seen.includes(back.items[0].openingId), JSON.stringify({ items: back.items, seen: back.seen }));
  await s.page.locator("[data-open-recover]").click(); await s.settled(); await s.page.waitForTimeout(500); await s.shot("18-recovered");
  const t = await s.text(); const done = await s.ledger();
  check("s7", "다시 보여 준 결과가 처음 정해진 결과와 같다", t.includes(usdt(s.fx.value)) && /새로 뽑지 않았습니다/.test(t), t.slice(0, 120));
  check("s7", "다시 보여 주는 동안 새 구매나 새 회차가 없다", done.opens === 1 && done.nonce === back.nonce && near(done.balance, back.balance) && done.items.length === mid.items.length, `opens ${done.opens} nonce ${done.nonce}`);
  check("s7", "본 뒤에는 본 목록에 오른다", done.seen.includes(done.items[0].openingId));
  await s.closeResult(); await s.page.reload({ waitUntil: "networkidle" }); await s.page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  check("s7", "한 번 본 결과는 다시 고쳐도 또 묻지 않는다", (await s.page.locator("[data-open-recover]").count()) === 0 && (await s.page.locator("[data-open-primary]").count()) === 1);
  await s.context.close();
});

// s8: 연속 열기와 움직임 줄이기. "가장 작은 결과가 이어지다 큰 결과"는 독립 추첨에서 그런 흐름이 나오는 시드를 찾은 것이다
await run("s8", async () => {
  for (const [name, shots] of [["lowLowLowHighHighHigh", [3, 6]], ["fiveLowThenBig", [5, 6]]]) {
    const s = await session({ fixture: "seq:" + name });
    let expect = START; let bad = 0;
    for (let i = 0; i < s.fx.steps.length; i++) {
      await (i === 0 ? s.openBtn() : s.page.locator(".v-op-actions").getByText(/한 번 더 열기/).first()).click();
      for (let k = 0; k < 60 && (await s.ledger()).opens < i + 1; k++) await s.page.waitForTimeout(100);
      await s.settled(); await s.page.waitForTimeout(450);
      expect = after(s.fx.steps[i], s.price, expect);
      const l = await s.ledger();
      if (!near(l.balance, expect) || l.opens !== i + 1) { bad++; check("s8", `${name} ${i + 1}번째 잔액`, false, `${l.balance} != ${expect}, opens ${l.opens}`); }
      if (shots.includes(i + 1)) await s.shot(`21-${name}-${i + 1}`);
    }
    const l = await s.ledger();
    check("s8", `${name}: ${s.fx.steps.map((x) => x.value).join(", ")} 이 차례로 나오고 잔액이 매번 맞다`, bad === 0 && l.opens === s.fx.steps.length && near(l.balance, expect), `balance ${l.balance} expect ${expect}`);
    await s.context.close();
  }
  const s = await session({ fixture: "single:low", reduced: true });
  const t0 = Date.now(); await s.openBtn().click();
  await s.page.waitForSelector(".v-op[data-opening-state='revealed'], .v-op[data-opening-state='settled']", { timeout: 5000 });
  const dt = Date.now() - t0; const hasBox = await s.page.locator(".v-boxw").count();
  await s.settled(); await s.shot("22-reduced-motion");
  check("s8", "움직임 줄이기: 상자 연출 없이 결과부터", hasBox === 0 && dt < 700, `${dt}ms box ${hasBox}`);
  await s.context.close();
});

// s9: 화면 폭 일곱 가지에서 결과 화면(가장 작은 결과, 가장 큰 상품)
await run("s9", async () => {
  for (const view of Object.keys(VIEWS)) for (const kind of ["low", "itemTop"]) {
    const s = await session({ fixture: "single:" + kind, view });
    await s.openBtn().click(); await s.settled(); await s.page.waitForTimeout(kind === "itemTop" ? 2300 : 500);
    await s.page.screenshot({ path: `${out}/bp-${kind === "low" ? "small" : "top"}-${view}.png` });
    const m = await s.page.evaluate(() => {
      const r = (sel) => document.querySelector(sel)?.getBoundingClientRect();
      const btn = r(".v-op-actions .v-btn"); const res = [...document.querySelectorAll(".v-op-result > *")].map((e) => e.getBoundingClientRect());
      const bottom = r(".v-op-bottom"); const top = r(".v-op-top");
      const resTop = Math.min(...res.map((x) => x.top)); const resBottom = Math.max(...res.map((x) => x.bottom)); const resRight = Math.max(...res.map((x) => x.right)); const resLeft = Math.min(...res.map((x) => x.left));
      return { overflow: document.documentElement.scrollWidth > innerWidth, btnVisible: btn && btn.bottom <= innerHeight && btn.top >= 0, btnH: btn?.height, overlapBottom: resBottom > bottom.top + 1, overlapTop: resTop < top.bottom - 1, clipX: resLeft < -0.5 || resRight > innerWidth + 0.5 };
    });
    check("s9", `${view} ${kind}`, !m.overflow && m.btnVisible && !m.overlapBottom && !m.overlapTop && !m.clipX && m.btnH >= 44, JSON.stringify(m));
    await s.context.close();
  }
});

// s10: 움직임 성능. 화면이 실제로 그린 프레임 간격을 잰다. CPU 를 4배 느리게 해 중급 휴대폰에 가깝게 본다.
await run("s10", async () => {
  for (const [label, rate] of [["그대로", 1], ["CPU 4배 느리게", 4]]) {
    const s = await session({ fixture: "single:x4" });
    const cdp = await s.context.newCDPSession(s.page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate });
    await s.page.evaluate(() => { window.__frames = []; let last = performance.now(); const tick = (now) => { window.__frames.push(now - last); last = now; window.__raf = requestAnimationFrame(tick); }; window.__raf = requestAnimationFrame(tick); });
    await armClock(s.page); await s.openBtn().click();
    await s.settled(); const { toResult, toReady } = await readClock(s.page);
    const fr = await s.page.evaluate(() => { cancelAnimationFrame(window.__raf); const a = window.__frames.slice(2); const sorted = [...a].sort((x, y) => x - y); return { n: a.length, avg: a.reduce((p, c) => p + c, 0) / a.length, p95: sorted[Math.floor(sorted.length * 0.95)], max: sorted[sorted.length - 1], over50: a.filter((x) => x > 50).length }; });
    const detail = `프레임 ${fr.n}, 평균 ${fr.avg.toFixed(1)}ms, 95% ${fr.p95.toFixed(1)}ms, 최대 ${fr.max.toFixed(1)}ms, 50ms 초과 ${fr.over50}회, 결과까지 ${toResult}ms, 다음 행동까지 ${toReady}ms`;
    check("s10", `${label}: 95% 프레임이 34ms 이내`, fr.p95 <= 34, detail);
    check("s10", `${label}: 누른 뒤 결과까지 ${rate === 1 ? 1100 : 1600}ms 이내`, toResult <= (rate === 1 ? 1100 : 1600), `결과까지 ${toResult}ms, 다음 행동까지 ${toReady}ms`);
    await s.context.close();
  }
});

// s11: 여러 개 열기(5개, 그 가운데 상품 하나). 같은 상자 연출, 영수증 요약, 그 자리 받기, 다시 열기
await run("s11", async () => {
  const s = await session({ fixture: "seq:withItem" });
  const steps = s.fx.steps; const cost = r2(s.price * steps.length);
  const credited = r2(steps.filter((x) => x.kind === "cash").reduce((a, x) => a + x.value, 0));
  const kept = steps.filter((x) => x.kind !== "cash"); const keptRef = r2(kept.reduce((a, x) => a + x.value, 0));
  const change = r2(credited - cost);
  await s.page.locator(".v-openbar .v-chip").nth(1).click();
  await s.page.locator("[data-open-primary]").click();
  await s.page.waitForSelector(".v-reveal-solo .v-boxw", { timeout: 5000 }); await s.page.waitForTimeout(260); await s.shot("23-multi-opening");
  await s.page.waitForSelector(".v-reveal-result", { timeout: 15000 }); await s.page.waitForTimeout(900); await s.shot("24-multi-result");
  const l = await s.ledger(); const t = await s.text();
  const expect = r2(START - cost + credited);
  check("s11", "5개 열기: 구매 한 건, 기록 다섯, 잔액이 맞다", l.opens === 1 && l.items.length === 5 && near(l.balance, expect), `balance ${l.balance} expect ${expect} items ${l.items.length}`);
  check("s11", "5개 열기: 잔액에 들어온 것과 보관 상품을 나눠 적는다", t.includes("잔액에 반영 " + usdt(credited)) && t.includes(`보관 상품 ${kept.length}개 참고가 ${usdt(keptRef)}`) && t.includes("잔액 변화 " + usdt(Math.abs(change)) + (change < 0 ? " 감소" : " 증가")), t.slice(0, 170));
  // 받을 상품을 이 자리에서 받는다(보관함으로 가지 않는다)
  await s.page.getByRole("button", { name: /받을 상품 받기/ }).click(); await s.page.waitForSelector(".v-sheet"); await s.page.waitForTimeout(300); await s.shot("25-multi-receive");
  await s.page.locator(".v-sheet").getByText(/USDT로 받기/).first().click(); await s.page.locator('[role="alertdialog"] .v-btn').click();
  await s.page.waitForFunction(() => /USDT로 받음/.test(document.querySelector(".v-reveal")?.innerText || ""), null, { timeout: 5000 });
  let m = await s.ledger(); const t2 = await s.text(); const sell = r2(kept.reduce((a, x) => a + x.sell, 0)); const change2 = r2(credited + sell - cost);
  check("s11", "여러 개 결과에서 상품을 USDT 로 받는다: 잔액과 요약이 함께 바뀐다", near(m.balance, r2(expect + sell)) && t2.includes("잔액에 반영 " + usdt(credited + sell)) && t2.includes("잔액 변화 " + usdt(Math.abs(change2)) + (change2 < 0 ? " 감소" : " 증가")), `balance ${m.balance} ${t2.slice(0, 120)}`);
  await s.shot("26-multi-after-receive");
  // 다 받았으니 주 단추가 한 번 더 열기다. 눌러서 실제로 다시 열린다(여러 개 열기 뒤에 갇히지 않는다)
  await s.page.locator("[data-open-again]").click();
  for (let i = 0; i < 60 && (await s.ledger()).opens < 2; i++) await s.page.waitForTimeout(250);
  await s.page.waitForSelector(".v-reveal-result", { timeout: 15000 }); await s.page.waitForTimeout(600);
  m = await s.ledger();
  check("s11", "여러 개 결과에서 한 번 더 열기가 실제로 열린다", m.opens === 2 && m.items.length === 10, `opens ${m.opens} items ${m.items.length}`);
  await s.closeResult();
  await s.page.locator(".v-openbar .v-chip").first().click(); await s.openBtn().click();
  for (let i = 0; i < 60 && (await s.ledger()).opens < 3; i++) await s.page.waitForTimeout(250);
  m = await s.ledger();
  check("s11", "여러 개 결과를 닫은 뒤 박스 화면에서 다시 열린다", m.opens === 3 && m.items.length === 11, `opens ${m.opens} items ${m.items.length}`);
  await s.context.close();

  // 여러 개 열기의 연출 중에 새로 고치면 같은 결과를 다시 보여 준다
  const r = await session({ fixture: "seq:mixed" });
  await r.page.locator(".v-openbar .v-chip").nth(1).click(); await r.page.locator("[data-open-primary]").click();
  await r.page.waitForSelector(".v-reveal-solo .v-boxw", { timeout: 5000 });
  await r.page.reload({ waitUntil: "networkidle" }); await r.page.waitForSelector("[data-open-recover]", { timeout: 15000 });
  const before = await r.ledger();
  await r.page.locator("[data-open-recover]").click(); await r.page.waitForSelector(".v-reveal-result", { timeout: 15000 }); await r.page.waitForTimeout(500);
  const done = await r.ledger();
  check("s11", "여러 개 열기도 새로 고친 뒤 같은 결과를 다시 보여 준다(새 구매 없음)", before.opens === 1 && done.opens === 1 && done.items.length === 5 && near(done.balance, before.balance) && done.nonce === before.nonce, `opens ${done.opens} items ${done.items.length}`);
  await r.context.close();
});

// s12: 소리와 진동을 켠 상태로 열어도 오류가 없다(소리 자체는 사람이 들어야 한다)
await run("s12", async () => {
  const s = await session({ fixture: "single:x4", settings: { openSound: true } });
  await s.openBtn().click(); await s.settled(); await s.page.waitForTimeout(600);
  const audio = await s.page.evaluate(() => typeof (window.AudioContext || window.webkitAudioContext) === "function");
  check("s12", "소리 켬: 콘솔 오류 없이 끝까지 열린다", s.errors.length === 0 && audio, s.errors.join(" | ") || "AudioContext 사용 가능");
  await s.context.close();
  const q = await session({ fixture: "single:low", settings: { openShort: true } });
  await armClock(q.page); await q.openBtn().click(); await q.settled(); const qc = await readClock(q.page);
  check("s12", "짧게 보기 켬: 결과까지 0.7초 이내", qc.toResult <= 700, `결과까지 ${qc.toResult}ms, 다음 행동까지 ${qc.toReady}ms`);
  await q.context.close();
});

// s13: 영어와 중국어, 가장 좁은 폭에서 글이 넘치지 않는다
await run("s13", async () => {
  for (const locale of ["en", "zh"]) for (const kind of ["low", "itemLow", "itemTop"]) {
    const s = await session({ fixture: "single:" + kind, view: "narrow", locale });
    await s.openBtn().click(); await s.settled(); await s.page.waitForTimeout(kind === "itemTop" ? 2300 : 500);
    await s.page.screenshot({ path: `${out}/lang-${locale}-${kind}-narrow.png` });
    const m = await s.page.evaluate(() => {
      const res = [...document.querySelectorAll(".v-op-result > *")].map((e) => e.getBoundingClientRect());
      const bottom = document.querySelector(".v-op-bottom").getBoundingClientRect(); const top = document.querySelector(".v-op-top").getBoundingClientRect();
      const links = [...document.querySelectorAll(".v-op-actions .v-link")].map((e) => e.getBoundingClientRect());
      return { overflow: document.documentElement.scrollWidth > innerWidth, overlapBottom: Math.max(...res.map((x) => x.bottom)) > bottom.top + 1, overlapTop: Math.min(...res.map((x) => x.top)) < top.bottom - 1, clipX: Math.min(...res.map((x) => x.left)) < -0.5 || Math.max(...res.map((x) => x.right)) > innerWidth + 0.5, linksOut: links.some((x) => x.left < 0 || x.right > innerWidth || x.bottom > innerHeight) };
    });
    check("s13", `${locale} ${kind} 320 폭`, !m.overflow && !m.overlapBottom && !m.overlapTop && !m.clipX && !m.linksOut, JSON.stringify(m));
    await s.context.close();
  }
});

// s14: 두 탭. 한 탭에서 연 뒤 다른 탭(이미 떠 있던, 옛 장부를 들고 있는)에서 열어도 앞의 구매가 지워지지 않는다
await run("s14", async () => {
  const s = await session({ fixture: "seq:tenSmall" });
  const other = await s.context.newPage();
  await other.goto(s.page.url(), { waitUntil: "networkidle" });
  await other.waitForSelector("[data-open-primary]:not([disabled])", { timeout: 15000 });
  await s.openBtn().click(); await s.settled();
  // 다른 탭은 새로 고치지 않았다. 그 탭의 기억 속 장부는 열기 전 상태다
  await other.locator("[data-open-primary]").click();
  await other.waitForSelector(".v-op[data-opening-state='settled']", { timeout: 15000 });
  const l = await s.ledger(); const expect = after(s.fx.steps[1], s.price, after(s.fx.steps[0], s.price));
  check("s14", `두 탭에서 한 번씩: 구매 둘, 기록 둘, 회차 둘, 잔액 ${expect}`, l.opens === 2 && l.items.length === 2 && l.nonce === s.fx.nonce + 2 && near(l.balance, expect), `opens ${l.opens} items ${l.items.length} nonce ${l.nonce} balance ${l.balance}`);
  await s.context.close();
});

const failed = results.filter((r) => !r.pass);
fs.writeFileSync(`${out}/qa-results.json`, JSON.stringify({ at: new Date().toISOString(), total: results.length, failed: failed.length, results }, null, 1));
console.log(`\n합계 ${results.length}, 실패 ${failed.length}`);
await browser.close();
process.exit(failed.length ? 1 : 0);
