# Sprint 32 — locale別ナビゲーション・Footer言語切替実装

Verdict: **LOCALE_AWARE_NAVIGATION_AND_LANGUAGE_SWITCHER_IMPLEMENTED**

## 1. Purpose

Sprint 31 で表示文言を locale 別にした共通 UI について、**リンク先も現在 locale 対応**にする。あわせて Footer に
**JavaScript 不要の言語切替**を追加し 5 locale 間を移動できるようにする。単一関心事は「共通ナビゲーションと
言語切替の URL ローカライズ」。ページ本文・metadata・OG・canonical・hreflang・sitemap の多言語化は対象外。

## 2. Baseline

一致確認済み（commit なしで着手）。

```text
branch = main / working tree = clean
local HEAD = origin/main = remote ref = 88198ceebe00c07ef849ac74667965867dc21ea1
latest commit = feat: localize shared interface labels
```

## 3. Decision-of-record references

Sprint 27（decision of record・競合時優先）/28（ルーティング基盤）/29（Stage A）/30（辞書基盤）/31（共通 UI 辞書適用）。
locale = ja/en/zh-hans/zh-hant/ko、正式 URL = `/ /en /zh-hans /zh-hant /ko`、`/ja`・`/zh` は正式 URL ではない、
News は ja のみ、外国語ページは noindex scaffold。

## 4. Existing navigation findings

- `siteConfig.nav` は `{ key: keyof CommonDictionary; href: string }`（Sprint 31）。href は静的（`/`,`/profile`…）で
  locale 非対応だった。消費は Header/MobileMenu/Footer の 3 箇所。
- `resolveNav(dict)` は href をそのまま通していた（locale 非対応）。
- Header/Footer/MobileMenu は Sprint 31 で props 化済み（MobileMenu は Client、辞書全体でなく文字列のみ受領）。
- 共通 chrome（skip/Header/main/Footer）は `app/[locale]/layout.tsx` が描画し、layout は `params.locale` のみ保持し
  **現在 route を判別できない**。404 は `app/not-found.tsx` が自己完結（locale なし・日本語固定）。

## 5. Existing route availability

`localesWithNews = ["ja"]`（News は ja のみ）。home/profile/gallery は 5 locale で存在。外国語 News（/en/news 等）は
`generateStaticParams` に無く `dynamicParams=false` で 404（既存契約）。`/ja`→307→`/`、`/zh`→404（既存契約・不変）。

## 6. Route-key model

`lib/i18n/routes.ts` に型付き route key を新設（URL 文字列を各所で解析しない）。

```ts
export const routeKeys = ["home", "profile", "gallery", "news"] as const;
export type RouteKey = (typeof routeKeys)[number];
```

`siteConfig.nav[].key`（`keyof CommonDictionary`）は同一の文字列リテラル union のため RouteKey として使え、
config は無変更で済む（型が乖離すれば `dict.common[key]` / `localizedPath(locale,key)` で検出）。

## 7. Localized-path API

`lib/i18n/routes.ts`（locale 別 URL 生成の source of truth）:

```ts
localizedPath(locale, route)          // ja 接頭辞なし / 外国語 /locale 接頭辞
isRouteAvailable(locale, route)       // News は localesWithNews のみ
languageSwitchTarget(route, target)   // §7/§8: 同一ページ、無ければ対象 locale トップ
```

`localizedPath` は純粋関数（可用性判定なし）。可用性は呼び出し側（resolveNav の filter・languageSwitchTarget）が
`isRouteAvailable` でゲートするため、UI からは `/en/news` 等は生成されない。`any`・unsafe cast なし。

## 8. Japanese prefixless paths

`localizedPath("ja", …)` = `/`・`/profile`・`/gallery`・`/news`（接頭辞なし維持）。`/ja` は生成しない
（テスト＋実配信 307→`/` で確認）。ロゴ・Header・MobileMenu・Footer サイトナビの日本語 href は従来と一致。

