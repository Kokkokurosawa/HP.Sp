# Sprint 26 — Multilingual URL Architecture & Language-Switch Design

> **種別**: 設計のみ（docs-only）。実装・翻訳・ルーティング変更・UI 変更・依存追加は本 Sprint では**行わない**。
> **成果物**: 本ファイル 1 点のみ。`src`（本 repo では `app/` ほかトップレベル）配下のコードは一切変更しない。
> **位置づけ**: Sprint 8 `docs/interactive-character-world-expansion-design.md` §13（多言語方式比較）で決めた高レベル方針（**案B: 日本語を `/` 既定に維持し、他言語を接頭辞化**）を、ja/en/zh/ko の 4 言語へ拡張し、後続実装 Sprint が迷わない粒度まで具体化する。

---

## 1. Baseline

作業開始時に確認した状態。

```text
branch            = main
HEAD              = 2f077b55887b0f13f56701c99af15a4da730f0e4
origin/main       = 2f077b55887b0f13f56701c99af15a4da730f0e4
HEAD == origin/main = true
working tree      = clean（未追跡ファイルなし）
最新 commit        = 2f077b5 fix: resolve public release blockers
```

Baseline は指示書の期待値と一致。編集は本設計文書の新規作成のみ。

---

## 2. Existing architecture findings（現状の事実確認）

### 2.1 リポジトリ構成（実測）

```text
app/            ← src/ は存在しない。App Router はトップレベル app/
  layout.tsx        ルートレイアウト（<html lang="ja"> を固定）
  page.tsx          /（日本語トップ）
  profile/page.tsx  /profile
  gallery/page.tsx  /gallery
  news/page.tsx     /news
  not-found.tsx     カスタム 404（Sprint 24 追加、日本語）
  icon.png          favicon（Next.js ファイル規約）
  globals.css
components/      Header / Footer / Hero / MobileMenu / Button / SocialFollowLinks / ChannelLinks /
                CharacterIntroduction / ContentCard / FadeIn / FloatingSupitaro / SectionHeading /
                gallery/* / home/HomeGallerySection / profile/*
config/site.ts  サイト設定の唯一定義元（siteName/description/nav/channels/images）
content/        profile.ts / news.ts / gallery.ts（表示データの唯一定義元）
lib/format.ts   formatDate（"YYYY-MM-DD"→"YYYY.MM.DD"、ロケール非依存）
docs/           設計・監査文書（現状フラット。docs/sprints/ は本 Sprint で新設）
next.config.ts  空（i18n 設定・rewrites・redirects なし）
tsconfig.json   paths "@/*": ["./*"]、strict、moduleResolution bundler
```

> **注記**: 指示書 §調査対象は `src/app` 等を挙げるが、本 repo に `src/` は無い。指示書の「ファイル名や配置が異なる場合は実際の構成を優先」に従い、以降すべて `app/` 起点で記述する。
> **注記**: 既存の設計文書は `docs/*.md` の**フラット配置**（例 `docs/interactive-character-world-expansion-design.md`）。本 Sprint の `docs/sprints/…` は**新しいサブディレクトリ**を導入する（指示書の明示パスに従う）。既存フラット文書は移動しない。

### 2.2 現在のルーティング（App Router、全静的）

| 公開 URL | 実体 | 生成 | `<html lang>` |
|---|---|---|---|
| `/` | `app/page.tsx` | ○ Static | `ja`（ルートレイアウト固定） |
| `/profile` | `app/profile/page.tsx` | ○ Static | `ja` |
| `/gallery` | `app/gallery/page.tsx` | ○ Static | `ja` |
| `/news` | `app/news/page.tsx` | ○ Static | `ja` |
| （不明パス） | `app/not-found.tsx` → `/_not-found` | ○ Static | `ja` |
| `/icon.png` | `app/icon.png` | ○ Static | — |

`middleware.*` なし。`i18n` 設定なし。redirects/rewrites なし。現状 6 ルート（+ `_not-found`）。

### 2.3 現在の metadata 構造（`app/layout.tsx` + 各ページ）

