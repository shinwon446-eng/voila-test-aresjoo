// AGY 측정 결과 요약. 읽기 전용. 인자: harness/agy 폴더
import fs from "node:fs";
import path from "node:path";
const dir = process.argv[2];
const read = (n) => JSON.parse(fs.readFileSync(path.join(dir, n), "utf8"));
const shape = (v, depth = 0) => {
  if (Array.isArray(v)) return "[" + v.length + "] of " + (v.length ? shape(v[0], depth + 1) : "?");
  if (v && typeof v === "object") { const keys = Object.keys(v); return depth > 2 ? "{" + keys.length + " keys}" : "{" + keys.slice(0, 40).map((k) => k + ": " + (depth > 1 ? typeof v[k] : shape(v[k], depth + 1))).join(", ") + "}"; }
  return typeof v === "string" ? JSON.stringify(v.slice(0, 60)) : String(v);
};
const routes = read("routes-result.json");
console.log("== routes-result 모양\n" + shape(routes).slice(0, 1800));
const rows = Array.isArray(routes) ? routes : routes.results || routes.routes || routes.entries || Object.values(routes).find(Array.isArray) || [];
console.log("행 수", rows.length);
const uniq = (k) => [...new Set(rows.map((r) => (typeof k === "function" ? k(r) : r[k])))];
for (const k of Object.keys(rows[0] || {})) { const u = uniq(k); if (u.length <= 40 && u.every((x) => typeof x !== "object" || x === null)) console.log("  " + k + " (" + u.length + "): " + u.join(" | ").slice(0, 900)); }
console.log("첫 행:\n" + JSON.stringify(rows[0], null, 1).slice(0, 2500));
