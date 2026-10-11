// 새 카탈로그(lib/catalog2/data)의 박스 파일을 검사하고, 통과한 것만 lib/catalog2/generated.json 한 파일로 묶는다.
// 통과하지 못한 박스는 앱에 들어가지 않는다(만드는 중인 자료가 사이트를 깨지 않게).
//   node scripts/catalog2/build-index.mjs            전부 검사하고 묶는다
//   node scripts/catalog2/build-index.mjs car        그 카테고리만 검사 결과를 자세히 본다(묶지는 않는다)
//   node scripts/catalog2/build-index.mjs --box car-rolls-royce   그 박스 하나만 본다(묶지는 않는다)
//
// 자료의 모양
//   lib/catalog2/manifest.json            박스 320개의 이름, 가격, 카테고리(고치지 않는다)
//   lib/catalog2/data/<category>/pool.json   { "items": [[id, ko, en, zh, value], ...] }  그 카테고리의 공통 상품(다른 브랜드 상품과 사이드 소품)
//   lib/catalog2/data/<category>/<slug>.json { "slug": "...", "items": [[id, ko, en, zh, value], ...], "use": ["pool id", ...] }
//
// 박스 하나의 규칙(파운더 결정 2026-10-12: 박스마다 100개, 전부 실물, 본품이 모자라면 다른 브랜드 상품과 사이드 소품으로 채운다)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "lib", "catalog2");
const dataDir = path.join(root, "data");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, ""));

export const RULES = {
  size: 100,          // 박스 하나의 상품 수(자기 상품 + 공통 상품)
  minOwn: 15,         // 그 브랜드의 상품(본품과 브랜드 소품)은 적어도 이만큼
  minValue: 5,        // 가장 싼 실물(달러). 이보다 싸면 보내는 값이 상품보다 비싸다
  minLowA: 10,        // 박스 가격의 절반 미만
  minLowB: 10,        // 절반 이상, 박스 가격 미만
  minWin: 45,         // 박스 가격 이상
  minTopTimes: 15,    // 가장 값진 상품은 박스 가격의 이 배수 이상
  minBands: 5,        // 박스 가격 이상인 상품이 걸치는 구간 수
};
const BANDS = [[1, 1.5], [1.5, 3], [3, 6], [6, 12], [12, 25], [25, 60], [60, 150], [150, 400], [400, Infinity]];
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function checkTuple(t, where, errors) {
  if (!Array.isArray(t) || t.length !== 5) { errors.push(`${where}: 다섯 칸이 아니다`); return false; }
  const [id, ko, en, zh, value] = t;
  if (typeof id !== "string" || !ID.test(id) || id.length > 64) errors.push(`${where}: 번호가 규칙에 안 맞는다 (${id})`);
  for (const [label, name] of [["ko", ko], ["en", en], ["zh", zh]]) if (typeof name !== "string" || name.trim().length < 2) errors.push(`${where} ${id}: ${label} 이름이 비었다`);
  if (typeof value !== "number" || !Number.isFinite(value) || value < RULES.minValue || Math.abs(value * 100 - Math.round(value * 100)) > 1e-6) errors.push(`${where} ${id}: 값이 ${RULES.minValue} 이상의 센트 단위 숫자가 아니다 (${value})`);
  return true;
}

export function loadPool(category) {
  const file = path.join(dataDir, category, "pool.json");
  const errors = [];
  if (!fs.existsSync(file)) return { items: [], errors: ["pool.json 이 없다"] };
  let pool;
  try { pool = readJson(file); } catch (e) { return { items: [], errors: ["pool.json 을 읽을 수 없다: " + e.message] }; }
  const items = Array.isArray(pool.items) ? pool.items : [];
  const seen = new Set();
  for (const t of items) {
    if (!checkTuple(t, "pool", errors)) continue;
    if (!t[0].startsWith(category + "-p-")) errors.push(`pool ${t[0]}: 번호는 ${category}-p- 로 시작한다`);
    if (seen.has(t[0])) errors.push(`pool ${t[0]}: 번호가 겹친다`);
    seen.add(t[0]);
  }
  return { items, errors };
}

