#!/usr/bin/env node
/**
 * 촬영 비교(diff.mjs 의 summary.json)의 차이를 의도된 것과 아닌 것으로 나눈다.
 *
 *   node classify.mjs <diff 폴더> [--rules classify-rules.json]
 *   예) node classify.mjs ../screenshots/diff/after-result-vs-baseline-local
 *
 * 만드는 것: <diff 폴더>/CLASSIFIED.md, classified.json
 *
 * 갈래
 *   identical        픽셀과 구조 기록이 전부 같다
 *   noise            값이 다른 픽셀이 있으나 눈에 띄는 것이 없고 구조 기록도 같다(기준선의 흔들림과 같은 종류)
 *   intended         차이가 전부 규칙(classify-rules.json)이 허락한 자리에 있다. 규칙 번호를 붙인다.
 *                    구역을 따로 찍은 촬영은 "허락되지 않은 구역이 전부 그대로"인 것까지 확인한 것이다(구역 확인함).
 *                    구역을 찍지 않은 촬영은 글이 달라진 구역과 구조 기록만으로 본 것이다(구역 확인 못 함).
 *   background-only  시트, 개봉 장면, 부품 자체는 그대로이고(픽셀까지) 그 뒤나 둘레의 화면만 다르다. 뒤의 화면의 차이는 규칙으로 설명된다
 *   position-aa      크기와 글이 같고 요소가 놓인 소수 자리만 달라 가장자리 픽셀이 달리 그려졌다(자리의 소수 부분을 적는다).
 *                    자리가 달라진 까닭(위의 내용이 늘어남)이 규칙으로 설명될 때만 이 갈래다
 *   within-build-variant  규칙이 허락하지 않은 영역이 달랐지만, 반복 측정(--variants)에서 두 빌드가 바이트까지 같은 그림을 낸 적이 있다.
 *                    한 빌드 안에서도 나오는 흔들림이다. 반복 횟수와 변종의 수, 크기를 적는다
 *   UNEXPLAINED      위의 어느 것으로도 설명되지 않는 차이가 하나라도 있다. 사람이 그림을 본다
 *   not-compared     한쪽에서만 찍혔거나 두 쪽 모두 찍지 못했다. 견주지 못한 것이다
 *   not-applicable   두 쪽 모두 해당 없음(그 폭에 없는 요소)
 *
 * 이 도구는 규칙이 설명하지 못한 것을 숨기지 않는다. 설명하지 못한 까닭을 촬영마다 적는다.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2), ['dir']);
if (!args.dir) { console.error('사용법: node classify.mjs <diff 폴더> [--rules classify-rules.json]'); process.exit(2); }
const dir = path.resolve(args.dir);
const rulesFile = path.resolve(args.rules ?? path.join(path.dirname(fileURLToPath(import.meta.url)), 'classify-rules.json'));
const RULES = JSON.parse(await readFile(rulesFile, 'utf8')).shots;
const summary = JSON.parse(await readFile(path.join(dir, 'summary.json'), 'utf8'));
/**
 * --variants <json>: 한 빌드를 여러 번 찍어 잰 변종 자료(tools/variants.mjs). 쉼표로 여러 파일을 줄 수 있다.
 * 어떤 영역이 두 빌드 사이에서 다르게 나왔을 때, 그 촬영의 그 영역을 두 빌드에서 N번씩 찍은 자료가 있고
 * 두 빌드가 바이트까지 같은 그림을 낸 적이 있으면(shared), 그 차이는 한 빌드 안에서도 나오는 변종이다(within-build-variant).
 * 같은 그림을 낸 적이 한 번도 없으면 설명되지 않은 채로 둔다.
 */
