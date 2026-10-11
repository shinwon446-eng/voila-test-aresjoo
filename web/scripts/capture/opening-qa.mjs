// 개봉 경험 구조 검수. 실제 화면을 눌러 필수 상태를 찍고, 돈과 상태는 숫자로 확인한다.
//   node scripts/capture/opening-qa.mjs <출력 폴더> [--only s1,s2] [--view mobile]
// 결과는 고정값(opening-fixtures.json)의 시드와 회차를 실제 계산식에 넣어 나온 것이다. 결과를 바꾸는 코드는 없다.
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

async function session({ slug = "dollar-apple", fixture = "single:small", view = "mobile", balance = null, reduced = false, settings = null, locale = "ko" }) {
  const [w, h] = VIEWS[view]; const touch = view !== "desktop";
  const context = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: touch ? 2 : 1, isMobile: touch, hasTouch: touch, locale: locale === "en" ? "en-US" : locale === "zh" ? "zh-CN" : "ko-KR", reducedMotion: reduced ? "reduce" : "no-preference" });
  const [fk, fn] = fixture.split(":");
  const fx = fixtures.boxes[slug][fk === "seq" ? "sequences" : "single"][fn];
  const state = await makeState("funded", locale);
  state.values["gachaflix.fair"] = wrap({ serverSeed: fixtures.serverSeed, serverSeedHash: fixtures.serverSeedHash, clientSeed: fx.clientSeed, nonce: fx.nonce });
  if (settings) state.values["gachaflix.settings"] = wrap({ muted: true, openSound: false, openShort: false, autoTake: false, lastReceive: null, ...settings });
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
    return { balance: w?.balance ?? null, opens: (w?.transactions ?? []).filter((t) => t.type === "open").length, sellbacks: (w?.transactions ?? []).filter((t) => t.type === "sellback").length, items: (inv?.items ?? []).map((i) => ({ id: i.id, itemId: i.itemId, status: i.status })), nonce: fair?.nonce ?? null, journal: (j?.entries ?? []).map((e) => ({ id: e.id, revealed: !!e.revealedAt })) };
  });
  const shot = (name) => page.screenshot({ path: `${out}/${name}-${view}.png` });
  const openBtn = () => page.locator("[data-open-primary]").first();
  const settled = () => page.waitForSelector(".v-op[data-opening-state='settled']", { timeout: 15000 });
  const confirmIfAsked = async () => { const c = page.locator('[role="alertdialog"] .v-btn'); if (await c.count()) await c.first().click(); };
  const text = () => page.evaluate(() => (document.querySelector(".v-op")?.innerText || "").replace(/\s+/g, " "));
  return { context, page, fx, errors, ledger, shot, openBtn, settled, confirmIfAsked, text, w, h };
}
const run = async (id, fn) => { if (only.length && !only.includes(id)) return; try { await fn(); } catch (e) { check(id, "시나리오 실행", false, String(e).slice(0, 220)); } };

