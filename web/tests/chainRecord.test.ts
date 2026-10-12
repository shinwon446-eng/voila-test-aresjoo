// 개봉 결과 검증의 세 단계(flow/MELT_SPEC.md S9): 저장된 기록은 저장된 확률표로, 블록체인 기록은 실제 기록에서 언제나 "없음".
import test from "node:test";
import assert from "node:assert/strict";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { calculateRollResult, hashServerSeed } from "../lib/fairness";
import { chainRecordOf, chainView, NO_CHAIN_RECORD, type ChainRecord, type ChainState } from "../lib/chainRecord";
import { recordToVerify, storedRecordFor, verifyOpeningRecord } from "../components/fairness/verifyRecord";
import { ChainRecordView } from "../components/verify/ChainRecord";
import type { OwnedItem } from "../stores/inventoryStore";
import ko from "../messages/v.ko.json";
import en from "../messages/v.en.json";
import zh from "../messages/v.zh.json";

// 시험 실행기(tsx)는 화면 파일의 JSX 를 React.createElement 로 바꾼다. 그 이름을 여기서 준다
(globalThis as { React?: typeof React }).React = React;

const STATES: ChainState[] = ["none", "pending", "confirmed", "mismatch", "error"];
/** 시험 안에서만 쓰는 고정 자료. 실제 체인 기록이 아니다 */
const EVIDENCE = { chain: "Fixture chain", address: "fixture-record-0000", url: "https://example.com/" };
const fixture = (state: ChainState): ChainRecord => (state === "none" || state === "error" ? { state } : { state, ...EVIDENCE });
const render = (record: ChainRecord, messages: typeof ko = ko, locale = "ko") =>
  renderToStaticMarkup(React.createElement(NextIntlClientProvider, { locale, messages: { v: messages }, timeZone: "UTC", children: React.createElement(ChainRecordView, { record }) }));

async function owned(over: Partial<OwnedItem["fair"]> = {}): Promise<OwnedItem> {
  const serverSeed = "saved-source"; const clientSeed = "saved-client"; const nonce = 7;
  return {
    id: "own_saved", itemId: "historical-item", boxSlug: "some-box", valueUsdt: 100, tier: "curated", status: "SOLD", acquiredAt: "2026-10-01T00:00:00.000Z",
    fair: { serverSeed, clientSeed, nonce, serverSeedHash: await hashServerSeed(serverSeed), roll: (await calculateRollResult(serverSeed, clientSeed, nonce)).roll, oddsVersion: "historical-v1", dropTable: [{ id: "historical-item", dropRate: 100 }], ...over },
  };
}

test("저장된 기록은 그 기록에 저장된 확률표로 검증한다(부르는 쪽이 지금 표를 실어 보내도)", async () => {
  const saved = await owned();
  // 복구한 결과 화면처럼: 값은 같고 확률표만 지금 것(그때와 다른 표)을 실어 보낸다
  const passed = { itemId: saved.itemId, fair: { ...saved.fair, dropTable: [{ id: "todays-other-item", dropRate: 100 }] } };
  assert.equal((await verifyOpeningRecord(passed)).itemMatch, false, "지금 표로 계산하면 다른 상품이 나온다");
  const target = recordToVerify(passed, [saved]);
  assert.equal(target.stored, true);
  assert.equal(target.boxSlug, "some-box");
  assert.deepEqual(target.fair.dropTable, [{ id: "historical-item", dropRate: 100 }]);
  const result = await verifyOpeningRecord(target);
  assert.deepEqual([result.hashMatch, result.rollMatch, result.itemMatch, result.expectedItemId], [true, true, true, "historical-item"]);
});

test("저장된 기록에 당시 확률표가 없으면 지금 표로 메우지 않는다(번호까지만 확인)", async () => {
  const saved = await owned();
  const { dropTable: _removed, ...fair } = saved.fair;
  const legacy: OwnedItem = { ...saved, fair };
  const passed = { itemId: saved.itemId, fair: { ...saved.fair, dropTable: [{ id: "historical-item", dropRate: 100 }] } };
  const target = recordToVerify(passed, [legacy]);
  assert.equal(target.fair.dropTable, undefined);
  const result = await verifyOpeningRecord(target);
  assert.deepEqual([result.hashMatch, result.rollMatch, result.itemMatch], [true, true, null]);
});

test("같은 개봉의 기록만 찾는다: 회차나 값이 다르면 넘겨받은 대로 쓴다", async () => {
  const saved = await owned();
  const other = { itemId: "x", fair: { ...saved.fair, nonce: saved.fair.nonce + 1 } };
  assert.equal(storedRecordFor(other, [saved]), null);
  assert.equal(storedRecordFor({ itemId: "x", fair: { ...saved.fair, clientSeed: "different" } }, [saved]), null);
  const target = recordToVerify(other, [saved]);
  assert.deepEqual([target.stored, target.boxSlug, target.itemId], [false, null, "x"]);
  assert.equal(storedRecordFor({ itemId: saved.itemId, fair: saved.fair }, [saved]), saved);
});

