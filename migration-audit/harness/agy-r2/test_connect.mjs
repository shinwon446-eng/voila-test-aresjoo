import { launch, newContext, routeUrl, parseBase, settle, loadStates } from '../lib/common.mjs';

const origBase = parseBase('http://127.0.0.1:4175/voila-test-aresjoo');
const resBase = parseBase('http://127.0.0.1:4176/voila-test-aresjoo');

console.log('origBase:', origBase);
console.log('resBase:', resBase);

const browser = await launch();
const ctx = await newContext(browser, { width: 360, locale: 'ko' });
const page = await ctx.newPage();

const testUrl = routeUrl(origBase.base, 'ko', '/');
console.log('Navigating to:', testUrl);
await page.goto(testUrl);
await settle(page);
const title = await page.title();
console.log('ORIG Title:', title);

const resUrl = routeUrl(resBase.base, 'ko', '/');
await page.goto(resUrl);
await settle(page);
const resTitle = await page.title();
console.log('RES Title:', resTitle);

await browser.close();
console.log('Success!');
