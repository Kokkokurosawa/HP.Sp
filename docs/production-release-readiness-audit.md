# 本番公開準備監査(Production Release Readiness Audit)

- 監査日: 2026-07-11(Sprint 6)
- 基準 commit: `ce08581227db4b20e41cdd8e0dbcf04bb46b26a2`(feat: add official social links)
- 性格: **調査・設計・記録のみ。本 Sprint ではデプロイ・ドメイン取得・DNS 変更・本番 URL 設定・OG 画像制作を行っていない**
- 監査環境: ローカル Linux、Chromium Headless Shell 149(Playwright、一時ツール)、production build + `next start`

## 1. 現在のアプリ構成(観察事実)

| 項目 | 値 |
|---|---|
| Next.js | 16.2.10(App Router、Turbopack build) |
| Node 要件 | `>=20.9.0`(next の engines)。ローカルは v22.22.1 |
| package manager | pnpm 11.10.0(`pnpm-lock.yaml` + `pnpm-workspace.yaml` あり。`package.json` に `engines` / `packageManager` フィールドは**なし**) |
| build / start | `next build` / `next start`(標準のまま) |
| ルート | `/` `/_not-found` `/icon.svg` `/news` `/profile` — **全て静的プリレンダリング(○ Static)** |
| Client Components | 3 つのみ(FloatingSupitaro / FadeIn / MobileMenu)。他は Server Components |
| 外部 API / DB / 認証 | **なし** |
| 環境変数 | **不要・不使用**(`process.env` 参照ゼロ、`.env*` ファイルなし) |
| next.config.ts | 実質空(`output` / redirects / rewrites / headers / images 設定なし) |
| middleware | なし |
| 動的ルート・動的レンダリング | なし |
| 外部リクエスト | ランタイムでゼロ(フォントもシステムスタック) |

**判定: 一般的な Next.js 対応ホスティングへ、追加設定なしでそのまま公開可能。**
(全静的・環境変数なし・外部依存なしのため、最も単純なデプロイ形態に該当)

## 2. ホスティング候補比較

| 項目 | Vercel | Cloudflare Pages/Workers | GitHub Pages |
|---|---|---|---|
| Next.js App Router | ネイティブ対応(開発元) | 対応(OpenNext/アダプタ経由) | **非対応**(`output: "export"` の静的化が必須) |
| セットアップ | GitHub 連携のみ、ゼロコンフィグ | アダプタ設定が必要 | 設定変更 + Actions が必要 |
| 自動デプロイ / プレビュー | push で自動 + PR プレビュー | あり | Actions を自作 |
| 独自ドメイン / HTTPS | 対応 / 自動 | 対応 / 自動 | 対応 / 自動 |
| 無料枠 | Hobby プラン(**非商用利用が条件**。本サイトの扱いは §14 判断事項) | 無料枠広め | 無料 |
| 現構成への過不足 | 過不足なし | アダプタ分の運用負荷が過剰 | next/image 等の機能を捨てる変更が必要 |
| 将来拡張(OG 生成・ISR 等) | そのまま対応 | 対応(制約あり) | 不可 |

※ 各サービスの最新の料金・制限値はナレッジ時点の情報であり、**申込前に公式ページで要確認**。

**推奨: Vercel。** 理由: 現構成がゼロコンフィグでそのまま動く唯一の選択肢であり、pnpm / Next 16 の自動検出、PR プレビュー、将来の OG 画像生成(next/og)にも追加作業なしで進めるため。運用負荷が最小。

### Vercel を使う場合の事前整理(実施はしない)

