/**
 * 화면 하나에서 재는 것. 그림(PNG)만으로는 알 수 없는 구조의 차이를 숫자로 남긴다.
 *   문서 폭과 창 폭(가로 넘침), 그림의 깨짐과 누락, 정해 둔 선택자의 자리와 크기, 글 덩어리의 줄 수, 기본 부품의 글꼴.
 * 이 함수는 브라우저 안에서 돈다(page.evaluate 로 통째로 넘긴다). 바깥의 것을 참조하지 않는다.
 */

/** 자리와 크기를 재는 선택자. 순서와 이름을 바꾸면 두 실행의 기록이 어긋나므로 뒤에만 더한다. */
export const KEY_SELECTORS = [
  '.v-app', '.v-header', '.v-header-in', '.v-logo', '.v-nav', '.v-nav a', '.v-headbtn', '.v-menu-btn', '.v-offline',
  '.v-main', '.v-screenhead', '.v-back', '.v-title', '.v-desc', '.v-section', '.v-stack',
  '.v-hero', '.v-hero-copy', '.v-hero-title', '.v-hero-desc', '.v-hero-stage', '.v-hero-scene', '.v-hero-orb', '.v-hcard', '.v-hero-cta', '.v-hero-cta .v-btn',
  '.v-search', '.v-input', '.v-field', '.v-chips', '.v-chip', '.v-boxgrid', '.v-boxcard', '.v-boxcard-photo', '.v-boxcard-body',
  '.v-boxlayout', '.v-boxlayout-main', '.v-boxlayout-hero', '.v-mainitem', '.v-mainitem-photo', '.v-boxside', '.v-openbar', '.v-openbar-in',
  '[data-open-primary]', '[data-short-charge]', '[data-short-take]', '.v-boxlayout-contents', '.v-boxlayout-odds', '.v-boxlayout-notes', '.v-boxlayout-reviews',
  '.v-tierhead', '.v-items', '.v-item', '.v-item-photo', '.v-itemrows', '.v-itemrow', '.v-itemrow-photo', '.v-rows', '.v-row', '.v-card', '.v-notes',
  '.v-btn', '.v-btn--quiet', '.v-link', '.v-links', '.v-line', '.v-empty', '.v-skel', '.v-take-hint',
  '.v-rvsum', '.v-rvrow', '.v-rvgrid', '.v-rvcard', '.v-rvcard-photo', '.v-rating',
  '.v-scrim', '.v-sheet', '.v-sheet-body', '.v-sheet-close', '.v-sheet-photo', '.v-confirm-actions', '.v-qr', '.v-address', '.v-take-foot', '.v-check',
  '.v-op', '.v-op-top', '.v-op-balance', '.v-op-scene', '.v-op-result', '.v-op-photo', '.v-op-name', '.v-op-amount', '.v-op-net', '.v-op-bottom', '.v-op-actions',
  '.v-reveal', '.v-reveal-top', '.v-reveal-result', '.v-reveal-head', '.v-reveal-actions', '.v-best', '.v-resultrow',
  '.v-footer', '.v-footer-top', '.v-footer-crs', '.v-footer-follow', '.v-footer-body', '.v-footer-cols', '.v-footer-about', '.v-footer-slogan', '.v-footer-name',
  '.v-toast', 'img', 'canvas', 'svg',
];

/** 글이 놓인 구역(앞의 것이 먼저다). lib/regions.mjs 의 구역 이름과 맞춘다 */
export const TEXT_ZONES = [
  ['sheet', '.v-sheet'], ['scene', '.v-op, .v-reveal'], ['card-rating', '.v-boxcard-rating'], ['ratinglink', '.v-ratinglink'],
  ['reviews', '.v-boxlayout-reviews, .v-rvsum, .v-rvfeed, .v-rvgrid, .v-rvcard, .v-rv'], ['header', '.v-header'], ['footer', '.v-footer'], ['hero', '.v-hero'],
  ['side', '.v-boxside'], ['contents', '.v-boxlayout-contents'], ['odds', '.v-boxlayout-odds'], ['notes', '.v-boxlayout-notes'], ['card', '.v-boxcard'],
  ['chips', '.v-chips'], ['links', '.v-links'], ['screenhead', '.v-screenhead'], ['main', '.v-main'],
];

/** 글꼴을 재는 기본 부품 */
export const FONT_SELECTORS = [
  'body', '.v-title', '.v-desc', '.v-section', '.v-sub', '.v-small', '.v-body', '.v-card-title', '.v-num', '.v-btn', '.v-btn--quiet', '.v-link', '.v-chip',
  '.v-input', '.v-field-label', '.v-row dt', '.v-row dd', '.v-headbtn', '.v-nav a', '.v-hero-title', '.v-hero-desc', '.v-line', '.v-empty',
  '.v-itemrow-name', '.v-item-name', '.v-footer-cols a', '.v-footer-cols h2', '.v-footer-slogan', '.v-op-amount', '.v-op-name',
];

