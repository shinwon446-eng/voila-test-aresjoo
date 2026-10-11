// 단일 통화 표시 엔진 — 혼용 0건
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import { formatCurrency, formatCurrencyCompact, convertFromUsdt, formatNative, splitCurrency, splitNative } from "../lib/formatCurrency";
import { DEFAULT_RATES, CURRENCIES } from "../stores/currencyStore";

test("정수는 소수점 없이: 80 USDT → 80 USDT / $80, 원화는 만원 아래를 버려 ₩11만", () => {
  assert.equal(formatCurrency(80, "USDT"), "80 USDT");
  assert.equal(formatCurrency(80, "USD"), "$80");
  assert.equal(formatCurrency(0.9, "USDT"), "0.9 USDT");
  assert.equal(formatCurrency(26.6, "USDT"), "26.6 USDT");
  assert.equal(formatCurrency(2.65, "USDT"), "2.65 USDT");
  assert.equal(formatCurrency(1000.1, "USDT"), "1,000.1 USDT");
  assert.equal(formatCurrency(80, "KRW"), "₩11만");
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
  assert.equal(formatCurrency(95700, "KRW"), "₩1억 3,206만");
  // 만원 아래는 버리기만 한다(올리지 않는다). 1만원이 안 되면 그대로
  assert.equal(formatCurrency(14.49, "KRW"), "₩1만");
  assert.equal(formatCurrency(7.2, "KRW"), "₩9,936");
  assert.equal(formatCurrency(3500, "KRW"), "₩483만");
  assert.equal(formatCurrency(72464, "KRW"), "₩1억");
  assert.equal(formatCurrency(610000, "KRW"), "₩8억 4,180만");
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
  assert.deepEqual(splitCurrency(80, "KRW"), { prefix: "₩", number: "11만", suffix: "" });
  assert.deepEqual(splitNative(70000, "KRW"), { prefix: "₩", number: "70,000", suffix: "" });
});
