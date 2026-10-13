import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(new URL("../../../web/package.json", import.meta.url));
const { chromium } = require("playwright");

const BASE_URL = "https://shinwon446-eng.github.io/voila-test-aresjoo";
const SCREENSHOT_DIR = path.resolve(__dirname, "../../screenshots/before/agy/routes");
const RESULT_FILE = path.resolve(__dirname, "routes-result.json");

const ROUTES = [
  { id: "R-001", slug: "home", path: "" },
  { id: "R-002", slug: "about", path: "about" },
  { id: "R-003", slug: "account", path: "account" },
  { id: "R-004", slug: "box-playstation", path: "box/gaming-playstation" },
  { id: "R-005", slug: "box-rolex", path: "box/watch-rolex" },
  { id: "R-006", slug: "box-charizard", path: "box/pokemon-charizard" },
  { id: "R-007", slug: "community", path: "community" },
  { id: "R-008", slug: "community-board", path: "community/board" },
  { id: "R-009", slug: "dev-gallery", path: "dev/gallery" },
  { id: "R-010", slug: "fairness", path: "fairness" },
  { id: "R-011", slug: "guide", path: "guide" },
  { id: "R-012", slug: "inventory", path: "inventory" },
  { id: "R-013", slug: "legal", path: "legal" },
  { id: "R-014", slug: "legal-terms", path: "legal/terms" },
  { id: "R-015", slug: "profile", path: "profile" },
  { id: "R-016", slug: "reviews", path: "reviews" },
  { id: "R-017", slug: "verify", path: "verify" },
  { id: "R-018", slug: "wallet", path: "wallet" },
  { id: "R-019", slug: "wallet-withdraw", path: "wallet/withdraw" },
  { id: "R-020", slug: "wins", path: "wins" },
];

const VIEWPORTS = [
  // ko: 320, 390, 768, 1280, 1920
  { locale: "ko", width: 320, height: 640, isMobile: true, hasTouch: true, dsf: 2 },
  { locale: "ko", width: 390, height: 844, isMobile: true, hasTouch: true, dsf: 2 },
  { locale: "ko", width: 768, height: 1024, isMobile: false, hasTouch: false, dsf: 1 },
  { locale: "ko", width: 1280, height: 900, isMobile: false, hasTouch: false, dsf: 1 },
  { locale: "ko", width: 1920, height: 1080, isMobile: false, hasTouch: false, dsf: 1 },
  // en: 390, 1440
  { locale: "en", width: 390, height: 844, isMobile: true, hasTouch: true, dsf: 2 },
  { locale: "en", width: 1440, height: 900, isMobile: false, hasTouch: false, dsf: 1 },
  // zh: 390, 1440
  { locale: "zh", width: 390, height: 844, isMobile: true, hasTouch: true, dsf: 2 },
  { locale: "zh", width: 1440, height: 900, isMobile: false, hasTouch: false, dsf: 1 },
];

