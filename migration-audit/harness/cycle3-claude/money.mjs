#!/usr/bin/env node
/**
 * 같은 심은 상태, 같은 조작을 두 빌드에 하고 보이는 것과 저장된 것을 단계마다 견준다(고정 시계, 고정 시드).
 *   node money.mjs [--only M1,M3] [--variants zh-430,ko-1024]
 * M1 열기 하나와 여럿, 받기 하나와 여럿, 지갑 내역, 통화 바꾸기, 새로 고침, 뒤로와 앞으로
 * M2 인증 앱 계정의 출금 신청(브라우저 안의 시험 장부) 뒤 지갑 내역
 * M3 72시간 대기 출금의 취소(심어 둔 대기 건)
 * M4 첫 방문: 화면에서 로그인(계정이 만들어진다), 가입 보너스와 무료 개봉, 무료로 열기, 지갑 내역
 * M5 같은 기기의 두 계정: A 가 열고 받은 뒤 로그아웃, B 로 로그인, B 의 지갑 내역에 A 의 거래가 섞이지 않는지
 */
import { createHmac } from 'node:crypto';
import { both, launch, save, report, SEL, loadStates } from './c3.mjs';

const argv = process.argv.slice(2);
const arg = (name) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : null; };
const only = arg('only')?.split(',') ?? null;
const variantArg = arg('variants');
const { credentials } = await loadStates();

/** RFC 6238 (SHA-1, 30초, 6자리). 프리셋의 시험용 비밀값으로만 쓴다 */
function totp(secretBase32, nowMs) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const ch of secretBase32.replace(/=+$/, '')) bits += alphabet.indexOf(ch).toString(2).padStart(5, '0');
  const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(nowMs / 30000)));
  const mac = createHmac('sha1', key).update(counter).digest();
  const offset = mac[mac.length - 1] & 15;
  return String(((mac.readUInt32BE(offset) & 0x7fffffff) % 1000000)).padStart(6, '0');
}

const openNow = async (t, { settle = SEL.opSettled } = {}) => {
  await t.click(SEL.open);
  if (await t.page.locator(SEL.alert).first().waitFor({ state: 'visible', timeout: 1200 }).then(() => true, () => false)) await t.confirm();
  await t.wait(settle, { timeout: 25000 });
};
/** 곧 눌릴 수 있게 되는 단추를 잠깐 기다린다(선택 시트의 미리 고르기는 뜬 다음 그리기에 들어온다) */
const enabled = (t, sel) => t.page.locator(sel).first().waitFor({ state: 'visible', timeout: 2500 }).then(() => true, () => false);
const closeOpening = async (t) => { if (await t.has('.v-op-top .v-op-tool')) { await t.page.locator('.v-op-top .v-op-tool').last().click(); await t.gone('.v-op'); } };
const currencyOf = (t) => t.page.evaluate(() => { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.endsWith('gachaflix.currency')) return JSON.parse(localStorage.getItem(k)).state.currency; } return null; });
const login = async (t, email, password) => {
  await t.click(SEL.login); await t.wait(SEL.sheet);
  await t.fill('.v-sheet input', email); await t.click('.v-sheet button[type="submit"]'); await t.wait('.v-sheet input[type="password"]');
  await t.fill('.v-sheet input[type="password"]', password); await t.click('.v-sheet button[type="submit"]');
  await t.wait(SEL.balance, { timeout: 20000 });
};
const walletRows = async (t, step, label) => {
  await step(`${label}: 지갑 내역`, async () => { await t.goto('/wallet'); await t.wait('.v-main .v-itemrows, .v-main .v-empty'); }, { shot: true });
};

