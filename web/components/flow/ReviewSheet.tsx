"use client";
/**
 * 후기 쓰기 시트. 받은 상품(보관함의 실제 개봉 기록)에만 쓴다. 가짜 후기가 생길 길이 없다.
 * 결정 하나: 보내기. 별점은 알약 다섯, 글 한 칸, 사진 한 장(선택). 실패는 그 자리 한 줄.
 */
import { useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { REVIEW_MAX_CHARS, REVIEW_MIN_CHARS } from "@/lib/community";
import { useCommunityStore } from "@/stores/communityStore";
import type { OwnedItem } from "@/stores/inventoryStore";
import { Button, Chips, Line } from "@/components/ui/kit";
import { Sheet } from "@/components/ui/Sheet";

/** 사진은 저장소에 data URL 로 들어간다. 너무 크면 저장소가 터지므로 긴 변 1,000px, 품질 0.8 로 줄인다 */
const PHOTO_MAX_PX = 1000;

async function shrink(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, PHOTO_MAX_PX / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", 0.8);
  } finally { URL.revokeObjectURL(url); }
}

export function ReviewSheet({ item, itemName, onClose, onDone }: { item: OwnedItem | null; itemName: string; onClose: () => void; onDone: () => void }) {
  const t = useTranslations("v");
  const add = useCommunityStore((s) => s.add);
  const [rating, setRating] = useState<number>(5);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [failed, setFailed] = useState<"short" | "photo" | "save" | null>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setPhoto(await shrink(file)); setFailed(null); } catch { setFailed("photo"); }
  };
  const send = () => {
    if (!item) return;
    if (text.trim().length < REVIEW_MIN_CHARS) { setFailed("short"); return; }
    setBusy(true);
    try { add({ ownedId: item.id, boxSlug: item.boxSlug, itemId: item.itemId, text, rating, photo, bonusUsdt: 0 }); setText(""); setPhoto(undefined); onDone(); }
    catch { setFailed("save"); }
    finally { setBusy(false); }
  };

  return (
    <Sheet open={!!item} onClose={onClose} title={t("review.title")} desc={t("review.desc", { name: itemName })} closeLabel={t("common.close")}>
      <Chips label={t("review.rating")} value={rating} onChange={setRating} options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: t("review.stars", { n }) }))} />
      <label className="v-field">
        <span className="v-field-label">{t("review.text")}</span>
        <textarea className="v-input v-input--area" maxLength={REVIEW_MAX_CHARS} rows={4} value={text} onChange={(e) => { setText(e.target.value); if (failed === "short") setFailed(null); }} placeholder={t("review.textHint", { n: REVIEW_MIN_CHARS })} />
      </label>
      <label className="v-field">
        <span className="v-field-label">{t("review.photo")}</span>
        <input type="file" accept="image/*" className="v-input v-input--file" onChange={pick} />
      </label>
      {photo && <span className="v-review-photo"><img src={photo} alt="" /></span>}
      {failed === "short" && <Line fail>{t("review.tooShort", { n: REVIEW_MIN_CHARS })}</Line>}
      {failed === "photo" && <Line fail>{t("review.photoFail")}</Line>}
      {failed === "save" && <Line fail>{t("review.saveFail")}</Line>}
      <Button onClick={send} busy={busy} busyLabel={t("common.checking")}>{t("review.send")}</Button>
      <p className="v-small">{t("review.proofNote")}</p>
    </Sheet>
  );
}
