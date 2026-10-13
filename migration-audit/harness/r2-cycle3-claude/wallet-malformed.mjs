// 계정 번호가 없고 시각이 깨진 거래 한 줄이 저장돼 있을 때의 지갑 화면(두 빌드). 원본은 그 줄을 보여 주지 않는다.
import { launch, openSession, saveJson, patchLedger } from './lib.mjs';

const browser = await launch();
const out = {};
try {
  for (const build of ['orig', 'result']) {
    const t = await openSession(browser, build, { preset: 'funded', width: 390, mutate: (state) => patchLedger(state, (box) => { box.wallet.transactions.push({ id: 'bad-1', type: 'open', amountUsdt: -1, ref: 'bad', at: 'not-a-date' }); }) });
    try {
      await t.goto('/wallet'); await t.page.waitForTimeout(2500);
      out[build] = await t.page.evaluate(() => ({ h1: document.querySelector('h1')?.innerText ?? null, rows: document.querySelectorAll('.v-main .v-itemrow').length, hasMain: !!document.querySelector('.v-main'), body: document.body.innerText.replace(/\s+/g, ' ').slice(0, 260), header: document.querySelector('[data-balance-open]')?.innerText ?? null }));
      out[build].errors = t.errors.map((e) => e.slice(0, 120));
      await t.shot(`robust-wallet-malformed-${build}`);
      // 다른 화면은 여전히 열리는가
      await t.goto('/inventory'); await t.page.waitForTimeout(1200); out[build].inventoryH1 = await t.page.evaluate(() => document.querySelector('h1')?.innerText ?? null);
    } catch (error) { out[build] = { error: String(error.message).split('\n')[0] }; }
    await t.close();
  }
} finally { await browser.close(); }
await saveJson('wallet-malformed.json', out);
console.log(JSON.stringify(out, null, 1));
