#!/usr/bin/env node
/**
 * 두 촬영 묶음을 견준다. 그림은 픽셀로, 구조는 촬영마다 남긴 기록(JSON)으로.
 *
 *   node diff.mjs <dirA> <dirB> <outDir> [--review 0.0001] [--only 글자] [--groups a,b]
 *   예) node diff.mjs ../screenshots/before/deployed ../screenshots/after/baseline-local ../screenshots/diff/baseline-noise
 *
 * 만드는 것
 *   <outDir>/<촬영 id>.diff.png   다른 픽셀이 하나라도 있는 촬영만. 어둡게 깐 A 위에 빨강(다름), 노랑(가장자리 다듬기)
 *   <outDir>/summary.json        촬영마다의 숫자와 구조 차이 전부(기계가 읽는 것)
 *   <outDir>/SUMMARY.md          사람이 읽는 요약
 *
 * 픽셀 숫자 셋을 따로 센다(한 숫자로 뭉치지 않는다).
 *   exact    값이 조금이라도 다른 픽셀
 *   aa       pixelmatch 가 가장자리 다듬기(안티앨리어싱)로 본 픽셀. 렌더링 환경 차이로 생기는 것이라 따로 분류한다
 *   solid    가장자리 다듬기가 아니면서 눈에 띄게 다른 픽셀(pixelmatch threshold 0.1)
 *
 * 구조 차이: 크기 불일치, 가로 넘침, 자리와 크기가 2px 넘게 달라진 요소, 요소 수의 변화, 글 줄 수의 변화, 한쪽에만 있는 글,
 *           깨지거나 빠진 그림, 글꼴, 콘솔 오류와 실패한 요청, 열린 겹침 화면, 주소와 응답 상태.
 *
 * 이 도구는 통과와 실패를 말하지 않는다. 점수 하나로 판정하지 않는다.
 * solid 비율이 --review(기본 0.01%)를 넘거나 구조 차이가 하나라도 있는 촬영을 전부 "사람이 볼 목록"에 올린다.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { parseArgs } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2), ['dirA', 'dirB', 'outDir']);
if (!args.dirA || !args.dirB || !args.outDir) { console.error('사용법: node diff.mjs <dirA> <dirB> <outDir> [--review 0.0001] [--only 글자] [--groups a,b]'); process.exit(2); }
const dirA = path.resolve(args.dirA), dirB = path.resolve(args.dirB), outDir = path.resolve(args.outDir);
const REVIEW = Number(args.review ?? 0.0001);
const BOX_TOLERANCE = 2;
const only = args.only ? String(args.only).split(',') : null;
const groupsFilter = args.groups ? String(args.groups).split(',') : null;

const loadIndex = async (dir) => JSON.parse(await readFile(path.join(dir, 'index.json'), 'utf8'));
const indexA = await loadIndex(dirA), indexB = await loadIndex(dirB);
const shotMap = (index) => { const map = new Map(); for (const item of index.items) for (const s of item.shots) map.set(`${item.id}__${s.name}`, { ...s, group: item.group, itemStatus: item.status, error: item.error, meta: { group: item.group, key: item.routeKey, route: item.route, locale: item.locale, width: item.width, preset: item.preset, patch: item.patch ?? null, shot: s.name } }); return map; };
const A = shotMap(indexA), B = shotMap(indexB);
let ids = Array.from(new Set([...A.keys(), ...B.keys()])).sort();
if (only) ids = ids.filter((id) => only.some((part) => id.includes(part)));
if (groupsFilter) ids = ids.filter((id) => groupsFilter.includes(id.split('/')[0]));
const fileOf = (dir, id, ext) => path.join(dir, ...id.split('/')) + ext;

// ── 그림 ─────────────────────────────────────────────────────────────────────
async function comparePixels(id) {
  const [bufA, bufB] = await Promise.all([readFile(fileOf(dirA, id, '.png')), readFile(fileOf(dirB, id, '.png'))]);
  if (bufA.equals(bufB)) return { identicalFile: true, exact: 0, aa: 0, solid: 0, exactRatio: 0, solidRatio: 0, aaRatio: 0, sizeMismatch: false, total: bufA.readUInt32BE(16) * bufA.readUInt32BE(20), sizeA: [bufA.readUInt32BE(16), bufA.readUInt32BE(20)], sizeB: [bufB.readUInt32BE(16), bufB.readUInt32BE(20)] };
  const a = PNG.sync.read(bufA), b = PNG.sync.read(bufB);
  const out = { sizeA: [a.width, a.height], sizeB: [b.width, b.height] };
  const sizeMismatch = a.width !== b.width || a.height !== b.height;
  const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
  // 크기가 다르면 왼쪽 위에서부터 겹치는 부분만 견주고, 겹치지 않는 넓이는 따로 적는다
  const view = (img) => {
    if (img.width === w && img.height === h) return img.data;
    const cut = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) img.data.copy(cut, y * w * 4, y * img.width * 4, y * img.width * 4 + w * 4);
    return cut;
  };
  const da = view(a), db = view(b);
  const ua = new Uint32Array(da.buffer, da.byteOffset, w * h), ub = new Uint32Array(db.buffer, db.byteOffset, w * h);
  let exact = 0, x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let i = 0; i < ua.length; i++) if (ua[i] !== ub[i]) { exact++; const x = i % w, y = (i - x) / w; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  let aa = 0, solid = 0, solidBox = null, bands = [];
  if (exact > 0) {
    const mask = Buffer.alloc(w * h * 4);
    solid = pixelmatch(da, db, mask, w, h, { threshold: 0.1, includeAA: false, diffMask: true, aaColor: [255, 255, 0], diffColor: [255, 0, 0] });
    const view4 = Buffer.alloc(w * h * 4);
    let sx0 = w, sy0 = h, sx1 = -1, sy1 = -1;
    const rows = new Uint8Array(h);
    for (let i = 0; i < w * h; i++) {
      const p = i * 4;
      if (mask[p + 3] > 0 && mask[p + 1] === 0) { // 빨강: 다름
        view4[p] = 255; view4[p + 1] = 40; view4[p + 2] = 40; view4[p + 3] = 255;
        const x = i % w, y = (i - x) / w; rows[y] = 1;
        if (x < sx0) sx0 = x; if (x > sx1) sx1 = x; if (y < sy0) sy0 = y; if (y > sy1) sy1 = y;
      } else if (mask[p + 3] > 0) { aa++; view4[p] = 255; view4[p + 1] = 230; view4[p + 2] = 0; view4[p + 3] = 255; }
      else { const g = Math.round((da[p] * 0.3 + da[p + 1] * 0.59 + da[p + 2] * 0.11) * 0.45) + 18; view4[p] = g; view4[p + 1] = g; view4[p + 2] = g; view4[p + 3] = 255; }
    }
    if (solid > 0) solidBox = [sx0, sy0, sx1 - sx0 + 1, sy1 - sy0 + 1];
    // 다른 픽셀이 있는 가로 띠(세로 구간). 어디가 다른지 글로 짚을 때 쓴다
    let start = -1, gap = 0;
    for (let y = 0; y <= h; y++) {
      if (y < h && rows[y]) { if (start < 0) start = y; gap = 0; }
      else if (start >= 0 && (++gap > 12 || y === h)) { bands.push([start, y - gap]); start = -1; gap = 0; }
    }
    const png = new PNG({ width: w, height: h });
    view4.copy(png.data);
    const target = fileOf(outDir, id, '.diff.png');
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, PNG.sync.write(png, { deflateLevel: 6 }));
  }
  const total = w * h;
  return {
    ...out, sizeMismatch, compared: [w, h], total, exact, aa, solid,
    exactRatio: exact / total, solidRatio: solid / total, aaRatio: aa / total,
    exactBox: exact ? [x0, y0, x1 - x0 + 1, y1 - y0 + 1] : null, solidBox, bands: bands.slice(0, 12), bandCount: bands.length,
    uncomparedPixels: sizeMismatch ? a.width * a.height + b.width * b.height - 2 * total : 0,
  };
}

// ── 요소 단위 ────────────────────────────────────────────────────────────────
/**
 * 촬영마다 따로 찍은 영역(lib/regions.mjs)을 견준다. 자리는 견주지 않는다(위의 내용이 늘면 아래 영역은 내려간다). 크기, 글, 픽셀을 본다.
 *   same      픽셀이 전부 같다
 *   noise     값이 다른 픽셀이 있으나 눈에 띄는 것은 없다(pixelmatch threshold 0.1)
 *   aa-shift  크기와 글이 같고, 요소가 놓인 소수 자리(기기 픽셀의 소수 부분)가 두 쪽에서 다르며, 눈에 띄는 픽셀이 영역의 5% 미만이다.
 *             5% 를 넘어도, 한쪽 그림을 한 픽셀 밀어 견줬을 때 눈에 띄는 픽셀이 0.5% 미만으로 줄면 이 갈래다(글자가 통째로 한 픽셀 옆줄에 그려진 것, shiftTest 에 민 방향과 남은 픽셀 수).
 *             같은 내용이 다른 소수 자리에 놓여 가장자리가 달리 그려진 것으로 본다(자리의 소수 부분을 함께 적는다)
 *   differ    그 밖의 픽셀 차이
 *   size      찍힌 그림의 크기가 다르다
 *   onlyA, onlyB  한쪽에만 있는 영역
 */
