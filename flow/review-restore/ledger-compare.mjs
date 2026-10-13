// 두 ledger-diff 출력(JSON)을 견준다: 첫 어긋난 trace 항목, 최종 잔액, 거래 기록, 보관함 상태.
// node ledger-compare.mjs before.json head.json
import fs from "node:fs";
const [a, b] = process.argv.slice(2).map((p) => JSON.parse(fs.readFileSync(p, "utf8")));
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
let firstDiff = -1;
for (let i = 0; i < Math.max(a.trace.length, b.trace.length); i++) {
  if (!same(a.trace[i], b.trace[i])) { firstDiff = i; break; }
}
const strip = (tx) => tx;
const report = {
  traceLen: [a.trace.length, b.trace.length],
  firstDiffIndex: firstDiff,
  firstDiff: firstDiff >= 0 ? { before: a.trace[firstDiff], head: b.trace[firstDiff] } : null,
  finalSame: same(a.final, b.final), final: [a.final, b.final],
  txSame: same(a.transactions.map(strip), b.transactions.map(strip)), txCount: [a.transactions.length, b.transactions.length],
  itemsSame: same(a.items, b.items), itemCount: [a.items.length, b.items.length],
  marks: [a.marks, b.marks],
  storedBytes: [a.storedBytes, b.storedBytes],
};
if (!report.txSame) {
  for (let i = 0; i < Math.max(a.transactions.length, b.transactions.length); i++) if (!same(a.transactions[i], b.transactions[i])) { report.firstTxDiff = { i, before: a.transactions[i], head: b.transactions[i] }; break; }
}
if (!report.itemsSame) {
  for (let i = 0; i < Math.max(a.items.length, b.items.length); i++) if (!same(a.items[i], b.items[i])) { report.firstItemDiff = { i, before: a.items[i], head: b.items[i] }; break; }
}
console.log(JSON.stringify(report, null, 1));