test("검증할 기록은 보관 상품의 ID 로 고른다: 시드와 회차가 같은 다른 상품의 기록을 집지 않는다", async () => {
  // 촬영용 자료처럼 두 상품이 같은 시드와 회차를 가진 경우. 확률표는 서로 다르다
  const first = await owned();
  const second: OwnedItem = { ...first, id: "own_second", itemId: "second-item", boxSlug: "other-box", fair: { ...first.fair, dropTable: [{ id: "second-item", dropRate: 100 }] } };
  const both = [first, second];
  // ID 를 넘기면 그 기록이다. 보관함에서의 순서와 무관하다
  for (const list of [both, [...both].reverse()]) {
    const target = recordToVerify({ ownedId: second.id, itemId: second.itemId, fair: first.fair }, list);
    assert.deepEqual([target.stored, target.itemId, target.boxSlug], [true, "second-item", "other-box"]);
    assert.deepEqual(target.fair.dropTable, [{ id: "second-item", dropRate: 100 }], "넘겨받은 표가 아니라 그 기록의 표");
    assert.equal((await verifyOpeningRecord(target)).itemMatch, true);
    assert.equal(storedRecordFor({ ownedId: first.id, itemId: first.itemId, fair: first.fair }, list), first);
  }
  // ID 가 보관함에 없으면 시드로 다른 기록을 찾아 대신 쓰지 않는다
  assert.equal(storedRecordFor({ ownedId: "own_missing", itemId: first.itemId, fair: first.fair }, both), null);
  assert.equal(recordToVerify({ ownedId: "own_missing", itemId: first.itemId, fair: first.fair }, both).stored, false);
  // ID 없이 부른 경우: 같은 값의 기록이 둘이면 받은 상품으로 가린다. 첫 번째 것을 그냥 집지 않는다
  for (const list of [both, [...both].reverse()]) {
    assert.equal(storedRecordFor({ itemId: "second-item", fair: first.fair }, list), second);
    assert.equal(storedRecordFor({ itemId: "historical-item", fair: first.fair }, list), first);
    assert.equal(storedRecordFor({ itemId: "neither-item", fair: first.fair }, list), null, "가릴 수 없으면 고르지 않는다");
  }
  // 상품까지 같은 기록이 둘이면 가릴 수 없다
  const twin: OwnedItem = { ...first, id: "own_twin" };
  assert.equal(storedRecordFor({ itemId: first.itemId, fair: first.fair }, [first, twin]), null);
  assert.equal(storedRecordFor({ ownedId: twin.id, itemId: first.itemId, fair: first.fair }, [first, twin]), twin);
});

test("실제 개봉 기록의 블록체인 상태는 언제나 기록 없음이다", async () => {
  const saved = await owned();
  assert.deepEqual(chainRecordOf(saved), { state: "none" });
  assert.deepEqual(chainRecordOf(null), { state: "none" });
  assert.equal(chainRecordOf(saved), NO_CHAIN_RECORD);
  const view = chainView(chainRecordOf(saved));
  assert.deepEqual([view.state, view.status, view.body, view.success, view.fail, view.chain, view.address, view.url, view.retry], ["none", "verify.chain.none", "verify.chain.noneBody", false, false, null, null, null, false]);
});

test("성공 문장은 confirmed 에서만 나온다", () => {
  for (const state of STATES) {
    const view = chainView(fixture(state));
    assert.equal(view.success, state === "confirmed", state);
    assert.equal(view.body === "verify.chain.ok", state === "confirmed", state);
    assert.equal(view.fail, state === "mismatch" || state === "error", state);
  }
  // 근거(체인 이름, 기록 주소, 바깥 주소)가 하나라도 빠진 confirmed 는 성공이 아니다
  for (const missing of ["chain", "address", "url"] as const) {
    const view = chainView({ state: "confirmed", ...EVIDENCE, [missing]: "" });
    assert.deepEqual([view.state, view.success, view.body], ["error", false, "verify.chain.errorBody"], missing);
  }
  assert.equal(chainView({ state: "confirmed" }).success, false);
  assert.equal(chainView({ state: "unknown" as ChainState }).state, "error");
  // 기록 없음과 불러오기 실패는 주소를 받았더라도 그리지 않는다
  assert.deepEqual([chainView({ state: "none", ...EVIDENCE }).address, chainView({ state: "error", ...EVIDENCE }).url], [null, null]);
});

