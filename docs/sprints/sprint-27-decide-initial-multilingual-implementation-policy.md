# Sprint 27 — Initial Multilingual Implementation Policy (Human Decisions)

> **種別**: 意思決定の記録のみ（docs-only）。コード・ルーティング・翻訳辞書・言語切替 UI・metadata の実装は**行わない**。
> **AI の役割**: 選択肢・既存事実・技術的影響・推奨を整理する。**最終決定は代行しない**。
> **成果物**: 本ファイル 1 点のみ。既存ファイルは変更しない。
> **状態凡例**: `PENDING` = 人間未決（AI 推奨のみ、Accepted ではない）／`ACCEPTED` = 人間が有効に確定。
> **本版**: 人間決定 9 件を受領・反映済み（2026-07-17）。特に **D-02 は人間が新設した Option D（簡体字＋繁体字の両方を独立 locale で提供）を確定**し、Sprint 26 の `/zh` 単独候補は正式構造から外れた。

---

## 1. Sprint purpose

Sprint 26 で設計した多言語 URL アーキテクチャを基礎に、**後続実装 Sprint に必要な人間決定 9 項目（D-01〜D-09）を正式確定する**。本 Sprint ではコード実装をしない。AI は各項目に推奨を付すが、Human decision 欄は人間の回答を受領してからのみ埋める。

## 2. Baseline

```text
branch            = main
working tree      = clean
local HEAD        = 0811c38782b8e40dd2793053ca95be537f7fed91
origin/main       = 0811c38782b8e40dd2793053ca95be537f7fed91
remote ref (main) = 0811c38782b8e40dd2793053ca95be537f7fed91
HEAD == origin/main == remote = true
latest commit     = docs: design multilingual url architecture
```

Baseline は指示書の期待値と一致。

## 3. Source documents reviewed

- `docs/sprints/sprint-26-design-multilingual-url-architecture.md`（本 Sprint の直接基礎。ルーティング R1/R2/R3 比較、翻訳 D1〜D4 比較、言語切替、フォールバック、hreflang、テスト方針、人間決定 9 件を設計済み）。
  - **注記**: Sprint 26 は中国語を `/zh` 単一候補として記述している。本 Sprint の D-02=Option D により **`/zh` は正式構造から外れ、`/zh-hans`（簡体字）＋`/zh-hant`（繁体字）の 2 独立 locale に置換**される。Sprint 26 文書自体は本 Sprint の許可ファイル外のため**変更しない**（本文書が中国語構造の決定 of record として上書きする）。
- 現行実装（調査のみ・無変更）: `app/`（`layout.tsx` が `<html lang="ja">` を単一ルートで固定、`page/profile/gallery/news/not-found`）、`components/`、`config/site.ts`、`content/{profile,news,gallery}.ts`（`gallery.ts` は `LocalizedText{ja;en?}` 採用済み）、`lib/format.ts`、`next.config.ts`（空・i18n/rewrites なし・middleware なし）、`tsconfig.json`（`@/*`→`./*`）。
- 注記: 本 repo に `src/` は無い（指示書 §前提資料の `src/app` 等はトップレベル `app/` に読み替え）。sitemap/robots/manifest はいずれも不在。

## 4. Adopted architectural premises（再検討しない前提）

- 言語別 URL 方式。**対応 locale = `ja` / `en` / `zh-hans` / `zh-hant` / `ko`（5 言語版）**。
  ```text
  ja        /                 （既定・接頭辞なし）
  en        /en
  zh-hans   /zh-hans          （簡体字・中国本土向け）
  zh-hant   /zh-hant          （繁体字・台湾/香港などを想定）
  ko        /ko
  ```
- 既存日本語 URL（`/` `/profile` `/gallery` `/news`）は不変。`/ja` へ移さない。
- 同一 URL のクライアント状態だけで切替しない／言語ごとに独立 URL／JS 必須にしない／ブラウザ言語で強制リダイレクトしない／未訳本文を気づかれず他言語（日本語・もう一方の中国語を含む）へ黙置換しない。
- **簡体字版と繁体字版は互いに独立の言語版**として扱う（URL・`<html lang>`・辞書・hreflang・canonical・sitemap・Footer リンクをそれぞれ分離）。

---

