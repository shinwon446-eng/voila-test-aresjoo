#!/usr/bin/env node
/**
 * 두 연출 측정을 견준다. 단계별 길이의 차이, 사건 순서, 장부를 쓴 때, 끼어들기 뒤의 장부.
 *
 *   node motion-compare.mjs <dirA> <dirB> <outDir> [--tolerance 50]
 *   예) node motion-compare.mjs ../motion/before-deployed ../motion/before-local ../motion/compare-baseline
 *
 * 길이는 가운데 값끼리 견준다. 같은 환경에서도 실행마다 몇 ms 씩 흔들리므로, 두 환경의 차이를 그 환경 안의 흔들림(가장 긴 값 빼기 가장 짧은 값)과
 * 나란히 적는다. 차이가 --tolerance(기본 50ms)를 넘거나 한쪽의 흔들림 폭보다 크면 "볼 것"으로 표시한다. 표시는 판정이 아니다.
 * 사건 순서는 시각을 떼고 종류의 차례만 견준다(저장소에 쓰는 횟수가 달라져도 드러난다).
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2), ['dirA', 'dirB', 'outDir']);
if (!args.dirA || !args.dirB || !args.outDir) { console.error('사용법: node motion-compare.mjs <dirA> <dirB> <outDir> [--tolerance 50]'); process.exit(2); }
const TOLERANCE = Number(args.tolerance ?? 50);
const load = async (dir) => JSON.parse(await readFile(path.join(path.resolve(dir), 'motion.json'), 'utf8'));
const A = await load(args.dirA), B = await load(args.dirB);
const outDir = path.resolve(args.outDir);
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
const sequence = (order) => order.map((e) => e.replace(/^-?\d+:/, ''));
/**
 * CSS 애니메이션 사건은 "끝남"과 "끊김"을 한 가지(마침)로 보고 견준다.
 * 충격 단계의 애니메이션(v-op-pop)은 길이가 단계 타이머와 같은 150ms 라서, 같은 환경에서도 실행마다 끝까지 가기도 하고
 * 다음 단계가 먼저 와서 끊기기도 한다(2026-10-12 실측: 로컬 3번 가운데 1번 끊김). 끊긴 횟수는 따로 적는다.
 */
const finish = (list) => list.map((e) => e.replace(/^animation(end|cancel):/, 'animationfinish:'));
// 실행마다의 애니메이션 사건을 차례를 떼고 묶음으로 본 것. 같은 프레임에 끝나는 사건들은 같은 빌드 안에서도 실행마다 차례가 바뀐다(2026-10-13 실측)
const bags = (c) => Array.from(new Set((c.animationRuns ?? [c.animations]).map((r) => finish(r).slice().sort().join('|'))));
const orders = (c) => Array.from(new Set((c.animationRuns ?? [c.animations]).map((r) => finish(r).join('|'))));
const cancels = (c) => { const runs = c.animationRuns ?? [c.animations]; const names = new Set(runs.flat().filter((e) => e.startsWith('animationcancel:')).map((e) => e.slice('animationcancel:'.length))); return Array.from(names).map((name) => `${name} ${runs.filter((r) => r.includes('animationcancel:' + name)).length}/${runs.length}`); };
const PHASES = ['pressToOverlay', 'anticipation', 'impact', 'exit', 'revealToReady', 'pressToReveal', 'pressToReady'];

