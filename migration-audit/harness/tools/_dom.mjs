import { launch, newContext, guardNetwork, makeFixedState, installState, parseBase, routeUrl, settle } from '../lib/common.mjs';
const [base, route, sel, depth = '3', state = 'guest'] = process.argv.slice(2);
const target = parseBase(base);
const browser = await launch();
const context = await newContext(browser, { width: 390, locale: 'ko' });
await guardNetwork(context, target, []);
await installState(context, await makeFixedState(state, 'ko'), target.origin);
const page = await context.newPage();
await page.goto(routeUrl(target.base, 'ko', route));
await settle(page);
const out = await page.evaluate(({ sel, depth }) => {
  const walk = (el, d) => {
    const cls = el.getAttribute('class') ?? '';
    const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ').slice(0, 40);
    const line = '  '.repeat(Number(depth) - d) + el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (cls ? '.' + cls.split(/\s+/).join('.') : '') + (own ? ' :: ' + own : '');
    if (d <= 0) return [line];
    const kids = Array.from(el.children);
    const shown = kids.slice(0, 6).flatMap((k) => walk(k, d - 1));
    return [line, ...shown, ...(kids.length > 6 ? ['  '.repeat(Number(depth) - d + 1) + `... 외 ${kids.length - 6}`] : [])];
  };
  return Array.from(document.querySelectorAll(sel)).slice(0, 2).flatMap((el) => [...walk(el, Number(depth)), '---']);
}, { sel, depth });
console.log(out.join('\n'));
await browser.close();
