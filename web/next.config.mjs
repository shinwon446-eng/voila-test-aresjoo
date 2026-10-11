import createNextIntlPlugin from "next-intl/plugin";
import fs from "node:fs";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const isPages = process.env.GITHUB_PAGES === "true";
// 홈 배너에 쓸 그림(public/assets/hero 의 card-1.webp, card-2.webp, card-3.webp, orb.webp) 가운데 실제로 있는 것
const heroFiles = fs.existsSync("./public/assets/hero") ? fs.readdirSync("./public/assets/hero").filter((name) => name.endsWith(".webp")).join(",") : "";

const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  // 정적 데모(Pages)에는 서버가 없으므로 클라이언트가 로컬 엔진 폴백으로 전환된다
  env: { NEXT_PUBLIC_STATIC_DEMO: isPages ? "true" : "", NEXT_PUBLIC_BASE_PATH: isPages ? "/voila-test-aresjoo" : "", NEXT_PUBLIC_HERO_FILES: heroFiles },
  // GitHub Pages 정적 배포: https://<owner>.github.io/voila-test-aresjoo/
  ...(isPages
    ? {
        output: "export",
        basePath: "/voila-test-aresjoo",
        assetPrefix: "/voila-test-aresjoo/",
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
};

export default withNextIntl(nextConfig);
