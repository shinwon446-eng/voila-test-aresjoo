import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VIEWPORTS,
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
const SHOTS_OUT = path.resolve(ROOT, 'migration-audit/screenshots/cycle2-agy');

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

async function extractElementMetrics(page, selector, excludeSelector = null) {
  return page.evaluate(({ selector, excludeSelector }) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);

    let text = el.innerText || '';
    if (excludeSelector) {
      const clone = el.cloneNode(true);
      const toRemove = clone.querySelectorAll(excludeSelector);
      toRemove.forEach((r) => r.remove());
      text = clone.innerText || '';
    }
    text = text.trim();

    const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2 || 16;
    const lineCount = Math.max(1, Math.round(el.clientHeight / lineHeight));

    return {
      found: true,
      bbox: {
        x: Math.round(rect.x * 10) / 10,
        y: Math.round(rect.y * 10) / 10,
        width: Math.round(rect.width * 10) / 10,
        height: Math.round(rect.height * 10) / 10,
      },
      text,
      lineCount,
      font: {
        family: cs.fontFamily,
        size: cs.fontSize,
        weight: cs.fontWeight,
        lineHeight: cs.lineHeight,
      },
      colors: {
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        borderColor: cs.borderColor,
      },
    };
  }, { selector, excludeSelector });
}

export const ROUTE_GROUPS = [
  {
    key: 'home-guest',
    route: '/',
    preset: 'guest',
    targets: [
      { id: 'header', selector: '.v-header' },
      { id: 'footer', selector: '.v-footer' },
      { id: 'home-hero', selector: '.v-hero' },
      { id: 'search-chips', selector: '.v-search' },
      { id: 'box-card', selector: '.v-boxcard:first-child', exclude: '.v-boxcard-meta, .v-num' },
      {
        id: 'sheet-menu',
        selector: '.v-sheet',
        action: async (page) => {
          const btn = page.locator('.v-menu-btn').first();
          if (await btn.isVisible()) await btn.click();
          await page.waitForTimeout(200);
        },
      },
      {
        id: 'sheet-login',
        selector: '.v-sheet',
        action: async (page) => {
          const close = page.locator('.v-sheet-close, .v-scrim').first();
          if (await close.isVisible()) await close.click().catch(() => {});
          const btn = page.locator('.v-header .v-headbtn:not(.v-menu-btn)').first();
          if (await btn.isVisible()) await btn.click();
          await page.waitForTimeout(200);
        },
      },
      {
        id: 'sheet-signup',
        selector: '.v-sheet',
        action: async (page) => {
          const signupLink = page.locator('.v-sheet .v-links button, .v-sheet button:has-text("가입"), .v-sheet button:has-text("Sign up"), .v-sheet button:has-text("注册")').first();
          if (await signupLink.isVisible()) await signupLink.click();
          await page.waitForTimeout(200);
        },
      },
      {
        id: 'sheet-locale-currency',
        selector: '.v-footer',
        action: async (page) => {
          const close = page.locator('.v-sheet-close, .v-scrim').first();
          if (await close.isVisible()) await close.click().catch(() => {});
          const ctrl = page.locator('.v-footer button').first();
          if (await ctrl.isVisible()) await ctrl.click();
          await page.waitForTimeout(200);
        },
      },
    ],
  },
  {
    key: 'home-funded',
    route: '/',
    preset: 'funded',
    targets: [
      {
        id: 'sheet-balance',
        selector: '.v-sheet',
        action: async (page) => {
          const btn = page.locator('.v-header [data-balance-open]').first();
          if (await btn.isVisible()) await btn.click();
          await page.waitForTimeout(200);
        },
      },
      {
        id: 'sheet-charge',
        selector: '.v-sheet',
        action: async (page) => {
          const chargeBtn = page.locator('.v-sheet button:has-text("충전"), .v-sheet button:has-text("Add"), .v-sheet button:has-text("充值")').first();
          if (await chargeBtn.isVisible()) await chargeBtn.click();
          await page.waitForTimeout(200);
        },
      },
    ],
  },
  {
    key: 'box',
    route: '/box/dollar-apple',
    preset: 'guest',
    targets: [
      { id: 'box-hero-openbar', selector: '.v-boxlayout-hero' },
      { id: 'contents-tiles', selector: '.v-boxlayout-contents' },
      { id: 'odds-summary-tables', selector: '.v-boxlayout-odds' },
      { id: 'notes', selector: '.v-boxlayout-notes' },
      {
        id: 'sheet-item-detail',
        selector: '.v-sheet',
        action: async (page) => {
          const tile = page.locator('.v-tile, .v-itemrow, #box-contents .v-box').first();
          if (await tile.isVisible()) await tile.click();
          await page.waitForTimeout(200);
        },
      },
    ],
  },
  {
    key: 'inventory',
    route: '/inventory',
    preset: 'inventory',
    targets: [
      { id: 'inventory', selector: '.v-main' },
      {
        id: 'sheet-take-confirm',
        selector: '[role="alertdialog"], .v-sheet',
        action: async (page) => {
          const takeBtn = page.locator('button:has-text("USDT"), .v-itemrow button').first();
          if (await takeBtn.isVisible()) await takeBtn.click();
          await page.waitForTimeout(200);
        },
      },
      {
        id: 'sheet-review-write',
        selector: '.v-sheet, .v-main',
        action: async (page) => {
          const close = page.locator('.v-sheet-close, [role="alertdialog"] .v-links button, .v-scrim').first();
          if (await close.isVisible()) await close.click().catch(() => {});
          const writeBtn = page.locator('button:has-text("후기"), button:has-text("Review"), button:has-text("评价")').first();
          if (await writeBtn.isVisible()) await writeBtn.click();
          await page.waitForTimeout(200);
        },
      },
    ],
  },
  {
    key: 'wallet',
    route: '/wallet',
    preset: 'funded',
    targets: [{ id: 'wallet', selector: '.v-main' }],
  },
  {
    key: 'withdraw',
    route: '/wallet/withdraw',
    preset: 'funded',
    targets: [{ id: 'withdraw-form', selector: '.v-main' }],
  },
  {
    key: 'verify',
    route: '/verify',
    preset: 'guest',
    targets: [
      { id: 'verify', selector: '.v-main' },
      {
        id: 'sheet-verify',
        selector: '.v-sheet, .v-main',
        action: async (page) => {
          const verifyBtn = page.locator('button:has-text("검증"), button:has-text("Verify"), button:has-text("验证")').first();
          if (await verifyBtn.isVisible()) await verifyBtn.click();
          await page.waitForTimeout(200);
        },
      },
    ],
  },
  {
    key: 'wins',
    route: '/wins',
    preset: 'guest',
    targets: [{ id: 'wins', selector: '.v-main' }],
  },
  {
    key: 'guide',
    route: '/guide',
    preset: 'guest',
    targets: [{ id: 'guide', selector: '.v-main' }],
  },
  {
    key: 'legal',
    route: '/legal',
    preset: 'guest',
    targets: [{ id: 'legal', selector: '.v-main' }],
  },
  {
    key: 'account',
    route: '/account',
    preset: 'funded',
    targets: [{ id: 'account', selector: '.v-main' }],
  },
];

