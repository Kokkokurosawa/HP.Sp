# Sprint 38 Phase A — 外部リンク補助文言・FOLLOW SNS aria 翻訳レビュー（人間確認用）

Status: **APPROVED**（2026-07-18・EN/ZH-HANS/ZH-HANT/KO すべて APPROVE、D-A〜D-H 回答済み・追認①② 済み → Phase B 実装済み）

> Phase A 成果物。外国語ドラフトは AI 初稿（一部は Sprint 33 で人間承認済みの値を流用）。
> 4 外国語すべての APPROVE と人間決定 D-A〜D-H の回答を受領後にのみ、承認済み文言のみを Phase B でコードへ反映する。
> 本 Sprint の単一関心事: **外部リンク補助文言と FOLLOW・チャンネル SNS リンクの accessible name を 5 locale 対応**し、
> 外国語ページ内に残る日本語アクセシビリティ文言を解消する。ページ本文・デザイン・URL・metadata・SEO・SNS リンク先は変更しない。

---

## 1. Purpose

Sprint 37 までに外国語共通 UI 辞書（common/navigation/language/accessibility）は正式化したが、以下は日本語ハードコードのまま
外国語ページでも日本語で出力されている:

- 外部リンク補助文言 `(外部リンク・新しいタブで開きます)`（sr-only / aria 内）
- FOLLOW SNS リンク（YouTube / X / Twitch）の aria-label（アイコンのみでアクセシブル名は aria-label が唯一）

本 Sprint はこれらを型付き辞書へ移し、Server 側で locale 別に解決して必要文字列のみを props で配線する。

## 2. Baseline

```text
branch = main / working tree = clean
local HEAD = origin/main = remote ref = be1312b550152348d54891cda853463f9918e4f9
latest commit = docs: approve shared interface translations
```

一致確認済み（Phase A はコード無変更）。

## 3. Decision-of-record

- **Sprint 27**（decision of record）: locale = ja/en/zh-hans/zh-hant/ko、URL = `/ /en /zh-hans /zh-hant /ko`、
  `getDictionary(locale)` は日本語への黙示 fallback なし、外国語は noindex、AI 初稿 → 人間確認（D-03）。
- **Sprint 31**（共通 UI 辞書適用）: 共通 UI 定型文は `content/i18n/**` の辞書へ。Client（MobileMenu）へは解決済み文字列のみ。
- **Sprint 33 §12 R2 / D-E**: FOLLOW aria（SocialFollowLinks・Footer 共有）の locale 化を **「共通 UI 校正 Sprint」へ延期**。
  ただし外部注記 T18・YouTube T04・X T16・Twitch T20 の 4 言語訳は **Sprint 33 で人間 APPROVE 済み**（実装のみ延期）。
- **Sprint 37 D-EXT=(A)**: 外部リンク補助文言・FOLLOW aria の locale 化を **独立 Sprint へ分離**。→ 本 Sprint 38 がその独立 Sprint。

本 Sprint は上記 D-E / D-EXT の直接の履行である。

## 4. Runtime consumer inventory

`target="_blank"` を持つ外部リンクと SNS 導線の実 consumer（`grep` で全数確認）:

| # | 文言 | 定義元 | render 契機 | 外国語で render されるか |
|---|------|--------|-------------|--------------------------|
| C1 | 外部注記 sr-only | `components/Button.tsx:44`（external 分岐） | **Hero YouTube CTA のみ**（外部 Button は 1 箇所） | **される**（全 locale の `/` ホーム） |
| C2 | 外部注記 sr-only | `components/ChannelLinks.tsx:62` | ホーム channels（YouTube/X カード） | **される**（全 locale の `/` ホーム） |
| C3 | 外部注記 sr-only | `components/ContentCard.tsx:37` | News（ホーム News 節 + `/news`） | **されない**（News は ja 専用・§6） |
| C4 | SNS aria-label ×3 | `components/SocialFollowLinks.tsx:41/47/53` | Footer（**SiteShell 経由＝全ページ・全 locale・404**）+ ホーム FOLLOW 節 | **される**（全 locale の全ページ Footer） |

