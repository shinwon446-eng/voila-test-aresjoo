// 2026-10-11 확률표(사다리 + 터짐 게이지, 받는 값 기준 99%)의 박스별 숫자. 운영 표(lib/products.ts)를 읽기만 한다.
//   npx tsx scripts/opening/odds-report.ts            → ../opening/ODDS.md 를 쓴다
// 금액은 전부 "실제로 받는 USDT 기준 값"이다(USDT 결과는 그 금액, 상품은 참고가의 95%, 터짐은 그때의 게이지).
// 묶음 시뮬레이션의 난수는 sfc32(씨앗 고정)와 정수 버림 추출이다. 운영 추첨(HMAC-SHA256)의 검증이 아니다.
// 게이지는 묶음 사이에 이어진다(한 사람이 계속 여는 상황). 그래서 한 묶음의 지급에는 앞 묶음에서 쌓인 금액이 섞인다.
import { writeFileSync } from "node:fs";
import { BOXES, CATALOG_ODDS_VERSION, LADDER, LOW_TIERS, TARGET_CASH_RTP, bandIndexOf, cashReturn, retailReturn, sellValueOf } from "../../lib/products";
import { BURST } from "../../lib/burst";

const UNIT = 1_000_000;
const SEED = 20261011;
const money = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const pct = (p: number, d = 2) => (p * 100).toFixed(d) + "%";
const pBurst = BURST.slots / UNIT;

function sfc32(seed: number) {
  let a = 0x9e3779b9 | 0, b = 0x243f6a88 | 0, c = 0xb7e15162 | 0, d = seed | 0;
  const next = () => { a |= 0; b |= 0; c |= 0; d |= 0; const t = (((a + b) | 0) + d) | 0; d = (d + 1) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0; return t >>> 0; };
  for (let i = 0; i < 20; i++) next();
  return next;
}
const LIMIT = Math.floor(4294967296 / UNIT) * UNIT;

const rows = BOXES.map((box, index) => {
  const items = box.items.map((i) => ({ id: i.id, wave: i.id.startsWith("wave-"), burst: i.id === BURST.id, value: +sellValueOf(i).toFixed(2), units: Math.round((i.dropRate / 100) * UNIT), ref: i.value }));
  const total = items.reduce((s, i) => s + i.units, 0);
  if (total !== UNIT) throw new Error(`${box.slug}: 칸 합계 ${total}`);
  const p = (f: (i: (typeof items)[number]) => boolean) => items.filter(f).reduce((s, i) => s + i.units, 0) / UNIT;
  const share = (f: (i: (typeof items)[number]) => boolean) => items.filter(f).reduce((s, i) => s + (i.value * i.units) / UNIT, 0) / box.price;
  const tier = (m: number) => p((i) => i.wave && !i.burst && i.ref === +(box.price * m).toFixed(2));
  const ev = cashReturn(box) * box.price;
  const prizes = items.filter((i) => !i.wave);
  const top = prizes.reduce((a, b) => (b.value > a.value ? b : a));
  const bands = LADDER.map((_, k) => prizes.filter((i) => bandIndexOf(i.ref, box.price) === k).length);
  const cum: number[] = []; let acc = 0; for (const i of items) { acc += i.units; cum.push(acc); }
  const next = sfc32(SEED + index);
  const roll = () => { let x = next(); while (x >= LIMIT) x = next(); return x % UNIT; };
  const pick = (r: number) => { let lo = 0, hi = cum.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (r >= cum[mid]) lo = mid + 1; else hi = mid; } return lo; };
  let pot = 0; // 게이지에 쌓인 금액. 묶음 사이에 이어진다
  const draw = () => { const item = items[pick(roll())]; pot += box.price * BURST.share; if (!item.burst) return item.value; const pay = item.value + pot; pot = 0; return pay; };
  const batch = (n: number, trials: number) => {
    let loss = 0; const pays: number[] = [];
    for (let t = 0; t < trials; t++) { let pay = 0; for (let k = 0; k < n; k++) pay += draw(); pays.push(pay / (n * box.price)); if (pay > n * box.price) loss++; }
    pays.sort((a, b) => a - b);
    const q = (x: number) => pays[Math.floor(trials * x)];
    return { loss: loss / trials, p10: q(0.1), p50: q(0.5), p90: q(0.9), p99: q(0.99), mean: pays.reduce((a, b) => a + b, 0) / trials };
  };
  for (let k = 0; k < 2000; k++) draw(); // 게이지를 평소 상태로 데운다
  return { box, low: tier(LOW_TIERS[0]), low2: tier(LOW_TIERS[1]), prize: p((i) => !i.wave), prizeCount: prizes.length, top, ev, bands,
    cashShare: share((i) => i.wave && !i.burst), prizeShare: share((i) => !i.wave), burstShare: share((i) => i.burst) + BURST.share,
    hit: p((i) => i.value >= box.price), x8: p((i) => i.ref >= box.price * 8), x40: p((i) => i.ref >= box.price * 40), x100: p((i) => i.ref >= box.price * 100),
    b10: batch(10, 20000), b100: batch(100, 5000), b1000: batch(1_000, 2000), b10000: batch(10_000, 300) };
});

