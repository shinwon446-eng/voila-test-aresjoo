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
