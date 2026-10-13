/**
 * 보관함과 지갑을 브라우저 저장소에 적을 때만 줄여서 적는다. 기억 속 모양(OwnedItem, Transaction)과 그것을 읽는 화면은 그대로다.
 *
 * 왜: 장부 전체가 localStorage 에 있고, 한도는 출처 하나에 약 5MB 이며 같은 출처의 다른 사이트와 나눠 쓴다(lib/labSite).
 * 한도의 단위는 브라우저마다 다르다. 크롬은 키와 값의 글자 수(UTF-16 단위)로 5,242,880자까지 받는 것을 실제로 채워서 확인했다
 * (scripts/capture/flow-storage.mjs). 다른 브라우저는 재지 않았다. 이 파일의 숫자는 전부 글자 수다.
 * 2026-10-12 실측으로 개봉 한 건이 보관함에 6,144자(박스에 따라 5,700~8,600자), 지갑에 120~422자를 썼다. 그 가운데 5,378자가
 * 그 박스의 확률표(fair.dropTable, 100줄)였고, 기록마다 통째로 들어 있었다. 그래서 600~900번 열면 한도가 찼다.
 *
 * 줄이는 방법(저장소에만 해당한다):
 *   1. 확률표는 내용이 같은 것끼리 한 번만 적고, 기록은 그 번호만 가리킨다.
 *   2. 한 번의 개봉이 함께 쓰는 값(박스, 그때의 가격, 시드 셋, 확률표, 자금 출처)은 묶음 하나로 적는다.
 *   3. 기록은 칸 이름 없이 순서로 적는다. 되풀이되는 글자는 글자 표의 번호로, 시각은 앞 기록과의 차이로,
 *      UUID 로 끝나는 번호는 22자로, 같은 개봉의 거래 번호는 앞 기록과 같다는 표시로 적는다.
 *
 * 고른 절충: 확률표를 저장소에서 빼고 카탈로그에서 다시 만드는 길은 쓰지 않았다. 카탈로그가 바뀌면(상품이 늘거나 확률이 바뀌면)
 * 옛 표를 되살릴 길이 없고, 확률표의 판 이름(oddsVersion)은 표가 바뀔 때마다 오른다는 보장이 없다. 검증 화면은 그 기록의 당시 표로
 * 다시 계산해야 하므로(components/fairness/verifyRecord, flow/MELT_SPEC.md S9) 표는 저장소에 남긴다. 대가는 표 한 벌마다 약 5천 자의
 * 고정 비용이다(박스 하나에, 그 박스의 표가 바뀔 때마다 한 벌). 개봉 수와는 무관하다.
 *
 * 잃지 않는다: 모르는 칸과 뜻밖의 값은 줄이지 않고 그대로 따로 적는다(행의 마지막 칸). 다른 작업이 기록에 칸이나 상태를 더해도
 * 그대로 남는다(업그레이드의 상태와 기록, 차감하지 않은 출금 줄의 requestedUsdt 등). 그래서 풀어 읽은 값은 JSON 으로 적었다 읽은
 * 원래 값과 같다(tests/compactStorage.test.ts).
 * 옛 형식(목록이 그냥 배열)은 그대로 읽고, 다음 쓰기부터 줄인 형식으로 적는다. 빈 목록은 옛 형식 그대로 적는다(더 짧다).
 *
 * 저장된 장부를 스토어 없이 직접 읽는 곳(lib/browserWallet, lib/browserAccount, 화면 검수 스크립트)은 readLedger 를 거친다.
 * lib/takeBatch 의 readSaved 는 스토어의 저장소(아래 compactLedgerStorage)로 읽으므로 풀린 모양을 그대로 받는다.
 *
 * 배포할 때: 이 파일이 없는 옛 빌드는 줄인 장부를 읽지 못한다. 배포를 되돌리더라도 이 파일(읽는 쪽)은 남겨야 한다.
 * 옛 빌드가 떠 있는 탭은 새로 고쳐야 한다(그 탭의 개봉과 받기는 실패하고, 저장된 장부는 지워지지 않는다).
 */
import type { PersistStorage, StorageValue } from "zustand/middleware";

export type LedgerKind = "inventory" | "wallet";
/** 장부마다 줄여 적는 목록의 칸 이름 */
const LIST_KEY = { inventory: "items", wallet: "transactions" } as const;
/** 줄인 형식의 번호. 모르는 번호는 읽지 않고, 덮어쓰지도 않는다 */
const FORMAT = 1;

/** 줄인 형식인데 풀 수 없다(모르는 형식 번호이거나 깨졌다) */
export class LedgerFormatError extends Error {}

type Rec = Record<string, unknown>;
type Row = unknown[];
type DropTable = { id: string; dropRate: number }[];

