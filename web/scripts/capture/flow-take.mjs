// USDT로 받기 흐름의 화면 검수(flow/MELT_SPEC.md S1, S4, S5, S6, S7 과 5절의 R1~R12, R15). 실제 화면을 눌러 찍고, 돈과 상태는 숫자로 확인한다.
//   node scripts/capture/flow-take.mjs <출력 폴더> [--only a,b]
// 심는 상태는 states.mjs 의 inventory(보관 상품 둘: 참고가 1,000 과 549)다. 받을 금액은 950 과 521.55, 합 1,471.55.
// 실패, 일부만 받는 상태, 처리 상태를 알 수 없는 상태는 개발 서버에서만 켜지는 시험 스위치(sessionStorage "voila.opening.fault")로 만든다.
// 저장이 중간에 실패하는 경우의 돈 판정은 tests/takeFault.test.ts 가 본다(여기서는 화면의 글만 본다).
import { chromium } from "playwright";
import fs from "node:fs";
import { installState, makeState } from "./states.mjs";

const argv = process.argv.slice(2);
const out = argv[0];
const only = (argv.indexOf("--only") < 0 ? "" : argv[argv.indexOf("--only") + 1]).split(",").filter(Boolean);
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const check = (scenario, name, pass, detail = "") => { results.push({ scenario, name, pass: !!pass, detail }); console.log((pass ? "PASS " : "FAIL ") + scenario + " " + name + (detail ? "  " + detail : "")); };
const near = (a, b) => Math.abs(a - b) < 0.005;
const SELL = [950, 521.55]; const TOTAL = 1471.55;

async function session({ balance = 10000, preset = "inventory", path = "/ko/inventory", view = [390, 844], mutate = null } = {}) {
  const touch = view[0] < 1000;
  const context = await browser.newContext({ viewport: { width: view[0], height: view[1] }, deviceScaleFactor: touch ? 2 : 1, isMobile: touch, hasTouch: touch, locale: "ko-KR", reducedMotion: "reduce" });
  const state = await makeState(preset, "ko");
  for (const key of Object.keys(state.values).filter((k) => k === "gachaflix.wallet" || (k.startsWith("voila.browser-wallet.") && !k.endsWith(".guest")))) {
    const v = JSON.parse(state.values[key]); v.state.balance = balance; v.state.cryptoBalance = balance; state.values[key] = JSON.stringify(v);
  }
  // mutate: 심는 장부를 고친다(어긋난 장부를 만들 때). 보관함과 지갑의 모든 저장 키에 같은 값을 넣는다
  if (mutate) {
    const isInventory = (k) => k === "gachaflix.inventory" || (k.startsWith("voila.browser-inventory.") && !k.endsWith(".guest"));
    const isWallet = (k) => k === "gachaflix.wallet" || (k.startsWith("voila.browser-wallet.") && !k.endsWith(".guest"));
    const inventoryKey = Object.keys(state.values).find(isInventory); const walletKey = Object.keys(state.values).find(isWallet);
    const inv = JSON.parse(state.values[inventoryKey]); const wal = JSON.parse(state.values[walletKey]);
    mutate(inv.state, wal.state, state.values, Object.keys(state.values).filter(isWallet));
    for (const k of Object.keys(state.values)) { if (isInventory(k)) state.values[k] = JSON.stringify(inv); if (isWallet(k)) state.values[k] = JSON.stringify(wal); }
  }
  await installState(context, state, new URL(base).origin);
  const open = async (to = path) => { const page = await context.newPage(); await page.goto(base + to, { waitUntil: "networkidle" }); return page; };
  const page = await open();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
  const ledger = (p = page) => p.evaluate(() => {
    const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null")?.state ?? null; } catch { return null; } };
    const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    const pick = (p) => keys.find((k) => k && k.startsWith(p) && !k.endsWith(".guest"));
    const w = read(pick("voila.browser-wallet.") ?? "gachaflix.wallet"); const inv = read(pick("voila.browser-inventory.") ?? "gachaflix.inventory");
    const tx = w?.transactions ?? [];
    return { balance: w?.balance ?? null, crypto: w?.cryptoBalance ?? null, opens: tx.filter((t) => t.type === "open").length, withdraws: tx.filter((t) => t.type === "withdraw").length,
      sellbacks: tx.filter((t) => t.type === "sellback").map((t) => t.amountUsdt), sellbackIds: tx.filter((t) => t.type === "sellback").flatMap((t) => t.itemIds ?? []),
      soldIds: (inv?.items ?? []).filter((i) => i.status === "SOLD").map((i) => i.id), sold: (inv?.items ?? []).filter((i) => i.status === "SOLD").length, held: (inv?.items ?? []).filter((i) => i.status === "IN_STORAGE").length };
  });
  /** 선택 시트에서 고르고(all 이면 머리 행의 전체 선택, 아니면 첫 상품 하나) 확인창까지 확정한다. 확정 단추를 clicks 번 누른다 */
  const takeInSheet = async (p, { all = true, clicks = 1 } = {}) => {
    await p.waitForSelector(".v-sheet [data-take-row]"); await p.waitForTimeout(300);
    if (all) await p.locator(".v-sheet [data-take-all]").click(); else await p.locator(".v-sheet [data-take-row]").first().click();
    await p.locator("[data-take-submit]").click();
    // 확인창은 뜬 뒤 0.35초 동안 확정 단추가 눌리지 않는다(components/ui/Sheet.tsx 의 Confirm). 그보다 길게 기다린 뒤 누른다
    await p.waitForSelector('[role="alertdialog"] .v-btn'); await p.waitForTimeout(500);
    await p.evaluate((n) => { const b = document.querySelector('[role="alertdialog"] .v-btn'); for (let i = 0; i < n; i++) b.click(); }, clicks);
  };
  return { context, page, open, ledger, takeInSheet, errors, shot: (name, p = page) => p.screenshot({ path: `${out}/${name}.png` }) };
}
const run = async (id, fn) => { if (only.length && !only.includes(id)) return; try { await fn(); } catch (e) { check(id, "시나리오 실행", false, String(e).slice(0, 240)); } };
const sheetText = (p) => p.evaluate(() => [...document.querySelectorAll(".v-sheet")].map((e) => e.innerText).join(" ").replace(/\s+/g, " "));
const widthOf = (locator) => locator.evaluate((e) => Math.round(e.getBoundingClientRect().width));
const setFault = (p, value) => p.evaluate((v) => (v ? sessionStorage.setItem("voila.opening.fault", v) : sessionStorage.removeItem("voila.opening.fault")), value);