## 9. Foreign-language paths

`/en`・`/en/profile`・`/en/gallery`、`/zh-hans`・`/zh-hant`・`/ko` と各 profile/gallery。簡体字 `/zh-hans` と
繁体字 `/zh-hant` は独立。外国語 Header/Footer/MobileMenu は News リンクを出さない（3 項目）。

## 10. News availability policy

`isRouteAvailable(locale,"news")` = `localesWithNews.includes(locale)` = ja のみ。resolveNav が外国語で News を除外。
言語切替では News → 外国語は各外国語トップへ（§17）。存在しない外国語 News URL にはリンクしない。

## 11. Header integration

Header に `homeHref`（ロゴ→現在 locale トップ）を追加。nav（`resolveNav(dict, locale)`）で locale 別 href＋ラベル。
デザイン/ロゴ/中央配置/サイズ/レスポンシブ/animation は不変（ロゴ変更は別 Sprint・§16）。

## 12. MobileMenu integration

**MobileMenu は無変更**。Sprint 31 で `nav` prop 駆動になっており、Header が渡す nav が locale 別 href になった結果、
自動的に locale 別 URL になる（Header/MobileMenu は同一 nav 配列を共有＝別配列を作らない）。aria-expanded/Escape/
focus/No-JS 代替導線（Footer サイトナビ）は不変。

## 13. Footer site-navigation integration

Footer nav（`resolveNav(dict, locale)`）で locale 別 href。ja は News を含む 4 項目、外国語は 3 項目。
「サイトメニュー」見出し・`aria-labelledby` 構造・PAGE TOP・FOLLOW・配色・余白は不変（削除/再設計は別 Sprint・§17）。

## 14. Language-switcher model

`languageSwitchTarget(route, targetLocale)`（lib/i18n/routes.ts）が切替先を決定。原則は現在 route の対象 locale URL、
対象に無ければ（外国語 News）その locale のトップ（§7/§8）。言語名は各言語の**自称表記**を `getDictionary(l).localeScaffold.title`
から再利用（日本語/English/简体中文/繁體中文/한국어。専用の言語名キーは追加せず重複を避ける）。

## 15. Language-switcher UI

`components/i18n/LanguageSwitcher.tsx`（Server Component）を新設し Footer に配置（hr の下・© の上）。
`<nav aria-label={言語}>` に 5 言語。aria-label は現在 locale 別（言語/Languages/语言/語言/언어＝新規辞書キー
`navigation.languageSwitcherLabel`）。Footer は `languageSwitcher?: ReactNode` を受け取り、SiteShell が
`<LanguageSwitcher/>` を渡す。404 は省略して非表示（§18）。

## 16. Current-language semantics

現在 locale はリンクにせず `<span aria-current="page">自称表記</span>`（非リンク・太字）。他 locale は `<Link>`。
見た目だけに依存せず `aria-current` で現在言語を伝える。現在言語を再クリックする不自然な遷移は起きない（非リンク）。

## 17. News fallback behavior

`/news`（ja のみ）から外国語へ切り替える場合、外国語 News は存在しないため各外国語トップへ移動する
（English→`/en`、简体中文→`/zh-hans`、繁體中文→`/zh-hant`、한국어→`/ko`）。これは**ページ可用性に基づく明示的な
言語切替先**であり、本文を日本語へ黙示 fallback するものではない。実配信で最終 URL 200 を確認。

## 18. 404 handling

`app/not-found.tsx` は locale を持たないグローバルフォールバック。Footer の `languageSwitcher` を**省略**して
言語切替を非表示にし、日本語トップを現在位置扱いとする（§9 の「非表示にできる明示的な設計」）。
HTTP 404・`<html lang="ja">`・日本語カスタム 404 本文・Header/Footer・ホーム導線（ロゴ→`/`）・No-JS は不変。
404 本文・ルーティングは変更していない。`app/not-found.tsx` の変更は Header/Footer の props 追加に伴う最小差分。

