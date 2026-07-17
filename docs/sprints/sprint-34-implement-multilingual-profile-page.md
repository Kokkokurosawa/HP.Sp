# Sprint 34 — Multilingual Profile Page Implementation (Phase B)

- Sprint: 34
- Phase: B（承認済み翻訳の実装・検証）
- Final verdict: `MULTILINGUAL_PROFILE_PAGE_IMPLEMENTED`
- Scope: プロフィールページ本文の 5 locale 化（単一関心事）。トップ/ギャラリー/News/404/metadata/Header/Footer は不変。

---

## 1. Purpose

Sprint 27 採用の初回多言語対象範囲のうち、プロフィールページを 5 locale（ja / en / zh-hans / zh-hant / ko）へ移行する。Sprint 33（トップページ）と同じ二段階フローで、Phase A の人間承認済み翻訳のみを実装した。日本語プロフィールは正本として一切変更せず、外国語は `noindex` を維持する。

---

## 2. Baseline

```text
branch = main / working tree = clean
local HEAD = origin/main = remote ref = 2931d515a95c68c2bf9b37ec356443ac1d3085b5
latest commit = feat: implement multilingual top page
```

---

## 3. Decision-of-record references

- Sprint 27（`sprint-27-decide-initial-multilingual-implementation-policy.md`）: locale=ja/en/zh-hans/zh-hant/ko、`<html lang>`、辞書 `content/i18n/*`、未訳非公開・日本語 fallback 禁止。
- Sprint 28-29: ルーティング基盤（ja 接頭辞なし・外国語 `/locale`・`dynamicParams=false`・LocaleScaffold）。
- Sprint 30-32: 型付き辞書・locale 別ナビ・言語切替・`SiteShell`。
- Sprint 33: トップページ 5 locale 化（`content/topPage.ts` の先例。ja 正本・`satisfies`・`getTopPage`）。
- 本 Sprint の Human decision: `sprint-34-profile-page-translation-review.md`（§17-§19、D-A〜D-F）。

---

## 4. Japanese source inventory

抽出は `sprint-34-profile-page-translation-review.md` §4 に記録（P01-P27）。要点:
- ページ h1「プロフィール」、profile 画像 alt、基本見出し＝キャラクター名、intro 3 行、「すぴたろうのこと」見出し/リード、トレイトカード 4 件（label/summary/detail）、「くわしく見る」、「すぴたろうの言葉」見出し/リード＋words 6 個、「くわしい設定」見出し＋準備中文、シート「閉じる」。
- ja の name/intro/traits/words/upcoming の定義元は `content/profile.ts`、画像 alt は `config/site.ts`。UI 見出し・リード・moreLabel・closeLabel はページ JSX / コンポーネントに直書きだったものを本 Sprint でコンテンツモデルへ集約（表示は不変）。

---

## 5. Translation review process

Phase A（`sprint-34-profile-page-translation-review.md`）で日本語原文抽出 → 4 外国語初稿 → 人間確認依頼 → 停止。人間から全 locale APPROVE と D-A〜D-F を受領し、レビュー文書の Human decision / Human approvals / Approval status（APPROVED）へ反映後、Phase B を実装。

---

## 6. Human approvals

```text
EN: APPROVE / ZH-HANS: APPROVE / ZH-HANT: APPROVE / KO: APPROVE
D-A: 全 6 語を日本語維持
D-B: 翻訳して維持
D-C: profile モデル内に保持
D-D: Option B
D-E: 简介 / 簡介
D-F: 全 4 外国語承認後に一括実装
```

文字列単位の REVISE / HOLD はなし。

---

## 7. Proper-noun decisions

- 名称「すぴたろう」→ **Supitaro**（全外国語。基本見出し・各セクションの Supitaro 表記）。
- 口癖 words 6 個（おぱぁ / アパ？ / いぱ / まぁっ！ / ハッピー / めーおー）は **全 locale で日本語維持**（D-A）。実装は `profile.words` を全 locale が参照（唯一の定義元）。
- 「宇宙」は各言語の一般語へ翻訳（固有天体名なし）。数値・単位は該当なし。

---

## 8. Profile content model

**D-D=Option B。** 新規 `content/profileContent.ts` に型付き 5 locale モデルを実装。

