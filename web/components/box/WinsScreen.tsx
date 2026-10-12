"use client";
/**
 * 나온 상품(2026-10-12 파운더: 후기를 쓰지 않아도, 괜찮은 것이 실제로 나오면 새것부터 차곡차곡 쌓이는 화면. flow/MELT_SPEC.md S8).
 *  - 기준과 줄은 lib/wins 가 만든다: 참고가가 그때의 박스 1회 가격의 2배 이상인 상품. 무료 개봉도 정상 가격으로 본다.
 *    USDT 로 받았거나 배송을 신청한 뒤에도 줄은 남는다.
 *  - 실제 개봉 기록만 오른다. 이 기기에서 이 계정으로 연 보관함 기록이 전부다. 다른 사람의 줄, 예시, 샘플로 빈자리를 메우지 않는다.
 *    범위 한 줄은 목록이 비어도 보인다. 로그인하지 않았으면 줄 없이 로그인만 권한다.
 *  - 줄을 누르면 상세(박스, 그때의 1회 가격, 참고가, 배수, 무료 개봉 여부. 모르는 옛 기록은 "기록 없음")가 뜨고, 거기서 "개봉 결과 검증"이 그 기록의 값과 당시 확률표로 검증 시트를 연다.
 *    상세와 검증은 같은 자리에서 바뀐다(시트를 겹쳐 쌓지 않는다).
 *  - 30건씩 "더 보기".
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Package } from "lucide-react";
import { BOX_BY_SLUG } from "@/lib/products";
import { timesOf } from "@/lib/openingFlow";
import { WINS_PAGE, WIN_TIMES, maskedName, winRows } from "@/lib/wins";
import { useCurrency } from "@/lib/useCurrency";
import { useProductText } from "@/lib/useProductText";
import { useAuthStore } from "@/stores/authStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useWalletStore } from "@/stores/walletStore";
import { Button, ButtonLink, Empty, Line, Row, Rows, ScreenHead, Skeleton, TextLink } from "@/components/ui/kit";
import { Sheet } from "@/components/ui/Sheet";
import { VerifySheet, type VerifyRecord } from "@/components/flow/VerifySheet";
import { stamp } from "./BoxReviews";

export function WinsScreen() {
  const t = useTranslations("v");
  const { fmt } = useCurrency();
  const { itemName, boxTitle } = useProductText();
  const me = useAuthStore((s) => s.user);
  const authReady = useAuthStore((s) => s.hydrated);
  const openLogin = useAuthStore((s) => s.openAuthModal);
  const owned = useInventoryStore((s) => s.items);
  const ready = useInventoryStore((s) => s.hydrated);
  const transactions = useWalletStore((s) => s.transactions);
  const [shown, setShown] = useState(WINS_PAGE);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<VerifyRecord | null>(null);
  useEffect(() => { void useInventoryStore.persist.rehydrate(); }, []);

  const rows = useMemo(() => winRows(owned, { loggedIn: !!me, opens: transactions }), [owned, me, transactions]);
  const who = maskedName(me);
  const productOf = (boxSlug: string, itemId: string) => BOX_BY_SLUG[boxSlug]?.items.find((i) => i.id === itemId);
  const detail = detailId ? rows.find((r) => r.id === detailId) ?? null : null;
  const detailBox = detail ? BOX_BY_SLUG[detail.boxSlug] : undefined;
  const detailItem = detail ? productOf(detail.boxSlug, detail.itemId) : undefined;
  const detailTimes = detail ? timesOf(detail.value, detail.price) : null;
  /** 상세에서 검증으로: 상세를 닫고 같은 자리에 그 기록의 검증 시트를 연다. 보관 상품의 ID 로 그 기록을 가리킨다(시드와 회차가 같은 다른 상품을 집지 않게) */
  const verify = () => { if (!detail) return; setVerifying({ ownedId: detail.record.id, itemId: detail.record.itemId, fair: detail.record.fair }); setDetailId(null); };
  /** 줄바꿈 금지는 숫자(금액, 시각, 배수)에만 건다. 줄 전체에 걸면 긴 영어 줄이 화살표 밖으로 넘치고, 걸지 않으면 중국어에서 숫자와 단위("2 倍")가 갈라진다. 문구의 num 표시가 그 자리다 */
  const num = (chunks: ReactNode) => <span className="v-num">{chunks}</span>;

  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead back="/" backLabel={t("common.back")} title={t("wins.title")} desc={t.rich("wins.desc", { n: WIN_TIMES, num })} />
      {!ready || !authReady ? <Skeleton height={120} label={t("common.loading")} />
        : !me ? <div className="v-stack"><Line>{t("wins.loginLine")}</Line><Button onClick={() => openLogin("login")}>{t("nav.login")}</Button></div>
        : (
          <>
            {/* 범위 한 줄: 목록이 비어도 보인다 */}
            <p className="v-small">{t("wins.scope")}</p>
            {rows.length === 0 ? (
              <><Empty>{t.rich("wins.none", { n: WIN_TIMES, num })}</Empty><ButtonLink href="/">{t("state.toBoxes")}</ButtonLink></>
            ) : (
              <>
                <ul className="v-itemrows">
                  {rows.slice(0, shown).map((r) => {
                    const item = productOf(r.boxSlug, r.itemId);
                    const box = BOX_BY_SLUG[r.boxSlug];
                    return (
                      <li key={r.id}>
                        <button type="button" className="v-itemrow" onClick={() => setDetailId(r.id)} aria-haspopup="dialog">
                          <span className="v-itemrow-photo">{item?.image.src ? <img src={item.image.src} alt="" loading="lazy" decoding="async" /> : <span className="v-item-glyph" aria-hidden><Package size={22} strokeWidth={1.4} /></span>}</span>
                          <span className="v-itemrow-body">
                            <span className="v-card-title">{item ? itemName(item) : r.itemId}</span>
                            <span className="v-small">{t.rich("wins.value", { amount: fmt(r.value), num })}</span>
                            <span className="v-small">{box ? boxTitle(box) : r.boxSlug}</span>
                            <span className="v-small">{who ? t.rich("wins.byline", { who, at: stamp(r.at), num }) : num(stamp(r.at))}</span>
                          </span>
                          <span aria-hidden>›</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {rows.length > shown && <div className="v-links"><TextLink onClick={() => setShown((n) => n + WINS_PAGE)}>{t("wins.more")}</TextLink></div>}
              </>
            )}
          </>
        )}

      <Sheet open={!!detail} onClose={() => setDetailId(null)} title={detail ? (detailItem ? itemName(detailItem) : detail.itemId) : ""} closeLabel={t("common.close")}>
        {detail && (
          <>
            {detailItem?.image.src && <div className="v-sheet-photo"><img src={detailItem.image.src} alt="" /></div>}
            {detailItem?.image.src && detailItem.image.generated && <p className="v-small">{t("box.genNote")}</p>}
            <Rows>
              <Row label={t("wins.box")}>{detailBox ? boxTitle(detailBox) : detail.boxSlug}</Row>
              <Row label={t(detail.priceStored ? "wins.priceThen" : "wins.priceNow")}>{fmt(detail.price)}</Row>
              <Row label={t("reveal.value")}>{fmt(detail.value)}</Row>
              {detailTimes !== null && <Row label={t("wins.times")}>{t("wins.timesV", { n: detailTimes.toLocaleString("en-US") })}</Row>}
              {/* 무료 여부를 알 수 없는 옛 기록도 행을 빼지 않는다. 모른다고 적는다 */}
              <Row label={t("wins.free")}>{t(detail.free === null ? "wins.freeUnknown" : detail.free ? "wins.freeYes" : "wins.freeNo")}</Row>
              <Row label={t("wins.at")}>{stamp(detail.at)}</Row>
            </Rows>
            {!detail.priceStored && <p className="v-small">{t("wins.priceNowNote")}</p>}
            <Button onClick={verify} aria-haspopup="dialog">{t("nav.verify")}</Button>
            {detailBox && <div className="v-links"><TextLink href={"/box/" + detailBox.slug}>{t("reviews.toBox", { box: boxTitle(detailBox) })}</TextLink></div>}
          </>
        )}
      </Sheet>
      <VerifySheet record={verifying} onClose={() => setVerifying(null)} />
    </div>
  );
}
