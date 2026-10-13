// 읽기 전용: 카탈로그와 상수의 개수를 센다. 저장하거나 고치는 것은 없다.
// 실행: (web 폴더에서) npx tsx ../migration-audit/harness/claude-a/counts.ts
import { BOXES, HOME_BOXES, CATEGORY_FILTERS, LEGACY_RETIRED, REFUND_RATE, isLadderBox, dropTable } from "../../../web/lib/products";
import { CATEGORIES_V2 } from "../../../web/lib/catalogTypes";
import { LEGAL_DOCS, LEGAL_GROUPS } from "../../../web/lib/legal";
import { COUNTRIES } from "../../../web/lib/shipping";
import { NETWORKS, MIN_DEPOSIT_USDT } from "../../../web/lib/depositAddress";
import { WITHDRAW_NETWORKS, MIN_WITHDRAW_USDT } from "../../../web/lib/withdrawal";
import { OPEN_PRESETS } from "../../../web/lib/autoplay";
import { REVIEW_SAMPLES } from "../../../web/lib/reviewSamples";
import { WELCOME_BOX_SLUG, WELCOME_FREE_OPENS } from "../../../web/stores/walletStore";

const byCat = new Map<string, number>();
for (const b of HOME_BOXES) byCat.set(b.category, (byCat.get(b.category) ?? 0) + 1);
const out = {
  boxes: BOXES.length,
  homeBoxes: HOME_BOXES.length,
  notOnHome: BOXES.filter((b) => !HOME_BOXES.includes(b)).map((b) => b.slug),
  ladderBoxes: BOXES.filter(isLadderBox).map((b) => b.slug),
  legacyRetired: LEGACY_RETIRED,
  refundRate: REFUND_RATE,
  categoryFilters: CATEGORY_FILTERS.map((c) => c.key),
  categoriesV2: CATEGORIES_V2,
  homeCategories: Object.fromEntries(byCat),
  slugSample: BOXES.slice(0, 5).map((b) => b.slug),
  duplicateSlugs: BOXES.map((b) => b.slug).filter((s, i, a) => a.indexOf(s) !== i),
  boxesWithCash: BOXES.filter((b) => dropTable(b).some((i) => i.kind === "cash")).length,
  boxesWithDigital: BOXES.filter((b) => dropTable(b).some((i) => i.kind === "digital")).length,
  boxesNoFacePhoto: BOXES.filter((b) => !dropTable(b).some((i) => i.image.src)).length,
  totalItems: BOXES.reduce((n, b) => n + dropTable(b).length, 0),
  itemsWithPhoto: BOXES.reduce((n, b) => n + dropTable(b).filter((i) => i.image.src).length, 0),
  legalDocs: LEGAL_DOCS,
  legalGroups: LEGAL_GROUPS,
  countries: COUNTRIES,
  depositNetworks: NETWORKS.map((n) => n.key + ":" + n.token),
  withdrawNetworks: WITHDRAW_NETWORKS.map((n) => n.key + ":" + n.token),
  minDeposit: MIN_DEPOSIT_USDT,
  minWithdraw: MIN_WITHDRAW_USDT,
  openPresets: OPEN_PRESETS,
  reviewSamples: REVIEW_SAMPLES.length,
  reviewSampleBoxes: Array.from(new Set(REVIEW_SAMPLES.map((r) => r.boxSlug))),
  welcomeBox: WELCOME_BOX_SLUG,
  welcomeFreeOpens: WELCOME_FREE_OPENS,
};
console.log(JSON.stringify(out, null, 1));
