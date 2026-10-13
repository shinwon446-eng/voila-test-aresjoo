#!/usr/bin/env node
/**
 * 사용자 흐름 검사(MISSION 8장의 시나리오 A 부터 L). 실제 브라우저에서 누르고, 단계마다 보이는 것과 저장된 것을 적는다.
 *
 *   node flows.mjs <label> <baseUrl> <outDir> [--variants ko-390,en-1440] [--only A,D] [--workers 3]
 *   예) node flows.mjs before-local http://127.0.0.1:4173/voila-test-aresjoo ../flows/before-local
 *
 * 만드는 것
 *   <outDir>/flows.json                 시나리오, 단계, 단계마다의 관찰값(화면의 글, 잔액, 보관함 상태, 거래, 저장 키)
 *   <outDir>/<시나리오>/<변형>/NN-단계.png  단계마다의 화면(증거)
 *   <outDir>/FLOWS.md                   단계별 상태 요약
 *
 * 단계의 상태
 *   done           실행했고 관찰값을 적었다(맞다는 뜻이 아니다. 견주는 일은 flows-compare.mjs 가 한다)
 *   cannot-verify  실행하지 않았다. 까닭을 적는다. 통과로 세지 않는다
 *   error          실행하다 실패했다. 그 시나리오는 거기서 멈춘다
 *
 * 지키는 것
 *   - 출금과 배송 신청은 내지 않는다. 입력이 검증된 상태까지만 본다(전부 브라우저 안의 시험 장부이지만 규칙은 지킨다).
 *   - 비밀번호를 넣는 단계는 로컬 주소(localhost, 127.0.0.1)에서만 실행한다. 원격 주소에서는 cannot-verify 로 적는다.
 *   - 이 사이트의 기준 경로 아래 GET 말고는 어떤 요청도 나가지 않는다(lib/common.mjs 의 guardNetwork).
 *   - 시계와 추첨 시드는 촬영 도구와 같은 값으로 고정한다. 움직임은 줄이지 않는다(실제 사용자의 조건).
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { applyPatch } from './lib/patches.mjs';
import { observeInPage, summarizeStorage } from './lib/observe.mjs';
import { FIXED_TIME, FAIR, pressConfirm, isConfirmButton, launch, newContext, guardNetwork, makeFixedState, installState, loadStates, parseBase, routeUrl, settle, readStorage, parseArgs, pool, safeName } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2), ['label', 'baseUrl', 'outDir']);
if (!args.label || !args.baseUrl || !args.outDir) { console.error('사용법: node flows.mjs <label> <baseUrl> <outDir> [--variants ko-390,en-1440] [--only A,D] [--workers 3]'); process.exit(2); }
const target = parseBase(args.baseUrl);
const outDir = path.resolve(args.outDir);
const variants = String(args.variants ?? 'ko-390,en-1440').split(',').map((v) => { const [locale, width] = v.split('-'); return { locale, width: Number(width), key: v }; });
const only = args.only ? String(args.only).split(',') : null;
const { credentials } = await loadStates();

const SEL = {
  login: '.v-header .v-headbtn:not(.v-menu-btn):not([data-balance-open])', balance: '[data-balance-open]', menu: '.v-menu-btn',
  sheet: '.v-sheet', alert: '[role="alertdialog"]', alertOk: '[role="alertdialog"] .v-btn', alertCancel: '[role="alertdialog"] .v-links .v-link',
  qty: '.v-openbar .v-chip', open: '[data-open-primary]', search: '.v-search input',
  opSettled: '.v-op[data-opening-state="settled"]', revealArmed: '.v-reveal-actions .v-btn:not([disabled])',
};

/** 시나리오 하나를 돌리는 틀. 단계마다 관찰값을 적는다. */
async function runScenario(browser, def, variant) {
  const record = { key: def.key, title: def.title, variant: variant.key, preset: def.preset, patch: def.patch ?? null, route: def.route, status: 'running', steps: [] };
  const dir = path.join(outDir, def.key, variant.key);
  await mkdir(dir, { recursive: true });
  const context = await newContext(browser, { width: variant.width, locale: variant.locale, reducedMotion: 'no-preference' });
  const blocked = [], consoleErrors = [];
  try {
    await guardNetwork(context, target, blocked);
    const state = applyPatch(await makeFixedState(def.preset, variant.locale), def.patch);
    await installState(context, state, target.origin);
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    await page.clock.setFixedTime(new Date(FIXED_TIME));
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text().split(target.base).join('').slice(0, 300)); });
    page.on('pageerror', (error) => consoleErrors.push('pageerror: ' + String(error.message).slice(0, 300)));
    page.on('dialog', (dialog) => { consoleErrors.push('dialog: ' + dialog.message().slice(0, 200)); void dialog.dismiss(); });
    let cursor = { console: 0, blocked: 0 };
    const snapshot = async (name, status, extra = {}) => {
      const n = record.steps.length + 1;
      const entry = { n, name, status, ...extra };
      if (status === 'done') {
        await settle(page, { fullImages: false, timeout: 6000, quiet: 200 }).catch(() => {});
        // 앱 밖의 화면(브라우저의 오류 화면 등)에서는 읽지 못한다. 그 사실을 그대로 적는다
        try { entry.observed = await page.evaluate(observeInPage, target.basePath); } catch (error) { entry.observed = { unreadable: String(error.message).split(/\r?\n/)[0].slice(0, 160), pageUrl: page.url().split(target.origin).join('') }; }
        try { entry.storage = summarizeStorage(await readStorage(page, state.prefix)); } catch (error) { entry.storage = { unreadable: String(error.message).split(/\r?\n/)[0].slice(0, 160) }; }
        entry.console = consoleErrors.slice(cursor.console); entry.blocked = blocked.slice(cursor.blocked).map((b) => `${b.method} ${b.url}`);
        cursor = { console: consoleErrors.length, blocked: blocked.length };
        await page.screenshot({ path: path.join(dir, `${String(n).padStart(2, '0')}-${safeName(name)}.png`), animations: 'disabled', caret: 'hide', timeout: 15000 }).catch((error) => { entry.shotError = String(error.message).split('\n')[0]; });
      }
      record.steps.push(entry);
    };
    const t = {
      page, context, state, variant, local: target.local,
      url: (route, locale = variant.locale) => routeUrl(target.base, locale, route),
      /** 행동 하나와 그 뒤의 관찰 */
      step: async (name, action) => { await action(); await snapshot(name, 'done'); },
      /** 실행하지 않은 단계. 까닭을 적는다 */
      cannot: async (name, reason) => snapshot(name, 'cannot-verify', { reason }),
      /** 단계 기록에 덧붙이는 값(예: 응답 상태) */
      note: (key, value) => { const last = record.steps[record.steps.length - 1]; if (last) (last.notes ??= {})[key] = value; },
      // 확인창의 확정 단추는 누르기 전에 시계를 1초 옮긴다(결과 빌드의 350ms 잠금, lib/common.mjs 의 tickClock). 두 빌드에서 똑같이 한다
      click: async (sel, nth = 0) => { if (isConfirmButton(sel)) { await pressConfirm(page, page.locator(sel).nth(nth)); return; } await page.locator(sel).nth(nth).click(); },
      fill: (sel, value, nth = 0) => page.locator(sel).nth(nth).fill(value),
      wait: (sel, options = {}) => page.locator(sel).first().waitFor({ state: 'visible', timeout: 12000, ...options }),
      gone: (sel) => page.locator(sel).first().waitFor({ state: 'detached', timeout: 12000 }),
      has: (sel) => page.locator(sel).first().isVisible().catch(() => false),
      pause: (ms) => page.waitForTimeout(ms),
    };
    try {
      const response = await page.goto(t.url(def.route), { waitUntil: 'domcontentloaded', timeout: 45000 });
      await snapshot('시작', 'done');
      t.note('httpStatus', response?.status() ?? null);
      await def.run(t);
      record.status = 'done';
    } catch (error) {
      record.status = 'error';
      record.steps.push({ n: record.steps.length + 1, name: '(멈춤)', status: 'error', error: String(error.message).split('\n')[0].slice(0, 400) });
      await page.screenshot({ path: path.join(dir, 'error.png'), timeout: 8000 }).catch(() => {});
    }
  } finally { await context.close().catch(() => {}); }
  return record;
}

