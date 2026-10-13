// 통합 담당의 도구 1: 세 분석 문서를 읽어 구조화한다. web/ 은 읽기만 한다.
//   node migration-audit/harness/consolidate/parse.mjs
// 출력: 같은 폴더의 parsed.json (CL 인터랙션 행, CL 상태 사례, CX 색인, 인용 줄의 원문 대조)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "../../..");
const WEB = path.join(REPO, "web");
const A = path.join(REPO, "migration-audit/analysis");
const read = (p) => fs.readFileSync(p, "utf8");

// ── 소스 파일 색인(짧은 이름을 전체 경로로) ──
const files = [];
const walk = (dir) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { if (e.name === "node_modules" || e.name === ".next" || e.name === "out") continue; const p = path.join(dir, e.name); if (e.isDirectory()) walk(p); else if (/\.(tsx?|css|mjs|json)$/.test(e.name)) files.push(path.relative(WEB, p).replace(/\\/g, "/")); } };
for (const d of ["app", "components", "lib", "stores", "i18n"]) walk(path.join(WEB, d));
const resolveShort = (short) => {
  const s = short.replace(/^web\//, "");
  const exact = files.filter((f) => f === s);
  if (exact.length) return exact[0];
  const tail = files.filter((f) => f.endsWith("/" + s));
  if (tail.length === 1) return tail[0];
  if (tail.length > 1) return { ambiguous: tail };
  return null;
};
const srcCache = new Map();
const srcLines = (f) => { if (!srcCache.has(f)) srcCache.set(f, read(path.join(WEB, f)).split(/\r?\n/)); return srcCache.get(f); };

// ── CX 색인(9.4 사건, 9.5 쓰기) ──
const cx = read(path.join(A, "codex-a-routes-events-state.md")).split(/\r?\n/);
const cxIndex = []; // {id, file, line, kind, event, reachable}
const cxFiles = {}; // file -> {reachable, eventIds:[], writeIds:[]}
{
  let file = null, kind = null, part = null;
  for (let i = 0; i < cx.length; i++) {
    const L = cx[i];
    if (/^### 9\.4/.test(L)) part = "event"; else if (/^### 9\.5/.test(L)) part = "write"; else if (/^### 9\.6|^## /.test(L) && !/^### 9\.[45]/.test(L)) { if (/^### 9\.6/.test(L) || /^## 1[0-9]/.test(L)) part = null; }
    const h = L.match(/^#### (web\/\S+)( 상태 및 자료 쓰기)?$/);
    if (h && part) { file = h[1].replace(/^web\//, ""); kind = h[2] ? "write" : "event"; cxFiles[file] ??= { reachable: null, eventIds: [], writeIds: [] }; continue; }
    if (file && /^상태: /.test(L)) cxFiles[file].reachable = !/도달 불가/.test(L);
    const m = L.match(/^\| (CX-I-\d+) \| `web\/([^`:]+):(\d+)`(?:<br>([^|]*))? \| ([^|]*)\|/);
    if (m && part) {
      const rec = { id: m[1], file: m[2], line: +m[3], kind, owner: (m[4] || "").trim(), event: m[5].trim().slice(0, 80) };
      cxIndex.push(rec);
      (cxFiles[rec.file] ??= { reachable: null, eventIds: [], writeIds: [] })[kind === "write" ? "writeIds" : "eventIds"].push(rec.id);
    }
  }
}
// CX 3절(해석)과 5절(전이)의 id 가 놓인 줄
const cxSection = {};
for (let i = 0; i < cx.length; i++) { const m = cx[i].match(/^(?:\| )?(CX-(?:I|S|P\d|U|F)-\d+)[.| ]/); if (m && i < 380) cxSection[m[1]] = i + 1; }

// ── CL 인터랙션 행 ──
const cl = read(path.join(A, "claude-b-interactions.md")).split(/\r?\n/);
const clRows = [];
{
  let h2 = "", h3 = "", header = null;
  for (let i = 0; i < cl.length; i++) {
    const L = cl[i];
    if (/^## /.test(L)) { h2 = L.replace(/^## /, ""); h3 = ""; header = null; continue; }
    if (/^### /.test(L)) { h3 = L.replace(/^### /, ""); header = null; continue; }
    if (/^\| id \|/.test(L)) { header = L.split("|").slice(1, -1).map((s) => s.trim()); continue; }
    const m = L.match(/^\| (CL-I-\d+) \|/);
    if (!m || !header) continue;
    const cells = L.split(" | ").map((s) => s.replace(/^\| /, "").replace(/ \|$/, "").trim());
    // 분석가의 표 가운데 칸이 하나 더 많은 행(화면 이름을 앞에 따로 적은 행)은 앞의 두 칸을 합친다
    if (cells.length === header.length + 1) cells.splice(1, 2, cells[1] + ": " + cells[2]);
    const row = { id: m[1], h2, h3, srcLine: i + 1 };
    header.forEach((k, j) => { row[k] = cells[j] ?? ""; });
    clRows.push(row);
  }
}
// 인용(파일:줄) 풀기. 앞에 나온 파일 이름을 이어 받는다(`A.tsx:10, 20`, `B.tsx:5-7`)
const citeRe = /`([^`]+)`/g;
function citations(cell) {
  const out = [];
  let m;
  while ((m = citeRe.exec(cell))) {
    const body = m[1];
    const fm = body.match(/^([\w./\[\]-]+\.(?:tsx?|css|mjs|json)):(.+)$/);
    if (!fm) continue;
    const file = resolveShort(fm[1]);
    for (const part of fm[2].split(",").map((s) => s.trim())) {
      const r = part.match(/^(\d+)(?:-(\d+))?$/);
      if (!r) continue;
      out.push({ short: fm[1], file, from: +r[1], to: +(r[2] ?? r[1]) });
    }
  }
  return out;
}
const TOKEN = /on[A-Z][A-Za-z]*=|useEffect|addEventListener|setTimeout|setInterval|href=|<details|<summary|useModal|=>|function |const \w+ = |requestAnimationFrame|Observer|location\.replace|autoFocus|export /;
for (const row of clRows) {
  const cell = row["핸들러"] ?? row["파일"] ?? "";
  row.cites = citations(cell).map((c) => {
    if (!c.file || typeof c.file !== "string") return { ...c, ok: false, why: c.file ? "ambiguous" : "no-file" };
    const lines = srcLines(c.file);
    if (c.to > lines.length) return { ...c, ok: false, why: "past-end(" + lines.length + ")" };
    const text = lines.slice(c.from - 1, c.to).join("\n");
    const ids = cxIndex.filter((x) => x.file === c.file && x.line >= c.from && x.line <= c.to).map((x) => x.id);
    return { ...c, ok: TOKEN.test(text), cx: ids, head: lines[c.from - 1].trim().slice(0, 140) };
  });
}

// ── CL 상태 사례 ──
const cs = read(path.join(A, "claude-b-states.md")).split(/\r?\n/);
const clCases = [];
{
  let h2 = "", cur = null;
  for (let i = 0; i < cs.length; i++) {
    const L = cs[i];
    if (/^## /.test(L)) { h2 = L.replace(/^## /, ""); cur = null; continue; }
    const m = L.match(/^### (CL-S-\d+) (.+)$/);
    if (m) { cur = { id: m[1], title: m[2], h2, srcLine: i + 1, bullets: [] }; clCases.push(cur); continue; }
    if (cur && /^(- |  - )/.test(L)) cur.bullets.push(L);
  }
}
for (const c of clCases) {
  const ev = c.bullets.find((b) => /^- 근거/.test(b)) ?? "";
  c.cites = citations(ev).map((x) => {
    if (!x.file || typeof x.file !== "string") return { ...x, ok: false, why: x.file ? "ambiguous" : "no-file" };
    const lines = srcLines(x.file);
    return { ...x, ok: x.to <= lines.length, why: x.to <= lines.length ? undefined : "past-end(" + lines.length + ")" };
  });
}

fs.writeFileSync(path.join(here, "parsed.json"), JSON.stringify({ clRows, clCases, cxIndex, cxFiles, cxSection }, null, 1));
const bad = clRows.flatMap((r) => r.cites.filter((c) => !c.ok).map((c) => `${r.id} ${c.short}:${c.from}${c.to !== c.from ? "-" + c.to : ""} ${c.why ?? "no-token: " + c.head}`));
const badS = clCases.flatMap((r) => r.cites.filter((c) => !c.ok).map((c) => `${r.id} ${c.short}:${c.from} ${c.why}`));
console.log("CL-I rows", clRows.length, "CL-S cases", clCases.length, "CX index", cxIndex.length, "CX files", Object.keys(cxFiles).length);
console.log("cites total", clRows.reduce((n, r) => n + r.cites.length, 0), "rows without cites", clRows.filter((r) => !r.cites.length).map((r) => r.id).join(" "));
console.log("rows with CX line match", clRows.filter((r) => r.cites.some((c) => c.cx?.length)).length);
console.log("ANOMALIES (interaction)\n" + bad.join("\n"));
console.log("ANOMALIES (state)\n" + badS.join("\n"));
