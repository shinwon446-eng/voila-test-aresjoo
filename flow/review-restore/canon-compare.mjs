// 칸 순서를 맞추고 시각 칸을 떼어 두 출력의 거래 기록과 보관함을 견준다. 시각은 차이의 분포만 적는다.
import fs from "node:fs";
const [a, b] = process.argv.slice(2).map((p) => JSON.parse(fs.readFileSync(p, "utf8")));
const TIME = new Set(["at", "soldAt", "acquiredAt", "requestedAt", "shippedAt", "cancelledAt", "deliveredAt"]);
const canon = (v) => Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().filter((k) => !TIME.has(k)).map((k) => [k, canon(v[k])])) : v;
const diffs = (xs, ys, label) => { let n = 0, first = null; for (let i = 0; i < Math.max(xs.length, ys.length); i++) { const p = JSON.stringify(canon(xs[i])), q = JSON.stringify(canon(ys[i])); if (p !== q) { n++; if (!first) first = { i, before: xs[i], head: ys[i] }; } } return { label, count: [xs.length, ys.length], diffs: n, first }; };
const timeDelta = (xs, ys, key) => { const d = {}; for (let i = 0; i < xs.length; i++) { if (!xs[i]?.[key] || !ys[i]?.[key]) continue; const k = (Date.parse(ys[i][key]) - Date.parse(xs[i][key])) / 1000; d[k] = (d[k] ?? 0) + 1; } return d; };
console.log(JSON.stringify({ tx: diffs(a.transactions, b.transactions, "tx"), items: diffs(a.items, b.items, "items"), txAtDelta: timeDelta(a.transactions, b.transactions, "at"), itemAtDelta: timeDelta(a.items, b.items, "acquiredAt"), soldAtDelta: timeDelta(a.items, b.items, "soldAt") }, null, 1));
