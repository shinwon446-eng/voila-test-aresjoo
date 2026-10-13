// 내보내기 폴더에서 바로 재는 크기: 화면마다 HTML 과 그 HTML 이 부르는 JS, CSS 의 바이트와 gzip 크기. 브라우저 없이 잰다.
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { saveJson } from './lib.mjs';

const DIRS = { orig: 'C:/Users/hyun1/dev/VOILA-audit-before/web/out', result: 'C:/Users/hyun1/dev/VOILA-audit-out/after-final', off: 'C:/Users/hyun1/dev/VOILA-audit-out/after-final-samples-off' };
const PAGES = ['ko/index.html', 'ko/box/watch-rolex/index.html', 'ko/box/dollar-apple/index.html', 'ko/reviews/index.html', 'ko/wallet/index.html', 'ko/account/index.html', 'en/index.html', 'zh/box/watch-rolex/index.html'];
const out = {};
for (const page of PAGES) {
  out[page] = {};
  for (const [build, dir] of Object.entries(DIRS)) {
    const file = path.join(dir, page);
    if (!existsSync(file)) { out[page][build] = null; continue; }
    const html = readFileSync(file);
    const text = html.toString('utf8');
    const refs = [...new Set([...text.matchAll(/\/voila-test-aresjoo\/(_next\/static\/[^"'\\ ]+?\.(?:js|css))/g)].map((m) => m[1]))];
    let js = 0, jsGz = 0, css = 0, cssGz = 0, n = 0; const biggest = [];
    for (const ref of refs) { const f = path.join(dir, decodeURIComponent(ref)); if (!existsSync(f)) continue; const buf = readFileSync(f); const gz = gzipSync(buf).length; if (ref.endsWith('.js')) { js += buf.length; jsGz += gz; n++; biggest.push([ref.replace(/^_next\/static\/chunks\//, '').replace(/-[0-9a-f]{16}/, ''), buf.length, gz]); } else { css += buf.length; cssGz += gz; } }
    biggest.sort((a, b) => b[1] - a[1]);
    out[page][build] = { html: html.length, htmlGz: gzipSync(html).length, jsFiles: n, js, jsGz, css, cssGz, reviewRows: (text.match(/class="v-rv"/g) ?? []).length, oldCards: (text.match(/class="v-rvcard"/g) ?? []).length, top: biggest.slice(0, 6) };
  }
}
await saveJson('static-size.json', out);
for (const [page, v] of Object.entries(out)) { console.log(page); for (const [b, s] of Object.entries(v)) if (s) console.log(`  ${b.padEnd(6)} html ${s.html} (gz ${s.htmlGz})  js ${s.jsFiles}개 ${s.js} (gz ${s.jsGz})  css ${s.css} (gz ${s.cssGz})  후기 줄 ${s.reviewRows} 옛 카드 ${s.oldCards}`); }
// 청크마다의 차이(이름의 해시를 뗀 것으로 맞춘다)
const page = 'ko/box/watch-rolex/index.html';
const byName = (list) => Object.fromEntries(list.map(([n, raw, gz]) => [n, [raw, gz]]));
console.log('가장 큰 청크', page, JSON.stringify({ orig: out[page].orig.top, result: out[page].result.top, off: out[page].off?.top }, null, 0));
