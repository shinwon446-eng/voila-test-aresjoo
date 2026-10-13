/**
 * 흐름 검사에서 단계마다 적는 "보이는 것"과 "저장된 것".
 * 두 환경의 기록을 칸마다 견줄 수 있게, 화면의 글은 종류별로 나누고 저장값은 장부의 뜻이 있는 칸만 남긴다.
 */

/** 브라우저 안에서 돈다. 화면에 지금 보이는 것만 적는다. */
export function observeInPage(basePath) {
  const visible = (el) => { const r = el.getBoundingClientRect(); if (r.width <= 0 || r.height <= 0) return false; const s = getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none'; };
  const clean = (text) => String(text ?? '').replace(/\s+/g, ' ').trim();
  const all = (sel, root = document) => Array.from(root.querySelectorAll(sel)).filter(visible);
  const texts = (sel, limit = 20, root = document) => all(sel, root).slice(0, limit).map((el) => clean(el.innerText));
  // 겹침 화면이 떠 있으면 그 아래 화면은 "가려진 것"이다. 맨 위의 것을 따로 적는다
  const dialogs = all('[role="dialog"], [role="alertdialog"]').map((el) => ({
    role: el.getAttribute('role'), cls: String(el.className).split(/\s+/)[0],
    title: clean(el.querySelector('h2, h1')?.innerText), text: clean(el.innerText).slice(0, 1500),
    buttons: all('.v-btn', el).map((b) => ({ text: clean(b.innerText), disabled: b.disabled || undefined })),
    links: texts('.v-link', 8, el), lines: texts('.v-line', 8, el), inputs: all('input, textarea', el).map((i) => ({ type: i.type, value: i.type === 'password' ? '(가림)' : i.value })),
    checks: all('[role="checkbox"], [role="switch"]', el).map((c) => c.getAttribute('aria-checked')),
  }));
  const main = document.querySelector('.v-main');
  const op = document.querySelector('.v-op');
  const reveal = document.querySelector('.v-reveal');
  const pathname = location.pathname.startsWith(basePath) ? location.pathname.slice(basePath.length) || '/' : location.pathname;
  // 후기 자리(후기 구역, 별점 줄, 카드의 별점). 결과 빌드에서 달라지기로 한 자리다(MIGRATION_SPEC 1절).
  // 이 자리의 것은 reviewZone 에 따로 적고, 나머지 칸에서는 뺀다. 그래야 "후기 자리 밖은 그대로인가"를 칸으로 견줄 수 있다
  const RZ = '.v-boxlayout-reviews, .v-ratinglink, .v-boxcard-rating, .v-rvsum, .v-rvfeed, .v-rvgrid, .v-rvcard, .v-rv';
  const outside = (el) => !el.closest(RZ);
  const inMain = (sel, limit) => (main ? all(sel, main).filter(outside).slice(0, limit) : []);
  const hash = (text) => { let h = 2166136261; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
  // 본문에서 후기 자리를 뺀 글 전부(접힌 것 포함). 길이와 해시로 적는다
  let rest = '';
  if (main) { const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT); for (let n = walker.nextNode(); n; n = walker.nextNode()) { const p = n.parentElement; if (!p || p.closest(RZ) || p.closest('script, style')) continue; const t = n.textContent.trim(); if (t) rest += t + ' '; } }
  const zoneRoots = Array.from(document.querySelectorAll(RZ)).filter((el) => visible(el) && !el.parentElement.closest(RZ));
  const zoneText = zoneRoots.map((el) => clean(el.innerText)).join(' ');
  return {
    path: pathname + location.search + location.hash,
    lang: document.documentElement.lang,
    title: clean(main?.querySelector('h1')?.innerText),
    desc: clean(main?.querySelector('.v-desc')?.innerText),
    header: texts('.v-header .v-headbtn:not(.v-menu-btn)', 3),
    offline: texts('.v-offline', 3),
    lines: inMain('.v-line', 12).map((el) => clean(el.innerText)),
    empty: inMain('.v-empty', 6).map((el) => clean(el.innerText)),
    buttons: inMain('.v-btn', 14).map((b) => ({ text: clean(b.innerText), disabled: b.disabled || undefined })),
    links: inMain('.v-link', 14).map((el) => clean(el.innerText)),
    chips: inMain('.v-chips', 6).map((g) => ({ label: g.getAttribute('aria-label'), count: g.querySelectorAll('.v-chip').length, pressed: Array.from(g.querySelectorAll('.v-chip[aria-pressed="true"]')).map((c) => clean(c.innerText)) })),
    rows: inMain('.v-row', 40).map((el) => clean(el.innerText)),
    counts: { boxcards: document.querySelectorAll('.v-boxcard').length, items: document.querySelectorAll('.v-main .v-item').length, itemrows: inMain('.v-itemrow', 100000).length, images: Array.from(document.images).filter(outside).length, brokenImages: Array.from(document.images).filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).length },
    // 박스 카드: 이름과 가격만(별점 줄은 reviewZone 에)
    boxcards: all('.v-boxcard').slice(0, 8).map((card) => ({ title: clean(card.querySelector('.v-card-title')?.innerText), price: clean(card.querySelector('.v-boxcard-body > .v-num')?.innerText), href: (card.getAttribute('href') ?? '').split('/').slice(-3).join('/') })),
    itemrows: inMain('.v-itemrow', 12).map((el) => clean(el.innerText)),
    inputs: inMain('input, textarea', 10).map((i) => ({ type: i.type, value: i.type === 'password' ? '(가림)' : i.value, placeholder: i.placeholder || undefined })),
    details: Array.from(document.querySelectorAll('details')).map((d) => d.open),
    dialogs,
    opening: op ? { phase: op.dataset.phase, state: op.dataset.openingState, tone: op.dataset.tone, kind: op.dataset.kind, short: op.dataset.short ?? null, text: clean(op.innerText).slice(0, 900) } : null,
    reveal: reveal && !op ? { text: clean(reveal.innerText).slice(0, 1800), rows: texts('.v-resultrow', 110, reveal) } : null,
    toast: texts('.v-toast', 3),
    scrolled: window.scrollY > 4,
    bodyLocked: document.body.style.overflow === 'hidden',
    focus: (() => { const el = document.activeElement; return el && el !== document.body ? el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(/\s+/)[0] : '') : null; })(),
    mainOutsideReviews: { length: rest.length, hash: hash(rest) },
    reviewZone: {
      roots: zoneRoots.map((el) => String(el.getAttribute('class') ?? '').split(/\s+/)[0]),
      textLength: zoneText.length, textHash: hash(zoneText), sample: zoneText.slice(0, 200),
      cards: document.querySelectorAll('.v-rvcard, .v-rv').length, buttons: Array.from(document.querySelectorAll('.v-btn, .v-link')).filter((el) => visible(el) && el.closest(RZ)).map((el) => clean(el.innerText)).slice(0, 8),
      images: Array.from(document.images).filter((el) => el.closest(RZ)).length, cardRatings: all('.v-boxcard-rating').slice(0, 8).map((el) => clean(el.innerText)),
    },
  };
}

const DROP = new Set(['passwordHash', 'salt', 'secret', 'proofs']);
/** 저장값에서 장부로 뜻이 있는 것만 남긴다. 긴 확률표는 길이로 줄이고, 비밀번호 해시 같은 것은 적지 않는다. */
export function summarizeStorage(storage) {
  const walk = (value, key) => {
    if (Array.isArray(value)) {
      if (key === 'dropTable') return { rows: value.length };
      return value.map((v) => walk(v));
    }
    if (value && typeof value === 'object') { const out = {}; for (const [k, v] of Object.entries(value)) if (!DROP.has(k)) out[k] = walk(v, k); return out; }
    return value;
  };
  const out = {};
  for (const key of Object.keys(storage).sort()) out[key] = walk(storage[key]);
  return out;
}
