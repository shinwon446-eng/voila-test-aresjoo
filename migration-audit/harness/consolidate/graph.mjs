// 통합 검증용 import 그래프. 읽기 전용. 인자: web 폴더 경로
import fs from "node:fs";
import path from "node:path";
const web = path.resolve(process.argv[2]);
const exts = [".tsx", ".ts", ".mjs", ".js"];
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", "out"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
function resolve(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(web, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null;
  const cands = [base, ...exts.map((e) => base + e), ...exts.map((e) => path.join(base, "index" + e))];
  for (const c of cands) if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  return null;
}
// 주석을 지운 뒤 import 문을 찾는다. type 전용은 따로 표시한다.
function strip(src) { return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1"); }
const reStatic = /(?:^|\n)\s*(import|export)\s+(type\s+)?([^"';]*?\sfrom\s+)?["']([^"']+)["']/g;
const reDyn = /import\(\s*[`"']([^`"']+)[`"']\s*\)/g;
function deps(file) {
  if (!/\.(tsx?|mjs|js)$/.test(file)) return [];
  const src = strip(fs.readFileSync(file, "utf8"));
  const out = [];
  for (const m of src.matchAll(reStatic)) out.push({ spec: m[4], typeOnly: !!m[2] });
  for (const m of src.matchAll(reDyn)) out.push({ spec: m[1], typeOnly: false });
  return out;
}
const rel = (f) => path.relative(web, f).split(path.sep).join("/");
const appFiles = walk(path.join(web, "app")).filter((f) => /\.(tsx|ts)$/.test(f));
const entries = [...appFiles, path.join(web, "i18n", "request.ts")].filter((f) => fs.existsSync(f));
// 진입점마다 닿는 집합
function reachFrom(starts) {
  const seen = new Set(); const stack = [...starts];
  while (stack.length) {
    const f = stack.pop(); if (seen.has(f)) continue; seen.add(f);
    for (const d of deps(f)) { if (d.typeOnly) continue; const r = resolve(f, d.spec); if (r) stack.push(r); }
  }
  return seen;
}
const all = reachFrom(entries);
const pkgUsers = (pkg) => {
  const files = [...walk(path.join(web, "app")), ...walk(path.join(web, "components")), ...walk(path.join(web, "lib")), ...walk(path.join(web, "stores")), ...walk(path.join(web, "i18n")), ...walk(path.join(web, "server")), ...walk(path.join(web, "src"))].filter((f) => /\.(tsx?|mjs|js)$/.test(f));
  return files.filter((f) => deps(f).some((d) => d.spec === pkg || d.spec.startsWith(pkg + "/")));
};
const src = [...walk(path.join(web, "app")), ...walk(path.join(web, "components")), ...walk(path.join(web, "lib")), ...walk(path.join(web, "stores")), ...walk(path.join(web, "i18n")), ...walk(path.join(web, "server")), ...walk(path.join(web, "src"))].filter((f) => /\.(tsx?)$/.test(f) && !/\.test\./.test(f));
console.log("TS/TSX 파일", src.length, "닿음", src.filter((f) => all.has(f)).length, "닿지 않음", src.filter((f) => !all.has(f)).length);
const comp = src.filter((f) => rel(f).startsWith("components/"));
console.log("components 파일", comp.length, "닿음", comp.filter((f) => all.has(f)).length, "닿지 않음", comp.filter((f) => !all.has(f)).length);
for (const pkg of ["framer-motion", "canvas-confetti", "lucide-react", "qrcode.react"]) {
  const u = pkgUsers(pkg);
  console.log("\n== " + pkg + " 를 가져오는 파일 " + u.length + " (닿음 " + u.filter((f) => all.has(f)).length + ")");
  for (const f of u.sort()) console.log("  " + (all.has(f) ? "닿음    " : "닿지않음") + "  " + rel(f));
}
// 라우트 파일마다 framer-motion 사용자에 닿는지
const fm = new Set(pkgUsers("framer-motion"));
console.log("\n== 라우트 진입 파일별 framer-motion 사용자");
for (const e of entries.sort()) {
  const s = reachFrom([e]);
  const hit = [...s].filter((f) => fm.has(f)).map(rel);
  console.log("  " + rel(e) + "  -> " + (hit.join(", ") || "없음") + "  (닿는 파일 " + s.size + ")");
}
if (process.argv[3] === "dead") { console.log("\n== 닿지 않는 파일"); for (const f of src.filter((f) => !all.has(f)).map(rel).sort()) console.log("  " + f); }
if (process.argv[3] === "live") { console.log("\n== 닿는 파일"); for (const f of src.filter((f) => all.has(f)).map(rel).sort()) console.log("  " + f); }
