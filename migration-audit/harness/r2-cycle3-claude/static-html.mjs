// 내보낸 HTML 전부(세 언어의 모든 주소)를 파일끼리 견준다. 브라우저 없이 본다(하이드레이션 전의 미리 그린 HTML).
//   node static-html.mjs <a> <b>      a, b: orig | result | off
// 스크립트와 청크 이름의 해시를 떼고 견준다. 다르면 후기 자리(박스 화면의 후기 절, 별점 줄)를 떼고 다시 견준다.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { saveJson } from './lib.mjs';

const DIRS = { orig: 'C:/Users/hyun1/dev/VOILA-audit-before/web/out', result: 'C:/Users/hyun1/dev/VOILA-audit-out/after-final', off: 'C:/Users/hyun1/dev/VOILA-audit-out/after-final-samples-off' };
const [A, B] = process.argv.slice(2);
const walk = (dir, base = dir, out = []) => { for (const name of readdirSync(dir)) { const f = path.join(dir, name); if (statSync(f).isDirectory()) { if (name !== '_next' && name !== 'assets' && name !== 'audio') walk(f, base, out); } else if (name.endsWith('.html')) out.push(path.relative(base, f).replace(/\\/g, '/')); } return out; };
const norm = (html) => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
  .replace(/<link\b[^>]*rel="(?:preload|stylesheet|modulepreload)"[^>]*>/g, '')
  .replace(/-[0-9a-f]{16}\.(js|css)/g, '-(해시).$1')
  .replace(/\?dpl=[^"&]+/g, '');
// 후기 자리를 뗀다: 박스 화면의 후기 절 전체와 별점 줄(카드의 별점, 제목 아래의 별점 링크)
const stripZone = (html) => html
  .replace(/<section id="reviews"[\s\S]*?<\/section>/g, '<section id="reviews"/>')
  .replace(/<(a|button)\b[^>]*class="v-ratinglink"[\s\S]*?<\/\1>/g, '')
  .replace(/<span class="v-rating"[\s\S]*?<\/span><\/span>/g, '');
const filesA = walk(DIRS[A]), filesB = new Set(walk(DIRS[B]));
const out = { a: A, b: B, total: filesA.length, onlyA: filesA.filter((f) => !filesB.has(f)), onlyB: [...filesB].filter((f) => !filesA.includes(f)), identical: 0, zoneOnly: 0, differs: [], byRoute: {} };
const routeOf = (f) => f.replace(/^(ko|en|zh)\//, '').replace(/\/index\.html$|\.html$/, '').replace(/^box\/.*/, 'box/[slug]').replace(/^legal\/.+/, 'legal/[doc]') || '(home)';
for (const f of filesA) {
  if (!filesB.has(f)) continue;
  const a = norm(readFileSync(path.join(DIRS[A], f), 'utf8')), b = norm(readFileSync(path.join(DIRS[B], f), 'utf8'));
  const slot = (out.byRoute[routeOf(f)] ??= { identical: 0, zoneOnly: 0, differs: 0 });
  if (a === b) { out.identical++; slot.identical++; continue; }
  const za = stripZone(a), zb = stripZone(b);
  if (za === zb) { out.zoneOnly++; slot.zoneOnly++; continue; }
  slot.differs++;
  let i = 0; while (i < za.length && za[i] === zb[i]) i++;
  out.differs.push({ file: f, at: i, a: za.slice(Math.max(0, i - 120), i + 200), b: zb.slice(Math.max(0, i - 120), i + 200), lenA: za.length, lenB: zb.length });
}
await saveJson(`static-html-${A}-${B}.json`, out);
console.log(`${A} 대 ${B}: 파일 ${out.total}, 같음 ${out.identical}, 후기 자리만 다름 ${out.zoneOnly}, 그 밖이 다름 ${out.differs.length}, 한쪽에만 ${out.onlyA.length}/${out.onlyB.length}`);
console.log(JSON.stringify(out.byRoute));
for (const d of out.differs.slice(0, 6)) console.log('\n' + d.file, d.lenA, d.lenB, '\n A: ' + d.a.replace(/\s+/g, ' ') + '\n B: ' + d.b.replace(/\s+/g, ' '));
