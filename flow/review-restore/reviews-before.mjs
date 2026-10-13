// 원본 빌드(4198)의 후기 영역이 무엇을 그리는지, 그리고 홈 390 에서 첫 그림 뒤 자리가 바뀐 카드가 무엇인지 본다
import { createRequire } from "node:module";
const { chromium } = createRequire(new URL("../../web/package.json", import.meta.url))("playwright");
import { installState, makeState } from "../../web/scripts/capture/states.mjs";
const base = process.env.CAPTURE_BASE || "http://localhost:3003";
const before = process.env.BEFORE_BASE || "http://127.0.0.1:4198/voila-test-aresjoo";
const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const [label, url] of [["before", before + "/ko/box/car-rolls-royce/"], ["now", base + "/ko/box/car-rolls-royce"]]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "ko-KR" });
  const page = await context.newPage(); const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 120))); page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 120)); });
  await page.goto(url, { waitUntil: "networkidle" }); await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const sec = document.querySelector("#reviews, .v-rvstrip, .v-boxlayout-reviews");
    const classes = new Set(); sec?.querySelectorAll("*").forEach((e) => e.classList.forEach((c) => classes.add(c)));
    const card = sec?.querySelector(".v-rvcard, .v-rv, li");
    const cs = card ? getComputedStyle(card) : null; const r = card?.getBoundingClientRect();
    const ul = sec?.querySelector("ul"); const ucs = ul ? getComputedStyle(ul) : null;
    return { text: sec?.innerText.replace(/\s+/g, " ").slice(0, 300), classes: Array.from(classes).filter((c) => /rv|hscroll|row|card|grid/.test(c)).sort(), cardW: r ? Math.round(r.width) : null, cardH: r ? Math.round(r.height) : null, radius: cs?.borderRadius, bg: cs?.backgroundColor, ulDisplay: ucs?.display, ulOverflowX: ucs?.overflowX, mask: ucs ? (ucs.webkitMaskImage || ucs.maskImage) !== "none" : null, cards: sec?.querySelectorAll("li").length, btns: document.querySelectorAll(".v-hscroll-btn").length, html: sec?.outerHTML.slice(0, 600) };
  });
  console.log(label, JSON.stringify(info), "errors:", errors.slice(0, 3));
  await context.close();
}
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ko-KR", reducedMotion: "reduce" });
  await installState(context, await makeState("guest", "ko"), new URL(base).origin);
  const page = await context.newPage();
  await page.goto(base + "/ko", { waitUntil: "domcontentloaded" }); await page.waitForSelector("a[href*='/ko/box/'] img", { timeout: 15000 });
  const read = () => page.evaluate(() => Array.from(document.querySelectorAll("a[href*='/ko/box/']")).filter((a) => a.getClientRects().length > 0 && a.getBoundingClientRect().height > 120).slice(0, 8).map((a) => ({ href: a.getAttribute("href").split("/box/")[1], top: Math.round(a.getBoundingClientRect().top), h: Math.round(a.getBoundingClientRect().height), imgH: Math.round(a.querySelector("img")?.getBoundingClientRect().height ?? 0), complete: a.querySelector("img")?.complete })));
  const a = await read(); await page.waitForTimeout(1500); const b = await read();
  console.log("home390 first:", JSON.stringify(a)); console.log("home390 later:", JSON.stringify(b));
  await context.close();
}
await browser.close();