// a: 보관함의 선택 시트(S1, S5). 처음에는 아무것도 고르지 않았고, 확인을 연달아 눌러도 한 번만 지급한다
await run("a", async () => {
  const s = await session();
  await s.shot("a1-inventory");
  check("a", "보관 중 목록 위에 주 단추 USDT로 받기", (await s.page.locator("[data-take-batch]").innerText()) === "USDT로 받기");
  check("a", "시트를 여는 단추와 상품 행이 창을 연다고 알린다(aria-haspopup), 화살표는 읽히지 않는다", (await s.page.locator("[data-take-batch]").getAttribute("aria-haspopup")) === "dialog" && (await s.page.locator(".v-itemrow").first().getAttribute("aria-haspopup")) === "dialog" && (await s.page.locator(".v-itemrow .v-num [aria-hidden]").first().innerText()).trim() === "›");
  await s.page.locator("[data-take-batch]").click(); await s.page.waitForSelector(".v-sheet [data-take-row]"); await s.page.waitForTimeout(300); await s.shot("a2-take-sheet");
  check("a", "처음에는 아무것도 고르지 않았고 주 단추가 눌리지 않는다", (await s.page.locator(".v-sheet [data-take-row][aria-checked='true']").count()) === 0 && (await s.page.locator("[data-take-submit]").isDisabled()) && (await s.page.locator("[data-take-submit]").innerText()) === "상품을 선택합니다");
  check("a", "전체 선택은 목록 카드의 머리 행이다(밑줄 링크가 아니다)", (await s.page.locator(".v-sheet .v-itemrows > li").first().locator("[data-take-all]").count()) === 1 && (await s.page.locator("[data-take-all]").innerText()).includes("전체 선택") && (await s.page.locator(".v-sheet .v-link").count()) === 0 && (await s.page.locator("[data-take-all]").getAttribute("aria-checked")) === "false");
  await s.page.locator(".v-sheet [data-take-row]").first().click();
  check("a", "하나만 고르면 머리 행은 일부만 고른 상태다", (await s.page.locator("[data-take-all]").getAttribute("aria-checked")) === "mixed" && (await s.page.locator("[data-take-submit]").innerText()).startsWith("USDT로 받기 (1개, "));
  await s.page.locator("[data-take-all]").click(); await s.shot("a3-all-selected");
  check("a", "전체 선택하면 주 단추에 개수와 금액이 적힌다", (await s.page.locator("[data-take-submit]").innerText()) === "USDT로 받기 (2개, $1,471.55)" && (await s.page.locator("[data-take-all]").getAttribute("aria-checked")) === "true");
  await s.page.locator("[data-take-submit]").click(); await s.page.waitForSelector('[role="alertdialog"] .v-btn'); await s.page.waitForTimeout(500); await s.shot("a4-confirm");
  const confirm = await s.page.locator('[role="alertdialog"]').innerText();
  check("a", "확인창의 글(금액 뒤에 조사가 없다)", confirm.includes("상품 대신 잔액으로 받습니다. 받을 금액 $1,471.55. 받은 뒤에는 배송으로 바꿀 수 없습니다.") && confirm.includes("USDT로 받기 ($1,471.55)") && confirm.includes("취소"), confirm.replace(/\s+/g, " "));
  const cancelW = await widthOf(s.page.locator('[role="alertdialog"] .v-link'));
  check("a", "두 글자 링크(취소)의 누르는 자리가 가로 44px 이상이다", cancelW >= 44, `${cancelW}px`);
  const before = await s.ledger();
  await s.page.locator('[role="alertdialog"] .v-link').click();
  check("a", "취소하면 돈이 움직이지 않는다", near((await s.ledger()).balance, before.balance) && (await s.ledger()).held === 2);
  await s.page.locator("[data-take-submit]").click(); await s.page.waitForSelector('[role="alertdialog"] .v-btn'); await s.page.waitForTimeout(500);
  await s.page.evaluate(() => { const b = document.querySelector('[role="alertdialog"] .v-btn'); b.click(); b.click(); b.click(); });
  await s.page.waitForSelector("[data-take-done]", { timeout: 5000 }); await s.shot("a5-done");
  const l = await s.ledger();
  check("a", "확정을 세 번 눌러도 한 번만 지급한다: 잔액 11,471.55, 거래 기록 하나", near(l.balance, 10000 + TOTAL) && l.sellbacks.length === 1 && near(l.sellbacks[0], TOTAL) && l.sold === 2 && l.held === 0, JSON.stringify(l));
  check("a", "받기 거래 기록에 받은 상품의 id 가 남는다", l.sellbackIds.length === 2 && l.soldIds.every((id) => l.sellbackIds.includes(id)), JSON.stringify(l.sellbackIds));
  check("a", "결과 한 줄", (await sheetText(s.page)).includes("잔액에 $1,471.55 넣었습니다."));
  await s.page.locator("[data-take-done]").click(); await s.page.waitForTimeout(300);
  check("a", "닫으면 보관함 그대로이고, 보관 중인 상품이 없으면 단추도 없다", (await s.page.locator(".v-scrim").count()) === 0 && (await s.page.locator("[data-take-batch]").count()) === 0);
  check("a", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// b: 두 탭. 한 탭에서 받은 뒤, 옛 장부를 들고 있는 다른 탭에서 같은 상품을 받아도 다시 지급하지 않는다
await run("b", async () => {
  const s = await session();
  const other = await s.open();
  await s.page.locator("[data-take-batch]").click(); await s.takeInSheet(s.page);
  await s.page.waitForSelector("[data-take-done]", { timeout: 5000 });
  // 다른 탭은 새로 고치지 않았다. 그 탭의 화면에는 아직 보관 중인 상품 둘이 보인다
  await other.locator("[data-take-batch]").click(); await s.takeInSheet(other);
  await other.waitForSelector("[data-take-done]", { timeout: 5000 }); await s.shot("b1-other-tab", other);
  const l = await s.ledger(); const t = await sheetText(other);
  check("b", "두 탭에서 한 번씩 눌러도 지급은 한 번: 잔액 11,471.55, 거래 기록 하나", near(l.balance, 10000 + TOTAL) && l.sellbacks.length === 1 && l.sold === 2, JSON.stringify(l));
  check("b", "다른 탭은 이미 받은 상품이라고 말하고 금액을 다시 적지 않는다", t.includes("이미 USDT로 받은 상품입니다") && !/잔액에 \S+ 넣었습니다\./.test(t), t.slice(0, 120));
  await s.context.close();
});

// c: 일부만 됐을 때, 실패했을 때, 처리 상태를 알 수 없을 때(S1 의 상태, R8)
await run("c", async () => {
  let s = await session();
  await setFault(s.page, "settle-partial");
  await s.page.locator("[data-take-batch]").click(); await s.takeInSheet(s.page);
  await s.page.waitForFunction(() => /남은 상품/.test(document.querySelector(".v-sheet")?.innerText || ""), null, { timeout: 5000 }); await s.shot("c1-partial");
  let l = await s.ledger(); let t = await sheetText(s.page);
  check("c", "일부만: 된 것과 남은 것을 나눠 보여 주고 받은 만큼만 말한다", l.sold === 1 && l.held === 1 && l.sellbacks.length === 1 && near(l.balance, 10000 + l.sellbacks[0]) && t.includes("받은 상품 1개") && t.includes("남은 상품 1개") && t.includes("1개는 받지 못했습니다") && /다시 시도/.test(t), t.slice(0, 200));
  await setFault(s.page, null);
  await s.page.locator("[data-take-retry]").click();
  await s.page.waitForSelector("[data-take-done]", { timeout: 5000 }); await s.shot("c2-partial-retried");
  l = await s.ledger(); t = await sheetText(s.page);
  check("c", "다시 시도하면 남은 것만 받는다: 합이 1,471.55, 시트는 받은 것을 모두 합쳐 말한다", near(l.balance, 10000 + TOTAL) && l.sold === 2 && l.sellbacks.length === 2 && near(l.sellbacks[0] + l.sellbacks[1], TOTAL) && t.includes("잔액에 $1,471.55 넣었습니다."), JSON.stringify(l));
  await s.context.close();

  s = await session();
  await setFault(s.page, "settle-failed");
  await s.page.locator("[data-take-batch]").click(); await s.takeInSheet(s.page);
  await s.page.waitForSelector(".v-sheet .v-line--fail", { timeout: 5000 }); await s.shot("c3-failed");
  l = await s.ledger(); t = await sheetText(s.page);
  check("c", "실패: 돈이 움직이지 않고 상품은 보관함에 있다고 말한다", near(l.balance, 10000) && l.held === 2 && l.sellbacks.length === 0 && t.includes("USDT로 받지 못했습니다. 상품은 보관함에 있습니다.") && /다시 시도/.test(t), t.slice(0, 160));
  await setFault(s.page, null);
  await s.page.locator("[data-take-retry]").click();
  await s.page.waitForSelector("[data-take-done]", { timeout: 5000 });
  l = await s.ledger();
  check("c", "실패 뒤 다시 시도하면 한 번만 지급한다", near(l.balance, 10000 + TOTAL) && l.sellbacks.length === 1 && l.sold === 2, JSON.stringify(l));
  await s.context.close();

  s = await session();
  await setFault(s.page, "settle-unknown");
  await s.page.locator("[data-take-batch]").click(); await s.takeInSheet(s.page);
  await s.page.waitForSelector(".v-sheet .v-line--fail", { timeout: 5000 }); await s.shot("c4-unknown");
  l = await s.ledger(); t = await sheetText(s.page);
  check("c", "알 수 없음: 받았다고도, 보관함에 있다고도 말하지 않는다", t.includes("처리 상태를 확인하지 못했습니다. 보관함과 지갑 내역에서 확인할 수 있습니다.") && !t.includes("상품은 보관함에 있습니다") && !/잔액에 \S+ 넣었습니다/.test(t), t.slice(0, 160));
  check("c", "알 수 없음: 다시 시도 단추가 없고(스스로 다시 지급하지 않는다), 보관함과 지갑 내역으로 가는 링크 둘", (await s.page.locator("[data-take-retry]").count()) === 0 && (await s.page.locator(".v-sheet .v-btn").count()) === 1 && (await s.page.locator(".v-sheet .v-links .v-link").allInnerTexts()).join("|") === "보관함|지갑 내역" && near(l.balance, 10000) && l.sellbacks.length === 0, JSON.stringify(l));
  await s.context.close();
});

// d: 잔액이 모자랄 때(S4, R3). 보관 상품을 전부 받아 채워질 때만 주 단추가 USDT로 받기다. 받은 뒤에도 수량은 그대로이고 열기는 스스로 실행되지 않는다
await run("d", async () => {
  let s = await session({ balance: 0.25, path: "/ko/box/dollar-apple" });
  await s.page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  await s.page.locator(".v-openbar .v-chip").nth(1).click(); await s.page.waitForTimeout(200); await s.shot("d1-short-covered");
  let bar = (await s.page.locator(".v-openbar").innerText()).replace(/\s+/g, " ");
  check("d", "채워질 때: 한 줄, 주 단추 USDT로 받기, 받을 수 있는 최대 금액, 충전 링크", bar.includes("잔액 $0.25. $4.75 더 필요합니다.") && (await s.page.locator("[data-short-take]").innerText()) === "USDT로 받기" && bar.includes("보관함의 상품 2개를 USDT로 받으면 최대 $1,471.55까지 들어옵니다.") && (await s.page.locator(".v-openbar .v-link").innerText()) === "USDT 충전하기" && (await s.page.locator(".v-openbar .v-btn").count()) === 1, bar);
  await s.page.locator("[data-short-take]").click(); await s.takeInSheet(s.page, { all: false });
  await s.page.waitForSelector("[data-take-done]", { timeout: 5000 }); await s.shot("d2-taken");
  await s.page.locator("[data-take-done]").click(); await s.page.waitForTimeout(1200); await s.shot("d3-back-to-box");
  let l = await s.ledger(); bar = (await s.page.locator(".v-openbar").innerText()).replace(/\s+/g, " ");
  check("d", "하나만 골라 받았다: 그 금액만 들어오고 나머지는 보관 중", l.sold === 1 && l.held === 1 && l.sellbacks.length === 1 && SELL.some((x) => near(l.balance, 0.25 + x)), JSON.stringify(l));
  check("d", "받은 뒤 열기는 스스로 실행되지 않는다(구매 0건, 결과 화면 없음)", l.opens === 0 && (await s.page.locator(".v-op, .v-reveal").count()) === 0);
  check("d", "수량은 그대로(5개)이고 주 단추가 가격이 적힌 열기로 돌아온다", (await s.page.locator("[data-open-primary]").innerText()) === "5개 언박싱 $5" && (await s.page.locator(".v-openbar .v-chip[aria-pressed='true']").innerText()) === "5개", bar);
  await s.context.close();

  // 다 받아도 모자라면(50달러 박스 100개, 5,000 이 필요한데 받을 수 있는 것은 1,471.55) 충전이 주 단추이고 USDT로 받기는 링크다
  s = await session({ balance: 0.25, path: "/ko/box/vault-gold" });
  await s.page.waitForSelector(".v-openbar .v-btn:not([disabled])");
  await s.page.locator(".v-openbar .v-chip").nth(4).click(); await s.page.waitForTimeout(200); await s.shot("d4-short-not-covered");
  bar = (await s.page.locator(".v-openbar").innerText()).replace(/\s+/g, " ");
  check("d", "채워지지 않을 때: 주 단추 USDT 충전하기, 보조 링크 USDT로 받기, 한 줄은 그대로", (await s.page.locator(".v-openbar .v-btn").allInnerTexts()).join("|") === "USDT 충전하기" && (await s.page.locator(".v-openbar .v-link").allInnerTexts()).join("|") === "USDT로 받기" && bar.includes("$4,999.75 더 필요합니다.") && bar.includes("보관함의 상품 2개를 USDT로 받으면 최대 $1,471.55까지 들어옵니다."), bar);
  await s.page.locator(".v-openbar .v-link").click(); await s.page.waitForSelector(".v-sheet [data-take-row]"); await s.page.waitForTimeout(300); await s.shot("d5-take-from-link");
  l = await s.ledger();
  check("d", "링크는 선택 시트를 연다(아무것도 고르지 않은 채, 돈은 움직이지 않았다)", (await s.page.locator(".v-sheet [data-take-row]").count()) === 2 && (await s.page.locator(".v-sheet [data-take-row][aria-checked='true']").count()) === 0 && near(l.balance, 0.25) && l.opens === 0);
  await s.context.close();

  s = await session({ balance: 0.25, preset: "funded", path: "/ko/box/dollar-apple" });
  await s.page.waitForSelector(".v-openbar .v-btn:not([disabled])"); await s.shot("d6-short-no-items");
  check("d", "보관 중인 상품이 없으면 지금처럼 주 단추 USDT 충전하기", (await s.page.locator("[data-short-charge]").innerText()) === "USDT 충전하기" && (await s.page.locator("[data-short-take]").count()) === 0 && (await s.page.locator(".v-openbar .v-link").count()) === 0);
  await s.context.close();
});

// e: 보관함의 상품 상세(S5, R5). 주 단추는 USDT로 받기, 배송은 밑줄 링크, 후기 쓰기는 정보 카드의 마지막 행
await run("e", async () => {
  let s = await session();
  await s.page.locator(".v-itemrow").first().click(); await s.page.waitForSelector(".v-sheet [data-take-primary]"); await s.page.waitForTimeout(300); await s.shot("e1-item-sheet");
  // 주 단추(흰 알약)는 하나다. 조용한 단추는 업그레이드 하나뿐이다(flow/RESTORE_SPEC.md U7)
  const main = await s.page.locator(".v-sheet .v-btn:not(.v-btn--quiet)").allInnerTexts(); const quiet = await s.page.locator(".v-sheet .v-btn--quiet").allInnerTexts(); const links = await s.page.locator(".v-sheet .v-links .v-link").allInnerTexts();
  check("e", "주 단추 하나(USDT로 받기), 밑줄 링크 둘(배송 받기, 개봉 결과 검증)", main.length === 1 && main[0] === "USDT로 받기 ($950)" && quiet.join("|") === "업그레이드" && links.join("|") === "배송 받기|개봉 결과 검증", main.join("|") + " / " + quiet.join("|") + " / " + links.join("|"));
  const review = await s.page.evaluate(() => {
    const card = document.querySelector(".v-sheet .v-rows"); const row = card?.lastElementChild; const link = row?.querySelector(".v-rowlink"); const btn = document.querySelector(".v-sheet .v-btn");
    return { cards: document.querySelectorAll(".v-sheet .v-rows").length, inLastRow: !!link, text: (link?.textContent || "").trim(), above: !!link && !!btn && link.getBoundingClientRect().bottom <= btn.getBoundingClientRect().top, h: link ? Math.round(link.getBoundingClientRect().height) : 0, w: link ? Math.round(link.getBoundingClientRect().width) : 0 };
  });
  check("e", "후기 쓰기는 정보 카드의 마지막 행이고 주 단추 위에 있다(따로 뜬 카드가 아니다)", review.cards === 1 && review.inLastRow && review.text.startsWith("후기 쓰기") && review.above && review.h >= 44 && review.w >= 44, JSON.stringify(review));
  await s.page.locator(".v-sheet .v-links .v-link").first().click(); await s.page.waitForTimeout(500); await s.shot("e2-ship-sheet");
  check("e", "배송 받기 링크는 배송 시트를 연다(가는 길은 여기 하나)", (await sheetText(s.page)).includes("배송 신청"));
  await s.page.locator(".v-sheet-close").last().click(); await s.page.waitForTimeout(300);
  await s.page.locator(".v-sheet [data-take-primary]").click(); await s.page.waitForSelector('[role="alertdialog"] .v-btn'); await s.page.waitForTimeout(500);
  await s.page.evaluate(() => { const b = document.querySelector('[role="alertdialog"] .v-btn'); b.click(); b.click(); });
  await s.page.waitForFunction(() => !document.querySelector(".v-scrim"), null, { timeout: 5000 }); await s.shot("e3-item-taken");
  let l = await s.ledger();
  check("e", "상품 하나를 받는다: 두 번 눌러도 한 번만", near(l.balance, 10950) && l.sellbacks.length === 1 && l.sold === 1 && l.held === 1, JSON.stringify(l));
  await s.context.close();

  // 한 개 받기도 같은 판정이다: 처리 상태를 알 수 없으면 그 상세 안에 한 줄로 알린다
  s = await session();
  await setFault(s.page, "settle-unknown");
  await s.page.locator(".v-itemrow").first().click(); await s.page.waitForSelector(".v-sheet [data-take-primary]"); await s.page.waitForTimeout(300);
  await s.page.locator(".v-sheet [data-take-primary]").click(); await s.page.waitForSelector('[role="alertdialog"] .v-btn'); await s.page.waitForTimeout(500);
  await s.page.locator('[role="alertdialog"] .v-btn').click();
  await s.page.waitForSelector(".v-sheet .v-line--fail", { timeout: 5000 }); await s.shot("e4-item-unknown");
  l = await s.ledger(); const t = await sheetText(s.page);
  check("e", "한 개 받기의 알 수 없음: 상세 안에 한 줄, 돈은 그대로", t.includes("처리 상태를 확인하지 못했습니다. 보관함과 지갑 내역에서 확인할 수 있습니다.") && !t.includes("USDT로 받지 못했습니다") && near(l.balance, 10000) && l.held === 2, t.slice(0, 160));
  await s.context.close();
});

// f: 잔액 시트(S6). 머리줄의 잔액을 누르면 지갑 화면으로 가지 않고 시트가 열린다. 시트는 겹쳐 쌓이지 않는다
await run("f", async () => {
  let s = await session({ path: "/ko" });
  check("f", "머리의 잔액 단추와 메뉴 단추가 창을 연다고 알린다(aria-haspopup, 메뉴는 aria-expanded)", (await s.page.locator("[data-balance-open]").getAttribute("aria-haspopup")) === "dialog" && (await s.page.locator(".v-menu-btn").getAttribute("aria-haspopup")) === "dialog" && (await s.page.locator(".v-menu-btn").getAttribute("aria-expanded")) === "false");
  await s.page.locator("[data-balance-open]").click(); await s.page.waitForSelector(".v-sheet"); await s.page.waitForTimeout(300); await s.shot("f1-balance-sheet");
  let t = await sheetText(s.page);
  check("f", "주소는 그대로이고 잔액 시트가 열린다", new URL(s.page.url()).pathname === "/ko" && t.startsWith("잔액"), s.page.url());
  check("f", "행 셋과 주 단추 USDT로 받기, 보조 USDT 충전하기와 출금", t.includes("개봉에 쓸 잔액 $10,000") && t.includes("출금할 수 있는 잔액 $10,000") && t.includes("보관 중인 상품 2개 USDT로 받으면 $1,471.55") && (await s.page.locator(".v-sheet .v-btn").allInnerTexts()).join("|") === "USDT로 받기" && (await s.page.locator(".v-sheet .v-links .v-link").allInnerTexts()).join("|") === "USDT 충전하기|출금", t);
  const withdrawW = await widthOf(s.page.locator(".v-sheet .v-links .v-link").nth(1));
  check("f", "두 글자 링크(출금)의 누르는 자리가 가로 44px 이상이다", withdrawW >= 44, `${withdrawW}px`);
  await s.page.locator("[data-balance-take]").click(); await s.page.waitForSelector(".v-sheet [data-take-row]"); await s.page.waitForTimeout(300); await s.shot("f2-take-in-place");
  check("f", "USDT로 받기를 누르면 같은 자리에서 선택 시트로 바뀐다(시트 하나, 아무것도 고르지 않은 채)", (await s.page.locator(".v-scrim").count()) === 1 && (await s.page.locator(".v-sheet [data-take-row][aria-checked='true']").count()) === 0);
  await s.page.locator(".v-sheet-close").click(); await s.page.waitForTimeout(300);
  check("f", "닫으면 보던 화면 그대로", (await s.page.locator(".v-scrim").count()) === 0 && new URL(s.page.url()).pathname === "/ko");
  await s.page.locator("[data-balance-open]").click(); await s.page.waitForSelector(".v-sheet"); await s.page.waitForTimeout(300);
  await s.page.locator(".v-sheet .v-links .v-link").first().click(); await s.page.waitForTimeout(700); await s.shot("f3-charge-in-place");
  t = await sheetText(s.page);
  check("f", "USDT 충전하기를 누르면 같은 자리에서 충전 시트로 바뀐다(시트 하나)", (await s.page.locator(".v-scrim").count()) === 1 && t.startsWith("USDT 충전"), t.slice(0, 60));
  await s.context.close();

  s = await session({ preset: "funded", path: "/ko" });
  await s.page.locator("[data-balance-open]").click(); await s.page.waitForSelector(".v-sheet"); await s.page.waitForTimeout(300); await s.shot("f4-balance-no-items");
  check("f", "보관 중인 상품이 없으면 주 단추 USDT 충전하기, 보조 출금과 지갑 내역", (await s.page.locator(".v-sheet .v-btn").allInnerTexts()).join("|") === "USDT 충전하기" && (await s.page.locator(".v-sheet .v-links .v-link").allInnerTexts()).join("|") === "출금|지갑 내역");
  await s.page.locator(".v-sheet .v-links .v-link").first().click(); await s.page.waitForURL("**/wallet/withdraw", { timeout: 15000 });
  check("f", "출금을 누르면 출금 화면으로 가고 시트는 닫힌다", (await s.page.locator(".v-scrim").count()) === 0);
  await s.context.close();

  // 로그인 전에는 머리의 단추가 로그인 창을 바로 연다(R12)
  s = await session({ preset: "guest", path: "/ko" });
  check("f", "로그인 전: 머리에 잔액 단추가 없고 로그인 단추가 있다", (await s.page.locator("[data-balance-open]").count()) === 0 && (await s.page.locator(".v-header .v-headbtn").first().innerText()) === "로그인");
  await s.context.close();
});

// g: 출금 화면(S7, R6). 받은 뒤 돌아오면 새로 받은 금액 가운데 출금할 수 있는 몫만 금액 칸에 채워진다. 출금은 스스로 나가지 않는다
await run("g", async () => {
  const s = await session({ balance: 10, path: "/ko/wallet/withdraw" });
  await s.page.getByText("이메일 인증으로 출금", { exact: false }).click(); await s.page.waitForSelector("form .v-input"); await s.shot("g1-withdraw-form");
  const amount = s.page.locator("form .v-input").nth(1);
  const link = s.page.getByText("보관함의 상품을 USDT로 받아 출금하기", { exact: true });
  const place = await s.page.evaluate(() => {
    const y = (sel) => document.querySelector(sel)?.getBoundingClientRect();
    const link = [...document.querySelectorAll("form .v-link")].find((e) => e.textContent.includes("받아 출금하기"))?.getBoundingClientRect();
    return { belowDesc: !!link && link.top >= y("form .v-desc").bottom - 12, aboveChips: !!link && link.bottom <= y("form .v-chips").top + 12, aboveInputs: !!link && link.bottom <= y("form .v-input").top };
  });
  check("g", "링크는 화면 설명 바로 아래, 네트워크 선택 위에 있다(입력 칸 사이가 아니다)", (await link.count()) === 1 && place.belowDesc && place.aboveChips && place.aboveInputs && (await amount.inputValue()) === "", JSON.stringify(place));
  // 먼저 하나만 받는다
  await link.click(); await s.takeInSheet(s.page, { all: false });
  await s.page.waitForSelector("[data-take-done]", { timeout: 5000 }); await s.shot("g2-taken");
  check("g", "다 받은 뒤의 주 단추는 출금으로 돌아가기", (await s.page.locator("[data-take-done]").innerText()) === "출금으로 돌아가기");
  await s.page.locator("[data-take-done]").click(); await s.page.waitForTimeout(400); await s.shot("g3-prefilled");
  let l = await s.ledger(); const first = l.sellbacks[0];
  check("g", "금액 칸에는 새로 받은 금액만 들어간다(원래 있던 10 은 넣지 않는다)", SELL.some((x) => near(x, first)) && near(Number(await amount.inputValue()), first) && near(l.crypto, 10 + first), `input ${await amount.inputValue()} crypto ${l.crypto}`);
  let form = (await s.page.locator("form").innerText()).replace(/\s+/g, " ");
  check("g", "채운 것을 한 줄로 말한다(금액 뒤에 조사가 없다)", form.includes("방금 받은 금액 가운데 출금할 수 있는 몫을 금액 칸에 넣었습니다. 넣은 금액 $" + first.toLocaleString("en-US") + "."), form.slice(0, 220));
  // 시트를 다시 열어 나머지를 받으면 앞서 넣은 금액에 더해진다(마지막 것으로 덮어쓰지 않는다)
  await link.click(); await s.takeInSheet(s.page);
  await s.page.waitForSelector("[data-take-done]", { timeout: 5000 }); await s.page.locator("[data-take-done]").click(); await s.page.waitForTimeout(400); await s.shot("g4-prefilled-twice");
  l = await s.ledger(); form = (await s.page.locator("form").innerText()).replace(/\s+/g, " ");
  check("g", "두 번에 나눠 받아도 금액 칸은 새로 받은 합 1,471.55 다", (await amount.inputValue()) === "1471.55" && near(l.crypto, 10 + TOTAL) && form.includes("넣은 금액 $1,471.55."), `input ${await amount.inputValue()} crypto ${l.crypto}`);
  check("g", "출금은 스스로 나가지 않는다", l.withdraws === 0 && l.sellbacks.length === 2);
  await amount.fill("100");
  check("g", "사람이 고칠 수 있고, 고치면 그 한 줄은 사라진다", (await amount.inputValue()) === "100" && !(await s.page.locator("form").innerText()).includes("금액 칸에 넣었습니다"));
  check("g", "보관 중인 상품이 없으면 링크도 없다", (await link.count()) === 0);
  await s.context.close();
});

// h: 장부가 어긋난 상품(flow/REVIEW_codex-2.md 4.3, 5.2, REVIEW_codex-3.md 3.1).
//    첫 상품: 받다가 멈춘 흔적. 받은 상태로 저장됐는데 입금 내역이 없고 확인 대기 표시가 남아 있다.
//    둘째 상품: 보관 중인데 그 상품을 가리키는 입금 내역이 있다.
//    어느 화면도 "USDT로 받음"이나 "받은 금액"이라고 적지 않고, 받을 수 있는 것으로 세지 않고, 받기 단추를 주지 않는다
const broken = (inventory, wallet, values, walletKeys) => {
  const now = new Date().toISOString();
  const [first, second] = inventory.items;
  // 확인 대기 표시(lib/takeBatch): 계정의 지갑 저장 키에 묶인 작은 키. 표시를 적을 때의 저장된 지갑도 함께 적혀 있다
  const mark = JSON.stringify([{ ids: [first.id], c: wallet.cryptoBalance, d: wallet.cardBalance ?? 0, n: wallet.transactions.length, l: wallet.transactions[0]?.id ?? null }]);
  for (const key of walletKeys) values["voila.take-unconfirmed." + key] = mark;
  Object.assign(first, { status: "SOLD", soldForUsdt: 950, soldAt: now, openingId: "op_capture_broken" });
  Object.assign(second, { openingId: "op_capture_broken" });
  wallet.transactions.unshift({ id: "capture-sellback", type: "sellback", amountUsdt: 521.55, at: now, ref: second.id, itemIds: [second.id] });
  wallet.balance = +(wallet.balance + 521.55).toFixed(2); wallet.cryptoBalance = +(wallet.cryptoBalance + 521.55).toFixed(2);
};
await run("h", async () => {
  let s = await session({ mutate: broken });
  await s.page.waitForSelector(".v-itemrow"); await s.shot("h1-held-unconfirmed");
  let row = (await s.page.locator(".v-itemrow").first().innerText()).replace(/\s+/g, " ");
  check("h", "보관 중인데 입금 내역이 있는 상품: 목록은 확인 필요라고 적고 받을 금액을 적지 않는다. 한 번에 받기 단추도 없다", row.includes("확인 필요") && !row.includes("$521.55") && (await s.page.locator("[data-take-batch]").count()) === 0, row);
  await s.page.locator(".v-itemrow").first().click(); await s.page.waitForSelector(".v-sheet .v-rows"); await s.page.waitForTimeout(300); await s.shot("h2-held-unconfirmed-detail");
  let t = await sheetText(s.page);
  check("h", "그 상세: 상태 확인 필요, 확인하지 못했다는 한 줄, 받기 단추와 배송 링크 없음, 지갑 내역과 검증 링크", t.includes("상태 확인 필요") && t.includes("처리 상태를 확인하지 못했습니다. 보관함과 지갑 내역에서 확인할 수 있습니다.") && !t.includes("보관 중") && (await s.page.locator(".v-sheet .v-btn").count()) === 0 && (await s.page.locator(".v-sheet .v-links .v-link").allInnerTexts()).join("|") === "지갑 내역|개봉 결과 검증", t);
  await s.page.locator(".v-sheet-close").click(); await s.page.waitForTimeout(300);
  await s.page.locator(".v-chip").nth(2).click(); await s.page.waitForSelector(".v-itemrow"); await s.page.waitForTimeout(200); await s.shot("h3-sold-unconfirmed");
  row = (await s.page.locator(".v-itemrow").first().innerText()).replace(/\s+/g, " ");
  check("h", "받은 상태인데 입금 내역이 없는 상품: 목록은 USDT로 받음도 받은 금액도 적지 않는다", row.includes("확인 필요") && !row.includes("USDT로 받음") && !row.includes("$950"), row);
  await s.page.locator(".v-itemrow").first().click(); await s.page.waitForSelector(".v-sheet .v-rows"); await s.page.waitForTimeout(300); await s.shot("h4-sold-unconfirmed-detail");
  t = await sheetText(s.page);
  check("h", "그 상세: USDT로 받음과 받은 금액이 없다. 상태 확인 필요, 한 줄, 받기 단추 없음, 지갑 내역과 검증 링크", t.includes("상태 확인 필요") && !t.includes("USDT로 받음") && !t.includes("받은 금액") && t.includes("처리 상태를 확인하지 못했습니다.") && (await s.page.locator(".v-sheet .v-btn").count()) === 0 && (await s.page.locator(".v-sheet .v-links .v-link").allInnerTexts()).join("|") === "지갑 내역|개봉 결과 검증", t);
  await s.page.locator(".v-sheet-close").click(); await s.page.waitForTimeout(300);
  await s.page.locator("[data-balance-open]").click(); await s.page.waitForSelector(".v-sheet"); await s.page.waitForTimeout(300); await s.shot("h5-balance-sheet");
  t = await sheetText(s.page);
  check("h", "잔액 시트: 받을 수 있는 상품으로 세지 않는다(주 단추는 충전)", !t.includes("USDT로 받으면") && (await s.page.locator(".v-sheet .v-btn").allInnerTexts()).join("|") === "USDT 충전하기", t);
  const before = await s.ledger();
  check("h", "여기까지 돈은 움직이지 않았다", near(before.balance, 10521.55) && before.sellbacks.length === 1);
  await s.context.close();

  // 잔액이 모자란 자리: 어긋난 상품은 받을 수 있는 금액에 세지 않는다
  s = await session({ mutate: (inventory, wallet, values, walletKeys) => { broken(inventory, wallet, values, walletKeys); for (const item of inventory.items) delete item.openingId; wallet.balance = 0.25; wallet.cryptoBalance = 0.25; }, path: "/ko/box/vault-gold" });
  await s.page.waitForSelector(".v-openbar .v-btn:not([disabled])"); await s.shot("h6-short");
  const bar = (await s.page.locator(".v-openbar").innerText()).replace(/\s+/g, " ");
  check("h", "부족한 자리: 받을 수 있는 상품이 없으므로 주 단추는 충전이고 USDT로 받기 링크와 한 줄이 없다", (await s.page.locator(".v-openbar .v-btn").allInnerTexts()).join("|") === "USDT 충전하기" && (await s.page.locator(".v-openbar .v-link").count()) === 0 && !bar.includes("USDT로 받으면"), bar);
  await s.context.close();

  // 다시 보는 결과(연출을 못 보고 떠났다 돌아온 개봉): 같은 기준으로 적는다
  s = await session({ mutate: broken, path: "/ko/box/dollar-apple" });
  await s.page.waitForSelector("[data-open-recover]", { timeout: 15000 });
  await s.page.locator("[data-open-recover]").click(); await s.page.waitForSelector(".v-reveal-result", { timeout: 15000 }); await s.page.waitForTimeout(700); await s.shot("h7-recovered-results");
  t = (await s.page.locator(".v-reveal").innerText()).replace(/\s+/g, " ");
  check("h", "다시 보는 여러 개 결과: 두 상품 모두 확인 필요라고 적고, 받은 것으로도 보관 상품으로도 세지 않는다. USDT로 받기 주 단추가 없다", (t.match(/확인 필요/g) || []).length === 2 && !t.includes("USDT로 받음") && !/보관 상품 \d+개 참고가/.test(t) && t.includes("잔액에 반영 $0") && (await s.page.locator("[data-take-batch]").count()) === 0, t.slice(0, 260));
  await s.page.locator(".v-resultrow button[aria-haspopup='dialog']").first().click(); await s.page.waitForSelector(".v-sheet .v-rows"); await s.page.waitForTimeout(300); await s.shot("h8-recovered-item");
  t = await sheetText(s.page);
  check("h", "그 상품의 상세: 확인하지 못했다는 한 줄, 받기 단추 없음, 지갑 내역과 검증 링크", t.includes("처리 상태를 확인하지 못했습니다.") && (await s.page.locator(".v-sheet [data-take-primary]").count()) === 0 && (await s.page.locator(".v-sheet .v-links .v-link").allInnerTexts()).join("|") === "지갑 내역|개봉 결과 검증", t);
  const after = await s.ledger();
  check("h", "다시 보는 동안에도 돈은 움직이지 않았다", near(after.balance, 10521.55) && after.sellbacks.length === 1 && after.opens === 0);
  await s.context.close();

  // 받는 일이 알 수 없다고 답한 뒤(시험 스위치): 상세를 닫았다 다시 열어도 확인 필요가 남고 받기 단추가 없다
  s = await session();
  await setFault(s.page, "settle-unknown");
  await s.page.locator(".v-itemrow").first().click(); await s.page.waitForSelector(".v-sheet [data-take-primary]"); await s.page.waitForTimeout(300);
  await s.page.locator(".v-sheet [data-take-primary]").click(); await s.page.waitForSelector('[role="alertdialog"] .v-btn'); await s.page.waitForTimeout(500);
  await s.page.locator('[role="alertdialog"] .v-btn').click(); await s.page.waitForSelector(".v-sheet .v-line--fail", { timeout: 5000 });
  await setFault(s.page, null);
  await s.page.locator(".v-sheet-close").click(); await s.page.waitForTimeout(300);
  await s.page.locator(".v-itemrow").first().click(); await s.page.waitForSelector(".v-sheet .v-rows"); await s.page.waitForTimeout(300); await s.shot("h9-reopened-after-unknown");
  t = await sheetText(s.page);
  check("h", "알 수 없다고 답한 상품: 다시 열어도 확인 필요와 한 줄이 남고 받기 단추가 없다", t.includes("상태 확인 필요") && t.includes("처리 상태를 확인하지 못했습니다.") && (await s.page.locator(".v-sheet [data-take-primary]").count()) === 0, t);
  await s.page.locator(".v-sheet-close").click(); await s.page.waitForTimeout(300);
  await s.page.locator("[data-take-batch]").click(); await s.page.waitForSelector(".v-sheet [data-take-row]"); await s.page.waitForTimeout(300); await s.shot("h10-sheet-without-unconfirmed");
  check("h", "선택 시트에는 받을 수 있는 상품만 나온다(하나)", (await s.page.locator(".v-sheet [data-take-row]").count()) === 1);
  const l = await s.ledger();
  check("h", "돈은 움직이지 않았다", near(l.balance, 10000) && l.sellbacks.length === 0 && l.held === 2);
  await s.context.close();
});

// i: 이 일을 만들기 전에 정상으로 받은 기록(flow/REVIEW_codex-3.md 3.2, 4절). 확인 대기 표시가 없으면 받은 것이다.
//    옛 자동 받기는 거래 기록에 상품 종류만 적었다(ref 가 "상품 종류:auto", 보관 상품 id 없음). 그래도 USDT로 받음과 받은 금액을 그대로 보여 준다
await run("i", async () => {
  const legacy = (ref) => (inventory, wallet) => {
    const now = new Date().toISOString();
    Object.assign(inventory.items[0], { status: "SOLD", soldForUsdt: 950, soldAt: now });
    wallet.transactions.unshift({ id: "capture-old-sellback", type: "sellback", amountUsdt: 950, at: now, ...(ref ? { ref } : {}) });
    wallet.balance = +(wallet.balance + 950).toFixed(2); wallet.cryptoBalance = +(wallet.cryptoBalance + 950).toFixed(2);
  };
  for (const [name, ref] of [["옛 자동 받기", "da-iphone16:auto"], ["보관 상품 id 가 적힌 옛 받기", "capture-item-1"], ["아무 id 도 없는 옛 기록", null]]) {
    const s = await session({ mutate: legacy(ref) });
    await s.page.locator(".v-chip").nth(2).click(); await s.page.waitForSelector(".v-itemrow"); await s.page.waitForTimeout(200);
    const row = (await s.page.locator(".v-itemrow").first().innerText()).replace(/\s+/g, " ");
    await s.page.locator(".v-itemrow").first().click(); await s.page.waitForSelector(".v-sheet .v-rows"); await s.page.waitForTimeout(300);
    if (ref === "da-iphone16:auto") await s.shot("i1-legacy-auto-take");
    const t = await sheetText(s.page); const l = await s.ledger();
    check("i", name + ": 받은 것 목록과 상세가 USDT로 받음과 받은 금액 $950 을 그대로 보여 주고, 확인 필요도 받기 단추도 없다", row.includes("USDT로 받음") && row.includes("$950") && !row.includes("확인 필요") && t.includes("상태 USDT로 받음") && t.includes("받은 금액 $950") && !t.includes("확인 필요") && !t.includes("처리 상태를 확인하지 못했습니다") && (await s.page.locator(".v-sheet [data-take-primary]").count()) === 0 && near(l.balance, 10950) && l.sellbacks.length === 1, row + " / " + t);
    await s.context.close();
  }
});

const failed = results.filter((r) => !r.pass);
fs.writeFileSync(`${out}/take-results.json`, JSON.stringify({ at: new Date().toISOString(), total: results.length, failed: failed.length, results }, null, 1));
console.log(`\n합계 ${results.length}, 실패 ${failed.length}`);
await browser.close();
process.exit(failed.length ? 1 : 0);
