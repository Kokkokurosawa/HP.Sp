import type { Metadata, Viewport } from "next";
import "../globals.css";
import { siteConfig } from "@/config/site";
import { htmlLang, isLocale, locales } from "@/lib/i18n/locales";
import { getOptionalSiteUrl } from "@/lib/seo/site-url";

// R2: app/[locale] を唯一のルートレイアウトにする（Sprint 27 D-08）。
// 対応 locale のみ静的生成し、不明 locale（/zh・/fr・/ja 以外の未知）は 404。
export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// metadataBase は SITE_URL（Server 専用）から解決する（Sprint 41・Stage A ハードコードを撤去）。
// 未設定時は metadataBase を出さず、正式 URL の代わりに Stage A を fallback しない（相対 OG 画像は
// Next 既定で解決され警告が出るが、Stage A URL を正規 URL として出力しない）。
// canonical / hreflang / og:url は各ページ generateMetadata が SITE_URL 設定時のみ出力する（root では出さない）。
// root の openGraph / twitter は News・404 など未上書きページ向けの日本語既定（title/description を持つページは上書き）。
export const metadata: Metadata = {
  // SITE_URL 未設定なら null（Next は未設定扱い）。Stage A へ fallback しない。
  metadataBase: getOptionalSiteUrl(),
  title: {
    default: siteConfig.siteName,
    template: `%s | ${siteConfig.siteName}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.siteName,
    description: siteConfig.description,
    siteName: siteConfig.siteName,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: siteConfig.images.og.src,
        width: 1466,
        height: 643,
        alt: siteConfig.images.og.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.siteName,
    description: siteConfig.description,
    images: [siteConfig.images.og.src],
  },
};

export const viewport: Viewport = {
  themeColor: "#e3f2fb",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  // <html lang> は locale ごとに正しく出す（内部値 → BCP-47）。不明 locale は ja にフォールバック
  // （不明 locale はページ側で notFound() され 404 になる。ここでの lang は 404 文書の言語）。
  const lang = isLocale(locale) ? htmlLang(locale) : "ja";
  // 共通 chrome（skip/Header/main/Footer/言語切替）は各ページが SiteShell 経由で自分の routeKey
  // 付きで描画する（言語切替を現在 route 対応にするため。§SiteShell）。layout は html/body のみ。
  return (
    <html lang={lang} className="h-full antialiased">
      <body className="flex min-h-dvh flex-col bg-white font-sans text-night-900">
        {children}
      </body>
    </html>
  );
}
