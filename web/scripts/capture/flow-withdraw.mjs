// 출금 신청과 취소의 돈(migration-audit/PARITY_ISSUES.md E-01, CYCLE1_codex.md C1-P1-01, CYCLE3_codex.md C3-P1-01 과 C3-P2-01).
// 실제 화면을 눌러 출금을 신청하고, 장부의 숫자와 화면의 글로 확인한다.
//   CAPTURE_BASE=http://localhost:3003 node scripts/capture/flow-withdraw.mjs [출력 폴더]
// 서비스는 접수했는데 이쪽 잔액에서 차감하지 못한 요청은 "장부 금액 0 인 출금 줄"로 남는다(신청한 금액은 표시에만).
// 취소되거나 실패해도 환불될 것이 없고, 새 출금을 막지 않고, 내역과 시트에서 차감한 출금처럼 읽히지 않는다.
//   a: 보통의 길. 신청하면 금액만큼 차감되고, 지갑 내역에서 취소하면 그만큼만 한 번 돌아온다.
//   b: 차감하지 못했고 취소는 확인된 경우. 줄이 취소됨으로 끝난다. 잔액은 그대로다. 끝난 뒤의 내역과 시트의 글.
//   c: 차감하지 못했고 취소는 실패한 경우(72시간 대기). 줄이 열린 채 남고 입력 화면이 알린다. 새 출금은 막히지 않는다.
//      열려 있는 동안의 내역과 시트의 글, 지갑 내역에서 취소(환불 없음), 끝난 뒤의 글.
//   d: c 와 같되 인증 앱 길(처리 대기). 이 상태의 열린 요청도 지갑 내역에서 취소할 수 있다.
//   e: 서비스가 그 접수 번호를 모르는 경우. 지갑의 상태 확인이 그 줄을 환불 없이 실패로 닫는다. 그 뒤 새 출금을 끝까지 한다.
//   f: 상태 확인이 계속 실패하는 경우(일시적인 실패). 줄은 닫히지 않고 열린 채 남는다. 그래도 새 출금을 끝까지 할 수 있다.
// 이 사이트의 계정 서비스는 브라우저 안의 시험 장부다(실제 돈과 전송은 없다). 이메일 인증 코드는 그 시험 장부에서 읽는다.
// 차감 실패는 화면만으로 일으킬 수 없어서, 개발 서버의 모듈 캐시에서 지갑 스토어를 찾아 접수 직후 잔액을 0 으로 바꾼다.
// 취소와 조회의 실패는 그 요청을 이 브라우저 안에서 막아 만든다(개발 서버에서만 된다. 앱 소스는 건드리지 않는다).
import { chromium } from "playwright";
import fs from "node:fs";
import { installState, makeState } from "./states.mjs";

const out = process.argv[2];
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
if (out) fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const check = (scenario, name, pass, detail = "") => { results.push({ scenario, name, pass: !!pass, detail }); console.log((pass ? "PASS " : "FAIL ") + scenario + " " + name + (detail ? "  " + detail : "")); };
const near = (a, b) => Math.abs(a - b) < 0.005;
const ADDRESS = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"; const AMOUNT = 50;
const NOTICE = "잔액이 바뀌어 출금을 마치지 못했습니다. 잔액에서 차감한 것은 없습니다. 출금 요청의 취소는 확인하지 못했습니다. 지갑 내역에서 그 요청을 확인하고 취소할 수 있습니다.";
const NOT_DEBITED = "잔액에서 차감하지 않은 출금 요청입니다. 이 요청으로 잔액은 바뀌지 않았습니다.";
const CANCEL_UNDEBITED = "잔액에서 차감하지 않은 출금 요청입니다. 취소해도 잔액은 바뀌지 않습니다.";
const TAG = "차감하지 않음";

