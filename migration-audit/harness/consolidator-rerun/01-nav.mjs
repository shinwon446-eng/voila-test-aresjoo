// 머리줄과 메뉴, 언어와 통화, 박스 목록(검색, 지우기, 분류, 더 보기), 옮긴 주소, 없는 주소, 뒤로와 앞으로, 새로 고침, 오프라인과 세션 끝남.
import { recorder, session, txt, sheetText, scrims, bodyLocked, activeDesc, sleep, BASE } from "./lib.mjs";
const { check, run, save } = recorder("01-nav");
const pathOf = (page) => new URL(page.url()).pathname.replace("/voila-test-aresjoo", "");

// n1: 머리줄과 메뉴 시트(모바일), 머리줄의 링크(PC)
await run("n1", async () => {
  const s = await session({ preset: "guest", view: "mobile" });
  const page = await s.open("/ko/");
  const menu = page.locator(".v-menu-btn");
  check("n1", "메뉴 단추: aria-haspopup=dialog, aria-expanded=false", (await menu.getAttribute("aria-haspopup")) === "dialog" && (await menu.getAttribute("aria-expanded")) === "false");
  await menu.click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  const links = await page.locator(".v-sheet nav a").evaluateAll((els) => els.map((a) => a.innerText.replace(/\s+/g, " ").trim() + "→" + a.getAttribute("href").replace("/voila-test-aresjoo", "")));
  check("n1", "메뉴 시트의 행 일곱과 주소", links.length === 7, links);
  check("n1", "열리면 aria-expanded=true, 본문 스크롤이 잠기고, 포커스가 시트로 간다", (await menu.getAttribute("aria-expanded")) === "true" && (await bodyLocked(page)) === "hidden" && (await page.evaluate(() => document.activeElement?.getAttribute("role"))) === "dialog", { overflow: await bodyLocked(page), active: await activeDesc(page) });
  await s.shot(page, "01-n1-menu-sheet");
  // Tab 순서: 닫기 → 일곱 행 → 다시 닫기(시트 밖으로 나가지 않는다)
  const order = [];
  for (let i = 0; i < 9; i++) { await page.keyboard.press("Tab"); order.push(await activeDesc(page)); }
  check("n1", "Tab 은 시트 안에서 돈다(닫기, 행 일곱, 다시 닫기)", order[0].includes("닫기") && order[8].includes("닫기") && order.slice(1, 8).every((o) => o.startsWith("A")), order);
  await page.keyboard.press("Shift+Tab");
  check("n1", "Shift+Tab 은 처음에서 끝으로 간다", (await activeDesc(page)).includes("계정"), await activeDesc(page));
  await page.keyboard.press("Escape"); await sleep(250);
  check("n1", "Esc 로 닫힌다, 스크롤 잠금이 풀리고 포커스가 메뉴 단추로 돌아온다", (await scrims(page)) === 0 && (await bodyLocked(page)) === "" && (await page.evaluate(() => document.activeElement?.classList.contains("v-menu-btn"))), { overflow: await bodyLocked(page), active: await activeDesc(page) });
  await menu.click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  await page.mouse.click(8, 8); await sleep(250);
  check("n1", "시트 바깥(어두운 자리)을 누르면 닫힌다", (await scrims(page)) === 0);
  await menu.click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  await page.locator(".v-sheet-close").click(); await sleep(250);
  check("n1", "X 단추로 닫힌다", (await scrims(page)) === 0);
  await menu.click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  await page.locator(".v-sheet nav a").nth(5).click(); await page.waitForURL(/\/guide\//); await sleep(300);
  check("n1", "행을 누르면 그 화면으로 가고 시트가 닫힌다(이용 방법)", pathOf(page) === "/ko/guide/" && (await scrims(page)) === 0, pathOf(page));
  // 로그인 단추
  await page.locator(".v-header .v-headbtn").first().click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  check("n1", "머리줄의 로그인 단추는 로그인 시트를 연다", (await sheetText(page)).startsWith("로그인"), (await sheetText(page)).slice(0, 160));
  await s.shot(page, "01-n1-login-sheet");
  await page.keyboard.press("Escape"); await sleep(250);
  // 로고
  await page.locator(".v-header a.v-logo").click(); await page.waitForURL(/\/ko\/$/);
  check("n1", "로고는 박스 목록으로 간다", pathOf(page) === "/ko/");
  check("n1", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();

  const d = await session({ preset: "funded", view: "desktop" });
  const p = await d.open("/ko/");
  const nav = await p.locator(".v-header .v-nav a").evaluateAll((els) => els.map((a) => a.innerText.trim() + "→" + a.getAttribute("href").replace("/voila-test-aresjoo", "") + (a.getAttribute("aria-current") ? "*" : "")));
  check("n1", "PC 머리줄의 링크 일곱, 지금 화면에 aria-current", nav.length === 7 && nav[0].endsWith("*"), nav);
  for (const [i, to] of [[1, "/ko/inventory/"], [2, "/ko/wallet/"], [3, "/ko/wins/"], [4, "/ko/verify/"], [5, "/ko/guide/"], [6, "/ko/account/"], [0, "/ko/"]]) {
    await p.locator(".v-header .v-nav a").nth(i).click(); await p.waitForURL((u) => new URL(u).pathname.endsWith(to)); await sleep(200);
    const cur = await p.locator(".v-header .v-nav a[aria-current='page']").count();
    check("n1", `PC 링크 ${i}: ${to}`, pathOf(p) === to, { path: pathOf(p), current: cur });
  }
  check("n1", "aria-current 는 주소 끝의 빗금 때문에 박스 말고는 붙지 않는지(본 것)", "info", await p.evaluate(async () => { return [...document.querySelectorAll(".v-header .v-nav a")].map((a) => a.getAttribute("aria-current")); }));
  // 잔액 단추
  const bal = p.locator("[data-balance-open]");
  check("n1", "로그인하면 머리줄에 잔액 단추(로그인 단추 대신)", (await txt(bal)) === "잔액 $10,000" && (await bal.getAttribute("aria-haspopup")) === "dialog", await txt(bal));
  await bal.click(); await p.waitForSelector(".v-sheet"); await sleep(250);
  check("n1", "잔액 단추는 지갑으로 가지 않고 잔액 시트를 연다", pathOf(p) === "/ko/" && (await sheetText(p)).startsWith("잔액"), (await sheetText(p)).slice(0, 200));
  await d.shot(p, "01-n1-balance-sheet-desktop");
  await p.keyboard.press("Escape");
  await d.context.close();
});

// n2: 박스 목록. 검색, 지우기, 분류, 더 보기, 카드
await run("n2", async () => {
  const s = await session({ preset: "guest", view: "mobile" });
  const page = await s.open("/ko/");
  const cards = () => page.locator(".v-boxgrid .v-boxcard").count();
  const more = page.locator("main .v-btn--quiet");
  check("n2", "처음에는 카드 24장과 더 보기 단추(남은 수)", (await cards()) === 24 && /박스 더 보기 \(\d+개 남음\)/.test(await txt(more)), await txt(more));
  const left0 = Number((await txt(more)).match(/(\d+)개 남음/)[1]);
  await more.click(); await sleep(200);
  const left1 = Number((await txt(more)).match(/(\d+)개 남음/)?.[1] ?? 0);
  check("n2", "더 보기를 누르면 24장이 늘고 남은 수가 24 준다", (await cards()) === 48 && left1 === left0 - 24, { cards: await cards(), left0, left1 });
  // 분류
  const chips = page.locator(".v-chips .v-chip");
  await chips.nth(2).click(); await sleep(200);
  const hrefs = await page.locator(".v-boxgrid .v-boxcard").evaluateAll((els) => els.map((a) => a.getAttribute("href").split("/box/")[1]));
  check("n2", "분류(시계)를 누르면 그 분류의 박스만 남고 보여 주는 수가 처음으로 돌아간다", (await chips.nth(2).getAttribute("aria-pressed")) === "true" && (await chips.nth(0).getAttribute("aria-pressed")) === "false" && hrefs.length <= 24 && hrefs.every((h) => h.startsWith("watch-")), hrefs.slice(0, 6));
  await s.shot(page, "01-n2-category");
  await chips.nth(0).click(); await sleep(200);
  check("n2", "전체 박스로 돌아오면 다시 24장", (await cards()) === 24);
  // 검색
  const input = page.locator(".v-search input");
  await input.fill("롤렉스"); await sleep(300);
  const hits = await page.locator(".v-itemrows .v-itemrow").count();
  check("n2", "검색어를 넣으면 배너와 분류, 카드가 사라지고 상품 행이 나온다(30행까지)", hits > 0 && hits <= 30 && (await page.locator(".v-hero").count()) === 0 && (await page.locator(".v-chips").count()) === 0 && (await cards()) === 0, { hits });
  await s.shot(page, "01-n2-search");
  const firstHit = await page.locator(".v-itemrows .v-itemrow").first().getAttribute("href");
  await input.fill("없는상품zzzz"); await sleep(300);
  check("n2", "없는 이름이면 빈 상태 한 줄", (await txt(page.locator(".v-empty"))) === "그 이름의 상품이 없습니다.");
  await s.shot(page, "01-n2-search-none");
  await input.fill("   "); await sleep(200);
  check("n2", "공백만 넣으면 검색이 아니다(카드가 그대로)", (await cards()) === 24);
  await input.fill(""); await sleep(200);
  check("n2", "지우면 배너, 분류, 카드가 돌아온다", (await cards()) === 24 && (await page.locator(".v-hero").count()) === 1 && (await page.locator(".v-chips").count()) === 1);
  await input.fill("rolex"); await sleep(300);
  check("n2", "영어 이름으로도 찾는다(세 언어의 이름을 본다)", (await page.locator(".v-itemrows .v-itemrow").count()) > 0);
  await input.press("Enter"); await sleep(200);
  check("n2", "검색 칸의 Enter 는 아무 일도 하지 않는다(폼이 아니다)", pathOf(page) === "/ko/" && (await page.locator(".v-itemrows .v-itemrow").count()) > 0);
  await page.locator(".v-itemrows .v-itemrow").first().click(); await page.waitForURL(/\/box\//);
  check("n2", "상품 행은 그 상품이 든 박스로 간다", /^\/ko\/box\/[a-z0-9-]+\/$/.test(pathOf(page)), { path: pathOf(page), firstHit });
  await page.goBack({ waitUntil: "networkidle" }); await sleep(300);
  check("n2", "뒤로 오면 검색어와 분류는 처음 상태다(주소에도 저장소에도 남기지 않는다)", (await page.locator(".v-search input").inputValue()) === "" && (await cards()) === 24, await page.locator(".v-search input").inputValue());
  // 카드
  const href = await page.locator(".v-boxgrid .v-boxcard").first().getAttribute("href");
  await page.locator(".v-boxgrid .v-boxcard").first().click(); await page.waitForURL(/\/box\//);
  check("n2", "카드는 박스 화면으로 간다", page.url().endsWith(href), pathOf(page));
  await page.goBack({ waitUntil: "networkidle" }); await page.goForward({ waitUntil: "networkidle" });
  check("n2", "뒤로, 앞으로: 같은 박스 화면", page.url().endsWith(href));
  // 배너
  await page.goto(BASE + "/ko/", { waitUntil: "networkidle" });
  const cta = page.locator(".v-hero-cta .v-btn");
  check("n2", "비로그인 배너의 단추는 가입 시트를 연다", (await txt(cta)) === "가입하고 무료 언박싱");
  await cta.click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  check("n2", "가입 시트가 열린다", (await sheetText(page)).startsWith("가입"), (await sheetText(page)).slice(0, 80));
  await page.keyboard.press("Escape");
  check("n2", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();

  const f = await session({ preset: "funded", view: "mobile" });
  const p = await f.open("/ko/");
  await p.waitForSelector(".v-hero-cta a.v-btn");
  check("n2", "로그인한 배너: 무료 횟수가 남았으면 무료 언박싱 링크(리자몽 박스)", (await txt(p.locator(".v-hero-cta .v-btn"))) === "무료 언박싱" && (await p.locator(".v-hero-cta a").getAttribute("href")).endsWith("/ko/box/pokemon-charizard/"), await txt(p.locator(".v-hero")));
  await f.context.close();
});

// n3: 언어와 통화, 이동과 새로 고침
await run("n3", async () => {
  const s = await session({ preset: "funded", view: "mobile" });
  const page = await s.open("/ko/box/dollar-apple/");
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  const cur = () => page.evaluate(() => JSON.parse(localStorage.getItem("gachaflix.currency") || "null")?.state?.currency ?? null);
  check("n3", "심은 통화 USDT 는 달러로 옮겨진다(저장값도 USD)", (await cur()) === "USD" && (await txt(page.locator("[data-open-primary]"))) === "$1 언박싱", { stored: await cur() });
  const toggle = page.locator(".v-footer-cols button");
  check("n3", "꼬리말의 통화 단추 글", (await txt(toggle)) === "원화로 보기");
  await toggle.click(); await sleep(250);
  check("n3", "원화로 보기: 화면의 금액이 원화로 바뀌고 저장된다", (await cur()) === "KRW" && (await txt(page.locator("[data-open-primary]"))).includes("₩1,380") && (await txt(toggle)) === "달러로 보기" && (await txt(page.locator("[data-balance-open]"))).includes("₩13,800,000"), { btn: await txt(page.locator("[data-open-primary]")), bal: await txt(page.locator("[data-balance-open]")) });
  await s.shot(page, "01-n3-krw-box");
  await page.reload({ waitUntil: "networkidle" }); await page.waitForSelector(".v-openbar .v-btn:not([disabled])"); await sleep(300);
  check("n3", "새로 고침 뒤에도 원화", (await txt(page.locator("[data-open-primary]"))).includes("₩1,380"), await txt(page.locator("[data-open-primary]")));
  const ledger0 = await s.ledger(page);
  check("n3", "통화를 바꿔도 장부의 숫자는 USDT 그대로", ledger0.balance === 10000);
  // 언어
  const langs = await page.locator(".v-footer-cols a[hreflang]").evaluateAll((els) => els.map((a) => a.innerText.trim() + "→" + a.getAttribute("href").replace("/voila-test-aresjoo", "")));
  check("n3", "꼬리말의 언어 링크는 지금 화면의 다른 언어 주소", langs.join(",") === "English→/en/box/dollar-apple/,中文→/zh/box/dollar-apple/", langs);
  await page.locator(".v-footer-cols a[hreflang='en']").click(); await page.waitForURL(/\/en\/box\/dollar-apple\//); await page.waitForSelector(".v-openbar .v-btn:not([disabled])"); await sleep(300);
  const en = { lang: await page.evaluate(() => document.documentElement.lang), btn: await txt(page.locator("[data-open-primary]")), stored: await page.evaluate(() => localStorage.getItem("gachaflix.locale")) };
  check("n3", "영어로: 같은 박스 화면, html lang=en, 통화는 원화 그대로", en.lang === "en" && en.btn.includes("₩1,380"), en);
  check("n3", "언어를 바꿔도 gachaflix.locale 은 바뀌지 않는다(심은 값 ko 그대로)", en.stored === "ko", en.stored);
  await s.shot(page, "01-n3-en-krw-box");
  await page.locator(".v-footer-cols a[hreflang='zh']").click(); await page.waitForURL(/\/zh\/box\/dollar-apple\//); await sleep(400);
  check("n3", "중국어로: html lang=zh-Hans", (await page.evaluate(() => document.documentElement.lang)) === "zh-Hans");
  await page.goBack({ waitUntil: "networkidle" }); await sleep(300);
  check("n3", "뒤로 가면 영어 화면", pathOf(page) === "/en/box/dollar-apple/" && (await page.evaluate(() => document.documentElement.lang)) === "en", pathOf(page));
  // 영어 화면에서 이동해도 언어가 유지된다
  await page.locator(".v-menu-btn").click(); await page.waitForSelector(".v-sheet"); await sleep(200);
  await page.locator(".v-sheet nav a").nth(2).click(); await page.waitForURL(/\/en\/wallet\//); await sleep(300);
  check("n3", "영어에서 메뉴로 이동하면 영어 주소 그대로(/en/wallet/), 금액은 원화", pathOf(page) === "/en/wallet/" && (await txt(page.locator("main"))).includes("₩13,800,000"), (await txt(page.locator("main"))).slice(0, 160));
  // 루트 주소
  await page.goto(BASE + "/", { waitUntil: "networkidle" }); await sleep(600);
  check("n3", "루트 주소는 저장된 언어(gachaflix.locale=ko)로 보낸다", pathOf(page) === "/ko/", pathOf(page));
  await s.context.close();

  // 저장된 언어가 없을 때의 루트: 브라우저 언어
  for (const [loc, expect] of [["en", "/en/"], ["zh", "/zh/"], ["ko", "/ko/"]]) {
    const g = await session({ preset: "guest", locale: loc, view: "mobile", extra: {} });
    const p = await g.context.newPage();
    await p.addInitScript(() => { try { Object.getPrototypeOf(localStorage).removeItem.call(localStorage, "voila-test-aresjoo:gachaflix.locale"); } catch { /* 없음 */ } });
    await p.goto(BASE + "/", { waitUntil: "networkidle" }); await sleep(600);
    check("n3", `루트 주소, 저장된 언어 없음, 브라우저 언어 ${loc}`, pathOf(p) === expect, pathOf(p));
    await g.context.close();
  }
});

// n4: 옮긴 주소, 없는 주소, 개발 화면, 읽는 화면
await run("n4", async () => {
  const s = await session({ preset: "guest", view: "mobile" });
  for (const [from, to, label] of [["/ko/about/", "/ko/guide/", "이용 방법"], ["/ko/fairness/", "/ko/verify/", "개봉 결과 검증"], ["/ko/profile/", "/ko/account/", "계정"], ["/ko/community/", "/ko/", "박스"], ["/ko/community/board/", "/ko/", "박스"]]) {
    const page = await s.open(from);
    const t = await txt(page.locator("main"));
    const btn = page.locator("main a.v-btn");
    const ok = t.includes("옮긴 화면") && (await txt(btn)) === label;
    await btn.click(); await page.waitForURL((u) => new URL(u).pathname.endsWith(to));
    check("n4", `옛 주소 ${from}: 옮긴 화면과 단추 하나(${label}) → ${to}`, ok && pathOf(page) === to, t.slice(0, 80));
    await page.close();
  }
  let page = await s.open("/ko/reviews/");
  check("n4", "/ko/reviews/ 는 후기 모아보기", (await txt(page.locator("h1"))) === "후기", (await txt(page.locator("main"))).slice(0, 120));
  await page.close();
  const resp = await (await s.context.newPage()).goto(BASE + "/ko/dev/gallery/", { waitUntil: "networkidle" }).catch((e) => ({ status: () => "ERR " + e }));
  const gp = s.context.pages().at(-1);
  check("n4", "/ko/dev/gallery/ 는 배포 사이트에 없다(404)", resp.status() === 404, { status: resp.status(), text: (await txt(gp.locator("body"))).slice(0, 120) });
  await s.shot(gp, "01-n4-dev-gallery-404");
  await gp.close();
  for (const bad of ["/ko/no-such-page/", "/ko/box/no-such-box/", "/xx/", "/no-such/"]) {
    const p = await s.context.newPage(); s.watch(p);
    const r = await p.goto(BASE + bad, { waitUntil: "networkidle" });
    const t = await txt(p.locator("body"));
    const a = p.locator("main a.v-btn");
    check("n4", `없는 주소 ${bad}: 상태 ${r.status()}, 없는 주소 화면과 박스 보기`, r.status() === 404 && t.includes("없는 주소"), { text: t.slice(0, 120), href: await a.getAttribute("href").catch(() => null), header: await p.locator(".v-header").count() });
    if (bad === "/ko/no-such-page/") await s.shot(p, "01-n4-404");
    await p.close();
  }
  // 이용 방법, 약관
  page = await s.open("/ko/guide/");
  const g = await txt(page.locator("main"));
  check("n4", "이용 방법: 순서 셋, 알아 둘 값, 링크 둘", g.includes("박스 고르기") && g.includes("알아 둘 값") && (await page.locator("main .v-links a").count()) === 2, g.slice(0, 260));
  const glinks = await page.locator("main .v-links a").evaluateAll((els) => els.map((a) => a.innerText.trim() + "→" + a.getAttribute("href").replace("/voila-test-aresjoo", "")));
  check("n4", "이용 방법의 검증 링크는 옛 주소(/fairness)를 가리킨다(옮긴 화면을 한 번 거친다)", glinks[0].endsWith("/ko/fairness/"), glinks);
  await page.locator("main .v-links a").nth(1).click(); await page.waitForURL(/\/legal\//);
  const docs = await page.locator("main .v-rows a").count();
  check("n4", "약관과 정책: 문서 행 13개", docs === 13, docs);
  await s.shot(page, "01-n4-legal");
  await page.locator("main .v-rows a").first().click(); await page.waitForURL(/\/legal\/terms\//);
  check("n4", "문서 행 → 그 문서, 머리의 뒤로와 아래 링크는 목록으로", (await page.locator(".v-back").getAttribute("href")).endsWith("/ko/legal/") && (await page.locator("main .v-links a").getAttribute("href")).endsWith("/ko/legal/"), pathOf(page));
  await page.locator(".v-back").click(); await page.waitForURL(/\/ko\/legal\/$/);
  check("n4", "뒤로 단추는 목록으로 간다", pathOf(page) === "/ko/legal/");
  // 꼬리말
  const foot = await page.locator(".v-footer a, .v-footer button").evaluateAll((els) => els.map((a) => (a.innerText || a.getAttribute("aria-label") || "").trim() + "→" + (a.getAttribute("href") ?? "button").replace("/voila-test-aresjoo", "")));
  check("n4", "꼬리말의 링크와 단추", "info", foot);
  check("n4", "팔로우 그림 넷은 주소가 없어 누를 수 없다(링크가 아니다)", (await page.locator(".v-footer-follow a").count()) === 0 && (await page.locator(".v-footer-follow .v-footer-icon").count()) === 4);
  check("n4", "콘솔 오류(404 요청 제외)", "info", s.errors.join(" | ").slice(0, 400));
  await s.context.close();
});

// n5: 오프라인 한 줄, 세션 끝남 한 줄
await run("n5", async () => {
  const s = await session({ preset: "funded", view: "mobile" });
  const page = await s.open("/ko/box/dollar-apple/");
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  await s.context.setOffline(true); await sleep(400);
  check("n5", "연결이 끊기면 머리줄 아래 한 줄", (await txt(page.locator(".v-offline"))) === "인터넷 연결이 끊겼습니다. 연결되면 이어집니다.", await txt(page.locator(".v-offline")));
  await s.shot(page, "01-n5-offline");
  await s.context.setOffline(false); await sleep(400);
  check("n5", "다시 연결되면 사라진다", (await page.locator(".v-offline").count()) === 0);
  // 다른 탭에서 로그아웃
  const other = await s.open("/ko/account/");
  await other.locator("main .v-links .v-link").last().click(); await other.waitForSelector('[role="alertdialog"] .v-btn'); await sleep(250);
  await other.locator('[role="alertdialog"] .v-btn').click(); await sleep(800);
  await page.bringToFront(); await sleep(500);
  const line = await txt(page.locator(".v-offline"));
  check("n5", "다른 탭에서 로그아웃하면 이 탭에 세션 끝남 한 줄과 로그인 링크", line.includes("세션이 끝났습니다.") && (await page.locator(".v-offline .v-link").count()) === 1, line);
  check("n5", "이 탭의 주 단추는 로그인하고 언박싱으로 바뀐다(잔액 단추 없음)", (await txt(page.locator(".v-openbar .v-btn"))) === "로그인하고 언박싱" && (await page.locator("[data-balance-open]").count()) === 0, await txt(page.locator(".v-openbar")));
  await s.shot(page, "01-n5-session-lost");
  await s.context.close();
});

await save();
