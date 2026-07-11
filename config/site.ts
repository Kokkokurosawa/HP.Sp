/**
 * サイト全体の設定。
 * サイト名・説明文・URL・ナビゲーション・画像パスはページへ直接書かず、
 * このファイルに集約する。
 */

export type NavItem = {
  label: string;
  href: string;
};

/**
 * 画像 1 点の設定。
 * src が空文字の間は「未設定」として扱い、UI はプレースホルダーを表示する
 * (存在しないパスを HTML に出力して 404 を発生させない)。
 */
export type SiteImage = {
  /** /public 配下のパス(例: "/images/supitaro/supitaro-main.webp")。未確定の間は空文字。 */
  src: string;
  /** 代替テキスト。実画像を設定するときに必ず記入する(空の場合はキャラクター名で代替)。 */
  alt: string;
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
   * 外部チャンネル URL(正式・確認済み)。ここが唯一の定義元。
   * 変更時はこの行を更新する。トラッキングパラメータは付けない。
   * 空文字のチャンネルは公開画面に表示されない(要素自体を DOM に出さない)。
   */
  channels: {
    youtube: "https://www.youtube.com/@supitaro_oo",
    x: "https://x.com/supitaro_oo",
    twitch: "https://www.twitch.tv/supitaro_oo",
  },

  /**
   * 用途別の画像設定。受け入れ仕様と差し替え手順は docs/character-image-guidelines.md を参照。
   * TODO: 素材確定後に src / alt を設定する。空文字の間はプレースホルダーを表示する。
   * favicon はここではなく app/icon.svg の差し替えで管理する(Next.js のファイル規約)。
   */
  images: {
    /** トップページのヒーロー(メインビジュアル)。実画像設定時は priority 読み込み */
    hero: {
      // TODO: 正式キービジュアル確定後に差し替える(現在は開発用仮イラスト)
      src: "/images/supitaro/supitaro-temporary-main.svg",
      alt: "白い体と青い目を持つ、開発用のすぴたろう仮イラスト",
    },
    /** プロフィールページのキャラクター画像(通常の遅延読み込み) */
    profile: {
      // TODO: 正式キービジュアル確定後に差し替える(現在は開発用仮イラスト)
      src: "/images/supitaro/supitaro-temporary-main.svg",
      alt: "すぴたろうの全身が分かる、開発用の仮イラスト",
    },
    /** Open Graph 画像(SNS シェア用)。ヒーローとは別に専用画像が必要 */
    og: { src: "", alt: "" },
  } satisfies Record<string, SiteImage>,

  /**
   * 仮画像(開発用イメージ)運用中の注記。キャラクター画像の近くに小さく表示される。
   * 正式画像への差し替え時に空文字にすると、すべての表示箇所から消える。
   */
  temporaryArtworkNotice: "現在は開発用イメージです",

  /** グローバルナビゲーション */
  nav: [
    { label: "ホーム", href: "/" },
    { label: "プロフィール", href: "/profile" },
    { label: "お知らせ", href: "/news" },
  ] as NavItem[],
};
