// 2026-10-11 확률표(받는 값 기준 99%)의 박스별 숫자. 운영 표(lib/products.ts)를 읽기만 한다.
//   npx tsx scripts/opening/odds-report.ts            → ../opening/ODDS.md 를 쓴다
// 금액은 전부 "실제로 받는 USDT 기준 값"이다(USDT 결과는 그 금액, 상품은 참고가의 95%).
// 묶음 시뮬레이션의 난수는 sfc32(씨앗 고정)와 정수 버림 추출이다. 운영 추첨(HMAC-SHA256)의 검증이 아니다.
import { writeFileSync } from "node:fs";
import { BOXES, CATALOG_ODDS_VERSION, FIXED_TIERS, LOW_TIERS, PRIZE_SHARE, TARGET_CASH_RTP, cashReturn, retailReturn, sellValueOf } from "../../lib/products";

const UNIT = 1_000_000;
const SEED = 20261011;
const money = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const pct = (p: number, d = 2) => (p * 100).toFixed(d) + "%";

function sfc32(seed: number) {
  let a = 0x9e3779b9 | 0, b = 0x243f6a88 | 0, c = 0xb7e15162 | 0, d = seed | 0;
  const next = () => { a |= 0; b |= 0; c |= 0; d |= 0; const t = (((a + b) | 0) + d) | 0; d = (d + 1) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0; return t >>> 0; };
  for (let i = 0; i < 20; i++) next();
  return next;
}
const LIMIT = Math.floor(4294967296 / UNIT) * UNIT;

const rows = BOXES.map((box, index) => {
  const items = box.items.map((i) => ({ id: i.id, wave: i.id.startsWith("wave-"), value: +sellValueOf(i).toFixed(2), units: Math.round((i.dropRate / 100) * UNIT), ref: i.value }));
  const total = items.reduce((s, i) => s + i.units, 0);
  if (total !== UNIT) throw new Error(`${box.slug}: 칸 합계 ${total}`);
  const p = (f: (i: (typeof items)[number]) => boolean) => items.filter(f).reduce((s, i) => s + i.units, 0) / UNIT;
  const tier = (m: number) => p((i) => i.wave && i.value === +(box.price * m).toFixed(2));
  const ev = items.reduce((s, i) => s + (i.value * i.units) / UNIT, 0);
  const sd = Math.sqrt(items.reduce((s, i) => s + ((i.value - ev) ** 2 * i.units) / UNIT, 0));
  const prizes = items.filter((i) => !i.wave);
  const prize = p((i) => !i.wave);
  const top = prizes.reduce((a, b) => (b.value > a.value ? b : a));
  const cheapest = prizes.reduce((a, b) => (b.ref < a.ref ? b : a));
  const low = tier(LOW_TIERS[0]);
  // 묶음: n 회씩 팔았을 때 지급이 받는 돈을 넘는 비율
  const cum: number[] = []; let acc = 0; for (const i of items) { acc += i.units; cum.push(acc); }
  const next = sfc32(SEED + index);
  const roll = () => { let x = next(); while (x >= LIMIT) x = next(); return x % UNIT; };
  const pick = (r: number) => { let lo = 0, hi = cum.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (r >= cum[mid]) lo = mid + 1; else hi = mid; } return lo; };
  const batch = (n: number, trials: number) => {
    let loss = 0; const pays: number[] = [];
    for (let t = 0; t < trials; t++) { let pay = 0; for (let k = 0; k < n; k++) pay += items[pick(roll())].value; pays.push(pay / (n * box.price)); if (pay > n * box.price) loss++; }
    pays.sort((a, b) => a - b);
    return { loss: loss / trials, p05: pays[Math.floor(trials * 0.05)], p50: pays[Math.floor(trials * 0.5)], p95: pays[Math.floor(trials * 0.95)] };
  };
  return { box, tier, low, low2: tier(LOW_TIERS[1]), prize, prizeCount: prizes.length, top, cheapest, ev, sd,
    below: p((i) => i.value < box.price), same: p((i) => i.value === box.price), more: p((i) => i.value > box.price), big: p((i) => i.value >= box.price * 10),
    b100: batch(100, 4000), b1000: batch(1_000, 2000), b10000: batch(10_000, 300) };
});

