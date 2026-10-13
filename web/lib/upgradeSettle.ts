/**
 * 업그레이드를 실행하는 일(flow/MELT_SPEC.md U1, U4, U7, U8). 식과 목표 고르기는 lib/upgrade, 확인 대기 표시는 lib/upgradeMarks.
 * 받기(lib/takeBatch)와 같은 방식으로 앞뒤를 지킨다: 같은 잠금과 같은 차례(inTurn), 저장된 장부를 직접 읽는 같은 읽기(readSaved),
 * 걸 수 있는 상품을 고르는 같은 기준(heldForTake). 돈은 움직이지 않는다. 지갑을 쓰지 않는다.
 *
 * 장부에 남는 것(보관함 저장 키 하나에 쓰는 한 번의 쓰기다. 건 상품과 목표 상품이 따로 저장되는 일이 없다):
 *   건 상품    상태가 UPGRADED 로 바뀌고 그 추첨의 기록(upgrade)이 붙는다. 성공이든 실패든 같다
 *   목표 상품  성공했을 때만 보관 중으로 들어온다. id 는 추첨 번호에서 정해진다("own_" + 추첨 번호). 같은 추첨이 두 개를 넣을 수 없다
 *              자금 출처는 건 상품의 것을 그대로 잇는다(카드로 충전한 몫에서 나온 상품이 출금할 수 있는 잔액으로 바뀌지 않게)
 *
 * 순서:
 *   1. 저장된 장부와 표시를 직접 읽는다. 읽지 못하면 아무것도 하지 않고 알 수 없다고 답한다.
 *   2. 남아 있던 표시를 다시 본다(아래). 그다음 건 상품이 저장된 장부에서 걸 수 있는 상태인지 본다(받기와 같은 기준. 확인 필요는 걸 수 없다).
 *      화면이 보여 준 확률과 여기서 다시 계산한 확률이 다르면 실행하지 않는다(보여 준 수와 판정하는 수가 같아야 한다).
 *   3. 회차를 받아 번호를 계산한다. 박스 개봉과 같은 계수기, 같은 예약이다(stores/fairStore 의 reserveNonces):
 *      받은 회차가 저장된 것까지 확인됐을 때만 쓴다. 확인되지 않으면 걸지 않는다.
 *   4. 마지막 기다림이 끝난 자리에서 계정을 다시 본다(아래). 그다음 표시를 적고, 적혔는지 다시 읽어 확인한다. 적지 못하면 걸지 않는다.
 *   5. 장부를 바꾼다. 도중에 던져도 여기서 판정하지 않는다.
 *   6. 저장된 장부를 다시 직접 읽어 판정한다.
 *        적용됐다      건 상품이 UPGRADED 이고 이 추첨의 기록이 붙어 있다. 성공이면 목표 상품도 있다. 결과는 저장된 기록에서 읽는다
 *        적용 안 됐다  건 상품에 이 추첨의 기록이 없고 목표 상품도 없다. 기억 속 장부를 걸기 전으로 되돌린다. 다시 걸 수 있다
 *        알 수 없다    그 밖 전부(다시 읽지 못했다 등). 성공이라고도 실패라고도 하지 않는다. 표시가 남아 두 상품은 확인 필요가 된다
 *   7. 끝이 확인된 표시만 지운다. 지우지 못하면 화면이 확인 필요로 보여 줄 것이므로 답도 알 수 없다로 맞춘다.
 *
 * 남은 표시 다시 보기(걸 때, 화면이 뜰 때, 창으로 돌아올 때. 다시 추첨하지 않는다): 위 6의 판정을 저장된 장부에 그대로 한다.
 * 저장 키가 하나라서, 저장된 장부를 읽을 수만 있으면 적용됐는지 아닌지가 언제나 갈린다.
 *
 * 같은 추첨이 두 번 적용되지 않는 까닭: 같은 건 상품에 대한 요청은 한 번만 나간다(inflight). 이 탭 안에서는 받기와 한 줄로 차례를 서고,
 * 탭 사이는 장부 잠금이 막는다. 잠금 안에서 저장된 장부를 읽으므로 다른 탭이 이미 건 상품은 걸 수 없는 상태로 보인다.
 * 표시와 다시 읽기는 실패를 정직하게 말하는 장치이지 탭 사이의 잠금을 대신하지 못한다(두 탭이 같은 장부를 읽고 따로 쓰면 둘 다 성공으로 보일 수 있다).
 * 그래서 탭 사이의 잠금(Web Locks)을 쓸 수 없는 브라우저에서는 걸지 않는다(nolock. flow/REVIEW_codex-4.md 2.5).
 *
 * 계정 전환: 일을 시작할 때의 계정(장부 저장 키)과 보관함 저장 키를 잡아 두고 끝까지 그것만 쓴다.
 *   기다리는 자리(저장된 장부 읽기, 회차 예약, 번호 계산)를 지날 때마다 다시 본다. 마지막 기다림 뒤부터 보관함을 쓸 때까지는 기다리는 자리가 없다.
 *   쓰기 전에 바뀌었으면 걸지 않는다. 쓴 뒤의 다시 읽기 사이에 바뀌었으면 알 수 없다고 답하고 더 쓰지 않는다
 *   (바뀐 계정의 장부를 건드리지 않는다. 표시는 처음 계정의 키에 남고, 그 계정으로 돌아오면 다시 본다).
 *
 * 개발 서버에서만(운영 빌드에서는 꺼진다) 세션 저장소의 "voila.opening.fault" 로 상태를 만든다:
 *   upgrade-failed(실행하지 못했다고 답한다), upgrade-unknown(알 수 없다고 답하고 표시를 남긴다. 장부는 바뀌지 않는다).
 */
