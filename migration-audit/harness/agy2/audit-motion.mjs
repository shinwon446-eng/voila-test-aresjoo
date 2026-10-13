import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VIEWPORTS,
  launch,
  newContext,
  guardNetwork,
  makeFixedState,
  installState,
  parseBase,
  routeUrl,
  settle,
  parseArgs,
} from '../lib/common.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../');
const MOTION_OUT = path.resolve(ROOT, 'migration-audit/motion/cycle2-agy');

const BUILDS = {
  original: { label: 'original', base: 'http://127.0.0.1:4175/voila-test-aresjoo' },
  result: { label: 'result', base: 'http://127.0.0.1:4176/voila-test-aresjoo' },
};

function probeScript() {
  if (window.__motion) return;
  const M = (window.__motion = { events: [] });
  const now = () => performance.timeOrigin + performance.now();
  const push = (type, detail) => M.events.push({ t: now(), type, ...detail });

  const setItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    try {
      if (this === window.localStorage) {
        const name = String(key);
        const kind = /inventory/.test(name) ? 'inventory' : /wallet/.test(name) ? 'wallet' : /gachaflix\.fair/.test(name) ? 'fair' : /opening-journal/.test(name) ? 'journal' : null;
        if (kind) {
          const info = { store: kind, key: name.replace(/^[^:]*:/, '') };
          push('storage', info);
        }
      }
    } catch {}
    return setItem.apply(this, arguments);
  };

  const state = () => {
    const op = document.querySelector('.v-op');
    const reveal = document.querySelector('.v-reveal');
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
  const check = () => {
    const s = JSON.stringify(state());
    if (s !== last) {
      last = s;
      push('dom', { state: JSON.parse(s) });
    }
  };

  const start = () => {
    new MutationObserver(check).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-phase', 'data-opening-state', 'data-armed', 'disabled', 'data-busy'],
    });
    check();
  };
  if (document.documentElement) start();
  else document.addEventListener('DOMContentLoaded', start);

  const pressTarget = (e) => {
    const b = e.target?.closest?.('[data-open-primary], [data-open-again], [role="alertdialog"] .v-btn, .v-op-skip .v-link, [data-open-recover]');
    return b ? (b.hasAttribute('data-open-primary') ? 'open-primary' : b.hasAttribute('data-open-again') ? 'open-again' : b.hasAttribute('data-open-recover') ? 'recover' : b.closest('.v-op-skip') ? 'skip' : 'confirm') : null;
  };
  window.addEventListener('pointerdown', (e) => {
    const target = pressTarget(e);
    if (target) push('pointerdown', { target });
  }, true);
  window.addEventListener('click', (e) => {
    const target = pressTarget(e);
    if (target) push('click', { target, trusted: e.isTrusted });
  }, true);

  for (const type of ['animationstart', 'animationend', 'animationcancel']) {
    document.addEventListener(type, (e) => {
      const el = e.target;
      if (!el?.closest?.('.v-op, .v-reveal')) return;
      push(type, { name: e.animationName, el: String(el.getAttribute('class') ?? '').split(/\s+/)[0], elapsed: Math.round(e.elapsedTime * 1000) });
    }, true);
  }
}

