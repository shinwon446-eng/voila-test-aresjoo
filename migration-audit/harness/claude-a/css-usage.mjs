// 읽기 전용: CSS 파일마다 정의한 클래스가 라우트에서 닿는 소스에 쓰이는지 센다.
// 실행: node migration-audit/harness/claude-a/css-usage.mjs web
import fs from "node:fs";
import path from "node:path";
const web = path.resolve(process.argv[2] || "web");
const walk = (dir, out = []) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p, out); else out.push(p); } return out; };
const reachable = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "reachable.txt"), "utf8").split(/\r?\n/).filter(Boolean);
const srcReach = reachable.filter((f) => /\.(tsx|ts)$/.test(f)).map((f) => fs.readFileSync(path.join(web, f), "utf8")).join("\n") + walk(path.join(web, "app")).filter((f) => /\.tsx$/.test(f)).map((f) => fs.readFileSync(f, "utf8")).join("\n");
const srcAll = [...walk(path.join(web, "components")), ...walk(path.join(web, "app")), ...walk(path.join(web, "lib"))].filter((f) => /\.(tsx|ts)$/.test(f)).map((f) => fs.readFileSync(f, "utf8")).join("\n");
const has = (src, cls) => new RegExp("(?<![\\w-])" + cls.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&") + "(?![\\w-])").test(src);
for (const css of walk(path.join(web, "app")).filter((f) => f.endsWith(".css"))) {
  const text = fs.readFileSync(css, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const classes = [...new Set([...text.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]).filter((c) => !/^\d/.test(c)))];
  const inReach = classes.filter((c) => has(srcReach, c));
  const onlyLegacy = classes.filter((c) => !has(srcReach, c) && has(srcAll, c));
  const nowhere = classes.filter((c) => !has(srcAll, c));
  console.log(path.basename(css), "classes", classes.length, "reachable", inReach.length, "legacyOnly", onlyLegacy.length, "nowhere", nowhere.length);
  if (/ui\.css|opening\.css|take\.css|hero\.css|footer\.css|scroll-fade\.css/.test(css)) console.log("   not in reachable source:", [...onlyLegacy, ...nowhere].join(" "));
  else console.log("   used by reachable source:", inReach.slice(0, 60).join(" "));
}