- 対象リポジトリ: `Kokkokurosawa/HP.Sp`(GitHub App 連携が追加される)
- Framework Preset: **Next.js**(自動検出)/ Root Directory: リポジトリ直下
- Install / Build / Output: すべて自動検出(`pnpm install` / `next build` / `.next`)— **上書き不要**
- Node.js: プロジェクト設定で 22.x を選択(engines 未指定のため既定値になる。要確認)
- Production Branch: `main`。push で自動デプロイ、他ブランチ/PR はプレビューになる
- プレビュー URL には Vercel が `X-Robots-Tag: noindex` を付与する(仕様は要確認)
- 環境変数: **不要**
- 初期 URL: `<プロジェクト名>.vercel.app`(プロジェクト名は作成時に決める)
- **`vercel.json` は不要。追加しない**
- 意図しないブランチ公開の回避: production branch を `main` のみに固定し、ブランチを増やした場合はプレビュー扱いのままにする

## 3. 本番 URL・ドメイン方針

今回設定しなかったもの(本番 URL 未確定のため設定してはいけない): canonical / `metadataBase` / sitemap・robots の絶対 URL / OG 絶対 URL / JSON-LD。SNS プロフィール URL の流用や、`*.vercel.app` を恒久 canonical にすることも不可。

- **選択肢 A(標準 URL で早期公開)**: すぐ実運用確認ができるが、URL がブランドと不一致・後で canonical 変更が必要
- **選択肢 B(独自ドメイン後に正式公開)**: URL を一度で確定できるが、選定・購入・DNS 作業が先行

**推奨: A を「Stage A: 非公式プレビュー」として先行し、並行してドメインを選定 → 確定後に canonical/OG/robots/sitemap を一括設定して正式公開(B 相当)。** 表示・導線の実機確認を早く回せることが理由。プレビュー中は SNS 告知しない。

### ドメイン命名原則(候補の登録・購入はしない)

短い / 読みやすい / 発音しやすい / `supitaro` と対応が分かる / ハイフン・数字を避ける / SNS ハンドル(`supitaro_oo`)との整合 / 更新費用・商標・既存サービス衝突の事前確認 / 日本語話者が入力しやすい。
参考案(**利用可能性・商標は未確認の単なる例**): `supitaro.com` / `supitaro.jp` / `supitaro.net`。

## 4. Metadata 監査(app/layout.tsx ほか)

| 項目 | 現在地 | 分類 |
|---|---|---|
| title(default + template) | 設定済み(`%s | すぴたろう公式サイト`) | ✅ 設定済みで妥当 |
| description | 設定済み | ✅ |
| Open Graph(title/description/siteName/locale/type) | 設定済み(images / url なし) | ✅(images・url は URL 確定後) |
| X Card(`summary`) | 設定済み(title/description) | ✅(OG 画像後に `summary_large_image` 検討) |
| viewport / themeColor | 設定済み(`#e3f2fb`) | ✅ |
| icons | `app/icon.svg`(ファイル規約) | ✅(仮 favicon) |
| canonical / alternates | **未設定**(`siteUrl` 空文字時は出力しない条件分岐が実装済み) | 🔜 公開 URL 確定後 |
| metadataBase | **未設定**(同上の条件分岐済み) | 🔜 公開 URL 確定後 |
| OG images / X Card 画像 | 未設定 | 🔜 OG 画像制作 + URL 確定後 |
| robots / sitemap / manifest | 未実装 | 🔜 robots・sitemap は URL 確定後(§6)。manifest は現段階不要 |
| applicationName / authors / creator / publisher / keywords | 未設定 | ➖ 現段階では不要(keywords は SEO 上ほぼ無意味なため恒久的に不要) |

構文エラー・重大問題なし。**X Card 設定と X プロフィール URL(`channels.x`)は別物として正しく分離されている。**

## 5. Open Graph 画像監査

- 現状: `images.og` は空文字、`openGraph.images` 未出力(→ 共有時は各 SNS が title/description のみ表示。壊れた画像参照は発生しない)
- 仮キャラクター画像を OG へ**流用しない**理由: 開発用素材を共有カードとして拡散させない方針(docs/temporary-character-artwork.md の用途限定)+ 透過 SVG は OG に不適
- 正式 OG 画像の推奨仕様: **1200×630px / WebP または PNG / 透過ではなく背景を敷く**(SNS 側の背景色に左右されないため)/ サイト名 + すぴたろう正式画像 + 短いタグライン / 重要要素は中央の安全領域(端 10% を避ける)/ スマホの小さいカードでも顔とサイト名が判別できること / YouTube・X のロゴを画像内に**使わない**(商標)
- 設定時期: 正式キャラクター画像 + 本番 URL(絶対 URL 解決に `metadataBase` が必要)が揃ってから

