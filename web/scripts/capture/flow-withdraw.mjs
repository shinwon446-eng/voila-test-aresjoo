// 출금 신청과 취소의 돈(migration-audit/PARITY_ISSUES.md E-01, migration-audit/CYCLE1_codex.md C1-P1-01). 실제 화면을 눌러 출금을 신청하고, 장부의 숫자로 확인한다.
//   CAPTURE_BASE=http://localhost:3003 node scripts/capture/flow-withdraw.mjs [출력 폴더]
// a: 보통의 길. 신청하면 금액만큼 차감되고, 지갑 내역에서 취소하면 그만큼만 한 번 돌아온다.
// b: 접수를 기다리는 사이에 잔액이 줄어 차감하지 못했고, 취소는 확인된 경우. 접수 번호가 차감하지 않은 내역으로 남아 취소됨으로 끝난다. 잔액은 그대로다(환불 없음).
// c: 차감하지 못했고 취소도 실패한 경우. 내역이 열린 채 남고, 입력 화면이 그 사실과 할 일을 알리고, 같은 내용을 다시 내도 둘째 요청이 생기지 않는다.
//    나중에 지갑 내역에서 취소하면 환불 없이 취소로 끝나고, 그 뒤에는 다시 신청할 수 있다.
// d: c 와 같되 인증 앱 길(서비스의 상태가 72시간 대기가 아니라 처리 대기). 이 상태의 열린 요청도 지갑 내역에서 취소할 수 있다.
// 이 사이트의 계정 서비스는 브라우저 안의 시험 장부다(실제 돈과 전송은 없다). 이메일 인증 코드는 그 시험 장부에서 읽는다.
// b, c, d 의 경합은 화면만으로 일으킬 수 없어서, 개발 서버의 모듈 캐시에서 지갑 스토어를 찾아 접수 직후 잔액을 0 으로 바꾼다.
// 취소의 실패는 계정 서비스로 가는 그 요청 하나를 이 브라우저 안에서 막아 만든다(개발 서버에서만 된다. 앱 소스는 건드리지 않는다).
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
const OPEN_LINE = "잔액이 바뀌어 출금을 마치지 못했습니다. 출금 요청은 아직 열려 있습니다. 지갑 내역에서 그 요청을 취소한 뒤 다시 신청합니다.";
const UNDEBITED_LINE = "잔액에서 차감하지 않은 출금 요청입니다. 취소해도 잔액은 바뀌지 않습니다.";

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
    const w = read(keys.find((k) => k && k.includes("voila.browser-wallet.") && !k.endsWith(".guest")))?.state ?? {};
    const account = (read(keys.find((k) => k && k.endsWith("voila.browser-accounts.v1"))) ?? [])[0] ?? {};
    return { crypto: w.cryptoBalance ?? null, balance: w.balance ?? null,
      withdraws: (w.transactions ?? []).filter((t) => t.type === "withdraw").map((t) => ({ amountUsdt: t.amountUsdt, status: t.status, debited: t.debited, serverId: t.serverId })),
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
   * 둘째(출금 접수)가 끝난 바로 뒤에 잔액을 0 으로 바꾼다. failCancel 이면 셋째(취소)는 서비스에 닿지 않고 실패한다.
   */
  const rig = (failCancel) => page.evaluate((failCancel) => {
    let req = null;
    try { window.webpackChunk_N_E.push([[Symbol("probe")], {}, (r) => { req = r; }]); } catch { return "모듈 캐시에 닿지 못했다"; }
    const mod = req && Object.values(req.c).find((m) => { try { return m?.exports?.useWalletStore?.getState; } catch { return false; } });
    if (!mod) return "지갑 스토어를 찾지 못했다";
    const store = mod.exports.useWalletStore; window.__walletStore = store;
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
  const mainText = async () => (await page.locator("main").innerText()).replace(/\s+/g, " ");
  /** 지갑 내역에서 출금 줄을 열고 취소를 확정한다. 열린 시트와 확인창의 글을 돌려준다 */
  const cancelFromHistory = async (statusText) => {
    await page.goto(base + "/ko/wallet", { waitUntil: "networkidle" });
    await page.locator('section[aria-labelledby="wallet-history"] .v-itemrow', { hasText: statusText }).first().click();
    await page.waitForSelector(".v-sheet"); const sheet = (await page.locator(".v-sheet").innerText()).replace(/\s+/g, " ");
    await page.getByRole("button", { name: "출금 취소" }).click();
    await page.waitForSelector('[role="alertdialog"] .v-btn'); const confirm = (await page.locator('[role="alertdialog"]').innerText()).replace(/\s+/g, " ");
    await page.waitForTimeout(600); await page.locator('[role="alertdialog"] .v-btn').click();
    await page.waitForSelector('[role="alertdialog"]', { state: "detached" }); await page.waitForTimeout(400);
    return { sheet, confirm };
  };
  return { context, page, errors, ledger, fillForm, toFinalStep, submit, rig, failDebit, mainText, cancelFromHistory, shot: (name) => (out ? page.screenshot({ path: `${out}/${name}.png` }) : null) };
}
const run = async (id, fn) => { try { await fn(); } catch (e) { check(id, "시나리오 실행", false, String(e).slice(0, 240)); } };

// a: 보통의 길
await run("a", async () => {
  const s = await session();
  const before = await s.ledger();
  check("a", "처음 잔액은 10,000 이고 출금 내역이 없다", near(before.crypto, 10000) && before.withdraws.length === 0, JSON.stringify(before));
  await s.toFinalStep(); await s.submit();
  await s.page.getByRole("heading", { name: "출금을 신청했습니다" }).waitFor({ timeout: 15000 }); await s.shot("a1-done");
  let l = await s.ledger();
  check("a", "신청한 금액만큼 차감되고 출금 내역 하나가 생긴다", near(l.crypto, 10000 - AMOUNT) && l.withdraws.length === 1 && near(l.withdraws[0].amountUsdt, -AMOUNT) && l.withdraws[0].status === "PENDING_72H_HOLD" && !!l.withdraws[0].serverId, JSON.stringify(l));
  check("a", "그 내역에는 실제로 차감했다고 적힌다", l.withdraws[0]?.debited === true, String(l.withdraws[0]?.debited));
  check("a", "서비스의 접수도 72시간 대기 하나다", l.service.length === 1 && l.service[0] === "PENDING_72H_HOLD", JSON.stringify(l.service));
  // 지갑 내역에서 취소한다
  await s.page.getByRole("link", { name: "지갑으로" }).click(); await s.page.waitForURL(/\/wallet\/?$/, { timeout: 15000 });
  const seen = await s.cancelFromHistory("72시간 보안 대기"); await s.shot("a2-cancelled");
  l = await s.ledger();
  check("a", "취소하면 차감한 만큼만 돌아와 잔액이 처음과 같다", near(l.crypto, 10000) && l.withdraws[0].status === "CANCELLED" && l.service[0] === "CANCELLED", JSON.stringify(l));
  check("a", "차감한 보통의 출금에는 전과 같은 취소 글이 나온다(금액을 잔액으로 되돌린다)", seen.confirm.includes("출금을 취소하고 금액을 잔액으로 되돌립니다") && !seen.sheet.includes(UNDEBITED_LINE), seen.confirm);
  // 10초마다 도는 상태 확인이 한 번 더 지나가도 다시 환불되지 않는다
  await s.page.waitForTimeout(11000);
  l = await s.ledger();
  check("a", "상태 확인이 다시 돌아도 한 번만 환불된다", near(l.crypto, 10000), JSON.stringify(l.crypto));
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
  const l = await s.ledger();
  check("b", "접수 번호가 차감하지 않은 내역으로 남고, 취소됨으로 끝난다", l.withdraws.length === 1 && l.withdraws[0].debited === false && l.withdraws[0].status === "CANCELLED" && l.withdraws[0].serverId === l.serviceIds[0], JSON.stringify(l.withdraws));
  check("b", "잔액은 줄어든 그대로 0 이다(환불되지 않는다)", near(l.crypto, 0) && near(l.balance, 0), JSON.stringify([l.crypto, l.balance]));
  check("b", "서비스의 접수는 취소됐다", l.service.length === 1 && l.service[0] === "CANCELLED", JSON.stringify(l.service));
  check("b", "신청했다는 화면으로 가지 않고 입력 화면에서 잔액이 모자란다고 알린다", !text.includes("출금을 신청했습니다") && /잔액 \$0(\.00)?보다 많이 넣었습니다/.test(text), text.slice(0, 200));
  check("b", "취소가 확인됐으므로 열린 요청이 있다는 한 줄은 없다", !text.includes(OPEN_LINE));
  await s.page.goto(base + "/ko/wallet", { waitUntil: "networkidle" }); await s.page.waitForTimeout(600); await s.shot("b2-wallet");
  const wallet = await s.mainText();
  check("b", "지갑 내역에 그 출금이 취소됨으로 보이고 잔액은 0 그대로다", wallet.includes("취소됨") && !wallet.includes("72시간 보안 대기") && near((await s.ledger()).crypto, 0), wallet.slice(0, 200));
  // 10초마다 도는 상태 확인이 지나가도 환불되지 않는다
  await s.page.waitForTimeout(11000);
  check("b", "상태 확인이 돌아도 환불되지 않는다", near((await s.ledger()).crypto, 0));
  check("b", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// c, d: 차감하지 못했고 취소도 실패한 경우(c 는 이메일 인증 길의 72시간 대기, d 는 인증 앱 길의 처리 대기)
for (const [id, preset, status, statusText] of [["c", "funded", "PENDING_72H_HOLD", "72시간 보안 대기"], ["d", "security", "PENDING", "처리 대기"]]) await run(id, async () => {
  const s = await session(preset);
  await s.toFinalStep();
  const hooked = await s.rig(true);
  check(id, "시험 장치: 접수 직후 잔액을 0 으로 바꾸고 취소를 막을 준비가 됐다", hooked === "ok", hooked);
  if (hooked !== "ok") { await s.context.close(); return; }
  await s.failDebit(); await s.shot(`${id}1-cancel-failed`);
  let text = await s.mainText(); let l = await s.ledger();
  check(id, "취소를 시도했고 실패했다", await s.page.evaluate(() => window.__cancelBlocked === true));
  check(id, "접수 번호가 차감하지 않은 내역으로 남는다(서비스가 준 상태 그대로, 열린 채)", l.withdraws.length === 1 && l.withdraws[0].debited === false && l.withdraws[0].status === status && l.withdraws[0].serverId === l.serviceIds[0], JSON.stringify(l.withdraws));
  check(id, "서비스의 접수는 아직 열려 있고 하나다", l.service.length === 1 && l.service[0] === status, JSON.stringify(l.service));
  check(id, "잔액은 0 그대로다", near(l.crypto, 0) && near(l.balance, 0));
  check(id, "입력 화면이 무슨 일이 있었고 무엇을 하면 되는지 한 줄로 알리고, 지갑 내역으로 가는 링크를 준다", text.includes(OPEN_LINE) && (await s.page.locator('form a.v-link[href$="/wallet"], form a.v-link[href$="/wallet/"]').count()) === 1, text.slice(0, 260));
  // 잔액이 다시 생겨 같은 금액과 주소를 다시 낸다: 새 요청이 생기지 않는다
  await s.page.evaluate(() => window.__walletStore.setState({ cryptoBalance: 10000, balance: 10000 }));
  await s.fillForm(); await s.submit(); await s.page.waitForTimeout(800); await s.shot(`${id}2-resubmit-blocked`);
  text = await s.mainText(); l = await s.ledger();
  check(id, "같은 내용을 다시 내도 확인 단계로 넘어가지 않고 그 한 줄이 남아 있다", (await s.page.getByRole("button", { name: "인증하고 출금" }).count()) === 0 && text.includes(OPEN_LINE));
  check(id, "서비스의 요청은 여전히 하나이고 내역도 하나다(둘째 요청이 생기지 않는다)", l.service.length === 1 && l.withdraws.length === 1 && near(l.crypto, 10000), JSON.stringify({ service: l.service, withdraws: l.withdraws.length, crypto: l.crypto }));
  // 지갑 내역에서 그 요청을 취소한다(다시 불러온 화면이라 취소를 막던 장치는 없다)
  const seen = await s.cancelFromHistory(statusText); await s.shot(`${id}3-cancelled-from-history`);
  l = await s.ledger();
  check(id, "지갑 내역의 그 줄이 차감하지 않은 요청이라고 알린다(시트와 확인창)", seen.sheet.includes(UNDEBITED_LINE) && seen.confirm.includes(UNDEBITED_LINE) && !seen.confirm.includes("금액을 잔액으로 되돌립니다"), seen.confirm);
  check(id, "취소하면 내역과 서비스의 접수가 취소로 끝난다", l.withdraws[0].status === "CANCELLED" && l.service[0] === "CANCELLED", JSON.stringify({ withdraws: l.withdraws, service: l.service }));
  check(id, "환불은 없다(잔액은 10,000 그대로, 10,050 이 아니다)", near(l.crypto, 10000) && near(l.balance, 10000), JSON.stringify([l.crypto, l.balance]));
  // 풀린 뒤에는 다시 신청할 수 있다
  await s.page.goto(base + "/ko/wallet/withdraw", { waitUntil: "networkidle" });
  if (preset === "funded") await s.page.getByText("이메일 인증으로 출금", { exact: false }).click();
  await s.page.waitForSelector("form .v-input"); await s.fillForm();
  check(id, "풀린 뒤의 입력 화면에는 그 한 줄이 없다", !(await s.mainText()).includes(OPEN_LINE));
  await s.submit();
  check(id, "풀린 뒤에는 확인 단계로 넘어간다", await s.page.getByRole("button", { name: "인증하고 출금" }).waitFor({ timeout: 8000 }).then(() => true, () => false));
  check(id, "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

await browser.close();
const failed = results.filter((r) => !r.pass);
if (out) fs.writeFileSync(`${out}/withdraw-results.json`, JSON.stringify(results, null, 2));
console.log(`\n검사 ${results.length}개, 통과 ${results.length - failed.length}, 실패 ${failed.length}`);
process.exit(failed.length ? 1 : 0);
