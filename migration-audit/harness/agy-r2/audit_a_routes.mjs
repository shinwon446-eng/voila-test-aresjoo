import fs from 'node:fs';
import path from 'node:path';
import { launch, newContext, routeUrl, parseBase, settle, makeFixedState, installState, pool, FREEZE_CSS } from '../lib/common.mjs';

const origBase = parseBase('http://127.0.0.1:4175/voila-test-aresjoo');
const resBase = parseBase('http://127.0.0.1:4176/voila-test-aresjoo');

const WIDTHS = [320, 360, 430, 768, 1024, 1920];
const LOCALES = ['ko', 'en', 'zh'];

// 14 standalone routes outside intended areas + home (non-review) + 2 box pages (non-review)
const ROUTES = [
  { id: 'inventory', path: '/inventory', preset: 'inventory', mode: 'full' },
  { id: 'wallet-withdraw', path: '/wallet/withdraw', preset: 'funded', mode: 'full' },
  { id: 'verify', path: '/verify', preset: 'funded', mode: 'full' },
  { id: 'wins', path: '/wins', preset: 'funded', mode: 'full' },
  { id: 'guide', path: '/guide', preset: 'funded', mode: 'full' },
  { id: 'legal', path: '/legal', preset: 'funded', mode: 'full' },
  { id: 'legal-terms', path: '/legal/terms', preset: 'funded', mode: 'full' },
  { id: 'legal-privacy', path: '/legal/privacy', preset: 'funded', mode: 'full' },
  { id: 'legal-payments', path: '/legal/payments', preset: 'funded', mode: 'full' },
  { id: 'account', path: '/account', preset: 'funded', mode: 'full' },
  { id: 'about', path: '/about', preset: 'funded', mode: 'full' },
  { id: 'community', path: '/community', preset: 'funded', mode: 'full' },
  { id: 'profile', path: '/profile', preset: 'funded', mode: 'full' },
  { id: 'not-found', path: '/not-found-qa-test', preset: 'funded', mode: 'full' },
  { id: 'home', path: '/', preset: 'funded', mode: 'home-non-review' },
  { id: 'box-playstation', path: '/box/gaming-playstation', preset: 'funded', mode: 'box-non-review' },
  { id: 'box-rolex', path: '/box/watch-rolex', preset: 'funded', mode: 'box-non-review' },
];

const screenshotsDir = 'migration-audit/screenshots/r2-agy';
fs.mkdirSync(screenshotsDir, { recursive: true });

