#!/usr/bin/env node
/**
 * 개봉 연출의 프레임과 사건 순서를 잰다. 한 개와 다섯 개, 보통 움직임과 움직임 줄이기, 그리고 연출 도중의 끼어들기.
 *
 *   node motion.mjs <label> <baseUrl> [outDir] [--runs 3] [--only one-normal,refresh-mid] [--locale ko] [--width 390]
 *   예) node motion.mjs before-local http://127.0.0.1:4173/voila-test-aresjoo
 *   outDir 을 주지 않으면 migration-audit/motion/<label>/ 에 적는다.
 *
 * 재는 방법
 *   사건 순서  페이지가 뜨기 전에 관찰 코드를 심는다. MutationObserver 가 개봉 화면의 단계 속성(.v-op 의 data-phase 와
 *             data-opening-state, 여러 개 열기의 .v-op-scene data-phase, 결과 화면의 등장, 아래 단추가 눌리게 된 순간)이
 *             바뀔 때마다 시각을 적는다. 누른 순간(pointerdown), 저장소에 쓴 순간(localStorage.setItem: 보관함, 지갑, 시드, 기록장),
 *             CSS 애니메이션의 시작과 끝도 같은 시계로 적는다.
 *   프레임     Chrome 의 화면 전송(Page.startScreencast)으로 그려진 프레임을 전부 받고, 누른 순간부터 100ms 마다 그때 화면에
 *             떠 있던 프레임을 골라 frame-0000ms.png 꼴로 적는다.
 *   시계       이 도구는 페이지의 시계를 건드리지 않는다(연출 길이가 재는 대상이라 가짜 시계를 쓰면 값이 달라진다).
 *             그래서 저장된 시각 값은 실행마다 다르고, 견줄 때는 길이와 순서만 본다.
 *   그 밖      추첨 시드와 프리셋은 촬영 도구와 같은 고정 값이다. 네트워크는 같은 지킴이를 쓴다.
 *
 * 만드는 것(경우마다 <outDir>/<경우>/)
 *   run-N/timeline.json   사건 전부와 거기서 뽑은 단계별 길이
 *   run-N/frame-XXXXms.png
 *   <outDir>/motion.json  경우마다의 단계별 길이(실행마다, 가운데 값), 장부를 쓴 시각, 끼어들기 뒤의 장부
 *   <outDir>/MOTION.md    사람이 읽는 요약
 *
 * 연출 길이는 실행마다 몇 ms 씩 흔들린다. 그래서 경우마다 여러 번(기본 3번) 재고, 흔들림의 폭도 함께 적는다.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { summarizeStorage } from './lib/observe.mjs';
import { FAIR, VIEWPORTS, harnessRoot, launch, newContext, guardNetwork, makeFixedState, installState, parseBase, routeUrl, settle, readStorage, parseArgs } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2), ['label', 'baseUrl', 'outDir']);
if (!args.label || !args.baseUrl) { console.error('사용법: node motion.mjs <label> <baseUrl> [outDir] [--runs 3] [--only 경우,경우] [--locale ko] [--width 390]'); process.exit(2); }
const target = parseBase(args.baseUrl);
const outDir = path.resolve(args.outDir ?? path.join(harnessRoot, '..', 'motion', args.label));
const RUNS = Number(args.runs ?? 3);
const locale = args.locale ?? 'ko';
const width = Number(args.width ?? 390);
const only = args.only ? String(args.only).split(',') : null;
const wrap = (state, version = 0) => JSON.stringify({ state, version });

/** 페이지에 심는 관찰 코드. 앱의 어떤 스크립트보다 먼저 돈다. */
function probe() {
  if (window.__motion) return;
  const M = (window.__motion = { events: [] });
  const now = () => performance.timeOrigin + performance.now();
  const push = (type, detail) => M.events.push({ t: now(), type, ...detail });
  // 저장소에 쓰는 순간. 앱의 저장소 셰임이 이 함수를 감싸므로 여기서 보는 이름에는 사이트 접두사가 붙어 있다
  const setItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    try {
      if (this === window.localStorage) {
        const name = String(key);
        const kind = /inventory/.test(name) ? 'inventory' : /wallet/.test(name) ? 'wallet' : /gachaflix\.fair/.test(name) ? 'fair' : /opening-journal/.test(name) ? 'journal' : null;
        if (kind) {
          const info = { store: kind, key: name.replace(/^[^:]*:/, '') };
          try {
            const state = JSON.parse(value).state ?? {};
            if (kind === 'inventory') info.items = (state.items ?? []).length;
            if (kind === 'wallet') { info.balance = state.balance; info.transactions = (state.transactions ?? []).length; }
            if (kind === 'fair') info.nonce = state.nonce;
            if (kind === 'journal') info.seen = Object.keys(state.seen ?? {}).length;
          } catch { /* 풀지 못한 값은 이름만 적는다 */ }
          push('storage', info);
        }
      }
    } catch { /* 관찰이 저장을 막지 않게 한다 */ }
    return setItem.apply(this, arguments);
  };
  const state = () => {
    const op = document.querySelector('.v-op'), reveal = document.querySelector('.v-reveal');
    const scene = reveal?.querySelector('.v-op-scene');
    return {
      op: op ? op.dataset.phase : null,
      opState: op ? op.dataset.openingState : null,
      reveal: reveal ? (reveal.querySelector('.v-reveal-result') ? 'result' : scene ? scene.dataset.phase : 'other') : null,
      armed: !!document.querySelector('.v-op-actions[data-armed], .v-reveal-actions .v-btn:not([disabled])'),
      busy: !!document.querySelector('[data-open-primary][data-busy]'),
      confirm: !!document.querySelector('[role="alertdialog"]'),
      recover: !!document.querySelector('[data-open-recover]'),
    };
  };
  let last = '';
  const check = () => { const s = JSON.stringify(state()); if (s !== last) { last = s; push('dom', { state: JSON.parse(s) }); } };
  const start = () => {
    new MutationObserver(check).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-phase', 'data-opening-state', 'data-armed', 'disabled', 'data-busy'] });
    check();
  };
  if (document.documentElement) start(); else document.addEventListener('DOMContentLoaded', start);
  const pressTarget = (e) => { const b = e.target?.closest?.('[data-open-primary], [data-open-again], [role="alertdialog"] .v-btn, .v-op-skip .v-link, [data-open-recover]'); return b ? (b.hasAttribute('data-open-primary') ? 'open-primary' : b.hasAttribute('data-open-again') ? 'open-again' : b.hasAttribute('data-open-recover') ? 'recover' : b.closest('.v-op-skip') ? 'skip' : 'confirm') : null; };
  window.addEventListener('pointerdown', (e) => { const target = pressTarget(e); if (target) push('pointerdown', { target }); }, true);
  window.addEventListener('click', (e) => { const target = pressTarget(e); if (target) push('click', { target, trusted: e.isTrusted }); }, true);
  for (const type of ['animationstart', 'animationend', 'animationcancel']) document.addEventListener(type, (e) => {
    const el = e.target; if (!el?.closest?.('.v-op, .v-reveal')) return;
    push(type, { name: e.animationName, el: String(el.getAttribute('class') ?? '').split(/\s+/)[0], elapsed: Math.round(e.elapsedTime * 1000) });
  }, true);
  // 프레임 간격: 누른 뒤부터 아래 단추가 눌리게 될 때까지
  // 소리와 진동: 앱이 부르는 것을 적는다(무엇을, 어떤 값으로). 부르는 것 자체는 막지 않는다
  const call = (name, detail) => push('call', { name, ...detail });
  for (const key of ['AudioContext', 'webkitAudioContext']) {
    const Original = window[key];
    if (!Original) continue;
    const Wrapped = function (...args) { call('new ' + key, {}); return new Original(...args); };
    Wrapped.prototype = Original.prototype;
    try { window[key] = Wrapped; } catch { /* 바꿀 수 없으면 생성은 적지 못한다. 아래의 메서드 호출은 적힌다 */ }
    for (const method of ['createOscillator', 'createBufferSource', 'createGain', 'decodeAudioData', 'resume']) {
      const original = Original.prototype[method];
      if (typeof original !== 'function') continue;
      Original.prototype[method] = function (...args) { call('audio.' + method, {}); return original.apply(this, args); };
    }
  }
  if (window.OscillatorNode) { const start = OscillatorNode.prototype.start; OscillatorNode.prototype.start = function (...args) { call('oscillator.start', { wave: this.type, frequency: Math.round(this.frequency.value) }); return start.apply(this, args); }; }
  if (window.AudioBufferSourceNode) { const start = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (...args) { call('bufferSource.start', { seconds: this.buffer ? Math.round(this.buffer.duration * 1000) / 1000 : null }); return start.apply(this, args); }; }
  { const play = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function (...args) { call('media.play', { src: String(this.currentSrc || this.src).split('/').slice(-2).join('/') }); return play.apply(this, args); }; }
  if (navigator.vibrate) { const vibrate = navigator.vibrate.bind(navigator); try { Object.defineProperty(Navigator.prototype, 'vibrate', { configurable: true, value: function (pattern) { call('vibrate', { pattern: JSON.stringify(pattern) }); return vibrate(pattern); } }); } catch { /* 바꿀 수 없으면 진동 호출은 적지 못한다 */ } }
  M.frames = [];
  let prev = 0;
  const loop = (t) => { if (prev) M.frames.push(Math.round((t - prev) * 10) / 10); prev = t; if (M.frames.length < 2000) requestAnimationFrame(loop); };
  M.startFrames = () => { M.frames = []; prev = 0; requestAnimationFrame(loop); };
}

