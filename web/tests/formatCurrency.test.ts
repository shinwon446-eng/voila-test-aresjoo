// 단일 통화 표시 엔진 — 혼용 0건
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import { formatCurrency, formatCurrencyCompact, convertFromUsdt, formatNative, splitCurrency, splitNative } from "../lib/formatCurrency";
import { DEFAULT_RATES, CURRENCIES } from "../stores/currencyStore";

test("정수는 소수점 없이: 80 USDT → 80 USDT / $80, 원화는 만원 아래를 버려 ₩110,000", () => {
  assert.equal(formatCurrency(80, "USDT"), "80 USDT");
  assert.equal(formatCurrency(80, "USD"), "$80");
  assert.equal(formatCurrency(0.9, "USDT"), "0.9 USDT");
  assert.equal(formatCurrency(26.6, "USDT"), "26.6 USDT");
  assert.equal(formatCurrency(2.65, "USDT"), "2.65 USDT");
  assert.equal(formatCurrency(1000.1, "USDT"), "1,000.1 USDT");
  assert.equal(formatCurrency(80, "KRW"), "₩110,000");
});

test("환율: 1 USDT = 1.00 USD = 1,380 KRW", () => {
  assert.equal(DEFAULT_RATES.USDT, 1);
  assert.equal(DEFAULT_RATES.USD, 1);
  assert.equal(DEFAULT_RATES.KRW, 1380);
  assert.equal(convertFromUsdt(1, "KRW"), 1380);
});

test("USDT와 USD는 소수 둘째 자리까지, KRW는 정수로 표시한다", () => {
  assert.equal(formatCurrency(1234567.891, "USDT"), "1,234,567.89 USDT");
  assert.equal(formatCurrency(0.5, "USD"), "$0.5");
  assert.equal(formatCurrency(0.5, "KRW"), "₩690");
  assert.equal(formatCurrency(95700, "KRW"), "₩132,060,000");
  // 만원 아래는 버리기만 한다(올리지 않는다). 1만원이 안 되면 그대로. "만", "억" 글자는 쓰지 않는다
  assert.equal(formatCurrency(14.49, "KRW"), "₩10,000");
  assert.equal(formatCurrency(7.2, "KRW"), "₩9,936");
  assert.equal(formatCurrency(3500, "KRW"), "₩4,830,000");
  assert.equal(formatCurrency(72464, "KRW"), "₩100,000,000");
  assert.equal(formatCurrency(610000, "KRW"), "₩841,800,000");
});

test("어떤 통화를 골라도 다른 통화의 기호·단위가 섞이지 않는다", () => {
  const markers: Record<string, RegExp> = { USDT: /USDT/, USD: /\$/, KRW: /₩/ };
  const samples = [0, 0.01, 7, 80, 999.99, 58, 95700, 1234567];
  for (const c of CURRENCIES) {
    for (const n of samples) {
      const out = formatCurrency(n, c);
      const compact = formatCurrencyCompact(n, c);
      for (const [other, re] of Object.entries(markers)) {
        if (other === c) {
          assert.match(out, re, `${c} ${n}: 자기 기호 누락 → ${out}`);
        } else {
          assert.doesNotMatch(out, re, `${c} ${n}: ${other} 기호 혼용 → ${out}`);
          assert.doesNotMatch(compact, re, `${c} ${n}: compact 에 ${other} 혼용 → ${compact}`);
        }
      }
      // 기호는 정확히 한 번
      assert.equal((out.match(markers[c]) ?? []).length, 1, `${c} ${n}: 기호 중복 → ${out}`);
    }
  }
});

test("compact 표기도 통화 하나로만", () => {
  assert.equal(formatCurrencyCompact(12900, "USDT"), "13K USDT");
  assert.equal(formatCurrencyCompact(1250000, "USD"), "$1M");
  assert.equal(formatCurrencyCompact(1000, "KRW"), "₩138만");
  assert.equal(formatCurrencyCompact(80, "USD"), "$80");
});