// Evaluation function to extract elements/regions
async function extractRegions(page, mode) {
  return page.evaluate((mode) => {
    const round2 = (n) => Math.round(n * 100) / 100;
    const clean = (t) => String(t || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return false;
      const s = getComputedStyle(el);
      return s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity) > 0;
    };

    const countLines = (el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      const tops = [];
      let node;
      while ((node = walker.nextNode())) {
        if (!node.textContent.trim()) continue;
        range.selectNode(node);
        for (const rect of range.getClientRects()) {
          if (rect.width < 0.5 || rect.height < 0.5) continue;
          const mid = Math.round((rect.top + rect.height / 2) * 10) / 10;
          if (!tops.some((t) => Math.abs(t - mid) < 4)) tops.push(mid);
        }
      }
      return tops.length || 1;
    };

    const describeEl = (key, el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        key,
        tag: el.tagName.toLowerCase(),
        box: [round2(r.left + window.scrollX), round2(r.top + window.scrollY), round2(r.width), round2(r.height)],
        text: clean(el.innerText).slice(0, 500),
        lineCount: countLines(el),
        styles: {
          fontFamily: s.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          lineHeight: s.lineHeight,
          color: s.color,
          background: s.backgroundColor,
          borderRadius: s.borderRadius,
        },
      };
    };

    const out = [];

    if (mode === 'home-non-review') {
      const defs = [
        ['header', '.v-header'],
        ['hero', '.v-hero'],
        ['search', '.v-search'],
        ['chips', '.v-chips'],
        ['card-title-0', '.v-boxcard:nth-of-type(1) .v-card-title'],
        ['card-title-1', '.v-boxcard:nth-of-type(2) .v-card-title'],
        ['card-price-0', '.v-boxcard:nth-of-type(1) .v-card-price, .v-boxcard:nth-of-type(1) .v-num'],
        ['card-price-1', '.v-boxcard:nth-of-type(2) .v-card-price, .v-boxcard:nth-of-type(2) .v-num'],
        ['footer', '.v-footer'],
      ];
      for (const [k, sel] of defs) {
        const el = document.querySelector(sel);
        if (el && visible(el)) out.push(describeEl(k, el));
      }
      return out;
    }

    if (mode === 'box-non-review') {
      const defs = [
        ['header', '.v-header'],
        ['hero-title', '.v-boxlayout-hero, .v-screenhead, .v-boxlayout .v-title'],
        ['purchase-bar', '.v-openbar'],
        ['contents-tiles', '.v-boxlayout-contents, .v-items, .v-itemrows'],
        ['odds-summary', '.v-boxlayout-odds, .v-odds'],
        ['notes', '.v-boxlayout-notes, .v-notes'],
        ['footer', '.v-footer'],
      ];
      for (const [k, sel] of defs) {
        const el = document.querySelector(sel);
        if (el && visible(el)) out.push(describeEl(k, el));
      }
      return out;
    }

    // full mode for standalone non-review routes
    const selectors = [
      ['header', '.v-header'],
      ['screenhead', '.v-screenhead'],
      ['title', '.v-title'],
      ['desc', '.v-desc'],
      ['main-stack', '.v-main > .v-stack'],
      ['footer', '.v-footer'],
    ];

    for (const [k, sel] of selectors) {
      const el = document.querySelector(sel);
      if (el && visible(el)) out.push(describeEl(k, el));
    }

    // Also collect key content cards/rows/tables
    const extraSelectors = [
      '.v-card', '.v-itemrow', '.v-row', '.v-empty', '.v-btn', '.v-input', '.v-field'
    ];
    let extraCount = 0;
    for (const sel of extraSelectors) {
      const els = Array.from(document.querySelectorAll(sel)).filter(visible).slice(0, 3);
      for (let i = 0; i < els.length; i++) {
        out.push(describeEl(`${sel.slice(1)}-${i}`, els[i]));
        extraCount++;
        if (extraCount >= 10) break;
      }
      if (extraCount >= 10) break;
    }

    return out;
  }, mode);
}

function compareRegions(origList, resList, routeId, width, locale) {
  const mismatches = [];
  const origMap = new Map(origList.map(r => [r.key, r]));
  const resMap = new Map(resList.map(r => [r.key, r]));

  for (const [key, orig] of origMap.entries()) {
    const res = resMap.get(key);
    if (!res) {
      mismatches.push({
        key,
        type: 'missing_in_result',
        orig: orig.tag,
        res: null,
      });
      continue;
    }

    // 1. Bounding box within 2px
    const [ol, ot, ow, oh] = orig.box;
    const [rl, rt, rw, rh] = res.box;
    const boxDiff = {
      dLeft: Math.abs(ol - rl),
      dTop: Math.abs(ot - rt),
      dWidth: Math.abs(ow - rw),
      dHeight: Math.abs(oh - rh),
    };
    if (boxDiff.dLeft > 2.05 || boxDiff.dTop > 2.05 || boxDiff.dWidth > 2.05 || boxDiff.dHeight > 2.05) {
      mismatches.push({
        key,
        type: 'box_mismatch',
        origBox: orig.box,
        resBox: res.box,
        diff: boxDiff,
      });
    }

    // 2. Text
    if (orig.text !== res.text) {
      mismatches.push({
        key,
        type: 'text_mismatch',
        origText: orig.text,
        resText: res.text,
      });
    }

    // 3. Line counts
    if (orig.lineCount !== res.lineCount) {
      mismatches.push({
        key,
        type: 'line_count_mismatch',
        origLines: orig.lineCount,
        resLines: res.lineCount,
      });
    }

    // 4. Styles: fontFamily, fontSize, fontWeight, lineHeight, color, background, borderRadius
    const styleKeys = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'color', 'background', 'borderRadius'];
    for (const sk of styleKeys) {
      if (orig.styles[sk] !== res.styles[sk]) {
        mismatches.push({
          key,
          type: `style_${sk}_mismatch`,
          origVal: orig.styles[sk],
          resVal: res.styles[sk],
        });
      }
    }
  }

  for (const [key, res] of resMap.entries()) {
    if (!origMap.has(key)) {
      mismatches.push({
        key,
        type: 'unexpected_in_result',
        orig: null,
        res: res.tag,
      });
    }
  }

  return mismatches;
}

