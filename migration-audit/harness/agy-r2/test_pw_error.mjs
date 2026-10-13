import { launch, newContext, routeUrl, parseBase, settle, makeFixedState, installState } from '../lib/common.mjs';

const origBase = parseBase('http://127.0.0.1:4175/voila-test-aresjoo');
const resBase = parseBase('http://127.0.0.1:4176/voila-test-aresjoo');

const browser = await launch();

for (const build of [{ name: 'ORIG', base: origBase }, { name: 'RES', base: resBase }]) {
  const ctx = await newContext(browser, { width: 390, locale: 'ko' });
  const state = await makeFixedState('funded', 'ko');
  await installState(ctx, state, build.base.origin);

  const page = await ctx.newPage();
  await page.goto(routeUrl(build.base.base, 'ko', '/account'));
  await settle(page);

  const pwBtn = await page.$('.v-row:has-text("비밀번호")');
  if (pwBtn) {
    await pwBtn.click();
    await page.waitForTimeout(600);

    // Click save with empty inputs
    const saveBtn = await page.$('.v-sheet .v-btn--primary, .v-sheet button:has-text("저장")');
    if (saveBtn) {
      await saveBtn.click();
      await page.waitForTimeout(400);

      const errorText = await page.evaluate(() => {
        const el = document.querySelector('.v-sheet .v-line[data-fail], .v-sheet .v-line, .v-sheet [role="alert"]');
        return el ? el.innerText : 'no error el';
      });
      console.log(`${build.name} validation error text:`, errorText);
    }
  }
  await ctx.close();
}

await browser.close();
