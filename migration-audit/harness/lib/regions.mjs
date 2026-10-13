/**
 * 요소 단위 촬영. 화면 전체가 달라도 "이 부분은 그대로인가"를 따로 견줄 수 있게, 촬영마다 정해 둔 영역을 잘라 찍는다.
 *
 * 영역의 종류
 *   target   부품 촬영(hover, focus, active)의 그 요소 하나(여백 없이)
 *   dialog   맨 위에 떠 있는 겹침 화면의 판(.v-sheet). 뒤의 화면이 비치지 않게 가림막(.v-scrim)을 불투명한 검정으로 바꿔 찍는다
 *   scene    개봉 화면(.v-op)과 여러 개 결과 화면(.v-reveal)의 뿌리. 그 위에 뜬 시트는 숨기고 찍는다
 *   그 밖     화면의 구역(PAGE_REGIONS). 겹침 화면이 없고, 주소가 REGION_ROUTES 에 드는 화면에서만 찍는다.
 *            붙어 다니는 것(머리줄, 아래 막대, 표시 띠)은 숨기고 문서 좌표로 잘라 찍는다(구역이 그것에 가려지는 정도가 두 빌드에서 달라지지 않게).
 *
 * 자르는 자리는 CSS 픽셀의 가장 가까운 정수에서 시작하고 크기는 올림한다. 요소가 소수 자리에 놓이면 같은 내용도 가장자리 픽셀이 달라지므로,
 * 요소의 실제 자리(소수 셋째 자리까지)를 함께 적어 비교 도구가 "자리 때문에 생긴 가장자리 차이"를 가려낼 수 있게 한다.
 * 16,000 기기 픽셀을 넘는 영역은 잘라 찍어 이어 붙인다(shots.mjs 의 전체 촬영과 같은 까닭).
 */
import { PNG } from 'pngjs';

