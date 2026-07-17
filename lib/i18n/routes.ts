/**
 * locale 別公開 URL 生成の source of truth（Sprint 32）。
 * - URL 文字列を各コンポーネントで組み立てず、型付き route key + locale から一元生成する。
 * - ja は接頭辞なし、外国語は `/locale` 接頭辞（Sprint 28 のルーティング契約と一致）。
 * - News のように locale で存在可否が異なるページは isRouteAvailable で明示的に扱う
 *   （日本語への黙示 fallback ではなく、ページ可用性に基づく明示的な言語切替先）。
 * - ルーティング方式（rewrites/redirects）は変更しない。ここは URL 文字列生成のみ。
 */
import { defaultLocale, localesWithNews, type Locale } from "./locales";

/** 共通ページの route key（URL 解析を各所で繰り返さないための型付き識別子）。 */
export const routeKeys = ["home", "profile", "gallery", "news"] as const;
export type RouteKey = (typeof routeKeys)[number];

/** route key → ja 接頭辞なしの基準パス（唯一の定義元）。 */
const basePath: Record<RouteKey, string> = {
  home: "/",
  profile: "/profile",
  gallery: "/gallery",
  news: "/news",
};

/**
 * その locale にそのページが存在するか。News は ja のみ（localesWithNews と整合）。
 * 外国語 News（/en/news 等）は生成しないためのゲート。
 */
export function isRouteAvailable(locale: Locale, route: RouteKey): boolean {
  if (route === "news") return localesWithNews.includes(locale);
  return true;
}

/**
 * locale + route key → 公開 URL。
 * localizedPath("ja","home")="/" / ("ja","profile")="/profile"
 * localizedPath("en","home")="/en" / ("en","profile")="/en/profile" / ("zh-hant","gallery")="/zh-hant/gallery"
 * 注: 可用性判定はしない純粋関数。呼び出し側が isRouteAvailable でゲートする
 *     （nav 解決・言語切替先の両方でゲート済み＝/en/news 等は生成されない）。
 */
export function localizedPath(locale: Locale, route: RouteKey): string {
  const base = basePath[route];
  if (locale === defaultLocale) return base;
  return base === "/" ? `/${locale}` : `/${locale}${base}`;
}

/**
 * 言語切替先 URL（§7・§8）。原則は現在ページに対応する対象 locale の URL。
 * 対象 locale にそのページが無い場合（外国語 News）は、その locale のトップへ明示的に移動する
 * （存在しない外国語 News URL へはリンクしない。本文の日本語黙示 fallback ではない）。
 */
export function languageSwitchTarget(route: RouteKey, targetLocale: Locale): string {
  const target = isRouteAvailable(targetLocale, route) ? route : "home";
  return localizedPath(targetLocale, target);
}
