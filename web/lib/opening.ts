import { CATALOG_ODDS_VERSION, dropTable, floorRatio, type ProductBox, type ProductItem } from "./products";
import { calculateRollResult, determineItem } from "./fairness";
import { tierOf, type Tier } from "./tiers";
import { rolloverContribution } from "./rollover";
import { useFairStore } from "../stores/fairStore";
import { useInventoryStore } from "../stores/inventoryStore";
import { useWalletStore } from "../stores/walletStore";
import { assertSameLedger, ledgerKey, withLedgerLock } from "./ledgerLock";
import { BURST, EMPTY_POT, burstPayout, potAfterOpen } from "./burst";
import { CRYPTO_ONLY, type FundingSplit } from "./funding";

export interface OpeningResult {
  ownedId: string;
  settled: boolean;
  item: ProductItem;
  tier: Tier;
  roll: number;
  hmac: string;
  nonce: number;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
}

export class InsufficientOpeningBalance extends Error {}

/** One purchase, independent of animation. Repeated calls share one operation.
 * Calculate the full batch before charging. After the last await, debit,
 * allocation and cashback run together without any animation or user-event gap.
 * This is a browser ledger; an authoritative service must replace it for real funds.
 *
 * Guards added for the opening experience (opening/DECISIONS.md, 반복 2):
 *  - the whole purchase runs inside a per-account ledger lock (lib/ledgerLock) so two tabs cannot overwrite each other;
 *  - the ledger (account) is pinned at the start and re-checked after the awaits, so a purchase never lands on another account;
 *  - a failure anywhere after the debit restores the wallet and the inventory to their exact state before it
 *    (an earlier version refunded the price but left an already-credited cashback behind);
 *  - every allocated record carries the opening id, so an unseen result can be shown again without a new draw.
 */
export function createOpeningPurchase(box: ProductBox, count: number, openingId?: string) {
  let operation: Promise<OpeningResult[]> | undefined;
  return () => operation ??= withLedgerLock(() => executeOpening(box, count, openingId));
}

async function executeOpening(box: ProductBox, count: number, openingId?: string): Promise<OpeningResult[]> {
  if (!Number.isSafeInteger(count) || count < 1 || count > 100) throw new RangeError("Invalid opening quantity");
  /** 무료로 열 수 있는 횟수를 먼저 쓴다. 남는 만큼만 값을 낸다 */
  const plan = () => { const free = Math.min(count, Math.max(0, Math.floor(useWalletStore.getState().freeOpens?.[box.slug] ?? 0))); return { free, cost: +(box.price * (count - free)).toFixed(2) }; };
  const ledger = ledgerKey();

  // Seed creation is asynchronous.  Do not keep a wallet snapshot across it:
  // a balance update in that gap used to let an opening continue with stale
  // state and surface as a generic opening failure.
  if (useWalletStore.getState().balance < plan().cost) throw new InsufficientOpeningBalance();
  await useFairStore.getState().ensureSeeds();
  const fair = useFairStore.getState();
  const { serverSeed, serverSeedHash, clientSeed } = fair;
  const table = dropTable(box);
  const nonces = Array.from({ length: count }, () => fair.takeNonce());
  const rolls = await Promise.all(nonces.map((nonce) => calculateRollResult(serverSeed, clientSeed, nonce)));
  const picked = rolls.map((r, i) => {
    const item = determineItem(r.roll, table);
    return { ...r, item, tier: tierOf(item.value, box.price), nonce: nonces[i], serverSeed, serverSeedHash, clientSeed };
  });
  // The account may have changed while the seeds and rolls were being computed. Never charge a different ledger.
  assertSameLedger(ledger);
  // From here to the return there is no await. Keep the exact state before the debit; any failure puts it back whole.
  const walletBefore = useWalletStore.getState();
  const inventoryBefore = useInventoryStore.getState();
  // 기다리는 동안 장부가 바뀌었을 수 있으니 무료 횟수와 값을 여기서 다시 정한다
  const { free, cost } = plan();
  try {
    // 전부 무료면 돈이 움직이지 않는다. 그 결과의 출처는 USDT 입금분으로 본다
    const funding: FundingSplit | null = cost > 0 ? walletBefore.debitSplit(cost) : { fromCrypto: 0, fromCard: 0, source: "crypto", ratio: CRYPTO_ONLY };
    if (!funding) throw new InsufficientOpeningBalance();
    const wallet = useWalletStore.getState();
    const inventory = useInventoryStore.getState();
    // 터짐 게이지: 뽑힌 차례대로 한 번에 한 칸씩 쌓고, 터짐이 나온 자리에서 그때의 게이지를 지급하고 비운다.
    // 결과(무엇이 뽑혔는지)는 위에서 이미 정해졌다. 여기서는 터짐의 금액만 정한다.
    let pot = walletBefore.burst?.[box.slug] ?? EMPTY_POT;
    const drawn = picked.map((r, i) => {
      // 앞의 free 개는 무료다. 값을 내지 않았으므로 게이지에 쌓지 않는다(터짐이 나오면 그때의 게이지는 받는다)
      if (i >= free) pot = potAfterOpen(pot, box.price, funding.ratio);
      if (r.item.id !== BURST.id) return { r, ratio: funding.ratio };
      const pay = burstPayout(pot, box.price, funding.ratio);
      pot = EMPTY_POT;
      return { r: { ...r, item: { ...r.item, value: pay.amount }, tier: tierOf(pay.amount, box.price) }, ratio: pay.ratio };
    });
    const owned = inventory.add(drawn.map(({ r, ratio }) => ({
      itemId: r.item.id, boxSlug: box.slug, valueUsdt: r.item.value, tier: r.tier.key,
      fair: { serverSeed, serverSeedHash, clientSeed, nonce: r.nonce, roll: r.roll, oddsVersion: CATALOG_ODDS_VERSION, dropTable: table.map(({ id, dropRate }) => ({ id, dropRate })) },
      fundingRatio: ratio,
      ...(openingId ? { openingId } : {}),
    })));
    if (owned.length !== picked.length) throw new Error("Opening inventory allocation failed");
    const results = drawn.map(({ r }, i) => ({ ...r, ownedId: owned[i].id, settled: r.item.kind === "cash" }));
    const cash = results.filter((r) => r.settled).map((r) => r.ownedId);
    if (cash.length) {
      const settlement = inventory.sell(cash, 1);
      if (settlement.ids.length !== cash.length || settlement.totalUsdt <= 0) throw new Error("Opening cash settlement failed");
      wallet.creditSplit(settlement.toCrypto, settlement.toCard);
      wallet.addTransaction({ type: "sellback", amountUsdt: settlement.totalUsdt, ref: `${box.slug}:cashback x${cash.length}` });
    }
    wallet.setBurst(box.slug, pot);
    if (free > 0) wallet.spendFreeOpens(box.slug, free);
    wallet.addTransaction({ type: "open", amountUsdt: -cost, ref: `${box.slug}x${count}${free > 0 ? "+free" + free : ""}${openingId ? ":" + openingId : ""}`, rolloverUsdt: rolloverContribution(cost, floorRatio(box)) });
    return results;
  } catch (error) {
    // Never leave a customer charged, and never leave a cashback credited, when any step fails.
    useWalletStore.setState(walletBefore, true);
    useInventoryStore.setState(inventoryBefore, true);
    throw error;
  }
}