async function runRouteGroup({ browser, buildKey, groupDef, locale, width }) {
  const build = BUILDS[buildKey];
  const target = parseBase(build.base);
  const outDir = path.join(SHOTS_OUT, 'stills', buildKey);
  await mkdir(outDir, { recursive: true });

  const context = await newContext(browser, {
    width,
    locale,
    reducedMotion: 'reduce',
  });
  await guardNetwork(context, target, []);

  const state = await makeFixedState(groupDef.preset, locale);
  await installState(context, state, target.origin);

  const page = await context.newPage();
  page.setDefaultTimeout(5000);

  const url = routeUrl(target.base, locale, groupDef.route);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await ensureFreeze(page);
  await settle(page, { timeout: 1000, quiet: 50 });

  for (const t of groupDef.targets) {
    if (t.action) {
      try {
        await t.action(page);
        await page.waitForTimeout(200);
      } catch (e) {}
    }

    const metrics = await extractElementMetrics(page, t.selector, t.exclude);
    const shotName = `${t.id}__${locale}-${width}.png`;
    const shotPath = path.join(outDir, shotName);

    if (metrics?.found) {
      const loc = page.locator(t.selector).first();
      await loc.screenshot({ path: shotPath, timeout: 2000 }).catch(async () => {
        await page.screenshot({ path: shotPath, timeout: 2000 }).catch(() => {});
      });
    } else {
      await page.screenshot({ path: shotPath, timeout: 2000 }).catch(() => {});
    }

    const record = {
      id: t.id,
      build: buildKey,
      locale,
      width,
      metrics,
      shotPath: path.relative(ROOT, shotPath).replace(/\\/g, '/'),
    };

    const jsonPath = path.join(outDir, `${t.id}__${locale}-${width}.json`);
    await writeFile(jsonPath, JSON.stringify(record, null, 2), 'utf8');
  }

  await context.close().catch(() => {});
  console.log(`[${buildKey}] group ${groupDef.key} (${locale}, ${width}px) done`);
}

