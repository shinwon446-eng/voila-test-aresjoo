// 접근성 회귀: 두 빌드의 접근성 트리(역할, 이름, 제목 차례, 랜드마크), 주 단추까지의 Tab 횟수, 시트를 닫은 뒤 초점이 돌아오는 자리.
//   node a11y.mjs [--only tree,tab,focus,more]
import { launch, openSession, saveJson, SEL } from './lib.mjs';

const argv = process.argv.slice(2);
const arg = (name, fallback) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : fallback; };
const ONLY = String(arg('only', 'tree,tab,focus,more')).split(',');
const PAGES = [
  { key: 'home', route: '', preset: 'guest', main: '.v-boxcard' },
  { key: 'box-watch-rolex', route: '/box/watch-rolex', preset: 'guest', main: '.v-openbar .v-btn' },
  { key: 'box-dollar-apple', route: '/box/dollar-apple', preset: 'guest', main: '.v-openbar .v-btn' },
  { key: 'box-funded', route: '/box/watch-rolex', preset: 'funded', main: '[data-open-primary]' },
  { key: 'wallet', route: '/wallet', preset: 'funded', main: '.v-main .v-btn, .v-main a.v-btn' },
  { key: 'account', route: '/account', preset: 'funded', main: '.v-main button, .v-main a' },
  { key: 'reviews', route: '/reviews', preset: 'guest', main: '.v-rv-btn, .v-rvcard-btn' },
  { key: 'reviews-box', route: '/reviews?box=dollar-apple', preset: 'guest', main: '.v-rv-btn, .v-rvcard-btn' },
];
const KEEP = new Set(['heading', 'banner', 'navigation', 'main', 'contentinfo', 'region', 'complementary', 'search', 'form', 'dialog', 'alertdialog', 'button', 'link', 'list', 'listitem', 'img', 'image', 'textbox', 'searchbox', 'group', 'status', 'alert', 'checkbox', 'switch', 'combobox', 'tab', 'tablist', 'article', 'figure', 'table', 'row', 'cell', 'paragraph', 'DisclosureTriangle', 'Section']);
const LAND = new Set(['banner', 'navigation', 'main', 'contentinfo', 'region', 'complementary', 'search', 'form']);

async function axTree(page) {
  const client = await page.context().newCDPSession(page);
  try {
    await client.send('Accessibility.enable');
    const { nodes } = await client.send('Accessibility.getFullAXTree');
    const byId = new Map(nodes.map((n) => [n.nodeId, n]));
    const out = [];
    const walk = (node, depth) => {
      const role = node.role?.value ?? ''; const name = node.name?.value ?? '';
      const shown = !node.ignored && role && !['generic', 'none', 'InlineTextBox', 'StaticText', 'LineBreak', 'RootWebArea', 'presentation'].includes(role);
      if (shown) { const level = node.properties?.find((p) => p.name === 'level')?.value?.value; out.push({ role, name: name.replace(/\s+/g, ' ').slice(0, 90), level: level ?? null, depth, nameLen: name.length }); }
      for (const id of node.childIds ?? []) { const child = byId.get(id); if (child) walk(child, depth + (shown ? 1 : 0)); }
    };
    const root = nodes.find((n) => !n.parentId) ?? nodes[0];
    walk(root, 0);
    return out;
  } finally { await client.detach().catch(() => {}); }
}
const describe = () => { const el = document.activeElement; if (!el || el === document.body) return { tag: 'body' }; const zone = !!el.closest('.v-boxlayout-reviews, .v-rvfeed, .v-rvgrid, .v-rvrow, .v-hscroll'); return { tag: el.tagName.toLowerCase(), cls: String(el.getAttribute('class') ?? '').split(/\s+/).slice(0, 2).join('.'), name: (el.getAttribute('aria-label') ?? el.innerText ?? '').replace(/\s+/g, ' ').slice(0, 50), zone, data: Array.from(el.attributes).filter((a) => a.name.startsWith('data-')).map((a) => a.name).join(' ') }; };

