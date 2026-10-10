#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, '../..');
export const config = JSON.parse(fs.readFileSync(path.join(here, 'config.json'), 'utf8'));
export const rules = {
  'color-outside-tokens': '색은 app/tokens.css에 정의하고 var(--v-...)로 참조합니다.',
  'weight-over-400': '굵기를 400 이하로 바꿉니다. 카드 제목은 .v-card-title의 600을 씁니다.',
  uppercase: '대문자 변환 선언 또는 uppercase 클래스를 없앱니다.',
  'letter-spacing-positive': '양수 자간을 없애거나 0 이하로 바꿉니다.',
  shadow: '그림자를 없앱니다. 초기화에는 none 또는 shadow-none을 씁니다.',
  gradient: '그라데이션과 글자 배경 클리핑을 없애고 단색 토큰을 씁니다.',
  'native-dialog': '브라우저 기본 창 대신 화면 안 안내 또는 공통 Sheet를 씁니다.',
  'copy-emdash': '긴 줄표를 마침표, 쉼표 또는 괄호로 바꿉니다.',
  'copy-middledot': '가운뎃점을 쉼표나 자연스러운 연결 표현으로 바꿉니다.',
  'copy-exclamation': '느낌표를 없애고 담담한 서술문으로 바꿉니다.',
  'copy-question': '질문 대신 대상과 상태 또는 다음 행동을 서술합니다.',
  'copy-apology': '사과 대신 현재 상태와 필요한 행동을 씁니다.',
};

// 경로의 []는 Next.js 폴더 이름이다. *, **, ?만 글롭 연산자로 쓴다.
export function glob(pattern) {
  let out = '^';
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === '*' && pattern[i + 1] === '*') {
      i++;
      if (pattern[i + 1] === '/') { out += '(?:.*/)?'; i++; }
      else out += '.*';
    } else if (c === '*') out += '[^/]*';
    else if (c === '?') out += '[^/]';
    else out += c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(out + '$');
}

