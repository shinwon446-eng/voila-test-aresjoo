// 개봉 경험 임무의 확률 구조 제안. 계산과 시뮬레이션만 한다. 운영 확률(lib/products.ts)은 건드리지 않는다.
// 2026-10-11 파운더 지시로 운영 확률표가 바뀌었다(받는 값 기준 99%). "지금 구조"는 그 새 표를 읽는다. 모델 A, B, C 는 그 전에 낸 제안(95%)으로 남겨 둔다.
// 박스 열넷 전체의 숫자는 scripts/opening/odds-report.ts 가 만든다(opening/ODDS.md).
//   npx tsx scripts/opening/probability.ts            → ../opening/PROBABILITY-tables.md 를 쓴다
// 모델 셋(A 고른 분포, B 큰 변동, C 최저 보장)과 지금 구조를 같은 표로 비교한다. 박스 가격은 50 USDT 로 놓는다(배수는 다른 가격에도 그대로 적용된다).
// 금액은 전부 "실제로 받는 USDT 기준 값"이다(USDT 결과는 그 금액, 상품은 참고가의 95%).
// Codex 검산(opening/codex/round-b.md B-2)을 반영했다: 지금 구조는 상품을 묶지 않고 전부 계산한다, 확률은 넷째 자리까지 적는다,
// 카이제곱은 기대 도수가 5 이상이 될 때까지 칸을 합친다, 난수는 sfc32 와 정수 버림 추출을 쓰고 모델별 씨앗을 적는다.
import { writeFileSync } from "node:fs";
import { BOXES, dropTable, sellValueOf } from "../../lib/products";

const PRICE = 50;
const DRAWS = 100_000;
const SEEDS: Record<string, number> = { now: 20261011, A: 20261012, B: 20261013, C: 20261014 };
const UNIT = 1_000_000; // 확률 해상도 0.0001% (lib/fairness 의 ROLL_RANGE 와 같다)

type Outcome = { label: string; value: number; units: number; tail?: boolean };
type Model = { key: string; name: string; idea: string; rule?: string; outcomes: Outcome[] };

const fmtPct = (units: number) => ((units / UNIT) * 100).toFixed(4) + "%";
const money = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

/** 맨 아래 두 결과의 확률을 풀어 기대 지급률을 목표에 맞춘다. 나머지 확률은 적힌 그대로다. */
function build(key: string, name: string, idea: string, fixed: [string, number, number][], low: [string, number][], target: number, rule?: string): Model {
  const fixedOut = fixed.map(([label, mult, percent]) => ({ label, value: +(PRICE * mult).toFixed(2), units: Math.round((percent / 100) * UNIT) }));
  const used = fixedOut.reduce((s, o) => s + o.units, 0);
  const evFixed = fixedOut.reduce((s, o) => s + o.value * o.units, 0) / UNIT;
  const rest = UNIT - used;
  const [v1, v2] = low.map(([, mult]) => +(PRICE * mult).toFixed(2));
  // u1 + u2 = rest, (u1 v1 + u2 v2) / UNIT = target * PRICE - evFixed
  const need = (target * PRICE - evFixed) * UNIT;
  let u2 = Math.round((need - rest * v1) / (v2 - v1));
  u2 = Math.max(0, Math.min(rest, u2));
  const u1 = rest - u2;
  const got = (evFixed * UNIT + u1 * v1 + u2 * v2) / UNIT / PRICE;
  if (Math.abs(got - target) > 0.0005) throw new Error(`${key}: 목표 지급률 ${target} 을 맞추지 못했다(${got.toFixed(4)}). 고정 확률을 고쳐야 한다`);
  const outcomes = [{ label: low[0][0], value: v1, units: u1 }, { label: low[1][0], value: v2, units: u2 }, ...fixedOut].filter((o) => o.units > 0).sort((a, b) => a.value - b.value);
  return { key, name, idea, rule, outcomes };
}

