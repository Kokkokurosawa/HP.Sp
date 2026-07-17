# Sprint 35 — Gallery Page Translation Review（Phase A）

各言語版ギャラリーページ（`/en/gallery` `/zh-hans/gallery` `/zh-hant/gallery` `/ko/gallery`）と、
外国語トップの Gallery プレビュー再表示のための **翻訳案 + 人間確認依頼**。

- 種別: Phase A（翻訳案作成・人間確認）。**コード変更なし**。本文書のみ新規作成。
- 先例: Sprint 33（トップ）／Sprint 34（プロフィール）の二段階フローを踏襲。
- 判定: `GALLERY_PAGE_TRANSLATION_DRAFT_READY_FOR_HUMAN_REVIEW`

---

## 1. Purpose

Sprint 27 で採用した初回多言語対象範囲のうち、**ギャラリーページと Gallery 固有 UI** を 5 locale
（ja / en / zh-hans / zh-hant / ko）対応へ移行する。本 Sprint の単一関心事は
**Gallery コンテンツ・Gallery カード・Gallery 固有 UI（lightbox 含む）の多言語化**、および
**外国語トップの Gallery プレビュー再表示**。

News・404・metadata・Header・Footer・FOLLOW 共有 UI・サイト全体の検索公開は対象外。
外国語 Gallery は実装後も `noindex` を維持する（§20）。

---

## 2. Baseline

作業開始時に確認済み。

```text
branch = main
working tree = clean
local HEAD = origin/main = remote ref = 4d46425a19707f1ec5c923a9d47eda2b08374259
latest commit = feat: implement multilingual profile page
```

Baseline 一致。Phase A ではコードを変更しない。

---

## 3. Japanese Gallery structure（調査結果）

正本 = 現在の日本語 Gallery ページと `content/gallery.ts`。

### ルーティング／描画

- `app/[locale]/gallery/page.tsx`
  - `dynamicParams = false`、`generateStaticParams` = 全 5 locale。
  - `generateMetadata`: ja のみ `title/description`（**metadata は本 Sprint 対象外＝§4**）、外国語は `robots {index:false, follow:false}`。
  - `locale === "ja"` → `JapaneseGallery`、外国語 → `LocaleScaffold`（今回これを正式 Gallery へ置換）。
  - `JapaneseGallery`: `h1` + リード文 + （公開作品 > 0 なら `GalleryGrid`、0 なら `GalleryEmptyState`）。
  - 全 locale で `SiteShell locale routeKey="gallery"`（Header/Footer/言語切替は SiteShell 側＝本 Sprint 不変）。

### コンポーネント連鎖

```text
GalleryPage → SiteShell（chrome）
  └ JapaneseGallery → GalleryGrid（"use client"）
        ├ GalleryCard（"use client"、variant "default"|"compact"）
        └ GalleryLightbox（"use client"、dialog）
HomeGallerySection（"use client"、トップ preview）→ GalleryCard(compact) + GalleryLightbox 再利用
GalleryEmptyState（0 件時のみ・後述のとおり現状は非描画）
```

### 作品数・順序

- **公開作品 = 1 件**（`getPublishedGalleryItems()` = `isPublished === true`）。
- 現在 `galleryItems` は 1 要素のみ、順序は配列順。
- **`GalleryEmptyState` は現状レンダリングされない**（公開 1 件のため常に `items.length > 0`）。→ §18 参照。

### lightbox の事実

- 単一画像 dialog。**「前へ／次へ」ナビゲーション・「n 件中 m 件」等の位置表現は存在しない**（カルーセル未実装）。
- したがって翻訳対象の操作文は **「閉じる」相当のみ**。前後移動・位置表現の翻訳は不要（該当なし）。

---

## 4. Japanese source inventory（抽出した文字列）

