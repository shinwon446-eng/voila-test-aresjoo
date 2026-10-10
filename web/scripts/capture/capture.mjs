import { chromium } from 'playwright';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runChecks } from './checks.mjs';
import { makeState, installState, installRoutes, unavailable, presets } from './states.mjs';

const webRoot = fileURLToPath(new URL('../../', import.meta.url));
const reportPath = path.resolve(webRoot, '../qa/auto-report.json');
const baseURL = process.env.CAPTURE_BASE || 'http://localhost:3002'; // 개편 전 앱은 CAPTURE_BASE=http://localhost:3004
const viewports = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  mobile360: { viewport: { width: 360, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i];
  if (!['--plan', '--out', '--only', '--locales', '--viewports'].includes(key) || !process.argv[i + 1] || process.argv[i + 1].startsWith('--')) throw new Error('사용법: node scripts/capture/capture.mjs --plan 계획.json --out 출력폴더 [--only id] [--locales ko,en,zh] [--viewports mobile,desktop]');
  args[key.slice(2)] = process.argv[i + 1];
}
if (!args.plan || !args.out) throw new Error('--plan과 --out이 필요합니다.');
const plan = JSON.parse(await readFile(path.resolve(args.plan), 'utf8'));
const items = Array.isArray(plan) ? plan : plan.items;
if (!Array.isArray(items)) throw new Error('계획의 items 배열이 필요합니다.');
const locales = [...new Set((args.locales ?? 'ko,en,zh').split(','))];
const sizes = [...new Set((args.viewports ?? 'mobile,desktop').split(','))];
if (locales.some(l => !['ko', 'en', 'zh'].includes(l)) || sizes.some(v => !['mobile', 'desktop'].includes(v))) throw new Error('지원하지 않는 언어 또는 뷰포트');
const safeName = value => typeof value === 'string' && /^[a-zA-Z0-9_-]+$/.test(value);
const ids = new Set();
for (const item of items) {
  if (!safeName(item.id) || ids.has(item.id)) throw new Error(`항목 ID 오류: ${item.id}`);
  ids.add(item.id);
  if (typeof item.path !== 'string' || (!item.path.startsWith('/') && !['', '#', '?'].includes(item.path[0] ?? '')) || item.path.startsWith('//') || item.path.includes('..')) throw new Error(`${item.id}: 로케일 뒤의 경로가 필요합니다.`);
  if (!presets[item.state]) throw new Error(`${item.id}: 프리셋 오류`);
  if (!Array.isArray(item.steps)) throw new Error(`${item.id}: steps 배열이 필요합니다.`);
  const shots = new Set();
  for (const step of item.steps) {
    if (!['click', 'fill', 'wait', 'scroll', 'press', 'shot'].includes(step.action)) throw new Error(`${item.id}: 지원하지 않는 단계 ${step.action}`);
    if (step.action === 'shot') {
      if (!safeName(step.name) || shots.has(step.name) || shots.has(step.name + '-full')) throw new Error(`${item.id}: 촬영 이름 오류`);
      shots.add(step.name); shots.add(step.name + '-full');
    }
  }
}
const selected = items.filter(i => !args.only || args.only.split(',').some(part => i.id.includes(part)));
if (!selected.length) throw new Error('선택된 항목이 없습니다.');
const out = path.resolve(args.out);
await mkdir(out, { recursive: true });
await mkdir(path.dirname(reportPath), { recursive: true });
let previous = [];
try { previous = JSON.parse(await readFile(reportPath, 'utf8')); if (!Array.isArray(previous)) throw new Error('배열 형식이 아닙니다.'); }
catch (error) { if (error.code !== 'ENOENT') throw new Error(`기존 검사 결과를 보존하기 위해 중단합니다: ${error.message}`); }
const rows = [], results = [];
const summary = { startedAt: new Date().toISOString(), baseURL, plan: path.resolve(args.plan), totalPlanItems: items.length, selectedItems: selected.length, locales, viewports: [...sizes, 'mobile360'], unavailable, results };
// 동기화 프로그램이 파일을 잡고 있으면 이름 바꾸기가 잠깐 막힌다(EPERM, EBUSY). 몇 번 다시 해 보고, 그래도 안 되면 바로 쓴다.
const atomicJSON = async (target, value) => {
  const tmp = target + '.tmp', text = JSON.stringify(value, null, 2) + '\n';
  await writeFile(tmp, text);
  for (let i = 0; i < 6; i++) {
    try { await rename(tmp, target); return; }
    catch (error) { if (!['EPERM', 'EBUSY', 'EACCES'].includes(error.code)) throw error; await new Promise(r => setTimeout(r, 400 * (i + 1))); }
  }
  await writeFile(target, text);
};
const persist = async () => {
  await atomicJSON(path.join(out, 'results.json'), summary);
  await atomicJSON(reportPath, [...previous, ...rows.map(row => [...row.slice(0, 5), { ...row[5], runStartedAt: summary.startedAt }])]);
};
const dictionaries = Object.fromEntries(await Promise.all(locales.map(async l => [l, JSON.parse(await readFile(path.join(webRoot, 'messages', l + '.json'), 'utf8'))])));
function translated(spec, locale) {
  if (spec.key) {
    const value = spec.key.split('.').reduce((o, k) => o?.[k], dictionaries[locale]);
    if (typeof value !== 'string') throw new Error(`문구 키를 찾지 못함: ${spec.key}`);
    return Object.entries(spec.params ?? {}).reduce((s, [k, v]) => s.replaceAll('{' + k + '}', String(v)), value);
  }
  return typeof spec.name === 'object' ? spec.name[locale] : spec.name;
}
function locate(page, target, locale) {
  if (typeof target === 'string') return page.locator(target);
  if (!target) throw new Error('요소 선택자가 필요합니다.');
  const scope = target.scope ? page.locator(target.scope) : page;
  let locator;
  if (target.css) locator = scope.locator(target.css);
  else if (target.role) locator = scope.getByRole(target.role, { ...(translated(target, locale) ? { name: target.contains ? new RegExp(translated(target, locale).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) : translated(target, locale) } : {}), exact: !target.contains });
  else if (target.label) locator = scope.getByLabel(translated({ ...target, name: target.label }, locale), { exact: true });
  else if (target.text || target.key) locator = scope.getByText(translated({ ...target, name: target.text }, locale), { exact: !target.contains });
  else throw new Error('지원하지 않는 요소 선택자');
  return target.nth === undefined ? locator : locator.nth(target.nth);
}
async function settle(page, milliseconds = 350) {
  await page.waitForTimeout(milliseconds);
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 3000))]));
}
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const item of selected) for (const locale of locales) for (const viewport of [...sizes, 'mobile360']) {
    const record = { id: item.id, locale, viewport, state: item.state, status: '진행 중', files: [], shots: [], network: [] };
    results.push(record);
    let context, page, stepIndex = -1;
    const errors = [];
    const start = Date.now();
    try {
      if (item.unavailable) { record.status = '만들지 못함'; record.reason = item.unavailable; continue; }
      if (item.viewports && !item.viewports.includes(viewport === 'mobile360' ? 'mobile' : viewport)) { record.status = '해당 없음'; record.reason = '계획의 뷰포트 제한'; continue; }
      const state = await makeState(item.state, locale);
      context = await browser.newContext({ ...viewports[viewport], locale: { ko: 'ko-KR', en: 'en-US', zh: 'zh-CN' }[locale], timezoneId: 'Asia/Seoul',
        reducedMotion: item.motion === 'allow' ? 'no-preference' : 'reduce', serviceWorkers: 'block', acceptDownloads: false });
      await installState(context, state, baseURL);
      page = await context.newPage();
      page.setDefaultTimeout(item.timeout ?? 10000);
      page.on('console', msg => { if (msg.type() === 'error') errors.push({ type: 'console', text: msg.text(), location: msg.location() }); });
      page.on('pageerror', error => errors.push({ type: 'pageerror', text: error.message }));
      page.on('dialog', dialog => { errors.push({ type: 'dialog', text: dialog.message() }); void dialog.dismiss(); });
      await installRoutes(context, page, state, baseURL, record.network);
      const url = item.root ? baseURL + '/' : `${baseURL}/${locale}${item.path}`;
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      record.httpStatus = response?.status();
      if ((response?.status() ?? 0) >= 400 && !item.allowHttpError) throw new Error(`페이지 HTTP ${response?.status()}`);
      await settle(page, item.initialWait ?? 900);
      let errorCursor = 0;
      for (const [index, step] of item.steps.entries()) {
        stepIndex = index;
        if (step.viewports && !step.viewports.includes(viewport === 'mobile360' ? 'mobile' : viewport)) continue;
        const target = step.target ? locate(page, step.target, locale) : null;
        if (step.action === 'click') await target.click();
        else if (step.action === 'fill') {
          if (step.select !== undefined) await target.selectOption(step.select);
          else await target.fill(String(step.value));
        } else if (step.action === 'press') await (target ?? page.keyboard).press(step.key);
        else if (step.action === 'wait') {
          if (target) await target.waitFor({ state: step.state ?? 'visible', timeout: step.timeout ?? 15000 });
          else await page.waitForTimeout(step.ms ?? 500);
        } else if (step.action === 'scroll') {
          if (target) await target.scrollIntoViewIfNeeded();
          else await page.evaluate(({ x, y }) => window.scrollTo({ left: x ?? 0, top: y === 'bottom' ? document.documentElement.scrollHeight : y ?? 0, behavior: 'instant' }), step);
        } else if (step.action === 'shot') {
          await settle(page, step.settleMs ?? 250);
          if (step.expect) await locate(page, step.expect, locale).waitFor({ state: 'visible' });
          const makeName = name => `${item.id}-${name}-${locale}-${viewport}.png`;
          if (viewport !== 'mobile360') {
            const options = { animations: item.motion === 'allow' ? 'allow' : 'disabled', caret: 'hide', timeout: 20000 };
            const filename = makeName(step.name);
            await page.screenshot({ ...options, path: path.join(out, filename) });
            record.files.push(filename);
            const long = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) > innerHeight + 1);
            if (long || step.fullPage) {
              const full = makeName(step.name + '-full');
              await page.screenshot({ ...options, fullPage: true, path: path.join(out, full) });
              record.files.push(full);
            }
          }
          const findings = await runChecks(page, { id: item.id, locale, viewport, step: step.name }, errors.slice(errorCursor));
          errorCursor = errors.length;
          rows.push(...findings);
          record.shots.push({ name: step.name, findings: findings.length, url: page.url() });
          await persist();
        }
      }
      for (const error of errors.slice(errorCursor)) rows.push([item.id, locale, viewport, 'console-error', 'console', { ...error, step: '끝' }]);
      record.status = item.completionLimit ? '만들지 못함' : '완료';
      if (item.completionLimit) record.reason = item.completionLimit;
    } catch (error) {
      record.status = '실패'; record.failedStep = stepIndex; record.reason = error.message;
      rows.push([item.id, locale, viewport, 'capture-failed', 'document', { step: stepIndex, reason: error.message }]);
      for (const error of errors) rows.push([item.id, locale, viewport, 'console-error', 'console', { ...error, step: stepIndex }]);
      if (page && viewport !== 'mobile360') {
        const filename = `${item.id}-failed-${Math.max(0, stepIndex)}-${locale}-${viewport}.png`;
        try { await page.screenshot({ path: path.join(out, filename), timeout: 5000 }); record.files.push(filename); }
        catch { /* 페이지가 닫힌 경우 원래 실패 이유를 보존한다. */ }
      }
    } finally {
      record.durationMs = Date.now() - start;
      if (context) await context.close();
      await persist();
      console.log(`${item.id} / ${locale} / ${viewport}: ${record.status}, 이미지 ${record.files.length}개${record.reason ? ', ' + record.reason.split('\n')[0] : ''}`);
    }
  }
} finally { await browser.close(); summary.finishedAt = new Date().toISOString(); await persist(); }
console.log(`계획 ${items.length}개, 선택 ${selected.length}개, 이미지 ${results.reduce((n, r) => n + r.files.length, 0)}개, 검사 기록 ${rows.length}개`);
if (results.some(r => r.status === '실패')) process.exitCode = 1;