/** 지금 운영 중인 구조(골드 박스 50 USDT). 읽기만 한다. 계산은 상품 하나하나로 하고, 표에서만 드문 결과를 한 줄로 줄여 보여 준다. */
function current(): Model {
  const box = BOXES.find((b) => b.slug === "vault-gold")!;
  const outcomes: Outcome[] = dropTable(box).map((i) => ({
    label: i.id.startsWith("wave-") ? "USDT" : "상품",
    value: +sellValueOf(i).toFixed(2), units: Math.round((i.dropRate / 100) * UNIT), tail: !i.id.startsWith("wave-"),
  }));
  const tail = outcomes.filter((o) => o.tail).length;
  return { key: "now", name: "지금 구조", idea: "운영 중인 골드 박스(50 USDT). 2026-10-11 파운더 지시로 바꾼 표다(받는 값 기준 99%, USDT 구간 0.02배에서 20배, 상품 몫 22%).", outcomes: outcomes.sort((a, b) => a.value - b.value),
    rule: `계산과 시뮬레이션은 결과 ${outcomes.length}종을 하나하나 넣어 했다. 아래 표는 상품 ${tail}종(참고가의 95% 로 계산)을 한 줄로 줄여 보여 줄 뿐이다. 상품마다의 확률은 박스 화면의 확률표에 있다.` };
}

const TARGET = 0.95;
const models: Model[] = [
  current(),
  build("A", "모델 A, 고른 분포", "결과가 낸 값 근처에 모인다. 크게 잃지도 크게 얻지도 않는다.",
    [["USDT", 1.0, 18], ["USDT", 1.2, 11], ["USDT", 1.5, 6], ["USDT", 2, 3], ["USDT", 4, 0.8], ["USDT", 10, 0.1], ["실물(참고가의 95%)", 100, 0.004], ["실물(참고가의 95%)", 1000, 0.0002]],
    [["USDT", 0.6], ["USDT", 0.85]], TARGET),
  build("B", "모델 B, 큰 변동", "아주 작은 결과부터 드물게 아주 큰 결과까지 폭이 넓다. 파운더가 든 예(1, 5, 20, 50, 100, 그리고 훨씬 드문 큰 상품)를 따랐다.",
    [["USDT", 0.4, 22], ["USDT", 1.0, 14], ["USDT", 2, 13], ["USDT", 5, 4], ["USDT", 10, 1.2], ["실물(참고가의 95%)", 50, 0.15], ["실물(참고가의 95%)", 100, 0.03], ["실물(참고가의 95%)", 1900, 0.0002]],
    [["USDT", 0.02], ["USDT", 0.1]], TARGET),
  build("C", "모델 C, 최저 보장", "어떤 결과든 낸 값의 70% 는 받는다고 미리 밝힌다. 그 위에 무작위 상승분이 붙는다.",
    [["USDT", 1.0, 13], ["USDT", 1.5, 6], ["USDT", 3, 2.5], ["USDT", 10, 0.25], ["실물(참고가의 95%)", 100, 0.004], ["실물(참고가의 95%)", 1000, 0.0002]],
    [["USDT(보장 하한)", 0.7], ["USDT", 0.85]], TARGET,
    "보장 규칙: 모든 결과의 받는 값이 박스 가격의 70% 이상이다. 이전 결과나 계정 상태와 무관하게 매번 같은 표에서 뽑는다(누적 보정, 천장 없음). 이것은 낸 값을 지켜 준다는 뜻이 아니다. 아래 표대로 낸 값보다 적게 받는 결과가 여전히 대부분이다."),
];

// ── 이론값 ───────────────────────────────────────────────────────────────────
const toneKey = (k: number) => (k >= 20 ? "top" : k >= 6 ? "high" : k >= 1.05 ? "above" : k > 0.95 ? "even" : "below");
function theory(m: Model) {
  const p = m.outcomes.map((o) => o.units / UNIT);
  const sum = m.outcomes.reduce((s, o) => s + o.units, 0);
  const ev = m.outcomes.reduce((s, o, i) => s + o.value * p[i], 0);
  const variance = m.outcomes.reduce((s, o, i) => s + (o.value - ev) ** 2 * p[i], 0);
  const prob = (f: (o: Outcome) => boolean) => m.outcomes.filter(f).reduce((s, o) => s + o.units, 0) / UNIT;
  const max = Math.max(...m.outcomes.map((o) => o.value));
  const min = Math.min(...m.outcomes.map((o) => o.value));
  const tones: Record<string, number> = { below: 0, even: 0, above: 0, high: 0, top: 0 };
  m.outcomes.forEach((o, i) => { tones[toneKey(o.value / PRICE)] += p[i]; });
  return { sum, ev, ratio: ev / PRICE, margin: 1 - ev / PRICE, variance, sd: Math.sqrt(variance), cv: Math.sqrt(variance) / ev,
    below: prob((o) => o.value < PRICE), equal: prob((o) => o.value === PRICE), above: prob((o) => o.value > PRICE), tenth: prob((o) => o.value <= PRICE * 0.1),
    max, maxP: prob((o) => o.value === max), min, minP: prob((o) => o.value === min), tones };
}

