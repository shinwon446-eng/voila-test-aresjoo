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

  // Click password button
  const btns = await page.$$eval('button, a', els => els.map(e => ({ text: e.innerText, cls: e.className })));
  console.log(`${build.name} account buttons:`, btns.filter(b => b.text.includes('비밀번호') || b.text.includes('Password') || b.text.includes('설정')));

  const pwBtn = await page.$('.v-row:has-text("비밀번호"), button:has-text("비밀번호")');
  if (pwBtn) {
    await pwBtn.click();
    await page.waitForTimeout(600);
    const sheetHtml = await page.evaluate(() => {
      const s = document.querySelector('.v-sheet');
      return s ? s.outerHTML : 'no sheet';
    });
    console.log(`${build.name} sheet:`, sheetHtml.slice(0, 500));

    // Try submitting empty or wrong inputs
    const submitBtn = await page.$('.v-sheet button[type="submit"], .v-sheet .v-btn--primary');
    if (submitBtn) {
      await page.waitForTimeout(600);
      await submitBtn.click();
      await page.waitForTimeout(400);
      const errors = await page.$$eval('.v-sheet [role="alert"], .v-sheet .v-error, .v-sheet .v-msg--error, .v-sheet .v-field-error, .v-sheet .v-hint', els => els.map(e => e.innerText));
      console.log(`${build.name} errors:`, errors);
    }
  } else {
    console.log(`${build.name} no pwBtn found`);
  }
  await ctx.close();
}

await browser.close();