export function measureInPage({ keySelectors, fontSelectors, maxText, zones = [] }) {
  const round = (n) => Math.round(n * 100) / 100;
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    const s = getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0;
  };
  const sx = window.scrollX, sy = window.scrollY;
  const rectOf = (el) => { const r = el.getBoundingClientRect(); return [round(r.left + sx), round(r.top + sy), round(r.width), round(r.height)]; };

  // 1. 문서 폭과 창 폭
  const de = document.documentElement;
  const doc = { innerWidth: window.innerWidth, innerHeight: window.innerHeight, dpr: window.devicePixelRatio, scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, scrollHeight: de.scrollHeight, bodyScrollWidth: document.body.scrollWidth, scrollY: round(sy) };
  doc.overflowX = Math.max(de.scrollWidth, document.body.scrollWidth) > window.innerWidth;

  // 2. 그림: 깨진 것(불러오기 실패), 주소가 없는 것, 아직 끝나지 않은 것
  const imgs = Array.from(document.images);
  const shortSrc = (img) => { try { return new URL(img.currentSrc || img.src, location.href).pathname.split('/').slice(-3).join('/'); } catch { return String(img.src).slice(-80); } };
  const images = {
    total: imgs.length,
    lazyAttr: window.__parityLazy ?? -1,
    broken: imgs.filter((img) => img.complete && img.naturalWidth === 0 && (img.currentSrc || img.src)).map(shortSrc).sort(),
    noSrc: imgs.filter((img) => !(img.currentSrc || img.getAttribute('src'))).length,
    pending: imgs.filter((img) => !img.complete).map(shortSrc).sort(),
    hiddenByZeroSize: imgs.filter((img) => { const r = img.getBoundingClientRect(); return r.width === 0 || r.height === 0; }).length,
  };

  // 3. 정해 둔 선택자의 자리와 크기(문서 좌표). 선택자마다 보이는 것의 개수와 앞의 넷, 마지막 하나
  const boxes = {};
  for (const sel of keySelectors) {
    let all;
    try { all = Array.from(document.querySelectorAll(sel)); } catch { continue; }
    const shown = all.filter(visible);
    if (!all.length) continue;
    boxes[sel] = { count: all.length, visible: shown.length, rects: shown.slice(0, 4).map(rectOf), last: shown.length > 4 ? rectOf(shown[shown.length - 1]) : undefined };
  }

  // 4. 글 덩어리의 줄 수. 자기 바로 아래에 글자가 있는 요소만 센다
  const text = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  const range = document.createRange();
  let truncated = false;
  for (let el = walker.nextNode(); el; el = walker.nextNode()) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(el.tagName)) continue;
    const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ');
    if (!own) continue;
    if (!visible(el)) continue;
    if (text.length >= maxText) { truncated = true; break; }
    range.selectNodeContents(el);
    const tops = [];
    for (const r of range.getClientRects()) {
      if (r.width < 0.5 || r.height < 0.5) continue;
      const mid = r.top + r.height / 2;
      if (!tops.some((t) => Math.abs(t.mid - mid) < Math.max(3, r.height * 0.4))) tops.push({ mid });
    }
    const box = el.getBoundingClientRect();
    const cls = typeof el.className === 'string' ? el.className.split(/\s+/).filter(Boolean).slice(0, 2).join('.') : '';
    // 그 글이 놓인 구역. 비교 도구가 "어느 구역의 글이 달라졌는가"로 의도된 차이를 가린다
    let zone = 'page';
    for (const [name, sel] of zones) if (el.closest(sel)) { zone = name; break; }
    text.push({ z: zone, k: el.tagName.toLowerCase() + (cls ? '.' + cls : ''), t: own.replace(/\s+/g, ' ').slice(0, 60), lines: tops.length, w: round(box.width), h: round(box.height), clipped: el.scrollWidth > el.clientWidth + 1 || undefined });
  }

  // 5. 기본 부품의 글꼴(계산된 값)
  const fonts = {};
  for (const sel of fontSelectors) {
    const el = Array.from(document.querySelectorAll(sel)).find(visible);
    if (!el) continue;
    const s = getComputedStyle(el);
    fonts[sel] = { family: s.fontFamily, size: s.fontSize, weight: s.fontWeight, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, color: s.color };
  }
  const loadedFonts = Array.from(document.fonts).map((f) => `${f.family}|${f.weight}|${f.style}|${f.status}`).sort();

  // 5-1. 풍선 도움말: title 속성(마우스를 올리면 브라우저가 띄우는 글)
  const titles = Array.from(document.querySelectorAll('[title]')).filter(visible).map((el) => el.tagName.toLowerCase() + '.' + String(el.getAttribute('class') ?? '').split(/\s+/)[0] + ' :: ' + el.getAttribute('title')).slice(0, 200);

  // 6. 열려 있는 겹침 화면
  const dialogs = Array.from(document.querySelectorAll('[role="dialog"], [role="alertdialog"]')).filter(visible).map((el) => ({ role: el.getAttribute('role'), cls: String(el.className).split(/\s+/)[0], rect: rectOf(el) }));

  return { url: location.pathname + location.search + location.hash, lang: document.documentElement.lang, doc, images, boxes, text, textTruncated: truncated, fonts, loadedFonts, fontsForced: window.__parityFontForced ?? 0, titles, dialogs, bodyOverflow: document.body.style.overflow || '' };
}
