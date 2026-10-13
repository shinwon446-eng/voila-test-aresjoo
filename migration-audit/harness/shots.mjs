#!/usr/bin/env node
/**
 * 촬영. 계획(plan.mjs)의 항목을 한 환경에서 전부 찍고, 촬영마다 그림(PNG)과 기록(JSON)을 남긴다.
 *
 *   node shots.mjs <label> <baseUrl> <outDir> [--workers 6] [--groups route,overlay] [--only 글자] [--locales ko,en,zh] [--widths 390,1440] [--resume] [--passes 2] [--quiet 0]
 *   예) node shots.mjs before-deployed https://shinwon446-eng.github.io/voila-test-aresjoo ../screenshots/before/deployed
 *
 * 결정성 통제(두 환경을 같은 조건에 세우는 장치). 값은 lib/common.mjs 에 있다.
 *   1. 시계        page.clock.setFixedTime(FIXED_TIME). 페이지의 Date 가 2026-10-12 12:00(서울)에 선다. 타이머는 그대로 흐른다.
 *                  프리셋이 "지금"으로 적는 시각(가입, 거래, 보관)도 같은 시각으로 바꿔 심는다.
 *   2. 창          폭마다 높이와 배율을 못 박는다(VIEWPORTS). 430 이하는 배율 2에 터치, 그 위는 배율 1.
 *   3. 브라우저    기존 촬영 도구와 같은 Chrome(channel: 'chrome', headless), 같은 Playwright(web/node_modules).
 *                  언어는 로케일에 맞추고 시간대는 Asia/Seoul, 색 구성은 dark 로 고정한다.
 *   4. 글꼴        document.fonts.ready 를 기다린다. 불린 글꼴의 목록을 기록에 남긴다.
 *   5. 그림        lazy 로 적힌 그림을 eager 로 바꿔 전부 불러온 뒤, 모든 img 가 끝날 때까지 기다린다.
 *                  (스크롤 위치에 따라 불렸다 안 불렸다 하는 것을 없앤다. lazy 로 적혀 있던 수는 기록에 남는다.)
 *   6. 움직임      prefers-reduced-motion: reduce + 움직임을 세우는 CSS(FREEZE_CSS) + 촬영 옵션 animations: 'disabled'.
 *   7. 추첨        저장된 공정성 스토어에 고정 시드와 nonce 0 을 심는다. 같은 시드는 같은 상품을 낸다.
 *   8. 네트워크    이 사이트의 기준 경로 아래 GET 만 통과시킨다. 그 밖의 요청은 끊고 기록한다. 서비스 워커는 막는다.
 *                  화면마다 네트워크가 잠잠해질 때까지 기다린다.
 *   9. 저장소      항목마다 새 컨텍스트(빈 저장소)에서 시작한다. 개인 프로필을 쓰지 않는다.
 *  10. 그림 품질   같은 환경에서 두 번 찍어도 줄여 그린 사진이 곱게도 거칠게도 그려지던 것을 세 가지로 막는다(2026-10-12 실측, README 5장).
 *                  (가) Chrome 인자 --disable-checker-imaging (나) 촬영 전에 모든 img 를 한 프레임 숨겼다 되돌려 다시 그리게 함
 *                  (다) 촬영마다 두 번 찍고 두 번째 것만 남김(--passes, 기본 2). 셋을 다 쓰면 값 1~2 차이의 픽셀만 남는다.
 *  12. 요소 단위   촬영마다 정해 둔 영역(겹침 화면의 판, 개봉 장면, 부품 하나, 홈과 박스와 후기 화면의 구역)을 따로 잘라 찍는다(lib/regions.mjs).
 *                  화면 전체가 달라도 그 부분이 그대로인지 견줄 수 있다. 파일은 <촬영 id>~<영역>.png, 자리와 글은 기록의 regions 에 있다.
 *  11. 긴 문서     높이가 16,000 기기 픽셀을 넘으면 8,000 픽셀씩 잘라 찍고 이어 붙인다(Chrome 이 그 아래를 되풀이해 그린다).
 *
 * 촬영마다 남기는 기록(JSON): 문서 폭과 창 폭, 콘솔 오류, 실패한 요청과 끊은 요청, 깨지거나 빠진 그림,
 * 정해 둔 선택자의 자리와 크기, 글 덩어리의 줄 수, 기본 부품의 글꼴. 항목은 lib/measure.mjs 에 있다.
 *
 * 이 도구는 통과와 실패를 판정하지 않는다. 찍고 잰 것을 남길 뿐이다. 판정 자료는 diff.mjs 가 만든다.
 */
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';
import { buildPlan, shotsOf } from './plan.mjs';
import { applyPatch } from './lib/patches.mjs';
import { KEY_SELECTORS, FONT_SELECTORS, TEXT_ZONES, measureInPage } from './lib/measure.mjs';
import { captureRegions } from './lib/regions.mjs';
import { createHmac } from 'node:crypto';
import { FIXED_TIME, FAIR, FREEZE_CSS, VIEWPORTS, TIMEZONE, CHROME_ARGS, pressConfirm, clockNow, isConfirmButton, loadStates, launch, newContext, guardNetwork, makeFixedState, installState, parseBase, routeUrl, settle, parseArgs, pool } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2), ['label', 'baseUrl', 'outDir']);
if (!args.label || !args.baseUrl || !args.outDir) {
  console.error('사용법: node shots.mjs <label> <baseUrl> <outDir> [--workers 6] [--groups a,b] [--only 글자] [--locales ko,en,zh] [--widths 390,1440] [--resume]');
  process.exit(2);
}
const target = parseBase(args.baseUrl);
const outDir = path.resolve(args.outDir);
const workers = Number(args.workers ?? 6);
/** 촬영 직전에 더 기다리는 시간(ms). 그림의 다시 그리기가 가라앉는 시간이다 */
const QUIET_MS = Number(args.quiet ?? 0);
/** 촬영마다 찍는 횟수. 마지막 것만 남긴다 */
const PASSES = Math.max(1, Number(args.passes ?? 2));
/** --no-regions 이면 요소 단위 촬영을 하지 않는다 */
const NO_REGIONS = Boolean(args['no-regions']);
const list = (value) => (value ? String(value).split(',').filter(Boolean) : null);
const groups = list(args.groups), locales = list(args.locales), widths = list(args.widths)?.map(Number), only = list(args.only);

