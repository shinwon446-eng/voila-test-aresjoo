#!/usr/bin/env node
/**
 * 모든 라우트를 세 언어로 주소로 바로 들어가 두 빌드를 견준다. 들어간 뒤 새로 고침도 한 번 한다.
 *   node routes.mjs [--presets guest,inventory] [--locales ko,en,zh] [--width 1024]
 * 단계마다 후기 자리 밖의 관찰값, 저장값, 콘솔 오류, 응답 상태를 견준다.
 */
import { both, launch, save, report } from './c3.mjs';

const argv = process.argv.slice(2);
const arg = (name, d) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : d; };
const presets = arg('presets', 'guest,inventory').split(',');
const locales = arg('locales', 'ko,en,zh').split(',');
const width = Number(arg('width', '1024'));

const LEGAL = ['terms', 'privacy', 'refunds', 'fairness', 'faq', 'payments', 'policy', 'safety', 'business', 'complaints', 'cookies', 'community', 'withdrawals'];
const ROUTES = ['', '/about', '/account', '/box/gaming-playstation', '/box/watch-rolex', '/box/dollar-apple', '/box/vault-pokemon', '/box/no-such-box', '/community', '/community/board', '/dev/gallery', '/fairness', '/guide', '/inventory', '/legal',
  ...LEGAL.map((d) => '/legal/' + d), '/legal/no-such-doc', '/profile', '/reviews', '/reviews?box=gaming-playstation', '/reviews?box=dollar-apple', '/reviews?box=no-such-box', '/reviews?box=', '/verify', '/verify?s=parity-audit-server-seed-0001&c=parity-audit-client-seed&n=0&box=dollar-apple', '/verify?box=no-such-box&n=abc',
  '/wallet', '/wallet/withdraw', '/wins', '/no-such-page', '/box', '/box/'];

const browser = await launch();
try {
  for (const preset of presets) for (const locale of locales) {
    const result = await both(browser, `routes-${preset}-${locale}-${width}`, { preset, locale, width }, async (t, step) => {
      for (const route of ROUTES) {
        let status = null;
        const entry = await step(`들어가기 ${route || '/'}`, async () => { status = await t.goto(route); await t.idle(500); });
        entry.observed = { ...entry.observed, httpStatus: status };
        await step(`새로 고침 ${route || '/'}`, async () => { await t.page.reload({ waitUntil: 'domcontentloaded' }); await t.idle(500); });
      }
    });
    console.log(report(result, { max: 4 }));
    await save(`routes-${preset}-${locale}-${width}.json`, result);
  }
} finally { await browser.close(); }
