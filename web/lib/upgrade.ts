/**
 * 업그레이드의 식과 상수, 목표 고르기, 검증 다시 계산(flow/MELT_SPEC.md U2, U3, U4).
 * 화면도 장부도 모르는 순수한 계산이다. 장부를 바꾸는 일은 lib/upgradeSettle 이 한다.
 *
 * 뜻: 보관 중인 상품 하나를 걸고 더 비싼 상품에 도전한다. 성공하면 건 상품이 사라지고 목표 상품이 보관함에 들어온다.
 * 실패하면 건 상품이 사라진다. 돈은 움직이지 않는다.
 *
 * 확률은 이 식 하나에서만 나온다: 성공 확률 = 0.9 × 건 상품의 상품가 ÷ 목표 상품의 상품가.
 *   배수(목표 ÷ 건 상품)는 1.2 이상 40 이하. 그래서 확률은 2.25% 에서 75% 사이다.
 *   확률은 0.01% 단위로 내림한 정수(chanceUnits)로 다룬다. 화면에 적는 수도, 판정하는 수도 이 정수 하나다.
 *   계산은 센트 단위의 정수로만 한다(부동소수 때문에 45% 가 44.99% 로 내려가는 일이 없게).
 *
 * 추첨은 박스 개봉과 같은 계산이다(lib/fairness 의 calculateRollResult: 잠근 값, 내 기기 값, 회차로 0 이상 1,000,000 미만의 번호 하나).
 *   번호 ÷ 1,000,000 이 0 이상 1 미만의 수이고, 그 수가 확률보다 작으면 성공이다. 정수로는 번호 < chanceUnits × 100.
 *   회차는 박스 개봉과 같은 계수기(stores/fairStore 의 takeNonce)에서 받는다. 그래서 개봉과 겹치지 않는다.
 *
 * 목표 고르기: 배수 단추마다 카탈로그의 실제 상품 하나가 정해진다. 단추의 배수는 어림이고, 실제 배수와 확률은 목표의 실제 상품가로 계산한다.
 *   단추의 범위는 배수 ÷ 1.15 에서 배수 × 1.15 까지다(다섯 단추의 범위는 서로 겹치지 않는다. 한 상품이 두 단추의 목표가 되지 않는다).
 *   범위 안에서: 사진이 있는 상품 먼저, 그다음 상품가가 건 상품 × 배수에 가까운 것, 같으면 건 상품과 같은 카테고리, 그래도 같으면 상품 번호 순.
 *   무작위가 없다. 같은 건 상품과 같은 단추는 언제나 같은 목표를 낸다.
 */
import { calculateRollResult, hashServerSeed, ROLL_RANGE } from "./fairness";
import { HOME_BOXES, isOwnItem, type ProductBox, type ProductItem } from "./products";

/** 성공 확률 = UPGRADE_EDGE × 건 상품가 ÷ 목표 상품가 */
export const UPGRADE_EDGE = 0.9;
/** 배수(목표 ÷ 건 상품)의 범위 */
export const UPGRADE_MIN_TIMES = 1.2;
export const UPGRADE_MAX_TIMES = 40;
/** 배수 단추 */
export const UPGRADE_CHIPS = [1.5, 2, 3, 5, 10] as const;
/** 단추의 배수는 어림이다. 실제 배수가 단추 ÷ 이 값에서 단추 × 이 값 사이인 상품만 그 단추의 목표가 된다 */
export const CHIP_TOLERANCE = 1.15;
/** 확률의 단위: 10,000 이 100% 다(1 이 0.01%) */
export const CHANCE_UNITS = 10_000;
/** 연출의 길이(ms). 결과와 상관없이 같다 */
export const UPGRADE_DRAW_MS = 2400;

const cents = (usdt: number): number => Math.round(usdt * 100);
const EDGE_UNITS = Math.round(UPGRADE_EDGE * CHANCE_UNITS);
const MIN_X10 = Math.round(UPGRADE_MIN_TIMES * 10);

/** 배수가 범위 안인가(센트 단위 정수로 견준다) */
export function timesInRange(stakeUsdt: number, targetUsdt: number): boolean {
  if (!Number.isFinite(stakeUsdt) || !Number.isFinite(targetUsdt)) return false;
  const s = cents(stakeUsdt); const t = cents(targetUsdt);
  return s > 0 && t > 0 && t * 10 >= s * MIN_X10 && t <= s * UPGRADE_MAX_TIMES;
}

