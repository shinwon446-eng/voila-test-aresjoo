// 이 파일의 BOXES 는 옛 박스(사다리 방식)만이다. 새 카탈로그의 박스(실물 전용)는 tests/physical.test.ts 가 본다
import test from "node:test";
import assert from "node:assert/strict";
import {
  AUTHENTICITY_COMPENSATION_MULTIPLE,
  BOX_COUNT,
  CATEGORY_COUNT,
  GIFT_BOX_ASSUMED_REFUND_RATE,
  INSTANT_SELLBACK_RATE,
  MUTABLE_RESULTS,
  SHIPPING_SLA_HOURS,
  attemptsRange,
  effectiveAttempts,
  publishedOddsRows,
  rtpRangePct,
  totalJackpotValueUsdt,
} from "../lib/aboutStats";
import { LEGACY_BOXES as BOXES, dropTable, retailReturn } from "../lib/products";

test("잭팟 총액은 각 박스 최고 상품 가치의 합 — 지어낸 값이 아니다", () => {
  const manual = +BOXES.reduce((s, b) => s + dropTable(b)[0].value, 0).toFixed(2);
  assert.equal(totalJackpotValueUsdt(), manual);
  assert.ok(manual > 0);
});

test("공개 확률 줄 수 = 전 박스 구성품 수", () => {
  assert.equal(publishedOddsRows(), BOXES.reduce((s, b) => s + b.items.length, 0));
  assert.ok(publishedOddsRows() >= BOX_COUNT);
});

test("실질 도전 배수 = 1 / (1 − 환급률)", () => {
  assert.equal(effectiveAttempts(0.95), 20);
  assert.equal(effectiveAttempts(0.9), 10);
  assert.equal(effectiveAttempts(0.85), 6.7);
  // 사은품형(환급 거의 없음)은 사실상 1회
  assert.equal(effectiveAttempts(GIFT_BOX_ASSUMED_REFUND_RATE), 1);
  // 경계: 음수·1 이상·NaN 은 1 로 막는다(무한대 표기 방지)
  assert.equal(effectiveAttempts(1), 1);
  assert.equal(effectiveAttempts(1.5), 1);
  assert.equal(effectiveAttempts(-0.2), 1);
  assert.equal(effectiveAttempts(Number.NaN), 1);
});

test("도전 배수 범위는 실제 라인업의 최소 보장 환급률에서 나온다", () => {
  const r = attemptsRange();
  // 2026-10-11 사다리 표부터 가장 작은 결과는 낸 값의 0.05배다
  assert.equal(r.minRate, 5);
  assert.equal(r.maxRate, 5);
  assert.ok(r.min >= 1 && r.max >= r.min);
  assert.equal(r.max, effectiveAttempts(r.maxRate / 100));
});

test("RTP range reflects the current catalogue's retail expected values", () => {
  const { min, max } = rtpRangePct();
  const actual = BOXES.map(box => retailReturn(box) * 100);
  assert.equal(min, +Math.min(...actual).toFixed(1));
  assert.equal(max, +Math.max(...actual).toFixed(1));
  // 참고가 기준 값이다. 받는 값 기준 환수율은 99%이고 상품은 참고가의 95%로 받으므로 참고가 기준은 100%를 조금 넘는다(1/0.95 미만)
  assert.ok(min >= 93 && max < 100 / 0.95);
});

test("정책 상수 — 95% 즉시 회수 · 3배 보상 · 24시간 출고 기준 · 사후 변조 가능 결과 0", () => {
  assert.equal(INSTANT_SELLBACK_RATE, 0.95);
  assert.equal(AUTHENTICITY_COMPENSATION_MULTIPLE, 3);
  assert.equal(SHIPPING_SLA_HOURS, 24);
  assert.equal(MUTABLE_RESULTS, 0);
  assert.equal(CATEGORY_COUNT, 5);
});
