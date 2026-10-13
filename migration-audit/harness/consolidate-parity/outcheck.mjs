// 기준 빌드 산출물(VOILA-audit-before/web/out)의 정적 HTML 에서 몇 가지 속성을 읽는다. 읽기만 한다.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const out = process.argv[2];
const read = (rel) => (existsSync(path.join(out, rel)) ? readFileSync(path.join(out, rel), "utf8") : null);
const res = {};
for (const rel of ["ko/index.html", "en/index.html", "zh/index.html", "en/verify/index.html", "zh/wallet/index.html", "404.html", "en/dev/gallery/index.html"]) {
  const html = read(rel);
  res[rel] = html ? { htmlTag: (html.match(/<html[^>]*>/) || [null])[0], bytes: html.length } : "없음";
}
const cur = (rel) => { const html = read(rel); if (!html) return "없음"; return [...html.matchAll(/<a[^>]*aria-current="page"[^>]*>/g)].map((m) => (m[0].match(/href="([^"]*)"/) || [])[1]); };
res.ariaCurrent = { "ko/index.html": cur("ko/index.html"), "ko/inventory/index.html": cur("ko/inventory/index.html"), "ko/wallet/index.html": cur("ko/wallet/index.html"), "ko/guide/index.html": cur("ko/guide/index.html") };
const nav = (rel) => { const html = read(rel); const m = html && html.match(/<nav class="v-nav"[^>]*>(.*?)<\/nav>/); return m ? [...m[1].matchAll(/href="([^"]*)"/g)].map((x) => x[1]) : null; };
res.navHrefs = nav("ko/inventory/index.html");
const nf = read("404.html");
res.notFoundLink = nf ? (nf.match(/<a class="v-btn" href="([^"]*)"/) || [])[1] : null;
const guide = read("ko/guide/index.html");
res.guideLinks = guide ? [...guide.matchAll(/<a class="v-link"[^>]*href="([^"]*)"/g)].map((m) => m[1]) : null;
const gal = read("ko/dev/gallery/index.html");
res.galleryHasNotFoundCopy = gal ? /주소가 바뀌었거나 없는 화면/.test(gal) : null;
console.log(JSON.stringify(res, null, 1));