**Button の external consumer は Hero の YouTube CTA ただ 1 箇所**（他の `<Button>` はすべて internal＝note を出さない）。
**SocialFollowLinks は Footer（SiteShell）経由で全ページ・全 locale に出る**ため、その aria 文字列は topPage（ホーム限定）ではなく
**site-wide に取得できる共通辞書（`getDictionary`）に置く必要がある**（プロフィール/ギャラリーの Footer でも解決するため）。

### consumer チェーン（Phase B 配線に影響）

```text
外部注記:
  app/[locale]/page.tsx → Hero → Button（external）        （全 locale）
  app/[locale]/page.tsx → ChannelLinks                     （全 locale）
  app/[locale]/page.tsx / news/page.tsx → ContentCard      （ja 専用・§6）

SNS aria:
  SiteShell → Footer → SocialFollowLinks（footer）         （全ページ・全 locale）
  app/not-found.tsx → Footer → SocialFollowLinks（footer） （404・ja）
  app/[locale]/page.tsx → SocialFollowLinks（section）      （全 locale ホーム）
```

## 5. Japanese hard-coded string inventory

現行日本語＝正本（実コードの値。**Sprint 指示書 §5 の想定「Xで最新情報を見る」は実コードと異なり、実コード「Xで活動を追う」を優先**＝§4 実装事実優先）。

| ID | Runtime location | 日本語原文（byte 一致） | 種別 |
|----|------------------|------------------------|------|
| E01 | Button / ChannelLinks / ContentCard sr-only | `(外部リンク・新しいタブで開きます)` | sr-only テキスト（3 箇所同一） |
| E02 | SocialFollowLinks YouTube aria | `YouTubeで配信を見る(外部リンク・新しいタブで開きます)` | aria-label（動作句 + 注記） |
| E03 | SocialFollowLinks X aria | `Xで活動を追う(外部リンク・新しいタブで開きます)` | aria-label（動作句 + 注記） |
| E04 | SocialFollowLinks Twitch aria | `Twitchで配信を見る(外部リンク・新しいタブで開きます)` | aria-label（動作句 + 注記） |
| — | FOLLOW 見出し | `FOLLOW`（可視 h2・英字） | ブランド見出し（**翻訳しない・§13**） |

分類（検索 → runtime 判定）:

- **A. runtime で読み上げられる（本 Sprint 対象）**: E01（C1/C2 経由・外国語で出力）, E02, E03, E04。
- **B. dead branch**: なし。
- **C. テスト内**: `content/topPage.test.ts`（"YouTubeで配信を見る"/"Xで活動を追う" の回帰ガード）→ 変更しない。
- **D. 歴史的 Sprint 文書**: `docs/sprints/**`（sprint-33 T18/T20 等）→ 変更しない。
- **E. コメント**: ChannelLinks/Footer/page のコメント（"外部リンク注記…延期"）→ 実装後に整合コメントへ更新可（文言ではない）。
- **F. 対象外用途**: E01 の ContentCard 側（C3・ja 専用 News・外国語で render されない）→ §6・§12。

## 6. Visible text versus accessible-name analysis

| 箇所 | 可視ラベル | accessible name の作り | 本 Sprint の扱い |
|------|-----------|------------------------|------------------|
| Button（外部） | 子要素（例: "YouTubeで配信を見る"）＋ `↗`(aria-hidden) | 可視テキスト + sr-only 注記 E01 | 注記のみ locale 化（可視テキストは呼び出し側＝既存 topPage 訳） |
| ChannelLinks カード | CTA（youtubeCta/xCta・既に locale 別＝topPage）＋ `↗`(aria-hidden) | 可視 CTA + sr-only 注記 E01 | 注記のみ locale 化（可視 CTA は Sprint 33 で locale 化済み） |
| SocialFollowLinks | **なし**（SVG アイコンは `aria-hidden`） | **aria-label が唯一の accessible name**（E02/E03/E04） | aria-label 全体を locale 化 |
| ContentCard（News） | link.label（ja News）＋ `↗`(aria-hidden) | 可視ラベル + sr-only 注記 E01 | **対象外**（ja 専用・§12） |
| FOLLOW landmark（section） | 可視 h2 "FOLLOW" | `aria-labelledby` → "FOLLOW" | **KEEP**（§13・D-B。新 ja 文字列を作らない） |

