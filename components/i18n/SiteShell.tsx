import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { resolveNav } from "@/components/i18n/resolveNav";
import { getDictionary } from "@/content/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath, type RouteKey } from "@/lib/i18n/routes";

/**
 * 共通 chrome（skip リンク・Header・main・Footer）を locale/route 対応で描画する Server Component（Sprint 32）。
 *
 * なぜ layout でなくここか: 言語切替は「現在ページに対応する別 locale URL」へ遷移する必要があり、
 * `app/[locale]/layout.tsx` は locale しか知らず現在 route を判別できない。各ページが自分の routeKey を
 * SiteShell へ渡すことで、Footer の言語切替を No-JS・Server のまま route 対応にできる。
 *
 * - 辞書取得は Server（getDictionary）。Client（MobileMenu）へは解決済み文字列のみを渡す。
 * - nav の href は locale 別（localizedPath）。外国語 News は resolveNav が除外。
 * - 静的生成のみ（runtime fetch / dynamic API なし）。
 */
export default function SiteShell({
  locale,
  routeKey,
  children,
}: {
  locale: Locale;
  routeKey: RouteKey;
  children: React.ReactNode;
}) {
  const dict = getDictionary(locale);
  const nav = resolveNav(dict, locale);
  return (
    <>
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
        homeHref={localizedPath(locale, "home")}
        menu={{
          navLabel: dict.navigation.mobileNavigationLabel,
          open: dict.accessibility.openMenu,
          close: dict.accessibility.closeMenu,
        }}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer
        nav={nav}
        menuHeading={dict.navigation.footerNavigationLabel}
        social={dict.social}
        languageSwitcher={
          <LanguageSwitcher
            locale={locale}
            routeKey={routeKey}
            label={dict.navigation.languageSwitcherLabel}
          />
        }
      />
    </>
  );
}
