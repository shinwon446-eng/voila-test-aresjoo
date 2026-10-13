/**
 * 업그레이드(HEAD 에만 있다)의 돈과 장부 불변식을 모듈을 직접 불러 검사한다.
 * cd web && WEB_ROOT=<web 루트> SEED=1 N=2000 npx tsx <이 파일>
 *   1. 확률식: 0.9 × 건 상품가 ÷ 목표 상품가, 0.01% 내림(정확한 유리수로 따로 계산해 견준다). 후보 전부 × 건 상품가 표본.
 *   2. N 번 걸기: 잔액과 거래 기록이 한 번도 움직이지 않는다. 건 상품 상태 변경과 목표 삽입이 보관함 키 한 번의 쓰기다.
 *      추첨 번호가 겹치지 않는다. 회차가 개봉과 업그레이드 사이에서 줄거나 겹치지 않는다(내 값을 바꿔도).
 *   3. 같은 추첨 두 번: 연타(같은 약속), 다시 부르기(blocked), 기억 속 장부를 옛 모습으로 되돌린 뒤 부르기(저장된 장부로 판정 → blocked), 재수화 뒤 상태 유지.
 *   4. 저장되지 않은 회차 예약: 공정성 키의 쓰기를 조용히 버리면 걸지 않고, 개봉도 차감 전에 멈춘다.
 *   5. 기대값: 업그레이드 뒤 받기의 기대 수령액 ÷ 건 상품을 그냥 받을 때의 수령액.
 */
import { pathToFileURL } from "node:url";
import path from "node:path";

const ROOT = process.env.WEB_ROOT!;
const SEED = Number(process.env.SEED ?? 1);
const N = Number(process.env.N ?? 2000);

let rngState = SEED >>> 0 || 1;
const rnd = (): number => { rngState ^= rngState << 13; rngState >>>= 0; rngState ^= rngState >>> 17; rngState ^= rngState << 5; rngState >>>= 0; return rngState / 4294967296; };
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)];

const disk = new Map<string, string>();
const writes: { key: string; len: number }[] = [];
let dropWrites: ((key: string) => boolean) | null = null;
const storage = {
  get length() { return disk.size; },
  key: (i: number) => Array.from(disk.keys())[i] ?? null,
  getItem: (k: string) => disk.get(k) ?? null,
  setItem: (k: string, v: string) => { if (dropWrites?.(k)) return; writes.push({ key: k, len: v.length }); disk.set(k, String(v)); },
  removeItem: (k: string) => { disk.delete(k); },
  clear: () => disk.clear(),
};
Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });

const mod = async <T = any>(rel: string): Promise<T> => import(pathToFileURL(path.join(ROOT, rel)).href) as Promise<T>;
const fails: string[] = [];
const check = (name: string, ok: boolean, detail = "") => { console.log((ok ? "PASS " : "FAIL ") + name + (detail ? "  " + detail : "")); if (!ok) fails.push(name); };

