// 홈 격자: 첫 그림(domcontentloaded 직후) 과 1.5초 뒤의 격자 카드 순서와 자리, 머리 띠의 늦은 등장 여부. 로그인 상태(inventory 프리셋)와 비로그인(guest) 둘 다
import { createRequire } from "node:module";
const { chromium } = createRequire(new URL("../../web/package.json", import.meta.url))("playwright");
import { installState, makeState } from "../../web/scripts/capture/states.mjs";
const base = process.env.CAPTURE_BASE || "http://localhost:3003";
const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const preset of ["guest", "inventory"]) for (const [view, vp] of [["390", { width: 390, height: 844 }], ["1440", { width: 1440, height: 900 }]]) {
  const context = await browser.newContext({ viewport: vp, locale: "ko-KR", reducedMotion: "reduce" });
  await installState(context, await makeState(preset, "ko"), new URL(base).origin);
  const page = await context.newPage();
  await page.goto(base + "/ko", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("a[href*='/ko/box/'] img", { timeout: 15000 });
  const read = () => page.evaluate(() => {
    const all = Array.from(document.querySelectorAll("a[href*='/ko/box/']")).filter((a) => a.getClientRects().length > 0);
    const cards = all.filter((a) => a.getBoundingClientRect().height > 120).slice(0, 8);
    const hero = all.filter((a) => a.getBoundingClientRect().height <= 120).map((a) => ({ href: a.getAttribute("href").split("/box/")[1], top: Math.round(a.getBoundingClientRect().top), h: Math.round(a.getBoundingClientRect().height) }));
    return { cards: cards.map((a) => ({ href: a.getAttribute("href").split("/box/")[1], top: Math.round(a.getBoundingClientRect().top), h: Math.round(a.getBoundingClientRect().height) })), hero, docH: document.documentElement.scrollHeight };
  });
  const first = await read(); await page.waitForTimeout(1500); const later = await read();
  const orderSame = JSON.stringify(first.cards.map((c) => c.href)) === JSON.stringify(later.cards.map((c) => c.href));
  const posSame = JSON.stringify(first.cards.map((c) => [c.top, c.h])) === JSON.stringify(later.cards.map((c) => [c.top, c.h]));
  console.log(`${preset} ${view}: 순서 그대로 ${orderSame}, 자리 그대로 ${posSame}; 첫 카드 top ${first.cards[0]?.top} -> ${later.cards[0]?.top}; 머리 띠 ${JSON.stringify(first.hero)} -> ${JSON.stringify(later.hero)}; 순서 ${first.cards.map((c) => c.href).join(",")}${orderSame ? "" : " -> " + later.cards.map((c) => c.href).join(",")}`);
  await context.close();
}
await browser.close();
