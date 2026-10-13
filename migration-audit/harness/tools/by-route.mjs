// 비교 요약(summary.json)을 주소별로 묶어, 어느 화면에서 차이가 났는지 센다.
//   node tools/by-route.mjs <diff 폴더> [분류 이름(기본 structure)]
import fs from 'node:fs';
import path from 'node:path';

const [dir, kind = 'structure'] = process.argv.slice(2);
const summary = JSON.parse(fs.readFileSync(path.join(dir, 'summary.json'), 'utf8'));
const rows = Array.isArray(summary.rows) ? summary.rows : (summary.items ?? summary.results ?? []);
if (!rows.length) { console.log('요약의 열쇠:', Object.keys(summary).join(', ')); process.exit(0); }
const sample = rows[0];
console.log('한 건의 열쇠:', Object.keys(sample).join(', '));
const kindOf = (r) => r.kind ?? r.class ?? r.category ?? r.verdict;
const idOf = (r) => r.id ?? r.key ?? r.name ?? r.shot;
const byGroup = new Map();
for (const r of rows) {
  const id = String(idOf(r));
  // 예: route/box-watch-rolex/ko-390-guest__full → 묶음 route, 화면 box-watch-rolex
  const [group, screen] = id.split('/');
  const k = group + '/' + screen;
  const row = byGroup.get(k) ?? { total: 0, hit: 0 };
  row.total++;
  if (kindOf(r) === kind) row.hit++;
  byGroup.set(k, row);
}
const out = [...byGroup.entries()].sort((a, b) => a[0].localeCompare(b[0]));
console.log(`\n${kind} 가 있는 화면`);
for (const [k, v] of out) if (v.hit > 0) console.log(`  ${k}  ${v.hit}/${v.total}`);
console.log(`\n${kind} 가 하나도 없는 화면`);
console.log('  ' + out.filter(([, v]) => v.hit === 0).map(([k, v]) => `${k}(${v.total})`).join(', '));
