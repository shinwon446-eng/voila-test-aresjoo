#!/usr/bin/env node
/**
 * E-15 후기 쓰기 시트의 초안 규칙과 E-16 검증 화면의 직접 계산을 두 빌드에서 같은 조작으로 본다.
 *   node draft-verify.mjs [--only draft,verify]
 * 견주는 도구(both)가 아니라 빌드마다 값을 적어 나란히 찍는다(여기는 의도된 차이의 자리라 두 값이 다른 것이 정상인 칸이 있다).
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { open, launch, save, SEL, FAIR, here } from './c3.mjs';

const only = (() => { const i = process.argv.indexOf('--only'); return i >= 0 ? process.argv[i + 1].split(',') : ['draft', 'verify']; })();
const require = createRequire(path.join(here, '../package.json'));
const { PNG } = require('pngjs');
const png = (w, h, seed) => { const img = new PNG({ width: w, height: h }); for (let i = 0; i < img.data.length; i += 4) { const v = (i * 31 + seed * 97) % 255; img.data[i] = v; img.data[i + 1] = (v * 7) % 255; img.data[i + 2] = seed; img.data[i + 3] = 255; } return PNG.sync.write(img); };
const out = {};
const rec = (build, label, value) => { (out[label] ??= {})[build] = value; };

const draft = (t) => t.page.evaluate(() => { const s = document.querySelector('.v-sheet'); if (!s || !s.querySelector('textarea')) return null; return { desc: s.querySelector('.v-desc')?.innerText, text: s.querySelector('textarea').value, rating: Array.from(s.querySelectorAll('.v-chip')).findIndex((c) => c.getAttribute('aria-pressed') === 'true') + 1, photo: !!s.querySelector('.v-review-photo img'), photoSize: (() => { const i = s.querySelector('.v-review-photo img'); return i ? i.naturalWidth + 'x' + i.naturalHeight : null; })(), lines: Array.from(s.querySelectorAll('.v-line')).map((l) => l.innerText) }; });
const openReview = async (t, row) => { if (!(await t.has(SEL.sheet))) { await t.click('.v-main .v-itemrows .v-itemrow', row); await t.wait(SEL.sheet); } await t.click('.v-rowlink'); await t.wait('.v-sheet textarea'); await t.pause(200); };
const closeAll = async (t) => { for (let i = 0; i < 3 && await t.has(SEL.sheet); i++) { await t.page.keyboard.press('Escape'); await t.pause(350); } };
const LONG = '상자가 눌린 데 없이 왔고 비닐도 그대로였습니다. 일련번호를 조회해 보니 정품으로 나왔고, 배송은 엿새 걸렸습니다.';

async function draftCase(browser, build) {
  const t = await open(browser, build, { preset: 'inventory', locale: 'ko', width: 390, shotDir: 'draft' });
  try {
    await t.goto('/inventory'); await t.wait('.v-main .v-itemrows .v-itemrow'); await t.pause(500);
    await openReview(t, 0);
    rec(build, 'D0 상품 1 후기 시트를 처음 연 직후', await draft(t));
    await t.click('.v-sheet .v-chip', 2); await t.fill('.v-sheet textarea', '짧음');
    await t.page.locator('.v-sheet .v-btn').last().click(); await t.pause(300);
    rec(build, 'D1 별 3개와 짧은 글로 올리기(입력 검증 실패) 뒤', await draft(t));
    await t.fill('.v-sheet textarea', LONG);
    await t.page.locator('.v-sheet input[type="file"]').setInputFiles({ name: 'a.png', mimeType: 'image/png', buffer: png(64, 48, 10) }); await t.pause(900);
    rec(build, 'D2 긴 글과 사진을 넣은 뒤', await draft(t)); await t.shot('d2-filled');
    await t.page.keyboard.press('Escape'); await t.pause(400);
    await openReview(t, 0);
    rec(build, 'D3 Escape 로 닫고 같은 상품의 후기 시트를 다시 연 뒤', await draft(t)); await t.shot('d3-same-item-reopened');
    await t.fill('.v-sheet textarea', LONG + ' 다시 씀.'); await t.click('.v-sheet .v-chip', 1);
    // 시트 바깥(가림막)을 실수로 누른 경우
    await t.page.mouse.click(8, 30); await t.pause(400);
    rec(build, 'D4a 바깥을 누른 뒤 후기 시트가 떠 있는가', await t.has('.v-sheet textarea'));
    if (!(await t.has('.v-sheet textarea'))) await openReview(t, 0);
    rec(build, 'D4 바깥을 눌러 닫고 같은 상품의 후기 시트를 다시 연 뒤', await draft(t));
    await t.fill('.v-sheet textarea', LONG + ' 상품 1 의 글.'); await t.click('.v-sheet .v-chip', 0);
    await closeAll(t);
    await openReview(t, 1);
    rec(build, 'D5 상품 1 에 쓰다 닫고 상품 2 의 후기 시트를 연 뒤', await draft(t)); await t.shot('d5-other-item');
    // 늦게 끝난 사진: 큰 사진을 고른 직후 작은 사진을 고른다
    const input = t.page.locator('.v-sheet input[type="file"]');
    await input.setInputFiles({ name: 'big.png', mimeType: 'image/png', buffer: png(3000, 2200, 200) });
    await input.setInputFiles({ name: 'small.png', mimeType: 'image/png', buffer: png(40, 30, 20) });
    await t.pause(2500);
    rec(build, 'D6 큰 사진 직후 작은 사진을 고른 뒤(남은 사진의 크기)', await draft(t));
    await t.fill('.v-sheet textarea', LONG + ' 상품 2 의 글.');
    await t.page.locator('.v-sheet .v-btn').last().click(); await t.pause(900);
    const raw = await t.raw();
    rec(build, 'D7 상품 2 후기를 올린 뒤 저장된 내 후기', (raw['gachaflix.community']?.state?.mine ?? []).map((m) => ({ ownedId: m.ownedId, rating: m.rating, text: m.text.slice(0, 30), photo: m.photo ? 'data ' + m.photo.length : null })));
    await closeAll(t);
    await openReview(t, 0);
    rec(build, 'D8 그 뒤 상품 1 의 후기 시트', await draft(t));
    rec(build, 'D 콘솔', t.errors.slice(0, 6));
  } catch (error) { rec(build, 'D 오류', String(error.message).split('\n')[0]); await t.shot('error'); }
  finally { await t.close(); }
}

const MANUAL = '[aria-labelledby="verify-manual"]';
const manual = (t) => t.page.evaluate((sel) => { const m = document.querySelector(sel); return { inputs: Array.from(m.querySelectorAll('.v-field input')).map((i) => i.value.slice(0, 24)), box: m.querySelector('.v-chip[aria-pressed="true"]')?.innerText ?? null, lines: Array.from(m.querySelectorAll('.v-line')).map((l) => l.innerText), rows: Array.from(m.querySelectorAll('.v-row')).map((r) => r.innerText.replace(/\s+/g, ' ').slice(0, 90)), busy: !!m.querySelector('.v-btn[data-busy]') }; }, MANUAL);
async function verifyCase(browser, build) {
  const t = await open(browser, build, { preset: 'guest', locale: 'ko', width: 1024, shotDir: 'verify' });
  try {
    await t.goto('/verify'); await t.wait('.v-main .v-field input'); await t.pause(500);
    const inputs = t.page.locator(MANUAL + ' .v-field input');
    const compute = () => t.page.locator(MANUAL + ' .v-btn').last().click();
    await inputs.nth(0).fill(FAIR.serverSeed); await inputs.nth(1).fill(FAIR.serverSeedHash); await inputs.nth(2).fill(FAIR.clientSeed); await inputs.nth(3).fill('0');
    await compute(); await t.pause(900);
    rec(build, 'V1 고정 시드, 회차 0 으로 계산', await manual(t)); await t.shot('v1');
    await inputs.nth(3).fill('1'); await t.pause(400);
    rec(build, 'V2 계산 뒤 회차를 1 로 고침(계산은 누르지 않음)', await manual(t)); await t.shot('v2-edited-after');
    await compute(); await t.pause(900);
    rec(build, 'V3 회차 1 로 계산', await manual(t));
    // 계산을 누른 같은 순간에 회차를 고친다(계산 도중의 변경)
    await t.page.evaluate((sel) => {
      const m = document.querySelector(sel); const btns = m.querySelectorAll('.v-btn'); const btn = btns[btns.length - 1];
      const input = m.querySelectorAll('.v-field input')[3];
      btn.click();
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(input, '7'); input.dispatchEvent(new Event('input', { bubbles: true }));
    }, MANUAL);
    await t.pause(1200);
    rec(build, 'V4 계산을 누른 순간 회차를 7 로 고침', await manual(t)); await t.shot('v4-race');
    await inputs.nth(3).fill(''); await compute(); await t.pause(900);
    rec(build, 'V5 회차를 비우고 계산', await manual(t));
    await inputs.nth(3).fill('9007199254740993'); await compute(); await t.pause(900);
    rec(build, 'V6 안전한 정수를 넘는 회차로 계산', await manual(t));
    await inputs.nth(3).fill('-1'); await compute(); await t.pause(600);
    rec(build, 'V7 음수 회차', await manual(t));
    await inputs.nth(3).fill('0'); await compute(); await t.pause(900);
    rec(build, 'V8a 회차 0 으로 다시 계산', await manual(t));
    await t.page.locator(MANUAL + ' .v-chip').nth(3).click(); await t.pause(400);
    rec(build, 'V8 계산 뒤 박스를 바꿈(계산은 누르지 않음)', await manual(t)); await t.shot('v8-box-changed');
    await inputs.nth(1).fill('f'.repeat(64)); await compute(); await t.pause(900);
    rec(build, 'V9 틀린 잠금 값으로 계산', await manual(t));
    rec(build, 'V 콘솔', t.errors.slice(0, 6));
  } catch (error) { rec(build, 'V 오류', String(error.message).split('\n')[0]); await t.shot('error'); }
  finally { await t.close(); }
}

const browser = await launch();
try {
  if (only.includes('draft')) await Promise.all([draftCase(browser, 'orig'), draftCase(browser, 'result')]);
  if (only.includes('verify')) await Promise.all([verifyCase(browser, 'orig'), verifyCase(browser, 'result')]);
} finally { await browser.close(); }
for (const [label, v] of Object.entries(out)) { const a = JSON.stringify(v.orig), b = JSON.stringify(v.result); console.log(`${a === b ? 'same' : 'DIFF'}  ${label}\n    orig:   ${a}\n    result: ${b}`); }
console.log('기록:', await save('draft-verify.json', out));
