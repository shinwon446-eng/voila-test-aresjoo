// 지갑 내역(migration-audit/PARITY_ISSUES.md E-06): 박스 열기와 USDT로 받기 거래가 내역에 나오고, 다른 계정의 장부에 든 거래는 나오지 않는다.
//   CAPTURE_BASE=http://localhost:3003 node scripts/capture/flow-wallet-history.mjs [출력 폴더]
// 심는 상태는 states.mjs 의 inventory(보관 상품 둘, 보너스 거래 하나)에 다른 계정의 장부 하나를 더한 것이다.
// 실제 화면에서 상품 하나를 USDT로 받고 박스 하나를 연 뒤, 지갑 내역의 줄을 저장된 장부와 견준다.
import { chromium } from "playwright";
import fs from "node:fs";
import { installState, makeState } from "./states.mjs";

const out = process.argv[2];
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
if (out) fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const check = (name, pass, detail = "") => { results.push({ name, pass: !!pass, detail }); console.log((pass ? "PASS " : "FAIL ") + name + (detail ? "  " + detail : "")); };

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR", reducedMotion: "reduce" });
  const state = await makeState("inventory", "ko");
  // 다른 계정의 장부: 계정 번호 없이 적힌 거래 둘(눈에 띄는 금액). 이 계정의 내역에 나오면 안 된다
  const at = new Date().toISOString();
  state.values["voila.browser-wallet.other-account"] = JSON.stringify({ version: 4, state: { balance: 777.77, cryptoBalance: 777.77, cardBalance: 0, settledDepositRefs: [], transactions: [
    { id: "other-open", type: "open", amountUsdt: -333.33, at, ref: "dollar-gaming x1" }, { id: "other-take", type: "sellback", amountUsdt: 777.77, at, ref: "other-item", itemIds: ["other-item"] }] } });
  await installState(context, state, new URL(base).origin);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
  const stored = () => page.evaluate(() => {
    const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    // 저장된 장부는 줄인 형식일 수 있다(lib/compactStorage). 개발 서버가 내주는 손잡이로 기억 속 모양을 읽는다
    const read = (k) => { try { return window.__voilaLedger ? window.__voilaLedger(k) : JSON.parse(localStorage.getItem(k) || "null")?.state ?? null; } catch { return null; } };
    const mine = read(keys.find((k) => k && k.endsWith("voila.browser-wallet.capture-account")));
    const other = localStorage.getItem(keys.find((k) => k && k.endsWith("voila.browser-wallet.other-account")));
    return { tx: (mine?.transactions ?? []).map((t) => ({ type: t.type, amountUsdt: t.amountUsdt, accountId: t.accountId ?? null })), other };
  });
  const rowsOf = () => page.locator('section[aria-labelledby="wallet-history"] .v-itemrow').evaluateAll((els) => els.map((e) => ({ kind: e.querySelector(".v-card-title")?.textContent?.trim(), amount: e.querySelector(".v-num")?.textContent?.trim() })));

  // 처음: 내역에는 보너스 한 줄
  await page.goto(base + "/ko/wallet", { waitUntil: "networkidle" }); await page.waitForSelector('section[aria-labelledby="wallet-history"]');
  const first = await rowsOf(); const otherBefore = (await stored()).other;
  check("처음 내역은 보너스 한 줄이다", first.length === 1 && first[0].kind === "보너스", JSON.stringify(first));

  // 보관함에서 상품 하나를 USDT로 받는다
  await page.goto(base + "/ko/inventory", { waitUntil: "networkidle" });
  await page.locator(".v-itemrow").first().click(); await page.locator("[data-take-primary]").click();
  await page.waitForSelector('[role="alertdialog"] .v-btn'); await page.waitForTimeout(600);
  await page.locator('[role="alertdialog"] .v-btn').click();
  await page.waitForSelector('[role="alertdialog"]', { state: "detached" }); await page.waitForTimeout(500);
  // 박스 하나를 연다
  await page.goto(base + "/ko/box/dollar-gaming", { waitUntil: "networkidle" });
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])", { timeout: 15000 });
  await page.locator(".v-openbar .v-btn").click();
  // 구매가 장부에 적힐 때까지 기다린다(연출을 끝까지 보지 않아도 거래는 이미 적혀 있다)
  // 저장된 장부는 줄인 형식일 수 있어 글자를 찾지 않고 풀어서 본다(lib/compactStorage, 개발 서버의 손잡이)
  await page.waitForFunction(() => { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.endsWith("voila.browser-wallet.capture-account") && (window.__voilaLedger?.(k)?.transactions ?? []).some((t) => t?.type === "open")) return true; } return false; }, null, { timeout: 20000 });
  await page.waitForTimeout(600);

  const ledger = await stored();
  const unstamped = ledger.tx.filter((t) => t.accountId === null).map((t) => t.type);
  check("저장된 장부에 받기와 열기 거래가 계정 번호 없이 적혀 있다", unstamped.includes("sellback") && unstamped.includes("open"), JSON.stringify(ledger.tx));

  await page.goto(base + "/ko/wallet", { waitUntil: "networkidle" }); await page.waitForSelector('section[aria-labelledby="wallet-history"] .v-itemrow'); await page.waitForTimeout(300);
  const rows = await rowsOf(); if (out) await page.screenshot({ path: `${out}/wallet-history.png`, fullPage: true });
  const kinds = rows.map((r) => r.kind);
  check("내역에 박스 열기 줄이 나온다(금액은 음수)", rows.some((r) => r.kind === "박스 열기" && r.amount.includes("-")), JSON.stringify(rows));
  // E-14: 음수의 빼기 표시는 통화 기호 앞에 온다(-$1). 기호 뒤에 오지 않는다($-1)
  const negative = rows.filter((r) => r.amount.includes("-"));
  check("음수 금액은 빼기 표시가 통화 기호 앞에 온다", negative.length > 0 && negative.every((r) => /^-\$\d/.test(r.amount)), JSON.stringify(rows.map((r) => r.amount)));
  check("내역에 USDT로 받기 줄이 나온다(받은 금액 그대로)", rows.some((r) => r.kind === "USDT로 받기" && (r.amount === "+$950" || r.amount === "+$521.55")), JSON.stringify(rows));
  check("보너스 줄은 그대로 있다", rows.filter((r) => r.kind === "보너스" && r.amount === "+$10,000").length === 1, JSON.stringify(rows));
  check("내역의 줄 수가 이 계정의 장부에 든 거래 수와 같다", rows.length === ledger.tx.length, `화면 ${rows.length}줄, 장부 ${ledger.tx.length}건: ${kinds.join(", ")}`);
  const text = (await page.locator("main").innerText()).replace(/\s+/g, " ");
  check("다른 계정의 장부에 든 거래(333.33, 777.77)는 나오지 않는다", !text.includes("333.33") && !text.includes("777.77"));
  check("다른 계정의 저장된 장부는 바뀌지 않았다", (await stored()).other === otherBefore);
  // 새로 보이는 줄을 눌러도 거래 시트가 열린다
  await page.locator('section[aria-labelledby="wallet-history"] .v-itemrow', { hasText: "박스 열기" }).first().click();
  await page.waitForSelector(".v-sheet"); if (out) await page.screenshot({ path: `${out}/wallet-history-open-row.png` });
  const sheet = (await page.locator(".v-sheet").innerText()).replace(/\s+/g, " ");
  check("박스 열기 줄을 누르면 그 거래의 시트가 열린다(제목과 금액, 금액도 -$ 꼴)", sheet.includes("박스 열기") && /금액 -\$\d/.test(sheet) && !sheet.includes("$-"), sheet.slice(0, 120));
  check("콘솔 오류 없음", errors.length === 0, errors.join(" | "));
  await context.close();
} catch (e) { check("시나리오 실행", false, String(e).slice(0, 300)); }