const L: string[] = [];
L.push("# 운영 확률표: 사다리와 터짐 게이지 (2026-10-11 파운더 결정 셋째)", "");
L.push(`표 버전 \`${CATALOG_ODDS_VERSION}\`. 이 문서는 \`web/scripts/opening/odds-report.ts\` 가 운영 표(\`web/lib/products.ts\`, \`web/lib/burst.ts\`)를 읽어 만든다. 손으로 고치지 않는다.`, "");
L.push("## 같은 날 세 번 바꾼 까닭", "");
L.push("1. 첫째 표(wide-99-v1): 받는 값 기준 99% 를 맞췄지만 22% 가 거의 안 나오는 상품에 묶여, USDT 결과만 보면 77% 였다. 파운더가 \"23% 를 먹는 것 같다\"고 짚었다.");
L.push("2. 둘째 표(ladder-99-v2): 당첨 구간을 상품으로 채우고 500배까지 늘렸다.");
L.push("3. 셋째(지금, burst-99-v3): 파운더가 \"슬롯머신처럼 터지게\"를 주문했다. 슬롯의 누적 상금과 같은 구조인 터짐 게이지를 더했다.", "");

L.push("## 터짐 게이지", "");
L.push(`- 열 때마다 박스 가격의 **${pct(BURST.share, 0)}** 가 게이지에 쌓인다. 게이지는 계정마다, 박스마다 따로 있다.`);
L.push(`- 확률표에 **터짐** 한 칸이 있다. 확률 ${pct(pBurst, 3)}(평균 ${money(Math.round(1 / pBurst))}번에 한 번). 나오면 시작 금액(박스 가격의 ${BURST.seed}배)과 쌓인 금액 전부를 USDT 로 받고, 게이지는 시작 금액으로 돌아간다.`);
L.push("- **터짐의 확률은 고정이다.** 게이지가 얼마나 찼는지, 얼마나 썼는지, 앞의 결과가 무엇이었는지에 따라 바뀌지 않는다. 달라지는 것은 터졌을 때 받는 금액뿐이고, 그 금액은 박스 화면과 결과 화면에 늘 보인다.");
L.push("- 흔히 말하는 \"먹다가 뱉는\" 방식(쓴 돈이나 잃은 횟수에 맞춰 당첨을 조절)은 넣지 않았다. 그 방식은 결과를 미리 잠그고 나중에 검증하는 구조와 맞지 않고, 여는 사람에게 숨기는 규칙이 된다. 게이지는 같은 느낌(안 터질수록 커진다)을 숨기는 것 없이 낸다.");
L.push(`- 기대 가치: 한 번 열 때 ${pct(pBurst, 3)} × ${BURST.seed}배 + ${pct(BURST.share, 0)} = 박스 가격의 **${pct(pBurst * BURST.seed + BURST.share, 2)}**. 받는 값 기준 99% 가운데 이만큼이 게이지로 가고, 그만큼 사다리의 8배에서 500배 구간을 줄였다.`);
L.push("- 쌓인 금액은 터질 때만 받는다. 터지기 전에 그만두면 게이지는 그 계정에 그대로 남는다(사라지지 않지만 꺼낼 수도 없다).", "");
const kOf = (q: number) => Math.ceil(Math.log(1 - q) / Math.log(1 - pBurst));
L.push("| | 터질 때까지 연 횟수 | 받는 금액(낸 값 대비) |", "|---|---:|---:|");
for (const [label, q] of [["빨리 터진 열에 하나", 0.1], ["넷에 하나", 0.25], ["가운데", 0.5], ["넷에 셋", 0.75], ["늦게 터진 열에 하나", 0.9], ["백에 하나", 0.99]] as [string, number][]) L.push(`| ${label} | ${money(kOf(q))}번 이하 | ${(BURST.seed + BURST.share * kOf(q)).toFixed(1)}배 이하 |`);
L.push(`| 평균 | ${money(Math.round(1 / pBurst))}번 | ${(BURST.seed + BURST.share / pBurst).toFixed(1)}배 |`);
L.push("", `10번 안에 터질 확률 ${pct(1 - (1 - pBurst) ** 10, 1)}, 100번 안에 ${pct(1 - (1 - pBurst) ** 100, 1)}, 300번 안에 ${pct(1 - (1 - pBurst) ** 300, 1)}.`, "");

