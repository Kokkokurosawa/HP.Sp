# Sprint 40 Phase A — locale 別 metadata 翻訳レビュー（人間確認用）

Status: **APPROVED**（2026-07-18・EN/ZH-HANS/ZH-HANT/KO すべて APPROVE、D-A〜D-H 回答済み → Phase B 実装済み）

> 人間決定（確定）: D-A=4 外国語案を承認 / D-B=Supitaro 統一 / D-C=日本語ブランドを残さない / D-D=absolute title /
> D-E=Option B（`content/seoMetadata.ts`）/ D-F=OG・Twitter は Sprint 41 へ分離 / D-G=全 4 承認後に一括 / D-H=日本語は記録のみ。
> 補足: M01 top title は `Supitaro — <説明>` 形式を採用（Official Site 単独は識別力不足）。KO description は説明調（합니다体）。
> ja M01〜M06 は最終 HTML 出力を含め byte 一致で維持。`content/seoMetadata.ts` は 5 locale × top/profile/gallery × title/description
> をすべて必須・fallback なし。openGraph・twitter は本 Sprint 不変（日本語のまま＝既知事項・Sprint 41 で OG locale/URL と一括是正）。

> Phase A 成果物。外国語ドラフトは AI 初稿（Sprint 33〜35/37 で人間承認済みの本文表現を可能な限り再利用）。
> 4 外国語すべての APPROVE と人間決定 D-A〜D-H の回答を受領後にのみ、承認済み文言のみを Phase B で実装する。
> 単一関心事: **外国語トップ・プロフィール・ギャラリーの metadata title／description を人間承認済みの正式翻訳へ確定する**。
> canonical・hreflang・sitemap・robots・SITE_URL・metadataBase・noindex 解除は本 Sprint で実装しない（Sprint 41/42）。

---

## 1. Purpose

外国語トップ・プロフィール・ギャラリーは正式本文・共通 UI を持つが、metadata の `title`／`description` は未翻訳で、
実配信では**全ページが日本語 root metadata を継承**している（§7 で実測）。本 Sprint はこの 6 種 ×4 外国語（計 24 文字列）の
正式翻訳を調査・作成・人間確認する。News（ja のみ）・404 は対象外。

## 2. Baseline

```text
branch = main / working tree = clean
local HEAD = origin/main = remote = 872f1abbaabaaba8d62cd0f1cbe5bf48670f634a
latest commit = docs: design multilingual seo foundation
```

一致確認済み（Phase A はコード無変更）。

## 3. Decision-of-record references

- **Sprint 27**: locale=ja/en/zh-hans/zh-hant/ko、ja 接頭辞なし、News は ja のみ、簡繁独立、名称は外国語 `Supitaro`。
- **Sprint 33/34/35**: トップ／プロフィール／ギャラリー本文の人間承認訳（title/description の**用語・表現の source of truth**）。
- **Sprint 37**: 共通 UI 承認（Gallery 用語＝ja ギャラリー/en Gallery/zh-hans 画廊/zh-hant 畫廊/ko 갤러리）。
- **Sprint 39**: SEO 基盤設計・人間決定（D-A=SITE_URL / D-B=Stage A 検証 / D-C=x-default ja / D-D=metadata 翻訳先行 / D-G=一括 noindex 解除）。
  本 Sprint は D-D の履行（SEO 実装より前に metadata 翻訳を確定）。

競合時は Sprint 27／39 の人間決定を優先。

## 4. Current metadata architecture

- **root**（`app/[locale]/layout.tsx`）: `metadataBase`=Stage A 固定、`title.default`=`すぴたろう公式サイト`、`title.template`=`%s | すぴたろう公式サイト`、
  `description`=`siteConfig.description`、`openGraph`（title/description/siteName=日本語・`locale:"ja_JP"` 固定・images）、`twitter`（title/description=日本語）。
  `alternates.canonical` は `siteConfig.siteUrl`（=空）ゲートで**非出力**。
- **各ページ** `generateMetadata`（locale 別分岐）:
  - トップ（`app/[locale]/page.tsx`）: ja→`{}`（root 継承）／外国語→`{ robots:{index:false,follow:false} }`（title/description 未指定＝root 継承）。
  - プロフィール（`app/[locale]/profile/page.tsx`）: ja→`{title:"プロフィール", description:…}`／外国語→`{ robots:{…} }`。
  - ギャラリー（`app/[locale]/gallery/page.tsx`）: ja→`{title:"ギャラリー", description:…}`／外国語→`{ robots:{…} }`。
  - News（ja のみ）: `{title:"お知らせ", description:…}`（対象外）。