| Translation ID | UI location | Japanese source |
| --- | --- | --- |
| G-PAGE-H1 | gallery/page.tsx `JapaneseGallery` h1 | `ギャラリー` |
| G-PAGE-LEAD | gallery/page.tsx `JapaneseGallery` リード | `すぴたろうたちのイラストを集めていく場所です。公開が承認された画像だけを、すこしずつ追加していきます。` |
| G-CARD-HINT | GalleryCard 拡大ヒント（可視・虫めがね横） | `大きく見る` |
| G-CARD-OPEN | GalleryCard カード全面 button の aria-label（テンプレート `{表示名}を大きく見る`） | `を大きく見る`（接尾。`{表示名}` = title または alt） |
| G-LB-CLOSE | GalleryLightbox 閉じる button の aria-label ＋ sr-only（同一文字列 2 箇所） | `画像を閉じる` |
| G01-TITLE | content/gallery.ts `supitaro-design-art-v1` の `title.ja`（figcaption ＋ lightbox 見出し） | `すぴたろう デザインアート` |
| G01-ALT | content/gallery.ts `supitaro-design-art-v1` の `image.alt`（card ＋ lightbox の `<Image alt>`） | `星や惑星に囲まれて立つ、すぴたろうのデザインアート。白い体に青い目、額の青いひし形、青い耳と尻尾。` |
| G-PREV-HEAD | HomeGallerySection セクション見出し | `デザインギャラリー` |
| G-PREV-LEAD | HomeGallerySection リード | `すぴたろうのデザインを、すこしだけ。` |
| G-PREV-CTA | HomeGallerySection `/gallery` への Button | `ギャラリーを見る` |

**同一性の記録**: `G-LB-CLOSE`（`画像を閉じる`）は「閉じる button の aria-label」と「sr-only テキスト」の 2 箇所で
同一値。翻訳 ID を 1 つに統一して再利用する。

---

## 5. Gallery item inventory（作品ごとの完全抽出）

作品は現在 1 件のみ。

| フィールド | 値 | 翻訳 |
| --- | --- | --- |
| id | `supitaro-design-art-v1` | 不変（構造キー） |
| characterSlug | `supitaro` | 不変 |
| image.src | `/images/supitaro/supitaro-design-art-v1.png` | 不変（画像共有・5 重複しない） |
| image.alt | `星や惑星に囲まれて立つ、…青い耳と尻尾。` | 翻訳（G01-ALT） |
| title.ja | `すぴたろう デザインアート` | 作品 title 方針（§8・D-A） |
| description | なし（未設定） | 該当なし |
| publishedAt | `2026-07-13` | 不変 |
| isPublished | `true` | 不変 |

画像寸法は**コンポーネント定数**（GalleryCard=800×800、GalleryLightbox=1000×1000）であり、
作品データにも locale にも属さない → locale 間で本質的に不変（§23 の「寸法 locale 一致」はこの構造で自動保証）。

分類（§5 の A–G）:

```text
A. 作品名        = すぴたろう デザインアート（→ §8 で方針決定）
B. キャラクター名 = すぴたろう / Supitaro（既定 D-A: Supitaro 維持）
C. シーン名      = なし
D. 通常説明文     = alt 内の描写（星・惑星・体色など）
E. 画像 alt      = G01-ALT
F. 作品内固有語   = なし（「デザインアート」は一般語）
G. 翻訳しない正式名 = Supitaro、画像 src、id
```

---

## 6. Translation scope（翻訳対象）

```text
- G-PAGE-H1     ギャラリー見出し
- G-PAGE-LEAD   ギャラリーリード文
- G-CARD-HINT   「大きく見る」可視ヒント
- G-CARD-OPEN   カード開く操作の aria-label テンプレート
- G-LB-CLOSE    lightbox 閉じる（aria-label ＋ sr-only）
- G01-TITLE     作品 title（方針は §8）
- G01-ALT       作品 alt
- G-PREV-HEAD   トップ preview 見出し
- G-PREV-LEAD   トップ preview リード
- G-PREV-CTA    トップ preview CTA
```

計 10 文字列（G-CARD-OPEN はテンプレート）。

---

## 7. Out-of-scope strings（対象外）

```text
- gallery metadata（title / description）… §4（metadata は別 Sprint）。ja 現状維持・外国語 noindex 維持。
- GalleryEmptyState 文言 … 公開 1 件のため実際に発火しない（§3「実際に発火する場合」に非該当）。§18 参照。
- Header / Footer / 言語切替 / skip リンク（SiteShell・共通 UI 辞書）
- Hero / intro / channels（トップ本文＝Sprint 33 で確定・不変）
- Profile / News / 404 本文
- lightbox「前へ／次へ／位置表現」… 実装に存在しない（該当なし）
- 画像そのもの・画像内の埋め込み文字（該当画像に日本語埋め込みなし）
- 外部リンク共通注記 / OG / canonical / hreflang / sitemap
```

