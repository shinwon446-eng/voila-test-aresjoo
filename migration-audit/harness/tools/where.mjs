#!/usr/bin/env node
/**
 * 두 그림이 어디에서 얼마나 다른지 적는다(차이의 원인을 찾을 때 쓰는 보조 도구).
 *   node tools/where.mjs <a.png> <b.png> [칸 크기=128]
 * 적는 것: 채널 값 차이의 크기별 픽셀 수, 다른 픽셀이 몰린 칸(왼쪽 위 좌표)의 차례.
 * 같은 이름의 .json 기록이 옆에 있으면 그림과 캔버스 요소의 자리(기기 픽셀)도 함께 적어, 어느 요소가 다른지 짚을 수 있게 한다.
 */
import { existsSync, readFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const [fileA, fileB, cellArg = '128'] = process.argv.slice(2);
if (!fileA || !fileB) { console.error('사용법: node tools/where.mjs <a.png> <b.png> [칸 크기]'); process.exit(2); }
const C = Number(cellArg);
const a = PNG.sync.read(readFileSync(fileA)), b = PNG.sync.read(readFileSync(fileB));
if (a.width !== b.width || a.height !== b.height) console.log(`크기가 다르다: ${a.width}x${a.height} / ${b.width}x${b.height}. 겹치는 부분만 본다.`);
const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
const cells = {}, hist = { '1~2': 0, '3~8': 0, '9~32': 0, '33~': 0 };
let total = 0;
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  const p = (y * a.width + x) * 4, q = (y * b.width + x) * 4;
  const d = Math.max(Math.abs(a.data[p] - b.data[q]), Math.abs(a.data[p + 1] - b.data[q + 1]), Math.abs(a.data[p + 2] - b.data[q + 2]), Math.abs(a.data[p + 3] - b.data[q + 3]));
  if (!d) continue;
  total++;
  hist[d <= 2 ? '1~2' : d <= 8 ? '3~8' : d <= 32 ? '9~32' : '33~']++;
  const key = `${Math.floor(x / C) * C},${Math.floor(y / C) * C}`;
  cells[key] = (cells[key] ?? 0) + 1;
}
console.log(`다른 픽셀 ${total} / ${w * h}`);
if (total) {
  console.log('차이 크기별: ' + JSON.stringify(hist));
  console.log('몰린 칸: ' + Object.entries(cells).sort((p, q) => q[1] - p[1]).slice(0, 16).map(([k, v]) => `(${k}) ${v}`).join(', '));
  const json = fileA.replace(/\.png$/, '.json');
  if (existsSync(json)) {
    const record = JSON.parse(readFileSync(json, 'utf8'));
    const dpr = record.doc.dpr;
    for (const sel of ['.v-hero', '.v-hcard', 'canvas', '.v-boxcard-photo', '.v-mainitem-photo', '.v-item-photo', '.v-itemrow-photo', '.v-sheet', '.v-sheet-photo', '.v-qr']) {
      if (record.boxes[sel]) console.log(`${sel} (${record.boxes[sel].visible}개): ` + JSON.stringify(record.boxes[sel].rects.map((r) => r.map((v) => Math.round(v * dpr)))));
    }
  }
}