test("화면: 실제 기록은 '블록체인 기록 없음'을 그리고, 일치 문장과 기록 주소는 confirmed 고정 자료에서만 보인다", async () => {
  const saved = await owned();
  const real = render(chainRecordOf(saved));
  assert.match(real, /data-chain-state="none"/);
  assert.ok(real.includes("블록체인 기록 없음"));
  assert.ok(real.includes("이 테스트 사이트는 잠근 값을 블록체인에 올리지 않습니다. 블록체인 기록을 붙이면 열기 전에 잠근 값을 기록하고, 이 자리에서 그 기록을 열어 대조합니다."));
  assert.ok(!real.includes(ko.verify.chain.ok));
  assert.ok(!real.includes("href="), "실제 기록에는 바깥 링크가 없다");
  assert.ok(!real.includes(ko.verify.chain.address), "실제 기록에는 기록 주소 행이 없다");
  for (const [messages, locale] of [[ko, "ko"], [en, "en"], [zh, "zh"]] as const) {
    for (const state of STATES) {
      const html = render(fixture(state), messages, locale);
      assert.equal(html.includes(messages.verify.chain.ok), state === "confirmed", locale + " " + state);
      assert.ok(html.includes(messages.verify.chain[state]), locale + " " + state);
    }
  }
  const confirmed = render(fixture("confirmed"));
  assert.ok(confirmed.includes("블록체인에서 기록 보기 ↗") && confirmed.includes("열기 전 기록과 공개된 값, 받은 상품이 일치합니다."));
});

test("문구: 검증의 세 언어 키가 같고, 한국어는 명세의 문장 그대로다", () => {
  const keys = (o: object): string[] => Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? keys(v).map((s) => k + "." + s) : [k])).sort();
  const flat = (o: object): string[] => Object.values(o).flatMap((v) => (v && typeof v === "object" ? flat(v) : [String(v)]));
  assert.deepEqual(keys(en.verify), keys(ko.verify));
  assert.deepEqual(keys(zh.verify), keys(ko.verify));
  assert.deepEqual([ko.verify.step1, ko.verify.step2, ko.verify.step3], ["열기 전에 잠근 값", "블록체인 기록", "다시 계산한 결과"]);
  assert.equal(ko.verify.localNote, "이 테스트 사이트는 값을 이 브라우저에서 만들고 저장합니다.");
  assert.equal(ko.verify.methodLink, "블록체인 검증 방식");
  assert.equal(ko.verify.chain.none, "블록체인 기록 없음");
  for (const word of ["배송", "정품", "상품가"]) assert.ok(ko.verify.method.notCovered.includes(word), word);
  // 서버가 값을 정한다는 말은 지금 동작과 맞지 않는다. 세 언어 어디에도 남기지 않는다
  for (const text of flat(ko.verify)) { assert.ok(!text.includes("서버"), text); assert.doesNotMatch(text, /[!?—–·・]/); }
  for (const text of flat(en.verify)) assert.doesNotMatch(text, /server/i);
  for (const text of flat(zh.verify)) assert.ok(!text.includes("服务器"), text);
});

test("문구: 블록체인 기록을 이미 운영하는 것처럼 단정하지 않는다(R13). 세 언어 모두 조건을 밝힌다", () => {
  const flat = (o: object): string[] => Object.values(o).flatMap((v) => (v && typeof v === "object" ? flat(v) : [String(v)]));
  assert.equal(ko.verify.chain.noneBody, "이 테스트 사이트는 잠근 값을 블록체인에 올리지 않습니다. 블록체인 기록을 붙이면 열기 전에 잠근 값을 기록하고, 이 자리에서 그 기록을 열어 대조합니다.");
  // 운영에서 이미 한다는 말은 어디에도 없다
  for (const text of flat(ko.verify)) assert.ok(!text.includes("운영"), text);
  for (const text of flat(en.verify)) assert.doesNotMatch(text, /in production|is written to a blockchain/i);
  for (const text of flat(zh.verify)) assert.doesNotMatch(text, /正式运营|运营时/);
  // 기록 없음의 설명과 방식의 둘째 단계는 "붙이면"의 조건문이다
  for (const text of [ko.verify.chain.noneBody, ko.verify.method.step2]) assert.ok(text.includes("블록체인 기록을 붙이면"), text);
  for (const text of [en.verify.chain.noneBody, en.verify.method.step2]) assert.match(text, /If a blockchain record is added, .*would be/);
  for (const text of [zh.verify.chain.noneBody, zh.verify.method.step2]) assert.ok(text.includes("如果接入区块链记录"), text);
  // 지금 이 사이트가 하지 않는다는 사실은 세 언어 모두 그대로 말한다
  assert.ok(en.verify.chain.noneBody.startsWith("This test site does not write the locked value to a blockchain."));
  assert.ok(zh.verify.chain.noneBody.startsWith("本测试站不会把锁定的值写入区块链。"));
});
