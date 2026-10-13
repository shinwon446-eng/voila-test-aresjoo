// 전체 박스의 순서(lib/boxOrder)와 따로 정한 얼굴(lib/products 의 FACE_PICK). flow/RESTORE_SPEC.md W1, W2.
import test from "node:test";
import assert from "node:assert/strict";
import { HOME_BOXES, faceOf } from "../lib/products";
import { PRICE_WAVE, RECENT_MAX, SHOWCASE, boxOrder, showcaseOf } from "../lib/boxOrder";

const slugs = (list: { slug: string }[]) => list.map((b) => b.slug);
const bySlug = new Map(HOME_BOXES.map((b) => [b.slug, b] as const));
const hasPhoto = (slug: string) => Boolean(faceOf(bySlug.get(slug)!)?.image.src);
const moved = (a: { slug: string }[], b: { slug: string }[], n: number) => a.slice(0, n).filter((x, i) => x.slug !== b[i].slug).length;

test("박스를 빠뜨리거나 두 번 넣지 않고, 같은 입력이면 같은 순서다", () => {
  const a = boxOrder(HOME_BOXES);
  assert.equal(a.length, HOME_BOXES.length);
  assert.equal(new Set(slugs(a)).size, HOME_BOXES.length);
  assert.deepEqual(slugs(boxOrder([...HOME_BOXES].reverse())), slugs(a), "들어온 차례가 달라도 같다");
});

test("전시 점수에 적힌 번호는 전부 실제로 있는 박스이고 대표 사진이 있다", () => {
  for (const slug of Object.keys(SHOWCASE)) {
    assert.ok(bySlug.has(slug), slug + " 없는 박스");
    assert.ok(hasPhoto(slug), slug + " 대표 사진 없음");
  }
});

test("처음 스물네 칸의 값은 물결을 따른다: 첫 두 칸은 50 과 100 달러, 여덟째 칸마다 가장 비싼 박스", () => {
  const first = boxOrder(HOME_BOXES).slice(0, PRICE_WAVE.length * 3);
  assert.deepEqual(first.map((b) => b.price), [...PRICE_WAVE, ...PRICE_WAVE, ...PRICE_WAVE]);
});

test("처음 스물네 칸은 전부 전시 점수가 적힌 박스다(낯선 대표 사진이 첫 화면에 오지 않는다)", () => {
  for (const box of boxOrder(HOME_BOXES).slice(0, 24)) assert.ok(SHOWCASE[box.slug] !== undefined, box.slug);
});

test("사진이 없는 박스는 사진이 있는 박스가 다 나온 뒤에 온다", () => {
  const order = slugs(boxOrder(HOME_BOXES));
  const firstBare = order.findIndex((s) => !hasPhoto(s));
  if (firstBare < 0) return;
  assert.ok(order.slice(firstBare).every((s) => !hasPhoto(s)), "사진 없는 박스 뒤에 사진 있는 박스가 없다");
});

test("처음 48칸에는 같은 카테고리가 붙어 나오지 않는다", () => {
  const first = boxOrder(HOME_BOXES).slice(0, 48);
  for (let i = 1; i < first.length; i++) assert.notEqual(first[i].category, first[i - 1].category, i + 1 + "번째 칸");
});

test("최근에 직접 연 박스가 맨 앞에 둘까지 새것부터 오고, 그 뒤의 칸이 같은 카테고리로 이어지지 않는다", () => {
  const picks = HOME_BOXES.filter((b) => hasPhoto(b.slug)).slice(40, 45);
  const opened = new Map(picks.map((b, i) => [b.slug, 1000 + i] as const));
  const order = boxOrder(HOME_BOXES, { opened });
  assert.deepEqual(slugs(order.slice(0, RECENT_MAX)), slugs([...picks].reverse().slice(0, RECENT_MAX)));
  assert.equal(new Set(slugs(order)).size, HOME_BOXES.length, "앞으로 온 박스가 뒤에 또 나오지 않는다");
  const one = boxOrder(HOME_BOXES, { opened: new Map([["gaming-playstation", 1]]) });
  assert.equal(one[0].slug, "gaming-playstation");
  assert.notEqual(one[1].category, "gaming", "플레이스테이션 바로 뒤에 또 게임 박스가 오지 않는다");
});

test("사진이 없는 박스는 최근에 열었어도 맨 앞에 오지 않는다", () => {
  const bare = HOME_BOXES.find((b) => !hasPhoto(b.slug));
  if (!bare) return;
  const order = boxOrder(HOME_BOXES, { opened: new Map([[bare.slug, 1]]) });
  assert.ok(hasPhoto(order[0].slug));
  assert.deepEqual(slugs(order), slugs(boxOrder(HOME_BOXES)));
});

test("잔액이 있으면 여덟 칸 가운데 일곱 칸은 열 수 있는 박스이고, 여덟째 칸은 가장 비싼 값 그대로다", () => {
  const order = boxOrder(HOME_BOXES, { balance: 60 });
  const first = order.slice(0, PRICE_WAVE.length);
  first.slice(0, PRICE_WAVE.length - 1).forEach((b, i) => assert.ok(b.price <= 60, i + 1 + "번째 칸 $" + b.price));
  assert.equal(first[PRICE_WAVE.length - 1].price, 500, "여덟째 칸");
  assert.deepEqual(slugs(boxOrder(HOME_BOXES, { balance: 0 })), slugs(boxOrder(HOME_BOXES)), "잔액이 0 이면 순서를 바꾸지 않는다");
  assert.deepEqual(slugs(boxOrder(HOME_BOXES, { balance: 100000 })), slugs(boxOrder(HOME_BOXES)), "다 열 수 있으면 순서를 바꾸지 않는다");
});

test("잔액이 값의 경계를 넘지 않으면 순서가 바뀌지 않는다(49.99 와 20, 99 와 50)", () => {
  assert.equal(moved(boxOrder(HOME_BOXES, { balance: 49.99 }), boxOrder(HOME_BOXES, { balance: 20 }), 24), 0);
  assert.equal(moved(boxOrder(HOME_BOXES, { balance: 99 }), boxOrder(HOME_BOXES, { balance: 50 }), 24), 0);
});

test("분류 하나만 넘기면 물결 없이 전시 점수가 높은 박스부터 온다", () => {
  const watches = HOME_BOXES.filter((b) => b.category === "watch");
  const order = boxOrder(watches);
  assert.equal(order.length, watches.length);
  assert.equal(order[0].slug, "watch-rolex");
  const cars = boxOrder(HOME_BOXES.filter((b) => b.category === "car"));
  assert.ok(showcaseOf(cars[0]) >= showcaseOf(cars[1]));
  assert.ok(SHOWCASE[cars[0].slug] !== undefined, "자동차의 첫 칸은 전시 점수가 적힌 박스");
});

test("따로 정한 얼굴은 그 박스의 자기 상품이고 사진이 있다", async () => {
  const { FACE_PICK } = await import("../lib/products");
  for (const [slug, itemId] of Object.entries(FACE_PICK)) {
    const box = bySlug.get(slug);
    assert.ok(box, slug + " 없는 박스");
    const face = faceOf(box);
    assert.equal(face?.id, itemId, slug);
    assert.ok(face?.image.src, slug + " 사진 없음");
  }
});
