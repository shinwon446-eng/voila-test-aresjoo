/**
 * 검증 도구가 함께 쓰는 것: 경로, 고정 값, 브라우저 컨텍스트, 상태 심기, 기다리기, 저장소 읽기.
 *
 * 결정성(두 번 돌려 같은 결과가 나오게 하는 것)을 위해 고정하는 값은 전부 이 파일에 있다.
 *   FIXED_TIME   페이지 안의 시계(Date)를 이 시각에 세운다(Playwright clock API 의 setFixedTime).
 *                타이머(setTimeout, requestAnimationFrame)는 그대로 흐른다. 그래서 화면은 정상으로 뜨고 날짜 글만 고정된다.
 *   FAIR         저장된 공정성 스토어(gachaflix.fair)에 심는 서버 시드, 클라이언트 시드, nonce 0.
 *                같은 시드와 nonce 는 같은 roll 과 같은 상품을 내므로 개봉 결과가 두 환경에서 같아야 한다.
 *   VIEWPORTS    폭마다 높이와 배율(deviceScaleFactor)을 못 박는다.
 *   Chrome       기존 촬영 도구(web/scripts/capture)와 같은 channel: 'chrome', headless.
 */
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const harnessRoot = fileURLToPath(new URL('../', import.meta.url));
export const repoRoot = path.resolve(harnessRoot, '../..');
export const webRoot = path.join(repoRoot, 'web');

/** Playwright 는 web/ 에 설치된 것을 그대로 쓴다(기존 촬영 도구와 같은 판). 이 폴더에 따로 설치하지 않는다. */
export function loadPlaywright() {
  const require = createRequire(path.join(webRoot, 'package.json'));
  return require('playwright');
}

/** 기존 프리셋(web/scripts/capture/states.mjs)을 그대로 불러 쓴다. */
export async function loadStates() {
  return import(pathToFileURL(path.join(webRoot, 'scripts/capture/states.mjs')).href);
}

// ── 고정 값 ──────────────────────────────────────────────────────────────────
/** 2026-10-12 12:00 (Asia/Seoul). 페이지의 Date 가 이 시각에 선다. */
export const FIXED_TIME = '2026-10-12T03:00:00.000Z';
export const TIMEZONE = 'Asia/Seoul';
const SERVER_SEED = 'parity-audit-server-seed-0001';
export const FAIR = {
  serverSeed: SERVER_SEED,
  serverSeedHash: createHash('sha256').update(SERVER_SEED).digest('hex'),
  clientSeed: 'parity-audit-client-seed',
  nonce: 0,
};
export const LOCALES = ['ko', 'en', 'zh'];
export const BROWSER_LOCALE = { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN' };
export const WIDTHS = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920];
/** 폭마다 높이, 배율, 터치 여부를 고정한다. 430 이하는 휴대폰(배율 2, 터치), 그 위는 배율 1. */
export const VIEWPORTS = {
  320: { height: 568, dsf: 2, mobile: true },
  360: { height: 800, dsf: 2, mobile: true },
  390: { height: 844, dsf: 2, mobile: true },
  430: { height: 932, dsf: 2, mobile: true },
  768: { height: 1024, dsf: 1, mobile: false },
  1024: { height: 768, dsf: 1, mobile: false },
  1280: { height: 800, dsf: 1, mobile: false },
  1440: { height: 900, dsf: 1, mobile: false },
  1920: { height: 1080, dsf: 1, mobile: false },
};

/** 움직임을 세우는 CSS. 움직임 줄이기 설정에 더해 한 번 더 건다(무한 반복과 전환이 프레임마다 다르게 찍히지 않게). */
export const FREEZE_CSS = `
*, *::before, *::after {
  animation-delay: 0s !important;
  animation-duration: 0.001s !important;
  animation-iteration-count: 1 !important;
  transition-delay: 0s !important;
  transition-duration: 0s !important;
  scroll-behavior: auto !important;
  caret-color: transparent !important;
}
video, audio { visibility: hidden !important; }
`;

