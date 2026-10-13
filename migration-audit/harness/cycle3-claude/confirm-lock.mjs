#!/usr/bin/env node
/**
 * E-08 확인창 잠금을 확인창이 쓰이는 자리마다 실제 시계로 본다.
 *   node confirm-lock.mjs [--only key,key] [--builds result,orig]
 * 한 자리마다 세 번 돈다(입력 방법: touch 390, mouse 1440, keyboard 1440).
 *   1. 확인창이 DOM 에 들어온 순간부터 0, 120, 300ms 에 페이지 안에서 확정 단추를 누른다(잠금 안의 누름).
 *   2. 900ms 뒤: 확인창이 그대로 떠 있고 저장값이 그대로인지 본다(잠금 안의 누름이 쌓였다가 나중에 실행되지 않는지).
 *   3. 창 포커스와 visibilitychange 를 보내 다시 그리게 한 뒤(잠금이 다시 시작되지 않는지) 곧바로 진짜 입력으로 한 번 누른다.
 *   4. 확정이 실행됐는지(확인창이 사라졌거나 저장값이 바뀌었는지) 본다.
 */
import { open, launch, save, SEL } from './c3.mjs';

const argv = process.argv.slice(2);
const arg = (name) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : null; };
const only = arg('only')?.split(',') ?? null;
const builds = (arg('builds') ?? 'result').split(',');

const openBox = async (t, confirm) => { await t.click(SEL.open); if (confirm) await t.confirm(); await t.wait(SEL.opSettled, { timeout: 25000 }); await t.pause(500); };
const CASES = [
  { key: 'inv-take-one', preset: 'inventory', route: '/inventory', arrive: async (t) => { await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); return t.page.locator('[data-take-primary]'); } },
  { key: 'inv-take-batch', preset: 'inventory', route: '/inventory', arrive: async (t) => { await t.click('[data-take-batch]'); await t.wait('[data-take-all]'); await t.click('[data-take-all]'); return t.page.locator('[data-take-submit]'); } },
  { key: 'ship-request', preset: 'inventory', route: '/inventory', arrive: async (t) => {
    await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); await t.click('.v-sheet .v-links .v-link', 0); await t.wait('.v-sheet input');
    const inputs = t.page.locator('.v-sheet input'); const values = ['Parity Audit', '+6500000000', '000000', 'Fixture Road 1'];
    for (let i = 0; i < values.length; i++) await inputs.nth(i).fill(values[i]);
    if ((await inputs.count()) > values.length) await inputs.nth(values.length).fill('P123456789012');
    return t.page.locator('.v-sheet .v-btn').last();
  } },
  { key: 'ship-cancel', preset: 'shipping', route: '/inventory', arrive: async (t) => { await t.click('.v-main .v-chips .v-chip', 1); await t.click('.v-main .v-itemrows .v-itemrow', 0); await t.wait(SEL.sheet); return t.page.locator('.v-sheet .v-btn').first(); } },
  { key: 'withdraw-cancel', preset: 'pending', route: '/wallet', arrive: async (t) => {
    await t.wait('.v-main .v-itemrows .v-itemrow');
    const rows = t.page.locator('.v-main .v-itemrows .v-itemrow'); const n = await rows.count();
    for (let i = 0; i < n; i++) { await rows.nth(i).click(); await t.wait(SEL.sheet); if (await t.has('.v-sheet .v-btn')) break; await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet); }
    return t.page.locator('.v-sheet .v-btn').first();
  } },
  { key: 'logout', preset: 'funded', route: '/account', arrive: async (t) => { await t.wait('.v-main .v-rows'); return t.page.locator('.v-main .v-links .v-link').last(); } },
  { key: 'account-closure', preset: 'funded', route: '/account', arrive: async (t) => { await t.wait('.v-main .v-rows'); await t.page.locator('.v-main .v-row--button').last().click(); await t.wait('.v-sheet input[type="password"]'); await t.fill('.v-sheet input[type="password"]', 'CaptureOnly123!'); return t.page.locator('.v-sheet .v-btn').first(); } },
  { key: 'big-open', preset: 'funded', route: '/box/gaming-playstation', arrive: async (t) => { await t.wait(SEL.open); return t.page.locator(SEL.open); } },
  { key: 'auto-take', preset: 'funded', route: '/box/dollar-apple', arrive: async (t) => { await openBox(t, false); await t.click('.v-op-tool'); await t.wait(SEL.sheet); return t.page.locator('.v-op-toggle').nth(2); } },
  { key: 'result-take-one', preset: 'funded', route: '/box/gaming-playstation', arrive: async (t) => { await openBox(t, true); return t.page.locator('[data-take-primary]'); } },
  { key: 'multi-result-row-take', preset: 'funded', route: '/box/pokemon-charizard', arrive: async (t) => {
    await t.click(SEL.qty, 1); await t.click(SEL.open);
    if (await t.page.locator(SEL.alert).first().waitFor({ state: 'visible', timeout: 1500 }).then(() => true, () => false)) await t.confirm();
    await t.wait('.v-reveal-result', { timeout: 25000 }); await t.wait(SEL.revealArmed); await t.click('.v-resultrow button'); await t.wait(SEL.sheet); await t.pause(450);
    return t.page.locator('[data-take-primary]');
  } },
  { key: 'multi-result-batch-take', preset: 'funded', route: '/box/pokemon-charizard', arrive: async (t) => {
    await t.click(SEL.qty, 1); await t.click(SEL.open);
    if (await t.page.locator(SEL.alert).first().waitFor({ state: 'visible', timeout: 1500 }).then(() => true, () => false)) await t.confirm();
    await t.wait('.v-reveal-result', { timeout: 25000 }); await t.wait(SEL.revealArmed); await t.click('[data-take-batch]'); await t.wait('[data-take-all]'); await t.pause(450);
    return t.page.locator('[data-take-submit]');
  } },
];
const MODES = [{ key: 'touch', width: 390 }, { key: 'mouse', width: 1440 }, { key: 'keyboard', width: 1440 }];

