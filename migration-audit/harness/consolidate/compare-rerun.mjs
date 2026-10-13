// 통합 담당의 도구 3: 분석가 B 의 결과(claude-b/results)와 통합 담당의 재실행 결과(consolidator-rerun/results)를 검사 이름마다 견준다.
//   node migration-audit/harness/consolidate/compare-rerun.mjs
// 출력: 같은 폴더의 rerun-compare.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const A = path.resolve(here, "../claude-b/results");
const B = path.resolve(here, "../consolidator-rerun/results");
const out = { scenarios: {}, diffs: [] };
for (const f of fs.readdirSync(A)) {
  const a = JSON.parse(fs.readFileSync(path.join(A, f), "utf8")).results;
  const bFile = path.join(B, f);
  const b = fs.existsSync(bFile) ? JSON.parse(fs.readFileSync(bFile, "utf8")).results : [];
  const num = f.replace(/^(\d+b?).*$/, "$1");
  const ids = [...new Set(a.map((r) => r.scenario))];
  for (const id of ids) {
    const ar = a.filter((r) => r.scenario === id);
    const br = b.filter((r) => r.scenario === id);
    const key = num + ":" + id;
    const count = (rs) => ({ pass: rs.filter((r) => r.pass === true).length, fail: rs.filter((r) => r.pass === false).length, info: rs.filter((r) => r.pass === "info").length });
    const rec = { analyst: count(ar), rerun: br.length ? count(br) : null, same: null };
    if (br.length) {
      const diffs = [];
      for (const x of ar) {
        const y = br.find((r) => r.name === x.name);
        if (!y) diffs.push({ key, name: x.name, analyst: x.pass, rerun: "missing" });
        else if (y.pass !== x.pass) diffs.push({ key, name: x.name, analyst: x.pass, rerun: y.pass, detail: String(y.detail).slice(0, 300) });
      }
      for (const y of br) if (!ar.find((r) => r.name === y.name)) diffs.push({ key, name: y.name, analyst: "missing", rerun: y.pass });
      rec.same = diffs.length === 0;
      out.diffs.push(...diffs);
    }
    out.scenarios[key] = rec;
  }
}
fs.writeFileSync(path.join(here, "rerun-compare.json"), JSON.stringify(out, null, 1));
const keys = Object.keys(out.scenarios);
const rer = keys.filter((k) => out.scenarios[k].rerun);
const sum = (sel) => rer.reduce((n, k) => n + out.scenarios[k].rerun[sel], 0);
console.log("scenarios", keys.length, "rerun", rer.length, "identical", rer.filter((k) => out.scenarios[k].same).length);
console.log("rerun totals: pass", sum("pass"), "fail", sum("fail"), "info", sum("info"));
console.log("not rerun:", keys.filter((k) => !out.scenarios[k].rerun).join(" "));
for (const k of rer) { const s = out.scenarios[k]; console.log(k, "analyst", JSON.stringify(s.analyst), "rerun", JSON.stringify(s.rerun), s.same ? "same" : "DIFF"); }
for (const d of out.diffs) console.log("DIFF", d.key, "|", d.name, "|", d.analyst, "->", d.rerun, "|", d.detail ?? "");
