// 준비용 탐색: 박스 화면의 수량 알약과 열기 단추의 글, 홈 카드 수, 옛 박스 목록, 저장 키. 두 빌드에서 같은지 본다.
import { readdirSync } from 'node:fs';
import { launch, openSession, saveJson, SEL } from './lib.mjs';

const browser = await launch();
const out = {};
try {
  for (const build of ['orig', 'result']) {
    const t = await openSession(browser, build, { preset: 'funded', width: 390 });
    const info = {};
    for (const slug of ['dollar-apple', 'gaming-playstation', 'pokemon-charizard', 'watch-rolex']) {
      await t.goto('/box/' + slug); await t.wait(SEL.open);
      info[slug] = { chips: await t.page.locator(SEL.qty).allInnerTexts(), open: await t.page.locator(SEL.open).innerText(), reviewsHtml: (await t.page.locator('#reviews').innerHTML()).length };
    }
    await t.goto(''); await t.wait('.v-boxgrid');
    for (let i = 0; i < 40; i++) { const more = t.page.locator('.v-main .v-btn--quiet').last(); if (!(await more.isVisible().catch(() => false))) break; await more.click(); await t.page.waitForTimeout(80); }
    const home = await t.page.evaluate(() => Array.from(document.querySelectorAll('.v-boxcard')).map((a) => a.getAttribute('href').split('/').filter(Boolean).pop()));
    info.homeCards = home.length;
    info.homeSlugs = home;
    info.storageKeys = Object.keys(await t.storage()).sort();
    info.errors = t.errors;
    out[build] = info;
    await t.close();
  }
} finally { await browser.close(); }
const all = readdirSync('C:/Users/hyun1/dev/VOILA-audit-out/after-final/ko/box');
out.legacy = all.filter((s) => !out.result.homeSlugs.includes(s));
out.allBoxDirs = all.length;
out.sameHome = JSON.stringify(out.orig.homeSlugs) === JSON.stringify(out.result.homeSlugs);
for (const b of ['orig', 'result']) { out[b].homeSlugsFirst = out[b].homeSlugs.slice(0, 12); delete out[b].homeSlugs; }
console.log(JSON.stringify(out, null, 1));
await saveJson('probe.json', out);
