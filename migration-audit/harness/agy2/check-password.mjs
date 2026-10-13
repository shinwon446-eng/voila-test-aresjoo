import { launch, newContext, parseBase, makeFixedState, installState } from '../lib/common.mjs';

async function main() {
  const browser = await launch();
  for (const b of ['original', 'result']) {
    const port = b === 'original' ? 4175 : 4176;
    const ctx = await newContext(browser, { width: 390, locale: 'ko' });
    const target = parseBase(`http://127.0.0.1:${port}/voila-test-aresjoo`);
    const state = await makeFixedState('funded', 'ko');
    await installState(ctx, state, target.origin);
    const page = await ctx.newPage();
    await page.goto(`${target.base}/ko/account`, { waitUntil: 'domcontentloaded' });
    const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map((b) => b.innerText.trim()));
    const pwBtn = page.locator('button').filter({ hasText: '비밀번호' }).first();
    const visible = await pwBtn.isVisible();
    let sheetText = null;
    let fields = [];
    if (visible) {
      await pwBtn.click();
      await page.waitForTimeout(400);
      sheetText = await page.locator('.v-sheet').first().innerText().catch(() => null);
      fields = await page.evaluate(() => Array.from(document.querySelectorAll('.v-sheet input')).map((i) => ({ type: i.type, name: i.name, placeholder: i.placeholder })));
    }
    console.log(b, { visible, buttons: buttons.slice(0, 10), fields, sheetText: sheetText ? sheetText.slice(0, 200) : null });
    await ctx.close();
  }
  await browser.close();
}

main().catch(console.error);