// ── 시나리오 ─────────────────────────────────────────────────────────────────
const openAndSettle = async (t) => { await t.click(SEL.open); if (await t.page.locator(SEL.alert).first().waitFor({ state: 'visible', timeout: 1500 }).then(() => true, () => false)) await t.click(SEL.alertOk); };
const escape = (t) => t.page.keyboard.press('Escape');

const SCENARIOS = [
  { key: 'A', title: '비로그인 사용자가 박스를 둘러보고 상세를 확인', preset: 'guest', route: '', run: async (t) => {
    await t.step('더 보기', async () => { await t.click('.v-main .v-btn--quiet'); });
    await t.step('박스 고르기', async () => { await t.click('.v-boxcard[href*="/box/gaming-playstation/"]'); await t.page.waitForURL(/\/box\/gaming-playstation\/$/); await t.wait('.v-boxlayout'); });
    await t.step('대표 상품을 눌러 구성품으로 내려가기', async () => { await t.click('.v-mainitem'); await t.pause(900); });
    await t.step('사진 상품 상세 열기', async () => { await t.click('.v-main .v-item'); await t.wait(SEL.sheet); });
    await t.step('배송 가능 나라 펴기', async () => { await t.click('.v-sheet .v-links .v-link'); });
    await t.step('Escape 로 닫기', async () => { await escape(t); await t.gone(SEL.sheet); });
    await t.step('행 상품 상세 열기', async () => { await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); });
    await t.step('바깥을 눌러 닫기', async () => { await t.page.mouse.click(4, 40); await t.gone(SEL.sheet); });
    await t.step('상품별 확률표 펴기', async () => { await t.click('.v-boxlayout-odds details.v-notes summary'); await t.pause(200); });
    await t.step('확률표의 행 열기', async () => { await t.click('.v-boxlayout-odds details.v-notes .v-itemrow'); await t.wait(SEL.sheet); });
    await t.step('닫기 단추', async () => { await t.click('.v-sheet-close'); await t.gone(SEL.sheet); });
    await t.step('알아 둘 것 펴기', async () => { await t.click('details.v-boxlayout-notes summary'); await t.pause(200); });
    await t.step('뒤로 가기 링크', async () => { await t.click('.v-back'); await t.page.waitForURL(/\/(ko|en|zh)\/$/); await t.wait('.v-boxgrid'); });
    await t.step('브라우저 뒤로', async () => { await t.page.goBack(); await t.wait('.v-boxlayout'); });
    await t.step('브라우저 앞으로', async () => { await t.page.goForward(); await t.wait('.v-boxgrid'); });
    await t.step('주소로 바로 들어가기', async () => { await t.page.goto(t.url('/box/watch-rolex')); await t.wait('.v-boxlayout'); });
    await t.step('새로 고침', async () => { await t.page.reload(); await t.wait('.v-boxlayout'); });
    await t.step('메뉴 열기(좁은 폭에서만)', async () => { if (await t.has(SEL.menu)) { await t.click(SEL.menu); await t.wait(SEL.sheet); } });
  } },
  { key: 'B', title: '분류와 검색 조건을 바꾼 뒤 박스 고르기', preset: 'guest', route: '', run: async (t) => {
    await t.step('분류: 셋째 알약', async () => { await t.click('.v-main .v-chips .v-chip', 2); });
    await t.step('분류: 아홉째 알약', async () => { await t.click('.v-main .v-chips .v-chip', 8); });
    await t.step('분류: 전체', async () => { await t.click('.v-main .v-chips .v-chip', 0); });
    await t.cannot('정렬 바꾸기', '박스 목록 화면에 정렬을 바꾸는 조작 요소가 없다(components/box/BoxList.tsx). 누를 것이 없어 실행하지 않았다');
    await t.step('검색: rolex', async () => { await t.fill(SEL.search, 'rolex'); await t.pause(400); });
    await t.step('검색: 결과 없음', async () => { await t.fill(SEL.search, 'zzzzqqqq'); await t.pause(400); });
    await t.step('검색: 지우기', async () => { await t.fill(SEL.search, ''); await t.pause(400); });
    await t.step('검색: 30자 넘는 긴 글', async () => { await t.fill(SEL.search, 'playstation'.repeat(6)); await t.pause(400); });
    await t.step('검색: charizard', async () => { await t.fill(SEL.search, 'charizard'); await t.pause(400); });
    await t.step('검색 결과의 첫 행으로 박스 가기', async () => { await t.click('.v-main .v-itemrows a.v-itemrow'); await t.page.waitForURL(/\/box\//); await t.wait('.v-boxlayout'); });
    await t.step('수량 바꾸기: 5개', async () => { await t.click(SEL.qty, 1); });
    await t.step('수량 바꾸기: 100개', async () => { await t.click(SEL.qty, 4); });
  } },
  { key: 'C', title: '로그인하지 않은 사용자가 개봉을 시도', preset: 'guest', route: '/box/gaming-playstation', run: async (t) => {
    await t.step('수량 5개', async () => { await t.click(SEL.qty, 1); });
    await t.step('열기 단추 누르기', async () => { await t.click('.v-openbar .v-btn'); await t.wait(SEL.sheet); });
    await t.step('빈 이메일로 계속(입력 검증)', async () => { await t.click('.v-sheet button[type="submit"]'); await t.pause(300); });
    await t.step('이메일 입력', async () => { await t.fill('.v-sheet input', credentials.email); await t.click('.v-sheet button[type="submit"]'); await t.wait('.v-sheet input[type="password"]'); });
    if (t.local) {
      // 브라우저 안의 계정은 비밀번호를 바꾼 적이 없는 계정이면 어떤 비밀번호로도 들어간다(lib/browserAccount.ts 의 strictPassword).
      // 그래서 "틀린 비밀번호"의 결과를 정해 두지 않고, 누른 뒤의 화면과 저장값을 그대로 적는다
      await t.step('프리셋과 다른 비밀번호로 계속', async () => { await t.fill('.v-sheet input[type="password"]', 'NotThePresetPassword-000'); await t.click('.v-sheet button[type="submit"]'); await t.pause(2500); });
      await t.step('프리셋의 비밀번호로 로그인(앞 단계에서 이미 들어갔으면 아무것도 하지 않는다)', async () => { if (await t.has('.v-sheet input[type="password"]')) { await t.fill('.v-sheet input[type="password"]', credentials.password); await t.click('.v-sheet button[type="submit"]'); await t.wait(SEL.balance, { timeout: 20000 }); } await t.pause(500); });
      await t.step('로그인 뒤 새로 고침(수량은 처음으로, 로그인은 그대로인지)', async () => { await t.page.reload(); await t.wait('.v-openbar .v-btn'); await t.pause(800); });
    } else {
      await t.cannot('프리셋과 다른 비밀번호로 계속', '원격 주소에는 비밀번호를 넣지 않는다(작업 규칙). 로컬 빌드에서만 실행한다');
      await t.cannot('프리셋의 비밀번호로 로그인(앞 단계에서 이미 들어갔으면 아무것도 하지 않는다)', '원격 주소에는 비밀번호를 넣지 않는다(작업 규칙). 로컬 빌드에서만 실행한다');
      await t.cannot('로그인 뒤 새로 고침(수량은 처음으로, 로그인은 그대로인지)', '앞 단계를 실행하지 않았다');
    }
    await t.cannot('소셜 로그인(Google, Apple, Microsoft)', '바깥 로그인 서비스로 나가는 요청이다. 실행하지 않는다');
    await t.cannot('가입과 이메일 인증', '인증 메일을 받는 서버가 없다. 가입 화면은 촬영(overlay/signup)으로만 본다');
  } },
  { key: 'D', title: '로그인 사용자의 정상 개봉(한 개)', preset: 'funded', route: '/box/gaming-playstation', run: async (t) => {
    await t.step('열기 누르기(큰 금액 확인창)', async () => { await t.click(SEL.open); await t.wait(SEL.alert); });
    await t.step('확인창 취소', async () => { await t.click(SEL.alertCancel); await t.gone(SEL.alert); });
    await t.step('열기 확정과 결과', async () => { await t.click(SEL.open); await t.wait(SEL.alert); await t.click(SEL.alertOk); await t.wait(SEL.opSettled, { timeout: 20000 }); });
    await t.step('개봉 설정 열기', async () => { await t.click('.v-op-tool'); await t.wait(SEL.sheet); });
    await t.step('짧게 보기 켜기', async () => { await t.click('.v-op-toggle', 1); });
    await t.step('짧게 보기 끄기', async () => { await t.click('.v-op-toggle', 1); });
    await t.step('자동 받기 켜기(확인창)', async () => { await t.click('.v-op-toggle', 2); await t.wait(SEL.alert); });
    await t.step('자동 받기 취소', async () => { await t.click(SEL.alertCancel); await t.gone(SEL.alert); });
    await t.step('설정 닫기', async () => { await escape(t); await t.gone(SEL.sheet); });
    await t.step('USDT로 받기(확인창)', async () => { await t.click('[data-take-primary]'); await t.wait(SEL.alert); });
    await t.step('받기 취소', async () => { await escape(t); await t.gone(SEL.alert); });
    await t.step('받기 확정', async () => { await t.click('[data-take-primary]'); await t.wait(SEL.alert); await t.click(SEL.alertOk); await t.wait('[data-taken-title]'); await t.wait('[data-open-again]:not([disabled])'); });
    await t.step('결과 검증 시트', async () => { await t.click('.v-op-actions .v-links .v-link', 0); await t.wait(SEL.sheet); await t.wait('.v-sheet .v-line', { timeout: 10000 }); });
    await t.step('검증 시트 닫기', async () => { await escape(t); await t.gone(SEL.sheet); });
    await t.step('한 번 더 열기', async () => { await t.click('[data-open-again]'); await t.wait(SEL.alert); await t.click(SEL.alertOk); await t.page.waitForFunction(() => { const op = document.querySelector('.v-op'); return op?.dataset.openingState === 'settled' && !document.querySelector('[data-taken-title]'); }, null, { timeout: 20000 }); });
    await t.step('보관함에 두고 닫기', async () => { await t.click('.v-op-actions .v-links .v-link', 0); await t.gone('.v-op'); });
    await t.step('새로 고침 뒤의 장부', async () => { await t.page.reload(); await t.wait(SEL.open); });
    await t.step('잔액 시트', async () => { await t.click(SEL.balance); await t.wait(SEL.sheet); });
  } },
  { key: 'D2', title: '로그인 사용자의 정상 개봉(1달러 박스, 확인창 없음)', preset: 'funded', route: '/box/dollar-apple', run: async (t) => {
    await t.step('열기와 결과', async () => { await t.click(SEL.open); await t.wait(SEL.opSettled, { timeout: 20000 }); });
    await t.step('한 번 더 열기', async () => { await t.click('[data-open-again]'); await t.page.waitForFunction((n) => JSON.parse(localStorage.getItem('gachaflix.fair') ?? '{}').state?.nonce === n, 2, { timeout: 20000 }); await t.wait(SEL.opSettled, { timeout: 20000 }); await t.pause(1500); });
    await t.step('닫기', async () => { await t.click('.v-op-top .v-op-tool', 1); await t.gone('.v-op'); });
  } },
  { key: 'E', title: '잔액이 모자란 상태에서 개봉을 시도', preset: 'insufficient', route: '/box/gaming-playstation', run: async (t) => {
    await t.step('USDT 충전하기 누르기', async () => { await t.click('[data-short-charge]'); await t.wait(SEL.sheet); await t.pause(1500); });
    await t.step('네트워크 바꾸기', async () => { await t.click('.v-sheet .v-chip', 1); await t.pause(1500); });
    await t.step('충전 시트 닫기', async () => { await escape(t); await t.gone(SEL.sheet); });
    await t.step('수량 100개', async () => { await t.click(SEL.qty, 4); });
    await t.cannot('입금 뒤 잔액 반영', '입금을 확인하는 서버가 없다. 실제 돈을 보내지 않는다');
  } },
  { key: 'E2', title: '잔액이 모자라고 보관 상품이 있을 때(USDT로 받기가 먼저)', preset: 'inventory', patch: 'balanceQuarter', route: '/box/gaming-playstation', run: async (t) => {
    await t.step('USDT로 받기 선택 시트', async () => { await t.click('[data-short-take]'); await t.wait('[data-take-all]'); });
    await t.step('전체 선택', async () => { await t.click('[data-take-all]'); });
    await t.step('받기 확인창', async () => { await t.click('[data-take-submit]'); await t.wait(SEL.alert); });
    await t.step('받기 확정', async () => { await t.click(SEL.alertOk); await t.wait('[data-take-done]'); });
    await t.step('돌아오기(열기는 사람이 누른다)', async () => { await t.click('[data-take-done]'); await t.gone(SEL.sheet); await t.wait(SEL.open); });
  } },
  { key: 'F', title: '여러 개 개봉과 결과 확인', preset: 'funded', route: '/box/pokemon-charizard', run: async (t) => {
    await t.step('수량 5개', async () => { await t.click(SEL.qty, 1); });
    await t.step('열기와 결과', async () => { await openAndSettle(t); await t.wait('.v-reveal-result', { timeout: 20000 }); await t.wait(SEL.revealArmed); });
    await t.step('결과 행 하나 열기', async () => { await t.click('.v-resultrow button'); await t.wait(SEL.sheet); await t.pause(400); });
    await t.step('행 닫기', async () => { await escape(t); await t.gone(SEL.sheet); });
    await t.step('USDT로 받기 선택 시트(방금 나온 것)', async () => { if (await t.has('[data-take-batch]')) { await t.click('[data-take-batch]'); await t.wait('[data-take-all]'); } });
    await t.step('하나 빼기', async () => { if (await t.has('[data-take-row]')) await t.click('[data-take-row]', 0); });
    await t.step('받기 확정', async () => { if (await t.has('[data-take-submit]:not([disabled])')) { await t.click('[data-take-submit]'); await t.wait(SEL.alert); await t.click(SEL.alertOk); await t.wait('[data-take-done]'); } });
    await t.step('결과 화면으로 돌아오기', async () => { if (await t.has('[data-take-done]')) { await t.click('[data-take-done]'); await t.pause(300); } });
    await t.step('결과 닫기', async () => { await t.click('.v-reveal > .v-sheet-close'); await t.gone('.v-reveal'); });
    await t.step('수량 10개 열기(확인창)', async () => { await t.click(SEL.qty, 2); await t.click(SEL.open); await t.wait(SEL.alert); });
    await t.step('확인창 취소', async () => { await t.click(SEL.alertCancel); await t.gone(SEL.alert); });
    await t.step('보관함에서 확인', async () => { await t.page.goto(t.url('/inventory')); await t.wait('.v-main .v-chips'); });
  } },
  { key: 'F2', title: '여러 개 개봉(1달러 박스 5개, 확인창 없음)', preset: 'funded', route: '/box/dollar-apple', run: async (t) => {
    await t.step('수량 5개', async () => { await t.click(SEL.qty, 1); });
    await t.step('열기와 결과', async () => { await openAndSettle(t); await t.wait('.v-reveal-result', { timeout: 20000 }); await t.wait(SEL.revealArmed); });
    await t.step('결과 닫기', async () => { await t.click('.v-reveal > .v-sheet-close'); await t.gone('.v-reveal'); });
  } },
  { key: 'G', title: '상품을 보관함에서 확인', preset: 'inventory', route: '/inventory', run: async (t) => {
    await t.step('배송 탭', async () => { await t.click('.v-main .v-chips .v-chip', 1); });
    await t.step('받은 것 탭', async () => { await t.click('.v-main .v-chips .v-chip', 2); });
    await t.step('보관 중 탭', async () => { await t.click('.v-main .v-chips .v-chip', 0); });
    await t.step('상품 상세', async () => { await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); });
    await t.step('개봉 결과 검증', async () => { await t.page.locator('.v-sheet .v-links .v-link').last().click(); await t.wait('.v-sheet .v-section'); await t.pause(1200); });
    await t.step('검증 닫기(상세로 돌아옴)', async () => { await escape(t); await t.pause(400); });
    await t.step('상세 닫기', async () => { await escape(t); await t.gone(SEL.sheet); });
    await t.step('나온 상품 화면', async () => { await t.page.goto(t.url('/wins')); await t.wait('.v-main .v-title'); await t.pause(500); });
    await t.step('나온 상품의 행 열기', async () => { await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); });
    await t.step('계정 화면', async () => { await t.page.goto(t.url('/account')); await t.wait('.v-main .v-rows'); });
  } },
  { key: 'H', title: '상품의 배송과 USDT 전환 가능 상태', preset: 'inventory', route: '/inventory', run: async (t) => {
    await t.step('상품 상세', async () => { await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); });
    await t.step('배송 받기 시트', async () => { await t.click('.v-sheet .v-links .v-link', 0); await t.wait('.v-sheet input'); });
    await t.step('빈 채로 누르기(입력 검증)', async () => { await t.page.locator('.v-sheet .v-btn').last().click(); await t.pause(300); });
    await t.step('나라 바꾸기', async () => { await t.click('.v-sheet .v-chip', 1); await t.pause(200); });
    await t.step('수령 정보 채우기', async () => {
      const inputs = t.page.locator('.v-sheet input');
      const values = ['Parity Audit', '+6500000000', '000000', 'Fixture Road 1'];
      for (let i = 0; i < values.length; i++) await inputs.nth(i).fill(values[i]);
      const count = await inputs.count();
      if (count > values.length) await inputs.nth(values.length).fill('P123456789012');
    });
    await t.cannot('배송 신청 내기', '배송 신청은 실제로 내지 않는다(작업 규칙). 입력이 검증된 상태까지만 본다');
    await t.step('배송 시트 닫기', async () => { await escape(t); await t.pause(400); });
    await t.step('USDT로 받기(확인창)', async () => { if (!(await t.has('[data-take-primary]'))) { await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); } await t.click('[data-take-primary]'); await t.wait(SEL.alert); });
    await t.step('받기 확정', async () => { await t.click(SEL.alertOk); await t.gone(SEL.alert); await t.pause(600); });
    await t.step('받은 상품 상세', async () => { await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); });
    await t.step('지갑 내역', async () => { await t.page.goto(t.url('/wallet')); await t.wait('.v-main .v-itemrows'); });
    await t.step('내역 행 열기', async () => { await t.click('.v-main .v-itemrows .v-itemrow'); await t.pause(400); });
  } },
  { key: 'H2', title: '배송을 신청한 상품과 운송 중인 상품', preset: 'shipping', route: '/inventory', run: async (t) => {
    await t.step('배송 탭', async () => { await t.click('.v-main .v-chips .v-chip', 1); });
    await t.step('신청한 상품 상세', async () => { await t.click('.v-main .v-itemrows .v-itemrow', 0); await t.wait(SEL.sheet); });
    await t.step('배송 취소 확인창', async () => { await t.click('.v-sheet .v-btn'); await t.wait(SEL.alert); });
    await t.step('취소하지 않고 닫기', async () => { await t.click(SEL.alertCancel); await t.gone(SEL.alert); await escape(t); await t.gone(SEL.sheet); });
    await t.step('운송 중인 상품 상세', async () => { await t.click('.v-main .v-itemrows .v-itemrow', 1); await t.wait(SEL.sheet); });
    await t.cannot('운송장 조회와 배송 완료', '운송장을 내주는 서버와 택배사 조회가 없다. 바깥 주소로 나가지 않는다');
  } },
  { key: 'H3', title: '출금: 입력 검증까지', preset: 'funded', route: '/wallet/withdraw', run: async (t) => {
    await t.step('이메일 인증 경로 고르기', async () => { await t.click('.v-main .v-links .v-link'); await t.wait('.v-main form input'); });
    await t.step('빈 채로 다음', async () => { await t.click('.v-main form button[type="submit"]'); await t.pause(300); });
    await t.step('잘못된 주소와 최소 금액 미만', async () => { await t.fill('.v-main form input', 'not-an-address', 0); await t.fill('.v-main form input', '5', 1); await t.click('.v-main form button[type="submit"]'); await t.pause(300); });
    await t.step('잔액보다 큰 금액', async () => { await t.fill('.v-main form input', 'T' + '1'.repeat(33), 0); await t.fill('.v-main form input', '99999999', 1); await t.click('.v-main form button[type="submit"]'); await t.pause(300); });
    await t.step('비율 단추: 전액', async () => { await t.click('.v-main form .v-chips .v-chip', 4); await t.pause(200); });
    await t.step('네트워크 바꾸기', async () => { await t.click('.v-main form .v-chips .v-chip', 1); await t.pause(200); });
    await t.step('올바른 값으로 확인 단계', async () => { await t.click('.v-main form .v-chips .v-chip', 0); await t.fill('.v-main form input', '100', 1); await t.click('.v-main form button[type="submit"]'); await t.pause(500); });
    await t.cannot('인증과 출금 신청', '출금 신청은 실제로 내지 않는다(작업 규칙). 인증 메일을 보내는 서버도 없다');
  } },
  { key: 'I', title: '개봉 결과 검증', preset: 'funded', route: '/box/dollar-apple', run: async (t) => {
    await t.step('열기와 결과', async () => { await t.click(SEL.open); await t.wait(SEL.opSettled, { timeout: 20000 }); });
    await t.step('결과 화면의 검증 시트', async () => { await t.click('.v-op-actions .v-links .v-link', (await t.has('[data-take-primary]')) ? 1 : 0); await t.wait('.v-sheet .v-section'); await t.pause(1500); });
    await t.step('계산 방법 펴기', async () => { await t.click('.v-sheet .v-links .v-link', 0); await t.pause(300); });
    await t.step('검증 화면의 내 기록', async () => { await t.page.goto(t.url('/verify')); await t.wait('.v-main .v-itemrows .v-itemrow'); });
    await t.step('기록 하나 검증', async () => { await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait('.v-sheet .v-section'); await t.pause(1500); });
    await t.step('값을 직접 넣는 화면으로 가는 링크', async () => { await t.click('.v-sheet .v-links .v-link', 1); await t.pause(800); });
    await t.step('직접 계산', async () => { await t.page.locator('.v-main .v-btn').last().click(); await t.pause(1200); });
    await t.step('빈 값으로 계산(입력 오류)', async () => { await t.page.goto(t.url('/verify')); await t.wait('.v-main .v-field input'); await t.page.locator('.v-main .v-btn').last().click(); await t.pause(600); });
    await t.step('고정 시드로 계산(nonce 0)', async () => { await t.fill('.v-main .v-field input', FAIR.serverSeed, 0); await t.fill('.v-main .v-field input', FAIR.serverSeedHash, 1); await t.fill('.v-main .v-field input', FAIR.clientSeed, 2); await t.fill('.v-main .v-field input', '0', 3); await t.page.locator('.v-main .v-btn').last().click(); await t.pause(1200); });
    await t.step('틀린 잠금 값으로 계산', async () => { await t.fill('.v-main .v-field input', 'f'.repeat(64), 1); await t.page.locator('.v-main .v-btn').last().click(); await t.pause(1200); });
    await t.cannot('온체인 기록 대조', '결과를 체인에 올리는 서버가 없다. 화면에 그 상태가 어떻게 적히는지만 위 단계의 글로 남는다');
  } },
  { key: 'J', title: '후기 둘러보기와 후기 쓰기', preset: 'inventory', route: '/reviews', run: async (t) => {
    // 박스로 거르는 길은 화면이 주는 대로 간다. 박스 알약이 있으면 누르고(branch: chip), 없으면 박스 화면의 "후기 모두 보기"가 여는 주소로 들어간다(branch: query).
    // 어느 길로 갔는지는 단계 기록의 notes.branch 에 남는다. 두 빌드가 다른 길로 가면 비교에 그대로 드러난다
    let branch = null;
    await t.step('박스로 거르기', async () => {
      if ((await t.page.locator('.v-main .v-chips .v-chip').count()) > 1) { branch = 'chip'; await t.click('.v-main .v-chips .v-chip', 1); }
      else { branch = 'query'; await t.page.goto(t.url('/reviews?box=dollar-apple')); await t.wait('.v-main .v-title'); }
      await t.pause(500);
    });
    t.note('branch', branch);
    await t.step('전체로 돌아오기', async () => {
      if ((await t.page.locator('.v-main .v-chips .v-chip').count()) > 0) { branch = 'chip'; await t.click('.v-main .v-chips .v-chip', 0); }
      else { branch = 'goto'; await t.page.goto(t.url('/reviews')); await t.wait('.v-main .v-title'); }
      await t.pause(500);
    });
    t.note('branch', branch);
    await t.step('후기 하나 열기', async () => { await t.click('.v-rvcard-btn, .v-rv-btn'); await t.wait(SEL.sheet); });
    await t.step('닫기', async () => { await escape(t); await t.gone(SEL.sheet); });
    await t.step('박스 화면의 후기 절', async () => { await t.page.goto(t.url('/box/dollar-apple')); await t.wait('#reviews'); await t.page.locator('#reviews').scrollIntoViewIfNeeded(); });
    await t.step('보관함의 상품에서 후기 쓰기 열기', async () => { await t.page.goto(t.url('/inventory')); await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); await t.click('.v-rowlink'); await t.wait('.v-sheet textarea'); });
    await t.step('글 없이 올리기(입력 검증)', async () => { await t.page.locator('.v-sheet .v-btn').last().click(); await t.pause(300); });
    await t.step('별점과 글 넣기', async () => { await t.click('.v-sheet .v-chip', 3); await t.fill('.v-sheet textarea', 'Parity audit fixture review. Sealed box, arrived in six days, serial checked.'); });
    await t.step('올리기(브라우저 안에만 저장된다)', async () => { await t.page.locator('.v-sheet .v-btn').last().click(); await t.pause(1200); });
    await t.step('올린 뒤의 상품 상세', async () => { if (!(await t.has(SEL.sheet))) { await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); } });
    await t.cannot('사진 붙이기', '운영체제의 파일 고르는 창은 이 도구가 다루지 않는다. 실행하지 않았다');
    await t.cannot('후기의 서버 게시와 검수', '후기를 받는 서버가 없다. 브라우저 안의 저장까지만 본다');
  } },
  { key: 'J2', title: '내가 쓴 후기가 맨 앞에 오는가(박스 화면과 후기 모두 보기)', preset: 'inventory', route: '/inventory', run: async (t) => {
    // 2차 라운드 3차 사이클에서 고친 회귀의 확인. 후기를 하나 올린 뒤 박스 화면의 후기 절과 후기 화면에서 후기 카드의 차례를 읽는다.
    // 적는 값(notes.own): cards 는 보이는 후기 카드의 수, ownIndex 는 내 후기의 차례(0 이 맨 앞, 없으면 -1), first 는 맨 앞 카드의 글 앞부분
    const TEXT = 'Parity audit own-first check. Sealed box, arrived in six days.';
    const readOwn = (scope) => t.page.evaluate(([sel, needle]) => {
      const rootEl = document.querySelector(sel) ?? document.body;
      const all = Array.from(rootEl.querySelectorAll('.v-rvcard, .v-rv')).filter((el) => !el.parentElement?.closest('.v-rvcard, .v-rv') && el.getClientRects().length > 0);
      const texts = all.map((el) => (el.innerText || '').replace(/\s+/g, ' ').trim());
      return { cards: texts.length, ownIndex: texts.findIndex((x) => x.includes(needle)), first: (texts[0] ?? '').slice(0, 90) };
    }, [scope, TEXT.slice(0, 28)]);
    await t.step('보관함의 상품에서 후기 쓰기 열기', async () => { await t.click('.v-main .v-itemrows .v-itemrow'); await t.wait(SEL.sheet); await t.click('.v-rowlink'); await t.wait('.v-sheet textarea'); });
    await t.step('별점과 글을 넣고 올리기', async () => { await t.click('.v-sheet .v-chip', 3); await t.fill('.v-sheet textarea', TEXT); await t.page.locator('.v-sheet .v-btn').last().click(); await t.pause(1200); });
    await t.step('박스 화면의 후기 절', async () => { await t.page.goto(t.url('/box/dollar-apple')); await t.wait('#reviews'); await t.page.locator('#reviews').scrollIntoViewIfNeeded(); await t.pause(400); });
    t.note('own', await readOwn('#reviews'));
    await t.step('후기 모두 보기 화면', async () => { await t.page.goto(t.url('/reviews')); await t.wait('.v-main .v-title'); await t.pause(600); });
    t.note('own', await readOwn('.v-main'));
    await t.step('새로 고친 뒤의 후기 화면', async () => { await t.page.reload(); await t.wait('.v-main .v-title'); await t.pause(600); });
    t.note('own', await readOwn('.v-main'));
    // 묵은 후기: 방금 쓴 후기는 날짜로 줄 세워도 맨 앞이라 회귀를 가려내지 못한다. 저장된 내 후기의 시각을 40일 전으로 돌리고(저장소를 직접 고친다) 다시 읽는다
    const age = () => t.page.evaluate((prefix) => {
      const shimmed = Boolean(Storage.prototype.__voilaLab);
      const key = (shimmed ? '' : prefix) + 'gachaflix.community';
      const data = JSON.parse(localStorage.getItem(key));
      for (const r of data.state.mine) { r.at = '2026-09-02T03:00:00.000Z'; if (r.publishedAt) r.publishedAt = '2026-09-02T03:00:00.000Z'; }
      localStorage.setItem(key, JSON.stringify(data));
      return data.state.mine.length;
    }, t.state.prefix);
    await t.step('내 후기를 40일 전 것으로 돌리고 후기 화면을 새로 고침', async () => { await age(); await t.page.reload(); await t.wait('.v-main .v-title'); await t.pause(600); });
    t.note('own', await readOwn('.v-main'));
    await t.step('묵은 내 후기가 있는 박스 화면의 후기 절', async () => { await t.page.goto(t.url('/box/dollar-apple')); await t.wait('#reviews'); await t.page.locator('#reviews').scrollIntoViewIfNeeded(); await t.pause(400); });
    t.note('own', await readOwn('#reviews'));
  } },
  { key: 'K', title: '언어와 통화를 바꾼 뒤 이동과 새로 고침', preset: 'funded', route: '', run: async (t) => {
    const other = t.variant.locale === 'en' ? 'ko' : 'en';
    await t.step('통화 바꾸기', async () => { await t.page.locator('.v-footer-cols button').scrollIntoViewIfNeeded(); await t.click('.v-footer-cols button'); await t.pause(300); });
    await t.step('박스로 이동', async () => { await t.page.evaluate(() => window.scrollTo(0, 0)); await t.click('.v-boxcard[href*="/box/watch-rolex/"]'); await t.page.waitForURL(/\/box\/watch-rolex\/$/); await t.wait('.v-boxlayout'); });
    await t.step('새로 고침', async () => { await t.page.reload(); await t.wait('.v-boxlayout'); await t.pause(400); });
    await t.step('언어 바꾸기', async () => { await t.page.locator(`.v-footer-cols a[hreflang="${other}"]`).scrollIntoViewIfNeeded(); await t.click(`.v-footer-cols a[hreflang="${other}"]`); await t.page.waitForURL(new RegExp(`/${other}/box/watch-rolex/$`)); await t.wait('.v-boxlayout'); await t.pause(400); });
    await t.step('새로 고침(언어 유지)', async () => { await t.page.reload(); await t.wait('.v-boxlayout'); await t.pause(400); });
    await t.step('다른 화면으로 이동(지갑)', async () => { await t.page.goto(t.url('/wallet', other)); await t.wait('.v-main .v-title'); await t.pause(400); });
    await t.step('브라우저 뒤로', async () => { await t.page.goBack(); await t.wait('.v-boxlayout'); });
    await t.step('루트 주소로 들어가기(저장된 언어로 이동)', async () => { await t.page.goto(t.url('').replace(/\/(ko|en|zh)\/$/, '/')); await t.page.waitForURL(/\/(ko|en|zh)\/$/, { timeout: 15000 }); await t.wait('.v-boxgrid'); });
    await t.step('통화 되돌리기', async () => { await t.page.locator('.v-footer-cols button').scrollIntoViewIfNeeded(); await t.click('.v-footer-cols button'); await t.pause(300); });
    // 셋째 언어: 시작 언어도, 앞에서 바꿔 본 언어도 아닌 것(ko 로 시작하면 zh, en 이면 zh, zh 면 ko). 루트 주소가 보낸 화면의 언어에 그 링크가 없으면 다른 쪽 링크를 누른다
    const third = ['zh', 'ko', 'en'].find((l) => l !== t.variant.locale && l !== other);
    await t.step('셋째 언어로 바꾸기', async () => { const target = (await t.has(`.v-footer-cols a[hreflang="${third}"]`)) ? third : other; await t.click(`.v-footer-cols a[hreflang="${target}"]`); await t.page.waitForURL(new RegExp(`/${target}/$`)); await t.wait('.v-boxgrid'); await t.pause(300); });
  } },
  { key: 'L', title: '브라우저 오류, 네트워크 실패, 세션 만료', preset: 'funded', route: '', run: async (t) => {
    await t.step('연결 끊김', async () => { await t.context.setOffline(true); await t.pause(600); });
    await t.step('끊긴 채로 박스 누르기', async () => { await t.click('.v-boxcard'); await t.pause(2500); });
    await t.step('다시 연결', async () => { await t.context.setOffline(false); await t.pause(800); });
    await t.step('그림 요청이 전부 실패할 때', async () => { await t.context.route(/\.(webp|png|jpe?g|avif)(\?.*)?$/, (route) => route.abort('failed')); await t.page.goto(t.url('/box/gaming-playstation')); await t.wait('.v-boxlayout'); await t.pause(1200); });
    await t.step('그림 요청 되살리기', async () => { await t.context.unroute(/\.(webp|png|jpe?g|avif)(\?.*)?$/); await t.page.reload(); await t.wait('.v-boxlayout'); await t.pause(800); });
    await t.step('저장된 세션이 사라진 뒤 새로 고침', async () => { await t.page.evaluate(() => localStorage.removeItem('voila.browser-session.v1')); await t.page.reload(); await t.wait('.v-boxlayout'); await t.pause(800); });
    await t.step('세션 없이 지갑 열기', async () => { await t.page.goto(t.url('/wallet')); await t.wait('.v-main .v-title'); await t.pause(600); });
    await t.step('저장값이 깨졌을 때(지갑 JSON)', async () => { await t.page.evaluate(() => localStorage.setItem('gachaflix.wallet', '{broken')); await t.page.reload(); await t.wait('.v-main .v-title'); await t.pause(800); });
    await t.cannot('서버가 끝낸 세션(401)', '계정 서버가 없다(브라우저 안의 계정). 서버가 세션을 끝내는 경우는 만들 수 없다');
    await t.cannot('화면을 그리다 난 오류(error.tsx)', '사용자 조작으로 그 화면에 닿는 길을 찾지 못했다. 코드를 고치지 않고는 만들 수 없다');
    let status = null;
    await t.step('없는 주소', async () => { const response = await t.page.goto(t.url('/no-such-page')); status = response?.status() ?? null; await t.pause(600); });
    t.note('httpStatus', status);
    // 그 화면의 단추가 어디로 보내는지 그대로 적는다(기다리는 화면을 정해 두지 않는다)
    await t.step('없는 주소의 단추 누르기', async () => { await t.page.locator('.v-btn').first().click({ timeout: 5000 }).catch(() => {}); await t.pause(2500); });
  } },
];