/**
 * 고정한 시계를 정해진 만큼 앞으로 옮긴다(기본 1초). 페이지마다 따로 센다.
 * 결과 빌드의 확인창은 뜬 뒤 350ms 동안 확정 단추의 누름을 버리는데, 그 판단을 Date.now() 로 한다(components/ui/Sheet.tsx).
 * 시계를 세워 두면 그 350ms 가 영영 지나지 않는다(2026-10-12 실측: 확정 단추가 눌리지 않아 개봉 촬영이 멈췄다).
 * 그래서 확정 단추를 누르기 직전에 시계를 1초 옮긴다. 두 빌드에서 똑같이 옮기므로 저장되는 시각도 두 쪽이 같다.
 */
const clockOf = new WeakMap();
export async function tickClock(page, ms = 1000) {
  const next = (clockOf.get(page) ?? Date.parse(FIXED_TIME)) + ms;
  clockOf.set(page, next);
  await page.clock.setFixedTime(new Date(next));
}
/**
 * 확인창의 확정 단추를 누른다. 결과 빌드의 확인창은 뜬 뒤 350ms 동안 누름을 버린다(처음에는 Date.now(), 3c161f2 부터는 performance.now() 로 잰다).
 * 고정한 시계 아래에서는 페이지의 performance.now() 가 실제 시간보다 늦게 갈 수 있다(기계가 바쁠 때 흐름 검사에서 확정이 눌리지 않은 일이 있었다. 2026-10-13).
 * 그래서: 600ms 기다리고, 시계를 1초 옮기고, 누른다. 그 뒤에도 같은 단추가 남아 있고 눌릴 수 있으면 700ms 뒤에 다시 누른다(최대 4번).
 * 한 번에 받아들여지면 창이 닫히므로 다시 누르지 않는다. 두 빌드에 똑같이 쓴다. 누른 횟수를 돌려준다.
 */
export async function pressConfirm(page, locator) {
  await page.waitForTimeout(600);
  await tickClock(page);
  await locator.click();
  let presses = 1;
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(700);
    if (!(await locator.isVisible().catch(() => false)) || !(await locator.isEnabled().catch(() => false))) break;
    await tickClock(page);
    await locator.click({ timeout: 1500 }).then(() => { presses++; }, () => {});
  }
  return presses;
}
/** 그 페이지의 고정 시계가 지금 가리키는 시각(ms) */
export const clockNow = (page) => clockOf.get(page) ?? Date.parse(FIXED_TIME);
/** 확인창(alertdialog)의 확정 단추를 가리키는 선택자인가 */
export const isConfirmButton = (sel) => /alertdialog/.test(String(sel)) && /\.v-btn/.test(String(sel));