要点:
- SocialFollowLinks はアイコンのみで**可視ラベルが無い**ため、aria-label が動作句＋注記を一体で担う（現行 DOM も aria-label 方式）。
  → 各言語の aria は「動作句 + 注記」を**一体の翻訳単位**として保持する方が、言語別の区切り（半角/全角括弧・スペース有無）を
  翻訳者が自然に制御でき、層をまたいだ再合成（§20 禁止）を避けられる。
- Button/ChannelLinks は**可視テキストが意味を十分に持つ**ため、追加するのは注記 E01 のみ（§14 の方針）。

## 7. Dictionary responsibility options

外部注記（E01）は site-wide（Footer/ホーム/News）で必要 → **共通辞書 `accessibility` へ追加**（第一候補・§7 指示書）。

FOLLOW SNS aria（E02-E04）の配置:

| Option | 内容 | 評価 |
|--------|------|------|
| **A（推奨）** | 共通辞書に **`social` セクション新設**（`social.youtube/x/twitch` = 完全 aria 文字列） | SocialFollowLinks が Footer 経由で全ページに出るため site-wide 取得が必要。共通辞書が最適。**採用推奨** |
| B | `topPage` / 専用 social モデルへ保持 | topPage はホーム限定 → プロフィール等の Footer で解決不能。**不可** |
| C | 可視ラベル + 共通注記から合成 | SocialFollowLinks は可視ラベルが無い（アイコンのみ）→ 合成元が無い。かつ層またぎ再合成は §20 禁止。**不採用** |

→ **D-F=Option A**（共通辞書に `social` セクション）を推奨。

外部注記のキー形状（D-A）:

| Option | 形状 | 評価 |
|--------|------|------|
| **1（推奨）** | `accessibility.externalLinkNote`（**1 キー・完全な括弧付き注記**） | 現行 DOM（3 箇所同一の 1 文字列）と一致・ja byte 一致・合成不要。**採用推奨** |
| 2 | `externalLink` + `opensInNewTab`（2 キー・render 時合成） | "(" + a + "・" + b + ")" の区切りが言語ごとに異なり脆い。機能差なし。**不採用** |

→ **D-A=Option 1**（1 キー `accessibility.externalLinkNote`）を推奨。

## 8. English draft（EN）

| ID | JA（正本） | EN draft | 出典 |
|----|-----------|----------|------|
| E01 | `(外部リンク・新しいタブで開きます)` | `(external link, opens in a new tab)` | Sprint 33 T18（承認済み） |
| E02 | `YouTubeで配信を見る(…)` | `Watch on YouTube (external link, opens in a new tab)` | 動作句 = Sprint 33 T04（承認済み）＋ E01 |
| E03 | `Xで活動を追う(…)` | `Follow along on X (external link, opens in a new tab)` | 動作句 = Sprint 33 T16（承認済み）＋ E01 |
| E04 | `Twitchで配信を見る(…)` | `Watch on Twitch (external link, opens in a new tab)` | 動作句 = Sprint 33 T20（承認済み）＋ E01 |

- 括弧前に半角スペース（英語慣習）。動作句は既存 topPage 承認訳と一致（YouTube/X の可視 CTA と整合）。

## 9. Simplified Chinese draft（简体字 / zh-hans）

| ID | JA（正本） | ZH-HANS draft |
|----|-----------|---------------|
| E01 | `(外部リンク・新しいタブで開きます)` | `（外部链接，将在新标签页中打开）` |
| E02 | `YouTubeで配信を見る(…)` | `在 YouTube 观看直播（外部链接，将在新标签页中打开）` |
| E03 | `Xで活動を追う(…)` | `在 X 关注动态（外部链接，将在新标签页中打开）` |
| E04 | `Twitchで配信を見る(…)` | `在 Twitch 观看直播（外部链接，将在新标签页中打开）` |

- 全角括弧（中国語慣習・スペースなし）。動作句は Sprint 33 承認訳（T04/T16/T20）と一致。`标签页`（`窗口` と混同しない）。**簡体字のみ**。

## 10. Traditional Chinese draft（繁體字 / zh-hant）

