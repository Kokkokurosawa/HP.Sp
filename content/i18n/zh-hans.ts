import type { Dictionary } from "./schema";

/**
 * 简体中文(zh-hans)辞書 —— **共通 UI 文言は Sprint 37 で人間確認済み(正式)**。
 *
 * - 简体字(中国本土向け)。繁体字 zh-hant とは別辞書として扱う(Sprint 27 D-02=D)。
 * - 共通 UI chrome と言語切替の自称表記(language.name)へ適用済み(Sprint 31/32)。
 * - common/navigation/accessibility の各値は Sprint 37 D-COMMON で人間承認(D-03「AI 初稿→人間確認」完了)。
 *   common.gallery は Gallery ページ見出し(Sprint 35 承認)と統一するため「画廊」へ確定(Sprint 37 D-GAL)。
 * - `satisfies Dictionary` で ja と同一キー構造・葉 string を型で強制。
 */
export const zhHans = {
  common: {
    home: "首页",
    profile: "简介",
    gallery: "画廊",
    news: "通知",
  },
  navigation: {
    mainNavigationLabel: "主导航",
    mobileNavigationLabel: "移动端导航",
    footerNavigationLabel: "网站菜单",
    languageSwitcherLabel: "语言",
  },
  language: {
    name: "简体中文",
  },
  accessibility: {
    skipToContent: "跳到正文",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    // Sprint 38 で人間確認済み(正式)。动作句は Sprint 33 承認訳と一致。全角括弧(简体・スペースなし)。
    externalLinkNote: "（外部链接，将在新标签页中打开）",
  },
  social: {
    youtube: "在 YouTube 观看直播（外部链接，将在新标签页中打开）",
    x: "在 X 关注动态（外部链接，将在新标签页中打开）",
    twitch: "在 Twitch 观看直播（外部链接，将在新标签页中打开）",
  },
} satisfies Dictionary;
