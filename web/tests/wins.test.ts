// 나온 상품(/wins)의 기준과 줄(lib/wins). flow/MELT_SPEC.md S8.
import test from "node:test";
import assert from "node:assert/strict";
import { BOXES, type ProductBox } from "../lib/products";
import { createOpeningPurchase } from "../lib/opening";
import { REFUND_RATE } from "../lib/types";
import { WINS_PAGE, WIN_TIMES, isWin, maskedName, wasFreeOpen, winPrice, winRows, type WinCatalog } from "../lib/wins";
import { useInventoryStore, type OwnedItem } from "../stores/inventoryStore";
import { useWalletStore } from "../stores/walletStore";
import { useFairStore } from "../stores/fairStore";
import ko from "../messages/v.ko.json";
import en from "../messages/v.en.json";
import zh from "../messages/v.zh.json";

/** 지금 카탈로그 대신 끼우는 것: 박스 가격은 표에서, 종류는 상품 id 의 앞말에서 */
const catalog = (prices: Record<string, number>): WinCatalog => ({
  priceNow: (slug) => prices[slug],
  kindOf: (slug, itemId) => (slug in prices ? (itemId.startsWith("cash") ? "cash" : "physical") : undefined),
});
const NOW = catalog({ box: 20 });
let seq = 0;
const rec = (over: Partial<OwnedItem> = {}): OwnedItem => {
  const n = ++seq;
  return { id: "own_" + n, itemId: "item-" + n, boxSlug: "box", valueUsdt: 40, tier: "curated", status: "IN_STORAGE", acquiredAt: "2026-10-12T00:00:00.000Z", fair: { serverSeedHash: "h", serverSeed: "s", clientSeed: "c", nonce: n, roll: 1 }, ...over };
};
const ids = (rows: { id: string }[]) => rows.map((r) => r.id);

test("기준의 경계: 1회 가격의 1.999배는 들지 않고 정확히 2배는 든다", () => {
  assert.equal(WIN_TIMES, 2);
  assert.equal(isWin(39.98, 20), false, "1.999배");
  assert.equal(isWin(40, 20), true, "정확히 2배");
  assert.equal(isWin(40.01, 20), true);
  assert.equal(isWin(0.2, 0.1), true, "소수 가격에서도 정확히 2배는 든다");
  assert.equal(isWin(0.19, 0.1), false);
  assert.equal(isWin(40, 0), false, "가격을 모르면 들지 않는다");
  const under = rec({ valueUsdt: 39.98, boxPriceUsdt: 20 });
  const exact = rec({ valueUsdt: 40, boxPriceUsdt: 20 });
  assert.deepEqual(ids(winRows([under, exact], { loggedIn: true, catalog: NOW })), [exact.id]);
});

test("그때의 가격으로 견준다: 기록에 적힌 가격이 지금 가격보다 먼저다", () => {
  // 그때 20, 지금 30 으로 오른 박스: 참고가 50 은 그때 기준(40)으로 든다. 지금 기준(60)으로는 들지 않았을 것이다
  const raised = rec({ valueUsdt: 50, boxPriceUsdt: 20 });
  const rows = winRows([raised], { loggedIn: true, catalog: catalog({ box: 30 }) });
  assert.deepEqual(ids(rows), [raised.id]);
  assert.deepEqual([rows[0].price, rows[0].priceStored], [20, true]);
  // 그때 30, 지금 20 으로 내린 박스: 참고가 50 은 그때 기준(60)으로 들지 않는다. 지금 기준(40)으로 올리지 않는다
  const lowered = rec({ valueUsdt: 50, boxPriceUsdt: 30 });
  assert.deepEqual(winRows([lowered], { loggedIn: true, catalog: catalog({ box: 20 }) }), []);
});

