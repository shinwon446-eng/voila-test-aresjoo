#!/usr/bin/env node
/**
 * E-03 계정 화면의 비밀번호 바꾸기를 공격한다(127.0.0.1 의 시험 빌드, 프리셋의 시험 계정과 시험 비밀번호만 쓴다).
 *   node password.mjs
 * P1 인증 앱 계정(결과): 빈 값, 틀린 현재 비밀번호, 틀린 코드, 같은 비밀번호, 성공, 성공 뒤의 세션과 다른 탭, 옛 비밀번호와 새 비밀번호로 로그인
 * P2 인증 앱이 없는 계정(결과): 맞는 값, 틀린 현재 비밀번호 다섯 번(잠김), 잠긴 뒤 맞는 값, 새로 고침과 다시 로그인 뒤
 * P3 원본의 같은 조작(대조)
 */
import { createHmac } from 'node:crypto';
import { open, launch, save, SEL, loadStates } from './c3.mjs';

const { credentials } = await loadStates();
const NEW_PASSWORD = 'C3-Changed-Only-4567';
function totp(secretBase32, nowMs) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const ch of secretBase32) bits += alphabet.indexOf(ch).toString(2).padStart(5, '0');
  const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(nowMs / 30000)));
  const mac = createHmac('sha1', key).update(counter).digest();
  const offset = mac[mac.length - 1] & 15;
  return String(((mac.readUInt32BE(offset) & 0x7fffffff) % 1000000)).padStart(6, '0');
}
const account = async (t) => { const raw = await t.raw(); const a = (raw['voila.browser-accounts.v1'] ?? [])[0] ?? {}; return { session: raw['voila.browser-session.v1'] ?? null, auth: raw['voila-auth-v1']?.state?.user?.id ?? null, revocation: raw['voila.account-revocation.v1'] ?? null, passwordFailures: a.passwordFailures ?? null, verifiedUntil: a.passwordVerifiedUntil ? 'set' : null, strictPassword: a.strictPassword ?? null, sessionVersion: a.user?.sessionVersion ?? null, otpFailures: a.passwordOtpFailures ?? null, otpLockedUntil: a.passwordOtpLockedUntil ? 'set' : null, passwordChangedAt: a.user?.passwordChangedAt ?? null, walletBalance: raw['voila.browser-wallet.capture-account']?.state?.balance ?? null }; };
const sheetState = async (t) => t.page.evaluate(() => { const s = document.querySelector('.v-sheet'); if (!s) return null; return { title: s.querySelector('h2')?.innerText, desc: s.querySelector('.v-desc')?.innerText ?? null, lines: Array.from(s.querySelectorAll('.v-line')).map((l) => l.innerText), inputs: Array.from(s.querySelectorAll('input')).map((i) => i.type === 'password' ? (i.value ? '(채워짐 ' + i.value.length + '자)' : '') : i.value), buttons: Array.from(s.querySelectorAll('.v-btn')).map((b) => b.innerText + (b.disabled ? ' [disabled]' : '')) }; });
const screen = async (t) => t.page.evaluate(() => ({ header: Array.from(document.querySelectorAll('.v-header .v-headbtn:not(.v-menu-btn)')).map((b) => b.innerText.trim()), offline: Array.from(document.querySelectorAll('.v-offline')).map((b) => b.innerText.trim()), title: document.querySelector('.v-main h1')?.innerText, desc: document.querySelector('.v-main .v-desc')?.innerText ?? null, rows: document.querySelectorAll('.v-main .v-row').length }));
const openSheet = async (t) => { await t.goto('/account'); await t.wait('.v-main .v-rows'); await t.page.locator('.v-main .v-row--button').nth(2).click(); await t.wait('.v-sheet input[type="password"]'); };
const attempt = async (t, current, next, code) => {
  const pw = t.page.locator('.v-sheet input[type="password"]');
  await pw.nth(0).fill(current); await pw.nth(1).fill(next); await t.page.locator('.v-sheet input:not([type="password"])').first().fill(code);
  await t.page.locator('.v-sheet .v-btn').first().click(); await t.pause(1200);
};
const log = [];
const note = async (t, label, extra = {}) => { const entry = { build: t.build, label, sheet: await sheetState(t), screen: await screen(t), account: await account(t), ...extra }; log.push(entry); console.log(`[${t.build}] ${label}\n    sheet=${JSON.stringify(entry.sheet)}\n    screen=${JSON.stringify(entry.screen)}\n    account=${JSON.stringify(entry.account)}${extra.more ? '\n    ' + JSON.stringify(extra.more) : ''}`); return entry; };
const loginSheet = async (t, email, password) => {
  await t.wait('.v-sheet input'); await t.fill('.v-sheet input', email); await t.click('.v-sheet button[type="submit"]'); await t.wait('.v-sheet input[type="password"]');
  await t.fill('.v-sheet input[type="password"]', password); await t.click('.v-sheet button[type="submit"]'); await t.pause(2500);
};

