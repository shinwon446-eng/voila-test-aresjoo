// 배포 사이트(원본)를 새 Chrome 창에서 열어 라우트와 숨은 화면을 눌러 본다. 저장소의 파일은 고치지 않는다.
// 출금과 배송 신청은 제출하지 않는다(화면을 열어 보기만 한다). 개봉과 받기는 새 창의 시험 장부 안에서만 일어난다.
// 실행: node migration-audit/harness/claude-a/probe.mjs [crawl|ui|all]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../../..");
const web = path.join(repo, "web");
const require = createRequire(path.join(web, "package.json"));
const { chromium } = require("playwright");
const { installState, makeState } = await import(pathToFileURL(path.join(web, "scripts/capture/states.mjs")).href);

const ORIGIN = "https://shinwon446-eng.github.io";
const BASE = ORIGIN + "/voila-test-aresjoo";
const shots = path.join(repo, "migration-audit/screenshots/before/claude-a");
fs.mkdirSync(shots, { recursive: true });
const mode = process.argv[2] || "all";
const VIEW = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
};
const browser = await chromium.launch({ channel: "chrome", headless: true });
const log = [];
const note = (name, data) => { log.push({ name, ...data }); console.log(name, JSON.stringify(data).slice(0, 1500)); };

async function open(view, pathname, { preset, locale = "ko", motion = "reduce" } = {}) {
  const context = await browser.newContext({ ...VIEW[view], locale: locale === "en" ? "en-US" : locale === "zh" ? "zh-CN" : "ko-KR", reducedMotion: motion });
  if (preset) await installState(context, await makeState(preset, locale), ORIGIN);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  const response = await page.goto(BASE + pathname, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(700);
  return { context, page, errors, status: response?.status() ?? null };
}

const pageInfo = (page) => page.evaluate(() => {
  const txt = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
  const rel = (a) => a.getAttribute("href");
  return {
    url: location.pathname + location.search,
    title: document.title,
    lang: document.documentElement.lang,
    h1: txt(document.querySelector("h1")),
    desc: txt(document.querySelector("main .v-desc")).slice(0, 120),
    header: [...document.querySelectorAll(".v-header a, .v-header button")].map((e) => (txt(e) || e.getAttribute("aria-label")) + (e.tagName === "A" ? " -> " + rel(e) : "")),
    navVisible: getComputedStyle(document.querySelector(".v-nav") || document.body).display,
    mainLinks: [...new Set([...document.querySelectorAll("main a[href]")].map(rel))].slice(0, 12),
    mainLinkCount: document.querySelectorAll("main a[href]").length,
    mainButtons: [...document.querySelectorAll("main button")].map((e) => txt(e) || e.getAttribute("aria-label")).slice(0, 25),
    mainButtonCount: document.querySelectorAll("main button").length,
    sections: [...document.querySelectorAll("main h2")].map(txt).slice(0, 14),
    footerLinks: [...document.querySelectorAll(".v-footer a, .v-footer button")].map((e) => (txt(e) || e.getAttribute("aria-label")) + (e.tagName === "A" ? " -> " + rel(e) : "")),
    footerPresent: !!document.querySelector(".v-footer"),
    dialogs: document.querySelectorAll("[role=dialog],[role=alertdialog]").length,
    lines: [...document.querySelectorAll("main .v-line, main .v-empty, .v-offline")].map(txt).slice(0, 8),
    skeleton: document.querySelectorAll(".v-skel").length,
    labTopLine: !!document.querySelector("div[aria-hidden].fixed.top-0"),
    docW: document.documentElement.scrollWidth, winW: innerWidth,
  };
});

const dialogInfo = (page) => page.evaluate(() => {
  const txt = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
  const ds = [...document.querySelectorAll("[role=dialog],[role=alertdialog]")];
  return {
    count: ds.length, scrims: document.querySelectorAll(".v-scrim").length, bodyOverflow: document.body.style.overflow,
    dialogs: ds.map((d) => ({
      role: d.getAttribute("role"), cls: d.className, modal: d.getAttribute("aria-modal"), inert: d.inert, ariaHidden: d.getAttribute("aria-hidden"),
      title: txt(d.querySelector("h2")) || d.getAttribute("aria-label"), desc: txt(d.querySelector(".v-desc")).slice(0, 100),
      focusInside: d === document.activeElement || d.contains(document.activeElement),
      controls: [...d.querySelectorAll("button, a[href]")].filter((b) => !b.closest("[role=dialog] [role=dialog]") || b.closest("[role=dialog],[role=alertdialog]") === d).map((b) => (txt(b) || b.getAttribute("aria-label") || "").slice(0, 44) + (b.disabled ? " [disabled]" : "") + (b.getAttribute("aria-pressed") === "true" || b.getAttribute("aria-checked") === "true" ? " [on]" : "")).slice(0, 40),
      fields: [...d.querySelectorAll("input, textarea")].map((i) => txt(i.closest("label")?.querySelector(".v-field-label")) || i.getAttribute("aria-label") || i.type),
      rows: [...d.querySelectorAll(".v-row")].map((r) => txt(r).slice(0, 70)).slice(0, 16),
      lines: [...d.querySelectorAll(".v-line, .v-empty, .v-small")].map((r) => txt(r).slice(0, 90)).slice(0, 8),
    })),
  };
});

/** 열려 있는 맨 위 겹침 화면을 세 가지 방법으로 닫아 본다. reopen 은 다시 여는 함수 */
async function closeWays(page, reopen, ways = ["escape", "scrim", "x"]) {
  const out = {};
  for (const way of ways) {
    const before = (await dialogInfo(page)).count;
    if (!before) { await reopen(); await page.waitForTimeout(400); }
    const n0 = (await dialogInfo(page)).count;
    if (way === "escape") await page.keyboard.press("Escape");
    if (way === "scrim") await page.mouse.click(4, 4);
    if (way === "x") await page.locator(".v-sheet-close").last().click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(350);
    const after = await dialogInfo(page);
    out[way] = `${n0}->${after.count}, overflow="${after.bodyOverflow}"`;
  }
  return out;
}
async function tabTrap(page, presses = 14) {
  let inside = 0;
  for (let i = 0; i < presses; i++) { await page.keyboard.press("Tab"); if (await page.evaluate(() => { const d = [...document.querySelectorAll("[role=dialog],[role=alertdialog]")].pop(); return !!d && d.contains(document.activeElement); })) inside++; }
  return `${inside}/${presses} inside`;
}
const shot = (page, name) => page.screenshot({ path: path.join(shots, name + ".png") }).catch(() => {});
// 셋째 인자를 주면 이름에 그 글이 든 단계만 돌린다(예: node probe.mjs ui "open five")
const only = process.argv[3] || "";
const step = async (name, fn) => { if (only && !name.includes(only)) return; try { await fn(); } catch (e) { note(name + " FAILED", { error: String(e).split("\n")[0].slice(0, 300) }); } };

// ── 1. 라우트 훑기: 세 언어, 로그인 전, PC 폭
if (mode === "crawl" || mode === "all") {
  const routes = ["/", "/about/", "/account/", "/box/pokemon-charizard/", "/box/dollar-apple/", "/community/", "/community/board/", "/dev/gallery/", "/fairness/", "/guide/", "/inventory/", "/legal/", "/legal/terms/", "/profile/", "/reviews/", "/reviews/?box=dollar-apple", "/reviews/?box=no-such", "/verify/", "/verify/?s=abc&h=def&c=ghi&n=3&box=dollar-apple", "/wallet/", "/wallet/withdraw/", "/wins/", "/no-such-page/", "/box/no-such-box/", "/legal/no-such-doc/"];
  for (const locale of ["ko", "en", "zh"]) {
    for (const r of routes) {
      await step(`crawl ${locale}${r}`, async () => {
        const { context, page, errors, status } = await open("desktop", "/" + locale + r, { locale });
        note(`crawl /${locale}${r}`, { status, ...(await pageInfo(page)), errors: errors.slice(0, 3) });
        await context.close();
      });
    }
  }
  for (const r of ["/", "/no-such/", "/ja/"]) {
    await step("crawl root " + r, async () => {
      const { context, page, errors, status } = await open("desktop", r, {});
      await page.waitForTimeout(800);
      note("crawl root " + r, { status, ...(await pageInfo(page)), rootLink: await page.evaluate(() => document.querySelector("a.v-btn")?.getAttribute("href") ?? null), errors: errors.slice(0, 3) });
      await context.close();
    });
  }
  // 모바일 폭의 머리줄
  await step("crawl mobile home", async () => {
    const { context, page } = await open("mobile", "/ko/", {});
    note("crawl mobile /ko/", await pageInfo(page));
    await shot(page, "home-guest-mobile");
    await context.close();
  });
}

// ── 2. 숨은 화면
if (mode === "ui" || mode === "all") {
  for (const view of ["mobile", "desktop"]) {
    // 2.1 로그인 시트(로그인 전)
    await step(`${view} login sheet`, async () => {
      const { context, page } = await open(view, "/ko/", {});
      const reopen = () => page.locator(".v-header .v-headbtn").first().click();
      await reopen(); await page.waitForTimeout(500);
      note(`${view} login sheet`, await dialogInfo(page));
      await shot(page, `login-sheet-${view}`);
      note(`${view} login sheet tab trap`, { trap: await tabTrap(page) });
      note(`${view} login sheet close`, await closeWays(page, reopen));
      // 가입, 비밀번호 찾기 화면으로 바꿔 보기
      await reopen(); await page.waitForTimeout(300);
      await page.locator(".v-sheet .v-links .v-link").first().click(); await page.waitForTimeout(300);
      note(`${view} signup sheet`, await dialogInfo(page));
      // 빈 이메일로 계속: 그 자리 한 줄
      await page.locator(".v-sheet button[type=submit]").click(); await page.waitForTimeout(400);
      note(`${view} signup empty email`, await dialogInfo(page));
      await context.close();
    });
    // 2.2 메뉴 시트
    await step(`${view} menu sheet`, async () => {
      const { context, page } = await open(view, "/ko/guide/", {});
      const visible = await page.locator(".v-menu-btn").isVisible();
      if (!visible) { note(`${view} menu sheet`, { menuButtonVisible: false }); await context.close(); return; }
      const reopen = () => page.locator(".v-menu-btn").click();
      await reopen(); await page.waitForTimeout(400);
      note(`${view} menu sheet`, { expanded: await page.locator(".v-menu-btn").getAttribute("aria-expanded"), ...(await dialogInfo(page)) });
      await shot(page, `menu-sheet-${view}`);
      note(`${view} menu sheet close`, await closeWays(page, reopen));
      await context.close();
    });
  }

  // 2.3 홈: 찾기, 분류, 더 보기, 배너
  await step("home interactions", async () => {
    const { context, page } = await open("desktop", "/ko/", {});
    const count = () => page.evaluate(() => ({ cards: document.querySelectorAll(".v-boxcard").length, chips: [...document.querySelectorAll(".v-chips .v-chip")].map((c) => c.textContent + (c.getAttribute("aria-pressed") === "true" ? "*" : "")), more: [...document.querySelectorAll("main .v-btn--quiet")].map((b) => b.textContent), hero: !!document.querySelector(".v-hero"), heroPhase: document.querySelector(".v-hero")?.getAttribute("data-phase"), heroStill: document.querySelector(".v-hero")?.hasAttribute("data-still"), heroCta: document.querySelector(".v-hero-cta .v-btn")?.textContent, heroCanvas: document.querySelectorAll(".v-hero-orb canvas").length, rows: document.querySelectorAll(".v-itemrow").length, empty: document.querySelector(".v-empty")?.textContent ?? null, ratingCards: document.querySelectorAll(".v-boxcard-rating").length }));
    note("home default", await count());
    await page.locator("main .v-btn--quiet").click(); await page.waitForTimeout(300);
    note("home after more", await count());
    await page.locator(".v-chips .v-chip").nth(1).click(); await page.waitForTimeout(300);
    note("home category 1", await count());
    await page.locator(".v-search input").fill("아이폰"); await page.waitForTimeout(400);
    note("home search hit", await count());
    await shot(page, "home-search-desktop");
    await page.locator(".v-search input").fill("zzzzqqq"); await page.waitForTimeout(300);
    note("home search none", await count());
    await page.locator(".v-search input").fill(""); await page.waitForTimeout(300);
    // 꼬리말의 표시 통화와 언어
    const before = await page.locator(".v-boxcard .v-sub").first().textContent();
    await page.locator(".v-footer-cols button").click(); await page.waitForTimeout(300);
    const after = await page.locator(".v-boxcard .v-sub").first().textContent();
    note("footer currency toggle", { before, after, label: await page.locator(".v-footer-cols button").textContent() });
    // 배너의 단추(로그인 전): 가입 시트
    await page.locator(".v-hero-cta .v-btn").click(); await page.waitForTimeout(400);
    note("hero cta guest", await dialogInfo(page));
    await context.close();
  });

  // 2.4 박스 화면(로그인 전): 상품 시트, 접힌 것, 후기
  for (const slug of ["pokemon-charizard", "dollar-apple"]) {
    await step("box guest " + slug, async () => {
      const { context, page } = await open("desktop", `/ko/box/${slug}/`, {});
      note(`box ${slug} guest`, await page.evaluate(() => ({ h1: document.querySelector("h1")?.textContent, ratinglink: document.querySelector(".v-ratinglink")?.textContent ?? null, mainitem: !!document.querySelector(".v-mainitem"), boxhero: !!document.querySelector(".v-boxhero"), facts: [...document.querySelectorAll(".v-boxside .v-row")].map((r) => r.textContent), openbar: [...document.querySelectorAll(".v-openbar-in > *")].map((e) => e.className + ": " + e.textContent.slice(0, 80)), tiers: [...document.querySelectorAll(".v-tierhead")].map((e) => e.textContent), tiles: document.querySelectorAll("button.v-item").length, rows: document.querySelectorAll(".v-boxlayout-contents .v-itemrow").length, details: [...document.querySelectorAll("details")].map((d) => d.querySelector("summary").textContent + (d.open ? " [open]" : " [closed]")), reviews: { cards: document.querySelectorAll(".v-rvcard").length, sum: document.querySelector(".v-rvsum-num")?.textContent ?? null, empty: document.querySelector("#reviews .v-empty")?.textContent ?? null, links: [...document.querySelectorAll("#reviews .v-links a")].map((a) => a.textContent + " -> " + a.getAttribute("href")), hscrollBtns: [...document.querySelectorAll(".v-hscroll-btn")].map((b) => b.getAttribute("data-dir")) }, odds: [...document.querySelectorAll(".v-boxlayout-odds .v-row")].map((r) => r.textContent).slice(0, 12) })));
      await shot(page, `box-${slug}-guest-desktop`);
      // 상품 시트
      const tile = page.locator("button.v-item, .v-boxlayout-contents button.v-itemrow").first();
      await tile.click(); await page.waitForTimeout(400);
      note(`box ${slug} item sheet`, await dialogInfo(page));
      await shot(page, `box-${slug}-item-sheet-desktop`);
      // 배송 나라 보기, 다른 박스 비교
      for (const link of await page.locator(".v-sheet .v-links button.v-link").all()) { await link.click().catch(() => {}); await page.waitForTimeout(200); }
      note(`box ${slug} item sheet expanded`, await dialogInfo(page));
      note(`box ${slug} item sheet close`, await closeWays(page, () => tile.click()));
      // 접힌 것 펴기
      for (const s of await page.locator("details > summary").all()) { await s.click(); await page.waitForTimeout(150); }
      note(`box ${slug} details open`, await page.evaluate(() => [...document.querySelectorAll("details")].map((d) => ({ open: d.open, rows: d.querySelectorAll(".v-itemrow").length, text: [...d.querySelectorAll("p")].map((p) => p.textContent.slice(0, 90)), links: [...d.querySelectorAll("a")].map((a) => a.getAttribute("href")) }))));
      // 후기 카드
      if (await page.locator(".v-rvcard-btn").count()) {
        await page.locator(".v-rvcard-btn").first().click(); await page.waitForTimeout(400);
        note(`box ${slug} review sheet`, await dialogInfo(page));
        await page.keyboard.press("Escape");
        if (await page.locator(".v-hscroll-btn[data-dir=next]").count()) { await page.locator(".v-hscroll-btn[data-dir=next]").click(); await page.waitForTimeout(700); note(`box ${slug} hscroll after next`, { btns: await page.evaluate(() => [...document.querySelectorAll(".v-hscroll-btn")].map((b) => b.getAttribute("data-dir"))) }); }
      }
      // 수량과 로그인 단추
      await page.locator(".v-openbar .v-chip").nth(2).click(); await page.waitForTimeout(200);
      note(`box ${slug} qty 10 guest`, { openbar: await page.evaluate(() => [...document.querySelectorAll(".v-openbar-in > *")].map((e) => e.textContent.slice(0, 80))) });
      await context.close();
    });
  }

  // 2.5 개봉: 한 개(장면), 다섯 개(목록), 큰 금액 확인창. 새 창의 시험 장부 안에서만
  await step("open one", async () => {
    const { context, page } = await open("mobile", "/ko/box/pokemon-charizard/", { preset: "funded" });
    note("box funded openbar", { header: await page.evaluate(() => [...document.querySelectorAll(".v-header button")].map((b) => b.textContent || b.getAttribute("aria-label"))), openbar: await page.evaluate(() => [...document.querySelectorAll(".v-openbar-in > *")].map((e) => e.className + ": " + e.textContent.slice(0, 80))) });
    await shot(page, "box-funded-mobile");
    await page.locator("[data-open-primary]").click();
    await page.waitForSelector(".v-op", { timeout: 15000 });
    await page.waitForTimeout(1200);
    note("opening one", { op: await page.evaluate(() => { const o = document.querySelector(".v-op"); return { phase: o.dataset.phase, tone: o.dataset.tone, kind: o.dataset.kind, state: o.dataset.openingState, role: o.getAttribute("role"), modal: o.getAttribute("aria-modal"), top: [...o.querySelectorAll(".v-op-top > *")].map((e) => e.textContent || [...e.querySelectorAll("button")].map((b) => b.getAttribute("aria-label")).join("|")), result: [...o.querySelectorAll(".v-op-result > *")].map((e) => e.className + ": " + e.textContent.slice(0, 70)), status: [...o.querySelectorAll(".v-op-status > *")].map((e) => e.textContent), actions: [...o.querySelectorAll(".v-op-actions button, .v-op-actions a, .v-op-actions p")].map((e) => e.tagName + ": " + e.textContent.slice(0, 60) + (e.disabled ? " [disabled]" : "")), armed: o.querySelector(".v-op-actions")?.hasAttribute("data-armed"), bodyOverflow: document.body.style.overflow, focusInside: o === document.activeElement || o.contains(document.activeElement) }; }) });
    await shot(page, "opening-one-mobile");
    // 설정 시트
    await page.locator(".v-op-tool").first().click(); await page.waitForTimeout(300);
    note("opening settings sheet", await dialogInfo(page));
    await shot(page, "opening-settings-mobile");
    // 자동 받기: 확인창이 뜨는지만 보고 취소
    await page.locator(".v-op-toggle").nth(2).click(); await page.waitForTimeout(300);
    note("opening auto confirm", await dialogInfo(page));
    await page.locator(".v-confirm-actions .v-link").click(); await page.waitForTimeout(300);
    note("opening settings after cancel", await dialogInfo(page));
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    // 검증 시트
    await page.locator(".v-op-actions .v-link", { hasText: "검증" }).click(); await page.waitForTimeout(900);
    note("opening verify sheet", await dialogInfo(page));
    await shot(page, "verify-sheet-mobile");
    await page.locator(".v-sheet .v-links button.v-link").first().click(); await page.waitForTimeout(200);
    note("verify sheet method open", { steps: await page.locator(".v-sheet .v-step").count() });
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    // 받기 확인창(있을 때만): 열어 보고 취소
    if (await page.locator("[data-take-primary]").count()) {
      await page.locator("[data-take-primary]").click(); await page.waitForTimeout(300);
      note("opening take confirm", await dialogInfo(page));
      await shot(page, "take-confirm-mobile");
      await page.locator(".v-confirm-actions .v-link").click(); await page.waitForTimeout(300);
    }
    // Esc: 결과가 다 보인 뒤에는 닫힌다
    await page.keyboard.press("Escape"); await page.waitForTimeout(400);
    note("opening after escape", { op: await page.locator(".v-op").count(), bodyOverflow: await page.evaluate(() => document.body.style.overflow) });
    await context.close();
  });
  await step("open five and confirm", async () => {
    const { context, page } = await open("mobile", "/ko/box/pokemon-charizard/", { preset: "funded" });
    await page.locator(".v-openbar .v-chip").nth(1).click();
    note("box funded qty 5 openbar", { openbar: await page.evaluate(() => [...document.querySelectorAll(".v-openbar-in > *")].map((e) => e.className + ": " + e.textContent.slice(0, 80))) });
    await page.locator("[data-open-primary]").click(); await page.waitForTimeout(400);
    // 낼 값이 50 USDT 이상이면 확인창이 먼저 뜬다
    if (await page.locator(".v-confirm-actions").count()) {
      note("big open confirm (qty 5)", await dialogInfo(page));
      await shot(page, "open-confirm-qty5-mobile");
      note("big open confirm (qty 5) close", await closeWays(page, () => page.locator("[data-open-primary]").click(), ["escape", "scrim"]));
      await page.locator("[data-open-primary]").click(); await page.waitForTimeout(400);
      await page.locator(".v-confirm-actions .v-btn").click();
    }
    await page.waitForSelector(".v-reveal", { timeout: 15000 });
    await page.waitForTimeout(1200);
    note("reveal five", await page.evaluate(() => { const r = document.querySelector(".v-reveal"); return { role: r.getAttribute("role"), close: !!r.querySelector(".v-sheet-close"), top: r.querySelector(".v-reveal-top")?.textContent, title: r.querySelector("h2")?.textContent, desc: r.querySelector(".v-desc")?.textContent, best: r.querySelector(".v-best")?.textContent ?? null, summary: [...r.querySelectorAll("dl .v-row")].map((x) => x.textContent), list: [...r.querySelectorAll("ul.v-rows li")].map((x) => x.textContent.slice(0, 60)), actions: [...r.querySelectorAll(".v-reveal-actions button, .v-reveal-actions a")].map((e) => e.textContent.slice(0, 60) + (e.disabled ? " [disabled]" : "")), bodyOverflow: document.body.style.overflow }; }));
    await shot(page, "reveal-five-mobile");
    // 행 하나: 상품 시트
    const row = page.locator(".v-reveal ul.v-rows button.v-row").first();
    if (await row.count()) { await row.click(); await page.waitForTimeout(400); note("reveal row sheet", await dialogInfo(page)); await page.keyboard.press("Escape"); await page.waitForTimeout(300); }
    // 받기 선택 시트(방금 나온 것)
    if (await page.locator("[data-take-batch]").count()) {
      await page.locator("[data-take-batch]").click(); await page.waitForTimeout(500);
      note("reveal take sheet", await dialogInfo(page));
      await shot(page, "take-sheet-fresh-mobile");
      await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    }
    await page.keyboard.press("Escape"); await page.waitForTimeout(400);
    note("reveal after escape", { reveal: await page.locator(".v-reveal").count() });
    // 큰 금액 확인창: 10개
    await page.locator(".v-openbar .v-chip").nth(2).click();
    await page.locator("[data-open-primary]").click(); await page.waitForTimeout(400);
    note("big open confirm", await dialogInfo(page));
    await shot(page, "open-confirm-mobile");
    note("big open confirm close", await closeWays(page, () => page.locator("[data-open-primary]").click(), ["escape", "scrim"]));
    await context.close();
  });

  // 2.6 보관함(보관 상품 둘)
  await step("inventory", async () => {
    const { context, page } = await open("mobile", "/ko/inventory/", { preset: "inventory" });
    note("inventory held", await pageInfo(page));
    await shot(page, "inventory-held-mobile");
    await page.locator("main .v-itemrow").first().click(); await page.waitForTimeout(400);
    note("inventory item sheet", await dialogInfo(page));
    await shot(page, "inventory-item-sheet-mobile");
    // 받기 확인창: 취소
    await page.locator("[data-take-primary]").click(); await page.waitForTimeout(300);
    note("inventory take confirm", await dialogInfo(page));
    await page.locator(".v-confirm-actions .v-link").click(); await page.waitForTimeout(300);
    // 배송 시트: 열어 보기만 한다(제출하지 않는다)
    const ship = page.locator(".v-sheet .v-links button.v-link").first();
    await ship.click(); await page.waitForTimeout(400);
    note("ship sheet", await dialogInfo(page));
    await shot(page, "ship-sheet-mobile");
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    note("after ship sheet escape", await dialogInfo(page));
    // 검증 시트
    await page.locator(".v-sheet .v-links button.v-link").last().click(); await page.waitForTimeout(900);
    note("inventory verify sheet", await dialogInfo(page));
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    // 묶음 받기 선택 시트
    await page.locator("[data-take-batch]").click(); await page.waitForTimeout(500);
    note("inventory take sheet", await dialogInfo(page));
    await page.locator("[data-take-all]").click(); await page.waitForTimeout(200);
    note("inventory take sheet all", await dialogInfo(page));
    await shot(page, "take-sheet-held-mobile");
    await page.locator("[data-take-submit]").click(); await page.waitForTimeout(300);
    note("inventory take batch confirm", await dialogInfo(page));
    await page.locator(".v-confirm-actions .v-link").click(); await page.waitForTimeout(300);
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    // 탭: 배송, 받은 것(빈 상태)
    for (const i of [1, 2]) { await page.locator("main .v-chips .v-chip").nth(i).click(); await page.waitForTimeout(250); note("inventory tab " + i, { empty: await page.locator("main .v-empty").textContent().catch(() => null), toBoxes: await page.locator("main a.v-btn").count() }); }
    // 잔액 시트
    await page.locator("[data-balance-open]").click(); await page.waitForTimeout(400);
    note("balance sheet with held", await dialogInfo(page));
    await shot(page, "balance-sheet-mobile");
    await page.locator("[data-balance-take]").click(); await page.waitForTimeout(400);
    note("balance sheet -> take", await dialogInfo(page));
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    note("balance sheet after escape", await dialogInfo(page));
    await context.close();
  });
  await step("inventory shipping preset", async () => {
    const { context, page } = await open("mobile", "/ko/inventory/", { preset: "shipping" });
    await page.locator("main .v-chips .v-chip").nth(1).click(); await page.waitForTimeout(300);
    note("inventory shipping tab", await pageInfo(page));
    for (const i of [0, 1]) {
      await page.locator("main .v-itemrow").nth(i).click(); await page.waitForTimeout(400);
      note("inventory shipping item " + i, await dialogInfo(page));
      if (i === 0 && await page.locator(".v-sheet .v-btn").count()) { await page.locator(".v-sheet .v-btn").first().click(); await page.waitForTimeout(300); note("cancel shipment confirm", await dialogInfo(page)); await page.locator(".v-confirm-actions .v-link").click(); await page.waitForTimeout(300); }
      await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    }
    await context.close();
  });

  // 2.7 지갑, 충전 시트, 잔액 시트(보관 상품 없음), 출금 화면(제출하지 않는다)
  await step("wallet", async () => {
    const { context, page } = await open("mobile", "/ko/wallet/", { preset: "pending" });
    note("wallet pending", await pageInfo(page));
    await shot(page, "wallet-pending-mobile");
    const rows = page.locator("main .v-itemrow");
    for (let i = 0; i < Math.min(3, await rows.count()); i++) {
      await rows.nth(i).click(); await page.waitForTimeout(400);
      note("wallet tx sheet " + i, await dialogInfo(page));
      if (await page.locator(".v-sheet .v-btn").count()) { await page.locator(".v-sheet .v-btn").click(); await page.waitForTimeout(300); note("wallet cancel confirm", await dialogInfo(page)); await page.locator(".v-confirm-actions .v-link").click(); await page.waitForTimeout(300); }
      await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    }
    await page.locator("main .v-btn").first().click(); await page.waitForTimeout(2500);
    note("charge sheet", await dialogInfo(page));
    await shot(page, "charge-sheet-mobile");
    await page.locator(".v-sheet .v-chip").nth(1).click().catch(() => {}); await page.waitForTimeout(1500);
    note("charge sheet network 2", await dialogInfo(page));
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    await page.locator("[data-balance-open]").click(); await page.waitForTimeout(400);
    note("balance sheet no held", await dialogInfo(page));
    await context.close();
  });
  for (const preset of ["funded", "security"]) {
    await step("withdraw " + preset, async () => {
      const { context, page } = await open("mobile", "/ko/wallet/withdraw/", { preset });
      await page.waitForTimeout(800);
      note(`withdraw ${preset}`, await pageInfo(page));
      await shot(page, `withdraw-${preset}-mobile`);
      if (preset === "funded") {
        // 인증 앱 연결 시트를 열어 보기만 한다
        await page.locator("main .v-btn").first().click(); await page.waitForTimeout(1500);
        note("withdraw 2fa sheet", await dialogInfo(page));
        await shot(page, "twofactor-sheet-mobile");
        await page.keyboard.press("Escape"); await page.waitForTimeout(300);
        await page.locator("main .v-links .v-link").first().click(); await page.waitForTimeout(400);
        note("withdraw email path form", await pageInfo(page));
      }
      // 빈 채로 다음: 그 자리 한 줄만 본다(신청은 일어나지 않는다)
      if (await page.locator("form .v-btn[type=submit]").count()) { await page.locator("form .v-btn[type=submit]").click(); await page.waitForTimeout(300); note(`withdraw ${preset} empty submit`, { lines: await page.evaluate(() => [...document.querySelectorAll("main .v-line")].map((l) => l.textContent)), fields: await page.evaluate(() => [...document.querySelectorAll("main .v-field-label")].map((l) => l.textContent)), chips: await page.evaluate(() => [...document.querySelectorAll("main .v-chip")].map((l) => l.textContent)) }); await shot(page, `withdraw-${preset}-errors-mobile`); }
      await context.close();
    });
  }

  // 2.8 계정
  await step("account", async () => {
    const { context, page } = await open("mobile", "/ko/account/", { preset: "funded" });
    note("account funded", await pageInfo(page));
    await shot(page, "account-mobile");
    const buttons = page.locator("main button.v-row--button");
    for (let i = 0; i < await buttons.count(); i++) {
      await buttons.nth(i).click(); await page.waitForTimeout(700);
      note("account sheet " + i, await dialogInfo(page));
      await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    }
    await page.locator("main .v-links .v-link").click(); await page.waitForTimeout(300);
    note("logout confirm", await dialogInfo(page));
    await shot(page, "logout-confirm-mobile");
    note("logout confirm close", await closeWays(page, () => page.locator("main .v-links .v-link").click(), ["escape", "scrim"]));
    await context.close();
  });
  await step("account guest", async () => {
    const { context, page } = await open("mobile", "/ko/account/", {});
    note("account guest", await pageInfo(page));
    await context.close();
  });

  // 2.9 검증, 나온 상품, 후기
  await step("verify", async () => {
    const { context, page } = await open("desktop", "/ko/verify/", { preset: "inventory" });
    note("verify inventory", await pageInfo(page));
    await page.locator("main .v-itemrow").first().click(); await page.waitForTimeout(900);
    note("verify record sheet", await dialogInfo(page));
    await shot(page, "verify-record-sheet-desktop");
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    await page.locator("main .v-btn").last().click(); await page.waitForTimeout(400);
    note("verify manual empty", { lines: await page.evaluate(() => [...document.querySelectorAll("main .v-line")].map((l) => l.textContent)) });
    const fields = page.locator("#verify-manual ~ label input, section[aria-labelledby=verify-manual] input");
    await fields.nth(0).fill("a".repeat(64)); await fields.nth(2).fill("client"); await fields.nth(3).fill("1");
    await page.locator("main .v-btn").last().click(); await page.waitForTimeout(900);
    note("verify manual result", { rows: await page.evaluate(() => [...document.querySelectorAll("section[aria-labelledby=verify-manual] .v-row")].map((l) => l.textContent)), chips: await page.locator("section[aria-labelledby=verify-manual] .v-chip").count() });
    await context.close();
  });
  await step("wins", async () => {
    const { context, page } = await open("desktop", "/ko/wins/", { preset: "inventory" });
    note("wins inventory", await pageInfo(page));
    if (await page.locator("main .v-itemrow").count()) { await page.locator("main .v-itemrow").first().click(); await page.waitForTimeout(400); note("wins detail sheet", await dialogInfo(page)); await shot(page, "wins-detail-desktop"); await page.locator(".v-sheet .v-btn").click(); await page.waitForTimeout(900); note("wins -> verify sheet", await dialogInfo(page)); }
    await context.close();
    const g = await open("desktop", "/ko/wins/", {});
    note("wins guest", await pageInfo(g.page));
    await g.context.close();
  });
  await step("reviews", async () => {
    const { context, page } = await open("desktop", "/ko/reviews/?box=dollar-apple", {});
    note("reviews box", { chips: await page.evaluate(() => [...document.querySelectorAll(".v-chip")].map((c) => c.textContent + (c.getAttribute("aria-pressed") === "true" ? "*" : ""))), cards: await page.locator(".v-rvcard").count(), back: await page.locator(".v-back").getAttribute("href"), sum: await page.locator(".v-rvsum-num").textContent().catch(() => null), more: await page.locator(".v-rvcard-more").count() });
    await page.locator(".v-rvcard-btn").first().click(); await page.waitForTimeout(400);
    note("reviews detail sheet", await dialogInfo(page));
    await shot(page, "review-detail-desktop");
    await context.close();
  });

  // 2.10 상태 줄: 오프라인
  await step("offline", async () => {
    const { context, page } = await open("mobile", "/ko/guide/", {});
    await context.setOffline(true); await page.waitForTimeout(500);
    note("offline line", { text: await page.locator(".v-offline").textContent().catch(() => null), role: await page.locator(".v-offline").getAttribute("role").catch(() => null) });
    await shot(page, "offline-line-mobile");
    await context.setOffline(false); await page.waitForTimeout(500);
    note("online again", { count: await page.locator(".v-offline").count() });
    await context.close();
  });
  // 2.11 없는 주소 화면
  await step("not found shots", async () => {
    const a = await open("mobile", "/ko/no-such-page/", {}); await shot(a.page, "notfound-locale-mobile"); await a.context.close();
    const b = await open("mobile", "/no-such/", {}); await shot(b.page, "notfound-root-mobile"); await b.context.close();
    const c = await open("mobile", "/ko/about/", {}); await shot(c.page, "moved-about-mobile"); await c.context.close();
  });
}

await browser.close();
fs.writeFileSync(path.join(here, `probe-${mode}${only ? "-" + only.replace(/\s+/g, "-") : ""}.json`), JSON.stringify(log, null, 1));
console.log("done", log.length);
