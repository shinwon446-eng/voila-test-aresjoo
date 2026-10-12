/**
 * 단일 통화 표시 엔진 (CLAUDE.md §4 Zero Clutter)
 *
 * 입력은 항상 USDT 기준 금액이고, 출력은 선택 통화 "하나"의 표기다.
 *   USDT → "80 USDT"   USD → "$80"   KRW → "₩110,000"
 * 원화로 바꿔 적을 때는 만원 아래를 버리고 숫자로 다 적는다(2026-10-11 파운더, "만" "억" 글자는 쓰지 않는다). ₩132,066,000 → "₩132,060,000", ₩110,400 → "₩110,000".
 *   1만원이 안 되는 금액은 그대로 적는다(₩690). 버리기만 하고 올리지 않는다. 원화는 보기용 환산이고 돈은 USDT 로 움직인다.
 * USDT 와 USD 는 필요한 자리만 소수 둘째 자리까지(0.5, 2.65), KRW 는 정수로 표시한다.
 * 0.5 USDT 를 "1 USDT"로 보이게 하던 정수 반올림은 사실과 다른 표기라 없앴다(DESIGN.md 정한 것 A.5).
 * 다른 통화 기호, 단위가 섞여 나오는 경로는 존재하지 않는다, 이 함수 말고는 금액을 문자열로 만들지 않는다.
 */

import { DEFAULT_RATES, type Currency } from "@/stores/currencyStore";

/** 숫자와 단위 사이는 줄바꿈 금지 공백, "1 / USDT" 로 쪼개지지 않는다 */
export const NBSP = " ";

/** 음수의 빼기 표시는 통화 기호 앞에 둔다(-$50). 숫자에 붙은 채로 기호 뒤에 오지 않게 한다($-50). 양수와 0 은 그대로다 */
const signFirst = (symbol: string, n: string) => (n.startsWith("-") ? `-${symbol}${n.slice(1)}` : `${symbol}${n}`);

const SPEC: Record<Currency, { decimals: number; render: (n: string) => string }> = {
  USDT: { decimals: 2, render: (n) => `${n}${NBSP}USDT` },
  USD: { decimals: 2, render: (n) => signFirst("$", n) },
  KRW: { decimals: 0, render: (n) => signFirst("₩", n) },
};

/** 자릿수 표기, 최소 0, 최대 decimals. "32.00" 같은 꼬리 0 은 붙이지 않는다. */
const digitsOf = (amount: number, decimals: number): string => amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: decimals });

export function convertFromUsdt(usdt: number, currency: Currency, rates: Record<Currency, number> = DEFAULT_RATES): number {
  return usdt * rates[currency];
}

/** 원화: 만원 아래를 버리고 숫자로 다 적는다(₩20,000). 1만원 미만은 원 단위 그대로 */
export function formatWonTruncated(won: number): string {
  if (!Number.isFinite(won)) return "₩0";
  const sign = won < 0 ? "-" : "";
  const abs = Math.abs(won);
  if (abs < 10_000) return `${sign}₩${digitsOf(abs, 0)}`;
  return `${sign}₩${digitsOf(Math.floor(abs / 10_000 + 1e-9) * 10_000, 0)}`;
}

export function formatCurrency(
  baseUsdtAmount: number,
  selectedCurrency: Currency,
  rates: Record<Currency, number> = DEFAULT_RATES,
): string {
  const { decimals, render } = SPEC[selectedCurrency];
  const amount = convertFromUsdt(baseUsdtAmount, selectedCurrency, rates);
  if (selectedCurrency === "KRW") return formatWonTruncated(amount);
  return render(digitsOf(amount, decimals));
}

/**
 * 이미 선택 통화 단위인 금액을 그대로 표기한다 (환산 없음).
 * 결제 프리셋처럼 "₩70,000 을 냈다"는 사실을 보존해야 할 때 쓴다, USDT 왕복 환산의 반올림 오차를 피한다.
 */
export function formatNative(amountInCurrency: number, currency: Currency): string {
  const { decimals, render } = SPEC[currency];
  return render(digitsOf(amountInCurrency, decimals));
}

/**
 * 축약 표기, 카드 폭이 좁은 자리 전용. 통화 규칙은 동일하다.
 *   USDT/USD: 1,250,000 → 1.25M / 12,900 → 12.9K   KRW: 1,290,000 → ₩129만 / 1.2억
 */
export function formatCurrencyCompact(
  baseUsdtAmount: number,
  selectedCurrency: Currency,
  rates: Record<Currency, number> = DEFAULT_RATES,
): string {
  const amount = convertFromUsdt(baseUsdtAmount, selectedCurrency, rates);
  if (selectedCurrency === "KRW") {
    if (amount >= 100_000_000) return `₩${Math.round(amount / 100_000_000)}억`;
    if (amount >= 10_000) return `₩${Math.round(amount / 10_000)}만`;
    return formatCurrency(baseUsdtAmount, selectedCurrency, rates);
  }
  const short =
    amount >= 1_000_000 ? `${Math.round(amount / 1_000_000)}M` : amount >= 10_000 ? `${Math.round(amount / 1_000)}K` : null;
  if (!short) return formatCurrency(baseUsdtAmount, selectedCurrency, rates);
  return selectedCurrency === "USD" ? `$${short}` : `${short}${NBSP}USDT`;
}

/** 숫자와 통화 단위를 분리한 표기, 타이포 위계(숫자 크게, 단위 작게)를 컴포넌트가 잡을 수 있게 한다. */
export interface MoneyParts {
  /** 숫자 앞 기호, "$", "₩". 없으면 "" */
  prefix: string;
  /** 자릿수 구분된 숫자 문자열 */
  number: string;
  /** 숫자 뒤 단위, "USDT". 없으면 "" */
  suffix: string;
}

const PARTS: Record<Currency, { prefix: string; suffix: string }> = {
  USDT: { prefix: "", suffix: "USDT" },
  USD: { prefix: "$", suffix: "" },
  KRW: { prefix: "₩", suffix: "" },
};

export function splitNative(amountInCurrency: number, currency: Currency): MoneyParts {
  const { decimals } = SPEC[currency];
  return { ...PARTS[currency], number: digitsOf(amountInCurrency, decimals) };
}

export function splitCurrency(baseUsdtAmount: number, selectedCurrency: Currency, rates: Record<Currency, number> = DEFAULT_RATES): MoneyParts {
  const amount = convertFromUsdt(baseUsdtAmount, selectedCurrency, rates);
  // 원화는 formatCurrency 와 같은 글자가 나와야 한다(만원 아래 버림)
  if (selectedCurrency === "KRW") return { ...PARTS.KRW, number: formatWonTruncated(amount).replace("₩", "") };
  return splitNative(amount, selectedCurrency);
}
