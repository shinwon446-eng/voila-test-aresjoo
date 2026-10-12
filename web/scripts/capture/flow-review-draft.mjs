// 후기 쓰기 시트의 초안(migration-audit/PARITY_ISSUES.md E-15): 상품이 바뀌거나 시트가 닫히면 초안이 비워지고,
// 늦게 끝난 사진 줄이기가 새 사진이나 다음 초안을 덮지 않는다. 보통의 길(쓰고 올리기)은 그대로다.
//   CAPTURE_BASE=http://localhost:3003 node scripts/capture/flow-review-draft.mjs [출력 폴더]
// 심는 상태는 states.mjs 의 inventory(보관 상품 둘, 둘 다 후기를 쓸 수 있다).
// 사진 줄이기를 늦추려고 이 브라우저 안에서만 HTMLImageElement.decode 를 감싼다(앱 소스는 건드리지 않는다).
import { chromium } from "playwright";
import fs from "node:fs";
import { installState, makeState } from "./states.mjs";

const out = process.argv[2];
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
if (out) fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
const check = (scenario, name, pass, detail = "") => { results.push({ scenario, name, pass: !!pass, detail }); console.log((pass ? "PASS " : "FAIL ") + scenario + " " + name + (detail ? "  " + detail : "")); };

async function session() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR", reducedMotion: "reduce" });
  await installState(context, await makeState("inventory", "ko"), new URL(base).origin);
  // 사진 줄이기를 늦춘다: window.__decodeDelays 에 넣은 시간(ms)을 고른 차례대로 하나씩 쓴다. 비어 있으면 늦추지 않는다
  await context.addInitScript(() => {
    window.__decodeDelays = [];
    const decode = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = function () { const ms = window.__decodeDelays.shift() ?? 0; return new Promise((done) => setTimeout(done, ms)).then(() => decode.call(this)); };
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
  await page.goto(base + "/ko/inventory", { waitUntil: "networkidle" });
  await page.waitForSelector(".v-itemrow");
  // 한 가지 색으로 채운 시험 사진(파일 선택창을 거치지 않고 입력 칸에 넣는다)
  const photo = async (color) => Buffer.from(await page.evaluate((c) => { const el = document.createElement("canvas"); el.width = 40; el.height = 40; const g = el.getContext("2d"); g.fillStyle = c; g.fillRect(0, 0, 40, 40); return el.toDataURL("image/png").split(",")[1]; }, color), "base64");
  const files = { red: await photo("#ff0000"), blue: await photo("#0000ff") };
  const openReview = async (index) => { await page.locator(".v-itemrow").nth(index).click(); await page.getByText("후기 쓰기", { exact: true }).click(); await page.waitForSelector("textarea.v-input"); };
  /** 후기 시트를 닫고(상품 상세로 돌아간다) 상품 상세도 닫는다 */
  const closeAll = async () => { await page.locator(".v-sheet-close").click(); await page.waitForSelector("textarea.v-input", { state: "detached" }); await page.locator(".v-sheet-close").click(); await page.waitForSelector(".v-sheet", { state: "detached" }); };
  const pickPhoto = (color) => page.locator('.v-sheet input[type="file"]').setInputFiles({ name: color + ".png", mimeType: "image/png", buffer: files[color] });
  /** 지금 시트의 초안: 별점(1~5), 글, 사진의 색(없으면 null) */
  const draft = () => page.evaluate(() => {
    const chips = [...document.querySelectorAll(".v-sheet .v-chip")];
    const img = document.querySelector(".v-sheet .v-review-photo img");
    let color = null;
    if (img && img.complete && img.naturalWidth) { const el = document.createElement("canvas"); el.width = 1; el.height = 1; const g = el.getContext("2d"); g.drawImage(img, 0, 0, 1, 1); const [r, , b] = g.getImageData(0, 0, 1, 1).data; color = r > b ? "red" : "blue"; }
    else if (img) color = "loading";
    return { rating: chips.findIndex((c) => c.getAttribute("aria-pressed") === "true") + 1, text: document.querySelector(".v-sheet textarea.v-input")?.value ?? null, photo: color };
  });
  const mine = () => page.evaluate(() => { const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i)); const key = keys.find((k) => k && k.endsWith("gachaflix.community")); try { return JSON.parse(localStorage.getItem(key)).state.mine; } catch { return []; } });
  return { context, page, errors, openReview, closeAll, pickPhoto, draft, mine, shot: (name) => (out ? page.screenshot({ path: `${out}/${name}.png` }) : null) };
}
const run = async (id, fn) => { try { await fn(); } catch (e) { check(id, "시나리오 실행", false, String(e).slice(0, 240)); } };
const same = (d, rating, text, photo) => d.rating === rating && d.text === text && d.photo === photo;

