# Sprint 28 — Multilingual Routing Foundation (Implementation)

> **種別**: 実装（コード）。5 locale（ja/en/zh-hans/zh-hant/ko）のルーティング基盤のみ。
> **範囲外（後続 Sprint）**: 正式翻訳・翻訳辞書・Footer 言語切替 UI・言語別 OG/title/description・canonical・hreflang・sitemap・robots。
> **決定 of record**: Sprint 27（D-08=R2、D-02=D で `/zh` 廃止・`/zh-hans`＋`/zh-hant` 採用）。競合時は Sprint 27 を優先。

## 1. Purpose

Sprint 27 の人間決定に基づき、日本語を接頭辞なし `/` で維持したまま、`/en`・`/zh-hans`・`/zh-hant`・`/ko` を成立させる多言語ルーティング基盤を実装する。正式翻訳・言語切替 UI・SEO メタは実装しない。

## 2. Baseline

```text
branch = main / working tree = clean（着手時）
HEAD = origin/main = remote = d0ff0ce0232e54d63631c992079a1fdd492ff9d0
latest commit = docs: decide initial multilingual implementation policy
env = Node v22.22.1 / pnpm 11.10.0 / Next 16.2.10 / scripts: dev,build,start,lint（test スクリプトなし）
```

## 3. Source documents

- `docs/sprints/sprint-26-design-multilingual-url-architecture.md`（R2/D1 設計）
- `docs/sprints/sprint-27-decide-initial-multilingual-implementation-policy.md`（人間決定 9 件・decision of record）

## 4. Existing routing findings（着手前の事実）

- App Router・`src/` なし。ルートは `app/{page,layout,not-found,profile,gallery,news}.tsx`＋`app/globals.css`＋`app/icon.png`。
- `<html lang="ja">` は**単一ルートレイアウト `app/layout.tsx`** に固定（＝言語別 lang にはルート構成の変更が必要）。
- `next.config.ts` 空（i18n/rewrites/redirects なし）。**middleware なし**。sitemap/robots/manifest なし。
- 内部リンクは `next/link`＝No-JS でも `<a href>`。Header/MobileMenu/Footer/Button/ギャラリー/プロフィールの interactive は既存。
- `content/gallery.ts` は `LocalizedText{ja;en?}` 採用済み（多言語の布石）。

## 5. Implemented locale model

`lib/i18n/locales.ts` を唯一の source of truth として新規追加:

- `locales = ["ja","en","zh-hans","zh-hant","ko"] as const` / `type Locale`。
- `defaultLocale = "ja"`（接頭辞なし公開）。
- `isLocale(value): value is Locale`（不明値 `/zh`・`/fr`・大文字・空を弾く型ガード）。
- `htmlLang(locale)`: 内部値 → HTML `lang`（`ja→ja`, `en→en`, `zh-hans→zh-Hans`, `zh-hant→zh-Hant`, `ko→ko`）。**内部 locale 値と `lang` 値を分離**。
- `localePrefix(locale)`: `ja→""`, 他 `"/en"` 等。
- `localesWithNews = ["ja"]`（News は ja のみ）。

`lib/i18n/locales.test.ts`（`node:test`＋`node:assert`・**追加依存なし**）で 9 ケース検証。

## 6. Routing architecture（R2）

- **`app/[locale]/` を唯一のルートレイアウトにする**（`app/layout.tsx` を撤去）。`app/[locale]/layout.tsx` が `<html lang={htmlLang(locale)}>` を出す（不明 locale は `ja` フォールバック）。
- ページ: `app/[locale]/{page,profile/page,gallery/page,news/page}.tsx`。各ページで `generateStaticParams`＋`dynamicParams=false`。
- 日本語は各ページ本文を既存どおり描画。外国語は `components/i18n/LocaleScaffold.tsx`（言語中立の最小プレースホルダー・`noindex`）を描画。**未翻訳本文を日本語のまま公開しない**（D-06）。
- 生成ルート（`pnpm build`）: `/[locale]`(5)・`/[locale]/profile`(5)・`/[locale]/gallery`(5)・`/[locale]/news`(**ja のみ**)＋`/_not-found`＋`/icon.png`。

## 7. Japanese prefixless routing

`next.config.ts`:

- **rewrites（接頭辞なし配信）**: `/ → /ja`, `/profile → /ja/profile`, `/gallery → /ja/gallery`, `/news → /ja/news`。ブラウザ URL は変わらない・内部ルーティング専用・言語自動判定はしない。
- **redirects（正規化）**: `/ja → /`, `/ja/{profile,gallery,news} → /{…}`（307）。`/ja` を公開 URL にしない（重複コンテンツ回避）。
- **middleware は追加していない**（静的解決）。redirect loop なし（rewrite は内部・redirect は外部で相互に再評価されない）。

