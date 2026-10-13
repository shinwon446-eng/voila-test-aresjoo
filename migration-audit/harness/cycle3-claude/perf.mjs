#!/usr/bin/env node
/**
 * 샘플 후기가 화면을 띄우는 일을 얼마나 늘렸는지 어림한다(두 빌드, 한 번에 한 페이지, 세 번씩의 가운데 값).
 *   node perf.mjs
 * CDP 의 Performance.getMetrics 에서 ScriptDuration, TaskDuration, LayoutDuration, JSHeapUsedSize 를 읽는다.
 * 같은 기계에서 다른 작업이 돌고 있으므로 값은 흔들린다. 크기의 자릿수만 본다.
 */
import { open, launch, save } from './c3.mjs';

const ROUTES = ['', '/box/gaming-playstation', '/reviews', '/wins'];
const median = (list) => list.slice().sort((a, b) => a - b)[Math.floor(list.length / 2)];
const browser = await launch();
const out = [];
try {
  for (const route of ROUTES) for (const build of ['orig', 'result']) {
    const runs = [];
    for (let i = 0; i < 3; i++) {
      const t = await open(browser, build, { preset: 'guest', locale: 'ko', width: 390 });
      try {
        const cdp = await t.context.newCDPSession(t.page); await cdp.send('Performance.enable');
        await t.goto(route); await t.idle(800);
        const m = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]));
        runs.push({ script: Math.round(m.ScriptDuration * 1000), task: Math.round(m.TaskDuration * 1000), layout: Math.round(m.LayoutDuration * 1000), heapMB: +(m.JSHeapUsedSize / 1048576).toFixed(1), nodes: m.Nodes });
      } finally { await t.close(); }
    }
    const row = { route: route || '/', build, scriptMs: median(runs.map((r) => r.script)), taskMs: median(runs.map((r) => r.task)), layoutMs: median(runs.map((r) => r.layout)), heapMB: median(runs.map((r) => r.heapMB)), nodes: median(runs.map((r) => r.nodes)), runs };
    out.push(row); console.log(JSON.stringify({ ...row, runs: undefined }));
  }
} finally { await browser.close(); }
console.log('기록:', await save('perf.json', out));
