// 업그레이드의 식과 목표 고르기(flow/MELT_SPEC.md U2, U3). 장부를 바꾸는 일은 tests/upgradeSettle.test.ts 가 본다
//   - 성공 확률 = 0.9 × 건 상품가 ÷ 목표 상품가, 배수는 1.2 이상 40 이하, 0.01% 단위로 내림
//   - 보여 주는 수와 판정하는 수가 같다(내림한 정수 하나)
//   - 단추마다 실제 카탈로그 상품 하나가 결정적으로 정해진다
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import { ROLL_RANGE } from "../lib/fairness";
import { HOME_BOXES, type ProductBox, type ProductItem } from "../lib/products";
import {
  CHIP_TOLERANCE, UPGRADE_CHIPS, UPGRADE_EDGE, UPGRADE_MAX_TIMES, UPGRADE_MIN_TIMES,
  chanceText, chanceUnitsOf, pickTarget, rollText, targetById, timesInRange, timesOfUpgrade, upgradeOptions, upgradePool, upgradeWon, type UpgradeTarget,
} from "../lib/upgrade";

test("확률 식: 0.9 × 건 상품가 ÷ 목표 상품가를 0.01% 단위로 내림한다", () => {
  assert.equal(UPGRADE_EDGE, 0.9);
  assert.equal(chanceUnitsOf(100, 200), 4500);
  assert.equal(chanceUnitsOf(100, 300), 3000);
  assert.equal(chanceUnitsOf(100, 500), 1800);
  assert.equal(chanceUnitsOf(100, 150), 6000);
  assert.equal(chanceUnitsOf(100, 1000), 900);
  // 내림: 44.334...% 는 44.33%, 38.571...% 는 38.57%
  assert.equal(chanceUnitsOf(100, 203), 4433);
  assert.equal(chanceUnitsOf(3, 7), 3857);
  // 부동소수로 계산하면 내려가기 쉬운 딱 떨어지는 값들
  assert.equal(chanceUnitsOf(0.07, 0.14), 4500);
  assert.equal(chanceUnitsOf(549, 1098), 4500);
  assert.equal(chanceUnitsOf(19.99, 39.98), 4500);
  assert.equal(chanceText(4433), "44.33");
  assert.equal(chanceText(4500), "45.00");
  assert.equal(chanceText(225), "2.25");
});

test("확률 식: 올려 적는 일이 없다(내림한 수 ≤ 참값 < 내림한 수 + 0.01%)", () => {
  let seed = 12345;
  const next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  for (let i = 0; i < 4000; i++) {
    const stake = Math.round((5 + next() * 5000) * 100) / 100;
    const target = Math.round(stake * (UPGRADE_MIN_TIMES + next() * (UPGRADE_MAX_TIMES - UPGRADE_MIN_TIMES)) * 100) / 100;
    const units = chanceUnitsOf(stake, target);
    if (units === null) continue;
    const exact = (UPGRADE_EDGE * Math.round(stake * 100) * 10000) / Math.round(target * 100);
    assert.ok(units <= exact + 1e-6 && exact < units + 1 + 1e-6, `${stake} → ${target}: ${units} vs ${exact}`);
    assert.ok(units >= 225 && units <= 7500, `${units}`);
  }
});

test("배수의 범위: 1.2 이상 40 이하만 된다", () => {
  assert.equal(chanceUnitsOf(100, 120), 7500);
  assert.equal(chanceUnitsOf(100, 119.99), null);
  assert.equal(chanceUnitsOf(100, 4000), 225);
  assert.equal(chanceUnitsOf(100, 4000.01), null);
  assert.equal(chanceUnitsOf(100, 100), null);
  assert.equal(chanceUnitsOf(100, 50), null);
  assert.equal(chanceUnitsOf(0, 100), null);
  assert.equal(chanceUnitsOf(100, Number.NaN), null);
  assert.equal(timesInRange(100, 120), true);
  assert.equal(timesInRange(100, 4000), true);
  assert.equal(timesInRange(100, 119.99), false);
  // 실제 배수는 내림해 적는다
  assert.equal(timesOfUpgrade(100, 203), 2.03);
  assert.equal(timesOfUpgrade(3, 7), 2.33);
  assert.equal(timesOfUpgrade(100, 199.99), 1.99);
});

