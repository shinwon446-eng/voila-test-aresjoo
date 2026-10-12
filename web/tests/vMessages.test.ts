// 새 화면 문구(messages/v.*.json): 세 언어의 키가 같고, USDT로 받기 흐름의 문구가 명세(flow/MELT_SPEC.md)와 같다
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

type Tree = { [key: string]: string | Tree };
const load = (locale: string): Tree => JSON.parse(fs.readFileSync(new URL(`../messages/v.${locale}.json`, import.meta.url), "utf8"));
const ko = load("ko"), en = load("en"), zh = load("zh");

const flatten = (tree: Tree, prefix = ""): Record<string, string> =>
  Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => (typeof value === "string" ? { ...acc, [prefix + key]: value } : { ...acc, ...flatten(value, prefix + key + ".") }), {});
const K = flatten(ko), E = flatten(en), Z = flatten(zh);
/** 문구가 받는 값의 이름들({amount}, {n, plural, ...} 의 n) */
const args = (text: string) => Array.from(new Set(Array.from(text.matchAll(/\{(\w+)/g), (m) => m[1]))).sort();
/** USDT로 받기 흐름(S1~S7)이 쓰는 묶음: 선택 시트, 잔액 시트, 개봉 결과(한 개와 여러 개), 보관함, 출금 */
const MINE = ["take.", "balanceSheet.", "op.", "reveal.", "inv.", "withdraw."];
const mine = (key: string) => MINE.some((prefix) => key.startsWith(prefix));

test("v 문구: 세 언어의 키가 서로 같다", () => {
  assert.deepEqual(Object.keys(E).sort(), Object.keys(K).sort());
  assert.deepEqual(Object.keys(Z).sort(), Object.keys(K).sort());
});

test("USDT로 받기 문구: 세 언어가 같은 값을 받는다", () => {
  const keys = Object.keys(K).filter(mine);
  assert.ok(keys.length >= 150, `키 ${keys.length}개`);
  for (const key of keys) {
    assert.deepEqual(args(E[key]), args(K[key]), key);
    assert.deepEqual(args(Z[key]), args(K[key]), key);
  }
});

test("USDT로 받기 문구: 느낌표, 물음표, 긴 줄표, 가운뎃점이 없다", () => {
  for (const table of [K, E, Z]) for (const [key, text] of Object.entries(table)) {
    if (mine(key)) assert.doesNotMatch(text, /[!?！？—–·・‧•]/, key);
  }
});

test("USDT로 받기 문구: 한국어는 명세에 적힌 글 그대로다", () => {
  const fill = (key: string, values: Record<string, string | number>) => Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), K[key]);
  // S1 선택 시트
  assert.equal(K["take.title"], "USDT로 받기");
  assert.equal(K["take.selectAll"], "전체 선택");
  assert.equal(K["take.pick"], "상품을 선택합니다");
  assert.equal(fill("take.submit", { n: 3, amount: "$285" }), "USDT로 받기 (3개, $285)");
  assert.equal(fill("take.confirmDesc", { amount: "$285" }), "상품 대신 잔액으로 받습니다. 받을 금액 $285. 받은 뒤에는 배송으로 바꿀 수 없습니다.");
  assert.equal(fill("reveal.take", { amount: "$285" }), "USDT로 받기 ($285)");
  assert.equal(fill("take.done", { amount: "$285" }), "잔액에 $285 넣었습니다.");
  assert.equal(K["take.empty"], "USDT로 받을 상품이 없습니다.");
  assert.equal(K["take.failed"], "USDT로 받지 못했습니다. 상품은 보관함에 있습니다.");
  assert.equal(K["common.checking"], "확인 중");
  assert.equal(fill("take.cardNote", { amount: "$47.5" }), "카드로 충전한 몫 $47.5. 이 금액은 출금할 수 없는 잔액으로 들어갑니다.");
  // 저장이 중간에 실패했을 때(R8): 받았다고도, 보관함에 있다고도 말하지 않는 한 줄
  assert.equal(K["take.unknown"], "처리 상태를 확인하지 못했습니다. 보관함과 지갑 내역에서 확인할 수 있습니다.");
  assert.equal(fill("take.ref", { amount: "$100" }), "상품가 $100");
  // S2 한 개 결과
  assert.equal(fill("take.rateLine", { ref: "$100", pct: 95 }), "상품가 $100의 95%");
  assert.equal(K["take.keep"], "보관함에 두기");
  assert.equal(fill("take.doneTitle", { amount: "$95" }), "잔액에 $95 넣었습니다");
  // 상태 줄은 보관했다는 말만 한다(R2)
  assert.equal(K["op.keptStatus"], "보관함에 넣었습니다.");
  assert.equal(fill("reveal.again", { amount: "$20" }), "한 번 더 언박싱 $20");
  assert.equal(K["nav.verify"], "개봉 결과 검증");
  assert.equal(K["op.backToBox"], "박스로 돌아가기");
  // S3 여러 개 결과(R4): 주 단추는 미리 고른 것의 개수와 금액을 적는다. 선택 시트의 주 단추와 같은 글이다
  assert.equal(fill("take.submit", { n: 4, amount: "$38" }), "USDT로 받기 (4개, $38)");
  // S4 잔액이 모자랄 때
  assert.equal(fill("box.short", { balance: "$12", missing: "$8" }), "잔액 $12. $8 더 필요합니다.");
  assert.equal(fill("take.heldHint", { n: 2, amount: "$7.91" }), "보관함의 상품 2개를 USDT로 받으면 최대 $7.91까지 들어옵니다.");
  assert.equal(K["box.charge"], "USDT 충전하기");
  // S5 보관함
  assert.equal(K["reveal.ship"], "배송 받기");
  // S6 잔액 시트
  assert.equal(K["balanceSheet.title"], "잔액");
  assert.equal(K["balanceSheet.spendable"], "개봉에 쓸 잔액");
  assert.equal(K["balanceSheet.withdrawable"], "출금할 수 있는 잔액");
  assert.equal(fill("balanceSheet.held", { n: 3 }) + " (" + fill("balanceSheet.heldWorth", { amount: "$285" }) + ")", "보관 중인 상품 3개 (USDT로 받으면 $285)");
  assert.equal(K["wallet.withdraw"], "출금");
  assert.equal(K["balanceSheet.history"], "지갑 내역");
  assert.equal(K["balanceSheet.login"], "로그인하면 잔액과 보관 상품이 표시됩니다.");
  assert.equal(K["nav.login"], "로그인");
  // S7 출금 화면
  assert.equal(K["take.withdrawLink"], "보관함의 상품을 USDT로 받아 출금하기");
  assert.equal(fill("take.prefilled", { amount: "$95" }), "방금 받은 금액 가운데 출금할 수 있는 몫을 금액 칸에 넣었습니다. 넣은 금액 $95.");
});