test("formatNative 는 환산 없이 원금액을 그대로 찍는다 — 프리셋 ₩70,000 은 ₩70,000", () => {
  assert.equal(formatNative(70000, "KRW"), "₩70,000");
  assert.equal(formatNative(50, "USD"), "$50");
  assert.equal(formatNative(20, "USDT"), "20 USDT");
  // 왕복 환산이면 오차가 생긴다는 걸 기록해 둔다
  assert.notEqual(formatCurrency(+(70000 / 1380).toFixed(2), "KRW"), "₩70,000");
});

test("splitCurrency — 숫자·단위 분리가 formatCurrency 와 같은 문자열을 재구성한다", () => {
  for (const c of CURRENCIES) {
    for (const v of [0, 1, 43, 80, 1234.5, 987654.32]) {
      const p = splitCurrency(v, c);
      const joined = `${p.prefix}${p.number}${p.suffix ? ` ${p.suffix}` : ""}`;
      assert.equal(joined, formatCurrency(v, c), `${c} ${v}`);
    }
  }
  assert.deepEqual(splitCurrency(80, "USDT"), { prefix: "", number: "80", suffix: "USDT" });
  assert.deepEqual(splitCurrency(80, "USD"), { prefix: "$", number: "80", suffix: "" });
  assert.deepEqual(splitCurrency(0.9, "USDT"), { prefix: "", number: "0.9", suffix: "USDT" });
  // 원화로 바꿔 적을 때는 만원 아래를 버린다. 이미 원화인 금액(splitNative)은 그대로 적는다
  assert.deepEqual(splitCurrency(80, "KRW"), { prefix: "₩", number: "110,000", suffix: "" });
  assert.deepEqual(splitNative(70000, "KRW"), { prefix: "₩", number: "70,000", suffix: "" });
});

// E-14(migration-audit/PARITY_ISSUES.md): 달러 표기에서 음수의 빼기 표시가 통화 기호 뒤에 왔다($-50). 지갑 내역의 박스 열기와 출금 줄이 그렇게 보였다.
const all = (v: number, c: (typeof CURRENCIES)[number]) => [formatCurrency(v, c), formatNative(v, c), formatCurrencyCompact(v, c)].join("|");
const u = (text: string) => text.replace(/ /g, " ");

test("E-14 음수는 빼기 표시가 통화 기호 앞에 온다: -$50, -₩60,000, -50 USDT", () => {
  assert.equal(formatCurrency(-50, "USD"), "-$50");
  assert.equal(formatCurrency(-1, "USD"), "-$1");
  assert.equal(formatCurrency(-0.5, "USD"), "-$0.5");
  assert.equal(formatCurrency(-1234.567, "USD"), "-$1,234.57");
  assert.equal(formatCurrency(-95700, "USD"), "-$95,700");
  // 이미 그 통화 단위인 금액(환산 없음)도 같다. 원화는 여기서 기호 뒤에 빼기가 왔다(₩-50)
  assert.equal(formatNative(-50, "USD"), "-$50");
  assert.equal(formatNative(-70000, "KRW"), "-₩70,000");
  // 좁은 자리 표기는 음수를 줄이지 않고 보통 표기를 그대로 쓴다
  assert.equal(formatCurrencyCompact(-50, "USD"), "-$50");
  assert.equal(formatCurrencyCompact(-95700, "USD"), "-$95,700");
  // 원화 환산과 USDT 는 원래 빼기가 앞에 있었다. 그대로다
  assert.equal(formatCurrency(-50, "KRW"), "-₩60,000");
  assert.equal(formatCurrency(-1, "KRW"), "-₩1,380");
  assert.equal(formatCurrency(-50, "USDT"), u("-50 USDT"));
  assert.equal(formatNative(-20, "USDT"), u("-20 USDT"));
  // 어느 통화, 어느 표기에서도 기호 바로 뒤에 빼기가 오지 않는다
  for (const c of CURRENCIES) for (const v of [-0.001, -0.5, -1, -50, -1234.567, -95700]) assert.doesNotMatch(all(v, c), /[$₩]-/, `${c} ${v}: ${all(v, c)}`);
  // 빼기 표시의 자리만 옮긴다. 반올림해 0 이 되는 음수에 붙던 빼기 표시도 그대로 남는다($-0 이던 것이 -$0)
  assert.equal(formatCurrency(-0.001, "USD"), "-$0");
});