---

## 8. Work-title policy（作品 title 方針・要人間決定）

対象 = `G01-TITLE`「すぴたろう デザインアート」。§5 のとおり **AI が正式外国語 title を代理決定しない**。
以下を比較のうえ人間が決定（**D-A**）。

| 選択肢 | en 例 | zh-hans 例 | zh-hant 例 | ko 例 |
| --- | --- | --- | --- | --- |
| (a) 日本語維持 | すぴたろう デザインアート | 同左 | 同左 | 同左 |
| (b) 翻訳（Supitaro 維持）**★AI 推奨** | Supitaro Design Art | Supitaro 设计原画 | Supitaro 設計原畫 | Supitaro 디자인 아트 |
| (c) 日本語 ＋ 翻訳併記 | すぴたろう デザインアート（Supitaro Design Art） | … | … | … |
| (d) ローマ字表記 | Supitaro Design Art | （中韓では非現実的） | — | — |

AI 推奨 = **(b)**。理由: 「デザインアート」は固有名ではなく一般語（design art）であり、`Supitaro` を維持すれば
固有性は保たれる。各言語話者が読める表示になる。§11 のカードは短い title を前提とするため (c) 併記は overflow リスク。

---

## 9. Proper-noun inventory（固有語）

```text
すぴたろう      → Supitaro（Sprint 33・34 と一致・全 locale 維持）
デザインアート   → 一般語（design art）。固有名ではない → 翻訳可。
画像 src / id   → 不変（技術識別子）
```

作品内に翻訳しない固有表現・口癖・作品固有名は**なし**（この 1 作品には該当語なし）。

---

## 10. Image-alt policy（alt 方針・§6 準拠）

- 現行 ja alt（G01-ALT）は装飾語の羅列ではなく、被写体（星・惑星に囲まれて立つ Supitaro）と
  外見（白い体・青い目・額の青いひし形・青い耳と尻尾）を説明する妥当な代替テキスト。→ この内容を各言語で**忠実に**翻訳する。
- **見えていない設定を追加しない**。ja alt は「青い耳と尻尾」で**尻尾の本数を書いていない** → 翻訳でも本数を足さない。
- title の機械的複製にしない（alt は画像内容の説明、title は作品名）。

### 観察事項（報告のみ・ja は修正しない）

- `content/gallery.ts` の G01-ALT は「青い耳と**尻尾**」（本数なし）。一方 `config/site.ts` の profile 画像 alt は
  「青い耳と**2 本の尻尾**」（Sprint 34 で en=two blue tails 等と確定）。**別画像（デザインアート vs プロフィール）**のため
  本数表記が異なる。§2・§6 に従い **ja alt は変更せず、翻訳は ja（本数なし）に忠実**とする。齟齬は報告のみ。

---

## 11. English draft

| ID | English |
| --- | --- |
| G-PAGE-H1 | `Gallery` |
| G-PAGE-LEAD | `A place to gather illustrations of Supitaro and friends. Only approved images are added here, little by little.` |
| G-CARD-HINT | `View larger` |
| G-CARD-OPEN | `View {name} larger`（例: `View Supitaro Design Art larger`） |
| G-LB-CLOSE | `Close image` |
| G01-TITLE | `Supitaro Design Art`（D-A=(b) の場合） |
| G01-ALT | `Design art of Supitaro standing surrounded by stars and planets. A white body, blue eyes, a blue diamond on the forehead, and blue ears and tail.` |
| G-PREV-HEAD | `Design Gallery` |
| G-PREV-LEAD | `A little glimpse of Supitaro’s design.` |
| G-PREV-CTA | `View the gallery` |

Notes: 「すぴたろうたち」= "Supitaro and friends"（複数の仲間を示す〜たちの自然な英語化。特定の別キャラを追加する意図はない）→ D-F。

---

## 12. Simplified Chinese draft（zh-hans / html lang zh-Hans）