- ルート `metadata`: `metadataBase = new URL("https://supitaro-site.vercel.app")`（暫定・Stage A、正式ドメインではない）、`title.template = "%s | すぴたろう公式サイト"`、`description`、`openGraph`（title/description/siteName/locale `ja_JP`/type website/images 1466×643）、`twitter`（`summary_large_image` + image）。
- **canonical は `siteConfig.siteUrl`（現在空文字）が真のときだけ出力** → 現在**非出力**。`og:url` も非出力。
- `viewport.themeColor = "#e3f2fb"`。`<html lang="ja">` は**ルートレイアウトにハードコード**。
- 各ページ `metadata.title` はサブタイトル（"プロフィール" 等）で、テンプレートに合成。`openGraph`/`twitter` は**サブページで未上書き＝サイト共通**（Sprint 23/25 で Non-blocking 判定済み）。
- sitemap / robots / manifest：**いずれも存在しない**（`app/sitemap.*`・`app/robots.*`・`app/manifest.*`・`public/robots.txt` すべて無し。Sprint 6/23/25 で「独自ドメイン確定後に整備」と延期判定済み）。

### 2.4 翻訳対象テキストの所在（i18n 設計上の最重要事実）

現状、翻訳が必要な日本語テキストは **2 系統**に分散している。

**(A) UI 定型文＝コンポーネントに直書き（config/content 外）**

| 箇所 | 例 |
|---|---|
| `Hero.tsx` | "おぱぁ。" / "宇宙から来た、ふしぎないきもの。" / "…のぞいてみませんか。" / "YouTubeで配信を見る" / "プロフィールを見る" |
| `CharacterIntroduction.tsx` | "{characterName}って？" / "もっとくわしく" |
| `home/HomeGallerySection.tsx` | "デザインギャラリー" / "すぴたろうのデザインを、すこしだけ。" / "ギャラリーを見る" |
| `app/page.tsx` | "お知らせ" / "お知らせ一覧へ" |
| `SocialFollowLinks.tsx` | "FOLLOW" / aria-label "YouTubeで配信を見る（外部リンク…）" ほか |
| `ChannelLinks.tsx` | "チャンネル" / "YouTubeで配信を見る" / "Xで活動を追う" / 各説明 / "（外部リンク…）" |
| `Header.tsx` | aria-label "{characterName} ホーム" |
| `MobileMenu.tsx` | "メニューを開く/閉じる" |
| `Footer.tsx` | "PAGE TOP" / "FOLLOW" / "サイトメニュー" / "© Supitaro" |
| `Button.tsx` | "（外部リンク・新しいタブで開きます）" |
| `not-found.tsx` | "404" / "ページが見つかりません" / 説明 / "トップへ戻る" |
| `app/profile/page.tsx` | "プロフィール" / "すぴたろうのこと" / "気になる項目を…" / "すぴたろうの言葉" / "…独自の言葉を話します。" / "くわしい設定" / "準備中です。…" |
| `app/gallery/page.tsx` | "ギャラリー" / 導入文 |
| `app/news/page.tsx` | "お知らせ" / "お知らせはまだありません。" |
| `profile/ProfileDetailSheet.tsx` | "閉じる" |
| `gallery/GalleryCard.tsx` | "大きく見る" / "{title}を大きく見る" |
| `gallery/GalleryLightbox.tsx` | "画像を閉じる" |
| `SectionHeading.tsx` | （装飾のみ・文言なし） |

**(B) コンテンツ＝ `config/` `content/` に集約（現状ほぼ日本語のみ）**

| 定義元 | 翻訳対象 | 既存の多言語余地 |
|---|---|---|
| `config/site.ts` | `siteName` / `description` / `nav[].label` / `images.*.alt` / `channels`（URL は言語不変） | なし（文字列直値） |
| `content/profile.ts` | `name` / `intro[]` / `traits[].{label,summary,detail}` / `words[]` / `upcoming[]` | なし |
| `content/gallery.ts` | `title.ja` / `image.alt` | **`LocalizedText { ja; en? }` を既に採用**（en 任意）＝将来多言語を織り込み済み |
| `content/news.ts` | `title` / `body` / `category` | なし |

> **含意**: i18n は「(A) UI 定型文の辞書化」と「(B) コンテンツの言語別データ化」の**両方**が必要。`content/gallery.ts` の `LocalizedText` は将来対応の布石で、この形（`{ ja, en?, zh?, ko? }` など）を profile/news/config へ広げる余地がある。**固有語 `words[]`（"おぱぁ" 等）は Sprint 全体を通じ「意味を創作しない」方針＝翻訳せず原文（ローマ字転写の可否は人間判断）**。

### 2.5 No-JS / アクセシビリティの現状（維持すべき前提）

