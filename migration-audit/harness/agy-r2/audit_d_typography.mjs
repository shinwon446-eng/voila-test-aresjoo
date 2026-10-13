import fs from 'node:fs';
import path from 'node:path';
import { launch, newContext, routeUrl, parseBase, settle, makeFixedState, installState } from '../lib/common.mjs';

const origBase = parseBase('http://127.0.0.1:4175/voila-test-aresjoo');
const resBase = parseBase('http://127.0.0.1:4176/voila-test-aresjoo');

const screenshotsDir = 'migration-audit/screenshots/r2-agy';
fs.mkdirSync(screenshotsDir, { recursive: true });

const WIDTHS = [320, 360];
const LOCALES = ['en', 'zh'];
const ROUTES = ['/', '/box/gaming-playstation', '/wallet', '/inventory'];

async function runTypographyAudit() {
  console.log('Starting Part (D) Typography & Wrapping Audit...');
  const browser = await launch();
  const results = [];

  const largeBalance = 99999999;
  const largeWallet = {
    balance: largeBalance,
    cryptoBalance: largeBalance,
    cardBalance: 0,
    transactions: [
      { id: 'tx-large-1', accountId: 'capture-account', type: 'bonus', amountUsdt: largeBalance, ref: 'whale-seed', at: new Date().toISOString() }
    ],
    settledDepositRefs: [],
    totalDeposited: 0,
    totalDepositedCrypto: 0,
    totalDepositedCard: 0,
    totalWagered: 0,
    welcomeClaimed: true,
  };

  const currencyOverrides = {
    'gachaflix.currency': JSON.stringify({ state: { currency: 'KRW' }, version: 0 }),
    'voila.currency': JSON.stringify({ state: { currency: 'KRW' }, version: 0 }),
    'gachaflix.wallet': JSON.stringify({ state: largeWallet, version: 4 }),
    'voila.browser-wallet.capture-account': JSON.stringify({ state: largeWallet, version: 4 }),
  };

  for (const locale of LOCALES) {
    for (const width of WIDTHS) {
      for (const routePath of ROUTES) {
        for (const build of [{ name: 'ORIG', base: origBase }, { name: 'RES', base: resBase }]) {
          const testId = `${build.name}_${locale}_${width}_${routePath.replace(/\//g, '_')}`;
          console.log(`[TYPO] Checking ${testId}...`);

          const state = await makeFixedState('inventory', locale, currencyOverrides);
          const ctx = await newContext(browser, { width, locale });
          await installState(ctx, state, build.base.origin);

          const page = await ctx.newPage();
          const url = routeUrl(build.base.base, locale, routePath);
          await page.goto(url, { waitUntil: 'domcontentloaded' });
          await settle(page);

          // Measure overflow and typography
          const evalData = await page.evaluate(() => {
            const de = document.documentElement;
            const overflowX = Math.max(de.scrollWidth, document.body.scrollWidth) > window.innerWidth;
            const scrollWidth = de.scrollWidth;
            const clientWidth = de.clientWidth;

            // Check elements with text overflow or ellipsis
            const elements = Array.from(document.querySelectorAll('.v-num, .v-card-title, .v-item-name, .v-itemrow-name, .v-title, .v-balance, .v-header-in, .v-openbar'));
            const elementMetrics = elements.map(el => {
              const r = el.getBoundingClientRect();
              const s = getComputedStyle(el);
              const isEllipsis = s.textOverflow === 'ellipsis';
              const isClipped = el.scrollWidth > el.clientWidth;
              return {
                tag: el.tagName.toLowerCase(),
                cls: el.className,
                text: el.innerText.slice(0, 100),
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth,
                isEllipsis,
                isClipped,
                overflow: s.overflow,
                whiteSpace: s.whiteSpace,
                rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
              };
            });

            // Check overlapping sibling text elements
            const overlaps = [];
            for (let i = 0; i < elements.length; i++) {
              for (let j = i + 1; j < elements.length; j++) {
                const r1 = elements[i].getBoundingClientRect();
                const r2 = elements[j].getBoundingClientRect();
                if (r1.width <= 0 || r1.height <= 0 || r2.width <= 0 || r2.height <= 0) continue;
                // If they are siblings or within same container
                if (elements[i].parentElement === elements[j].parentElement) {
                  const xOverlap = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
                  const yOverlap = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
                  if (xOverlap > 2 && yOverlap > 2) {
                    overlaps.push({
                      el1: elements[i].className,
                      text1: elements[i].innerText.slice(0, 40),
                      el2: elements[j].className,
                      text2: elements[j].innerText.slice(0, 40),
                      overlapArea: Math.round(xOverlap * yOverlap),
                    });
                  }
                }
              }
            }

            return {
              overflowX,
              scrollWidth,
              clientWidth,
              clippedCount: elementMetrics.filter(e => e.isClipped).length,
              elements: elementMetrics.filter(e => e.isClipped || e.isEllipsis || e.cls.includes('v-num')),
              overlaps,
            };
          });

          const shot = path.join(screenshotsDir, `D_${testId}.png`);
          await page.screenshot({ path: shot });

          results.push({
            testId,
            build: build.name,
            locale,
            width,
            route: routePath,
            evalData,
            shot,
          });

          await ctx.close();
        }
      }
    }
  }

  await browser.close();

  const outPath = 'migration-audit/harness/agy-r2/audit_d_results.json';
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Part (D) Complete! Output written to ${outPath}`);
}

if (process.argv[1] === import.meta.filename) {
  runTypographyAudit().catch(err => {
    console.error('Fatal in audit_d:', err);
    process.exit(1);
  });
}