/** preset: funded 는 인증 앱이 없는 계정(이메일 인증 길, 72시간 대기), security 는 인증 앱을 연결한 계정(처리 대기) */
async function session(preset = "funded") {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR", reducedMotion: "reduce" });
  await installState(context, await makeState(preset, "ko"), new URL(base).origin);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
  await page.goto(base + "/ko/wallet/withdraw", { waitUntil: "networkidle" });
  /** 저장된 장부: 이 계정의 지갑과, 계정 서비스(시험 장부)가 가진 출금 접수 */
  const ledger = () => page.evaluate(() => {
    const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
    // 저장된 지갑은 줄인 형식일 수 있다(lib/compactStorage). 개발 서버가 내주는 손잡이로 기억 속 모양을 읽는다
    const walletKey = keys.find((k) => k && k.includes("voila.browser-wallet.") && !k.endsWith(".guest"));
    const w = (window.__voilaLedger ? window.__voilaLedger(walletKey) : read(walletKey)?.state) ?? {};
    const account = (read(keys.find((k) => k && k.endsWith("voila.browser-accounts.v1"))) ?? [])[0] ?? {};
    return { crypto: w.cryptoBalance ?? null, balance: w.balance ?? null,
      withdraws: (w.transactions ?? []).filter((t) => t.type === "withdraw").map((t) => ({ amountUsdt: t.amountUsdt, requestedUsdt: t.requestedUsdt ?? null, status: t.status, serverId: t.serverId, netUsdt: t.netUsdt ?? null, extra: Object.keys(t).filter((k) => k === "debited") })),
      service: Object.values(account.withdrawals ?? {}).map((r) => r.status), serviceIds: Object.keys(account.withdrawals ?? {}), code: account.challenge?.code ?? null };
  });
  const fillForm = async () => { await page.locator("form .v-input").nth(0).fill(ADDRESS); await page.locator("form .v-input").nth(1).fill(String(AMOUNT)); };
  /** 금액과 주소를 넣고, 인증 코드를 넣은 데까지 간다(마지막 단추는 누르지 않는다) */
  const toFinalStep = async () => {
    if (preset === "funded") await page.getByText("이메일 인증으로 출금", { exact: false }).click();
    await page.waitForSelector("form .v-input");
    await fillForm();
    await page.locator('form button[type="submit"]').click();
    await page.getByRole("button", { name: "인증하고 출금" }).click();
    if (preset === "funded") { await page.getByRole("button", { name: "코드 보내기" }).click(); await page.waitForSelector("form .v-input"); await page.locator("form .v-input").fill((await ledger()).code); }
    // 인증 앱 길: 이 시험 장부는 출금의 인증 앱 코드를 자릿수로만 본다
    else { await page.waitForSelector("form .v-input"); await page.locator("form .v-input").fill("123456"); }
  };
  const submit = () => page.locator('form button[type="submit"]').click();
  /**
   * 시험 장치. 마지막 단추가 일으키는 계정 서비스 요청은 차례로 인증 코드 확인, 출금 접수, (차감하지 못하면) 접수 취소다.
   * 둘째(출금 접수)가 끝난 바로 뒤에 잔액을 0 으로 바꾼다. failCancel 이면 셋째(취소)는 서비스에 닿지 않고 실패한다(일시적인 실패).
   */
  const rig = (failCancel) => page.evaluate((failCancel) => {
    let req = null;
    try { window.webpackChunk_N_E.push([[Symbol("probe")], {}, (r) => { req = r; }]); } catch { return "모듈 캐시에 닿지 못했다"; }
    const find = (name) => Object.values(req.c).find((m) => { try { return m?.exports?.[name]; } catch { return false; } })?.exports?.[name];
    const store = find("useWalletStore"); const api = find("api");
    if (!store?.getState || !api?.withdrawStatus) return "지갑 스토어나 계정 서비스 호출을 찾지 못했다";
    window.__walletStore = store; window.__api = api;
    const request = navigator.locks.request.bind(navigator.locks);
    let calls = 0;
    navigator.locks.request = async (...args) => {
      calls += 1;
      if (calls === 3 && failCancel) { window.__cancelBlocked = true; throw new Error("cancel blocked by the check script"); }
      const result = await request(...args);
      if (calls === 2) { store.setState({ cryptoBalance: 0, balance: 0 }); window.__drained = true; }
      return result;
    };
    return "ok";
  }, failCancel);
  /** 차감 실패를 일으키고 입력 화면으로 돌아올 때까지 기다린다 */
  const failDebit = async () => { await submit(); await page.waitForFunction(() => window.__drained === true, null, { timeout: 15000 }); await page.getByLabel("받는 주소", { exact: true }).waitFor({ timeout: 15000 }); await page.waitForTimeout(500); };
  const refill = () => page.evaluate(() => window.__walletStore.setState({ cryptoBalance: 10000, balance: 10000 }));
  const mainText = async () => (await page.locator("main").innerText()).replace(/\s+/g, " ");
  const historyRow = () => page.locator('section[aria-labelledby="wallet-history"] .v-itemrow', { hasText: "출금" }).first();
  /** 지갑 내역의 출금 줄의 글과, 그 줄을 눌러 연 시트의 글. 시트는 열어 둔다 */
  const openHistoryRow = async () => {
    await page.waitForSelector('section[aria-labelledby="wallet-history"] .v-itemrow');
    const row = (await historyRow().innerText()).replace(/\s+/g, " ");
    await historyRow().click(); await page.waitForSelector(".v-sheet");
    return { row, sheet: (await page.locator(".v-sheet").innerText()).replace(/\s+/g, " "), canCancel: (await page.locator(".v-sheet").getByRole("button", { name: "출금 취소" }).count()) === 1 };
  };
  /** 열어 둔 시트에서 취소를 확정한다. 확인창의 글을 돌려준다 */
  const confirmCancel = async () => {
    await page.locator(".v-sheet").getByRole("button", { name: "출금 취소" }).click();
    await page.waitForSelector('[role="alertdialog"] .v-btn'); const confirm = (await page.locator('[role="alertdialog"]').innerText()).replace(/\s+/g, " ");
    await page.waitForTimeout(600); await page.locator('[role="alertdialog"] .v-btn').click();
    await page.waitForSelector('[role="alertdialog"]', { state: "detached" }); await page.waitForTimeout(400);
    return confirm;
  };
  /** 새 출금을 처음부터 끝까지 한다(지금 화면이 출금 화면의 첫 단계일 때) */
  const withdrawAgain = async () => { await toFinalStep(); await submit(); return page.getByRole("heading", { name: "출금을 신청했습니다" }).waitFor({ timeout: 15000 }).then(() => true, () => false); };
  return { context, page, errors, ledger, fillForm, toFinalStep, submit, rig, failDebit, refill, mainText, openHistoryRow, confirmCancel, withdrawAgain, shot: (name) => (out ? page.screenshot({ path: `${out}/${name}.png` }) : null) };
}
const run = async (id, fn) => { try { await fn(); } catch (e) { check(id, "시나리오 실행", false, String(e).slice(0, 240)); } };
/** 차감하지 않은 요청의 줄: 장부 금액 0, 신청 금액은 표시 칸에만, 받는 금액 칸 없음, 접수 번호는 서비스의 것 */
const zeroRow = (w, l, status) => !!w && w.amountUsdt === 0 && w.requestedUsdt === AMOUNT && w.netUsdt === null && w.status === status && l.serviceIds.includes(w.serverId) && w.extra.length === 0;

