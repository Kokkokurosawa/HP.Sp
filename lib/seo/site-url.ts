/**
 * SITE_URL（Server 専用・`NEXT_PUBLIC_` 不使用）の解決と検証。多言語 SEO の絶対 URL 生成の唯一の source of truth。
 * Sprint 41（設計は Sprint 39 D-A=SITE_URL 切替）。
 *
 * - 正式ドメイン未決定期は**未設定を許容**する（`getOptionalSiteUrl` → null）。canonical / hreflang / OG url /
 *   sitemap / robots の Sitemap 行は未設定時に**出力しない**（誤った正規 URL を静かに出さない・Sprint 39 §24）。
 * - **Stage A（vercel.app）や localhost への fallback はしない**（Stage A は検証環境であり正式 URL ではない・§7）。
 * - この module は Server 専用（`process.env.SITE_URL` を読む）。Client から import しない。
 */

/** 生値を検証して URL（origin のみ）を返す。未設定/空は null。不正値は例外（黙って誤 URL を出さない）。 */
function parseSiteUrl(raw: string | undefined): URL | null {
  if (raw === undefined) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("SITE_URL must be an absolute URL (e.g. https://example.com)");
  }
  if (url.protocol !== "https:") throw new Error("SITE_URL must use https");
  if (url.username || url.password) throw new Error("SITE_URL must not contain credentials");
  if (url.search) throw new Error("SITE_URL must not contain a query string");
  if (url.hash) throw new Error("SITE_URL must not contain a fragment");
  if (url.pathname !== "/") throw new Error("SITE_URL must be an origin without a path");

  // 末尾スラッシュを正規化して origin だけの URL を返す（consumer は siteUrl.origin でパスを連結する）。
  return new URL(url.origin);
}

/**
 * SITE_URL を返す。未設定・空文字なら null（noindex 期の許容状態）。不正値なら例外。
 * 通常ページの metadata / sitemap / robots はこれを使い、未設定なら該当 URL を非出力にする。
 */
export function getOptionalSiteUrl(): URL | null {
  return parseSiteUrl(process.env.SITE_URL);
}

/**
 * SITE_URL を必須で返す。未設定・空・不正なら例外。
 * 正式公開切替時（誤 URL 出力より build 失敗を優先する箇所）に使用する。
 */
export function requireSiteUrl(): URL {
  const url = parseSiteUrl(process.env.SITE_URL);
  if (!url) throw new Error("SITE_URL is required but was not set");
  return url;
}
