// 성능과 안정성(MISSION 12장). 두 빌드를 번갈아 돌려 기계의 흔들림을 상쇄한다. 실제 시계, 움직임 줄이기 없음.
//   node perf.mjs [--runs 7] [--only load,open,open4x,multi,scroll]
// 재는 것
//   load   첫 방문(빈 캐시)의 홈, 박스 화면, 후기 모아 보기: HTML 과 JS 의 크기(받은 바이트와 gzip 한 크기), DOM 요소 수,
//          FCP, LCP, 하이드레이션 시각(React 가 붙은 때), 긴 작업의 합(50ms 넘는 몫), 배치 이동 점수(CLS)
//   open   열기를 누른 때부터 결과 화면까지의 시간, 그 사이의 프레임 간격(20ms, 34ms, 50ms 를 넘는 프레임 수와 가장 긴 간격)
//   open4x CPU 를 4배 느리게 한 같은 측정
//   multi  10개 열기를 누른 때부터 결과 목록까지
//   scroll 박스 화면을 위에서 아래까지 굴릴 때의 프레임 간격. 결과 빌드는 후기 5건일 때와 205건으로 편 때를 따로 잰다
import { gzipSync } from 'node:zlib';
import { launch, openSession, saveJson, SEL, median, range, round } from './lib.mjs';

const argv = process.argv.slice(2);
const arg = (name, fallback) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : fallback; };
const RUNS = Number(arg('runs', 7));
const ONLY = String(arg('only', 'load,open,open4x,multi,scroll')).split(',');
const SUFFIX = arg('out', '');
const browser = await launch();
const raw = { runs: RUNS, startedAt: new Date().toISOString(), load: [], open: [], open4x: [], multi: [], scroll: [] };

const INIT = () => {
  window.__perf = { ls: 0, lsN: 0, lt: [], lcp: 0, hyd: null, fcp: null };
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__perf.ls += e.value; window.__perf.lsN += 1; } }).observe({ type: 'layout-shift', buffered: true }); } catch { /* 없음 */ }
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch { /* 없음 */ }
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch { /* 없음 */ }
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__perf.fcp = e.startTime; }).observe({ type: 'paint', buffered: true }); } catch { /* 없음 */ }
  const probe = () => {
    const el = document.querySelector('.v-header button, .v-header a, .v-main button, .v-main a');
    if (el && Object.keys(el).some((k) => k.startsWith('__reactProps') || k.startsWith('__reactFiber'))) { window.__perf.hyd = performance.now(); return; }
    setTimeout(probe, 4);
  };
  probe();
};

async function loadOnce(build, route, width, run) {
  const t = await openSession(browser, build, { preset: 'guest', width, reducedMotion: 'no-preference', fixedClock: false });
  const sizes = {}; const bodies = [];
  t.page.on('requestfinished', (req) => { bodies.push((async () => {
    const type = req.resourceType(); const s = await req.sizes().catch(() => null); if (!s) return;
    const slot = (sizes[type] ??= { n: 0, transfer: 0, body: 0, gzip: 0 });
    slot.n += 1; slot.transfer += s.responseBodySize + s.responseHeadersSize; slot.body += s.responseBodySize;
    if (['document', 'script', 'stylesheet'].includes(type)) { const res = await req.response(); const buf = await res?.body().catch(() => null); if (buf) slot.gzip += gzipSync(buf).length; }
  })()); });
  await t.page.addInitScript(INIT);
  try {
    await t.page.goto(t.url(route), { waitUntil: 'load', timeout: 45000 });
    await t.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await t.page.waitForTimeout(1200);
    await Promise.all(bodies);
    const m = await t.page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const p = window.__perf;
      const tbt = p.lt.reduce((s, [, d]) => s + Math.max(0, d - 50), 0);
      const lastLong = p.lt.reduce((s, [st, d]) => Math.max(s, st + d), 0);
      return { dcl: nav.domContentLoadedEventEnd, load: nav.loadEventEnd, fcp: p.fcp, lcp: p.lcp, hyd: p.hyd, tti: Math.max(p.hyd ?? 0, lastLong), tbt, longTasks: p.lt.length, longest: p.lt.reduce((s, [, d]) => Math.max(s, d), 0), cls: p.ls, shifts: p.lsN, dom: document.getElementsByTagName('*').length, imgs: document.images.length, htmlBytes: nav.decodedBodySize };
    });
    raw.load.push({ build, route, width, run, ...m, sizes, errors: t.errors.length });
  } finally { await t.close(); }
}

