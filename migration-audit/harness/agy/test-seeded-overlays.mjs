import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(new URL("../../../web/package.json", import.meta.url));
const { chromium } = require("playwright");
import { makeState, installState } from "../../../web/scripts/capture/states.mjs";

const BASE_URL = "https://shinwon446-eng.github.io/voila-test-aresjoo/ko";
const SCREENSHOT_DIR = path.resolve(__dirname, "../../screenshots/before/agy/overlays");
const ORIGIN = "https://shinwon446-eng.github.io";

async function main() {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "ko-KR",
  });
  const state = await makeState("funded", "ko");
  await installState(context, state, ORIGIN);

  const page = await context.newPage();

  const results = {};

  // 1. Balance Sheet (Click header balance)
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const balanceBtn = page.locator(".v-headbtn:has-text('$')").first();
  if (await balanceBtn.count() > 0) {
    await balanceBtn.click();
    await page.waitForTimeout(500);

    const sheet = page.locator(".v-sheet").first();
    const visible = await sheet.isVisible();
    const shotPath = path.join(SCREENSHOT_DIR, "AG-I-004-balance-seeded-open.png");
    await page.screenshot({ path: shotPath });

    const scrollInfo = await page.evaluate(() => {
      const cs = window.getComputedStyle(document.body);
      return { bodyOverflowY: cs.overflowY, bodyOverflow: cs.overflow };
    });

    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    const afterEscape = await sheet.isVisible().catch(() => false);

    // Re-open and test outside click
    await balanceBtn.click();
    await page.waitForTimeout(300);
    await page.mouse.click(20, 20);
    await page.waitForTimeout(300);
    const afterOutside = await sheet.isVisible().catch(() => false);

    results.balance = {
      reachableWithAccount: true,
      openShot: path.relative(path.resolve(__dirname, "../../"), shotPath).replace(/\\/g, "/"),
      scrollLock: scrollInfo.bodyOverflow === "hidden" || scrollInfo.bodyOverflowY === "hidden",
      bodyOverflow: scrollInfo.bodyOverflowY || scrollInfo.bodyOverflow,
      escapeCloses: !afterEscape,
      outsideClickCloses: !afterOutside,
    };
  }

  // 2. Charge Sheet (From wallet page while logged in)
  await page.goto(`${BASE_URL}/wallet/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const chargeBtn = page.locator(".v-main .v-btn:has-text('충전'), button:has-text('USDT 충전')").first();
  if (await chargeBtn.count() > 0) {
    await chargeBtn.click();
    await page.waitForTimeout(500);

    const sheet = page.locator(".v-sheet").first();
    const visible = await sheet.isVisible();
    const shotPath = path.join(SCREENSHOT_DIR, "AG-I-003-charge-seeded-open.png");
    await page.screenshot({ path: shotPath });

    const scrollInfo = await page.evaluate(() => {
      const cs = window.getComputedStyle(document.body);
      return { bodyOverflowY: cs.overflowY, bodyOverflow: cs.overflow };
    });

    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    const afterEscape = await sheet.isVisible().catch(() => false);

    // Re-open and test outside click
    await chargeBtn.click();
    await page.waitForTimeout(300);
    await page.mouse.click(20, 20);
    await page.waitForTimeout(300);
    const afterOutside = await sheet.isVisible().catch(() => false);

    results.charge = {
      reachableWithAccount: true,
      openShot: path.relative(path.resolve(__dirname, "../../"), shotPath).replace(/\\/g, "/"),
      scrollLock: scrollInfo.bodyOverflow === "hidden" || scrollInfo.bodyOverflowY === "hidden",
      bodyOverflow: scrollInfo.bodyOverflowY || scrollInfo.bodyOverflow,
      escapeCloses: !afterEscape,
      outsideClickCloses: !afterOutside,
    };
  }

  console.log("Seeded overlays result:", JSON.stringify(results, null, 2));

  // Merge into overlays-result.json
  const existing = JSON.parse(await fs.readFile(path.resolve(__dirname, "overlays-result.json"), "utf8"));
  for (const item of existing) {
    if (item.name === "balance" && results.balance) {
      item.seededResult = results.balance;
    }
    if (item.name === "charge" && results.charge) {
      item.seededResult = results.charge;
    }
  }
  await fs.writeFile(path.resolve(__dirname, "overlays-result.json"), JSON.stringify(existing, null, 2), "utf8");

  await context.close();
  await browser.close();
}

main().catch(console.error);
