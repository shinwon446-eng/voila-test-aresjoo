// 2026-10-11 사다리 확률표(받는 값 기준 99%)의 박스별 숫자. 운영 표(lib/products.ts)를 읽기만 한다.
//   npx tsx scripts/opening/odds-report.ts            → ../opening/ODDS.md 를 쓴다
// 금액은 전부 "실제로 받는 USDT 기준 값"이다(USDT 결과는 그 금액, 상품은 참고가의 95%).
// 묶음 시뮬레이션의 난수는 sfc32(씨앗 고정)와 정수 버림 추출이다. 운영 추첨(HMAC-SHA256)의 검증이 아니다.
import { writeFileSync } from "node:fs";
import { BOXES, CATALOG_ODDS_VERSION, LADDER, LOW_TIERS, TARGET_CASH_RTP, bandIndexOf, cashReturn, retailReturn, sellValueOf } from "../../lib/products";

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
  const share = (f: (i: (typeof items)[number]) => boolean) => items.filter(f).reduce((s, i) => s + (i.value * i.units) / UNIT, 0) / box.price;
  const tier = (m: number) => p((i) => i.wave && i.ref === +(box.price * m).toFixed(2));
  const ev = items.reduce((s, i) => s + (i.value * i.units) / UNIT, 0);
  const sd = Math.sqrt(items.reduce((s, i) => s + ((i.value - ev) ** 2 * i.units) / UNIT, 0));
  const prizes = items.filter((i) => !i.wave);
  const top = prizes.reduce((a, b) => (b.value > a.value ? b : a));
  const bands = LADDER.map((_, k) => prizes.filter((i) => bandIndexOf(i.ref, box.price) === k).length);
  const cum: number[] = []; let acc = 0; for (const i of items) { acc += i.units; cum.push(acc); }
  const next = sfc32(SEED + index);
  const roll = () => { let x = next(); while (x >= LIMIT) x = next(); return x % UNIT; };
  const pick = (r: number) => { let lo = 0, hi = cum.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (r >= cum[mid]) lo = mid + 1; else hi = mid; } return lo; };
  const batch = (n: number, trials: number) => {
    let loss = 0; const pays: number[] = [];
    for (let t = 0; t < trials; t++) { let pay = 0; for (let k = 0; k < n; k++) pay += items[pick(roll())].value; pays.push(pay / (n * box.price)); if (pay > n * box.price) loss++; }
    pays.sort((a, b) => a - b);
    const q = (x: number) => pays[Math.floor(trials * x)];
    return { loss: loss / trials, p10: q(0.1), p50: q(0.5), p90: q(0.9), p99: q(0.99) };
  };
  return { box, low: tier(LOW_TIERS[0]), low2: tier(LOW_TIERS[1]), prize: p((i) => !i.wave), prizeCount: prizes.length, top, ev, sd, bands,
    cashShare: share((i) => i.wave), prizeShare: share((i) => !i.wave),
    hit: p((i) => i.value >= box.price), more: p((i) => i.value > box.price), x8: p((i) => i.ref >= box.price * 8), x40: p((i) => i.ref >= box.price * 40), x100: p((i) => i.ref >= box.price * 100),
    b10: batch(10, 20000), b100: batch(100, 5000), b1000: batch(1_000, 2000), b10000: batch(10_000, 300) };
});