// ── 실행 ─────────────────────────────────────────────────────────────────────
await mkdir(outDir, { recursive: true });
const jobs = [];
for (const def of SCENARIOS) if (!only || only.includes(def.key)) for (const variant of variants) jobs.push({ def, variant });
const browser = await launch();
const startedAt = new Date().toISOString();
const results = [];
try {
  await pool(jobs, Number(args.workers ?? 3), async ({ def, variant }) => {
    const record = await runScenario(browser, def, variant);
    results.push(record);
    const tally = (s) => record.steps.filter((x) => x.status === s).length;
    console.log(`${def.key} ${variant.key}: ${record.status}, 실행 ${tally('done')}, 검증 불가 ${tally('cannot-verify')}, 오류 ${tally('error')}${record.status === 'error' ? ' :: ' + record.steps.at(-1).error : ''}`);
  });
} finally { await browser.close(); }
// 일부 시나리오만 다시 돌렸으면 같은 폴더의 앞선 기록에 이어 붙인다(다시 돌린 것만 바뀐다)
const ran = results.length;
if (only) {
  try {
    const previous = JSON.parse(await readFile(path.join(outDir, 'flows.json'), 'utf8'));
    for (const old of previous.scenarios) if (!results.some((r) => r.key === old.key && r.variant === old.variant)) results.push(old);
  } catch { /* 앞선 기록이 없으면 이번 것만 적는다 */ }
}
results.sort((a, b) => (a.key + ' ' + a.variant < b.key + ' ' + b.variant ? -1 : 1));
const meta = { label: args.label, baseUrl: target.base, local: target.local, startedAt, finishedAt: new Date().toISOString(), fixedTime: FIXED_TIME, fair: FAIR, variants: variants.map((v) => v.key) };
await writeFile(path.join(outDir, 'flows.json'), JSON.stringify({ ...meta, scenarios: results }, null, 1));
const md = [`# 흐름 검사 기록: ${args.label}`, '', `주소: ${target.base}`, `시작: ${startedAt}`, '', '상태의 뜻: done 은 실행하고 관찰값을 적었다는 뜻이다(맞다는 뜻이 아니다). cannot-verify 는 실행하지 않았다는 뜻이고 통과로 세지 않는다.', ''];
for (const r of results) {
  md.push(`## ${r.key} ${r.title} (${r.variant}): ${r.status}`, '', '| 번호 | 단계 | 상태 | 비고 |', '|---|---|---|---|');
  for (const s of r.steps) md.push(`| ${s.n} | ${s.name} | ${s.status} | ${(s.reason ?? s.error ?? (s.console?.length ? '콘솔 오류 ' + s.console.length + '건' : '')).replace(/\|/g, '/')} |`);
  md.push('');
}
await writeFile(path.join(outDir, 'FLOWS.md'), md.join('\n'));
const errors = results.filter((r) => r.status === 'error').length;
console.log(`[${args.label}] 이번에 돌린 시나리오 ${ran}건, 기록에 있는 것 ${results.length}건, 멈춘 것 ${errors}건. 기록: ${path.join(outDir, 'flows.json')}`);
if (errors) process.exitCode = 1;
