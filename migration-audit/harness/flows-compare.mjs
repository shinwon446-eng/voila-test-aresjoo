#!/usr/bin/env node
/**
 * 두 흐름 검사 기록을 칸마다 견주고, 다른 칸을 규칙에 비춰 나눈다.
 *
 *   node flows-compare.mjs <dirA> <dirB> <outDir> [--rules classify-rules.json]
 *   예) node flows-compare.mjs ../flows/before-local ../flows/after-result ../flows/compare-after-result
 *
 * 견주기 전에 맞추는 것(실행마다 달라질 수밖에 없는 값)
 *   - 무작위 번호: 보관함 기록(own_), 거래(tx_), 개봉(op_), 브라우저 계정(browser_), 후기(my_), 그 밖의 UUID.
 *     시나리오 안에서 처음 나온 순서대로 own_#1, own_#2 처럼 바꾼다. 번호의 "값"은 달라도 "어느 것끼리 같은 번호인가"는 견준다.
 *   - 콘솔 글의 겉모습: 첫 줄만, 응답 상태의 설명 글과 묶음 파일 이름의 해시를 떼고, 순서 없이 견준다(아래 consoleKey).
 *   - 그 밖에는 아무것도 맞추지 않는다. 시각은 두 실행이 같은 고정 시계를 쓰므로 그대로 견준다.
 *
 * 다른 칸의 갈래(classify-rules.json 의 flows)
 *   장부      저장된 값(storage 아래 전부: 지갑, 보관함, 거래, 시드와 nonce, 세션, 저장 키). 규칙으로 덮지 않는다. 시나리오마다 따로 적는다
 *   의도      규칙이 허락한 칸. 규칙 번호를 붙인다. 바꿔 쓰는 규칙(음수 금액의 표기)은 기준 쪽 값을 바꿔 쓰면 결과 쪽 값과 같아질 때만 맞는다
 *   설명 안 됨  어느 규칙에도 맞지 않는 칸
 *
 * 단계의 판정말
 *   같음            두 쪽 모두 실행했고 관찰값이 전부 같다
 *   의도된 차이      다른 칸이 전부 규칙에 맞는다(장부 칸은 같다)
 *   설명 안 됨       규칙에 맞지 않는 칸이 있다
 *   장부 다름        저장된 값이 다르다
 *   검증 불가        두 쪽 모두 실행하지 않았다(까닭을 적는다). 같음으로 세지 않는다
 *   한쪽만 실행      한쪽만 실행했다. 견주지 못했다
 *   오류            한쪽 또는 두 쪽에서 실행이 멈췄다
 * 이 도구는 통과를 말하지 않는다.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2), ['dirA', 'dirB', 'outDir']);
if (!args.dirA || !args.dirB || !args.outDir) { console.error('사용법: node flows-compare.mjs <dirA> <dirB> <outDir> [--rules classify-rules.json]'); process.exit(2); }
const load = async (dir) => JSON.parse(await readFile(path.join(path.resolve(dir), 'flows.json'), 'utf8'));
const A = await load(args.dirA), B = await load(args.dirB);
const outDir = path.resolve(args.outDir);
const rulesFile = path.resolve(args.rules ?? path.join(path.dirname(fileURLToPath(import.meta.url)), 'classify-rules.json'));
const FLOW = JSON.parse(await readFile(rulesFile, 'utf8')).flows;

const ID = /\b([a-z]{1,12})_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b|\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g;
/**
 * 콘솔 글을 견줄 수 있는 꼴로 줄인다. 환경이 달라서 생기는 겉모습만 걷어 낸다(무엇이 실패했는지는 남는다).
 *   - 첫 줄만 쓴다(그 아래는 빌드마다 이름이 다른 묶음 파일의 호출 자리다)
 *   - 응답 상태의 설명 글을 뗀다: HTTP/2(배포)는 "404 ()", HTTP/1.1(로컬 서버)은 "404 (Not Found)" 로 찍힌다
 *   - 묶음 파일 이름의 해시를 뗀다: 같은 커밋도 빌드한 곳이 다르면 이름이 다르다(2026-10-12 실측)
 *   - 순서는 보지 않는다: 동시에 실패한 요청들의 차례는 실행마다 다르다
 */
