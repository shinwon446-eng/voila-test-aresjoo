/**
 * 3차 검수(Claude)의 공용 도구. 기존 도구(lib/common.mjs, lib/observe.mjs, web/scripts/capture/states.mjs)를 그대로 불러 쓴다.
 * 두 빌드(원본 4175, 결과 4176)에 같은 상태를 심고 같은 조작을 한 뒤, 보이는 것과 저장된 것을 견준다.
 * web/ 을 고치지 않는다. 이 사이트의 기준 경로 아래 GET 말고는 어떤 요청도 나가지 않는다(guardNetwork).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIXED_TIME, FAIR, tickClock, launch, newContext, guardNetwork, makeFixedState, installState, parseBase, routeUrl, readStorage, patchLedger, loadStates } from '../lib/common.mjs';
import { observeInPage, summarizeStorage } from '../lib/observe.mjs';

export { FIXED_TIME, FAIR, tickClock, launch, patchLedger, loadStates };
export const here = path.dirname(fileURLToPath(import.meta.url));
export const OUT = path.join(here, 'out');
export const SHOTS = path.resolve(here, '../../screenshots/cycle3-claude');
export const BUILDS = { orig: 'http://127.0.0.1:4175/voila-test-aresjoo', result: 'http://127.0.0.1:4176/voila-test-aresjoo' };

export const SEL = {
  login: '.v-header .v-headbtn:not(.v-menu-btn):not([data-balance-open])', balance: '[data-balance-open]', menu: '.v-menu-btn',
  sheet: '.v-sheet', dialog: '[role="dialog"]', alert: '[role="alertdialog"]', alertOk: '[role="alertdialog"] .v-btn', alertCancel: '[role="alertdialog"] .v-links .v-link',
  qty: '.v-openbar .v-chip', open: '[data-open-primary]', opSettled: '.v-op[data-opening-state="settled"]', revealArmed: '.v-reveal-actions .v-btn:not([disabled])',
};

/**
 * 한 빌드에 세션 하나를 연다.
 *   clock: 'fixed'(기본. 페이지의 Date 를 FIXED_TIME 에 세운다) 또는 'real'(실제 시계. 확인창 잠금을 실제 시간으로 볼 때)
 *   mutate: (state) => void. 심기 전에 프리셋을 고친다
 */
export async function open(browser, build, { preset = 'funded', locale = 'ko', width = 390, motion = 'reduce', clock = 'fixed', mutate, shotDir } = {}) {
  const target = parseBase(BUILDS[build]);
  const context = await newContext(browser, { width, locale, reducedMotion: motion });
  const blocked = [], errors = [];
  await guardNetwork(context, target, blocked);
  const state = await makeFixedState(preset, locale);
  if (mutate) await mutate(state);
  await installState(context, state, target.origin);
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  if (clock === 'fixed') await page.clock.setFixedTime(new Date(FIXED_TIME));
  const hook = (p) => {
    p.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text().split(target.base).join('').split('\n')[0].slice(0, 300)); });
    p.on('pageerror', (error) => errors.push('pageerror: ' + String(error.message).slice(0, 300)));
    p.on('dialog', (dialog) => { errors.push('dialog: ' + dialog.message().slice(0, 200)); void dialog.dismiss(); });
  };
  hook(page);
  const dir = shotDir ? path.join(SHOTS, shotDir) : null;
  if (dir) await mkdir(dir, { recursive: true });
  const t = {
    build, page, context, state, target, blocked, errors, locale, width, hook,
    url: (route, loc = locale) => routeUrl(target.base, loc, route),
    goto: async (route, loc = locale) => { const r = await page.goto(routeUrl(target.base, loc, route), { waitUntil: 'domcontentloaded', timeout: 45000 }); return r?.status() ?? null; },
    wait: (sel, options = {}) => page.locator(sel).first().waitFor({ state: 'visible', timeout: 12000, ...options }),
    gone: (sel) => page.locator(sel).first().waitFor({ state: 'detached', timeout: 12000 }),
    has: (sel) => page.locator(sel).first().isVisible().catch(() => false),
    click: (sel, nth = 0) => page.locator(sel).nth(nth).click(),
    /** 확인창의 확정 단추: 고정 시계에서는 시계를 1초 옮긴 뒤 누른다(두 빌드에 똑같이). 실제 시계에서는 450ms 기다린 뒤 누른다 */
    confirm: async () => { await page.locator(SEL.alert).first().waitFor({ state: 'visible' }); await page.waitForTimeout(450); if (clock === 'fixed') await tickClock(page); await page.locator(SEL.alertOk).first().click(); },
    fill: (sel, value, nth = 0) => page.locator(sel).nth(nth).fill(value),
    pause: (ms) => page.waitForTimeout(ms),
    idle: async (ms = 250) => { try { await page.waitForLoadState('networkidle', { timeout: 4000 }); } catch { /* 그대로 간다 */ } await page.waitForTimeout(ms); },
    obs: () => page.evaluate(observeInPage, target.basePath),
    store: async () => summarizeStorage(await readStorage(page, state.prefix)),
    raw: () => readStorage(page, state.prefix),
    shot: async (name) => { if (!dir) return null; const file = path.join(dir, `${build}-${name}.png`); await page.screenshot({ path: file, animations: 'disabled', caret: 'hide', timeout: 15000 }).catch(() => {}); return path.relative(path.resolve(here, '../..'), file).replace(/\\/g, '/'); },
    close: () => context.close().catch(() => {}),
  };
  return t;
}