/** 사건에서 단계별 길이를 뽑는다. 기준은 누른 순간(마지막으로 구매를 시작한 누름)이다. */
function derive(events, { multi }) {
  const press = [...events].reverse().find((e) => e.type === 'pointerdown' && ['open-primary', 'open-again', 'confirm'].includes(e.target)) ?? events.find((e) => e.type === 'click');
  if (!press) return { error: '누른 사건을 찾지 못했다' };
  const t0 = press.t;
  const after = events.filter((e) => e.t >= t0);
  const rel = (e) => (e ? Math.round(e.t - t0) : null);
  const dom = (test) => after.find((e) => e.type === 'dom' && test(e.state));
  const marks = multi ? {
    overlayShown: rel(dom((s) => s.reveal !== null)),
    anticipation: rel(dom((s) => s.reveal === 'anticipation')),
    impact: rel(dom((s) => s.reveal === 'impact')),
    exit: rel(dom((s) => s.reveal === 'exit')),
    reveal: rel(dom((s) => s.reveal === 'result')),
    ready: rel(dom((s) => s.reveal === 'result' && s.armed)),
  } : {
    overlayShown: rel(dom((s) => s.op !== null)),
    anticipation: rel(dom((s) => s.op === 'anticipation')),
    impact: rel(dom((s) => s.op === 'impact')),
    exit: rel(dom((s) => s.op === 'exit')),
    reveal: rel(dom((s) => s.op === 'reveal' || s.op === 'ready')),
    ready: rel(dom((s) => s.op === 'ready')),
  };
  const gap = (a, b) => (marks[a] === null || marks[b] === null ? null : marks[b] - marks[a]);
  const durations = {
    pressToOverlay: marks.overlayShown,
    anticipation: gap('anticipation', 'impact'),
    impact: gap('impact', 'exit'),
    exit: gap('exit', 'reveal'),
    revealToReady: gap('reveal', 'ready'),
    pressToReveal: marks.reveal,
    pressToReady: marks.ready,
  };
  const write = (store) => rel(after.find((e) => e.type === 'storage' && e.store === store));
  const ledger = { inventoryWrittenAt: write('inventory'), walletWrittenAt: write('wallet'), fairWrittenAt: write('fair'), journalWrittenAt: write('journal') };
  // 장부(보관함)가 연출이 끝나기 전에, 그리고 개봉 화면이 뜨기 전에 이미 쓰였는가
  ledger.writtenBeforeReveal = ledger.inventoryWrittenAt !== null && marks.reveal !== null ? ledger.inventoryWrittenAt <= marks.reveal : null;
  ledger.writtenBeforeOverlay = ledger.inventoryWrittenAt !== null && marks.overlayShown !== null ? ledger.inventoryWrittenAt <= marks.overlayShown : null;
  const order = after.filter((e) => ['dom', 'storage', 'pointerdown', 'click'].includes(e.type)).map((e) => `${Math.round(e.t - t0)}:${e.type === 'dom' ? 'dom(' + [e.state.op ?? '', e.state.opState ?? '', e.state.reveal ?? '', e.state.armed ? 'armed' : '', e.state.busy ? 'busy' : '', e.state.confirm ? 'confirm' : '', e.state.recover ? 'recover' : ''].filter(Boolean).join(',') + ')' : e.type === 'storage' ? 'write(' + e.store + ')' : e.type + '(' + e.target + ')'}`);
  const animations = after.filter((e) => e.type.startsWith('animation')).map((e) => ({ at: Math.round(e.t - t0), type: e.type, name: e.name, el: e.el, elapsed: e.elapsed }));
  return { t0, marks, durations, ledger, order, animations };
}

