/**
 * 데이터와 돈 계산의 기준값을 계산하는 한 벌의 코드.
 *
 * 만드는 쪽(generate.ts, 기준 커밋에서 한 번)과 검사하는 쪽(web/tests/parityGolden.test.ts, 지금 코드로 매번)이
 * 이 파일을 함께 쓴다. 계산 방법이 둘로 갈라지지 않게 하려는 것이다.
 * 앱의 모듈은 인자로 받는다(이 파일은 web/ 의 어느 폴더도 직접 가리키지 않는다).
 *
 * 기대값(golden/*.json)은 기준 커밋 63445c7 에서만 만든다.
 * 검사가 실패했을 때 기대값을 다시 만들어 통과시키지 않는다. 실패는 데이터나 돈 계산이 바뀌었다는 뜻이다.
 */
import { createHash } from "node:crypto";

interface ItemLike { id: string; kind: string; value: number; dropRate: number; name?: string; nameEn?: string; nameZh?: string; image?: { src?: string | null } }
interface BoxLike { slug: string; price: number; category: string; scheme?: string; guaranteedMin: number; items: ItemLike[] }

export interface GoldenDeps {
  products: {
    BOXES: BoxLike[];
    HOME_BOXES: BoxLike[];
    REFUND_RATE: number;
    CATALOG_ODDS_VERSION: string;
    PHYSICAL_ODDS_VERSION: string;
    dropTable: (box: any) => ItemLike[];
    sellValueOf: (item: any) => number;
    getBoxBySlug: (slug: string) => BoxLike | undefined;
    ceilingValue: (box: any) => number;
    cashReturn: (box: any) => number;
    retailReturn: (box: any) => number;
  };
  fairness: {
    ROLL_RANGE: number;
    calculateRollResult: (serverSeed: string, clientSeed: string, nonce: number) => Promise<{ hmac: string; raw: number; roll: number }>;
    determineItem: (roll: number, items: any[]) => ItemLike;
    hashServerSeed: (seed: string) => Promise<string>;
  };
  takeBatch: { takeAmountOf: (item: { valueUsdt: number }) => number };
  withdrawal: {
    MIN_WITHDRAW_USDT: number;
    WITHDRAW_NETWORKS: { key: string; feeUsdt: number }[];
    netReceive: (amountUsdt: number, network: any) => number;
    maxWithdrawable: (balanceUsdt: number) => number;
    validateWithdrawal: (input: { network: any; address: string; amountUsdt: number; balanceUsdt: number }, allowAnyAddress?: boolean) => string[];
  };
  funding: {
    planDebit: (amountUsdt: number, cryptoBalance: number, cardBalance: number) => unknown;
    attributeRefund: (amountUsdt: number, ratio: { crypto: number; card: number }) => { toCrypto: number; toCard: number };
  };
  tiers: { tierOf: (value: number, price: number) => { key: string } };
  burst: { BURST: { id: string; share: number; seed: number; slots: number }; burstSeed: (price: number) => number; burstStep: (price: number) => number };
}

const sha = (text: string): string => createHash("sha256").update(text).digest("hex");
const count = (list: string[]): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const key of list) out[key] = (out[key] ?? 0) + 1;
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
};

/** 추첨 표에 쓰는 고정 시드. 화면 검증 도구(lib/common.mjs 의 FAIR)와 같은 값이다. */
export const GOLDEN_SEEDS = { serverSeed: "parity-audit-server-seed-0001", clientSeed: "parity-audit-client-seed" } as const;
export const GOLDEN_DRAW_BOXES = ["gaming-playstation", "watch-rolex", "pokemon-charizard"] as const;
export const GOLDEN_NONCES = 50;

/**
 * 카탈로그. 순서가 뜻을 가진다.
 *   tableOrder  box.items 의 순서(카탈로그가 정한 순서)
 *   drawOrder   dropTable(box) 의 순서(값이 큰 것부터. 추첨의 roll 구간이 이 순서로 쌓인다)
 * 해시의 한 줄은 "박스 슬러그|가격|상품 id|확률" 이다. 값과 종류는 따로 해시한다(무엇이 바뀌었는지 가르려고).
 * 이름과 사진 경로는 사진이 더해지면 움직이므로 여기 넣지 않고 computePhotos 가 따로 센다(photos.json).
 */