const browser = await launch();
try {
  // ── P1 인증 앱 계정, 결과 빌드 ─────────────────────────────────────────────
  {
    const t = await open(browser, 'result', { preset: 'security', locale: 'ko', width: 390, shotDir: 'password' });
    const code = async () => totp('JBSWY3DPEHPK3PXP', await t.page.evaluate(() => Date.now()));
    await openSheet(t);
    await note(t, 'P1-0 시트를 연 직후');
    await t.page.locator('.v-sheet .v-btn').first().click(); await t.pause(500);
    await note(t, 'P1-1 빈 채로 누름');
    await attempt(t, 'Wrong-Current-000000', NEW_PASSWORD, await code());
    await note(t, 'P1-2 틀린 현재 비밀번호, 맞는 코드'); await t.shot('p1-2-wrong-current');
    await attempt(t, credentials.password, NEW_PASSWORD, '000000');
    await note(t, 'P1-3 맞는 현재 비밀번호, 틀린 코드'); await t.shot('p1-3-wrong-code');
    await attempt(t, credentials.password, NEW_PASSWORD, '12');
    await note(t, 'P1-4 맞는 현재 비밀번호, 코드 두 자리');
    await attempt(t, credentials.password, credentials.password, await code());
    await note(t, 'P1-5 새 비밀번호가 현재와 같음');
    // 닫았다 다시 열면 칸과 오류 줄이 어떻게 되는지
    await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet); await t.page.locator('.v-main .v-row--button').nth(2).click(); await t.wait('.v-sheet input[type="password"]');
    await note(t, 'P1-6 닫았다 다시 연 직후');
    // 다른 탭을 하나 띄워 둔다
    const other = await t.context.newPage(); t.hook(other);
    await other.clock.setFixedTime(new Date(await t.page.evaluate(() => Date.now())));
    await other.goto(t.url('/wallet'), { waitUntil: 'domcontentloaded' }); await other.locator('.v-main .v-itemrows, .v-main .v-empty').first().waitFor({ timeout: 15000 }); await other.waitForTimeout(800);
    const otherBefore = await other.evaluate(() => ({ header: Array.from(document.querySelectorAll('.v-header .v-headbtn:not(.v-menu-btn)')).map((b) => b.innerText.trim()), rows: document.querySelectorAll('.v-main .v-itemrow').length }));
    await t.page.bringToFront();
    await attempt(t, credentials.password, NEW_PASSWORD, await code());
    await note(t, 'P1-7 맞는 값 전부(성공을 기대)', { more: { otherBefore } }); await t.shot('p1-7-done');
    const otherAfter = await other.evaluate(() => ({ header: Array.from(document.querySelectorAll('.v-header .v-headbtn:not(.v-menu-btn)')).map((b) => b.innerText.trim()), offline: Array.from(document.querySelectorAll('.v-offline')).map((b) => b.innerText.trim()), rows: document.querySelectorAll('.v-main .v-itemrow').length }));
    await other.evaluate(() => { window.dispatchEvent(new Event('focus')); }); await other.waitForTimeout(1500);
    const otherFocused = await other.evaluate(() => ({ header: Array.from(document.querySelectorAll('.v-header .v-headbtn:not(.v-menu-btn)')).map((b) => b.innerText.trim()), offline: Array.from(document.querySelectorAll('.v-offline')).map((b) => b.innerText.trim()), rows: document.querySelectorAll('.v-main .v-itemrow').length }));
    console.log('    다른 탭: 바꾸기 전', JSON.stringify(otherBefore), '바꾼 직후(포커스 전)', JSON.stringify(otherAfter), '포커스 뒤', JSON.stringify(otherFocused));
    log.push({ build: 'result', label: 'P1-7 다른 탭', otherBefore, otherAfter, otherFocused });
    await other.close();
    // 성공 시트의 단추: 로그인 시트로
    if ((await sheetState(t))?.buttons?.length === 1) { await t.page.locator('.v-sheet .v-btn').first().click(); await t.pause(600); }
    await note(t, 'P1-8 성공 시트의 단추를 누른 뒤'); await t.shot('p1-8-login-sheet');
    if (await t.has('.v-sheet input')) { await loginSheet(t, credentials.email, credentials.password); await note(t, 'P1-9 옛 비밀번호로 로그인 시도'); }
    if (await t.has('.v-sheet input[type="password"]')) { await t.fill('.v-sheet input[type="password"]', NEW_PASSWORD); await t.click('.v-sheet button[type="submit"]'); await t.pause(2500); }
    else if (!(await t.has(SEL.balance))) { await t.click(SEL.login).catch(() => {}); await loginSheet(t, credentials.email, NEW_PASSWORD); }
    await note(t, 'P1-10 새 비밀번호로 로그인'); await t.shot('p1-10-relogin');
    await t.page.reload({ waitUntil: 'domcontentloaded' }); await t.pause(1500);
    await note(t, 'P1-11 새로 고침 뒤');
    log.push({ build: 'result', label: 'P1 콘솔', console: t.errors });
    console.log('    콘솔:', JSON.stringify(t.errors.slice(0, 8)));
    await t.close();
  }
  // ── P2 인증 앱이 없는 계정, 결과 빌드 ───────────────────────────────────────
  {
    const t = await open(browser, 'result', { preset: 'funded', locale: 'zh', width: 1024, shotDir: 'password' });
    await openSheet(t);
    await note(t, 'P2-0 시트를 연 직후(인증 앱 없음, 중국어)');
    await attempt(t, credentials.password, NEW_PASSWORD, '');
    await note(t, 'P2-1 맞는 현재 비밀번호, 코드 없음'); await t.shot('p2-1-needs-app');
    await attempt(t, credentials.password, NEW_PASSWORD, '123456');
    await note(t, 'P2-2 맞는 현재 비밀번호, 아무 코드');
    for (let i = 1; i <= 5; i++) { await attempt(t, 'Wrong-Current-00000' + i, NEW_PASSWORD, '123456'); await note(t, `P2-3.${i} 틀린 현재 비밀번호 ${i}번째`); }
    await t.shot('p2-3-locked');
    await attempt(t, credentials.password, NEW_PASSWORD, '123456');
    await note(t, 'P2-4 잠긴 뒤 맞는 현재 비밀번호'); await t.shot('p2-4-after-lock');
    await t.page.reload({ waitUntil: 'domcontentloaded' }); await t.wait('.v-main .v-rows'); await t.pause(800);
    await t.page.locator('.v-main .v-row--button').nth(2).click(); await t.wait('.v-sheet input[type="password"]');
    await attempt(t, credentials.password, NEW_PASSWORD, '123456');
    await note(t, 'P2-5 새로 고침 뒤 맞는 현재 비밀번호');
    // 로그아웃하고 다시 로그인하면 풀리는지
    await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet);
    await t.page.locator('.v-main .v-links .v-link').last().click(); await t.confirm(); await t.wait(SEL.login); await t.pause(500);
    await t.click(SEL.login); await loginSheet(t, credentials.email, credentials.password);
    await note(t, 'P2-6 로그아웃 뒤 다시 로그인');
    await openSheet(t); await attempt(t, credentials.password, NEW_PASSWORD, '123456');
    await note(t, 'P2-7 다시 로그인한 뒤 맞는 현재 비밀번호'); await t.shot('p2-7-still-locked');
    console.log('    콘솔:', JSON.stringify(t.errors.slice(0, 8)));
    log.push({ build: 'result', label: 'P2 콘솔', console: t.errors });
    await t.close();
  }
  // ── P3 원본 대조 ───────────────────────────────────────────────────────────
  {
    const t = await open(browser, 'orig', { preset: 'security', locale: 'ko', width: 390, shotDir: 'password' });
    const code = async () => totp('JBSWY3DPEHPK3PXP', await t.page.evaluate(() => Date.now()));
    await openSheet(t);
    await note(t, 'P3-0 원본: 시트를 연 직후');
    await attempt(t, 'Wrong-Current-000000', NEW_PASSWORD, await code());
    await note(t, 'P3-1 원본: 틀린 현재 비밀번호');
    await attempt(t, credentials.password, NEW_PASSWORD, '12');
    await note(t, 'P3-2 원본: 코드 두 자리');
    await attempt(t, credentials.password, NEW_PASSWORD, await code());
    await note(t, 'P3-3 원본: 맞는 값 전부'); await t.shot('p3-3-orig');
    await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet); await t.page.locator('.v-main .v-row--button').nth(2).click(); await t.wait('.v-sheet input[type="password"]');
    await note(t, 'P3-4 원본: 닫았다 다시 연 직후');
    await t.close();
    const u = await open(browser, 'orig', { preset: 'funded', locale: 'zh', width: 1024, shotDir: 'password' });
    await openSheet(u);
    for (let i = 1; i <= 5; i++) await attempt(u, 'Wrong-Current-00000' + i, NEW_PASSWORD, '123456');
    await note(u, 'P3-5 원본: 인증 앱 없는 계정, 틀린 현재 비밀번호 다섯 번 뒤');
    await u.close();
  }
} finally { await browser.close(); }
console.log('기록:', await save('password.json', log));
