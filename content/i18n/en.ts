import type { Dictionary } from "./schema";

/**
 * English 辞書 —— **共通 UI 文言は Sprint 37 で人間確認済み(正式)**。
 *
 * - Header/Footer/ナビ等の共通 UI chrome と言語切替の自称表記(language.name)へ適用済み(Sprint 31/32)。
 * - common/navigation/accessibility の各値は Sprint 37 D-COMMON で人間承認
 *   (Sprint 27 D-03「AI 初稿 → 人間が確認してから公開」の確認完了)。
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