L.push("## 사다리", "");
L.push(`- **받는 값 기준 기대 비율은 ${TARGET_CASH_RTP * 100}% 다.** 박스 열넷 전부(허용 오차 0.05%p, 테스트가 강제한다). 게이지에 쌓이는 몫까지 넣은 값이다.`);
L.push("- **당첨 구간 아홉.** 모든 박스가 같은 사다리를 쓴다. 구간마다 참고가가 그 범위에 드는 상품이 있으면 구간 기대 가치의 대부분을 상품이 가져간다. 상품이 없는 구간은 USDT 다.");
L.push("- 구간 안에서는 상품마다 기대 가치를 같게 나눈다. 상품은 최소 한 칸(100만 번에 한 번).");
L.push(`- 당첨이 아닌 결과는 낸 값의 ${LOW_TIERS.join("배와 ")}배 둘이다. 그 칸 수는 기대 비율이 정확히 99% 가 되도록 박스마다 푼다.`);
L.push("- **결과는 매번 같은 표에서 독립으로 뽑는다.**", "");
L.push("| USDT 결과(낸 값 대비) | 이 구간에 드는 상품의 참고가 | 구간 목표 확률 | 평균 몇 번에 한 번 | 상품이 있을 때 상품의 몫 |", "|---:|---|---:|---:|---:|");
for (const b of LADDER) L.push(`| ${b.multiple}배 | ${b.from}배 이상${Number.isFinite(b.to) ? " " + b.to + "배 미만" : ""} | ${pct(b.slots / UNIT, 3)} | ${money(Math.round(UNIT / b.slots))}번 | ${pct(b.prizeShare, 0)} |`);
L.push(`| 터짐(${BURST.seed}배 이상) | 상품 없음, 게이지 전부 | ${pct(pBurst, 3)} | ${money(Math.round(1 / pBurst))}번 | |`);
L.push("");

L.push("## 박스별", "");
L.push("| 박스 | 가격 | 0.05배 | 0.25배 | 받는 값이 낸 값 이상 | 상품(전체) | 상품은 평균 몇 번에 한 번 | 8배 이상 | 40배 이상 | 100배 이상 | USDT 결과의 몫 | 상품의 몫 | 터짐 게이지의 몫 | 받는 값 기준 | 참고가 기준 |", "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|");
for (const r of rows) L.push(`| ${r.box.slug} | ${money(r.box.price)} | ${pct(r.low)} | ${pct(r.low2)} | ${pct(r.hit)} | ${pct(r.prize)} | ${(1 / r.prize).toFixed(0)}번 | ${pct(r.x8)} | ${pct(r.x40, 3)} | ${pct(r.x100, 3)} | ${pct(r.cashShare, 1)} | ${pct(r.prizeShare, 1)} | ${pct(r.burstShare, 1)} | ${pct(cashReturn(r.box), 3)} | ${pct(retailReturn(r.box), 2)} |`);
L.push("", "8배, 40배, 100배 이상은 표에 적힌 금액으로 센다(터짐은 시작 금액 10배로 센다. 실제로는 그보다 많이 받는다).", "");

