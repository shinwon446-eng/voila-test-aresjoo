// 박스의 자기 상품(items)에 그 카테고리의 공통 상품을 골라 붙여 100개를 채운다(use 를 다시 쓴다).
//   node scripts/catalog2/fill.mjs car                 그 카테고리의 박스 전부
//   node scripts/catalog2/fill.mjs --box car-rolls-royce
// 고르는 방법은 정해져 있다(같은 자료면 같은 결과). 가격 구간마다 목표 수가 있고, 자기 상품으로 모자란 만큼만 공통 상품에서 가져온다.
// 박스마다 공통 상품을 고르기 시작하는 자리를 달리해, 같은 카테고리의 박스들이 같은 소품만 갖지 않게 한다.
// 공통 상품 가운데 그 박스의 자기 상품과 영어 이름이 같은 것은 가져오지 않는다.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RULES, loadPool } from "./build-index.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "lib", "catalog2");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, ""));
// 구간: 낮은 A(절반 미만), 낮은 B(절반 이상 가격 미만), 그리고 사다리 아홉 구간. 뒤의 숫자는 100개 가운데 목표 수
const BUCKETS = [[RULES.floorRatio, 0.5, 16], [0.5, 1, 14], [1, 1.5, 12], [1.5, 3, 14], [3, 6, 12], [6, 12, 10], [12, 25, 8], [25, 60, 6], [60, 150, 4], [150, 400, 2], [400, Infinity, 2]];
const bucketOf = (value, price) => BUCKETS.findIndex(([from, to]) => value / price >= from && value / price < to);

function fill(entry, order, pool) {
  const file = path.join(root, "data", entry.category, entry.slug + ".json");
  if (!fs.existsSync(file)) return null;
  const box = readJson(file);
  const listed = Array.isArray(box.items) ? box.items : [];
  // 박스 가격의 10분의 1보다 싼 자기 상품은 세지 않는다(검사와 같은 기준). 파일에는 그대로 둔다
  const floor = Math.max(RULES.minValue, entry.price * RULES.floorRatio);
  const own = listed.filter((t) => t[4] >= floor - 1e-9);
  if (own.length > RULES.size) return `${entry.slug}: 자기 상품이 ${RULES.size}개를 넘는다 (${own.length})`;
  const P = entry.price;
  const ownNames = new Set(own.map((t) => String(t[2]).toLowerCase()));
  const have = BUCKETS.map(() => 0);
  for (const t of own) { const k = bucketOf(t[4], P); if (k >= 0) have[k]++; }
  // 구간마다 고를 수 있는 공통 상품(값 순서). 박스마다 시작 자리를 달리한다
  const shelf = BUCKETS.map((_, k) => {
    const list = pool.filter((t) => t[4] >= floor - 1e-9 && bucketOf(t[4], P) === k && !ownNames.has(String(t[2]).toLowerCase())).sort((a, b) => a[4] - b[4] || a[0].localeCompare(b[0]));
    const start = list.length ? (order * 7) % list.length : 0;
    return [...list.slice(start), ...list.slice(0, start)];
  });
  const take = BUCKETS.map(([, , target], k) => Math.min(shelf[k].length, Math.max(0, target - have[k])));
  const total = () => own.length + take.reduce((x, y) => x + y, 0);
  // 모자라면 남은 공통 상품이 있는 구간에서 더 가져온다(낮은 당첨 구간부터 돌아가며)
  const order1 = [2, 3, 4, 5, 1, 0, 6, 7, 8, 9, 10];
  for (let guard = 0; total() < RULES.size && guard < 2000; guard++) {
    const open = order1.filter((i) => take[i] < shelf[i].length);
    if (!open.length) break;
    // 지금 가장 적게 가져온 구간에 하나 더(같으면 order1 의 앞쪽)
    const least = Math.min(...open.map((i) => have[i] + take[i]));
    take[open.find((i) => have[i] + take[i] === least)]++;
  }
  // 넘치면 많이 가져온 구간부터 덜어 낸다(낮은 구간의 최소 수는 지킨다)
  const keep = (k) => (k === 0 ? Math.max(0, RULES.minLowA - have[0]) : k === 1 ? Math.max(0, RULES.minLowB - have[1]) : 0);
  for (let guard = 0; total() > RULES.size && guard < 2000; guard++) {
    const candidates = take.map((n, k) => [n - keep(k), k]).filter(([spare]) => spare > 0).sort((a, b) => b[0] - a[0]);
    if (!candidates.length) break;
    take[candidates[0][1]]--;
  }
  const use = take.flatMap((n, k) => shelf[k].slice(0, n).map((t) => t[0]));
  fs.writeFileSync(file, JSON.stringify({ slug: entry.slug, items: listed, use }, null, 1) + "\n");
  return total() === RULES.size ? null : `${entry.slug}: 100개를 못 채웠다 (${total()}). 공통 상품이 모자라다`;
}

const args = process.argv.slice(2);
const manifest = readJson(path.join(root, "manifest.json"));
const only = args[0] === "--box" ? args[1] : null;
const targets = manifest.filter((m) => (only ? m.slug === only : m.category === args[0]));
if (!targets.length) { console.log("대상이 없다. 카테고리 이름이나 --box <slug> 를 준다"); process.exit(1); }
const pools = new Map();
let problems = 0;
for (const entry of targets) {
  if (!pools.has(entry.category)) pools.set(entry.category, loadPool(entry.category));
  const pool = pools.get(entry.category);
  if (pool.errors.length) { console.log(`[${entry.category}] 공통 상품에 문제가 있어 채우지 않는다: ${pool.errors[0]}`); problems++; break; }
  const order = manifest.filter((m) => m.category === entry.category).findIndex((m) => m.slug === entry.slug);
  const message = fill(entry, order, pool.items);
  if (message) { console.log(message); problems++; }
}
console.log(problems ? `문제 ${problems}` : `채움 ${targets.length}`);
