"use client";
/**
 * 그 자리 검증. 결과를 받은 화면에서 바로 연다.
 * 열기 전에 잠가 둔 값(해시)과 공개된 값, 내 기기 값, 회차로 번호를 이 브라우저에서 다시 계산하고,
 * 그 번호가 가리키는 상품이 받은 상품과 같은지 보여 준다. 계산은 lib/fairness 의 verifyRoll 그대로다.
 */
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { verifyRoll } from "@/lib/fairness";
import type { ProductItem } from "@/lib/products";
import { useProductText } from "@/lib/useProductText";
import { Sheet } from "@/components/ui/Sheet";
import { Line, Row, Rows, TextLink } from "@/components/ui/kit";

export interface VerifyRecord { serverSeed: string; serverSeedHash: string; clientSeed: string; nonce: number; roll: number; itemId: string; table: ProductItem[] }
type Outcome = { state: "checking" } | { state: "done"; ok: boolean; roll: number; item: ProductItem | null; hashOk: boolean } | { state: "failed" };

const short = (hex: string) => (hex.length > 20 ? hex.slice(0, 10) + "…" + hex.slice(-8) : hex);

export function VerifySheet({ record, onClose }: { record: VerifyRecord | null; onClose: () => void }) {
  const t = useTranslations("v");
  const { itemName } = useProductText();
  const [outcome, setOutcome] = useState<Outcome>({ state: "checking" });

  useEffect(() => {
    if (!record) return;
    let alive = true;
    setOutcome({ state: "checking" });
    verifyRoll({ serverSeed: record.serverSeed, serverSeedHash: record.serverSeedHash, clientSeed: record.clientSeed, nonce: record.nonce, items: record.table })
      .then((out) => { if (alive) setOutcome({ state: "done", roll: out.roll, item: out.item, hashOk: out.hashMatches === true, ok: out.hashMatches === true && out.roll === record.roll && out.item.id === record.itemId }); })
      .catch(() => { if (alive) setOutcome({ state: "failed" }); });
    return () => { alive = false; };
  }, [record]);

  return (
    <Sheet open={!!record} onClose={onClose} title={t("verify.title")} desc={t("verify.desc")} closeLabel={t("common.close")}>
      {record && (
        <>
          <Rows>
            <Row label={t("verify.locked")}><span title={record.serverSeedHash}>{short(record.serverSeedHash)}</span></Row>
            <Row label={t("verify.seed")}><span title={record.serverSeed}>{short(record.serverSeed)}</span></Row>
            <Row label={t("verify.client")}><span title={record.clientSeed}>{short(record.clientSeed)}</span></Row>
            <Row label={t("verify.round")}>{record.nonce.toLocaleString("en-US")}</Row>
            <Row label={t("verify.number")}>{outcome.state === "done" ? outcome.roll.toLocaleString("en-US") : t("common.checking")}</Row>
            <Row label={t("verify.item")}>{outcome.state === "done" && outcome.item ? itemName(outcome.item) : t("common.checking")}</Row>
          </Rows>
          {outcome.state === "done" && <Line fail={!outcome.ok}>{t(outcome.ok ? "verify.ok" : "verify.bad")}</Line>}
          {outcome.state === "failed" && <Line fail>{t("verify.failed")}</Line>}
          <div className="v-links"><TextLink href="/fairness">{t("verify.manual")}</TextLink></div>
        </>
      )}
    </Sheet>
  );
}