/** 성공 확률(0.01% 단위의 정수, 내림). 배수가 범위 밖이면 null */
export function chanceUnitsOf(stakeUsdt: number, targetUsdt: number): number | null {
  if (!timesInRange(stakeUsdt, targetUsdt)) return null;
  return Number((BigInt(EDGE_UNITS) * BigInt(cents(stakeUsdt))) / BigInt(cents(targetUsdt)));
}

/** 실제 배수. 소수 둘째 자리에서 내림한다(올려 적지 않는다) */
export const timesOfUpgrade = (stakeUsdt: number, targetUsdt: number): number => Number((BigInt(cents(targetUsdt)) * BigInt(100)) / BigInt(Math.max(1, cents(stakeUsdt)))) / 100;

/** 확률을 퍼센트 글자로: 4433 → "44.33" */
export const chanceText = (units: number): string => (units / 100).toFixed(2);
/** 번호를 같은 눈금(퍼센트)의 글자로: 443299 → "44.3299". 확률보다 두 자리 더 적어서, 경계에 붙은 번호도 어느 쪽인지 보인다 */
export const rollText = (roll: number): string => ((roll * 100) / ROLL_RANGE).toFixed(4);
/** 막대에서 번호가 놓이는 자리(0 이상 100 미만) */
export const rollPercent = (roll: number): number => (roll * 100) / ROLL_RANGE;

/** 판정: 번호 ÷ 1,000,000 이 확률보다 작으면 성공 */
export const upgradeWon = (roll: number, chanceUnits: number): boolean => roll < chanceUnits * (ROLL_RANGE / CHANCE_UNITS);

// ── 목표 고르기 ────────────────────────────────────────────────────────────────

/** 목표가 될 수 있는 상품 하나와, 그 상품이 보관함에 들어갈 때 적을 박스 */
export interface UpgradeTarget { item: ProductItem; box: ProductBox }

let pool: UpgradeTarget[] | null = null;
/**
 * 목표 후보: 홈에 나오는 박스의 실물 상품 전부, 상품 번호마다 하나. 상품가가 낮은 것부터.
 * 같은 상품이 여러 박스에 있으면 제 박스(상품 번호가 박스 slug 로 시작하는 박스)의 것을 쓰고, 없으면 먼저 나온 박스의 것을 쓴다.
 */
export function upgradePool(): UpgradeTarget[] {
  if (pool) return pool;
  const byId = new Map<string, UpgradeTarget>();
  for (const box of HOME_BOXES) for (const item of box.items) {
    if (item.kind !== "physical") continue;
    const seen = byId.get(item.id);
    if (!seen || (!isOwnItem(seen.box, seen.item) && isOwnItem(box, item))) byId.set(item.id, { item, box });
  }
  pool = Array.from(byId.values()).sort((a, b) => a.item.value - b.item.value || (a.item.id < b.item.id ? -1 : 1));
  return pool;
}

/** 목표를 고를 때 건 상품에서 읽는 것 */
export interface StakeRef { itemId: string; valueUsdt: number; category?: string }

/** 단추 하나의 목표. 맞는 상품이 없으면 null */
export function pickTarget(stake: StakeRef, chip: number, candidates: readonly UpgradeTarget[] = upgradePool()): UpgradeTarget | null {
  if (!(stake.valueUsdt > 0) || !(chip > 0)) return null;
  const want = stake.valueUsdt * chip;
  const low = stake.valueUsdt * Math.max(chip / CHIP_TOLERANCE, UPGRADE_MIN_TIMES);
  const high = stake.valueUsdt * Math.min(chip * CHIP_TOLERANCE, UPGRADE_MAX_TIMES);
  let best: UpgradeTarget | null = null;
  for (const c of candidates) {
    const value = c.item.value;
    // 범위의 끝은 든다(곱셈의 부동소수 오차로 끝에 놓인 상품이 빠지지 않게 아주 작은 여유를 둔다)
    if (value < low - 1e-6 || value > high + 1e-6 || c.item.id === stake.itemId || !timesInRange(stake.valueUsdt, value)) continue;
    if (!best || better(c, best, want, stake.category)) best = c;
  }
  return best;
}