/** 구역을 찍는 화면(로케일 뒤의 경로). 홈, 박스, 후기: 의도된 차이가 있는 화면이라 나머지 부분을 구역별로 따로 본다 */
export const REGION_ROUTES = /^(|\/box\/[^?#]+|\/reviews([?#].*)?)$/;

/** 화면의 구역. count 가 있으면 앞에서부터 그만큼(card-photo-0, card-photo-1 ...) */
export const PAGE_REGIONS = [
  { key: 'header', sel: '.v-header' },
  { key: 'hero', sel: '.v-hero' },
  { key: 'screenhead', sel: '.v-main .v-screenhead' },
  { key: 'desc', sel: '.v-main header .v-desc' },
  { key: 'search', sel: '.v-search' },
  { key: 'chips', sel: '.v-main .v-chips' },
  { key: 'card-photo', sel: '.v-boxcard .v-boxcard-photo', count: 4 },
  { key: 'card-title', sel: '.v-boxcard .v-boxcard-body .v-card-title', count: 4 },
  { key: 'card-price', sel: '.v-boxcard .v-boxcard-body > .v-num', count: 4 },
  { key: 'card-rating', sel: '.v-boxcard .v-boxcard-rating', count: 4 },
  { key: 'more', sel: '.v-boxgrid ~ .v-btn--quiet' },
  { key: 'search-rows', sel: '.v-main > .v-stack > .v-itemrows' },
  { key: 'empty', sel: '.v-main .v-empty:not(.v-boxlayout-reviews *)' },
  { key: 'ratinglink', sel: '.v-ratinglink' },
  { key: 'box-hero', sel: '.v-boxlayout-hero' },
  { key: 'reviews', sel: '.v-boxlayout-reviews' },
  { key: 'side', sel: '.v-boxside' },
  { key: 'openbar', sel: '.v-openbar' },
  { key: 'contents', sel: '.v-boxlayout-contents' },
  { key: 'odds', sel: '.v-boxlayout-odds' },
  { key: 'notes', sel: '.v-boxlayout-notes' },
  { key: 'reviews-sum', sel: '.v-main .v-rvsum' },
  { key: 'reviews-feed', sel: '.v-main .v-rvfeed, .v-main .v-rvgrid' },
  { key: 'links', sel: '.v-main > .v-stack > .v-links' },
  { key: 'footer', sel: '.v-footer' },
];

/** 브라우저 안에서 돈다. 찍을 영역의 자리와 글을 모으고, 숨길 것에 표시를 붙인다. */
export function collectRegions({ pageRegions, targetSel, targetNth }) {
  const visible = (el) => { const r = el.getBoundingClientRect(); if (r.width <= 0 || r.height <= 0) return false; const s = getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none'; };
  const round3 = (n) => Math.round(n * 1000) / 1000;
  const clean = (text) => String(text ?? '').replace(/\s+/g, ' ').trim();
  const floats = (el) => { for (let node = el; node && node !== document.documentElement; node = node.parentElement) { const p = getComputedStyle(node).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };
  const describe = (key, el, mode) => {
    const r = el.getBoundingClientRect();
    el.setAttribute('data-parity-region', key);
    return { key, mode, view: [round3(r.left), round3(r.top), round3(r.width), round3(r.height)], doc: [round3(r.left + window.scrollX), round3(r.top + window.scrollY), round3(r.width), round3(r.height)], text: clean(el.innerText).slice(0, 6000), tag: el.tagName.toLowerCase() + '.' + String(el.getAttribute('class') ?? '').split(/\s+/)[0] };
  };
  for (const el of document.querySelectorAll('[data-parity-region]')) el.removeAttribute('data-parity-region');
  const out = [];
  if (targetSel) {
    const el = document.querySelectorAll(targetSel)[targetNth ?? 0];
    if (el && visible(el)) out.push(describe('target', el, 'view'));
    return out;
  }
  const dialogs = Array.from(document.querySelectorAll('[role="dialog"], [role="alertdialog"]')).filter(visible);
  const scene = Array.from(document.querySelectorAll('.v-op, .v-reveal')).find(visible);
  if (dialogs.length || scene) {
    const top = dialogs[dialogs.length - 1];
    if (scene) out.push(describe('scene', scene, 'scene'));
    if (top && top !== scene) out.push(describe('dialog', top, 'dialog'));
    return out;
  }
  if (!pageRegions) return out;
  // 붙어 다니는 것에 표시를 붙여 둔다(구역을 찍는 동안 숨긴다)
  for (const el of document.querySelectorAll('[data-parity-float]')) el.removeAttribute('data-parity-float');
  for (const el of document.querySelectorAll('body *')) { const p = getComputedStyle(el).position; if (p === 'fixed' || p === 'sticky') el.setAttribute('data-parity-float', ''); }
  for (const def of pageRegions) {
    const list = Array.from(document.querySelectorAll(def.sel)).filter(visible);
    const take = def.count ? list.slice(0, def.count) : list.slice(0, 1);
    take.forEach((el, i) => out.push(describe(def.count ? `${def.key}-${i}` : def.key, el, floats(el) ? 'float' : 'flow')));
  }
  return out;
}

const ISO_ID = '__parity_iso';
const setIso = (page, css) => page.evaluate(({ id, css }) => { let s = document.getElementById(id); if (!s) { s = document.createElement('style'); s.id = id; document.head.appendChild(s); } s.textContent = css; return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))); }, { id: ISO_ID, css });
const CSS = {
  // 판만: 가림막을 불투명한 검정으로(뒤의 화면이 비치지 않는다)
  dialog: '.v-scrim { background: #000 !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }',
  // 장면만: 그 위에 뜬 시트와 가림막을 숨긴다
  scene: '.v-op .v-scrim, .v-reveal .v-scrim { visibility: hidden !important; }',
  // 구역: 붙어 다니는 것을 숨긴다. 찍는 구역 자신이 붙어 다니는 것이면 그것만 남긴다
  flow: '[data-parity-float] { visibility: hidden !important; }',
  float: (key) => `[data-parity-float]:not([data-parity-region="${key}"]):not(:has([data-parity-region="${key}"])) { visibility: hidden !important; } [data-parity-region="${key}"], [data-parity-region="${key}"] * { visibility: visible !important; }`,
};

/** 문서 좌표의 네모를 찍는다. 길면 잘라 찍어 이어 붙인다. */
async function captureRect(page, rect, dsf, options, fullPage) {
  const limit = Math.floor(8000 / dsf);
  if (rect.height * dsf <= 16000) return page.screenshot({ ...options, fullPage, clip: rect });
  const parts = [];
  for (let y = 0; y < rect.height; y += limit) parts.push(PNG.sync.read(await page.screenshot({ ...options, fullPage, clip: { x: rect.x, y: rect.y + y, width: rect.width, height: Math.min(limit, rect.height - y) } })));
  const out = new PNG({ width: parts[0].width, height: parts.reduce((n, p) => n + p.height, 0) });
  let offset = 0;
  for (const part of parts) { part.data.copy(out.data, offset * out.width * 4, 0, part.height * part.width * 4); offset += part.height; }
  return PNG.sync.write(out, { deflateLevel: 6 });
}

/**
 * 한 촬영의 영역들을 찍는다. 돌려주는 것: [{ key, mode, rect(문서 좌표, 소수), clip(찍은 네모), text, tag, png(Buffer) }]
 * 끝나면 화면을 찍기 전 상태로 되돌린다(숨김 규칙을 지우고 스크롤을 되돌린다).
 */
export async function captureRegions(page, { item, step, skipPage, width, height, dsf, options }) {
  const pageRegions = !step.clip && !skipPage && REGION_ROUTES.test(item.route) ? PAGE_REGIONS : null;
  const found = await page.evaluate(collectRegions, { pageRegions, targetSel: step.clip ?? null, targetNth: step.clipNth ?? 0 });
  if (!found.length) return [];
  const out = [];
  try {
    for (const region of found) {
      // 자르는 네모: 시작점은 가장 가까운 정수, 크기는 올림. 요소가 놓인 소수 자리가 달라도 그림의 크기는 같게 나온다
      const inView = (r) => { const x = Math.max(0, Math.round(r[0])), y = Math.max(0, Math.round(r[1])); return { x, y, width: Math.max(1, Math.min(width - x, Math.ceil(r[2]))), height: Math.max(1, Math.min(height - y, Math.ceil(r[3]))) }; };
      let png, clip;
      if (region.mode === 'view') { clip = inView(region.view); png = await page.screenshot({ ...options, clip }); }
      else if (region.mode === 'dialog' || region.mode === 'scene') { await setIso(page, CSS[region.mode]); clip = inView(region.view); png = await page.screenshot({ ...options, clip }); }
      else if (region.mode === 'float' && region.view[0] >= -0.5 && region.view[1] >= -0.5 && region.view[0] + region.view[2] <= width + 0.5 && region.view[1] + region.view[3] <= height + 0.5) { await setIso(page, CSS.float(region.key)); clip = inView(region.view); png = await page.screenshot({ ...options, clip }); }
      else {
        // 붙어 다니는 구역이 창 밖에 있으면(붙기 전의 제자리) 문서 좌표로 찍는다
        await setIso(page, region.mode === 'float' ? CSS.float(region.key) : CSS.flow);
        const x = Math.max(0, Math.round(region.doc[0])), y = Math.max(0, Math.round(region.doc[1]));
        clip = { x, y, width: Math.max(1, Math.ceil(region.doc[2])), height: Math.max(1, Math.ceil(region.doc[3])) };
        png = await captureRect(page, clip, dsf, options, true);
      }
      out.push({ key: region.key, mode: region.mode, rect: region.doc, clip, text: region.text, tag: region.tag, png });
    }
  } finally {
    await page.evaluate((id) => { document.getElementById(id)?.remove(); for (const el of document.querySelectorAll('[data-parity-region], [data-parity-float]')) { el.removeAttribute('data-parity-region'); el.removeAttribute('data-parity-float'); } return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))); }, ISO_ID);
  }
  return out;
}
