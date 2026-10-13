import fs from 'node:fs';
import path from 'node:path';
import { launch, newContext, routeUrl, parseBase, settle, makeFixedState, installState } from '../lib/common.mjs';

const origBase = parseBase('http://127.0.0.1:4175/voila-test-aresjoo');
const resBase = parseBase('http://127.0.0.1:4176/voila-test-aresjoo');

const screenshotsDir = 'migration-audit/screenshots/r2-agy';
fs.mkdirSync(screenshotsDir, { recursive: true });

async function runHiddenAudit() {
  console.log('Starting Part (C) Hidden UI States Audit on BOTH builds...');
  const browser = await launch();
  const results = [];

  const scenarios = [
    // 1. Empty States: Inventory, Wallet transactions, Search
    { id: 'empty_inventory', name: 'Empty inventory state' },
    { id: 'empty_wallet', name: 'Empty wallet transactions state' },
    { id: 'empty_search', name: 'Empty search results state' },

    // 2. Inline Error Lines
    { id: 'inline_error_withdraw_min', name: 'Withdrawal below minimum error' },
    { id: 'inline_error_withdraw_addr', name: 'Withdrawal invalid address error' },
    { id: 'inline_error_password_sheet', name: 'Password sheet error lines' },

    // 3. Toasts
    { id: 'toast_copy', name: 'Toast appearance and auto-dismiss' },

    // 4. Nested Sheets
    { id: 'nested_sheets', name: 'Nested sheets stacking and scrim' },

    // 5. Scroll lock and focus trap
    { id: 'scroll_lock_focus_trap', name: 'Scroll lock and focus trap on sheet' },

    // 6. Escape and outside press
    { id: 'escape_outside_press', name: 'Escape key and scrim backdrop click' },

    // 7. Back button with sheet open
    { id: 'back_button_with_sheet', name: 'Back button behavior when sheet is open' },

    // 8. Tooltips and title attributes
    { id: 'tooltips_and_titles', name: 'Tooltips and title attributes check' },
  ];

  for (const scenario of scenarios) {
    console.log(`Running scenario: ${scenario.id}...`);

    for (const build of [{ name: 'ORIG', base: origBase }, { name: 'RES', base: resBase }]) {
      const bName = build.name;
      const bBase = build.base;

      if (scenario.id === 'empty_inventory') {
        const state = await makeFixedState('zero', 'ko');
        const ctx = await newContext(browser, { width: 390, locale: 'ko' });
        await installState(ctx, state, bBase.origin);
        const page = await ctx.newPage();
        await page.goto(routeUrl(bBase.base, 'ko', '/inventory'));
        await settle(page);
        const emptyEl = await page.$('.v-empty');
        const emptyText = emptyEl ? await emptyEl.innerText() : null;
        const shot = path.join(screenshotsDir, `C_${bName}_empty_inventory.png`);
        await page.screenshot({ path: shot });
        results.push({ scenario: scenario.id, build: bName, emptyFound: Boolean(emptyEl), emptyText, shot });
        await ctx.close();
      }

      else if (scenario.id === 'empty_wallet') {
        const state = await makeFixedState('zero', 'ko');
        const ctx = await newContext(browser, { width: 390, locale: 'ko' });
        await installState(ctx, state, bBase.origin);
        const page = await ctx.newPage();
        await page.goto(routeUrl(bBase.base, 'ko', '/wallet'));
        await settle(page);
        const emptyEl = await page.$('.v-empty, .v-itemrows:empty, .v-table:empty');
        const emptyText = emptyEl ? await emptyEl.innerText() : null;
        const shot = path.join(screenshotsDir, `C_${bName}_empty_wallet.png`);
        await page.screenshot({ path: shot });
        results.push({ scenario: scenario.id, build: bName, emptyFound: Boolean(emptyEl), emptyText, shot });
        await ctx.close();
      }

      else if (scenario.id === 'empty_search') {
        const state = await makeFixedState('funded', 'ko');
        const ctx = await newContext(browser, { width: 390, locale: 'ko' });
        await installState(ctx, state, bBase.origin);
        const page = await ctx.newPage();
        await page.goto(routeUrl(bBase.base, 'ko', '/'));
        await settle(page);
        const searchInput = await page.$('.v-search input, input[type="search"]');
        if (searchInput) {
          await searchInput.fill('xyznonexistentsearchquery123');
          await page.waitForTimeout(300);
          await settle(page);
        }
        const emptyEl = await page.$('.v-empty');
        const emptyText = emptyEl ? await emptyEl.innerText() : null;
        const shot = path.join(screenshotsDir, `C_${bName}_empty_search.png`);
        await page.screenshot({ path: shot });
        results.push({ scenario: scenario.id, build: bName, emptyFound: Boolean(emptyEl), emptyText, shot });
        await ctx.close();
      }

      else if (scenario.id === 'inline_error_withdraw_min') {
        const state = await makeFixedState('funded', 'ko');
        const ctx = await newContext(browser, { width: 390, locale: 'ko' });
        await installState(ctx, state, bBase.origin);
        const page = await ctx.newPage();
        await page.goto(routeUrl(bBase.base, 'ko', '/wallet/withdraw'));
        await settle(page);
        const amountInput = await page.$('input[name="amount"], input[type="number"], .v-field input');
        if (amountInput) {
          await amountInput.fill('0.5'); // below min
          await page.waitForTimeout(200);
        }
        const submitBtn = await page.$('button[type="submit"], .v-btn--primary, .v-withdraw-btn');
        if (submitBtn) await submitBtn.click();
        await page.waitForTimeout(300);

        const errorEl = await page.$('.v-error, [role="alert"], .v-field-error, .v-msg--error');
        const errorText = errorEl ? await errorEl.innerText() : null;
        const shot = path.join(screenshotsDir, `C_${bName}_error_withdraw_min.png`);
        await page.screenshot({ path: shot });
        results.push({ scenario: scenario.id, build: bName, errorFound: Boolean(errorEl), errorText, shot });
        await ctx.close();
      }

      else if (scenario.id === 'inline_error_password_sheet') {
        const state = await makeFixedState('funded', 'ko');
        const ctx = await newContext(browser, { width: 390, locale: 'ko' });
        await installState(ctx, state, bBase.origin);
        const page = await ctx.newPage();
        await page.goto(routeUrl(bBase.base, 'ko', '/account'));
        await settle(page);

        // Click change password button to open sheet
        const pwBtn = await page.$('button:has-text("비밀번호"), .v-link:has-text("비밀번호"), [data-action="password"]');
        if (pwBtn) {
          await pwBtn.click();
          await page.waitForTimeout(500);
        }
        // Fill wrong current password or mismatching passwords
        const inputs = await page.$$('.v-sheet input');
        if (inputs.length >= 3) {
          await inputs[0].fill('wrongpassword123');
          await inputs[1].fill('newpass1234');
          await inputs[2].fill('mismatched5678');
        }
        const submitBtn = await page.$('.v-sheet button[type="submit"], .v-sheet .v-btn--primary');
        if (submitBtn) {
          // Note: result build may ignore presses for 350ms, wait 600ms
          await page.waitForTimeout(600);
          await submitBtn.click();
          await page.waitForTimeout(400);
        }
        const errors = await page.$$eval('.v-sheet .v-error, .v-sheet [role="alert"], .v-sheet .v-msg--error, .v-sheet .v-field-error', els => els.map(e => e.innerText));
        const shot = path.join(screenshotsDir, `C_${bName}_password_errors.png`);
        await page.screenshot({ path: shot });
        results.push({ scenario: scenario.id, build: bName, errorCount: errors.length, errors, shot });
        await ctx.close();
      }

      else if (scenario.id === 'toast_copy') {
        const state = await makeFixedState('funded', 'ko');
        const ctx = await newContext(browser, { width: 390, locale: 'ko' });
        await installState(ctx, state, bBase.origin);
        const page = await ctx.newPage();
        await page.goto(routeUrl(bBase.base, 'ko', '/verify'));
        await settle(page);

        // Find a copy button (e.g. copy server seed or client seed)
        const copyBtn = await page.$('button:has-text("복사"), [data-copy], .v-btn-copy');
        let toastSeen = false;
        let toastText = null;
        if (copyBtn) {
          await copyBtn.click();
          await page.waitForTimeout(200);
          const toastEl = await page.$('.v-toast');
          if (toastEl) {
            toastSeen = true;
            toastText = await toastEl.innerText();
          }
        }
        const shot = path.join(screenshotsDir, `C_${bName}_toast_copy.png`);
        await page.screenshot({ path: shot });
        results.push({ scenario: scenario.id, build: bName, toastSeen, toastText, shot });
        await ctx.close();
      }

      else if (scenario.id === 'nested_sheets') {
        const state = await makeFixedState('funded', 'ko');
        const ctx = await newContext(browser, { width: 390, locale: 'ko' });
        await installState(ctx, state, bBase.origin);
        const page = await ctx.newPage();
        await page.goto(routeUrl(bBase.base, 'ko', '/box/gaming-playstation'));
        await settle(page);

        // Open single box opening
        const openBtn = await page.$('.v-openbar button.v-btn, [data-open-primary]');
        if (openBtn) {
          await openBtn.click();
          // Wait 600ms if confirm dialog opens
          await page.waitForTimeout(600);
          const confirmBtn = await page.$('[role="alertdialog"] .v-btn');
          if (confirmBtn) await confirmBtn.click();
          await page.waitForTimeout(1400); // reach reveal/ready
        }

        // Now from reveal/ready screen, click take USDT which opens take confirm sheet
        const takeBtn = await page.$('.v-op-actions button:has-text("USDT"), [data-action="take"]');
        let nestedSheetOpened = false;
        if (takeBtn) {
          await takeBtn.click();
          await page.waitForTimeout(500);
          const sheetEls = await page.$$('.v-sheet');
          nestedSheetOpened = sheetEls.length > 0;
        }

        const metrics = await page.evaluate(() => {
          const sheets = Array.from(document.querySelectorAll('.v-sheet')).map(s => {
            const cs = getComputedStyle(s);
            return { zIndex: cs.zIndex, opacity: cs.opacity, transform: cs.transform };
          });
          const scrim = document.querySelector('.v-scrim');
          return {
            sheetCount: sheets.length,
            sheets,
            scrimBg: scrim ? getComputedStyle(scrim).backgroundColor : null,
          };
        });

        const shot = path.join(screenshotsDir, `C_${bName}_nested_sheets.png`);
        await page.screenshot({ path: shot });
        results.push({ scenario: scenario.id, build: bName, nestedSheetOpened, metrics, shot });
        await ctx.close();
      }

      else if (scenario.id === 'scroll_lock_focus_trap') {
        const state = await makeFixedState('funded', 'ko');
        const ctx = await newContext(browser, { width: 390, locale: 'ko' });
        await installState(ctx, state, bBase.origin);
        const page = await ctx.newPage();
        await page.goto(routeUrl(bBase.base, 'ko', '/account'));
        await settle(page);

        // Open password sheet
        const pwBtn = await page.$('button:has-text("비밀번호"), .v-link:has-text("비밀번호")');
        if (pwBtn) {
          await pwBtn.click();
          await page.waitForTimeout(500);
        }

        const scrollLock = await page.evaluate(() => {
          const bodyStyle = getComputedStyle(document.body);
          const htmlStyle = getComputedStyle(document.documentElement);
          return {
            bodyOverflow: bodyStyle.overflow,
            htmlOverflow: htmlStyle.overflow,
            bodyPosition: bodyStyle.position,
          };
        });

        // Test focus cycling
        await page.keyboard.press('Tab');
        const focused1 = await page.evaluate(() => document.activeElement ? document.activeElement.tagName + '.' + document.activeElement.className : null);
        await page.keyboard.press('Tab');
        const focused2 = await page.evaluate(() => document.activeElement ? document.activeElement.tagName + '.' + document.activeElement.className : null);

        const shot = path.join(screenshotsDir, `C_${bName}_scroll_lock.png`);
        await page.screenshot({ path: shot });
        results.push({ scenario: scenario.id, build: bName, scrollLock, focused1, focused2, shot });
        await ctx.close();
      }

      else if (scenario.id === 'escape_outside_press') {
        const state = await makeFixedState('funded', 'ko');
        const ctx = await newContext(browser, { width: 390, locale: 'ko' });
        await installState(ctx, state, bBase.origin);
        const page = await ctx.newPage();
        await page.goto(routeUrl(bBase.base, 'ko', '/account'));
        await settle(page);

        // Open password sheet
        const pwBtn = await page.$('button:has-text("비밀번호"), .v-link:has-text("비밀번호")');
        if (pwBtn) {
          await pwBtn.click();
          await page.waitForTimeout(500);
        }

        let sheetBefore = (await page.$$('.v-sheet')).length;

        // Press Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        let sheetAfterEsc = (await page.$$('.v-sheet')).length;

        // Re-open and click scrim
        if (pwBtn) {
          await pwBtn.click();
          await page.waitForTimeout(500);
        }
        const scrim = await page.$('.v-scrim');
        if (scrim) {
          // click top left of scrim (outside sheet)
          await scrim.click({ position: { x: 20, y: 20 } });
          await page.waitForTimeout(300);
        }
        let sheetAfterScrim = (await page.$$('.v-sheet')).length;

        const shot = path.join(screenshotsDir, `C_${bName}_escape_outside.png`);
        await page.screenshot({ path: shot });
        results.push({ scenario: scenario.id, build: bName, sheetBefore, sheetAfterEsc, sheetAfterScrim, shot });
        await ctx.close();
      }

      else if (scenario.id === 'back_button_with_sheet') {
        const state = await makeFixedState('funded', 'ko');
        const ctx = await newContext(browser, { width: 390, locale: 'ko' });
        await installState(ctx, state, bBase.origin);
        const page = await ctx.newPage();
        await page.goto(routeUrl(bBase.base, 'ko', '/'));
        await settle(page);
        await page.goto(routeUrl(bBase.base, 'ko', '/account'));
        await settle(page);

        // Open password sheet
        const pwBtn = await page.$('button:has-text("비밀번호"), .v-link:has-text("비밀번호")');
        if (pwBtn) {
          await pwBtn.click();
          await page.waitForTimeout(500);
        }

        // Trigger browser back
        await page.goBack();
        await page.waitForTimeout(500);
        const currentUrl = page.url();
        const sheetCount = (await page.$$('.v-sheet')).length;

        const shot = path.join(screenshotsDir, `C_${bName}_back_button.png`);
        await page.screenshot({ path: shot });
        results.push({ scenario: scenario.id, build: bName, currentUrl, sheetCount, shot });
        await ctx.close();
      }

      else if (scenario.id === 'tooltips_and_titles') {
        const state = await makeFixedState('funded', 'ko');
        const ctx = await newContext(browser, { width: 390, locale: 'ko' });
        await installState(ctx, state, bBase.origin);
        const page = await ctx.newPage();
        await page.goto(routeUrl(bBase.base, 'ko', '/box/gaming-playstation'));
        await settle(page);

        const titles = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('[title], [aria-label], [data-tooltip]')).map(el => ({
            tag: el.tagName.toLowerCase(),
            cls: el.className,
            title: el.getAttribute('title'),
            ariaLabel: el.getAttribute('aria-label'),
            dataTooltip: el.getAttribute('data-tooltip'),
          })).slice(0, 20);
        });

        const shot = path.join(screenshotsDir, `C_${bName}_tooltips.png`);
        await page.screenshot({ path: shot });
        results.push({ scenario: scenario.id, build: bName, titleCount: titles.length, titles, shot });
        await ctx.close();
      }
    }
  }

  await browser.close();

  const outPath = 'migration-audit/harness/agy-r2/audit_c_results.json';
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Part (C) Complete! Output written to ${outPath}`);
}

if (process.argv[1] === import.meta.filename) {
  runHiddenAudit().catch(err => {
    console.error('Fatal in audit_c:', err);
    process.exit(1);
  });
}