// a: 상품 A 의 초안을 쓰다 닫고 상품 B 의 후기를 열면 비어 있다
await run("a", async () => {
  const s = await session();
  await s.openReview(0);
  await s.page.locator(".v-sheet .v-chip").nth(2).click();
  await s.page.locator("textarea.v-input").fill("첫 상품에 쓰던 글입니다. 아직 올리지 않았습니다.");
  await s.pickPhoto("red"); await s.page.waitForSelector(".v-review-photo img"); await s.page.waitForTimeout(200);
  const before = await s.draft(); await s.shot("a1-draft-first-item");
  check("a", "초안이 화면에 적힌다(별점 3, 글, 사진)", same(before, 3, "첫 상품에 쓰던 글입니다. 아직 올리지 않았습니다.", "red"), JSON.stringify(before));
  await s.closeAll();
  await s.openReview(1); await s.page.waitForTimeout(200);
  const other = await s.draft(); await s.shot("a2-second-item");
  check("a", "다른 상품의 후기 시트는 빈 초안으로 열린다(별점 5, 글 없음, 사진 없음)", same(other, 5, "", null), JSON.stringify(other));
  await s.page.locator("textarea.v-input").fill("둘째 상품에 쓰던 글입니다.");
  await s.closeAll();
  await s.openReview(1); await s.page.waitForTimeout(200);
  const again = await s.draft();
  check("a", "같은 상품이라도 닫았다 다시 열면 빈 초안이다", same(again, 5, "", null), JSON.stringify(again));
  check("a", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// b: 사진을 빠르게 두 번 고르면 먼저 고른 것이 늦게 끝나도 나중에 고른 사진이 남는다
await run("b", async () => {
  const s = await session();
  await s.openReview(0);
  await s.page.evaluate(() => window.__decodeDelays.push(1500, 0));
  await s.pickPhoto("red"); await s.pickPhoto("blue");
  await s.page.waitForSelector(".v-review-photo img"); await s.page.waitForTimeout(300);
  const first = await s.draft();
  check("b", "나중에 고른 사진이 먼저 끝나 보인다", first.photo === "blue", JSON.stringify(first));
  await s.page.waitForTimeout(2000);
  const later = await s.draft(); await s.shot("b1-late-photo");
  check("b", "먼저 고른 사진이 늦게 끝나도 나중에 고른 사진을 덮지 않는다", later.photo === "blue", JSON.stringify(later));
  check("b", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// c: 사진 줄이기가 끝나기 전에 시트를 닫으면 그 사진은 다음 초안에 들어가지 않는다
await run("c", async () => {
  const s = await session();
  await s.openReview(0);
  await s.page.evaluate(() => window.__decodeDelays.push(1500));
  await s.pickPhoto("red");
  await s.closeAll();
  await s.openReview(1);
  await s.page.waitForTimeout(2200);
  const next = await s.draft(); await s.shot("c1-after-close");
  check("c", "닫은 뒤에 끝난 사진이 다른 상품의 초안에 나타나지 않는다", same(next, 5, "", null), JSON.stringify(next));
  check("c", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

// d: 보통의 길은 그대로다. 별점, 글, 사진을 넣어 올리면 그대로 저장되고, 다음 상품의 시트는 빈 초안이다
await run("d", async () => {
  const s = await session();
  await s.openReview(0);
  await s.page.locator(".v-sheet .v-chip").nth(3).click();
  await s.page.locator("textarea.v-input").fill("배송 잘 받았습니다. 상자 상태도 좋았습니다.");
  await s.pickPhoto("blue"); await s.page.waitForSelector(".v-review-photo img"); await s.page.waitForTimeout(200);
  const filled = await s.draft();
  check("d", "고른 사진이 미리 보인다", same(filled, 4, "배송 잘 받았습니다. 상자 상태도 좋았습니다.", "blue"), JSON.stringify(filled));
  await s.page.getByRole("button", { name: "후기 올리기" }).click();
  await s.page.waitForSelector("textarea.v-input", { state: "detached" }); await s.page.waitForTimeout(300); await s.shot("d1-posted");
  const saved = await s.mine();
  check("d", "후기 하나가 별점, 글, 사진 그대로 저장된다", saved.length === 1 && saved[0].rating === 4 && saved[0].text === "배송 잘 받았습니다. 상자 상태도 좋았습니다." && String(saved[0].photo).startsWith("data:image/"), JSON.stringify(saved.map((r) => ({ rating: r.rating, text: r.text, photo: String(r.photo).slice(0, 22) }))));
  check("d", "상품 상세의 후기 행이 올렸다고 말한다", (await s.page.locator(".v-sheet").innerText()).includes("후기를 올렸습니다"));
  await s.page.locator(".v-sheet-close").click(); await s.page.waitForSelector(".v-sheet", { state: "detached" });
  await s.openReview(1); await s.page.waitForTimeout(200);
  const next = await s.draft();
  check("d", "올린 뒤 다른 상품의 시트는 빈 초안이다(별점도 5 로 돌아온다)", same(next, 5, "", null), JSON.stringify(next));
  check("d", "콘솔 오류 없음", s.errors.length === 0, s.errors.join(" | "));
  await s.context.close();
});

await browser.close();
const failed = results.filter((r) => !r.pass);
if (out) fs.writeFileSync(`${out}/review-draft-results.json`, JSON.stringify(results, null, 2));
console.log(`\n검사 ${results.length}개, 통과 ${results.length - failed.length}, 실패 ${failed.length}`);
process.exit(failed.length ? 1 : 0);