const isRec = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const bad = (what: string): LedgerFormatError => new LedgerFormatError("compact ledger is unreadable: " + what);
const num = (v: unknown): number => { if (!isNum(v)) throw bad("number"); return v; };
/** 칸 이름이 무엇이든 값을 그 이름의 칸으로 적는다("__proto__" 도 보통 칸이다) */
function put(target: Rec, key: string, value: unknown): void {
  if (key === "__proto__") Object.defineProperty(target, key, { value, writable: true, enumerable: true, configurable: true });
  else target[key] = value;
}
function trimmed(row: Row, rest: Rec | null, restAt: number): Row {
  if (rest) { row[restAt] = rest; return row; }
  let end = row.length;
  while (end > 0 && row[end - 1] === null) end--;
  row.length = end;
  return row;
}

// ── 글자 표 ────────────────────────────────────────────────────────────────────

class Words {
  readonly list: string[] = [];
  private readonly at = new Map<string, number>();
  of(word: string): number {
    let i = this.at.get(word);
    if (i === undefined) { i = this.list.length; this.list.push(word); this.at.set(word, i); }
    return i;
  }
}
const word = (words: unknown[], i: unknown): string => {
  const w = typeof i === "number" ? words[i] : undefined;
  if (typeof w !== "string") throw bad("word");
  return w;
};

// ── UUID 로 끝나는 번호: 16진수 32자를 22자로 ────────────────────────────────────
// "own_" + UUID, "tx_" + UUID, "박스x1:op_" + UUID 처럼 앞말이 붙는다. 앞말은 글자 표에 두고 "22자 + 앞말 번호(36진수)"로 적는다.
// UUID 로 끝나지 않는 글자는 글자 표의 번호(숫자)로 적는다. 글자면 UUID, 숫자면 글자 표다.

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const PAIR: string[] = Array.from({ length: 4096 }, (_, v) => B64[v >> 6] + B64[v & 63]);
const HEX3: string[] = Array.from({ length: 4096 }, (_, v) => v.toString(16).padStart(3, "0"));
const SIX = new Int8Array(128).fill(-1);
for (let i = 0; i < 64; i++) SIX[B64.charCodeAt(i)] = i;
/** UUID 36자 안에서 16진수 글자가 놓인 자리(줄표 넷을 건너뛴다) */
const HEX_AT = [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 19, 20, 21, 22, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];
/** 소문자 16진수 한 글자의 값. 아니면 -1(대문자 UUID 는 줄이지 않는다. 풀었을 때 글자가 달라지면 안 된다) */
const nib = (c: number): number => (c >= 48 && c <= 57 ? c - 48 : c >= 97 && c <= 102 ? c - 87 : -1);

function packId(text: string, words: Words): string | number {
  const start = text.length - 36;
  if (start >= 0 && text.charCodeAt(start + 8) === 45 && text.charCodeAt(start + 13) === 45 && text.charCodeAt(start + 18) === 45 && text.charCodeAt(start + 23) === 45) {
    let out = "";
    for (let i = 0; i < 33; i += 3) {
      const a = nib(text.charCodeAt(start + HEX_AT[i])); const b = nib(text.charCodeAt(start + HEX_AT[i + 1]));
      // 마지막 묶음은 16진수 두 글자뿐이다(셋째 자리는 0 으로 채운다)
      const c = i === 30 ? 0 : nib(text.charCodeAt(start + HEX_AT[i + 2]));
      if ((a | b | c) < 0) return words.of(text);
      out += PAIR[(a << 8) | (b << 4) | c];
    }
    return out + words.of(text.slice(0, start)).toString(36);
  }
  return words.of(text);
}

function unpackId(packed: unknown, words: unknown[]): string {
  if (typeof packed === "number") return word(words, packed);
  if (typeof packed !== "string" || packed.length < 23) throw bad("id");
  let hex = "";
  for (let i = 0; i < 22; i += 2) {
    const hi = packed.charCodeAt(i); const lo = packed.charCodeAt(i + 1);
    const a = hi < 128 ? SIX[hi] : -1; const b = lo < 128 ? SIX[lo] : -1;
    if ((a | b) < 0) throw bad("id");
    hex += HEX3[(a << 6) | b];
  }
  if (hex.charCodeAt(32) !== 48) throw bad("id");
  const tail = packed.slice(22);
  if (!/^[0-9a-z]+$/.test(tail)) throw bad("id");
  return word(words, parseInt(tail, 36)) + hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20, 32);
}

// ── 시각: ISO 글자를 밀리초로 ───────────────────────────────────────────────────
// 다시 글자로 바꿨을 때 원래와 똑같은 것만 숫자로 적는다. 아니면 글자 그대로 둔다.

let memoText = ""; let memoMs: number | null = null;
function msOf(text: string): number | null {
  if (text === memoText) return memoMs;
  let ms: number | null = null;
  if (text.length === 24 && text.charCodeAt(23) === 90) {
    const parsed = Date.parse(text);
    if (Number.isFinite(parsed) && new Date(parsed).toISOString() === text) ms = parsed;
  }
  memoText = text; memoMs = ms;
  return ms;
}
function isoOf(ms: number): string {
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) throw bad("time");
  return date.toISOString();
}

