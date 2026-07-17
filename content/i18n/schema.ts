/**
 * 翻訳辞書のスキーマ(型)。日本語辞書 ja を正本として Dictionary 型を導出する。
 *
 * - `DeepStringShape<typeof ja>` = ja のキー構造はそのまま・葉(文字列リテラル)は string へ緩める。
 *   → 外国語辞書は「同じキー構造・葉は string」を満たせばよく、日本語リテラルは要求されない。
 * - 欠落キー・余分なキーは、各辞書の `satisfies Dictionary`(en.ts 等)と
 *   getDictionary の `Record<Locale, Dictionary>`(index.ts)により **TypeScript / build で失敗**する。
 * - `any` / `Record<string, any>` / unsafe cast は使わない(Sprint 30 §12)。
 *
 * ja は **型としてのみ**参照する(import type)。schema は実行時に読み込まれない
 * (実行時に schema を必要とするモジュールは無い = すべて型参照)ため循環依存も生じない。
 */
import type { ja } from "./ja";

/** 辞書の葉(翻訳値)は文字列。 */
type Leaf = string;

/**
 * オブジェクト構造を保ったまま、文字列の葉をすべて `string` へ緩める再帰マップ型。
 * homomorphic mapped type なので readonly 修飾(as const 由来)は保持される。
 */
export type DeepStringShape<T> = {
  [K in keyof T]: T[K] extends Leaf ? Leaf : DeepStringShape<T[K]>;
};

/** 全 locale 共通の辞書型。ja のキー構造が正本、葉は string。 */
export type Dictionary = DeepStringShape<typeof ja>;

/** セクション別の型(Client Component へ必要な部分だけ渡す設計を支える / §10・§13)。 */
export type CommonDictionary = Dictionary["common"];
export type NavigationDictionary = Dictionary["navigation"];
export type AccessibilityDictionary = Dictionary["accessibility"];
/** SNS フォロー導線の accessible name セクション(SocialFollowLinks/Footer へ props で渡す / Sprint 38)。 */
export type SocialDictionary = Dictionary["social"];
