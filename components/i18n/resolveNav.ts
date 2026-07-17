import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/content/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { isRouteAvailable, localizedPath } from "@/lib/i18n/routes";

/**
 * 共通ナビの解決結果（locale 別 URL ＋ 辞書ラベルの最小表示データ）。
 * Client Component（MobileMenu）へは辞書全体ではなくこの解決済み文字列だけを渡す。
 */
export type ResolvedNavItem = { href: string; label: string };

/**
 * `siteConfig.nav`（route key + 表示順）を、locale 別 URL と表示ラベルへ解決する（Sprint 32）。
 * - href は `localizedPath(locale, key)`（ja 接頭辞なし / 外国語 `/locale` 接頭辞）。
 * - その locale に存在しないページ（外国語 News）は `isRouteAvailable` で除外
 *   → 外国語 Header/Footer は News リンクを出さない（/en/news 等を生成しない）。
 * - `item.key` は型付き（keyof common = RouteKey）で任意文字列アクセスは起きない。
 */
export function resolveNav(dict: Dictionary, locale: Locale): ResolvedNavItem[] {
  return siteConfig.nav
    .filter((item) => isRouteAvailable(locale, item.key))
    .map((item) => ({
      href: localizedPath(locale, item.key),
      label: dict.common[item.key],
    }));
}
