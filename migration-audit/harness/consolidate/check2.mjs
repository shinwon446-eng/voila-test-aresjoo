// 더 엄격한 번호 대응 검사: 표의 줄만 본다. 인자: migration-audit 폴더
import fs from "node:fs";
import path from "node:path";
const root = process.argv[2];
const read = (f) => fs.readFileSync(path.join(root, f), "utf8").split("\n");
function expand(t, prefix) {
  const out = new Set();
  const esc = prefix.replace(/[-]/g, "\\-");
  const re = new RegExp(esc + "(\\d+)((?:\\s*(?:~|,)\\s*(?:" + esc + ")?\\d+)*)", "g");
  for (const m of t.matchAll(re)) {
    let prev = +m[1]; out.add(prev);
    for (const part of (m[2] || "").matchAll(/(~|,)\s*(?:[A-Za-z-]+-)?(\d+)/g)) { const n = +part[2]; if (part[1] === "~") for (let i = prev; i <= n; i++) out.add(i); else out.add(n); prev = n; }
  }
  return out;
}
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const check = (name, lines, prefix, nums) => { const have = expand(lines.join("\n"), prefix); const miss = nums.filter((n) => !have.has(n)); console.log(name + ": " + nums.length + " 가운데 빠진 " + miss.length + (miss.length ? " -> " + miss.join(", ") : "")); };
const R = read("ROUTE_INVENTORY.md"), U = read("UI_INVENTORY.md"), A = read("motion/ANIMATION_INVENTORY.md");
const rRows = R.filter((l) => /^\| R-\d{3} \|/.test(l));
check("CX-R (R 줄만)", rRows, "CX-R-", range(1, 24));
check("CL-R (R 줄만)", rRows, "CL-R-", range(1, 24));
const uRows = U.filter((l) => /^\| U-\d{3} \|/.test(l));
check("CL-U (U 줄만)", uRows, "CL-U-", range(1, 215));
check("AGa-U (U 줄과 5.1절 출처 줄)", [...uRows, ...U.filter((l) => l.startsWith("출처:"))], "AGa-U-", [...range(1, 5), ...range(10, 24), ...range(30, 36)]);
check("AGb-I (U 줄만)", uRows, "AGb-I-", range(1, 8));
check("AG-S (U 줄만)", uRows, "AG-S-", range(1, 10));
check("AG-TX (U 줄만)", uRows, "AG-TX-", range(1, 10));
const aRows = A.filter((l) => /^\| A-\d{3} \|/.test(l));
check("AG-A (A 줄만)", aRows, "AG-A-", range(1, 35));
check("AG-TL (A 줄과 4절 제외)", aRows, "AG-TL-", [...range(1, 7), ...range(10, 13)]);
const last = (l) => l.split("|").slice(-2)[0];
console.log("확인 불가가 든 U 줄: " + uRows.filter((l) => /확인 불가/.test(last(l))).map((l) => l.slice(2, 7)).join(", "));
console.log("도달 불가가 든 U 줄: " + uRows.filter((l) => /도달 불가/.test(last(l))).map((l) => l.slice(2, 7)).join(", "));
console.log("R 상태: " + rRows.map((l) => l.slice(2, 7) + ":" + (/확인 불가/.test(last(l)) ? "불가" : "") + (/도달 불가/.test(last(l)) ? "도달" : "")).filter((s) => !s.endsWith(":")).join(", "));
