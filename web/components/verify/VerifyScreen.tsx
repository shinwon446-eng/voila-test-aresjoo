"use client";
/**
 * 개봉 결과 검증. 결정 하나: 어느 기록을 다시 계산할지.
 * 위: 내 개봉 기록(보관함의 실제 기록, 누르면 그 자리 검증 시트. 시트가 기록 상세다: 잠근 값, 블록체인 기록, 다시 계산한 결과의 세 단계).
 * 가운데: 값을 직접 넣어 계산(공개된 값, 내 기기 값, 회차, 박스). 아래: 블록체인 검증 방식.
 * 계산은 전부 이 브라우저에서 한다. 직접 넣은 값은 지금의 확률표로 맞춰 보므로, 그 사실을 한 줄로 말한다.
 * 이 테스트 사이트는 값을 이 브라우저에서 만들고 저장하며 블록체인에 올리지 않는다. 화면도 그렇게 적는다(서버가 정한다고 적지 않는다).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { BOXES, BOX_BY_SLUG, dropTable, type ProductBox } from "@/lib/products";
import { calculateRollResult, determineItem, hashServerSeed } from "@/lib/fairness";
import { useProductText } from "@/lib/useProductText";
import { useAuthStore } from "@/stores/authStore";
import { useInventoryStore, type OwnedItem } from "@/stores/inventoryStore";
import { Button, Chips, Empty, Field, Line, Row, Rows, ScreenHead, Skeleton, TextLink } from "@/components/ui/kit";
import { VerifySheet, type VerifyRecord } from "@/components/flow/VerifySheet";
import { VerifyMethod } from "@/components/verify/VerifyMethod";

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
  const params = useSearchParams();
  // 결과 시트의 "값을 직접 넣어 검증" 이 값을 실어 보내면 미리 채우고 그 절로 내려간다
  useEffect(() => {
    const seed = params?.get("s"); if (!seed) return;
    setServerSeed(seed); setLockedHash(params?.get("h") ?? ""); setClientSeed(params?.get("c") ?? ""); setNonce(params?.get("n") ?? "");
    const slug = params?.get("box"); if (slug && BOXES.some((b) => b.slug === slug)) setBoxSlug(slug);
    document.getElementById("verify-manual")?.scrollIntoView({ block: "start" });
  }, [params]);

  const products = useMemo(() => new Map(BOXES.flatMap((box) => box.items).map((item) => [item.id, item])), []);
  // 업그레이드로 들어온 상품은 개봉 기록이 아니다(그 추첨은 보관함의 상품 상세에서 검증한다)
  const records = useMemo(() => items.filter((o) => !o.upgradedFrom).sort((a, b) => (Date.parse(b.acquiredAt) || 0) - (Date.parse(a.acquiredAt) || 0)), [items]);
  const date = (value: string) => (Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "");
  const nameOf = (o: OwnedItem) => { const p = products.get(o.itemId); return p ? itemName(p) : o.itemId; };

  // 지금 화면의 입력. 계산이 끝났을 때 시작할 때의 입력과 견줘, 그 사이에 바뀌었으면 그 계산의 결과를 버린다
  const inputs = useRef("");
  inputs.current = JSON.stringify([serverSeed, lockedHash, clientSeed, nonce, boxSlug]);
  const compute = async () => {
    const n = Number(nonce);
    if (!serverSeed.trim() || !clientSeed.trim() || !Number.isInteger(n) || n < 0) { setFailed(true); setManual(null); return; }
    const started = inputs.current;
    setBusy(true); setFailed(false);
    try {
      const box = BOXES.find((b) => b.slug === boxSlug) as ProductBox;
      const [hash, result] = await Promise.all([hashServerSeed(serverSeed.trim()), calculateRollResult(serverSeed.trim(), clientSeed.trim(), n)]);
      if (inputs.current !== started) return;
      const item = determineItem(result.roll, dropTable(box));
      setManual({ hash, hashMatch: lockedHash.trim() ? lockedHash.trim().toLowerCase() === hash : null, roll: result.roll, itemName: itemName(item) });
    } catch { if (inputs.current === started) { setFailed(true); setManual(null); } }
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
                    <button type="button" className="v-itemrow" aria-haspopup="dialog" onClick={() => setVerifying({ ownedId: o.id, itemId: o.itemId, fair: o.fair })}>
                      <span className="v-itemrow-body"><span className="v-card-title">{nameOf(o)}</span><span className="v-small">{t("verify.rowMeta", { box: BOX_BY_SLUG[o.boxSlug] ? boxTitle(BOX_BY_SLUG[o.boxSlug]) : o.boxSlug, date: date(o.acquiredAt), n: o.fair.nonce.toLocaleString("en-US") })}</span></span>
                      <span className="v-small">{t("verify.rowGo")} <span aria-hidden>›</span></span>
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

      {/* 블록체인 검증 방식: 세 단계(잠근 값, 블록체인 기록, 다시 계산한 결과)와 이 검증이 다루지 않는 것. 검증 시트의 링크가 같은 글을 연다 */}
      <section className="v-stack" aria-labelledby="verify-how">
        <h2 id="verify-how" className="v-section">{t("verify.methodLink")}</h2>
        <VerifyMethod />
      </section>

      <VerifySheet record={verifying} onClose={() => setVerifying(null)} />
    </div>
  );
}
