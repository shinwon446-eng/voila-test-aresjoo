import fs from "node:fs";
import path from "node:path";
const dir = process.argv[2]; const root = process.argv[3];
const runs = JSON.parse(fs.readFileSync(path.join(dir, "motion-result.json"), "utf8"));
for (const r of runs) {
  console.log("\n== " + r.runId + " box=" + r.boxSlug + " count=" + r.count + " reduced=" + r.reducedMotion + " frames=" + r.frames.length + " keys=" + Object.keys(r).join(","));
  let prev = "";
  for (const f of r.frames) {
    const d = f.domState || {};
    const key = [d.phase, d.openingState, d.hasResult, d.hasOpeningBox, d.hasAgainBtn, d.stage, d.done, d.armed].join("/");
    if (key !== prev) console.log("  t=" + f.elapsedMs + " actual=" + f.actualMs + "  " + JSON.stringify(d));
    prev = key;
  }
  const last = r.frames[r.frames.length - 1];
  console.log("  마지막 t=" + last.elapsedMs + " actual=" + last.actualMs + " 파일 있음=" + r.frames.filter((f) => fs.existsSync(path.join(root, "migration-audit", f.file))).length + "/" + r.frames.length);
}
const prim = JSON.parse(fs.readFileSync(path.join(dir, "primitives-result.json"), "utf8"));
console.log("\n== primitives keys", Object.keys(prim), Object.keys(prim.resultsByViewport || {}));
for (const [vp, set] of Object.entries(prim.resultsByViewport || {})) {
  for (const [name, v] of Object.entries(set)) {
    console.log(vp + " " + name + " [" + v.selector + "] found=" + v.found + " fs=" + v.fontSize + " fw=" + v.fontWeight + " lh=" + v.lineHeight + " pad=" + v.padding + " gap=" + v.gap + " r=" + v.borderRadius + " bw=" + v.borderWidth + " bc=" + v.borderColor + " bg=" + v.backgroundColor + " c=" + v.color + " h=" + v.height + " minH=" + v.minHeight + " w=" + v.width + " disp=" + v.display + " sh=" + v.boxShadow);
  }
}
for (const k of Object.keys(prim)) if (k !== "resultsByViewport") console.log(k, JSON.stringify(prim[k]).slice(0, 600));
