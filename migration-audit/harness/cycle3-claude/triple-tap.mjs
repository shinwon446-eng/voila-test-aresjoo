#!/usr/bin/env node
/**
 * E-08 의 다른 꼴: 후기 올리기 단추의 자리를 세 번 누른다(후기가 올라간 뒤 그 자리에 상품 상세의 받기 단추, 그 자리에 확인창의 확정 단추가 온다).
 *   node triple-tap.mjs
 * 폭 390, 간격 120, 200, 300, 450ms, 두 빌드. 끝난 뒤 후기가 저장됐는지와 상품이 받아졌는지를 적는다.
 */
import { open, launch, save, SEL } from './c3.mjs';

const LOG = () => {
  window.__taps = [];
  document.addEventListener('click', (e) => { const el = e.target.closest('button, a') ?? e.target; window.__taps.push({ at: Math.round(performance.now()), where: el.closest('[role="alertdialog"]') ? 'alert' : el.closest('[role="dialog"]') ? 'sheet' : 'page', text: (el.innerText ?? '').trim().slice(0, 24) }); }, true);
};
async function run(browser, build, gap) {
  const out = { build, gap };
  const t = await open(browser, build, { preset: 'inventory', width: 390, clock: 'real', motion: 'no-preference', shotDir: 'triple-tap' });
  try {
    await t.goto('/inventory'); await t.wait('.v-main .v-itemrows .v-itemrow'); await t.idle(400);
    await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); await t.click('.v-rowlink'); await t.wait('.v-sheet textarea');
    await t.fill('.v-sheet textarea', '세 번 누르기 검수용 후기입니다. 상자가 멀쩡했고 엿새 만에 왔습니다.'); await t.pause(300);
    const box = await t.page.locator('.v-sheet .v-btn').last().boundingBox();
    const x = Math.round(box.x + box.width / 2), y = Math.round(box.y + box.height / 2);
    out.sendButton = { top: Math.round(box.y) };
    await t.page.evaluate(LOG);
    for (let i = 0; i < 3; i++) { await t.page.touchscreen.tap(x, y); if (i < 2) await t.page.waitForTimeout(gap); }
    await t.pause(1800);
    const taps = await t.page.evaluate(() => window.__taps);
    out.taps = taps.map((p) => `${p.at - taps[0].at}ms ${p.where}:${p.text}`);
    const raw = await t.raw();
    out.reviews = (raw['gachaflix.community']?.state?.mine ?? []).length;
    out.statuses = raw['voila.browser-inventory.capture-account'].state.items.map((i) => i.status);
    out.sellbacks = raw['voila.browser-wallet.capture-account'].state.transactions.filter((x) => x.type === 'sellback').length;
    out.alertOpen = await t.has(SEL.alert);
    out.shot = await t.shot(`gap${gap}`);
  } catch (error) { out.error = String(error.message).split('\n')[0].slice(0, 200); }
  finally { await t.close(); }
  return out;
}
const browser = await launch();
const results = [];
try {
  for (const gap of [120, 200, 300, 450]) {
    for (const r of await Promise.all(['orig', 'result'].map((b) => run(browser, b, gap)))) { results.push(r); console.log(JSON.stringify(r)); }
  }
} finally { await browser.close(); }
console.log('기록:', await save('triple-tap.json', results));
