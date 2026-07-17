# Sprint 37 — Implement Approved Shared-UI Translations（Phase B）

Sprint 30〜32 で AI 初稿として導入した外国語共通 UI 文言を人間確認済みの正式翻訳へ確定し、
`common.gallery` の zh を Gallery ページ見出しと統一した。

- 種別: Phase B（承認済み校正の反映・検証）。commit 前報告で停止。
- 判定: `SHARED_UI_TRANSLATIONS_HUMAN_APPROVED_AND_IMPLEMENTED`

---

## 1. Purpose

外国語共通 UI 辞書（common/navigation/language/accessibility）を人間確認により正式化し、`common.gallery` の
zh-hans/zh-hant を Sprint 35 承認の Gallery ページ見出しと統一する。ページ本文・metadata・SEO・デザイン・
ルーティング・外部リンク補助文言・FOLLOW は変更しない。

## 2. Baseline

```text
branch = main / working tree = clean（実装前）
local HEAD = origin/main = remote = 4e5c3f80cd9036e0b5e5eacde1140bfdf67df1d5
latest commit = refactor: remove unused locale scaffold
```

## 3. Translation-review process

Phase A で `sprint-37-shared-ui-translation-review.md`（23 セクション・U01-U23）を作成 → 人間確認 →
4 外国語 APPROVE ＋ D-COMMON〜D-PARTIAL 決定。Sprint 33〜35 と同じ二段階フロー。

## 4. Human approvals

```text
EN / ZH-HANS / ZH-HANT / KO : すべて APPROVE
D-COMMON=KEEP 承認 / D-GAL=画廊・畫廊 へ統一 / D-LANG=KEEP / D-FOOTER=KEEP /
D-CLOSE=別のまま KEEP / D-EXT=(A) 専用 Sprint へ分離 / D-PARTIAL=承認分のみ反映
```

## 5. Dictionary responsibility

共通 UI 辞書の責務（Sprint 36 で確定）は不変: common / navigation / language / accessibility。
本文コンテンツは `content/{topPage,profileContent,galleryContent}.ts`。**新規辞書キーは追加しない**
（D-EXT の外部リンク/FOLLOW キーは独立 Sprint で扱う＝§17「将来用キー大量追加」禁止・未使用キー回避）。

## 6. Navigation revisions

- **common.gallery（D-GAL）**: zh-hans `图库`→`画廊`、zh-hant `圖庫`→`畫廊`。Sprint 35 で人間承認済みの
  Gallery ページ見出し（galleryContent.pageTitle）と統一。**nav 項目名 = ページ h1** が全 locale で一致
  （ja=ギャラリー / en=Gallery / zh-hans=画廊 / zh-hant=畫廊 / ko=갤러리）。
- 他の common/navigation 値（home/profile/news・main/mobile/footer/language 各 aria）は現行案を正式承認（KEEP）。
- common.news の外国語値は外国語 nav が news を除外するため非表示（KEEP・実害なし）。

## 7. Accessibility revisions

- skipToContent / openMenu / closeMenu の 4 外国語値は現行案を正式承認（KEEP）。変更なし。

## 8. Language-switcher revisions

- navigation.languageSwitcherLabel（Languages/语言/語言/언어）: KEEP（D-LANG）。
- language.name（5 自称表記）: Sprint 36 で byte 固定・**変更なし**。

## 9. Profile-specific revisions

- profileContent.ts の UI 値（moreLabel/closeLabel/heading 等）は Sprint 34 承認済み。**変更なし**（KEEP）。
- Profile「閉じる」（Close/关闭/關閉/닫기）は Gallery「画像を閉じる」と別責務のまま維持（D-CLOSE）。

## 10. Gallery-specific revisions

- galleryContent.ts の UI 値（viewLarger/closeLabel/pageTitle/openLabel）は Sprint 35 承認済み。**変更なし**（KEEP）。
- Gallery「画像を閉じる」（Close image/关闭图片/關閉圖片/이미지 닫기）は Profile「閉じる」と別責務のまま維持（D-CLOSE）。

## 11. External-link revisions

- 外部リンク補助文言 `(外部リンク・新しいタブで開きます)`（Button/ContentCard/ChannelLinks/SocialFollowLinks に
  日本語ハードコード）は **本 Sprint では変更しない**（D-EXT=(A)）。完全 locale 化には許可外ファイル
  `app/[locale]/page.tsx`・`Button.tsx`・`ContentCard.tsx`・`Hero.tsx` が必要なため独立 Sprint へ分離。

## 12. FOLLOW revisions

- FOLLOW SNS aria-label（YouTubeで配信を見る…等）・`FOLLOW` 見出しは **本 Sprint では変更しない**（D-EXT=(A)）。
  §11 と同じ許可外制約により独立 Sprint へ分離。ブランド名（YouTube/X/Twitch/FOLLOW）は翻訳しない。

## 13. Unchanged Japanese source

日本語辞書（`content/i18n/ja.ts`）・日本語正本（U01-U23）は**一切変更していない**（値・コメントとも不変）。

## 14. Server and Client boundary

辞書は Server（getDictionary）で解決し、既存の配線（SiteShell→Header/MobileMenu/Footer/LanguageSwitcher）を
そのまま使用。**コンポーネントは一切変更していない**（値のみ更新）。Client 境界は不変。

