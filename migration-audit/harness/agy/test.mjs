import { createRequire } from "node:module";
const require = createRequire(new URL("../../../web/package.json", import.meta.url));
const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const consoleMsgs = [];
  page.on("console", msg => consoleMsgs.push(`${msg.type()}: ${msg.text()}`));
  page.on("pageerror", err => consoleMsgs.push(`pageerror: ${err.message}`));

  const targetUrl = "https://shinwon446-eng.github.io/voila-test-aresjoo/ko/";
  console.log(`Navigating to ${targetUrl}...`);
  const response = await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });
  console.log(`Status: ${response.status()}`);
  console.log(`Title: ${await page.title()}`);
  console.log(`Console messages:`, consoleMsgs);

  await browser.close();
}

main().catch(console.error);
