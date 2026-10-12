"use client";
/**
 * 개발 전용 상태 갤러리(/dev/gallery, 프로덕션에서는 404).
 * 새 화면의 모든 부품, 겹침 화면, 토스트 문구, 빈 상태, 로딩, 실패 한 줄을 실제 문구로 한 페이지에 띄운다.
 * 언어는 꼬리말의 링크로 바꾼다. 여기서 누르는 것은 화면만 열고 돈은 움직이지 않는다(개봉 결과는 표본 데이터).
 */
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { BOXES, dropTable } from "@/lib/products";
import { tierOf } from "@/lib/tiers";
import type { OpeningResult } from "@/lib/opening";
import { useAuthStore } from "@/stores/authStore";
import { useFlow } from "@/stores/flowStore";
import { useCurrency } from "@/lib/useCurrency";
import { Button, ButtonLink, Card, Chips, Empty, Field, Line, Row, Rows, ScreenHead, Skeleton, TextLink } from "@/components/ui/kit";
import { Confirm, Sheet } from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/toast";
import { Reveal } from "@/components/box/Reveal";
import { VerifySheet } from "@/components/flow/VerifySheet";
import { ShipSheet } from "@/components/flow/ShipSheet";
import type { ChainRecord } from "@/lib/chainRecord";
import { ChainRecordView } from "@/components/verify/ChainRecord";
import { VerifyMethod } from "@/components/verify/VerifyMethod";

const FAIL_LINES = ["box.openFail", "charge.addressFail", "ship.errRecipient", "ship.errPhone", "ship.errPostal", "ship.errAddress", "ship.errPccc", "ship.errResidentId", "ship.failed", "inv.cancelFailed", "verify.bad", "verify.failed"] as const;
const STATUS_LINES = ["charge.preparing", "charge.waiting", "inv.waitingTracking", "inv.loginLine", "verify.ok", "state.offline"] as const;
const EMPTY_LINES = ["inv.empty.held", "inv.empty.shipping", "inv.empty.done"] as const;
/**
 * "블록체인 기록" 부품의 상태 다섯(flow/MELT_SPEC.md S9). 이 갤러리 안에서만 쓰는 고정 자료다.
 * 체인 이름과 기록 주소는 실제 것이 아니고(이름부터 fixture 라고 적었다) 바깥 주소도 예시 도메인이다.
 * 사용자 화면은 lib/chainRecord 의 chainRecordOf 만 쓰고 그 결과는 언제나 none 이다. 이 자료를 다른 파일로 내보내지 않는다.
 */
const FIXTURE_CHAIN = { chain: "Fixture chain (gallery only)", address: "fixture-record-not-a-real-transaction-0000", url: "https://example.com/" };
const CHAIN_FIXTURES: { label: string; record: ChainRecord }[] = [
  { label: "none: every real record on this test site", record: { state: "none" } },
  { label: "pending: fixture", record: { state: "pending", ...FIXTURE_CHAIN } },
  { label: "confirmed: fixture", record: { state: "confirmed", ...FIXTURE_CHAIN } },
  { label: "mismatch: fixture", record: { state: "mismatch", ...FIXTURE_CHAIN } },
  { label: "error: fixture", record: { state: "error" } },
];