test("E-14 양수와 0 의 표기는 고치기 전과 한 글자도 다르지 않다(기준 커밋의 출력)", () => {
  const values = [0, 0.01, 0.5, 1, 7.2, 14.49, 80, 999.99, 1234.5, 12900, 95700, 1250000];
  // 보통 표기 | 환산 없는 표기 | 좁은 자리 표기. 고치기 전의 lib/formatCurrency.ts 를 돌려 얻은 값이다
  const before: Record<(typeof CURRENCIES)[number], string[]> = {
    USDT: ["0 USDT|0 USDT|0 USDT", "0.01 USDT|0.01 USDT|0.01 USDT", "0.5 USDT|0.5 USDT|0.5 USDT", "1 USDT|1 USDT|1 USDT", "7.2 USDT|7.2 USDT|7.2 USDT", "14.49 USDT|14.49 USDT|14.49 USDT", "80 USDT|80 USDT|80 USDT", "999.99 USDT|999.99 USDT|999.99 USDT", "1,234.5 USDT|1,234.5 USDT|1,234.5 USDT", "12,900 USDT|12,900 USDT|13K USDT", "95,700 USDT|95,700 USDT|96K USDT", "1,250,000 USDT|1,250,000 USDT|1M USDT"].map(u),
    USD: ["$0|$0|$0", "$0.01|$0.01|$0.01", "$0.5|$0.5|$0.5", "$1|$1|$1", "$7.2|$7.2|$7.2", "$14.49|$14.49|$14.49", "$80|$80|$80", "$999.99|$999.99|$999.99", "$1,234.5|$1,234.5|$1,234.5", "$12,900|$12,900|$13K", "$95,700|$95,700|$96K", "$1,250,000|$1,250,000|$1M"],
    KRW: ["₩0|₩0|₩0", "₩14|₩0|₩14", "₩690|₩1|₩690", "₩1,380|₩1|₩1,380", "₩9,936|₩7|₩9,936", "₩10,000|₩14|₩2만", "₩110,000|₩80|₩11만", "₩1,370,000|₩1,000|₩138만", "₩1,700,000|₩1,235|₩170만", "₩17,800,000|₩12,900|₩1780만", "₩132,060,000|₩95,700|₩1억", "₩1,725,000,000|₩1,250,000|₩17억"],
  };
  for (const c of CURRENCIES) assert.deepEqual(values.map((v) => all(v, c)), before[c], c);
});

// R2-P2-01(migration-audit/R2_CYCLE3_codex.md): E-14 가 통합 표기의 빼기 표시만 옮겨서, 숫자와 단위를 나눈 표기(Money 가 쓴다)를 합치면
// $-50 이고 통합 표기는 -$50 이 됐다. 원본에서는 둘이 같았다. 나눈 표기도 빼기 표시를 통화 기호 앞(먼저 그려지는 prefix)에 둔다.
/** Money 가 그리는 차례대로 합친다: 기호, 숫자, 단위 */
const joined = (p: { prefix: string; number: string; suffix: string }) => `${p.prefix}${p.number}${p.suffix ? ` ${p.suffix}` : ""}`;
const parts = (p: { prefix: string; number: string; suffix: string }) => `${p.prefix}|${p.number}|${p.suffix}`;

