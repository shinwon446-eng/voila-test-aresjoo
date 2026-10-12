// 홈 배너의 공을 그리는 장치(components/home/heroBall.ts): 준비가 실패하면 만든 GL 자원을 놓는다(E-20).
// 성공하는 길의 GL 호출 순서는 고치기 전과 같아야 한다(그림이 달라지지 않는다).
//   npm test
import test from "node:test";
import assert from "node:assert/strict";
import { createBallPainter } from "../components/home/heroBall";

type Fail = "none" | "extension" | "vertex" | "fragment" | "program" | "link";

/** 호출을 적어 두는 가짜 WebGL. fail 로 어느 단계가 실패할지 고른다 */
function fakeGl(fail: Fail) {
  const calls: string[] = [];
  const live = { shaders: new Set<object>(), programs: new Set<object>(), lost: 0 };
  const types = new Map<object, number>();
  const gl = {
    VERTEX_SHADER: 1, FRAGMENT_SHADER: 2, COMPILE_STATUS: 3, LINK_STATUS: 4, ARRAY_BUFFER: 5, STATIC_DRAW: 6, FLOAT: 7, COLOR_BUFFER_BIT: 8, TRIANGLE_STRIP: 9,
    getExtension(name: string) {
      calls.push("getExtension:" + name);
      if (name === "OES_standard_derivatives") return fail === "extension" ? null : {};
      if (name === "WEBGL_lose_context") return { loseContext() { calls.push("loseContext"); live.lost += 1; } };
      return null;
    },
    createShader(type: number) { calls.push("createShader"); const s = {}; live.shaders.add(s); types.set(s, type); return s; },
    shaderSource() { calls.push("shaderSource"); },
    compileShader() { calls.push("compileShader"); },
    getShaderParameter(s: object) { calls.push("getShaderParameter"); return !((fail === "vertex" && types.get(s) === 1) || (fail === "fragment" && types.get(s) === 2)); },
    deleteShader(s: object) { calls.push("deleteShader"); live.shaders.delete(s); },
    createProgram() { calls.push("createProgram"); if (fail === "program") return null; const p = {}; live.programs.add(p); return p; },
    attachShader() { calls.push("attachShader"); },
    linkProgram() { calls.push("linkProgram"); },
    getProgramParameter() { calls.push("getProgramParameter"); return fail !== "link"; },
    deleteProgram(p: object) { calls.push("deleteProgram"); live.programs.delete(p); },
    useProgram() { calls.push("useProgram"); },
    createBuffer() { calls.push("createBuffer"); return {}; },
    bindBuffer() { calls.push("bindBuffer"); },
    bufferData() { calls.push("bufferData"); },
    getAttribLocation() { calls.push("getAttribLocation"); return 0; },
    enableVertexAttribArray() { calls.push("enableVertexAttribArray"); },
    vertexAttribPointer() { calls.push("vertexAttribPointer"); },
    getUniformLocation() { calls.push("getUniformLocation"); return {}; },
    clearColor() { calls.push("clearColor"); },
  };
  return { gl, calls, live };
}

function withDocument<T>(gl: unknown, run: () => T): T {
  const saved = Object.getOwnPropertyDescriptor(globalThis, "document");
  const canvas = { width: 300, height: 150, getContext: () => gl, addEventListener() {}, removeEventListener() {} };
  Object.defineProperty(globalThis, "document", { configurable: true, value: { createElement: () => canvas } });
  try { return run(); }
  finally { if (saved) Object.defineProperty(globalThis, "document", saved); else Reflect.deleteProperty(globalThis, "document"); }
}

for (const fail of ["extension", "vertex", "fragment", "program", "link"] as const) {
  test(`E-20 공 그리기 준비가 실패하면(${fail}) 만든 셰이더와 프로그램을 지우고 컨텍스트를 놓는다`, () => {
    const { gl, live } = fakeGl(fail);
    const painter = withDocument(gl, () => createBallPainter());
    assert.equal(painter, null);
    assert.equal(live.shaders.size, 0, "지우지 않은 셰이더가 남았다");
    assert.equal(live.programs.size, 0, "지우지 않은 프로그램이 남았다");
    assert.equal(live.lost, 1, "컨텍스트를 한 번 놓아야 한다");
  });
}

test("E-20 WebGL 을 못 쓰는 기기에서는 그대로 null 이다", () => {
  assert.equal(withDocument(null, () => createBallPainter()), null);
});

test("E-20 성공하는 길의 GL 호출 순서는 고치기 전과 같고, 아무것도 지우지 않는다", () => {
  const { gl, calls, live } = fakeGl("none");
  const painter = withDocument(gl, () => createBallPainter());
  assert.ok(painter);
  // 기준 커밋(63445c7)의 heroBall.ts 를 같은 가짜 GL 로 돌려 얻은 순서다
  assert.deepEqual(calls, [
    "getExtension:OES_standard_derivatives",
    "createShader", "shaderSource", "compileShader", "getShaderParameter",
    "createShader", "shaderSource", "compileShader", "getShaderParameter",
    "createProgram", "attachShader", "attachShader", "linkProgram", "getProgramParameter",
    "useProgram", "createBuffer", "bindBuffer", "bufferData", "getAttribLocation", "enableVertexAttribArray", "vertexAttribPointer",
    "getUniformLocation", "getUniformLocation", "clearColor",
  ]);
  assert.equal(live.shaders.size, 2); assert.equal(live.programs.size, 1); assert.equal(live.lost, 0);
  // 다 쓴 뒤의 정리는 전과 같다: 컨텍스트를 놓는다
  painter.dispose();
  assert.equal(live.lost, 1);
});