async function main() {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const allResults = [];

  console.log(`Starting capture of ${ROUTES.length} routes across ${VIEWPORTS.length} viewports (total ${ROUTES.length * VIEWPORTS.length} combinations)...`);

  let count = 0;
  const total = ROUTES.length * VIEWPORTS.length;

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dsf,
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
      locale: vp.locale === "en" ? "en-US" : vp.locale === "zh" ? "zh-CN" : "ko-KR",
      reducedMotion: "reduce",
    });

    const page = await context.newPage();

    for (const route of ROUTES) {
      count++;
      const fullUrl = route.path ? `${BASE_URL}/${vp.locale}/${route.path}/` : `${BASE_URL}/${vp.locale}/`;
      const baseFilename = `${route.id}-${route.slug}-${vp.locale}-${vp.width}`;
      const firstShotPath = path.join(SCREENSHOT_DIR, `${baseFilename}-first.png`);
      const fullShotPath = path.join(SCREENSHOT_DIR, `${baseFilename}-full.png`);

      const consoleErrors = [];
      const failedRequests = [];
      const consoleHandler = (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 300));
      };
      const pageErrorHandler = (err) => {
        consoleErrors.push(`pageerror: ${err.message}`.slice(0, 300));
      };
      const requestFailedHandler = (req) => {
        failedRequests.push({ url: req.url(), failure: req.failure()?.errorText || "failed" });
      };
      const responseHandler = (res) => {
        if (res.status() >= 400) {
          failedRequests.push({ url: res.url(), status: res.status() });
        }
      };

      page.on("console", consoleHandler);
      page.on("pageerror", pageErrorHandler);
      page.on("requestfailed", requestFailedHandler);
      page.on("response", responseHandler);

      let status = 0;
      let loadError = null;

      try {
        const resp = await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 20000 });
        status = resp ? resp.status() : 0;
        await page.waitForTimeout(300); // UI settle
      } catch (err) {
        loadError = err.message;
        console.error(`[${count}/${total}] ERROR loading ${fullUrl}: ${err.message}`);
      }

      // First screen screenshot
      try {
        await page.screenshot({ path: firstShotPath, fullPage: false });
      } catch (e) {
        console.error(`Failed first screenshot ${firstShotPath}: ${e.message}`);
      }

      // Full page screenshot
      try {
        await page.screenshot({ path: fullShotPath, fullPage: true });
      } catch (e) {
        console.error(`Failed full screenshot ${fullShotPath}: ${e.message}`);
      }

      // Inspect DOM metrics
      const domMetrics = await page.evaluate(() => {
        const docW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        const bodyW = document.body ? document.body.scrollWidth : 0;
        const docH = document.documentElement.scrollHeight;

        // Check missing images
        const imgs = Array.from(document.querySelectorAll("img"));
        const missingImages = imgs
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => ({
            src: img.src,
            alt: img.alt,
            classes: img.className,
          }));

        // Sample text elements for wrap/truncation analysis
        const titles = Array.from(document.querySelectorAll(".v-title, h1, h2, .v-card-title, .v-section")).slice(0, 5).map((el) => ({
          tag: el.tagName,
          classes: el.className,
          text: (el.textContent || "").trim().slice(0, 100),
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
        }));

        return {
          docW,
          winW,
          bodyW,
          docH,
          horizontalOverflow: docW > winW,
          overflowPx: Math.max(0, docW - winW),
          totalImages: imgs.length,
          missingImages,
          titles,
        };
      }).catch((e) => ({
        docW: 0,
        winW: vp.width,
        bodyW: 0,
        docH: 0,
        horizontalOverflow: false,
        overflowPx: 0,
        totalImages: 0,
        missingImages: [],
        titles: [],
        evalError: e.message,
      }));

      page.off("console", consoleHandler);
      page.off("pageerror", pageErrorHandler);
      page.off("requestfailed", requestFailedHandler);
      page.off("response", responseHandler);

      const record = {
        routeId: route.id,
        slug: route.slug,
        routePath: route.path,
        locale: vp.locale,
        width: vp.width,
        height: vp.height,
        status,
        loadError,
        firstShot: path.relative(path.resolve(__dirname, "../../"), firstShotPath).replace(/\\/g, "/"),
        fullShot: path.relative(path.resolve(__dirname, "../../"), fullShotPath).replace(/\\/g, "/"),
        consoleErrors,
        failedRequests,
        domMetrics,
      };

      allResults.push(record);

      if (count % 20 === 0 || count === total) {
        console.log(`[${count}/${total}] Processed ${route.slug} (${vp.locale} ${vp.width}px): status=${status}, overflow=${domMetrics.horizontalOverflow ? `${domMetrics.overflowPx}px` : "no"}, errors=${consoleErrors.length}, missingImgs=${domMetrics.missingImages.length}`);
      }
    }

    await context.close();
  }

  await browser.close();

  await fs.writeFile(RESULT_FILE, JSON.stringify(allResults, null, 2), "utf8");
  console.log(`Route capture finished! Saved ${allResults.length} records to ${RESULT_FILE}`);
}

main().catch(console.error);
