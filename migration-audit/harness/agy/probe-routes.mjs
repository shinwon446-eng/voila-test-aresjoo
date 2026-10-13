import { createRequire } from "node:module";
const require = createRequire(new URL("../../../web/package.json", import.meta.url));
const { chromium } = require("playwright");

const routes = [
  "",
  "about",
  "account",
  "box/gaming-playstation",
  "box/watch-rolex",
  "box/pokemon-charizard",
  "community",
  "community/board",
  "dev/gallery",
  "fairness",
  "guide",
  "inventory",
  "legal",
  "legal/terms",
  "profile",
  "reviews",
  "verify",
  "wallet",
  "wallet/withdraw",
  "wins",
];

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const baseUrl = "https://shinwon446-eng.github.io/voila-test-aresjoo/ko";
  for (const r of routes) {
    const url = r ? `${baseUrl}/${r}/` : `${baseUrl}/`;
    try {
      const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
      console.log(`[${resp.status()}] ${url} -> ${page.url()} (${await page.title()})`);
    } catch (e) {
      console.error(`FAILED: ${url} -> ${e.message}`);
    }
  }

  await browser.close();
}

main().catch(console.error);