- metadata/seo 用テストは**未実装**。

## 5. Root title template

```text
title.default  = すぴたろう公式サイト
title.template = %s | すぴたろう公式サイト
```

- 子が `title` 文字列を返すと template 適用（例: `プロフィール` → `プロフィール | すぴたろう公式サイト`）。
- 子が `title` を返さない（＝外国語の現状）と `title.default`（`すぴたろう公式サイト`）が出る。
- **外国語ページで template により日本語ブランドが付く／既定日本語 title が出る問題**（§18 title-template 判断）。

## 6. Current Japanese metadata（正本・実測で確認）

| ID | Page | Field | 日本語正本（最終出力・byte 一致対象） |
|----|------|-------|--------------------------------------|
| M01 | top | title | `すぴたろう公式サイト`（root default） |
| M02 | top | description | `宇宙から来た、ふしぎないきもの「すぴたろう」の公式サイト。プロフィール・お知らせ・配信チャンネルへの入口です。`（siteConfig.description） |
| M03 | profile | title | `プロフィール | すぴたろう公式サイト`（`プロフィール`＋template） |
| M04 | profile | description | `すぴたろうのプロフィール。宇宙から来た、ふしぎないきもの。丸いものが好き。家主の留守中に、こっそりゲーム配信をしている。`（characterName＋profile.intro.join("")） |
| M05 | gallery | title | `ギャラリー | すぴたろう公式サイト`（`ギャラリー`＋template） |
| M06 | gallery | description | `すぴたろうのイラストギャラリー。準備ができ次第、すこしずつ公開していきます。` |

**日本語 metadata に問題は発見していない**（§22 D-H）。本 Sprint では日本語を byte 一致で維持し変更しない。

## 7. Current foreign-language metadata（実測・分類）

ローカル production build＋HTML head 実測（`/en`・`/en/profile`・`/en/gallery`・`/ko`・`/ko/gallery` 等）:

```text
外国語トップ/プロフィール/ギャラリー（全 3 種 × 4 locale）:
  <title>            = すぴたろう公式サイト   ← root default（3 ページとも同一の日本語）
  meta description   = 宇宙から来た、…（siteConfig.description・日本語）
  og:title           = すぴたろう公式サイト   （root・日本語）
  robots             = noindex, nofollow      （locale 別・唯一 locale 化されている項目）
  canonical/hreflang = 非出力
```

**分類 = A/D**: 外国語ページは title/description/OG とも**日本語 root metadata を全継承**（locale 別 title/description は不在＝D）。
locale 別なのは robots（noindex）のみ。外国語 3 ページは title が同一で相互に判別不能。→ 本 Sprint の解消対象。

## 8. Top-page source-content alignment

トップ本文（承認済み・`content/topPage.ts`）: Hero heading `A mysterious creature from outer space.`（T02）・subtext `Care to take a little peek at Supitaro?`・
intro `Loves round things.`（T11）/`Secretly streams games while the homeowner is away.`（T12）・channels。→ metadata は「宇宙から来た／丸いもの好き／留守中に配信」の 3 事実（§9）を本文表現で表す。本文にない主張は追加しない。

## 9. Profile-page source-content alignment

プロフィール本文（承認済み・`content/profileContent.ts`）: pageTitle（Profile/简介/簡介/프로필）・intro（本文と同一 3 行）・traits・`About Supitaro` 等。
→ profile description は intro（承認訳）を自然文へ。詳細設定は追加しない（`upcoming` は空＝準備中）。

## 10. Gallery-page source-content alignment

ギャラリー本文（承認済み・`content/galleryContent.ts`）: pageTitle（Gallery/画廊/畫廊/갤러리・Sprint 35/37）・lead `A place to gather illustrations of Supitaro and friends…`・
preview。→ gallery description は「Supitaro たちのイラスト／すこしずつ公開」を承認表現で。掲載していない制作物・DL 用途は示唆しない。**Gallery 用語は `画廊`/`畫廊` を使用（`图库`/`圖庫` へ戻さない）**。

## 11. English draft（EN）

