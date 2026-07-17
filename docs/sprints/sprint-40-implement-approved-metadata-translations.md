# Sprint 40 — Implement Approved Metadata Translations（Phase B）

外国語トップ・プロフィール・ギャラリーの metadata `title`／`description` を人間承認済みの正式翻訳へ確定し、
型付き専用モデル（`content/seoMetadata.ts`）から各 `generateMetadata` へ接続した。

- 種別: Phase B（承認済み翻訳の実装・検証）。commit 前報告で停止。
- 判定: `MULTILINGUAL_METADATA_TRANSLATIONS_HUMAN_APPROVED_AND_IMPLEMENTED`

---

## 1. Purpose

外国語ページで日本語 root metadata を継承していた title/description を、5 locale × top/profile/gallery で正式 locale 化する。
canonical・hreflang・sitemap・robots・SITE_URL・metadataBase・noindex 解除・OG は本 Sprint で実装しない（Sprint 41/42）。

## 2. Baseline

```text
branch = main / working tree = clean（実装前）
local HEAD = origin/main = remote = 872f1abbaabaaba8d62cd0f1cbe5bf48670f634a
latest commit = docs: design multilingual seo foundation
```

## 3. Decision-of-record references

Sprint 27（locale 方針）／33〜35・37（本文・共通 UI 承認訳＝用語の source of truth）／39（SEO 設計・D-D=metadata 翻訳先行）。
本 Sprint は Sprint 39 D-D の履行。

## 4. Translation-review process

Phase A で `sprint-40-metadata-translation-review.md`（24 節・M01〜M06・D-A〜D-H）を作成 → 人間確認。
動作句・用語は Sprint 33〜35/37 承認訳を再利用（本文↔metadata 整合）。Sprint 33〜38 と同じ二段階フロー。

## 5. Human approvals

```text
EN / ZH-HANS / ZH-HANT / KO : すべて APPROVE
D-A=4 外国語案承認 / D-B=Supitaro 統一 / D-C=日本語ブランドを残さない / D-D=absolute title /
D-E=Option B（content/seoMetadata.ts）/ D-F=OG・Twitter は Sprint 41 へ分離 / D-G=全 4 承認後に一括 / D-H=日本語は記録のみ
補足: M01 top title = `Supitaro — <説明>` 形式 / KO description = 説明調（합니다体）
```

## 6. Japanese metadata source（byte 一致で維持）

| ID | Page | Field | 日本語（最終出力・不変） |
|----|------|-------|--------------------------|
| M01 | top | title | `すぴたろう公式サイト` |
| M02 | top | description | `宇宙から来た、ふしぎないきもの「すぴたろう」の公式サイト。プロフィール・お知らせ・配信チャンネルへの入口です。` |
| M03 | profile | title | `プロフィール | すぴたろう公式サイト` |
| M04 | profile | description | `すぴたろうのプロフィール。宇宙から来た、ふしぎないきもの。丸いものが好き。家主の留守中に、こっそりゲーム配信をしている。` |
| M05 | gallery | title | `ギャラリー | すぴたろう公式サイト` |
| M06 | gallery | description | `すぴたろうのイラストギャラリー。準備ができ次第、すこしずつ公開していきます。` |

ja エントリは `siteConfig.siteName/description`・`characterName`・`profile.intro` を**参照**して構成（二重定義回避・byte 一致は参照＋テストで保証）。実配信 head 監査で M01〜M06 の byte 一致を確認。

## 7. Metadata data model

新規 `content/seoMetadata.ts`（D-E=Option B）:

```ts
export type PageMetadataKey = "top" | "profile" | "gallery";
export type PageMetadataCopy = { title: string; description: string };
type LocalizedPageMetadata = Record<PageMetadataKey, PageMetadataCopy>;
const pageMetadata: Record<Locale, LocalizedPageMetadata> = { ja, en, "zh-hans", "zh-hant", ko };
export function getPageMetadata(locale, page): PageMetadataCopy;
```

- 5 locale × 3 page × title/description **すべて必須**（型で網羅）・**日本語 fallback なし**。`title` は最終 absolute 文字列。
- 本文（topPage/profileContent/galleryContent）・共通 UI 辞書（content/i18n）とは責務分離。

## 8. Top-page metadata

- title（absolute）: ja=`すぴたろう公式サイト`／en=`Supitaro — A Mysterious Creature from Outer Space`／zh-hans=`Supitaro — 来自宇宙的奇妙生物`／zh-hant=`Supitaro — 來自宇宙的奇妙生物`／ko=`Supitaro — 우주에서 온 신기한 생물`。
- description: 承認訳（宇宙から来た／丸いもの好き／留守中に配信 の 3 事実＋外国語で存在する導線）。本文にない主張は追加せず。

## 9. Profile-page metadata

- title（absolute）: `<pageTitle> | Supitaro`（ja のみ `プロフィール | すぴたろう公式サイト`）。pageTitle は Sprint 34 承認（Profile/简介/簡介/프로필）。
- description: profileContent intro の承認訳を自然文へ。詳細設定は追加せず。