const L: string[] = [];
L.push("# 운영 확률표: 사다리 (2026-10-11 파운더 결정 둘째)", "");
L.push(`표 버전 \`${CATALOG_ODDS_VERSION}\`. 이 문서는 \`web/scripts/opening/odds-report.ts\` 가 운영 표(\`web/lib/products.ts\`)를 읽어 만든다. 손으로 고치지 않는다.`, "");
L.push("## 왜 다시 바꿨나", "");
L.push("같은 날 먼저 낸 표(wide-99-v1)는 받는 값 기준 99% 를 맞췄지만, 그 가운데 22% 가 거의 안 나오는 상품에 묶여 있었다. USDT 결과만 보면 77% 였고, 1 USDT 박스에서는 상품이 190번에 한 번이라 여는 사람에게는 23% 를 떼이는 것으로 보였다. 20배를 넘는 결과도 거의 없어서 100개를 열어도 기억에 남는 것이 없었다.", "");
L.push("## 사다리", "");
L.push(`- **받는 값 기준 기대 비율은 그대로 ${TARGET_CASH_RTP * 100}% 다.** 박스 열넷 전부(허용 오차 0.05%p, 테스트가 강제한다).`);
L.push(`- **당첨 구간 아홉.** 모든 박스가 같은 사다리를 쓴다. 구간마다 참고가가 그 범위에 드는 상품이 있으면 구간 기대 가치의 대부분을 상품이 가져간다. 상품이 없는 구간은 USDT 다.`);
L.push("- 구간 안에서는 상품마다 기대 가치를 같게 나눈다(같은 구간이면 싼 상품이 조금 더 자주 나온다). 상품은 최소 한 칸(100만 번에 한 번).");
L.push(`- 당첨이 아닌 결과는 낸 값의 ${LOW_TIERS.join("배와 ")}배 둘이다. 그 칸 수는 기대 비율이 정확히 99% 가 되도록 박스마다 푼다.`);
L.push("- **결과는 매번 같은 표에서 독립으로 뽑는다.** 앞의 결과, 쓴 금액, 잔액, 계정에 따라 확률이 바뀌는 규칙은 없다.", "");
L.push("| USDT 결과(낸 값 대비) | 이 구간에 드는 상품의 참고가 | 구간 목표 확률 | 평균 몇 번에 한 번 | 상품이 있을 때 상품의 몫 |", "|---:|---|---:|---:|---:|");
for (const b of LADDER) L.push(`| ${b.multiple}배 | ${b.from}배 이상${Number.isFinite(b.to) ? " " + b.to + "배 미만" : ""} | ${pct(b.slots / UNIT, 3)} | ${money(Math.round(UNIT / b.slots))}번 | ${pct(b.prizeShare, 0)} |`);
L.push("", "구간의 실제 확률은 목표와 조금 다르다. 상품의 참고가가 구간의 대표 배수와 다르고(싼 상품이 많으면 더 자주 나온다), 비싼 상품은 한 칸만 받아도 몫을 넘기기 때문이다.", "");

L.push("## 박스별", "");
L.push("| 박스 | 가격 | 0.05배 | 0.25배 | 받는 값이 낸 값 이상 | 상품(전체) | 상품은 평균 몇 번에 한 번 | 8배 이상 | 40배 이상 | 100배 이상 | USDT 결과의 몫 | 상품의 몫 | 받는 값 기준 | 참고가 기준 |", "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|");
for (const r of rows) L.push(`| ${r.box.slug} | ${money(r.box.price)} | ${pct(r.low)} | ${pct(r.low2)} | ${pct(r.hit)} | ${pct(r.prize)} | ${(1 / r.prize).toFixed(0)}번 | ${pct(r.x8)} | ${pct(r.x40, 3)} | ${pct(r.x100, 3)} | ${pct(r.cashShare, 1)} | ${pct(r.prizeShare, 1)} | ${pct(cashReturn(r.box), 3)} | ${pct(retailReturn(r.box), 2)} |`);
L.push("", "8배, 40배, 100배 이상은 USDT 결과의 금액과 상품의 참고가로 센다. 박스 화면의 기대 가치 비율은 받는 값 기준(99.0%)으로 적는다.", "");

L.push("## 구간별 상품 수", "", "0 인 구간은 그 박스에 그 값의 상품이 없어서 USDT 로 나온다. 1 USDT 애플 박스는 가장 싼 상품이 10 USDT 라서 8배 아래가 전부 USDT 다.", "");
L.push("| 박스 | " + LADDER.map((b) => b.multiple + "배").join(" | ") + " | 합계 |", "|---|" + LADDER.map(() => "---:").join("|") + "|---:|");
for (const r of rows) L.push(`| ${r.box.slug} | ${r.bands.join(" | ")} | ${r.prizeCount} |`);
L.push("");