/** 열기에서 결과까지. 페이지 안에서 누른 때와 결과가 뜬 때를 재고 그 사이의 프레임 간격을 모은다 */
async function openOnce(build, kind, run, throttle) {
  const t = await openSession(browser, build, { preset: 'funded', width: 390, reducedMotion: 'no-preference', fixedClock: false });
  try {
    await t.goto('/box/dollar-apple'); await t.wait(SEL.open); await t.settle({ quiet: 600 });
    if (kind === 'multi') await t.click(SEL.qty, 2);
    const client = await t.context.newCDPSession(t.page);
    if (throttle > 1) await client.send('Emulation.setCPUThrottlingRate', { rate: throttle });
    await t.page.evaluate((doneSel) => {
      const p = (window.__open = { press: null, shown: null, done: null, frames: [], phases: [] });
      const btn = document.querySelector('[data-open-primary]');
      btn.addEventListener('click', () => { if (p.press !== null) return; p.press = performance.now(); let last = p.press; const tick = (now) => { p.frames.push(now - last); last = now; if (p.done === null) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }, { capture: true });
      new MutationObserver(() => {
        const op = document.querySelector('.v-op');
        if (op && p.shown === null && p.press !== null) p.shown = performance.now();
        if (op && p.press !== null) { const ph = op.dataset.phase + '/' + op.dataset.openingState; if (p.phases.at(-1)?.[0] !== ph) p.phases.push([ph, performance.now()]); }
        if (p.done === null && p.press !== null && document.querySelector(doneSel)) p.done = performance.now();
      }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-opening-state', 'data-phase', 'class'] });
    }, kind === 'multi' ? '.v-reveal-result' : SEL.opSettled);
    await t.click(SEL.open);
    if (await t.page.locator(SEL.alert).first().waitFor({ state: 'visible', timeout: 800 }).then(() => true, () => false)) await t.confirm();
    await t.page.waitForFunction(() => window.__open.done !== null, null, { timeout: 60000 });
    await t.page.waitForTimeout(300);
    const m = await t.page.evaluate(() => { const p = window.__open; const f = p.frames.slice(1); return { toShown: p.shown - p.press, toDone: p.done - p.press, frames: f.length, over20: f.filter((d) => d > 20).length, over34: f.filter((d) => d > 34).length, over50: f.filter((d) => d > 50).length, maxFrame: Math.max(...f), phases: p.phases.map(([ph, at]) => [ph, Math.round(at - p.press)]) }; });
    if (throttle > 1) await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const s = await t.storage();
    raw[kind === 'multi' ? 'multi' : throttle > 1 ? 'open4x' : 'open'].push({ build, run, ...m, nonce: s['gachaflix.fair']?.state?.nonce, errors: t.errors.length });
  } finally { await t.close(); }
}

/** 박스 화면을 위에서 아래까지 굴린다(프레임마다 240px). expand: 후기 목록의 더 보기를 누르는 횟수 */
async function scrollOnce(build, slug, expand, run, label) {
  const t = await openSession(browser, build, { preset: 'guest', width: 390, reducedMotion: 'no-preference', fixedClock: false });
  try {
    await t.goto('/box/' + slug); await t.wait('#reviews'); await t.settle({ quiet: 500 });
    let clicks = 0;
    for (; clicks < expand; clicks++) { const more = t.page.locator('[data-reviews-more]'); if (!(await more.isVisible().catch(() => false))) break; await more.click(); await t.page.waitForTimeout(120); }
    await t.page.evaluate(() => window.scrollTo(0, 0)); await t.page.waitForTimeout(400);
    const m = await t.page.evaluate(() => new Promise((resolve) => {
      const frames = []; let last = performance.now(); const start = last;
      const max = document.documentElement.scrollHeight - innerHeight;
      const tick = (now) => { frames.push(now - last); last = now; const y = Math.min(max, scrollY + 240); window.scrollTo(0, y); if (y >= max) { resolve({ ms: now - start, frames: frames.length, over20: frames.filter((d) => d > 20).length, over34: frames.filter((d) => d > 34).length, over50: frames.filter((d) => d > 50).length, maxFrame: Math.max(...frames.slice(1)), height: max + innerHeight, dom: document.getElementsByTagName('*').length, rows: document.querySelectorAll('.v-rv, .v-rvcard').length, imgs: document.images.length }); return; } requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }));
    raw.scroll.push({ build, label, slug, run, clicks, ...m, pxPerMs: round(m.height / m.ms, 2), errors: t.errors.length });
  } finally { await t.close(); }
}

try {
  for (let run = 1; run <= RUNS; run++) {
    // 번갈아 돌린다. 홀수 회차는 원본 먼저, 짝수 회차는 결과 먼저
    const order = run % 2 ? ['orig', 'result'] : ['result', 'orig'];
    if (ONLY.includes('load')) for (const [route, width] of [['', 390], ['/box/watch-rolex', 390], ['/reviews', 390], ['', 1440], ['/box/dollar-apple', 390]]) for (const build of order) await loadOnce(build, route, width, run);
    if (ONLY.includes('open')) for (const build of order) await openOnce(build, 'open', run, 1);
    if (ONLY.includes('open4x')) for (const build of order) await openOnce(build, 'open', run, 4);
    if (ONLY.includes('multi')) for (const build of order) await openOnce(build, 'multi', run, 1);
    if (ONLY.includes('scroll')) {
      for (const build of order) await scrollOnce(build, 'watch-rolex', 0, run, build === 'orig' ? 'orig' : 'result-5');
      await scrollOnce('result', 'watch-rolex', 10, run, 'result-205');
      for (const build of order) await scrollOnce(build, 'dollar-apple', 0, run, build === 'orig' ? 'orig-legacy' : 'result-legacy-5');
    }
    if (ONLY.includes('scroll200')) { for (const build of order) await scrollOnce(build, 'dollar-apple', 0, run, build === 'orig' ? 'orig-legacy' : 'result-legacy-5'); await scrollOnce('result', 'dollar-apple', 10, run, 'result-legacy-205'); await scrollOnce('result', 'dollar-apple', 30, run, 'result-legacy-all'); }
    console.log('회차', run, '끝');
    await saveJson('perf-raw' + SUFFIX + '.json', raw);
  }
} finally { await browser.close(); }

// 요약: 가운데 값과 범위
const stat = (list) => ({ median: round(median(list), 1), min: round(range(list)[0], 1), max: round(range(list)[1], 1), n: list.length });
const summary = { runs: RUNS, load: {}, open: {}, open4x: {}, multi: {}, scroll: {} };
const group = (rows, keyOf) => rows.reduce((acc, r) => { (acc[keyOf(r)] ??= []).push(r); return acc; }, {});
for (const [key, rows] of Object.entries(group(raw.load, (r) => `${r.route || '/'}@${r.width}|${r.build}`))) {
  const pick = (f) => stat(rows.map(f));
  summary.load[key] = { fcp: pick((r) => r.fcp), lcp: pick((r) => r.lcp), hyd: pick((r) => r.hyd), tti: pick((r) => r.tti), tbt: pick((r) => r.tbt), longest: pick((r) => r.longest), cls: { median: round(median(rows.map((r) => r.cls)), 4), min: round(Math.min(...rows.map((r) => r.cls)), 4), max: round(Math.max(...rows.map((r) => r.cls)), 4) }, dom: pick((r) => r.dom), imgs: pick((r) => r.imgs), dcl: pick((r) => r.dcl), load: pick((r) => r.load),
    html: { body: rows[0].sizes.document?.body, gzip: rows[0].sizes.document?.gzip }, js: { n: rows[0].sizes.script?.n, body: rows[0].sizes.script?.body, gzip: rows[0].sizes.script?.gzip }, css: { body: rows[0].sizes.stylesheet?.body, gzip: rows[0].sizes.stylesheet?.gzip }, image: { n: stat(rows.map((r) => r.sizes.image?.n ?? 0)), body: stat(rows.map((r) => r.sizes.image?.body ?? 0)) }, fetch: { n: stat(rows.map((r) => r.sizes.fetch?.n ?? 0)), body: stat(rows.map((r) => r.sizes.fetch?.body ?? 0)) }, font: rows[0].sizes.font ?? null };
}
for (const kind of ['open', 'open4x', 'multi']) for (const [key, rows] of Object.entries(group(raw[kind], (r) => r.build))) summary[kind][key] = { toShown: stat(rows.map((r) => r.toShown)), toDone: stat(rows.map((r) => r.toDone)), frames: stat(rows.map((r) => r.frames)), over20: stat(rows.map((r) => r.over20)), over34: stat(rows.map((r) => r.over34)), over50: stat(rows.map((r) => r.over50)), maxFrame: stat(rows.map((r) => r.maxFrame)), nonce: [...new Set(rows.map((r) => r.nonce))] };
for (const [key, rows] of Object.entries(group(raw.scroll, (r) => r.label))) summary.scroll[key] = { rows: rows[0].rows, dom: rows[0].dom, height: rows[0].height, imgs: rows[0].imgs, ms: stat(rows.map((r) => r.ms)), frames: stat(rows.map((r) => r.frames)), over20: stat(rows.map((r) => r.over20)), over34: stat(rows.map((r) => r.over34)), over50: stat(rows.map((r) => r.over50)), maxFrame: stat(rows.map((r) => r.maxFrame)) };
await saveJson('perf-summary' + SUFFIX + '.json', summary);
console.log(JSON.stringify(summary, null, 1));
