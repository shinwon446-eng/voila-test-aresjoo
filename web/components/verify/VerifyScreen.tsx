"use client";
/**
 * 개봉 결과 검증. 결정 하나: 어느 기록을 다시 계산할지.
 * 위: 내 개봉 기록(보관함의 실제 기록, 누르면 그 자리 검증 시트). 아래: 값을 직접 넣어 계산(공개된 값, 내 기기 값, 회차, 박스).
 * 계산은 전부 이 브라우저에서 한다. 직접 넣은 값은 지금의 확률표로 맞춰 보므로, 그 사실을 한 줄로 말한다.
 */
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BOXES, dropTable, type ProductBox } from "@/lib/products";
import { calculateRollResult, determineItem, hashServerSeed } from "@/lib/fairness";
import { useProductText } from "@/lib/useProductText";
import { useAuthStore } from "@/stores/authStore";
import { useInventoryStore, type OwnedItem } from "@/stores/inventoryStore";
import { Button, Chips, Empty, Field, Line, Row, Rows, ScreenHead, Skeleton, TextLink } from "@/components/ui/kit";
import { VerifySheet, type VerifyRecord } from "@/components/flow/VerifySheet";

const PAGE = 20;
type Manual = { hash: string; hashMatch: boolean | null; roll: number; itemName: string };

export function VerifyScreen() {
  const t = useTranslations("v");
  const locale = useLocale();
  const { itemName, boxTitle } = useProductText();
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.hydrated);
  const openLogin = useAuthStore((s) => s.openAuthModal);
  const items = useInventoryStore((s) => s.items);
  const hydrated = useInventoryStore((s) => s.hydrated);
  const [shown, setShown] = useState(PAGE);
  const [verifying, setVerifying] = useState<VerifyRecord | null>(null);
  const [serverSeed, setServerSeed] = useState("");
  const [lockedHash, setLockedHash] = useState("");
  const [clientSeed, setClientSeed] = useState("");
  const [nonce, setNonce] = useState("");
  const [boxSlug, setBoxSlug] = useState<string>(BOXES[0].slug);
  const [manual, setManual] = useState<Manual | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const products = useMemo(() => new Map(BOXES.flatMap((box) => box.items).map((item) => [item.id, item])), []);
  const records = useMemo(() => [...items].sort((a, b) => (Date.parse(b.acquiredAt) || 0) - (Date.parse(a.acquiredAt) || 0)), [items]);
  const date = (value: string) => (Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "");
  const nameOf = (o: OwnedItem) => { const p = products.get(o.itemId); return p ? itemName(p) : o.itemId; };

  const compute = async () => {
    const n = Number(nonce);
    if (!serverSeed.trim() || !clientSeed.trim() || !Number.isInteger(n) || n < 0) { setFailed(true); setManual(null); return; }
    setBusy(true); setFailed(false);
    try {
      const box = BOXES.find((b) => b.slug === boxSlug) as ProductBox;
      const [hash, result] = await Promise.all([hashServerSeed(serverSeed.trim()), calculateRollResult(serverSeed.trim(), clientSeed.trim(), n)]);
      const item = determineItem(result.roll, dropTable(box));
      setManual({ hash, hashMatch: lockedHash.trim() ? lockedHash.trim().toLowerCase() === hash : null, roll: result.roll, itemName: itemName(item) });
    } catch { setFailed(true); setManual(null); }
    finally { setBusy(false); }
  };

  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead title={t("verify.title")} desc={t("verify.desc")} />

      <section className="v-stack" aria-labelledby="verify-records">
        <h2 id="verify-records" className="v-section">{t("verify.records")}</h2>
        {!ready || !hydrated ? <Skeleton height={120} label={t("common.loading")} />
          : !user ? <div className="v-stack"><Line>{t("verify.loginLine")}</Line><Button onClick={() => openLogin("login")}>{t("nav.login")}</Button></div>
          : records.length === 0 ? <Empty>{t("verify.noRecords")}</Empty>
          : (
            <>
              <ul className="v-itemrows">
                {records.slice(0, shown).map((o) => (
                  <li key={o.id}>
                    <button type="button" className="v-itemrow" onClick={() => setVerifying({ itemId: o.itemId, fair: o.fair })}>
                      <span className="v-itemrow-body"><span className="v-card-title">{nameOf(o)}</span><span className="v-small">{BOXES.find((b) => b.slug === o.boxSlug) ? boxTitle(BOXES.find((b) => b.slug === o.boxSlug)!) : o.boxSlug}, {date(o.acquiredAt)}</span></span>
                      <span className="v-num v-small">{t("verify.round")} {o.fair.nonce.toLocaleString("en-US")}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {records.length > shown && <div className="v-links"><TextLink onClick={() => setShown((n) => n + PAGE)}>{t("inv.more", { n: records.length - shown })}</TextLink></div>}
            </>
          )}
      </section>

      <section className="v-stack" aria-labelledby="verify-manual">
        <h2 id="verify-manual" className="v-section">{t("verify.manualTitle")}</h2>
        <p className="v-desc">{t("verify.manualDesc")}</p>
        <Field label={t("verify.seed")} value={serverSeed} onChange={(e) => setServerSeed(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
        <Field label={t("verify.lockedOptional")} value={lockedHash} onChange={(e) => setLockedHash(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
        <Field label={t("verify.client")} value={clientSeed} onChange={(e) => setClientSeed(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
        <Field label={t("verify.round")} inputMode="numeric" value={nonce} onChange={(e) => setNonce(e.target.value)} />
        <Chips scroll label={t("verify.box")} value={boxSlug} onChange={setBoxSlug} options={BOXES.map((b) => ({ value: b.slug, label: boxTitle(b) }))} />
        {failed && <Line fail>{t("verify.inputFail")}</Line>}
        <Button onClick={compute} busy={busy} busyLabel={t("common.checking")}>{t("verify.compute")}</Button>
        {manual && (
          <>
            <Rows>
              <Row label={t("verify.hash")}><span title={manual.hash}>{manual.hash.slice(0, 10)}…{manual.hash.slice(-8)}</span></Row>
              {manual.hashMatch !== null && <Row label={t("verify.locked")}>{manual.hashMatch ? t("verify.hashOk") : t("verify.hashBad")}</Row>}
              <Row label={t("verify.number")}>{manual.roll.toLocaleString("en-US")}</Row>
              <Row label={t("verify.item")}>{manual.itemName}</Row>
            </Rows>
            <p className="v-small">{t("verify.currentTableNote")}</p>
          </>
        )}
      </section>

      <section className="v-stack" aria-labelledby="verify-how">
        <h2 id="verify-how" className="v-section">{t("verify.howTitle")}</h2>
        {/* 값이 문장이라 행(라벨 왼쪽, 값 오른쪽)이 아니라 라벨 위, 문장 아래로 쌓는다 */}
        <div className="v-card v-stack v-stack--sm">
          {(["how1", "how2", "how3"] as const).map((k) => <div key={k} className="v-step"><span className="v-small">{t("verify." + k)}</span><p className="v-body">{t("verify." + k + "v")}</p></div>)}
        </div>
        <p className="v-small">{t("verify.scope")}</p>
      </section>

      <VerifySheet record={verifying} onClose={() => setVerifying(null)} />
    </div>
  );
}