const ledgerOf = (storage, userId) => {
  const wallet = storage[`voila.browser-wallet.${userId}`]?.state ?? storage['gachaflix.wallet']?.state ?? {};
  const inventory = storage[`voila.browser-inventory.${userId}`]?.state ?? storage['gachaflix.inventory']?.state ?? {};
  const live = storage['gachaflix.wallet']?.state ?? {}, liveInv = storage['gachaflix.inventory']?.state ?? {};
  const tx = (list) => (list ?? []).map((t) => ({ type: t.type, amountUsdt: t.amountUsdt, ref: String(t.ref ?? '').replace(/op_[0-9a-f-]+/, 'op_#') }));
  const items = (list) => (list ?? []).map((i) => ({ itemId: i.itemId, boxSlug: i.boxSlug, valueUsdt: i.valueUsdt, status: i.status, nonce: i.fair?.nonce, roll: i.fair?.roll, hasOpeningId: !!i.openingId }));
  return {
    account: { balance: wallet.balance, transactions: tx(wallet.transactions), items: items(inventory.items) },
    live: { balance: live.balance, transactions: tx(live.transactions), items: items(liveInv.items) },
    fairNonce: storage['gachaflix.fair']?.state?.nonce ?? null,
    journalSeen: Object.keys(storage['voila.opening-journal']?.state?.seen ?? {}).length,
  };
};