function better(a: UpgradeTarget, b: UpgradeTarget, want: number, category?: string): boolean {
  const photo = Number(!!b.item.image.src) - Number(!!a.item.image.src);
  if (photo !== 0) return photo < 0;
  const near = Math.abs(a.item.value - want) - Math.abs(b.item.value - want);
  if (Math.abs(near) > 1e-9) return near < 0;
  const same = Number(b.box.category === category) - Number(a.box.category === category);
  if (same !== 0) return same < 0;
  return a.item.id < b.item.id;
}

/** 단추 하나가 화면에 내는 것. target 이 null 이면 누를 수 없는 단추다 */
export interface UpgradeOption { chip: number; target: UpgradeTarget | null; times: number; chanceUnits: number }

/** 다섯 단추의 목표와, 목표의 실제 상품가로 계산한 배수와 확률 */
export function upgradeOptions(stake: StakeRef, candidates: readonly UpgradeTarget[] = upgradePool()): UpgradeOption[] {
  return UPGRADE_CHIPS.map((chip) => {
    const target = pickTarget(stake, chip, candidates);
    const chanceUnits = target ? chanceUnitsOf(stake.valueUsdt, target.item.value) : null;
    if (!target || chanceUnits === null) return { chip, target: null, times: 0, chanceUnits: 0 };
    return { chip, target, times: timesOfUpgrade(stake.valueUsdt, target.item.value), chanceUnits };
  });
}

/** 상품 번호로 목표 후보를 찾는다(받는 쪽이 화면이 고른 목표를 카탈로그에서 다시 읽는다) */
export function targetById(itemId: string, candidates: readonly UpgradeTarget[] = upgradePool()): UpgradeTarget | null {
  return candidates.find((c) => c.item.id === itemId) ?? null;
}

// ── 기록과 검증 ────────────────────────────────────────────────────────────────

/** 건 상품과 목표: 보관 상품 id, 상품 번호, 박스, 그때의 상품가 */
export interface UpgradeSide { ownedId: string; itemId: string; boxSlug: string; valueUsdt: number }

/**
 * 업그레이드 한 번의 기록. 건 상품의 보관함 기록에 붙는다(stores/inventoryStore 의 OwnedItem.upgrade).
 * target.ownedId 는 성공했을 때 보관함에 들어온 목표 상품의 id 다(실패한 기록에서는 보관함에 없는 id 다).
 */
export interface UpgradeRecord {
  /** 추첨 하나의 번호. 같은 추첨이 두 번 적용되지 않게 하는 열쇠다 */
  id: string;
  at: string;
  serverSeedHash: string;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  /** 나온 번호(0 이상 1,000,000 미만) */
  roll: number;
  /** 성공 확률(0.01% 단위). 화면에 보인 수이자 판정에 쓴 수 */
  chanceUnits: number;
  won: boolean;
  stake: UpgradeSide;
  target: UpgradeSide;
}

export interface UpgradeVerification {
  hash: string;
  /** 공개된 값의 해시가 걸기 전에 잠근 값과 같은가 */
  hashMatch: boolean;
  /** 다시 계산한 번호 */
  roll: number;
  rollMatch: boolean;
  /** 두 상품가로 다시 계산한 확률. 배수가 범위 밖이면 null */
  chanceUnits: number | null;
  chanceMatch: boolean;
  /** 다시 계산한 번호와 다시 계산한 확률로 본 결과 */
  won: boolean | null;
  outcomeMatch: boolean;
  /** 넷이 전부 맞는가 */
  ok: boolean;
}

/** 기록의 값만으로 해시, 번호, 확률, 결과를 다시 계산해 기록과 견준다 */
export async function verifyUpgradeRecord(record: UpgradeRecord): Promise<UpgradeVerification> {
  const hash = await hashServerSeed(record.serverSeed);
  const calculated = await calculateRollResult(record.serverSeed, record.clientSeed, record.nonce);
  const chanceUnits = chanceUnitsOf(record.stake.valueUsdt, record.target.valueUsdt);
  const won = chanceUnits === null ? null : upgradeWon(calculated.roll, chanceUnits);
  const hashMatch = hash === record.serverSeedHash.trim().toLowerCase();
  const rollMatch = calculated.roll === record.roll;
  const chanceMatch = chanceUnits !== null && chanceUnits === record.chanceUnits;
  const outcomeMatch = won !== null && won === record.won;
  return { hash, hashMatch, roll: calculated.roll, rollMatch, chanceUnits, chanceMatch, won, outcomeMatch, ok: hashMatch && rollMatch && chanceMatch && outcomeMatch };
}
