import fs from 'node:fs';
import path from 'node:path';
import { launch, newContext, routeUrl, parseBase, settle, makeFixedState, installState } from '../lib/common.mjs';

const origBase = parseBase('http://127.0.0.1:4175/voila-test-aresjoo');
const resBase = parseBase('http://127.0.0.1:4176/voila-test-aresjoo');

const screenshotsDir = 'migration-audit/screenshots/r2-agy';
fs.mkdirSync(screenshotsDir, { recursive: true });

const WIDTHS = [320, 360, 768, 1920];

async function runIntendedAudit() {
  console.log('Starting Part (E) Intended Areas Quality Audit against DESIGN.md...');
  const browser = await launch();
  const results = [];

  for (const width of WIDTHS) {
    console.log(`Checking intended areas at width ${width}...`);

    for (const build of [{ name: 'ORIG', base: origBase }, { name: 'RES', base: resBase }]) {
      const bName = build.name;
      const bBase = build.base;

      // 1. Box page review section & home product cards
      {
        const state = await makeFixedState('funded', 'ko');
        const ctx = await newContext(browser, { width, locale: 'ko' });
        await installState(ctx, state, bBase.origin);
        const page = await ctx.newPage();

        // Check home cards
        await page.goto(routeUrl(bBase.base, 'ko', '/'));
        await settle(page);

        const cardData = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('.v-boxcard')).slice(0, 4);
          return cards.map(c => {
            const photo = c.querySelector('.v-boxcard-photo');
            const title = c.querySelector('.v-card-title');
            const price = c.querySelector('.v-num, .v-card-price');
            const rating = c.querySelector('.v-boxcard-rating');
            const cs = getComputedStyle(c);
            return {
              bg: cs.backgroundColor,
              radius: cs.borderRadius,
              border: cs.border,
              hasPhoto: Boolean(photo),
              photoImg: photo ? photo.querySelector('img')?.getAttribute('src') : null,
              titleText: title ? title.innerText : null,
              titleWeight: title ? getComputedStyle(title).fontWeight : null,
              priceText: price ? price.innerText : null,
              ratingText: rating ? rating.innerText : null,
            };
          });
        });

        // More button
        const moreBtn = await page.$('.v-boxgrid ~ .v-btn--quiet, button:has-text("더보기")');
        const moreBtnInfo = moreBtn ? await page.evaluate(el => {
          const s = getComputedStyle(el);
          return { text: el.innerText, bg: s.backgroundColor, color: s.color, radius: s.borderRadius };
        }, moreBtn) : null;

        const shotHome = path.join(screenshotsDir, `E_${bName}_home_cards_w${width}.png`);
        await page.screenshot({ path: shotHome });

        // Check box detail reviews
        await page.goto(routeUrl(bBase.base, 'ko', '/box/gaming-playstation'));
        await settle(page);

        const reviewSection = await page.evaluate(() => {
          const sec = document.querySelector('.v-boxlayout-reviews');
          if (!sec) return null;
          const rows = Array.from(sec.querySelectorAll('.v-rvrow, .v-rvcard, .v-itemrow'));
          const ratingBlock = sec.querySelector('.v-rvsum, .v-rating');
          return {
            found: true,
            rowCount: rows.length,
            ratingBlockText: ratingBlock ? ratingBlock.innerText : null,
            sampleRows: rows.slice(0, 3).map(r => ({
              text: r.innerText.slice(0, 100),
              radius: getComputedStyle(r).borderRadius,
              bg: getComputedStyle(r).backgroundColor,
            })),
          };
        });

        const shotBox = path.join(screenshotsDir, `E_${bName}_box_reviews_w${width}.png`);
        await page.screenshot({ path: shotBox });

        // Check /reviews screen
        await page.goto(routeUrl(bBase.base, 'ko', '/reviews'));
        await settle(page);
        const reviewsPageData = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('.v-rvrow, .v-rvcard, .v-itemrow'));
          return {
            title: document.querySelector('.v-title')?.innerText,
            count: rows.length,
            firstRow: rows[0] ? rows[0].innerText.slice(0, 150) : null,
          };
        });
        const shotReviews = path.join(screenshotsDir, `E_${bName}_reviews_screen_w${width}.png`);
        await page.screenshot({ path: shotReviews });

        results.push({
          area: 'reviews_and_cards',
          build: bName,
          width,
          cardData,
          moreBtnInfo,
          reviewSection,
          reviewsPageData,
          shotHome,
          shotBox,
          shotReviews,
        });

        await ctx.close();
      }

      // 2. Wallet history rows & negative amount format
      {
        // Create state with negative transactions, opening transactions, and $0 not-debited
        const customTxs = [
          { id: 'tx-open-1', accountId: 'capture-account', type: 'box_open', boxSlug: 'gaming-playstation', amountUsdt: -50, ref: 'box-open-test', at: new Date().toISOString() },
          { id: 'tx-take-1', accountId: 'capture-account', type: 'take', itemId: 'item-1', amountUsdt: 47.5, ref: 'take-test', at: new Date().toISOString() },
          { id: 'tx-with-0', accountId: 'capture-account', type: 'withdraw', amountUsdt: 0, status: 'FAILED_NOT_DEBITED', feeUsdt: 0, netUsdt: 0, ref: 'zero-not-debited', at: new Date().toISOString() },
          { id: 'tx-with-1', accountId: 'capture-account', type: 'withdraw', amountUsdt: -10, feeUsdt: 1, netUsdt: 9, status: 'COMPLETED', at: new Date().toISOString() },
        ];

        const walletOverride = {
          balance: 9940,
          cryptoBalance: 9940,
          cardBalance: 0,
          transactions: customTxs,
          settledDepositRefs: [],
          totalDeposited: 0,
          totalDepositedCrypto: 0,
          totalDepositedCard: 0,
          totalWagered: 50,
          welcomeClaimed: true,
        };

        const state = await makeFixedState('funded', 'ko', {
          'gachaflix.wallet': JSON.stringify({ state: walletOverride, version: 4 }),
          'voila.browser-wallet.capture-account': JSON.stringify({ state: walletOverride, version: 4 }),
        });

        const ctx = await newContext(browser, { width, locale: 'ko' });
        await installState(ctx, state, bBase.origin);
        const page = await ctx.newPage();

        await page.goto(routeUrl(bBase.base, 'ko', '/wallet'));
        await settle(page);

        const txRows = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('.v-itemrow, .v-row, .v-table-row, [data-tx-id]'));
          return rows.map(r => ({
            text: r.innerText.replace(/\s+/g, ' ').trim(),
            amountText: r.querySelector('.v-num, .v-itemrow-amount, .v-amount')?.innerText,
          }));
        });

        const shotWallet = path.join(screenshotsDir, `E_${bName}_wallet_txs_w${width}.png`);
        await page.screenshot({ path: shotWallet });

        results.push({
          area: 'wallet_transactions',
          build: bName,
          width,
          txRowCount: txRows.length,
          txRows,
          shotWallet,
        });

        await ctx.close();
      }

      // 3. Password sheet error lines
      {
        const state = await makeFixedState('funded', 'ko');
        const ctx = await newContext(browser, { width, locale: 'ko' });
        await installState(ctx, state, bBase.origin);
        const page = await ctx.newPage();

        await page.goto(routeUrl(bBase.base, 'ko', '/account'));
        await settle(page);

        const pwBtn = await page.$('button:has-text("비밀번호"), .v-link:has-text("비밀번호")');
        if (pwBtn) {
          await pwBtn.click();
          await page.waitForTimeout(500);
        }

        const inputs = await page.$$('.v-sheet input');
        if (inputs.length >= 3) {
          await inputs[0].fill('incorrect-current-pass');
          await inputs[1].fill('short');
          await inputs[2].fill('different');
        }

        const submitBtn = await page.$('.v-sheet button[type="submit"], .v-sheet .v-btn--primary');
        if (submitBtn) {
          await page.waitForTimeout(600); // 350ms lock wait
          await submitBtn.click();
          await page.waitForTimeout(400);
        }

        const pwSheetData = await page.evaluate(() => {
          const sheet = document.querySelector('.v-sheet');
          if (!sheet) return null;
          const errors = Array.from(sheet.querySelectorAll('.v-error, [role="alert"], .v-msg--error, .v-field-error')).map(e => e.innerText);
          const fields = Array.from(sheet.querySelectorAll('.v-field')).map(f => ({
            label: f.querySelector('label, .v-field-label')?.innerText,
            error: f.querySelector('.v-error, [role="alert"], .v-msg--error, .v-field-error')?.innerText,
          }));
          return {
            title: sheet.querySelector('.v-title, h2')?.innerText,
            errors,
            fields,
          };
        });

        const shotPw = path.join(screenshotsDir, `E_${bName}_pw_sheet_w${width}.png`);
        await page.screenshot({ path: shotPw });

        results.push({
          area: 'password_sheet_errors',
          build: bName,
          width,
          pwSheetData,
          shotPw,
        });

        await ctx.close();
      }
    }
  }

  await browser.close();

  const outPath = 'migration-audit/harness/agy-r2/audit_e_results.json';
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Part (E) Complete! Output written to ${outPath}`);
}

if (process.argv[1] === import.meta.filename) {
  runIntendedAudit().catch(err => {
    console.error('Fatal in audit_e:', err);
    process.exit(1);
  });
}
