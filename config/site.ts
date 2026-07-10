/**
 * サイト全体の設定。
 * サイト名・説明文・URL・ナビゲーション・画像パスはページへ直接書かず、
 * このファイルに集約する。
 */

export type NavItem = {
  label: string;
  href: string;
};

export const siteConfig = {
  /** キャラクター名 */
  characterName: "すぴたろう",

  /** サイト名(title / OG に使用) */
  siteName: "すぴたろう公式サイト",

  /** サイトの説明文(description / OG に使用) */
  description:
    "宇宙から来た、ふしぎないきもの「すぴたろう」の公式サイト。プロフィール・お知らせ・配信チャンネルへの入口です。",

  /**
   * 公開 URL(canonical / OG の解決に使用)。
   * TODO: 本番ドメイン確定後に設定する。未確定のため空文字。
   */
  siteUrl: "",

  /**
   * 外部チャンネル URL。
   * TODO: 各チャンネルの URL 確定後に設定する。未確定のため空文字。
   * 空文字の間、リンクは「準備中」表示になる(架空 URL は設定しない)。
   */
  channels: {
    youtube: "",
    x: "",
  },

  /**
   * 画像パス(/public 配下)。
   * TODO: 素材確定後に設定する(例: "/images/supitaro-main.png")。
   * 空文字の間はプレースホルダーを表示する。
   */
  images: {
    characterMain: "",
    characterProfile: "",
    ogImage: "",
  },

  /** グローバルナビゲーション */
  nav: [
    { label: "ホーム", href: "/" },
    { label: "プロフィール", href: "/profile" },
    { label: "お知らせ", href: "/news" },
  ] as NavItem[],
};
