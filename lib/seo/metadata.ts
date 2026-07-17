/**
 * top / profile / gallery の locale 別 metadata 組み立て（Sprint 41）。3 ページで同じ組み立てを重複させない小さな helper。
 *
 * - title / description は Sprint 40 承認の `content/seoMetadata.ts` を共用（OG / Twitter も同じ値）。新しい翻訳は作らない。
 * - canonical / hreflang / `og:url` は **SITE_URL 設定時のみ**出力（未設定なら非出力＝誤 URL を静かに出さない）。
 * - OG 画像は `siteConfig` から**明示再利用**する（Next は openGraph を深いマージしないため、page で openGraph を
 *   設定すると root の images が失われる。ここで image を再指定して継承漏れを防ぐ）。画像 URL/alt/寸法は変更しない。
 * - robots は locale 別（ja=indexable / 外国語=noindex,nofollow）。**本 Sprint では値を変更しない**（Sprint 42 で解除判断）。
 */
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getPageMetadata, type PageMetadataKey } from "@/content/seoMetadata";
import { ogLocale, type Locale } from "@/lib/i18n/locales";
import type { RouteKey } from "@/lib/i18n/routes";
import { buildCanonicalUrl, buildLanguageAlternates } from "@/lib/seo/routes";
import { getOptionalSiteUrl } from "@/lib/seo/site-url";

/** 外国語ページの robots（Sprint 42 まで維持）。 */
const NOINDEX = { index: false, follow: false } as const;

/** SEO ページキー（top/profile/gallery）→ 内部 route key（home/profile/gallery）。 */
const routeOf: Record<PageMetadataKey, RouteKey> = {
  top: "home",
  profile: "profile",
  gallery: "gallery",
};

/** OG 画像は全ページ共通（siteConfig が唯一の定義元・寸法は既存 root metadata と一致）。 */
const ogImage = {
  url: siteConfig.images.og.src,
  width: 1466,
  height: 643,
  alt: siteConfig.images.og.alt,
} as const;

/**
 * locale × page の完成 metadata を返す。title は absolute（root template の日本語ブランド付加を防ぐ・Sprint 40）。
 * SITE_URL 未設定時は alternates と `og:url` を省く。
 */
export function buildLocalizedPageMetadata(
  locale: Locale,
  page: PageMetadataKey,
): Metadata {
  const copy = getPageMetadata(locale, page);
  const route = routeOf[page];
  const siteUrl = getOptionalSiteUrl();
  const canonical = siteUrl ? buildCanonicalUrl(siteUrl, locale, route) : null;

  const openGraph: Metadata["openGraph"] = {
    title: copy.title,
    description: copy.description,
    siteName: siteConfig.siteName,
    locale: ogLocale(locale),
    type: "website",
    images: [ogImage],
    ...(canonical ? { url: canonical } : {}),
  };

  const twitter: Metadata["twitter"] = {
    card: "summary_large_image",
    title: copy.title,
    description: copy.description,
    images: [siteConfig.images.og.src],
  };

  return {
    title: { absolute: copy.title },
    description: copy.description,
    ...(siteUrl
      ? { alternates: { canonical, languages: buildLanguageAlternates(siteUrl, route) } }
      : {}),
    openGraph,
    twitter,
    ...(locale === "ja" ? {} : { robots: NOINDEX }),
  };
}