// ── 확률표: 내용이 같은 표는 기억 속에서도 한 벌만 둔다 ───────────────────────────
// 스토어의 기록은 고칠 때 새 객체를 만들고 확률표 배열은 그대로 물려받는다(제자리에서 고치는 코드가 없다). 그래서 배열 하나의 판정은 한 번이면 된다.
// 풀어 읽은 기록들은 같은 표를 같은 배열로 함께 가리킨다(2만 건이 저마다 100줄짜리 배열을 따로 들지 않는다).

const sharedTables = new Map<string, DropTable>();
/** 배열 → 대표 표. null 은 줄일 수 없는 모양(그런 표는 기록에 그대로 적는다) */
const tableOf = new WeakMap<object, DropTable | null>();

function sharedTable(value: unknown): DropTable | null {
  if (!Array.isArray(value)) return null;
  const known = tableOf.get(value);
  if (known !== undefined) return known;
  let shared: DropTable | null = null;
  if (value.every((e) => isRec(e) && typeof e.id === "string" && isNum(e.dropRate) && Object.keys(e).length === 2)) {
    const key = JSON.stringify(value);
    shared = sharedTables.get(key) ?? null;
    if (!shared) { shared = value as DropTable; sharedTables.set(key, shared); }
  }
  tableOf.set(value, shared);
  return shared;
}

// ── 보관함 기록 ────────────────────────────────────────────────────────────────
// 행:   [0 id, 1 묶음 번호, 2 itemId, 3 valueUsdt, 4 tier, 5 status, 6 acquiredAt, 7 fair.nonce, 8 fair.roll,
//        9 openingId(-1 은 앞 기록과 같다), 10 freeOpen(1, 0), 11 soldForUsdt, 12 soldAt(acquiredAt 과의 차이), 13 나머지 칸]
// 묶음: [0 boxSlug, 1 boxPriceUsdt, 2 fair.serverSeed, 3 fair.serverSeedHash, 4 fair.clientSeed, 5 fair.oddsVersion,
//        6 확률표 번호, 7 fundingSource, 8 fundingRatio.crypto, 9 fundingRatio.card]
// null 은 그 칸이 없다는 뜻이다. 뒤쪽의 null 은 잘라 낸다. 객체가 아닌 기록과 fair 가 객체가 아닌 기록은 { "=": 원래 값 } 으로 그대로 적는다.

const ITEM_REST = 13;

interface PackedItems { z: number; s: string[]; t: number[][]; c: Row[]; r: unknown[] }

/** 비율이 두 칸(crypto, card)의 숫자뿐인가. 아니면 줄이지 않고 그대로 적는다 */
const plainRatio = (v: unknown): v is { crypto: number; card: number } => isRec(v) && isNum(v.crypto) && isNum(v.card) && Object.keys(v).length === 2;

/**
 * 칸을 정해진 차례로 줄인다(기록 객체의 칸 순서와 무관하다). 같은 내용이면 언제나 같은 글이 나온다:
 * 장부를 읽어 그대로 다시 적으면 저장된 글이 한 글자도 바뀌지 않는다(tests/walletHistory.test.ts 가 이것을 본다).
 */
