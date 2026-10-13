import { launch, newContext, routeUrl, parseBase, settle, makeFixedState, installState } from '../lib/common.mjs';

const origBase = parseBase('http://127.0.0.1:4175/voila-test-aresjoo');
const resBase = parseBase('http://127.0.0.1:4176/voila-test-aresjoo');

const browser = await launch();
const ctx = await newContext(browser, { width: 390, locale: 'ko' });
const state = await makeFixedState('funded', 'ko');
await installState(ctx, state, origBase.origin);

const page = await ctx.newPage();
await page.goto(routeUrl(origBase.base, 'ko', '/account'));
await settle(page);

const pwBtn = await page.$('.v-row:has-text("비밀번호")');
await pwBtn.click();
await page.waitForTimeout(600);

const sheetInfo = await page.evaluate(() => {
  const sheet = document.querySelector('.v-sheet');
  if (!sheet) return 'no sheet';
  const btns = Array.from(sheet.querySelectorAll('button')).map(b => ({ text: b.innerText, cls: b.className }));
  const inputs = Array.from(sheet.querySelectorAll('input')).map(i => ({ type: i.type, name: i.name, placeholder: i.placeholder }));
  return { btns, inputs };
});
console.log('Sheet info:', sheetInfo);

await browser.close();
