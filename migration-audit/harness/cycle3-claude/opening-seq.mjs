#!/usr/bin/env node
/**
 * 개봉 연출의 DOM 상태 순서와 마지막 화면을 두 빌드에서 견준다(움직임 줄이지 않음, 고정 시계, 고정 시드).
 *   node opening-seq.mjs
 * 한 개(1달러 박스, 큰 금액 박스), 다섯 개(1달러 박스, 포켓몬 박스), 폭 390 과 1024.
 * 적는 것: .v-op 의 data-phase, data-opening-state, data-tone, data-kind, data-short 가 바뀐 순서(시각은 참고로만), .v-reveal 이 나타난 때,
 *          마지막 화면의 글과 단추, 저장값. 순서와 마지막 화면과 저장값을 견준다. 길이는 견주지 않는다(다른 도구가 잰다).
 */
import { both, launch, save, report, SEL } from './c3.mjs';

const WATCH = () => {
  window.__seq = []; let last = '';
  const read = () => {
    const op = document.querySelector('.v-op'); const rv = document.querySelector('.v-reveal');
    const key = JSON.stringify({ op: op ? [op.dataset.phase ?? null, op.dataset.openingState ?? null, op.dataset.tone ?? null, op.dataset.kind ?? null, op.dataset.short ?? null] : null, reveal: rv ? (rv.querySelector('.v-reveal-result') ? 'result' : 'pending') : null, alert: !!document.querySelector('[role="alertdialog"]') });
    if (key !== last) { last = key; window.__seq.push({ at: Math.round(performance.now()), ...JSON.parse(key) }); }
  };
  const start = () => { new MutationObserver(read).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-phase', 'data-opening-state', 'data-tone', 'data-kind', 'data-short', 'class'] }); read(); };
  if (document.documentElement) start(); else document.addEventListener('DOMContentLoaded', start);
};
const seqOf = async (t) => (await t.page.evaluate(() => window.__seq)).map(({ at, ...rest }) => JSON.stringify(rest));
const timesOf = async (t) => { const s = await t.page.evaluate(() => window.__seq); return s.length ? s.at(-1).at - s[0].at : 0; };

const CASES = [
  { key: 'one-dollar', slug: 'dollar-apple', qty: 0 },
  { key: 'one-big', slug: 'gaming-playstation', qty: 0 },
  { key: 'five-dollar', slug: 'dollar-apple', qty: 1 },
  { key: 'five-pokemon-free2', slug: 'pokemon-charizard', qty: 1 },
  { key: 'ten-dollar', slug: 'dollar-apple', qty: 2 },
];
const browser = await launch();
try {
  for (const [locale, width] of [['ko', 390], ['zh', 1024]]) for (const c of CASES) {
    const result = await both(browser, `opening-${c.key}-${locale}-${width}`, { preset: 'funded', locale, width, motion: 'no-preference' }, async (t, step) => {
      await t.context.addInitScript(WATCH);
      await step('박스 화면', async () => { await t.goto('/box/' + c.slug); await t.wait(SEL.open); await t.idle(600); if (c.qty) await t.click(SEL.qty, c.qty); });
      const e = await step('열기와 마지막 화면', async () => {
        await t.click(SEL.open);
        if (await t.page.locator(SEL.alert).first().waitFor({ state: 'visible', timeout: 1200 }).then(() => true, () => false)) await t.confirm();
        await t.wait(c.qty ? '.v-reveal-result' : SEL.opSettled, { timeout: 30000 });
        if (c.qty) await t.wait(SEL.revealArmed); else await t.pause(1200);
      }, { shot: true });
      e.observed.seq = await seqOf(t); e.spanMs = await timesOf(t);
      const full = await t.obs(); e.observed.finalOpening = full.opening; e.observed.finalReveal = full.reveal;
      e.observed.finalButtons = await t.page.evaluate(() => Array.from(document.querySelectorAll('.v-op .v-btn, .v-op .v-link, .v-reveal .v-btn, .v-reveal .v-link, .v-reveal .v-resultrow')).map((b) => b.innerText.replace(/\s+/g, ' ').trim().slice(0, 60) + (b.disabled ? ' [disabled]' : '')));
      if (!c.qty) {
        const e2 = await step('한 번 더 열기', async () => { await t.click('[data-open-again]'); if (await t.page.locator(SEL.alert).first().waitFor({ state: 'visible', timeout: 1200 }).then(() => true, () => false)) await t.confirm(); await t.pause(2500); await t.wait(SEL.opSettled, { timeout: 30000 }); await t.pause(800); }, { shot: true });
        e2.observed.seq = await seqOf(t); e2.observed.finalOpening = (await t.obs()).opening;
      } else {
        const e2 = await step('결과 행 하나 열기', async () => { await t.click('.v-resultrow button'); await t.wait(SEL.sheet); await t.pause(400); }, { shot: true });
        e2.observed.sheet = (await t.obs()).dialogs;
        await step('행 닫고 결과 닫기', async () => { await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet); await t.click('.v-reveal > .v-sheet-close'); await t.gone('.v-reveal'); });
      }
    });
    console.log(report(result, { max: 6 }));
    console.log('   순서 길이(orig/result): ' + result.raw.orig.steps.map((s) => s.observed?.seq?.length ?? '-').join(',') + ' / ' + result.raw.result.steps.map((s) => s.observed?.seq?.length ?? '-').join(',') + '   걸린 시간 ms: ' + (result.raw.orig.steps[1]?.spanMs ?? '-') + ' / ' + (result.raw.result.steps[1]?.spanMs ?? '-'));
    await save(`opening-${c.key}-${locale}-${width}.json`, result);
  }
} finally { await browser.close(); }
