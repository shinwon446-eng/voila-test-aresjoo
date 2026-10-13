// 통합 담당의 도구 4: INTERACTION_MATRIX.md 와 STATE_TRANSITIONS.md 를 만든다.
//   node migration-audit/harness/consolidate/parse.mjs
//   node migration-audit/harness/consolidate/reach.mjs
//   node migration-audit/harness/consolidate/compare-rerun.mjs
//   node migration-audit/harness/consolidate/build.mjs
// 손으로 적은 것은 overlay-i.mjs, overlay-s.mjs, frag-*.md 에 있다. 이 파일은 그것을 분석가의 표와 합쳐 적는다.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OVERLAY, EXTRA } from "./overlay-i.mjs";
import { S as SOV, NEW } from "./overlay-s.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const AUDIT = path.resolve(here, "../..");
const J = (f) => JSON.parse(fs.readFileSync(path.join(here, f), "utf8"));
const parsed = J("parsed.json"), reach = J("reach.json"), rerun = J("rerun-compare.json");
const cross = JSON.parse(fs.readFileSync(path.resolve(here, "../consolidator-rerun/results/20-cross.json"), "utf8"));
const frag = (f) => fs.readFileSync(path.join(here, f), "utf8").replace(/\r\n/g, "\n").trimEnd();
const pad = (n) => String(n).padStart(3, "0");
const uniq = (a) => [...new Set(a)];
const num = (id) => +id.replace(/^\D+/, "");

/** CX-I-1207, 1208, 1209 → CX-I-1207~1209 */
function compress(ids) {
  const ns = uniq(ids.map(num)).sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < ns.length; i++) { let j = i; while (j + 1 < ns.length && ns[j + 1] === ns[j] + 1) j++; out.push(i === j ? String(ns[i]) : ns[i] + "~" + ns[j]); i = j; }
  return out.length ? "CX-I-" + out.join(", ") : "";
}
const rowRanges = (ns) => { const s = uniq(ns).sort((a, b) => a - b); const out = []; for (let i = 0; i < s.length; i++) { let j = i; while (j + 1 < s.length && s[j + 1] === s[j] + 1) j++; out.push(i === j ? "I-" + pad(s[i]) : "I-" + pad(s[i]) + "~" + pad(s[j])); i = j; } return out.join(", "); };

// 통합 담당이 실제로 읽은 줄의 범위(파일마다). 한 줄짜리는 핸들러 줄만 훑어본 것이다
const L = (...ns) => ns.map((n) => [n, n]);
const READ = {
  "components/ui/Sheet.tsx": [[1, 99999]], "lib/useModal.ts": [[1, 99999]], "components/shell/AppShell.tsx": [[1, 99999]], "components/shell/StateScreens.tsx": [[1, 99999]], "app/not-found.tsx": [[1, 99999]], "app/page.tsx": [[1, 99999]], "lib/ledgerLock.ts": [[1, 99999]], "lib/labSite.ts": [[1, 99999]],
  "components/shell/AppFooter.tsx": [[20, 69]], "components/box/BoxScreen.tsx": [[40, 335]], "components/box/Opening.tsx": [[60, 355]], "components/box/Reveal.tsx": [[37, 181], [240, 304]],
  "components/inventory/InventoryScreen.tsx": [[55, 190]], "components/flow/LoginSheet.tsx": [[18, 112]], "components/account/AccountSheets.tsx": [[15, 104]], "components/account/AccountScreen.tsx": [[30, 84]],
  "stores/authStore.ts": [[60, 128]], "components/wallet/WalletScreen.tsx": [[40, 146]], "components/verify/VerifyScreen.tsx": [[40, 110]], "components/box/ReviewsScreen.tsx": [[15, 44]], "components/flow/ReviewSheet.tsx": [[30, 72]],
  "lib/opening.ts": [[36, 117]], "lib/openingFlow.ts": [[55, 82], [96, 139]], "lib/claim.ts": [[16, 74]], "lib/takeBatch.ts": [[58, 66], [300, 320], [340, 432]], "stores/openingJournal.ts": [[18, 60]], "lib/useUsdtDeposit.ts": [[24, 74]],
  "components/auth/AuthHost.tsx": [[14, 53]], "stores/communityStore.ts": [[17, 40]], "lib/browserAccount.ts": [[144, 160], [228, 236], [336, 341]], "stores/walletStore.ts": [[195, 203], [230, 238]], "lib/depositCredit.ts": [[11, 21]],
  "components/flow/TakeSheet.tsx": [[85, 140], ...L(40, 43, 44, 56, 150, 160, 167, 178, 191, 197, 199, 203, 236, 237, 240, 241)],
  "components/flow/VerifySheet.tsx": [[36, 57], ...L(88, 89)],
  "components/wallet/WithdrawScreen.tsx": [[69, 136], ...L(170, 174, 183, 184, 185, 186, 201, 206, 208, 210, 211, 216, 218, 220, 221, 233, 238, 241, 242, 244, 246, 249, 261, 262)],
  "components/box/BoxList.tsx": [[44, 66], [114, 120], ...L(85, 91, 102, 106)],
  "components/flow/BalanceSheet.tsx": L(34, 38, 39, 46, 52, 54, 55, 56, 59), "components/flow/ChargeSheet.tsx": L(38, 39, 44, 45, 56), "components/flow/ShipSheet.tsx": L(35, 62, 63, 64, 66, 68, 70, 72, 77, 79),
  "components/verify/ChainRecord.tsx": L(28, 29), "components/box/WinsScreen.tsx": L(41, 59, 65, 74, 88, 94, 109, 110, 114), "components/wallet/TwoFactorSetup.tsx": L(48, 73, 79, 83, 90, 93, 95),
  "components/box/BoxReviews.tsx": L(126, 130, 152, 166, 168, 186, 191, 192, 194), "components/home/HeroBanner.tsx": [[127, 133], ...L(58, 59, 61, 65, 66, 67, 72, 75, 76, 83, 88, 115, 123, 125, 184, 185)],
  "components/ui/kit.tsx": L(24, 29, 30, 31, 39, 50, 51), "components/ui/toast.tsx": L(19, 21), "components/ui/ScrollRow.tsx": L(20, 22, 23, 28, 33, 34), "components/layout/LabBadge.tsx": L(20, 24),
  "components/shell/MovedScreen.tsx": L(14), "app/[locale]/guide/page.tsx": L(24), "components/legal/LegalCenterScreen.tsx": L(22), "components/legal/LegalDocScreen.tsx": L(25), "components/layout/BrandLogo.tsx": L(37),
  "components/layout/CurrencyHydrator.tsx": [[10, 28]], "app/opening.css": [[104, 108]], "lib/reviewSamples.ts": [[69, 71]],
};
const wasRead = (c) => typeof c.file === "string" && (READ[c.file] ?? []).some(([a, z]) => c.from >= a && c.to <= z);
const readNote = (cites) => { const n = cites.length, m = cites.filter(wasRead).length; return !n || !m ? "" : m === n ? "인용한 줄을 전부 읽음" : `인용 ${n}곳 가운데 ${m}곳을 읽음`; };
/**
 * Antigravity 의 두 보고서는 U 와 I 번호를 다른 뜻으로 다시 썼다. 다른 통합 문서(UI_INVENTORY.md)와 같게
 * 소스 보고서의 것은 AGa-U-, AGa-I-, 브라우저 보고서의 것은 AGb-U-, AGb-I- 로 적는다. 겹치지 않는 번호(AG-TL, AG-S 등)는 그대로다.
 */
