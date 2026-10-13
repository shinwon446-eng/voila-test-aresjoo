// 바뀐 코드 둘레의 견고함. 두 빌드(필요하면 샘플을 끈 빌드까지)에서 같은 조작을 하고 관찰값을 적는다.
//   node robust.mjs --only deeplink,review,draft,tabs,switch,wform,withdraw,volume [--builds orig,result,off]
// 전부 브라우저 안의 시험 장부다(실제 서비스 없음). 비밀번호는 프로젝트의 촬영용 고정값(web/scripts/capture/states.mjs)만 쓴다.
import { launch, openSession, saveJson, SEL, heapMetrics, patchLedger, deepDiff } from './lib.mjs';
import { loadStates } from '../lib/common.mjs';

const argv = process.argv.slice(2);
const arg = (name, fallback) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : fallback; };
const ONLY = String(arg('only', 'deeplink,review,draft,tabs,switch,wform,withdraw,volume')).split(',');
const BUILDS_ARG = arg('builds', null);
const { credentials } = await loadStates();
const browser = await launch();
const out = {};
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const safe = async (label, fn) => { try { return await fn(); } catch (error) { return { error: label + ': ' + String(error.message).split('\n')[0].slice(0, 220) }; } };
const pageFacts = (page) => page.evaluate(() => {
  const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
  const main = document.querySelector('.v-main');
  return { path: location.pathname.replace('/voila-test-aresjoo', '') + location.search + location.hash, h1: clean(document.querySelector('h1')?.innerText), mainLen: clean(main?.innerText).length, hasMain: !!main,
    chips: Array.from(document.querySelectorAll('.v-main .v-chips')).map((g) => Array.from(g.querySelectorAll('.v-chip')).map((c) => clean(c.innerText) + (c.getAttribute('aria-pressed') === 'true' ? '*' : ''))),
    reviews: document.querySelectorAll('.v-rv, .v-rvcard').length, total: clean(document.querySelector('.v-rv-total')?.innerText), sum: clean(document.querySelector('.v-rvsum')?.innerText), empty: Array.from(document.querySelectorAll('.v-main .v-empty')).map((e) => clean(e.innerText)),
    back: document.querySelector('.v-back')?.getAttribute('href') ?? null, overflowX: document.documentElement.scrollWidth > innerWidth + 1, bodyText: clean(document.body.innerText).slice(0, 160), nextError: !!document.querySelector('#__next_error__') || /Application error/i.test(document.body.innerText) };
});
const zoneFacts = (page) => page.evaluate(() => {
  const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
  const cards = Array.from(document.querySelectorAll('.v-rv, .v-rvcard')).slice(0, 4).map((li) => ({ author: clean(li.querySelector('.v-rv-author')?.innerText ?? li.querySelector('.v-rvcard-body > .v-small')?.innerText), ago: clean(li.querySelector('.v-rv-ago')?.innerText ?? Array.from(li.querySelectorAll('.v-small.v-num')).at(-1)?.innerText), text: clean(li.querySelector('.v-rv-text, .v-rvcard-text')?.innerText).slice(0, 70), stars: li.querySelectorAll('.v-star:not(.v-star--off)').length, w: Math.round(li.getBoundingClientRect().width), overflow: Array.from(li.querySelectorAll('*')).some((e) => e.getBoundingClientRect().right > innerWidth + 1) }));
  return { ratingLine: clean(document.querySelector('.v-main .v-rating')?.getAttribute('aria-label')), total: clean(document.querySelector('.v-rv-total')?.innerText), sum: clean(document.querySelector('.v-rvsum')?.innerText), cards, count: document.querySelectorAll('.v-rv, .v-rvcard').length, empty: Array.from(document.querySelectorAll('.v-main .v-empty')).map((e) => clean(e.innerText)), overflowX: document.documentElement.scrollWidth > innerWidth + 1, docW: document.documentElement.scrollWidth };
});
const builds = (def) => (BUILDS_ARG ? BUILDS_ARG.split(',') : def);

// ── 1. 뜻밖의 주소 ─────────────────────────────────────────────────────────────
if (ONLY.includes('deeplink')) {
  const routes = ['/reviews?box=constructor', '/reviews?box=__proto__', '/reviews?box=toString', '/reviews?box=hasOwnProperty', '/reviews?box=nope', '/reviews?box=', '/reviews?box=dollar-apple&box=watch-rolex', '/reviews?box=watch-rolex&box=dollar-apple', '/reviews?box=%3Cscript%3Ealert(1)%3C/script%3E', '/reviews?box=DOLLAR-APPLE', '/reviews?box=watch-rolex&shown=99999', '/reviews?foo=bar#reviews', '/box/watch-rolex?x=1&box=nope#reviews', '/box/dollar-apple?qty=100#reviews', '/box/watch-rolex#reviews-title', '/wallet?tx=abc&open=1', '/wallet/withdraw?amount=1e99&network=XYZ', '/verify?s=a&h=b&c=c&n=-1&box=constructor', '/verify?s=%00&n=abc', '/?q=%F0%9F%98%80&category=__proto__', '/inventory?tab=constructor', '/account?sheet=password'];
  out.deeplink = {};
  for (const build of builds(['orig', 'result', 'off'])) {
    out.deeplink[build] = {};
    for (const route of routes) {
      const t = await openSession(browser, build, { preset: 'funded', width: 390 });
      out.deeplink[build][route] = await safe(route, async () => { const res = await t.goto(route); await t.settle({ quiet: 500 }); const facts = await pageFacts(t.page); return { status: res?.status() ?? null, ...facts, errors: t.errors }; });
      if (['/reviews?box=constructor', '/reviews?box=__proto__'].includes(route)) await t.shot(`robust-deeplink-${build}-${route.replace(/[^a-z_]+/gi, '-')}`);
      await t.close();
    }
    console.log('deeplink', build, '끝');
  }
}