// ── 견주기 ───────────────────────────────────────────────────────────────────
const ID = /\b([a-z]{1,12})_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b|\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g;
/** 무작위 번호를 처음 나온 순서의 자리표로 바꾼다(flows-compare.mjs 와 같은 규칙) */
export function normalize(value) {
  const seen = new Map(), counters = {};
  return JSON.parse(JSON.stringify(value ?? null).replace(ID, (match, prefix) => {
    if (!seen.has(match)) { const kind = prefix ?? 'uuid'; counters[kind] = (counters[kind] ?? 0) + 1; seen.set(match, `${kind}_#${counters[kind]}`); }
    return seen.get(match);
  }));
}
export function diffPaths(a, b, base = '', out = [], limit = 300) {
  if (out.length >= limit || a === b) return out;
  const ta = Array.isArray(a) ? 'array' : a === null ? 'null' : typeof a, tb = Array.isArray(b) ? 'array' : b === null ? 'null' : typeof b;
  if (ta !== tb || (ta !== 'object' && ta !== 'array')) { out.push({ path: base, orig: a, result: b }); return out; }
  if (ta === 'array') {
    if (a.length !== b.length) out.push({ path: base + '.length', orig: a.length, result: b.length });
    for (let i = 0; i < Math.min(a.length, b.length); i++) diffPaths(a[i], b[i], `${base}[${i}]`, out, limit);
    return out;
  }
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) diffPaths(a[key], b[key], base ? `${base}.${key}` : key, out, limit);
  return out;
}
/** 관찰값에서 후기 자리(의도된 차이)를 떼어 낸 것 */
export const outsideReviews = (o) => { if (!o) return o; const { reviewZone, ...rest } = o; return rest; };

/**
 * 같은 시나리오를 두 빌드에 돌리고 단계마다 견준다. run(t, step) 안에서 step(name, fn) 을 부른다.
 * 단계마다 observed(후기 자리 밖), reviewZone, storage, console 을 적는다.
 * 돌려주는 값: { name, options, steps: [{ name, diffs: [...] }], errors }
 */
