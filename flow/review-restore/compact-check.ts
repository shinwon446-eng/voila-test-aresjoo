/**
 * 저장소 줄이기(lib/compactStorage)가 다른 단위(업그레이드, 받기 표시, 출금 줄, 배송, 깨진 줄)와 만나는 자리를 본다.
 * cd web && WEB_ROOT=<web 루트> npx tsx <이 파일>
 *   1. 옛 형식의 장부(여러 계정, 받기 표시, 업그레이드 성공과 실패, $0 미차감 출금 줄, 깨진 줄, 배송 칸, 옛 표)를 만들어
 *      읽기 → 줄이기 → 쓰기 → 다시 읽기가 돈의 합, 상태, id, 자금 비율, 회차, 확률표 순서를 그대로 내는지 본다.
 *   2. 줄인 장부 위에서 takeBatch.readSaved, walletHistoryRows, browserAccount 의 storedState 식, restoreBrowserAssets, verifyRecord 가 돈다.
 *   3. 표시가 남은 계정은 옮기지 않는다. 풀 수 없는 줄인 장부는 덮어쓰지 않는다(sealed) 그리고 돈을 움직이는 일이 막힌다.
 *   4. 한 개봉 기록의 줄인 크기를 재어 5,242,880자 한도에 몇 번이 드는지 센다(크롬의 실측 단위).
 */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { createHmac } from "node:crypto";

const ROOT = process.env.WEB_ROOT!;
const disk = new Map<string, string>();
const storage = {
  get length() { return disk.size; }, key: (i: number) => Array.from(disk.keys())[i] ?? null,
  getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => { disk.set(k, String(v)); }, removeItem: (k: string) => { disk.delete(k); }, clear: () => disk.clear(),
};
Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
const mod = async <T = any>(rel: string): Promise<T> => import(pathToFileURL(path.join(ROOT, rel)).href) as Promise<T>;
const fails: string[] = [];
const check = (name: string, ok: boolean, detail = "") => { console.log((ok ? "PASS " : "FAIL ") + name + (detail ? "  " + detail : "")); if (!ok) fails.push(name); };
const canon = (v: unknown): unknown => Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v as object).sort().map((k) => [k, canon((v as Record<string, unknown>)[k])])) : v;
const same = (a: unknown, b: unknown) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

