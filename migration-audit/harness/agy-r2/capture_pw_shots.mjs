import fs from 'node:fs';
import path from 'node:path';
import { launch, newContext, routeUrl, parseBase, settle, makeFixedState, installState } from '../lib/common.mjs';

const origBase = parseBase('http://127.0.0.1:4175/voila-test-aresjoo');
const resBase = parseBase('http://127.0.0.1:4176/voila-test-aresjoo');
const screenshotsDir = 'migration-audit/screenshots/r2-agy';

const browser = await launch();

for (const build of [{ name: 'ORIG', base: origBase }, { name: 'RES', base: resBase }]) {
  const ctx = await newContext(browser, { width: 390, locale: 'ko' });
  const state = await makeFixedState('funded', 'ko');
  await installState(ctx, state, build.base.origin);

  const page = await ctx.newPage();
  await page.goto(routeUrl(build.base.base, 'ko', '/account'));
  await settle(page);

  const pwBtn = await page.$('.v-row:has-text("비밀번호")');
  await pwBtn.click();
  await page.waitForTimeout(600);

  const btn = await page.$('.v-sheet button:has-text("비밀번호 바꾸기")');
  const inputs = await page.$$('.v-sheet input');
  await inputs[1].fill('NewValidPassword123!');
  await inputs[2].fill('12');
  await page.waitForTimeout(600);
  await btn.click();
  await page.waitForTimeout(400);

  const shot = path.join(screenshotsDir, `E_${build.name}_pw_error_line.png`);
  await page.screenshot({ path: shot });
  console.log(`Saved ${shot}`);

  await ctx.close();
}

await browser.close();
