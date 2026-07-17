# Sprint 31 — 共通UI定型文の辞書適用

Verdict: **SHARED_UI_TRANSLATION_DICTIONARY_INTEGRATION_IMPLEMENTED**

## 1. Purpose

Sprint 30 の型付き翻訳辞書基盤を、Header・Footer・共通ナビゲーション・アクセシビリティラベル（skip リンク・
メニュー開閉・nav 領域名）へ適用する。単一関心事は「共通 UI 定型文を型付き翻訳辞書へ接続する」こと。
プロフィール／ギャラリー／News 本文・キャッチコピー・正式な外国語ページ本文・言語切替 UI・言語別 metadata は対象外。

## 2. Baseline

一致確認済み（commit なしで着手）。

```text
branch = main / working tree = clean
local HEAD = origin/main = remote ref = 2ef5ea31d7d1300e1d36828b405025c21e8e56b0
latest commit = feat: add typed translation dictionary foundation
```

## 3. Decision-of-record references

Sprint 27（decision of record・競合時優先）／28（ルーティング基盤）／29（Stage A 実配信）／30（辞書基盤）。
locale = ja/en/zh-hans/zh-hant/ko、URL = `/ /en /zh-hans /zh-hant /ko`、辞書 = `content/i18n/**`、
`getDictionary(locale)`（runtime で ja へ黙示 fallback なし）、未翻訳ページは非公開・外国語は noindex scaffold。

## 4. Existing shared-UI findings

- `components/Header.tsx`（Server）: ロゴリンク aria-label `${characterName} ホーム`、デスクトップ nav
  `aria-label="メインナビゲーション"`（`hidden md:block`）、`siteConfig.nav` で項目描画、`<MobileMenu/>` を内包。
- `components/MobileMenu.tsx`（Client `"use client"`）: 開閉ボタン sr-only「メニューを開く/閉じる」、
  `aria-label="モバイルナビゲーション"`、`siteConfig.nav` で項目描画。
- `components/Footer.tsx`（Server）: h2「サイトメニュー」（`id="footer-menu-heading"`、nav は
  `aria-labelledby` で参照）、`siteConfig.nav` で項目描画。PAGE TOP・FOLLOW（SocialFollowLinks）は対象外。
- `app/[locale]/layout.tsx`（Server）: skip リンク「本文へスキップ」、Header/Footer を描画、`params.locale` を保持。
- `app/not-found.tsx`（Server・自己完結グローバル 404）: 自前 `<html lang="ja">`＋Header/Footer、
  skip「本文へスキップ」、404 本文（日本語）。locale を持たない（全未マッチの共通フォールバック）。
- `.label` を消費するのは `siteConfig.nav` だけで、Header/Footer/MobileMenu の 3 箇所に限定。
  ChannelLinks/ContentCard/Profile の `.label` は編集コンテンツで対象外。

## 5. Existing navigation configuration

`config/site.ts` の `nav` は `{ label, href }`（ラベル直書き）で、Header/MobileMenu/Footer が参照する唯一の定義元。
ラベル ホーム/プロフィール/ギャラリー/お知らせ は辞書 `common.{home,profile,gallery,news}` と 1:1 対応。

## 6. Dictionary schema changes

`navigation` セクションに **`mobileNavigationLabel` を 1 キー追加**（MobileMenu の nav 領域名。既存は
main/footer の 2 つのみだった）。他の適用対象（common 4・main/footer ラベル・accessibility 3）は Sprint 30 で
既に存在。ページ本文の辞書化・将来キーの大量追加・同義キー重複・Header/Footer 同一ラベルの二重定義はしない
（main/mobile/footer は別領域の別名。テストで 3 つが相異なることを保証）。

## 7. Japanese wording preservation

