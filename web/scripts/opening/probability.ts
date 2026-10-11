// 개봉 경험 임무의 확률 구조 제안. 계산과 시뮬레이션만 한다. 운영 확률(lib/products.ts)은 건드리지 않는다.
//   npx tsx scripts/opening/probability.ts            → ../opening/PROBABILITY.md 를 쓴다
// 모델 셋(A 고른 분포, B 큰 변동, C 최저 보장)과 지금 구조를 같은 표로 비교한다. 박스 가격은 50 USDT 로 놓는다(배수는 다른 가격에도 그대로 적용된다).
// 금액은 전부 "실제로 받는 USDT 기준 값"이다(USDT 결과는 그 금액, 상품은 참고가의 95%).
import { writeFileSync } from "node:fs";
import { BOXES, dropTable, sellValueOf } from "../../lib/products";

const PRICE = 50;
const DRAWS = 100_000;
const SEED = 20261011;
const UNIT = 1_000_000; // 확률 해상도 0.0001% (lib/fairness 의 ROLL_RANGE 와 같다)

type Outcome = { label: string; value: number; units: number };
type Model = { key: string; name: string; idea: string; rule?: string; outcomes: Outcome[] };

const pct = (units: number) => (units / UNIT) * 100;
const fmtPct = (units: number) => { const p = pct(units); return (p >= 1 ? p.toFixed(2) : p >= 0.01 ? p.toFixed(3) : p.toFixed(4)) + "%"; };
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
  if (u1 < 0 || u2 < 0) throw new Error(`${key}: 목표 지급률을 맞출 수 없다`);
  const got = (evFixed * UNIT + u1 * v1 + u2 * v2) / UNIT / PRICE;
  if (Math.abs(got - target) > 0.0005) throw new Error(`${key}: 목표 지급률 ${target} 을 맞추지 못했다(${got.toFixed(4)}). 고정 확률을 고쳐야 한다`);
  const outcomes = [{ label: low[0][0], value: v1, units: u1 }, { label: low[1][0], value: v2, units: u2 }, ...fixedOut].filter((o) => o.units > 0).sort((a, b) => a.value - b.value);
  return { key, name, idea, rule, outcomes };
}

/** 지금 운영 중인 구조(골드 박스 50 USDT)를 같은 형식으로. 읽기만 한다. */
function current(): Model {
  const box = BOXES.find((b) => b.slug === "vault-gold")!;
  const table = dropTable(box);
  const wave = table.filter((i) => i.id.startsWith("wave-"));
  const tail = table.filter((i) => !i.id.startsWith("wave-"));
  const tailUnits = tail.reduce((s, i) => s + Math.round((i.dropRate / 100) * UNIT), 0);
  const tailEv = tail.reduce((s, i) => s + sellValueOf(i) * Math.round((i.dropRate / 100) * UNIT), 0) / tailUnits;
  const tailMax = Math.max(...tail.map((i) => sellValueOf(i)));
  const outcomes: Outcome[] = wave.map((i) => ({ label: i.kind === "cash" ? "USDT" : "디지털 기프트카드", value: +sellValueOf(i).toFixed(2), units: Math.round((i.dropRate / 100) * UNIT) }));
  outcomes.push({ label: `실물과 그 밖 ${tail.length}종(평균값으로 묶음, 최고 ${money(tailMax)})`, value: +tailEv.toFixed(2), units: tailUnits });
  return { key: "now", name: "지금 구조", idea: "운영 중인 골드 박스(50 USDT). 비교 기준이며 바꾸지 않는다.", outcomes: outcomes.sort((a, b) => a.value - b.value), rule: `실물 ${tail.length}종은 한 줄로 묶었다. 그래서 이 줄의 분산은 실제보다 작게 나온다(최고 상품 ${money(tailMax)} USDT 는 아래 "가장 큰 지급" 에 따로 적는다).` };
}
const CURRENT_MAX = (() => { const box = BOXES.find((b) => b.slug === "vault-gold")!; return Math.max(...dropTable(box).map((i) => sellValueOf(i))); })();

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
    "보장 규칙: 모든 결과의 받는 값이 박스 가격의 70% 이상이다. 이전 결과나 계정 상태와 무관하게 매번 같은 표에서 뽑는다(누적 보정, 천장 없음)."),
];