| ID | JA（正本） | ZH-HANT draft |
|----|-----------|---------------|
| E01 | `(外部リンク・新しいタブで開きます)` | `（外部連結，將在新分頁中開啟）` |
| E02 | `YouTubeで配信を見る(…)` | `在 YouTube 觀看直播（外部連結，將在新分頁中開啟）` |
| E03 | `Xで活動を追う(…)` | `在 X 關注動態（外部連結，將在新分頁中開啟）` |
| E04 | `Twitchで配信を見る(…)` | `在 Twitch 觀看直播（外部連結，將在新分頁中開啟）` |

- 全角括弧。`連結`/`分頁`/`開啟`（繁体用字・簡体からの機械変換ではない）。動作句は Sprint 33 承認訳（T04/T16/T20）と一致。**繁体字のみ**。

## 11. Korean draft（한국어 / ko）

| ID | JA（正本） | KO draft |
|----|-----------|----------|
| E01 | `(外部リンク・新しいタブで開きます)` | `(외부 링크, 새 탭에서 열립니다)` |
| E02 | `YouTubeで配信を見る(…)` | `YouTube에서 방송 보기 (외부 링크, 새 탭에서 열립니다)` |
| E03 | `Xで活動を追う(…)` | `X에서 소식 보기 (외부 링크, 새 탭에서 열립니다)` |
| E04 | `Twitchで配信を見る(…)` | `Twitch에서 방송 보기 (외부 링크, 새 탭에서 열립니다)` |

- 半角括弧の前に半角スペース。`새 탭`（`새 창` と混同しない）。動作句は Sprint 33 承認訳（T04/T16/T20）と一致（名詞止め「보기」）。

## 12. External-link helper review（E01）

- 共通辞書 `accessibility.externalLinkNote` に 1 キーで追加（D-A=Option 1）。ja は byte 一致で**既存文字列の集約**（表記変更ではない）。
- consumer: **Button**（Hero YouTube CTA・全 locale）と **ChannelLinks**（ホーム・全 locale）の sr-only を props 経由で辞書値に置換。
- **ContentCard は対象外**（C3）: News は ja 専用（Sprint 27 D-01=B・`/en/news` 等は 404）で外国語出力が無く、
  かつ `app/[locale]/news/**` は本 Sprint の**変更禁止**。→ ContentCard の日本語注記リテラルは**そのまま維持**（外国語 defect が存在しないため最小・安全）。
  結果として ja 注記は「辞書」と「ContentCard リテラル」の 2 箇所に存在するが、いずれも ja 専用文脈で同一文字列＝実害なし（§20 リスクに記載）。

## 13. FOLLOW landmark review（D-B）

- 現状: 可視 h2 `FOLLOW`（英字ブランド見出し）。ホーム FOLLOW 節のみ `<section aria-labelledby>` で参照され、landmark 名 = "FOLLOW"。
  Footer variant は landmark 参照なし（Footer landmark 内の見出し）。
- 現在 **「フォロー」相当の日本語 accessible name は存在しない**（landmark 名は英字 "FOLLOW"）。
- §13 指示: 「FOLLOW は可視見出しとして英字維持」。localize には**新規 ja 文字列**（例「すぴたろうをフォロー」）の新設が必要 → §13「日本語正本が現在別表現の場合は人間判断なしに変更しない」。
- **AI 推奨 = D-B: KEEP**（landmark 名は可視 "FOLLOW" のまま・新 ja 文字列を作らない）。理由: 本 Sprint の実 defect は SNS **リンク**の aria であり、
  それを E02-E04 で完全に解消すれば landmark 名の localize は不要。最小差分・ブランド見出し英字維持方針と整合。
- （代替案）landmark に locale 別 aria-label「Follow Supitaro / すぴたろうをフォロー / 关注 Supitaro / 追蹤 Supitaro / Supitaro 팔로우」を付与。採用する場合は ja 新設可否も人間決定要。

## 14. YouTube link review（D-C）

- E02。SocialFollowLinks の YouTube `<a>`（アイコン aria-hidden）。accessible name は aria-label が唯一。
- 動作句「配信を見る」= Sprint 33 T04 承認訳（Watch on YouTube / 在 YouTube 观看直播 / 在 YouTube 觀看直播 / YouTube에서 방송 보기）＋ E01 注記。
- ブランド名 `YouTube` は全 locale 維持。URL・アイコン・順序・target/rel 不変。

## 15. X link review（D-D）