| ID | 简体中文 |
| --- | --- |
| G-PAGE-H1 | `画廊` |
| G-PAGE-LEAD | `这里是收集 Supitaro 们的插画的地方。只会把已获准公开的图片，一点一点地添加进来。` |
| G-CARD-HINT | `放大查看` |
| G-CARD-OPEN | `放大查看{name}`（例: `放大查看 Supitaro 设计原画`） |
| G-LB-CLOSE | `关闭图片` |
| G01-TITLE | `Supitaro 设计原画`（D-A=(b) の場合） |
| G01-ALT | `Supitaro 站在星星和行星的环绕中的设计原画。白色身体、蓝色眼睛、额头上有蓝色菱形、蓝色耳朵和尾巴。` |
| G-PREV-HEAD | `设计画廊` |
| G-PREV-LEAD | `稍微看一点 Supitaro 的设计。` |
| G-PREV-CTA | `查看画廊` |

方針: 简体字のみ・中国本土で自然な一般語彙・Supitaro 維持・「查看」は Sprint 33/34 と整合。

---

## 13. Traditional Chinese draft（zh-hant / html lang zh-Hant）

| ID | 繁體中文 |
| --- | --- |
| G-PAGE-H1 | `畫廊` |
| G-PAGE-LEAD | `這裡是收集 Supitaro 們的插畫的地方。只會把已核准公開的圖片，一點一點地加進來。` |
| G-CARD-HINT | `放大檢視` |
| G-CARD-OPEN | `放大檢視{name}`（例: `放大檢視 Supitaro 設計原畫`） |
| G-LB-CLOSE | `關閉圖片` |
| G01-TITLE | `Supitaro 設計原畫`（D-A=(b) の場合） |
| G01-ALT | `Supitaro 站在星星和行星環繞之中的設計原畫。白色身體、藍色眼睛、額頭上有藍色菱形、藍色耳朵和尾巴。` |
| G-PREV-HEAD | `設計畫廊` |
| G-PREV-LEAD | `稍微看一點 Supitaro 的設計。` |
| G-PREV-CTA | `查看畫廊` |

方針: 繁体字のみ・簡体からの機械変換ではなく用字を独立（畫/檢視/圖片/核准）・台湾/香港で違和感の少ない語彙・Supitaro 維持。

---

## 14. Korean draft（ko / html lang ko）

| ID | 한국어 |
| --- | --- |
| G-PAGE-H1 | `갤러리` |
| G-PAGE-LEAD | `Supitaro들의 일러스트를 모아 가는 곳이에요. 공개가 승인된 이미지만, 조금씩 추가해 나가요.` |
| G-CARD-HINT | `크게 보기` |
| G-CARD-OPEN | `{name} 크게 보기`（例: `Supitaro 디자인 아트 크게 보기`） |
| G-LB-CLOSE | `이미지 닫기` |
| G01-TITLE | `Supitaro 디자인 아트`（D-A=(b) の場合） |
| G01-ALT | `별과 행성에 둘러싸여 서 있는 Supitaro의 디자인 아트. 흰 몸에 파란 눈, 이마에 파란 마름모, 파란 귀와 꼬리.` |
| G-PREV-HEAD | `디자인 갤러리` |
| G-PREV-LEAD | `Supitaro의 디자인을, 아주 조금.` |
| G-PREV-CTA | `갤러리 보기` |

方針: Sprint 33・34 と語調整合（해요体・「보기」名詞形ボタン）・不自然な逐語訳を避ける・Supitaro 維持。

---

## 15. Gallery-card translation matrix（作品ごと対応表）

item id = `supitaro-design-art-v1`（唯一の作品）:

| 項目 | ja（正本） | en | zh-hans | zh-hant | ko |
| --- | --- | --- | --- | --- | --- |
| title | すぴたろう デザインアート | Supitaro Design Art | Supitaro 设计原画 | Supitaro 設計原畫 | Supitaro 디자인 아트 |
| alt | 星や惑星に囲まれて立つ、…青い耳と尻尾。 | Design art of Supitaro standing… blue ears and tail. | …设计原画。…蓝色耳朵和尾巴。 | …設計原畫。…藍色耳朵和尾巴。 | …디자인 아트. …파란 귀와 꼬리. |
| card hint | 大きく見る | View larger | 放大查看 | 放大檢視 | 크게 보기 |
| open aria | すぴたろう デザインアートを大きく見る | View Supitaro Design Art larger | 放大查看 Supitaro 设计原画 | 放大檢視 Supitaro 設計原畫 | Supitaro 디자인 아트 크게 보기 |