const plan = buildPlan();
const selected = plan.filter((item) => (!groups || groups.includes(item.group)) && (!locales || locales.includes(item.locale)) && (!widths || widths.includes(item.width)) && (!only || only.some((part) => item.id.includes(part))));
if (!selected.length) { console.error('고른 항목이 없습니다.'); process.exit(2); }

const { credentials } = await loadStates();
/** 인증 앱이 보여 줄 6자리(RFC 6238, 30초, SHA-1). web/scripts/capture/flow-account-password.mjs 와 같은 계산 */
function totp(secret, at) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = 0, value = 0; const bytes = [];
  for (const ch of secret.toUpperCase()) { value = (value << 5) | alphabet.indexOf(ch); bits += 5; if (bits >= 8) { bytes.push((value >>> (bits - 8)) & 255); bits -= 8; } }
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(at / 30000)));
  const mac = createHmac('sha1', Buffer.from(bytes)).update(counter).digest(); const o = mac[mac.length - 1] & 15;
  return String((((mac[o] & 127) << 24) | (mac[o + 1] << 16) | (mac[o + 2] << 8) | mac[o + 3]) % 1000000).padStart(6, '0');
}
const exists = async (file) => { try { await access(file); return true; } catch { return false; } };
const fileOf = (shotId, ext) => path.join(outDir, ...shotId.split('/')) + ext;