## 19. Server and Client Component boundary

新設の SiteShell・LanguageSwitcher・resolveNav・routes はすべて Server／純関数。辞書取得・パス生成・言語切替先決定は
Server 側で完結し、Client（MobileMenu）へは解決済み `{href,label}[]` と文字列のみ。`usePathname()` に依存せず、
現在 route は各ページが `routeKey` を SiteShell へ渡すことで Server 側に伝える（hydration 後のリンク差し替えなし）。
**Footer は Server のまま**（Client 化しない）。React Context は追加しない。

### SiteShell を導入した理由（chrome を layout から移設）

言語切替は現在ページに対応する別 locale URL へ遷移する必要があり、`app/[locale]/layout.tsx` は locale しか知らず
現在 route を判別できない（Server の pathname hook は無く、middleware は禁止）。そこで共通 chrome（skip/Header/main/
Footer/言語切替）を新 Server Component `components/i18n/SiteShell.tsx` に集約し、各ページが自分の `routeKey` を渡す。
layout は `<html>/<body>` のみに縮小。これは指示の「Footer へ現在 route key を渡すための小規模 Server Component 追加」に該当。
静的生成は維持（dynamic API なし・全ページ Static/SSG）。

## 20. No-JS behavior

Header ナビ・Footer サイトナビ・Footer 言語切替・現在言語表示・skip リンク・日本語ページ・外国語 scaffold・404 は
JavaScript 無効で成立。すべてのリンクは初期 HTML に正しい href を持つ（No-JS 実測で言語切替リンクの href・現在言語
aria-current を確認）。言語切替は Server 解決のため JS 非依存。

## 21. Accessibility

- 言語切替は `<nav aria-label>` の landmark（locale 別ラベル）。現在言語に `aria-current="page"`。
- nav landmark は Header（メイン）/モバイル/Footer サイト/言語 の 4 つで、いずれも別 aria-label → 重大な重複問題なし。
- 言語名は各言語の自称表記で相互に区別可能。focus 表示・キーボード操作・Header/Footer 既存 aria-label は維持。
- 日本語・外国語で accessible name が正しいこと（ロゴ・nav・switcher）をブラウザ監査で確認。

## 22. Tests

- `lib/i18n/routes.test.ts`（新規・9 件）: localizedPath（ja 接頭辞なし/en・zh-hans・zh-hant・ko 接頭辞/簡繁混同なし/
  `/ja`・`/zh` 不生成）、isRouteAvailable（News=ja のみ、home/profile/gallery=5 locale）、languageSwitchTarget
  （同一ページ移動、News→外国語トップ、いかなる route×locale でも `/*/news` を生成しない）。
- `content/i18n/dictionary.test.ts`（更新）: navigation 4 領域名（main/mobile/footer/language）存在＆相異、
  言語名 endonym が全 locale 相異、languageSwitcherLabel の ja が「言語」。
- 既存 locales.test.ts も併走。node は `.ts` 直接実行不可のため Sprint 30/31 同様 tsc→CJS→`node --test`。
- resolveNav（config 依存・alias import）と Header/Footer 描画は、node 単体実行が alias 解決不可・React テスト基盤
  未導入（package 追加禁止）のため、ローカル production 実ブラウザ監査を同等の検証とする。

## 23. Validation results

```text
lint  (eslint)        : exit 0
test  (node --test)   : 36/36 pass（routes 9 + dictionary 18 + locales 9）
typecheck (tsc --noEmit): exit 0
build (next build)    : exit 0 / 19 static pages / 全 Static・SSG / News は /ja/news のみ
git diff --check      : exit 0
```

## 24. Browser audit

