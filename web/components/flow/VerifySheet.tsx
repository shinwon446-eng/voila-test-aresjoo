"use client";
/**
 * 그 자리 검증. 결과를 받은 화면에서 바로 연다.
 * 열기 전에 잠가 둔 값(해시)과 공개된 값, 내 기기 값, 회차로 번호를 이 브라우저에서 다시 계산하고,
 * 그 번호가 가리키는 상품이 받은 상품과 같은지 보여 준다.
 * 계산은 옛 검증기와 같은 verifyOpeningRecord 를 쓴다: 지난 기록은 구매 당시 저장한 확률표로만 맞춰 본다.
 * 당시 확률표가 없는 기록은 번호까지만 확인했다고 그대로 말한다(전부 확인했다고 하지 않는다).
 */
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { verifyOpeningRecord, type RecordVerification } from "@/components/fairness/verifyRecord";
import { BOXES } from "@/lib/products";
import type { OwnedItem } from "@/stores/inventoryStore";
import { useProductText } from "@/lib/useProductText";
import { Sheet } from "@/components/ui/Sheet";
import { Line, Row, Rows, TextLink } from "@/components/ui/kit";

export type VerifyRecord = Pick<OwnedItem, "fair" | "itemId">;
type Outcome = { state: "checking" } | { state: "done"; out: RecordVerification } | { state: "failed" };

const short = (hex: string) => (hex.length > 20 ? hex.slice(0, 10) + "…" + hex.slice(-8) : hex);

export function VerifySheet({ record, onClose }: { record: VerifyRecord | null; onClose: () => void }) {
  const t = useTranslations("v");
  const { itemName } = useProductText();
  const [outcome, setOutcome] = useState<Outcome>({ state: "checking" });
  const products = useMemo(() => new Map(BOXES.flatMap((box) => box.items).map((item) => [item.id, item])), []);

  useEffect(() => {
    if (!record) return;
    let alive = true;
    setOutcome({ state: "checking" });
    verifyOpeningRecord(record)
      .then((out) => { if (alive) setOutcome({ state: "done", out }); })
      .catch(() => { if (alive) setOutcome({ state: "failed" }); });
    return () => { alive = false; };
  }, [record]);

  const done = outcome.state === "done" ? outcome.out : null;
  const expected = done?.expectedItemId ? products.get(done.expectedItemId) : undefined;
  const verdict = !done ? null : !done.hashMatch || !done.rollMatch || done.itemMatch === false ? "bad" : done.itemMatch === null ? "partial" : "ok";

  return (
    <Sheet open={!!record} onClose={onClose} title={t("verify.title")} desc={t("verify.desc")} closeLabel={t("common.close")}>
      {record && (
        <>
          <Rows>
            <Row label={t("verify.locked")}><span title={record.fair.serverSeedHash}>{short(record.fair.serverSeedHash)}</span></Row>
            <Row label={t("verify.seed")}><span title={record.fair.serverSeed}>{short(record.fair.serverSeed)}</span></Row>
            <Row label={t("verify.client")}><span title={record.fair.clientSeed}>{short(record.fair.clientSeed)}</span></Row>
            <Row label={t("verify.round")}>{record.fair.nonce.toLocaleString("en-US")}</Row>
            <Row label={t("verify.number")}>{done ? done.roll.toLocaleString("en-US") : t("common.checking")}</Row>
            {(!done || done.expectedItemId) && <Row label={t("verify.item")}>{!done ? t("common.checking") : expected ? itemName(expected) : done.expectedItemId}</Row>}
          </Rows>
          {verdict && <Line fail={verdict === "bad"}>{t("verify." + verdict)}</Line>}
          {outcome.state === "failed" && <Line fail>{t("verify.failed")}</Line>}
          <div className="v-links"><TextLink href="/fairness">{t("verify.manual")}</TextLink></div>
        </>
      )}
    </Sheet>
  );
}