| ID | JA 正本 | EN draft | 文字数 | 根拠 |
|----|---------|----------|--------|------|
| M01 top title | すぴたろう公式サイト | `Supitaro — A Mysterious Creature from Outer Space` | 49 | T02 承認訳（brand-led・absolute） |
| M02 top desc | （§6） | `Official site of Supitaro, a mysterious creature from outer space that loves round things and secretly streams games. Explore the profile and gallery.` | 151 | T02/T11/T12＋外国語 nav（profile/gallery） |
| M03 profile title | プロフィール \| すぴたろう公式サイト | `Profile \| Supitaro` | 19 | nav Profile＋brand（page \| brand） |
| M04 profile desc | （§6） | `Get to know Supitaro, a mysterious creature from outer space that loves round things and secretly streams games while the homeowner is away.` | 138 | profileContent intro 承認訳 |
| M05 gallery title | ギャラリー \| すぴたろう公式サイト | `Gallery \| Supitaro` | 19 | Gallery（承認）＋brand |
| M06 gallery desc | （§6） | `An illustration gallery of Supitaro and friends. New artwork is shared little by little as it becomes ready.` | 106 | galleryContent lead 承認訳（and friends／little by little） |

- 括弧・記号: title は `Page | Brand`（ja template と同じ ` | ` 区切り）、top は `Supitaro — <descriptor>`（em-dash）。`official` は top で 1 回のみ。

## 12. Simplified Chinese draft（简体字 / zh-hans）

| ID | ZH-HANS draft | 根拠 |
|----|---------------|------|
| M01 top title | `Supitaro — 来自宇宙的奇妙生物` | 承認訳「来自宇宙的奇妙生物」 |
| M02 top desc | `Supitaro 的官方网站。来自宇宙的奇妙生物，喜欢圆圆的东西，还会趁房主不在时偷偷做游戏直播。快来看看简介和画廊吧。` | 承認訳（房主／偷偷做游戏直播／简介／画廊） |
| M03 profile title | `简介 \| Supitaro` | 承認 nav 简介 |
| M04 profile desc | `认识一下 Supitaro：来自宇宙的奇妙生物，喜欢圆圆的东西，还会趁房主不在时偷偷做游戏直播。` | profileContent lead「认识 Supitaro」＋intro |
| M05 gallery title | `画廊 \| Supitaro` | Sprint 37 D-GAL「画廊」 |
| M06 gallery desc | `Supitaro 们的插画画廊。图片准备好后，会一点一点地公开。` | galleryContent lead（插画／一点一点） |

- **簡体字のみ**。`画廊`（`图库` へ戻さない）。全角句読点。

## 13. Traditional Chinese draft（繁體字 / zh-hant）

| ID | ZH-HANT draft | 根拠 |
|----|---------------|------|
| M01 top title | `Supitaro — 來自宇宙的奇妙生物` | 承認訳 |
| M02 top desc | `Supitaro 的官方網站。來自宇宙的奇妙生物，喜歡圓圓的東西，還會趁屋主不在時偷偷做遊戲直播。快來看看簡介和畫廊吧。` | 承認訳（屋主／偷偷做遊戲直播／簡介／畫廊） |
| M03 profile title | `簡介 \| Supitaro` | 承認 nav 簡介 |
| M04 profile desc | `認識一下 Supitaro：來自宇宙的奇妙生物，喜歡圓圓的東西，還會趁屋主不在時偷偷做遊戲直播。` | profileContent lead＋intro |
| M05 gallery title | `畫廊 \| Supitaro` | Sprint 35/37「畫廊」 |
| M06 gallery desc | `Supitaro 們的插畫畫廊。圖片準備好後，會一點一點地公開。` | galleryContent lead |

- **繁体字のみ**（`連結`系の用字整合・簡体からの機械変換でない）。`畫廊`（`圖庫` へ戻さない）。屋主（zh-hans は房主）。

## 14. Korean draft（KO）

| ID | KO draft | 根拠 |
|----|----------|------|
| M01 top title | `Supitaro — 우주에서 온 신기한 생물` | 承認訳「우주에서 온 신기한 생물」 |
| M02 top desc | `우주에서 온 신기한 생물 Supitaro의 공식 사이트. 동그란 것을 좋아하고, 집주인이 없는 사이 몰래 게임 방송을 합니다. 프로필과 갤러리를 둘러보세요.` | 承認訳（집주인／게임 방송／프로필／갤러리） |
| M03 profile title | `프로필 \| Supitaro` | 承認 nav 프로필 |
| M04 profile desc | `Supitaro의 프로필. 우주에서 온 신기한 생물로, 동그란 것을 좋아하고 집주인이 없는 사이 몰래 게임 방송을 합니다.` | profileContent intro |
| M05 gallery title | `갤러리 \| Supitaro` | 承認 갤러리 |
| M06 gallery desc | `Supitaro들의 일러스트 갤러리. 준비되는 대로 조금씩 공개해 나갑니다.` | galleryContent lead（일러스트／조금씩） |