// ── 주소 ─────────────────────────────────────────────────────────────────────
/** 기준 주소를 "출처"와 "기준 경로"로 나눈다. 예) https://x.github.io/voila-test-aresjoo → origin, /voila-test-aresjoo */
export function parseBase(baseUrl) {
  const url = new URL(baseUrl);
  const basePath = url.pathname.replace(/\/+$/, '');
  return { origin: url.origin, basePath, base: url.origin + basePath, local: ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || /\.(localhost|test)$/.test(url.hostname) };
}
/** 로케일과 경로 → 전체 주소. 경로는 "", "/wallet", "/box/watch-rolex", "/reviews?box=..." 꼴. 끝 빗금은 배포 설정(trailingSlash)에 맞춘다. */
export function routeUrl(base, locale, route) {
  const m = /^([^?#]*)(.*)$/.exec(route);
  return `${base}/${locale}${m[1].replace(/\/+$/, '')}/${m[2]}`;
}

// ── 브라우저 ─────────────────────────────────────────────────────────────────
/**
 * Chrome 에 주는 인자.
 *   --disable-checker-imaging  큰 그림을 뒤에서 풀어 두고 타일을 다시 그리는 기능을 끈다.
 *     켜 두면 같은 환경에서 두 번 찍어도 줄여 그린 그림(예: 1200x900 사진을 52px 로)이 어떤 때는 곱게, 어떤 때는 거칠게 그려졌다.
 *     (2026-10-12 실측: 검색 결과 30행 화면을 4번 찍으면 4번 다 달랐다. 끄면 값 1~2 차이의 픽셀 몇백 개만 남는다. README 5장)
 * PARITY_CHROME_ARGS 로 인자를 바꿔 실험할 수 있다(빈 글자열이면 인자 없이 띄운다).
 */
export const CHROME_ARGS = ['--disable-checker-imaging'];
export async function launch() {
  const { chromium } = loadPlaywright();
  const args = process.env.PARITY_CHROME_ARGS === undefined ? CHROME_ARGS : process.env.PARITY_CHROME_ARGS.split(/\s+/).filter(Boolean);
  return chromium.launch({ channel: 'chrome', headless: true, args });
}

/**
 * 새 컨텍스트. 개인 프로필을 쓰지 않는다. 서비스 워커와 내려받기는 막는다.
 * reducedMotion: 'reduce'(정지 화면) 또는 'no-preference'(연출 측정).
 */
export async function newContext(browser, { width, locale, reducedMotion = 'reduce', height, extra = {} }) {
  const v = VIEWPORTS[width];
  if (!v) throw new Error('정해 두지 않은 폭: ' + width);
  return browser.newContext({
    viewport: { width, height: height ?? v.height }, deviceScaleFactor: v.dsf, isMobile: v.mobile, hasTouch: v.mobile,
    locale: BROWSER_LOCALE[locale], timezoneId: TIMEZONE, reducedMotion, colorScheme: 'dark',
    serviceWorkers: 'block', acceptDownloads: false, ...extra,
  });
}

/**
 * 요청 지킴이. 이 사이트의 기준 경로 아래 GET 만 통과시킨다. 그 밖의 것(다른 출처, GET 이 아닌 요청)은 끊고 기록한다.
 * 두 환경에서 똑같이 끊으므로 바깥 서비스의 상태가 결과를 흔들지 않고, 어떤 요청도 실제로 밖에 나가지 않는다.
 */
export async function guardNetwork(context, { origin, basePath }, log) {
  await context.route('**/*', async (route) => {
    const request = route.request();
    let url;
    try { url = new URL(request.url()); } catch { return route.abort(); }
    if (url.protocol === 'data:' || url.protocol === 'blob:') return route.continue();
    const own = url.origin === origin && (url.pathname === basePath || url.pathname.startsWith(basePath + '/'));
    if (own && request.method() === 'GET') return route.continue();
    // 적는 주소: 기준 경로 아래면 그 뒤의 경로, 같은 출처의 기준 경로 밖이면 "(기준 경로 밖)" 표시와 전체 경로, 다른 출처면 출처까지
    const shown = own ? url.pathname.slice(basePath.length) || '/' : url.origin === origin ? '(기준 경로 밖) ' + url.pathname : url.origin + url.pathname;
    log.push({ blocked: true, method: request.method(), url: shown, type: request.resourceType() });
    return route.abort('blockedbyclient');
  });
  await context.routeWebSocket('**/*', (socket) => { log.push({ blocked: true, method: 'WS', url: socket.url() }); socket.close(); });
}

// ── 상태 심기 ────────────────────────────────────────────────────────────────
/**
 * 기존 프리셋에 고정 값을 입힌다.
 *   1. 프리셋이 "지금"으로 적는 시각을 FIXED_TIME 으로 바꾼다(가입 시각, 거래 시각, 보관 시각).
 *   2. 72시간 보류의 풀리는 시각을 FIXED_TIME + 72시간으로 바꾼다.
 *   3. 공정성 스토어에 고정 시드를 심는다(프리셋에는 이 키가 없어 앱이 무작위로 만든다).
 *   4. overrides 로 저장 키를 덮어쓸 수 있다(긴 글, 큰 숫자, 통화 등). 값은 { state, version } 으로 감싼 JSON 문자열이어야 한다.
 */
export async function makeFixedState(preset, locale, overrides = {}) {
  const { makeState } = await loadStates();
  const state = await makeState(preset, locale);
  const stamped = state.user.createdAt;
  const fixedUnlock = Date.parse(FIXED_TIME) + 72 * 3600000;
  const fix = (text) => text.split(stamped).join(FIXED_TIME).replace(/"unlockAt":\d+/g, `"unlockAt":${fixedUnlock}`);
  for (const key of Object.keys(state.values)) state.values[key] = fix(state.values[key]);
  state.user = JSON.parse(fix(JSON.stringify(state.user)));
  state.account = JSON.parse(fix(JSON.stringify(state.account)));
  state.values['gachaflix.fair'] = JSON.stringify({ state: { ...FAIR }, version: 0 });
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) delete state.values[key];
    else state.values[key] = typeof value === 'string' ? value : JSON.stringify(value);
  }
  return state;
}

