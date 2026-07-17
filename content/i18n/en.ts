import type { Dictionary } from "./schema";

/**
 * English 辞書 —— **暫定・未検証の内部用文言(AI 初稿)**。
 *
 * - 公開対象は現時点で `localeScaffold` のみ(外国語ルートは Sprint 28 の noindex scaffold)。
 * - `common` / `navigation` / `accessibility` は型基盤のための最小値で、まだ画面へ適用しない
 *   (Header/Footer/ナビの翻訳は本 Sprint の対象外)。
 * - すべて Sprint 27 D-03 の「AI 初稿 → 人間が全ページ確認してから公開」の**初稿段階**。
 *   正式翻訳 Sprint で人間が確認・置換するまで正式文として扱わない。
 * - `satisfies Dictionary` により ja と同一キー構造・葉 string を型で強制(欠落/余分キーは型エラー)。
 */
export const en = {
  common: {
    home: "Home",
    profile: "Profile",
    gallery: "Gallery",
    news: "News",
  },
  navigation: {
    mainNavigationLabel: "Main navigation",
    footerNavigationLabel: "Site menu",
  },
  localeScaffold: {
    title: "English",
    description: "This language version is being prepared.",
    status: "In preparation",
  },
  accessibility: {
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
} satisfies Dictionary;
