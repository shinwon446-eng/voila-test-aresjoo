// 개봉 경험 전용 촬영. 실제 화면에서 열기를 눌러 연출의 프레임과 결과를 찍는다.
//   node scripts/capture/opening.mjs <출력 폴더> <이름> [옵션]
//   --box <slug>              기본 dollar-apple
//   --fixture single:<종류>   low | low2 | x1 | x2 | x4 | x8 | x15 | itemLow | itemMid | itemTop (opening-fixtures.json)
//   --fixture seq:<이름>      lowLowLowHighHighHigh | fiveLowThenBig | tenSmall | smallBigSmall | threeBig | mixed | withItem (0번부터 차례로 연다)
//   --opens <n>               연속으로 여는 횟수(seq 는 흐름 길이가 기본)
//   --view <mobile|narrow|m360|m375|m430|tablet|desktop>
//   --frames <ms,ms,...>      열기를 누른 뒤 그 시각마다 한 장(기본 0,120,300,500,700,900,1200,1500,1900,2400)
//   --cast                    브라우저 화면 전송으로 실제 프레임을 받아 필름 띠(<이름>-NN-film-<view>.png)와 프레임 폴더를 남긴다
//                             (이 PC 에는 Playwright 녹화용 ffmpeg 가 없어 webm 대신 쓴다)
//   --castms <ms>             필름 띠에 담을 길이(기본 3000)
//   --reduced                 움직임 줄이기
//   --balance <usdt>          시작 잔액(기본 10000)
//   --skip                    연출 중 화면을 눌러 건너뛴다
//   --locale <ko|en|zh>
//   --stage <a|b|c>           시안 비교용(채택 뒤에는 쓰지 않는다)
// 결과는 고정값의 시드와 회차를 실제 계산식에 넣어 나온 것이다. 화면 코드는 건드리지 않는다.
import { chromium } from "playwright";
import fs from "node:fs";
import { installState, makeState } from "./states.mjs";

const argv = process.argv.slice(2);
const [out, name] = argv;
const opt = (k, d) => { const i = argv.indexOf("--" + k); return i < 0 ? d : argv[i + 1]; };
const flag = (k) => argv.includes("--" + k);
const base = process.env.CAPTURE_BASE || "http://localhost:3002";
const slug = opt("box", "dollar-apple");
const locale = opt("locale", "ko");
const fixtures = JSON.parse(fs.readFileSync(new URL("opening-fixtures.json", import.meta.url), "utf8"));
const [fkind, fname] = opt("fixture", "single:low").split(":");
const fx = fixtures.boxes[slug]?.[fkind === "seq" ? "sequences" : "single"]?.[fname];
if (!fx) throw new Error(`고정값 없음: ${slug} ${fkind}:${fname}`);
const opens = +opt("opens", fkind === "seq" ? fx.steps.length : 1);
const frames = opt("frames", "0,120,300,500,700,900,1200,1500,1900,2400").split(",").map(Number);
const VIEWS = { mobile: [390, 844], narrow: [320, 640], m360: [360, 800], m375: [375, 812], m430: [430, 932], tablet: [768, 1024], desktop: [1440, 900] };
const view = opt("view", "mobile");
const [width, height] = VIEWS[view];
const touch = view !== "desktop";

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width, height }, deviceScaleFactor: touch ? 2 : 1, isMobile: touch, hasTouch: touch,
  locale: locale === "en" ? "en-US" : locale === "zh" ? "zh-CN" : "ko-KR",
  reducedMotion: flag("reduced") ? "reduce" : "no-preference",
});
const state = await makeState("funded", locale);
const wrap = (s, version = 0) => JSON.stringify({ state: s, version });
state.values["gachaflix.fair"] = wrap({ serverSeed: fixtures.serverSeed, serverSeedHash: fixtures.serverSeedHash, clientSeed: fx.clientSeed, nonce: fx.nonce });
const balance = opt("balance", null);
if (balance !== null) {
  for (const key of Object.keys(state.values).filter((k) => k === "gachaflix.wallet" || (k.startsWith("voila.browser-wallet.") && !k.endsWith(".guest")))) {
    const w = JSON.parse(state.values[key]); w.state.balance = +balance; w.state.cryptoBalance = +balance; state.values[key] = JSON.stringify(w);
  }
}
await installState(context, state, new URL(base).origin);
const page = await context.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
page.on("pageerror", (e) => errors.push("pageerror " + String(e).slice(0, 200)));
await page.goto(`${base}/${locale}/box/${slug}${opt("stage", "") ? "?stage=" + opt("stage", "") : ""}`, { waitUntil: "networkidle" });
await page.waitForSelector(".v-openbar .v-btn:not([disabled])", { timeout: 15000 }).catch(() => {});
await page.screenshot({ path: `${out}/${name}-00-ready-${view}.png` });

