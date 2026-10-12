"use client";
/**
 * "블록체인 검증 방식" 설명(flow/MELT_SPEC.md S9). 검증 시트의 링크와 /verify 화면 아래가 같은 글을 쓴다.
 * 세 단계를 한 문장씩, 이 테스트 사이트가 지금 하는 일 한 줄, 이 검증이 다루지 않는 것 한 줄.
 * 값이 문장이라 행(라벨 왼쪽, 값 오른쪽)이 아니라 라벨 위, 문장 아래로 쌓는다.
 */
import { useTranslations } from "next-intl";

const STEPS = ["step1", "step2", "step3"] as const;

export function VerifyMethod() {
  const t = useTranslations("v");
  return (
    <>
      <ol className="v-card v-stack v-stack--sm">
        {STEPS.map((k, i) => (
          <li key={k} className="v-step"><span className="v-small">{i + 1}. {t("verify." + k)}</span><p className="v-body">{t("verify.method." + k)}</p></li>
        ))}
      </ol>
      <p className="v-small">{t("verify.localNote")}</p>
      <p className="v-small">{t("verify.method.notCovered")}</p>
    </>
  );
}
