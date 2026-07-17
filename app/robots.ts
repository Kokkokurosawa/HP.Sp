/**
 * robots.txt（Next.js Metadata Route）。Sprint 41。
 *
 * - 全体クロールを許可（Allow: /）。**外国語ページを Disallow しない**（クローラが meta robots の noindex を
 *   確認できるようにするため・Sprint 39 §16）。noindex は各ページの meta robots で制御する。
 * - Sitemap 行は **SITE_URL 設定時のみ**出力（未設定時に Stage A の sitemap URL を出さない）。
 */
import type { MetadataRoute } from "next";
import { getOptionalSiteUrl } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getOptionalSiteUrl();
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(siteUrl ? { sitemap: `${siteUrl.origin}/sitemap.xml` } : {}),
  };
}
