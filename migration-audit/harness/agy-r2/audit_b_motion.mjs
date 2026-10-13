import fs from 'node:fs';
import path from 'node:path';
import { launch, newContext, routeUrl, parseBase, settle, makeFixedState, installState, tickClock } from '../lib/common.mjs';

const origBase = parseBase('http://127.0.0.1:4175/voila-test-aresjoo');
const resBase = parseBase('http://127.0.0.1:4176/voila-test-aresjoo');

const motionDir = 'migration-audit/motion/r2-agy';
fs.mkdirSync(motionDir, { recursive: true });

// Seeds identified in testing:
// below: 'parity-audit-client-seed' -> roll 867322 (0.15x)
// above: 'seed-above-1' -> roll 177473 (1.33x)
// top: 'seed-top-1916' -> roll 18 (475x)
const TONES = [
  { tone: 'below', clientSeed: 'parity-audit-client-seed' },
  { tone: 'above', clientSeed: 'seed-above-1' },
  { tone: 'top', clientSeed: 'seed-top-1916' },
];

const CONFIGS = [
  // Widths 390 and 1440, normal and reduced motion, 1 box and 10 boxes
  { width: 390, reducedMotion: 'no-preference', count: 1 },
  { width: 390, reducedMotion: 'reduce', count: 1 },
  { width: 390, reducedMotion: 'no-preference', count: 10 },
  { width: 390, reducedMotion: 'reduce', count: 10 },
  { width: 1440, reducedMotion: 'no-preference', count: 1 },
  { width: 1440, reducedMotion: 'reduce', count: 1 },
  { width: 1440, reducedMotion: 'no-preference', count: 10 },
  { width: 1440, reducedMotion: 'reduce', count: 10 },
];

// Injected instrumentation code
const INSTRUMENT_SCRIPT = `
window.__auditAudioCalls = [];
window.__auditVibrateCalls = [];
window.__auditPhaseLog = [];

// Intercept AudioContext
if (window.AudioContext) {
  const OrigAudioCtx = window.AudioContext;
  window.AudioContext = function(...args) {
    const ctx = new OrigAudioCtx(...args);
    window.__auditAudioCalls.push({ type: 'AudioContext_create', at: performance.now() });
    const origCreateOsc = ctx.createOscillator.bind(ctx);
    ctx.createOscillator = function() {
      const osc = origCreateOsc();
      const origStart = osc.start.bind(osc);
      osc.start = function(...sArgs) {
        window.__auditAudioCalls.push({
          type: 'oscillator_start',
          freq: osc.frequency.value,
          oscType: osc.type,
          at: performance.now()
        });
        return origStart(...sArgs);
      };
      return osc;
    };
    return ctx;
  };
}

// Intercept HTMLAudioElement
const origPlay = HTMLAudioElement.prototype.play;
HTMLAudioElement.prototype.play = function() {
  window.__auditAudioCalls.push({ type: 'audio_play', src: this.src, at: performance.now() });
  return origPlay.apply(this, arguments);
};

// Intercept navigator.vibrate
if (navigator.vibrate) {
  const origVibrate = navigator.vibrate.bind(navigator);
  navigator.vibrate = function(pattern) {
    window.__auditVibrateCalls.push({ pattern, at: performance.now() });
    return origVibrate(pattern);
  };
}

// Monitor data-phase changes
const obs = new MutationObserver(() => {
  const el = document.querySelector('.v-op, .v-reveal, .v-op-scene');
  if (el) {
    const phase = el.getAttribute('data-phase');
    const armed = el.hasAttribute('data-armed') || Boolean(document.querySelector('[data-armed]'));
    const last = window.__auditPhaseLog[window.__auditPhaseLog.length - 1];
    if (!last || last.phase !== phase || last.armed !== armed) {
      window.__auditPhaseLog.push({ phase, armed, at: performance.now() });
    }
  }
});
obs.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['data-phase', 'data-armed'] });
`;

