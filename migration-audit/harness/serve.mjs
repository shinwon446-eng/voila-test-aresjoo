#!/usr/bin/env node
/**
 * 정적 내보내기 폴더를 배포와 같은 주소로 내주는 서버. 의존성 없음.
 *
 *   node serve.mjs <outDir> <port> [basePath]
 *   예) node serve.mjs C:/Users/hyun1/dev/VOILA-audit-before/web/out 4173
 *       → http://127.0.0.1:4173/voila-test-aresjoo/ko/
 *
 * GitHub Pages 가 하는 일을 그대로 흉내 낸다(같은 주소에 같은 답이 나오게):
 *   1. 기준 경로(/voila-test-aresjoo/) 아래만 내준다. 그 밖의 주소는 404.
 *   2. 폴더 주소는 index.html 로 답한다. 끝에 빗금이 없는 폴더 주소는 빗금을 붙인 주소로 301.
 *   3. 확장자 없는 주소에 같은 이름의 .html 이 있으면 그것으로 답한다(Pages 의 동작).
 *   4. 없는 주소는 내보내기 폴더의 404.html 을 상태 404 로 답한다.
 *   5. 127.0.0.1 에만 묶는다. 파일을 쓰지 않는다. 폴더 밖의 경로는 읽지 않는다.
 * 빌드는 하지 않는다. 이미 만들어진 out 폴더만 읽는다.
 */
import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, readFile } from 'node:fs/promises';
import path from 'node:path';

const [outArg, portArg, baseArg] = process.argv.slice(2);
if (!outArg || !portArg) {
  console.error('사용법: node serve.mjs <outDir> <port> [basePath=/voila-test-aresjoo]');
  process.exit(2);
}
const root = path.resolve(outArg);
const port = Number(portArg);
const base = '/' + (baseArg ?? '/voila-test-aresjoo').replace(/^\/+|\/+$/g, '');
if (!Number.isInteger(port) || port < 1 || port > 65535) { console.error('포트가 올바르지 않습니다: ' + portArg); process.exit(2); }

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.xml': 'application/xml; charset=utf-8', '.webmanifest': 'application/manifest+json',
};

const isFile = async (p) => { try { return (await stat(p)).isFile(); } catch { return false; } };
const isDir = async (p) => { try { return (await stat(p)).isDirectory(); } catch { return false; } };

/** 주소 → 내줄 파일. { file } 또는 { redirect } 또는 null(없음) */
async function resolve(pathname) {
  if (pathname === base) return { redirect: base + '/' };
  if (!pathname.startsWith(base + '/')) return null;
  let rel;
  try { rel = decodeURIComponent(pathname.slice(base.length)); } catch { return null; }
  if (rel.includes('\0')) return null;
  const target = path.join(root, rel);
  // 폴더 밖으로 나가는 경로는 없는 것으로 본다
  if (target !== root && !target.startsWith(root + path.sep)) return null;
  if (rel.endsWith('/')) {
    const index = path.join(target, 'index.html');
    return (await isFile(index)) ? { file: index } : null;
  }
  if (await isFile(target)) return { file: target };
  // 같은 이름의 .html 이 폴더보다 먼저다(배포 사이트 실측: /404 는 301 이 아니라 404.html 을 200 으로 답한다)
  if (!path.extname(target) && (await isFile(target + '.html'))) return { file: target + '.html' };
  if (await isDir(target)) return (await isFile(path.join(target, 'index.html'))) ? { redirect: pathname + '/' } : null;
  return null;
}

let notFoundBody = null;
const notFound = async () => {
  if (notFoundBody === null) {
    try { notFoundBody = await readFile(path.join(root, '404.html')); } catch { notFoundBody = Buffer.from('404 Not Found'); }
  }
  return notFoundBody;
};

const server = http.createServer(async (req, res) => {
  const started = Date.now();
  const done = (status) => { if (process.env.SERVE_LOG) console.log(`${status} ${req.method} ${req.url} ${Date.now() - started}ms`); };
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { allow: 'GET, HEAD' }); res.end(); return done(405); }
    const url = new URL(req.url, 'http://127.0.0.1');
    const hit = await resolve(url.pathname);
    if (!hit) {
      const body = await notFound();
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8', 'content-length': body.length, 'cache-control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : body);
      return done(404);
    }
    if (hit.redirect) { res.writeHead(301, { location: hit.redirect + url.search }); res.end(); return done(301); }
    const info = await stat(hit.file);
    const type = TYPES[path.extname(hit.file).toLowerCase()] ?? 'application/octet-stream';
    const headers = { 'content-type': type, 'accept-ranges': 'bytes', 'cache-control': 'no-cache', 'last-modified': info.mtime.toUTCString() };
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? '');
    if (range && (range[1] || range[2])) {
      const start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
      const end = range[1] && range[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1;
      if (start > end || start >= info.size) { res.writeHead(416, { 'content-range': `bytes */${info.size}` }); res.end(); return done(416); }
      res.writeHead(206, { ...headers, 'content-range': `bytes ${start}-${end}/${info.size}`, 'content-length': end - start + 1 });
      if (req.method === 'HEAD') { res.end(); return done(206); }
      createReadStream(hit.file, { start, end }).pipe(res);
      return done(206);
    }
    res.writeHead(200, { ...headers, 'content-length': info.size });
    if (req.method === 'HEAD') { res.end(); return done(200); }
    createReadStream(hit.file).on('error', () => res.destroy()).pipe(res);
    done(200);
  } catch (error) {
    try { res.writeHead(500); res.end('500'); } catch { /* 이미 보낸 답은 그대로 둔다 */ }
    console.error('오류: ' + req.url + ' ' + error.message);
  }
});

server.on('error', (error) => { console.error('서버를 띄우지 못했습니다: ' + error.message); process.exit(1); });
server.listen(port, '127.0.0.1', () => {
  console.log(`내보내기 폴더: ${root}`);
  console.log(`주소: http://127.0.0.1:${port}${base}/`);
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
