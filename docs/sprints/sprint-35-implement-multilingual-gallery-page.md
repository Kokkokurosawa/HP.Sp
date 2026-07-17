# Sprint 35 — Implement Multilingual Gallery Page（Phase B）

各言語版ギャラリーページ（`/en/gallery` `/zh-hans/gallery` `/zh-hant/gallery` `/ko/gallery`）と、
外国語トップの Gallery プレビュー再表示を実装。外国語 Gallery は `noindex` 維持。

- 種別: Phase B（承認済み翻訳の実装・検証）。commit 前報告で停止。
- 判定: `MULTILINGUAL_GALLERY_PAGE_IMPLEMENTED`

---

## 1. Purpose

Sprint 27 の初回多言語対象範囲のうち **Gallery ページと Gallery 固有 UI（lightbox 含む）** を 5 locale
（ja / en / zh-hans / zh-hant / ko）へ移行し、外国語トップの Gallery プレビューを再表示する。
News・404・metadata・共通 UI・検索公開（外国語 index）は対象外。

## 2. Baseline

```text
branch = main / working tree = clean（実装前）
local HEAD = origin/main = remote = 4d46425a19707f1ec5c923a9d47eda2b08374259
latest commit = feat: implement multilingual profile page
```

## 3. Decision-of-record references

Sprint 27（初回方針・locale=5・R2 ルーティング・zh 簡繁分離）を decision of record とする。
Sprint 28–32（ルーティング基盤・辞書・共通 UI・言語切替）、Sprint 33（トップ）・34（プロフィール）を先例として踏襲。

## 4. Japanese Gallery inventory

正本 = `content/gallery.ts`（作品台帳）＋ 既存 Gallery ページ／コンポーネント。

- 公開作品 = **1 件** `supitaro-design-art-v1`（src `/images/supitaro/supitaro-design-art-v1.png`、
  title.ja「すぴたろう デザインアート」、alt「星や惑星に囲まれて立つ、…青い耳と尻尾。」）。
- ページ h1「ギャラリー」、リード「すぴたろうたちのイラストを…すこしずつ追加していきます。」
- カード可視ヒント「大きく見る」、カード aria「{名前}を大きく見る」、lightbox 閉じる「画像を閉じる」。
- トップ preview（HomeGallerySection ハードコード）: 見出し「デザインギャラリー」／リード「すぴたろうのデザインを、すこしだけ。」／CTA「ギャラリーを見る」。
- lightbox に前へ/次へ/位置表現は**存在しない**（単一画像）。GalleryEmptyState は公開 1 件のため**非描画の死枝**。

抽出文字列 = 10（詳細は sprint-35-gallery-page-translation-review.md §4）。

## 5. Translation review process

Phase A で `sprint-35-gallery-page-translation-review.md`（25 セクション）を作成 → 人間確認 → 4 外国語 APPROVE ＋
D-A〜D-G 決定。AI 初稿 → 人間承認の二段階（Sprint 33・34 と同一）。

## 6. Human approvals

```text
EN / ZH-HANS / ZH-HANT / KO : すべて APPROVE（§11–14 草案どおり）
D-A=(b)翻訳 / D-B=承認 / D-C=承認 / D-D=Option B / D-E=再表示する / D-F=承認 / D-G=retain
```

## 7. Work-title decisions（D-A=(b)）

作品 title を各言語へ翻訳・キャラ名は `Supitaro` 統一。
`Supitaro Design Art` / `Supitaro 设计原画` / `Supitaro 設計原畫` / `Supitaro 디자인 아트`。

## 8. Proper-noun decisions

`すぴたろう→Supitaro`（全 locale 維持・Sprint 33/34 と一致）。「デザインアート」は一般語＝翻訳。
「すぴたろうたち」は複数表現を維持（en: and friends / zh: 们・們 / ko: 들）。単数へ縮めない（D-F）。

## 9. Image-alt decisions（D-C）

ja alt に忠実。**尻尾の本数・見えない設定を追加しない**（ja gallery alt は本数記載なし。profile alt「2 本」とは別画像）。
ja alt は不変（観察のみ・修正しない）。各言語で被写体（星・惑星に囲まれて立つ Supitaro）と外見を説明。

## 10. Gallery content model（D-D=Option B）

新規 `content/galleryContent.ts`:

