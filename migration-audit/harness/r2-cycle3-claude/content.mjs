// 샘플 후기를 손님이 보는 그대로 읽는다: 박스 열둘(ko)의 처음 30건, 박스 넷(en, zh)의 처음 15건, 모아 보기(ko)의 처음 40건.
// 화면의 글을 그대로 적어 out/content.json 과 out/content.txt 로 남긴다(판단은 사람이 읽고 한다).
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launch, openSession, saveJson, OUT } from './lib.mjs';

const KO = ['car-rolls-royce', 'watch-rolex', 'bag-hermes', 'jewelry-cartier', 'fashion-nike', 'mobile-apple', 'computer-apple', 'gaming-playstation', 'audio-sony', 'camera-canon', 'home-lg', 'pokemon-charizard'];
const OTHER = ['watch-rolex', 'pokemon-charizard', 'mobile-apple', 'bag-hermes'];
const browser = await launch();
const out = { boxes: [], all: null };
const readCards = (page) => page.evaluate(() => Array.from(document.querySelectorAll('.v-rv')).map((li) => {
  const q = (s) => li.querySelector(s);
  return {
    stars: li.querySelectorAll('.v-rv-head .v-star:not(.v-star--off)').length,
    author: q('.v-rv-author')?.innerText ?? '', ago: q('.v-rv-ago')?.innerText ?? '', text: q('.v-rv-text')?.innerText ?? '',
    item: q('.v-rv-itemname')?.innerText ?? '', price: q('.v-rv-itembody .v-small')?.innerText ?? '', photo: !!q('.v-rv-photo img'), photoSrc: q('.v-rv-photo img')?.getAttribute('src')?.split('/').slice(-2).join('/') ?? null,
    likes: Array.from(li.querySelectorAll('.v-rv-btn > .v-small')).map((e) => e.innerText).join(' '), cut: !!q('.v-rvcard-more'),
  };
}));
try {
  const jobs = [...KO.map((slug) => ({ slug, locale: 'ko', n: 30 })), ...OTHER.flatMap((slug) => [{ slug, locale: 'en', n: 15 }, { slug, locale: 'zh', n: 15 }])];
  for (const job of jobs) {
    const t = await openSession(browser, 'result', { preset: 'guest', locale: job.locale, width: 390 });
    await t.goto('/box/' + job.slug); await t.wait('#reviews'); await t.settle();
    const head = await t.page.evaluate(() => ({ title: document.querySelector('.v-main h1')?.innerText, rating: document.querySelector('.v-main .v-rating')?.getAttribute('aria-label'), sum: document.querySelector('#reviews .v-rvsum')?.innerText.replace(/\s+/g, ' '), total: document.querySelector('#reviews .v-rv-total')?.innerText, price: document.querySelector('[data-open-primary], .v-openbar .v-btn')?.innerText, items: Array.from(document.querySelectorAll('.v-main .v-item, .v-main .v-itemrows .v-itemrow')).slice(0, 400).map((e) => e.innerText.replace(/\s+/g, ' ')).length }));
    const first5 = await readCards(t.page);
    if (job.locale === 'ko' && ['watch-rolex', 'pokemon-charizard', 'home-lg'].includes(job.slug)) { await t.page.locator('#reviews').scrollIntoViewIfNeeded(); await t.shot(`content-${job.slug}-ko-first`, { fullPage: false }); }
    while ((await t.page.locator('.v-rv').count()) < job.n) { const more = t.page.locator('[data-reviews-more]'); if (!(await more.isVisible().catch(() => false))) break; await more.click(); await t.page.waitForTimeout(150); }
    const cards = (await readCards(t.page)).slice(0, job.n);
    out.boxes.push({ ...job, head, first5Count: first5.length, cards, errors: t.errors });
    console.log(`${job.locale} ${job.slug}: ${cards.length}건, ${head.total}`);
    await t.close();
  }
  const t = await openSession(browser, 'result', { preset: 'guest', locale: 'ko', width: 390 });
  await t.goto('/reviews'); await t.wait('.v-rv'); await t.settle();
  await t.page.locator('[data-reviews-more]').click().catch(() => {}); await t.page.waitForTimeout(300);
  out.all = { head: await t.page.evaluate(() => ({ sum: document.querySelector('.v-rvsum')?.innerText.replace(/\s+/g, ' '), total: document.querySelector('.v-rv-total')?.innerText })), cards: (await readCards(t.page)).slice(0, 40) };
  await t.shot('content-reviews-all-ko', { fullPage: false });
  await t.close();
} finally { await browser.close(); }
await saveJson('content.json', out);
const lines = [];
for (const b of out.boxes) {
  lines.push('', `=== ${b.locale} ${b.slug} | ${b.head.title} | ${b.head.price} | ${b.head.rating} | ${b.head.total} | ${b.head.sum}`);
  b.cards.forEach((c, i) => lines.push(`${String(i + 1).padStart(2)} ★${c.stars} [${c.author}] ${c.ago} | ${c.item} (${c.price})${c.photo ? ' [사진]' : ''} ${c.likes}\n   ${c.text.replace(/\n/g, ' / ')}`));
}
lines.push('', `=== ko /reviews 전체 | ${out.all.head.total} | ${out.all.head.sum}`);
out.all.cards.forEach((c, i) => lines.push(`${String(i + 1).padStart(2)} ★${c.stars} [${c.author}] ${c.ago} | ${c.item} (${c.price})${c.photo ? ' [사진]' : ''} ${c.likes}\n   ${c.text.replace(/\n/g, ' / ')}`));
await writeFile(path.join(OUT, 'content.txt'), lines.join('\n'));
console.log('끝', out.boxes.length);
