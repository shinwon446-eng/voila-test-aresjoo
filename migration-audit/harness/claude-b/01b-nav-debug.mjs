// 01-nav 에서 어긋난 세 가지를 따로 본다: 404 화면의 링크가 가는 곳, 뒤로와 앞으로, 다른 탭 로그아웃이 이 탭에 전해지는지.
import { recorder, session, txt, sleep, BASE } from "./lib.mjs";
const { check, run, save } = recorder("01b-nav-debug");

await run("d1", async () => {
  const s = await session({ preset: "guest", view: "mobile" });
  const page = await s.context.newPage();
  const r = await page.goto(BASE + "/ko/no-such-page/", { waitUntil: "networkidle" });
  const a = page.locator("main a.v-btn");
  const href = await a.getAttribute("href");
  const resolved = await a.evaluate((e) => e.href);
  await a.click(); await page.waitForLoadState("networkidle"); await sleep(500);
  const body = (await txt(page.locator("body"))).slice(0, 160);
  check("d1", "없는 주소 화면(상태 " + r.status() + ")의 박스 보기 링크", "info", { href, resolved, landed: page.url(), title: await page.title(), body });
  check("d1", "박스 보기 링크가 이 사이트의 박스 목록으로 간다", page.url().startsWith(BASE + "/ko"), page.url());
  await s.shot(page, "01b-d1-404-link-landed");
  // 로케일 안의 없는 주소 화면(머리줄이 있는 것)은 배포 사이트에서 어디에 나오는가
  const g = await s.context.newPage();
  const gr = await g.goto(BASE + "/ko/dev/gallery/", { waitUntil: "networkidle" });
  const ga = g.locator("main a.v-btn");
  check("d1", "/ko/dev/gallery/: 상태, 머리줄 유무, 링크", "info", { status: gr.status(), header: await g.locator(".v-header").count(), href: await ga.getAttribute("href"), text: (await txt(g.locator("main"))).slice(0, 80) });
  await s.context.close();
});

await run("d2", async () => {
  const s = await session({ preset: "guest", view: "mobile" });
  const page = await s.open("/ko/");
  const href = await page.locator(".v-boxgrid .v-boxcard").first().getAttribute("href");
  await page.locator(".v-boxgrid .v-boxcard").first().click(); await page.waitForURL(/\/box\//); await sleep(300);
  const u1 = page.url();
  await page.goBack(); await sleep(800); const u2 = page.url();
  const cardsBack = await page.locator(".v-boxgrid .v-boxcard").count();
  await page.goForward(); await sleep(800); const u3 = page.url();
  const title = await txt(page.locator("h1"));
  check("d2", "카드 → 뒤로 → 앞으로", u1.endsWith(href) && /\/ko\/$/.test(new URL(u2).pathname) && u3 === u1, { href, u1, u2, cardsBack, u3, title });
  // 스크롤 위치: 아래로 내린 뒤 박스로 갔다가 뒤로
  await page.goBack(); await sleep(800);
  await page.evaluate(() => window.scrollTo(0, 1800)); await sleep(200);
  const y0 = await page.evaluate(() => window.scrollY);
  await page.locator(".v-boxgrid .v-boxcard").nth(8).click(); await page.waitForURL(/\/box\//); await sleep(400);
  const yBox = await page.evaluate(() => window.scrollY);
  await page.goBack(); await sleep(1000);
  const y1 = await page.evaluate(() => window.scrollY);
  check("d2", "목록을 내린 뒤 박스로 갔다가 뒤로: 스크롤 위치(본 것)", "info", { y0, yBox, y1 });
  await s.context.close();
});

await run("d3", async () => {
  const s = await session({ preset: "funded", view: "mobile" });
  const page = await s.open("/ko/box/dollar-apple/");
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  await page.evaluate(() => { window.__ev = []; window.addEventListener("storage", (e) => window.__ev.push({ key: e.key, has: e.newValue !== null })); });
  const other = await s.open("/ko/account/");
  await other.waitForSelector("main .v-rows");
  const linkText = await txt(other.locator("main > div > .v-links .v-link").last());
  await other.locator("main > div > .v-links .v-link").last().click(); await other.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(250);
  await other.locator('[role="alertdialog"] .v-btn').click(); await sleep(1000);
  const otherText = (await txt(other.locator("main"))).slice(0, 120);
  const sess = await other.evaluate(() => localStorage.getItem("voila.browser-session.v1"));
  check("d3", "다른 탭: 로그아웃이 끝났다(세션 키 없음)", sess === null && otherText.includes("로그인"), { linkText, otherText, sess });
  const toast = await txt(other.locator(".v-toast-host"));
  check("d3", "로그아웃 뒤 토스트(새 화면의 토스트 자리에 뜨는지 본 것)", "info", { toast });
  await s.shot(other, "01b-d3-logged-out");
  const ev = await page.evaluate(() => window.__ev);
  check("d3", "이 탭이 받은 storage 사건의 키(본 것)", "info", ev);
  const before = { line: await page.locator(".v-offline").count(), btn: await txt(page.locator(".v-openbar .v-btn").first()) };
  check("d3", "storage 사건만으로 세션 끝남 한 줄이 뜬다", before.line === 1, before);
  // 창으로 돌아온 것처럼 focus 사건을 보낸다
  await page.bringToFront(); await page.evaluate(() => window.dispatchEvent(new Event("focus"))); await sleep(800);
  const after = { line: await txt(page.locator(".v-offline")), btn: await txt(page.locator(".v-openbar .v-btn").first()), bal: await page.locator("[data-balance-open]").count() };
  check("d3", "창으로 돌아오면(focus) 세션을 다시 확인해 한 줄이 뜬다", after.line.includes("세션이 끝났습니다."), after);
  await s.shot(page, "01b-d3-session-lost");
  // 세션 끝남 한 줄의 로그인 링크
  if (await page.locator(".v-offline .v-link").count()) { await page.locator(".v-offline .v-link").click(); await page.waitForSelector(".v-sheet"); check("d3", "한 줄의 로그인 링크는 로그인 시트를 연다", true); }
  await s.context.close();
});

// d4: 다른 탭이 로그아웃한 것을 모르는 탭에서 열기를 누르면
await run("d4", async () => {
  const s = await session({ preset: "funded", view: "mobile", fixture: "dollar-apple:single:low" });
  const page = await s.open("/ko/box/dollar-apple/");
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  const other = await s.open("/ko/account/");
  await other.waitForSelector("main .v-rows");
  await other.locator("main > div > .v-links .v-link").last().click(); await other.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(250);
  await other.locator('[role="alertdialog"] .v-btn').click(); await sleep(1000);
  const stale = await txt(page.locator(".v-openbar .v-btn").first());
  await page.locator("[data-open-primary]").click().catch(() => {});
  await sleep(2500);
  const state = await page.evaluate(() => {
    const rd = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null")?.state ?? null; } catch { return null; } };
    const w = rd("voila.browser-wallet.capture-account"), g = rd("voila.browser-wallet.guest");
    return { session: localStorage.getItem("voila.browser-session.v1"), account: { bal: w?.balance, opens: (w?.transactions || []).filter((t) => t.type === "open").length }, guest: { bal: g?.balance, opens: (g?.transactions || []).filter((t) => t.type === "open").length }, op: !!document.querySelector(".v-op"), line: document.querySelector(".v-offline")?.innerText ?? null };
  });
  check("d4", "다른 탭이 로그아웃한 뒤, 모르는 탭에서 열기를 눌렀을 때(본 것)", "info", { stale, state });
  await s.context.close();
});

await save();
