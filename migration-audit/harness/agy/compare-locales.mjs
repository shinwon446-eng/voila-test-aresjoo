import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(new URL("../../../web/package.json", import.meta.url));
const { chromium } = require("playwright");

const BASE_URL = "https://shinwon446-eng.github.io/voila-test-aresjoo";
const RESULT_FILE = path.resolve(__dirname, "locales-result.json");

const ROUTES_TO_COMPARE = [
  { id: "R-001", slug: "home", path: "" },
  { id: "R-004", slug: "box-playstation", path: "box/gaming-playstation" },
  { id: "R-005", slug: "box-rolex", path: "box/watch-rolex" },
  { id: "R-006", slug: "box-charizard", path: "box/pokemon-charizard" },
  { id: "R-002", slug: "about", path: "about" },
  { id: "R-010", slug: "fairness", path: "fairness" },
  { id: "R-011", slug: "guide", path: "guide" },
  { id: "R-012", slug: "inventory", path: "inventory" },
  { id: "R-014", slug: "legal-terms", path: "legal/terms" },
  { id: "R-016", slug: "reviews", path: "reviews" },
  { id: "R-017", slug: "verify", path: "verify" },
  { id: "R-018", slug: "wallet", path: "wallet" },
  { id: "R-019", slug: "wallet-withdraw", path: "wallet/withdraw" },
  { id: "R-020", slug: "wins", path: "wins" },
];

const VIEWPORTS = [
  { width: 390, height: 844, name: "mobile" },
  { width: 1440, height: 900, name: "desktop" },
];

async function extractTextMetrics(page) {
  return await page.evaluate(() => {
    const targets = Array.from(document.querySelectorAll(
      ".v-title, .v-desc, .v-section, .v-card-title, .v-btn, .v-chip, .v-item-name, .v-strip-name, .v-headbtn, .v-nav a, .v-row, .v-small"
    ));

    return targets.map((el, index) => {
      const cs = window.getComputedStyle(el);
      const lh = parseFloat(cs.lineHeight) || 20;
      const lines = Math.max(1, Math.round(el.clientHeight / lh));
      const isClamped = cs.webkitLineClamp !== "none" && cs.webkitLineClamp !== "";
      const isOverflowingX = el.scrollWidth > el.clientWidth + 1;
      const isOverflowingY = el.scrollHeight > el.clientHeight + 1;

      // Extract a unique selector or identifier
      let identifier = el.className.split(" ")[0] || el.tagName.toLowerCase();
      if (el.id) identifier += `#${el.id}`;

      return {
        index,
        tag: el.tagName,
        classes: el.className,
        identifier,
        text: (el.innerText || el.textContent || "").trim().slice(0, 120),
        width: Math.round(el.getBoundingClientRect().width),
        height: Math.round(el.getBoundingClientRect().height),
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        lines,
        lineHeight: cs.lineHeight,
        fontSize: cs.fontSize,
        whiteSpace: cs.whiteSpace,
        wordBreak: cs.wordBreak,
        isClamped,
        isOverflowingX,
        isOverflowingY,
      };
    });
  });
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const comparisons = [];

  for (const vp of VIEWPORTS) {
    console.log(`Comparing locales at viewport ${vp.name} (${vp.width}x${vp.height})...`);

    for (const route of ROUTES_TO_COMPARE) {
      const metricsByLocale = {};

      for (const locale of ["ko", "en", "zh"]) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          locale: locale === "en" ? "en-US" : locale === "zh" ? "zh-CN" : "ko-KR",
        });
        const page = await context.newPage();
        const fullUrl = route.path ? `${BASE_URL}/${locale}/${route.path}/` : `${BASE_URL}/${locale}/`;

        try {
          await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 15000 });
          await page.waitForTimeout(300);
          metricsByLocale[locale] = await extractTextMetrics(page);
        } catch (e) {
          console.error(`Error loading ${fullUrl}: ${e.message}`);
          metricsByLocale[locale] = [];
        } finally {
          await context.close();
        }
      }

      // Compare ko vs en, ko vs zh
      const koItems = metricsByLocale["ko"] || [];
      const enItems = metricsByLocale["en"] || [];
      const zhItems = metricsByLocale["zh"] || [];

      const differences = [];

      // Align items by identifier and rough index
      const maxLen = Math.min(koItems.length, enItems.length, zhItems.length);
      for (let i = 0; i < maxLen; i++) {
        const k = koItems[i];
        const e = enItems[i];
        const z = zhItems[i];

        if (!k || !e || !z) continue;

        const lineDiffEN = e.lines - k.lines;
        const lineDiffZH = z.lines - k.lines;
        const heightDiffEN = e.height - k.height;
        const heightDiffZH = z.height - k.height;

        const wrapDiff = lineDiffEN !== 0 || lineDiffZH !== 0;
        const overflowDiff = e.isOverflowingX !== k.isOverflowingX || z.isOverflowingX !== k.isOverflowingX ||
                             e.isOverflowingY !== k.isOverflowingY || z.isOverflowingY !== k.isOverflowingY;

        if (wrapDiff || overflowDiff || Math.abs(heightDiffEN) > 8 || Math.abs(heightDiffZH) > 8) {
          differences.push({
            index: i,
            identifier: k.identifier,
            classes: k.classes,
            ko: { text: k.text, lines: k.lines, height: k.height, overflowX: k.isOverflowingX, overflowY: k.isOverflowingY },
            en: { text: e.text, lines: e.lines, height: e.height, overflowX: e.isOverflowingX, overflowY: e.isOverflowingY },
            zh: { text: z.text, lines: z.lines, height: z.height, overflowX: z.isOverflowingX, overflowY: z.isOverflowingY },
            lineDiffEN,
            lineDiffZH,
            heightDiffEN,
            heightDiffZH,
            issue: wrapDiff ? "line-count-mismatch" : overflowDiff ? "overflow-mismatch" : "height-mismatch",
          });
        }
      }

      comparisons.push({
        routeId: route.id,
        slug: route.slug,
        viewport: vp.name,
        width: vp.width,
        totalItemsCompared: maxLen,
        totalDifferences: differences.length,
        differences,
      });

      console.log(`  -> ${route.slug} (${vp.name}): compared ${maxLen} elements, found ${differences.length} wrap/overflow differences`);
    }
  }

  await browser.close();

  await fs.writeFile(RESULT_FILE, JSON.stringify(comparisons, null, 2), "utf8");
  console.log(`Locale comparison completed. Results saved to ${RESULT_FILE}`);
}

main().catch(console.error);
