import { getTranslations, setRequestLocale } from "next-intl/server";
import { AppShell } from "@/components/shell/AppShell";
import { Card, ScreenHead, TextLink } from "@/components/ui/kit";
import { GuideFees } from "@/components/shell/GuideFees";

/** 이용 방법: 읽는 화면. 설득 문구 없이 순서 셋과 알아 둘 값만 적는다. */
export default async function GuidePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "v" });
  return (
    <AppShell>
      <div className="v-stack v-stack--lg">
        <ScreenHead title={t("guide.title")} desc={t("guide.desc")} />
        <div className="v-stack">
          {(["pick", "open", "get"] as const).map((key) => (
            <Card key={key}><h2 className="v-card-title">{t("guide." + key + "Title")}</h2><p className="v-sub">{t("guide." + key + "Body")}</p></Card>
          ))}
        </div>
        <section className="v-stack" aria-labelledby="guide-facts">
          <h2 id="guide-facts" className="v-section">{t("guide.facts")}</h2>
          <GuideFees />
          <p className="v-small">{t("guide.verifyBody")}</p>
        </section>
        <div className="v-links"><TextLink href="/fairness">{t("nav.verify")}</TextLink><TextLink href="/legal">{t("nav.legal")}</TextLink></div>
      </div>
    </AppShell>
  );
}
