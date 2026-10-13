// 덧붙인 확인: 며칠 지난 내 후기가 목록의 어디에 놓이는가(원본은 내 후기가 언제나 앞이었다), 날짜가 어떻게 적히는가.
import { launch, openSession, saveJson, FIXED_TIME } from './lib.mjs';

const browser = await launch();
const out = {};
const seed = (days) => ({ 'gachaflix.community': JSON.stringify({ state: { mine: [{ id: 'my_r2c3-age-check', ownedId: 'capture-item-1', boxSlug: 'dollar-apple', itemId: 'da-iphone16', text: '내가 쓴 후기입니다. 위치 확인용 글.', rating: 2, at: new Date(Date.parse(FIXED_TIME) - days * 86400000).toISOString(), publishedAt: new Date(Date.parse(FIXED_TIME) - days * 86400000).toISOString(), bonusUsdt: 0 }] }, version: 0 }) });
const find = (page) => page.evaluate(() => { const rows = Array.from(document.querySelectorAll('.v-rv, .v-rvcard')); const i = rows.findIndex((r) => r.innerText.includes('위치 확인용')); return { rows: rows.length, index: i, row: i >= 0 ? rows[i].innerText.replace(/\s+/g, ' ').slice(0, 160) : null, total: document.querySelector('.v-rv-total')?.innerText ?? null, sum: document.querySelector('.v-rvsum')?.innerText.replace(/\s+/g, ' ') ?? null, more: document.querySelector('[data-reviews-more]')?.innerText ?? null }; });
try {
  for (const days of [0.01, 3, 40]) for (const build of ['orig', 'result', 'off']) {
    const t = await openSession(browser, build, { preset: 'inventory', width: 390, overrides: seed(days) });
    const r = {};
    try {
      await t.goto('/box/dollar-apple'); await t.wait('#reviews'); await t.settle({ quiet: 400 }); r.boxFirst = await find(t.page);
      if (build !== 'orig') { let clicks = 0; while ((await find(t.page)).index < 0 && clicks < 25) { const more = t.page.locator('[data-reviews-more]'); if (!(await more.isVisible().catch(() => false))) break; await more.click(); await t.page.waitForTimeout(120); clicks++; } r.boxAfterMore = { clicks, ...(await find(t.page)) }; }
      await t.goto('/reviews'); await t.wait('.v-main'); await t.settle({ quiet: 400 }); r.allFirst = await find(t.page);
      if (build === 'result' && r.allFirst.index < 0) { let clicks = 0; while ((await find(t.page)).index < 0 && clicks < 40) { await t.page.locator('[data-reviews-more]').click(); await t.page.waitForTimeout(100); clicks++; } r.allAfterMore = { clicks, ...(await find(t.page)) }; }
      await t.goto('/reviews?box=dollar-apple'); await t.wait('.v-main'); await t.settle({ quiet: 400 }); r.boxFilter = await find(t.page);
      // 내 후기의 상세에 쓴 날짜가 적히는가
      if (r.boxFilter.index >= 0) { await t.page.locator('.v-rv-btn, .v-rvcard-btn').nth(r.boxFilter.index).click(); await t.wait('.v-sheet'); r.sheet = (await t.page.locator('.v-sheet').innerText()).replace(/\s+/g, ' ').slice(0, 260); }
      r.errors = t.errors;
    } catch (error) { r.error = String(error.message).split('\n')[0]; }
    out[`${days}d|${build}`] = r;
    console.log(days, build, JSON.stringify({ box: r.boxFirst?.index, boxMore: r.boxAfterMore, all: r.allFirst?.index, allMore: r.allAfterMore?.index, clicks: r.allAfterMore?.clicks }));
    await t.close();
  }
} finally { await browser.close(); }
await saveJson('extra.json', out);
