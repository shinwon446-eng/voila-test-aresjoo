/**
 * 통합 단계의 재확인 계측. web/ 을 고치지 않고 모듈을 불러 메모리에서만 돈다.
 * 실행: cd web && npx --no-install tsx --tsconfig tsconfig.json <이 파일>
 */
import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";

// 메모리 저장소. 브라우저 계정 흉내 서비스가 localStorage 와 window 를 요구한다.
const mem = new Map<string, string>();
const storage = {
  getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
  setItem: (k: string, v: string) => { mem.set(k, String(v)); },
  removeItem: (k: string) => { mem.delete(k); },
  clear: () => mem.clear(),
  key: (i: number) => [...mem.keys()][i] ?? null,
  get length() { return mem.size; },
};
(globalThis as any).localStorage = storage;
(globalThis as any).sessionStorage = storage;
(globalThis as any).window = globalThis;
if (!(globalThis as any).window.addEventListener) { (globalThis as any).window.addEventListener = () => {}; (globalThis as any).window.removeEventListener = () => {}; }
(globalThis as any).document = { addEventListener: () => {}, removeEventListener: () => {}, visibilityState: "visible" };

const web = process.cwd();
const load = (rel: string) => import(pathToFileURL(path.join(web, rel)).href);
const out: Record<string, unknown> = {};
const sha = (s: string) => createHash("sha256").update(Buffer.from(s, "utf8")).digest("hex");

const products = await load("lib/products.ts");
const fairness = await load("lib/fairness.ts");
const takeBatch = await load("lib/takeBatch.ts");
const withdrawal = await load("lib/withdrawal.ts");
const funding = await load("lib/funding.ts");
const fc = await load("lib/formatCurrency.ts");

// 1. 카탈로그 지문(Codex 의 주 지문 형식)
{
  const { BOXES, HOME_BOXES, dropTable } = products;
  const fp = (boxes: any[]) => {
    const sorted = [...boxes].sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
    let rows = 0; let text = "";
    for (const box of sorted) for (const item of dropTable(box)) { text += JSON.stringify([box.slug, box.price, item.id, item.dropRate]) + "\n"; rows++; }
    return { boxes: boxes.length, rows, bytes: Buffer.byteLength(text, "utf8"), sha256: sha(text) };
  };
  const unique = new Set<string>(); const withImage = new Set<string>(); let sumOff = 0; let missingNames = 0;
  for (const box of BOXES) {
    let units = 0;
    if (!box.title || !box.titleEn || !box.titleZh) missingNames++;
    for (const item of box.items) {
      unique.add(item.id); if (item.image?.src) withImage.add(item.id);
      units += Math.round(item.dropRate * 10000);
      if (!item.name || !item.nameEn || !item.nameZh) missingNames++;
    }
    if (units !== 1_000_000) sumOff++;
  }
  out.catalog = { all: fp(BOXES), home: fp(HOME_BOXES), uniqueItems: unique.size, uniqueWithImage: withImage.size, boxesWithSumNot100: sumOff, missingNames };
}

// 2. Codex 고정 시드의 10회 추첨
{
  const { BOXES, dropTable } = products;
  const server = "codex-b-server-seed-2026-10-12"; const client = "codex-b-client-seed";
  const rows: unknown[] = [];
  for (let n = 0; n < 10; n++) {
    const r = await fairness.calculateRollResult(server, client, n);
    const pick = (slug: string) => fairness.determineItem(r.roll, dropTable(BOXES.find((b: any) => b.slug === slug))).id;
    rows.push([n, r.roll, pick("vault-pokemon"), pick("pokemon-charizard")]);
  }
  out.draws = { commit: await fairness.hashServerSeed(server), rows };
}