ローカル production（`next start`）+ playwright-core + キャッシュ Chromium。**ALL GREEN**。
- locale 別ナビ＋言語切替（JS-on・12 ルート）: Header/MobileMenu/Footer サイトナビの href が locale 別（ja 4 項目・
  外国語 3 項目・外国語 News リンクなし）、ロゴ href が現在 locale トップ、言語切替 5 言語（自称表記・現在言語 aria-current
  非リンク・他言語は正しい切替先 href）、aria-label が locale 別、noindex（ja none/外国語 noindex）、`<html lang>` 正、
  nav landmark 4、console/hydration/failed 0、横スクロール 0。
- 言語切替リンク追跡: /profile・/en/gallery・/news の全切替先が 200。**News→外国語は各外国語トップ**（/en 等・200）で
  外国語 News（/en/news）を生成しない。
- 404: HTTP 404・lang=ja・**言語切替なし**・ロゴ→`/`・ja 4 項目ナビ・404 本文維持。
- 既存契約: `/en/news`・`/zh-hans/news`・`/zh-hant/news`・`/ko/news`・`/zh`=404、`/ja`=307→`/`（不変）。
- No-JS（390）: 言語切替リンクの href・現在言語 aria-current が locale 別に正、lang 正、横スクロール 0。
- レスポンシブ 320/768/1024/1440 × 10URL: 横スクロール 0。

## 25. Changed files

新規 4: `lib/i18n/routes.ts`・`lib/i18n/routes.test.ts`・`components/i18n/LanguageSwitcher.tsx`・
`components/i18n/SiteShell.tsx`。
変更 15: `components/i18n/resolveNav.ts`・`components/Header.tsx`・`components/Footer.tsx`・
`content/i18n/{ja,en,zh-hans,zh-hant,ko,dictionary.test}.ts`・`app/[locale]/{layout,page,profile/page,gallery/page,news/page}.tsx`・
`app/not-found.tsx`。＋本文書。計 19 ファイル（+ 本文書 = 20）。
**無変更**: `config/site.ts`（nav key が RouteKey 互換で不要）・`components/MobileMenu.tsx`（nav prop 駆動で自動対応）・
`next.config.*`・`package.json`・lockfile・`public/**`・`content/{profile,gallery,news}.ts`。

## 26. Risks

- 外国語共通 UI 文言（languageSwitcherLabel 含む）は AI 初稿・未検証（noindex・後続で人間確認・置換）。
- 言語切替リンクの追加は外国語版の正式公開完了を意味しない（外国語ページは依然 noindex scaffold・§15）。
- 共通 chrome を layout から SiteShell（ページ描画）へ移設した。DOM 出力・静的生成は不変だが、今後ページ追加時は
  SiteShell で routeKey を渡す必要がある（新 route key は routeKeys に追加）。
- Header/Footer/switcher の描画は単体テスト未追加（ブラウザ監査で代替）。

## 27. Deferred work

外国語共通 UI の人間確認・正式承認、各言語版ページ本文の正式翻訳、言語別 metadata（title/description/OG）、
canonical/hreflang/sitemap/robots（ドメイン後）、Header ロゴ変更・Footer「サイトメニュー」再設計（別 Sprint）、
News の多言語化（現状は ja のみ）。

## 28. Recommended next Sprint

**各言語版トップページの正式翻訳・人間確認**（範囲 B の 1 ページ目）。本 Sprint の localizedPath・SiteShell・
LanguageSwitcher・辞書を土台に、scaffold を実ページ本文へ置換していく。

## 29. Final verdict

**LOCALE_AWARE_NAVIGATION_AND_LANGUAGE_SWITCHER_IMPLEMENTED**

Header/MobileMenu/Footer のリンク先を locale 別 URL 化し、Footer に No-JS の言語切替（現在言語明示・現在ページ対応・
News は外国語トップへ明示 fallback）を追加。日本語接頭辞なし URL・外国語 News 非表示・404・No-JS・アクセシビリティ・
ルーティング契約を回帰なしで維持。lint/test/typecheck/build・実ブラウザ／No-JS 監査すべて green、許可外変更なし。