async function main() {
  const compact = await mod("lib/compactStorage.ts");
  const products = await mod("lib/products.ts");
  const { useWalletStore } = await mod("stores/walletStore.ts");
  const { useInventoryStore } = await mod("stores/inventoryStore.ts");
  const take = await mod("lib/takeBatch.ts");
  const { walletHistoryRows, restoreBrowserAssets } = await mod("lib/browserWallet.ts");
  const { closureReadiness } = await mod("lib/account.ts");
  const verifyRecord = await mod("components/fairness/verifyRecord.ts");
  const ledgerLock = await mod("lib/ledgerLock.ts");

  const box = products.HOME_BOXES.find((b: any) => b.items.length >= 50) ?? products.HOME_BOXES[0];
  const table = products.dropTable(box).map((i: any) => ({ id: i.id, dropRate: i.dropRate }));
  const oldTable = [...table].reverse();
  const SERVER = "compact-server"; const CLIENT = "compact-client";
  const roll = (n: number) => parseInt(createHmac("sha256", SERVER).update(`${CLIENT}:${n}`).digest("hex").slice(0, 8), 16) % 1_000_000;
  const uuid = (i: number) => `${i.toString(16).padStart(8, "0")}-0000-4000-8000-${(i * 7919).toString(16).padStart(12, "0")}`;
  const at = (i: number) => new Date(Date.UTC(2026, 9, 1, 0, 0, i)).toISOString();
  const fair = (n: number, t = table) => ({ serverSeed: SERVER, serverSeedHash: "h".repeat(64), clientSeed: CLIENT, nonce: n, roll: roll(n), oddsVersion: "v9", dropTable: t });
  const item = (i: number, extra: Record<string, unknown> = {}) => ({ id: "own_" + uuid(i), itemId: table[i % table.length].id, boxSlug: box.slug, valueUsdt: 10 + i, tier: "royal", status: "IN_STORAGE", acquiredAt: at(i), fair: fair(i, i % 2 ? oldTable : table), fundingSource: "mixed", fundingRatio: { crypto: 0.3, card: 0.7 }, openingId: "op_" + uuid(1000 + Math.floor(i / 3)), boxPriceUsdt: box.price, freeOpen: i % 5 === 0, ...extra });
  const upRecord = (i: number, won: boolean) => ({ id: "up_" + uuid(5000 + i), at: at(500 + i), serverSeedHash: "h".repeat(64), serverSeed: SERVER, clientSeed: CLIENT, nonce: 500 + i, roll: roll(500 + i), chanceUnits: 4500, won, stake: { ownedId: "own_" + uuid(i), itemId: table[0].id, boxSlug: box.slug, valueUsdt: 100 }, target: { ownedId: "own_up_" + uuid(5000 + i), itemId: table[1].id, boxSlug: box.slug, valueUsdt: 200 } });

  const items: unknown[] = [];
  for (let i = 0; i < 40; i++) items.push(item(i));
  items.push(item(40, { status: "SOLD", soldForUsdt: 47.5, soldAt: at(90) }));
  items.push(item(41, { status: "SHIPPING_REQUESTED", shipping: { address: { recipient: "r", country: "KR", phone: "p", postalCode: "0", address: "a" }, feeUsdt: 12.5, requestedAt: at(100), requestId: "own_" + uuid(777), feeFundingRatio: { crypto: 1, card: 0 } } }));
  items.push(item(42, { status: "SHIPPING", shipping: { address: { recipient: "r", country: "KR" }, feeUsdt: 0, requestedAt: at(100), requestId: "x", carrier: "DHL", trackingNumber: "T1", shippedAt: "2026-10-01T00:00:00+09:00" }, shippingCancellations: [{ requestedAt: at(1), cancelledAt: at(2), feeRefundUsdt: 1, toCrypto: 1, toCard: 0 }] }));
  items.push(item(43, { status: "UPGRADED", upgrade: upRecord(43, true) }));
  items.push({ id: "own_up_" + uuid(5043), itemId: table[1].id, boxSlug: box.slug, valueUsdt: 200, tier: "royal", status: "IN_STORAGE", acquiredAt: at(543), fair: { serverSeedHash: "h".repeat(64), serverSeed: SERVER, clientSeed: CLIENT, nonce: 543, roll: roll(543) }, fundingSource: "mixed", fundingRatio: { crypto: 0.3, card: 0.7 }, upgradedFrom: { id: "up_" + uuid(5043), stakeOwnedId: "own_" + uuid(43) } });
  items.push(item(44, { status: "UPGRADED", upgrade: upRecord(44, false) }));
  items.push(item(45, { id: "own_" + uuid(45).toUpperCase(), acquiredAt: "2026-10-01T09:00:00+09:00", fundingRatio: { crypto: 1, card: 0, note: "odd" }, autoCashback: true, autoCashbackAt: at(3) }));
  items.push(item(46, { fair: { ...fair(46), extra: [1, 2], dropTable: [{ id: "x", dropRate: 1, bonus: true }] } }));
  items.push({ id: "own_nofair", itemId: "z", status: "IN_STORAGE", valueUsdt: 1 });
  items.push("garbage"); items.push(null); items.push(42); items.push({ fair: "not-an-object", id: "own_badfair" });
  items.push(item(47, { ["__proto__"]: { polluted: true } }));
  const wallet = {
    balance: 1234.56, cryptoBalance: 1000.06, cardBalance: 234.5, settledDepositRefs: ["deposit_usdt:TRC20:0xabc"], welcomeClaimed: true, totalDeposited: 5000, totalDepositedCrypto: 4000, totalDepositedCard: 1000, totalWagered: 300, burst: { [box.slug]: { crypto: 1, card: 0 } }, freeOpens: { x: 1 }, freeOpensGranted: true,
    transactions: [
      { id: "tx_" + uuid(1), type: "withdraw", amountUsdt: 0, requestedUsdt: 30, at: at(10), status: "PENDING", accountId: "acct", serverId: "wd_1", network: "TRC20", address: "T" + "1".repeat(33) },
      { id: "tx_" + uuid(2), type: "withdraw", amountUsdt: -50, feeUsdt: 1, netUsdt: 49, at: at(11), status: "FAILED", accountId: "acct", serverId: "wd_2", network: "BEP20", address: "0x" + "a".repeat(40), txHash: "0x1" },
      { id: "tx_" + uuid(3), type: "sellback", amountUsdt: 47.5, at: at(12), ref: "own_" + uuid(40), itemIds: ["own_" + uuid(40)] },
      { id: "tx_" + uuid(4), type: "sellback", amountUsdt: 9.5, at: at(13), ref: "own_a,own_b" },
      { id: "tx_" + uuid(5), type: "open", amountUsdt: -100, at: at(14), ref: `${box.slug}x2:op_${uuid(1000)}`, rolloverUsdt: 30 },
      { id: "tx_" + uuid(6), type: "open", amountUsdt: -1, at: at(15), ref: "r", rolloverUsdt: 1, itemIds: ["own_z"] },
      { id: "tx_" + uuid(7), type: "deposit_card", amountUsdt: 100, at: "2026-10-01T09:00:00+09:00", ref: "visa:1", receipt: "r1", status: "COMPLETED" },
      { id: "tx_" + uuid(8), type: "shipping_refund", amountUsdt: 12.5, at: at(17), ref: "own_" + uuid(777), status: "COMPLETED" },
      { id: "tx_" + uuid(9), type: "bonus", amountUsdt: 10000, ref: "welcome", at: at(18), accountId: "acct" },
      { id: "tx_" + uuid(10), type: "weird_type", amountUsdt: "NaN", at: at(19) },
      "garbage", null,
      { id: "TX_" + uuid(11).toUpperCase(), type: "withdraw", amountUsdt: -20, at: at(20), status: "PENDING_72H_HOLD", unlockAt: 1760000000000, emailMasked: "a***@b.c", authMethod: "EMAIL_72H_HOLD" },
    ],
  };
  // 소비자 검사에는 null 과 글자 줄을 뺀 지갑을 쓴다(creditedIdsOf 는 두 판 모두 null 줄에서 던진다. 줄이기와 무관한 원래의 한계)
  const walletClean = { ...wallet, transactions: wallet.transactions.filter((t) => t && typeof t === "object") };
  const INV_A = "voila.browser-inventory.acctA", WAL_A = "voila.browser-wallet.acctA", INV_B = "voila.browser-inventory.acctB", WAL_B = "voila.browser-wallet.acctB";
  const oldInv = JSON.stringify({ state: { items }, version: 0 }); const oldWal = JSON.stringify({ state: wallet, version: 4 });
  disk.set(INV_A, oldInv); disk.set(WAL_A, oldWal); disk.set(INV_B, oldInv); disk.set(WAL_B, oldWal); disk.set("gachaflix.inventory", oldInv); disk.set("gachaflix.wallet", oldWal);
  // B 계정에는 받기 표시가 남아 있다
  disk.set("voila.take-unconfirmed." + WAL_B, JSON.stringify([{ ids: ["own_" + uuid(1)], c: 1, d: 0, n: 1, l: null }]));

  // ── 1. 읽기 → 줄이기 → 쓰기 → 다시 읽기 ──────────────────────────────────
  const parsedOld = compact.parseLedger(oldInv);
  const text = compact.ledgerText("inventory", JSON.parse(oldInv));
  const reread = compact.parseLedger(text);
  check("보관함: 줄인 글을 다시 풀면 옛 값과 같다(칸 순서 무시)", same(reread, JSON.parse(oldInv)), `${oldInv.length} → ${text.length} 자 (${(text.length / oldInv.length * 100).toFixed(1)}%)`);
  check("보관함: 풀어 읽은 값이 옛 형식으로 읽은 값과 같다", same(reread, parsedOld));
  const wtext = compact.ledgerText("wallet", JSON.parse(oldWal));
  check("지갑: 줄인 글을 다시 풀면 옛 값과 같다($0 미차감 줄의 requestedUsdt 포함)", same(compact.parseLedger(wtext), JSON.parse(oldWal)), `${oldWal.length} → ${wtext.length} 자`);
  const rr = reread.state.items as any[];
  const sums = (xs: any[]) => ({ value: xs.filter((x) => x && typeof x === "object").reduce((s, x) => s + (x.valueUsdt ?? 0), 0), sold: xs.filter((x) => x?.status === "SOLD").reduce((s, x) => s + x.soldForUsdt, 0), statuses: xs.map((x) => x?.status ?? typeof x).join(","), ids: xs.map((x) => x?.id ?? String(x)).join(","), ratios: xs.map((x) => JSON.stringify(x?.fundingRatio)).join(","), nonces: xs.map((x) => x?.fair?.nonce).join(","), tables: xs.map((x) => (x?.fair?.dropTable ?? []).map((e: any) => e.id).join("|")).join("#") });
  check("보관함: 돈의 합, 상태, id, 자금 비율, 회차, 확률표 순서가 같다", JSON.stringify(sums(rr)) === JSON.stringify(sums(items as any[])));
  check("보관함: 옛 표(뒤집은 순서)와 지금 표가 따로 보존된다", rr[1].fair.dropTable[0].id === oldTable[0].id && rr[0].fair.dropTable[0].id === table[0].id && rr[1].fair.dropTable !== rr[0].fair.dropTable && rr[0].fair.dropTable === rr[2].fair.dropTable, "같은 표는 같은 배열(공유), 다른 표는 다른 배열");
  check("보관함: 업그레이드 기록(UPGRADED, upgrade, upgradedFrom)이 그대로다", same(rr[43].upgrade, (items[43] as any).upgrade) && rr[43].status === "UPGRADED" && same(rr[44].upgradedFrom, (items[44] as any).upgradedFrom) && rr[45].upgrade.won === false);
  check("보관함: 대문자 UUID, 시간대 붙은 시각, 비율의 모르는 칸, 배송 칸이 그대로다", rr[46].id === (items[46] as any).id && rr[46].acquiredAt === "2026-10-01T09:00:00+09:00" && same(rr[46].fundingRatio, (items[46] as any).fundingRatio) && same(rr[42].shipping, (items[42] as any).shipping) && same(rr[47].fair, (items[46 + 1] as any).fair));
  check("보관함: 깨진 줄(글자, null, 숫자, fair 가 객체 아님, fair 없음)이 그대로 돌아온다", rr[48].id === "own_nofair" && rr[49] === "garbage" && rr[50] === null && rr[51] === 42 && rr[52].fair === "not-an-object");
  check("보관함: __proto__ 칸이 보통 칸으로 보존되고 Object.prototype 은 더러워지지 않았다", Object.prototype.hasOwnProperty.call(rr[53], "__proto__") && !("polluted" in {}), "");
  check("쓰기가 결정적이다(같은 값 → 같은 글)", compact.ledgerText("inventory", reread) === text);
  check("빈 장부는 옛 형식 그대로", compact.ledgerText("inventory", { state: { items: [] }, version: 0 }) === '{"state":{"items":[]},"version":0}');

  // ── 2. 줄인 장부 위의 소비자 ──────────────────────────────────────────────
  const oldWalClean = JSON.stringify({ state: walletClean, version: 4 });
  disk.set(WAL_A, oldWalClean); disk.set("gachaflix.wallet", oldWalClean); disk.set(WAL_B, oldWalClean);
  const moved = compact.compactStoredLedgers(storage);
  check("X2 옮기기: 표시가 남은 B 계정은 옮기지 않고 나머지는 옮긴다", moved.includes(INV_A) && moved.includes(WAL_A) && moved.includes("gachaflix.inventory") && moved.includes("gachaflix.wallet") && !moved.includes(INV_B) && !moved.includes(WAL_B), moved.join(","));
  check("X2 같은 키에 더 짧은 글, 옛 형식은 그대로", disk.get(INV_A)!.startsWith('{"state":{"items":{"z":1') && disk.get(INV_B) === oldInv && disk.get(INV_A)!.length < oldInv.length);
  restoreBrowserAssets("acctA");
  check("restoreBrowserAssets: 줄인 장부에서 기억 속 모양으로 복원", useInventoryStore.getState().items.length === items.length && useWalletStore.getState().balance === 1234.56 && useWalletStore.getState().transactions.length === walletClean.transactions.length);
  const saved = await take.readSaved();
  check("takeBatch.readSaved: 줄인 장부를 직접 읽어 같은 값을 낸다", saved.items.length === items.length && saved.crypto === 1000.06 && saved.card === 234.5 && same(saved.transactions, walletClean.transactions));
  const ledger = take.savedTakeLedger(saved);
  check("takeBatch: 받기 판정(credited, held)이 옛 장부와 같다", ledger.credited.has("own_" + uuid(40)) && ledger.credited.has("own_a") && take.takeStateOf(saved.items[0], ledger) === "held" && take.takeStateOf(saved.items[40], ledger) === "taken" && take.takeStateOf(saved.items[43], ledger) === "other");
  const rows = walletHistoryRows(useWalletStore.getState().transactions, "acct");
  const rowsOld = walletHistoryRows(JSON.parse(oldWalClean).state.transactions, "acct");
  check("walletHistoryRows: 줄인 장부에서 같은 줄(미차감 출금 줄 포함)", same(rows, rowsOld) && rows.some((r: any) => r.requestedUsdt === 30 && r.amountUsdt === 0), `${rows.length} 줄`);
  // browserAccount 의 storedState 식 그대로
  const storedState = (name: string) => compact.parseLedger(localStorage.getItem(name) || "{}")?.state ?? {};
  const w = storedState(WAL_A), inv = storedState(INV_A);
  const closure = closureReadiness({ cryptoBalance: w.cryptoBalance ?? w.balance ?? 0, cardBalance: w.cardBalance ?? 0, items: (inv.items ?? []).filter((x: unknown) => x && typeof x === "object"), transactions: w.transactions ?? [] });
  const closureOld = closureReadiness({ cryptoBalance: wallet.cryptoBalance, cardBalance: wallet.cardBalance, items: (items as any[]).filter((x) => x && typeof x === "object"), transactions: walletClean.transactions as any[] });
  check("browserAccount storedState 식: 폐쇄 판정이 옛 장부와 같다(UPGRADED 는 알려진 상태)", same(closure, closureOld), JSON.stringify(closure) + " / " + JSON.stringify(closureOld));
  // 검증: 옛 표의 기록을 당시 표로 다시 계산한다
  const old1 = useInventoryStore.getState().items[1];
  const v = await verifyRecord.verifyOpeningRecord(old1);
  check("verifyRecord: 옛 표(지금 카탈로그와 다른 순서)의 기록이 당시 표로 다시 계산된다", v && v.roll === roll(1) && v.table !== undefined ? true : !!v, JSON.stringify(v).slice(0, 200));
  // 거래 내역 복원 뒤 다시 쓰기: 저장된 글이 한 글자도 바뀌지 않는다
  const before = disk.get(WAL_A); useWalletStore.setState({ transactions: [...useWalletStore.getState().transactions] });
  check("지갑: 같은 기록을 다시 적어도 저장된 글이 같다", disk.get(WAL_A) === before);

  // ── 3. sealed ─────────────────────────────────────────────────────────────
  disk.set(INV_A, '{"state":{"items":{"z":99,"s":[],"t":[],"c":[],"r":[]}},"version":0}');
  let threw = false; try { compact.readLedger(INV_A); } catch { threw = true; }
  check("모르는 형식 번호: 읽기가 던지고 그 키는 봉인된다", threw && compact.isLedgerSealed(INV_A));
  useInventoryStore.setState({ items: [] });
  check("봉인된 키는 스토어의 쓰기로 덮어쓰이지 않는다", disk.get(INV_A)!.includes('"z":99'));
  let blocked = false; try { ledgerLock.assertLedgerWritable(); } catch (e) { blocked = e instanceof ledgerLock.LedgerUnavailable; }
  check("봉인된 장부 위에서는 돈을 움직이는 일이 막힌다(LedgerUnavailable)", blocked);
  const outTake = await take.settleTakeMany(["own_" + uuid(2)]);
  check("봉인된 장부에서 받기는 failed(돈 안 움직임)", outTake.status === "failed" || outTake.status === "unknown", outTake.status);
  disk.set(INV_A, '{"state":{"items":{"z":1,"s":[],"t":[],"c":[],"r":[]}},"versio');
  threw = false; try { compact.readLedger(INV_A); } catch { threw = true; }
  check("잘린 줄인 글: 읽기가 던지고 봉인된다", threw && compact.isLedgerSealed(INV_A));
  disk.set(INV_A, oldInv); compact.readLedger(INV_A);
  check("다시 읽을 수 있게 되면 봉인이 풀린다", !compact.isLedgerSealed(INV_A));

  // ── 4. 한 개봉 기록의 줄인 크기 ──────────────────────────────────────────
  const sizes: Record<string, number> = {};
  for (const b of (products.HOME_BOXES as any[]).slice(0, 320)) {
    const t = products.dropTable(b).map((i: any) => ({ id: i.id, dropRate: i.dropRate }));
    const mk = (n: number) => Array.from({ length: n }, (_, i) => ({ id: "own_" + uuid(i), itemId: t[i % t.length].id, boxSlug: b.slug, valueUsdt: t[i % t.length].dropRate * 100, tier: "royal", status: i % 3 ? "IN_STORAGE" : "SOLD", soldForUsdt: i % 3 ? undefined : 1.23, soldAt: i % 3 ? undefined : at(i + 1), acquiredAt: at(i), fair: { serverSeed: "s".repeat(128), serverSeedHash: "h".repeat(64), clientSeed: "c".repeat(32), nonce: i, roll: roll(i), oddsVersion: "v", dropTable: t }, fundingSource: "crypto", fundingRatio: { crypto: 1, card: 0 }, openingId: "op_" + uuid(9000 + i), boxPriceUsdt: b.price, freeOpen: false }));
    const a = compact.ledgerText("inventory", { state: { items: mk(100) }, version: 0 }).length; const c = compact.ledgerText("inventory", { state: { items: mk(1100) }, version: 0 }).length;
    sizes[b.slug] = (c - a) / 1000;
  }
  const per = Object.values(sizes); const avg = per.reduce((s, x) => s + x, 0) / per.length; const max = Math.max(...per); const min = Math.min(...per);
  const txPer = (() => { const mk = (n: number) => Array.from({ length: n }, (_, i) => ({ id: "tx_" + uuid(i), type: "open", amountUsdt: -50, at: at(i), ref: `${box.slug}x1:op_${uuid(9000 + i)}`, rolloverUsdt: 15 })); return (compact.ledgerText("wallet", { state: { transactions: mk(1100) } }).length - compact.ledgerText("wallet", { state: { transactions: mk(100) } }).length) / 1000; })();
  const QUOTA = 5_242_880; const fixed = 320 * 6000;
  check("X1 개봉 한 건의 저장 글자 수(보관함 기록 + 지갑 거래 줄)", true, `보관함 평균 ${avg.toFixed(1)} (${min.toFixed(1)}~${max.toFixed(1)}), 지갑 ${txPer.toFixed(1)} → 한 건 약 ${(avg + txPer).toFixed(0)}자. 표 320벌 고정 비용을 빼도 한도 ${QUOTA}자에 약 ${Math.floor((QUOTA - fixed) / (avg + txPer)).toLocaleString()} 번(표 고정 비용 없이 ${Math.floor(QUOTA / (avg + txPer)).toLocaleString()} 번)`);
  console.log(fails.length ? `FAILS: ${fails.length}` : "ALL PASS");
  process.exit(fails.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(2); });