export async function both(browser, name, options, run, { parallel = true } = {}) {
  const one = async (build) => {
    const record = { build, steps: [], error: null };
    const t = await open(browser, build, { ...options, shotDir: options.shotDir ?? name });
    let cursor = 0;
    const step = async (stepName, fn, { shot = false } = {}) => {
      const entry = { name: stepName };
      try { await fn(); await t.idle(); }
      catch (error) { entry.error = String(error.message).split('\n')[0].slice(0, 300); }
      try { const o = await t.obs(); entry.observed = outsideReviews(o); entry.reviewZone = o.reviewZone; } catch (error) { entry.observed = { unreadable: String(error.message).split('\n')[0].slice(0, 160) }; }
      try { entry.storage = await t.store(); } catch (error) { entry.storage = { unreadable: String(error.message).split('\n')[0].slice(0, 160) }; }
      entry.console = t.errors.slice(cursor).map((x) => x.replace(/(status of \d+) \([^)]*\)/, '$1').replace(/\/_next\/static\/chunks\/[^\s:)'"]+/g, '/_next/static/chunks/*')).sort(); cursor = t.errors.length;
      if (shot || entry.error) entry.shot = await t.shot(`${String(record.steps.length + 1).padStart(2, '0')}-${stepName.replace(/[\\/:*?"<>|\s(),]+/g, '-')}`);
      record.steps.push(entry);
      return entry;
    };
    try { await run(t, step); } catch (error) { record.error = String(error.message).split('\n')[0].slice(0, 300); await t.shot('error'); }
    finally { record.blocked = t.blocked.map((b) => `${b.method} ${b.url}`); await t.close(); }
    return record;
  };
  const [o, r] = parallel ? await Promise.all([one('orig'), one('result')]) : [await one('orig'), await one('result')];
  const A = normalize(o), B = normalize(r);
  const steps = [];
  for (let i = 0; i < Math.max(A.steps.length, B.steps.length); i++) {
    const sa = A.steps[i], sb = B.steps[i];
    const diffs = [];
    if (!sa || !sb) { steps.push({ name: sa?.name ?? sb?.name, onlyOne: sa ? 'orig' : 'result' }); continue; }
    diffPaths(sa.observed, sb.observed, 'observed', diffs);
    diffPaths(sa.storage, sb.storage, 'storage', diffs);
    diffPaths(sa.console, sb.console, 'console', diffs);
    if ((sa.error ?? null) !== (sb.error ?? null)) diffs.push({ path: 'error', orig: sa.error ?? null, result: sb.error ?? null });
    steps.push({ name: sa.name, error: sa.error ?? sb.error ?? undefined, diffs, reviewZone: { orig: sa.reviewZone ? { roots: sa.reviewZone.roots, cards: sa.reviewZone.cards, textLength: sa.reviewZone.textLength } : null, result: sb.reviewZone ? { roots: sb.reviewZone.roots, cards: sb.reviewZone.cards, textLength: sb.reviewZone.textLength } : null }, shots: [o.steps[i]?.shot, r.steps[i]?.shot].filter(Boolean) });
  }
  return { name, options: { ...options, mutate: options.mutate ? '(있음)' : undefined }, steps, runError: { orig: o.error, result: r.error }, blockedDiff: diffPaths(A.blocked, B.blocked, 'blocked'), raw: { orig: o, result: r } };
}

export async function save(name, data) {
  await mkdir(OUT, { recursive: true });
  const file = path.join(OUT, name);
  await writeFile(file, typeof data === 'string' ? data : JSON.stringify(data, null, 1));
  return file;
}
/** 결과를 짧게 찍는다: 단계마다 다른 칸의 수와 앞의 몇 개 */
export function report(result, { max = 6 } = {}) {
  const lines = [`## ${result.name} ${JSON.stringify(result.options)}`];
  if (result.runError.orig || result.runError.result) lines.push(`  멈춤: orig=${result.runError.orig} result=${result.runError.result}`);
  for (const s of result.steps) {
    if (s.onlyOne) { lines.push(`  [한쪽만 ${s.onlyOne}] ${s.name}`); continue; }
    lines.push(`  ${s.diffs.length ? 'DIFF ' + s.diffs.length : 'same'}  ${s.name}${s.error ? '  (오류: ' + s.error + ')' : ''}`);
    for (const d of s.diffs.slice(0, max)) lines.push(`      ${d.path}: ${JSON.stringify(d.orig)?.slice(0, 160)} => ${JSON.stringify(d.result)?.slice(0, 160)}`);
  }
  return lines.join('\n');
}