- `GalleryStrings`（locale 別 UI: pageTitle / lead / viewLarger / closeLabel / preview{heading,lead,cta}）。
- `GalleryView`（表示用解決済み: id / src / alt / title? / openLabel）。
- 作品別翻訳マップ `itemText`（外国語の title/alt を id で保持）。ja は含めず `content/gallery.ts` を参照。
- `openLabelTemplate`（locale 別 aria テンプレート。ja は既存 `{名前}を大きく見る` と一致）。
- `getGalleryContent(locale)`: 台帳（id/src）× locale テキスト（title/alt/openLabel）を Server で統合。
  未知 locale なし・**日本語黙示 fallback なし**・翻訳欠落は build 時 throw（静的生成で検出）・runtime fetch なし。

`content/gallery.ts` は**変更なし**（画像 src・id・順序・title.ja・alt の唯一の定義元＝二重定義しない）。
Client へは解決済み文字列のみ渡す（§22）。禁止事項（locale 配列複製・src 5 重複・巨大 switch・any・optional 翻訳キー）はすべて回避。

## 11–14. 各言語実装

`content/galleryContent.ts` の `strings`／`itemText`／`openLabelTemplate` に格納。

- **EN**: Gallery / View larger / Close image / Design Gallery / View the gallery / title `Supitaro Design Art`。
- **ZH-HANS**（简体）: 画廊 / 放大查看 / 关闭图片 / 设计画廊 / 查看画廊 / title `Supitaro 设计原画`。
- **ZH-HANT**（繁体）: 畫廊 / 放大檢視 / 關閉圖片 / 設計畫廊 / 查看畫廊 / title `Supitaro 設計原畫`。
- **KO**: 갤러리 / 크게 보기 / 이미지 닫기 / 디자인 갤러리 / 갤러리 보기 / title `Supitaro 디자인 아트`。

alt/リード全文は galleryContent.ts 参照。簡繁は用字独立（テストでクロスコンタミ検査）。

## 15. Gallery-card implementation

- `GalleryCard`: 型を `GalleryItem` → `GalleryView` へ。`item.title?.ja`／`item.image.*`／ハードコード「大きく見る」を
  解決済み `item.title`／`item.src`／`item.alt`／`item.openLabel`／`viewLarger` prop へ置換。No-JS の figure 構造・
  進行的強化（button は JS 時のみ）・variant "default"/"compact"・クラス・画像寸法（800）は不変。
- `GalleryGrid`: `items: readonly GalleryView[]` ＋ `viewLarger`/`closeLabel` prop。GalleryCard/Lightbox へ受け渡し。

## 16. Lightbox implementation

- `GalleryLightbox`: 型を `GalleryView` へ。`hasTitle=Boolean(item.title)`、`aria-label`（無題時）=`item.alt`、
  閉じる aria-label ＋ sr-only を `closeLabel` prop へ、title 表示を `item.title` へ。
  dialog / aria-modal / focus trap / focus return / Escape / scroll lock / reduced-motion / 画像寸法（1000）は不変。

## 17. Scaffold removal（D-G=retain）

`LocaleScaffold.tsx` は Gallery 置換で**未使用コンポーネント化**するが、辞書 `localeScaffold` セクション・
`LocaleScaffoldDictionary` 型（schema.ts/index.ts）・dictionary.test の検証が残存参照するため、**本 Sprint では削除しない**。
未使用整理は i18n 辞書全体を含む専用 Sprint へ分離（削除する場合は参照 0・build 成功・全 route 回帰の証明が必要）。

## 18. Top-page Gallery-preview restoration（D-E）

- `app/[locale]/page.tsx`: `getPublishedGalleryItems`（ja 限定）→ `getGalleryContent(locale)`（全 locale）へ。
  preview を全 locale で描画。見出し/リード/CTA/`galleryHref`（`localizedPath(locale,"gallery")`）/viewLarger/closeLabel を props で渡す。
- `HomeGallerySection`: `GalleryView[]` ＋ heading/lead/cta/galleryHref/viewLarger/closeLabel prop 化。ハードコード日本語と `/gallery` を撤去。
- News は引き続き日本語のみ（D-C）。Hero 直下の位置・順序・画像数・カード比率・アニメーションは不変。

## 19. noindex policy

外国語 Gallery は正式翻訳後も `robots {index:false, follow:false}` 維持（404 多言語化未完・metadata 未翻訳・
canonical/hreflang 未実装・sitemap 未整備・独自ドメイン未確定）。解除は別 Sprint。ja は既定挙動（indexable）。

## 20. Japanese regression

- ja `/gallery`: h1・リード・作品 title・alt・画像・「大きく見る」・lightbox・「画像を閉じる」・No-JS figure・URL 不変。
- ja トップ preview: 見出し・リード・CTA・href `/gallery`・カード表示不変。
- node テストで ja 本文の byte 一致・title/alt/src が `content/gallery.ts` 参照であることを保証。ブラウザ監査でも確認。

## 21. Server and Client Component boundary

