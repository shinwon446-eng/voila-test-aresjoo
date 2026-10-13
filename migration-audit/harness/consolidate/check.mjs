// 산출물 검사: 금지 문자, 스크린샷 경로, 번호 대응. 읽기 전용. 인자: migration-audit 폴더
import fs from "node:fs";
import path from "node:path";
const root = process.argv[2];
const files = ["ROUTE_INVENTORY.md", "UI_INVENTORY.md", "motion/ANIMATION_INVENTORY.md"];
const text = Object.fromEntries(files.map((f) => [f, fs.readFileSync(path.join(root, f), "utf8")]));
// 1. 금지 문자
const bad = [["긴 줄표", /[—–―]/g], ["가운뎃점", /[·・•ㆍ]/g], ["느낌표", /[!！]/g], ["말줄임표", /…/g]];
for (const f of files) for (const [name, re] of bad) {
  const lines = text[f].split("\n"); const hits = [];
  lines.forEach((l, i) => { if (re.test(l)) hits.push(i + 1); re.lastIndex = 0; });
  if (hits.length) console.log("금지 문자 " + name + " in " + f + ": 줄 " + hits.slice(0, 12).join(", "));
}
// 2. 그림 경로
for (const f of files) {
  const t = text[f]; const set = new Set();
  for (const m of t.matchAll(/`((?:screenshots|motion)\/[^`]+?\.png)`/g)) set.add(m[1]);
  for (const m of t.matchAll(/`((?:claude-a|agy)\/[^`]+?\.png)`/g)) set.add("screenshots/before/" + m[1]);
  if (f === "UI_INVENTORY.md" || f === "ROUTE_INVENTORY.md") for (const m of t.matchAll(/`([a-z0-9-]+\.png)`/gi)) set.add("screenshots/before/claude-a/" + m[1]);
  const miss = [...set].filter((p) => !fs.existsSync(path.join(root, p)) && !fs.existsSync(path.join(root, p.replace("screenshots/before/claude-a/", "screenshots/before/agy/overlays/"))));
  console.log(f + ": 그림 경로 " + set.size + ", 없는 것 " + miss.length + (miss.length ? " -> " + miss.join(" | ") : ""));
}
// 3. 번호 대응: 접두어마다 문서에 나온 번호를 펼친다(범위와 쉼표 나열 포함)
function expand(t, prefix) {
  const out = new Set();
  const esc = prefix.replace(/[-]/g, "\\-");
  const re = new RegExp(esc + "(\\d+)((?:\\s*(?:~|,)\\s*(?:" + esc + ")?\\d+)*)", "g");
  for (const m of t.matchAll(re)) {
    let prev = +m[1]; out.add(prev);
    for (const part of (m[2] || "").matchAll(/(~|,)\s*(?:[A-Za-z-]+-)?(\d+)/g)) {
      const n = +part[2];
      if (part[1] === "~") for (let i = prev; i <= n; i++) out.add(i); else out.add(n);
      prev = n;
    }
  }
  return out;
}
const need = (name, prefix, nums, where) => {
  const have = new Set(); for (const f of where) for (const n of expand(text[f], prefix)) have.add(n);
  const miss = nums.filter((n) => !have.has(n));
  console.log(name + ": 필요한 " + nums.length + ", 빠진 " + miss.length + (miss.length ? " -> " + miss.join(", ") : ""));
};
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
need("CX-R", "CX-R-", range(1, 24), ["ROUTE_INVENTORY.md"]);
need("CL-R", "CL-R-", range(1, 24), ["ROUTE_INVENTORY.md"]);
need("CL-U", "CL-U-", range(1, 215), ["UI_INVENTORY.md"]);
need("CX-U", "CX-U-", [...range(1, 17), ...range(100, 241), ...range(400, 737)], ["UI_INVENTORY.md"]);
need("CX-F(직접 DOM)", "CX-F-", range(60, 70), ["UI_INVENTORY.md"]);
need("AG-A", "AG-A-", range(1, 35), ["motion/ANIMATION_INVENTORY.md"]);
need("AG-TL", "AG-TL-", [...range(1, 7), ...range(10, 13)], ["motion/ANIMATION_INVENTORY.md"]);
need("AG-TOK", "AG-TOK-", [...range(1, 38), ...range(40, 49), ...range(50, 54), ...range(60, 66), ...range(70, 77), ...range(80, 90), ...range(95, 99), ...range(100, 104)], ["UI_INVENTORY.md", "motion/ANIMATION_INVENTORY.md"]);
need("AG-FNT", "AG-FNT-", range(1, 7), ["UI_INVENTORY.md"]);
need("AG-TX", "AG-TX-", range(1, 10), ["UI_INVENTORY.md"]);
need("AG-S", "AG-S-", range(1, 10), ["UI_INVENTORY.md"]);
need("AG-DIF", "AG-DIF-", range(1, 10), ["UI_INVENTORY.md", "motion/ANIMATION_INVENTORY.md"]);
need("AGa-U", "AGa-U-", [...range(1, 5), ...range(10, 24), ...range(30, 36)], ["UI_INVENTORY.md"]);
need("AGa-I", "AGa-I-", range(1, 4), ["UI_INVENTORY.md"]);
need("AGb-U", "AGb-U-", [...range(1, 8), ...range(10, 13)], ["UI_INVENTORY.md"]);
need("AGb-I", "AGb-I-", range(1, 8), ["UI_INVENTORY.md"]);
// 4. 최종 번호의 수와 줄 세기
for (const [f, p] of [["ROUTE_INVENTORY.md", "R"], ["UI_INVENTORY.md", "U"], ["motion/ANIMATION_INVENTORY.md", "A"]]) {
  const ids = new Set(); for (const m of text[f].matchAll(new RegExp("^\\| (" + p + "-\\d{3}) \\|", "gm"))) ids.add(m[1]);
  const list = [...ids].sort(); console.log(f + ": 표의 첫 칸 번호 " + list.length + " (" + list[0] + " ~ " + list[list.length - 1] + ")");
}
const uRows = text["UI_INVENTORY.md"].split("\n").filter((l) => /^\| U-\d{3} \|/.test(l));
const last = (l) => l.split("|").slice(-2)[0];
console.log("UI: 마지막 칸에 '전달' 이 든 줄 " + uRows.filter((l) => /전달/.test(last(l))).length + ", '전달' 로만 된 줄 " + uRows.filter((l) => /^\s*(일치\. )?전달[^,]*$/.test(last(l).trim()) || /^전달/.test(last(l).trim())).length + ", '확인 불가' 가 든 줄 " + uRows.filter((l) => /확인 불가/.test(last(l))).length + ", 줄 수 " + uRows.length);
for (const f of files) console.log(f + " 크기 " + Buffer.byteLength(text[f]) + " 바이트, " + text[f].split("\n").length + " 줄");