export function computeCatalog(deps: GoldenDeps) {
  const { BOXES, HOME_BOXES, dropTable } = deps.products;
  const line = (box: BoxLike, item: ItemLike) => `${box.slug}|${box.price}|${item.id}|${item.dropRate}`;
  const valueLine = (box: BoxLike, item: ItemLike) => `${line(box, item)}|${item.kind}|${item.value}`;
  const table: string[] = [], draw: string[] = [], values: string[] = [];
  const perBox: Record<string, { price: number; items: number; rateSum: number; table: string; draw: string; values: string }> = {};
  for (const box of BOXES) {
    const t = box.items.map((item) => line(box, item));
    const d = dropTable(box).map((item) => line(box, item));
    const v = box.items.map((item) => valueLine(box, item));
    table.push(...t); draw.push(...d); values.push(...v);
    perBox[box.slug] = {
      price: box.price, items: box.items.length,
      // 확률 합은 0.0001% 칸으로 센다(부동소수 오차 없이 정확히 1,000,000 이어야 한다)
      rateSum: box.items.reduce((sum, item) => sum + Math.round(item.dropRate * 10000), 0),
      table: sha(t.join("\n")), draw: sha(d.join("\n")), values: sha(v.join("\n")),
    };
  }
  const allItems = BOXES.flatMap((box) => box.items);
  return {
    counts: {
      boxes: BOXES.length,
      homeBoxes: HOME_BOXES.length,
      itemRows: allItems.length,
      uniqueItemIds: new Set(allItems.map((item) => item.id)).size,
      byCategory: count(BOXES.map((box) => box.category)),
      byScheme: count(BOXES.map((box) => box.scheme ?? "(없음)")),
      byKind: count(allItems.map((item) => item.kind)),
      byPrice: count(BOXES.map((box) => String(box.price))),
    },
    constants: { refundRate: deps.products.REFUND_RATE, catalogOddsVersion: deps.products.CATALOG_ODDS_VERSION, physicalOddsVersion: deps.products.PHYSICAL_ODDS_VERSION, rollRange: deps.fairness.ROLL_RANGE },
    sha256: { tableOrder: sha(table.join("\n")), drawOrder: sha(draw.join("\n")), withKindAndValue: sha(values.join("\n")), boxOrder: sha(BOXES.map((box) => box.slug).join("\n")), homeBoxOrder: sha(HOME_BOXES.map((box) => box.slug).join("\n")) },
    perBox,
  };
}

/**
 * 사진에 달린 값(photos.json): 사진이 있는 상품 행의 수와 "박스 슬러그|상품 id|이름 셋|사진 경로" 의 해시.
 * 카탈로그의 다른 값과 달리 사진은 일부러 더해지므로 이 값은 움직인다. 사진을 더한 커밋에서 같이 다시 만든다(generate.ts --photos).
 * 상품의 순서, 확률, 값은 여기 들어가지 않는다(그것은 computeCatalog 가 지키고 다시 만들지 않는다).
 */
export function computePhotos(deps: GoldenDeps) {
  const { BOXES } = deps.products;
  const textLine = (box: BoxLike, item: ItemLike) => `${box.slug}|${item.id}|${item.name ?? ""}|${item.nameEn ?? ""}|${item.nameZh ?? ""}|${item.image?.src ?? ""}`;
  const allItems = BOXES.flatMap((box) => box.items);
  return {
    itemRowsWithPhoto: allItems.filter((item) => !!item.image?.src).length,
    namesAndPhotos: sha(BOXES.flatMap((box) => box.items.map((item) => textLine(box, item))).join("\n")),
  };
}

/** 고정 시드로 뽑은 결과: 박스 셋, nonce 0 부터 49. roll 과 그 roll 이 가리키는 상품 id. */
export async function computeDraws(deps: GoldenDeps) {
  const { calculateRollResult, determineItem, hashServerSeed } = deps.fairness;
  const out: { serverSeed: string; serverSeedHash: string; clientSeed: string; boxes: Record<string, { nonce: number; roll: number; itemId: string; value: number; kind: string }[]> } = {
    serverSeed: GOLDEN_SEEDS.serverSeed, serverSeedHash: await hashServerSeed(GOLDEN_SEEDS.serverSeed), clientSeed: GOLDEN_SEEDS.clientSeed, boxes: {},
  };
  for (const slug of GOLDEN_DRAW_BOXES) {
    const box = deps.products.getBoxBySlug(slug);
    if (!box) throw new Error("박스가 없다: " + slug);
    const table = deps.products.dropTable(box);
    const rows = [];
    for (let nonce = 0; nonce < GOLDEN_NONCES; nonce++) {
      const { roll } = await calculateRollResult(GOLDEN_SEEDS.serverSeed, GOLDEN_SEEDS.clientSeed, nonce);
      const item = determineItem(roll, table);
      rows.push({ nonce, roll, itemId: item.id, value: item.value, kind: item.kind });
    }
    out.boxes[slug] = rows;
  }
  return out;
}