## 5. D-01 — Initial page scope（初回対応ページ範囲）

- **Decision ID**: D-01
- **Question**: 多言語化の初回実装で、どのページまで各言語版を用意するか。
- **Options**:
  - **A**: トップページのみ。
  - **B**: トップ＋プロフィール＋ギャラリー＋404。
  - **C**: トップ＋プロフィール＋ギャラリー＋ニュース＋404。
- **Existing facts**: News は追記が続くため多言語化すると訳の継続運用が定常化。Profile/Gallery は比較的静的で、Gallery は文章量が少ない。404 は言語別ルーティングの完成度に直結（Sprint 24 で ja 側は status 404＋日本語を確立済み）。
- **AI recommendation**: **B**。
- **AI rationale**: ①トップのみだと言語切替後に遷移先が ja に落ち体験が断片化。②プロフィールは海外利用者の重要度が高い。③ギャラリーは文章量が少なく多言語化コストが小。④404 は言語別ルーティング完成度に関わる。⑤News は継続的翻訳負担が発生するため初回で背負わない。
- **Human decision**: `ACCEPTED = B`（トップ＋プロフィール＋ギャラリー＋404）。
- **Decision authority**: Human。
- **Implementation consequence**: en/zh-hans/zh-hant/ko の各言語版で「トップ・プロフィール・ギャラリー・404」を対象化。News は当面 ja のみ（多言語対象外）。**初回翻訳量 = 4 ページ × 対応言語数**（言語ごとに独立、簡体/繁体は別ページ）。
- **Deferred matters**: News の多言語化（将来 C へ拡張）の時期。

## 6. D-02 — Chinese writing system（中国語の文字体系）

- **Decision ID**: D-02
- **Question**: 中国語をどの文字体系で、どの URL で提供するか。
- **Options**:
  - **A**: `/zh` = 簡体字。
  - **B**: `/zh` = 繁体字。
  - **C**: 初回は中国語版を公開しない。
  - **D（人間が新設）**: **簡体字・繁体字の両方を独立 locale として提供**。
    ```text
    簡体字  /zh-hans   （中国本土向け・html lang="zh-Hans"・OG locale zh_CN）
    繁体字  /zh-hant   （台湾/香港などを想定・html lang="zh-Hant"・OG locale zh_TW）
    ```
    `/zh` 単独運用は採用しない。
- **Existing facts**: 文字体系の選択は対象視聴者と OG `locale` に影響。Sprint 26 は `/zh` 単一候補だった。
- **AI recommendation**: **人間判断（AI は既定値を置かない・対象地域を勝手に決めない）**。
- **AI rationale**: 簡体/繁体の選択は対象地域・読者層の決定であり、AI が対象視聴者を決めてはならない。技術的には各体系とも同一実装コスト。
- **Human decision**: `ACCEPTED = D`（簡体字 `/zh-hans` ＋ 繁体字 `/zh-hant` の両方を独立 locale で提供。`/zh` 単独は不採用）。
  - 付随確定事項:
    - 対応 locale = `ja / en / zh-hans / zh-hant / ko`。
    - Footer 言語表示 = 日本語 / English / 简体中文 / 繁體中文 / 한국어。
    - `<html lang>` = `ja` / `en` / `zh-Hans` / `zh-Hant` / `ko`（URL セグメントは小文字 `zh-hans`/`zh-hant`、`lang` 属性は BCP-47 表記 `zh-Hans`/`zh-Hant`）。
    - canonical / hreflang / sitemap で `zh-Hans` と `zh-Hant` を**別言語版**として扱う。
    - 翻訳辞書も簡体字版・繁体字版を**分離**（`content/i18n/zh-hans.*` と `content/i18n/zh-hant.*`）。
    - 両中国語版は**それぞれ完成した段階で個別に Footer リンクを公開**（D-05 と連動）。
    - **未完成側を、もう一方の中国語や日本語へ黙ってフォールバックしない**（D-06 と連動）。
- **Decision authority**: Human（AI は既定を置かず、人間が Option D を新設・確定）。
- **Implementation consequence**: locale 集合が 5 に増加。zh 関連はすべて 2 系統（辞書・ページ・hreflang・OG locale・Footer リンク）。ルーティング（D-08=R2）は `generateStaticParams` に 5 locale を列挙。
- **Deferred matters**: 簡体/繁体それぞれの正式訳（D-03）、固有語の各体系での表記（D-04）、両者の公開順（どちらを先に完成公開するかは運用判断）。

