// 계정 화면의 비밀번호 바꾸기(migration-audit/PARITY_ISSUES.md E-03). 실제 화면에서 바꾸고, 계정 서비스(브라우저 안의 시험 장부)에 저장된 값으로 확인한다.
//   CAPTURE_BASE=http://localhost:3003 node scripts/capture/flow-account-password.mjs [출력 폴더]
// a: 인증 앱을 연결한 계정(states.mjs 의 security)은 현재 비밀번호, 새 비밀번호, 인증 앱 코드로 끝까지 간다. 바꾼 뒤에는 세션이 끝나고 새 비밀번호로 로그인된다.
// b: 현재 비밀번호가 틀리면 바뀌지 않는다.  c: 인증 앱 코드가 틀리면 바뀌지 않는다.
// d: 인증 앱을 연결하지 않은 계정(funded)은 바뀌지 않고, 그 까닭을 그 자리 한 줄로 알린다(이 시트는 인증 앱 코드로만 확인한다).
// 인증 앱 코드는 시험 계정의 시크릿으로 표준(RFC 6238) 계산을 해서 넣는다. 비밀번호는 states.mjs 의 시험용 값이다.
import { chromium } from "playwright";
import fs from "node:fs";
import { createHmac, pbkdf2Sync } from "node:crypto";
import { credentials, installState, makeState } from "./states.mjs";

const out = process.argv[2];
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
if (out) fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const check = (scenario, name, pass, detail = "") => { results.push({ scenario, name, pass: !!pass, detail }); console.log((pass ? "PASS " : "FAIL ") + scenario + " " + name + (detail ? "  " + detail : "")); };
const NEW_PASSWORD = "Changed-only-456789";
const hashOf = (password, salt) => pbkdf2Sync(password, salt, 210000, 32, "sha256").toString("hex");

/** 인증 앱이 보여 줄 6자리(RFC 6238, 30초, SHA-1) */
function totp(secret, at = Date.now()) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; let bits = 0, value = 0; const bytes = [];
  for (const ch of secret.toUpperCase()) { value = (value << 5) | alphabet.indexOf(ch); bits += 5; if (bits >= 8) { bytes.push((value >>> (bits - 8)) & 255); bits -= 8; } }
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(at / 30000)));
  const mac = createHmac("sha1", Buffer.from(bytes)).update(counter).digest(); const o = mac[mac.length - 1] & 15;
  return String(((mac[o] & 127) << 24 | mac[o + 1] << 16 | mac[o + 2] << 8 | mac[o + 3]) % 1000000).padStart(6, "0");
}

async function session(preset) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR", reducedMotion: "reduce" });
  const state = await makeState(preset, "ko");
  await installState(context, state, new URL(base).origin);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
  await page.goto(base + "/ko/account", { waitUntil: "networkidle" });
  /** 계정 서비스에 저장된 이 계정과 세션 */
  const saved = () => page.evaluate(() => {
    const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    const account = (JSON.parse(localStorage.getItem(keys.find((k) => k && k.endsWith("voila.browser-accounts.v1"))) || "[]"))[0] ?? {};
    return { salt: account.salt, passwordHash: account.passwordHash, failures: account.passwordFailures ?? 0, sessionVersion: account.user?.sessionVersion ?? 0, codes: Object.keys(account.accountCodes ?? {}), session: keys.some((k) => k && k.endsWith("voila.browser-session.v1")) };
  });
  const openSheet = async () => { await page.locator(".v-row--button", { hasText: "비밀번호" }).first().click(); await page.waitForSelector(".v-sheet .v-input"); };
  const fill = async ({ current, next, code }) => {
    await page.getByLabel("현재 비밀번호", { exact: true }).fill(current); await page.getByLabel("새 비밀번호", { exact: true }).fill(next);
    await page.getByLabel("인증 앱 코드", { exact: true }).fill(code);
  };
  const press = async () => { await page.locator(".v-sheet .v-btn").click(); await page.waitForFunction(() => !document.querySelector(".v-sheet .v-btn")?.hasAttribute("data-busy"), null, { timeout: 20000 }); await page.waitForTimeout(300); };
  const sheet = async () => ((await page.locator(".v-sheet").count()) ? (await page.locator(".v-sheet").innerText()).replace(/\s+/g, " ") : "");
  return { context, page, errors, state, saved, openSheet, fill, press, sheet, shot: (name) => (out ? page.screenshot({ path: `${out}/${name}.png` }) : null) };
}
const run = async (id, fn) => { try { await fn(); } catch (e) { check(id, "시나리오 실행", false, String(e).slice(0, 240)); } };