- **語調**: 本文は해요体だが、metadata description は自然な**説明調（합니다体）**とし（§15 に従い해요体を無理に持ち込まない）、末尾の誘導のみ `둘러보세요`。用語は本文承認語（프로필/갤러리/게임 방송）と統一。**この語調選択は D-A の確認事項**（해요体へ統一希望なら REVISE 可）。

## 15. Title-length review

全 title は 49 文字以下（M01 top が最長 ≈49・en）。プロフィール/ギャラリー title は `Page | Brand` で 19〜（簡潔）。検索での途中切断リスク低。

## 16. Description-length review

- en: top 151 / profile 138 / gallery 106 文字（いずれも ~160 以内・主旨前半・§7）。
- zh-hans/zh-hant: 1〜2 文（top ~40 字・profile ~35 字・gallery ~24 字）。ko: top ~70 字・profile ~50 字・gallery ~30 字。
- 文字数のための水増しはしない。全て本文承認表現の再構成のみ。

## 17. Brand-name policy

- 翻訳しない: `すぴたろう`（ja のみ）／`Supitaro`／`YouTube`／`X`／`Twitch`。
- **外国語は `Supitaro` に統一**（D-B）。同一 metadata 内で `すぴたろう` と `Supitaro` を無目的に重複させない（外国語 title/description に日本語ブランドを残さない＝D-C）。
- ja は既存表記（`すぴたろう`／`すぴたろう公式サイト`）を byte 一致で維持。

## 18. Title-template decision（§16・重要）

現状 template により、外国語で `title` を返すと日本語ブランド `すぴたろう公式サイト` が付き、返さないと日本語既定が出る（§7 実測）。選択肢:

| ID | 内容 | 評価 |
|----|------|------|
| D-TITLE-A | root template 維持＋外国語 title 末尾にも `すぴたろう` | 日本語ブランドが外国語 title に残る（D-C 違反）。**非推奨**。 |
| **D-TITLE-B** | 外国語（＋ja も）で **absolute title** を使い、完成 title を出す（ja は最終文字列 byte 一致） | 日本語ブランド混入を防ぎ、ja 最終出力も不変。**推奨**。 |
| D-TITLE-C | locale 別 layout metadata template を導入 | root 構造の大規模変更。**Sprint 41 以降で検討可**（本 Sprint では避ける）。 |

**AI 推奨 = D-TITLE-B（absolute title）**。Phase B は各ページ generateMetadata で `title:{ absolute: <copy.title> }` を返す。
ja は `absolute` に**現行最終文字列**（top=`すぴたろう公式サイト`／profile=`プロフィール | ${siteName}`／gallery=`ギャラリー | ${siteName}`）を格納し**最終 <title> を byte 一致**で維持（template 適用と同一出力）。外国語は §11-14 の完成 title。root の template/default は変更しない（News・404 は現行どおり）。

## 19. Metadata data-model options

| Option | 内容 | 評価 |
|--------|------|------|
| A | 各本文コンテンツ（topPage/profileContent/galleryContent）へ metadata 追加 | 本文と SEO 責務が混在。 |
| **B** | metadata 専用ファイル新設 | SEO 文言の責務が明確・Sprint 41 の SEO helper と接続容易。**推奨**。 |
| C | 共通 UI 辞書へ追加 | metadata は UI chrome でない。**非推奨**（§18 指示）。 |

**AI 推奨 = B**。新規ファイル = **`content/seoMetadata.ts`**（候補 3 つ〔metadata.ts／seoMetadata.ts／i18n/pageMetadata.ts〕から、既存命名（topPage/profileContent/galleryContent）と責務明確性で `seoMetadata.ts` を選定）。型（§19 指示）:

```ts
type PageMetadataCopy = { title: string; description: string };
type PageKey = "top" | "profile" | "gallery";
const pageMetadata: Record<Locale, Record<PageKey, PageMetadataCopy>> = { ja, en, "zh-hans":…, "zh-hant":…, ko };
export function getPageMetadata(locale: Locale, page: PageKey): PageMetadataCopy;
```

