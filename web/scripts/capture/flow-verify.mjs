// 시나리오 F: 실제로 하나 열고, 그 기록의 값을 /verify 에 직접 넣어 같은 번호가 나오는지 확인한다.
//   node scripts/capture/flow-verify.mjs ../qa/cycles/c1
import { chromium } from "playwright";
import { installState, makeState } from "./states.mjs";

const [out] = process.argv.slice(2);
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR", reducedMotion: "reduce" });
await installState(context, await makeState("funded", "ko"), new URL(base).origin);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
// 1개 열기
await page.goto(base + "/ko/box/dollar-gaming", { waitUntil: "networkidle" });
await page.locator(".v-openbar .v-btn").click();
await page.waitForSelector(".v-reveal-result", { timeout: 15000 });
// 결과 화면의 검증 시트에서 값을 읽는다(짧게 보이는 값의 title 에 전체 값이 있다)
await page.getByText("개봉 결과 검증", { exact: true }).last().click();
await page.waitForTimeout(900);
const rec = await page.evaluate(() => {
  const rows = [...document.querySelectorAll(".v-sheet .v-row")].map((r) => ({ label: r.querySelector("dt")?.textContent?.trim(), text: r.querySelector("dd")?.textContent?.trim(), full: r.querySelector("dd [title]")?.getAttribute("title") }));
  const get = (l) => rows.find((r) => r.label === l);
  return { fair: { serverSeedHash: get("미리 잠근 값")?.full, serverSeed: get("공개된 값")?.full, clientSeed: get("내 기기 값")?.full, nonce: Number((get("회차")?.text || "").replace(/,/g, "")), roll: Number((get("계산한 번호")?.text || "").replace(/,/g, "")) }, itemId: get("번호가 가리키는 상품")?.text };
});
console.log("record", rec.itemId, "roll", rec.fair.roll, "nonce", rec.fair.nonce);
// /verify 에 직접 넣기
await page.goto(base + "/ko/verify", { waitUntil: "networkidle" });
await page.getByLabel("공개된 값", { exact: true }).fill(rec.fair.serverSeed);
await page.getByLabel("미리 잠근 값 (선택)", { exact: true }).fill(rec.fair.serverSeedHash);
await page.getByLabel("내 기기 값", { exact: true }).fill(rec.fair.clientSeed);
await page.getByLabel("회차", { exact: true }).fill(String(rec.fair.nonce));
await page.locator(".v-chips--scroll .v-chip", { hasText: "게이밍" }).first().click();
await page.getByRole("button", { name: "계산하기" }).click();
await page.waitForTimeout(800);
const text = await page.locator("main").innerText();
const rollShown = text.includes(rec.fair.roll.toLocaleString("en-US"));
console.log("roll shown:", rollShown, "| hash match line:", text.includes("잠근 값과 같습니다"));
await page.locator("#verify-manual").scrollIntoViewIfNeeded();
await page.screenshot({ path: `${out}/verify-manual-mobile.png` });
// 내 개봉 기록에서 그 자리 검증
await page.locator(".v-itemrow").first().click();
await page.waitForTimeout(800);
const sheet = await page.locator(".v-sheet").innerText();
console.log("record sheet verdict:", sheet.includes("같습니다") ? "ok" : sheet.includes("다릅니다") ? "bad" : "unknown");
await page.screenshot({ path: `${out}/verify-record-mobile.png` });
console.log(errors.length ? "console errors: " + errors.join(" | ") : "no console errors");
await browser.close();
