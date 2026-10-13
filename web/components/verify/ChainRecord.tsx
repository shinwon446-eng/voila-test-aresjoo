"use client";
/**
 * 개봉 결과 검증의 둘째 단계 "블록체인 기록" 한 칸(flow/MELT_SPEC.md S9).
 * 상태 다섯(none, pending, confirmed, mismatch, error)을 색이 아니라 글로 말한다. 빨강은 다름과 불러오기 실패의 한 줄에만 쓴다.
 * 사용자 화면은 lib/chainRecord 의 chainRecordOf(실제 기록은 언제나 none)만 넘긴다.
 * 나머지 상태는 개발용 화면(/dev/gallery)의 고정 자료로만 그린다. 지어낸 기록 주소를 사용자 화면에 내지 않는다.
 */
import { useTranslations } from "next-intl";
import { chainView, type ChainRecord } from "@/lib/chainRecord";

const short = (text: string) => (text.length > 24 ? text.slice(0, 12) + "…" + text.slice(-8) : text);

/** noneBody: 기록이 없을 때의 설명을 부르는 쪽의 말로 바꾼다(업그레이드 결과 검증은 "열기 전" 대신 "걸기 전"이라고 쓴다) */
export function ChainRecordView({ record, onRetry, noneBody }: { record: ChainRecord; onRetry?: () => void; noneBody?: string }) {
  const t = useTranslations("v");
  const view = chainView(record);
  return (
    <div className="v-stack v-stack--sm" data-chain-state={view.state}>
      <dl className="v-rows">
        <div className="v-row"><dt>{t("verify.chain.status")}</dt><dd>{t(view.status)}</dd></div>
        {view.chain && <div className="v-row"><dt>{t("verify.chain.network")}</dt><dd>{view.chain}</dd></div>}
        {view.address && <div className="v-row"><dt>{t("verify.chain.address")}</dt><dd className="v-num" title={view.address}>{short(view.address)}</dd></div>}
      </dl>
      {view.fail ? <p role="alert" className="v-line v-line--fail">{t(view.body)}</p>
        : view.success ? <p className="v-line">{t(view.body)}</p>
        : <p className="v-small">{view.state === "none" && noneBody ? noneBody : t(view.body)}</p>}
      {(view.url || (view.retry && onRetry)) && (
        <div className="v-links">
          {view.url && <a href={view.url} target="_blank" rel="noreferrer" className="v-link">{t("verify.chain.view")} ↗</a>}
          {view.retry && onRetry && <button type="button" className="v-link" onClick={onRetry}>{t("verify.chain.retry")}</button>}
        </div>
      )}
    </div>
  );
}
