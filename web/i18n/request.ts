import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = (routing.locales as readonly string[]).includes(requested ?? "")
    ? (requested as Locale)
    : routing.defaultLocale;
  return {
    locale,
    // v: 전면 개편에서 새로 쓰는 문구 묶음(messages/v.<locale>.json). 옛 묶음은 화면을 옮기면서 지운다.
    messages: { ...(await import(`../messages/${locale}.json`)).default, v: (await import(`../messages/v.${locale}.json`)).default },
  };
});
