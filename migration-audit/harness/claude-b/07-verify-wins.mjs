// 개봉 결과 검증(내 기록, 세 단계 시트, 직접 넣어 계산, 주소로 미리 채우기), 나온 상품(줄, 상세, 검증), 목록의 더 보기와 뒤로.
import { recorder, session, txt, sheetText, scrims, sleep, fixtures, BASE } from "./lib.mjs";
const { check, run, save } = recorder("07-verify-wins");
const pathOf = (page) => new URL(page.url()).pathname.replace("/voila-test-aresjoo", "");

await run("v1", async () => {
  const g = await session({ preset: "guest", view: "mobile" });
  let page = await g.open("/ko/verify/");
  await page.waitForSelector("main .v-btn");
  let t = await txt(page.locator("main"));
  check("v1", "비로그인 검증 화면: 내 기록 자리에 로그인 한 줄, 직접 계산과 검증 방식은 로그인 없이 쓸 수 있다", t.includes("로그인하면 내 개봉 기록을 하나씩 다시 계산할 수 있습니다.") && t.includes("값을 직접 넣어 계산") && t.includes("블록체인 검증 방식"), t.slice(0, 200));
  // 직접 계산: 빈 값
  const compute = page.locator("section[aria-labelledby='verify-manual'] .v-btn");
  await compute.click(); await sleep(300);
  check("v1", "빈 채로 계산하기: 실패 한 줄", (await txt(page.locator("section[aria-labelledby='verify-manual'] .v-line--fail"))) === "공개된 값, 내 기기 값, 회차를 넣어야 계산합니다.");
  const inputs = page.locator("section[aria-labelledby='verify-manual'] .v-input");
  const fx = fixtures.boxes["dollar-apple"].single.itemLow;
  await inputs.nth(0).fill(fixtures.serverSeed); await inputs.nth(2).fill(fx.clientSeed); await inputs.nth(3).fill("-1");
  await compute.click(); await sleep(300);
  check("v1", "회차가 음수면 실패 한 줄", (await page.locator("section[aria-labelledby='verify-manual'] .v-line--fail").count()) === 1);
  await inputs.nth(3).fill(String(fx.nonce));
  // 박스 고르기(알약이 320개쯤이다)
  const chips = page.locator("section[aria-labelledby='verify-manual'] .v-chip");
  const n = await chips.count();
  await chips.filter({ hasText: "1달러 애플 박스" }).first().click();
  await compute.click(); await page.waitForSelector("section[aria-labelledby='verify-manual'] .v-rows", { timeout: 10000 }); await sleep(200);
  t = await txt(page.locator("section[aria-labelledby='verify-manual'] .v-rows"));
  check("v1", `직접 계산(박스 알약 ${n}개): 해시, 번호, 번호가 가리키는 상품(고정값의 상품과 같다)`, t.includes("공개된 값의 해시") && t.includes("USB-C 충전 케이블 2m") && !t.includes("미리 잠근 값"), t);
  await inputs.nth(1).fill(fixtures.serverSeedHash); await compute.click(); await sleep(500);
  check("v1", "잠근 값을 넣으면 같은지 한 행으로 말한다", (await txt(page.locator("section[aria-labelledby='verify-manual'] .v-rows"))).includes("미리 잠근 값 잠근 값과 같습니다"));
  await inputs.nth(1).fill("00" + fixtures.serverSeedHash.slice(2)); await compute.click(); await sleep(500);
  check("v1", "잠근 값이 다르면 다르다고 말한다", (await txt(page.locator("section[aria-labelledby='verify-manual'] .v-rows"))).includes("잠근 값과 다릅니다"));
  await g.shot(page, "07-v1-manual");
  // 값을 고친 뒤에는 앞의 결과가 그대로 남아 있다(다시 누를 때까지)
  await inputs.nth(3).fill("999999"); await sleep(200);
  check("v1", "값을 고쳐도 계산하기를 다시 누르기 전에는 앞의 결과가 남아 있다", (await txt(page.locator("section[aria-labelledby='verify-manual'] .v-rows"))).includes("USB-C 충전 케이블 2m"));
  // 주소로 미리 채우기
  const q = new URLSearchParams({ s: fixtures.serverSeed, h: fixtures.serverSeedHash, c: fx.clientSeed, n: String(fx.nonce), box: "dollar-apple" }).toString();
  await page.goto(BASE + "/ko/verify/?" + q, { waitUntil: "networkidle" }); await sleep(600);
  const vals = await page.locator("section[aria-labelledby='verify-manual'] .v-input").evaluateAll((els) => els.map((e) => e.value));
  const pressed = await page.locator("section[aria-labelledby='verify-manual'] .v-chip[aria-pressed='true']").innerText();
  const top = await page.evaluate(() => Math.round(document.getElementById("verify-manual").getBoundingClientRect().top));
  check("v1", "주소의 값으로 미리 채우고 그 절로 내려간다(박스도 골라진다). 계산은 스스로 하지 않는다", vals[0] === fixtures.serverSeed && vals[3] === String(fx.nonce) && pressed === "1달러 애플 박스" && top < 200 && (await page.locator("section[aria-labelledby='verify-manual'] .v-rows").count()) === 0, { vals, pressed, top });
  await page.goto(BASE + "/ko/verify/?s=x&box=no-such-box", { waitUntil: "networkidle" }); await sleep(500);
  check("v1", "주소의 박스가 없는 박스면 첫 박스가 골라진 채다", (await page.locator("section[aria-labelledby='verify-manual'] .v-chip[aria-pressed='true']").count()) === 1);
  check("v1", "콘솔 오류 없음", g.errors.length === 0, g.errors.join(" | "));
  await g.context.close();
});

