import type { Metadata, Viewport } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  // metadataBase: OG など相対 metadata URL を絶対 URL へ解決するための暫定基準 URL。
  // これは「公開サイトの正式 URL」ではない。正式ドメイン未確定のため Stage A(Vercel)を暫定使用する。
  // canonical には使用しない(canonical は siteConfig.siteUrl 確定後のみ出力する)。
  metadataBase: new URL("https://supitaro-site.vercel.app"),
  // TODO: siteUrl 確定後に canonical / OG URL が正式ドメインで解決される(config/site.ts で設定)
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-dvh flex-col bg-white font-sans text-night-900">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-deepblue-600 focus:px-4 focus:py-2 focus:font-bold focus:text-white"
        >
          本文へスキップ
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