## 7. D-03 — Translation production policy（正式翻訳文の作成方針）

- **Decision ID**: D-03
- **Question**: 各言語の正式公開文をどう作成・検証して確定するか。
- **Options**:
  - **A**: AI 翻訳を初稿として使用し、人間が全ページ確認してから公開。
  - **B**: AI 翻訳のみで公開。
  - **C**: 専門翻訳またはネイティブ校正後に公開。
- **Existing facts**: 採用済み前提「機械翻訳をそのまま公開しない」。日本語原文が正本。
- **AI recommendation**: **A**。
- **AI rationale**: ①AI 翻訳は初稿。②日本語原文を正本。③公開前に各言語を人間確認。④誤訳・キャラクター性消失を防ぐ。⑤機械翻訳を無条件に正式文にしない。
- **Human decision**: `ACCEPTED = A`（AI 初稿＋人間による全ページ確認後に公開）。
- **Decision authority**: Human。
- **Implementation consequence**: 各 locale（簡体・繁体を含む）で「人間確認済みの訳のみ辞書へ投入」。未確認訳は公開しない（D-06 と連動）。**簡体・繁体は別々に人間確認が必要**。
- **Deferred matters**: 将来ネイティブ校正（C への格上げ）の言語・時点。

## 8. D-04 — Character-specific terminology policy（固有語の翻訳方針）

- **Decision ID**: D-04
- **Question**: すぴたろう固有語（名称・口癖・鳴き声）を各言語でどう扱うか。
- **対象例**: すぴたろう / おぱぁ / いぱ / ハッピー / ラッキー / キュッキュ / あぱー / めーおー / まぁっ！
- **Options**:
  - **A**: 固有語は原則翻訳せず、日本語またはローマ字で維持。
  - **B**: 各言語で意味や響きを再創作。
  - **C**: 名称は維持し、説明文のみ各言語へ翻訳。
- **Existing facts**: Sprint 全体で「独自の言葉に意味を創作しない」を厳守（`content/profile.ts` の `words[]` に意味解説なし）。
- **AI recommendation**: **C**。
- **AI rationale**: 意味再創作（B）は方針違反。名称・鳴き声は原文の同一性を保ち、説明文のみ各言語化しキャラクター性を保持。
- **Human decision**: `ACCEPTED = C`（名称・口癖は維持し、説明文のみ各言語へ翻訳）。
- **用語分類**（実装辞書での区分・確定）:
  - **正式名称**: "すぴたろう" → 各言語で維持（ローマ字 "Supitaro" 併記の可否は後続の人間判断）。
  - **口癖・鳴き声**: "おぱぁ" 等 → 翻訳せず原文維持（転写の可否は後続の人間判断）。
  - **通常説明文**: 各言語へ翻訳（D-03 に従う。簡体・繁体は別訳）。
  - **キャッチコピー**: 各言語へ翻訳（意訳度は後続の人間判断）。
  - **SNS 表示名**: 原則維持（プラットフォーム上の実名に合わせる）。
- **Decision authority**: Human。
- **Implementation consequence**: 辞書で「翻訳キー」と「原文維持キー」を分離。中国語は簡体・繁体で説明文が別訳になるが、固有語（名称・口癖）は両体系とも原文維持（体系差の影響は説明文側のみ）。
- **Deferred matters**: ローマ字転写の正式形、キャッチコピーの意訳度、SNS 表示名の言語別扱い。

## 9. D-05 — Footer language-link publication timing（Footer 言語リンク公開時期）

- **Decision ID**: D-05
- **Question**: Footer の言語切替リンクをいつ・どの状態で公開するか。
- **Options**:
  - **A**: 各言語版が完成するまでリンクを表示しない。
  - **B**: 未完成状態で「準備中」として表示。
  - **C**: 一部完成した言語から順次リンクを公開。