const normAg = (text) => String(text ?? "").split(";").map((seg) => {
  const s = seg.trim();
  const m = s.match(/^AG-(a|b)\s+(.*)$/);
  if (!m) return s;
  const which = m[1];
  let body = m[2].replace(/AG-(U|I)-/g, "AG" + which + "-$1-");
  if (/^(\d|[가-힣])/.test(body)) body = "`agy-" + which + "` " + body; // "5.2절 6번" 같은 절 인용
  return body;
}).join("; ");
const agyPost = (doc) => doc
  .replace(/AG-(a|b) 의 AG-(U|I)-/g, "AG$1-$2-")
  .replace(/AG-(a|b) AG-(U|I)-/g, "AG$1-$2-")
  .replace(/AG-(a|b) 의 AG-/g, "AG-")
  .replace(/AG-(a|b) AG-/g, "AG-")
  .replace(/AG-a/g, "`agy-a`").replace(/AG-b/g, "`agy-b`")
  .replace(/…/g, "...");
const SCRIPT = { "00": "00-probe.mjs", "01": "01-nav.mjs", "01b": "01b-nav-debug.mjs", "02": "02-box.mjs", "03": "03-auth.mjs", "04": "04-open.mjs", "05": "05-take.mjs", "06": "06-wallet.mjs", "07": "07-verify-wins.mjs", "09": "09-keys-dblclick.mjs", "09b": "09b-debug.mjs", "10": "10-misc.mjs", "11": "11-gallery-dev.mjs", "12": "12-extra.mjs" };
const refsOf = (text) => uniq([...String(text).matchAll(/(\d{2}b?):([a-z]\d+|probe)/g)].map((m) => m[1] + ":" + m[2]));
const rerunOf = (refs) => ({ same: refs.filter((k) => rerun.scenarios[k]?.rerun && rerun.scenarios[k].same), not: refs.filter((k) => rerun.scenarios[k] && !rerun.scenarios[k].rerun), dev: refs.filter((k) => k.startsWith("11:")) });
const WHY_NOT = { "03": "계정을 만들고 비밀번호를 넣는 시나리오", "05:t2": "배송 시트에 수령 정보를 넣는 시나리오", "06:w3": "출금 화면의 시나리오", "06:w4": "출금 화면의 시나리오", "09:k1": "비밀번호를 넣는 시나리오", "09b:e1": "비밀번호를 넣는 시나리오", "10:m4": "비밀번호를 넣는 시나리오", "11": "개발 서버 전용" };
const whyNot = (k) => WHY_NOT[k] ?? WHY_NOT[k.split(":")[0]] ?? "";

// 통합 담당의 교차 실행이 닿는 행과 사례
const ONLY_I = {
  11: "Enter 만으로는 확정되지 않는다는 것은 CL 만 적었다",
  15: "지금 화면 표시가 박스에만 붙는다는 것은 CL 만 적었다(AG 는 그 표시의 모양만 적었다)",
  29: "주소의 query 가 사라진다는 것은 CX 만 적었다",
  30: "출금 화면의 금액이 새 단위로 읽힌다는 것은 CX 만 적었다",
  37: "옛 주소를 가리킨다는 것은 CL 만 적었다",
  47: "뒤로 가면 목록이 처음 상태라는 것은 CL 만 적었다",
  62: "장부 쓰기만 버려지는 경우는 CX 만 적었다",
  86: "주소의 box 를 처음 한 번만 읽는다는 것은 CX 만 적었다",
  87: "주소의 box 를 처음 한 번만 읽는다는 것은 CX 만 적었다",
  106: "같은 자리의 두 번 누름은 CL 만 적었다",
  121: "같은 자리를 눌러도 받아지지 않는 경우는 CL 만 적었다",
  162: "autoFocus 가 듣지 않는다는 것은 CL 만 적었다",
  181: "같은 자리의 두 번 누름은 CL 만 적었다",
  196: "닫아도 초안이 남는다는 것은 CX 만 적었다",
  199: "같은 자리의 세 번 누름은 CL 만 적었다",
  215: "통화를 바꾼 뒤의 재해석은 CX 만 적었다",
  221: "차감 결과를 보지 않는다는 것은 CX 만 적었다",
};
const ONLY_HOW = {
  11: "09:k2 재실행 같은 결과(09b:e1 은 다시 돌리지 않음)", 15: "01:n1 재실행 같은 결과", 29: "통합 실행 20:c1", 30: "통합 실행 20:c6", 37: "01:n4 재실행 같은 결과",
  47: "01:n2, 01b:d2, 07:v3 재실행 같은 결과", 62: "통합 실행 20:c5", 86: "코드(통합이 읽음). 화면으로 만들지 못함", 87: "코드(통합이 읽음). 화면으로 만들지 못함",
  106: "09:k3, 09b:e3 재실행 같은 결과", 121: "09:k3 재실행 같은 결과", 162: "분석가의 실행만(09:k1, 09b:e1, 03:a1). 통합은 코드를 읽음", 181: "09:k3, 09b:e2 재실행 같은 결과",
  196: "통합 실행 20:c3", 199: "09:k3 재실행 같은 결과", 215: "통합 실행 20:c6", 221: "코드(통합이 읽음). 출금 신청을 보내지 않으므로 실행하지 못함",
};
const CROSS_I = { 29: "20:c1", 30: "20:c6", 62: "20:c5", 108: "20:c7", 196: "20:c3", 198: "20:c4", 215: "20:c6", 229: "20:c2" };
const CROSS_S = { 34: "20:c5", 55: "20:c7", 86: "20:c4", 91: "20:c2", 94: "20:c6", 96: "20:c1" };
// 코드로만 읽었고 실행하지 못한 까닭이 있는 행(분석가의 "확인하지 못한 것" 표)
const NV_I = { 36: "그리기 오류를 일으킬 길이 없다", 80: "전용 핸들러가 없는 브라우저의 가로 스크롤이다", 107: "이 상태를 만드는 시험 스위치가 배포 빌드에서 꺼져 있다", 111: "헤드리스 브라우저로는 소리를 들을 수 없다", 137: "이 상태를 만드는 시험 스위치가 배포 빌드에서 꺼져 있다", 147: "배포 사이트에 입금 주소가 없다", 148: "배포 사이트에 입금 주소가 없다", 160: "Google 과 같은 코드 경로라 누르지 않았다", 167: "클립보드 권한을 주지 않았다", 179: "30건을 넘는 기록을 만들지 않았다", 194: "배송 신청을 보내지 않는다(지시)", 204: "30건을 넘는 기록을 만들지 않았다", 221: "출금 신청을 보내지 않는다(지시)", 222: "출금 신청을 보내지 않는다(지시)", 223: "출금 신청을 보내지 않는다(지시)", 226: "20건을 넘는 기록을 만들지 않았다", 236: "30건을 넘는 기록을 만들지 않았다" };
const NV_S = { 19: "배포 사이트에 입금 주소가 없다", 32: "수십 ms 의 틈에 다른 탭을 움직여야 한다", 35: "수십 ms 의 틈에 계정을 바꿔야 한다", 44: "시각을 옮긴 기록을 심지 않았다", 50: "소리를 들을 수 없다", 62: "두 탭으로 만들 수 있으나 시도하지 않았다", 63: "이 상태를 만드는 시험 스위치가 배포 빌드에서 꺼져 있다", 66: "이 상태를 만드는 시험 스위치가 배포 빌드에서 꺼져 있다", 69: "두 탭으로 만들 수 있으나 시도하지 않았다", 70: "받는 수 ms 사이에 시트를 다시 열어야 한다", 80: "출금 신청을 보내지 않는다(지시)", 81: "출금 신청을 보내지 않는다(지시)", 82: "출금 신청을 보내지 않는다(지시)" };

