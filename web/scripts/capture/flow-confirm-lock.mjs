// 확인창의 열린 직후 잠금(migration-audit/PARITY_ISSUES.md E-08).
// 모바일 폭에서 상품 상세의 "USDT로 받기" 단추와 확인창의 확정 단추가 같은 자리에 온다. 같은 자리를 빠르게 두 번 누르면
// 둘째 누름이 확정이 되어, 확인창의 글을 보기 전에 받아졌다. 확인창이 뜬 뒤 0.35초(결과 화면의 잠금과 같은 길이)는 확정 단추가 눌리지 않는다.
//   CAPTURE_BASE=http://localhost:3003 node scripts/capture/flow-confirm-lock.mjs [출력 폴더]
// 보는 것: 폭 390 과 320 에서 간격 90, 250ms 의 두 번 누름이 확정되지 않는다. 잠금이 지난 뒤의 누름은 확정된다.
//   단추의 모양과 상태(disabled 아님)는 잠긴 동안에도 같다. 키보드로 확정할 수 있다. 취소와 Esc 는 잠기지 않는다.
//   같은 확인창을 쓰는 다른 자리(로그아웃, 배송 신청)도 잠금 뒤에 눌린다. 출금 취소는 flow-withdraw.mjs, 묶음 받기와 큰 금액 열기는 flow-take.mjs 와 opening-qa.mjs 가 본다.
// 심는 상태는 states.mjs 의 inventory(보관 상품 둘: 받을 금액 950 과 521.55).
import { chromium } from "playwright";
import fs from "node:fs";
import { installState, makeState } from "./states.mjs";

const out = process.argv[2];
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
if (out) fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const check = (scenario, name, pass, detail = "") => { results.push({ scenario, name, pass: !!pass, detail }); console.log((pass ? "PASS " : "FAIL ") + scenario + " " + name + (detail ? "  " + detail : "")); };
/** 잠금의 길이(lib/openingFlow 의 OPENING_ARM_DELAY_MS 와 같다)보다 넉넉히 긴 기다림 */
const AFTER_LOCK = 500;
const CONFIRM = '[role="alertdialog"] .v-btn';

async function session({ width = 390, height = 844, path = "/ko/inventory" } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR", reducedMotion: "reduce" });
  await installState(context, await makeState("inventory", "ko"), new URL(base).origin);
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
  await page.goto(base + path, { waitUntil: "networkidle" });
  const ledger = () => page.evaluate(() => {
    const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null")?.state ?? null; } catch { return null; } };
    const w = read(keys.find((k) => k && k.includes("voila.browser-wallet.") && !k.endsWith(".guest"))); const inv = read(keys.find((k) => k && k.includes("voila.browser-inventory.") && !k.endsWith(".guest")));
    return { balance: w?.balance ?? null, sellbacks: (w?.transactions ?? []).filter((t) => t.type === "sellback").map((t) => t.amountUsdt), sold: (inv?.items ?? []).filter((i) => i.status === "SOLD").length,
      session: keys.some((k) => k && k.endsWith("voila.browser-session.v1")) };
  });
  const center = async (selector) => { const b = await page.locator(selector).boundingBox(); return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) }; };
  const dialogOpen = async () => (await page.locator('[role="alertdialog"]').count()) === 1;
  /** 상품 상세를 열고 주 단추(USDT로 받기)의 가운데 좌표를 돌려준다 */
  const openItem = async () => { await page.waitForSelector(".v-itemrow"); await page.locator(".v-itemrow").first().click(); await page.waitForSelector(".v-sheet [data-take-primary]"); await page.waitForTimeout(350); return center(".v-sheet [data-take-primary]"); };
  return { context, page, errors, ledger, center, dialogOpen, openItem, shot: (name) => (out ? page.screenshot({ path: `${out}/${name}.png` }) : null) };
}
const run = async (id, fn) => { try { await fn(); } catch (e) { check(id, "시나리오 실행", false, String(e).slice(0, 240)); } };

