#!/usr/bin/env node
/**
 * 비밀번호 시트를 실패 한 줄이 뜬 채로 닫았다가 다시 열면 그 줄과 넣었던 값이 남는지(두 빌드). 다시 연 뒤 0.8초 기다려 적는다.
 *   node password-reopen.mjs
 */
import { open, launch, save, SEL } from './c3.mjs';

const state = (t) => t.page.evaluate(() => { const s = document.querySelector('.v-sheet'); return s ? { lines: Array.from(s.querySelectorAll('.v-line')).map((l) => l.innerText), filled: Array.from(s.querySelectorAll('input')).map((i) => i.value.length) } : null; });
const browser = await launch();
const out = {};
try {
  await Promise.all(['orig', 'result'].map(async (build) => {
    const t = await open(browser, build, { preset: 'funded', locale: 'ko', width: 390 });
    try {
      await t.goto('/account'); await t.wait('.v-main .v-rows'); await t.page.locator('.v-main .v-row--button').nth(2).click(); await t.wait('.v-sheet input[type="password"]');
      await t.page.locator('.v-sheet .v-btn').first().click(); await t.pause(500);
      const before = await state(t);
      await t.page.locator('.v-sheet input[type="password"]').nth(0).fill('Typed-Current-0000');
      await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet); await t.pause(300);
      await t.page.locator('.v-main .v-row--button').nth(2).click(); await t.wait('.v-sheet input[type="password"]'); await t.pause(800);
      out[build] = { beforeClose: before, afterReopen: await state(t) };
    } finally { await t.close(); }
  }));
} finally { await browser.close(); }
console.log(JSON.stringify(out, null, 1));
await save('password-reopen.json', out);