test("USDT로 받기 문구: 한국어는 금액 뒤에 조사를 붙이지 않는다(원화 표시에서 틀린다, R1)", () => {
  // 금액이 들어가는 자리 바로 뒤에 통화에 따라 꼴이 바뀌는 조사(를/을, 는/은, 가/이, 로/으로, 와/과)가 오면 안 된다.
  // 꼴이 바뀌지 않는 말(의, 부터, 까지, 보다)은 괜찮다
  const money = /\{(amount|balance|missing|min|diff|price|ref|top|seed)\}\s?(를|을|는|은|가|이|로|으로|와|과)(?=[\s.,)]|$)/;
  for (const [key, text] of Object.entries(K)) if (mine(key)) assert.doesNotMatch(text, money, key);
});

test("USDT로 받기 문구: 금지 표현이 없고 언어가 섞이지 않는다", () => {
  // 도박장 용어는 tests/i18n.test.ts 의 목록 그대로, 그리고 사과
  const banned: [Record<string, string>, string[]][] = [
    [K, ["환전", "회수", "정산", "롤오버", "긁어", "돌려보기", "손맛", "잭팟", "볼트", "연타", "올인", "본전", "환수율", "오토플레이", "죄송", "미안"]],
    [E, ["cash out", "cashed out", "cash-out", "rollover", "jackpot", "all-in", "sorry", "apolog"]],
    [Z, ["折现", "头奖", "金库", "自动旋转", "流水", "抱歉", "对不起"]],
  ];
  for (const [table, words] of banned) for (const [key, text] of Object.entries(table)) {
    if (!mine(key)) continue;
    for (const word of words) assert.ok(!text.toLowerCase().includes(word.toLowerCase()), `${key} 에 금지 표현 "${word}": ${text}`);
  }
  const hangul = /[가-힣]/, han = /[一-鿿]/;
  for (const key of Object.keys(K).filter(mine)) {
    assert.ok(!han.test(K[key]), `ko ${key}: ${K[key]}`);
    assert.ok(!hangul.test(E[key]) && !han.test(E[key]), `en ${key}: ${E[key]}`);
    assert.ok(!hangul.test(Z[key]), `zh ${key}: ${Z[key]}`);
  }
});