## 15. No-JS behavior

zh-hans/zh-hant の Footer nav gallery 項目が No-JS でも `画廊/畫廊` を表示（旧 `图库/圖庫` 非残存）を
ブラウザ監査（javaScriptEnabled:false）で確認。共通 UI 翻訳は Server 描画で Client JS に依存しない。

## 16. Accessibility audit

- skip リンク（Skip to content）・Mobile メニュー（aria-expanded・Gallery 項目）・LanguageSwitcher（5 endonym・
  aria-current）を確認。nav landmark（main/mobile/footer/language）の 4 領域名は相互に区別可能（不変）。
- Profile dialog / Gallery lightbox は非変更（Sprint 34/35 のまま・回帰なし）。

## 17. Tests

`content/i18n/dictionary.test.ts` に Sprint 37 の検証を追加（19→**21 件**）:

- 承認済み外国語値（D-COMMON/D-GAL）: common.gallery zh=画廊/畫廊・en=Gallery・ko=갤러리、
  footerNavigationLabel/skipToContent/openMenu/closeMenu の代表値。
- **nav gallery 項目名 = Gallery ページ見出し**が全 locale で一致（D-GAL の nav↔page 整合を getGalleryContent と
  突き合わせて保証）。

既存テスト（gallery 9・profile 8・topPage 7・locales 9・routes 9）は回帰なし。

## 18. Validation results

```text
npm run lint       → 0 problems
npx tsc --noEmit   → exit 0
npm run build      → 19 static pages（全 locale SSG）
node tests         → dictionary 21/21・gallery 9/9・profile 8/8・topPage 7/7・locales 9/9・routes 9/9 = 63/63
```

## 19. Browser audit

ローカル production（`next start`）で playwright-core 監査。**失敗 0**。

- 5 トップ（/・/en・/zh-hans・/zh-hant/・/ko）: Header/Footer nav の gallery 項目が期待ラベル
  （ギャラリー/Gallery/画廊/畫廊/갤러리）、zh は旧 `图库/圖庫` 非残存、gallery ページ h1 == nav ラベル（整合）、
  言語切替 5 endonym 維持、console/failed 0、横スクロール 0（320-1440）。
- No-JS（/zh-hans・/zh-hant）: Footer nav gallery = 画廊/畫廊、旧語非残存。
- 回帰（/en モバイル）: skip リンク・mobile menu aria-expanded・Gallery 項目 OK。

## 20. Changed files

```text
変更:
  content/i18n/zh-hans.ts        （common.gallery 图库→画廊・コメント正式化）
  content/i18n/zh-hant.ts        （common.gallery 圖庫→畫廊・コメント正式化）
  content/i18n/en.ts             （コメント正式化のみ・値不変）
  content/i18n/ko.ts             （コメント正式化のみ・値不変）
  content/i18n/dictionary.test.ts（Sprint 37 承認値＋nav↔page 整合テスト追加）
新規:
  docs/sprints/sprint-37-shared-ui-translation-review.md        （Phase A）
  docs/sprints/sprint-37-implement-approved-shared-ui-translations.md（Phase B）
不変（重要）:
  content/i18n/ja.ts（日本語正本）・schema.ts・index.ts（新キーなし）・
  components/**（配線・コンポーネント不変）・content/{topPage,profileContent,galleryContent}.ts・
  config/site.ts・app/**・next.config.*・package.json・lockfile・public/**
```

## 21. Risks

- common.gallery zh の変更は nav 表示のみ（ページ URL・h1・レイアウト不変）。旧語 `图库/圖庫` は消滅。
- nav↔page 整合をテストで固定（将来 nav と page を意図的に分ける場合はテスト更新が必要）。
- 外部リンク補助文言・FOLLOW aria は日本語のまま残存（D-EXT で独立 Sprint へ分離＝既知・意図的）。

## 22. Deferred work

- **D-EXT**: 外部リンク補助文言（`accessibility.externalLink`＋`opensInNewTab` 等）と FOLLOW SNS aria の locale 化。
  許可ファイルに `app/[locale]/page.tsx`・`Button.tsx`・`ContentCard.tsx`・`Hero.tsx`・`SocialFollowLinks.tsx`・
  `ChannelLinks.tsx` を含む独立 Sprint で実施。
- 外国語 metadata・canonical・hreflang・sitemap・404 多言語化・noindex 解除（多言語 SEO 基盤 Sprint）。

## 23. Recommended next Sprint

- Sprint 38 候補: D-EXT の外部リンク補助文言・FOLLOW aria 正式翻訳（許可ファイル拡張・二段階フロー）。
  または多言語 SEO 基盤 → noindex 解除判断。

## 24. Final verdict

```text
SHARED_UI_TRANSLATIONS_HUMAN_APPROVED_AND_IMPLEMENTED
（共通 UI 辞書の外国語値を人間確認により正式化。common.gallery の zh を Gallery ページ見出しと統一。
 日本語正本・UI 構造・コンポーネント・ページ本文・外部リンク/FOLLOW・URL・metadata・noindex は不変。
 全検証 green。commit 前報告で停止。）
```
