// 덧붙인 확인 셋:
//  (가) 후기 목록을 편 채로 다른 화면에 갔다가 뒤로 오면 편 상태와 스크롤 자리가 남는가(결과 빌드). 원본은 같은 길(후기 → 박스 → 뒤로)의 스크롤 자리.
//  (나) 계정 화면의 비밀번호 바꾸기 시트: 인증 앱이 없는 계정에서 두 빌드가 무엇을 말하는가, 시트를 연 채 새로 고침.
//  (다) 확인창이 뜨자마자 Enter 를 누른 것(자판)과 0.6초 뒤의 Enter.
import { launch, openSession, saveJson, SEL } from './lib.mjs';
import { loadStates } from '../lib/common.mjs';

const { credentials } = await loadStates();
const browser = await launch();
const out = { back: {}, password: {}, confirmKey: {} };
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
try {
  // (가)
  for (const build of ['orig', 'result']) {
    const t = await openSession(browser, build, { preset: 'guest', width: 390, fixedClock: false });
    const r = {};
    try {
      await t.goto('/reviews'); await t.wait('.v-rv, .v-rvcard'); await t.settle({ quiet: 400 });
      for (let i = 0; i < 4; i++) { const more = t.page.locator('[data-reviews-more]'); if (!(await more.isVisible().catch(() => false))) break; await more.click(); await t.page.waitForTimeout(150); }
      const rows = t.page.locator('.v-rv-btn, .v-rvcard-btn'); const n = await rows.count(); const target = Math.min(n - 1, build === 'orig' ? 24 : 90);
      await rows.nth(target).scrollIntoViewIfNeeded(); await t.page.waitForTimeout(200);
      r.before = { rows: n, target, scrollY: await t.page.evaluate(() => Math.round(scrollY)) };
      await rows.nth(target).click(); await t.wait(SEL.sheet);
      await t.page.locator('.v-sheet .v-links .v-link').last().click(); await t.page.waitForURL(/\/box\//, { timeout: 15000 }); await t.wait('.v-boxlayout'); await t.page.waitForTimeout(500);
      r.onBox = t.page.url().replace(/^.*voila-test-aresjoo/, '');
      await t.page.goBack(); await t.wait('.v-rv, .v-rvcard'); await t.page.waitForTimeout(1200);
      r.afterBack = { url: t.page.url().replace(/^.*voila-test-aresjoo/, ''), rows: await t.page.locator('.v-rv-btn, .v-rvcard-btn').count(), scrollY: await t.page.evaluate(() => Math.round(scrollY)), docHeight: await t.page.evaluate(() => document.documentElement.scrollHeight), sheetOpen: await t.has(SEL.sheet) };
      // 박스 화면에서 편 뒤 "후기 모두 보기"로 갔다가 뒤로
      await t.goto('/box/dollar-apple'); await t.wait('#reviews'); await t.settle({ quiet: 400 });
      for (let i = 0; i < 3; i++) { const more = t.page.locator('[data-reviews-more]'); if (!(await more.isVisible().catch(() => false))) break; await more.click(); await t.page.waitForTimeout(150); }
      r.boxBefore = { rows: await t.page.locator('.v-rv-btn, .v-rvcard-btn').count() };
      await t.page.locator('#reviews .v-links .v-link').first().scrollIntoViewIfNeeded(); r.boxBefore.scrollY = await t.page.evaluate(() => Math.round(scrollY));
      await t.page.locator('#reviews .v-links .v-link').first().click(); await t.page.waitForURL(/\/reviews\//, { timeout: 15000 }); await t.page.waitForTimeout(600);
      await t.page.goBack(); await t.wait('#reviews'); await t.page.waitForTimeout(1200);
      r.boxAfterBack = { rows: await t.page.locator('.v-rv-btn, .v-rvcard-btn').count(), scrollY: await t.page.evaluate(() => Math.round(scrollY)) };
      // 새로 고침
      await t.page.reload(); await t.wait('#reviews'); await t.page.waitForTimeout(800); r.boxAfterReload = { rows: await t.page.locator('.v-rv-btn, .v-rvcard-btn').count() };
      r.errors = t.errors;
    } catch (error) { r.error = String(error.message).split('\n')[0].slice(0, 200); }
    out.back[build] = r; await t.close();
  }
  // (나)
  for (const build of ['orig', 'result']) {
    const t = await openSession(browser, build, { preset: 'funded', width: 390, fixedClock: false });
    const r = {};
    try {
      await t.goto('/account'); await t.wait('.v-main .v-rows'); await t.settle({ quiet: 400 });
      await t.page.locator('.v-main button', { hasText: '비밀번호' }).first().click(); await t.wait('.v-sheet input');
      r.fields = await t.page.locator('.v-sheet input').evaluateAll((list) => list.map((i) => i.type + ':' + (i.getAttribute('autocomplete') ?? '') + ':' + (i.getAttribute('inputmode') ?? '')));
      r.sheetText = clean(await t.page.locator(SEL.sheet).innerText()).slice(0, 240);
      const inputs = t.page.locator('.v-sheet input');
      // 빈 채로
      await t.page.locator('.v-sheet .v-btn').last().click(); await t.page.waitForTimeout(500); r.empty = (await t.page.locator('.v-sheet .v-line').allInnerTexts()).map(clean);
      // 촬영용 고정 비밀번호와 새 비밀번호, 여섯 자리 코드
      await inputs.nth(0).fill(credentials.password); await inputs.nth(1).fill('Changed-Only-For-Test-9'); if ((await inputs.count()) > 2) await inputs.nth(2).fill('123456');
      await t.page.locator('.v-sheet .v-btn').last().click(); await t.page.waitForTimeout(2500);
      r.submit = { lines: (await t.page.locator('.v-sheet .v-line').allInnerTexts()).map(clean), sheetOpen: await t.has(SEL.sheet), text: clean(await t.page.locator(SEL.sheet).innerText().catch(() => '')).slice(0, 200) };
      const s = await t.storage(); const account = (s['voila.browser-accounts.v1'] ?? [])[0] ?? {};
      r.account = { failures: account.user?.passwordFailures, sessionVersion: account.user?.sessionVersion, session: s['voila.browser-session.v1'] ?? null };
      await t.shot(`robust-password-${build}`);
      await t.page.reload(); await t.wait('.v-main'); await t.page.waitForTimeout(800);
      r.afterReload = { sheetOpen: await t.has(SEL.sheet), loggedIn: await t.has(SEL.balance) };
      r.errors = t.errors;
    } catch (error) { r.error = String(error.message).split('\n')[0].slice(0, 200); }
    out.password[build] = r; await t.close();
  }
  // (다)
  for (const build of ['orig', 'result']) {
    const t = await openSession(browser, build, { preset: 'funded', width: 390, fixedClock: false });
    const r = {};
    try {
      const nonce = async () => (await t.storage())['gachaflix.fair']?.state?.nonce;
      await t.goto('/box/gaming-playstation'); await t.wait(SEL.open); await t.settle({ quiet: 400 });
      await t.page.locator(SEL.open).focus(); await t.page.keyboard.press('Enter'); await t.wait(SEL.alert);
      r.focusOnOpen = await t.page.evaluate(() => { const el = document.activeElement; return el ? el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0] + ':' + el.innerText.slice(0, 20) : null; });
      // 확정 단추에 초점을 주고 바로 Enter
      await t.page.locator(SEL.alertOk).focus(); await t.page.keyboard.press('Enter'); await t.page.waitForTimeout(250);
      r.afterInstantEnter = { alertOpen: await t.has(SEL.alert), nonce: await nonce(), disabled: await t.page.locator(SEL.alertOk).isDisabled().catch(() => null), ariaDisabled: await t.page.locator(SEL.alertOk).getAttribute('aria-disabled').catch(() => null) };
      if (await t.has(SEL.alert)) { await t.page.waitForTimeout(500); await t.page.keyboard.press('Enter'); await t.page.waitForTimeout(400); r.afterSecondEnter = { alertOpen: await t.has(SEL.alert), nonce: await nonce() }; }
      await t.wait(SEL.opSettled, { timeout: 20000 }); r.final = { nonce: await nonce() };
      r.errors = t.errors;
    } catch (error) { r.error = String(error.message).split('\n')[0].slice(0, 200); }
    out.confirmKey[build] = r; await t.close();
  }
} finally { await browser.close(); }
await saveJson('extra3.json', out);
console.log(JSON.stringify(out, null, 1));