// v2: 내 기록 → 세 단계 시트 → 직접 넣어 검증 링크, 그리고 나온 상품
await run("v2", async () => {
  const s = await session({ preset: "funded", view: "mobile", reduced: true, fixture: "dollar-apple:single:itemMid" });
  let page = await s.open("/ko/box/dollar-apple/");
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  await page.locator("[data-open-primary]").click(); await page.waitForSelector(".v-op[data-opening-state='settled']");
  await page.locator(".v-op-actions .v-link", { hasText: "보관함에 두기" }).click(); await page.waitForSelector(".v-op", { state: "detached" });
  await page.goto(BASE + "/ko/verify/", { waitUntil: "networkidle" }); await page.waitForSelector("section[aria-labelledby='verify-records'] .v-itemrow"); await sleep(300);
  const row = await txt(page.locator("section[aria-labelledby='verify-records'] .v-itemrow").first());
  check("v2", "내 개봉 기록 행: 상품, 박스, 시각, 회차", row.includes("1달러 애플 박스") && row.includes("회차 355,255") && row.includes("검증"), row);
  await page.locator("section[aria-labelledby='verify-records'] .v-itemrow").first().click(); await page.waitForSelector(".v-sheet");
  await page.waitForFunction(() => /같습니다|다릅니다|맞춰 보지|계산하지/.test(document.querySelector(".v-sheet")?.innerText || ""), null, { timeout: 10000 });
  let t = await sheetText(page);
  check("v2", "검증 시트: 세 단계, 저장한 확률표로 계산, 일치 판정", t.includes("확률표 개봉할 때 저장한 표") && t.includes("다시 계산한 결과가 받은 상품과 같습니다."), t.slice(-300));
  await s.shot(page, "07-v2-verify-sheet");
  await page.locator(".v-sheet .v-links a").click(); await page.waitForURL(/verify\/\?s=/); await sleep(600);
  const vals = await page.locator("section[aria-labelledby='verify-manual'] .v-input").evaluateAll((els) => els.map((e) => e.value));
  check("v2", "값을 직접 넣어 검증: 시트가 닫히고 같은 화면의 직접 계산 칸이 채워진다", (await scrims(page)) === 0 && vals[3] === "355255", vals);
  // 나온 상품
  await page.goto(BASE + "/ko/wins/", { waitUntil: "networkidle" }); await page.waitForSelector("main .v-itemrow"); await sleep(300);
  t = await txt(page.locator("main"));
  check("v2", "나온 상품: 범위 한 줄과 줄 하나(상품가 250, 박스, 가린 이름과 시각)", t.includes("이 기기에서 이 계정으로 연 기록입니다.") && (await page.locator("main .v-itemrow").count()) === 1 && t.includes("$250") && t.includes("촬영***"), t.slice(0, 300));
  await s.shot(page, "07-v2-wins");
  await page.locator("main .v-itemrow").first().click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  t = await sheetText(page);
  check("v2", "줄을 누르면 상세(박스, 그때의 1회 가격 $1, 상품가, 배수 250배, 무료 개봉 아니오, 나온 때)", t.includes("그때의 1회 가격 $1") && t.includes("배수 250배") && t.includes("무료 개봉 아니오"), t);
  await s.shot(page, "07-v2-win-detail");
  await page.locator(".v-sheet .v-btn").click(); await sleep(500);
  await page.waitForFunction(() => /같습니다|다릅니다|맞춰 보지|계산하지/.test(document.querySelector(".v-sheet")?.innerText || ""), null, { timeout: 10000 });
  check("v2", "상세의 개봉 결과 검증: 같은 자리에서 검증 시트로 바뀐다(시트 하나)", (await page.locator(".v-scrim").count()) === 1 && (await sheetText(page)).startsWith("개봉 결과 검증"));
  await page.keyboard.press("Escape"); await sleep(300);
  check("v2", "검증 시트를 닫으면 상세로 돌아가지 않고 목록이다", (await scrims(page)) === 0);
  await page.locator("main .v-itemrow").first().click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  await page.locator(".v-sheet .v-links a").click(); await page.waitForURL(/\/box\/dollar-apple\//);
  check("v2", "상세의 박스 링크는 그 박스로", pathOf(page) === "/ko/box/dollar-apple/");
  check("v2", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();

  // 보관 상품이 있는 계정(옛 기록: 그때 가격이 없다)
  const o = await session({ preset: "inventory", view: "mobile" });
  page = await o.open("/ko/wins/");
  await page.waitForSelector("main .v-itemrow"); await sleep(300);
  await page.locator("main .v-itemrow").first().click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  const t2 = await sheetText(page);
  check("v2", "그때 가격이 없는 옛 기록: 지금의 1회 가격이라고 적고 그 사실을 한 줄로, 무료 개봉은 기록 없음", t2.includes("지금의 1회 가격 $1") && t2.includes("이 기록에는 그때 가격이 없어 지금 가격으로 견주었습니다.") && t2.includes("무료 개봉 기록 없음"), t2);
  await o.context.close();
});

// v3: 박스 목록의 더 보기 뒤 박스로 갔다가 뒤로
await run("v3", async () => {
  const s = await session({ preset: "guest", view: "mobile" });
  const page = await s.open("/ko/");
  const more = page.locator("main .v-btn--quiet");
  await more.click(); await more.click(); await sleep(200);
  const n0 = await page.locator(".v-boxgrid .v-boxcard").count();
  await page.locator(".v-chips .v-chip").nth(3).click(); await sleep(200);
  const cat = await page.locator(".v-chips .v-chip[aria-pressed='true']").innerText();
  await page.locator(".v-boxgrid .v-boxcard").first().click(); await page.waitForURL(/\/box\//); await sleep(300);
  await page.goBack(); await sleep(900);
  const back = { cards: await page.locator(".v-boxgrid .v-boxcard").count(), cat: await page.locator(".v-chips .v-chip[aria-pressed='true']").innerText() };
  check("v3", `더 보기로 ${n0}장까지 늘리고 분류(${cat})를 고른 뒤 박스에 갔다가 뒤로: 목록은 처음 상태(전체 박스, 24장)로 돌아온다`, back.cards === 24 && back.cat === "전체 박스", back);
  await s.context.close();
});

await save();