// ── 이론값 ───────────────────────────────────────────────────────────────────
function theory(m: Model) {
  const p = m.outcomes.map((o) => o.units / UNIT);
  const sum = m.outcomes.reduce((s, o) => s + o.units, 0);
  const ev = m.outcomes.reduce((s, o, i) => s + o.value * p[i], 0);
  const variance = m.outcomes.reduce((s, o, i) => s + (o.value - ev) ** 2 * p[i], 0);
  const below = m.outcomes.filter((o) => o.value < PRICE).reduce((s, o) => s + o.units, 0) / UNIT;
  const equal = m.outcomes.filter((o) => o.value === PRICE).reduce((s, o) => s + o.units, 0) / UNIT;
  const above = m.outcomes.filter((o) => o.value > PRICE).reduce((s, o) => s + o.units, 0) / UNIT;
  const max = m.key === "now" ? CURRENT_MAX : Math.max(...m.outcomes.map((o) => o.value));
  const maxP = m.key === "now" ? 1 / UNIT : m.outcomes.find((o) => o.value === max)!.units / UNIT;
  const tones = { below: 0, even: 0, above: 0, high: 0, rare: 0 };
  for (const [i, o] of m.outcomes.entries()) { const k = o.value / PRICE; tones[k >= 20 ? "rare" : k >= 6 ? "high" : k >= 1.05 ? "above" : k > 0.95 ? "even" : "below"] += p[i]; }
  return { sum, ev, ratio: ev / PRICE, margin: 1 - ev / PRICE, variance, sd: Math.sqrt(variance), cv: Math.sqrt(variance) / ev, below, equal, above, max, maxP, tones };
}

// ── 시뮬레이션(씨앗 고정) ─────────────────────────────────────────────────────
function mulberry32(a: number) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function lnGamma(x: number): number { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.001208650973866179, -0.000005395239384953]; let y = x; let tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp); let ser = 1.000000000190015; for (const cj of c) ser += cj / ++y; return -tmp + Math.log((2.5066282746310005 * ser) / x); }
/** 정규화 상부 불완전 감마 Q(a, x). 카이제곱 p 값 = Q(df/2, chi2/2) */
function gammaQ(a: number, x: number): number {
  if (x <= 0) return 1;
  if (x < a + 1) { let sum = 1 / a; let term = sum; for (let n = 1; n < 500; n++) { term *= x / (a + n); sum += term; if (Math.abs(term) < Math.abs(sum) * 1e-14) break; } return 1 - sum * Math.exp(-x + a * Math.log(x) - lnGamma(a)); }
  let b = x + 1 - a; let c = 1 / 1e-300; let d = 1 / b; let h = d;
  for (let i = 1; i < 500; i++) { const an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300; c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-14) break; }
  return Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h;
}
function simulate(m: Model, seed: number) {
  const rand = mulberry32(seed);
  const cum: number[] = []; let acc = 0; for (const o of m.outcomes) { acc += o.units; cum.push(acc); }
  const counts = m.outcomes.map(() => 0); let total = 0; let totalSq = 0; let longestBelow = 0; let run = 0;
  for (let i = 0; i < DRAWS; i++) {
    const roll = Math.floor(rand() * UNIT);
    let k = 0; while (roll >= cum[k]) k++;
    counts[k]++; const v = m.outcomes[k].value; total += v; totalSq += v * v;
    if (v < PRICE) { run++; if (run > longestBelow) longestBelow = run; } else run = 0;
  }
  const mean = total / DRAWS; const variance = totalSq / DRAWS - mean * mean;
  // 카이제곱: 기대 도수가 5보다 작은 칸은 한 칸으로 묶는다
  const cells: { obs: number; exp: number }[] = []; let pool = { obs: 0, exp: 0 };
  m.outcomes.forEach((o, i) => { const exp = (o.units / UNIT) * DRAWS; if (exp < 5) { pool.obs += counts[i]; pool.exp += exp; } else cells.push({ obs: counts[i], exp }); });
  if (pool.exp > 0) cells.push(pool);
  const chi2 = cells.reduce((s, c) => s + (c.obs - c.exp) ** 2 / c.exp, 0);
  const df = cells.length - 1;
  return { counts, mean, variance, chi2, df, p: gammaQ(df / 2, chi2 / 2), longestBelow, pooled: pool.exp > 0 ? pool : null };
}

// ── 문서 ─────────────────────────────────────────────────────────────────────
const L: string[] = [];
L.push("# 확률 구조 제안 (계산과 시뮬레이션, 2026-10-11)", "");
L.push("**이 문서는 제안이다. 운영 확률은 하나도 바꾸지 않았다.** 어느 모델이든 적용하려면 파운더의 승인이 따로 필요하다.");
L.push("이 표는 `web/scripts/opening/probability.ts` 가 만든다(`npx tsx scripts/opening/probability.ts`). 손으로 고치지 않는다.", "");
L.push("## 놓은 조건");
L.push(`- 박스 가격 ${PRICE} USDT. 배수로 읽으면 다른 가격에도 그대로 옮길 수 있다.`);
L.push("- 금액은 전부 실제로 받는 USDT 기준 값이다. USDT 결과는 그 금액, 상품은 참고가의 95%(지금의 USDT 로 받기 비율).");
L.push(`- 세 모델 모두 기대 지급률을 ${TARGET * 100}% 로 맞췄다(지금 구조와 같은 수준). 그래야 운영 몫이 같은 상태에서 "경험" 만 비교할 수 있다. 맨 아래 두 결과의 확률을 풀어 맞췄고, 확률 해상도는 지금 시스템과 같은 0.0001% 다.`);
L.push("- 결과는 매번 같은 표에서 독립으로 뽑는다. 쓴 금액, 이전 결과, 잔액, 이용 시간, 계정 특성에 따라 확률이 바뀌는 규칙은 어느 모델에도 없다.");
L.push(`- 시뮬레이션은 모델마다 ${DRAWS.toLocaleString("en-US")}회, 씨앗 ${SEED} 고정(다시 돌리면 같은 숫자가 나온다).`, "");