const VARIANTS = new Map();
/** 영역 종류마다, 한 빌드 안에서 나온 변종 사이의 가장 큰 차이(눈에 띄는 픽셀). 반복 자료 전부에서 모은다 */
const REGION_MAX = {};
for (const file of String(args.variants ?? '').split(',').filter(Boolean)) {
  const v = JSON.parse(await readFile(path.resolve(file), 'utf8'));
  for (const r of v.rows) {
    if (!VARIANTS.has(r.id) || r.shared > 0) VARIANTS.set(r.id, { ...r, runsA: v.runsA, runsB: v.runsB });
    const within = Math.max(r.maxWithinA.solid, r.maxWithinB.solid);
    const e = (REGION_MAX[r.region] ??= { solid: 0, shots: 0, varied: 0 });
    e.shots++; if (r.withinA.length > 1 || r.withinB.length > 1) e.varied++;
    if (Number.isFinite(within) && within > e.solid) e.solid = within;
  }
}

const LAYOUT_FLAGS = new Set(['docHeight', 'boxMoved', 'elementCount', 'imageCount', 'scrollY', 'sizeMismatch', 'fonts']);
const TEXT_FLAGS = new Set(['textSet', 'textWrap']);
const SPECIAL = new Set(['target', 'dialog', 'scene']);
const test = (pattern, value) => pattern === undefined || new RegExp(pattern).test(String(value ?? ''));
const anyMatch = (patterns, value) => (patterns ?? []).some((p) => new RegExp(p).test(value));
const applicable = (meta) => RULES.filter((r) => test(r.route, meta.route) && test(r.group, meta.group) && test(r.key, meta.key) && test(r.shot, meta.shot));
const rewriteAll = (rules, text) => rules.reduce((t, r) => (r.rewrite ?? []).reduce((u, [from, to]) => u.replace(new RegExp(from, 'g'), to), t), text);