L.push("## 열어 보면", "", "독립 추첨에서 계산한 값이다. 순서를 만들어 내는 코드는 없다.", "");
L.push("| 박스 | 0.05배가 5번 연속 | 10번 안에 낸 값 이상이 한 번 이상 | 10번 안에 상품이 한 번 이상 | 10번 안에 8배 이상이 한 번 이상 | 100번 안에 40배 이상이 한 번 이상 | 100번 안에 100배 이상이 한 번 이상 |", "|---|---:|---:|---:|---:|---:|---:|");
for (const r of rows) L.push(`| ${r.box.slug} | ${pct(r.low ** 5)} | ${pct(1 - (1 - r.hit) ** 10)} | ${pct(1 - (1 - r.prize) ** 10)} | ${pct(1 - (1 - r.x8) ** 10)} | ${pct(1 - (1 - r.x40) ** 100)} | ${pct(1 - (1 - r.x100) ** 100)} |`);
L.push("");
L.push("### 10개, 100개를 한꺼번에 열면 돌아오는 비율", "", "평균은 99% 지만 큰 배수에 기대 가치를 많이 실었기 때문에, 큰 결과가 안 나온 묶음은 평균보다 낮게 끝난다. 아래는 여러 번 돌려 본 분포다(전부 USDT 로 받을 때).", "");
L.push("| 박스 | 10개: 하위 10% | 10개: 중앙값 | 10개: 상위 10% | 10개: 낸 돈을 넘은 비율 | 100개: 하위 10% | 100개: 중앙값 | 100개: 상위 10% | 100개: 상위 1% | 100개: 낸 돈을 넘은 비율 |", "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|");
for (const r of rows) L.push(`| ${r.box.slug} | ${pct(r.b10.p10, 0)} | ${pct(r.b10.p50, 0)} | ${pct(r.b10.p90, 0)} | ${pct(r.b10.loss, 1)} | ${pct(r.b100.p10, 0)} | ${pct(r.b100.p50, 0)} | ${pct(r.b100.p90, 0)} | ${pct(r.b100.p99, 0)} | ${pct(r.b100.loss, 1)} |`);
L.push("");

L.push("## 운영자가 지는 위험", "");
L.push("**운영 몫은 1% 다(전부 USDT 로 받을 때, 운영 비용 전).** 큰 배수가 자주 나오게 했기 때문에 한 묶음의 지급이 받은 돈을 넘는 일이 흔하다.", "");
L.push("| 박스 | 1,000번 묶음에서 지급이 받은 돈을 넘은 비율 | 10,000번 묶음 | 1,000번 묶음의 지급률 하위 10% | 중앙값 | 상위 10% | 한 번의 표준편차(낸 값의 몇 배) | 가장 큰 상품 한 건 = 기대 운영 몫 몇 번어치 |", "|---|---:|---:|---:|---:|---:|---:|---:|");
for (const r of rows) L.push(`| ${r.box.slug} | ${pct(r.b1000.loss, 1)} | ${pct(r.b10000.loss, 1)} | ${pct(r.b1000.p10, 1)} | ${pct(r.b1000.p50, 1)} | ${pct(r.b1000.p90, 1)} | ${(r.sd / r.box.price).toFixed(1)}배 | ${money(Math.ceil(r.top.value / (r.box.price - r.ev)))}번 |`);
L.push("");
L.push("- 묶음 수는 10번 묶음 20,000개, 100번 묶음 5,000개, 1,000번 묶음 2,000개, 10,000번 묶음 300개다. 난수는 sfc32, 씨앗은 " + SEED + " 에 박스 순번을 더한 값이다.");
L.push("- 이 계산은 \"모든 결과를 USDT 로 받는다\"고 볼 때다. 상품을 실제로 배송하면 운영자의 비용은 참고가의 95% 가 아니라 조달가와 배송비다. 상품이 여섯 번에서 아홉 번에 한 번 나오는 표라서 그 차이가 전보다 훨씬 중요하다. 그 계산은 여기에 없다.");
L.push("- 99% 는 아주 많이 열었을 때의 평균이다. 한 사람이 100만 원어치를 열면 99만 원이 남는다는 보장이 아니다.", "");
writeFileSync(new URL("../../../opening/ODDS.md", import.meta.url), L.join("\n") + "\n");
console.log(rows.map((r) => `${r.box.slug}: hit ${pct(r.hit)} prize ${pct(r.prize)} b10 ${pct(r.b10.p50, 0)}/${pct(r.b10.loss, 0)} b100 ${pct(r.b100.p10, 0)} ${pct(r.b100.p50, 0)} ${pct(r.b100.p90, 0)} ${pct(r.b100.p99, 0)} win ${pct(r.b100.loss, 0)} loss1k ${pct(r.b1000.loss, 0)} loss10k ${pct(r.b10000.loss, 0)}`).join("\n"));
