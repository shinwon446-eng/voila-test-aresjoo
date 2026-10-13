// 후기의 오가기와 자판을 실제 브라우저에서 본다(F-01, F-05). 그림은 찍지 않고 숫자를 적는다. 판정은 사람이 한다.
//   node scripts/capture/flow-reviews-nav.mjs [박스 slug] [건수가 적은 박스 slug]
// 떠 있는 개발 서버(3002)를 쓴다. 다른 주소는 CAPTURE_BASE 로 준다.
//  1) 뒤로 가기: 모아 보기에서 60장을 펴고 쉰다섯 번째 장의 박스로 갔다가 뒤로 오면 같은 60장, 같은 자리여야 한다.
//     앞으로 갔다 다시 뒤로 와도, 새로 고쳐도 같다. 다른 화면에서 새로 들어오면 처음 장수(20장)다.
//     박스 화면의 줄도 같다: 끝까지 밀어 60장을 붙이고 줄을 가운데쯤 둔 채 "후기 모두 보기"로 갔다가 뒤로 오면 60장, 화면의 세로 자리와 줄의 가로 자리가 같다. 새로 들어오면 20장, 줄은 맨 앞.
//  2) 줄과 자판: 줄의 마지막 장에 초점을 두면(보이는 자리로 들어와 끝에 가까워진다) 스무 장이 더 붙고, 초점은 그 장에 그대로 있고, 알림 영역(data-reviews-live)에 늘어난 장수가 적힌다.
//  3) 모아 보기의 더 보기와 자판: Enter 를 누를 때마다 초점이 새로 생긴 첫 장에 가 있어야 하고(끝까지 편 뒤에도 body 로 떨어지지 않는다), 늘어난 장수가 알림 영역에 적혀야 한다.
import { chromium } from "playwright";

const [slug = "mobile-apple", small = "car-bentley"] = process.argv.slice(2);
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ko-KR", reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 200)));
const state = () => page.evaluate(() => ({ cards: document.querySelectorAll(".v-rvcard").length, y: Math.round(scrollY), x: Math.round(document.querySelector(".v-rvrow")?.scrollLeft ?? 0), last: Array.from(document.querySelectorAll(".v-rvcard .v-rvcard-who > .v-small:first-child")).pop()?.textContent }));
const more = async (n) => { for (let i = 0; i < n; i++) { await page.locator("[data-reviews-more]").click(); await page.waitForTimeout(150); } };
const same = (a, b) => (a.cards === b.cards && Math.abs(a.y - b.y) <= 4 && Math.abs(a.x - b.x) <= 4 && a.last === b.last ? "같다" : "다르다");

// 1) 뒤로 가기: 모아 보기
await page.goto(`${base}/ko/reviews`, { waitUntil: "networkidle" });
await more(2);
await page.locator(".v-rvcard").nth(54).scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const before = await state();
await page.locator(".v-rvcard-btn").nth(54).click();
await page.waitForTimeout(400);
await page.locator("[role=dialog] a[href*='/box/']").click();
await page.waitForURL(/\/box\//);
await page.waitForTimeout(600);
await page.goBack();
await page.waitForTimeout(900);
const back = await state();
console.log("모아 보기 떠나기 전", JSON.stringify(before), "뒤로 온 뒤", JSON.stringify(back), same(before, back));
await page.goForward(); await page.waitForTimeout(600); await page.goBack(); await page.waitForTimeout(900);
console.log("모아 보기 앞으로 갔다 다시 뒤로", JSON.stringify(await state()), same(before, await state()));
await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(600);
console.log("모아 보기 새로 고친 뒤", JSON.stringify(await state()), same(before, await state()));
await page.goto(`${base}/ko`, { waitUntil: "networkidle" });
await page.goto(`${base}/ko/reviews`, { waitUntil: "networkidle" });
console.log("모아 보기 새 방문", JSON.stringify(await state()));

// 1) 뒤로 가기: 박스 화면의 줄
await page.goto(`${base}/ko/box/${slug}`, { waitUntil: "networkidle" });
await page.locator("#reviews").scrollIntoViewIfNeeded();
for (let i = 0; i < 2; i++) { await page.evaluate(() => { const row = document.querySelector(".v-rvrow"); row.scrollLeft = row.scrollWidth; }); await page.waitForTimeout(500); }
await page.evaluate(() => { document.querySelector(".v-rvrow").scrollLeft = 3000; });
// 링크를 화면 가운데에 둔다(아래의 고정 막대에 가려 있으면 누를 때 브라우저가 다시 옮겨 자리가 어긋나 보인다)
await page.evaluate(() => document.querySelector("#reviews a[href*='/reviews?box=']").scrollIntoView({ block: "center" }));
await page.waitForTimeout(400);
const boxBefore = await state();
await page.locator("#reviews a[href*='/reviews?box=']").click();
await page.waitForURL(/\/reviews\?box=/);
await page.waitForTimeout(600);
await page.goBack();
await page.waitForTimeout(900);
const boxBack = await state();
console.log("박스 화면 떠나기 전", JSON.stringify(boxBefore), "뒤로 온 뒤", JSON.stringify(boxBack), same(boxBefore, boxBack));
await page.goto(`${base}/ko`, { waitUntil: "networkidle" });
await page.goto(`${base}/ko/box/${slug}`, { waitUntil: "networkidle" });
console.log("박스 화면 새 방문", JSON.stringify(await state()));

// 2) 줄과 자판: 마지막 장에 초점을 두면 더 붙고 초점은 그대로
await page.locator("#reviews").scrollIntoViewIfNeeded();
const lastBefore = (await state()).cards;
await page.locator(".v-rvcard-btn").nth(lastBefore - 1).focus();
await page.waitForTimeout(600);
const rowFocus = await page.evaluate((n) => { const cards = Array.from(document.querySelectorAll(".v-rvcard-btn")); return { cards: cards.length, focus: cards.indexOf(document.activeElement) + 1, live: document.querySelector("[data-reviews-live]")?.textContent || null }; }, lastBefore);
console.log("줄의 마지막 장에 초점", lastBefore, "장에서", JSON.stringify(rowFocus), rowFocus.cards > lastBefore && rowFocus.focus === lastBefore && rowFocus.live ? "더 붙고 초점은 그대로, 알림 있음" : "다르다");

// 3) 모아 보기의 더 보기와 자판
await page.goto(`${base}/ko/reviews?box=${small}`, { waitUntil: "networkidle" });
for (let i = 0; i < 30; i++) {
  const button = page.locator("[data-reviews-more]");
  if (await button.count() === 0) break;
  const from = await page.locator(".v-rvcard").count();
  await button.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  const now = await page.evaluate(() => {
    const el = document.activeElement, cards = Array.from(document.querySelectorAll(".v-rvcard-btn"));
    return { cards: cards.length, focus: el === document.body ? "body" : el.matches("[data-reviews-more]") ? "더 보기 단추" : cards.includes(el) ? cards.indexOf(el) + 1 : el.tagName, live: document.querySelector("[data-reviews-live]")?.textContent ?? null, button: !!document.querySelector("[data-reviews-more]") };
  });
  console.log("더 보기", from, "장에서", JSON.stringify(now), now.focus === from + 1 ? "초점이 새로 생긴 첫 장에 있다" : "초점이 다른 데 있다");
}
console.log(errors.length ? "콘솔 오류: " + errors.join(" || ") : "콘솔 오류 없음");
await browser.close();
