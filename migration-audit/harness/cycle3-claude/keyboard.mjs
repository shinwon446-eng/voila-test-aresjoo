#!/usr/bin/env node
/**
 * 자판만으로 주 흐름을 지난다(두 빌드, 폭 1440 과 1024). 탭 순서, Enter, Escape, 시트가 닫힌 뒤 포커스가 돌아가는 자리를 적고 견준다.
 *   node keyboard.mjs [--variants ko-1440,zh-1024]
 * 후기 자리 안의 탭 정지는 따로 센다(의도된 차이의 자리). 그 밖의 순서는 같아야 한다.
 */
import { both, launch, save, report, SEL, tickClock } from './c3.mjs';

const argv = process.argv.slice(2);
const variants = (argv.includes('--variants') ? argv[argv.indexOf('--variants') + 1] : 'ko-1440,zh-1024').split(',');
const RZ = '.v-boxlayout-reviews, .v-ratinglink, .v-boxcard-rating, .v-rvsum, .v-rvfeed, .v-rvgrid, .v-rvcard, .v-rv';
const FOCUS = (rz) => { const el = document.activeElement; if (!el || el === document.body) return 'body'; const text = (el.getAttribute('aria-label') || el.innerText || el.value || '').replace(/\s+/g, ' ').trim().slice(0, 28); return (el.closest(rz) ? '[후기자리] ' : '') + el.tagName.toLowerCase() + '.' + String(el.className).split(/\s+/)[0] + (el.closest('[role="alertdialog"]') ? '@alert' : el.closest('[role="dialog"]') ? '@dialog' : '') + ':' + text; };
const focus = (t) => t.page.evaluate(FOCUS, RZ);
/** Tab 을 누르며 포커스의 자리를 모은다. until 이 참이 되면 멈춘다 */
const tabs = async (t, max, until) => { const seq = []; for (let i = 0; i < max; i++) { await t.page.keyboard.press('Tab'); const f = await focus(t); seq.push(f); if (until && await until(f)) break; } return seq; };
const split = (seq) => ({ outside: seq.filter((s) => !s.startsWith('[후기자리]')), reviewStops: seq.filter((s) => s.startsWith('[후기자리]')).length });