- `ProfilePageContent` 型（pageTitle / imageAlt / name / intro[] / traits{heading,lead,moreLabel,closeLabel,items[]} / words{heading,lead,items[]} / upcoming{heading,emptyNotice,items[]}）。
- **ja は二重定義を作らない**: `name/intro/traits/words/upcoming.items` は `content/profile.ts` の `profile` を参照、`imageAlt` は `siteConfig.images.profile.alt` を参照。ページ JSX 由来の UI 文言（pageTitle/traits.heading/lead/moreLabel/closeLabel/words.heading/lead/upcoming.heading/emptyNotice）のみを ja リテラルとして集約（表示不変）。
- 外国語（en/zhHans/zhHant/ko）は各 `satisfies ProfilePageContent`（欠落/余剰キーを build 時に型エラー化）。
- `const profiles: Record<Locale, ProfilePageContent>` ＋ `getProfile(locale)`。**日本語への黙示 fallback なし**（型で 5 locale 網羅・未知 locale は `Locale` 型で弾かれ dynamicParams=false で 404）。runtime fetch なし・Server 同期利用（静的生成維持）。
- トレイトは `content/profile.ts` の `ProfileTrait` 型を再利用（id/label/summary/detail）。id/順序は全 locale 不変（origin→creature→likes→streaming）。
- シート「閉じる」は `traits.closeLabel` としてモデル内に保持（D-C。共通 UI 辞書は非拡張）。

`content/profile.ts` は **無変更**（ja の唯一の source of truth のまま）。

---

## 9. English implementation

`content/profileContent.ts` の `en`（`satisfies`）。pageTitle=Profile、name=Supitaro、intro は Sprint 33 承認訳を再利用、traits 4 件、moreLabel=See more、closeLabel=Close、words=日本語維持、upcoming=More details / Coming soon…。詳細は review 文書 §9・§13。

---

## 10. Simplified Chinese implementation

`zhHans`（`satisfies`）。pageTitle=简介、关于 Supitaro、频道語彙不使用、非人称「它」、moreLabel=查看详情、closeLabel=关闭、upcoming=详细设定 / 正在准备中…。簡体字のみ（繁体字混入なし=テスト＋監査で確認）。詳細は review 文書 §10・§13。

---

## 11. Traditional Chinese implementation

`zhHant`（`satisfies`）。pageTitle=簡介、關於 Supitaro、非人称「牠」、屋主（Sprint 33 承認訳と整合）、moreLabel=查看詳情、closeLabel=關閉、upcoming=詳細設定 / 正在準備中…。繁体字のみ（簡体字混入なし）。詳細は review 文書 §11・§13。

---

## 12. Korean implementation

`ko`（`satisfies`）。해요体で統一（Sprint 33 と整合）。pageTitle=프로필、Supitaro에 대해、moreLabel=자세히 보기、closeLabel=닫기、upcoming=자세한 설정 / 준비 중이에요…。詳細は review 文書 §12・§13。

---

## 13. Trait-card implementation

- カード数 4・順序・id・アイコン・色・レイアウト・animation・開閉動作は **不変**。
- `ProfileTraitGrid`（Client）: props に `moreLabel` / `closeLabel` を追加し、`traits` を `readonly ProfileTrait[]` 化。moreLabel を各 `ProfileTraitCard` へ、closeLabel を `ProfileDetailSheet` へ受け渡す。
- `ProfileTraitCard`（Client）: props に `moreLabel: string` を追加。JS 有効時の操作ヒント「くわしく見る」を `{moreLabel}` に置換（進行的強化のロジック・SSR/No-JS 静的カードは不変）。
- No-JS では従来どおり詳細全文をインライン表示（button・aria-haspopup を出さない）。

---

## 14. Dialog and bottom-sheet implementation

- `ProfileDetailSheet`（Client, portal）: props に `closeLabel: string` を追加（ラッパ + `SheetInner` 両方へ）。sr-only「閉じる」を `{closeLabel}` に置換。
- タイトル（`aria-labelledby`）= trait.label、本文（`aria-describedby`）= trait.detail を再利用（locale 別に自動で翻訳済み）。
- focus trap / Escape / focus return / background scroll ロック / reduced-motion / デスクトップ中央ダイアログ・モバイルボトムシートの CSS 適応は **不変**（ブラウザ監査 B で確認）。

---

## 15. Scaffold removal

