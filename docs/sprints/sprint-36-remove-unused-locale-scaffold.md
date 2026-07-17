# Sprint 36 — Remove Unused LocaleScaffold / Provisional Dictionary

Sprint 33〜35 で外国語トップ・プロフィール・ギャラリーが正式本文へ置換された結果、暫定表示用の
`LocaleScaffold` コンポーネントと辞書 `localeScaffold` セクションが未使用化した。本 Sprint はその除去。

- 種別: 未使用基盤の除去（cleanup）。commit 前報告で停止。
- 判定: `UNUSED_LOCALE_SCAFFOLD_REMOVED`

---

## 1. Purpose

未使用化した多言語 scaffold 基盤（`LocaleScaffold` コンポーネント／辞書 `localeScaffold` セクション）を、
参照状況を実コード・型・テスト・build で確認したうえで安全に削除する。公開画面の文言・デザイン・URL・
ルーティング・metadata・noindex 契約は一切変更しない。単一関心事＝未使用 scaffold 基盤の除去。

## 2. Baseline

```text
branch = main / working tree = clean（実装前）
local HEAD = origin/main = remote = 363993c8cba193d8b58c7c7edea67a61bc43a779
latest commit = feat: implement multilingual gallery page
```

## 3. Historical role of LocaleScaffold

`LocaleScaffold`（Sprint 28）は外国語ルート成立確認用の最小プレースホルダー。言語中立の「準備中」表示・
noindex・No-JS 静的出力。Sprint 30 で表示文言を型付き辞書 `localeScaffold`（title/description/status）から取得。
Sprint 33（トップ）・34（プロフィール）・35（ギャラリー）で外国語各ページが正式本文へ置換され、
scaffold は各ページから外れた。

## 4. Current route inventory

```text
ja  : /  /profile  /gallery  /news        （正式本文・indexable）
en  : /en  /en/profile  /en/gallery       （正式本文・noindex）
zh-hans/zh-hant/ko : 同上（正式本文・noindex）
News: /ja/news のみ。/en/news 等は 404。
404 : 独立した日本語グローバル 404（app/not-found.tsx・status 404・lang ja）。
```

全外国語ページが正式本文であり、`LocaleScaffold` を描画するルートは残っていない。

## 5. LocaleScaffold reference audit

`grep -rn LocaleScaffold`（docs 除く）:

```text
components/i18n/LocaleScaffold.tsx : 定義本体（E: 自己参照＝削除対象）
content/i18n/schema.ts             : type LocaleScaffoldDictionary = Dictionary["localeScaffold"]（B: 型）
content/i18n/index.ts              : LocaleScaffoldDictionary 型の re-export（B: 型）
```

- **runtime import = 0 件／JSX 利用 = 0 件**（`<LocaleScaffold` 参照なし・import するファイルなし）。
- `LocaleScaffoldDictionary` 型は schema/index 以外で利用なし（config/site.ts は `CommonDictionary` のみ使用）。

## 6. localeScaffold dictionary reference audit

`grep -rn localeScaffold`（docs 除く）:

```text
components/i18n/LanguageSwitcher.tsx:27 : const name = getDictionary(l).localeScaffold.title  → A: runtime 実利用
components/i18n/LocaleScaffold.tsx       : title/description/status（削除対象コンポーネント内）
content/i18n/{ja,en,zh-hans,zh-hant,ko}.ts : localeScaffold セクション定義（削除対象）
content/i18n/schema.ts                    : LocaleScaffoldDictionary 型（B: 型）
content/i18n/dictionary.test.ts           : title/description の検証（C: テスト）
```

分類: A（runtime）＝`LanguageSwitcher` の `localeScaffold.title`（言語自称表記）1 箇所のみ。
description/status は削除対象コンポーネントとテストのみ。

## 7. Runtime usage result

- **LocaleScaffold コンポーネント**: runtime 利用 0 → 削除可。
- **localeScaffold.title**: `LanguageSwitcher` が言語切替の自称表記として **runtime 利用中** →
  単純削除不可（§6 の該当ケース）。自称表記を責務の明確なセクションへ byte 一致で移動してから削除する。
- description/status: 削除対象コンポーネント専用 → 移動不要・破棄可。

## 8. Type and test usage result

- 型: `LocaleScaffoldDictionary` は schema 定義＋index re-export のみで外部利用なし → 削除。
- テスト: `dictionary.test.ts` が `localeScaffold.title`（言語名）・`localeScaffold.description`（fallback 検査）を参照 →
  新セクション `language.name` に合わせて更新。加えて localeScaffold 非存在の検証を追加。