- **Existing facts**: 言語切替は No-JS 実遷移。公開リンクは有効な 200 ページへ遷移する必要。
- **AI recommendation**: **C**。
- **AI rationale**: 段階導入しつつ完成言語の到達性を早く提供。公開済みリンクは必ず 200 へ遷移し、未完成言語を通常リンクとして表示しない。
- **Human decision**: `ACCEPTED = C`（完成した言語から順次公開）。
- **Decision authority**: Human。
- **Implementation consequence**: Footer 言語リンクは「その時点で 200 が保証される言語のみ」を出す出し分け。**簡体中文・繁體中文はそれぞれ独立に、各自が完成した段階で個別公開**（片方だけ先に出せる）。未完成言語はリンクを出さない。
- **Deferred matters**: Header への将来追加時期（初回は Footer のみ）、5 言語表示時のモバイル折返しレイアウト。

## 10. D-06 — Incomplete-page publication policy（未完成ページの公開可否）

- **Decision ID**: D-06
- **Question**: 未翻訳・未完成ページを公開時にどう扱うか。
- **Options**:
  - **A**: 未翻訳ページは公開しない。
  - **B**: 未翻訳箇所を日本語のまま公開。
  - **C**: 準備中ページとして公開。
- **Existing facts**: 採用済み前提「未訳本文を気づかれず日本語へ黙置換しない」。No-JS でも一貫した内容が必要。
- **AI recommendation**: **A**。
- **AI rationale**: ①言語ページ内の日本語混在を防ぐ。②検索エンジンへ不完全ページを登録しない。③翻訳漏れを公開後に見逃さない。④No-JS 時も一貫内容。
- **Human decision**: `ACCEPTED = A`（未翻訳ページは非公開）。
- **Decision authority**: Human。
- **Implementation consequence**: 未訳ページはその言語で生成しない／hreflang からも除外。**簡体字と繁体字は独立**＝一方が未完成でも、もう一方の中国語や日本語へ黙ってフォールバックしない（未完成側は非公開・リンク非表示）。D-05 の出し分けと一致。
- **Deferred matters**: 「準備中」状態を一切設けない方針の恒久化可否。

## 11. D-07 — i18n dependency policy（i18n ライブラリ導入可否）

- **Decision ID**: D-07
- **Question**: 外部 i18n ライブラリを導入するか、型付き静的辞書で進めるか。
- **Options**:
  - **A**: 外部 i18n ライブラリを導入しない（`content/i18n/*` 型付き静的辞書、依存追加なし、ビルド時に翻訳キー不足検出）。
  - **B**: next-intl 等の外部ライブラリを導入。
- **Existing facts**: ゼロ追加依存・lockfile 不変を基調。静的生成。`content/gallery.ts` が型付き `LocalizedText` 採用済み。
- **AI recommendation**: **A**。
- **AI rationale**: 初期規模では型付き辞書が最小コストで「翻訳漏れをビルド時に顕在化」を満たし依存追加を避けられる。将来ライブラリ再検討条件: 対応言語増加／ICU MessageFormat 必要化／複数形・日付・数値の高度ローカライズ増加／翻訳管理サービス連携／ページ数・翻訳キー数の大幅増。
- **Human decision**: `ACCEPTED = A`（外部 i18n ライブラリなし・型付き静的辞書）。
- **Decision authority**: Human。
- **Implementation consequence**: `Dictionary` interface + `content/i18n/{ja,en,zh-hans,zh-hant,ko}.ts`（**5 辞書、簡体・繁体を分離**）。各辞書が同一 interface を完全実装＝欠落キーはビルドエラー。
- **Deferred matters**: 上記「再検討条件」該当時のライブラリ選定。

## 12. D-08 — Routing architecture（ルーティング方式・最終決定）

- **Decision ID**: D-08
- **Question**: 多言語ルーティングの実装方式を R1/R2/R3 のどれにするか。
- **Options**:
  - **R1**: `app/en/*`・`app/zh-hans/*`・`app/zh-hant/*`・`app/ko/*` を明示作成（言語ごとにルート）。
  - **R2**: `app/[locale]/*` に全言語統合し、ja は `next.config` の rewrite 等で接頭辞なし URL を維持。
  - **R3**: 日本語既存ルートを維持し、外国語だけ `app/[locale]/*` に統合。