function classify(row) {
  if (!row.pixels) return { label: row.kind === 'both-not-applicable' ? 'not-applicable' : 'not-compared', why: [row.reason ?? row.kind] };
  const flags = row.flags ?? [];
  const regions = Object.entries(row.regions ?? {});
  const changed = regions.filter(([, r]) => !['same', 'noise'].includes(r.state));
  if (!flags.length && row.pixels.exact === 0 && !changed.length) return { label: 'identical', why: [] };
  if (!flags.length && row.pixels.solid === 0 && !changed.length) return { label: 'noise', why: [] };
  const rules = applicable(row.meta);
  const routeRules = rules.filter((r) => r.layout);
  const used = new Set(), unexplained = [], notes = [], variants = [];

  // 1. 영역
  const shifted = [];
  for (const [key, r] of changed) {
    if (r.state === 'aa-shift') {
      if (routeRules.length) { shifted.push(`${key}: 눈에 띄는 픽셀 ${r.solid}개(${(r.solidRatio * 100).toFixed(2)}%), 자리의 소수 부분 기준 [${r.offA}] 결과 [${r.offB}]${r.shiftTest ? `, 한 픽셀 [${r.shiftTest.shift}] 밀면 ${r.shiftTest.solid}개` : ''}`); routeRules.forEach((x) => used.add(x.id)); }
      else unexplained.push(`영역 ${key}: 자리의 소수 부분만 달라 가장자리가 다르지만(${r.solid}픽셀), 자리가 달라질 까닭을 설명하는 규칙이 없다`);
      continue;
    }
    // 글을 바꿔 쓰는 규칙(음수 금액의 표기): 기준 쪽 글을 바꿔 쓰면 결과 쪽 글과 같아지는가
    const rewriters = rules.filter((x) => x.rewrite);
    if (r.textA !== undefined && rewriters.length && rewriteAll(rewriters, r.textA) === r.textB && r.textA !== r.textB) { rewriters.forEach((x) => used.add(x.id)); continue; }
    const allow = rules.filter((x) => !x.onlyWithRewrite && (SPECIAL.has(key) ? x[key] === true : anyMatch(x.regions, key)));
    if (allow.length) { allow.forEach((x) => used.add(x.id)); continue; }
    // 한 빌드 안에서도 나오는 변종인가(반복 측정 자료가 있을 때만)
    const v = VARIANTS.get(row.id + '~' + key);
    // 조건 둘: (1) 그 촬영의 그 영역에서 두 빌드가 바이트까지 같은 그림을 낸 적이 있다 (2) 이번 차이의 크기가, 같은 종류의 영역에서 한 빌드 안에 나온 가장 큰 변종보다 크지 않다
    const regionMax = REGION_MAX[key.replace(/-\d+$/, '')];
    if (v && v.shared > 0 && regionMax && (r.solid ?? Infinity) > regionMax.solid) { unexplained.push(`영역 ${key}: 눈에 띄는 픽셀 ${r.solid}개. 두 빌드가 같은 그림을 낸 적은 있으나, 이 크기의 차이는 한 빌드 안에서 나온 적이 없다(빌드 안의 최대 ${regionMax.solid}픽셀)`); continue; }
    if (v && v.shared > 0) { variants.push(`${key}: 이번 차이는 눈에 띄는 픽셀 ${r.solid ?? '?'}개. 반복 측정(기준 ${v.runsA}번, 결과 ${v.runsB}번)에서 기준 안의 변종 [${v.withinA}], 결과 안의 변종 [${v.withinB}], 두 빌드에 바이트까지 같은 그림 ${v.shared}가지, 이 촬영에서 빌드 안의 최대 차이 ${Math.max(v.maxWithinA.solid, v.maxWithinB.solid)}픽셀, 같은 종류의 영역 전체(촬영 ${regionMax.shots}종)에서 빌드 안의 최대 차이 ${regionMax.solid}픽셀`); continue; }
    if (v && v.shared === 0) { unexplained.push(`영역 ${key}: ${r.state}, 눈에 띄는 픽셀 ${r.solid ?? '?'}개. 반복 측정(기준 ${v.runsA}번, 결과 ${v.runsB}번)에서 두 빌드가 같은 그림을 낸 적이 없다(빌드 사이의 가장 가까운 짝도 ${v.maxCross.solid}픽셀 다르다)`); continue; }
    unexplained.push(`영역 ${key}: ${r.state}${r.solid !== undefined ? `, 눈에 띄는 픽셀 ${r.solid}개` : ''}${r.sameText === false ? ', 글이 다름' : ''}${r.sameSize === false ? `, 크기 ${r.sizeA} → ${r.sizeB}` : ''}`);
  }

  // 2. 화면의 글(구역별)
  if (flags.includes('textSet')) {
    const t = row.detail.textSet;
    // 바꿔 쓰는 규칙으로 짝이 맞는 줄은 뺀다
    const rewriters = rules.filter((x) => x.rewrite);
    let outside = t.outside ?? [];
    if (rewriters.length) {
      const a = outside.filter((x) => x.startsWith('A ')).map((x) => rewriteAll(rewriters, x.slice(2))), b = outside.filter((x) => x.startsWith('B ')).map((x) => x.slice(2));
      const left = [...b];
      const restA = a.filter((x) => { const i = left.indexOf(x); if (i >= 0) { left.splice(i, 1); return false; } return true; });
      if (restA.length + left.length < outside.length) rewriters.forEach((x) => used.add(x.id));
      outside = [...restA.map((x) => 'A ' + x), ...left.map((x) => 'B ' + x)];
    }
    // 명세에 없는 차이로 적어 둔 글(규칙 파일의 undecidedText): 구역을 허락하는 규칙이 있어도 덮지 않고 설명 안 된 것으로 남긴다. 총괄이 의도된 것으로 정하면 그 항목을 지우고 규칙을 쓴다
    // undecidedRewrite 는 [찾을 것, 바꿀 것] 의 목록이다. 기준 쪽 줄을 그렇게 바꿔 쓰면 결과 쪽의 한 줄과 똑같아지는 짝만 센다(그 줄이 다른 까닭으로도 달라진 촬영은 여기서 가리지 못한다)
    for (const u of rules.filter((x) => x.undecidedRewrite)) {
      const b = new Set(outside.filter((x) => x.startsWith('B ')).map((x) => x.slice(2)));
      const hit = outside.filter((x) => x.startsWith('A ')).filter((x) => { const y = u.undecidedRewrite.reduce((t, [from, to]) => t.replace(new RegExp(from, 'g'), to), x.slice(2)); return y !== x.slice(2) && b.has(y); });
      if (hit.length) unexplained.push(`글: 명세에 없는 차이(${u.id}) ${hit.length}줄. 예: ${hit[0]}`);
    }
    const zones = new Set([...Object.keys(t.zonesA ?? {}), ...Object.keys(t.zonesB ?? {})]);
    const stillOutside = new Set(outside.map((x) => x.slice(2).split(' | ')[0]));
    for (const zone of zones) {
      // 바꿔 쓰기로 다 설명된 구역은 넘어간다(다만 처음부터 outside 에 없던 구역, 곧 후기와 별점 구역은 규칙으로만 설명한다)
      if (!['reviews', 'card-rating', 'ratinglink'].includes(zone) && !stillOutside.has(zone) && (t.outside ?? []).length < 60) continue;
      const allow = rules.filter((x) => !x.onlyWithRewrite && anyMatch(x.textZones, zone));
      if (allow.length) allow.forEach((x) => used.add(x.id));
      else unexplained.push(`글: 구역 ${zone} 에서 한쪽에만 있는 글(기준 ${t.zonesA?.[zone] ?? 0}줄, 결과 ${t.zonesB?.[zone] ?? 0}줄). 예: ${outside.find((x) => x.slice(2).startsWith(zone + ' |')) ?? ''}`);
    }
  }
  if (flags.includes('textWrap')) for (const w of row.detail.textWrap.list) { const allow = rules.filter((x) => anyMatch(x.textZones, w.zone)); if (allow.length) allow.forEach((x) => used.add(x.id)); else unexplained.push(`줄 수: 구역 ${w.zone} 의 "${w.text}" ${w.a}줄 → ${w.b}줄`); }

  // 3. 그 밖의 구조 기록
  for (const flag of flags) {
    if (TEXT_FLAGS.has(flag)) continue;
    if (LAYOUT_FLAGS.has(flag)) { if (routeRules.length) routeRules.forEach((x) => used.add(x.id)); else unexplained.push(`구조: ${flag} ${JSON.stringify(row.detail[flag]).slice(0, 200)}`); continue; }
    unexplained.push(`구조: ${flag} ${JSON.stringify(row.detail[flag]).slice(0, 200)}`);
  }

  // 4. 픽셀: 영역을 찍지 않았고 구조 기록도 같은데 눈에 띄는 픽셀이 다르면 설명할 것이 없다
  if (!flags.length && !changed.length && row.pixels.solid > 0) unexplained.push(`픽셀: 구조 기록과 영역은 같은데 눈에 띄는 픽셀 ${row.pixels.solid}개(${(row.pixels.solidRatio * 100).toFixed(4)}%)가 다르다${row.pixels.solidInsideHero ? '. 전부 홈 배너 안이다(기준선의 흔들림과 같은 자리)' : ''}`);

  if (unexplained.length) return { label: 'UNEXPLAINED', why: [...unexplained, ...variants.map((x) => '(변종으로 설명된 것) ' + x)], rules: Array.from(used) };
  // 규칙으로 설명되지 않는 영역이 전부 "한 빌드 안에서도 나오는 변종"이었다
  if (variants.length) return { label: 'within-build-variant', rules: Array.from(used), why: variants, checked: true };
  const special = regions.filter(([key]) => SPECIAL.has(key));
  const specialChanged = changed.filter(([key]) => SPECIAL.has(key));
  const checked = regions.length > 0;
  if (special.length && !specialChanged.length) return { label: 'background-only', rules: Array.from(used), why: [`${special.map(([k]) => k).join(', ')} 은 그대로(${special.map(([, r]) => r.state).join(', ')})`], checked };
  if (changed.length && changed.every(([, r]) => r.state === 'aa-shift')) return { label: 'position-aa', rules: Array.from(used), why: shifted, checked };
  return { label: 'intended', rules: Array.from(used), why: shifted.length ? ['자리 때문에 가장자리가 달리 그려진 영역: ' + shifted.join('; ')] : [], checked, sameRegions: regions.filter(([, r]) => ['same', 'noise'].includes(r.state)).map(([k]) => k) };
}