const T = models.map(theory);
const S = models.map((m, i) => simulate(m, SEED + i));

for (const [i, m] of models.entries()) {
  const t = T[i]; const s = S[i];
  L.push(`## ${m.name}`, "", m.idea, "");
  if (m.rule) L.push(m.rule, "");
  L.push("| 결과 | 받는 값 (USDT) | 낸 값 대비 | 확률 | 10만 회 기대 도수 | 10만 회 관측 도수 |", "|---|---:|---:|---:|---:|---:|");
  m.outcomes.forEach((o, k) => L.push(`| ${o.label} | ${money(o.value)} | ${(o.value / PRICE).toFixed(2)}배 | ${fmtPct(o.units)} | ${money((o.units / UNIT) * DRAWS)} | ${money(s.counts[k])} |`));
  L.push(`| 합계 | | | ${(t.sum / UNIT * 100).toFixed(4)}% | ${money(DRAWS)} | ${money(s.counts.reduce((a, b) => a + b, 0))} |`, "");
  L.push("| 항목 | 이론값 | 시뮬레이션 |", "|---|---:|---:|");
  L.push(`| 기대 지급액 (USDT) | ${t.ev.toFixed(4)} | ${s.mean.toFixed(4)} |`);
  L.push(`| 기대 지급률 | ${(t.ratio * 100).toFixed(3)}% | ${((s.mean / PRICE) * 100).toFixed(3)}% |`);
  L.push(`| 운영 몫(운영 비용 전) | ${(t.margin * 100).toFixed(3)}% | ${((1 - s.mean / PRICE) * 100).toFixed(3)}% |`);
  L.push(`| 분산 | ${money(+t.variance.toFixed(2))} | ${money(+s.variance.toFixed(2))} |`);
  L.push(`| 표준편차 (USDT) | ${t.sd.toFixed(2)} | ${Math.sqrt(s.variance).toFixed(2)} |`);
  L.push(`| 변동 계수(표준편차 ÷ 기대값) | ${t.cv.toFixed(2)} | ${(Math.sqrt(s.variance) / s.mean).toFixed(2)} |`);
  L.push(`| 낸 값보다 적게 받을 확률 | ${(t.below * 100).toFixed(3)}% | |`);
  L.push(`| 낸 값과 같거나 더 받을 확률 | ${((t.equal + t.above) * 100).toFixed(3)}% | |`);
  L.push(`| 낸 값보다 더 받을 확률 | ${(t.above * 100).toFixed(3)}% | |`);
  L.push(`| 가장 큰 지급 한 건 (USDT) | ${money(t.max)} (확률 ${(t.maxP * 100).toFixed(4)}%) | |`);
  L.push(`| 10만 회 가운데 가장 긴 "적게 받음" 연속 | | ${s.longestBelow}회 |`);
  L.push(`| 적합도 카이제곱 | | χ² = ${s.chi2.toFixed(2)}, 자유도 ${s.df}, p = ${s.p.toFixed(3)} |`, "");
  const se = t.sd / Math.sqrt(DRAWS);
  L.push(`검정 읽기: p 가 0.05 보다 크면 관측 도수가 표의 확률과 어긋난다고 볼 근거가 없다는 뜻이다. 기대 도수가 5보다 작은 칸은 한 칸으로 묶었다${s.pooled ? `(묶인 칸 기대 ${s.pooled.exp.toFixed(2)}, 관측 ${s.pooled.obs})` : ""}. 시뮬레이션 평균의 표준오차는 ${se.toFixed(3)} USDT 이고, 이론값과의 차이는 ${Math.abs(s.mean - t.ev).toFixed(3)} USDT(${(Math.abs(s.mean - t.ev) / se).toFixed(2)} 표준오차)다.`, "");
}