/** 프리셋의 지갑과 보관함을 고쳐 쓴 값을 만든다(계정별 키와 공용 키를 함께). mutate 는 { wallet, items } 를 받아 고친다. */
export function patchLedger(state, mutate) {
  const id = state.user.id;
  const wKey = `voila.browser-wallet.${id}`, iKey = `voila.browser-inventory.${id}`;
  const wallet = JSON.parse(state.values[wKey]); const inv = JSON.parse(state.values[iKey]);
  const box = { wallet: wallet.state, items: inv.state.items };
  mutate(box);
  wallet.state = box.wallet; inv.state.items = box.items;
  state.values[wKey] = JSON.stringify(wallet); state.values['gachaflix.wallet'] = JSON.stringify(wallet);
  state.values[iKey] = JSON.stringify(inv); state.values['gachaflix.inventory'] = JSON.stringify(inv);
  return state;
}

export async function installState(context, state, origin) {
  const { installState: install } = await loadStates();
  return install(context, state, origin);
}

// ── 기다리기 ─────────────────────────────────────────────────────────────────
/**
 * 화면이 다 떴다고 볼 때까지 기다린다.
 *   1. 네트워크가 잠잠해질 때까지(최대 timeout)
 *   2. 글꼴(document.fonts.ready)
 *   3. 그림: eager 로 바꾸라고 하면(fullImages) lazy 그림도 전부 불러온 뒤, 화면의 모든 img 가 끝나고 풀릴 때까지(성공이든 실패든)
 *   4. 그림 다시 그리기(repaintImages): 모든 img 를 한 프레임 숨겼다가 되돌려, 다 불린 그림으로 다시 그리게 한다.
 *      불리는 도중에 그려진 그림이 거친 품질로 남는 일을 없앤다(촬영에서만 쓴다. 자리와 크기는 바뀌지 않는다).
 *   5. 두 프레임
 * 돌려주는 값: 기다리다 끝나지 않은 것(있으면 기록에 남긴다).
 */
