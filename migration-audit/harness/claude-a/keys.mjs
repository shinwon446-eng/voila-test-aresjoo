// 읽기 전용: 라우트에서 닿는 컴포넌트가 쓰는 문구 키를 뽑아 세 언어 파일에 있는지 본다.
// 실행: node migration-audit/harness/claude-a/keys.mjs web
import fs from "node:fs";
import path from "node:path";
const web = path.resolve(process.argv[2] || "web");
const read = (p) => JSON.parse(fs.readFileSync(path.join(web, "messages", p), "utf8"));
const langs = ["ko", "en", "zh"];
const V = Object.fromEntries(langs.map((l) => [l, read(`v.${l}.json`)]));
const L = Object.fromEntries(langs.map((l) => [l, read(`${l}.json`)]));
const get = (obj, key) => key.split(".").reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), obj);
const flat = (obj, pre = "", out = []) => { for (const [k, v] of Object.entries(obj)) { if (v && typeof v === "object" && !Array.isArray(v)) flat(v, pre + k + ".", out); else out.push(pre + k); } return out; };

// 라우트에서 닿는 파일(직접 읽어 확인한 목록)
const files = [
  "app/[locale]/guide/page.tsx", "app/not-found.tsx",
  "components/shell/AppShell.tsx", "components/shell/AppFooter.tsx", "components/shell/GuideFees.tsx", "components/shell/MovedScreen.tsx", "components/shell/StateScreens.tsx",
  "components/ui/kit.tsx", "components/ui/Sheet.tsx", "components/ui/ScrollRow.tsx", "components/ui/toast.tsx",
  "components/box/BoxList.tsx", "components/box/BoxScreen.tsx", "components/box/BoxReviews.tsx", "components/box/Opening.tsx", "components/box/Reveal.tsx", "components/box/ReviewsScreen.tsx", "components/box/WinsScreen.tsx",
  "components/flow/BalanceSheet.tsx", "components/flow/ChargeSheet.tsx", "components/flow/LoginSheet.tsx", "components/flow/ReviewSheet.tsx", "components/flow/ShipSheet.tsx", "components/flow/TakeSheet.tsx", "components/flow/VerifySheet.tsx",
  "components/home/HeroBanner.tsx", "components/inventory/InventoryScreen.tsx",
  "components/verify/VerifyScreen.tsx", "components/verify/VerifyMethod.tsx", "components/verify/ChainRecord.tsx",
  "components/wallet/WalletScreen.tsx", "components/wallet/WithdrawScreen.tsx", "components/wallet/TwoFactorSetup.tsx",
  "components/account/AccountScreen.tsx", "components/account/AccountSheets.tsx",
  "components/legal/LegalCenterScreen.tsx", "components/legal/LegalDocScreen.tsx", "components/dev/Gallery.tsx",
];
const used = new Map(); // key -> Set(files)  (v 묶음)
const dynamic = [];
const other = []; // 옛 묶음을 쓰는 호출
for (const f of files) {
  const src = fs.readFileSync(path.join(web, f), "utf8");
  // 번역 함수의 이름과 묶음
  const ns = new Map();
  for (const m of src.matchAll(/(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*(?:\{[^}]*namespace:\s*"([^"]+)"[^}]*\}|"([^"]+)")\s*\)/g)) ns.set(m[1], m[2] || m[3]);
  for (const [fn, space] of ns) {
    const re = new RegExp(`(?<![\\w.])${fn}(?:\\.rich|\\.raw)?\\(\\s*([^,)]+)`, "g");
    for (const m of src.matchAll(re)) {
      const arg = m[1].trim();
      const lit = /^"([^"]+)"$/.exec(arg);
      if (lit) {
        if (space === "v") { if (!used.has(lit[1])) used.set(lit[1], new Set()); used.get(lit[1]).add(f); }
        else other.push({ file: f, ns: space, key: lit[1] });
      } else dynamic.push({ file: f, ns: space, expr: arg });
    }
  }
  // 삼항 안의 키("a.b" : "c.d")
  if ([...ns.values()].includes("v")) for (const m of src.matchAll(/"((?:nav|common|home|box|op|reveal|take|inv|ship|charge|login|wallet|withdraw|verify|review|reviews|wins|account|guide|state|footer|hero|balanceSheet|cat)\.[A-Za-z0-9_.]+)"/g)) { if (!used.has(m[1])) used.set(m[1], new Set()); used.get(m[1]).add(f); }
}
const missing = [];
for (const [key, where] of [...used].sort()) for (const l of langs) if (get(V[l], key) === undefined) missing.push({ key, lang: l, files: [...where] });
const otherMissing = other.filter((o) => langs.some((l) => get(L[l], o.ns + "." + o.key) === undefined));
const allV = flat(V.ko);
const unusedV = allV.filter((k) => !used.has(k));
const top = {}; for (const k of allV) { const t = k.split(".")[0]; top[t] = (top[t] || 0) + 1; }
const parity = langs.map((l) => ({ lang: l, keys: flat(V[l]).length, missingVsKo: allV.filter((k) => get(V[l], k) === undefined), extraVsKo: flat(V[l]).filter((k) => get(V.ko, k) === undefined) }));
console.log(JSON.stringify({ vKeysKo: allV.length, vTop: top, usedLiteral: used.size, missing, dynamic, legacyCalls: other, legacyMissing: otherMissing, unusedVCount: unusedV.length, unusedV, parity, legacyTop: Object.keys(L.ko) }, null, 1));