- **Existing facts / 評価軸**:
  - **`<html lang="ja">` 固定**: 現在 `app/layout.tsx`（単一ルートレイアウト）が固定。App Router では `<html>` を出せるのはルートレイアウトのみ。R1/R3 は単一ルート制約で言語別 `<html lang>` が困難（route group による複数ルートレイアウト化＝`app/layout.tsx` 撤去が必要／要スパイク）。R2 は `app/[locale]/layout.tsx` で `<html lang={htmlLang(locale)}>` が自然（`zh-hans`→`zh-Hans` 等のマッピング関数を持つ）。
  - **日本語 URL の非接頭辞維持**: R1/R3 は据え置き自然。R2 は rewrites/redirects で `/`↔内部 `/ja` を対応（`/ja/*`→`/*` を redirect で正規化）。
  - **`dynamicParams = false` + `generateStaticParams`**: 5 locale（`ja/en/zh-hans/zh-hant/ko`）を列挙し、不明 locale を静的 404 化。
  - **不明 locale の 404**: 3 案とも実現可（R2/R3 は動的セグメント制約で自動）。
  - **rewrites の責務**: R2 のみ必要（ja の公開 URL を接頭辞なしに保つ）。middleware は使わない（静的解決）。
  - **metadata 生成**: R2 は `[locale]` 単位で言語別 metadata/`alternates.languages`（5 言語 + x-default）を集約しやすい。R1/R3 は分散。
  - **静的生成 / 既存ルート移行リスク**: R3 は ja 無移動でリスク最小。R2 は ja を `[locale]` 配下へ移す構造変更（回帰テスト必須）だが rewrites で URL は不変。R1 は ja 無変更・外国語のみ追加。
  - **No-JS / 内部リンク**: 3 案とも静的で No-JS 可。内部リンクは ja 接頭辞なし維持（`<Link href="/profile">`）。
  - **Vercel 配信**: 3 案とも静的プリレンダー配信。R2 の rewrites は Vercel rewrites で解決（エッジ実行増なし）。
  - **テスト容易性**: R2 は 1 ツリーで言語横断テスト集約。R1/R3 は分散。
  - **重複実装量**: R2 最小（1 実装を locale 駆動）。R3 中。R1 最大（言語ぶんコピー、**簡体・繁体で更に増**）。
- **AI recommendation**: **R2**（Sprint 26 と同一）。次点 = 複数ルートレイアウト版。R1 は非推奨（5 locale ぶんの重複が最大）。
- **AI rationale**: `<html lang>`/hreflang が最も素直、重複最小（5 locale でも 1 実装）、ロケール追加が安い、テスト集約的。R2 は「ja を `[locale]` 配下へ移す構造変更＋rewrites/redirects 設計」が要点で、既存 ja URL の回帰ゼロを実装完了条件にする。
- **Human decision**: `ACCEPTED = R2`（`app/[locale]/*` 統合＋rewrites で ja 接頭辞なし公開。`app/layout.tsx` の複数ルート化を含む構造は実装 Sprint で確定）。
- **Decision authority**: Human。
- **Implementation consequence**: Sprint 28 候補で `[locale]`（5 locale）基盤＋rewrites＋`<html lang>` マッピングを確立（ja 回帰ゼロ）。`generateStaticParams = ["ja","en","zh-hans","zh-hant","ko"]`、`dynamicParams=false`。
- **Deferred matters**: rewrites/redirects 正式設計、`htmlLang()` マッピング（`zh-hans`→`zh-Hans` 等）の実装。

## 13. D-09 — Implementation authorization（実装開始承認）

- **Decision ID**: D-09
- **Question**: 多言語基盤の実装を開始してよいか。
- **Options**:
  - **A**: 多言語基盤実装を開始する（本 Sprint 内ではコードを書かず、別 Sprint の実装指示書で着手）。
  - **B**: 追加設計が必要なため実装を開始しない。
- **Existing facts**: 本 Sprint はコード実装禁止。A を選んでも実装は別 Sprint。
- **AI recommendation**: **A**。
- **AI rationale**: D-01〜D-08 確定で実装に必要な設計が揃う（Sprint 26 + 本 Sprint）。着手は §19 の分割案に従う。
- **Human decision**: `ACCEPTED = A`（決定完了後に別 Sprint で実装開始。本 Sprint 内では実装しない）。
- **Decision authority**: Human。
- **Implementation consequence**: 次に Sprint 28 候補（多言語ルーティング基盤・5 locale）の実装指示書を作成。
- **Deferred matters**: 各実装 Sprint の順序・粒度（§19）。