export function Gallery() {
  const t = useTranslations("v");
  const { fmt } = useCurrency();
  const toast = useToast((s) => s.show);
  const openLogin = useAuthStore((s) => s.openAuthModal);
  const { openCharge, openMenu } = useFlow();
  const [chip, setChip] = useState<number>(1);
  const [sheet, setSheet] = useState(false);
  const [confirm, setConfirm] = useState<"open" | "take" | "ship" | "cancel" | null>(null);
  const [reveal, setReveal] = useState<"cash" | "item" | "multi" | null>(null);
  const [verify, setVerify] = useState(false);
  const [ship, setShip] = useState(false);

  // 표본 개봉 결과: 실제 상품 데이터에서 고르고 구매는 하지 않는다
  const box = BOXES[0];
  const sample = useMemo(() => {
    const table = dropTable(box);
    const make = (index: number): OpeningResult => ({ ownedId: "gallery-" + index, settled: false, item: table[index], tier: tierOf(table[index].value, box.price), roll: 0, hmac: "", nonce: index, serverSeed: "", serverSeedHash: "", clientSeed: "" });
    const cashIndex = table.findIndex((i) => i.kind === "cash");
    return { cash: [make(cashIndex < 0 ? table.length - 1 : cashIndex)], item: [make(0)], multi: [make(0), make(Math.min(3, table.length - 1)), make(table.length - 1), make(table.length - 2), make(table.length - 1)] };
  }, [box]);

  const section = (title: string, children: React.ReactNode) => <section className="v-stack"><h2 className="v-section">{title}</h2>{children}</section>;

  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead title="Gallery" desc={t("home.desc")} back="/" backLabel={t("common.back")} />

      {section("Button", <>
        <Button>{t("box.open", { n: 1, amount: fmt(1) })}</Button>
        <Button busy busyLabel={t("box.opening")}>{t("box.open", { n: 1, amount: fmt(1) })}</Button>
        <Button disabled>{t("charge.copy")}</Button>
        <Button quiet>{t("common.cancel")}</Button>
        <ButtonLink href="/">{t("state.toBoxes")}</ButtonLink>
      </>)}

      {section("TextLink", <div className="v-links"><TextLink href="/guide">{t("nav.guide")}</TextLink><TextLink onClick={() => undefined}>{t("box.auto")}</TextLink><TextLink href="https://example.com" external>{t("inv.track")}</TextLink></div>)}

      {section("Chips", <Chips label={t("box.qty")} value={chip} onChange={setChip} options={[1, 5, 10, 50, 100].map((n) => ({ value: n, label: t("box.qtyN", { n }) }))} />)}

      {section("Card, Rows", <>
        <Card><h3 className="v-card-title">{t("guide.pickTitle")}</h3><p className="v-sub">{t("guide.pickBody")}</p></Card>
        <Card outline><h3 className="v-card-title">{t("guide.openTitle")}</h3><p className="v-sub">{t("guide.openBody")}</p></Card>
        <Rows><Row label={t("box.price")}>{fmt(1)}</Row><Row label={t("box.top")}>{fmt(1000)}</Row><Row label={t("box.low")}>{fmt(0.5)}</Row></Rows>
      </>)}

      {section("Field", <><Field label={t("login.email")} placeholder="" /><Field label={t("ship.recipient")} defaultValue="VOILA" /><Line fail>{t("ship.errRecipient")}</Line></>)}

      {section("Line: " + STATUS_LINES.length, STATUS_LINES.map((key) => <Line key={key} live={false}>{t(key)}</Line>))}
      {section("Line fail: " + FAIL_LINES.length, FAIL_LINES.map((key) => <p key={key} className="v-line v-line--fail">{t(key)}</p>))}
      {section("Line short", <Line live={false}>{t("box.short", { balance: fmt(0), missing: fmt(1) })}</Line>)}

      {section("Empty", EMPTY_LINES.map((key) => <Empty key={key}>{t(key)}</Empty>))}
      {section("Skeleton", <Skeleton height={120} label={t("common.loading")} />)}

      {section("Chain record, fixture data: " + CHAIN_FIXTURES.length, CHAIN_FIXTURES.map((f) => (
        <div key={f.label} className="v-stack v-stack--sm"><p className="v-small">{f.label}</p><ChainRecordView record={f.record} onRetry={() => undefined} /></div>
      )))}
      {section("Verify method", <VerifyMethod />)}

      {section("Toast", <Button quiet onClick={() => toast(t("common.copied"))}>{t("common.copied")}</Button>)}

      {section("Sheet", <>
        <Button quiet onClick={() => setSheet(true)}>Sheet</Button>
        <Button quiet onClick={() => openLogin("login")}>{t("login.title")}</Button>
        <Button quiet onClick={() => openLogin("signup")}>{t("login.signupTitle")}</Button>
        <Button quiet onClick={() => openLogin("recover")}>{t("login.recoverTitle")}</Button>
        <Button quiet onClick={openCharge}>{t("charge.title")}</Button>
        <Button quiet onClick={openMenu}>{t("nav.menu")}</Button>
        <Button quiet onClick={() => setVerify(true)}>{t("verify.title")}</Button>
        <Button quiet onClick={() => setShip(true)}>{t("ship.title")}</Button>
      </>)}

      {section("Confirm", <>
        <Button quiet onClick={() => setConfirm("open")}>{t("box.confirmTitle", { amount: fmt(50) })}</Button>
        <Button quiet onClick={() => setConfirm("take")}>{t("reveal.takeTitle")}</Button>
        <Button quiet onClick={() => setConfirm("ship")}>{t("ship.confirmTitle")}</Button>
        <Button quiet onClick={() => setConfirm("cancel")}>{t("inv.cancelTitle")}</Button>
      </>)}

      {section("Reveal", <>
        <Button quiet onClick={() => setReveal("cash")}>{t("reveal.cashTitle", { amount: fmt(sample.cash[0].item.value) })}</Button>
        <Button quiet onClick={() => setReveal("item")}>{t("reveal.ship")}</Button>
        <Button quiet onClick={() => setReveal("multi")}>{t("reveal.multiTitle", { n: 5 })}</Button>
      </>)}

      <Sheet open={sheet} onClose={() => setSheet(false)} title={t("charge.title")} desc={t("charge.desc")} closeLabel={t("common.close")}>
        <Rows><Row label={t("charge.network")}>USDT (TRC-20)</Row></Rows>
        <Button onClick={() => setSheet(false)}>{t("charge.copy")}</Button>
        <div className="v-links"><TextLink onClick={() => setSheet(false)}>{t("common.close")}</TextLink></div>
      </Sheet>
      <Confirm open={confirm === "open"} onCancel={() => setConfirm(null)} onConfirm={() => setConfirm(null)} title={t("box.confirmTitle", { n: 50 })} desc={t("box.confirmDesc", { amount: fmt(50) })} confirmLabel={t("box.open", { n: 50, amount: fmt(50) })} cancelLabel={t("common.cancel")} />
      <Confirm open={confirm === "take"} onCancel={() => setConfirm(null)} onConfirm={() => setConfirm(null)} title={t("reveal.takeTitle")} desc={t("reveal.takeDesc", { name: "iPhone", amount: fmt(950) })} confirmLabel={t("reveal.take", { amount: fmt(950) })} cancelLabel={t("common.cancel")} />
      <Confirm open={confirm === "ship"} onCancel={() => setConfirm(null)} onConfirm={() => setConfirm(null)} title={t("ship.confirmTitle")} desc={t("ship.confirmDesc", { address: "Seoul" })} confirmLabel={t("ship.submit")} cancelLabel={t("common.cancel")} />
      <Confirm open={confirm === "cancel"} onCancel={() => setConfirm(null)} onConfirm={() => setConfirm(null)} title={t("inv.cancelTitle")} desc={t("inv.cancelDesc")} confirmLabel={t("inv.cancelShip")} cancelLabel={t("common.cancel")} />
      <VerifySheet record={verify ? { itemId: sample.item[0].item.id, fair: { serverSeed: "a".repeat(64), serverSeedHash: "b".repeat(64), clientSeed: "c".repeat(32), nonce: 0, roll: 0, dropTable: dropTable(box).map(({ id, dropRate }) => ({ id, dropRate })) } } : null} onClose={() => setVerify(false)} />
      <ShipSheet ownedIds={ship ? ["gallery-0"] : null} onClose={() => setShip(false)} onDone={() => setShip(false)} />
      {reveal && <Reveal box={box} results={sample[reveal]} cost={reveal === "multi" ? box.price * 5 : box.price} onClose={() => setReveal(null)} onAgain={() => setReveal(null)} againBusy={false} canAgain />}
    </div>
  );
}
