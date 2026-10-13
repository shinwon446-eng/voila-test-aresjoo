#!/usr/bin/env node
/**
 * E-16 의 계산 도중 변경을 앞선 결과가 없는 화면에서 본다(두 빌드). 앞선 결과가 있으면 두 빌드의 화면이 같아 보여서 구분되지 않는다.
 *   node verify-race.mjs
 * 1. 새 화면에서 값을 넣고, 계산을 누른 같은 순간에 회차를 7 로 고친다. 그 뒤 화면의 결과 줄을 적는다.
 * 2. 주소의 값으로 미리 채워진 화면(/verify?s=..&c=..&n=0&box=..)에서 같은 일을 한다.
 */
import { open, launch, save, FAIR } from './c3.mjs';

const MANUAL = '[aria-labelledby="verify-manual"]';
const read = (t) => t.page.evaluate((sel) => { const m = document.querySelector(sel); return { nonce: m.querySelectorAll('.v-field input')[3].value, rows: Array.from(m.querySelectorAll('.v-row')).map((r) => r.innerText.replace(/\s+/g, ' ')), lines: Array.from(m.querySelectorAll('.v-line')).map((l) => l.innerText), busy: !!m.querySelector('.v-btn[data-busy]') }; }, MANUAL);
const race = (t) => t.page.evaluate((sel) => { const m = document.querySelector(sel); const btns = m.querySelectorAll('.v-btn'); const input = m.querySelectorAll('.v-field input')[3]; btns[btns.length - 1].click(); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, '7'); input.dispatchEvent(new Event('input', { bubbles: true })); }, MANUAL);
const browser = await launch();
const out = {};
try {
  await Promise.all(['orig', 'result'].map(async (build) => {
    const t = await open(browser, build, { preset: 'guest', locale: 'ko', width: 1024, shotDir: 'verify' });
    try {
      await t.goto('/verify'); await t.wait(MANUAL + ' .v-field input'); await t.idle(500);
      const inputs = t.page.locator(MANUAL + ' .v-field input');
      await inputs.nth(0).fill(FAIR.serverSeed); await inputs.nth(2).fill(FAIR.clientSeed); await inputs.nth(3).fill('0');
      await race(t); await t.pause(1200);
      (out['새 화면: 계산을 누른 순간 회차 0 을 7 로 고침'] ??= {})[build] = await read(t); await t.shot('race-fresh');
      await t.page.locator(MANUAL + ' .v-btn').last().click(); await t.pause(900);
      (out['그 뒤 계산을 한 번 더 누름(회차 7)'] ??= {})[build] = await read(t);
      await t.goto(`/verify?s=${FAIR.serverSeed}&h=${FAIR.serverSeedHash}&c=${FAIR.clientSeed}&n=0&box=dollar-apple`); await t.wait(MANUAL + ' .v-field input'); await t.idle(700);
      (out['주소의 값으로 들어온 직후'] ??= {})[build] = await read(t);
      await race(t); await t.pause(1200);
      (out['주소의 값으로 들어온 화면: 계산을 누른 순간 회차를 7 로 고침'] ??= {})[build] = await read(t);
    } finally { await t.close(); }
  }));
} finally { await browser.close(); }
for (const [label, v] of Object.entries(out)) console.log(`${JSON.stringify(v.orig) === JSON.stringify(v.result) ? 'same' : 'DIFF'}  ${label}\n    orig:   ${JSON.stringify(v.orig)}\n    result: ${JSON.stringify(v.result)}`);
console.log('기록:', await save('verify-race.json', out));
