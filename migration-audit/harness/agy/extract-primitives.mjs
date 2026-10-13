import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(new URL("../../../web/package.json", import.meta.url));
const { chromium } = require("playwright");

const BASE_URL = "https://shinwon446-eng.github.io/voila-test-aresjoo";
const RESULT_FILE = path.resolve(__dirname, "primitives-result.json");

const TOKENS_EXPECTED = {
  bg: "rgb(0, 0, 0)",
  card: "rgb(48, 48, 48)",
  pill: "rgb(47, 47, 47)",
  pillHover: "rgb(58, 58, 58)",
  title: "rgb(255, 255, 255)",
  text: "rgb(236, 236, 236)",
  sub: "rgb(205, 205, 205)",
  mute: "rgb(154, 154, 154)",
  primary: "rgb(255, 255, 255)",
  onPrimary: "rgb(0, 0, 0)",
  rCard: "26px",
  rField: "19px",
  rPill: "999px",
  btnH: "52px",
  touch: "44px",
  fsBody: "16px",
  fsSmall: "14px",
  fsSection: "18px",
  fsTitle: "32px",
};

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  // Test at desktop (1280) and mobile (390)
  const resultsByViewport = {};

  for (const vp of [
    { name: "desktop", width: 1280, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      locale: "ko-KR",
    });

    const page = await context.newPage();

    // 1. Visit Home
    await page.goto(`${BASE_URL}/ko/`, { waitUntil: "networkidle" });

    // Function to extract computed styles of selector
    const extractStyle = async (selector, description) => {
      return await page.evaluate(({ selector, description }) => {
        const el = document.querySelector(selector);
        if (!el) return { description, selector, found: false };
        const cs = window.getComputedStyle(el);
        return {
          description,
          selector,
          found: true,
          tagName: el.tagName,
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing,
          padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
          gap: cs.gap,
          borderRadius: cs.borderRadius,
          border: `${cs.borderWidth} ${cs.borderStyle} ${cs.borderColor}`,
          borderWidth: cs.borderWidth,
          borderStyle: cs.borderStyle,
          borderColor: cs.borderColor,
          backgroundColor: cs.backgroundColor,
          color: cs.color,
          boxShadow: cs.boxShadow,
          height: cs.height,
          minHeight: cs.minHeight,
          width: cs.width,
          minWidth: cs.minWidth,
          display: cs.display,
        };
      }, { selector, description });
    };

    const primitives = {};

    // Chip (from home)
    primitives["chip"] = await extractStyle(".v-chip", "Chip (고르는 알약)");
    // Box card (from home)
    primitives["box-card"] = await extractStyle(".v-boxcard", "Box Card (박스 카드)");
    // Header (from home)
    primitives["header"] = await extractStyle(".v-header", "Header (머리줄)");
    primitives["headbtn"] = await extractStyle(".v-headbtn", "Header Button (머리줄 알약 단추)");
    // Footer (from home)
    primitives["footer"] = await extractStyle(".v-footer, footer", "Footer (꼬리말)");
    // Input (search input or text input on home/wallet)
    primitives["input"] = await extractStyle(".v-input", "Input (입력칸)");

    // 2. Visit Box Page for primary button, item rows, links
    await page.goto(`${BASE_URL}/ko/box/gaming-playstation/`, { waitUntil: "networkidle" });
    primitives["primary-button"] = await extractStyle(".v-openbar .v-btn, .v-btn:not(.v-btn--quiet)", "Primary Button (주 단추)");
    primitives["item-row"] = await extractStyle(".v-itemrow", "Item Row (구성품 행)");
    primitives["link"] = await extractStyle(".v-link", "Link (글 링크)");
    primitives["card"] = await extractStyle(".v-card", "Card (카드)");

    // 3. Open a modal/sheet (e.g. click "구성품과 확률" or Login or Language) to inspect .v-sheet and .v-btn--quiet
    // Let's click "구성품과 확률" or header login button to inspect sheet
    const loginBtn = page.locator(".v-headbtn").first();
    if (await loginBtn.count() > 0) {
      await loginBtn.click();
      await page.waitForTimeout(500);
      primitives["sheet"] = await extractStyle(".v-sheet", "Sheet (시트/모달)");
      primitives["quiet-button"] = await extractStyle(".v-btn--quiet, .v-sheet .v-btn--quiet, .v-sheet-close", "Quiet Button / Sheet Close (보조 단추)");
    }

    resultsByViewport[vp.name] = primitives;
    await context.close();
  }

  await browser.close();

  // Compare with tokens
  const comparison = {
    resultsByViewport,
    tokenComparison: {
      primaryButton: {
        tokenBg: TOKENS_EXPECTED.primary,
        actualBgDesktop: resultsByViewport.desktop?.["primary-button"]?.backgroundColor,
        tokenColor: TOKENS_EXPECTED.onPrimary,
        actualColorDesktop: resultsByViewport.desktop?.["primary-button"]?.color,
        tokenRadius: TOKENS_EXPECTED.rPill,
        actualRadiusDesktop: resultsByViewport.desktop?.["primary-button"]?.borderRadius,
        tokenHeight: TOKENS_EXPECTED.btnH,
        actualMinHeightDesktop: resultsByViewport.desktop?.["primary-button"]?.minHeight,
      },
      chip: {
        tokenBg: TOKENS_EXPECTED.pill,
        actualBgDesktop: resultsByViewport.desktop?.["chip"]?.backgroundColor,
        tokenRadius: TOKENS_EXPECTED.rPill,
        actualRadiusDesktop: resultsByViewport.desktop?.["chip"]?.borderRadius,
        actualMinHeightDesktop: resultsByViewport.desktop?.["chip"]?.minHeight,
      },
      card: {
        tokenBg: TOKENS_EXPECTED.card,
        actualBgDesktop: resultsByViewport.desktop?.["card"]?.backgroundColor,
        tokenRadiusDesktop: TOKENS_EXPECTED.rCard,
        actualRadiusDesktop: resultsByViewport.desktop?.["card"]?.borderRadius,
        actualRadiusMobile: resultsByViewport.mobile?.["card"]?.borderRadius,
      },
      input: {
        tokenBg: TOKENS_EXPECTED.pill,
        actualBgDesktop: resultsByViewport.desktop?.["input"]?.backgroundColor,
        tokenRadius: TOKENS_EXPECTED.rField,
        actualRadiusDesktop: resultsByViewport.desktop?.["input"]?.borderRadius,
      },
      sheet: {
        tokenBg: TOKENS_EXPECTED.bg,
        actualBgDesktop: resultsByViewport.desktop?.["sheet"]?.backgroundColor,
        tokenRadiusDesktop: TOKENS_EXPECTED.rCard,
        actualRadiusDesktop: resultsByViewport.desktop?.["sheet"]?.borderRadius,
        actualRadiusMobile: resultsByViewport.mobile?.["sheet"]?.borderRadius,
      },
    },
  };

  await fs.writeFile(RESULT_FILE, JSON.stringify(comparison, null, 2), "utf8");
  console.log(`Computed styles extracted and saved to ${RESULT_FILE}`);
}

main().catch(console.error);
