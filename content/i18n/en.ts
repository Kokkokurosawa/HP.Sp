import type { Dictionary } from "./schema";

/**
 * English 辞書 —— **暫定・未検証の内部用文言(AI 初稿)**。
 *
 * - Header/Footer/ナビ等の共通 UI chrome と言語切替の自称表記(language.name)へ適用済み(Sprint 31/32)。
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
    mobileNavigationLabel: "Mobile navigation",
    footerNavigationLabel: "Site menu",
    languageSwitcherLabel: "Languages",
  },
  language: {
    name: "English",
  },
  accessibility: {
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
} satisfies Dictionary;
