# Sprint 30 — 型付き翻訳辞書基盤実装

Verdict: **TYPED_TRANSLATION_DICTIONARY_FOUNDATION_IMPLEMENTED**

## 1. Purpose

Sprint 27 で人間決定された多言語実装方針（5 locale・型付き静的辞書・外部 i18n ライブラリなし）に基づき、
後続の各言語版実装に必要な **型付き翻訳辞書の基盤だけ** を実装する。

本 Sprint の単一関心事は「5 locale 対応の型付き翻訳辞書基盤の実装」であり、正式な外国語翻訳文・
外国語ページへの辞書全面適用・Footer 言語切替・言語別 metadata は対象外（それらは後続 Sprint）。

## 2. Baseline

作業開始時に確認した状態（一致）。

```text
branch = main
working tree = clean
local HEAD = origin/main = remote ref = c6e414af64bd09384c68c7949ac04e8a1d4ec385
latest commit = docs: verify stage a multilingual routing deployment
```

Sprint 29 の監査文書は commit・push 済み（実行前提を満たす）。

## 3. Decision-of-record references

- `docs/sprints/sprint-26-design-multilingual-url-architecture.md`（設計 / R2・D1）
- `docs/sprints/sprint-27-decide-initial-multilingual-implementation-policy.md`（**decision of record**。競合時はこれを優先）
- `docs/sprints/sprint-28-implement-multilingual-routing-foundation.md`（ルーティング基盤の実装事実）
- `docs/sprints/sprint-29-audit-stage-a-multilingual-routing-deployment.md`（Stage A 実配信の挙動事実）

採用済み方針（本 Sprint で再検討しない）: locale = `ja / en / zh-hans / zh-hant / ko`、
URL = `/ /en /zh-hans /zh-hant /ko`、`zh` 単独不採用、AI 翻訳は初稿（D-03）、固有語は維持（D-04）、
未翻訳ページは非公開・黙示 ja fallback 禁止（D-06）、外部 i18n ライブラリ不使用（D-07）。

## 4. Existing i18n findings

- `lib/i18n/locales.ts` が locale の唯一の source of truth。公開 API = `locales`（5 要素 `as const`）・
  `Locale` 型・`defaultLocale`・`isLocale()`・`htmlLang()`（内部 locale → BCP-47 `lang`）・
  `localePrefix()`（ja は接頭辞なし）・`localesWithNews`（ja のみ）。
- 内部 locale 値（`zh-hans` 等・URL セグメント・小文字）と HTML `lang`（`zh-Hans` 等・BCP-47）は
  既に別物として分離されている。辞書はこの分離を尊重し、`lang` と辞書 locale ID を混同しない。
- `components/i18n/LocaleScaffold.tsx` は外国語ルートの noindex プレースホルダー（Server Component、
  `locale.toUpperCase()` と英語 1 文を直書き）。呼び出し側ページ（`app/[locale]/**`）が noindex を付与。
- UI 定型文の直書き箇所: ナビラベル（`config/site.ts` の `nav`: ホーム/プロフィール/ギャラリー/お知らせ）、
  skip リンク「本文へスキップ」（`app/[locale]/layout.tsx`・`app/not-found.tsx`）、メニュー aria-label
  「メニューを開く/閉じる」（`components/MobileMenu.tsx`）、ナビ領域名「メインナビゲーション」（Header）・
  「サイトメニュー」（Footer）。本 Sprint はこれらを**辞書に写像するが既存コンポーネントへは適用しない**。
- テスト実行規約: `package.json` に `test` script は無い。既存 `lib/i18n/locales.test.ts` は
  `node:test` + `node:assert`（追加依存なし）。この環境の Node v22.22.1 は `.ts` を直接実行できず
  （`ERR_UNKNOWN_FILE_EXTENSION`）、プロジェクト tsc で CJS へコンパイルしてから `node --test` する。
- tsconfig: `strict: true`・`moduleResolution: bundler`・import alias `@/* → ./*`・`isolatedModules: true`。

## 5. Existing content-model findings

- 編集コンテンツは `config/site.ts`（サイト名・説明・nav・channels・images）と `content/*`
  （`profile.ts`・`news.ts`・`gallery.ts`）に分散。
- `content/gallery.ts` は既に `LocalizedText { ja: string; en?: string }` を持ち、コンテンツ単位で
  多言語値を任意に持てる。**これは編集コンテンツ用モデルであり、UI 定型文辞書とは責務が異なる**。
