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
 * locale → HTML `lang` 属性値（BCP-47）。内部 locale 値とは別。
 * ja→ja / en→en / zh-hans→zh-Hans / zh-hant→zh-Hant / ko→ko。
 */
const htmlLangMap: Record<Locale, string> = {
  ja: "ja",
  en: "en",
  "zh-hans": "zh-Hans",
  "zh-hant": "zh-Hant",
  ko: "ko",
};

/** locale の HTML `lang` 属性値を返す。 */
export function htmlLang(locale: Locale): string {
  return htmlLangMap[locale];
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
