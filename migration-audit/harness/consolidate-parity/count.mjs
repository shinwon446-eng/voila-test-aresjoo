// 세 산출물의 수를 세고 글 규칙(긴 줄표, 가운뎃점, 느낌표)을 본다. 읽기만 한다.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const dir = process.argv[2];
const files = ["FEATURE_PARITY.md", "PARITY_ISSUES.md", "BACKLOG_STATUS.md"].filter((f) => existsSync(path.join(dir, f)));
const split = (line) => line.replace(/\\\|/g, "\u0001").split("|").slice(1, -1).map((c) => c.replace(/\u0001/g, "|").trim());
const out = {};
for (const f of files) {
  const text = readFileSync(path.join(dir, f), "utf8");
  const lines = text.split(/\r?\n/);
  const bad = [];
  lines.forEach((l, i) => { for (const ch of ["—", "–", "·", "・", "!", "！"]) if (l.includes(ch)) bad.push([i + 1, ch === "!" ? "느낌표" : "U+" + ch.codePointAt(0).toString(16), l.slice(Math.max(0, l.indexOf(ch) - 30), l.indexOf(ch) + 30)]); });
  out[f] = { lines: lines.length, bytes: Buffer.byteLength(text), forbidden: bad };
  if (f === "FEATURE_PARITY.md") {
    const rows = lines.filter((l) => /^\| F-\d{3} \|/.test(l)).map(split);
    const status = {}; const agree = {}; const es = new Set(); const widths = new Set();
    for (const r of rows) {
      widths.add(r.length);
      const s = r[4]; const key = ["구현 완료", "부분 구현", "화면만 있음", "서버 미연결", "계획만 있음", "폐기됨", "지금 닿지 않음"].find((k) => s.startsWith(k)) ?? "기타:" + s.slice(0, 12);
      (status[key] ??= []).push(r[0]);
      const a = r[7]; const ak = a.startsWith("일치") ? "일치" : a.startsWith("한 곳만") ? "한 곳만" : a.startsWith("어긋남 아님") ? "어긋남 아님" : a.startsWith("어긋남") ? "어긋남" : "기타:" + a.slice(0, 12);
      (agree[ak] ??= []).push(r[0]);
      for (const m of r.join(" ").matchAll(/E-(\d{2})\b/g)) es.add(m[0]);
    }
    const ids = rows.map((r) => r[0]);
    const gaps = []; for (let i = 1; i <= ids.length; i++) if (ids[i - 1] !== "F-" + String(i).padStart(3, "0")) { gaps.push([i, ids[i - 1]]); break; }
    out[f].rows = rows.length; out[f].columns = [...widths]; out[f].firstGap = gaps;
    out[f].status = Object.fromEntries(Object.entries(status).map(([k, v]) => [k, [v.length, v.join(" ")]]));
    out[f].agree = Object.fromEntries(Object.entries(agree).map(([k, v]) => [k, [v.length, v.join(" ")]]));
    const allE = Array.from({ length: 41 }, (_, i) => "E-" + String(i + 1).padStart(2, "0"));
    out[f].eReferenced = [...es].sort().length; out[f].eNotReferenced = allE.filter((e) => !es.has(e));
    out[f].tRows = lines.filter((l) => /^\| T-\d{2} \|/.test(l)).length;
  }
  if (f === "PARITY_ISSUES.md") {
    out[f].eHeadings = lines.filter((l) => /^#### E-\d{2} /.test(l)).length;
    out[f].eSummaryRows = lines.filter((l) => /^\| E-\d{2} \|/.test(l)).length;
    out[f].dRows = lines.filter((l) => /^\| D-\d{2} \|/.test(l)).length;
    out[f].nRows = lines.filter((l) => /^\| N-\d{2} \|/.test(l)).length;
  }
  if (f === "BACKLOG_STATUS.md") {
    const rows = lines.filter((l) => /^\| B-\d{3} \|/.test(l)).map(split);
    const status = {}; const widths = new Set(); let verified = 0;
    for (const r of rows) {
      widths.add(r.length);
      const s = r[3]; const key = ["구현 완료", "부분 구현", "화면만 있음", "서버 미연결", "계획만 있음", "폐기됨", "지금 닿지 않음"].find((k) => s.startsWith(k)) ?? "기타:" + s.slice(0, 12);
      (status[key] ??= []).push(r[0]);
      if (/^통합 확인/.test(r[r.length - 1])) { verified++; (status["__verified"] ??= []).push(r[0]); }
    }
    out[f].rows = rows.length; out[f].columns = [...widths]; out[f].verifiedByConsolidator = verified;
    out[f].status = Object.fromEntries(Object.entries(status).map(([k, v]) => [k, [v.length, v.join(" ")]]));
    out[f].xRows = lines.filter((l) => /^\| X-\d{2} \|/.test(l)).length;
    const ids = rows.map((r) => r[0]); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    out[f].dupIds = dup;
  }
}
console.log(JSON.stringify(out, null, 1));