- 主要導線は No-JS で機能（Footer にサイトメニュー nav、外部リンクは `<a>`）。Header のモバイルメニューのみ JS 依存で、その代替が Footer nav。
- 内部遷移は `next/link` の `<Link>`（No-JS でも `<a href>` として機能）。外部は素の `<a target=_blank rel=noopener noreferrer>`。
- **言語切替もこの原則に従い、素の `<a>`/`<Link>` による実遷移とする（JS 必須にしない）**。

---

## 3. Adopted requirements（採用済み・不変の前提）

指示書で確定済みのため、後続実装はこれを動かさない。

1. **言語別 URL 方式**を採用（Cookie/クライアント状態だけの同一 URL 切替は不採用）。
2. 正式 URL:
   ```text
   /     日本語（既存 URL は変更しない。/ja へ移さない）
   /en   英語
   /zh   中国語
   /ko   韓国語
   ```
3. **ブラウザ言語による強制リダイレクトはしない**。
4. **言語切替は JavaScript 必須にしない**（No-JS 実遷移）。
5. **機械翻訳をそのまま公開しない**（管理された訳文を用意する）。
6. canonical / `og:url` の実値は**独自ドメイン確定後**（本 Sprint では追加しない）。
7. `x-default` は**日本語トップを優先候補**として検討。
8. `/zh` は初期採用。将来 `/zh-hans` `/zh-hant` 分割の**可能性を設計上記録**（初期は簡体/繁体同時対応を必須にしない）。

---

## 4. URL structure（URL 構造の確定設計）

### 4.1 正式言語 URL

```text
ja  /          （既定・接頭辞なし）
en  /en
zh  /zh
ko  /ko
```

### 4.2 サブページ URL（将来の完全形）

```text
ja  /            /profile        /gallery        /news
en  /en          /en/profile     /en/gallery     /en/news
zh  /zh          /zh/profile     /zh/gallery     /zh/news
ko  /ko          /ko/profile     /ko/gallery     /ko/news
```

- **日本語は常に接頭辞なし**（`/profile` のまま。`/ja/profile` は正式 URL にしない）。
- 言語別 404: `/en/no-such-page` 等（§12 参照）。
- すべてのサブページを初回実装対象にする必要はない（§8 の初回範囲で段階導入）。

### 4.3 ロケール識別子

```text
許可ロケール集合: ["ja", "en", "zh", "ko"]
既定ロケール:     "ja"（接頭辞なし）
将来分割予約:      "zh-hans" / "zh-hant"（/zh を置換 or 併存、後続判断）
```

不明な単一セグメント（例 `/xx`）は許可集合に無いため **404**（§5 の `generateStaticParams` + `dynamicParams=false` で自動化）。

---

## 5. Routing options（ルーティング方式の比較）

App Router では **旧 `next.config` の `i18n` キーは Pages Router 専用で使えない**。App Router の多言語は「ディレクトリ構造（動的 `[locale]` セグメント or 明示ディレクトリ）＋任意で rewrites」で実現する。

### 5.0 最重要制約 — `<html lang>` を言語別にできるか

現在 `<html lang="ja">` は**唯一のルートレイアウト** `app/layout.tsx` に固定。App Router では `<html>`/`<body>` を出せるのは**ルートレイアウトのみ**。日本語を接頭辞なし `/` に置いたまま `/en` 等で `<html lang="en">` を出すには、**ルートレイアウト構成の決定**が要る。これがルーティング選定の決定打。

### 5.1 Option R1 — `[locale]` 動的セグメント（非 ja）＋ ja はルート据え置き

```text
app/
  layout.tsx              現状のまま（<html lang="ja">）
  page.tsx / profile / gallery / news / not-found   ← ja（既存、無変更）
  [locale]/
    layout.tsx            en/zh/ko 用のレイアウト
    page.tsx              /en /zh /ko
    profile|gallery|news/page.tsx
    not-found.tsx
  （generateStaticParams = ["en","zh","ko"], dynamicParams=false）
```

- 静的セグメント（`profile` 等）は動的 `[locale]` に優先 → `/profile`=ja、`/en`=locale、`/en/profile`=locale/profile。矛盾なし。
- **難点**: `<html lang>` は**単一ルートレイアウトが固定**するため、`[locale]/layout.tsx` から `<html lang>` を変えられない（`[locale]` は route group ではなく単なる動的セグメントで、`app/layout.tsx` が存在する限り root layout は 1 つ）。→ 非 ja でも `<html lang="ja">` になり **hreflang/SEO/読み上げが不正**。**要スパイク**（後述の緩和策なしでは不採用寄り）。

