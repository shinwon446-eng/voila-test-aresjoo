import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  launch,
  newContext,
  guardNetwork,
  makeFixedState,
  installState,
  parseBase,
  routeUrl,
  settle,
  parseArgs,
  FREEZE_CSS,
} from '../lib/common.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../');
const SHOTS_OUT = path.resolve(ROOT, 'migration-audit/screenshots/cycle2-agy/intended');

const BUILDS = {
  original: { label: 'original', base: 'http://127.0.0.1:4175/voila-test-aresjoo' },
  result: { label: 'result', base: 'http://127.0.0.1:4176/voila-test-aresjoo' },
};

async function ensureFreeze(page) {
  await page.evaluate((css) => {
    if (document.getElementById('__parity_freeze')) return;
    const style = document.createElement('style');
    style.id = '__parity_freeze';
    style.textContent = css;
    document.head.appendChild(style);
  }, FREEZE_CSS);
}

async function auditReviewsScreen({ browser, buildKey, locale, width }) {
  const build = BUILDS[buildKey];
  const target = parseBase(build.base);
  const outDir = path.join(SHOTS_OUT, buildKey, 'reviews-screen');
  await mkdir(outDir, { recursive: true });

  const context = await newContext(browser, {
    width,
    locale,
    reducedMotion: 'reduce',
  });
  await guardNetwork(context, target, []);
  const state = await makeFixedState('guest', locale);
  await installState(context, state, target.origin);

  const page = await context.newPage();
  page.setDefaultTimeout(5000);

  const url = routeUrl(target.base, locale, '/reviews');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await ensureFreeze(page);
  await settle(page, { timeout: 1000, quiet: 50 });

  const shotPath = path.join(outDir, `reviews__${locale}-${width}.png`);
  await page.screenshot({ path: shotPath, fullPage: true });

  // Evaluate design rules & element structure
  const evaluation = await page.evaluate(() => {
    const primaryBtns = Array.from(document.querySelectorAll('.v-btn:not(.v-btn--quiet):not(.v-btn--outline)'));
    const underlinedLinks = Array.from(document.querySelectorAll('a.v-link, .v-links a, a[style*="underline"]'));
    const cards = Array.from(document.querySelectorAll('.v-rv, .v-rvrow, .v-review-row, .v-card, .v-hcard'));
    const ratingBlocks = Array.from(document.querySelectorAll('.v-rating, .v-stars, .v-rvsum'));
    const moreBtn = document.querySelector('.v-btn--quiet, .v-rv-morebtn, [data-reviews-more]');

    // Check for overflow / wrapping bugs
    const textEls = Array.from(document.querySelectorAll('h1, h2, h3, p, span, button, a'));
    const overflows = [];
    for (const el of textEls) {
      if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
        overflows.push({
          tag: el.tagName,
          className: el.className,
          text: el.innerText.slice(0, 30),
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
        });
      }
    }

    // Inspect colors & badges
    const allComputed = Array.from(document.querySelectorAll('*')).map((el) => {
      const cs = window.getComputedStyle(el);
      return {
        boxShadow: cs.boxShadow,
        backgroundColor: cs.backgroundColor,
        color: cs.color,
      };
    });

    const hasShadows = allComputed.some((c) => c.boxShadow && c.boxShadow !== 'none');

    return {
      primaryBtnCount: primaryBtns.length,
      underlinedLinksCount: underlinedLinks.length,
      cardCount: cards.length,
      ratingBlockCount: ratingBlocks.length,
      hasMoreBtn: !!moreBtn,
      overflowCount: overflows.length,
      sampleOverflows: overflows.slice(0, 5),
      hasShadows,
      bodyTextLength: document.body.innerText.length,
    };
  });

  await context.close().catch(() => {});
  return {
    build: buildKey,
    locale,
    width,
    evaluation,
    shotPath: path.relative(ROOT, shotPath).replace(/\\/g, '/'),
  };
}