export function packItems(items: readonly unknown[]): PackedItems {
  const words = new Words();
  const tables: number[][] = []; const tableAt = new Map<DropTable, number>();
  const groups: Row[] = []; const groupAt = new Map<string, number>();
  let clock = 0; let lastOpening: string | null = null;
  const rows = items.map((item): unknown => {
    if (!isRec(item) || !isRec(item.fair)) return { "=": item };
    const fair = item.fair;
    const row: Row = [null, null, null, null, null, null, null, null, null, null, null, null, null];
    const group: Row = [null, null, null, null, null, null, null, null, null, null];
    const { id, itemId, valueUsdt, tier, status, acquiredAt, openingId, freeOpen, soldForUsdt, soldAt, boxSlug, boxPriceUsdt, fundingSource, fundingRatio } = item;
    if (typeof id === "string") row[0] = packId(id, words);
    if (typeof itemId === "string") row[2] = words.of(itemId);
    if (isNum(valueUsdt)) row[3] = valueUsdt;
    if (typeof tier === "string") row[4] = words.of(tier);
    if (typeof status === "string") row[5] = words.of(status);
    let acquired = 0;
    if (typeof acquiredAt === "string") {
      const ms = msOf(acquiredAt);
      if (ms === null) row[6] = acquiredAt; else { row[6] = ms - clock; clock = ms; acquired = ms; }
    }
    if (typeof boxSlug === "string") group[0] = words.of(boxSlug);
    if (isNum(boxPriceUsdt)) group[1] = boxPriceUsdt;
    if (typeof fair.serverSeed === "string") group[2] = words.of(fair.serverSeed);
    if (typeof fair.serverSeedHash === "string") group[3] = words.of(fair.serverSeedHash);
    if (typeof fair.clientSeed === "string") group[4] = words.of(fair.clientSeed);
    if (typeof fair.oddsVersion === "string") group[5] = words.of(fair.oddsVersion);
    const table = sharedTable(fair.dropTable);
    if (table) {
      let at = tableAt.get(table);
      if (at === undefined) {
        at = tables.length;
        const flat: number[] = [];
        for (const entry of table) flat.push(words.of(entry.id), entry.dropRate);
        tables.push(flat); tableAt.set(table, at);
      }
      group[6] = at;
    }
    if (typeof fundingSource === "string") group[7] = words.of(fundingSource);
    if (plainRatio(fundingRatio)) { group[8] = fundingRatio.crypto; group[9] = fundingRatio.card; }
    if (isNum(fair.nonce)) row[7] = fair.nonce;
    if (isNum(fair.roll)) row[8] = fair.roll;
    if (typeof openingId === "string") {
      if (openingId === lastOpening) row[9] = -1; else { row[9] = packId(openingId, words); lastOpening = openingId; }
    }
    if (typeof freeOpen === "boolean") row[10] = freeOpen ? 1 : 0;
    if (isNum(soldForUsdt)) row[11] = soldForUsdt;
    if (typeof soldAt === "string") { const ms = msOf(soldAt); row[12] = ms === null ? soldAt : ms - acquired; }
    // 위에서 줄이지 못한 칸은 원래 순서 그대로 나머지 칸에 적는다
    const rest: Rec = {}; let extra = false;
    for (const key in item) {
      const v = item[key];
      if (v === undefined || key === "fair") continue;
      switch (key) {
        case "id": case "itemId": case "tier": case "status": case "acquiredAt": case "openingId": case "soldAt": case "boxSlug": case "fundingSource": if (typeof v === "string") continue; break;
        case "valueUsdt": case "soldForUsdt": case "boxPriceUsdt": if (isNum(v)) continue; break;
        case "freeOpen": if (typeof v === "boolean") continue; break;
        case "fundingRatio": if (plainRatio(v)) continue; break;
      }
      put(rest, key, v); extra = true;
    }
    const fairRest: Rec = {}; let fairExtra = false;
    for (const key in fair) {
      const v = fair[key];
      if (v === undefined) continue;
      switch (key) {
        case "serverSeed": case "serverSeedHash": case "clientSeed": case "oddsVersion": if (typeof v === "string") continue; break;
        case "nonce": case "roll": if (isNum(v)) continue; break;
        case "dropTable": if (table) continue; break;
      }
      put(fairRest, key, v); fairExtra = true;
    }
    if (fairExtra) { rest.fair = fairRest; extra = true; }
    const groupKey = group.join(",");
    let at = groupAt.get(groupKey);
    if (at === undefined) { at = groups.length; groups.push(trimmed(group, null, 0)); groupAt.set(groupKey, at); }
    row[1] = at;
    return trimmed(row, extra ? rest : null, ITEM_REST);
  });
  return { z: FORMAT, s: words.list, t: tables, c: groups, r: rows };
}

export function unpackItems(packed: unknown): unknown[] {
  if (!isRec(packed) || packed.z !== FORMAT) throw bad("format " + String(isRec(packed) ? packed.z : packed));
  const { s: words, t, c: groups, r: rows } = packed;
  if (!Array.isArray(words) || !Array.isArray(t) || !Array.isArray(groups) || !Array.isArray(rows)) throw bad("shape");
  const tables = t.map((flat): DropTable => {
    if (!Array.isArray(flat) || flat.length % 2 !== 0) throw bad("table");
    const table: DropTable = [];
    for (let i = 0; i < flat.length; i += 2) table.push({ id: word(words, flat[i]), dropRate: num(flat[i + 1]) });
    return sharedTable(table) ?? table;
  });
  let clock = 0; let lastOpening: string | null = null;
  return rows.map((row): unknown => {
    if (!Array.isArray(row)) { if (!isRec(row)) throw bad("row"); return "=" in row ? row["="] : null; }
    const group: unknown = row[1] == null ? [] : groups[num(row[1])];
    if (!Array.isArray(group)) throw bad("group");
    const item: Rec = {}; const fair: Rec = {};
    if (row[0] != null) item.id = unpackId(row[0], words);
    if (row[2] != null) item.itemId = word(words, row[2]);
    if (group[0] != null) item.boxSlug = word(words, group[0]);
    if (row[3] != null) item.valueUsdt = num(row[3]);
    if (row[4] != null) item.tier = word(words, row[4]);
    if (row[5] != null) item.status = word(words, row[5]);
    let acquired = 0;
    const at = row[6];
    if (typeof at === "number") { clock += num(at); acquired = clock; item.acquiredAt = isoOf(clock); }
    else if (typeof at === "string") item.acquiredAt = at;
    else if (at != null) throw bad("acquiredAt");
    if (group[2] != null) fair.serverSeed = word(words, group[2]);
    if (group[3] != null) fair.serverSeedHash = word(words, group[3]);
    if (group[4] != null) fair.clientSeed = word(words, group[4]);
    if (row[7] != null) fair.nonce = num(row[7]);
    if (row[8] != null) fair.roll = num(row[8]);
    if (group[5] != null) fair.oddsVersion = word(words, group[5]);
    if (group[6] != null) { const table = tables[num(group[6])]; if (!table) throw bad("table index"); fair.dropTable = table; }
    item.fair = fair;
    if (group[7] != null) item.fundingSource = word(words, group[7]);
    if (group[8] != null || group[9] != null) item.fundingRatio = { crypto: num(group[8]), card: num(group[9]) };
    const opening = row[9];
    if (opening === -1) { if (lastOpening === null) throw bad("openingId"); item.openingId = lastOpening; }
    else if (opening != null) { lastOpening = unpackId(opening, words); item.openingId = lastOpening; }
    if (group[1] != null) item.boxPriceUsdt = num(group[1]);
    if (row[10] != null) { if (row[10] !== 0 && row[10] !== 1) throw bad("freeOpen"); item.freeOpen = row[10] === 1; }
    if (row[11] != null) item.soldForUsdt = num(row[11]);
    const sold = row[12];
    if (typeof sold === "number") item.soldAt = isoOf(acquired + num(sold));
    else if (typeof sold === "string") item.soldAt = sold;
    else if (sold != null) throw bad("soldAt");
    const rest = row[ITEM_REST];
    if (rest != null) {
      if (!isRec(rest)) throw bad("rest");
      for (const key in rest) {
        if (key === "fair") { const more = rest.fair; if (!isRec(more)) throw bad("rest.fair"); for (const k in more) put(fair, k, more[k]); }
        else put(item, key, rest[key]);
      }
    }
    return item;
  });
}