async function run() {
  console.log(`Starting Part (A) Audit across ${ROUTES.length} routes, ${WIDTHS.length} widths, ${LOCALES.length} locales...`);
  const browser = await launch();

  const tasks = [];
  for (const rDef of ROUTES) {
    for (const locale of LOCALES) {
      for (const width of WIDTHS) {
        tasks.push({ rDef, locale, width });
      }
    }
  }

  const totalRuns = tasks.length;
  console.log(`Total comparison configurations: ${totalRuns}`);

  const allResults = [];
  let comparisonCount = 0;
  let mismatchCount = 0;

  // Run with concurrency 5
  await pool(tasks, 5, async ({ rDef, locale, width }) => {
    const testId = `${rDef.id}_${locale}_${width}`;
    const origState = await makeFixedState(rDef.preset, locale);
    const resState = await makeFixedState(rDef.preset, locale);

    let origCtx, resCtx, origPage, resPage;
    try {
      origCtx = await newContext(browser, { width, locale });
      resCtx = await newContext(browser, { width, locale });

      await installState(origCtx, origState, origBase.origin);
      await installState(resCtx, resState, resBase.origin);

      origPage = await origCtx.newPage();
      resPage = await resCtx.newPage();

      await origPage.addStyleTag({ content: FREEZE_CSS });
      await resPage.addStyleTag({ content: FREEZE_CSS });

      const origUrl = routeUrl(origBase.base, locale, rDef.path);
      const resUrl = routeUrl(resBase.base, locale, rDef.path);

      await Promise.all([
        origPage.goto(origUrl, { waitUntil: 'domcontentloaded' }),
        resPage.goto(resUrl, { waitUntil: 'domcontentloaded' }),
      ]);

      await Promise.all([
        settle(origPage, { fullImages: true }),
        settle(resPage, { fullImages: true }),
      ]);

      const origRegions = await extractRegions(origPage, rDef.mode);
      const resRegions = await extractRegions(resPage, rDef.mode);

      const mismatches = compareRegions(origRegions, resRegions, rDef.id, width, locale);

      if (mismatches.length > 0) {
        mismatchCount += mismatches.length;
        console.log(`[MISMATCH] ${testId}: ${mismatches.length} mismatches found`);
        const shotPath = path.join(screenshotsDir, `diff_A_${testId}.png`);
        await resPage.screenshot({ path: shotPath });
      }

      allResults.push({
        route: rDef.id,
        path: rDef.path,
        locale,
        width,
        regionCountOrig: origRegions.length,
        regionCountRes: resRegions.length,
        mismatches,
      });

    } catch (err) {
      console.error(`[ERROR] ${testId}: ${err.message}`);
      allResults.push({
        route: rDef.id,
        path: rDef.path,
        locale,
        width,
        error: err.message,
      });
    } finally {
      if (origCtx) await origCtx.close();
      if (resCtx) await resCtx.close();
      comparisonCount++;
      if (comparisonCount % 25 === 0 || comparisonCount === totalRuns) {
        console.log(`Progress: ${comparisonCount}/${totalRuns} (${((comparisonCount/totalRuns)*100).toFixed(1)}%), total mismatches so far: ${mismatchCount}`);
      }
    }
  });

  await browser.close();

  const outPath = 'migration-audit/harness/agy-r2/audit_a_results.json';
  fs.writeFileSync(outPath, JSON.stringify({
    totalConfigurations: totalRuns,
    completed: comparisonCount,
    totalMismatches: mismatchCount,
    results: allResults,
  }, null, 2));

  console.log(`Part (A) Complete! Wrote results to ${outPath}`);
}

run().catch((e) => {
  console.error('Fatal in audit_a:', e);
  process.exit(1);
});
