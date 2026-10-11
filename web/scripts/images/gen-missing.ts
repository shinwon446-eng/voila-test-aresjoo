// 실제 박스 데이터(lib/products.ts BOXES)에서 사진이 없는 실물 상품을 뽑는다. gen-list.mjs 는 카탈로그 파일을 정규식으로 읽어 일부 형식을 놓친다.
//   npx tsx scripts/images/gen-missing.ts                 → 박스별 개수
//   npx tsx scripts/images/gen-missing.ts <slug,slug>     → 그 박스들의 목록(Codex 입력용 줄). 여러 박스에 든 상품은 한 번만
//   끝에 --skip-done 을 붙이면 gen-raw 에 원본이 있는 것은 뺀다
import { existsSync } from "node:fs";
import { BOXES } from "../../lib/products";

const args = process.argv.slice(2);
const skipDone = args.includes("--skip-done");
const slugs = (args.find((a) => !a.startsWith("--")) ?? "").split(",").filter(Boolean);
const rawDir = new URL("gen-raw/", import.meta.url);
const missing = (slug: string) => BOXES.find((b) => b.slug === slug)!.items.filter((i) => i.kind === "physical" && !i.image.src);

if (!slugs.length) {
  const seen = new Set<string>();
  for (const b of BOXES) {
    const m = missing(b.slug);
    const fresh = m.filter((i) => !seen.has(i.id));
    fresh.forEach((i) => seen.add(i.id));
    console.log(b.slug.padEnd(20), "실물", String(b.items.filter((i) => i.kind === "physical").length).padStart(3), "사진 없음", String(m.length).padStart(3), "(새로", fresh.length + ")");
  }
  console.log("합계(중복 제외)", seen.size);
} else {
  const seen = new Set<string>();
  for (const slug of slugs) {
    for (const i of missing(slug)) {
      if (seen.has(i.id)) continue;
      seen.add(i.id);
      if (skipDone && existsSync(new URL(`${i.id}.png`, rawDir))) continue;
      console.log(`- ${i.id} | ${i.nameEn} (${i.name})`);
    }
  }
}
