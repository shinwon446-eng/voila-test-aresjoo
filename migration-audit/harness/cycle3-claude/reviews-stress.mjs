#!/usr/bin/env node
/**
 * 샘플 후기를 몰아붙인다(결과 빌드. 대조가 필요한 곳만 원본도 연다).
 *   node reviews-stress.mjs [--only R1,R2,...] [--small slug] [--large slug]
 * R1 가장 작은 박스와 가장 큰 박스에서 더 보기를 끝까지
 * R2 후기 상세: 박스 화면에서, 모아 보기에서
 * R3 /reviews?box= 의 맞는 값, 옛 박스, 없는 값, 빈 값
 * R4 내 후기가 맞는 자리에 섞이는지, 카드와 박스 화면과 모아 보기의 수가 같은지
 * R5 폭 320 에서 긴 상품 이름
 * R6 후기 자리 밖에 후기가 보이지 않는지(나온 상품 등)
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { open, launch, save, SEL, OUT, FIXED_TIME } from './c3.mjs';

const argv = process.argv.slice(2);
const arg = (name, d) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : d; };
const only = arg('only', 'R1,R2,R3,R4,R5,R6,R7').split(',');
let small = arg('small', null), large = arg('large', null);
try { const crawl = JSON.parse(await readFile(path.join(OUT, 'crawl-boxes-result-320.json'), 'utf8')); small ??= crawl.summary.smallest[0].slug; large ??= crawl.summary.largest.at(-1).slug; } catch { /* 인자로 받는다 */ }
small ??= 'dollar-apple'; large ??= 'gaming-playstation';
const out = {};
const rec = (label, value) => { out[label] = value; console.log(label + '\n    ' + JSON.stringify(value).slice(0, 1400)); };

const LIST = () => {
  const toMin = (text) => { const n = Number((text.match(/\d+/) ?? ['0'])[0]); if (/방금|just|刚刚/i.test(text)) return 0; if (/분|min|分钟/.test(text)) return n; if (/시간|hour|小时/.test(text)) return n * 60; if (/개월|month|个月/.test(text)) return n * 43200; if (/일|day|天/.test(text)) return n * 1440; if (/년|year|年/.test(text)) return n * 525600; return -1; };
  const rows = Array.from(document.querySelectorAll('.v-rvfeed .v-rv'));
  const data = rows.map((r) => ({ author: r.querySelector('.v-rv-author')?.textContent ?? '', ago: r.querySelector('.v-rv-ago')?.textContent ?? '', text: r.querySelector('.v-rv-text')?.textContent ?? '', item: r.querySelector('.v-rv-itemname')?.textContent ?? '' }));
  const keys = data.map((d) => d.author + '|' + d.ago + '|' + d.text);
  const mins = data.map((d) => toMin(d.ago));
  let disorder = 0; for (let i = 1; i < mins.length; i++) if (mins[i] < mins[i - 1]) disorder++;
  const vw = document.documentElement.clientWidth;
  const over = []; for (const el of document.querySelectorAll('.v-rvfeed *, .v-rvsum *')) { const r = el.getBoundingClientRect(); if (r.width > 0 && r.right > vw + 1 && !el.closest('.v-rv-sr')) { over.push(String(el.className).split(' ')[0]); if (over.length > 4) break; } }
  return { rows: rows.length, total: document.querySelector('.v-rv-total')?.textContent ?? null, more: document.querySelector('[data-reviews-more]')?.textContent ?? null, duplicates: keys.length - new Set(keys).size, unparsedAgo: mins.filter((m) => m < 0).length, disorder, first: data[0] ?? null, last: data.at(-1) ?? null, docOverflow: document.documentElement.scrollWidth - vw, over, sum: document.querySelector('.v-rvsum-avg')?.innerText?.replace(/\s+/g, ' ') ?? null, dist: Array.from(document.querySelectorAll('.v-rvbars li')).map((li) => li.querySelector('.v-rv-sr')?.textContent ?? ''), longestItem: data.map((d) => d.item).sort((a, b) => b.length - a.length)[0] ?? '' };
};
const digits = (text) => Number(String(text ?? '').replace(/[^\d]/g, '') || NaN);