翻訳解決は Server（`getGalleryContent`）。Client（GalleryCard/Grid/Lightbox/HomeGallerySection）へは
**解決済み plain string と表示用 item のみ**渡す。locale 判定・辞書・locale map を Client へ渡さない。

## 22. No-JS behavior

外国語 Gallery でも No-JS で h1・リード・作品画像・title・alt が読める（figure 構造・button 0）。
ブラウザ監査（javaScriptEnabled:false）で 5 locale すべて figure＋figcaption＋image・button 0・横スクロール 0 を確認。

## 23. Accessibility

- カード button: `aria-haspopup="dialog"` ＋ locale 別 openLabel。
- lightbox: role=dialog / aria-modal / aria-labelledby(title) or aria-label(alt) / focus trap / focus return / Escape / scroll lock。
- close: locale 別 aria-label ＋ sr-only。
- No-JS では操作要素を出さない（Tab 停止なし）。

## 24. Tests

新規 `content/galleryContent.test.ts`（node:test・9 件）:
5 locale 存在／UI 構造／作品同数・同 id・同順序／src locale 一致／全作品 title・alt・openLabel／
ja 正本一致（gallery.ts 参照・byte 一致）／黙示 fallback なし（Supitaro 維持）／簡繁独立（クロスコンタミ）／承認主要文言。
既存テスト（profileContent 8・topPage 7・dictionary 18・locales 9・routes 9）は回帰なし。

## 25. Validation results

```text
npm run lint       → 0 problems
npx tsc --noEmit   → exit 0
npm run build      → 19 static pages（/[locale]/gallery = 5 locale すべて SSG。翻訳欠落の throw なし）
node tests         → gallery 9/9・profile 8/8・topPage 7/7・dictionary 18/18・locales 9/9・routes 9/9 = 60/60
```

## 26. Browser audit

ローカル production（`next start`）で playwright-core 監査。**失敗 0**。

- HTTP マトリクス（17 URL）: ja=indexable・外国語=noindex・localized h1・`/en/news`/`/zh/gallery`/`/fr/gallery`/`/no-such-page`=404（日本語カスタム 404・英語既定なし）。
- 5 Gallery（JS）: h1・figcaption title・localized alt・card openLabel・hint・lightbox open・close aria・lightbox title・Escape・focus return・console 0・failed 0・横スクロール 0（320/375/768/1024/1440）。
- 5 Gallery（No-JS）: h1・figcaption・image・button 0・横スクロール 0。
- 5 トップ preview: heading・card 1・localized CTA href ＋ text・console 0。
- 回帰: /profile・/en/profile・/news = 200・h1・エラー 0。
- 簡繁の混在なし（テスト＋実表示で確認）。

## 27. Changed files

```text
新規:
  content/galleryContent.ts
  content/galleryContent.test.ts
  docs/sprints/sprint-35-gallery-page-translation-review.md
  docs/sprints/sprint-35-implement-multilingual-gallery-page.md
変更:
  app/[locale]/gallery/page.tsx
  app/[locale]/page.tsx
  components/gallery/GalleryCard.tsx
  components/gallery/GalleryGrid.tsx
  components/gallery/GalleryLightbox.tsx
  components/home/HomeGallerySection.tsx
不変（重要）:
  content/gallery.ts（作品台帳＝ja 正本・Option B で参照のみ）
  components/i18n/LocaleScaffold.tsx（D-G=retain）
  content/i18n/**・next.config.*・package.json・lockfile・content/topPage.ts・content/profile*.ts
```

## 28. Risks

- 台帳（gallery.ts）に作品を追加した際、各外国語 `itemText` へ翻訳追加を忘れると build が throw（＝検出はされるが、追加作業が必要）。想定挙動（黙示 fallback 回避）。
- `LocaleScaffold` 未使用コンポーネントの残置（D-G）。lint/build には影響しない。
- 外国語 title/alt は現状 1 作品のみ実地検証。作品増時は同方式で拡張。

## 29. Deferred work

- LocaleScaffold ＋ localeScaffold 辞書の未使用整理（専用 Sprint）。
- 外国語の metadata・canonical・hreflang・sitemap・404 多言語化・noindex 解除（別 Sprint）。

## 30. Recommended next Sprint

- Sprint 36 候補: 外国語 metadata / 404 多言語化、または未使用 scaffold 整理。noindex 解除は多言語 SEO 基盤（canonical/hreflang/sitemap）確立後に判断。

## 31. Final verdict

```text
MULTILINGUAL_GALLERY_PAGE_IMPLEMENTED
（実装・検証すべて完了。commit 前報告で停止。ユーザーの明示承認まで commit / push / Redeploy を行わない。）
```
