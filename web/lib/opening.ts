import { CATALOG_ODDS_VERSION, dropTable, floorRatio, type ProductBox, type ProductItem } from "./products";
import { calculateRollResult, determineItem } from "./fairness";
import { tierOf, type Tier } from "./tiers";
import { rolloverContribution } from "./rollover";
import { useFairStore } from "../stores/fairStore";
import { useInventoryStore } from "../stores/inventoryStore";
import { useWalletStore } from "../stores/walletStore";
import { assertSameLedger, ledgerKey, withLedgerLock } from "./ledgerLock";

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
  const cost = +(box.price * count).toFixed(2);
  const ledger = ledgerKey();

  // Seed creation is asynchronous.  Do not keep a wallet snapshot across it:
  // a balance update in that gap used to let an opening continue with stale
  // state and surface as a generic opening failure.
  if (useWalletStore.getState().balance < cost) throw new InsufficientOpeningBalance();
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
  try {
    const funding = walletBefore.debitSplit(cost);
    if (!funding) throw new InsufficientOpeningBalance();
    const wallet = useWalletStore.getState();
    const inventory = useInventoryStore.getState();
    const owned = inventory.add(picked.map((r) => ({
      itemId: r.item.id, boxSlug: box.slug, valueUsdt: r.item.value, tier: r.tier.key,
      fair: { serverSeed, serverSeedHash, clientSeed, nonce: r.nonce, roll: r.roll, oddsVersion: CATALOG_ODDS_VERSION, dropTable: table.map(({ id, dropRate }) => ({ id, dropRate })) },
      fundingRatio: funding.ratio,
      ...(openingId ? { openingId } : {}),
    })));
    if (owned.length !== picked.length) throw new Error("Opening inventory allocation failed");
    const results = picked.map((r, i) => ({ ...r, ownedId: owned[i].id, settled: r.item.kind === "cash" }));
    const cash = results.filter((r) => r.settled).map((r) => r.ownedId);
    if (cash.length) {
      const settlement = inventory.sell(cash, 1);
      if (settlement.ids.length !== cash.length || settlement.totalUsdt <= 0) throw new Error("Opening cash settlement failed");
      wallet.creditSplit(settlement.toCrypto, settlement.toCard);
      wallet.addTransaction({ type: "sellback", amountUsdt: settlement.totalUsdt, ref: `${box.slug}:cashback x${cash.length}` });
    }
    wallet.addTransaction({ type: "open", amountUsdt: -cost, ref: `${box.slug}x${count}${openingId ? ":" + openingId : ""}`, rolloverUsdt: rolloverContribution(cost, floorRatio(box)) });
    return results;
  } catch (error) {
    // Never leave a customer charged, and never leave a cashback credited, when any step fails.
    useWalletStore.setState(walletBefore, true);
    useInventoryStore.setState(inventoryBefore, true);
    throw error;
  }
}
