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
  await pwBtn.click();
  await page.waitForTimeout(600);

  const btn = await page.$('.v-sheet button:has-text("비밀번호 바꾸기")');

  // Test 1: Click with empty inputs
  await page.waitForTimeout(600); // 350ms delay
  await btn.click();
  await page.waitForTimeout(300);

  const err1 = await page.evaluate(() => {
    const el = document.querySelector('.v-sheet .v-line[data-fail], .v-sheet .v-line, .v-sheet [role="alert"]');
    return el ? el.innerText : null;
  });
  console.log(`${build.name} Empty input error:`, err1);

  // Test 2: Fill next with short password
  const inputs = await page.$$('.v-sheet input');
  await inputs[1].fill('short');
  await page.waitForTimeout(600);
  await btn.click();
  await page.waitForTimeout(300);

  const err2 = await page.evaluate(() => {
    const el = document.querySelector('.v-sheet .v-line[data-fail], .v-sheet .v-line, .v-sheet [role="alert"]');
    return el ? el.innerText : null;
  });
  console.log(`${build.name} Short password error:`, err2);

  // Test 3: Fill valid next password, invalid code
  await inputs[1].fill('NewValidPassword123!');
  await inputs[2].fill('12');
  await page.waitForTimeout(600);
  await btn.click();
  await page.waitForTimeout(300);

  const err3 = await page.evaluate(() => {
    const el = document.querySelector('.v-sheet .v-line[data-fail], .v-sheet .v-line, .v-sheet [role="alert"]');
    return el ? el.innerText : null;
  });
  console.log(`${build.name} Invalid code error:`, err3);

  await ctx.close();
}

await browser.close();
