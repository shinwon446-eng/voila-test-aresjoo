// claude-b 의 공용 도구. 배포된 참조 사이트를 실제로 눌러 인터랙션과 상태 전이를 확인한다.
//   실행(web 폴더에서): node ../migration-audit/harness/claude-b/<스크립트>.mjs
//   CAPTURE_BASE 로 대상을 바꾼다(기본: 배포 사이트).
// 상태는 web/scripts/capture/states.mjs 로 심는다(새 브라우저 컨텍스트의 시험 장부, 실제 돈 없음).
// 이 폴더의 스크립트는 web/ 과 기존 문서를 고치지 않는다. 출금 신청과 배송 신청은 확인 단계 앞에서 멈춘다.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(here, "../../..");
const require = createRequire(path.join(REPO, "web/package.json"));
export const { chromium } = require("playwright");
const states = await import(pathToFileURL(path.join(REPO, "web/scripts/capture/states.mjs")).href);
export const fixtures = JSON.parse(fs.readFileSync(path.join(REPO, "web/scripts/capture/opening-fixtures.json"), "utf8"));

export const BASE = (process.env.CAPTURE_BASE || "https://shinwon446-eng.github.io/voila-test-aresjoo").replace(/\/$/, "");
export const ORIGIN = new URL(BASE).origin;
export const SHOTS = path.join(REPO, "migration-audit/screenshots/before/consolidator-rerun");
export const RESULTS = path.join(here, "results");
fs.mkdirSync(SHOTS, { recursive: true }); fs.mkdirSync(RESULTS, { recursive: true });

export const VIEWS = { mobile: [390, 844], narrow: [320, 640], tablet: [768, 1024], desktop: [1280, 900] };
export const wrap = (state, version = 0) => JSON.stringify({ state, version });
export const near = (a, b) => typeof a === "number" && typeof b === "number" && Math.abs(a - b) < 0.005;
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let browser = null;
export async function launch() { browser ??= await chromium.launch({ channel: "chrome", headless: true }); return browser; }
export async function shutdown() { if (browser) await browser.close(); browser = null; }

/** 검사 기록. pass 는 true, false, 또는 "info"(판정 없이 본 것만 적는다) */
export function recorder(script) {
  const results = [];
  const check = (scenario, name, pass, detail = "") => {
    const d = typeof detail === "string" ? detail : JSON.stringify(detail);
    results.push({ scenario, name, pass, detail: d.slice(0, 900) });
    console.log((pass === "info" ? "INFO " : pass ? "PASS " : "FAIL ") + scenario + " | " + name + (d ? "  => " + d.slice(0, 400) : ""));
  };
  const run = async (id, fn) => {
    const only = (process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : "").split(",").filter(Boolean);
    if (only.length && !only.includes(id)) return;
    try { await fn(); } catch (e) { check(id, "시나리오 실행 오류", false, String(e?.stack || e).slice(0, 700)); }
  };
  const save = async () => {
    const file = path.join(RESULTS, script + ".json");
    let prev = [];
    if (process.argv.includes("--only") && fs.existsSync(file)) { try { prev = JSON.parse(fs.readFileSync(file, "utf8")).results ?? []; } catch { prev = []; } }
    const ids = new Set(results.map((r) => r.scenario));
    const merged = [...prev.filter((r) => !ids.has(r.scenario)), ...results];
    fs.writeFileSync(file, JSON.stringify({ script, base: BASE, at: new Date().toISOString(), results: merged }, null, 1));
    const fail = results.filter((r) => r.pass === false).length;
    console.log(`\n${script}: ${results.filter((r) => r.pass === true).length} pass, ${fail} fail, ${results.filter((r) => r.pass === "info").length} info`);
    await shutdown();
  };
  return { check, run, save, results };
}

