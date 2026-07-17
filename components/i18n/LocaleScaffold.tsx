import type { Locale } from "@/lib/i18n/locales";
import { getDictionary } from "@/content/i18n";

/**
 * 外国語ルートの**基盤確認用**の最小プレースホルダー（Sprint 28 ルーティング基盤）。
 * - 正式翻訳コンテンツではない。日本語本文を流用しない。
 * - 検索対象にしない（呼び出し側ページで robots noindex を付与する）。
 * - No-JS で表示できる純粋な静的出力（Server Component・getDictionary は同期・静的 import）。
 * - Sprint 30: 表示文言を型付き辞書（localeScaffold セクション）から取得する最小適用。
 *   locale ごとの scaffold 文言はすべて暫定・未検証（noindex・後続の正式翻訳で置換）。
 * - ルーティング成立の確認に必要な最小限に留める（レイアウト・デザインは不変）。
 */
export default function LocaleScaffold({ locale }: { locale: Locale }) {
  const { localeScaffold } = getDictionary(locale);
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 sm:py-24">
      <p className="text-sm font-bold tracking-[0.3em] text-deepblue-600">
        {localeScaffold.title}
      </p>
      <p className="mt-4 leading-relaxed text-night-800/80">
        {localeScaffold.description}
      </p>
      <p className="mt-6 text-xs uppercase tracking-widest text-night-800/50">
        {localeScaffold.status}
      </p>
    </div>
  );
}