test("그때 가격이 없는 옛 기록은 지금 가격으로 견주고 그렇게 했다고 표시한다", () => {
  const old = rec({ valueUsdt: 50 });
  assert.deepEqual(winPrice(old, catalog({ box: 20 })), { price: 20, stored: false });
  const rows = winRows([old], { loggedIn: true, catalog: catalog({ box: 20 }) });
  assert.deepEqual([rows[0].price, rows[0].priceStored], [20, false]);
  assert.deepEqual(winRows([old], { loggedIn: true, catalog: catalog({ box: 30 }) }), [], "지금 가격 30 이면 기준은 60 이다");
  assert.equal(winPrice(rec({ boxSlug: "gone" }), catalog({ box: 20 })), null, "가격을 알 수 없는 박스");
  assert.deepEqual(winRows([rec({ boxSlug: "gone", valueUsdt: 9999 })], { loggedIn: true, catalog: catalog({ box: 20 }) }), []);
});

test("무료 개봉도 정상 가격으로 본다(낸 돈 0 이 분모가 아니다)", () => {
  const freeWin = rec({ valueUsdt: 40, boxPriceUsdt: 20, freeOpen: true });
  const freeLow = rec({ valueUsdt: 39, boxPriceUsdt: 20, freeOpen: true });
  const rows = winRows([freeWin, freeLow], { loggedIn: true, catalog: NOW });
  assert.deepEqual(ids(rows), [freeWin.id], "무료라고 해서 낮은 결과가 오르지 않는다");
  assert.equal(rows[0].free, true);
  assert.equal(rows[0].price, 20);
});

test("개봉이 기록에 그때의 1회 가격과 무료 여부를 적는다(돈은 그대로)", async () => {
  const base = BOXES.find((b) => b.scheme === "physical")!;
  const top = [...base.items].sort((a, b) => b.value - a.value)[0];
  const box: ProductBox = { ...base, items: [{ ...top, dropRate: 100 }] };
  useWalletStore.setState({ cryptoBalance: box.price * 2, cardBalance: 0, balance: box.price * 2, transactions: [], totalWagered: 0, burst: {}, freeOpens: { [box.slug]: 1 }, freeOpensGranted: true });
  useInventoryStore.setState({ items: [] });
  useFairStore.setState({ serverSeed: "w".repeat(128), serverSeedHash: "hash", clientSeed: "wins-test", nonce: 0 });
  const results = await createOpeningPurchase(box, 2, "op_wins_a")();
  const owned = useInventoryStore.getState().items;
  const byId = new Map(owned.map((o) => [o.id, o]));
  assert.deepEqual(results.map((r) => byId.get(r.ownedId)!.boxPriceUsdt), [box.price, box.price]);
  assert.deepEqual(results.map((r) => byId.get(r.ownedId)!.freeOpen), [true, false], "앞의 하나가 무료였다");
  assert.equal(useWalletStore.getState().balance, box.price, "두 개 가운데 하나만 값을 냈다");
  // 같은 기록에서 무료 여부를 지우면(옛 기록) 지갑의 개봉 거래에서 같은 답을 읽는다
  const legacy = owned.map(({ freeOpen: _f, ...o }) => o as OwnedItem);
  const opens = useWalletStore.getState().transactions;
  assert.deepEqual(results.map((r) => wasFreeOpen(legacy.find((o) => o.id === r.ownedId)!, legacy, opens)), [true, false]);
  assert.equal(wasFreeOpen(legacy[0], legacy, []), null, "거래를 찾지 못하면 알 수 없다. 지어내지 않는다");
  // 이 박스의 가장 값진 상품은 1회 가격의 2배를 넘는다: 무료로 나온 것도, 값을 낸 것도 오른다
  assert.ok(top.value >= box.price * 2);
  const rows = winRows(owned, { loggedIn: true, opens });
  assert.equal(rows.length, 2);
  assert.ok(rows.every((r) => r.priceStored && r.price === box.price));
});

test("USDT 로 받았거나 배송을 신청한 뒤에도 줄은 남는다", () => {
  useInventoryStore.setState({ items: [] });
  const [a, b, c] = useInventoryStore.getState().add([1, 2, 3].map((n) => ({ itemId: "item-keep-" + n, boxSlug: "box", valueUsdt: 100, tier: "curated" as const, boxPriceUsdt: 20, fair: { serverSeedHash: "h", serverSeed: "s", clientSeed: "c", nonce: n, roll: 1 } })));
  const before = ids(winRows(useInventoryStore.getState().items, { loggedIn: true, catalog: NOW }));
  assert.equal(before.length, 3);
  assert.equal(useInventoryStore.getState().sell([a.id], REFUND_RATE).totalUsdt, 95);
  useInventoryStore.getState().requestShipping([b.id], { recipient: "Test", country: "US", phone: "000", postalCode: "000", address: "Test" }, 0);
  const after = useInventoryStore.getState().items;
  assert.deepEqual(after.map((o) => o.status).sort(), ["IN_STORAGE", "SHIPPING_REQUESTED", "SOLD"]);
  assert.deepEqual(ids(winRows(after, { loggedIn: true, catalog: NOW })), before, "줄도 순서도 그대로다");
  assert.ok(c.id);
  useInventoryStore.setState({ items: [] });
});

