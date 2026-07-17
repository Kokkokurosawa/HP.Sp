import type { NextConfig } from "next";

// R2（Sprint 27 D-08）: 全 locale を app/[locale] に統合しつつ、日本語だけ接頭辞なし URL で公開する。
// - rewrites: 公開 URL（/ /profile /gallery /news）を内部の /ja/* へ「書き換え」て配信する
//   （ブラウザの URL は変わらない・言語自動判定はしない・内部ルーティング専用）。
// - redirects: /ja・/ja/* を接頭辞なし URL へ正規化し、/ja を公開 URL にしない（重複コンテンツ回避）。
// middleware は追加しない（静的解決）。News は ja のみのため /news も対象に含める。
const jaPaths = ["profile", "gallery", "news"] as const;

const nextConfig: NextConfig = {
  async rewrites() {
    // 日本語の接頭辞なし URL（/ /profile /gallery /news）を内部の /ja/* へ書き換えて配信する。
    // 未マッチ path（/no-such-page・/fr・/zh 等）はグローバル app/not-found.tsx が 404 で受けるため、
    // fallback rewrite は不要（rewrite は接頭辞なし ja の配信専用に限定する）。
    return [
      { source: "/", destination: "/ja" },
      ...jaPaths.map((p) => ({ source: `/${p}`, destination: `/ja/${p}` })),
    ];
  },
  async redirects() {
    return [
      { source: "/ja", destination: "/", permanent: false },
      ...jaPaths.map((p) => ({
        source: `/ja/${p}`,
        destination: `/${p}`,
        permanent: false,
      })),
    ];
  },
};

export default nextConfig;