日本語辞書値は既存の正式文言と完全一致（表記変更・句読点変更・大文字小文字変更なし）。テストで固定検証:
common=ホーム/プロフィール/ギャラリー/お知らせ、navigation=メインナビゲーション/モバイルナビゲーション/サイトメニュー、
accessibility=本文へスキップ/メニューを開く/メニューを閉じる。ロゴ aria-label は
`${characterName} ${common.home}` で ja は「すぴたろう ホーム」を byte 一致で再現。

## 8. Foreign-language UI wording

en/zh-hans/zh-hant/ko の共通 UI 定型文は **Sprint 27 D-03 の AI 初稿**（人間未確認）。外国語ページは noindex で、
後続 Sprint で人間確認・正式承認が必要。キャラクター本文・固有語の翻訳ではない。簡体字と繁体字は独立記述
（例: mobileNavigationLabel = 移动端导航 / 行動版導覽）。ナビ・アクセシビリティラベルとして短く自然な表現を優先。

## 9. Header integration

`Header` を props 化: `nav`（解決済み `{href,label}[]`）・`navLabel`（main aria）・`homeLabel`（ロゴ aria 用）・
`menu`（MobileMenu へ渡す navLabel/open/close）。デスクトップ nav の aria-label とラベルを props から描画。
デザイン・ロゴ・中央配置・サイズ・レスポンシブ・メニュー構成・**リンク先・animation は不変**。
`siteConfig.characterName`（固有名）とロゴ画像パスは従来どおり。ロゴ変更は別 Sprint。

## 10. Footer integration

`Footer` を props 化: `nav`（解決済み）・`menuHeading`（「サイトメニュー」相当）。h2 と nav 項目を props から描画。
`aria-labelledby` 構造・デザイン・余白・リンク構成・PAGE TOP・FOLLOW は不変。「サイトメニュー」削除・言語リンク追加・
再設計はしない（別 Sprint）。

## 11. Navigation-label resolution

**Option A を採用**（config は URL・識別子のみ、表示ラベルは辞書から解決）。理由 = 最小差分かつ型安全で、
URL と表示文言の責務分離を改善し、日本語ラベルの二重管理（config と辞書）を解消するため。
`config/site.ts` の `NavItem` を `{ key: keyof CommonDictionary; href: string }` に変更し、`nav` を
`{ key: "home"|"profile"|"gallery"|"news", href }` に。解決は `components/i18n/resolveNav.ts` の
`resolveNav(dict) => { href, label: dict.common[item.key] }[]`。`item.key` は型付きで任意文字列アクセスなし。
config へ 5 言語分の文言重複保持・locale 別ナビ配列・string key の無制限アクセスはしない。

## 12. Accessibility-label integration

- skip リンク: layout は `dict.accessibility.skipToContent`（locale 別）、404 は ja（後述）。
- メニュー開閉ボタン: `dict.accessibility.openMenu/closeMenu`（locale 別・aria の可視名は sr-only）。
- nav 領域名: Header=`mainNavigationLabel`、MobileMenu=`mobileNavigationLabel`、Footer=h2（`footerNavigationLabel`）
  が `aria-labelledby` 参照先。いずれも locale 別。
- `aria-current`・focus 表示・キーボード操作・ランドマーク（header/main/footer 各1）・可視テキストと
  ラベルの整合は既存挙動を維持（ブラウザ監査で確認）。

## 13. Server and Client Component boundary

辞書取得は Server Component（`app/[locale]/layout.tsx`・`app/not-found.tsx`）で `getDictionary(locale)` を呼ぶ。
Server の Header/Footer には解決済みナビ＋必要文字列のみを props で渡す。**Client の MobileMenu へは辞書全体でなく
解決済み `{href,label}[]` と 3 文字列（navLabel/open/close）だけを渡す**（`siteConfig` import を撤去）。
Client 内で getDictionary を呼ばない・locale をクライアント状態にしない・runtime fetch なし・
hydration 後の文言切替なし。

## 14. URL preservation