async function auditBoxReviewsAndCards({ browser, buildKey, locale = 'ko' }) {
  const build = BUILDS[buildKey];
  const target = parseBase(build.base);
  const outDir = path.join(SHOTS_OUT, buildKey, 'box-reviews');
  await mkdir(outDir, { recursive: true });

  const context = await newContext(browser, {
    width: 390,
    locale,
    reducedMotion: 'reduce',
  });
  await guardNetwork(context, target, []);
  const state = await makeFixedState('guest', locale);
  await installState(context, state, target.origin);

  const page = await context.newPage();
  page.setDefaultTimeout(5000);

  // 1. Box page review section & header link
  const boxUrl = routeUrl(target.base, locale, '/box/dollar-apple');
  await page.goto(boxUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await ensureFreeze(page);
  await settle(page, { timeout: 1000, quiet: 50 });

  const boxReviewShot = path.join(outDir, `box-reviews-section__${locale}.png`);
  const reviewSec = page.locator('#reviews, .v-boxlayout-reviews').first();
  if (await reviewSec.isVisible()) {
    await reviewSec.screenshot({ path: boxReviewShot }).catch(() => page.screenshot({ path: boxReviewShot }));
  } else {
    await page.screenshot({ path: boxReviewShot });
  }

  const boxHeaderLink = await page.evaluate(() => {
    const link = document.querySelector('.v-screenhead a, .v-ratinglink');
    return {
      text: link?.innerText?.trim() ?? null,
      href: link?.getAttribute('href') ?? null,
    };
  });

  // 2. Open review detail sheet
  const firstReviewRow = page.locator('.v-rv-btn, .v-rvrow, .v-review-row, .v-rvstrip .v-card, .v-rvitem').first();
  let detailSheetOpened = false;
  let detailSheetText = null;
  const detailSheetShot = path.join(outDir, `review-detail-sheet__${locale}.png`);

  if (await firstReviewRow.isVisible()) {
    await firstReviewRow.click();
    await page.waitForTimeout(300);
    const sheet = page.locator('.v-sheet').first();
    if (await sheet.isVisible()) {
      detailSheetOpened = true;
      detailSheetText = await sheet.innerText();
      await sheet.screenshot({ path: detailSheetShot }).catch(() => {});
    }
  }

  // 3. Home box card rating line & review count
  const homeUrl = routeUrl(target.base, locale, '');
  await page.goto(homeUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await ensureFreeze(page);
  await settle(page, { timeout: 1000, quiet: 50 });

  const homeCardShot = path.join(outDir, `home-card-rating__${locale}.png`);
  const card = page.locator('.v-boxcard').first();
  await card.screenshot({ path: homeCardShot }).catch(() => {});

  const cardRatingInfo = await page.evaluate(() => {
    const c = document.querySelector('.v-boxcard');
    const ratingLine = c?.querySelector('.v-boxcard-meta, .v-num, .v-rating');
    return {
      fullCardText: c?.innerText?.trim() ?? '',
      ratingLineText: ratingLine?.innerText?.trim() ?? null,
    };
  });

  await context.close().catch(() => {});

  return {
    build: buildKey,
    boxHeaderLink,
    detailSheetOpened,
    detailSheetText: detailSheetText?.slice(0, 100),
    cardRatingInfo,
  };
}

async function auditWalletHistory({ browser, buildKey }) {
  const build = BUILDS[buildKey];
  const target = parseBase(build.base);
  const outDir = path.join(SHOTS_OUT, buildKey, 'wallet-history');
  await mkdir(outDir, { recursive: true });

  const context = await newContext(browser, {
    width: 390,
    locale: 'ko',
    reducedMotion: 'reduce',
  });
  await guardNetwork(context, target, []);

  // Use pending preset (has withdraw tx) and patch ledger with negative amount
  const state = await makeFixedState('pending', 'ko');
  await installState(context, state, target.origin);

  const page = await context.newPage();
  page.setDefaultTimeout(5000);

  const url = routeUrl(target.base, 'ko', '/wallet');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await ensureFreeze(page);
  await settle(page, { timeout: 1000, quiet: 50 });

  const walletShot = path.join(outDir, 'wallet-tx-history.png');
  await page.screenshot({ path: walletShot, fullPage: true });

  const txInfo = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.v-txrow, .v-row, .v-itemrow')).map((r) => r.innerText.trim());
    const negativeSigns = [];
    for (const r of rows) {
      if (r.includes('-$') || r.includes('$-') || r.includes('-₩') || r.includes('₩-')) {
        negativeSigns.push(r);
      }
    }
    return {
      rowsCount: rows.length,
      rows: rows.slice(0, 6),
      negativeSigns,
    };
  });

  await context.close().catch(() => {});
  return { buildKey, txInfo };
}