const run = async (t, step) => {
  let e;
  e = await step('홈: Tab 30번', async () => { await t.goto(''); await t.wait('.v-boxgrid'); await t.idle(600); });
  { const s = split(await tabs(t, 30)); e.observed.kb = s.outside; e.reviewStops = s.reviewStops; }
  e = await step('박스 화면: 열기 단추까지 Tab', async () => { await t.goto('/box/gaming-playstation'); await t.wait(SEL.open); await t.idle(600); });
  { const seq = await tabs(t, 140, () => t.page.evaluate(() => document.activeElement?.hasAttribute('data-open-primary'))); const s = split(seq); e.observed.kb = s.outside; e.observed.kbReached = seq.at(-1); e.reviewStops = s.reviewStops; e.totalStops = seq.length; }
  e = await step('Enter 로 열기(큰 금액 확인창)', async () => { await t.page.keyboard.press('Enter'); await t.wait(SEL.alert); await t.pause(200); });
  e.observed.kb = [await focus(t)];
  e = await step('확인창: Escape', async () => { await t.page.keyboard.press('Escape'); await t.gone(SEL.alert); await t.pause(200); });
  e.observed.kb = [await focus(t)];
  e = await step('다시 Enter, Tab, Enter 로 확정', async () => { await t.page.keyboard.press('Enter'); await t.wait(SEL.alert); await t.pause(500); await t.page.keyboard.press('Tab'); });
  { const f = await focus(t); await tickClock(t.page); await t.page.keyboard.press('Enter'); await t.wait(SEL.opSettled, { timeout: 25000 }).catch(() => {}); await t.pause(900); const last = await focus(t); e.observed.kb = [f, last]; e.observed.opening = (await t.obs()).opening; e.storage = await t.store(); }
  e = await step('결과 화면: Tab 8번', async () => { await t.pause(100); });
  e.observed.kb = await tabs(t, 8);
  e = await step('결과 화면: Escape', async () => { await t.page.keyboard.press('Escape'); await t.pause(700); });
  e.observed.kb = [await focus(t), String(await t.has('.v-op'))];
  e = await step('결과 화면: 닫기 단추에 포커스를 두고 Enter', async () => { if (await t.has('.v-op')) { await t.page.locator('.v-op-top .v-op-tool').last().focus(); await t.page.keyboard.press('Enter'); await t.gone('.v-op').catch(() => {}); await t.pause(400); } });
  e.observed.kb = [await focus(t)];
  e = await step('구성품 상품: Enter 로 시트, Escape', async () => { await t.page.locator('.v-main .v-item').first().focus(); await t.page.keyboard.press('Enter'); await t.wait(SEL.sheet); await t.pause(300); });
  { const inSheet = await focus(t); const seq = await tabs(t, 5); await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet); await t.pause(200); e.observed.kb = [inSheet, ...seq, await focus(t)]; }
  e = await step('보관함: 첫 행까지 Tab', async () => { await t.goto('/inventory'); await t.wait('.v-main .v-itemrows .v-itemrow'); await t.idle(500); });
  e.observed.kb = await tabs(t, 40, () => t.page.evaluate(() => !!document.activeElement?.closest('.v-main .v-itemrows')));
  e = await step('보관함: Enter 로 상세, Tab 6번', async () => { await t.page.keyboard.press('Enter'); await t.wait(SEL.sheet); await t.pause(300); });
  e.observed.kb = [await focus(t), ...(await tabs(t, 6))];
  e = await step('보관함: 받기 단추에서 Enter(확인창), Escape', async () => { await t.page.locator('[data-take-primary]').focus(); await t.page.keyboard.press('Enter'); await t.wait(SEL.alert); await t.pause(300); });
  { const a = await focus(t); await t.page.keyboard.press('Escape'); await t.gone(SEL.alert); await t.pause(300); e.observed.kb = [a, await focus(t), String(await t.has(SEL.sheet))]; }
  e = await step('보관함: 받기 확정을 자판으로', async () => { await t.page.locator('[data-take-primary]').focus(); await t.page.keyboard.press('Enter'); await t.wait(SEL.alert); await t.pause(500); await t.page.keyboard.press('Tab'); });
  { const f = await focus(t); await tickClock(t.page); await t.page.keyboard.press('Enter'); await t.gone(SEL.alert).catch(() => {}); await t.pause(800); e.observed.kb = [f, await focus(t)]; e.storage = await t.store(); e.observed.after = (await t.obs()).chips; }
  e = await step('지갑: 내역 행 Enter, Escape', async () => { await t.goto('/wallet'); await t.wait('.v-main .v-itemrows .v-itemrow'); await t.idle(400); await t.page.locator('.v-main .v-itemrows .v-itemrow').first().focus(); await t.page.keyboard.press('Enter'); await t.wait(SEL.sheet); await t.pause(300); });
  { const a = await focus(t); await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet); await t.pause(200); e.observed.kb = [a, await focus(t)]; }
  e = await step('머리줄 잔액 단추: Enter, Tab 5번, Escape', async () => { await t.page.locator(SEL.balance).first().focus(); await t.page.keyboard.press('Enter'); await t.wait(SEL.sheet); await t.pause(300); });
  { const seq = [await focus(t), ...(await tabs(t, 5))]; await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet); await t.pause(200); e.observed.kb = [...seq, await focus(t)]; }
};

const browser = await launch();
try {
  for (const variant of variants) {
    const [locale, width] = variant.split('-');
    const result = await both(browser, `keyboard-${variant}`, { preset: 'inventory', locale, width: Number(width), motion: 'no-preference' }, run);
    console.log(report(result, { max: 8 }));
    for (const b of ['orig', 'result']) console.log(`  ${b}: 후기 자리의 탭 정지 = ` + JSON.stringify(result.raw[b].steps.filter((s) => s.reviewStops !== undefined).map((s) => `${s.name}: ${s.reviewStops}${s.totalStops ? ' / 전체 ' + s.totalStops : ''}`)));
    await save(`keyboard-${variant}.json`, result);
  }
} finally { await browser.close(); }
