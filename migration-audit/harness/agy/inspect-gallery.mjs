import { createRequire } from "node:module";
const require = createRequire(new URL("../../../web/package.json", import.meta.url));
const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();
  await page.goto("https://shinwon446-eng.github.io/voila-test-aresjoo/ko/dev/gallery/", { waitUntil: "networkidle" });
  
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button")).map(b => (b.innerText || b.textContent || "").trim());
  });
  console.log("Buttons on dev/gallery:", buttons);
  await browser.close();
}
main();
