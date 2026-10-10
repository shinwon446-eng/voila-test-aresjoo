"use client";
import { Box, MousePointer2, PackageCheck } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { copyFor } from "@/lib/homeCopy";
/** 이용 방법: 제목 하나, 카드 하나 안에 세 줄. 번호와 단계 표시는 쓰지 않는다. */
export function DiscoveryGuide() {
  const copy = copyFor(useLocale());
  return <section className="discovery-guide page-shell" aria-labelledby="guide-title">
    <div className="guide-heading"><h2 id="guide-title">{copy.guideTitle}</h2><Link href="/about" className="text-link">{copy.guideMore}</Link></div>
    <ul className="guide-steps">{[Box, MousePointer2, PackageCheck].map((Icon, i) => <li key={i} className="guide-step"><Icon size={22} strokeWidth={1.5} aria-hidden /><div><h3>{copy.steps[i][0]}</h3><p>{copy.steps[i][1]}</p></div></li>)}</ul>
  </section>;
}
