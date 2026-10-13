// 전체 박스의 순서를 앞에서부터 적는다(lib/boxOrder). web 폴더에서 실행.
//   npx tsx scripts/catalog2/box-order.ts [칸 수] [잔액]
import { HOME_BOXES, faceOf } from "../../lib/products";
import { boxOrder, pullOf } from "../../lib/boxOrder";

const n = Number(process.argv[2] ?? 24);
const balance = process.argv[3] ? Number(process.argv[3]) : undefined;
boxOrder(HOME_BOXES, { balance }).slice(0, n).forEach((b, i) => {
  const face = faceOf(b);
  console.log([i + 1, "$" + b.price, b.category, b.title, (face?.name ?? "").slice(0, 34), "$" + (face?.value ?? 0), Math.round(pullOf(b)) + "배", face?.image.src ? "" : "사진 없음"].join("\t"));
});