辞書適用で URL 生成は変更していない。ナビ href は全 locale で `/ /profile /gallery /news` のまま
（ラベルのみ翻訳・href は非ローカライズ。外国語ナビの href ローカライズ＝言語切替は後続 Sprint）。
ルーティング・rewrites・redirects・`/ja` 正規化・外国語 News 404・not-found 構造は不変。ブラウザ監査で href 不変を確認。

## 15. 404 handling

`app/not-found.tsx` は locale を持たないグローバルフォールバック（B1 回避のため常に日本語 chrome）。
Header/Footer が props 化されたため、**`getDictionary("ja")` で解決した文字列を渡す**（＝日本語 chrome 維持）。
HTTP 404・`<html lang="ja">`・日本語カスタム 404 本文・Header/Footer・ホーム導線・No-JS は不変。
404 本文（「ページが見つかりません」等）は変更していない。言語別 404 本文は後続 Sprint。
`app/not-found.tsx` の変更は「Header/Footer が props 化された結果 unavoidable」な条件付き許可（ルーティング／
404 本文／locale source of truth の変更ではなく、最小差分）。

## 16. No-JS behavior

Header・Footer・ナビ・skip リンク・外国語 scaffold・日本語ページ・404 は JavaScript 無効でも成立。
辞書適用はすべて Server 側で解決するため No-JS 依存なし。No-JS のモバイル導線は Footer の「サイトメニュー」nav
（従来設計どおり）で、locale 別ラベルが JS なしで表示される（監査で確認）。

## 17. Tests

`content/i18n/dictionary.test.ts` に 3 件追加（計 16 件、+ 既存 locales 9 = 25 件）:
- navigation の main/mobile/footer が全 locale に存在し互いに異なる（二重定義防止）。
- common が全 locale に home/profile/gallery/news を持つ。
- 日本語辞書の共通 UI 文言が既存正式文言と完全一致（表記維持の回帰ガード）。
既存の「キー構造一致」「runtime fallback なし」「zh-hans/zh-hant 独立」等も併走。欠落・余剰キーは Sprint 30 と同じく
型（`satisfies Dictionary` / `Record<Locale,Dictionary>`）＋ build で拒否。
Header/Footer/MobileMenu の描画検証は、React コンポーネントのレンダリングテスト基盤（jsdom / RTL）が
未導入で追加は package 変更（禁止）に当たるため、**ローカル production build の実ブラウザ監査を同等の検証**として用いる。

## 18. Validation results

```text
lint  (eslint)        : exit 0
test  (node --test)   : 25/25 pass（dictionary 16 + locales 9）
typecheck (tsc --noEmit): exit 0
build (next build)    : exit 0 / 19 static pages / 全 Static・SSG / News は /ja/news のみ
git diff --check      : exit 0
```

テスト実行は Sprint 30 と同方式（この Node は `.ts` 直接実行不可 → プロジェクト tsc で CJS へコンパイル後 `node --test`）。
`package.json` へ test script は追加していない。

## 19. Browser audit

ローカル production（`next start`）+ playwright-core + キャッシュ Chromium。**ALL GREEN**。
- 共通 UI（JS-on・1280）10 ルート（ja `/ /profile /gallery /news`、en `/en /en/profile /en/gallery`、
  `/zh-hans /zh-hant /ko`）: Header ナビラベル・footer 見出し＋ナビ・main/mobile nav aria-label・skip リンク・
  ロゴ aria（`すぴたろう`＋locale 別 home）がすべて locale 別に正、**ナビ href は全 locale で `/ /profile /gallery /news` 不変**、
  robots（ja none / 外国語 noindex,nofollow）、header/footer/main 各 1、console/hydration/failed 0、横スクロール 0。
- 404 `/no-such-page`: HTTP 404・lang=ja・日本語 chrome（サイトメニュー/本文へスキップ/メインナビゲーション/ナビ日本語）・
  404 本文維持。