const browser = await launch();
const out = { tree: {}, tab: {}, focus: {}, more: {} };
try {
  for (const width of [390, 1440]) for (const pg of PAGES) for (const build of ['orig', 'result']) {
    const key = `${pg.key}@${width}`;
    if (ONLY.includes('tree') || ONLY.includes('tab')) {
      const t = await openSession(browser, build, { preset: pg.preset, width });
      try {
        await t.goto(pg.route); await t.wait('.v-main'); await t.settle({ quiet: 500 });
        if (ONLY.includes('tree')) {
          const tree = await axTree(t.page);
          const kept = tree.filter((n) => KEEP.has(n.role));
          const counts = {}; for (const n of tree) counts[n.role] = (counts[n.role] ?? 0) + 1;
          (out.tree[key] ??= {})[build] = {
            total: tree.length, counts,
            headings: tree.filter((n) => n.role === 'heading').map((n) => `h${n.level} ${n.name}`),
            landmarks: tree.filter((n) => LAND.has(n.role)).map((n) => `${n.role} "${n.name}"`),
            unnamed: kept.filter((n) => ['button', 'link', 'textbox', 'searchbox', 'checkbox', 'switch'].includes(n.role) && !n.name).length,
            imgsUnnamed: tree.filter((n) => ['img', 'image'].includes(n.role) && !n.name).length,
            longNames: tree.filter((n) => n.nameLen > 150).map((n) => `${n.role} (${n.nameLen}자) ${n.name.slice(0, 60)}`).slice(0, 8),
            outline: kept.map((n) => `${n.role}${n.level ? n.level : ''} "${n.name}"`),
            domHeadings: await t.page.evaluate(() => Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) => h.tagName.toLowerCase() + ' ' + h.innerText.replace(/\s+/g, ' ').slice(0, 60) + (h.className.includes('v-rv-sr') ? ' (낭독기 전용)' : ''))),
          };
        }
        if (ONLY.includes('tab')) {
          await t.page.evaluate(() => { window.scrollTo(0, 0); document.activeElement?.blur?.(); });
          const seq = []; let reached = null;
          for (let i = 1; i <= 90; i++) {
            await t.page.keyboard.press('Tab');
            const d = await t.page.evaluate(describe); const isMain = await t.page.evaluate((sel) => !!document.activeElement?.matches?.(sel), pg.main);
            seq.push(`${d.tag}.${d.cls ?? ''} ${d.zone ? '[후기 자리] ' : ''}${d.name ?? ''}`);
            if (isMain) { reached = i; break; }
          }
          (out.tab[key] ??= {})[build] = { tabsToMain: reached, inZone: seq.filter((s) => s.includes('[후기 자리]')).length, seq };
        }
      } catch (error) { (out.tree[key] ??= {})[build + 'Error'] = String(error.message).split('\n')[0]; } finally { await t.close(); }
    }
  }

  if (ONLY.includes('focus')) for (const width of [390, 1440]) for (const build of ['orig', 'result']) {
    const rec = (out.focus[`@${width}`] ??= {})[build] = [];
    /** 방아쇠에 초점을 주고 Enter 로 열고 닫는다. 닫는 방법마다 초점이 방아쇠로 돌아오는지 적는다 */
    const trial = async (t, name, triggerSel, { nth = 0, overlay = SEL.sheet, close = 'Escape' } = {}) => {
      const entry = { name, close };
      try {
        const trigger = t.page.locator(triggerSel).nth(nth);
        if (!(await trigger.isVisible().catch(() => false))) { entry.skipped = '방아쇠가 보이지 않음'; rec.push(entry); return; }
        await trigger.scrollIntoViewIfNeeded(); await trigger.focus();
        await t.page.evaluate(() => { window.__trigger = document.activeElement; });
        entry.trigger = (await t.page.evaluate(describe)).name;
        await t.page.keyboard.press('Enter');
        await t.page.locator(overlay).first().waitFor({ state: 'visible', timeout: 5000 });
        await t.page.waitForTimeout(450);
        entry.inside = await t.page.evaluate((sel) => { const o = document.querySelector(sel); const el = document.activeElement; return { focusInside: !!o && o.contains(el), on: el ? el.tagName.toLowerCase() + '.' + String(el.getAttribute('class') ?? '').split(/\s+/)[0] : null, role: o?.getAttribute('role') ?? o?.closest('[role]')?.getAttribute('role') ?? null, modal: o?.getAttribute('aria-modal') ?? o?.closest('[aria-modal]')?.getAttribute('aria-modal') ?? null, labelled: !!(o?.getAttribute('aria-labelledby') || o?.getAttribute('aria-label') || o?.closest('[aria-labelledby],[aria-label]')) }; }, overlay);
        // 초점 가두기: Tab 을 여러 번 눌러도 겹침 화면 밖으로 나가지 않는가
        let escaped = false;
        for (let i = 0; i < 12; i++) { await t.page.keyboard.press('Tab'); if (!(await t.page.evaluate((sel) => { const o = document.querySelector(sel); return !!o && (o.contains(document.activeElement) || o.parentElement?.contains(document.activeElement)); }, overlay))) { escaped = true; break; } }
        entry.trapped = !escaped;
        if (close === 'Escape') await t.page.keyboard.press('Escape'); else await t.page.locator(close).first().click();
        await t.page.locator(overlay).first().waitFor({ state: 'detached', timeout: 5000 });
        await t.page.waitForTimeout(300);
        entry.returned = await t.page.evaluate(() => document.activeElement === window.__trigger);
        entry.after = await t.page.evaluate(describe);
      } catch (error) { entry.error = String(error.message).split('\n')[0].slice(0, 160); await t.page.keyboard.press('Escape').catch(() => {}); await t.page.waitForTimeout(300); }
      rec.push(entry);
    };
    const run = async (preset, route, fn) => { const t = await openSession(browser, build, { preset, width }); try { await t.goto(route); await t.wait('.v-main'); await t.settle({ quiet: 500 }); await fn(t); } catch (error) { rec.push({ name: route, error: String(error.message).split('\n')[0].slice(0, 160) }); } finally { await t.close(); } };
    await run('guest', '/box/dollar-apple', async (t) => {
      await trial(t, 'box(dollar-apple) 상품 시트, Esc', '.v-main .v-item, .v-main .v-itemrows .v-itemrow');
      await trial(t, 'box(dollar-apple) 상품 시트, 닫기 단추', '.v-main .v-item, .v-main .v-itemrows .v-itemrow', { close: '.v-sheet-close' });
      await trial(t, 'box(dollar-apple) 후기 상세, Esc', '.v-rv-btn, .v-rvcard-btn');
      await trial(t, 'box(dollar-apple) 후기 상세, 닫기 단추', '.v-rv-btn, .v-rvcard-btn', { close: '.v-sheet-close' });
      await trial(t, 'box(dollar-apple) 후기 상세(셋째 건), Esc', '.v-rv-btn, .v-rvcard-btn', { nth: 2 });
      await trial(t, '머리줄 로그인 시트, Esc', SEL.login);
      if (width === 390) await trial(t, '메뉴, Esc', SEL.menu);
    });
    await run('guest', '/box/watch-rolex', async (t) => {
      await trial(t, 'box(watch-rolex) 상품 시트, Esc', '.v-main .v-item');
      await trial(t, 'box(watch-rolex) 후기 상세, Esc', '.v-rv-btn, .v-rvcard-btn');
    });
    await run('guest', '/reviews', async (t) => {
      await trial(t, 'reviews 후기 상세, Esc', '.v-rv-btn, .v-rvcard-btn');
      await trial(t, 'reviews 후기 상세, 닫기 단추', '.v-rv-btn, .v-rvcard-btn', { close: '.v-sheet-close' });
    });
    await run('funded', '/box/watch-rolex', async (t) => {
      await trial(t, 'box 열기 확인창, Esc', SEL.open, { overlay: SEL.alert });
      await trial(t, 'box 열기 확인창, 취소 링크', SEL.open, { overlay: SEL.alert, close: SEL.alertCancel });
      await trial(t, '머리줄 잔액 시트, Esc', SEL.balance);
    });
    await run('funded', '/wallet', async (t) => { await trial(t, 'wallet 내역 줄 시트, Esc', '.v-main .v-itemrow'); await trial(t, 'wallet 내역 줄 시트, 닫기 단추', '.v-main .v-itemrow', { close: '.v-sheet-close' }); });
    await run('funded', '/account', async (t) => {
      const n = await t.page.locator('.v-main button').count();
      for (let i = 0; i < Math.min(n, 8); i++) await trial(t, `account 단추 ${i}, Esc`, '.v-main button', { nth: i });
    });
    await run('inventory', '/inventory', async (t) => { await trial(t, 'inventory 상품 시트, Esc', '.v-main .v-itemrows .v-itemrow'); });
    console.log(`focus @${width} ${build}: ${rec.length}건`);
  }

  // 더 보기 단추: 누른 뒤의 초점, 끝까지 편 뒤의 초점(결과 빌드에만 있는 조작)
  if (ONLY.includes('more')) for (const [label, route] of [['box', '/box/dollar-apple'], ['reviews-box', '/reviews?box=dollar-apple']]) {
    const t = await openSession(browser, 'result', { preset: 'guest', width: 390 });
    try {
      await t.goto(route); await t.wait('.v-rv'); await t.settle({ quiet: 400 });
      const more = t.page.locator('[data-reviews-more]');
      await more.scrollIntoViewIfNeeded(); await more.focus();
      const before = await t.page.locator('.v-rv').count();
      await t.page.keyboard.press('Enter'); await t.page.waitForTimeout(300);
      const afterOne = { rows: await t.page.locator('.v-rv').count(), focus: await t.page.evaluate(describe), live: await t.page.evaluate(() => Array.from(document.querySelectorAll('[aria-live], [role="status"]')).map((e) => e.className + ':' + e.innerText.slice(0, 60))) };
      let clicks = 1;
      for (; clicks < 40; clicks++) { if (!(await more.isVisible().catch(() => false))) break; await t.page.keyboard.press('Enter'); await t.page.waitForTimeout(150); }
      out.more[label] = { before, afterOne, clicks, endRows: await t.page.locator('.v-rv').count(), total: await t.page.locator('.v-rv-total').innerText(), endFocus: await t.page.evaluate(describe), moreVisible: await more.isVisible().catch(() => false), scrollY: await t.page.evaluate(() => Math.round(scrollY)) };
    } catch (error) { out.more[label] = { error: String(error.message).split('\n')[0] }; } finally { await t.close(); }
  }
} finally { await browser.close(); }

