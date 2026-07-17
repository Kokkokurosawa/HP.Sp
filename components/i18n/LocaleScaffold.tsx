import type { Locale } from "@/lib/i18n/locales";

/**
 * 外国語ルートの**基盤確認用**の最小プレースホルダー（Sprint 28 ルーティング基盤）。
 * - 正式翻訳コンテンツではない。日本語本文を流用しない（言語中立の英語 1 行のみ）。
 * - 検索対象にしない（呼び出し側ページで robots noindex を付与する）。
 * - No-JS で表示できる純粋な静的出力。後続 Sprint（辞書・各言語版）で除去・置換する。
 * - ルーティング成立の確認に必要な最小限に留める（デザイン変更ではない）。
 */
export default function LocaleScaffold({ locale }: { locale: Locale }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 sm:py-24">
      <p className="text-sm font-bold tracking-[0.3em] text-deepblue-600">
        {locale.toUpperCase()}
      </p>
      <p className="mt-4 leading-relaxed text-night-800/80">
        This language version is being prepared.
      </p>
    </div>
  );
}
