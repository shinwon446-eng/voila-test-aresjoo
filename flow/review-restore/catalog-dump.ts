/**
 * 카탈로그, 확률, 상품가를 코드에서 직접 뽑아 두 판을 견준다(골든 테스트에 기대지 않는다).
 * cd <web 루트> && WEB_ROOT=<web 루트> npx tsx <이 파일> > catalog.json
 */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";
const ROOT = process.env.WEB_ROOT!;

async function main() {
  const p = await import(pathToFileURL(path.join(ROOT, "lib/products.ts")).href);
  const boxes = (p.BOXES as { slug: string; price: number; category: string; scheme: string; items: { id: string; value: number; kind: string; dropRate: number; image: { src?: string } }[] }[]).map((b) => ({
    slug: b.slug, price: b.price, category: b.category, scheme: b.scheme, odds: p.oddsVersionOf(b),
    items: b.items.map((i) => ({ id: i.id, value: i.value, kind: i.kind, dropRate: i.dropRate })),
    table: (p.dropTable(b) as { id: string }[]).map((i) => i.id),
    face: p.faceOf(b)?.id ?? null,
    rtp: +b.items.reduce((s, i) => s + i.value * i.dropRate, 0).toFixed(4),
    sum: +b.items.reduce((s, i) => s + i.dropRate, 0).toFixed(8),
    photos: b.items.filter((i) => i.image.src).length,
  }));
  const home = (p.HOME_BOXES as { slug: string }[]).map((b) => b.slug);
  const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex");
  process.stdout.write(JSON.stringify({
    boxes: boxes.length, home: home.length,
    oddsHash: hash(boxes.map((b) => [b.slug, b.price, b.odds, b.items.map((i) => [i.id, i.value, i.kind, i.dropRate]), b.table])),
    faces: Object.fromEntries(boxes.map((b) => [b.slug, b.face])),
    homeOrder: home,
    photos: Object.fromEntries(boxes.map((b) => [b.slug, b.photos])),
    rtp: Object.fromEntries(boxes.map((b) => [b.slug, b.rtp])),
    sums: boxes.filter((b) => Math.abs(b.sum - 1) > 1e-6).map((b) => [b.slug, b.sum]),
    REFUND_RATE: p.REFUND_RATE,
    detail: boxes,
  }));
}
main().catch((e) => { console.error(e); process.exit(1); });
