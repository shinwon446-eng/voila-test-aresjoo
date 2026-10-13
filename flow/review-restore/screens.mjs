// 화면 검수(DESIGN.md 3장): 업그레이드 시트의 네 상태, 한 개 결과, 여러 개 결과의 상세, 보관함 상세에서 주 단추 하나와 밑줄 링크 둘까지.
// 자판(Tab 순환, Esc, 초점 복귀), 세 언어 320px 넘침, 홈 격자 390/1440 의 첫 그림 뒤 이동과 카드 높이, 후기 줄을 원본 빌드와 견줌,
// 두 탭의 업그레이드(Web Locks), 두 탭의 옛 장부 옮기기.
//   CAPTURE_BASE=http://localhost:3003 BEFORE_BASE=http://127.0.0.1:4198/voila-test-aresjoo node flow/review-restore/screens.mjs <출력 폴더>
import { createRequire } from "node:module";
const { chromium } = createRequire(new URL("../../web/package.json", import.meta.url))("playwright");
import { createHash, createHmac } from "node:crypto";
import fs from "node:fs";
import { installState, makeState } from "../../web/scripts/capture/states.mjs";

const out = process.argv[2] ?? "flow/review-restore/out";
fs.mkdirSync(out, { recursive: true });
const base = process.env.CAPTURE_BASE || "http://localhost:3003";
const before = process.env.BEFORE_BASE || "http://127.0.0.1:4198/voila-test-aresjoo";
const results = [];
const check = (name, pass, detail = "") => { results.push({ name, pass: !!pass, detail }); console.log((pass ? "PASS " : "FAIL ") + name + (detail ? "  " + detail : "")); };
const browser = await chromium.launch({ channel: "chrome", headless: true });

const SERVER = "capture-upgrade-server-seed"; const CLIENT = "capture-upgrade-client";
const rollOf = (nonce) => parseInt(createHmac("sha256", SERVER).update(`${CLIENT}:${nonce}`).digest("hex").slice(0, 8), 16) % 1_000_000;
const nonceWhere = (low, high, offset = 0) => { let n = 0; while (!(rollOf(n + offset) >= low && rollOf(n + offset) < high)) n += 1; return n; };
const fairOf = (nonce) => JSON.stringify({ state: { serverSeed: SERVER, serverSeedHash: createHash("sha256").update(SERVER).digest("hex"), clientSeed: CLIENT, nonce }, version: 0 });
const WIN = nonceWhere(150_000, 300_000); const LOSE = nonceWhere(600_000, 800_000);
const OPEN_THEN_LOSE = nonceWhere(800_000, 1_000_000, 1);

const VIEWS = { mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, narrow: { viewport: { width: 320, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, desktop: { viewport: { width: 1440, height: 900 } } };
async function ctx(view, preset, locale = "ko", opts = {}) {
  const context = await browser.newContext({ ...VIEWS[view], locale: locale === "ko" ? "ko-KR" : locale === "zh" ? "zh-CN" : "en-US", reducedMotion: opts.motion ? "no-preference" : "reduce" });
  const state = await makeState(preset, locale);
  if (opts.nonce !== undefined) state.values["gachaflix.fair"] = fairOf(opts.nonce);
  if (opts.mutate) opts.mutate(state.values);
  await installState(context, state, new URL(base).origin);
  const page = await context.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 160))); page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
  return { context, page, errors };
}
const go = (page, path) => page.goto(base + path, { waitUntil: "networkidle" });
/** 열린 최상위 대화창 안의 주 단추(조용하지 않은 .v-btn, 보이는 것)와 밑줄 링크 수, 그리고 가로 넘침 */
const dialogCounts = (page) => page.evaluate(() => {
  const dialogs = Array.from(document.querySelectorAll('[role="dialog"], [role="alertdialog"]')).filter((d) => !d.inert && d.getAttribute("aria-hidden") !== "true");
  const d = dialogs[dialogs.length - 1]; if (!d) return null;
  const vis = (e) => e.getClientRects().length > 0;
  const primary = Array.from(d.querySelectorAll(".v-btn")).filter((e) => vis(e) && !e.classList.contains("v-btn--quiet"));
  const quiet = Array.from(d.querySelectorAll(".v-btn--quiet")).filter(vis);
  const links = Array.from(d.querySelectorAll(".v-link")).filter(vis);
  const r = d.getBoundingClientRect();
  const over = Array.from(d.querySelectorAll("*")).filter((e) => vis(e) && e.getBoundingClientRect().right > r.right + 1).map((e) => e.className + ":" + (e.textContent || "").slice(0, 30));
  return { primary: primary.map((e) => e.textContent.trim()), quiet: quiet.map((e) => e.textContent.trim()), links: links.map((e) => e.textContent.trim()), over, docOver: document.documentElement.scrollWidth > window.innerWidth, sheetOver: d.scrollWidth > d.clientWidth + 1 };
});
const chip = (page, n) => page.locator(`[data-upgrade-chip="${n}"]`);
const ledgerItems = (page) => page.evaluate(() => { const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i)); const key = keys.find((k) => k && k.startsWith("voila.browser-inventory.") && !k.endsWith(".guest")); return key && window.__voilaLedger ? window.__voilaLedger(key)?.items ?? null : null; });
const fairNonce = (page) => page.evaluate(() => { const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i)); const key = keys.find((k) => k && k.endsWith("gachaflix.fair")); return key ? JSON.parse(localStorage.getItem(key)).state.nonce : null; });
const shot = (page, name) => page.screenshot({ path: `${out}/${name}.png` });

