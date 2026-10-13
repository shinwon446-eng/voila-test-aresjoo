// 샘플 후기 전체(모든 박스)의 통계. 결과 브랜치의 생성기를 읽기 전용으로 불러 돌린다(파일을 쓰지 않는다, 표준 출력만).
//   cd C:/Users/hyun1/dev/VOILA-audit-reviews/web && npx tsx <이 파일>
import { BOXES } from "../../../../VOILA-audit-reviews/web/lib/products";
import { sampleReviews } from "../../../../VOILA-audit-reviews/web/lib/reviewSamples";

let total = 0; const lang: Record<string, number> = {}; const textCount = new Map<string, number>(); const nickBoxes = new Map<string, Set<string>>();
const outcome = { big: { n: 0, five: 0 }, low: { n: 0, five: 0, four: 0 }, other: { n: 0, five: 0 } };
const jackpots: { slug: string; price: number; n: number; reviewsBig: number; shareReviews: number; oddsBig: number; ratio: number }[] = [];
const wrong: Record<string, string[]> = { perfume: [], mouse: [], quiet: [], keyboard: [] };
let first5Foreign = 0, first5 = 0, photo = 0, cars: string[] = [];
for (const box of BOXES) {
  const list = sampleReviews(box.slug);
  if (list.length === 0) continue;
  const byId = new Map(box.items.map((i) => [i.id, i]));
  let big = 0;
  const bigIds = new Set(box.items.filter((i) => i.kind !== "cash" && i.value / box.price >= 8 && i.value >= 300).map((i) => i.id));
  const sumAll = box.items.reduce((s, i) => s + i.dropRate, 0);
  const oddsBig = box.items.filter((i) => bigIds.has(i.id)).reduce((s, i) => s + i.dropRate, 0) / sumAll;
  list.forEach((r, idx) => {
    total++; lang[r.lang] = (lang[r.lang] ?? 0) + 1; if (r.photo) photo++;
    textCount.set(r.text, (textCount.get(r.text) ?? 0) + 1);
    (nickBoxes.get(r.author) ?? nickBoxes.set(r.author, new Set()).get(r.author)!).add(box.slug);
    const item = byId.get(r.itemId)!; const x = item.value / box.price;
    if (bigIds.has(item.id)) { big++; outcome.big.n++; if (r.rating === 5) outcome.big.five++; }
    else if (x < 0.7) { outcome.low.n++; if (r.rating === 5) outcome.low.five++; if (r.rating === 4) outcome.low.four++; }
    else { outcome.other.n++; if (r.rating === 5) outcome.other.five++; }
    if (idx < 5) { first5++; if (r.lang !== "ko") first5Foreign++; }
    if (/향수/.test(r.text) && !/퍼퓸|뚜왈렛|코롱|향수|빠르펭|파르펭|오 드 |엑스트레/.test(item.name)) wrong.perfume.push(`${box.slug}: ${item.name} :: ${r.text}`);
    if (/마우스 (받|왔|도착)|마우스 득템|드디어 마우스/.test(r.text) && /피트|패드|번지|그립|스케이트|케이블|솔/.test(item.name)) wrong.mouse.push(`${box.slug}: ${item.name} :: ${r.text}`);
    if (/세상 조용|노캔|노이즈캔슬/.test(r.text) && /분배기|케이블|스탠드|패드|팁|파우치|케이스|어댑터/.test(item.name)) wrong.quiet.push(`${box.slug}: ${item.name} :: ${r.text}`);
    if (/키감|타건|소리 생각보다 조용/.test(r.text) && !/키보드|키캡|스위치/.test(item.name)) wrong.keyboard.push(`${box.slug}: ${item.name} :: ${r.text}`);
    if (item.value >= 100000 && idx < 30) cars.push(`${box.slug} #${idx + 1} ${item.name} $${item.value} ★${r.rating} ${Math.round(r.ageMin / 1440)}일 전 :: ${r.text}`);
  });
  if (bigIds.size > 0) jackpots.push({ slug: box.slug, price: box.price, n: list.length, reviewsBig: big, shareReviews: big / list.length, oddsBig, ratio: oddsBig > 0 ? big / list.length / oddsBig : Infinity });
}
const pct = (a: number, b: number) => (b ? ((a / b) * 100).toFixed(1) + "%" : "-");
console.log("전체", total, "언어", JSON.stringify(lang), "사진 붙은 것", photo, pct(photo, total));
console.log("첫 다섯 건의 외국어", first5Foreign, "/", first5);
console.log("큰 결과의 별 다섯", pct(outcome.big.five, outcome.big.n), "건수", outcome.big.n, "| 박스 가격의 0.7배 아래 상품의 별 다섯", pct(outcome.low.five, outcome.low.n), "별 넷", pct(outcome.low.four, outcome.low.n), "건수", outcome.low.n);
const texts = [...textCount.entries()].sort((a, b) => b[1] - a[1]);
console.log("서로 다른 글", texts.length, "가장 많이 겹치는 글", JSON.stringify(texts.slice(0, 12)));
console.log("세 박스 넘게 나오는 별명", [...nickBoxes.values()].filter((s) => s.size >= 3).length, "/", nickBoxes.size, "가장 많은 것", JSON.stringify([...nickBoxes.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, 8).map(([n, s]) => [n, s.size])));
jackpots.sort((a, b) => b.ratio - a.ratio);
const med = (list: number[]) => { const s = [...list].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
console.log("큰 결과가 있는 박스", jackpots.length, "후기에서 큰 결과의 몫(가운데 값)", pct(med(jackpots.map((j) => j.shareReviews)), 1), "확률표에서의 몫(가운데 값)", (med(jackpots.map((j) => j.oddsBig)) * 100).toFixed(3) + "%", "배수(가운데 값)", med(jackpots.map((j) => j.ratio)).toFixed(1));
for (const slug of ["watch-rolex", "car-rolls-royce", "bag-hermes", "home-lg", "pokemon-charizard", "mobile-apple"]) { const j = jackpots.find((x) => x.slug === slug); if (j) console.log(" ", slug, "가격", j.price, "후기", j.n, "큰 결과 후기", j.reviewsBig, pct(j.shareReviews, 1), "확률표", (j.oddsBig * 100).toFixed(4) + "%", "배수", j.ratio.toFixed(0)); }
for (const [k, v] of Object.entries(wrong)) { console.log("엉뚱한 상품 말", k, v.length); for (const line of v.slice(0, 6)) console.log("   ", line); }
console.log("처음 30건 안의 10만 달러 넘는 상품", cars.length); for (const c of cars.slice(0, 8)) console.log("   ", c);