async function ensureFreeze(page) {
  await page.evaluate((css) => {
    if (document.getElementById('__parity_freeze')) return;
    const style = document.createElement('style');
    style.id = '__parity_freeze'; style.textContent = css;
    document.head.appendChild(style);
  }, FREEZE_CSS);
}

/**
 * 문서 전체 촬영. Chrome 은 한 번에 찍는 그림의 높이가 16384 기기 픽셀을 넘으면 그 아래를 맨 위부터 되풀이해 그린다
 * (2026-10-12 실측: 390 폭 박스 화면의 15600px 아래가 머리줄부터 다시 나왔다). 그래서 긴 문서는 8000 기기 픽셀씩 잘라 찍고 이어 붙인다.
 * 잘라 찍을 때도 문서 좌표의 clip 을 쓰므로 붙어 다니는 머리줄과 아래 막대가 조각마다 되풀이되지 않는다.
 */
async function fullShot(page, file, dsf, options) {
  const size = await page.evaluate(() => ({ w: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth, window.innerWidth), h: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, window.innerHeight) }));
  if (size.h * dsf <= 16000) { await page.screenshot({ ...options, fullPage: true, ...(file ? { path: file } : {}) }); return { segments: 1, cssHeight: size.h }; }
  const step = Math.floor(8000 / dsf);
  const parts = [];
  for (let y = 0; y < size.h; y += step) { const shot = await page.screenshot({ ...options, fullPage: true, clip: { x: 0, y, width: size.w, height: Math.min(step, size.h - y) } }); if (file) parts.push(PNG.sync.read(shot)); }
  // file 이 없으면 찍기만 하고 버린다(캐시를 데우는 첫 촬영)
  if (!file) return { segments: Math.ceil(size.h / step), cssHeight: size.h };
  const out = new PNG({ width: parts[0].width, height: parts.reduce((n, part) => n + part.height, 0) });
  let offset = 0;
  for (const part of parts) { part.data.copy(out.data, offset * out.width * 4, 0, part.height * part.width * 4); offset += part.height; }
  await writeFile(file, PNG.sync.write(out, { deflateLevel: 6 }));
  return { segments: parts.length, cssHeight: size.h };
}