import { calculateRollResult } from "./fairness";
import { ledgerKey, ledgerLockAvailable, withLedgerLock } from "./ledgerLock";
import { currentTakeLedger, devOpeningFault, heldForTake, inTurn, readSaved, savedTakeLedger, syncStores, type SavedLedger, type TakeLedger } from "./takeBatch";
import { tierOf } from "./tiers";
import { chanceUnitsOf, targetById, upgradeWon, type UpgradeRecord } from "./upgrade";
import { readUpgradeMarks, upgradeHoldIds, writeUpgradeMarks, type UpgradeMark } from "./upgradeMarks";
import { reserveNonces } from "../stores/fairStore";
import { useInventoryStore, type OwnedItem } from "../stores/inventoryStore";

/** 걸 수 있는 상품인가. USDT 로 받을 수 있는 상품과 같은 기준이다(보관 중이고 확인 필요가 아니다) */
export const canStake = (item: OwnedItem, ledger: TakeLedger = currentTakeLedger()): boolean => heldForTake([item], ledger).length === 1;

/**
 * 업그레이드의 확인 대기 표시가 남은 보관 상품 id. 화면이 "확인 필요"의 까닭을 가려 말하는 데만 쓴다
 * (받기의 표시가 남은 상품은 지갑 내역을, 업그레이드의 표시가 남은 상품은 다시 확인을 안내한다). 읽지 못하면 빈 것으로 본다.
 */
export function upgradeDoubtIds(): Set<string> {
  try { return new Set(upgradeHoldIds(readUpgradeMarks())); } catch { return new Set(); }
}

export interface UpgradeRequest {
  stakeOwnedId: string;
  targetItemId: string;
  /** 화면에 보인 성공 확률(0.01% 단위) */
  chanceUnits: number;
}

/**
 * won, lost  적용됐다. record 는 저장된 장부에서 읽은 기록이다
 * failed     실행하지 못했다. 장부는 그대로이고 건 상품은 보관 중이다(다시 걸 수 있다)
 * blocked    걸 수 없는 상품이다(이미 걸었거나, 받았거나, 확인 필요이거나, 화면이 본 조건과 다르다). 아무것도 바꾸지 않았다
 * unknown    확인하지 못했다. 성공이라고도 실패라고도 하지 않는다
 * nolock     이 브라우저에는 탭 사이의 잠금이 없어 걸지 않았다. 아무것도 바꾸지 않았다
 */