async function session(browser, { reducedMotion, route, overrides, throttle, fairNonce, sound }) {
  const context = await newContext(browser, { width, locale, reducedMotion });
  const blocked = [];
  await guardNetwork(context, target, blocked);
  // fairNonce: 시드는 그대로 두고 시작 회차만 옮긴다(정해 둔 크기의 결과가 나오는 회차. golden/tone-nonces.json). sound: 소리와 진동 설정을 켠다
  const more = { ...(overrides ?? {}) };
  if (fairNonce !== undefined) more['gachaflix.fair'] = wrap({ ...FAIR, nonce: fairNonce });
  if (sound) more['gachaflix.settings'] = wrap({ muted: false, openSound: true, openShort: false, autoTakeBy: {} });
  const state = await makeFixedState('funded', locale, more);
  await installState(context, state, target.origin);
  await context.addInitScript(probe);
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 200)));
  await page.goto(routeUrl(target.base, locale, route), { waitUntil: 'domcontentloaded', timeout: 45000 });
  await settle(page, { fullImages: true });
  await page.locator('[data-open-primary]').waitFor();
  // 원인 가르기용: PARITY_MOTION_CSS 에 CSS 를 주면 측정 전에 그 CSS 를 넣는다(예: 후기 구역을 감추고 길이가 달라지는지 본다). 평소 측정에는 쓰지 않는다
  if (process.env.PARITY_MOTION_CSS) await page.addStyleTag({ content: process.env.PARITY_MOTION_CSS });
  const cdp = await context.newCDPSession(page);
  if (throttle) await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
  const frames = [];
  cdp.on('Page.screencastFrame', (frame) => { frames.push({ t: frame.metadata.timestamp * 1000, data: frame.data }); cdp.send('Page.screencastFrameAck', { sessionId: frame.sessionId }).catch(() => {}); });
  return { context, page, cdp, frames, state, errors, blocked };
}
const startCast = (s) => s.cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
const stopCast = (s) => s.cdp.send('Page.stopScreencast').catch(() => {});
const events = (s) => s.page.evaluate(() => ({ events: window.__motion.events, frames: window.__motion.frames }));
const stored = async (s) => ledgerOf(await readStorage(s.page, s.state.prefix), s.state.user.id);
const READY = { single: '.v-op[data-opening-state="settled"]', multi: '.v-reveal-actions .v-btn:not([disabled])' };

/** 누른 순간부터 100ms 마다, 그때 화면에 떠 있던 프레임을 적는다. */
async function writeFrames(dir, frames, t0, untilMs) {
  const names = [];
  if (!frames.length) return names;
  for (let ms = 0; ms <= untilMs; ms += 100) {
    const at = t0 + ms;
    let pick = null;
    for (const f of frames) { if (f.t <= at) pick = f; else break; }
    pick ??= frames[0];
    const name = `frame-${String(ms).padStart(4, '0')}ms.png`;
    await writeFile(path.join(dir, name), Buffer.from(pick.data, 'base64'));
    names.push({ ms, name, frameAge: Math.round(at - pick.t) });
  }
  return names;
}