test("판정: 번호 ÷ 1,000,000 이 확률보다 작으면 성공이다. 보여 주는 확률과 같은 수로 가른다", () => {
  // 44.33%: 번호 443,299 까지 성공, 443,300 부터 실패
  assert.equal(upgradeWon(443299, 4433), true);
  assert.equal(upgradeWon(443300, 4433), false);
  assert.equal(upgradeWon(0, 225), true);
  assert.equal(upgradeWon(22499, 225), true);
  assert.equal(upgradeWon(22500, 225), false);
  assert.equal(upgradeWon(ROLL_RANGE - 1, 7500), false);
  // 번호를 전부 세면 성공하는 번호의 수가 정확히 확률만큼이다
  for (const units of [225, 900, 4433, 4500, 7500]) {
    let wins = 0;
    for (let roll = 0; roll < ROLL_RANGE; roll += 1) if (upgradeWon(roll, units)) wins += 1;
    assert.equal(wins / ROLL_RANGE, units / 10000);
  }
  assert.equal(rollText(443299), "44.3299");
  assert.equal(rollText(443300), "44.3300");
});

// ── 목표 고르기 ──
const box = (slug: string, category: string): ProductBox => ({ slug, category } as unknown as ProductBox);
const item = (id: string, value: number, photo = true): ProductItem => ({ id, value, kind: "physical", image: { src: photo ? "/p/" + id + ".webp" : "" } } as unknown as ProductItem);
const cand = (id: string, value: number, opts: { photo?: boolean; category?: string } = {}): UpgradeTarget => ({ item: item(id, value, opts.photo ?? true), box: box("b-" + id, opts.category ?? "audio") });
const STAKE = { itemId: "stake", valueUsdt: 100, category: "audio" };

test("목표 고르기: 상품가가 건 상품 × 배수에 가장 가까운 상품", () => {
  const pool = [cand("a", 180), cand("b", 195), cand("c", 210), cand("d", 229)];
  assert.equal(pickTarget(STAKE, 2, pool)?.item.id, "b");
  assert.equal(pickTarget({ ...STAKE, valueUsdt: 105 }, 2, pool)?.item.id, "c");
});

test("목표 고르기: 사진 있는 상품이 먼저다. 사진 있는 것이 없을 때만 사진 없는 것을 고른다", () => {
  const pool = [cand("near-nophoto", 200, { photo: false }), cand("far-photo", 225)];
  assert.equal(pickTarget(STAKE, 2, pool)?.item.id, "far-photo");
  assert.equal(pickTarget(STAKE, 2, [pool[0]])?.item.id, "near-nophoto");
});

test("목표 고르기: 같은 조건이면 같은 카테고리, 그래도 같으면 상품 번호 순", () => {
  const pool = [cand("z-watch", 205, { category: "watch" }), cand("y-audio", 195, { category: "audio" }), cand("x-watch", 195, { category: "watch" })];
  assert.equal(pickTarget(STAKE, 2, pool)?.item.id, "y-audio");
  assert.equal(pickTarget({ ...STAKE, category: "watch" }, 2, pool)?.item.id, "x-watch");
  // 카테고리를 모르면 상품 번호 순
  assert.equal(pickTarget({ ...STAKE, category: undefined }, 2, pool)?.item.id, "x-watch");
  // 넣는 순서가 달라도 같은 것을 고른다
  assert.equal(pickTarget(STAKE, 2, [...pool].reverse())?.item.id, "y-audio");
});

test("목표 고르기: 단추의 범위 밖 상품은 그 단추의 목표가 아니다. 맞는 상품이 없으면 null", () => {
  // 2배 단추의 범위는 173.92 이상 230 이하
  assert.equal(pickTarget(STAKE, 2, [cand("low", 173), cand("high", 231)]), null);
  assert.equal(pickTarget(STAKE, 2, [cand("edge", 230)])?.item.id, "edge");
  // 1.5배 단추의 아래쪽은 식의 최소 배수 1.2 가 아니라 단추의 범위(1.5 ÷ 1.15)다
  assert.equal(pickTarget(STAKE, 1.5, [cand("x", 125)]), null);
  assert.equal(pickTarget(STAKE, 1.5, [cand("x", 131)])?.item.id, "x");
  // 건 상품과 같은 상품은 목표가 아니다
  assert.equal(pickTarget({ ...STAKE, itemId: "self" }, 2, [cand("self", 200)]), null);
  assert.equal(pickTarget(STAKE, 2, []), null);
  // 다섯 단추의 범위는 서로 겹치지 않는다
  for (let i = 1; i < UPGRADE_CHIPS.length; i++) assert.ok(UPGRADE_CHIPS[i - 1] * CHIP_TOLERANCE < UPGRADE_CHIPS[i] / CHIP_TOLERANCE);
});

