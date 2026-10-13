// 회차의 계약(flow/REVIEW_codex-4.md 2.4): 서버 시드 하나 안에서 회차는 줄어들지 않는다.
//   내 기기 값을 바꿔도, 같은 값을 다시 넣어도, 예전 값으로 돌아가도 같은 (서버 시드, 내 기기 값, 회차)가 두 번 나오지 않는다.
//   같은 셋이 두 번 나오면 번호도 같다. 박스 개봉에서 본 번호를 업그레이드에 다시 쓸 수 있게 된다.
//   저장소가 붙었을 때의 예약 확인(저장되지 않은 회차로는 추첨하지 않는다)은 tests/upgradeSettle.test.ts 가 본다.
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import { calculateRollResult } from "../lib/fairness";
import { reserveNonces, useFairStore } from "../stores/fairStore";

const SERVER = "fair-store-test-server-seed";
const start = (clientSeed: string, nonce = 0) => useFairStore.setState({ serverSeed: SERVER, serverSeedHash: "hash", clientSeed, nonce });
/** 지금 값으로 회차 하나를 받아 (서버 시드, 내 기기 값, 회차)를 한 줄로 적는다 */
const draw = (): string => { const s = useFairStore.getState(); return [s.serverSeed, s.clientSeed, s.takeNonce()].join("|"); };

test("같은 내 기기 값을 다시 넣어도 회차가 0 으로 돌아가지 않는다(검수가 재현한 경우)", async () => {
  start("seed-a");
  const first = draw();
  assert.equal(first, `${SERVER}|seed-a|0`);
  useFairStore.getState().setClientSeed("seed-a");
  const second = draw();
  assert.equal(second, `${SERVER}|seed-a|1`);
  assert.notEqual(first, second);
  // 셋이 다르므로 번호도 따로 계산된다(같은 셋이면 언제나 같은 번호다)
  const rolls = await Promise.all([0, 1].map((nonce) => calculateRollResult(SERVER, "seed-a", nonce)));
  assert.notEqual(rolls[0].hmac, rolls[1].hmac);
  assert.equal((await calculateRollResult(SERVER, "seed-a", 0)).roll, rolls[0].roll);
});

test("A 에서 B 로 바꿨다가 A 로 돌아와도 같은 (시드 쌍, 회차)가 다시 나오지 않는다", () => {
  start("seed-a");
  const seen: string[] = [];
  const nonces: number[] = [];
  const step = (clientSeed?: string) => {
    if (clientSeed !== undefined) useFairStore.getState().setClientSeed(clientSeed);
    nonces.push(useFairStore.getState().nonce);
    seen.push(draw());
  };
  step(); step();
  step("seed-b"); step();
  step("seed-a"); step();
  step("seed-b");
  step("seed-a"); step("seed-a");
  // 빈 값을 넣으면 새 값이 만들어진다. 그때도 이어서 센다
  step("  ");
  assert.equal(new Set(seen).size, seen.length);
  assert.deepEqual(nonces, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(useFairStore.getState().nonce, 10);
  assert.ok(useFairStore.getState().clientSeed.length > 0);
});

test("서버 시드를 바꿀 때만 회차를 새로 센다. 그때는 서버 시드가 달라 셋이 겹치지 않는다", async () => {
  start("seed-a", 7);
  const before = draw();
  await useFairStore.getState().rotateServerSeed();
  const state = useFairStore.getState();
  assert.notEqual(state.serverSeed, SERVER);
  assert.equal(state.nonce, 0);
  assert.equal(state.clientSeed, "seed-a");
  const after = draw();
  assert.notEqual(before, after);
  assert.ok(after.endsWith("|seed-a|0"));
});

test("예약: 이어진 회차를 받고, 그 회차를 받을 때의 값들을 함께 돌려준다. 잘못된 개수는 받지 않는다", async () => {
  start("seed-a", 3);
  const reserved = await reserveNonces(3);
  assert.deepEqual(reserved, { serverSeed: SERVER, serverSeedHash: "hash", clientSeed: "seed-a", nonces: [3, 4, 5] });
  assert.equal(useFairStore.getState().nonce, 6);
  assert.deepEqual((await reserveNonces(1))?.nonces, [6]);
  for (const count of [0, -1, 1.5, Number.NaN]) assert.equal(await reserveNonces(count), null);
  assert.equal(useFairStore.getState().nonce, 7);
  // 두 예약이 겹쳐도 회차는 겹치지 않는다
  const [a, b] = await Promise.all([reserveNonces(2), reserveNonces(2)]);
  assert.equal(new Set([...(a?.nonces ?? []), ...(b?.nonces ?? [])]).size, 4);
});