- 本 Sprint は既存コンテンツモデル（`LocalizedText` / `config` / `content`）を一切変更しない。
  UI 定型文だけを新しい辞書へ集約し、編集コンテンツは従来どおり各所で管理する（§16）。

## 6. Dictionary location

指示の推奨（`src/content/i18n/`）に対し、本リポジトリは `src/` を持たないトップレベル構成のため
**`content/i18n/`** に配置（`content/gallery.ts` 等と同じ階層。責務分離上これが自然）。

```text
content/i18n/
├── schema.ts        # DeepStringShape / Dictionary 型 / セクション型
├── ja.ts            # 日本語辞書（正本・as const）
├── en.ts            # 英語辞書（satisfies Dictionary・暫定）
├── zh-hans.ts       # 簡体字辞書（satisfies Dictionary・暫定）
├── zh-hant.ts       # 繁体字辞書（satisfies Dictionary・暫定）
├── ko.ts            # 韓国語辞書（satisfies Dictionary・暫定）
├── index.ts         # 公開 API（getDictionary / Dictionary / dictionaryLocales）
└── dictionary.test.ts
```

JSON 単独・runtime fetch・外部 CMS・package 追加はいずれも不採用（すべて静的 TS モジュール）。

## 7. Dictionary schema

基盤検証に必要な最小限のみ。4 分類 × 計 12 キー（× 5 locale = 60 文字列）。

```text
common:        home / profile / gallery / news
navigation:    mainNavigationLabel / footerNavigationLabel
localeScaffold: title / description / status
accessibility: skipToContent / openMenu / closeMenu
```

日本語ページ全文の辞書化はしない。未使用の将来キーの先行追加もしない（現に scaffold へ適用する
`localeScaffold` 以外の分類も、Header/Footer 翻訳という具体的後続で使う最小の代表キーに限定）。

## 8. Japanese source-of-truth model

`content/i18n/ja.ts` の `export const ja = { ... } as const` が辞書全体の正本。
日本語の値は既存 UI と一致（nav ラベル・skip・メニュー aria-label・ナビ領域名）。
`localeScaffold` は外国語 scaffold の表示文言で、日本語版では表示されない参照値。

## 9. Dictionary type

`content/i18n/schema.ts`:

```ts
type Leaf = string;
export type DeepStringShape<T> = {
  [K in keyof T]: T[K] extends Leaf ? Leaf : DeepStringShape<T[K]>;
};
export type Dictionary = DeepStringShape<typeof ja>;
```

- ja のキー構造をそのまま保ち、文字列リテラルの葉を `string` へ緩める（外国語に日本語リテラル型を
  要求しない）。homomorphic mapped type なので `as const` 由来の readonly は保持。
- `ja` は `import type` で型としてのみ参照（schema は実行時に読み込まれず、循環依存も生じない）。
- セクション型 `CommonDictionary` / `NavigationDictionary` / `LocaleScaffoldDictionary` /
  `AccessibilityDictionary` を公開（Client Component へ必要な部分型だけ渡す設計を支える）。
- `any` / `Record<string, any>` / unsafe cast は不使用（§12 準拠）。

## 10. Locale coverage

`content/i18n/index.ts` の網羅マップで保証。

```ts
const dictionaries: Record<Locale, Dictionary> = { ja, en, "zh-hans": zhHans, "zh-hant": zhHant, ko };
```

`Locale`（= `lib/i18n/locales.ts` の source of truth）を型引数に使うため、locale 追加時の辞書漏れ・
locale 削除時の余剰辞書がいずれも **TypeScript エラー** になる。5 locale を別ファイルで再度手書きした
locale 一覧は作らない（同期責務を増やさない）。

## 11. Simplified and Traditional Chinese separation

`zh-hans`（簡体字・中国本土向け）と `zh-hant`（繁体字・台湾/香港想定）は**独立した別辞書**として実装
（Sprint 27 D-02=D）。値も別（例: 首页/首頁、简体中文/繁體中文、筹备中/籌備中）。`zh` 単独の辞書 ID は
追加しない。HTML `lang` は `zh-Hans` / `zh-Hant`（`htmlLang()` が担当・辞書 locale ID とは別）。

## 12. Dictionary retrieval API

```ts
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
```

- 引数は既存 `Locale` 型（5 locale 網羅）。未知 locale は型で弾かれる（`getDictionary("zh")` は型エラー）。
- 戻り値型は全 locale 共通の `Dictionary`。runtime network / Node 専用 API なし・静的 import のみ（静的生成維持）。
- Server Component から同期利用可能。辞書全体を Client Component へ渡す設計を強制しない（§17）。

