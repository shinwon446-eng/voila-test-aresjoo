/**
 * 홈 배너의 공을 그린다(2026-10-11 파운더: 잘라 낸 그림은 찌그러져 보인다, 영상처럼 실제로 돌게).
 * 공은 그림 파일이 아니라 구를 한 화소씩 계산해 그린 것이다. 그래서 어느 크기에서도 둥글고, 방향을 바꾸면 띠와 단추가 구 위에서 실제로 돈다.
 *   - 빛은 화면에 고정이고(왼쪽 위), 공만 돈다. 반사광도 화면에 고정이라 공이 돌아도 따라 돌지 않는다.
 *   - WebGL 한 장으로 그려 공마다의 캔버스에 옮긴다. WebGL 을 못 쓰는 기기에서는 null 을 돌려주고, 배너는 유리구슬로 돌아간다.
 */
const VERT = "attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }";
const FRAG = `#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform float uRes;
uniform mat3 uRot;
const vec3 RED = vec3(0.96, 0.05, 0.06);
const vec3 WHITE = vec3(0.97, 0.97, 0.97);
const vec3 BLACK = vec3(0.075, 0.075, 0.085);
void main() {
  vec2 p = gl_FragCoord.xy / uRes * 2.0 - 1.0;
  float r = length(p);
  float px = 2.0 / uRes;
  float alpha = 1.0 - smoothstep(1.0 - px * 2.0, 1.0 - px * 0.5, r);
  if (alpha <= 0.0) { gl_FragColor = vec4(0.0); return; }
  float rr = min(r, 0.9995);
  vec3 n = vec3(p * (rr / max(r, 0.0001)), sqrt(1.0 - rr * rr));
  vec3 l = uRot * n;
  // 위 반은 빨강, 아래 반은 흰색, 그 사이에 검은 띠
  float wy = clamp(fwidth(l.y), 0.001, 0.05);
  vec3 col = mix(WHITE, RED, smoothstep(-wy, wy, l.y));
  float band = 1.0 - smoothstep(0.06 - wy, 0.06 + wy, abs(l.y));
  // 단추: 앞쪽 가운데의 검은 고리, 그 안의 테, 그 안의 면
  float d = length(l.xy);
  float wd = clamp(fwidth(d), 0.001, 0.05);
  float front = smoothstep(0.0, 0.05, l.z);
  float ring = (1.0 - smoothstep(0.31 - wd, 0.31 + wd, d)) * front;
  float rim = (1.0 - smoothstep(0.2 - wd, 0.2 + wd, d)) * front;
  float face = (1.0 - smoothstep(0.125 - wd, 0.125 + wd, d)) * front;
  float groove = (1.0 - smoothstep(0.0, wd + 0.012, abs(d - 0.125))) * front;
  float dark = max(band, ring);
  col = mix(col, BLACK, dark);
  col = mix(col, vec3(0.86), rim);
  col = mix(col, vec3(0.99), face);
  col = mix(col, vec3(0.62), groove * 0.6);
  // 빛: 왼쪽 위 앞에서. 가장자리는 조금 어둡게
  vec3 L = normalize(vec3(-0.42, 0.62, 0.66));
  float diff = max(dot(n, L), 0.0);
  float shade = (0.66 + 0.4 * diff) * mix(0.74, 1.0, smoothstep(0.0, 0.6, n.z));
  col *= shade;
  // 반사: 네모난 조명 창 하나와 작은 점 하나
  vec3 R = vec3(2.0 * n.z * n.xy, 2.0 * n.z * n.z - 1.0);
  vec2 q = R.xy - vec2(-0.5, 0.66);
  q = vec2(q.x * 0.94 - q.y * 0.34, q.x * 0.34 + q.y * 0.94);
  float box = (1.0 - smoothstep(0.17, 0.2, abs(q.x))) * (1.0 - smoothstep(0.12, 0.15, abs(q.y)));
  col = mix(col, vec3(1.0), box * mix(0.3, 0.1, dark));
  col += pow(max(dot(R, L), 0.0), 70.0) * 0.3;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0) * alpha, alpha);
}`;

export interface BallPainter {
  /** 한 변이 size 화소인 캔버스에 공 하나를 그린다. m 은 ballMatrix 가 준 방향 */
  paint(target: CanvasRenderingContext2D, size: number, m: number[]): void;
  /** 그리는 장치를 잃었으면 false */
  alive(): boolean;
  dispose(): void;
}

/** 도 단위의 세 각으로 공의 방향을 만든다. yaw: 단추가 오른쪽으로, pitch: 단추가 아래로, roll: 화면에서 시계 반대로 */
export function ballMatrix(yaw: number, pitch: number, roll: number): number[] {
  const k = Math.PI / 180;
  const [sy, cy, sp, cp, sr, cr] = [Math.sin(yaw * k), Math.cos(yaw * k), Math.sin(pitch * k), Math.cos(pitch * k), Math.sin(roll * k), Math.cos(roll * k)];
  const a = [cy, 0, sy, sp * sy, cp, -sp * cy, -cp * sy, sp, cp * cy];
  return [
    cr * a[0] - sr * a[3], cr * a[1] - sr * a[4], cr * a[2] - sr * a[5],
    sr * a[0] + cr * a[3], sr * a[1] + cr * a[4], sr * a[2] + cr * a[5],
    a[6], a[7], a[8],
  ];
}

export function createBallPainter(): BallPainter | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl || !gl.getExtension("OES_standard_derivatives")) return null;
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source); gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG), program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const at = gl.getAttribLocation(program, "a");
  gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(program, "uRes"), uRot = gl.getUniformLocation(program, "uRot");
  gl.clearColor(0, 0, 0, 0);
  let lost = false;
  const onLost = (e: Event) => { e.preventDefault(); lost = true; };
  canvas.addEventListener("webglcontextlost", onLost);
  return {
    paint(target, size, m) {
      if (lost) return;
      if (canvas.width < size) { canvas.width = size; canvas.height = size; }
      gl.viewport(0, 0, size, size);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uRes, size); gl.uniformMatrix3fv(uRot, false, m);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      target.clearRect(0, 0, size, size);
      target.drawImage(canvas, 0, canvas.height - size, size, size, 0, 0, size, size);
    },
    alive: () => !lost,
    dispose() { canvas.removeEventListener("webglcontextlost", onLost); gl.getExtension("WEBGL_lose_context")?.loseContext(); },
  };
}
