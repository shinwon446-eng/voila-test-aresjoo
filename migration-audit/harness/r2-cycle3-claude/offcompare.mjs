// 샘플을 끈 빌드(4177)와 원본(4175)을 화면마다 견준다. 후기 자리 밖은 구조, 글, 자리와 크기, 주요 계산 스타일이 같아야 한다.
//   node offcompare.mjs [--only 글자] [--a orig] [--b off] [--tag off]
// 화면 하나마다: (1) 후기 자리를 그대로 둔 채의 요소 서명 (2) 후기 자리를 감춘 뒤의 요소 서명과 화면 조각 네 장의 픽셀 차이.
// 결과: out/offcompare-<tag>.json (화면마다의 판정과 처음 다른 요소 몇 개), 다른 화면의 그림은 screenshots/r2-cycle3-claude/off/
import { createRequire } from 'node:module';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { launch, openSession, saveJson, OUT, SHOTS } from './lib.mjs';
import { FREEZE_CSS, harnessRoot } from '../lib/common.mjs';

const require = createRequire(path.join(harnessRoot, 'package.json'));
const pixelmatch = require('pixelmatch').default ?? require('pixelmatch');
const { PNG } = require('pngjs');
const argv = process.argv.slice(2);
const arg = (name, fallback) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : fallback; };
const A = arg('a', 'orig'), B = arg('b', 'off'), TAG = arg('tag', 'off'), ONLY = arg('only', null);
const shotDir = path.join(SHOTS, TAG); await mkdir(shotDir, { recursive: true });

const LEGACY = ['dollar-apple', 'dollar-galaxy', 'dollar-gaming', 'jackpot-car', 'jackpot-supercar', 'starter-audio', 'starter-camera', 'starter-macbook', 'starter-ps5', 'vault-gold', 'vault-handbag', 'vault-home', 'vault-pokemon', 'vault-submariner'];
const HOME12 = ['car-rolls-royce', 'watch-rolex', 'bag-hermes', 'jewelry-cartier', 'fashion-nike', 'mobile-apple', 'computer-apple', 'gaming-playstation', 'audio-sony', 'camera-canon', 'home-lg', 'pokemon-charizard'];
const LEGAL = ['terms', 'privacy', 'payments', 'withdrawals', 'refunds', 'policy', 'fairness', 'safety', 'community', 'cookies', 'complaints', 'business', 'faq'];
const PLAIN = ['', '/about', '/account', '/community', '/community/board', '/dev/gallery', '/fairness', '/guide', '/inventory', '/legal', ...LEGAL.map((d) => '/legal/' + d), '/profile', '/reviews', '/reviews?box=dollar-apple', '/reviews?box=watch-rolex', '/verify', '/wallet', '/wallet/withdraw', '/wins', '/no-such-page'];
const items = [];
for (const locale of ['ko', 'en', 'zh']) for (const width of [390, 1440]) {
  for (const route of PLAIN) items.push({ route, locale, width, preset: 'guest' });
  for (const slug of [...(locale === 'ko' ? HOME12 : HOME12.slice(1, 4).concat('pokemon-charizard')), ...LEGACY]) items.push({ route: '/box/' + slug, locale, width, preset: 'guest' });
}
// 로그인 상태(프리셋)의 화면
const STATE = [
  ['funded', ['', '/account', '/box/gaming-playstation', '/box/dollar-apple', '/inventory', '/wallet', '/wallet/withdraw', '/wins', '/verify', '/reviews', '/profile']],
  ['inventory', ['/inventory', '/wallet', '/wins', '/account', '/box/dollar-apple', '/verify']],
  ['pending', ['/wallet', '/wallet/withdraw']], ['shipping', ['/inventory']], ['zero', ['/box/gaming-playstation', '/wallet']], ['security', ['/account', '/wallet/withdraw']], ['firstVisit', ['', '/box/pokemon-charizard']],
];
for (const [preset, routes] of STATE) for (const locale of ['ko', 'en']) for (const width of [390, 1440]) for (const route of routes) items.push({ route, locale, width, preset });
for (const it of items) it.id = `${it.preset}__${it.locale}-${it.width}__${it.route.replace(/[/?=]+/g, '_') || '_home'}`;
const FILTER = arg('filter', null);
const todo = FILTER ? items.filter((it) => new RegExp(FILTER).test(it.id)) : ONLY ? items.filter((it) => it.id.includes(ONLY)) : items;