// ── 지갑의 거래 기록 ────────────────────────────────────────────────────────────
// 행: [0 id, 1 type, 2 amountUsdt, 3 at, 4 ref(-1 은 itemIds 를 쉼표로 이은 것과 같다), 5 itemIds(배열) 또는 rolloverUsdt(숫자), 6 status, 7 나머지 칸]
// 그 밖의 칸(출금 주소, 수수료, 영수증 번호, 차감하지 않은 출금 줄의 requestedUsdt 등)은 드물어서 나머지 칸에 그대로 적는다.

const TX_REST = 7;

interface PackedTransactions { z: number; s: string[]; r: unknown[] }

export function packTransactions(list: readonly unknown[]): PackedTransactions {
  const words = new Words();
  let clock = 0;
  const rows = list.map((tx): unknown => {
    if (!isRec(tx)) return { "=": tx };
    const row: Row = [null, null, null, null, null, null, null];
    // 칸을 정해진 차례로 줄인다(기록 객체의 칸 순서와 무관하다. packItems 와 같다)
    const { id, type, amountUsdt, at, ref, itemIds, rolloverUsdt, status } = tx;
    if (typeof id === "string") row[0] = packId(id, words);
    if (typeof type === "string") row[1] = words.of(type);
    if (isNum(amountUsdt)) row[2] = amountUsdt;
    if (typeof at === "string") {
      const ms = msOf(at);
      if (ms === null) row[3] = at; else { row[3] = ms - clock; clock = ms; }
    }
    const ids = Array.isArray(itemIds) && itemIds.every((x) => typeof x === "string") ? (itemIds as string[]) : null;
    // 한 칸을 나눠 쓴다. 둘이 함께 있는 기록(지금은 없다)은 rolloverUsdt 를 나머지 칸에 적는다
    const rollover = !ids && isNum(rolloverUsdt) ? rolloverUsdt : null;
    if (ids) row[5] = ids.map((x) => packId(x, words));
    else if (rollover !== null) row[5] = rollover;
    if (typeof ref === "string") row[4] = ids && ref === ids.join(",") ? -1 : packId(ref, words);
    if (typeof status === "string") row[6] = words.of(status);
    const rest: Rec = {}; let extra = false;
    for (const key in tx) {
      const v = tx[key];
      if (v === undefined) continue;
      switch (key) {
        case "id": case "type": case "at": case "ref": case "status": if (typeof v === "string") continue; break;
        case "amountUsdt": if (isNum(v)) continue; break;
        case "itemIds": if (ids) continue; break;
        case "rolloverUsdt": if (rollover !== null) continue; break;
      }
      put(rest, key, v); extra = true;
    }
    return trimmed(row, extra ? rest : null, TX_REST);
  });
  return { z: FORMAT, s: words.list, r: rows };
}

export function unpackTransactions(packed: unknown): unknown[] {
  if (!isRec(packed) || packed.z !== FORMAT) throw bad("format " + String(isRec(packed) ? packed.z : packed));
  const { s: words, r: rows } = packed;
  if (!Array.isArray(words) || !Array.isArray(rows)) throw bad("shape");
  let clock = 0;
  return rows.map((row): unknown => {
    if (!Array.isArray(row)) { if (!isRec(row)) throw bad("row"); return "=" in row ? row["="] : null; }
    const tx: Rec = {};
    if (row[0] != null) tx.id = unpackId(row[0], words);
    if (row[1] != null) tx.type = word(words, row[1]);
    if (row[2] != null) tx.amountUsdt = num(row[2]);
    const at = row[3];
    if (typeof at === "number") { clock += num(at); tx.at = isoOf(clock); }
    else if (typeof at === "string") tx.at = at;
    else if (at != null) throw bad("at");
    const shared = row[5];
    if (Array.isArray(shared)) tx.itemIds = shared.map((id) => unpackId(id, words));
    else if (shared != null) tx.rolloverUsdt = num(shared);
    const ref = row[4];
    if (ref === -1) { if (!Array.isArray(tx.itemIds)) throw bad("ref"); tx.ref = tx.itemIds.join(","); }
    else if (ref != null) tx.ref = unpackId(ref, words);
    if (row[6] != null) tx.status = word(words, row[6]);
    const rest = row[TX_REST];
    if (rest != null) {
      if (!isRec(rest)) throw bad("rest");
      for (const key in rest) put(tx, key, rest[key]);
    }
    return tx;
  });
}