## 6. favicon / robots / sitemap 監査

**favicon**: `app/icon.svg` は仮素材(ベビーブルーの丸 + 紫の小丸、コード内コメントで仮と明記)。タブで識別可能・小サイズでも潰れない・重大問題なし → **今回変更しない**。正式キャラクター確定後に、ICO/PNG 各サイズ + Apple Touch Icon(180×180 PNG)を検討。Web App Manifest / PWA / Android 対応は現段階**不要**。

**robots / sitemap**: 未実装(app/robots.ts / app/sitemap.ts なし)。**今回は追加せず延期と判定**。理由: sitemap は絶対 URL が必須で、robots も sitemap URL の記載が通例のため、本番 URL 未確定の現状で作ると仮 URL の焼き込みになる。URL 確定後に Next.js Metadata Route(`app/robots.ts` + `app/sitemap.ts`)で 3 ページ分を数行で追加するのが最小手順。
インデックス可否: コンテンツ自体(3 ページ)は公開可能な内容だが、**仮画像のまま検索エンジンへ本格露出させるのはブランド上避けたい** → Stage A では sitemap 未提出 + 告知なしで露出を最小化する(**無条件 noindex は追加しない**。プレビュー URL は Vercel 側の noindex に任せ、正式公開時に何も外す必要がない状態を保つ)。

## 7. セキュリティ・秘密情報監査

| 対象 | 結果 |
|---|---|
| `.env` / `.env.*`(working tree・Git 追跡とも) | **なし** |
| API キー / トークン / private key / 認証情報(追跡ソース全文検索) | **検出ゼロ** |
| ソース内の個人情報・メールアドレス | **検出ゼロ**(git commit の author メールは Git メタデータとして通常どおり存在。GitHub の noreply メール化はユーザー判断事項) |
| SVG 内の script / 外部参照 | **なし**(xmlns 宣言のみ。仮画像・favicon とも) |
| source map | production build はブラウザ向け source map 非生成(Next 既定) |

**環境変数・秘密情報なしで公開可能であることを確認。**

## 8. ライセンス・権利表記監査

- LICENSE ファイル: **なし**(= 著作権法上の権利留保がデフォルト)。コードを OSS にするか、キャラクター権利と分けるかは**ユーザーの判断事項**として保留(勝手に追加しない)
- 仮画像 SVG: 本プロジェクト内で基本図形から作成した**オリジナル開発用素材**(第三者素材・AI 生成でない)
- 第三者素材 / 外部フォント / アイコンライブラリ: **ゼロ**(システムフォント + 手書き SVG のみ)
- YouTube・X の表記: **テキスト名のみ**でロゴ画像の無断使用なし ✅
- サイト上の権利表記: フッターに「© すぴたろう公式サイト」
- README: 権利についての明示的な章はなし(LICENSE 方針決定時に合わせて追記を検討)

## 9. パフォーマンス監査(production・360×800・ローカル)

| 指標 | 実測値 |
|---|---|
| HTML(`/`) | 35.8 KB(非圧縮。ホスティングの gzip/brotli で大幅減、要デプロイ後実測) |
| CSS | 24.9 KB ×1 ファイル |
| JavaScript 合計 | 約 675 KB(非圧縮、Turbopack チャンク。React 19 + Next ランタイム + Motion で標準的な量) |
| 画像 | 2.56 KB(仮 SVG 1 枚のみ) |
| リクエスト数 | 20(RSC プリフェッチ含む)/ **外部リクエスト 0** |
| CLS | **0.0000** |
| LCP 候補 | ヒーローのキャラクター画像(`IMG.size-56`、ローカル 112ms) |
| Console / hydration / 404 | すべてゼロ |
| 常時アニメーション | 浮遊 1 個のみ(transform、reduced-motion で停止) |