L.push("## 한 표로 비교", "");
L.push("| | " + models.map((m) => m.name).join(" | ") + " |", "|---|" + models.map(() => "---:").join("|") + "|");
const row = (label: string, f: (t: ReturnType<typeof theory>, i: number) => string) => L.push(`| ${label} | ` + T.map(f).join(" | ") + " |");
row("기대 지급률", (t) => (t.ratio * 100).toFixed(2) + "%");
row("운영 몫(비용 전)", (t) => (t.margin * 100).toFixed(2) + "%");
row("표준편차 (USDT)", (t) => t.sd.toFixed(1));
row("낸 값보다 적게 받을 확률", (t) => (t.below * 100).toFixed(1) + "%");
row("낸 값 이상 받을 확률", (t) => ((t.equal + t.above) * 100).toFixed(1) + "%");
row("가장 흔한 결과", (_t, i) => { const o = [...models[i].outcomes].sort((a, b) => b.units - a.units)[0]; return `${money(o.value)} (${fmtPct(o.units)})`; });
row("가장 작은 결과", (_t, i) => { const o = models[i].outcomes[0]; return `${money(o.value)} (${(o.value / PRICE).toFixed(2)}배)`; });
row("가장 큰 지급 한 건", (t) => money(t.max));
row("연출 톤 below (줄어듦)", (t) => (t.tones.below * 100).toFixed(1) + "%");
row("연출 톤 even (비슷함)", (t) => (t.tones.even * 100).toFixed(1) + "%");
row("연출 톤 above (늘어남)", (t) => (t.tones.above * 100).toFixed(2) + "%");
row("연출 톤 high (6배 이상)", (t) => (t.tones.high * 100).toFixed(3) + "%");
row("연출 톤 rare (20배 이상)", (t) => (t.tones.rare * 100).toFixed(4) + "%");
row("\"적게 받음\" 이 10번 이어질 확률", (t) => (Math.pow(t.below, 10) * 100).toFixed(2) + "%");
row("늘어난 결과가 나오기까지 평균 개봉 수", (t) => (1 / t.above).toFixed(1) + "회");
L.push("");

L.push("## 개봉 수에 따른 지급 부담", "", "기대 지급액은 개봉 수에 비례한다. 실제 지급은 그 주변에서 흔들리고, 흔들리는 폭(표준편차)은 개봉 수의 제곱근에 비례한다. 큰 상품 한 건이 나오면 그 한 건이 통째로 더해진다.", "");
L.push("| 모델 | 개봉 수 | 받는 돈 (USDT) | 기대 지급 (USDT) | 지급 표준편차 (USDT) | 기대 운영 몫 (USDT) | 가장 큰 상품이 한 번 이상 나올 확률 |", "|---|---:|---:|---:|---:|---:|---:|");
for (const [i, m] of models.entries()) for (const n of [1_000, 10_000, 100_000, 1_000_000]) {
  const t = T[i];
  L.push(`| ${m.name} | ${money(n)} | ${money(n * PRICE)} | ${money(Math.round(n * t.ev))} | ${money(Math.round(Math.sqrt(n) * t.sd))} | ${money(Math.round(n * (PRICE - t.ev)))} | ${((1 - Math.pow(1 - t.maxP, n)) * 100).toFixed(2)}% |`);
}
L.push("", "지금 구조의 표준편차는 실물과 그 밖의 드문 결과를 평균 한 줄로 묶어 계산했기 때문에 실제보다 작다. 가장 큰 지급과 그 확률은 묶지 않은 실제 값이다.", "");

L.push("## 쓰는 식", "");
L.push("- 기대 지급액 E = Σ pᵢ·vᵢ. 기대 지급률 = E ÷ 가격. 운영 몫 = 1 − 기대 지급률.");
L.push("- 분산 = Σ pᵢ·(vᵢ − E)². 표준편차 = √분산. 변동 계수 = 표준편차 ÷ E.");
L.push("- n 회의 기대 지급 = n·E, 지급 표준편차 = √n·표준편차(독립 추첨).");
L.push("- 가장 큰 상품이 n 회 안에 한 번 이상 나올 확률 = 1 − (1 − p_max)ⁿ.");
L.push("- 적합도 검정: χ² = Σ (관측 − 기대)² ÷ 기대, 자유도 = 칸 수 − 1, p 값은 상부 불완전 감마 함수 Q(자유도/2, χ²/2).");
L.push("- 난수는 mulberry32(씨앗 고정), 0 이상 1,000,000 미만 정수를 뽑아 누적 구간에 대응시킨다(운영 코드의 구간 방식과 같다).", "");
writeFileSync(new URL("../../../opening/PROBABILITY-tables.md", import.meta.url), L.join("\n") + "\n");
console.log(models.map((m, i) => `${m.key}: ratio ${(T[i].ratio * 100).toFixed(3)}% sim ${((S[i].mean / PRICE) * 100).toFixed(3)}% below ${(T[i].below * 100).toFixed(1)}% sd ${T[i].sd.toFixed(1)} chi2 p ${S[i].p.toFixed(3)}`).join("\n"));
