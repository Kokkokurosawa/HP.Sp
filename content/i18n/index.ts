/**
 * 翻訳辞書の公開 API。アプリ側はここ(getDictionary)経由で辞書へアクセスする。
 *
 * - 個別 locale 辞書(ja/en/…)をアプリ全体から無制限に直接 import させない(§13)。
 *   → 公開するのは Dictionary 型・セクション型・getDictionary・dictionaryLocales のみ。
 * - locale 一覧の唯一の source of truth は lib/i18n/locales.ts(`Locale`)。ここで再定義しない(§7)。
 *   → `Record<Locale, Dictionary>` により、locale 追加時の辞書漏れ・削除時の余剰辞書を型で検出。
 * - 日本語への黙示的 fallback は行わない(§6)。未知 locale はそもそも `Locale` 型で弾かれ、
 *   ルーティング層(dynamicParams=false)で 404 になる。
 * - runtime network / Node 専用 API なし。静的 import のみ(静的生成を維持)。
 */
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "./schema";
import { ja } from "./ja";
import { en } from "./en";
import { zhHans } from "./zh-hans";
import { zhHant } from "./zh-hant";
import { ko } from "./ko";

export type {
  Dictionary,
  CommonDictionary,
  NavigationDictionary,
  AccessibilityDictionary,
} from "./schema";

/**
 * locale → 辞書の網羅マップ。`Record<Locale, Dictionary>` 注釈により:
 * - locale が増えてここに辞書が無ければ型エラー(辞書追加漏れ検出)。
 * - locale に無いキーをここへ足せば余分プロパティとして型エラー(余剰辞書検出)。
 */
const dictionaries: Record<Locale, Dictionary> = {
  ja,
  en,
  "zh-hans": zhHans,
  "zh-hant": zhHant,
  ko,
};

/**
 * locale に対応する辞書を返す。
 * - 引数は既存の `Locale` 型(5 locale を網羅)。
 * - 日本語への黙示 fallback(`?? dictionaries.ja`)は行わない。
 * - Server Component から同期的に利用可能。
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * 辞書マップが実際に保持している locale 一覧(テストで locale source of truth との一致を検証する用)。
 * `dictionaries` は `Record<Locale, Dictionary>` なのでキーは Locale と一致する。
 */
export const dictionaryLocales = Object.keys(dictionaries) as Locale[];
