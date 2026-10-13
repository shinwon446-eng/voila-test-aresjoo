// 내용 검수의 증거 그림: 영어 화면의 후기 첫 다섯 건, 롤스로이스 박스의 첫 다섯 건, 엉뚱한 상품 말 세 건.
import { launch, openSession, saveJson } from './lib.mjs';

const browser = await launch();
const out = {};
const shotRow = async (t, name, needle) => {
  for (let i = 0; i < 12; i++) { if (await t.page.locator('.v-rv', { hasText: needle }).count()) break; const more = t.page.locator('[data-reviews-more]'); if (!(await more.isVisible().catch(() => false))) break; await more.click(); await t.page.waitForTimeout(150); }
  const row = t.page.locator('.v-rv', { hasText: needle }).first();
  if (!(await row.count())) { out[name] = '찾지 못함'; return; }
  await row.scrollIntoViewIfNeeded(); await t.page.waitForTimeout(300);
  out[name] = (await row.innerText()).replace(/\s+/g, ' ');
  await row.screenshot({ path: (await import('node:path')).join((await import('./lib.mjs')).SHOTS, name + '.png') });
};
try {
  let t = await openSession(browser, 'result', { preset: 'guest', locale: 'en', width: 390 });
  await t.goto('/box/watch-rolex'); await t.wait('#reviews'); await t.settle({ fullImages: true }); await t.page.locator('#reviews .v-rv-total').scrollIntoViewIfNeeded(); await t.page.evaluate(() => window.scrollBy(0, -80)); await t.shot('content-en-watch-rolex-first', { fullPage: false }); await t.close();
  t = await openSession(browser, 'result', { preset: 'guest', locale: 'ko', width: 1440 });
  await t.goto('/box/car-rolls-royce'); await t.wait('#reviews'); await t.settle({ fullImages: true }); await shotRow(t, 'content-car-cullinan-row', '컬리넌'); await t.close();
  t = await openSession(browser, 'result', { preset: 'guest', locale: 'ko', width: 390 });
  await t.goto('/box/home-lg'); await t.wait('#reviews'); await t.settle(); await shotRow(t, 'content-wrong-grinder-perfume', '향수 인증합니다'); await t.close();
  t = await openSession(browser, 'result', { preset: 'guest', locale: 'ko', width: 390 });
  await t.goto('/box/gaming-playstation'); await t.wait('#reviews'); await t.settle(); await shotRow(t, 'content-wrong-mousefeet-mouse', '마우스 받았슴다'); await t.close();
  t = await openSession(browser, 'result', { preset: 'guest', locale: 'ko', width: 390 });
  await t.goto('/box/audio-sony'); await t.wait('#reviews'); await t.settle(); await shotRow(t, 'content-wrong-splitter-quiet', '세상 조용해요'); await t.close();
} finally { await browser.close(); }
await saveJson('content-shots.json', out);
console.log(JSON.stringify(out, null, 1));
