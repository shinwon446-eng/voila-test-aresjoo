// 개발 전용 갤러리(/dev/gallery). 배포 사이트에는 없는 화면이라 떠 있는 개발 서버(기본 http://localhost:3002)에서만 본다.
//   실행(web 폴더에서): GALLERY_BASE=http://localhost:3002 node ../migration-audit/harness/claude-b/11-gallery-dev.mjs
// 여기서 누르는 것은 화면만 열고 돈은 움직이지 않는다(표본 자료). 배송 시트는 열기만 한다.
import { recorder, launch, txt, sleep, SHOTS } from "./lib.mjs";
import path from "node:path";
const { check, run, save } = recorder("11-gallery-dev");
const base = (process.env.GALLERY_BASE || "http://localhost:3002").replace(/\/$/, "");

await run("g1", async () => {
  const browser = await launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR", reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
  const r = await page.goto(base + "/ko/dev/gallery", { waitUntil: "networkidle" });
  check("g1", "개발 서버의 갤러리가 열린다", r.status() === 200 && (await txt(page.locator("h1"))) === "Gallery", { status: r.status(), base });
  const sections = await page.locator("main section > h2").allInnerTexts();
  check("g1", "절 목록", "info", sections);
  const buttons = await page.locator("main .v-btn--quiet").allInnerTexts();
  check("g1", "여는 단추(조용한 단추) 목록", "info", buttons);
  await page.screenshot({ path: path.join(SHOTS, "11-g1-gallery.png") });
  const sheetText = () => page.evaluate(() => [...document.querySelectorAll(".v-sheet, .v-reveal")].map((e) => e.innerText).join(" || ").replace(/\s+/g, " "));
  const closeAll = async () => { for (let i = 0; i < 3; i++) { if (!(await page.locator(".v-scrim, .v-reveal").count())) break; await page.keyboard.press("Escape"); await sleep(450); } };
  // 알약
  const chips = page.locator("main section .v-chips .v-chip");
  await chips.nth(2).click(); await sleep(100);
  check("g1", "Chips: 누르면 선택이 옮겨 간다", (await chips.nth(2).getAttribute("aria-pressed")) === "true");
  // 토스트
  await page.locator("main .v-btn--quiet", { hasText: "주소를 복사했습니다" }).click(); await sleep(200);
  check("g1", "Toast: 한 줄이 뜨고 2.4초 뒤 사라진다", (await txt(page.locator(".v-toast"))) === "주소를 복사했습니다");
  await sleep(2700);
  check("g1", "Toast: 사라졌다", (await page.locator(".v-toast").count()) === 0);
  // 시트 여덟, 확인창 넷, 결과 셋
  for (const label of buttons.slice(1)) {
    const btn = page.locator("main .v-btn--quiet", { hasText: label }).first();
    await btn.scrollIntoViewIfNeeded(); await btn.click(); await sleep(700);
    const t = await sheetText();
    const opened = (await page.locator(".v-scrim, .v-reveal").count()) > 0;
    check("g1", `단추 "${label}": 겹침 화면이 열린다`, opened, t.slice(0, 140));
    await closeAll();
    check("g1", `단추 "${label}": Esc 로 닫힌다`, (await page.locator(".v-scrim, .v-reveal").count()) === 0);
  }
  check("g1", "실행 예외 없음", errors.length === 0, errors.join(" | "));
  await context.close();
});

await save();