## 9. Language-switcher dependency

`LanguageSwitcher`（Server・No-JS）は各 locale の自称表記を `getDictionary(l).localeScaffold.title` で取得していた。
自称表記（endonym）= `日本語 / English / 简体中文 / 繁體中文 / 한국어`（全 locale 相異・byte 確定値）。

**責務移動**: 新セクション `language: { name }` を全 5 辞書へ追加し、endonym を **byte 一致**で移設。
`LanguageSwitcher` を `getDictionary(l).language.name` へ変更。新規表示文言・翻訳は作らない（§6 準拠）。
`navigation.languageSwitcherLabel`（aria ラベル）はそのまま（重複させない）。

## 10. Cleanup decision

削除前提（§2）をすべて満たす:

```text
- LocaleScaffold runtime import = 0 ✓
- LocaleScaffold JSX 利用 = 0 ✓
- 外国語トップ/プロフィール/ギャラリー = 正式本文 ✓
- News = ja のみ・既存 404 契約 ✓
- 404 = 独立した日本語グローバル 404 ✓
- localeScaffold 辞書値の公開 UI 利用 = title のみ（責務移動で解消） ✓
```

→ 判定 = **削除実行**（`localeScaffold.title` は `language.name` へ移動後に削除）。

## 11. Deleted component

```text
components/i18n/LocaleScaffold.tsx  （git rm・参照 0 を確認）
```

削除に伴い app/[locale] ルーティング・SiteShell・Header・Footer・LanguageSwitcher・404・noindex・metadata・
ページ本文は変更していない。

## 12. Dictionary-schema changes

- 5 辞書（ja/en/zh-hans/zh-hant/ko）から `localeScaffold` セクション（title/description/status）を削除。
- 各辞書へ `language: { name: "<endonym>" }` を追加（endonym は旧 `localeScaffold.title` と byte 一致）。
- `schema.ts`: `export type LocaleScaffoldDictionary = Dictionary["localeScaffold"]` を削除。
  `Dictionary` 型は ja から `DeepStringShape` で自動導出のため、`language` セクションは型に自動反映。
  新規セクション型 export は追加しない（`LocaleScaffoldDictionary` が外部未使用だったため、最小削除に留める）。
- `index.ts`: `LocaleScaffoldDictionary` の re-export を削除。
- 辞書責務（§7）: 日本語辞書がキー構造の source of truth・5 locale 完全同一構造・欠落/余剰キーは TS 拒否・
  全値 string・runtime fallback なし、は不変（tsc/test で確認）。

## 13. Language-name responsibility

言語自称表記は暫定 scaffold（`localeScaffold`）から、言語切替 UI 責務の `language` セクションへ移した。
値は byte 一致（`日本語 / English / 简体中文 / 繁體中文 / 한국어`）。新規文言・翻訳の作成なし。
`components/Footer.tsx`・`SiteShell.tsx`・`lib/i18n/locales.ts` は変更不要（条件付き許可の発動なし）。

## 14. Public UI preservation

公開画面の文言・デザイン・URL は不変。`LocaleScaffold` は元々どのルートからも描画されない未使用
コンポーネントのため、削除で公開 HTML に差分は発生しない。言語切替の表示（5 endonym・aria-current・
リンク先）はブラウザ監査で従来どおりと確認（§21）。

## 15. Route preservation

