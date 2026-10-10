import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import { installState, makeState } from '../../web/scripts/capture/states.mjs';
const require = createRequire(new URL('../../web/package.json', import.meta.url));
const { chromium } = require('playwright');
const base = 'http://localhost:3002';
const output = new URL('../work/codex2/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const mode = process.argv[2] || 'probe';
// Run from the repository root: rtk proxy node qa/codex/scenario2.mjs A
// Modes: A, B, C, C2, D, E, Eplus, F, G, V, L, W, R, T.
// Examples: rtk proxy node qa/codex/scenario2.mjs V
// Each process uses a fresh isolated context. No application files are changed.
const defaultPresets = { C:'funded', D:'insufficient', E:'inventory', Eplus:'inventory', F:'inventory', G:'funded', V:'inventory', W:'funded', R:'inventory', T:'funded' };
const preset = process.argv[3] || defaultPresets[mode] || 'guest';
const route = process.argv[4] || (['C','C2','D','T'].includes(mode) ? '/ko/box/dollar-apple' : ['E','Eplus','F','R'].includes(mode) ? '/ko/inventory' : mode==='V' ? '/ko/verify' : mode==='L' ? '/ko/legal' : mode==='W' ? '/ko/wallet' : '/ko');
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ko-KR' });
await installState(context, await makeState(preset, 'ko'), base);
const page = await context.newPage();
page.setDefaultTimeout(7000);
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 240)); });
page.on('dialog', async dialog => { console.log('NATIVE_DIALOG', dialog.type(), dialog.message()); await dialog.dismiss(); });
async function go(path) { await page.goto(base + path, { waitUntil: 'networkidle' }); }
async function snap(name) { await page.waitForTimeout(450); await page.screenshot({ path: fileURLToPath(new URL(name + '.png', output)) }); console.log('LAYOUT',name,JSON.stringify(await page.evaluate(()=>({width:innerWidth,doc:document.documentElement.scrollWidth})))); }
async function inspect(label) {
  console.log('\nINSPECT', label, page.url());
  const scope = await page.locator('.v-sheet').count() ? page.locator('.v-sheet') : await page.locator('.v-reveal-result').count() ? page.locator('.v-reveal-result') : page.locator('body');
  console.log(await scope.innerText());
  console.log('CONTROLS', JSON.stringify(await scope.locator('button,a,input,textarea,select').evaluateAll(els => els.map(e => ({ tag:e.tagName, role:e.getAttribute('role'), text:(e.innerText || e.getAttribute('aria-label') || e.getAttribute('placeholder') || '').slice(0,130), class:e.className, href:e.getAttribute('href'), type:e.getAttribute('type'), pressed:e.getAttribute('aria-pressed') })))));
}
async function record(label, selector = 'body') { await page.waitForTimeout(450); console.log('STEP', label, JSON.stringify((await page.locator(selector).innerText()).slice(0,2400))); await snap(label); }
async function closeSheet(parentRemains = false) { await page.locator('.v-sheet').getByRole('button', { name: '닫기', exact: true }).click(); if (parentRemains) await page.waitForTimeout(250); else await page.locator('.v-sheet').waitFor({ state: 'detached' }); }
async function selected() { return page.locator('.v-openbar .v-chip[aria-pressed="true"]').innerText(); }
async function ledger(label) {
  console.log('LEDGER', label, JSON.stringify(await page.evaluate(() => {
    const read = key => { try { const raw=JSON.parse(localStorage.getItem(key.replace(/^voila-test-aresjoo:/,''))); return raw?.state ?? raw; } catch { return null; } };
    const keys=Object.keys(localStorage).filter(k=>/gachaflix\.(wallet|inventory)$|browser-(wallet|inventory)\.capture-account$/.test(k));
    return keys.map(key=>{ const state=read(key); return {key,balance:state?.balance,transactions:state?.transactions?.map(t=>({type:t.type,amount:t.amountUsdt})),items:state?.items?.map(i=>({id:i.id,itemId:i.itemId,status:i.status,value:i.valueUsdt,box:i.boxSlug}))}; });
  })));
}
try {
  await go(route);
  if (mode === 'probe') { await inspect('initial'); await snap('probe-' + preset); }
  if (mode === 'A') {
    await record('A-01-home');
    await page.locator('a.v-boxcard').first().click();
    await page.locator('.v-strip-item').first().waitFor();
    await record('A-02-box', 'main');
    await page.locator('.v-strip-item').first().click();
    await record('A-03-product-sheet', '.v-sheet');
    await closeSheet();
    await snap('A-04-closed');
    await page.locator('.v-itemrow').first().click();
    await record('A-05-row-sheet', '.v-sheet');
    await closeSheet();
    await page.getByRole('heading', { name:'후기', exact:true }).scrollIntoViewIfNeeded();
    await record('A-06-reviews', 'main');
  }
  if (mode === 'B') {
    await page.getByRole('searchbox').fill('롤렉스');
    await record('B-01-results', 'main');
    console.log('SEARCH_LINKS', JSON.stringify(await page.locator('main a').evaluateAll(els=>els.map(e=>({text:e.innerText,href:e.getAttribute('href')})))));
    await page.locator('main a[href*="/box/"]').first().click();
    await page.getByRole('heading', { name:'시계 박스', exact:true }).waitFor();
    await record('B-02-box', 'main');
    console.log('DESTINATION', page.url());
  }
  if (mode === 'C') {
    await page.getByRole('button', { name:'5개', exact:true }).click();
    await record('C-01-five', '.v-openbar');
    await ledger('before');
    const started = Date.now();
    await page.locator('.v-openbar .v-btn').click();
    await page.locator('.v-reveal-result').waitFor({ timeout:20000 });
    console.log('RESULT_MS', Date.now()-started);
    await record('C-02-result', '.v-reveal-result');
    await ledger('after');
    await inspect('result-controls');
    const again = page.getByRole('button', { name:/한 번 더 열기/ });
    if (await again.count()) {
      await again.click();
      await page.waitForTimeout(2300);
      await page.locator('.v-reveal-result').waitFor({timeout:20000});
      await record('C-03-repeat', '.v-reveal-result');
      await ledger('repeat');
    } else {
      await page.getByText('보관함에서 받기',{exact:true}).click();
      await record('C-03-inventory','main');
    }
  }
  if (mode === 'C2') {
    await page.getByRole('button', { name:'5개', exact:true }).click();
    await record('C2-01-five', '.v-openbar');
    await page.locator('.v-openbar .v-btn').click();
    await record('C2-02-login', '.v-sheet');
    await closeSheet();
    await record('C2-03-preserved', '.v-openbar');
    console.log('SELECTED', await selected());
  }
  if (mode === 'D') {
    await record('D-01-insufficient', '.v-openbar');
    await page.getByRole('button', { name:'5개', exact:true }).click();
    await record('D-02-five', '.v-openbar');
    await page.locator('.v-openbar .v-btn').click();
    await page.waitForTimeout(1000);
    await record('D-03-charge', '.v-sheet');
    await inspect('charge-controls');
    const retry = page.getByRole('button', { name:'주소 다시 받기', exact:true });
    if (await retry.count()) { await retry.click(); await page.waitForTimeout(700); await record('D-04-retry', '.v-sheet'); }
    await closeSheet();
    await record('D-05-preserved', '.v-openbar');
    console.log('SELECTED', await selected());
  }
  if (mode === 'E') {
    await record('E-01-inventory','main');
    await page.locator('.v-itemrow').first().click();
    await record('E-02-item','.v-sheet');
    await page.getByRole('button', { name:'배송 받기', exact:true }).click();
    await record('E-03-shipping','.v-sheet');
    console.log('FIELDS',JSON.stringify(await page.locator('.v-sheet input,.v-sheet select').evaluateAll(els=>els.map(e=>({name:e.name,type:e.type,label:e.labels?.[0]?.textContent,placeholder:e.placeholder})))));
    await inspect('shipping-controls');
    await closeSheet(true);
    console.log('AFTER_SHIPPING_CLOSE', await page.locator('.v-sheet').count());
    if (await page.locator('.v-sheet').count() === 0) await page.locator('.v-itemrow').first().click();
    await page.getByRole('button', { name:/^USDT로 받기/ }).click();
    await record('E-04-confirm','.v-sheet');
    await inspect('claim-controls');
    await page.locator('.v-sheet .v-btn').click();
    await page.waitForTimeout(500);
    await record('E-05-after-claim','main');
    await ledger('claimed');
    await page.getByRole('button', { name:/^받은 것/ }).click();
    await record('E-06-received','main');
  }
  if (mode === 'Eplus') {
    await page.locator('.v-itemrow').first().click();
    const review=page.getByRole('button',{name:'후기 쓰기',exact:true});
    console.log('REVIEW_BEFORE_RECEIVING_ENABLED',await review.isEnabled());
    if (await review.isEnabled()) {
      await review.click(); await record('E-07-review-before-receiving','.v-sheet');
      await page.locator('.v-sheet textarea').fill('QA 검수용, 상품 수령 전 작성 여부 확인.');
      await page.getByRole('button',{name:'후기 올리기',exact:true}).click();
      await page.waitForTimeout(500);
      await record('E-09-review-submitted','body');
      await ledger('review-before-receiving');
      console.log('REVIEW_STORE',await page.evaluate(()=>localStorage.getItem('gachaflix.community')));
      if (await page.locator('.v-sheet textarea').count()) await closeSheet(true);
      if (await page.locator('.v-sheet').count() === 0) await page.locator('.v-itemrow').first().click();
    }
    await page.getByRole('button',{name:'배송 받기',exact:true}).click();
    await page.getByRole('button',{name:'싱가포르',exact:true}).click();
    await page.getByLabel('받는 사람',{exact:true}).fill('QA Test');
    await page.getByLabel('휴대폰 번호',{exact:true}).fill('+6590000000');
    await page.getByLabel('우편번호',{exact:true}).fill('000000');
    await page.getByLabel('주소 (상세 주소까지)',{exact:true}).fill('QA fixture address, no delivery');
    await page.getByRole('button',{name:'배송 신청',exact:true}).click();
    await record('E-08-shipping-submit','.v-sheet');
    await inspect('shipping-submit');
    await page.locator('.v-sheet .v-btn').click();
    await page.waitForTimeout(800);
    await record('E-10-shipping-response','body');
    await page.getByText(/배송.*못|요청.*못|처리.*못/).first().scrollIntoViewIfNeeded().catch(()=>{});
    await snap('E-11-shipping-error');
    console.log('SHIPPING_STORAGE'); await ledger('shipping');
    await go('/ko/box/dollar-apple');
    await page.getByRole('heading',{name:'후기',exact:true}).scrollIntoViewIfNeeded();
    await snap('E-12-unreceived-review-onbox');
    console.log('UNRECEIVED_REVIEW_VISIBLE',await page.getByText('QA 검수용, 상품 수령 전 작성 여부 확인.',{exact:true}).isVisible());
  }
  if (mode === 'F') {
    await page.locator('.v-itemrow').first().click();
    await page.getByRole('button', {name:'개봉 결과 검증',exact:true}).click();
    await record('F-01-verification','.v-sheet');
    await inspect('verification-controls');
    await page.getByRole('link',{name:'값을 직접 넣어 검증',exact:true}).click();
    await page.waitForURL('**/ko/verify**');
    await page.waitForTimeout(700);
    await record('F-03-manual-verification','main');
    console.log('MANUAL_VALUES',JSON.stringify(await page.locator('main input,main textarea').evaluateAll(els=>els.map(e=>({label:e.labels?.[0]?.textContent,placeholder:e.placeholder,value:e.value})))));
    await page.getByLabel('공개된 값',{exact:true}).scrollIntoViewIfNeeded();
    await record('F-05-manual-fields','main');
    await page.getByLabel('회차',{exact:true}).scrollIntoViewIfNeeded();
    await snap('F-06-default-box');
    console.log('MANUAL_DEFAULT_BOX',await page.locator('main .v-chip[aria-pressed="true"]').innerText());
    console.log('MANUAL_LAYOUT',JSON.stringify(await page.evaluate(()=>({width:innerWidth,docWidth:document.documentElement.scrollWidth,scrollX,selectedBoxes:Array.from(document.querySelectorAll('select')).map(e=>e.selectedOptions[0]?.textContent)}))));
    await go('/ko/box/dollar-apple');
    await page.getByRole('heading',{name:'후기',exact:true}).scrollIntoViewIfNeeded();
    await record('F-02-reviews','main');
  }
  if (mode === 'V') {
    await record('V-01-verify','main');
    await page.locator('.v-itemrow').first().click();
    await record('V-02-record','.v-sheet');
    await inspect('verify-record');
    await page.getByRole('link',{name:'값을 직접 넣어 검증',exact:true}).click();
    await page.waitForTimeout(600);
    console.log('SAME_ROUTE_SHEET_COUNT',await page.locator('.v-sheet').count());
    await snap('V-06-record-to-manual');
    if(await page.locator('.v-sheet').count()) await closeSheet();
    const state=await makeState('inventory','ko');
    const item=JSON.parse(state.values['gachaflix.inventory']).state.items[0];
    await page.getByLabel('공개된 값',{exact:true}).fill(item.fair.serverSeed);
    await page.getByLabel('미리 잠근 값 (선택)',{exact:true}).fill(item.fair.serverSeedHash);
    await page.getByLabel('내 기기 값',{exact:true}).fill(item.fair.clientSeed);
    await page.getByLabel('회차',{exact:true}).fill(String(item.fair.nonce));
    await page.getByRole('button',{name:'1달러 애플 박스',exact:true}).click();
    await snap('V-03-filled');
    await page.getByRole('button',{name:'계산하기',exact:true}).click();
    await record('V-04-calculated','main');
    await inspect('manual-result');
    await page.getByLabel('미리 잠근 값 (선택)',{exact:true}).fill('0'.repeat(64));
    await page.getByRole('button',{name:'계산하기',exact:true}).click();
    await record('V-05-mismatch','main');
  }
  if (mode === 'L') {
    await record('L-01-legal','main');
    await page.locator('main a[href="/ko/legal/terms"]').click();
    await page.getByRole('heading',{name:'서비스 이용약관',exact:true}).waitFor();
    await record('L-02-terms','main');
    await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
    await snap('L-03-terms-bottom');
    await inspect('terms');
    await page.locator('main').getByRole('link',{name:'정책 및 이용 안내',exact:true}).last().click();
    await page.getByRole('heading',{name:'정책 및 이용 안내',exact:true}).waitFor();
    await snap('L-04-return');
  }
  if (mode === 'W') {
    await record('W-01-wallet','main');
    await page.getByRole('link',{name:'출금',exact:true}).click();
    await page.getByRole('button',{name:'인증 앱 연결하기',exact:true}).waitFor();
    await record('W-02-gate','main');
    await inspect('withdraw-gate');
    await page.getByRole('button',{name:'인증 앱 연결하기',exact:true}).click();
    await record('W-03-auth-app','.v-sheet');
    console.log('SETUP_FIELDS',JSON.stringify(await page.locator('.v-sheet input,.v-sheet img,.v-sheet svg,.v-sheet canvas').evaluateAll(es=>es.map(e=>({tag:e.tagName,type:e.type,alt:e.getAttribute('alt'),label:e.labels?.[0]?.textContent,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})))));
    await closeSheet(true);
    await record('W-04-close','body');
  }
  if (mode === 'R') {
    await page.locator('.v-itemrow').first().click();
    await page.getByRole('button',{name:'후기 쓰기',exact:true}).click();
    await page.locator('.v-sheet textarea').fill('QA 2차 수령 구분 확인');
    await page.getByRole('button',{name:'후기 올리기',exact:true}).click();
    await go('/ko/box/dollar-apple');
    await page.getByRole('heading',{name:'후기',exact:true}).scrollIntoViewIfNeeded();
    await snap('R-01-opened-review');
    console.log('OPENED_REVIEW',await page.locator('main').innerText().then(t=>t.slice(t.indexOf('\n후기\n'))));
    await go('/ko/inventory');
    await page.locator('.v-itemrow').first().click();
    await page.getByRole('button',{name:/^USDT로 받기/}).click();
    await page.locator('.v-sheet .v-btn').click();
    await page.getByRole('button',{name:'받은 것 1',exact:true}).waitFor();
    await ledger('review-claimed');
    await go('/ko/box/dollar-apple');
    await page.getByRole('heading',{name:'후기',exact:true}).scrollIntoViewIfNeeded();
    await snap('R-02-received-review');
    console.log('RECEIVED_REVIEW',await page.locator('main').innerText().then(t=>t.slice(t.indexOf('\n후기\n'))));
  }
  if(mode === 'T') {
    await page.locator('.v-openbar .v-btn').click();
    await page.locator('.v-reveal-result').waitFor({timeout:20000});
    await page.getByRole('button',{name:'개봉 결과 검증',exact:true}).click();
    await record('T-01-fresh-values','.v-sheet');
    console.log('VALUE_DOM',JSON.stringify(await page.locator('.v-sheet [title],.v-sheet [data-value],.v-sheet code,.v-sheet .v-row').evaluateAll(es=>es.map(e=>({text:e.textContent,title:e.getAttribute('title'),data:e.getAttribute('data-value')})))));
    await page.getByRole('link',{name:'값을 직접 넣어 검증',exact:true}).click();
    await page.waitForURL('**/ko/verify');
    await page.getByLabel('회차',{exact:true}).scrollIntoViewIfNeeded();
    await snap('T-02-fresh-manual-empty');
    console.log('FRESH_MANUAL_FIELDS',JSON.stringify(await page.locator('main input').evaluateAll(es=>es.map(e=>({label:e.labels?.[0]?.textContent,value:e.value})))));
  }
  if (mode === 'G') {
    console.log('HOME_BEFORE',await page.locator('a.v-boxcard').first().innerText());
    await page.locator('a.v-boxcard[href="/ko/box/dollar-gaming"]').click();
    await page.locator('.v-openbar .v-btn').click();
    await page.locator('.v-reveal-result').waitFor({timeout:20000});
    await record('G-01-gaming-result','.v-reveal-result');
    await ledger('gaming-result');
    await page.getByRole('button',{name:'개봉 결과 검증',exact:true}).click();
    await record('G-04-fresh-verification','.v-sheet');
    await closeSheet();
    await page.locator('.v-reveal-result').getByRole('link',{name:'박스 목록',exact:true}).click();
    await page.locator('a.v-boxcard').first().waitFor();
    console.log('HOME_AFTER',await page.locator('a.v-boxcard').first().innerText());
    await record('G-02-home','main');
    await page.getByRole('button',{name:'메뉴',exact:true}).click();
    await page.locator('.v-sheet').getByRole('link',{name:'계정',exact:true}).click();
    await page.getByRole('heading',{name:'계정',exact:true}).waitFor();
    await record('G-03-account','main');
    await ledger('account');
  }
} catch(e) { console.log('SCRIPT_ERROR', e.stack); await snap('error-' + mode); process.exitCode = 1; }
finally { console.log('ERRORS', JSON.stringify(errors)); await browser.close(); }
