// 후기 목록을 많이 편 뒤의 DOM 크기, 힙, 더 보기 한 번에 걸리는 시간. 결과 빌드의 목록이 대상이고, 원본은 같은 화면의 바탕값만 잰다.
//   node reviewvol.mjs
import { launch, openSession, saveJson, heapMetrics, median, round } from './lib.mjs';

const browser = await launch();
const out = { box: {}, all: {}, baseline: {} };
const facts = (page) => page.evaluate(() => ({ rows: document.querySelectorAll('.v-rv, .v-rvcard').length, dom: document.getElementsByTagName('*').length, imgs: document.images.length, loadedImgs: Array.from(document.images).filter((i) => i.complete && i.naturalWidth > 0).length, height: document.documentElement.scrollHeight }));
/** 더 보기를 한 번 누르고, 줄 수가 늘어 그려질 때까지의 시간을 페이지 안에서 잰다 */
const clickMore = (page) => page.evaluate(() => new Promise((resolve) => {
  const btn = document.querySelector('[data-reviews-more]'); if (!btn) { resolve(null); return; }
  const before = document.querySelectorAll('.v-rv').length; const t0 = performance.now();
  btn.click();
  const check = () => { if (document.querySelectorAll('.v-rv').length > before) requestAnimationFrame(() => resolve({ ms: performance.now() - t0, rows: document.querySelectorAll('.v-rv').length })); else if (performance.now() - t0 > 15000) resolve({ ms: -1, rows: before }); else requestAnimationFrame(check); };
  check();
}));
try {
  for (const build of ['orig', 'result']) for (const route of ['/box/watch-rolex', '/box/dollar-apple', '/reviews']) {
    const t = await openSession(browser, build, { preset: 'guest', width: 390, fixedClock: false });
    await t.goto(route); await t.wait('.v-main'); await t.settle({ quiet: 600 });
    out.baseline[`${route}|${build}`] = { ...(await facts(t.page)), ...(await heapMetrics(t.page)) };
    await t.close();
  }
  // 박스 화면: 끝까지 편다
  for (const slug of ['watch-rolex', 'dollar-apple']) {
    const t = await openSession(browser, 'result', { preset: 'guest', width: 390, fixedClock: false });
    await t.goto('/box/' + slug); await t.wait('#reviews'); await t.settle({ quiet: 600 });
    const rec = { steps: [{ at: 'first', ...(await facts(t.page)), ...(await heapMetrics(t.page)) }], clicks: [] };
    for (let i = 0; i < 30; i++) { const c = await clickMore(t.page); if (!c) break; rec.clicks.push(round(c.ms, 1)); if ([4, 9, 14, 19].includes(i)) rec.steps.push({ at: 'click ' + (i + 1), ...(await facts(t.page)), ...(await heapMetrics(t.page)) }); }
    await t.page.waitForTimeout(500);
    rec.steps.push({ at: 'end', ...(await facts(t.page)), ...(await heapMetrics(t.page)) });
    rec.total = await t.page.locator('.v-rv-total').innerText(); rec.moreLeft = await t.page.locator('[data-reviews-more]').count();
    // 끝까지 편 채로 다른 화면에 갔다가 돌아온다(목록은 처음 다섯 건으로 돌아오는가, 힙은 돌아오는가)
    await t.goto(''); await t.wait('.v-boxgrid'); await t.settle({ quiet: 500 }); rec.afterLeave = await heapMetrics(t.page);
    rec.errors = t.errors;
    out.box[slug] = rec;
    console.log('box', slug, rec.total, 'clicks', rec.clicks.length, 'median ms', median(rec.clicks));
    await t.close();
  }
  // 모아 보기: 더 보기 60번(1,220건)
  for (const width of [390, 1440]) {
    const t = await openSession(browser, 'result', { preset: 'guest', width, fixedClock: false });
    await t.goto('/reviews'); await t.wait('.v-rv'); await t.settle({ quiet: 600 });
    const rec = { steps: [{ at: 'first', ...(await facts(t.page)), ...(await heapMetrics(t.page)) }], clicks: [] };
    for (let i = 0; i < 60; i++) { const c = await clickMore(t.page); if (!c) break; rec.clicks.push(round(c.ms, 1)); if ([9, 24, 39, 59].includes(i)) rec.steps.push({ at: 'click ' + (i + 1), ...(await facts(t.page)), ...(await heapMetrics(t.page)) }); }
    rec.total = await t.page.locator('.v-rv-total').innerText(); rec.moreText = await t.page.locator('[data-reviews-more]').innerText().catch(() => null);
    // 많이 편 채로 후기 하나를 열고 닫는 데 걸리는 시간
    const s = Date.now(); await t.page.locator('.v-rv-btn').nth(5).click(); await t.wait('.v-sheet'); rec.sheetOpenMs = Date.now() - s; await t.page.keyboard.press('Escape'); await t.gone('.v-sheet');
    // 박스가 서로 다른 것이 몇 개 섞였는지, 같은 별명과 같은 글이 화면에 겹치는지
    rec.mix = await t.page.evaluate(() => { const rows = Array.from(document.querySelectorAll('.v-rv')); const authors = rows.map((r) => r.querySelector('.v-rv-author')?.innerText); const texts = rows.map((r) => r.querySelector('.v-rv-text')?.innerText); const dup = (list) => { const m = new Map(); for (const x of list) m.set(x, (m.get(x) ?? 0) + 1); return [...m.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 12); }; return { rows: rows.length, uniqueAuthors: new Set(authors).size, uniqueTexts: new Set(texts).size, dupAuthors: dup(authors), dupTexts: dup(texts), agoFirst: rows.slice(0, 5).map((r) => r.querySelector('.v-rv-ago')?.innerText), agoLast: rows.slice(-3).map((r) => r.querySelector('.v-rv-ago')?.innerText) }; });
    rec.errors = t.errors;
    out.all['@' + width] = rec;
    console.log('all', width, rec.total, 'clicks', rec.clicks.length, 'first5', rec.clicks.slice(0, 5), 'last5', rec.clicks.slice(-5));
    await t.close();
  }
} finally { await browser.close(); }
await saveJson('reviewvol.json', out);
console.log('끝');