// ── 난수: sfc32(씨앗 고정) + 정수 버림 추출(0 이상 UNIT 미만에 정확히 고르게) ─────────────
function sfc32(seed: number) {
  let a = 0x9e3779b9 | 0, b = 0x243f6a88 | 0, c = 0xb7e15162 | 0, d = seed | 0;
  const next = () => { a |= 0; b |= 0; c |= 0; d |= 0; const t = (((a + b) | 0) + d) | 0; d = (d + 1) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0; return t >>> 0; };
  for (let i = 0; i < 20; i++) next();
  return next;
}
const LIMIT = Math.floor(4294967296 / UNIT) * UNIT;
function roller(seed: number) { const next = sfc32(seed); return () => { let x = next(); while (x >= LIMIT) x = next(); return x % UNIT; }; }

function lnGamma(x: number): number { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.001208650973866179, -0.000005395239384953]; let y = x; let tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp); let ser = 1.000000000190015; for (const cj of c) ser += cj / ++y; return -tmp + Math.log((2.5066282746310005 * ser) / x); }
/** 정규화 상부 불완전 감마 Q(a, x). 카이제곱 p 값 = Q(df/2, chi2/2) */
function gammaQ(a: number, x: number): number {
  if (x <= 0) return 1;
  if (x < a + 1) { let sum = 1 / a; let term = sum; for (let n = 1; n < 500; n++) { term *= x / (a + n); sum += term; if (Math.abs(term) < Math.abs(sum) * 1e-14) break; } return 1 - sum * Math.exp(-x + a * Math.log(x) - lnGamma(a)); }
  let b = x + 1 - a; let c = 1 / 1e-300; let d = 1 / b; let h = d;
  for (let i = 1; i < 500; i++) { const an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300; c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-14) break; }
  return Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h;
}
function cumulative(m: Model) { const cum: number[] = []; let acc = 0; for (const o of m.outcomes) { acc += o.units; cum.push(acc); } return cum; }
function pick(cum: number[], roll: number) { let lo = 0, hi = cum.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (roll >= cum[mid]) lo = mid + 1; else hi = mid; } return lo; }

function simulate(m: Model, seed: number) {
  const roll = roller(seed); const cum = cumulative(m);
  const counts = m.outcomes.map(() => 0); let total = 0; let totalSq = 0; let longestBelow = 0; let run = 0;
  for (let i = 0; i < DRAWS; i++) {
    const k = pick(cum, roll()); counts[k]++; const v = m.outcomes[k].value; total += v; totalSq += v * v;
    if (v < PRICE) { run++; if (run > longestBelow) longestBelow = run; } else run = 0;
  }
  const mean = total / DRAWS; const variance = totalSq / DRAWS - mean * mean;
  // 카이제곱: 기대 도수가 작은 칸부터 한 칸으로 합쳐 간다. 합친 칸의 기대 도수가 5 이상이 될 때까지 다음으로 작은 칸을 더 넣는다.
  const cells = m.outcomes.map((o, i) => ({ obs: counts[i], exp: (o.units / UNIT) * DRAWS })).sort((a, b) => a.exp - b.exp);
  const merged: { obs: number; exp: number }[] = []; let pool = { obs: 0, exp: 0 }; let pooled = 0;
  for (const c of cells) { if (c.exp < 5 || (pool.exp > 0 && pool.exp < 5)) { pool = { obs: pool.obs + c.obs, exp: pool.exp + c.exp }; pooled++; } else merged.push(c); }
  if (pool.exp > 0) merged.push(pool);
  const chi2 = merged.reduce((s, c) => s + (c.obs - c.exp) ** 2 / c.exp, 0);
  const df = merged.length - 1;
  return { counts, mean, variance, chi2, df, p: gammaQ(df / 2, chi2 / 2), longestBelow, pool, pooled };
}

