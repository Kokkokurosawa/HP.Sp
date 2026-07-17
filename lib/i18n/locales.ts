/**
 * 多言語対応の唯一の source of truth（Sprint 27 D-02=D / D-08=R2）。
 * ここが対応 locale・HTML lang・公開 URL 接頭辞の唯一の定義元。
 * - 内部 locale 値（"zh-hans" 等・URL セグメントと一致・小文字）と
 *   HTML `lang` 属性値（"zh-Hans" 等・BCP-47 表記）は**別物**なので混同しない。
 * - 正式翻訳・辞書・言語切替 UI・canonical/hreflang は本ファイルの範囲外（後続 Sprint）。
 */

/** 対応 locale（内部値＝公開 URL セグメント）。ja は接頭辞なしで公開する。 */
export const locales = ["ja", "en", "zh-hans", "zh-hant", "ko"] as const;

export type Locale = (typeof locales)[number];

/** 既定 locale。接頭辞なし URL（"/"）で公開する。 */
export const defaultLocale: Locale = "ja";

/** 任意文字列が対応 locale か判定する型ガード。不明値（"zh" / "fr" / "ja以外の未知") を弾く。 */
export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * HTML `lang` 属性 ＝ 公開 hreflang コード（BCP-47）。内部 locale 値（小文字）とは別物。
 * 型を union に固定しておくことで、hreflang alternates のキー（Next の HrefLang）へ型安全に渡せる。
 */
export type HtmlLang = "ja" | "en" | "zh-Hans" | "zh-Hant" | "ko";

/**
 * locale → HTML `lang` 属性値（BCP-47・hreflang コードと同一）。内部 locale 値とは別。
 * ja→ja / en→en / zh-hans→zh-Hans / zh-hant→zh-Hant / ko→ko。
 */
const htmlLangMap: Record<Locale, HtmlLang> = {
  ja: "ja",
  en: "en",
  "zh-hans": "zh-Hans",
  "zh-hant": "zh-Hant",
  ko: "ko",
};

/** locale の HTML `lang` 属性値（＝hreflang コード）を返す。 */
export function htmlLang(locale: Locale): HtmlLang {
  return htmlLangMap[locale];
}

/**
 * locale → Open Graph の `og:locale`（言語_地域）。HTML lang（htmlLang）とは別物（SEO 専用）。
 * 地域は OG 仕様上の代表値を明記する（本文で地域を特定しない場合も推測で複数地域を混在させない）。
 * ja→ja_JP / en→en_US / zh-hans→zh_CN / zh-hant→zh_TW / ko→ko_KR。
 */
const ogLocaleMap: Record<Locale, string> = {
  ja: "ja_JP",
  en: "en_US",
  "zh-hans": "zh_CN",
  "zh-hant": "zh_TW",
  ko: "ko_KR",
};

/** locale の `og:locale` 値を返す。 */
export function ogLocale(locale: Locale): string {
  return ogLocaleMap[locale];
}

/**
 * locale の公開 URL 接頭辞。ja は接頭辞なし（""）、他は "/en" 等。
 * 例: localePrefix("ja")="" / localePrefix("zh-hant")="/zh-hant"。
 */
export function localePrefix(locale: Locale): string {
  return locale === defaultLocale ? "" : `/${locale}`;
}

/**
 * News を提供する locale（Sprint 27 D-01=B: News は多言語化せず ja のみ）。
 * `/en/news` 等は作らない（news ルートの generateStaticParams をこれに限定）。
 */
export const localesWithNews: readonly Locale[] = ["ja"];