async function compareRegions(id, ra, rb) {
  const out = {};
  const A = new Map((ra.regions ?? []).map((r) => [r.key, r])), B = new Map((rb.regions ?? []).map((r) => [r.key, r]));
  const dpr = ra.doc.dpr;
  const frac = (r) => [0, 1].map((i) => { const v = r.rect[i] * dpr; return Math.round((v - Math.floor(v + 1e-6)) * 1000) / 1000; });
  for (const key of new Set([...A.keys(), ...B.keys()])) {
    const x = A.get(key), y = B.get(key);
    if (!x || !y) { out[key] = { state: x ? 'onlyA' : 'onlyB', text: (x ?? y).text.slice(0, 160), size: [(x ?? y).rect[2], (x ?? y).rect[3]] }; continue; }
    const e = { sizeA: [x.rect[2], x.rect[3]], sizeB: [y.rect[2], y.rect[3]], posA: [x.rect[0], x.rect[1]], posB: [y.rect[0], y.rect[1]], offA: frac(x), offB: frac(y), sameText: x.text === y.text };
    e.sameSize = Math.abs(e.sizeA[0] - e.sizeB[0]) <= 0.01 && Math.abs(e.sizeA[1] - e.sizeB[1]) <= 0.01;
    e.sameOffset = Math.abs(e.offA[0] - e.offB[0]) <= 0.005 && Math.abs(e.offA[1] - e.offB[1]) <= 0.005;
    if (!e.sameText) { e.textA = x.text.slice(0, 240); e.textB = y.text.slice(0, 240); }
    const fa = fileOf(dirA, id + '~' + key, '.png'), fb = fileOf(dirB, id + '~' + key, '.png');
    if (!existsSync(fa) || !existsSync(fb)) { e.state = 'file-missing'; out[key] = e; continue; }
    const [pa, pb] = await Promise.all([readFile(fa), readFile(fb)]);
    if (pa.equals(pb)) { e.state = 'same'; e.exact = 0; e.solid = 0; out[key] = e; continue; }
    let a = PNG.sync.read(pa), b = PNG.sync.read(pb);
    if (a.width !== b.width || a.height !== b.height) {
      e.pngA = [a.width, a.height]; e.pngB = [b.width, b.height];
      // 요소의 크기는 같은데 찍힌 그림이 한두 줄 다르면(문서 끝에 걸려 잘린 경우) 겹치는 부분만 견준다
      const near = e.sameSize && Math.abs(a.width - b.width) <= 2 * dpr && Math.abs(a.height - b.height) <= 2 * dpr;
      if (!near) { e.state = 'size'; out[key] = e; continue; }
      const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
      const cut = (img) => { const c = new PNG({ width: w, height: h }); for (let yy = 0; yy < h; yy++) img.data.copy(c.data, yy * w * 4, yy * img.width * 4, yy * img.width * 4 + w * 4); return c; };
      a = cut(a); b = cut(b); e.cropped = true;
    }
    const n = a.width * a.height;
    const ua = new Uint32Array(a.data.buffer, a.data.byteOffset, n), ub = new Uint32Array(b.data.buffer, b.data.byteOffset, n);
    let exact = 0;
    for (let i = 0; i < n; i++) if (ua[i] !== ub[i]) exact++;
    e.exact = exact; e.total = n;
    if (exact === 0) { e.state = 'same'; e.solid = 0; out[key] = e; continue; }
    const mask = new PNG({ width: a.width, height: a.height });
    e.solid = pixelmatch(a.data, b.data, mask.data, a.width, a.height, { threshold: 0.1, includeAA: false });
    e.solidRatio = e.solid / n;
    e.state = e.solid === 0 ? 'noise' : e.sameSize && e.sameText && !e.sameOffset && e.solidRatio < 0.05 ? 'aa-shift' : 'differ';
    // 작은 글 요소는 놓인 소수 자리가 달라지면 글자가 통째로 한 픽셀 옆줄에 그려진다(5% 를 넘는다). 그런 경우를 가린다:
    // 크기와 글이 같고 자리의 소수 부분이 다를 때, 결과 쪽 그림을 한 픽셀 밀어 견줘서 눈에 띄는 픽셀이 0.5% 미만으로 줄면 "한 픽셀 밀림"으로 본다
    if (e.state === 'differ' && e.sameSize && e.sameText && !e.sameOffset && a.width > 4 && a.height > 4) {
      const w = a.width - 2, h = a.height - 2;
      const crop = (img, ox, oy) => { const c = Buffer.alloc(w * h * 4); for (let yy = 0; yy < h; yy++) img.data.copy(c, yy * w * 4, ((yy + oy) * img.width + ox) * 4, ((yy + oy) * img.width + ox + w) * 4); return c; };
      const base = crop(a, 1, 1);
      let best = null;
      for (const dy of [-1, 0, 1]) for (const dx of [-1, 0, 1]) {
        if (!dx && !dy) continue;
        const count = pixelmatch(base, crop(b, 1 + dx, 1 + dy), null, w, h, { threshold: 0.1, includeAA: false });
        if (!best || count < best.solid) best = { shift: [dx, dy], solid: count };
      }
      e.shiftTest = { ...best, ratio: best.solid / (w * h) };
      if (e.shiftTest.ratio < 0.005) e.state = 'aa-shift';
    }
    if (e.state === 'differ' || e.state === 'aa-shift') { const target = fileOf(outDir, id + '~' + key, '.diff.png'); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, PNG.sync.write(mask, { deflateLevel: 6 })); }
    out[key] = e;
  }
  return out;
}

