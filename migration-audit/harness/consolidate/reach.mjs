// 통합 담당의 도구 2: app/ 의 진입점에서 import 를 따라가 도달하는 파일과 도달하지 않는 파일을 가른다.
// 그리고 파일마다 JSX 의 on* 속성을 센다(주석 줄 제외). web/ 은 읽기만 한다.
//   node migration-audit/harness/consolidate/reach.mjs
// 출력: 같은 폴더의 reach.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(here, "../../../web");
const rel = (p) => path.relative(WEB, p).replace(/\\/g, "/");
const all = [];
const walk = (dir) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { if (["node_modules", ".next", "out", "tests", "scripts", "public"].includes(e.name)) continue; const p = path.join(dir, e.name); if (e.isDirectory()) walk(p); else if (/\.(tsx?|mjs)$/.test(e.name) && !/\.d\.ts$/.test(e.name)) all.push(p); } };
walk(WEB);
const exists = (p) => fs.existsSync(p) && fs.statSync(p).isFile();
const resolve = (from, spec) => {
  let base;
  if (spec.startsWith("@/")) base = path.join(WEB, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null;
  for (const c of [base, base + ".ts", base + ".tsx", path.join(base, "index.ts"), path.join(base, "index.tsx")]) if (exists(c)) return c;
  return null;
};
const importsOf = (file) => {
  const src = fs.readFileSync(file, "utf8");
  const out = [];
  // type 전용 import 는 런타임 그래프에서 뺀다
  const re = /(?:^|\n)\s*(import|export)\s+(type\s+)?([^;'"]*?from\s+)?["']([^"']+)["']|import\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
  let m;
  while ((m = re.exec(src))) {
    if (m[2]) continue;
    const spec = m[4] ?? m[5];
    if (!spec) continue;
    const r = resolve(file, spec);
    if (r) out.push(r);
  }
  return out;
};
const entries = all.filter((f) => rel(f).startsWith("app/") || rel(f) === "i18n/request.ts" || rel(f) === "middleware.ts");
const seen = new Set();
const stack = [...entries];
while (stack.length) { const f = stack.pop(); if (seen.has(f)) continue; seen.add(f); for (const d of importsOf(f)) if (!seen.has(d)) stack.push(d); }

const handlers = (file) => {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const hits = [];
  lines.forEach((L, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(L)) return;
    const re = /\b(on[A-Z][A-Za-z]*)=\{/g; let m;
    while ((m = re.exec(L))) hits.push({ line: i + 1, attr: m[1] });
  });
  return hits;
};
const comps = all.filter((f) => /^(components|lib|stores)\//.test(rel(f)));
const importers = {};
for (const f of all) for (const d of importsOf(f)) (importers[rel(d)] ??= []).push(rel(f));
const out = { reachable: [], unreachable: [], importers: {} };
for (const f of comps) {
  const h = /\.tsx$/.test(f) ? handlers(f) : [];
  (seen.has(f) ? out.reachable : out.unreachable).push({ file: rel(f), handlers: h.length, byAttr: h.reduce((a, x) => { (a[x.attr] ??= []).push(x.line); return a; }, {}) });
}
for (const x of out.unreachable) out.importers[x.file] = importers[x.file] ?? [];
fs.writeFileSync(path.join(here, "reach.json"), JSON.stringify(out, null, 1));
const un = out.unreachable.filter((x) => x.file.startsWith("components/"));
console.log("entries", entries.length, "reachable", out.reachable.length, "unreachable", out.unreachable.length, "unreachable components", un.length, "handlers in unreachable components", un.reduce((n, x) => n + x.handlers, 0));
console.log(un.map((x) => x.file.replace("components/", "") + ":" + x.handlers).join(" "));
console.log("unreachable lib/stores:", out.unreachable.filter((x) => !x.file.startsWith("components/")).map((x) => x.file).join(" "));