async function main() {
  const { useWalletStore } = await mod("stores/walletStore.ts");
  const { useInventoryStore } = await mod("stores/inventoryStore.ts");
  const { useFairStore } = await mod("stores/fairStore.ts");
  const { reserveNonces } = await mod("stores/fairStore.ts");
  const up = await mod("lib/upgrade.ts");
  const { settleUpgrade } = await mod("lib/upgradeSettle.ts");
  const { settleTakeMany, takeAmountOf } = await mod("lib/takeBatch.ts");
  const { createOpeningPurchase } = await mod("lib/opening.ts");
  const { hashServerSeed, calculateRollResult } = await mod("lib/fairness.ts");
  const products = await mod("lib/products.ts");
  const compact = await mod("lib/compactStorage.ts");
  const INV = useInventoryStore.persist.getOptions().name; const WAL = useWalletStore.persist.getOptions().name; const FAIR = useFairStore.persist.getOptions().name;
  const MARKS = "voila.upgrade-unconfirmed." + WAL;

  // ── 1. 확률식 ──────────────────────────────────────────────────────────────
  const pool = up.upgradePool() as { item: { id: string; value: number; image: { src?: string } }; box: { slug: string; category: string } }[];
  const exactUnits = (s: number, t: number): bigint => (9000n * BigInt(Math.round(s * 100))) / BigInt(Math.round(t * 100));
  let formulaBad = 0; let rangeBad = 0; let checked = 0;
  const stakes = [0.5, 1, 2.5, 7.99, 10, 33.33, 49.99, 100, 123.45, 250, 999.99, 1000, 4999, 12000, 60000];
  for (const s of stakes) for (const c of pool) {
    const t = c.item.value;
    const units = up.chanceUnitsOf(s, t) as number | null;
    const inRange = t * 100 >= Math.round(s * 100) * 12 / 10 - 1e-9 && Math.round(t * 100) <= Math.round(s * 100) * 40;
    checked++;
    if (inRange !== (units !== null)) { rangeBad++; continue; }
    if (units !== null && BigInt(units) !== exactUnits(s, t)) formulaBad++;
    if (units !== null && (units < 225 || units > 7500)) formulaBad++;
  }
  check("U2 확률식 = floor(9000 × stake센트 ÷ target센트), 2.25%~75%", formulaBad === 0 && rangeBad === 0, `${checked} 쌍, 식 어긋남 ${formulaBad}, 범위 어긋남 ${rangeBad}`);
  // 부동소수 함정: 45% 가 44.99 로 내려가지 않는다
  check("U2 0.9 × 100 ÷ 200 = 45.00%", up.chanceUnitsOf(100, 200) === 4500, String(up.chanceUnitsOf(100, 200)));
  check("U2 0.9 × 0.1 ÷ 0.3 = 30.00%", up.chanceUnitsOf(0.1, 0.3) === 3000, String(up.chanceUnitsOf(0.1, 0.3)));
  check("U2 배수 1.2 미만 null, 40 초과 null", up.chanceUnitsOf(100, 119.99) === null && up.chanceUnitsOf(100, 120) === 7500 && up.chanceUnitsOf(100, 4000) === 225 && up.chanceUnitsOf(100, 4000.01) === null);
  // 단추마다 목표가 결정적이고 서로 다르다
  let optBad = 0;
  for (const s of stakes) {
    const a = up.upgradeOptions({ itemId: "x", valueUsdt: s }); const b = up.upgradeOptions({ itemId: "x", valueUsdt: s });
    if (JSON.stringify(a.map((o: any) => o.target?.item.id)) !== JSON.stringify(b.map((o: any) => o.target?.item.id))) optBad++;
    const ids = a.map((o: any) => o.target?.item.id).filter(Boolean);
    if (new Set(ids).size !== ids.length) optBad++;
    for (const o of a) if (o.target && (o.chanceUnits !== up.chanceUnitsOf(s, o.target.item.value) || !up.timesInRange(s, o.target.item.value))) optBad++;
  }
  check("U3 단추의 목표는 결정적이고 서로 다르며 확률은 식과 같다", optBad === 0, String(optBad));

  // ── 2. N 번 걸기 ───────────────────────────────────────────────────────────
  const SERVER = "upgrade-review-server-" + SEED; let CLIENT = "upgrade-review-client";
  useFairStore.setState({ serverSeed: SERVER, serverSeedHash: await hashServerSeed(SERVER), clientSeed: CLIENT, nonce: 0 });
  useWalletStore.setState({ cryptoBalance: 1234.56, cardBalance: 78.9, balance: 1313.46, transactions: [] });
  useInventoryStore.setState({ items: [] });
  // (지갑은 걸기마다 앞뒤를 견준다)
  const physical = pool.filter((c) => c.item.value >= 5 && c.item.value <= 5000);
  const seen = new Set<string>(); const nonces: number[] = [];
  let won = 0, lost = 0, other: Record<string, number> = {}, writeBad = 0, twoWriteDetail = "", nonceBad = 0, idDup = 0, stakeStatusBad = 0, targetBad = 0, verifyBad = 0, fundingBad = 0, upgradeCount = 0;
  let expectedTake = 0, plainTake = 0;
  for (let i = 0; i < N; i++) {
    // 가끔 개봉을 섞어 회차 계수기를 같이 쓴다. 가끔 내 값을 바꾼다
    if (rnd() < 0.08) {
      const box = pick(products.HOME_BOXES as { slug: string; price: number }[]);
      useWalletStore.setState({ cryptoBalance: 100000, cardBalance: 0, balance: 100000 });
      try { const rs = await createOpeningPurchase(box, 1 + Math.floor(rnd() * 3))(); for (const r of rs) nonces.push(r.nonce); } catch { /* 값이 모자라면 건너뛴다 */ }
      useWalletStore.setState({ cryptoBalance: 1234.56, cardBalance: 78.9, balance: 1313.46, transactions: [] });
    }
    if (rnd() < 0.05) { CLIENT = "client-" + i; useFairStore.getState().setClientSeed(CLIENT); }
    const c = pick(physical);
    const ratio = pick([{ crypto: 1, card: 0 }, { crypto: 0, card: 1 }, { crypto: 0.3, card: 0.7 }]);
    const [stake] = useInventoryStore.getState().add([{ itemId: c.item.id, boxSlug: c.box.slug, valueUsdt: c.item.value, tier: "royal", fair: { serverSeed: "s", serverSeedHash: "h", clientSeed: "c", nonce: 0, roll: 0 }, fundingRatio: ratio }]);
    const options = up.upgradeOptions({ itemId: c.item.id, valueUsdt: c.item.value, category: c.box.category }) as { chip: number; target: any; chanceUnits: number }[];
    const open = options.filter((o) => o.target);
    if (!open.length) continue;
    const opt = pick(open);
    const req = { stakeOwnedId: stake.id, targetItemId: opt.target.item.id, chanceUnits: opt.chanceUnits };
    const before = writes.length;
    const walletBefore = JSON.stringify(useWalletStore.persist.getOptions().partialize!(useWalletStore.getState()));
    const out = await settleUpgrade(req);
    if (JSON.stringify(useWalletStore.persist.getOptions().partialize!(useWalletStore.getState())) !== walletBefore || disk.get(WAL) !== (disk.get(WAL) ?? null)) fundingBad++;
    if (compact.readLedger(WAL).state.transactions.length !== 0 || compact.readLedger(WAL).state.balance !== 1313.46) fundingBad++;
    const invWrites = writes.slice(before).filter((w) => w.key === INV); const walWrites = writes.slice(before).filter((w) => w.key === WAL);
    if (out.status === "won" || out.status === "lost") {
      upgradeCount++;
      // 보관함 쓰기: 장부 변경 1번 + syncStores 의 재수화가 다시 적는 1번. 변경 자체는 한 번이어야 한다(마지막 쓰기 앞의 쓰기들에서 상태 변화를 본다)
      // 지갑 쓰기: 재수화의 되쓰기만 있어야 하고 내용은 같아야 한다
      const invChanges = invWrites.length;
      if (invChanges !== 2) { writeBad++; twoWriteDetail = `inv writes=${invChanges} wal writes=${walWrites.length}`; }
      const r = out.record;
      if (seen.has(r.id)) idDup++; seen.add(r.id);
      nonces.push(r.nonce);
      const savedInv = compact.readLedger(INV).state.items as any[];
      const s = savedInv.find((x) => x.id === stake.id); const t = savedInv.find((x) => x.id === r.target.ownedId);
      if (!s || s.status !== "UPGRADED" || s.upgrade?.id !== r.id) stakeStatusBad++;
      if (r.won) { won++; if (!t || t.status !== "IN_STORAGE" || t.upgradedFrom?.id !== r.id || t.valueUsdt !== opt.target.item.value || JSON.stringify(t.fundingRatio) !== JSON.stringify(ratio)) targetBad++; }
      else { lost++; if (t) targetBad++; }
      if (r.chanceUnits !== opt.chanceUnits || r.won !== up.upgradeWon(r.roll, r.chanceUnits)) verifyBad++;
      const roll = (await calculateRollResult(r.serverSeed, r.clientSeed, r.nonce)).roll;
      if (roll !== r.roll) verifyBad++;
      const v = await up.verifyUpgradeRecord(r); if (!v.ok) verifyBad++;
      // 기대값(한 번만): 업그레이드 뒤 받기 vs 그냥 받기
      expectedTake += (r.chanceUnits / 10000) * takeAmountOf({ valueUsdt: r.target.valueUsdt }); plainTake += takeAmountOf({ valueUsdt: c.item.value });
    } else other[out.status] = (other[out.status] ?? 0) + 1;
  }
  for (let i = 1; i < nonces.length; i++) if (nonces[i] <= nonces[i - 1]) nonceBad++;
  check("U1 잔액과 거래 기록이 한 번도 움직이지 않았다", fundingBad === 0, `${upgradeCount} 번 가운데 ${fundingBad}`);
  check("U8 건 상품 상태와 목표 삽입이 보관함 키 한 번의 쓰기(+재수화 되쓰기 1)", writeBad === 0, `${writeBad} ${twoWriteDetail}`);
  check("U4 회차가 개봉과 업그레이드를 섞고 내 값을 바꿔도 줄거나 겹치지 않는다", nonceBad === 0, `${nonces.length} 회차, 어긋남 ${nonceBad}, 마지막 ${nonces[nonces.length - 1]}`);
  check("추첨 번호가 겹치지 않는다", idDup === 0);
  check("U1 건 상품은 UPGRADED 이고 기록이 붙는다", stakeStatusBad === 0, String(stakeStatusBad));
  check("U1 성공이면 목표가 보관 중으로 들어오고 자금 출처를 잇는다, 실패면 없다", targetBad === 0, `won ${won} lost ${lost} bad ${targetBad}`);
  check("U4 기록을 다시 계산하면 번호, 확률, 결과가 맞는다", verifyBad === 0, String(verifyBad));
  check("걸기 결과 분포", true, JSON.stringify({ won, lost, ...other }));
  const ratioEV = expectedTake / plainTake;
  check("기대값: 업그레이드 뒤 받기 ÷ 그냥 받기 ≤ 0.9 (상품가 대비 ≤ 0.855)", ratioEV <= 0.9 + 1e-9, `${ratioEV.toFixed(4)} (상품가 대비 ${(ratioEV * 0.95).toFixed(4)})`);
  check("표시가 남지 않았다", (disk.get(MARKS) ?? null) === null, disk.get(MARKS) ?? "");

  // ── 3. 같은 추첨 두 번 ──────────────────────────────────────────────────────
  const c = physical.find((x) => up.upgradeOptions({ itemId: x.item.id, valueUsdt: x.item.value })[1].target)!;
  const mk = () => useInventoryStore.getState().add([{ itemId: c.item.id, boxSlug: c.box.slug, valueUsdt: c.item.value, tier: "royal", fair: { serverSeed: "s", serverSeedHash: "h", clientSeed: "c", nonce: 0, roll: 0 } }])[0];
  const opt = up.upgradeOptions({ itemId: c.item.id, valueUsdt: c.item.value })[1];
  {
    const s = mk(); const req = { stakeOwnedId: s.id, targetItemId: opt.target.item.id, chanceUnits: opt.chanceUnits };
    const nonce0 = useFairStore.getState().nonce;
    const [a, b] = await Promise.all([settleUpgrade(req), settleUpgrade(req)]);
    const c2 = await settleUpgrade(req);
    const items = (compact.readLedger(INV).state.items as any[]).filter((x) => x.id === s.id || x.upgradedFrom?.stakeOwnedId === s.id);
    check("U8 연타: 둘이 같은 결과 하나, 세 번째는 blocked, 회차는 1 올랐다", JSON.stringify(a) === JSON.stringify(b) && (a.status === "won" || a.status === "lost") && c2.status === "blocked" && useFairStore.getState().nonce === nonce0 + 1 && items.length === (a.status === "won" ? 2 : 1), `${a.status} ${b.status} ${c2.status} nonce ${nonce0}->${useFairStore.getState().nonce}`);
    // 기억 속 장부를 걸기 전으로 되돌린 뒤(옛 탭처럼) 다시 부른다: 저장된 장부로 판정해 걸지 않는다
    useInventoryStore.setState({ items: useInventoryStore.getState().items.map((x: any) => (x.id === s.id ? { ...x, status: "IN_STORAGE", upgrade: undefined } : x)) }, false);
    // (이 setState 가 저장소에도 적혔으므로 저장된 장부도 되돌아갔다. 진짜 옛 탭은 저장소에 적지 않으니 저장된 글을 다시 원래대로 둔다)
    const stale = JSON.stringify(useInventoryStore.getState().items.find((x: any) => x.id === s.id));
    const savedNow = compact.readLedger(INV).state.items as any[];
    const restored = savedNow.map((x) => (x.id === s.id ? { ...x, status: "UPGRADED", upgrade: a.record } : x));
    disk.set(INV, compact.ledgerText("inventory", { state: { items: restored }, version: 0 }));
    const d = await settleUpgrade(req);
    const after = (compact.readLedger(INV).state.items as any[]).find((x) => x.id === s.id);
    check("U8 기억 속 장부가 옛 모습이어도 저장된 장부로 판정한다(blocked, 기록 그대로)", d.status === "blocked" && after.status === "UPGRADED" && after.upgrade?.id === a.record.id, `${d.status} stale=${stale.slice(0, 60)}`);
    await useInventoryStore.persist.rehydrate();
    check("재수화 뒤에도 UPGRADED 와 기록이 그대로다", useInventoryStore.getState().items.find((x: any) => x.id === s.id)?.upgrade?.id === a.record.id);
    // 받기와 섞기: UPGRADED 상품을 받으려 하면 받지 않는다
    const takeOut = await settleTakeMany([s.id]);
    check("U7 UPGRADED 상품은 받을 수 없다(left, 돈 0)", takeOut.taken.length === 0 && takeOut.amountUsdt === 0 && takeOut.left.includes(s.id), JSON.stringify(takeOut));
  }

  // ── 4. 저장되지 않은 회차 예약 ──────────────────────────────────────────────
  {
    const s = mk(); const req = { stakeOwnedId: s.id, targetItemId: opt.target.item.id, chanceUnits: opt.chanceUnits };
    const nonce0 = useFairStore.getState().nonce; const fair0 = disk.get(FAIR);
    dropWrites = (k) => k === FAIR;
    const out = await settleUpgrade(req);
    dropWrites = null;
    const saved = (compact.readLedger(INV).state.items as any[]).find((x) => x.id === s.id);
    check("U4 회차 예약이 저장되지 않으면 걸지 않는다(failed, 보관 중 그대로, 표시 없음, 저장된 회차 그대로)", out.status === "failed" && saved.status === "IN_STORAGE" && !saved.upgrade && (disk.get(MARKS) ?? null) === null && disk.get(FAIR) === fair0, `${out.status} memNonce ${nonce0}->${useFairStore.getState().nonce}`);
    // 개봉도 같다: 차감 전에 멈춘다
    useWalletStore.setState({ cryptoBalance: 100000, cardBalance: 0, balance: 100000 });
    const w0 = JSON.stringify(useWalletStore.persist.getOptions().partialize!(useWalletStore.getState())); const i0 = disk.get(INV);
    dropWrites = (k) => k === FAIR;
    let err = "";
    try { await createOpeningPurchase(products.HOME_BOXES[0], 2)(); } catch (e) { err = (e as Error).message; }
    dropWrites = null;
    check("U4 개봉도 회차 예약이 저장되지 않으면 차감 전에 멈춘다", /reservation/.test(err) && JSON.stringify(useWalletStore.persist.getOptions().partialize!(useWalletStore.getState())) === w0 && disk.get(INV) === i0, err);
    // 다음 예약은 그 회차를 다시 받는다(겹치지 않는다)
    const r = await reserveNonces(1);
    check("저장되지 않은 회차는 다음 예약이 다시 받는다", !!r && r.nonces[0] === JSON.parse(fair0!).state.nonce, JSON.stringify(r?.nonces));
  }
  // 걸 수 없는 것들
  {
    const s = mk(); const req = { stakeOwnedId: s.id, targetItemId: opt.target.item.id, chanceUnits: opt.chanceUnits + 1 };
    check("화면이 본 확률과 다르면 blocked", (await settleUpgrade(req)).status === "blocked");
    const sold = await settleTakeMany([s.id]);
    check("받은 상품은 걸 수 없다(blocked)", sold.status === "settled" && (await settleUpgrade({ ...req, chanceUnits: opt.chanceUnits })).status === "blocked");
    // 확인 필요(받기 표시)인 상품은 걸 수 없다
    const s2 = mk(); disk.set("voila.take-unconfirmed." + WAL, JSON.stringify([{ ids: [s2.id] }]));
    check("받기의 확인 대기 표시가 남은 상품은 걸 수 없다(blocked)", (await settleUpgrade({ stakeOwnedId: s2.id, targetItemId: opt.target.item.id, chanceUnits: opt.chanceUnits })).status === "blocked");
    disk.delete("voila.take-unconfirmed." + WAL);
  }
  console.log(fails.length ? `FAILS: ${fails.length}` : "ALL PASS");
  process.exit(fails.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(2); });