// 3. 돈 경계값
{
  out.money = {
    take: [0.005, 0.015, 0.105, 1.005, 2.675, 0.1, 0.3, 100].map((v) => [v, takeBatch.takeAmountOf({ valueUsdt: v })]),
    debit: [[10, 3, 20], [10, 0, 20], [0.005, 3, 20], [0.0049, 3, 20], [33.01, 3, 30]].map(([a, c, d]) => [a, c, d, funding.planDebit(a, c, d)]),
    refund: [funding.attributeRefund(0.01, { crypto: 0.5, card: 0.5 }), funding.attributeRefund(95, { crypto: 0.3, card: 0.7 })],
    net: [[19.99, "TRC20"], [20, "TRC20"], [20, "BEP20"], [30.01, "TRC20"]].map(([a, n]) => [a, n, withdrawal.netReceive(a, n)]),
    validate: [19.99, 20, 20.005, 30.01].map((a) => [a, withdrawal.validateWithdrawal({ network: "TRC20", address: "x", amountUsdt: a, balanceUsdt: 30 }, true)]),
    min: withdrawal.MIN_WITHDRAW_USDT,
    fees: withdrawal.WITHDRAW_NETWORKS.map((n: any) => [n.key, n.feeUsdt]),
  };
  out.format = {
    usdNegative: fc.formatCurrency(-50, "USD"),
    krwNegative: fc.formatCurrency(-50, "KRW"),
    krw: [0.005, 0.5, 7.24, 7.25, 80, 95700].map((v) => [v, fc.formatCurrency(v, "KRW")]),
    usd: [0.005, 0.5, 7.24, 1234.5].map((v) => [v, fc.formatCurrency(v, "USD")]),
    // 출금 금액 칸: 100 을 넣은 채 통화를 원화로 바꾸면 같은 글자가 원화로 읽힌다(WithdrawScreen.tsx:78 의 식)
    withdrawText100: { asUsd: +(100 / 1).toFixed(2), asKrw: +(100 / 1380).toFixed(2) },
    // 원화 27600 을 넣었을 때(20 USDT)의 화면 글자
    krw27600: { usdt: +(27600 / 1380).toFixed(2), shown: fc.formatCurrency(+(27600 / 1380).toFixed(2), "KRW") },
  };
}

// 4. 스토어 재현
{
  const { useWalletStore } = await load("stores/walletStore.ts");
  // 4a. 차감되지 않은 출금을 취소하면 잔액이 생기는가
  useWalletStore.setState({ ...useWalletStore.getInitialState(), balance: 0, cryptoBalance: 0, cardBalance: 0, transactions: [] });
  const debited = useWalletStore.getState().debitCrypto(30);
  useWalletStore.getState().addTransaction({ type: "withdraw", accountId: "u1", serverId: "srv1", amountUsdt: -30, ref: "TRC20:x", status: "PENDING" });
  const tx = useWalletStore.getState().transactions.find((x: any) => x.serverId === "srv1");
  const before = useWalletStore.getState().cryptoBalance;
  useWalletStore.getState().syncWithdrawal(tx.id, "CANCELLED", {});
  const after = useWalletStore.getState().cryptoBalance;
  // 같은 건을 한 번 더 취소해도 다시 올라가지 않는지
  useWalletStore.getState().syncWithdrawal(tx.id, "CANCELLED", {});
  out.withdrawCancel = { debitReturned: debited, balanceBeforeCancel: before, balanceAfterCancel: after, afterSecondCancel: useWalletStore.getState().cryptoBalance };

  // 4b. 지갑 내역의 필터: accountId 가 없는 개봉과 받기 거래
  useWalletStore.setState({ ...useWalletStore.getInitialState(), transactions: [] });
  const w = useWalletStore.getState();
  w.addTransaction({ type: "bonus", amountUsdt: 10000, ref: "welcome", accountId: "u1" });
  w.addTransaction({ type: "open", amountUsdt: -1, ref: "boxx1" });
  w.addTransaction({ type: "sellback", amountUsdt: 19, ref: "o1", itemIds: ["o1"] });
  const all = useWalletStore.getState().transactions;
  out.walletFilter = { stored: all.map((x: any) => [x.type, x.accountId ?? null]), shown: all.filter((x: any) => x.accountId === "u1").map((x: any) => x.type) };
}

// 5. 브라우저 계정 흉내 서비스에 지금 화면이 보내는 요청
{
  const ba = await load("lib/browserAccount.ts");
  const attempt = async (p: string, body: unknown) => {
    try { const r = await ba.browserAccountRequest(p, body); return { ok: true, keys: Object.keys(r) }; }
    catch (e: any) { return { ok: false, name: e?.constructor?.name, code: e?.code ?? e?.message }; }
  };
  const login = await attempt("/auth/login", { email: "audit@example.test", password: "pw-audit-0001" });
  const session = await attempt("/auth/session", {});
  out.browserAccount = {
    login, session,
    passwordChange: await attempt("/account/password/change", { currentPassword: "pw-audit-0001", newPassword: "new-password-0002", otpCode: "123456" }),
    closure: await attempt("/account/closure", { password: "pw-audit-0001", confirm: true }),
    shipping: await attempt("/shipping/request", { ownedIds: ["o1"], address: {}, feeUsdt: 0, idempotencyKey: "k" }),
    depositAddress: await attempt("/deposit/address", { network: "TRC20" }),
  };
}

console.log(JSON.stringify(out, null, 1));