/** n 회씩 여러 번 팔아 본다: 그 n 회의 지급이 받은 돈을 넘는(운영자가 잃는) 비율과 지급의 상위 값 */
function batches(m: Model, seed: number, n: number, trials: number) {
  const roll = roller(seed ^ (n * 2654435761)); const cum = cumulative(m); const values = m.outcomes.map((o) => o.value);
  const pays: number[] = []; let loss = 0; const revenue = n * PRICE;
  for (let t = 0; t < trials; t++) { let pay = 0; for (let i = 0; i < n; i++) pay += values[pick(cum, roll())]; pays.push(pay); if (pay > revenue) loss++; }
  pays.sort((a, b) => a - b);
  const q = (x: number) => pays[Math.min(pays.length - 1, Math.floor(x * pays.length))];
  return { lossRate: loss / trials, p50: q(0.5), p99: q(0.99), max: pays[pays.length - 1], revenue };
}

// ── 문서 ─────────────────────────────────────────────────────────────────────
const L: string[] = [];
L.push("# 확률 구조 제안: 표와 시뮬레이션 (2026-10-11)", "");
L.push("**모델 A, B, C 는 제안이고, \"지금 구조\"는 2026-10-11 파운더 지시로 바꾼 운영 표다.** 박스 열넷 전체의 숫자는 `opening/ODDS.md`, 결정의 배경은 `opening/PROBABILITY.md` 에 있다.");
L.push("이 표는 `web/scripts/opening/probability.ts` 가 만든다(`npx tsx scripts/opening/probability.ts`). 손으로 고치지 않는다.", "");
L.push("## 놓은 조건");
L.push(`- 박스 가격 ${PRICE} USDT. 배수로 읽으면 다른 가격에도 옮길 수 있다(센트 반올림은 그 가격에서 다시 확인해야 한다).`);
L.push("- 금액은 전부 실제로 받는 USDT 기준 값이다. USDT 결과는 그 금액, 상품은 참고가의 95%(지금의 USDT 로 받기 비율).");
L.push(`- 모델 A, B, C 는 기대 지급률을 ${TARGET * 100}% 로 맞췄다(제안할 때의 운영 표 수준이다. 지금 구조는 99% 다). 맨 아래 두 결과의 확률을 풀어 맞췄고, 확률 해상도는 지금 시스템과 같은 0.0001%(100만 칸)다. 칸 단위로 끊기 때문에 기대 지급액은 정확히 47.5 가 아니라 아래 표의 값이다.`);
L.push("- **운영 몫은 \"모든 결과를 USDT 로 받는다\"고 볼 때의 값이다.** 상품을 실제로 배송하면 운영자의 비용은 참고가의 95% 가 아니라 조달가와 배송비다. 배송을 고르는 비율과 조달가를 넣은 계산은 이 문서에 없다.");
L.push("- 결과는 매번 같은 표에서 독립으로 뽑는다. 쓴 금액, 이전 결과, 잔액, 이용 시간, 계정 특성에 따라 확률이 바뀌는 규칙은 어느 모델에도 없다.");
L.push(`- 시뮬레이션은 모델마다 ${DRAWS.toLocaleString("en-US")}회. 난수는 sfc32, 씨앗은 지금 구조 ${SEEDS.now}, A ${SEEDS.A}, B ${SEEDS.B}, C ${SEEDS.C}(다시 돌리면 같은 숫자가 나온다). 0 이상 100만 미만 정수는 버림 추출로 뽑아 칸마다 정확히 같은 가능성을 준다.`);
L.push("- 이 시뮬레이션은 제안한 표를 견줘 보는 용도다. 운영 추첨(HMAC-SHA256)의 검증이 아니다.", "");

const T = models.map(theory);
const S = models.map((m) => simulate(m, SEEDS[m.key]));