// ── 구조 ─────────────────────────────────────────────────────────────────────
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
const setDiff = (x, y) => { const sy = new Set(y.map((v) => JSON.stringify(v))); return x.filter((v) => !sy.has(JSON.stringify(v))); };

function compareRecords(a, b) {
  const flags = [], detail = {};
  const flag = (name, value) => { flags.push(name); detail[name] = value; };
  if (a.url !== b.url) flag('url', { a: a.url, b: b.url });
  if (a.httpStatus !== b.httpStatus) flag('httpStatus', { a: a.httpStatus, b: b.httpStatus });
  if (a.lang !== b.lang) flag('lang', { a: a.lang, b: b.lang });
  // 가로 넘침과 문서 크기
  const over = { a: a.doc.overflowX ? Math.max(a.doc.scrollWidth, a.doc.bodyScrollWidth) : false, b: b.doc.overflowX ? Math.max(b.doc.scrollWidth, b.doc.bodyScrollWidth) : false, window: a.doc.innerWidth };
  if (over.a !== over.b) flag('overflowX', over);
  if (a.doc.scrollWidth !== b.doc.scrollWidth || a.doc.clientWidth !== b.doc.clientWidth) flag('docWidth', { a: [a.doc.scrollWidth, a.doc.clientWidth], b: [b.doc.scrollWidth, b.doc.clientWidth] });
  if (Math.abs(a.doc.scrollHeight - b.doc.scrollHeight) > BOX_TOLERANCE) flag('docHeight', { a: a.doc.scrollHeight, b: b.doc.scrollHeight });
  if (Math.abs(a.doc.scrollY - b.doc.scrollY) > BOX_TOLERANCE) flag('scrollY', { a: a.doc.scrollY, b: b.doc.scrollY });
  // 그림
  if (a.images.broken.length || b.images.broken.length) flag('brokenImages', { a: a.images.broken, b: b.images.broken });
  if (a.images.pending.length || b.images.pending.length) flag('pendingImages', { a: a.images.pending.slice(0, 10), b: b.images.pending.slice(0, 10) });
  if (a.images.total !== b.images.total || a.images.noSrc !== b.images.noSrc || a.images.lazyAttr !== b.images.lazyAttr) flag('imageCount', { a: [a.images.total, a.images.noSrc, a.images.lazyAttr], b: [b.images.total, b.images.noSrc, b.images.lazyAttr], note: '[전체, 주소 없음, lazy 로 적힌 수]' });
  // 정해 둔 선택자의 자리와 크기
  const moved = [], counts = [];
  for (const sel of new Set([...Object.keys(a.boxes), ...Object.keys(b.boxes)])) {
    const x = a.boxes[sel], y = b.boxes[sel];
    if (!x || !y) { counts.push({ sel, a: x ? [x.count, x.visible] : null, b: y ? [y.count, y.visible] : null }); continue; }
    if (x.count !== y.count || x.visible !== y.visible) counts.push({ sel, a: [x.count, x.visible], b: [y.count, y.visible] });
    const pairs = x.rects.map((r, i) => [r, y.rects[i], i]);
    if (x.last && y.last) pairs.push([x.last, y.last, 'last']);
    for (const [r, s, i] of pairs) {
      if (!r || !s) continue;
      const delta = Math.max(...r.map((v, k) => Math.abs(v - s[k])));
      if (delta > BOX_TOLERANCE) moved.push({ sel, i, a: r, b: s, delta: Math.round(delta * 100) / 100 });
    }
  }
  if (counts.length) flag('elementCount', counts.slice(0, 40));
  if (moved.length) flag('boxMoved', { n: moved.length, max: Math.max(...moved.map((m) => m.delta)), sels: Array.from(new Set(moved.map((m) => m.sel))), sizeChanged: Array.from(new Set(moved.filter((m) => Math.abs(m.a[2] - m.b[2]) > BOX_TOLERANCE || Math.abs(m.a[3] - m.b[3]) > BOX_TOLERANCE).map((m) => m.sel))), list: moved.sort((p, q) => q.delta - p.delta).slice(0, 25) });
  // 글: 같은 글(요소 종류와 글자)의 몇 번째 것끼리 짝지어 줄 수를 견준다
  // 구역별 수. 글 한 줄은 "구역 | 요소 :: 글" 꼴이다
  const zoneCount = (list) => { const out = {}; for (const t of list) { const z = t.split(' | ')[0]; out[z] = (out[z] ?? 0) + 1; } return out; };
  const keyed = (list) => { const seen = new Map(), out = new Map(); for (const t of list) { const base = t.k + '|' + t.t; const n = (seen.get(base) ?? 0) + 1; seen.set(base, n); out.set(base + '#' + n, t); } return out; };
  const ta = keyed(a.text), tb = keyed(b.text);
  const wraps = [], onlyA = [], onlyB = [];
  for (const [key, t] of ta) { const u = tb.get(key); if (!u) onlyA.push((t.z ?? '?') + ' | ' + t.k + ' :: ' + t.t); else if (t.lines !== u.lines) wraps.push({ zone: t.z ?? '?', el: t.k, text: t.t, a: t.lines, b: u.lines, wa: t.w, wb: u.w }); }
  for (const [key, t] of tb) if (!ta.has(key)) onlyB.push((t.z ?? '?') + ' | ' + t.k + ' :: ' + t.t);
  if (wraps.length) flag('textWrap', { n: wraps.length, list: wraps.slice(0, 25) });
  if (onlyA.length || onlyB.length) flag('textSet', { onlyA: onlyA.length, onlyB: onlyB.length, a: onlyA.slice(0, 12), b: onlyB.slice(0, 12), zonesA: zoneCount(onlyA), zonesB: zoneCount(onlyB), outside: [...onlyA.map((t) => 'A ' + t), ...onlyB.map((t) => 'B ' + t)].filter((t) => !/^[AB] (reviews|card-rating|ratinglink) \|/.test(t)).slice(0, 60) });
  if (a.textTruncated || b.textTruncated) detail.textTruncated = true;
  // 글꼴
  const fontDiff = [];
  for (const sel of new Set([...Object.keys(a.fonts), ...Object.keys(b.fonts)])) if (!same(a.fonts[sel], b.fonts[sel])) fontDiff.push({ sel, a: a.fonts[sel] ?? null, b: b.fonts[sel] ?? null });
  if (fontDiff.length) flag('fonts', fontDiff.slice(0, 20));
  const realFonts = (list) => list.filter((f) => !/fallback/i.test(f));
  if (!same(realFonts(a.loadedFonts), realFonts(b.loadedFonts))) flag('loadedFonts', { a: a.loadedFonts, b: b.loadedFonts });
  if (!same(a.titles ?? [], b.titles ?? [])) flag('titles', { onlyA: setDiff(a.titles ?? [], b.titles ?? []).slice(0, 10), onlyB: setDiff(b.titles ?? [], a.titles ?? []).slice(0, 10) });
  // 겹침 화면, 콘솔, 요청
  if (!same(a.dialogs.map((d) => [d.role, d.cls]), b.dialogs.map((d) => [d.role, d.cls]))) flag('dialogs', { a: a.dialogs, b: b.dialogs });
  if (a.bodyOverflow !== b.bodyOverflow) flag('bodyOverflow', { a: a.bodyOverflow, b: b.bodyOverflow });
  // 환경이 달라서 생기는 겉모습만 걷어 낸다: 첫 줄만, 응답 상태의 설명 글(HTTP/2 는 "404 ()", HTTP/1.1 은 "404 (Not Found)"), 빌드마다 다른 묶음 파일 이름
  const strip = (list) => list.map((e) => String(e).split(/\r?\n/)[0].replace(/https?:\/\/[^\s/]+/g, '').replace(/\?[^\s]*/g, '').replace(/(status of \d+) \([^)]*\)/, '$1').replace(/\/_next\/static\/chunks\/[^\s:)'"]+/g, '/_next/static/chunks/*'));
  if (!same(strip(a.consoleErrors).sort(), strip(b.consoleErrors).sort())) flag('console', { onlyA: setDiff(strip(a.consoleErrors), strip(b.consoleErrors)).slice(0, 8), onlyB: setDiff(strip(b.consoleErrors), strip(a.consoleErrors)).slice(0, 8) });
  const req = (list) => list.map((e) => `${e.status ?? e.reason ?? e.method ?? ''} ${e.url}`).sort();
  for (const key of ['failedRequests', 'httpErrors', 'blockedRequests']) if (!same(req(a[key]), req(b[key]))) flag(key, { onlyA: setDiff(req(a[key]), req(b[key])).slice(0, 8), onlyB: setDiff(req(b[key]), req(a[key])).slice(0, 8) });
  // 양쪽에 똑같이 있는 것도 요약에는 적는다(차이는 아니지만 알아야 한다)
  const shared = {};
  if (a.consoleErrors.length && same(strip(a.consoleErrors).sort(), strip(b.consoleErrors).sort())) shared.console = strip(a.consoleErrors).slice(0, 5);
  if (a.httpErrors.length && same(req(a.httpErrors), req(b.httpErrors))) shared.httpErrors = req(a.httpErrors).slice(0, 5);
  if (a.blockedRequests.length && same(req(a.blockedRequests), req(b.blockedRequests))) shared.blocked = req(a.blockedRequests).slice(0, 5);
  if (a.notes.length || b.notes.length) shared.notes = { a: a.notes, b: b.notes };
  if (over.a !== false && over.a === over.b) shared.overflowX = over;
  if (!same(a.loadedFonts, b.loadedFonts) && same(realFonts(a.loadedFonts), realFonts(b.loadedFonts))) shared.fallbackFontStatus = { a: a.loadedFonts.filter((f) => /fallback/i.test(f)), b: b.loadedFonts.filter((f) => /fallback/i.test(f)) };
  return { flags, detail, shared };
}

// ── 실행 ─────────────────────────────────────────────────────────────────────
await mkdir(outDir, { recursive: true });
const rows = [];
let n = 0;
for (const id of ids) {
  const sa = A.get(id), sb = B.get(id);
  const group = (sa ?? sb).group;
  const row = { id, group, meta: (sa ?? sb).meta, statusA: sa?.status ?? 'absent', statusB: sb?.status ?? 'absent' };
  if (row.statusA === 'ok' && row.statusB === 'ok') {
    const missingFile = [fileOf(dirA, id, '.png'), fileOf(dirB, id, '.png'), fileOf(dirA, id, '.json'), fileOf(dirB, id, '.json')].find((f) => !existsSync(f));
    if (missingFile) { row.kind = 'file-missing'; row.reason = path.basename(missingFile); }
    else {
      row.pixels = await comparePixels(id);
      const [ra, rb] = await Promise.all([readFile(fileOf(dirA, id, '.json'), 'utf8'), readFile(fileOf(dirB, id, '.json'), 'utf8')]);
      const recordA = JSON.parse(ra);
      const recordB = JSON.parse(rb);
      row.shotKind = recordA.kind;
      row.regions = await compareRegions(id, recordA, recordB);
      const structure = compareRecords(recordA, recordB);
      Object.assign(row, structure);
      // 다른 띠가 전부 홈 배너(.v-hero) 안에 있는가. 배너의 카드 사진은 같은 환경에서도 가끔 다르게 그려진다(README 5장). 표시만 하고 판정에는 쓰지 않는다
      const hero = recordA.boxes['.v-hero']?.rects?.[0];
      if (hero && row.pixels.solid > 0 && row.pixels.solidBox && recordA.kind !== 'clip') {
        const dpr = recordA.doc.dpr, top = (hero[1] - (recordA.kind === 'viewport' ? recordA.doc.scrollY : 0)) * dpr, bottom = top + hero[3] * dpr;
        row.pixels.solidInsideHero = row.pixels.solidBox[1] >= top - 2 && row.pixels.solidBox[1] + row.pixels.solidBox[3] <= bottom + 2;
      }
      if (row.pixels.sizeMismatch) row.flags.unshift('sizeMismatch');
      // 분류. 판정이 아니라 종류다
      const structural = row.flags.filter((f) => !['console', 'failedRequests', 'httpErrors', 'blockedRequests'].includes(f));
      row.kind = structural.length ? 'structure' : row.pixels.solid > 0 ? 'solid-pixels' : row.pixels.aa > 0 ? 'aa-only' : row.pixels.exact > 0 ? 'sub-threshold' : row.flags.length ? 'runtime-only' : 'identical';
      row.review = structural.length > 0 || row.flags.length > 0 || row.pixels.solidRatio > REVIEW;
    }
  } else if (row.statusA === row.statusB) { row.kind = 'both-' + row.statusA; row.reason = sa?.reason ?? sa?.error ?? ''; }
  else { row.kind = 'one-side-only'; row.review = true; row.reason = `A: ${row.statusA}${sa?.reason ? ' (' + sa.reason + ')' : ''}, B: ${row.statusB}${sb?.reason ? ' (' + sb.reason + ')' : ''}`; }
  rows.push(row);
  if (++n % 250 === 0) console.log(`${n} / ${ids.length}`);
}

const kinds = {};
for (const r of rows) kinds[r.kind] = (kinds[r.kind] ?? 0) + 1;
const byGroup = {};
for (const r of rows) { const g = (byGroup[r.group] ??= { total: 0 }); g.total++; g[r.kind] = (g[r.kind] ?? 0) + 1; }
const flagCounts = {};
for (const r of rows) for (const f of r.flags ?? []) flagCounts[f] = (flagCounts[f] ?? 0) + 1;
const meta = (index, dir) => ({ dir, label: index.label, baseUrl: index.baseUrl, chrome: index.chrome, startedAt: index.startedAt, finishedAt: index.finishedAt, fixedTime: index.fixedTime, items: index.items.length, failedItems: index.items.filter((i) => i.status !== 'ok').length });
const summary = { generatedAt: new Date().toISOString(), a: meta(indexA, dirA), b: meta(indexB, dirB), reviewThreshold: REVIEW, boxTolerancePx: BOX_TOLERANCE, shots: rows.length, kinds, byGroup, flagCounts, rows };
await writeFile(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 1));

// ── 사람이 읽는 요약 ─────────────────────────────────────────────────────────
const pct = (ratio) => (ratio * 100).toFixed(4) + '%';
const md = [];
const compared = rows.filter((r) => r.pixels);
md.push('# 촬영 비교 요약', '');
md.push(`만든 시각: ${summary.generatedAt}`, '');
md.push('| | A | B |', '|---|---|---|');
for (const key of ['label', 'baseUrl', 'chrome', 'startedAt', 'items', 'failedItems', 'dir']) md.push(`| ${key} | ${summary.a[key]} | ${summary.b[key]} |`);
md.push('', '이 문서는 통과와 실패를 말하지 않는다. 숫자와 차이의 종류를 적을 뿐이고, 판정은 사람이 아래 목록을 보고 한다.', '');
md.push('## 1. 종류별 수', '', `촬영 ${rows.length}건 (그림을 견준 것 ${compared.length}건)`, '', '| 종류 | 수 | 뜻 |', '|---|---|---|');
const meaning = {
  identical: '픽셀이 전부 같고 구조 기록도 같다', 'sub-threshold': '값이 다른 픽셀이 있으나 눈에 띄는 차이(threshold 0.1)는 없다', 'aa-only': '가장자리 다듬기(안티앨리어싱) 픽셀만 다르다',
  'solid-pixels': '가장자리 다듬기가 아닌 픽셀이 다르다(구조 기록은 같다)', structure: '구조 기록이 다르다(크기, 자리, 줄바꿈, 요소 수, 글, 그림, 글꼴 등)', 'runtime-only': '그림과 구조는 같고 콘솔이나 요청 기록만 다르다',
  'one-side-only': '한쪽에서만 찍혔다', 'both-not-applicable': '두 쪽 모두 해당 없음(고른 요소가 그 폭에 없다)', 'both-missing': '두 쪽 모두 찍지 못했다(견주지 못함)', 'file-missing': '기록에는 있는데 파일이 없다',
};
for (const [kind, count] of Object.entries(kinds).sort((p, q) => q[1] - p[1])) md.push(`| ${kind} | ${count} | ${meaning[kind] ?? ''} |`);
md.push('', '### 묶음별', '', '| 묶음 | 전체 | identical | sub-threshold | aa-only | solid-pixels | structure | 그 밖 |', '|---|---|---|---|---|---|---|---|');
for (const [group, g] of Object.entries(byGroup)) { const known = ['identical', 'sub-threshold', 'aa-only', 'solid-pixels', 'structure'].map((k) => g[k] ?? 0); md.push(`| ${group} | ${g.total} | ${known.join(' | ')} | ${g.total - known.reduce((x, y) => x + y, 0)} |`); }
md.push('', '### 구조 차이의 종류별 촬영 수', '');
if (Object.keys(flagCounts).length) { md.push('| 차이 | 촬영 수 |', '|---|---|'); for (const [f, c] of Object.entries(flagCounts).sort((p, q) => q[1] - p[1])) md.push(`| ${f} | ${c} |`); }
else md.push('없음.');
const section = (title, list, line, empty = '없음.') => { md.push('', `## ${title}`, '', list.length ? `${list.length}건` : empty, ''); for (const r of list.slice(0, 60)) md.push(line(r)); if (list.length > 60) md.push(`- 그 밖에 ${list.length - 60}건. 전부는 summary.json 에 있다.`); };
const has = (f) => rows.filter((r) => r.flags?.includes(f));
section('2. 한쪽에만 있는 촬영', rows.filter((r) => r.kind === 'one-side-only' || r.kind === 'file-missing'), (r) => `- ${r.id}: ${r.reason}`);
section('3. 두 쪽 모두 찍지 못한 촬영(견주지 못함)', rows.filter((r) => r.kind === 'both-missing'), (r) => `- ${r.id}: ${r.reason}`);
section('4. 크기 불일치', has('sizeMismatch'), (r) => `- ${r.id}: A ${r.pixels.sizeA.join('x')}, B ${r.pixels.sizeB.join('x')}`);
section('5. 가로 넘침이 두 쪽에서 다른 촬영', has('overflowX'), (r) => `- ${r.id}: A ${r.detail.overflowX.a}, B ${r.detail.overflowX.b}, 창 ${r.detail.overflowX.window}`);
section('5-1. 두 쪽 모두 같은 폭으로 넘치는 촬영(차이는 아니다. 원본에도 있는 넘침이다)', rows.filter((r) => r.shared?.overflowX), (r) => `- ${r.id}: 문서 ${r.shared.overflowX.a}, 창 ${r.shared.overflowX.window}`);
section('6. 깨지거나 끝나지 않은 그림', rows.filter((r) => r.flags?.includes('brokenImages') || r.flags?.includes('pendingImages')), (r) => `- ${r.id}: 깨짐 A ${r.detail.brokenImages?.a.length ?? 0}, B ${r.detail.brokenImages?.b.length ?? 0}; 끝나지 않음 A ${r.detail.pendingImages?.a.length ?? 0}, B ${r.detail.pendingImages?.b.length ?? 0}. 예: ${(r.detail.brokenImages?.a[0] ?? r.detail.brokenImages?.b[0] ?? r.detail.pendingImages?.a[0] ?? r.detail.pendingImages?.b[0] ?? '')}`);
section('7. 글 줄 수의 변화', has('textWrap'), (r) => `- ${r.id}: ${r.detail.textWrap.n}곳. 예: "${r.detail.textWrap.list[0].text}" ${r.detail.textWrap.list[0].a}줄 → ${r.detail.textWrap.list[0].b}줄`);
section('8. 한쪽에만 있는 글', has('textSet'), (r) => `- ${r.id}: A에만 ${r.detail.textSet.onlyA}, B에만 ${r.detail.textSet.onlyB}. 예: ${JSON.stringify(r.detail.textSet.a[0] ?? r.detail.textSet.b[0])}`);
section(`9. 자리와 크기가 ${BOX_TOLERANCE}px 넘게 다른 요소`, has('boxMoved'), (r) => `- ${r.id}: ${r.detail.boxMoved.n}곳, 가장 큰 차이 ${r.detail.boxMoved.max}px (${r.detail.boxMoved.list[0].sel})`);
section('10. 요소 수의 변화', has('elementCount'), (r) => `- ${r.id}: ${r.detail.elementCount.slice(0, 3).map((c) => `${c.sel} A${JSON.stringify(c.a)} B${JSON.stringify(c.b)}`).join('; ')}`);
section('11. 글꼴 차이', rows.filter((r) => r.flags?.includes('fonts') || r.flags?.includes('loadedFonts')), (r) => `- ${r.id}: ${r.detail.fonts ? r.detail.fonts.map((f) => f.sel).join(', ') : '불린 글꼴 목록이 다르다'}`);
section('12. 콘솔과 요청 기록의 차이', rows.filter((r) => ['console', 'failedRequests', 'httpErrors', 'blockedRequests'].some((f) => r.flags?.includes(f))), (r) => `- ${r.id}: ${['console', 'failedRequests', 'httpErrors', 'blockedRequests'].filter((f) => r.flags.includes(f)).map((f) => `${f} A에만 ${JSON.stringify(r.detail[f].onlyA)} B에만 ${JSON.stringify(r.detail[f].onlyB)}`).join('; ')}`);
section('13. 그 밖의 구조 차이(주소, 응답 상태, 문서 높이, 겹침 화면, 그림 수)', rows.filter((r) => ['url', 'httpStatus', 'lang', 'docWidth', 'docHeight', 'scrollY', 'dialogs', 'bodyOverflow', 'imageCount'].some((f) => r.flags?.includes(f))), (r) => `- ${r.id}: ${r.flags.filter((f) => ['url', 'httpStatus', 'lang', 'docWidth', 'docHeight', 'scrollY', 'dialogs', 'bodyOverflow', 'imageCount'].includes(f)).map((f) => `${f} ${JSON.stringify(r.detail[f])}`).join('; ').slice(0, 400)}`);
const review = rows.filter((r) => r.review).sort((p, q) => (q.pixels?.solidRatio ?? 1) - (p.pixels?.solidRatio ?? 1));
// 다시 찍을 항목: 사람이 볼 목록의 촬영이 속한 항목. 두 환경에서 --only 로 다시 찍고 다시 견주면, 한 번만 생긴 흔들림은 사라지고 진짜 차이만 남는다
// 구조가 다른 촬영은 다시 찍어도 그대로다. 구조는 같고 눈에 띄는 픽셀만 다른 것(홈 배너 카드의 흔들림이 이런 꼴이다)만 다시 찍는다
const reshoot = Array.from(new Set(review.filter((r) => r.kind === 'solid-pixels').map((r) => r.id.split('__')[0])));
await writeFile(path.join(outDir, 'reshoot.txt'), reshoot.join(','));
md.push('', `## 14. 사람이 볼 목록`, '', `solid 비율이 ${pct(REVIEW)} 를 넘거나 구조 차이가 하나라도 있는 촬영 전부. ${review.length}건. solid 비율이 큰 순서.`, '');
if (review.length) { md.push('| 촬영 | 종류 | solid | aa | exact | 다른 띠(세로 구간) | 구조 차이 |', '|---|---|---|---|---|---|---|'); for (const r of review.slice(0, 300)) md.push(`| ${r.id} | ${r.kind} | ${r.pixels ? `${r.pixels.solid} (${pct(r.pixels.solidRatio)})` : ''} | ${r.pixels?.aa ?? ''} | ${r.pixels?.exact ?? ''} | ${r.pixels?.bands?.slice(0, 4).map((b) => b.join('~')).join(', ') ?? ''}${(r.pixels?.bandCount ?? 0) > 4 ? ' 외 ' + (r.pixels.bandCount - 4) : ''} | ${[...(r.flags ?? []), ...(r.pixels?.solidInsideHero ? ['(다른 픽셀이 전부 홈 배너 안)'] : [])].join(', ') || r.reason || ''} |`); if (review.length > 300) md.push('', `그 밖에 ${review.length - 300}건. 전부는 summary.json 에 있다.`); }
const soft = rows.filter((r) => !r.review && r.pixels && r.pixels.exact > 0).sort((p, q) => q.pixels.exact - p.pixels.exact);
md.push('', '## 15. 따로 분류한 미세 차이(가장자리 다듬기, 문턱 아래의 색 차이)', '', `${soft.length}건. 구조 차이가 없고 solid 비율이 문턱 아래인 것. 다른 픽셀이 많은 순서로 30건.`, '');
if (soft.length) { md.push('| 촬영 | 종류 | exact | aa | solid |', '|---|---|---|---|---|'); for (const r of soft.slice(0, 30)) md.push(`| ${r.id} | ${r.kind} | ${r.pixels.exact} (${pct(r.pixels.exactRatio)}) | ${r.pixels.aa} | ${r.pixels.solid} |`); }
const sharedList = (key) => rows.filter((r) => r.shared?.[key]);
md.push('', '## 15-1. 두 쪽에 똑같이 있는 것(차이는 아니지만 알아 둘 것)', '');
md.push(`- 콘솔 오류가 같은 내용으로 있는 촬영: ${sharedList('console').length}건${sharedList('console').length ? '. 예: ' + JSON.stringify(sharedList('console')[0].shared.console[0]) : ''}`);
md.push(`- 400 이상의 응답이 같은 내용으로 있는 촬영: ${sharedList('httpErrors').length}건${sharedList('httpErrors').length ? '. 예: ' + sharedList('httpErrors')[0].shared.httpErrors[0] : ''}`);
md.push(`- 끊은 요청(바깥 주소, GET 이 아닌 요청)이 같은 내용으로 있는 촬영: ${sharedList('blocked').length}건${sharedList('blocked').length ? '. 예: ' + sharedList('blocked')[0].shared.blocked[0] : ''}`);
md.push(`- 대체 글꼴의 불림 상태만 다른 촬영(글꼴 파일이 도착한 때의 차이, 그림에는 차이가 없을 수 있다): ${sharedList('fallbackFontStatus').length}건`);
md.push(`- 기다리다 시간이 넘은 것이 적힌 촬영: ${sharedList('notes').length}건${sharedList('notes').length ? '. 예: ' + JSON.stringify(sharedList('notes')[0].shared.notes) : ''}`);
md.push('', '## 16. 읽는 법', '', `- 사람이 볼 목록의 항목은 \`reshoot.txt\` 에 쉼표로 이어 적었다(${reshoot.length}개). 두 환경에서 \`node shots.mjs <label> <baseUrl> <outDir> --only "$(cat reshoot.txt)"\` 로 다시 찍고 이 도구를 다시 돌린다. 한 번만 생긴 흔들림은 사라지고, 다시 찍어도 남는 차이만 진짜 차이다.`, '- 차이 그림은 이 폴더의 `<촬영 id>.diff.png` 다. 빨강은 다른 픽셀, 노랑은 가장자리 다듬기로 본 픽셀, 회색은 A 를 어둡게 깐 것이다.', '- 원본 그림과 기록은 위 표의 A, B 폴더에 같은 이름(`.png`, `.json`)으로 있다.', '- 긴 그림은 `node tools/crop.mjs` 로 잘라서 본다.', '');
await writeFile(path.join(outDir, 'SUMMARY.md'), md.join('\n'));
console.log(`촬영 ${rows.length}건: ${Object.entries(kinds).map(([k, v]) => `${k} ${v}`).join(', ')}`);
console.log(`사람이 볼 목록 ${review.length}건. 요약: ${path.join(outDir, 'SUMMARY.md')}`);
