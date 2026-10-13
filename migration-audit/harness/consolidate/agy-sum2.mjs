// AGY 측정 결과 요약 2. 읽기 전용. 인자: harness/agy 폴더, 저장소 루트
import fs from "node:fs";
import path from "node:path";
const dir = process.argv[2]; const root = process.argv[3];
const read = (n) => JSON.parse(fs.readFileSync(path.join(dir, n), "utf8"));
const rows = read("routes-result.json");
const by = (f) => { const m = new Map(); for (const r of rows) { const k = f(r); m.set(k, (m.get(k) || 0) + 1); } return [...m].map(([k, v]) => k + "=" + v).join(", "); };
console.log("라우트 x 언어 x 폭 조합:", rows.length);
console.log("폭별:", by((r) => r.width + "x" + r.height));
console.log("언어별:", by((r) => r.locale));
console.log("라우트별 폭:", [...new Set(rows.map((r) => r.routeId + " " + r.routePath + " [" + rows.filter((x) => x.routeId === r.routeId && x.locale === "ko").map((x) => x.width).join(",") + "]"))].join("\n  "));
console.log("상태:", by((r) => r.status), " loadError:", rows.filter((r) => r.loadError).length);
console.log("가로 넘침:", rows.filter((r) => r.domMetrics?.horizontalOverflow).length, " docW!=winW:", rows.filter((r) => r.domMetrics && r.domMetrics.docW !== r.domMetrics.winW).length);
console.log("콘솔 오류 있는 조합:", rows.filter((r) => r.consoleErrors?.length).length, " 실패 요청 있는 조합:", rows.filter((r) => r.failedRequests?.length).length);
console.log("missingImages 합:", rows.reduce((s, r) => s + (r.domMetrics?.missingImages?.length || 0), 0), " 있는 조합:", rows.filter((r) => r.domMetrics?.missingImages?.length).length);
console.log("제목(ko, 첫 폭):");
for (const id of [...new Set(rows.map((r) => r.routeId))]) { const r = rows.find((x) => x.routeId === id && x.locale === "ko"); console.log("  " + id + " /" + r.routePath + " -> " + JSON.stringify(r.domMetrics?.titles).slice(0, 200)); }
const shots = rows.flatMap((r) => [r.firstShot, r.fullShot]).filter(Boolean);
console.log("스크린샷 경로 수:", shots.length, " 실제 있는 것:", shots.filter((s) => fs.existsSync(path.join(root, "migration-audit", s)) || fs.existsSync(path.join(root, s))).length);
for (const n of ["overlays-result.json", "states-result.json", "primitives-result.json", "motion-result.json"]) {
  const v = read(n);
  console.log("\n== " + n + " ==");
  console.log(JSON.stringify(v, (k, val) => (typeof val === "string" && val.length > 160 ? val.slice(0, 160) + "..." : val), 1).slice(0, n === "primitives-result.json" ? 5200 : n === "motion-result.json" ? 3800 : 6200));
}