Array.from(models.entries()).forEach(([i, m]) => {
  const t = T[i]; const s = S[i];
  L.push(`## ${m.name}`, "", m.idea, "");
  if (m.rule) L.push(m.rule, "");
  L.push("| 결과 | 받는 값 (USDT) | 낸 값 대비 | 확률 | 10만 회 기대 도수 | 10만 회 관측 도수 |", "|---|---:|---:|---:|---:|---:|");
  const tail = m.outcomes.map((o, k) => ({ o, k })).filter((x) => x.o.tail);
  m.outcomes.forEach((o: Outcome, k: number) => { if (!o.tail) L.push(`| ${o.label} | ${money(o.value)} | ${(o.value / PRICE).toFixed(2)}배 | ${fmtPct(o.units)} | ${money((o.units / UNIT) * DRAWS)} | ${money(s.counts[k])} |`); });
  if (tail.length) {
    const units = tail.reduce((a, x) => a + x.o.units, 0); const obs = tail.reduce((a, x) => a + s.counts[x.k], 0); const vals = tail.map((x) => x.o.value);
    L.push(`| 상품 ${tail.length}종(확률 합) | ${money(Math.min(...vals))} ~ ${money(Math.max(...vals))} | ${(Math.min(...vals) / PRICE).toFixed(2)}배 ~ ${(Math.max(...vals) / PRICE).toFixed(0)}배 | ${fmtPct(units)} | ${money((units / UNIT) * DRAWS)} | ${money(obs)} |`);
  }
  L.push(`| 합계 | | | ${((t.sum / UNIT) * 100).toFixed(4)}% | ${money(DRAWS)} | ${money(s.counts.reduce((a, b) => a + b, 0))} |`, "");
  L.push("| 항목 | 이론값 | 시뮬레이션 |", "|---|---:|---:|");
  L.push(`| 기대 지급액 (USDT) | ${t.ev.toFixed(6)} | ${s.mean.toFixed(4)} |`);
  L.push(`| 기대 지급률 | ${(t.ratio * 100).toFixed(4)}% | ${((s.mean / PRICE) * 100).toFixed(4)}% |`);
  L.push(`| 운영 몫(전부 USDT 로 받을 때, 운영 비용 전) | ${(t.margin * 100).toFixed(4)}% | ${((1 - s.mean / PRICE) * 100).toFixed(4)}% |`);
  L.push(`| 분산 | ${money(+t.variance.toFixed(4))} | ${money(+s.variance.toFixed(4))} |`);
  L.push(`| 표준편차 (USDT) | ${t.sd.toFixed(4)} | ${Math.sqrt(s.variance).toFixed(4)} |`);
  L.push(`| 변동 계수(표준편차 ÷ 기대값) | ${t.cv.toFixed(4)} | ${(Math.sqrt(s.variance) / s.mean).toFixed(4)} |`);
  L.push(`| 낸 값보다 적게 받을 확률 | ${(t.below * 100).toFixed(4)}% | |`);
  L.push(`| 낸 값과 같거나 더 받을 확률 | ${((t.equal + t.above) * 100).toFixed(4)}% | |`);
  L.push(`| 낸 값보다 더 받을 확률 | ${(t.above * 100).toFixed(4)}% | |`);
  L.push(`| 낸 값의 10% 이하를 받을 확률 | ${(t.tenth * 100).toFixed(4)}% | |`);
  L.push(`| 가장 큰 지급 한 건 (USDT) | ${money(t.max)} (확률 ${(t.maxP * 100).toFixed(4)}%) | |`);
  L.push(`| 10만 회 가운데 가장 긴 "적게 받음" 연속 | | ${s.longestBelow}회 |`);
  L.push(`| 적합도 카이제곱 | | χ² = ${s.chi2.toFixed(4)}, 자유도 ${s.df}, p = ${s.p.toFixed(4)} |`, "");
  const se = t.sd / Math.sqrt(DRAWS);
  L.push(`검정 읽기: p 가 0.05 보다 크면 관측 도수가 표의 확률과 어긋난다고 볼 근거가 없다는 뜻이다. 그것이 난수의 품질이나 드문 상품의 확률까지 증명하지는 않는다(10만 회로는 0.0001% 짜리 결과가 한 번 나올까 말까다). 기대 도수가 작은 칸 ${s.pooled}개를 한 칸으로 합쳤다(합친 칸 기대 ${s.pool.exp.toFixed(2)}, 관측 ${s.pool.obs}). 시뮬레이션 평균의 표준오차는 ${se.toFixed(4)} USDT 이고, 이론값과의 차이는 ${Math.abs(s.mean - t.ev).toFixed(4)} USDT(${(Math.abs(s.mean - t.ev) / se).toFixed(2)} 표준오차)다.`, "");
});