lightbox の見出し（figcaption/lightbox title）は同じ `title` を再利用。作品数・順序・画像・比率は全 locale 不変。

---

## 16. Lightbox translation matrix

| 項目 | ja | en | zh-hans | zh-hant | ko |
| --- | --- | --- | --- | --- | --- |
| lightbox title | すぴたろう デザインアート | Supitaro Design Art | Supitaro 设计原画 | Supitaro 設計原畫 | Supitaro 디자인 아트 |
| lightbox alt | （G01-ALT） | （G01-ALT en） | （G01-ALT hans） | （G01-ALT hant） | （G01-ALT ko） |
| 閉じる（aria/sr-only） | 画像を閉じる | Close image | 关闭图片 | 關閉圖片 | 이미지 닫기 |
| 前へ / 次へ / 位置 | — 実装に存在しない（該当なし） | — | — | — | — |

lightbox の `aria-labelledby` は title（存在時）、なければ `aria-label` = alt。本作品は title を持つため title 参照。

---

## 17. Top-page Gallery-preview impact（§14 調査結果）

- トップ preview の見出し `デザインギャラリー`・リード `すぴたろうのデザインを、すこしだけ。`・CTA `ギャラリーを見る` は
  **`content/topPage.ts` には存在しない**（topPage は hero/intro/channels のみ）。→ `components/home/HomeGallerySection.tsx` に**ハードコード**。
  → **Sprint 33 では未翻訳**。Gallery 固有コンテンツとして本 Sprint で翻訳する（重複定義は発生しない）。
- 現在、外国語トップは `galleryItems = showJapaneseOnlySections ? getPublishedGalleryItems() : []`（＝空配列）で **preview 非表示**。
  Gallery カード・alt・操作文の翻訳完了後、外国語トップでも preview を**再表示**する（§14 期待表を満たす）。
- `HomeGallerySection` の `/gallery` リンク（`<Button href="/gallery">`）は**ハードコード**。外国語では
  `localizedPath(locale, "gallery")`（例 `/en/gallery`）へ解決する必要がある（ページ側で解決して props で渡す）。
- 維持: Hero 直下の位置・カード順序・画像数・カード比率・アニメーション。

---

## 18. Ambiguous source strings（曖昧・非描画）

- **GalleryEmptyState**: 公開 1 件のため `items.length > 0` が常に真 → **現状レンダリングされない死枝**（Sprint 34 の
  プロフィール画像プレースホルダ死枝と同種）。§3 は空状態翻訳を「実際に発火する場合」に限定 → **本 Sprint は翻訳対象外**。
  ja 文言も現状のまま（描画されないため不可視）。将来 0 件公開状態が発生する場合に別途対応。→ 勝手に翻訳配線しない。
- **G01-ALT の尻尾本数**: §10 の観察事項（ja alt に本数記載なし・profile alt は「2 本」）。ja は不変・翻訳は ja に忠実。
- **「すぴたろうたち」の複数化**: 現在キャラは Supitaro 1 体のみだが、ja は「〜たち」（複数/仲間）。特定の別キャラを
  追加せず、複数を示す自然表現で訳す（en: and friends / zh: 们 / ko: 들）。→ D-F。

---

## 19. Translation risks

```text
- 作品 title (b) 翻訳採用時、Supitaro を各言語に維持しても「设计原画/設計原畫/디자인 아트」の語選択に地域差の余地。
- zh-hans/zh-hant の用字混在（画/畫・图/圖・关/關・检/檢 等）→ Phase B テストでクロスコンタミ検査。
- 外国語 title/alt が長くなるとカード figcaption・lightbox 見出しで overflow の可能性 → まず簡潔化で対応、デザインは変えない。
- HomeGallerySection / GalleryCard / GalleryLightbox は "use client"。翻訳文字列は Server で解決し props で渡す
  （辞書・locale map・locale 判定を Client へ渡さない＝§22）。
- LocaleScaffold が Gallery 置換後に未使用化する可能性（§21・D-G）。
```