// 깨진 저장값(migration-audit 의 qa/R2_CYCLE3_claude.md F-08): 시각이 없거나 틀린 줄, 금액이 숫자가 아닌 줄, 모르는 종류의 줄, 낯선 상태의 줄이
// 보통의 줄 사이에 섞여 있어도 지갑 화면이 오류 화면이 되지 않는다. 읽을 수 있는 줄은 보이고, 저장된 값은 그대로다.
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR", reducedMotion: "reduce" });
  const state = await makeState("funded", "ko");
  const key = "voila.browser-wallet.capture-account";
  const wallet = JSON.parse(state.values[key]);
  const day = (n) => new Date(Date.now() - n * 86400000).toISOString();
  const seeded = [
    { id: "ok-open", type: "open", amountUsdt: -3, at: day(1), ref: "dollar-gaming x1" },
    { id: "bad-date", type: "open", amountUsdt: -5, at: "not-a-date", ref: "dollar-gaming x1" },
    { id: "ok-take", type: "sellback", amountUsdt: 12.5, at: day(2), ref: "ok-item", itemIds: ["ok-item"] },
    { id: "no-date", type: "sellback", amountUsdt: 3, ref: "old-item", itemIds: ["old-item"] },
    { id: "text-amount", type: "open", amountUsdt: "abc", at: day(3), ref: "dollar-gaming x1" },
    { id: "no-amount", type: "open", at: day(3), ref: "dollar-gaming x1" },
    { id: "unknown-type", type: "mystery", amountUsdt: 7, at: day(3) },
    { id: "odd-status", type: "withdraw", accountId: "capture-account", amountUsdt: -9, status: "WEIRD", at: day(4) },
  ];
  wallet.state.transactions = [...seeded, ...wallet.state.transactions];
  state.values[key] = JSON.stringify(wallet);
  await installState(context, state, new URL(base).origin);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  await page.goto(base + "/ko/wallet", { waitUntil: "networkidle" }); await page.waitForTimeout(800);
  if (out) await page.screenshot({ path: `${out}/wallet-history-malformed.png`, fullPage: true });
  const text = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  check("깨진 줄이 있어도 지갑 화면이 뜬다(오류 화면이 아니다)", !text.includes("화면을 불러오지 못했습니다") && (await page.locator('section[aria-labelledby="wallet-history"]').count()) === 1, text.slice(0, 160));
  const rows = await page.locator('section[aria-labelledby="wallet-history"] .v-itemrow').evaluateAll((els) => els.map((e) => ({ kind: e.querySelector(".v-card-title")?.textContent?.trim(), meta: e.querySelector(".v-small")?.textContent?.trim(), amount: e.querySelector(".v-num")?.textContent?.trim() })));
  const has = (kind, amount) => rows.some((r) => r.kind === kind && r.amount === amount);
  check("보통의 줄은 그대로 보인다(보너스, 박스 열기, USDT로 받기)", has("보너스", "+$10,000") && has("박스 열기", "-$3") && has("USDT로 받기", "+$12.5"), JSON.stringify(rows));
  check("시각만 깨진 줄은 보이고(종류와 금액은 읽을 수 있다) 시각 자리는 비어 있다", rows.some((r) => r.kind === "박스 열기" && r.amount === "-$5" && r.meta === "") && rows.some((r) => r.kind === "USDT로 받기" && r.amount === "+$3" && r.meta === ""), JSON.stringify(rows));
  check("시각 없는 줄은 맨 뒤에 놓인다", rows.slice(-2).every((r) => r.meta === "") && rows.slice(0, -2).every((r) => r.meta !== ""), JSON.stringify(rows.map((r) => r.meta)));
  check("낯선 상태의 줄은 보이되 상태 글은 적지 않는다(문구 키가 그대로 드러나지 않는다)", rows.some((r) => r.kind === "출금" && r.amount === "-$9" && !/WEIRD|wallet\.status/.test(r.meta)), JSON.stringify(rows.find((r) => r.kind === "출금")));
  check("금액이나 종류를 읽을 수 없는 줄은 내역에 넣지 않는다(줄 여섯, NaN 이나 문구 키가 보이지 않는다)", rows.length === 6 && !/NaN|mystery|wallet\.type|wallet\.status/.test(text), `줄 ${rows.length}개`);
  // 시각 없는 줄과 낯선 상태의 줄을 눌러도 시트가 열린다
  await page.locator('section[aria-labelledby="wallet-history"] .v-itemrow', { hasText: "-$5" }).click(); await page.waitForSelector(".v-sheet");
  let sheet = (await page.locator(".v-sheet").innerText()).replace(/\s+/g, " ");
  check("시각 없는 줄의 시트가 열린다(제목과 금액)", sheet.includes("박스 열기") && sheet.includes("금액 -$5"), sheet.slice(0, 100));
  await page.locator(".v-sheet-close").click(); await page.waitForSelector(".v-sheet", { state: "detached" });
  await page.locator('section[aria-labelledby="wallet-history"] .v-itemrow', { hasText: "-$9" }).click(); await page.waitForSelector(".v-sheet");
  sheet = (await page.locator(".v-sheet").innerText()).replace(/\s+/g, " ");
  check("낯선 상태의 줄의 시트가 열린다(상태 행은 적지 않는다)", sheet.includes("출금") && sheet.includes("금액 -$9") && !/WEIRD|wallet\.status/.test(sheet), sheet.slice(0, 100));
  // 저장된 값은 고쳐 쓰지 않는다: 깨진 줄도 심은 그대로 남아 있다
  const kept = await page.evaluate(() => { const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i)); const key = keys.find((k) => k && k.endsWith("voila.browser-wallet.capture-account")); return (window.__voilaLedger ? window.__voilaLedger(key) : JSON.parse(localStorage.getItem(key)).state).transactions; });
  // 칸의 순서는 보지 않는다: 줄인 장부(lib/compactStorage)를 풀면 값은 같고 칸의 차례만 다를 수 있다
  const sorted = (value) => JSON.stringify(value, (_, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((key) => [key, v[key]])) : v));
  const same = seeded.every((s) => { const k = kept.find((x) => x.id === s.id); return !!k && sorted(k) === sorted(s); });
  check("저장된 장부의 줄은 깨진 것까지 심은 그대로다", same && kept.length === seeded.length + 1, `저장 ${kept.length}건`);
  check("콘솔 오류 없음(깨진 줄)", errors.length === 0, errors.join(" | "));
  await context.close();
} catch (e) { check("깨진 줄 시나리오 실행", false, String(e).slice(0, 300)); }

await browser.close();
const failed = results.filter((r) => !r.pass);
if (out) fs.writeFileSync(`${out}/wallet-history-results.json`, JSON.stringify(results, null, 2));
console.log(`\n검사 ${results.length}개, 통과 ${results.length - failed.length}, 실패 ${failed.length}`);
process.exit(failed.length ? 1 : 0);
