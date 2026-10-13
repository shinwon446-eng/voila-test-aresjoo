// 가져오기 그래프: web/app 의 라우트 파일에서 출발해 닿는 파일을 센다. 읽기 전용.
import fs from "node:fs";
import path from "node:path";
const web = path.resolve(process.argv[2] || "web");
const exts = [".tsx", ".ts", ".mjs", ".js", ".json", ".css"];
function walk(dir, out = []) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { if (e.name === "node_modules" || e.name === ".next" || e.name === "out") continue; const p = path.join(dir, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; }
function resolve(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(web, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null;
  const cands = [base, ...exts.map((e) => base + e), ...exts.map((e) => path.join(base, "index" + e))];
  for (const c of cands) if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  return null;
}
const importRe = /(?:import|export)\s+(?:[^"';]*?\s+from\s+)?["']([^"']+)["']|import\(\s*[`"']([^`"']+)[`"']\s*\)|@import\s+["']([^"']+)["']/g;
function deps(file) {
  if (!/\.(tsx?|mjs|js|css)$/.test(file)) return [];
  const src = fs.readFileSync(file, "utf8");
  const out = [];
  for (const m of src.matchAll(importRe)) { const r = resolve(file, m[1] || m[2] || m[3]); if (r) out.push(r); }
  return out;
}
const entries = walk(path.join(web, "app")).filter((f) => /\.(tsx|ts)$/.test(f));
const seen = new Set(); const parents = new Map();
const stack = [...entries];
while (stack.length) { const f = stack.pop(); if (seen.has(f)) continue; seen.add(f); for (const d of deps(f)) { if (!parents.has(d)) parents.set(d, new Set()); parents.get(d).add(f); stack.push(d); } }
const rel = (f) => path.relative(web, f).split(path.sep).join("/");
const all = [...walk(path.join(web, "components")), ...walk(path.join(web, "lib")), ...walk(path.join(web, "stores")), ...walk(path.join(web, "app")).filter((f) => f.endsWith(".css"))].filter((f) => /\.(tsx?|css)$/.test(f) && !/\.test\./.test(f));
const reach = all.filter((f) => seen.has(f)).map(rel).sort();
const dead = all.filter((f) => !seen.has(f)).map(rel).sort();
// 닿지 않는 파일을 누가 가져오는지(닿지 않는 것끼리만 서로 부르는지) 본다
const allParents = new Map();
for (const f of all) for (const d of deps(f)) { if (!allParents.has(d)) allParents.set(d, new Set()); allParents.get(d).add(f); }
console.log("REACHABLE", reach.length); for (const f of reach) console.log("  " + f + "  <- " + [...(parents.get(path.join(web, f)) || [])].map(rel).slice(0, 4).join(", "));
console.log("UNREACHABLE", dead.length); for (const f of dead) console.log("  " + f + "  <- " + ([...(allParents.get(path.join(web, f)) || [])].map(rel).join(", ") || "(아무도 가져오지 않음)"));