export function checkBox(entry, pool) {
  const file = path.join(dataDir, entry.category, entry.slug + ".json");
  const errors = [];
  if (!fs.existsSync(file)) return { ok: false, missing: true, errors: ["파일이 없다"] };
  let box;
  try { box = readJson(file); } catch (e) { return { ok: false, errors: ["읽을 수 없다: " + e.message] }; }
  if (box.slug !== entry.slug) errors.push(`slug 가 ${entry.slug} 이 아니다`);
  const own = Array.isArray(box.items) ? box.items : [];
  const use = Array.isArray(box.use) ? box.use : [];
  const byId = new Map(pool.items.map((t) => [t[0], t]));
  const resolved = [];
  const seen = new Set();
  const names = new Set();
  for (const t of own) {
    if (!checkTuple(t, "items", errors)) continue;
    if (!t[0].startsWith(entry.slug + "-")) errors.push(`${t[0]}: 번호는 ${entry.slug}- 로 시작한다`);
    if (seen.has(t[0])) errors.push(`${t[0]}: 번호가 겹친다`);
    if (names.has(t[2].toLowerCase())) errors.push(`${t[0]}: 영어 이름이 겹친다 (${t[2]})`);
    seen.add(t[0]); names.add(String(t[2]).toLowerCase()); resolved.push(t);
  }
  for (const id of use) {
    const t = byId.get(id);
    if (!t) { errors.push(`use ${id}: 공통 상품에 없다`); continue; }
    if (seen.has(id)) errors.push(`use ${id}: 겹친다`);
    seen.add(id); resolved.push(t);
  }
  const P = entry.price;
  const lowA = resolved.filter((t) => t[4] < P * 0.5).length;
  const lowB = resolved.filter((t) => t[4] >= P * 0.5 && t[4] < P).length;
  const win = resolved.filter((t) => t[4] >= P);
  const bands = new Set(win.map((t) => BANDS.findIndex(([from, to]) => t[4] / P >= from && t[4] / P < to)));
  const top = Math.max(0, ...resolved.map((t) => t[4]));
  if (resolved.length !== RULES.size) errors.push(`상품이 ${RULES.size}개가 아니다 (${resolved.length}: 자기 ${own.length} + 공통 ${use.length})`);
  if (own.length < RULES.minOwn) errors.push(`자기 상품이 ${RULES.minOwn}개 미만이다 (${own.length})`);
  if (lowA < RULES.minLowA) errors.push(`가격의 절반 미만 상품이 ${RULES.minLowA}개 미만이다 (${lowA})`);
  if (lowB < RULES.minLowB) errors.push(`가격의 절반 이상 가격 미만 상품이 ${RULES.minLowB}개 미만이다 (${lowB})`);
  if (win.length < RULES.minWin) errors.push(`가격 이상 상품이 ${RULES.minWin}개 미만이다 (${win.length})`);
  if (bands.size < RULES.minBands) errors.push(`가격 이상 상품이 걸친 구간이 ${RULES.minBands}개 미만이다 (${bands.size})`);
  if (top < P * RULES.minTopTimes) errors.push(`가장 값진 상품이 가격의 ${RULES.minTopTimes}배 미만이다 (${top})`);
  return { ok: errors.length === 0, errors, box: { slug: entry.slug, items: own, use }, stats: { own: own.length, use: use.length, lowA, lowB, win: win.length, bands: bands.size, top } };
}

function main() {
  const args = process.argv.slice(2);
  const manifest = readJson(path.join(root, "manifest.json"));
  const only = args[0] === "--box" ? args[1] : null;
  const category = !only && args[0] ? args[0] : null;
  const verbose = Boolean(only || category);
  const pools = {};
  const boxes = [];
  const report = { ok: 0, bad: 0, missing: 0 };
  const categories = [...new Set(manifest.map((m) => m.category))].filter((c) => (only ? manifest.find((m) => m.slug === only)?.category === c : !category || c === category));
  for (const c of categories) {
    const pool = loadPool(c);
    if (pool.errors.length) { console.log(`[${c}] 공통 상품: 문제 ${pool.errors.length}`); for (const e of pool.errors.slice(0, verbose ? 60 : 3)) console.log("   " + e); }
    else if (verbose) console.log(`[${c}] 공통 상품 ${pool.items.length}개`);
    const poolOk = pool.errors.length === 0;
    if (poolOk) pools[c] = pool.items;
    for (const entry of manifest.filter((m) => m.category === c && (!only || m.slug === only))) {
      const result = checkBox(entry, pool);
      if (result.missing) { report.missing++; if (verbose) console.log(`  ${entry.slug}: 아직 없다`); continue; }
      if (result.ok && poolOk) { report.ok++; boxes.push({ slug: entry.slug, category: entry.category, brand: entry.brand, title: entry.title, titleEn: entry.titleEn, titleZh: entry.titleZh, price: entry.price, order: manifest.indexOf(entry), items: result.box.items, use: result.box.use }); if (verbose) console.log(`  ${entry.slug}: 통과 ${JSON.stringify(result.stats)}`); }
      else { report.bad++; console.log(`  ${entry.slug}: 문제 ${result.errors.length}${poolOk ? "" : " (공통 상품에 문제가 있다)"}`); for (const e of result.errors.slice(0, verbose ? 40 : 4)) console.log("     " + e); }
    }
  }
  console.log(`통과 ${report.ok}, 문제 ${report.bad}, 아직 없음 ${report.missing}`);
  if (verbose) return;
  // 쓰이는 공통 상품만 싣는다
  const used = new Set(boxes.flatMap((b) => b.use));
  const slim = Object.fromEntries(Object.entries(pools).map(([c, items]) => [c, items.filter((t) => used.has(t[0]))]));
  fs.writeFileSync(path.join(root, "generated.json"), JSON.stringify({ pools: slim, boxes }) + "\n");
  console.log(`generated.json: 박스 ${boxes.length}개, 공통 상품 ${Object.values(slim).reduce((n, list) => n + list.length, 0)}개`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