async function main() {
  await mkdir(path.join(SHOTS_OUT, 'stills'), { recursive: true });
  const args = parseArgs(process.argv.slice(2), []);
  const groupFilter = args.group; // group key or 'all' or 'compare'
  const localeFilter = args.locale ? [args.locale] : ['ko', 'en', 'zh'];
  const widthFilter = args.width ? [Number(args.width)] : [390, 1440];
  const buildFilter = args.build ? [args.build] : ['original', 'result'];

  if (groupFilter === 'compare') {
    const comparisonResults = [];
    const allTargets = ROUTE_GROUPS.flatMap((g) => g.targets);

    for (const t of allTargets) {
      for (const loc of ['ko', 'en', 'zh']) {
        for (const w of [390, 1440]) {
          try {
            const origJsonPath = path.join(SHOTS_OUT, 'stills', 'original', `${t.id}__${loc}-${w}.json`);
            const resJsonPath = path.join(SHOTS_OUT, 'stills', 'result', `${t.id}__${loc}-${w}.json`);
            const orig = JSON.parse(await readFile(origJsonPath, 'utf8'));
            const res = JSON.parse(await readFile(resJsonPath, 'utf8'));

            const mOrig = orig.metrics;
            const mRes = res.metrics;

            if (!mOrig || !mRes) {
              comparisonResults.push({
                target: t.id,
                locale: loc,
                width: w,
                found: { original: !!mOrig, result: !!mRes },
                status: 'missing_element',
              });
              continue;
            }

            const bboxDiff = {
              dw: Math.round(Math.abs(mRes.bbox.width - mOrig.bbox.width) * 10) / 10,
              dh: Math.round(Math.abs(mRes.bbox.height - mOrig.bbox.height) * 10) / 10,
            };
            const bboxMatch = bboxDiff.dw <= 2 && bboxDiff.dh <= 2;
            const textMatch = mOrig.text === mRes.text;
            const lineCountMatch = mOrig.lineCount === mRes.lineCount;
            const fontMatch = JSON.stringify(mOrig.font) === JSON.stringify(mRes.font);
            const colorMatch = JSON.stringify(mOrig.colors) === JSON.stringify(mRes.colors);

            const isEquivalent = bboxMatch && textMatch && lineCountMatch && fontMatch && colorMatch;

            comparisonResults.push({
              target: t.id,
              locale: loc,
              width: w,
              bboxMatch,
              bboxDiff,
              originalBbox: mOrig.bbox,
              resultBbox: mRes.bbox,
              textMatch,
              lineCountMatch,
              originalLineCount: mOrig.lineCount,
              resultLineCount: mRes.lineCount,
              fontMatch,
              originalFont: mOrig.font,
              resultFont: mRes.font,
              colorMatch,
              originalColors: mOrig.colors,
              resultColors: mRes.colors,
              isEquivalent,
              originalShot: orig.shotPath,
              resultShot: res.shotPath,
            });
          } catch (e) {}
        }
      }
    }

    const summaryPath = path.join(SHOTS_OUT, 'stills-comparison.json');
    await writeFile(summaryPath, JSON.stringify(comparisonResults, null, 2), 'utf8');
    console.log(`Stills comparison generated: ${comparisonResults.length} items evaluated.`);
    return;
  }

  const browser = await launch();
  const selectedGroups = groupFilter && groupFilter !== 'all'
    ? ROUTE_GROUPS.filter((g) => g.key === groupFilter)
    : ROUTE_GROUPS;

  for (const b of buildFilter) {
    for (const g of selectedGroups) {
      for (const loc of localeFilter) {
        for (const w of widthFilter) {
          await runRouteGroup({
            browser,
            buildKey: b,
            groupDef: g,
            locale: loc,
            width: w,
          });
        }
      }
    }
  }

  await browser.close();
}

main().catch((err) => {
  console.error('Stills capture failed:', err);
  process.exit(1);
});
