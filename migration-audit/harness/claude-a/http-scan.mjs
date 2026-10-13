// 읽기 전용: 배포 사이트의 모든 정적 주소에 GET 을 보내 상태 코드만 적는다.
// 실행: node migration-audit/harness/claude-a/http-scan.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const BASE = "https://shinwon446-eng.github.io/voila-test-aresjoo";
const slugs = JSON.parse(fs.readFileSync(path.join(here, "slugs.json"), "utf8")).map((b) => b.slug);
const legal = ["terms", "privacy", "payments", "withdrawals", "refunds", "policy", "fairness", "safety", "community", "cookies", "complaints", "business", "faq"];
const fixed = ["", "about", "account", "community", "community/board", "dev/gallery", "fairness", "guide", "inventory", "legal", "profile", "reviews", "verify", "wallet", "wallet/withdraw", "wins"];
const urls = ["/"];
for (const l of ["ko", "en", "zh"]) {
  for (const f of fixed) urls.push(`/${l}/${f}${f ? "/" : ""}`);
  for (const d of legal) urls.push(`/${l}/legal/${d}/`);
  for (const s of slugs) urls.push(`/${l}/box/${s}/`);
  urls.push(`/${l}/box/no-such-box/`, `/${l}/legal/no-such-doc/`, `/${l}/no-such-page/`, `/${l}/admin/`, `/${l}/box/`);
}
urls.push("/ja/", "/no-such/", "/ko", "/ko/guide", "/404.html", "/404/");
const out = [];
let i = 0;
async function worker() {
  while (i < urls.length) {
    const u = urls[i++];
    try {
      const r = await fetch(BASE + u, { redirect: "manual" });
      const text = r.status === 200 || r.status === 404 ? await r.text() : "";
      out.push({ u, status: r.status, location: r.headers.get("location"), bytes: text.length, noindex: /name="robots" content="noindex/.test(text), title: (/<title>([^<]*)<\/title>/.exec(text) || [])[1], h1: (/<h1[^>]*>([^<]*)</.exec(text) || [])[1] });
    } catch (e) { out.push({ u, status: "ERR", error: String(e).slice(0, 80) }); }
  }
}
await Promise.all(Array.from({ length: 10 }, worker));
out.sort((a, b) => a.u.localeCompare(b.u));
fs.writeFileSync(path.join(here, "http-scan.json"), JSON.stringify(out, null, 1));
const by = {};
for (const o of out) by[o.status] = (by[o.status] || 0) + 1;
console.log("total", out.length, JSON.stringify(by));
const isBox = (u) => u.includes("/box/") && !u.includes("no-such") && !u.endsWith("/box/");
console.log(out.filter((o) => !isBox(o.u) || o.status !== 200).map((o) => `${o.status} ${o.u}${o.location ? " -> " + o.location : ""} ${o.bytes ?? ""} ${o.h1 ?? ""}`).join("\n"));