app/** は無変更。ルーティング・rewrites・redirects・middleware・generateStaticParams・dynamicParams は不変。
`/ja`→prefixless 正規化、外国語 News 404、不明 locale 404、`/zh` 404 も不変。

## 16. noindex and metadata preservation

外国語トップ/プロフィール/ギャラリーの noindex、日本語 metadata（title/description/OG/twitter）、
canonical/hreflang/sitemap/robots は一切変更していない。本 Sprint は SEO Sprint ではない。

## 17. News and 404 preservation

`/news`=日本語 News（200）、`/en/news`・`/zh-hans/news`・`/zh-hant/news`・`/ko/news`=404、
`/no-such-page`=日本語カスタム 404、`/zh`=404、`/ja`=prefixless 正規化。すべて不変。
scaffold 削除を理由に外国語 News や言語別 404 は追加していない。

## 18. No-JS behavior

JavaScript 無効でも 5 locale のトップ/プロフィール/ギャラリー本文・Header/Footer・言語切替（5 endonym）・
日本語 404 が維持されることをブラウザ監査（javaScriptEnabled:false）で確認。削除対象は未使用コンポーネントの
ため公開 HTML に差分なし。

## 19. Tests

`content/i18n/dictionary.test.ts` を新構造へ同期:

- `REQUIRED_CATEGORIES` を `localeScaffold` → `language` へ。
- 言語名検証を `localeScaffold.title` → `language.name` へ（5 endonym・相異は維持）。
- fallback 検査を `localeScaffold.description` → `language.name`（locale 別相異値）へ。
- **追加**: `localeScaffold` セクションが全辞書から削除済みであることの検証。
- 共通ナビ／accessibility／ja 共通 UI byte 一致／構造一致の各検証は維持。

結果 18 → **19 件**。他テスト（locales/routes/topPage/profileContent/galleryContent）は回帰なし。

## 20. Validation results

```text
npm run lint       → 0 problems
npx tsc --noEmit   → exit 0
npm run build      → 19 static pages（全 locale SSG・throw なし）
node tests         → dictionary 19/19・gallery 9/9・profile 8/8・topPage 7/7・locales 9/9・routes 9/9 = 61/61
残存参照            → LocaleScaffold=0・localeScaffold=削除検証テストの文字列のみ
```

## 21. Browser audit

ローカル production（`next start`）で playwright-core 監査。**失敗 0**。

- 8 ページ（/・/en・/en/profile・/en/gallery・/zh-hans・/zh-hant/profile・/ko/gallery・/news）:
  status・final URL・html lang・noindex（ja=false/外国語=true）・h1・Header/Footer 1/1・
  **言語切替 5 endonym 表示・aria-current 非リンク span・切替リンク 4 件**・console/failed 0・横スクロール 0（320-1440）。
- Gallery lightbox（/en/gallery）: open→Escape close。Profile dialog（/en/profile）: open→Escape close。
- 404: /no-such-page=404・lang ja・「ページが見つかりません」（英語既定なし）、/en/news=404。
- No-JS（/en・/ko/gallery）: h1・言語切替 5 endonym・横スクロール 0。

## 22. Changed files

```text
削除:
  components/i18n/LocaleScaffold.tsx
変更:
  components/i18n/LanguageSwitcher.tsx   （localeScaffold.title → language.name）
  content/i18n/ja.ts                     （localeScaffold → language セクション）
  content/i18n/en.ts
  content/i18n/zh-hans.ts
  content/i18n/zh-hant.ts
  content/i18n/ko.ts
  content/i18n/schema.ts                 （LocaleScaffoldDictionary 型削除）
  content/i18n/index.ts                  （型 re-export 削除）
  content/i18n/dictionary.test.ts        （language.name へ同期＋非存在検証追加）
新規:
  docs/sprints/sprint-36-remove-unused-locale-scaffold.md
不変（重要）:
  app/**・content/{topPage,profile,profileContent,gallery,galleryContent}.ts・config/site.ts・
  Footer.tsx・SiteShell.tsx・lib/i18n/**・next.config.*・package.json・lockfile・public/**
```

## 23. Risks

- endonym の source が `localeScaffold.title` → `language.name` へ移ったのみで値は byte 一致。公開表示は不変。
- `language` セクションは現状 `name` 1 キー。将来 language 切替 UI 文言を増やす場合の受け皿になる。
- `navigation.languageSwitcherLabel`（aria）と `language.name`（endonym）が別セクションに分かれる（責務は明確）。

## 24. Deferred work

- 外国語 UI chrome（Header/Footer/nav/accessibility）の正式翻訳（現状 AI 初稿・未検証）。
- 外国語 metadata・canonical・hreflang・sitemap・404 多言語化・noindex 解除（多言語 SEO 基盤 Sprint）。

## 25. Recommended next Sprint

- 外国語 UI chrome の正式翻訳・人間確認（Sprint 33〜35 と同じ二段階フロー）、または多言語 SEO 基盤
  （canonical/hreflang/sitemap）→ noindex 解除判断。

## 26. Final verdict

```text
UNUSED_LOCALE_SCAFFOLD_REMOVED
（未使用 LocaleScaffold と localeScaffold 辞書セクションを安全に削除。言語自称表記は language.name へ byte 一致移動。
 公開文言・デザイン・URL・ルーティング・metadata・noindex 契約は不変。全検証 green。commit 前報告で停止。）
```
