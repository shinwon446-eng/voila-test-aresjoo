// 그림 요청이 전부 실패할 때 박스 화면에서 어떤 그림이 "깨진 그림"으로 남는지 두 빌드에서 적는다(흐름 L 의 5번 단계와 같은 조건).
import { launch, newContext, guardNetwork, makeFixedState, installState, parseBase, routeUrl, settle } from '../lib/common.mjs';
const browser = await launch();
for (const base of process.argv.slice(2)) {
  const target = parseBase(base);
  for (const width of [390, 1440]) {
    const context = await newContext(browser, { width, locale: 'ko', reducedMotion: 'no-preference' });
    await guardNetwork(context, target, []);
    await installState(context, await makeFixedState('funded', 'ko'), target.origin);
    await context.route(/\.(webp|png|jpe?g|avif)(\?.*)?$/, (route) => route.abort('failed'));
    const page = await context.newPage();
    await page.goto(routeUrl(target.base, 'ko', '/box/' + (process.env.SLUG ?? 'gaming-playstation')));
    await page.locator('.v-boxlayout').waitFor();
    await page.waitForTimeout(1500);
    await settle(page, { fullImages: false, timeout: 6000 });
    const out = await page.evaluate(() => {
      const imgs = Array.from(document.images);
      const zone = (img) => (img.closest('.v-boxlayout-reviews') ? 'reviews' : img.closest('.v-boxlayout-contents') ? 'contents' : img.closest('.v-boxlayout-hero') ? 'box-hero' : 'other');
      const broken = imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute('src'));
      const count = (list) => { const m = {}; for (const i of list) m[zone(i)] = (m[zone(i)] ?? 0) + 1; return m; };
      const first = document.querySelector('.v-boxlayout-contents img');
      return { images: imgs.length, byZone: count(imgs), lazy: imgs.filter((i) => i.loading === 'lazy').length, broken: broken.length, brokenByZone: count(broken), brokenTops: broken.map((i) => Math.round(i.getBoundingClientRect().top + scrollY)).sort((a, b) => a - b), notAttempted: imgs.filter((i) => !i.complete).length, contentsTop: first ? Math.round(first.getBoundingClientRect().top + scrollY) : null, viewport: innerHeight };
    });
    console.log(target.base.replace(/.*:(\d+).*/, '$1'), width, JSON.stringify(out));
    await context.close();
  }
}
await browser.close();
