import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(new URL("../../../web/package.json", import.meta.url));
const { chromium } = require("playwright");
import { makeState, installState } from "../../../web/scripts/capture/states.mjs";

const BASE_URL = "https://shinwon446-eng.github.io/voila-test-aresjoo";
const MOTION_DIR = path.resolve(__dirname, "../../motion/agy");
const RESULT_FILE = path.resolve(__dirname, "motion-result.json");
const ORIGIN = "https://shinwon446-eng.github.io";

async function recordOpeningSequence({
  runId,
  boxSlug = "gaming-playstation",
  count = 1,
  reducedMotion = false,
  browser,
}) {
  const dir = path.join(MOTION_DIR, runId);
  await fs.mkdir(dir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "ko-KR",
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
  });

  const state = await makeState("funded", "ko");
  await installState(context, state, ORIGIN);

  const page = await context.newPage();
  const url = `${BASE_URL}/ko/box/${boxSlug}/`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // If count > 1, select qty chip
  if (count > 1) {
    const chip = page.locator(`.v-openbar .v-chip:has-text("${count}개"), .v-chips .v-chip:has-text("${count}개")`).first();
    if ((await chip.count()) > 0) {
      await chip.click();
      await page.waitForTimeout(300);
    }
  }

  const openBtn = page.locator(".v-openbar .v-btn:not([disabled])").first();
  await openBtn.waitFor({ state: "visible", timeout: 10000 });

  const frames = [];
  const phaseLog = [];

  console.log(`[${runId}] Starting run: count=${count}, reducedMotion=${reducedMotion}...`);

  // Start clicking
  const startTime = Date.now();
  await openBtn.click();

  // If confirm alert dialog appears (e.g. for >= 50 USDT or 10 boxes)
  const confirmBtn = page.locator('[role="alertdialog"] .v-btn').first();
  if ((await confirmBtn.count()) > 0 && (await confirmBtn.isVisible())) {
    await confirmBtn.click();
  }

  const animStart = Date.now();

  // Sample every 100ms for up to 2500ms
  const targetDurationMs = reducedMotion ? 1200 : 2500;
  const intervalMs = 100;
  let elapsed = 0;

  while (elapsed <= targetDurationMs) {
    const frameTime = Date.now() - animStart;
    const frameFilename = `frame-${String(Math.round(elapsed)).padStart(4, "0")}ms.png`;
    const framePath = path.join(dir, frameFilename);

    await page.screenshot({ path: framePath });

    // Inspect current DOM state
    const domState = await page.evaluate(() => {
      const op = document.querySelector(".v-op, .v-reveal");
      if (!op) return { found: false };
      const phase = op.getAttribute("data-phase") || document.querySelector(".v-op-scene")?.getAttribute("data-phase") || (document.querySelector(".v-reveal-result") ? "reveal" : "anticipation");
      const openingState = op.getAttribute("data-opening-state") || (document.querySelector(".v-reveal-result") ? "revealed" : "opening");
      return {
        found: true,
        phase,
        openingState,
        tone: op.getAttribute("data-tone"),
        hasResult: Boolean(document.querySelector(".v-op-result[aria-hidden='false'], .v-reveal-result")),
        hasOpeningBox: Boolean(document.querySelector(".v-boxw, .v-box3")),
        hasAgainBtn: Boolean(document.querySelector("[data-open-again], .v-reveal-actions .v-btn")),
      };
    }).catch(() => ({ found: false }));

    frames.push({
      elapsedMs: Math.round(elapsed),
      actualMs: frameTime,
      file: path.relative(path.resolve(__dirname, "../../"), framePath).replace(/\\/g, "/"),
      domState,
    });

    phaseLog.push({
      ms: Math.round(elapsed),
      phase: domState.phase,
      openingState: domState.openingState,
    });

    // Wait until next interval
    elapsed += intervalMs;
    const nextTargetTime = animStart + elapsed;
    const wait = nextTargetTime - Date.now();
    if (wait > 0) {
      await page.waitForTimeout(wait);
    }
  }

  // Calculate measured durations of each phase
  const phases = {};
  for (const entry of phaseLog) {
    const p = entry.phase || "none";
    if (!phases[p]) phases[p] = { startMs: entry.ms, endMs: entry.ms, durationMs: 0 };
    phases[p].endMs = entry.ms;
    phases[p].durationMs = phases[p].endMs - phases[p].startMs + intervalMs;
  }

  console.log(`[${runId}] Completed. Detected phases:`, phases);

  await context.close();

  return {
    runId,
    boxSlug,
    count,
    reducedMotion,
    totalSampledMs: elapsed,
    phases,
    phaseLog,
    frames,
  };
}

async function main() {
  await fs.mkdir(MOTION_DIR, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });

  const runs = [
    // 1. One box, normal motion
    { runId: "open-1-normal", boxSlug: "gaming-playstation", count: 1, reducedMotion: false },
    // 2. One box, reduced motion
    { runId: "open-1-reduced", boxSlug: "gaming-playstation", count: 1, reducedMotion: true },
    // 3. Five boxes, normal motion
    { runId: "open-5-normal", boxSlug: "gaming-playstation", count: 5, reducedMotion: false },
    // 4. Five boxes, reduced motion
    { runId: "open-5-reduced", boxSlug: "gaming-playstation", count: 5, reducedMotion: true },
  ];

  const results = [];
  for (const run of runs) {
    const res = await recordOpeningSequence({ ...run, browser });
    results.push(res);
  }

  await browser.close();

  await fs.writeFile(RESULT_FILE, JSON.stringify(results, null, 2), "utf8");
  console.log(`Motion frame recording completed. Results saved to ${RESULT_FILE}`);
}

main().catch(console.error);
