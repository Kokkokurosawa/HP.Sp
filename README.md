# すぴたろう公式サイト — Foundation v0.1

宇宙から来た、ふしぎないきもの「すぴたろう」の公式キャラクターサイトの土台(Foundation v0.1)です。
完成版サイトではなく、今後のコンテンツ追加・アニメーション拡張・配信導線強化に耐えられる最小限の基盤を目的としています。

## 技術構成

- Next.js 16(App Router)
- TypeScript
- Tailwind CSS v4
- Motion(旧 Framer Motion)
- ESLint 9(eslint-config-next)
- パッケージマネージャ: pnpm

データベース・認証・CMS・外部 API は使用していません(Foundation v0.1 の方針)。

## サイト構成

| パス | 内容 |
|---|---|
| `/` | トップ(ヒーロー・キャラクター紹介・チャンネル導線・最新お知らせ 3 件) |
| `/profile` | プロフィール(基本情報・独自の言葉・将来追加予定の設定) |
| `/news` | お知らせ一覧 |

### ディレクトリ

```
app/          ページ(App Router)・グローバル CSS・favicon
components/   共通コンポーネント
config/       サイト設定(サイト名・URL・ナビ・画像パス)
content/      コンテンツデータ(プロフィール・お知らせ)
lib/          小さなユーティリティ
public/images 画像置き場(現状は空)
```

### 共通コンポーネント

`Header` / `MobileMenu` / `Footer` / `Button` / `SectionHeading` / `ContentCard` /
`Hero` / `CharacterIntroduction` / `ChannelLinks` / `FloatingSupitaro` / `FadeIn`

## 開発コマンド

```bash
pnpm install      # 依存関係のインストール
pnpm dev          # 開発サーバー (http://localhost:3000)
pnpm build        # production ビルド
pnpm start        # production サーバー
pnpm lint         # ESLint
pnpm exec tsc --noEmit  # 型チェック
```

## コンテンツの更新方法

### お知らせを追加する

`content/news.ts` の `newsItems` に要素を追加します。

```ts
{
  id: "2026-08-01-example",      // 一意な ID
  date: "2026-08-01",            // 公開日(YYYY-MM-DD)
  title: "タイトル",
  body: "本文または概要",
  category: "配信",               // "サイト" | "配信" | "その他"
  link: { href: "https://…", label: "リンクの表示名" }, // 任意
}
```

表示は自動で公開日の降順に並びます。トップページには最新 3 件が表示されます。

### プロフィールを更新する

`content/profile.ts` を編集します。将来追加予定の詳細設定は `upcoming` 配列に追記すると
「くわしい設定」セクションに表示されます(空の間は「準備中」表示)。

## 画像の差し替え方法

受け入れ仕様(推奨形式・サイズ・透過余白)と手順の詳細は
[docs/character-image-guidelines.md](docs/character-image-guidelines.md) を参照。概要:

1. 画像を `public/images/supitaro/` に置く(例: `supitaro-main.webp`)
2. `config/site.ts` の `images` に用途別の `src` / `alt` を設定する

```ts
images: {
  hero: { src: "/images/supitaro/supitaro-main.webp", alt: "すぴたろう" },
  profile: { src: "/images/supitaro/supitaro-profile.webp", alt: "すぴたろう" },
  og: { src: "", alt: "" }, // OG は別途 1200×630 画像が必要(未配線・下記参照)
},
```

`src` が空文字の間は、明確なプレースホルダー(「画像準備中」)が表示されます。
favicon は `app/icon.svg` の差し替えで管理します。

## URL の設定方法

`config/site.ts` が唯一の定義元です(ページやコンポーネントへ直書きしない)。

- `siteUrl` — 本番ドメイン。未確定のため空文字(設定すると `app/layout.tsx` の canonical / OG URL が解決されます)
- `channels.youtube` / `channels.x` — **正式 URL 設定済み**(すぴたろう公式の YouTube チャンネルと X アカウント)。URL 変更時は `config/site.ts` のこの 2 行だけを更新します。トラッキングパラメータは付けません。空文字に戻すと「準備中」表示に戻ります(未設定分岐は保守用に維持)

## 今回実装した範囲

- トップ / プロフィール / お知らせ の 3 ページ
- 共通コンポーネント分離(上記 11 個)
- コンテンツ・設定の集約(`config/` と `content/`)
- 軽量アニメーション: キャラクターの上下浮遊、セクションのフェードイン、ボタンのホバー・タップ反応(いずれも `prefers-reduced-motion` で停止・軽減)
- モバイルファーストのレスポンシブ(横スクロールなし、タップ対象 44px 以上)
- アクセシビリティ: セマンティック HTML、スキップリンク、フォーカス表示、モバイルメニューの ARIA(`aria-expanded` / `aria-controls`、Escape で閉じてボタンへフォーカス返却)、外部リンクの明示
- メタデータ: title テンプレート / description / OG / X Card / favicon(仮 SVG)

## 未実装項目(意図的)

- キャラクター画像(プレースホルダー運用。仮画像の生成・第三者画像の使用はしない方針)
- YouTube / X の実 URL(未確定のため空文字 + 準備中表示)
- 本番ドメイン・canonical・OG 画像(未確定。`config/site.ts` に設定箇所のみ用意)
- データベース / 認証 / CMS / 管理画面 / YouTube API / WebGL / 3D / 多言語 ほか指示書 §14 の非目標すべて
- テストフレームワーク(Foundation v0.1 では lint + 型 + build + 手動レンダリング確認で足りると判断)

## 将来拡張候補

- キャラクター画像・OG 画像の差し替え(上記手順)
- 丸ゴシック系 Web フォント(例: Zen Maru Gothic)の導入(現状はシステムフォントスタック)
- お知らせの Markdown 化・個別ページ化(件数が増えたら)
- 表情差分・タップ反応などのアニメーション拡張(Motion 導入済みのため追加しやすい)
- OG 画像の自動生成(`next/og`)

## 検証結果(2026-07-11)

- `pnpm lint` — パス
- `pnpm exec tsc --noEmit` — パス
- `pnpm build` — 成功(全ページ静的生成)
- `pnpm start` + HTTP 確認 — `/` `/profile` `/news` すべて 200、ナビゲーションリンク存在を確認
- 実ブラウザ確認(Chromium) — 360/390/768/1024/1440 幅 × 3 ページで横スクロールなし・コンソール問題ゼロ、モバイルメニュー操作・reduced motion・JavaScript 無効時の表示も確認済み。詳細は [docs/browser-smoke-audit-2026-07-11.md](docs/browser-smoke-audit-2026-07-11.md)