const names = new Set(('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen').split(' '));
const palette = /^(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)$/;
const blank = s => s.replace(/[^\r\n]/g, ' ');
const unquote = s => s.replace(/^(['"])([\s\S]*)\1$/, '$2');
const kebab = s => s.replace(/[A-Z]/g, c => '-' + c.toLowerCase()).replace(/^webkit-/, '-webkit-');
const positive = s => /^\+?(?:\d*\.)?\d+(?:e[+-]?\d+)?(?:[a-z%]+)?$/i.test(s.trim()) && parseFloat(s) > 0;

function colorValue(value) {
  // URL 조각, 이미지와 변수 이름의 white 같은 단어는 색 리터럴이 아니다.
  const clean = value.replace(/url\([\s\S]*?\)/gi, blank).replace(/--[\w-]+/g, blank);
  return /#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{4}|[\da-f]{3})(?![\w-])/i.test(clean) || /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\s*\(/i.test(clean)
    || [...clean.matchAll(/(?<![\w-])[a-z]+(?![\w-])/gi)].some(m => names.has(m[0].toLowerCase()));
}

function inspectValue(prop, value, at, emit, context = {}) {
  prop = kebab(prop);
  value = unquote(value.trim()).replace(/\s*!important\s*$/i, '').trim();
  const lower = value.toLowerCase();
  const report = rule => emit(rule, at, { ...context, value });
  if ((/^--/.test(prop) || /color|background|border|outline|shadow|fill|stroke|filter|^accent|^caret/.test(prop)) && colorValue(value)) report('color-outside-tokens');
  if ((prop === 'font-weight' && (/^(?:bold|bolder)$/i.test(value) || Number(value) > 400))
      || (prop === 'font' && /(?:^|\s)(?:[5-9]00|1000|bold|bolder)(?=\s)/i.test(value))) report('weight-over-400');
  if (prop === 'text-transform' && /\buppercase\b/i.test(value)) report('uppercase');
  if (prop === 'letter-spacing' && positive(value)) report('letter-spacing-positive');
  if ((/^(?:-webkit-)?(?:box|text)-shadow$/.test(prop) && !/^(?:none|initial|unset|inherit|revert(?:-layer)?)$/i.test(value))
      || (/filter$/.test(prop) && /\bdrop-shadow\s*\(/i.test(value))) report('shadow');
  if ((prop !== 'content' && /\b(?:repeating-)?(?:linear|radial|conic)-gradient\s*\(/i.test(value))
      || (/background-clip$/.test(prop) && lower === 'text')) report('gradient');
}

function utilityBase(raw) {
  let depth = 0, cut = 0;
  for (let i = 0; i < raw.length; i++) {
    if ('[('.includes(raw[i])) depth++;
    if ('])'.includes(raw[i])) depth--;
    if (raw[i] === ':' && depth === 0) cut = i + 1;
  }
  return raw.slice(cut).replace(/^!|!$/g, '');
}

function inspectClasses(value, at, emit, bare = true) {
  for (const m of value.matchAll(/[^\s"'`{}]+/g)) {
    const u = utilityBase(m[0]);
    const pos = at + m.index;
    if (u.startsWith('[') && u.endsWith(']') && u.includes(':')) {
      const split = u.indexOf(':');
      inspectValue(u.slice(1, split), u.slice(split + 1, -1).replaceAll('_', ' '), pos, emit);
      continue;
    }
    if (/^font-(?:medium|semibold|bold|extrabold|black)$/.test(u)
        || (/^font-\[/.test(u) && Number(u.slice(6, -1)) > 400)) emit('weight-over-400', pos);
    if (bare && u === 'uppercase') emit('uppercase', pos);
    if (/^tracking-(?:wide|wider|widest)$/.test(u)
        || (/^tracking-\[.+\]$/.test(u) && positive(u.slice(10, -1)))) emit('letter-spacing-positive', pos);
    if ((/^(?:shadow|drop-shadow)(?:-|$)/.test(u) && !/^(?:shadow|drop-shadow)-none$/.test(u))) emit('shadow', pos);
    if (/^bg-(?:gradient-|linear-|radial|conic)/.test(u) || u === 'bg-clip-text') emit('gradient', pos);
    const stop = /^(from|via|to)-(.+)$/.exec(u);
    if (stop && !/^(?:\d+(?:\.\d+)?%|\[[-+\d.]+(?:%|px|rem|em)\])$/.test(stop[2])) emit('gradient', pos);
    const color = /^(?:bg|text|border(?:-[trblxyse])?|divide|outline|ring(?:-offset)?|fill|stroke|decoration|accent|caret|shadow|from|via|to)-(.+)$/.exec(u);
    if (color) {
      const v = color[1].startsWith('[') ? color[1].slice(0, color[1].lastIndexOf(']') + 1) : color[1].split('/')[0];
      if (names.has(v) || palette.test(v) || (v.startsWith('[') && colorValue(v))) emit('color-outside-tokens', pos);
    }
  }
}

function inspectCss(source, emit, offset = 0) {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, blank);
  let start = 0, paren = 0, bracket = 0, quote = null;
  const stack = [];
  const statement = end => {
    const raw = text.slice(start, end);
    const match = /^\s*([\w-]+)\s*:\s*([\s\S]*)$/.exec(raw);
    if (match) inspectValue(match[1], match[2], offset + start + raw.search(/\S/), emit, { selector: stack.at(-1) || '' });
    const apply = /^\s*@apply\s+/.exec(raw);
    if (apply) inspectClasses(raw.slice(apply[0].length), offset + start + apply[0].length, emit);
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '(') paren++;
    if (c === ')') paren--;
    if (c === '[') bracket++;
    if (c === ']') bracket--;
    if (paren || bracket) continue;
    if (c === '{') { stack.push(text.slice(start, i).trim()); start = i + 1; }
    else if (c === ';' || c === '}') { statement(i); if (c === '}') stack.pop(); start = i + 1; }
  }
  statement(text.length);
}

// 간단한 JS/TS 어휘 분석: 주석과 정규식은 제외하고 템플릿의 식은 재귀 검사한다.
function lex(source) {
  const tokens = [];
  let i = 0;
  const push = (kind, start, end, value = source.slice(start, end)) => tokens.push({ kind, start, end, value });
  function scan(templateExpression = false) {
    let braces = 0;
    while (i < source.length) {
      const c = source[i], start = i;
      if (/\s/.test(c)) { i++; continue; }
      if (source.startsWith('//', i)) { while (i < source.length && source[i] !== '\n') i++; continue; }
      if (source.startsWith('/*', i)) { const end = source.indexOf('*/', i + 2); i = end < 0 ? source.length : end + 2; continue; }
      if (c === '"' || c === "'") {
        i++;
        while (i < source.length && source[i] !== c) { if (source[i] === '\\') i++; i++; }
        i++;
        push('string', start, i, source.slice(start + 1, i - 1));
        continue;
      }
      if (c === '`') {
        i++;
        let segment = i;
        while (i < source.length) {
          if (source[i] === '\\') { i += 2; continue; }
          if (source[i] === '`') { push('template', segment - 1, i + 1, source.slice(segment, i)); i++; break; }
          if (source.startsWith('${', i)) {
            push('template', segment - 1, i, source.slice(segment, i));
            i += 2; push('punct', i - 1, i, '{'); scan(true); segment = i; continue;
          }
          i++;
        }
        continue;
      }
      if (c === '/' && /^(?:=|\(|\[|,|:|!|&&|\|\||\?|return|=>)$/.test(tokens.at(-1)?.value || '=')) {
        i++; let cls = false;
        while (i < source.length && source[i] !== '\n') {
          if (source[i] === '\\') { i += 2; continue; }
          if (source[i] === '[') cls = true;
          if (source[i] === ']') cls = false;
          if (source[i++] === '/' && !cls) break;
        }
        while (/[a-z]/i.test(source[i] || '')) i++;
        push('regex', start, i); continue;
      }
      const word = /^[\w$]+/.exec(source.slice(i));
      if (word) { i += word[0].length; push('word', start, i); continue; }
      const punct = /^(?:=>|\?\.|\.\.\.|===|!==|==|!=|&&|\|\||\?\?)/.exec(source.slice(i));
      i += punct ? punct[0].length : 1;
      push('punct', start, i);
      if (c === '{') braces++;
      if (c === '}') { if (templateExpression && braces === 0) return; braces--; }
    }
  }
  scan();
  return tokens;
}

function pairsFor(tokens) {
  const pairs = new Map(), stack = [];
  for (let i = 0; i < tokens.length; i++) {
    const v = tokens[i].value;
    if (tokens[i].kind !== 'punct') continue;
    if (['(', '[', '{'].includes(v)) stack.push(i);
    if ([')', ']', '}'].includes(v)) {
      const open = stack.at(-1);
      if (open !== undefined && '([{'.indexOf(tokens[open].value) === ')]}'.indexOf(v)) {
        stack.pop(); pairs.set(open, i); pairs.set(i, open);
      }
    }
  }
  return pairs;
}

function inspectDialogs(tokens, pairs, emit) {
  const tracked = new Set(['alert', 'confirm', 'prompt', 'window', 'globalThis', 'self']);
  const bindings = [], declarations = new Set(), scopes = [{ start: 0, end: tokens.length }], functionScopes = [];
  for (let i = 0; i < tokens.length; i++) if (tokens[i].value === '{' && pairs.has(i)) scopes.push({ start: i, end: pairs.get(i) });
  const scopeAt = i => scopes.filter(s => s.start < i && i < s.end).sort((a, b) => b.start - a.start)[0] || scopes[0];
  const add = (i, scope) => {
    if (tracked.has(tokens[i]?.value)) { bindings.push({ name: tokens[i].value, ...scope }); declarations.add(i); }
  };
  const bindPattern = (start, end, scope) => {
    // 기본값의 호출과 타입 이름은 바인딩이 아니다.
    const skipToComma = (i, limit) => {
      while (i < limit && tokens[i].value !== ',') {
        if (pairs.has(i) && ['(', '[', '{'].includes(tokens[i].value)) i = pairs.get(i);
        i++;
      }
      return i;
    };
    const pattern = i => {
      if (tokens[i]?.value === '...') i++;
      const v = tokens[i]?.value;
      if (v === '{' || v === '[') {
        const close = pairs.get(i) ?? i;
        let j = i + 1;
        while (j < close) {
          if (tokens[j].value === ',') { j++; continue; }
          if (v === '{' && tokens[j + 1]?.value === ':') j = pattern(j + 2);
          else j = pattern(j);
          j = skipToComma(j, close) + 1;
        }
        return close + 1;
      }
      add(i, scope);
      return i + 1;
    };
    let i = start;
    if (tokens[i]?.value === '(') i++;
    while (i < end) { i = pattern(i); i = skipToComma(i, end) + 1; }
  };
  for (let i = 0; i < tokens.length; i++) {
    const v = tokens[i].value;
    if (/^(?:const|let|var)$/.test(v)) {
      let start = i + 1;
      const scope = v === 'var'
        ? functionScopes.filter(s => s.start < i && i < s.end).sort((a, b) => b.start - a.start)[0] || scopes[0]
        : scopeAt(i);
      while (start < tokens.length) {
        let end = start;
        if (['{', '['].includes(tokens[end]?.value)) end = (pairs.get(end) ?? end) + 1;
        else end++;
        bindPattern(start, end, scope);
        while (end < tokens.length && ![',', ';', '}', 'in', 'of'].includes(tokens[end].value)) {
          if (pairs.has(end) && ['(', '[', '{'].includes(tokens[end].value)) end = pairs.get(end);
          end++;
        }
        if (tokens[end]?.value !== ',') break;
        start = end + 1;
      }
    }
    if (v === 'import') {
      let end = i + 1; while (end < tokens.length && !['from', ';'].includes(tokens[end].value)) end++;
      for (let j = i + 1; j < end; j++) if (tokens[j + 1]?.value !== 'as') add(j, scopes[0]);
    }
    if (v === 'function') {
      let p = i + 1; if (tokens[p]?.value === '*') p++;
      const named = tokens[p]?.value !== '(' ? p++ : null;
      const end = pairs.get(p);
      if (end === undefined) continue;
      let body = end + 1;
      while (body < tokens.length && !['{', ';', '=>'].includes(tokens[body].value)) body++;
      const scope = { start: p, end: pairs.get(body) ?? end };
      functionScopes.push(scope);
      if (named !== null) add(named, /^(?:=|\(|,|:|return)$/.test(tokens[i - 1]?.value || '') ? scope : scopeAt(i));
      bindPattern(p + 1, end, scope);
    }
    if (v === '=>') {
      const close = i - 1, open = tokens[close]?.value === ')' ? pairs.get(close) : close;
      if (open === undefined) continue;
      let end = i + 1;
      if (tokens[end]?.value === '{') end = pairs.get(end) ?? end;
      else {
        while (end < tokens.length && ![';', ',', ')', '}', ']'].includes(tokens[end].value)) {
          if (pairs.has(end) && ['(', '[', '{'].includes(tokens[end].value)) end = pairs.get(end);
          end++;
        }
      }
      bindPattern(open, i, { start: open - 1, end });
      functionScopes.push({ start: open - 1, end });
    }
    // 객체 메서드의 매개변수도 지역 바인딩이다.
    if (v === '(' && tokens[i - 1]?.kind === 'word' && !/^(?:if|for|while|switch|with|catch)$/.test(tokens[i - 1].value)) {
      const end = pairs.get(i);
      if (end !== undefined && tokens[end + 1]?.value === '{') {
        const scope = { start: i, end: pairs.get(end + 1) ?? end };
        bindPattern(i + 1, end, scope); functionScopes.push(scope);
      }
    }
    if (v === 'catch' && tokens[i + 1]?.value === '(') {
      const end = pairs.get(i + 1);
      if (end !== undefined) bindPattern(i + 2, end, { start: i, end: pairs.get(end + 1) ?? end });
    }
  }
  const local = (name, i) => bindings.some(b => b.name === name && b.start <= i && i <= b.end);
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.kind !== 'word' || !/^(?:alert|confirm|prompt)$/.test(t.value) || declarations.has(i)) continue;
    const next = tokens[i + 1]?.value === '?.' ? i + 2 : i + 1;
    if (tokens[next]?.value !== '(') continue;
    const end = pairs.get(next);
    if (tokens[end + 1]?.value === '{' || tokens[end + 1]?.value === ':') continue;
    if (['.', '?.'].includes(tokens[i - 1]?.value)) {
      const receiver = tokens[i - 2]?.value;
      if (!['window', 'globalThis', 'self'].includes(receiver) || ['.', '?.'].includes(tokens[i - 3]?.value) || local(receiver, i)) continue;
    } else if (local(t.value, i) || tokens[i - 1]?.value === 'new') continue;
    emit('native-dialog', t.start);
  }
}

function inspectTsx(source, emit) {
  const tokens = lex(source), pairs = pairsFor(tokens);
  const classRanges = [], handledColors = new Set();
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (/className$/i.test(t.value) && tokens[i + 1]?.value === '=') {
      const start = i + 2; classRanges.push([start, pairs.get(start) ?? start]);
    }
    if (/^(?:cn|cx|clsx|classNames|cva|twMerge)$/.test(t.value) && tokens[i + 1]?.value === '(') classRanges.push([i + 1, pairs.get(i + 1) ?? i + 1]);
  }
  // className={styles}처럼 같은 파일에서 참조한 변수의 초기값도 따라간다.
  const initializers = new Map();
  for (let i = 1; i < tokens.length; i++) {
    if (tokens[i].kind !== 'word' || tokens[i + 1]?.value !== '=' || !['const', 'let', 'var', ','].includes(tokens[i - 1].value)) continue;
    let end = i + 2;
    while (end < tokens.length && ![';', ',', '}'].includes(tokens[end].value)) {
      if (pairs.has(end) && ['(', '[', '{'].includes(tokens[end].value)) end = pairs.get(end);
      end++;
    }
    const list = initializers.get(tokens[i].value) || [];
    list.push([i + 2, end - 1]); initializers.set(tokens[i].value, list);
  }
  const followed = new Set();
  for (let r = 0; r < classRanges.length; r++) {
    const [a, b] = classRanges[r];
    for (let i = a; i <= b; i++) {
      if (tokens[i]?.kind !== 'word' || followed.has(tokens[i].value)) continue;
      const name = tokens[i].value;
      if (initializers.has(name)) { followed.add(name); classRanges.push(...initializers.get(name)); }
    }
  }
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i], next = tokens[i + 1];
    if ((t.kind === 'word' || t.kind === 'string') && [':', '='].includes(next?.value)) {
      const prop = kebab(t.value);
      if (/^(?:--[\w-]+|(?:-webkit-)?(?:font-weight|font|text-transform|letter-spacing|box-shadow|text-shadow|filter|backdrop-filter|background(?:-\w+)?|color|fill|stroke|stop-color|flood-color|border(?:-\w+)?|outline(?:-\w+)?|text-decoration-color|caret-color|accent-color))$/.test(prop)) {
        const start = i + 2;
        let end = start;
        if (next.value === '=') end = pairs.get(start) ?? start;
        else {
          while (end < tokens.length && ![',', '}', ';'].includes(tokens[end].value)) {
            if (pairs.has(end) && ['(', '[', '{'].includes(tokens[end].value)) end = pairs.get(end);
            end++;
          }
          end--;
        }
        // 조건식의 두 갈래와 애니메이션 배열 안의 정적 값도 검사한다.
        for (let j = start; j <= end; j++) {
          const literal = ['string', 'template'].includes(tokens[j]?.kind);
          const number = /^[+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?\b/i.exec(source.slice(tokens[j]?.start));
          const value = literal ? tokens[j].value : number?.[0];
          if (value) { inspectValue(t.value, value, t.start, emit); handledColors.add(j); }
          if (!literal && number) {
            const limit = tokens[j].start + number[0].length;
            while (j + 1 <= end && tokens[j + 1].start < limit) j++;
          }
        }
      }
    }
    if (!['string', 'template'].includes(t.kind)) continue;
    const inClass = classRanges.some(([a, b]) => a <= i && i <= b);
    if (inClass) inspectClasses(t.value, t.start + 1, emit);
    // CSS-in-JS 템플릿도 선언으로 검사한다.
    if (t.kind === 'template' && /[{}]/.test(t.value) && /[\w-]+\s*:/.test(t.value)) inspectCss(t.value, emit, t.start + 1);
    const address = /^(?:href|src|id|name|key)$/.test(tokens[i - 2]?.value || '') && tokens[i - 1]?.value === '=';
    if (!handledColors.has(i) && !address && /^(?:#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})|(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\([\s\S]*\))$/i.test(t.value)) emit('color-outside-tokens', t.start + 1);
  }
  inspectDialogs(tokens, pairs, emit);
}

// JSON.parse로 유효성을 확인한 후 문자열 값의 경로와 원본 위치를 보존한다.
function inspectMessages(source, emit) {
  JSON.parse(source);
  const token = /"(?:\\.|[^"\\])*"|[{}\[\]:,]|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g;
  const tokens = [...source.matchAll(token)];
  let i = 0;
  const checks = {
    'copy-emdash': /[\u2014\u2013]/u,
    'copy-middledot': /[\u00b7\u30fb\u2027\u2022]/u,
    'copy-exclamation': /[!\uff01]/u,
    'copy-question': /[?\uff1f]/u,
    'copy-apology': /죄송|미안|불편을\s*드려|\b(?:sorry|apologi[sz](?:e|es|ed|ing)|apolog(?:y|ies))\b|抱歉|对不起|對不起|不好意思|深表歉意|申し訳|すみません/iu,
  };
  function value(keys) {
    const t = tokens[i++];
    if (t[0] === '{') {
      while (tokens[i][0] !== '}') {
        const key = JSON.parse(tokens[i++][0]); i++;
        value([...keys, key]); if (tokens[i][0] === ',') i++;
      }
      i++;
    } else if (t[0] === '[') {
      let n = 0;
      while (tokens[i][0] !== ']') { value([...keys, String(n++)]); if (tokens[i][0] === ',') i++; }
      i++;
    } else if (t[0].startsWith('"')) {
      const decoded = JSON.parse(t[0]);
      for (const [rule, re] of Object.entries(checks)) if (re.test(decoded)) emit(rule, t.index, { key: keys.join('.') });
    }
  }
  value([]);
}

export function lintSource(file, source, settings = config) {
  const found = [], seen = new Set();
  const exceptions = settings.exceptions.map(e => ({ ...e, matchFile: glob(e.file), matchKey: e.keyPattern ? new RegExp(e.keyPattern, 'i') : null }));
  const starts = [0];
  for (let i = 0; i < source.length; i++) if (source[i] === '\n') starts.push(i + 1);
  const emit = (rule, at, context = {}) => {
    if (exceptions.some(e => e.matchFile.test(file) && (e.rules.includes('*') || e.rules.includes(rule))
        && (!e.matchKey || e.matchKey.test(context.key || ''))
        && (!e.selector || e.selector === context.selector)
        && (!e.value || e.value === context.value))) return;
    let lo = 0, hi = starts.length;
    while (lo + 1 < hi) { const mid = (lo + hi) >> 1; if (starts[mid] <= at) lo = mid; else hi = mid; }
    const line = lo + 1, column = at - starts[lo] + 1;
    // 선언, 클래스 토큰 또는 JSON 값마다 같은 규칙은 한 번만 센다.
    const identity = `${rule}:${at}`;
    if (seen.has(identity)) return;
    seen.add(identity);
    const raw = source.slice(starts[lo], (starts[lo + 1] ?? source.length)).trimEnd();
    const left = Math.max(0, column - 65);
    const snippet = (left ? '...' : '') + raw.slice(left, left + 180).trim() + (raw.length > left + 180 ? '...' : '');
    found.push({ file, line, column, rule, snippet, fix: rules[rule], ...(context.key ? { key: context.key } : {}) });
  };
  if (file.startsWith('messages/') && file.endsWith('.json')) inspectMessages(source, emit);
  else if (file.endsWith('.css')) inspectCss(source, emit);
  else if (file.endsWith('.tsx')) inspectTsx(source, emit);
  return found.sort((a, b) => a.line - b.line || a.column - b.column || a.rule.localeCompare(b.rule));
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(e => {
    if (e.isSymbolicLink()) return [];
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

export function run(scope = 'new') {
  if (!config.scopes[scope]) throw new Error(`알 수 없는 범위: ${scope}`);
  const patterns = config.scopes[scope].map(glob);
  const files = ['app', 'components', 'messages'].flatMap(d => walk(path.join(webRoot, d)))
    .map(f => path.relative(webRoot, f).replaceAll('\\', '/'))
    .filter(f => (/\.(css|tsx)$/.test(f) || /^messages\/.*\.json$/.test(f)) && patterns.some(p => p.test(f))).sort();
  const violations = files.flatMap(f => lintSource(f, fs.readFileSync(path.join(webRoot, f), 'utf8')));
  const counts = Object.fromEntries(Object.keys(rules).map(r => [r, 0]));
  for (const v of violations) counts[v.rule]++;
  return { scope, files, counts, total: violations.length, violations };
}

function main() {
  let scope = 'new', json;
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--scope' && ['new', 'all'].includes(args[i + 1])) scope = args[++i];
    else if (args[i] === '--json' && args[i + 1] && !args[i + 1].startsWith('--')) json = args[++i];
    else if (args[i] === '--help') { console.log('사용법: node scripts/design-lint/lint.mjs [--scope new|all] [--json <결과 파일>]'); return; }
    else throw new Error(`잘못된 인수: ${args[i]}. --help로 사용법을 확인합니다.`);
  }
  const result = run(scope);
  if (json) {
    const target = path.resolve(json);
    const relative = path.relative(webRoot, target).replaceAll('\\', '/');
    if (!target.endsWith('.json') || /^(?:app|components|lib|stores|messages)\//.test(relative) || target === path.join(here, 'config.json')) {
      throw new Error('결과는 앱 소스와 config.json 이외의 .json 파일에 저장합니다.');
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(result, null, 2) + '\n');
  }
  for (const v of result.violations) console.log(`[${v.file}:${v.line} / ${v.rule} / ${v.snippet}${v.key ? ` (키: ${v.key})` : ''} / ${v.fix}]`);
  console.log(`\n범위: ${scope}, 검사 파일: ${result.files.length}`);
  for (const [rule, count] of Object.entries(result.counts)) console.log(`${rule}: ${count}`);
  console.log(`합계: ${result.total}`);
  process.exitCode = result.total ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(`검사 오류: ${error.message}`); process.exitCode = 2; }
}