// a: 인증 앱을 연결한 계정은 끝까지 간다
await run("a", async () => {
  const s = await session("security");
  const before = await s.saved();
  check("a", "처음: 시험 비밀번호로 저장돼 있고 로그인돼 있다", before.passwordHash === hashOf(credentials.password, before.salt) && before.session, JSON.stringify({ session: before.session, version: before.sessionVersion }));
  await s.openSheet();
  await s.fill({ current: credentials.password, next: NEW_PASSWORD, code: totp(s.state.account.secret) });
  await s.press(); await s.shot("a1-changed");
  const after = await s.saved(); const text = await s.sheet();
  check("a", "비밀번호가 새 값으로 저장된다(옛 값으로는 맞지 않는다)", after.passwordHash === hashOf(NEW_PASSWORD, after.salt) && after.passwordHash !== hashOf(credentials.password, after.salt), JSON.stringify({ changed: after.passwordHash !== before.passwordHash }));
  check("a", "서비스가 세션을 끝냈다(세션 없음, 세션 판 1 올라감)", !after.session && after.sessionVersion === before.sessionVersion + 1, JSON.stringify({ session: after.session, version: after.sessionVersion }));
  check("a", "시트가 바꿨다고 말하고 로그인 단추를 준다", text.includes("비밀번호를 바꿨습니다") && text.includes("이메일로 로그인") && !text.includes("현재 비밀번호"), text.slice(0, 120));
  const body = (await s.page.locator("main").innerText()).replace(/\s+/g, " ");
  check("a", "화면은 로그인이 끝난 상태다", body.includes("로그인하면 잔액과 보관함, 보안 설정이 보입니다"), body.slice(0, 120));
  // 새 비밀번호로 다시 로그인한다
  await s.page.locator(".v-sheet .v-btn").click(); await s.page.getByLabel("이메일 주소", { exact: true }).waitFor({ timeout: 8000 });
  await s.page.getByLabel("이메일 주소", { exact: true }).fill(credentials.email); await s.page.locator(".v-sheet form .v-btn").click();
  await s.page.getByLabel("비밀번호", { exact: true }).waitFor({ timeout: 8000 });
  await s.page.getByLabel("비밀번호", { exact: true }).fill(NEW_PASSWORD); await s.page.locator(".v-sheet form .v-btn").click();
  await s.page.waitForSelector(".v-sheet", { state: "detached", timeout: 20000 }); await s.page.waitForTimeout(400); await s.shot("a2-logged-in-again");
  check("a", "새 비밀번호로 로그인된다", (await s.saved()).session);
  check("a", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// b: 현재 비밀번호가 틀리면 바뀌지 않는다
await run("b", async () => {
  const s = await session("security");
  const before = await s.saved();
  await s.openSheet();
  await s.fill({ current: "Wrong-password-000000", next: NEW_PASSWORD, code: totp(s.state.account.secret) });
  await s.press(); await s.shot("b1-wrong-current");
  const after = await s.saved();
  check("b", "틀린 현재 비밀번호: 바뀌지 않고 로그인도 그대로다", after.passwordHash === before.passwordHash && after.session && after.sessionVersion === before.sessionVersion);
  check("b", "그 자리에 실패 한 줄이 뜬다", (await s.page.locator(".v-sheet .v-line--fail").count()) === 1, await s.sheet());
  check("b", "틀린 횟수가 1 로 적힌다", after.failures === 1, String(after.failures));
  await s.context.close();
});

// c: 인증 앱 코드가 틀리면 바뀌지 않는다
await run("c", async () => {
  const s = await session("security");
  const before = await s.saved();
  await s.openSheet();
  const right = [-1, 0, 1].map((step) => totp(s.state.account.secret, Date.now() + step * 30000));
  const wrong = ["000000", "111111", "222222", "333333"].find((code) => !right.includes(code));
  await s.fill({ current: credentials.password, next: NEW_PASSWORD, code: wrong });
  await s.press();
  const after = await s.saved();
  check("c", "틀린 인증 앱 코드: 바뀌지 않고 로그인도 그대로다", after.passwordHash === before.passwordHash && after.session && after.sessionVersion === before.sessionVersion);
  check("c", "그 자리에 실패 한 줄이 뜬다", (await s.page.locator(".v-sheet .v-line--fail").count()) === 1, await s.sheet());
  await s.context.close();
});

// d: 인증 앱을 연결하지 않은 계정
await run("d", async () => {
  const s = await session("funded");
  const before = await s.saved();
  await s.openSheet();
  await s.fill({ current: credentials.password, next: NEW_PASSWORD, code: "123456" });
  await s.press(); await s.shot("d1-no-app");
  const after = await s.saved(); const text = await s.sheet();
  check("d", "인증 앱이 없는 계정: 바뀌지 않고 로그인도 그대로다", after.passwordHash === before.passwordHash && after.session && after.sessionVersion === before.sessionVersion);
  check("d", "까닭을 그 자리 한 줄로 알린다(인증 앱을 먼저 연결한다)", text.includes("인증 앱을 연결한 뒤에 비밀번호를 바꿀 수 있습니다"), text);
  check("d", "현재 비밀번호는 맞았으므로 틀린 횟수가 늘지 않는다", after.failures === 0, String(after.failures));
  check("d", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// e: 바꾸기 요청을 기다리는 사이에 이 탭의 계정이 다른 계정으로 바뀐 경우(migration-audit/CYCLE1_codex.md, E-03 의 짐작).
//    비밀번호를 바꾼 계정의 세션만 끝난 것이므로, 그 사이에 들어온 다른 계정의 로그인은 건드리지 않는다.
//    화면만으로는 그 순간에 계정을 바꿀 수 없어서, 개발 서버의 모듈 캐시에서 로그인 스토어를 찾아 바꾸기 요청이 끝난 바로 뒤에 다른 계정을 넣는다(개발 서버에서만 된다).
await run("e", async () => {
  const s = await session("security");
  await s.openSheet();
  await s.fill({ current: credentials.password, next: NEW_PASSWORD, code: totp(s.state.account.secret) });
  const hooked = await s.page.evaluate(() => {
    let req = null;
    try { window.webpackChunk_N_E.push([[Symbol("probe")], {}, (r) => { req = r; }]); } catch { return "모듈 캐시에 닿지 못했다"; }
    const mod = req && Object.values(req.c).find((m) => { try { return m?.exports?.useAuthStore?.getState; } catch { return false; } });
    if (!mod) return "로그인 스토어를 찾지 못했다";
    const store = mod.exports.useAuthStore; window.__authStore = store;
    const request = navigator.locks.request.bind(navigator.locks);
    // 단추가 일으키는 계정 서비스 요청은 차례로 현재 비밀번호 확인, 바꾸기다. 둘째가 끝난 바로 뒤에 다른 계정으로 바꾼다
    let calls = 0;
    navigator.locks.request = async (...args) => {
      const result = await request(...args);
      if (++calls === 2) { store.getState().acceptSession({ id: "other-account", email: "other@example.invalid", createdAt: new Date().toISOString(), emailVerified: true, local: true, nickname: "다른계정" }); window.__switched = true; }
      return result;
    };
    return "ok";
  });
  check("e", "시험 장치: 바꾸기 요청이 끝난 바로 뒤에 계정을 바꿀 준비가 됐다", hooked === "ok", hooked);
  if (hooked !== "ok") { await s.context.close(); return; }
  await s.page.locator(".v-sheet .v-btn").click();
  await s.page.waitForFunction(() => window.__switched === true, null, { timeout: 20000 }); await s.page.waitForTimeout(800); await s.shot("e1-account-switched");
  const after = await s.saved();
  const auth = await s.page.evaluate(() => { const st = window.__authStore.getState(); return { user: st.user?.id ?? null, sessionLost: st.sessionLost }; });
  check("e", "비밀번호는 바뀌었다(요청한 계정의 것)", after.passwordHash === hashOf(NEW_PASSWORD, after.salt));
  check("e", "그 사이에 들어온 다른 계정의 로그인은 그대로다(세션 끝남으로 바뀌지 않는다)", auth.user === "other-account" && auth.sessionLost === false, JSON.stringify(auth));
  await s.context.close();
});

await browser.close();
const failed = results.filter((r) => !r.pass);
if (out) fs.writeFileSync(`${out}/account-password-results.json`, JSON.stringify(results, null, 2));
console.log(`\n검사 ${results.length}개, 통과 ${results.length - failed.length}, 실패 ${failed.length}`);
process.exit(failed.length ? 1 : 0);
