// 저장 공간이 가득 찬 브라우저가 다음에 열 때 기록을 잃지 않고 줄어드는지, 실제 브라우저에서 확인한다(lib/compactStorage).
//   CAPTURE_BASE=http://localhost:3003 node scripts/capture/flow-storage.mjs <출력 폴더> [박스 slug]
// 순서:
//   1. 박스를 실제로 하나 열어 진짜 기록(시드, 회차, 그 박스의 확률표)을 얻는다.
//   2. 그 값으로 옛 형식의 보관함(기록마다 확률표가 통째로 든 것) 300건을 만든다. 번호는 여기서 다시 계산한다(HMAC-SHA256).
//      절반은 지금 카탈로그와 다른 표(순서를 뒤집은 것)를 쓴다. 개봉 뒤에 카탈로그가 바뀐 기록과 같다.
//   3. 앱이 돌지 않는 주소에서 그 보관함을 심고, 같은 출처의 다른 사이트 키로 남은 한도를 끝까지 채운다(새 키를 하나도 못 쓰는 상태).
//   4. 다시 연다. 저장된 값이 줄었는지, 기록이 그대로인지, 저장 실패 안내가 뜨지 않는지 본다.
//   5. 검증 화면에서 옮겨진 기록 둘(지금 표, 옛 표)을 다시 계산한다. 그 뒤 하나 더 열어 저장되는지 본다.
import { chromium } from "playwright";
import fs from "node:fs";
import { createHmac, randomUUID } from "node:crypto";
import { installState, makeState } from "./states.mjs";

const [out, slug = "car-rolls-royce"] = process.argv.slice(2);
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
const COUNT = 300;
fs.mkdirSync(out, { recursive: true });
const results = [];
const check = (name, pass, detail = "") => { results.push({ name, pass: !!pass, detail }); console.log((pass ? "PASS " : "FAIL ") + name + (detail ? "  " + detail : "")); };

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ko-KR", reducedMotion: "reduce" });
const state = await makeState("funded", "ko");
await installState(context, state, new URL(base).origin);
const page = await context.newPage();
const logs = [];
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") logs.push(m.text().slice(0, 200)); });

/** 지금 계정의 보관함 키와 저장된 글자 수, 기억 속 모양으로 푼 기록(개발 서버의 손잡이) */
const ledger = () => page.evaluate(() => {
  const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
  const key = keys.find((k) => k && k.startsWith("voila.browser-inventory.") && !k.endsWith(".guest"));
  const raw = key ? localStorage.getItem(key) : null;
  return { key, chars: raw?.length ?? 0, head: raw?.slice(0, 28) ?? "", items: key && window.__voilaLedger ? window.__voilaLedger(key)?.items ?? null : null, hook: typeof window.__voilaLedger === "function" };
});
/** 하나 연다. 비싼 박스는 확인창을 한 번 더 거친다. 기록이 보관함에 적힌 것으로 구매가 끝난 것을 안다(구매는 연출보다 먼저 확정된다) */
const openOne = async () => {
  await page.goto(base + "/ko/box/" + slug, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-open-primary]:not([disabled])", { timeout: 15000 });
  const before = (await ledger()).items?.length ?? 0;
  await page.locator("[data-open-primary]").first().click();
  // 확인창은 뜬 뒤 350ms 동안 누름을 받지 않는다. 그보다 넉넉히 기다린 뒤 누른다
  await page.waitForTimeout(600);
  const confirm = page.locator('[role="alertdialog"] .v-btn');
  if (await confirm.count()) await confirm.first().click();
  for (let i = 0; i < 100 && ((await ledger()).items?.length ?? 0) <= before; i++) await page.waitForTimeout(150);
  // 결과가 뜰 때까지 둔다. 도중에 떠나면 다음에 그 박스가 못 본 결과부터 다시 보여 준다(stores/openingJournal)
  await page.waitForSelector(".v-op[data-opening-state='settled'], .v-op[data-opening-state='revealed'], .v-reveal-result", { timeout: 20000 }).catch(() => undefined);
  await page.waitForTimeout(500);
};
const stable = (value) => JSON.stringify(value, (_, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) : v));