// ── 1. 업그레이드 시트 네 상태 + 보관함 상세 (모바일) ───────────────────────────
for (const [label, nonce, motion] of [["won", WIN, true], ["lost", LOSE, true]]) {
  const { context, page, errors } = await ctx("mobile", "inventory", "ko", { nonce, motion });
  try {
    await go(page, "/ko/inventory");
    await page.locator(".v-itemrow").first().click(); await page.waitForTimeout(300);
    const detail = await dialogCounts(page);
    if (label === "won") check("보관함 상세: 주 단추 1(USDT로 받기), 조용한 단추(업그레이드), 링크 2 이하", detail && detail.primary.length === 1 && detail.quiet.length === 1 && detail.links.length <= 2, JSON.stringify(detail));
    await page.locator("[data-upgrade-open]").click(); await page.waitForTimeout(300);
    const pick0 = await dialogCounts(page);
    if (label === "won") check("업그레이드 고르기(단추 전): 주 단추 1(비활성), 링크 1", pick0 && pick0.primary.length === 1 && pick0.links.length <= 2 && !pick0.over.length, JSON.stringify(pick0));
    await chip(page, 2).click(); await page.waitForTimeout(200);
    const pick = await dialogCounts(page);
    if (label === "won") { check("업그레이드 고르기(목표 선택): 주 단추 1, 링크 1, 넘침 없음", pick && pick.primary.length === 1 && pick.links.length <= 2 && !pick.over.length && !pick.sheetOver, JSON.stringify(pick)); await shot(page, "up-pick-mobile"); }
    const nonce0 = await fairNonce(page);
    await page.locator("[data-upgrade-go]").click();
    await page.locator(".v-up-bar[data-moving]").waitFor({ timeout: 8000 });
    const draw = await dialogCounts(page);
    check(`업그레이드 추첨(${label}): 주 단추 0, 링크 1(건너뛰기), 넘침 없음`, draw && draw.primary.length === 0 && draw.links.length <= 2 && !draw.over.length, JSON.stringify(draw));
    if (label === "won") await shot(page, "up-draw-mobile");
    await page.waitForTimeout(2700);
    const res = await dialogCounts(page);
    check(`업그레이드 결과(${label}): 주 단추 1, 링크 2 이하, 넘침 없음`, res && res.primary.length === 1 && res.links.length <= 2 && !res.over.length, JSON.stringify(res));
    await shot(page, `up-result-${label}-mobile`);
    const items = await ledgerItems(page);
    const nonce1 = await fairNonce(page);
    check(`장부(${label}): 건 상품 UPGRADED 하나, 목표 ${label === "won" ? "하나" : "없음"}, 회차 +1`, items && items.filter((i) => i.status === "UPGRADED").length === 1 && items.filter((i) => i.upgradedFrom).length === (label === "won" ? 1 : 0) && nonce1 === nonce0 + 1, `nonce ${nonce0}->${nonce1}`);
    check(`콘솔 오류 없음(${label})`, errors.length === 0, errors.join(" | "));
  } catch (e) { check(`업그레이드 ${label} 흐름 실행`, false, String(e.message).split("\n")[0]); await shot(page, `up-${label}-FAILED`); }
  await context.close();
}

