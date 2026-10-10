import { inflateSync } from 'node:zlib';

// Chrome이 반환하는 비인터레이스 8비트 RGB/RGBA PNG만 읽는다. 추가 설치가 필요 없다.
export function decodePNG(buffer) {
  if (buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('PNG 형식 오류');
  let width, height, channels;
  const chunks = [];
  for (let p = 8; p < buffer.length;) {
    const size = buffer.readUInt32BE(p), type = buffer.toString('ascii', p + 4, p + 8), data = buffer.subarray(p + 8, p + 8 + size);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      if (data[8] !== 8 || ![2, 6].includes(data[9]) || data[12] !== 0) throw new Error('지원하지 않는 PNG 색상 형식');
      channels = data[9] === 6 ? 4 : 3;
    }
    if (type === 'IDAT') chunks.push(data);
    p += size + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks)), stride = width * channels, pixels = Buffer.alloc(height * stride);
  const paeth = (a, b, c) => { const p = a + b - c, x = Math.abs(p - a), y = Math.abs(p - b), z = Math.abs(p - c); return x <= y && x <= z ? a : y <= z ? b : c; };
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    if (filter > 4) throw new Error('PNG 필터 오류');
    for (let x = 0; x < stride; x++) {
      const i = y * stride + x, a = x >= channels ? pixels[i - channels] : 0, b = y ? pixels[i - stride] : 0, c = y && x >= channels ? pixels[i - stride - channels] : 0;
      const prediction = [0, a, b, Math.floor((a + b) / 2), paeth(a, b, c)][filter];
      pixels[i] = (raw[y * (stride + 1) + x + 1] + prediction) & 255;
    }
  }
  return { width, height, pixel(x, y) { const i = (Math.max(0, Math.min(height - 1, Math.floor(y))) * width + Math.max(0, Math.min(width - 1, Math.floor(x)))) * channels; return [...pixels.subarray(i, i + 3)]; } };
}
export function contrastRatio(a, b) {
  const luminance = rgb => rgb.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

export async function runChecks(page, meta, errors = []) {
  const data = await page.evaluate(({ mobile }) => {
    const findings = [], texts = [];
    const selector = el => {
      if (el.id) return '#' + CSS.escape(el.id);
      const parts = [];
      for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
        if (n.id) { parts.unshift('#' + CSS.escape(n.id)); break; }
        const siblings = n.parentElement ? [...n.parentElement.children].filter(x => x.tagName === n.tagName) : [];
        parts.unshift(n.tagName.toLowerCase() + (siblings.length > 1 ? `:nth-of-type(${siblings.indexOf(n) + 1})` : ''));
      }
      return parts.join(' > ');
    };
    const add = (check, el, value) => findings.push({ check, selector: typeof el === 'string' ? el : selector(el), value });
    const size = el => el.getBoundingClientRect();
    const visible = el => {
      const r = size(el), s = getComputedStyle(el);
      if (r.width <= 1 || r.height <= 1 || s.display === 'none' || s.visibility !== 'visible' || el.closest('[hidden],[inert]')) return false;
      for (let n = el; n; n = n.parentElement) if (Number(getComputedStyle(n).opacity) === 0) return false;
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ps = getComputedStyle(p), pr = size(p);
        if (/(hidden|clip|auto|scroll)/.test(ps.overflowY) && (r.bottom <= pr.top || r.top >= pr.bottom)) return false;
        if (/(hidden|clip|auto|scroll)/.test(ps.overflowX) && (r.right <= pr.left || r.left >= pr.right)) return false;
      }
      return true;
    };
    const dialogs = [...document.querySelectorAll('[aria-modal="true"]')].filter(visible);
    // z-index가 가장 높은 모달 밖의 요소는 의도적으로 덮인 배경이다.
    const layer = el => { let z = 0; for (let n = el; n; n = n.parentElement) z = Math.max(z, parseInt(getComputedStyle(n).zIndex) || 0); return z; };
    const activeDialog = dialogs.sort((a, b) => layer(a) - layer(b)).at(-1);
    const inScope = el => !activeDialog || activeDialog.contains(el) || layer(el) > layer(activeDialog);
    const width = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    if (width > innerWidth + 1) add('horizontal-scroll', 'html', { documentWidth: width, viewportWidth: innerWidth, excess: width - innerWidth });
    for (const el of document.body.querySelectorAll('*')) {
      if (!(el instanceof HTMLElement) || !visible(el) || !inScope(el)) continue;
      const nodes = [...el.childNodes].filter(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      const isInput = el.matches('input:not([type=hidden]):not([type=checkbox]):not([type=radio]),textarea,select');
      if (!nodes.length && !isInput) continue;
      const s = getComputedStyle(el), r = size(el);
      const clippedVertically = /(hidden|clip)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1;
      if (el.clientWidth > 0 && (el.scrollWidth > el.clientWidth + 1 || clippedVertically)) add('text-overflow', el, {
        scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight,
        overflow: s.overflow, textOverflow: s.textOverflow, text: (el.innerText || el.value || '').slice(0, 100),
      });
      let opacity = 1, unsupported = false;
      for (let n = el; n; n = n.parentElement) {
        const ns = getComputedStyle(n); opacity *= Number(ns.opacity);
        if (ns.mixBlendMode !== 'normal' || ns.filter !== 'none' || ns.backgroundClip === 'text') unsupported = true;
      }
      const rects = nodes.flatMap(n => { const range = document.createRange(); range.selectNodeContents(n); return [...range.getClientRects()]; });
      if (isInput) rects.push(r);
      const colorStyle = isInput && !el.value && el.placeholder ? getComputedStyle(el, '::placeholder') : s;
      const color = colorStyle.color.match(/[\d.]+/g)?.map(Number);
      if (!color || color.length < 3 || !colorStyle.color.startsWith('rgb')) unsupported = true;
      const points = rects.flatMap(b => [0.2, 0.5, 0.8].map(f => ({ x: b.left + b.width * f, y: b.top + b.height * 0.5 })))
        .filter(p => p.x >= 0 && p.x < innerWidth && p.y >= 0 && p.y < innerHeight)
        .filter(p => { const top = document.elementFromPoint(p.x, p.y); return top && (el.contains(top) || top.contains(el)); });
      // 대비는 현재 실제 보이는 글에만 픽셀로 판정한다. 아래쪽은 별도 scroll/shot에서 검사한다.
      if (points.length) texts.push({ selector: selector(el), color, opacity: opacity * (colorStyle === s ? 1 : Number(colorStyle.opacity)), points, unsupported });
    }
    const controls = [...document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,summary,label:has(input[type=radio]),label:has(input[type=checkbox]),label:has(input[type=file]),[role=button],[role=link],[role=tab],[tabindex]')]
      .filter(el => el instanceof HTMLElement && visible(el) && inScope(el) && !el.matches(':disabled,[aria-disabled=true],[tabindex="-1"]'));
    const rect = el => {
      const label = el.matches('input[type=radio],input[type=checkbox]') ? el.closest('label') ?? el.labels?.[0] : null;
      return size(label ?? el);
    };
    for (let i = 0; i < controls.length; i++) {
      const a = controls[i], ar = rect(a);
      if (mobile && (ar.width < 44 || ar.height < 44)) add('touch-target', a, { width: +ar.width.toFixed(2), height: +ar.height.toFixed(2), minimum: 44 });
      for (const b of controls.slice(i + 1)) {
        if (a.contains(b) || b.contains(a)) continue;
        const br = rect(b), w = Math.min(ar.right, br.right) - Math.max(ar.left, br.left), h = Math.min(ar.bottom, br.bottom) - Math.max(ar.top, br.top);
        if (w <= 2 || h <= 2) continue;
        const label = a.closest('label');
        if (label && label === b.closest('label')) continue;
        // 화면 밖 고정 헤더와 문서 요소의 허위 겹침을 제외한다.
        if (Math.min(ar.bottom, br.bottom) < 0 || Math.max(ar.top, br.top) > innerHeight) continue;
        add('interactive-overlap', a, { other: selector(b), width: +w.toFixed(2), height: +h.toFixed(2) });
      }
    }
    return { findings, texts, width: innerWidth, height: innerHeight };
  }, { mobile: meta.viewport !== 'desktop' });
  try {
    // 글을 투명하게 만든 일시적 촬영에서 합성된 배경 픽셀을 읽는다.
    // 배경 사진, 그라데이션, 반투명 카드와 뒤의 바탕이 모두 포함된다.
    const png = decodePNG(await page.screenshot({ animations: 'disabled', scale: 'css', style: '* { -webkit-text-fill-color: transparent !important; text-shadow: none !important; caret-color: transparent !important; } *::placeholder { color: transparent !important; }' }));
    for (const text of data.texts) {
      if (text.unsupported) { data.findings.push({ check: 'contrast-unmeasured', selector: text.selector, value: { reason: '혼합 모드, 필터 또는 지원하지 않는 글자색', step: meta.step } }); continue; }
      const alpha = text.opacity * (text.color[3] ?? 1);
      const samples = text.points.map(p => {
        const bg = png.pixel(p.x, p.y), fg = text.color.slice(0, 3).map((c, i) => c * alpha + bg[i] * (1 - alpha));
        return { ratio: contrastRatio(fg, bg), foreground: fg.map(Math.round), background: bg, x: Math.round(p.x), y: Math.round(p.y) };
      });
      const worst = samples.sort((a, b) => a.ratio - b.ratio)[0];
      if (worst.ratio < 4.5) data.findings.push({ check: 'contrast', selector: text.selector, value: { ...worst, ratio: +worst.ratio.toFixed(3), minimum: 4.5, method: '배경 픽셀 표본' } });
    }
  } catch (error) { data.findings.push({ check: 'contrast-unmeasured', selector: 'document', value: { reason: error.message } }); }
  for (const error of errors) data.findings.push({ check: 'console-error', selector: 'console', value: error });
  return data.findings.map(f => [meta.id, meta.locale, meta.viewport, f.check, f.selector, { ...f.value, step: meta.step }]);
}