const consoleKey = (list) => (list ?? []).map((text) => String(text).split(/\r?\n/)[0].replace(/(status of \d+) \([^)]*\)/, '$1').replace(/\/_next\/static\/chunks\/[^\s:)'"]+/g, '/_next/static/chunks/*').trim()).sort();
/** 시나리오 하나의 무작위 번호를 처음 나온 순서의 자리표로 바꾼다. */
function normalize(scenario) {
  const seen = new Map(), counters = {};
  const text = JSON.stringify(scenario).replace(ID, (match, prefix) => {
    if (!seen.has(match)) { const kind = prefix ?? 'uuid'; counters[kind] = (counters[kind] ?? 0) + 1; seen.set(match, `${kind}_#${counters[kind]}`); }
    return seen.get(match);
  });
  const out = JSON.parse(text);
  for (const step of out.steps) if (step.console) step.console = consoleKey(step.console);
  return out;
}

const short = (value) => { const text = typeof value === 'string' ? value : JSON.stringify(value); return text === undefined ? '(없음)' : text.length > 220 ? text.slice(0, 220) + '…' : text; };
/** 두 값에서 다른 칸의 경로를 모은다(값은 그대로 둔다). */
function diffPaths(a, b, base, out, limit = 400) {
  if (out.length >= limit) return;
  if (a === b) return;
  const ta = Array.isArray(a) ? 'array' : a === null ? 'null' : typeof a, tb = Array.isArray(b) ? 'array' : b === null ? 'null' : typeof b;
  if (ta !== tb || (ta !== 'object' && ta !== 'array')) { out.push({ path: base, a, b }); return; }
  if (ta === 'array') {
    if (a.length !== b.length) out.push({ path: base + '.length', a: a.length, b: b.length });
    for (let i = 0; i < Math.min(a.length, b.length); i++) diffPaths(a[i], b[i], `${base}[${i}]`, out, limit);
    return;
  }
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) diffPaths(a[key], b[key], base ? `${base}.${key}` : key, out, limit);
}