制約: Lighthouse CLI はローカル未導入のため未実行(CDP ベースの実測で代替)。回線条件の実測は公開後に行う。**点数目的のコード変更は不要と判定**(改善候補としては Motion の遅延読み込みがあり得るが、現規模では過剰最適化のため記録のみ)。

## 10. 公開前ブラウザ確認チェックリスト(公開後に実施)

対象ブラウザ: Chrome / Safari / Firefox / Android Chrome / iPhone Safari
viewport: 360×800 / 390×844 / 768×1024 / 1024×768 / 1440×900

- [ ] `/` `/profile` `/news` の表示(直接 URL アクセス・リロード含む)
- [ ] YouTube・X リンクの遷移(実端末)
- [ ] モバイルメニュー開閉・Escape・フォーカス返却
- [ ] キーボードのみで全導線を操作
- [ ] reduced motion で浮遊停止
- [ ] JS 無効で本文・ナビ・SNS リンク表示
- [ ] favicon・title・description の表示
- [ ] OG プレビュー / X Card(カード検証ツール。OG 画像未設定の間は文字のみで正常)
- [ ] HTTPS・存在しないパスの 404・Console / Network エラーなし
- [ ] 横スクロールなし・画像切れなし・タップ領域 44px 以上

## 11. 公開後の運用チェックリスト

- [ ] 公開 URL 到達 + HTTPS 有効 + `www` 有無の統一(リダイレクト方向を決める)
- [ ] canonical / metadataBase(URL 確定後の設定 Sprint で)
- [ ] robots / sitemap(同上)
- [ ] OG 画像 / X Card(制作後)
- [ ] GitHub push → 自動デプロイの動作確認、preview / production の区別
- [ ] 旧デプロイへのロールバック手順の確認(Vercel のデプロイ履歴から)
- [ ] ビルドログの確認、公開日・DNS 変更・ドメイン更新期限の記録
- **アクセス解析: 現段階では不要と判定**(初期目標「登録者 100 人」は YouTube Studio / X アナリティクスで測定可能。サイト側解析は必要が生じてから privacy 重視の選択肢を検討。GA は導入しない)

## 12. 推奨公開段階

**Stage A(非公式プレビュー)へ進むのが適切。**
現状は「実装・検証は公開品質、ただし仮画像 + 本番 URL 未確定」であり、標準 URL での本人確認プレビューに最適な状態。Stage B(限定公開・実機確認)はデプロイ後すぐ実施可能。Stage C(正式公開)は 独自ドメイン + 正式画像 + OG + canonical/robots/sitemap が揃ってから。

## 13. 次 Sprint の推奨範囲

1. **Sprint 7(推奨): Vercel Stage A デプロイ** — アカウント作成・GitHub 連携・プロジェクト作成(ユーザー操作)→ 初回デプロイ → 標準 URL での公開後スモーク(§10 チェックリストの自動化可能分)。コード変更は原則ゼロ
2. 並行(ユーザー): 独自ドメイン選定(§3 命名原則)・正式キャラクター画像の制作判断
3. その後: URL 確定後の一括設定 Sprint(canonical / metadataBase / robots / sitemap / OG 画像 / favicon 正式化)

## 14. 未確定事項

ホスティング契約(Vercel Hobby の非商用条件が本サイトに適合するかの最終判断を含む)/ 公開 URL / 独自ドメイン / 正式 OG 画像 / 正式 favicon / 正式キャラクター画像 / 公開日 / LICENSE 方針 / アクセス解析の将来要否。

## 15. 明示的に実施しなかったこと

実デプロイ、Vercel アカウント操作・GitHub 連携、独自ドメイン取得・DNS 変更、canonical / metadataBase / robots / sitemap / JSON-LD / OG 画像 / favicon 変更、GA・Search Console、API 連携、アプリコード変更(重大問題ゼロのため)、LICENSE 追加、commit / push。