export type UpgradeOutcome = { status: "won" | "lost"; record: UpgradeRecord } | { status: "failed" } | { status: "blocked" } | { status: "unknown" } | { status: "nolock" };

let seq = 0;
const drawId = (): string => `up_${globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}_${++seq}`}`;

/** 표시 하나를 저장된 장부에 비추어 본다 */
function markState(saved: SavedLedger, mark: UpgradeMark): "applied" | "untouched" | "doubt" {
  const stake = saved.items.find((item) => item.id === mark.stake);
  const target = saved.items.find((item) => item.id === mark.target);
  if (!stake) return "doubt";
  if (stake.status === "UPGRADED" && stake.upgrade?.id === mark.id) {
    // 성공한 기록이면 목표 상품이 있어야 하고, 실패한 기록이면 없어야 한다
    return stake.upgrade.won === !!target && (!target || target.upgradedFrom?.id === mark.id) ? "applied" : "doubt";
  }
  return stake.upgrade?.id !== mark.id && !target ? "untouched" : "doubt";
}

/** 남아 있는 표시를 저장된 장부에 비추어 다시 본다. 끝이 확인된 것만 뺀다 */
function reviewMarks(saved: SavedLedger, marks: UpgradeMark[]): { marks: UpgradeMark[]; changed: boolean } {
  const next = marks.filter((mark) => mark.dev || markState(saved, mark) === "doubt");
  return { marks: next, changed: next.length !== marks.length };
}

/** 같은 계정의 같은 건 상품에 대한 요청은 한 번만 나간다 */
const inflight = new Map<string, Promise<UpgradeOutcome>>();
/** 저장된 장부를 읽지 못한 채 끝난 일이 있다. 읽을 수 있게 되면 다시 맞춘다 */
let resyncWanted = false;

export function settleUpgrade(request: UpgradeRequest): Promise<UpgradeOutcome> {
  const key = ledgerKey() + "|" + request.stakeOwnedId;
  const running = inflight.get(key);
  if (running) return running;
  const job = (async (): Promise<UpgradeOutcome> => {
    try {
      // 탭 사이의 잠금이 없으면 걸지 않는다. 추첨도 하지 않는다
      if (!ledgerLockAvailable()) return { status: "nolock" };
      const fault = devOpeningFault();
      if (fault === "upgrade-failed") return { status: "failed" };
      return await inTurn(() => withLedgerLock(() => execute(request, fault)));
    } catch {
      // 잠금을 얻지 못했거나 저장소에 쓸 수 없다. 걸기 전이라 장부는 그대로다
      return { status: "failed" };
    }
  })().finally(() => {
    inflight.delete(key);
    if (resyncWanted && typeof window !== "undefined") window.setTimeout(() => { void reviewUpgradeMarks(); }, 2000);
  });
  inflight.set(key, job);
  return job;
}

const inventoryKey = (): string | null => useInventoryStore.persist?.getOptions?.().name ?? null;

async function execute(request: UpgradeRequest, fault: string | null): Promise<UpgradeOutcome> {
  // 처음 잡은 계정(장부 저장 키)과 보관함 저장 키. 표시도 보관함도 끝까지 이 계정의 것만 쓴다
  const ledger = ledgerKey();
  const inventoryName = inventoryKey();
  const sameAccount = (): boolean => ledgerKey() === ledger && inventoryKey() === inventoryName;

  // 1. 저장된 장부와 표시를 직접 읽는다. 2. 남아 있던 표시를 다시 보고, 끝이 확인된 것은 지운다
  let before: SavedLedger; let marks: UpgradeMark[]; let judge: TakeLedger;
  try {
    before = await readSaved();
    // 읽는 사이에 계정이 바뀌었다. 아무것도 하지 않았다
    if (!sameAccount()) return { status: "failed" };
    const reviewed = reviewMarks(before, readUpgradeMarks(ledger));
    if (reviewed.changed) writeUpgradeMarks(reviewed.marks, ledger);
    // 지우지 못한 표시는 그대로 남아 있다. 저장된 표시를 다시 읽어 그대로 판정에 쓴다
    marks = readUpgradeMarks(ledger);
    judge = savedTakeLedger(before);
  } catch { resyncWanted = true; return { status: "unknown" }; }

  const stake = before.items.find((item) => item.id === request.stakeOwnedId);
  const target = targetById(request.targetItemId);
  const chanceUnits = stake && target ? chanceUnitsOf(stake.valueUsdt, target.item.value) : null;
  if (!stake || !target || chanceUnits === null || chanceUnits !== request.chanceUnits || !canStake(stake, judge)) {
    await syncStores(); resyncWanted = false;
    return { status: "blocked" };
  }
  const held = (): boolean => useInventoryStore.getState().items.find((item) => item.id === stake.id)?.status === "IN_STORAGE";
  // 잠금이 기억 속 장부를 저장된 장부에 맞춰 두었다. 그래도 어긋나 있으면(다시 읽기가 실패했다) 그 위에 쓰지 않는다
  if (!held()) { resyncWanted = true; return { status: "unknown" }; }

  // 3. 추첨. 박스 개봉과 같은 계산, 같은 회차 예약이다. 여기까지는 장부를 건드리지 않았다
  let record: UpgradeRecord;
  try {
    const reserved = await reserveNonces(1);
    // 받은 회차가 저장됐는지 확인하지 못했다. 그 회차로는 추첨하지 않는다
    if (!reserved) return { status: "failed" };
    const { serverSeed, serverSeedHash, clientSeed } = reserved; const nonce = reserved.nonces[0];
    const { roll } = await calculateRollResult(serverSeed, clientSeed, nonce);
    const id = drawId();
    record = {
      id, at: new Date().toISOString(), serverSeedHash, serverSeed, clientSeed, nonce, roll, chanceUnits, won: upgradeWon(roll, chanceUnits),
      stake: { ownedId: stake.id, itemId: stake.itemId, boxSlug: stake.boxSlug, valueUsdt: stake.valueUsdt },
      target: { ownedId: "own_" + id, itemId: target.item.id, boxSlug: target.box.slug, valueUsdt: target.item.value },
    };
  } catch { return { status: "failed" }; }

  // 마지막 기다림이 끝났다. 여기부터 보관함을 쓸 때까지는 기다리는 자리가 없다(그 사이에 계정이 바뀔 수 없다).
  // 기다리는 동안 계정이 바뀌었으면 걸지 않는다. 다른 계정의 보관함에 이 추첨을 적지 않는다
  if (!sameAccount()) return { status: "failed" };
  // 기다리는 동안 이 탭의 다른 일이 그 상품을 바꿨으면 걸지 않는다
  if (!held()) return { status: "blocked" };

  const mark: UpgradeMark = { id: record.id, stake: stake.id, target: record.target.ownedId };
  if (fault === "upgrade-unknown") {
    // 시험용: 장부는 바꾸지 않고 풀리지 않는 표시만 남긴다(확인 필요 상태를 화면에서 계속 볼 수 있다)
    writeUpgradeMarks([...marks, { ...mark, dev: true }], ledger); await syncStores();
    return { status: "unknown" };
  }
  // 4. 표시를 먼저 적는다. 적지 못하면 걸지 않는다(장부는 그대로다)
  if (!writeUpgradeMarks([...marks, mark], ledger)) return { status: "failed" };

  // 5. 장부를 한 번에 바꾼다. 여기부터 돌려주기 전까지는 결과를 여기서 단정하지 않는다
  const inventoryBefore = useInventoryStore.getState();
  const entered: OwnedItem = {
    id: record.target.ownedId, itemId: record.target.itemId, boxSlug: record.target.boxSlug, valueUsdt: record.target.valueUsdt,
    tier: tierOf(record.target.valueUsdt, target.box.price).key, status: "IN_STORAGE", acquiredAt: record.at,
    fair: { serverSeedHash: record.serverSeedHash, serverSeed: record.serverSeed, clientSeed: record.clientSeed, nonce: record.nonce, roll: record.roll },
    fundingSource: stake.fundingSource, fundingRatio: stake.fundingRatio,
    upgradedFrom: { id: record.id, stakeOwnedId: stake.id },
  };
  try {
    useInventoryStore.setState((s) => ({
      items: [...(record.won ? [entered] : []), ...s.items.map((item) => (item.id === stake.id && item.status === "IN_STORAGE" ? { ...item, status: "UPGRADED" as const, upgrade: record } : item))],
    }));
  } catch { /* 아래에서 저장된 장부를 다시 읽어 판정한다 */ }

  // 6. 저장된 장부를 다시 직접 읽어 판정한다. 읽지 못하면 알 수 없다(표시는 남는다)
  let after: SavedLedger | null;
  try { after = await readSaved(); } catch { after = null; }
  // 다시 읽는 사이에 계정이 바뀌었다. 더 쓰지 않는다(바뀐 계정의 보관함을 걸기 전 모습으로 덮어쓰면 안 된다). 표시는 처음 계정의 키에 남아 있다
  if (!sameAccount()) { resyncWanted = true; return { status: "unknown" }; }
  if (!after) { resyncWanted = true; return { status: "unknown" }; }
  const state = markState(after, mark);
  if (state === "doubt") { resyncWanted = true; return { status: "unknown" }; }
  if (state === "untouched") {
    // 저장되지 않았다. 기억 속 장부를 걸기 전으로 되돌린다(뒤의 다른 쓰기가 이 추첨을 뒤늦게 저장하는 일이 없게)
    try { useInventoryStore.setState(inventoryBefore, true); } catch { /* 아래에서 저장된 장부에 맞춘다 */ }
  }
  // 7. 끝이 확인됐다. 표시를 지운다. 지우지 못하면 화면이 확인 필요로 보여 줄 것이므로 답도 그렇게 맞춘다
  const cleared = writeUpgradeMarks(marks, ledger);
  await syncStores(); resyncWanted = false;
  if (!cleared) return { status: "unknown" };
  if (state === "untouched") return { status: "failed" };
  const saved = after.items.find((item) => item.id === stake.id)?.upgrade;
  return saved ? { status: saved.won ? "won" : "lost", record: saved } : { status: "unknown" };
}

/**
 * 남아 있는 확인 대기 표시를 다시 보고, 기억 속 장부를 저장된 장부에 맞춘다. 다시 추첨하지 않는다.
 * 표시가 없고 맞출 것도 없으면 아무 일도 하지 않는다. 화면이 뜰 때와 창으로 돌아올 때 부른다(components/flow/TakeSheet 의 useTakeLedger).
 */
let reviewing: Promise<void> | null = null;
export function reviewUpgradeMarks(): Promise<void> {
  if (reviewing) return reviewing;
  let pending = resyncWanted;
  if (!pending) { try { pending = readUpgradeMarks().some((mark) => !mark.dev); } catch { pending = true; } }
  if (!pending) return Promise.resolve();
  reviewing = inTurn(() => withLedgerLock(async (): Promise<void> => {
    const ledger = ledgerKey();
    let saved: SavedLedger; let found: UpgradeMark[];
    try { saved = await readSaved(); found = readUpgradeMarks(ledger); } catch { return; }
    // 읽는 사이에 계정이 바뀌었으면 그 장부로 다른 계정의 표시를 판정하지 않는다
    if (ledgerKey() !== ledger) return;
    const reviewed = reviewMarks(saved, found);
    if (reviewed.changed) writeUpgradeMarks(reviewed.marks, ledger);
    await syncStores(); resyncWanted = false;
  })).catch(() => undefined).finally(() => { reviewing = null; });
  return reviewing;
}