const out = summary.rows.map((row) => ({ id: row.id, group: row.group, kind: row.kind, solid: row.pixels?.solid ?? null, ...classify(row) }));
const count = (list, keyOf) => { const m = {}; for (const x of list) { const k = keyOf(x); m[k] = (m[k] ?? 0) + 1; } return m; };
const labelOf = (x) => (x.label === 'intended' ? (x.checked ? 'intended (구역 확인함)' : 'intended (구역 확인 못 함)') : x.label);
const totals = count(out, labelOf);
const byGroup = {};
for (const x of out) { (byGroup[x.group] ??= {})[labelOf(x)] = (byGroup[x.group][labelOf(x)] ?? 0) + 1; }
const byRule = count(out.filter((x) => x.rules?.length && x.label !== 'UNEXPLAINED').flatMap((x) => x.rules.map((r) => r + ' / ' + x.label)), (x) => x);
// 구역별 집계: 의도된 화면에서 허락되지 않은 구역이 몇 번 견줘졌고 어떤 상태였는가
const regionStats = {};
for (const row of summary.rows) for (const [key, r] of Object.entries(row.regions ?? {})) { const name = key.replace(/-\d+$/, ''); (regionStats[name] ??= {})[r.state] = (regionStats[name][r.state] ?? 0) + 1; }
await writeFile(path.join(dir, 'classified.json'), JSON.stringify({ generatedAt: new Date().toISOString(), rulesFile, a: summary.a, b: summary.b, totals, byGroup, byRule, regionStats, rows: out }, null, 1));