L.push("## 한 표로 비교", "");
L.push("| | " + models.map((m) => m.name).join(" | ") + " |", "|---|" + models.map(() => "---:").join("|") + "|");
const row = (label: string, f: (t: ReturnType<typeof theory>, i: number) => string) => L.push(`| ${label} | ` + T.map(f).join(" | ") + " |");
row("기대 지급률", (t) => (t.ratio * 100).toFixed(2) + "%");
row("운영 몫(전부 USDT 로 받을 때)", (t) => (t.margin * 100).toFixed(2) + "%");
row("표준편차 (USDT)", (t) => t.sd.toFixed(1));
row("낸 값보다 적게 받을 확률", (t) => (t.below * 100).toFixed(2) + "%");
row("낸 값 이상 받을 확률", (t) => ((t.equal + t.above) * 100).toFixed(2) + "%");
row("낸 값의 10% 이하를 받을 확률", (t) => (t.tenth * 100).toFixed(2) + "%");
row("가장 흔한 결과", (_t, i) => { const o = [...models[i].outcomes].sort((a, b) => b.units - a.units)[0]; return `${money(o.value)} (${fmtPct(o.units)})`; });
row("가장 작은 결과", (t) => `${money(t.min)} (${(t.min / PRICE).toFixed(2)}배, ${(t.minP * 100).toFixed(2)}%)`);
row("가장 작은 결과를 10번 안에 한 번 이상", (t) => ((1 - Math.pow(1 - t.minP, 10)) * 100).toFixed(1) + "%");
row("가장 큰 지급 한 건", (t) => money(t.max));
row("연출 톤 below (줄어듦)", (t) => (t.tones.below * 100).toFixed(2) + "%");
row("연출 톤 even (비슷함)", (t) => (t.tones.even * 100).toFixed(2) + "%");
row("연출 톤 above (늘어남)", (t) => (t.tones.above * 100).toFixed(2) + "%");
row("연출 톤 high (6배 이상)", (t) => (t.tones.high * 100).toFixed(4) + "%");
row("연출 톤 top (20배 이상)", (t) => (t.tones.top * 100).toFixed(4) + "%");
row("\"적게 받음\" 이 10번 이어질 확률", (t) => (Math.pow(t.below, 10) * 100).toFixed(2) + "%");
row("늘어난 결과가 나오기까지 평균 개봉 수", (t) => (1 / t.above).toFixed(1) + "회");
L.push("");

