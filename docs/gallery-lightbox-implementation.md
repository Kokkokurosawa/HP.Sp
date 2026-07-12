# ギャラリー・ライトボックス実装メモ(Sprint 14)

`/gallery` のカードをタップ/クリックで大きく閲覧するライトボックスの実装判断を短く記録する。

## 目的

現在公開中のデザインアート 1 枚をより見やすくし、将来画像が増えても使える**最小限の閲覧基盤**を用意する。
前後ナビ・スワイプ・ズーム・ダウンロード・SNS 共有・URL 状態反映・外部ライブラリ追加は**しない**。

## 採用 UI

- カード全体を `button`(`aria-haspopup="dialog"`)にし、押すと画像を大きく表示するダイアログを開く。
  - モバイル: 画面全体に近い暗いオーバーレイ＋中央に余白を残した画像。
  - デスクトップ: 中央ダイアログ(最大幅 `max-w-3xl`・画像は最大高 `78vh`)。
- 同一コンポーネント `GalleryLightbox` を CSS で適応させ、モバイル/デスクトップで別実装にしない。
- 起点カードには「大きく見る」の小さな手掛かり(虫めがねアイコン＋文言)を画像右下に重ねる。

## データ(唯一の定義元)

- 表示内容は `content/gallery.ts` の `GalleryItem`(src / alt / title)からのみ取得。
  ページ・カード・ライトボックスへ同じ文言を重複して直書きしない。
- 今回データは変更していない(掲載済みの `supitaro-design-art-v1` 1 件のまま)。

## No-JS 方針(進行的強化・要素の種類を honest に切り替える)

- **SSR / JavaScript 無効時**: カードは非インタラクティブな `<figure>`(画像 ＋ `<figcaption>` のタイトル)。
  `button` を一切出力しないので、押しても動かない操作要素が残らず、Tab でも止まらない。画像・タイトル・alt は常に読める。
- **JavaScript 有効時(マウント後)**: `GalleryCard` がカード全面を覆う `<button>`(`aria-haspopup="dialog"`)を
  **重ねて**、ライトボックスを開けるようにする。要素を差し替えず重ねるだけなので画像は再マウントされない。
- SSR と初回クライアント描画はどちらも「button なし」で一致するため hydration mismatch は起きない。
  マウント後に button と「大きく見る」の手掛かりが加わるだけで、初期ちらつきは最小。
- `<noscript>` で見た目だけごまかすのではなく、DOM 要素の種類そのものを進行的に強化している。

## フォーカス管理

- 開いたら閉じるボタンへフォーカス移動。
- ダイアログ内で Tab / Shift+Tab を循環させる簡易フォーカストラップ。
- 背景(portal 以外の `body` 直下)を `inert` + `aria-hidden` にしてフォーカス・読み上げから除外。
- 閉じたら起点のギャラリーカードへフォーカスを返す(`GalleryGrid` が起点を保持)。
- 既存のプロフィールダイアログ(`ProfileDetailSheet`)・モバイルメニューは変更しておらず、
  別コンポーネント・別レイヤーで干渉しない。

## 背景スクロール制御

- 開くと `documentElement` / `body` の `overflow:hidden`。スクロール位置は保持。
- スクロールバー分を `padding-right` で補い、レイアウトのズレを防止。
- 開始前の inline style 値を保存し、閉じるとき(アンマウント時)に確実に復元する。
- Sprint 12 のプロフィールダイアログと同じ原理を再利用(共通化は最小限に留め、既存実装は書き換えない)。

## reduced motion

- 通常時: オーバーレイは控えめなフェード、ダイアログは opacity＋ごく小さな scale(300ms)。
- `prefers-reduced-motion: reduce` 時は初期状態から表示済みにして即時表示(scale/フェードなし)。
- フォーカス管理・スクロールロックは reduced motion でも通常どおり。

## 画像表示方針

- `next/image` を使用し、Next.js の画像最適化配信(`/_next/image`)を利用する。
- `object-contain` で**元画像を切り取らない**(顔・耳・尻尾・星・惑星が切れない)。
- 最大高 `78vh` / 最大幅で画面内に収め、layout shift を避ける。lightbox 用に `priority` は付けない。
- ライトボックスは開いたときだけマウントされるため、画像もその時点で読み込まれる。
- 元の 2.1MB PNG は移動・再圧縮・別ファイル変換をしない(配信時に最適化される)。

## 今回非実装(意図的)

- 前後ナビゲーション / スワイプ / ズーム・パン / ダウンロード / SNS 共有 / キャプション編集 /
  カテゴリ / フィルター / URL 状態反映 / 英語対応 / 外部ライブラリ追加。

## 将来画像が増えたときの拡張方針

- `content/gallery.ts` に項目を足すだけでグリッド＋ライトボックスに載る(手順は
  `gallery-content-guidelines.md`)。
- 前後移動が欲しくなったら、ライトボックスに「次/前」ボタン＋左右キーを足す(状態は `GalleryGrid` の
  activeId を配列インデックスで扱う)。URL 反映が要るならその時点で設計する。
- 画像ごとにアスペクト比が大きく異なる場合は、`GalleryItem` に width/height を持たせると
  ライトボックスの寸法予約が正確になる(現在は正方 1 枚のため未対応)。

## 変更ファイル

- `components/gallery/GalleryGrid.tsx` — Client 化。開閉状態・フォーカス返却。
- `components/gallery/GalleryCard.tsx`(新規) — カード。No-JS は `<figure>`/`<figcaption>`、
  JS 有効時のみ全面 `<button>` を重ねてライトボックスを起動(進行的強化)。
- `components/gallery/GalleryLightbox.tsx`(新規) — ダイアログ(portal・inert・スクロールロック・フォーカス)。
- `app/gallery/page.tsx` — Server Component のまま(GalleryGrid を条件表示するだけ。No-JS 対応はカード側で完結)。

外部ライブラリは追加していない(portal は `react-dom`、アニメーションは CSS transition)。