// a: 같은 자리를 빠르게 두 번 누른다(폭 390 과 320, 간격 90 과 250ms)
for (const [width, height] of [[390, 844], [320, 640]]) for (const gap of [90, 250]) {
  const id = `a-${width}-${gap}`;
  await run(id, async () => {
    const s = await session({ width, height });
    const at = await s.openItem();
    await s.page.touchscreen.tap(at.x, at.y); await s.page.waitForTimeout(gap); await s.page.touchscreen.tap(at.x, at.y);
    await s.page.waitForTimeout(900); await s.shot(`${id}-after-double-tap`);
    const confirmAt = (await s.dialogOpen()) ? await s.center(CONFIRM) : null;
    let l = await s.ledger();
    check(id, "두 번 누른 자리에 확정 단추가 온다(같은 자리라서 생기는 문제다)", !!confirmAt && Math.abs(confirmAt.x - at.x) <= 4 && Math.abs(confirmAt.y - at.y) <= 12, `주 단추 y ${at.y}, 확정 단추 y ${confirmAt?.y ?? "없음"}`);
    check(id, "빠르게 두 번 눌러도 받아지지 않고 확인창이 떠 있다", l.sold === 0 && l.sellbacks.length === 0 && (await s.dialogOpen()), JSON.stringify(l));
    const text = (await s.page.locator('[role="alertdialog"]').innerText().catch(() => "")).replace(/\s+/g, " ");
    check(id, "확인창의 글이 그대로 보인다", text.includes("받은 뒤에는 배송으로 바꿀 수 없습니다"), text.slice(0, 120));
    // 확인창을 보고 나서 누르는 누름은 확정이다
    await s.page.touchscreen.tap(at.x, at.y);
    await s.page.waitForSelector('[role="alertdialog"]', { state: "detached", timeout: 8000 }); await s.page.waitForTimeout(500);
    l = await s.ledger();
    check(id, "잠금이 지난 뒤 한 번 더 누르면 한 번만 받아진다", l.sold === 1 && l.sellbacks.length === 1, JSON.stringify(l));
    check(id, "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
    await s.context.close();
  });
}

// b: 잠금의 길이. 0.35초가 지난 뒤(간격 600ms)의 둘째 누름은 확정이다. 잠금은 확인창이 뜬 직후의 짧은 동안만이다
await run("b", async () => {
  const s = await session();
  const at = await s.openItem();
  await s.page.touchscreen.tap(at.x, at.y); await s.page.waitForTimeout(600); await s.page.touchscreen.tap(at.x, at.y);
  await s.page.waitForTimeout(1200);
  const l = await s.ledger();
  check("b", "간격 600ms 의 둘째 누름은 잠금(0.35초) 뒤라서 확정된다", l.sold === 1 && l.sellbacks.length === 1, JSON.stringify(l));
  await s.context.close();
});

// c: 잠긴 동안에도 단추의 모양과 상태는 같다. 키보드로 확정할 수 있고, 취소와 Esc 는 잠기지 않는다
await run("c", async () => {
  const s = await session();
  const look = () => s.page.evaluate((sel) => { const b = document.querySelector(sel); const c = getComputedStyle(b); const r = b.getBoundingClientRect();
    return { disabled: b.disabled, ariaDisabled: b.getAttribute("aria-disabled"), busy: b.getAttribute("data-busy"), tabIndex: b.tabIndex, text: b.textContent, background: c.backgroundColor, color: c.color, opacity: c.opacity, cursor: c.cursor, pointerEvents: c.pointerEvents, rect: [r.x, r.y, r.width, r.height].map(Math.round).join(",") }; }, CONFIRM);
  const at = await s.openItem();
  // 손가락으로 연다(마우스로 열면 포인터가 확정 단추 위에 남아 올려놓은 색으로 바뀐다. 잠금과 상관없는 차이다)
  await s.page.touchscreen.tap(at.x, at.y); await s.page.waitForSelector(CONFIRM);
  const locked = await look(); await s.shot("c1-locked");
  await s.page.waitForTimeout(AFTER_LOCK);
  const open = await look(); await s.shot("c2-after-lock");
  check("c", "잠긴 동안과 풀린 뒤의 단추가 같다(disabled 아님, 색, 자리, 글)", JSON.stringify(locked) === JSON.stringify(open) && locked.disabled === false && locked.ariaDisabled === null, JSON.stringify(locked) + " / " + JSON.stringify(open));
  // 취소는 잠기지 않는다: 다시 열어 곧바로 취소한다
  await s.page.locator('[role="alertdialog"] .v-link').click(); await s.page.waitForSelector('[role="alertdialog"]', { state: "detached" });
  await s.page.locator(".v-sheet [data-take-primary]").click(); await s.page.waitForSelector(CONFIRM);
  await s.page.evaluate(() => document.querySelector('[role="alertdialog"] .v-link').click());
  await s.page.waitForTimeout(150);
  check("c", "취소 링크는 뜬 직후에도 눌린다", !(await s.dialogOpen()) && (await s.ledger()).sold === 0);
  await s.page.locator(".v-sheet [data-take-primary]").click(); await s.page.waitForSelector(CONFIRM);
  await s.page.keyboard.press("Escape"); await s.page.waitForTimeout(150);
  check("c", "Esc 는 뜬 직후에도 닫는다", !(await s.dialogOpen()) && (await s.ledger()).sold === 0);
  // 키보드: 주 단추에서 Enter 로 확인창을 열고, 곧바로 Tab 과 Enter 를 눌러도 확정되지 않는다. 잠금 뒤의 Enter 는 확정이다
  await s.page.locator(".v-sheet [data-take-primary]").focus();
  await s.page.keyboard.press("Enter"); await s.page.waitForSelector(CONFIRM);
  // 창이 초점을 잡을 때까지 한 박자 둔다(lib/useModal 이 다음 프레임에 창으로 초점을 한 번 더 옮긴다). 아직 잠금 안이다
  await s.page.waitForTimeout(80);
  await s.page.keyboard.press("Tab"); await s.page.keyboard.press("Enter");
  await s.page.waitForTimeout(100);
  const focused = await s.page.evaluate((sel) => document.activeElement === document.querySelector(sel), CONFIRM);
  check("c", "키보드의 초점이 확정 단추에 간다(잠긴 동안에도 초점을 받는다)", focused);
  check("c", "뜬 직후의 Enter 는 확정이 아니다", (await s.dialogOpen()) && (await s.ledger()).sold === 0);
  await s.page.waitForTimeout(AFTER_LOCK); await s.page.keyboard.press("Enter");
  await s.page.waitForSelector('[role="alertdialog"]', { state: "detached", timeout: 8000 }); await s.page.waitForTimeout(500);
  const l = await s.ledger();
  check("c", "잠금 뒤의 Enter 는 확정이다(한 번만 받아진다)", l.sold === 1 && l.sellbacks.length === 1, JSON.stringify(l));
  check("c", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// d: 같은 확인창을 쓰는 다른 자리. 로그아웃
await run("d", async () => {
  const s = await session({ path: "/ko/account" });
  await s.page.getByRole("button", { name: "로그아웃", exact: true }).click(); await s.page.waitForSelector(CONFIRM);
  await s.page.evaluate((sel) => document.querySelector(sel).click(), CONFIRM); await s.page.waitForTimeout(150);
  check("d", "로그아웃 확인창: 뜬 직후의 누름은 확정이 아니다", (await s.dialogOpen()) && (await s.ledger()).session);
  await s.page.waitForTimeout(AFTER_LOCK); await s.page.locator(CONFIRM).click();
  await s.page.waitForSelector('[role="alertdialog"]', { state: "detached", timeout: 8000 }); await s.page.waitForTimeout(500);
  check("d", "로그아웃 확인창: 잠금 뒤의 누름으로 로그아웃된다", !(await s.ledger()).session);
  await s.context.close();
});

// e: 같은 확인창을 쓰는 다른 자리. 배송 신청(이 사이트는 서버가 없어 접수는 실패한다. 확정 단추가 접수를 일으키는지만 본다)
await run("e", async () => {
  const s = await session();
  await s.openItem();
  await s.page.locator(".v-sheet .v-link", { hasText: "배송 받기" }).click(); await s.page.waitForSelector(".v-sheet .v-input");
  await s.page.getByLabel("받는 사람", { exact: true }).fill("시험 수령인"); await s.page.getByLabel("휴대폰 번호", { exact: true }).fill("01000000000");
  await s.page.getByLabel("우편번호", { exact: true }).fill("00000"); await s.page.getByLabel("주소 (상세 주소까지)", { exact: true }).fill("시험 주소 1길 2, 3층 (시험)");
  await s.page.getByLabel("개인통관고유부호", { exact: false }).fill("P123456789012");
  await s.page.locator(".v-sheet .v-btn", { hasText: "배송 신청" }).click(); await s.page.waitForSelector(CONFIRM);
  await s.page.evaluate((sel) => document.querySelector(sel).click(), CONFIRM); await s.page.waitForTimeout(150);
  check("e", "배송 확인창: 뜬 직후의 누름은 확정이 아니다", (await s.dialogOpen()) && (await s.page.locator(CONFIRM).getAttribute("data-busy")) === null);
  await s.page.waitForTimeout(AFTER_LOCK); await s.page.locator(CONFIRM).click();
  await s.page.waitForSelector('[role="alertdialog"]', { state: "detached", timeout: 8000 }); await s.page.waitForTimeout(400); await s.shot("e1-ship-after-confirm");
  const text = (await s.page.locator(".v-sheet").innerText()).replace(/\s+/g, " ");
  check("e", "배송 확인창: 잠금 뒤의 누름은 접수를 일으킨다(서버가 없어 그 자리에 실패 한 줄이 뜬다)", text.includes("배송 신청을 접수하지 못했습니다"), text.slice(-120));
  await s.context.close();
});

await browser.close();
const failed = results.filter((r) => !r.pass);
if (out) fs.writeFileSync(`${out}/confirm-lock-results.json`, JSON.stringify(results, null, 2));
console.log(`\n검사 ${results.length}개, 통과 ${results.length - failed.length}, 실패 ${failed.length}`);
process.exit(failed.length ? 1 : 0);