export async function settle(page, { fullImages = false, repaintImages = false, timeout = 15000, quiet = 150 } = {}) {
  const notes = [];
  try { await page.waitForLoadState('networkidle', { timeout }); } catch { notes.push('networkidle 시간 초과'); }
  const result = await page.evaluate(async ({ fullImages, timeout, repaintImages, resizeEvent, forceFonts }) => {
    const out = [];
    const until = (promise, ms, label) => Promise.race([promise, new Promise((resolve) => setTimeout(() => { out.push(label + ' 시간 초과'); resolve(); }, ms))]);
    await until(document.fonts.ready, 5000, 'fonts.ready');
    // 글꼴을 실제로 불러 놓는다(PARITY_NO_FONT_FORCE=1 이면 하지 않는다). fonts.ready 는 "지금 불리는 중인 것이 없다"만 뜻한다.
    // 화면의 글꼴(font-display: swap)이 아직 불리기 전이면 대체 글꼴로 그려진 채 찍힌다(같은 빌드에서도 가끔 그랬다. R2_CYCLE2_visual.md 2장).
    // 대체 글꼴(Fallback)이 아닌 글꼴 면을 전부 load() 로 부르고 끝나기를 기다린 뒤 한 번 더 ready 를 기다린다.
    if (forceFonts) {
      const faces = Array.from(document.fonts).filter((f) => !/fallback/i.test(f.family) && f.status !== 'loaded');
      if (faces.length) { window.__parityFontForced = (window.__parityFontForced ?? 0) + faces.length; await until(Promise.all(faces.map((f) => f.load().catch(() => {}))), 8000, '글꼴 불러오기'); await until(document.fonts.ready, 5000, 'fonts.ready'); await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))); }
    }
    if (fullImages) {
      // lazy 로 적힌 그림의 수는 바꾸기 전에 세어 둔다(기록에 남는다)
      const lazy = document.querySelectorAll('img[loading="lazy"]');
      window.__parityLazy = (window.__parityLazy ?? 0) + lazy.length;
      for (const img of lazy) img.loading = 'eager';
    }
    const pending = Array.from(document.images).filter((img) => !img.complete);
    await until(Promise.all(pending.map((img) => new Promise((resolve) => { img.addEventListener('load', resolve, { once: true }); img.addEventListener('error', resolve, { once: true }); }))), timeout, '그림 ' + pending.length + '장');
    await until(Promise.all(Array.from(document.images).filter((img) => img.complete && img.naturalWidth > 0 && img.decode).map((img) => img.decode().catch(() => {}))), 5000, 'decode');
    const frames = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (repaintImages) {
      const imgs = Array.from(document.images).map((img) => [img, img.style.getPropertyValue('visibility'), img.style.getPropertyPriority('visibility')]);
      for (const [img] of imgs) img.style.setProperty('visibility', 'hidden', 'important');
      await frames();
      for (const [img, value, priority] of imgs) { if (value) img.style.setProperty('visibility', value, priority); else img.style.removeProperty('visibility'); }
    }
    // 배치가 가라앉은 뒤 resize 사건을 한 번 보낸다(PARITY_NO_RESIZE=1 이면 보내지 않는다).
    // 홈 배너의 공(캔버스)은 화면이 뜰 때 한 번만 크기를 재는데, 그 뒤 글꼴이 도착해 배치가 바뀌면 다른 해상도로 남는다(실측, README 5장).
    // resize 를 받으면 앱이 지금 배치로 다시 재고 그린다. 그래서 두 환경이 같은 상태에서 찍힌다.
    if (resizeEvent) { window.dispatchEvent(new Event('resize')); await frames(); }
    await frames();
    return out;
  }, { fullImages, timeout, repaintImages, resizeEvent: repaintImages && !process.env.PARITY_NO_RESIZE, forceFonts: !process.env.PARITY_NO_FONT_FORCE });
  notes.push(...result);
  if (quiet) await page.waitForTimeout(quiet);
  return notes;
}

// ── 저장소 읽기 ──────────────────────────────────────────────────────────────
/** 이 사이트가 쓴 localStorage 전부를 접두사를 뗀 이름으로 읽는다. JSON 이면 풀어서 돌려준다. */
export async function readStorage(page, prefix) {
  return page.evaluate((prefix) => {
    const out = {};
    const shimmed = Boolean(Storage.prototype.__voilaLab);
    for (let i = 0; i < localStorage.length; i++) {
      const raw = localStorage.key(i);
      if (raw === null) continue;
      // 앱의 셰임이 걸려 있으면 key() 가 이미 접두사를 뗀 이름을 준다
      const name = shimmed ? raw : raw.startsWith(prefix) ? raw.slice(prefix.length) : null;
      if (name === null) continue;
      const text = localStorage.getItem(shimmed ? name : raw);
      try { out[name] = JSON.parse(text); } catch { out[name] = text; }
    }
    return out;
  }, prefix);
}

export const sha256 = (text) => createHash('sha256').update(text).digest('hex');
/** 파일 이름에 쓸 수 없는 글자만 바꾼다(한글은 그대로 둔다) */
export const safeName = (text) => String(text).replace(/[\\/:*?"<>|\s(),]+/g, '-').replace(/^-+|-+$/g, '');

/** 명령줄 인자: 앞의 위치 인자와 --이름 값 꼴의 선택 인자 */
export function parseArgs(argv, positional) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const next = argv[i + 1]; if (next === undefined || next.startsWith('--')) out[a.slice(2)] = true; else { out[a.slice(2)] = next; i++; } }
    else out._.push(a);
  }
  positional.forEach((name, i) => { out[name] = out._[i]; });
  return out;
}

/** 동시에 n 개씩 일을 돌린다. 일 하나가 실패해도 나머지는 계속한다(실패는 일 안에서 기록한다). */
export async function pool(items, n, work) {
  let next = 0;
  const run = async () => { while (next < items.length) { const index = next++; await work(items[index], index); } };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(n, items.length)) }, run));
}
