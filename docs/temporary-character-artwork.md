# 開発用仮キャラクター画像(Temporary Artwork)

- 登録日: 2026-07-11(Sprint 4)
- ステータス: **開発・表示検証専用の仮画像。正式なキービジュアルではない**

## 用途と位置づけ

実画像分岐(hero / profile)の表示確認、モバイル表示サイズ確認、透過画像と背景色の
相性確認、Next.js Image の出力確認、浮遊アニメーション確認、差し替え手順の確認のみに使う。

以下には**使用しない**:

- 正式キービジュアル / ロゴ / 宣伝素材
- SNS アイコン
- Open Graph 画像(未設定のまま)
- favicon(`app/icon.svg` は従来の抽象丸のまま)

## ファイル情報

| 項目 | 値 |
|---|---|
| パス | `public/images/supitaro/supitaro-temporary-main.svg` |
| 形式 | SVG(ベクター、背景透過) |
| viewBox | `0 0 512 512`(正方形) |
| ファイル容量 | 2,560 bytes(約 2.5 KB) |
| 作成方法 | 手書きのオリジナルベクター。円・楕円・ひし形・パス(口)のみで構成。画像生成 AI・第三者素材・フリー素材は不使用 |
| 使用箇所 | トップページ ヒーロー(priority)/ プロフィールページ(遅延読み込み) |

## デザイン要素(指示書 §5 準拠)

白基調の丸い宇宙生物 / 大きな青い目(ハイライト付き)/ 額に青いひし形 /
大きな耳 / 2 本の尻尾(下部外側、先端に淡い青)/ やわらかい笑み /
全身構図 / 背景透過 / 文字・ロゴ・装飾背景なし / 全周約 10% の透明余白。
サイトのカラートークン(babyblue / deepblue / lilac)のみで彩色。

## config 設定(現状)

`config/site.ts`:

```ts
images: {
  hero: {
    src: "/images/supitaro/supitaro-temporary-main.svg",
    alt: "白い体と青い目を持つ、開発用のすぴたろう仮イラスト",
  },
  profile: {
    src: "/images/supitaro/supitaro-temporary-main.svg",
    alt: "すぴたろうの全身が分かる、開発用の仮イラスト",
  },
  og: { src: "", alt: "" }, // 未設定のまま
},
temporaryArtworkNotice: "現在は開発用イメージです",
```

`temporaryArtworkNotice` が仮画像注記の**唯一の定義箇所**で、ヒーロー画像下と
プロフィール画像下に小さく表示される(スクリーンリーダーにも通常テキストとして伝わる)。

## 正式画像へ差し替える手順

1. [character-image-guidelines.md](character-image-guidelines.md) の受け入れ仕様を満たす
   正式画像(推奨: 透過 WebP 1600px 以上)を `public/images/supitaro/` に置く
2. `config/site.ts` の `images.hero` / `images.profile` の `src` と `alt` を正式版に更新する
3. **`temporaryArtworkNotice` を空文字 `""` にする**(注記が全箇所から消える)
4. 仮画像ファイル `supitaro-temporary-main.svg` を削除する
5. 本文書を削除するか、履歴として「差し替え済み」に更新する

## 実画像登録時に再確認する項目

[character-image-guidelines.md](character-image-guidelines.md) 末尾の監査チェックリストを実施
(横スクロール / 切れ / 重なり / 404 / layout shift / 浮遊 / reduced motion /
360px での顔判別 / alt / Console / 転送サイズ)。

## 今回の検証結果(2026-07-11、Chromium)

- 5 viewport × `/` `/profile` `/news`: 横スクロールなし、画像切れなし、テキスト重なりなし
- 配信: SVG 直接配信 200、`Content-Type: image/svg+xml`、404 なし、重複読み込みなし
- 読み込み: hero は eager(priority)、profile は `loading="lazy"`、CLS = 0(全ページ)
- 浮遊: セクション内に収まり動作、reduced motion で完全停止
- JavaScript 無効: 画像・本文とも表示
- Console: エラー・hydration warning ゼロ