const cases = [];
for (const key of Array.from(new Set([...A.cases.map((c) => c.key), ...B.cases.map((c) => c.key)]))) {
  const a = A.cases.find((c) => c.key === key), b = B.cases.find((c) => c.key === key);
  if (!a || !b) { cases.push({ key, onlyIn: a ? 'A' : 'B' }); continue; }
  const phases = PHASES.map((phase) => {
    const x = a.durations[phase], y = b.durations[phase];
    if (x.median === null || y.median === null) return { phase, a: x.median, b: y.median, delta: null, look: x.median !== y.median };
    const delta = y.median - x.median, jitter = Math.max((x.max ?? 0) - (x.min ?? 0), (y.max ?? 0) - (y.min ?? 0));
    return { phase, a: x.median, b: y.median, delta, jitterA: (x.max ?? 0) - (x.min ?? 0), jitterB: (y.max ?? 0) - (y.min ?? 0), valuesA: x.values, valuesB: y.values, apart: x.min != null && y.min != null && (y.min > x.max || x.min > y.max), look: Math.abs(delta) > TOLERANCE || (Math.abs(delta) > jitter && Math.abs(delta) > 20) };
  });
  const orderSame = same(sequence(a.order), sequence(b.order));
  cases.push({
    key, title: a.title, okRunsA: `${a.okRuns}/${a.runs}`, okRunsB: `${b.okRuns}/${b.runs}`, phases,
    orderSame, orderA: orderSame ? undefined : sequence(a.order), orderB: orderSame ? undefined : sequence(b.order),
    // 같음: 두 빌드의 모든 실행에서 사건의 묶음(차례를 뗀 것)이 한 가지로 같다. 차례는 따로 센다
    animationsSame: bags(a).length === 1 && same(bags(a), bags(b)), animationBagsA: bags(a).length, animationBagsB: bags(b).length,
    animationOrdersA: orders(a).length, animationOrdersB: orders(b).length, animationOrderShared: orders(a).some((o) => orders(b).includes(o)),
    animationsA: bags(a).length === 1 && same(bags(a), bags(b)) ? undefined : a.animationRuns, animationsB: bags(a).length === 1 && same(bags(a), bags(b)) ? undefined : b.animationRuns,
    cancelsA: cancels(a), cancelsB: cancels(b),
    // 결과의 크기에 따른 효과(톤, 종류, 상표 띠, 후광, 사진, 가장 큰 결과 칸)와 소리, 진동의 호출 목록
    effectsSame: same(a.effects ?? null, b.effects ?? null), effectsA: a.effects ?? null, effectsB: same(a.effects ?? null, b.effects ?? null) ? undefined : b.effects ?? null,
    callsSame: same(a.callRuns ?? [], b.callRuns ?? []), callsA: (a.callRuns ?? [])[0] ?? [], callsB: same(a.callRuns ?? [], b.callRuns ?? []) ? undefined : b.callRuns,
    callsStableA: (a.callRuns ?? []).every((r) => same(r, (a.callRuns ?? [])[0])), callsStableB: (b.callRuns ?? []).every((r) => same(r, (b.callRuns ?? [])[0])),
    ledgerBeforeRevealA: a.ledger.writtenBeforeReveal, ledgerBeforeRevealB: b.ledger.writtenBeforeReveal, ledgerBeforeOverlayA: a.ledger.writtenBeforeOverlay, ledgerBeforeOverlayB: b.ledger.writtenBeforeOverlay,
    ledgerAfterSame: same(a.ledgerAfter, b.ledgerAfter), ledgerAfterA: same(a.ledgerAfter, b.ledgerAfter) ? undefined : a.ledgerAfter, ledgerAfterB: same(a.ledgerAfter, b.ledgerAfter) ? undefined : b.ledgerAfter,
    slowFramesA: a.frameStats.map((f) => f?.over34ms ?? null), slowFramesB: b.frameStats.map((f) => f?.over34ms ?? null), errorsA: a.errors, errorsB: b.errors,
  });
}
const interrupts = [];
for (const key of Array.from(new Set([...A.interrupts.map((c) => c.case), ...B.interrupts.map((c) => c.case)]))) {
  const a = A.interrupts.find((c) => c.case === key), b = B.interrupts.find((c) => c.case === key);
  if (!a || !b) { interrupts.push({ key, onlyIn: a ? 'A' : 'B' }); continue; }
  const steps = [];
  for (let i = 0; i < Math.max(a.steps.length, b.steps.length); i++) {
    const x = a.steps[i], y = b.steps[i];
    steps.push({ name: x?.name ?? y?.name, same: !!x && !!y && same({ l: x.ledger, d: x.dom }, { l: y.ledger, d: y.dom }), a: x ? { tx: x.ledger.account.transactions.length, items: x.ledger.account.items.length, nonce: x.ledger.fairNonce, seen: x.ledger.journalSeen, recover: x.dom.recover, op: x.dom.op } : null, b: y ? { tx: y.ledger.account.transactions.length, items: y.ledger.account.items.length, nonce: y.ledger.fairNonce, seen: y.ledger.journalSeen, recover: y.dom.recover, op: y.dom.op } : null, fullA: !x || !y || same({ l: x.ledger, d: x.dom }, { l: y.ledger, d: y.dom }) ? undefined : x, fullB: !x || !y || same({ l: x.ledger, d: x.dom }, { l: y.ledger, d: y.dom }) ? undefined : y });
  }
  interrupts.push({ key, title: a.title, errorA: a.error ?? null, errorB: b.error ?? null, steps, allSame: steps.every((s) => s.same) && !a.error && !b.error });
}
await mkdir(outDir, { recursive: true });
const summary = { generatedAt: new Date().toISOString(), toleranceMs: TOLERANCE, a: { label: A.label, baseUrl: A.baseUrl, startedAt: A.startedAt, runsPerCase: A.runsPerCase }, b: { label: B.label, baseUrl: B.baseUrl, startedAt: B.startedAt, runsPerCase: B.runsPerCase }, cases, interrupts, notRun: A.notRun };
await writeFile(path.join(outDir, 'motion-compare.json'), JSON.stringify(summary, null, 1));
const md = ['# 연출 비교', '', `A: ${A.label} (${A.baseUrl}), 경우마다 ${A.runsPerCase}번`, `B: ${B.label} (${B.baseUrl}), 경우마다 ${B.runsPerCase}번`, '', `길이는 ms, 가운데 값이다. "볼 것"은 차이가 ${TOLERANCE}ms 를 넘거나 실행 사이의 흔들림보다 큰 칸이다. 판정이 아니다.`, '', '## 단계별 길이의 차이 (B 빼기 A)', '', '| 경우 | 누름→화면 | 기대 | 충격 | 퇴장 | 결과→단추 | 누름→결과 | 누름→단추 | 사건 순서 | CSS 애니메이션 | 끝난 뒤 장부 |', '|---|---|---|---|---|---|---|---|---|---|---|'];
const cell = (p) => (p.a === null && p.b === null ? '없음' : `${p.a ?? '없음'} / ${p.b ?? '없음'}${p.delta === null ? '' : ` (${p.delta >= 0 ? '+' : ''}${p.delta})`}${p.look ? ' **볼 것**' : ''}`);
for (const c of cases) md.push(c.onlyIn ? `| ${c.key} | ${c.onlyIn} 에만 있음 | | | | | | | | | |` : `| ${c.key} | ${c.phases.map(cell).join(' | ')} | ${c.orderSame ? '같음' : '**다름**'} | ${c.animationsSame ? '같음' : '**다름**'}${c.animationOrdersA > 1 || c.animationOrdersB > 1 ? ` (차례 A ${c.animationOrdersA}가지, B ${c.animationOrdersB}가지${c.animationOrderShared ? '' : ', 같은 차례 없음'})` : ''} | ${c.ledgerAfterSame ? '같음' : '**다름**'} |`);
md.push('', '칸의 꼴: A / B (차이). CSS 애니메이션은 사건의 묶음(끝남과 끊김을 한 가지로, 차례를 떼고)이 모든 실행에서 같으면 같음이다. 같은 프레임에 끝나는 사건의 차례가 실행마다 바뀌면 그 가짓수를 괄호에 적는다.', '');
const apart = cases.flatMap((c) => (c.phases ?? []).filter((p) => p.apart).map((p) => ({ key: c.key, ...p })));
md.push('## 두 빌드의 값이 겹치지 않는 칸', '', '실행마다의 값을 늘어놓았을 때 한 빌드의 가장 큰 값이 다른 빌드의 가장 작은 값보다 작은 칸. 차이가 작아도 한쪽으로 치우쳐 있다는 뜻이다. 실행이 세 번씩이면 우연으로도 열에 한 번쯤 나온다.', '', '| 경우 | 단계 | A 의 값 | B 의 값 | 가운데 값의 차이 |', '|---|---|---|---|---|');
for (const p of apart) md.push(`| ${p.key} | ${p.phase} | ${p.valuesA.join(', ')} | ${p.valuesB.join(', ')} | ${p.delta >= 0 ? '+' : ''}${p.delta} |`);
if (!apart.length) md.push('| 없음 | | | | |');
md.push('', '## 장부를 쓴 때', '', '결과가 화면에 드러나기 전에, 그리고 개봉 화면이 뜨기 전에 보관함 기록이 이미 저장소에 쓰였는가(실행마다).', '', '| 경우 | 결과보다 먼저 A | 결과보다 먼저 B | 개봉 화면보다 먼저 A | 개봉 화면보다 먼저 B | 34ms 넘는 프레임 수 A | B |', '|---|---|---|---|---|---|---|');
for (const c of cases.filter((x) => !x.onlyIn)) md.push(`| ${c.key} | ${c.ledgerBeforeRevealA.join(', ')} | ${c.ledgerBeforeRevealB.join(', ')} | ${c.ledgerBeforeOverlayA.join(', ')} | ${c.ledgerBeforeOverlayB.join(', ')} | ${c.slowFramesA.join(', ')} | ${c.slowFramesB.join(', ')} |`);
md.push('', '## 결과의 크기에 따른 효과와 소리, 진동', '', '효과는 결과가 다 보인 뒤의 개봉 화면에서 읽은 것(톤, 종류, 상표 띠, 후광, 사진, 여러 개 결과의 가장 큰 결과 칸). 호출은 누른 뒤 앱이 부른 소리와 진동의 목록(실행마다).', '', '| 경우 | 효과가 같은가 | 효과(A) | 호출이 같은가 | 호출(A, 첫 실행) |', '|---|---|---|---|---|');
for (const c of cases.filter((x) => !x.onlyIn)) { const e = c.effectsA; md.push(`| ${c.key} | ${c.effectsSame ? '같음' : '**다름**'} | ${e ? (e.root === 'v-op' ? `톤 ${e.tone}, ${e.kind}${e.brand ? ', 상표 띠' : ''}${e.halo ? ', 후광' : ''}${e.photo ? ', 사진' : ''}` : `여러 개, 줄 ${e.rows}${e.best ? ', 가장 큰 결과: ' + e.best.slice(0, 50) : ', 가장 큰 결과 칸 없음'}`) : '없음'} | ${c.callsSame ? '같음' : '**다름**'}${c.callsStableA && c.callsStableB ? '' : ' (실행마다 다름)'} | ${c.callsA.length ? c.callsA.length + '번: ' + Array.from(new Set(c.callsA)).slice(0, 6).join(', ') : '없음'} |`); }
md.push('', '## 끊긴 CSS 애니메이션', '', '끝까지 가지 못하고 다음 단계가 먼저 와서 끊긴 애니메이션과 그 횟수(끊긴 실행 수/전체 실행 수). 견줄 때는 끝남과 끊김을 한 가지로 본다.', '', '| 경우 | A | B |', '|---|---|---|');
for (const c of cases.filter((x) => !x.onlyIn)) md.push(`| ${c.key} | ${c.cancelsA.join(', ') || '없음'} | ${c.cancelsB.join(', ') || '없음'} |`);
md.push('', '## 끼어들기 뒤의 장부', '', '칸의 꼴: 거래 수, 상품 수, nonce, 본 기록 수, 다시 보기 단추.', '', '| 경우 | 단계 | A | B | 같은가 |', '|---|---|---|---|---|');
const led = (x) => (x ? `${x.tx}, ${x.items}, ${x.nonce}, ${x.seen}, ${x.recover ? '있음' : '없음'}` : '없음');
for (const r of interrupts) { if (r.onlyIn) { md.push(`| ${r.key} | ${r.onlyIn} 에만 있음 | | | |`); continue; } if (r.errorA || r.errorB) md.push(`| ${r.key} | (오류) | ${r.errorA ?? ''} | ${r.errorB ?? ''} | **다름** |`); for (const s of r.steps) md.push(`| ${r.key} | ${s.name} | ${led(s.a)} | ${led(s.b)} | ${s.same ? '같음' : '**다름**'} |`); }
const orderDiff = cases.filter((c) => c.orderSame === false);
if (orderDiff.length) { md.push('', '## 사건 순서가 다른 경우', ''); for (const c of orderDiff) md.push(`### ${c.key}`, '', `- A: ${c.orderA.join(' → ')}`, `- B: ${c.orderB.join(' → ')}`, ''); }
md.push('', '## 실행하지 않은 것', '');
for (const n of A.notRun ?? []) md.push(`- ${n.title}: ${n.reason}`);
await writeFile(path.join(outDir, 'MOTION_COMPARE.md'), md.join('\n') + '\n');
const looks = cases.reduce((n, c) => n + (c.phases?.filter((p) => p.look).length ?? 0), 0);
console.log(`값이 겹치지 않는 칸 ${apart.length}개 (${Array.from(new Set(apart.map((p) => p.phase))).map((ph) => ph + ' ' + apart.filter((p) => p.phase === ph).length).join(', ')}), CSS 애니메이션 묶음이 다른 경우 ${cases.filter((c) => c.animationsSame === false).length}건`);
console.log(`경우 ${cases.length}건, 볼 것으로 표시한 길이 칸 ${looks}개, 사건 순서가 다른 경우 ${orderDiff.length}건, 끼어들기에서 다른 것 ${interrupts.filter((r) => !r.allSame).length}건`);
console.log('요약: ' + path.join(outDir, 'MOTION_COMPARE.md'));
