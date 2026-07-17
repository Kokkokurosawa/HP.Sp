/**
 * 日本語辞書 = 翻訳辞書全体の**正本(source of truth)**。
 *
 * - このファイルのキー構造が Dictionary 型の元になる(schema.ts が typeof で参照)。
 *   → 外国語辞書(en / zh-hans / zh-hant / ko)は同一キー構造を型で要求される。
 * - `as const` によりキー構造を固定する。値のリテラル型そのものは外国語へ要求しない
 *   (外国語の葉は string で足りる。DeepStringShape が型を string へ緩める)。
 * - ここに置くのは **UI 定型文**(ナビ・アクセシビリティ・共通状態)のみ。
 *   プロフィール本文・ギャラリー説明・News・キャッチコピーなどの**編集コンテンツ**は
 *   従来どおり config / content(LocalizedText 等)側で管理し、ここへ移さない(Sprint 30 §8)。
 * - 日本語の値は既存 UI と一致させてある(nav ラベル・skip リンク・メニュー aria-label など)。
 *   ただし本 Sprint では既存コンポーネントへは適用しない(辞書基盤のみ)。
 */
export const ja = {
  /** サイト共通で繰り返し使う短い語。現在はナビ項目名と対応。 */
  common: {
    home: "ホーム",
    profile: "プロフィール",
    gallery: "ギャラリー",
    news: "お知らせ",
  },
  /** ナビゲーション領域のラベル(スクリーンリーダー向けの領域名。Header/モバイル/Footer で別々)。 */
  navigation: {
    mainNavigationLabel: "メインナビゲーション",
    mobileNavigationLabel: "モバイルナビゲーション",
    footerNavigationLabel: "サイトメニュー",
  },
  /**
   * 外国語 noindex scaffold の表示文言(Sprint 28 の準備中プレースホルダー)。
   * 日本語版では scaffold は表示されない(正本としての参照値)。
   */
  localeScaffold: {
    title: "日本語",
    description: "この言語版は準備中です。",
    status: "準備中",
  },
  /** アクセシビリティ用の定型文(skip リンク・メニュー開閉ラベル)。 */
  accessibility: {
    skipToContent: "本文へスキップ",
    openMenu: "メニューを開く",
    closeMenu: "メニューを閉じる",
  },
} as const;
