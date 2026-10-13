import { createRequire } from "node:module";
const require = createRequire(new URL("../../../web/package.json", import.meta.url));
const { chromium } = require("playwright");
import { makeState, installState } from "../../../web/scripts/capture/states.mjs";

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext();
  const state = await makeState("funded", "ko");
  const origin = "https://shinwon446-eng.github.io";
  await installState(context, state, origin);

  const page = await context.newPage();
  await page.goto("https://shinwon446-eng.github.io/voila-test-aresjoo/ko/", { waitUntil: "networkidle" });
  
  // Check balance display or user nickname
  const headerText = await page.locator(".v-header").innerText().catch(() => "header not found");
  console.log("Header text:", headerText.replace(/\n+/g, " "));

  await browser.close();
}

main().catch(console.error);