// 견주기
const cmp = { tree: {}, tab: {}, focus: {} };
const multiset = (list) => list.reduce((m, s) => m.set(s, (m.get(s) ?? 0) + 1), new Map());
for (const [key, v] of Object.entries(out.tree)) {
  if (!v.orig || !v.result) { cmp.tree[key] = v; continue; }
  const ma = multiset(v.orig.outline), mb = multiset(v.result.outline);
  const onlyA = [], onlyB = [];
  for (const [s, n] of ma) { const d = n - (mb.get(s) ?? 0); if (d > 0) onlyA.push(d > 1 ? `${s} ×${d}` : s); }
  for (const [s, n] of mb) { const d = n - (ma.get(s) ?? 0); if (d > 0) onlyB.push(d > 1 ? `${s} ×${d}` : s); }
  const roles = new Set([...Object.keys(v.orig.counts), ...Object.keys(v.result.counts)]);
  const countDiff = {}; for (const r of roles) if ((v.orig.counts[r] ?? 0) !== (v.result.counts[r] ?? 0)) countDiff[r] = [v.orig.counts[r] ?? 0, v.result.counts[r] ?? 0];
  cmp.tree[key] = { total: [v.orig.total, v.result.total], countDiff, headingsSame: JSON.stringify(v.orig.headings) === JSON.stringify(v.result.headings), headings: JSON.stringify(v.orig.headings) === JSON.stringify(v.result.headings) ? v.orig.headings : { orig: v.orig.headings, result: v.result.headings }, landmarksSame: JSON.stringify(v.orig.landmarks) === JSON.stringify(v.result.landmarks), landmarks: v.result.landmarks, unnamed: [v.orig.unnamed, v.result.unnamed], imgsUnnamed: [v.orig.imgsUnnamed, v.result.imgsUnnamed], longNames: { orig: v.orig.longNames, result: v.result.longNames }, onlyOrig: onlyA.slice(0, 40), onlyResult: onlyB.slice(0, 40), onlyOrigN: onlyA.length, onlyResultN: onlyB.length };
}
for (const [key, v] of Object.entries(out.tab)) cmp.tab[key] = { tabsToMain: [v.orig?.tabsToMain, v.result?.tabsToMain], inZone: [v.orig?.inZone, v.result?.inZone], sameSeq: JSON.stringify(v.orig?.seq) === JSON.stringify(v.result?.seq) };
for (const [key, v] of Object.entries(out.focus)) cmp.focus[key] = (v.orig ?? []).map((a, i) => { const b = v.result?.[i] ?? {}; return { name: a.name, orig: a.skipped ?? a.error ?? { returned: a.returned, after: a.after?.tag + '.' + (a.after?.cls ?? ''), inside: a.inside?.focusInside, on: a.inside?.on, trapped: a.trapped, role: a.inside?.role, modal: a.inside?.modal, labelled: a.inside?.labelled }, result: b.skipped ?? b.error ?? { returned: b.returned, after: b.after?.tag + '.' + (b.after?.cls ?? ''), inside: b.inside?.focusInside, on: b.inside?.on, trapped: b.trapped, role: b.inside?.role, modal: b.inside?.modal, labelled: b.inside?.labelled } }; });
cmp.more = out.more;
await saveJson('a11y-raw.json', out);
await saveJson('a11y-compare.json', cmp);
console.log('끝');