// 1. 진짜 기록 하나
await openOne();
const first = await ledger();
const sample = first.items?.[0];
if (!first.hook || !sample?.fair?.dropTable?.length) { console.log("FAIL 준비: 개봉 기록이나 개발 서버의 손잡이를 얻지 못했습니다", JSON.stringify({ hook: first.hook, key: first.key, items: first.items?.length })); await browser.close(); process.exit(1); }
const { serverSeed, serverSeedHash, clientSeed, oddsVersion } = sample.fair;
const rollOf = (nonce) => parseInt(createHmac("sha256", serverSeed).update(`${clientSeed}:${nonce}`).digest("hex").slice(0, 8), 16) % 1_000_000;
const pick = (roll, table) => { let cursor = 0; for (const entry of table) { cursor += Math.round(entry.dropRate * 10_000); if (roll < cursor) return entry.id; } return null; };
const current = sample.fair.dropTable;
const historical = [...current].reverse();
check("준비: 여기서 다시 계산한 번호와 상품이 앱의 기록과 같다", rollOf(sample.fair.nonce) === sample.fair.roll && pick(sample.fair.roll, current) === sample.itemId, `표 ${current.length}줄, 회차 ${sample.fair.nonce}, 번호 ${sample.fair.roll}`);

// 2. 옛 형식의 보관함 300건(기록마다 확률표를 통째로 든다). 짝수 번은 지금 표, 홀수 번은 옛 표
// 여드레 전의 기록으로 만든다. 이레 안의 기록은 박스 화면이 못 본 결과로 보고 다시 보여 주려 한다(stores/openingJournal)
const now = Date.now() - 8 * 24 * 3600 * 1000;
const built = Array.from({ length: COUNT }, (_, i) => {
  const nonce = 5000 + i; const roll = rollOf(nonce); const table = i % 2 ? historical : current; const sold = i % 3 === 0;
  return { ...sample, id: "own_" + randomUUID(), itemId: pick(roll, table), status: sold ? "SOLD" : "IN_STORAGE", acquiredAt: new Date(now - (i + 1) * 60_000).toISOString(), openingId: "op_" + randomUUID(),
    ...(sold ? { soldForUsdt: +(sample.valueUsdt * 0.95).toFixed(2), soldAt: new Date(now - (i + 1) * 60_000 + 4_000).toISOString() } : { soldForUsdt: undefined, soldAt: undefined }),
    fair: { serverSeed, serverSeedHash, clientSeed, nonce, roll, oddsVersion, dropTable: table.map((entry) => ({ ...entry })) } };
});
const seeded = JSON.parse(JSON.stringify([sample, ...built]));
const oldText = JSON.stringify({ state: { items: seeded }, version: 0 });
const differs = built.findIndex((item, i) => i % 2 === 1 && item.itemId !== pick(item.fair.roll, current));
check("준비: 옛 표의 기록 가운데 지금 표로는 다른 상품이 되는 것이 있다", differs >= 0, differs >= 0 ? `기록 ${differs}: 옛 표 ${built[differs].itemId}, 지금 표 ${pick(built[differs].fair.roll, current)}` : "");

// 3. 앱이 돌지 않는 주소(같은 출처의 그림 파일)에서 심는다. 여기에는 저장소 래퍼가 없으므로 접두사를 직접 붙인다
await page.goto(base + "/icon.svg");
if (await page.evaluate(() => !!Storage.prototype.__voilaLab)) { console.log("FAIL 준비: 앱이 돌지 않는 주소를 얻지 못했습니다(저장소 래퍼가 있습니다)"); await browser.close(); process.exit(1); }
const filled = await page.evaluate(({ key, text }) => {
  localStorage.setItem(key, text);
  // 같은 출처의 다른 사이트가 쓰는 키로 남은 한도를 채운다. 들어가는 가장 긴 값을 이분법으로 찾는다
  const filler = "other-site.gachaflix.inventory";
  let lo = 0; let hi = 12_000_000;
  while (lo < hi) { const mid = Math.ceil((lo + hi) / 2); try { localStorage.setItem(filler, "x".repeat(mid)); lo = mid; } catch { hi = mid - 1; } }
  localStorage.setItem(filler, "x".repeat(lo));
  let refused = false; try { localStorage.setItem("other-site.probe", "1"); localStorage.removeItem("other-site.probe"); } catch { refused = true; }
  let used = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); used += k.length + localStorage.getItem(k).length; }
  return { filler: lo, refused, used, saved: localStorage.getItem(key) === text };
}, { key: state.prefix + first.key, text: oldText });
check("준비: 옛 형식의 보관함을 심었고 저장소가 가득 찼다(새 키를 쓸 수 없다)", filled.saved && filled.refused, `보관함 ${oldText.length.toLocaleString("en-US")}자, 다른 사이트 몫 ${filled.filler.toLocaleString("en-US")}자, 전체 ${filled.used.toLocaleString("en-US")}자`);

