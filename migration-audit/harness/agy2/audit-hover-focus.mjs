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
  FREEZE_CSS,
} from '../lib/common.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../');
const SHOTS_OUT = path.resolve(ROOT, 'migration-audit/screenshots/cycle2-agy/states');

const BUILDS = {
  original: { label: 'original', base: 'http://127.0.0.1:4175/voila-test-aresjoo' },
  result: { label: 'result', base: 'http://127.0.0.1:4176/voila-test-aresjoo' },
};

async function auditInteractivePrimitive({ page, id, name, selector, outDir, buildKey }) {
  const loc = page.locator(selector).first();
  if ((await loc.count()) === 0 || !(await loc.isVisible())) {
    return { id, name, found: false };
  }

  await loc.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(100);

  // 1. Default (Resting)
  const restShot = path.join(outDir, `${id}-${name}-rest.png`);
  await loc.screenshot({ path: restShot, timeout: 2000 }).catch(async () => {
    await page.screenshot({ path: restShot, timeout: 2000 }).catch(() => {});
  });

  const restStyle = await loc.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return {
      backgroundColor: cs.backgroundColor,
      borderColor: cs.borderColor,
      color: cs.color,
      transform: cs.transform,
      outline: cs.outline,
    };
  }).catch(() => null);

  // 2. Hover
  let hoverStyle = null;
  const hoverShot = path.join(outDir, `${id}-${name}-hover.png`);
  try {
    await loc.hover({ timeout: 2000 });
    await page.waitForTimeout(150);
    await loc.screenshot({ path: hoverShot, timeout: 2000 }).catch(async () => {
      await page.screenshot({ path: hoverShot, timeout: 2000 }).catch(() => {});
    });
    hoverStyle = await loc.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        backgroundColor: cs.backgroundColor,
        borderColor: cs.borderColor,
        color: cs.color,
        transform: cs.transform,
        cursor: cs.cursor,
      };
    }).catch(() => null);
  } catch (e) {}

  // 3. Focus / Focus-Visible
  let focusStyle = null;
  const focusShot = path.join(outDir, `${id}-${name}-focus.png`);
  try {
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);
    await page.keyboard.press('Tab');
    await loc.focus({ timeout: 2000 });
    await page.waitForTimeout(150);
    await loc.screenshot({ path: focusShot, timeout: 2000 }).catch(async () => {
      await page.screenshot({ path: focusShot, timeout: 2000 }).catch(() => {});
    });
    focusStyle = await loc.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        outline: cs.outline,
        outlineColor: cs.outlineColor,
        outlineWidth: cs.outlineWidth,
        outlineOffset: cs.outlineOffset,
        boxShadow: cs.boxShadow,
        borderColor: cs.borderColor,
      };
    }).catch(() => null);
  } catch (e) {}

  return {
    id,
    name,
    selector,
    found: true,
    restStyle,
    hoverStyle,
    focusStyle,
    shots: {
      rest: path.relative(ROOT, restShot).replace(/\\/g, '/'),
      hover: path.relative(ROOT, hoverShot).replace(/\\/g, '/'),
      focus: path.relative(ROOT, focusShot).replace(/\\/g, '/'),
    },
  };
}

