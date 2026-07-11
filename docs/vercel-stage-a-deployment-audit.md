# Vercel Stage A デプロイ監査(非公式プレビュー)

- 監査日: 2026-07-11(Sprint 7)
- 基準 commit: `04d9f463a2d0f22b88b375da94115739f226866c`(docs: add production release readiness audit)
- 位置づけ: **Stage A = 非公式プレビュー**。Vercel 上は Production Deployment だが、公式 URL としては扱わない(README / X / YouTube / canonical / metadataBase へ掲載・設定しない)

## デプロイ情報

| 項目 | 値 |
|---|---|
| Vercel Project Name | `supitaro-site`(第一候補どおり) |
| 標準 URL | `https://supitaro-site.vercel.app`(記録可の許可をユーザーから受領済み) |
| Deployment Status | Ready(公開 URL が 200 で最新内容を配信していることを外形確認) |
| 対象 commit | ページ内容が origin/main = `04d9f46` と完全一致(ダッシュボード上の commit 表示は未共有) |
| Production branch | `main`(Import 設定どおり) |
| Framework / Root | Next.js 自動検出 / リポジトリルート(Import 設定どおり) |
| Environment Variables | 0 件 |
| Build / Output Override | なし(`vercel.json` なし) |
| Deployment ID | ユーザーから管理画面 URL 経由で共有を受けたが、**本文書には記録しない判断**(管理画面 URL は認証必須の内部リンクであり §22 の「認証 URL は記録しない」に準拠。ID 単体も公開監査上の追加価値がないため非記載。必要時は Vercel Deployments 画面で特定可能) |
| Build 時間 / Build Log warning / Node.js / pnpm(Vercel 表示値) | **未共有・要共有**(次回スプリントの報告時に補完) |
| GitHub 連携 / 自動デプロイ | Import フローにより有効の前提(**次の正規 push 時に Production Deployment 自動作成で実証する**。確認用の空 commit は作らない方針) |
| 配信 | HTTPS(http は 308 で https へ)、brotli 圧縮、東京エッジ(hnd1)から応答 |

## HTTP 監査(§13)

| パス | 結果 |
|---|---|
| `/` | 200、title「すぴたろう公式サイト」 |
| `/profile` | 200、title「プロフィール \| すぴたろう公式サイト」 |
| `/news` | 200、title「お知らせ \| すぴたろう公式サイト」 |
| `/no-such-page` | **404**(Next の not-found、レイアウト付き) |
| `/icon.svg` | 200(`image/svg+xml`) |

日本語文字化けなし・不要リダイレクトなし・Vercel エラーページなし・Server Error なし・CSS / JS / 仮画像すべて読み込み成功・404 リソースゼロ。

## SNS リンク監査(§14)

- YouTube `https://www.youtube.com/@supitaro_oo` / X `https://x.com/supitaro_oo` — 誤字なし・パラメータなし
- 第一 CTA = YouTube(ヒーロー主ボタン + チャンネル塗りカード)、第二 CTA = X を維持
- 全外部リンク(/ = YT×3 + X×2、profile・news = フッター各 2)に `target="_blank"` + `rel="noopener noreferrer"` + sr-only 補足
- 空リンク・`#` リンクゼロ。キーボードで到達し Enter で新しいタブが開くことを実測(フォーカスリング 2px solid 視認)
- JS 無効でも全 SNS リンクが DOM に存在

## モバイル・viewport 監査(§15)

360×800 / 390×844 / 768×1024 / 1024×768 / 1440×900 × 3 ページ(全 15 組み合わせ):
横スクロールなし / ヘッダー崩れなし / 仮画像切れなし / CTA 文字切れなし / タップ対象 44px 以上(ヒーロー 44px、カード 88〜90px)/ フッター密着 / sticky ヘッダーの実害ある重なりなし / **Console error・hydration warning・失敗リクエストゼロ**。モバイルメニュー 5 操作(開く / 閉じる / Escape+フォーカス返却 / キーボード到達)すべて OK。

## アクセシビリティ・動作監査(§16)

Tab 順自然(スキップリンク→ロゴ→ナビ→CTA)/ スキップリンク動作 / フォーカスリング視認 / 見出し階層維持(h1→h2→h3)/ コントラスト回帰なし(実測ワースト 5.48、AA 合格)/ reduced motion で浮遊停止・本文と CTA は表示維持 / JS 無効で全ページの本文・フッターナビ・SNS リンク利用可。

## Metadata 監査(§17)

出力確認: `lang="ja"` / title / description / og:title / og:description / og:locale `ja_JP` / og:type `website` / twitter:card `summary` / favicon(icon.svg)/ viewport / theme-color `#e3f2fb` — すべて正常。
**意図どおり未設定**: canonical / metadataBase / og:image / og:url / robots meta / sitemap(Stage A では設定しない。Vercel 標準 URL を canonical にしない)。

## パフォーマンス(公開 URL・360px)

CLS 0.0000 / LCP 候補 = ヒーロー仮画像(約 160ms、エッジ配信)/ リクエスト 20・外部リクエスト 0 / HTML 35.8KB・CSS 24.9KB・JS 約 675KB(いずれも非圧縮換算。実転送は brotli で圧縮)。

## ロールバック方針(§20)

Vercel は Deployments 画面から過去デプロイへの Instant Rollback / Promote が可能(標準機能)。今回は初回デプロイのため戻り先がなく**未実施**。ダッシュボード上の UI 実在確認はユーザー側での確認事項とし、**次の正規デプロイ以降に手順を実証する**。

## Stage A 判定

**成功。** 全監査グリーン、アプリコード変更ゼロ、本番環境限定の問題なし。標準 URL は確認用に限定し、SNS・README への掲載は行わない。

## 正式公開前の残課題(§21)

開発用仮キャラクター画像 / 仮 favicon / OG 画像なし / canonical・metadataBase なし / robots・sitemap なし / 独自ドメインなし / LICENSE 方針未確定 / 公開日未確定 / Safari・Firefox・実機タッチ未確認 / アクセス解析なし(不要判定済み)/ Vercel ダッシュボード値(Build 時間・Node/pnpm・warning 有無)の共有 / Hobby プラン非商用条件の最終判断。

## 次 Sprint の推奨

1. 次の正規 push で**自動デプロイの実証**(専用の確認 commit は作らない)
2. ユーザー: 実機(iPhone Safari / Android Chrome)での §15 目視、Vercel ダッシュボード値の共有、独自ドメイン選定
3. ドメイン確定後: canonical / metadataBase / robots / sitemap / OG 画像 / favicon の一括設定 Sprint(Stage C 準備)

## 実施しなかったこと

SNS 告知・プロフィール掲載、独自ドメイン・DNS、canonical・metadataBase・robots・sitemap・OG 画像・favicon 変更、正式画像差し替え、アプリコード変更、Vercel 設定変更・CLI 導入・`vercel.json`、環境変数追加、確認用 commit、ロールバック実行、commit / push。