### 5.2 Option R2 — 全言語を `[locale]` に統合＋ rewrites で ja を接頭辞なし公開（**AI 推奨**）

```text
app/
  [locale]/
    layout.tsx            <html lang={locale}> を出す（唯一のルートレイアウト）
    page.tsx / profile / gallery / news / not-found
  （generateStaticParams = ["ja","en","zh","ko"], dynamicParams=false）
next.config.ts（後続実装 Sprint で）:
  rewrites: /  → /ja, /profile → /ja/profile … （公開 URL は素のまま、内部で /ja を配信）
  redirects: /ja, /ja/* → /, /*（重複コンテンツ回避、canonical を接頭辞なしに固定）
```

- **利点**: 実装ツリーが 1 本＝重複最小。`<html lang={locale}>` が `[locale]/layout.tsx` で自然に出る（hreflang 対応が素直）。ロケール追加が 1 箇所。不明ロケールは `dynamicParams=false` で 404。
- **難点**: `next.config.ts` の rewrites/redirects が必要（**config 変更＝後続実装 Sprint の許可事項**、middleware ではない）。ja の canonical/内部リンクを「接頭辞なし」に保つ運用注意（内部 `<Link href="/profile">` のままで良い／`/ja/*` は redirect で正規化）。
- middleware は使わない（rewrites は静的解決でエッジ実行を足さない）。

### 5.3 Option R3 — 明示ディレクトリ `app/en` `app/zh` `app/ko`（動的セグメントなし）

```text
app/
  layout.tsx / page.tsx / …    ja（無変更）
  en/layout.tsx / page.tsx / … 明示 en
  zh/… ko/…
```

- **利点**: 各言語ツリーが明示的で読みやすい。不明パスは自然に 404。
- **難点**: R1 同様 `<html lang>` は単一ルートレイアウトに縛られる（`en/layout.tsx` はネストレイアウトで `<html>` を出せない）。かつ**ページ構造をロケール数ぶん手コピー＝重複が最大**、ロケール追加コスト最大。不採用寄り。

### 5.4 比較表

| 観点 | R1 `[locale]`＋ja据置 | **R2 全部`[locale]`＋rewrites** | R3 明示ディレクトリ |
|---|---|---|---|
| 既存 ja URL 維持 | ◎ | ◎（rewrites で維持） | ◎ |
| `<html lang>` 言語別 | ×（単一 root 制約・要スパイク） | ◎ 自然 | ×（同上） |
| 重複実装 | 中（薄いルート層の二重化） | ◎ 最小（1 ツリー） | × 最大 |
| 不明ロケール 404 | ◎（dynamicParams=false） | ◎ | ◎ |
| ロケール追加コスト | 中 | ◎ 小 | × 大 |
| 追加設定 | 不要 | rewrites/redirects（config） | 不要 |
| No-JS | ◎（静的） | ◎（静的） | ◎（静的） |
| リスク | root layout 制約が致命的 | rewrites 設計の正確さ | 保守負債（コピー） |

> **補足（R1/R3 の緩和策）**: `app/layout.tsx` を撤去し **route group による複数ルートレイアウト**（例 `app/(ja)/layout.tsx` = `<html lang="ja">`、`app/(intl)/[locale]/layout.tsx` = `<html lang={locale}>`）にすると `<html lang>` 言語別が可能。ただし複数ルートレイアウトはグループ間でフルリロードが前提（言語切替は全ページ遷移なので実害小）。動的セグメントと route group の組合せは Next 16 の挙動確認（スパイク）が要る。**この「単一ルートレイアウト撤去／複数ルート化」判断が実装第一歩の要**。

**AI 推奨 = R2（全言語 `[locale]` 統合＋ rewrites で ja を接頭辞なし）**。理由: `<html lang>`/hreflang が最も素直、重複最小、ロケール追加が安い。次点 = 複数ルートレイアウト版 R1。R3 は非推奨。**最終決定は人間**（§14）。

---

## 6. Translation data options（翻訳データ管理方式の比較）

対象は §2.4 の (A) UI 定型文 と (B) コンテンツの両系統。