- `app/[locale]/profile/page.tsx` から `LocaleScaffold` の import と外国語分岐を撤去。全 locale を統一の `ProfileBody({ content })`（`getProfile(locale)`）で描画。
- `components/i18n/LocaleScaffold.tsx` は **削除しない**（Gallery 外国語ルートで継続利用）。ブラウザ監査 D で `/en/gallery`・`/zh-hant/gallery` が scaffold を保持し続けることを確認。

---

## 16. noindex policy

- 外国語プロフィール（/en, /zh-hans, /zh-hant, /ko の /profile）は `generateMetadata` で `robots: { index:false, follow:false }` を維持（Gallery 本文・言語別 metadata・canonical/hreflang 未実装のため。Sprint 34 §19）。
- ja は既定挙動（title「プロフィール」＋ description。metadata は翻訳対象外＝**変更なし**）。監査 A で foreign=noindex / ja=none を確認。

---

## 17. Japanese regression

- `content/profile.ts` 無変更。ja の name/intro/traits/words/upcoming は同ファイル参照、imageAlt は siteConfig 参照 → **byte 一致を参照で保証**。
- 自動テスト（`content/profileContent.test.ts`）の回帰ガードで ja の全 UI 文言 byte 一致を検証。
- ブラウザ監査で ja `/profile` の h1・intro・4 カード・順序・dialog/bottom sheet・No-JS・画像・Header/Footer・言語切替・レスポンシブが従来どおりであることを確認（横スクロール 0・console 0・hydration 0）。

---

## 18. Server and Client Component boundary

- 翻訳解決は Server（`getProfile(locale)` を `ProfilePage` / `ProfileBody` が同期呼び出し）。
- Client（`ProfileTraitGrid` / `ProfileTraitCard` / `ProfileDetailSheet`）へは **表示に必要な文字列のみ**（trait 配列・moreLabel・closeLabel）を props で渡す。辞書やプロフィール全体・locale 判定は Client へ渡さない。
- 静的生成を維持（build で 19 static pages、profile 5 locale すべて SSG）。

---

## 19. No-JS behavior

- 進行的強化を維持。No-JS でも h1・基本紹介（intro）・トレイトカード 4 件の概要＋詳細全文・くわしい設定（準備中文）・言葉・画像が読める。
- 監査 C（javaScriptEnabled=false, 390px）で en/ko/ja とも: h1=pageTitle、4 label、intro、詳細インライン（moreLabel 非表示）、main 内 button=0（静的カード）、画像 alt 一致、scaffold なし、横スクロール 0。外国語でも同じ情報量を確保。

---

## 20. Accessibility

- dialog: `role=dialog` / `aria-modal=true` / `aria-labelledby`（label）/ `aria-describedby`（detail）。閉じる sr-only=locale 別 closeLabel。
- Escape で閉じ、focus は起点カードへ返る（監査 B で ja/en 確認）。
- skip リンク・Header/Footer の aria は共通 UI 辞書（Sprint 31）で locale 対応済み（本 Sprint 変更なし）。

---

## 21. Tests

新規 `content/profileContent.test.ts`（node:test + node:assert、追加依存なし。Sprint 30-33 と同じ tsc→CJS コンパイル方式で実行）。8 テスト:
1. 5 locale 存在
2. 同一構造（必須フィールド・型・traits 4・words 6）
3. トレイト 4 件・同一 id・同一順序
4. words 6 個は全 locale で日本語維持（`profile.words` と deepEqual）
5. 日本語 source of truth 一致（profile.ts / siteConfig 参照＋移設 UI 文言の byte 一致）
6. 外国語は日本語へ黙示 fallback しない（name=Supitaro・見出し/タイトルが ja と異なる）
7. 簡体字/繁体字は別本文・用字独立（クロスコンタミ 0）
8. 外国語主要文言（承認済み）

`content/topPage.test.ts`（Sprint 33）は回帰確認で 7/7 pass。

---

## 22. Validation results

```text
npm run lint      : PASS（0 problems）
npx tsc --noEmit  : PASS（exit 0）
npm run build     : PASS（19 static pages。/[locale]/profile = ja/en/zh-hans/zh-hant/ko すべて SSG prerender）
node:test         : profileContent 8/8 pass、topPage 7/7 pass（回帰なし）
git diff --check  : clean
```

---

## 23. Browser audit

ローカル production（`next start` :3044）、playwright-core + キャッシュ Chromium。**総合 failures=0**。