---

## 20. Content model（Phase B 実装方針・要人間決定 D-D）

| 案 | 概要 | 評価 |
| --- | --- | --- |
| A | `content/gallery.ts` を locale 対応へ拡張 | 画像台帳（Obsidian 境界）に翻訳を混ぜる。既存 `LocalizedText{ja,en?}` の設計思想（「勝手に英訳を作らない」）と衝突 |
| **B ★AI 推奨** | `content/galleryContent.ts` を新設。ja は既存 `content/gallery.ts` を**参照**（title.ja・alt・src・id・順序を再定義しない）。UI 文字列＋作品別翻訳（title/alt）を locale 別に保持。Server で `GalleryView`（表示用解決済み文字列）へ統合 | Sprint 34（profileContent）と同型。二重定義なし・型安全・build 時欠落検出・テスト可能 |
| C | 既存データ維持＋別 locale 翻訳マップを Server 統合 | B とほぼ同型。B は「新ファイルに UI 文字列も同居」で参照実装が 1 箇所に集約でき、profile と一貫 |

**推奨 = Option B**。実装形:

```text
content/gallery.ts       … 変更なし（作品台帳＋ja 正本: id/src/alt.ja/title.ja/順序/publishedAt）
content/galleryContent.ts（新規）
  - type GalleryStrings   … locale 別 UI（pageTitle, lead, viewLarger, closeLabel, preview{heading,lead,cta}）
  - type GalleryView      … 表示用解決済み item（id, src, alt, title?, openLabel）… src は gallery.ts 参照
  - 作品別翻訳マップ（id→{title, alt}）… ja は gallery.ts を参照（重複なし）
  - getGalleryView(locale) … 台帳（id/src）× locale テキスト（title/alt/openLabel）を統合し {strings, items} を返す
```

Client（GalleryCard/Grid/Lightbox/HomeGallerySection）は **解決済み文字列**（title, alt, openLabel, viewLarger, closeLabel）
と表示用 item のみ受け取る。禁止事項（locale 配列完全複製・src 5 重複・巨大 switch・日本語 fallback・optional 翻訳キー・any・
runtime fetch）はいずれも回避。

**コンポーネント props 追加（条件付き許可 §「条件付き許可」）**: GalleryCard に `openLabel`・`viewLargerLabel`、
GalleryLightbox に `closeLabel`、GalleryGrid/HomeGallerySection に文字列 props ＋ `galleryHref`（preview）を追加。
デザイン・日本語表示・他ページ回帰なし・最小差分。Phase B commit 前報告で必要性を明記する。

---

## 21. Scaffold 未使用化の扱い（要人間決定 D-G）

調査結果:

- `LocaleScaffold` コンポーネントの**唯一の使用箇所は `app/[locale]/gallery/page.tsx`**（profile/top は Sprint 33/34 で置換済み）。
  → Gallery 置換で**コンポーネントは未使用化**する。
- ただし辞書セクション `localeScaffold` とその型は残存参照あり:
  - `content/i18n/schema.ts`（`LocaleScaffoldDictionary` 型）
  - `content/i18n/index.ts`（型 re-export）
  - 各 locale 辞書（`ja.ts`/`en.ts`/…）の `localeScaffold` セクション、`content/i18n/dictionary.test.ts` の検証
  → `LocaleScaffold.tsx` を消すと辞書 `localeScaffold` セクション・型・テストが**波及的に不要化**する（Gallery 外の広い差分）。

| 選択肢 | 内容 | 評価 |
| --- | --- | --- |
| (retain) **★AI 推奨** | `LocaleScaffold.tsx` と辞書 `localeScaffold` を**残す**（未使用コンポーネントとして報告）。除去は専用クリーンアップ Sprint へ | 本 Sprint の差分を Gallery に限定・回帰面小・§19「不明なら残す」に整合 |
| (delete) | `LocaleScaffold.tsx` 削除＋辞書 `localeScaffold`・schema 型・test も整理 | 差分が i18n 辞書全体へ波及。参照 0・build 成功・全 route 回帰の証明が必要（§「条件付き許可」） |