// ── 2. 내 후기: 저장 실패, 긴 글, 긴 별명, 오른쪽에서 왼쪽으로 쓰는 글, 이모지 ─────────────────
const LONG_NICK = '아주긴닉네임🧑‍🤝‍🧑مرحبا' + 'W'.repeat(40);
const HOSTILE = 'W'.repeat(240) + ' 🎁🧑‍🤝‍🧑🇰🇷 مرحبا بالعالم هذا اختبار שלום עולם ‮gnp.exe‬ <b>bold</b> <img src=x onerror=alert(1)> ' + '가'.repeat(200) + '\n\n\n줄바꿈 뒤 ' + 'https://example.invalid/' + 'a'.repeat(300);
async function reviewTest(build, width, nick) {
  const t = await openSession(browser, build, { preset: 'inventory', width, mutate: (state) => { if (!nick) return; const accounts = JSON.parse(state.values['voila.browser-accounts.v1']); for (const a of accounts) a.user.nickname = nick; state.values['voila.browser-accounts.v1'] = JSON.stringify(accounts); state.user.nickname = nick; } });
  const r = { build, width, nick: !!nick };
  const mine = async () => ((await t.storage())['gachaflix.community']?.state?.mine ?? []).map((m) => ({ ownedId: m.ownedId, rating: m.rating, len: m.text.length, box: m.boxSlug, authorName: m.authorName ?? null }));
  const openWriter = async (nth) => { await t.goto('/inventory'); await t.wait('.v-main .v-itemrows .v-itemrow'); await t.click('.v-main .v-itemrows .v-itemrow', nth); await t.wait(SEL.sheet); await t.click('.v-rowlink'); await t.wait('.v-sheet textarea'); };
  try {
    await openWriter(0);
    // 저장 실패: 후기 저장 키에 쓰려 하면 용량 초과를 던진다
    await t.page.evaluate(() => { const real = Storage.prototype.setItem; window.__realSet = real; Storage.prototype.setItem = function (key, value) { if (String(key).includes('gachaflix.community')) throw new DOMException('quota', 'QuotaExceededError'); return real.call(this, key, value); }; });
    await t.page.locator('.v-sheet textarea').fill('저장 실패 시험 글입니다. 다섯 자 넘음.');
    await t.page.locator('.v-sheet .v-btn').last().click(); await t.page.waitForTimeout(600);
    r.quota = { lines: await t.page.locator('.v-sheet .v-line').allInnerTexts(), sheetOpen: await t.has('.v-sheet textarea'), draftKept: await t.page.locator('.v-sheet textarea').inputValue().catch(() => null), mine: await mine() };
    await t.shot(`robust-review-quota-${build}-${width}`);
    await t.page.evaluate(() => { Storage.prototype.setItem = window.__realSet; });
    await t.page.locator('.v-sheet .v-btn').last().click(); await t.page.waitForTimeout(1000);
    r.afterRetry = { mine: await mine(), sheetText: clean(await t.page.locator(SEL.sheet).first().innerText().catch(() => '')).slice(0, 200), writerStillOpen: await t.has('.v-sheet textarea') };
    // 둘째 상품에 긴 글(가장 긴 길이, 띄어쓰기 없는 긴 낱말, 이모지, 아랍 글자, 히브리 글자, 방향을 뒤집는 문자, 태그 모양의 글)
    await openWriter(1);
    await t.click('.v-sheet .v-chip', 0);
    await t.page.locator('.v-sheet textarea').fill(HOSTILE);
    r.typedLen = (await t.page.locator('.v-sheet textarea').inputValue()).length; r.maxlength = await t.page.locator('.v-sheet textarea').getAttribute('maxlength');
    await t.page.locator('.v-sheet .v-btn').last().click(); await t.page.waitForTimeout(1000);
    r.afterLong = { mine: await mine(), lines: await t.page.locator('.v-sheet .v-line').allInnerTexts().catch(() => []) };
    await t.goto('/box/dollar-apple'); await t.wait('#reviews'); await t.settle({ quiet: 500 });
    await t.page.locator('#reviews').scrollIntoViewIfNeeded();
    r.box = await zoneFacts(t.page);
    await t.shot(`robust-review-box-${build}-${width}${nick ? '-nick' : ''}`);
    r.xss = await t.page.evaluate(() => ({ injectedImg: !!document.querySelector('#reviews img[src="x"]'), bold: !!document.querySelector('#reviews b') }));
    await t.click('.v-rv-btn, .v-rvcard-btn', 0); await t.wait(SEL.sheet); await t.page.waitForTimeout(300);
    r.sheet = await t.page.evaluate(() => { const s = document.querySelector('.v-sheet'); const clean = (x) => String(x ?? '').replace(/\s+/g, ' ').trim(); return { head: clean(s.querySelector('.v-rvdetail-head')?.innerText).slice(0, 120), textLen: s.querySelector('.v-rvdetail-text')?.innerText.length, rows: Array.from(s.querySelectorAll('.v-row')).map((x) => clean(x.innerText).slice(0, 80)), links: Array.from(s.querySelectorAll('.v-link')).map((x) => clean(x.innerText) + ' → ' + (x.getAttribute('href') ?? '').replace(/^.*\/(ko|en|zh)\//, '/').slice(0, 60)), overflow: Array.from(s.querySelectorAll('*')).some((e) => e.getBoundingClientRect().right > innerWidth + 1 || e.getBoundingClientRect().left < -1), sheetScrollW: s.scrollWidth, sheetClientW: s.clientWidth }; });
    await t.shot(`robust-review-sheet-${build}-${width}${nick ? '-nick' : ''}`);
    await t.page.keyboard.press('Escape');
    await t.goto('/reviews'); await t.wait('.v-main'); await t.settle({ quiet: 500 }); r.reviewsAll = await zoneFacts(t.page);
    await t.shot(`robust-review-all-${build}-${width}${nick ? '-nick' : ''}`);
    await t.goto('/reviews?box=dollar-apple'); await t.wait('.v-main'); await t.settle({ quiet: 500 }); r.reviewsBox = await zoneFacts(t.page);
    await t.page.reload(); await t.wait('.v-main'); await t.settle({ quiet: 500 }); r.afterReload = { count: (await zoneFacts(t.page)).count, mine: (await mine()).length };
    r.errors = t.errors;
  } catch (error) { r.error = String(error.message).split('\n')[0].slice(0, 240); await t.shot(`robust-review-error-${build}-${width}`); }
  await t.close();
  return r;
}
if (ONLY.includes('review')) {
  out.review = [];
  for (const build of builds(['orig', 'result', 'off'])) { out.review.push(await reviewTest(build, 390, null)); out.review.push(await reviewTest(build, 320, LONG_NICK)); if (build !== 'off') out.review.push(await reviewTest(build, 1440, LONG_NICK)); console.log('review', build, '끝'); }
}

// ── 2-1. 홈 박스의 내 후기가 카드, 박스 화면, 모아 보기에서 같은 수로 세어지는가 ───────────────
if (ONLY.includes('review')) {
  out.reviewHome = {};
  for (const build of builds(['orig', 'result', 'off'])) {
    const t = await openSession(browser, build, { preset: 'funded', width: 390 });
    out.reviewHome[build] = await safe('reviewHome', async () => {
      const r = {};
      const card = async () => { await t.goto(''); await t.wait('.v-boxgrid'); await t.settle({ quiet: 400 }); return t.page.evaluate(() => { const a = document.querySelector('.v-boxcard[href*="/box/pokemon-charizard/"]'); return a ? (a.querySelector('.v-rating')?.getAttribute('aria-label') ?? '(별점 줄 없음)') : '(카드 없음)'; }); };
      r.cardBefore = await card();
      await t.goto('/box/pokemon-charizard'); await t.wait('#reviews'); await t.settle({ quiet: 400 });
      r.boxBefore = await zoneFacts(t.page);
      // 가입 혜택 박스를 한 번 연다(무료). 나온 상품에 후기를 쓴다
      await t.tick(); await t.click('.v-openbar .v-btn'); if (await t.page.locator(SEL.alert).first().waitFor({ state: 'visible', timeout: 1500 }).then(() => true, () => false)) await t.confirm();
      await t.wait(SEL.opSettled, { timeout: 30000 }); await t.page.waitForTimeout(600);
      const inv = (await t.storage())['voila.browser-inventory.capture-account']?.state?.items ?? [];
      r.opened = inv.map((i) => ({ itemId: i.itemId, value: i.valueUsdt, status: i.status }));
      await t.goto('/inventory'); await t.wait('.v-main .v-chips'); await t.page.waitForTimeout(400);
      if (!(await t.has('.v-main .v-itemrows .v-itemrow'))) { await t.click('.v-main .v-chips .v-chip', 2); await t.page.waitForTimeout(300); }
      await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet);
      if (!(await t.has('.v-rowlink'))) { r.note = '이 상품에는 후기 쓰기 줄이 없다(값이 기준에 못 미침)'; return r; }
      await t.click('.v-rowlink'); await t.wait('.v-sheet textarea');
      await t.click('.v-sheet .v-chip', 1); await t.page.locator('.v-sheet textarea').fill('직접 쓴 후기입니다. 별 둘을 줍니다.');
      await t.page.locator('.v-sheet .v-btn').last().click(); await t.page.waitForTimeout(1000);
      r.mine = ((await t.storage())['gachaflix.community']?.state?.mine ?? []).length;
      await t.goto('/box/pokemon-charizard'); await t.wait('#reviews'); await t.settle({ quiet: 400 }); r.boxAfter = await zoneFacts(t.page);
      await t.page.locator('#reviews').scrollIntoViewIfNeeded(); await t.shot(`robust-reviewhome-box-${build}`);
      r.cardAfter = await card();
      await t.goto('/reviews?box=pokemon-charizard'); await t.wait('.v-main'); await t.settle({ quiet: 400 }); r.reviewsBox = await zoneFacts(t.page);
      await t.goto('/reviews'); await t.wait('.v-main'); await t.settle({ quiet: 400 }); r.reviewsAll = await zoneFacts(t.page);
      r.errors = t.errors;
      return r;
    });
    await t.close(); console.log('reviewHome', build, '끝');
  }
}

// ── 3. 초안: 닫았다 다시 열기, 다른 상품으로 열기, 새로 고침, 뒤로 가기 ─────────────────────────
if (ONLY.includes('draft')) {
  out.draft = {};
  for (const build of builds(['orig', 'result'])) {
    const t = await openSession(browser, build, { preset: 'inventory', width: 390 });
    out.draft[build] = await safe('draft', async () => {
      const r = {};
      const openItem = async (nth) => { await t.click('.v-main .v-itemrows .v-itemrow', nth); await t.wait(SEL.sheet); await t.click('.v-rowlink'); await t.wait('.v-sheet textarea'); await t.page.waitForTimeout(200); };
      const value = () => t.page.locator('.v-sheet textarea').inputValue();
      const closeAll = async () => { for (let i = 0; i < 3 && await t.has(SEL.sheet); i++) { await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(350); } };
      await t.goto('/inventory'); await t.wait('.v-main .v-itemrows .v-itemrow');
      await openItem(0); await t.click('.v-sheet .v-chip', 1); await t.page.locator('.v-sheet textarea').fill('첫 상품의 초안 하나 둘 셋');
      r.pressedBefore = await t.page.locator('.v-sheet .v-chip[aria-pressed="true"]').allInnerTexts();
      await t.page.keyboard.press('Escape'); await t.page.waitForTimeout(400);
      r.afterOneEscape = { writerOpen: await t.has('.v-sheet textarea'), sheetOpen: await t.has(SEL.sheet) };
      await closeAll();
      await openItem(0); r.sameItemReopen = { text: await value(), pressed: await t.page.locator('.v-sheet .v-chip[aria-pressed="true"]').allInnerTexts() };
      await closeAll();
      await openItem(1); r.otherItem = { text: await value(), pressed: await t.page.locator('.v-sheet .v-chip[aria-pressed="true"]').allInnerTexts() };
      await t.page.locator('.v-sheet textarea').fill('둘째 상품의 초안');
      await t.page.reload(); await t.wait('.v-main .v-itemrows .v-itemrow'); await t.page.waitForTimeout(400);
      r.afterReload = { sheetOpen: await t.has(SEL.sheet), mine: ((await t.storage())['gachaflix.community']?.state?.mine ?? []).length };
      await openItem(1); r.afterReloadText = await value();
      await t.page.locator('.v-sheet textarea').fill('뒤로 가기 전의 초안');
      await t.page.goBack().catch(() => {}); await t.page.waitForTimeout(800);
      r.afterBack = { url: t.page.url().replace(/^.*voila-test-aresjoo/, ''), sheetOpen: await t.has(SEL.sheet) };
      r.errors = t.errors;
      return r;
    });
    await t.close();
  }
}

// ── 4. 두 탭 ───────────────────────────────────────────────────────────────────
if (ONLY.includes('tabs')) {
  out.tabs = {};
  for (const build of builds(['orig', 'result'])) {
    const a = await openSession(browser, build, { preset: 'funded', width: 390 });
    out.tabs[build] = await safe('tabs', async () => {
      const r = {};
      await a.goto('/wallet'); await a.wait('.v-main .v-title'); await a.settle({ quiet: 400 });
      const walletFacts = (page) => page.evaluate(() => ({ header: document.querySelector('[data-balance-open]')?.innerText.replace(/\s+/g, ' '), rows: Array.from(document.querySelectorAll('.v-main .v-itemrow')).map((x) => x.innerText.replace(/\s+/g, ' ')) }));
      r.aBefore = await walletFacts(a.page);
      const b = await openSession(browser, build, { preset: 'funded', width: 390, context: a.context });
      b.state = a.state;
      await b.goto('/box/dollar-apple'); await b.wait(SEL.open); await b.settle({ quiet: 300 });
      for (let i = 0; i < 3; i++) { await b.tick(); if (await b.has('[data-open-again]:not([disabled])')) await b.click('[data-open-again]'); else await b.click(SEL.open); await b.page.waitForFunction(({ n }) => (JSON.parse(localStorage.getItem('gachaflix.fair') ?? localStorage.getItem(Object.keys(localStorage).find((k) => k.endsWith('gachaflix.fair')) ?? '') ?? '{}').state?.nonce ?? 0) > n, { n: i }, { timeout: 20000 }).catch(() => {}); await b.wait(SEL.opSettled, { timeout: 20000 }); await b.page.waitForTimeout(500); }
      await a.page.bringToFront(); await a.page.waitForTimeout(1500);
      r.aAfterOtherTab = await walletFacts(a.page);
      // 낡은 상태의 탭 A 에서 이어서 연다
      await a.goto('/box/dollar-apple'); await a.wait(SEL.open); await a.settle({ quiet: 300 });
      r.aHeaderOnBox = (await walletFacts(a.page)).header;
      await a.tick(); await a.click(SEL.open); await a.wait(SEL.opSettled, { timeout: 20000 }); await a.page.waitForTimeout(600);
      // 탭 B 는 새로 고치지 않은 채로 한 번 더 연다
      await b.page.bringToFront(); await b.tick(); await b.click('[data-open-again]').catch(() => {}); await b.page.waitForTimeout(2500);
      const s = await a.storage();
      const w = s['voila.browser-wallet.capture-account'].state; const inv = s['voila.browser-inventory.capture-account'].state.items;
      const nonces = inv.map((i) => i.fair?.nonce);
      r.ledger = { balance: w.balance, txs: w.transactions.length, txSum: +w.transactions.reduce((x, t) => x + t.amountUsdt, 0).toFixed(2), opens: w.transactions.filter((x) => x.type === 'open').length, items: inv.length, nonces: nonces.sort((x, y) => x - y), duplicateNonces: nonces.length - new Set(nonces).size, fairNonce: s['gachaflix.fair']?.state?.nonce, wagered: w.totalWagered };
      await a.goto('/wallet'); await a.wait('.v-main .v-title'); await a.settle({ quiet: 400 }); r.aWalletEnd = await walletFacts(a.page);
      r.errors = [a.errors, b.errors];
      return r;
    });
    await a.close();
  }
}

// ── 5. 계정 바꾸기 ─────────────────────────────────────────────────────────────
const twoAccounts = (state) => {
  const accounts = JSON.parse(state.values['voila.browser-accounts.v1']);
  const b = JSON.parse(JSON.stringify(accounts[0])); b.user.id = 'capture-account-b'; b.user.email = 'capture-b@example.invalid'; b.user.nickname = '둘째계정';
  accounts.push(b); state.values['voila.browser-accounts.v1'] = JSON.stringify(accounts);
  const at = state.user.createdAt;
  patchLedger(state, (box) => { box.wallet.transactions.push({ id: 'a-open-1', type: 'open', amountUsdt: -1.11, ref: 'dollar-applex1', at }, { id: 'a-open-2', type: 'open', amountUsdt: -2.22, ref: 'dollar-applex1', at }, { id: 'a-sell-1', type: 'sellback', amountUsdt: 3.33, ref: 'x', at }); });
  const wb = { balance: 500, cryptoBalance: 500, cardBalance: 0, settledDepositRefs: [], totalDeposited: 0, totalDepositedCrypto: 0, totalDepositedCard: 0, totalWagered: 0, welcomeClaimed: true, transactions: [{ id: 'b-welcome', accountId: 'capture-account-b', type: 'bonus', amountUsdt: 500, ref: 'welcome', at }, { id: 'b-open-1', type: 'open', amountUsdt: -7.77, ref: 'dollar-applex1', at }, { id: 'b-sell-1', type: 'sellback', amountUsdt: 8.88, ref: 'y', at }] };
  state.values['voila.browser-wallet.capture-account-b'] = JSON.stringify({ state: wb, version: 4 });
  state.values['voila.browser-inventory.capture-account-b'] = JSON.stringify({ state: { items: [] }, version: 0 });
};
if (ONLY.includes('switch')) {
  out.switch = {};
  for (const build of builds(['orig', 'result'])) {
    const a = await openSession(browser, build, { preset: 'funded', width: 390, mutate: twoAccounts });
    out.switch[build] = await safe('switch', async () => {
      const r = {};
      const rows = (page) => page.evaluate(() => ({ header: document.querySelector('[data-balance-open]')?.innerText.replace(/\s+/g, ' ') ?? '(잔액 단추 없음)', rows: Array.from(document.querySelectorAll('.v-main .v-itemrow')).map((x) => x.innerText.replace(/\s+/g, ' ')) }));
      await a.goto('/wallet'); await a.wait('.v-main .v-title'); await a.settle({ quiet: 500 }); r.asA = await rows(a.page);
      // 둘째 탭에서 로그아웃하고 다른 계정으로 들어간다
      const b = await openSession(browser, build, { preset: 'funded', width: 390, context: a.context });
      await b.goto('/account'); await b.wait('.v-main .v-rows'); await b.page.getByText('로그아웃', { exact: true }).first().click(); await b.wait(SEL.alert); await b.confirm(); await b.page.waitForTimeout(1200);
      r.tab2AfterLogout = { url: b.page.url().replace(/^.*voila-test-aresjoo/, ''), loginVisible: await b.has(SEL.login) };
      await a.page.bringToFront(); await a.page.waitForTimeout(1500); r.tab1AfterOtherLogout = await rows(a.page);
      await b.page.bringToFront();
      if (!(await b.has('.v-sheet input'))) { await b.click(SEL.login); await b.wait('.v-sheet input'); }
      await b.page.locator('.v-sheet input').first().fill('capture-b@example.invalid'); await b.page.locator('.v-sheet button[type="submit"]').click(); await b.wait('.v-sheet input[type="password"]');
      await b.page.locator('.v-sheet input[type="password"]').fill(credentials.password); await b.page.locator('.v-sheet button[type="submit"]').click(); await b.wait(SEL.balance, { timeout: 20000 }); await b.page.waitForTimeout(600);
      await b.goto('/wallet'); await b.wait('.v-main .v-title'); await b.settle({ quiet: 500 }); r.tab2AsB = await rows(b.page);
      await b.shot(`robust-switch-${build}-tab2-asB`);
      // 첫 탭은 새로 고치지 않았다
      await a.page.bringToFront(); await a.page.waitForTimeout(1500); r.tab1Stale = await rows(a.page);
      await a.shot(`robust-switch-${build}-tab1-stale`);
      await a.page.reload(); await a.wait('.v-main .v-title'); await a.settle({ quiet: 500 }); r.tab1Reloaded = await rows(a.page);
      const s = await a.storage();
      r.storedA = (s['voila.browser-wallet.capture-account']?.state?.transactions ?? []).map((x) => x.id);
      r.storedB = (s['voila.browser-wallet.capture-account-b']?.state?.transactions ?? []).map((x) => x.id);
      r.session = s['voila.browser-session.v1'];
      r.errors = [a.errors, b.errors];
      return r;
    });
    await a.close(); console.log('switch', build, '끝');
  }
}

// ── 6. 출금 입력 칸 ────────────────────────────────────────────────────────────
const ADDRESS = 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE';
if (ONLY.includes('wform')) {
  const AMOUNTS = ['', '0', '-5', 'abc', '1e3', '999999999999999', '10.005', '0.01', ' 50 ', '５０', '50,5', '1,000', '10000.01', '10000', '1e-7', '0x10', '+50', '50.', '9.99', '10', '00050', '.5e2'];
  out.wform = {};
  for (const currency of ['USDT', 'USD', 'KRW']) for (const build of builds(['orig', 'result'])) {
    const key = `${currency}|${build}`; out.wform[key] = {};
    const t = await openSession(browser, build, { preset: 'funded', width: 390, overrides: { 'gachaflix.currency': JSON.stringify({ state: { currency }, version: 0 }) } });
    for (const amount of AMOUNTS) {
      out.wform[key][JSON.stringify(amount)] = await safe('amount ' + amount, async () => {
        await t.goto('/wallet/withdraw'); await t.wait('.v-main .v-links .v-link'); await t.click('.v-main .v-links .v-link'); await t.wait('.v-main form input');
        const input = t.page.locator('.v-main form input').nth(1);
        await t.page.locator('.v-main form input').nth(0).fill(ADDRESS);
        await input.fill(amount).catch(async () => { await input.click(); await t.page.keyboard.type(amount); });
        const typed = await input.inputValue();
        await t.click('.v-main form button[type="submit"]'); await t.page.waitForTimeout(350);
        return t.page.evaluate((typed) => { const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim(); const inputs = Array.from(document.querySelectorAll('.v-main form input')); return { typed, kept: inputs[1]?.value ?? null, type: inputs[1]?.type, inputmode: inputs[1]?.getAttribute('inputmode'), lines: Array.from(document.querySelectorAll('.v-main .v-line')).map((l) => clean(l.innerText)), h1: clean(document.querySelector('.v-main h1')?.innerText), rows: Array.from(document.querySelectorAll('.v-main .v-row')).map((x) => clean(x.innerText)).slice(0, 8), buttons: Array.from(document.querySelectorAll('.v-main .v-btn')).map((x) => clean(x.innerText)), formInputs: inputs.length }; }, typed);
      });
    }
    out.wform[key].errors = t.errors;
    await t.close(); console.log('wform', key, '끝');
  }
}

// ── 7. 출금 신청과 취소, 저장 실패, 새로 고침과 뒤로 가기 ───────────────────────────────────
if (ONLY.includes('withdraw')) {
  out.withdraw = {};
  for (const build of builds(['orig', 'result'])) {
    const r = (out.withdraw[build] = {});
    const start = async (currency = 'USDT') => {
      const t = await openSession(browser, build, { preset: 'funded', width: 390, fixedClock: false, overrides: { 'gachaflix.currency': JSON.stringify({ state: { currency }, version: 0 }) } });
      const ledger = async () => { const s = await t.storage(); const w = s['voila.browser-wallet.capture-account']?.state ?? {}; const account = (s['voila.browser-accounts.v1'] ?? [])[0] ?? {}; return { crypto: w.cryptoBalance, balance: w.balance, txs: (w.transactions ?? []).map((x) => ({ type: x.type, amountUsdt: x.amountUsdt, status: x.status ?? null, requestedUsdt: x.requestedUsdt ?? null, feeUsdt: x.feeUsdt ?? null, netUsdt: x.netUsdt ?? null, network: x.network ?? null, hasServerId: !!x.serverId, accountId: x.accountId ?? null })), service: Object.values(account.withdrawals ?? {}).map((x) => x.status), code: account.challenge?.code ?? null }; };
      const toFinal = async (amount = '50') => {
        await t.goto('/wallet/withdraw'); await t.wait('.v-main .v-links .v-link'); await t.page.getByText('이메일 인증으로 출금', { exact: false }).click();
        await t.wait('form .v-input'); await t.page.locator('form .v-input').nth(0).fill(ADDRESS); await t.page.locator('form .v-input').nth(1).fill(amount);
        await t.page.locator('form button[type="submit"]').click();
        await t.page.getByRole('button', { name: '인증하고 출금' }).click();
        await t.page.getByRole('button', { name: '코드 보내기' }).click(); await t.wait('form .v-input');
        await t.page.locator('form .v-input').fill((await ledger()).code);
      };
      return { t, ledger, toFinal };
    };
    // 가: 보통의 길과 취소
    r.normal = await safe('normal', async () => {
      const { t, ledger, toFinal } = await start(); const o = {};
      try {
        await t.goto('/wallet'); await t.wait('.v-main .v-title'); o.before = await ledger(); await toFinal();
        await t.shot(`robust-withdraw-final-${build}`);
        await t.page.locator('form button[type="submit"]').click();
        await t.page.getByRole('heading', { name: '출금을 신청했습니다' }).waitFor({ timeout: 15000 });
        o.doneText = clean(await t.page.locator('.v-main').innerText()).slice(0, 300); o.afterRequest = await ledger();
        await t.page.getByRole('link', { name: '지갑으로' }).click(); await t.page.waitForURL(/\/wallet\/?$/, { timeout: 15000 }); await t.wait('.v-main .v-itemrow');
        o.walletRows = (await t.page.locator('.v-main .v-itemrow').allInnerTexts()).map(clean);
        await t.page.locator('.v-main .v-itemrow', { hasText: '출금' }).first().click(); await t.wait(SEL.sheet);
        o.sheet = clean(await t.page.locator(SEL.sheet).innerText());
        await t.page.locator('.v-sheet').getByRole('button', { name: '출금 취소' }).click(); await t.wait(SEL.alert);
        o.confirmText = clean(await t.page.locator(SEL.alert).innerText());
        // 확인창이 뜨자마자 누른 것(결과 빌드는 350ms 동안 버린다)
        await t.page.locator(SEL.alertOk).click(); await t.page.waitForTimeout(150); o.afterInstantPress = { alertOpen: await t.has(SEL.alert), ledgerStatus: (await ledger()).txs.find((x) => x.type === 'withdraw')?.status };
        if (await t.has(SEL.alert)) { await t.page.waitForTimeout(600); await t.page.locator(SEL.alertOk).click(); }
        await t.gone(SEL.alert); await t.page.waitForTimeout(500);
        o.afterCancel = await ledger(); o.rowsAfterCancel = (await t.page.locator('.v-main .v-itemrow').allInnerTexts()).map(clean);
        await t.page.reload(); await t.wait('.v-main .v-itemrow'); await t.page.waitForTimeout(600); o.afterReload = await ledger();
        o.errors = t.errors;
      } finally { await t.close(); }
      return o;
    });
    // 나: 마지막 단추를 누르는 순간 지갑 저장이 실패(용량 초과)
    r.quota = await safe('quota', async () => {
      const { t, ledger, toFinal } = await start(); const o = {};
      try {
        await toFinal();
        await t.page.evaluate(() => { const real = Storage.prototype.setItem; window.__realSet = real; window.__blocked = 0; Storage.prototype.setItem = function (key, value) { if (String(key).includes('browser-wallet') || String(key).endsWith('gachaflix.wallet')) { window.__blocked += 1; throw new DOMException('quota', 'QuotaExceededError'); } return real.call(this, key, value); }; });
        await t.page.locator('form button[type="submit"]').click(); await t.page.waitForTimeout(2500);
        o.screen = { h1: clean(await t.page.locator('.v-main h1, .v-main h2').first().innerText().catch(() => '')), lines: (await t.page.locator('.v-main .v-line').allInnerTexts()).map(clean), text: clean(await t.page.locator('.v-main').innerText()).slice(0, 260) };
        o.blockedWrites = await t.page.evaluate(() => window.__blocked);
        o.header = clean(await t.page.locator(SEL.balance).innerText().catch(() => ''));
        o.storedWhileBlocked = await ledger();
        await t.shot(`robust-withdraw-quota-${build}`);
        await t.page.evaluate(() => { Storage.prototype.setItem = window.__realSet; });
        await t.goto('/wallet'); await t.wait('.v-main .v-title'); await t.page.waitForTimeout(1200);
        o.afterReload = await ledger(); o.rows = (await t.page.locator('.v-main .v-itemrow').allInnerTexts()).map(clean); o.headerAfter = clean(await t.page.locator(SEL.balance).innerText().catch(() => ''));
        o.errors = t.errors;
      } finally { await t.close(); }
      return o;
    });
    // 다: 확인 단계에서 새로 고침, 코드 단계에서 뒤로 가기
    r.nav = await safe('nav', async () => {
      const { t, ledger, toFinal } = await start(); const o = {};
      try {
        await t.goto('/wallet'); await t.wait('.v-main .v-title');
        await toFinal();
        await t.page.reload(); await t.wait('.v-main'); await t.page.waitForTimeout(800);
        o.afterReload = { text: clean(await t.page.locator('.v-main').innerText()).slice(0, 160), ledger: await ledger() };
        await toFinal();
        await t.page.goBack().catch(() => {}); await t.page.waitForTimeout(800);
        o.afterBack = { url: t.page.url().replace(/^.*voila-test-aresjoo/, ''), text: clean(await t.page.locator('body').innerText()).slice(0, 120), ledger: await ledger().catch(() => '(읽지 못함)') };
        await t.page.goForward().catch(() => {}); await t.page.waitForTimeout(800);
        o.afterForward = { url: t.page.url().replace(/^.*voila-test-aresjoo/, ''), text: clean(await t.page.locator('.v-main').innerText().catch(() => '')).slice(0, 160) };
        o.errors = t.errors;
      } finally { await t.close(); }
      return o;
    });
    // 라: 마지막 단추를 빠르게 두 번 누른다(같은 접수가 두 번 생기지 않는가)
    r.double = await safe('double', async () => {
      const { t, ledger, toFinal } = await start('USDT'); const o = {};
      try {
        await toFinal();
        const btn = t.page.locator('form button[type="submit"]');
        await Promise.all([btn.click(), btn.click({ force: true, noWaitAfter: true }).catch(() => {})]); await btn.click({ force: true, timeout: 500 }).catch(() => {});
        await t.page.waitForTimeout(2500);
        o.text = clean(await t.page.locator('.v-main').innerText()).slice(0, 200); o.ledger = await ledger(); o.errors = t.errors;
      } finally { await t.close(); }
      return o;
    });
    console.log('withdraw', build, '끝');
  }
}

// ── 8. 지갑 내역 수백 줄 ───────────────────────────────────────────────────────
const manyRows = (bad) => (state) => patchLedger(state, (box) => {
  const base = Date.parse(state.user.createdAt);
  for (let i = 0; i < 600; i++) {
    const at = new Date(base - (i + 1) * 60000).toISOString();
    if (i % 12 === 0) box.wallet.transactions.push({ id: 'w-' + i, serverId: 'sw-' + i, accountId: state.user.id, type: 'withdraw', amountUsdt: -50, feeUsdt: 1, netUsdt: 49, at, status: 'COMPLETED', network: 'TRC20', address: 'T' + '1'.repeat(33), authMethod: '2FA_OTP' });
    else if (i % 2) box.wallet.transactions.push({ id: 'o-' + i, type: 'open', amountUsdt: -(1 + (i % 7)), ref: 'dollar-applex' + (1 + (i % 7)) + ':op_' + i, at });
    else box.wallet.transactions.push({ id: 's-' + i, type: 'sellback', amountUsdt: +(0.05 * (1 + (i % 9))).toFixed(2), ref: 'own-' + i, itemIds: ['own-' + i], at });
  }
  if (bad) box.wallet.transactions.push({ id: 'bad-1', type: 'open', amountUsdt: -1, ref: 'bad', at: 'not-a-date' }, { id: 'bad-2', type: 'sellback', ref: 'bad2', at: new Date(base).toISOString() }, { id: 'bad-3', type: 'mystery', amountUsdt: 1, ref: 'bad3', at: new Date(base).toISOString() });
});
if (ONLY.includes('volume')) {
  out.volume = {};
  for (const bad of [false, true]) for (const build of builds(['orig', 'result'])) {
    const key = `${bad ? 'malformed' : 'clean'}|${build}`;
    const t = await openSession(browser, build, { preset: 'funded', width: 390, mutate: manyRows(bad) });
    out.volume[key] = await safe(key, async () => {
      const r = {};
      const t0 = Date.now(); await t.goto('/wallet'); await t.wait('.v-main'); await t.settle({ quiet: 600 }); r.loadMs = Date.now() - t0;
      const facts = () => t.page.evaluate(() => ({ rows: document.querySelectorAll('.v-main .v-itemrow').length, dom: document.getElementsByTagName('*').length, h1: document.querySelector('.v-main h1')?.innerText ?? null, more: Array.from(document.querySelectorAll('.v-main .v-links .v-link')).map((x) => x.innerText), height: document.documentElement.scrollHeight, first: Array.from(document.querySelectorAll('.v-main .v-itemrow')).slice(0, 4).map((x) => x.innerText.replace(/\s+/g, ' ')), nextError: /Application error|문제가 생겼|오류가/.test(document.body.innerText), body: document.body.innerText.replace(/\s+/g, ' ').slice(0, 140) }));
      r.first = await facts(); r.heapFirst = await heapMetrics(t.page);
      await t.shot(`robust-volume-${key.replace('|', '-')}`);
      const clicks = [];
      for (let i = 0; i < 40; i++) { const more = t.page.locator('.v-main .v-links .v-link').filter({ hasText: /더|more|更多/ }).first(); if (!(await more.isVisible().catch(() => false))) break; const s = Date.now(); await more.click(); await t.page.waitForTimeout(80); clicks.push(Date.now() - s - 80); }
      r.clicks = clicks.length; r.clickMs = clicks; r.all = await facts(); r.heapAll = await heapMetrics(t.page);
      if (r.all.rows) { const s = Date.now(); await t.page.locator('.v-main .v-itemrow').nth(Math.min(r.all.rows - 1, 3)).click(); r.sheet = await t.wait(SEL.sheet).then(async () => ({ ms: Date.now() - s, text: clean(await t.page.locator(SEL.sheet).innerText()).slice(0, 200) }), () => null); }
      r.errors = t.errors;
      return r;
    });
    await t.close(); console.log('volume', key, '끝');
  }
}

await browser.close();
// 기존 결과에 이어 붙인다
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { OUT } from './lib.mjs';
let merged = {};
try { merged = JSON.parse(await readFile(path.join(OUT, 'robust.json'), 'utf8')); } catch { /* 처음 */ }
Object.assign(merged, out);
await saveJson('robust.json', merged);
// 짧은 견주기: 원본과 결과의 다른 칸
const cmp = {};
for (const [name, v] of Object.entries(out)) {
  if (v && v.orig && v.result) cmp[name] = deepDiff(v.orig, v.result, '', [], 60);
}
await saveJson('robust-diff-' + ONLY.join('_') + '.json', cmp);
console.log('끝', Object.keys(out).join(','));