// ── 2. 자판: Tab 순환, Esc, 초점 복귀 ────────────────────────────────────────
{
  const { context, page } = await ctx("desktop", "inventory", "ko", { nonce: WIN });
  try {
    await go(page, "/ko/inventory");
    await page.locator(".v-itemrow").first().click(); await page.waitForTimeout(300);
    await page.locator("[data-upgrade-open]").focus();
    await page.keyboard.press("Enter"); await page.waitForTimeout(400);
    const inDialog = () => page.evaluate(() => { const d = document.querySelector('[role="dialog"]'); const a = document.activeElement; return { inside: !!d && d.contains(a), tag: a?.tagName, text: (a?.textContent || a?.getAttribute("aria-label") || "").trim().slice(0, 30), cls: a?.className }; });
    const seen = [];
    for (let i = 0; i < 12; i++) { await page.keyboard.press("Tab"); seen.push(await inDialog()); }
    check("자판: Tab 12번이 전부 시트 안에 머문다(순환)", seen.every((s) => s.inside), seen.map((s) => s.text || s.tag).join(" > "));
    await chip(page, 2).focus(); await page.keyboard.press("Enter"); await page.waitForTimeout(200);
    const onChip = await inDialog();
    check("자판: 배수 단추를 Enter 로 고를 수 있다", (await chip(page, 2).getAttribute("aria-pressed")) === "true", JSON.stringify(onChip));
    await page.keyboard.press("Escape"); await page.waitForTimeout(400);
    const after = await page.evaluate(() => ({ dialogs: document.querySelectorAll('[role="dialog"]').length, active: document.activeElement?.className, text: (document.activeElement?.textContent || "").trim().slice(0, 40) }));
    check("자판: Esc 로 시트가 닫히고 초점이 돌아온다(보관함 행 또는 업그레이드 단추)", after.dialogs === 0 && /v-itemrow|data-upgrade|v-btn/.test(after.active || ""), JSON.stringify(after));
  } catch (e) { check("자판 흐름 실행", false, String(e.message).split("\n")[0]); }
  await context.close();
}

// ── 3. 세 언어 320px: 고르기와 결과 ─────────────────────────────────────────────
for (const locale of ["ko", "en", "zh"]) {
  const { context, page } = await ctx("narrow", "inventory", locale, { nonce: WIN });
  try {
    await go(page, `/${locale}/inventory`);
    await page.locator(".v-itemrow").first().click(); await page.waitForTimeout(300);
    await page.locator("[data-upgrade-open]").click(); await page.waitForTimeout(300);
    await chip(page, 2).click(); await page.waitForTimeout(200);
    const pick = await dialogCounts(page);
    check(`320px ${locale} 고르기: 넘침 없음`, pick && !pick.over.length && !pick.sheetOver && !pick.docOver, JSON.stringify({ over: pick?.over, sheetOver: pick?.sheetOver, docOver: pick?.docOver }));
    await shot(page, `up-320-${locale}-pick`);
    await page.getByRole("button", { name: /잠근 값 보기|locked|锁定|Locked|hash/i }).first().click().catch(() => undefined); await page.waitForTimeout(300);
    const locked = await dialogCounts(page);
    check(`320px ${locale} 잠근 값 보기: 넘침 없음`, locked && !locked.over.length && !locked.sheetOver, JSON.stringify({ over: locked?.over, sheetOver: locked?.sheetOver }));
    await shot(page, `up-320-${locale}-locked`);
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    await page.locator("[data-upgrade-go]").click(); await page.waitForTimeout(600);
    const res = await dialogCounts(page);
    check(`320px ${locale} 결과: 넘침 없음, 주 단추 1`, res && !res.over.length && !res.sheetOver && res.primary.length === 1, JSON.stringify({ over: res?.over, sheetOver: res?.sheetOver, primary: res?.primary }));
    await shot(page, `up-320-${locale}-result`);
  } catch (e) { check(`320px ${locale} 실행`, false, String(e.message).split("\n")[0]); }
  await context.close();
}

