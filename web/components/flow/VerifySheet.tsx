"use client";
/**
 * 그 자리 검증. 결과를 받은 화면, 보관함, 나온 상품, 검증 화면의 기록 행에서 바로 연다.
 * 세 단계로 보여 준다(flow/MELT_SPEC.md S9):
 *   1. 열기 전에 잠근 값: 미리 잠근 해시. 이 테스트 사이트는 값을 이 브라우저에서 만들고 저장한다는 것을 그대로 적는다.
 *   2. 블록체인 기록: 실제 기록은 언제나 "블록체인 기록 없음"이다(lib/chainRecord). 지어낸 기록 주소를 내지 않는다.
 *   3. 다시 계산한 결과: 공개된 값, 내 기기 값, 회차로 번호를 이 브라우저에서 다시 계산하고 그 번호가 가리키는 상품이 받은 상품과 같은지 본다.
 * 계산은 옛 검증기와 같은 verifyOpeningRecord 를 쓴다. 추첨 계산은 건드리지 않는다.
 * 확률표는 그 기록이 개봉할 때 저장한 표다: 보관함에 같은 개봉의 기록이 있으면 부르는 쪽이 무엇을 실어 보냈든 그 기록의 표로 맞춘다(recordToVerify).
 * 당시 확률표가 없는 기록은 번호까지만 확인했다고 그대로 말한다(전부 확인했다고 하지 않는다).
 */
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { recordToVerify, verifyOpeningRecord, type RecordVerification, type VerifyInput } from "@/components/fairness/verifyRecord";
import { BOXES } from "@/lib/products";
import { chainRecordOf } from "@/lib/chainRecord";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useProductText } from "@/lib/useProductText";
import { Sheet } from "@/components/ui/Sheet";
import { Line, Row, Rows, TextLink } from "@/components/ui/kit";
import { ChainRecordView } from "@/components/verify/ChainRecord";
import { VerifyMethod } from "@/components/verify/VerifyMethod";

export type VerifyRecord = VerifyInput;
type Outcome = { state: "checking" } | { state: "done"; out: RecordVerification } | { state: "failed" };
type Target = ReturnType<typeof recordToVerify>;

const short = (hex: string) => (hex.length > 20 ? hex.slice(0, 10) + "…" + hex.slice(-8) : hex);

export function VerifySheet({ record, onClose }: { record: VerifyRecord | null; onClose: () => void }) {
  const t = useTranslations("v");
  const { itemName } = useProductText();
  const [outcome, setOutcome] = useState<Outcome>({ state: "checking" });
  const [method, setMethod] = useState(false);
  const products = useMemo(() => new Map(BOXES.flatMap((box) => box.items).map((item) => [item.id, item])), []);
  // 시트를 여는 순간의 보관함에서 같은 개봉의 기록을 찾는다. 있으면 그 기록의 값과 당시 확률표로 계산한다
  const target = useMemo<Target | null>(() => (record ? recordToVerify(record, useInventoryStore.getState().items) : null), [record]);

  useEffect(() => {
    if (!target) { setMethod(false); return; }
    let alive = true;
    setOutcome({ state: "checking" });
    verifyOpeningRecord(target)
      .then((out) => { if (alive) setOutcome({ state: "done", out }); })
      .catch(() => { if (alive) setOutcome({ state: "failed" }); });
    return () => { alive = false; };
  }, [target]);

  const done = outcome.state === "done" ? outcome.out : null;
  // 직접 계산 화면으로 값을 실어 보낸다(모바일에서 긴 값을 손으로 옮기지 않게). 박스는 저장된 기록의 박스, 기록이 없으면 상품 id 로 찾는다
  const boxSlug = target ? target.boxSlug ?? BOXES.find((b) => b.items.some((i) => i.id === target.itemId))?.slug ?? "" : "";
  const manualHref = target ? "/verify?" + new URLSearchParams({ s: target.fair.serverSeed, h: target.fair.serverSeedHash, c: target.fair.clientSeed, n: String(target.fair.nonce), box: boxSlug }).toString() : "/verify";
  const expected = done?.expectedItemId ? products.get(done.expectedItemId) : undefined;
  const verdict = !done ? null : !done.hashMatch || !done.rollMatch || done.itemMatch === false ? "bad" : done.itemMatch === null ? "partial" : "ok";

  return (
    <Sheet open={!!record} onClose={onClose} title={t("verify.title")} desc={t("verify.desc")} closeLabel={t("common.close")}>
      {record && target && (
        <>
          <section className="v-stack v-stack--sm" aria-labelledby="verify-step1">
            <h3 id="verify-step1" className="v-section">1. {t("verify.step1")}</h3>
            <Rows>
              <Row label={t("verify.locked")}><span title={target.fair.serverSeedHash}>{short(target.fair.serverSeedHash)}</span></Row>
            </Rows>
            <p className="v-small">{t("verify.localNote")}</p>
          </section>

          <section className="v-stack v-stack--sm" aria-labelledby="verify-step2">
            <h3 id="verify-step2" className="v-section">2. {t("verify.step2")}</h3>
            <ChainRecordView record={chainRecordOf(target)} />
          </section>

          <section className="v-stack v-stack--sm" aria-labelledby="verify-step3">
            <h3 id="verify-step3" className="v-section">3. {t("verify.step3")}</h3>
            <Rows>
              <Row label={t("verify.seed")}><span title={target.fair.serverSeed}>{short(target.fair.serverSeed)}</span></Row>
              <Row label={t("verify.client")}><span title={target.fair.clientSeed}>{short(target.fair.clientSeed)}</span></Row>
              <Row label={t("verify.round")}>{target.fair.nonce.toLocaleString("en-US")}</Row>
              <Row label={t("verify.table")}>{t(target.fair.dropTable?.length ? "verify.tableStored" : "verify.tableNone")}</Row>
              {outcome.state !== "failed" && <Row label={t("verify.number")}>{done ? done.roll.toLocaleString("en-US") : t("common.checking")}</Row>}
              {(outcome.state === "checking" || done?.expectedItemId) && <Row label={t("verify.item")}>{!done ? t("common.checking") : expected ? itemName(expected) : done.expectedItemId}</Row>}
            </Rows>
            {verdict && <Line fail={verdict === "bad"}>{t("verify." + verdict)}</Line>}
            {outcome.state === "failed" && <Line fail>{t("verify.failed")}</Line>}
          </section>

          <div className="v-links">
            <TextLink onClick={() => setMethod((v) => !v)}>{t("verify.methodLink")}</TextLink>
            <TextLink href={manualHref} onClick={onClose}>{t("verify.manual")}</TextLink>
          </div>
          {method && <VerifyMethod />}
        </>
      )}
    </Sheet>
  );
}
