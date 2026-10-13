#!/usr/bin/env node
/**
 * E-08 재현 행렬: 같은 좌표를 두 번 누른다(실제 시계, 터치).
 *   node double-tap.mjs
 * 자리: 보관함의 상품 상세 "USDT로 받기"(폭 320, 360, 390, 430), 개봉 결과 화면의 "USDT로 받기"(폭 390).
 * 간격: 90, 250, 330, 420, 600ms. 두 빌드 모두.
 * 적는 것: 첫 단추와 확정 단추의 좌표, 페이지가 받은 두 누름의 시각과 대상, 확인창이 뜬 시각, 끝난 뒤 받아졌는지(보관함 상태와 거래 수).
 */
import { open, launch, save, SEL } from './c3.mjs';

const GAPS = [90, 250, 330, 420, 600];
const LOG = () => {
  window.__taps = []; window.__alertAt = null;
  new MutationObserver(() => { if (window.__alertAt === null && document.querySelector('[role="alertdialog"]')) window.__alertAt = performance.now(); }).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', (e) => { const el = e.target.closest('button, a') ?? e.target; window.__taps.push({ at: performance.now(), inAlert: !!el.closest('[role="alertdialog"]'), cls: String(el.className).split(' ')[0], text: (el.innerText ?? '').trim().slice(0, 30) }); }, true);
};
const SITES = [
  { key: 'inventory', preset: 'inventory', route: '/inventory', widths: [320, 360, 390, 430], arrive: async (t) => { await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); await t.pause(500); } },
  { key: 'opening-result', preset: 'funded', route: '/box/gaming-playstation', widths: [390], arrive: async (t) => { await t.click(SEL.open); await t.confirm(); await t.wait(SEL.opSettled, { timeout: 25000 }); await t.wait('[data-take-primary]'); await t.pause(800); } },
];

async function run(browser, build, site, width, gap) {
  const out = { build, site: site.key, width, gap };
  const t = await open(browser, build, { preset: site.preset, width, clock: 'real', motion: 'no-preference', shotDir: 'double-tap' });
  try {
    await t.goto(site.route); await t.idle(400);
    await site.arrive(t);
    const box = await t.page.locator('[data-take-primary]').first().boundingBox();
    const x = Math.round(box.x + box.width / 2), y = Math.round(box.y + box.height / 2);
    out.primary = { x, y, top: Math.round(box.y), height: Math.round(box.height) };
    const before = await t.raw();
    await t.page.evaluate(LOG);
    await t.page.touchscreen.tap(x, y);
    await t.page.waitForTimeout(gap);
    await t.page.touchscreen.tap(x, y);
    await t.pause(300);
    const okBox = await t.page.locator(SEL.alertOk).first().boundingBox().catch(() => null);
    out.confirmButton = okBox ? { top: Math.round(okBox.y), height: Math.round(okBox.height) } : null;
    await t.pause(1500);
    const log = await t.page.evaluate(() => ({ taps: window.__taps, alertAt: window.__alertAt }));
    out.taps = log.taps.map((p) => ({ sinceFirst: Math.round(p.at - log.taps[0].at), sinceAlert: log.alertAt === null ? null : Math.round(p.at - log.alertAt), inAlert: p.inAlert, target: p.cls + ':' + p.text }));
    const after = await t.raw();
    const inv = (s) => Object.entries(s).filter(([k]) => /^voila\.browser-inventory\.capture/.test(k)).flatMap(([, v]) => v.state.items.map((i) => i.status));
    const txs = (s) => Object.entries(s).filter(([k]) => /^voila\.browser-wallet\.capture/.test(k)).flatMap(([, v]) => v.state.transactions.map((x) => x.type + ':' + x.amountUsdt));
    out.statusBefore = inv(before); out.statusAfter = inv(after); out.txAfter = txs(after);
    out.taken = out.statusAfter.filter((s) => s === 'SOLD' || s === 'CASHBACK' || s === 'CASHED_OUT').length > out.statusBefore.filter((s) => s === 'SOLD' || s === 'CASHBACK' || s === 'CASHED_OUT').length || txs(after).length > txs(before).length;
    out.alertOpenAtEnd = await t.has(SEL.alert);
    if (out.taken) out.shot = await t.shot(`${site.key}-${width}-gap${gap}-taken`);
  } catch (error) { out.error = String(error.message).split('\n')[0].slice(0, 300); }
  finally { await t.close(); }
  return out;
}

const browser = await launch();
const results = [];
try {
  for (const site of SITES) for (const width of site.widths) for (const gap of GAPS) {
    const pair = await Promise.all(['orig', 'result'].map((build) => run(browser, build, site, width, gap)));
    for (const r of pair) { results.push(r); console.log(`${r.build} ${r.site} w${r.width} gap${r.gap}: ${r.error ? 'ERROR ' + r.error : `taken=${r.taken} alertOpen=${r.alertOpenAtEnd} primaryTop=${r.primary.top} confirmTop=${r.confirmButton?.top ?? '-'} taps=${JSON.stringify(r.taps)}`}`); }
  }
} finally { await browser.close(); }
console.log('기록:', await save('double-tap.json', results));
