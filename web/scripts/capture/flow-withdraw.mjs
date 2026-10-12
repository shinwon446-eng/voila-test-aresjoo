// 출금 신청과 취소의 돈(migration-audit/PARITY_ISSUES.md E-01). 실제 화면을 눌러 출금을 신청하고, 장부의 숫자로 확인한다.
//   CAPTURE_BASE=http://localhost:3003 node scripts/capture/flow-withdraw.mjs [출력 폴더]
// a: 보통의 길. 신청하면 금액만큼 차감되고, 지갑 내역에서 취소하면 그만큼만 한 번 돌아온다.
// b: 접수를 기다리는 사이에 잔액이 줄어 차감하지 못한 경우. 출금 내역이 생기지 않고, 입력 화면의 한 줄로 알리고, 서비스의 접수는 취소된다.
//    그래서 취소할 건이 없고, 차감한 적 없는 금액이 잔액에 생기지 않는다.
// 이 사이트의 계정 서비스는 브라우저 안의 시험 장부다(실제 돈과 전송은 없다). 이메일 인증 코드는 그 시험 장부에서 읽는다.
// b 의 경합은 화면만으로 일으킬 수 없어서, 개발 서버의 모듈 캐시에서 지갑 스토어를 찾아 접수를 기다리는 동안 잔액을 0 으로 바꾼다(개발 서버에서만 된다. 앱 소스는 건드리지 않는다).
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

async function session() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR", reducedMotion: "reduce" });
  await installState(context, await makeState("funded", "ko"), new URL(base).origin);
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
      service: Object.values(account.withdrawals ?? {}).map((r) => r.status), code: account.challenge?.code ?? null };
  });
  /** 이메일 인증 길로 금액과 주소를 넣고, 코드를 받아 넣은 데까지 간다(마지막 단추는 누르지 않는다) */
  const toFinalStep = async () => {
    await page.getByText("이메일 인증으로 출금", { exact: false }).click(); await page.waitForSelector("form .v-input");
    await page.locator("form .v-input").nth(0).fill(ADDRESS); await page.locator("form .v-input").nth(1).fill(String(AMOUNT));
    await page.locator('form button[type="submit"]').click();
    await page.getByRole("button", { name: "인증하고 출금" }).click();
    await page.getByRole("button", { name: "코드 보내기" }).click();
    await page.waitForSelector("form .v-input");
    const code = (await ledger()).code;
    await page.locator("form .v-input").fill(code);
  };
  const submit = () => page.locator('form button[type="submit"]').click();
  return { context, page, errors, ledger, toFinalStep, submit, shot: (name) => (out ? page.screenshot({ path: `${out}/${name}.png` }) : null) };
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
  await s.page.locator(".v-itemrow, .v-row--button, button", { hasText: "72시간 보안 대기" }).first().click();
  await s.page.getByRole("button", { name: "출금 취소" }).click();
  await s.page.waitForSelector('[role="alertdialog"] .v-btn'); await s.page.waitForTimeout(600);
  await s.page.locator('[role="alertdialog"] .v-btn').click();
  await s.page.waitForSelector('[role="alertdialog"]', { state: "detached" }); await s.page.waitForTimeout(400); await s.shot("a2-cancelled");
  l = await s.ledger();
  check("a", "취소하면 차감한 만큼만 돌아와 잔액이 처음과 같다", near(l.crypto, 10000) && l.withdraws[0].status === "CANCELLED" && l.service[0] === "CANCELLED", JSON.stringify(l));
  // 10초마다 도는 상태 확인이 한 번 더 지나가도 다시 환불되지 않는다
  await s.page.waitForTimeout(11000);
  l = await s.ledger();
  check("a", "상태 확인이 다시 돌아도 한 번만 환불된다", near(l.crypto, 10000), JSON.stringify(l.crypto));
  check("a", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// b: 접수를 기다리는 사이에 잔액이 줄어 차감하지 못한 경우
await run("b", async () => {
  const s = await session();
  await s.toFinalStep();
  // 지갑 스토어를 개발 서버의 모듈 캐시에서 찾고, 계정 서비스의 다음 요청(출금 접수)이 끝나기를 기다리는 동안 잔액을 0 으로 바꾼다
  const hooked = await s.page.evaluate(() => {
    let req = null;
    try { window.webpackChunk_N_E.push([[Symbol("probe")], {}, (r) => { req = r; }]); } catch { return "모듈 캐시에 닿지 못했다"; }
    const mod = req && Object.values(req.c).find((m) => { try { return m?.exports?.useWalletStore?.getState; } catch { return false; } });
    if (!mod) return "지갑 스토어를 찾지 못했다";
    const store = mod.exports.useWalletStore;
    const request = navigator.locks.request.bind(navigator.locks);
    // 마지막 단추가 일으키는 요청은 둘이다: 이메일 코드 확인, 그다음 출금 접수. 둘째(출금 접수)가 끝난 바로 뒤에 잔액을 바꾼다
    let calls = 0;
    navigator.locks.request = async (...args) => {
      const result = await request(...args);
      if (++calls === 2) { store.setState({ cryptoBalance: 0, balance: 0 }); window.__drained = true; }
      return result;
    };
    return "ok";
  });
  check("b", "시험 장치: 접수를 기다리는 동안 잔액을 0 으로 바꿀 준비가 됐다", hooked === "ok", hooked);
  if (hooked !== "ok") { await s.context.close(); return; }
  await s.submit();
  await s.page.waitForFunction(() => window.__drained === true, null, { timeout: 15000 }); await s.page.waitForTimeout(800); await s.shot("b1-debit-failed");
  const text = (await s.page.locator("main").innerText()).replace(/\s+/g, " ");
  const l = await s.ledger();
  check("b", "출금 내역이 생기지 않는다", l.withdraws.length === 0, JSON.stringify(l.withdraws));
  check("b", "잔액은 줄어든 그대로 0 이다(음수가 되지도, 늘지도 않는다)", near(l.crypto, 0) && near(l.balance, 0), JSON.stringify([l.crypto, l.balance]));
  check("b", "신청했다는 화면으로 가지 않고 입력 화면에서 잔액이 모자란다고 알린다", !text.includes("출금을 신청했습니다") && /잔액 \$0(\.00)?보다 많이 넣었습니다/.test(text), text.slice(0, 200));
  check("b", "서비스의 접수는 취소됐다(취소할 수 없는 대기 건이 남지 않는다)", l.service.length === 1 && l.service[0] === "CANCELLED", JSON.stringify(l.service));
  // 지갑 내역에는 취소할 출금이 없다. 그래서 차감한 적 없는 금액이 환불될 길이 없다
  await s.page.goto(base + "/ko/wallet", { waitUntil: "networkidle" }); await s.page.waitForTimeout(600); await s.shot("b2-wallet");
  const wallet = (await s.page.locator("main").innerText()).replace(/\s+/g, " ");
  const after = await s.ledger();
  check("b", "지갑 내역에 출금 줄이 없고 잔액은 0 그대로다", !wallet.includes("72시간 보안 대기") && near(after.crypto, 0), wallet.slice(0, 160));
  check("b", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

await browser.close();
const failed = results.filter((r) => !r.pass);
if (out) fs.writeFileSync(`${out}/withdraw-results.json`, JSON.stringify(results, null, 2));
console.log(`\n검사 ${results.length}개, 통과 ${results.length - failed.length}, 실패 ${failed.length}`);
process.exit(failed.length ? 1 : 0);