- モバイルメニュー開閉（390・ja/en）: 開閉ボタン sr-only（開く/閉じる）と mobile nav aria-label が locale 別、
  `aria-expanded` false→true→Escape で false、リンク locale 別。
- No-JS（390）5 ルート: skip リンク・footer ナビ（No-JS 導線）が locale 別、lang 正、横スクロール 0。
- レスポンシブ 320/768/1024/1440 × 9URL: 横スクロール 0。

## 20. Changed files

| 種別 | パス | 内容 |
|---|---|---|
| 変更 | `content/i18n/ja.ts` | navigation に mobileNavigationLabel 追加（正本） |
| 変更 | `content/i18n/en.ts` / `zh-hans.ts` / `zh-hant.ts` / `ko.ts` | mobileNavigationLabel 追加（AI 初稿・暫定） |
| 変更 | `content/i18n/dictionary.test.ts` | 共通 UI 辞書テスト 3 件追加 |
| 変更 | `config/site.ts` | NavItem を `{key,href}` 化（Option A）・CommonDictionary 型 import |
| 新規 | `components/i18n/resolveNav.ts` | ナビ解決ヘルパー（型＋resolveNav） |
| 変更 | `components/Header.tsx` | props 化・nav/aria/home ラベルを辞書から |
| 変更 | `components/MobileMenu.tsx` | props 化（辞書全体でなく文字列のみ受領）・siteConfig 依存撤去 |
| 変更 | `components/Footer.tsx` | props 化・見出し/ナビを辞書から・siteConfig.nav 依存撤去 |
| 変更 | `app/[locale]/layout.tsx` | getDictionary＋resolveNav・skip/Header/Footer へ props |
| 変更 | `app/not-found.tsx` | getDictionary("ja")＋resolveNav・日本語 chrome 維持（条件付き許可） |
| 新規 | `docs/sprints/sprint-31-apply-dictionaries-to-shared-ui.md` | 本文書 |

計 13 ファイル（+ 本文書）。`components/Header.tsx` 等はフラット構成（`components/Header/**` ではない）で、
指示の「同等の既存 Header／Footer／Navigation ファイル」に該当（MobileMenu＝モバイルナビ）。
`next.config.*`・`package.json`・lockfile・`public/**`・`content/{profile,gallery,news}.ts`・`lib/i18n/**` は無変更。

## 21. Risks

- 外国語共通 UI 文言は AI 初稿・未検証（noindex・後続で人間確認・置換）。
- 外国語ページのナビ href は日本語 URL のまま（ラベルのみ翻訳。href ローカライズ＝言語切替は後続。現状 noindex）。
- Header/Footer のコンポーネント単体レンダリングテストは未追加（test 基盤導入＝package 変更が必要なため）。ブラウザ監査で代替。

## 22. Deferred work

外国語共通 UI の人間確認・正式承認、言語切替 UI と外国語ナビ href のローカライズ、各言語版ページ本文、
言語別 404 本文、言語別 metadata（title/description/OG）、canonical/hreflang/sitemap/robots（ドメイン後）、
Header ロゴ変更・Footer 再設計（別 Sprint）。

## 23. Recommended next Sprint

Sprint 32: 各言語版トップページ本文の実装（範囲 B の 1 ページ目）、または言語切替 UI＋外国語ナビ href の
ローカライズ（Footer 言語リンク＋`localizedPath`）。いずれも本 Sprint の辞書・resolveNav を土台にする。

## 24. Final verdict

**SHARED_UI_TRANSLATION_DICTIONARY_INTEGRATION_IMPLEMENTED**

Header/Footer/モバイルメニュー/skip リンク/nav 領域名を型付き翻訳辞書へ接続し、日本語表示を byte 一致で維持、
外国語 chrome から日本語定型文の混在を除去、Client へは文字列のみ、No-JS・アクセシビリティ・ルーティング・
URL・404 挙動を回帰なしで維持。lint/test/typecheck/build・実ブラウザ／No-JS 監査すべて green、許可外変更なし。
