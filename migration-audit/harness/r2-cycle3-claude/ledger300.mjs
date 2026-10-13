// 긴 세션: 한 계정에서 박스 300개를 연다(한 개 열기, 여러 개 열기, 받기, 묶음 받기를 섞는다). 같은 씨앗, 같은 차례를 두 빌드에 준다.
// 끝에서 저장된 장부 전부를 칸마다 견준다. 중간중간 힙과 DOM 노드 수, 리스너 수를 잰다.
//   node ledger300.mjs <build>         build: orig | result
import { launch, openSession, saveJson, SEL, heapMetrics } from './lib.mjs';

const build = process.argv[2];
if (!build) { console.error('사용법: node ledger300.mjs <orig|result>'); process.exit(2); }
const browser = await launch();
const log = { build, startedAt: new Date().toISOString(), steps: [], checkpoints: [], errors: [] };
const t = await openSession(browser, build, { preset: 'funded', width: 390, reducedMotion: 'reduce' });
const { page } = t;
let opened = 0;

const ledger = async () => {
  const s = await t.storage();
  const w = s['voila.browser-wallet.capture-account']?.state ?? {};
  const inv = s['voila.browser-inventory.capture-account']?.state?.items ?? [];
  return { balance: w.balance, crypto: w.cryptoBalance, wagered: w.totalWagered, txs: (w.transactions ?? []).length, items: inv.length, held: inv.filter((i) => i.status === 'IN_STORAGE').length, nonce: s['gachaflix.fair']?.state?.nonce };
};
const note = async (name, extra = {}) => { const l = await ledger(); log.steps.push({ n: log.steps.length + 1, name, opened, ...extra, ...l }); if (log.steps.length % 10 === 0) console.log(`[${build}] ${log.steps.length} ${name} opened=${opened} bal=${l.balance} txs=${l.txs} items=${l.items} nonce=${l.nonce}`); };
const checkpoint = async (name) => { const m = await heapMetrics(page); const bytes = await page.evaluate(() => { let n = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); n += k.length + (localStorage.getItem(k) ?? '').length; } return n; }); const dom = await page.evaluate(() => document.getElementsByTagName('*').length); log.checkpoints.push({ name, opened, ...m, dom, storageChars: bytes }); console.log(`[${build}] checkpoint ${name}: heap=${Math.round(m.heapUsed / 1024)}KB nodes=${m.nodes} listeners=${m.listeners} dom=${dom} storage=${bytes}`); };
const maybeConfirm = async () => { if (await page.locator(SEL.alert).first().waitFor({ state: 'visible', timeout: 1200 }).then(() => true, () => false)) { await t.confirm(); return true; } return false; };
const closeOp = async () => { await t.click('.v-op-top .v-op-tool', 1); await t.gone('.v-op'); };

/** 한 개 열기. mode: take(받고 닫기), keep(두고 닫기), again(받고 한 번 더 열기 단추로 이어 가기는 다음 호출이 한다) */
async function single(i, take, viaAgain) {
  await t.tick();
  if (viaAgain && await t.has('[data-open-again]:not([disabled])')) await t.click('[data-open-again]');
  else { if (await t.has('.v-op')) await closeOp(); if (!(await t.has(SEL.open))) { await note('single-blocked', { i }); return false; } await t.click(SEL.open); }
  const confirmed = await maybeConfirm();
  // 앞 결과의 화면이 남아 있을 수 있으므로 nonce 가 오른 것을 먼저 본다
  await page.waitForFunction(({ n, prefix }) => { const raw = localStorage.getItem(Storage.prototype.__voilaLab ? 'gachaflix.fair' : prefix + 'gachaflix.fair'); return (JSON.parse(raw ?? '{}').state?.nonce ?? -1) > n; }, { n: log.lastNonce ?? 0, prefix: t.state.prefix }, { timeout: 30000 }).catch(() => { log.errors.push('nonce 기다림 시간 초과 i=' + i); });
  await t.wait(SEL.opSettled, { timeout: 30000 });
  await page.waitForTimeout(450);
  opened += 1;
  let took = false;
  if (take && await t.has('[data-take-primary]')) { await t.tick(); await t.click('[data-take-primary]'); await t.wait(SEL.alert); await t.confirm(); await t.wait('[data-taken-title]'); took = true; }
  const l = await ledger(); log.lastNonce = l.nonce;
  await note('single', { i, confirmed, took });
  return true;
}

