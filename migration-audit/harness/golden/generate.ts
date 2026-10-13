/**
 * 기준값을 만든다. 앱의 모듈(lib/products.ts 등)을 그대로 불러 계산하고 golden/*.json 으로 적는다.
 *
 * 기준 커밋(63445c7)의 web 폴더에서만 돌린다. 돌리는 자리(cwd)가 곧 읽을 web 폴더다.
 *   cd C:/Users/hyun1/dev/VOILA-audit-before/web
 *   npx tsx C:/Users/hyun1/dev/VOILA-test-aresjoo/migration-audit/harness/golden/generate.ts
 *
 * 지키는 것
 *   1. 그 폴더의 커밋이 63445c7 로 시작하지 않으면 적지 않는다.
 *   2. 그 폴더의 web/lib, web/stores 에 커밋되지 않은 변경이 있으면 적지 않는다.
 *   3. 기준값 파일이 이미 있으면 덮어쓰지 않는다. 같은지 다른지만 알린다.
 *      (기준값은 한 번 만들고 고정한다. 검사가 실패했을 때 다시 만들어 통과시키는 일을 막는다.)
 *
 * 예외 하나, 사진에 달린 값(photos.json): 사진은 일부러 더해지므로 이 값은 움직인다.
 *   npx tsx .../generate.ts --photos
 * 는 photos.json 만 지금 커밋에서 다시 적는다(기준 커밋이 아니어도 되고, 있어도 덮어쓴다). 어느 커밋에서 적었는지 파일에 남긴다.
 * 사진을 더한 커밋에서 같이 돌려 같은 커밋에 넣는다. 다른 세 파일은 이 플래그로도 건드리지 않는다.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { asJson, computeCatalog, computeDraws, computeMoney, computePhotos, type GoldenDeps } from "./compute";

const BASELINE = "63445c7";
const photosOnly = process.argv.includes("--photos");
const here = path.dirname(fileURLToPath(import.meta.url));
const web = process.cwd();
if (!existsSync(path.join(web, "lib/products.ts"))) throw new Error("web 폴더에서 돌려야 한다(lib/products.ts 가 없다): " + web);

const git = (...args: string[]) => execFileSync("git", args, { cwd: web, encoding: "utf8" }).trim();
const commit = git("rev-parse", "HEAD");
if (!photosOnly && !commit.startsWith(BASELINE)) throw new Error(`기준 커밋이 아니다: ${commit.slice(0, 12)} (기대 ${BASELINE}). 기준값은 기준 커밋에서만 만든다.`);
const dirty = git("status", "--porcelain", "--", "lib", "stores");
if (dirty) throw new Error("lib 또는 stores 에 커밋되지 않은 변경이 있다. 기준값을 만들지 않는다.\n" + dirty);

const load = (rel: string) => import(pathToFileURL(path.join(web, rel)).href);
const deps: GoldenDeps = {
  products: await load("lib/products.ts"), fairness: await load("lib/fairness.ts"), takeBatch: await load("lib/takeBatch.ts"),
  withdrawal: await load("lib/withdrawal.ts"), funding: await load("lib/funding.ts"), tiers: await load("lib/tiers.ts"), burst: await load("lib/burst.ts"),
};

if (photosOnly) {
  // 사진에 달린 값만. 어느 커밋의 사진인지 적어 두고, 사진이 더해진 커밋에서 같이 다시 만든다
  const photos = { meta: { photosCommit: commit, baselineCommit: BASELINE, note: "사진이 더해지면 움직이는 값이다. 사진을 더한 커밋에서 generate.ts --photos 로 같이 다시 만든다. 다른 기준값은 다시 만들지 않는다." }, ...asJson(computePhotos(deps)) };
  const target = path.join(here, "photos.json");
  const text = JSON.stringify(photos, null, 1) + "\n";
  const same = existsSync(target) && readFileSync(target, "utf8") === text;
  writeFileSync(target, text);
  console.log(`photos.json: ${same ? "그대로다" : "적었다"} (커밋 ${commit.slice(0, 7)}, 사진 있는 상품 행 ${photos.itemRowsWithPhoto})`);
  process.exit(0);
}

const meta = { baselineCommit: commit, note: "기준 커밋에서 한 번 만든 값이다. 검사가 실패해도 다시 만들어 통과시키지 않는다." };
const files: Record<string, unknown> = {
  "catalog.json": { meta, ...asJson(computeCatalog(deps)) },
  "draws.json": { meta, ...asJson(await computeDraws(deps)) },
  "money.json": { meta, ...asJson(computeMoney(deps)) },
};
mkdirSync(here, { recursive: true });
let wrote = 0, kept = 0, differs = 0;
for (const [name, value] of Object.entries(files)) {
  const target = path.join(here, name);
  const text = JSON.stringify(value, null, 1) + "\n";
  if (existsSync(target)) {
    const same = readFileSync(target, "utf8") === text;
    console.log(`${name}: 이미 있다. ${same ? "지금 계산과 같다" : "지금 계산과 다르다(덮어쓰지 않았다)"}`);
    if (same) kept++; else differs++;
    continue;
  }
  writeFileSync(target, text);
  console.log(`${name}: 적었다 (${text.length} 바이트)`);
  wrote++;
}
console.log(`기준 커밋 ${commit.slice(0, 7)}, 새로 적음 ${wrote}, 그대로 둠 ${kept}, 다름 ${differs}`);
if (differs) process.exitCode = 1;
