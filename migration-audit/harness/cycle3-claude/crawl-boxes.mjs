#!/usr/bin/env node
/**
 * 박스 화면 334개를 세 언어로 전부 연다(결과 빌드, 폭 320, 손님). 콘솔 오류, 페이지 오류, 후기 영역, 가로 넘침을 적는다.
 *   node crawl-boxes.mjs [--build result] [--locales ko,en,zh] [--width 320] [--limit N]
 * 그림 요청은 1x1 PNG 로 답한다(속도. 그림의 내용은 이 검사가 보는 것이 아니다). 동시에 두 페이지.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { open, launch, save, here } from './c3.mjs';

const argv = process.argv.slice(2);
const arg = (name, d) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : d; };
const build = arg('build', 'result');
const locales = arg('locales', 'ko,en,zh').split(',');
const width = Number(arg('width', '320'));
const limit = Number(arg('limit', '0'));
const catalog = JSON.parse(await readFile(path.join(here, '../golden/catalog.json'), 'utf8'));
let slugs = Object.keys(catalog.perBox);
if (limit) slugs = slugs.slice(0, limit);
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

const MEASURE = () => {
  const vw = document.documentElement.clientWidth;
  const section = document.querySelector('#reviews');
  const over = [];
  if (section) for (const el of section.querySelectorAll('*')) { const r = el.getBoundingClientRect(); if (r.width > 0 && (r.right > vw + 1 || r.left < -1) && !el.closest('.v-rv-sr')) { over.push(String(el.className).split(' ')[0] + ':' + Math.round(r.left) + '-' + Math.round(r.right)); if (over.length > 5) break; } }
  const rows = section ? Array.from(section.querySelectorAll('.v-rv')) : [];
  const longest = rows.map((r) => r.querySelector('.v-rv-itemname')?.textContent ?? '').sort((a, b) => b.length - a.length)[0] ?? '';
  return {
    h1: document.querySelector('.v-main h1')?.innerText?.trim() ?? null,
    hasSection: !!section, rows: rows.length, total: section?.querySelector('.v-rv-total')?.innerText?.trim() ?? null,
    sum: section?.querySelector('.v-rvsum-avg')?.innerText?.replace(/\s+/g, ' ').trim() ?? null,
    ratingLine: document.querySelector('.v-ratinglink')?.innerText?.replace(/\s+/g, ' ').trim() ?? null,
    more: section?.querySelector('[data-reviews-more]')?.innerText?.trim() ?? null,
    empty: section?.querySelector('.v-empty')?.innerText?.trim() ?? null,
    docOverflow: document.documentElement.scrollWidth - vw, over, longestItemName: longest.length,
    emptyText: rows.filter((r) => !(r.querySelector('.v-rv-text')?.textContent ?? '').trim()).length,
    noAuthor: rows.filter((r) => !(r.querySelector('.v-rv-author')?.textContent ?? '').trim()).length,
    missingKey: /\bv\.[a-z]+\.[a-zA-Z]+\b|\{[a-z]+\}/.test(section?.innerText ?? ''),
    openBar: !!document.querySelector('.v-openbar .v-btn'),
  };
};

const browser = await launch();
const rows = [];
const started = Date.now();
try {
  for (const locale of locales) {
    const sessions = await Promise.all([0, 1].map(() => open(browser, build, { preset: 'guest', locale, width })));
    for (const t of sessions) await t.context.route(/\.(webp|png|jpe?g|avif|gif)(\?.*)?$/, (route) => route.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
    let next = 0;
    await Promise.all(sessions.map(async (t) => {
      while (next < slugs.length) {
        const slug = slugs[next++];
        const mark = t.errors.length;
        const row = { locale, slug };
        try {
          row.status = await t.goto('/box/' + slug);
          await t.page.locator('#reviews').first().waitFor({ state: 'attached', timeout: 15000 });
          await t.idle(250);
          Object.assign(row, await t.page.evaluate(MEASURE));
        } catch (error) { row.error = String(error.message).split('\n')[0].slice(0, 200); }
        row.console = t.errors.slice(mark);
        rows.push(row);
        if (rows.length % 50 === 0) console.log(`${rows.length} / ${slugs.length * locales.length}  (${Math.round((Date.now() - started) / 1000)}s)`);
      }
    }));
    for (const t of sessions) await t.close();
  }
} finally { await browser.close(); }

const bad = rows.filter((r) => r.error || r.console.length || r.status !== 200 || !r.hasSection || r.rows !== 5 || r.docOverflow > 0 || r.over?.length || r.emptyText || r.noAuthor || r.missingKey || !r.openBar || !r.h1 || !r.ratingLine);
const totals = rows.filter((r) => r.locale === locales[0] && r.total).map((r) => ({ slug: r.slug, n: Number(String(r.total).replace(/[^\d]/g, '')) })).sort((a, b) => a.n - b.n);
const summary = { build, width, locales, pages: rows.length, seconds: Math.round((Date.now() - started) / 1000), failures: bad.length, smallest: totals.slice(0, 3), largest: totals.slice(-3), totalRange: totals.length ? [totals[0].n, totals[totals.length - 1].n] : null, sumOfTotals: totals.reduce((a, b) => a + b.n, 0), longestItemName: Math.max(0, ...rows.map((r) => r.longestItemName ?? 0)) };
console.log(JSON.stringify(summary, null, 1));
for (const r of bad.slice(0, 40)) console.log('BAD', JSON.stringify(r).slice(0, 500));
await save(`crawl-boxes-${build}-${width}.json`, { summary, bad, rows });
