/**
 * SEO 用の絶対 URL 生成（canonical / hreflang alternates）。Sprint 41。
 *
 * - 内部の `localizedPath`（Sprint 32）を再利用し、route 文字列を各所で重複させない。
 * - ja は接頭辞なし、外国語は `/locale` 接頭辞。`/ja`・`/zh`・外国語 News は生成しない
 *   （呼び出し側が `isRouteAvailable` で有効 route のみ渡す設計）。
 * - query / fragment は含めない（`localizedPath` は純パスのみ）。末尾スラッシュは付けない（Next 既定と一致）。
 */
import {
  htmlLang,
  locales,
  type HtmlLang,
  type Locale,
} from "@/lib/i18n/locales";
import { isRouteAvailable, localizedPath, type RouteKey } from "@/lib/i18n/routes";

/** 自己参照 canonical の絶対 URL。ja=`<origin>/` / 外国語=`<origin>/en/...` 等。 */
export function buildCanonicalUrl(
  siteUrl: URL,
  locale: Locale,
  route: RouteKey,
): string {
  return `${siteUrl.origin}${localizedPath(locale, route)}`;
}

/**
 * hreflang alternates（公開 hreflang コード → 絶対 URL）＋ `x-default`（＝日本語対応ページ・Sprint 39 D-C）。
 * route が存在する locale のみ列挙する（News は ja のみ・外国語 News は含めない）。
 * キーは `HtmlLang | "x-default"` に限定するため、Next の `Languages`（HrefLang キー）へ型安全に渡せる。
 */
export function buildLanguageAlternates(
  siteUrl: URL,
  route: RouteKey,
): Partial<Record<HtmlLang | "x-default", string>> {
  const languages: Partial<Record<HtmlLang | "x-default", string>> = {};
  for (const locale of locales) {
    if (!isRouteAvailable(locale, route)) continue;
    languages[htmlLang(locale)] = buildCanonicalUrl(siteUrl, locale, route);
  }
  // x-default は日本語対応ページ（top→/、profile→/profile、gallery→/gallery）。
  languages["x-default"] = buildCanonicalUrl(siteUrl, "ja", route);
  return languages;
}
