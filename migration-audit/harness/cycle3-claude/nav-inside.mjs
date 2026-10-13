#!/usr/bin/env node
/**
 * 흐름 한가운데에서 뒤로, 앞으로, 새로 고침을 한다(두 빌드, 같은 심은 상태). 단계마다 보이는 것과 저장된 것을 견준다.
 *   node nav-inside.mjs [--variants ko-390,zh-1024]
 */
import { both, launch, save, SEL } from './c3.mjs';

const argv = process.argv.slice(2);
const variants = (argv.includes('--variants') ? argv[argv.indexOf('--variants') + 1] : 'ko-390,zh-1024').split(',');
const back = async (t) => { await t.page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {}); await t.pause(700); };
const forward = async (t) => { await t.page.goForward({ waitUntil: 'domcontentloaded' }).catch(() => {}); await t.pause(700); };
const reload = async (t) => { await t.page.reload({ waitUntil: 'domcontentloaded' }); await t.pause(900); };

const run = async (t, step) => {
  await step('홈에서 박스로(화면 안 이동)', async () => { await t.goto(''); await t.wait('.v-boxgrid'); await t.click('.v-boxcard[href*="/box/watch-rolex/"]'); await t.page.waitForURL(/\/box\/watch-rolex\/$/); await t.wait(SEL.open); });
  await step('구성품 시트를 연 채 뒤로', async () => { await t.click('.v-main .v-item'); await t.wait(SEL.sheet); await back(t); });
  await step('앞으로', async () => { await forward(t); });
  await step('구성품 시트를 연 채 새로 고침', async () => { if (await t.has(SEL.open)) { await t.click('.v-main .v-item'); await t.wait(SEL.sheet); } await reload(t); });
  await step('큰 금액 확인창을 띄운 채 새로 고침', async () => { await t.goto('/box/gaming-playstation'); await t.wait(SEL.open); await t.click(SEL.open); await t.wait(SEL.alert); await reload(t); });
  await step('큰 금액 확인창을 띄운 채 뒤로', async () => { await t.wait(SEL.open); await t.click(SEL.open); await t.wait(SEL.alert); await back(t); });
  await step('1달러 박스: 열기를 누른 직후 새로 고침(연출 도중)', async () => { await t.goto('/box/dollar-apple'); await t.wait(SEL.open); await t.click(SEL.open); await t.pause(250); await reload(t); await t.wait('[data-open-primary], [data-open-recover]'); }, { shot: true });
  await step('못 본 결과 다시 보기', async () => { if (await t.has('[data-open-recover]')) { await t.click('[data-open-recover]'); await t.wait('.v-op, .v-reveal'); await t.pause(2500); } }, { shot: true });
  await step('연출이 끝난 결과 화면에서 뒤로', async () => { if (!(await t.has('.v-op, .v-reveal'))) { await t.click(SEL.open); await t.wait(SEL.opSettled, { timeout: 25000 }); } await back(t); });
  await step('앞으로(결과 화면이 있던 주소)', async () => { await forward(t); });
  await step('다섯 개 결과 화면에서 새로 고침', async () => { await t.goto('/box/dollar-apple'); await t.wait('[data-open-primary], [data-open-recover]'); if (await t.has('[data-open-recover]')) { await t.click('[data-open-recover]'); await t.wait('.v-op, .v-reveal'); await t.pause(1500); await t.page.keyboard.press('Escape'); await t.pause(500); if (await t.has('.v-op-top .v-op-tool')) await t.page.locator('.v-op-top .v-op-tool').last().click(); await t.wait(SEL.open); } await t.click(SEL.qty, 1); await t.click(SEL.open); await t.wait('.v-reveal-result', { timeout: 25000 }); await reload(t); await t.wait('[data-open-primary], [data-open-recover]'); }, { shot: true });
  await step('보관함: 받기 확인창을 띄운 채 새로 고침', async () => { await t.goto('/inventory'); await t.wait('.v-main .v-itemrows .v-itemrow'); await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); await t.click('[data-take-primary]'); await t.wait(SEL.alert); await reload(t); await t.wait('.v-main .v-chips'); });
  await step('보관함: 묶음 받기 시트에서 고른 채 뒤로', async () => { await t.click('[data-take-batch]'); await t.wait('[data-take-all]'); await t.click('[data-take-all]'); await back(t); });
  await step('앞으로(보관함)', async () => { await forward(t); await t.pause(500); });
  await step('후기 쓰기 시트에서 글을 쓰다 새로 고침', async () => { await t.goto('/inventory'); await t.wait('.v-main .v-itemrows .v-itemrow'); await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); await t.click('.v-rowlink'); await t.wait('.v-sheet textarea'); await t.fill('.v-sheet textarea', '새로 고침 전에 쓰던 글입니다.'); await reload(t); await t.wait('.v-main .v-chips'); });
  await step('출금: 확인 단계에서 새로 고침', async () => { await t.goto('/wallet/withdraw'); await t.wait('.v-main .v-links .v-link'); await t.pause(400); await t.click('.v-main .v-links .v-link'); await t.wait('.v-main form input'); await t.fill('.v-main form input', 'T' + '1'.repeat(33), 0); await t.fill('.v-main form input', '100', 1); await t.click('.v-main form button[type="submit"]'); await t.pause(400); await reload(t); await t.wait('.v-main .v-title'); });
  await step('출금: 확인 단계에서 뒤로', async () => { if (await t.has('.v-main .v-links .v-link')) { await t.click('.v-main .v-links .v-link'); await t.wait('.v-main form input'); } await t.fill('.v-main form input', 'T' + '1'.repeat(33), 0); await t.fill('.v-main form input', '100', 1); await t.click('.v-main form button[type="submit"]'); await t.pause(400); await back(t); });
  await step('지갑: 내역 시트를 연 채 뒤로와 앞으로', async () => { await t.goto('/wallet'); await t.wait('.v-main .v-itemrows .v-itemrow'); await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); await back(t); await forward(t); });
  await step('검증: 기록 시트를 연 채 새로 고침', async () => { await t.goto('/verify'); await t.wait('.v-main .v-itemrows .v-itemrow'); await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); await reload(t); await t.wait('.v-main .v-title'); });
  await step('언어를 바꾼 뒤 뒤로', async () => { await t.goto('/wallet'); await t.wait('.v-main .v-title'); const other = t.locale === 'zh' ? 'en' : 'zh'; await t.page.locator(`.v-footer-cols a[hreflang="${other}"]`).scrollIntoViewIfNeeded(); await t.click(`.v-footer-cols a[hreflang="${other}"]`); await t.page.waitForURL(new RegExp(`/${other}/wallet/$`)); await t.pause(500); await back(t); });
  await step('통화를 바꾼 뒤 새로 고침, 그리고 되돌림', async () => { await t.page.locator('.v-footer-cols button').first().scrollIntoViewIfNeeded(); await t.page.locator('.v-footer-cols button').first().click(); await t.pause(300); await reload(t); await t.page.locator('.v-footer-cols button').first().scrollIntoViewIfNeeded(); await t.page.locator('.v-footer-cols button').first().click(); await t.pause(300); await t.page.evaluate(() => window.scrollTo(0, 0)); });
};

const browser = await launch();
try {
  for (const variant of variants) {
    const [locale, width] = variant.split('-');
    const result = await both(browser, `nav-${variant}`, { preset: 'inventory', locale, width: Number(width), motion: 'no-preference' }, run);
    await save(`nav-${variant}.json`, result);
    for (const s of result.steps) console.log(`${variant}  ${s.onlyOne ? '한쪽만 ' + s.onlyOne : s.diffs.length ? 'DIFF ' + s.diffs.length : 'same'}  ${s.name}${s.error ? '  (오류: ' + s.error + ')' : ''}`);
  }
} finally { await browser.close(); }