- E03。**実コードの動作句は「Xで活動を追う」**（指示書想定「最新情報を見る」ではない → §4 実装事実優先）。
- 「活動を追う」= Sprint 33 T16 承認訳（Follow along on X / 在 X 关注动态 / 在 X 關注動態 / X에서 소식 보기）＋ E01 注記。
- ブランド名 `X` は全 locale 維持。ChannelLinks の可視 X CTA（xCta）と動作句が一致（整合）。

## 16. Twitch link review（D-E）

- E04。Twitch は topPage/ChannelLinks に無く SocialFollowLinks のみ（可視 CTA なし・aria が唯一）。
- 動作句「配信を見る」= Sprint 33 T20 承認訳（Watch on Twitch / 在 Twitch 观看直播 / 在 Twitch 觀看直播 / Twitch에서 방송 보기）＋ E01 注記。
- ブランド名 `Twitch` は全 locale 維持。

## 17. Proposed component-prop flow

**辞書スキーマ追加（最小）**:

```ts
// content/i18n/ja.ts（正本・byte 一致の既存文字列を集約）
accessibility: {
  skipToContent, openMenu, closeMenu,      // 既存
  externalLinkNote: "(外部リンク・新しいタブで開きます)",   // 追加（E01）
},
social: {                                   // 追加セクション（E02-E04・完全 aria）
  youtube: "YouTubeで配信を見る(外部リンク・新しいタブで開きます)",
  x:       "Xで活動を追う(外部リンク・新しいタブで開きます)",
  twitch:  "Twitchで配信を見る(外部リンク・新しいタブで開きます)",
},
```

`schema.ts` は `typeof ja` 由来のため自動追随。プロップ型付け用に `SocialDictionary = Dictionary["social"]` を追加（任意）。

**props 配線（すべて Server → props。Client 境界は越えない＝全対象は Server Component）**:

| ファイル | 変更 |
|----------|------|
| `components/Button.tsx` | 判別ユニオンで external 時 `externalLabel: string` を必須化 → sr-only に描画 |
| `components/Hero.tsx` | `externalLinkNote: string` を受領し YouTube Button の `externalLabel` へ渡す |
| `components/ChannelLinks.tsx` | `externalLinkNote: string` を受領し sr-only に描画 |
| `components/SocialFollowLinks.tsx` | `social: SocialDictionary` を受領し aria-label を辞書値に（label で youtube/x/twitch を対応） |
| `components/Footer.tsx` | `social: SocialDictionary` を受領し SocialFollowLinks へ渡す |
| `components/i18n/SiteShell.tsx` | `dict.social` を Footer へ渡す |
| `app/[locale]/page.tsx` | `getDictionary(locale)` を追加し note/social を各コンポーネントへ配線 |
| `app/not-found.tsx` | `getDictionary("ja").social` を Footer へ渡す（**条件付き許可**・ja 値・最小差分） |

**変更しない**: `components/ContentCard.tsx`（§12）, `app/[locale]/news/page.tsx`（変更禁止・ja 専用）, `app/[locale]/layout.tsx`（不要）。

## 18. Server and Client boundary

- 対象コンポーネント（Button/Hero/ChannelLinks/SocialFollowLinks/Footer/SiteShell）はすべて **Server Component**（`"use client"` なし）。
- 辞書取得は Server（`getDictionary`）。解決済み文字列のみを props で渡す。**Client（MobileMenu）は SNS/外部注記に非関与**＝境界を越えない。
- runtime fetch なし・hydration 後の文言切替なし・辞書全体を Client へ渡さない（§19 指示）。

## 19. Ambiguous strings

- **X 動作句の相違**: 指示書 §5/§14 は「Xで最新情報を見る」を想定するが、実コードは「Xで活動を追う」。§4 に従い**実コードを正本**とし「Follow along on X / 在 X 关注动态 / …」を採用。日本語は不変（勝手に変更しない）。
- **注記の括弧・スペース**: 言語慣習に合わせ ja=半角括弧密着 / en・ko=半角括弧前スペース / zh=全角括弧。完全 aria を locale 別に保持し合成しないため差異は各値に内包。
- **ja 注記の 2 箇所化**: 辞書 `externalLinkNote` と ContentCard リテラルに同一 ja 文字列が残る（ContentCard は ja 専用・変更禁止 news 経由）。将来ドリフト時の整合はテスト（§Tests）で辞書側を固定。