## 10. Gallery-page metadata

- title（absolute）: `<pageTitle> | Supitaro`（ja のみ `ギャラリー | すぴたろう公式サイト`）。pageTitle は Sprint 35/37 承認（Gallery/画廊/畫廊/갤러리。`图库`/`圖庫` へ戻さない）。
- description: galleryContent lead の承認訳（Supitaro たち／すこしずつ公開）。掲載外の制作物・DL 用途は示唆せず。

## 11. English implementation

top=`Supitaro — A Mysterious Creature from Outer Space` / `Official site of Supitaro, a mysterious creature from outer space that loves round things and secretly streams games. Explore the profile and gallery.`
profile=`Profile | Supitaro` / `Get to know Supitaro, a mysterious creature from outer space that loves round things and secretly streams games while the homeowner is away.`
gallery=`Gallery | Supitaro` / `An illustration gallery of Supitaro and friends. New artwork is shared little by little as it becomes ready.`

## 12. Simplified Chinese implementation

top=`Supitaro — 来自宇宙的奇妙生物` / `Supitaro 的官方网站。来自宇宙的奇妙生物，喜欢圆圆的东西，还会趁房主不在时偷偷做游戏直播。快来看看简介和画廊吧。`
profile=`简介 | Supitaro` / `认识一下 Supitaro：来自宇宙的奇妙生物，喜欢圆圆的东西，还会趁房主不在时偷偷做游戏直播。`
gallery=`画廊 | Supitaro` / `Supitaro 们的插画画廊。图片准备好后，会一点一点地公开。`（简体字のみ・画廊）

## 13. Traditional Chinese implementation

top=`Supitaro — 來自宇宙的奇妙生物` / `Supitaro 的官方網站。來自宇宙的奇妙生物，喜歡圓圓的東西，還會趁屋主不在時偷偷做遊戲直播。快來看看簡介和畫廊吧。`
profile=`簡介 | Supitaro` / `認識一下 Supitaro：來自宇宙的奇妙生物，喜歡圓圓的東西，還會趁屋主不在時偷偷做遊戲直播。`
gallery=`畫廊 | Supitaro` / `Supitaro 們的插畫畫廊。圖片準備好後，會一點一點地公開。`（繁体字のみ・畫廊・屋主）

## 14. Korean implementation

top=`Supitaro — 우주에서 온 신기한 생물` / `우주에서 온 신기한 생물 Supitaro의 공식 사이트. 동그란 것을 좋아하고, 집주인이 없는 사이 몰래 게임 방송을 합니다. 프로필과 갤러리를 둘러보세요.`
profile=`프로필 | Supitaro` / `Supitaro의 프로필. 우주에서 온 신기한 생물로, 동그란 것을 좋아하고 집주인이 없는 사이 몰래 게임 방송을 합니다.`
gallery=`갤러리 | Supitaro` / `Supitaro들의 일러스트 갤러리. 준비되는 대로 조금씩 공개해 나갑니다.`（description は説明調 합니다体）

## 15. Title-template handling

- root の `title.default`/`title.template`（`%s | すぴたろう公式サイト`）は**変更しない**。
- 各ページ generateMetadata は `title: { absolute: copy.title }` を返す（D-TITLE-B）。→ 外国語で日本語ブランドが付かない。
- ja は absolute に**現行最終文字列**を格納し、最終 `<title>` を byte 一致で維持（top=default・profile/gallery=template 適用後と同一）。
- News（`お知らせ`＋template）・404 は非変更。

## 16. OpenGraph and Twitter handling

- **本 Sprint では変更しない**（D-F=B）。og:title/og:description/twitter は引き続き root の日本語（実測 og:title=`すぴたろう公式サイト`）。
- 理由: Next.js は openGraph を深いマージしないため、page で og:title を設定すると og:locale/og:image（変更禁止）を再指定する必要があり最小変更にならない。
- **既知事項**: 外国語ページの OG/twitter は日本語のまま。noindex 中で公開共有対象外。**Sprint 41 で og:locale（locale 別）・og:url（canonical helper 共用）と一括是正**する。

## 17. Robots preservation

- 外国語トップ/プロフィール/ギャラリー: `robots:{index:false,follow:false}` を**維持**（実測 `noindex, nofollow`）。metadata を正式化しても検索公開は開始しない。
- 日本語ページ: robots override なし＝**indexable 維持**（実測 robots 出力なし）。

## 18. Canonical and hreflang deferral

- `alternates.canonical`/`alternates.languages`/`x-default`/`metadataBase`/`SITE_URL`/`sitemap`/`robots.txt` は**本 Sprint 非実装**（実測 canonical/hreflang とも全ページ非出力）。Sprint 41 の単一関心事。

## 19. Japanese regression

- 実配信 head 監査で `/`・`/profile`・`/gallery` の title/description が M01〜M06 と byte 一致（変更前後で不変）。
- `/news`（`お知らせ | すぴたろう公式サイト`）・`/ja`（307→`/`）・404（日本語カスタム）も不変。ページ本文・Header/Footer・言語切替は非変更（generateMetadata のみ変更）。