## 13. Missing-key policy

翻訳キー不足は **公開しない・黙って補完しない**。検出は多層:
- 各外国語辞書の `satisfies Dictionary` により欠落キーが TypeScript エラー。
- 網羅マップ `Record<Locale, Dictionary>` により locale 単位の辞書欠落が型エラー。
- `next build` の型チェックで失敗する（= build で検出）。
- テスト「全辞書が ja と同一キー構造」が runtime でも欠落を検出。

実証（一時 probe ファイルで確認・commit しない）: 欠落キー → TS2741。

## 14. Extra-key policy

余分なキーも検出。`satisfies Dictionary`（オブジェクトリテラルの余剰プロパティ検査）で TypeScript エラー、
テストのキー構造一致でも runtime 検出。実証: 余分キー → TS2353、非文字列の葉 → TS2322。

## 15. Runtime fallback policy

**実行時の日本語黙示 fallback は無い**。`dictionaries[locale] ?? dictionaries.ja` のような実装は置かない。
未知 locale はルーティング層（`dynamicParams=false` + 404）で既に排除され、`getDictionary` には
`Locale` しか渡らない。実証: `getDictionary("zh")` / `getDictionary("fr")` は型エラー（fallback 経路が存在しない）。
テストでも各非 ja locale の `localeScaffold.description` が ja と異なることを確認（fallback していない）。

## 16. UI versus editorial-content boundary

| 区分 | 内容 | 管理先 |
|---|---|---|
| UI 定型文 | ナビ・アクセシビリティラベル・共通状態表示・言語 scaffold | `content/i18n/*`（本 Sprint の辞書） |
| 編集コンテンツ | プロフィール本文・キャラクター設定・ギャラリー説明・News 記事・キャッチコピー | `config/*` / `content/*`（`LocalizedText` 等・従来どおり） |

既存 `LocalizedText`（`content/gallery.ts`）とは責務が異なるため辞書へ統合しない。編集コンテンツを
UI 辞書へ無理に取り込まない。既存コンテンツモデルは本 Sprint で変更しない。

## 17. Client Component boundary

辞書全体を Client Component へ渡す構造は作らない。辞書取得は Server Component（`LocaleScaffold` も
Server Component のまま）で行い、必要ならセクション型で必要な文字列だけ props で渡す設計を可能にしている。
locale 切替をクライアント状態へ移さない（URL ベース維持）。既存 Client Component は変更していない。No-JS 動作維持。

## 18. LocaleScaffold integration decision

**適用する**（辞書基盤が孤立しないための最小適用・§9 の許可範囲）。`LocaleScaffold` は Server Component の
まま `getDictionary(locale)` を呼び、`localeScaffold.title / description / status` を表示（従来の
`locale.toUpperCase()` + 英語直書きを置換）。noindex 維持・日本語ページ非影響・Header/Footer 翻訳へ非波及・
Profile/Gallery 本体へ非着手・No-JS 維持・hydration 非増加。レイアウト/クラスは不変（デザイン変更なし）。
外国語 scaffold の全文言は暫定・未検証（noindex・後続の正式翻訳 Sprint で人間確認・置換）。

## 19. Tests

`content/i18n/dictionary.test.ts`（新規・`node:test` + `node:assert`・追加依存なし）13 件:
- locale 網羅性: 辞書マップ ↔ locale source of truth 一致 / 5 locale 存在 / zh-hans・zh-hant 別存在 / `zh` ID なし。
- 取得 API: ja/en/ko の値・zh-hans≠zh-hant・locale ごとに独立参照・日本語黙示 fallback なし。
- スキーマ: 必須分類存在 / 全葉が文字列 / 全辞書が ja と同一キー構造。
- 回帰: 既存 `lib/i18n/locales.test.ts` を併せて実行し green を確認。

型エラー検証の恒久 broken fixture はソースへ置かない（一時 probe で確認後に削除）。

## 20. Validation results

```text
lint  (eslint)        : exit 0（0 problems）
test  (node --test)   : 22/22 pass（dictionary 13 + locales 9）
typecheck (tsc --noEmit): exit 0
build (next build)    : exit 0 / 19 static pages / 全 Static・SSG / News は /ja/news のみ
git diff --check      : exit 0（whitespace エラーなし）
```