test("로그인하지 않았으면 줄이 없다", () => {
  const owned = [rec({ valueUsdt: 100, boxPriceUsdt: 20 }), rec({ valueUsdt: 100, boxPriceUsdt: 20 })];
  assert.equal(winRows(owned, { loggedIn: true, catalog: NOW }).length, 2);
  assert.deepEqual(winRows(owned, { loggedIn: false, catalog: NOW }), []);
});

test("새것부터, 나온 때가 같으면 순서가 고정된다(넣는 순서와 무관)", () => {
  const at = "2026-10-12T03:00:00.000Z";
  const older = rec({ acquiredAt: "2026-10-11T03:00:00.000Z", fair: { serverSeedHash: "h", serverSeed: "s", clientSeed: "c", nonce: 99, roll: 1 } });
  const n5 = rec({ id: "own_b", acquiredAt: at, fair: { serverSeedHash: "h", serverSeed: "s", clientSeed: "c", nonce: 5, roll: 1 } });
  const n7 = rec({ id: "own_a", acquiredAt: at, fair: { serverSeedHash: "h", serverSeed: "s", clientSeed: "c", nonce: 7, roll: 1 } });
  const n6 = rec({ id: "own_c", acquiredAt: at, fair: { serverSeedHash: "h", serverSeed: "s", clientSeed: "c", nonce: 6, roll: 1 } });
  // 회차까지 같은 둘은 기록 id 순서
  const tieA = rec({ id: "own_tie_a", acquiredAt: at, fair: { serverSeedHash: "h", serverSeed: "s", clientSeed: "c", nonce: 6, roll: 1 } });
  const expected = [n7.id, n6.id, tieA.id, n5.id, older.id];
  const all = [older, n5, n7, n6, tieA];
  const orders = [all, [...all].reverse(), [n6, tieA, older, n7, n5], [tieA, n6, n5, n7, older]];
  for (const order of orders) assert.deepEqual(ids(winRows(order, { loggedIn: true, catalog: NOW })), expected);
  assert.equal(WINS_PAGE, 30);
});

test("실제 기록만 오른다: 빈 보관함은 빈 목록이고, 줄은 넘겨준 기록에서만 나온다", () => {
  assert.deepEqual(winRows([], { loggedIn: true, catalog: NOW }), [], "예시나 샘플 줄이 없다");
  assert.deepEqual(winRows([], { loggedIn: true }), [], "실제 카탈로그로도 같다");
  const cash = rec({ itemId: "cash-1", valueUsdt: 1000, boxPriceUsdt: 20 });
  const item = rec({ valueUsdt: 1000, boxPriceUsdt: 20 });
  const rows = winRows([cash, item], { loggedIn: true, catalog: NOW });
  assert.deepEqual(ids(rows), [item.id], "USDT 결과는 상품이 아니라 오르지 않는다");
  assert.equal(rows[0].record, item, "줄은 그 기록 자체를 가리킨다(검증이 그 기록의 값과 당시 확률표를 쓴다)");
  assert.equal(rows[0].value, 1000, "참고가는 기록에 적힌 값이다");
});

test("무료 개봉 여부를 모르는 옛 기록도 줄에 남고, 모른다는 것(null)이 그대로 전해진다", () => {
  const unknown = rec({ valueUsdt: 100, boxPriceUsdt: 20 });
  const rows = winRows([unknown], { loggedIn: true, catalog: NOW, opens: [] });
  assert.deepEqual(ids(rows), [unknown.id]);
  assert.equal(rows[0].free, null, "화면은 이 값을 '기록 없음'으로 적는다. 행을 빼지 않는다");
});