/** 돈 계산: USDT 로 받는 금액, 출금 수수료와 최소 금액, 개봉 차감의 원천 나눔, 환급의 원천 귀속, 구간과 터짐. */
export function computeMoney(deps: GoldenDeps) {
  const { takeBatch, products, withdrawal, funding, tiers, burst } = deps;
  const values = [0.01, 0.05, 0.99, 1, 1.01, 3.33, 9.99, 19.99, 20, 49.99, 100, 129.99, 549, 749.99, 1000, 2499.5, 12345.67, 24999.99, 99999.99, 1234567.89];
  const take = values.map((valueUsdt) => ({
    valueUsdt,
    takeAmount: takeBatch.takeAmountOf({ valueUsdt }),
    sellPhysical: products.sellValueOf({ kind: "physical", value: valueUsdt }),
    sellDigital: products.sellValueOf({ kind: "digital", value: valueUsdt }),
    sellCash: products.sellValueOf({ kind: "cash", value: valueUsdt }),
  }));
  const amounts = [0, 0.5, 1, 19.99, 20, 20.01, 21, 100, 1234.56, 10000];
  const trc = "T" + "1".repeat(33), bep = "0x" + "a".repeat(40);
  const withdraw = {
    minUsdt: withdrawal.MIN_WITHDRAW_USDT,
    fees: Object.fromEntries(withdrawal.WITHDRAW_NETWORKS.map((n) => [n.key, n.feeUsdt])),
    netReceive: withdrawal.WITHDRAW_NETWORKS.flatMap((n) => amounts.map((amountUsdt) => ({ network: n.key, amountUsdt, net: withdrawal.netReceive(amountUsdt, n.key) }))),
    maxWithdrawable: [-5, 0, 0.004, 0.005, 19.999, 250.555, 10000].map((balanceUsdt) => ({ balanceUsdt, max: withdrawal.maxWithdrawable(balanceUsdt) })),
    validate: [
      { network: "TRC20", address: trc, amountUsdt: 100, balanceUsdt: 500 },
      { network: "TRC20", address: trc, amountUsdt: 19.99, balanceUsdt: 500 },
      { network: "TRC20", address: trc, amountUsdt: 20, balanceUsdt: 20 },
      { network: "TRC20", address: trc, amountUsdt: 500.01, balanceUsdt: 500 },
      { network: "TRC20", address: trc, amountUsdt: 5, balanceUsdt: 1 },
      { network: "TRC20", address: trc, amountUsdt: 0, balanceUsdt: 500 },
      { network: "TRC20", address: trc, amountUsdt: Number.NaN, balanceUsdt: 500 },
      { network: "TRC20", address: "not-an-address", amountUsdt: 100, balanceUsdt: 500 },
      { network: "TRC20", address: bep, amountUsdt: 100, balanceUsdt: 500 },
      { network: "BEP20", address: bep, amountUsdt: 100, balanceUsdt: 500 },
      { network: "BEP20", address: trc, amountUsdt: 100, balanceUsdt: 500 },
      { network: "BEP20", address: "", amountUsdt: 10, balanceUsdt: 5 },
    ].map((input) => ({ ...input, amountUsdt: Number.isNaN(input.amountUsdt) ? "NaN" : input.amountUsdt, errors: withdrawal.validateWithdrawal(input) })),
  };
  const debitCases: [number, number, number][] = [
    [1, 10000, 0], [50, 10000, 0], [100, 60, 100], [100, 0, 100], [100, 100, 0], [100, 99.99, 0.01], [100, 50, 49.99], [0.25, 0.25, 0],
    [1, 0.25, 0], [33.33, 10, 100], [0, 100, 100], [-5, 100, 100], [250, 249.99, 0.01], [500, 0.01, 499.99], [5, 2.5, 2.5], [1, 0.33, 0.67],
  ];
  const debit = debitCases.map(([amountUsdt, cryptoBalance, cardBalance]) => ({ amountUsdt, cryptoBalance, cardBalance, split: funding.planDebit(amountUsdt, cryptoBalance, cardBalance) }));
  const refundCases: [number, number][] = [[95, 1], [95, 0], [95, 0.6], [521.55, 0.333333], [0.01, 0.5], [0.05, 0.5], [950, 0.999999], [0, 1], [10, 0.25]];
  const refund = refundCases.map(([amountUsdt, crypto]) => ({ amountUsdt, ratio: { crypto, card: +(1 - crypto).toFixed(6) }, to: funding.attributeRefund(amountUsdt, { crypto, card: +(1 - crypto).toFixed(6) }) }));
  const prices = [1, 5, 50, 100, 250, 500];
  const multiples = [0.05, 0.25, 0.94, 0.95, 0.96, 1, 1.05, 1.99, 2, 5.99, 6, 19.99, 20, 100, 1000];
  const tier = prices.flatMap((price) => multiples.map((m) => ({ price, value: +(price * m).toFixed(2), tier: tiers.tierOf(+(price * m).toFixed(2), price).key })));
  const burstRows = { id: burst.BURST.id, share: burst.BURST.share, seed: burst.BURST.seed, slots: burst.BURST.slots, perPrice: prices.map((price) => ({ price, seed: burst.burstSeed(price), step: burst.burstStep(price) })) };
  const boxes = GOLDEN_DRAW_BOXES.map((slug) => {
    const box = products.getBoxBySlug(slug);
    if (!box) throw new Error("박스가 없다: " + slug);
    return { slug, price: box.price, guaranteedMin: box.guaranteedMin, ceiling: products.ceilingValue(box), cashReturn: +products.cashReturn(box).toFixed(10), retailReturn: +products.retailReturn(box).toFixed(10) };
  });
  return { refundRate: products.REFUND_RATE, take, withdraw, debit, refund, tier, burst: burstRows, boxes };
}

/** JSON 으로 한 번 다녀온 값(파일에 적힌 것과 같은 꼴). undefined 와 -0 같은 것이 비교를 흐리지 않게 한다. */
export const asJson = <T>(value: T): T => JSON.parse(JSON.stringify(value));