// 4. 다시 연다
logs.length = 0;
await page.goto(base + "/ko/inventory", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const after = await ledger();
const full = await page.evaluate(() => ({ flag: !!window.__voilaStorageFull, notice: document.body.innerText.includes("브라우저 저장 공간이 가득 차") }));
await page.screenshot({ path: `${out}/storage-1-after-load.png` });
check("다시 열면 저장된 보관함이 줄인 형식이다", after.head.startsWith('{"state":{"items":{"z":1,'), after.head);
check("저장된 글자 수가 크게 줄었다", after.chars > 0 && after.chars < oldText.length / 10, `${oldText.length.toLocaleString("en-US")}자 → ${after.chars.toLocaleString("en-US")}자 (${(oldText.length / Math.max(1, after.chars)).toFixed(1)}배)`);
check("기록이 하나도 달라지지 않았다", after.items?.length === seeded.length && stable(after.items) === stable(seeded), `${after.items?.length}건`);
check("저장 실패 안내가 뜨지 않았다", !full.flag && !full.notice && !logs.some((l) => l.includes("storage is full")), logs.filter((l) => l.includes("storage")).join(" | "));
check("저장된 확률표는 둘뿐이다(지금 표와 옛 표, 기록 수와 무관하다)", await page.evaluate((key) => { const raw = JSON.parse(localStorage.getItem(key)); return raw.state.items.t.length; }, after.key) === 2);

// 5. 검증 화면: 옮겨진 기록을 그 기록의 당시 표로 다시 계산한다
await page.goto(base + "/ko/verify", { waitUntil: "networkidle" });
await page.waitForSelector(".v-itemrow", { timeout: 15000 });
const verifyRow = async (index, record, label, file) => {
  // 목록은 새것부터다: 0 은 방금 실제로 연 기록, 1 부터가 심은 기록이다
  await page.locator(".v-itemrow").nth(index).click();
  await page.waitForSelector(".v-sheet .v-row"); await page.waitForTimeout(900);
  const text = (await page.locator(".v-sheet").innerText()).replace(/\s+/g, " ");
  await page.screenshot({ path: `${out}/storage-2-verify-${file}.png` });
  check(`검증(${label}): 다시 계산한 결과가 받은 상품과 같다`, text.includes("다시 계산한 결과가 받은 상품과 같습니다.") && text.includes("개봉할 때 저장한 표") && text.includes(record.fair.roll.toLocaleString("en-US")) && text.includes("회차 " + record.fair.nonce.toLocaleString("en-US")), `회차 ${record.fair.nonce}, 번호 ${record.fair.roll}`);
  await page.keyboard.press("Escape"); await page.waitForTimeout(400);
};
await verifyRow(0, sample, "실제로 연 기록", "opened");
await verifyRow(1, built[0], "옮겨진 기록, 지금 표", "moved-current-table");
if (differs >= 0 && differs < 19) await verifyRow(differs + 1, built[differs], "옮겨진 기록, 옛 표", "moved-old-table");
else check("검증(옮겨진 기록, 옛 표): 첫 쪽 안에 맞는 기록이 있다", false, `기록 ${differs}`);

// 그 뒤의 개봉이 저장된다(다른 사이트 몫은 그대로 한도를 차지하고 있다)
logs.length = 0;
await openOne();
await page.waitForTimeout(500);
const last = await ledger();
const fullAfter = await page.evaluate(() => ({ flag: !!window.__voilaStorageFull, notice: document.body.innerText.includes("브라우저 저장 공간이 가득 차") }));
check("그 뒤에 하나 더 열면 저장되고 안내가 뜨지 않는다", last.items?.length === seeded.length + 1 && !fullAfter.flag && !fullAfter.notice && last.head.startsWith('{"state":{"items":{"z":1,'), `${last.items?.length}건, ${last.chars.toLocaleString("en-US")}자`);
await page.goto(base + "/ko/inventory", { waitUntil: "networkidle" });
const reloaded = await ledger();
check("새로 고친 뒤에도 그 기록이 남아 있다", reloaded.items?.length === seeded.length + 1 && stable(reloaded.items.slice(1)) === stable(seeded));

fs.writeFileSync(`${out}/storage-results.json`, JSON.stringify({ before: oldText.length, after: after.chars, results }, null, 2));
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed} / ${results.length} 통과`);
await browser.close();
process.exit(failed ? 1 : 0);
