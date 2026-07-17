import type { Metadata, Viewport } from "next";
import "../globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { resolveNav } from "@/components/i18n/resolveNav";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/content/i18n";
import { defaultLocale, htmlLang, isLocale, locales } from "@/lib/i18n/locales";

// R2: app/[locale] を唯一のルートレイアウトにする（Sprint 27 D-08）。
// 対応 locale のみ静的生成し、不明 locale（/zh・/fr・/ja 以外の未知）は 404。
export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// metadata の既存挙動を維持（言語別 title/description・canonical・hreflang は後続 Sprint）。
// metadataBase は暫定 Stage A（正式ドメインではない）。canonical は siteUrl 確定後のみ出力。
export const metadata: Metadata = {
  metadataBase: new URL("https://supitaro-site.vercel.app"),
  ...(siteConfig.siteUrl ? { alternates: { canonical: "/" } } : {}),
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
  // 共通 UI 定型文は locale 辞書から解決する（dynamicParams=false なので locale は常に有効。
  // 型のため defaultLocale で narrow。runtime で日本語へ黙示 fallback はしない設計）。
  const dict = getDictionary(isLocale(locale) ? locale : defaultLocale);
  const nav = resolveNav(dict);
  return (
    <html lang={lang} className="h-full antialiased">
      <body className="flex min-h-dvh flex-col bg-white font-sans text-night-900">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-deepblue-600 focus:px-4 focus:py-2 focus:font-bold focus:text-white"
        >
          {dict.accessibility.skipToContent}
        </a>
        <Header
          nav={nav}
          navLabel={dict.navigation.mainNavigationLabel}
          homeLabel={dict.common.home}
          menu={{
            navLabel: dict.navigation.mobileNavigationLabel,
            open: dict.accessibility.openMenu,
            close: dict.accessibility.closeMenu,
          }}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer nav={nav} menuHeading={dict.navigation.footerNavigationLabel} />
      </body>
    </html>
  );
}