## 20. No-JS behavior

metadata は初期 HTML head へ Server 出力される。`fetch`（JS 未実行の生 HTML）で全 15 ページの title/description/robots を確認＝No-JS でも locale 別 metadata が正しい。本文・ナビ・Footer も既存どおり。

## 21. Tests

新規 `content/seoMetadata.test.ts`（**8 件**）:
- 5 locale × 3 page の title/description 必須（非空）。日本語 fallback なし（外国語 ≠ ja）。
- **ja byte 一致（M01〜M06）**（siteConfig/characterName/profile.intro を参照して照合）。
- 外国語 title に日本語ブランド（すぴたろう/公式サイト）を含まず Supitaro を含む（D-C）。
- **gallery/profile title が承認済みページ見出しで始まる**（nav↔page↔metadata 整合・getGalleryContent/getProfile と突合）。
- 承認済み外国語 title（EN/ZH-HANS/ZH-HANT/KO）・簡繁独立・Gallery 用語 画廊/畫廊・代表 description。

既存テスト（dictionary 27・gallery 9・profile 8・topPage 7・locales 9・routes 9）回帰なし。

## 22. Validation results

```text
npm run lint       → 0 problems
npx tsc --noEmit   → exit 0
npm run build      → 19 static pages（全 locale SSG）
node tests         → seoMetadata 8 + dictionary 27 + gallery 9 + profile 8 + topPage 7 + locales 9 + routes 9 = 77/77
git diff --check   → clean
```

テストは Sprint 30〜39 と同方式（tsc→CJS＋`@/` resolver shim・`node --test`）。package.json へ test script 追加なし。

## 23. HTML head audit

ローカル production（`next start`）で全 15 ページ head を実測。**失敗 0**。

- 日本語 3 ページ: title/description が M01〜M06 と byte 一致・robots 非出力（indexable）。
- 外国語 12 ページ: title=承認 absolute（日本語ブランドなし）・description=承認訳・robots=`noindex, nofollow`・html lang=locale 別（zh-Hans/zh-Hant 等）。
- 全 15 ページ: canonical/hreflang **非出力**（維持）・og:title は `すぴたろう公式サイト`（日本語のまま＝§16 既知）。
- 回帰: `/news` 200（title 不変）・`/ja` 307→`/`・`/zh`・`/en/news`・`/no-such-page` 404 日本語。
- console/hydration/failed 監査（/・/en・/ko/profile・/zh-hant/gallery）=すべて 0。

## 24. Changed files

```text
変更（3）:
  app/[locale]/page.tsx          （top generateMetadata を getPageMetadata＋absolute title へ）
  app/[locale]/profile/page.tsx  （同上・未使用の profile import 削除）
  app/[locale]/gallery/page.tsx  （同上・未使用の siteConfig import 削除）
新規（3）:
  content/seoMetadata.ts             （metadata 専用型付きデータ・getPageMetadata）
  content/seoMetadata.test.ts        （8 件）
  docs/sprints/sprint-40-metadata-translation-review.md          （Phase A）
  docs/sprints/sprint-40-implement-approved-metadata-translations.md（Phase B・本文書）
不変（重要）:
  app/[locale]/layout.tsx（root metadata/template/OG 不変）・app/[locale]/news/page.tsx・app/not-found.tsx・
  content/{topPage,profileContent,galleryContent,profile}.ts・content/i18n/**・config/site.ts・
  next.config.*・package.json・lockfile・public/**・components/**
```

## 25. Risks

- **R1（OG/twitter 日本語残存）**: 外国語 OG/twitter は日本語のまま（D-F=B・意図的）。noindex 中で公開共有対象外。Sprint 41 で og:locale/url と一括是正。
- **R2（ja absolute 化）**: ja も absolute title に移行したが最終 `<title>` は byte 一致（監査確認）。root template は News/404 用に維持。
- **R3（noindex 継続）**: metadata 正式化後も検索公開しない（Sprint 42 で解除判断）。日本語は従来どおり indexable。

## 26. Deferred work

- Sprint 41: SITE_URL helper・metadataBase・canonical・hreflang・x-default・sitemap・robots・**OG locale/URL 是正**（title/description の OG 共用含む）。
- Sprint 42: 配信監査・noindex 解除可否の最終判断。

## 27. Recommended next Sprint

Sprint 41（SEO URL helper・canonical・hreflang・sitemap・robots・OG 是正）。本 Sprint の `content/seoMetadata.ts` を OG title/description の共用元として接続できる。

## 28. Final verdict

```text
MULTILINGUAL_METADATA_TRANSLATIONS_HUMAN_APPROVED_AND_IMPLEMENTED
（外国語 top/profile/gallery の meta title/description を人間承認訳へ locale 化。専用モデル content/seoMetadata.ts＋
 absolute title で日本語ブランド付加を防止。日本語 M01〜M06 は byte 一致・外国語 noindex 維持・canonical/hreflang/OG 非実装。
 全検証 green [lint 0 / tsc 0 / build 19 / node 77/77 / head 監査 失敗 0]。commit 前報告で停止。）
```
