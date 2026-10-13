// 덧붙인 확인 둘:
//  (가) 홈 박스에 쓴 내 후기가 카드, 박스 화면, 모아 보기에서 같은 수로 세어지는가(세 빌드). 내 후기는 저장소에 심는다.
//  (나) 샘플 후기의 "몇 분 전"이 시계와 상관없이 같은가: 기기 시계를 사흘, 서른 날 뒤로 옮겨 같은 화면을 다시 본다.
import { launch, openSession, saveJson, FIXED_TIME } from './lib.mjs';

const browser = await launch();
const out = { homeCount: {}, frozen: {} };
const at = new Date(Date.parse(FIXED_TIME) - 3600000).toISOString();
const seed = { 'gachaflix.community': JSON.stringify({ state: { mine: [{ id: 'my_r2c3-home-1', ownedId: 'seed-owned-1', boxSlug: 'pokemon-charizard', itemId: 'pokemon-p-ug-precise-fit-100', text: '홈 박스에 쓴 내 후기입니다. 별 하나.', rating: 1, at, publishedAt: at, bonusUsdt: 0 }, { id: 'my_r2c3-home-2', ownedId: 'seed-owned-2', boxSlug: 'watch-rolex', itemId: 'nope', text: '상품을 찾을 수 없는 내 후기입니다.', rating: 3, at, publishedAt: at, bonusUsdt: 0 }, { id: 'my_r2c3-home-3', ownedId: 'seed-owned-3', boxSlug: 'no-such-box', itemId: 'nope', text: '없는 박스의 후기.', rating: 5, at, publishedAt: at, bonusUsdt: 0 }] }, version: 0 }) };
const card = (page, slug) => page.evaluate((slug) => { const a = document.querySelector(`.v-boxcard[href*="/box/${slug}/"]`); return a ? (a.querySelector('.v-rating')?.getAttribute('aria-label') ?? '(별점 줄 없음)') : '(카드 없음)'; }, slug);
const zone = (page) => page.evaluate(() => ({ ratingLine: document.querySelector('.v-main .v-rating')?.getAttribute('aria-label') ?? '', total: document.querySelector('.v-rv-total')?.innerText ?? '', sum: document.querySelector('.v-rvsum')?.innerText.replace(/\s+/g, ' ') ?? '', rows: document.querySelectorAll('.v-rv, .v-rvcard').length, first: Array.from(document.querySelectorAll('.v-rv, .v-rvcard')).slice(0, 2).map((r) => r.innerText.replace(/\s+/g, ' ').slice(0, 110)), empty: Array.from(document.querySelectorAll('.v-main .v-empty')).map((e) => e.innerText) }));
try {
  for (const build of ['orig', 'result', 'off']) for (const withMine of [false, true]) {
    const t = await openSession(browser, build, { preset: 'funded', width: 390, overrides: withMine ? seed : {} });
    const r = {};
    try {
      await t.goto(''); await t.wait('.v-boxgrid'); await t.settle({ quiet: 500 });
      r.cards = { charizard: await card(t.page, 'pokemon-charizard'), rolex: await card(t.page, 'watch-rolex'), hermes: await card(t.page, 'bag-hermes') };
      for (const slug of ['pokemon-charizard', 'watch-rolex']) { await t.goto('/box/' + slug); await t.wait('#reviews'); await t.settle({ quiet: 400 }); r['box ' + slug] = await zone(t.page); await t.goto('/reviews?box=' + slug); await t.wait('.v-main'); await t.settle({ quiet: 400 }); r['reviews ' + slug] = await zone(t.page); }
      await t.goto('/reviews'); await t.wait('.v-main'); await t.settle({ quiet: 400 }); r.all = await zone(t.page);
      r.errors = t.errors;
    } catch (error) { r.error = String(error.message).split('\n')[0]; }
    out.homeCount[`${build}|${withMine ? 'mine' : 'none'}`] = r;
    console.log(build, withMine, JSON.stringify({ cards: r.cards, box: r['box pokemon-charizard']?.ratingLine, total: r['box pokemon-charizard']?.total, rv: r['reviews pokemon-charizard']?.total, all: r.all?.total }));
    await t.close();
  }
  // (나) 시계를 옮겨도 같은 글이 같은 "몇 분 전"으로 보이는가
  for (const days of [0, 3, 30]) {
    const t = await openSession(browser, 'result', { preset: 'guest', width: 390 });
    await t.page.clock.setFixedTime(new Date(Date.parse(FIXED_TIME) + days * 86400000 + (days ? 7 * 3600000 : 0)));
    const r = {};
    for (const route of ['/reviews', '/box/watch-rolex']) { await t.goto(route); await t.wait('.v-rv'); await t.settle({ quiet: 400 }); r[route] = await t.page.evaluate(() => ({ now: new Date().toISOString(), rows: Array.from(document.querySelectorAll('.v-rv')).slice(0, 5).map((x) => (x.querySelector('.v-rv-author')?.innerText ?? '') + ' | ' + (x.querySelector('.v-rv-ago')?.innerText ?? '') + ' | ' + (x.querySelector('.v-rv-text')?.innerText ?? '').slice(0, 30)) })); }
    out.frozen['+' + days + 'd'] = r;
    if (days === 30) await t.shot('content-frozen-ago-plus30d', { fullPage: false });
    await t.close();
  }
  out.frozenSame = JSON.stringify(Object.values(out.frozen).map((v) => Object.values(v).map((x) => x.rows))) && new Set(Object.values(out.frozen).map((v) => JSON.stringify(Object.values(v).map((x) => x.rows)))).size === 1;
} finally { await browser.close(); }
await saveJson('extra2.json', out);
console.log('frozenSame', out.frozenSame, JSON.stringify(out.frozen['+30d']).slice(0, 500));