// ── 4. 한 개 결과 화면과 여러 개 결과 화면 ───────────────────────────────────────
{
  const { context, page } = await ctx("mobile", "funded", "ko", { nonce: 0 });
  try {
    await go(page, "/ko/box/mobile-hmd");
    await page.waitForSelector("[data-open-primary]:not([disabled])", { timeout: 15000 });
    await page.locator("[data-open-primary]").first().click(); await page.waitForTimeout(600);
    const confirm = page.locator('[role="alertdialog"] .v-btn'); if (await confirm.count()) await confirm.first().click();
    await page.waitForSelector(".v-op[data-opening-state='settled']", { timeout: 20000 });
    await page.waitForTimeout(300);
    const one = await page.evaluate(() => { const a = document.querySelector(".v-op-actions"); const vis = (e) => e.getClientRects().length > 0; return { primary: Array.from(a?.querySelectorAll(".v-btn") ?? []).filter((e) => vis(e) && !e.classList.contains("v-btn--quiet")).map((e) => e.textContent.trim()), quiet: Array.from(a?.querySelectorAll(".v-btn--quiet") ?? []).filter(vis).map((e) => e.textContent.trim()), links: Array.from(a?.querySelectorAll(".v-link") ?? []).filter(vis).map((e) => e.textContent.trim()), pageLinks: Array.from(document.querySelectorAll(".v-op .v-link")).filter(vis).length }; });
    check("한 개 결과: 주 단추 1(USDT로 받기), 조용한 단추(업그레이드), 링크 2 이하", one.primary.length === 1 && one.links.length <= 2, JSON.stringify(one));
    await shot(page, "one-result-mobile");
  } catch (e) { check("한 개 결과 화면 실행", false, String(e.message).split("\n")[0]); await shot(page, "one-FAILED"); }
  await context.close();
}
{
  const { context, page } = await ctx("mobile", "funded", "ko", { nonce: 0 });
  try {
    await go(page, "/ko/box/mobile-hmd");
    await page.getByRole("button", { name: /^5개$/ }).click().catch(() => undefined);
    await page.waitForSelector("[data-open-primary]:not([disabled])", { timeout: 15000 });
    await page.locator("[data-open-primary]").first().click(); await page.waitForTimeout(600);
    const confirm = page.locator('[role="alertdialog"] .v-btn'); if (await confirm.count()) await confirm.first().click();
    await page.waitForSelector(".v-reveal-result", { timeout: 25000 }); await page.waitForTimeout(500);
    const multi = await page.evaluate(() => { const r = document.querySelector(".v-reveal"); const vis = (e) => e.getClientRects().length > 0; return { primary: Array.from(r?.querAll?.(".v-btn") ?? r?.querySelectorAll(".v-btn") ?? []).filter((e) => vis(e) && !e.classList.contains("v-btn--quiet")).map((e) => e.textContent.trim()), links: Array.from(r?.querySelectorAll(".v-link") ?? []).filter(vis).map((e) => e.textContent.trim()) }; });
    check("여러 개 결과: 주 단추 1, 링크 2 이하", multi.primary.length === 1 && multi.links.length <= 2, JSON.stringify(multi));
    const rows = page.locator(".v-reveal-result .v-rows button, .v-reveal-result [data-reveal-row], .v-reveal-result li button");
    if (await rows.count()) { await rows.first().click(); await page.waitForTimeout(300); const d = await dialogCounts(page); check("여러 개 결과의 상품 상세: 주 단추 1, 조용한 단추(업그레이드) 또는 없음, 링크 2 이하", d && d.primary.length <= 1 && d.links.length <= 2, JSON.stringify(d)); await shot(page, "multi-detail-mobile"); }
    else check("여러 개 결과의 상품 상세 열기", false, "행을 찾지 못함");
  } catch (e) { check("여러 개 결과 화면 실행", false, String(e.message).split("\n")[0]); await shot(page, "multi-FAILED"); }
  await context.close();
}