- 5 locale × 3 page 必須・title/description 必須・**日本語 fallback なし**（型と test で網羅）。`title` は最終 absolute 文字列。
- ja エントリは既存ソース（`siteConfig.siteName/description`・`characterName`・`profile.intro`）を参照して byte 一致を構成（Option B の二重定義回避と同方針）。

## 20. OpenGraph and Twitter boundary

- 現状 og:title/og:description/twitter は root 継承（日本語）。**Next.js の metadata マージは openGraph を深いマージしない**（ページで openGraph を設定すると root の images/locale/siteName を再指定しないと失われる）。
- meta `title`（absolute）と meta `description` は openGraph とは独立に設定でき、OG に影響しない。
- **AI 推奨 = D-F: OG/twitter の title/description locale 化は Sprint 41 へ分離**（B）。理由: openGraph をページで再設定すると `og:locale`/`og:image`（変更禁止）を再指定する必要が生じ最小変更にならない。OG は Sprint 41 で `og:locale`（locale 別）・`og:url`（canonical helper 共用）と一括是正するのが安全。
- 本 Sprint では **meta `<title>` と meta `description` のみ locale 化**（robots は noindex 維持）。og:title/og:description は当面日本語のまま（noindex 中で公開共有対象外・Sprint 41 で是正）。

## 21. Unchanged Japanese source

日本語 metadata（M01〜M06 の最終出力）・root template/default・siteConfig・profile.ts は**変更しない**（Phase B で byte 一致維持）。日本語に問題は発見していない（§6）。

## 22. Human decisions required

| ID | 決定事項 | 選択肢 | AI 推奨 |
|----|---------|--------|---------|
| D-A | 4 外国語の title/description 案（§11-14） | APPROVE / REVISE / HOLD（文字列単位可） | §11-14 のとおり承認を推奨 |
| D-B | 外国語ブランド名を `Supitaro` に統一 | 統一する / しない | **統一する** |
| D-C | 外国語 title に日本語 `すぴたろう` を残すか | 残す / 残さない | **残さない**（absolute） |
| D-D | 外国語（＋ja）で absolute title を使うか | 使う / template 維持 | **使う（D-TITLE-B）** |
| D-E | metadata 配置 | A 本文へ / **B 専用ファイル `content/seoMetadata.ts`** / C 辞書 | **B** |
| D-F | page title/desc を OG/twitter と共用するか | A 本 Sprint で共用 / **B Sprint 41 へ分離** | **B（分離）** |
| D-G | 部分承認時 | 承認分のみ反映（ただし全 4 承認まで実装しない）/ locale 順次実装 | **全 4 承認後に一括実装** |
| D-H | 日本語 metadata の問題発見時 | 本 Sprint で修正 / 記録のみ・別 Sprint | **記録のみ**（現状問題なし） |

補足の確認事項:
- **M01 top title の形式**: `Supitaro — <説明>`（推奨・SEO 向き）か、`Supitaro 官方网站`/`Supitaro Official Site` 相当（ja「公式サイト」に忠実）か。REVISE で指定可。
- **KO 語調**: description を説明調（합니다体）で提案（§14）。해요体統一希望なら REVISE。

## 23. Human approvals

（未受領。下記フォーマットで回答してください。）

```text
EN:      APPROVE / REVISE: <ID=修正文> / HOLD
ZH-HANS: APPROVE / REVISE: <…> / HOLD
ZH-HANT: APPROVE / REVISE: <…> / HOLD
KO:      APPROVE / REVISE: <…> / HOLD

D-A / D-B / D-C / D-D / D-E / D-F / D-G / D-H の回答
（M01 top title 形式・KO 語調の補足確認）
```

- 1 件でも HOLD・未回答の locale はコードへ反映しない。個別修正は `REVISE: M02 EN = "…"`。

## 24. Approval status

**READY FOR HUMAN APPROVAL**（未承認・コード無変更）。4 外国語 APPROVE と D-A〜D-H 回答受領後に Phase B（`content/seoMetadata.ts` 実装・generateMetadata 接続・検証）へ進む。
承認済み文言のみ反映。日本語 metadata（M01〜M06）byte 一致・外国語 noindex 維持・canonical/hreflang/sitemap/robots/OG 非実装。