推奨 = **retain**（本 Sprint は Gallery 多言語化に集中）。削除するなら D-G=delete を明示指定してください。

---

## 22. noindex policy

外国語 Gallery は人間承認済み本文へ置換後も `noindex` 維持（§20）。理由 = 404 多言語化未完了・metadata 未翻訳・
canonical/hreflang 未実装・sitemap 未整備・独自ドメイン未確定。解除は別 Sprint 判断。ja Gallery は既定挙動。

---

## 23. Human decisions required（要決定一覧）

| ID | 決定事項 | AI 推奨 |
| --- | --- | --- |
| D-A | 作品 title `すぴたろう デザインアート` の外国語方針（(a)日本語維持 / (b)翻訳 / (c)併記 / (d)ローマ字） | **(b) 翻訳（Supitaro 維持）** |
| D-B | Gallery 固有 UI 操作文（G-CARD-HINT / G-CARD-OPEN / G-LB-CLOSE / preview 見出し・リード・CTA）の各言語訳承認 | §11–14 の草案で承認 |
| D-C | 画像 alt 方針（ja に忠実・尻尾本数を足さない） | §10 の方針で承認 |
| D-D | Content model（A / B / C） | **Option B** |
| D-E | 外国語トップ Gallery preview 再表示（heading/lead/cta 翻訳・localized `/gallery` href） | 再表示する |
| D-F | 「すぴたろうたち」の複数化（en: and friends / zh: 们 / ko: 들） | 承認 |
| D-G | Gallery 置換で未使用化する `LocaleScaffold.tsx` の扱い（retain / delete） | **retain（本 Sprint は残置・報告）** |

### locale 単位の回答様式

```text
EN: APPROVE / REVISE / HOLD
ZH-HANS: APPROVE / REVISE / HOLD
ZH-HANT: APPROVE / REVISE / HOLD
KO: APPROVE / REVISE / HOLD
```

作品単位（必要時）:

```text
G01: APPROVE / REVISE: <修正文> / HOLD
```

---

## 24. Human approvals（確定）

| locale | 判定 | 備考 |
| --- | --- | --- |
| EN | **APPROVE** | §11 草案どおり |
| ZH-HANS | **APPROVE** | §12 草案どおり |
| ZH-HANT | **APPROVE** | §13 草案どおり |
| KO | **APPROVE** | §14 草案どおり |

| 決定 | 回答（確定） | 内容 |
| --- | --- | --- |
| D-A | **(b) 翻訳** | 作品 title を各言語へ翻訳・キャラ名は `Supitaro` 統一。EN `Supitaro Design Art` / ZH-HANS `Supitaro 设计原画` / ZH-HANT `Supitaro 設計原畫` / KO `Supitaro 디자인 아트` |
| D-B | **承認** | Gallery カード・lightbox・トップ preview の操作文を §11–14 草案どおり採用 |
| D-C | **承認** | alt は日本語正本にない尻尾本数・設定を追加しない。見える内容と ja alt の意味に忠実に翻訳 |
| D-D | **Option B** | `content/galleryContent.ts` 新設。画像・ID・順序等の日本語正本データは `content/gallery.ts` を参照し、翻訳対象だけ locale 別管理 |
| D-E | **再表示する** | Gallery 翻訳完了後、外国語トップ preview を再表示。見出し・リード・CTA・カード文言・alt・リンク先を現在 locale へ対応 |
| D-F | **承認** | 「すぴたろうたち」の複数表現を §11–14 各言語案どおり採用。単数 `Supitaro` へ意味を縮めない |
| D-G | **retain** | `LocaleScaffold.tsx` と `localeScaffold` 辞書は本 Sprint では残す。未使用整理は i18n 辞書全体を含む専用 Sprint へ分離 |

---

## 25. Approval status

```text
STATUS: APPROVED — all 4 foreign locales APPROVE; D-A〜D-G decided
VERDICT: GALLERY_PAGE_TRANSLATION_APPROVED → proceed to Phase B
```

Phase B の制約: 外国語 Gallery は `noindex` 維持。日本語 Gallery の作品数・順序・文言・画像・操作・No-JS 契約を変更しない。
実装と全検証の完了後は commit せず、commit 前報告で停止する。