## 8. HTML lang handling

実測（本番 `next start`）:

```text
/        → <html lang="ja">
/en      → <html lang="en">
/zh-hans → <html lang="zh-Hans">
/zh-hant → <html lang="zh-Hant">
/ko      → <html lang="ko">
404      → <html lang="ja">（グローバル 404）
```

## 9. Unknown locale handling

- `dynamicParams=false` ＋ `generateStaticParams`（対応 locale のみ）で、不明 locale は静的生成されず **404**。
- 実測: `/zh`・`/fr`・`/ja/nope` → 404。`/ja` は公開 locale URL ではなく `/` へ 307。
- `/en/news`・`/zh-hans/news`・`/zh-hant/news`・`/ko/news` → 404（news は ja のみ）。

## 10. Page scope（D-01=B）

初回範囲 = トップ・プロフィール・ギャラリー・404。対象 locale = ja/en/zh-hans/zh-hant/ko。想定 URL（`/en` `/en/profile` `/en/gallery` … `/ko/gallery`）を全て 200 で生成。

## 11. News exclusion

News は ja のみ（`localesWithNews=["ja"]` → news ページの `generateStaticParams` が ja のみ）。`/en/news` 等は**作成せず 404**。ビルドの route table でも `/[locale]/news` は `/ja/news` のみ。

## 12. Metadata preservation（§9 準拠・言語別は後続）

- ルート metadata（`metadataBase`＝暫定 Stage A・title template・OG・twitter `summary_large_image`・`themeColor`）は `app/[locale]/layout.tsx` に移設し**挙動維持**。
- ja 各ページの `title`/`description` は既存どおり（`/profile`＝「プロフィール | すぴたろう公式サイト」等）。
- **canonical / og:url は非出力のまま**（`siteConfig.siteUrl` 空ゲート維持）。
- 外国語ページは `robots: noindex, nofollow`（スカフォールドを索引させない）。言語別 title/description/OG は**後続 Sprint**。
- 実測で消失・重複・エラーなし。

## 13. No-JS behavior

JS 無効で以下を実測（390px）: `/` `/profile` `/news`（ja）・`/en` `/zh-hant`（scaffold）・`/no-such-page`（404）すべて **Header/Footer 表示・正しい `<html lang>`・本文/スカフォールド表示・Footer サイトメニュー 4 件・横スクロール 0**。locale 判定は URL ベース（クライアント JS 依存なし）。

## 14. Tests

- `lib/i18n/locales.test.ts`（`node:test`）: 5 locale のみ有効／`/zh` 無効／未知 locale 無効／`zh-hans`≠`zh-hant`／`htmlLang` 変換／`localePrefix`／news=ja のみ／defaultLocale=ja。**9/9 pass**（当環境の `node` は TS 非対応のため、プロジェクトの `tsc` で CJS へコンパイルして実行＝同等検証。CI/TS 対応環境では `node --test` で直接実行可能）。
- 型安全: `htmlLang` は `Record<Locale,string>` で全 locale 網羅を型保証。
- ルーティング挙動: `pnpm build`（route table）＋ HTTP 33 URL マトリクスで実証。

## 15. Browser audit（playwright-core＋キャッシュ Chromium、`next start`）

- **JS-on 12 URL**: 200/404 正・`<html lang>` 正・Header/Footer 表示・**console error 0・hydration warning 0**（404 の「Failed to load resource: 404」は 404 文書取得に伴う内在ログ）。
- **No-JS 6 URL**: 全て表示・lang 正・Header/Footer・横スクロール 0。
- **レスポンシブ回帰** 320/768/1024/1440 × 6 URL: 横スクロール **0**。
- **ja interactive 回帰**: `/profile` トレイトダイアログ 4 件開閉可・`/` ホームギャラリーライトボックス開閉可（console 0）＝ルート移動後も既存の Client Component が機能。
- **redirect**: `/ja → /`・`/ja/profile → /profile`（ブラウザ追跡）。
- **404**: 全未マッチ path が **日本語カスタム 404（「ページが見つかりません」・Header/Footer・lang=ja・status 404）**。Next 既定の英語 404（Sprint 23 Blocker B1）は出ない。

## 16. Validation results

