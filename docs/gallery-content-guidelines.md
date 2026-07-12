# ギャラリー素材ガイドライン

`/gallery` に画像を追加するときの手順と境界ルール。
画像の一般仕様(形式・サイズ・透過余白・alt)は
[character-image-guidelines.md](character-image-guidelines.md) に従う。ここでは
ギャラリー固有のデータ運用と、Obsidian 素材の扱いだけを定める。

## データと配置

- 公開データは `content/gallery.ts` の `galleryItems` 配列で管理する(CMS/DB/API は使わない)。
- 公開画像は `public/images/supitaro/gallery/` に置く。
- 表示されるのは `isPublished === true` の項目だけ。配列が空(または全件 false)なら
  自動的に空状態が表示される。1 件でも公開されればグリッドに切り替わる。

## 画像を 1 点追加する手順

1. Approved な正式画像を `public/images/supitaro/gallery/` に置く(例: `moment-01.webp`)。
2. `content/gallery.ts` の `galleryItems` に項目を追加する:

   ```ts
   {
     id: "moment-01",
     characterSlug: "supitaro",
     image: {
       src: "/images/supitaro/gallery/moment-01.webp",
       alt: "画像の内容を表す短い説明(必須)",
     },
     title: { ja: "タイトル(任意)" },
     isPublished: true,
   }
   ```
3. 追加後に確認する: alt が適切か / 画像サイズ(容量)/ 権利上の公開可否 /
   モバイル(360px)での見え方 / 顔や耳が切れていないか。

## やってはいけないこと

- **仮画像(`supitaro-temporary-main.svg`)をギャラリーに使わない**(開発用素材のため)。
- ダミー画像・外部 URL 画像・存在しないパスを入れない(空パスは HTML に出力しない)。
- 未確定の英語文(`en`)を勝手に作らない。

## Obsidian 素材境界(重要)

キャラクター素材の台帳は Obsidian Vault 側で管理している:

```
C:\Users\Kos\OneDrive\ドキュメント\Obsidian\1st\10_プロジェクト\すぴたろう\
```

この Windows / OneDrive パスは Linux 開発環境・GitHub・Vercel から**直接参照できない**。
したがって:

- Obsidian の絶対パスや OneDrive URL を**コードや画像 src に書かない**。
- シンボリックリンクを作らない。
- **Approved 素材だけ**を、明示的に `public/images/supitaro/gallery/` へ**コピー**して掲載する。
- `Candidates` / `Drafts` / `Inbox` などの未承認素材を無断で採用しない。
- コピーするときは「コピー元・コピー先・変換内容(リサイズ/WebP 化など)」を記録する。

素材台帳 = Obsidian、公開表示データ = repo、という境界を常に保つ。