const L: string[] = [];
L.push("# 운영 확률표 (2026-10-11 파운더 결정)", "");
L.push(`표 버전 \`${CATALOG_ODDS_VERSION}\`. 이 문서는 \`web/scripts/opening/odds-report.ts\` 가 운영 표(\`web/lib/products.ts\`)를 읽어 만든다. 손으로 고치지 않는다.`, "");
L.push("## 무엇이 바뀌었나", "");
L.push(`- **받는 값 기준 기대 비율을 ${TARGET_CASH_RTP * 100}% 로 올렸다.** 모든 결과를 USDT 로 받는다고 볼 때, 낸 돈 100 에 평균 99 가 돌아온다. 박스 열넷이 전부 99.000% 다(허용 오차 0.05%p, 테스트가 강제한다).`);
L.push(`- **결과의 폭을 넓혔다.** USDT 결과는 낸 값의 ${[...LOW_TIERS, ...FIXED_TIERS.map(([m]) => m)].join("배, ")}배 일곱 가지다. 예전에는 0.5배, 0.8배, 0.99배가 89% 를 차지했다.`);
L.push(`- **상품이 실제로 나온다.** 상품 전체가 기대 가치의 ${PRIZE_SHARE * 100}% 를 차지한다. 예전에는 상품마다 100만 번에 한 번이었다. 값이 쌀수록 자주 나온다(가중치는 값의 -1.5 제곱).`);
L.push("- 예전의 \"디지털 기프트카드\" 구간은 없앴다. 그 자리의 결과는 전부 USDT 로 바로 들어온다.");
L.push("- **결과는 매번 같은 표에서 독립으로 뽑는다.** 앞의 결과, 쓴 금액, 잔액, 계정에 따라 확률이 바뀌는 규칙은 없다. \"작은 결과가 다섯 번 이어지다가 갑자기 큰 결과\"는 짜 넣은 순서가 아니라 이 표에서 저절로 나오는 흐름이다. 얼마나 자주 나오는지는 아래 표에 있다.", "");

L.push("## USDT 결과의 확률", "", "고정 구간 다섯은 모든 박스가 같다. 가장 작은 두 구간은 기대 비율을 99% 에 맞추려고 박스마다 다르다.", "");
L.push("| 낸 값 대비 | " + FIXED_TIERS.map(([m]) => m + "배").join(" | ") + " |", "|---|" + FIXED_TIERS.map(() => "---:").join("|") + "|");
L.push("| 확률 | " + FIXED_TIERS.map(([, slots]) => pct(slots / UNIT, 1)).join(" | ") + " |", "");

L.push("## 박스별", "");
L.push("| 박스 | 가격 | 0.02배 | 0.1배 | 상품(전체) | 상품은 평균 몇 번에 한 번 | 상품 수 | 가장 싼 상품 참고가 | 가장 큰 상품 참고가 | 받는 값 기준 | 참고가 기준 |", "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|");
for (const r of rows) L.push(`| ${r.box.slug} | ${money(r.box.price)} | ${pct(r.low)} | ${pct(r.low2)} | ${pct(r.prize)} | ${(1 / r.prize).toFixed(0)}번 | ${r.prizeCount} | ${money(r.cheapest.ref)} | ${money(r.top.ref)} | ${pct(cashReturn(r.box), 3)} | ${pct(retailReturn(r.box), 2)} |`);
L.push("", "참고가 기준이 100% 를 조금 넘는 것은 상품을 참고가의 95% 로 계산해 99% 에 맞췄기 때문이다. 박스 화면의 기대 가치 비율은 받는 값 기준(99.0%)으로 적는다.", "");