const labels = ['identical', 'noise', 'intended (구역 확인함)', 'intended (구역 확인 못 함)', 'background-only', 'position-aa', 'within-build-variant', 'UNEXPLAINED', 'not-compared', 'not-applicable'];
const md = ['# 차이의 분류', '', `만든 시각: ${new Date().toISOString()}`, `A(기준): ${summary.a.label} ${summary.a.baseUrl}`, `B(결과): ${summary.b.label} ${summary.b.baseUrl}`, `규칙: ${rulesFile}`, '', '갈래의 뜻은 classify.mjs 머리말에 있다. 이 문서는 통과를 말하지 않는다. UNEXPLAINED 는 사람이 그림을 봐야 하는 것이다.', '', '## 1. 갈래별 수', '', `촬영 ${out.length}건`, '', '| 갈래 | 수 |', '|---|---|'];
for (const l of labels) md.push(`| ${l} | ${totals[l] ?? 0} |`);
md.push('', '### 묶음별', '', `| 묶음 | ${labels.join(' | ')} |`, `|---|${labels.map(() => '---').join('|')}|`);
for (const [g, m] of Object.entries(byGroup)) md.push(`| ${g} | ${labels.map((l) => m[l] ?? 0).join(' | ')} |`);
md.push('', '### 규칙별(설명된 촬영)', '', '| 규칙과 갈래 | 촬영 수 |', '|---|---|');
for (const [k, v] of Object.entries(byRule).sort()) md.push(`| ${k} | ${v} |`);
md.push('', '## 2. 따로 찍은 영역의 상태', '', '영역마다 두 빌드를 견준 횟수와 결과다. same 과 noise 는 그대로라는 뜻, aa-shift 는 자리의 소수 부분만 달라 가장자리가 달리 그려진 것, differ, size, onlyA, onlyB 는 달라진 것이다.', '', '| 영역 | same | noise | aa-shift | differ | size | onlyA | onlyB |', '|---|---|---|---|---|---|---|---|');
for (const [name, m] of Object.entries(regionStats).sort()) md.push(`| ${name} | ${['same', 'noise', 'aa-shift', 'differ', 'size', 'onlyA', 'onlyB'].map((s) => m[s] ?? 0).join(' | ')} |`);
const un = out.filter((x) => x.label === 'UNEXPLAINED');
// 설명되지 않은 촬영의 항목. 한 번 다시 찍어 본다(홈 배너의 흔들림처럼 한 번만 생기는 것은 사라진다). 다시 찍어도 남으면 그대로 UNEXPLAINED 다
await writeFile(path.join(dir, 'reshoot-unexplained.txt'), Array.from(new Set(un.map((x) => x.id.split('__')[0]))).join(','));
md.push('', `## 3. UNEXPLAINED (${un.length}건)`, '');
if (!un.length) md.push('없음.');
for (const x of un) { md.push(`### ${x.id}`, '', `- 그림: \`${path.join(summary.a.dir, ...x.id.split('/'))}.png\` 와 \`${path.join(summary.b.dir, ...x.id.split('/'))}.png\`, 차이 그림 \`${path.join(dir, ...x.id.split('/'))}.diff.png\``); for (const w of x.why.slice(0, 12)) md.push(`- ${w}`); if (x.why.length > 12) md.push(`- 그 밖에 ${x.why.length - 12}가지`); md.push(''); }
const pos = out.filter((x) => x.label === 'position-aa');
md.push('', `## 4. position-aa (${pos.length}건)`, '', '크기와 글이 같고 자리의 소수 부분만 다른 것. 앞의 40건.', '');
for (const x of pos.slice(0, 40)) md.push(`- ${x.id}: ${x.why.join('; ')}`);
const wv = out.filter((x) => x.label === 'within-build-variant');
md.push('', `## 4-1. within-build-variant (${wv.length}건)`, '', '규칙이 허락하지 않은 영역이 달랐지만, 그 촬영을 두 빌드에서 여러 번씩 찍어 보니 두 빌드가 바이트까지 같은 그림을 냈고 같은 크기의 차이가 한 빌드 안에서도 나왔다.', '');
for (const x of wv) md.push(`- ${x.id}: ${x.why.join('; ')}`);
const nc = out.filter((x) => x.label === 'not-compared');
md.push('', `## 4-2. not-compared (${nc.length}건)`, '');
for (const x of nc) md.push(`- ${x.id}: ${x.why.join('; ')}`);
md.push('', '## 5. 한계', '', '- 구역을 따로 찍는 화면은 홈, 박스, 후기 화면뿐이다. 구역과 구역 사이의 빈 자리는 견주지 않는다.', '- "구역 확인 못 함"은 첫 화면 촬영처럼 구역을 찍지 않은 촬영이다. 같은 항목의 전체 촬영이 구역을 확인한다.', '- position-aa 는 크기, 글, 자리의 소수 부분, 눈에 띄는 픽셀의 비율(5% 미만)로 정한다. 그 픽셀이 정말 가장자리에만 있는지는 차이 그림(`<촬영 id>~<영역>.diff.png`)으로 본다.', '- 글은 촬영마다 700 덩어리까지만 견준다. 구조 기록의 요소는 정해 둔 선택자만 본다.', '');
await writeFile(path.join(dir, 'CLASSIFIED.md'), md.join('\n'));
console.log(labels.map((l) => `${l} ${totals[l] ?? 0}`).join(', '));
console.log('분류: ' + path.join(dir, 'CLASSIFIED.md'));