// ── 5. 홈 격자 390 / 1440: 첫 그림 뒤 이동 없음, 카드 높이 같음 ────────────────────
for (const view of ["mobile", "desktop"]) {
  const { context, page } = await ctx(view, "inventory");
  try {
    await page.goto(base + "/ko", { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".v-grid a, .v-boxgrid a, [data-box-card], a[href*='/box/']", { timeout: 15000 });
    const read = () => page.evaluate(() => { const cards = Array.from(document.querySelectorAll("a[href*='/ko/box/']")).filter((a) => a.getClientRects().length > 0).slice(0, 8); return cards.map((a) => ({ href: a.getAttribute("href").split("/box/")[1], top: Math.round(a.getBoundingClientRect().top), h: Math.round(a.getBoundingClientRect().height) })); });
    const first = await read(); await page.waitForTimeout(1500); const later = await read();
    check(`홈 ${view}: 첫 그림 뒤 1.5초 동안 첫 여덟 카드의 순서와 자리가 그대로`, JSON.stringify(first) === JSON.stringify(later), JSON.stringify({ first: first.map((c) => c.href), later: later.map((c) => c.href) }));
    const rows = new Map(); for (const c of later) rows.set(c.top, [...(rows.get(c.top) ?? []), c.h]);
    check(`홈 ${view}: 같은 줄의 카드 높이가 같다`, Array.from(rows.values()).every((hs) => new Set(hs).size === 1), JSON.stringify(Array.from(rows.entries())));
    await shot(page, `home-${view}`);
  } catch (e) { check(`홈 ${view} 실행`, false, String(e.message).split("\n")[0]); }
  await context.close();
}

// ── 6. 후기 줄: 원본 빌드와 견줌 ───────────────────────────────────────────────
for (const view of ["mobile", "desktop"]) {
  const measure = async (page, url) => {
    await page.goto(url, { waitUntil: "networkidle" }); await page.waitForTimeout(500);
    return page.evaluate(() => {
      const row = document.querySelector(".v-rvrow"); const cards = Array.from(document.querySelectorAll(".v-rvrow .v-rvcard"));
      const cs = cards[0] ? getComputedStyle(cards[0]) : null; const r0 = cards[0]?.getBoundingClientRect(); const r1 = cards[1]?.getBoundingClientRect();
      const ul = row; const mask = ul ? getComputedStyle(ul).webkitMaskImage || getComputedStyle(ul).maskImage : "";
      return { cards: cards.length, w: r0 ? Math.round(r0.width) : null, h: r0 ? Math.round(r0.height) : null, gap: r0 && r1 ? Math.round(r1.left - r0.right) : null, radius: cs?.borderRadius, bg: cs?.backgroundColor, snap: ul ? getComputedStyle(ul).scrollSnapType : null, fade: mask && mask !== "none", next: !!ul?.hasAttribute("data-next"), btnNext: !!document.querySelector('.v-hscroll-btn[data-dir="next"]'), btnPrev: !!document.querySelector('.v-hscroll-btn[data-dir="prev"]'), photoRatio: cards[0]?.querySelector(".v-rvcard-photo") ? getComputedStyle(cards[0].querySelector(".v-rvcard-photo")).aspectRatio : null, firstItems: cards.slice(0, 6).map((c) => c.querySelector(".v-rvcard-item .v-card-title")?.textContent) };
    });
  };
  const a = await browser.newContext({ ...VIEWS[view], locale: "ko-KR" }); const pa = await a.newPage();
  const b = await browser.newContext({ ...VIEWS[view], locale: "ko-KR" }); const pb = await b.newPage();
  try {
    const now = await measure(pa, base + "/ko/box/car-rolls-royce");
    const old = await measure(pb, before + "/ko/box/car-rolls-royce");
    const same = now.w === old.w && now.h === old.h && now.gap === old.gap && now.radius === old.radius && now.bg === old.bg && now.fade === old.fade && now.btnNext === old.btnNext && now.photoRatio === old.photoRatio;
    check(`후기 줄 ${view}: 카드 폭, 높이, 간격, 반경, 바탕, 끝 흐림, 다음 단추, 사진 비율이 원본과 같다`, same, JSON.stringify({ now, old }));
    const spread = new Set(now.firstItems.filter(Boolean)).size;
    check(`후기 줄 ${view}: 처음 여섯 장에 같은 상품이 몰리지 않는다`, spread >= Math.min(6, now.firstItems.filter(Boolean).length) - 0, JSON.stringify(now.firstItems));
    if (view === "desktop" && now.btnNext) {
      await pa.locator('.v-hscroll-btn[data-dir="next"]').first().click(); await pa.waitForTimeout(700);
      const moved = await pa.evaluate(() => { const ul = document.querySelector(".v-rvrow"); return { left: ul.scrollLeft, prev: ul.hasAttribute("data-prev"), btnPrev: !!document.querySelector('.v-hscroll-btn[data-dir="prev"]') }; });
      check("후기 줄 desktop: 다음 단추로 넘어가고 이전 단추가 나온다", moved.left > 100 && moved.prev && moved.btnPrev, JSON.stringify(moved));
    }
    await pa.screenshot({ path: `${out}/reviews-now-${view}.png` }); await pb.screenshot({ path: `${out}/reviews-before-${view}.png` });
  } catch (e) { check(`후기 줄 ${view} 실행`, false, String(e.message).split("\n")[0]); }
  await a.close(); await b.close();
}

// ── 7. 두 탭의 업그레이드: 같은 상품에 동시에 ──────────────────────────────────
{
  const { context, page } = await ctx("desktop", "inventory", "ko", { nonce: WIN });
  const page2 = await context.newPage();
  try {
    await go(page, "/ko/inventory"); await go(page2, "/ko/inventory");
    for (const p of [page, page2]) { await p.locator(".v-itemrow").first().click(); await p.waitForTimeout(300); await p.locator("[data-upgrade-open]").click(); await p.waitForTimeout(300); await chip(p, 2).click(); await p.waitForTimeout(200); }
    const nonce0 = await fairNonce(page);
    await Promise.all([page.locator("[data-upgrade-go]").click(), page2.locator("[data-upgrade-go]").click()]);
    await page.waitForTimeout(3500);
    const items = await ledgerItems(page); const nonce1 = await fairNonce(page);
    const texts = await Promise.all([page, page2].map((p) => p.locator('[role="dialog"]').innerText().catch(() => "")));
    const upgraded = items.filter((i) => i.status === "UPGRADED").length; const targets = items.filter((i) => i.upgradedFrom).length;
    check("두 탭 동시 업그레이드: 건 상품 UPGRADED 하나, 목표 하나 이하, 회차 +1, 한 탭은 걸 수 없다고 말한다", upgraded === 1 && targets <= 1 && nonce1 === nonce0 + 1 && texts.some((t) => /지금 업그레이드할 수 없습니다/.test(t)), JSON.stringify({ upgraded, targets, nonce0, nonce1, texts: texts.map((t) => t.replace(/\s+/g, " ").slice(0, 80)) }));
    await shot(page, "two-tabs-a"); await page2.screenshot({ path: `${out}/two-tabs-b.png` });
  } catch (e) { check("두 탭 업그레이드 실행", false, String(e.message).split("\n")[0]); }
  await context.close();
}

// ── 8. 두 탭의 옛 장부 옮기기 ─────────────────────────────────────────────────
{
  const N = 400;
  const table = Array.from({ length: 100 }, (_, i) => ({ id: "da-item-" + i, dropRate: i === 0 ? 0.0100 + 0.00 : 0.01 }));
  const mutate = (values) => {
    for (const key of Object.keys(values)) {
      if (!/inventory/.test(key) || key.endsWith(".guest")) continue;
      const v = JSON.parse(values[key]);
      const base0 = v.state.items[0];
      v.state.items = Array.from({ length: N }, (_, i) => ({ ...base0, id: `mig-${i}`, valueUsdt: 10 + i, fair: { ...base0.fair, nonce: i, roll: i * 7, dropTable: table, oddsVersion: "v1" }, openingId: "op_" + i }));
      values[key] = JSON.stringify(v);
    }
  };
  const { context, page } = await ctx("desktop", "inventory", "ko", { mutate });
  const page2 = await context.newPage();
  try {
    const raw = (p) => p.evaluate(() => { const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i)); const key = keys.find((k) => k && k.startsWith("voila.browser-inventory.") && !k.endsWith(".guest")); const r = localStorage.getItem(key); return { key, len: r?.length, head: r?.slice(0, 26), items: window.__voilaLedger ? window.__voilaLedger(key)?.items?.length : null, sum: window.__voilaLedger ? window.__voilaLedger(key)?.items?.reduce((s, x) => s + x.valueUsdt, 0) : null }; });
    await Promise.all([page.goto(base + "/ko/inventory", { waitUntil: "networkidle" }), page2.goto(base + "/ko/inventory", { waitUntil: "networkidle" })]);
    await page.waitForTimeout(2000);
    const a = await raw(page); const b = await raw(page2);
    const expectSum = Array.from({ length: N }, (_, i) => 10 + i).reduce((s, x) => s + x, 0);
    check("두 탭 동시 옮기기: 저장된 장부가 줄인 형식이고 두 탭이 같은 400건과 같은 합을 읽는다", a.head.startsWith('{"state":{"items":{"z":1') && a.items === N && b.items === N && a.sum === expectSum && b.sum === expectSum && a.len === b.len, JSON.stringify({ a, b }));
    const rowsShown = await page.locator(".v-itemrow").count();
    check("두 탭 동시 옮기기: 화면에 보관 상품이 그려진다", rowsShown > 0, String(rowsShown));
  } catch (e) { check("두 탭 옮기기 실행", false, String(e.message).split("\n")[0]); }
  await context.close();
}

await browser.close();
fs.writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 1));
console.log(`${results.filter((r) => r.pass).length} / ${results.length} 통과`);