/** 여러 개 열기. chip: 수량 알약의 차례(1, 5, 10, 50, 100). mode: all(전부 받기), minus(하나 빼고 받기), keep(받지 않기) */
async function multi(chip, count, mode) {
  if (await t.has('.v-op')) await closeOp();
  await t.tick();
  await t.click(SEL.qty, chip);
  if (!(await t.has(SEL.open))) { await note('multi-blocked', { count }); await t.click(SEL.qty, 0); return false; }
  await t.click(SEL.open);
  const confirmed = await maybeConfirm();
  await t.wait('.v-reveal-result', { timeout: 120000 });
  await t.wait(SEL.revealArmed, { timeout: 30000 });
  opened += count;
  let took = null;
  if (mode !== 'keep' && await t.has('[data-take-batch]')) {
    await t.tick();
    await t.click('[data-take-batch]'); await t.wait('[data-take-all]'); await page.waitForTimeout(400);
    if (mode === 'minus' && await t.has('[data-take-row]')) await t.click('[data-take-row]', 0);
    for (let k = 0; k < 2 && !(await t.has('[data-take-submit]:not([disabled])')); k++) { await t.click('[data-take-all]'); await page.waitForTimeout(250); }
    took = await page.locator('[data-take-submit]').innerText();
    await t.click('[data-take-submit]'); await t.wait(SEL.alert); await t.confirm(); await t.wait('[data-take-done]', { timeout: 60000 });
    await t.click('[data-take-done]'); await page.waitForTimeout(300);
  }
  await t.click('.v-reveal > .v-sheet-close'); await t.gone('.v-reveal');
  await t.click(SEL.qty, 0);
  const l = await ledger(); log.lastNonce = l.nonce;
  await note('multi', { count, mode, confirmed, took });
  return true;
}