/** 확인창이 들어오는 순간을 잡아, 잠금 안에서 확정 단추를 페이지 안에서 누르고 그때마다의 상태를 적는다 */
const ARM = () => {
  window.__c3 = { shownAt: null, early: [] };
  const fire = (label) => { const btn = document.querySelector('[role="alertdialog"] .v-btn'); const before = !!btn; if (btn) btn.click(); window.__c3.early.push({ label, at: Math.round(performance.now() - window.__c3.shownAt), hadButton: before }); };
  const mo = new MutationObserver(() => {
    if (window.__c3.shownAt !== null) return;
    if (!document.querySelector('[role="alertdialog"]')) return;
    window.__c3.shownAt = performance.now();
    mo.disconnect();
    fire('0ms'); setTimeout(() => fire('120ms'), 120); setTimeout(() => fire('300ms'), 300);
  });
  mo.observe(document.body, { childList: true, subtree: true });
};
const stateOf = async (t) => ({ alert: await t.has(SEL.alert), busy: await t.page.locator('[role="alertdialog"] .v-btn[data-busy]').count().catch(() => 0), storage: JSON.stringify(await t.store()), op: await t.page.locator('.v-op').count() });

async function runCase(browser, build, def, mode) {
  const out = { build, case: def.key, mode: mode.key, width: mode.width };
  const t = await open(browser, build, { preset: def.preset, width: mode.width, clock: 'real', motion: 'no-preference', shotDir: 'confirm-lock' });
  try {
    await t.goto(def.route); await t.idle(400);
    const trigger = await def.arrive(t);
    await trigger.first().waitFor({ state: 'visible' });
    const before = await stateOf(t);
    await t.page.evaluate(ARM);
    if (mode.key === 'touch') await trigger.first().tap(); else if (mode.key === 'mouse') await trigger.first().click(); else { await trigger.first().focus(); await t.page.keyboard.press('Enter'); }
    await t.wait(SEL.alert);
    out.alertTitle = await t.page.locator('[role="alertdialog"] h2').innerText();
    out.focusAtOpen = await t.page.evaluate(() => { const el = document.activeElement; return el ? el.tagName + '.' + String(el.className).split(' ')[0] + (el.getAttribute('role') ? '[' + el.getAttribute('role') + ']' : '') : null; });
    await t.pause(900);
    const afterLock = await stateOf(t);
    out.early = await t.page.evaluate(() => window.__c3.early);
    // 잠금 안의 누름이 실행됐는가(원본은 여기서 실행되는 것이 정상이다)
    out.earlyFired = !afterLock.alert || afterLock.storage !== before.storage || afterLock.op !== before.op || afterLock.busy > 0;
    if (!out.earlyFired) {
      // 다시 그리게 만든 뒤에도 잠금이 다시 시작되지 않는지: 곧바로 진짜 입력으로 누른다
      await t.page.evaluate(() => { window.dispatchEvent(new Event('focus')); document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('resize')); });
      const button = t.page.locator(SEL.alertOk).first();
      if (mode.key === 'touch') await button.tap();
      else if (mode.key === 'mouse') await button.click();
      else {
        await t.page.keyboard.press('Tab');
        out.focusAfterTab = await t.page.evaluate(() => { const el = document.activeElement; return el ? el.tagName + '.' + String(el.className).split(' ')[0] + ':' + (el.innerText ?? '').trim().slice(0, 40) : null; });
        await t.page.keyboard.press('Enter');
      }
      await t.pause(1500);
      const after = await stateOf(t);
      out.deliberateFired = !after.alert || after.storage !== before.storage || after.op !== before.op;
      out.alertAfter = after.alert;
      out.storageChanged = after.storage !== before.storage;
      out.lineAfter = await t.page.locator('.v-sheet .v-line, .v-main .v-line').allInnerTexts().catch(() => []);
      out.focusAfterClose = await t.page.evaluate(() => { const el = document.activeElement; return el && el !== document.body ? el.tagName + '.' + String(el.className).split(' ')[0] + ':' + (el.innerText ?? '').trim().slice(0, 40) : 'body'; });
      if (!out.deliberateFired) out.shot = await t.shot(`${def.key}-${mode.key}-not-fired`);
    }
    out.console = t.errors.slice(0, 5);
    out.blocked = t.blocked.map((b) => `${b.method} ${b.url}`).slice(0, 5);
  } catch (error) { out.error = String(error.message).split('\n')[0].slice(0, 300); out.shot = await t.shot(`${def.key}-${mode.key}-error`); }
  finally { await t.close(); }
  return out;
}

const browser = await launch();
const results = [];
try {
  for (const build of builds) for (const def of CASES) {
    if (only && !only.includes(def.key)) continue;
    for (const mode of MODES) {
      const r = await runCase(browser, build, def, mode);
      results.push(r);
      console.log(`${build} ${def.key} ${mode.key}: ${r.error ? 'ERROR ' + r.error : `early=${JSON.stringify(r.early?.map((e) => e.at))} earlyFired=${r.earlyFired} deliberateFired=${r.deliberateFired} focusAtOpen=${r.focusAtOpen}${r.focusAfterTab ? ' tab=' + r.focusAfterTab : ''} after=${r.focusAfterClose} lines=${JSON.stringify(r.lineAfter)}`}`);
    }
  }
} finally { await browser.close(); }
const file = await save(`confirm-lock-${builds.join('+')}.json`, results);
console.log('기록:', file);
