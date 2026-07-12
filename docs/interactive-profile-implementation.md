# インタラクティブ・プロフィール実装メモ(Sprint 12)

プロフィール項目をタップして詳細を読める UI(Phase 2)の実装判断を短く記録する。

## 目的

プロフィールを「最初から全部説明するページ」ではなく、
**気になる項目をタップしてすぴたろうを少しずつ知るページ**にする。
一方で、No-JS 環境や検索エンジンには確定情報がすべて残る設計にする。

## 採用 UI

- プロフィール項目を宇宙カプセル風の角丸カード(カード全体が `button`)で表示。
- タップで詳細ダイアログを開く。
  - モバイル: 画面下からのボトムシート(第一 UI)。
  - デスクトップ: 中央ダイアログ。
- 同一コンポーネント `ProfileDetailSheet` を CSS(`items-end` → `sm:items-center` ほか)で
  モバイル/デスクトップに適応させ、別実装にしない。

## データ

- 定義元は `content/profile.ts` の `profile.traits`(`ProfileTrait[]`)のみ。文章をページへ散在させない。
- `id`(安定英数字)/ `label`(短い問いかけ)/ `summary`(カード用短文)/ `detail`(詳細本文)。
- 将来の複数キャラクター対応へ移しやすい最小構造に留め、過剰抽象化しない(英語フィールドは今回追加しない)。

## 確定情報だけを使う原則

- `traits` は既存の `intro`(宇宙から来た/丸いものが好き/こっそりゲーム配信)を整理しただけ。
- 未確定(性格の詳細・特技・正確な大きさ・独自言語の意味など)は **創作しない**。
  「まだ分かっていません」等は未確定であることの明示であり、設定の創作ではない。
- 独自の言葉(おぱぁ/アパ？/いぱ/まぁっ！/ハッピー/めーおー)は意味を定義しない。
  今回は既存の「すぴたろうの言葉」セクションをそのまま維持し、trait には含めていない。

## 採用したプロフィール項目(4 件)

| id | label | 根拠(確定情報) |
|---|---|---|
| origin | どこから来たの？ | intro「宇宙から来た、ふしぎないきもの」 |
| creature | どんな生き物？ | intro「ふしぎないきもの」+「丸いものが好き」 |
| likes | 好きなものは？ | intro「丸いものが好き」 |
| streaming | なにをしているの？ | intro「家主の留守中に、こっそりゲーム配信」 |

## モバイル/デスクトップ差

- カード: モバイル 2 列(`grid-cols-2`)。詳細はシートで表示。
- シート: モバイルは下から `translate-y-full` → `0`、デスクトップは中央で `opacity`+微小 `translate-y`。
- `max-h-[90dvh]` + 本文 `overflow-y-auto` で、長文・画面回転時も見切れずシート内スクロール。
- iPhone 系の安全領域を `padding-bottom: max(1.25rem, env(safe-area-inset-bottom))` で確保。

## No-JS 方針

- 詳細全文は各カードに SSR 済み(`.js-trait-detail`、既定は `hidden`)。
- ページに `<noscript><style>` を 1 つ置き、**JS 無効時だけ** `.js-trait-detail` を表示し、
  押しても動かない `.js-trait-hint`(くわしく見る)を隠す。
- この方式なら、初期表示のちらつきなし・hydration mismatch なしで進行的強化できる
  (JS 有効時は既定の `hidden` のまま、詳細はシートで表示)。

## JS 有効時の重複読み上げ対策

- JS 有効時、インライン詳細は `hidden`(`display:none`)でフォーカス・読み上げ対象外。
- 詳細はシート(`role="dialog"` / `aria-labelledby` / `aria-describedby`)でのみ提示するため、
  同じ本文が二重に読み上げられない。

## フォーカス管理

- 開いたら閉じるボタンへフォーカス移動。
- ダイアログ内で Tab / Shift+Tab を循環させる簡易フォーカストラップ。
- 背景は `inert` + `aria-hidden` にしてフォーカス・読み上げから除外(portal 以外の `body` 直下要素)。
- 閉じたら起点のカードへフォーカスを返す(`ProfileTraitGrid` が起点を保持)。
- 既存 `MobileMenu` の Escape/フォーカス管理には干渉しない(別コンポーネント・別レイヤー)。

## 背景スクロール制御

- 開くと `documentElement` / `body` の `overflow:hidden`。スクロール位置は保持。
- スクロールバー分を `padding-right` で補い、デスクトップでのレイアウトのズレを防止。
- 開始前の inline style 値を保存し、閉じるとき(アンマウント時)に確実に復元する。
- モバイル Safari 向けにオーバーレイが背面のタップを受けない構成。

## reduced motion

- `prefers-reduced-motion: reduce` 時はスライド/フェードせず即時表示。
- 初期状態から「表示済み」で描画し、アニメーション用の再描画をしない。
- キャラクターの浮遊など既存の軽減挙動には手を加えない。

## URL / 戻る操作

- シートの開閉状態は URL に反映しない(query / hash / History API / deep link なし)。

## 既存プロフィールとの統合(整理した点)

- 以前の「基本情報」dl(名前 / 出身 / 好きなもの / 配信内容)は撤去した。
  - 理由: 同じ確定情報が trait カード(出身→origin、好きなもの→likes、配信→streaming)と
    見出し・intro(名前・基本紹介)に含まれ、二重掲載になるため。**情報の損失はない。**
  - これに伴い、参照されなくなった `ProfileField` 型と `profile.fields` も削除した。
- 維持したもの: キャラクター画像(プレースホルダー)・仮画像注記・名前・基本紹介(intro)・
  独自の言葉・「くわしい設定」枠・見出し階層・モバイル縦並び・PC 表示・Header/Footer・ギャラリーナビ。

## コンポーネント構成

- `app/profile/page.tsx` — Server Component(データ取得・SSR)。
- `components/profile/ProfileTraitGrid.tsx` — Client(開閉状態・フォーカス返却)。
- `components/profile/ProfileTraitCard.tsx` — カード(button + No-JS 詳細)。
- `components/profile/ProfileDetailSheet.tsx` — Client(ダイアログ・フォーカス/スクロール/inert)。

外部ライブラリは追加していない(portal は `react-dom`、アニメーションは CSS transition)。

## 今回実装しなかったもの

- 新キャラクター・架空設定・英語対応・音声・効果音・表情差分・新規常時アニメーション。
- ギャラリー画像追加・正式画像差し替え・URL 共有可能なモーダル状態・CMS/DB。

## 将来の複数キャラクター対応への影響

- `ProfileTrait` はキャラクター非依存の素直な構造。複数キャラクター化する場合は、
  キャラクターごとに `traits` を持たせるだけで `ProfileTraitGrid` / `ProfileDetailSheet` を流用できる。
