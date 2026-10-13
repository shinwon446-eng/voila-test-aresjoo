/**
 * 2차 라운드 3번 사이클(Claude)의 공통 도구. 기존 도구(../lib/common.mjs)와 프리셋(web/scripts/capture/states.mjs)을 그대로 쓴다.
 * web/ 은 읽기만 한다. 결과는 이 폴더의 out/ 과 screenshots/r2-cycle3-claude/ 에 쓴다.
 */
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { FIXED_TIME, launch, newContext, guardNetwork, makeFixedState, installState, parseBase, routeUrl, readStorage, tickClock, settle, patchLedger } from '../lib/common.mjs';

export { FIXED_TIME, launch, readStorage, tickClock, settle, patchLedger, routeUrl, parseBase };

export const HERE = fileURLToPath(new URL('./', import.meta.url));
export const OUT = path.join(HERE, 'out');
export const SHOTS = path.resolve(HERE, '../../screenshots/r2-cycle3-claude');
export const BUILDS = {
  orig: 'http://127.0.0.1:4175/voila-test-aresjoo',
  result: 'http://127.0.0.1:4176/voila-test-aresjoo',
  off: 'http://127.0.0.1:4177/voila-test-aresjoo',
};
export const SEL = {
  login: '.v-header .v-headbtn:not(.v-menu-btn):not([data-balance-open])', balance: '[data-balance-open]', menu: '.v-menu-btn',
  sheet: '.v-sheet', alert: '[role="alertdialog"]', alertOk: '[role="alertdialog"] .v-btn', alertCancel: '[role="alertdialog"] .v-links .v-link',
  qty: '.v-openbar .v-chip', open: '[data-open-primary]', search: '.v-search input',
  opSettled: '.v-op[data-opening-state="settled"]', revealArmed: '.v-reveal-actions .v-btn:not([disabled])',
};

export async function ensureDirs() { await mkdir(OUT, { recursive: true }); await mkdir(SHOTS, { recursive: true }); }
export async function saveJson(name, data) { await ensureDirs(); const file = path.join(OUT, name); await writeFile(file, JSON.stringify(data, null, 1)); return file; }

/**
 * 한 빌드에 세션 하나를 연다.
 *   fixedClock: true 면 FIXED_TIME 에 시계를 세운다(타이머는 흐른다). false 면 실제 시계.
 *   mutate(state): 프리셋 위에 덧입히는 함수(저장 전).
 */
export async function openSession(browser, build, { preset = 'guest', locale = 'ko', width = 390, reducedMotion = 'reduce', fixedClock = true, overrides = {}, mutate = null, context: shared = null, extra = {} } = {}) {
  const baseUrl = BUILDS[build] ?? build;
  const target = parseBase(baseUrl);
  const context = shared ?? await newContext(browser, { width, locale, reducedMotion, extra });
  const blocked = [];
  const state = await makeFixedState(preset, locale, overrides);
  if (mutate) await mutate(state);
  if (!shared) { await guardNetwork(context, target, blocked); await installState(context, state, target.origin); }
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  if (fixedClock) await page.clock.setFixedTime(new Date(FIXED_TIME));
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text().split(target.base).join('').slice(0, 300)); });
  page.on('pageerror', (error) => errors.push('pageerror: ' + String(error.message).slice(0, 300)));
  page.on('dialog', (dialog) => { errors.push('dialog: ' + dialog.message().slice(0, 200)); void dialog.dismiss(); });
  const url = (route, loc = locale) => routeUrl(target.base, loc, route);
  const t = {
    build, target, context, page, state, errors, blocked, url, fixedClock,
    goto: async (route, loc = locale, options = {}) => page.goto(url(route, loc), { waitUntil: 'domcontentloaded', timeout: 45000, ...options }),
    storage: () => readStorage(page, state.prefix),
    wait: (sel, options = {}) => page.locator(sel).first().waitFor({ state: 'visible', timeout: 15000, ...options }),
    gone: (sel, options = {}) => page.locator(sel).first().waitFor({ state: 'detached', timeout: 15000, ...options }),
    has: (sel) => page.locator(sel).first().isVisible().catch(() => false),
    click: (sel, nth = 0) => page.locator(sel).nth(nth).click(),
    /** 확인창의 확정 단추: 결과 빌드의 350ms 잠금 때문에 두 빌드에서 똑같이 기다리고(실제 시계 600ms) 고정 시계면 1초 옮긴 뒤 누른다 */
    confirm: async () => { await page.locator(SEL.alertOk).first().waitFor({ state: 'visible' }); if (fixedClock) { await page.waitForTimeout(400); await tickClock(page); } else await page.waitForTimeout(600); await page.locator(SEL.alertOk).first().click(); },
    tick: (ms = 1000) => (fixedClock ? tickClock(page, ms) : Promise.resolve()),
    settle: (options = {}) => settle(page, { fullImages: false, timeout: 8000, quiet: 150, ...options }),
    shot: async (name, options = {}) => { await ensureDirs(); const file = path.join(SHOTS, name + '.png'); await page.screenshot({ path: file, animations: 'disabled', caret: 'hide', timeout: 20000, ...options }).catch((e) => errors.push('shot: ' + String(e.message).split('\n')[0])); return file; },
    close: () => context.close().catch(() => {}),
  };
  return t;
}