/** 보통의 한 번: 누르고 끝까지 본다. */
async function measure(browser, def, run) {
  const dir = path.join(outDir, def.key, `run-${run}`);
  await mkdir(dir, { recursive: true });
  const s = await session(browser, def);
  try {
    if (def.qty) { await s.page.locator('.v-openbar .v-chip').nth(def.qty).click(); await s.page.waitForTimeout(200); }
    await startCast(s);
    await s.page.evaluate(() => window.__motion.startFrames());
    await s.page.waitForTimeout(300);
    await s.page.locator('[data-open-primary]').click();
    // 확인창은 뜬 뒤 350ms 동안 확정 단추의 누름을 버린다(결과 빌드). 이 도구는 실제 시계를 쓰므로 600ms 기다린 뒤 누른다(두 빌드에서 똑같이)
    if (def.confirm) { await s.page.locator('[role="alertdialog"] .v-btn').waitFor(); await s.page.waitForTimeout(600); await s.page.locator('[role="alertdialog"] .v-btn').click(); }
    if (def.during) await def.during(s);
    await s.page.locator(def.multi ? READY.multi : READY.single).first().waitFor({ timeout: 20000 });
    await s.page.waitForTimeout(500);
    await stopCast(s);
    const raw = await events(s);
    const derived = derive(raw.events, def);
    // 결과의 크기에 따라 달라지는 것: 개봉 화면의 톤과 종류, 상표 띠, 후광, 사진, 여러 개 결과의 "가장 큰 결과" 칸
    derived.effects = await s.page.evaluate(() => {
      const op = document.querySelector('.v-op'), reveal = document.querySelector('.v-reveal');
      const clean = (t) => String(t ?? '').replace(/\s+/g, ' ').trim();
      if (op) return { root: 'v-op', tone: op.dataset.tone, kind: op.dataset.kind, classes: String(op.className), brand: !!op.querySelector('.v-op-brand'), halo: !!op.querySelector('.v-op-halo'), photo: !!op.querySelector('.v-op-photo'), amount: !!op.querySelector('.v-op-amount'), text: clean(op.querySelector('.v-op-result')?.innerText).slice(0, 160) };
      if (reveal) return { root: 'v-reveal', classes: String(reveal.className), best: clean(reveal.querySelector('.v-best')?.innerText) || null, rows: reveal.querySelectorAll('.v-resultrow').length, sizes: Array.from(reveal.querySelectorAll('[data-size]')).map((el) => el.dataset.size), title: clean(reveal.querySelector('.v-title')?.innerText) };
      return null;
    });
    // 확인창을 거치는 경우에는 잰 누름(t0)이 확인 단추다. 그 전에 열기 단추에서 부른 것(첫 소리)은 "누르기 전:"을 붙여 같은 목록의 앞에 둔다
    derived.calls = raw.events.filter((e) => e.type === 'call').map((e) => (e.t >= (derived.t0 ?? 0) ? '' : '누르기 전:') + e.name +(e.wave ? ':' + e.wave + ':' + e.frequency : '') + (e.pattern ? ':' + e.pattern : '') + (e.src ? ':' + e.src : '') + (e.seconds !== undefined ? ':' + e.seconds : ''));
    const frameNames = derived.t0 ? await writeFrames(dir, s.frames, derived.t0, (derived.marks.ready ?? 1500) + 300) : [];
    const deltas = raw.frames.filter((d) => d > 0);
    const sorted = [...deltas].sort((a, b) => a - b);
    const frameStats = deltas.length ? { count: deltas.length, max: sorted.at(-1), p95: sorted[Math.floor(sorted.length * 0.95)], over34ms: deltas.filter((d) => d > 34).length } : null;
    const result = { case: def.key, run, ...derived, t0: undefined, frameStats, screencastFrames: s.frames.length, frames: frameNames, ledgerAfter: await stored(s), pageErrors: s.errors, blocked: s.blocked.length };
    await writeFile(path.join(dir, 'timeline.json'), JSON.stringify({ ...result, events: raw.events.map((e) => ({ ...e, t: Math.round((e.t - derived.t0) * 10) / 10 })) }, null, 1));
    return result;
  } finally { await s.context.close().catch(() => {}); }
}

/** 끼어들기: 연출 도중에 무슨 일을 하고, 그 뒤의 장부와 화면을 적는다. */
async function interrupt(browser, def) {
  const dir = path.join(outDir, def.key);
  await mkdir(dir, { recursive: true });
  const s = await session(browser, { reducedMotion: 'no-preference', route: '/box/dollar-apple' });
  const out = { case: def.key, title: def.title, steps: [] };
  const note = async (name, extra = {}) => out.steps.push({ name, ...extra, ledger: await stored(s), dom: await s.page.evaluate(() => ({ op: document.querySelector('.v-op')?.dataset.phase ?? null, opState: document.querySelector('.v-op')?.dataset.openingState ?? null, recover: !!document.querySelector('[data-open-recover]'), openPrimary: !!document.querySelector('[data-open-primary]'), lines: Array.from(document.querySelectorAll('.v-openbar .v-line, .v-op-status p')).map((el) => el.innerText.trim()), path: location.pathname.split('/').slice(-3).join('/') })).catch((e) => ({ unreadable: String(e.message).slice(0, 100) })) });
  try {
    await note('누르기 전');
    await def.run(s, note);
    const raw = await events(s).catch(() => ({ events: [] }));
    out.order = derive(raw.events, { multi: false }).order ?? [];
    out.pageErrors = s.errors;
    await s.page.screenshot({ path: path.join(dir, 'after.png'), timeout: 10000 }).catch(() => {});
  } catch (error) { out.error = String(error.message).split(/\r?\n/)[0].slice(0, 300); }
  finally { await s.context.close().catch(() => {}); }
  await writeFile(path.join(dir, 'result.json'), JSON.stringify(out, null, 1));
  return out;
}

