// 비교 요약에서 구조 차이로 분류된 촬영의 픽셀 차이를 화면별로 적는다(구조만 다르고 그림은 같은 것을 가려낸다).
//   node tools/pixel-stats.mjs <diff 폴더> [묶음 이름들, 쉼표로]
import fs from 'node:fs';
import path from 'node:path';

const [dir, groupsText = 'overlay,hover,focus,active,error,empty,long,extra'] = process.argv.slice(2);
const groups = groupsText.split(',');
const summary = JSON.parse(fs.readFileSync(path.join(dir, 'summary.json'), 'utf8'));
const rows = summary.rows.filter((r) => groups.includes(r.group) && r.kind === 'structure');
console.log('픽셀 칸의 모양:', JSON.stringify(rows[0]?.pixels).slice(0, 300));
console.log('flags 예:', JSON.stringify(rows[0]?.flags).slice(0, 300));
const by = new Map();
for (const r of rows) {
  const k = r.id.split('/').slice(0, 2).join('/');
  const p = r.pixels ?? {};
  const diff = p.diff ?? p.differing ?? p.count ?? p.solid ?? null;
  const row = by.get(k) ?? { n: 0, zero: 0, max: 0, size: 0, flags: new Set() };
  row.n++;
  if (diff === 0) row.zero++;
  if (typeof diff === 'number') row.max = Math.max(row.max, diff);
  if (p.sizeMismatch || (r.flags ?? []).includes?.('sizeMismatch')) row.size++;
  for (const f of Array.isArray(r.flags) ? r.flags : Object.keys(r.flags ?? {})) row.flags.add(f);
  by.set(k, row);
}
for (const [k, v] of [...by.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`${k}\t촬영 ${v.n}\t그림 같음 ${v.zero}\t가장 큰 픽셀 차이 ${v.max}\t크기 다름 ${v.size}\t${[...v.flags].join(' ')}`);
}