async function runForBuild(browser, buildKey) {
  const build = BUILDS[buildKey];
  const target = parseBase(build.base);
  const outDir = path.join(SHOTS_OUT, buildKey);
  await mkdir(outDir, { recursive: true });

  const context = await newContext(browser, {
    width: 1280,
    locale: 'ko',
    reducedMotion: 'no-preference',
  });
  await guardNetwork(context, target, []);
  const state = await makeFixedState('funded', 'ko');
  await installState(context, state, target.origin);

  const page = await context.newPage();
  page.setDefaultTimeout(5000);

  const results = [];

  // Page 1: Home
  const homeUrl = routeUrl(target.base, 'ko', '');
  await page.goto(homeUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(300);

  // 1. Box card
  results.push(await auditInteractivePrimitive({
    page,
    id: 'D-01',
    name: 'box-card',
    selector: '.v-boxcard',
    outDir,
    buildKey,
  }));

  // 2. Chip (Category chip)
  results.push(await auditInteractivePrimitive({
    page,
    id: 'D-02',
    name: 'chip-category',
    selector: '.v-chips .v-chip, .v-chip',
    outDir,
    buildKey,
  }));

  // 3. Header link / nav link
  results.push(await auditInteractivePrimitive({
    page,
    id: 'D-03',
    name: 'nav-link',
    selector: '.v-nav a',
    outDir,
    buildKey,
  }));

  // Page 2: Box page
  const boxUrl = routeUrl(target.base, 'ko', '/box/dollar-apple');
  await page.goto(boxUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(300);

  // 4. Primary button (Open button)
  results.push(await auditInteractivePrimitive({
    page,
    id: 'D-04',
    name: 'primary-btn',
    selector: '[data-open-primary], .v-openbar .v-btn',
    outDir,
    buildKey,
  }));

  // 5. Quantity chip
  results.push(await auditInteractivePrimitive({
    page,
    id: 'D-05',
    name: 'chip-quantity',
    selector: '.v-openbar .v-chip:nth-child(2), .v-openbar .v-chip',
    outDir,
    buildKey,
  }));

  // 6. Underlined link
  results.push(await auditInteractivePrimitive({
    page,
    id: 'D-06',
    name: 'underlined-link',
    selector: '.v-links a, a.v-link, .v-notes summary',
    outDir,
    buildKey,
  }));

  // Page 3: /reviews
  const reviewsUrl = routeUrl(target.base, 'ko', '/reviews');
  await page.goto(reviewsUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(300);

  // 7. Quiet button (Load more)
  results.push(await auditInteractivePrimitive({
    page,
    id: 'D-07',
    name: 'quiet-btn',
    selector: '.v-btn--quiet, .v-rv-morebtn, [data-reviews-more]',
    outDir,
    buildKey,
  }));

  // 8. Review row (New review row in Result / card in Original)
  results.push(await auditInteractivePrimitive({
    page,
    id: 'D-08',
    name: 'review-row',
    selector: '.v-rv .v-rv-btn, .v-rv-btn, .v-rvcard, .v-rvrow button',
    outDir,
    buildKey,
  }));

  await context.close().catch(() => {});
  return results;
}

async function main() {
  await mkdir(SHOTS_OUT, { recursive: true });
  const browser = await launch();

  console.log('Testing hover and focus-visible on original (1280px)...');
  const originalResults = await runForBuild(browser, 'original');

  console.log('Testing hover and focus-visible on result (1280px)...');
  const resultResults = await runForBuild(browser, 'result');

  await browser.close();

  // Compare original vs result
  const comparison = [];
  for (let i = 0; i < originalResults.length; i++) {
    const o = originalResults[i];
    const r = resultResults.find((x) => x.id === o.id) || resultResults[i];

    const hoverDiff = JSON.stringify(o.hoverStyle) !== JSON.stringify(r.hoverStyle);
    const focusDiff = JSON.stringify(o.focusStyle) !== JSON.stringify(r.focusStyle);

    comparison.push({
      id: o.id,
      name: o.name,
      selector: { original: o.selector, result: r?.selector },
      found: { original: o.found, result: r?.found },
      hoverDiff,
      originalHoverStyle: o.hoverStyle,
      resultHoverStyle: r?.hoverStyle,
      focusDiff,
      originalFocusStyle: o.focusStyle,
      resultFocusStyle: r?.focusStyle,
      shots: {
        original: o.shots,
        result: r?.shots,
      },
    });
  }

  const outSummary = path.join(SHOTS_OUT, 'hover-focus-comparison.json');
  await writeFile(outSummary, JSON.stringify(comparison, null, 2), 'utf8');
  console.log('Hover and focus-visible comparison saved to hover-focus-comparison.json');
}

main().catch((err) => {
  console.error('Hover-focus audit failed:', err);
  process.exit(1);
});