// ── 저장소에 적는 글과 읽는 글 ──────────────────────────────────────────────────

const packers = { inventory: packItems, wallet: packTransactions } as const;
/**
 * 같은 목록(배열)은 한 번만 줄인다. 스토어는 목록을 고칠 때마다 새 배열을 만들므로, 배열이 같으면 내용도 같다.
 * 잔액만 바뀌는 쓰기는 거래 기록을 다시 줄이지 않는다.
 */
const chunkOf = new WeakMap<object, string>();

/**
 * 저장소에 적을 글. 줄인 목록이 맨 앞에 온다: {"state":{"items":{"z":1,...},(나머지 칸)},"version":0}
 * 목록이 없거나 비어 있으면 옛 형식 그대로다(JSON.stringify 와 같다).
 */
export function ledgerText(kind: LedgerKind, value: { state: unknown; version?: number }): string {
  const key = LIST_KEY[kind];
  const state = value.state;
  const list = isRec(state) ? state[key] : undefined;
  if (!isRec(state) || !Array.isArray(list) || list.length === 0) return JSON.stringify(value);
  let chunk = chunkOf.get(list);
  if (chunk === undefined) {
    // 줄이다가 던지는 일은 없어야 하지만, 그래도 쓰기가 막히면 안 된다. 그때는 옛 형식으로 적는다
    try { chunk = JSON.stringify(packers[kind](list)); } catch { return JSON.stringify(value); }
    chunkOf.set(list, chunk);
  }
  const others: Rec = { ...state };
  delete others[key];
  const tail = JSON.stringify(others);
  return '{"state":{"' + key + '":' + chunk + (tail === "{}" ? "" : "," + tail.slice(1, -1)) + "}" + (value.version === undefined ? "" : ',"version":' + JSON.stringify(value.version)) + "}";
}

/** 이 파일이 줄여 적은 글인가. 옛 형식의 글은 이렇게 시작할 수 없다(목록이 배열이라 "[" 가 온다) */
const isCompactText = (raw: string): boolean => raw.startsWith('{"state":{"items":{"z":') || raw.startsWith('{"state":{"transactions":{"z":');

/**
 * 저장된 글을 기억 속 모양으로 푼다. 옛 형식은 그대로 돌려준다(같은 확률표는 한 벌로 모은다).
 * JSON 이 아니면 JSON.parse 가 던지고, 줄인 형식인데 풀 수 없으면 LedgerFormatError 를 던진다.
 */
export function parseLedger<S = Rec>(raw: string | null): StorageValue<S> | null {
  if (raw === null) return null;
  const parsed: unknown = JSON.parse(raw);
  if (isRec(parsed) && isRec(parsed.state)) {
    const state = parsed.state;
    if (isRec(state.items)) state.items = unpackItems(state.items);
    else if (Array.isArray(state.items)) {
      for (const item of state.items) {
        if (!isRec(item) || !isRec(item.fair)) continue;
        const table = sharedTable(item.fair.dropTable);
        if (table) item.fair.dropTable = table;
      }
    }
    if (isRec(state.transactions)) state.transactions = unpackTransactions(state.transactions);
  }
  return parsed as StorageValue<S> | null;
}

/**
 * 풀지 못한 저장 키. 이 세션에서는 덮어쓰지 않는다. 스토어는 읽기에 실패해도 기억 속의 빈 장부를 곧바로 다시 적는데,
 * 더 새 형식이거나 깨진 줄인 장부가 그렇게 지워지지 않게 한다. 옛 형식 자리의 JSON 이 아닌 값과 읽기 오류는 전과 같이 다룬다(막지 않는다).
 */
const sealed = new Set<string>();
/** 이 저장 키의 장부를 풀지 못해 쓰기를 막아 둔 상태인가. 장부를 쓰는 일(lib/ledgerLock)이 시작하기 전에 본다 */
export const isLedgerSealed = (name: string | undefined): boolean => name !== undefined && sealed.has(name);

/** 저장된 장부 하나를 저장소에서 직접 읽어 기억 속 모양으로 돌려준다. 없으면 null, 읽지 못하면 던진다 */
export function readLedger<S = Rec>(name: string, storage: Pick<Storage, "getItem"> = localStorage): StorageValue<S> | null {
  const raw = storage.getItem(name) ?? null;
  try {
    const value = parseLedger<S>(raw);
    sealed.delete(name);
    return value;
  } catch (error) {
    // 이 파일이 적은 글로 시작하는데 JSON 으로도 읽히지 않는 값(잘린 글)도 같은 것으로 본다
    if (error instanceof LedgerFormatError || (raw !== null && isCompactText(raw))) sealed.add(name);
    throw error;
  }
}