test("다섯 단추: 실제 배수와 확률은 목표의 실제 상품가로 계산한다", () => {
  const pool = [cand("a", 152), cand("b", 203), cand("c", 290), cand("e", 1090)];
  const options = upgradeOptions(STAKE, pool);
  assert.deepEqual(options.map((o) => o.chip), [1.5, 2, 3, 5, 10]);
  assert.deepEqual(options.map((o) => o.target?.item.id ?? null), ["a", "b", "c", null, "e"]);
  assert.deepEqual(options.map((o) => o.times), [1.52, 2.03, 2.9, 0, 10.9]);
  assert.deepEqual(options.map((o) => o.chanceUnits), [5921, 4433, 3103, 0, 825]);
});

test("실제 카탈로그: 후보는 실물뿐이고 상품 번호마다 하나, 상품가 순이다", () => {
  const pool = upgradePool();
  assert.ok(pool.length > 1000, `후보 ${pool.length}개`);
  assert.equal(new Set(pool.map((c) => c.item.id)).size, pool.length);
  assert.ok(pool.every((c) => c.item.kind === "physical"));
  for (let i = 1; i < pool.length; i++) assert.ok(pool[i - 1].item.value <= pool[i].item.value);
  // 후보의 박스에 그 상품이 실제로 들어 있다(보관함이 박스와 상품 번호로 상품을 찾는다)
  for (const c of pool.slice(0, 200)) assert.ok(c.box.items.some((i) => i.id === c.item.id));
  assert.equal(upgradePool(), pool);
  assert.equal(targetById(pool[0].item.id)?.item.id, pool[0].item.id);
  assert.equal(targetById("no-such-item"), null);
});

test("실제 카탈로그: 여러 값의 건 상품에서 단추가 내는 목표가 규칙을 지킨다", () => {
  const some = HOME_BOXES[0];
  for (const valueUsdt of [5, 20, 100, 549, 1000, 5000, 120000]) {
    const stake = { itemId: "stake", valueUsdt, category: some.category };
    const options = upgradeOptions(stake);
    const again = upgradeOptions(stake);
    assert.deepEqual(options.map((o) => o.target?.item.id ?? null), again.map((o) => o.target?.item.id ?? null));
    const picked = options.filter((o) => o.target);
    // 한 상품이 두 단추의 목표가 되지 않는다
    assert.equal(new Set(picked.map((o) => o.target!.item.id)).size, picked.length);
    for (const o of picked) {
      const ratio = o.target!.item.value / valueUsdt;
      assert.ok(ratio >= o.chip / CHIP_TOLERANCE - 1e-9 && ratio <= o.chip * CHIP_TOLERANCE + 1e-9, `${valueUsdt} × ${o.chip}: ${ratio}`);
      assert.ok(ratio >= UPGRADE_MIN_TIMES - 1e-9 && ratio <= UPGRADE_MAX_TIMES + 1e-9);
      assert.equal(o.chanceUnits, chanceUnitsOf(valueUsdt, o.target!.item.value));
      assert.equal(o.times, timesOfUpgrade(valueUsdt, o.target!.item.value));
    }
  }
  // 흔한 값의 상품에는 다섯 단추가 모두 열린다
  assert.equal(upgradeOptions({ itemId: "stake", valueUsdt: 100 }).filter((o) => o.target).length, 5);
});

test("업그레이드 문구: 세 언어에 같은 키가 있고, 한국어는 명세(U6)의 글 그대로다. 금지 문자와 옛 낱말(R17)이 없다", async () => {
  const fs = await import("node:fs");
  const load = (locale: string): Record<string, string> => JSON.parse(fs.readFileSync(new URL(`../messages/v.${locale}.json`, import.meta.url), "utf8")).upgrade;
  const ko = load("ko"); const en = load("en"); const zh = load("zh");
  assert.deepEqual(Object.keys(en).sort(), Object.keys(ko).sort());
  assert.deepEqual(Object.keys(zh).sort(), Object.keys(ko).sort());
  assert.equal(ko.title, "업그레이드");
  assert.equal(ko.again, "한 번 더 업그레이드");
  assert.equal(ko.verify, "결과 검증");
  assert.equal(ko.lostTitle, "업그레이드에 실패했습니다");
  assert.equal(ko.lostDesc, "건 상품은 사라졌습니다.");
  assert.equal(ko.lose, "실패하면 건 상품은 사라집니다.");
  for (const table of [ko, en, zh]) for (const [key, text] of Object.entries(table)) {
    // 느낌표, 물음표, 긴 줄표, 가운뎃점(문자는 번호로 적는다)
    assert.doesNotMatch(text, /[!?\uff01\uff1f\u2014\u2013\u00b7\u30fb\u2027\u2022]/, key);
    // 상품가의 옛 이름
    assert.doesNotMatch(text, /\ucc38\uace0\uac00|reference price|\u53c2\u8003\u4ef7/i, key);
  }
});
