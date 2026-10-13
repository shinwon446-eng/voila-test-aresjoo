// 읽기 전용: 박스 주소 목록을 적는다(배포 주소 확인용).
// 실행: (web 폴더에서) npx tsx ../migration-audit/harness/claude-a/slugs.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BOXES, HOME_BOXES } from "../../../web/lib/products";

const here = path.dirname(fileURLToPath(import.meta.url));
const home = new Set(HOME_BOXES.map((b) => b.slug));
fs.writeFileSync(path.join(here, "slugs.json"), JSON.stringify(BOXES.map((b) => ({ slug: b.slug, category: b.category, price: b.price, home: home.has(b.slug) }))));
console.log(BOXES.length);