/** CDP 로 재는 것: 힙, DOM 노드 수, 리스너 수. gc 를 먼저 돌린다 */
export async function heapMetrics(page) {
  const client = await page.context().newCDPSession(page);
  try {
    await client.send('HeapProfiler.enable');
    await client.send('HeapProfiler.collectGarbage');
    await client.send('HeapProfiler.collectGarbage');
    await client.send('Performance.enable');
    const { metrics } = await client.send('Performance.getMetrics');
    const pick = (name) => metrics.find((m) => m.name === name)?.value ?? null;
    return { heapUsed: pick('JSHeapUsedSize'), nodes: pick('Nodes'), listeners: pick('JSEventListeners'), documents: pick('Documents'), layoutCount: pick('LayoutCount'), recalcStyleCount: pick('RecalcStyleCount') };
  } finally { await client.detach().catch(() => {}); }
}

export const median = (list) => { const s = [...list].sort((a, b) => a - b); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
export const range = (list) => (list.length ? [Math.min(...list), Math.max(...list)] : [null, null]);
export const round = (n, d = 1) => (n === null || n === undefined ? null : Math.round(n * 10 ** d) / 10 ** d);

/** 무작위 번호를 처음 나온 차례의 자리표로 바꾼다(두 빌드의 장부를 칸마다 견주려고) */
export function normalizeIds(value, idKeys = ['id', 'ownedId', 'openId', 'serverId', 'requestId', 'batchId', 'txId', 'reviewId']) {
  const map = new Map();
  const collect = (v, key) => {
    if (Array.isArray(v)) { v.forEach((x) => collect(x)); return; }
    if (v && typeof v === 'object') { for (const [k, x] of Object.entries(v)) collect(x, k); return; }
    if (typeof v === 'string' && idKeys.includes(key) && !map.has(v) && /[0-9a-f]{6,}|\d{6,}/i.test(v)) map.set(v, '#' + map.size);
  };
  collect(value);
  let text = JSON.stringify(value);
  const keys = [...map.keys()].sort((a, b) => b.length - a.length);
  for (const key of keys) text = text.split(key).join(map.get(key));
  return { value: JSON.parse(text), ids: map.size };
}

/** 두 값의 다른 칸을 경로와 함께 적는다 */
export function deepDiff(a, b, pathText = '', out = [], limit = 400) {
  if (out.length >= limit) return out;
  if (a === b) return out;
  const ta = Array.isArray(a) ? 'array' : a === null ? 'null' : typeof a;
  const tb = Array.isArray(b) ? 'array' : b === null ? 'null' : typeof b;
  if (ta !== tb || (ta !== 'object' && ta !== 'array')) { out.push({ path: pathText || '(root)', a, b }); return out; }
  if (ta === 'array') {
    if (a.length !== b.length) out.push({ path: pathText + '.length', a: a.length, b: b.length });
    for (let i = 0; i < Math.min(a.length, b.length); i++) deepDiff(a[i], b[i], `${pathText}[${i}]`, out, limit);
    return out;
  }
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (!(key in a)) out.push({ path: `${pathText}.${key}`, a: '(없음)', b: b[key] });
    else if (!(key in b)) out.push({ path: `${pathText}.${key}`, a: a[key], b: '(없음)' });
    else deepDiff(a[key], b[key], `${pathText}.${key}`, out, limit);
    if (out.length >= limit) break;
  }
  return out;
}
