#!/usr/bin/env node
/**
 * 같은 빌드를 여러 번 찍은 것(tools/repeat.mjs 의 run-1 ... run-N)을 두 빌드에 대해 받아,
 * 영역마다 "한 빌드 안에서 그림이 몇 가지로 나오는가"와 "두 빌드 사이의 차이가 그 안의 것과 같은 종류, 같은 크기인가"를 센다.
 *
 *   node tools/variants.mjs <A 의 반복 폴더> <B 의 반복 폴더> <out.json> [영역 이름들, 쉼표로. 기본 header,hero,footer,search,screenhead,desc. all 이면 전부]
 *
 * 영역 그림(<촬영 id>~<영역>.png)의 해시로 변종을 가린다. 촬영과 영역마다:
 *   withinA, withinB   그 빌드 안에서 나온 서로 다른 그림의 수와 각각의 횟수
 *   shared             두 빌드에 똑같은 그림(바이트까지)이 있는가
 *   onlyA, onlyB       한 빌드에서만 나온 그림의 수
 *   그리고 변종 사이의 크기: 눈에 띄는 픽셀 수(pixelmatch threshold 0.1)의 최댓값을 빌드 안(A 안, B 안)과 빌드 사이(A 대 B 의 가장 가까운 짝)로 나눠 적는다.
 * 두 빌드 사이에서만 나오고 한 빌드 안에서는 한 번도 나오지 않는 크기의 차이가 있으면 crossOnly 로 표시한다.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const [dirA, dirB, outFile, keysArg = 'header,hero,footer,search,screenhead,desc'] = process.argv.slice(2);
if (!dirA || !dirB) { console.error('사용법: node tools/variants.mjs <A 반복 폴더> <B 반복 폴더> <out.json> [영역들]'); process.exit(2); }
const KEYS = new Set(keysArg.split(','));
const runs = (dir) => readdirSync(dir).filter((d) => /^run-\d+$/.test(d)).map((d) => path.join(dir, d));
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.includes('~') && e.name.endsWith('.png') ? [path.join(dir, e.name)] : []));
function collect(dir) {
  const map = new Map(); // "촬영~영역" → Map(hash → { count, file })
  for (const run of runs(dir)) for (const file of walk(run)) {
    const id = path.relative(run, file).replace(/\\/g, '/').replace(/\.png$/, '');
    if (!KEYS.has('all') && !KEYS.has(id.split('~')[1].replace(/-\d+$/, ''))) continue;
    const hash = createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 16);
    if (!map.has(id)) map.set(id, new Map());
    const e = map.get(id).get(hash) ?? { count: 0, file };
    e.count++; map.get(id).set(hash, e);
  }
  return map;
}
const A = collect(dirA), B = collect(dirB);
const cache = new Map();
const png = (file) => { if (!cache.has(file)) cache.set(file, PNG.sync.read(readFileSync(file))); return cache.get(file); };
function distance(fa, fb) {
  const a = png(fa), b = png(fb);
  if (a.width !== b.width || a.height !== b.height) return { solid: Infinity, exact: Infinity, size: true };
  const ua = new Uint32Array(a.data.buffer, a.data.byteOffset, a.width * a.height), ub = new Uint32Array(b.data.buffer, b.data.byteOffset, a.width * a.height);
  let exact = 0; for (let i = 0; i < ua.length; i++) if (ua[i] !== ub[i]) exact++;
  return { exact, solid: exact ? pixelmatch(a.data, b.data, null, a.width, a.height, { threshold: 0.1, includeAA: false }) : 0 };
}
const rows = [];
for (const id of Array.from(new Set([...A.keys(), ...B.keys()])).sort()) {
  const a = A.get(id) ?? new Map(), b = B.get(id) ?? new Map();
  const ha = Array.from(a.keys()), hb = Array.from(b.keys());
  const row = { id, region: id.split('~')[1].replace(/-\d+$/, ''), withinA: ha.map((h) => a.get(h).count), withinB: hb.map((h) => b.get(h).count), shared: ha.filter((h) => b.has(h)).length, onlyA: ha.filter((h) => !b.has(h)).length, onlyB: hb.filter((h) => !a.has(h)).length };
  const within = (m, hs) => { let max = { solid: 0, exact: 0 }; for (let i = 0; i < hs.length; i++) for (let j = i + 1; j < hs.length; j++) { const d = distance(m.get(hs[i]).file, m.get(hs[j]).file); if (d.solid > max.solid || (d.solid === max.solid && d.exact > max.exact)) max = d; } return max; };
  row.maxWithinA = within(a, ha); row.maxWithinB = within(b, hb);
  // 빌드 사이: 한 빌드에만 있는 그림마다 다른 빌드의 가장 가까운 그림까지의 크기. 그 가운데 가장 큰 것
  let cross = { solid: 0, exact: 0 };
  for (const [mine, other, hs] of [[a, b, ha.filter((h) => !b.has(h))], [b, a, hb.filter((h) => !a.has(h))]]) for (const h of hs) {
    let best = null;
    for (const o of other.keys()) { const d = distance(mine.get(h).file, other.get(o).file); if (!best || d.solid < best.solid || (d.solid === best.solid && d.exact < best.exact)) best = d; }
    if (best && (best.solid > cross.solid || (best.solid === cross.solid && best.exact > cross.exact))) cross = best;
  }
  row.maxCross = cross;
  rows.push(row);
}
const byRegion = {};
for (const r of rows) {
  const e = (byRegion[r.region] ??= { compared: 0, stableBoth: 0, variedA: 0, variedB: 0, identicalSets: 0, withSharedImage: 0, maxWithinSolid: 0, maxWithinExact: 0, maxCrossSolid: 0, maxCrossExact: 0, crossOnly: [] });
  e.compared++;
  if (r.withinA.length === 1 && r.withinB.length === 1) e.stableBoth++;
  if (r.withinA.length > 1) e.variedA++;
  if (r.withinB.length > 1) e.variedB++;
  if (r.onlyA === 0 && r.onlyB === 0) e.identicalSets++;
  if (r.shared > 0) e.withSharedImage++;
  for (const w of [r.maxWithinA, r.maxWithinB]) { if (w.solid > e.maxWithinSolid) e.maxWithinSolid = w.solid; if (w.exact > e.maxWithinExact) e.maxWithinExact = w.exact; }
  if (r.maxCross.solid > e.maxCrossSolid) e.maxCrossSolid = r.maxCross.solid;
  if (r.maxCross.exact > e.maxCrossExact) e.maxCrossExact = r.maxCross.exact;
  // 두 빌드에 같은 그림이 하나도 없는 촬영: 빌드 사이의 차이가 한 빌드 안의 흔들림으로 설명되지 않을 수 있다
  if (r.shared === 0) e.crossOnly.push({ id: r.id, cross: r.maxCross, withinA: r.maxWithinA, withinB: r.maxWithinB });
}
const result = { generatedAt: new Date().toISOString(), a: dirA, b: dirB, runsA: runs(dirA).length, runsB: runs(dirB).length, byRegion, rows };
if (outFile) writeFileSync(outFile, JSON.stringify(result, null, 1));
console.log(`반복 A ${result.runsA}번, B ${result.runsB}번`);
console.log('| 영역 | 견준 촬영 | 두 빌드 모두 한 가지 | A 안에서 여러 가지 | B 안에서 여러 가지 | 두 빌드에 같은 그림이 있음 | 빌드 안 최대(눈에 띄는 픽셀) | 빌드 사이 최대 | 같은 그림이 하나도 없는 촬영 |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const [name, e] of Object.entries(byRegion)) console.log(`| ${name} | ${e.compared} | ${e.stableBoth} | ${e.variedA} | ${e.variedB} | ${e.withSharedImage} | ${e.maxWithinSolid} | ${e.maxCrossSolid} | ${e.crossOnly.length} |`);
void existsSync;