async function recordOpeningSequence(browser, { baseUrl, buildName, tone, clientSeed, width, reducedMotion, count }) {
  const tag = `${buildName}_tone-${tone}_count-${count}_w-${width}_motion-${reducedMotion === 'reduce' ? 'red' : 'norm'}`;
  console.log(`[RECORD] ${tag}`);

  // Need sound enabled: openSound: true in settingsStore
  const soundSettings = {
    state: {
      openSound: true,
      openSpeed: 'normal',
      quickOpen: false,
    },
    version: 0,
  };

  const overrides = {
    'gachaflix.fair': JSON.stringify({
      state: {
        serverSeed: 'parity-audit-server-seed-0001',
        serverSeedHash: '24bb857459d501933bf8e8e3081536e482a8360e894a3ed4e8929e0b1c2759ff',
        clientSeed,
        nonce: 0,
      },
      version: 0,
    }),
    'gachaflix.settings': JSON.stringify(soundSettings),
    'voila.settings.v1': JSON.stringify(soundSettings),
  };

  const state = await makeFixedState('funded', 'ko', overrides);
  const context = await newContext(browser, { width, locale: 'ko', reducedMotion });
  await installState(context, state, baseUrl.origin);

  const page = await context.newPage();
  await page.addInitScript({ content: INSTRUMENT_SCRIPT });

  const url = routeUrl(baseUrl.base, 'ko', '/box/gaming-playstation');
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await settle(page);

  // If count is 10, select 10
  if (count === 10) {
    const chip10 = await page.$('.v-openbar .v-chip:has-text("10"), button:has-text("10개"), [data-count="10"]');
    if (chip10) {
      await chip10.click();
      await page.waitForTimeout(100);
    }
  }

  // Find open button
  const openBtn = await page.$('.v-openbar button.v-btn, [data-open-primary]');
  if (!openBtn) {
    console.error(`Open button not found on ${url}`);
    await context.close();
    return null;
  }

  // Click open button
  await openBtn.click();

  // If confirmation dialog appears, wait 600ms before pressing confirm button
  const confirmBtn = await page.$('[role="alertdialog"] .v-btn, [role="dialog"] .v-btn--primary, .v-sheet .v-btn');
  if (confirmBtn) {
    // RESULT confirm dialog ignores presses for 350ms, wait 600ms
    await page.waitForTimeout(600);
    await confirmBtn.click();
  }

  // Sample frames every 50 ms for 1800 ms (total 36 frames)
  const startTime = Date.now();
  const frames = [];
  const totalDuration = 1800; // ms
  const interval = 50; // ms

  for (let t = 0; t <= totalDuration; t += interval) {
    const elapsed = Date.now() - startTime;
    // Capture state
    const info = await page.evaluate(() => {
      const op = document.querySelector('.v-op, .v-reveal');
      const photo = document.querySelector('.v-op-photo img, .v-reveal-result img');
      const halo = document.querySelector('.v-op-halo');
      const floor = document.querySelector('.v-op-floor');
      const status = document.querySelector('.v-op-status, .v-reveal-head');
      const armed = document.querySelector('[data-armed]') !== null;

      let photoTransform = null;
      if (photo) photoTransform = getComputedStyle(photo).transform;

      let haloOpacity = null;
      let haloTransform = null;
      if (halo) {
        const s = getComputedStyle(halo);
        haloOpacity = s.opacity;
        haloTransform = s.transform;
      }

      let floorOpacity = null;
      let floorTransform = null;
      if (floor) {
        const s = getComputedStyle(floor);
        floorOpacity = s.opacity;
        floorTransform = s.transform;
      }

      return {
        phase: op ? op.getAttribute('data-phase') : null,
        tone: op ? op.getAttribute('data-tone') : null,
        armed,
        photoTransform,
        haloOpacity,
        haloTransform,
        floorOpacity,
        floorTransform,
        hasResult: Boolean(document.querySelector('.v-op-result, .v-reveal-result')),
      };
    });

    const frameFile = `frame_${tag}_${String(t).padStart(4, '0')}ms.png`;
    const framePath = path.join(motionDir, frameFile);
    await page.screenshot({ path: framePath });

    frames.push({
      timeMs: t,
      elapsedMs: elapsed,
      info,
      frameFile,
    });

    await page.waitForTimeout(interval);
  }

  // Collect final instrument logs
  const logs = await page.evaluate(() => ({
    audioCalls: window.__auditAudioCalls || [],
    vibrateCalls: window.__auditVibrateCalls || [],
    phases: window.__auditPhaseLog || [],
  }));

  await context.close();

  return {
    tag,
    buildName,
    tone,
    count,
    width,
    reducedMotion,
    frames,
    logs,
  };
}

export async function runMotionAudit() {
  console.log('Starting Part (B) Motion & Animation Audit...');
  const browser = await launch();
  const results = [];

  for (const toneDef of TONES) {
    for (const cfg of CONFIGS) {
      console.log(`Running tone=${toneDef.tone}, w=${cfg.width}, motion=${cfg.reducedMotion}, count=${cfg.count}...`);

      const origRes = await recordOpeningSequence(browser, {
        baseUrl: origBase,
        buildName: 'ORIG',
        tone: toneDef.tone,
        clientSeed: toneDef.clientSeed,
        width: cfg.width,
        reducedMotion: cfg.reducedMotion,
        count: cfg.count,
      });

      const resRes = await recordOpeningSequence(browser, {
        baseUrl: resBase,
        buildName: 'RES',
        tone: toneDef.tone,
        clientSeed: toneDef.clientSeed,
        width: cfg.width,
        reducedMotion: cfg.reducedMotion,
        count: cfg.count,
      });

      results.push({
        tone: toneDef.tone,
        config: cfg,
        orig: origRes,
        res: resRes,
      });
    }
  }

  await browser.close();

  const outPath = 'migration-audit/harness/agy-r2/audit_b_results.json';
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Part (B) Complete! Output written to ${outPath}`);
}

if (process.argv[1] === import.meta.filename) {
  runMotionAudit().catch(err => {
    console.error('Fatal error in motion audit:', err);
    process.exit(1);
  });
}
