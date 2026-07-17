import type { Dictionary } from "./schema";

/**
 * 한국어(ko)辞書 —— **暫定・未検証の内部用文言(AI 初稿)**。
 *
 * - 公開対象は現時点で `localeScaffold` のみ(noindex scaffold)。他は型基盤の最小値。
 * - Sprint 27 D-03 の AI 初稿段階。正式翻訳 Sprint で人間確認・置換するまで正式文にしない。
 * - `satisfies Dictionary` で ja と同一キー構造・葉 string を型で強制。
 */
export const ko = {
  common: {
    home: "홈",
    profile: "프로필",
    gallery: "갤러리",
    news: "소식",
  },
  navigation: {
    mainNavigationLabel: "주 내비게이션",
    mobileNavigationLabel: "모바일 내비게이션",
    footerNavigationLabel: "사이트 메뉴",
    languageSwitcherLabel: "언어",
  },
  localeScaffold: {
    title: "한국어",
    description: "이 언어 버전은 준비 중입니다.",
    status: "준비 중",
  },
  accessibility: {
    skipToContent: "본문으로 건너뛰기",
    openMenu: "메뉴 열기",
    closeMenu: "메뉴 닫기",
  },
} satisfies Dictionary;