const CATS = {
  R2: "배포 사이트에서 실행, 통합 담당이 다시 돌려 같은 결과",
  R1: "배포 사이트에서 실행(분석가만. 통합 담당은 다시 돌리지 않음)",
  RD: "개발 서버에서 실행(분석가만. 배포 사이트에는 없는 화면)",
  X: "통합 담당이 배포 사이트에서 직접 실행",
  SC2: "실행 중 화면에서 읽음(누르지는 않음), 통합 담당이 다시 돌려 같은 결과",
  SC1: "실행 중 화면에서 읽음(분석가만)",
  CO: "코드로만 읽음",
  NV: "코드로만 읽음, 실행하지 못함(까닭 있음)",
  AGR: "다른 참여자(AG)가 배포 사이트에서 잼, 통합 담당은 코드 줄만 확인",
};

// ───────────────────────── 인터랙션 ─────────────────────────
const SCREEN_OF = (row) => {
  if (row["화면"]) return row["화면"];
  const h = row.h3 || row.h2;
  const m = h.match(/^[\d.]+\s+([^(]+)/);
  const name = (m ? m[1] : h).trim();
  return { "모든 겹침 화면에 공통인 규칙": "겹침 화면 공통", "USDT로 받기 선택 시트와 확인창": "받기 선택 시트", "로그인과 가입 시트": "로그인 시트", "계정 화면": "계정", "배송 시트와 후기 쓰기 시트": "배송 시트, 후기 쓰기 시트", "검증과 나온 상품": "검증, 나온 상품", "개발 전용 갤러리": "개발 갤러리" }[name] ?? name;
};
const expand = (cell, cites) => {
  let out = cell;
  for (const c of cites) if (typeof c.file === "string" && c.short !== c.file) out = out.split("`" + c.short + ":").join("`" + c.file + ":");
  return out;
};
// 짧게 적힌 인용(`AppShell.tsx:49`)을 web/ 기준의 전체 경로로 푼다. 이름이 겹치거나 없는 파일이면 그대로 둔다
const WEB = path.resolve(AUDIT, "../web");
const webFiles = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (["node_modules", ".next", "out"].includes(e.name)) continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(tsx?|css|mjs|json)$/.test(e.name)) webFiles.push(path.relative(WEB, p).replace(/\\/g, "/")); } })(WEB + "/app");
for (const d of ["components", "lib", "stores", "i18n"]) (function walk(dd) { for (const e of fs.readdirSync(dd, { withFileTypes: true })) { const p = path.join(dd, e.name); if (e.isDirectory()) walk(p); else if (/\.(tsx?|css|mjs|json)$/.test(e.name)) webFiles.push(path.relative(WEB, p).replace(/\\/g, "/")); } })(path.join(WEB, d));
const resolveShort = (short) => { const s = short.replace(/^web\//, ""); if (webFiles.includes(s)) return s; const tail = webFiles.filter((f) => f.endsWith("/" + s)); return tail.length === 1 ? tail[0] : null; };
const expandAll = (text) => String(text ?? "").replace(/`([\w./\[\]-]+\.(?:tsx?|css|mjs|json)):/g, (m, short) => { const r = resolveShort(short); return r ? "`" + r + ":" : m; });
const esc = (s) => expandAll(String(s ?? "").replace(/\|/g, "/").replace(/\s+/g, " ").trim());

const iRows = [];
const counts = {};
const bump = (o, k) => { o[k] = (o[k] ?? 0) + 1; };
const reachableCL = parsed.clRows.filter((r) => num(r.id) <= 239);
for (const row of reachableCL) {
  const n = num(row.id), ov = OVERLAY[n] ?? {};
  const cells = { "컨트롤": row["컨트롤"], "이벤트": row["이벤트"], "핸들러": expand(row["핸들러"] ?? "", row.cites), "전 → 후": row["전 → 후"], "화면 변화": row["화면 변화"], "저장 변화": row["저장 변화"] };
  if (ov.fix) Object.assign(cells, ov.fix);
  if (ov.add) for (const [k, v] of Object.entries(ov.add)) cells[k] = String(cells[k] ?? "").replace(/[. ]+$/, "") + ". " + v.replace(/^[. ]+/, "");
  const cxLine = uniq(row.cites.flatMap((c) => c.cx ?? []));
  const src = ["CL-I-" + pad(n), ov.cx ? "CX: " + ov.cx : "", cxLine.length ? "CX 색인(같은 줄): " + compress(cxLine) : "", ov.ag ? "AG: " + normAg(ov.ag) : ""].filter(Boolean).join(". ");
  const agreeBase = ov.dis ? `불일치(${ov.dis}), 해소됨` : ov.cx && ov.ag ? "일치(CL, CX, AG)" : ov.cx ? "일치(CL, CX)" : ov.ag ? (cxLine.length ? "일치(CL, AG)" : "일치(CL, AG)") : cxLine.length ? "자리 일치(CL, CX 색인)" : "단독(CL)";
  const agree = agreeBase + (ONLY_I[n] ? ". " + ONLY_I[n] : "");
  const v = row["확인"] ?? "";
  const refs = refsOf(v), rr = rerunOf(refs);
  const kind = /^실행/.test(v) ? "run" : /^화면/.test(v) ? "screen" : "code";
  const onlyDev = refs.length > 0 && refs.every((k) => k.startsWith("11:"));
  const cat = kind === "run" ? (rr.same.length ? "R2" : onlyDev ? "RD" : "R1") : kind === "screen" ? (rr.same.length ? "SC2" : "SC1") : NV_I[n] ? "NV" : "CO";
  const mine = [];
  if (ov.fixNote) mine.push("인용 줄을 고침: " + ov.fixNote);
  else if (row.cites.length) mine.push("인용 줄 대조 맞음");
  if (readNote(row.cites)) mine.push(readNote(row.cites));
  if (rr.same.length) mine.push("재실행 같은 결과 " + rr.same.join(", "));
  const notRun = rr.not.filter((k) => !k.startsWith("11:"));
  if (notRun.length) mine.push("다시 돌리지 않음 " + notRun.join(", ") + "(" + uniq(notRun.map(whyNot)).filter(Boolean).join(", ") + ")");
  if (CROSS_I[n]) mine.push("교차 실행 " + CROSS_I[n]);
  if (NV_I[n]) mine.push("실행하지 못한 까닭: " + NV_I[n]);
  const verify = `[${cat}] 분석가: ${v.replace(/[. ]+$/, "")}. 통합: ${mine.join(". ") || "따로 본 것 없음"}`;
  bump(counts, cat);
  iRows.push({ n, cl: n, screen: SCREEN_OF(row), ...cells, kb: ov.kb ?? "-", src, agree, verify, test: ov.t ?? "없음", tag: ov.flag ?? "", cat, files: uniq(row.cites.map((c) => c.file).filter((f) => typeof f === "string")), single: agree.startsWith("단독"), dis: ov.dis, only: ONLY_I[n] ?? "", cross: CROSS_I[n] ?? "", agreeBase });
}
let next = 240;
const extraCat = (x) => (x.agree.startsWith("단독(AG)") ? "AGR" : /^분석가 실행/.test(x.verify) ? "R1" : "CO");
for (const x of EXTRA) {
  const cat = x.cat ?? extraCat(x); bump(counts, cat);
  const files = uniq([...x.handler.matchAll(/`([^`:]+):/g)].map((m) => m[1]));
  iRows.push({ n: next++, cl: null, screen: x.screen, "컨트롤": x.control, "이벤트": x.event, "핸들러": x.handler, "전 → 후": x.before, "화면 변화": x.visible, "저장 변화": x.stored, kb: x.kb, src: normAg(x.src), agree: x.agree, verify: `[${cat}] ${x.verify}`, test: x.test, tag: x.tag, cat, files, single: x.agree.startsWith("단독"), extra: true });
}
const lastReachable = next - 1;

// 도달할 수 없는 옛 부품: 파일마다 한 행
const CXU = [[/^components\/home\/(NetflixHome|CommerceHome)\./, "CX-U-002"], [/(HallOfFame|home\/ProofFeed|fairness\/ProofFeed|LiveTicker|LiveCounters|JackpotPoolBadge)\./, "CX-U-003"], [/(home\/HotBoxes|inventory\/HotBoxes|DailyFreeBox|AboutBanner|DiscoveryGuide|QuickTabs|LiveReviewsSection)\./, "CX-U-004"], [/^components\/unboxing\//, "CX-U-005"], [/^components\/box\/(BoxCard|DetailModal|ProductArt|TierStrip)\./, "CX-U-006"], [/^components\/about\//, "CX-U-007"], [/^components\/community\//, "CX-U-008"], [/^components\/auth\//, "CX-U-009"], [/^components\/fairness\//, "CX-U-010"], [/^components\/wallet\//, "CX-U-011"], [/^components\/inventory\//, "CX-U-012"], [/^components\/(layout|legal|ui)\//, "CX-U-013"]];
const clLegacy = parsed.clRows.filter((r) => num(r.id) >= 240);
const legacy = [];
for (const f of reach.unreachable.filter((x) => x.file.startsWith("components/")).sort((a, b) => a.file.localeCompare(b.file))) {
  const base = f.file.split("/").pop();
  const dir = f.file.split("/")[1];
  const cl = clLegacy.find((r) => r["파일"].includes(f.file)) ?? clLegacy.find((r) => r["파일"].includes("components/" + dir + "/") && r["파일"].includes("`" + base + "`")) ?? clLegacy.find((r) => r["파일"].includes("components/" + dir + "/") && r["파일"].includes(base));
  const cxu = CXU.find(([re]) => re.test(f.file))?.[1] ?? "";
  const cf = parsed.cxFiles[f.file];
  const attrs = Object.entries(f.byAttr).map(([a, ls]) => a + " " + ls.join(", ")).join("; ");
  const who = (reach.importers[f.file] ?? []).map((x) => x.replace(/^components\//, ""));
  legacy.push({ n: next++, file: f.file, handlers: f.handlers, attrs: attrs || "조작 속성 없음", who: who.length ? who.join(", ") + "(전부 도달 불가)" : "없음", cl: cl ? cl.id + (cl["핸들러 수"] ? (cl["핸들러 수"].includes(",") ? "(여러 파일을 묶은 행. 분석가가 센 수는 파일 차례대로 " + cl["핸들러 수"] + ")" : "(분석가가 센 수: " + cl["핸들러 수"] + ")") : "") : "", cxu, cxEv: cf ? compress(cf.eventIds) : "", cxWr: cf ? compress(cf.writeIds) : "" });
}
const clLegacyUsed = new Set(legacy.map((l) => l.cl.split("(")[0]).filter(Boolean));

// CX 색인의 파일별 대응(완전한 매핑)
const fileRows = {};
for (const r of iRows) for (const f of r.files) (fileRows[f] ??= []).push(r.n);
const idxTable = Object.keys(parsed.cxFiles).sort().map((f) => {
  const cf = parsed.cxFiles[f];
  const leg = legacy.find((l) => l.file === f);
  const reachableByGraph = reach.reachable.some((x) => x.file === f) || f.startsWith("app/");
  const where = leg ? "I-" + pad(leg.n) + "(도달 불가 절)" : fileRows[f] ? rowRanges(fileRows[f]) : reachableByGraph ? "행 없음(가)" : "행 없음(나)";
  return `| \`${f}\` | ${cf.reachable === false ? "도달 불가" : cf.reachable === true ? "도달" : reachableByGraph ? "도달(통합의 그래프)" : "도달 불가(통합의 그래프)"} | ${compress(cf.eventIds) || "-"} | ${compress(cf.writeIds) || "-"} | ${where} |`;
});

const HEAD = "| id | 화면 | 컨트롤 | 이벤트 | 핸들러(파일:줄) | 전 → 후 | 화면 변화 | 저장 변화(키) | 키보드와 포커스 | 출처 id | 일치 | 확인 | 덮는 시험 | 표시 |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|";
const line = (r) => `| I-${pad(r.n)} | ${esc(r.screen)} | ${esc(r["컨트롤"])} | ${esc(r["이벤트"])} | ${esc(r["핸들러"])} | ${esc(r["전 → 후"])} | ${esc(r["화면 변화"])} | ${esc(r["저장 변화"])} | ${esc(r.kb)} | ${esc(r.src)} | ${esc(r.agree)} | ${esc(r.verify)} | ${esc(r.test)} | ${esc(r.tag)} |`;
const groups = [];
{
  let cur = null;
  for (const r of iRows) {
    const h2 = r.extra ? "" : parsed.clRows.find((x) => num(x.id) === r.cl).h2;
    const key = r.extra ? "통합 담당이 더한 행" : /^0\./.test(h2) ? "모든 겹침 화면에 공통인 규칙" : h2.replace(/^\d+\.\s*/, "");
    if (!cur || cur.key !== key) { cur = { key, rows: [] }; groups.push(cur); }
    cur.rows.push(r);
  }
}
const iBody = groups.map((g, i) => `### 1.${i + 1} ${g.key} (I-${pad(g.rows[0].n)} 에서 I-${pad(g.rows[g.rows.length - 1].n)})\n\n${HEAD}\n${g.rows.map(line).join("\n")}`).join("\n\n");
const legacyBody = "| id | 파일 | on 으로 시작하는 JSX 속성 수(통합이 셈) | 속성과 줄 | 누가 가져오는가 | 출처 id | CX 사건 색인 | CX 쓰기 색인 | 확인 |\n|---|---|---|---|---|---|---|---|---|\n" +
  legacy.map((l) => `| I-${pad(l.n)} | \`${l.file}\` | ${l.handlers} | ${l.attrs} | ${l.who} | ${[l.cl, l.cxu].filter(Boolean).join(". ") || "통합(그래프)"} | ${l.cxEv || "-"} | ${l.cxWr || "-"} | 코드. 통합의 import 그래프로 도달 불가를 확인 |`).join("\n");

const catTable = (c, order) => "| 확인 상태 | 수 |\n|---|---|\n" + order.filter((k) => c[k]).map((k) => `| [${k}] ${CATS[k]} | ${c[k]} |`).join("\n");
const untestedI = iRows.filter((r) => /^없음/.test(r.test));
const untestedByScreen = {};
for (const r of untestedI) (untestedByScreen[r.screen] ??= []).push(r.n);
const untestedTable = "| 화면 | 덮는 시험이 없는 행 |\n|---|---|\n" + Object.entries(untestedByScreen).map(([s, ns]) => `| ${s} | ${rowRanges(ns)} |`).join("\n");
const singles = iRows.filter((r) => r.single);
const singleTable = "| 출처 | 행 수 | 행 | 통합 담당이 한 확인 |\n|---|---|---|---|\n" + ["단독(CL)", "단독(CX)", "단독(AG)", "단독(통합)"].map((k) => { const rs = singles.filter((r) => r.agree.startsWith(k)); if (!rs.length) return null; const by = {}; for (const r of rs) bump(by, r.cat); return `| ${k} | ${rs.length} | ${rowRanges(rs.map((r) => r.n))} | ${Object.entries(by).map(([c, n]) => `[${c}] ${n}`).join(", ")} |`; }).filter(Boolean).join("\n");
const partial = iRows.filter((r) => r.only);
const partialTable = "| 행 | 한 참여자만 적은 내용 | 그 내용을 통합 담당이 확인한 방법 |\n|---|---|---|\n" + partial.map((r) => `| I-${pad(r.n)} | ${r.only} | ${ONLY_HOW[r.n] ?? "-"} |`).join("\n");
const agreeCount = {}; for (const r of iRows) bump(agreeCount, (r.agreeBase ?? r.agree).replace(/\(D-\d+\)/, "").replace(/\. .*$/, ""));
const agreeTable = "| 일치 상태 | 행 수 |\n|---|---|\n" + Object.entries(agreeCount).sort((a, b) => b[1] - a[1]).map(([k, n]) => `| ${k} | ${n} |`).join("\n");
const defects = iRows.filter((r) => /^원본 결함/.test(r.tag));
const statusRows = iRows.filter((r) => /^기능 상태/.test(r.tag));
const defectList = defects.map((r) => `- I-${pad(r.n)}: ${r.tag.replace(/^원본 결함( 후보)?: /, "")}${/^원본 결함 후보/.test(r.tag) ? " (후보: 실행으로 확인하지 못했다)" : ""}`).join("\n");
const statusList = statusRows.map((r) => `- I-${pad(r.n)}: ${r.tag.replace(/^기능 상태: /, "")}`).join("\n");
const rerunKeys = Object.keys(rerun.scenarios);
const rer = rerunKeys.filter((k) => rerun.scenarios[k].rerun);
const sumR = (sel) => rer.reduce((a, k) => a + rerun.scenarios[k].rerun[sel], 0);
const crossSum = { pass: cross.results.filter((r) => r.pass === true).length, fail: cross.results.filter((r) => r.pass === false).length, info: cross.results.filter((r) => r.pass === "info").length };
const rerunTable = "| 스크립트 | 시나리오 | 분석가(통과, 실패, 본 것만) | 통합 재실행 | 검사마다 견준 결과 |\n|---|---|---|---|---|\n" + rerunKeys.map((k) => { const s = rerun.scenarios[k]; const [a, b] = k.split(":"); const f = (x) => `${x.pass}, ${x.fail}, ${x.info}`; return `| \`${SCRIPT[a]}\` | ${k} | ${f(s.analyst)} | ${s.rerun ? f(s.rerun) : "돌리지 않음: " + whyNot(k)} | ${s.rerun ? (s.same ? "전부 같음" : "다름") : "-"} |`; }).join("\n");
const crossTable = "| 시나리오 | 검사 | 결과 | 본 것 |\n|---|---|---|---|\n" + cross.results.map((r) => `| 20:${r.scenario} | ${esc(r.name)} | ${r.pass === "info" ? "본 것만" : r.pass ? "통과" : "실패"} | ${esc(String(r.detail).slice(0, 220))} |`).join("\n");

const vars = {
  ROWS: iBody, LEGACY: legacyBody, IDX: "| 파일 | CX 가 적은 도달 여부 | 사건 색인(9.4절) | 쓰기 색인(9.5절) | 이 문서의 행 |\n|---|---|---|---|---|\n" + idxTable.join("\n"),
  COUNTS: catTable(counts, ["R2", "R1", "RD", "SC2", "SC1", "CO", "NV", "AGR"]), TOTAL_REACH: String(iRows.length), LAST_REACH: "I-" + pad(lastReachable), FIRST_LEGACY: "I-" + pad(lastReachable + 1), LAST_LEGACY: "I-" + pad(next - 1), LEGACY_FILES: String(legacy.length), LEGACY_HANDLERS: String(legacy.reduce((a, l) => a + l.handlers, 0)),
  EXTRA_FIRST: "I-240", EXTRA_LAST: "I-" + pad(lastReachable), EXTRA_N: String(EXTRA.length),
  UNTESTED: untestedTable, UNTESTED_N: String(untestedI.length), SINGLES: singleTable, PARTIAL: partialTable, AGREE: agreeTable, DEFECTS: defectList, STATUSES: statusList,
  RERUN: rerunTable, RERUN_N: String(rer.length), RERUN_ALL: String(rerunKeys.length), RERUN_SAME: String(rer.filter((k) => rerun.scenarios[k].same).length), RERUN_PASS: String(sumR("pass")), RERUN_FAIL: String(sumR("fail")), RERUN_INFO: String(sumR("info")),
  CROSS: crossTable, CROSS_PASS: String(crossSum.pass), CROSS_FAIL: String(crossSum.fail), CROSS_INFO: String(crossSum.info),
  CX_INDEX_N: String(parsed.cxIndex.length), CX_FILES_N: String(Object.keys(parsed.cxFiles).length),
  DIS_ROWS: Object.entries(iRows.filter((r) => r.dis).reduce((a, r) => { (a[r.dis] ??= []).push(r.n); return a; }, {})).map(([d, ns]) => `${d}: ${rowRanges(ns)}`).join(". "),
};
const fill = (text, v) => text.replace(/\{\{(\w+)\}\}/g, (m, k) => { if (!(k in v)) throw new Error("빈 자리 표시: " + k); return v[k]; });
const iDoc = agyPost(expandAll(fill(frag("frag-i.md"), vars))) + "\n";

// ───────────────────────── 상태 전이 ─────────────────────────
const LABEL = [[/^처음/, "초기 상태"], [/^사건과 상태/, "사건과 상태 변화"], [/^사건/, "사건과 입력"], [/^전제/, "전제조건"], [/^상태/, "상태 변화"], [/^자료/, "데이터 변화"], [/^화면/, "화면 변화"], [/^오류와 취소/, "오류와 취소"], [/^새로 고침 뒤/, "영속성과 새로 고침 뒤"], [/^근거/, "근거"], [/^기존 시험/, "TEST"], [/^확인/, "VERIFY"]];
const DEFAULTS = { "전제조건": "따로 없음", "상태 변화": "따로 적힌 것 없음", "데이터 변화": "없음", "화면 변화": "따로 적힌 것 없음", "오류와 취소": "따로 적힌 것 없음", "영속성과 새로 고침 뒤": "저장값(장부, 설정, 로그인)은 남고 화면의 상태(열린 시트, 입력, 단계, 수량)는 처음으로 돌아간다(S-099 의 일반 규칙. 이 사례에서 따로 확인한 것은 아니다)" };
const H_S = { 6: "H:C", 21: "H:D2", 22: "H:D", 24: "H:D, H:F", 25: "H:F, H:F2", 26: "H:F(10개의 확인창과 취소까지)", 29: "H:E", 30: "H:E2", 33: "H:C", 51: "H:D", 52: "H:D", 53: "H:D", 54: "H:D, H:I", 57: "H:D, H:D2", 59: "H:F", 61: "H:E2", 71: "H:H", 72: "H:H", 73: "H:H(확정은 하지 않는다)", 74: "H:H2(확인창을 열고 닫기까지)", 75: "H:H2", 76: "H:H3", 77: "H:H3", 78: "H:H3", 85: "H:J", 89: "H:I", 91: "H:I", 92: "H:I", 93: "H:G", 94: "H:K", 96: "H:K", 97: "H:A(주소로 바로 들어가기)", 98: "H:A, H:K", 99: "H:A, H:K(새로 고침)", 100: "H:L", 101: "H:L(저장값이 깨졌을 때)", 23: "하네스 motion.mjs(장부를 쓴 때를 잰다. 정의됨)", 36: "하네스 motion.mjs second-press, rapid-triple-click(정의됨)", 38: "하네스 motion.mjs one-skip, one-escape(정의됨)", 39: "하네스 motion.mjs refresh-mid(정의됨)", 40: "하네스 motion.mjs back-mid, leave-mid(정의됨)", 86: "H:J(글 없이 올리기)", 46: "하네스 motion.mjs one-reduced, five-reduced(정의됨)", 47: "하네스 motion.mjs one-short(정의됨)" };
const sCounts = {};
const sCases = [];
for (const c of parsed.clCases) {
  const n = num(c.id), ov = SOV[n] ?? {};
  const fields = []; let cur = null; let test = "", ver = "";
  for (const b of c.bullets) {
    if (/^  - /.test(b)) { if (cur) cur.sub.push(b.slice(4)); continue; }
    const body = b.slice(2);
    const m = body.match(/^([^:]{1,60}):\s*(.*)$/);
    let label = m ? m[1].trim() : null, text = m ? m[2] : body;
    if (!m) { cur = { label: "그 밖", text: body, sub: [] }; fields.push(cur); continue; }
    const paren = label.match(/^([^(]+)(\(.+\))$/);
    const key = (paren ? paren[1] : label).trim();
    const map = LABEL.find(([re]) => re.test(key));
    if (map && map[1] === "TEST") { test = text; cur = null; continue; }
    if (map && map[1] === "VERIFY") { ver = text; cur = null; continue; }
    cur = { label: map ? map[1] : label, text: (paren && map ? paren[2] + " " : "") + text, sub: [], mapped: !!map };
    fields.push(cur);
  }
  const get = (l) => fields.filter((f) => f.label === l);
  const order = ["초기 상태", "사건과 입력", "전제조건", "상태 변화", "데이터 변화", "화면 변화", "오류와 취소", "영속성과 새로 고침 뒤"];
  const out = [];
  const hasBranches = fields.some((f) => /^(갈래|규칙|순서|때|저장하지 않는 것|확정하면)/.test(f.label));
  const render = (f) => `- ${f.label}:${f.text ? " " + f.text : ""}${f.sub.length ? "\n" + f.sub.map((s) => "  - " + s).join("\n") : ""}`;
  for (const l of order) {
    const fs_ = get(l);
    if (fs_.length) { out.push(...fs_.map(render)); continue; }
    if (l === "초기 상태") out.push(`- 초기 상태: ${ov.init ?? "분석가가 따로 적지 않았다(앞 사례에 이어진다)"}`);
    else if (l === "사건과 입력") { if (!get("사건과 상태 변화").length) out.push(`- 사건과 입력: ${ov.event ?? "분석가가 따로 적지 않았다(제목이 사건이다)"}`); }
    else out.push(`- ${l}: ${hasBranches && ["상태 변화", "화면 변화", "오류와 취소"].includes(l) ? "아래의 갈래와 규칙에 적었다" : DEFAULTS[l]}`);
  }
  for (const f of fields) if (!order.includes(f.label) && f.label !== "근거") out.push(render(f));
  if (ov.add) out.push("- " + ov.add);
  const ev = get("근거").map((f) => f.text).join(" ");
  out.push(`- 근거(파일:줄): ${ev ? expand(ev, c.cites) : "분석가가 따로 적지 않았다"}`);
  const refs = refsOf(ver), rr = rerunOf(refs);
  const kind = /^실행/.test(ver) ? "run" : /^화면/.test(ver) ? "screen" : "code";
  const onlyDev = refs.length > 0 && refs.every((k) => k.startsWith("11:"));
  const cat = kind === "run" ? (rr.same.length ? "R2" : onlyDev ? "RD" : "R1") : kind === "screen" ? (rr.same.length ? "SC2" : "SC1") : NV_S[n] ? "NV" : "CO";
  bump(sCounts, cat);
  const mine = [];
  if (c.cites.length) mine.push(c.cites.every((x) => x.ok) ? "인용한 줄이 파일에 있는 것을 확인" : "인용 줄 일부가 파일 밖");
  if (readNote(c.cites)) mine.push(readNote(c.cites));
  if (rr.same.length) mine.push("재실행 같은 결과 " + rr.same.join(", "));
  const notRun = rr.not.filter((k) => !k.startsWith("11:"));
  if (notRun.length) mine.push("다시 돌리지 않음 " + notRun.join(", ") + "(" + uniq(notRun.map(whyNot)).filter(Boolean).join(", ") + ")");
  if (CROSS_S[n]) mine.push("교차 실행 " + CROSS_S[n]);
  if (NV_S[n]) mine.push("실행하지 못한 까닭: " + NV_S[n]);
  const agree = ov.dis ? `불일치(${ov.dis}), 해소됨` : ov.cx && ov.ag ? "일치(CL, CX, AG)" : ov.cx ? "일치(CL, CX)" : ov.ag ? "일치(CL, AG)" : "단독(CL)";
  out.push(`- 참여자 id: CL-S-${pad(n)}${ov.cx ? ". CX: " + ov.cx : ""}${ov.ag ? ". AG: " + normAg(ov.ag) : ""}`);
  out.push(`- 일치: ${agree}`);
  out.push(`- 확인: [${cat}] 분석가: ${ver} 통합: ${mine.join(". ") || "따로 본 것 없음"}`);
  const noTest = /^없음/.test(test) && !H_S[n];
  out.push(`- 덮는 시험: ${test}${H_S[n] ? " 감사 하네스: " + H_S[n] : ""}`);
  if (ov.flag) out.push(`- 표시: ${ov.flag}`);
  sCases.push({ n, title: c.title, h2: c.h2.replace(/^\d+\.\s*/, ""), text: expandAll(out.join("\n")), cat, agree, noTest, flag: ov.flag ?? "", single: agree.startsWith("단독"), dis: ov.dis });
}
let sn = 102;
const newCat = (x) => (/^통합 실행/.test(x.verify) ? "X" : "CO");
for (const x of NEW) {
  const cat = newCat(x); bump(sCounts, cat);
  const text = [`- 초기 상태: ${x.init}`, `- 사건과 입력: ${x.event}`, `- 전제조건: ${x.pre}`, `- 상태 변화: ${x.state}`, `- 데이터 변화: ${x.data}`, `- 화면 변화: ${x.screen}`, `- 오류와 취소: ${x.error}`, `- 영속성과 새로 고침 뒤: ${x.persist}`, `- 근거(파일:줄): ${x.evidence}`, `- 참여자 id: ${x.ids}`, `- 일치: ${x.agree}`, `- 확인: [${cat}] ${x.verify}`, `- 덮는 시험: ${x.test.replace(/U:([\w-]+)/g, "`tests/$1.test.ts`")}`, x.flag ? `- 표시: ${x.flag}` : null].filter(Boolean).join("\n");
  sCases.push({ n: sn++, title: x.title, h2: "통합 담당이 더한 사례", text, cat, agree: x.agree, noTest: /^없음/.test(x.test), flag: x.flag, single: x.agree.startsWith("단독"), isNew: true, section: x.section });
}
const sGroups = [];
{ let cur = null; for (const c of sCases) { if (!cur || cur.key !== c.h2) { cur = { key: c.h2, cases: [] }; sGroups.push(cur); } cur.cases.push(c); } }
const sBody = sGroups.map((g, i) => `### 2.${i + 1} ${g.key} (S-${pad(g.cases[0].n)} 에서 S-${pad(g.cases[g.cases.length - 1].n)})\n\n` + g.cases.map((c) => `#### S-${pad(c.n)} ${c.title}\n${c.text}`).join("\n\n")).join("\n\n");
const sRanges = (ns) => { const s = uniq(ns).sort((a, b) => a - b); const out = []; for (let i = 0; i < s.length; i++) { let j = i; while (j + 1 < s.length && s[j + 1] === s[j] + 1) j++; out.push(i === j ? "S-" + pad(s[i]) : "S-" + pad(s[i]) + "~" + pad(s[j])); i = j; } return out.join(", "); };
// CX-S 의 대응
const cxsMap = {};
const expandIds = (text) => { const out = []; for (const m of String(text).matchAll(/CX-S-(\d+)(?:~(\d+))?/g)) { const a = +m[1], b = +(m[2] ?? m[1]); for (let i = a; i <= b; i++) out.push(i); } return out; };
for (const c of parsed.clCases) for (const id of expandIds(SOV[num(c.id)]?.cx ?? "")) (cxsMap[id] ??= []).push(num(c.id));
NEW.forEach((x, i) => { for (const id of expandIds(x.ids)) (cxsMap[id] ??= []).push(102 + i); });
const cxsTable = "| CX 의 사례 | 이 문서의 사례 |\n|---|---|\n" + Array.from({ length: 40 }, (_, i) => i + 1).map((i) => `| CX-S-${pad(i)} | ${cxsMap[i] ? sRanges(cxsMap[i]) : "없음"} |`).join("\n");
const missingCxs = Array.from({ length: 40 }, (_, i) => i + 1).filter((i) => !cxsMap[i]);
const sAgree = {}; for (const c of sCases) bump(sAgree, /^불일치/.test(c.agree) ? "불일치, 해소됨" : c.agree.replace(/\. .*$/, ""));
const sAgreeTable = "| 일치 상태 | 사례 수 |\n|---|---|\n" + Object.entries(sAgree).sort((a, b) => b[1] - a[1]).map(([k, n]) => `| ${k} | ${n} |`).join("\n");
const sUntested = sCases.filter((c) => c.noTest);
const sDefects = sCases.filter((c) => /^원본 결함/.test(c.flag));
const sVars = {
  CASES: sBody, COUNTS: catTable(sCounts, ["R2", "R1", "RD", "X", "SC2", "SC1", "CO", "NV"]), TOTAL: String(sCases.length), NEW_N: String(NEW.length), NEW_FIRST: "S-102", NEW_LAST: "S-" + pad(sn - 1),
  CXS: cxsTable, AGREE: sAgreeTable, OPENING: fill(frag("frag-s-opening.md"), {}),
  UNTESTED: sUntested.map((c) => `- S-${pad(c.n)} ${c.title}`).join("\n"), UNTESTED_N: String(sUntested.length),
  DEFECTS: sDefects.map((c) => `- S-${pad(c.n)}: ${c.flag.replace(/^원본 결함[^:]*: /, "")}${/^원본 결함 후보/.test(c.flag) ? " (후보: 실행으로 확인하지 못했다)" : ""}`).join("\n"),
  STATUSES: sCases.filter((c) => /^기능 상태/.test(c.flag)).map((c) => `- S-${pad(c.n)}: ${c.flag.replace(/^기능 상태: /, "")}`).join("\n"),
  SINGLES: "| 출처 | 사례 수 | 사례 | 확인 상태 |\n|---|---|---|---|\n" + ["단독(CL)", "단독(CX)"].map((k) => { const rs = sCases.filter((c) => c.agree.startsWith(k)); const by = {}; for (const r of rs) bump(by, r.cat); return `| ${k} | ${rs.length} | ${sRanges(rs.map((r) => r.n))} | ${Object.entries(by).map(([c, n]) => `[${c}] ${n}`).join(", ")} |`; }).join("\n"),
  RERUN_N: vars.RERUN_N, RERUN_ALL: vars.RERUN_ALL, RERUN_SAME: vars.RERUN_SAME, RERUN_PASS: vars.RERUN_PASS, RERUN_FAIL: vars.RERUN_FAIL, RERUN_INFO: vars.RERUN_INFO, CROSS_PASS: vars.CROSS_PASS, CROSS_FAIL: vars.CROSS_FAIL, CROSS_INFO: vars.CROSS_INFO,
};
const sDoc = agyPost(expandAll(fill(frag("frag-s.md"), sVars))) + "\n";

// ───────────────────────── 검사 ─────────────────────────
const problems = [];
for (const [name, doc] of [["INTERACTION_MATRIX.md", iDoc], ["STATE_TRANSITIONS.md", sDoc]]) {
  for (const [ch, label] of [["—", "긴 줄표"], ["–", "줄표"], ["·", "가운뎃점"], ["ㆍ", "아래아 가운뎃점"], ["・", "가운뎃점"], ["!", "느낌표"], [String.fromCharCode(0x2026), "말줄임표"], [String.fromCharCode(0x2022), "가운뎃점"], [String.fromCharCode(0x2015), "긴 줄표"], ["！", "느낌표"]]) {
    const lines = doc.split("\n").map((l, i) => [i + 1, l]).filter(([, l]) => l.includes(ch));
    if (lines.length) problems.push(`${name}: ${label} ${lines.length}줄 (예: ${lines[0][0]}행 ${lines[0][1].slice(Math.max(0, lines[0][1].indexOf(ch) - 30), lines[0][1].indexOf(ch) + 30)})`);
  }
}
for (let i = 1; i <= 259; i++) if (!iDoc.includes("CL-I-" + pad(i))) problems.push("CL-I-" + pad(i) + " 가 문서에 없다");
for (let i = 1; i <= 44; i++) { const id = "CX-I-" + pad(i); if (!iDoc.includes(id) && !new RegExp("CX-I-0*\\d+~0*\\d+").test("") ) { const inRange = [...iDoc.matchAll(/CX-I-(\d{3})~(\d{3})/g)].some((m) => i >= +m[1] && i <= +m[2]); if (!inRange) problems.push(id + " 가 인터랙션 문서에 없다"); } }
for (let i = 1; i <= 101; i++) if (!sDoc.includes("CL-S-" + pad(i))) problems.push("CL-S-" + pad(i) + " 가 문서에 없다");
if (missingCxs.length) problems.push("대응 없는 CX-S: " + missingCxs.join(", "));
const unusedLegacy = clLegacy.filter((r) => !clLegacyUsed.has(r.id)).map((r) => r.id);
if (unusedLegacy.length) problems.push("도달 불가 절에 붙지 않은 CL 행: " + unusedLegacy.join(", "));

fs.writeFileSync(path.join(AUDIT, "INTERACTION_MATRIX.md"), iDoc);
fs.writeFileSync(path.join(AUDIT, "STATE_TRANSITIONS.md"), sDoc);
console.log("INTERACTION rows", iRows.length, "legacy", legacy.length, "bytes", Buffer.byteLength(iDoc), JSON.stringify(counts));
console.log("STATE cases", sCases.length, "bytes", Buffer.byteLength(sDoc), JSON.stringify(sCounts));
console.log("agreement(I):", JSON.stringify(iRows.reduce((a, r) => { bump(a, r.agree.replace(/\(D-\d+\)/, "")); return a; }, {})));
console.log("agreement(S):", JSON.stringify(sCases.reduce((a, r) => { bump(a, r.agree.replace(/\(D-\d+\)/, "").replace(/, 해소.*$/, "")); return a; }, {})));
console.log("untested I", untestedI.length, "untested S", sUntested.length, "defect rows I", defects.length, "S", sDefects.length);
console.log(problems.length ? "PROBLEMS\n" + problems.join("\n") : "검사 통과");