const waitPhase = (s, phase) => s.page.locator(`.v-op[data-phase="${phase}"]`).waitFor({ timeout: 15000 });
const CASES = [
  { key: 'one-normal', title: '한 개, 보통 움직임 (1달러 박스)', route: '/box/dollar-apple', reducedMotion: 'no-preference' },
  { key: 'one-reduced', title: '한 개, 움직임 줄이기', route: '/box/dollar-apple', reducedMotion: 'reduce' },
  { key: 'five-normal', title: '다섯 개, 보통 움직임', route: '/box/dollar-apple', reducedMotion: 'no-preference', qty: 1, multi: true },
  { key: 'five-reduced', title: '다섯 개, 움직임 줄이기', route: '/box/dollar-apple', reducedMotion: 'reduce', qty: 1, multi: true },
  { key: 'one-item-normal', title: '한 개, 보통 움직임 (50달러 박스, 큰 금액 확인 뒤, 상품 결과)', route: '/box/gaming-playstation', reducedMotion: 'no-preference', confirm: true },
  { key: 'one-short', title: '한 개, 짧게 보기 설정', route: '/box/dollar-apple', reducedMotion: 'no-preference', overrides: { 'gachaflix.settings': wrap({ muted: true, openSound: false, openShort: true, autoTakeBy: {} }) } },
  { key: 'one-skip', title: '한 개, 연출 도중 "결과 바로 보기"', route: '/box/dollar-apple', reducedMotion: 'no-preference', during: async (s) => { await waitPhase(s, 'anticipation'); await s.page.waitForTimeout(150); await s.page.locator('.v-op-skip .v-link').click(); } },
  { key: 'one-escape', title: '한 개, 연출 도중 Escape', route: '/box/dollar-apple', reducedMotion: 'no-preference', during: async (s) => { await waitPhase(s, 'anticipation'); await s.page.waitForTimeout(150); await s.page.keyboard.press('Escape'); } },
  { key: 'one-slow4x', title: '한 개, 느린 기기 흉내(CPU 4배 느리게)', route: '/box/dollar-apple', reducedMotion: 'no-preference', throttle: 4 },
  // 결과의 크기별(2차 QA). 회차는 golden/tone-nonces.json 에서 왔다. 소리와 진동 설정을 켜고 잰다(부르는 목록을 견주려고)
  { key: 'tone-below', title: '한 개, 낸 값보다 적은 결과(50달러 박스, $7.99), 소리 켬', route: '/box/gaming-playstation', reducedMotion: 'no-preference', confirm: true, fairNonce: 0, sound: true },
  { key: 'tone-above', title: '한 개, 낸 값보다 큰 결과($79.99), 소리 켬', route: '/box/gaming-playstation', reducedMotion: 'no-preference', confirm: true, fairNonce: 9, sound: true },
  { key: 'tone-high', title: '한 개, 6배 이상의 결과($549.99), 소리 켬', route: '/box/gaming-playstation', reducedMotion: 'no-preference', confirm: true, fairNonce: 91, sound: true },
  { key: 'tone-top', title: '한 개, 20배 이상의 결과($1,349.99), 소리 켬', route: '/box/gaming-playstation', reducedMotion: 'no-preference', confirm: true, fairNonce: 1707, sound: true },
  { key: 'tone-cash-above', title: '한 개, USDT 결과가 낸 값보다 큼(1달러 박스, $2), 소리 켬', route: '/box/dollar-apple', reducedMotion: 'no-preference', fairNonce: 9, sound: true },
  { key: 'tone-cash-top', title: '한 개, USDT 결과가 20배 이상(1달러 박스, $30), 소리 켬', route: '/box/dollar-apple', reducedMotion: 'no-preference', fairNonce: 1707, sound: true },
  { key: 'ten-low', title: '열 개, 전부 박스 가격의 두 배 미만(50달러 박스), 소리 켬', route: '/box/gaming-playstation', reducedMotion: 'no-preference', qty: 2, multi: true, confirm: true, fairNonce: 0, sound: true },
  { key: 'ten-top', title: '열 개, 20배 이상이 하나 들어 있음, 소리 켬', route: '/box/gaming-playstation', reducedMotion: 'no-preference', qty: 2, multi: true, confirm: true, fairNonce: 1703, sound: true },
];
const INTERRUPTS = [
  { key: 'second-press', title: '연출 도중에 열기를 다시 누름', run: async (s, note) => {
    await s.page.locator('[data-open-primary]').click();
    await waitPhase(s, 'anticipation');
    // 개봉 화면이 덮고 있어 사람 손으로는 닿지 않는다. 코드로 단추를 직접 눌러 본다(가장 나쁜 경우)
    await s.page.evaluate(() => { const b = document.querySelector('[data-open-primary]'); b?.click(); b?.click(); });
    await note('연출 도중에 두 번 더 누른 직후');
    await s.page.locator(READY.single).waitFor({ timeout: 20000 });
    await s.page.waitForTimeout(600);
    await note('결과가 뜬 뒤');
  } },
  { key: 'rapid-triple-click', title: '같은 순간에 세 번 누름', run: async (s, note) => {
    await s.page.evaluate(() => { const b = document.querySelector('[data-open-primary]'); b.click(); b.click(); b.click(); });
    await s.page.locator(READY.single).waitFor({ timeout: 20000 });
    await s.page.waitForTimeout(600);
    await note('결과가 뜬 뒤');
  } },
  { key: 'leave-mid', title: '연출 도중에 화면을 떠났다가 돌아옴', run: async (s, note) => {
    await s.page.locator('[data-open-primary]').click();
    await waitPhase(s, 'anticipation');
    await s.page.waitForTimeout(150);
    await s.page.goto(routeUrl(target.base, locale, ''), { waitUntil: 'domcontentloaded' });
    await settle(s.page, { quiet: 300 });
    await note('떠난 뒤(박스 목록)');
    await s.page.goto(routeUrl(target.base, locale, '/box/dollar-apple'), { waitUntil: 'domcontentloaded' });
    await settle(s.page, { quiet: 600 });
    await s.page.locator('[data-open-recover], [data-open-primary]').first().waitFor();
    await note('돌아온 뒤');
    if (await s.page.locator('[data-open-recover]').isVisible()) {
      await s.page.locator('[data-open-recover]').click();
      await s.page.locator(READY.single).waitFor({ timeout: 20000 });
      await s.page.waitForTimeout(500);
      await note('못 본 결과를 다시 본 뒤');
      await s.page.locator('.v-op-top .v-op-tool').last().click();
      await s.page.waitForTimeout(500);
      await note('닫은 뒤');
    }
  } },
  { key: 'refresh-mid', title: '연출 도중에 새로 고침', run: async (s, note) => {
    await s.page.locator('[data-open-primary]').click();
    await waitPhase(s, 'anticipation');
    await s.page.waitForTimeout(150);
    await s.page.reload({ waitUntil: 'domcontentloaded' });
    await settle(s.page, { quiet: 600 });
    await s.page.locator('[data-open-recover], [data-open-primary]').first().waitFor();
    await note('새로 고친 뒤');
    if (await s.page.locator('[data-open-recover]').isVisible()) {
      await s.page.locator('[data-open-recover]').click();
      await s.page.locator(READY.single).waitFor({ timeout: 20000 });
      await s.page.waitForTimeout(500);
      await note('못 본 결과를 다시 본 뒤');
    }
    await s.page.reload({ waitUntil: 'domcontentloaded' });
    await settle(s.page, { quiet: 600 });
    await s.page.locator('[data-open-recover], [data-open-primary]').first().waitFor();
    await note('한 번 더 새로 고친 뒤');
  } },
  { key: 'back-mid', title: '연출 도중에 브라우저 뒤로 가기', run: async (s, note) => {
    // 뒤로 갈 곳을 만든다: 박스 목록에서 들어온 것으로
    await s.page.goto(routeUrl(target.base, locale, ''), { waitUntil: 'domcontentloaded' });
    await settle(s.page, { quiet: 300 });
    await s.page.goto(routeUrl(target.base, locale, '/box/dollar-apple'), { waitUntil: 'domcontentloaded' });
    await settle(s.page, { quiet: 300 });
    await s.page.locator('[data-open-primary]').click();
    await waitPhase(s, 'anticipation');
    await s.page.waitForTimeout(150);
    await s.page.goBack({ waitUntil: 'domcontentloaded' });
    await settle(s.page, { quiet: 500 });
    await note('뒤로 간 뒤');
    await s.page.goForward({ waitUntil: 'domcontentloaded' });
    await settle(s.page, { quiet: 600 });
    await s.page.locator('[data-open-recover], [data-open-primary]').first().waitFor();
    await note('앞으로 돌아온 뒤');
  } },
];
const NOT_RUN = [
  { key: 'tab-background', title: '탭을 뒤로 보냈다 돌아옴', reason: 'headless 브라우저의 한 탭에서는 실제 백그라운드 전환(타이머 늦춤)을 만들 수 없다. 실행하지 않았다' },
  { key: 'audio-failure', title: '소리 재생 실패', reason: '기본 설정은 소리 끔이고, headless 에서는 소리 장치가 없어 실패와 성공을 가를 수 없다. 실행하지 않았다' },
  { key: 'mobile-browser', title: '실제 모바일 브라우저', reason: '데스크톱 Chrome 의 모바일 흉내(폭, 배율, 터치)만 쓴다. 실제 기기에서는 실행하지 않았다' },
];

