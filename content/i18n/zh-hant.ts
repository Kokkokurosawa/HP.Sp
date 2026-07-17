import type { Dictionary } from "./schema";

/**
 * 繁體中文(zh-hant)辞書 —— **暫定・未検証の内部用文言(AI 初稿)**。
 *
 * - 繁体字(台湾・香港などを想定)。簡体字 zh-hans とは別辞書として扱う(Sprint 27 D-02=D)。
 * - 公開対象は現時点で `localeScaffold` のみ(noindex scaffold)。他は型基盤の最小値。
 * - Sprint 27 D-03 の AI 初稿段階。正式翻訳 Sprint で人間確認・置換するまで正式文にしない。
 * - `satisfies Dictionary` で ja と同一キー構造・葉 string を型で強制。
 */
export const zhHant = {
  common: {
    home: "首頁",
    profile: "簡介",
    gallery: "圖庫",
    news: "公告",
  },
  navigation: {
    mainNavigationLabel: "主導覽",
    mobileNavigationLabel: "行動版導覽",
    footerNavigationLabel: "網站選單",
    languageSwitcherLabel: "語言",
  },
  localeScaffold: {
    title: "繁體中文",
    description: "此語言版本正在準備中。",
    status: "籌備中",
  },
  accessibility: {
    skipToContent: "跳至內文",
    openMenu: "開啟選單",
    closeMenu: "關閉選單",
  },
} satisfies Dictionary;