```text
tsc --noEmit : PASS
eslint       : PASS
pnpm build   : PASS（19 static pages＋_not-found＋icon、real pages は SSG）
node:test    : 9/9 PASS（locale モデル）
HTTP matrix  : 33 URL 全て期待どおり
browser audit: 上記すべて green（回帰なし）
```

## 17. Changed files

追加:
- `lib/i18n/locales.ts` — locale source of truth。
- `lib/i18n/locales.test.ts` — locale モデル検証（依存なし）。
- `components/i18n/LocaleScaffold.tsx` — 外国語ルートの最小スカフォールド（noindex・言語中立）。
- `app/[locale]/layout.tsx` — 唯一のルートレイアウト（per-locale `<html lang>`）。
- `app/[locale]/page.tsx` / `app/[locale]/profile/page.tsx` / `app/[locale]/gallery/page.tsx` — ja 本文 or scaffold。
- `app/[locale]/news/page.tsx` — ja のみ。

変更:
- `next.config.ts` — rewrites（接頭辞なし ja）＋ redirects（`/ja/*` 正規化）。
- `app/not-found.tsx` — 旧 Sprint 24 のネスト 404 を、自己完結のグローバル 404（自前 `<html lang="ja">`＋Header/Footer＋トップへ戻る）へ置換。

削除（`app/[locale]` へ移設）:
- `app/layout.tsx` / `app/page.tsx` / `app/profile/page.tsx` / `app/gallery/page.tsx` / `app/news/page.tsx`。

不変更: `components/**`（i18n 追加除く）・`content/**`・`config/**`・`package.json`・lockfile・`public/**`・`app/globals.css`・`app/icon.png`。既存日本語文言・デザイン・依存は無変更。

## 18. Risks

1. **グローバル 404 の構造**: R2（`[locale]` 単一ルートレイアウト）では未マッチ path にルートレイアウトが無いため、`app/not-found.tsx` が自前で `<html>` を描く（Next.js の想定パターン）。カスタム 404 は正常だが、`[locale]/layout.tsx` の Header/Footer とは別実装（同一マークアップを複製）＝将来 Header/Footer 改変時に 404 側も要同期。
2. **外国語スカフォールドの日本語チュローム**: Footer/Header/skip-link は現状日本語のまま（chrome の翻訳は後続 Sprint）。scaffold 本文は言語中立・noindex で、日本語**本文**は流用していない（D-06 は本文基準で遵守）。scaffold ページに `<h1>` は無い（最小プレースホルダー・後続で置換）。
3. **rewrites/redirects の Vercel 配信**: ローカル `next start` では全緑。Vercel の rewrites/redirects として解決される想定（実デプロイ検証は本 Sprint 範囲外＝停止条件によりデプロイなし）。
4. **redirect の permanent=false**: `/ja/*→/*` は暫定 307。正式ドメイン確定時に 308 化を検討（SEO）。
5. **言語別 title/OG 未実装**: 外国語ページの title は暫定でサイト既定（日本語）だが `noindex` のため索引されない。後続 Sprint で言語別化。

## 19. Deferred work

翻訳辞書（`content/i18n/*`）・正式翻訳・Footer 言語切替 UI（5 言語・200 保証出し分け）・言語別 title/description/OG・canonical・hreflang（ja/en/zh-Hans/zh-Hant/ko/x-default）・sitemap・robots・News 多言語化・chrome（Header/Footer/skip-link）翻訳・言語別 404 本文・scaffold の h1/デザイン。すべてドメイン確定や後続 Sprint に従う。

## 20. Recommended next Sprint

- **Sprint 29**: 型付き翻訳辞書基盤（`Dictionary` interface＋`content/i18n/{ja,en,zh-hans,zh-hant,ko}.ts`、欠落キーはビルドエラー）。まず ja を辞書経由に（画面 byte 一致）。
- 以降: トップ各言語版 → プロフィール → ギャラリー・言語別 404 → Footer 言語切替 → ドメイン後に canonical/hreflang/sitemap/robots/言語別 OG。

## 21. Final verdict

- 5 locale ルーティング基盤を実装。日本語 URL は接頭辞なしで不変、外国語は `/en`・`/zh-hans`・`/zh-hant`・`/ko`、不明 locale と `/en/news` 等は 404、`<html lang>` は locale 別、No-JS 成立、既存 ja の表示・interactive・metadata に回帰なし、依存追加なし。全検証 green。
- 停止条件により commit/push/デプロイは行わない。

```text
MULTILINGUAL_ROUTING_FOUNDATION_IMPLEMENTED
```