await mkdir(outDir, { recursive: true });
const browser = await launch();
const startedAt = new Date().toISOString();
const median = (list) => { const v = list.filter((x) => x !== null && x !== undefined).sort((a, b) => a - b); return v.length ? v[Math.floor((v.length - 1) / 2)] : null; };
const cases = [], interrupts = [];
try {
  for (const def of CASES) {
    if (only && !only.includes(def.key)) continue;
    const runs = [];
    for (let run = 1; run <= RUNS; run++) {
      try { runs.push(await measure(browser, def, run)); }
      catch (error) { runs.push({ case: def.key, run, error: String(error.message).split(/\r?\n/)[0].slice(0, 300) }); }
    }
    const ok = runs.filter((r) => !r.error && r.durations);
    const keys = ['pressToOverlay', 'anticipation', 'impact', 'exit', 'revealToReady', 'pressToReveal', 'pressToReady'];
    const summary = Object.fromEntries(keys.map((k) => [k, { median: median(ok.map((r) => r.durations[k])), min: ok.length ? Math.min(...ok.map((r) => r.durations[k] ?? Infinity)) : null, max: ok.length ? Math.max(...ok.map((r) => r.durations[k] ?? -Infinity)) : null, values: ok.map((r) => r.durations[k]) }]));
    for (const k of keys) { if (!Number.isFinite(summary[k].min)) summary[k].min = null; if (!Number.isFinite(summary[k].max)) summary[k].max = null; }
    cases.push({ key: def.key, title: def.title, multi: !!def.multi, reducedMotion: def.reducedMotion, runs: runs.length, okRuns: ok.length, durations: summary,
      ledger: { writtenBeforeReveal: ok.map((r) => r.ledger.writtenBeforeReveal), writtenBeforeOverlay: ok.map((r) => r.ledger.writtenBeforeOverlay), inventoryWrittenAt: ok.map((r) => r.ledger.inventoryWrittenAt) },
      effects: ok[0]?.effects ?? null, callRuns: ok.map((r) => r.calls ?? []),
      order: ok[0]?.order ?? [], animations: ok[0]?.animations?.map((a) => `${a.type}:${a.el}:${a.name}`) ?? [],
      // 실행마다의 CSS 애니메이션 사건. 끝까지 간 것(animationend)과 다음 단계가 먼저 와서 끊긴 것(animationcancel)이 실행마다 갈릴 수 있다
      animationRuns: ok.map((r) => r.animations.map((a) => `${a.type}:${a.el}:${a.name}`)), frameStats: ok.map((r) => r.frameStats), ledgerAfter: ok[0]?.ledgerAfter ?? null, errors: runs.filter((r) => r.error).map((r) => r.error) });
    console.log(`${def.key}: ${ok.length}/${runs.length}회, 누름→결과 ${summary.pressToReveal.median}ms, 누름→준비 ${summary.pressToReady.median}ms, 장부가 결과보다 먼저 ${JSON.stringify(ok.map((r) => r.ledger.writtenBeforeReveal))}`);
  }
  for (const def of INTERRUPTS) {
    if (only && !only.includes(def.key)) continue;
    const result = await interrupt(browser, def);
    interrupts.push(result);
    const last = result.steps.at(-1);
    console.log(`${def.key}: ${result.error ? '오류 ' + result.error : `거래 ${last?.ledger.account.transactions.length}건, 상품 ${last?.ledger.account.items.length}개, nonce ${last?.ledger.fairNonce}`}`);
  }
} finally { await browser.close(); }
const report = { label: args.label, baseUrl: target.base, startedAt, finishedAt: new Date().toISOString(), locale, width, viewport: VIEWPORTS[width], runsPerCase: RUNS, fair: FAIR, cases, interrupts, notRun: NOT_RUN };
await writeFile(path.join(outDir, 'motion.json'), JSON.stringify(report, null, 1));
const md = [`# 개봉 연출 측정: ${args.label}`, '', `주소: ${target.base}`, `시작: ${startedAt}`, `조건: ${locale}, 폭 ${width}, 경우마다 ${RUNS}번`, '', '길이는 ms 이고 "가운데 값 (가장 짧은 값 ~ 가장 긴 값)" 꼴이다. 판정이 아니라 잰 값이다.', '', '## 단계별 길이', '', '| 경우 | 성공 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 장부가 결과보다 먼저 |', '|---|---|---|---|---|---|---|---|---|---|'];
const cell = (d) => (d.median === null ? '없음' : `${d.median} (${d.min}~${d.max})`);
for (const c of cases) md.push(`| ${c.key} | ${c.okRuns}/${c.runs} | ${cell(c.durations.pressToOverlay)} | ${cell(c.durations.anticipation)} | ${cell(c.durations.impact)} | ${cell(c.durations.exit)} | ${cell(c.durations.revealToReady)} | ${cell(c.durations.pressToReveal)} | ${cell(c.durations.pressToReady)} | ${c.ledger.writtenBeforeReveal.join(', ')} |`);
md.push('', '## 사건 순서(경우마다 첫 실행)', '');
for (const c of cases) md.push(`- ${c.key}: ${c.order.join(' → ')}`);
md.push('', '## 끼어들기 뒤의 장부', '', '| 경우 | 단계 | 계정 거래 수 | 계정 상품 수 | nonce | 본 기록 수 | 화면 |', '|---|---|---|---|---|---|---|');
for (const r of interrupts) { if (r.error) md.push(`| ${r.case} | (오류) ${r.error} | | | | | |`); for (const s of r.steps) md.push(`| ${r.case} | ${s.name} | ${s.ledger.account.transactions.length} | ${s.ledger.account.items.length} | ${s.ledger.fairNonce} | ${s.ledger.journalSeen} | ${s.dom.unreadable ? '읽지 못함' : `개봉 화면 ${s.dom.op ?? '없음'}, 다시 보기 단추 ${s.dom.recover ? '있음' : '없음'}`} |`); }
md.push('', '## 실행하지 않은 것', '');
for (const n of NOT_RUN) md.push(`- ${n.title}: ${n.reason}`);
await writeFile(path.join(outDir, 'MOTION.md'), md.join('\n') + '\n');
console.log(`[${args.label}] 기록: ${path.join(outDir, 'motion.json')}`);
