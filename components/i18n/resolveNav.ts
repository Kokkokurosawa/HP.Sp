import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/content/i18n";

/**
 * 共通ナビの解決結果（URL は config、表示ラベルは辞書から解決した最小の表示データ）。
 * Client Component（MobileMenu）へは辞書全体ではなくこの解決済み文字列だけを渡す。
 */
export type ResolvedNavItem = { href: string; label: string };

/**
 * `siteConfig.nav`（URL と辞書キー）を、locale 辞書で表示ラベルへ解決する。
 * Server Component（layout / not-found）で呼び、結果を Header/Footer/MobileMenu へ props で渡す。
 * `item.key` は `keyof Dictionary["common"]` に型付けされており、任意文字列アクセスは起きない。
 */
export function resolveNav(dict: Dictionary): ResolvedNavItem[] {
  return siteConfig.nav.map((item) => ({
    href: item.href,
    label: dict.common[item.key],
  }));
}
