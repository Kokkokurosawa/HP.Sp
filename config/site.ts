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
  /**
   * この画像専用の注記(例: 仮画像運用中の断り書き)。画像の直近に小さく表示される。
   * 注記の唯一の定義元はここ。空文字または未定義なら注記要素自体を DOM へ出さない。
   */
  notice?: string;
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
      // 正式キービジュアル(背景透過 PNG・全身構図)。実画像のため priority 読み込み
      src: "/images/supitaro/20251023sptaro_front_output_syuusei.png",
      alt: "白い体に青い目、額の青いひし形、青い耳と尻尾を持つ、すぴたろうの全身イラスト",
      // 正式画像のため注記なし(空文字 → 注記要素を出さない)
      notice: "",
    },
    /** プロフィールページのキャラクター画像(通常の遅延読み込み) */
    profile: {
      // 正式キャラクター画像(すぴたろう正面ポートレート)。通常の遅延読み込み
      src: "/images/supitaro/supitaro_Profile.png",
      alt: "白い体に青い目、額の青いひし形、青い耳と2本の尻尾を持つ、すぴたろうの全身イラスト",
      // 正式画像のため注記なし(空文字 → 注記要素を出さない)
      notice: "",
    },
    /** Open Graph 画像(SNS シェア用)。ヒーローとは別に専用画像が必要(1466×643) */
    og: {
      src: "/images/og/supitaro-og.png",
      alt: "押し入れから覗くすぴたろうと、サイト名「すぴたろう」、説明文「宇宙からきた不思議ないきもの。」を描いた共有画像",
    },
  } satisfies Record<string, SiteImage>,

  /** グローバルナビゲーション(ここが唯一の定義元。Header / MobileMenu / Footer が参照する) */
  nav: [
    { label: "ホーム", href: "/" },
    { label: "プロフィール", href: "/profile" },
    { label: "ギャラリー", href: "/gallery" },
    { label: "お知らせ", href: "/news" },
  ] as NavItem[],
};