const log = [];
// 화면 전송: 프레임마다 시각이 붙어 온다. 스크린샷을 연달아 찍는 것과 달리 연출을 멈추게 하지 않는다.
const cdp = await context.newCDPSession(page);
let cast = null;
cdp.on("Page.screencastFrame", (ev) => { if (cast) cast.push({ t: ev.metadata.timestamp * 1000, data: ev.data }); cdp.send("Page.screencastFrameAck", { sessionId: ev.sessionId }).catch(() => {}); });
const film = async (id, frames, startWall) => {
  if (!frames.length) return null;
  const span = +opt("castms", 3000);
  const t0 = frames[0].t;
  const within = frames.filter((fr) => fr.t - t0 <= span);
  const dir = `${out}/${name}-${id}-frames-${view}`;
  fs.mkdirSync(dir, { recursive: true });
  within.forEach((fr, i) => fs.writeFileSync(`${dir}/${String(i).padStart(3, "0")}-${String(Math.round(fr.t - t0)).padStart(4, "0")}ms.jpg`, Buffer.from(fr.data, "base64")));
  // 필름 띠: 고르게 16장
  const pick = []; const N = Math.min(16, within.length);
  for (let i = 0; i < N; i++) pick.push(within[Math.round((i * (within.length - 1)) / Math.max(1, N - 1))]);
  const sheet = await context.newPage();
  await sheet.setViewportSize({ width: 1480, height: 900 });
  await sheet.setContent("<body style='margin:0;background:#111;display:flex;flex-wrap:wrap;gap:6px;padding:6px;font:13px sans-serif;color:#fff'>" + pick.map((fr) => "<div><img src='data:image/jpeg;base64," + fr.data + "' style='width:176px;display:block'>" + Math.round(fr.t - t0) + " ms</div>").join("") + "</body>");
  await sheet.waitForTimeout(400);
  await sheet.screenshot({ path: `${out}/${name}-${id}-film-${view}.png`, fullPage: true });
  await sheet.close();
  const gaps = within.slice(1).map((fr, i) => fr.t - within[i].t);
  return { frames: within.length, spanMs: Math.round(within[within.length - 1].t - t0), maxGapMs: gaps.length ? Math.round(Math.max(...gaps)) : 0 };
};
const shot = async (label) => { const p = `${out}/${name}-${label}-${view}.png`; await page.screenshot({ path: p }); return p; };
const readResult = () => page.evaluate(() => {
  const r = document.querySelector(".v-op, .v-reveal");
  return { text: r ? (r.innerText || "").replace(/\s+/g, " ").slice(0, 220) : null, balance: (document.querySelector(".v-headbtn")?.textContent || "").trim(), docW: document.documentElement.scrollWidth, winW: innerWidth };
});

for (let n = 1; n <= opens; n++) {
  const id = String(n).padStart(2, "0");
  // 첫 번째는 박스 화면의 열기 단추, 다음부터는 결과 화면의 한 번 더 열기(둘 다 화면에 보이는 주 단추)
  const again = page.locator("[data-open-again], .v-reveal-actions .v-btn").first();
  const first = page.locator("[data-open-primary], .v-openbar .v-btn").first();
  const target = n > 1 && (await again.count()) ? again : first;
  const t0 = Date.now();
  if (flag("cast")) { cast = []; await cdp.send("Page.startScreencast", { format: "jpeg", quality: 70, everyNthFrame: 1 }); }
  await target.click();
  // 큰 금액 확인창이 뜨면 확인을 누른다
  const confirm = page.locator('[role="alertdialog"] .v-btn');
  // 확인창은 뜬 뒤 0.35초 동안 확정 단추가 눌리지 않는다(components/ui/Sheet.tsx 의 Confirm). 그보다 길게 기다린 뒤 누른다
  if (await confirm.count().catch(() => 0)) { await shot(`${id}-confirm`); await page.waitForTimeout(500); await confirm.first().click(); }
  const start = Date.now();
  if (flag("skip")) { await page.waitForTimeout(250); await page.mouse.click(width / 2, height / 2); }
  if (!flag("cast") && (n === 1 || flag("allframes"))) {
    for (const ms of frames) {
      const wait = start + ms - Date.now();
      if (wait > 0) await page.waitForTimeout(wait);
      await shot(`${id}-f${String(ms).padStart(4, "0")}`);
    }
  }
  await page.waitForSelector(".v-reveal-result, [data-opening-state='settled'], [data-opening-state='revealed']", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(900);
  let filmInfo = null;
  if (flag("cast")) { await page.waitForTimeout(Math.max(0, +opt("castms", 3000) - (Date.now() - start))); await cdp.send("Page.stopScreencast").catch(() => {}); const got = cast; cast = null; filmInfo = await film(id, got, start); }
  await shot(`${id}-result`);
  log.push({ open: n, clickToFramesMs: start - t0, film: filmInfo, ...(await readResult()) });
}
console.log(JSON.stringify({ name, slug, view, fixture: `${fkind}:${fname}`, expected: fx.steps ? fx.steps.map((x) => x.value) : fx.value, log, errors }, null, 1));
await context.close();
await browser.close();