L.push("## 구간별 상품 수", "", "0 인 구간은 그 박스에 그 값의 상품이 없어서 USDT 로 나온다.", "");
L.push("| 박스 | " + LADDER.map((b) => b.multiple + "배").join(" | ") + " | 합계 |", "|---|" + LADDER.map(() => "---:").join("|") + "|---:|");
for (const r of rows) L.push(`| ${r.box.slug} | ${r.bands.join(" | ")} | ${r.prizeCount} |`);
L.push("");

L.push("## 10개, 100개를 한꺼번에 열면 돌아오는 비율", "", "평균은 99% 지만 큰 결과와 터짐에 기대 가치를 많이 실었기 때문에, 그것이 안 나온 묶음은 평균보다 낮게 끝난다(안 터진 만큼은 게이지에 남아 있다). 한 사람이 계속 여는 상황으로 돌렸다(전부 USDT 로 받을 때).", "");
L.push("| 박스 | 10개: 중앙값 | 10개: 상위 10% | 10개: 낸 돈을 넘은 비율 | 100개: 하위 10% | 100개: 중앙값 | 100개: 상위 10% | 100개: 상위 1% | 100개: 낸 돈을 넘은 비율 |", "|---|---:|---:|---:|---:|---:|---:|---:|---:|");
for (const r of rows) L.push(`| ${r.box.slug} | ${pct(r.b10.p50, 0)} | ${pct(r.b10.p90, 0)} | ${pct(r.b10.loss, 1)} | ${pct(r.b100.p10, 0)} | ${pct(r.b100.p50, 0)} | ${pct(r.b100.p90, 0)} | ${pct(r.b100.p99, 0)} | ${pct(r.b100.loss, 1)} |`);
L.push("");

L.push("## 운영자가 지는 위험", "");
L.push("**운영 몫은 1% 다(전부 USDT 로 받을 때, 운영 비용 전).**", "");
L.push("| 박스 | 1,000번 묶음에서 지급이 받은 돈을 넘은 비율 | 10,000번 묶음 | 1,000번 묶음의 지급률 하위 10% | 중앙값 | 상위 10% | 시뮬레이션 평균(1,000번 묶음) | 가장 큰 상품 한 건 = 기대 운영 몫 몇 번어치 |", "|---|---:|---:|---:|---:|---:|---:|---:|");
for (const r of rows) L.push(`| ${r.box.slug} | ${pct(r.b1000.loss, 1)} | ${pct(r.b10000.loss, 1)} | ${pct(r.b1000.p10, 1)} | ${pct(r.b1000.p50, 1)} | ${pct(r.b1000.p90, 1)} | ${pct(r.b1000.mean, 1)} | ${money(Math.ceil(r.top.value / (r.box.price - r.ev)))}번 |`);
L.push("");
L.push("- 묶음 수는 10번 묶음 20,000개, 100번 묶음 5,000개, 1,000번 묶음 2,000개, 10,000번 묶음 300개다. 난수는 sfc32, 씨앗은 " + SEED + " 에 박스 순번을 더한 값이다.");
L.push("- 게이지에 쌓인 금액은 운영자가 맡아 둔 돈이다. 터지지 않은 계정의 게이지는 갚을 돈으로 남는다. 시작 금액(박스 가격의 10배)은 운영자가 터질 때마다 넣는 몫이다.");
L.push("- 이 계산은 \"모든 결과를 USDT 로 받는다\"고 볼 때다. 상품을 실제로 배송하면 운영자의 비용은 참고가의 95% 가 아니라 조달가와 배송비다. 그 계산은 여기에 없다.");
L.push("- 99% 는 아주 많이 열었을 때의 평균이다. 한 사람이 100만 원어치를 열면 99만 원이 남는다는 보장이 아니다.", "");
writeFileSync(new URL("../../../opening/ODDS.md", import.meta.url), L.join("\n") + "\n");
console.log(rows.map((r) => `${r.box.slug}: hit ${pct(r.hit)} prize ${pct(r.prize)} b10 ${pct(r.b10.p50, 0)}/${pct(r.b10.loss, 0)} b100 ${pct(r.b100.p10, 0)} ${pct(r.b100.p50, 0)} ${pct(r.b100.p90, 0)} ${pct(r.b100.p99, 0)} win ${pct(r.b100.loss, 0)} mean1k ${pct(r.b1000.mean, 1)} loss1k ${pct(r.b1000.loss, 0)} loss10k ${pct(r.b10000.loss, 0)}`).join("\n"));
