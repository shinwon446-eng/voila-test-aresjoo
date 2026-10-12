import { calculateRollResult, hashServerSeed, rollRanges } from "@/lib/fairness";
import type { OwnedItem } from "@/stores/inventoryStore";

export interface RecordVerification {
  hash: string;
  hashMatch: boolean;
  roll: number;
  rollMatch: boolean;
  itemMatch: boolean | null;
  expectedItemId: string | null;
  range: { from: number; to: number; dropRate: number } | null;
}

/** 검증을 부르는 쪽이 넘기는 것. ownedId 는 보관 상품의 ID 다. 있으면 그것으로 기록을 고른다(flow/MELT_SPEC.md R14). */
export type VerifyInput = Pick<OwnedItem, "fair" | "itemId"> & { ownedId?: string };

/**
 * 검증할 보관함 기록을 고른다. 없으면 null.
 *  1. 보관 상품의 ID 를 받았으면 그 ID 의 기록만 본다. 시드와 회차가 같은 다른 상품이 있어도 그쪽을 집지 않는다.
 *  2. ID 를 받지 못했으면(결과 화면이 방금 만든 값을 그대로 넘긴 경우) 잠근 값, 공개된 값, 내 기기 값, 회차가 모두 같은 기록을 찾는다.
 *     그런 기록이 하나뿐일 때만 그 기록이다. 둘 이상이면 받은 상품까지 같은 것이 하나일 때만 고르고, 그래도 가릴 수 없으면 고르지 않는다
 *     (첫 번째 것을 집으면 다른 상품의 확률표로 검증하게 된다).
 */
export function storedRecordFor(record: VerifyInput, owned: readonly OwnedItem[]): OwnedItem | null {
  if (record.ownedId) return owned.find((o) => o.id === record.ownedId) ?? null;
  const f = record.fair;
  const same = owned.filter((o) => o.fair.nonce === f.nonce && o.fair.clientSeed === f.clientSeed && o.fair.serverSeedHash === f.serverSeedHash && o.fair.serverSeed === f.serverSeed);
  if (same.length <= 1) return same[0] ?? null;
  const sameItem = same.filter((o) => o.itemId === record.itemId);
  return sameItem.length === 1 ? sameItem[0] : null;
}

/**
 * 검증에 쓸 기록을 정한다(flow/MELT_SPEC.md S9: 그 기록의 당시 확률표를 쓴다).
 * 보관함에 그 기록이 있으면 넘겨받은 것 대신 그 기록을 쓴다. 복구한 결과 화면처럼 부르는 쪽이 지금의 확률표를 실어 보내도
 * 저장된 당시 표가 이긴다. 저장된 기록에 표가 없으면 지금 표로 메우지 않는다(그때는 번호까지만 확인했다고 말한다).
 * 보관함에서 고르지 못한 기록(보관함에 없거나, ID 없이 같은 값의 기록이 여럿이라 가릴 수 없는 경우)은 넘겨받은 대로 쓴다.
 */
export function recordToVerify(record: VerifyInput, owned: readonly OwnedItem[]): VerifyInput & { boxSlug: string | null; stored: boolean } {
  const saved = storedRecordFor(record, owned);
  return saved ? { itemId: saved.itemId, fair: saved.fair, boxSlug: saved.boxSlug, stored: true } : { itemId: record.itemId, fair: record.fair, boxSlug: null, stored: false };
}

/** Historical results must use the exact ordered table saved at purchase time. */
export async function verifyOpeningRecord(record: Pick<OwnedItem, "fair" | "itemId">): Promise<RecordVerification> {
  const { fair } = record;
  const hash = await hashServerSeed(fair.serverSeed);
  const calculated = await calculateRollResult(fair.serverSeed, fair.clientSeed, fair.nonce);
  const range = fair.dropTable?.length ? rollRanges(fair.dropTable).find((entry) => calculated.roll >= entry.from && calculated.roll <= entry.to) : undefined;
  return {
    hash,
    hashMatch: hash === fair.serverSeedHash.trim().toLowerCase(),
    roll: calculated.roll,
    rollMatch: calculated.roll === fair.roll,
    itemMatch: range ? range.item.id === record.itemId : null,
    expectedItemId: range?.item.id ?? null,
    range: range ? { from: range.from, to: range.to, dropRate: range.item.dropRate } : null,
  };
}
