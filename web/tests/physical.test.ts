// 실물 전용 확률 배정(2026-10-12 파운더: 결과는 전부 실물, USDT 결과와 터짐 게이지 없음)
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import type { BoxSpec, ItemSpec } from "../lib/catalogTypes";
import { BOXES, LADDER, LOW_SPLIT, PHYSICAL_ODDS_VERSION, TARGET_RETAIL_RTP, cashReturn, isLadderBox, oddsVersionOf, retailReturn, scheduledBox } from "../lib/products";
import { REFUND_RATE } from "../lib/types";
import { BURST } from "../lib/burst";

/** 값의 배수들로 상품 100개짜리 박스를 만든다 */
function sample(price: number, multiples: number[]): BoxSpec {
  const items: ItemSpec[] = multiples.map((m, i) => [`t-${i}`, `상품 ${i}`, `Item ${i}`, `商品 ${i}`, +(price * m).toFixed(2), "physical"]);
  return { slug: "t-box-" + price, title: "시험 박스", titleEn: "Test Box", titleZh: "测试盒", category: "car", badge: "", tagline: "", taglineEn: "", taglineZh: "", price, releasedAt: "2026-10-12", popularity: 0, items, scheme: "physical" };
}
const spread = (from: number, to: number, n: number) => Array.from({ length: n }, (_, i) => +(from * (to / from) ** (i / Math.max(1, n - 1))).toFixed(3));
const FULL = [...spread(0.26, 0.48, 16), ...spread(0.5, 0.98, 14), ...spread(1, 1.45, 12), ...spread(1.5, 2.9, 14), ...spread(3, 5.8, 12), ...spread(6, 11.5, 10), ...spread(12, 24, 8), ...spread(25, 58, 6), ...spread(60, 140, 4), ...spread(150, 380, 2), ...spread(400, 900, 2)];

test("실물 전용: 백만 칸을 정확히 쓰고 참고가 기준 기대 비율이 99%다", () => {
  for (const price of [20, 50, 100, 250, 500]) {
    const box = scheduledBox(sample(price, FULL));
    assert.equal(box.items.length, 100);
    const slots = box.items.reduce((sum, i) => sum + Math.round(i.dropRate * 10_000), 0);
    assert.equal(slots, 1_000_000, `${price}: 칸 수 ${slots}`);
    assert.ok(Math.abs(retailReturn(box) - TARGET_RETAIL_RTP) < 0.0005, `${price}: 참고가 기준 ${retailReturn(box)}`);
    assert.ok(box.items.every((i) => Math.round(i.dropRate * 10_000) >= 1), "칸이 없는 상품이 있다");
  }
});

test("실물 전용: USDT 결과도 터짐도 없고, 전부 USDT 로 바꾸면 참고가 기준의 95%다", () => {
  const box = scheduledBox(sample(100, FULL));
  assert.ok(box.items.every((i) => i.kind === "physical"));
  assert.ok(!box.items.some((i) => i.id === BURST.id));
  assert.ok(Math.abs(cashReturn(box) - retailReturn(box) * REFUND_RATE) < 0.0005, `${cashReturn(box)}`);
  assert.equal(isLadderBox(box), false);
  assert.equal(oddsVersionOf(box), PHYSICAL_ODDS_VERSION);
  assert.equal(box.guaranteedMin, Math.min(...box.items.map((i) => i.value)));
});

test("실물 전용: 낸 값 이상이 나올 확률은 사다리의 목표와 가깝고, 구간 안에서는 싼 상품이 더 자주 나온다", () => {
  const box = scheduledBox(sample(100, FULL));
  const win = box.items.filter((i) => i.value >= box.price).reduce((sum, i) => sum + i.dropRate, 0);
  const target = LADDER.reduce((sum, band) => sum + band.slots, 0) / 10_000;
  assert.ok(win > target * 0.5 && win < target * 1.6, `당첨 ${win}%, 목표 ${target}%`);
  const lowA = box.items.filter((i) => i.value < box.price * LOW_SPLIT).sort((a, b) => a.value - b.value);
  assert.ok(lowA[0].dropRate >= lowA[lowA.length - 1].dropRate, "가장 싼 상품이 가장 비싼 낮은 상품보다 드물다");
});

test("실물 전용: 높은 구간이 빈 박스도 99%를 맞춘다(빈 구간을 USDT 로 메우지 않는다)", () => {
  const short = [...spread(0.26, 0.48, 20), ...spread(0.5, 0.98, 20), ...spread(1, 1.45, 16), ...spread(1.5, 2.9, 16), ...spread(3, 5.8, 14), ...spread(6, 11.5, 8), ...spread(12, 20, 6)];
  const box = scheduledBox(sample(50, short));
  assert.ok(Math.abs(retailReturn(box) - TARGET_RETAIL_RTP) < 0.0005, `${retailReturn(box)}`);
  assert.ok(box.items.every((i) => i.kind === "physical"));
});

test("실물 전용: 낮은 구간이 한쪽뿐이거나 USDT 상품이 섞이면 거부한다", () => {
  const noLow = FULL.filter((m) => m >= 0.5);
  assert.throws(() => scheduledBox(sample(100, [...noLow, ...spread(1, 1.4, 100 - noLow.length)])));
  const withCash = sample(100, FULL);
  withCash.items[0] = [withCash.items[0][0], "현금", "Cash", "现金", 30, "cash"];
  assert.throws(() => scheduledBox(withCash));
});

test("새 카탈로그의 박스는 전부 실물 전용이고 상품이 100개다", () => {
  for (const box of BOXES.filter((b) => !isLadderBox(b))) {
    assert.equal(box.items.length, 100, box.slug);
    assert.ok(Math.abs(retailReturn(box) - TARGET_RETAIL_RTP) < 0.0005, `${box.slug}: ${retailReturn(box)}`);
    assert.ok(box.price >= 20, `${box.slug}: 가격 ${box.price}`);
  }
});
