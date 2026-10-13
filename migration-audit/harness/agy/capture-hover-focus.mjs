import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(new URL("../../../web/package.json", import.meta.url));
const { chromium } = require("playwright");

const BASE_URL = "https://shinwon446-eng.github.io/voila-test-aresjoo/ko";
const SCREENSHOT_DIR = path.resolve(__dirname, "../../screenshots/before/agy/states");
const RESULT_FILE = path.resolve(__dirname, "states-result.json");

async function main() {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "ko-KR",
  });
  const page = await context.newPage();

  const results = [];

  const capturePrimitiveStates = async ({ id, name, pageUrl, selector, setupAction }) => {
    console.log(`Testing states for ${name} (${selector})...`);
    await page.goto(pageUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    if (setupAction) {
      await setupAction(page);
      await page.waitForTimeout(300);
    }

    const locator = page.locator(selector).first();
    if ((await locator.count()) === 0 || !(await locator.isVisible())) {
      console.log(`  -> Not found or not visible: ${selector}`);
      results.push({ id, name, found: false });
      return;
    }

    // Scroll into view
    await locator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);

    // 1. Default
    const defaultShot = path.join(SCREENSHOT_DIR, `${id}-${name}-default.png`);
    await locator.screenshot({ path: defaultShot }).catch(async () => {
      await page.screenshot({ path: defaultShot });
    });

    // 2. Hover
    try {
      await locator.hover({ timeout: 5000 });
      await page.waitForTimeout(200);
      const hoverShot = path.join(SCREENSHOT_DIR, `${id}-${name}-hover.png`);
      await locator.screenshot({ path: hoverShot }).catch(async () => {
        await page.screenshot({ path: hoverShot });
      });
    } catch (e) {
      console.warn(`Hover failed for ${name}: ${e.message}`);
    }

    // 3. Focus / Focus-Visible
    // Moving mouse away first
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);
    try {
      // Focus using evaluate or Tab key simulation
      await locator.focus({ timeout: 5000 });
      // Dispatch keyboard event to ensure :focus-visible matches
      await page.keyboard.press("Tab");
      await locator.focus({ timeout: 5000 });
      await page.waitForTimeout(200);

      const focusShot = path.join(SCREENSHOT_DIR, `${id}-${name}-focus.png`);
      await locator.screenshot({ path: focusShot }).catch(async () => {
        await page.screenshot({ path: focusShot });
      });
    } catch (e) {
      console.warn(`Focus failed for ${name}: ${e.message}`);
    }

    // Extract computed outline / focus style
    const focusStyle = await locator.evaluate((el) => {
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

    const defaultShotRelative = path.relative(path.resolve(__dirname, "../../"), defaultShot).replace(/\\/g, "/");
    const hoverShotRelative = path.relative(path.resolve(__dirname, "../../"), path.join(SCREENSHOT_DIR, `${id}-${name}-hover.png`)).replace(/\\/g, "/");
    const focusShotRelative = path.relative(path.resolve(__dirname, "../../"), path.join(SCREENSHOT_DIR, `${id}-${name}-focus.png`)).replace(/\\/g, "/");

    results.push({
      id,
      name,
      found: true,
      selector,
      defaultShot: defaultShotRelative,
      hoverShot: hoverShotRelative,
      focusShot: focusShotRelative,
      focusStyle,
    });
  };

  // 1. Primary button (Box page open button)
  await capturePrimitiveStates({
    id: "AG-S-001",
    name: "primary-button",
    pageUrl: `${BASE_URL}/box/gaming-playstation/`,
    selector: ".v-openbar .v-btn, .v-btn:not(.v-btn--quiet)",
  });

  // 2. Quiet button (e.g. load more boxes button)
  await capturePrimitiveStates({
    id: "AG-S-002",
    name: "quiet-button",
    pageUrl: `${BASE_URL}/`,
    selector: ".v-btn--quiet",
  });

  // 2-B. Sheet close button
  await capturePrimitiveStates({
    id: "AG-S-010",
    name: "sheet-close",
    pageUrl: `${BASE_URL}/`,
    setupAction: async (p) => {
      const btn = p.locator(".v-headbtn").first();
      if ((await btn.count()) > 0) await btn.click();
    },
    selector: ".v-sheet-close",
  });

  // 3. Link (Box page "구성품과 확률" link)
  await capturePrimitiveStates({
    id: "AG-S-003",
    name: "link",
    pageUrl: `${BASE_URL}/box/gaming-playstation/`,
    selector: ".v-link, .v-notes summary",
  });

  // 4. Chip (Home category chip or Box count chip)
  await capturePrimitiveStates({
    id: "AG-S-004",
    name: "chip",
    pageUrl: `${BASE_URL}/`,
    selector: ".v-chip",
  });

  // 5. Box card (Home box card)
  await capturePrimitiveStates({
    id: "AG-S-005",
    name: "box-card",
    pageUrl: `${BASE_URL}/`,
    selector: ".v-boxcard",
  });

  // 6. Input (Search input on home)
  await capturePrimitiveStates({
    id: "AG-S-006",
    name: "input",
    pageUrl: `${BASE_URL}/`,
    selector: ".v-input",
  });

  // 7. Header button (Headbtn in header)
  await capturePrimitiveStates({
    id: "AG-S-007",
    name: "headbtn",
    pageUrl: `${BASE_URL}/`,
    selector: ".v-headbtn",
  });

  // 8. Nav link (Header nav link)
  await capturePrimitiveStates({
    id: "AG-S-008",
    name: "nav-link",
    pageUrl: `${BASE_URL}/`,
    selector: ".v-nav a",
  });

  // 9. Item row / strip item
  await capturePrimitiveStates({
    id: "AG-S-009",
    name: "item-strip",
    pageUrl: `${BASE_URL}/box/gaming-playstation/`,
    selector: ".v-strip-item, .v-itemrow",
  });

  await context.close();
  await browser.close();

  await fs.writeFile(RESULT_FILE, JSON.stringify(results, null, 2), "utf8");
  console.log(`Hover & Focus-visible capture completed. Results saved to ${RESULT_FILE}`);
}

main().catch(console.error);