const browser = await launch();
try {
  if (only.includes('R1')) for (const [label, slug] of [['가장 작은 박스', small], ['가장 큰 박스', large]]) for (const [locale, width] of [['ko', 390], ['zh', 1440]]) {
    const t = await open(browser, 'result', { preset: 'guest', locale, width, shotDir: 'reviews' });
    try {
      await t.goto('/box/' + slug); await t.wait('#reviews .v-rv'); await t.idle(400);
      const start = await t.page.evaluate(LIST); const labels = [start.more]; let clicks = 0; const t0 = Date.now();
      while (await t.has('[data-reviews-more]') && clicks < 60) { await t.click('[data-reviews-more]'); clicks++; await t.pause(120); labels.push(await t.page.locator('[data-reviews-more]').first().textContent({ timeout: 500 }).catch(() => null)); }
      const end = await t.page.evaluate(LIST);
      rec(`R1 ${label} ${slug} ${locale}-${width}`, { start: { rows: start.rows, total: start.total, more: start.more, sum: start.sum }, clicks, ms: Date.now() - t0, end: { rows: end.rows, total: end.total, more: end.more, duplicates: end.duplicates, disorder: end.disorder, unparsedAgo: end.unparsedAgo, docOverflow: end.docOverflow, over: end.over, last: end.last }, rowsEqualTotal: end.rows === digits(end.total), distSum: end.dist.map((d) => digits(d.replace(/^\D*\d\D+/, ''))).reduce((a, b) => a + b, 0), labels: [labels[0], labels[1], labels.at(-2), labels.at(-1)], console: t.errors.slice(0, 4) });
      await t.page.locator('.v-rvfeed .v-rv').last().scrollIntoViewIfNeeded(); await t.shot(`r1-${slug}-${locale}-${width}-end`);
    } catch (error) { rec(`R1 ${label} ${slug} ${locale}-${width} 오류`, String(error.message).split('\n')[0]); } finally { await t.close(); }
  }

  if (only.includes('R2')) for (const [locale, width] of [['ko', 390], ['en', 1440], ['zh', 360]]) {
    const t = await open(browser, 'result', { preset: 'guest', locale, width, shotDir: 'reviews' });
    try {
      const sheet = () => t.page.evaluate(() => { const s = document.querySelector('.v-sheet'); if (!s) return null; return { title: s.querySelector('h2')?.innerText, head: s.querySelector('.v-rvdetail-head')?.innerText.replace(/\s+/g, ' '), textLen: s.querySelector('.v-rvdetail-text')?.textContent.length, rows: Array.from(s.querySelectorAll('.v-row')).map((r) => r.innerText.replace(/\s+/g, ' ')), links: Array.from(s.querySelectorAll('.v-link')).map((l) => l.innerText + ' -> ' + (l.getAttribute('href') ?? '(단추)')), photo: !!s.querySelector('.v-sheet-photo img'), overflowX: s.scrollWidth - s.clientWidth, small: Array.from(s.querySelectorAll('p.v-small')).map((p) => p.innerText) }; });
      await t.goto('/box/gaming-playstation'); await t.wait('#reviews .v-rv'); await t.idle(400);
      const rowText = await t.page.locator('#reviews .v-rv-btn').first().innerText();
      await t.page.locator('#reviews .v-rv-btn').first().focus(); await t.page.keyboard.press('Enter'); await t.wait(SEL.sheet); await t.pause(300);
      const a = await sheet(); await t.shot(`r2-box-sheet-${locale}-${width}`);
      await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet); await t.pause(200);
      const focusBack = await t.page.evaluate(() => document.activeElement?.className ?? null);
      rec(`R2 박스 화면의 후기 상세 ${locale}-${width}`, { row: rowText.replace(/\s+/g, ' ').slice(0, 120), sheet: a, focusAfterEscape: focusBack });
      await t.goto('/reviews'); await t.wait('.v-rvfeed .v-rv'); await t.idle(400);
      const list = await t.page.evaluate(LIST);
      await t.click('.v-rvfeed .v-rv-btn'); await t.wait(SEL.sheet); await t.pause(300);
      const b = await sheet(); await t.shot(`r2-all-sheet-${locale}-${width}`);
      const link = t.page.locator('.v-sheet a.v-link').last(); const href = await link.getAttribute('href').catch(() => null);
      if (href) { await link.click(); await t.page.waitForURL(/\/box\//, { timeout: 10000 }).catch(() => {}); await t.idle(400); }
      rec(`R2 모아 보기의 후기 상세 ${locale}-${width}`, { list: { rows: list.rows, total: list.total, more: list.more, sum: list.sum, disorder: list.disorder, duplicates: list.duplicates, docOverflow: list.docOverflow, over: list.over }, sheet: b, wentTo: t.page.url().split('/voila-test-aresjoo')[1], sheetStillOpen: await t.has(SEL.sheet), console: t.errors.slice(0, 4) });
    } catch (error) { rec(`R2 ${locale}-${width} 오류`, String(error.message).split('\n')[0]); } finally { await t.close(); }
  }

  if (only.includes('R3')) for (const build of ['result', 'orig']) {
    const t = await open(browser, build, { preset: 'guest', locale: 'ko', width: 390, shotDir: 'reviews' });
    try {
      for (const q of ['?box=gaming-playstation', '?box=dollar-apple', '?box=no-such-box', '?box=', '?box=gaming-playstation&box=watch-rolex', '?box=GAMING-PLAYSTATION', '']) {
        await t.goto('/reviews' + q); await t.wait('.v-main .v-title'); await t.idle(500);
        const state = await t.page.evaluate(() => ({ chips: Array.from(document.querySelectorAll('.v-main .v-chips .v-chip')).map((c) => c.innerText + (c.getAttribute('aria-pressed') === 'true' ? '*' : '')).slice(0, 4), chipCount: document.querySelectorAll('.v-main .v-chips .v-chip').length, back: document.querySelector('.v-main .v-back')?.getAttribute('href') ?? null, total: document.querySelector('.v-rv-total')?.textContent ?? null, sum: (document.querySelector('.v-rvsum-avg')?.innerText ?? '').replace(/\s+/g, ' '), rows: document.querySelectorAll('.v-rvfeed .v-rv, .v-rvgrid .v-rvcard').length, empty: document.querySelector('.v-main .v-empty')?.innerText ?? null, firstItem: document.querySelector('.v-rv-itemname')?.textContent ?? null }));
        rec(`R3 ${build} /reviews${q}`, state);
        if (build === 'result' && q === '?box=gaming-playstation') {
          await t.click('.v-main .v-chips .v-chip', 0); await t.pause(400);
          const all = await t.page.evaluate(() => ({ total: document.querySelector('.v-rv-total')?.textContent, back: document.querySelector('.v-main .v-back')?.getAttribute('href'), url: location.search }));
          await t.click('.v-main .v-chips .v-chip', 1); await t.pause(400);
          const again = await t.page.evaluate(() => ({ total: document.querySelector('.v-rv-total')?.textContent, rows: document.querySelectorAll('.v-rvfeed .v-rv').length }));
          rec('R3 result 알약으로 전체와 오가기', { all, again });
        }
      }
      rec(`R3 ${build} 콘솔`, t.errors.slice(0, 5));
    } catch (error) { rec(`R3 ${build} 오류`, String(error.message).split('\n')[0]); } finally { await t.close(); }
  }

  if (only.includes('R4')) {
    const t = await open(browser, 'result', { preset: 'inventory', locale: 'ko', width: 390, shotDir: 'reviews' });
    try {
      const head = () => t.page.evaluate(() => ({ ratingLine: document.querySelector('.v-ratinglink')?.innerText.replace(/\s+/g, ' ') ?? null, sum: document.querySelector('.v-rvsum-avg')?.innerText.replace(/\s+/g, ' ') ?? null, total: document.querySelector('.v-rv-total')?.textContent ?? null }));
      await t.goto('/box/dollar-apple'); await t.wait('#reviews .v-rv'); await t.idle(400);
      const before = { ...(await head()), list: await t.page.evaluate(LIST) };
      await t.goto('/inventory'); await t.wait('.v-main .v-itemrows .v-itemrow'); await t.click('.v-main .v-itemrows .v-itemrow', 1); await t.wait(SEL.sheet); await t.click('.v-rowlink'); await t.wait('.v-sheet textarea');
      await t.click('.v-sheet .v-chip', 0); await t.fill('.v-sheet textarea', '검수용 내 후기입니다. 별 하나를 주고 자리가 맞는지 봅니다. 띄어쓰기없이아주길게이어쓴낱말도넣어봅니다아아아아아아아아아아아아아아아아아아아아아아아아아아아.');
      await t.page.locator('.v-sheet .v-btn').last().click(); await t.pause(900);
      await t.goto('/box/dollar-apple'); await t.wait('#reviews .v-rv'); await t.idle(600);
      const after = { ...(await head()), list: await t.page.evaluate(LIST) };
      await t.page.locator('#reviews').scrollIntoViewIfNeeded(); await t.shot('r4-mine-first');
      await t.click('#reviews .v-rv-btn'); await t.wait(SEL.sheet); await t.pause(300);
      const mineSheet = await t.page.evaluate(() => { const s = document.querySelector('.v-sheet'); return { head: s.querySelector('.v-rvdetail-head')?.innerText.replace(/\s+/g, ' '), rows: Array.from(s.querySelectorAll('.v-row')).map((r) => r.innerText.replace(/\s+/g, ' ')), links: Array.from(s.querySelectorAll('.v-link')).map((l) => l.innerText + ' -> ' + (l.getAttribute('href') ?? '')), small: Array.from(s.querySelectorAll('p.v-small')).map((p) => p.innerText), overflowX: s.scrollWidth - s.clientWidth }; });
      await t.page.keyboard.press('Escape'); await t.gone(SEL.sheet);
      rec('R4 내 후기를 쓰기 전과 뒤(박스 화면)', { before: { ratingLine: before.ratingLine, sum: before.sum, total: before.total, first: before.list.first }, after: { ratingLine: after.ratingLine, sum: after.sum, total: after.total, first: after.list.first, rows: after.list.rows, docOverflow: after.list.docOverflow }, mineSheet });
      await t.goto('/reviews?box=dollar-apple'); await t.wait('.v-rvfeed .v-rv'); await t.idle(400);
      const boxAll = await t.page.evaluate(LIST);
      await t.goto('/reviews'); await t.wait('.v-rvfeed .v-rv'); await t.idle(400);
      const all = await t.page.evaluate(LIST);
      rec('R4 모아 보기에서의 내 후기', { boxFilter: { total: boxAll.total, sum: boxAll.sum, first: boxAll.first }, all: { total: all.total, sum: all.sum, first: all.first } });
      // 내 후기를 50시간 전의 것으로 만든 뒤(저장값만 고친다) 자리를 본다
      await t.page.evaluate((at) => { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.endsWith('gachaflix.community')) { const v = JSON.parse(localStorage.getItem(k)); for (const m of v.state.mine) m.at = at; localStorage.setItem(k, JSON.stringify(v)); } } }, new Date(Date.parse(FIXED_TIME) - 50 * 3600000).toISOString());
      await t.goto('/box/dollar-apple'); await t.wait('#reviews .v-rv'); await t.idle(600);
      let clicks = 0, where = -1;
      const find = () => t.page.evaluate(() => Array.from(document.querySelectorAll('#reviews .v-rv')).findIndex((r) => (r.querySelector('.v-rv-text')?.textContent ?? '').startsWith('검수용 내 후기')));
      while ((where = await find()) < 0 && await t.has('[data-reviews-more]') && clicks < 30) { await t.click('[data-reviews-more]'); clicks++; await t.pause(150); }
      const around = where >= 0 ? await t.page.evaluate((i) => Array.from(document.querySelectorAll('#reviews .v-rv')).slice(Math.max(0, i - 2), i + 3).map((r) => (r.querySelector('.v-rv-author')?.textContent ?? '') + ' / ' + (r.querySelector('.v-rv-ago')?.textContent ?? '')), where) : null;
      const aged = await t.page.evaluate(LIST);
      rec('R4 50시간 전으로 돌린 내 후기의 자리', { index: where, clicks, around, rows: aged.rows, total: aged.total, disorder: aged.disorder, firstAfterAging: aged.first });
      if (where >= 0) { await t.page.locator('#reviews .v-rv').nth(where).scrollIntoViewIfNeeded(); await t.shot('r4-mine-aged'); }
      // 홈 카드, 박스 화면, 모아 보기의 수가 같은지(홈에 나오는 박스 다섯)
      await t.goto(''); await t.wait('.v-boxgrid'); await t.idle(500);
      const cards = await t.page.evaluate(() => Array.from(document.querySelectorAll('.v-boxcard')).slice(0, 5).map((c) => ({ slug: (c.getAttribute('href') ?? '').split('/').filter(Boolean).pop(), rating: c.querySelector('.v-rating')?.innerText.replace(/\s+/g, ' ') ?? null })));
      const agree = [];
      for (const c of cards) {
        await t.goto('/box/' + c.slug); await t.wait('#reviews'); await t.idle(300); const b = await head();
        await t.goto('/reviews?box=' + c.slug); await t.wait('.v-main .v-title'); await t.idle(300); const r = await head();
        agree.push({ slug: c.slug, card: c.rating, boxLine: b.ratingLine, boxSum: b.sum, boxTotal: b.total, reviewsSum: r.sum, reviewsTotal: r.total });
      }
      rec('R4 카드와 박스 화면과 모아 보기의 별점과 후기 수', agree);
      rec('R4 콘솔', t.errors.slice(0, 5));
    } catch (error) { rec('R4 오류', String(error.message).split('\n')[0]); await t.shot('r4-error'); } finally { await t.close(); }
  }

  if (only.includes('R5')) for (const locale of ['ko', 'en', 'zh']) {
    const t = await open(browser, 'result', { preset: 'guest', locale, width: 320, shotDir: 'reviews' });
    try {
      await t.goto('/reviews'); await t.wait('.v-rvfeed .v-rv'); await t.idle(400);
      for (let i = 0; i < 6 && await t.has('[data-reviews-more]'); i++) { await t.click('[data-reviews-more]'); await t.pause(150); }
      const list = await t.page.evaluate(LIST);
      const names = await t.page.evaluate(() => { const els = Array.from(document.querySelectorAll('.v-rv-itemname')); const clipped = els.filter((e) => e.scrollWidth > e.clientWidth + 1); const longest = els.slice().sort((a, b) => b.textContent.length - a.textContent.length)[0]; longest?.setAttribute('data-c3-longest', '1'); const lines = els.map((e) => Math.round(e.getBoundingClientRect().height)); return { count: els.length, clipped: clipped.length, maxHeight: Math.max(...lines), longest: longest?.textContent ?? null, authorsClipped: Array.from(document.querySelectorAll('.v-rv-author')).filter((e) => e.scrollWidth > e.clientWidth + 1).length }; });
      await t.page.locator('[data-c3-longest]').first().scrollIntoViewIfNeeded(); await t.shot(`r5-longest-${locale}-320`);
      await t.page.locator('.v-rv:has([data-c3-longest]) .v-rv-btn').first().click(); await t.wait(SEL.sheet); await t.pause(300);
      const sheet = await t.page.evaluate(() => { const s = document.querySelector('.v-sheet'); const vw = document.documentElement.clientWidth; const over = Array.from(s.querySelectorAll('*')).filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > vw + 1; }).map((el) => String(el.className).split(' ')[0]).slice(0, 5); return { overflowX: s.scrollWidth - s.clientWidth, over, rows: Array.from(s.querySelectorAll('.v-row')).map((r) => r.innerText.replace(/\s+/g, ' ').slice(0, 120)) }; });
      await t.shot(`r5-longest-sheet-${locale}-320`);
      rec(`R5 폭 320 모아 보기 ${locale}`, { rows: list.rows, docOverflow: list.docOverflow, over: list.over, names, sheet, console: t.errors.slice(0, 3) });
    } catch (error) { rec(`R5 ${locale} 오류`, String(error.message).split('\n')[0]); } finally { await t.close(); }
  }

  if (only.includes('R6')) for (const build of ['result', 'orig']) {
    const t = await open(browser, build, { preset: 'inventory', locale: 'ko', width: 390, shotDir: 'reviews' });
    try {
      const found = {};
      for (const route of ['/wins', '/inventory', '/wallet', '/wallet/withdraw', '/account', '/verify', '/guide', '/legal', '/legal/terms', '/about', '/community', '/community/board', '/profile', '/fairness']) {
        await t.goto(route); await t.idle(600);
        found[route] = await t.page.evaluate(() => ({ url: location.pathname.split('/voila-test-aresjoo')[1], rv: document.querySelectorAll('.v-rv, .v-rvfeed, .v-rvsum, .v-rvcard, .v-rvlist').length, rating: document.querySelectorAll('.v-rating, .v-stars').length, reviewWords: (document.querySelector('.v-main')?.innerText.match(/후기/g) ?? []).length }));
      }
      rec(`R6 ${build} 후기 자리 밖의 화면`, found);
      await t.goto('/wins'); await t.idle(500); await t.shot(`r6-wins-${build}`);
    } catch (error) { rec(`R6 ${build} 오류`, String(error.message).split('\n')[0]); } finally { await t.close(); }
  }
  // R7 모아 보기에서 더 보기를 깊이 누를 때 누름마다 걸리는 시간(박스 마흔 개의 글만 쥐는 캐시가 밀려나는 구간)
  if (only.includes('R7')) {
    const t = await open(browser, 'result', { preset: 'guest', locale: 'ko', width: 1440, shotDir: 'reviews' });
    try {
      await t.goto('/reviews'); await t.wait('.v-rvfeed .v-rv'); await t.idle(600);
      const times = [];
      for (let i = 0; i < 60 && await t.has('[data-reviews-more]'); i++) {
        const ms = await t.page.evaluate(async () => { const n = document.querySelectorAll('.v-rvfeed .v-rv').length; const t0 = performance.now(); document.querySelector('[data-reviews-more]').click(); for (let k = 0; k < 600; k++) { if (document.querySelectorAll('.v-rvfeed .v-rv').length > n) break; await new Promise((r) => setTimeout(r, 5)); } await new Promise((r) => requestAnimationFrame(() => r())); return Math.round(performance.now() - t0); });
        times.push(ms);
      }
      const list = await t.page.evaluate(LIST);
      rec('R7 모아 보기 더 보기 60번의 누름마다 걸린 시간(ms)', { clicks: times.length, first5: times.slice(0, 5), last5: times.slice(-5), max: Math.max(...times), rows: list.rows, total: list.total, more: list.more, duplicates: list.duplicates, disorder: list.disorder, unparsedAgo: list.unparsedAgo, docOverflow: list.docOverflow, console: t.errors.slice(0, 3) });
    } catch (error) { rec('R7 오류', String(error.message).split('\n')[0]); } finally { await t.close(); }
  }
} finally { await browser.close(); }
console.log('기록:', await save(`reviews-stress${only.length < 7 ? '-' + only.join('') : ''}.json`, out));
