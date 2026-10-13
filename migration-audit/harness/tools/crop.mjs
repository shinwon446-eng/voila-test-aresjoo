#!/usr/bin/env node
/**
 * 그림의 한 부분을 잘라 새 PNG 로 적는다(아주 긴 전체 촬영이나 차이 그림을 눈으로 볼 때 쓴다).
 *   node tools/crop.mjs <png> <x> <y> <폭> <높이> <out.png> [축소 배수]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
const [file, x, y, w, h, out, shrink = '1'] = process.argv.slice(2);
if (!out) { console.error('사용법: node tools/crop.mjs <png> <x> <y> <폭> <높이> <out.png> [축소 배수]'); process.exit(2); }
const src = PNG.sync.read(readFileSync(file));
const k = Math.max(1, Number(shrink));
const X = Math.max(0, Number(x)), Y = Math.max(0, Number(y));
const W = Math.min(Number(w), src.width - X), H = Math.min(Number(h), src.height - Y);
const dst = new PNG({ width: Math.floor(W / k), height: Math.floor(H / k) });
for (let j = 0; j < dst.height; j++) for (let i = 0; i < dst.width; i++) {
  const s = ((Y + j * k) * src.width + (X + i * k)) * 4, d = (j * dst.width + i) * 4;
  dst.data[d] = src.data[s]; dst.data[d + 1] = src.data[s + 1]; dst.data[d + 2] = src.data[s + 2]; dst.data[d + 3] = src.data[s + 3];
}
writeFileSync(out, PNG.sync.write(dst));
console.log(`${out}: ${dst.width}x${dst.height} (원본 ${src.width}x${src.height})`);
