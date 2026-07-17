/**
 * sitemap.xml（Next.js Metadata Route）。Sprint 41。
 *
 * - 正式 16 URL のみ（日本語 4 ＋ 外国語 4 locale × 3 ページ）。`/ja`・`/zh`・外国語 News・404・redirect 元は含めない。
 * - top/profile/gallery には hreflang alternates（5 locale＋x-default）を付ける。News は ja のみ（alternates なし）。
 * - lastModified / changeFrequency / priority は付けない（Sprint 39 D-E/D-F=省略）。
 * - **SITE_URL 未設定時は空配列**（正式ドメイン未決定期に誤 URL / Stage A URL を出さない・Sprint 39 §24・§26）。
 */
import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/locales";
import { isRouteAvailable, type RouteKey } from "@/lib/i18n/routes";
import { buildCanonicalUrl, buildLanguageAlternates } from "@/lib/seo/routes";
import { getOptionalSiteUrl } from "@/lib/seo/site-url";

/** sitemap に載せる route。News は ja のみ（isRouteAvailable でゲート）。 */
const routes: RouteKey[] = ["home", "profile", "gallery", "news"];
/** hreflang alternates を持つ route（多言語ページ）。News は単一言語のため持たない。 */
const alternateRoutes: readonly RouteKey[] = ["home", "profile", "gallery"];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getOptionalSiteUrl();
  if (!siteUrl) return [];

  const entries: MetadataRoute.Sitemap = [];
  for (const route of routes) {
    for (const locale of locales) {
      if (!isRouteAvailable(locale, route)) continue; // 外国語 News を除外
      entries.push({
        url: buildCanonicalUrl(siteUrl, locale, route),
        ...(alternateRoutes.includes(route)
          ? { alternates: { languages: buildLanguageAlternates(siteUrl, route) } }
          : {}),
      });
    }
  }
  return entries;
}