L.push("## 개봉 수에 따른 지급 부담", "", "기대 지급액은 개봉 수에 비례한다. 실제 지급은 그 주변에서 흔들리고, 흔들리는 폭(표준편차)은 개봉 수의 제곱근에 비례한다.", "");
L.push("| 모델 | 개봉 수 | 받는 돈 (USDT) | 기대 지급 (USDT) | 지급 표준편차 (USDT) | 기대 운영 몫 (USDT) | 가장 큰 상품이 한 번 이상 나올 확률 |", "|---|---:|---:|---:|---:|---:|---:|");
Array.from(models.entries()).forEach(([i, m]) => { for (const n of [1_000, 10_000, 100_000, 1_000_000]) {
  const t = T[i];
  L.push(`| ${m.name} | ${money(n)} | ${money(n * PRICE)} | ${money(Math.round(n * t.ev))} | ${money(Math.round(Math.sqrt(n) * t.sd))} | ${money(Math.round(n * (PRICE - t.ev)))} | ${((1 - Math.pow(1 - t.maxP, n)) * 100).toFixed(4)}% |`);
} });
L.push("");
L.push("### 운영자가 잃는 구간", "", "평균과 표준편차만으로는 지급 위험을 다 말하지 못한다. 드문 큰 지급 한 건이 분산을 지배하기 때문에 종 모양 분포로 어림하면 틀린다. 아래는 n 회씩 여러 번 팔아 본 결과다(전부 USDT 로 받는다고 볼 때).", "");
L.push("| 모델 | 한 묶음의 개봉 수 | 묶음 수 | 받는 돈 (USDT) | 지급이 받는 돈을 넘은 비율 | 지급 중앙값 | 지급 상위 1% | 가장 큰 지급 |", "|---|---:|---:|---:|---:|---:|---:|---:|");
Array.from(models.entries()).forEach(([, m]) => { for (const [n, trials] of [[1_000, 2_000], [10_000, 400]] as [number, number][]) {
  const b = batches(m, SEEDS[m.key], n, trials);
  L.push(`| ${m.name} | ${money(n)} | ${money(trials)} | ${money(b.revenue)} | ${(b.lossRate * 100).toFixed(2)}% | ${money(Math.round(b.p50))} | ${money(Math.round(b.p99))} | ${money(Math.round(b.max))} |`);
} });
L.push("");
Array.from(models.entries()).forEach(([i, m]) => { const t = T[i]; L.push(`- ${m.name}: 가장 큰 상품(${money(t.max)} USDT) 한 건은 ${money(Math.ceil(t.max / (PRICE - t.ev)))}회 개봉의 기대 운영 몫과 같다. 1,000회(받는 돈 ${money(1000 * PRICE)}) 안에 그 한 건이 나오면 그 묶음은 ${t.max > 1000 * PRICE ? "나머지 결과가 전부 최저여도 손실이다" : "나머지 지급에 따라 손실이 될 수 있다"}.`); });
L.push("");

L.push("## 쓰는 식", "");
L.push("- 기대 지급액 E = Σ pᵢ·vᵢ. 기대 지급률 = E ÷ 가격. 운영 몫 = 1 − 기대 지급률(전부 USDT 로 받을 때).");
L.push("- 분산 = Σ pᵢ·(vᵢ − E)². 표준편차 = √분산. 변동 계수 = 표준편차 ÷ E.");
L.push("- n 회의 기대 지급 = n·E, 지급 표준편차 = √n·표준편차(독립 추첨).");
L.push("- 가장 큰 상품이 n 회 안에 한 번 이상 나올 확률 = 1 − (1 − p_max)ⁿ. p_max 는 가장 큰 값을 가진 결과들의 확률 합.");
L.push("- 적합도 검정: χ² = Σ (관측 − 기대)² ÷ 기대, 자유도 = 합친 뒤의 칸 수 − 1(표본으로 추정한 모수가 없다), p 값은 상부 불완전 감마 함수 Q(자유도/2, χ²/2).");
L.push("- 연출 톤 경계(lib/openingFlow.ts 와 같다): below 는 0.95배 이하, even 은 0.95배 초과 1.05배 미만, above 는 1.05배 이상 6배 미만, high 는 6배 이상 20배 미만, top 은 20배 이상.");
L.push("- 상품을 배송할 때의 운영 비용까지 넣으려면: 결과마다 p × [q × 0.95v + (1 − q) × (조달가 + 배송 순비용)]. q 는 USDT 로 받기를 고르는 비율, v 는 참고가.", "");
writeFileSync(new URL("../../../opening/PROBABILITY-tables.md", import.meta.url), L.join("\n") + "\n");
console.log(models.map((m, i) => `${m.key}: n ${m.outcomes.length} ratio ${(T[i].ratio * 100).toFixed(4)}% sim ${((S[i].mean / PRICE) * 100).toFixed(3)}% below ${(T[i].below * 100).toFixed(4)}% sd ${T[i].sd.toFixed(2)} top ${(T[i].tones.top * 100).toFixed(4)}% chi2 ${S[i].chi2.toFixed(2)}/${S[i].df} p ${S[i].p.toFixed(3)} pool ${S[i].pool.exp.toFixed(1)}`).join("\n"));