test("이름은 앞 두 글자만 남기고 가린다", () => {
  assert.equal(maskedName({ nickname: "voilafan" }), "vo***");
  assert.equal(maskedName({ label: "someone@example.com" }), "so***");
  assert.equal(maskedName({ nickname: "가나다" }), "가나***");
  assert.equal(maskedName(null), "");
});

test("문구: 나온 상품의 세 언어 키가 같고, 한국어는 명세의 문장 그대로다", () => {
  const keys = (o: object): string[] => Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? keys(v).map((s) => k + "." + s) : [k])).sort();
  assert.deepEqual(keys(en.wins), keys(ko.wins));
  assert.deepEqual(keys(zh.wins), keys(ko.wins));
  assert.equal(ko.wins.title, "나온 상품");
  // 숫자에만 줄바꿈 금지를 거는 표시(<num>)를 걷어 내면 명세의 글이다
  const plain = (text: string) => text.replace(/<\/?num>/g, "");
  assert.equal(plain(ko.wins.desc).replace("{n}", "2"), "박스 가격의 2배 이상인 상품이 나오면 새것부터 쌓입니다. 후기를 쓰지 않아도 쌓입니다.");
  assert.equal(plain(ko.wins.none).replace("{n}", "2"), "아직 박스 가격의 2배 이상인 상품이 나온 기록이 없습니다.");
  assert.equal(ko.wins.scope, "이 기기에서 이 계정으로 연 기록입니다.");
  assert.equal(plain(ko.wins.value).replace("{amount}", "$1,000"), "$1,000");
  // 배수는 숫자와 단위를 한 덩어리로 묶는다(중국어에서 "2" 와 "倍" 가 줄 끝에서 갈라지지 않게)
  for (const text of [zh.wins.desc, zh.wins.none]) assert.ok(text.includes("<num>{n} 倍</num>"), text);
  for (const text of [ko.wins.desc, ko.wins.none]) assert.ok(text.includes("<num>{n}배</num>"), text);
  // 한 문장이 쉼표 없이 길면 좁은 화면에서 넘친다(설명 줄은 낱말 사이에서만 줄을 바꾼다). 중국어 설명은 쉼표나 빈칸 사이가 16자 이하다
  for (const text of [zh.wins.desc, zh.verify.desc, zh.verify.manualDesc]) {
    for (const run of plain(text).split(/[，。、 ]/)) assert.ok(Array.from(run).length <= 16, `${run} (${text})`);
  }
  assert.equal(ko.wins.more, "더 보기");
  // 무료 개봉 여부를 모르는 옛 기록에 적는 말(R14)
  assert.deepEqual([ko.wins.freeUnknown, en.wins.freeUnknown, zh.wins.freeUnknown], ["기록 없음", "Not recorded", "无记录"]);
  // 메뉴의 이름은 nav.wins 이고 화면의 제목과 같다(한 대상에 이름 하나)
  for (const m of [ko, en, zh]) assert.equal(m.nav.wins, m.wins.title);
  // 줄바꿈 금지 표시는 숫자만 감싼다. 세 언어 모두
  for (const m of [ko, en, zh]) {
    assert.match(m.wins.value, /<num>\{amount\}<\/num>$/);
    assert.match(m.wins.byline, /^\{who\}(, |，)<num>\{at\}<\/num>$/);
  }
  // 중국어는 전각 문장부호를 쓴다: 반각 쉼표, 쌍반점, 쌍점, 괄호, 마침표가 한자나 자리표시 옆에 붙지 않는다
  const flat = (o: object): string[] => Object.values(o).flatMap((v) => (v && typeof v === "object" ? flat(v) : [String(v)]));
  for (const text of [...flat(zh.wins), ...flat(zh.verify), zh.nav.wins]) {
    assert.doesNotMatch(text, /[一-鿿}][,;:()]|[,;:()] ?[一-鿿{<]|[一-鿿]\.(?!\d)/, text);
  }
  assert.equal(zh.wins.byline, "{who}，<num>{at}</num>");
  assert.equal(zh.verify.rowMeta, "{box}，{date}，回合 {n}");
  for (const text of Object.values(ko.wins)) assert.doesNotMatch(text, /[!?—–·・]/);
});