const SCENARIOS = {
  M1: { variants: ['zh-430', 'ko-1024', 'en-360'], preset: 'funded', run: async (t, step) => {
    await step('시작(1달러 박스)', async () => { await t.goto('/box/dollar-apple'); await t.wait(SEL.open); });
    await step('하나 열기', async () => { await openNow(t); await t.pause(600); }, { shot: true });
    await step('닫기', async () => { await closeOpening(t); });
    await step('다섯 개 열기', async () => { await t.click(SEL.qty, 1); await openNow(t, { settle: '.v-reveal-result' }); await t.wait(SEL.revealArmed); }, { shot: true });
    await step('여럿 결과에서 뒤로 가기(브라우저)', async () => { await t.page.goBack().catch(() => {}); await t.pause(800); });
    await step('앞으로 가기(브라우저)', async () => { await t.page.goForward().catch(() => {}); await t.pause(800); });
    await step('박스 화면으로 다시', async () => { await t.goto('/box/gaming-playstation'); await t.wait(SEL.open); });
    await step('큰 금액 하나 열기', async () => { await openNow(t); await t.pause(600); }, { shot: true });
    await step('결과 화면에서 새로 고침', async () => { await t.page.reload({ waitUntil: 'domcontentloaded' }); await t.wait(SEL.open); await t.pause(800); }, { shot: true });
    await step('보관함', async () => { await t.goto('/inventory'); await t.wait('.v-main .v-chips'); }, { shot: true });
    await step('보관함: 하나 받기 확인창', async () => { await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); await t.click('[data-take-primary]'); await t.wait(SEL.alert); });
    await step('보관함: 하나 받기 확정', async () => { await t.confirm(); await t.gone(SEL.alert); await t.pause(500); }, { shot: true });
    await step('보관함: 보관 중 탭', async () => { await t.click('.v-main .v-chips .v-chip', 0); await t.pause(300); });
    await step('보관함: 묶음 받기 전체 선택', async () => { if (await t.has('[data-take-batch]')) { await t.click('[data-take-batch]'); await t.wait('[data-take-all]'); await t.click('[data-take-all]'); } });
    await step('보관함: 묶음 받기 확정', async () => { if (await enabled(t, '[data-take-submit]:not([disabled])')) { await t.click('[data-take-submit]'); await t.confirm(); await t.wait('[data-take-done]'); } }, { shot: true });
    await step('보관함: 묶음 받기 닫기', async () => { if (await t.has('[data-take-done]')) { await t.click('[data-take-done]'); await t.pause(300); } });
    await step('포켓몬 박스 다섯 개(무료 2개 포함) 열기', async () => { await t.goto('/box/pokemon-charizard'); await t.wait(SEL.open); await t.click(SEL.qty, 1); await openNow(t, { settle: '.v-reveal-result' }); await t.wait(SEL.revealArmed); }, { shot: true });
    await step('여럿 결과: 묶음 받기', async () => { if (await t.has('[data-take-batch]')) { await t.click('[data-take-batch]'); await t.wait('[data-take-all]'); if (await enabled(t, '[data-take-submit]:not([disabled])')) { await t.click('[data-take-submit]'); await t.confirm(); await t.wait('[data-take-done]'); } } }, { shot: true });
    await step('여럿 결과: 돌아와 닫기', async () => { if (await t.has('[data-take-done]')) await t.click('[data-take-done]'); await t.pause(300); if (await t.has('.v-reveal > .v-sheet-close')) { await t.click('.v-reveal > .v-sheet-close'); await t.gone('.v-reveal'); } });
    await walletRows(t, step, 'USDT');
    await step('내역 첫 행 열기', async () => { await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); }, { shot: true });
    await step('내역 시트 닫기(Escape)', async () => { await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet); });
    for (let i = 0; i < 2; i++) {
      await step(`통화 바꾸기 ${i + 1}`, async () => { await t.page.locator('.v-footer-cols button').first().scrollIntoViewIfNeeded(); await t.page.locator('.v-footer-cols button').first().click(); await t.pause(300); await t.page.evaluate(() => window.scrollTo(0, 0)); }, { shot: true });
      await step(`통화 ${i + 1}: 새로 고침`, async () => { await t.page.reload({ waitUntil: 'domcontentloaded' }); await t.wait('.v-main .v-itemrows'); await t.pause(500); });
    }
    await step('출금 화면(통화 그대로)', async () => { await t.goto('/wallet/withdraw'); await t.wait('.v-main .v-title'); await t.pause(600); }, { shot: true });
    await step('나온 상품', async () => { await t.goto('/wins'); await t.wait('.v-main .v-title'); await t.pause(500); }, { shot: true });
  } },
  M2: { variants: ['zh-390', 'ko-1440'], preset: 'security', run: async (t, step) => {
    await step('출금 화면', async () => { await t.goto('/wallet/withdraw'); await t.wait('.v-main form input'); });
    await step('주소와 금액', async () => { await t.fill('.v-main form input', 'T' + '1'.repeat(33), 0); await t.fill('.v-main form input', '100', 1); await t.click('.v-main form button[type="submit"]'); await t.pause(400); }, { shot: true });
    await step('인증 단계로', async () => { await t.page.locator('.v-main .v-btn').first().click(); await t.wait('.v-main form input'); });
    await step('코드 다섯 자리로 누름(입력 검증)', async () => { await t.fill('.v-main form input', '12345'); await t.click('.v-main form button[type="submit"]'); await t.pause(600); });
    await step('인증 앱 코드로 출금 신청', async () => { const now = await t.page.evaluate(() => Date.now()); await t.fill('.v-main form input', totp('JBSWY3DPEHPK3PXP', now)); await t.click('.v-main form button[type="submit"]'); await t.pause(1500); }, { shot: true });
    await walletRows(t, step, '출금 뒤');
    await step('출금 행 열기', async () => { const rows = t.page.locator('.v-main .v-itemrows .v-itemrow'); const n = await rows.count(); for (let i = 0; i < n; i++) { await rows.nth(i).click(); await t.wait(SEL.sheet); if (await t.has('.v-sheet .v-address')) break; await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet); } }, { shot: true });
    await step('새로 고침', async () => { await t.page.reload({ waitUntil: 'domcontentloaded' }); await t.wait('.v-main .v-itemrows'); await t.pause(600); });
  } },
  // 이메일 인증 경로의 출금(72시간 대기) 신청과 그 취소. 브라우저 안의 시험 장부는 여섯 자리 숫자면 코드로 받는다(lib/browserAccount.ts 의 codeAccepted)
  M2b: { variants: ['zh-430', 'ko-1024'], preset: 'funded', run: async (t, step) => {
    await step('출금 화면(인증 앱 없음)', async () => { await t.goto('/wallet/withdraw'); await t.wait('.v-main .v-links .v-link'); await t.pause(500); });
    await step('이메일 인증 경로', async () => { await t.click('.v-main .v-links .v-link'); await t.wait('.v-main form input'); });
    await step('주소와 금액', async () => { await t.fill('.v-main form input', 'T' + '1'.repeat(33), 0); await t.fill('.v-main form input', '250.5', 1); await t.click('.v-main form button[type="submit"]'); await t.pause(400); }, { shot: true });
    await step('인증 단계로', async () => { await t.page.locator('.v-main .v-btn').first().click(); await t.wait('.v-main form button[type="submit"]'); });
    await step('코드 보내기', async () => { await t.click('.v-main form button[type="submit"]'); await t.wait('.v-main form input'); }, { shot: true });
    await step('코드를 넣고 출금 신청', async () => { await t.fill('.v-main form input', '123456'); await t.click('.v-main form button[type="submit"]'); await t.pause(1500); }, { shot: true });
    await walletRows(t, step, '출금 뒤');
    await step('출금 행 열기', async () => { const rows = t.page.locator('.v-main .v-itemrows .v-itemrow'); const n = await rows.count(); for (let i = 0; i < n; i++) { await rows.nth(i).click(); await t.wait(SEL.sheet); if (await t.has('.v-sheet .v-address')) break; await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet); } }, { shot: true });
    await step('출금 취소 확정', async () => { await t.click('.v-sheet .v-btn'); await t.confirm(); await t.gone(SEL.alert); await t.pause(600); }, { shot: true });
    await step('새로 고침', async () => { await t.page.reload({ waitUntil: 'domcontentloaded' }); await t.wait('.v-main .v-itemrows'); await t.pause(600); }, { shot: true });
    await step('취소된 행 열기', async () => { const rows = t.page.locator('.v-main .v-itemrows .v-itemrow'); const n = await rows.count(); for (let i = 0; i < n; i++) { await rows.nth(i).click(); await t.wait(SEL.sheet); if (await t.has('.v-sheet .v-address')) break; await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet); } }, { shot: true });
  } },
  M3: { variants: ['ko-390', 'zh-1024', 'en-430'], preset: 'pending', run: async (t, step) => {
    await walletRows(t, step, '시작');
    await step('72시간 대기 행 열기', async () => {
      const rows = t.page.locator('.v-main .v-itemrows .v-itemrow'); const n = await rows.count();
      for (let i = 0; i < n; i++) { await rows.nth(i).click(); await t.wait(SEL.sheet); if (await t.has('.v-sheet .v-btn')) break; await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet); }
    }, { shot: true });
    await step('출금 취소 확인창', async () => { await t.click('.v-sheet .v-btn'); await t.wait(SEL.alert); }, { shot: true });
    await step('취소하지 않기', async () => { await t.click(SEL.alertCancel); await t.gone(SEL.alert); });
    await step('출금 취소 확정', async () => { await t.click('.v-sheet .v-btn'); await t.confirm(); await t.gone(SEL.alert); await t.pause(600); }, { shot: true });
    await step('새로 고침', async () => { await t.page.reload({ waitUntil: 'domcontentloaded' }); await t.wait('.v-main .v-itemrows'); await t.pause(600); }, { shot: true });
    await step('통화 바꾸기', async () => { await t.page.locator('.v-footer-cols button').first().scrollIntoViewIfNeeded(); await t.page.locator('.v-footer-cols button').first().click(); await t.pause(300); await t.page.evaluate(() => window.scrollTo(0, 0)); }, { shot: true });
    await step('통화 한 번 더', async () => { await t.page.locator('.v-footer-cols button').first().scrollIntoViewIfNeeded(); await t.page.locator('.v-footer-cols button').first().click(); await t.pause(300); await t.page.evaluate(() => window.scrollTo(0, 0)); }, { shot: true });
  } },
  M4: { variants: ['zh-360', 'ko-1024'], preset: 'firstVisit', run: async (t, step) => {
    await step('홈(첫 방문)', async () => { await t.goto(''); await t.wait('.v-boxgrid'); });
    await step('로그인(계정이 만들어진다)', async () => { await login(t, 'c3-first@example.invalid', 'C3FirstVisit-Only-123'); await t.pause(800); }, { shot: true });
    await step('무료 개봉 박스', async () => { await t.goto('/box/pokemon-charizard'); await t.wait(SEL.open); await t.pause(500); }, { shot: true });
    await step('무료로 하나 열기', async () => { await openNow(t); await t.pause(600); }, { shot: true });
    await step('닫기', async () => { await closeOpening(t); });
    await walletRows(t, step, '무료 개봉 뒤');
    await step('새로 고침', async () => { await t.page.reload({ waitUntil: 'domcontentloaded' }); await t.wait('.v-main .v-itemrows'); await t.pause(600); }, { shot: true });
    await step('통화 바꾸기', async () => { await t.page.locator('.v-footer-cols button').first().scrollIntoViewIfNeeded(); await t.page.locator('.v-footer-cols button').first().click(); await t.pause(300); await t.page.evaluate(() => window.scrollTo(0, 0)); }, { shot: true });
  } },
  M5: { variants: ['ko-390', 'zh-1024'], preset: 'funded', run: async (t, step) => {
    await step('A: 하나 열기', async () => { await t.goto('/box/dollar-apple'); await t.wait(SEL.open); await openNow(t); await t.pause(500); await closeOpening(t); });
    await step('A: 큰 금액 열고 받기', async () => { await t.goto('/box/gaming-playstation'); await t.wait(SEL.open); await openNow(t); await t.click('[data-take-primary]'); await t.confirm(); await t.wait('[data-taken-title]'); await closeOpening(t); });
    await walletRows(t, step, 'A');
    await step('A: 로그아웃', async () => { await t.goto('/account'); await t.wait('.v-main .v-rows'); await t.page.locator('.v-main .v-links .v-link').last().click(); await t.confirm(); await t.wait(SEL.login); await t.pause(500); });
    await step('손님: 지갑', async () => { await t.goto('/wallet'); await t.wait('.v-main .v-title'); await t.pause(500); });
    await step('B: 로그인(새 계정)', async () => { await login(t, 'c3-second@example.invalid', 'C3Second-Only-123456'); await t.pause(800); });
    await walletRows(t, step, 'B');
    await step('B: 하나 열기', async () => { await t.goto('/box/dollar-apple'); await t.wait(SEL.open); await openNow(t); await t.pause(500); await closeOpening(t); });
    await walletRows(t, step, 'B 개봉 뒤');
    await step('B: 로그아웃', async () => { await t.goto('/account'); await t.wait('.v-main .v-rows'); await t.page.locator('.v-main .v-links .v-link').last().click(); await t.confirm(); await t.wait(SEL.login); await t.pause(500); });
    await step('A: 다시 로그인', async () => { await login(t, credentials.email, credentials.password); await t.pause(800); });
    await walletRows(t, step, 'A 다시');
  } },
};

const browser = await launch();
const all = [];
try {
  for (const [key, def] of Object.entries(SCENARIOS)) {
    if (only && !only.includes(key)) continue;
    for (const variant of (variantArg ? variantArg.split(',') : def.variants)) {
      const [locale, width] = variant.split('-');
      const result = await both(browser, `money-${key}-${variant}`, { preset: def.preset, locale, width: Number(width), motion: 'no-preference' }, def.run);
      all.push(result);
      console.log(report(result));
      await save(`money-${key}-${variant}.json`, result);
    }
  }
} finally { await browser.close(); }
