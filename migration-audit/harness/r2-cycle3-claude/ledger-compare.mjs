// 300개 개봉 뒤의 두 빌드 장부를 칸마다 견준다. 무작위 번호는 처음 나온 차례의 자리표로 바꾼다.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { OUT, normalizeIds, deepDiff, saveJson } from './lib.mjs';

const read = async (b) => JSON.parse(await readFile(path.join(OUT, `ledger300-${b}.json`), 'utf8'));
const a = await read('orig'), b = await read('result');
const report = { opened: [a.opened, b.opened], steps: [a.steps.length, b.steps.length], errors: [a.errors, b.errors], console: [a.console, b.console] };
// 단계마다의 숫자
const stepDiffs = [];
for (let i = 0; i < Math.max(a.steps.length, b.steps.length); i++) { const x = JSON.stringify(a.steps[i]), y = JSON.stringify(b.steps[i]); if (x !== y) stepDiffs.push({ i, a: a.steps[i], b: b.steps[i] }); }
report.stepDiffs = stepDiffs.length; report.firstStepDiffs = stepDiffs.slice(0, 5);
// 저장된 것 전부
const uu = (v) => { const m = new Map(); const text = JSON.stringify(v).replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, (x) => { if (!m.has(x)) m.set(x, 'U' + m.size); return m.get(x); }); return { value: JSON.parse(text), uuids: m.size }; };
const ua = uu(a.final), ub = uu(b.final); report.uuids = [ua.uuids, ub.uuids];
const na = normalizeIds(ua.value), nb = normalizeIds(ub.value);
report.ids = [na.ids, nb.ids];
report.keys = [Object.keys(na.value).sort(), Object.keys(nb.value).sort()];
const diffs = deepDiff(na.value, nb.value);
report.fieldDiffs = diffs.length; report.firstFieldDiffs = diffs.slice(0, 40);
const wa = na.value['voila.browser-wallet.capture-account'].state, wb = nb.value['voila.browser-wallet.capture-account'].state;
const ia = na.value['voila.browser-inventory.capture-account'].state.items, ib = nb.value['voila.browser-inventory.capture-account'].state.items;
const byType = (txs) => txs.reduce((acc, t) => { acc[t.type] = (acc[t.type] ?? 0) + 1; return acc; }, {});
const sum = (txs) => +txs.reduce((s, t) => s + t.amountUsdt, 0).toFixed(2);
report.wallet = { balance: [wa.balance, wb.balance], crypto: [wa.cryptoBalance, wb.cryptoBalance], card: [wa.cardBalance, wb.cardBalance], wagered: [wa.totalWagered, wb.totalWagered], txs: [wa.transactions.length, wb.transactions.length], byType: [byType(wa.transactions), byType(wb.transactions)], txSum: [sum(wa.transactions), sum(wb.transactions)], withAccountId: [wa.transactions.filter((t) => t.accountId).length, wb.transactions.filter((t) => t.accountId).length] };
report.inventory = { items: [ia.length, ib.length], byStatus: [ia, ib].map((list) => list.reduce((acc, i) => { acc[i.status] = (acc[i.status] ?? 0) + 1; return acc; }, {})), nonces: [ia, ib].map((list) => { const ns = list.map((i) => i.fair?.nonce).filter((n) => typeof n === 'number').sort((x, y) => x - y); return { count: ns.length, min: ns[0], max: ns.at(-1), unique: new Set(ns).size }; }), valueSum: [ia, ib].map((list) => +list.reduce((s, i) => s + (i.valueUsdt ?? 0), 0).toFixed(2)) };
report.fair = [na.value['gachaflix.fair'], nb.value['gachaflix.fair']];
report.sameText = JSON.stringify(na.value) === JSON.stringify(nb.value);
report.storageChars = [JSON.stringify(a.final).length, JSON.stringify(b.final).length];
// 잔액이 거래의 합과 맞는가(두 빌드 각각)
report.balanceVsTxSum = [wa, wb].map((w) => ({ balance: w.balance, txSum: sum(w.transactions), equal: Math.abs(w.balance - sum(w.transactions)) < 0.005 }));
report.checkpoints = a.checkpoints.map((c, i) => ({ name: c.name, orig: { heapKB: Math.round(c.heapUsed / 1024), nodes: c.nodes, listeners: c.listeners, dom: c.dom, rows: c.rows, loadMs: c.loadMs, storageChars: c.storageChars }, result: b.checkpoints[i] ? { heapKB: Math.round(b.checkpoints[i].heapUsed / 1024), nodes: b.checkpoints[i].nodes, listeners: b.checkpoints[i].listeners, dom: b.checkpoints[i].dom, rows: b.checkpoints[i].rows, loadMs: b.checkpoints[i].loadMs, storageChars: b.checkpoints[i].storageChars } : null }));
report.walletRowSheet = [a.walletRowSheet, b.walletRowSheet];
await saveJson('ledger300-compare.json', report);
const short = { ...report, keys: undefined }; console.log(JSON.stringify(short, null, 1).slice(0, 7000));
