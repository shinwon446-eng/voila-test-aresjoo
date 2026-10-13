// 빠진 것 채우기: 다른 박스와 비교, 배송 신청 취소(심은 시험 기록), 배송 조회 링크, 여럿 결과의 건너뛰기와 Esc, 비로그인 보관함, 후기 사진, 사용자 화면의 토스트.
import { recorder, session, txt, sheetText, scrims, sleep, near, BASE, REPO } from "./lib.mjs";
import path from "node:path";
const { check, run, save } = recorder("12-extra");
const pathOf = (page) => new URL(page.url()).pathname.replace("/voila-test-aresjoo", "");

// x1: 여러 박스에 든 상품의 비교
await run("x1", async () => {
  const s = await session({ preset: "guest", view: "mobile" });
  const page = await s.open("/ko/box/watch-rolex/");
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  // 확률표를 펼쳐 뒤쪽 행(공통 상품)부터 눌러 비교 링크가 있는 상품을 찾는다
  await page.locator(".v-boxlayout-odds details summary").click(); await sleep(200);
  const rows = page.locator(".v-boxlayout-odds details .v-itemrow"); const n = await rows.count();
  let found = false;
  for (let i = n - 1; i >= Math.max(0, n - 12) && !found; i--) {
    await rows.nth(i).scrollIntoViewIfNeeded(); await rows.nth(i).click(); await page.waitForSelector(".v-sheet"); await sleep(200);
    const also = page.locator(".v-sheet .v-link", { hasText: "비교" });
    if (await also.count()) {
      found = true;
      const label = await txt(also);
      await also.click(); await sleep(200);
      const t = await sheetText(page);
      const links = await page.locator(".v-sheet ul.v-rows a").evaluateAll((els) => els.map((a) => a.getAttribute("href").replace("/voila-test-aresjoo", "")));
      const self = await page.locator(".v-sheet ul.v-rows span.v-row").count();
      check("x1", `"${label}": 이 박스는 글만, 다른 박스는 링크인 행이 펼쳐지고 링크 글은 사라진다`, t.includes("같은 상품의 1회 가격과 확률입니다.") && links.length > 0 && self === 1 && (await page.locator(".v-sheet .v-link", { hasText: "비교" }).count()) === 0, { links: links.slice(0, 4), t: t.slice(-220) });
      await s.shot(page, "12-x1-compare");
      await page.locator(".v-sheet ul.v-rows a").first().click(); await page.waitForURL((u) => !u.pathname.includes("watch-rolex")); await sleep(300);
      check("x1", "비교 행의 링크는 그 박스로 간다(시트는 화면과 함께 사라진다)", /^\/ko\/box\//.test(pathOf(page)) && (await scrims(page)) === 0, pathOf(page));
    } else { await page.keyboard.press("Escape"); await sleep(150); }
  }
  if (!found) check("x1", "비교 링크가 있는 상품을 찾지 못했다(뒤쪽 12행)", false);
  await s.context.close();
});

// x2: 배송 탭. 신청 취소(심은 시험 기록)와 배송 조회 링크
await run("x2", async () => {
  const s = await session({ preset: "shipping", view: "mobile" });
  const page = await s.open("/ko/inventory/");
  await page.waitForSelector(".v-chips"); await sleep(400);
  check("x2", "배송 프리셋: 보관 중 0, 배송 2", (await page.locator(".v-chips .v-chip").allInnerTexts()).join("|") === "보관 중 0|배송 2|받은 것 0", await page.locator(".v-chips .v-chip").allInnerTexts());
  await page.locator(".v-chips .v-chip").nth(1).click(); await page.waitForSelector(".v-itemrow"); await sleep(200);
  const rows = await page.locator(".v-itemrow").evaluateAll((els) => els.map((e) => e.innerText.replace(/\s+/g, " ")));
  check("x2", "배송 탭의 행(배송 신청함, 배송 중)", rows.some((r) => r.includes("배송 신청함")) && rows.some((r) => r.includes("배송 중")), rows);
  await s.shot(page, "12-x2-shipping-tab");
  await page.locator(".v-itemrow", { hasText: "배송 중" }).click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  let t = await sheetText(page);
  const track = page.locator(".v-sheet a.v-btn");
  check("x2", "배송 중 상세: 택배사와 운송장 행, 주 단추는 밖으로 나가는 배송 조회 링크(새 창)", t.includes("택배사 DHL") && t.includes("운송장 번호 CAPTURE-ONLY") && (await track.getAttribute("target")) === "_blank" && /^https:\/\//.test(await track.getAttribute("href")), { href: await track.getAttribute("href"), t });
  await page.keyboard.press("Escape"); await sleep(250);
  await page.locator(".v-itemrow", { hasText: "배송 신청함" }).click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  t = await sheetText(page);
  check("x2", "배송 신청함 상세: 운송장 안내 한 줄과 배송 신청 취소 단추", t.includes("운송장 번호는 출고되면 표시됩니다.") && (await txt(page.locator(".v-sheet .v-btn"))) === "배송 신청 취소", t);
  await page.locator(".v-sheet .v-btn").click(); await page.waitForSelector('[role="alertdialog"]'); await sleep(250);
  check("x2", "취소는 확인창을 거친다", (await txt(page.locator('[role="alertdialog"]'))).includes("상품이 보관함으로 돌아오고"));
  await page.evaluate(() => { const b = document.querySelector('[role="alertdialog"] .v-btn'); for (let i = 0; i < 3; i++) b.click(); });
  await page.waitForFunction(() => !document.querySelector(".v-scrim"), null, { timeout: 10000 }); await sleep(300);
  const l = await s.ledger(page);
  check("x2", "확정(세 번 눌러도 한 번): 상품이 보관 중으로 돌아오고 보관 중 탭으로 옮겨 간다. 배송비가 0 이라 돈은 움직이지 않는다", l.items.filter((i) => i.status === "IN_STORAGE").length === 1 && near(l.balance, 10000) && l.txCount === 1 && (await page.locator(".v-chips .v-chip[aria-pressed='true']").innerText()) === "보관 중 1", { statuses: l.items.map((i) => i.status), tabs: await page.locator(".v-chips .v-chip").allInnerTexts() });
  // 지난번 주소가 배송 시트에 채워진다
  await page.locator(".v-itemrow").first().click(); await page.waitForSelector(".v-sheet"); await sleep(250);
  await page.locator(".v-sheet .v-links .v-link", { hasText: "배송 받기" }).click(); await sleep(400);
  const vals = await page.locator(".v-sheet .v-input").evaluateAll((els) => els.map((e) => e.value));
  check("x2", "배송 시트를 열면 지난번에 쓴 주소가 채워져 있다(나라 싱가포르, 통관 칸 없음)", vals[0] === "촬영 수령인" && vals.length === 4 && (await page.locator(".v-sheet .v-chip[aria-pressed='true']").innerText()) === "싱가포르", vals);
  await s.context.close();

  const g = await session({ preset: "guest", view: "mobile" });
  const p = await g.open("/ko/inventory/");
  await p.waitForSelector("main .v-btn");
  check("x2", "비로그인 보관함: 로그인 한 줄과 로그인 단추(탭 없음)", (await txt(p.locator("main"))).includes("로그인하면 받은 상품이 표시됩니다.") && (await p.locator(".v-chips").count()) === 0);
  await p.locator("main .v-btn").click(); await p.waitForSelector(".v-sheet"); await sleep(200);
  check("x2", "로그인 단추는 로그인 시트", (await sheetText(p)).startsWith("로그인"));
  await g.context.close();
});

// x3: 여럿 결과의 건너뛰기와 Esc, 행의 검증, 한 번 더 열기
await run("x3", async () => {
  const s = await session({ preset: "funded", view: "mobile", reduced: false, fixture: "dollar-apple:seq:mixed" });
  const page = await s.open("/ko/box/dollar-apple/");
  await page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  await page.locator(".v-openbar .v-chip").nth(1).click();
  await page.locator("[data-open-primary]").click(); await page.waitForSelector(".v-reveal-solo", { timeout: 10000 });
  check("x3", "여럿 열기의 연출 화면: N개 여는 중과 결과 바로 보기", (await txt(page.locator(".v-reveal"))).includes("5개 여는 중") && (await page.locator(".v-reveal .v-op-skip .v-link").count()) === 1);
  await page.keyboard.press("Escape");
  await page.waitForSelector(".v-reveal-result", { timeout: 3000 });
  check("x3", "연출 중 Esc: 닫히지 않고 결과로 건너뛴다", (await page.locator(".v-reveal").count()) === 1);
  await page.keyboard.press("Escape"); await sleep(120);
  const early = await page.locator(".v-reveal").count();
  await sleep(500); await page.keyboard.press("Escape"); await sleep(300);
  check("x3", "결과가 뜬 직후(0.35초 안)의 Esc 는 닫지 않고, 그 뒤의 Esc 는 닫는다", early === 1 && (await page.locator(".v-reveal").count()) === 0, { early });
  // 다시 열어 건너뛰기 링크, 행의 검증, 한 번 더 열기
  await page.locator("[data-open-primary]").click(); await page.waitForSelector(".v-reveal .v-op-skip .v-link", { timeout: 10000 });
  await page.locator(".v-reveal .v-op-skip .v-link").click(); await page.waitForSelector(".v-reveal-result", { timeout: 3000 }); await sleep(600);
  const single = page.locator(".v-resultrow button").first();
  await single.click(); await page.waitForSelector(".v-sheet"); await sleep(300);
  check("x3", "USDT 결과 행(묶이지 않은 것)을 누르면 그 결과의 검증 시트", (await sheetText(page)).startsWith("개봉 결과 검증"), (await sheetText(page)).slice(0, 60));
  await page.keyboard.press("Escape"); await sleep(300);
  const before = await s.ledger(page);
  await page.locator(".v-reveal [data-open-again]").click(); await page.waitForFunction((n) => { const sess = localStorage.getItem("voila.browser-session.v1"); const w = JSON.parse(localStorage.getItem("voila.browser-wallet." + sess)).state; return w.transactions.filter((t) => t.type === "open").length > n; }, before.opens.length, { timeout: 10000 });
  await page.waitForSelector(".v-reveal-result", { timeout: 10000 }); await sleep(500);
  const after = await s.ledger(page);
  check("x3", "전부 USDT 결과면 주 단추가 한 번 더 언박싱이고, 누르면 같은 수량으로 한 번 더 연다(구매 +1, 기록 +5)", after.opens.length === before.opens.length + 1 && after.items.length === before.items.length + 5, { opens: after.opens.length, items: after.items.length });
  await page.locator(".v-reveal .v-links .v-link", { hasText: "박스로 돌아가기" }).click(); await sleep(300);
  check("x3", "박스로 돌아가기: 결과 화면이 닫힌다", (await page.locator(".v-reveal").count()) === 0);
  await s.context.close();
});

// x4: 후기 사진 붙이기
await run("x4", async () => {
  const s = await session({ preset: "inventory", view: "mobile" });
  const page = await s.open("/ko/inventory/");
  await page.waitForSelector(".v-itemrow");
  await page.locator(".v-itemrow", { hasText: "$950" }).click(); await page.waitForSelector(".v-sheet .v-rowlink"); await sleep(300);
  await page.locator(".v-sheet .v-rowlink").click(); await page.waitForSelector(".v-sheet textarea"); await sleep(300);
  await page.locator(".v-sheet input[type='file']").setInputFiles(path.join(REPO, "web/app/icon.svg"));
  await sleep(800);
  const afterSvg = { preview: await page.locator(".v-sheet .v-review-photo img").count(), fail: await page.locator(".v-sheet .v-line--fail").allInnerTexts() };
  check("x4", "사진 칸에 그림 파일을 넣으면 미리 보기가 뜬다(또는 읽지 못했다는 한 줄)", afterSvg.preview === 1 || afterSvg.fail.length === 1, afterSvg);
  await page.locator(".v-sheet input[type='file']").setInputFiles({ name: "not-an-image.txt", mimeType: "text/plain", buffer: Buffer.from("hello") });
  await sleep(600);
  check("x4", "그림이 아닌 파일: 읽지 못했다는 한 줄", (await page.locator(".v-sheet .v-line--fail").allInnerTexts()).includes("사진을 읽지 못했습니다. 다른 파일을 고릅니다."), await page.locator(".v-sheet .v-line--fail").allInnerTexts());
  await s.shot(page, "12-x4-review-photo");
  await s.context.close();
});

await save();
