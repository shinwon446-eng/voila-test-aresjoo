#!/usr/bin/env node
/**
 * E-01 의 경합을 화면에서 일으킨다(두 빌드): 출금 접수를 기다리는 사이에 같은 탭에서 잔액이 줄어든다.
 *   node e01-race.mjs
 * 방법(전부 브라우저 안의 시험 장부, 바깥 요청 없음)
 *   1. 탭 1: 이메일 인증 경로로 출금 9,990 을 넣고 코드 입력까지 간다(잔액 10,000).
 *   2. 같은 탭의 페이지 스크립트로 계정 서비스의 Web Lock(voila.browser-accounts.v1)을 1.5초 쥔다(다른 탭이 계정 서비스를 쓰고 있는 상황과 같다).
 *   3. 탭 1: 출금 신청을 누른다(코드 확인 요청이 잠금을 기다린다).
 *   4. 같은 잠금을 한 번 더 요청해 14초 쥔다(코드 확인 다음, 출금 접수 앞에 선다).
 *   5. 탭 1: 그 사이에 로고, 검색, 박스 화면으로 화면 안에서 이동해 50 짜리 박스를 하나 연다(잔액이 9,990 아래로 내려간다).
 *   6. 잠금이 풀리면 출금 접수가 끝난다. 그 뒤의 잔액, 거래, 접수 기록을 적는다.
 *   7. 지갑 내역에서 그 출금을 연다. 취소 단추가 있으면 취소하고 잔액을 다시 적는다.
 */
import { open, launch, save, SEL } from './c3.mjs';

const LOCK = 'voila.browser-accounts.v1';
const ledger = async (t) => { const raw = await t.raw(); const w = raw['voila.browser-wallet.capture-account']?.state ?? {}; const a = (raw['voila.browser-accounts.v1'] ?? [])[0] ?? {}; return { balance: w.balance, cryptoBalance: w.cryptoBalance, transactions: (w.transactions ?? []).map((x) => ({ type: x.type, amountUsdt: x.amountUsdt, status: x.status ?? null, debited: x.debited, serverId: x.serverId ? '있음' : undefined })), serviceWithdrawals: Object.values(a.withdrawals ?? {}).map((x) => x.status) }; };
const screen = (t) => t.page.evaluate(() => ({ path: location.pathname.split('/voila-test-aresjoo')[1], header: Array.from(document.querySelectorAll('.v-header .v-headbtn:not(.v-menu-btn)')).map((b) => b.innerText.trim()), title: document.querySelector('.v-main h1')?.innerText ?? null, lines: Array.from(document.querySelectorAll('.v-main .v-line, .v-sheet .v-line')).map((l) => l.innerText), rows: Array.from(document.querySelectorAll('.v-main .v-itemrows .v-itemrow')).map((r) => r.innerText.replace(/\s+/g, ' ')), sheet: document.querySelector('.v-sheet')?.innerText.replace(/\s+/g, ' ').slice(0, 400) ?? null }));

