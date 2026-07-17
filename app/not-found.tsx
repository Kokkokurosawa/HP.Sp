import type { Metadata } from "next";
import "./globals.css";
import Button from "@/components/Button";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { resolveNav } from "@/components/i18n/resolveNav";
import { getDictionary } from "@/content/i18n";

/**
 * グローバル 404（app/[locale] を唯一のルートレイアウトにした R2 構成では、未マッチ path は
 * ルートレイアウトを持たない = ここが自前で <html>/<body> を描く必要がある）。
 * Sprint 24 のカスタム日本語 404（HTTP 404・日本語見出し・Header/Footer・トップへ戻る）を
 * 自己完結の文書として維持し、Next.js 既定の英語 404（Blocker B1）を出さない。
 * 言語別 404 本文は後続 Sprint（本 Sprint では日本語 404 を全 locale 共通で維持）。
 */
export const metadata: Metadata = {
  title: "ページが見つかりません | すぴたろう公式サイト",
};

export default function GlobalNotFound() {
  // 404 は locale を持たないグローバルフォールバック（B1 回避のため常に日本語 chrome）。
  // Header/Footer は共通コンポーネント化されたので、ja 辞書で解決した文字列を渡す（本文は日本語のまま）。
  const dict = getDictionary("ja");
  const nav = resolveNav(dict);
  return (
    <html lang="ja" className="h-full antialiased">
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
          <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-24">
            <p className="text-sm font-bold tracking-[0.3em] text-deepblue-600">
              404
            </p>
            <h1 className="mt-4 text-2xl font-bold text-night-900 sm:text-3xl">
              ページが見つかりません
            </h1>
            <p className="mt-4 leading-relaxed text-night-800/80">
              お探しのページは、移動したか、まだ存在しないようです。
            </p>
            <div className="mt-8">
              <Button href="/">トップへ戻る</Button>
            </div>
          </div>
        </main>
        <Footer nav={nav} menuHeading={dict.navigation.footerNavigationLabel} />
      </body>
    </html>
  );
}