/** 브라우저 안에서 도는 서명 모으기 */
function collect({ hide }) {
  const RZ = '.v-boxlayout-reviews, .v-ratinglink, .v-boxcard-rating, .v-rating, .v-rvsum, .v-rvfeed, .v-rvgrid, .v-rvcard, .v-rv';
  const isReviews = /\/reviews\/?$/.test(location.pathname);
  const roots = Array.from(document.querySelectorAll(isReviews ? '.v-main' : RZ)).filter((el) => !el.parentElement.closest(isReviews ? '.v-main' : RZ));
  const zone = roots.map((el) => ({ cls: String(el.getAttribute('class') ?? '').split(/\s+/)[0], h: Math.round(el.getBoundingClientRect().height), text: el.innerText.replace(/\s+/g, ' ').trim().slice(0, 3000), els: el.getElementsByTagName('*').length, imgs: el.querySelectorAll('img').length }));
  if (hide) for (const el of roots) el.style.setProperty('display', 'none', 'important');
  const skip = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 'TEMPLATE', 'NEXT-ROUTE-ANNOUNCER', 'HEAD', 'TITLE']);
  const ATTRS = ['href', 'src', 'alt', 'aria-label', 'aria-pressed', 'aria-expanded', 'aria-hidden', 'aria-current', 'aria-haspopup', 'aria-labelledby', 'aria-describedby', 'aria-live', 'aria-modal', 'aria-checked', 'aria-selected', 'role', 'type', 'placeholder', 'id', 'for', 'tabindex', 'lang', 'hreflang', 'target', 'rel', 'loading', 'name', 'inputmode', 'autocomplete', 'maxlength', 'open'];
  const r2 = (n) => Math.round(n * 2) / 2;
  const out = [];
  const walk = (el, depth) => {
    if (skip.has(el.tagName)) return;
    if (!hide ? false : roots.includes(el)) return;
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    let text = '';
    for (const node of el.childNodes) if (node.nodeType === 3) { const t = node.textContent.replace(/\s+/g, ' ').trim(); if (t) text += (text ? ' ' : '') + t; }
    const attrs = {};
    for (const name of ATTRS) { const v = el.getAttribute(name); if (v !== null) attrs[name] = name === 'src' || name === 'href' ? v.replace(/_next\/static\/[^"']+/, '_next/static/(해시)') : v; }
    for (const a of el.attributes) if (a.name.startsWith('data-') && a.name !== 'data-nimg') attrs[a.name] = a.value;
    if (el.disabled) attrs.disabled = '1';
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') attrs.value = el.type === 'password' ? '(가림)' : el.value;
    out.push({ d: depth, t: el.tagName.toLowerCase(), c: String(el.getAttribute('class') ?? ''), x: text, a: attrs,
      r: cs.display === 'none' ? null : [r2(rect.left + scrollX), r2(rect.top + scrollY), r2(rect.width), r2(rect.height)],
      s: [cs.display, cs.visibility, cs.color, cs.backgroundColor, cs.fontSize, cs.fontWeight, cs.lineHeight, cs.fontFamily.slice(0, 40), cs.opacity, cs.borderTopLeftRadius, cs.borderTopWidth + ' ' + cs.borderTopColor, cs.paddingTop + ' ' + cs.paddingRight + ' ' + cs.paddingBottom + ' ' + cs.paddingLeft, cs.textAlign, cs.position].join('|') });
    if (el.tagName === 'svg' || el.tagName === 'SVG') return;
    for (const child of el.children) walk(child, depth + 1);
  };
  walk(document.body, 0);
  const head = { title: document.title, lang: document.documentElement.lang, metas: Array.from(document.head.querySelectorAll('meta[name], meta[property]')).map((m) => (m.getAttribute('name') ?? m.getAttribute('property')) + '=' + m.getAttribute('content')).sort(), links: Array.from(document.head.querySelectorAll('link[rel="canonical"], link[rel="alternate"], link[rel="icon"]')).map((l) => l.rel + ' ' + (l.hreflang ?? '') + ' ' + l.getAttribute('href')).sort() };
  return { zone, out, head, doc: [document.documentElement.scrollWidth, document.documentElement.scrollHeight], url: location.pathname + location.search };
}

const sig = (e) => JSON.stringify([e.d, e.t, e.c, e.x, e.a, e.r, e.s]);
function compareLists(a, b, max = 6) {
  const diffs = []; let same = 0;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n && diffs.length < max; i++) {
    const ea = a[i], eb = b[i];
    if (ea && eb && sig(ea) === sig(eb)) { same++; continue; }
    const which = !ea || !eb ? 'missing' : ea.t !== eb.t || ea.c !== eb.c || ea.d !== eb.d ? 'structure' : ea.x !== eb.x ? 'text' : JSON.stringify(ea.a) !== JSON.stringify(eb.a) ? 'attr' : JSON.stringify(ea.r) !== JSON.stringify(eb.r) ? 'rect' : 'style';
    diffs.push({ i, which, a: ea ? { t: ea.t, c: ea.c, x: ea.x.slice(0, 80), a: ea.a, r: ea.r, s: which === 'style' ? ea.s : undefined } : null, b: eb ? { t: eb.t, c: eb.c, x: eb.x.slice(0, 80), a: eb.a, r: eb.r, s: which === 'style' ? eb.s : undefined } : null });
    if (which === 'structure' || which === 'missing') break; // 그 뒤는 줄이 어긋나 뜻이 없다
  }
  // 종류별로 몇 개가 다른지(줄이 맞을 때만 센다)
  const kinds = {};
  if (a.length === b.length) for (let i = 0; i < n; i++) { const ea = a[i], eb = b[i]; if (sig(ea) === sig(eb)) continue; const k = ea.t !== eb.t || ea.c !== eb.c ? 'structure' : ea.x !== eb.x ? 'text' : JSON.stringify(ea.a) !== JSON.stringify(eb.a) ? 'attr' : JSON.stringify(ea.r) !== JSON.stringify(eb.r) ? 'rect' : 'style'; kinds[k] = (kinds[k] ?? 0) + 1; }
  return { equal: a.length === b.length && diffs.length === 0, lenA: a.length, lenB: b.length, kinds, diffs };
}

async function capture(browser, build, it) {
  const t = await openSession(browser, build, { preset: it.preset, locale: it.locale, width: it.width });
  try {
    const response = await t.goto(it.route);
    await t.settle({ fullImages: true, repaintImages: true, timeout: 15000, quiet: 250 });
    await t.page.addStyleTag({ content: FREEZE_CSS });
    await t.page.waitForTimeout(150);
    const full = await t.page.evaluate(collect, { hide: false });
    const hidden = await t.page.evaluate(collect, { hide: true });
    await t.page.waitForTimeout(80);
    const vh = t.page.viewportSize().height;
    const max = Math.max(0, hidden.doc[1] - vh);
    const tiles = [];
    for (const f of [0, 0.34, 0.67, 1]) { await t.page.evaluate((y) => window.scrollTo(0, y), Math.round(max * f)); await t.page.waitForTimeout(120); tiles.push(await t.page.screenshot({ animations: 'disabled', caret: 'hide', timeout: 20000 })); if (max === 0) break; }
    return { status: response?.status() ?? null, full, hidden, tiles, errors: t.errors, blocked: t.blocked.map((b) => b.method + ' ' + b.url) };
  } finally { await t.close(); }
}

const browser = await launch();
let results = [];
const file = path.join(OUT, `offcompare-${TAG}.json`);
if (ONLY || FILTER) { try { results = JSON.parse(await readFile(file, 'utf8')).results.filter((r) => !todo.some((it) => it.id === r.id)); } catch { /* 처음 */ } }
let n = 0;
try {
  for (const it of todo) {
    n++;
    const rec = { id: it.id, ...it };
    try {
      const [a, b] = await Promise.all([capture(browser, A, it), capture(browser, B, it)]);
      rec.status = [a.status, b.status];
      rec.zoneA = a.full.zone.map((z) => ({ cls: z.cls, h: z.h, els: z.els, imgs: z.imgs, text: z.text.slice(0, 160) }));
      rec.zoneB = b.full.zone.map((z) => ({ cls: z.cls, h: z.h, els: z.els, imgs: z.imgs, text: z.text.slice(0, 160) }));
      rec.zoneSame = JSON.stringify(a.full.zone) === JSON.stringify(b.full.zone);
      rec.head = JSON.stringify(a.full.head) === JSON.stringify(b.full.head) ? 'same' : { a: a.full.head, b: b.full.head };
      rec.full = compareLists(a.full.out, b.full.out);
      rec.outside = compareLists(a.hidden.out, b.hidden.out);
      rec.docFull = [a.full.doc, b.full.doc]; rec.docOutside = [a.hidden.doc, b.hidden.doc];
      rec.errors = JSON.stringify(a.errors) === JSON.stringify(b.errors) ? (a.errors.length ? { both: a.errors } : 'none') : { a: a.errors, b: b.errors };
      rec.blocked = JSON.stringify(a.blocked) === JSON.stringify(b.blocked) ? a.blocked.length : { a: a.blocked, b: b.blocked };
      rec.pixels = [];
      for (let i = 0; i < Math.min(a.tiles.length, b.tiles.length); i++) {
        const pa = PNG.sync.read(a.tiles[i]), pb = PNG.sync.read(b.tiles[i]);
        if (pa.width !== pb.width || pa.height !== pb.height) { rec.pixels.push({ tile: i, size: 'differs' }); continue; }
        const diff = new PNG({ width: pa.width, height: pa.height });
        const solid = pixelmatch(pa.data, pb.data, diff.data, pa.width, pa.height, { threshold: 0.1, includeAA: false });
        rec.pixels.push({ tile: i, solid, ratio: +(solid / (pa.width * pa.height)).toFixed(6) });
        if (solid / (pa.width * pa.height) > 0.0001 || !rec.outside.equal) { await writeFile(path.join(shotDir, `${it.id}__t${i}-${A}.png`), a.tiles[i]); await writeFile(path.join(shotDir, `${it.id}__t${i}-${B}.png`), b.tiles[i]); if (solid) await writeFile(path.join(shotDir, `${it.id}__t${i}-diff.png`), PNG.sync.write(diff)); }
      }
      rec.verdict = rec.full.equal && rec.zoneSame ? 'identical' : rec.outside.equal ? 'zone-only' : 'DIFFERS-OUTSIDE';
      if (rec.verdict !== 'DIFFERS-OUTSIDE' && rec.pixels.some((p) => p.size || p.ratio > 0.0001)) rec.verdict += '+pixels';
      if (rec.head !== 'same') rec.verdict += '+head';
    } catch (error) { rec.verdict = 'ERROR'; rec.error = String(error.message).split('\n')[0].slice(0, 300); }
    results.push(rec);
    console.log(`${n}/${todo.length} ${rec.id}: ${rec.verdict}${rec.outside && !rec.outside.equal ? ' ' + JSON.stringify(rec.outside.kinds) + ' ' + rec.outside.lenA + '/' + rec.outside.lenB : ''}`);
    if (n % 20 === 0) await saveJson(`offcompare-${TAG}.json`, { a: A, b: B, results });
  }
} finally { await browser.close(); }
const tally = {};
for (const r of results) tally[r.verdict] = (tally[r.verdict] ?? 0) + 1;
await saveJson(`offcompare-${TAG}.json`, { a: A, b: B, total: results.length, tally, results });
console.log('끝', JSON.stringify(tally));