async function runItem(browser, item) {
  const record = { id: item.id, group: item.group, routeKey: item.routeKey, route: item.route, locale: item.locale, width: item.width, preset: item.preset, patch: item.patch ?? null, status: 'running', shots: [], attempts: 0 };
  const expected = item.steps.filter((s) => s.do === 'shot').map((s) => s.name);
  for (let attempt = 1; attempt <= 2; attempt++) {
    record.attempts = attempt; record.shots = []; delete record.error;
    let context;
    const started = Date.now();
    try {
      // 비밀번호를 넣는 항목은 로컬 주소에서만 실행한다
      if (item.localOnly && !target.local) { for (const name of expected) record.shots.push({ name, status: 'not-applicable', reason: '원격 주소에는 비밀번호를 넣지 않는다' }); record.status = 'ok'; return record; }
      context = await newContext(browser, { width: item.width, locale: item.locale, reducedMotion: 'reduce' });
      const blocked = [], consoleErrors = [], failed = [], httpErrors = [];
      await guardNetwork(context, target, blocked);
      // 하이드레이션 전의 화면: 앱의 스크립트 묶음을 끊어 서버가 그린 화면에 머물게 한다.
      // (자바스크립트를 아예 끄면 이 도구의 기다리기와 재기도 돌지 않는다. 2026-10-13 실측: 끝나지 않고 멈췄다)
      if (item.noJs) await context.route(/\/_next\/static\/.*\.js(\?.*)?$/, (route) => route.abort('blockedbyclient'));
      const state = applyPatch(await makeFixedState(item.preset, item.locale), item.patch);
      await installState(context, state, target.origin);
      const page = await context.newPage();
      page.setDefaultTimeout(12000);
      await page.clock.setFixedTime(new Date(FIXED_TIME));
      const rel = (url) => (url.startsWith(target.base) ? url.slice(target.base.length) || '/' : url);
      page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text().split(target.base).join('').slice(0, 300)); });
      page.on('pageerror', (error) => consoleErrors.push('pageerror: ' + String(error.message).slice(0, 300)));
      page.on('requestfailed', (request) => { const reason = request.failure()?.errorText ?? ''; if (!reason.includes('BLOCKED_BY_CLIENT')) failed.push({ url: rel(request.url()), reason }); });
      page.on('response', (response) => { if (response.status() >= 400) httpErrors.push({ url: rel(response.url()), status: response.status() }); });
      page.on('dialog', (dialog) => { consoleErrors.push('dialog: ' + dialog.message().slice(0, 200)); void dialog.dismiss(); });

      const url = item.root ? target.base + '/' : routeUrl(target.base, item.locale, item.route);
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      record.httpStatus = response?.status() ?? null;
      if (item.root) await page.waitForURL(/\/(ko|en|zh)\/$/, { timeout: 15000 });
      const notes = await settle(page, { fullImages: true, repaintImages: true });
      await ensureFreeze(page);

      let cursor = { console: 0, failed: 0, blocked: 0, http: 0 };
      let skipped = null;
      for (const step of item.steps) {
        if (skipped) break;
        const locator = step.sel ? page.locator(step.sel).nth(step.nth ?? 0) : null;
        switch (step.do) {
          case 'click': {
            if (step.optional && !(await locator.isVisible().catch(() => false))) { skipped = `요소가 보이지 않음: ${step.sel}`; break; }
            // 확인창의 확정 단추는 창이 뜬 뒤 350ms 동안 눌리지 않게 고쳐졌다(MIGRATION_SPEC E-08). 두 빌드에서 똑같이 500ms 기다린 뒤 누른다
            // 시계가 서 있으므로 기다리는 것만으로는 풀리지 않는다. 시계를 1초 옮긴다(lib/common.mjs 의 tickClock)
            if (isConfirmButton(step.sel)) { await pressConfirm(page, locator); break; }
            await locator.click();
            break;
          }
          case 'fill': {
            if (step.optional && !(await locator.isVisible().catch(() => false))) break;
            // 시험 계정의 값: 프리셋의 비밀번호, 틀린 비밀번호, 인증 앱 코드(고정 시계의 지금 시각으로 계산)
            const value = step.value === '@password' ? credentials.password : step.value === '@wrong-password' ? 'NotThePresetPassword-000' : step.value === '@totp' ? totp(state.account.secret ?? 'JBSWY3DPEHPK3PXP', clockNow(page)) : String(step.value);
            await locator.fill(value);
            break;
          }
          case 'goto': await page.goto(routeUrl(target.base, item.locale, step.route), { waitUntil: 'domcontentloaded', timeout: 45000 }); await settle(page, { fullImages: true, repaintImages: true }); await ensureFreeze(page); break;
          case 'press': await page.keyboard.press(step.key); break;
          case 'hover': await locator.hover(); break;
          case 'focus': await page.keyboard.press('Tab'); await locator.focus(); break;
          case 'hold': await locator.hover(); await page.mouse.down(); break;
          case 'release': await page.mouse.move(item.width - 2, VIEWPORTS[item.width].height - 2); await page.mouse.up(); break;
          case 'open': await page.evaluate((sel) => { for (const el of document.querySelectorAll(sel)) el.open = true; }, step.sel); break;
          case 'scroll': {
            if (locator) await locator.scrollIntoViewIfNeeded();
            else await page.evaluate((y) => window.scrollTo(0, y === 'bottom' ? document.documentElement.scrollHeight : y), step.y ?? 0);
            break;
          }
          case 'wait': {
            if (!locator) { await page.waitForTimeout(step.ms ?? 300); break; }
            try { await locator.waitFor({ state: step.state ?? 'visible', timeout: step.timeout ?? 10000 }); }
            catch (error) { if (!step.soft) throw error; notes.push(`기다림 시간 초과(계속 진행): ${step.sel}`); }
            break;
          }
          case 'shot': {
            const shotId = `${item.id}__${step.name}`;
            const settleNotes = await settle(page, { fullImages: true, repaintImages: true, quiet: 120 });
            await ensureFreeze(page);
            // 그림이 다 불린 뒤에도 Chrome 은 줄여 그린 그림을 잠깐 거칠게 그렸다가 곱게 다시 그린다(같은 환경에서 두 번 찍어도 달랐던 원인, README 5장).
            // 곱게 그린 상태로 가라앉을 때까지 기다린다.
            if (QUIET_MS) await page.waitForTimeout(QUIET_MS);
            const png = fileOf(shotId, '.png');
            await mkdir(path.dirname(png), { recursive: true });
            const options = { animations: 'disabled', caret: 'hide', scale: 'device', timeout: 30000 };
            let full = null;
            if (step.clip) {
              const box = await page.locator(step.clip).nth(step.clipNth ?? 0).boundingBox();
              if (!box) throw new Error('자를 요소가 없다: ' + step.clip);
              const pad = step.pad ?? 0, vh = VIEWPORTS[item.width].height;
              const x = Math.max(0, Math.floor(box.x - pad)), y = Math.max(0, Math.floor(box.y - pad));
              options.clip = { x, y, width: Math.min(item.width - x, Math.ceil(box.width + pad * 2)), height: Math.min(vh - y, Math.ceil(box.height + pad * 2)) };
            }
            // 한 번 찍어 버리고(PASSES 가 2 이상일 때) 다시 찍는다. 첫 촬영이 그 크기의 그림 풀이를 캐시에 올려 두어,
            // 두 번째 촬영에서는 그림이 같은 품질로 그려진다(같은 환경에서 두 번 찍어도 그림 품질이 달랐던 것을 줄인다. README 5장).
            for (let pass = 1; pass < PASSES; pass++) {
              if (step.full) await fullShot(page, null, VIEWPORTS[item.width].dsf, options); else await page.screenshot({ ...options });
              await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            }
            if (step.full) full = await fullShot(page, png, VIEWPORTS[item.width].dsf, options);
            else await page.screenshot({ ...options, path: png });
            const measured = await page.evaluate(measureInPage, { keySelectors: KEY_SELECTORS, fontSelectors: FONT_SELECTORS, maxText: 700, zones: TEXT_ZONES });
            // 요소 단위 촬영(lib/regions.mjs): 겹침 화면의 판, 개봉 장면, 부품 하나, 화면의 구역. 본 촬영 뒤에 찍고 화면을 되돌린다
            const regions = [];
            if (!NO_REGIONS) {
              const scrollBefore = await page.evaluate(() => window.scrollY);
              // 첫 화면과 전체를 함께 찍는 항목은 구역을 전체 촬영에서 한 번만 찍는다
              const skipPage = !step.full && item.steps.some((s) => s.do === 'shot' && s.full && s !== step) && step.name === 'first';
              for (const region of await captureRegions(page, { item, step, skipPage, width: item.width, height: VIEWPORTS[item.width].height, dsf: VIEWPORTS[item.width].dsf, options })) {
                await writeFile(fileOf(shotId + '~' + region.key, '.png'), region.png);
                regions.push({ key: region.key, mode: region.mode, rect: region.rect, clip: region.clip, text: region.text, tag: region.tag });
              }
              await page.evaluate((y) => { if (window.scrollY !== y) window.scrollTo(0, y); }, scrollBefore);
            }
            const data = {
              id: shotId, item: item.id, name: step.name, kind: step.clip ? 'clip' : step.full ? 'full' : 'viewport', clip: options.clip ?? null, full,
              label: args.label, httpStatus: record.httpStatus, ...measured, regions,
              consoleErrors: consoleErrors.slice(cursor.console), failedRequests: failed.slice(cursor.failed), blockedRequests: blocked.slice(cursor.blocked), httpErrors: httpErrors.slice(cursor.http),
              notes: [...(record.shots.length ? [] : notes), ...settleNotes],
            };
            cursor = { console: consoleErrors.length, failed: failed.length, blocked: blocked.length, http: httpErrors.length };
            await writeFile(fileOf(shotId, '.json'), JSON.stringify(data));
            record.shots.push({ name: step.name, status: 'ok' });
            break;
          }
          default: throw new Error('모르는 단계: ' + step.do);
        }
      }
      // 고른 요소가 없어 건너뛴 촬영은 "해당 없음"으로 적는다(두 환경이 같이 건너뛰었는지 diff 가 본다)
      for (const name of expected) if (!record.shots.some((s) => s.name === name)) record.shots.push({ name, status: 'not-applicable', reason: skipped ?? '앞 단계에서 끝남' });
      record.status = 'ok'; record.durationMs = Date.now() - started;
      await context.close();
      return record;
    } catch (error) {
      record.error = String(error.message).split('\n')[0].slice(0, 300);
      record.durationMs = Date.now() - started;
      if (context) await context.close().catch(() => {});
    }
  }
  record.status = 'failed';
  for (const name of expected) if (!record.shots.some((s) => s.name === name)) record.shots.push({ name, status: 'missing', reason: record.error });
  return record;
}

