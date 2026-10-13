#!/usr/bin/env node
/**
 * 2차 라운드 최종 실행(after-final3)의 기록에서 보고서에 쓸 숫자를 모아 찍는다. 기록을 읽기만 한다.
 *   node tools/r3-numbers.mjs [shots|variants|flows|motion ...]   (없으면 전부)
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const M = 'C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit';
const want = new Set(process.argv.slice(2));
const on = (k) => want.size === 0 || want.has(k);
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
const H = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');
const D = M + '/screenshots/diff/after-final3-vs-baseline-local';
const labelOf = (r) => (r.label === 'intended' ? (r.checked ? 'intended 확인함' : 'intended 확인 못 함') : r.label);
const count = (list, key) => { const m = {}; for (const x of list) { const k = key(x); m[k] = (m[k] || 0) + 1; } return m; };

if (on('shots')) {
  const s = json(D + '/summary.json');
  console.log('## shots');
  console.log('A', JSON.stringify(s.a).slice(0, 400));
  console.log('B', JSON.stringify(s.b).slice(0, 400));
  console.log('kinds', JSON.stringify(s.kinds), 'flags', JSON.stringify(s.flagCounts));
  for (const d of ['baseline-local', 'after-final3']) {
    let png = 0, region = 0, rec = 0, titles = 0;
    const walk = (dir) => { for (const e of readdirSync(dir, { withFileTypes: true })) { const p = dir + '/' + e.name; if (e.isDirectory()) walk(p); else if (e.name.endsWith('.png')) { if (e.name.includes('~')) region++; else png++; } else if (e.name.endsWith('.json') && e.name !== 'index.json') { rec++; try { const j = json(p); const t = j.measure?.titles ?? j.titles; if (Array.isArray(t)) titles += t.length; } catch { /* 기록이 아니다 */ } } } };
    walk(M + '/screenshots/after/' + d);
    console.log(d, '촬영 그림', png, '영역 그림', region, '기록', rec, 'title 속성', titles);
  }
  for (const name of ['classified.first-pass.json', 'classified.json']) {
    if (!existsSync(D + '/' + name)) { console.log(name, '없음'); continue; }
    const c = json(D + '/' + name);
    console.log('--', name, JSON.stringify(c.totals));
    if (name === 'classified.json') {
      console.log('byGroup', JSON.stringify(c.byGroup));
      console.log('byRule', JSON.stringify(c.byRule));
      console.log('regionStats', JSON.stringify(c.regionStats));
      console.log('확인 못 함', JSON.stringify(count(c.rows.filter((r) => r.label === 'intended' && !r.checked), (r) => r.id.split('/').slice(0, 2).join('/') + ' [' + (r.rules || []).join(',') + ']')));
      console.log('added', JSON.stringify(count(c.rows.filter((r) => r.group === 'added'), (r) => r.id.split('/')[1] + ' | ' + r.id.split('__')[1] + ' | ' + labelOf(r) + ' | ' + (r.rules || []).join(',')), null, 1));
      console.log('loading', JSON.stringify(count(c.rows.filter((r) => r.group === 'loading'), (r) => r.id.split('/')[1] + ' ' + labelOf(r))));
      console.log('noise 의 눈에 띄는 픽셀 최대', Math.max(0, ...c.rows.filter((r) => r.label === 'noise').map((r) => r.solid || 0)));
    }
    for (const r of c.rows.filter((r) => /UNEXPLAINED|within-build|not-compared/.test(r.label))) console.log('  ', r.label, r.id, JSON.stringify(r.why).slice(0, 420));
  }
  const m = {};
  for (const r of s.rows) for (const [k, v] of Object.entries(r.regions || {})) { const key = k.replace(/-\d+$/, ''); if (['dialog', 'target', 'chips', 'header', 'hero', 'empty'].includes(key) && !['same', 'noise'].includes(v.state)) { const kk = key + ' ' + v.state + ' ' + r.id.split('/').slice(0, 2).join('/'); m[kk] = (m[kk] || 0) + 1; } }
  console.log('달라진 영역', JSON.stringify(m, null, 1));
}