L.push("## 한 번 열 때", "");
L.push("| 박스 | 낸 값보다 적게 | 낸 값과 같게 | 낸 값보다 많이 | 10배 이상 | 표준편차(낸 값의 몇 배) |", "|---|---:|---:|---:|---:|---:|");
for (const r of rows) L.push(`| ${r.box.slug} | ${pct(r.below)} | ${pct(r.same)} | ${pct(r.more)} | ${pct(r.big)} | ${(r.sd / r.box.price).toFixed(1)}배 |`);
L.push("");

L.push("## 이어지는 흐름이 나올 확률", "", "독립 추첨에서 계산한 값이다. 순서를 만들어 내는 코드는 없다.", "");
L.push("| 박스 | 0.02배가 5번 연속 | 그 뒤 여섯 번째가 10배 이상 | 10번 안에 낸 값보다 많은 결과가 한 번 이상 | 10번 안에 10배 이상이 한 번 이상 | 10번 안에 상품이 한 번 이상 | 100번 안에 상품이 한 번 이상 |", "|---|---:|---:|---:|---:|---:|---:|");
for (const r of rows) L.push(`| ${r.box.slug} | ${pct(r.low ** 5)} | ${pct(r.low ** 5 * r.big, 3)} | ${pct(1 - (1 - r.more) ** 10)} | ${pct(1 - (1 - r.big) ** 10)} | ${pct(1 - (1 - r.prize) ** 10)} | ${pct(1 - (1 - r.prize) ** 100)} |`);
L.push("");

L.push("## 운영자가 지는 위험", "");
L.push("**운영 몫은 1% 다(전부 USDT 로 받을 때, 운영 비용 전).** 예전 표는 5% 였다. 몫이 얇고 결과의 폭이 넓어서, 한 묶음을 팔았을 때 지급이 받은 돈을 넘는 일이 흔하다. 아래는 n 번씩 여러 번 팔아 본 결과다.", "");
L.push("| 박스 | 100번 묶음에서 지급이 받은 돈을 넘은 비율 | 1,000번 묶음 | 10,000번 묶음 | 1,000번 묶음의 지급률 하위 5% | 중앙값 | 상위 5% | 가장 큰 상품 한 건 = 기대 운영 몫 몇 번어치 |", "|---|---:|---:|---:|---:|---:|---:|---:|");
for (const r of rows) L.push(`| ${r.box.slug} | ${pct(r.b100.loss, 1)} | ${pct(r.b1000.loss, 1)} | ${pct(r.b10000.loss, 1)} | ${pct(r.b1000.p05, 1)} | ${pct(r.b1000.p50, 1)} | ${pct(r.b1000.p95, 1)} | ${money(Math.ceil(r.top.value / (r.box.price - r.ev)))}번 |`);
L.push("");
L.push("- 묶음 수는 100번 묶음 4,000개, 1,000번 묶음 2,000개, 10,000번 묶음 300개다. 난수는 sfc32, 씨앗은 " + SEED + " 에 박스 순번을 더한 값이다.");
L.push("- 이 계산은 \"모든 결과를 USDT 로 받는다\"고 볼 때다. 상품을 실제로 배송하면 운영자의 비용은 참고가의 95% 가 아니라 조달가와 배송비다. 그 계산은 여기에 없다.");
L.push("- 99% 는 아주 많이 열었을 때의 평균이다. 한 사람이 100만 원어치를 열면 99만 원이 남는다는 보장이 아니다. 위 표의 하위 5% 와 상위 5% 사이에서 흔들린다.", "");
writeFileSync(new URL("../../../opening/ODDS.md", import.meta.url), L.join("\n") + "\n");
console.log(rows.map((r) => `${r.box.slug}: low ${pct(r.low)} prize ${pct(r.prize)} below ${pct(r.below)} more ${pct(r.more)} sd ${(r.sd / r.box.price).toFixed(1)}x loss100 ${pct(r.b100.loss, 1)} loss1k ${pct(r.b1000.loss, 1)} loss10k ${pct(r.b10000.loss, 1)}`).join("\n"));
