"use client";
/**
 * 나온 상품(2026-10-12 파운더: 후기를 쓰지 않아도, 괜찮은 것이 실제로 나오면 새것부터 차곡차곡 쌓이는 화면. 기록마다 검증으로 가는 길).
 *  - 실제 개봉 기록만 오른다. 낸 값의 두 배 이상이 나온 개봉이 그 기준이다. 지어낸 이름이나 지어낸 기록으로 빈자리를 메우지 않는다.
 *  - 지금은 서버의 모두 기록이 없어 이 계정의 보관함 기록에서 만든다. 서버가 가린 이름의 기록을 주면 같은 줄 모양으로 그 자리에 들어간다.
 *  - 검증: 그 개봉의 잠가 둔 값과 번호를 실어 직접 계산하는 화면으로 보낸다(미리 잠근 해시 방식이다. 블록체인 기록이 아니므로 그렇게 적지 않는다).
 */
import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BOXES, dropTable } from "@/lib/products";
import { useCurrency } from "@/lib/useCurrency";
import { useProductText } from "@/lib/useProductText";
import { useAuthStore } from "@/stores/authStore";
import { useInventoryStore } from "@/stores/inventoryStore";
import { Empty, ScreenHead, TextLink } from "@/components/ui/kit";
import { stamp } from "./BoxReviews";

/** 여기 오르는 기준: 낸 값의 몇 배 이상 */
export const WIN_TIMES = 2;

export function WinsScreen() {
  const t = useTranslations("v");
  const { fmt } = useCurrency();
  const { itemName, boxTitle } = useProductText();
  const me = useAuthStore((s) => s.user);
  const owned = useInventoryStore((s) => s.items);
  const ready = useInventoryStore((s) => s.hydrated);
  useEffect(() => { void useInventoryStore.persist.rehydrate(); }, []);

  const rows = useMemo(() => owned.flatMap((o) => {
    const box = BOXES.find((b) => b.slug === o.boxSlug);
    const item = box ? dropTable(box).find((i) => i.id === o.itemId) : undefined;
    // 상품만 오른다(USDT 결과는 잔액에 바로 들어가는 값이라 여기 쌓지 않는다)
    if (!box || !item || item.kind === "cash" || o.valueUsdt < box.price * WIN_TIMES) return [];
    const href = o.fair?.serverSeed ? "/verify?" + new URLSearchParams({ s: o.fair.serverSeed, h: o.fair.serverSeedHash, c: o.fair.clientSeed, n: String(o.fair.nonce), box: box.slug }).toString() : null;
    return [{ id: o.id, box, item, value: o.valueUsdt, times: Math.floor(o.valueUsdt / box.price), at: o.acquiredAt, href }];
  }).sort((a, b) => b.at.localeCompare(a.at)), [owned]);
  // 이름은 가려 적는다: 닉네임이나 계정 이름의 앞 두 글자만
  const name = (me?.nickname?.trim() || me?.label || "").split("@")[0];
  const who = name ? name.slice(0, 2) + "***" : "";

  return (
    <div className="v-stack v-stack--lg">
      <ScreenHead back="/" backLabel={t("common.back")} title={t("wins.title")} desc={t("wins.desc", { n: WIN_TIMES })} />
      {!ready ? <Empty>{t("common.loading")}</Empty> : rows.length === 0 ? (
        <><Empty>{t("wins.none", { n: WIN_TIMES })}</Empty><div className="v-links"><TextLink href="/">{t("nav.boxes")}</TextLink></div></>
      ) : (
        <>
          <p className="v-small">{t("wins.scope")}</p>
          <ul className="v-wins">
            {rows.map((r) => (
              <li key={r.id} className="v-win">
                <span className="v-win-photo">{r.item.image.src && <img src={r.item.image.src} alt="" loading="lazy" decoding="async" />}</span>
                <span className="v-win-body">
                  <span className="v-card-title">{itemName(r.item)}</span>
                  <span className="v-num">{t("wins.line", { amount: fmt(r.value), n: r.times.toLocaleString("en-US") })}</span>
                  <span className="v-small"><Link href={"/box/" + r.box.slug} className="v-link">{boxTitle(r.box)}</Link></span>
                  <span className="v-small v-num">{who ? who + ", " : ""}{stamp(r.at)}</span>
                </span>
                {r.href && <Link href={r.href} className="v-win-verify">{t("wins.verify")}</Link>}
              </li>
            ))}
          </ul>
          <p className="v-small">{t("reviews.verifyNote")}</p>
        </>
      )}
    </div>
  );
}