| 方式 | 概要 | 利点 | 難点 | 依存 |
|---|---|---|---|---|
| **D1 言語別・型付き辞書モジュール** | `content/i18n/{ja,en,zh,ko}.ts` を共通 `Dictionary` interface に対して実装 | 追加依存ゼロ／**TS で欠落キーをビルド時検出**／Server Component・No-JS 可／tree-shakeable | 大規模化で 1 ファイルが肥大 | なし |
| D2 単一辞書オブジェクト | `{ ja:{…}, en:{…}, … }` を 1 ファイルに | 一望できる | 言語横断で肥大・差分レビュー難・型で欠落検出が弱い | なし |
| D3 ページ毎翻訳ファイル | `app/**/i18n.ts` をページ隣接 | 局所性 | 共通語（FOLLOW 等）が分散・重複 | なし |
| D4 i18n ライブラリ | next-intl / paraglide / next-i18next 等 | 複数形・ICU・切替補助 | **依存追加＝lockfile md5 不変条項を破る**／4 静的言語には過剰／学習コスト | あり |

- (B) コンテンツは、`content/gallery.ts` の `LocalizedText` を範として **`{ ja; en?; zh?; ko? }` へ拡張** or **言語別コンテンツ配列**（news/gallery は「その言語の訳がある項目だけ」を持てる形）に。
- **固有語 `words[]` は翻訳対象外**（原文維持。ローマ字添字の可否は人間判断＝§14）。
- 日付は `formatDate` がロケール非依存（`YYYY.MM.DD`）。言語別表記が要るかは軽微な後続判断（現状のままでも可）。

**AI 推奨 = D1（言語別・型付き辞書モジュール、追加依存ゼロ）**。理由: プロジェクトの**ゼロ追加依存・lockfile 不変**の基調に整合、**TS 型で翻訳漏れをビルド時に顕在化**（§13 の要件を最小コストで満たす）、Server Component/No-JS と親和。i18n ライブラリ導入は**人間判断**として保留（§14）。

---

## 7. Language switcher design（言語切替 UI 設計）

### 7.1 配置

- **第一候補 = Footer**（Sprint 8 §11 / 現行 Footer の余白設計に整合）。表示順は `日本語 / English / 中文 / 한국어`。
- **日本語リンクも表示する**（自言語を隠さない＝現在地と往復が明確）。
- Header へは将来的に小さく追加可能（初回は Footer のみ）。**Footer 公開時期は人間判断**（§14）。

### 7.2 マークアップ / 挙動（No-JS 必須）

- 各言語は**素の `<a href>`（または `next/link` `<Link>`）による実遷移**。JS 必須にしない。
- **同一ページの他言語版へリンク**する（例 `/gallery` 閲覧中の "English" は `/en/gallery`）。→ **現在パス + 対象ロケールから URL を組む純関数**（`localizedPath(pathname, locale)`）が要る（後続実装。ロケール接頭辞の付替えのみ）。
- **現在言語の明示**: `aria-current="page"`（or `"true"`）＋ 視覚（太字・下線・色）。色だけに依存しない。
- 未対応（未翻訳）ページの言語は**リンクにしない**（§7 未完成扱いに従う。リンク自体を出さない or 非活性テキスト）。
- キーボード: ネイティブ `<a>` で Tab 到達・Enter 実行・focus-visible。
- モバイル: 折返し（`flex-wrap`）。既存 Footer の 44px 系タッチターゲットに合わせる。
- 見出し: `aria-labelledby`（例 "Language" or 言語中立アイコン + sr-only）。**言語切替は言語中立ラベル**が望ましい。

### 7.3 現在地の URL 対応表（実装時の要件）

`localizedPath` は以下を満たすこと（設計要件）:

```text
現在 /            + en → /en
現在 /profile     + en → /en/profile
現在 /en/gallery  + ja → /gallery      （ja は接頭辞除去）
現在 /en/gallery  + ko → /ko/gallery
不明/未翻訳         → その言語リンクを出さない
```

---

## 8. Initial page scope options（初回対応ページ範囲の比較）

| 案 | 対象 | 長所 | 短所 |
|---|---|---|---|
| **A** | トップのみ | 着手最小・翻訳量最小 | 遷移先が ja に落ちる／体験が途切れる |
| **B** | トップ / プロフィール / ギャラリー / 404 | キャラ理解の核（自己紹介＋ビジュアル）が揃う／News の継続翻訳運用を回避 | News が ja のまま |
| **C** | トップ / プロフィール / ギャラリー / ニュース / 404 | 全体一貫 | **News は増える度に多言語翻訳運用が必要**＝継続コスト |