async function auditPasswordSheet({ browser, buildKey }) {
  const build = BUILDS[buildKey];
  const target = parseBase(build.base);
  const outDir = path.join(SHOTS_OUT, buildKey, 'password-sheet');
  await mkdir(outDir, { recursive: true });

  const context = await newContext(browser, {
    width: 390,
    locale: 'ko',
    reducedMotion: 'reduce',
  });
  await guardNetwork(context, target, []);
  // 'funded' state has no 2FA (twoFactorEnabled: false)
  const state = await makeFixedState('funded', 'ko');
  await installState(context, state, target.origin);

  const page = await context.newPage();
  page.setDefaultTimeout(5000);

  const url = routeUrl(target.base, 'ko', '/account');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await ensureFreeze(page);
  await settle(page, { timeout: 1000, quiet: 50 });

  // Open password sheet
  const changePwBtn = page.locator('button:has-text("비밀번호 변경"), button:has-text("비밀번호")').first();
  let sheetOpened = false;
  let noAppErrorText = null;

  if (await changePwBtn.isVisible()) {
    await changePwBtn.click();
    await page.waitForTimeout(300);
    const sheet = page.locator('.v-sheet').first();
    if (await sheet.isVisible()) {
      sheetOpened = true;
      const initialShot = path.join(outDir, 'password-sheet-initial.png');
      await sheet.screenshot({ path: initialShot }).catch(() => {});

      // Fill in current pw and new pw
      const inputs = sheet.locator('input');
      if (await inputs.count() >= 2) {
        await inputs.nth(0).fill('CaptureOnly123!');
        await inputs.nth(1).fill('NewPassword123#');
      }

      // Click save
      const saveBtn = sheet.locator('button:has-text("변경"), button:has-text("저장")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(500);

        const errorLine = sheet.locator('.v-line--fail, [data-fail="true"], p.fail, p:has-text("인증 앱")').first();
        if (await errorLine.isVisible()) {
          noAppErrorText = await errorLine.innerText();
        }

        const afterShot = path.join(outDir, 'password-sheet-after-save.png');
        await sheet.screenshot({ path: afterShot }).catch(() => {});
      }
    }
  }

  await context.close().catch(() => {});
  return { buildKey, sheetOpened, noAppErrorText };
}

async function main() {
  await mkdir(SHOTS_OUT, { recursive: true });
  const args = parseArgs(process.argv.slice(2), []);
  const testName = args.test; // 'reviews' | 'box' | 'wallet' | 'password' | 'all'

  const browser = await launch();
  const report = {};

  if (!testName || testName === 'reviews' || testName === 'all') {
    report.reviewsScreen = { original: [], result: [] };
    const widths = [320, 390, 768, 1440];
    const locales = ['ko', 'en', 'zh'];

    for (const b of ['original', 'result']) {
      for (const loc of locales) {
        for (const w of widths) {
          const res = await auditReviewsScreen({ browser, buildKey: b, locale: loc, width: w });
          report.reviewsScreen[b].push(res);
          console.log(`[${b}] /reviews (${loc}, ${w}px) done`);
        }
      }
    }
  }

  if (!testName || testName === 'box' || testName === 'all') {
    report.boxReviews = {};
    for (const b of ['original', 'result']) {
      report.boxReviews[b] = await auditBoxReviewsAndCards({ browser, buildKey: b, locale: 'ko' });
      console.log(`[${b}] box reviews & cards done`);
    }
  }

  if (!testName || testName === 'wallet' || testName === 'all') {
    report.walletHistory = {};
    for (const b of ['original', 'result']) {
      report.walletHistory[b] = await auditWalletHistory({ browser, buildKey: b });
      console.log(`[${b}] wallet history done`);
    }
  }

  if (!testName || testName === 'password' || testName === 'all') {
    report.passwordSheet = {};
    for (const b of ['original', 'result']) {
      report.passwordSheet[b] = await auditPasswordSheet({ browser, buildKey: b });
      console.log(`[${b}] password sheet done`);
    }
  }

  await browser.close();

  const outSummary = path.join(SHOTS_OUT, 'intended-summary.json');
  await writeFile(outSummary, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Intended areas audit finished. Summary saved to intended-summary.json`);
}

main().catch((err) => {
  console.error('Audit intended failed:', err);
  process.exit(1);
});