// s1: 필수 화면 1~3, 15 (박스 고르기, 고른 박스, 구매 확인, 다시 열 준비)
await run("s1", async () => {
  const s = await session({ slug: "vault-gold", fixture: "single:small" });
  await s.page.goto(`${base}/ko`, { waitUntil: "networkidle" }); await s.shot("01-box-selection");
  await s.page.goto(`${base}/ko/box/vault-gold`, { waitUntil: "networkidle" }); await s.page.waitForSelector(".v-openbar .v-btn:not([disabled])"); await s.shot("02-selected-box");
  await s.openBtn().click(); await s.page.waitForSelector('[role="alertdialog"]'); await s.shot("03-purchase-confirmation");
  const before = await s.ledger();
  await s.page.locator('[role="alertdialog"] .v-link').first().click();
  const after = await s.ledger();
  check("s1", "확인창에서 취소하면 돈이 움직이지 않는다", near(before.balance, after.balance) && after.opens === before.opens, `${before.balance} → ${after.balance}`);
  await s.openBtn().click(); await s.confirmIfAsked(); await s.settled();
  const done = await s.ledger();
  check("s1", "50 USDT 박스 작은 결과: 잔액 = 10000 - 50 + 25", near(done.balance, 9975), String(done.balance));
  await s.page.locator(".v-op-tool[aria-label]").last().click(); await s.page.waitForSelector(".v-op", { state: "detached" });
  await s.shot("15-ready-again");
  check("s1", "닫으면 같은 박스 화면에서 다시 열 수 있다", await s.openBtn().isEnabled());
  check("s1", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// s2: 결과 넷(작은, 본전 근처, 늘어남, 드문 큰 결과)과 돈 계산
await run("s2", async () => {
  for (const [label, kind, expectBalance] of [["09-small", "small", 9999.5], ["10-break-even", "near", 9999.99], ["11-positive", "x5", 10004], ["12-exceptional", "physicalTop", 9999]]) {
    const s = await session({ fixture: "single:" + kind });
    await s.openBtn().click(); await s.settled(); await s.page.waitForTimeout(700); await s.shot(label);
    const l = await s.ledger(); const t = await s.text();
    check("s2", `${kind}: 잔액 ${expectBalance}`, near(l.balance, expectBalance), String(l.balance));
    check("s2", `${kind}: 구매 한 번, 보관함 기록 하나`, l.opens === 1 && l.items.length === 1, `opens ${l.opens} items ${l.items.length}`);
    if (kind === "small" || kind === "near") check("s2", `${kind}: 줄었다고 적는다`, /감소/.test(t) && !/증가/.test(t), t.slice(0, 90));
    if (kind === "x5") check("s2", "x5: 늘었다고 적는다", /증가/.test(t) && !/감소/.test(t), t.slice(0, 90));
    if (kind === "physicalTop") check("s2", "physicalTop: 보관 상태와 받는 방법 선택", /보관함에 넣었습니다/.test(t) && /받는 방법 선택/.test(t), t.slice(0, 110));
    check("s2", `${kind}: 가로 넘침 없음`, await s.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await s.context.close();
  }
});

// s3: 연달아 두 번 누르기, 결과 직후 누르기, 건너뛰기
await run("s3", async () => {
  let s = await session({ fixture: "seq:tenSmall" });
  await s.page.evaluate(() => { const b = document.querySelector("[data-open-primary]"); b.click(); b.click(); b.click(); });
  await s.settled();
  let l = await s.ledger();
  check("s3", "열기를 연달아 세 번 눌러도 구매는 한 번", l.opens === 1 && l.items.length === 1 && near(l.balance, 9999.5), `opens ${l.opens} items ${l.items.length} balance ${l.balance}`);
  await s.context.close();

  s = await session({ fixture: "seq:tenSmall" });
  // 결과가 뜬 직후(단추가 아직 잠긴 동안) 다시 열기를 누른다. 단추가 나타나는 그 순간을 화면 안에서 잡는다.
  await s.page.evaluate(() => {
    window.__earlyClicks = 0;
    const obs = new MutationObserver(() => {
      const b = document.querySelector("[data-open-again]");
      if (b && document.querySelector(".v-op[data-opening-state='revealed']")) { window.__earlyClicks += 1; b.click(); b.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); b.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
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
  await s.context.close();

  s = await session({ fixture: "single:x5" });
  const t0 = Date.now();
  await s.openBtn().click();
  await s.page.waitForSelector(".v-op-skip .v-link", { timeout: 5000 }); await s.shot("04-opening-skip-visible");
  await s.page.locator(".v-op-skip .v-link").click();
  await s.page.waitForSelector(".v-op[data-opening-state='revealed'], .v-op[data-opening-state='settled']", { timeout: 5000 });
  const dt = Date.now() - t0;
  await s.settled(); l = await s.ledger(); const t = await s.text();
  check("s3", "건너뛰어도 결과와 잔액이 같다(5 USDT, 10004)", near(l.balance, 10004) && /5 USDT/.test(t), `balance ${l.balance}`);
  check("s3", "건너뛰기는 바로 결과로 간다", dt < 900, dt + "ms");
  await s.context.close();
});

// s4: 그 자리에서 USDT 로 받기(필수 13, 14), 두 번 눌러도 한 번만
await run("s4", async () => {
  const s = await session({ fixture: "single:x2" });
  await s.openBtn().click(); await s.settled();
  await s.page.getByRole("button", { name: /받는 방법 선택/ }).click();
  await s.page.waitForSelector(".v-op-choice"); await s.shot("13a-receive-method");
  await s.page.locator(".v-op-choice").last().click();
  await s.shot("13b-receive-usdt-selected");
  await s.page.evaluate(() => { const b = document.querySelector(".v-sheet .v-btn"); b.click(); b.click(); });
  await s.page.waitForFunction(() => /USDT로 받았습니다/.test(document.querySelector(".v-op")?.innerText || ""), null, { timeout: 5000 });
  await s.page.waitForTimeout(700); await s.shot("13-instant-usdt-conversion");
  const l = await s.ledger(); const t = await s.text();
  check("s4", "2 USDT 상품을 1.9 USDT 로 받는다: 잔액 10000 - 1 + 1.9", near(l.balance, 10000.9), String(l.balance));
  check("s4", "받기를 두 번 눌러도 한 번만 더해진다", l.sellbacks === 1 && l.items[0].status === "SOLD", `sellbacks ${l.sellbacks} status ${l.items[0]?.status}`);
  check("s4", "받은 뒤 화면이 금액과 차이를 적는다", /1\.9 USDT/.test(t) && /증가/.test(t), t.slice(0, 120));
  check("s4", "받은 뒤 주 단추는 한 번 더 열기", await s.page.locator("[data-open-again]").count() === 1);
  await s.shot("14-updated-balance");
  await s.context.close();
});

// s5: 자동으로 USDT 로 받기(사용자가 켠 경우), 20배 이상은 자동으로 받지 않는다
await run("s5", async () => {
  let s = await session({ fixture: "single:x2", settings: { autoTake: true } });
  await s.openBtn().click(); await s.settled(); await s.page.waitForTimeout(600); await s.shot("13c-auto-take");
  let l = await s.ledger(); let t = await s.text();
  check("s5", "자동 받기 켬: 2 USDT 상품이 자동으로 1.9 USDT", near(l.balance, 10000.9) && /자동으로 USDT로 받았습니다/.test(t), `balance ${l.balance}`);
  await s.context.close();
  s = await session({ fixture: "single:physicalTop", settings: { autoTake: true } });
  await s.openBtn().click(); await s.settled(); await s.page.waitForTimeout(400);
  l = await s.ledger(); t = await s.text();
  check("s5", "자동 받기 켬: 낸 값의 20배 이상은 자동으로 받지 않고 보관한다", near(l.balance, 9999) && l.items[0].status === "IN_STORAGE" && /받는 방법 선택/.test(t), `balance ${l.balance} status ${l.items[0]?.status}`);
  await s.context.close();
  s = await session({ fixture: "single:x2" });
  await s.openBtn().click(); await s.settled(); l = await s.ledger();
  check("s5", "자동 받기 끔(기본): 상품을 그대로 보관한다", near(l.balance, 9999) && l.items[0].status === "IN_STORAGE", `balance ${l.balance}`);
  await s.page.locator(".v-op-tool").first().click(); await s.page.waitForSelector(".v-op-toggle"); await s.shot("19-opening-settings");
  await s.page.locator(".v-op-toggle").nth(2).click(); await s.page.waitForSelector('[role="alertdialog"]'); await s.shot("20-auto-take-confirm");
  const on = await s.page.evaluate(() => JSON.parse(localStorage.getItem("gachaflix.settings") || "{}")?.state?.autoTake);
  check("s5", "자동 받기는 확인을 누르기 전에는 켜지지 않는다", on !== true, String(on));
  await s.context.close();
});

// s6: 잔액 부족(필수 16), 구매 실패, 정산 대기(필수 17)와 실패
await run("s6", async () => {
  let s = await session({ balance: 0.25 });
  await s.shot("16-insufficient-balance");
  check("s6", "잔액이 모자라면 열기 단추가 충전으로 바뀐다", (await s.page.locator("[data-open-primary]").count()) === 0 && /충전/.test(await s.page.locator(".v-openbar .v-btn").innerText()));
  await s.context.close();

  s = await session({ fixture: "single:small" });
  await s.page.evaluate(() => sessionStorage.setItem("voila.opening.fault", "purchase-failed"));
  await s.openBtn().click(); await s.page.waitForSelector(".v-line--fail", { timeout: 5000 }); await s.shot("16b-purchase-failed");
  let l = await s.ledger();
  check("s6", "구매 실패: 돈이 움직이지 않고 결과도 없다", near(l.balance, 10000) && l.opens === 0 && l.items.length === 0 && l.nonce === s.fx.nonce, `balance ${l.balance} nonce ${l.nonce}`);
  await s.page.evaluate(() => sessionStorage.removeItem("voila.opening.fault"));
  await s.openBtn().click(); await s.settled(); l = await s.ledger();
  check("s6", "구매 실패 뒤 다시 누르면 정상으로 열린다", l.opens === 1 && near(l.balance, 9999.5), `balance ${l.balance}`);
  await s.context.close();

  s = await session({ fixture: "single:x2" });
  await s.openBtn().click(); await s.settled();
  await s.page.evaluate(() => sessionStorage.setItem("voila.opening.fault", "settle-pending"));
  await s.page.getByRole("button", { name: /받는 방법 선택/ }).click(); await s.page.locator(".v-op-choice").last().click(); await s.page.locator(".v-sheet .v-btn").click();
  await s.page.waitForFunction(() => /기다리는 중/.test(document.querySelector(".v-op")?.innerText || ""), null, { timeout: 5000 }); await s.shot("17-pending-settlement");
  l = await s.ledger(); let t = await s.text();
  check("s6", "정산 대기: 받았다고 말하지 않고 잔액도 그대로", near(l.balance, 9999) && !/USDT로 받았습니다/.test(t), `balance ${l.balance}`);
  await s.context.close();

  s = await session({ fixture: "single:x2" });
  await s.openBtn().click(); await s.settled();
  await s.page.evaluate(() => sessionStorage.setItem("voila.opening.fault", "settle-failed"));
  await s.page.getByRole("button", { name: /받는 방법 선택/ }).click(); await s.page.locator(".v-op-choice").last().click(); await s.page.locator(".v-sheet .v-btn").click();
  await s.page.waitForSelector(".v-op .v-line--fail", { timeout: 5000 }); await s.shot("17b-settlement-failed");
  l = await s.ledger();
  check("s6", "정산 실패: 상품은 보관함에 그대로, 잔액 그대로", near(l.balance, 9999) && l.items[0].status === "IN_STORAGE", `balance ${l.balance} status ${l.items[0]?.status}`);
  await s.page.evaluate(() => sessionStorage.removeItem("voila.opening.fault"));
  await s.page.getByRole("button", { name: /다시 시도/ }).click();
  await s.page.waitForFunction(() => /USDT로 받았습니다/.test(document.querySelector(".v-op")?.innerText || ""), null, { timeout: 5000 });
  l = await s.ledger();
  check("s6", "정산 실패 뒤 다시 시도하면 한 번만 더해진다", near(l.balance, 10000.9) && l.sellbacks === 1, `balance ${l.balance} sellbacks ${l.sellbacks}`);
  await s.context.close();
});

// s7: 연출 중 새로 고침 → 같은 결과를 다시 보여 준다(필수 18)
await run("s7", async () => {
  const s = await session({ fixture: "single:x5" });
  await s.openBtn().click();
  await s.page.waitForSelector(".v-op[data-phase='anticipation']", { timeout: 5000 });
  const mid = await s.ledger();
  await s.page.reload({ waitUntil: "networkidle" });
  await s.page.waitForSelector("[data-open-recover]", { timeout: 15000 }); await s.shot("18a-interrupted");
  const back = await s.ledger();
  check("s7", "새로 고친 뒤: 구매는 한 번, 회차도 한 번만 썼다", back.opens === 1 && back.nonce === s.fx.nonce + 1 && near(back.balance, 10004), `opens ${back.opens} nonce ${back.nonce} balance ${back.balance}`);
  check("s7", "못 본 결과가 기록장에 남아 있다", back.journal.length === 1 && back.journal[0].revealed === false, JSON.stringify(back.journal));
  await s.page.locator("[data-open-recover]").click(); await s.settled(); await s.page.waitForTimeout(500); await s.shot("18-recovered");
  const t = await s.text(); const after = await s.ledger();
  check("s7", "다시 보여 준 결과가 처음 정해진 결과와 같다(5 USDT)", /5 USDT/.test(t) && /새로 뽑지 않았습니다/.test(t), t.slice(0, 120));
  check("s7", "다시 보여 주는 동안 새 구매나 새 회차가 없다", after.opens === 1 && after.nonce === back.nonce && near(after.balance, back.balance) && after.items.length === mid.items.length, `opens ${after.opens} nonce ${after.nonce}`);
  check("s7", "본 뒤에는 기록장이 봤음으로 바뀐다", after.journal[0].revealed === true);
  await s.context.close();
});

// s8: 연속 열기(작음 셋 뒤 큼 셋)와 움직임 줄이기
await run("s8", async () => {
  let s = await session({ fixture: "seq:lowLowLowHighHighHigh" });
  let expect = 10000;
  for (let i = 0; i < 6; i++) {
    await (i === 0 ? s.openBtn() : s.page.locator(".v-op-actions").getByText(/한 번 더 열기/).first()).click();
    await s.page.waitForFunction((n) => { const j = JSON.parse(localStorage.getItem("voila.opening-journal") || "null"); return (j?.state?.entries ?? []).length === n; }, i + 1, { timeout: 15000 });
    await s.settled();
    const mult = s.fx.multiples[i]; const l = await s.ledger();
    // 2배는 디지털 기프트카드라 잔액에 더해지지 않고 보관된다
    expect = +(expect - 1 + (mult === 2 ? 0 : mult)).toFixed(2);
    if (!near(l.balance, expect) || l.opens !== i + 1) check("s8", `연속 ${i + 1}번째(${mult}배) 잔액`, false, `${l.balance} != ${expect}, opens ${l.opens}`);
    if (i === 2 || i === 5) await s.shot(`21-sequence-${i + 1}`);
  }
  const l = await s.ledger();
  check("s8", "여섯 번 연속: 구매 여섯 번, 잔액이 매번 맞다", l.opens === 6 && near(l.balance, expect), `balance ${l.balance} expect ${expect}`);
  await s.context.close();

  s = await session({ fixture: "single:small", reduced: true });
  const t0 = Date.now(); await s.openBtn().click();
  await s.page.waitForSelector(".v-op[data-opening-state='revealed'], .v-op[data-opening-state='settled']", { timeout: 5000 });
  const dt = Date.now() - t0; const hasBox = await s.page.locator(".v-boxw").count();
  await s.settled(); await s.shot("22-reduced-motion");
  check("s8", "움직임 줄이기: 상자 연출 없이 결과부터", hasBox === 0 && dt < 700, `${dt}ms box ${hasBox}`);
  await s.context.close();
});

// s9: 화면 폭 일곱 가지에서 결과 화면(작은 결과, 큰 상품)
await run("s9", async () => {
  for (const view of Object.keys(VIEWS)) for (const kind of ["small", "physicalTop"]) {
    const s = await session({ fixture: "single:" + kind, view });
    await s.openBtn().click(); await s.settled(); await s.page.waitForTimeout(kind === "physicalTop" ? 1900 : 500);
    await s.page.screenshot({ path: `${out}/bp-${kind}-${view}.png` });
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

const failed = results.filter((r) => !r.pass);
fs.writeFileSync(`${out}/qa-results.json`, JSON.stringify({ at: new Date().toISOString(), total: results.length, failed: failed.length, results }, null, 1));
console.log(`\n합계 ${results.length}, 실패 ${failed.length}`);
await browser.close();
process.exit(failed.length ? 1 : 0);