/**
 * 새 컨텍스트 하나.
 *   preset: states.mjs 의 프리셋(guest, firstVisit, zero, insufficient, funded, inventory, shipping, pending, security)
 *   balance: 심는 잔액을 바꾼다. fixture: "slug:single:name" 또는 "slug:seq:name" (고정 시드로 결과를 정한다. 결과를 바꾸는 코드는 없다)
 *   mutate(inventoryState, walletState, values, walletKeys): 심는 장부를 고친다
 *   quota: true 면 "저장 공간 가득 참"을 켰다 껐다 할 수 있는 스위치를 페이지보다 먼저 심는다(window.__quotaFull)
 */
export async function session({ preset = "guest", locale = "ko", view = "mobile", reduced = true, balance = null, fixture = null, settings = null, mutate = null, quota = false, extra = null } = {}) {
  const b = await launch();
  const [w, h] = VIEWS[view]; const touch = view === "mobile" || view === "narrow";
  const context = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: touch ? 2 : 1, isMobile: touch, hasTouch: touch, locale: locale === "en" ? "en-US" : locale === "zh" ? "zh-CN" : "ko-KR", reducedMotion: reduced ? "reduce" : "no-preference" });
  const state = await states.makeState(preset, locale);
  const isInventory = (k) => k === "gachaflix.inventory" || (k.startsWith("voila.browser-inventory.") && !k.endsWith(".guest"));
  const isWallet = (k) => k === "gachaflix.wallet" || (k.startsWith("voila.browser-wallet.") && !k.endsWith(".guest"));
  if (balance !== null) for (const key of Object.keys(state.values).filter(isWallet)) { const v = JSON.parse(state.values[key]); v.state.balance = balance; v.state.cryptoBalance = balance; state.values[key] = JSON.stringify(v); }
  let fx = null, price = null;
  if (fixture) {
    const [slug, kind, name] = fixture.split(":");
    fx = fixtures.boxes[slug][kind === "seq" ? "sequences" : "single"][name];
    if (!fx) throw new Error("고정값 없음: " + fixture);
    price = fixtures.boxes[slug].price;
    state.values["gachaflix.fair"] = wrap({ serverSeed: fixtures.serverSeed, serverSeedHash: fixtures.serverSeedHash, clientSeed: fx.clientSeed, nonce: fx.nonce });
  }
  if (settings) state.values["gachaflix.settings"] = wrap({ muted: true, openSound: false, openShort: false, autoTakeBy: {}, lastReceiveBy: {}, ...settings });
  if (mutate) {
    const inventoryKey = Object.keys(state.values).find(isInventory); const walletKey = Object.keys(state.values).find(isWallet);
    const inv = JSON.parse(state.values[inventoryKey]); const wal = JSON.parse(state.values[walletKey]);
    mutate(inv.state, wal.state, state.values, Object.keys(state.values).filter(isWallet));
    for (const k of Object.keys(state.values)) { if (isInventory(k)) state.values[k] = JSON.stringify(inv); if (isWallet(k)) state.values[k] = JSON.stringify(wal); }
  }
  if (extra) Object.assign(state.values, extra);
  if (quota) await context.addInitScript(() => {
    // 사이트의 저장소 래퍼보다 먼저 건다. 켜면 localStorage 쓰기가 한도 초과로 실패한다(래퍼가 삼키고 voila:storage-full 을 보낸다)
    const proto = Storage.prototype; if (proto.__quotaPatched) return; proto.__quotaPatched = 1;
    const orig = proto.setItem;
    proto.setItem = function (k, v) { if (window.__quotaFull && this === window.localStorage) throw new DOMException("quota", "QuotaExceededError"); return orig.call(this, k, v); };
  });
  // states.mjs 의 installState 는 탭마다(sessionStorage) 다시 심는다. 두 번째 탭을 열면 장부가 프리셋으로 되감긴다.
  // 여기서는 컨텍스트에 한 번만 심는다(표시를 localStorage 에 둔다). 새 탭과 새로 고침이 앞의 구매를 지우지 않는다.
  await context.addInitScript(({ prefix, values, origin }) => {
    if (location.origin !== origin) return;
    if (Storage.prototype.__voilaLab) return; // 사이트의 래퍼가 이미 걸린 문서에서는 건드리지 않는다
    const marker = prefix + "claude-b-initialized";
    if (localStorage.getItem(marker)) return;
    for (const [key, value] of Object.entries(values)) localStorage.setItem(prefix + key, value);
    localStorage.setItem(marker, "1");
  }, { prefix: state.prefix, values: state.values, origin: ORIGIN });
  const errors = [];
  const watch = (page) => {
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
    page.on("pageerror", (e) => errors.push("pageerror " + String(e).slice(0, 200)));
    return page;
  };
  const open = async (to) => { const page = watch(await context.newPage()); await page.goto(BASE + to, { waitUntil: "networkidle" }); return page; };
  /** 저장된 장부를 직접 읽는다(화면이 아니라 localStorage) */
  const ledger = (page) => page.evaluate(() => {
    const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null")?.state ?? null; } catch { return null; } };
    const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    const sess = localStorage.getItem("voila.browser-session.v1");
    const wk = sess ? "voila.browser-wallet." + sess : "voila.browser-wallet.guest"; const ik = sess ? "voila.browser-inventory." + sess : "voila.browser-inventory.guest";
    const w = read(wk); const inv = read(ik); const fair = read("gachaflix.fair"); const j = read("voila.opening-journal");
    const tx = w?.transactions ?? [];
    return {
      session: sess, walletKey: wk, balance: w?.balance ?? null, crypto: w?.cryptoBalance ?? null, card: w?.cardBalance ?? null,
      txCount: tx.length, opens: tx.filter((t) => t.type === "open").map((t) => ({ amount: t.amountUsdt, ref: t.ref })),
      sellbacks: tx.filter((t) => t.type === "sellback").map((t) => ({ amount: t.amountUsdt, ref: t.ref, itemIds: t.itemIds ?? null })),
      withdraws: tx.filter((t) => t.type === "withdraw").map((t) => ({ amount: t.amountUsdt, status: t.status })),
      bonus: tx.filter((t) => t.type === "bonus").length, freeOpens: w?.freeOpens ?? null, burst: w?.burst ?? null,
      items: (inv?.items ?? []).map((i) => ({ id: i.id, itemId: i.itemId, status: i.status, value: i.valueUsdt, sold: i.soldForUsdt ?? null, openingId: i.openingId ?? null, nonce: i.fair?.nonce ?? null })),
      held: (inv?.items ?? []).filter((i) => i.status === "IN_STORAGE").length, sold: (inv?.items ?? []).filter((i) => i.status === "SOLD").length,
      nonce: fair?.nonce ?? null, seen: Object.keys(j?.seen ?? {}), keys: keys.filter(Boolean).sort(),
    };
  });
  const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + ".png") }).catch(() => {});
  return { context, state, fx, price, errors, open, ledger, shot, watch, w, h };
}

export const txt = async (locator) => ((await locator.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
export const sheetText = (page) => page.evaluate(() => [...document.querySelectorAll(".v-sheet")].map((e) => e.innerText).join(" || ").replace(/\s+/g, " "));
export const scrims = (page) => page.locator(".v-scrim").count();
export const bodyLocked = (page) => page.evaluate(() => document.body.style.overflow);
export const activeDesc = (page) => page.evaluate(() => { const e = document.activeElement; if (!e) return "none"; return (e.tagName + (e.className ? "." + String(e.className).split(" ").filter(Boolean).slice(0, 2).join(".") : "") + (e.getAttribute("aria-label") ? "[" + e.getAttribute("aria-label") + "]" : "") + ":" + (e.innerText || e.value || "").replace(/\s+/g, " ").slice(0, 30)); });