// a: 보통의 길
await run("a", async () => {
  const s = await session();
  const before = await s.ledger();
  check("a", "처음 잔액은 10,000 이고 출금 내역이 없다", near(before.crypto, 10000) && before.withdraws.length === 0, JSON.stringify(before));
  await s.toFinalStep(); await s.submit();
  await s.page.getByRole("heading", { name: "출금을 신청했습니다" }).waitFor({ timeout: 15000 }); await s.shot("a1-done");
  let l = await s.ledger();
  check("a", "신청한 금액만큼 차감되고 출금 내역 하나가 생긴다", near(l.crypto, 10000 - AMOUNT) && l.withdraws.length === 1 && near(l.withdraws[0].amountUsdt, -AMOUNT) && l.withdraws[0].status === "PENDING_72H_HOLD" && !!l.withdraws[0].serverId, JSON.stringify(l));
  check("a", "보통의 출금 줄은 원본과 같은 꼴이다(신청 금액 표시 칸이 없고, 받는 금액 칸이 있다)", l.withdraws[0].requestedUsdt === null && near(l.withdraws[0].netUsdt, AMOUNT - 1) && l.withdraws[0].extra.length === 0, JSON.stringify(l.withdraws[0]));
  check("a", "서비스의 접수도 72시간 대기 하나다", l.service.length === 1 && l.service[0] === "PENDING_72H_HOLD", JSON.stringify(l.service));
  // 지갑 내역에서 취소한다
  await s.page.getByRole("link", { name: "지갑으로" }).click(); await s.page.waitForURL(/\/wallet\/?$/, { timeout: 15000 });
  const seen = await s.openHistoryRow();
  check("a", "보통의 출금 줄은 차감한 금액으로 적히고, 차감하지 않았다는 글이 없다", seen.row.includes("-$50") && !seen.row.includes(TAG) && !seen.sheet.includes(NOT_DEBITED) && !seen.sheet.includes("신청한 금액"), seen.row);
  const confirm = await s.confirmCancel(); await s.shot("a2-cancelled");
  l = await s.ledger();
  check("a", "차감한 보통의 출금에는 전과 같은 취소 글이 나온다(금액을 잔액으로 되돌린다)", confirm.includes("출금을 취소하고 금액을 잔액으로 되돌립니다"), confirm);
  check("a", "취소하면 차감한 만큼만 돌아와 잔액이 처음과 같다", near(l.crypto, 10000) && l.withdraws[0].status === "CANCELLED" && l.service[0] === "CANCELLED", JSON.stringify(l));
  // 10초마다 도는 상태 확인이 한 번 더 지나가도 다시 환불되지 않는다
  await s.page.waitForTimeout(11000);
  check("a", "상태 확인이 다시 돌아도 한 번만 환불된다", near((await s.ledger()).crypto, 10000));
  check("a", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// b: 차감하지 못했고, 취소는 확인된 경우
await run("b", async () => {
  const s = await session();
  await s.toFinalStep();
  const hooked = await s.rig(false);
  check("b", "시험 장치: 접수 직후 잔액을 0 으로 바꿀 준비가 됐다", hooked === "ok", hooked);
  if (hooked !== "ok") { await s.context.close(); return; }
  await s.failDebit(); await s.shot("b1-debit-failed");
  const text = await s.mainText();
  let l = await s.ledger();
  check("b", "접수 번호가 장부 금액 0 인 줄로 남고, 취소됨으로 끝난다", l.withdraws.length === 1 && zeroRow(l.withdraws[0], l, "CANCELLED"), JSON.stringify(l.withdraws));
  check("b", "잔액은 줄어든 그대로 0 이다(환불되지 않는다)", near(l.crypto, 0) && near(l.balance, 0), JSON.stringify([l.crypto, l.balance]));
  check("b", "서비스의 접수는 취소됐다", l.service.length === 1 && l.service[0] === "CANCELLED", JSON.stringify(l.service));
  check("b", "신청했다는 화면으로 가지 않고 입력 화면에서 잔액이 모자란다고 알린다", !text.includes("출금을 신청했습니다") && /잔액 \$0(\.00)?보다 많이 넣었습니다/.test(text), text.slice(0, 200));
  check("b", "취소가 확인됐으므로 취소를 확인하지 못했다는 한 줄은 없다", !text.includes(NOTICE));
  await s.page.goto(base + "/ko/wallet", { waitUntil: "networkidle" });
  const seen = await s.openHistoryRow(); await s.shot("b2-ended-row-sheet");
  check("b", "끝난 뒤의 내역 줄: 취소됨, 차감하지 않음, 금액 $0(차감한 출금처럼 -$50 으로 적히지 않는다)", seen.row.includes("취소됨") && seen.row.includes(TAG) && seen.row.includes("$0") && !seen.row.includes("$50"), seen.row);
  check("b", "끝난 뒤의 시트: 차감하지 않은 요청이라는 글과 신청한 금액이 남아 있고, 취소 단추는 없다", seen.sheet.includes(NOT_DEBITED) && seen.sheet.includes("신청한 금액 $50") && seen.sheet.includes("금액 $0") && !seen.canCancel, seen.sheet);
  // 10초마다 도는 상태 확인이 지나가도 환불되지 않는다
  await s.page.waitForTimeout(11000);
  l = await s.ledger();
  check("b", "상태 확인이 돌아도 환불되지 않는다", near(l.crypto, 0) && l.withdraws[0].status === "CANCELLED");
  check("b", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// c, d: 차감하지 못했고 취소는 실패한 경우(c 는 이메일 인증 길의 72시간 대기, d 는 인증 앱 길의 처리 대기)
for (const [id, preset, status, statusText] of [["c", "funded", "PENDING_72H_HOLD", "72시간 보안 대기"], ["d", "security", "PENDING", "처리 대기"]]) await run(id, async () => {
  const s = await session(preset);
  await s.toFinalStep();
  const hooked = await s.rig(true);
  check(id, "시험 장치: 접수 직후 잔액을 0 으로 바꾸고 취소를 막을 준비가 됐다", hooked === "ok", hooked);
  if (hooked !== "ok") { await s.context.close(); return; }
  await s.failDebit(); await s.shot(`${id}1-cancel-failed`);
  let text = await s.mainText(); let l = await s.ledger();
  check(id, "취소를 시도했고 실패했다", await s.page.evaluate(() => window.__cancelBlocked === true));
  check(id, "접수 번호가 장부 금액 0 인 줄로 남는다(서비스가 준 상태 그대로, 열린 채)", l.withdraws.length === 1 && zeroRow(l.withdraws[0], l, status), JSON.stringify(l.withdraws));
  check(id, "서비스의 접수는 아직 열려 있고 하나다", l.service.length === 1 && l.service[0] === status, JSON.stringify(l.service));
  check(id, "잔액은 0 그대로다", near(l.crypto, 0) && near(l.balance, 0));
  check(id, "입력 화면이 무슨 일이 있었는지 한 줄로 알리고(차감한 것은 없다, 취소는 확인하지 못했다) 지갑 내역으로 가는 링크를 준다", text.includes(NOTICE) && (await s.page.locator('form a.v-link[href$="/wallet"], form a.v-link[href$="/wallet/"]').count()) === 1, text.slice(0, 300));
  // 잔액이 다시 생기면 새 출금을 낼 수 있다: 열린 요청이 새 출금을 막지 않는다(C3-P1-01)
  await s.refill(); await s.fillForm(); await s.submit();
  check(id, "열린 요청이 남아 있어도 새 출금은 확인 단계로 넘어간다", await s.page.getByRole("button", { name: "인증하고 출금" }).waitFor({ timeout: 8000 }).then(() => true, () => false));
  // 지갑 내역: 열려 있는 동안의 글
  await s.page.goto(base + "/ko/wallet", { waitUntil: "networkidle" });
  let seen = await s.openHistoryRow(); await s.shot(`${id}2-open-row-sheet`);
  check(id, "열려 있는 동안의 내역 줄: 상태, 차감하지 않음, 금액 $0(-$50 이 아니다)", seen.row.includes(statusText) && seen.row.includes(TAG) && seen.row.includes("$0") && !seen.row.includes("$50"), seen.row);
  check(id, "열려 있는 동안의 시트: 차감하지 않은 요청이라는 글, 신청한 금액, 취소 단추. 받는 금액 행은 없다", seen.sheet.includes(NOT_DEBITED) && seen.sheet.includes("신청한 금액 $50") && seen.sheet.includes("금액 $0") && !seen.sheet.includes("수수료를 뺀 받는 금액") && seen.canCancel, seen.sheet);
  const confirm = await s.confirmCancel(); await s.shot(`${id}3-cancelled-from-history`);
  l = await s.ledger();
  check(id, "취소 확인창은 잔액이 바뀌지 않는다고 적는다(금액을 되돌린다고 적지 않는다)", confirm.includes(CANCEL_UNDEBITED) && !confirm.includes("금액을 잔액으로 되돌립니다"), confirm);
  check(id, "취소하면 줄과 서비스의 접수가 취소로 끝난다", l.withdraws[0].status === "CANCELLED" && l.service[0] === "CANCELLED", JSON.stringify({ withdraws: l.withdraws, service: l.service }));
  check(id, "환불은 없다(잔액은 10,000 그대로, 10,050 이 아니다)", near(l.crypto, 10000) && near(l.balance, 10000), JSON.stringify([l.crypto, l.balance]));
  // 끝난 뒤의 글
  await s.page.waitForSelector(".v-sheet", { state: "detached" }).catch(() => {});
  if (await s.page.locator(".v-sheet").count()) { await s.page.locator(".v-sheet-close").click(); await s.page.waitForSelector(".v-sheet", { state: "detached" }); }
  seen = await s.openHistoryRow();
  check(id, "끝난 뒤의 내역 줄과 시트에도 차감하지 않은 요청이라는 글이 남는다", seen.row.includes("취소됨") && seen.row.includes(TAG) && seen.row.includes("$0") && seen.sheet.includes(NOT_DEBITED) && seen.sheet.includes("신청한 금액 $50") && !seen.canCancel, seen.row + " / " + seen.sheet);
  check(id, "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// e: 서비스가 그 접수 번호를 모르는 경우
await run("e", async () => {
  const s = await session();
  await s.toFinalStep();
  const hooked = await s.rig(true);
  if (hooked !== "ok") { check("e", "시험 장치", false, hooked); await s.context.close(); return; }
  await s.failDebit(); await s.refill();
  let l = await s.ledger();
  check("e", "차감하지 못한 요청의 줄이 열린 채 남아 있다", l.withdraws.length === 1 && zeroRow(l.withdraws[0], l, "PENDING_72H_HOLD"), JSON.stringify(l.withdraws));
  // 서비스(시험 장부)에서 그 접수를 지운다: 서비스는 이제 그 번호를 모른다
  await s.page.evaluate(() => { const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i)); const key = keys.find((k) => k && k.endsWith("voila.browser-accounts.v1")); const accounts = JSON.parse(localStorage.getItem(key)); accounts[0].withdrawals = {}; localStorage.setItem(key, JSON.stringify(accounts)); });
  // 지갑을 연다: 상태 확인이 그 번호를 조회하고, 모른다는 답을 받는다(화면을 새로 불러온 직후의 첫 확인은 장부를 불러오기 전일 수 있어, 10초 뒤의 다음 확인까지 기다린다)
  await s.page.goto(base + "/ko/wallet", { waitUntil: "networkidle" });
  // 저장된 장부는 줄인 형식일 수 있어 글자를 찾지 않고 풀어서 본다(lib/compactStorage, 개발 서버의 손잡이)
  await s.page.waitForFunction(() => { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.includes("voila.browser-wallet.") && !k.endsWith(".guest") && (window.__voilaLedger?.(k)?.transactions ?? []).some((t) => t?.status === "FAILED")) return true; } return false; }, null, { timeout: 15000 }).catch(() => {});
  await s.page.waitForTimeout(400);
  l = await s.ledger();
  check("e", "서비스가 모르는 접수의 줄은 실패로 닫힌다", l.withdraws.length === 1 && l.withdraws[0].status === "FAILED" && l.withdraws[0].amountUsdt === 0, JSON.stringify(l.withdraws));
  check("e", "닫으면서 환불하지 않는다(잔액 10,000 그대로)", near(l.crypto, 10000) && near(l.balance, 10000), JSON.stringify([l.crypto, l.balance]));
  const seen = await s.openHistoryRow(); await s.shot("e1-unknown-closed");
  check("e", "닫힌 줄의 글: 실패, 차감하지 않음, 금액 $0. 시트에 차감하지 않은 요청이라는 글, 취소 단추 없음", seen.row.includes("실패") && seen.row.includes(TAG) && seen.row.includes("$0") && seen.sheet.includes(NOT_DEBITED) && !seen.canCancel, seen.row + " / " + seen.sheet);
  // 그 뒤 새 출금을 끝까지 한다
  await s.page.goto(base + "/ko/wallet/withdraw", { waitUntil: "networkidle" });
  check("e", "새 출금을 끝까지 할 수 있다", await s.withdrawAgain());
  l = await s.ledger();
  check("e", "새 출금은 보통의 출금이다(50 차감, 서비스의 접수 하나)", near(l.crypto, 10000 - AMOUNT) && l.withdraws.length === 2 && l.withdraws.some((w) => near(w.amountUsdt, -AMOUNT) && w.status === "PENDING_72H_HOLD") && l.service.length === 1, JSON.stringify(l));
  check("e", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// f: 상태 확인이 계속 실패하는 경우(일시적인 실패)
await run("f", async () => {
  const s = await session();
  await s.toFinalStep();
  const hooked = await s.rig(true);
  if (hooked !== "ok") { check("f", "시험 장치", false, hooked); await s.context.close(); return; }
  await s.failDebit(); await s.refill();
  // 이제부터 상태 조회는 언제나 일시적으로 실패한다(서비스에 닿지 못한다)
  await s.page.evaluate(() => { window.__lookups = 0; window.__api.withdrawStatus = async () => { window.__lookups += 1; throw new Error("lookup failed (injected by the check script)"); }; });
  // 다시 불러오지 않고 지갑으로 간다(장치가 남아 있게). 지갑의 상태 확인이 바로 한 번, 10초 뒤에 또 한 번 돈다
  await s.page.locator('form a.v-link[href$="/wallet"], form a.v-link[href$="/wallet/"]').click(); await s.page.waitForURL(/\/wallet\/?$/, { timeout: 15000 });
  await s.page.waitForFunction(() => window.__lookups >= 2, null, { timeout: 30000 }); await s.page.waitForTimeout(400);
  let l = await s.ledger();
  check("f", "조회가 되풀이해 실패했다", (await s.page.evaluate(() => window.__lookups)) >= 2);
  check("f", "일시적인 실패로는 줄을 닫지 않는다(열린 채, 서비스의 접수도 그대로)", l.withdraws.length === 1 && zeroRow(l.withdraws[0], l, "PENDING_72H_HOLD") && l.service[0] === "PENDING_72H_HOLD", JSON.stringify(l.withdraws));
  check("f", "잔액은 바뀌지 않는다", near(l.crypto, 10000) && near(l.balance, 10000));
  const row = (await s.page.locator('section[aria-labelledby="wallet-history"] .v-itemrow', { hasText: "출금" }).first().innerText()).replace(/\s+/g, " "); await s.shot("f1-lookup-failing");
  check("f", "내역 줄은 열린 채, 차감하지 않은 요청으로 적혀 있다", row.includes("72시간 보안 대기") && row.includes(TAG) && row.includes("$0"), row);
  // 조회가 계속 실패하는 채로 새 출금을 끝까지 한다
  await s.page.getByRole("link", { name: "출금", exact: true }).click(); await s.page.waitForURL(/\/wallet\/withdraw\/?$/, { timeout: 15000 });
  check("f", "조회가 계속 실패해도 새 출금을 끝까지 할 수 있다", await s.withdrawAgain());
  l = await s.ledger();
  check("f", "새 출금은 보통의 출금이고(50 차감), 앞의 요청은 열린 채 그대로다", near(l.crypto, 10000 - AMOUNT) && l.withdraws.length === 2 && l.withdraws.some((w) => near(w.amountUsdt, -AMOUNT)) && l.withdraws.some((w) => w.amountUsdt === 0 && w.status === "PENDING_72H_HOLD") && l.service.length === 2, JSON.stringify(l));
  check("f", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

await browser.close();
const failed = results.filter((r) => !r.pass);
if (out) fs.writeFileSync(`${out}/withdraw-results.json`, JSON.stringify(results, null, 2));
console.log(`\n검사 ${results.length}개, 통과 ${results.length - failed.length}, 실패 ${failed.length}`);
process.exit(failed.length ? 1 : 0);
