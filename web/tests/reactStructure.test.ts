// React 구조 결함(migration-audit/MIGRATION_SPEC.md 3절 W3)이 되돌아오지 않는지 소스의 꼴로 본다.
// 이 저장소의 단위 테스트는 화면을 그리지 않으므로(DOM 도구가 없다), 화면에서 드러나지 않는 구조 결함은 소스를 읽어 확인한다.
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path: string) => fs.readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("E-19 HeroBanner: 조건부 return 뒤에 훅을 부르지 않는다", () => {
  const src = read("components/home/HeroBanner.tsx");
  const guard = src.indexOf("if (!box) return null;");
  assert.ok(guard > 0, "조건부 return 을 찾지 못했다");
  const after = src.slice(guard);
  assert.doesNotMatch(after, /\buse[A-Z]\w*\(/, "조건부 return 뒤에 훅 호출이 있다");
  // 옮긴 훅이 조건 앞에 그대로 있다
  assert.match(src.slice(0, guard), /const freeLeft = useWalletStore\(/);
});

test("E-25 AuthHost: 지갑을 기다리는 구독을 effect 의 정리 함수에서 푼다", () => {
  const src = read("components/auth/AuthHost.tsx");
  const subscribe = src.indexOf("unsubscribe = useWalletStore.subscribe(");
  const end = src.indexOf("}, [userId]);");
  assert.ok(subscribe > 0 && end > subscribe, "구독하는 effect 를 찾지 못했다");
  // 구독 뒤, 같은 effect 가 끝나기 전에 정리 함수를 돌려준다
  assert.match(src.slice(subscribe, end), /return \(\) => unsubscribe\(\);/, "effect 가 구독을 푸는 정리 함수를 돌려주지 않는다");
  // 구독을 푸는 함수는 effect 의 바깥 범위에 있어야 정리 함수가 볼 수 있다
  const declared = src.indexOf("let unsubscribe = () => {};");
  assert.ok(declared > 0 && declared < src.indexOf("if (userId) {"), "unsubscribe 가 계정 분기 안에 갇혀 있다");
});

for (const path of ["components/box/Reveal.tsx", "components/inventory/InventoryScreen.tsx"]) {
  test(`E-39 ${path}: 화면이 사라진 뒤에 온 받기 응답으로 상태를 바꾸지 않는다`, () => {
    const src = read(path);
    // 화면이 붙어 있는지를 적어 두는 ref 와, 떼어질 때 그것을 내리는 effect
    assert.match(src, /const alive = useRef\(true\);/, "화면이 붙어 있는지 적어 두는 ref 가 없다");
    assert.match(src, /useEffect\(\(\) => \{ alive\.current = true; return \(\) => \{ alive\.current = false; \}; \}, \[\]\);/, "떼어질 때 ref 를 내리는 effect 가 없다");
    // 받기를 기다린 바로 다음 줄에서 확인하고, 사라졌으면 아무 상태도 바꾸지 않는다
    const awaits = Array.from(src.matchAll(/const out = await settleTake\([^)]*\);\r?\n\s*(.*)/g));
    assert.equal(awaits.length, 1, "받기를 기다리는 곳은 한 곳이어야 한다");
    assert.ok(awaits[0][1].startsWith("if (!alive.current) return;"), "받기 응답 바로 뒤에 화면이 남아 있는지 보지 않는다: " + awaits[0][1]);
  });
}

test("E-08 확인창: 확정 단추는 뜬 직후의 잠금을 거치고, 잠금의 길이는 결과 화면의 잠금과 같다", () => {
  const src = read("components/ui/Sheet.tsx");
  const confirm = src.slice(src.indexOf("export function Confirm("));
  // 확정 단추가 onConfirm 을 곧바로 부르지 않는다(잠금을 거치는 confirm 을 부른다). 단추를 disabled 로 잠그지 않는다(모양이 달라진다)
  assert.doesNotMatch(confirm, /<Button onClick=\{onConfirm\}/, "확정 단추가 잠금 없이 onConfirm 을 부른다");
  assert.match(confirm, /<Button onClick=\{confirm\} busy=\{busy\} busyLabel=\{busyLabel\}>/);
  // 길이는 결과 화면과 같은 상수를 쓴다(lib/openingFlow 의 OPENING_ARM_DELAY_MS)
  // 잠금은 흐른 시간(performance.now)으로 잰다. 기기의 시각(Date.now)으로 재면 시각이 뒤로 갔을 때 잠금이 그만큼 늘어난다(R2-P1-01)
  assert.match(confirm, /performance\.now\(\) - shownAt\.current >= OPENING_ARM_DELAY_MS/);
  assert.doesNotMatch(confirm.replace(/\/\/.*$/gm, ""), /Date\.now/, "확인창이 기기의 시각으로 시간을 잰다");
  assert.match(src, /import \{ OPENING_ARM_DELAY_MS \} from "@\/lib\/openingFlow";/);
  // 취소는 잠그지 않는다
  assert.match(confirm, /<TextLink onClick=\{\(\) => \{ if \(!busy\) onCancel\(\); \}\}>/);
});

test("E-03 계정 화면의 비밀번호 바꾸기: 현재 비밀번호 확인을 먼저 거친 뒤에 바꾸기 요청을 보낸다", () => {
  const src = read("components/account/AccountSheets.tsx");
  const sheet = src.slice(src.indexOf("export function PasswordSheet("), src.indexOf("export function CloseAccountSheet("));
  const verify = sheet.indexOf("await verifyCurrentPassword(current, user?.id)");
  const change = sheet.indexOf("await changeAccountPasswordWithOtp(current, next, code, user?.id)");
  // 계정 서비스(lib/browserAccount 의 /account/password/change)는 확인을 거친 계정만 받는다. 순서가 바뀌거나 확인이 빠지면 언제나 거절된다
  assert.ok(verify > 0, "현재 비밀번호 확인이 없다");
  assert.ok(change > verify, "바꾸기 요청이 확인보다 먼저다");
  // 바꾼 뒤에는 이 탭의 세션도 끝난 것으로 맞춘다(서비스가 모든 세션을 끝낸다)
  assert.ok(sheet.indexOf("markSessionLost();") > change, "바꾼 뒤에 세션을 정리하지 않는다");
  // C1 guard B: 기다리는 사이에 계정이 바뀌었으면 그 계정의 세션은 건드리지 않는다. 요청을 시작한 계정을 기다림 앞에서 적어 두고, 끝난 뒤에 지금 계정과 견준다
  const captured = sheet.indexOf("const accountId = user?.id;");
  assert.ok(captured > 0 && captured < verify, "요청을 시작한 계정을 기다림 앞에서 적어 두지 않는다");
  assert.ok(sheet.indexOf("if (useAuthStore.getState().user?.id === accountId) markSessionLost();") > change, "세션을 정리하기 전에 계정이 그대로인지 보지 않는다");
});
