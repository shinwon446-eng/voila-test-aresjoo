/**
 * 상품 구성 점검: 박스 사이의 id 충돌, 금지어, 문장부호, 중국어 누락, 구간 분포.
 *   npm run catalog:check
 */
import { BOXES } from "../lib/products";

const junk = /스티커|케이블 타이|키캡|보호 필름|파우치|워치 롤|다이캐스트|모델카|굿즈|잭팟|환전|볼트|긁어|돌려보기|손맛|연타|올인|본전|환수율|오토플레이/;
const seen = new Map<string, { name: string; value: number }>();
const problems: string[] = [];
for (const b of BOXES) for (const i of b.items) {
  if (i.kind !== "cash" && !i.id.startsWith("wave-")) {
    const prev = seen.get(i.id);
    if (prev && (prev.name !== i.name || prev.value !== i.value)) problems.push(`id ${i.id} differs between boxes: ${prev.name} ${prev.value} vs ${i.name} ${i.value}`);
    seen.set(i.id, { name: i.name, value: i.value });
  }
  if (junk.test(i.name)) problems.push(`${b.slug}: junk word in ${i.id} ${i.name}`);
  if (/[·—–!！?？]/.test(i.name + i.nameEn + i.nameZh)) problems.push(`${b.slug}: punctuation in ${i.id}`);
  if (!i.nameZh) problems.push(`${b.slug}: no zh ${i.id}`);
}
console.log("boxes", BOXES.length, "items", BOXES.reduce((s, b) => s + b.items.length, 0), "unique physical/digital", seen.size);
for (const b of BOXES) {
  const top = b.items.filter((i) => i.value >= b.price * 20).length;
  const max = Math.max(...b.items.map((i) => i.value));
  console.log(`${b.slug.padEnd(18)} ${String(b.price).padStart(3)} USDT  items ${String(b.items.length).padStart(3)}  top ${String(top).padStart(3)}  max ${max.toLocaleString("en-US")} (${Math.round(max / b.price).toLocaleString("en-US")}x)`);
}
console.log(problems.length ? problems.join("\n") : "no problems");
if (problems.length) process.exit(1);
