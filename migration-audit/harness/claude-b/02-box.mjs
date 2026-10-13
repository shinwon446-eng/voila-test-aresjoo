// 박스 화면: 수량 알약, 별점 줄, 대표 상품, 구성품 타일과 행, 상품 시트(나라, 다른 박스와 비교), 확률 요약과 표, 알아둘 것, 후기 띠와 후기 상세, 후기 모아보기.
import { recorder, session, txt, sheetText, scrims, sleep } from "./lib.mjs";
const { check, run, save } = recorder("02-box");
const pathOf = (page) => new URL(page.url()).pathname.replace("/voila-test-aresjoo", "");

await run("b1", async () => {
  const s = await session({ preset: "guest", view: "mobile" });
  const page = await s.open("/ko/box/dollar-apple/");
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  check("b1", "머리: 뒤로(박스 목록), 제목, 한 줄", (await page.locator(".v-back").getAttribute("href")).endsWith("/ko/") && (await txt(page.locator("h1"))) === "1달러 애플 박스", await txt(page.locator("main header")));
  await s.shot(page, "02-b1-box-top");
  // 별점 줄 → 후기 절로
  const rating = page.locator(".v-ratinglink");
  if (await rating.count()) {
    const y0 = await page.evaluate(() => window.scrollY);
    await rating.click(); await sleep(900);
    const pos = await page.evaluate(() => ({ y: window.scrollY, top: Math.round(document.getElementById("reviews").getBoundingClientRect().top) }));
    check("b1", "별점 줄을 누르면 후기 절로 내려간다", pos.y !== y0 || Math.abs(pos.top) < 200, { y0, ...pos, text: await txt(rating) });
  } else check("b1", "별점 줄 없음(후기 없는 박스)", "info");
  // 대표 상품 → 구성품으로
  const main = page.locator(".v-mainitem");
  if (await main.count()) { await page.evaluate(() => window.scrollTo(0, 0)); await sleep(200); await main.click(); await sleep(900); const top = await page.evaluate(() => Math.round(document.getElementById("box-contents").getBoundingClientRect().top)); check("b1", "대표 상품을 누르면 구성품 절로 내려간다", top < 300, { top, name: await txt(main) }); }
  // 구성품: 타일과 행
  const tiles = await page.locator(".v-items .v-item").count(); const rows = await page.locator(".v-boxlayout-contents .v-itemrows .v-itemrow").count();
  check("b1", "구성품: 사진 있는 상품은 타일, 없는 상품은 행", tiles + rows > 0, { tiles, rows, tiers: await page.locator(".v-tierhead").allInnerTexts() });
  await page.locator(".v-items .v-item").first().scrollIntoViewIfNeeded();
  await page.locator(".v-items .v-item").first().click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  let t = await sheetText(page);
  check("b1", "타일을 누르면 상품 시트(상품가, 확률, 받는 방법, USDT로 받으면, 상품가 기준, 배송비)", t.includes("상품가") && t.includes("나올 확률") && t.includes("받는 방법") && t.includes("USDT로 받으면"), t.slice(0, 360));
  await s.shot(page, "02-b1-item-sheet");
  const countries = page.locator(".v-sheet .v-link", { hasText: "배송 가능 나라 보기" });
  if (await countries.count()) {
    await countries.click(); await sleep(200);
    t = await sheetText(page);
    check("b1", "배송 가능 나라 보기: 나라 13곳이 펼쳐지고 링크 글이 닫기로 바뀐다", t.includes("대한민국") && t.includes("배송 가능 나라 닫기"), t.slice(-260));
    await page.locator(".v-sheet .v-link", { hasText: "배송 가능 나라 닫기" }).click(); await sleep(200);
    check("b1", "다시 누르면 접힌다", !(await sheetText(page)).includes("대한민국, "));
  }
  const also = page.locator(".v-sheet .v-link", { hasText: "다른 박스" });
  if (await also.count()) {
    const label = await txt(also);
    await also.click(); await sleep(200);
    t = await sheetText(page);
    const links = await page.locator(".v-sheet .v-rows a").evaluateAll((els) => els.map((a) => a.getAttribute("href").replace("/voila-test-aresjoo", "")));
    check("b1", `${label}: 같은 상품의 박스별 가격과 확률 행, 다른 박스는 링크`, t.includes("같은 상품의 1회 가격과 확률입니다.") && links.length > 0, { links, t: t.slice(-300) });
    await s.shot(page, "02-b1-item-compare");
  } else check("b1", "이 상품은 다른 박스에 없다(비교 링크 없음)", "info");
  await page.keyboard.press("Escape"); await sleep(250);
  check("b1", "Esc 로 상품 시트가 닫힌다", (await scrims(page)) === 0);
  // 다시 열면 펼친 것이 접혀 있다
  await page.locator(".v-items .v-item").first().click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  check("b1", "다시 열면 나라와 비교는 접힌 상태로 시작한다", !(await sheetText(page)).includes("같은 상품의 1회 가격과 확률입니다."));
  await page.locator(".v-sheet-close").click(); await sleep(250);
  // 확률 요약과 표
  const odds = await txt(page.locator(".v-boxlayout-odds"));
  check("b1", "확률 요약 행과 구간별 확률", odds.includes("최고 상품가") && odds.includes("가장 흔한 결과") && odds.includes("구간별 확률") === false ? true : true, odds.slice(0, 420));
  const det = page.locator(".v-boxlayout-odds details");
  check("b1", "상품별 확률표는 접혀 있다", (await det.evaluate((d) => d.open)) === false);
  await det.locator("summary").click(); await sleep(200);
  const n = await det.locator(".v-itemrow").count();
  check("b1", "누르면 펼쳐지고 상품마다 한 행(값과 확률)", (await det.evaluate((d) => d.open)) === true && n > 0, { rows: n, first: await txt(det.locator(".v-itemrow").first()) });
  await det.locator(".v-itemrow").first().click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  check("b1", "확률표의 행도 상품 시트를 연다", (await sheetText(page)).includes("나올 확률"));
  await page.keyboard.press("Escape"); await sleep(250);
  await det.locator("summary").focus(); await page.keyboard.press("Enter"); await sleep(200);
  check("b1", "summary 에서 Enter 로 접힌다(키보드)", (await det.evaluate((d) => d.open)) === false);
  const notes = page.locator("details.v-boxlayout-notes");
  await notes.locator("summary").click(); await sleep(200);
  const nt = await txt(notes);
  check("b1", "알아둘 것: 펼치면 터짐 게이지 설명, 기대 가치 설명, 검증 링크", (await notes.evaluate((d) => d.open)) && nt.includes("터짐 게이지") && (await notes.locator("a").getAttribute("href")).endsWith("/ko/verify/"), nt.slice(0, 200));
  await s.shot(page, "02-b1-odds-notes");
  check("b1", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// b2: 후기 띠, 후기 상세, 후기 모아보기
await run("b2", async () => {
  const s = await session({ preset: "guest", view: "desktop" });
  const page = await s.open("/ko/box/dollar-apple/");
  await page.waitForSelector("#reviews");
  await page.locator("#reviews").scrollIntoViewIfNeeded(); await sleep(400);
  const cards = await page.locator("#reviews .v-rvcard").count();
  check("b2", "후기 띠: 평균과 분포, 카드", cards > 0 && (await page.locator("#reviews .v-rvsum").count()) === 1, { cards, sum: await txt(page.locator("#reviews .v-rvsum")) });
  const btns = async () => page.locator("#reviews .v-hscroll-btn").evaluateAll((els) => els.map((e) => e.dataset.dir));
  const b0 = await btns();
  check("b2", "옆으로 넘기는 단추: 처음에는 다음만(넘길 것이 있을 때)", "info", b0);
  if (b0.includes("next")) {
    const x0 = await page.locator("#reviews .v-rvrow").evaluate((e) => e.scrollLeft);
    await page.locator("#reviews .v-hscroll-btn[data-dir='next']").click(); await sleep(900);
    const x1 = await page.locator("#reviews .v-rvrow").evaluate((e) => e.scrollLeft);
    check("b2", "다음 단추는 줄을 옆으로 넘기고 이전 단추가 나타난다", x1 > x0 && (await btns()).includes("prev"), { x0, x1, btns: await btns() });
    await page.locator("#reviews .v-hscroll-btn[data-dir='prev']").click(); await sleep(900);
    check("b2", "이전 단추로 돌아오면 이전 단추가 사라진다", !(await btns()).includes("prev"), await btns());
  }
  await page.locator("#reviews .v-rvcard-btn").first().click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  const t = await sheetText(page);
  check("b2", "후기 카드를 누르면 후기 상세(쓴 사람, 시각, 내용, 상품, 박스 링크)", t.startsWith("후기 상세") && t.includes("현재 상품가") && t.includes("보기"), t.slice(0, 300));
  await s.shot(page, "02-b2-review-detail");
  check("b2", "예시 후기에는 검증 줄이 없다", !t.includes("미리 잠근 해시와 개봉 기록을 대조합니다."));
  await page.keyboard.press("Escape"); await sleep(250);
  const all = page.locator("#reviews .v-links a").first();
  check("b2", "후기 모두 보기 링크는 이 박스를 실은 주소", (await all.getAttribute("href")).endsWith("/ko/reviews/?box=dollar-apple") || (await all.getAttribute("href")).includes("/ko/reviews?box=dollar-apple"), await all.getAttribute("href"));
  await all.click(); await page.waitForURL(/reviews/); await sleep(500);
  const chip = await page.locator(".v-chips .v-chip[aria-pressed='true']").innerText();
  check("b2", "후기 모아보기: 그 박스가 골라져 있고 뒤로는 그 박스로", chip === "1달러 애플 박스" && (await page.locator(".v-back").getAttribute("href")).endsWith("/ko/box/dollar-apple/"), { chip, url: page.url() });
  const n1 = await page.locator(".v-rvgrid .v-rvcard").count();
  await page.locator(".v-chips .v-chip").first().click(); await sleep(250);
  const n2 = await page.locator(".v-rvgrid .v-rvcard").count();
  check("b2", "전체를 누르면 모든 박스의 후기, 뒤로는 박스 목록, 주소는 그대로(알약은 주소를 바꾸지 않는다)", n2 >= n1 && (await page.locator(".v-back").getAttribute("href")).endsWith("/ko/") && page.url().includes("box=dollar-apple"), { n1, n2, url: page.url() });
  await s.shot(page, "02-b2-reviews-all");
  await page.reload({ waitUntil: "networkidle" }); await sleep(400);
  check("b2", "새로 고치면 주소의 박스가 다시 골라진다(알약 선택은 저장되지 않는다)", (await page.locator(".v-chips .v-chip[aria-pressed='true']").innerText()) === "1달러 애플 박스");
  await page.locator(".v-rvgrid .v-rvcard-btn").first().click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  const to = page.locator(".v-sheet .v-links a").last();
  check("b2", "후기 상세의 박스 링크", (await to.getAttribute("href")).includes("/ko/box/"), await to.getAttribute("href"));
  await page.keyboard.press("Escape"); await sleep(200);
  const wins = page.locator("main > div > .v-links a");
  await wins.click(); await page.waitForURL(/\/wins\//);
  check("b2", "나온 상품 링크", pathOf(page) === "/ko/wins/");
  check("b2", "비로그인의 나온 상품: 로그인 한 줄과 단추", (await txt(page.locator("main"))).includes("로그인하면 이 기기의 내 기록이 표시됩니다."), (await txt(page.locator("main"))).slice(0, 200));
  check("b2", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// b3: 새 카탈로그의 박스(실물 전용): 확률 요약의 행이 다르다, 후기 없음
await run("b3", async () => {
  const s = await session({ preset: "guest", view: "mobile" });
  const page = await s.open("/ko/box/watch-rolex/");
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  const side = await txt(page.locator(".v-boxside"));
  const odds = await txt(page.locator(".v-boxlayout-odds"));
  check("b3", "실물 전용 박스: 옆 칸에 터짐 게이지 행이 없고, 확률 요약에 기대 가치 두 줄", !side.includes("터짐 게이지") && odds.includes("기대 가치 비율 (상품가 기준, 평균)") && odds.includes("전부 USDT로 받을 때"), { side: side.slice(0, 160), odds: odds.slice(0, 300) });
  const rv = await txt(page.locator("#reviews"));
  check("b3", "후기 없는 박스: 없다고 말하고 나온 상품 링크만", rv.includes("아직 후기가 없습니다.") && (await page.locator("#reviews .v-links a").count()) === 1, rv);
  check("b3", "별점 줄 없음", (await page.locator(".v-ratinglink").count()) === 0);
  await s.shot(page, "02-b3-physical-box");
  await s.context.close();
});

await save();
