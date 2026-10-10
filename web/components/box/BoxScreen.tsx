"use client";
/**
 * 박스 화면. 결정 하나: 몇 개를 열지, 그리고 열기.
 * 위에는 열기 전에 알아야 할 것 전부(구성품, 구간마다 나올 확률, 상품마다 확률)가 있고,
 * 아래에 붙은 막대에 수량과 주 단추 하나가 있다. 막히면 그 단추가 다음 행동으로 바뀐다:
 *   로그인 전 → "로그인하고 열기" / 잔액 부족 → 한 줄 안내와 "USDT 충전하기" / 충분 → "N개 열기, 금액"
 * 구매 확정 단계는 없다. 단추에 수량과 금액이 적혀 있다. 큰 금액(50 USDT 이상이거나 10개 이상)만 확인창을 띄운다.
 */
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ceilingValue, dropTable, formatRate, retailReturn, type ProductBox, type ProductItem } from "@/lib/products";
import { TIERS, tierOf, type TierKey } from "@/lib/tiers";
import { OPEN_PRESETS } from "@/lib/autoplay";
import { InsufficientOpeningBalance, createOpeningPurchase, type OpeningResult } from "@/lib/opening";
import { useProductText } from "@/lib/useProductText";
import { useCurrency } from "@/lib/useCurrency";
import { useAuthStore } from "@/stores/authStore";
import { useWalletStore } from "@/stores/walletStore";
import { useFlow } from "@/stores/flowStore";
import { Button, Chips, Line, Row, Rows, ScreenHead, TextLink } from "@/components/ui/kit";
import { Confirm } from "@/components/ui/Sheet";
import { Reveal } from "@/components/box/Reveal";

/** 큰 금액은 되돌릴 수 없는 행동으로 보고 확인창을 띄운다 */
const CONFIRM_COST_USDT = 50;
const CONFIRM_COUNT = 10;
const TIER_LABEL: Record<TierKey, string> = { royal: "box.tierRoyal", prestige: "box.tierPrestige", executive: "box.tierExecutive", curated: "box.tierCurated" };
/** 위 구간은 큰 카드, 아래로 갈수록 작은 카드. 등급은 색이 아니라 크기와 글로 구분한다 */
const TIER_SIZE: Record<TierKey, "l" | "m" | "s"> = { royal: "l", prestige: "m", executive: "m", curated: "s" };

export function BoxScreen({ box }: { box: ProductBox }) {
  const t = useTranslations("v");
  const { boxTitle, itemName } = useProductText();
  const { fmt } = useCurrency();
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.hydrated);
  const openLogin = useAuthStore((s) => s.openAuthModal);
  const balance = useWalletStore((s) => s.balance);
  const openCharge = useFlow((s) => s.openCharge);
  const [qty, setQty] = useState<number>(1);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [opened, setOpened] = useState<{ results: OpeningResult[]; cost: number; round: number } | null>(null);

  const cost = +(box.price * qty).toFixed(2);
  const short = balance < cost;
  const table = useMemo(() => dropTable(box), [box]);
  const groups = useMemo(() => TIERS.map((tier) => {
    const items = table.filter((i) => tierOf(i.value, box.price).key === tier.key);
    return { key: tier.key, items, rate: +items.reduce((sum, i) => sum + i.dropRate, 0).toFixed(4) };
  }).filter((g) => g.items.length > 0), [table, box.price]);

  const open = async () => {
    if (busy) return;
    setBusy(true); setFailed(false); setConfirming(false);
    try {
      const results = await createOpeningPurchase(box, qty)();
      setOpened((prev) => ({ results, cost, round: (prev?.round ?? 0) + 1 }));
    } catch (error) {
      // 잔액이 모자라면 막대의 안내 한 줄이 이미 그 사실을 말한다. 그 밖의 실패만 따로 적는다.
      if (!(error instanceof InsufficientOpeningBalance)) setFailed(true);
    } finally { setBusy(false); }
  };
  const press = () => { if (cost >= CONFIRM_COST_USDT || qty >= CONFIRM_COUNT) setConfirming(true); else void open(); };

  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead back="/" backLabel={t("common.back")} title={boxTitle(box)} desc={t("box.desc", { n: box.items.length })} />
      {box.image.src && <div><div className="v-boxhero"><img src={box.image.src} alt="" /></div><p className="v-small">{t("box.photoNote")}</p></div>}
      <Rows label={t("box.facts")}>
        <Row label={t("box.price")}>{fmt(box.price)}</Row>
        <Row label={t("box.top")}>{fmt(ceilingValue(box))}</Row>
        <Row label={t("box.low")}>{fmt(box.guaranteedMin)}</Row>
        <Row label={t("box.ev")}>{(retailReturn(box) * 100).toFixed(1)}%</Row>
      </Rows>

      <section className="v-stack v-stack--lg" aria-labelledby="box-contents">
        <h2 id="box-contents" className="v-section">{t("box.contents")}</h2>
        {groups.map((g) => (
          <div key={g.key}>
            <div className="v-tierhead"><h3 className="v-sub">{t(TIER_LABEL[g.key])}</h3><span className="v-small v-num">{t("box.tierOdds", { pct: formatRate(g.rate) })}</span></div>
            <ul className={"v-items v-items--" + TIER_SIZE[g.key]}>
              {g.items.map((item) => <li key={item.id}><ItemCard item={item} name={itemName(item)} value={fmt(item.value)} odds={formatRate(item.dropRate)} /></li>)}
            </ul>
          </div>
        ))}
      </section>

      <div className="v-openbar">
        <div className="v-openbar-in">
          {failed && <Line fail>{t("box.openFail")}</Line>}
          {ready && user && short && <Line>{t("box.short", { balance: fmt(balance), missing: fmt(cost - balance) })}</Line>}
          <Chips scroll label={t("box.qty")} value={qty} onChange={(n) => { setQty(n); setFailed(false); }} disabled={busy} options={OPEN_PRESETS.map((n) => ({ value: n as number, label: t("box.qtyN", { n }) }))} />
          {!ready ? <Button disabled>{t("common.loading")}</Button>
            : !user ? <Button onClick={() => openLogin("login")}>{t("box.loginToOpen")}</Button>
            : short ? <Button onClick={openCharge}>{t("box.charge")}</Button>
            : <Button onClick={press} busy={busy} busyLabel={t("box.opening")}>{t("box.open", { n: qty, amount: fmt(cost) })}</Button>}
        </div>
      </div>

      <Confirm open={confirming} onCancel={() => setConfirming(false)} onConfirm={open} busy={busy} busyLabel={t("box.opening")} title={t("box.confirmTitle", { n: qty })} desc={t("box.confirmDesc", { amount: fmt(cost) })} confirmLabel={t("box.open", { n: qty, amount: fmt(cost) })} cancelLabel={t("common.cancel")} />
      {opened && <Reveal key={opened.round} box={box} results={opened.results} cost={opened.cost} onClose={() => setOpened(null)} onAgain={open} againBusy={busy} canAgain={!short} />}
    </div>
  );
}

function ItemCard({ item, name, value, odds }: { item: ProductItem; name: string; value: string; odds: string }) {
  return (
    <div className="v-item">
      <div className="v-item-photo">{item.image.src && <img src={item.image.src} alt="" loading="lazy" decoding="async" />}</div>
      <div className="v-item-body">
        <div className="v-item-name">{name}</div>
        <div className="v-item-meta"><span className="v-num">{value}</span><span className="v-num">{odds}</span></div>
      </div>
    </div>
  );
}
