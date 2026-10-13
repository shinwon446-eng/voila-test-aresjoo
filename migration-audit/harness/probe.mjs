#!/usr/bin/env node
/**
 * 화면 하나의 조작 요소를 훑어 적는다(계획에 새 항목을 넣기 전에 선택자를 확인하는 보조 도구).
 *   node probe.mjs <baseUrl> <route> [--state funded] [--locale ko] [--width 390] [--click "css"]...
 * 판정 도구가 아니다. 결과는 표준 출력으로만 나온다.
 */
import { launch, newContext, guardNetwork, makeFixedState, installState, parseBase, routeUrl, settle, parseArgs, FIXED_TIME } from './lib/common.mjs';

const args = parseArgs(process.argv.slice(2), ['baseUrl', 'route']);
if (!args.baseUrl) { console.error('사용법: node probe.mjs <baseUrl> <route> [--state funded] [--locale ko] [--width 390] [--click css,css]'); process.exit(2); }
const target = parseBase(args.baseUrl);
const locale = args.locale ?? 'ko';
const browser = await launch();
try {
  const context = await newContext(browser, { width: Number(args.width ?? 390), locale });
  const log = [];
  await guardNetwork(context, target, log);
  await installState(context, await makeFixedState(args.state ?? 'guest', locale), target.origin);
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date(FIXED_TIME));
  page.on('pageerror', (e) => console.log('pageerror: ' + e.message));
  await page.goto(routeUrl(target.base, locale, args.route ?? ''), { waitUntil: 'domcontentloaded' });
  await settle(page);
  for (const css of String(args.click ?? '').split(';;').filter(Boolean)) { await page.locator(css).first().click(); await page.waitForTimeout(500); await settle(page); }
  const rows = await page.evaluate(() => {
    const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    return Array.from(document.querySelectorAll('button, a[href], input, select, textarea, summary, [role=dialog], [role=alertdialog], [role=status], [role=alert], h1, h2')).filter(visible).map((el) => {
      const attrs = Array.from(el.attributes).filter((a) => a.name.startsWith('data-') || a.name.startsWith('aria-') || ['role', 'type', 'href', 'placeholder', 'name', 'id'].includes(a.name)).map((a) => `${a.name}=${JSON.stringify(a.value.slice(0, 60))}`).join(' ');
      return `${el.tagName.toLowerCase()}.${String(el.className).replace(/\s+/g, '.')} ${attrs} :: ${(el.innerText ?? '').replace(/\s+/g, ' ').slice(0, 70)}`;
    });
  });
  console.log(page.url());
  for (const row of rows) console.log(row);
  if (log.length) console.log('끊은 요청: ' + JSON.stringify(log.slice(0, 10)));
} finally { await browser.close(); }