## 20. Risks

- **R1（ContentCard 未 locale 化）**: 意図的（ja 専用・外国語 render なし・news 変更禁止）。外国語 defect は生じない。ja 注記が辞書と 2 箇所に残る（同一文字列・実害なし）。
- **R2（Button 判別ユニオン）**: external 必須プロップ化で型が厳格化。external 呼び出しは Hero 1 箇所のみ → 影響最小。internal 呼び出しは既存どおり。
- **R3（not-found の条件付き変更）**: Footer が `social` 必須化されるため 404 も ja `social` を渡す最小追加が必要。404 本文・日本語 chrome・言語切替省略は不変。
- **R4（新 `social` セクション）**: `ja` 追加でスキーマが 5 辞書に `social` を要求 → en/zh-hans/zh-hant/ko 未追加なら型エラー（漏れ検出＝設計どおり）。
- **R5（外国語は引き続き noindex）**: 本 Sprint は a11y 文言のみ。metadata/canonical/hreflang/noindex 解除は対象外（後続 SEO 基盤 Sprint）。

## 21. Human decisions required

| ID | 決定事項 | 選択肢 | AI 推奨 |
|----|---------|--------|---------|
| D-A | 外部注記のキー形状 | 1 キー `externalLinkNote` / 2 キー分割合成 | **1 キー（externalLinkNote）** |
| D-B | FOLLOW 領域の accessible name | KEEP（"FOLLOW" のまま）/ locale 別 landmark 名を新設（ja 新設要） | **KEEP** |
| D-C | YouTube accessible name | §14 の 4 言語訳 | §14 のとおり |
| D-D | X accessible name（動作句＝「活動を追う」） | §15 の 4 言語訳 | §15 のとおり |
| D-E | Twitch accessible name | §16 の 4 言語訳 | §16 のとおり |
| D-F | SNS 固有文言の配置 | 共通辞書 `social` / topPage / 専用モデル | **共通辞書 `social`（Option A）** |
| D-G | aria の作り方 | 完全文字列を保持 / 可視ラベル + sr-only 合成 | **完全文字列を locale 別に保持（合成しない）** |
| D-H | 部分承認時の扱い | 一括（全 4 承認後）/ 順次 | **一括（Sprint 33/37 と同じ）** |

補足の確認事項:
- **X 動作句が「活動を追う」である点の追認**（指示書想定と相違・実コード優先）。
- ContentCard を **触らない**方針（ja 専用・変更禁止 news 経由）の追認。

## 22. Human approvals

**受領（2026-07-18・全 AI 推奨どおり確定）**:

```text
EN=APPROVE / ZH-HANS=APPROVE / ZH-HANT=APPROVE / KO=APPROVE

D-A=externalLinkNote の 1 キー（完成済み文字列・括弧/句読点/空白を含む）
D-B=KEEP（FOLLOW を可視見出しで維持・新 aria-label を追加しない）
D-C=承認（YouTube・§14）
D-D=承認（X・動作句「活動を追う」の意味を変えず各言語対応・§15）
D-E=承認（Twitch・§16）
D-F=共通辞書 social（Footer/404 で再利用可能なため topPage 不可）
D-G=完全文字列を locale 別保持（consumer 側で合成しない）
D-H=全 4 外国語承認後に一括実装

追認①=X 動作句「活動を追う」で承認（実コード優先）
追認②=ContentCard は変更しない（ja 専用 News・外国語残存問題に非関与）
```

補足（人間）: Button は external のときだけ externalLinkNote を要求する型とし、内部リンク・注記不要の利用箇所を壊さない最小設計。
404 は Footer の SNS aria へ日本語 social 値を明示的に渡す（404 本文・URL・ルーティング・metadata は不変）。

## 23. Approval status

**APPROVED → IMPLEMENTED（Phase B 完了・commit 前）**。承認済み文言のみ反映。日本語 E01〜E04 は byte 一致で辞書へ集約。
可視文言・SNS URL・target・rel・FOLLOW 見出し・ContentCard・ページ本文・metadata・noindex は不変。全検証後 commit せず commit 前報告で停止。
