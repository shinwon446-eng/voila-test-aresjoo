// 확인창을 자판으로: 열기 단추에서 Enter, 확인창이 뜨면 Tab 으로 확정 단추까지 가서 바로 Enter, 안 되면 0.6초 뒤 다시 Enter. 두 빌드, 세 번씩.
import { launch, openSession, saveJson, SEL } from './lib.mjs';

const browser = await launch();
const out = { orig: [], result: [] };
try {
  for (let run = 0; run < 3; run++) for (const build of ['orig', 'result']) {
    const t = await openSession(browser, build, { preset: 'funded', width: 390, fixedClock: false });
    const r = { run };
    try {
      const nonce = async () => (await t.storage())['gachaflix.fair']?.state?.nonce;
      await t.goto('/box/gaming-playstation'); await t.wait(SEL.open); await t.settle({ quiet: 400 });
      await t.page.locator(SEL.open).focus();
      const t0 = Date.now(); await t.page.keyboard.press('Enter'); await t.wait(SEL.alert); await t.page.waitForTimeout(80);
      let tabs = 0;
      for (; tabs < 5; tabs++) { if (await t.page.evaluate((sel) => document.activeElement === document.querySelector(sel), SEL.alertOk)) break; await t.page.keyboard.press('Tab'); }
      r.tabsToConfirm = tabs; r.onConfirm = await t.page.evaluate((sel) => document.activeElement === document.querySelector(sel), SEL.alertOk);
      await t.page.keyboard.press('Enter'); r.msSinceOpenKey = Date.now() - t0; await t.page.waitForTimeout(300);
      r.afterFirstEnter = { alertOpen: await t.has(SEL.alert), nonce: await nonce() };
      if (r.afterFirstEnter.alertOpen) { await t.page.waitForTimeout(600); r.stillOnConfirm = await t.page.evaluate((sel) => document.activeElement === document.querySelector(sel), SEL.alertOk); await t.page.keyboard.press('Enter'); await t.page.waitForTimeout(500); r.afterSecondEnter = { alertOpen: await t.has(SEL.alert), nonce: await nonce() }; }
      r.settled = await t.wait(SEL.opSettled, { timeout: 12000 }).then(() => true, () => false); r.finalNonce = await nonce();
      r.errors = t.errors;
    } catch (error) { r.error = String(error.message).split('\n')[0].slice(0, 200); }
    out[build].push(r); await t.close();
  }
} finally { await browser.close(); }
await saveJson('confirm-key.json', out);
console.log(JSON.stringify(out));
