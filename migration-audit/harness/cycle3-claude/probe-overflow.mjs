#!/usr/bin/env node
/**
 * 가로 넘침을 찾는다: 문서 폭이 창 폭보다 넓은 화면에서 오른쪽으로 나간 요소를 적는다(두 빌드).
 *   node probe-overflow.mjs [--routes /reviews,/] [--widths 320,360] [--more 6]
 */
import { open, launch, save } from './c3.mjs';

const argv = process.argv.slice(2);
const arg = (name, d) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : d; };
const routes = arg('routes', '/reviews,/reviews?box=gaming-playstation,/reviews?box=dollar-apple,,/wins,/wallet,/inventory,/account,/verify').split(',');
const widths = arg('widths', '320,360').split(',').map(Number);
const more = Number(arg('more', '6'));
const PROBE = () => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.right > vw + 0.5) {
      const s = getComputedStyle(el);
      // 넘침을 스스로 가두는 요소(옆으로 미는 줄 등)의 안쪽은 문서 폭을 늘리지 않는다
      let clipped = false; for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const ps = getComputedStyle(p); if (ps.overflowX !== 'visible') { const pr = p.getBoundingClientRect(); if (pr.right <= vw + 0.5) { clipped = true; break; } } }
      if (!clipped) out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(/\s+/).slice(0, 2).join('.')} right=${Math.round(r.right)} pos=${s.position} "${(el.textContent ?? '').trim().slice(0, 30)}"`);
    }
  }
  return { vw, scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth, htmlOverflowX: getComputedStyle(document.documentElement).overflowX, offenders: out.slice(0, 8), offenderCount: out.length };
};
const browser = await launch();
const rows = [];
try {
  for (const locale of ['ko', 'en', 'zh']) for (const width of widths) {
    const pair = await Promise.all(['orig', 'result'].map(async (build) => {
      const t = await open(browser, build, { preset: 'guest', locale, width });
      const found = [];
      try {
        for (const route of routes) {
          await t.goto(route); await t.idle(500);
          for (let i = 0; i < more && await t.has('[data-reviews-more]'); i++) { await t.click('[data-reviews-more]'); await t.pause(120); }
          const p = await t.page.evaluate(PROBE);
          found.push({ build, locale, width, route: route || '/', over: p.scrollWidth - p.vw, ...p });
        }
      } finally { await t.close(); }
      return found;
    }));
    for (let i = 0; i < routes.length; i++) {
      const [o, r] = [pair[0][i], pair[1][i]]; rows.push(o, r);
      if (o.over > 0 || r.over > 0) console.log(`${locale}-${width} ${o.route}: orig +${o.over}px (${o.offenderCount}) result +${r.over}px (${r.offenderCount})\n    orig: ${JSON.stringify(o.offenders.slice(0, 4))}\n    result: ${JSON.stringify(r.offenders.slice(0, 4))}`);
    }
  }
} finally { await browser.close(); }
console.log('넘친 화면 수(orig/result):', rows.filter((r) => r.build === 'orig' && r.over > 0).length, '/', rows.filter((r) => r.build === 'result' && r.over > 0).length, '전체', rows.length / 2);
console.log('기록:', await save('probe-overflow.json', rows));
