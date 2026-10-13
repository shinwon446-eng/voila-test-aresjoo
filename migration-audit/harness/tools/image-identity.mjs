#!/usr/bin/env node
/**
 * 두 빌드가 같은 자리에 같은 그림 파일을 쓰는지 본다(그림의 주소 순서와 파일 바이트).
 *   node tools/image-identity.mjs <baseA> <baseB> <out.json>
 * 요소 단위 비교에서 "자리 때문에 가장자리가 달리 그려진 것(aa-shift)"으로 본 구역 안의 사진이
 * 정말 같은 사진인지를 픽셀과 따로 확인하려는 것이다. 홈, 박스 셋, 세 언어, 폭 1280.
 * 후기 자리(후기 구역, 카드의 별점)의 그림은 견주지 않는다(달라지기로 한 자리다).
 */
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { launch, newContext, guardNetwork, makeFixedState, installState, parseBase, routeUrl, settle, LOCALES } from '../lib/common.mjs';

const [baseA, baseB, outFile] = process.argv.slice(2);
if (!baseA || !baseB) { console.error('사용법: node tools/image-identity.mjs <baseA> <baseB> [out.json]'); process.exit(2); }
const ROUTES = ['', '/box/gaming-playstation', '/box/watch-rolex', '/box/pokemon-charizard'];
const browser = await launch();
const lists = {}, bytes = {};
for (const base of [baseA, baseB]) {
  const target = parseBase(base);
  lists[base] = {}; bytes[base] = new Map();
  for (const locale of LOCALES) for (const route of ROUTES) {
    const context = await newContext(browser, { width: 1280, locale });
    await guardNetwork(context, target, []);
    await installState(context, await makeFixedState('guest', locale), target.origin);
    const page = await context.newPage();
    await page.goto(routeUrl(target.base, locale, route));
    await settle(page, { fullImages: true });
    const imgs = await page.evaluate((basePath) => Array.from(document.images).filter((img) => !img.closest('.v-boxlayout-reviews, .v-boxcard-rating, .v-rvsum, .v-rvfeed, .v-rvgrid, .v-rvcard, .v-rv')).map((img) => {
      const zone = img.closest('.v-hero') ? 'hero' : img.closest('.v-boxcard') ? 'card' : img.closest('.v-boxlayout-hero') ? 'box-hero' : img.closest('.v-boxlayout-contents') ? 'contents' : 'other';
      const p = new URL(img.currentSrc || img.src, location.href).pathname;
      return { zone, src: p.startsWith(basePath) ? p.slice(basePath.length) : p, natural: img.naturalWidth + 'x' + img.naturalHeight };
    }), target.basePath);
    lists[base][`${locale}${route || '/'}`] = imgs;
    for (const img of imgs) if (!bytes[base].has(img.src)) { const res = await context.request.get(target.base + img.src); bytes[base].set(img.src, res.ok() ? createHash('sha256').update(await res.body()).digest('hex') : 'HTTP ' + res.status()); }
    await context.close();
  }
}
await browser.close();
const rows = [];
let sameOrder = 0, pages = 0;
for (const key of Object.keys(lists[baseA])) {
  const a = lists[baseA][key], b = lists[baseB][key];
  pages++;
  const same = JSON.stringify(a) === JSON.stringify(b);
  if (same) sameOrder++;
  rows.push({ page: key, imagesA: a.length, imagesB: b.length, sameSequence: same, firstDifference: same ? null : (() => { const i = a.findIndex((x, n) => JSON.stringify(x) !== JSON.stringify(b[n])); return { index: i, a: a[i] ?? null, b: b[i] ?? null }; })() });
}
const srcs = new Set([...bytes[baseA].keys(), ...bytes[baseB].keys()]);
const differentBytes = Array.from(srcs).filter((s) => bytes[baseA].get(s) !== bytes[baseB].get(s)).map((s) => ({ src: s, a: bytes[baseA].get(s) ?? '없음', b: bytes[baseB].get(s) ?? '없음' }));
const result = { generatedAt: new Date().toISOString(), a: baseA, b: baseB, pages, pagesWithSameSequence: sameOrder, uniqueImages: srcs.size, imagesWithDifferentBytes: differentBytes.length, differentBytes: differentBytes.slice(0, 50), rows };
if (outFile) writeFileSync(outFile, JSON.stringify(result, null, 1));
console.log(`화면 ${pages}개 가운데 그림의 주소와 순서가 같은 화면 ${sameOrder}개. 그림 파일 ${srcs.size}개 가운데 바이트가 다른 것 ${differentBytes.length}개.`);
for (const r of rows.filter((x) => !x.sameSequence)) console.log('다름: ' + r.page + ' ' + JSON.stringify(r.firstDifference));
