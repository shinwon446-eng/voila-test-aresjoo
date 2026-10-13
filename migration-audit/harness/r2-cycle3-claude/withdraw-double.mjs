// 출금의 마지막 단추를 같은 순간에 두 번, 그리고 0.2초 뒤에 한 번 더 누른다. 접수와 차감이 한 번만 생기는지 두 빌드에서 본다.
import { launch, openSession, saveJson } from './lib.mjs';

const ADDRESS = 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE';
const browser = await launch();
const out = {};
try {
  for (const build of ['orig', 'result']) {
    const t = await openSession(browser, build, { preset: 'funded', width: 390, fixedClock: false });
    try {
      const ledger = async () => { const s = await t.storage(); const w = s['voila.browser-wallet.capture-account']?.state ?? {}; const account = (s['voila.browser-accounts.v1'] ?? [])[0] ?? {}; return { crypto: w.cryptoBalance, withdraws: (w.transactions ?? []).filter((x) => x.type === 'withdraw').map((x) => ({ amountUsdt: x.amountUsdt, status: x.status, requestedUsdt: x.requestedUsdt ?? null })), service: Object.values(account.withdrawals ?? {}).map((x) => x.status), code: account.challenge?.code ?? null }; };
      await t.goto('/wallet/withdraw'); await t.wait('.v-main .v-links .v-link'); await t.page.getByText('이메일 인증으로 출금', { exact: false }).click();
      await t.wait('form .v-input'); await t.page.locator('form .v-input').nth(0).fill(ADDRESS); await t.page.locator('form .v-input').nth(1).fill('50');
      await t.page.locator('form button[type="submit"]').click();
      await t.page.getByRole('button', { name: '인증하고 출금' }).click();
      await t.page.getByRole('button', { name: '코드 보내기' }).click(); await t.wait('form .v-input');
      await t.page.locator('form .v-input').fill((await ledger()).code);
      await t.page.evaluate(() => { const b = document.querySelector('form button[type="submit"]'); b.click(); b.click(); setTimeout(() => document.querySelector('form button[type="submit"]')?.click(), 200); });
      await t.page.waitForTimeout(3500);
      out[build] = { text: (await t.page.locator('.v-main').innerText()).replace(/\s+/g, ' ').slice(0, 160), ledger: await ledger(), errors: t.errors };
    } catch (error) { out[build] = { error: String(error.message).split('\n')[0] }; }
    await t.close();
  }
} finally { await browser.close(); }
await saveJson('withdraw-double.json', out);
console.log(JSON.stringify(out, null, 1));
