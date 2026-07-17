import type { Dictionary } from "./schema";

/**
 * 简体中文(zh-hans)辞書 —— **暫定・未検証の内部用文言(AI 初稿)**。
 *
 * - 简体字(中国本土向け)。繁体字 zh-hant とは別辞書として扱う(Sprint 27 D-02=D)。
 * - 公開対象は現時点で `localeScaffold` のみ(noindex scaffold)。他は型基盤の最小値。
 * - Sprint 27 D-03 の AI 初稿段階。正式翻訳 Sprint で人間確認・置換するまで正式文にしない。
 * - `satisfies Dictionary` で ja と同一キー構造・葉 string を型で強制。
 */
export const zhHans = {
  common: {
    home: "首页",
    profile: "简介",
    gallery: "图库",
    news: "通知",
  },
  navigation: {
    mainNavigationLabel: "主导航",
    mobileNavigationLabel: "移动端导航",
    footerNavigationLabel: "网站菜单",
    languageSwitcherLabel: "语言",
  },
  localeScaffold: {
    title: "简体中文",
    description: "此语言版本正在准备中。",
    status: "筹备中",
  },
  accessibility: {
    skipToContent: "跳到正文",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
  },
} satisfies Dictionary;
