/**
 * 동등성 기준값 검사(migration-audit). 데이터와 돈 계산이 기준 커밋 63445c7 과 같은지 본다.
 *
 * 기대값은 migration-audit/harness/golden/ 의 catalog.json, draws.json, money.json 이다.
 * 기준 커밋에서 한 번 만든 값이고(migration-audit/harness/golden/generate.ts), 지금 코드로 같은 계산을 다시 해서 견준다.
 *
 * 이 검사가 실패하면 카탈로그(박스, 가격, 상품, 확률, 순서)나 추첨, 돈 계산이 기준과 달라졌다는 뜻이다.
 * 기대값을 다시 만들어 통과시키지 않는다. 바뀐 것이 의도한 변경이면 총괄이 근거를 적고 따로 결정한다.
 *
 * 예외 하나, 사진에 달린 값(photos.json: 사진이 있는 상품 행의 수, 이름과 사진 경로의 해시)은 따로 본다.
 * 사진은 일부러 더해지므로 이 값은 움직이는 것이 맞다. 사진을 더한 커밋에서 `generate.ts --photos` 로 같은 커밋에 다시 만든다.
 * 그 검사가 실패했는데 사진을 더한 적이 없으면 이름이나 사진 경로가 뜻하지 않게 바뀐 것이다.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { asJson, computeCatalog, computeDraws, computeMoney, computePhotos, type GoldenDeps } from "../../migration-audit/harness/golden/compute";
import * as products from "../lib/products";
import * as fairness from "../lib/fairness";
import * as takeBatch from "../lib/takeBatch";
import * as withdrawal from "../lib/withdrawal";
import * as funding from "../lib/funding";
import * as tiers from "../lib/tiers";
import * as burst from "../lib/burst";

// npm test 는 web/ 에서 돈다. 다른 자리에서 돌려도 찾도록 저장소 뿌리를 둘 다 본다.
const goldenDir = [path.resolve(process.cwd(), "../migration-audit/harness/golden"), path.resolve(process.cwd(), "migration-audit/harness/golden")]
  .find((dir) => { try { readFileSync(path.join(dir, "catalog.json")); return true; } catch { return false; } });
const golden = (name: string) => {
  if (!goldenDir) throw new Error("기준값 폴더(migration-audit/harness/golden)를 찾지 못했다");
  const { meta, ...rest } = JSON.parse(readFileSync(path.join(goldenDir, name), "utf8"));
  return { meta: meta as { baselineCommit: string; photosCommit?: string }, value: rest };
};
const deps: GoldenDeps = { products, fairness, takeBatch, withdrawal, funding, tiers, burst };

test("기준값: 기준 커밋 63445c7 에서 만든 파일이다", () => {
  for (const name of ["catalog.json", "draws.json", "money.json"]) assert.match(golden(name).meta.baselineCommit, /^63445c7/, name);
});

test("기준값: 사진에 달린 값(사진 있는 상품 행의 수, 이름과 사진 경로)은 사진을 마지막으로 더한 커밋과 같다", () => {
  // 사진을 더했으면 같은 커밋에서 photos.json 을 다시 만든다(머리 주석). 더한 적이 없는데 실패하면 이름이나 경로가 뜻하지 않게 바뀐 것이다
  const { meta, value } = golden("photos.json");
  assert.match(meta.photosCommit ?? "", /^[0-9a-f]{40}$/, "photos.json 에 적은 커밋");
  assert.deepEqual(asJson(computePhotos(deps)), value);
});

test("기준값: 카탈로그의 개수와 상수가 기준과 같다", () => {
  const now = asJson(computeCatalog(deps));
  const { value } = golden("catalog.json");
  assert.deepEqual(now.counts, value.counts);
  assert.deepEqual(now.constants, value.constants);
});

test("기준값: 박스마다 (슬러그, 가격, 상품 id, 확률)의 순서와 값이 기준과 같다", () => {
  const now = asJson(computeCatalog(deps));
  const { value } = golden("catalog.json");
  // 어느 박스가 달라졌는지 먼저 말한다(전체 해시만 견주면 어디가 바뀌었는지 알 수 없다)
  const slugs = Array.from(new Set(Object.keys(now.perBox).concat(Object.keys(value.perBox))));
  const changed = slugs.filter((slug) => JSON.stringify(now.perBox[slug]) !== JSON.stringify(value.perBox[slug]));
  assert.deepEqual(changed, [], "기준과 다른 박스: " + changed.slice(0, 20).join(", "));
  assert.deepEqual(now.sha256, value.sha256);
});

test("기준값: 박스마다 확률의 합이 정확히 100% 다", () => {
  const now = computeCatalog(deps);
  const off = Object.entries(now.perBox).filter(([, box]) => box.rateSum !== 1_000_000).map(([slug]) => slug);
  assert.deepEqual(off, []);
});

test("기준값: 고정 시드의 추첨 결과(박스 셋, nonce 0 부터 49)가 기준과 같다", async () => {
  const now = asJson(await computeDraws(deps));
  const { value } = golden("draws.json");
  assert.deepEqual(now, value);
});

test("기준값: 돈 계산(받는 금액, 출금 수수료와 최소 금액, 차감의 원천 나눔, 환급 귀속, 구간, 터짐)이 기준과 같다", () => {
  const now = asJson(computeMoney(deps));
  const { value } = golden("money.json");
  for (const key of Object.keys(value)) assert.deepEqual((now as Record<string, unknown>)[key], value[key], key);
  assert.deepEqual(Object.keys(now).sort(), Object.keys(value).sort());
});