- News は**追記が続く**＝多言語化すると訳の継続運用が発生（翻訳漏れリスクが定常化）。Gallery/Profile は比較的静的。
- **AI 推奨 = Option B**（トップ＋プロフィール＋ギャラリー＋404。News は当面 ja、将来 C へ拡張）。理由: 「キャラを知る」核が言語横断で完結し、かつ継続翻訳コスト（News）を初回に背負わない。**最終決定は人間**（§14）。

---

## 9. Metadata and SEO design（言語別メタデータ設計）

将来、言語ごとに分ける（実値の canonical/og:url は本 Sprint で追加しない）。

| 項目 | 設計 |
|---|---|
| `<html lang>` | ロケール別（`ja`/`en`/`zh`/`ko`）。§5.0 のルート構成決定に依存（R2 なら `[locale]/layout.tsx` で自然） |
| `title` / `description` | 辞書（D1）から言語別に供給。`title.template` も言語別（"… \| Supitaro Official" 等） |
| `openGraph` | 言語別 title/description、`locale`（`ja_JP`/`en_US`/`zh_CN` or `zh_TW`/`ko_KR`）、`og:locale:alternate` に他言語を列挙可 |
| `twitter` | `summary_large_image` 維持、言語別 title/description。OG 画像は当面共通（言語別画像は任意・後続） |
| `canonical` | 各言語版は**自言語 URL を自己 canonical**（例 `/en/profile`）。**実値はドメイン確定後**（現行の `siteConfig.siteUrl` 空ゲートを踏襲＝ドメイン未定なら非出力） |
| `alternates.languages`（hreflang） | §9 で設計、実値はドメイン確定後 |
| OG 画像 | `metadataBase` で絶対化する現行方式を継続。言語別 OG 画像は任意 |

- サブページ OG の言語別上書きは、この機会に「言語別 title/description を OG にも反映」する形へ寄せられる（現状のサイト共通 OG は Non-blocking だが、i18n 実装時に併せて改善可能）。

---

## 9b. hreflang design（将来構造）

```text
<link rel="alternate" hreflang="ja"        href="{ORIGIN}/…" />
<link rel="alternate" hreflang="en"        href="{ORIGIN}/en/…" />
<link rel="alternate" hreflang="zh"        href="{ORIGIN}/zh/…" />   （zh 分割時は zh-Hans/zh-Hant）
<link rel="alternate" hreflang="ko"        href="{ORIGIN}/ko/…" />
<link rel="alternate" hreflang="x-default" href="{ORIGIN}/" />        （日本語トップを x-default に）
```

- **`x-default` = 日本語トップ**を優先採用（Sprint 8/指示書 §9 と整合。専用の言語選択ページは設けない＝余計な 1 ホップを作らない）。
- hreflang は**相互参照が全言語で対称**であること（各ページが自分＋全対応言語＋x-default を列挙）。**未翻訳ページはその言語の hreflang を出さない**（欠けた hreflang にする＝機械翻訳を出さない方針と一致）。
- `Next.js metadata.alternates.languages` で表現可能。**実 URL はドメイン確定後**に一括投入（本 Sprint 追加なし）。

---

## 10. Fallback and missing translation policy（フォールバック方針）

**大原則: 公開ページで翻訳漏れが日本語へ黙って置換され、気づかれないことを避ける。**

### 10.1 UI 定型文（辞書 D1）

- **キー欠落はビルド時エラー**（`Dictionary` interface を各言語が完全実装する型制約 → `tsc`/`build` で欠落検出）。→ §13 選択肢の「ビルドエラーにする」を UI 辞書に適用。
- 開発時は追加で「未定義キー可視化」（dev のみ警告）も可。**公開ビルドに欠落キーは通さない**。

### 10.2 コンテンツ（news/gallery/profile 本文）

- 記事系（News/Gallery 項目）は「**その言語の訳がある項目だけ**を、その言語の一覧に出す」＝**未訳は黙って ja を混ぜない**。
- ページ単位で構造はあるが本文が未訳の場合 → §7 の未完成扱い（**その言語版を公開しない／準備中を出す／ja へ戻す**）を人間が選ぶ（§14）。
- **禁止パターン**: 未訳ページに ja 本文をそのまま流し込み `<html lang="en">` のまま出す（言語不一致・SEO 事故・体験不良）。