if (on('variants')) {
  console.log('## variants');
  const sets = { 'baseline 63445c7 (r3-repeat)': M + '/qa/r3-repeat/baseline', 'after-final3 f830d9e (r3-repeat)': M + '/qa/r3-repeat/after-final3', 'after-final3 f830d9e (desktop 24)': M + '/qa/r3-repeat-desktop/after-final3' };
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : /~(hero|header)\.png$/.test(e.name) ? [path.join(dir, e.name)] : []));
  const index = {};
  for (const [name, dir] of Object.entries(sets)) {
    if (!existsSync(dir)) { console.log(name, '없음'); continue; }
    const runs = readdirSync(dir).filter((d) => /^run-\d+$/.test(d));
    const by = new Map();
    for (const run of runs) for (const f of walk(path.join(dir, run))) { const id = path.relative(path.join(dir, run), f).split(path.sep).join('/'); if (!by.has(id)) by.set(id, []); by.get(id).push(f); }
    index[name] = by;
    for (const region of ['hero', 'header']) {
      const b = { shots: 0, varied: 0, captures: 0, same: 0, sub: 0, small: 0, mid: 0, big: 0, sizes: {}, where: {} };
      for (const [id, files] of by) {
        if (!id.endsWith('~' + region + '.png')) continue;
        b.shots++;
        const hs = files.map(H);
        const c = count(hs, (h) => h);
        if (Object.keys(c).length > 1) b.varied++;
        const ref = Object.entries(c).sort((x, y) => y[1] - x[1])[0][0];
        const refPng = PNG.sync.read(readFileSync(files[hs.indexOf(ref)]));
        const dist = {};
        files.forEach((f, i) => {
          b.captures++;
          if (hs[i] === ref) { b.same++; return; }
          if (!(hs[i] in dist)) { const p = PNG.sync.read(readFileSync(f)); dist[hs[i]] = p.width === refPng.width && p.height === refPng.height ? pixelmatch(refPng.data, p.data, null, p.width, p.height, { threshold: 0.1, includeAA: false }) : -1; }
          const d = dist[hs[i]];
          if (d === 0) b.sub++; else if (d > 0 && d <= 10) b.small++; else { if (d < 1000 && d > 0) b.mid++; else b.big++; b.sizes[d] = (b.sizes[d] || 0) + 1; b.where[id] = (b.where[id] || 0) + 1; }
        });
      }
      console.log(`${name} | ${region} | 촬영 ${b.shots}종(여러 가지 ${b.varied}종), 그림 ${b.captures}장 | 흔한 그림과 같음 ${b.same} | 눈에 안 띔 ${b.sub} | 1~10 ${b.small} | 11~999 ${b.mid} | 1000 이상 ${b.big} | 크기 ${JSON.stringify(b.sizes)} | ${JSON.stringify(b.where)}`);
    }
  }
  if (existsSync(M + '/qa/r3-variants.json')) {
    const v = json(M + '/qa/r3-variants.json');
    console.log('byRegion [견준, 둘 다 한 가지, A 여러, B 여러, 같은 그림 있음, 빌드 안 최대, 빌드 사이 최대, 같은 그림 없음]', JSON.stringify(Object.fromEntries(Object.entries(v.byRegion).map(([k, e]) => [k, [e.compared, e.stableBoth, e.variedA, e.variedB, e.withSharedImage, e.maxWithinSolid, e.maxCrossSolid, e.crossOnly.length]]))));
    for (const r of v.rows.filter((r) => /~(hero|header)/.test(r.id) && (r.withinA.length > 1 || r.withinB.length > 1) && /header|hero/.test(r.region))) console.log('  ', r.id, 'A', JSON.stringify(r.withinA), 'B', JSON.stringify(r.withinB), 'shared', r.shared, 'withinA', r.maxWithinA.solid, 'withinB', r.maxWithinB.solid, 'cross', r.maxCross.solid);
  }
  // 본 측정에서 달랐던 영역: 본 측정의 두 그림이 반복 측정의 어느 쪽에 몇 번 나오는가, 차이의 자리
  if (existsSync(D + '/classified.first-pass.json')) {
    const c = json(D + '/classified.first-pass.json');
    const s = json(D + '/summary.json');
    for (const r of c.rows.filter((r) => r.label === 'UNEXPLAINED')) {
      const row = s.rows.find((x) => x.id === r.id);
      for (const [k, v] of Object.entries(row?.regions || {})) {
        if (['same', 'noise', 'aa-shift'].includes(v.state)) continue;
        const rel = r.id + '~' + k + '.png';
        const fa = M + '/screenshots/after/baseline-local/' + rel, fb = M + '/screenshots/after/after-final3/' + rel;
        if (!existsSync(fa) || !existsSync(fb)) { console.log('  본 측정', rel, v.state, '(한쪽 그림 없음)'); continue; }
        const ha = H(fa), hb = H(fb);
        const out = [];
        for (const [name, by] of Object.entries(index)) { const files = by.get(rel) ?? []; const hs = files.map(H); out.push(`${name.split(' ')[0]}: n${hs.length} A꼴 ${hs.filter((h) => h === ha).length} B꼴 ${hs.filter((h) => h === hb).length}`); }
        const a = PNG.sync.read(readFileSync(fa)), b = PNG.sync.read(readFileSync(fb));
        let box = '크기 다름';
        if (a.width === b.width && a.height === b.height) {
          const o = new PNG({ width: a.width, height: a.height });
          const n = pixelmatch(a.data, b.data, o.data, a.width, a.height, { threshold: 0.1, includeAA: false, diffMask: true });
          let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
          for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) if (o.data[(y * a.width + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
          box = `${n}픽셀, x ${x0}..${x1}, y ${y0}..${y1} (${a.width}x${a.height})`;
        }
        console.log('  본 측정', rel, v.state, '|', box, '|', out.join(' | '));
      }
    }
  }
}

if (on('flows')) {
  console.log('## flows');
  const f = json(M + '/flows/compare-after-final3/flows-compare.json');
  console.log(JSON.stringify(f.totals), JSON.stringify(f.fieldTotals), JSON.stringify(f.a).slice(0, 200), JSON.stringify(f.b).slice(0, 200));
  const by = {}, byV = {};
  for (const s of f.scenarios) {
    const e = (by[s.scenario] ??= { title: s.title, v: {}, rules: new Set(), ledgerCompared: 0, ledgerDiff: 0, runs: 0, stopped: 0 });
    e.runs++; if (s.statusA !== 'done' || s.statusB !== 'done') e.stopped++;
    const ev = (byV[s.key.split(' ')[1]] ??= {});
    for (const st of s.steps) { e.v[st.verdict] = (e.v[st.verdict] || 0) + 1; ev[st.verdict] = (ev[st.verdict] || 0) + 1; (st.rules || []).forEach((r) => e.rules.add(r)); if (st.ledgerCompared) e.ledgerCompared++; if ((st.fields || []).some((x) => x.kind === 'ledger')) e.ledgerDiff++; for (const x of (st.fields || []).filter((x) => x.kind !== 'rule')) console.log('  (규칙 밖)', s.key, st.n, st.name, x.kind, x.path, JSON.stringify(x.a).slice(0, 100), '=>', JSON.stringify(x.b).slice(0, 100)); }
  }
  for (const [k, e] of Object.entries(by)) console.log(`| ${k} ${e.title} | ${e.runs}${e.stopped ? ' (멈춤 ' + e.stopped + ')' : ''} | ${e.v['같음'] || 0} | ${e.v['의도된 차이'] || 0} | ${e.v['설명 안 됨'] || 0} | ${e.v['장부 다름'] || 0} | ${e.v['검증 불가'] || 0} | ${e.v['한쪽만 실행'] || 0} | ${e.v['오류'] || 0} | ${e.ledgerDiff ? '다름 ' + e.ledgerDiff : '같음'} (${e.ledgerCompared}단계) | ${Array.from(e.rules).join(', ') || '없음'} |`);
  console.log(JSON.stringify(byV));
  for (const l of ['r3-before-local', 'after-final3']) {
    const g = json(M + '/flows/' + l + '/flows.json');
    console.log(l, '시나리오', g.scenarios.length, '멈춤', g.scenarios.filter((s) => s.status !== 'done').map((s) => s.key + ' ' + s.variant).join(', ') || '없음');
    for (const s of g.scenarios.filter((s) => s.key === 'J2')) console.log('  J2', s.variant, s.status, s.steps.filter((x) => x.notes?.own).map((x) => `${x.n}:${x.notes.own.cards}장 중 ${x.notes.own.ownIndex}`).join(' | '));
    for (const s of g.scenarios.filter((s) => s.key === 'J')) console.log('  J', s.variant, s.steps.filter((x) => x.notes?.branch).map((x) => x.notes.branch).join(','));
  }
}

if (on('motion')) {
  console.log('## motion');
  for (const cfg of ['', '-en-1440']) {
    const p = M + '/motion/compare-after-final3' + cfg + '/motion-compare.json';
    if (!existsSync(p)) { console.log(cfg || 'ko-390', '없음'); continue; }
    const s = json(p);
    console.log('== ', cfg || 'ko-390', s.a.label, s.b.label, '경우', s.cases.length);
    const pick = (k) => s.cases.filter((c) => c[k] === false).map((c) => c.key).join(',') || '없음';
    console.log('순서 다름', pick('orderSame'), '| 애니 다름', pick('animationsSame'), '| 효과 다름', pick('effectsSame'), '| 호출 다름', pick('callsSame'), '| 끝난 뒤 장부 다름', pick('ledgerAfterSame'), '| 끼어들기 다름', s.interrupts.filter((r) => !r.allSame).map((r) => r.key).join(',') || '없음', '| 끼어들기 단계', s.interrupts.reduce((n, r) => n + (r.steps?.length ?? 0), 0));
    console.log('실행 수', s.cases.map((c) => c.key + ' ' + c.okRunsA + ' ' + c.okRunsB).filter((x) => !/ 3\/3 3\/3$/.test(x)).join('; ') || '전부 3/3');
    console.log('볼 것', s.cases.flatMap((c) => c.phases.filter((p) => p.look).map((p) => `${c.key} ${p.phase} ${p.a}/${p.b} (${p.delta})`)).join('; ') || '없음');
    const apart = s.cases.flatMap((c) => c.phases.filter((p) => p.apart).map((p) => ({ key: c.key, ...p })));
    console.log('겹치지 않는 칸', apart.length, JSON.stringify(count(apart, (p) => p.phase + (p.delta > 0 ? ' +' : ' -'))));
    const normal = s.cases.filter((c) => c.key !== 'one-slow4x').flatMap((c) => c.phases.filter((p) => p.delta !== null).map((p) => p.delta));
    console.log('보통 조건의 차이 범위', Math.min(...normal), Math.max(...normal));
    console.log('누름→화면의 차이', s.cases.map((c) => c.key + ' ' + c.phases[0].delta).join(', '));
    console.log('장부가 먼저', s.cases.every((c) => c.ledgerBeforeRevealA.every(Boolean) && c.ledgerBeforeRevealB.every(Boolean) && c.ledgerBeforeOverlayA.every(Boolean) && c.ledgerBeforeOverlayB.every(Boolean)));
    console.log('호출 수(A 첫 실행)', s.cases.map((c) => c.key + ' ' + c.callsA.length + '(전 ' + c.callsA.filter((x) => x.startsWith('누르기 전:')).length + ', 진동 ' + c.callsA.filter((x) => /vibrate/.test(x)).length + ')').join(', '));
    console.log('효과', s.cases.map((c) => { const e = c.effectsA; return c.key + ': ' + (e ? (e.root === 'v-op' ? `${e.tone} ${e.kind}${e.brand ? ' 상표띠' : ''}${e.halo ? ' 후광' : ''}${e.photo ? ' 사진' : ''}${e.amount ? ' 금액칸' : ''}` : `줄 ${e.rows}${e.best ? ' 최고칸 있음' : ' 최고칸 없음'}`) : '없음'); }).join(' | '));
    console.log(readFileSync(M + '/motion/compare-after-final3' + cfg + '/MOTION_COMPARE.md', 'utf8').split('## 두 빌드의 값이 겹치지')[0].split('## 단계별 길이의 차이')[1].split('\n').filter((l) => l.startsWith('|')).map((l) => l.split(' | ').slice(0, 8).join(' | ') + ' |').join('\n'));
  }
  const R = M + '/motion/rerun-r3';
  for (const l of ['before-local', 'after-final3', 'before-local-reviews-hidden', 'after-final3-reviews-hidden']) {
    if (!existsSync(R + '/' + l + '/motion.json')) { console.log(l, '없음'); continue; }
    for (const c of json(R + '/' + l + '/motion.json').cases) console.log(l.padEnd(30), c.key, c.okRuns + '/' + c.runs, '누름→화면', JSON.stringify(c.durations.pressToOverlay.values), '퇴장', JSON.stringify(c.durations.exit.values), '누름→결과', JSON.stringify(c.durations.pressToReveal.values));
  }
}