/**
 * 스토어의 persist 에 붙이는 저장소(createJSONStorage(() => localStorage) 자리에 쓴다). 읽고 쓰는 시점과 순서는 그것과 같다.
 * 저장소를 쓸 수 없는 환경(서버, 저장소 없는 테스트)에서는 그것처럼 undefined 를 돌려준다.
 */
export function compactLedgerStorage<S>(kind: LedgerKind): PersistStorage<S> | undefined {
  let storage: Storage;
  try { storage = localStorage; } catch { return undefined; }
  // 스토어가 만들어질 때(화면이 뜨기 전) 이 기기의 옛 형식 장부를 옮기는 일을 예약한다. 스토어를 만드는 일은 기다리지 않는다
  if (typeof window !== "undefined" && !scheduled) {
    scheduled = true;
    void migrateStoredLedgers(storage, typeof navigator !== "undefined" ? (navigator as Navigator & { locks?: LedgerLocks }).locks : undefined);
  }
  return {
    getItem: (name) => readLedger<S>(name, storage),
    setItem: (name, value) => {
      if (sealed.has(name)) { try { console.warn("[VOILA] stored ledger is unreadable, not overwritten: " + name); } catch { /* 알리지 못해도 덮어쓰지 않는다 */ } return; }
      storage.setItem(name, ledgerText(kind, value));
    },
    removeItem: (name) => storage.removeItem(name),
  };
}

// ── 옛 형식으로 남아 있는 장부를 줄인 형식으로 옮긴다 ──────────────────────────────

const LEDGER_NAME = /^(?:gachaflix\.(inventory|wallet)|voila\.browser-(inventory|wallet)\..+)$/;
const kindOfName = (name: string): LedgerKind | null => { const m = LEDGER_NAME.exec(name); return m ? ((m[1] ?? m[2]) as LedgerKind) : null; };
/** 그 장부의 계정이 쓰는 지갑 저장 키. 장부의 잠금과 확인 대기 표시는 이 키에 묶인다(lib/ledgerLock 의 ledgerKey) */
const walletNameOf = (name: string): string => (name === "gachaflix.inventory" ? "gachaflix.wallet" : name.replace(/^voila\.browser-inventory\./, "voila.browser-wallet."));
/** 장부를 쓰는 일들이 함께 쓰는 잠금(Web Locks)의 이름. lib/ledgerLock 과 아래의 옮기는 일이 같은 이름을 쓴다 */
export const ledgerLockName = (walletName: string): string => "voila-ledger:" + walletName;
/** 확인 대기 표시의 저장 키 앞말: 받기(lib/takeBatch), 업그레이드(lib/upgradeMarks). 뒤에 지갑 저장 키가 붙는다 */
const MARK_PREFIXES = ["voila.take-unconfirmed.", "voila.upgrade-unconfirmed."];

type LedgerStore = Pick<Storage, "length" | "key" | "getItem" | "setItem">;
/** Web Locks 가운데 여기서 쓰는 것 */
export interface LedgerLocks { request: (name: string, work: () => unknown) => Promise<unknown> }

/** 그 장부의 계정에 끝이 확인되지 않은 받기나 업그레이드의 표시가 남아 있는가 */
function markPending(storage: LedgerStore, name: string): boolean {
  const wallet = walletNameOf(name);
  return MARK_PREFIXES.some((prefix) => { const raw = storage.getItem(prefix + wallet); return typeof raw === "string" && raw !== "[]"; });
}