test("받는 방법을 고르는 단계의 문구는 남아 있지 않다", () => {
  for (const table of [K, E, Z]) for (const key of ["op.choose", "op.chooseTitle", "op.choosePrompt", "op.shipNote", "op.takeChoice", "op.takeNote", "op.takeNoteDigital", "op.takeConfirm", "op.shipConfirm", "op.receiveNext", "op.takeWorth", "take.clearAll", "take.multiCta"]) {
    assert.equal(table[key], undefined, key);
  }
  assert.ok(!Object.values(K).some((text) => text.includes("받는 방법 선택")));
});

// ── 나온 상품과 개봉 결과 검증(flow/MELT_SPEC.md R16): 같은 검사를 wins, verify, 메뉴 이름(nav.wins)까지 넓힌다
const winsVerify = (key: string) => key.startsWith("wins.") || key.startsWith("verify.") || key === "nav.wins";
/** 문구 안의 꾸밈 표시(<num>) 이름들 */
const tags = (text: string) => Array.from(new Set(Array.from(text.matchAll(/<(\w+)>/g), (m) => m[1]))).sort();

test("나온 상품과 검증 문구: 세 언어가 같은 값과 같은 표시를 받는다", () => {
  const keys = Object.keys(K).filter(winsVerify);
  assert.ok(keys.length >= 60, `키 ${keys.length}개`);
  for (const key of keys) {
    assert.deepEqual(args(E[key]), args(K[key]), key);
    assert.deepEqual(args(Z[key]), args(K[key]), key);
    assert.deepEqual(tags(E[key]), tags(K[key]), key);
    assert.deepEqual(tags(Z[key]), tags(K[key]), key);
  }
});

test("나온 상품과 검증 문구: 느낌표, 물음표, 긴 줄표, 가운뎃점이 없다", () => {
  for (const table of [K, E, Z]) for (const [key, text] of Object.entries(table)) {
    if (winsVerify(key)) assert.doesNotMatch(text, /[!?！？—–·・‧•]/, key);
  }
});

test("나온 상품과 검증 문구: 금지 표현이 없다", () => {
  // 도박장 용어는 tests/i18n.test.ts 의 목록 그대로. 그 뒤는 사과, 그리고 지금 동작과 맞지 않는 두 단정(서버가 값을 정한다, 운영에서 이미 블록체인에 기록한다)
  const banned: [Record<string, string>, string[]][] = [
    [K, ["환전", "회수", "정산", "롤오버", "긁어", "돌려보기", "손맛", "잭팟", "볼트", "연타", "올인", "본전", "환수율", "오토플레이", "죄송", "미안", "서버", "운영에서"]],
    [E, ["cash out", "cashed out", "cash-out", "rollover", "jackpot", "all-in", "sorry", "apolog", "server", "in production"]],
    [Z, ["折现", "头奖", "金库", "自动旋转", "流水", "抱歉", "对不起", "服务器", "正式运营"]],
  ];
  for (const [table, words] of banned) for (const [key, text] of Object.entries(table)) {
    if (!winsVerify(key)) continue;
    for (const word of words) assert.ok(!text.toLowerCase().includes(word.toLowerCase()), `${key} 에 금지 표현 "${word}": ${text}`);
  }
});

test("나온 상품과 검증 문구: 언어가 섞이지 않는다", () => {
  const hangul = /[가-힣]/, han = /[一-鿿]/;
  for (const key of Object.keys(K).filter(winsVerify)) {
    assert.ok(!han.test(K[key]), `ko ${key}: ${K[key]}`);
    assert.ok(!hangul.test(E[key]) && !han.test(E[key]), `en ${key}: ${E[key]}`);
    assert.ok(!hangul.test(Z[key]), `zh ${key}: ${Z[key]}`);
  }
});
