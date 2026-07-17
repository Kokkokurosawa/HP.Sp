import type { Dictionary } from "./schema";

/**
 * 한국어(ko)辞書 —— **共通 UI 文言は Sprint 37 で人間確認済み(正式)**。
 *
 * - 共通 UI chrome と言語切替の自称表記(language.name)へ適用済み(Sprint 31/32)。
 * - common/navigation/accessibility の各値は Sprint 37 D-COMMON で人間承認
 *   (Sprint 27 D-03「AI 初稿→人間確認」完了)。
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
  language: {
    name: "한국어",
  },
  accessibility: {
    skipToContent: "본문으로 건너뛰기",
    openMenu: "메뉴 열기",
    closeMenu: "메뉴 닫기",
    // Sprint 38 で人間確認済み(正式)。動作句は Sprint 33 承認訳と一致。半角括弧前にスペース。
    externalLinkNote: "(외부 링크, 새 탭에서 열립니다)",
  },
  social: {
    youtube: "YouTube에서 방송 보기 (외부 링크, 새 탭에서 열립니다)",
    x: "X에서 소식 보기 (외부 링크, 새 탭에서 열립니다)",
    twitch: "Twitch에서 방송 보기 (외부 링크, 새 탭에서 열립니다)",
  },
} satisfies Dictionary;