try {
  await t.goto('/box/dollar-apple'); await t.wait(SEL.open); await t.settle();
  await note('start'); await checkpoint('start box page');
  // 가: 1달러 박스. 한 개 20번(짝수는 받기, 셋에 하나는 "한 번 더" 단추로 이어 감)
  for (let i = 0; i < 20; i++) await single(i, i % 2 === 0, i % 3 === 1);
  await checkpoint('after 20 singles');
  for (const mode of ['all', 'minus', 'keep', 'all']) await multi(1, 5, mode);
  for (const mode of ['minus', 'keep']) await multi(2, 10, mode);
  await checkpoint('after 5s and 10s (60 opened on dollar-apple)');
  await multi(4, 100, 'all');
  await checkpoint('after first 100');
  await multi(4, 100, 'keep');
  await checkpoint('after second 100 (260 opened)');
  // 나: 50달러 박스(확인창이 뜬다). 한 개 5번, 다섯 개 1번
  await t.goto('/box/gaming-playstation'); await t.wait(SEL.open); await t.settle();
  for (let i = 0; i < 5; i++) await single(100 + i, i % 2 === 0, i === 3);
  await multi(1, 5, 'all');
  await checkpoint('after gaming-playstation (270 opened)');
  // 다: 가입 혜택 박스. 다섯 개 2번, 열 개 2번
  await t.goto('/box/pokemon-charizard'); await t.wait(SEL.qty); await t.settle();
  await multi(1, 5, 'minus'); await multi(1, 5, 'keep'); await multi(2, 10, 'all'); await multi(2, 10, 'minus');
  await checkpoint('end box page (300 opened)');
  log.final = await t.storage();
  log.opened = opened;
  // 수백 줄의 지갑 내역
  for (const [route, sel] of [['/wallet', '.v-main .v-title'], ['/inventory', '.v-main .v-chips'], ['/wins', '.v-main .v-title'], ['/verify', '.v-main .v-title']]) {
    const t0 = Date.now(); await t.goto(route); await t.wait(sel); await t.settle({ quiet: 400 });
    const info = await page.evaluate(() => ({ rows: document.querySelectorAll('.v-main .v-itemrow').length, dom: document.getElementsByTagName('*').length, more: Array.from(document.querySelectorAll('.v-main .v-btn--quiet')).map((b) => b.innerText), docHeight: document.documentElement.scrollHeight, firstRows: Array.from(document.querySelectorAll('.v-main .v-itemrow')).slice(0, 6).map((r) => r.innerText.replace(/\s+/g, ' ')) }));
    const m = await heapMetrics(page);
    log.checkpoints.push({ name: 'route ' + route, loadMs: Date.now() - t0, ...info, ...m });
    console.log(`[${build}] ${route}: rows=${info.rows} dom=${info.dom} more=${JSON.stringify(info.more)} heap=${Math.round(m.heapUsed / 1024)}KB`);
    await t.shot(`ledger300-${build}-${route.replace(/\//g, '')}`, { fullPage: false });
    if (route === '/wallet') {
      // 더 보기 단추가 있으면 끝까지 눌러 줄 수와 DOM 을 다시 잰다
      let clicks = 0;
      for (; clicks < 60; clicks++) { const more = page.locator('.v-main .v-btn--quiet').last(); if (!(await more.isVisible().catch(() => false))) break; await more.click(); await page.waitForTimeout(60); }
      const full = await page.evaluate(() => ({ rows: document.querySelectorAll('.v-main .v-itemrow').length, dom: document.getElementsByTagName('*').length, docHeight: document.documentElement.scrollHeight, kinds: Array.from(document.querySelectorAll('.v-main .v-itemrow .v-card-title')).reduce((acc, el) => { acc[el.innerText] = (acc[el.innerText] ?? 0) + 1; return acc; }, {}) }));
      const m2 = await heapMetrics(page);
      log.checkpoints.push({ name: 'wallet all rows', clicks, ...full, ...m2 });
      console.log(`[${build}] wallet all rows: clicks=${clicks} rows=${full.rows} dom=${full.dom} kinds=${JSON.stringify(full.kinds)}`);
      // 한 줄을 눌러 시트가 뜨는지
      const t1 = Date.now(); await page.locator('.v-main .v-itemrow').first().click(); const sheet = await t.wait(SEL.sheet).then(() => true, () => false);
      log.walletRowSheet = { opened: sheet, ms: Date.now() - t1, text: sheet ? (await page.locator(SEL.sheet).innerText()).replace(/\s+/g, ' ').slice(0, 300) : null };
      if (sheet) { await page.keyboard.press('Escape'); await t.gone(SEL.sheet).catch(() => {}); }
    }
  }
} catch (error) {
  log.errors.push(String(error.stack ?? error).slice(0, 1200));
  console.error(`[${build}] 멈춤: ${String(error.message).split('\n')[0]}`);
  await t.shot(`ledger300-${build}-error`);
  try { log.final = await t.storage(); log.opened = opened; } catch { /* 읽지 못함 */ }
}
log.console = t.errors; log.blocked = t.blocked.length; log.finishedAt = new Date().toISOString();
await saveJson(`ledger300-${build}.json`, log);
await t.close(); await browser.close();
console.log(`[${build}] 끝. 연 박스 ${opened}, 단계 ${log.steps.length}, 오류 ${log.errors.length}, 콘솔 ${t.errors.length}`);