---

## 14. Decision matrix

| ID | 項目 | Options | AI 推奨 | Human decision | Authority |
|---|---|---|---|---|---|
| D-01 | 初回対応ページ範囲 | A/B/C | B | **`ACCEPTED = B`** | Human |
| D-02 | 中国語の文字体系 | A/B/C/**D** | 人間判断（既定なし） | **`ACCEPTED = D`（/zh-hans ＋ /zh-hant）** | Human |
| D-03 | 正式翻訳文の作成方針 | A/B/C | A | **`ACCEPTED = A`** | Human |
| D-04 | 固有語の翻訳方針 | A/B/C | C | **`ACCEPTED = C`** | Human |
| D-05 | Footer 言語リンク公開時期 | A/B/C | C | **`ACCEPTED = C`** | Human |
| D-06 | 未完成ページの公開可否 | A/B/C | A | **`ACCEPTED = A`** | Human |
| D-07 | i18n ライブラリ導入可否 | A/B | A | **`ACCEPTED = A`** | Human |
| D-08 | ルーティング方式 | R1/R2/R3 | R2 | **`ACCEPTED = R2`** | Human |
| D-09 | 実装開始承認 | A/B | A | **`ACCEPTED = A`** | Human |

## 15. AI recommendations summary（参考情報・人間決定ではない）

```text
D-01: B   トップ＋プロフィール＋ギャラリー＋404
D-02:     人間判断（AI は対象地域を決めない）
D-03: A   AI 初稿＋人間による全ページ確認
D-04: C   名称・口癖を維持し、説明文を翻訳
D-05: C   完成した言語から順次公開（公開リンクは必ず 200）
D-06: A   未翻訳ページは非公開
D-07: A   外部 i18n ライブラリなし（型付き静的辞書）
D-08: R2  app/[locale] 統合＋日本語接頭辞なし公開
D-09: A   決定完了後に別 Sprint で実装開始
```

> このセットは**比較の起点となる参考情報**であり、人間決定ではない。**D-02 は AI が既定を置かず、人間が新設した Option D を確定した**（AI 推奨 ≠ 人間決定の代表例）。

## 16. Human decisions summary

| ID | Human decision |
|---|---|
| D-01 | `ACCEPTED = B`（トップ＋プロフィール＋ギャラリー＋404） |
| D-02 | `ACCEPTED = D`（簡体字 `/zh-hans` ＋ 繁体字 `/zh-hant` を独立 locale で提供。`/zh` 単独不採用） |
| D-03 | `ACCEPTED = A`（AI 初稿＋人間全ページ確認） |
| D-04 | `ACCEPTED = C`（名称・口癖維持、説明文翻訳） |
| D-05 | `ACCEPTED = C`（完成言語から順次公開、簡体・繁体は個別公開） |
| D-06 | `ACCEPTED = A`（未翻訳ページ非公開、黙フォールバックなし） |
| D-07 | `ACCEPTED = A`（外部 i18n ライブラリなし・型付き静的辞書） |
| D-08 | `ACCEPTED = R2`（`app/[locale]` 統合＋ja 接頭辞なし公開） |
| D-09 | `ACCEPTED = A`（別 Sprint で実装開始） |

**全 9 項目が有効に確定（一義的な単一選択、あいまい・複数・条件付きなし）。**

## 17. Implementation consequences（確定後に発生する帰結の要約）

- **対応 locale = `ja / en / zh-hans / zh-hant / ko`（5）**。中国語関連はすべて 2 系統（辞書・ページ・hreflang・OG locale・Footer リンク・人間確認）。
- **URL 構造**: `/`（ja）／`/en`／`/zh-hans`／`/zh-hant`／`/ko`（＋ D-01=B の各サブページ `.../profile` `.../gallery` ＋言語別 404）。`/zh` は使わない。
- **ルーティング（R2）**: `app/[locale]/*`、`generateStaticParams=5 locale`、`dynamicParams=false`、`next.config` rewrites で ja を接頭辞なし公開、`htmlLang()` で `zh-hans→zh-Hans`/`zh-hant→zh-Hant` 変換。
- **`<html lang>`**: `ja` / `en` / `zh-Hans` / `zh-Hant` / `ko`。
- **翻訳辞書（D-07=A）**: `Dictionary` interface ＋ `content/i18n/{ja,en,zh-hans,zh-hant,ko}.ts`。欠落キーはビルドエラー。UI 定型文とコンテンツの両系統を辞書化。
- **言語切替 UI（D-05=C）**: Footer に「日本語 / English / 简体中文 / 繁體中文 / 한국어」。素の `<a>`/`<Link>` 実遷移（No-JS）、`aria-current`、`localizedPath(pathname, locale)` で同一ページの他言語版へ。**200 保証言語のみ表示**、簡体・繁体は個別に出し分け。
- **フォールバック（D-06=A）**: 未訳ページはその言語で生成しない／hreflang 除外。簡体↔繁体↔日本語の黙フォールバック禁止。
- **metadata / SEO**: 言語別 title/description/OG（`locale`: `ja_JP`/`en_US`/`zh_CN`/`zh_TW`/`ko_KR`）/twitter。canonical は各言語版が自己 canonical（実値はドメイン確定後）。
- **hreflang（将来・ドメイン後）**: `ja` / `en` / `zh-Hans` / `zh-Hant` / `ko` ＋ `x-default=ja`。簡体・繁体は別 hreflang。相互対称、未訳言語は欠落。
- **sitemap / robots（将来・ドメイン後）**: 5 言語 URL を hreflang 付きで登録。未完成言語は除外／`noindex`。
- **翻訳量**: D-01=B の 4 ページ × （en + zh-hans + zh-hant + ko）＝初回 16 ページ相当（簡体・繁体が別訳）。

## 18. Deferred matters（本 Sprint 外に保持）

- canonical / og:url / hreflang の**実 URL**（独自ドメイン確定後。Stage A 実値を焼き込まない）。
- sitemap / robots / manifest（ドメイン確定後）。
- 固有語のローマ字転写正式形・キャッチコピー意訳度・SNS 表示名の言語別扱い。
- 簡体字版・繁体字版の**公開順**（どちらを先に完成公開するか）。
- Header への言語切替追加時期・5 言語表示のモバイルレイアウト詳細。
- 言語別 OG 画像。
- News の多言語化（将来 D-01 を C へ拡張する場合）。
- **Sprint 26 文書の `/zh` 記述の整合**（本 Sprint の許可ファイル外のため未変更。実装 Sprint 着手前に Sprint 26 の中国語箇所を本文書に合わせて改訂するか、本文書を上書き決定 of record として扱うかは人間判断）。

## 19. Recommended following Sprint（D-09=A のため実装へ）

```text
Sprint 28 候補: 多言語ルーティング基盤実装
  - locale 型（"ja"|"en"|"zh-hans"|"zh-hant"|"ko"）/ 対応 locale 定義 /
    ルート構造（app/[locale]）/ 日本語 URL 維持（rewrites）/
    不明 locale 404（dynamicParams=false）/ <html lang> マッピング（htmlLang）/ 最小テスト
Sprint 29 候補: 型付き翻訳辞書基盤（Dictionary interface + content/i18n/*、5 辞書）
Sprint 30 候補: トップページ 各言語版実装（en から。zh-hans/zh-hant/ko 順次）
Sprint 31 候補: プロフィール多言語化
Sprint 32 候補: ギャラリー・404 多言語化
Sprint 33 候補: Footer 言語切替 UI 実装（5 言語・200 保証出し分け）
将来 Sprint: canonical / hreflang（ja/en/zh-Hans/zh-Hant/ko/x-default）/ sitemap / robots / 言語別 OG
  （独自ドメイン確定前に URL 実値を固定しない）
```

## 20. Final verdict

- 人間決定 9 項目をすべて受領・反映済み。全項目が一義的な単一選択で有効確定（D-02 は人間が新設した Option D＝簡体字＋繁体字の 2 独立 locale を確定）。
- 未決・あいまい・条件付き項目なし。許可外変更なし（本文書のみ）。設計上の重大な阻害要因なし。

```text
INITIAL_MULTILINGUAL_IMPLEMENTATION_POLICY_DECIDED
```