コンパイル時ガード実証（一時 probe・未 commit）: 欠落キー TS2741 / 余分キー TS2353 / 非文字列葉 TS2322 /
未知 locale 引数 TS2345。

## 21. Browser regression

ローカル production サーバー（`next start`）+ playwright-core + キャッシュ Chromium。ALL GREEN。
- 外国語 scaffold `/en /zh-hans /zh-hant /ko`（JS-on）: HTTP 200 / `<html lang>` = en・zh-Hans・zh-Hant・ko /
  辞書の title+description+status 表示 / 日本語本文流用 0 / noindex,nofollow 維持 / header・footer・main 各 1 /
  console error 0 / hydration 0 / failed request 0 / 横スクロール 0。
- 外国語 scaffold（No-JS）: 各 locale で辞書文言表示 / lang 正 / Header・Footer あり / 横スクロール 0。
- レスポンシブ 320/375/768/1440: 横スクロール 0。
- ja ルーティング回帰 `/ /profile /gallery /news`: 200 / lang=ja / robots メタなし（indexable・辞書は ja へ未適用）/
  横スクロール 0 / console error 0。
- HTTP マトリクス: `/ja`→307→`/`、`/en/news`・`/zh`・`/fr`・`/no-such-page`→404（日本語カスタム）—
  Sprint 28/29 のルーティング挙動から変化なし。

## 22. Changed files

| 種別 | パス | 内容 |
|---|---|---|
| 新規 | `content/i18n/ja.ts` | 日本語辞書（正本・as const） |
| 新規 | `content/i18n/schema.ts` | DeepStringShape / Dictionary / セクション型 |
| 新規 | `content/i18n/en.ts` | 英語辞書（satisfies・暫定） |
| 新規 | `content/i18n/zh-hans.ts` | 簡体字辞書（satisfies・暫定） |
| 新規 | `content/i18n/zh-hant.ts` | 繁体字辞書（satisfies・暫定） |
| 新規 | `content/i18n/ko.ts` | 韓国語辞書（satisfies・暫定） |
| 新規 | `content/i18n/index.ts` | 公開 API（getDictionary 等） |
| 新規 | `content/i18n/dictionary.test.ts` | 辞書テスト 13 件 |
| 変更 | `components/i18n/LocaleScaffold.tsx` | 表示文言を辞書から取得（+12/-5） |
| 新規 | `docs/sprints/sprint-30-implement-typed-translation-dictionary-foundation.md` | 本文書 |

条件付き許可の `content/index.ts` / `lib/i18n/index.ts` は不要のため作成せず。`lib/i18n/**`・`app/**`・
`config/**`・`data/**`・`next.config.*`・`package.json`・lockfile・`public/**` は無変更。許可外変更なし。

## 23. Risks

- 外国語辞書の値は AI 初稿・未検証（noindex・後続で人間確認・置換前提）。現状で公開表示されるのは
  `localeScaffold` の 3 値のみ。`common`/`navigation`/`accessibility` はまだ画面へ適用していない。
- テストは npm script 化されていない（`package.json` 変更禁止のため）。実行はプロジェクト tsc で CJS へ
  コンパイル → `node --test`。build 時の型チェックでも辞書整合は担保される。
- `getDictionary` はセクション単位の絞り込みを「妨げない」設計だが、実際の絞り込みは各消費者側の責務。

## 24. Deferred work

正式翻訳（人間確認）、Header/Footer/ナビへの辞書適用、トップ/プロフィール/ギャラリー各言語版、
Footer 言語切替 UI、言語別 metadata、News 多言語化、固有語のローマ字転写方針、
canonical/hreflang/sitemap/robots/言語別 OG（独自ドメイン確定後）。

## 25. Recommended next Sprint

Sprint 31: 辞書を Header/Footer/ナビ・アクセシビリティラベルへ適用（UI 定型文の辞書駆動化）、
または各言語版トップページ（範囲 B の 1 ページ目）の実装。いずれも本 Sprint の getDictionary を消費する。

## 26. Final verdict

**TYPED_TRANSLATION_DICTIONARY_FOUNDATION_IMPLEMENTED**

5 locale の型付き翻訳辞書基盤・正本型・欠落/余分/不一致のビルド時＆テスト検出・黙示 fallback なしの
取得 API・UI/編集コンテンツの責務境界・LocaleScaffold への最小適用まで、単一関心事を安全に完成。
lint / test / typecheck / build / ブラウザ回帰すべて green、許可外変更なし、ルーティング・metadata 不変。