function deriveTimeline(events, { multi }) {
  const press = [...events].reverse().find((e) => e.type === 'pointerdown' && ['open-primary', 'open-again', 'confirm'].includes(e.target)) ?? events.find((e) => e.type === 'click');
  if (!press) return { error: '누른 사건 없음' };
  const t0 = press.t;
  const after = events.filter((e) => e.t >= t0);
  const rel = (e) => (e ? Math.round(e.t - t0) : null);
  const dom = (test) => after.find((e) => e.type === 'dom' && test(e.state));

  const marks = multi
    ? {
        overlayShown: rel(dom((s) => s.reveal !== null)),
        anticipation: rel(dom((s) => s.reveal === 'anticipation')),
        impact: rel(dom((s) => s.reveal === 'impact')),
        exit: rel(dom((s) => s.reveal === 'exit')),
        reveal: rel(dom((s) => s.reveal === 'result')),
        ready: rel(dom((s) => s.reveal === 'result' && s.armed)),
      }
    : {
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

  const order = after
    .filter((e) => ['dom', 'storage', 'pointerdown', 'click'].includes(e.type))
    .map((e) => `${Math.round(e.t - t0)}:${e.type === 'dom' ? 'dom(' + [e.state.op ?? '', e.state.opState ?? '', e.state.reveal ?? '', e.state.armed ? 'armed' : '', e.state.busy ? 'busy' : '', e.state.confirm ? 'confirm' : '', e.state.recover ? 'recover' : ''].filter(Boolean).join(',') + ')' : e.type === 'storage' ? 'write(' + e.store + ')' : e.type + '(' + e.target + ')'}`);

  return { t0, marks, durations, order };
}

async function writeFramesEvery50ms(dir, frames, t0, untilMs) {
  const written = [];
  if (!frames.length) return written;
  for (let ms = 0; ms <= untilMs; ms += 50) {
    const at = t0 + ms;
    let pick = null;
    for (const f of frames) {
      if (f.t <= at) pick = f;
      else break;
    }
    pick ??= frames[0];
    const name = `frame-${String(ms).padStart(4, '0')}ms.png`;
    await writeFile(path.join(dir, name), Buffer.from(pick.data, 'base64'));
    written.push({ ms, name, frameAge: Math.round(at - pick.t) });
  }
  return written;
}

async function recordOpening({ browser, buildKey, caseDef }) {
  const build = BUILDS[buildKey];
  const target = parseBase(build.base);
  const outDir = path.join(MOTION_OUT, buildKey, caseDef.name);
  await mkdir(outDir, { recursive: true });

  const context = await newContext(browser, {
    width: caseDef.width,
    locale: 'ko',
    reducedMotion: caseDef.reducedMotion ? 'reduce' : 'no-preference',
  });
  const blocked = [];
  await guardNetwork(context, target, blocked);

  const state = await makeFixedState('funded', 'ko');
  await installState(context, state, target.origin);
  await context.addInitScript(probeScript);

  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 200)));

  const url = routeUrl(target.base, 'ko', '/box/dollar-apple');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await settle(page, { fullImages: true });

  // Select count if multi
  if (caseDef.count === 5) {
    const chip = page.locator('.v-openbar .v-chip:has-text("5개")').first();
    await chip.click();
    await page.waitForTimeout(200);
  }

  const openBtn = page.locator('[data-open-primary]').first();
  await openBtn.waitFor({ state: 'visible', timeout: 10000 });

  // Attach CDP screencast
  const cdp = await context.newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', (frame) => {
    frames.push({ t: frame.metadata.timestamp * 1000, data: frame.data });
    cdp.send('Page.screencastFrameAck', { sessionId: frame.sessionId }).catch(() => {});
  });

  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
  await page.waitForTimeout(200);

  // Click open
  await openBtn.click();

  // Wait for settled result
  const readySelector = caseDef.count === 5
    ? '.v-reveal-actions .v-btn:not([disabled])'
    : '.v-op[data-opening-state="settled"]';

  await page.locator(readySelector).first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(300);

  // Capture final settled DOM info
  const finalDom = await page.evaluate(() => {
    const op = document.querySelector('.v-op');
    const reveal = document.querySelector('.v-reveal');
    const items = Array.from(document.querySelectorAll('.v-resultrow, .v-op-result')).map((el) => el.innerText.trim());
    return {
      opPhase: op?.dataset.phase ?? null,
      opState: op?.dataset.openingState ?? null,
      opTone: op?.dataset.tone ?? null,
      revealResult: !!reveal?.querySelector('.v-reveal-result'),
      itemCount: items.length,
      sampleText: items.slice(0, 3),
      actionBtns: Array.from(document.querySelectorAll('.v-op-actions .v-btn, .v-reveal-actions .v-btn')).map((b) => b.innerText.trim()),
    };
  });

  // Take final settled high-res screenshot
  const settledShotPath = path.join(outDir, 'settled-final.png');
  await page.screenshot({ path: settledShotPath, fullPage: false });

  await cdp.send('Page.stopScreencast').catch(() => {});

  const raw = await page.evaluate(() => ({ events: window.__motion?.events ?? [] }));
  const derived = deriveTimeline(raw.events, { multi: caseDef.count === 5 });

  const endMs = (derived.marks?.ready ?? (caseDef.reducedMotion ? 500 : 1300)) + 150;
  const writtenFrames = derived.t0 ? await writeFramesEvery50ms(outDir, frames, derived.t0, endMs) : [];

  await context.close().catch(() => {});

  const resultRecord = {
    build: buildKey,
    caseName: caseDef.name,
    count: caseDef.count,
    width: caseDef.width,
    reducedMotion: caseDef.reducedMotion,
    derived,
    framesCount: writtenFrames.length,
    finalDom,
    screencastTotalFrames: frames.length,
    errors,
  };

  await writeFile(path.join(outDir, 'timeline.json'), JSON.stringify(resultRecord, null, 2), 'utf8');
  console.log(`[${buildKey}] ${caseDef.name} completed: ${writtenFrames.length} frames (end: ${endMs}ms)`);
  return resultRecord;
}