/** JSON 값 둘이 같은가(칸의 순서는 보지 않는다) */
function same(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((x, i) => same(x, b[i]));
  if (!isRec(a) || !isRec(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((k) => Object.prototype.hasOwnProperty.call(b, k) && same(a[k], b[k]));
}

/**
 * 옛 형식으로 남은 장부 하나를 줄인 형식으로 옮긴다. 옮겼으면 true. 던지지 않는다.
 * 읽기부터 쓰기까지 기다림 없이 한 번에 한다. 이 탭의 다른 일도, 다른 키의 일도 그 사이에 끼지 못한다.
 *   1. 그 계정에 확인 대기 표시(받기, 업그레이드)가 남아 있으면 옮기지 않는다. 끝이 확인되지 않은 장부는 옮기는 일이 건드리지 않는다.
 *      옛 형식도 계속 읽으므로 그대로 두면 된다. 표시가 풀린 뒤에 다시 열 때 옮긴다.
 *   2. 지금 저장된 글을 읽는다. 이미 줄인 형식이면 끝이다.
 *   3. 줄인 글을 만들고, 그것을 다시 풀면 옛 값과 똑같은지 확인한다. 다르거나, 짧아지지 않으면(빈 장부) 옛 값을 그대로 둔다.
 *   4. 저장된 글을 다시 읽어, 처음 읽은 글과 한 글자도 다르지 않을 때만 적는다. 그 사이에 다른 값이 적혔으면 그 값이 남는다.
 *   5. 새 키를 만들지 않고 같은 키에 더 짧은 글을 덮어쓴다(브라우저는 줄어드는 쓰기를 한도가 차 있어도 받는다. 새 키와 늘어나는 쓰기는 받지 않는다).
 *      적은 뒤 다시 읽어 확인한다. 적히지 않았으면 옛 값이 그대로 남아 있다.
 */
export function compactStoredLedger(storage: LedgerStore, name: string): boolean {
  try {
    const kind = kindOfName(name);
    if (!kind || markPending(storage, name)) return false;
    const raw = storage.getItem(name);
    if (typeof raw !== "string" || isCompactText(raw)) return false;
    const old: unknown = JSON.parse(raw);
    if (!isRec(old)) return false;
    const text = ledgerText(kind, old as { state: unknown; version?: number });
    if (text.length >= raw.length || !same(parseLedger(text), old)) return false;
    if (storage.getItem(name) !== raw) return false;
    storage.setItem(name, text);
    return storage.getItem(name) === text;
  } catch { return false; }
}

/** 옛 형식으로 남은 장부의 저장 키, 저장된 글이 긴 것부터. 글은 들고 있지 않는다(옮길 때 그 자리에서 다시 읽는다) */
function oldLedgerNames(storage: LedgerStore): string[] {
  const found: { name: string; size: number }[] = [];
  try {
    // 이 사이트의 저장소 래퍼(lib/labSite)는 이 사이트의 키만 차례로 주고 그 뒤로는 null 을 준다. length 는 출처 전체의 수다
    for (let i = 0; i < storage.length; i++) {
      const name = storage.key(i);
      if (!name || !kindOfName(name)) continue;
      const raw = storage.getItem(name);
      if (typeof raw === "string" && !isCompactText(raw)) found.push({ name, size: raw.length });
    }
  } catch { /* 저장소를 읽지 못했다. 찾은 데까지만 본다 */ }
  return found.sort((x, y) => y.size - x.size).map((x) => x.name);
}

/** 옛 형식으로 남은 장부를 잠금 없이 지금 바로, 하나씩 옮긴다(compactStoredLedger). 옮긴 키의 이름을 돌려준다 */
export function compactStoredLedgers(storage: LedgerStore): string[] {
  return oldLedgerNames(storage).filter((name) => compactStoredLedger(storage, name));
}

let scheduled = false;
/**
 * 이 기기에 옛 형식으로 남은 장부(지금 쓰지 않는 다른 계정의 것 포함)를 옮긴다. 옮긴 키의 이름을 돌려준다.
 * 장부마다 그 계정의 장부 잠금을 얻은 뒤에 옮긴다(개봉과 받기가 쓰는 lib/ledgerLock 의 잠금과 같은 이름). 다른 탭이 그 장부에 적는 동안에는
 * 기다렸다가, 끝난 뒤의 값을 읽어서 옮긴다. 잠금 안에서 하는 일은 compactStoredLedger 한 번이고 기다림이 없다.
 * 잠금은 비동기로만 얻을 수 있다. 그래서 스토어를 만드는 일(동기)은 기다리지 않고 예약만 한다. 한도가 찬 브라우저에서 지금 쓰는 계정의 장부는
 * 이 일과 상관없이 스토어가 읽은 직후의 첫 쓰기에서 줄어든다(읽기와 쓰기가 한 번에 이어지고, 같은 키의 더 짧은 글이다. 확인 대기 표시가
 * 남아 있어도 그렇다: 한도가 차서 표시가 남은 브라우저가 스스로 자리를 되찾아야 한다).
 * Web Locks 가 없는 브라우저에서는 잠금 없이 바로 옮긴다. 그때 남는 보호는 "다시 읽어 비교한 뒤 적기"뿐이고, 이것만으로 두 탭 사이가 완전히
 * 막히지는 않는다(다른 탭의 쓰기가 이 탭에 아직 전해지지 않았을 수 있다). lib/ledgerLock 의 다른 일들도 그 브라우저에서는 같은 한계를 가진다.
 */
export function migrateStoredLedgers(storage: LedgerStore, locks: LedgerLocks | undefined): Promise<string[]> {
  if (!locks) return Promise.resolve(compactStoredLedgers(storage));
  const jobs = oldLedgerNames(storage).map((name) =>
    locks.request(ledgerLockName(walletNameOf(name)), () => compactStoredLedger(storage, name)).then((moved) => (moved === true ? name : null), () => null));
  return Promise.all(jobs).then((names) => names.filter((name): name is string => name !== null));
}

// 개발 서버에서만: 화면 검수 스크립트(scripts/capture)가 저장된 장부를 기억 속 모양으로 읽는 손잡이. 운영 빌드에는 없다
if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  (window as Window & { __voilaLedger?: (name: string) => unknown }).__voilaLedger = (name) => { try { return readLedger(name)?.state ?? null; } catch { return null; } };
}