### 10.3 §13 選択肢の評価

| 選択肢 | UI 辞書 | コンテンツ | 評価 |
|---|---|---|---|
| ビルドエラー | ◎ 採用 | △（記事は"未訳=非公開"で回避、必須訳のみ型必須） | 漏れを最短で顕在化 |
| ja フォールバック | × | × | **黙った ja 置換＝方針違反** |
| 空欄 | × | × | 利用者に空表示・不良 |
| dev のみ警告 | ○ 併用 | ○ 併用 | 補助として可（本番検出は型で担保） |

**推奨 = 「UI 辞書＝型でビルドエラー」＋「コンテンツ＝未訳は非公開（ja を混ぜない）」＋「dev 警告を補助」**。

---

## 11. sitemap / robots（多言語化後の設計・本 Sprint 実装なし）

- **多言語 sitemap**: 全言語 URL を登録し、各エントリに `xhtml:link rel="alternate" hreflang=…"`（sitemap 版 hreflang）を付す。Next.js の `app/sitemap.ts` の `alternates.languages` で表現可能。
- **robots.txt**: 全公開言語を許可。未完成言語ページを一時的に `noindex` する場合は、その言語版ページの `metadata.robots` で制御（sitemap からも除外）。
- **index 制御**: 未翻訳・準備中ページは `noindex` or そもそも生成しない（§10.2 と一致）。
- **前提**: sitemap/robots は**独自ドメイン確定後**に hreflang 実 URL と同時整備（Sprint 6/23/25 の延期判定を踏襲）。本 Sprint では作らない。

---

## 12. 404 design（言語別 404）

- Next.js は `notFound()` 到達時に**最も近い `not-found` 境界**を描画する。`app/[locale]/not-found.tsx`（R2）や `app/[locale]/not-found.tsx`（R1）を置けば**言語別 404** が可能。
- **設計**: 翻訳済みロケールは**その言語の 404**（見出し・説明・"Home" CTA を辞書化）。未翻訳ロケールは ja 既定 404 へ委譲 or ja 文言で返す。いずれも **HTTP 404 を維持**（Sprint 24 で確立した「日本語 404 かつ status 404」を各言語へ展開）。
- `/en/no-such-page` 等は `<html lang="en">`＋英語 404＋英語 "Home" CTA（→ `/en`）が理想。CTA の戻り先は**同一言語のトップ**。
- 既存の ja `app/not-found.tsx`（status 404・日本語）は R2 では `app/[locale]/not-found.tsx`（locale=ja 分岐）へ吸収、R1 では据え置き。

---

## 13. Testing strategy（後続 Sprint 用テスト項目の定義）

実装 Sprint で満たすべき検証（本 Sprint では実行しない）。

**ルーティング / ステータス**
- `/` `/en` `/zh` `/ko`（＋対応サブページ）が **200**。
- 存在しないロケール `/xx` が **404**（`dynamicParams=false`）。
- **既存 ja URL（`/` `/profile` `/gallery` `/news`）が不変**（パス・内容の回帰なし）。
- 言語別 404 が **HTTP 404** を保つ（`/en/no-such-page` 等）。

**言語属性 / メタ**
- 各ページの `<html lang>` が URL 言語と一致（ja/en/zh/ko）。
- `title`/`description`/OG/twitter が言語別。
- canonical は**ドメイン未定の間は非出力**（誤って Stage A 実値を焼き込まない）。
- hreflang 構造（実 URL 投入後）: 相互対称・未訳言語は欠落・x-default=ja。

**言語切替 UI**
- Footer に言語リンク（対応言語ぶん）。現在言語に `aria-current`。
- **同一ページの他言語版へ遷移**（`localizedPath` 正当性）。
- **No-JS で言語切替が機能**（素の `<a>` 実遷移）。
- キーボード到達・Enter 実行・focus-visible。

**フォールバック / 品質**
- **翻訳キー不足がビルドで検出**される（UI 辞書の型網羅）。
- 未訳コンテンツが ja に黙って置換されない（未訳=非公開 or 準備中）。
- 320〜1440px レスポンシブ（横スクロール 0）を全言語で維持。
- hydration error なし・Console error なし（全言語主要ページ）。
- reduced-motion / 既存の a11y 回帰なし。

---

## 14. Human decisions still required（人間の決定事項）

