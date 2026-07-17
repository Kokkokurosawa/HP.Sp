import type { Dictionary } from "./schema";

/**
 * 繁體中文(zh-hant)辞書 —— **共通 UI 文言は Sprint 37 で人間確認済み(正式)**。
 *
 * - 繁体字(台湾・香港などを想定)。簡体字 zh-hans とは別辞書として扱う(Sprint 27 D-02=D)。
 * - 共通 UI chrome と言語切替の自称表記(language.name)へ適用済み(Sprint 31/32)。
 * - common/navigation/accessibility の各値は Sprint 37 D-COMMON で人間承認(D-03「AI 初稿→人間確認」完了)。
 *   common.gallery は Gallery ページ見出し(Sprint 35 承認)と統一するため「畫廊」へ確定(Sprint 37 D-GAL)。
 * - `satisfies Dictionary` で ja と同一キー構造・葉 string を型で強制。
 */
export const zhHant = {
  common: {
    home: "首頁",
    profile: "簡介",
    gallery: "畫廊",
    news: "公告",
  },
  navigation: {
    mainNavigationLabel: "主導覽",
    mobileNavigationLabel: "行動版導覽",
    footerNavigationLabel: "網站選單",
    languageSwitcherLabel: "語言",
  },
  language: {
    name: "繁體中文",
  },
  accessibility: {
    skipToContent: "跳至內文",
    openMenu: "開啟選單",
    closeMenu: "關閉選單",
  },
} satisfies Dictionary;
