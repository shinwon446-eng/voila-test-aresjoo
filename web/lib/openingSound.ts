/**
 * 개봉 장면의 소리와 진동. 파일을 내려받지 않고 Web Audio 로 그 자리에서 만든다.
 * 기본은 끔이다(설정의 openSound). 사용자가 켠 뒤에도 음량은 낮고, 소리가 없어도 화면만으로 결과가 다 읽힌다.
 *
 * 규칙(opening/RESEARCH.md, DECISIONS.md 1-9)
 *   - 여는 소리(봉인, 뚜껑)는 결과와 무관하게 같다.
 *   - 줄었거나 비슷한 결과에는 그다음 소리가 없다. 벌주는 소리도 축하 소리도 아니다.
 *   - 실제로 늘었을 때만 올라가는 음이 난다. 많이 늘수록 음이 하나씩 더해질 뿐 화려해지지 않는다.
 * Web Audio 는 사용자가 누른 뒤에만 소리를 낼 수 있어 첫 소리는 열기를 누른 그 손짓에서 시작한다.
 * 진동은 기능이 있는 기기에서만, 충격 순간 한 번. 없으면 조용히 넘어간다.
 */
import type { OutcomeTone } from "./openingFlow";

type Ctx = AudioContext;
let ctx: Ctx | null = null;

function audio(): Ctx | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  try { ctx ??= new AC(); if (ctx.state === "suspended") ctx.resume().catch(() => {}); return ctx; } catch { return null; }
}

/** 예약해 둔 소리. 화면이 닫히면 soundStop 이 전부 멈춘다 */
const live = new Set<AudioScheduledSourceNode>();
const track = (node: AudioScheduledSourceNode) => { live.add(node); node.onended = () => live.delete(node); };
export function soundStop() {
  for (const node of Array.from(live)) { try { node.stop(); } catch { /* 이미 끝난 소리 */ } }
  live.clear();
}

const MASTER = 0.16;

function tone(c: Ctx, freq: number, at: number, dur: number, gain: number, type: OscillatorType = "sine") {
  const osc = c.createOscillator(); const g = c.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, at);
  g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(gain * MASTER, at + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(g).connect(c.destination); osc.start(at); osc.stop(at + dur + 0.02); track(osc);
}

function noise(c: Ctx, at: number, dur: number, gain: number, cutoff: number) {
  const len = Math.max(1, Math.floor(c.sampleRate * dur)); const buf = c.createBuffer(1, len, c.sampleRate); const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource(); src.buffer = buf;
  const filter = c.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.setValueAtTime(cutoff, at);
  const g = c.createGain(); g.gain.setValueAtTime(gain * MASTER, at);
  src.connect(filter).connect(g).connect(c.destination); src.start(at); track(src);
}

/** 열기를 누른 순간: 아주 짧은 눌림 소리. 이 호출이 소리 장치를 깨운다(사용자 손짓 안에서 불러야 한다). */
export function soundPress(enabled: boolean) {
  if (!enabled) return; const c = audio(); if (!c) return;
  tone(c, 220, c.currentTime, 0.06, 0.5, "triangle");
}

/** 충격: 봉인이 떨어지고 뚜껑이 넘어가는 소리. 결과와 무관하게 같다. */
export function soundOpen(enabled: boolean) {
  if (!enabled) return; const c = audio(); if (!c) return;
  const t = c.currentTime;
  noise(c, t, 0.05, 0.9, 2400);          // 봉인이 떨어지는 딸깍
  tone(c, 92, t + 0.01, 0.2, 1, "sine"); // 뚜껑의 낮은 울림
  noise(c, t + 0.05, 0.12, 0.35, 700);   // 종이가 스치는 끝소리
}

/** 드러남: 실제로 늘었을 때만. 줄었거나 비슷하면 아무 소리도 내지 않는다. */
export function soundResult(enabled: boolean, outcome: OutcomeTone) {
  if (!enabled || outcome === "below" || outcome === "even") return;
  const c = audio(); if (!c) return;
  const t = c.currentTime;
  const notes = outcome === "above" ? [523.25, 659.25] : outcome === "high" ? [523.25, 659.25, 783.99] : [392, 523.25, 659.25, 783.99];
  notes.forEach((f, i) => tone(c, f, t + i * 0.085, outcome === "top" ? 0.9 : 0.42, 0.5, "sine"));
}

/** 진동은 기능이 있을 때만. 닫히거나 건너뛴 뒤에 늦게 울리지 않도록 부르는 쪽이 그 순간에만 부른다. */
export function hapticImpact(enabled: boolean) {
  if (!enabled || typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try { navigator.vibrate(12); } catch { /* 지원하지 않는 기기 */ }
}