test("R2-P2-01 음수의 나눈 표기: 빼기 표시가 통화 기호 앞에 오고, 합치면 통합 표기와 같다", () => {
  // 달러(환산)
  assert.deepEqual(splitCurrency(-50, "USD"), { prefix: "-$", number: "50", suffix: "" });
  assert.deepEqual(splitCurrency(-1234.567, "USD"), { prefix: "-$", number: "1,234.57", suffix: "" });
  // 원화(환산, 만원 아래 버림)
  assert.deepEqual(splitCurrency(-50, "KRW"), { prefix: "-₩", number: "60,000", suffix: "" });
  assert.deepEqual(splitCurrency(-0.5, "KRW"), { prefix: "-₩", number: "690", suffix: "" });
  // 이미 그 통화 단위인 금액(환산 없음)
  assert.deepEqual(splitNative(-70000, "KRW"), { prefix: "-₩", number: "70,000", suffix: "" });
  assert.deepEqual(splitNative(-50, "USD"), { prefix: "-$", number: "50", suffix: "" });
  // USDT 는 기호가 없다. 빼기 표시는 숫자에 붙은 그대로다(-50 USDT)
  assert.deepEqual(splitCurrency(-50, "USDT"), { prefix: "", number: "-50", suffix: "USDT" });
  assert.deepEqual(splitNative(-20, "USDT"), { prefix: "", number: "-20", suffix: "USDT" });
  // 어느 통화에서도 나눈 것을 합치면 통합 표기와 글자까지 같다. 기호 바로 뒤에 빼기가 오지 않는다
  for (const c of CURRENCIES) for (const v of [-0.001, -0.5, -1, -50, -1234.567, -95700, 0, 1, 80, 1234.5]) {
    assert.equal(joined(splitCurrency(v, c)), formatCurrency(v, c), `환산 ${c} ${v}`);
    assert.equal(joined(splitNative(v, c)), formatNative(v, c), `환산 없음 ${c} ${v}`);
    assert.doesNotMatch(joined(splitCurrency(v, c)) + joined(splitNative(v, c)), /[$₩]-/, `${c} ${v}`);
  }
});

test("R2-P2-01 양수와 0 의 나눈 표기는 고치기 전과 한 글자도 다르지 않다", () => {
  const values = [0, 0.01, 0.5, 1, 7.2, 14.49, 80, 999.99, 1234.5, 12900, 95700, 1250000];
  // 환산한 것(기호|숫자|단위) / 환산 없는 것. 고치기 전의 lib/formatCurrency.ts 를 돌려 얻은 값이다
  const before: Record<(typeof CURRENCIES)[number], string[]> = {
    USDT: ["|0|USDT / |0|USDT", "|0.01|USDT / |0.01|USDT", "|0.5|USDT / |0.5|USDT", "|1|USDT / |1|USDT", "|7.2|USDT / |7.2|USDT", "|14.49|USDT / |14.49|USDT", "|80|USDT / |80|USDT", "|999.99|USDT / |999.99|USDT", "|1,234.5|USDT / |1,234.5|USDT", "|12,900|USDT / |12,900|USDT", "|95,700|USDT / |95,700|USDT", "|1,250,000|USDT / |1,250,000|USDT"],
    USD: ["$|0| / $|0|", "$|0.01| / $|0.01|", "$|0.5| / $|0.5|", "$|1| / $|1|", "$|7.2| / $|7.2|", "$|14.49| / $|14.49|", "$|80| / $|80|", "$|999.99| / $|999.99|", "$|1,234.5| / $|1,234.5|", "$|12,900| / $|12,900|", "$|95,700| / $|95,700|", "$|1,250,000| / $|1,250,000|"],
    KRW: ["₩|0| / ₩|0|", "₩|14| / ₩|0|", "₩|690| / ₩|1|", "₩|1,380| / ₩|1|", "₩|9,936| / ₩|7|", "₩|10,000| / ₩|14|", "₩|110,000| / ₩|80|", "₩|1,370,000| / ₩|1,000|", "₩|1,700,000| / ₩|1,235|", "₩|17,800,000| / ₩|12,900|", "₩|132,060,000| / ₩|95,700|", "₩|1,725,000,000| / ₩|1,250,000|"],
  };
  for (const c of CURRENCIES) assert.deepEqual(values.map((v) => parts(splitCurrency(v, c)) + " / " + parts(splitNative(v, c))), before[c], c);
});