await mkdir(outDir, { recursive: true });
const indexFile = path.join(outDir, 'index.json');
// 앞선 실행의 기록이 있으면 이어 붙인다(일부만 다시 찍어도 나머지 기록이 남는다). 지금 계획에 없는 항목은 버린다.
// --resume 이면 이미 찍힌 항목은 건너뛴다. 없으면 고른 항목을 전부 다시 찍는다.
let previous = null;
if (await exists(indexFile)) previous = JSON.parse(await readFile(indexFile, 'utf8'));
const planIds = new Set(plan.map((item) => item.id));
if (previous) previous.items = previous.items.filter((r) => planIds.has(r.id));
const done = new Map((args.resume ? previous?.items ?? [] : []).filter((r) => r.status === 'ok').map((r) => [r.id, r]));

const browser = await launch();
const startedAt = new Date().toISOString();
const results = new Map(previous ? previous.items.map((r) => [r.id, r]) : []);
const meta = {
  label: args.label, baseUrl: target.base, startedAt, chrome: browser.version(), fixedTime: FIXED_TIME, timezone: TIMEZONE, fair: { ...FAIR, serverSeed: FAIR.serverSeed },
  chromeArgs: CHROME_ARGS, passes: PASSES, viewports: VIEWPORTS, planItems: plan.length, planShots: plan.reduce((n, i) => n + shotsOf(i).length, 0), filters: { groups, locales, widths, only },
};
const save = async () => writeFile(indexFile, JSON.stringify({ ...meta, finishedAt: new Date().toISOString(), items: Array.from(results.values()) }, null, 1));
let count = 0, failures = 0;
try {
  await pool(selected, workers, async (item) => {
    let record;
    if (done.has(item.id)) record = done.get(item.id);
    else {
      record = await runItem(browser, item);
      if (record.status !== 'ok') { failures++; console.log(`실패 ${item.id}: ${record.error}`); }
    }
    results.set(item.id, record);
    count++;
    if (count % 50 === 0) { console.log(`${count} / ${selected.length} (실패 ${failures})`); await save(); }
  });
} finally { await browser.close(); await save(); }
const all = Array.from(results.values());
const shotCount = (status) => all.reduce((n, r) => n + r.shots.filter((s) => s.status === status).length, 0);
console.log(`[${args.label}] 항목 ${all.length} (이번 실행 ${selected.length}, 실패 ${failures}), 촬영 ${shotCount('ok')}장, 해당 없음 ${shotCount('not-applicable')}, 못 찍음 ${shotCount('missing')}`);
console.log('기록: ' + indexFile);
if (failures) process.exitCode = 1;