AI は推奨のみ。以下は**人間が決める**（本 Sprint では確定しない）。

1. **初回対応ページ範囲**（A / **B 推奨** / C）。
2. **`/zh` を簡体字にするか繁体字にするか**（→ OG `locale`・将来 `/zh-hans`/`/zh-hant` 分割方針に影響）。
3. **翻訳文の正式表現**（UI 定型文・コンテンツ本文）。
4. **固有語（"おぱぁ" 等）の翻訳/転写方針**（原文維持が既定。ローマ字添字の可否）。
5. **Footer へ言語リンクを公開する時期**（実装完了と公開解禁の分離可否）。
6. **未完成言語ページを公開するか**（非公開／準備中／ja へ戻す のどれ）。
7. **i18n ライブラリを導入するか**（AI 推奨は不導入＝D1 の型付き辞書）。
8. **ルーティング方式の最終選択**（AI 推奨 **R2**、次点 複数ルートレイアウト版 R1／`app/layout.tsx` 撤去の是非）。
9. **実装開始の承認**。

---

## 15. Recommended implementation sequence（後続 Sprint 分割案）

> すべて人間承認後。1 Sprint = 1 関心事。既存 ja 回帰ゼロを各段の完了条件にする。

- **Sprint 27（基盤・非公開）**: ロケール基盤のスパイク＋確定。`app/layout.tsx` のルート構成決定（R2 の `[locale]` 統合＋ rewrites、or 複数ルートレイアウト）。`localeConfig`（許可集合・既定）／`localizedPath` 純関数／`Dictionary` interface（型のみ）を追加。**この時点で公開 URL・画面は不変**（ja のみ、回帰ゼロを実測）。
- **Sprint 28（辞書・ja 抽出）**: (A) UI 定型文をコンポーネントから `content/i18n/ja.ts` へ抽出し、ja を辞書経由に切替（**画面は byte 一致で不変**＝リファクタのみ、翻訳なし）。欠落キーはビルドで落ちる型網羅を確立。
- **Sprint 29（en 実装・範囲 B）**: `/en` `/en/profile` `/en/gallery` `/en/404` を en 辞書＋ en コンテンツで実装。Footer 言語切替（ja/en のみ表示、`aria-current`、No-JS）。hreflang 構造は「実 URL 空ゲート」で仕込み（ドメイン未定＝非出力）。§13 テスト。
- **Sprint 30（zh / ko 追加）**: en の型・構造を踏襲して zh・ko を追加（簡体/繁体は人間決定に従う）。言語リンクを 4 言語へ。
- **Sprint 31（ドメイン確定後・SEO）**: canonical/og:url 実値・hreflang 実 URL・多言語 sitemap・robots を一括整備（**独自ドメイン確定が前提条件**）。
- 各 Sprint 共通の禁止: 機械翻訳の直公開・ブラウザ言語自動リダイレクト・No-JS 破壊・依存追加（ライブラリ導入が承認された場合を除く）。

---

## 検証（docs-only）

```text
git status --short              → 追加は本文書のみ（?? docs/sprints/…）
git diff --check                → 空（whitespace エラーなし）
既存コード差分                    → なし（app/ config/ content/ lib/ 無変更）
```

本 Sprint は docs-only のため、`npm run lint` / `tsc --noEmit` / `npm run build` の重い検証は**省略**（既存コードに変更がないことを `git status`/`git diff` で確認できるため。Sprint 25 で HEAD=`2f077b5` の lint/tsc/build green・全 static ルートを実測済みで、本 Sprint はそれを一切触っていない）。

---

## Final verdict

- 多言語 URL 構造（ja `/`・en `/en`・zh `/zh`・ko `/ko`）と、ルーティング（推奨 R2）・翻訳データ（推奨 D1 型付き辞書）・言語切替 UI（Footer・No-JS 実遷移・`aria-current`）・初回範囲（推奨 B）・metadata/hreflang（x-default=ja、実値ドメイン後）・フォールバック（UI=型でビルドエラー／コンテンツ=未訳非公開、ja 黙置換禁止）・404（言語別・status 404 維持）・sitemap/robots（ドメイン後）・テスト項目・後続 Sprint 分割・人間決定事項を設計文書化した。
- AI 推奨と人間決定を明確に分離。実装・翻訳・ルート追加・依存・設定変更は一切行っていない。

```text
MULTILINGUAL_URL_ARCHITECTURE_DESIGN_COMPLETE
```