async function run(browser, build) {
  const log = [];
  const note = async (label) => { const entry = { label, screen: await screen(t), ledger: await ledger(t) }; log.push(entry); console.log(`[${build}] ${label}\n    화면 ${JSON.stringify(entry.screen).slice(0, 700)}\n    장부 ${JSON.stringify(entry.ledger)}`); };
  const t = await open(browser, build, { preset: 'funded', locale: 'ko', width: 1024, motion: 'no-preference', shotDir: 'e01-race' });
  try {
    await t.goto('/wallet/withdraw'); await t.wait('.v-main .v-links .v-link'); await t.pause(500);
    await t.click('.v-main .v-links .v-link'); await t.wait('.v-main form input');
    await t.fill('.v-main form input', 'T' + '1'.repeat(33), 0); await t.fill('.v-main form input', '9990', 1); await t.click('.v-main form button[type="submit"]'); await t.pause(400);
    await t.page.locator('.v-main .v-btn').first().click(); await t.wait('.v-main form button[type="submit"]');
    await t.click('.v-main form button[type="submit"]'); await t.wait('.v-main form input'); await t.fill('.v-main form input', '123456');
    await note('1 코드까지 넣음(신청 전)');
    // 잠금은 같은 탭에서 쥔다(새 탭을 열면 검증 도구의 상태 심기가 그 탭에서 다시 돌아 장부를 처음으로 되돌린다)
    const other = t.page;
    await other.evaluate((name) => { window.__held = []; window.__hold = (ms) => navigator.locks.request(name, () => new Promise((r) => { window.__held.push('start ' + Math.round(performance.now())); setTimeout(() => { window.__held.push('end ' + Math.round(performance.now())); r(); }, ms); })); void window.__hold(1500); }, LOCK);
    await t.click('.v-main form button[type="submit"]');
    await t.pause(150);
    await other.evaluate(() => { void window.__hold(14000); });
    // 잠금 1이 풀리고 코드 확인이 끝나 출금 접수가 잠금 2 뒤에 설 때까지
    await t.pause(2200);
    await note('2 출금 접수가 기다리는 중');
    await t.click('.v-logo'); await t.wait('.v-search input', { timeout: 15000 });
    await t.fill('.v-search input', 'playstation'); await t.pause(500);
    await t.click('.v-main .v-itemrows a.v-itemrow'); await t.page.waitForURL(/\/box\//, { timeout: 10000 }); await t.wait(SEL.open);
    await t.click(SEL.open); await t.confirm(); await t.wait(SEL.opSettled, { timeout: 20000 });
    await note('3 기다리는 사이에 박스 하나를 엶');
    // 잠금 2가 풀리고 출금 접수가 끝날 때까지
    await other.waitForFunction(() => window.__held.length >= 4, null, { timeout: 30000 });
    await t.pause(2500);
    await note('4 출금 접수가 끝난 뒤');
    await t.shot('4-after-commit');
    if (await t.has('.v-op-top .v-op-tool')) { await t.page.locator('.v-op-top .v-op-tool').last().click(); await t.gone('.v-op').catch(() => {}); }
    await t.goto('/wallet'); await t.wait('.v-main .v-itemrows'); await t.pause(800);
    await note('5 지갑 내역(새로 고침 뒤)'); await t.shot('5-wallet');
    const rows = t.page.locator('.v-main .v-itemrows .v-itemrow'); const n = await rows.count(); let found = false;
    for (let i = 0; i < n; i++) { await rows.nth(i).click(); await t.wait(SEL.sheet); if (await t.has('.v-sheet .v-address')) { found = true; break; } await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet); }
    if (found) {
      await note('6 출금 행을 엶'); await t.shot('6-withdraw-row');
      if (await t.has('.v-sheet .v-btn')) { await t.click('.v-sheet .v-btn'); await t.confirm(); await t.gone(SEL.alert).catch(() => {}); await t.pause(800); await note('7 출금을 취소한 뒤'); await t.shot('7-after-cancel'); }
      else log.push({ label: '7 취소 단추 없음' });
    } else log.push({ label: '6 출금 행이 내역에 없음' });
    await t.goto('/wallet/withdraw'); await t.wait('.v-main .v-title'); await t.pause(800);
    await note('8 출금 화면으로 다시'); await t.shot('8-withdraw-form');
    log.push({ label: '콘솔', console: t.errors.slice(0, 6) });
  } catch (error) { log.push({ label: '오류', error: String(error.message).split('\n')[0] }); console.log(`[${build}] 오류 ${String(error.message).split('\n')[0]}`); await t.shot('error'); }
  finally { await t.close(); }
  return log;
}
const browser = await launch();
const out = {};
try { for (const build of ['orig', 'result']) out[build] = await run(browser, build); } finally { await browser.close(); }
console.log('기록:', await save('e01-race.json', out));