async function recordHeroBanner({ browser, buildKey, width }) {
  const build = BUILDS[buildKey];
  const target = parseBase(build.base);
  const outDir = path.join(MOTION_OUT, buildKey, `hero-banner-${width}`);
  await mkdir(outDir, { recursive: true });

  const context = await newContext(browser, {
    width,
    locale: 'ko',
    reducedMotion: 'no-preference',
  });
  await guardNetwork(context, target, []);
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  const cdp = await context.newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', (frame) => {
    frames.push({ t: frame.metadata.timestamp * 1000, data: frame.data });
    cdp.send('Page.screencastFrameAck', { sessionId: frame.sessionId }).catch(() => {});
  });

  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
  const t0 = Date.now();

  const url = routeUrl(target.base, 'ko', '');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Record for 4000ms
  await page.waitForTimeout(4000);

  await cdp.send('Page.stopScreencast').catch(() => {});

  // Inspect hero DOM state
  const heroDom = await page.evaluate(() => {
    const hero = document.querySelector('.v-hero');
    const scene = document.querySelector('.v-hero-scene');
    const cards = Array.from(document.querySelectorAll('.v-hcard')).length;
    const canvases = Array.from(document.querySelectorAll('.v-hero canvas')).length;
    return {
      heroPhase: hero?.dataset.phase ?? null,
      scenePhase: scene?.dataset.phase ?? null,
      cardsCount: cards,
      canvasCount: canvases,
    };
  });

  // Write frames every 100ms for 4000ms
  const written = [];
  for (let ms = 0; ms <= 4000; ms += 100) {
    const at = t0 + ms;
    let pick = null;
    for (const f of frames) {
      if (f.t <= at) pick = f;
      else break;
    }
    pick ??= frames[0];
    if (pick) {
      const name = `frame-${String(ms).padStart(4, '0')}ms.png`;
      await writeFile(path.join(outDir, name), Buffer.from(pick.data, 'base64'));
      written.push(name);
    }
  }

  await context.close().catch(() => {});
  const res = { buildKey, width, heroDom, framesCount: written.length };
  await writeFile(path.join(outDir, 'banner.json'), JSON.stringify(res, null, 2), 'utf8');
  console.log(`[${buildKey}] Hero banner ${width} recorded: ${written.length} frames`);
  return res;
}

const ALL_CASES = [
  { name: 'open-1-normal-390', count: 1, width: 390, reducedMotion: false },
  { name: 'open-1-normal-1440', count: 1, width: 1440, reducedMotion: false },
  { name: 'open-1-reduced-390', count: 1, width: 390, reducedMotion: true },
  { name: 'open-1-reduced-1440', count: 1, width: 1440, reducedMotion: true },
  { name: 'open-5-normal-390', count: 5, width: 390, reducedMotion: false },
  { name: 'open-5-normal-1440', count: 5, width: 1440, reducedMotion: false },
  { name: 'open-5-reduced-390', count: 5, width: 390, reducedMotion: true },
  { name: 'open-5-reduced-1440', count: 5, width: 1440, reducedMotion: true },
];

async function main() {
  await mkdir(MOTION_OUT, { recursive: true });
  const args = parseArgs(process.argv.slice(2), []);
  const buildFilter = args.build; // 'original' or 'result'
  const caseFilter = args.case;   // case name or 'banner' or 'compare'
  const widthFilter = args.width ? Number(args.width) : null;

  if (caseFilter === 'compare') {
    // Generate comparison file
    const comparisons = [];
    for (const c of ALL_CASES) {
      try {
        const origData = JSON.parse(await readFile(path.join(MOTION_OUT, 'original', c.name, 'timeline.json'), 'utf8'));
        const resData = JSON.parse(await readFile(path.join(MOTION_OUT, 'result', c.name, 'timeline.json'), 'utf8'));
        const durationDiffs = {};
        for (const k of Object.keys(origData.derived.durations || {})) {
          const vOrig = origData.derived.durations[k];
          const vRes = resData.derived.durations[k];
          durationDiffs[k] = { original: vOrig, result: vRes, diff: (vRes !== null && vOrig !== null) ? vRes - vOrig : null };
        }
        const orderIdentical = JSON.stringify(origData.derived.order) === JSON.stringify(resData.derived.order);
        comparisons.push({
          caseName: c.name,
          durations: durationDiffs,
          orderIdentical,
          originalOrder: origData.derived.order,
          resultOrder: resData.derived.order,
          finalDomIdentical: JSON.stringify(origData.finalDom) === JSON.stringify(resData.finalDom),
          originalFinalDom: origData.finalDom,
          resultFinalDom: resData.finalDom,
        });
      } catch (e) {
        console.warn(`Compare failed for ${c.name}: ${e.message}`);
      }
    }
    const output = { timestamp: new Date().toISOString(), comparisons };
    await writeFile(path.join(MOTION_OUT, 'motion-audit.json'), JSON.stringify(output, null, 2), 'utf8');
    console.log('Comparison saved to motion-audit.json');
    return;
  }

  const browser = await launch();
  const buildsToRun = buildFilter ? [buildFilter] : ['original', 'result'];

  for (const b of buildsToRun) {
    if (caseFilter === 'banner') {
      const widths = widthFilter ? [widthFilter] : [390, 1440];
      for (const w of widths) {
        await recordHeroBanner({ browser, buildKey: b, width: w });
      }
    } else {
      const casesToRun = caseFilter ? ALL_CASES.filter((c) => c.name === caseFilter) : ALL_CASES;
      for (const c of casesToRun) {
        await recordOpening({ browser, buildKey: b, caseDef: c });
      }
    }
  }

  await browser.close();
}

main().catch((err) => {
  console.error('Motion audit failed:', err);
  process.exit(1);
});