const re = (pattern) => new RegExp(pattern);
const allowed = (p) => (FLOW.ledgerAllowed ?? []).find((x) => re(x.path).test(p));
/** 다른 칸 하나의 갈래 */
function judge(diff, scenarioKey, stepName) {
  if (/^storage(\.|\[|$)/.test(diff.path)) { const hit = allowed(diff.path); return hit ? { kind: 'rule', rule: hit.id } : { kind: 'ledger' }; }
  for (const rule of FLOW.rules) {
    if (rule.scenario && !re(rule.scenario).test(scenarioKey)) continue;
    if (rule.step && !re(rule.step).test(stepName)) continue;
    if (!re(rule.path).test(diff.path)) continue;
    if (rule.rewrite) {
      if (typeof diff.a !== 'string' || typeof diff.b !== 'string') continue;
      const rewritten = rule.rewrite.reduce((t, [from, to]) => t.replace(new RegExp(from, 'g'), to), diff.a);
      if (rewritten !== diff.b) continue;
    }
    return { kind: 'rule', rule: rule.id };
  }
  return { kind: 'unexplained' };
}

const VERDICTS = ['같음', '의도된 차이', '설명 안 됨', '장부 다름', '검증 불가', '한쪽만 실행', '오류'];
const keyOf = (s) => `${s.key} ${s.variant}`;
const mapA = new Map(A.scenarios.map((s) => [keyOf(s), s])), mapB = new Map(B.scenarios.map((s) => [keyOf(s), s]));
const rows = [];
for (const key of Array.from(new Set([...mapA.keys(), ...mapB.keys()])).sort()) {
  const ra = mapA.get(key), rb = mapB.get(key);
  if (!ra || !rb) { rows.push({ key, title: (ra ?? rb).title, only: ra ? 'A' : 'B', steps: [] }); continue; }
  const a = normalize(ra), b = normalize(rb);
  const steps = [];
  for (let i = 0; i < Math.max(a.steps.length, b.steps.length); i++) {
    const sa = a.steps[i], sb = b.steps[i];
    const name = sa?.name ?? sb?.name;
    if (!sa || !sb) { steps.push({ n: i + 1, name, verdict: '한쪽만 실행', a: sa?.status ?? '없음', b: sb?.status ?? '없음' }); continue; }
    if (sa.status === 'error' || sb.status === 'error') { steps.push({ n: i + 1, name: sa.name === sb.name ? name : `${sa.name} / ${sb.name}`, verdict: '오류', a: sa.error ?? sa.status, b: sb.error ?? sb.status }); continue; }
    if (sa.name !== sb.name) { steps.push({ n: i + 1, name: `${sa.name} / ${sb.name}`, verdict: '설명 안 됨', fields: [{ path: 'name', a: sa.name, b: sb.name, kind: 'unexplained' }] }); continue; }
    if (sa.status === 'cannot-verify' && sb.status === 'cannot-verify') { steps.push({ n: i + 1, name, verdict: '검증 불가', reason: sa.reason }); continue; }
    if (sa.status !== sb.status) { steps.push({ n: i + 1, name, verdict: '한쪽만 실행', a: sa.status + (sa.reason ? ': ' + sa.reason : ''), b: sb.status + (sb.reason ? ': ' + sb.reason : '') }); continue; }
    const diffs = [];
    diffPaths(sa.observed, sb.observed, 'observed', diffs);
    diffPaths(sa.storage, sb.storage, 'storage', diffs);
    diffPaths(sa.console, sb.console, 'console', diffs);
    diffPaths(sa.blocked, sb.blocked, 'blocked', diffs);
    diffPaths(sa.notes ?? {}, sb.notes ?? {}, 'notes', diffs);
    const fields = diffs.map((d) => ({ ...d, ...judge(d, ra.key, name) }));
    const has = (kind) => fields.some((f) => f.kind === kind);
    const verdict = !fields.length ? '같음' : has('ledger') ? '장부 다름' : has('unexplained') ? '설명 안 됨' : '의도된 차이';
    steps.push({ n: i + 1, name, verdict, rules: Array.from(new Set(fields.filter((f) => f.rule).map((f) => f.rule))), fields: fields.length ? fields : undefined, ledgerCompared: true });
  }
  const tally = (v) => steps.filter((s) => s.verdict === v).length;
  rows.push({ key, scenario: ra.key, title: ra.title, statusA: ra.status, statusB: rb.status, steps, counts: Object.fromEntries(VERDICTS.map((v) => [v, tally(v)])),
    ledger: { comparedSteps: steps.filter((s) => s.ledgerCompared).length, differingSteps: tally('장부 다름'), fields: steps.flatMap((s) => (s.fields ?? []).filter((f) => f.kind === 'ledger').map((f) => ({ step: s.n + ' ' + s.name, path: f.path, a: f.a, b: f.b }))) } });
}
await mkdir(outDir, { recursive: true });
const totals = Object.fromEntries(VERDICTS.map((v) => [v, rows.reduce((n, r) => n + (r.counts?.[v] ?? 0), 0)]));
const fieldTotals = { rule: {}, unexplained: 0, ledger: 0 };
for (const r of rows) for (const s of r.steps) for (const f of s.fields ?? []) { if (f.kind === 'rule') fieldTotals.rule[f.rule] = (fieldTotals.rule[f.rule] ?? 0) + 1; else fieldTotals[f.kind]++; }
const ruleFields = Object.values(fieldTotals.rule).reduce((x, y) => x + y, 0);
const summary = { generatedAt: new Date().toISOString(), rulesFile, a: { label: A.label, baseUrl: A.baseUrl, startedAt: A.startedAt }, b: { label: B.label, baseUrl: B.baseUrl, startedAt: B.startedAt }, totals, fieldTotals, scenarios: rows };
await writeFile(path.join(outDir, 'flows-compare.json'), JSON.stringify(summary, null, 1));

const md = ['# 흐름 비교', '', `A: ${A.label} (${A.baseUrl})`, `B: ${B.label} (${B.baseUrl})`, `규칙: ${rulesFile}`, '', '같음은 "두 환경에서 실행했고 적은 값이 전부 같다"는 뜻이다. 검증 불가와 한쪽만 실행은 같음으로 세지 않는다. 판정말의 뜻은 flows-compare.mjs 머리말에 있다.', '', `단계 합계: ${VERDICTS.map((v) => `${v} ${totals[v]}`).join(', ')}`, '', `다른 칸 합계: 규칙에 맞는 칸 ${ruleFields} (${Object.entries(fieldTotals.rule).map(([k, v]) => `${k} ${v}`).join(', ') || '없음'}), 설명 안 되는 칸 ${fieldTotals.unexplained}, 장부 칸 ${fieldTotals.ledger}`, '', `| 시나리오 | 변형 | A | B | ${VERDICTS.join(' | ')} | 장부 |`, `|---|---|---|---|${VERDICTS.map(() => '---').join('|')}|---|`];
for (const r of rows) { const [k, v] = r.key.split(' '); md.push(r.counts ? `| ${k} ${r.title} | ${v} | ${r.statusA} | ${r.statusB} | ${VERDICTS.map((x) => r.counts[x]).join(' | ')} | ${r.ledger.differingSteps ? `**다름** (${r.ledger.differingSteps}단계, ${r.ledger.fields.length}칸)` : `같음 (견준 단계 ${r.ledger.comparedSteps}개)`} |` : `| ${k} ${r.title} | ${v} | ${r.only === 'A' ? '있음' : '없음'} | ${r.only === 'B' ? '있음' : '없음'} | | | | | | | | |`); }
md.push('', '## 장부(저장된 값)', '', '지갑, 보관함, 거래, 시드와 nonce, 세션, 저장 키 전부. 두 쪽이 같아야 한다.', '');
let any = false;
for (const r of rows) if (r.ledger?.fields.length) { any = true; md.push(`### ${r.key}`, ''); for (const f of r.ledger.fields.slice(0, 30)) md.push(`- ${f.step}: \`${f.path}\` A ${short(f.a)} / B ${short(f.b)}`); if (r.ledger.fields.length > 30) md.push(`- 그 밖에 ${r.ledger.fields.length - 30}칸`); md.push(''); }
if (!any) md.push(`다른 칸 없음. 견준 단계 ${rows.reduce((n, r) => n + (r.ledger?.comparedSteps ?? 0), 0)}개 전부에서 저장된 값이 같다.`, '');
md.push('## 설명 안 되는 칸', '');
any = false;
for (const r of rows) for (const s of r.steps.filter((x) => (x.fields ?? []).some((f) => f.kind === 'unexplained'))) { any = true; const list = s.fields.filter((f) => f.kind === 'unexplained'); md.push(`### ${r.key}, ${s.n}번 ${s.name}`, ''); for (const f of list.slice(0, 15)) md.push(`- \`${f.path}\`: A ${short(f.a)} / B ${short(f.b)}`); if (list.length > 15) md.push(`- 그 밖에 ${list.length - 15}칸`); md.push(''); }
if (!any) md.push('없음.', '');
md.push('## 의도된 차이(단계별, 다른 칸과 맞은 규칙)', '');
any = false;
// 시나리오와 규칙마다 한 줄: 그 규칙이 맞은 단계의 번호와, 달랐던 칸(배열의 자리 번호는 뗀다)
for (const r of rows) {
  const by = {};
  for (const s of r.steps) for (const f of (s.fields ?? []).filter((x) => x.kind === 'rule')) { const e = (by[f.rule] ??= { steps: new Set(), paths: new Set() }); e.steps.add(s.n); e.paths.add(f.path.replace(/\[\d+\]/g, '[]')); }
  for (const [rule, e] of Object.entries(by)) { any = true; md.push(`- ${r.key}, ${rule}: 단계 ${Array.from(e.steps).join(', ')}. 칸: ${Array.from(e.paths).slice(0, 14).join(', ')}${e.paths.size > 14 ? ` 외 ${e.paths.size - 14}` : ''}`); }
}
if (!any) md.push('없음.');
md.push('', '## 오류와 한쪽만 실행한 단계', '');
any = false;
for (const r of rows) for (const s of r.steps.filter((x) => x.verdict === '오류' || x.verdict === '한쪽만 실행')) { any = true; md.push(`- ${r.key}, ${s.n}번 ${s.name}: ${s.verdict}. A ${short(s.a)} / B ${short(s.b)}`); }
if (!any) md.push('없음.');
md.push('', '## 검증 불가(두 쪽 모두 실행하지 않음)', '');
const cannot = new Map();
for (const r of rows) for (const s of r.steps.filter((x) => x.verdict === '검증 불가')) cannot.set(`${r.key.split(' ')[0]} ${s.name}`, s.reason);
for (const [name, reason] of cannot) md.push(`- ${name}: ${reason}`);
if (!cannot.size) md.push('없음.');
await writeFile(path.join(outDir, 'FLOWS_COMPARE.md'), md.join('\n') + '\n');
console.log(`단계: ${VERDICTS.map((v) => `${v} ${totals[v]}`).join(', ')}`);
console.log(`다른 칸: 규칙 ${ruleFields}, 설명 안 됨 ${fieldTotals.unexplained}, 장부 ${fieldTotals.ledger}`);
console.log('요약: ' + path.join(outDir, 'FLOWS_COMPARE.md'));