- A. Profile 5 locale（JS-on, 1280）: status 200 / lang（ja,en,zh-Hans,zh-Hant,ko）/ h1=pageTitle / intro / 4 label / セクション文言 / 画像 alt 一致 / trait button 4 / noindex（foreign）・none（ja）/ scaffold 消失 / 簡繁用字純度 / console 0 / hydration 0 / failed 0 / 横スクロール 0。
- B. dialog/bottom sheet（ja, en）: dialog=aria-modal / title=label / desc あり / close accessible name=closeLabel / Escape で閉じる / focus 返却。
- C. No-JS（390, en/ko/ja）: h1・4 label・intro・詳細インライン・button 0・画像 alt・scaffold なし・横スクロール 0。
- D. 回帰: `/en/gallery`・`/zh-hant/gallery`=scaffold 保持 / `/gallery`・`/`・`/news`=ja 実本文 / `/en`=noindex / `/no-such-page`=404・日本語カスタム。
- E. レスポンシブ横スクロール: 320/375/768/1024/1440 すべて 0px。

---

## 24. Changed files

| ファイル | 種別 | 内容 |
| --- | --- | --- |
| `content/profileContent.ts` | 新規 | 5 locale プロフィール本文モデル（Option B・getProfile） |
| `content/profileContent.test.ts` | 新規 | 内容モデル検証 8 テスト |
| `app/[locale]/profile/page.tsx` | 変更 | LocaleScaffold 撤去・統一 ProfileBody（getProfile）・content 駆動描画 |
| `components/profile/ProfileTraitGrid.tsx` | 変更 | moreLabel/closeLabel props 追加・traits を readonly 化・受け渡し |
| `components/profile/ProfileTraitCard.tsx` | 変更 | moreLabel prop 追加・「くわしく見る」を差し替え |
| `components/profile/ProfileDetailSheet.tsx` | 変更 | closeLabel prop 追加・sr-only「閉じる」を差し替え |
| `docs/sprints/sprint-34-profile-page-translation-review.md` | 新規 | Phase A レビュー＋承認反映 |
| `docs/sprints/sprint-34-implement-multilingual-profile-page.md` | 新規 | 本報告 |

`content/profile.ts` / `config/site.ts` / `next.config.*` / `package.json` / lockfile / `app/[locale]/page.tsx` / gallery / news / 404 / LocaleScaffold は **無変更**。

---

## 25. Risks

- No-JS の外国語カードは詳細全文をインライン表示するため縦に長い（設計どおり・横スクロール 0 は確認済み）。
- 画像プレースホルダー分岐（src 空時の「画像準備中」）は日本語のままだが、profile 画像 src 設定済みで **描画されない dead branch**（全 locale で未出力）。将来 src を空運用する場合は要 locale 対応。
- 外国語 `upcoming.items` は空配列（ja が将来 upcoming を追加した場合、外国語は準備中文表示のまま＝翻訳 fallback ではなく「未追加」の明示）。lore 追加時は別 Sprint で翻訳。
- 実配信（Vercel Stage A）は本コミット後の自動デプロイに依存（手動 Redeploy なし）。実配信監査は後続で実施可能。

---

## 26. Deferred work

- Gallery 本文の 5 locale 化（LocaleScaffold 置換の次対象）。
- 404・metadata（title/description）・OG の多言語化、canonical/hreflang/sitemap/robots、外国語 noindex 解除の判断。
- 共通 UI（FOLLOW aria 等）校正 Sprint。
- 画像内文言・プレースホルダー分岐の locale 対応（必要時）。

---

## 27. Recommended next Sprint

Sprint 35 — 各言語版ギャラリーページの正式翻訳・人間確認（本 Sprint と同じ二段階フロー。`LocaleScaffold` を Gallery 実本文へ置換。`content/gallery.ts` の locale 対応と GalleryCard/Lightbox の翻訳 props）。

---

## 28. Final verdict

```text
MULTILINGUAL_PROFILE_PAGE_IMPLEMENTED
```

4 外国語すべて人間承認済み翻訳で実装完了。日本語プロフィール完全回帰維持、外国語 `noindex` 維持、全 10+ 検証（lint/tsc/build/node:test/ブラウザ・No-JS 監査）green、依存追加なし。commit 前報告で停止し、ユーザーの明示承認を待つ。
